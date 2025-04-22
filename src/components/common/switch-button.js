/**
 * SwitchButton - 自定义开关按钮组件
 * 使用Font Awesome图标实现切换效果
 */
class SwitchButton extends HTMLElement {
  /**
   * 定义需要观察的属性
   */
  static get observedAttributes() {
    return ["value", "title", "disabled"];
  }

  /**
   * 构造函数
   */
  constructor() {
    super();

    // 内部状态
    this._state = {
      checked: false,
      title: "",
      disabled: false,
    };
    this._updating = false;
    // 初始渲染
    this._render();
  }
  /**
   * 属性变化回调
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    // 使用对象映射简化switch语句
    const handlers = {
      value: () => (this._state.checked = newValue !== null),
      title: () => (this._state.title = newValue || ""),
      disabled: () => (this._state.disabled = newValue !== null),
    };

    if (handlers[name]) {
      handlers[name]();
      this._update();
    }
  }

  /**
   * 组件挂载回调
   */
  connectedCallback() {
    // 初始化属性
    this._state.checked = this.hasAttribute("value");
    this._state.title = this.getAttribute("title") || "";
    this._state.disabled = this.hasAttribute("disabled");

    this._update();
    this.addEventListener("click", this._handleClick.bind(this));
  }

  /**
   * 组件卸载回调
   */
  disconnectedCallback() {
    this.removeEventListener("click", this._handleClick);
  }

  /**
   * 处理点击事件
   */
  _handleClick() {
    if (this._state.disabled) return;

    this._state.checked = !this._state.checked;
    // 先更新属性，这会触发attributeChangedCallback，然后调用_update
    if (this._state.checked) {
      this.setAttribute("value", "");
    } else {
      this.removeAttribute("value");
    }

    // 触发change事件
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        detail: { value: this._state.checked },
      })
    );
  }

  /**
   * 更新组件UI
   */
  _update() {
    // 防止递归调用
    if (this._updating) return;
    this._updating = true;
    // 使用三元运算符简化类名切换
    const addClass = this._state.checked ? "fa-toggle-on" : "fa-toggle-off";
    const removeClass = this._state.checked ? "fa-toggle-off" : "fa-toggle-on";
    this.classList.remove(removeClass);
    this.classList.add(addClass);
    this.title = this._state.title;
    // 重置标志
    this._updating = false;
  }
  /**
   * 渲染组件模板
   */
  _render() {
    this.className = `fa-solid killSwitch ${
      this._state.checked ? "fa-toggle-on" : "fa-toggle-off"
    }`;
  }

  /**
   * 获取/设置开关状态
   */
  get value() {
    return this._state.checked;
  }

  set value(val) {
    this._state.checked = Boolean(val);
    this._update();

    if (this._state.checked) {
      this.setAttribute("value", "");
    } else {
      this.removeAttribute("value");
    }
  }
}

// 注册自定义元素
customElements.define("switch-button", SwitchButton);
