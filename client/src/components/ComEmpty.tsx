import { View } from '@tarojs/components';
import classNames from 'classnames';
import { FC } from 'react';

const ComEmpty: FC<{
  className?: string;
  msg?: string;
}> = ({ className, msg }) => {
  return (
    <View className={classNames("dcl", className, {
      mt10vh: !Boolean(className)
    })}>
      <View>{___random(['🍋', '🍓', '🥑', '🍒', '🍉', '🍭', '🍡', '🌶', '🌽', '🥬', '🍎', '🍅'])} </View>
      <View className='pbt4 cccplh'>{msg ?? "没有数据"}</View>
    </View>
  );
};
export default ComEmpty;


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
