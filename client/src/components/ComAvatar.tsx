import { Image } from '@tarojs/components';
import { FC, useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import logo from "../image/logo.svg";
import user_avatar from "../image/user_avatar.png";

const ComAvatar: FC<{
  style?: string;
  className?: string;
  src?: string;
  size?: number;
  radius?: string;
  isSelf?: boolean;
  isShowBack?: boolean;
  timestamp?: string,
  onClick?: () => void;
}> = ({ style, className, src, size, radius, isSelf = false, isShowBack = true, onClick, timestamp }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  useEffect(() => {
    if (src && src.includes("cloud://") && timestamp) {
      Taro.cloud.getTempFileURL({
        fileList: [src!],
        success: (res) => {
          if (res.errMsg === "cloud.getTempFileURL:ok") {
            setImageUrl(`${res.fileList[0].tempFileURL}?t=${timestamp}`);
          }
        }
      });
    } else if (isSelf) {
      setImageUrl(src ?? user_avatar);
    } else {
      setImageUrl(src ?? logo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, timestamp]);

  const _style = `${style};
                  width: ${size ? size : 90}rpx;
                  height: ${size ? size : 90}rpx;
                  min-width: ${size ? size : 90}rpx;
                  min-height: ${size ? size : 90}rpx;
                  border-radius: ${radius ? radius : '1000rpx'};
                  background-color: ${isShowBack ? '#ffffff99;' : ''}`;
  return (
    <Image
      className={className}
      src={imageUrl ?? ""}
      style={_style}
      onClick={onClick}
      mode='aspectFill'></Image>
  );

};

export default ComAvatar

