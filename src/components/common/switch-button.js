/**
 * SwitchButton - 自定义开关按钮组件
 * 使用Font Awesome图标实现切换效果
 */
class SwitchButton extends HTMLElement {
  static get observedAttributes() {
    return ["checked", "title", "disabled", "size", "label"];
  }

  constructor() {
    super();
    this._state = {
      checked: false,
      title: "",
      disabled: false,
      size: "normal",
      label: "",
    };
    this._updating = false;
    this._internalUpdate = false;
    this._render();
  }

  /**
   * 处理尺寸值
   * @param {string} val - 尺寸值
   * @returns {string} - 处理后的尺寸值
   */
  _processSizeValue(val) {
    if (!val) return "normal";

    // 检查是否包含单位
    if (/^\d+(\.\d+)?(px|rem|em|%|vh|vw)$/.test(val)) {
      return val;
    }
    // 检查是否是纯数字
    else if (!isNaN(parseFloat(val)) && isFinite(parseFloat(val))) {
      return parseFloat(val) + "em";
    }
    return val;
  }
  /**
   * 更新属性值并同步到DOM
   * @param {string} prop - 内部状态属性名
   * @param {any} value - 属性值
   */
  _updateProperty(prop, value) {
    const oldValue = this._state[prop];
    const newValue = prop === "size" ? this._processSizeValue(value) : value;
    if (oldValue !== newValue) {
      this._state[prop] = newValue;
      this._internalUpdate = true;
      // 修改内部处理
      if (prop === "checked") {
        this.setAttribute(prop, newValue);
      } else if (newValue) {
        this.setAttribute(prop, newValue);
      } else {
        this.removeAttribute(prop);
      }
      this._internalUpdate = false;

      if (!this._updating) {
        this._update();
      }
      return true;
    }
    return false;
  }

  /**
   * 属性变化回调
   * @param {string} name - 属性名
   * @param {any} oldValue - 旧属性值
   * @param {any} newValue - 新属性值
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (this._internalUpdate || oldValue === newValue) return;

    const handlers = {
      checked: () => this._updateProperty("checked", newValue !== null),
      title: () => this._updateProperty("title", newValue),
      disabled: () => this._updateProperty("disabled", newValue !== null),
      size: () => this._updateProperty("size", newValue),
      label: () => this._updateProperty("label", newValue),
    };

    if (handlers[name]) {
      handlers[name]();
    }
  }

  connectedCallback() {
    // 初始化属性
    this._updateProperty("checked", this.hasAttribute("checked"));
    this._updateProperty("title", this.getAttribute("title"));
    this._updateProperty("disabled", this.hasAttribute("disabled"));
    this._updateProperty("size", this.getAttribute("size"));
    this._updateProperty("label", this.getAttribute("label"));

    this._update();
    this._boundClickHandler = this._handleClick.bind(this);
    this.addEventListener("click", this._boundClickHandler);
  }

  disconnectedCallback() {
    this.removeEventListener("click", this._boundClickHandler);
    this._boundClickHandler = null;
  }

  /**
   * 处理点击事件
   * @param {Event} event - 事件对象
   */
  _handleClick(event) {
    if (this._state.disabled) return;
    const newValue = !this._state.checked;
    if (this._updateProperty("checked", newValue)) {
      // 触发change事件
      this.dispatchEvent(
        new CustomEvent("change", {
          bubbles: true,
          detail: { checked: newValue },
        })
      );
    }
  }

  /**
   * 更新组件状态
   */
  _update() {
    if (this._updating) return;
    this._updating = true;

    // 确保开关元素存在
    if (!this._switchElement) {
      this._render();
    }

    // 更新开关状态
    const addClass = this._state.checked ? "fa-toggle-on" : "fa-toggle-off";
    const removeClass = this._state.checked ? "fa-toggle-off" : "fa-toggle-on";
    this._switchElement.classList.remove(removeClass);
    this._switchElement.classList.add(addClass);

    // 更新大小
    this.classList.remove("size-small", "size-normal", "size-large");

    // 应用大小
    if (["small", "normal", "large"].includes(this._state.size)) {
      this.classList.add(`size-${this._state.size}`);
      this.style.fontSize = "";
    } else {
      this.style.fontSize = this._state.size;
    }

    // 设置标题
    this.title = this._state.title;

    // 处理标签
    if (this._labelElement) {
      if (this._state.label) {
        this._labelElement.textContent = this._state.label;
        this._labelElement.style.display = "";
      } else {
        this._labelElement.textContent = "";
        this._labelElement.style.display = "none";
      }
    }

    this._updating = false;
  }

  /**
   * 渲染组件
   */
  _render() {
    this.innerHTML = "";

    // 直接创建开关图标元素
    this._switchElement = document.createElement("div");
    this._switchElement.className = `icon fa-solid ${
      this._state.checked ? "fa-toggle-on" : "fa-toggle-off"
    }`;

    // 创建标签元素
    this._labelElement = document.createElement("span");
    this._labelElement.className = "label";

    // 直接将开关图标和标签添加到组件中
    this.appendChild(this._switchElement);
    this.appendChild(this._labelElement);

    // 给组件自身添加容器类
    this.className = `switch-button size-${this._state.size}`;
  }

  /**
   * 公共API
   */
  get checked() {
    return this._state.checked;
  }

  set checked(val) {
    this._updateProperty("checked", Boolean(val));
  }

  get size() {
    return this._state.size;
  }

  set size(val) {
    this._updateProperty("size", val);
  }

  get label() {
    return this._state.label;
  }

  set label(val) {
    this._updateProperty("label", val);
  }
}
// 注册自定义元素
customElements.define("switch-button", SwitchButton);
