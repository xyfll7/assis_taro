import Taro, { useLoad } from "@tarojs/taro";
import classNames from "classnames";
import { Input, PageContainer, View } from "@tarojs/components";
import { FC, useState } from "react";
import ComLoading from "./ComLoading";
import { Api_logistics_bindAccount, Api_logistics_getAllDelivery } from "../api/a__logistics";
import { utils_validate_bind_account } from "../utils/utils";
import { useHook_selfInfo_show } from "../utils/useHooks";

const ComLogisticsBindAccount: FC<{ show: boolean; onAfterLeave: () => void; }> = ({ show, onAfterLeave }) => {
  const [selfInfo_S, setSelfInfo_S] = useHook_selfInfo_show({});
  const [logisticsForm, setLogisticsForm] = useState<Logistics_Account>({
    selected: false,
    type: "bind",
    bizId: "",
    password: "",
    // bizId: "7160009010",
    // password: "VAfijRM38KIUDPE47gTaFrHXk9dbhc", // cSpell: ignore Afij KIUDPE dbhc
    // bizId: "J00862837174",
    // password: "Yangqi77",
    deliveryId: "",
    deliveryName: "",
  });
  const [delivery_list, setDelivery_list] = useState<Logistics_Delivery[] | null>(null);
  useLoad(async () => {
    const res = await Api_logistics_getAllDelivery();
    setDelivery_list(res);
  });

  return (
    <PageContainer show={show} round onAfterLeave={() => show && onAfterLeave()} customStyle='max-height:80vh;min-height:70vh;'>
      <View>
        <View className='m10 prl10 pbt6 o10 bccwhite'>
          <View className='dy pbt6'>
            <View className='nw'>客户编码：</View>
            <Input placeholder='输入客户编码' value={logisticsForm.bizId} onInput={(e) => setLogisticsForm({ ...logisticsForm, bizId: e.detail.value })}></Input>{" "}
          </View>
          <View className='dy pbt6'>
            <View className='nw'>客户密钥：</View>
            <Input placeholder='输入客户密钥' value={logisticsForm.password} onInput={(e) => setLogisticsForm({ ...logisticsForm, password: e.detail.value })} password></Input>{" "}
          </View>
        </View>
        {delivery_list === null && <ComLoading></ComLoading>}
        {delivery_list && (
          <View className='m10 o10 pbt6 bccwhite ds dwp'>
            {delivery_list
              ?.sort((o, i) => (o.deliveryName.length < i.deliveryName.length ? -1 : 0))
              .map((e) => (
                <View
                  className={classNames("prl10 pbt6 oo ", { bccyellow: logisticsForm.deliveryId == e.deliveryId })}
                  key={e.deliveryId}
                  onClick={() => {
                    setLogisticsForm({ ...logisticsForm, deliveryId: e.deliveryId, deliveryName: e.deliveryName });
                  }}>
                  <View>{e.deliveryName}</View>
                </View>
              ))}
          </View>
        )}
        <View className='dxy mt10'>
          <View
            className='prl10 pbt6 oo bccyellow'
            hoverClass='bccyellowtab'
            onClick={async () => {
              if (utils_validate_bind_account(logisticsForm)) {
                try {
                  // 第一次添加面单账号设为默认面单账号
                  if (selfInfo_S?.logistics?.length === 0) {
                    logisticsForm.selected = true;
                  }

                  Taro.showLoading();
                  const res = await Api_logistics_bindAccount({
                    ...selfInfo_S!,
                    logistics: [...(selfInfo_S?.logistics ?? []), logisticsForm],
                  }, logisticsForm);
                  setSelfInfo_S(res);
                  onAfterLeave();
                  Taro.showToast({ title: "账号绑定成功", icon: "none" });
                } catch (err: any) {
                  if (err?.err?.errCode === 9300529) {
                    Taro.showToast({ title: "该账号已绑定，请换个账号试试", icon: "none" });
                  }
                  if (err?.err?.errCode === 9300531) {
                    Taro.showToast({ title: "密码错误", icon: "none" });
                  }
                }
              }
            }}>
            绑定账号
          </View>
        </View>
      </View>
    </PageContainer>
  );
};
export default ComLogisticsBindAccount;
