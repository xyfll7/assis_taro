import { CommonEventFunction, ScrollView, View } from '@tarojs/components';
import { FC } from 'react';

const ComAAPage: FC<{
  children?: JSX.Element | JSX.Element[];
  refresherBackground?: string;
  refresherDefaultStyle?: string;
  refresherTriggered?: boolean;
  refresherEnabled?: boolean;
  onRefresherRefresh?: CommonEventFunction;
  onScrollToLower?: CommonEventFunction;
  className?: string;
}> = ({
  children,
  className,
  refresherBackground,
  refresherDefaultStyle,
  refresherTriggered,
  refresherEnabled,
  onScrollToLower,
  onRefresherRefresh
}) => {
    const height = "100vh";
    return (
      <View className={className} style={{
        display: "flex", flexDirection: "column", height: height, minHeight: height, maxHeight: height, overflow: 'hidden'
      }}>
        {(children instanceof Array) ? children[0] : children}
        <ScrollView style={{ flex: 1, overflow: "hidden" }}
          refresherThreshold={0}
          enhanced
          showScrollbar={false}
          refresherBackground={refresherBackground}
          refresherDefaultStyle={refresherDefaultStyle}
          refresherTriggered={refresherTriggered}
          refresherEnabled={refresherEnabled}
          onRefresherRefresh={onRefresherRefresh} // 下拉刷新被触发
          onScrollToLower={onScrollToLower} // 上拉加载
          scrollY>
          <View className='p10'>
            {(children instanceof Array) ? children[1] : null}
          </View>
        </ScrollView>
        {(children instanceof Array) ? children[2] : null}
        {(children instanceof Array) ? children[3] : null}
      </View >
    );
  };
export default ComAAPage;
