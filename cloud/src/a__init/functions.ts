import { Code } from "../../../client/src/a_config";
// 云函数代码
import cloud from "wx-server-sdk";

// @ts-ignore
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

export async function init_cloud(event: Events<any>): Promise<Result<any>> {
  try {
    const res = <cloud.DB.IQuerySingleResult>await db.collection("ztest").doc("test").get();
    if (res.errMsg == "") {
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: res.data,
      };
    } else {
      return {
        code: Code.DATABASE_ERROR,
        message: `数据库执行错误，${res.errMsg}。`,
        res
      };
    }
  } catch (err: any) {
    return {
      code: Code.SERVER_ERROR,
      message: `未知错误，${err.errMsg}`,
      err
    };
  }
}


