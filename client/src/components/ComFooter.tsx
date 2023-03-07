import { View } from "@tarojs/components";
import { useSelfInfo } from '../store/SelfInfoProvider';

const ComFooter = () => {
  const [selfInfo_S] = useSelfInfo();
  return <>
    {selfInfo_S && selfInfo_S.regiment_is === 1 ?
      <View className='hhh15 dxyl fs07 cccplh fwl'>
        <View>小象团长助手</View>
        <View>团长好帮手</View>
      </View> :
      <View className='hhh15 dxyl fs07 cccplh fwl'>
        <View>小象心选</View>
        <View>数智生活心选服务</View>
      </View>
    }
  </>;

};
export default ComFooter;
