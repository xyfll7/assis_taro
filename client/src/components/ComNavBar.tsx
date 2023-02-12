import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import { FC } from 'react';

const ComNavBar: FC<{ className?: string, title?: string; }> = ({ className, title }) => {
  return (
    <View className={classNames("dbtc", className)}>
      <View className='dy www30 ' >
        <View className='ml10 pr10 pbt6 oo fwb' hoverClass='bccbacktab'
          onClick={() => Taro.navigateBack({ fail: () => Taro.reLaunch({ url: "/pages/index/index" }) })
          }>返回</View>
      </View>
      <View className='dxy www30 fwb nw' >{title ?? '默认标题'}</View>
      <View className='www30' ></View>
    </View>
  );
};
export default ComNavBar;
