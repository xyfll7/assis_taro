import { Code } from '../../../client/src/a_config';
import { getSelfInfo_cloud, getRegimentListNearby_cloud, updateUserInfo_cloud, getUserInfo_cloud, getTeamList_cloud } from "./functions";

// 云函数入口函数
export const main = async (event: Events<any, any>,) => {
  try {
    switch (event.func) {
      case "getSelfInfo_cloud":
        return await getSelfInfo_cloud(event);
      case "getUserInfo_cloud":
        return await getUserInfo_cloud(event);
      case "getTeamList_cloud":
        return await getTeamList_cloud(event);
      case "getRegimentListNearby_cloud":
        return await getRegimentListNearby_cloud(event);
      case "updateUserInfo_cloud":
        return await updateUserInfo_cloud(event);
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
