import { Code, PayStatus } from "../../../client/src/a_config";
// 云函数代码
import cloud, { DB } from "wx-server-sdk";

import { WxPay } from "../utils/wxpay";
import fs from 'fs';

// @ts-ignore
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const cfg = {
  dev_url: "https://cloud1-8gfby1gac203c61c-1306790653.ap-shanghai.app.tcloudbase.com",
  pro_url: "https://production-8g1eglqz3d606693-1306790653.ap-shanghai.app.tcloudbase.com"
};



const wxPay = new WxPay({
  sp_mchid: '1635060558',
  sp_appid: 'wxc6ff511796ec714a',
  publicKey: fs.readFileSync('./apiclient_cert.pem'), // 公钥
  privateKey: fs.readFileSync('./apiclient_key.pem'), // 秘钥
  serial_no: "197A9803A1B80005AED3AC68A3957E2EBB774177", // 申请API证书 证书序列号
  key: "91610602MA6YF6FK6C17709205217000", // APIv3密钥
});
// 收款
export async function wxPay_express_cloud(event: Events<Product_Express>): Promise<Result<PayRes>> {
  const { data } = event;
  try {
    const res = data.regiment_sub_mchId ? await ___wxpay_sub(event) : await ___wxpay_headquarters_account(event);
    if (res.errMsg == "cloudPay.unifiedOrder:ok") {
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: res,
      };
    } else {
      throw new Error(`微信支付错误，${res.errMsg}`);
    }
  } catch (err: any) {
    throw err;
  }
}
// 收款-总账商户
async function ___wxpay_headquarters_account(event: Events<Product_Express>): Promise<PayRes> {
  try {
    const { data, environment } = event;

    const res = await wxPay.transactions_jsapi({
      sub_mchid: "1639331479", // data.subMchId, // 子商户号		string[1,32]	是	body 子商户的商户号，由微信支付生成并下发。 示例值：1900000109
      sub_appid: "wxc6ff511796ec714a", // 子商户应用ID	string[1,32]	否	body 子商户申请的应用ID，全局唯一。请求基础下单接口时请注意APPID的应用属性，例如公众号场景下，需使用应用属性为公众号的APPID  若sub_openid有传的情况下，sub_appid必填，且sub_appid需与sub_openid对应 示例值：wxd678efh567hg6999

      description: data.describe ? data.describe : "小象助手为您服务", // 商品描述		string[1,127]	是	body 商品描述  示例值：Image形象店-深圳腾大-QQ公仔
      out_trade_no: data.outTradeNo ?? "", // 商户订单号		string[6,32]	是	body 商户系统内部订单号，只能是数字、大小写字母_-*且在同一个商户号下唯一。  示例值：1217752501201407033233368018
      // time_expire: "", // 交易结束时间		string[1,64]	否	body 订单失效时间，遵循rfc3339标准格式，格式为yyyy-MM-DDTHH:mm:ss+TIMEZONE，yyyy-MM-DD表示年月日，T出现在字符串中，表示time元素的开头，HH:mm:ss表示时分秒，TIMEZONE表示时区（+08:00表示东八区时间，领先UTC8小时，即北京时间）。例如：2015-05-20T13:29:35+08:00表示，北京时间2015年5月20日 13点29分35秒。 示例值：2018-06-08T10:34:56+08:00
      attach: `${data._id},${data.regiment_OPENID},${data.product_type}`, // 附加数据		string[1,128]	否	body 附加数据，在查询API和支付通知中原样返回，可作为自定义参数使用，实际情况下只有支付完成状态才会返回该字段。 示例值：自定义数据

      notify_url: environment.envVersion === "release" ?
        `${cfg.pro_url}/a__wxpay_callback_sub_cloud` :
        `${cfg.dev_url}/a__wxpay_callback_sub_cloud`, // 通知地址		string[1,256]	是	不允许携带查询串，要求必须为https地址。
      // goods_tag: "", // 订单优惠标记		string[1,32]	否	body 订单优惠标记 示例值：WXG
      // support_fapiao: "", // 电子发票入口开放标识		boolean	否	body 传入true时，支付成功消息和支付详情页将出现开票入口。需要在微信支付商户平台或微信公众平台开通电子发票功能，传此字段才可生效。  true：是 false：否     示例值：true
      // settle_info: {
      //   profit_sharing: "", // 是否指定分账	profit_sharing	boolean	否	是否指定分账，枚举值 true：是 false：否 示例值：true
      // }, // 结算信息		object	否	body 结算信息
      amount: {
        total: data.totalFee!, // 总金额		int	是	订单总金额，单位为分。 示例值：100
        currency: "CNY", // 货币类型		string[1,16]	否	CNY：人民币，境内商户号仅支持人民币。 示例值：CNY
      }, // 订单金额		object	是	body 订单金额信息
      payer: {
        sp_openid: data.self_OPENID!, // 用户服务标识		string[1,128]	二选一	用户在服务商appid下的唯一标识。 下单前需获取到用户的Openid，Openid获取详见。 示例值：oUpF8uMuAJO_M2pxb1Q9zNjWeS6o
        sub_openid: data.self_OPENID!, // 用户子标识		string[1,128] 二选一	用户在子商户appid下的唯一标识。若传sub_openid，那sub_appid必填。下单前需获取到用户的Openid，Openid获取详见。 示例值：oUpF8uMuAJO_M2pxb1Q9zNjWeS6o
      }, // 支付者		object	是	body 支付者信息
      // detail: {
      //   cost_price: "", // 订单原价		int	否	1、商户侧一张小票订单可能被分多次支付，订单原价用于记录整张小票的交易金额。 2、当订单原价与支付金额不相等，则不享受优惠。  3、该字段主要用于防止同一张小票分多次支付，以享受多次优惠的情况，正常支付订单不必上传此参数。   示例值：608800
      //   invoice_id: "", // 商品小票ID		string[1,32]	否	商家小票ID  示例值：微信123
      //   goods_detail: [], // 单品列表		array	否	单品列表信息 条目个数限制：【1，6000】
      // }, // 优惠功能		object	否	body 优惠功能
      // scene_info: {
      //   payer_client_ip: "", // 用户终端IP		string[1,45]	是	用户的客户端IP，支持IPv4和IPv6两种格式的IP地址。示例值：14.23.150.211
      //   device_id: "", // 商户端设备号		string[1,32]	否	商户端设备号（门店号或收银设备ID）。 示例值：013467007045764
      //   store_info: [], // 商户门店信息		object	否	商户门店信息
      // }, // 场景信息		object	否	body 支付场景描述
    });
    return res as any as PayRes;
  } catch (err: any) {
    throw err;
  }
}
// 收款-独立商户
async function ___wxpay_sub(event: Events<Product_Express>): Promise<PayRes> {
  try {
    const { data, environment } = event;

    const res = await wxPay.transactions_jsapi({
      sub_mchid: data.regiment_sub_mchId ?? "", // data.subMchId, // 子商户号		string[1,32]	是	body 子商户的商户号，由微信支付生成并下发。 示例值：1900000109
      sub_appid: "wxc6ff511796ec714a", // 子商户应用ID	string[1,32]	否	body 子商户申请的应用ID，全局唯一。请求基础下单接口时请注意APPID的应用属性，例如公众号场景下，需使用应用属性为公众号的APPID  若sub_openid有传的情况下，sub_appid必填，且sub_appid需与sub_openid对应 示例值：wxd678efh567hg6999

      description: data.describe ? data.describe : "小象助手为您服务", // 商品描述		string[1,127]	是	body 商品描述  示例值：Image形象店-深圳腾大-QQ公仔
      out_trade_no: data.outTradeNo ?? "", // 商户订单号		string[6,32]	是	body 商户系统内部订单号，只能是数字、大小写字母_-*且在同一个商户号下唯一。  示例值：1217752501201407033233368018
      // time_expire: "", // 交易结束时间		string[1,64]	否	body 订单失效时间，遵循rfc3339标准格式，格式为yyyy-MM-DDTHH:mm:ss+TIMEZONE，yyyy-MM-DD表示年月日，T出现在字符串中，表示time元素的开头，HH:mm:ss表示时分秒，TIMEZONE表示时区（+08:00表示东八区时间，领先UTC8小时，即北京时间）。例如：2015-05-20T13:29:35+08:00表示，北京时间2015年5月20日 13点29分35秒。 示例值：2018-06-08T10:34:56+08:00
      attach: `${data._id},${data.regiment_OPENID},${data.product_type}`, // 附加数据		string[1,128]	否	body 附加数据，在查询API和支付通知中原样返回，可作为自定义参数使用，实际情况下只有支付完成状态才会返回该字段。 示例值：自定义数据

      notify_url: environment.envVersion === "release" ?
        `${cfg.pro_url}/a__wxpay_callback_sub_cloud` :
        `${cfg.dev_url}/a__wxpay_callback_sub_cloud`, // 通知地址		string[1,256]	是	不允许携带查询串，要求必须为https地址。
      // goods_tag: "", // 订单优惠标记		string[1,32]	否	body 订单优惠标记 示例值：WXG
      // support_fapiao: "", // 电子发票入口开放标识		boolean	否	body 传入true时，支付成功消息和支付详情页将出现开票入口。需要在微信支付商户平台或微信公众平台开通电子发票功能，传此字段才可生效。  true：是 false：否     示例值：true
      // settle_info: {
      //   profit_sharing: "", // 是否指定分账	profit_sharing	boolean	否	是否指定分账，枚举值 true：是 false：否 示例值：true
      // }, // 结算信息		object	否	body 结算信息
      amount: {
        total: data.totalFee!, // 总金额		int	是	订单总金额，单位为分。 示例值：100
        currency: "CNY", // 货币类型		string[1,16]	否	CNY：人民币，境内商户号仅支持人民币。 示例值：CNY
      }, // 订单金额		object	是	body 订单金额信息
      payer: {
        sp_openid: data.self_OPENID!, // 用户服务标识		string[1,128]	二选一	用户在服务商appid下的唯一标识。 下单前需获取到用户的Openid，Openid获取详见。 示例值：oUpF8uMuAJO_M2pxb1Q9zNjWeS6o
        sub_openid: data.self_OPENID!, // 用户子标识		string[1,128] 二选一	用户在子商户appid下的唯一标识。若传sub_openid，那sub_appid必填。下单前需获取到用户的Openid，Openid获取详见。 示例值：oUpF8uMuAJO_M2pxb1Q9zNjWeS6o
      }, // 支付者		object	是	body 支付者信息
      // detail: {
      //   cost_price: "", // 订单原价		int	否	1、商户侧一张小票订单可能被分多次支付，订单原价用于记录整张小票的交易金额。 2、当订单原价与支付金额不相等，则不享受优惠。  3、该字段主要用于防止同一张小票分多次支付，以享受多次优惠的情况，正常支付订单不必上传此参数。   示例值：608800
      //   invoice_id: "", // 商品小票ID		string[1,32]	否	商家小票ID  示例值：微信123
      //   goods_detail: [], // 单品列表		array	否	单品列表信息 条目个数限制：【1，6000】
      // }, // 优惠功能		object	否	body 优惠功能
      // scene_info: {
      //   payer_client_ip: "", // 用户终端IP		string[1,45]	是	用户的客户端IP，支持IPv4和IPv6两种格式的IP地址。示例值：14.23.150.211
      //   device_id: "", // 商户端设备号		string[1,32]	否	商户端设备号（门店号或收银设备ID）。 示例值：013467007045764
      //   store_info: [], // 商户门店信息		object	否	商户门店信息
      // }, // 场景信息		object	否	body 支付场景描述
    });
    return res as any as PayRes;
  } catch (err: any) {
    throw err;
  }
}

