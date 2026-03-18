import { loadTabbar } from "./utils/tabbar/index";
import { IAppOption } from "typings";

App<IAppOption>({
  globalData: {
    tabbarList: [],
  },
  onLaunch() {
    loadTabbar();
  },

  setTabbar(page: WechatMiniprogram.Page.TrivialInstance) {
    if (typeof page.getTabBar === "function" && page.getTabBar()) {
      page.getTabBar().setData({
        list: this.globalData.tabbarList,
      });
    }
  },
});
