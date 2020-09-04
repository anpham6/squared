type Node = squared.base.Node;
type PromiseResult = Promise<Void<PlainObject>>;

export interface FrameworkOptions {
    settings?: PlainObject;
    loadAs?: string;
    saveAs?: string;
    cache?: boolean;
}

export interface FileActionOptions {
    assets?: FileAsset[];
    exclusions?: Exclusions;
    callback?: CallbackResult;
}

export type ExtensionRequest = squared.base.Extension<Node> | string;
export type ExtensionRequestObject = ExtensionRequest | [ExtensionRequest, PlainObject];

export const settings: StandardMap;
export const system: FunctionMap<any>;
export function setHostname(value: string): void;
export function setFramework(value: PlainObject, options?: FrameworkOptions): void;
export function add(...values: ExtensionRequestObject[]): number;
export function remove(...values: ExtensionRequest[]): number;
export function get(...values: string[]): Undef<PlainObject | PlainObject[]>;
export function apply(value: ExtensionRequest, options: FrameworkOptions): boolean;
export function extend(functionMap: PlainObject, framework?: number): void;
export function parseDocument(...elements: (string | HTMLElement)[]): Promise<Void<Node | Node[]>>;
export function parseDocumentSync(...elements: (string | HTMLElement)[]): Void<Node | Node[]>;
export function latest(value?: number): string | string[];
export function close(): boolean;
export function save(): PromiseResult;
export function reset(): void;
export function saveAs(value?: string, options?: PlainObject): PromiseResult;
export function appendTo(value: string, options?: PlainObject): PromiseResult;
export function copyTo(value: string, options?: PlainObject): PromiseResult;
export function saveFiles(value: string, options: PlainObject): PromiseResult;
export function appendFiles(value: string, options: PlainObject): PromiseResult;
export function copyFiles(value: string, options: PlainObject): PromiseResult;
export function getElementById(value: string, cache?: boolean): Promise<Null<Node>> | Null<Node>;
export function querySelector(value: string, cache?: boolean): Promise<Null<Node>> | Null<Node>;
export function querySelectorAll(value: string, cache?: boolean): Promise<Node[]> | Node[];
export function fromElement(element: HTMLElement, cache?: boolean): Promise<Null<Node>> | Null<Node>;
export function fromCache(...elements: (string | Element)[]): Undef<Node | Node[] | Map<Element, Node | Node[]>>;
export function resetCache(): void;
export function toString(): string;

export * as lib from './lib/index';
export * as base from './base/index';
export * as svg from './svg/index';

export as namespace squared;