// 退款
export async function wxPay_express_refund_cloud(event: Events<Product_Express>): Promise<Result<PayRes>> {
  const { data } = event;
  try {
    const res0 = data.regiment_sub_mchId ? await ___wxpay_refund_sub(event) : await ___wxpay_refund_headquarters_account(event);
    if (res0.errMsg == "cloudPay.refund:ok") {
      const res1 = <DB.IUpdateResult>await db.collection("orders").doc(data._id!).update({
        data: {
          payStatus: PayStatus.PAY3_, // 支付中状态
          timestamp_update: Date.now(),
        },
      });
      if (res1.errMsg === "document.update:ok" && res1.stats.updated === 1) {
        return {
          code: Code.SUCCESS,
          message: res0.errMsg,
          data: res0,
        };
      } else {
        throw new Error(`更新支付状态错误，${res0.errMsg}`);
      }
    } else {
      throw new Error(`微信支付错误，${res0.errMsg}`);
    }
  } catch (err: any) {
    throw err;
  }
}
// 退款-总账商户
async function ___wxpay_refund_headquarters_account(event: Events<Product_Express>): Promise<PayRes> {
  try {
    const { data, environment } = event;
    const res = await wxPay.refunds({
      sub_mchid: "1639331479",
      out_trade_no: data.outTradeNo!,
      out_refund_no: String(data._id!), // 退款单号
      reason: "测试", // 退款原因
      notify_url: environment.envVersion === "release" ?
        `${cfg.pro_url}/a__wxpay_callback_sub_cloud_refund` :
        `${cfg.dev_url}/a__wxpay_callback_sub_cloud_refund`,
      // funds_account: "string",// 退款资金来源 若传递此参数则使用对应的资金账户退款，否则默认使用未结算资金退款（仅对老资金流商户适用）枚举值：AVAILABLE：可用余额账户示例值：AVAILABLE
      amount: {
        total: data.totalFee!,
        currency: "CNY",
        refund: data.totalFee!,
      },
    });
    if (res.status === "PROCESSING") {
      return { ...res, errMsg: "cloudPay.refund:ok" } as any as PayRes;
    } else {
      throw res;
    }

  } catch (err: any) {
    throw err;
  }
}
// 退款-独立商户
async function ___wxpay_refund_sub(event: Events<Product_Express>): Promise<PayRes> {
  try {
    const { data, environment } = event;
    const res = await wxPay.refunds({
      sub_mchid: data.regiment_sub_mchId!,
      out_trade_no: data.outTradeNo!,
      out_refund_no: String(data._id!), // 退款单号
      reason: "测试", // 退款原因
      notify_url: environment.envVersion === "release" ?
        `${cfg.pro_url}/a__wxpay_callback_sub_cloud_refund` :
        `${cfg.dev_url}/a__wxpay_callback_sub_cloud_refund`,
      // funds_account: "string",// 退款资金来源 若传递此参数则使用对应的资金账户退款，否则默认使用未结算资金退款（仅对老资金流商户适用）枚举值：AVAILABLE：可用余额账户示例值：AVAILABLE
      amount: {
        total: data.totalFee!,
        currency: "CNY",
        refund: data.totalFee!,
      },
    });
    if (res.status === "PROCESSING") {
      return { ...res, errMsg: "cloudPay.refund:ok" } as any as PayRes;
    } else {
      throw res;
    }

  } catch (err: any) {
    throw err;
  }
}




