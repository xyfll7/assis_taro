import request from 'superagent';
import MD5 from 'crypto-js/md5.js';
import Hex from 'crypto-js/enc-hex.js';
import Base64 from 'crypto-js/enc-base64.js';
import { readFile } from 'fs/promises';

let order = JSON.parse(
  await readFile(
    new URL('./order.json', import.meta.url)
  )
);

const SECRET_KEY = "UqZ69y2kleFeNULEShmHc1sLd8Uoy312"; // cSpell:ignore NULE
const BaseUrl = "https://cloudinter-linkgateway.sto.cn/gateway/link.do";
// const BaseUrl = "http://cloudinter-linkgatewaytest.sto.cn/gateway/link.do";

function getSignature(content, secretKey) {
  const text = content + secretKey;
  const res0 = MD5(text).toString();
  const res1 = Hex.parse(res0);
  const res2 = Base64.stringify(res1);
  return res2;
}

async function run() {
  const res = await request.post(BaseUrl)
    .send({
      content: JSON.stringify(order),
      data_digest: getSignature(JSON.stringify(order), SECRET_KEY),
      api_name: "OMS_EXPRESS_ORDER_CREATE",
      from_appkey: "CAKgdwlXHFIEKag", // cSpell:ignore XHFIE Kgdwl
      from_code: "CAKgdwlXHFIEKag",
      to_appkey: "sto_oms",
      to_code: "sto_oms",
    })
    .set({ "Content-Type": "application/x-www-form-urlencoded", });
  console.log(res.res.text);
  console.log(JSON.parse(res.res.text));
}
run()






