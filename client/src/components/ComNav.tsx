import React, { FC } from 'react';
import { View } from '@tarojs/components';
import { utils_get_capsule } from '../utils/utils';

const ComNav: FC<{
  className?: string;
  isSticky?: boolean;

  isHeight?: boolean;
  isLeft?: boolean;
  isRight?: boolean;
  children?: React.ReactNode;
}> = ({ className, isSticky, isHeight, isLeft, isRight, children }) => {
  const capsule = utils_get_capsule(false);
  return (
    <View className={className} style={`
            z-index:9;
            position: ${isSticky ? 'sticky;top: 0;' : ''};
            padding-top:${capsule?.Capsule.top ?? 0}px;
            padding-left: ${isLeft ? (capsule?.capLeft ?? 0) : 0}px;
            padding-right: ${isRight ? (capsule?.Capsule?.width ?? 0) + (capsule?.capLeft ?? 0) : 0}px;
            `}>
      {
        React.Children.map(children, (child, index) => {
          return <>
            {index === 0 &&
              <View style={`height: ${isHeight ? (capsule?.Capsule.height ?? 0) : 'auto'}px;`}>{child}</View>
            }
            {index !== 0 && <View>{child}</View>}
          </>;
        })
      }
    </View>
  );
};

export default ComNav


