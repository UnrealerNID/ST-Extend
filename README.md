# SillyTavern Google API 插件

这个插件为 SillyTavern 提供了 Google Gemini API 的集成支持，允许用户使用自己的 Google API 密钥访问 Gemini 系列模型。插件支持 API 密钥管理、模型选择和 API 轮询功能，提升了使用 Google AI 服务的便利性和灵活性。

## 特性

- 支持添加和管理多个 Google API 密钥
- 自动获取并显示最新的 Gemini 模型列表
- 支持 API 密钥轮询，在多个密钥之间自动切换
- 与 SillyTavern 无缝集成，提供友好的用户界面
- 支持实时显示当前使用的 API 密钥状态

## 安装和使用

### 安装

1. 在 SillyTavern 中，导航到"扩展"标签
2. 点击"从 URL 安装"
3. 输入此仓库的 URL
4. 点击"安装"

### 使用

1. 安装后，启用插件
2. 在设置中添加您的 Google API 密钥
3. 点击"更新模型"按钮获取最新的 Gemini 模型列表
4. 在聊天设置中选择您想要使用的 Gemini 模型
5. 如果有多个 API 密钥，可以启用 API 轮询功能

## 前提条件

- SillyTavern 1.10.0 或更高版本
- 有效的 Google API 密钥（可以从[Google AI Studio](https://makersuite.google.com/)获取）

## 支持和贡献

如果您遇到问题或有改进建议，请在 GitHub 仓库中创建 Issue。

欢迎通过 Pull Request 贡献代码，帮助改进这个插件。

## 致谢

特别感谢[ZerxZ/SillyTavern-Extension-ZerxzLib](https://github.com/ZerxZ/SillyTavern-Extension-ZerxzLib)项目，本插件的部分代码结构和实现思路受到了该项目的启发。

## 许可证

MIT License
