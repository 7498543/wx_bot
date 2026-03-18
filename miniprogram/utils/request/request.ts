type RequestMethod =
  | "GET"
  | "OPTIONS"
  | "HEAD"
  | "POST"
  | "PUT"
  | "DELETE"
  | "TRACE"
  | "CONNECT";

export interface RequestOptions {
  /** 基础URL */
  baseURL?: string;
  /** 请求头 */
  header?: Record<string, string>;
  /** 状态码映射 */
  codeMap?: {
    /** 成功码 */
    success: number;
    /** 未授权码 */
    unauth: number;
  };
  /** 授权字段名，默认 Authorization */
  authField?: string;
  /** 获取授权 Token 的函数 */
  auth?: () => string;
  /** 数据字段名，默认 data */
  dataField?: string;
  /** 状态码字段名，默认 code */
  codeField?: string;
  /** 是否返回完整响应数据，默认 false */
  completeResponse?: boolean;
  /** 未授权时是否自动清除 token，默认 true */
  unauthClearToken?: boolean;
  /** 清除 token 的函数 */
  clearToken?: () => void;
  /** 是否显示加载提示，默认 false */
  showLoading?: boolean;
  /** 加载提示文字 支持多语言 */
  loadingTitle?: string | (() => string);
  /** 超时时间，单位 ms */
  timeout?: number;
  /** 是否显示失败提示，默认 true */
  showFail?: boolean;
  /** 失败提示文字 支持多语言 */
  failHint?: string | (() => string);
  /** 失败提示选项 */
  failHintOption?: WechatMiniprogram.ShowToastOption;
  /** 失败时的全局处理函数 */
  failHandle?: (err: any) => void;
  /** 成功时的全局处理函数 */
  successHandle?: (res: any) => void;
}

const defaultOptions: Required<
  Omit<RequestOptions, "auth" | "failHandle" | "successHandle" | "baseURL">
> & {
  auth?: () => string;
  failHandle?: (err: any) => void;
  successHandle?: (res: any) => void;
  baseURL: string;
} = {
  baseURL: "",
  header: {},
  codeMap: {
    success: 200,
    unauth: 401,
  },
  authField: "Authorization",
  dataField: "data",
  codeField: "code",
  completeResponse: false,
  unauthClearToken: true,
  showLoading: false,
  loadingTitle: "",
  showFail: true,
  failHint: "",
  failHintOption: {
    title: "",
    icon: "none",
    duration: 2000,
  },
  clearToken: () => {},
  timeout: 10000,
};

class Request {
  private instanceOptions: typeof defaultOptions;

  constructor(options: RequestOptions) {
    this.instanceOptions = {
      ...defaultOptions,
      ...options,
      header: { ...defaultOptions.header, ...options.header },
      codeMap: { ...defaultOptions.codeMap, ...options.codeMap },
    };
  }

  /**
   * 合并请求选项
   */
  private mergeOptions(options?: RequestOptions): typeof defaultOptions {
    const merged = {
      ...this.instanceOptions,
      ...options,
      header: { ...this.instanceOptions.header, ...(options ? options.header : {}) },
      codeMap: { ...this.instanceOptions.codeMap, ...(options ? options.codeMap : {}) },
    };

    // 自动注入 Auth Token
    if (merged.auth && !merged.header[merged.authField]) {
      const token = merged.auth();
      if (token) {
        merged.header[merged.authField] = token;
      }
    }

    return merged;
  }

  /**
   * 核心请求方法
   */
  request<T = any>(
    url: string,
    method: RequestMethod = "GET",
    data: any = {},
    options?: RequestOptions,
  ): Promise<T> {
    const opt = this.mergeOptions(options);
    const fullUrl =
      opt.baseURL.endsWith("/") || url.startsWith("/")
        ? `${opt.baseURL}${url}`
        : `${opt.baseURL}/${url}`;

    if (opt.showLoading) {
      wx.showLoading({
        title:
          typeof opt.loadingTitle === "function"
            ? opt.loadingTitle()
            : opt.loadingTitle,
        mask: true,
      });
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url: fullUrl,
        method,
        data,
        header: opt.header,
        timeout: opt.timeout,
        success: (res: any) => {
          const { statusCode, data: body } = res;

          // 逻辑状态码判断
          const code = body[opt.codeField] !== undefined ? body[opt.codeField] : statusCode;

          if (code === opt.codeMap.success) {
            const result = opt.completeResponse
              ? res
              : (body[opt.dataField] !== undefined ? body[opt.dataField] : body);
            if (opt.successHandle) {
              opt.successHandle(res);
            }
            resolve(result as T);
          } else if (code === opt.codeMap.unauth) {
            if (opt.unauthClearToken) {
              opt.clearToken();
            }
            if (opt.showFail) {
              wx.showToast({
                ...opt.failHintOption,
                title:
                  typeof opt.failHint === "function"
                    ? opt.failHint()
                    : opt.failHint,
              });
            }

            reject(res);
          } else {
            if (opt.showFail) {
              wx.showToast({
                ...opt.failHintOption,
                title:
                  typeof opt.failHint === "function"
                    ? opt.failHint()
                    : opt.failHint,
              });
            }

            reject(res);
          }
        },
        fail: (err) => {
          if (opt.failHandle) {
            opt.failHandle(err);
          }
          reject(err);
        },
        complete: () => {
          if (opt.showLoading) {
            wx.hideLoading();
          }
        },
      });
    });
  }

  get<T = any>(url: string, data?: any, options?: RequestOptions) {
    return this.request<T>(url, "GET", data, options);
  }

  post<T = any>(url: string, data?: any, options?: RequestOptions) {
    return this.request<T>(url, "POST", data, options);
  }

  put<T = any>(url: string, data?: any, options?: RequestOptions) {
    return this.request<T>(url, "PUT", data, options);
  }

  delete<T = any>(url: string, data?: any, options?: RequestOptions) {
    return this.request<T>(url, "DELETE", data, options);
  }
}

export default Request;
