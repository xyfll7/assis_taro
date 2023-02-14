import { useState } from 'react';
import { get_logistics_track, get_refund_order } from '../api';
import { format } from 'date-fns';


export const CloudDB = () => {
  const [orderList, setOrderList] = useState<Product_Express[] | null>(null);
  return <div className='mrl10'>
    <div className=' cursor cccgreen '
      onClick={async () => {
        const res = await get_refund_order();
        const data = await res.json();
        console.log(data.data);
        setOrderList(data.data);
      }}
    >获取退款订单</div>
    {orderList?.map(order => {
      return <div className='dy' key={order._id}>
        <div className='mr10'>{order.regiment_name}</div>
        <div className='mr10'>{order.waybillId}</div>
      </div>;
    })}
  </div>;
};
