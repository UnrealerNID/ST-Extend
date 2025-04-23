import {
  extension_settings,
  getContext,
} from "../../../../../../extensions.js";
import { saveSettingsDebounced } from "../../../../../../../script.js";

/**
 * Extensions - 提供与SillyTavern核心功能交互的方法
 */
class Extensions {
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
  static getContext() {
    return getContext();
  }
}

export default Extensions;
