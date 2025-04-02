import PluginSetting from "../../utils/plugin-setting.js";
import STFunction from "../../utils/st-function.js";
import GoogleAPIUI from "./google-api-ui.js";

// 默认设置
const DEFAULT_SETTINGS = {
  API_KEY: [
    {
      key: "",
      enabled: true,
      error: false,
      errorMessage: "",
      isActive: true,
      index: 0,
    },
  ],
  CURRY_INDEX: 0,
  ROTATION_ENABLED: true,
  MODELS: [],
  CURRY_MODEL: "",
};

// 默认API密钥
const DEFAULT_API_KEY = {
  key: "",
  enabled: true,
  error: false,
  errorMessage: "",
  isActive: false,
  index: 0,
};

/**
 * GoogleAPI - Google API设置界面管理类
 */
class GoogleAPI {
  constructor() {
    this._rotationEnabled = DEFAULT_SETTINGS.ROTATION_ENABLED;
    this._apiKey = DEFAULT_SETTINGS.API_KEY;
    this._currentApiKey = null;
    this._currentIndex = DEFAULT_SETTINGS.CURRY_INDEX;
    this._models = DEFAULT_SETTINGS.MODELS;
    this._curryModel = DEFAULT_SETTINGS.CURRY_MODEL;
    this._ui = new GoogleAPIUI(this);
    this._switchApiKey = null;
    this._updateCurrentModel = null;
  }

