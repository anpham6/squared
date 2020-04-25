export default class SymbolIterator<T> implements squared.lib.base.SymbolIterator<T> {
    public readonly length: number;

    private _index = 0;

    constructor(public children: T[]) {
        this.length = children.length;
    }

    public next() {
        const i = this._index++;
        return <IteratorResult<T>>(i < this.length ? { value: this.children[i] } : { done: true });
    }
}