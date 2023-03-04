import { View } from '@tarojs/components';
import ComAAPage from "../components/ComAAPage";
import { useHook_selfInfo_show } from '../utils/useHooks';

definePageConfig({ navigationStyle: "custom", disableScroll: true, });
const Index_user_publish = () => {
  const [selfInfo_S] = useHook_selfInfo_show({});
  return (
    <ComAAPage selfInfo_S={selfInfo_S}>
      <View></View>
    </ComAAPage>
  );
};
export default Index_user_publish;
