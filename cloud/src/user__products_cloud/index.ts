import { addProduct_cloud } from "./functions";

// 云函数入口函数
export const main = async (event: Events<any>,) => {
  switch (event.func) {
    case "addProduct_cloud":
      return await addProduct_cloud();
    default: return "没有调用任何云函数";
  }
};
