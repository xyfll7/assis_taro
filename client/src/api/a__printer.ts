import { wx_cloud_callFunctions } from "./wx_cloud_callFunctions";

export async function Api_printer_printExpress(params: Product_Express): Promise<PrintRes> {
  try {
    const res = await wx_cloud_callFunctions<PrintRes>({
      name: "a__printer_cloud",
      data: {
        func: "printExpress_cloud",
        data: { ...params }
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}

export async function Api_printer_printExpress_excle(params: string): Promise<string[][]> {
  try {
    const res = await wx_cloud_callFunctions<string[][]>({
      name: "a__printer_cloud",
      data: {
        func: "printExpress_excle_cloud",
        data: params
      }
    });
    return res;
  } catch (err) {
    throw err;
  }
}
