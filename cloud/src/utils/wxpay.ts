
import crypto from 'crypto';
import request from 'superagent';
const x509_1 = require('@fidm/x509');
class Base {
  public authType = 'WECHATPAY2-SHA256-RSA2048'; // 认证类型，目前为WECHATPAY2-SHA256-RSA2048
  public baseUrl = "https://api.mch.weixin.qq.com/v3";
  public sp_mchid: string; // 服务商户号 string[1,32]	是	body 服务商户号，由微信支付生成并下发 示例值：1230000109
  public sp_appid: string; // 服务商应用ID string[1,32] 是  body 由微信生成的应用ID，全局唯一。请求基础下单接口时请注意APPID的应用属性，例如公众号场景下，需使用应用属性为公众号的服务号APPID 示例值：wx8888888888888888
  public sub_mchid?: string; // 服务商户号 string[1,32]	是	body 服务商户号，由微信支付生成并下发 示例值：1230000109
  public sub_appid?: string; // 服务商应用ID string[1,32] 是  body 由微信生成的应用ID，全局唯一。请求基础下单接口时请注意APPID的应用属性，例如公众号场景下，需使用应用属性为公众号的服务号APPID 示例值：wx8888888888888888
  public key?: string; // APIv3密钥
  private serial_no: string; // 证书序列号
  private publicKey: Buffer; // 公钥
  private privateKey: Buffer; // 密钥

  public static certificates: { [key in string]: string } = {};

  protected userAgent = '127.0.0.1'; // User-Agent
  constructor(params: IWxPay) {
    this.sp_mchid = params.sp_mchid; // 服务商户号 string[1,32]	是	body 服务商户号，由微信支付生成并下发 示例值：1230000109
    this.sp_appid = params.sp_appid; // 服务商应用ID string[1,32] 是  body 由微信生成的应用ID，全局唯一。请求基础下单接口时请注意APPID的应用属性，例如公众号场景下，需使用应用属性为公众号的服务号APPID 示例值：wx8888888888888888
    this.publicKey = params.publicKey; // 公钥
    this.serial_no = params.serial_no ?? this.getSN(params.publicKey); // 证书序列号
    this.privateKey = params.privateKey; // 密钥
    this.key = params.key;
  }
  // 获取序列号
  public getSN(fileData?: string | Buffer): string {
    if (!fileData && !this.publicKey) throw new Error('缺少公钥');
    if (!fileData) fileData = this.publicKey;
    if (typeof fileData == 'string') {
      fileData = Buffer.from(fileData);
    }
    const certificate = x509_1.Certificate.fromPEM(fileData);
    return certificate.serialNumber;
  }
  /**
   * 签名+授权认证
   */
  public getSignatureAuthorization(method: string, url: string, params?: Record<string, any>) {
    const nonce_str = Math.random()
      .toString(36)
      .substr(2, 15),
      timestamp = parseInt(+new Date() / 1000 + '').toString();

    const signature = this.getSignature(method, nonce_str, timestamp, url.replace('https://api.mch.weixin.qq.com', ''), params);
    const authorization = this.getAuthorization(nonce_str, timestamp, signature);
    return authorization;
  }
  /**
 * 构建请求签名参数
 * @param method Http 请求方式
 * @param url 请求接口 例如/v3/certificates
 * @param timestamp 获取发起请求时的系统当前时间戳
 * @param nonceStr 随机字符串
 * @param body 请求报文主体
 */
  public getSignature(method: string, nonce_str: string, timestamp: string, url: string, body?: string | Record<string, any>): string {
    let str = method + '\n' + url + '\n' + timestamp + '\n' + nonce_str + '\n';
    if (body && body instanceof Object) body = JSON.stringify(body);
    if (body) str = str + body + '\n';
    if (method === 'GET') str = str + '\n';
    return this.sha256WithRsa(str);
  }
  /**
 * SHA256withRSA
 * @param data 待加密字符
 * @param privatekey 私钥key  key.pem   fs.readFileSync(keyPath)
 */
  public sha256WithRsa(data: string): string {
    if (!this.privateKey) throw new Error('缺少秘钥文件');
    return crypto
      .createSign('RSA-SHA256')
      .update(data)
      .sign(this.privateKey, 'base64');
  }
  /**
 * 获取授权认证信息
 * @param nonceStr  请求随机串
 * @param timestamp 时间戳
 * @param signature 签名值
 */
  public getAuthorization(nonce_str: string, timestamp: string, signature: string): string {
    const _authorization =
      'mchid="' +
      this.sp_mchid +
      '",' +
      'nonce_str="' +
      nonce_str +
      '",' +
      'timestamp="' +
      timestamp +
      '",' +
      'serial_no="' +
      this.serial_no +
      '",' +
      'signature="' +
      signature +
      '"';
    return this.authType.concat(' ').concat(_authorization);
  }
  /**
  * post 请求
  * @param url  请求接口
  * @param params 请求参数
  */
  protected async postRequest(url: string, params: Record<string, any>, authorization: string) {
    try {
      const result = await request
        .post(url)
        .send(params)
        .set({
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': this.userAgent,
          Authorization: authorization,
          'Accept-Encoding': 'gzip',
        });
      return {
        status: result.status,
        ...result.body,
      };
    } catch (error) {
      const err = JSON.parse(JSON.stringify(error));
      return {
        status: err.status,
        ...(err.response.text && JSON.parse(err.response.text)),
      };
    }
  }
}

