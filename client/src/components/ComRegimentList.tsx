import Taro from '@tarojs/taro';
import { ScrollView, View } from '@tarojs/components';
import { FC, useEffect, useState } from 'react';
import { Api_users_getRegimentList, Api_users_updateUserInfo } from '../api/user__users';
import ComLoading from './ComLoading';
import ComAvatar from './ComAvatar';
import { useHook_selfInfo_show } from '../utils/useHooks';

const ComRegimentList: FC<{ className?: string; }> = ({ className }) => {
  const [selfInfo_S, setSelfInfo_S] = useHook_selfInfo_show({});
  const [regiment_list, setRegiment_list] = useState<BaseUserInfo[] | null>(null);
  useEffect(() => {
    (async () =>
      setRegiment_list(await Api_users_getRegimentList())
    )();
  }, []);
  const onSelectRegiment = async (e: BaseUserInfo) => {
    Taro.showLoading({ title: "更新中...", mask: true });
    const res = await Api_users_updateUserInfo({
      ...selfInfo_S,
      regiment_OPENID: e?.OPENID,
      regiment_info: e
    });
    setSelfInfo_S({ ...res });
    Taro.hideLoading();
  };
  return <View>
    {!regiment_list && <ComLoading ></ComLoading>}
    {regiment_list && <View className={className} >
      <View className='dbc hhh15'>
        <View className='dxy pbt10 cccplh'>选择团长</View>
      </View>
      <ScrollView className='hhh85' scrollY>
        {regiment_list.map(e =>
          <View key={e._id} className='mrl10 p10 o10 bccwhite mt10'>
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
                  hoverClass='bccyellowtab' onClick={() => onSelectRegiment(e)}>
                  选这个
                </View>
              </View>
            </View>
            <View className='mt6'>
              <View>{e?.location_name?.split("-")[1]}</View>
              <View className='cccplh'>{e?.location_name?.split("-")[0]}</View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
    }
  </View>;
};
export default ComRegimentList

