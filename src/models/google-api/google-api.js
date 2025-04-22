import PluginSetting from "../../utils/plugin-setting.js";
import STFunction from "../../utils/st-function.js";
import GoogleAPIUI from "./google-api-ui.js";
import GoogleAPIError from "./google-api-error.js";
import GoogleApiModel from "./google-api-model.js";
import GoogleApiRotation from "./google-api-rotation.js";
// 默认API密钥
const DEFAULT_API_KEY = {
  key: "",
  enabled: true,
  isActive: false,
  index: 0,
};
// 默认设置
const DEFAULT_SETTINGS = {
  ROTATION_ENABLED: true, // 是否启用轮询
  USAGE_ENABLED: true, // 是否启用API统计
  ERROR_ENABLED: true, // 是否启用错误处理
  API_KEY: [DEFAULT_API_KEY], // API密钥列表
  CURRY_INDEX: 0, // 当前API密钥索引
  MODELS: [], // 模型列表
  CURRY_MODEL: "", // 当前模型
  TOASTR_ID: [], // toastr ID列表
};

/**
 * GoogleAPI - Google API设置界面管理类
 */
class GoogleAPI {
  constructor() {
    this._rotationEnabled = DEFAULT_SETTINGS.ROTATION_ENABLED; // 是否启用轮询
    this._usageEnabled = DEFAULT_SETTINGS.USAGE_ENABLED; // 是否启用API统计
    this._errorEnabled = DEFAULT_SETTINGS.ERROR_ENABLED; // 是否启用错误处理
    this._apiKey = DEFAULT_SETTINGS.API_KEY; // API密钥列表
    this._currentApiKey = null; // 当前API密钥
    this._currentIndex = DEFAULT_SETTINGS.CURRY_INDEX; // 当前API密钥索引
    this._models = DEFAULT_SETTINGS.MODELS; // 模型列表
    this._curryModel = DEFAULT_SETTINGS.CURRY_MODEL; // 当前模型
    this._toastrId = DEFAULT_SETTINGS.TOASTR_ID; // toastr ID列表
    this._apiUI = new GoogleAPIUI(this); // UI实例
    this._apiModel = new GoogleApiModel(this); // 模型实例
    this._apiError = new GoogleAPIError(this); // API错误处理实例
    this._apiRotation = new GoogleApiRotation(this); // API轮询实例
  }
  /**
   * 注册并初始化
   * @param {string|HTMLElement} [containerSelector='#extensions_settings'] - 容器选择器或元素
   */
  async register(containerSelector = "#extensions_settings") {
    await this.load();
    this._apiUI.initTemplate(containerSelector);
    this._registerEventListeners();
    // 开始监听错误
    this._apiError.startListening();
  }
  /**
   * 注册事件监听器
   * @private
   */
  _registerEventListeners() {
    // 注册事件监听器
    STFunction.addEventListener("CHAT_COMPLETION_SETTINGS_READY", () => {
      this._apiRotation.switchApiKey();
    });
    STFunction.addEventListener("CHATCOMPLETION_MODEL_CHANGED", () => {
      this.updateCurrentModel();
    });
  }
  /**
   * 卸载并清理资源
   */
  unregister() {
    // 清除错误监听
    this._apiError.clearListeners();
    // 移除事件监听器
    STFunction.removeEventListener("CHAT_COMPLETION_SETTINGS_READY", () => {
      this._apiRotation.switchApiKey();
    });
    STFunction.removeEventListener("CHATCOMPLETION_MODEL_CHANGED", () => {
      this.updateCurrentModel();
    });
    // 清理UI
    if (this._apiUI) {
      this._apiUI.removeTemplate();
    }

    console.log("Google API 组件已卸载");
  }
  /**
   * 加载保存的API密钥
   */
  async load() {
    const settings = PluginSetting.getSetting(
      "google_api_settings",
      DEFAULT_SETTINGS
    );
    // 加载设置
    this._rotationEnabled = settings.ROTATION_ENABLED;
    this._usageEnabled = settings.USAGE_ENABLED;
    this._errorEnabled = settings.ERROR_ENABLED;
    this._apiKey = settings.API_KEY;
    this._currentIndex = settings.CURRY_INDEX;
    this._currentApiKey = this._apiKey?.[this._currentIndex]?.key;
    this._models = settings.MODELS;
    this._curryModel = settings.CURRY_MODEL;
    this._toastrId = settings.TOASTR_ID;
    // 如果没有API密钥，从ST获取
    if (this._apiKey?.length === 1 && this._apiKey[0].key === "") {
      const result = await STFunction.getSecrets();
      if (result && result.api_key_makersuite) {
        this._apiKey[0] = {
          ...DEFAULT_API_KEY,
          key: result.api_key_makersuite,
          index: 0,
          enabled: true,
          isActive: true,
        };
        this._currentApiKey = result.api_key_makersuite;
        this.save();
      }
    }
    if (this._models?.length > 0) {
      this._apiUI.updateModelsList(this._models);
      // 更新UI选择
      this._apiUI.setSelectedModel(this._curryModel, this._models);
    }
  }

