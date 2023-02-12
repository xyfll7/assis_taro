import { addOrder_cloud, getOrderList_cloud, getOrderExpress_cloud, updateOrder_express_cloud, removeOrder_cloud } from "./functions";

// 云函数入口函数
export const main = async (event: Events<any>,) => {
  switch (event.func) {
    case "addOrder_cloud":
      return await addOrder_cloud(event);
    case "removeOrder_cloud":
      return await removeOrder_cloud(event);
    case "getOrderList_cloud":
      return await getOrderList_cloud(event);
    case "updateOrder_express_cloud":
      return await updateOrder_express_cloud(event);
    case "getOrderExpress_cloud":
      return await getOrderExpress_cloud(event);
    default: return "没有调用任何云函数";
  }
};
