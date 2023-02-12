import { View } from '@tarojs/components';
import { FC } from 'react';

const ComHeaderBar: FC<{ className?: string, title?: string; desc?: string, onClick?: () => void; }> = ({ className, title, desc, onClick }) => {
  return (
    <View className={`${className} pt4 pb10`}>
      <View className='dbtc prl10'>
        <View className='dr  mrl10 pr10 oo pbt6 vbh' hoverClass='bccbacktab' >取消</View>
        <View>{title}</View>
        <View className='dr  ml10 pl10 oo pbt6 cccgreen' hoverClass='bccbacktab' onClick={() => { onClick && onClick(); }}>取消</View>
      </View>
      {desc && <View className='cccplh fs08 dxy'>{desc}</View>}
    </View>
  );
};
export default ComHeaderBar;
