/**
 * TemplateLoader - 通用模板加载和挂载工具类
 */
class TemplateLoader {
  /**
   * 加载并挂载HTML模板到指定容器
   * @param {string} templatePath - 模板文件路径
   * @param {string|HTMLElement} containerSelector - 容器选择器或元素
   * @param {string} [containerId] - 创建的容器ID，如果不提供则使用随机ID
   * @param {Function} [onSuccess] - 成功挂载后的回调函数，参数为创建的容器元素
   * @param {Function} [onError] - 错误处理回调函数，参数为错误对象
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
      // 获取模板内容
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error(
          `Failed to load template: ${response.status} ${response.statusText}`
        );
      }

      const html = await response.text();

      // 获取容器元素
      let container;
      if (typeof containerSelector === "string") {
        container = document.querySelector(containerSelector);
      } else if (containerSelector instanceof HTMLElement) {
        container = containerSelector;
      }

      if (!container) {
        throw new Error(`Container not found: ${containerSelector}`);
      }

      // 创建模板容器
      const templateContainer = document.createElement("div");
      templateContainer.id = containerId || `template_container_${Date.now()}`;
      templateContainer.innerHTML = html;
      //@ts-ignore
      container.appendChild(templateContainer);

      // 调用成功回调
      if (typeof onSuccess === "function") {
        onSuccess(templateContainer);
      }

      return templateContainer;
    } catch (error) {
      console.error("Template mounting failed:", error);

      // 调用错误回调
      if (typeof onError === "function") {
        onError(error);
      }

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
      let container;
      if (typeof containerSelector === "string") {
        container = document.querySelector(containerSelector);
      } else if (containerSelector instanceof HTMLElement) {
        container = containerSelector;
      }

      if (container && container.parentNode) {
        //@ts-ignore
        container.parentNode.removeChild(container);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Template unmounting failed:", error);
      return false;
    }
  }
}

export default TemplateLoader;
