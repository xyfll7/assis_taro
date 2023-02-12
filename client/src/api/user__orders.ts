import { wx_cloud_callFunctions } from "./wx_cloud_callFunctions";

export async function Api_orders_addOrder(params: Product_Express): Promise<Product_Express> {
  try {
    const res = await wx_cloud_callFunctions<Product_Express>({
      name: "user__orders_cloud",
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

export async function Api_orders_removeOrder(params: Product_Express): Promise<Product_Express> {
  try {
    const res = await wx_cloud_callFunctions<Product_Express>({
      name: "user__orders_cloud",
      data: {
        func: "removeOrder_cloud",
        data: { ...params }
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}


export async function Api_orders_getOrderList(
  data: OrderList_Query,
  params?: string
): Promise<Product_Express[]> {
  try {
    const res = await wx_cloud_callFunctions<Product_Express[]>({
      name: "user__orders_cloud",
      data: {
        func: "getOrderList_cloud",
        data: data,
        params: params
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}

export async function Api_orders_getOrderExpress(data: string): Promise<Product_Express> {
  try {
    const res = await wx_cloud_callFunctions<Product_Express>({
      name: "user__orders_cloud",
      data: {
        func: "getOrderExpress_cloud",
        data: data,
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}


export async function Api_orders_updateOrder_express(params: Product_Express): Promise<Product_Express> {
  try {
    const res = await wx_cloud_callFunctions<Product_Express>({
      name: "user__orders_cloud",
      data: {
        func: "updateOrder_express_cloud",
        data: { ...params }
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}
// updateOrder_cloud
