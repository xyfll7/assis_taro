import { Code } from '../../../client/src/a_config';
import {
  getCollectionList_cloud,
  getCollectionHistoryList_cloud,
  getCollectionExcel_cloud,
} from "./functions";

// 云函数入口函数
export const main = async (event: Events<any>) => {
  try {
    switch (event.func) {
      case "getCollectionList_cloud":
        return await getCollectionList_cloud(event);
      case "getCollectionHistoryList_cloud":
        return await getCollectionHistoryList_cloud(event);
      case "getCollectionExcel_cloud":
        return await getCollectionExcel_cloud(event);
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
