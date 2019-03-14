import { ExtensionDependency, ExtensionResult } from '../base/@types/application';

declare global {
    namespace squared.base {
        interface Extension<T extends Node> {
            tagNames: string[];
            documentRoot: boolean;
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
            condition(node: T, parent?: T): boolean;
            processNode(node: T, parent: T): ExtensionResult<T>;
            processChild(node: T, parent: T): ExtensionResult<T>;
            addDescendant(node: T): void;
            postBaseLayout(node: T): void;
            postConstraints(node: T): void;
            postParseDocument(node: T): void;
            postProcedure(node: T): void;
            beforeParseDocument(): void;
            afterDepthLevel(): void;
            afterBaseLayout(): void;
            afterConstraints(): void;
            afterResources(): void;
            afterParseDocument(): void;
            afterProcedure(): void;
            afterFinalize(): void;
        }

        class Extension<T extends Node> implements Extension<T> {
            public static findNestedElement(element: Element | null, name: string): HTMLElement | null;
            constructor(name: string, framework: number, tagNames?: string[], options?: ExternalData);
        }
    }
}

export = squared.base.Extension;