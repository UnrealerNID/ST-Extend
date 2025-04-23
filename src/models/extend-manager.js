import GoogleAPI from "./google-api/google-api.js";
import DOMEventHandler from "../utils/ui/dom-event-handler.js";
import ExtendUtils from "../utils/extend-utils.js";
import TemplateLoader from "../utils/ui/template-loader.js";
const google_api = new GoogleAPI();
/**
 * 插件管理器
 */
class ExtendManager {
  constructor() {
    this._isInitialized = false;
    this._enabledExtend = false;
    this._enabledGoogleApi = false;
    this._isRegistered = false;
    this._components = new Map();
    this._container = null;
  }
  /**
   * 初始化插件管理器
   */
  init() {
    console.log(`${ExtendUtils.extensionName} 初始化`);
    this._mountTemplate();
    this._isInitialized = true;
  }
  /**
   * 挂载模板
   */
  _mountTemplate() {
    const templatePath = ExtendUtils.getExtensionPath(
      "public",
      "html",
      "extend-manager.html"
    );
    // 挂载模板
    TemplateLoader.mountTemplate(
      templatePath,
      "#st-extend .inline-drawer-content",
      "extend_manager",
      (container) => this._init(container),
      (error) => {
        console.error("加载插件管理器模板失败:", error);
      }
    );
  }
  /**
   * 初始化插件管理器
   * @param {HTMLElement} container - 挂载的容器元素
   */
  _init(container) {
    this._container = container;
    this._load();
    this._isInitialized = true;
  }

  /**
   * 获取事件映射配置
   * @returns {Object} 事件映射配置
   */
  _eventMappings() {
    return {
      enable_extend: {
        selector: "#enable_extend",
        event: "change",
        setting: "enabledExtend",
        prop: "checked",
        defaultValue: true,
        callback: (value) =>
          value ? this.register(true) : this.unregister(true),
      },
      enable_google_api: {
        selector: "#enable_google_api",
        event: "input",
        setting: "enabledGoogleApi",
        prop: "value",
        defaultValue: false,
        callback: (value) =>
          this.manageComponent(
            "google_api",
            google_api,
            value,
            "#makersuite_form",
            true,
            "Google API 组件已注册",
            "Google API 组件已卸载"
          ),
      },
    };
  }
  /**
   * 检查是否应该执行回调
   * @param {string} key - 事件标识符
   * @returns {boolean} 是否应该执行回调
   */
  _shouldRunCallback(key) {
    return (
      ["enable_extend", "enable_dev_mode"].includes(key) || this._enabledExtend
    );
  }

  /**
   * 执行回调（如果满足条件）
   * @param {string} key - 事件标识符
   * @param {Function} callback - 回调函数
   * @param {*} value - 传递给回调的值
   */
  _executeCallback(key, callback, value) {
    if (callback && this._shouldRunCallback(key)) {
      callback(value);
    }
  }
  _handleEvent(key, event) {
    const mappings = this._eventMappings();
    if (key in mappings) {
      const mapping = mappings[key];
      console.log("处理事件:", key, mapping);

      DOMEventHandler.handleEvent({
        event,
        prop: mapping.prop,
        func: (key, value) => this.save(key, value),
        settingKey: mapping.setting,
        callback: this._shouldRunCallback(key) ? mapping.callback : null,
      });
    } else {
      console.warn(`未找到事件处理方法: ${key}`);
    }
  }
  _load() {
    ExtendUtils.initSettings();
    const mappings = this._eventMappings();
    // 使用映射处理设置加载和事件绑定
    Object.entries(mappings).forEach(([key, mapping]) => {
      const settingKey = `_${mapping.setting}`;
      // 加载设置
      this[settingKey] = ExtendUtils.getSetting(
        mapping.setting,
        mapping.defaultValue
      );
      // 绑定事件
      DOMEventHandler.bind(mapping.selector, mapping.event, (e) =>
        this._handleEvent(key, e)
      );
      // 更新UI状态
      DOMEventHandler.propEvent(
        mapping.selector,
        mapping.prop,
        this[settingKey]
      );
      // 执行回调（如果满足条件）
      this._executeCallback(key, mapping.callback, this[settingKey]);
    });
  }
  /**
   * 注册插件加载器
   * 将插件加载器实例注册到全局变量中，以便其他模块使用
   */
  register(notify = false) {
    if (this._isRegistered) {
      return;
    }
    this._load();
    this._registerComponents();
    window[ExtendUtils.extensionName] = window[ExtendUtils.extensionName] || {};
    window[ExtendUtils.extensionName]["extend_manager"] = this;
    console.log(`${ExtendUtils.extensionName} 已注册`);
    notify && toastr.success(`${ExtendUtils.extensionName} 已注册`);
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
    this.unregisterComponents();
    window[ExtendUtils.extensionName] = window[ExtendUtils.extensionName] || {};
    window[ExtendUtils.extensionName]["extend_manager"] = null;
    console.log(`插件加载器 ${ExtendUtils.extensionName} 已卸载`);
    notify && toastr.success(`${ExtendUtils.extensionName} 组件已卸载`);
    this._isRegistered = false;
  }
  /**
   * 注册所有组件
   */
  _registerComponents() {
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
   * 解绑UI事件
   */
  unbindEvents() {
    // 移除启用轮询事件监听
    DOMEventHandler.unbind("#enable_google_api", "input");
  }

  /**
   * 保存设置
   * @param {string} key - 设置键名
   * @param {any} value - 设置值
   */
  save(key, value) {
    this[`_${key}`] = value;
    ExtendUtils.setSetting(key, value);
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
    if (!this._enabledExtend) return;
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
    if (!this._enabledExtend) return;
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
export default ExtendManager;
