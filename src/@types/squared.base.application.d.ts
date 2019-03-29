import { AppProcessing, AppSession, FileAsset, NodeTemplate, SessionData, UserSettings } from '../base/@types/application';

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
            readonly session: AppSession<T, NodeList<T>>;
            readonly rootElements: Set<Element>;
            readonly processing: AppProcessing<T, NodeList<T>>;
            readonly extensions: Extension<T>[];
            readonly viewData: FileAsset[];
            readonly sessionData: SessionData<NodeList<T>>;
            readonly nextId: number;
            readonly length: number;
            registerController(handler: Controller<T>): void;
            registerResource(handler: Resource<T>): void;
            reset(): void;
            finalize(): void;
            saveAllToDisk(): void;
            parseDocument(...elements: (string | HTMLElement)[]): FunctionMap<void>;
            renderNode(layout: Layout<T>): NodeTemplate<T> | undefined;
            renderLayout(layout: Layout<T>, outerParent: T): NodeTemplate<T> | undefined;
            addLayoutFile(filename: string, content: string, pathname: string, documentBase?: boolean): void;
            addIncludeFile(id: number, filename: string, content: string): void;
            addRenderLayout(layout: Layout<T>, outerParent?: T): boolean;
            addRenderTemplate(parent: T, node: T, template: NodeTemplate<T> | undefined, index?: number): boolean;
            addImagePreload(element: HTMLImageElement | undefined): void;
            createNode(element: Element, append?: boolean, delegate?: boolean): T;
            resolveTarget(target: string): T | undefined;
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