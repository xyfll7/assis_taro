import { View, Input, Textarea, Button, Label } from "@tarojs/components";
import Taro from "@tarojs/taro";
import classNames from "classnames";
import { Dispatch, FC, useEffect, useState } from "react";
import { utils_validate_register } from "../utils/utils";
import { Api_tasks_getPhoneNumber } from "../api/a__tasks";
import { useHook_selfInfo_show } from "../utils/useHooks";
import { Api_users_getUserInfo, Api_users_updateUserInfo } from "../api/user__users";
// 组件
import ComNav from "../components/ComNav";
import ComNavBar from "../components/ComNavBar";
import ComAAPage from '../components/ComAAPage';
import ComLoading from '../components/ComLoading';
import ComFooter from '../components/ComFooter';
import ComAvatar from '../components/ComAvatar';

definePageConfig({ disableScroll: true, navigationStyle: "custom" });
const Index_regiment_register = () => {
  const [selfInfo_S, setSelfInfo_S] = useHook_selfInfo_show({});
  const router = Taro.getCurrentInstance().router;
  const _agent = selfInfo_S?.regiment_agent_OPENID ?? router?.params?.agent_OPENID;
  const [agentInfo, setAgentInfo] = useState<BaseUserInfo | null>(null);
  useEffect(() => {
    if (_agent) {
      (async () => {
        const res = await Api_users_getUserInfo(_agent);
        setAgentInfo(res);
      })();
    }
  }, [_agent]);
  return (
    <ComAAPage selfInfo_S={_agent ? selfInfo_S : null}>
      {_agent && selfInfo_S &&
        <ComNav>
          <ComNavBar className='prl10' title={selfInfo_S?.regiment_is === 0 || selfInfo_S?.regiment_is ? '团长信息' : '注册团长'}></ComNavBar>
        </ComNav>
      }
      <View>
        {_agent && selfInfo_S &&
          <Register selfInfo_S={selfInfo_S} setSelfInfo_S={setSelfInfo_S}></Register>
        }
        {_agent && selfInfo_S && selfInfo_S.regiment_is == 1 &&
          <View className='dxyl mt5vh'>
            <View className='cccplh'>{selfInfo_S.name} 您好</View>
            <View className='cccplh'>您已经是团长了</View>
            <View className='cccplh'>您可随时修改以上信息</View>
          </View>
        }
        {_agent && selfInfo_S && selfInfo_S.regiment_is == 0 &&
          <View className='dxyl mt5vh'>
            <View className='cccplh'>您的团长申请已提交</View>
            <View className='cccplh'>请耐心等待管理员审核</View>
            <View className='cccplh'>您可随时修改以上信息</View>
          </View>
        }
        {agentInfo === null && <ComLoading className='mt10'></ComLoading>}
        {agentInfo && <View className='dcl mt10' >
          <View>上级代理：{agentInfo.agent_name} {agentInfo.name}</View>
          <View className='dy'>联系电话：<View className='cccgreen' onClick={() => {
            agentInfo.phone && Taro.makePhoneCall({ phoneNumber: agentInfo.phone! });
          }}>{agentInfo.phone}</View> </View>
          <View className='tac fs07 www70 mt4 cccplh'>联系地址：{agentInfo.location_name}</View>
        </View>
        }
        <ComFooter></ComFooter>
      </View>
    </ComAAPage>
  );
};
export default Index_regiment_register;

const Register: FC<{ selfInfo_S: BaseUserInfo | null, setSelfInfo_S: Dispatch<BaseUserInfo | null>; }> =
  ({ selfInfo_S, setSelfInfo_S }) => {
    const router = Taro.getCurrentInstance().router;
    const [userForm, setUserForm] = useState<BaseUserInfo>({
      regiment_is: selfInfo_S?.regiment_is ?? 0,
      regiment_agent_OPENID: selfInfo_S?.regiment_agent_OPENID ?? router?.params?.agent_OPENID,
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
    function ___uploadAvatarImage() {
      if (!utils_validate_register(userForm)) {
        return;
      }
      Taro.chooseMedia({
        count: 1,
        mediaType: ["image"],
        sizeType: ["compressed"],
        success: (res0) => {
          if (res0.errMsg === "chooseMedia:ok") {
            Taro.showLoading({ title: "上传中..." });
            Taro.cloud.uploadFile({
              cloudPath: `${selfInfo_S?.OPENID}/regiment_avatar`,
              filePath: res0.tempFiles[0].tempFilePath,
              success: async (res1) => {
                if (res1.errMsg === "cloud.uploadFile:ok") {
                  const res = await Api_users_updateUserInfo({
                    ...userForm,
                    avatar: res1.fileID
                  });
                  setSelfInfo_S({ ...res });
                  Taro.showToast({ title: "上传成功", icon: "none" });
                } else {
                  Taro.showToast({ title: "上传失败，请重试", icon: "none" });
                }
              },
              fail: () => { Taro.showToast({ title: "上传失败，请重试", icon: "none" }); }
            });
          }

        },
        fail: () => Taro.showToast({ title: "取消上传", icon: "none" })
      });
    }
    return (
      <>
        {/* 表单 */}
        <View className='o10 bccwhite '>
          {/* 姓名 */}
          <View className='dbtc prl10 pbt4'>
            <View className='dy'>
              <View className='w4rem'>姓名</View>
              <Input
                value={userForm.name}
                onInput={(e) => setUserForm({ ...userForm, name: e.detail.value })}
                placeholder='请输入姓名'></Input>
            </View>
            {selfInfo_S?.avatar && <ComAvatar className='bccprice' isSelf src={selfInfo_S.avatar} timestamp={String(selfInfo_S.timestamp_update)} onClick={() => {
              ___uploadAvatarImage();
            }}></ComAvatar>}
            {!selfInfo_S?.avatar &&
              <View className='pbt6 cccgreen pl10 oo' hoverClass='bccbacktab' onClick={() => {
                ___uploadAvatarImage();
              }}>上传头像</View>
            }
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
        <View className='dxy mt4vh'>
          <View
            className='bccgreen prl10 pbt6 oo cccwhite'
            hoverClass='bccgreentab'
            onClick={async () => {
              if (utils_validate_register(userForm)) {
                Taro.showLoading({ title: "提交中..." });
                const res = await Api_users_updateUserInfo({
                  ...userForm,
                  print_direct_regiment: true
                });
                setSelfInfo_S(res);
                Taro.showToast({ title: "提交成功", icon: "none" });
              }
            }}>
            {selfInfo_S?.regiment_is === 0 || selfInfo_S?.regiment_is === 1 ?
              '修改' : '申请团长'
            }
          </View>
        </View>
      </>
    );
  };
