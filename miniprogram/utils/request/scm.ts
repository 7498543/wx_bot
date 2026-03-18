import Request from "./request";

export const scmHttp = new Request({
  baseURL: "http://192.168.1.5",
  timeout: 5000, // SCM 通常是局域网，可以设置较短的超时
  auth: () => {
    return wx.getStorageSync("scm_token") || "";
  },
  clearToken: () => {
    wx.removeStorageSync("scm_token");
  },
  failHandle: (err) => {
    wx.showToast({
      title: "SCM 连接失败",
      icon: "none",
    });
    console.error("SCM API Error:", err);
  },
});
