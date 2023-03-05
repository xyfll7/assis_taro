import { Button, Label, View, Navigator } from '@tarojs/components';
import { useHook_selfInfo_show } from '../utils/useHooks';

const ComAgent = () => {
  const [selfInfo_S] = useHook_selfInfo_show({});
  if (selfInfo_S?.agent_OPENID) {
    return <View className='dll'>
      <Navigator className='pbt6 pr10 oo cccplh ml6' hoverClass='bccbacktab' url='/pages_agent/agent__regiment_list'>
        团长列表(代理)</Navigator>
      <Label for='invite' >
        <View className='pr10 pbt6 oo cccplh ml6' hoverClass='bccbacktab'>
          邀请团长(代理)
          <Button id='invite' className='dsn' openType='share'></Button>
        </View>
      </Label>
    </View>;
  } else { return null; }
};


export default ComAgent;
