import { saveSettingsDebounced } from "../../../../../script.js";
import { extension_settings } from "../../../../extensions.js";

// 默认设置
const defaultSettings = {
  devMode: false, // 开发模式标志
  devServerUrl: "http://localhost:5173", // 开发服务器URL
  enablePlugin: false, // 是否启用插件
};

/**
 * 设置管理器类
 * 负责处理插件设置的加载、保存和UI交互
 */
class SettingsManager {
  /**
   * 创建设置管理器实例
   * @param {string} extensionName - 扩展名称
   * @param {Object} callbacks - 回调函数对象
   */
  constructor(extensionName, callbacks = {}) {
    this.extensionName = extensionName;
    this.callbacks = callbacks;
  }

  /**
   * 获取当前设置
   * @param {string} key - 设置键名
   * @param {any} defaultValue - 默认值
   * @returns {any} - 当前设置值
   */
  getSettings(key = "", defaultValue = undefined) {
    if (key === "") {
      return extension_settings[this.extensionName];
    }
    return extension_settings[this.extensionName][key] || defaultValue;
  }

  /**
   * 加载设置
   */
  loadSettings() {
    // 如果设置不存在，则创建设置
    extension_settings[this.extensionName] =
      extension_settings[this.extensionName] || {};

    // 使用默认设置初始化
    if (Object.keys(extension_settings[this.extensionName]).length === 0) {
      Object.assign(extension_settings[this.extensionName], defaultSettings);
    }

    // 更新启用插件设置
    // @ts-ignore
    $("#enable_plugin")
      .prop("checked", this.getSettings().enablePlugin)
      .trigger("input");

    // 更新开发模式设置
    // @ts-ignore
    $("#dev_mode_setting")
      .prop("checked", this.getSettings().devMode)
      .trigger("input");
  }

  /**
   * 保存设置
   */
  saveSettings() {
    saveSettingsDebounced();
  }

  /**
   * 设置单个设置项
   * @param {string} key - 设置键名
   * @param {any} value - 设置值
   */
  setSetting(key, value) {
    this.getSettings()[key] = value;
    this.saveSettings();
  }

  /**
   * 处理开发模式开关变更
   * @param {Event} event - 输入事件
   */
  onDevModeInput(event) {
    // @ts-ignore
    const value = $(event.target).prop("checked");
    this.setSetting("devMode", value);

    // 使用固定的开发服务器URL
    if (value) {
      this.setSetting("devServerUrl", "http://localhost:5173");
    }

    // 调用回调函数
    if (this.callbacks.onDevModeChange) {
      this.callbacks.onDevModeChange(value);
    }
  }

  /**
   * 处理启用插件变更
   * @param {Event} event - 输入事件
   */
  onEnablePluginInput(event) {
    // @ts-ignore
    const value = $(event.target).prop("checked");
    this.setSetting("enablePlugin", value);

    // 调用回调函数
    if (this.callbacks.onEnablePluginChange) {
      this.callbacks.onEnablePluginChange(value);
    }
  }

  /**
   * 绑定UI事件
   */
  bindEvents() {
    // 添加开发模式相关事件监听
    // @ts-ignore
    $("#dev_mode_setting").on("input", (e) => this.onDevModeInput(e));

    // 添加启用插件事件监听
    // @ts-ignore
    $("#enable_plugin").on("input", (e) => this.onEnablePluginInput(e));
  }
}
export default SettingsManager;
