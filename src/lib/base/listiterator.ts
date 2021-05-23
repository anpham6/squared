import ArrayIterator from './arrayiterator';

export default class ListIterator<T = unknown> extends ArrayIterator<T> implements squared.lib.base.ListIterator<T> {
    public add(item: T): void {
        if (this._iterating !== 0) {
            this.children.splice(this._iterating === 1 ? Math.min(this._index + 1, this._length) : Math.max(this._index - 1, 0), 0, item);
            ++this._length;
        }
    }

    public set(item: T): void {
        if (this._iterating !== 0) {
            this.children[this._index] = item;
        }
    }

    public nextIndex(): number {
        return this._index + 1;
    }

    public hasPrevious(): boolean {
        return this._index > 0;
    }

    public previous() {
        if (this._iterating === 1) {
            this._iterating = -1;
            return this.children[this._index];
        }
        if (this.hasPrevious()) {
            this._iterating = -1;
            return this.children[--this._index];
        }
    }

    public previousIndex(): number {
        return this._index - 1;
    }
}