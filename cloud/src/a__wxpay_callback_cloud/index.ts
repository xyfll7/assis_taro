
import cloud from "wx-server-sdk";
import { PayStatus } from "../../../client/src/a_config";
// @ts-ignore
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

//#region  支付回调，文章： https://www.jianshu.com/p/5a6f42b265e9
export const main = async (event: PayBackEvent): Promise<PayBackReturn> => {
  if (event.returnCode === "SUCCESS" && event.resultCode === "SUCCESS") {
    // 支付成功
    try {
      await ___update_order_info(event);
      await ___add_collection_record(event);
      return {
        errcode: 0,
        errmsg: "SUCCESS",
      };
    } catch (err) {
      return {
        errcode: 1,
        errmsg: "FAIL",
      };
    }
  } else {
    // 支付失败
    return {
      errcode: 1,
      errmsg: "FAIL",
    };
  }
};
//#endregion

//#region 更新订单支付状态
async function ___update_order_info(event: PayBackEvent) {
  try {
    const _timestamp = Date.now();
    const res = <cloud.DB.IUpdateResult>await db.collection("orders").doc(event.nonceStr)
      .update({
        data: {
          payStatus: PayStatus.PAY2,
          outTradeNo: event.outTradeNo,
          timestamp_pay_callback: _timestamp,
          timestamp_update: _timestamp
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
async function ___add_collection_record(event: PayBackEvent) {
  try {
    const str = event.timeEnd;
    const _timestamp = (new Date(
      Number(str.slice(0, 4)),
      Number(str.slice(4, 6)) - 1,
      Number(str.slice(6, 8)),
      Number(str.slice(8, 10)),
      Number(str.slice(10, 12)),
      Number(str.slice(12, 14)))).getTime();

    const res = <cloud.DB.IAddResult>await db.collection("collections").add({
      data: {
        _id: event.outTradeNo,
        ...event,
        product_type: event.attach,
        self_OPENID: event.openid,
        regiment_OPENID: event.subOpenid,
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

