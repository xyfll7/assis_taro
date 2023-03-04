
import { View } from '@tarojs/components';
import getEnv from '../utils/env';

const ComMoreService = () => {
  const env = getEnv();
  return (
    <View className='dll'>
      <View className='pbt6 pr10 oo cccplh ml6'>更多服务敬请期待...</View>
      <View className='pbt6 pr10 oo cccplh ml6 fs06 fwl'>
        <View>
          环境：{`${env?.envVersion} ${env?.alias} ${env?.version !== "" ? env?.version : "0.0.00"}`}
        </View>
      </View>
    </View>
  );
};
export default ComMoreService;
