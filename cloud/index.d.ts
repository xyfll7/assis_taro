import { Code, PayStatus } from "../client/src/a_config";
import cloud from "wx-server-sdk";
declare global {
  interface BaseUserInfo {
    _id?: string;
    serveVersion?: string; // 服务版本
    timestamp_update?: number; // 更新时间

    OPENID?: string;


    name?: string; // 真实姓名
    avatar?: string; // 头像
    phone?: string; // 手机号

    distance?: number;
    location_name?: string; // 地址
    location?: {
      type: "Point";
      coordinates: [number, number]; // 坐标纬度  // 坐标经度
    };

    address_info?: AddressInfo;

    regiment_is?: 0 | 1; // 是否团长 0申请 1团长
    regiment_OPENID?: string;
    regiment_info?: BaseUserInfo | null; // 团长信息
    regiment_sub_mchId?: string; // 子商户号?: string; // 商户号
    regiment_replica_regiment_OPENID?: string; // 团长分身OPENID 等于团长OPENID
    regiment_replica_is?: boolean; // 是否团长分身
    regiment_replica_selfInfo?: BaseUserInfo; // 团长分身个人信息
    regiment_price_scheme?: PriceScheme_Type; // 价格方案
    regiment_agent_OPENID?: string;

    agent_OPENID?: string;  // 存在即是代理
    agent_name?: string;

    logistics?: Logistics_Account[]; // 绑定的快递账号列表
    printers?: Printer_Info[]; // 绑定的打印机
    print_direct_user?: boolean; // 是否允许用户自助打印
    print_direct_regiment?: boolean; // 是否允许团长直接付款打印
    print_time_limit?: {  // 打印时间限定
      limit_time: string,
      notice: string;
    } | null;


    team_regiment?: string;


  }
  interface Product_Express extends ProductBase {
    deliveryName?: string; // 快递公司名称
    deliveryId?: string; // 快递公司ID //"JTSD",
    bizId?: string; // 面单账号 "J00862837174",

    waybillData?: WaybillData[];
    waybillId?: string;

    recMan?: AddressInfo | null;
    sendMan?: AddressInfo | null;
    itemType: string;  // 包裹类型
    itemNotes: string;  // 包裹备注
    weight: number;  // 重量
    weight_inc?: number; // 重量自增量
    pickUpType: PickUpType;   // 上门取件/网店自寄
    print_times: number;  // 打印次数
    timestamp_print?: number;  // 打印时间
    printer?: Printer_Info;
    print_direct_user?: boolean;  // 是否自动打印
    is_cancel_order?: boolean;
    // kuaidicom?: string // 快递公司
  }
  interface ProductBase {
    _id?: cloud.DB.DocumentId;
    outTradeNo?: string; // 订单id
    self_OPENID?: string;
    regiment_OPENID?: string;
    regiment_sub_mchId?: string; // 子商户号?: string; // 商户号
    x_regiment_sub_mchId?: string;

    regiment_replica_OPENID?: string; // 团长分身OPENID

    regiment_name?: string;
    regiment_avatar?: string;
    product_type?: Product_type;
    totalFee?: number;
    describe?: string; // String(128)  腾讯充值中心 -QQ 会员充值
    payStatus?: PayStatus; // 0 未支付 1 待付款 2 完成支付

    timestamp_init?: number;
    timestamp_update?: number;
    timestamp_pay?: number;
    timestamp_pay_callback?: number;
    timestamp_pay_callback_refund?: _timestamp;
    order_refund?: RefundEvent_sub;
  }
  interface Object {
    logr(string, number?): any;
  }
  interface IAppOption {
    globalData?: {
      userInfo?: WechatMiniprogram.UserInfo;
    };
    userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback;
  }
  interface Result<T> {
    code: Code;
    message: string;
    data?: T;
    res?: any;
    err?: any;
    subMessage?: any; // 订阅消息
    uniMessage?: any; // 统一服务消息
    event?: any;
    payReturnData?: any;
  }
  interface ActionProps<T> {
    type: "get" | "update";
    payload: T;
  }
  type Printer_Info = {
    siid: string;
    direction: 0 | 1;   // 0-正方向 1-反方向
    tempid?: string;  // 打印模版
  };
  type Environment = {
    envId: string;
    alias: string;
    envVersion: EnvVersion;
    envReal: EnvVersion;
    version: string;
    OPENID?: string;
  };
  interface Events<T, P = any> {
    func: string;
    data: T;
    params?: P;
    environment: Environment;
  }
  interface Product_Publish extends ProductBase {
    publish_description: string;
    publish_medias: WechatMiniprogram.MediaFile[];
  }
  type AddressInfo = {
    _id?: string;
    self_OPENID?: string;
    name: string;
    mobile: string;
    company: string;
    post_code: string;
    code: string;
    country: string;
    province: string;
    city: string;
    area: string;
    address: string;
    from: "WX" | "CP" | "OCR";  // 微信 | 粘贴
    address_type?: AddressType;  // 收件地址 | 寄件地址
    timestamp_update?: number;
  };
  type WaybillData = { key: string; value: string; };
  interface PayRes {
    appid: string; // "wxd2d16a504f24665e"
    errCode: number; // 0
    errCodeDes: string; // "201 商户订单号重复"
    errMsg: string; // "cloudPay.unifiedOrder:ok"
    mchId: string; // "1800008281"
    nonceStr: string; // "r3QSTIGsUvWNcsNB" // cSpell: ignore QSTIGs
    payment: WechatMiniprogram.RequestPaymentOption; //
    appId: string; // "wxc6ff511796ec714a"
    package: string; // "prepay_id="
    paySign: string; // "FC7EB2ABF5073F543CDF3116AFED797B"
    signType: string; // "MD5"
    timeStamp: string; // "1647184299"
    resultCode: string; // "FAIL"
    returnCode: string; // "SUCCESS"
    returnMsg: string; // "OK"
    sign: string; // "AB587BF9D01D03F0B1757A61BF3BA218"
    subAppid: string; // "wxc6ff511796ec714a"
    subMchId: string; // "1612524003"
  }
  type BleConnectedOptions = {
    device: Taro.onBluetoothDeviceFound.CallbackResultBlueToothDevice;
    service: Taro.getBLEDeviceServices.BLEService;
    characteristic: Taro.getBLEDeviceCharacteristics.BLECharacteristic;
  };
  interface PrintRes {
    code: number; // 30010
    message: string; // "KX100L3AF70711D420:当前打印机存在异常,请先检查"
    success: boolean; // false
    time: number; // 0
    data: {
      taskId: string;
    };
  }
  interface Logistics_Path {
    openid: string; // "oGwbL5J-wihmVkT8ma6CblWyKBVE", // cSpell: ignore wihm KBVE
    deliveryId: string; //"YUNDA",
    waybillId: string; // "312181693985953",
    pathItemNum: number;
    pathItemList: {
      actionTime: number; // 1668571113,
      actionType: number; // 200001,
      actionMsg: string; // "【延安市】已离开 陕西延安公司 发往 陕西西安分拨交付中心",
    }[];
    errMsg: string; // "openapi.logistics.getPath:ok",
    errCode: number; //  0,
  }
  interface ServerPayParams {
    appid?: string; // 服务商应用ID string[1,32] 是  body 由微信生成的应用ID，全局唯一。请求基础下单接口时请注意APPID的应用属性，例如公众号场景下，需使用应用属性为公众号的服务号APPID 示例值：wx8888888888888888
    mchid?: string; // 服务商户号 string[1,32]	是	body 服务商户号，由微信支付生成并下发 示例值：1230000109
    sp_appid?: string; // 服务商应用ID string[1,32] 是  body 由微信生成的应用ID，全局唯一。请求基础下单接口时请注意APPID的应用属性，例如公众号场景下，需使用应用属性为公众号的服务号APPID 示例值：wx8888888888888888
    sp_mchid?: string; // 服务商户号 string[1,32]	是	body 服务商户号，由微信支付生成并下发 示例值：1230000109
    sub_appid: string; // 子商户应用ID		string[1,32]	否	body 子商户申请的应用ID，全局唯一。请求基础下单接口时请注意APPID的应用属性，例如公众号场景下，需使用应用属性为公众号的APPID  若sub_openid有传的情况下，sub_appid必填，且sub_appid需与sub_openid对应 示例值：wxd678efh567hg6999
    sub_mchid: string; // 子商户号		string[1,32]	是	body 子商户的商户号，由微信支付生成并下发。 示例值：1900000109
    description: string; // 商品描述		string[1,127]	是	body 商品描述  示例值：Image形象店-深圳腾大-QQ公仔
    out_trade_no: string; // 商户订单号		string[6,32]	是	body 商户系统内部订单号，只能是数字、大小写字母_-*且在同一个商户号下唯一。  示例值：1217752501201407033233368018
    time_expire?: string; // 交易结束时间		string[1,64]	否	body 订单失效时间，遵循rfc3339标准格式，格式为yyyy-MM-DDTHH:mm:ss+TIMEZONE，yyyy-MM-DD表示年月日，T出现在字符串中，表示time元素的开头，HH:mm:ss表示时分秒，TIMEZONE表示时区（+08:00表示东八区时间，领先UTC8小时，即北京时间）。例如：2015-05-20T13:29:35+08:00表示，北京时间2015年5月20日 13点29分35秒。 示例值：2018-06-08T10:34:56+08:00
    attach?: string; // 附加数据		string[1,128]	否	body 附加数据，在查询API和支付通知中原样返回，可作为自定义参数使用，实际情况下只有支付完成状态才会返回该字段。 示例值：自定义数据
    notify_url: string; // 通知地址		string[1,256]	是	body 通知URL必须为直接可访问的URL，不允许携带查询串，要求必须为https地址。格式：URL 示例值：https://www.weixin.qq.com/wxpay/pay.php
    goods_tag?: string; // 订单优惠标记		string[1,32]	否	body 订单优惠标记 示例值：WXG
    support_fapiao?: string; // 电子发票入口开放标识		boolean	否	body 传入true时，支付成功消息和支付详情页将出现开票入口。需要在微信支付商户平台或微信公众平台开通电子发票功能，传此字段才可生效。  true：是 false：否     示例值：true
    settle_info?: {
      profit_sharing: string; // 是否指定分账	profit_sharing	boolean	否	是否指定分账，枚举值 true：是 false：否 示例值：true
    }; // 结算信息		object	否	body 结算信息
    amount: {
      total: number; // 总金额		int	是	订单总金额，单位为分。 示例值：100
      currency: string; // 货币类型		string[1,16]	否	CNY：人民币，境内商户号仅支持人民币。 示例值：CNY
    }; // 订单金额		object	是	body 订单金额信息
    payer: {
      sp_openid?: string; // 用户服务标识		string[1,128]	二选一	用户在服务商appid下的唯一标识。 下单前需获取到用户的Openid，Openid获取详见。 示例值：oUpF8uMuAJO_M2pxb1Q9zNjWeS6o
      sub_openid?: string; // 用户子标识		string[1,128] 二选一	用户在子商户appid下的唯一标识。若传sub_openid，那sub_appid必填。下单前需获取到用户的Openid，Openid获取详见。 示例值：oUpF8uMuAJO_M2pxb1Q9zNjWeS6o
    }; // 支付者		object	是	body 支付者信息
    detail?: {
      cost_price: number; // 订单原价		int	否	1、商户侧一张小票订单可能被分多次支付，订单原价用于记录整张小票的交易金额。 2、当订单原价与支付金额不相等，则不享受优惠。  3、该字段主要用于防止同一张小票分多次支付，以享受多次优惠的情况，正常支付订单不必上传此参数。   示例值：608800
      invoice_id: string; // 商品小票ID		string[1,32]	否	商家小票ID  示例值：微信123
      goods_detail: []; // 单品列表		array	否	单品列表信息 条目个数限制：【1，6000】
    }; // 优惠功能		object	否	body 优惠功能
    scene_info?: {
      payer_client_ip: string; // 用户终端IP		string[1,45]	是	用户的客户端IP，支持IPv4和IPv6两种格式的IP地址。示例值：14.23.150.211
      device_id: string; // 商户端设备号		string[1,32]	否	商户端设备号（门店号或收银设备ID）。 示例值：013467007045764
      store_info: any; // 商户门店信息		object	否	商户门店信息
    }; // 场景信息		object	否	body 支付场景描述
  }
  interface PayBackReturn {
    errcode: 0 | 1;
    errmsg: "SUCCESS" | "FAIL";
  }
  interface PayBackEvent {
    attach: string;
    bankType: string; // "OTHERS",  银行类型，采用字符串类型的银行标识，银行类型见银行列表
    cashFee: number; // 1,  现金支付金额订单现金支付金额，详见支付金额
    feeType: string; // "CNY",
    nonceStr: string; // 随机字符串，不长于32位 "e336d4f3e66620fa",
    detail: string;
    outTradeNo: string; // *** 订单号 *** 商户系统内部订单号，要求32个字符内（最少6个字符），只能是数字、大小写字母_-|*且在同一个商户号下唯一。详见 ,

    resultCode: "SUCCESS" | "FAIL"; // 此字段是通信标识，非交易标识，交易是否成功需要查看result_code来判断,
    returnCode: "SUCCESS" | "FAIL"; // "SUCCESS",

    appid: string; // 服务商的APPID 微信分配的小程序ID "wxd2d16a504f24665e" ,
    mchId: string; // 微信支付分配的商户号 "1800008281" ,
    isSubscribe: "N" | "Y"; // 用户是否关注公众账号，Y-关注，N-未关注,
    openid: string; // "oPoo44wFKsQponvcxmn8SW7lIKGI", // cSpell: ignore Qponvcxmn IKGI

    subAppid: string; // "wxc6ff511796ec714a",
    subIsSubscribe: string; // "N",
    subMchId: string; // "1612524003",
    subOpenid: string; // "oGwbL5MUeSNxxA4o0oOmb_FUjE7g",

    timeEnd: string; // "20220315085950",
    totalFee: number; // 1,
    tradeType: string; // 交易类型 JSAPI、NATIVE、APP,
    transactionId: string;// "4200001355202203156891655271",
    userInfo: {
      appId: string; //"wxc6ff511796ec714a",
      openId: string; //"oGwbL5MUeSNxxA4o0oOmb_FUjE7g"
    };
  }
  interface RefundEvent_sub {
    "sp_mchid": string; // "1635060558",
    "sub_mchid": string; //  "1635798777",
    "out_trade_no": string; //  "MUeSNxxA4o0oOmb_FUjE7g1gkqgs44l", // cSpell: ignore gkqgs
    "transaction_id": string; //  "4200001663202212219334102450",
    "out_refund_no": string; //  订单id
    "refund_id": string; //  "50301804212022122328916290994",
    "refund_status": string; //  "SUCCESS",
    "success_time": string; //  "2022-12-23T10:55:21+08:00",
    "amount": {
      "total": number; //  1,
      "refund": number; //1,
      "payer_total": number; // 1,
      "payer_refund": number; // 1
    },
    "user_received_account": string; //  "招商银行借记卡8343"
  }
  interface RefundEvent {
    "appid": string;// "wxd2d16a504f24665e",
    "mchId": string;// "1800008281",
    "nonceStr": string;// "8d3575a28d291161b212466477f21b47",
    "outRefundNo": string;//  "18e540f163a569c40006c0bd76cca73f",
    "outTradeNo": string;//  "MUeSNxxA4o0oOmb_FUjE7g1gkv2a8es",
    "refundAccount": string;//  "REFUND_SOURCE_RECHARGE_FUNDS",
    "refundFee": number; // 1,
    "refundId": string;//  "50302004472022122328933710012",
    "refundRecvAccout": string;// "招商银行借记卡8343",
    "refundRequestSource": string;// "API",
    "refundStatus": string;//  "SUCCESS",
    "returnCode": string;//  "SUCCESS",
    "settlementRefundFee": number; //1,
    "settlementTotalFee": number; //1,
    "subAppid": string;//  "wxc6ff511796ec714a",
    "subMchId": string;//  "1612524003",
    "successTime": string;//  "2022-12-23 16:57:48",
    "totalFee": number; // 1,
    "transactionId": string;//  "4200001685202212233552220157",
    "userInfo": {
      "appId": string;//  "wxc6ff511796ec714a",
      "openId": string;// "oGwbL5MUeSNxxA4o0oOmb_FUjE7g"
    };
  }
  interface AccountInfo {
    alias: string;// ""
    bizId: string;// "7160009010"
    createTime: number;// 1628096123
    deliveryId: string;// "YUNDA"
    quotaNum: number;// 52
    quotaUpdateTime: number;// 1666595757
    remarkContent: string;// ""
    remarkWrongMsg: string;//""
    serviceType: { serviceType: number; serviceName: string; }[];// [{serviceType: 0, serviceName: "标准快件"}]
    statusCode: number;// 0
    updateTime: number;// 1666595735
  }
  interface Logistics_Account {
    selected: boolean;
    type: 'bind' | "unbind";
    password: string;
    bizId: string;
    deliveryId: string;
    deliveryName: string;
    number?: number;
  }
  interface Logistics_Delivery {
    canGetQuota: number;
    canUseCash: number;
    cashBizId: string;
    deliveryId: string;
    deliveryName: string;
    serviceType: {
      serviceName: string;
      serviceType: number;
    }[];
  }
  interface PriceScheme_Type {
    _id: string;
    name: string;
    desc: string;
    scheme: number;
    scheme_list: { weight: number, vip: number, vvip: number, vvvip: number; }[];
  }
  type OrderList_Query =
    {
      payStatus: PayStatus[];
      timestamp_update?: number;
    } &
    { regiment_OPENID?: string; } &
    {
      self_OPENID?: string;
      product_type?: Product_type;
    };
  type AddressManType = "rec" | "send";
  type Product_type = "publish" | "express";
  type EnvVersion = 'develop' | 'trial' | 'release';
  type AddressType = "收件地址" | "寄件地址" | "全部";
  type PickUpType = "上门取件" | "到店寄件";
  type OrderType = "待计重" | "待付款" | "已付款" | "已退款";
  type CURD_List = "UPDATE" | "DELETE";
}

declare module "wx-server-sdk" {
  export const cloudPay: Record<string, any>;
}




