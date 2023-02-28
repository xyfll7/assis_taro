import { Code } from '../../../client/src/a_config';
import { printExpress_cloud, printExpress_excle_cloud } from "./functions";

// 云函数入口函数
export const main = async (event: Events<any>,) => {
  try {
    switch (event.func) {
      case "printExpress_cloud":
        return await printExpress_cloud(event);
      case "printExpress_excle_cloud":
        return await printExpress_excle_cloud(event);
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
