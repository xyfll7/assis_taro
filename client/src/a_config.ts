
// 错误代码
export enum Code {
  SUCCESS = 200, // 提交成功
  DATABASE_ERROR = 400, // 数据库返回错误
  SERVER_ERROR = 500, // 服务器错误
  OTHER_ERROR = 501, // 其他错误
}
export enum PayStatus {
  /**
   * 待计重
   */
  PAY0 = 0,
  /**
   * 待付款
   */
  PAY1 = 1,
  /**
   * 支付
   */
  PAY2 = 2, // 完成支付
  /**
   * 完成退款
   */
  PAY3_ = -3, // 退款中
  PAY3 = 3,  // 完成退款
}
