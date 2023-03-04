import Taro, { useRouter } from "@tarojs/taro";
import { View, Picker } from "@tarojs/components";
import { format } from "date-fns";
import { useState } from "react";
import { utils_get_start_end_date, utils_open_excle } from "../utils/utils";
import { Api_regiment_collections_getCollectionExcel } from "../api/regiment__collections";
// 组件
import ComCollectionRecord from "../components/ComCollectionRecord";
import ComNav from "../components/ComNav";
import ComNavBar from "../components/ComNavBar";
import ComAAPage from "../components/ComAAPage";
import { useHook_selfInfo_show } from '../utils/useHooks';

definePageConfig({ navigationStyle: "custom", disableScroll: true, });

const Index_admin_collection_record = () => {
  const [selfInfo_S] = useHook_selfInfo_show({});
  const router = useRouter<{ OPENID?: string; regiment_name: string; }>();
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  return (
    <ComAAPage selfInfo_S={selfInfo_S}>
      <ComNav className='bccback' isHeight isSticky>
        <ComNavBar className='prl10' title='对账单(超管)'></ComNavBar>
        <View className='mrl10 prl10 pbt4 dbtc'>
          <View className='pbt6'>{router.params.regiment_name}(团长)</View>
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
                  OPENID: router.params?.OPENID!,
                  firstDateOfMonth: dateRes.firstDateOfMonth,
                  lastDateOfMonth: dateRes.lastDateOfMonth,
                });
                await utils_open_excle(excelRes, router.params.regiment_name, format(new Date(e.detail.value), "yyyy年MM月"));
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
      {router.params && router.params.OPENID &&
        <ComCollectionRecord OPENID={router.params.OPENID}></ComCollectionRecord>}
    </ComAAPage>
  );
};
export default Index_admin_collection_record;
