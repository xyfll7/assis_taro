import { View } from '@tarojs/components';
import classNames from 'classnames';


// 列表类型选择器
const ComListTypeSelector = <T extends string>({ orderType, setOrderType, className, children, typeList }: {
  className?: string;
  orderType: T;
  typeList: T[];
  children?: React.ReactNode;
  setOrderType: (e: T) => void;
}): JSX.Element => {
  return (
    <View className={classNames("dbtc pbt6 bccback pl10", className)}>
      <View className='dy'>
        {typeList.map((e, i) => (
          <View
            key={e}
            className={classNames("cccplh pbt6 oo mr6", { bccyellow: orderType == e, prl10: orderType == e, ml10: i == 0 && orderType != e })}
            onClick={() => {
              setOrderType(e);
            }}>
            {e}
          </View>
        ))}
      </View>
      {children}
    </View>
  );
};
export default ComListTypeSelector;
