import Taro from "@tarojs/taro";

// cSpell: ignore gfby eglqz
const envObj: Record<EnvVersion, Environment> = {
  // develop: { envId: "cloud1-8gfby1gac203c61c", alias: "cloud1", envVersion: "develop", envReal: "develop", version: "" },
  develop: { envId: "production-8g1eglqz3d606693", alias: "production", envVersion: "release", envReal: "develop", version: "", OPENID: "oGwbL5CEoFe5T1fqyAQUu0ohSLSM" },
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
