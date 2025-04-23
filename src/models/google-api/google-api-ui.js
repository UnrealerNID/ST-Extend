import TemplateLoader from "../../utils/ui/template-loader.js";
import ExtendSetting from "../../utils/extend-utils.js";
import "../../components/common/switch-button.js";
import GoogleAPI from "./google-api.js";
import PaginationManager from "../../utils/ui/pagination-manager.js";
import ExtendUtils from "../../utils/extend-utils.js";

/**
 * GoogleAPIUI - 处理Google API设置界面的UI渲染和事件绑定
 */
class GoogleAPIUI {
  /**
   * 创建GoogleAPIUI实例
   * @param {GoogleAPI} apiManager - Google API管理器实例
   */
  constructor(apiManager) {
    this._apiManager = apiManager;
    this._pageSize = 5;
    this._container = null;
    this._paginationManager = null;
    this._lastApiKeysLength = 0;
    this._lastCurrentIndex = -1;
    this._clickHandler = null;
    this._changeHandler = null;
  }
  /**
   * 初始化模板
   * @param {string|HTMLElement} containerSelector - 容器选择器或元素
   */
  initTemplate(containerSelector) {
    const templatePath = `${ExtendSetting.extensionFolderPath}/public/google-api.html`;
    TemplateLoader.mountTemplate(
      templatePath,
      containerSelector,
      "google_api_container",
      (container) => this._init(container),
      (error) => {
        console.error("加载Google API模板失败:", error);
      }
    );
  }
  /**
   * 初始化UI组件
   * @param {HTMLElement} container - 容器元素
   */
  _init(container) {
    this._container = container;
    // 初始化UI组件
    this._initUI();

    // 初始化分页管理器
    this._paginationManager = new PaginationManager({
      container: this._container.querySelector(".pagination"),
      itemsSource: () => this._apiManager.apiKeys,
      pageSize: this._pageSize,
      onPageChange: ({ pageItems }) => this.renderApiKeys(pageItems),
    });
    // 添加事件委托
    this._setupEventDelegation();

    // 如果有当前选中的API密钥，跳转到对应页面
    const currentIndex = this._apiManager.currentIndex;
    if (currentIndex >= 0) {
      this._paginationManager.jumpToItemPage(currentIndex);
    } else {
      // 否则刷新分页数据
      this._paginationManager.refresh();
    }
    // 设置活跃API密钥
    this.setActiveApiKey(currentIndex);
  }
  /**
   * 移除模板
   */
  removeTemplate() {
    if (!this._container) return;

    // 移除事件委托监听器
    const container = this._container.querySelector(".google-api-content");
    if (container && this._clickHandler) {
      container.removeEventListener("click", this._clickHandler);
      container.removeEventListener("change", this._changeHandler);
      this._clickHandler = this._changeHandler = null;
    }

    // 移除按钮和复选框事件监听器
    const elementsWithListeners = [
      "#add_api",
      "#batch_add",
      "#update_models",
      "#enable_rotation",
      "#enable_usage",
      "#enable_error",
    ];
    elementsWithListeners.forEach((selector) => {
      const el = this._container.querySelector(selector);
      if (el) el.replaceWith(el.cloneNode(true));
    });

    // 销毁分页管理器
    if (this._paginationManager) {
      this._paginationManager.destroy();
      this._paginationManager = null;
    }
    // 使用TemplateLoader卸载模板
    TemplateLoader.unmountTemplate(this._container);

    // 清空引用
    this._container = null;

    console.log("Google API UI 已移除");
  }
  /**
   * 初始化UI组件
   */
  _initUI() {
    if (!this._container) return;
    // 添加按钮事件监听
    const buttonActions = {
      "#add_api": () => this._apiManager.add(),
      "#batch_add": () => this._apiManager.batchAdd(),
      "#update_models": () => this._apiManager.apiModel.updateModels(),
      "#enable_all": () => this._apiManager.toggleAllApiKeys(true),
      "#disable_all": () => this._apiManager.toggleAllApiKeys(false),
    };

    Object.entries(buttonActions).forEach(([selector, action]) => {
      const button = this._container.querySelector(selector);
      if (button) button.addEventListener("click", action);
    });

    // 初始化复选框
    const checkboxConfigs = [
      ["enable_rotation", "rotationEnabled", "rotationEnabled", "API轮询"],
      ["enable_usage", "usageEnabled", "usageEnabled", "用量统计"],
      ["enable_error", "errorEnabled", "errorEnabled", "错误记录"],
    ];
    checkboxConfigs.forEach((config) =>
      this._initCheckbox(config[0], config[1], config[2], config[3])
    );
  }
  /**
   * 初始化复选框状态和事件
   * @param {string} id - 复选框元素ID
   * @param {string} getterMethod - API管理器中获取状态的方法名
   * @param {string} setterMethod - API管理器中设置状态的方法名
   * @param {string} featureName - 功能名称（用于提示消息）
   */
  _initCheckbox(id, getterMethod, setterMethod, featureName) {
    const checkbox = this._container.querySelector(`#${id}`);
    if (checkbox) {
      // 初始化复选框状态
      checkbox.setAttribute("checked", this._apiManager[getterMethod]);
      // 添加事件监听
      checkbox.addEventListener("change", (e) => {
        const enabled = /** @type {HTMLInputElement} */ (e.target).checked;
        this._apiManager[setterMethod](enabled);
        toastr.info(`${featureName}已${enabled ? "启用" : "禁用"}`, "提示");
      });
    }
  }
  /**
   * 渲染API密钥列表
   * @param {Array} pageItems - 分页信息
   */
  renderApiKeys(pageItems) {
    if (!this._container) return;
    const container = this._container.querySelector(".google-api-content");
    if (!container) return;
    // 清空容器
    container.innerHTML = "";

    // 如果没有数据，显示空状态
    if (!pageItems || pageItems.length === 0) {
      const emptyEl = document.createElement("div");
      emptyEl.className = "empty-api-keys";
      emptyEl.textContent = "No API keys found";
      container.appendChild(emptyEl);
      return;
    }

    // 使用文档片段减少DOM重排
    const fragment = document.createDocumentFragment();

    // 渲染API密钥到文档片段
    pageItems.forEach((api) => {
      const apiElement = this.createApiElement(api, api.index);
      fragment.appendChild(apiElement);
    });

    // 一次性更新DOM
    container.appendChild(fragment);

    // 更新API状态显示
    this.updateApiStatus();
  }

