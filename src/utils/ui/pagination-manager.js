import { PaginationInfo } from "../../components/pagination.js";
/**
 * 分页管理器类
 * 提供完整的分页功能和状态管理
 */
class PaginationManager {
  /**
   * 创建分页管理器实例
   * @param {Object} options - 分页配置
   * @param {HTMLElement} options.container - 容器元素
   * @param {Array|function():Array} options.itemsSource - 数据项列表或获取数据的函数
   * @param {number} [options.pageSize=10] - 每页显示数量
   * @param {number} [options.initialPage=1] - 初始页码
   * @param {function(Object):void} [options.onPageChange] - 页面变更回调
   */
  constructor({
    container,
    itemsSource,
    pageSize = 10,
    initialPage = 1,
    onPageChange = null,
  }) {
    this.container = container;
    this.pageSize = pageSize;
    this.currentPage = initialPage;
    this.currentIndex = -1;
    this.onPageChange = onPageChange;
    this._hasPageChangeListener = false;

    // 设置数据源
    this._setupItemsSource(itemsSource);

    // 创建分页组件
    this._createPaginationElement();

    // 初始化分页数据
    this.refresh();
  }

  /**
   * 设置数据源
   * @param {Array|function():Array} itemsSource - 数据项列表或获取数据的函数
   * @private
   */
  _setupItemsSource(itemsSource) {
    if (typeof itemsSource === "function") {
      this._getItems = itemsSource;
    } else {
      this._itemsRef = itemsSource || [];
      this._getItems = () => this._itemsRef;
    }
  }

  /**
   * 获取当前数据项列表
   * @returns {Array} - 数据项列表
   * @private
   */
  _getItemsList() {
    return this._getItems() || [];
  }

  /**
   * 创建分页元素
   * @private
   */
  _createPaginationElement() {
    // 检查容器中是否已存在分页组件
    this.paginationEl = this.container.querySelector("pagination-component");

    if (!this.paginationEl) {
      // 创建新的分页组件
      this.container.insertAdjacentHTML(
        "beforeend",
        "<pagination-component></pagination-component>"
      );
      this.paginationEl = this.container.querySelector(
        "pagination-component:last-child"
      );
    }

    // 绑定页面变更事件
    this._bindPageChangeEvent();
  }

  /**
   * 绑定页面变更事件
   * @private
   */
  _bindPageChangeEvent() {
    if (this.onPageChange && !this._hasPageChangeListener) {
      this._onPageChangeHandler = (e) => {
        this.setPage(e.detail.currentPage);
        this._notifyPageChange();
      };

      this.paginationEl.addEventListener(
        "page-change",
        this._onPageChangeHandler
      );
      this._hasPageChangeListener = true;
    }
  }

  /**
   * 通知页面变更
   * @private
   */
  _notifyPageChange() {
    if (this.onPageChange) {
      this.onPageChange(this.getPaginationData());
    }
  }

  /**
   * 计算分页数据
   * @returns {Object} 分页基础数据
   * @private
   */
  _calculatePaginationData() {
    const items = this._getItemsList();
    const totals = items.length;
    const totalPages = Math.max(1, Math.ceil(totals / this.pageSize));

    // 确保当前页在有效范围内
    const validCurrentPage = Math.max(
      1,
      Math.min(this.currentPage, totalPages)
    );

    // 计算范围
    const startIndex = (validCurrentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, totals);

    return {
      items,
      totals,
      totalPages,
      validCurrentPage,
      startIndex,
      endIndex,
    };
  }

  /**
   * 更新分页元素属性
   * @private
   */
  _updatePaginationElement() {
    if (!this.paginationEl) return;

    const data = this.getPaginationData();
    const attributes = {
      "total-pages": data.totalPages,
      "page-size": data.pageSize,
      totals: data.totals,
      "current-index": data.currentIndex,
      "current-page": data.currentPage,
    };

    Object.entries(attributes).forEach(([attr, value]) => {
      if (value !== undefined) {
        this.paginationEl.setAttribute(attr, value);
      }
    });
  }

  /**
   * 计算页码从项目索引
   * @param {number} itemIndex - 项目索引
   * @returns {number} - 页码
   * @private
   */
  _calculatePageFromIndex(itemIndex) {
    return Math.floor(itemIndex / this.pageSize) + 1;
  }

  /**
   * 查找项目索引
   * @param {string|number|object} itemId - 项目ID或索引
   * @returns {number} - 找到的索引，未找到返回-1
   * @private
   */
  _findItemIndex(itemId) {
    const items = this._getItemsList();
    if (!items.length) return -1;

    if (typeof itemId === "object" && itemId?.id) {
      return items.findIndex((item) => item.id === itemId.id);
    }

    if (typeof itemId === "string" && items.some((item) => item.id)) {
      return items.findIndex((item) => item.id === itemId);
    }

    // 假设是索引
    const index = parseInt(itemId);
    return isNaN(index) || index < 0 || index >= items.length ? -1 : index;
  }

