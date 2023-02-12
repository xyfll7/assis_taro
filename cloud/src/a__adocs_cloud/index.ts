import { get_token, login } from "./functions";



// 云函数入口函数
export const main = async (event: any,) => {
  console.log("event::::", event.path);
  switch (event.path) {
    case "/get_token":
      return await get_token();
    case "/login":
      return await login(event);
    default: return "没有调用任何云函数";
  }
};



