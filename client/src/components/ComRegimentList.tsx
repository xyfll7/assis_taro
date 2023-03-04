import Taro from '@tarojs/taro';
import { ScrollView, View } from '@tarojs/components';
import { FC } from 'react';
import { Api_users_updateUserInfo } from '../api/user__users';
import ComLoading from './ComLoading';
import ComAvatar from './ComAvatar';
import { useHook_getLocation, useHook_getRegimentListNearby } from '../utils/useHooks';
import { useSelfInfo } from '../store/SelfInfoProvider';

const ComRegimentList: FC<{ className?: string; }> = ({ className }) => {
  const [selfInfo_S, setSelfInfo_S] = useSelfInfo();
  const { locate } = useHook_getLocation();
  const { regiment_list } = useHook_getRegimentListNearby(locate);

  return <View>
    {!locate && <EmpowerCom></EmpowerCom>}
    {locate && !regiment_list && <ComLoading></ComLoading>}
    {locate && regiment_list && regiment_list.length === 0 && <ComLoading isEmpty msg='没有找到附近的团长'></ComLoading>}
    {locate && regiment_list &&
      <View className={className} >
        <View className='dbc hhh15'>
          <View className='dxy pbt10 cccplh'>选择团长</View>
        </View>
        <ScrollView className='hhh85' scrollY>
          {regiment_list.map(e =>
            <View key={e._id} className='mrl10 prl10 pt10 o10 bccwhite mt10'>
              <View className='dbtt'>
                <View className='ds '>
                  <ComAvatar src={e?.avatar}></ComAvatar>
                  <View className='ml10 mt2'>
                    <View> {e?.name}</View>
                    <View className='cccplh'>{e?.phone}</View>
                  </View>
                </View>
                <View>
                  <View className='prl10 pbt6 bccyellow oo cccplh'
                    hoverClass='bccyellowtab' onClick={async () => {
                      Taro.showLoading({ title: "更新中...", mask: true });
                      const res = await Api_users_updateUserInfo({
                        ...selfInfo_S,
                        regiment_OPENID: e?.OPENID,
                        regiment_info: e
                      });
                      setSelfInfo_S({ ...res });
                      Taro.hideLoading();
                    }}>
                    选这个
                  </View>
                </View>
              </View>
              <View className='mt6'>
                <View>{e?.location_name?.split("-")[1]}</View>
                <View className='cccplh'>{e?.location_name?.split("-")[0]}</View>
                <View className='dbtc pb4'>
                  <View className='cccprice'>距您 {e.distance?.toFixed(2)} 公里</View>
                  <View className='cccgreen oo prl10 pbt6' hoverClass='bccbacktab' onClick={() => {
                    Taro.openLocation({
                      longitude: e.location?.coordinates[0]!,
                      latitude: e.location?.coordinates[1]!,
                      address: e.location_name,
                      name: `${e.name} 团长`
                    });
                  }}>查看</View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    }
  </View>;
};
export default ComRegimentList;

const EmpowerCom = () => {
  return <View className='dcl mt10vh'>
    <View className='cccgreen oo prl10 pbt6' hoverClass='bccbacktab'
      onClick={async () => {
        await Taro.openSetting();
        Taro.reLaunch({ url: "/pages/index/index" });
      }}>授权</View>
    <View className='cccplh fs09'>请授权您的位置信息</View>
    <View className='cccplh fs09'>我们将为您获取附近的团长</View>
    <ComAvatar className='mt5vh' size={120}></ComAvatar>
  </View>;
}

