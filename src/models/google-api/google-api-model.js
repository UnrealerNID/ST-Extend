import GoogleAPI from "./google-api.js";

/**
 * GoogleApiModel - Google API模型管理类
 */

class GoogleApiModel {
  /**
   * 创建GoogleAPI模型实例
   * @param {GoogleAPI} apiManager - Google API管理器实例
   */
  constructor(apiManager) {
    this._apiManager = apiManager;
  }
  /**
   * 更新模型
   * @returns {Promise<Array|undefined>} 模型列表
   */
  async updateModels() {
    try {
      const key = this._apiManager.currentApiKey;
      if (!key) {
        toastr.error("没有可用的API密钥", "错误");
        return;
      }

      toastr.info("正在更新模型列表...", "提示");

      const result = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/?key=${key}`
      );

      if (!result.ok) {
        const errorData = await result.json();
        toastr.error(
          `获取模型失败: ${errorData?.error?.message || "未知错误"}`,
          "错误"
        );
        return;
      }

      const data = await result.json();
      if (!data?.models) {
        toastr.warning("未找到可用模型", "警告");
        return;
      }

      // 获取模型数据
      const models = data.models
        .filter((model) => model.name.includes("gemini"))
        .map((modelData) => {
          const model = modelData.name.replace("models/", "");
          const name = modelData.displayName || model;
          return { name, model };
        });

      if (models.length === 0) {
        toastr.warning("未找到Gemini系列模型", "警告");
        return;
      }
      this._apiManager.models = models;
      // 交由UI处理模型显示
      const added = this._apiManager.apiUI.updateModelsList(models);
      if (added > 0) {
        toastr.success(`成功添加 ${added} 个新模型`, "成功");
      } else {
        toastr.info("没有新的模型可添加", "提示");
      }
      this._apiManager.updateCurrentModel();
      return models;
    } catch (e) {
      console.error("更新模型时出错:", e);
      toastr.error(`更新模型失败: ${e.message || "未知错误"}`, "错误");
    }
  }
}
export default GoogleApiModel;
