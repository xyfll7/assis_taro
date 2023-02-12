import { Input, View } from '@tarojs/components';
import classNames from 'classnames';
import { FC } from 'react';

const ComSearcher: FC<{
  className?: string;
  placeholder?: string;
  searchValue: string,
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  onGetOrderList?: (str?: string) => {};
}> = ({ searchValue, setSearchValue, onGetOrderList, className, placeholder }) => {
  return <View className={classNames("prl10 mrl10 dbtc pb4", className)}>
    <Input className='ww ' placeholder-style="{fontSize: '0.7rem', fontWeight: 'normal',color:'red' }"
      placeholder={placeholder ? placeholder : "请输入搜索关键字"} confirmType='search'
      value={searchValue}
      onConfirm={(e) => { setSearchValue(e.detail.value); }}
      onInput={(e) => { setSearchValue(e.detail.value); }}></Input>
    <View className='dy'>
      {searchValue && <View className='cccplh pl10 pbt6 oo nw' hoverClass='bccbacktab'
        onClick={() => {
          setSearchValue("");
        }}>清空</View>}
      <View className='cccgreen pl10 pbt6 oo nw' hoverClass='bccbacktab'
        onClick={() => { onGetOrderList && onGetOrderList(searchValue); }}>搜索</View>
    </View>
  </View>;
};

export default ComSearcher;
