
import { WxSign } from "../utils/wxpay";
import fs from 'fs';
import cloud from "wx-server-sdk";
import { PayStatus } from "../../../client/src/a_config";
// @ts-ignore
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
// 云函数入口函数

const wxSign = new WxSign({
  sp_mchid: '1635060558',
  sp_appid: 'wxc6ff511796ec714a',
  publicKey: fs.readFileSync('./apiclient_cert.pem'), // 公钥
  privateKey: fs.readFileSync('./apiclient_key.pem'), // 秘钥
  serial_no: "197A9803A1B80005AED3AC68A3957E2EBB774177", // 申请API证书 证书序列号
  key: "91610602MA6YF6FK6C17709205217000", // APIv3密钥
});

export const main = async (event: any,) => {
  // 签名验证
  const body = JSON.parse(event.body);
  const res = await wxSign.verifySign({
    nonce: event.headers["wechatpay-nonce"],
    serial: event.headers["wechatpay-serial"],
    signature: event.headers["wechatpay-signature"],
    timestamp: event.headers["wechatpay-timestamp"],
    body
  });
  if (!res) {
    throw {
      "code": "FAIL",
      "message": "失败"
    };
  } else {
    const res = wxSign.decipher_gcm<any>(body.resource.ciphertext, body.resource.associated_data, body.resource.nonce,);
    await ___update_order_info(res);
    await ___add_collection_record(res);
    return {
      "code": "SUCCESS",
      "message": "成功"
    };
  }
};

//#region 更新订单支付状态
async function ___update_order_info(event: PayBackEvent_sub) {
  try {
    const res = <cloud.DB.IUpdateResult>await db.collection("orders").doc(event.attach.split(",")[0])
      .update({
        data: {
          payStatus: PayStatus.PAY2,
          outTradeNo: event.out_trade_no,
          timestamp_pay_callback: Date.now(),
          transaction_id: event.transaction_id,
          success_time: event.success_time,
          timestamp_update: Date.now(),
        }
      });
    if (res.errMsg === "document.update:ok" && res.stats.updated === 1) {
      return true;
    } else {
      throw res;
    }
  } catch (err) {
    throw err;
  }
}
//#endregion

//#region 添加收款记录
async function ___add_collection_record(event: PayBackEvent_sub) {
  try {

    const _timestamp = (new Date(event.success_time).getTime());
    const res = <cloud.DB.IAddResult>await db.collection("collections").add({
      data: {
        _id: event.out_trade_no,
        ...event,
        product_type: event.attach.split(",")[2],
        self_OPENID: event.payer.sp_openid,
        regiment_OPENID: event.attach.split(",")[1],
        timestamp_pay_success: _timestamp,
        timestamp_update: Date.now()
      }
    });
    if (res.errMsg === "collection.add:ok") {
      return true;
    } else {
      throw res;
    }
  } catch (err) {
    throw err;
  }
}
//#endregion

// cSpell:ignore Jnohy Pyso gjendolp
interface AAA {
  "sp_mchid": "1635060558",
  "sub_mchid": "1635394505",
  "sp_appid": "wxc6ff511796ec714a",
  "sub_appid": "wxc6ff511796ec714a",
  "out_trade_no": "JnohyARPysoNc-kVtUiJLY1gjendolp",
  "transaction_id": "4200001650202212045743467024",
  "trade_type": "JSAPI",
  "trade_state": "SUCCESS",
  "trade_state_desc": "支付成功",
  "bank_type": "OTHERS",
  "attach": "1f154439638a29eb0125b70c5d78eaae,oGwbL5P_IBh9s4s8-JFdPrQhDHoA,express",
  "success_time": "2022-12-04T22:07:51+08:00",
  "payer": {
    "sp_openid": "oGwbL5JnohyARPysoNc-kVtUiJLY",
    "sub_openid": "oGwbL5JnohyARPysoNc-kVtUiJLY";
  },
  "amount": {
    "total": 1,
    "payer_total": 1,
    "currency": "CNY",
    "payer_currency": "CNY";
  };
}


interface PayBackEvent_sub {
  "sp_appid": string; //"wx8888888888888888",
  "sp_mchid": string; //"1230000109",
  "sub_appid": string; //"wxd678efh567hg6999",
  "sub_mchid": string; //"1900000109",
  "out_trade_no": string; //"1217752501201407033233368018",
  "trade_state_desc": string; //"支付成功",
  "trade_type": string; //"MICROPAY",
  "attach": string; //"自定义数据",
  "transaction_id": string; //"1217752501201407033233368018",
  "trade_state": string; //"SUCCESS",
  "bank_type": string; //"CMC",
  "success_time": string; //"2018-06-08T10:34:56+08:00",
  "amount": {   // 订单金额信息
    "payer_total": number; //100,
    "total": number; //100,
    "currency": string; //"CNY",
    "payer_currency": string; //"CNY"
  },
  "promotion_detail": {  // 优惠功能，享受优惠时返回该字段。
    "amount": number; //100,
    "wechatpay_contribute": number; //0,
    "coupon_id": string; //"109519",
    "scope": string; //"GLOBAL",
    "merchant_contribute": number; //0,
    "name": string; //"单品惠-6",
    "other_contribute": number; //0,
    "currency": string; //"CNY",
    "stock_id": string; //"931386",
    "goods_detail": {
      "goods_remark": string; //"商品备注信息",
      "quantity": number; //1,
      "discount_amount": number; //1,
      "goods_id": string; //"M1006",
      "unit_price": number; //100
    }[];
  }[],
  "payer": {  // 支付者信息
    "openid": string; //"oUpF8uMuAJO_M2pxb1Q9zNjWeS6o"
    "sp_openid": string; //"oUpF8uMuAJO_M2pxb1Q9zNjWeS6o"
    "sub_openid": string; //"oUpF8uMuAJO_M2pxb1Q9zNjWeS6o"
  },
  "scene_info": { // 支付场景信息描述
    "device_id": string; //"013467007045764"
  };
}
