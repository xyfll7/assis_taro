import { Code } from "../../../client/src/a_config";
// 云函数代码
import cloud from "wx-server-sdk";

// @ts-ignore
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

export async function getSelfInfo_cloud(): Promise<Result<BaseUserInfo>> {
  const { OPENID } = cloud.getWXContext();
  try {
    const res = <cloud.DB.IAggregateResult>await db.collection("users").aggregate().match({ _id: OPENID }).lookup({
      from: 'users',
      localField: 'regiment_OPENID',
      foreignField: 'OPENID',
      as: 'regiment_info',
    }).end();
    if (res.errMsg == "collection.aggregate:ok" && res.list.length === 1) {
      // 根据myRegimentId查找我的团长信息
      const [regiment_info] = res.list[0]?.regiment_info ?? [] as BaseUserInfo[];
      const [userInfo] = res.list as BaseUserInfo[];
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: { ...userInfo, regiment_info: regiment_info ?? null },
        res
      };
    } else if (res.errMsg === "collection.aggregate:ok" && res.list.length === 0) {
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: { OPENID },
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
export async function getUserInfo_cloud(event: Events<string>): Promise<Result<BaseUserInfo>> {
  try {
    const { data } = event;
    const res = <cloud.DB.IQuerySingleResult>await db.collection("users").doc(data).get();
    if (res.errMsg == "document.get:ok") {
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: res.data as BaseUserInfo,
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
// 获取团队成员列表
export async function getTeamList_cloud(event: Events<string>): Promise<Result<BaseUserInfo[]>> {
  try {
    const { data } = event;
    const res = <cloud.DB.IQuerySingleResult>await db.collection("users")
      .orderBy("timestamp_update", "desc")
      .where({
        regiment_OPENID: data,
        regiment_replica_regiment_OPENID: data,
        regiment_replica_is: true
      }).get();
    if (res.errMsg == "collection.get:ok") {
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
export async function getRegimentList_cloud(): Promise<Result<BaseUserInfo[]>> {
  try {
    const res = <cloud.DB.IQuerySingleResult>await db.collection("users")
      .orderBy("timestamp_update", "desc")
      .where({
        regiment_is: _.or([_.eq(1)])
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
export async function updateUserInfo_cloud(event: Events<BaseUserInfo, string>): Promise<Result<BaseUserInfo>> {
  try {
    let { _id, regiment_info, ...data } = event.data;
    let { params } = event;
    if (params) {
      const res0 = <cloud.DB.IQuerySingleResult>await db.collection("users").doc(params!).get();
      if (res0.errMsg == "document.get:ok" && res0.data?.regiment_is === 1) {
        regiment_info = res0.data as BaseUserInfo;
        data.regiment_OPENID = params;
      }
    }

    data.timestamp_update = Date.now();
    let res = <cloud.DB.ISetResult>await db.collection("users")
      .doc(data.OPENID!).set({ data: { ...data } as BaseUserInfo });
    if (res.errMsg === "document.set:ok") {
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: { ...data, _id: data.OPENID, regiment_info, },
        res
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
