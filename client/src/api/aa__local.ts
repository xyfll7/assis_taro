import Taro from "@tarojs/taro";
import MD5 from 'crypto-js/md5.js';

const deliveryId_2_kuaidicom: Record<string, string> = {
  JTSD: "jtexpress",
  YUNDA: "yunda",
};

export async function Api_local_reachable(express: Product_Express) {
  const param = JSON.stringify({
    "recManName": express.recMan?.name,
    "recManMobile": express.recMan?.mobile,
    "recManPrintAddr": `${express.recMan?.province}${express.recMan?.city}${express.recMan?.area}${express.recMan?.address}`,
    "sendManName": express.sendMan?.name,
    "sendManMobile": express.sendMan?.mobile,
    "sendManPrintAddr": `${express.sendMan?.province}${express.sendMan?.city}${express.sendMan?.area}${express.sendMan?.address}`,
    "kuaidicom": deliveryId_2_kuaidicom[express.deliveryId!], // "jtexpress"
  });
  const t = Date.now();
  const key = "VvSeoqQE81";  // 授权KEY // cSpell: ignore Seoq
  const secret = "c0d750adba834244ae02f5c8fff3af9e"; // 密钥
  const sign = MD5(`${param}${t}${key}${secret}`).toString().toUpperCase();  // 签名
  const res = await Taro.request({
    url: "https://api.kuaidi100.com/reachable.do",
    header: { "Content-Type": "application/x-www-form-urlencoded" },
    data: { method: "reachable", key, sign, t, param }
  });
  if (res.data.returnCode === "200" && res.data.result) {
    return ___process_reachable(res.data.data);
  } else if (res.data.returnCode === "400") {
    return `${res.data.message}，错误码：${res.data.returnCode}`;
  } else {
    Taro.showToast({ title: `${res.data.message}，错误码：${res.data.returnCode}`, icon: "none" });
    throw res;
  }
}

const ___process_reachable = (data: any) => {
  if (data?.toReachable[0]?.reachable === 0) { // 不可达
    return `${data.toReachable[0]?.reason},暂不可向该收件地址发货`;
  } else if (data?.toReachable[0]?.reachable === 1) {
    return false;
  } else if (data?.fromReachable[0]?.reachable === 0) {
    return `${data.fromReachable[0]?.reason},该寄件地址暂不可发货`;
  } else if (data?.fromReachable[0]?.reachable === 1) {
    return false;
  } else {
    return false;
  }
};
