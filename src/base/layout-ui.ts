import { LayoutOptions, LayoutType } from '../../@types/base/application';

import NodeUI from './node-ui';

const { hasBit } = squared.lib.util;

export default class LayoutUI<T extends NodeUI> extends squared.lib.base.Container<T> implements squared.base.LayoutUI<T> {
    public static create<T extends NodeUI>(options: LayoutOptions<T>) {
        const { parent, node, containerType, alignmentType, children, itemCount, rowCount, columnCount } = options;
        const layout = new LayoutUI(parent, node, containerType, alignmentType, children);
        if (itemCount) {
            layout.itemCount = itemCount;
        }
        if (rowCount) {
            layout.rowCount = rowCount;
        }
        if (columnCount) {
            layout.columnCount = columnCount;
        }
        return layout;
    }

    public rowCount = 0;
    public columnCount = 0;
    public renderType = 0;
    public renderIndex = -1;

    private _initialized?: boolean;
    private _itemCount?: number;
    private _linearX?: boolean;
    private _linearY?: boolean;
    private _floated?: Set<string>;
    private _cleared?: Map<T, string>;
    private _singleRow?: boolean;

    constructor(
        public parent: T,
        public node: T,
        public containerType = 0,
        public alignmentType = 0,
        children?: T[])
    {
        super(children);
    }

    public init() {
        const length = this.length;
        if (length > 1) {
            const linearData = NodeUI.linearData(this.children);
            this._floated = linearData.floated;
            this._cleared = linearData.cleared;
            this._linearX = linearData.linearX;
            this._linearY = linearData.linearY;
        }
        else if (length > 0) {
            this._linearY = (this.item(0) as T).blockStatic;
            this._linearX = !this._linearY;
        }
        this._initialized = true;
    }

    public setContainerType(containerType: number, alignmentType?: number) {
        this.containerType = containerType;
        if (alignmentType) {
            this.add(alignmentType);
        }
    }

    public hasAlign(value: number) {
        return hasBit(this.alignmentType, value);
    }

    public add(value: number) {
        if (!hasBit(this.alignmentType, value)) {
            this.alignmentType |= value;
        }
        return this.alignmentType;
    }

    public addRender(value: number) {
        if (!hasBit(this.renderType, value)) {
            this.renderType |= value;
        }
        return this.renderType;
    }

    public delete(value: number) {
        if (hasBit(this.alignmentType, value)) {
            this.alignmentType ^= value;
        }
        return this.alignmentType;
    }

    public retain(list: T[]) {
        super.retain(list);
        this.init();
        return this;
    }

    set itemCount(value) {
        this._itemCount = value;
    }
    get itemCount() {
        return this._itemCount ?? this.length;
    }

    get linearX() {
        if (!this._initialized) {
            this.init();
        }
        return this._linearX ?? true;
    }

    get linearY() {
        if (!this._initialized) {
            this.init();
        }
        return this._linearY ?? false;
    }

    get floated() {
        if (!this._initialized) {
            this.init();
        }
        return this._floated || new Set<string>();
    }

    get cleared() {
        if (!this._initialized) {
            this.init();
        }
        return this._cleared || new Map<T, string>();
    }

    set type(value: LayoutType) {
        this.setContainerType(value.containerType, value.alignmentType);
    }

    get singleRowAligned() {
        let result = this._singleRow;
        if (result === undefined) {
            const length = this.length;
            if (length) {
                result = true;
                if (length > 1) {
                    let previousBottom = Number.POSITIVE_INFINITY;
                    for (const node of this.children) {
                        if (node.blockStatic || node.multiline || Math.ceil(node.bounds.top) >= previousBottom) {
                            result = false;
                            break;
                        }
                        previousBottom = node.bounds.bottom;
                    }
                }
                this._singleRow = result;
            }
            else {
                result = false;
            }
        }
        return result;
    }

    get unknownAligned() {
        return this.length > 1 && !this.linearX && !this.linearY;
    }
}