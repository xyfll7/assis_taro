import { getAddressList_cloud, addAddress_cloud, updateAddress_cloud, removeAddress_cloud } from "./functions";

// 云函数入口函数
export const main = async (event: Events<any>,) => {
  switch (event.func) {
    case "addAddress_cloud":
      return await addAddress_cloud(event);
    case "getAddressList_cloud":
      return await getAddressList_cloud(event);
    case "updateAddress_cloud":
      return await updateAddress_cloud(event);
    case "removeAddress_cloud":
      return await removeAddress_cloud(event);
    default: return "没有调用任何云函数";
  }
};
