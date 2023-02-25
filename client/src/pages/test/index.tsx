// 引入组件
import { View } from "@tarojs/components";
import ComAAPage from '../../components/ComAAPage';


definePageConfig({ navigationStyle: "custom", });
const Index_ = () => {
  return (
    <ComAAPage>
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































