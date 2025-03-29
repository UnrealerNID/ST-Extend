import { createApp } from "vue";

/**
 * 组件管理器类
 * 负责Vue组件的注册、挂载和生命周期管理
 *
 * 该类提供了一个集中式的组件管理解决方案，允许在应用的任何位置
 * 动态地挂载和卸载Vue组件，而不需要修改现有DOM结构
 */
class ComponentManager {
  /**
   * 创建一个新的组件管理器实例
   */
  constructor() {
    /**
     * 存储组件配置的Map
     * @private
     * @type {Map<string, Object>}
     */
    this._components = new Map();

    /**
     * 存储应用实例的Map
     * @private
     * @type {Map<string, Object>}
     */
    this._appInstances = new Map();
  }

  /**
   * 注册组件到管理器
   *
   * @param {string} id - 组件唯一标识符
   * @param {Object} config - 组件配置对象
   * @param {Object} config.component - Vue组件对象
   * @param {string} config.selector - DOM挂载点选择器
   * @param {boolean} [config.autoMount=true] - 是否在调用mountAutoComponents时自动挂载
   * @param {Object} [config.defaultProps={}] - 默认传递给组件的属性
   * @returns {ComponentManager} - 返回this以支持链式调用
   */
  register(id, { component, selector, autoMount = true, defaultProps = {} }) {
    this._components.set(id, {
      component,
      selector,
      autoMount,
      defaultProps,
      instance: null,
    });
    return this;
  }

  /**
   * 挂载已注册的组件
   *
   * @param {string} id - 要挂载的组件ID
   * @param {Object} [props={}] - 传递给组件的属性，将与默认属性合并
   * @returns {Object|null} - 返回组件实例控制器，如果挂载失败则返回null
   */
  mount(id, props = {}) {
    if (!this._components.has(id)) {
      console.error(`组件 ${id} 未注册`);
      return null;
    }

    const config = this._components.get(id);
    const mergedProps = { ...config.defaultProps, ...props };

    const instance = this._mountComponent(
      config.selector,
      config.component,
      mergedProps
    );
    if (instance) {
      config.instance = instance;
    }

    return instance;
  }

  /**
   * 卸载已挂载的组件
   *
   * @param {string} id - 要卸载的组件ID
   * @returns {boolean} - 如果成功卸载返回true，否则返回false
   */
  unmount(id) {
    if (!this._components.has(id)) {
      return false;
    }

    const config = this._components.get(id);
    if (config.instance) {
      config.instance.unmount();
      config.instance = null;
      return true;
    }

    return this._unmountComponent(config.selector);
  }

  /**
   * 获取组件配置
   *
   * @param {string} id - 组件ID
   * @returns {Object|undefined} - 返回组件配置对象，如果不存在则返回undefined
   */
  getConfig(id) {
    return this._components.get(id);
  }

  /**
   * 设置组件是否自动挂载
   *
   * @param {string} id - 组件ID
   * @param {boolean} autoMount - 是否在调用mountAutoComponents时自动挂载
   */
  setAutoMount(id, autoMount) {
    if (this._components.has(id)) {
      const config = this._components.get(id);
      config.autoMount = autoMount;
    }
  }

  /**
   * 挂载所有设置为自动挂载的组件
   *
   * @param {Object} [globalProps={}] - 传递给所有自动挂载组件的全局属性
   */
  mountAutoComponents(globalProps = {}) {
    this._components.forEach((config, id) => {
      if (config.autoMount) {
        this.mount(id, globalProps);
      }
    });
  }

  /**
   * 卸载所有已挂载的组件
   */
  unmountAll() {
    this._components.forEach((config, id) => {
      this.unmount(id);
    });
  }

  /**
   * 内部方法：创建并挂载Vue应用
   *
   * @private
   * @param {string} selector - DOM挂载点选择器
   * @param {Object} component - 要挂载的Vue组件
   * @param {Object} [props={}] - 传递给组件的属性
   * @returns {Object|null} - 返回应用实例控制器，如果挂载失败则返回null
   */
  _mountComponent(selector, component, props = {}) {
    // 检查挂载点是否存在
    const mountElement = document.querySelector(selector);
    if (!mountElement) {
      console.error(`找不到挂载点 ${selector}，Vue组件挂载失败`);
      return null;
    }

    // 先检查是否已有挂载的实例，如果有则先卸载
    this._unmountComponent(selector);

    // 创建一个新的挂载点，避免覆盖原有内容
    const appRoot = document.createElement("div");
    appRoot.setAttribute("data-vue-app-root", "true");
    mountElement.appendChild(appRoot);

    // 创建并挂载应用
    const app = createApp(component, props);

    // 添加全局错误处理
    app.config.errorHandler = (err, vm, info) => {
      console.error(`Vue错误: ${err}\n信息: ${info}`);
    };

    app.mount(appRoot);

    // 创建实例控制器
    const controller = {
      /** Vue应用实例 */
      app,
      /** 挂载点DOM元素 */
      element: appRoot,
      /** 卸载方法 */
      unmount: () => this._unmountComponent(selector),
      /**
       * 更新组件属性
       * @param {Object} newProps - 新的属性对象
       */
      update: (newProps) => {
        // 允许更新props而不重新挂载整个组件
        if (app._instance && app._instance.props) {
          Object.assign(app._instance.props, newProps);
        }
      },
    };

    // 保存应用实例，以便后续可以卸载
    this._appInstances.set(selector, controller);

    console.log(`Vue组件已挂载到 ${selector}`);
    return controller;
  }

  /**
   * 内部方法：卸载指定选择器的组件
   *
   * @private
   * @param {string} selector - DOM挂载点选择器
   * @returns {boolean} - 如果成功卸载返回true，否则返回false
   */
  _unmountComponent(selector) {
    if (this._appInstances.has(selector)) {
      const instance = this._appInstances.get(selector);
      if (instance && typeof instance.app.unmount === "function") {
        instance.app.unmount();
        instance.element.remove();
        this._appInstances.delete(selector);
        return true;
      }
    }
    return false;
  }
}

// 导出组件管理器类
export default ComponentManager;
