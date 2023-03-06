import { useState } from "react";
import { useShareAppMessage } from "@tarojs/taro";
import { View, Navigator, Button, Label } from "@tarojs/components";
//
import { useHook_get_orderList, useHook_selfInfo_show } from "../../utils/useHooks";
import { useOrdersNotice } from "../../store/OrdersNoticeProvider";
import { Api_users_getSelfInfo } from "../../api/user__users";
import share_logo from "../../image/share_logo.jpeg";
// 组件
import ComRegimentQRCode from '../../components/ComRegimentQRCode';
import ComAAPage from '../../components/ComAAPage';
import ComAvatar from "../../components/ComAvatar";
import ComNav from "../../components/ComNav";

import ComOrderNotice from "../../components/ComOrderNotice";
import ComRegimentList from '../../components/ComRegimentList';
import ComMoreService from '../../components/ComMoreService';
import ComRegimentMap from '../../components/ComRegimentMap';

definePageConfig({ enableShareAppMessage: true, backgroundColor: "#ffffff", navigationStyle: "custom", disableScroll: true });
const Index = () => {
  const [selfInfo_S, setSelfInfo_S] = useHook_selfInfo_show({});
  useHook_get_orderList();
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
  const [, setOrders_S] = useOrdersNotice();
  const [triggered, setTriggered] = useState(false);
  return <>
    <ComAAPage selfInfo_S={selfInfo_S}
      className='index-back'
      refresherBackground='transparent'
      refresherDefaultStyle='none'
      refresherTriggered={triggered}
      refresherEnabled
      onRefresherRefresh={async () => {
        setTriggered(true);
        setOrders_S(null);
        await ___get_selfInfo_S();
        setTriggered(false);
      }}>
      {/* 用户 */}
      {selfInfo_S && selfInfo_S.regiment_info && selfInfo_S.regiment_is !== 1 &&
        <ComNav isLeft isRight>
          <View className='prl10 ww ds'>
            <ComAvatar src={selfInfo_S?.avatar} size={75} isSelf timestamp={String(selfInfo_S.timestamp_update)}></ComAvatar>
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
        </ComNav>
      }
      {selfInfo_S && selfInfo_S.regiment_info && selfInfo_S.regiment_is !== 1 &&
        <ComMoreService></ComMoreService>
      }
      {selfInfo_S && selfInfo_S.regiment_info && selfInfo_S.regiment_is !== 1 &&
        <ComRegimentMap selfInfo_S={selfInfo_S} onClick={async () => await ___get_selfInfo_S({ ...selfInfo_S, regiment_info: null })}></ComRegimentMap>
      }
      {selfInfo_S && !selfInfo_S.regiment_info && selfInfo_S.regiment_is !== 1 &&
        <ComRegimentList></ComRegimentList>
      }
      {/* 团长 */}
      {selfInfo_S && selfInfo_S.regiment_info && selfInfo_S.regiment_is === 1 &&
        <ComNav isLeft isRight>
          <View className='prl10 ww ds'>
            <View className='ds'>
              <ComAvatar className='mt4' src={selfInfo_S?.avatar} size={75} timestamp={String(selfInfo_S.timestamp_update)}></ComAvatar>
              <View className='ml10'>
                <View className='fwb'>{selfInfo_S?.name}</View>
                <View className='fs08 cccplh nw2 lh100'>{selfInfo_S?.location_name}</View>
              </View>
            </View>
          </View>
          <View className='dll pt10'>
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
            <Navigator className='prl10 pbt8 oo bccwhite  mr6 mt6' hoverClass='bccbacktab' url='/pages_regiment/regiment_orders'>
              🍒 团长订单
            </Navigator>
            {!selfInfo_S?.regiment_replica_is &&
              <Navigator className='prl10 pbt8 oo bccwhite  mr6 mt6' hoverClass='bccbacktab' url='/pages_regiment/regiment_setting'>
                🌿 团长
              </Navigator>
            }
          </View>
        </ComNav>
      }
      {selfInfo_S && selfInfo_S.regiment_info && selfInfo_S.regiment_is === 1 &&
        <ComMoreService></ComMoreService>
      }
      {selfInfo_S && selfInfo_S.regiment_info && selfInfo_S.regiment_is === 1 &&
        <ComRegimentMap selfInfo_S={selfInfo_S}></ComRegimentMap>
      }
    </ComAAPage>
  </>;
};

export default Index;




