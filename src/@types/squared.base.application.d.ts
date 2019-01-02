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
            appName: string;
            readonly builtInExtensions: ObjectMap<Extension<T>>;
            readonly session: AppSession<T, NodeList<T>>;
            readonly parseElements: Set<Element>;
            readonly processing: AppProcessing<T, NodeList<T>>;
            readonly extensions: Set<Extension<T>>;
            readonly viewData: FileAsset[];
            readonly sessionData: SessionData<NodeList<T>>;
            readonly nextId: number;
            readonly rendered: T[];
            readonly size: number;
            registerController(handler: Controller<T>): void;
            registerResource(handler: Resource<T>): void;
            reset(): void;
            finalize(): void;
            saveAllToDisk(): void;
            parseDocument(...elements: Undefined<string | Element>[]): FunctionMap<void>;
            renderNode(layout: Layout<T>): string;
            renderLayout(layout: Layout<T>): string;
            addLayoutFile(filename: string, content: string, pathname?: string, documentRoot?: boolean): void;
            addIncludeFile(filename: string, content: string): void;
            addRenderTemplate(node: T, parent: T, output: string, group: boolean): void;
            addRenderQueue(id: string, template: string): void;
            addImagePreload(element: HTMLImageElement): void;
            saveRenderPosition(parent: T, required: boolean): void;
            toString(): string;
        }

        class Application<T extends Node> implements Application<T> {
            constructor(
                framework: number,
                controllerConstructor: Constructor<Controller<T>>,
                resourceConstructor: Constructor<Resource<T>>,
                extensionManagerConstructor: Constructor<ExtensionManager<T>>,
                nodeConstructor: Constructor<T>
            );
        }
    }
}

export = squared.base.Application;