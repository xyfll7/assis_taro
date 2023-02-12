import { Code } from "../../../client/src/a_config";
// 云函数代码
import cloud from "wx-server-sdk";

// @ts-ignore
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

export async function users_getRegimentList_cloud(): Promise<Result<BaseUserInfo[]>> {
  try {
    const res = <cloud.DB.IQuerySingleResult>await db.collection("users")
      .orderBy("timestamp_update", "desc")
      .where({
        regiment_is: _.or([_.eq(0), _.eq(1)])
      }).get();
    if (res.errMsg == "collection.get:ok") {
      // 根据myRegimentId查找我的团长信息
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: res.data as BaseUserInfo[],
        res
      };
    } else {
      return {
        code: Code.DATABASE_ERROR,
        message: `数据库执行错误`,
        res,
      };
    }
  } catch (err: any) {
    return {
      code: Code.SERVER_ERROR,
      message: `未知错误`,
      err
    };
  }
}
