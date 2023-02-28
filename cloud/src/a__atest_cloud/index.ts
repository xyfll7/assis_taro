import cloud from "wx-server-sdk";
import { Code } from '../../../client/src/a_config';

// @ts-ignore
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

// 云函数入口函数
export const main = async (event: Events<any>,) => {
  try {
    switch (event.func) {
      case "init_cloud":
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
