import { format, lastDayOfMonth, startOfMonth, subDays, intervalToDuration } from "date-fns";
import { to } from "await-to-js";
import Taro from "@tarojs/taro";
import Schema from "validate";
import getEnv, { getEnvDevParam } from "./env";
import { Api_wxpay_wxPay_express } from "../api/a__wxpay";
import { Api_tasks_createQRCode } from "../api/a__tasks";
import { Api_logistics_addOrder } from "../api/a__logistics";
import { Api_printer_printExpress } from "../api/a__printer";
import { Api_local_reachable } from '../api/aa__local';

//#region 快递表单数据初始化
export function utils_init_product_express(): Product_Express {
  if (getEnv().envVersion === "release") {
    return {
      self_OPENID: "",
      regiment_OPENID: "",
      product_type: "express",
      recMan: null,
      sendMan: null,
      totalFee: 0,
      itemType: "文件",
      itemNotes: "",
      weight: 0,
      describe: "快递",
      pickUpType: "到店寄件",
      print_times: 0,
    } as Product_Express;
  } else {
    return {
      self_OPENID: "",
      regiment_OPENID: "",
      product_type: "express",
      recMan: false
        ? null
        : {
          name: "依辰美",
          mobile: "17727658643",
          company: "",
          post_code: "",
          code: "",
          country: "中国",
          province: "湖北省",
          city: "省直辖县",
          area: "天门市",
          address: "南洋大道57号",
          from: "WX", // 微信 ｜ 粘贴
        },
      sendMan: false ? null : {
        name: "闫飞",
        mobile: "15399269833",
        company: "",
        post_code: "",
        code: "",
        country: "中国",
        province: "陕西省",
        city: "延安市",
        area: "宝塔区",
        address: "二庄科金岳小区",
        from: "WX", // 微信 ｜ 粘贴
      },
      totalFee: 0,
      itemType: "文件",
      itemNotes: "",
      weight: 0,
      describe: "快递",
      pickUpType: "到店寄件",
      print_times: 0,
    } as Product_Express;
  }
};
//#endregion


//#region 生成电子面单
export async function utils_get_electronic_face_sheet(selfInfo_S: BaseUserInfo, order: Product_Express) {
  // 没有电子面单号 - 选择电子面单账号
  const [err1, logistic] = await to(utils_get_logistics(selfInfo_S));
  if (err1) {
    Taro.showToast({ title: err1.message, icon: "none" });
    throw err1;
  }
  //检查快递可达性
  Taro.showLoading({ title: "检查快递...", mask: true });
  const res2 = await Api_local_reachable({ ...order!, deliveryId: logistic.deliveryId });
  if (res2) {
    Taro.showToast({ title: res2, icon: "none", duration: 5000 });
    throw res2;
  }
  //生成电子面单
  Taro.showLoading({ title: "生成面单", mask: true });
  const [err3, res3] = await to(
    utils_generate_order({
      ...order!,
      deliveryId: logistic.deliveryId,
      bizId: logistic.bizId,
      deliveryName: logistic.deliveryName,
    })
  );
  if (err3) {
    Taro.showToast({ title: err3.message, icon: "none" });
    throw err3;
  }
  Taro.showToast({ title: "获取成功", icon: "none" });
  return res3;
}




//#endregion

//#region 打印快递订单
export async function utils_print_express(_order: Product_Express, selfInfo_S: BaseUserInfo) {
  //选择打印机
  const [err0, printer] = await to(utils_get_printer(selfInfo_S));
  if (err0) {
    Taro.showToast({ title: err0.message, icon: "none" });
    throw err0;
  }
  //打印订单
  Taro.showLoading({ title: "打印中...", mask: true });
  const [err1, res1] = await to(Api_printer_printExpress({ ..._order, printer }));
  if (err1) {
    Taro.showToast({ title: "打印出错，请重试", icon: "none" });
    throw err1;
  } else {
    Taro.showToast({ title: `打印任务提交成功`, icon: "none" });
    return res1;
  }
}
//#endregion

