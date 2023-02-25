import { FC, useState } from "react";
import Taro, { useLoad, useShareAppMessage } from "@tarojs/taro";
import { minutesToMilliseconds } from "date-fns";
import { View, Navigator, Button, Label } from "@tarojs/components";
// 工具
import { useHook_getQuota_number, useHook_get_orderList, useHook_selfInfo_show } from "../../utils/useHooks";
import { Api_orders_getOrderList } from "../../api/user__orders";
import { useOrdersNotice } from "../../store/OrdersNoticeProvider";
import { Api_users_getSelfInfo } from "../../api/user__users";
import getEnv from "../../utils/env";
import share_logo from "../../image/share_logo.jpeg";
// 组件
import ComRegimentQRCode from '../../components/ComRegimentQRCode';
import ComAAPage from '../../components/ComAAPage';
import ComAvatar from "../../components/ComAvatar";
import ComNav from "../../components/ComNav";
import ComLoading from "../../components/ComLoading";
import ComRegimentList from "../../components/ComRegimentList";
import ComOrderNotice from "../../components/ComOrderNotice";

definePageConfig({ enableShareAppMessage: true, backgroundColor: "#ffffff", navigationStyle: "custom", disableScroll: true });
const Index = () => {
  const [selfInfo_S, setSelfInfo_S] = useHook_selfInfo_show({});
  useHook_get_orderList();
  useHook_getQuota_number(minutesToMilliseconds(60));
  useShareAppMessage((res) => {
    if (res.from === "button") {
      // 来自页面内转发按钮
      return {
        title: `${selfInfo_S?.name} 团长 邀您6元起寄快递`,
        path: `/pages_user/user_express?scene=${encodeURIComponent(`R_D=${selfInfo_S?.OPENID}`)}`,
        imageUrl: share_logo,    // * 支持PNG及JPG * 显示图片长宽比是 5:4
      };
    }
    return {
      title: "小象团长助手",
      path: "/pages/index/index",
      imageUrl: share_logo,    // * 支持PNG及JPG * 显示图片长宽比是 5:4
    };
  });
  return (
    <View>
      {selfInfo_S == null && <ComLoading isIndex></ComLoading>}
      {selfInfo_S !== null && !selfInfo_S?.regiment_info && <ComRegimentList></ComRegimentList>}
      {selfInfo_S && selfInfo_S.regiment_info && <Service selfInfo_S={selfInfo_S} setSelfInfo_S={setSelfInfo_S}></Service>}
    </View>
  );
};

export default Index;

const Service: FC<{ selfInfo_S: BaseUserInfo | null; setSelfInfo_S: React.Dispatch<BaseUserInfo | null>; }> = ({ selfInfo_S, setSelfInfo_S }) => {
  const [, setOrders_S] = useOrdersNotice();
  const [triggered, setTriggered] = useState(false);
  return (
    <ComAAPage
      className='index-back'
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
      <ComNav className='ds' isLeft isRight>
        <View className='prl10 ww ds'>
          <ComAvatar src={selfInfo_S?.avatar} size={75} isSelf></ComAvatar>
          <View className='ww pr10'>
            <View className='ml10  oo  dbtc ww ' style={{ background: "#ffffffcc" }}>
              <View></View>
              <View className='cccplh pr10 pbt6'>搜索</View>
            </View>
          </View>
        </View>
      </ComNav>
      <View>
        <View className='prl10 ds dwp'>
          <View className='oo bccwhite  mr6 mt6 dy' >
            <Navigator className='dy pbt10 oo prl10' hoverClass='bccbacktab' url='/pages_user/user_express'>
              <View className='mrl6 lh100'>🛵</View>
              <View>快递服务</View>
            </Navigator>
            {selfInfo_S?.regiment_is === 1 &&
              <>
                <Label for='share_express'>
                  <View className='prl10 cccgreen pbt10 oo nw ' hoverClass='bccbacktab'>
                    <View className='prl4'>邀请</View>
                  </View>
                  <Button className='dsn' id='share_express' openType='share'></Button>
                </Label>
                <ComRegimentQRCode className='prl10 cccgreen pbt10 oo nw' hoverClass='bccbacktab'>
                  二维码
                </ComRegimentQRCode>
              </>
            }

          </View>
          {selfInfo_S?.regiment_is != 1 && <ComOrderNotice className='mt6 mr6 pbt8 bccwhite oo dxy' hoverClass='bccbacktab'></ComOrderNotice>}
          <Regiment selfInfo_S={selfInfo_S}></Regiment>
          {selfInfo_S?.regiment_is != 1 && (
            <Navigator className='prl10 pbt8 oo bccwhite  mr6 mt6' hoverClass='bccbacktab' url='/pages_user/user_my'>
              🐣 我的
            </Navigator>
          )}
        </View>
        <MoreService selfInfo_S={selfInfo_S}></MoreService>
      </View>
      <View className='safe-bottom'>
        <View className='dbtt mrl10 o10 prl10 bccyellow pbt4'>
          <View className='ds pbt6'
            onClick={() => {
              Taro.openLocation({
                longitude: selfInfo_S?.regiment_info?.location?.coordinates[0]!,
                latitude: selfInfo_S?.regiment_info?.location?.coordinates[1]!,
                address: selfInfo_S?.regiment_info?.location_name,
                name: `${selfInfo_S?.regiment_info?.name} 团长`
              });
            }}>
            <ComAvatar className='mr6 ' src={selfInfo_S?.regiment_info?.avatar}></ComAvatar>
            <View className='ww'>
              <View className='dbtc'>
                <View className='fwb'>{selfInfo_S?.regiment_info?.name} 团长为您服务</View>
              </View>
              <View className='dbtc'>
                <View className='mr4 nw2 fs08 cccblacktab'>{selfInfo_S?.regiment_info?.location_name?.split("-")}</View>
              </View>
            </View>
          </View>
          <View className='prl10 pbt6 oo bccwhite nw cccplh' style={{ fontSize: "1rem" }} hoverClass='bccbacktab' onClick={() => {
            if (selfInfo_S?.regiment_replica_is) {
              Taro.showToast({ title: "您是团队成员，无法切换到其他团长", icon: "none" });
            } else if (selfInfo_S?.regiment_is === 1) {
              Taro.showToast({ title: "您是团长，无法切换到其他团长", icon: "none" });
            } else {
              setSelfInfo_S({ ...selfInfo_S, regiment_info: null });
            }
          }}>切换</View>
        </View>
        <View className='cccplh dxy fs pbt10 fs07'>小象心选</View>
      </View>
    </ComAAPage >
  );
};

const Regiment: FC<{ selfInfo_S: BaseUserInfo | null; }> = ({ selfInfo_S }) => {
  return (
    <View className='ww ds dwp'>
      {selfInfo_S?.regiment_is == 1 && (
        <>{!selfInfo_S.regiment_replica_is &&
          <Navigator className='prl10 pbt8 oo bccwhite  mr6 mt6' hoverClass='bccbacktab' url='/pages_regiment/regiment_setting'>
            🌿 团长
          </Navigator>}
          <Navigator className='prl10 pbt8 oo bccwhite  mr6 mt6' hoverClass='bccbacktab' url='/pages_regiment/regiment_orders'>
            🍒 团长订单
          </Navigator>
        </>
      )}
    </View>
  );
};

const MoreService: FC<{ selfInfo_S: BaseUserInfo | null; }> = ({ }) => {
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
