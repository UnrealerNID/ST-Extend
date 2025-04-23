import { eventSource, event_types } from "../../../../../../../script.js";
/**
 * 事件处理工具类
 * 提供与SillyTavern事件交互的方法
 */

class STEvent {
  /**
   * 获取标准化的事件键
   * @param {string|symbol} eventType - 事件类型，可以是event_types中的常量
   * @returns {string} 标准化后的事件键
   * @private
   */
  static _getEventKey(eventType) {
    return typeof eventType === "string" && event_types[eventType]
      ? event_types[eventType]
      : eventType;
  }
  /**
   * 监听事件
   * @param {string|symbol} eventType - 事件类型，可以是event_types中的常量
   * @param {Function} callback - 事件处理函数
   */
  static on(eventType, callback) {
    // 如果传入的是事件类型的字符串名称，则从event_types中获取对应的值
    const eventKey = this._getEventKey(eventType);
    this.off(eventKey, callback);
    eventSource.on(eventKey, callback);
  }
  /**
   * 移除事件监听器
   * @param {string|symbol} eventType - 事件类型，可以是event_types中的常量
   * @param {Function} callback - 事件处理函数
   */
  static off(eventType, callback) {
    // 如果传入的是事件类型的字符串名称，则从event_types中获取对应的值
    const eventKey = this._getEventKey(eventType);
    eventSource.removeListener(eventKey, callback);
  }
}

export default STEvent;
