import { AppSessionUI, FileAsset, NodeTemplate, UserUISettings } from '../base/@types/application';

declare global {
    namespace squared.base {
        interface ApplicationUI<T extends NodeUI> extends Application<T> {
            controllerHandler: ControllerUI<T>;
            resourceHandler: ResourceUI<T>;
            userSettings: UserUISettings;
            readonly builtInExtensions: ObjectMap<ExtensionUI<T>>;
            readonly session: AppSessionUI<T>;
            readonly rootElements: Set<Element>;
            readonly layouts: FileAsset[];
            conditionElement(element: HTMLElement): boolean;
            renderNode(layout: LayoutUI<T>): NodeTemplate<T> | undefined;
            resolveTarget(target: string): T | undefined;
            addLayout(layout: LayoutUI<T>): void;
            addLayoutTemplate(parent: T, node: T, template: NodeTemplate<T> | undefined, index?: number): void;
            saveDocument(filename: string, content: string, pathname?: string, index?: number): void;
        }

        class ApplicationUI<T extends NodeUI> implements ApplicationUI<T> {
            constructor(
                framework: number,
                nodeConstructor: Constructor<T>,
                ControllerConstructor: Constructor<ControllerUI<T>>,
                ResourceConstructor: Constructor<ResourceUI<T>>,
                ExtensionManagerConstructor: Constructor<ExtensionManager<T>>
            );
        }
    }
}

export = squared.base.Application;