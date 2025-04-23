/**
 * TemplateLoader - 通用模板加载和挂载工具类
 */
class TemplateLoader {
  /**
   * 加载并挂载HTML模板到指定容器
   * @param {string} templatePath - 模板文件路径
   * @param {string|HTMLElement} containerSelector - 容器选择器或元素
   * @param {string} [containerId] - 创建的容器ID，如果不提供则使用随机ID
   * @param {function(HTMLElement):void} [onSuccess] - 成功回调
   * @param {function(Error):void} [onError] - 错误回调
   * @returns {Promise<HTMLElement|null>} - 返回创建的容器元素或null(如果失败)
   */
  static async mountTemplate(
    templatePath,
    containerSelector,
    containerId,
    onSuccess,
    onError
  ) {
    try {
      // 获取模板内容 - 通过fetch API异步加载HTML模板文件
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error(
          `Failed to load template: ${response.status} ${response.statusText}`
        );
      }

      // 将响应转换为文本格式的HTML
      const html = await response.text();

      // 获取容器元素 - 支持选择器字符串或直接传入DOM元素
      let container;
      if (typeof containerSelector === "string") {
        // 如果是选择器字符串，使用querySelector查找DOM元素
        container = document.querySelector(containerSelector);
      } else if (containerSelector instanceof HTMLElement) {
        // 如果已经是DOM元素，直接使用
        container = containerSelector;
      }

      // 验证容器是否存在
      if (!container) {
        throw new Error(`Container not found: ${containerSelector}`);
      }
      // 解析HTML内容
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html.trim();

      // 确定要使用的容器元素
      let templateContainer;

      // 如果模板只有一个根元素，直接使用它
      if (tempDiv.childElementCount === 1) {
        templateContainer = tempDiv.firstElementChild;
        if (!(templateContainer instanceof HTMLElement)) {
          throw new Error("模板内容必须是HTML元素");
        }
        // 如果提供了ID，设置到根元素上
        if (containerId) {
          templateContainer.id = containerId;
        }
      } else {
        // 如果有多个根元素，创建包装容器
        templateContainer = document.createElement("div");
        // 设置ID，便于后续引用和样式设置
        templateContainer.id =
          containerId || `template_container_${Date.now()}`;
        // 将所有内容移动到包装容器中
        templateContainer.innerHTML = html;
      }

      // 将模板容器添加到目标容器中
      container.appendChild(templateContainer);

      // 调用成功回调 - 如果提供了回调函数，传入新创建的容器元素
      if (typeof onSuccess === "function") {
        onSuccess(templateContainer);
      }

      // 返回创建的模板容器元素，便于链式调用或后续操作
      return templateContainer;
    } catch (error) {
      // 错误处理 - 记录错误信息到控制台
      console.error("Template mounting failed:", error);

      // 调用错误回调 - 如果提供了错误处理函数，传入捕获的错误
      if (typeof onError === "function") {
        onError(error);
      }

      // 发生错误时返回null，表示挂载失败
      return null;
    }
  }
  /**
   * 卸载模板
   * @param {string|HTMLElement} containerSelector - 容器选择器或元素
   * @returns {boolean} - 是否成功卸载
   */
  static unmountTemplate(containerSelector) {
    try {
      // 获取要卸载的容器元素 - 支持选择器字符串或直接传入DOM元素
      let container;
      if (typeof containerSelector === "string") {
        // 如果是选择器字符串，使用querySelector查找DOM元素
        container = document.querySelector(containerSelector);
      } else if (containerSelector instanceof HTMLElement) {
        // 如果已经是DOM元素，直接使用
        container = containerSelector;
      }

      // 检查容器是否存在且有父节点
      if (container && container.parentNode) {
        // 从DOM树中移除容器元素
        container.parentNode.removeChild(container);
        // 返回true表示卸载成功
        return true;
      }

      // 如果容器不存在或没有父节点，返回false表示卸载失败
      return false;
    } catch (error) {
      // 错误处理 - 记录错误信息到控制台
      console.error("Template unmounting failed:", error);
      // 发生异常时返回false表示卸载失败
      return false;
    }
  }
}

export default TemplateLoader;
