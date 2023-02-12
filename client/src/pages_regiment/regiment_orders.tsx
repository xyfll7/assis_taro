import Taro, { useShareAppMessage } from "@tarojs/taro";
import { Input, PageContainer, ScrollView, View, Image } from "@tarojs/components";
import debounce from "lodash/debounce";
import { Popup as VPopup } from "@antmjs/vantui";
import { to } from "await-to-js";
import { FC, useCallback, useEffect, useState } from "react";
import { Api_orders_removeOrder, Api_orders_getOrderList, Api_orders_updateOrder_express } from "../api/user__orders";
import { utils_calc_express_totalFee, utils_generate_order, utils_get_electronic_face_sheet, utils_get_logistics, utils_get_printer, utils_print_express, utils_wx_pay } from "../utils/utils";
import { useHook_effect_update, useHook_getTimeLimit, useHook_selfInfo_show } from "../utils/useHooks";
import { PayStatus } from "../a_config";
import wexinpay from "../image/wexinpay.svg";
import { Api_wxpay_wxPay_express_refund } from "../api/a__wxpay";
import { Api_local_reachable } from "../api/aa__local";
import { getEnvDevParam } from "../utils/env";
import share_logo from "../image/share_logo.jpeg";

import ComNav from "../components/ComNav";
import ComNavBar from "../components/ComNavBar";
import ComSearcher from "../components/ComSearcher";
import ComFooter from "../components/ComFooter";
import ComListTypeSelector from "../components/ComListTypeSelector";
import ComPrintNotice from '../components/ComPrintNotice';
import ComLoading from "../components/ComLoading";
import ComEmpty from "../components/ComEmpty";
import ComOrderExpress from "../components/ComOrderExpress";
import ComHeaderBar from '../components/ComHeaderBar';


definePageConfig({ navigationStyle: "custom", enableShareAppMessage: true });

const qrCode_collection_url = "https://636c-cloud1-8gfby1gac203c61c-1306790653.tcb.qcloud.la/线上_收款码.jpeg";