export class WxPay extends Base {
  constructor(params: IWxPay) {
    super(params);
  }

  // ---------------支付相关接口--------------//
  /**
   * JSAPI支付 或者 小程序支付
   * @param params 请求参数 object 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3_partner/apis/chapter4_5_1.shtml
   */
  public async transactions_jsapi(params: IJsapi): Promise<ResPay> {
    this.sub_appid = this.sp_appid;
    this.sub_mchid = params.sub_mchid;
    // 请求参数
    const _params = {
      sp_appid: this.sp_appid,
      sp_mchid: this.sp_mchid,
      ...params,
    };

    const url = `${this.baseUrl}/pay/partner/transactions/jsapi`;

    const authorization = this.getSignatureAuthorization('POST', url, _params);

    const result: any = await this.postRequest(url, _params, authorization);

    if (result.status === 200 && result.prepay_id) {
      const data = {
        timeStamp: parseInt(+new Date() / 1000 + '').toString(),
        nonceStr: Math.random().toString(36).substr(2, 15),
        package: `prepay_id=${result.prepay_id}`,
        signType: "RSA" as any,
        paySign: '',
      };

      const str = [this.sub_appid, data.timeStamp, data.nonceStr, data.package, ''].join('\n');
      data.paySign = this.sha256WithRsa(str);
      return {
        appid: this.sp_appid, // "wxd2d16a504f24665e"
        errCode: 0, // 0
        errCodeDes: "", // "201 商户订单号重复"
        errMsg: "cloudPay.unifiedOrder:ok", // "cloudPay.unifiedOrder:ok"
        mchId: this.sub_mchid, // "1800008281"
        nonceStr: data.nonceStr, // "r3QSTIGsUvWNcsNB" // cSpell:ignore QSTIGs
        payment: data, //
        appId: this.sp_appid, // "wxc6ff511796ec714a"
        package: data.package, // "prepay_id="
        paySign: data.paySign, // "FC7EB2ABF5073F543CDF3116AFED797B"
        signType: data.signType!, // "MD5"
        timeStamp: data.timeStamp, // "1647184299"
        resultCode: "SUCCESS", // "FAIL"
        returnCode: "SUCCESS", // "SUCCESS"
        returnMsg: "OK", // "OK"
        sign: data.paySign, // "AB587BF9D01D03F0B1757A61BF3BA218"
        subAppid: this.sub_appid, // "wxc6ff511796ec714a"
        subMchId: this.sub_mchid, // "1612524003"
      };
    }
    return result;
  }
  /**
   * 申请退款
   * @param params 请求参数 路径 参数介绍 请看文档https://pay.weixin.qq.com/wiki/doc/apiv3_partner/apis/chapter4_5_9.shtml
   */
  public async refunds(params: Irefunds1 | Irefunds2): Promise<Record<string, any>> {
    const url = 'https://api.mch.weixin.qq.com/v3/refund/domestic/refunds';
    // 请求参数
    const _params = {
      ...params,
    };

    const authorization = this.getSignatureAuthorization('POST', url, _params);

    return await this.postRequest(url, _params, authorization);
  }
}

