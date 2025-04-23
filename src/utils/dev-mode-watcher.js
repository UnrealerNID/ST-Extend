import ExtendUtils from "./extend-utils";

class DevModeWatcher {
  constructor() {
    this._isDevMode = false;
    this._watchInterval = null;
    this._lastModified = {};
    this._callbacks = [];
  }

  /**
   * 启用开发模式
   * @param {number} interval - 检查间隔(毫秒)
   */
  enable(interval = 2000) {
    if (this._watchInterval) return;

    this._isDevMode = true;
    this._startWatching(interval);
    console.log("开发模式已启用，将自动检测文件变化");
  }

  /**
   * 禁用开发模式
   */
  disable() {
    if (!this._watchInterval) return;

    clearInterval(this._watchInterval);
    this._watchInterval = null;
    this._isDevMode = false;
    console.log("开发模式已禁用");
  }

  /**
   * 添加文件变化回调
   * @param {function} callback - 文件变化时调用的回调函数
   */
  onFileChange(callback) {
    if (typeof callback === "function") {
      this._callbacks.push(callback);
    }
  }

  /**
   * 开始监听文件变化
   * @private
   */
  _startWatching(interval) {
    // 初始化文件修改时间
    this._initFileTimestamps();

    // 设置定时检查
    this._watchInterval = setInterval(() => {
      this._checkFileChanges();
    }, interval);
  }

  /**
   * 初始化文件时间戳
   * @private
   */
  async _initFileTimestamps() {
    const files = [
      "index.js",
      "index.html",
      "public/html/extend-manager.html",
      // 添加其他需要监控的文件
    ];

    for (const file of files) {
      const path = ExtendUtils.getExtensionPath(file);
      try {
        const response = await fetch(path + "?t=" + Date.now(), {
          method: "HEAD",
        });
        if (response.ok) {
          const lastModified = response.headers.get("last-modified");
          this._lastModified[path] = lastModified;
        }
      } catch (error) {
        console.warn(`无法获取文件时间戳: ${path}`, error);
      }
    }
  }

  /**
   * 检查文件变化
   * @private
   */
  async _checkFileChanges() {
    let hasChanges = false;

    for (const path in this._lastModified) {
      try {
        const response = await fetch(path + "?t=" + Date.now(), {
          method: "HEAD",
        });
        if (response.ok) {
          const lastModified = response.headers.get("last-modified");
          if (lastModified !== this._lastModified[path]) {
            console.log(`文件已更改: ${path}`);
            this._lastModified[path] = lastModified;
            hasChanges = true;
          }
        }
      } catch (error) {
        console.warn(`检查文件变化失败: ${path}`, error);
      }
    }

    if (hasChanges) {
      this._notifyFileChanges();
    }
  }

  /**
   * 通知文件变化
   * @private
   */
  _notifyFileChanges() {
    for (const callback of this._callbacks) {
      try {
        callback();
      } catch (error) {
        console.error("文件变化回调执行失败:", error);
      }
    }
  }
}
export default DevModeWatcher;
