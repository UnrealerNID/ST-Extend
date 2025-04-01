import PluginSetting from "../utils/plugin-setting.js";
import GoogleAPI from "../models/google-api/google-api.js";
const google_api = new GoogleAPI();
/**
 * 插件管理器
 */
class PluginManager {
  /**
   * 注册插件加载器
   * 将插件加载器实例注册到全局变量中，以便其他模块使用
   */
  register() {
    window[PluginSetting.extensionName] =
      window[PluginSetting.extensionName] || {};
    window[PluginSetting.extensionName]["plugin_manager"] = this;
    console.log(`插件加载器 ${PluginSetting.extensionName} 已注册`);

    this.bindEvents();
    this.loadSettings();
    google_api.register("#makersuite_form");
  }

  /**
   * 绑定UI事件
   */
  bindEvents() {
    // 添加启用插件事件监听
    $("#enable_plugin").on("input", (/** @type {Event} */ e) =>
      this.onEnablePluginInput(e)
    );
  }
  /**
   * 处理启用插件变更
   * @param {Event} event - 输入事件
   */
  onEnablePluginInput(event) {
    const value = $(event.target).prop("checked");
    PluginSetting.setSetting("enablePlugin", value);
  }
  /**
   * 加载设置
   */
  loadSettings() {
    PluginSetting.initSettings();
    // 更新启用插件设置
    $("#enable_plugin")
      .prop("checked", PluginSetting.getSetting("enablePlugin", false))
      .trigger("input");
  }
  /**
   * 处理错误
   * @param {Error} error - 错误对象
   * @param {string} message - 错误消息
   */
  handleError(error, message) {
    console.error(message, error);
    toastr.error(message, "错误");
  }
}
export default PluginManager;
