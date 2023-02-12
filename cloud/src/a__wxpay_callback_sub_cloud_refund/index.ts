
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
    const res = wxSign.decipher_gcm<RefundEvent_sub>(body.resource.ciphertext, body.resource.associated_data, body.resource.nonce,);
    await ___update_order_info_refund(res);
    await ___update_collection_record_refund(res);
    return {
      "code": "SUCCESS",
      "message": "成功"
    };
  }
};

//#region 更新订单支付状态-退款
async function ___update_order_info_refund(data: RefundEvent_sub) {
  try {
    const _timestamp = (new Date(data.success_time).getTime());
    const res = <cloud.DB.IUpdateResult>await db.collection("orders").doc(data.out_refund_no)
      .update({
        data: {
          payStatus: PayStatus.PAY3,
          timestamp_pay_callback_refund: _timestamp,
          timestamp_update: Date.now(),
          order_refund: { ...data }
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

//#region 更新收款记录-退款
async function ___update_collection_record_refund(data: RefundEvent_sub) {
  try {
    const _timestamp = (new Date(data.success_time).getTime());
    const res = <cloud.DB.IUpdateResult>await db.collection("collections").doc(data.out_trade_no)
      .update({
        data: {
          payStatus: PayStatus.PAY3,
          timestamp_pay_callback_refund: _timestamp,
          timestamp_update: Date.now(),
          order_refund: { ...data }
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



