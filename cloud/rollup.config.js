import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import copy from "rollup-plugin-copy";

const isProduction = process.env["NODE_ENV"] === "production";

let Funcs = process.env["FUNC"] ? [process.env["FUNC"]] : [];

if (process.env["FUNC"] === "no") {
  Funcs = [];
}

const banner = `/**
* 作者: 小洋粉
* 邮箱: l.7@qq.com
* 备注: 代码为自动生成，请勿手动编辑
*/`;
const footer = `/* 代码过于优雅，感谢您的阅览~ */`;

export default Funcs.map((cloudFunctionName) => {
  return {
    input: `src/${cloudFunctionName}/index.ts`,
    output: [
      {
        dir: `dist/${cloudFunctionName}`,
        format: "cjs",
        plugins: [isProduction && terser()],
        banner,
        footer,
      },
    ],
    plugins: [
      resolve({ preferBuiltins: true }),
      json(),
      typescript({ include: ["**/*.ts", "../client/**/*.ts"] }),
      commonjs(),
      copy({
        ...(() => {
          let arr = [
            {
              src: `src/${cloudFunctionName}/config.json`,
              dest: `dist/${cloudFunctionName}`,
            },
            {
              src: `src/${cloudFunctionName}/package.json`,
              dest: `dist/${cloudFunctionName}`,
            },
          ];
          switch (cloudFunctionName) {
            case "a__wxpay_cloud":
            case "a__wxpay_callback_sub_cloud":
            case "a__wxpay_callback_sub_cloud_refund":
              return {
                targets: [
                  ...arr,
                  {
                    src: `src/${cloudFunctionName}/apiclient_cert.pem`,
                    dest: `dist/${cloudFunctionName}`,
                  },
                  {
                    src: `src/${cloudFunctionName}/apiclient_key.pem`,
                    dest: `dist/${cloudFunctionName}`,
                  },
                ],
              };
            default:
              return {
                targets: [...arr],
              };
          }
        })(),
      }),
    ],
    external: ["wx-server-sdk", "crypto-js", "@fidm/x509", "superagent", "query-string"],
  };
});
