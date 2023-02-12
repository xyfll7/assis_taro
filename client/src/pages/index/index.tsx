import classNames from "classnames";
import { FC, useState } from "react";
import Taro, { useLoad } from "@tarojs/taro";
import { minutesToMilliseconds } from "date-fns";
import { View, Navigator, ScrollView } from "@tarojs/components";
import ComAvatar from "../../components/ComAvatar";
import ComNav from "../../components/ComNav";
import ComLoading from "../../components/ComLoading";
import ComRegimentList from "../../components/ComRegimentList";
import ComOrderNotice from "../../components/ComOrderNotice";
import { useHook_getQuota_number, useHook_selfInfo_show } from "../../utils/useHooks";
import { Api_orders_getOrderList } from "../../api/user__orders";
import { useOrdersNotice } from "../../store/OrdersNoticeProvider";
import { Api_users_getSelfInfo } from "../../api/user__users";
import getEnv from "../../utils/env";

definePageConfig({ enableShareAppMessage: true, backgroundColor: "#ffffff", navigationStyle: "custom", disableScroll: true });
const Index = () => {
  const [selfInfo_S, setSelfInfo_S] = useHook_selfInfo_show({ isOrderNotice: true, isGetOrderNoticeOnce: true });
  useHook_getQuota_number(minutesToMilliseconds(60));
  return (
    <View>
      {selfInfo_S == null && <ComLoading isIndex></ComLoading>}
      {selfInfo_S !== null && !selfInfo_S?.regiment_info && <ComRegimentList></ComRegimentList>}
      <Service selfInfo_S={selfInfo_S} setSelfInfo_S={setSelfInfo_S}></Service>
    </View>
  );
};

export default Index;

const Service: FC<{ selfInfo_S: BaseUserInfo | null; setSelfInfo_S: React.Dispatch<BaseUserInfo | null>; }> = ({ selfInfo_S, setSelfInfo_S }) => {
  const [, setOrders_S] = useOrdersNotice();
  const [triggered, setTriggered] = useState(false);
  return (
    <ScrollView
      className={classNames("hhh99 index-back", { vbh: !selfInfo_S || !selfInfo_S?.regiment_info })}
      enable-passive
      scrollY
      refresherBackground='transparent'
      refresherDefaultStyle='none'
      refresherTriggered={triggered}
      refresherEnabled
      onRefresherRefresh={async () => {
        setTriggered(true);
        setOrders_S(null);
        const res1 = await Api_users_getSelfInfo();
        setSelfInfo_S(res1);
        if (res1.regiment_is !== 1) {
          const res0 = await Api_orders_getOrderList({ self_OPENID: selfInfo_S!.OPENID, payStatus: [0] });
          setOrders_S(res0);
        }
        setTriggered(false);
      }}>
      <View>
        <ComNav className='ds pb4' isLeft>
          <ComAvatar className='ml10 mr6' src={selfInfo_S?.regiment_info?.avatar}></ComAvatar>
          <View className='mt2'>
            <View className='fwb'>{selfInfo_S?.regiment_info?.name}</View>
            <View className='dy  fs08 lh100 fwb'>
              <View className='mr4 nw1' style='max-width:30vw;'>
                {selfInfo_S?.regiment_info?.location_name?.split("-")[1]}
              </View>
              <View
                onClick={() => {
                  if (selfInfo_S?.regiment_replica_is) {
                    Taro.showToast({ title: "您是团队成员，无法切换到其他团长", icon: "none" });
                  } else if (selfInfo_S?.regiment_is === 1) {
                    Taro.showToast({ title: "您是团长，无法切换到其他团长", icon: "none" });
                  } else {
                    setSelfInfo_S({ ...selfInfo_S, regiment_info: null });
                  }
                }}>
                切换
              </View>
            </View>
          </View>
        </ComNav>
        <View className='prl10 ds dwp '>
          <Navigator className='prl10 pbt8 oo bccwhite  mr6 mt6' hoverClass='bccbacktab' url='/pages_user/user_express'>
            🛵 快递服务
          </Navigator>
          {selfInfo_S?.regiment_is != 1 && <ComOrderNotice className='mt6 mr6 pbt8 bccwhite oo dxy' hoverClass='bccbacktab'></ComOrderNotice>}
          <Regiment selfInfo_S={selfInfo_S}></Regiment>
          {selfInfo_S?.regiment_is != 1 && (
            <Navigator className='prl10 pbt8 oo bccwhite  mr6 mt6' hoverClass='bccbacktab' url='/pages_user/user_my'>
              🐣 我的
            </Navigator>
          )}
        </View>
        <RegimentSetting selfInfo_S={selfInfo_S}></RegimentSetting>
      </View>
    </ScrollView>
  );
};

const Regiment: FC<{ selfInfo_S: BaseUserInfo | null; }> = ({ selfInfo_S }) => {
  return (
    <View className='ww ds dwp'>
      {selfInfo_S?.regiment_is == 1 && (
        <>
          {!selfInfo_S.regiment_replica_is &&
            <Navigator className='prl10 pbt8 oo bccwhite  mr6 mt6' hoverClass='bccbacktab' url='/pages_regiment/regiment_setting'>
              🌿 团长
            </Navigator>
          }
          <Navigator className='prl10 pbt8 oo bccwhite  mr6 mt6' hoverClass='bccbacktab' url='/pages_regiment/regiment_orders'>
            🍒 团长订单
          </Navigator>
          {/* <Navigator className="prl10 pbt8 oo bccwhite  mr6 mt6" hoverClass="bccbacktab" url="/pages_regiment/regiment_batch_printing">
          🐝 批量打单</Navigator> */}
          {/* <Navigator className="prl10 pbt10 oo bccwhite  mr6" hoverClass="bccbacktab" url="/pages_regiment/regiment_printer"> 🖨️ 打印机</Navigator> */}
        </>
      )}
    </View>
  );
};

const RegimentSetting: FC<{ selfInfo_S: BaseUserInfo | null; }> = ({ }) => {
  const [env, setEnv] = useState<Environment>();
  useLoad(async () => setEnv(getEnv()));

  return (
    <View className='prl10 dll pt6'>
      <View className='pbt6 pr10 oo cccplh ml6'>更多服务敬请期待...</View>
      <View className='pbt6 pr10 oo cccplh ml6 fs06 fwl'>
        <View>
          环境：{env?.envVersion} {env?.alias} {env?.version !== "" ? env?.version : "0.0.00"}
        </View>
      </View>
    </View>
  );
};