  /**
   * 创建API密钥元素
   * @param {Object} api - API密钥对象
   * @param {number} apiIndex - API在原始数组中的索引
   * @returns {HTMLElement} - API密钥元素
   */
  createApiElement(api, apiIndex) {
    const apiElement = document.createElement("div");
    apiElement.className = `api-key-item flex-container alignitemscenter`;
    apiElement.dataset.apiIndex = apiIndex.toString();
    // 使用模板字符串简化HTML创建
    const isActive = api.isActive ? "api-key-active" : "";
    const activeTitle = api.isActive ? "当前API密钥" : "";
    const enabled = api.enabled ? "value" : "";

    apiElement.innerHTML = `
    <switch-button id="api_enabled_${apiIndex}" data-action="toggle" data-api-index="${apiIndex}" ${enabled} title="切换API激活状态"></switch-button>
    <div class="flex-container flex1">
      <input type="text" id="api_key_${apiIndex}" data-action="update" data-api-index="${apiIndex}" class="text_pole flex1 ${isActive}" value="${api.key}" placeholder="输入Google API密钥" title="${activeTitle}"/>
      <div id="api_remove_${apiIndex}" data-action="remove" data-api-index="${apiIndex}" class="menu_button fa-solid fa-trash-can interactable redWarningBG" title="删除API密钥"></div>
    </div>
  `;

    return apiElement;
  }
  /**
   * 设置事件委托
   */
  _setupEventDelegation() {
    if (!this._container) return;

    // 获取API内容容器
    const container = this._container.querySelector(".google-api-content");
    if (!container) return;

    // 移除可能存在的旧事件监听器
    if (this._clickHandler) {
      container.removeEventListener("click", this._clickHandler);
    }
    if (this._changeHandler) {
      container.removeEventListener("change", this._changeHandler);
    }
    // 点击事件处理
    this._clickHandler = (e) => {
      const target = e.target;
      const action = target.dataset.action;
      if (["toggle", "update"].includes(action)) return;
      const apiIndex = parseInt(target.dataset.apiIndex);
      this._handleApiAction(action, apiIndex);
    };

    // 变更事件处理
    this._changeHandler = (e) => {
      const target = e.target;
      const action = target.dataset.action;
      const apiIndex = parseInt(target.dataset.apiIndex);
      const value = action === "toggle" ? e.detail.value : target.value;
      this._handleApiAction(action, apiIndex, value);
    };

    // 添加事件监听器
    container.addEventListener("click", this._clickHandler);
    container.addEventListener("change", this._changeHandler);
  }
  /**
   * 处理API密钥操作
   * @param {string} action - 操作类型："remove"、"update"、"toggle"
   * @param {number} apiIndex - API密钥索引
   * @param {any} [value] - 操作值（仅在"update"时需要）
   */
  _handleApiAction(action, apiIndex, value) {
    if (!action || isNaN(apiIndex)) return;
    switch (action) {
      case "remove":
        this._apiManager.remove(apiIndex);
        break;
      case "update":
        this._apiManager.update(apiIndex, "key", value);
        break;
      case "toggle":
        this._apiManager.update(apiIndex, "enabled", value);
        break;
    }
  }