/**
 * @deprecated  云函数统一下单退款接口，今已弃用，以做纪念
 */
async function ___wxpay_refund(event: Events<Product_Express>): Promise<PayRes> {
  try {
    const { data, environment } = event;
    const res = await cloud.cloudPay.refund({
      functionName: "a__wxpay_callback_cloud_refund", // 回调函数名称
      envId: environment.envId, // 结果通知回调云函数环境
      sub_mch_id: "1612524003", // String(32) 子商户号
      nonce_str: data._id,// String(32) 随机字符串
      // transaction_id:"", // String(32)	 微信订单号。与商户订单号二选一填入。
      out_trade_no: data.outTradeNo,  // String(32) 商户订单号，不能重复
      out_refund_no: data._id, // String(64) 商户系统内部的退款单号，商户系统内部唯一，只能是数字、大小写字母_-
      total_fee: data.totalFee, // 订单总金额，单位为分，只能为整数，详见支付金额
      refund_fee: data.totalFee, // 退款总金额，单位为分，只能为整数，可部分退款。详见支付金额
      refund_fee_type: "CNY", // String(8) 货币类型，符合ISO 4217标准的三位字母代码，默认人民币：CNY，其他值列表详见货
      refund_desc: "测试啊", // String(80) 退款原因 注意：若订单退款金额≤1元，且属于部分退款，则不会在退款消息中体现退款原因
      // refund_account: "", // String(30)  仅针对老资金流商户使用 REFUND_SOURCE_UNSETTLED_FUNDS---未结算资金退款（默认使用未结算资金退款）REFUND_SOURCE_RECHARGE_FUNDS---可用余额退款  返回值说明
    });
    console.log("退款返回结果:", res);
    if (res.returnCode === "SUCCESS" && res.resultCode === "SUCCESS") {
      return res as PayRes;
    } else {
      throw res;
    }
  } catch (err: any) {
    throw err;
  }
}

