import { Code } from '../../../client/src/a_config';
import { getPhoneNumber_cloud, createQRCode_cloud, getPrice_cloud } from "./functions";

// 云函数入口函数
export const main = async (event: Events<any>,) => {
  try {
    switch (event.func) {
      case "getPhoneNumber_cloud":
        return await getPhoneNumber_cloud(event);
      case "createQRCode_cloud":
        return await createQRCode_cloud(event);
      case "getPrice_cloud":
        return await getPrice_cloud(event);
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
