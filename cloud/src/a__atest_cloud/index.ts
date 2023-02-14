import cloud from "wx-server-sdk";

// @ts-ignore
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

// 云函数入口函数
export const main = async (event: Events<any>,) => {
  switch (event.func) {
    case "init_cloud":


    default: return "没有调用任何云函数";
  }
};
