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

    private _floated?: Set<string>;
    private _cleared?: Map<T, string>;
    private _linearX?: boolean;
    private _linearY?: boolean;
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
        const linearData = NodeList.linearData(this.children);
        this._floated = linearData.floated;
        this._cleared = linearData.cleared;
        this._linearX = linearData.linearX;
        this._linearY = linearData.linearY;
        if (linearData.floated.size) {
            this.add(NODE_ALIGNMENT.FLOAT);
            if (this.some(node => node.blockStatic)) {
                this.add(NODE_ALIGNMENT.BLOCK);
            }
        }
        if (this.every(item => item.rightAligned)) {
            this.add(NODE_ALIGNMENT.RIGHT);
        }
        this.itemCount = this.children.length;
    }

    public reset(parent?: T, node?: T) {
        this.containerType = 0;
        this.alignmentType = 0;
        this.rowCount = 0;
        this.columnCount = 0;
        this.renderType = 0;
        this.renderIndex = -1;
        this.itemCount = 0;
        this._floated = undefined;
        this._cleared = undefined;
        this._linearX = undefined;
        this._linearY = undefined;
        if (parent) {
            this.parent = parent;
        }
        if (node) {
            this.node = node;
        }
        this.clear();
    }

    public setType(containerType: number, ...alignmentType: number[]) {
        this.containerType = containerType;
        for (const value of alignmentType) {
            this.add(value);
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

    get floated() {
        return this._floated || new Set<string>();
    }

    get cleared() {
        return this._cleared || new Map<T, string>();
    }

    get linearX() {
        return this._linearX !== undefined ? this._linearX : true;
    }

    get linearY() {
        return this._linearY !== undefined ? this._linearY : false;
    }

    get singleRowAligned() {
        if (this._singleRow === undefined) {
            let previousBottom = Number.POSITIVE_INFINITY;
            for (const node of this.children) {
                if (!node.inlineVertical && !node.plainText || node.multiline) {
                    return false;
                }
                else {
                    const offset = $util.convertFloat(node.verticalAlign);
                    if (node.linear.top - offset >= previousBottom) {
                        return false;
                    }
                    previousBottom = node.linear.bottom + offset;
                }
            }
            this._singleRow = true;
        }
        return this._singleRow;
    }

    get visible() {
        return this.filter(node => node.visible);
    }
}