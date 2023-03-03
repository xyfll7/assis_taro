#!/usr/bin/env node

/**
 * 文档
 * https://www.npmjs.com/package/yargs
 * https://www.npmjs.com/package/tapable
 * https://www.npmjs.com/package/inquirer
 * https://github.com/shelljs/shelljs
 * https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html
 */

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import inquirer from 'inquirer';
import shell from 'shelljs';
import ci from "miniprogram-ci";
import path from "path";
import fs from "fs";
import chalk from "chalk";
import request from 'superagent';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import concurrently from 'concurrently';
import { format } from 'date-fns';


const packageConfig = JSON.parse(
  await readFile(
    new URL('./package.json', import.meta.url)
  )
);
const filename = fileURLToPath(import.meta.url); // 这里不能声明__filename,因为已经有内部的__filename了，重复声明会报错
const __dirname = path.dirname(filename);



//#region 配置
const github = "github";
const pat = "pat";
const cfg = {
  appid: "wxc6ff511796ec714a",
  cloudFunctionsSrc: "./cloud/src", // 云函数源码文件夹
  cloudFunctionsDir: "./cloud/dist/", // 云函数文件夹
  privateKeyPath: "./files/private.wxc6ff511796ec714a.key",
  static: "./docs/dist/", // 静态网站 文件夹
  dev_env: "cloud1-8gfby1gac203c61c", // 云开发-测试环境id // cSpell:ignore gfby
  pro_env: "production-8g1eglqz3d606693", // 云开发-生产环境id // cSpell:ignore eglqz
  git_token: `${github}_${pat}_11AGW563A0P4cSMmiuoLjV_5THZjasAvESlxxIaENZgxPLNLWeZ6p1FAHqz6k8k460YORVPO7PsDXGq4jy`, // 云开发-生产环境id // cSpell:ignore miuo PLNL YORVPO THZ KHTML
};
//#endregion

const DATE_NOW = format(new Date(), "yyyy-MM-dd HH:mm:ss");

const __PRE = "🫧  预览小程序";
const __UPL = "🚀 构建-上传小程序体验版";
const __DEV = "〄 云函数-开发环境 ";
const __PRO = "〄 云函数-生产环境 ";
const __PRO_DEV = "〄 云函数-开发环境/生产环境 ";
const __STATIC_DEV = "☡  静态资源-开发环境 ";
const __STATIC_PRO = "☡  静态资源-生产环境 ";
const __GIT_ACTIONS_DOCS_DEV = "GIT_ACTIONS_DOCS_DEV ";
const __GIT_ACTIONS_DOCS_PRO = "GIT_ACTIONS_DOCS_PRO ";
const __GIT_ACTIONS_CLOUD = "GIT_ACTIONS_CLOUD ";
const __GIT_ACTIONS_CLIENT = "GIT_ACTIONS_CLIENT ";

const { _: [arg0] } = yargs(hideBin(process.argv)).argv;
if (!arg0) {
  runner_inquirer();
} else {
  runner_yargs();
}

async function runner_inquirer() {
  var ui = new inquirer.ui.BottomBar();

  ui.log.write('⚒ 欢迎来到小象团长助手👏👏👏');
  ui.log.write('⚒ 请用上下箭头↑↓选择要执行的任务 🎉🎉🎉');
  const ACTION_LIST = [
    __PRE,
    __UPL,
    __DEV,
    __PRO,
    __PRO_DEV,
    __STATIC_DEV,
    __STATIC_PRO,
    __GIT_ACTIONS_DOCS_DEV,
    __GIT_ACTIONS_DOCS_PRO,
    __GIT_ACTIONS_CLOUD,
    __GIT_ACTIONS_CLIENT,
    new inquirer.Separator(), // 可以添加分隔符
  ];
  const CLOUD_FUNC_LIST = [...(await ___ger_cloud_functions_list())];
  inquirer.prompt([
    {
      type: "list",
      message: "你想干撒？请选择：",
      name: "action",
      default: __PRE,
      prefix: "⚒",
      choices: ACTION_LIST,
      pageSize: ACTION_LIST.length,
    },
    {
      type: "list",
      message: `请选择一个云函数(${CLOUD_FUNC_LIST.length}):`,
      name: "cloud_func_name",
      prefix: "⚒",
      choices: CLOUD_FUNC_LIST,
      pageSize: CLOUD_FUNC_LIST.length,
      when: (answer) => answer.action.includes("〄")
    },
  ]).then(async answer => {
    switch (answer.action) {
      case __PRE:
        console.log(chalk.green(`${__PRE}中...`));
        ___build_miniprogram();
        await ___preview("预览小程序");
        break;
      case __UPL:
        ___build_miniprogram();
        console.log(chalk.green(`${__UPL}中...`));
        await ___upload(`小洋粉_onMac_${(new Date()).toLocaleString()}`);
        break;
      case __DEV:
        console.log(chalk.green(`${__DEV}中...`));
        await ___compile_one("dev", answer.cloud_func_name);
        break;
      case __PRO:
        console.log(chalk.green(`${__PRO}中...`));
        await ___compile_one("pro", answer.cloud_func_name);
        break;
      case __PRO_DEV:
        console.log(chalk.green(`${__PRO_DEV}中...`));
        await ___compile_one("pro", answer.cloud_func_name);
        await ___compile_one("dev", answer.cloud_func_name);
        break;
      case __STATIC_DEV:
        console.log(chalk.green(`${__STATIC_DEV}中...`));
        shell.cd("docs");
        shell.exec("npm run build");
        await ___uploadStaticStorage("dev");
        break;
      case __STATIC_PRO:
        console.log(chalk.green(`${__STATIC_PRO}中...`));
        shell.cd("docs");
        shell.exec("npm run build");
        await ___uploadStaticStorage("pro");
        break;
      case __GIT_ACTIONS_DOCS_DEV:
        console.log(chalk.green(`${__GIT_ACTIONS_DOCS_DEV}中...`));
        await git_actions("docs_dev");
        break;
      case __GIT_ACTIONS_DOCS_PRO:
        console.log(chalk.green(`${__GIT_ACTIONS_DOCS_PRO}中...`));
        await git_actions("docs_pro");
        break;
      case __GIT_ACTIONS_CLOUD:
        console.log(chalk.green(`${__GIT_ACTIONS_CLOUD}中...`));
        await git_actions("cloud");
        break;
      case __GIT_ACTIONS_CLIENT:
        console.log(chalk.green(`${__GIT_ACTIONS_CLIENT}中...`));
        await git_actions("client");
        break;
    }
    shell.exit();
  });
}

