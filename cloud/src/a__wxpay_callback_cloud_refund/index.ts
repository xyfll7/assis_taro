

import cloud from "wx-server-sdk";
import { PayStatus } from "../../../client/src/a_config";
// @ts-ignore
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
// 云函数入口函数
export const main = async (event: RefundEvent) => {
  if (event.returnCode === "SUCCESS" && event.refundStatus === "SUCCESS") {
    // 支付成功
    try {
      await ___update_order_info_refund(event);
      await ___update_collection_record_refund(event);
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


//#region 更新订单支付状态-退款
async function ___update_order_info_refund(data: RefundEvent) {
  try {
    const _timestamp = (new Date(data.successTime).getTime());
    const res = <cloud.DB.IUpdateResult>await db.collection("orders").doc(data.outRefundNo)
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
async function ___update_collection_record_refund(data: RefundEvent) {
  try {
    const _timestamp = (new Date(data.successTime).getTime());
    const res = <cloud.DB.IUpdateResult>await db.collection("collections").doc(data.outRefundNo)
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


