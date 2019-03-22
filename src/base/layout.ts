import { LinearData } from './nodelist';

import Node from './node';
import NodeList from './nodelist';

import { NODE_ALIGNMENT } from './lib/enumeration';

const $util = squared.lib.util;

export default class Layout<T extends Node> extends squared.lib.base.Container<T> implements squared.base.Layout<T> {
    public rowCount = 0;
    public columnCount = 0;
    public renderType = 0;
    public renderIndex = -1;

    public orderAltered = false;

    private _linearData!: LinearData<T>;

    constructor(
        public parent: T,
        public node: T,
        public containerType = 0,
        public alignmentType = 0,
        public itemCount = 0,
        children?: T[])
    {
        super(children);
    }

    public init() {
        this._linearData = NodeList.linearData(this.children);
        if (this._linearData.floated.size) {
            this.add(NODE_ALIGNMENT.FLOAT);
        }
        if (this.every(item => item.float === 'right')) {
            this.add(NODE_ALIGNMENT.RIGHT);
        }
    }

    public setType(containerType: number, ...alignmentType: number[]) {
        this.containerType = containerType;
        for (const value of alignmentType) {
            this.add(value);
        }
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
        this.itemCount = list.length;
        return this;
    }

    get floated() {
        if (this._linearData === undefined) {
            this.init();
        }
        return this._linearData.floated;
    }

    get cleared() {
        if (this._linearData === undefined) {
            this.init();
        }
        return this._linearData.cleared;
    }

    get linearX() {
        if (this._linearData === undefined) {
            this.init();
        }
        return this._linearData.linearX;
    }

    get linearY() {
        if (this._linearData === undefined) {
            this.init();
        }
        return this._linearData.linearY;
    }

    get visible() {
        return this.filter(node => node.visible);
    }
}