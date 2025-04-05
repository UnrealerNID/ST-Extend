import TemplateLoader from "../../utils/template-loader.js";
import PluginSetting from "../../utils/plugin-setting.js";
import STFunction from "../../utils/st-function.js";
import "../../components/common/switch-button.js";
import GoogleAPI from "./google-api.js";

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
    this._container = null;
  }

  /**
   * 初始化模板
   * @param {string|HTMLElement} containerSelector - 容器选择器或元素
   */
  initTemplate(containerSelector) {
    const templatePath = `${PluginSetting.extensionFolderPath}/src/public/google-api.html`;
    TemplateLoader.mountTemplate(
      templatePath,
      containerSelector,
      "google_api_container",
      (container) => {
        this._container = container;
        // 初始化事件
        this.initEvents();
        // 渲染API密钥
        this.renderApiKeys();
        this.setActiveApiKey(this._apiManager.getCurrentIndex());
      },
      (error) => {
        console.error("加载Google API模板失败:", error);
      }
    );
  }
  /**
   * 移除模板
   */
  removeTemplate() {
    if (!this._container) return;
    // 移除所有事件监听器
    $(this._container).find("button, input, select").off();

    // 使用TemplateLoader卸载模板
    TemplateLoader.unmountTemplate(this._container);

    // 清空引用
    this._container = null;

    console.log("Google API UI 已移除");
  }
  /**
   * 初始化事件
   */
  initEvents() {
    if (!this._container) return;

    // 添加API按钮
    const addButton = this._container.querySelector("#add_api");
    if (addButton) {
      addButton.addEventListener("click", () => this._apiManager.add());
    }

    // 批量添加按钮
    const batchAddButton = this._container.querySelector("#batch_add");
    if (batchAddButton) {
      batchAddButton.addEventListener("click", () =>
        this._apiManager.batchAdd()
      );
    }

    // 更新模型按钮
    const updateModelsButton = this._container.querySelector("#update_models");
    if (updateModelsButton) {
      updateModelsButton.addEventListener("click", () =>
        this._apiManager.getModel().updateModels()
      );
    }

    // 初始化复选框
    this._initCheckbox(
      "enable_rotation",
      "isRotationEnabled",
      "setRotationEnabled",
      "API轮询"
    );
    this._initCheckbox(
      "enable_usage",
      "isUsageEnabled",
      "setUsageEnabled",
      "用量统计"
    );
    this._initCheckbox(
      "enable_error",
      "isErrorEnabled",
      "setErrorEnabled",
      "错误记录"
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
      checkbox.checked = this._apiManager[getterMethod]();
      // 添加事件监听
      checkbox.addEventListener("change", (e) => {
        const enabled = e.target.checked;
        this._apiManager[setterMethod](enabled);
        toastr.info(`${featureName}已${enabled ? "启用" : "禁用"}`, "提示");
      });
    }
  }
  /**
   * 渲染API密钥列表
   */
  renderApiKeys() {
    if (!this._container) return;
    const container = this._container.querySelector(".google-api-content");
    if (!container) return;

    // 清空容器
    container.innerHTML = "";

    // 渲染每个API密钥
    const apiKeys = this._apiManager.getApiKeys();
    apiKeys.forEach((api, index) => {
      const apiElement = this.createApiElement(api, index);
      container.appendChild(apiElement);
    });

    // 更新API状态显示
    this.updateApiStatus();
  }

  /**
   * 创建API密钥元素
   * @param {Object} api - API密钥对象
   * @param {number} index - 索引
   * @returns {HTMLElement} - API密钥元素
   */
  createApiElement(api, index) {
    const apiElement = document.createElement("div");
    apiElement.className = `api-key-item flex-container alignitemscenter`;
    apiElement.dataset.index = index.toString();

    // 创建基本结构
    apiElement.innerHTML = `
    <switch-button id="api_enabled_${index}" ${
      api.enabled ? "value" : ""
    } title="切换API激活状态">
    </switch-button>
    <div class="flex-container flex1">
      <input type="text" id="api_key_${index}" class="text_pole flex1 ${
      api.isActive ? "api-key-active" : ""
    }" value="${api.key}" placeholder="输入Google API密钥" title="${
      api.isActive ? "当前API密钥" : ""
    }"/>
      <div id="api_remove_${index}" class="menu_button fa-solid fa-trash-can interactable redWarningBG" title="删除API密钥"></div>
    </div>
    `;

    // 添加事件监听
    this.addApiElementEvents(apiElement, index);
    return apiElement;
  }

  /**
   * 为API密钥元素添加事件
   * @param {HTMLElement} element - API密钥元素
   * @param {number} index - 索引
   */
  addApiElementEvents(element, index) {
    // 启用切换 - 使用自定义组件
    const switchButton = element.querySelector(`#api_enabled_${index}`);
    if (switchButton) {
      switchButton.addEventListener("change", (e) => {
        this._apiManager.update(index, "enabled", e.detail.value);
      });
    }

    // API密钥输入
    const keyInput = element.querySelector(`#api_key_${index}`);
    if (keyInput) {
      keyInput.addEventListener("change", (e) => {
        this._apiManager.update(index, "key", e.target.value);
      });
    }

    // 删除按钮
    const removeBtn = element.querySelector(`#api_remove_${index}`);
    if (removeBtn) {
      removeBtn.addEventListener("click", () => this._apiManager.remove(index));
    }
  }

  /**
   * 设置当前活跃的API密钥
   * @param {number} index - 要设置为活跃的API密钥索引
   */
  setActiveApiKey(index) {
    // 移除所有API输入框的活跃状态
    document.querySelectorAll(".text_pole").forEach((el) => {
      el.classList.remove("api-key-active");
    });

    // 设置当前API输入框为活跃状态
    const activeElement = document.querySelector(`#api_key_${index}`);
    if (activeElement) {
      activeElement.classList.add("api-key-active");
    }

    // 更新API状态显示
    this.updateApiStatus(index);
  }

  /**
   * 显示批量添加API密钥弹窗
   * @param {Function} callback - 回调函数，接收用户输入的API密钥
   */
  showBatchAddDialog(callback) {
    // 创建弹窗内容
    const html = `<h3>请输入API密钥，每行一个</h3>`;
    // 调用通用弹窗
    STFunction.callGenericPopup(html, "INPUT", "", {
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
    if (!selectElement) {
      toastr.error("找不到模型选择器元素", "错误");
      return;
    }
    // 保存当前选中的值
    const currentSelectedValue = selectElement.value;
    // 获取现有模型值列表，防止重复
    // @ts-ignore
    const existingModelValues = Array.from(selectElement.options).map(
      (option) => option.value
    );

    // 查找是否已存在"Plugin Models"组
    let pluginModelsGroup = null;
    for (const child of Array.from(selectElement.children)) {
      if (
        child.tagName === "OPTGROUP" &&
        child.getAttribute("label") === "Plugin Models"
      ) {
        pluginModelsGroup = child;
        break;
      }
    }

    // 如果不存在，创建新的模型组
    if (!pluginModelsGroup) {
      pluginModelsGroup = document.createElement("optgroup");
      pluginModelsGroup.label = "Plugin Models";
    }

    // 添加新模型
    let addedCount = 0;
    models.forEach((model) => {
      // 检查是否已存在
      if (!existingModelValues.includes(model.model)) {
        const option = document.createElement("option");
        option.value = model.model;
        option.textContent = `${model.name} (${model.model})`;
        pluginModelsGroup.appendChild(option);
        addedCount++;
      }
    });

    // 如果有新模型，确保组被添加到select
    // @ts-ignore - pluginModelsGroup is a valid Node for contains method
    if (addedCount > 0 && !selectElement.contains(pluginModelsGroup)) {
      // 添加模型组到select的开头
      if (selectElement.firstChild) {
        // @ts-ignore
        selectElement.insertBefore(pluginModelsGroup, selectElement.firstChild);
      } else {
        // 如果select没有子元素，直接添加
        // @ts-ignore
        selectElement.appendChild(pluginModelsGroup);
      }
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
   * @param {number} activeIndex - 当前活跃的API索引
   */
  updateApiStatus(activeIndex = this._apiManager.getCurrentIndex() + 1) {
    const statusElement = this._container?.querySelector("#api_status");
    if (!statusElement) return;

    const totalApis = this._apiManager.getApiKeys().length;

    if (totalApis === 0) {
      statusElement.textContent = "没有配置API密钥";
      return;
    }

    // 索引从0开始，显示时+1更符合用户习惯
    const displayIndex = activeIndex + 1;
    statusElement.textContent = `${displayIndex} of ${totalApis}`;
  }
}

export default GoogleAPIUI;