  /**
   * 获取当前分页数据
   * @returns {Object} - 分页数据
   */
  getPaginationData() {
    const {
      items,
      totals,
      totalPages,
      validCurrentPage,
      startIndex,
      endIndex,
    } = this._calculatePaginationData();

    // 更新当前页
    this.currentPage = validCurrentPage;

    // 获取当前页的项目
    const pageItems = items.slice(startIndex, endIndex);

    return new PaginationInfo({
      pageItems,
      currentPage: this.currentPage,
      totalPages,
      totals,
      pageSize: this.pageSize,
      startIndex,
      endIndex,
      hasNext: this.currentPage < totalPages,
      hasPrev: this.currentPage > 1,
      currentIndex: this.currentIndex,
    });
  }

  /**
   * 设置页码
   * @param {number} page - 目标页码
   * @returns {Object} - 更新后的分页数据
   */
  setPage(page) {
    const { totalPages } = this._calculatePaginationData();
    this.currentPage = Math.max(1, Math.min(page, totalPages));
    this._updatePaginationElement();
    return this.getPaginationData();
  }

  /**
   * 跳转到指定项目所在页面
   * @param {string|number|object} itemIdOrIndex - 项目ID或索引
   * @param {boolean} [findItemIndex=false] - 是否强制查找项目索引
   * @returns {Object|null} - 跳转结果
   */
  jumpToItemPage(itemIdOrIndex, findItemIndex = false) {
    const items = this._getItemsList();
    if (!items.length) return null;

    // 确定项目索引
    let itemIndex = -1;
    if (
      findItemIndex ||
      !(
        typeof itemIdOrIndex === "number" &&
        itemIdOrIndex >= 0 &&
        itemIdOrIndex < items.length
      )
    ) {
      // 强制查找或不是有效索引时，执行查找
      itemIndex = this._findItemIndex(itemIdOrIndex);
    } else {
      // 否则直接使用索引
      itemIndex = itemIdOrIndex;
    }

    if (itemIndex < 0) return null;

    // 保存当前索引
    this.currentIndex = itemIndex;

    // 计算目标页码并设置
    const targetPage = this._calculatePageFromIndex(itemIndex);
    const oldPage = this.currentPage;
    this.setPage(targetPage);

    // 如果页码没变，强制刷新
    if (oldPage === targetPage) {
      this.refresh();
    }

    return {
      page: targetPage,
      index: itemIndex,
    };
  }

  /**
   * 更新数据源
   * @param {Array|function():Array} itemsSource - 新的数据项列表或获取数据的函数
   */
  setItemsSource(itemsSource) {
    this._setupItemsSource(itemsSource);
    this.refresh();
  }

  /**
   * 设置页面大小
   * @param {number} pageSize - 新的页面大小
   */
  setPageSize(pageSize) {
    this.pageSize = pageSize;
    this.refresh();
  }

  /**
   * 设置当前选中项索引
   * @param {number} index - 项目索引
   */
  setCurrentIndex(index) {
    this.currentIndex = index;
    this._updatePaginationElement();
  }

  /**
   * 刷新分页数据和UI
   */
  refresh() {
    this._updatePaginationElement();
    this._notifyPageChange();
    return this.getPaginationData();
  }

  /**
   * 导航方法：下一页
   */
  nextPage() {
    return this.setPage(this.currentPage + 1);
  }

  /**
   * 导航方法：上一页
   */
  prevPage() {
    return this.setPage(this.currentPage - 1);
  }

  /**
   * 导航方法：第一页
   */
  firstPage() {
    return this.setPage(1);
  }

  /**
   * 导航方法：最后一页
   */
  lastPage() {
    const { totalPages } = this._calculatePaginationData();
    return this.setPage(totalPages);
  }

  /**
   * 启用分页组件
   */
  enable() {
    if (this.paginationEl) {
      this.paginationEl.removeAttribute("disabled");
    }
  }

  /**
   * 禁用分页组件
   */
  disable() {
    if (this.paginationEl) {
      this.paginationEl.setAttribute("disabled", "true");
    }
  }

  /**
   * 销毁分页管理器
   * 清除事件监听和引用
   */
  destroy() {
    if (this.paginationEl && this._hasPageChangeListener) {
      this.paginationEl.removeEventListener(
        "page-change",
        this._onPageChangeHandler
      );
      this._hasPageChangeListener = false;
    }

    this._itemsRef = null;
    this._getItems = null;
    this.container = null;
    this.paginationEl = null;
    this.onPageChange = null;
  }
}
export default PaginationManager;
