import Taro from "@tarojs/taro";
import { RQ } from "@tarojs/taro/types/api/cloud";
import { Code } from "../a_config";
import getEnv from "../utils/env";

let isCloudInit = false;
export async function wx_cloud_callFunctions<OUT>(params: RQ<Taro.cloud.CallFunctionParam>): Promise<OUT> {
  if (!isCloudInit) {
    ___init();
  }
  try {
    const res = await Taro.cloud.callFunction({
      ...params,
      data: {
        ...params.data,
        environment: getEnv(),
      },
    });
    if (res.errMsg === "cloud.callFunction:ok") {
      const result = res.result as unknown as Result<OUT>;
      if (result.code === Code.SUCCESS) {
        return result.data as OUT;
      } else {
        throw new Error(result.message);
      }
    } else {
      console.error("云函数调用错误：", res);
      throw new Error(`云函数调用错误：${res.errMsg}`);
    }
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    } else {
      console.error("云函数调用错误，未知错误", err);
      throw new Error("云函数调用错误，未知错误");
    }
  }
}

function ___init() {
  if (!Taro.cloud) {
    console.error("请使用 2.2.3 或以上的基础库以使用云能力");
  } else {
    isCloudInit = true;
    Taro.cloud.init({ env: getEnv().envId, traceUser: true });
  }
}
