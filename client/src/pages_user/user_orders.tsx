import { View, Image } from "@tarojs/components";
import { useEffect, useState } from "react";
import Taro, { useShareAppMessage } from "@tarojs/taro";
import { to } from "await-to-js";

import ComLoading from "../components/ComLoading";
import ComEmpty from "../components/ComEmpty";
import ComOrderExpress from "../components/ComOrderExpress";
import { Api_orders_getOrderList, Api_orders_removeOrder } from "../api/user__orders";
import { useHook_selfInfo_show } from "../utils/useHooks";
import wexinpay from "../image/wexinpay.svg";
import ComNav from "../components/ComNav";
import ComNavBar from "../components/ComNavBar";
import { PayStatus } from "../a_config";
import { utils_wx_pay } from "../utils/utils";
import { Api_printer_printExpress } from "../api/a__printer";
import ComListTypeSelector from "../components/ComListTypeSelector";
import share_logo from "../image/share_logo.jpeg";

definePageConfig({
  navigationBarTitleText: "我的订单",
  navigationStyle: "custom",
  enableShareAppMessage: true,
});

const Index_user_orders = () => {
  useShareAppMessage((res) => {
    if (res.from === "button") {
      // 来自页面内转发按钮
      return {
        title: `${selfInfo_S?.name} 分享给您的快递`,
        path: `/pages_user/user_express_path?express_share_id=${(res?.target as any)?.id}`,
        imageUrl: share_logo,    // * 支持PNG及JPG * 显示图片长宽比是 5:4
      };
    }
    return {
      title: "小象团长助手",
      path: "/pages/index/index",
      imageUrl: share_logo,    // * 支持PNG及JPG * 显示图片长宽比是 5:4
    };
  });

  const [orderType, setOrderType] = useState<OrderType>("待付款");
  const [selfInfo_S] = useHook_selfInfo_show({});
  const [orders, setOrders] = useState<ProductBase[] | null>(null);
  useEffect(() => {
    if (selfInfo_S) {
      getOrderList___();
    } else {
      Taro.showModal({ content: "您尚未登录", showCancel: false, confirmText: "返回首页", success: () => Taro.reLaunch({ url: "/pages/index/index" }) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderType]);
  const getOrderList___ = async () => {
    setOrders(null);
    const res = await Api_orders_getOrderList({
      self_OPENID: selfInfo_S?.OPENID,
      payStatus: ((): PayStatus[] => {
        switch (orderType) {
          case "待付款":
            return [PayStatus.PAY0, PayStatus.PAY1];
          case "已付款":
            return [PayStatus.PAY2];
          default:
            return [];
        }
      })(),
    });
    setOrders(res);
  };
  return (
    <>
      <ComNav className='bccback' isHeight isSticky>
        <ComNavBar className='prl10' title='我的订单'></ComNavBar>
        <ComListTypeSelector typeList={["待付款", "已付款"]} orderType={orderType} setOrderType={(e) => setOrderType(e)}></ComListTypeSelector>
      </ComNav>
      <View className='prl10'>
        {orders == null ? <ComLoading></ComLoading> : null}
        {orders?.length == 0 ? <ComEmpty msg='没有数据'></ComEmpty> : null}
        {orders?.map((e) => {
          switch (e.product_type) {
            case "express":
              const item = e as Product_Express;
              return (
                <ComOrderExpress key={item._id} item={item}>
                  {orderType === "待付款" && (
                    <View className='dbtc pbt4'>
                      <View
                        className='pbt6 pr10 oo cccplh'
                        hoverClass='bccbacktab'
                        onClick={() => {
                          Taro.showModal({
                            content: "您确定要删除该订单吗？",
                            success: async (ee) => {
                              if (ee.confirm) {
                                Taro.showLoading({ title: "删除中...", mask: false });
                                const res = await Api_orders_removeOrder(item);
                                setOrders(orders.filter((eee) => eee._id !== res._id));
                                Taro.hideLoading();
                              }
                            },
                          });
                        }}>
                        删除
                      </View>
                      {item.payStatus === PayStatus.PAY1 && (
                        <View
                          className='pbt6 prl10 oo bccyellow dxy'
                          hoverClass='bccyellowtab'
                          onClick={async () => {
                            //微信支付
                            const [err0, res0] = await to(utils_wx_pay(item));
                            if (err0) {
                              Taro.showToast({ title: err0.message, icon: "none" });
                              return;
                            }
                            setOrders(orders?.filter((ee) => res0._id != ee._id)!);
                            //打印订单
                            Taro.showLoading({ title: "打印中...", mask: true });
                            const print_res = await Api_printer_printExpress({ ...res0 });
                            if (print_res.code === 200) {
                              Taro.showToast({ title: `打印成功，订单移入"已付款"`, icon: "none" });
                            } else {
                              Taro.showToast({ title: `打印失败，请联系团长`, icon: "none" });
                            }
                          }}>
                          <Image className='mr6' style='width: 1rem; height: 1rem;transform: scale(1.2);' src={wexinpay}></Image>
                          支付
                        </View>
                      )}
                    </View>
                  )}
                </ComOrderExpress>
              );
            default:
              return null;
          }
        })}
      </View>
    </>
  );
};

export default Index_user_orders;


