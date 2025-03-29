import { reactive } from "vue";

/**
 * 全局ComponentManager实例
 * 使用全局变量而非Vue的provide/inject机制，避免Symbol不匹配问题
 * @private
 */
let globalComponentManager = null;

/**
 * 设置全局ComponentManager实例
 * 在应用初始化时调用此函数，设置全局可访问的组件管理器
 *
 * @param {Object} componentManager - ComponentManager实例
 */
export function setComponentManager(componentManager) {
  globalComponentManager = componentManager;
}

/**
 * 组件管理器的Composition API钩子
 * 提供响应式的组件管理功能，可在任何Vue组件中使用
 *
 * @returns {Object} 包含以下属性和方法的对象:
 *   - manager: 原始ComponentManager实例
 *   - components: 响应式组件列表对象，包含list数组和refresh方法
 *   - mount: 挂载指定组件的方法
 *   - unmount: 卸载指定组件的方法
 *   - setAutoMount: 设置组件自动挂载状态的方法
 *   - mountAutoComponents: 挂载所有设置为自动挂载的组件
 *   - unmountAll: 卸载所有已挂载的组件
 *   - isActive: 检查组件是否已挂载的方法
 */
export function useComponentManager() {
  // 检查全局实例是否已设置
  if (!globalComponentManager) {
    console.error(
      "未找到ComponentManager实例，请确保在应用初始化时调用了setComponentManager"
    );
    // 返回空实现，避免调用方出错
    return {
      components: { list: [] },
      mount: () => null,
      unmount: () => false,
      setAutoMount: () => {},
      mountAutoComponents: () => {},
      unmountAll: () => {},
      isActive: () => false,
    };
  }

  /**
   * 响应式组件列表对象
   * 包含所有已注册组件的信息，可在模板中直接使用
   */
  const components = reactive({
    // 组件列表数组
    list: [],

    /**
     * 刷新组件列表
     * 从ComponentManager获取最新的组件状态
     */
    refresh() {
      this.list = Array.from(globalComponentManager._components.entries()).map(
        ([id, config]) => ({
          id, // 组件ID
          selector: config.selector, // 挂载选择器
          isActive: !!config.instance, // 是否已挂载
          autoMount: config.autoMount, // 是否自动挂载
        })
      );
    },
  });

  // 初始化时刷新组件列表
  components.refresh();

  // 返回包含组件管理功能的对象
  return {
    // 原始ComponentManager实例，用于高级操作
    manager: globalComponentManager,

    // 响应式组件列表，用于UI展示
    components,

    /**
     * 挂载指定组件
     * @param {string} id - 组件ID
     * @param {Object} props - 组件属性
     * @returns {Object|null} 组件实例或null
     */
    mount(id, props) {
      const result = globalComponentManager.mount(id, props);
      components.refresh();
      return result;
    },

    /**
     * 卸载指定组件
     * @param {string} id - 组件ID
     * @returns {boolean} 是否成功卸载
     */
    unmount(id) {
      const result = globalComponentManager.unmount(id);
      components.refresh();
      return result;
    },

    /**
     * 设置组件的自动挂载状态
     * @param {string} id - 组件ID
     * @param {boolean} value - 是否自动挂载
     */
    setAutoMount(id, value) {
      globalComponentManager.setAutoMount(id, value);
      components.refresh();
    },

    /**
     * 挂载所有设置为自动挂载的组件
     * @param {Object} props - 组件属性
     */
    mountAutoComponents(props) {
      globalComponentManager.mountAutoComponents(props);
      components.refresh();
    },

    /**
     * 卸载所有已挂载的组件
     */
    unmountAll() {
      globalComponentManager.unmountAll();
      components.refresh();
    },

    /**
     * 检查组件是否已挂载
     * @param {string} id - 组件ID
     * @returns {boolean} 组件是否已挂载
     */
    isActive(id) {
      const config = globalComponentManager.getConfig(id);
      return config && !!config.instance;
    },
  };
}
