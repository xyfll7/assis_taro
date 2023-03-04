import debounce from "lodash/debounce";
import throttle from "lodash/throttle";
import Taro, { useLoad, useRouter } from "@tarojs/taro";
import { forwardRef, Ref, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { View } from "@tarojs/components";
import { Api_address_getAddressList, Api_address_removeAddress } from "../api/user__address";
import { Api_users_updateUserInfo } from "../api/user__users";
import { useHook_effect_update, useHook_selfInfo_show } from "../utils/useHooks";
// 组件
import ComNav from "../components/ComNav";
import ComNavBar from "../components/ComNavBar";
import ComAddress, { RefAddress } from "../components/ComAddress";
import ComLoading from "../components/ComLoading";
import ComNoMore from "../components/ComNoMore";
import ComSearcher from "../components/ComSearcher";
import ComListTypeSelector from "../components/ComListTypeSelector";
import ComAAPage from "../components/ComAAPage";

definePageConfig({ navigationStyle: "custom", disableScroll: true });

const Index_user_address_list = () => {
  const [selfInfo_S] = useHook_selfInfo_show({});
  const refAddress = useRef<RefAddress>(null);
  const refAddress_list = useRef<RefAddress_list>(null);
  const [addressList, setAddressList] = useState<AddressInfo[] | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const router = useRouter<{ manType: AddressManType; }>();
  const [addressType, setAddressType] = useState<AddressType>(router.params.manType === "rec" ? "收件地址" : "寄件地址");
  const [isLoadMore, setIsLoadMore] = useState<boolean | null>(false);
  useEffect(() => {
    if (selfInfo_S) {
      getAddressList___(searchValue);
      setIsLoadMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressType, selfInfo_S]);
  const onScrollToLower = throttle(() => {
    refAddress_list.current?.onScrollToLower();
  }, 1000);
  const getAddressList___ = async (str?: string) => {
    setAddressList(null);
    const res = await Api_address_getAddressList({
      timestamp: Date.now(),
      searchvalue: str,
      address_type: addressType,
      OPENID: selfInfo_S?.OPENID!,
    });
    setAddressList(res);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getOrderList_Callback = useCallback(
    debounce((str: string) => getAddressList___(str), 1000),
    []
  );
  useHook_effect_update(() => {
    getOrderList_Callback(searchValue);
  }, [searchValue]);
  return (
    <ComAAPage selfInfo_S={selfInfo_S}
      onScrollToLower={async () => onScrollToLower()}>
      <ComNav className='bccback' isHeight isSticky>
        <ComNavBar key={0} className='prl10' title='地址薄'></ComNavBar>
        <ComListTypeSelector typeList={["收件地址", "寄件地址", "全部"]} orderType={addressType} setOrderType={(e) => setAddressType(e)}></ComListTypeSelector>
        <ComSearcher placeholder='输入姓名/电话搜索' searchValue={searchValue} setSearchValue={setSearchValue} onGetOrderList={getAddressList___}></ComSearcher>
      </ComNav>

      <AddressList isLoadMore={isLoadMore} setIsLoadMore={setIsLoadMore} addressType={addressType} searchValue={searchValue} ref={refAddress_list} refAddress={refAddress} addressList={addressList} setAddressList={setAddressList}></AddressList>

      <View className='safe-bottom ww dxy'>
        {addressType !== "全部" && (
          <View
            className='pbt6 prl10 oo bccyellow'
            hoverClass='bccyellowtab'
            onClick={() => {
              refAddress.current?.show({ isEdit: false, manType: addressType === "收件地址" ? "rec" : "send" });
            }}>
            添加{addressType}
          </View>
        )}
      </View>
      <ComAddress ref={refAddress} addressList={addressList} setAddressList={setAddressList}></ComAddress>
    </ComAAPage>
  );
};
export default Index_user_address_list;

interface RefAddress_list {
  onScrollToLower: () => void;
}

const AddressList = forwardRef(
  (
    params: {
      isLoadMore: boolean | null;
      setIsLoadMore: React.Dispatch<React.SetStateAction<boolean | null>>;
      addressType: AddressType;
      searchValue: string;
      refAddress: React.RefObject<RefAddress>;
      addressList: AddressInfo[] | null;
      setAddressList: React.Dispatch<React.SetStateAction<AddressInfo[] | null>>;
    },
    ref: Ref<RefAddress_list>
  ) => {
    const { isLoadMore, setIsLoadMore, addressType, refAddress, addressList, setAddressList, searchValue } = params;
    const [selfInfo_S, setSelfInfo_S] = useHook_selfInfo_show({});
    const [manType, setManType] = useState<AddressManType | null>(null);
    const router = useRouter<{ manType: AddressManType; }>();
    useImperativeHandle(ref, () => ({
      onScrollToLower: async () => {
        if (isLoadMore === null) {
          return;
        }
        if (addressList) {
          setIsLoadMore(true);
          const res = await Api_address_getAddressList({
            timestamp: addressList[addressList?.length - 1].timestamp_update!,
            searchvalue: searchValue,
            address_type: addressType,
            OPENID: selfInfo_S?.OPENID!
          });
          setAddressList([...addressList, ...res]);
          if (res.length) {
            setIsLoadMore(false);
          } else {
            setIsLoadMore(null);
          }
        }
      },
    }));

    useLoad(async () => {
      setManType(router.params.manType ?? null);
    });

    return (
      <>
        {addressList === null && <ComLoading></ComLoading>}
        {addressList?.length === 0 && <ComLoading isEmpty></ComLoading>}
        {addressList && (
          <View>
            {addressList.map((e) => {
              return (
                <View key={e._id} className='o10 bccwhite mb10'>
                  <View className='pr'>
                    <View className='par prl10 pbt4'>
                      <View
                        className='cccgreen pbt6 pl10 oo'
                        hoverClass='bccbacktab'
                        onClick={() => {
                          Taro.showActionSheet({
                            itemList: ["设为默认", "编辑", "复制", ...(selfInfo_S?.address_info?._id === e._id ? [] : ["删除"])],
                            success: async (res0) => {
                              if (res0.errMsg === "showActionSheet:ok") {
                                switch (res0.tapIndex) {
                                  case 0: // 设为默认
                                    Taro.showLoading({ title: "更新中...", mask: true });
                                    const res_selfInfo = await Api_users_updateUserInfo({ ...selfInfo_S, address_info: e });
                                    setSelfInfo_S(res_selfInfo);
                                    Taro.hideLoading();
                                    break;
                                  case 1: // 编辑
                                    refAddress.current?.show({ isEdit: true, addr: e });
                                    break;
                                  case 2: // 复制
                                    Taro.setClipboardData({
                                      data: `${e.name} ${e.mobile} ${e.province} ${e.city} ${e.area} ${e.address}`,
                                      success: () => Taro.showToast({ title: "复制成功", icon: "success" }),
                                    });
                                    break;
                                  case 3: // 删除
                                    if (selfInfo_S?.address_info?._id === e._id) {
                                      Taro.showToast({ title: "默认地址不可删除", icon: "none" });
                                      return;
                                    }
                                    Taro.showModal({
                                      title: "提示",
                                      content: "您确定要删除该地址？",
                                      success: async (ee) => {
                                        if (ee.confirm) {
                                          Taro.showLoading({ title: "删除中...", mask: true });
                                          const res1 = await Api_address_removeAddress(e);
                                          setAddressList(addressList.filter((item) => item._id !== res1._id));
                                          Taro.hideLoading();
                                        }
                                      },
                                    });
                                    break;
                                }
                              }
                            },
                          });
                        }}>
                        操作
                      </View>
                    </View>
                    <View
                      className='o10 prl10 pbt4'
                      hoverClass='bccbacktab'
                      onClick={() => {
                        const obj = Taro.getCurrentPages();
                        obj[obj.length - 1].getOpenerEventChannel().emit("onSetAddressEvent", {
                          manType: manType,
                          addressInfo: e as AddressInfo,
                        });
                        Taro.navigateBack();
                      }}>
                      <View className='dbtt'>
                        <View className='dy pt6 fwb'>
                          <View className='mr6'>{e.name}</View>
                          <View className=''>{e.mobile}</View>
                          {selfInfo_S?.address_info && selfInfo_S.address_info._id === e._id && <View className='cccplh ml6'> (默认)</View>}
                        </View>
                      </View>
                      <View className='dy pb6 www75'>
                        <View className='cccplh'>
                          {e.province} {e.city} {e.area} {e.address}
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
            {addressList?.length !== 0 && <ComNoMore isLoadMore={isLoadMore}></ComNoMore>}
          </View>
        )}
      </>
    );
  }
);
