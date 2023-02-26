import { FC, useEffect, useState } from "react";
import Taro, { useShareAppMessage } from "@tarojs/taro";
import { View } from "@tarojs/components";
//
import { useHook_selfInfo_show } from "../utils/useHooks";
import { Api_logistics_bindAccount, Api_logistics_getQuota } from "../api/a__logistics";
import share_logo from "../image/share_logo.jpeg";
// 组件
import ComLoading from "../components/ComLoading";
import ComNav from "../components/ComNav";
import ComNavBar from "../components/ComNavBar";
import ComLogisticsBindAccount from "../components/ComLogisticsBindAccount";
import ComEmpty from "../components/ComEmpty";
import ComAAPage from "../components/ComAAPage";

definePageConfig({ navigationStyle: "custom", enableShareAppMessage: true, disableScroll: true });
const Index_regiment_bind_account = () => {
  const [selfInfo_S] = useHook_selfInfo_show({});
  const router = Taro.getCurrentInstance().router;
  if (router && router.params && router.params.bizId) {
  }

  useShareAppMessage((res) => {
    if (res.from === "button" && selfInfo_S?.regiment_is) {
      return {
        title: `共享电子面单`,
        path: `/pages_regiment/regiment_bind_account?${(res.target as any)?.dataset.logistic}`,
        imageUrl: share_logo,    // * 支持PNG及JPG * 显示图片长宽比是 5:4
      };
    }
    return {
      title: "小象团长助手",
      path: "/pages/index/index",
      imageUrl: share_logo,    // * 支持PNG及JPG * 显示图片长宽比是 5:4
    };
  });



  const [show, setShow] = useState(false);
  return <ComAAPage>
    <ComNav className='bccback dy' isHeight isSticky>
      <ComNavBar className='prl10' title='电子面单账号管理'></ComNavBar>
    </ComNav>
    <BindAccountList></BindAccountList>
    <View className='ww dxy safe-bottom'>
      <View className='prl10 pbt6 oo bccyellow' hoverClass='bccyellowtab'
        onClick={() => setShow(!show)}>添加电子面单账号1</View>
    </View>
    <ComLogisticsBindAccount show={show} onAfterLeave={() => { setShow(!show); }}></ComLogisticsBindAccount>
  </ComAAPage>;

};
export default Index_regiment_bind_account;

const BindAccountList = () => {
  const [selfInfo_S, setSelfInfo_S] = useHook_selfInfo_show({});
  return <>
    {!selfInfo_S && <ComLoading></ComLoading>}
    {!selfInfo_S?.logistics || selfInfo_S?.logistics?.length == 0 && <ComEmpty msg='您没还有绑定电子面单账号'></ComEmpty>}
    {selfInfo_S && selfInfo_S?.logistics?.sort(e => e.selected ? -1 : 0).map(logistic =>
      <View className=' prl10 o10 bccwhite' key={logistic.bizId}>
        <View className='dbtc pbt4'>
          <View className='pbt6 dy'>{logistic.deliveryName}</View>
          <View className='cccplh oo pbt6 prl10' hoverClass='bccbacktab' onClick={() => {
            Taro.showModal({
              content: "您确定要解绑吗?",
              success: async (res0) => {
                if (res0.confirm) {
                  Taro.showLoading();
                  const res1 = await Api_logistics_bindAccount({
                    ...selfInfo_S,
                    logistics: selfInfo_S.logistics?.filter(ee => ee.bizId !== logistic.bizId),
                  }, { ...logistic, type: "unbind" });
                  setSelfInfo_S(res1);
                  Taro.showToast({ title: "解绑成功", icon: "none" });
                }
              }
            });
            return;
          }}>解绑</View>
        </View>
        <View className='dbtc pbt4 lit'>
          <View className='pbt6'>面单余额</View>
          <View className='pbt6 prl10'>{logistic && <QuotaNum logistic={logistic}></QuotaNum>}</View>
        </View>
        {/* <View className='dbtc pbt4 lit'>
            <View>共享电子面单</View>
            <Label for={logistic?.bizId}>
              <View className='cccgreen prl10 oo pbt6' hoverClass='bccbacktab'>
                共享
              </View>
              <Button className='dsn' id={logistic?.bizId} openType='share' data-logistic={queryString.stringify(logistic)}></Button>
            </Label>
          </View> */}
      </View>)
    }
  </>;
};

const QuotaNum: FC<{
  logistic: Logistics_Account;
}> = ({ logistic }) => {
  const [quotaNum, setQuotaNum] = useState<number | null>(null);
  useEffect(() => {
    (async () => {
      const res = await Api_logistics_getQuota(logistic);
      setQuotaNum(res);
    })();
  }, [logistic]);
  return <>{quotaNum ?? "..."}</>;
};
