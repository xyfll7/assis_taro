
import { intervalToDuration } from "date-fns";
import { es, ru, zhCN } from 'date-fns/locale';

function get_time_limit(end_time: string) {
  const start_timestamp = new Date().getTime();
  const end_timestamp = new Date(end_time).getTime();
  if (start_timestamp < end_timestamp) {
    const { years, months, days, hours, minutes, seconds } = intervalToDuration({
      start: new Date(),
      end: new Date(end_time)
    });
    return `${years ? years + '年' : ''}${months ? months + '个月' : ''}${days ? days + '天' : ''}${hours ? hours + '小时' : ''}${minutes ? minutes + '分' : ''}${seconds ? seconds + '秒' : ''}`;
  } else {
    return null;
  }
}

const duration = get_time_limit("2024-03-13 21:58:00");

console.log("时间：", duration);