//#region 获取超时时间
export function utils_get_time_limit(end_time?: string) {
  if (!end_time) { return null; }
  const start_timestamp = new Date().getTime();
  const end_timestamp = new Date(end_time).getTime();
  if (start_timestamp < end_timestamp) {
    const { years, months, days, hours, minutes, seconds } = intervalToDuration({
      start: start_timestamp,
      end: end_timestamp
    });
    return `${years ? years + '年' : ''}${months ? months + '个月' : ''}${days ? days + '天' : ''}${hours ? hours + '小时' : ''}${minutes ? minutes + '分' : ''}${seconds + '秒'}`;
  } else {
    return null;
  }
}
//#endregion

//#region URL转对象
export function utils_urlToObj<T = {}>(url?: string): T {
  let _url = decodeURIComponent(url ?? "");
  if (_url.includes("scene=")) {
    _url = _url.split("scene=")[1];
  } else if (_url.includes("?")) {
    _url = _url.split("?")[1];
  } else {
    _url = _url;
  }
  return (
    _url?.split("&")?.reduce<T>((obj, item) => {
      item && ((obj as any)[item.split("=")[0]] = item.split("=")[1]);
      return obj;
    }, {} as T) ?? ({} as T)
  );
}
//#endregion

//#region 对象转URL
export function utils_objToUrl(obj: { [name: string]: string | number; }) {
  let str = "";
  for (let item in obj) {
    str += `${item}=${obj[item]}&`;
  }
  return str.slice(0, str.length - 1);
}
//#endregion

//#region 深拷贝
export function utils_deep<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}
//#endregion

//#region 对象数组去重
export function utils_uniqByKey<T, K extends keyof T>(arr: T[], key: K): T[] {
  return [...new Map(arr.map((item) => [item[key], item])).values()];
}
//#endregion

//#region 获取药丸信息
export const utils_get_capsule = (reTry: boolean) => {
  try {
    let Capsule = Taro.getMenuButtonBoundingClientRect(); // window 平台 有时会获取不到这个值，所以如果失败，就再调用一次
    if (!Capsule && reTry) {
      Capsule = { bottom: 80, height: 32, left: 281, right: 368, top: 50, width: 87 };
    }
    const e = Taro.getSystemInfoSync();
    const navHeight = e.statusBarHeight ?? 0 + Capsule.height ?? 0 + (Capsule.top - (e.statusBarHeight ?? 0)) * 2;
    return {
      Capsule,
      navHeight,
      capLeft: e.windowWidth - Capsule?.right,
      pageHeight: e.windowHeight - navHeight,
      windowHeight: e.windowHeight,
    };
  } catch (err) {
    // 捕获一下错误，以免获取不到Capsule时整个程序奔溃
    return;
  }
};
//#endregion

//#region 上传文件
// https://www.jianshu.com/p/67ccb739d834
// export async function util_uploadFiles(mediaFiles: WechatMiniprogram.MediaFile[], selfInfo: BaseUserInfo, path = ""): Promise<WechatMiniprogram.MediaFile[]> {
//   try {
//     const res = await Promise.all(mediaFiles.map(____uploadFile))
//     return await ____getHttpUrl(res)
//   } catch (err) {
//     throw err
//   }

//   async function ____getHttpUrl(mediaFiles: WechatMiniprogram.MediaFile[]): Promise<WechatMiniprogram.MediaFile[]> {
//     const res = await Taro.cloud.getTempFileURL({
//       fileList: mediaFiles.map(e => e.tempFilePath)
//     })
//     return mediaFiles.map((e,i) => ({
//       ...e,
//       tempFilePath:res.fileList[i].tempFileURL
//     }))
//   }

//   async function ____uploadFile(mediaFile: WechatMiniprogram.MediaFile): Promise<WechatMiniprogram.MediaFile> {
//     const { tempFilePath, thumbTempFilePath } = mediaFile
//     if ((tempFilePath && tempFilePath.includes("cloud:")) ||
//       (thumbTempFilePath && thumbTempFilePath.includes("cloud:"))) {
//       return { ...mediaFile, }
//     }
//     try {
//       const cloudIdObj = await Taro.cloud.uploadFile({
//         cloudPath: path ?? `products/${selfInfo.regiment_info?.OPENID}/${selfInfo.OPENID}/${tempFilePath.match(new RegExp("\\w+\\.\\w+"))![0]}`,
//         filePath: tempFilePath
//       })

