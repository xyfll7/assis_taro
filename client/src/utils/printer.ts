import { Font, Rotation } from '@psdk/cpcl/build/types';
import { CPageMode } from '@psdk/cpcl/build/args/pagemode';
import { CLocation } from '@psdk/cpcl/build/types/location';
import { CPrint } from '@psdk/cpcl/build/args/print';
import { Mode } from '@psdk/cpcl/build/types/mode';
import { CPCL } from '@psdk/cpcl';
import { CPage } from '@psdk/cpcl/build/args/page';
import { CText } from '@psdk/cpcl/build/args/text';
import { TaroBleConnectedDevice } from '@psdk/device-ble-taro';
import { Lifecycle, WriteOptions } from '@psdk/frame-father';
import Taro from '@tarojs/taro';


//#region 链接蓝牙并获取蓝牙设备、服务、特征信息
export async function printer_BleConnect(device: Taro.onBluetoothDeviceFound.CallbackResultBlueToothDevice): Promise<BleConnectedOptions | null> {
  return new Promise((resolve, reject) => {
    Taro.createBLEConnection({
      deviceId: device.deviceId,
      success: () => {
        Taro.stopBluetoothDevicesDiscovery({
          success: () => { }
        });
        resolve(___getBLEDeviceServices(device));
      },
      fail: (res) => {
        reject(res);
      }
    });
  });
}
// 获取蓝牙服务 及特征信息
async function ___getBLEDeviceServices(device: Taro.onBluetoothDeviceFound.CallbackResultBlueToothDevice): Promise<BleConnectedOptions | null> {
  // 根据设备id获取设备服务
  const res0 = await Taro.getBLEDeviceServices({ deviceId: device.deviceId });
  let service = res0.services.reduce((obj, item) => item.uuid.toUpperCase().includes("49535343-FE7D-4AE5-8FA9-9FAFD205E455") ? item : obj, null as (Taro.getBLEDeviceServices.BLEService | null));
  // 根据设备id和服务id获取 服务特征值
  const res1 = await Taro.getBLEDeviceCharacteristics({ deviceId: device.deviceId, serviceId: service!.uuid });
  let characteristic = res1.characteristics.reduce((obj, item) => item.uuid.toUpperCase().includes("49535343-ACA3-481C-91EC-D85E28A60318") ? item : obj, null as (Taro.getBLEDeviceCharacteristics.BLECharacteristic | null));
  return (service && characteristic) ? {
    device,
    service,
    characteristic,
  } : null;
}
//#endregion

//#region 打印小票
export async function printer_PrintReceipt({ device, service, characteristic }: BleConnectedOptions) {
  const _device = new TaroBleConnectedDevice({
    device: { ...device },
    scpair: {
      service: service,
      write: characteristic,
    }
  });
  const lifecycle = new Lifecycle(_device);
  const cpcl = CPCL.generic(lifecycle);

  await cpcl.page(new CPage({ width: 650, height: 100 }))

    .pageMode(new CPageMode({ location: CLocation.SKIP }))
    // .bar(new CBar({x: 30,y: 50,lineWidth:21223556789,height:50, content:20,codeType: CodeType.CODABAR, codeRotation:"B" as any}))  // cSpell: ignore CODABAR
    .text(new CText({ content: '你哈哈哈哈哈额呵呵IIII', x: 30, font: Font.TSS32_MAX2, rotation: Rotation.ROTATION_270 }))
    .print(new CPrint({ mode: Mode.HORIZONTAL }))
    .write(WriteOptions.def());
}
//#endregion

