import STFunction from "./st-function.js";
/**
 * 插件设置管理类
 */
class PluginSetting {
  static extensionName = "Plugins";
  static extensionFolderPath = `scripts/extensions/third-party/${this.extensionName}`;
  static defaultSettings = {
    enablePlugin: false, // 是否启用插件
  };
  /**
   * 初始化设置
   * @returns {Object} - 当前设置
   */
  static initSettings() {
    // 使用STFunction初始化设置
    return STFunction.initSettings(this.extensionName, this.defaultSettings);
  }

  /**
   * 获取设置值
   * @param {string} key - 设置键名
   * @param {any} defaultValue - 默认值
   * @returns {any} - 设置值
   */
  static getSetting(key, defaultValue = null) {
    const value = STFunction.getSettings(this.extensionName, key);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * 设置设置值
   * @param {string} key - 设置键名
   * @param {any} value - 设置值
   */
  static setSetting(key, value) {
    STFunction.setSettings(this.extensionName, key, value);
  }
}

export default PluginSetting;
