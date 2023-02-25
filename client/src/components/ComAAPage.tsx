import { CommonEventFunction, ScrollView, View } from '@tarojs/components';
import { FC } from 'react';

const ComAAPage: FC<{
  children: JSX.Element | JSX.Element[];
  refresherBackground?: string;
  refresherDefaultStyle?: string;
  refresherTriggered?: boolean;
  refresherEnabled?: boolean;
  onRefresherRefresh?: CommonEventFunction;
  className?: string;
}> = ({
  children,
  className,
  refresherBackground,
  refresherDefaultStyle,
  refresherTriggered,
  refresherEnabled,
  onRefresherRefresh
}) => {
    const height = "100vh";
    return (
      <View className={className} style={{
        display: "flex", flexDirection: "column", height: height, minHeight: height, maxHeight: height, overflow: 'hidden'
      }}>
        {(children instanceof Array) ? children[0] : children}
        <ScrollView style={{ flex: 1, overflow: "hidden" }}
          refresherBackground={refresherBackground}
          refresherDefaultStyle={refresherDefaultStyle}
          refresherTriggered={refresherTriggered}
          refresherEnabled={refresherEnabled}
          onRefresherRefresh={onRefresherRefresh}
          scrollY>
          {(children instanceof Array) ? children[1] : children}
        </ScrollView>
        {(children instanceof Array) ? children[2] : children}
      </View >
    );
  };
export default ComAAPage;
