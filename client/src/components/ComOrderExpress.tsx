import { View, Navigator, Label, Button } from "@tarojs/components";
import Taro from "@tarojs/taro";
import classNames from "classnames";
import { formatDistance } from "date-fns";
import { zhCN } from 'date-fns/locale';
import React, { FC } from "react";
import { PayStatus } from "../a_config";
import { utils_addressInfoToString } from "../utils/utils";
import ComAvatar from "./ComAvatar";
import { useHook_selfInfo_show } from "../utils/useHooks";


const ComOrderExpress: FC<{
  className?: string;
  item: Product_Express;
  children?: React.ReactNode;
  isHidePath?: boolean;
}> = ({ className, item, children, isHidePath }) => {
  const [selfInfo_S] = useHook_selfInfo_show({});
  return (
    <View className={classNames("bccwhite prl10 o10 mb10", className)}>
      {selfInfo_S && selfInfo_S.OPENID !== item.regiment_OPENID &&
        <View className='pt10 dy'>
          <ComAvatar size={48} src={item.regiment_avatar}></ComAvatar>
          <View className='ml6 dy'>
            <View>{item.regiment_name}</View>
            <View className='ml6 cccplh'>(团长) 为您服务</View>
          </View>
        </View>
      }
      <View className='pt10'>
        <View className='dbtc'>
          <View className='dy www55 nw1'>
            <View className='fwb  nw1'>
              {item.sendMan?.name} {item.sendMan?.mobile}
            </View>
            <View className='ml6 cccplh fs08'>(寄)</View>
          </View>
          {item.timestamp_update &&
            <View className='cccplh fs08'>{formatDistance(item.timestamp_update!, new Date(), { addSuffix: true, locale: zhCN })}</View>
          }
        </View>

        <View className='cccplh nw2'>{utils_addressInfoToString(item.sendMan)} </View>
      </View>
      <View className='pt10 '>
        <View className='dy'>
          <View className='fwb'>
            {item.recMan?.name} {item.recMan?.mobile}
          </View>
          <View className='ml6 cccplh fs08'>(收)</View>
        </View>

        <View className='cccplh nw2'>{utils_addressInfoToString(item.recMan)} </View>
      </View>

      <View className='dbtc mt10'>
        <View className={classNames("dy", {
          pb10: !Boolean(item.waybillId) && (!Boolean(children) ||
            !React.Children.toArray(children).reduce((_, e) => e ? true : false, false)) ? true : false
        })}>
          <View className='mr6'> 重量: {item.weight}</View>
          <View className='mr6'> 价格: {item.totalFee! / 100}</View>
          <>
            {item.payStatus == PayStatus.PAY0 && <View className='cccprice'>待计重</View>}
            {item.payStatus == PayStatus.PAY1 && <View className='cccorange'>待付款</View>}
            {item.payStatus == PayStatus.PAY2 && <View className='cccgreen'>已付款</View>}
            {item.payStatus == PayStatus.PAY3_ && <View className='cccprice'>退款中</View>}
            {item.payStatus == PayStatus.PAY3 && <View >已退款</View>}
          </>
        </View>
        <View
          className='cccgreen pl10 pbt6  oo'
          hoverClass='bccbacktab'
          onClick={() => {
            Taro.navigateTo({
              url: "/pages_user/user_express",
              success: (e) => {
                e.eventChannel.emit('cloneExpress', item);
              }
            });
          }}>克隆</View>
      </View>

      {item.waybillId && (
        <View className='dbtc pbt4'>
          <View className='dy'>
            <View className='nw'>
              {item.deliveryName?.slice(0, 2)} {item.waybillId}
            </View>
            <View className='pbt6 pl10 cccgreen oo nw' hoverClass='bccbacktab'
              onClick={() => {
                Taro.setClipboardData({
                  data: item.waybillId!,
                  success: () => {
                    Taro.showToast({ title: `复制成功`, icon: "none" });
                  }
                });
              }}>复制</View>
          </View>
          <View className='dy'>
            {!isHidePath ?
              <Navigator
                url={`/pages_user/user_express_path?express=${JSON.stringify(item)}`}
                className='cccgreen pl10 pbt6 oo nw'
                hoverClass='bccbacktab'>轨迹</Navigator> : null
            }
            <Label for={item._id! as string}>
              <View className='pl10 cccgreen pbt6 oo nw' hoverClass='bccbacktab'>分享</View>
              <Button className='dsn' id={item._id! as string} openType='share'></Button>
            </Label>
          </View>
        </View>
      )
      }
      {children}
    </View >
  );
};
export default ComOrderExpress;
