/// <reference path="./types/index.d.ts" />

import { TabbarItem } from "./tabbar";

interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo;
    tabbarList: TabbarItem[];
  };
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback;
  setTabbar: (page: WechatMiniprogram.Page.TrivialInstance) => void;
}
