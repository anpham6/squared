export default class Iterator<T> implements IterableIterator<T> {
    readonly length: number;

    private _index = -1;

    constructor(public readonly children: T[]) {
        this.length = children.length;
    }

    public [Symbol.iterator]() {
        return this;
    }

    public next() {
        const i = ++this._index;
        return (i < this.length ? { value: this.children[i] } : { done: true }) as IteratorResult<T>;
    }
}