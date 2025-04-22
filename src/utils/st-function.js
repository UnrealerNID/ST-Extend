import {
  eventSource,
  event_types,
  saveSettingsDebounced,
} from "../../../../../../script.js";
import { extension_settings, getContext } from "../../../../../extensions.js";
import {
  callGenericPopup,
  POPUP_RESULT,
  POPUP_TYPE,
} from "../../../../../popup.js";
import Secrets from "./st/secrets.js";
import { oai_settings } from "../../../../../openai.js";

/**
 * SillyTavern 扩展功能工具类
 * 提供与SillyTavern核心功能交互的方法
 */
class STFunction {
  static getContext() {
    return getContext();
  }
  /**
   * 获取扩展设置
   * @param {string} extensionName - 扩展名称
   * @param {string|null} key - 设置键名，如果为null则返回整个设置对象
   * @returns {any} - 设置值或整个设置对象
   */
  static getSettings(extensionName, key = null) {
    // 确保扩展设置存在
    if (!extension_settings[extensionName]) {
      extension_settings[extensionName] = {};
    }

    // 返回特定键值或整个设置对象
    if (key !== null) {
      return extension_settings[extensionName][key];
    }
    return extension_settings[extensionName];
  }

  /**
   * 设置扩展设置
   * @param {string} extensionName - 扩展名称
   * @param {string} key - 设置键名
   * @param {any} value - 设置值
   */
  static setSettings(extensionName, key, value) {
    // 确保扩展设置存在
    if (!extension_settings[extensionName]) {
      extension_settings[extensionName] = {};
    }

    // 设置值并保存
    extension_settings[extensionName][key] = value;
    saveSettingsDebounced();
  }

  /**
   * 初始化扩展设置
   * @param {string} extensionName - 扩展名称
   * @param {Object} defaultSettings - 默认设置
   */
  static initSettings(extensionName, defaultSettings = {}) {
    // 确保扩展设置存在
    if (!extension_settings[extensionName]) {
      extension_settings[extensionName] = {};
    }

    // 使用默认设置初始化
    const currentSettings = extension_settings[extensionName];
    for (const [key, value] of Object.entries(defaultSettings)) {
      if (currentSettings[key] === undefined) {
        currentSettings[key] = value;
      }
    }

    saveSettingsDebounced();
    return currentSettings;
  }
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
  static addEventListener(eventType, callback) {
    // 如果传入的是事件类型的字符串名称，则从event_types中获取对应的值
    const eventKey =
      typeof eventType === "string" && event_types[eventType]
        ? event_types[eventType]
        : eventType;
    eventSource.on(eventKey, callback);
  }
  /**
   * 移除事件监听器
   * @param {string|symbol} eventType - 事件类型，可以是event_types中的常量
   * @param {Function} callback - 事件处理函数
   */
  static removeEventListener(eventType, callback) {
    // 如果传入的是事件类型的字符串名称，则从event_types中获取对应的值
    const eventKey =
      typeof eventType === "string" && event_types[eventType]
        ? event_types[eventType]
        : eventType;
    eventSource.removeListener(eventKey, callback);
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
   * @param {import("../../../../../popup.js").PopupOptions} options - 弹窗选项
   * @returns {Promise<any>} 弹窗结果
   */
  static callGenericPopup(html, type, title = "", options = {}) {
    return callGenericPopup(html, POPUP_TYPE[type], title, options);
  }
  static POPUP_RESULT = POPUP_RESULT;

  static oai_settings = oai_settings;
}

export default STFunction;
