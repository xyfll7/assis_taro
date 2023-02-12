import { wx_cloud_callFunctions } from "./wx_cloud_callFunctions";

export async function Api_address_addAddress(params: AddressInfo): Promise<AddressInfo> {
  try {
    const res = await wx_cloud_callFunctions<AddressInfo>({
      name: "user__address_cloud",
      data: {
        func: "addAddress_cloud",
        data: { ...params },
      },
    });
    return res;
  } catch (err) {
    throw err;
  }
}
export async function Api_address_updateAddress(params: AddressInfo): Promise<AddressInfo> {
  try {
    const res = await wx_cloud_callFunctions<AddressInfo>({
      name: "user__address_cloud",
      data: {
        func: "updateAddress_cloud",
        data: { ...params },
      },
    });
    return res;
  } catch (err) {
    throw err;
  }
}
export async function Api_address_removeAddress(params: AddressInfo): Promise<AddressInfo> {
  try {
    const res = await wx_cloud_callFunctions<AddressInfo>({
      name: "user__address_cloud",
      data: {
        func: "removeAddress_cloud",
        data: { ...params },
      },
    });
    return res;
  } catch (err) {
    throw err;
  }
}

export async function Api_address_getAddressList(params: { timestamp: number; searchvalue?: string; address_type?: AddressType; OPENID: string; }): Promise<AddressInfo[]> {
  try {
    const res = await wx_cloud_callFunctions<AddressInfo[]>({
      name: "user__address_cloud",
      data: {
        func: "getAddressList_cloud",
        data: { ...params },
      },
    });
    return res;
  } catch (err) {
    throw err;
  }
}
