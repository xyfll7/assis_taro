import { useState } from 'react';
import { Popover } from 'antd';
import { login } from '../api';

export function MiniprogramLogin() {
  const [imageUrl, setImageUrl] = useState<string | null>("");
  return <div className='fixed-top-right' >
    <Popover placement="bottomRight" title={"请扫码登录"} arrowPointAtCenter content={
      <div className='dxy mbt10'>
        {!imageUrl ? <div className='wwhh15 dxy'><div className='weui-loading '></div></div> : <img className=' wwhh15 o4' src={imageUrl} alt="" />}
      </div>
    } trigger="click">
      <div className='m10 cursor' onClick={async () => {
        setImageUrl(null);
        const res0 = await login();
        setImageUrl(URL.createObjectURL(await res0.blob()));
      }}>
        登录
      </div>
    </Popover>
  </div >;
}
