type ExtensionRequest = string | {};
type PromiseHandler = squared.lib.base.PromiseHandler;

export const settings: StandardMap;
export const system: FunctionMap<any>;
export function setFramework(value: {}, cached?: boolean): void;
export function setViewModel(data?: {}): void;
export function parseDocument(...elements: (string | HTMLElement)[]): PromiseHandler;
export function parseDocumentAsync(...elements: (string | HTMLElement)[]): Promise<PromiseHandler>;
export function include(value: ExtensionRequest, options?: {}): boolean;
export function exclude(value: ExtensionRequest | string): boolean;
export function configure(value: ExtensionRequest | string, options: {}): boolean;
export function retrieve(value: string): Null<{}>;
export function ready(): boolean;
export function close(): void;
export function reset(): void;
export function copyToDisk(value: string, options?: {}): void;
export function appendToArchive(value: string, options?: {}): void;
export function saveToArchive(value?: string, options?: {}): void;
export function createFrom(value: string, options: {}): void;
export function appendFromArchive(value: string, options: {}): void;
export function toString(): string;

export * as lib from './lib/squared';
export * as base from './base/squared';
export * as svg from './svg/squared';

export as namespace squared;