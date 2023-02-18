import { Popup as VPopup } from "@antmjs/vantui";
import { View, Image } from "@tarojs/components";
import Taro from '@tarojs/taro';
import { FC } from 'react';

const qrCode_collection_url = "https://636c-cloud1-8gfby1gac203c61c-1306790653.tcb.qcloud.la/线上_收款码.jpeg";
const ComCollectionQRCode: FC<{ qrCode: boolean, onClick_setQrCode: (e: boolean) => void; }> = ({ qrCode, onClick_setQrCode }) => {
  return (
    <>
      <VPopup className='www90 dcl pbt10' show={Boolean(qrCode)} round onClose={() => onClick_setQrCode(false)}>
        <View className='dcl mt10'>
          <View className='mb4'>请顾客扫此二维码支付</View>
          <View className='tac mrl10 prl10 cccplh'>可将此二维码保存打印 </View>
          <View className='tac mrl10 prl10 cccplh'>顾客扫此二维码打开“待付款”订单列表 </View>
          <Image src={qrCode_collection_url} className='wwwhhh50 mbt10 img-back-loading o10 bccback'></Image>
          <View
            className='prl10 pbt6 oo bccyellow'
            hoverClass='bccyellowtab'
            onClick={() => {
              Taro.showLoading({ title: "保存中...", mask: true });
              Taro.downloadFile({
                url: qrCode_collection_url,
                filePath: `${Taro.env.USER_DATA_PATH}/收款码.jpeg`,
                success: (e) => {
                  Taro.saveImageToPhotosAlbum({
                    filePath: e.filePath,
                    success(ee) {
                      if (ee.errMsg === "saveImageToPhotosAlbum:ok") {
                        Taro.showToast({ title: "保存成功", icon: "none" });
                      } else {
                        Taro.showToast({ title: "保存失败", icon: "none" });
                      }
                    },
                    fail: () => Taro.showToast({ title: "保存失败", icon: "none" }),
                  });
                },
                fail: () => Taro.showToast({ title: "保存失败", icon: "none" }),
              });
            }}>
            保存二维码
          </View>
          <View className='mt10 prl10 pbt6 oo cccplh' hoverClass='bccbacktab' onClick={() => onClick_setQrCode(false)}>
            关闭
          </View>
        </View>
      </VPopup>
      <View
        className='cccgreen pbt6  mr10 pr10 pl10 oo'
        hoverClass='bccbacktab'
        onClick={() => onClick_setQrCode(true)}>
        收款码
      </View>
    </>
  );
};
export default ComCollectionQRCode;
