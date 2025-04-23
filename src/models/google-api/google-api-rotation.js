import ExtendUtils from "../../utils/extend-utils.js";
import GoogleAPI from "./google-api.js";

/**
 * GoogleApiRotation - Google API轮询管理类
 */

class GoogleApiRotation {
  /**
   * 创建GoogleAPI模型实例
   * @param {GoogleAPI} apiManager - Google API管理器实例
   */
  constructor(apiManager) {
    this._apiManager = apiManager;
  }
  /**
   * 轮替API密钥
   */
  switchApiKey() {
    // 如果未启用轮询，直接返回
    if (!this._apiManager.rotationEnabled) return;
    // 获取所有可用的API密钥
    const activeApiKeys = this._apiManager.apiKeys;
    // 如果没有可用的API密钥
    if (activeApiKeys.length === 0) {
      toastr.error("没有可用的API密钥", "错误");
      return;
    }
    let key = null;
    let loopCount = 0;
    let currentIndex = this._apiManager.currentIndex;
    while (loopCount < activeApiKeys.length) {
      currentIndex = (currentIndex + 1) % activeApiKeys.length;
      const apiKey = activeApiKeys[currentIndex];
      if (apiKey && apiKey.enabled && apiKey.key !== "") {
        key = apiKey.key;
        break;
      }
      loopCount++;
    }

    // 如果没有找到可用的API密钥
    if (!key) {
      toastr.error("没有可用的API密钥", "错误");
      return;
    }
    // 设置API密钥
    ExtendUtils.setSecrets("api_key_makersuite", key);

    // 设置API密钥
    this._apiManager.currentApiKey = key;
    this._apiManager.currentIndex = currentIndex;
    this._apiManager.setActiveApiKey(currentIndex);
  }
}
export default GoogleApiRotation;
