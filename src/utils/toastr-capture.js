/**
 * Toastr弹窗捕获器
 * 使用MutationObserver监听DOM变化，实时捕获并处理toastr弹窗
 * 静态类实现，无需实例化
 */
class ToastrCapture {
  /**
   * @type {MutationObserver}
   * @private
   */
  static _observer = null;
  /**
   * @type {Map<string, {callback: Function, filter: Object}>}
   * @private
   */
  static _listeners = new Map();
  /**
   * @type {boolean}
   * @private
   */
  static _isObserving = false;

  /**
   * 添加监听器
   * @param {Function} callback - 当捕获到新的toastr时调用的回调函数
   * @param {Object} [filter=null] - 筛选条件
   * @param {string} [filter.type] - toastr类型 (error, warning, success, info)
   * @param {string} [filter.title] - 标题包含的文本
   * @param {string} [filter.message] - 消息包含的文本
   * @param {Function} [filter.custom] - 自定义匹配函数
   * @returns {string} 监听器ID，用于后续移除
   */
  static addListener(callback, filter = null) {
    if (typeof callback !== "function") {
      throw new Error("回调必须是函数");
    }

    // 生成唯一ID
    const id =
      "listener_" +
      Date.now() +
      "_" +
      Math.random().toString(36).substring(2, 9);

    // 添加到监听器列表
    this._listeners.set(id, {
      callback,
      filter,
    });

    // 如果还没有开始观察，则开始
    if (!this._isObserving) {
      this._startObserving();
    }

    return id;
  }

  /**
   * 移除指定监听器
   * @param {string} listenerId - 监听器ID
   * @returns {boolean} 是否成功移除
   */
  static removeListener(listenerId) {
    const hasListener = this._listeners.has(listenerId);
    if (hasListener) {
      this._listeners.delete(listenerId);
    }

    // 如果没有监听器了，停止观察
    if (this._listeners.size === 0) {
      this.stop();
    }

    return hasListener;
  }

  /**
   * 移除所有监听器
   * @returns {typeof ToastrCapture} 当前类，用于链式调用
   */
  static removeAllListeners() {
    this._listeners.clear();
    this.stop();
    return this;
  }

  /**
   * 开始观察toastr弹窗 (向后兼容)
   * @param {Function} [callback] - 可选的回调函数，当捕获到新的toastr时调用
   * @returns {string} 监听器ID
   */
  static start(callback = null) {
    if (!callback) {
      if (!this._isObserving) {
        this._startObserving();
      }
      return "";
    }

    return this.addListener(callback, this._filter);
  }

  /**
   * 内部方法：开始观察
   * @private
   */
  static _startObserving() {
    if (this._isObserving) return;
    console.log("开始观察 DOM 变化");

    // 创建观察器配置
    const config = {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    };

    // 创建观察器
    this._observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          // 检查新增的节点
          mutation.addedNodes.forEach((node) => {
            // 检查是否是toastr弹窗
            if (
              node.nodeType === 1 &&
              this._isToastrNode(/** @type {HTMLElement} */ (node))
            ) {
              // 提取信息
              const toastrInfo = this._extractToastrInfo(
                /** @type {HTMLElement} */ (node)
              );

              // 通知所有匹配的监听器
              this._notifyListeners(toastrInfo);
            }
          });
        }
      });
    });

    // 开始观察
    this._observer.observe(/** @type {Node} */ (document.body), config);
    this._isObserving = true;
  }

  /**
   * 通知所有匹配的监听器
   * @param {Object} toastrInfo - toastr信息
   * @private
   */
  static _notifyListeners(toastrInfo) {
    this._listeners.forEach((listener) => {
      if (this._matchesFilter(toastrInfo, listener.filter)) {
        listener.callback(toastrInfo);
      }
    });
  }

  /**
   * 停止观察
   * @returns {typeof ToastrCapture} 当前类，用于链式调用
   */
  static stop() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
      this._isObserving = false;
    }

    return this;
  }

  /**
   * 设置筛选条件 (向后兼容)
   * @param {Object} filter - 筛选条件
   * @returns {typeof ToastrCapture} 当前类，用于链式调用
   */
  static setFilter(filter = null) {
    this._filter = filter;
    return this;
  }

  /**
   * 检查toastr是否匹配筛选条件
   * @param {Object} toastr - toastr信息
   * @param {Object} filter - 筛选条件
   * @returns {boolean} 是否匹配
   * @private
   */
  static _matchesFilter(toastr, filter) {
    if (!filter) return true;

    // 匹配类型
    if (filter.type && toastr.type !== filter.type) {
      return false;
    }

    // 匹配标题
    if (filter.title && !toastr.title.includes(filter.title)) {
      return false;
    }

    // 匹配消息
    if (filter.message && !toastr.message.includes(filter.message)) {
      return false;
    }

    // 自定义匹配函数
    if (filter.custom && typeof filter.custom === "function") {
      return filter.custom(toastr);
    }

    return true;
  }

  /**
   * 检查节点是否是toastr弹窗
   * @param {HTMLElement} node - DOM节点
   * @returns {boolean} 是否是toastr节点
   * @private
   */
  static _isToastrNode(node) {
    // 检查常见的toastr类名
    return (
      node.classList &&
      (node.classList.contains("toast") ||
        node.classList.contains("toastr") ||
        node.classList.contains("toast-container") ||
        !!(
          node.querySelector &&
          (node.querySelector(".toast") || node.querySelector(".toastr"))
        ))
    );
  }

  /**
   * 从节点提取toastr信息
   * @param {HTMLElement} node - toastr节点
   * @returns {Object} toastr信息
   * @private
   */
  static _extractToastrInfo(node) {
    // 找到实际的toast元素
    const toastElement =
      node.classList.contains("toast") || node.classList.contains("toastr")
        ? node
        : node.querySelector(".toast, .toastr");

    if (!toastElement) {
      return {
        type: "unknown",
        title: "",
        message: node.textContent || "",
        element: node,
        timestamp: new Date(),
      };
    }

    // 获取类型
    const type = this._getToastrType(/** @type {HTMLElement} */ (toastElement));

    // 获取标题和消息
    const titleElement = toastElement.querySelector(".toast-title");
    const messageElement = toastElement.querySelector(".toast-message");

    return {
      type,
      title: titleElement ? titleElement.textContent : "",
      message: messageElement ? messageElement.textContent : "",
      element: toastElement,
      timestamp: new Date(),
    };
  }

  /**
   * 获取toastr类型
   * @param {HTMLElement} element - toastr元素
   * @returns {string} 类型
   * @private
   */
  static _getToastrType(element) {
    if (element.classList.contains("toast-error")) return "error";
    if (element.classList.contains("toast-warning")) return "warning";
    if (element.classList.contains("toast-success")) return "success";
    if (element.classList.contains("toast-info")) return "info";
    return "unknown";
  }
}

// 导出类
export default ToastrCapture;
