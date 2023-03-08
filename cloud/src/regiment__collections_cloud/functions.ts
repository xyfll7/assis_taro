import { Code } from "../../../client/src/a_config";
// 云函数代码
import cloud from "wx-server-sdk";
import { format, subDays, milliseconds } from "date-fns";
import xlsx from 'node-xlsx';


// @ts-ignore
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

export async function getCollectionList_cloud(
  event: Events<{
    timestamp: number;
    OPENID: string;
  }>
): Promise<Result<any>> {
  try {
    const { data } = event;
    const res = <cloud.DB.IQuerySingleResult>await db
      .collection("orders")
      .orderBy("timestamp_pay_callback", "desc")
      .where({
        regiment_OPENID: data.OPENID,
        timestamp_pay_callback: _.and(_.gt(data.timestamp), _.lt(data.timestamp + 86400000)),
        payStatus: 2,
      })
      .get();
    if (res.errMsg === "collection.get:ok") {
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: res.data,
      };
    } else {
      throw new Error(`数据库执行错误，${res.errMsg}`);
    }
  } catch (err: any) {
    throw err;
  }
}

export async function getCollectionHistoryList_cloud(
  event: Events<{
    timestamp: number;
    OPENID: string;
  }>
): Promise<Result<any>> {
  try {
    const { data } = event;
    const getTimestamp = (subDay: number) => {
      const date = format(
        subDays(new Date(data.timestamp), subDay),
        "yyyy/MM/dd"
      );
      const timestamp = new Date(date).getTime();
      return timestamp;
    };
    const boundaries = [
      getTimestamp(6),
      getTimestamp(5),
      getTimestamp(4),
      getTimestamp(3),
      getTimestamp(2),
      getTimestamp(1),
      getTimestamp(0),
      getTimestamp(-1),
    ];
    const res = <cloud.DB.IAggregateResult>await db
      .collection("orders")
      .aggregate()
      .match({
        regiment_OPENID: data.OPENID,
        timestamp_pay_callback: _.and(
          _.gte(getTimestamp(6)),
          _.lt(getTimestamp(-1))
        ),
        payStatus: 2,
      })
      .bucket({
        groupBy: "$timestamp_pay_callback",
        boundaries: boundaries,
        output: {
          count: $.sum(1),
          countTotalFee: $.sum("$totalFee"),
        },
      })
      .end();
    if (res.errMsg === "collection.aggregate:ok") {
      return {
        code: Code.SUCCESS,
        message: res.errMsg,
        data: boundaries
          .slice(0, -1)
          .map((e) => {
            const obj = res.list.find((ee) => ee._id == e);
            if (obj) {
              return obj;
            } else {
              return {
                _id: e,
                count: 0,
                countTotalFee: 0,
                aaaa: "啥也没有的",
              };
            }
          })
          .reverse(),
      };
    } else {
      throw new Error(`数据库执行错误，${res.errMsg}`);
    }
  } catch (err: any) {
    throw err;
  }
}

export async function getCollectionExcel_cloud(
  event: Events<{
    OPENID: string;
    firstDateOfMonth: string;
    lastDateOfMonth: string;
  }>
): Promise<Result<string>> {
  try {
    const { data } = event;
    const res0 = <cloud.DB.IQueryResult>await db
      .collection("orders")
      .where({
        regiment_OPENID: data.OPENID,
        timestamp_pay_callback: _.and(
          _.gte(new Date(data.firstDateOfMonth).getTime()),
          _.lt(new Date(data.lastDateOfMonth).getTime() + milliseconds({ days: 1 }))
        ),
        payStatus: 2,
      })
      .limit(10000)
      .get();
    if (res0.errMsg === "collection.get:ok") {
      const excleRes = make_excle(res0.data as Product_Express[], data.firstDateOfMonth);
      const res1 = await cloud.uploadFile({
        cloudPath: `account_statement/${data.OPENID}_${format(new Date(), "yyyy_MM_dd_HH_mm_ss")}.xlsx`,
        fileContent: excleRes
      });
      if (res1.errMsg === "uploadFile:ok") {
        return {
          code: Code.SUCCESS,
          message: "成功",
          data: res1.fileID,
        };
      } else {
        throw new Error(`上传对账单.xlsx文件错误，${res1.errMsg}`);
      }
    } else {
      throw new Error(`数据库执行错误，${res0.errMsg}`);
    }
  } catch (err) {
    throw err;
  }
}


