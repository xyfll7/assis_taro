// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境

// 云函数入口函数
exports.main = async (event: any) => {
  console.log("看看都有些什么参数", event.body);
  return {
    event: "SSSSSSS",
  };
};
