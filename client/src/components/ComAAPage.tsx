import { CommonEventFunction, ScrollView, View } from '@tarojs/components';
import { FC, useRef } from 'react';
import getEnv from '../utils/env';
import ComLoading from "../components/ComLoading";

const ComAAPage: FC<{
  children?: React.ReactNode;
  refresherBackground?: string;
  refresherDefaultStyle?: string;
  refresherTriggered?: boolean;
  refresherEnabled?: boolean;
  onRefresherRefresh?: CommonEventFunction;
  onScrollToLower?: () => Promise<void>;
  className?: string;
  selfInfo_S: BaseUserInfo | null;
}> = ({
  children,
  className,
  refresherBackground,
  refresherDefaultStyle,
  refresherTriggered,
  refresherEnabled,
  onScrollToLower,
  onRefresherRefresh,
  selfInfo_S
}) => {
    const height = "100vh";
    const isScrolling = useRef(false);
    const env = getEnv();
    let _children = [];
    if (children instanceof Array) {
      _children = children.filter(e => e);
    }
    const isSystemUpdate = (
      Number(env.version.replaceAll(".", "")) >= Number(selfInfo_S?.serveVersion?.replaceAll(".", ""))
      || env.version === ""
    );
    return (<>
      {selfInfo_S === null && <ComLoading isIndex></ComLoading>}
      {selfInfo_S && !isSystemUpdate && <ComLoading isIndex isSystemUpdate></ComLoading>}
      {selfInfo_S && isSystemUpdate &&
        <View className={className} style={{
          display: "flex",
          flexDirection: "column",
          height: height,
          minHeight: height,
          maxHeight: height,
          overflow: 'hidden'
        }}>
          {_children[0]}
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
              {_children[1]}
            </View>
          </ScrollView>
          {_children.filter((_, i) => i > 1)}
        </View >
      }
    </>);
  };
export default ComAAPage;
