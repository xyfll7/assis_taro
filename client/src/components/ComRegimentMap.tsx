import { View, Map } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { FC } from 'react';
import ComAvatar from './ComAvatar';


const ComRegimentMap: FC<{ selfInfo_S: BaseUserInfo; onClick?: () => void; }> = ({ selfInfo_S, onClick }) => {
  return (
    <View className='safe-bottom'>
      <View className='mrl10 o15 ovh shadow'>
        <Map
          id='my_map'
          className='ww'
          customMapStyle='light'
          skew={40}
          enableOverlooking
          enableZoom={false}
          markers={[{
            id: 0,
            width: "",
            height: "",
            longitude: selfInfo_S?.regiment_info?.location?.coordinates[0]!,
            latitude: selfInfo_S?.regiment_info?.location?.coordinates[1]!,
            iconPath: ""
          }]}
          longitude={selfInfo_S?.regiment_info?.location?.coordinates[0]!}
          latitude={selfInfo_S?.regiment_info?.location?.coordinates[1]!}>
          <View className='dr p10'>
            <View className='prl10 pbt6 oo bccyellow' hoverClass='bccbacktab' onClick={() => {
              Taro.createMapContext("my_map").openMapApp({
                longitude: selfInfo_S?.regiment_info?.location?.coordinates[0]!,
                latitude: selfInfo_S?.regiment_info?.location?.coordinates[1]!,
                destination: `${selfInfo_S?.regiment_info?.name!} 团长`
              });
            }}>到这去</View>
          </View>
        </Map>
        <View className='dbtt  o10 prl10 pbt4'>
          <View className='ds pbt6'>
            <ComAvatar className='mr6 ' src={selfInfo_S?.regiment_info?.avatar}></ComAvatar>
            <View className='ww'>
              <View className='dbtc'>
                <View className='fwb'>{selfInfo_S?.regiment_info?.name} {onClick && '团长为您服务'}</View>
              </View>
              <View className='dbtc'>
                <View className='mr4 nw2 fs08 cccblacktab'>{selfInfo_S?.regiment_info?.location_name?.split("-")}</View>
              </View>
            </View>
          </View>
          {onClick &&
            <View className='prl10 pbt6 oo bccyellow nw' hoverClass='bccbacktab' onClick={onClick}>切换</View>
          }
        </View>
      </View>
      <View className='cccplh dxy fs pbt10 fs07'> {selfInfo_S.regiment_is === 1 ? "小象团长助手" : "小象心选"} </View>
    </View>
  );
};
export default ComRegimentMap;
