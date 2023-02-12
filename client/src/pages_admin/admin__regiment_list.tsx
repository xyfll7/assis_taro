import { View, Navigator, PageContainer, ScrollView, Picker } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import { FC, useState } from "react";
import { format, subDays } from "date-fns";
import { utils_get_time_limit } from '../utils/utils';
import { Api_logistics_getQuota } from "../api/a__logistics";
import { Api_users_updateUserInfo } from "../api/user__users";
import { Api_admin_price_getPriceSchemeList, Api_admin_users_getRegimentList, } from "../api/admin__db";
import ComEmpty from "../components/ComEmpty";
import ComNavBar from "../components/ComNavBar";
import ComNav from "../components/ComNav";
import ComHeaderBar from "../components/ComHeaderBar";
import ComLoading from "../components/ComLoading";

definePageConfig({ navigationStyle: "custom" });
const Index_admin__regiment_list = () => {
  const [regimentList, setRegimentList] = useState<BaseUserInfo[] | null>(null);
  useLoad(async () => {
    const res0 = await Api_admin_users_getRegimentList();
    setRegimentList(res0);
  });

  return (
    <>
      <ComNav className='bccback' isHeight isSticky>
        <ComNavBar className='prl10' title='团长管理(超管)'></ComNavBar>
      </ComNav>
      <RegimentListINCOM regimentList={regimentList}
        onClick_setRegimentList={(param) => {
          setRegimentList(regimentList!.map((e) => e._id === param._id ? param : e));
        }
        }></RegimentListINCOM>
    </>
  );
};
export default Index_admin__regiment_list;

const RegimentListINCOM: FC<{
  regimentList: BaseUserInfo[] | null;
  onClick_setRegimentList: (param: BaseUserInfo) => void;
}> = ({ regimentList, onClick_setRegimentList }) => {
  const [regiment, setRegiment] = useState<BaseUserInfo | null>(null);
  return <>
    <PageContainer show={Boolean(regiment)} onAfterLeave={() => setRegiment(null)} round >
      <PriceSchemeListINCOM regiment={regiment} onClick_close={() => setRegiment(null)} onClick_setRegimentList={(param) => {
        onClick_setRegimentList(param);
        setRegiment(null);
      }}></PriceSchemeListINCOM>
    </PageContainer>
    <View className='mrl10'>
      {regimentList === null && <ComLoading></ComLoading>}
      {regimentList?.length === 0 && <ComEmpty msg='团长列表为空'></ComEmpty>}
      {regimentList?.map((e) => {
        return (
          <View key={e._id} className='mt10  prl10 pt10 o10 bccwhite'>
            <View className=''>{e.name} {e.regiment_price_scheme?.name}</View>
            <View className='cccplh pb10 '>{e.location_name}</View>
            <View className='dr'>
              <RegimentReconciliationINCOM regiment={e}
                onClick_setRegiment={() => setRegiment(e)}
                onClick_setRegimentList={(ee) => { onClick_setRegimentList(ee); }}></RegimentReconciliationINCOM>
              <RegimentApprovedINCOM regiment={e} onClick_setRegimentList={(param) => {
                onClick_setRegimentList(param);
              }}></RegimentApprovedINCOM>
            </View>
          </View>
        );
      })}
    </View>
  </>;
};

