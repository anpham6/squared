import { AppHandler, ControllerSettings, LayoutResult, LayoutType, SessionData, UserSettings } from '../base/@types/application';

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
            readonly afterInsertNode: BindGeneric<T, void>;
            finalize(data: SessionData<NodeList<T>>): void;
            reset(): void;
            applyDefaultStyles(element: Element): void;
            processUnknownParent(layout: Layout<T>): LayoutResult<T>;
            processUnknownChild(layout: Layout<T>): LayoutResult<T>;
            processTraverseHorizontal(layout: Layout<T>, siblings?: T[]): LayoutResult<T>;
            processTraverseVertical(layout: Layout<T>, siblings?: T[]): LayoutResult<T>;
            processLayoutHorizontal(layout: Layout<T>, strictMode?: boolean): LayoutResult<T>;
            setConstraints(): void;
            renderNode(layout: Layout<T>): string;
            renderNodeGroup(layout: Layout<T>): string;
            renderNodeStatic(controlName: string, depth: number, options?: ExternalData, width?: string, height?: string, node?: T, children?: boolean): string;
            createNodeGroup(node: T, children: T[], parent?: T, replacement?: T): T;
            addBeforeOutsideTemplate(id: number, value: string, index?: number): void;
            addBeforeInsideTemplate(id: number, value: string, index?: number): void;
            addAfterInsideTemplate(id: number, value: string, index?: number): void;
            addAfterOutsideTemplate(id: number, value: string, index?: number): void;
            getBeforeOutsideTemplate(id: number): string;
            getBeforeInsideTemplate(id: number): string;
            getAfterInsideTemplate(id: number): string;
            getAfterOutsideTemplate(id: number): string;
            hasAppendProcessing(id: number): boolean;
            cascadeDocument(templates: string[], children: T[]): string;
            getEnclosingTag(controlName: string, id: number, depth: number, innerXml?: string): string;
            removePlaceholders(value: string): string;
            replaceIndent(value: string, depth: number, cache: T[]): string;
        }

        class Controller<T extends Node> implements Controller<T> {
            constructor(application: Application<T>);
        }
    }
}

export = squared.base.Controller;