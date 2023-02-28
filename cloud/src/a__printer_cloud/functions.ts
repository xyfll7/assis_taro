// cSpell:ignore Seoq KHTML
// 云函数代码
import { Code } from "../../../client/src/a_config";
import cloud from "wx-server-sdk";
import MD5 from 'crypto-js/md5.js';
import request from "superagent";
import xlsx from "node-xlsx";

// @ts-ignore
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

export async function printExpress_cloud(
  event: Events<Product_Express>
): Promise<Result<Product_Express>> {
  try {
    const res0 = await ___print_express(event);
    const res1 = await ___order_update(event);
    return {
      code: Code.SUCCESS,
      message: "打印成功",
      data: res1,
      res: res0
    };
  } catch (err) {
    throw err;
  }

}


async function ___print_express(
  event: Events<Product_Express>
): Promise<PrintRes> {
  const { data } = event;
  const param = JSON.stringify({
    tempid: data.printer?.tempid
      ? data.printer?.tempid
      : "201ea87f51c04576a8e5fd4200f68fb1", // 通过管理后台的打印模板V2信息获取
    printType: "CLOUD", // 打印类型（IMAGE,CLOUD,HTML）。IMAGE:生成图片短链；HTML:生成html短链；CLOUD:使用快递100云打印机打印，使用CLOUD时siid必填
    siid: data.printer?.siid, // 打印设备，通过打印机输出的设备码进行获取，printType为CLOUD时必填
    direction: data.printer?.direction, // 打印方向（默认0） 0-正方向 1-反方向；只有printType为CLOUD有作用
    // "callBackUrl": "",  // 打印状态回调地址
    customParam: ___makeParam(data),
  });
  const t = Date.now();
  const key = "VvSeoqQE81"; // 授权KEY
  const secret = "c0d750adba834244ae02f5c8fff3af9e"; // 密钥
  const sign = MD5(`${param}${t}${key}${secret}`).toString().toUpperCase(); // 签名
  try {
    const result = await request
      .post("https://api.kuaidi100.com/label/order")
      .send({ method: "custom", key, sign, t, param })
      .set({
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
      });
    if (result?.body?.code == 200 && result?.body?.success) {
      return result.body as PrintRes;
    } else {
      console.log(result);
      throw new Error("打印任务提交失败");
    }
  } catch (err: any) {
    console.log(err);
    throw new Error(`服务器错误，打印任务提交失败，${err.errMsg}`);
  }
}

async function ___order_update(
  event: Events<Product_Express>
): Promise<Product_Express> {
  try {
    const { data } = event;
    data.print_times += 1;
    data.timestamp_print = Date.now();
    let res = <cloud.DB.IUpdateResult>await db
      .collection("orders")
      .doc(data._id!)
      .update({
        data: {
          timestamp_print: data.timestamp_print,
          print_times: _.inc(1),
        },
      });
    if (res.errMsg === "document.update:ok" && res.stats.updated === 1) {
      return data;
    } else {
      console.log(res);
      throw new Error(`订单更新失败，${res.errMsg}。`);
    }
  } catch (err: any) {
    console.log(err);
    throw new Error(`服务器错误，订单更新失败，${err.errMsg}`);
  }
}

function ___makeParam(data: Product_Express) {
  return {
    // _id: data._id,
    // outTradeNo: data.outTradeNo,
    // self_OPENID: data.self_OPENID,
    // regiment_OPENID: data.self_OPENID,
    // product_type: data.product_type,
    // totalFee: data.totalFee ,
    describe: data.describe,
    // payStatus: data.payStatus, // 0 未支付 1 待付款 2 完成支付

    // timestamp_init: data.timestamp_init,
    // timestamp_update: data.timestamp_update,
    // timestamp_pay: data.timestamp_pay,
    // timestamp_pay_callback: data.timestamp_pay_callback,

    // deliveryName: data.deliveryName , // 快递公司名称
    // deliveryId: data.deliveryId , // 快递公司ID //"JTSD",
    // bizId: data.bizId, // 面单账号 "J00862837174",

    waybillData_0: data?.waybillData![0]?.value ?? "",
    waybillData_1: `${data?.waybillData![1]?.value ?? ""} ${data?.waybillData![2]?.value ?? ""
      }`,
    waybillId: data.waybillId,

    recMan_name: data.recMan?.name,

    recMan_mobile: data.recMan?.mobile,
    recMan_company: data.recMan?.company,
    recMan_post_code: data.recMan?.post_code,
    recMan_country: data.recMan?.country,
    recMan_province: data.recMan?.province,
    recMan_city: data.recMan?.city,
    recMan_area: data.recMan?.area,
    recMan_address: data.recMan?.address,

    sendMan_name: data.sendMan?.name,
    sendMan_mobile: data.sendMan?.mobile,
    sendMan_company: data.sendMan?.company,
    sendMan_post_code: data.sendMan?.post_code,
    sendMan_country: data.sendMan?.country,
    sendMan_province: data.sendMan?.province,
    sendMan_city: data.sendMan?.city,
    sendMan_area: data.sendMan?.area,
    sendMan_address: data.sendMan?.address,

    itemType: data.itemType, // 包裹类型
    itemNotes: data.itemNotes, // 包裹备注

    weight: data.weight, // 重量
    // weight_inc: data.weight_inc, // 重量自增量
    // pickUpType: data.pickUpType,  // 上门取件/网店自寄
    // print_times: data.print_times, // 打印次数
    // timestamp_print: data.timestamp_print,  // 打印时间
  };
}


export async function printExpress_excle_cloud(
  event: Events<string>
): Promise<Result<string[]>> {

  const excle_file = Buffer.from(event.data, "base64");
  const [res0] = xlsx.parse(excle_file);
  return {
    code: Code.SUCCESS,
    message: "读取表格成功",
    data: res0.data as string[],
  };
}
