import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

const Index_test_display = () => {
  const onCopy = (e: string) => {
    Taro.setClipboardData({
      data: e,
      success: _ => {
        Taro.getClipboardData({
          success: () => Taro.showToast({ title: e, icon: "none" })
        });
      }
    });
  };


  return (
    <View className='ds dwp'>
      {
        [
          "ds", "dx", "dr",
          "dy", "dxy", "dxyl"
        ].map(e =>
          <View key={e} className={`${e} pr`} style='width:33.3vw; height:33.3vw;  border:1rpx black solid;border-collapse: collapse;'
            onClick={() => onCopy(e)}>
            <View className='pa dxy wwhh'>{e}</View>
            <View style='width:10vw; height:10vw; background:gray;'></View>
            <View style='width:10vw; height:10vw; background:gray;'></View>
          </View>)
      }
      {
        [
          "dll", "dcl", "drl",
          "dbtt", "dbtc", "dbtb",
          "dbtl", "dbtcv", "dbtr",
        ].map(e =>
          <View key={e} className={`${e} pr`} style='width:33.3vw; height:33.3vw;  border:1rpx black solid;border-collapse: collapse;'
            onClick={() => onCopy(e)}>
            <View className='pa dxy wwhh'>{e}</View>
            <View style='width:10vw; height:10vw; background:gray;'></View>
            <View style='width:10vw; height:10vw; background:gray;'></View>
          </View>)
      }
      {
        [
          "dtl", "dbl", "dbr", "dtr",
          "dlc", "dtc", "dbc", "drc",].map(e =>
            <View key={e} className={`${e} pr`} style='width:25vw; height:25vw; border:1rpx black solid;border-collapse: collapse;'
              onClick={() => onCopy(e)}>
              <View className='pa dxy wwhh'>{e}</View>
              <View style='width:10vw; height:10vw; background:gray;'></View>
              <View style='width:10vw; height:10vw; background:gray;'></View>
            </View>)
      }
    </View>
  );
};
export default Index_test_display;
