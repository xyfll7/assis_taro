import { Code } from "../../../client/src/a_config";
import cloud from "wx-server-sdk";
// @ts-ignore
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

export async function addOrder_cloud(event: Events<Product_Express>): Promise<Result<Product_Express>> {
  try {
    const { data } = event;

    const _timestamp = Date.now();
    if (!data.timestamp_init) {
      data.timestamp_init = _timestamp;
    }
    data.timestamp_update = _timestamp;
    data.outTradeNo = data.outTradeNo ?? `${data.self_OPENID!.slice(6)}${Date.now().toString(32)}`;

    const res0 = await cloud.openapi.logistics.addOrder(___makeParam(data));
    if (res0.errMsg == "openapi.logistics.addOrder:ok") {
      data.waybillData = res0.waybillData;
      data.waybillId = res0.waybillId;
      const res1 = data._id ? await ___updateOrder(data) : await ___addOrder(data);
      return {
        code: Code.SUCCESS,
        message: res0.errMsg,
        data: res1,
        res: { res0, res1 }
      };
    } else {
      throw new Error(`接口调用错误，${res0.errMsg}。`);
    }
  } catch (err: any) {
    throw err;
  }
}

// 获取所有绑定的物流账号
export async function getAllAccount_cloud(event: Events<{}>): Promise<Result<any>> {
  try {
    const res = await cloud.openapi.logistics.getAllAccount({});
    if (res.errMsg == "openapi.logistics.getAllAccount:ok") {
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: res.list,
      };
    } else {
      throw new Error(`接口调用错误，${res.errMsg}。`);
    }
  } catch (err: any) {
    throw err;
  }
}

export async function getOrder_cloud(event: Events<Product_Express>): Promise<Result<Product_Express>> {
  try {
    const { data } = event;
    const res0 = await cloud.openapi.logistics.getOrder({
      "openid": data.self_OPENID,
      "orderId": data.outTradeNo,
      "deliveryId": 'JTSD',
      "waybillId": data.waybillId,
      "printType": 1  // 获取打印面单类型【1：一联单，0：二联单】，默认获取二联单
    });
    // const res1 = await
    if (res0.errMsg == "openapi.logistics.getOrder:ok") {
      return {
        code: Code.SUCCESS,
        message: res0.errMsg,
        data: data,
        res: res0
      };
    } else {
      throw new Error(`接口调用错误，${res0.errMsg}。`);
    }
  } catch (err: any) {
    throw err;
  }
}

export async function getPath_cloud(event: Events<Product_Express>): Promise<Result<Logistics_Path>> {
  try {
    const { data } = event;
    const res0: Logistics_Path = await cloud.openapi.logistics.getPath({
      openid: data.self_OPENID,
      orderId: data.outTradeNo,
      deliveryId: data.deliveryId,
      waybillId: data.waybillId,
    });
    if (res0.errMsg == "openapi.logistics.getPath:ok") {
      return {
        code: Code.SUCCESS,
        message: res0.errMsg,
        data: res0,
      };
    } else {
      throw new Error(`接口调用错误，${res0.errMsg}。`);
    }
  } catch (err: any) {
    throw err;
  }
}

export async function bindAccount_cloud(event: Events<BaseUserInfo, Logistics_Account>): Promise<Result<BaseUserInfo>> {
  try {
    const { params } = event;
    const res0 = await cloud.openapi.logistics.bindAccount({
      type: params!.type,
      bizId: params!.bizId,
      password: params!.password,
      deliveryId: params!.deliveryId,
    });
    // 解绑成功
    if (res0.errMsg === "openapi.logistics.unbindAccount:ok" && res0.errCode === 0) {
      const res1 = await ___updateUserInfo(event);
      return {
        code: Code.SUCCESS,
        message: res0.errMsg,
        data: res1!,
        res: res0
      };
    } else if (res0.errMsg === "openapi.logistics.bindAccount:ok" && res0.errCode === 0) {
      // 绑定成功
      const res1 = await ___updateUserInfo(event);
      return {
        code: Code.SUCCESS,
        message: res0.errMsg,
        data: res1!,
        res: res0
      };
    } else {
      throw new Error(`接口调用错误，${res0.errMsg}。`);
    }
  } catch (err: any) {
    throw err;
  }
}
// 获取支持的快递公司列表
export async function getAllDelivery_cloud(): Promise<Result<any>> {
  try {
    const res0 = await cloud.openapi.logistics.getAllDelivery({});
    if (res0.errMsg == "openapi.logistics.getAllDelivery:ok") {
      return {
        code: Code.SUCCESS,
        message: res0.errMsg,
        data: res0.data,
      };
    } else {
      throw new Error(`接口调用错误，${res0.errMsg}。`);
    }
  } catch (err: any) {
    throw err;
  }
}

