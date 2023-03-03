import { View, Image } from '@tarojs/components';
import { FC } from 'react';
import Taro from '@tarojs/taro';
import { to } from 'await-to-js';

import { utils_get_electronic_face_sheet, utils_print_express, utils_wx_pay } from "../utils/utils";
import { getEnvDevParam } from "../utils/env";

import { Api_orders_removeOrder } from "../api/user__orders";
import { Api_wxpay_wxPay_express_refund } from "../api/a__wxpay";

import wexinpay from "../image/wexinpay.svg";
import { Api_logistics_cancelOrder } from '../api/a__logistics';

//订单操作
const ComOrderExpressOperation: FC<{
  time_limit: string | null;
  setQrCode: React.Dispatch<React.SetStateAction<boolean>>;
  item: Product_Express | null;
  setItem: React.Dispatch<React.SetStateAction<Product_Express | null>>;
  orderType: OrderType;
  order: Product_Express;
  onClick_setOrders: (e: Product_Express, crud: CURD_List) => void;
  selfInfo_S: BaseUserInfo | null;

}> = ({ time_limit, setQrCode, orderType, order, onClick_setOrders, selfInfo_S, setItem }) => {

  async function ___cancelOrder(title: string) {
    try {
      const res0 = await Taro.showModal({
        title: title,
      });
      if (res0.confirm) {
        Taro.showLoading({ title: "回收中...", mask: false });
        const res1 = await Api_logistics_cancelOrder(order);
        Taro.showToast({ title: "回收成功", icon: "none" });
        return res1;
      } else {
        throw new Error("取消面单回收");
      }
    } catch (err: any) {
      throw err;
    }
  }
  return (
    <>
      {(orderType == "待计重" || orderType == "待付款") && (
        <View className='pbt4'>
          {
            order.waybillId ?
              <View className='pbt6 pr10 oo cccplh' hoverClass='bccbacktab'
                onClick={async () => {
                  const res = await ___cancelOrder("您确定要回收该面单号吗？");
                  onClick_setOrders(res, "UPDATE");
                  // 删除
                }}>回收面单→删除/修改信息</View> :
              <View className='dbtc'>
                <View className='pbt6 pr10 oo cccplh' hoverClass='bccbacktab'
                  onClick={async () => {
                    Taro.showModal({
                      content: "您确定要删除该订单吗？",
                      success: async (e) => {
                        if (e.confirm) {
                          Taro.showLoading({ title: "删除中...", mask: false });
                          const res = await Api_orders_removeOrder(order);
                          onClick_setOrders(res, "DELETE");
                          Taro.showToast({ title: "删除成功", icon: "success" });
                        }
                      },
                    });
                  }}>
                  删除
                </View>
                <View
                  className='cccgreen pbt6 pl10 oo'
                  hoverClass='bccbacktab'
                  onClick={() => { setItem(order); }}>
                  修改信息
                </View>
              </View>
          }


        </View>
      )}
      {order.self_OPENID === order?.regiment_OPENID && orderType === "待付款" && (
        <View className='pb4 dbtc'>
          <View className='cccplh'>下单人：团长自己</View>
          <View
            className='pbt6 prl10 oo bccyellow dxy'
            hoverClass='bccyellowtab'
            onClick={async () => {
              let _order = order;
              // 支付前检查 是否已经解除时间限制 是否有电子面单号

              if (!time_limit && !order.waybillId) { // 没有时间限制 也没有 面单号
                const [err4, res4] = await to(utils_get_electronic_face_sheet(selfInfo_S!, order));
                if (err4) {
                  Taro.showToast({ title: err4.message, icon: "none" });
                  return;
                } else {
                  _order = res4;
                }
              }

              //微信支付 - 必然有重量 - 必然有面单号
              const [err5, res5] = await to(utils_wx_pay(_order));
              if (err5) {
                Taro.showToast({ title: err5.message, icon: "none" });
                return;
              }

              onClick_setOrders(res5, "DELETE");
              Taro.hideLoading();
              if (time_limit) {
                Taro.showModal({
                  title: "支付成功",
                  content: `订单移入"待付款"`,
                  confirmText: "稍后打印",
                  showCancel: false,
                  success: () => null
                });
              } else {
                Taro.showModal({
                  title: "支付成功",
                  content: `订单移入"待付款"`,
                  confirmText: "立即打印",
                  cancelText: "稍后打印",
                  success: async (e) => {
                    if (e.confirm) {
                      if (res5.waybillId) {
                        // 有电子面单号，直接打印
                        utils_print_express(res5, selfInfo_S!);
                      }
                    }
                  }
                });
              }

            }}>
            <Image className='mr6' style='width: 1rem; height: 1rem;transform: scale(1.2);' src={wexinpay}></Image>
            支付
          </View>
        </View>
      )}
      {order.self_OPENID !== order?.regiment_OPENID && orderType === "待付款" && (
        <View className='pb4 dbtc'>
          <View className='cccplh'>下单人：用户</View>
          <View
            className='pbt6  prl10 oo bccyellow dxy'
            hoverClass='bccyellowtab'
            onClick={() => setQrCode(true)}>
            收款码
          </View>
        </View>
      )}
      {orderType == "已付款" && (
        <View className='ww dbtc pb4'>
          {order.waybillId ?
            <View className='cccplh pr10 pbt6 oo' hoverClass='bccbacktab'
              onClick={async () => {
                const res = await ___cancelOrder("您确定要回收该面单号并退款吗？");
                onClick_setOrders(res, "UPDATE");
                Taro.showLoading({ title: "退款中...", mask: true });
                const [err0] = await to(Api_wxpay_wxPay_express_refund({ ...res, ...getEnvDevParam({ totalFee: 1 }) }));
                if (err0) {
                  Taro.showToast({ title: `${err0.message}`, icon: "none" });
                  return;
                }
                onClick_setOrders(res, "DELETE");
                Taro.hideLoading();
                Taro.showModal({ title: "退款操作成功", content: `订单移入"已退款"`, showCancel: false, success: () => { } });
              }}>
              回收面单→退款
            </View> :
            <View className='cccplh pr10 pbt6 oo' hoverClass='bccbacktab'
              onClick={() => {
                Taro.showModal({
                  content: "您确定要退款?",
                  confirmText: "确认退款",
                  success: async (e) => {
                    if (e.confirm) {
                      Taro.showLoading({ title: "退款中...", mask: true });
                      const [err0] = await to(Api_wxpay_wxPay_express_refund({ ...order, ...getEnvDevParam({ totalFee: 1 }) }));
                      if (err0) {
                        Taro.showToast({ title: `${err0.message}`, icon: "none" });
                        return;
                      }
                      onClick_setOrders(order, "DELETE");
                      Taro.hideLoading();
                      Taro.showModal({ title: "退款操作成功", content: `订单移入"已退款"`, showCancel: false, success: () => { } });
                    }
                  }
                });
              }}>退款</View>
          }
          {order.is_cancel_order ? <View className='pbt6 cccprice'>已付款面单已经回收只能进行退款操作</View> : (
            !time_limit ?
              (order.waybillId ?
                <View className='cccgreen pl10 pbt6 oo' hoverClass='bccbacktab'
                  onClick={async () => {
                    const [err0, res0] = await to(utils_print_express(order, selfInfo_S!));
                    if (!err0) {
                      onClick_setOrders(res0, "UPDATE");
                    }
                  }}>
                  打印{order.print_times}次
                </View> :
                <View className='cccgreen pl10 pbt6 oo' hoverClass='bccbacktab' onClick={async () => {
                  const [err0, res0] = await to(utils_get_electronic_face_sheet(selfInfo_S!, order));
                  if (!err0) {
                    onClick_setOrders(res0, "UPDATE");
                  }
                }}>
                  获取电子面单
                </View>
              ) : <View className='dy'>
                <View className='mr4 cccplh'>已打印{order.print_times}次</View>
                <View className='cccprice'>暂不可打印</View>
              </View>
          )}
        </View>
      )}
    </>
  );
};

export default ComOrderExpressOperation;
