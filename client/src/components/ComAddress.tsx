import { Input, PageContainer, ScrollView, Textarea, View } from "@tarojs/components";
import AddressParse from "address-parse";
import classNames from "classnames";
import { FC, forwardRef, Ref, useEffect, useImperativeHandle, useState } from "react";
import Taro from "@tarojs/taro";
import address_json from "./pca-code.json";
import { utils_string_to_char_code, utils_validate_express } from "../utils/utils";
import { Api_address_addAddress, Api_address_updateAddress } from "../api/user__address";
import { Api_users_updateUserInfo } from "../api/user__users";
import { useHook_selfInfo_show } from "../utils/useHooks";
import ComHeaderBar from './ComHeaderBar';

interface Address_json {
  code: string;
  name: string;
  children: Address_json[];
}
export interface RefAddress {
  show: (params: { isSelector?: boolean; isOnlySelector?: boolean; addr?: AddressInfo | null; manType?: AddressManType | null; isGetClipboard?: boolean; isEdit?: boolean; }) => void;
}

const ComAddress = forwardRef(
  (
    params: {
      addressList?: AddressInfo[] | null;
      setAddressList?: React.Dispatch<React.SetStateAction<AddressInfo[] | null>>;
      onSetExpressForm?: (mantype: AddressManType, data: AddressInfo) => void;
    },
    ref: Ref<RefAddress>
  ) => {
    const { onSetExpressForm, setAddressList, addressList } = params;
    useImperativeHandle(ref, () => ({
      show: ({ isEdit = false, isSelector = false, isOnlySelector = false, manType = null, isGetClipboard = false, addr }) => {
        setShow(true);
        setShowSelector(isSelector);
        setOnlySelector(isOnlySelector);
        setIsEdit(isEdit);
        setManType(manType ?? null);
        if (isGetClipboard) {
          Taro.getClipboardData({
            success: (e) => {
              if (e.data.trim()) {
                setAddStr(e.data.trim());
              } else {
                Taro.showToast({ title: "剪切板为空", icon: "none" });
              }
            },
            fail: () => {
              Taro.showToast({ title: "剪切板为空", icon: "none" });
            },
          });
        }
        if (addr) {
          setAddress({ ...address, ...addr });
        }
      },
    }));
    const [isEdit, setIsEdit] = useState(false);
    const [manType, setManType] = useState<AddressManType | null>(null);
    const [onlySelector, setOnlySelector] = useState(false);
    const [show, setShow] = useState(false);
    const [addStr, setAddStr] = useState("");
    const [address, setAddress] = useState<AddressInfo>({
      name: "",
      mobile: "",
      company: "",
      post_code: "",
      code: "",
      country: "中国",
      province: "",
      city: "",
      area: "",
      address: "",
      from: "CP",
    });

    useEffect(() => {
      smartPares(addStr);
    }, [addStr]);

    function smartPares(str: string) {
      const [res] = AddressParse.parse(str, true);
      setAddress({
        name: res?.name ?? "",
        mobile: res?.mobile ?? "" ?? res?.phone ?? "",
        company: "",
        post_code: "",
        code: res?.code ?? "",
        country: "中国",
        province: res?.province ?? "",
        city: res?.city ?? "",
        area: res?.area ?? "",
        address: res?.details ?? "",
        from: "CP",
      });
    }
    useEffect(() => {
      if (onlySelector && onSetExpressForm) {
        onSetExpressForm("rec", {
          province: address.province,
          city: address.city,
          area: address.area,
          post_code: address.post_code,
        } as AddressInfo);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address]);
    const [selfInfo_S, setSelfInfo_S] = useHook_selfInfo_show({});
    async function onSaveAddress() {
      const _address: AddressInfo = {
        ...address,
        address_type: manType === "rec" ? "收件地址" : "寄件地址",
      };
      if (utils_validate_express(manType, _address)) {
        Taro.showLoading({ title: "保存中...", mask: true });
        onSetExpressForm && onSetExpressForm(manType!, { ..._address });
        let res_address: AddressInfo;
        if (isEdit) {
          res_address = await Api_address_updateAddress(_address);
          setAddressList &&
            setAddressList(
              addressList!.map((e) => {
                if (e._id === res_address._id) {
                  return _address;
                } else {
                  return e;
                }
              })
            );
        } else {
          res_address = await Api_address_addAddress({ ..._address, self_OPENID: selfInfo_S?.OPENID });
          setAddressList && setAddressList([...(addressList ?? []), res_address]);
        }
        if (!selfInfo_S?.address_info || _address?._id === selfInfo_S?.address_info?._id) {
          const res_selfInfo = await Api_users_updateUserInfo({ ...selfInfo_S, address_info: res_address });
          setSelfInfo_S(res_selfInfo);
        }
        Taro.hideLoading();
        setShow(false);
      }
    }
    const [showSelector, setShowSelector] = useState(false);
    return (
      <PageContainer round show={show} onLeave={() => setShow(false)}>
        <View className='hhh85 bccback '>{!showSelector ? <AddressInput show={show} setShow={setShow} isEdit={isEdit} addStr={addStr} manType={manType} onSaveAddress={onSaveAddress} setAddStr={setAddStr} address={address} setShowSelector={setShowSelector} setAddress={setAddress}></AddressInput> : <ProvinceCityArea setShow={setShow} onlySelector={onlySelector} setShowSelector={setShowSelector} address={address} setAddress={setAddress}></ProvinceCityArea>}</View>
      </PageContainer>
    );
  }
);

export default ComAddress;

//#region 地址输入框
const AddressInput: FC<{
  isEdit: boolean;
  className?: string;
  addStr?: string;
  show: boolean;
  manType: AddressManType | null;
  onSaveAddress: () => void;
  setAddStr: React.Dispatch<React.SetStateAction<string>>;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSelector: React.Dispatch<React.SetStateAction<boolean>>;
  address: AddressInfo;
  setAddress: React.Dispatch<React.SetStateAction<AddressInfo>>;
}> = ({ isEdit, show, manType, address, setAddress, className, setShow, setShowSelector, addStr, setAddStr, onSaveAddress }) => {
  return (
    <View className={classNames("prl10 ", className)}>
      <ComHeaderBar title={(() => {
        if (isEdit) {
          return "编辑地址";
        } else if (manType === "rec" || manType === "send") {
          return manType === "rec" ? "新建收件人" : "新建寄件人";
        } else {
          return "新建地址";
        }
      })()} onClick={() => setShow(false)}></ComHeaderBar>
      <View className='prl10 dbtt'>
        {show && (
          <>
            <View className='pbt6 ww'>
              <Textarea
                className='ww '
                style='max-height:5rem;'
                autoHeight
                disableDefaultPadding
                placeholder='输入或粘贴地址，可自动识别'
                value={addStr}
                onInput={(e) => {
                  setAddStr(e.detail.value);
                }}></Textarea>
            </View>
          </>
        )}
      </View>
      <View className='dr prl10'>
        <View className='cccgreen pbt6 pl10 oo nw ' hoverClass='bccbacktab' onClick={() => setAddStr("")}>
          清空
        </View>
        <View
          className='cccgreen pbt6 pl10 oo nw '
          hoverClass='bccbacktab'
          onClick={() => {
            Taro.chooseAddress({
              success: (e) => {
                setAddress({
                  name: e.userName,
                  mobile: e.telNumber,
                  company: "",
                  post_code: "",
                  code: e.postalCode,
                  country: "中国",
                  province: e.provinceName,
                  city: e.cityName,
                  area: e.countyName,
                  address: e.detailInfo,
                  from: "WX",
                });
              },
            });
          }}>
          微信地址
        </View>
        <View
          className='cccgreen pbt6 pl10 oo nw '
          hoverClass='bccbacktab'
          onClick={() => {
            Taro.chooseMedia({
              count: 1,
              mediaType: ["image"],
              sourceType: ["album", "camera"],
              sizeType: ["compressed"],
              success: (e) => {
                if (e.errMsg === "chooseMedia:ok") {
                  const [img] = e.tempFiles;
                  if (img) {
                    Taro.navigateTo({
                      url: `/pages_user/user_image_cropper?imgSrc=${img.tempFilePath}`,
                      events: {
                        onOcrRes: (ee: string) => {
                          setAddStr(ee);
                        },
                      },
                    });
                  }
                }
              },
            });
          }}>
          图片识别
        </View>
        <View
          className='cccgreen pbt6 pl10 oo nw '
          hoverClass='bccbacktab'
          onClick={() => {
            Taro.getClipboardData({
              success: (e) => {
                if (e.data.trim()) {
                  setAddStr(e.data.trim());
                } else {
                  Taro.showToast({ title: "剪切板为空", icon: "none" });
                }
              },
              fail: () => Taro.showToast({ title: "剪切板为空", icon: "none" }),
            });
          }}>
          粘贴识别
        </View>
      </View>
      <View className=' prl10 mt6 o10 bccwhite'>
        <View className='pbt10'>
          <Input
            className='ww'
            alwaysEmbed
            placeholder='联系人：名字'
            value={address.name}
            onInput={(e) => {
              setAddress({ ...address, name: e.detail.value });
            }}></Input>
        </View>
        <View className='pbt10 lit dbtc'>
          <Input
            className='ww'
            alwaysEmbed
            placeholder='联系电话：手机号码'
            value={address.mobile}
            onInput={(e) => {
              setAddress({ ...address, mobile: e.detail.value });
            }}></Input>
          {/* <View className="nw cccgreen pl10 pbt6 oo" hoverClass="bccbacktab" >授权</View> */}
        </View>
        <View className='dbtc  pbt4 lit'>
          <View className={classNames("mr6 www65 ", { fwb: Taro.getSystemInfoSync().platform === "ios", cccplh: !address.province })} onClick={() => setShowSelector(true)}>
            {address.province ? `${address.province} ` : <View className='cccplh mr10 inline'>省</View>}
            {address.city ? (
              `${address.city} `
            ) : (
              <View
                className={classNames("cccplh mr10 inline", {
                  cccprice: address.province && !address.city,
                })}>
                市
              </View>
            )}
            {address.area ? (
              `${address.area}`
            ) : (
              <View
                className={classNames("cccplh mr10 inline", {
                  cccprice: address.province && !address.area,
                })}>
                区
              </View>
            )}
          </View>
          <View className='nw cccgreen pl10 pbt6 oo' hoverClass='bccbacktab' onClick={() => setShowSelector(true)}>
            选择
          </View>
          <View
            className='nw cccgreen pl10 pbt6 oo'
            hoverClass='bccbacktab'
            onClick={() => {
              Taro.chooseLocation({
                success: (e) => {
                  if (!e.address) {
                    return;
                  }
                  const [res] = AddressParse.parse(e.address, true);
                  if (!res) {
                    return;
                  }
                  setAddress({
                    ...address,
                    province: res.province,
                    city: res.city,
                    area: res.area,
                    address: res.details + " " + e.name,
                  });
                },
              });
            }}>
            地图
          </View>
        </View>
        <View className='pbt10 lit'>
          {show && (
            <Textarea
              className='ww'
              style='max-height:5rem;'
              placeholder='详细地址：街道门牌信息'
              disableDefaultPadding
              autoHeight
              value={address.address}
              onInput={(e) => {
                setAddress({ ...address, address: e.detail.value });
              }}></Textarea>
          )}
        </View>
      </View>
      <View className='mt10 dcl'>
        <View
          className='prl20 pbt6 oo bccyellow'
          hoverClass='bccyellowtab'
          onClick={() => {
            onSaveAddress();
          }}>
          保存{manType === "rec" ? "收件人" : "寄件人"}
        </View>
      </View>
    </View>
  );
};
//#endregion

//#region 省市区选择器
const ProvinceCityArea: FC<{
  onlySelector: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSelector: React.Dispatch<React.SetStateAction<boolean>>;
  address: AddressInfo;
  setAddress: React.Dispatch<React.SetStateAction<AddressInfo>>;
}> = ({ address, setAddress, setShowSelector, onlySelector, setShow }) => {
  const provinceList = address_json as Address_json[];
  const [cityList, setCityList] = useState<Address_json[]>([]);
  const [areaList, setAreaList] = useState<Address_json[]>([]);
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [level, setLevel] = useState<"0" | "1" | "2">("0");
  const [scrollInto, setScrollInto] = useState("");
  useEffect(() => {
    if (address.province.trim()) {
      setProvince(address.province);
      setCity(address.city.trim());
      const _cityList = provinceList.find((e) => e.name.includes(address.province.slice(0, 2)))?.children;

      setLevel("1");
      setCityList(_cityList ?? []);
      if (address.city.trim()) {
        setArea(address.area.trim());
        setAreaList(_cityList?.find((e) => e.name.includes(address.city.slice(0, 2)))?.children ?? []);
        setLevel("2");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View className='prl10 '>
      <ComHeaderBar title='选择地区' onClick={() => {
        onlySelector ? setShow(false) : setShowSelector(false);
      }}></ComHeaderBar>
      <View className='pbt6 dy fwb prl10'>
        <View className='dcl mr6'>
          <View
            className={classNames("nw1", { cccplh: province === "" })}
            style='max-width:28vw;'
            onClick={() => {
              setLevel("0");
              if (provinceList.length && province) {
                setScrollInto("x");
                setTimeout(() => setScrollInto(provinceList.find((e) => e.name === province)?.name ?? "x"), 0);
              }
            }}>
            {province ? province : "省份/地区"}
          </View>
          <View className={classNames("oo bccgreen ", { vbh: level !== "0" })} style='height:8rpx;width:1rem;'></View>
        </View>
        {province && (
          <View className='dcl mr6'>
            <View
              className={classNames("nw1", { cccplh: city === "" })}
              style='max-width:28vw;'
              onClick={() => {
                setLevel("1");
                if (cityList.length && city) {
                  setScrollInto("x");
                  setTimeout(() => setScrollInto(cityList.find((e) => e.name === city)?.name ?? "x"), 0);
                }
              }}>
              {city ? city : "城市"}
            </View>
            <View className={classNames("oo bccgreen ", { vbh: level !== "1" })} style='height:8rpx;width:1rem;'></View>
          </View>
        )}
        {city && (
          <View className='dcl'>
            <View
              className={classNames("nw1", { cccplh: area === "" })}
              style='max-width:28vw;'
              onClick={() => {
                setLevel("2");
                if (areaList.length && area) {
                  setScrollInto("x");
                  setTimeout(() => setScrollInto(areaList.find((e) => e.name === area)?.name ?? "x"), 0);
                }
              }}>
              {area ? area : "区/县"}
            </View>
            <View className={classNames("oo bccgreen ", { vbh: level !== "2" })} style='height:8rpx;width:1rem;'></View>
          </View>
        )}
      </View>
      <ScrollView style='height:65vh;' scrollY scrollWithAnimation scrollIntoView={utils_string_to_char_code(scrollInto)}>
        <View className='safe-bottom pb10 mb10 prl10'>
          {level === "0" &&
            provinceList.map((e) => {
              return (
                <View
                  className='dbtc'
                  id={utils_string_to_char_code(e.name)}
                  key={e.name}
                  onClick={() => {
                    setProvince(e.name);
                    setCityList(e.children);
                    setLevel("1");
                    if (e.name !== province) {
                      setCity("");
                    }
                  }}>
                  <View className='pbt6'>{e.name}</View>
                  {province === e.name && (
                    <View className='nw1' style='max-width:25vw'>
                      {e.name}
                    </View>
                  )}
                </View>
              );
            })}
          {level === "1" &&
            cityList.map((e) => {
              return (
                <View
                  className='dbtc'
                  id={utils_string_to_char_code(e.name)}
                  key={e.name}
                  onClick={() => {
                    setCity(e.name);
                    setAreaList(e.children);
                    setLevel("2");
                    if (e.name !== city) {
                      setArea("");
                    }
                  }}>
                  <View className='pbt6'>{e.name}</View>
                  {city === e.name && (
                    <View className='nw1' style='max-width:25vw'>
                      {e.name}
                    </View>
                  )}
                </View>
              );
            })}
          {level === "2" &&
            areaList.map((e) => {
              return (
                <View
                  className='dbtc'
                  id={utils_string_to_char_code(e.name)}
                  key={e.name}
                  onClick={() => {
                    setArea(e.name);
                    setLevel("2");
                    setAddress({
                      ...address,
                      province: province,
                      city: city,
                      area: e.name,
                      post_code: e.code,
                    });
                    if (onlySelector) {
                      setShow(false);
                    } else {
                      setShowSelector(false);
                    }
                  }}>
                  <View className='pbt6'>{e.name}</View>
                  {area === e.name && (
                    <View className='nw1' style='max-width:25vw'>
                      {e.name}
                    </View>
                  )}
                </View>
              );
            })}
        </View>
      </ScrollView>
    </View>
  );
};
//#endregion
