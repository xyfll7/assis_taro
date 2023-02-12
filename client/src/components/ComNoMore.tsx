import { View } from "@tarojs/components";
import { FC } from "react";

const ComNoMore: FC<{ isLoadMore: boolean | null; }> = ({ isLoadMore }) => {
  return (
    <View className='dxy fs08 cccplh mt10'>
      {isLoadMore === true && <View className='dy'><View className='weui-loading-small'></View> 加载更多...</View>}
      {isLoadMore === null && "没有更多了"}
    </View>
  );
};
export default ComNoMore;
