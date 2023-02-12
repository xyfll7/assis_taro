import { wx_cloud_callFunctions } from "./wx_cloud_callFunctions";

//#region  获取所有绑定的物流账号
export async function Api_test_test(params?: any): Promise<any> {
  try {
    const res = await wx_cloud_callFunctions<any>({
      name: "a___test",
      data: {
        func: "test_cloud",
        data: params
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}
//#endregion
