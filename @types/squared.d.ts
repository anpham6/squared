type Node = squared.base.Node;
type ExtensionRequest = squared.base.Extension<Node> | string;
type PromiseResult = Promise<Void<PlainObject>>;

export interface FrameworkOptions {
    settings?: StandardMap;
    loadAs?: string;
    saveAs?: string;
    cache?: boolean;
}

export interface FileActionOptions {
    assets?: FileAsset[];
    exclusions?: Exclusions;
    callback?: CallbackResult;
}

export const settings: StandardMap;
export const system: FunctionMap<any>;
export function setHostname(value: string): void;
export function setFramework(value: PlainObject, options?: FrameworkOptions): void;
export function include(value: ExtensionRequest, options?: FrameworkOptions): boolean;
export function exclude(value: ExtensionRequest | string): boolean;
export function configure(value: ExtensionRequest | string, options: FrameworkOptions): boolean;
export function retrieve(value: string): Null<PlainObject>;
export function parseDocument(...elements: (string | HTMLElement)[]): Promise<Void<Node | Node[]>>;
export function parseDocumentSync(...elements: (string | HTMLElement)[]): Void<Node | Node[]>;
export function get(...elements: (string | Element)[]): Undef<Node[] | Map<Element, Node[]>>;
export function latest(value?: number): string;
export function ready(): boolean;
export function close(): boolean;
export function save(): PromiseResult;
export function reset(): void;
export function saveAs(value?: string, options?: PlainObject): PromiseResult;
export function createFrom(value: string, options: PlainObject): PromiseResult;
export function appendTo(value: string, options?: PlainObject): PromiseResult;
export function appendFrom(value: string, options: PlainObject): PromiseResult;
export function copyTo(value: string, options?: PlainObject): PromiseResult;
export function getElementById(value: string, cache?: boolean): Promise<Null<Node>> | Null<Node>;
export function querySelector(value: string, cache?: boolean): Promise<Null<Node>> | Null<Node>;
export function querySelectorAll(value: string, cache?: boolean): Promise<Node[]> | Node[];
export function fromElement(element: HTMLElement, cache?: boolean): Promise<Null<Node>> | Null<Node>;
export function extend(functionMap: PlainObject, framework?: number): void;
export function getElementMap(): Map<HTMLElement, Node>;
export function clearElementMap(): void;
export function toString(): string;

export * as lib from './lib/index';
export * as base from './base/index';
export * as svg from './svg/index';

export as namespace squared;