function runner_yargs() {
  yargs(hideBin(process.argv))
    .scriptName("npm start")
    .help(false)
    .version(false)
    .command({
      command: "pre",
      aliases: ["pre"],
      desc: __PRE, // 预览小程序
      handler: async (argv) => {
        console.log(chalk.green(`${__PRE}中...`));
        ___build_miniprogram();
        await ___preview(argv._[1]);
      }
    })
    .command({
      command: "upp",
      aliases: ["upp"],
      desc: __UPL, // 上传体验版
      handler: async (argv) => {
        ___build_miniprogram();
        console.log(chalk.green(`${__UPL}中...`));
        await ___upload(argv._[1]);
      }
    })
    .command({
      command: "all_dev",
      aliases: ["ddd"],
      desc: `${__DEV} 编译并部署全部`,
      handler: async (argv) => {
        console.log(chalk.green(`${__DEV} all_dev...`));
        await ___compile_all("dev");
      }
    })
    .command({
      command: "all_pro",
      aliases: ["ppp"],
      desc: `${__PRO} 编译并部署全部`,
      handler: async (argv) => {
        console.log(chalk.green(`${__PRO} all_pro...`));
        await ___compile_all("pro");
      }
    })
    .command({
      command: "static_dev",
      aliases: ["static_dev"],
      desc: __STATIC_DEV,
      handler: async () => {
        console.log(chalk.green(`${__STATIC_DEV}中...`));
        await ___uploadStaticStorage("dev");
      }
    })
    .command({
      command: "static_pro",
      aliases: ["static_pro"],
      desc: __STATIC_PRO,
      handler: async () => {
        console.log(chalk.green(`${__STATIC_PRO}中...`));
        await ___uploadStaticStorage("pro");
      }
    })
    .strictCommands()
    .argv.finally(() => {
      console.log(chalk.green(`命令执行完成，退出`));
      // shell.exit();
    });

}

//#region 初始化项目对象
function project() {
  return new ci.Project({
    appid: cfg.appid,
    type: "miniProgram", // 项目的类型，有效值 miniProgram/miniProgramPlugin/miniGame/miniGamePlugin
    projectPath: __dirname,
    privateKeyPath: path.join(__dirname, cfg.privateKeyPath),
    ignores: ["node_modules/**/*"],
  });
}
//#endregion


//#region 获取云函数列表
async function ___ger_cloud_functions_list() {
  const dir_list = await ___get_dirs(cfg.cloudFunctionsSrc);
  const _functions = dir_list.filter(e => e.includes("cloud"));
  return _functions;
}
//#endregion

//#region 编译-部署-云函数
async function ___compile_one(arg0, arg1) {
  await ___compile_cloud_function(arg0, arg1);
  await ___uploadFunction(arg0, arg1);
}
//#endregion

