import { Code, PayStatus } from "../../../client/src/a_config";
// 云函数代码
import cloud from "wx-server-sdk";

// @ts-ignore
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

export async function addOrder_cloud(event: Events<Product_Express>): Promise<Result<Product_Express>> {
  try {
    const { data } = event;
    const _timestamp = Date.now();
    data.timestamp_init = _timestamp;
    data.timestamp_update = _timestamp;
    data.outTradeNo = data.outTradeNo ?? `${data.self_OPENID!.slice(6)}${Date.now().toString(32)}`;
    let res = <cloud.DB.IAddResult>await db.collection("orders")
      .add({ data: { ...data } });
    if (res.errMsg === "collection.add:ok") {
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: { ...data, _id: res._id },
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
export async function updateOrder_express_cloud(event: Events<Product_Express>): Promise<Result<Product_Express>> {
  try {
    const { _id, ...data } = event.data;
    data.timestamp_update = Date.now();
    let res = <cloud.DB.IUpdateResult>await db.collection("orders")
      .doc(_id!).update({ data: data });
    if (res.errMsg === "document.update:ok") {
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: { _id, ...data },
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
export async function removeOrder_cloud(event: Events<Product_Express>): Promise<Result<Product_Express>> {
  try {
    const { data } = event;
    let res = <cloud.DB.IRemoveResult>await db.collection("orders").doc(data._id!).remove();
    if (res.errMsg === "document.remove:ok" && res.stats.removed === 1) {
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: { ...data },
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
export async function getOrderList_cloud(event: Events<OrderList_Query, string>): Promise<Result<ProductBase[]>> {
  try {
    const { data: { payStatus, ...data }, params } = event;
    const _params = !params ? {
      ...data,
      payStatus: _.or(payStatus!.map(e => _.eq(e))),

    } : _.or([
      { // 收件人
        recMan: {
          mobile: db.RegExp({
            regexp: params,
            options: 'i'
          })
        },
        ...data,
        payStatus: _.or(payStatus!.map(e => _.eq(e))),
      },
      { // 发件人
        sendMan: {
          mobile: db.RegExp({
            regexp: params,
            options: 'i'
          })
        },
        ...data,
        payStatus: _.or(payStatus!.map(e => _.eq(e))),
      },
      { // 收件人 姓名
        recMan: {
          name: db.RegExp({
            regexp: params,
            options: 'i'
          }),
        },
        ...data,
        payStatus: _.or(payStatus!.map(e => _.eq(e))),
      },
      { // 寄件人 姓名
        sendMan: {
          name: db.RegExp({
            regexp: params,
            options: 'i'
          }),
        },
        ...data,
        payStatus: _.or(payStatus!.map(e => _.eq(e))),
      }
    ]);

    const res = <cloud.DB.IQuerySingleResult>await db.collection("orders")
      .orderBy('weight', 'desc')
      .orderBy('timestamp_update', 'desc')
      .where(_params)
      .get();
    if (res.errMsg == "collection.get:ok") {
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: res.data as ProductBase[],
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
export async function getOrderExpress_cloud(event: Events<string>): Promise<Result<Product_Express>> {
  try {
    const { data } = event;

    const res = <cloud.DB.IQuerySingleResult>await db.collection("orders")
      .doc(data).get();
    if (res.errMsg == "document.get:ok") {
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: res.data as Product_Express,
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

