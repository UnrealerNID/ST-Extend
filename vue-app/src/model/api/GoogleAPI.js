import { ref } from "vue";
/**
 * Google API密钥对象的基本结构
 * @typedef {Object} ApiKeyObject
 * @property {string} key - API密钥字符串
 * @property {boolean} enable - 是否启用此API密钥
 * @property {boolean} error - 是否存在错误
 * @property {string} errorInfo - 错误信息
 */
const API_KEY = {
  key: "", // API密钥字符串
  enable: false, // 是否启用此API密钥
  error: false, // 是否存在错误
  errorInfo: "", // 错误信息
};

/**
 * Google API管理类
 * 负责管理多个Google API密钥的添加、删除和更新
 */
class GoogleAPI {
  /**
   * 创建一个新的GoogleAPI实例
   */
  constructor(apiKeys = []) {
    /**
     * 存储API密钥对象的数组
     * @type {ApiKeyObject[]}
     */
    this.apiKeys = ref([...apiKeys]);
  }
  load() {
    this.apiKeys.value = settingsManager.getSettings("googleApiKeys", []);
  }

  /**
   * 添加新的API密钥
   * @returns {number} - 返回添加后的API密钥数组长度
   */
  addApiKey() {
    this.apiKeys.value.push({ ...API_KEY });
    return this.apiKeys.value.length;
  }

  /**
   * 移除指定索引的API密钥
   *
   * @param {number} index - 要移除的API密钥索引
   * @returns {ApiKeyObject[]} - 返回被移除的API密钥对象数组
   */
  removeApiKey(index) {
    return this.apiKeys.value.splice(index, 1);
  }

  /**
   * 更新指定索引的API密钥
   *
   * @param {number} index - 要更新的API密钥索引
   * @param {string} key - 新的API密钥字符串
   * @returns {void}
   */
  updateApiKey(index, key) {
    if (index >= 0 && index < this.apiKeys.value.length) {
      this.apiKeys.value[index].key = key;
    }
  }

  /**
   * 设置指定索引的API密钥启用状态
   *
   * @param {number} index - 要设置的API密钥索引
   * @param {boolean} enable - 是否启用
   * @returns {void}
   */
  setApiKeyEnable(index, enable) {
    if (index >= 0 && index < this.apiKeys.value.length) {
      this.apiKeys.value[index].enable = enable;
    }
  }

  /**
   * 设置指定索引的API密钥错误状态
   *
   * @param {number} index - 要设置的API密钥索引
   * @param {boolean} error - 是否有错误
   * @param {string} [errorInfo=""] - 错误信息
   * @returns {void}
   */
  setApiKeyError(index, error, errorInfo = "") {
    if (index >= 0 && index < this.apiKeys.value.length) {
      this.apiKeys.value[index].error = error;
      this.apiKeys.value[index].errorInfo = errorInfo;
    }
  }
}

export default GoogleAPI;
