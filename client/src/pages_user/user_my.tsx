import Taro from "@tarojs/taro";
import { useState } from "react";
import { Button, Label, View, Image } from "@tarojs/components";

import { Api_tasks_getPhoneNumber } from "../api/a__tasks";

import { Api_users_updateUserInfo } from "../api/user__users";
import { useHook_selfInfo_show } from "../utils/useHooks";
import { utils_get_qrcode } from "../utils/utils";
// 组件
import ComNav from "../components/ComNav";
import ComNavBar from "../components/ComNavBar";
import ComAvatar from "../components/ComAvatar";
import ComAAPage from "../components/ComAAPage";

definePageConfig({ navigationBarTitleText: "我的", navigationStyle: "custom", disableScroll: true, });

const Index_user_my = () => {
  const [selfInfo_S, setSelfInfo_S] = useHook_selfInfo_show({});
  const [qrCode, setQrCode] = useState<string>("");
  return (
    <ComAAPage>
      <ComNav className='bccback'>
        <ComNavBar className='prl10' title='我的'></ComNavBar>
      </ComNav>
      <View className='dll'>
        <ComAvatar className=''></ComAvatar>
        <View className='pbt4'>
          {selfInfo_S?.phone ? (
            <View className='dy'>
              <View className='pr10'>{selfInfo_S.phone}</View> <View>{selfInfo_S.name}</View>
            </View>
          ) : (
            <Label for='getPhoneNumber'>
              <View className='pbt6 prl10 bccyellow oo' hoverClass='bccyellowtab'>
                授权手机号
              </View>
              <Button
                style='display: none;'
                id='getPhoneNumber'
                open-type='getPhoneNumber'
                onGetPhoneNumber={async (e) => {
                  let _name = "";
                  if (!selfInfo_S?.name) {
                    const res0: Taro.showModal.SuccessCallbackResult & {
                      content?: string;
                    } = await Taro.showModal({
                      title: "请输入姓名",
                      // @ts-ignore
                      editable: true,
                      placeholderText: "请输入姓名",
                    });
                    if (res0.confirm) {
                      _name = res0.content ?? "";
                    } else {
                      Taro.showToast({ title: "取消", icon: "none" });
                      return;
                    }
                  }

                  Taro.showLoading({ title: "获取手机号..." });
                  const { code, errMsg } = e.detail;
                  if (code && errMsg === "getPhoneNumber:ok") {
                    const res0 = await Api_tasks_getPhoneNumber({ code });
                    console.log("phone::", res0);
                    const res1 = await Api_users_updateUserInfo({ ...selfInfo_S, phone: res0, name: _name });
                    setSelfInfo_S(res1);
                  } else if (errMsg === "getPhoneNumber:fail user deny") {
                    Taro.showToast({ title: "授权失败，请重试", icon: "none" });
                  }
                  Taro.hideLoading();
                }}>
                请授权手机号
              </Button>
            </Label>
          )}
        </View>
        {selfInfo_S?.phone && (
          <View className='pbt4'>
            <View
              className='pbt6  pr10 oo'
              hoverClass='bccbacktab'
              onClick={async () => {
                const res = await utils_get_qrcode({ page: "pages/index", scene: `M_D=${selfInfo_S?.OPENID}` });
                setQrCode(res ?? "");
              }}>
              我的小程序码
            </View>
          </View>
        )}
        {qrCode && <View className='pbt10'><Image showMenuByLongpress className='wwwhhh50 o10 ' src={qrCode} ></Image></View>}
      </View>
    </ComAAPage>
  );
};

export default Index_user_my;
