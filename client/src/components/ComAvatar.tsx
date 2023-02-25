


import { Image, View } from '@tarojs/components';
import { FC } from 'react';
import pawsvg from "../image/logo.svg";
import user_avatar from "../image/user_avatar.png";

const ComAvatar: FC<{
  style?: string;
  className?: string;

  src?: string;
  size?: number;
  radius?: string;
  isSelf?: boolean;
}> = ({ style, className, src, size, radius, isSelf = false }) => {
  const _style = `${style};
                  width: ${size ? size : 90}rpx;
                  height: ${size ? size : 90}rpx;
                  min-width: ${size ? size : 90}rpx;
                  min-height: ${size ? size : 90}rpx;
                  border-radius: ${radius ? radius : '1000rpx'};
                  background-color: #ffffff99;`;
  if (isSelf) {
    return <Image
      className={className}
      src={src ? src : user_avatar}
      style={`${_style} `}
      mode='aspectFill'></Image>;

  } else {
    return (
      <Image
        className={className}
        src={src ? src : pawsvg}
        style={_style}
        mode='aspectFill'></Image>
    );
  }

};

export default ComAvatar

