import { TabbarItem } from "typings/tabbar";
import { serviceHttp } from "../request/index";
import { IAppOption } from "typings";

interface loadOptions {
  /** 强制刷新 */
  refresh?: boolean;
}

let isLoad = false;

export function loadTabbar(options?: Partial<loadOptions>) {
  return new Promise<TabbarItem[]>(async (resolve, reject) => {
    const cache = wx.getStorageSync("sys_tabbar") as TabbarItem[];
    if (options && options.refresh) {
      // 强制刷新直接调用接口
      await api().then(resolve).catch(reject);
    } else if (cache.length > 0) {
      // 加载过了 就返回缓存数据
      resolve(cache);
      return;
    } else {
      // 未加载过 就调用接口
      await api().then(resolve).catch(reject);
    }
    isLoad = true;
  });
}

function api() {
  return serviceHttp.post<TabbarItem[]>("/api/app/tabbar", {}).then((res) => {
    wx.setStorageSync("sys_tabbar", res);
    getApp<IAppOption>().globalData.tabbarList = res;
    return res;
  });
}
