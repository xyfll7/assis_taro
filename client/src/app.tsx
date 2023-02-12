import Taro, { useDidHide, useDidShow, useError } from "@tarojs/taro";
import { useEffect } from "react";
import { TasksProvider } from "./store/TasksContext";
import { SelfInfoProvider } from "./store/SelfInfoProvider";
import { OrdersNoticeProvider } from "./store/OrdersNoticeProvider";
import "./app.css";

export default function App({ children }: { children: JSX.Element; }) {
  // 可以使用所有的 React Hooks
  useEffect(() => { }, []);
  // 对应 onShow
  useDidShow(() => {
    const updateManager = Taro.getUpdateManager();
    updateManager.onCheckForUpdate((e) => {
      console.warn("是否有新版本：", e);
    });
    updateManager.onUpdateReady((e) => {
      console.warn("新版本下载成功：", e);
      Taro.showModal({
        title: "更新提示",
        content: "新版本已经准备好，是否马上重启小程序？",
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate();
          }
        },
      });
    });
    updateManager.onUpdateFailed((e) => {
      console.warn("新版本下载失败：", e);
    });
  });
  // 对应 onHide
  useDidHide(() => { });
  useError((e) => console.error("全局未捕获:", e));
  // 在入口组件不会渲染任何内容，但我们可以在这里做类似于状态管理的事情
  return (
    <TasksProvider>
      <SelfInfoProvider>
        <OrdersNoticeProvider>{children}</OrdersNoticeProvider>
      </SelfInfoProvider>
    </TasksProvider>
  );
}

Object.defineProperty(Object.prototype, "logr", {
  enumerable: false,
  value: function (describe: string, num?: number): any {
    console.log(describe ?? "logrrrr::", JSON.parse(JSON.stringify(this)));
    if (num) {
      return this.slice(0, num);
    } else {
      return JSON.parse(JSON.stringify(this));
    }
  },
});
