import { printExpress_cloud, printExpress_excle_cloud } from "./functions";

// 云函数入口函数
export const main = async (event: Events<any>,) => {
  switch (event.func) {
    case "printExpress_cloud":
      return await printExpress_cloud(event);
    case "printExpress_excle_cloud":
      return await printExpress_excle_cloud(event);
    default: return "没有调用任何云函数";
  }
};
