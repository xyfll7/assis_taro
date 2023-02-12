import Taro from "@tarojs/taro";

// cSpell: ignore gfby eglqz
const envObj: Record<EnvVersion, Environment> = {
  develop: { envId: "cloud1-8gfby1gac203c61c", alias: "cloud1", envVersion: "develop", version: "" },
  // develop: { envId: "production-8g1eglqz3d606693", alias: "production", envVersion: "release", version: "" },
  // trial: { envId: "cloud1-8gfby1gac203c61c", alias: "cloud1", envVersion: "trial", version: "" },
  trial: { envId: "production-8g1eglqz3d606693", alias: "production", envVersion: "release", version: "" },
  release: { envId: "production-8g1eglqz3d606693", alias: "production", envVersion: "release", version: "" },
};

export default function getEnv(): Environment {
  const {
    miniProgram: { envVersion, version },
  } = Taro.getAccountInfoSync();
  envObj[envVersion].version = version;
  return envObj[envVersion];
}

export function getEnvDevParam<T>(data: T): T | null {
  if (getEnv().envVersion === "develop") {
    return data;
  }
  return null;
}