/**
 * @deprecated  云函数统一下单接口，今已弃用，以做纪念
 */
async function ___wxpay(event: Events<Product_Express>): Promise<PayRes> {
  try {
    const { data, environment } = event;
    const res = await cloud.cloudPay.unifiedOrder({
      functionName: "a__wxpay_callback_cloud", // 回调函数名称
      envId: environment.envId, // 结果通知回调云函数环境
      spbillCreateIp: "127.0.0.1",
      subMchId: "1612524003", // String(32) 子商户号
      // deviceInfo:"", // String(32)  终端设备号(门店号或收银设备ID)，注意：PC网页或公众号内支付请传"WEB"
      nonceStr: data._id,// String(32) 随机字符串
      body: data.describe ?? "订单描述", // String(128) 订单描述 在微信支付成功的回执上面显示的
      detail: "", // String(6000) 商品详细描述，对于使用单品优惠的商户，该字段必须按照规范上传，详见“单品优惠参数说明”
      attach: data.product_type,  // data.product_type,  // String(127) 附加数据，在查询API和支付通知中原样返回，该字段主要用于商户携带订单的自定义数据
      outTradeNo: data.outTradeNo,  // String(32) 商户订单号，不能重复
      // feeType:"CNY",  // String(16) 货币类型
      totalFee: data.totalFee, // 总金额
      // spbillCreateIp:"", // 终端IP 支持IPV4和IPV6两种格式的 IP 地址。调用微信支付 API 的机器IP
      // timeStart:"",  // String(14)  订单生成时间，格式为yyyyMMddHHmmss，如2009年12月25日9点10分10秒表示为20091225091010。其他详见时间规则
      // timeExpire:"", // String(14)  订单失效时间，格式为yyyyMMddHHmmss，如2009年12月27日9点10分10秒表示为20091227091010。订单失效时间是针对订单号而言的，由于在请求支付的时候有一个必传参数prepay_id只有两小时的有效期，所以在重入时间超过2小时的时候需要重新请求下单接口获取新的prepay_id。其他详见时间规则。建议：最短失效时间间隔大于1分钟
      // goodsTag:"WXG", // String(32)  订单优惠标记，代金券或立减优惠功能的参数，说明详见代金券或立减优惠
      // tradeType:"JSAPI", // String(16)  小程序取值如下：JSAPI，详细说明见参数规定
      // limitPay:"no_credit", // no_credit--指定不能使用信用卡支付
      openid: data.self_OPENID,  // String(128)   trade_type=JSAPI，此参数必传，用户在商户 appid 下的唯一标识。openid如何获取，可参考【获取openid】。
      subOpenid: data.regiment_OPENID,  // String(128)  trade_type=JSAPI，此参数必传，用户在子商户 appid 下的唯一标识。openid和sub_openid可以选传其中之一，如果选择传sub_openid,则必须传sub_appid。下单前需要调用【网页授权获取用户信息】接口获取到用户的Openid。
      // receipt:"", // String(8)  Y，传入 Y 时，支付成功消息和支付详情页将出现开票入口。需要在微信支付商户平台或微信公众平台开通电子发票功能，传此字段才可生效
      // sceneInfo:"", // String(256) 该字段常用于线下活动时的场景信息上报，支持上报实际门店信息，商户也可以按需求自己上报相关信息。该字段为 JSON 对象数据，对象格式为{"store_info":{"id": "门店ID","name": "名称","area_code": "编码","address": "地址" }}
    });
    if (res.returnCode === "SUCCESS" && res.resultCode === "SUCCESS") {
      return res as PayRes;
    } else {
      throw res;
    }
  } catch (err: any) {
    throw err;
  }
}

