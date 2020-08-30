export default class Iterator<T = any> implements squared.lib.base.ArrayIterator<T> {
    public index = -1;
    public length: number;

    protected _iterating = 0;

    constructor(public children: T[]) {
        this.length = children.length;
    }

    public next() {
        if (this.hasNext()) {
            this._iterating = 1;
            return this.children[++this.index];
        }
    }

    public hasNext() {
        return this.index < this.length - 1;
    }

    public remove() {
        const iterating = this._iterating;
        if (iterating !== 0) {
            this.children.splice(this.index, 1);
            this.index -= iterating;
            --this.length;
            this._iterating = 0;
        }
    }

    public forEachRemaining(predicate: BindGeneric<T, void>) {
        const children = this.children;
        while (this.hasNext()) {
            predicate(children[++this.index]);
        }
    }
}