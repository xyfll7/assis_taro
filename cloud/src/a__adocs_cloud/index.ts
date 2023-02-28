import { Code } from '../../../client/src/a_config';
import { get_token, login, get_refund_order, get_logistics_track } from "./functions";



// 云函数入口函数
export const main = async (event: any,) => {
  try {
    switch (event.path) {
      case "/get_token":
        return await get_token();
      case "/login":
        return await login(event);
      case "/get_refund_order":
        return await get_refund_order(event);
      case "/get_logistics_track":
        return await get_logistics_track(event);
      default: return "没有调用任何云函数";
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



