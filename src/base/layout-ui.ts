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

    public rowCount?: number;
    public columnCount?: number;
    public renderType?: number;
    public renderIndex?: number;
    public next?: boolean;

    private _initialized?: boolean;
    private _itemCount?: number;
    private _linearX?: boolean;
    private _linearY?: boolean;
    private _floated?: Set<string>;
    private _singleRow?: boolean;

    constructor(
        public parent: T,
        public node: T,
        public containerType = 0,
        public alignmentType = 0,
        children: T[] = node.children as T[])
    {
        super(children);
    }

    public init() {
        const length = this.length;
        if (length > 1) {
            const linearData = NodeUI.linearData(this.children);
            this._floated = linearData.floated;
            this._linearX = linearData.linearX;
            this._linearY = linearData.linearY;
        }
        else if (length === 1) {
            this._linearY = this.children[0].blockStatic;
            this._linearX = !this._linearY;
        }
        else {
            return;
        }
        this._initialized = true;
    }

    public setContainerType(containerType: number, alignmentType?: number) {
        this.containerType = containerType;
        if (alignmentType) {
            this.addAlign(alignmentType);
        }
    }

    public addAlign(value: number) {
        return this.alignmentType |= value;
    }

    public hasAlign(value: number) {
        return hasBit(this.alignmentType, value);
    }

    public addRender(value: number) {
        if (this.renderType === undefined) {
            this.renderType = 0;
        }
        return this.renderType |= value;
    }

    public retainAs(list: T[]) {
        super.retainAs(list);
        if (this._initialized) {
            this.init();
        }
        return this;
    }

    set itemCount(value) {
        this._itemCount = value;
    }
    get itemCount() {
        return this._itemCount ?? this.length;
    }

    set type(value: LayoutType) {
        this.setContainerType(value.containerType, value.alignmentType);
        const renderType = value.renderType;
        if (renderType) {
            this.addRender(renderType);
        }
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
        return this._floated;
    }

    get singleRowAligned() {
        const result = this._singleRow;
        if (result === undefined) {
            const children = this.children;
            const length = children.length;
            if (length > 0) {
                if (length > 1) {
                    let previousBottom = Infinity;
                    let i = 0;
                    while (i < length) {
                        const node = children[i++];
                        if (node.blockStatic || node.multiline || Math.ceil(node.bounds.top) >= previousBottom) {
                            return this._singleRow = false;
                        }
                        previousBottom = node.bounds.bottom;
                    }
                }
                return this._singleRow = true;
            }
            return false;
        }
        return result;
    }
}