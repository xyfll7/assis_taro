/// <reference types="@tarojs/taro" />
/// <reference path="../../cloud/index.d.ts" />

declare module '*.png';
declare module '*.gif';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.styl';

declare namespace NodeJS {
  interface ProcessEnv {
    TARO_ENV: 'weapp' | 'swan' | 'alipay' | 'h5' | 'rn' | 'tt' | 'quickapp' | 'qq' | 'jd';
  }
}

declare module 'address-parse' {
  interface SmartArea {
    area: string;
    city: string;
    code: string;
    details: string;
    mobile: string;
    name: string;
    phone: string;
    province: string;
    zip_code: string;
  }
  function parse(str: string, all: boolean): [SmartArea];
}
