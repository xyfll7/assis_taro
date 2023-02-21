import { View, Image } from '@tarojs/components';
import { Popup as VPopup } from "@antmjs/vantui";
import { FC, useState } from 'react';
import Taro from '@tarojs/taro';
import { utils_get_qrcode } from '../utils/utils';
import { useSelfInfo } from '../store/SelfInfoProvider';

const ComRegimentQRCode: FC<{ className: string, hoverClass: string; children: React.ReactNode; }> = ({ className, hoverClass, children }) => {
  const [selfInfo_S] = useSelfInfo();
  const [qrcode, setQrcode] = useState<string | null>(null);
  return (
    <>
      <VPopup className='www90 dcl pbt10' show={Boolean(qrcode)} round onClose={() => setQrcode(null)}>
        <View className='pbt10 fs13'>团长专属小程序码</View>
        <View className='cccplh pb10'>顾客可扫此码下单</View>
        <Image src={qrcode!} className='wwwhhh50 mbt10'></Image>
        <View
          className='mbt10 pbt6 prl10 oo bccyellow'
          hoverClass='bccyellowtab'
          onClick={() => {
            Taro.saveImageToPhotosAlbum({
              filePath: qrcode!,
              success(res) {
                if (res.errMsg === "saveImageToPhotosAlbum:ok") {
                  Taro.showToast({ title: "保存成功", icon: "none" });
                }
              },
            });
          }}>
          保存到相册
        </View>
        <View className='pb10 prl10 pbt6 oo cccplh' hoverClass='bccbacktab' onClick={() => setQrcode(null)}>
          关闭
        </View>
      </VPopup>
      <View
        className={className}
        hoverClass={hoverClass}
        onClick={async () => {
          const _qrcode = await utils_get_qrcode({
            page: "pages_user/user_express",
            scene: `R_D=${selfInfo_S?.OPENID}`,
          });
          setQrcode(_qrcode);
        }}>
        {children}
      </View>
    </>

  );
};
export default ComRegimentQRCode;
