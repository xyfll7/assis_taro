import { format } from "date-fns";
import { PageContainer, ScrollView, View } from "@tarojs/components";
import { useReachBottom } from "@tarojs/taro";
import { FC, useEffect, useState } from "react";
import { Api_regiment_collections_getCollectionHistoryList, Api_regiment_collections_getCollectionList } from "../api/regiment__collections";

import ComLoading from "../components/ComLoading";
import ComNoMore from "../components/ComNoMore";
import { utils_get_timestamp } from "../utils/utils";


const ComCollectionRecord: FC<{ OPENID: string; }> = ({ OPENID }) => {
  const [collectionHistory, setCollectionHistory] = useState<any[] | null>(null);
  const [collectionRecord, setCollectionRecord] = useState<any[] | null>(null);
  const [collectionRecordOneDay, setCollectionRecordOneDay] = useState<Product_Express[] | null>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    (async () => {
      const res1 = await Api_regiment_collections_getCollectionHistoryList({
        timestamp: Date.now(),
        OPENID: OPENID
      });
      setCollectionHistory(res1);
      const res = await Api_regiment_collections_getCollectionList({
        OPENID: OPENID,
        timestamp: utils_get_timestamp(0)
      });
      setCollectionRecord(res);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [isLoadMore, setIsLoadMore] = useState<boolean | null>(false);
  useReachBottom(async () => {
    if (isLoadMore === null) {
      return;
    }
    if (collectionHistory) {
      setIsLoadMore(true);
      const res1 = await Api_regiment_collections_getCollectionHistoryList({
        timestamp: collectionHistory.slice(-1)[0]._id - 86400000,
        OPENID: OPENID
      });
      setCollectionHistory([...collectionHistory, ...res1]);
      setIsLoadMore(false);
    }
  });
  return (
    <>
      {(collectionHistory === null || collectionRecord === null) && <ComLoading></ComLoading>}
      {
        (collectionHistory !== null && collectionRecord !== null) && <>
          <TodayCollectionRecord collectionRecord={collectionRecord} collectionHistory={collectionHistory}></TodayCollectionRecord>
          <HistoryCollectionRecord OPENID={OPENID} setCollectionRecordOneDay={setCollectionRecordOneDay} setShow={setShow} collectionHistory={collectionHistory}></HistoryCollectionRecord>
          {collectionHistory?.length !== 0 && <ComNoMore isLoadMore={isLoadMore}></ComNoMore>}
          <View className='hhh15'></View>
        </>
      }
      <PageContainer show={show} onLeave={() => { setShow(false); }} round>
        <ScrollView className=' hhh70 ' scrollY>
          <View className='mrl10 prl10'>
            {collectionRecordOneDay && <View className='dxy pbt10 sticky-top bccwhite'>{format(new Date(collectionRecordOneDay[0].timestamp_pay_callback!), "MM月dd日")}明细</View>}
            {collectionRecordOneDay?.map(e => {
              return <View className='o10 lit' key={e._id}>
                <View className='dbtc pbt10'>
                  <View className='dy'>
                    <View>{e.deliveryName}</View>
                    <View className='ml10 cccplh'>{format(new Date(e.timestamp_pay_callback!), "MM月dd日 HH:mm")}</View>
                  </View>
                  <View className='fwb'>+ {(e.totalFee! / 100).toFixed(2)}</View>
                </View>
              </View>;
            })}
            <View className='hhh10'></View>
          </View>
        </ScrollView>
      </PageContainer>
    </>
  );
};
export default ComCollectionRecord;

const TodayCollectionRecord: FC<{
  collectionHistory: any[] | null;
  collectionRecord: Product_Express[] | null;
}> = ({ collectionHistory, collectionRecord }) => {
  return (
    <>
      <View className='mt10 mrl10 prl10 cccplh mb10'>今天</View>
      <View className='mrl10 prl10  o10 bccwhite'>
        <View className='pbt10'>
          <View className='fwb'> {collectionHistory && `￥${collectionHistory[0].countTotalFee / 100}`}  </View>
          <View className='cccplh'>{collectionHistory && `收款${collectionHistory[0].count}笔`}</View>
        </View>
        {collectionRecord !== null && (
          <View>
            {collectionRecord?.map((e) => {
              return (
                <View className='o10 lit' key={e._id}>
                  <View className='dbtc pbt10'>
                    <View className='dy'>
                      <View>{e.deliveryName}</View>
                      <View className='ml10 cccplh'>{format(new Date(e.timestamp_pay_callback!), "MM月dd日 hh:mm")}</View>
                    </View>
                    <View className='fwb'>+ {(e.totalFee! / 100).toFixed(2)}</View>
                  </View>
                </View>
              );
            })}
            {collectionHistory && collectionHistory[0].count > collectionRecord.length &&
              <View className='dxy pbt4 lit cccplh'>
                <View className='prl10 oo pbt6' hoverClass='bccbacktab'>查看更多</View>
              </View>
            }
          </View>
        )}
      </View>
    </>
  );
};

const HistoryCollectionRecord: FC<{
  OPENID: string;
  collectionHistory: any[] | null;
  setCollectionRecordOneDay: React.Dispatch<React.SetStateAction<any[] | null>>;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ collectionHistory, setShow, OPENID, setCollectionRecordOneDay }) => {
  return (
    <>
      {collectionHistory?.slice(1).map((e) => {
        return (
          <View className='mrl10 ' key={e._id}>
            <View className='mt10  prl10 cccplh'>{format(new Date(e._id), "MM月dd日")}</View>
            <View className='prl10 mt10 pbt10 bccwhite o10 dbtc' hoverClass='bccbacktab'>
              <View>
                <View className='fwb'> ￥{e.countTotalFee / 100} </View>
                <View className='cccplh'>收款{e.count}笔</View>
              </View>
              <View className='cccgreen' onClick={async () => {
                setShow(true);
                const res = await Api_regiment_collections_getCollectionList({
                  OPENID: OPENID,
                  timestamp: e._id
                });
                setCollectionRecordOneDay(res);
              }}>查看明细</View>
            </View>
          </View>
        );
      })}
    </>
  );
};
