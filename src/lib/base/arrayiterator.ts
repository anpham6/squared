export default class Iterator<T = unknown> implements squared.lib.base.ArrayIterator<T> {
    protected _index = -1;
    protected _length: number;
    protected _iterating = 0;

    constructor(public children: T[]) {
        this._length = children.length;
    }

    public next() {
        if (this._iterating === -1) {
            this._iterating = 1;
            return this.children[this._index];
        }
        if (this.hasNext()) {
            this._iterating = 1;
            return this.children[++this._index];
        }
    }

    public hasNext() {
        return this._index < this._length - 1;
    }

    public remove() {
        if (this._length && this._iterating !== 0) {
            this.children.splice(this._index, 1);
            this._index -= this._iterating;
            --this._length;
        }
        else {
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