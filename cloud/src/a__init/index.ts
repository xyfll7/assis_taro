import { init_cloud } from "./functions";

// 云函数入口函数
export const main = async (event: Events<any>,) => {
  switch (event.func) {
    case "init_cloud":
      return await init_cloud(event);

    default: return "没有调用任何云函数";
  }
};
