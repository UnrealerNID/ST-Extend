import PluginSetting from "../utils/plugin-setting.js";
import GoogleAPI from "../models/google-api/google-api.js";
import EventHandler from "../utils/event-handler.js";
import MessageProcess from "../models/message-process/message-process.js";
const google_api = new GoogleAPI();
const message_processing = new MessageProcess();
/**
 * 插件管理器
 */
class PluginManager {
  constructor() {
    this._isInitialized = false;
    this._enabledPlugin = false;
    this._enabledGoogleApi = false;
    this._enabledMessageProcessing = false;
    this._isRegistered = false;
    this._components = new Map();
  }
  /**
   * 初始化插件管理器
   */
  init() {
    console.log(`${PluginSetting.extensionName} 初始化`);
    EventHandler.bindEvent("#enable_plugin", "input", (e) =>
      this.onEnablePluginInput(e)
    );
    this.loadSettings();
    if (this._enabledPlugin) {
      this.register();
    }
    this._isInitialized = true;
  }
  /**
   * 注册插件加载器
   * 将插件加载器实例注册到全局变量中，以便其他模块使用
   */
  register(notify = false) {
    if (this._isRegistered) {
      return;
    }
    this.bindEvents();
    this.registerComponents();
    window[PluginSetting.extensionName] =
      window[PluginSetting.extensionName] || {};
    window[PluginSetting.extensionName]["plugin_manager"] = this;
    console.log(`${PluginSetting.extensionName} 已注册`);
    notify && toastr.success(`${PluginSetting.extensionName} 已注册`);
    this._isRegistered = true;
  }
  /**
   * 卸载插件加载器
   * 卸载插件加载器实例
   */
  unregister(notify = false) {
    if (!this._isRegistered) {
      return;
    }
    // this.unbindEvents();
    this.unregisterComponents();
    window[PluginSetting.extensionName] =
      window[PluginSetting.extensionName] || {};
    window[PluginSetting.extensionName]["plugin_manager"] = null;
    console.log(`插件加载器 ${PluginSetting.extensionName} 已卸载`);
    notify && toastr.success(`${PluginSetting.extensionName} 组件已卸载`);
    this._isRegistered = false;
  }
  /**
   * 注册所有组件
   */
  registerComponents() {
    // 更新轮询设置
    this.manageComponent(
      "google_api",
      google_api,
      this._enabledGoogleApi,
      "#makersuite_form",
      false,
      "Google API 组件已注册",
      "Google API 组件已卸载"
    );
    // 消息处理组件
    this.manageComponent(
      "message_processing",
      message_processing,
      this._enabledMessageProcessing,
      "#extensionsMenu",
      false,
      "消息处理组件已注册",
      "消息处理组件已卸载"
    );
  }

  /**
   * 卸载所有组件
   */
  unregisterComponents() {
    // 卸载所有组件
    this._components.forEach((component) => {
      if (typeof component.unregister === "function") {
        component.unregister();
      }
    });

    this._components.clear();
  }

  /**
   * 绑定UI事件
   */
  bindEvents() {
    // 添加启用轮询事件监听
    EventHandler.bindEvent("#enable_google_api", "input", (e) =>
      this.onEnableGoogleApiInput(e)
    );
  }
  /**
   * 解绑UI事件
   */
  unbindEvents() {
    // 移除启用轮询事件监听
    EventHandler.unbindEvent("#enable_google_api", "input");
  }
  /**
   * 加载设置
   */
  loadSettings() {
    PluginSetting.initSettings();
    this._enabledPlugin = PluginSetting.getSetting("enabledPlugin", true);
    this._enabledGoogleApi = PluginSetting.getSetting("enabledGoogleApi", true);
    // 更新启用插件设置
    EventHandler.propEvent("#enable_plugin", "checked", this._enabledPlugin);
    // 更新启用轮询设置
    EventHandler.propEvent(
      "#enable_google_api",
      "checked",
      this._enabledGoogleApi
    );
  }
  /**
   * 保存设置
   * @param {string} key - 设置键名
   * @param {any} value - 设置值
   */
  save(key, value) {
    console.log(`保存设置: ${key} = ${value}`);
    this[`_${key}`] = value;
    PluginSetting.setSetting(key, value);
  }
  /**
   * 处理启用插件变更
   * @param {Event} event - 输入事件
   */
  onEnablePluginInput(event) {
    EventHandler.handleEvent({
      event,
      prop: "checked",
      func: (key, value) => this.save(key, value),
      settingKey: "enabledPlugin",
      callback: (value) => {
        value ? this.register(true) : this.unregister(true);
      },
    });
  }
  /**
   * 处理启用轮询变更
   * @param {Event} event - 输入事件
   */
  onEnableGoogleApiInput(event) {
    EventHandler.handleEvent({
      event,
      prop: "checked",
      func: (key, value) => this.save(key, value),
      settingKey: "enabledGoogleApi",
      callback: (value) => {
        this.manageComponent(
          "google_api",
          google_api,
          value,
          "#makersuite_form",
          true,
          "Google API 组件已注册",
          "Google API 组件已卸载"
        );
      },
    });
  }

  /**
   * 通用组件注册或卸载方法
   * @param {string} componentName - 组件名称
   * @param {Object} component - 组件实例
   * @param {boolean} register - 是否注册组件
   * @param {string} selector - 注册时的选择器（如果需要）
   * @param {boolean} [notify=false] - 是否显示通知
   * @param {string} [registerMsg] - 注册成功消息
   * @param {string} [unregisterMsg] - 卸载成功消息
   * @returns {boolean} - 操作是否成功
   */
  manageComponent(
    componentName,
    component,
    register,
    selector,
    notify = false,
    registerMsg,
    unregisterMsg
  ) {
    if (!this._enabledPlugin) return;
    // 卸载逻辑
    if (!register) {
      if (!this._components.has(componentName)) {
        return false;
      }
      if (typeof component.unregister === "function") {
        component.unregister();
      }
      notify && toastr.success(unregisterMsg || `${componentName} 组件已卸载`);
      this._components.delete(componentName);
      return true;
    }
    if (!this._enabledPlugin) return;
    // 注册逻辑
    if (this._components.has(componentName)) {
      return false;
    }
    if (typeof component.register === "function") {
      component.register(selector);
    }
    notify && toastr.success(registerMsg || `${componentName} 组件已注册`);
    this._components.set(componentName, component);
    return true;
  }
}
export default PluginManager;
