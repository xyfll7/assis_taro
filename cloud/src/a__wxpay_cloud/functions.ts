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
