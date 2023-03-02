import Taro from "@tarojs/taro";

// cSpell: ignore gfby eglqz SLSM Srcu

const OPENID =
  // "oGwbL5MUeSNxxA4o0oOmb_FUjE7g" || // 王肇
  // "oGwbL5CEoFe5T1fqyAQUu0ohSLSM" ||  // 王红霞
  // "oGwbL5P_IBh9s4s8-JFdPrQhDHoA" ||  // 御城国际
  // "oGwbL5IZEq-8Op4CvUTNodRKdOB0" ||  // 冯强
  // "oGwbL5O6owNRHLtGFSrcuXUu0v1s" ||  // 马智宝
  "";
const envObj: Record<EnvVersion, Environment> = {
  ...(!OPENID ?
    { develop: { envId: "cloud1-8gfby1gac203c61c", alias: "cloud1", envVersion: "develop", envReal: "develop", version: "" }, } :
    { develop: { envId: "production-8g1eglqz3d606693", alias: "production", envVersion: "release", envReal: "develop", version: "", OPENID }, }
  ),
  // trial: { envId: "cloud1-8gfby1gac203c61c", alias: "cloud1", envVersion: "trial", envReal: "trial",  version: "" },
  trial: { envId: "production-8g1eglqz3d606693", alias: "production", envVersion: "release", envReal: "trial", version: "" },
  release: { envId: "production-8g1eglqz3d606693", alias: "production", envVersion: "release", envReal: "release", version: "" },
};

export default function getEnv(): Environment {
  const {
    miniProgram: { envVersion, version },
  } = Taro.getAccountInfoSync();
  envObj[envVersion].version = version;
  return envObj[envVersion];
}

export function getEnvDevParam<T>(data: T): T | null {
  if (getEnv().envReal === "develop") {
    return data;
  }
  return null;
}
