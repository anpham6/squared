import { AppProcessing, AppSession, FileAsset, SessionData, UserSettings } from '../base/@types/application';

declare global {
    namespace squared.base {
        interface Application<T extends Node> {
            framework: number;
            controllerHandler: Controller<T>;
            resourceHandler: Resource<T>;
            extensionManager: ExtensionManager<T>;
            nodeConstructor: Constructor<T>;
            userSettings: UserSettings;
            initialized: boolean;
            closed: boolean;
            readonly builtInExtensions: ObjectMap<Extension<T>>;
            readonly session: AppSession<T, NodeList<T>>;
            readonly parseElements: Set<Element>;
            readonly processing: AppProcessing<T, NodeList<T>>;
            readonly extensions: Set<Extension<T>>;
            readonly viewData: FileAsset[];
            readonly sessionData: SessionData<NodeList<T>>;
            readonly nextId: number;
            readonly size: number;
            registerController(handler: Controller<T>): void;
            registerResource(handler: Resource<T>): void;
            reset(): void;
            finalize(): void;
            saveAllToDisk(): void;
            parseDocument(...elements: (string | HTMLElement)[]): FunctionMap<void>;
            renderNode(layout: Layout<T>): string;
            renderLayout(layout: Layout<T>, outerParent: T): string;
            addLayoutFile(filename: string, content: string, pathname: string, documentBase?: boolean): void;
            addIncludeFile(id: number, filename: string, content: string): void;
            addRenderLayout(layout: Layout<T>, outerParent?: T): boolean;
            addRenderTemplate(parent: T, node: T, value: string, index?: number): boolean;
            addImagePreload(element: HTMLImageElement | undefined): void;
            saveRenderPosition(parent: T): void;
            createNode(element: Element): T;
            resolveTarget(target: string): T | undefined;
            toString(): string;
        }

        class Application<T extends Node> implements Application<T> {
            constructor(
                framework: number,
                nodeConstructor: Constructor<T>,
                controllerConstructor: Constructor<Controller<T>>,
                resourceConstructor: Constructor<Resource<T>>,
                extensionManagerConstructor: Constructor<ExtensionManager<T>>
            );
        }
    }
}

export = squared.base.Application;