//       const httpsUrlObj = await Taro.cloud.getTempFileURL({
//         fileList: [cloudIdObj.fileID],
//       })

//       return {
//         ...mediaFile,
//         tempFilePath: cloudIdObj.fileID,
//         thumbTempFilePath: thumbTempFilePath ? (await Taro.cloud.uploadFile({
//           cloudPath: path ?? `products/${selfInfo.regiment_info?.OPENID}/${selfInfo.OPENID}/${thumbTempFilePath?.match(new RegExp("\\w+\\.\\w+"))![0]}`,
//           filePath: thumbTempFilePath
//         })).fileID : ""
//       }
//     } catch (err) {
//       throw err
//     }
//   }
// }
//#endregion

//#region 地址对象转字符串

export function utils_addressInfoToString(addr?: AddressInfo | null) {
  return addr && `${addr.province} ${addr.city} ${addr.area} ${addr.address}`;
}
//#endregion

//#region 表单验证 -- 寄快递
export function utils_validate_express(type: AddressManType | null, obj?: { [key: string]: any; }): boolean {
  let _type = "";
  if (type === "rec") {
    _type = "收件人";
  }
  if (type === "send") {
    _type = "寄件人";
  }
  if (!obj) {
    Taro.showToast({ title: `请检查 ${_type ? _type : "地址信息"} `, icon: "none" });
    return false;
  }
  const getParams = () => {
    return {
      name: {
        type: String,
        required: true,
        message: {
          required: `请检查 ${_type}-姓名`,
        },
      },
      mobile: {
        type: String,
        required: true,
        message: {
          required: `请检查 ${_type}-电话`,
        },
      },
      province: {
        type: String,
        required: true,
        message: {
          required: `请检查 省-市-区(缺少"省")`,
        },
      },
      city: {
        type: String,
        required: true,
        message: {
          required: `请检查 省-市-区(缺少"市")`,
        },
      },
      area: {
        type: String,
        required: true,
        message: {
          required: `请检查 省-市-区(缺少"区")`,
        },
      },
      address: {
        type: String,
        required: true,
        message: {
          required: `请检查 ${_type}-详细地址`,
        },
      },
    };
  };
  const schema = new Schema(getParams());
  const data = schema.validate(utils_deep(obj));
  if (data.length) {
    Taro.showToast({ title: data[0].message, icon: "none" });
    return false;
  } else {
    return true;
  }
}
//#endregion

//#region 表单验证 -- 注册团长
export function utils_validate_register(obj: { [key: string]: any; }): boolean {
  const schema = new Schema({
    name: {
      type: String,
      required: true,
      length: { min: 2, max: 16 },
      message: {
        required: "请输入身份证姓名",
        length: "姓名长度必须为2到16个字",
      },
    },
    phone: {
      type: String,
      required: true,
      message: { required: "请授权手机号" },
    },
    location_name: {
      type: String,
      required: true,
      message: { required: "请选择地址" },
    },
  });
  const data = schema.validate(utils_deep(obj));
  if (data.length) {
    Taro.showToast({ title: data[0].message, icon: "none" });
    return false;
  } else {
    return true;
  }
}

//#endregion

//#region 表单验证 -- 绑定快递面单账号
export function utils_validate_bind_account(obj: { [key: string]: any; }): boolean {
  const schema = new Schema({
    password: {
      type: String,
      required: true,
      message: { required: "请输入客户编码" },
    },
    bizId: {
      type: String,
      required: true,
      message: { required: "请输入客户密钥" },
    },
    deliveryId: {
      type: String,
      required: true,
      message: { required: "请选择物流公司" },
    },
  });
  const data = schema.validate(utils_deep(obj));
  if (data.length) {
    Taro.showToast({ title: data[0].message, icon: "none" });
    return false;
  } else {
    return true;
  }
}

//#endregion

//#region 扫描二维码 获取打印机ID
export async function utils_get_scan_code(): Promise<string | null> {
  try {
    const res = await Taro.scanCode({ onlyFromCamera: true });
    if (res.scanType == "QR_CODE" && res.result.includes("siid")) {
      const { siid } = utils_urlToObj<{ siid: string; }>(res.result);
      if (siid) {
        return siid;
      } else {
        throw null;
      }
    } else {
      throw null;
    }
  } catch {
    return null;
  }
}
//#endregion

