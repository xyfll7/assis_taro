import { Code } from '../../../client/src/a_config';
import { wxPay_express_cloud, wxPay_express_refund_cloud } from "./functions";

// 云函数入口函数
export const main = async (event: Events<any>,) => {
  try {

    switch (event.func) {
      case "wxPay_express_cloud":
        return await wxPay_express_cloud(event);
      case "wxPay_express_refund_cloud":
        return await wxPay_express_refund_cloud(event);
      default: throw Error("没有调用任何云函数");
    }
  } catch (err: any) {
    if (err instanceof Error) {
      return {
        code: Code.SERVER_ERROR,
        message: err.message,
        err
      };
    } else {
      return {
        code: Code.SERVER_ERROR,
        message: `未知错误，${err.errMsg}`,
        err
      };
    }
  }
};
