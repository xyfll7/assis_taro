import Taro, { useDidShow } from "@tarojs/taro";
import { useEffect, useRef, useState } from "react";
import { Api_users_getRegimentListNearby, Api_users_getSelfInfo, Api_users_updateUserInfo } from "../api/user__users";
import { useSelfInfo } from "../store/SelfInfoProvider";
import { utils_urlToObj, utils_get_time_limit } from "./utils";
import { useOrdersNotice } from '../store/OrdersNoticeProvider';
import { Api_orders_getOrderList } from '../api/user__orders';


export function useHook_selfInfo_show({
  isRefreshSelfInfo_SEveryTime = false,
}: { isRefreshSelfInfo_SEveryTime?: boolean; }): [BaseUserInfo | null, React.Dispatch<BaseUserInfo | null>] {
  const [selfInfo_S, setSelfInfo_S] = useSelfInfo();
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
  return [selfInfo_S, setSelfInfo_S];
}

export function useHook_get_orderList() {
  const [selfInfo_S] = useSelfInfo();
  const [, setOrders_S] = useOrdersNotice();
  useEffect(() => {
    // 普通用户接受订单更新通知
    // 不需要在每次onShow时获取订单通知的时候，只执行一遍订单通知
    const router = Taro.getCurrentInstance().router;
    router?.path === "/pages/index/index" &&
      selfInfo_S &&
      selfInfo_S.regiment_is !== 1 &&
      get_order_list___(selfInfo_S);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selfInfo_S]);
  const get_order_list___ = async (selfInfo: BaseUserInfo) => {
    setOrders_S(null);
    const res = await Api_orders_getOrderList({ self_OPENID: selfInfo.OPENID, payStatus: [0] });
    setOrders_S(res);
  };
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

export function useHook_getTimeLimit(timeStr: string) {
  const [time, setTime] = useState<string | null>("");
  useEffect(() => {
    if (!timeStr) { return; }
    const _timer = setInterval(() => {
      const _time = utils_get_time_limit(timeStr);
      setTime(_time);
      if (!_time) {
        clearInterval(_timer);
      }
    }, 1000);
    return () => clearInterval(_timer);
  }, [timeStr]);
  return time;
}

export function useHook_getLocation() {
  const [locate, setLocate] = useState<Taro.getLocation.SuccessCallbackResult | null>(null);
  useEffect(() => {
    console.log("执行了啊啊")
      ; (async () => {
        try {
          const res = await Taro.getLocation({
            type: 'gcj02',
          });
          setLocate(res);
        } catch (err) {
          if (err instanceof Error) {
            Taro.showToast({ title: err.message, icon: "none" });
          } else if (typeof (err as TaroGeneral.CallbackResult).errMsg === "string") {
            Taro.showToast({ title: "获取位置信息失败，无法为您查找附近的团长", icon: "none", duration: 5000 });
          } else {
            Taro.showToast({ title: "未知错误:Taro.getLocation", icon: "none" });
          }
        }
      })();
  }, []);
  return { locate };
}

export function useHook_getRegimentListNearby(locate: Taro.getLocation.SuccessCallbackResult | null) {
  const [regiment_list, setRegiment_list] = useState<BaseUserInfo[] | null>(null);
  useEffect(() => {
    locate && (async () => {
      try {
        setRegiment_list(await Api_users_getRegimentListNearby(locate));
      } catch (err) {
        if (err instanceof Error) {
          Taro.showToast({ title: `获取附近团长失败：${err.message}`, icon: "none" });
        } else {
          Taro.showToast({ title: `获取附近团长失败：${err} 未知错误`, icon: "none" });
        }
      }
    }
    )();
  }, [locate]);
  return { regiment_list };
}

export function useHook_newVersionChecker(isCheck: boolean = false): [number, () => void] {
  const [newVersion, setNewVersion] = useState<0 | 1 | 2 | 3>(0);
  const updateManager = Taro.getUpdateManager();
  useEffect(() => {
    if (isCheck) {
      updateManager.onCheckForUpdate(() => setNewVersion(1));
      updateManager.onUpdateReady(() => setNewVersion(2));
      updateManager.onUpdateFailed(() => setNewVersion(3));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function applyUpdateNewVersion() {
    updateManager.applyUpdate();
  }
  return [newVersion, applyUpdateNewVersion];
}
