import { Code } from "../../../client/src/a_config";
// 云函数代码
import cloud from "wx-server-sdk";

// @ts-ignore
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

export async function addAddress_cloud(event: Events<AddressInfo>): Promise<Result<AddressInfo>> {
  const { data } = event;
  data.timestamp_update = Date.now();
  try {
    const res = <cloud.DB.IAddResult>await db.collection("address").add({ data: data });
    if (res.errMsg == "collection.add:ok") {
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: { _id: res._id as string, ...data },
      };
    } else {
      return {
        code: Code.DATABASE_ERROR,
        message: `数据库执行错误，${res.errMsg}。`,
        res,
      };
    }
  } catch (err: any) {
    return {
      code: Code.SERVER_ERROR,
      message: `未知错误，${err.errMsg}`,
      err,
    };
  }
}

export async function updateAddress_cloud(event: Events<AddressInfo>): Promise<Result<AddressInfo>> {
  const {
    data: { _id, ...data },
  } = event;
  try {
    const res = <cloud.DB.IUpdateResult>await db
      .collection("address")
      .doc(_id!)
      .update({
        data: { ...data, timestamp_update: Date.now() },
      });

    if (res.errMsg == "document.update:ok") {
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: { _id: _id, ...data },
      };
    } else {
      return {
        code: Code.DATABASE_ERROR,
        message: `数据库执行错误，${res.errMsg}。`,
        res,
      };
    }
  } catch (err: any) {
    return {
      code: Code.SERVER_ERROR,
      message: `未知错误，${err.errMsg}`,
      err,
    };
  }
}
export async function removeAddress_cloud(event: Events<AddressInfo>): Promise<Result<AddressInfo>> {
  const {
    data: { _id, ...data },
  } = event;
  try {
    const res = <cloud.DB.IRemoveResult>await db.collection("address").doc(_id!).remove();
    if (res.errMsg == "document.remove:ok") {
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: { _id: _id, ...data },
      };
    } else {
      return {
        code: Code.DATABASE_ERROR,
        message: `数据库执行错误，${res.errMsg}。`,
        res,
      };
    }
  } catch (err: any) {
    return {
      code: Code.SERVER_ERROR,
      message: `未知错误，${err.errMsg}`,
      err,
    };
  }
}
export async function getAddressList_cloud(
  event: Events<{
    timestamp: number;
    searchvalue: string;
    address_type?: AddressType;
    OPENID: string;
  }>
): Promise<Result<AddressInfo[]>> {
  const { timestamp, searchvalue, address_type, OPENID } = event.data;
  const _address_type_obj = () => {
    if (address_type === "寄件地址" || address_type == "收件地址") {
      return { address_type };
    } else {
      return {};
    }
  };
  try {
    const params = !searchvalue
      ? {
        self_OPENID: OPENID,
        timestamp_update: _.lt(timestamp),
        ..._address_type_obj(),
      }
      : _.or([
        {
          // 姓名
          name: db.RegExp({ regexp: searchvalue, options: "i" }),
          self_OPENID: OPENID,
          timestamp_update: _.lt(timestamp),
          ..._address_type_obj(),
        },
        {
          // 电话
          mobile: db.RegExp({ regexp: searchvalue, options: "i" }),
          self_OPENID: OPENID,
          timestamp_update: _.lt(timestamp),
          ..._address_type_obj(),
        },
      ]);
    const res = <cloud.DB.IQueryResult>await db.collection("address").orderBy("timestamp_update", "desc").where(params).limit(9).get();
    if (res.errMsg == "collection.get:ok") {
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: res.data as AddressInfo[],
      };
    } else {
      return {
        code: Code.DATABASE_ERROR,
        message: `数据库执行错误，${res.errMsg}`,
        res,
      };
    }
  } catch (err: any) {
    return {
      code: Code.SERVER_ERROR,
      message: `未知错误，${err.errMsg}`,
      err,
    };
  }
}
