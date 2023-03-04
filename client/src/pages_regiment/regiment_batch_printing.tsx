import AddressParse from "address-parse";
import { View, Navigator } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import { FC, useEffect, useState } from 'react';
import { useHook_selfInfo_show } from '../utils/useHooks';
import { utils_import_excle } from '../utils/utils';
import { Api_printer_printExpress_excle } from '../api/a__printer';
import ComNav from "../components/ComNav";
import ComNavBar from "../components/ComNavBar";
import ComAAPage from "../components/ComAAPage";

definePageConfig({ navigationStyle: "custom", disableScroll: true, });

const data = JSON.parse('[{"name":"张三","tel":15840628673,"mobile":15840628673,"company":"","post_code":"","code":"610103","country":"中国","province":"陕西省","city":"西安市","area":"碑林区","address":"太乙嘉园B座1206","from":"CP"},{"name":"王五","tel":15901974092,"mobile":15901974092,"company":"","post_code":"","code":"610602","country":"中国","province":"陕西省","city":"延安市","area":"宝塔区","address":"嘉丰上城3号楼1单元402","from":"CP"},{"name":"老六子","tel":17709205210,"mobile":17709205210,"company":"","post_code":"","code":"310114","country":"中国","province":"上海","city":"上海市","area":"嘉定区","address":"荣轩路60弄君悦华庭4号202","from":"CP"}]');

const Index_regiment_batch_printing = () => {
  const [selfInfo_S] = useHook_selfInfo_show({});
  const [sendMan, setSendMan] = useState<AddressInfo | null>(null);
  const [expressList, setExpressList] = useState<Product_Express[] | null>([...data, ...data, ...data, ...data]);
  useEffect(() => selfInfo_S?.address_info && setSendMan({ ...selfInfo_S.address_info }), [selfInfo_S]);
  function onGoToAddressList() {
    Taro.navigateTo({
      url: `/pages_user/user_address_list`,
      events: {
        onSetAddressEvent(e: { addressInfo: AddressInfo; }) {
          setSendMan(e.addressInfo);
        },
      },
    });
  }
  return (
    <ComAAPage selfInfo_S={selfInfo_S}>
      <ComNav className='bccback' isHeight isSticky>
        <ComNavBar className='prl10' title='批量打单'></ComNavBar>
      </ComNav>
      <View className='mt10 '>
        <View className='prl10 mrl10 pbt10 cccplh'>在微信聊天记录中选择EXCEL文档上传</View>
        {/* 寄件人信息 */}
        <ExpressSendMan
          onGoToAddressList={onGoToAddressList}
          sendMan={sendMan}
          setSendMan={setSendMan}></ExpressSendMan>
        {expressList == null ? <DocumentDescription></DocumentDescription> :
          <ExpressAddressList expressList={expressList}></ExpressAddressList>
        }
      </View>
      <View className='fixed-bottom safe-bottom www100 dxy pbt10 bccwhite'>
        {expressList == null ?
          <View className='pbt6 prl10 oo bccyellow' hoverClass='bccyellowtab'
            onClick={async () => {
              const excelStr = await utils_import_excle();
              Taro.showLoading({ title: "正在解析...", mask: true });
              const sheet = await Api_printer_printExpress_excle(excelStr);
              const _addressList = sheet.map<Product_Express>(e => {
                const [res] = AddressParse.parse(e[2], true);
                return {
                  ...___init_product_express,
                  recMan: {
                    name: e[0],
                    mobile: e[1],
                    company: "",
                    post_code: "",
                    code: res?.code ?? "",
                    country: "中国",
                    province: res?.province ?? "",
                    city: res?.city ?? "",
                    area: res?.area ?? "",
                    address: res?.details ?? "",
                    from: "CP",  // 微信 ｜ 粘贴
                  }
                };


              });
              setExpressList(_addressList);
              Taro.hideLoading();
            }}>导入文档</View> :
          <View className='dy '>
            <View className='pbt6 prl10 oo bccback mr10' hoverClass='bccybacktab'
              onClick={async () => { setExpressList(null); }}>取消</View>
            <View className='pbt6 prl10 oo bccyellow' hoverClass='bccyellowtab'
              onClick={async () => {

              }}>确认无误，导入订单</View>
          </View>
        }

      </View>
    </ComAAPage>
  );
};
export default Index_regiment_batch_printing;