export class WxSign extends Base {
  constructor(params: IWxPay) {
    super(params);
  }
  /**
  * 验证签名，提醒：node 取头部信息时需要用小写，例如：req.headers['wechatpay-timestamp']
  * @param params.timestamp HTTP头Wechatpay-Timestamp 中的应答时间戳
  * @param params.nonce HTTP头Wechatpay-Nonce 中的应答随机串
  * @param params.body 应答主体（response Body），需要按照接口返回的顺序进行验签，错误的顺序将导致验签失败。
  * @param params.serial HTTP头Wechatpay-Serial 证书序列号
  * @param params.signature HTTP头Wechatpay-Signature 签名
  * @param params.apiSecret APIv3密钥，如果在 构造器 中有初始化该值(this.key)，则可以不传入。当然传入也可以
  */
  public async verifySign(params: {
    timestamp: string | number;
    nonce: string;
    body: Record<string, any> | string;
    serial: string;
    signature: string;
    apiSecret?: string;
  }) {
    const { timestamp, nonce, body, serial, signature, apiSecret } = params;

    let _publicKey = Base.certificates[serial];

    if (!_publicKey) {
      await this.fetchCertificates(apiSecret);
    }

    _publicKey = Base.certificates[serial];

    if (!_publicKey) {
      throw new Error('平台证书序列号不相符，未找到平台序列号');
    }

    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    const data = `${timestamp}\n${nonce}\n${bodyStr}\n`;
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(data);

    return verify.verify(_publicKey, signature, 'base64');
  }
  /**
  * 拉取平台证书到 Base.certificates 中
  * @param apiSecret APIv3密钥
  * https://pay.weixin.qq.com/wiki/doc/apiv3/apis/wechatpay5_1.shtml
  */
  private async fetchCertificates(apiSecret?: string) {
    const url = 'https://api.mch.weixin.qq.com/v3/certificates';
    const authorization = this.getSignatureAuthorization('GET', url);
    const result = await this.getRequest(url, authorization);

    if (result.status === 200) {
      const data = result.data as {
        serial_no: string;
        effective_time: string;
        expire_time: string;
        encrypt_certificate: {
          algorithm: string;
          nonce: string;
          associated_data: string;
          ciphertext: string;
        };
      }[];

      const newCertificates = {} as { [key in string]: string };

      data.forEach(item => {
        const decryptCertificate = this.decipher_gcm<string>(
          item.encrypt_certificate.ciphertext,
          item.encrypt_certificate.associated_data,
          item.encrypt_certificate.nonce,
          apiSecret,
        );

        newCertificates[item.serial_no] = x509_1.Certificate.fromPEM(Buffer.from(decryptCertificate)).publicKey.toPEM();
      });

      Base.certificates = {
        ...Base.certificates,
        ...newCertificates,
      };
    } else {
      throw new Error('拉取平台证书失败');
    }
  }
  /**
  * 回调解密
  * @param ciphertext  Base64编码后的开启/停用结果数据密文
  * @param associated_data 附加数据
  * @param nonce 加密使用的随机串
  * @param key  APIv3密钥
  */
  public decipher_gcm<T extends any>(ciphertext: string, associated_data: string, nonce: string, key?: string): T {
    if (key) this.key = key;
    if (!this.key) throw new Error('缺少key');

    const _ciphertext = Buffer.from(ciphertext, 'base64');

    // 解密 ciphertext字符  AEAD_AES_256_GCM算法
    const authTag: any = _ciphertext.subarray(_ciphertext.length - 16);
    const data = _ciphertext.subarray(0, _ciphertext.length - 16);
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, nonce);
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from(associated_data));
    const decoded = decipher.update(data, undefined, 'utf8');
    decipher.final();

    try {
      return JSON.parse(decoded);
    } catch (e) {
      return decoded as T;
    }
  }
  /**
  * get 请求
  * @param url  请求接口
  * @param query 请求参数
  */
  protected async getRequest(url: string, authorization: string, query: Record<string, any> = {}): Promise<Record<string, any>> {
    try {
      const result = await request
        .get(url)
        .query(query)
        .set({
          Accept: 'application/json',
          'User-Agent': this.userAgent,
          Authorization: authorization,
          'Accept-Encoding': 'gzip',
        });

      let data = {};
      switch (result.type) {
        case 'application/json':
          data = {
            status: result.status,
            ...result.body,
          };
          break;
        case 'text/plain':
          data = {
            status: result.status,
            data: result.text,
          };
          break;
        case 'application/x-gzip':
          data = {
            status: result.status,
            data: result.body,
          };
          break;
        default:
          data = {
            status: result.status,
            ...result.body,
          };
      }
      return data;
    } catch (error) {
      const err = JSON.parse(JSON.stringify(error));
      return {
        status: err.status,
        ...(err.response.text && JSON.parse(err.response.text)),
      };
    }
  }
}


