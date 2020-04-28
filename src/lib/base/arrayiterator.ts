export default class Iterator<T> implements squared.lib.base.ArrayIterator<T> {
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
        return undefined;
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

    public forEachRemaining(action: BindGeneric<T, void>) {
        while (this.hasNext()) {
            action(this.children[++this.index]);
        }
    }
}