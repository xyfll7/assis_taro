import {
  getCollectionList_cloud,
  getCollectionHistoryList_cloud,
  getCollectionExcel_cloud,
} from "./functions";

// 云函数入口函数
export const main = async (event: Events<any>) => {
  switch (event.func) {
    case "getCollectionList_cloud":
      return await getCollectionList_cloud(event);
    case "getCollectionHistoryList_cloud":
      return await getCollectionHistoryList_cloud(event);
    case "getCollectionExcel_cloud":
      return await getCollectionExcel_cloud(event);
    default:
      return "没有调用任何云函数";
  }
};
