import classNames from "classnames";
import Taro, { useShareAppMessage } from "@tarojs/taro";

import { View, Navigator } from "@tarojs/components";
import { useHook_selfInfo_show } from "../utils/useHooks";
import ComNav from "../components/ComNav";
import ComNavBar from "../components/ComNavBar";
import { Api_users_updateUserInfo } from "../api/user__users";
import ComAdmin from "../components/ComAdmin";
import ComRegimentQRCode from "../components/ComRegimentQRCode";
import share_logo from "../image/share_logo.jpeg";

definePageConfig({ navigationStyle: "custom", enableShareAppMessage: true });
const Index_regiment_setting = () => {
  const [selfInfo_S, setSelfInfo_S] = useHook_selfInfo_show({});

  useShareAppMessage((res) => {
    if (res.from === "button") {
      // 来自页面内转发按钮
      return {
        title: `${selfInfo_S?.name ?? "管理员"} 邀请您注册团长`,
        path: `/pages_regiment/regiment_register?inviter_OPENID=${selfInfo_S?.OPENID}`,
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
    <>
      <ComNav className='bccback' isHeight isSticky>
        <ComNavBar className='prl10' title='设置(团长)'></ComNavBar>
      </ComNav>
      <View className='mrl10 mt10'>
        <View className='bccwhite o10 prl10'>
          {/* 团长信息 */}
          <View className='pbt10'>
            <View>{selfInfo_S?.name}</View>
            <View className='cccplh'>{selfInfo_S?.location_name}</View>
          </View>
          <View className='pbt4 lit dbtc'>
            <View>团长直接打印</View>
            <View
              className='cccgreen pbt6 oo pl10 dy'
              hoverClass='bccbacktab'
              onClick={async () => {
                Taro.showLoading({ title: "更新中..." });
                const res_selfInfo = await Api_users_updateUserInfo({ ...selfInfo_S, print_direct_regiment: !Boolean(selfInfo_S?.print_direct_regiment) });
                setSelfInfo_S(res_selfInfo);
                Taro.hideLoading();
              }}>
              <View className={classNames({ cccplh: !Boolean(selfInfo_S?.print_direct_regiment) })}>打开</View>/
              <View className={classNames({ cccplh: Boolean(selfInfo_S?.print_direct_regiment) })}>关闭</View>
            </View>
          </View>
          <View className='pbt4 lit dbtc '>
            <View>用户自助打印</View>
            <View
              className='cccgreen pbt6 oo pl10 dy'
              hoverClass='bccbacktab'
              onClick={async () => {
                Taro.showLoading({ title: "更新中..." });
                const res_selfInfo = await Api_users_updateUserInfo({ ...selfInfo_S, print_direct_user: !Boolean(selfInfo_S?.print_direct_user) });
                setSelfInfo_S(res_selfInfo);
                Taro.hideLoading();
              }}>
              <View className={classNames({ cccplh: !Boolean(selfInfo_S?.print_direct_user) })}>打开</View>/
              <View className={classNames({ cccplh: Boolean(selfInfo_S?.print_direct_user) })}>关闭</View>
            </View>
          </View>
        </View>
        <View className='mt10 dll'>
          <ComRegimentQRCode className='pbt6 pr10 oo cccplh ml6' hoverClass='bccbacktab'>
            团长专属小程序码
          </ComRegimentQRCode>
          <Navigator className='pbt6 pr10 oo cccplh ml6 ' hoverClass='bccbacktab' url='/pages_regiment/regiment_my_team'>
            我的团队
          </Navigator>
          <Navigator className='pbt6 pr10 oo cccplh ml6 ' hoverClass='bccbacktab' url='/pages_regiment/regiment_collection_record'>
            收款记录
          </Navigator>
          <Navigator className='pbt6 pr10 oo cccplh ml6 ' hoverClass='bccbacktab' url='/pages_regiment/regiment_bind_account'>
            电子面单账号管理
          </Navigator>
          <Navigator className='pbt6 pr10 oo cccplh ml6' hoverClass='bccbacktab' url='/pages_regiment/regiment_bind_printer_cloud'>
            云打印机管理
          </Navigator>
          <ComAdmin></ComAdmin>
        </View>
      </View>
    </>
  );
};
export default Index_regiment_setting;
