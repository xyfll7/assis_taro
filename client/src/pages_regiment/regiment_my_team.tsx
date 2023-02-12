import { useEffect, useState } from "react";
import { View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useHook_selfInfo_show } from "../utils/useHooks";
import { Api_users_getTeamList, Api_users_getUserInfo, Api_users_updateUserInfo } from "../api/user__users";
import ComNav from "../components/ComNav";
import ComNavBar from "../components/ComNavBar";
import { utils_get_scan_code_team_member_OPENID } from "../utils/utils";
import ComLoading from "../components/ComLoading";
import ComEmpty from "../components/ComEmpty";

definePageConfig({
  navigationStyle: "custom",
});
const Index_regiment_my_team = () => {
  const [selfInfo_S] = useHook_selfInfo_show({});
  const [teamList, setTeamList] = useState<BaseUserInfo[] | null>(null);
  useEffect(() => {
    if (selfInfo_S) {
      (async () => {
        const res = await Api_users_getTeamList(selfInfo_S.OPENID!);
        setTeamList(res);
      })();
    }
  }, [selfInfo_S]);
  return (
    <>
      <ComNav className='bccback' isHeight isSticky>
        <ComNavBar className='prl10' title='我的团队(团长)'></ComNavBar>
      </ComNav>
      <View className='m10'>
        {teamList === null && <ComLoading></ComLoading>}
        {/* 团队成员列表 */}
        {teamList?.map((e) => {
          return (
            <View className=' prl10 pbt4 o10 bccwhite dbtc' key={e._id}>
              <View className='dy'>
                <View className='pbt6 mr10'> 成员： {e.phone}</View>
                <View className='w5rem nw1'>{e.name}</View>
              </View>

              <View className='pbt6 pl10 oo cccplh' hoverClass='bccbacktab'
                onClick={() => {
                  Taro.showModal({
                    content: "您确定要删除该成员吗？", success: async (ee) => {
                      if (ee.confirm) {
                        Taro.showLoading({ title: "删除中...", mask: true });
                        const res0 = await Api_users_updateUserInfo({ ...e, regiment_replica_is: false });
                        setTeamList(teamList.filter(eee => eee._id !== res0._id));
                        Taro.hideLoading();
                      }
                    }
                  });
                }}>删除</View>
            </View>
          );
        })}
        {teamList?.length === 0 && <ComEmpty msg='您还没有团队成员'></ComEmpty>}
      </View>
      {/* 添加团队成员 */}
      <View className='fixed-bottom safe-bottom ww dxy'>
        <View
          className='prl10 pbt6 oo bccyellow mb10'
          hoverClass='bccyellowtab'
          onClick={async () => {
            const OPENID = await utils_get_scan_code_team_member_OPENID();
            if (OPENID) {
              Taro.showLoading({ title: "获取中...", mask: true });
              const res0 = await Api_users_getUserInfo(OPENID!);
              Taro.hideLoading();
              Taro.showModal({
                content: `确定将 ${res0.phone} 加入团队？`,
                success: async (e) => {
                  if (e.confirm) {
                    Taro.showLoading({ title: "添加中...", mask: true });
                    const res1 = await Api_users_updateUserInfo({ ...res0, regiment_replica_regiment_OPENID: selfInfo_S!.OPENID, regiment_replica_is: true });
                    setTeamList([...(teamList ?? []), res1]);
                    Taro.showToast({ title: "添加团队成员成功", icon: "none" });
                  }
                },
              });
            }
          }}>
          添加团队成员
        </View>
      </View>
    </>
  );
};
export default Index_regiment_my_team;
