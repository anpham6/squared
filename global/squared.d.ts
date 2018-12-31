import { UserSettings } from '../src/base/types/application';

declare global {
    namespace squared {
        const settings: UserSettings;
        const system: FunctionMap<any>;
        function setFramework(value: {}, cached?: boolean): void;
        function parseDocument(...elements: Undefined<string | HTMLElement>[]): FunctionMap<void>;
        function include(value: {} | string): boolean;
        function includeAsync(value: {} | string): boolean;
        function exclude(value: {} | string): boolean;
        function retrieve(value: string): {} | null;
        function configure(value: {} | string, options: {}): boolean;
        function apply(value: {} | string): {} | boolean | null;
        function ready(): boolean;
        function close(): void;
        function reset(): void;
        function saveAllToDisk(): void;
        function toString(): string;
    }
}

export = squared;