type Node = squared.base.Node;
type RootElement = squared.base.RootElement;

type PromiseResult = Promise<Void<PlainObject>>;

export interface FrameworkOptions {
    settings?: PlainObject;
    loadAs?: string;
    saveAs?: string;
    cache?: boolean;
}

export interface FileActionOptions extends RequestData {
    exclusions?: Exclusions;
    callback?: (result: unknown) => void;
    configUri?: string;
    configMime?: string;
    cache?: boolean;
}

export type ExtensionRequest = squared.base.Extension<Node> | string;
export type ExtensionRequestObject = ExtensionRequest | [ExtensionRequest, PlainObject];

export const settings: StandardMap;
export function setHostname(value: string): void;
export function setEndpoint(name: string, value: string): void;
export function setFramework(value: PlainObject, options?: FrameworkOptions | PlainObject | string, cache?: boolean): void;
export function setFramework(value: PlainObject, options?: FrameworkOptions | PlainObject, saveAs?: string): void;
export function add(...values: ExtensionRequestObject[]): number;
export function remove(...values: ExtensionRequest[]): number;
export function get(...values: string[]): Undef<PlainObject | PlainObject[]>;
export function apply(value: ExtensionRequest, options: FrameworkOptions | string, saveAs?: string): boolean;
export function extend(functionMap: PlainObject, framework?: number): void;
export function parseDocument(...elements: RootElement[]): Promise<Void<Node | Node[]>>;
export function parseDocumentSync(...elements: RootElement[]): Void<Node | Node[]>;
export function latest(value: 1 | -1): string;
export function latest(value: number): string[];
export function latest(value?: Undef<number>): string;
export function close(): boolean;
export function save(): PromiseResult;
export function reset(): void;
export function saveAs(value: string, options?: FileActionOptions): PromiseResult;
export function appendTo(value: string, options?: FileActionOptions): PromiseResult;
export function copyTo(value: string, options?: FileActionOptions): PromiseResult;
export function saveFiles(value: string, options: FileActionOptions): PromiseResult;
export function appendFiles(value: string, options: FileActionOptions): PromiseResult;
export function copyFiles(value: string, options: FileActionOptions): PromiseResult;
export function getElementById(value: string, sync: true, cache?: boolean): Null<Node>;
export function getElementById(value: string, sync?: Undef<false>, cache?: boolean): Promise<Null<Node>>;
export function querySelector(value: string, sync: true, cache?: boolean): Null<Node>;
export function querySelector(value: string, sync?: Undef<false>, cache?: boolean): Promise<Null<Node>>;
export function querySelectorAll(value: string, sync: true, cache?: boolean): Node[];
export function querySelectorAll(value: string, sync?: Undef<false>, cache?: boolean): Promise<Null<Node[]>>;
export function fromElement(element: HTMLElement, sync: true, cache?: boolean): Null<Node>;
export function fromElement(element: HTMLElement, sync?: Undef<false>, cache?: boolean): Promise<Null<Node>>;
export function clearCache(): void;
export function toString(): string;

export * as lib from './lib/index';
export * as base from './base/index';
export * as svg from './svg/index';

export as namespace squared;