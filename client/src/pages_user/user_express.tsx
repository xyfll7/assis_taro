import { Popup as VPopup } from "@antmjs/vantui";
import classNames from "classnames";
import { to } from "await-to-js";
import AddressParse from "address-parse";
import { View, Navigator, Input, RootPortal, Image, Textarea, Label, Button, ScrollView } from "@tarojs/components";
import Taro, { useShareAppMessage } from "@tarojs/taro";
import React, { FC, useEffect, useRef, useState } from "react";
import { Api_orders_addOrder } from "../api/user__orders";
import { useOrdersNotice } from "../store/OrdersNoticeProvider";
import { useHook_getTimeLimit, useHook_selfInfo_show } from "../utils/useHooks";
import { Api_local_reachable } from "../api/aa__local";

import wexinpay from "../image/wexinpay.svg";

import getEnv from "../utils/env";
import { PayStatus } from "../a_config";
import share_logo from "../image/share_logo.jpeg";
import { utils_deep, utils_generate_order, utils_get_logistics, utils_init_product_express, utils_print_express, utils_validate_express, utils_wx_pay } from "../utils/utils";

import ComPrintNotice from '../components/ComPrintNotice';
import ComAvatar from "../components/ComAvatar";
import ComNav from "../components/ComNav";
import ComNavBar from "../components/ComNavBar";
import ComAddress, { RefAddress } from "../components/ComAddress";
import ComLoading from "../components/ComLoading";
import ComWeightPrice from "../components/ComWeightPrice";

