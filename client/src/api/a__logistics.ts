import { wx_cloud_callFunctions } from "./wx_cloud_callFunctions";

//#region  获取所有绑定的物流账号
export async function Api_logistics_getAllAccount() {
  try {
    const res = await wx_cloud_callFunctions<AccountInfo[]>({
      name: "a__logistics_cloud",
      data: {
        func: "getAllAccount_cloud",
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}
//#endregion

//#region  生成运单
export async function Api_logistics_addOrder(params: Product_Express): Promise<Product_Express> {
  try {
    const res = await wx_cloud_callFunctions<Product_Express>({
      name: "a__logistics_cloud",
      data: {
        func: "addOrder_cloud",
        data: { ...params }
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}
//#endregion

//#region  回收运单
export async function Api_logistics_cancelOrder(params: Product_Express): Promise<Product_Express> {
  try {
    const res = await wx_cloud_callFunctions<Product_Express>({
      name: "a__logistics_cloud",
      data: {
        func: "cancelOrder_cloud",
        data: { ...params }
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}
//#endregion

//#region  获取运单数据
export async function Api_logistics_getOrder(params: Product_Express): Promise<Product_Express> {
  try {
    const res = await wx_cloud_callFunctions<Product_Express>({
      name: "a__logistics_cloud",
      data: {
        func: "getOrder_cloud",
        data: { ...params }
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}
//#endregion

//#region  查询运单轨迹
export async function Api_logistics_getPath(params: Product_Express): Promise<Logistics_Path> {
  try {
    const res = await wx_cloud_callFunctions<Logistics_Path>({
      name: "a__logistics_cloud",
      data: {
        func: "getPath_cloud",
        data: { ...params }
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}
//#endregion

//#region  绑定快递公司面单账号
export async function Api_logistics_bindAccount(data: BaseUserInfo, params?: Logistics_Account): Promise<BaseUserInfo> {
  try {
    const res = await wx_cloud_callFunctions<BaseUserInfo>({
      name: "a__logistics_cloud",
      data: {
        func: "bindAccount_cloud",
        data: data,
        params: params
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}
//#endregion

//#region  获取支持的快递公司列表
export async function Api_logistics_getAllDelivery(): Promise<any> {
  try {
    const res = await wx_cloud_callFunctions({
      name: "a__logistics_cloud",
      data: {
        func: "getAllDelivery_cloud",
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}
//#endregion

//#region  获取电子面单余额
export async function Api_logistics_getQuota(params: Logistics_Account): Promise<number> {
  try {
    const res = await wx_cloud_callFunctions<number>({
      name: "a__logistics_cloud",
      data: {
        func: "getQuota_cloud",
        data: { ...params }
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}
//#endregion

