import Taro from "@tarojs/taro";
import { FC } from "react";
import { View } from "@tarojs/components";
import { useHook_selfInfo_show } from "../utils/useHooks";
import { utils_get_scan_code } from "../utils/utils";
import { Api_users_updateUserInfo } from "../api/user__users";
// 组件
import ComNav from "../components/ComNav";
import ComNavBar from "../components/ComNavBar";
import ComLoading from "../components/ComLoading";
import ComEmpty from "../components/ComEmpty";
import ComAAPage from "../components/ComAAPage";

definePageConfig({ navigationStyle: "custom", disableScroll: true });
const Index_regiment_bind_printer_cloud = () => {
  const [selfInfo_S, setSelfInfo_S] = useHook_selfInfo_show({});
  return (
    <ComAAPage>
      <ComNav className='bccback dy' isHeight isSticky>
        <ComNavBar className='prl10' title='云打印机管理'></ComNavBar>
      </ComNav>
      <BindAccountList selfInfo_S={selfInfo_S} setSelfInfo_S={setSelfInfo_S}></BindAccountList>
      <View className='safe-bottom ww dxy'>
        <View
          className='prl10 pbt6 oo bccyellow mb10'
          hoverClass='bccyellowtab'
          onClick={async () => {
            Taro.showLoading({ title: "配置中...", mask: true });
            const siid = await utils_get_scan_code();
            if (siid) {
              if (selfInfo_S?.printers?.find((e) => e.siid === siid)) {
                Taro.showToast({ title: "您已经添加过该打印机,请勿重复添加", icon: "none" });
                return;
              }
              const res = await Api_users_updateUserInfo({
                ...selfInfo_S,
                printers: [...(selfInfo_S?.printers ?? []), { siid: siid, direction: 0 }]
              });
              setSelfInfo_S(res);
              Taro.showToast({ title: "打印机配置成功", icon: "none" });
            } else {
              Taro.showToast({ title: "没有识别到打印机，请重试" });
            }
          }}>
          添加云打印机
        </View>
      </View>
    </ComAAPage>
  );
};
export default Index_regiment_bind_printer_cloud;

const BindAccountList: FC<{
  selfInfo_S: BaseUserInfo | null,
  setSelfInfo_S: React.Dispatch<BaseUserInfo | null>;
}> = ({ selfInfo_S, setSelfInfo_S }) => {
  return <>
    {!selfInfo_S && <ComLoading></ComLoading>}
    {!selfInfo_S?.printers || (selfInfo_S?.printers?.length == 0 && <ComEmpty msg='您没还有添加打印机'></ComEmpty>)}
    {selfInfo_S?.printers?.map((printer) => (
      <View className='prl10  o10 bccwhite' key={printer.siid}>
        <View className='pbt10'>打印机ID {printer.siid}</View>
        <View className='dbtc pbt4 lit'>
          <View> 打印方向 {printer.direction === 0 ? "正向" : "反向"}</View>
          <View className='pbt6 pl10 oo cccgreen' hoverClass='bccbacktab'
            onClick={async () => {
              Taro.showLoading({ title: "切换中..." });
              const res = await Api_users_updateUserInfo({
                ...selfInfo_S,
                printers: selfInfo_S.printers?.map(ee => ee.siid == printer.siid ? { ...printer, direction: printer.direction === 1 ? 0 : 1 } : ee)
              });
              setSelfInfo_S(res);
              Taro.hideLoading();
            }}>切换打印方向</View>
        </View>
        <View className='dr pbt4 lit'>
          <View className='cccplh pl10 pbt6 oo' hoverClass='bccbacktab'
            onClick={() => {
              Taro.showModal({
                title: "提示", content: "您确定要删除该打印机?", success: async (ee) => {
                  if (ee.confirm) {
                    Taro.showLoading({ title: "删除中...", mask: true });
                    const res = await Api_users_updateUserInfo({
                      ...selfInfo_S,
                      printers: selfInfo_S?.printers?.filter(eee => eee.siid !== printer.siid)
                    });
                    setSelfInfo_S(res);
                    Taro.hideLoading();
                  }
                }
              });

            }}>删除</View>
        </View>
      </View>
    ))}
  </>;

};
