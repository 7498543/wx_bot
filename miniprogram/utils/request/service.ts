import Request from "./request";

export const serviceHttp = new Request({
  // 服务端 api
  baseURL: "https://api.com/",
  showLoading: true,
  auth: () => {
    return wx.getStorageSync("service_token") || "";
  },
  clearToken: () => {
    wx.removeStorageSync("service_token");
  },
  failHandle: (err) => {
    wx.showToast({
      title: "服务请求失败",
      icon: "none",
    });
    console.error("Service API Error:", err);
  },
});