  /**
   * 设置当前活跃的API密钥
   * @param {number} index - 要设置为活跃的API密钥索引
   */
  setActiveApiKey(index) {
    if (!this._container) return;
    // 移除所有API输入框的活跃状态
    document.querySelectorAll(".text_pole").forEach((el) => {
      el.classList.remove("api-key-active");
    });
    // 设置当前API输入框为活跃状态
    const activeElement = this._container.querySelector(
      `[data-api-index="${index}"][data-action="update"]`
    );
    this.jumpToApiPage(index);
    if (activeElement) {
      activeElement.classList.add("api-key-active");
      // 更新API状态显示
      this.updateApiStatus(index);
    }
  }
  /**
   * 跳转到指定API密钥所在的页面
   * @param {number} index - API密钥的索引
   */
  jumpToApiPage(index) {
    if (!this._container || !this._paginationManager) return;
    if (index < 0) return;
    this._paginationManager.jumpToItemPage(index);
  }
  refresh() {
    this._paginationManager.refresh();
  }

  /**
   * 显示批量添加API密钥弹窗
   * @param {Function} callback - 回调函数，接收用户输入的API密钥
   */
  showBatchAddDialog(callback) {
    // 创建弹窗内容
    const html = `<h3>请输入API密钥，每行一个</h3>`;
    // 调用通用弹窗
    ExtendUtils.callGenericPopup(html, "INPUT", "", {
      okButton: "添加",
      cancelButton: "取消",
      rows: 10,
      wide: true,
      allowVerticalScrolling: true,
    }).then((result) => {
      callback(result);
    });
  }
  /**
   * 更新模型列表
   * @param {Array} models - 模型数据列表
   */
  updateModelsList(models) {
    // 获取select元素
    const selectElement = document.getElementById("model_google_select");
    if (!selectElement || !(selectElement instanceof HTMLSelectElement)) {
      toastr.error("找不到模型选择器元素", "错误");
      return;
    }
    // 保存当前选中的值
    const currentSelectedValue = selectElement.value;
    // 获取现有模型值列表，防止重复
    const existingModelValues = Array.from(selectElement.options).map(
      (option) => option.value
    );

    // 查找或创建"Extend Models"组
    let extendModelsGroup = selectElement.querySelector(
      'optgroup[label="Extend Models"]'
    );
    if (!extendModelsGroup) {
      extendModelsGroup = document.createElement("optgroup");
      extendModelsGroup.setAttribute("label", "Extend Models");
    }

    // 添加新模型
    let addedCount = 0;
    models.forEach((model) => {
      // 检查是否已存在
      if (!existingModelValues.includes(model.model)) {
        const option = document.createElement("option");
        option.value = model.model;
        option.textContent = `${model.name} (${model.model})`;
        extendModelsGroup.appendChild(option);
        addedCount++;
      }
    });

    // 如果有新模型，添加到select
    if (addedCount > 0 && !selectElement.contains(extendModelsGroup)) {
      selectElement.insertBefore(
        extendModelsGroup,
        selectElement.firstChild || null
      );
    }
    // 恢复之前选中的值
    selectElement.value = currentSelectedValue;
    return addedCount;
  }
  /**
   * 设置当前选中的模型
   * @param {string} modelValue - 模型值
   * @param {Array} modelsList - 可用模型列表
   * @returns {boolean} 是否成功设置
   */
  setSelectedModel(modelValue, modelsList = []) {
    if (!modelValue) return false;

    const selectElement = document.getElementById("model_google_select");
    if (!selectElement) return false;

    // 保存当前值以便比较
    const previousValue = selectElement.value;

    // 尝试设置值
    selectElement.value = modelValue;

    // 如果值没有成功设置（没有匹配的选项）
    if (selectElement.value !== modelValue) {
      // 查找模型数据
      const modelData = modelsList.find((m) => m.model === modelValue);

      if (modelData) {
        // 创建新选项
        const option = document.createElement("option");
        option.value = modelValue;
        option.textContent = `${modelData.name} (${modelValue})`;

        // 添加到第一个optgroup
        if (
          selectElement.firstElementChild &&
          selectElement.firstElementChild.tagName === "OPTGROUP"
        ) {
          selectElement.firstElementChild.appendChild(option);
        } else {
          selectElement.appendChild(option);
        }

        // 再次尝试设置值
        selectElement.value = modelValue;
      } else {
        // 如果找不到模型数据，创建一个基本选项
        const option = document.createElement("option");
        option.value = modelValue;
        option.textContent = modelValue;
        selectElement.appendChild(option);
        selectElement.value = modelValue;
      }
    }

    // 如果值发生了变化，触发change事件
    if (previousValue !== selectElement.value) {
      const event = new Event("change", { bubbles: true });
      selectElement.dispatchEvent(event);
    }

    return selectElement.value === modelValue;
  }
  /**
   * 更新API状态显示
   * 显示API总数和当前使用的API索引
   * @param {number} index - 当前活跃的API索引
   */
  updateApiStatus(index = this._apiManager.currentIndex) {
    const statusElement = this._container?.querySelector("#api_status");
    if (!statusElement) return;

    const totalApis = this._apiManager.apiKeys.length;

    if (totalApis === 0) {
      statusElement.textContent = "没有配置API密钥";
      return;
    }

    // 索引从0开始，显示时+1更符合用户习惯
    const displayIndex = index + 1;
    statusElement.textContent = `${displayIndex} of ${totalApis}`;
  }
}

export default GoogleAPIUI;
