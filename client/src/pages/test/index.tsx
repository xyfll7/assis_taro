// 引入组件
import { Button, View } from "@tarojs/components";
import Taro from "@tarojs/taro";

definePageConfig({ navigationStyle: "custom", });
const Index_ = () => {


  return (
    <View className='mt10vh'>
      <Button onClick={() => {
        Taro.showModal({
          title: "请设置姓名",
          // @ts-ignore
          editable: true,
          placeholderText: "请输入姓名",
          success: (e) => {
            if (e.confirm) {
              console.log(e);
            }
          }
        });
      }}>测试</Button>
    </View>
  );
};
export default Index_;































