import PluginSetting from "../utils/plugin-setting.js";
import GoogleAPI from "../models/google-api/google-api.js";
const google_api = new GoogleAPI();
/**
 * 插件管理器
 */
class PluginManager {
  constructor() {
    this.isRegistered = false;
    this.components = [];
  }
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
    // 根据插件启用状态决定是否注册组件
    const isEnabled = PluginSetting.getSetting("enablePlugin", true);
    this.registerComponents(isEnabled);
  }
  /**
   * 注册或卸载所有组件
   * @param {boolean} register - 是否注册组件
   */
  registerComponents(register = true) {
    if (!register) {
      this.unregisterComponents();
      return;
    }
    if (this.isRegistered) return;
    // 更新轮询设置
    this.googleApiRegister(PluginSetting.getSetting("enableGoogleApi", true));

    this.isRegistered = true;
    console.log(`${PluginSetting.extensionName} 组件已注册`);
  }

  /**
   * 卸载所有组件
   */
  unregisterComponents() {
    if (!this.isRegistered) return;

    // 卸载所有组件
    this.components.forEach((component) => {
      if (typeof component.unregister === "function") {
        component.unregister();
      }
    });

    this.components = [];
    this.isRegistered = false;
    console.log(`${PluginSetting.extensionName} 组件已卸载`);
  }

  /**
   * 绑定UI事件
   */
  bindEvents() {
    // 添加启用插件事件监听
    $("#enable_plugin").on("input", (e) => this.onEnablePluginInput(e));
    // 添加启用轮询事件监听
    $("#enable_google_api").on("input", (e) => this.onEnableGoogleApiInput(e));
  }
  /**
   * 处理启用插件变更
   * @param {Event} event - 输入事件
   */
  onEnablePluginInput(event) {
    const value = $(event.target).prop("checked");
    PluginSetting.setSetting("enablePlugin", value);
    // 根据启用状态注册或卸载组件
    this.registerComponents(value);
  }
  /**
   * 处理启用轮询变更
   * @param {Event} event - 输入事件
   */
  onEnableGoogleApiInput(event) {
    const value = $(event.target).prop("checked");
    PluginSetting.setSetting("enableGoogleApi", value);
    // 根据启用状态注册或卸载组件
    this.googleApiRegister(value, true);
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
   * 注册或卸载Google API组件
   * @param {boolean} register - 是否注册组件
   * @param {boolean} [notify=false] - 是否显示通知
   */
  googleApiRegister(register = true, notify = false) {
    if (!register) {
      google_api.unregister();
      notify && toastr.success("Google API 组件已卸载");
      return;
    }
    google_api.register("#makersuite_form");
    notify && toastr.success("Google API 组件已注册");
  }
}
export default PluginManager;
