import STEvent from "./st/st-event.js";
import Extensions from "./st/extensions.js";
import OpenAI from "./st/openai.js";
import Popup from "./st/popup.js";
import Secrets from "./st/secrets.js";
/**
 * 插件设置管理类
 */

class ExtendUtils {
  static extensionName = "ST-Extend";
  static extensionFolderPath = `scripts/extensions/third-party/${this.extensionName}`;
  static defaultSettings = {
    enableExtend: false, // 是否启用插件
  };
  /**
   * 获取扩展内的文件路径
   * @param {...string} paths - 路径片段
   * @returns {string} 完整路径
   */
  static getExtensionPath(...paths) {
    return [this.extensionFolderPath, ...paths].join("/");
  }
  static getContext() {
    return Extensions.getContext();
  }
  /**
   * 初始化设置
   * @returns {Object} - 当前设置
   */
  static initSettings() {
    // 使用Extensions初始化设置
    return Extensions.initSettings(this.extensionName, this.defaultSettings);
  }

  /**
   * 获取设置值
   * @param {string} key - 设置键名
   * @param {any} defaultValue - 默认值
   * @returns {any} - 设置值
   */
  static getSetting(key, defaultValue = null) {
    const value = Extensions.getSettings(this.extensionName, key);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * 设置设置值
   * @param {string} key - 设置键名
   * @param {any} value - 设置值
   */
  static setSetting(key, value) {
    Extensions.setSettings(this.extensionName, key, value);
  }

  /**
   * 获取OpenAI设置
   */
  static getOaiSettings() {
    return OpenAI.getSettings();
  }
  /**
   * 调用通用弹窗
   * @param {HTMLElement|string} html - 弹窗内容
   * @param {string} type - 弹窗类型
   *   - TEXT: 包含任何显示内容的主弹窗，下方有按钮。也可以包含额外的输入控件
   *   - CONFIRM: 主要用于确认某事的弹窗，用简单的是/否或类似方式回答。重点在按钮控件
   *   - INPUT: 主要焦点是输入文本字段的弹窗，在此显示。可以在上方包含额外内容。返回值是输入字符串
   *   - DISPLAY: 没有任何按钮控件的弹窗。用于简单显示内容，角落有一个小X
   *   - CROP: 显示要裁剪的图像的弹窗。结果返回裁剪后的图像
   * @param {string} title - 输入值/标题
   * @param {import('./st/popup.js').PopupOptions} options - 弹窗选项
   * @returns {Promise<any>} 弹窗结果
   */
  static callGenericPopup(html, type, title = "", options = {}) {
    return Popup.callGenericPopup(html, type, title, options);
  }
  static POPUP_RESULT = Popup.POPUP_RESULT;

  /**
   * 获取密钥
   * @returns {Promise<Object>} - 密钥对象
   */
  static async getSecrets() {
    return await Secrets.getSecrets();
  }
  /**
   * 设置密钥
   * @param {string} key - 密钥
   * @param {string} value - 密钥值
   */
  static async setSecrets(key, value) {
    return await Secrets.setSecrets(key, value);
  }
  /**
   * 监听事件
   * @param {string|symbol} eventType - 事件类型，可以是event_types中的常量
   * @param {Function} callback - 事件处理函数
   */
  static eventOn(eventType, callback) {
    return STEvent.on(eventType, callback);
  }
  /**
   * 移除事件监听器
   * @param {string|symbol} eventType - 事件类型，可以是event_types中的常量
   * @param {Function} callback - 事件处理函数
   */
  static eventOff(eventType, callback) {
    return STEvent.off(eventType, callback);
  }
}

export default ExtendUtils;