const RegimentReconciliationINCOM: FC<{
  regiment: BaseUserInfo;
  onClick_setRegiment: () => void;
  onClick_setRegimentList: (param: BaseUserInfo) => void;
}> = ({ regiment, onClick_setRegiment, onClick_setRegimentList }) => {
  const [logistics, setLogistics] = useState<Logistics_Account[] | null>(null);
  const [date, setDate] = useState<string>(format(subDays(new Date(), 0), "yyyy-MM-dd"));
  const [time, setTime] = useState<string>("14:30:00");
  return (
    <>
      {regiment.regiment_is === 1 ? (
        <View className='ww'>
          <View className='dr'>
            <View className='pbt4 dy'>
              {regiment.logistics && (
                <View
                  className='cccgreen pbt6 pl10 oo '
                  hoverClass='bccbacktab'
                  onClick={async () => {
                    Taro.showLoading({ title: "查询中...", mask: true });
                    let arr: Logistics_Account[] = [];
                    for (let item of regiment.logistics!) {
                      const res = await Api_logistics_getQuota(item);
                      arr.push({
                        ...item,
                        number: res,
                      });
                    }
                    setLogistics(arr);
                    Taro.hideLoading();
                  }}>
                  面单量
                </View>
              )}
              <Navigator className='cccgreen pbt6 pl10 oo' hoverClass='bccbacktab' url='~' onClick={() => onClick_setRegiment()}>
                价格方案
              </Navigator>
              <Navigator className='cccgreen pbt6 pl10 oo' hoverClass='bccbacktab' url={`/pages_admin/admin__collection_record?OPENID=${regiment.OPENID}&regiment_name=${regiment.name}`}>
                对账单
              </Navigator>
            </View>
          </View>
          <View className='pbt4 dbtc'>
            <View className='dy'>
              <Picker className='bccback o10 pbt4 prl4 mr6' mode='date' value={date}
                start={format(subDays(new Date(), 0), "yyyy-MM-dd")}
                end={format(subDays(new Date(), -2), "yyyy-MM-dd")}
                onChange={(e) => { setDate(e.detail.value); }} >
                <View> {format(new Date(date), 'yy年MM月dd日')} </View >
              </Picker>
              <Picker className='bccback o10 pbt4 prl4' mode='time' value={time}
                onChange={(e) => { setTime(`${e.detail.value}:00`); }} >
                {format(new Date(`${date} ${time}`), "HH:mm")}
              </Picker>
            </View>
            <View className='pl10 pbt6 oo cccgreen' hoverClass='bccbacktab' onClick={async () => {
              console.log(`${date} ${time}`);
              Taro.showLoading({ title: "更新中...", mask: true });
              const res0 = await Api_users_updateUserInfo({
                ...regiment,
                print_time_limit: {
                  limit_time: `${date} ${time}`,
                  notice: "为避免揽件超时，当前仅可下单收款"
                }
              });
              onClick_setRegimentList(res0);
              Taro.showToast({ title: "设置成功", icon: "none" });
            }}>指定下次打印时间</View>
          </View>
          {
            regiment.print_time_limit &&
            regiment.print_time_limit.limit_time &&
            <View>
              {utils_get_time_limit(regiment?.print_time_limit?.limit_time) &&
                <View className='pbt4 cccplh dbtc'>
                  <View className='dy'>
                    <View className='cccprice mr4'>{utils_get_time_limit(regiment?.print_time_limit?.limit_time)}</View> 后可打印
                  </View>
                  <View className='pbt6 pl10 cccgreen' onClick={async () => {
                    Taro.showLoading({ title: "取消中...", mask: true });
                    const res0 = await Api_users_updateUserInfo({
                      ...regiment,
                      print_time_limit: null
                    });
                    onClick_setRegimentList(res0);
                    Taro.showToast({ title: "取消成功", icon: "none" });
                  }}>取消打印限制</View>
                </View>
              }
              <View className='pb10 dy'>
                <View className='cccplh'>上次指定时间</View>
                <View className='mrl6 cccplh'>{format(new Date(regiment.print_time_limit!.limit_time!), "yy年MM月dd日 HH:mm")}</View>
                {new Date(regiment.print_time_limit.limit_time).getTime() > new Date().getTime() ? <View >生效中</View> : <View className='cccprice'>已失效</View>}
              </View>

            </View>

          }

          <View>
            {logistics &&
              logistics.map((e) => {
                return (
                  <View className='dbtc ww pb10' key={e.bizId}>
                    <View>{e.deliveryName}</View>
                    <View>{e.number}</View>
                  </View>
                );
              })}
          </View>
        </View>
      ) : (
        <View className='pb10'></View>
      )}
    </>
  );
};

const RegimentApprovedINCOM: FC<{
  regiment: BaseUserInfo;
  onClick_setRegimentList: (param: BaseUserInfo) => void;
}> = ({ regiment, onClick_setRegimentList }) => {
  return (
    <>
      {regiment.regiment_is === 0 ? (
        <View className='pbt4'>
          <View
            className='cccgreen pbt6 pl10 oo'
            hoverClass='bccbacktab'
            onClick={async () => {
              Taro.showModal({
                title: "提示",
                content: "确认通过审核？",
                success: (e) => {
                  if (e.confirm) {
                    ___updateRegimentInfo();
                  }
                },
              });

              const ___updateRegimentInfo = async () => {
                Taro.showLoading({ title: "更新中...", mask: true });
                const res = await Api_users_updateUserInfo({
                  ...regiment,
                  regiment_OPENID: regiment.OPENID,
                  regiment_is: 1,
                });
                onClick_setRegimentList(res);
                Taro.hideLoading();
                Taro.showToast({ title: "审核通过", icon: "none" });
              };
            }}>
            审核通过
          </View>
        </View>
      ) : (
        <View className='pb10'></View>
      )}
    </>
  );
};


const PriceSchemeListINCOM: FC<{
  regiment: BaseUserInfo | null;
  onClick_close: () => void;
  onClick_setRegimentList: (param: BaseUserInfo) => void;
}> = ({ regiment, onClick_close, onClick_setRegimentList }) => {
  const [priceSchemeList, setPriceSchemeList] = useState<PriceScheme_Type[] | null>(null);
  useLoad(async () => {
    const res0 = await Api_admin_price_getPriceSchemeList();
    setPriceSchemeList(res0);
  });
  return (
    <ScrollView className='hhh70 ' scrollY>
      <View className='bccback prl10'>
        <ComHeaderBar className='sticky-top bccback' title={`${regiment?.name}`} desc='价格方案' onClick={() => onClick_close()}></ComHeaderBar>
        {priceSchemeList === null && <ComLoading></ComLoading>}
        {priceSchemeList?.length === 0 && <ComEmpty msg='团长列表为空'></ComEmpty>}
        {priceSchemeList?.map(e =>
          <View key={e._id} className='o10 prl10 bccwhite mt10'>
            <View className='pbt6 dbtc'>
              <View>{e.name}</View>
              <View className='dy'>
                {e.scheme === regiment?.regiment_price_scheme?.scheme ?
                  <View className='pbt4 pl10 dy'><View className='cccplh'>(当前执行方案)</View>已选</View> :
                  <View className='pbt4 pl10 oo cccgreen' hoverClass='bccbacktab'
                    onClick={async () => {
                      Taro.showLoading({ title: "更新中...", mask: true });
                      const res1 = await Api_users_updateUserInfo({
                        ...regiment,
                        regiment_price_scheme: e
                      });
                      onClick_setRegimentList(res1);
                      Taro.showToast({ title: "设置成功", icon: "none" });
                    }}>选择</View>
                }
              </View>
            </View>
            <View className='pbt10 lit cccplh'> {e.desc} </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

