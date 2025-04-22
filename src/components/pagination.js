/**
 * 分页信息数据类
 * @class
 */
export class PaginationInfo {
  /**
   * @param {Object} options - 分页选项
   * @param {Array} options.pageItems - 当前页的数据项
   * @param {number} options.currentPage - 当前页码
   * @param {number} options.totalPages - 总页数
   * @param {number} options.totals - 总项目数
   * @param {number} options.pageSize - 每页显示数量
   * @param {number} options.startIndex - 当前页起始项目编号
   * @param {number} options.endIndex - 当前页结束项目编号
   * @param {boolean} options.hasNext - 是否有下一页
   * @param {boolean} options.hasPrev - 是否有上一页
   * @param {number} options.currentIndex - 当前选中项编号
   */
  constructor(options) {
    /**
     * 当前页的数据项
     * @type {Array}
     */
    this.pageItems = options.pageItems || [];

    /**
     * 当前页码
     * @type {number}
     */
    this.currentPage = options.currentPage || 1;

    /**
     * 总页数
     * @type {number}
     */
    this.totalPages = options.totalPages || 1;

    /**
     * 总项目数
     * @type {number}
     */
    this.totals = options.totals || 0;

    /**
     * 每页显示数量
     * @type {number}
     */
    this.pageSize = options.pageSize || 10;

    /**
     * 当前页起始项目编号
     * @type {number}
     */
    this.startIndex = options.startIndex || 0;

    /**
     * 当前页结束项目编号
     * @type {number}
     */
    this.endIndex = options.endIndex || 0;

    /**
     * 是否有下一页
     * @type {boolean}
     */
    this.hasNext = options.hasNext || false;

    /**
     * 是否有上一页
     * @type {boolean}
     */
    this.hasPrev = options.hasPrev || false;

    /**
     * 当前选中项编号
     * @type {number}
     */
    this.currentIndex =
      options.currentIndex !== undefined ? options.currentIndex : -1;
  }
}
/**
 * Pagination - 自定义分页组件
 * 提供简单的分页导航功能
 */

class Pagination extends HTMLElement {
  /**
   * 构造函数
   */
  constructor() {
    super();
    // 内部状态
    this._state = {
      disabled: false,
      currentPage: 1,
      totalPages: 1,
      pageSize: 10, // 每页显示的项目数量
      totals: 0, // 总项目数
      startIndex: 1, // 当前页起始项目
      endIndex: 10, // 当前页结束项目
      currentIndex: 0, // 当前选中的项目
    };
    this._updating = false;
    // 初始渲染
    this._render();
    // 绑定事件处理
    this._bindEvents();
  }
  static _attributeMap = {
    "current-page": ["currentPage", 1],
    "total-pages": ["totalPages", 1],
    "page-size": ["pageSize", 10],
    totals: ["totals", 0],
    "current-index": ["currentIndex", 0],
  };
  static get observedAttributes() {
    return [...Object.keys(this._attributeMap), "disabled"];
  }
  /**
   * 连接到DOM时调用
   */
  connectedCallback() {
    // 初始化属性
    this._initAttributes();
    this._updateItemRange();
    this._update();
  }
  /**
   * 属性变化时调用
   * @param {string} name - 属性名
   * @param {string|number} oldValue - 旧值
   * @param {string|number} newValue - 新值
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    const constructor = /** @type {typeof Pagination} */ (this.constructor);
    let pageChanged = false;

    if (name in constructor._attributeMap) {
      const [prop, defaultValue] = constructor._attributeMap[name];
      if (prop === "currentPage") {
        pageChanged = this._setPageInternal(newValue, false); // 先不触发事件
      } else {
        this._processAttribute(prop, newValue, defaultValue);
      }
    } else if (name === "disabled") {
      this._state.disabled = newValue !== null;
    }

    if (!pageChanged) {
      this._updateItemRange();
    }

    // 如果是页码变更，在更新UI后触发事件
    if (pageChanged) {
      this._dispatchPageChangeEvent();
    }

