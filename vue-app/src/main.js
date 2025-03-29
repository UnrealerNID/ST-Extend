import { createApp } from "vue";
import "./assets/css/style.css";
import App from "./App.vue";
import GoogleAPI from "./components/api/GoogleAPI.vue";

// 创建一个对象来存储所有已挂载的应用实例
const appInstances = {};

/**
 * 创建并挂载Vue应用
 * @param {string} selector - 挂载点选择器
 * @param {Object} component - 要挂载的组件
 * @param {Object} props - 传递给组件的属性
 * @returns {Object} - Vue应用实例
 */
function mountComponent(selector, component, props = {}) {
  // 检查挂载点是否存在
  const mountElement = document.querySelector(selector);
  if (!mountElement) {
    console.error(`找不到挂载点 ${selector}，Vue组件挂载失败`);
    return null;
  }

  // 创建一个新的挂载点，避免覆盖原有内容
  const appRoot = document.createElement("div");
  appRoot.setAttribute("data-vue-app-root", "true");
  mountElement.appendChild(appRoot);

  // 创建并挂载应用
  const app = createApp(component, props);
  app.mount(appRoot);

  // 保存应用实例，以便后续可以卸载
  const instanceId = `${selector}-${Date.now()}`;
  appInstances[instanceId] = {
    app,
    element: appRoot,
    unmount: () => {
      app.unmount();
      appRoot.remove();
      delete appInstances[instanceId];
    },
  };

  console.log(`Vue组件已挂载到 ${selector}`);
  return appInstances[instanceId];
}

/**
 * 卸载所有Vue应用实例
 */
function unmountAllComponents() {
  Object.values(appInstances).forEach((instance) => {
    if (instance && typeof instance.unmount === "function") {
      instance.unmount();
    }
  });
}

/**
 * 挂载主应用
 */
function mountMainApp() {
  // 检查主挂载点是否存在
  const mainMountElement = document.getElementById("plugin-app");
  if (mainMountElement) {
    mountComponent("#plugin-app", App);
  } else {
    console.error("找不到主挂载点 #plugin-app，Vue应用挂载失败");
  }
}

/**
 * 挂载GoogleAPI组件到指定表单
 */
function mountGoogleAPIToForm() {
  const formElement = document.getElementById("makersuite_form");
  if (formElement) {
    mountComponent("#makersuite_form", GoogleAPI);
  } else {
    // 如果表单还没加载，稍后再试
    console.log("MakerSuite表单尚未加载，将在稍后尝试挂载");
    setTimeout(mountGoogleAPIToForm, 1000);
  }
}

/**
 * 创建插件应用的工厂函数
 * 这是插件加载器期望的函数
 * @param {Object} options - 配置选项
 * @returns {Object} - 应用实例
 */
function createPluginApp(options = {}) {
  console.log("创建插件应用，选项:", options);

  // 卸载所有已存在的组件
  unmountAllComponents();

  // 挂载主应用
  const appInstance = mountComponent("#plugin-app", App, options);

  // 如果需要挂载GoogleAPI组件
  if (options.enableGoogleAPI) {
    mountGoogleAPIToForm();
  }

  return appInstance;
}

// 如果文档已经加载完成，直接挂载
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  mountMainApp();
  mountGoogleAPIToForm();
} else {
  // 否则等待DOM加载完成后再挂载
  document.addEventListener("DOMContentLoaded", () => {
    mountMainApp();
    mountGoogleAPIToForm();
  });
}

// 导出API，以便外部使用
export { mountComponent, unmountAllComponents, createPluginApp };
