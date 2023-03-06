import Taro from "@tarojs/taro";

// cSpell: ignore gfby eglqz SLSM Srcu mzjx Unufh KBVE wihm xfxa AEEQ OlntF VCYGRayu kwyd Gwbwr Kstbro Ojstaypd

const _OPENID =
  // "oGwbL5MUeSNxxA4o0oOmb_FUjE7g" ||  // 王肇
  // "oGwbL5IZEq-8Op4CvUTNodRKdOB0" ||  // 冯强
  // "oGwbL5CEoFe5T1fqyAQUu0ohSLSM" ||  // 王红霞
  // "oGwbL5Ik6N77gAnLvNFh1BXP3lqc" ||  // 杨宝宝
  // "oGwbL5N_xHceDTweeY3W0NGG7l0A" ||  // 杨丽-东关大街11号-盛大购物中心三楼"親親寶貝童业
  // "oGwbL5P_IBh9s4s8-JFdPrQhDHoA" ||  // 御城国际
  // "oGwbL5J-wihmVkT8ma6CblWyKBVE" ||  // 王瑞-凯泽
  // "oGwbL5Gh9_xfxaR4Gsq3k2pPX_uU" ||  // 马婷-泗海怡园
  // "oGwbL5ElYYxJlOsIi7SoKbr4Pt3Y" ||  // 赵院院-虎头园小区
  // "oGwbL5O6owNRHLtGFSrcuXUu0v1s" ||  // 马智宝-二庄科金岳小区
  // "oGwbL5OlntFDvIWwFsPiUKUcAEEQ" ||  // 鲍巧艳-二庄科金岳小区
  // "oGwbL5G9lIOcFJcAUTnpCwcY-cPA" ||  // 张娜-铭馨苑小区
  // "oGwbL5A5mzjxHC-XtRUnufhCL4ck" ||  // 徐迎春-兴延小区
  // "oGwbL5N5VCYGRayuVG7_DMsStBJ4" ||  // 班海燕-长青路毛纺厂纺织花园5号楼二单元504
  // "oGwbL5I6ATu_7kwydZHQ5C9ePxWk" ||  // 吴华-鑫鑫安置房
  // "oGwbL5GwbwrTv1dEYIm4WLaQYQy8" ||  // 王芳-南寨砭路-美满国际
  // "oGwbL5O_FBTl9622gKF8ZraYSiPA" ||  // 杨杰-石佛沟
  // "oGwbL5JC9krtEg5xFoE2NKhSC6EM" ||  // 王改艳-长青路地税局旁-玉龙华庭明超家纺
  // "oGwbL5IK2UOKstbro8T-kobFD_nk" ||  // 高秀-马家湾红化宝园小区吉美超市对面鲜奶吧
  // "oGwbL5DzItCwSPJVrQcGYfDdu3JA" ||  // 薛琴飞-农科所便民市场
  // "oGwbL5NmSSOjstaypdPehL0-XUio" ||  // 苗艳-慧泽路-宝塔区宝园小区
  "";
const envObj: Record<EnvVersion, Environment> = {
  ...(!_OPENID ?
    { develop: { envId: "cloud1-8gfby1gac203c61c", alias: "cloud1", envVersion: "develop", envReal: "develop", version: "" }, } :
    { develop: { envId: "production-8g1eglqz3d606693", alias: "production", envVersion: "release", envReal: "develop", version: "", OPENID: _OPENID }, }
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
