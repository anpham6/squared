import { LinearData } from '../base/nodelist';

import Container = squared.lib.base.Container;

declare global {
    namespace squared.base {
        interface NodeList<T extends Node> extends Container<T> {
            readonly nextId: number;
            afterAppend?: (node: T) => void;
            append(node: T, delegate?: boolean): this;
            reset(): void;
        }

        class NodeList<T extends Node> implements NodeList<T> {
            public static outerRegion<T extends Node>(node: T): BoxRect;
            public static actualParent<T>(list: T[]): T | null;
            public static baseline<T>(list: T[], text?: boolean): T | undefined;
            public static linearData<T>(list: T[], clearOnly?: boolean): LinearData<T>;
            public static partitionRows<T>(list: T[], parent?: T): T[][];
            public static siblingIndex(): number;
            constructor(children?: T[]);
        }
    }
}

export = squared.base.NodeList;