async function ___cancelOrder(data: Product_Express): Promise<Product_Express> {
  const { _id, } = data;
  try {
    const res = <cloud.DB.IUpdateResult>await db.collection("orders").doc(_id!).update({
      data: {
        bizId: _.remove(),
        deliveryId: _.remove(),
        deliveryName: _.remove(),
        waybillData: _.remove(),
        waybillId: _.remove(),
      }
    });
    if (res.errMsg === "document.update:ok" && res.stats.updated === 1) {
      return data;
    } else {
      throw new Error("更新订单失败");
    }
  } catch (err) {
    throw err;
  }
}
export async function cancelOrder_cloud(event: Events<Product_Express>): Promise<Result<Product_Express>> {
  try {
    const { data } = event;
    const res0 = await cloud.openapi.logistics.cancelOrder({
      orderId: data.outTradeNo,
      openid: data.self_OPENID,
      deliveryId: data.deliveryId,
      waybillId: data.waybillId,
    });
    console.log("取消运单：", res0);
    if (res0.errMsg == "openapi.logistics.cancelOrder:ok" && res0.errCode === 0) {
      const { bizId, deliveryId, deliveryName, waybillData, waybillId, outTradeNo, ..._data } = data;
      await ___cancelOrder(data);
      return {
        code: Code.SUCCESS,
        message: res0.errMsg,
        data: _data,
      };
    } else {
      throw new Error(`接口调用错误，${res0.errMsg}。`);
    }
  } catch (err: any) {
    throw err;
  }
}
// 获取电子面单余额
export async function getQuota_cloud(event: Events<Logistics_Account>): Promise<Result<number>> {
  try {
    const { data } = event;
    const res0 = await cloud.openapi.logistics.getQuota({
      deliveryId: data?.deliveryId,
      bizId: data?.bizId
    });
    if (res0.errMsg == "openapi.logistics.getQuota:ok") {
      return {
        code: Code.SUCCESS,
        message: res0.errMsg,
        data: res0.quotaNum as number,
      };
    } else {
      throw new Error(`接口调用错误，${res0.errMsg}。`);
    }
  } catch (err: any) {
    throw err;
  }
}

async function ___setOrder(data: Product_Express): Promise<Product_Express> {
  try {
    const { _id, ...order } = data;
    const res = <cloud.DB.ISetResult>await db.collection("orders").doc(order.outTradeNo!).set({ data: { ...order } });
    if (res.errMsg === "document.set:ok") {
      return { ...order, _id: order.outTradeNo };
    } else {
      throw "设置订单失败";
    }
  } catch (err) {
    throw err;
  }
}
async function ___addOrder(data: Product_Express): Promise<Product_Express> {
  try {
    const res = <cloud.DB.IAddResult>await db.collection("orders").add({ data: { ...data } });
    if (res.errMsg === "collection.add:ok") {
      data._id = res._id;
      return data;
    } else {
      throw new Error("新增订单失败");
    }
  } catch (err) {
    throw err;
  }
}
async function ___updateOrder(data: Product_Express): Promise<Product_Express> {
  const { _id, ...order } = data;
  try {
    const res = <cloud.DB.IUpdateResult>await db.collection("orders").doc(_id!).update({
      data: { ...order }
    });
    if (res.errMsg === "document.update:ok" && res.stats.updated === 1) {
      return data;
    } else {
      throw new Error("取消订单失败");
    }
  } catch (err) {
    throw err;
  }
}

function ___makeParam(data: Product_Express) {
  const param = {
    "add_source": 0,
    "order_id": data.outTradeNo,
    "openid": data.self_OPENID,
    "delivery_id": data.deliveryId,
    "biz_id": data.bizId,
    "custom_remark": "请勿折叠",
    "sender": data.sendMan,
    "receiver": data.recMan,
    "cargo": {
      "count": 1,
      "weight": 1,
      "space_x": 30,
      "space_y": 30,
      "space_z": 30,
      "detail_list": [{
        "name": "幼儿园手指操(小班上)",
        "count": 1
      }]
    },
    "shop": {
      "wxa_path": "shop/order/express",
      "img_url": "https://jc-content.jctong.net/mallupload/1590107856150.png",
      "goods_name": "幼儿园手指操(小班上)",
      "goods_count": 1
    },
    "insured": {
      "use_insured": 0,
      "insured_value": 0
    },
    "service": {
      "service_type": 0,
      "service_name": "标准快件"
    }
  };
  return param;
}
// 绑定账号时更新个人信息
async function ___updateUserInfo(event: Events<BaseUserInfo, Logistics_Account>): Promise<BaseUserInfo> {
  try {
    const { data } = event;
    const res = <cloud.DB.IUpdateResult>await db.collection("users").doc(data.OPENID!).update({
      data: { logistics: data.logistics }
    });
    if (res.errMsg === "document.update:ok" && res.stats.updated === 1) {
      return { ...data };
    } else {
      throw new Error("更新个人信息错误");
    }
  } catch (err) {
    throw err;
  }
}
