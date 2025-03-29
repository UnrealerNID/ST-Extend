/**
 * SillyTavern 插件扩展
 * 用于加载Vue应用到SillyTavern中
 */
import PluginLoader from "./plugin-loader.js";
import SettingsManager from "./settings-manager.js";

// 记录您的扩展位置，名称应与仓库名称匹配
const extensionName = "Plugins";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;

// 初始化插件加载器
const pluginLoader = new PluginLoader(extensionName);

// 初始化设置管理器
const settingsManager = new SettingsManager(extensionName, {
  // 设置变更回调
  onDevModeChange: () => pluginLoader.reload(),
  onDevServerUrlChange: () => {
    if (pluginLoader.settings.devMode) {
      pluginLoader.reload();
    }
  },
  onEnablePluginChange: (value) => {
    if (value) {
      pluginLoader.load();
    } else {
      pluginLoader.unload();
    }
  },
});

// 当扩展加载时调用此函数
// @ts-ignore
jQuery(async () => {
  try {
    // 加载HTML设置界面
    // @ts-ignore
    const settingsHtml = await $.get(
      `${extensionFolderPath}/extension/index.html`
    );
    // @ts-ignore
    $("#extensions_settings").append(settingsHtml);

    // 绑定UI事件
    settingsManager.bindEvents();

    // 加载设置
    settingsManager.loadSettings();
    // 加载插件
    pluginLoader.load();
  } catch (error) {
    console.error("初始化插件扩展时出错:", error);
    // @ts-ignore
    toastr.error("初始化插件扩展失败", "错误");
  }
});
