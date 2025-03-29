import { extension_settings } from "../../../../extensions.js";

/**
 * 插件加载器类
 * 负责加载和卸载插件，支持开发模式和生产模式
 */
class PluginLoader {
  /**
   * 创建插件加载器实例
   * @param {string} extensionName - 扩展名称
   */
  constructor(extensionName) {
    this.extensionName = extensionName;
    this.settings = extension_settings[extensionName] || {};
    this.extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
    this.loadingFlagName = `${extensionName}_pluginLoading`;
  }

  /**
   * 卸载插件
   */
  unload() {
    // 移除所有插件相关的脚本和样式
    // @ts-ignore
    $(`script[data-vue-plugin-id='${this.extensionName}']`).remove();
    // @ts-ignore
    $(`link[data-vue-plugin-id='${this.extensionName}']`).remove();

    // 清空插件挂载点
    // @ts-ignore
    $("#plugin-app").empty();

    console.log("插件已卸载");
  }

  /**
   * 检查插件是否已加载
   * @returns {boolean} - 是否已加载
   */
  isLoaded() {
    return (
      // @ts-ignore
      $(`script[data-vue-plugin-id='${this.extensionName}']`).length > 0 ||
      // @ts-ignore
      $(`link[data-vue-plugin-id='${this.extensionName}']`).length > 0
    );
  }

  /**
   * 设置加载标志
   * @param {boolean} value - 标志值
   */
  setLoadingFlag(value) {
    // @ts-ignore
    window[this.loadingFlagName] = value;
  }

  /**
   * 加载插件
   */
  load() {
    // 如果设置中禁用了插件，则直接返回
    if (!this.settings.enablePlugin) {
      console.log("插件已禁用，跳过加载");
      return;
    }

    // 如果插件已加载，则先卸载
    if (this.isLoaded()) {
      this.unload();
    }

    // 根据开发模式选择加载方式
    if (this.settings.devMode) {
      this.loadInDevMode();
    } else {
      this.loadInProductionMode();
    }
  }

  /**
   * 重新加载插件
   */
  reload() {
    this.unload();
    this.load();
  }

  /**
   * 在开发模式下加载插件
   */
  loadInDevMode() {
    const { devServerUrl } = this.settings;
    const { extensionName } = this;
    const { loadingFlagName } = this;

    // 如果已经在加载中，则返回
    // @ts-ignore
    if (window[loadingFlagName]) {
      console.log("插件正在加载中，请稍候...");
      return;
    }

    // 设置加载标志
    this.setLoadingFlag(true);

    // 创建script元素
    const script = document.createElement("script");
    script.setAttribute("data-vue-plugin-id", extensionName);
    script.type = "module";
    script.textContent = `
      try {
        // 动态导入插件
        import('${devServerUrl}/@vite/client')
          .then(() => {
            return import('${devServerUrl}/src/main.js');
          })
          .then((module) => {
            // 保存导出的函数到全局变量，以便卸载时使用
            window.pluginExports = module;
            
            // 调用createPluginApp函数创建插件实例
            if (typeof module.createPluginApp === 'function') {
              window.vueAppInstance = module.createPluginApp({
                // 这里可以传递配置选项
                extensionName: '${extensionName}'
              });
              console.log('插件已成功挂载');
            } else {
              console.error('插件缺少必要的挂载函数');
            }
            
            console.log('插件模块已成功加载');
            window.${loadingFlagName} = false; // 重置加载标志
          })
          .catch(error => {
            console.error('加载插件模块时出错:', error);
            window.${loadingFlagName} = false; // 重置加载标志
          });
      } catch (error) {
        console.error('动态导入插件时出错:', error);
        window.${loadingFlagName} = false; // 重置加载标志
      }
    `;
    document.body.appendChild(script);

    // @ts-ignore
    toastr.success("插件已在开发模式下加载", "开发模式");
  }

  /**
   * 在生产模式下加载插件
   */
  loadInProductionMode() {
    const cssPath = `${this.extensionFolderPath}/../vue-app/dist/assets/index.css`;
    const jsPath = `${this.extensionFolderPath}/../vue-app/dist/assets/index.js`;

    // 检查CSS文件是否存在并加载
    this.loadCssFile(cssPath)
      .then(() => this.loadJsFile(jsPath))
      .catch((error) => this.handleError(error, "加载插件时出错"));
  }

  /**
   * 加载CSS文件
   * @param {string} cssPath - CSS文件路径
   * @returns {Promise} - Promise对象
   */
  loadCssFile(cssPath) {
    return fetch(cssPath)
      .then((response) => {
        if (response.ok) {
          const link = document.createElement("link");
          link.setAttribute("data-vue-plugin-id", this.extensionName);
          link.rel = "stylesheet";
          link.href = cssPath;
          document.head.appendChild(link);
        }
        return Promise.resolve();
      })
      .catch((error) => {
        console.warn("加载CSS文件时出错:", error);
        return Promise.resolve(); // 继续加载JS，即使CSS加载失败
      });
  }

  /**
   * 加载JS文件
   * @param {string} jsPath - JS文件路径
   * @returns {Promise} - Promise对象
   */
  loadJsFile(jsPath) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.setAttribute("data-vue-plugin-id", this.extensionName);
      script.type = "module";
      script.src = jsPath;

      script.onload = () => {
        console.log("插件JS文件已加载");

        // 如果存在createPluginApp函数，则创建插件实例
        // @ts-ignore
        if (typeof window.createPluginApp === "function") {
          // @ts-ignore
          window.vueAppInstance = window.createPluginApp({
            // 这里可以传递配置选项
            extensionName: this.extensionName,
          });
          console.log("插件已成功挂载");
          resolve();
        } else {
          const error = new Error("插件缺少必要的挂载函数");
          this.handleError(error, "插件缺少必要的挂载函数");
          reject(error);
        }
      };

      script.onerror = (event) => {
        const error = new Error(`加载JS文件 ${jsPath} 失败`);
        this.handleError(error, "加载JS文件时出错");
        reject(error);
      };

      document.body.appendChild(script);
    });
  }

  /**
   * 注册插件加载器
   * 将插件加载器实例注册到全局变量中，以便其他模块使用
   */
  register() {
    // @ts-ignore
    window.pluginLoaders = window.pluginLoaders || {};
    // @ts-ignore
    window.pluginLoaders[this.extensionName] = this;
    console.log(`插件加载器 ${this.extensionName} 已注册`);
  }

  /**
   * 处理错误
   * @param {Error} error - 错误对象
   * @param {string} message - 错误消息
   */
  handleError(error, message) {
    console.error(message, error);
    // @ts-ignore
    toastr.error(message, "错误");
  }
}

// 导出插件加载器类
export default PluginLoader;
