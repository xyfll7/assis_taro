import Taro, { useDidShow } from "@tarojs/taro";
import { useEffect, useRef, useState } from "react";
import { Api_orders_getOrderList } from "../api/user__orders";
import { useOrdersNotice } from "../store/OrdersNoticeProvider";
import { Api_users_getSelfInfo, Api_users_updateUserInfo } from "../api/user__users";
import { useSelfInfo } from "../store/SelfInfoProvider";
import { utils_urlToObj, utils_get_time_limit } from "./utils";
import { Api_logistics_getQuota } from "../api/a__logistics";


export function useHook_selfInfo_show({
  isOrderNotice = false,
  isGetOrderNoticeOnce = false,
  isRefreshSelfInfo_SEveryTime = false,
}: { isOrderNotice?: boolean; isGetOrderNoticeOnce?: boolean; isRefreshSelfInfo_SEveryTime?: boolean; }): [BaseUserInfo | null, React.Dispatch<BaseUserInfo | null>] {
  const [selfInfo_S, setSelfInfo_S] = useSelfInfo();
  const [, setOrders_S] = useOrdersNotice();
  useDidShow(async () => {
    let _selfInfo: BaseUserInfo;
    if (isRefreshSelfInfo_SEveryTime || !selfInfo_S) {
      _selfInfo = await Api_users_getSelfInfo();
      if (_selfInfo.regiment_replica_is && _selfInfo.regiment_replica_regiment_OPENID === _selfInfo.regiment_OPENID) {
        _selfInfo = {
          ..._selfInfo,
          ..._selfInfo.regiment_info,
          regiment_replica_selfInfo: _selfInfo
        };
      }
      setSelfInfo_S(_selfInfo);
    } else {
      _selfInfo = selfInfo_S;
    }
    isOrderNotice && selfInfo_S && selfInfo_S?.regiment_is !== 1 && get_order_list___(_selfInfo);

    // 更新我的团长
    const router = Taro.getCurrentInstance().router;
    const { R_D } = utils_urlToObj<{ R_D?: string; }>(router?.params?.scene);
    if (
      R_D &&
      !_selfInfo.regiment_replica_is && // 不能是团队成员
      _selfInfo.regiment_OPENID !== R_D && // 用户扫码发现新的团长
      _selfInfo.regiment_is !== 1 // 团长自己的团长只能是自己
    ) {
      const res = await Api_users_updateUserInfo({ ..._selfInfo }, R_D);
      _selfInfo = res;
      setSelfInfo_S(res);
    }
  });
  useEffect(() => {
    // 普通用户接受订单更新通知
    // 不需要在每次onShow时获取订单通知的时候，只执行一遍订单通知
    isGetOrderNoticeOnce && selfInfo_S && selfInfo_S.regiment_is !== 1 && get_order_list___(selfInfo_S);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selfInfo_S]);
  const get_order_list___ = async (selfInfo: BaseUserInfo) => {
    setOrders_S(null);
    const res = await Api_orders_getOrderList({ self_OPENID: selfInfo.OPENID, payStatus: [0] });
    setOrders_S(res);
  };
  return [selfInfo_S, setSelfInfo_S];
}

export function useHook_effect_update(effect: React.EffectCallback, deps?: React.DependencyList | undefined) {
  const didMountRef = useRef(false);
  useEffect(() => {
    if (didMountRef.current) {
      effect();
    } else {
      didMountRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function useHook_getQuota_number(_interval_time: number) {
  const [selfInfo_S] = useSelfInfo();
  useEffect(() => {
    (async () => {
      if (selfInfo_S && selfInfo_S?.regiment_is === 1 && selfInfo_S.logistics) {
        const _time = Taro.getStorageSync("QUOTA_NUMBER") ?? 0;
        if (Date.now() - Number(_time) > _interval_time) {
          Taro.setStorageSync("QUOTA_NUMBER", String(Date.now()));
          let _str = "";
          for (let item of selfInfo_S.logistics) {
            const res = await Api_logistics_getQuota(item);
            _str += `${item.deliveryName} ${res} 个 `;
          }

          Taro.showModal({ title: "面单余额提示", confirmText: "确认", showCancel: false, content: _str });
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selfInfo_S]);
}

export function useHook_getTimeLimit(timeStr: string) {
  const [time, setTime] = useState<string | null>("");
  useEffect(() => {
    const _timer = setInterval(() => {
      const _time = utils_get_time_limit(timeStr);
      setTime(_time);
      if (!_time) {
        clearInterval(_timer);
      }
    });
    return () => clearInterval(_timer);
  });
  return time;
}
