import { Input, View } from '@tarojs/components';
import { FC, useState } from 'react';

//#region 重量/价格
const ComWeightPrice: FC<{
  className: string,
  expressForm: Product_Express;
  onBlur_getPrice: (e: number) => void;
}> = ({ onBlur_getPrice, expressForm, className }) => {
  const [focus, setFocus] = useState(false);
  const [weight, setWeight] = useState<string>(String(expressForm.weight));
  const [forceRefresh, setForceRefresh] = useState(false);
  return (
    <View className={className}>
      <Input
        type='number'
        confirmType='done'
        cursorSpacing={50}
        focus={focus}
        onFocus={() => setFocus(true)}
        onBlur={() => { setFocus(false); Number(weight) !== 0 && onBlur_getPrice(Number(weight)); }}
        onInput={(e) => {
          console.log(e.detail.value);
          const num = e.detail.value.replace(/[^0-9]/gi, "").replace(/\b(0+)/gi, "");
          setWeight(num);
          setForceRefresh(!forceRefresh);
        }}
        alwaysEmbed
        placeholder='重量(单位公斤)'
        value={Number(weight) == 0 ? "" : String(weight)} ></Input>
      <View className='dy'>
        {!focus ?
          (Number(weight) !== 0 &&
            <View className='cccgreen pl10 pbt6 oo nw mr10'
              hoverClass='bccbacktab'
              onClick={() => { onBlur_getPrice(Number(weight)); }}>
              重新获取价格</View>) :
          (Number(weight) !== 0 && <View className='cccgreen pl10 pbt6 oo nw mr10' hoverClass='bccbacktab'>获取价格</View>)
        }
        <View className='cccprice nw pbt6'>
          价格：{expressForm.totalFee ? expressForm.totalFee / 100 : 0} 元
        </View>
      </View>
    </View >
  );
};
//#endregion

export default ComWeightPrice;
