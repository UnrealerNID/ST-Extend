declare const jQuery: typeof import("jquery");
declare const $: any;
declare const toastr: any;

interface Node {
  value?: string | boolean;
}

interface HTMLElement extends Node {
  value?: string | boolean;
}
interface Element {
  style: CSSStyleDeclaration;
  title: string;
}

interface EventTarget {
  value: string;
}

interface Event {
  detail: any;
}

// 自定义类型
interface ApiKeyElementData {
  index: number;
  key: string;
  error: boolean;
  errorMessage: string;
  enabled: boolean;
}

// 定义toastr命名空间
interface ToastrOptions {
  timeOut?: number;
  extendedTimeOut?: number;
  closeButton?: boolean;
  positionClass?: string;
  preventDuplicates?: boolean;
}

declare namespace toastr {
  function error(
    message: string,
    title?: string,
    options?: ToastrOptions
  ): void;
  function success(
    message: string,
    title?: string,
    options?: ToastrOptions
  ): void;
  function warning(
    message: string,
    title?: string,
    options?: ToastrOptions
  ): void;
  function info(message: string, title?: string, options?: ToastrOptions): void;
}

// 自定义类型
interface ApiKeyObject {
  key: string;
  enable: boolean;
  error: boolean;
  errorInfo: string;
}

interface ApiKeyElementData {
  index: number;
  key: string;
  error: boolean;
  errorMessage: string;
  enabled: boolean;
}

// 修复索引签名问题
interface ApiKeyElementDataMap {
  [key: number]: ApiKeyElementData;
}

// 允许自定义元素构造函数
interface CustomElementConstructor {
  new (): HTMLElement;
  prototype: HTMLElement;
}

// 允许SwitchButton类的value属性为boolean
interface SwitchButtonElement extends HTMLElement {
  value: boolean;
}
// 修改DOMStringMap接口定义
interface DOMStringMap {
  [key: string]: string | number;
}

// 修改ApiKeyElementDataMap接口定义
type ApiKeyElementDataMap =
  | {
      [key: number]: ApiKeyElementData;
    }
  | {};
