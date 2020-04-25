type ExtensionRequest = string | {};

export const settings: StandardMap;
export const system: FunctionMap<any>;
export function setFramework(value: {}, cached?: boolean): void;
export function setViewModel(data?: {}): void;
export function include(value: ExtensionRequest, options?: {}): boolean;
export function exclude(value: ExtensionRequest | string): boolean;
export function configure(value: ExtensionRequest | string, options: {}): boolean;
export function retrieve(value: string): Null<{}>;
export function parseDocument(...elements: (string | HTMLElement)[]): Promise<unknown>;
export function copyToDisk(value: string, options?: {}): Promise<unknown>;
export function appendToArchive(value: string, options?: {}): Promise<unknown>;
export function saveToArchive(value?: string, options?: {}): Promise<unknown>;
export function createFrom(value: string, options: {}): Promise<unknown>;
export function appendFromArchive(value: string, options: {}): Promise<unknown>;
export function ready(): boolean;
export function close(): void;
export function reset(): void;
export function toString(): string;

export * as lib from './lib/squared';
export * as base from './base/squared';
export * as svg from './svg/squared';

export as namespace squared;