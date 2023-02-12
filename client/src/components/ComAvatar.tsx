


import { Image } from '@tarojs/components';
import { FC } from 'react';
import pawsvg from "../image/logo.svg";

const ComAvatar: FC<{
  style?: string;
  className?: string;

  src?: string;
  size?: number;
  radius?: string;
}> = ({ style, className, src, size, radius }) => {
  return (
    <Image

      className={className}
      src={src ? src : pawsvg}
      style={`${style};width: ${size ? size : 90}rpx; height: ${size ? size : 90}rpx; min-width: ${size ? size : 90}rpx; min-height: ${size ? size : 90}rpx; border-radius: ${radius ? radius : '1000rpx'}; background-color: #f6f6f6;`}
      mode='aspectFill'></Image>
  );
};

export default ComAvatar