//#region 扫描二维码 获取团队成员OPENID
export async function utils_get_scan_code_team_member_OPENID(): Promise<string | null> {
  try {
    const res = await Taro.scanCode({ onlyFromCamera: true });
    if (res.scanType === "WX_CODE" && res.path.includes("M_D")) {
      const { M_D } = utils_urlToObj<{ M_D: string; }>(res.path);
      if (M_D) {
        return M_D;
      } else {
        throw null;
      }
    } else {
      throw null;
    }
  } catch {
    return null;
  }
}
//#endregion

//#region 字符串转ASCII十进制
export function utils_string_to_char_code(str0: string) {
  return `x${str0.split("").reduce((str1, e) => {
    return str1 + e.charCodeAt(0);
  }, "")}`;
}
//#endregion

//#region 查找数组中重复元素
export function utils_duplicates(arr: any[]) {
  let temp: any[] = [];
  arr.forEach((item) => {
    if (arr.indexOf(item) != arr.lastIndexOf(item) && temp.indexOf(item) == -1) {
      temp.push(item);
    }
  });
  return temp;
}
//#endregion

//#region 微信支付-快递订单
export async function utils_wx_pay(item: Product_Express): Promise<Product_Express> {
  Taro.showLoading({ mask: true, title: "支付..." });
  // 获取支付参数
  const [err0, res0] = await to(Api_wxpay_wxPay_express({ ...item, ...getEnvDevParam({ totalFee: 1 }) }));
  if (err0) {
    throw new Error("获取支付参数失败");
  }
  // 吊起微信支付
  const [err1, res1] = await to(Taro.requestPayment({ ...res0.payment }));
  if (err1) {
    throw new Error("取消支付！");
  }
  // 支付成功后...
  if (res1.errMsg === "requestPayment:ok") {
    return item;
  } else {
    throw new Error("吊起微信支付异常");
  }
}
//#endregion

//#region 图片ORC 通用OCR
export async function utils_ocr(filePath: string): Promise<string> {
  try {
    const invokeRes = await (Taro as any).serviceMarket.invokeService({
      service: "wx79ac3de8be320b71",
      api: "OcrAllInOne",
      data: {
        // 用 CDN 方法标记要上传并转换成 HTTP URL 的文件
        img_url: new (Taro as any).serviceMarket.CDN({ type: "filePath", filePath: filePath }),
        data_type: 1,
        ocr_type: 8,
      },
    });
    if (invokeRes.errMsg === "invokeService:ok") {
      const resStr = invokeRes.data.ocr_comm_res.items.reduce((str: any, e: any) => {
        return (str += `${e.text} `);
      }, "");
      return resStr;
    } else {
      throw invokeRes;
    }
  } catch (err) {
    Taro.showToast({ title: "图片地址识别失败", icon: "none" });
    throw err;
  }
}

//#endregion

//#region 获取二维码
export function utils_get_qrcode({ page, scene }: { page: string; scene: string; }): Promise<string | null> {
  console.log("HHH", page, scene);
  return new Promise(async (resolve, reject) => {
    Taro.showLoading({ title: "获取中...", mask: true });
    try {
      const imgBuffer = await Api_tasks_createQRCode({
        page: page, // "pages_user/user_express",
        scene: scene, //`R_D=${selfInfo_S?.OPENID}`
      });
      const FILE = Taro.getFileSystemManager();
      const FILE_PATH = `${Taro.env.USER_DATA_PATH}/qrcode.jpg`;
      FILE.writeFile({
        filePath: FILE_PATH,
        encoding: "binary",
        data: imgBuffer,
        success: (e) => {
          if (e.errMsg) {
            resolve(FILE_PATH);
          } else {
            reject(null);
          }
        },
        fail: () => reject(null),
      });
    } catch (err) {
      reject(err);
    }

    Taro.hideLoading();
  });
}
//#endregion

//#region 获取当天0点时间戳
export function utils_get_timestamp(subDay: number) {
  const date = format(subDays(new Date(), subDay), "yyyy/MM/dd");
  const timestamp = new Date(date).getTime();
  return timestamp;
}
//#endregion

