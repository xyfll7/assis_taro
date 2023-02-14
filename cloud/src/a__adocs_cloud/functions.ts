
import cloud from "wx-server-sdk";
import request from 'superagent';
import queryString from 'query-string';

// @ts-ignore cSpell:ignore production-8g1eglqz3d606693
cloud.init({ env: "production-8g1eglqz3d606693" });
const db = cloud.database();
const _ = db.command;

export async function get_token() {
  const res0 = await request.get(`https://api.weixin.qq.com/cgi-bin/token?${queryString.stringify({
    grant_type: "client_credential",
    appid: "wxc6ff511796ec714a",
    secret: "5139876ae51d420d2e168a382f36215e",
  })}`);
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Expose-Headers": "X-Token,X-Expires",
      "X-Token": res0.body.access_token,
      "X-Expires": res0.body.expires_in,
    },
  };
}

// 获取二维码
export async function login(event: any) {
  console.log("EVVVV::::", event);
  const ACCESS_TOKEN = event.headers['x-token'];
  const res = await request
    .post(`https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${ACCESS_TOKEN}`)
    .send({
      "page": "pages/index/index",
      "scene": "a=1",
      "check_path": true,
      "env_version": "release"
    });
  return {
    statusCode: 200,
    isBase64Encoded: true,
    headers: {
      "content-type": "image/png"
    },
    body: res.body
  };
}

export async function get_refund_order(event: any) {
  const res = await db.collection("orders").where({
    payStatus: 3
  }).get();
  return res;
}

export async function get_logistics_track(event: any) {
  // return event;
  const res0: Logistics_Path = await cloud.openapi.logistics.getPath({
    openid: event.self_OPENID,
    orderId: event.outTradeNo,
    deliveryId: event.deliveryId,
    waybillId: event.waybillId,
  });
  return res0;
}