const Index_regiment_orders = () => {
  useShareAppMessage((res) => {
    if (res.from === "button") {
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
  const router = Taro.getCurrentInstance().router;
  //#region 状态/方法
  const [orderType, setOrderType] = useState<OrderType>((() => {
    if (router?.params.orderType === "1") {
      return "待付款";
    } else if (router?.params.orderType === "2") {
      return "已付款";
    } else {
      return "待计重";
    }
  })());
  const [orders, setOrders] = useState<Product_Express[] | null>(null);
  const [selfInfo_S] = useHook_selfInfo_show({});
  const time_limit = useHook_getTimeLimit(selfInfo_S?.print_time_limit?.limit_time!);

  const [order, setOrder] = useState<Product_Express | null>(null);
  const [show, setShow] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [qrCode, setQrCode] = useState<boolean>(false);
  useEffect(() => {
    selfInfo_S !== null && getOrderList___();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selfInfo_S]);
  useEffect(() => {
    selfInfo_S !== null && getOrderList___(searchValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderType]);
  useEffect(() => setShow(Boolean(order)), [order]);
  const getOrderList___ = async (str?: string) => {
    setOrders(null);
    const res = await Api_orders_getOrderList(
      {
        regiment_OPENID: selfInfo_S?.OPENID,
        payStatus: (() => {
          switch (orderType) {
            case "待计重":
              return [PayStatus.PAY0];
            case "待付款":
              return [PayStatus.PAY1];
            case "已付款":
              return [PayStatus.PAY2];
            case "已退款":
              return [PayStatus.PAY3_, PayStatus.PAY3];
            default:
              return [];
          }
        })(),
      },
      str
    );
    setOrders(res);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getOrderList_Callback = useCallback(
    debounce((str: string) => getOrderList___(str), 1000),
    [orderType]);
  useHook_effect_update(() => {
    getOrderList_Callback(searchValue);
  }, [searchValue]);
  //#endregion
  return (
    <>
      <VPopup className='www90 dcl pbt10' show={Boolean(qrCode)} round onClose={() => setQrCode(false)}>
        <View className='dcl mt10'>
          <View className='mb4'>请顾客扫此二维码支付</View>
          <View className='tac mrl10 prl10 cccplh'>可将此二维码保存打印 </View>
          <View className='tac mrl10 prl10 cccplh'>顾客扫此二维码打开“待付款”订单列表 </View>
          <Image src={qrCode_collection_url} className='wwwhhh50 mbt10 img-back-loading o10 bccback'></Image>
          <View
            className='prl10 pbt6 oo bccyellow'
            hoverClass='bccyellowtab'
            onClick={() => {
              Taro.showLoading({ title: "保存中...", mask: true });
              Taro.downloadFile({
                url: qrCode_collection_url,
                filePath: `${Taro.env.USER_DATA_PATH}/收款码.jpeg`,
                success: (e) => {
                  Taro.saveImageToPhotosAlbum({
                    filePath: e.filePath,
                    success(ee) {
                      if (ee.errMsg === "saveImageToPhotosAlbum:ok") {
                        Taro.showToast({ title: "保存成功", icon: "none" });
                      } else {
                        Taro.showToast({ title: "保存失败", icon: "none" });
                      }
                    },
                    fail: () => Taro.showToast({ title: "保存失败", icon: "none" }),
                  });
                },
                fail: () => Taro.showToast({ title: "保存失败", icon: "none" }),
              });
            }}>
            保存二维码
          </View>
          <View className='mt10 prl10 pbt6 oo cccplh' hoverClass='bccbacktab' onClick={() => setQrCode(false)}>
            关闭
          </View>
        </View>
      </VPopup>
      <ScrollView scrollY className='hhh99'>
        <View>
          <ComNav className='bccback' isHeight isSticky>
            <ComNavBar className='prl10' title='订单管理(团长)'></ComNavBar>
            <ComListTypeSelector typeList={["待计重", "待付款", "已付款", "已退款"]} orderType={orderType} setOrderType={(e) => setOrderType(e)}>
              <View className='mr10 pr10'>
                <View
                  className='cccgreen pbt6 pl10 oo'
                  hoverClass='bccbacktab'
                  onClick={async () => setQrCode(true)}>
                  收款码
                </View>
              </View>
            </ComListTypeSelector>
            <ComSearcher searchValue={searchValue} setSearchValue={setSearchValue} onGetOrderList={getOrderList___}></ComSearcher>
            {orderType !== "已退款" && <ComPrintNotice className='pb10' time_limit={time_limit}></ComPrintNotice>}
          </ComNav>
          {orders == null ? <ComLoading></ComLoading> : null}
          {orders?.length == 0 ? <ComEmpty msg='没有数据'></ComEmpty> : null}
          {orders?.map((e) => {
            switch (e.product_type) {
              case "express":
                return (
                  <OrderExpressCard
                    time_limit={time_limit}
                    setQrCode={setQrCode}
                    item={order}
                    setItem={setOrder}
                    key={e._id}
                    selfInfo_S={selfInfo_S}
                    orderType={orderType}
                    order={e as Product_Express}
                    onClick_setOrders={(ee, crud) => {
                      if (crud === "DELETE") {
                        setOrders(orders.filter((eee) => ee._id !== eee._id));
                      }
                      if (crud === "UPDATE") {
                        setOrders(orders.map((eee) => eee._id === ee._id ? ee : eee));
                      }

                    }}></OrderExpressCard>
                );
              default:
                return null;
            }
          })}
        </View>
        {orders && orders?.length > 0 && <ComFooter></ComFooter>}
        <PageContainer
          show={show}
          round
          onLeave={() => {
            setShow(false);
            setOrder(null);
          }}>
          <OrderInfoSetting time_limit={time_limit} orderType={orderType} setQrCode={setQrCode} selfInfo_S={selfInfo_S} setOrder={setOrder} setOrders={setOrders} orders={orders} order={order}></OrderInfoSetting>
        </PageContainer>
      </ScrollView>
    </>
  );
};

export default Index_regiment_orders;

//#region 修改信息弹窗 订单设置-设置重量-生成面单号-指定打印机
const OrderInfoSetting: FC<{
  time_limit: string | null;
  orderType: OrderType;
  setQrCode: React.Dispatch<React.SetStateAction<boolean>>;
  selfInfo_S: BaseUserInfo | null;
  order: Product_Express | null;
  setOrder: React.Dispatch<React.SetStateAction<Product_Express | null>>;
  orders: Product_Express[] | null;
  setOrders: React.Dispatch<React.SetStateAction<Product_Express[] | null>>;
}> = ({ time_limit, selfInfo_S, orderType, order, setOrder, orders, setOrders, setQrCode }) => {
  const [weight, setWeight] = useState("");
  const [printer, setPrinter] = useState<Printer_Info | null>(null);
  useEffect(() => {
    setWeight(order?.weight ? String(order?.weight) : "");
    if (order?.printer) {
      setPrinter(order?.printer);
    } else if (selfInfo_S?.regiment_info?.printers?.length === 1) {
      setPrinter(selfInfo_S?.regiment_info?.printers[0]);
    }
  }, [order, selfInfo_S]);

  return (
    <View className='bccback hhh70'>
      <View className='mrl10'>
        <ComHeaderBar title='修改信息' onClick={() => setOrder(null)}></ComHeaderBar>
        <View className='bccwhite prl10 o10'>
          <View className='o10 pbt10 dy'>
            <View>重量：</View>
            <Input
              type='number'
              alwaysEmbed
              placeholder='请输入订单重量'
              value={weight}
              onInput={(e) => {
                const num = e.detail.value.replace(/[^0-9]/gi, "").replace(/\b(0+)/gi, "");
                setWeight(`${num} `);
                setTimeout(() => setWeight(num), 0);
              }}></Input>
          </View>
          <View className='pbt10 dbtc lit'>
            <View className='dy'>
              <View>打印机：</View>
              <View>{printer?.siid ?? "无"}</View>
            </View>
          </View>
          <View className='pbt10 dy lit'>
            <View>面单号：</View>
            <View>{order?.waybillId ?? "无"}</View>
            <View className='ml6'>{order?.deliveryName}</View>
          </View>
        </View>
      </View>

      <View className='dxy mt10'>
        <View
          className='pbt6 prl20 bccyellow oo'
          hoverClass='bccyellowtab'
          onClick={async () => {
            if (!weight) {
              Taro.showToast({ title: "请输入重量", icon: "none" });
              return;
            }
            //选择打印机
            const [err0, res0] = await to(utils_get_printer(selfInfo_S));
            if (err0) {
              Taro.showToast({ title: err0.message, icon: "none" });
              return;
            }
            if (!time_limit && !order?.waybillId) {
              // 没有电子面单号 - 选择电子面单账号
              const [err1, logistic] = await to(utils_get_logistics(selfInfo_S));
              if (err1) {
                Taro.showToast({ title: err1.message, icon: "none" });
                return;
              }
              //检查快递可达性
              Taro.showLoading({ title: "检查快递...", mask: true });
              const res2 = await Api_local_reachable({ ...order!, deliveryId: logistic.deliveryId });
              if (res2) {
                Taro.showToast({ title: res2, icon: "none", duration: 5000 });
                return;
              }
              //生成电子面单
              Taro.showLoading({ title: "生成面单", mask: true });
              const [err3, res3] = await to(
                utils_generate_order({
                  ...order!,
                  printer: res0!,

                  payStatus: PayStatus.PAY1,
                  weight: Number(weight),
                  totalFee: utils_calc_express_totalFee(Number(weight)),

                  deliveryId: logistic.deliveryId,
                  bizId: logistic.bizId,
                  deliveryName: logistic.deliveryName,
                })
              );
              if (err3) {
                Taro.showToast({ title: err3.message, icon: "none" });
                return;
              }
              ___order_update_success(res3);
            } else {
              // 有电子面单号
              Taro.showLoading({ title: "更新中...", mask: true });
              const [err4, res4] = await to(
                Api_orders_updateOrder_express({
                  ...order!,
                  printer: res0!,

                  payStatus: PayStatus.PAY1,
                  weight: Number(weight),
                  totalFee: utils_calc_express_totalFee(Number(weight)),
                })
              );
              if (err4) {
                Taro.showToast({ title: "订单更新失败", icon: "none" });
                return;
              }
              ___order_update_success(res4);
            }
            function ___order_update_success(_order: Product_Express) {
              Taro.hideLoading();
              setWeight("");
              setOrder(null);
              if (orderType === "待计重") {
                setOrders(orders!.filter((e) => e._id !== _order._id));
                Taro.showModal({
                  content: `更新成功，订单移入"待付款"`,
                  confirmText: "收款码",
                  cancelText: "稍后处理",
                  success: (e) => {
                    if (e.confirm) {
                      setQrCode(true);
                    }
                  },
                });
              } else if (orderType === "待付款") {
                setOrders(orders!.map((e) => (e._id === _order._id ? _order : e)));
                Taro.showToast({ title: "更新成功", icon: "none" });
              }
            }
          }}>
          确认
        </View>
      </View>
    </View>
  );
};
//#endregion



//#region 订单卡片
const OrderExpressCard: FC<{
  time_limit: string | null;
  setQrCode: React.Dispatch<React.SetStateAction<boolean>>;
  item: Product_Express | null;
  setItem: React.Dispatch<React.SetStateAction<Product_Express | null>>;
  orderType: OrderType;
  order: Product_Express;
  onClick_setOrders: (e: Product_Express, crud: "UPDATE" | "DELETE") => void;
  selfInfo_S: BaseUserInfo | null;

}> = ({ time_limit, setQrCode, orderType, order, onClick_setOrders, selfInfo_S, setItem }) => {

  return (
    <ComOrderExpress className='mrl10 ' item={order as Product_Express}>
      {(orderType == "待计重" || orderType == "待付款") && (
        <>
          <View className='dbtc pbt4'>
            <View className='pbt6 pr10 oo cccplh'
              hoverClass='bccbacktab'
              onClick={() => {
                Taro.showModal({
                  content: "您确定要删除该订单吗？",
                  success: async (e) => {
                    if (e.confirm) {
                      Taro.showLoading({ title: "删除中...", mask: false });
                      const res = await Api_orders_removeOrder(order);
                      onClick_setOrders(res, "DELETE");
                      Taro.hideLoading();
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
        </>
      )}
      {order.self_OPENID === order?.regiment_OPENID && orderType === "待付款" && (
        <View className='pb4 dbtc'>
          <View className='cccplh'>下单人：团长自己</View>
          <View
            className='pbt6 prl10 oo bccyellow dxy'
            hoverClass='bccyellowtab'
            onClick={async () => {
              //微信支付 - 必然有重量 - 必然有面单号
              const [err4, res4] = await to(utils_wx_pay(order));
              if (err4) {
                Taro.showToast({ title: err4.message, icon: "none" });
                return;
              }

              onClick_setOrders(res4, "DELETE");
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
                      if (res4.waybillId) {
                        utils_print_express(res4, selfInfo_S!);
                      } else {
                        const [err5, res5] = await to(utils_get_electronic_face_sheet(selfInfo_S!, order));
                        if (!err5) {
                          utils_print_express(res5, selfInfo_S!);
                        }
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
          <View className='cccgreen pr10 pbt6 oo' hoverClass='bccbacktab'
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

          {!time_limit ?
            (order.waybillId ?
              <View className='cccgreen pl10 pbt6 oo' hoverClass='bccbacktab' onClick={() => utils_print_express(order, selfInfo_S!)}>
                打印
              </View> :
              <View className='cccgreen pl10 pbt6 oo' hoverClass='bccbacktab' onClick={async () => {
                const [err0, res0] = await to(utils_get_electronic_face_sheet(selfInfo_S!, order));
                if (!err0) {
                  onClick_setOrders(res0, "UPDATE");
                }
              }}>
                获取电子面单
              </View>
            ) : <View className='cccprice'>暂不可打印</View>
          }
        </View>
      )}
    </ComOrderExpress>
  );
};
//#endregion
