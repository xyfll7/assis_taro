import { Code } from "../../../client/src/a_config";
// 云函数代码
import cloud from "wx-server-sdk";

// @ts-ignore
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

export async function getPhoneNumber_cloud(event: Events<{ code: string; }>): Promise<Result<string>> {
  const { data: { code } } = event;
  try {
    const res = await cloud.openapi.phonenumber.getPhoneNumber({
      code: code
    });
    if (res.errMsg == "openapi.phonenumber.getPhoneNumber:ok") {
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: res.phoneInfo.purePhoneNumber,
      };
    } else {
      throw new Error(`数据库执行错误，${res.errMsg}`);
    }
  } catch (err: any) {
    throw err;
  }
}

export async function createQRCode_cloud(event: Events<{ page: string, scene: string; }>): Promise<Result<ArrayBuffer>> {
  try {
    const { data: { page, scene } } = event;
    const envVersion = event.environment.envVersion;
    const res = await cloud.openapi.wxacode.getUnlimited({
      "page": page,
      "scene": scene,
      "checkPath": envVersion === "release" ? true : false,
      "envVersion": envVersion, //  develop release trial
      "lineColor": envVersion === "release" ? { "r": 0, "g": 0, "b": 0 } : { "r": 255, "g": 0, "b": 0 }
    });
    if (res.errCode === 0) {
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: res.buffer as ArrayBuffer,
      };
    } else {
      throw new Error(`${res.errMsg}`);
    }

  } catch (err: any) {
    throw err;
  }

}

export async function getPrice_cloud(event: Events<Product_Express>) {
  const { data } = event;
  return {
    code: Code.SUCCESS,
    message: "价格计算成功",
    data: { ...data, totalFee: utils_calc_express_totalFee(data) } as Product_Express,
  };
}


//#region 计算快递订单总价  // 1公斤6元、2公斤7元、3公斤8元 4公斤*2.5元
export function utils_calc_express_totalFee(data: Product_Express): number {
  const weight = data.weight;
  const province = data.recMan!.province.trim();

  // 新疆：首重15（12）+续重10（8）
  // 海南：首重12（8）+续重5（3）
  // 西藏：首重18（15）+续重12（10）

  if (province.includes('新疆')) {
    return price_1(weight, 15, 10);
  } else if (province.includes("海南")) {
    return price_1(weight, 12, 5);
  } else if (province.includes("西藏")) {
    return price_1(weight, 15, 12);
  } else {
    return price_0(weight);
  }

  function price_1(_weight: number, first: number, plus: number) {
    return (_weight * plus + (first - plus)) * 100;
  };

  function price_0(_weight: number) {
    switch (_weight) {
      case 1:
        return 6 * 100;
      case 2:
        return 7 * 100;
      case 3:
        return 8 * 100;
      default:
        return _weight * 2.5 * 100;
    }
  }

}
//#endregion