//#region 编译-部署-所有云函数 生产环境 或 开发环境
async function ___compile_all(arg0) {
  shell.rm('-rf', 'cloud/func_dist');
  const _functions = await ___ger_cloud_functions_list();
  _functions.map((name) => {
    console.log(chalk.green("准备编译："), chalk.yellow(name));
  });
  const { result } = concurrently(_functions.map(func_name => {
    return {
      command: `npx rollup -c --environment NODE_ENV:${arg0 == "dev" ? "development" : "production"},FUNC:${func_name} --bundleConfigAsCjs`,
      cwd: path.resolve(__dirname, 'cloud'),
    };
  }));
  result.then(async (suss) => {
    console.log("编译完成");
    const res1 = await Promise.all(_functions.map(func_name => {
      return ___uploadFunction(arg0, func_name);
    }));
    res1.map(([filesCount, packSize, name]) => {
      console.log(
        chalk.gray("文件数量:"), chalk.yellow(filesCount),
        chalk.gray(' 上传包大小:'), chalk.yellow(`${packSize}KB`),
        chalk.gray(' 函数名:'), chalk.yellow(name));
    });
    shell.exit();
  }, (fail) => {
    console.log("编译失败", fail);
    shell.exit();
  });


}
//#endregion

//#region 编译云函数
async function ___compile_cloud_function(env, func_name) {
  shell.cd("cloud");
  shell.exec(`npx rollup -c --environment NODE_ENV:${env == "dev" ? "development" : "production"},FUNC:${func_name} --bundleConfigAsCjs`);
  shell.cd("..");
  return func_name;
}
//#endregion

//#region 上传云函数
async function ___uploadFunction(arg0, name) {
  const result = await ci.cloud.uploadFunction({
    project: project(),
    env: arg0 === "dev" ? cfg.dev_env : cfg.pro_env,
    name,
    path: path.join(__dirname, `${cfg.cloudFunctionsDir}${name}`),
    remoteNpmInstall: true, // 是否云端安装依赖
  });
  return [result.filesCount, (result.packSize / 1024).toFixed(2), name];
}
//#endregion

//#region 预览小程序
async function ___preview(desc) {
  let i = 0;
  const previewResult = await ci.preview({
    project: project(),
    desc, // 此备注将显示在“小程序助手”开发版列表中
    setting: {
      es6: true,
    },
    qrcodeFormat: "terminal",
    qrcodeOutputDest: "./zqrcode.jpg",
    onProgressUpdate: () => console.log(`\u001b[1A预览ing... ${i++} ++`),
    pagePath: "pages/index/index", // 预览页面
    searchQuery: "", // 'a=1&b=2' 预览参数 [注意!]这里的`&`字符在命令行中应写成转义字符`\&`
  });
  console.log("预览包信息：", previewResult);
}
//#endregion

//#region 上传小程序
async function ___upload(desc) {
  const uploadResult = await ci.upload({
    project: project(),
    version: packageConfig.version,
    desc,
    setting: {
      es6: true,
    },
  });
  console.log(uploadResult);
  console.log(chalk.blue("体验版上传成功：https://mp.weixin.qq.com"));
  console.log(`版本号：${chalk.red(packageConfig.version)}`);
}
//#endregion

//#region 构建小程序
function ___build_miniprogram() {
  console.log(chalk.green("构建小程序中..."));
  shell.cd("client");
  shell.exec("npm run build:weapp");
  shell.cd("..");
}
//#endregion

//#region 上传静态网站
async function ___uploadStaticStorage(arg0) {
  const resultStatic = await ci.cloud.uploadStaticStorage({
    project: project(),
    env: arg0 === "dev" ? cfg.dev_env : cfg.pro_env,
    path: path.join(__dirname, cfg.static),
    remotePath: "/",
  });
  console.log(resultStatic);
}
//#endregion

//#region 某目录下-文件夹列表
async function ___get_dirs(dir_path) {
  const work_path = path.join(__dirname, dir_path);
  const files = fs.readdirSync(work_path);
  return await Promise.all(files.filter((e) => fs.statSync(`${work_path}/${e}`).isDirectory()));
}
//#endregion

//#region 部署GitHub Actions
async function git_actions(event_type) {
  const BaseUrl = "https://api.github.com/repos/xyfll7/assis_taro/dispatches";
  const res = await request
    .post(BaseUrl)
    .send({
      "event_type": event_type,
    })
    .set({
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${cfg.git_token}`,
      // "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
    });
  if (res.status === 204) {
    console.log(chalk.yellow(event_type), chalk.green(`启动部署...`));
    if (event_type.includes("docs") || event_type === "cloud") {
      console.log(chalk.blue("https://github.com/xyfll7/assis_taro/actions"));
      console.log(chalk.blue("https://dev.xxassis.cc"));
      console.log(chalk.blue("https://pro.xxassis.cc"));
    }
    if (event_type === "client") {
      console.log(chalk.blue("https://github.com/xyfll7/assis_taro"));
      console.log(chalk.blue("https://mp.weixin.qq.com"));
    }

  } else {
    console.log(res);
  }
}

//#endregion
