import { View } from '@tarojs/components';
import Taro, { getCurrentInstance, useRouter } from '@tarojs/taro';
import { useState } from 'react';
import { utils_ocr } from '../utils/utils';
// 组件
import ComNav from "../components/ComNav";
import ComNavBar from "../components/ComNavBar";
import ComAAPage from "../components/ComAAPage";
import { useHook_selfInfo_show } from '../utils/useHooks';

definePageConfig({
  navigationBarTitleText: "裁剪图片",
  navigationStyle: "custom",
  usingComponents: {
    'image-cropper': '../components/image-cropper/image-cropper'
  },
  disableScroll: true,
});
const Index_user_image_cropper = () => {
  const [selfInfo_S] = useHook_selfInfo_show({});
  const { safeArea } = Taro.getSystemInfoSync();
  const router = useRouter();
  const cfg = {
    imgSrc: router.params.imgSrc,
    width: 250, //宽度
    height: 100, //高度
    min_width: 50,
    min_height: 30,
    max_width: safeArea?.width ?? 350,
    max_height: 500
  };
  const [angle, setAngle] = useState(0);
  const getCropper = () => {
    const { page } = getCurrentInstance();
    const cropper: any = page && page.selectComponent &&
      page.selectComponent('#image-cropper');
    return cropper;
  };
  return (
    <ComAAPage selfInfo_S={selfInfo_S}>
      <ComNav className='bccback pb6' isHeight isSticky>
        <ComNavBar className='prl10 ' title='裁剪图片'></ComNavBar>
      </ComNav>
      {/* @ts-ignore */}
      <image-cropper
        id='image-cropper'
        imgSrc={cfg.imgSrc}
        width={cfg.width}
        height={cfg.height}
        min_width={cfg.min_width}
        min_height={cfg.min_height}
        max_width={cfg.max_width}
        max_height={cfg.max_height}
        onTapcut={() => {

        }}
        onLoad={() => {

        }}
        onImageload={() => {
          Taro.hideLoading();
          getCropper().imgReset();
        }}>
        {/* @ts-ignore */}
      </image-cropper>
      <View className='fixed-bottom safe-bottom ww dxy z9 ' >
        <View className='dbtc www70'>
          <View className='bccyellow oo prl10 pbt6'
            onClick={() => { Taro.navigateBack(); }}>取消</View>
          <View className='bccyellow oo prl10 pbt6'
            onClick={() => {
              getCropper().setAngle(angle + 90);
              setAngle(angle + 90);
            }}>旋转</View>
          <View className='bccyellow oo prl10 pbt6'
            onClick={() => {
              getCropper().getImg(async (img: { url: string, width: number, height: number; }) => {
                Taro.showLoading({ title: "识别中...", mask: true });
                const ocrRes = await utils_ocr(img.url);
                const pages = Taro.getCurrentPages();
                const current = pages[pages.length - 1];
                const eventChannel = current.getOpenerEventChannel();
                eventChannel.emit("onOcrRes", ocrRes);
                Taro.hideLoading();
                Taro.navigateBack();
              });
            }}>完成</View>
        </View>
      </View>
    </ComAAPage>
  );
};
export default Index_user_image_cropper;
