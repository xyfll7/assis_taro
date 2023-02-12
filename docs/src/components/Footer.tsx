import { FC } from "react";

export const Footer: FC<{ onClick: () => void; isDark: boolean; }> = ({ onClick, isDark }) => {
  return <div className="drl mt10 fs06 fixed-bottom-right  nw " >
    <img src="/logo.svg" style={{ width: "40px", height: "40px" }} alt="Vite logo" />
    <div className='cursor ' onClick={() => { onClick(); }}>主题色： {isDark ? '深色' : '浅色'}</div>
    <div>本域名主要用于接口数据服务</div>
    <div> Copyright © 2013-2022 XiaoXiang. All Rights Reserved. 小象心选 版权所有 </div>
    <a className="cccgreen" href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">陕ICP备2022014426号-1</a>
  </div>;
};
