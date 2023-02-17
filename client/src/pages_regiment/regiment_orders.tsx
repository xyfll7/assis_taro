import Taro, { useShareAppMessage } from "@tarojs/taro";
import { PageContainer, ScrollView, View, Image } from "@tarojs/components";
import debounce from "lodash/debounce";
import { Popup as VPopup } from "@antmjs/vantui";
import { to } from "await-to-js";
import { FC, useCallback, useEffect, useState } from "react";

import { PayStatus } from "../a_config";

import { utils_generate_order, utils_get_logistics, utils_get_printer } from "../utils/utils";
import { useHook_effect_update, useHook_getTimeLimit, useHook_selfInfo_show } from "../utils/useHooks";

import { Api_orders_getOrderList, Api_orders_updateOrder_express } from "../api/user__orders";
import { Api_local_reachable } from "../api/aa__local";

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
import ComWeightPrice from "../components/ComWeightPrice";
import ComOrderExpressOperation from "../components/ComOrderExpressOperation";


import share_logo from "../image/share_logo.jpeg";



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
  const [selfInfo_S] = useHook_selfInfo_show({ isRefreshSelfInfo_SEveryTime: true });
  const time_limit = useHook_getTimeLimit(selfInfo_S?.print_time_limit?.limit_time!);

  const [order, setOrder] = useState<Product_Express | null>(null);

  const [searchValue, setSearchValue] = useState("");
  const [qrCode, setQrCode] = useState<boolean>(false);

  useEffect(() => {
    selfInfo_S !== null && getOrderList___(searchValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderType]);

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
                  <ComOrderExpress className='mrl10' item={e}>
                    <ComOrderExpressOperation
                      time_limit={time_limit}
                      setQrCode={setQrCode}
                      item={order}
                      setItem={setOrder}
                      key={e._id}
                      selfInfo_S={selfInfo_S}
                      orderType={orderType}
                      order={e}
                      onClick_setOrders={(ee, crud) => {
                        if (crud === "DELETE") {
                          setOrders(orders.filter((eee) => ee._id !== eee._id));
                        }
                        if (crud === "UPDATE") {
                          setOrders(orders.map((eee) => eee._id === ee._id ? ee : eee));
                        }

                      }}></ComOrderExpressOperation>
                  </ComOrderExpress>
                );
              default:
                return null;
            }
          })}
        </View>
        {orders && orders?.length > 0 && <ComFooter></ComFooter>}
        <PageContainer
          show={Boolean(order)}
          round
          onLeave={() => {
            setOrder(null);
          }}>
          {order &&
            <OrderInfoSetting
              time_limit={time_limit}
              orderType={orderType}
              setQrCode={setQrCode}
              selfInfo_S={selfInfo_S}
              onClick_setOrder={(e) => setOrder(e)}
              order={order}
              onClick_setOrders={(ee, crud) => {
                if (crud === "DELETE") {
                  setOrders(orders!.filter((eee) => ee._id !== eee._id));
                }
                if (crud === "UPDATE") {
                  setOrders(orders!.map((eee) => eee._id === ee._id ? ee : eee));
                }
              }} ></OrderInfoSetting>
          }
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
  order: Product_Express;
  onClick_setOrder: (e: Product_Express | null) => void;
  onClick_setOrders: (e: Product_Express, crud: CURD_List) => void;
}> = ({ time_limit, selfInfo_S, orderType, order, setQrCode, onClick_setOrder, onClick_setOrders }) => {
  const [price, setPrice] = useState(order.totalFee!);
  const [weight, setWeight] = useState<number>(Number(order?.weight ?? 0));
  return (
    <View className='bccback hhh70'>
      {order &&
        <>
          <View className='mrl10'>
            <ComHeaderBar title='修改信息' onClick={() => onClick_setOrder(null)}></ComHeaderBar>
            <View className='bccwhite prl10 o10'>
              {order &&
                <ComWeightPrice className='dbtc pbt4'
                  expressForm={order}
                  weight={weight}
                  price={price}
                  onSetWeight={(e) => setWeight(e)}
                  onSetPrice={(e) => setPrice(e)}></ComWeightPrice>
              }
              <View className='pbt10 dbtc lit'>
                <View className='dy'>
                  <View>打印机：</View>
                  <View>{order.printer?.siid ?? "无"}</View>
                </View>
              </View>
              <View className='pbt10 dy lit'>
                <View>面单号：</View>
                <View>{order.waybillId ?? "无"}</View>
                <View className='ml6'>{order.deliveryName}</View>
              </View>
            </View>
          </View>

          <View className='fixed-bottom  safe-bottom dxy www100 '>
            <View
              className='pbt6 prl20 bccyellow oo mbt10'
              hoverClass='bccyellowtab'
              onClick={async () => {
                if (!weight) {
                  Taro.showToast({ title: "请输入重量", icon: "none" });
                  return;
                }
                if (!price) {
                  Taro.showToast({ title: "请获取价格", icon: "none" });
                  return;
                }
                //选择打印机
                const [err0, res0] = await to(utils_get_printer(selfInfo_S));
                if (err0) {
                  Taro.showToast({ title: err0.message, icon: "none" });
                  return;
                }
                if (!time_limit && !order.waybillId) {
                  // 没有电子面单号 - 选择电子面单账号
                  const [err1, logistic] = await to(utils_get_logistics(selfInfo_S));
                  if (err1) {
                    Taro.showToast({ title: err1.message, icon: "none" });
                    return;
                  }
                  //检查快递可达性
                  Taro.showLoading({ title: "检查快递...", mask: true });
                  const res2 = await Api_local_reachable({ ...order, deliveryId: logistic.deliveryId });
                  if (res2) {
                    Taro.showToast({ title: res2, icon: "none", duration: 5000 });
                    return;
                  }
                  //生成电子面单
                  Taro.showLoading({ title: "生成面单", mask: true });
                  const [err3, res3] = await to(
                    utils_generate_order({
                      ...order,
                      printer: res0,

                      payStatus: PayStatus.PAY1,
                      weight: Number(weight),
                      totalFee: Number(price),

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
                  const [err4, res4] = await to(Api_orders_updateOrder_express({
                    ...order,
                    printer: res0,

                    payStatus: PayStatus.PAY1,
                    weight: Number(weight),
                    totalFee: Number(price),
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
                  onClick_setOrder(null);
                  switch (orderType) {
                    case "待计重":
                      onClick_setOrders(_order, "DELETE");
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
                      return;
                    case "待付款":
                      onClick_setOrders(_order, "UPDATE");
                      Taro.showToast({ title: "更新成功", icon: "none" });
                      return;
                  }
                }
              }}>
              确认
            </View>
          </View>
        </>

      }

    </View>
  );
};
//#endregion

