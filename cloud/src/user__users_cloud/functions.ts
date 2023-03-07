import { Code } from "../../../client/src/a_config";
// 云函数代码
import cloud from "wx-server-sdk";
import Taro from "@tarojs/taro";
import { version } from "../../../package.json";

// @ts-ignore
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

// cSpell: ignore SLSM Srcu mzjx Unufh KBVE wihm xfxa AEEQ OlntF VCYGRayu kwyd Gwbwr Kstbro Ojstaypd
const _OPENID =
  // "oGwbL5MUeSNxxA4o0oOmb_FUjE7g" ||  // 王肇
  // "oGwbL5IZEq-8Op4CvUTNodRKdOB0" ||  // 冯强
  // "oGwbL5CEoFe5T1fqyAQUu0ohSLSM" ||  // 王红霞
  // "oGwbL5Ik6N77gAnLvNFh1BXP3lqc" ||  // 杨宝宝
  // "oGwbL5N_xHceDTweeY3W0NGG7l0A" ||  // 杨丽-东关大街11号-盛大购物中心三楼"親親寶貝童业
  // "oGwbL5P_IBh9s4s8-JFdPrQhDHoA" ||  // 御城国际
  // "oGwbL5J-wihmVkT8ma6CblWyKBVE" ||  // 王瑞-凯泽
  // "oGwbL5Gh9_xfxaR4Gsq3k2pPX_uU" ||  // 马婷-泗海怡园
  // "oGwbL5ElYYxJlOsIi7SoKbr4Pt3Y" ||  // 赵院院-虎头园小区
  // "oGwbL5O6owNRHLtGFSrcuXUu0v1s" ||  // 马智宝-二庄科金岳小区
  // "oGwbL5OlntFDvIWwFsPiUKUcAEEQ" ||  // 鲍巧艳-二庄科金岳小区
  // "oGwbL5G9lIOcFJcAUTnpCwcY-cPA" ||  // 张娜-铭馨苑小区
  // "oGwbL5A5mzjxHC-XtRUnufhCL4ck" ||  // 徐迎春-兴延小区
  // "oGwbL5N5VCYGRayuVG7_DMsStBJ4" ||  // 班海燕-长青路毛纺厂纺织花园5号楼二单元504
  // "oGwbL5I6ATu_7kwydZHQ5C9ePxWk" ||  // 吴华-鑫鑫安置房
  // "oGwbL5GwbwrTv1dEYIm4WLaQYQy8" ||  // 王芳-南寨砭路-美满国际
  // "oGwbL5O_FBTl9622gKF8ZraYSiPA" ||  // 杨杰-石佛沟
  // "oGwbL5JC9krtEg5xFoE2NKhSC6EM" ||  // 王改艳-长青路地税局旁-玉龙华庭明超家纺
  // "oGwbL5IK2UOKstbro8T-kobFD_nk" ||  // 高秀-马家湾红化宝园小区吉美超市对面鲜奶吧
  // "oGwbL5DzItCwSPJVrQcGYfDdu3JA" ||  // 薛琴飞-农科所便民市场
  // "oGwbL5NmSSOjstaypdPehL0-XUio" ||  // 苗艳-慧泽路-宝塔区宝园小区
  "";
function ___get_version(OPENID?: string) {
  if (OPENID === _OPENID) {
    return "1.0.33";
  } else {
    return version;
  }
}

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
        data: {
          ...userInfo,
          regiment_info: regiment_info ?? null,
          serveVersion: ___get_version(OPENID)
        },
      };
    } else if (res.errMsg === "collection.aggregate:ok" && res.list.length === 0) {
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: {
          OPENID,
          serveVersion: ___get_version(OPENID)
        },
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
      // 更新用户团长信息，
      // 检查regiment_OPENID 是否为团长
      // 如果是则更新团长信息，并返回最新团长给用户
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