//#region 本月第一天，本月最后一天
export function utils_start_end_date(date: string) {
  const today = new Date(date);
  const firstDateOfMonth = format(startOfMonth(today), "yyyy-MM-dd");
  const lastDateOfMonth = format(lastDayOfMonth(today), "yyyy-MM-dd");
  return {
    firstDateOfMonth: firstDateOfMonth,
    lastDateOfMonth: lastDateOfMonth,
  };
}
//#endregion

//#region 打开 excel 表格文件
export async function utils_open_excle(buffer: ArrayBuffer, date: string) {
  const filePath = `${Taro.env.USER_DATA_PATH}/${date}对账单.xlsx`;
  Taro.getFileSystemManager().writeFile({
    filePath: filePath,
    data: buffer,
    success: () => {
      Taro.openDocument({ filePath: filePath, showMenu: true });
    },
  });
}
//#endregion

//#region 导入 excel 表格文件
export async function utils_import_excle(): Promise<string> {
  return new Promise((resolve, reject) => {
    Taro.chooseMessageFile({
      count: 1,
      type: "file",
      extension: [".xls", ".xlsx"],
      success: (res0) => {
        const _file = res0.tempFiles[0];
        Taro.getFileSystemManager().readFile({
          filePath: _file.path,
          encoding: "base64",
          success: async (res1) => {
            resolve(res1.data as string);
          },
          fail: reject,
        });
      },
      fail: reject,
    });
  });
}
//#endregion

//#region 选择电子面单账号
export function utils_get_logistics(selfInfo_S: BaseUserInfo | null) {
  const logistics = selfInfo_S?.regiment_info?.logistics ?? [];
  return new Promise<Logistics_Account>((resolve, reject) => {
    if (logistics.length === 0) {
      Taro.showModal({
        title: "提示",
        content: "您还没有配置面单账号",
        showCancel: false,
        confirmText: "去配置",
        success: () => {
          Taro.navigateTo({ url: "/pages_regiment/regiment_bind_account" });
          reject(new Error("没有面单账号"));
        },
        fail: () => reject(new Error("没有面单账号")),
      });
    } else if (logistics.length === 1) {
      resolve(logistics[0]);
    } else {
      Taro.showActionSheet({
        alertText: "请选择面单账号",
        itemList: [...logistics.map((e) => e.deliveryName)],
        success: (e) => {
          if (e.errMsg === "showActionSheet:ok") {
            resolve(logistics[e.tapIndex]);
          } else {
            reject(new Error("取消下单"));
          }
        },
        fail: () => reject(new Error("取消下单")),
      });
    }
  });
}
//#endregion

//#region 生成电子面单
export async function utils_generate_order(data: Product_Express): Promise<Product_Express> {
  Taro.showLoading({ title: "生成面单...", mask: true });
  try {
    let res = await Api_logistics_addOrder({
      ...data,
    });
    return res;
  } catch {
    Taro.hideLoading();
    const ee = await Taro.showModal({
      content: "获取电子面单失败，点击重试继续获取",
      confirmText: "重试",
      cancelText: "取消",
    });
    if (ee.confirm) {
      const res = await utils_generate_order(data);
      return res;
    } else {
      throw new Error("取消下单");
    }
  }
}
//#endregion

//#region 选择打印机
export function utils_get_printer(selfInfo_S: BaseUserInfo | null) {
  const printers = selfInfo_S?.regiment_info?.printers ?? [];
  return new Promise<Printer_Info>((resolve, reject) => {
    if (printers.length === 0) {
      Taro.showModal({
        title: "您还没有配置打印机",
        showCancel: false,
        confirmText: "去配置",
        success: () => {
          Taro.navigateTo({ url: "/pages_regiment/regiment_bind_printer_cloud" });
          throw new Error("没有打印机");
        },
        fail: () => reject(new Error("没有打印机")),
      });
    } else if (printers.length === 1) {
      resolve(printers[0]);
    } else {
      Taro.showActionSheet({
        alertText: "清选择打印机",
        itemList: [...printers.map((e) => e.siid)],
        success: async (e) => {
          if (e.errMsg === "showActionSheet:ok") {
            resolve(printers[e.tapIndex]);
          } else {
            reject(new Error("取消"));
          }
        },
        fail: () => reject(new Error("取消")),
      });
    }
  });
}
//#endregion
