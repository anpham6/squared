import { LayoutType } from '../src/base/types/application';

import Container = squared.lib.base.Container;

declare global {
    namespace squared.base {
        interface Layout<T extends Node> extends Container<T>, LayoutType {
            parent: T;
            node: T;
            itemCount: number;
            rowCount: number;
            columnCount: number;
            floated: Set<string>;
            cleared: Map<T, string>;
            linearX: boolean;
            linearY: boolean;
            renderPosition: boolean;
            readonly visible: T[];
            init(): void;
            initParent(): void;
            setType(containerType: number, ...alignmentType: number[]): void;
            getFloated(parent?: boolean): Set<string>;
            getCleared(parent?: boolean): Map<T, string>;
            isLinearX(): boolean;
            isLinearY(): boolean;
            add(value: number): number;
            delete(value: number): number;
        }

        class Layout<T extends Node> implements Layout<T> {
            constructor(parent: T, node: T, containerType?: number, alignmentType?: number, itemCount?: number, children?: T[]);
        }
    }
}

export = squared.base.Layout;