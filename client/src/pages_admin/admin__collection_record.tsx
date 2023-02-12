import { useRouter } from "@tarojs/taro";
import { View, Picker } from "@tarojs/components";
import { format } from "date-fns";
import { useState } from "react";
import ComCollectionRecord from "../components/ComCollectionRecord";
import ComNav from "../components/ComNav";
import ComNavBar from "../components/ComNavBar";
import { utils_start_end_date, utils_open_excle } from "../utils/utils";
import { Api_regiment_collections_getCollectionExcel } from "../api/regiment__collections";

definePageConfig({ navigationStyle: "custom" });

const Index_admin_collection_record = () => {
  const router = useRouter<{ OPENID?: string; regiment_name: string; }>();
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  return (
    <>
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
              const _date = format(new Date(e.detail.value), "yyyy-MM-dd");
              const dateRes = utils_start_end_date(_date);
              setDate(_date);
              const excelRes = await Api_regiment_collections_getCollectionExcel({
                OPENID: router.params?.OPENID!,
                firstDateOfMonth: dateRes.firstDateOfMonth,
                lastDateOfMonth: dateRes.lastDateOfMonth,
              });
              utils_open_excle(excelRes, `${router.params.regiment_name}-${format(new Date(e.detail.value), "yyyy年MM月")}`);
            }}>
            <View className='pbt6 pl10 cccgreen oo' hoverClass='bccbacktab'>
              下载对账单
            </View>
          </Picker>
        </View>
      </ComNav>
      {router.params && router.params.OPENID && <ComCollectionRecord OPENID={router.params.OPENID}></ComCollectionRecord>}
    </>
  );
};
export default Index_admin_collection_record;
