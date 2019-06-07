import { NodeTemplate } from '../base/@types/application';
import { LinearData, SiblingOptions, Support } from '../base/@types/node';

declare global {
    namespace squared.base {
        interface NodeUI extends Node {
            alignmentType: number;
            containerType: number;
            containerName: string;
            baselineActive: boolean;
            baselineAltered: boolean;
            positioned: boolean;
            rendered: boolean;
            excluded: boolean;
            controlId: string;
            controlName: string;
            renderExclude: boolean;
            textContent: string;
            positionAuto: boolean;
            baseline: boolean;
            multiline: boolean;
            overflow: number;
            contentBoxWidth: number;
            contentBoxHeight: number;
            lineBreakLeading: boolean;
            lineBreakTrailing: boolean;
            siblingsLeading: Node[];
            siblingsTrailing: Node[];
            floatContainer: boolean;
            inputContainer: boolean;
            flexbox: Flexbox;
            localSettings: {};
            renderAs?: NodeUI;
            renderParent?: NodeUI;
            renderExtension?: Extension<Node>[];
            renderTemplates?: (NodeTemplate<NodeUI> | null)[];
            outerWrapper?: NodeUI;
            innerWrapped?: NodeUI;
            companion?: NodeUI;
            extracted?: NodeUI[];
            horizontalRows?: NodeUI[][];
            readonly excludeSection: number;
            readonly excludeProcedure: number;
            readonly excludeResource: number;
            readonly renderChildren: NodeUI[];
            readonly groupParent: boolean;
            readonly baselineHeight: number;
            readonly layoutHorizontal: boolean;
            readonly layoutVertical: boolean;
            readonly singleChild: boolean;
            readonly support: Support;
            readonly documentId: string;
            setControlType(controlName: string, containerType?: number): void;
            setExclusions(): void;
            setLayout(): void;
            setAlignment(): void;
            setBoxSpacing(): void;
            attr(name: string, attr: string, value?: string, overwrite?: boolean): string;
            alignParent(position: string): boolean;
            alignSibling(position: string, documentId?: string): string;
            localizeString(value: string): string;
            inherit(node: Node, ...modules: string[]): void;
            clone(id?: number, attributes?: boolean, position?: boolean): NodeUI;
            cloneBase(node: NodeUI): void;
            is(containerType: number): boolean;
            of(containerType: number, ...alignmentType: number[]): boolean;
            namespace(name: string): StringMap;
            delete(name: string, ...attrs: string[]): void;
            apply(options: {}): void;
            addAlign(value: number): void;
            removeAlign(value: number): void;
            hasAlign(value: number): boolean;
            hasProcedure(value: number): boolean;
            hasResource(value: number): boolean;
            hasSection(value: number): boolean;
            exclude(resource?: number, procedure?: number, section?: number): void;
            hide(invisible?: boolean): void;
            appendTry(node: NodeUI, replacement: NodeUI, append?: boolean): boolean;
            render(parent?: NodeUI): void;
            renderEach(predicate: IteratorPredicate<NodeUI, void>): this;
            renderFilter(predicate: IteratorPredicate<NodeUI, boolean>): NodeUI[];
            actualRect(direction: string, dimension?: string): number;
            alignedVertically(siblings?: Node[], cleared?: Map<Node, string>, horizontal?: boolean): number;
            previousSiblings(options?: SiblingOptions): NodeUI[];
            nextSiblings(options?: SiblingOptions): NodeUI[];
            modifyBox(region: number, offset?: number, negative?: boolean): void;
            getBox(region: number): [number, number];
            resetBox(region: number, node?: NodeUI, fromParent?: boolean): void;
            transferBox(region: number, node: NodeUI): void;
            extractAttributes(depth: number): string;
        }

        class NodeUI implements NodeUI {
            public static linearData<T>(list: T[], clearOnly?: boolean): LinearData<T>;
            public static outerRegion<T>(node: T): BoxRect;
            public static baseline<T>(list: T[], text?: boolean): T | undefined;
            public static partitionRows<T>(list: T[], parent?: T): T[][];
            public static siblingIndex(): number;
            constructor(id: number, sessionId?: string, element?: Element);
        }

        class NodeGroupUI extends NodeUI {}
    }
}

export = squared.base.NodeUI;