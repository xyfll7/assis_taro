
import { wx_cloud_callFunctions } from "./wx_cloud_callFunctions";

export async function Api_wxpay_wxPay_express(params: Product_Express): Promise<PayRes> {
  try {
    const res = await wx_cloud_callFunctions<PayRes>({
      name: "a__wxpay_cloud",
      data: {
        func: "wxPay_express_cloud",
        data: { ...params }
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}

export async function Api_wxpay_wxPay_express_refund(params: Product_Express): Promise<any> {
  try {
    const res = await wx_cloud_callFunctions<any>({
      name: "a__wxpay_cloud",
      data: {
        func: "wxPay_express_refund_cloud",
        data: { ...params }
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}
