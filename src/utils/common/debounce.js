/**
 * 创建一个防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} - 防抖处理后的函数
 */
export function debounce(func, wait = 300) {
  // 使用闭包存储计时器ID
  let timeoutId = null;

  // 返回防抖处理后的函数
  return function (...args) {
    // 保存this上下文
    const context = this;

    // 清除之前的计时器
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    // 设置新的计时器
    timeoutId = setTimeout(() => {
      // 执行原始函数
      func.apply(context, args);
      // 重置计时器ID
      timeoutId = null;
    }, wait);
  };
}