  /**
   * 保存API密钥
   */
  save() {
    PluginSetting.setSetting("google_api_settings", {
      API_KEY: this._apiKey,
      CURRY_INDEX: this._currentIndex,
      ROTATION_ENABLED: this._rotationEnabled,
      USAGE_ENABLED: this._usageEnabled,
      ERROR_ENABLED: this._errorEnabled,
      MODELS: this._models,
      CURRY_MODEL: this._curryModel,
      TOASTR_ID: this._toastrId,
    });
  }
  /**
   * 切换所有API密钥的启用状态
   * @param {boolean} enabled - 是否启用
   */
  toggleAllApiKeys(enabled) {
    this._apiKey.forEach((api) => {
      api.enabled = enabled;
    });
    this.save();
    this._apiUI.refresh();
  }
  /**
   * 添加新API密钥
   */
  add() {
    const newIndex = this._apiKey.length;
    this._apiKey.push({
      ...DEFAULT_API_KEY,
      index: newIndex,
    });
    this.save();
    this._apiUI.jumpToApiPage(newIndex);
  }

  /**
   * 删除API密钥
   * @param {number} index - 要删除的API密钥索引
   */
  remove(index) {
    if (index < 0 || index >= this._apiKey.length) return;
    const isActive = this._apiKey[index].isActive;
    this._apiKey.splice(index, 1);
    // 更新索引
    this._apiKey.forEach((api, i) => {
      api.index = i;
    });

    // 如果删除的是当前活跃的API密钥，则切换到第一个
    if (isActive && this._apiKey.length > 0) {
      this._currentIndex = 0;
      this._apiKey[0].isActive = true;
    }
    this.save();
    const isLastItem = index === this._apiKey.length;
    const targetIndex = isLastItem ? index - 1 : index;
    this._apiUI.jumpToApiPage(targetIndex);
  }

