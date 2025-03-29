import "./assets/css/style.css";
import App from "./App.vue";
import GoogleAPI from "./components/api/GoogleAPI.vue";
import ComponentManager from "./utils/ComponentManager";
import { createApp } from "vue";
import { setComponentManager } from "./utils/useComponentManager";

// 创建组件管理器实例
const componentManager = new ComponentManager();

// 设置全局ComponentManager实例
setComponentManager(componentManager);

// 注册组件
componentManager
  .register("main", {
    component: App,
    selector: "#plugin-app",
    autoMount: true,
  })
  .register("googleApi", {
    component: GoogleAPI,
    selector: "#makersuite_form",
    autoMount: true,
  });

/**
 * 创建插件应用的工厂函数
 * 这是插件加载器期望的函数
 * @param {Object} options - 配置选项
 * @returns {Object} - 应用实例控制器
 */
function createPluginApp(options = {}) {
  console.log("创建插件应用，选项:", options);

  // 卸载所有已存在的组件
  componentManager.unmountAll();

  // 创建Vue应用实例并挂载到#plugin-app
  const mainMountElement = document.querySelector("#plugin-app");
  if (mainMountElement) {
    // 创建一个新的挂载点
    const appRoot = document.createElement("div");
    appRoot.setAttribute("data-vue-app-root", "true");
    mainMountElement.appendChild(appRoot);

    // 创建应用实例
    const app = createApp(App, options);

    // 挂载应用
    app.mount(appRoot);
  }

  // 挂载所有设置为自动挂载的组件
  componentManager.mountAutoComponents(options);

  // 返回主应用实例
  const mainConfig = componentManager.getConfig("main");
  return mainConfig ? mainConfig.instance : null;
}

// 使用立即执行函数初始化应用
(async function initApp() {
  // 等待DOM加载完成
  if (document.readyState === "loading") {
    await new Promise((resolve) => {
      document.addEventListener("DOMContentLoaded", resolve, { once: true });
    });
  }

  // 挂载所有设置为自动挂载的组件
  componentManager.mountAutoComponents();
})().catch((err) => console.error("初始化Vue应用失败:", err));

// 导出API，以便外部使用
export { createPluginApp, componentManager };
