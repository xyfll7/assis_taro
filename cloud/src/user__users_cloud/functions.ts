import { Code } from "../../../client/src/a_config";
// 云函数代码
import cloud from "wx-server-sdk";
import Taro from "@tarojs/taro";

// @ts-ignore
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

export async function getSelfInfo_cloud(event: Events<string>): Promise<Result<BaseUserInfo>> {
  let { OPENID } = cloud.getWXContext();
  const { data } = event;
  OPENID = data ? data : OPENID;
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
      };
    } else if (res.errMsg === "collection.aggregate:ok" && res.list.length === 0) {
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: { OPENID },
      };
    } else {
      console.log(res);
      throw new Error("数据库执行错误");
    }
  } catch (err: any) {
    throw err;
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
      console.log(res);
      throw new Error("数据库执行错误");
    }
  } catch (err: any) {
    throw err;
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
      console.log(res);
      throw new Error("数据库执行错误");
    }
  } catch (err: any) {
    throw err;
  }
}
export async function getRegimentListNearby_cloud(event: Events<Taro.getLocation.SuccessCallbackResult>): Promise<Result<BaseUserInfo[]>> {
  try {
    const { data } = event;
    const res = <cloud.DB.IAggregateResult>await db.collection("users")
      .aggregate()
      .geoNear({
        distanceField: 'distance', // 输出的每个记录中 distance 即是与给定点的距离
        distanceMultiplier: (1 / 1000),
        spherical: true,
        near: db.Geo.Point(data.longitude, data.latitude),
        query: {
          regiment_is: _.or([_.eq(1)]),
        },
        minDistance: 0,
        maxDistance: (15 * 1000),
        key: 'location', // 若只有 location 一个地理位置索引的字段，则不需填
        includeLocs: 'location', // 若只有 location 一个是地理位置，则不需填
      })
      .end();
    if (res.errMsg == "collection.aggregate:ok") {
      // 根据myRegimentId查找我的团长信息
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: res.list as BaseUserInfo[],
        res
      };
    } else {
      throw new Error(`数据库查询错误：${res.errMsg}`);
    }
  } catch (err: any) {
    throw err;
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
      console.log(res);
      throw new Error("数据库执行错误");
    }
  } catch (err: any) {
    throw err;
  }
}
