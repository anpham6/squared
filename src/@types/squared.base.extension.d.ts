import { ExtensionDependency } from '../base/@types/application';

declare global {
    namespace squared.base {
        interface Extension<T extends Node> {
            tagNames: string[];
            documentBase: boolean;
            eventOnly: boolean;
            preloaded: boolean;
            application: Application<T>;
            readonly framework: number;
            readonly name: string;
            readonly options: ExternalData;
            readonly dependencies: ExtensionDependency[];
            readonly subscribers: Set<T>;
            readonly installed: boolean;
            is(node: T): boolean;
            require(name: string, preload?: boolean): void;
            included(element: HTMLElement): boolean;
            beforeInit(element: HTMLElement, recursive?: boolean): void;
            init(element: HTMLElement): boolean;
            afterInit(element: HTMLElement, recursive?: boolean): void;
            addDescendant(node: T): void;
            postParseDocument(node: T): void;
            beforeParseDocument(): void;
            afterParseDocument(): void;
        }

        class Extension<T extends Node> implements Extension<T> {
            constructor(name: string, framework: number, tagNames?: string[], options?: ExternalData);
        }
    }
}

export = squared.base.Extension;