//#region 寄件人 地址薄
const ExpressSendMan: FC<{
  className?: string;
  sendMan: AddressInfo | null;
  setSendMan: React.Dispatch<React.SetStateAction<AddressInfo | null>>;
  onGoToAddressList: () => void;

}> = ({ className, sendMan, onGoToAddressList }) => {
  return (
    <View className={classNames("mrl10 o10 bccwhite", className)}>
      {/* 寄件人 */}
      <View className='pbt4 o10 prl10 o10 ww'>
        <View className='dbtc'>
          <View className='fwb pbt6'>寄件人</View>
        </View>
      </View>
      {sendMan && (
        <View className=' lit pr '>
          <View className='par hh dy prl10'>
            <Navigator
              className='cccgreen pl10 pbt6 oo nw '
              hoverClass='bccbacktab'
              url='~'
              onClick={() => {
                onGoToAddressList();
              }}>
              地址薄
            </Navigator>
          </View>
          <Navigator
            className='pbt10 o10  prl10'
            url='~'
            hoverClass='bccbacktab'
            onClick={() => {
              onGoToAddressList();
            }}>
            <View>
              {sendMan?.name} {sendMan?.mobile}
            </View>
            <View className='cccplh www70 '>
              {sendMan?.province} {sendMan?.city} {sendMan?.area} {sendMan?.address}
            </View>
          </Navigator>
        </View>
      )}
    </View>
  );
};
//#endregion

//#region 寄件人 列表
const ExpressAddressList: FC<{ expressList: Product_Express[] | null; }> = ({ expressList }) => {
  return <View className='pb15vh'>
    <View className='mrl10 prl10 mt10 cccplh'>识别结果：(收件人地址列表)</View>
    {expressList?.map((e, i) =>
      <View className='mt10 mrl10 prl10 pbt10 o10 bccwhite' key={i}>
        <View>{e?.recMan?.name} {e?.recMan?.mobile}</View>
        <View className='cccplh'>{e?.recMan?.province} {e?.recMan?.city} {e?.recMan?.area} {e?.recMan?.address}</View>
      </View>
    )}
  </View>;
};
//#endregion

//#region 文档说明
const DocumentDescription = () => {
  return <>
    <View className='prl10 mrl10 pbt4 mt10'>文档说明</View>
    <View className='prl10 mrl10 pbt4 cccplh'>最多支持5000条数据</View>
    <View className='prl10 mrl10 pbt4 cccplh'>请按以下格式编辑文档，每条数据必须包含 收件人姓名、电话、地址</View>

    <View className='ds mrl10  mt10 cccplh o10' style='border: 1rpx solid #808080;'>
      <View className='' style='border-right: 1rpx solid #808080;'>
        <View className='nw pbt6 prl4 dxy' style='border-bottom: 1rpx solid #808080;'>收件人姓名</View>
        <View className=' dxy' style='height:5rem;'>张三</View>
      </View>
      <View className='' style='border-right: 1rpx solid #808080;'>
        <View className='nw pbt6 dxy prl4' style='border-bottom: 1rpx solid #808080;'>收件人电话</View>
        <View className=' dxy prl4' style='height:5rem;'>17709205213</View>
      </View>
      <View className='' style='border-right: 1rpx solid #808080;'>
        <View className='nw pbt6 dxy prl4' style='border-bottom: 1rpx solid #808080;'>收件人地址</View>
        <View className='dxy prl4 ' style='height:5rem;'>陕西省延安市宝塔区马家湾789号</View>
      </View>
      <View className=''>
        <View className='nw pbt6 dxy prl4' style='border-bottom: 1rpx solid #808080;'>备注</View>
        <View className=' dxy prl4 nw' style='height:5rem;'>上衣*1</View>
      </View>
    </View>
    <View className='pbt4 dy'>
      <View className='prl10 mrl10 pbt6 cccgreen oo' hoverClass='bccbacktab'>下载批量打单文档模板</View>
    </View>

  </>;
};
//#endregion

const ___init_product_express: Product_Express = {
  self_OPENID: "",
  regiment_OPENID: "",
  product_type: "express",
  recMan: null,
  sendMan: null,
  totalFee: 0,
  itemType: "文件",
  itemNotes: "",
  weight: 0,
  describe: "快递",
  pickUpType: "到店寄件",
  print_times: 0,
};
