import { View, Navigator } from "@tarojs/components";
import { FC } from "react";
import { useOrdersNotice } from "../store/OrdersNoticeProvider";

const ComOrderNotice: FC<{ className?: string, hoverClass?: string; }> = ({ className, hoverClass }) => {
  const [orders_S] = useOrdersNotice();
  return (
    <View className={className} hoverClass={hoverClass}>
      {orders_S === null && <View className='dy' >
        <View className='lh100'><View className='vbh'>o</View> </View>
        <View className='dy lh100'>
          <View className='weui-loading-small '></View>
        </View>
        <View className='lh100'><View className='vbh'>o</View> </View>
      </View>}
      {orders_S && orders_S.length !== 0 && (
        <Navigator
          className='prl10  oo  nw mr6  dy cccprice'
          url='/pages_user/user_orders'
          hoverClass='none'>
          🎉 待付款
          {orders_S!.length && (
            <View className='cccprice ml2'>+{orders_S!.length}</View>
          )}
        </Navigator>)
      }
      {orders_S !== null && orders_S.length === 0 &&
        <Navigator className='oo prl10' url='/pages_user/user_orders' hoverClass='none'>🎉 我的订单</Navigator>
      }
    </View>
  );
};
export default ComOrderNotice;
