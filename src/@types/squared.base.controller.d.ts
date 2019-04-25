import { AppHandler, ControllerSettings, LayoutResult, LayoutType, NodeTag, NodeTemplate, UserSettings, ViewData } from '../base/@types/application';

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
            finalize(data: ViewData): void;
            reset(): void;
            applyDefaultStyles(element: Element): void;
            processUnknownParent(layout: Layout<T>): LayoutResult<T>;
            processUnknownChild(layout: Layout<T>): LayoutResult<T>;
            processTraverseHorizontal(layout: Layout<T>, siblings?: T[]): LayoutResult<T>;
            processTraverseVertical(layout: Layout<T>, siblings?: T[]): LayoutResult<T>;
            processLayoutHorizontal(layout: Layout<T>): LayoutResult<T>;
            setConstraints(): void;
            renderNode(layout: Layout<T>): NodeTemplate<T> | undefined;
            renderNodeGroup(layout: Layout<T>): NodeTemplate<T> | undefined;
            renderNodeStatic(controlName: string, options?: ExternalData, width?: string, height?: string, content?: string): string;
            createNodeGroup(node: T, children: T[], parent?: T, replacement?: T): T;
            sortRenderPosition(parent: T, templates: NodeTemplate<T>[]): NodeTemplate<T>[];
            addBeforeOutsideTemplate(id: number, value: string, index?: number): void;
            addBeforeInsideTemplate(id: number, value: string, index?: number): void;
            addAfterInsideTemplate(id: number, value: string, index?: number): void;
            addAfterOutsideTemplate(id: number, value: string, index?: number): void;
            getBeforeOutsideTemplate(id: number, depth: number): string;
            getBeforeInsideTemplate(id: number, depth: number): string;
            getAfterInsideTemplate(id: number, depth: number): string;
            getAfterOutsideTemplate(id: number, depth: number): string;
            hasAppendProcessing(id: number): boolean;
            includeElement(element: Element, target?: string): boolean;
            cascadeDocument(templates: NodeTemplate<T>[], depth: number): string;
            getEnclosingTag(type: number, options: NodeTag<T>): string;
        }

        class Controller<T extends Node> implements Controller<T> {
            constructor(application: Application<T>);
        }
    }
}

export = squared.base.Controller;