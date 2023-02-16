import { Input, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { FC, useState } from 'react';
import { utils_validate_express } from '../utils/utils';
import { Api_tasks_getPrice } from '../api/a__tasks';

//#region 重量/价格
const ComWeightPrice: FC<{
  className: string,
  expressForm: Product_Express;
  price: number;
  weight: number;
  onSetPrice: (e: number) => void;
  onSetWeight: (e: number) => void;
}> = ({ onSetPrice, expressForm, className, price, weight, onSetWeight }) => {
  const [focus, setFocus] = useState(false);

  const [forceRefresh, setForceRefresh] = useState(false);
  async function ___getPrice(e: number) {
    if (e !== 0) {
      // 表单验证
      if (utils_validate_express("rec", expressForm.recMan!) && utils_validate_express("send", expressForm.sendMan!)) {
        Taro.showLoading({ title: "获取价格...", mask: true });
        const res = await Api_tasks_getPrice({ ...expressForm, weight: e });
        onSetPrice(res.totalFee ?? 0);
        Taro.hideLoading();
      }
    }
  }


  return (
    <View className={className}>
      <Input
        type='number'
        confirmType='done'
        focus={focus}
        alwaysEmbed
        adjustPosition
        cursorSpacing={100}
        placeholder='重量(单位公斤)'
        value={Number(weight) == 0 ? "" : String(weight)}
        onFocus={() => { setFocus(true); onSetPrice(0); }}
        onBlur={() => { setFocus(false); }}
        onInput={(e) => {
          onSetPrice(0);
          const num = e.detail.value.replace(/[^0-9]/gi, "").replace(/\b(0+)/gi, "");
          onSetWeight(Number(num));
          setForceRefresh(!forceRefresh);
        }}>
      </Input>
      <View className='dy'>
        {Number(weight) !== 0 &&
          <View className='cccgreen pl10 pbt6 oo nw mr10'
            hoverClass='bccbacktab'
            onClick={() => { ___getPrice(Number(weight)); }}>
            获取价格</View>
        }
        <View className='cccprice nw pbt6'>
          价格：{price ? price / 100 : 0} 元
        </View>
      </View>
    </View >
  );
};
//#endregion

export default ComWeightPrice;
