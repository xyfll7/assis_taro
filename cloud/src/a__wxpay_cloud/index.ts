import { wxPay_express_cloud, wxPay_express_refund_cloud } from "./functions";

// 云函数入口函数
export const main = async (event: Events<any>,) => {
  switch (event.func) {
    case "wxPay_express_cloud":
      return await wxPay_express_cloud(event);
    case "wxPay_express_refund_cloud":
      return await wxPay_express_refund_cloud(event);
    default: return "没有调用任何云函数";
  }
};
