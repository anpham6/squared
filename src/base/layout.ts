import Node from './node';
import NodeList from './nodelist';

import { NODE_ALIGNMENT } from './lib/enumeration';

const $util = squared.lib.util;

export default class Layout<T extends Node> extends squared.lib.base.Container<T> implements squared.base.Layout<T> {
    public rowCount = 0;
    public columnCount = 0;
    public renderType = 0;
    public renderIndex = -1;
    public itemCount = 0;

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
        if (children) {
            this.init();
        }
    }

    public init() {
        const length = this.children.length;
        if (length) {
            if (length > 1) {
                const linearData = NodeList.linearData(this.children);
                this._floated = linearData.floated;
                this._cleared = linearData.cleared;
                this._linearX = linearData.linearX;
                this._linearY = linearData.linearY;
            }
            else {
                this._linearY = (this.item(0) as T).blockStatic;
                this._linearX = !this._linearY;
            }
            let A = 0;
            let B = 0;
            for (let i = 0; i < length; i++) {
                const item = this.item(i) as T;
                if (item.floating) {
                    A++;
                }
                if (item.rightAligned) {
                    B++;
                }
            }
            if (A === length || this._floated && this._floated.size === 2) {
                this.add(NODE_ALIGNMENT.FLOAT);
                if (this.some(node => node.blockStatic)) {
                    this.add(NODE_ALIGNMENT.BLOCK);
                }
            }
            if (B === length) {
                this.add(NODE_ALIGNMENT.RIGHT);
            }
            this.itemCount = length;
        }
    }

    public reset(parent?: T, node?: T) {
        this.containerType = 0;
        this.alignmentType = 0;
        this.rowCount = 0;
        this.columnCount = 0;
        this.renderType = 0;
        this.renderIndex = -1;
        this.itemCount = 0;
        this._linearX = undefined;
        this._linearY = undefined;
        this._floated = undefined;
        this._cleared = undefined;
        if (parent) {
            this.parent = parent;
        }
        if (node) {
            this.node = node;
        }
        this.clear();
    }

    public setType(containerType: number, alignmentType?: number) {
        this.containerType = containerType;
        if (alignmentType) {
            this.alignmentType = alignmentType;
        }
    }

    public hasAlign(value: number) {
        return $util.hasBit(this.alignmentType, value);
    }

    public add(value: number) {
        if (!$util.hasBit(this.alignmentType, value)) {
            this.alignmentType |= value;
        }
        return this.alignmentType;
    }

    public delete(value: number) {
        if ($util.hasBit(this.alignmentType, value)) {
            this.alignmentType ^= value;
        }
        return this.alignmentType;
    }

    public retain(list: T[]) {
        super.retain(list);
        this.init();
        return this;
    }

    get linearX() {
        return this._linearX !== undefined ? this._linearX : true;
    }

    get linearY() {
        return this._linearY !== undefined ? this._linearY : false;
    }

    get floated() {
        return this._floated || new Set<string>();
    }

    get cleared() {
        return this._cleared || new Map<T, string>();
    }

    get singleRowAligned() {
        if (this._singleRow === undefined) {
            if (this.length) {
                this._singleRow = true;
                if (this.length > 1) {
                    let previousBottom = Number.POSITIVE_INFINITY;
                    for (const node of this.children) {
                        if (node.multiline || node.blockStatic) {
                            this._singleRow = false;
                            break;
                        }
                        else {
                            if ($util.aboveRange(node.linear.top, previousBottom)) {
                                this._singleRow = false;
                                break;
                            }
                            previousBottom = node.linear.bottom;
                        }
                    }
                }
            }
            else {
                return false;
            }
        }
        return this._singleRow;
    }

    get visible() {
        return this.filter(node => node.visible);
    }
}