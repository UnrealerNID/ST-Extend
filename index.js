import ExtendManager from "./src/models/extend-manager.js";
import ExtendUtils from "./src/utils/extend-utils.js";

// 检查页面是否正在加载中
const waitForPageLoad = async () => {
  // 检查是否有加载器显示
  if ($("#loader").length > 0 || $(".loading_block").length > 0) {
    console.log("检测到页面加载中，等待加载完成...");
    // 等待一段时间后再次检查
    await new Promise((resolve) => setTimeout(resolve, 500));
    return waitForPageLoad();
  }
  console.log("页面加载完成，开始初始化插件");
  return true;
};

const extendManager = new ExtendManager();

// 当扩展加载时调用此函数
jQuery(async () => {
  try {
    // 加载HTML设置界面
    const html = await $.get(`${ExtendUtils.extensionFolderPath}/index.html`);
    $("#extensions_settings").append(html);
    // 等待页面加载完成
    await waitForPageLoad();
    console.log(ExtendUtils.getContext());
    // 初始化插件管理器
    extendManager.init();
  } catch (error) {
    console.error("初始化插件扩展时出错:", error);
    toastr.error("初始化插件扩展失败", "错误");
  }
});
