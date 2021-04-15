import ArrayIterator from './arrayiterator';

export default class ListIterator<T = unknown> extends ArrayIterator<T> implements squared.lib.base.ListIterator<T> {
    public add(item: T): void {
        const iterating = this._iterating;
        if (iterating !== 0) {
            this.children.splice(iterating === 1 ? Math.min(++this._index, this._length) : Math.max(--this._index, 0), 0, item);
            ++this._length;
            this._iterating = 0;
        }
    }

    public set(item: T): void {
        if (this._iterating !== 0) {
            this.children[this._index] = item;
            this._iterating = 0;
        }
    }

    public nextIndex(): number {
        return Math.min(this._index + 1, this._length);
    }

    public hasPrevious(): boolean {
        return this.previousIndex() > 0;
    }

    public previous() {
        if (this.hasPrevious()) {
            this._iterating = -1;
            return this.children[--this._index];
        }
    }

    public previousIndex(): number {
        return Math.max(this._index - 1, -1);
    }
}