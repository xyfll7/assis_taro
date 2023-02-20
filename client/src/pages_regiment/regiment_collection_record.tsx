
import Taro from '@tarojs/taro';
import { View, Picker } from "@tarojs/components";
import { useState } from 'react';
import { format } from 'date-fns';
import { useHook_selfInfo_show } from '../utils/useHooks';
import ComCollectionRecord from "../components/ComCollectionRecord";
import ComNav from "../components/ComNav";
import ComNavBar from "../components/ComNavBar";
import { utils_open_excle, utils_get_start_end_date } from '../utils/utils';
import { Api_regiment_collections_getCollectionExcel } from '../api/regiment__collections';

definePageConfig({ navigationBarTitleText: "收款记录", navigationStyle: "custom" });


const Index_regiment_collection_record = () => {
  const [selfInfo_S] = useHook_selfInfo_show({});
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  return (<>
    <ComNav className='bccback' isHeight isSticky>
      <ComNavBar className='prl10' title='收款记录(团长)'></ComNavBar>
      <View className='mrl10 prl10 pbt4 dbtc'>
        <View className='pbt6'>{selfInfo_S?.name}(团长)</View>
        <Picker
          header-text='请选择账单月份'
          value={date}
          end={format(new Date(), "yyyy-MM-dd")}
          mode='date'
          fields='month'
          onChange={async (e) => {
            Taro.showLoading({ title: "下载中...", mask: true });
            const _date = format(new Date(e.detail.value), "yyyy-MM-dd");
            const dateRes = utils_get_start_end_date(_date);
            setDate(_date);
            try {
              const excelRes = await Api_regiment_collections_getCollectionExcel({
                OPENID: selfInfo_S!.OPENID!,
                firstDateOfMonth: dateRes.firstDateOfMonth,
                lastDateOfMonth: dateRes.lastDateOfMonth,
              });
              await utils_open_excle(excelRes, selfInfo_S?.name!, format(new Date(e.detail.value), "yyyy年MM月"));
              Taro.hideLoading();
            } catch (err) {
              Taro.hideLoading();
              if (err instanceof Error) {
                Taro.showToast({ title: err.message, icon: "none" });
              } else {
                Taro.showToast({ title: "未知错误,下载对账单失败", icon: "none" });
              }
            }
          }}>
          <View className='pbt6 pl10 cccgreen oo' hoverClass='bccbacktab'>
            下载对账单
          </View>
        </Picker>
      </View>
    </ComNav>
    {selfInfo_S && selfInfo_S.OPENID &&
      <ComCollectionRecord OPENID={selfInfo_S?.OPENID}></ComCollectionRecord>
    }
  </>
  );
};
export default Index_regiment_collection_record;
