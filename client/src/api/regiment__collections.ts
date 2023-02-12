import { wx_cloud_callFunctions } from "./wx_cloud_callFunctions";

export async function Api_regiment_collections_getCollectionList(params: { timestamp: number; OPENID: string; }): Promise<any[]> {
  try {
    const res = await wx_cloud_callFunctions<any[]>({
      name: "regiment__collections_cloud",
      data: {
        func: "getCollectionList_cloud",
        data: { ...params },
      },
    });
    return res;
  } catch (err) {
    throw err;
  }
}
export async function Api_regiment_collections_getCollectionHistoryList(params: { timestamp: number; OPENID: string; }): Promise<any[]> {
  try {
    const res = await wx_cloud_callFunctions<any[]>({
      name: "regiment__collections_cloud",
      data: {
        func: "getCollectionHistoryList_cloud",
        data: { ...params },
      },
    });
    return res;
  } catch (err) {
    throw err;
  }
}

export async function Api_regiment_collections_getCollectionExcel(params: { OPENID: string; firstDateOfMonth: string; lastDateOfMonth: string; }): Promise<ArrayBuffer> {
  try {
    const res = await wx_cloud_callFunctions<ArrayBuffer>({
      name: "regiment__collections_cloud",
      data: {
        func: "getCollectionExcel_cloud",
        data: { ...params },
      },
    });
    return res;
  } catch (err) {
    throw err;
  }
}
