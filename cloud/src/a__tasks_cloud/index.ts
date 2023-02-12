import { getPhoneNumber_cloud, createQRCode_cloud } from "./functions";

// 云函数入口函数
export const main = async (event: Events<any>,) => {
  switch (event.func) {
    case "getPhoneNumber_cloud":
      return await getPhoneNumber_cloud(event);
    case "createQRCode_cloud":
      return await createQRCode_cloud(event);
    default: return "没有调用任何云函数";
  }
};
