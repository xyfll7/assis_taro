import { users_getRegimentList_cloud } from "./functions_users";
import { price_getPriceSchemeList_cloud } from "./functions_price";
import { Code } from '../../../client/src/a_config';

// 云函数入口函数
export const main = async (event: Events<any, any>,) => {
  try {
    switch (event.func) {
      case "users_getRegimentList_cloud":
        return await users_getRegimentList_cloud();
      case "price_getPriceSchemeList_cloud":
        return await price_getPriceSchemeList_cloud();
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
