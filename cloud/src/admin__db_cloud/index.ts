import { users_getRegimentList_cloud } from "./functions_users";
import { price_getPriceSchemeList_cloud } from "./functions_price";

// 云函数入口函数
export const main = async (event: Events<any, any>,) => {
  switch (event.func) {
    case "users_getRegimentList_cloud":
      return await users_getRegimentList_cloud();
    case "price_getPriceSchemeList_cloud":
      return await price_getPriceSchemeList_cloud();
    default: return "没有调用任何云函数";
  }
};
