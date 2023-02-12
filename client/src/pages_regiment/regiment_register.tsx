import { View, Input, Textarea, Button, Label } from "@tarojs/components";
import Taro from "@tarojs/taro";
import classNames from "classnames";
import { Dispatch, FC, useEffect, useState } from "react";
import { utils_validate_register } from "../utils/utils";
import { Api_tasks_getPhoneNumber } from "../api/a__tasks";
import { useHook_selfInfo_show } from "../utils/useHooks";
import { Api_users_updateUserInfo } from "../api/user__users";

definePageConfig({ navigationBarTitleText: "注册团长", disableScroll: true });
const Index_regiment_register = () => {
  const [selfInfo_S, setSelfInfo_S] = useHook_selfInfo_show({});

  return (
    <>
      {selfInfo_S && selfInfo_S.regiment_is == 1 &&
        <View className='dxyl mt10vh'>
          <View className='cccplh'>{selfInfo_S.name} 您好</View>
          <View className='cccplh'>您已经是团长了</View>
        </View>
      }
      {selfInfo_S && selfInfo_S.regiment_is == 0 &&
        <View className='dxyl mt10vh'>
          <View className='cccplh'>您的团长申请已提交</View>
          <View className='cccplh'>请耐心等待管理员审核</View>
        </View>}
      {selfInfo_S && selfInfo_S.regiment_is == undefined &&
        <Register selfInfo_S={selfInfo_S} setSelfInfo_S={setSelfInfo_S}></Register>}
    </>
  );
};
export default Index_regiment_register;

const Register: FC<{ selfInfo_S: BaseUserInfo | null, setSelfInfo_S: Dispatch<BaseUserInfo | null>; }> =
  ({ selfInfo_S, setSelfInfo_S }) => {
    const [userForm, setUserForm] = useState<BaseUserInfo>({
      regiment_is: 0
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => setUserForm({ ...selfInfo_S, ...userForm }), [selfInfo_S]);
    function onChooseLocation() {
      Taro.chooseLocation({
        success: (e) =>
          setUserForm({
            ...userForm,
            location_name: `${e.address}-${e.name}`,
            location: { type: "Point", coordinates: [e.longitude, e.latitude] },
          }),
      });
    }
    return (
      <>
        {/* 表单 */}
        <View className='m10  o10 bccwhite '>
          {/* 姓名 */}
          <View className='dy p10'>
            <View className='w4rem'>姓名</View>
            <Input
              value={userForm.name}
              onInput={(e) => setUserForm({ ...userForm, name: e.detail.value })}
              placeholder='请输入姓名'></Input>
          </View>
          <View className='line'></View>
          {/* 电话 */}
          <Label className='dy p10' for='getPhoneNumber'>
            <View className='w4rem'>手机号</View>
            <View className={classNames("fwb", { cccplh: !userForm.phone })}>
              {userForm.phone ?? "请授权手机号"}
            </View>
            <Button
              style='display: none;'
              id='getPhoneNumber'
              open-type='getPhoneNumber'
              onGetPhoneNumber={async (e) => {
                Taro.showLoading({ title: "获取手机号..." });
                const { code, errMsg } = e.detail;
                if (code && errMsg === "getPhoneNumber:ok") {
                  const res = await Api_tasks_getPhoneNumber({ code });
                  setUserForm({ ...userForm, phone: res });
                } else if (errMsg === "getPhoneNumber:fail user deny") {
                  Taro.showToast({ title: "授权失败，请重试", icon: "none" });
                }
                Taro.hideLoading();
              }}>
              请授权手机号
            </Button>
          </Label>
          <View className='line'></View>
          {/* 地址 */}
          <View className='dy p10'>
            <View className='w4rem' onClick={() => onChooseLocation()}>
              地址
            </View>
            <Textarea
              className='ww'
              style='max-height:5rem;'
              disableDefaultPadding
              autoHeight
              value={userForm.location_name}
              placeholder='请选择地址'
              disabled={!userForm.location_name}
              onInput={(e) =>
                setUserForm({ ...userForm, location_name: e.detail.value })
              }
              onClick={() => !userForm.location_name && onChooseLocation()} />
            {userForm.location_name && (
              <View
                className='pl10 nw cccplh'
                onClick={() => onChooseLocation()}>
                选择
              </View>
            )}
          </View>
        </View>
        {/* 申请按钮 */}
        <View className='dxy'>
          <View
            className='bccgreen prl10 pbt6 oo cccwhite'
            hoverClass='bccgreentab'
            onClick={async () => {
              if (utils_validate_register(userForm)) {
                const res = await Api_users_updateUserInfo({
                  ...userForm,
                  print_direct_regiment: true
                });
                setSelfInfo_S(res);
              }
            }}>
            申请团长
          </View>
        </View>
      </>
    );
  };
