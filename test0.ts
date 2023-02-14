
import { milliseconds } from "date-fns";
import { es, ru, zhCN } from 'date-fns/locale';

function get_time_limit(end_time: string) {
  return milliseconds({ days: 1 });
}

const duration = get_time_limit("2024-03-13 21:58:00");

console.log("时间：", duration);
86400000;
86400000;
