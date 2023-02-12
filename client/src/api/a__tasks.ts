
import { wx_cloud_callFunctions } from "./wx_cloud_callFunctions";

export async function Api_tasks_getPhoneNumber(params: { code: string; }): Promise<string> {
  try {
    const res = await wx_cloud_callFunctions<string>({
      name: "a__tasks_cloud",
      data: {
        func: "getPhoneNumber_cloud",
        data: { ...params }
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}

export async function Api_tasks_createQRCode(param: { page: string, scene: string; }) {
  const res = await wx_cloud_callFunctions<ArrayBuffer>({
    name: "a__tasks_cloud",
    data: {
      func: "createQRCode_cloud",
      data: { ...param }
    }
  });
  return res;
}