definePageConfig({ navigationStyle: "custom", enableShareAppMessage: true, disableScroll: true });
const Index_user_express = () => {
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

  const [selfInfo_S] = useHook_selfInfo_show({ isRefreshSelfInfo_SEveryTime: true });
  const [expressForm, setExpressForm] = useState<Product_Express>(utils_deep(utils_init_product_express()));
  const refAddress = useRef<RefAddress>(null);
  const onSetExpressForm = (mantype: AddressManType, data: AddressInfo) => {
    function make_addr____(): Product_Express {
      if (mantype === "rec") {
        const _recMan: AddressInfo = { ...expressForm.recMan, ...data };
        return {
          ...expressForm,
          recMan: _recMan,
          describe: `快递-发往${_recMan.province}${_recMan.city}`,
        };
      } else {
        const _sendMan = { ...expressForm.sendMan, ...data };
        return {
          ...expressForm,
          sendMan: _sendMan,
        };
      }
    }
    setExpressForm({ ...make_addr____() });
  };
  useEffect(() => {
    let _expressForm: Product_Express = utils_deep({
      ...expressForm,
      regiment_name: selfInfo_S?.regiment_info?.name,
      regiment_avatar: selfInfo_S?.regiment_info?.avatar ?? "",
    });
    if (selfInfo_S?.address_info) {
      if (selfInfo_S.regiment_is !== 1) {
        _expressForm = {
          ..._expressForm,
          sendMan: { ..._expressForm.sendMan!, ...selfInfo_S.address_info },
        };
      }
      if (getEnv().envVersion === "develop") {
        console.log("JJ", _expressForm.sendMan);
        _expressForm = {
          ..._expressForm,
          ...(_expressForm.sendMan ?
            { sendMan: _expressForm.sendMan! } :
            { sendMan: { ..._expressForm.sendMan!, ...selfInfo_S.address_info } }),
        };
      }
    }
    setExpressForm(_expressForm);
    //克隆
    const pages = Taro.getCurrentPages();
    if (pages.length < 2) {
      return;
    }
    const current = pages[pages.length - 1];
    const eventChannel = current.getOpenerEventChannel();
    eventChannel.on("cloneExpress", (data: Product_Express) => {
      setExpressForm({
        ..._expressForm,
        recMan: data.recMan!,
        sendMan: data.sendMan!,
      });

    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selfInfo_S]);
  function onGoToAddressList(type: AddressManType) {
    Taro.navigateTo({
      url: `/pages_user/user_address_list?manType=${type}`,
      events: {
        onSetAddressEvent(e: { manType: AddressManType; addressInfo: AddressInfo; }) {
          onSetExpressForm(e.manType, e.addressInfo);
        },
      },
    });
  }
  return (
    <ScrollView style={{ height: "99vh", maxHeight: "99vh", minHeight: "99vh" }} scrollY>
      <View>
        <ComNav className='bccback pb6' isHeight isSticky>
          <ComNavBar className='prl10 ' title='快递服务'></ComNavBar>
        </ComNav>
        {selfInfo_S === null && <ComLoading></ComLoading>}
        {selfInfo_S && (
          <>
            <View className='mt4'>
              {/* 寄件人信息 */}
              <ExpressSendMan onGoToAddressList={onGoToAddressList} expressForm={expressForm} refAddress={refAddress} formAddress={expressForm.sendMan}></ExpressSendMan>
              {/* 收件人信息 */}
              <ExpressRecMan setExpressForm={setExpressForm} selfInfo_S={selfInfo_S} onGoToAddressList={onGoToAddressList} onSetExpressForm={onSetExpressForm} expressForm={expressForm} refAddress={refAddress}></ExpressRecMan>

              {/* 物品类型-备注-寄件方式 */}
              <ExpressInfo expressForm={expressForm} setExpressForm={setExpressForm}></ExpressInfo>
              {/* 底部tab栏 */}

              {(selfInfo_S
                && (selfInfo_S.regiment_is === 1)
                && selfInfo_S.print_direct_regiment === true)
                ? <OrderPayRegiment selfInfo_S={selfInfo_S} expressForm={expressForm}></OrderPayRegiment>
                : <OrderPayUser selfInfo_S={selfInfo_S} expressForm={expressForm} setExpressForm={setExpressForm}></OrderPayUser>
              }

              <ComAddress ref={refAddress} onSetExpressForm={onSetExpressForm}></ComAddress>
            </View>
            {/* 提示信息 */}
            <PromptInformation></PromptInformation>
          </>
        )}
      </View>
    </ScrollView>
  );
};
export default Index_user_express;

//#region 寄件人 地址薄
const ExpressSendMan: FC<{
  className?: string;
  expressForm: Product_Express;
  refAddress: React.RefObject<RefAddress>;
  formAddress?: AddressInfo | null;
  onGoToAddressList: (type: AddressManType) => void;
}> = ({ className, refAddress, expressForm, onGoToAddressList }) => {
  return (
    <View className={classNames("mrl10 o10 bccwhite", className)}>
      {/* 寄件人 */}
      <View className='pbt4 o10 prl10 o10 ww'>
        <View className='dbtc'>
          <View className='fwb'>寄件人</View>
          <View className='dy'>
            <View
              className='cccgreen pbt6 pl10 oo'
              hoverClass='bccbacktab'
              onClick={() => {
                refAddress.current?.show({ manType: "send" });
              }}>
              新建寄件人
            </View>
          </View>
        </View>
      </View>
      <View className='lit dbtc pbt4'>
        <Navigator className='pbt10 o10 prl10' url='~' hoverClass='none'>
          <View>
            {expressForm.sendMan?.name} {expressForm.sendMan?.mobile}
          </View>
          <View className='cccplh www70 '>
            {expressForm.sendMan?.province} {expressForm.sendMan?.city} {expressForm.sendMan?.area} {expressForm.sendMan?.address}
          </View>
        </Navigator>
        <Navigator
          className='cccgreen pl10 mr10 pbt6 oo nw '
          hoverClass='bccbacktab'
          url='~'
          onClick={() => {
            onGoToAddressList("send");
          }}>
          地址薄
        </Navigator>
      </View>
    </View>
  );
};
//#endregion

//#region 收件人 地址薄
const ExpressRecMan: FC<{
  expressForm: Product_Express;
  selfInfo_S: BaseUserInfo | null;
  setExpressForm: React.Dispatch<React.SetStateAction<Product_Express>>;
  onGoToAddressList: (type: AddressManType) => void;
  onSetExpressForm: (manType: AddressManType, data: AddressInfo) => void;
  refAddress: React.RefObject<RefAddress>;
}> = ({ refAddress, expressForm, onSetExpressForm, onGoToAddressList, setExpressForm, selfInfo_S }) => {
  const [focus, setFocus] = useState(false);

  function ___change_address() {
    refAddress.current?.show({
      isSelector: true,
      isOnlySelector: true,
      manType: "rec",
      addr: {
        province: expressForm.recMan?.province ? expressForm.recMan?.province : "",
        city: expressForm.recMan?.city ? expressForm.recMan?.city : "",
        area: expressForm.recMan?.province ? expressForm.recMan?.area : "",
      } as AddressInfo,
    });
  }

  return (
    <>
      <View className='mrl10 prl10 o10 bccwhite mt10'>
        <View className='dbtc pbt4 lit'>
          <View className='fwb'>收件人</View>
          <View className='dy'>
            <View
              className='cccgreen pl10 pbt6 oo'
              hoverClass='bccbacktab'
              onClick={async () => {
                setExpressForm({
                  ...(await utils_init_product_express()),
                  sendMan: selfInfo_S?.address_info,
                });
              }}>
              清空
            </View>
            <View
              className='cccgreen pl10 pbt6 oo'
              hoverClass='bccbacktab'
              onClick={() => {
                refAddress.current?.show({
                  manType: "rec",
                  isGetClipboard: true,
                });
              }}>
              智能粘贴
            </View>
            <View
              className='cccgreen pl10 pbt6 oo'
              hoverClass='bccbacktab'
              onClick={async () => {
                Taro.chooseMedia({
                  count: 1,
                  mediaType: ["image"],
                  sourceType: ["album", "camera"],
                  sizeType: ["compressed"],
                  success: (e) => {
                    if (e.errMsg === "chooseMedia:ok") {
                      const [img] = e.tempFiles;
                      if (img) {
                        Taro.navigateTo({
                          url: `/pages_user/user_image_cropper?imgSrc=${img.tempFilePath}`,
                          events: {
                            onOcrRes: (ee: string) => {
                              const [res] = AddressParse.parse(ee, true);
                              if (!res) {
                                return;
                              }
                              onSetExpressForm("rec", {
                                ...expressForm.recMan!,
                                name: res?.name ?? "",
                                mobile: res?.mobile ?? "" ?? res?.phone ?? "",
                                company: "",
                                post_code: "",
                                code: res?.code ?? "",
                                country: "中国",
                                province: res?.province ?? "",
                                city: res?.city ?? "",
                                area: res?.area ?? "",
                                address: res?.details ?? "",
                                from: "OCR",
                              });
                            },
                          },
                        });
                      }
                    }
                  },
                });
              }}>
              图片识别
            </View>
          </View>
        </View>
        <View>
          <View className='dbtc pbt4 lit'>
            <Input
              className='ww'
              alwaysEmbed
              placeholder='收件人姓名'
              value={expressForm.recMan?.name}
              onInput={(e) => {
                onSetExpressForm("rec", {
                  ...expressForm.recMan!,
                  name: e.detail.value,
                });
              }}></Input>
            <Navigator
              className='cccgreen pl10 pbt6 oo nw'
              hoverClass='bccbacktab'
              url='~'
              onClick={() => {
                onGoToAddressList("rec");
              }}>
              地址薄
            </Navigator>
          </View>
          <View className='pbt10 lit'>
            <Input
              alwaysEmbed
              placeholder='联系电话：手机号码/固定电话'
              value={expressForm.recMan?.mobile}
              onInput={(e) => {
                onSetExpressForm("rec", {
                  ...expressForm.recMan!,
                  mobile: e.detail.value,
                });
              }}></Input>
          </View>
          <View className='pbt4 lit dbtc'>
            <View
              className={classNames("mr6 www65 ", {
                fwb: Taro.getSystemInfoSync().platform === "ios",
                cccplh: !expressForm.recMan?.province,
              })}
              onClick={() => ___change_address()}>
              {expressForm.recMan?.province ? `${expressForm.recMan?.province} ` : <View className='cccplh mr10 inline'>省</View>}
              {expressForm.recMan?.city ? (
                `${expressForm.recMan?.city} `
              ) : (
                <View
                  className={classNames("cccplh mr10 inline", {
                    cccprice: expressForm.recMan?.province && !expressForm.recMan?.city,
                  })}>
                  市
                </View>
              )}
              {expressForm.recMan?.area ? (
                `${expressForm.recMan?.area}`
              ) : (
                <View
                  className={classNames("cccplh mr10 inline", {
                    cccprice: expressForm.recMan?.province && !expressForm.recMan?.area,
                  })}>
                  区
                </View>
              )}
            </View>
            <View className='nw cccgreen pl10 pbt6 oo' hoverClass='bccbacktab' onClick={() => ___change_address()}>
              选择
            </View>
            <View
              className='nw cccgreen pl10 pbt6 oo'
              hoverClass='bccbacktab'
              onClick={() => {
                Taro.chooseLocation({
                  success: (e) => {
                    if (!e.address) {
                      return;
                    }
                    const [res] = AddressParse.parse(e.address, true);
                    if (!res) {
                      return;
                    }
                    onSetExpressForm("rec", {
                      ...expressForm.recMan!,
                      province: res.province,
                      city: res.city,
                      area: res.area,
                      address: res.details + " " + e.name,
                    });
                  },
                });
              }}>
              地图
            </View>
          </View>
          <View className='pbt10 lit'>
            {focus ? (
              <View className='dbtc'>
                <Textarea
                  className='ww'
                  style='max-height:5rem;'
                  focus={focus}
                  autoHeight
                  disableDefaultPadding
                  placeholder='详细地址：街道门牌信息'
                  value={expressForm.recMan?.address}
                  onBlur={() => setFocus(false)}
                  onInput={(e) => {
                    onSetExpressForm("rec", {
                      ...expressForm.recMan!,
                      address: e.detail.value,
                    });
                  }}></Textarea>
                <View className='vbh' style={{ width: "0rpx" }}>
                  垫
                </View>
              </View>
            ) : (
              <View
                className={classNames({
                  fwb: !focus && Taro.getSystemInfoSync().platform === "ios",
                  cccplh: !focus && !expressForm.recMan?.address,
                })}
                style='word-break:break-all;'
                onClick={() => setFocus(true)}>
                {expressForm.recMan?.address ? expressForm.recMan?.address : "详细地址：街道门牌信息"}
              </View>
            )}
          </View>
        </View>
      </View>
    </>
  );
};
//#endregion

//#region 物品类型-备注-寄件方式
const ExpressInfo: FC<{
  expressForm: Product_Express;
  setExpressForm: React.Dispatch<React.SetStateAction<Product_Express>>;
}> = ({ expressForm, setExpressForm }) => {
  return (
    <>
      {/* 物品类型-备注-寄件方式 */}
      <View className='m10 o10 prl10 '>
        {/* 物品类型 */}
        <View className='dy dwp'>
          <View className='fwb '>物品类型：</View>
          {["文件", "数码产品", "日用品", "服饰", "食品", "其他"].map((e) => (
            <View
              key={e}
              className={`cccplh pbt6   oo   ${e == expressForm.itemType ? "bccyellow prl6 mr4" : "mr6"}}`}
              onClick={() => {
                setExpressForm({ ...expressForm, itemType: e });
              }}>
              {e}
            </View>
          ))}
        </View>
        {/* 备注 */}
        <View className='dy dwp'>
          <View className='fwb '>备注：</View>
          {["缺包装袋", "缺文件袋", "退换货", "需本人签收", "易碎品", "重要文件"].map((e) => (
            <View
              key={e}
              className={`cccplh pbt6  oo ${expressForm.itemNotes.includes(e) ? "bccyellow prl6 mr4" : "mr6"}`}
              onClick={() =>
                setExpressForm({
                  ...expressForm,
                  itemNotes: expressForm.itemNotes.includes(e) ? expressForm.itemNotes.replace(`${e}/`, "") : `${e}/${expressForm.itemNotes}`,
                })
              }>
              {e}
            </View>
          ))}
        </View>
        {/* 寄件方式 */}
        <View className='dy dwp '>
          <View className='fwb '>寄件方式：</View>
          {(["到店寄件", "上门取件"] as PickUpType[]).map((e, i) => (
            <>
              {" "}
              {i === 0 && (
                <View key={e} className={`cccplh pbt6  oo ${expressForm.pickUpType == e ? "bccyellow prl6 mr4" : "mr6"}`} onClick={() => setExpressForm({ ...expressForm, pickUpType: e })}>
                  {e}
                </View>
              )}
            </>
          ))}
        </View>
      </View>
    </>
  );
};
//#endregion

//#region 团长信息
const RegimentInfo: FC<{ selfInfo_S: BaseUserInfo | null; }> = ({ selfInfo_S }) => {
  return (
    <View className=' mrl10 dy'>
      <ComAvatar className='bccwhite' size={60} src={selfInfo_S?.regiment_info?.avatar} />
      <View className='dy'>
        <View className='ml4 nw1 wm4rem'> {selfInfo_S?.regiment_info?.name}</View>
        {selfInfo_S?.regiment_is &&
          <View className='ml6 wm4rem'> {selfInfo_S?.regiment_replica_selfInfo?.name} </View>
        }
      </View>
    </View>
  );
};
//#endregion

//#region 下单-用户
const OrderPayUser: FC<{
  expressForm: Product_Express;
  selfInfo_S: BaseUserInfo | null;
  setExpressForm: React.Dispatch<React.SetStateAction<Product_Express>>;
}> = ({ expressForm, selfInfo_S, setExpressForm }) => {
  const [orders_S, setOrders_S] = useOrdersNotice();
  return (
    <View className='fixed-bottom safe-bottom bccwhite www100 prl10'>
      <View className='www pbt10 dbtc '>
        {/* 团长信息 */}
        <RegimentInfo selfInfo_S={selfInfo_S}></RegimentInfo>
        <View
          className='bccyellow oo prl10 pbt6 fwb dy fwb mrl10'
          hoverClass='bccyellowtab'
          onClick={async () => {
            //检查快递可达性-用户下单没有指定具体快递公司,不检查快递可达性

            Taro.showLoading({ title: "提交中...", mask: true });
            if (utils_validate_express("rec", expressForm.recMan!) && utils_validate_express("send", expressForm.sendMan!)) {
              const res1 = await Api_orders_addOrder({
                ...expressForm,

                self_OPENID: selfInfo_S?.OPENID,
                regiment_OPENID: selfInfo_S?.regiment_OPENID,
                regiment_sub_mchId: selfInfo_S?.regiment_info?.regiment_sub_mchId,

                payStatus: PayStatus.PAY0,
              });
              setOrders_S([res1, ...(orders_S ?? [])]);
              Taro.hideLoading();
              Taro.showModal({
                title: "提示",
                content: "下单成功",
                confirmText: "查看订单",
                cancelText: "继续下单",
                success: async (e) => {
                  if (e.cancel) {
                    setExpressForm({
                      ...(await utils_init_product_express()),
                      sendMan: selfInfo_S?.address_info,
                    });
                  }
                  if (e.confirm) {
                    Taro.redirectTo({ url: "/pages_user/user_orders" });
                  }
                },
              });
            }
          }}>
          确认·下单
        </View>
      </View>
    </View>
  );
};
//#endregion

//#region 下单-团长
const OrderPayRegiment: FC<{
  expressForm: Product_Express;
  selfInfo_S: BaseUserInfo | null;
}> = ({ expressForm, selfInfo_S }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [orderState, setOrderState] = useState<Product_Express | null>(null);
  const [price, setPrice] = useState(0);
  const [weight, setWeight] = useState(0);
  const time_limit = useHook_getTimeLimit(selfInfo_S?.print_time_limit?.limit_time!);

  //#region 提交订单
  async function ___submit(_weight: number, _price: number) {
    //选择电子面单账号
    const [err1, logistic] = await to(utils_get_logistics(selfInfo_S));
    if (err1) {
      Taro.showToast({ title: err1.message, icon: "none" });
      return;
    }
    //检查快递可达性
    Taro.showLoading({ title: "检查快递...", mask: true });
    const res2 = await Api_local_reachable({
      ...expressForm,
      deliveryId: logistic.deliveryId,
    });
    if (res2) {
      Taro.showToast({ title: res2, icon: "none", duration: 5000 });
      return;
    }
    //生成电子面单-生成订单
    Taro.showLoading({ title: "生成订单...", mask: true });
    const _params = {
      ...expressForm,

      self_OPENID: selfInfo_S?.OPENID,
      regiment_OPENID: selfInfo_S?.regiment_OPENID,
      regiment_sub_mchId: selfInfo_S?.regiment_info?.regiment_sub_mchId,

      payStatus: PayStatus.PAY1,
      weight: _weight,
      totalFee: _price,

      deliveryId: logistic.deliveryId,
      bizId: logistic.bizId,
      deliveryName: logistic.deliveryName,

      ...(() => {
        if (selfInfo_S?.regiment_is && selfInfo_S.regiment_replica_regiment_OPENID === selfInfo_S.regiment_OPENID) {
          return {
            regiment_replica_OPENID: selfInfo_S?.regiment_replica_selfInfo?.OPENID,
          };
        } else { return {}; }
      })(),
    };
    const [err3, res3] = !time_limit
      ? await to(utils_generate_order(_params))
      : await to(Api_orders_addOrder(_params));

    if (err3) {
      Taro.showToast({ title: err3.message, icon: "none", duration: 5000 });
      return;
    }
    //微信支付
    const [err4, res4] = await to(utils_wx_pay(res3));
    Taro.hideLoading();
    if (err4) {
      Taro.showModal({
        title: err4.message,
        content: `订单移入"待付款"`,
        confirmText: "查看订单",
        cancelText: "稍后查看",
        success: (e) => {
          if (e.confirm) {
            Taro.navigateTo({
              url: "/pages_regiment/regiment_orders?orderType=1",
            });
          }
        },
      });
      return;
    }
    setOrderState({ ...res4 });
    setShowPopup(true);
  }


  //#endregion

  return (
    <View className='fixed-bottom safe-bottom bccwhite www100 prl10 tab-back'>
      {/* 揽件超时限制通知 */}
      <ComPrintNotice className='pt10' time_limit={time_limit}></ComPrintNotice>
      {/* 支付成功弹窗 */}
      <PaySuccessPopup showPopup={showPopup} orderState={orderState} selfInfo_S={selfInfo_S} onClick={() => setShowPopup(false)}></PaySuccessPopup>
      {/* 重量 - 价格 */}
      {selfInfo_S && selfInfo_S.regiment_is === 1 && selfInfo_S.print_direct_regiment === true &&
        <ComWeightPrice className='mrl10 mt10 prl10 o10 pbt4 dbtc bccback'
          expressForm={expressForm}
          weight={weight}
          price={price}
          onSetWeight={(e) => setWeight(e)}
          onSetPrice={(e) => setPrice(e)}></ComWeightPrice>
      }
      <View className='www pbt10 dbtc '>
        {/* 团长信息 */}
        <RegimentInfo selfInfo_S={selfInfo_S}></RegimentInfo>
        <View className='dy'>
          <View
            className='bccyellow oo prl10 pbt6 fwb dy fwb mrl10 '
            hoverClass='bccyellowtab'
            onClick={async () => {
              // 表单验证
              // 检查收件人
              if (!utils_validate_express("rec", expressForm.recMan!)) {
                return;
              }
              // 检查寄件人
              if (!utils_validate_express("send", expressForm.sendMan!)) {
                return;
              }
              // 检查重量
              if (!weight) {
                Taro.showToast({ title: "请输入重量", icon: "none" });
                return;
              }
              // 检查价格
              if (!price) {
                Taro.showToast({ title: "请获取价格", icon: "none" });
                return;
              }
              ___submit(weight, price);
            }}>
            <Image className='mr6 ' style='width: 1rem; height: 1rem;transform: scale(1.2);' src={wexinpay}></Image>
            团长自助·下单
          </View>
        </View>
      </View>
    </View>
  );
};
//#endregion

//#region 支付成功弹窗
const PaySuccessPopup: FC<{ showPopup: boolean, orderState: Product_Express | null, selfInfo_S: BaseUserInfo | null, onClick: () => void; }> =
  ({ showPopup, orderState, selfInfo_S, onClick }) => {

    return <RootPortal>
      <VPopup show={showPopup} round onClose={() => onClick()}>
        <View className='p10 o10 dcl www90'>
          <View className='pbt10  fwb '>支付成功</View>
          <View className=' dy pbt4'>
            <View>{`订单移入"已付款"`}</View>
            <Navigator className='cccgreen pl10 pbt6 oo' hoverClass='bccbacktab' url='/pages_regiment/regiment_orders?orderType=2'>
              查看订单
            </Navigator>
            <Label for={orderState?._id as string}>
              <View className='pl10 cccgreen pbt6 oo nw ' hoverClass='bccbacktab'>
                分享
              </View>
              <Button className='dsn' id={orderState?._id as string} openType='share'></Button>
            </Label>
          </View>
          {orderState?.waybillId ?
            <>
              <View className='dy pbt4'>
                <View className='nw'> 快递单号：{orderState?.waybillId} </View>
                <View
                  className='pl10 pbt6 oo cccgreen nw '
                  hoverClass='bccbacktab'
                  onClick={() => {
                    Taro.setClipboardData({
                      data: orderState?.waybillId!,
                      success: () => {
                        Taro.showToast({ title: "复制成功", icon: "none" });
                      },
                    });
                  }}>
                  复制
                </View>
              </View>
              <View className='pbt4 dy'>
                <View className='pbt6 oo prl10 bccyellow nw mrl4' hoverClass='bccyellowtab'
                  onClick={() => utils_print_express(orderState!, selfInfo_S!)}>
                  打印订单
                </View>
              </View>
            </> : <View className='pbt10 cccprice'>暂不可打印</View>
          }
          <View className='pbt4'>
            <View className='cccplh pbt6 prl10 oo' hoverClass='bccbacktab' onClick={() => onClick()}>
              关闭
            </View>
          </View>
        </View>
      </VPopup>
    </RootPortal>;
  };
//#endregion

//#region 提示信息
const PromptInformation = () => {
  return (
    <>
      <View className='ml10  pl10'>
        <View className='pbt6 cccplh'>首重6元起，上门取件+2元</View>
        {/* <Navigator className="pbt6 pl10 oo cccgreen " hoverClass="cccwhitetab">价格计算器</Navigator> */}
      </View>
      <View className='hhh25'></View>
    </>
  );
};
//#endregion



