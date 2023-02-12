import { View } from '@tarojs/components';
import { FC } from 'react';
import { useHook_selfInfo_show } from '../utils/useHooks';

definePageConfig({});
const ComPrintNotice: FC<{ className?: string, time_limit: string | null; }> = ({ className, time_limit }) => {
  const [selfInfo_S] = useHook_selfInfo_show({});
  return (
    <>
      {
        selfInfo_S && selfInfo_S.regiment_is === 1 && time_limit &&
        <View className={className}>
          <View className='mrl10 bccyellow o10 p10 cccplh'>
            <View>{selfInfo_S?.print_time_limit?.notice}</View>
            <View className='dy'>请于 <View className='cccprice'>{time_limit}</View>  后统一打印</View>
          </View>
        </View>

      }
    </>
  );
};
export default ComPrintNotice;
