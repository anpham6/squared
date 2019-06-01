import { NodeTemplate } from '../base/@types/application';
import { Support } from '../base/@types/node';

declare global {
    namespace squared.base {
        interface NodeUI extends Node {
            containerType: number;
            baselineActive: boolean;
            baselineAltered: boolean;
            positioned: boolean;
            controlId: string;
            controlName: string;
            renderExclude: boolean;
            renderAs?: NodeUI;
            renderExtension?: Extension<Node>[];
            renderTemplates?: (NodeTemplate<NodeUI> | null)[];
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
            readonly support: Support;
            readonly documentId: string;
            setControlType(controlName: string, containerType?: number): void;
            setLayout(): void;
            setAlignment(): void;
            attr(name: string, attr: string, value?: string, overwrite?: boolean): string;
            hide(invisible?: boolean): void;
            alignParent(position: string): boolean;
            alignSibling(position: string, documentId?: string): string;
            localizeString(value: string): string;
            clone(id?: number, attributes?: boolean, position?: boolean): NodeUI;
            cloneBase(node: NodeUI): void;
            renderFilter(predicate: IteratorPredicate<NodeUI, boolean>): NodeUI[];
            is(containerType: number): boolean;
            of(containerType: number, ...alignmentType: number[]): boolean;
            namespace(name: string): StringMap;
            delete(name: string, ...attrs: string[]): void;
            apply(options: {}): void;
            render(parent?: NodeUI): void;
            renderEach(predicate: IteratorPredicate<NodeUI, void>): this;
            ascendOuter(condition?: (item: NodeUI) => boolean, parent?: NodeUI): NodeUI[];
            actualRect(direction: string, dimension?: string): number;
            appendTry(node: NodeUI, replacement: NodeUI, append?: boolean): boolean;
            hasProcedure(value: number): boolean;
            hasResource(value: number): boolean;
            hasSection(value: number): boolean;
            exclude(resource?: number, procedure?: number, section?: number): void;
            setExclusions(): void;
            setBoxSpacing(): void;
            extractAttributes(depth: number): string;
            modifyBox(region: number, offset?: number, negative?: boolean): void;
            getBox(region: number): [number, number];
            resetBox(region: number, node?: NodeUI, fromParent?: boolean): void;
            transferBox(region: number, node: NodeUI): void;
        }

        class NodeUI implements NodeUI {
            public static outerRegion<T>(node: T): BoxRect;
            public static actualParent<T>(list: T[]): T | null;
            public static baseline<T>(list: T[], text?: boolean): T | undefined;
            public static partitionRows<T>(list: T[], parent?: T): T[][];
            constructor(id: number, sessionId?: string, element?: Element);
        }

        class NodeGroup extends NodeUI {}
    }
}

export = squared.base.NodeUI;