  /**
   * 更新API密钥属性
   * @param {number} index - API密钥索引
   * @param {string} key - 属性名
   * @param {any} value - 属性值
   */
  update(index, key, value) {
    if (index < 0 || index >= this._apiKey.length || value === undefined)
      return;
    this._apiKey[index][key] = value;
    this.save();
  }
  /**
   * 批量添加API密钥
   */
  batchAdd() {
    this._apiUI.showBatchAddDialog((result) => {
      if (!result) return;
      const keys = result.split("\n").filter((key) => key.trim() !== "");
      if (keys.length === 0) return;
      let lastIndex = this._apiKey.length - 1;
      keys.forEach((key) => {
        this._apiKey.push({
          ...DEFAULT_API_KEY,
          key: key.trim(),
          index: lastIndex,
        });
        lastIndex++;
      });
      this.save();
      this._apiUI.jumpToApiPage(lastIndex);
      toastr.success(`成功添加 ${keys.length} 个API密钥`, "成功");
    });
  }
  /**
   * 设置当前活跃的API密钥
   * @param {number} index - 要设置为活跃的API密钥索引
   */
  setActiveApiKey(index) {
    // 更新内部数据
    this._apiKey.forEach((api, i) => {
      api.isActive = i === index;
    });
    this._apiUI.setActiveApiKey(index);
    this.save();
  }
  /**
   * 更新当前模型
   */
  updateCurrentModel() {
    this._setProperty("currentModel");
  }
  /**
   * 获取UI实例
   * @returns {GoogleAPIUI} - UI实例
   */
  get apiUI() {
    return this._apiUI;
  }
  /**
   * 获取模型实例
   * @returns {GoogleApiModel} - 模型实例
   */
  get apiModel() {
    return this._apiModel;
  }
  /**
   * 获取轮询实例
   * @returns {GoogleApiRotation} - 轮询实例
   */
  get apiRotation() {
    return this._apiRotation;
  }
  /**
   * 获取API密钥列表
   * @returns {Array} - API密钥列表
   */
  get apiKeys() {
    return this._apiKey;
  }
  /**
   * 获取当前API密钥
   * @returns {string} - 当前API密钥
   */
  get currentApiKey() {
    return this._currentApiKey;
  }
  /**
   * 设置当前API密钥
   * @param {string} key - API密钥
   */
  set currentApiKey(key) {
    this._setProperty("currentApiKey", key);
  }
  /**
   * 获取当前索引
   * @returns {number} - 当前索引
   */
  get currentIndex() {
    return this._currentIndex;
  }
  /**
   * 设置当前索引
   * @param {number} value - 当前索引
   */
  set currentIndex(value) {
    this._setProperty("currentIndex", value);
  }
  /**
   * 检查是否启用轮询
   * @returns {boolean} - 是否启用轮询
   */
  get rotationEnabled() {
    return this._rotationEnabled;
  }
  /**
   * 设置轮询启用状态
   * @param {boolean} enabled - 是否启用轮询
   */
  set rotationEnabled(enabled) {
    this._setProperty("rotation", enabled);
  }
  /**
   * 检查是否启用API统计
   * @returns {boolean} - 是否启用API统计
   */
  get usageEnabled() {
    return this._usageEnabled;
  }

  /**
   * 设置API统计启用状态
   * @param {boolean} enabled - 是否启用API统计
   */
  set usageEnabled(enabled) {
    this._setProperty("usage", enabled);
  }
  /**
   * 检查是否启用错误处理
   * @returns {boolean} - 是否启用错误处理
   */
  get errorEnabled() {
    return this._errorEnabled;
  }
  /**
   * 设置错误处理启用状态
   * @param {boolean} enabled - 是否启用错误处理
   */
  set errorEnabled(enabled) {
    this._setProperty("error", enabled);
  }
  /**
   * 更新模型列表
   * @param {Array} models - 新的模型列表
   */
  set models(models) {
    this._setProperty("models", models);
  }
  /**
   * 通用属性操作方法
   * @param {string} property - 属性名称
   * @param {any} value - 要设置的值
   */
  _setProperty(property, value) {
    const propertyMap = {
      // 功能开关
      rotation: "_rotationEnabled",
      usage: "_usageEnabled",
      error: "_errorEnabled",
      // 数据属性
      models: "_models",
      currentApiKey: "_currentApiKey",
      currentIndex: "_currentIndex",
      // 特殊处理
      currentModel: () => {
        this._curryModel = STFunction.oai_settings.google_model;
      },
    };

    if (typeof propertyMap[property] === "function") {
      propertyMap[property]();
    } else if (propertyMap[property]) {
      this[propertyMap[property]] = value;
    }

    this.save();
  }
}
export default GoogleAPI;
