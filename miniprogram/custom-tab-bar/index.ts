import { IAppOption } from "typings";

Component({
  data: {
    active: 0,
    list: [],
  },
  lifetimes: {
    attached() {
      this.setData({
        list: getApp<IAppOption>().globalData.tabbarList,
      });
    },
  },
  methods: {
    onChange(event: WechatMiniprogram.CustomEvent) {
      wx.switchTab({
        url: this.data.list[event.detail].pagePath,
      });
    },
  },
});
