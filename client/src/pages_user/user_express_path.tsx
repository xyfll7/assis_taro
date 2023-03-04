import { View } from "@tarojs/components";
import { format } from "date-fns";
import classNames from "classnames";
import { useLoad, useRouter, useShareAppMessage } from "@tarojs/taro";
import { useState } from "react";
import { Api_logistics_getPath } from "../api/a__logistics";
import { Api_orders_getOrderExpress } from "../api/user__orders";
import share_logo from "../image/share_logo.jpeg";
// 组件
import ComLoading from "../components/ComLoading";
import ComOrderExpress from "../components/ComOrderExpress";
import ComNav from "../components/ComNav";
import ComNavBar from "../components/ComNavBar";
import ComAAPage from "../components/ComAAPage";
import { useHook_selfInfo_show } from '../utils/useHooks';

definePageConfig({ navigationStyle: "custom", enableShareAppMessage: true, disableScroll: true });

const Index_user_express_path = () => {
  const [selfInfo_S] = useHook_selfInfo_show({});
  useShareAppMessage(res => {
    if (res.from === 'button') {
      return {
        title: `分享给您的快递`,
        path: `/pages_user/user_express_path?express_share_id=${(res?.target as any)?.id}`,
        imageUrl: share_logo,    // * 支持PNG及JPG * 显示图片长宽比是 5:4
      };
    }
    return {
      title: "小象团长助手",
      path: "/pages/index/index",
      imageUrl: share_logo,    // * 支持PNG及JPG * 显示图片长宽比是 5:4
    };
  });
  const router = useRouter<{ express?: string, express_share_id?: string; }>();
  const [express, setExpress] = useState<Product_Express | null>(null);
  const [path, setPath] = useState<Logistics_Path | null>(null);
  useLoad(async () => {
    if (router?.params?.express) {
      const _express = JSON.parse(decodeURIComponent(router.params.express)) as Product_Express;
      setExpress(_express);
      const res = await Api_logistics_getPath(_express);
      setPath(res);
    }
    if (router?.params?.express_share_id) {
      const _express = await Api_orders_getOrderExpress(router?.params?.express_share_id?.trim());
      setExpress(_express);
      const res = await Api_logistics_getPath(_express);
      setPath(res);
    }
  });
  return (
    <ComAAPage selfInfo_S={selfInfo_S}>
      <ComNav className='bccback' isHeight isSticky>
        <ComNavBar className='prl10' title='运单详情'></ComNavBar>
      </ComNav>
      <>
        {express && <ComOrderExpress className=' ' item={express!} isHidePath></ComOrderExpress>}
        {path === null && <ComLoading className='pbt10 mt10'></ComLoading>}
        {path !== null && (
          <>
            <View className='bccwhite prl10 o10'>
              {path.pathItemList?.length === 0 &&
                <ComLoading className='pbt10' isEmpty msg='待揽件'></ComLoading>
              }
              {path.pathItemList.map((e, i) => {
                return (
                  <View key={e.actionTime} className='ds'>
                    <View className='dcl pr10 '>
                      <View className={classNames("bccback", {
                        vbh: i === 0
                      })} style='width:1rpx; height:0.5rem;'></View>
                      <View className='dxy' style='height:1rem;'>
                        <View className='oo bccgreen' style='width:0.5rem;height:0.5rem;'></View>
                      </View>
                      <View className={classNames("bccback hh")} style='width:1rpx;'></View>
                    </View>
                    <View className='pb10'>
                      <View className=''>{e.actionMsg.replace("【", "[").replace("】", "] ")}</View>
                      <View className='cccplh '>{format(new Date(e.actionTime * 1000), "MM/dd HH:mm:ss")}</View>
                    </View>
                  </View>
                );
              })}
            </View>
            <View className='hhh10'></View>
          </>
        )}
      </>
    </ComAAPage>
  );
};
export default Index_user_express_path;