interface IJsapi {
  appid?: string, // 服务商应用ID string[1,32] 是  body 由微信生成的应用ID，全局唯一。请求基础下单接口时请注意APPID的应用属性，例如公众号场景下，需使用应用属性为公众号的服务号APPID 示例值：wx8888888888888888
  mchid?: string, // 服务商户号 string[1,32]	是	body 服务商户号，由微信支付生成并下发 示例值：1230000109
  sp_appid?: string, // 服务商应用ID string[1,32] 是  body 由微信生成的应用ID，全局唯一。请求基础下单接口时请注意APPID的应用属性，例如公众号场景下，需使用应用属性为公众号的服务号APPID 示例值：wx8888888888888888
  sp_mchid?: string, // 服务商户号 string[1,32]	是	body 服务商户号，由微信支付生成并下发 示例值：1230000109
  sub_appid: string, // 子商户应用ID		string[1,32]	否	body 子商户申请的应用ID，全局唯一。请求基础下单接口时请注意APPID的应用属性，例如公众号场景下，需使用应用属性为公众号的APPID  若sub_openid有传的情况下，sub_appid必填，且sub_appid需与sub_openid对应 示例值：wxd678efh567hg6999
  sub_mchid: string, // 子商户号		string[1,32]	是	body 子商户的商户号，由微信支付生成并下发。 示例值：1900000109
  description: string, // 商品描述		string[1,127]	是	body 商品描述  示例值：Image形象店-深圳腾大-QQ公仔
  out_trade_no: string, // 商户订单号		string[6,32]	是	body 商户系统内部订单号，只能是数字、大小写字母_-*且在同一个商户号下唯一。  示例值：1217752501201407033233368018
  time_expire?: string, // 交易结束时间		string[1,64]	否	body 订单失效时间，遵循rfc3339标准格式，格式为yyyy-MM-DDTHH:mm:ss+TIMEZONE，yyyy-MM-DD表示年月日，T出现在字符串中，表示time元素的开头，HH:mm:ss表示时分秒，TIMEZONE表示时区（+08:00表示东八区时间，领先UTC8小时，即北京时间）。例如：2015-05-20T13:29:35+08:00表示，北京时间2015年5月20日 13点29分35秒。 示例值：2018-06-08T10:34:56+08:00
  attach?: string, // 附加数据		string[1,128]	否	body 附加数据，在查询API和支付通知中原样返回，可作为自定义参数使用，实际情况下只有支付完成状态才会返回该字段。 示例值：自定义数据
  notify_url: string, // 通知地址		string[1,256]	是	body 通知URL必须为直接可访问的URL，不允许携带查询串，要求必须为https地址。格式：URL 示例值：https://www.weixin.qq.com/wxpay/pay.php
  goods_tag?: string, // 订单优惠标记		string[1,32]	否	body 订单优惠标记 示例值：WXG
  support_fapiao?: string, // 电子发票入口开放标识		boolean	否	body 传入true时，支付成功消息和支付详情页将出现开票入口。需要在微信支付商户平台或微信公众平台开通电子发票功能，传此字段才可生效。  true：是 false：否     示例值：true
  settle_info?: {
    profit_sharing: string, // 是否指定分账	profit_sharing	boolean	否	是否指定分账，枚举值 true：是 false：否 示例值：true
  }, // 结算信息		object	否	body 结算信息
  amount: {
    total: number, // 总金额		int	是	订单总金额，单位为分。 示例值：100
    currency: string, // 货币类型		string[1,16]	否	CNY：人民币，境内商户号仅支持人民币。 示例值：CNY
  }, // 订单金额		object	是	body 订单金额信息
  payer: {
    sp_openid?: string, // 用户服务标识		string[1,128]	二选一	用户在服务商appid下的唯一标识。 下单前需获取到用户的Openid，Openid获取详见。 示例值：oUpF8uMuAJO_M2pxb1Q9zNjWeS6o
    sub_openid?: string, // 用户子标识		string[1,128] 二选一	用户在子商户appid下的唯一标识。若传sub_openid，那sub_appid必填。下单前需获取到用户的Openid，Openid获取详见。 示例值：oUpF8uMuAJO_M2pxb1Q9zNjWeS6o
  }, // 支付者		object	是	body 支付者信息
  detail?: {
    cost_price: number, // 订单原价		int	否	1、商户侧一张小票订单可能被分多次支付，订单原价用于记录整张小票的交易金额。 2、当订单原价与支付金额不相等，则不享受优惠。  3、该字段主要用于防止同一张小票分多次支付，以享受多次优惠的情况，正常支付订单不必上传此参数。   示例值：608800
    invoice_id: string, // 商品小票ID		string[1,32]	否	商家小票ID  示例值：微信123
    goods_detail: [], // 单品列表		array	否	单品列表信息 条目个数限制：【1，6000】
  }, // 优惠功能		object	否	body 优惠功能
  scene_info?: {
    payer_client_ip: string, // 用户终端IP		string[1,45]	是	用户的客户端IP，支持IPv4和IPv6两种格式的IP地址。示例值：14.23.150.211
    device_id: string, // 商户端设备号		string[1,32]	否	商户端设备号（门店号或收银设备ID）。 示例值：013467007045764
    store_info: any, // 商户门店信息		object	否	商户门店信息
  }, // 场景信息		object	否	body 支付场景描述
}

