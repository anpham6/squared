import { ExtensionResult } from '../base/@types/application';

declare global {
    namespace squared.base {
        interface ExtensionUI<T extends NodeUI> extends Extension<T> {
            application: ApplicationUI<T>;
            condition(node: T, parent?: T): boolean;
            processNode(node: T, parent: T): ExtensionResult<T> | undefined;
            processChild(node: T, parent: T): ExtensionResult<T> | undefined;
            addDescendant(node: T): void;
            postBaseLayout(node: T): void;
            postConstraints(node: T): void;
            postOptimize(node: T): void;
            postBoxSpacing(node: T): void;
            afterBaseLayout(): void;
            afterConstraints(): void;
            afterResources(): void;
            beforeCascade(): void;
            afterFinalize(): void;
        }

        class ExtensionUI<T extends NodeUI> implements ExtensionUI<T> {
            public static findNestedElement(element: Element | null, name: string): HTMLElement | null;
            constructor(name: string, framework: number, tagNames?: string[], options?: ExternalData);
        }
    }
}

export = squared.base.Extension;