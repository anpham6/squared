import { ControllerUISettings, FileAsset, LayoutResult, LayoutType, NodeTemplate, UserUISettings } from '../base/@types/application';

declare global {
    namespace squared.base {
        interface ControllerUI<T extends NodeUI> extends Controller<T> {
            readonly userSettings: UserUISettings;
            readonly localSettings: ControllerUISettings;
            readonly containerTypeHorizontal: LayoutType;
            readonly containerTypeVertical: LayoutType;
            readonly containerTypeVerticalMargin: LayoutType;
            readonly containerTypePercent: LayoutType;
            optimize(nodes: T[]): void;
            finalize(layouts: FileAsset[]): void;
            processUnknownParent(layout: LayoutUI<T>): LayoutResult<T>;
            processUnknownChild(layout: LayoutUI<T>): LayoutResult<T>;
            processTraverseHorizontal(layout: LayoutUI<T>, siblings: T[]): LayoutUI<T>;
            processTraverseVertical(layout: LayoutUI<T>, siblings: T[]): LayoutUI<T>;
            processLayoutHorizontal(layout: LayoutUI<T>): LayoutUI<T>;
            setConstraints(): void;
            renderNode(layout: LayoutUI<T>): NodeTemplate<T> | undefined;
            renderNodeGroup(layout: LayoutUI<T>): NodeTemplate<T> | undefined;
            renderNodeStatic(controlName: string, options?: ExternalData, width?: string, height?: string, content?: string): string;
            createNodeGroup(node: T, children: T[], parent?: T, traverse?: boolean): T;
            sortRenderPosition(parent: T, templates: NodeTemplate<T>[]): NodeTemplate<T>[];
            addBeforeOutsideTemplate(id: number, value: string, format?: boolean, index?: number): void;
            addBeforeInsideTemplate(id: number, value: string, format?: boolean, index?: number): void;
            addAfterInsideTemplate(id: number, value: string, format?: boolean, index?: number): void;
            addAfterOutsideTemplate(id: number, value: string, format?: boolean, index?: number): void;
            getBeforeOutsideTemplate(id: number, depth: number): string;
            getBeforeInsideTemplate(id: number, depth: number): string;
            getAfterInsideTemplate(id: number, depth: number): string;
            getAfterOutsideTemplate(id: number, depth: number): string;
            hasAppendProcessing(id?: number): boolean;
            cascadeDocument(templates: NodeTemplate<T>[], depth: number): string;
            getEnclosingXmlTag(controlName: string, attributes?: string, content?: string): string;
        }

        class ControllerUI<T extends NodeUI> implements Controller<T> {
            public static causesLineBreak(element: Element, sessionId: string): boolean;
            constructor(application: Application<T>, cache: NodeList<T>);
        }
    }
}

export = squared.base.Controller;