type Node = squared.base.Node;
type ExtensionRequest = squared.base.Extension<Node> | string;

export interface FrameworkOptions {
    settings?: StandardMap;
    loadAs?: string;
    saveAs?: string;
    cache?: boolean;
}

export type ExtensionPrototypeData = ObjectMap<FunctionType<any> | { get: () => any, set: (value: any) => void } | number | string | boolean>;

export const settings: StandardMap;
export const system: FunctionMap<any>;
export function setHostname(value: string): void;
export function setFramework(value: PlainObject, options?: FrameworkOptions): void;
export function include(value: ExtensionRequest, options?: FrameworkOptions): boolean;
export function exclude(value: ExtensionRequest | string): boolean;
export function configure(value: ExtensionRequest | string, options: FrameworkOptions): boolean;
export function retrieve(value: string): Null<PlainObject>;
export function parseDocument(...elements: (string | HTMLElement)[]): Promise<Node | Node[] | void>;
export function parseDocumentSync(...elements: (string | HTMLElement)[]): Undef<Node | Node[]>;
export function copyToDisk(value: string, options?: PlainObject): Promise<PlainObject | void>;
export function appendToArchive(value: string, options?: PlainObject): Promise<PlainObject | void>;
export function saveToArchive(value?: string, options?: PlainObject): Promise<PlainObject | void>;
export function createFrom(value: string, options: PlainObject): Promise<PlainObject | void>;
export function appendFromArchive(value: string, options: PlainObject): Promise<PlainObject | void>;
export function get(...elements: (string | Element)[]): Undef<Node[] | Map<Element, Node[]>>;
export function latest(): string;
export function ready(): boolean;
export function close(): boolean;
export function reset(): void;
export function getElementById(value: string, cache?: boolean): Promise<Null<Node>>;
export function querySelector(value: string, cache?: boolean): Promise<Null<Node>>;
export function querySelectorAll(value: string, cache?: boolean): Promise<Node[]>;
export function fromElement(element: HTMLElement, cache?: boolean): Promise<Null<Node>>;
export function extend(functionMap: ExtensionPrototypeData, framework?: number): void;
export function getElementMap(): Map<HTMLElement, Node>;
export function clearElementMap(): void;
export function toString(): string;

export * as lib from './lib/index';
export * as base from './base/index';
export * as svg from './svg/index';

export as namespace squared;