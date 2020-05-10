type Node = squared.base.Node;
type ExtensionRequest = string | {};

export const settings: StandardMap;
export const system: FunctionMap<any>;
export function setHostname(value: string): void;
export function setFramework(value: {}, options?: {}, cached?: boolean): void;
export function setViewModel(data?: {}): void;
export function include(value: ExtensionRequest, options?: {}): boolean;
export function exclude(value: ExtensionRequest | string): boolean;
export function configure(value: ExtensionRequest | string, options: {}): boolean;
export function retrieve(value: string): Null<{}>;
export function parseDocument(...elements: (string | HTMLElement)[]): Promise<Node[] | void>;
export function copyToDisk(value: string, options?: {}): Promise<{} | void>;
export function appendToArchive(value: string, options?: {}): Promise<{} | void>;
export function saveToArchive(value?: string, options?: {}): Promise<{} | void>;
export function createFrom(value: string, options: {}): Promise<{} | void>;
export function appendFromArchive(value: string, options: {}): Promise<{} | void>;
export function ready(): boolean;
export function close(): void;
export function reset(): void;
export function toString(): string;

export * as lib from './lib/index';
export * as base from './base/index';
export * as svg from './svg/index';

export as namespace squared;