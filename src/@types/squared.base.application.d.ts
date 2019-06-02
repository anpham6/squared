import { AppProcessing, AppSession, UserSettings } from '../base/@types/application';

declare global {
    namespace squared.base {
        interface Application<T extends Node> {
            framework: number;
            controllerHandler: Controller<T>;
            resourceHandler: Resource<T>;
            extensionManager: ExtensionManager<T>;
            userSettings: UserSettings;
            initialized: boolean;
            closed: boolean;
            readonly builtInExtensions: ObjectMap<Extension<T>>;
            readonly session: AppSession<T>;
            readonly processing: AppProcessing<T>;
            readonly extensions: Extension<T>[];
            readonly nextId: number;
            readonly length: number;
            reset(): void;
            parseDocument(...elements: (string | HTMLElement)[]): PromiseResult;
            createCache(element: HTMLElement): boolean;
            createNode(element: Element, append?: boolean, parent?: T, children?: T[]): T;
            conditionElement(element: HTMLElement): boolean;
            insertNode(element: Element, parent?: T): T | undefined;
            afterCreateCache(element: HTMLElement): void;
            finalize(): void;
            saveAllToDisk(): void;
            toString(): string;
        }

        class Application<T extends Node> implements Application<T> {
            constructor(
                framework: number,
                nodeConstructor: Constructor<T>,
                ControllerConstructor: Constructor<Controller<T>>,
                ResourceConstructor: Constructor<Resource<T>>,
                ExtensionManagerConstructor: Constructor<ExtensionManager<T>>
            );
        }
    }
}

export = squared.base.Application;