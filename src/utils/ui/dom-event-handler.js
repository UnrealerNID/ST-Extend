/**
 * 事件处理工具类
 */
class DOMEventHandler {
  /**
   * 绑定单个UI事件
   * @param {string} selector - 元素选择器
   * @param {string} event - 事件名称
   * @param {Function} handler - 事件处理函数
   */
  static bind(selector, event, handler) {
    this.unbind(selector, event);
    $(selector).on(event, handler);
  }

  /**
   * 解绑单个UI事件
   * @param {string} selector - 元素选择器
   * @param {string} event - 事件名称
   */
  static unbind(selector, event) {
    $(selector).off(event);
  }

  /**
   * 触发元素事件
   * @param {Object} options - 触发事件选项
   * @param {string} [options.selector] - 元素选择器
   * @param {string} [options.event] - 要触发的事件名称
   * @param {Object} [options.data] - 事件数据
   */
  static trigger({ selector, event, data = null } = {}) {
    if (!selector || !event) return;
    $(selector).trigger(event, data);
  }

  /**
   * 设置属性并触发事件
   * @param {Object} options - 选项
   * @param {string} [options.selector] - 元素选择器
   * @param {string} [options.prop] - 要设置的属性
   * @param {any} [options.value] - 属性值
   * @param {string} [options.event] - 要触发的事件
   * @param {Object} [options.data] - 事件数据
   */
  static setPropAndTriggerEvent({
    selector,
    prop,
    value,
    event,
    data = null,
  } = {}) {
    if (!selector || !prop) return;
    $(selector).prop(prop, value).trigger(event, data);
  }
  /**
   * 设置属性但不触发事件
   * @param {string} [selector] - 元素选择器
   * @param {string} [prop] - 要设置的属性
   * @param {any} [value] - 属性值
   */
  static propEvent(selector, prop, value) {
    if (!selector || !prop) return;

    // 只设置属性，不触发事件
    $(selector).prop(prop, value);
  }
  /**
   * 处理事件
   * @param {Object} options - 事件处理选项
   * @param {Event} [options.event] - 事件对象
   * @param {string} [options.prop] - 属性名
   * @param {Function} [options.func] - 事件处理函数
   * @param {string} [options.settingKey] - 设置键名
   * @param {Function} [options.callback] - 回调函数
   */
  static handleEvent({
    event,
    prop,
    func = null,
    settingKey = null,
    callback = null,
  } = {}) {
    if (!event || !prop) return;

    const value = $(event.target).prop(prop);
    if (func && settingKey) {
      func(settingKey, value);
    }
    if (typeof callback === "function") {
      callback(value);
    }
  }
}

export default DOMEventHandler;
