import { CommonEventFunction, ScrollView, View } from '@tarojs/components';
import { FC, useRef } from 'react';

const ComAAPage: FC<{
  children?: JSX.Element | JSX.Element[];
  refresherBackground?: string;
  refresherDefaultStyle?: string;
  refresherTriggered?: boolean;
  refresherEnabled?: boolean;
  onRefresherRefresh?: CommonEventFunction;
  onScrollToLower?: () => Promise<void>;
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
    const isScrolling = useRef(false);
    return (
      <View className={className} style={{
        display: "flex", flexDirection: "column", height: height, minHeight: height, maxHeight: height, overflow: 'hidden'
      }}>
        {(children instanceof Array) ? children[0] : children}
        <ScrollView style={{ flex: 1, overflow: "hidden", height: "100%" }}
          refresherThreshold={0}
          enhanced
          showScrollbar={false}
          refresherBackground={refresherBackground}
          refresherDefaultStyle={refresherDefaultStyle}
          refresherTriggered={refresherTriggered}
          refresherEnabled={refresherEnabled}
          onRefresherRefresh={onRefresherRefresh} // 下拉刷新被触发
          onScrollToLower={async () => {
            if (isScrolling.current === true) {
              return;
            }
            isScrolling.current = true;
            onScrollToLower && await onScrollToLower();
            isScrolling.current = false;
          }} // 上拉加载
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
