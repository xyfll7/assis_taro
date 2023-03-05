import { wx_cloud_callFunctions } from "./wx_cloud_callFunctions";


//#region users
export async function Api_agent_users_getRegimentList(): Promise<BaseUserInfo[]> {
  try {
    const res = await wx_cloud_callFunctions<BaseUserInfo[]>({
      name: "agent__db_cloud",
      data: {
        func: "users_getRegimentList_cloud"
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}
//#endregion


//#region price
export async function Api_agent_price_getPriceSchemeList(): Promise<PriceScheme_Type[]> {
  try {
    const res = await wx_cloud_callFunctions<PriceScheme_Type[]>({
      name: "agent__db_cloud",
      data: {
        func: "price_getPriceSchemeList_cloud"
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}
//#endregion
