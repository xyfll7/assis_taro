import { Button, Label, View, Navigator } from '@tarojs/components';
import { useShareAppMessage } from '@tarojs/taro';
import { useHook_selfInfo_show } from '../utils/useHooks';
import share_logo from "../image/share_logo.jpeg";

const ComAgent = () => {
  const [selfInfo_S] = useHook_selfInfo_show({});
  useShareAppMessage((res) => {
    if (res.from === "button") {
      // 来自页面内转发按钮
      return {
        title: `${selfInfo_S?.name ?? "管理员"} 邀请您注册团长`,
        path: `/pages_regiment/regiment_register?agent_OPENID=${selfInfo_S?.OPENID}`,
        imageUrl: share_logo,    // * 支持PNG及JPG * 显示图片长宽比是 5:4
      };
    }
    return {
      title: "小象团长助手",
      path: "/pages/index/index",
      imageUrl: share_logo,    // * 支持PNG及JPG * 显示图片长宽比是 5:4
    };
  });
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
