import {
  callGenericPopup,
  POPUP_TYPE,
  POPUP_RESULT,
} from "../../../../../../popup.js";
/**
 * @typedef {import("../../../../../../popup.js").PopupOptions} PopupOptions
 */
/**
 * Popup - 提供与SillyTavern弹窗交互的方法
 */
class Popup {
  /**
   * 调用通用弹窗
   * @param {HTMLElement|string} html - 弹窗内容
   * @param {string} type - 弹窗类型
   *   - TEXT: 包含任何显示内容的主弹窗，下方有按钮。也可以包含额外的输入控件
   *   - CONFIRM: 主要用于确认某事的弹窗，用简单的是/否或类似方式回答。重点在按钮控件
   *   - INPUT: 主要焦点是输入文本字段的弹窗，在此显示。可以在上方包含额外内容。返回值是输入字符串
   *   - DISPLAY: 没有任何按钮控件的弹窗。用于简单显示内容，角落有一个小X
   *   - CROP: 显示要裁剪的图像的弹窗。结果返回裁剪后的图像
   * @param {string} title - 输入值/标题
   * @param {PopupOptions} options - 弹窗选项
   * @returns {Promise<any>} 弹窗结果
   */
  static callGenericPopup(html, type, title = "", options = {}) {
    return callGenericPopup(html, POPUP_TYPE[type], title, options);
  }
  static POPUP_RESULT = POPUP_RESULT;
  static POPUP_TYPE = POPUP_TYPE;
}

export default Popup;
