import ArrayIterator from './arrayiterator';

export default class ListIterator<T> extends ArrayIterator<T> implements squared.lib.base.ListIterator<T> {
    constructor(children: T[]) {
        super(children);
    }

    public add(item: T): void {
        const iterating = this._iterating;
        if (iterating !== 0) {
            this.children.splice(iterating === 1 ? Math.min(++this.index, this.length) : Math.max(--this.index, 0), 0, item);
            ++this.length;
            this._iterating = 0;
        }
    }

    public set(item: T): void {
        if (this._iterating !== 0) {
            this.children[this.index] = item;
            this._iterating = 0;
        }
    }

    public nextIndex(): number {
        return Math.min(this.index + 1, this.length);
    }

    public hasPrevious(): boolean {
        return this.previousIndex() > 0;
    }

    public previous() {
        if (this.hasPrevious()) {
            this._iterating = -1;
            return this.children[--this.index];
        }
        return undefined;
    }

    public previousIndex(): number {
        return Math.max(this.index - 1, -1);
    }
}