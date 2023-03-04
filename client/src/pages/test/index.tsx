// 引入组件
import { View } from "@tarojs/components";
import ComAAPage from '../../components/ComAAPage';
import { useHook_selfInfo_show } from '../../utils/useHooks';


definePageConfig({ navigationStyle: "custom", });
const Index_ = () => {
  const [selfInfo_S] = useHook_selfInfo_show({});
  return (
    <ComAAPage selfInfo_S={selfInfo_S}>
      <View>
        <View>111</View>
        <View>222</View>
      </View>
      <View>
        {new Array(300).fill("sssss").map((e, index) =>
          <View key={index}>{e}+{index}</View>
        )}
      </View>
      <View>
        <View>222</View>
        <View>111</View>
      </View>
    </ComAAPage>
  );
};
export default Index_;