    this._update();
  }
  /**
   * 设置页码并处理相关逻辑
   * @param {number|string} value - 新页码
   * @param {boolean} [dispatchEvent=true] - 是否触发事件
   * @returns {boolean} - 页码是否发生变化
   * @private
   */
  _setPageInternal(value, dispatchEvent = true) {
    const newPage = parseInt(String(value)) || 1;
    // 确保页码在有效范围内
    const validPage = Math.max(1, Math.min(newPage, this._state.totalPages));

    if (validPage !== this._state.currentPage) {
      this._state.currentPage = validPage;
      this._updateItemRange();

      if (dispatchEvent) {
        this._dispatchPageChangeEvent();
      }

      return true;
    }

    return false;
  }
  /**
   * 获取按钮禁用状态
   * @param {string} action - 按钮动作
   * @returns {boolean} - 是否禁用
   */
  _getButtonDisabledState(action) {
    const isFirstPage = this._state.currentPage === 1;
    const isLastPage = this._state.currentPage === this._state.totalPages;

    switch (action) {
      case "first":
      case "prev":
        return isFirstPage || this._state.disabled;
      case "next":
      case "last":
        return isLastPage || this._state.disabled;
      default:
        return this._state.disabled;
    }
  }
  /**
   * 渲染组件模板
   */
  _render() {
    this.className = "pagination flex-container justifyCenter";
    // 按钮配置
    const buttons = [
      { icon: "fa-angles-left", title: "首页", action: "first" },
      { icon: "fa-angle-left", title: "上一页", action: "prev" },
      { icon: "fa-angle-right", title: "下一页", action: "next" },
      { icon: "fa-angles-right", title: "尾页", action: "last" },
    ];

    // 创建并添加按钮
    buttons.slice(0, 2).forEach((btn) => {
      this.appendChild(
        this._createButton(
          btn.icon,
          btn.title,
          btn.action,
          this._getButtonDisabledState(btn.action)
        )
      );
    });
    // 添加页码按钮
    const pageInputContainer = this._createPageInput();
    this.appendChild(pageInputContainer);
    buttons.slice(2, 4).forEach((btn) => {
      this.appendChild(
        this._createButton(
          btn.icon,
          btn.title,
          btn.action,
          this._getButtonDisabledState(btn.action)
        )
      );
    });
  }
  /**
   * 计算分页范围信息
   * @param {number} currentPage - 当前页码
   * @param {number} pageSize - 每页显示数量
   * @param {number} totals - 总项目数
   * @returns {{startIndex: number, endIndex: number, totalPages: number}}
   * @private
   */
  _calculatePageRange(
    currentPage = this._state.currentPage,
    pageSize = this._state.pageSize,
    totals = this._state.totals
  ) {
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(startIndex + pageSize - 1, totals);
    const totalPages = Math.max(1, Math.ceil(totals / pageSize));
    return { startIndex, endIndex, totalPages };
  }
  _updateItemRange() {
    const { startIndex, endIndex, totalPages } = this._calculatePageRange();
    this._state.startIndex = startIndex;
    this._state.endIndex = endIndex;
    this._state.totalPages = totalPages;
  }
  // 添加事件分发方法
  _dispatchPageChangeEvent() {
    const event = new CustomEvent("page-change", {
      detail: this.pageInfo,
      bubbles: true,
    });
    this.dispatchEvent(event);
  }
  /**
   * 处理属性值
   * @param {string|number} name - 属性名
   * @param {string|number} value - 属性值
   * @param {string|number} defaultValue - 默认值
   * @param {Function} processor - 值处理函数
   * @returns {number} - 处理后的值
   */
  _processAttribute(name, value, defaultValue, processor = parseInt) {
    const processedValue = processor(String(value)) || defaultValue;
    this._state[name] = processedValue;
    return processedValue;
  }
  /**
   * 初始化组件属性
   */
  _initAttributes() {
    const constructor = /** @type {typeof Pagination} */ (this.constructor);
    // 使用对象解构和函数式编程简化逻辑
    Object.entries(constructor._attributeMap).forEach(
      ([attr, [prop, defaultValue]]) => {
        this._state[prop] = this.hasAttribute(attr)
          ? this._processAttribute(prop, this.getAttribute(attr), defaultValue)
          : defaultValue;
      }
    );
    this._state.disabled = this.hasAttribute("disabled");
  }
  _bindEvents() {
    this.addEventListener("click", (e) => {
      if (this._state.disabled) return;
      if (!(e.target instanceof Element)) return;
      const target = e.target.closest(".page-button");
      if (!target || !(target instanceof HTMLElement)) return;

      const action = target.dataset.action;
      if (!action) return;

      switch (action) {
        case "first":
          this._navigate(1);
          break;
        case "prev":
          this._navigate("prev");
          break;
        case "next":
          this._navigate("next");
          break;
        case "last":
          this._navigate(this._state.totalPages);
          break;
      }
    });
  }
  /**
   * 页面导航
   * @param {string|number} target - 目标页码或关键字('next'/'prev')
   */
  _navigate(target) {
    const navigateActions = {
      next: () => Math.min(this._state.currentPage + 1, this._state.totalPages),
      prev: () => Math.max(this._state.currentPage - 1, 1),
      default: () => {
        if (typeof target === "number" || !isNaN(parseInt(target))) {
          return parseInt(String(target));
        }
        return this._state.currentPage;
      },
    };

    const getPage = navigateActions[target] || navigateActions.default;
    this.currentPage = getPage();
  }

  /**
   * 更新组件UI
   */
  _update() {
    // 防止递归调用
    if (this._updating) return;
    this._updating = true;
    // 定义按钮及其禁用条件
    const buttonStates = {
      first: {
        selector: '[data-action="first"]',
        disabled: this._getButtonDisabledState("first"),
      },
      prev: {
        selector: '[data-action="prev"]',
        disabled: this._getButtonDisabledState("prev"),
      },
      next: {
        selector: '[data-action="next"]',
        disabled: this._getButtonDisabledState("next"),
      },
      last: {
        selector: '[data-action="last"]',
        disabled: this._getButtonDisabledState("last"),
      },
    };

    // 统一更新所有按钮
    Object.entries(buttonStates).forEach(([key, { selector, disabled }]) => {
      const btn = this.querySelector(selector);
      if (btn) this._updateButtonState(btn, disabled || this._state.disabled);
    });

    // 更新输入框
    const pageInput = this.querySelector(".page-input");
    if (pageInput && pageInput instanceof HTMLInputElement) {
      pageInput.value = this._state.currentPage.toString();
      pageInput.max = this._state.totalPages.toString();
    }

    // 更新总页数
    const pageText = this.querySelector(".page-text");
    if (pageText) {
      pageText.textContent = `/ ${this._state.totalPages}`;
    }

    // 重置标志
    this._updating = false;
  }
  /**
   * 更新按钮状态
   * @param {Element} button - 按钮元素
   * @param {boolean} disabled - 是否禁用
   */
  _updateButtonState(button, disabled) {
    if (disabled) {
      button.classList.add("disabled");
    } else {
      button.classList.remove("disabled");
    }
  }
  /**
   * 创建按钮
   * @param {string} iconClass - 图标类名
   * @param {string} title - 按钮标题
   * @param {string} action - 按钮动作
   * @param {boolean} disabled - 是否禁用
   * @returns {Node} - 按钮元素
   */
  _createButton(iconClass, title, action, disabled = false) {
    const button = document.createElement("div");
    button.className = `page-button menu_button interactable
    ${disabled ? "disabled" : ""}`;
    button.title = title;
    button.dataset.action = action;

    const icon = document.createElement("i");
    icon.className = `fa-solid ${iconClass}`;
    button.appendChild(icon);

    return button;
  }
  /**
   * 创建页码输入框
   * @returns {Element} - 页码输入容器
   */
  _createPageInput() {
    // 使用模板字符串创建HTML
    const containerHTML = `
    <div class="page-input-container flex-container flexnowrap alignitemscenter">
      <input 
        type="number" 
        min="1" 
        max="${this._state.totalPages}" 
        value="${this._state.currentPage}" 
        class="page-input text_pole wideMax100px margin0" 
        style="width: calc(3em + 15px);"
        ${this._state.disabled ? "disabled" : ""}
      >
      <div class="page-text whitespacenowrap">/ ${this._state.totalPages}</div>
    </div>
  `;

    // 创建DOM元素
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = containerHTML.trim();
    const container = tempDiv.firstElementChild;

    // 设置输入框事件
    const pageInput = container.querySelector("input");
    this._setupPageInputEvents(pageInput);

    return container;
  }
  /**
   * 设置页码输入框事件处理
   * @param {HTMLInputElement} input - 页码输入框
   */
  _setupPageInputEvents(input) {
    const handlePageChange = (e) => {
      const targetPage = parseInt(e.target.value);
      if (!isNaN(targetPage)) {
        this._navigate(targetPage);
      } else {
        e.target.value = this._state.currentPage.toString();
      }
    };

    // 合并事件监听器
    ["blur", "change"].forEach((event) =>
      input.addEventListener(event, handlePageChange)
    );
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handlePageChange(e);
    });
  }

  /**
   * 获取/设置当前页码
   */
  get currentPage() {
    return this._state.currentPage;
  }
  set currentPage(val) {
    if (this._setPageInternal(val)) {
      this._update();
    }
  }
  get pageInfo() {
    // 计算当前页的起始和结束项目
    const { startIndex, endIndex } = this._calculatePageRange();

    return new PaginationInfo({
      pageItems: [],
      currentPage: this._state.currentPage,
      totalPages: this._state.totalPages,
      startIndex: startIndex,
      endIndex: endIndex,
      totals: this._state.totals,
      currentIndex:
        this._state.currentIndex >= 0 ? this._state.currentIndex + 1 : -1,
      pageSize: this._state.pageSize,
      hasNext: this._state.currentPage < this._state.totalPages,
      hasPrev: this._state.currentPage > 1,
    });
  }
}

// 注册自定义元素
customElements.define("pagination-component", Pagination);
