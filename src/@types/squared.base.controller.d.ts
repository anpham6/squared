import { AppHandler, ControllerSettings, FileAsset, LayoutResult, LayoutType, NodeTemplate, UserSettings } from '../base/@types/application';

declare global {
    namespace squared.base {
        interface Controller<T extends Node> extends AppHandler<T> {
            application: Application<T>;
            cache: NodeList<T>;
            readonly userSettings: UserSettings;
            readonly localSettings: ControllerSettings;
            readonly containerTypeHorizontal: LayoutType;
            readonly containerTypeVertical: LayoutType;
            readonly containerTypeVerticalMargin: LayoutType;
            readonly containerTypePercent: LayoutType;
            readonly afterInsertNode: BindGeneric<T, void>;
            readonly generateSessionId: string;
            optimize(nodes: T[]): void;
            finalize(layouts: FileAsset[]): void;
            reset(): void;
            applyDefaultStyles(element: Element): void;
            evaluateNonStatic(documentRoot: T, cache: NodeList<T>): void;
            processUnknownParent(layout: Layout<T>): LayoutResult<T>;
            processUnknownChild(layout: Layout<T>): LayoutResult<T>;
            processTraverseHorizontal(layout: Layout<T>, siblings: T[]): Layout<T>;
            processTraverseVertical(layout: Layout<T>, siblings: T[]): Layout<T>;
            processLayoutHorizontal(layout: Layout<T>): Layout<T>;
            setConstraints(): void;
            renderNode(layout: Layout<T>): NodeTemplate<T> | undefined;
            renderNodeGroup(layout: Layout<T>): NodeTemplate<T> | undefined;
            renderNodeStatic(controlName: string, options?: ExternalData, width?: string, height?: string, content?: string): string;
            createNodeGroup(node: T, children: T[], parent?: T, traverse?: boolean): T;
            sortRenderPosition(parent: T, templates: NodeTemplate<T>[]): NodeTemplate<T>[];
            addBeforeOutsideTemplate(id: number, value: string, index?: number): void;
            addBeforeInsideTemplate(id: number, value: string, index?: number): void;
            addAfterInsideTemplate(id: number, value: string, index?: number): void;
            addAfterOutsideTemplate(id: number, value: string, index?: number): void;
            getBeforeOutsideTemplate(id: number, depth: number): string;
            getBeforeInsideTemplate(id: number, depth: number): string;
            getAfterInsideTemplate(id: number, depth: number): string;
            getAfterOutsideTemplate(id: number, depth: number): string;
            hasAppendProcessing(id?: number): boolean;
            includeElement(element: Element): boolean;
            visibleElement(element: Element, target?: string): boolean;
            cascadeDocument(templates: NodeTemplate<T>[], depth: number): string;
            getEnclosingXmlTag(controlName: string, attributes?: string, content?: string): string;
        }

        class Controller<T extends Node> implements Controller<T> {
            constructor(application: Application<T>);
        }
    }
}

export = squared.base.Controller;