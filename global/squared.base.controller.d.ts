import { AppHandler, ControllerSettings, LayoutType, LayoutResult, SessionData, UserSettings } from '../src/base/types/application';

declare global {
    namespace squared.base {
        export interface Controller<T extends Node> extends AppHandler<T> {
            application: Application<T>;
            cache: NodeList<T>;
            readonly userSettings: UserSettings;
            readonly localSettings: ControllerSettings;
            readonly containerTypeHorizontal: LayoutType;
            readonly containerTypeVertical: LayoutType;
            readonly containerTypeVerticalMargin: LayoutType;
            readonly afterInsertNode: SelfWrapped<T, void>;
            finalize(data: SessionData<NodeList<T>>): void;
            reset(): void;
            processUnknownParent(layout: Layout<T>): LayoutResult<T>;
            processUnknownChild(layout: Layout<T>): LayoutResult<T>;
            processTraverseHorizontal(layout: Layout<T>, siblings?: T[]): LayoutResult<T>;
            processTraverseVertical(layout: Layout<T>, siblings?: T[]): LayoutResult<T>;
            processLayoutHorizontal(layout: Layout<T>, strictMode?: boolean): LayoutResult<T>;
            setConstraints(): void;
            renderNode(layout: Layout<T>): string;
            renderNodeGroup(layout: Layout<T>): string;
            renderNodeStatic(controlName: string, depth: number, options?: ExternalData, width?: string, height?: string, node?: T, children?: boolean): string;
            createNodeGroup(node: T, children: T[], parent?: T, replaceWith?: T): T;
            replaceRenderQueue(output: string): string;
            prependBefore(id: number, output: string, index?: number): void;
            appendAfter(id: number, output: string, index?: number): void;
            hasAppendProcessing(id: number): boolean;
            getEnclosingTag(controlName: string, id: number, depth: number, xml?: string): string;
            removePlaceholders(value: string): string;
            replaceIndent(value: string, depth: number, cache: T[]): string;
        }

        export class Controller<T extends Node> implements Controller<T> {
            constructor(application: Application<T>);
        }
    }
}

export {};