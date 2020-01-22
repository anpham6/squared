import { LayoutType } from '../../@types/base/application';

import NodeUI from './node-ui';

import { NODE_ALIGNMENT } from './lib/enumeration';

const { aboveRange, hasBit } = squared.lib.util;

export default class LayoutUI<T extends NodeUI> extends squared.lib.base.Container<T> implements squared.base.LayoutUI<T> {
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
        if (children?.length) {
            this.init();
        }
    }

    public init() {
        const children = this.children;
        const length = children.length;
        if (length) {
            if (length > 1) {
                const linearData = NodeUI.linearData(children);
                this._floated = linearData.floated;
                this._cleared = linearData.cleared;
                this._linearX = linearData.linearX;
                this._linearY = linearData.linearY;
            }
            else {
                this._linearY = children[0].blockStatic;
                this._linearX = !this._linearY;
            }
            let A = 0;
            let B = 0;
            for (let i = 0; i < length; i++) {
                const item = children[i];
                if (item.floating) {
                    A++;
                }
                else {
                    A = Number.POSITIVE_INFINITY;
                }
                if (item.rightAligned) {
                    B++;
                }
                else {
                    B = Number.POSITIVE_INFINITY;
                }
                if (A === Number.POSITIVE_INFINITY && B === Number.POSITIVE_INFINITY) {
                    break;
                }
            }
            if (A === length || this._floated?.size === 2) {
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

    get linearX() {
        return this._linearX ?? true;
    }

    get linearY() {
        return this._linearY ?? false;
    }

    get floated() {
        return this._floated || new Set<string>();
    }

    get cleared() {
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
                        if (node.multiline || node.blockStatic) {
                            result = false;
                            break;
                        }
                        else {
                            if (aboveRange(node.linear.top, previousBottom)) {
                                result = false;
                                break;
                            }
                            previousBottom = node.linear.bottom;
                        }
                    }
                }
            }
            else {
                result = false;
            }
            this._singleRow = result;
        }
        return result;
    }

    get unknownAligned() {
        return this.length > 1 && !this.linearX && !this.linearY;
    }

    get visible() {
        return this.filter(node => node.visible);
    }
}