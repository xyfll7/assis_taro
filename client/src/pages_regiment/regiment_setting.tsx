import classNames from "classnames";
import Taro from "@tarojs/taro";

import { View, Navigator } from "@tarojs/components";
import { useHook_selfInfo_show } from "../utils/useHooks";
import { Api_users_updateUserInfo } from "../api/user__users";

// 组件
import ComNav from "../components/ComNav";
import ComNavBar from "../components/ComNavBar";
import ComAgent from "../components/ComAgent";
import ComAAPage from "../components/ComAAPage";

definePageConfig({ navigationStyle: "custom", enableShareAppMessage: true, disableScroll: true });
const Index_regiment_setting = () => {
  const [selfInfo_S, setSelfInfo_S] = useHook_selfInfo_show({});

  return (
    <ComAAPage selfInfo_S={selfInfo_S}>
      <ComNav className='bccback' isHeight isSticky>
        <ComNavBar className='prl10' title='设置(团长)'></ComNavBar>
      </ComNav>
      <View >
        <View className='bccwhite o10 prl10'>
          {/* 团长信息 */}
          <View className='pbt4'>
            <View className='dbtc'>
              <View className='w9rem nw1'>{selfInfo_S?.name}</View>
              <Navigator className='cccgreen pbt6 pl10 oo' hoverClass='bccbacktab'
                url='/pages_regiment/regiment_register'>修改个人信息</Navigator>
            </View>
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
          <ComAgent></ComAgent>
        </View>
      </View>
    </ComAAPage>
  );
};
export default Index_regiment_setting;
