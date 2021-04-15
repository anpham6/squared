export default class Iterator<T = any> implements squared.lib.base.ArrayIterator<T> {
    protected _index = -1;
    protected _length: number;
    protected _iterating = 0;

    constructor(public children: T[]) {
        this._length = children.length;
    }

    public next() {
        if (this.hasNext()) {
            this._iterating = 1;
            return this.children[++this._index];
        }
    }

    public hasNext() {
        return this._index < this._length - 1;
    }

    public remove() {
        const iterating = this._iterating;
        if (iterating !== 0) {
            this.children.splice(this._index, 1);
            this._index -= iterating;
            --this._length;
            this._iterating = 0;
        }
    }

    public forEachRemaining(predicate: FunctionSelf<T, void>) {
        const children = this.children;
        while (this.hasNext()) {
            predicate.call(this, children[++this._index]);
        }
    }
}