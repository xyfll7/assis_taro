import { wx_cloud_callFunctions } from "./wx_cloud_callFunctions";

export async function Api_users_getSelfInfo(): Promise<BaseUserInfo> {
  try {
    const res = await wx_cloud_callFunctions<BaseUserInfo>({
      name: "user__users_cloud",
      data: {
        func: "getSelfInfo_cloud",
        // data: "oGwbL5FKCrALVPc-XBeBspHo_gMw"
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}
export async function Api_users_getUserInfo(OPENID: string): Promise<BaseUserInfo> {
  try {
    const res = await wx_cloud_callFunctions<BaseUserInfo>({
      name: "user__users_cloud",
      data: {
        func: "getUserInfo_cloud",
        data: OPENID
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}
export async function Api_users_getTeamList(OPENID: string): Promise<BaseUserInfo[]> {
  try {
    const res = await wx_cloud_callFunctions<BaseUserInfo[]>({
      name: "user__users_cloud",
      data: {
        func: "getTeamList_cloud",
        data: OPENID
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}
export async function Api_users_getRegimentList(): Promise<BaseUserInfo[]> {
  try {
    const res = await wx_cloud_callFunctions<BaseUserInfo[]>({
      name: "user__users_cloud",
      data: {
        func: "getRegimentList_cloud"
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}
export async function Api_users_updateUserInfo(
  data: BaseUserInfo,
  params?: string
): Promise<BaseUserInfo> {
  try {
    const res = await wx_cloud_callFunctions<BaseUserInfo>({
      name: "user__users_cloud",
      data: {
        func: "updateUserInfo_cloud",
        data: data,
        params: params
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}
