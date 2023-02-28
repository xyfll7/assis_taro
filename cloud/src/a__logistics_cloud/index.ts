import { Code } from '../../../client/src/a_config';
import { getAllAccount_cloud, addOrder_cloud, getOrder_cloud, getPath_cloud, bindAccount_cloud, getAllDelivery_cloud, cancelOrder_cloud, getQuota_cloud } from "./functions";

// 云函数入口函数
export const main = async (event: Events<any>,) => {
  try {
    switch (event.func) {
      case "getAllAccount_cloud":
        return await getAllAccount_cloud(event);
      case "addOrder_cloud":
        return await addOrder_cloud(event);
      case "getOrder_cloud":
        return await getOrder_cloud(event);
      case "getPath_cloud":
        return await getPath_cloud(event);
      case "bindAccount_cloud":
        return await bindAccount_cloud(event);
      case "getAllDelivery_cloud":
        return await getAllDelivery_cloud();
      case "cancelOrder_cloud":
        return await cancelOrder_cloud(event);
      case "getQuota_cloud":
        return await getQuota_cloud(event);
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
