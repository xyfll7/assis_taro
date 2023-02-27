import { FC, useEffect, useState } from "react";
import Taro, { useShareAppMessage } from "@tarojs/taro";
import { minutesToMilliseconds } from "date-fns";
import { View, Navigator, Button, Label, Map } from "@tarojs/components";
//
import { useHook_getQuota_number, useHook_get_orderList, useHook_selfInfo_show } from "../../utils/useHooks";
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

  async function ___get_selfInfo_S(e?: BaseUserInfo) {
    if (e) {
      setSelfInfo_S(e);
    } else {
      const res1 = await Api_users_getSelfInfo();
      setSelfInfo_S(res1);
    }
  }
  return (
    <View>
      {selfInfo_S == null && <ComLoading isIndex></ComLoading>}
      {
        selfInfo_S && selfInfo_S.regiment_info && (
          selfInfo_S.regiment_is === 1 ?
            <ServiceRegiment selfInfo_S={selfInfo_S} onRefresherRefresh_selfInfo_S={___get_selfInfo_S}></ServiceRegiment> :
            <ServiceUser selfInfo_S={selfInfo_S} onRefresherRefresh_selfInfo_S={___get_selfInfo_S}></ServiceUser>
        )
      }
    </View>
  );
};

export default Index;

const ServiceUser: FC<{ selfInfo_S: BaseUserInfo | null; onRefresherRefresh_selfInfo_S: (selfInfo?: BaseUserInfo) => Promise<void>; }> = ({ selfInfo_S, onRefresherRefresh_selfInfo_S }) => {
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
        await onRefresherRefresh_selfInfo_S();
        setTriggered(false);
      }}>
      <ComNav className='ds' isLeft isRight>
        <View>
          <View className='prl10 ww ds'>
            <ComAvatar src={selfInfo_S?.avatar} size={75} isSelf></ComAvatar>
            <View className='ww pr10'>
              <View className='ml10 oo dbtc ww' style={{ background: "#ffffffcc" }}>
                <View></View>
                <View className='cccplh pr10 pbt6'>搜索</View>
              </View>
            </View>
          </View>
          <View className='ds dwp pt10'>
            <View className='oo bccwhite  mr6  dy' >
              <Navigator className='dy pbt10 oo prl10' hoverClass='bccbacktab' url='/pages_user/user_express'>
                <View className='mrl6 lh100'>🛵</View>
                <View>快递服务</View>
              </Navigator>
            </View>
            <ComOrderNotice className='mr6 pbt8 bccwhite oo dxy' hoverClass='bccbacktab'></ComOrderNotice>
          </View>
          <View className='ds'>
            <Navigator className='prl10 pbt8 oo bccwhite  mr6 mt6' hoverClass='bccbacktab' url='/pages_user/user_my'>
              🐣 我的
            </Navigator>
          </View>
        </View>
      </ComNav>
      <MoreService selfInfo_S={selfInfo_S}></MoreService>
      <View className='safe-bottom'>
        <View className='mrl10 o15 ovh shadow'>
          <Map
            id='my_map'
            className='ww'
            customMapStyle='light'
            skew={40}
            enableOverlooking
            enableZoom={false}
            markers={[{
              id: 0,
              width: "",
              height: "",
              longitude: selfInfo_S?.regiment_info?.location?.coordinates[0]!,
              latitude: selfInfo_S?.regiment_info?.location?.coordinates[1]!,
              iconPath: ""
            }]}
            longitude={selfInfo_S?.regiment_info?.location?.coordinates[0]!}
            latitude={selfInfo_S?.regiment_info?.location?.coordinates[1]!}>
            <View className='dr p10'>
              <View className='prl10 pbt6 oo bccyellow' hoverClass='bccbacktab' onClick={() => {
                Taro.createMapContext("my_map").openMapApp({
                  longitude: selfInfo_S?.regiment_info?.location?.coordinates[0]!,
                  latitude: selfInfo_S?.regiment_info?.location?.coordinates[1]!,
                  destination: `${selfInfo_S?.regiment_info?.name!} 团长`
                });
              }}>到这去</View>
            </View>
          </Map>
          <View className='dbtt  o10 prl10 pbt4'>
            <View className='ds pbt6'>
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
            <View className='prl10 pbt6 oo bccyellow nw' hoverClass='bccbacktab' onClick={async () => {
              await onRefresherRefresh_selfInfo_S({ ...selfInfo_S, regiment_info: null });
            }}>切换</View>
          </View>
        </View>
        <View className='cccplh dxy fs pbt10 fs07'>小象心选</View>
      </View>
    </ComAAPage >
  );
};
const ServiceRegiment: FC<{ selfInfo_S: BaseUserInfo | null; onRefresherRefresh_selfInfo_S: (selfInfo?: BaseUserInfo) => Promise<void>; }> = ({ selfInfo_S, onRefresherRefresh_selfInfo_S }) => {
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
        await onRefresherRefresh_selfInfo_S();
        setTriggered(false);
      }}>
      <ComNav className='ds' isLeft isRight>
        <View>
          <View className='prl10 ww ds'>
            <View className='ds'>
              <ComAvatar className='mt4' src={selfInfo_S?.avatar} size={75}></ComAvatar>
              <View className='ml10'>
                <View className='fwb'>{selfInfo_S?.name}</View>
                <View className='fs08 cccplh nw2 lh100'>{selfInfo_S?.location_name}</View>
              </View>
            </View>
          </View>
          <View className='ds dwp pt10'>
            <View className='oo bccwhite  mr6  dy' >
              <Navigator className='dy pbt10 oo prl10' hoverClass='bccbacktab' url='/pages_user/user_express'>
                <View className='mrl6 lh100'>🛵</View>
                <View>快递服务</View>
              </Navigator>
              <Label for='share_express'>
                <View className='prl10 cccgreen pbt10 oo nw ' hoverClass='bccbacktab'>
                  <View className='prl4'>邀请</View>
                </View>
                <Button className='dsn' id='share_express' openType='share'></Button>
              </Label>
              <ComRegimentQRCode className='prl10 cccgreen pbt10 oo nw' hoverClass='bccbacktab'>
                二维码
              </ComRegimentQRCode>
            </View>
            <View className='ww ds dwp'>
              {!selfInfo_S?.regiment_replica_is &&
                <Navigator className='prl10 pbt8 oo bccwhite  mr6 mt6' hoverClass='bccbacktab' url='/pages_regiment/regiment_setting'>
                  🌿 团长
                </Navigator>}
              <Navigator className='prl10 pbt8 oo bccwhite  mr6 mt6' hoverClass='bccbacktab' url='/pages_regiment/regiment_orders'>
                🍒 团长订单
              </Navigator>
            </View>
          </View>
        </View>
      </ComNav>
      <MoreService selfInfo_S={selfInfo_S}></MoreService>
    </ComAAPage >
  );
};


const MoreService: FC<{ selfInfo_S: BaseUserInfo | null; }> = ({ }) => {
  const [env, setEnv] = useState<Environment>();
  useEffect(() => setEnv(getEnv()), []);
  return (
    <View className='dll'>
      <View className='pbt6 pr10 oo cccplh ml6'>更多服务敬请期待...</View>
      <View className='pbt6 pr10 oo cccplh ml6 fs06 fwl'>
        <View>
          环境：{`${env?.envVersion} ${env?.alias} ${env?.version !== "" ? env?.version : "0.0.00"}`}
        </View>
      </View>
    </View>
  );
};
