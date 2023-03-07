import { View } from '@tarojs/components';
import classNames from 'classnames';
import { FC } from 'react';
import ComAvatar from './ComAvatar';
import { useHook_newVersionChecker } from '../utils/useHooks';

const ComLoading: FC<{
  className?: string;
  isIndex?: boolean;
  isSystemUpdate?: boolean;
  isEmpty?: boolean;
  msg?: string;
}> = ({ className, isIndex, isSystemUpdate, isEmpty = false, msg }) => {
  const [newVersion, applyUpdateNewVersion] = useHook_newVersionChecker(isSystemUpdate);
  return <>
    {isEmpty &&
      <View className={classNames("dcl", className, {
        mt10vh: !Boolean(className)
      })}>
        <View>{___random(['🍋', '🍓', '🥑', '🍒', '🍉', '🍭', '🍡', '🌶', '🌽', '🥬', '🍎', '🍅'])} </View>
        <View className='pbt4 cccplh'>{msg ?? "没有数据"}</View>
      </View>
    }
    {!isEmpty &&
      <View className={classNames("dcl", className, {
        vbh: isSystemUpdate,
        mt20vh: isIndex,
        mt10vh: !Boolean(className)
      })}>
        <View className='weui-loading'></View>
        <View className='pbt6 cccplh'>加载中...</View>
      </View>
    }
    {isIndex &&
      <View className='ww dcl pt40vh'>
        <ComAvatar size={100} isShowBack={false}></ComAvatar>
        {isSystemUpdate && newVersion !== 2 && <View className='pbt6 cccplh'>系统升级中</View>}
        {isSystemUpdate && newVersion === 0 && <View className='pbt6 cccplh'>正在检查新版本...</View>}
        {isSystemUpdate && newVersion === 1 && <View className='pbt6 cccplh'>正在下载新版本...</View>}
        {isSystemUpdate && newVersion === 2 && <View className='pbt6 cccplh'>下载成功</View>}
        {isSystemUpdate && newVersion === 3 && <View className='pbt6 cccplh'>下载失败，请稍后重试</View>}
        {isSystemUpdate && newVersion === 2 && <View className='pbt6 cccplh'>
          <View className='bccyellow pbt6 prl10 oo' hoverClass='bccyellowtab'
            onClick={() => applyUpdateNewVersion()}>立即重启</View>
        </View>}
      </View>
    }
  </>;
};
export default ComLoading;

const ___random = (arr: string[]) => {
  var max = 3;
  var min = 2;
  if (arr) {
    return arr.sort(function () {
      return Math.random() - 0.5;
    }).slice(0, Math.floor(Math.random() * (max - min + 1) + min)).join(" ");
  } else {
    return null;
  }
};



