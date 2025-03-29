/**
 * 类型声明文件
 * 为项目中使用的全局变量和库提供类型定义
 */

// 声明全局变量
declare global {
  // jQuery类型扩展
  interface JQuery {
    empty(): JQuery;
    append(content: string | JQuery): JQuery;
    prop(propertyName: string, value?: any): any;
    val(value?: any): any;
    trigger(eventType: string): JQuery;
    on(eventType: string, handler: (event: any) => void): JQuery;
    toggle(showOrHide?: boolean): JQuery;
    remove(): JQuery;
    css(propertyName: string, value: string): JQuery;
    css(properties: Record<string, string>): JQuery;
    data(key: string, value?: any): any;
    find(selector: string): JQuery;
    closest(selector: string): JQuery;
    fadeOut(duration?: number, complete?: Function): JQuery;
    fadeIn(duration?: number, complete?: Function): JQuery;
    text(text?: string): JQuery | string;
    attr(attributeName: string, value: string): JQuery;
    addClass(className: string): JQuery;
    children(selector?: string): JQuery;
    length?: number;
  }

  interface JQueryStatic {
    (selector: string | Element | EventTarget): JQuery;
    get(url: string): Promise<string>;
  }

  // Window对象扩展
  interface Window {
    Vue: any;
    pluginExports: any;
    vueAppInstance: any;
    createPluginApp: Function;
    mountComponent: Function;
    unmountAllComponents: Function;
    pluginLoaders: Record<string, any>;
    jQuery: JQueryStatic;
    $: JQueryStatic;
    toastr: {
      success(message: string, title?: string): void;
      error(message: string, title?: string): void;
      warning(message: string, title?: string): void;
      info(message: string, title?: string): void;
      clear(): void;
    };
    [key: string]: any; // 允许使用索引访问任意属性
  }

  // 声明全局变量
  const jQuery: JQueryStatic;
  const $: JQueryStatic;
  const toastr: Window["toastr"];
}

// 声明模块
declare module "../../../../extensions" {
  const extension_settings: Record<string, any>;
  function getContext(): any;
  function loadExtensionSettings(): void;
}

declare module "../../../../script" {
  function saveSettingsDebounced(): void;
}

// 确保文件被视为模块
export {};
