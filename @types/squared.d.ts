type Node = squared.base.Node;
type ExtensionRequest = squared.base.Extension<Node> | string;

export const settings: StandardMap;
export const system: FunctionMap<any>;
export function setHostname(value: string): void;
export function setFramework(value: PlainObject, options?: PlainObject, cached?: boolean): void;
export function setViewModel(data?: PlainObject): void;
export function include(value: ExtensionRequest, options?: PlainObject): boolean;
export function exclude(value: ExtensionRequest | string): boolean;
export function configure(value: ExtensionRequest | string, options: PlainObject): boolean;
export function retrieve(value: string): Null<PlainObject>;
export function parseDocument(...elements: (string | HTMLElement)[]): Promise<Node | Node[] | void>;
export function copyToDisk(value: string, options?: PlainObject): Promise<PlainObject | void>;
export function appendToArchive(value: string, options?: PlainObject): Promise<PlainObject | void>;
export function saveToArchive(value?: string, options?: PlainObject): Promise<PlainObject | void>;
export function createFrom(value: string, options: PlainObject): Promise<PlainObject | void>;
export function appendFromArchive(value: string, options: PlainObject): Promise<PlainObject | void>;
export function get(...elements: (string | Element)[]): Undef<Node> | Map<Element, Node[]>;
export function latest(): string;
export function ready(): boolean;
export function close(): void;
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