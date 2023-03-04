import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { utils_uniqByKey } from '../utils/utils';
import { printer_BleConnect, printer_PrintReceipt } from '../utils/printer';
import ComAAPage from "../components/ComAAPage";
import { useHook_selfInfo_show } from '../utils/useHooks';

const ___MY_PRINTER = "___MY_PRINTER";
definePageConfig({
  navigationBarTitleText: "打印机管理",
  disableScroll: true,
  navigationStyle: "custom",
});
const Index_regiment_printer = () => {
  const [selfInfo_S] = useHook_selfInfo_show({});
  // 检查已链接过的打印机
  // 搜索打印机
  // 选择打印机
  // 保存打印机
  // 离开页面时取消搜索蓝牙
  const [myPrinter, setMyPrinter] = useState<Taro.onBluetoothDeviceFound.CallbackResultBlueToothDevice | null>(null);
  const [devices, setDevices] = useState<Taro.onBluetoothDeviceFound.CallbackResultBlueToothDevice[] | null>(null);
  useEffect(() => {
    setMyPrinter(Taro.getStorageSync<Taro.onBluetoothDeviceFound.CallbackResultBlueToothDevice | null>("___MY_PRINTER"));
    setDevices([]);
    ___searchPrinter((device) => {
      setDevices((oldArr) => utils_uniqByKey([...(oldArr ?? []), ...device], "deviceId"));
    });
    return () => {
      Taro.stopBluetoothDevicesDiscovery({
        success: () => {

        },
        fail: () => { }
      });
      Taro.closeBluetoothAdapter({
        success: () => {

        },
        fail: () => { }
      });
    };
  }, []);
  return (
    <ComAAPage selfInfo_S={selfInfo_S}>
      <>
        {devices?.map(e =>
          <View className='p10 o10 bccwhite mt10' key={e.deviceId}>
            <View className='dbtc'>
              <View>{e.name || e.localName}</View>
              <View>
                {(myPrinter?.deviceId == e.deviceId) ? <View className='dy'> <View className='fs06 cccplh  mr4'>✔️</View> 已选 </View> :
                  <View onClick={async () => {
                    setMyPrinter(e);
                    Taro.setStorageSync(___MY_PRINTER, e);
                  }}>选这个</View>
                }
              </View>
            </View>
            <View className='fs08 cccplh'>信号强度: {e.RSSI}dBm ({Math.max(0, e.RSSI + 100)}%)</View>
          </View>)
        }
      </>
      <View className='dxy cccplh fs08 mt10'>
        <View className='weui-loading-small mr2'></View>
        搜索蓝牙设备
      </View>
      <View className='dxy'>
        <View className='mt10 p10 pbt6  oo' hoverClass='bccbacktab'
          onClick={async () => {
            const my_printer = Taro.getStorageSync<Taro.onBluetoothDeviceFound.CallbackResultBlueToothDevice>(___MY_PRINTER);
            const res = await printer_BleConnect(my_printer);
            printer_PrintReceipt(res!);
          }}>打印测试</View>
      </View>
    </ComAAPage>);
};
export default Index_regiment_printer;

// 搜索蓝牙设备
function ___searchPrinter(searchedPrinters: (device: Taro.onBluetoothDeviceFound.CallbackResultBlueToothDevice[]) => void) {
  Taro.openBluetoothAdapter({
    success: function () {
      Taro.startBluetoothDevicesDiscovery({
        allowDuplicatesKey: false,
        success: function () {
          Taro.onBluetoothDeviceFound(function (res) {
            res.devices.forEach(e => {
              if (!e.name && !e.localName) {
                return;
              } else {
                searchedPrinters(res.devices);
              }
            });

          });
        }
      });
    },
    fail: function () {
      Taro.showToast({
        title: "请检查蓝牙是否已经打开"
      });
    }
  });
}







