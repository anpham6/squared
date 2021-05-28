import NodeUI from './node-ui';

export default class LayoutUI<T extends NodeUI> extends squared.lib.base.Container<T> implements squared.base.LayoutUI<T> {
    public static create<U extends NodeUI>(options: LayoutOptions<U>) {
        const { itemCount, rowCount, columnCount } = options;
        const layout = new LayoutUI(options.parent, options.node, options.containerType, options.alignmentType, options.children);
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

    public clearMap: Undef<Map<T, string>> = undefined;
    public absolute = true;
    public renderIndex = -1;
    public rowCount?: number;
    public columnCount?: number;
    public next?: boolean;

    private _floated: Null<Set<string>> = null;
    private _initialized = false;
    private _itemCount = NaN;
    private _linearX: Undef<boolean> = undefined;
    private _linearY: Undef<boolean> = undefined;
    private _singleRow: Undef<boolean> = undefined;

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
        const length = this.size();
        if (length > 1) {
            const { linearX, linearY, floated } = NodeUI.linearData(this.children, this.clearMap, this.absolute);
            this._linearX = linearX;
            this._linearY = linearY;
            if (floated) {
                this._floated = floated;
            }
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

    public setContainerType(containerType: number, alignmentType: number) {
        this.containerType = containerType;
        this.addAlign(alignmentType);
    }

    public addAlign(value: number) {
        return this.alignmentType |= value;
    }

    public hasAlign(value: number) {
        return (this.alignmentType & value) > 0;
    }

    public retainAs(list: T[]) {
        super.retainAs(...(arguments as unknown) as [T[]]);
        if (this._initialized) {
            this.init();
        }
        return this;
    }

    set itemCount(value) {
        this._itemCount = value;
    }
    get itemCount() {
        return isNaN(this._itemCount) ? this.size() : this._itemCount;
    }

    get linearX() {
        if (!this._initialized) {
            this.init();
        }
        const result = this._linearX;
        return result === undefined ? true : result;
    }

    get linearY() {
        if (!this._initialized) {
            this.init();
        }
        const result = this._linearY;
        return result === undefined ? false : result;
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
            if (length > 1) {
                let previousBottom = Infinity;
                for (let i = 0; i < length; ++i) {
                    const node = children[i];
                    if (node.blockStatic || node.multiline || Math.ceil(node.bounds.top) >= previousBottom) {
                        return this._singleRow = false;
                    }
                    previousBottom = node.bounds.bottom;
                }
            }
            return this._singleRow = true;
        }
        return result;
    }
}