interface IWxPay {
  sp_mchid: string; // 服务商户号 string[1,32]	是	body 服务商户号，由微信支付生成并下发 示例值：1230000109
  sp_appid: string; // 服务商应用ID string[1,32] 是  body 由微信生成的应用ID，全局唯一。请求基础下单接口时请注意APPID的应用属性，例如公众号场景下，需使用应用属性为公众号的服务号APPID 示例值：wx8888888888888888
  serial_no: string; // 证书序列号
  publicKey: Buffer; // 公钥
  privateKey: Buffer; // 密钥
  key: string;
}


export interface Irefunds {
  sub_mchid: string;
  out_refund_no: string;
  reason?: string;
  notify_url?: string;
  funds_account?: string;
  amount: IRamount;
  goods_detail?: IRgoodsDetail[];
}
export interface Irefunds1 extends Irefunds {
  transaction_id: string;
  out_trade_no?: string;
}
export interface Irefunds2 extends Irefunds {
  transaction_id?: string;
  out_trade_no: string;
}

interface IRamount {
  total: number;
  currency: string;
  refund: number;
}
interface IRgoodsDetail {
  merchant_goods_id: string;
  wechatpay_goods_id?: string;
  goods_name?: string;
  refund_quantity: number;
  unit_price: number;
  refund_amount: number;
}
