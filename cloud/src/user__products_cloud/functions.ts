// 云函数代码
import cloud from "wx-server-sdk";

// @ts-ignore
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

export async function addProduct_cloud(): Promise<Result<BaseUserInfo>> {
  return null as any;
}
