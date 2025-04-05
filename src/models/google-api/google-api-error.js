import ToastrCapture from "../../utils/toastr-capture.js";

// 错误类型定义
const GOOGLE_ERROR = {
  NO_CANDIDATE: {
    error: "Google AI Studio API returned no candidate",
    solution: "本次输出被截断，请关闭流式传输",
  },
  TOO_MANY_REQUESTS: {
    error: "Too Many Requests",
    solution: "重刷过于频繁，等待一分钟，若无效则本日请求已达上限",
  },
  INTERNAL_SERVER_ERROR: {
    error: "Internal Server Error",
    solution: "检查网络环境，PC端开启服务模式和TUN模式，删除反向代理地址",
  },
  INVALID_API_KEY: {
    error: "API key not valid. Please pass a valid API key",
    solution: "API返回错误，检查API是否可用",
  },
  LOCATION_NOT_SUPPORTED: {
    error: "User location is not supported for the API use",
    solution: "节点处于被限制的国家，请更换节点(美国最优先)",
  },
  LOCATION_NOT_SUPPORTED_BILLING: {
    error:
      "User location is not supported for the API use without a billing account linked.",
    solution: "处在Google政策限制免费层级的地区(如英国、意大利)",
  },
  BAD_REQUEST: {
    error: "Bad request",
    solution: "网络环境出错或API已死（账号或项目被封禁）",
  },
  FORBIDDEN: {
    error: "Forbidden",
    solution: "账号或项目被封禁，API key无法调用",
  },
  NOT_FOUND: {
    error: "Not Found",
    solution: "模型选择错误，请不要选择除Gemini系外的模型或Gemini Ultra",
  },
  RESOURCE_EXHAUSTED: {
    error: "Resource has been exhausted",
    solution:
      "撞到速率上限了，请等一会，若还是出现此报错请将最大上下文调整至50k以下",
  },
  API_KEY_EXPIRED: {
    error: "API key expired. Please renew the API key",
    solution: "API key已过期或被删除",
  },
  MODEL_OVERLOADED: {
    error: "The model is overloaded. Please try later",
    solution: "此模型暂时闭馆微调，暂停开放，请换用别的模型或等待一段时间",
  },
  INVALID_ROLE: {
    error: "Please use a valid role: user, model.",
    solution: "你使用了需要打补丁的预设，请换不需要补丁的预设或打补丁",
  },
  CONSUMER_SUSPENDED: {
    error: "Permission denied: Consumer has been suspended.",
    solution: "谷歌账号被封禁",
  },
  EMPTY_CANDIDATE: {
    error: "MakerSuite Candidate text empty",
    solution:
      "输出被截断，关闭一些全局世界书/更改输入内容/换版本更新一点的预设",
  },
};

// 优化后的错误监听配置
const TOASTR_ERROR = Object.values(GOOGLE_ERROR).map((error) => ({
  type: "error",
  message: error.error,
  ref: error,
}));

/**
 * Google API 错误处理类
 */
class GoogleAPIError {
  /**
   * 构造函数
   * @param {Object} googleAPI - GoogleAPI实例的引用
   */
  constructor(googleAPI) {
    this._googleAPI = googleAPI;
    this._toastrId = [];
  }
  /**
   * 开始监听Google API错误
   */
  startListening() {
    // 清除之前的监听器
    this.clearListeners();

    // 为每个错误类型添加监听器
    TOASTR_ERROR.forEach((errorFilter) => {
      const listenerId = ToastrCapture.addListener((toast) => {
        // 直接使用引用获取错误对象
        if (toast.message === errorFilter.message) {
          const error = errorFilter.ref;
          console.log(`捕获到Google API错误: ${error.error}`);
          console.log(`解决方案: ${error.solution}`);

          //   // 查找错误类型
          //   const errorType = Object.keys(GOOGLE_ERROR).find(
          //     (key) => GOOGLE_ERROR[key] === error
          //   );

          //   // 调用通用错误处理
          //   this._handleApiError(error);
        }
      }, errorFilter);

      // 保存监听器ID以便后续清理
      this._toastrId.push(listenerId);
    });

    return this;
  }

  /**
   * 清除所有错误监听器
   */
  clearListeners() {
    if (this._toastrId && this._toastrId.length > 0) {
      this._toastrId.forEach((id) => {
        ToastrCapture.removeListener(id);
      });
      this._toastrId = [];
    }
    return this;
  }

  /**
   * 处理API错误
   * @param {Object} error - 错误对象
   * @private
   */
  _handleApiError(error) {
    // 获取当前API密钥
    const currentSettings = this._googleAPI.getSettings();
    const currentKeyIndex = currentSettings.CURRY_INDEX;
    const apiKeys = currentSettings.API_KEY;

    if (apiKeys && apiKeys[currentKeyIndex]) {
      // 标记当前密钥为错误状态
      apiKeys[currentKeyIndex].error = true;
      apiKeys[
        currentKeyIndex
      ].errorMessage = `${error.error} - ${error.solution}`;

      // 更新设置
      this._googleAPI.updateSettings({
        ...currentSettings,
        API_KEY: apiKeys,
      });
    }
  }

  /**
   * 获取所有已知的错误类型
   * @returns {Object} - 错误类型对象
   */
  static get ERROR_TYPES() {
    return GOOGLE_ERROR;
  }
}

export default GoogleAPIError;