function make_excle(params: Product_Express[], date: string): Buffer {
  let count_totalFee = 0;  // 金额
  let count_weight = 0; // 重量
  let count_profit = 0; // 利润合计
  let count_payable = 0; // 应付合计
  let count_receivable = 0; // 应收合计

  const dataArr = params.map((e, i) => {
    function get_rate(e: Product_Express) {
      if (e.deliveryId === "JTSD") {
        switch (e.weight) {
          case 1:
          case 2:
          case 3:
            return 0.42;
          default:
            return 0.40;
        }
      } else if (e.deliveryId === "YUNDA") {
        return 0.38;
      } else {
        return 0;
      }
    }
    const _province = e.recMan?.province;
    const _totalFee: number = (e.totalFee! / 100);
    const profit: number = (() => {
      // 新疆：首重15（12）+续重10（8）
      // 海南：首重12（8）+续重5（3）
      // 西藏：首重18（15）+续重12（10）
      if (_province?.includes("新疆") || _province?.includes("西藏")) {
        return e.weight * 2 + 1;
      } else if (_province?.includes("海南")) {
        return e.weight * 2 + 2;
      } else {
        return get_rate(e) * _totalFee;
      }
    })(); // 利润额
    count_totalFee += _totalFee;
    count_weight += e.weight;
    count_profit += profit; // 利润合计
    count_payable += e.regiment_sub_mchId ? 0 : profit; // 应付合计
    count_receivable += e.regiment_sub_mchId ? _totalFee - profit : 0; // 应收合计
    return [
      format(new Date(e.timestamp_pay_callback!), "yyyy-MM-dd"),
      format(new Date(e.timestamp_pay_callback!), "HH:mm:ss"),
      { express: "快递", publish: "商品" }[e.product_type!],
      e.deliveryName,     // 快递公司
      e.waybillId,        // 快递单号
      _province, // 目的地
      _totalFee,  // 金额
      e.weight,
      (() => {
        if (_province?.includes('新疆') || _province?.includes("西藏") || _province?.includes("海南")) {
          return `${(profit / _totalFee) * 100}%`;
        } else {
          return `${get_rate(e) * 100}%`;
        }
      })(),
      profit, // 利润额
      e.regiment_sub_mchId ? "" : profit, // 应收
      e.regiment_sub_mchId ? _totalFee - profit : "", // 应付
      e.regiment_sub_mchId ? `商户：${e.regiment_sub_mchId}` : "总账号"
    ];
  });
  var buffer = xlsx.build([{
    name: format(new Date(date), "yyyy年MM月"),
    data: [
      ["日期",
        "时间",
        "账单类型",
        "快递公司",
        "快递单号",
        "目的地",
        "金额",
        "重量",
        "利润率",
        "利润额",
        "应付",
        "应收",
        "资金流向"
      ],
      ["合计",
        "",    //时间
        "",    //账单类型
        "",    //快递公司
        "",    //快递单号
        "",    //目的地
        count_totalFee,  //金额
        count_weight,    //重量
        "",              //利润率
        count_profit,    //利润额
        count_payable,   //应付
        count_receivable,//应收
        "",              //资金流向
      ],
      ...dataArr,
    ],
    options: {
      '!cols': [
        { wch: 15 }, // 日期
        { wch: 8 }, // 时间
        { wch: 6 }, // 账单类型
        { wch: 12 }, // 快递公司
        { wch: 20 },  // 快递单号
        { wch: 20 },  // 目的地
        { wch: 5 },  // 金额
        { wch: 5 },  // 重量
        { wch: 8 },  // 利润率
        { wch: 8 },  // 利润额
        { wch: 8 },  // 应付
        { wch: 8 },  // 应收
        { wch: 15 } // 资金流向
      ]
    }
  }]);
  return buffer;
}
