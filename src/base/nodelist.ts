export default class NodeList<T extends squared.base.Node> extends squared.lib.base.Container<T> implements squared.base.NodeList<T> {
    public afterAppend?: (node: T, cascade?: boolean) => void;

    private _currentId = 0;

    constructor(children?: T[]) {
        super(children);
    }

    public append(node: T, delegate = false, cascade = false) {
        super.append(node);
        if (delegate) {
            this.afterAppend?.call(this, node, cascade);
        }
        return this;
    }

    public reset() {
        this._currentId = 0;
        this.clear();
        return this;
    }

    get nextId() {
        return ++this._currentId;
    }
}