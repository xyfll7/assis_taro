import { Button, Label, View, Navigator } from '@tarojs/components';
import { useHook_selfInfo_show } from '../utils/useHooks';

const ComAdmin = () => {
  const [selfInfo_S] = useHook_selfInfo_show({});
  if ([
    "oGwbL5MUeSNxxA4o0oOmb_FUjE7g", // 王肇
    "oGwbL5CEoFe5T1fqyAQUu0ohSLSM", // 王红霞 // cSpell: ignore SLSM
    "oGwbL5IZEq-8Op4CvUTNodRKdOB0", // 冯强
  ].includes(selfInfo_S?.OPENID!)) {
    return <View className='dll'>
      <Navigator className='pbt6 pr10 oo cccplh ml6' hoverClass='bccbacktab' url='/pages_admin/admin__regiment_list'>
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


export default ComAdmin;