  /**
   * 注册并初始化
   * @param {string|HTMLElement} [containerSelector='#extensions_settings'] - 容器选择器或元素
   */
  async register(containerSelector = "#extensions_settings") {
    await this.load();
    this._ui.initTemplate(containerSelector);

    // 绑定方法到this实例
    this._switchApiKey = this.switchApiKey.bind(this);
    this._updateCurrentModel = this.updateCurrentModel.bind(this);

    // 直接使用绑定后的方法作为事件监听器
    STFunction.addEventListener(
      "CHAT_COMPLETION_SETTINGS_READY",
      this._switchApiKey
    );
    STFunction.addEventListener(
      "CHATCOMPLETION_MODEL_CHANGED",
      this._updateCurrentModel
    );
  }
  /**
   * 卸载并清理资源
   */
  unregister() {
    // 移除事件监听器
    STFunction.removeEventListener(
      "CHAT_COMPLETION_SETTINGS_READY",
      this._switchApiKey
    );
    STFunction.removeEventListener(
      "CHATCOMPLETION_MODEL_CHANGED",
      this._updateCurrentModel
    );

    // 清理UI
    if (this._ui) {
      this._ui.removeTemplate();
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
    this._apiKey = settings.API_KEY;
    this._currentIndex = settings.CURRY_INDEX;
    this._currentApiKey = this._apiKey?.[this._currentIndex]?.key;
    this._rotationEnabled = settings.ROTATION_ENABLED;
    this._models = settings.MODELS;
    this._curryModel = settings.CURRY_MODEL;
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
      this._ui.updateModelsList(this._models);
      // 更新UI选择
      this._ui.setSelectedModel(this._curryModel, this._models);
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
      MODELS: this._models,
      CURRY_MODEL: this._curryModel,
    });
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
    this._ui.renderApiKeys();
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
    this._ui.renderApiKeys();
  }

  /**
   * 更新API密钥属性
   * @param {number} index - API密钥索引
   * @param {string} key - 属性名
   * @param {any} value - 属性值
   */
  update(index, key, value) {
    if (index < 0 || index >= this._apiKey.length) return;
    this._apiKey[index][key] = value;
    this.save();
  }

  /**
   * 批量添加API密钥
   */
  batchAdd() {
    this._ui.showBatchAddDialog((result) => {
      if (!result) return;

      const keys = result.split("\n").filter((key) => key.trim() !== "");
      if (keys.length === 0) return;

      keys.forEach((key) => {
        const newIndex = this._apiKey.length;
        this._apiKey.push({
          ...DEFAULT_API_KEY,
          key: key.trim(),
          index: newIndex,
        });
      });

      this.save();
      this._ui.renderApiKeys();
      toastr.success(`成功添加 ${keys.length} 个API密钥`, "成功");
    });
  }
  /**
   * 更新模型
   * @returns {Promise<Array|undefined>} 模型列表
   */
  async updateModels() {
    try {
      const key = this._currentApiKey;
      if (!key) {
        toastr.error("没有可用的API密钥", "错误");
        return;
      }

      toastr.info("正在更新模型列表...", "提示");

      const result = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/?key=${key}`
      );

      if (!result.ok) {
        const errorData = await result.json();
        toastr.error(
          `获取模型失败: ${errorData?.error?.message || "未知错误"}`,
          "错误"
        );
        return;
      }

      const data = await result.json();
      if (!data?.models) {
        toastr.warning("未找到可用模型", "警告");
        return;
      }

      // 获取模型数据
      const models = data.models
        .filter((model) => model.name.includes("gemini"))
        .map((modelData) => {
          const model = modelData.name.replace("models/", "");
          const name = modelData.displayName || model;
          return { name, model };
        });

      if (models.length === 0) {
        toastr.warning("未找到Gemini系列模型", "警告");
        return;
      }
      this._models = models;
      // 交由UI处理模型显示
      const added = this._ui.updateModelsList(models);
      if (added > 0) {
        toastr.success(`成功添加 ${added} 个新模型`, "成功");
      } else {
        toastr.info("没有新的模型可添加", "提示");
      }
      this.updateCurrentModel();
      return models;
    } catch (e) {
      console.error("更新模型时出错:", e);
      toastr.error(`更新模型失败: ${e.message || "未知错误"}`, "错误");
    }
  }
  /**
   * 更新当前模型
   */
  updateCurrentModel() {
    this._curryModel = STFunction.oai_settings.google_model;
    this.save();
  }
  /**
   * 设置API错误
   * @param {number} index - API密钥索引
   * @param {string} message - 错误消息
   */
  setApiError(index, message) {
    this.update(index, "error", true);
    this.update(index, "errorMessage", message);
    this._ui.updateErrorDisplay(index, true, message);
  }

  /**
   * 清除API错误
   * @param {number} index - API密钥索引
   */
  clearApiError(index) {
    this.update(index, "error", false);
    this.update(index, "errorMessage", "");
    this._ui.updateErrorDisplay(index, false);
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

    this._ui.setActiveApiKey(index);
    this.save();
  }

  /**
   * 设置轮询启用状态
   * @param {boolean} enabled - 是否启用轮询
   */
  setRotationEnabled(enabled) {
    this._rotationEnabled = enabled;
    this.save();
  }

  /**
   * 轮替API密钥
   */
  switchApiKey() {
    // 如果未启用轮询，直接返回
    if (!this._rotationEnabled) return;

    // 获取所有可用的API密钥
    const activeApiKeys = this._apiKey;
    // 如果没有可用的API密钥
    if (activeApiKeys.length === 0) {
      toastr.error("没有可用的API密钥", "错误");
      return;
    }

    let key = null;
    let loopCount = 0;
    let nextIndex = this._currentIndex;
    while (loopCount < activeApiKeys.length) {
      const apiKey = activeApiKeys[nextIndex];
      nextIndex = (nextIndex + 1) % activeApiKeys.length;
      if (apiKey && apiKey.enabled && apiKey.key !== "" && !apiKey.error) {
        key = apiKey.key;
        break;
      }
      this._currentIndex = nextIndex;
      loopCount++;
    }

    // 如果没有找到可用的API密钥
    if (!key) {
      toastr.error("没有可用的API密钥", "错误");
      return;
    }

    // 设置API密钥
    this._currentApiKey = key;
    STFunction.setSecrets("api_key_makersuite", key);
    // 更新UI显示
    this.setActiveApiKey(this._currentIndex);
  }

  /**
   * 获取API密钥列表
   * @returns {Array} - API密钥列表
   */
  getApiKeys() {
    return this._apiKey;
  }

  /**
   * 获取当前索引
   * @returns {number} - 当前索引
   */
  getCurrentIndex() {
    return this._currentIndex - 1;
  }

  /**
   * 检查是否启用轮询
   * @returns {boolean} - 是否启用轮询
   */
  isRotationEnabled() {
    return this._rotationEnabled;
  }

  /**
   * 检查指定索引的API密钥是否有错误
   * @param {number} index - API密钥索引
   * @returns {boolean} - 是否有错误
   */
  hasError(index) {
    if (index < 0 || index >= this._apiKey.length) return false;
    return this._apiKey[index].error;
  }

  /**
   * 获取指定索引的API密钥的错误消息
   * @param {number} index - API密钥索引
   * @returns {string} - 错误消息
   */
  getErrorMessage(index) {
    if (index < 0 || index >= this._apiKey.length) return "";
    return this._apiKey[index].errorMessage;
  }
}

export default GoogleAPI;
