// 引入组件
import { Button, View } from "@tarojs/components";
import Taro from '@tarojs/taro';

definePageConfig({ navigationStyle: "custom", });
const Index_ = () => {


  return (
    <View className='mt10vh'>
      <Button onClick={() => {
        Taro.getLocation({
          type: 'gcj02', //返回可以用于 wx.openLocation 的经纬度
          success(res) {
            console.log("KKKJJHH", res);
            // ° E,° N]

            const latitude = res.latitude;
            const longitude = res.longitude;
            Taro.openLocation({
              latitude: 34.23341,
              longitude: 108.975609,
              scale: 18
            });
          }
        });
      }}>测试</Button>
    </View>
  );
};
export default Index_;































