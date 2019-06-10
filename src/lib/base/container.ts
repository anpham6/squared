import { filterArray, flatMap, objectMap, partitionArray, sameArray, spliceArray } from '../util';

export default class Container<T> implements squared.lib.base.Container<T>, Iterable<T> {
    private _children: T[];

    constructor(children?: T[]) {
        this._children = children || [];
    }

    public [Symbol.iterator]() {
        const data: IteratorResult<T> = { done: false, value: undefined as any };
        const list = this._children;
        const length = list.length;
        let i = 0;
        return {
            next(): IteratorResult<T> {
                if (i < length) {
                    data.value = list[i++];
                }
                else {
                    data.done = true;
                }
                return data;
            }
        };
    }

    public item(index?: number, value?: T): T | undefined {
        if (index !== undefined) {
            if (value !== undefined) {
                if (index >= 0 && index < this._children.length) {
                    this._children[index] = value;
                    return value;
                }
                return undefined;
            }
            return this._children[index];
        }
        return this._children[this._children.length - 1];
    }

    public append(item: T) {
        this._children.push(item);
        return this;
    }

    public remove(item: T) {
        const children = this._children;
        const length = children.length;
        for (let i = 0; i < length; i++) {
            if (children[i] === item) {
                return children.splice(i, 1);
            }
        }
        return [];
    }

    public contains(item: T) {
        return this._children.includes(item);
    }

    public retain(list: T[]) {
        this._children = list;
        return this;
    }

    public duplicate() {
        return this._children.slice(0);
    }

    public clear() {
        this._children.length = 0;
        return this;
    }

    public each(predicate: IteratorPredicate<T, void>) {
        const children = this._children;
        const length = children.length;
        for (let i = 0; i < length; i++) {
            predicate(children[i], i, children);
        }
        return this;
    }

    public find(predicate: IteratorPredicate<T, boolean> | string, value?: any) {
        const children = this._children;
        const length = children.length;
        if (typeof predicate === 'string') {
            for (let i = 0; i < length; i++) {
                if (children[i][predicate] === value) {
                    return children[i];
                }
            }
        }
        else {
            for (let i = 0; i < length; i++) {
                if (predicate(children[i], i, children)) {
                    return children[i];
                }
            }
        }
        return undefined;
    }

    public sort(predicate: (a: T, b: T) => number) {
        if (predicate) {
            this._children.sort(predicate);
        }
        return this;
    }

    public concat(list: T[]) {
        this._children = this._children.concat(list);
        return this;
    }

    public every(predicate: IteratorPredicate<T, boolean>) {
        const children = this._children;
        const length = children.length;
        if (length) {
            for (let i = 0; i < length; i++) {
                if (!predicate(children[i], i, children)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    public some(predicate: IteratorPredicate<T, boolean>) {
        const children = this._children;
        const length = children.length;
        for (let i = 0; i < length; i++) {
            if (predicate(children[i], i, children)) {
                return true;
            }
        }
        return false;
    }

    public same(predicate: IteratorPredicate<T, any>) {
        return sameArray(this._children, predicate);
    }

    public filter(predicate: IteratorPredicate<T, any>) {
        return filterArray(this._children, predicate);
    }

    public partition(predicate: IteratorPredicate<T, boolean>): [T[], T[]] {
        return partitionArray(this._children, predicate);
    }

    public splice(predicate: IteratorPredicate<T, boolean>, callback?: (item: T) => void): T[] {
        return spliceArray(this._children, predicate, callback);
    }

    public map<U>(predicate: IteratorPredicate<T, U>): U[] {
        return objectMap(this._children, predicate);
    }

    public flatMap<U>(predicate: IteratorPredicate<T, U>): U[] {
        return flatMap(this._children, predicate);
    }

    public cascadeSome(predicate: IteratorPredicate<T, boolean>) {
        function cascade(container: Container<T>) {
            const children = container.children;
            const length = children.length;
            for (let i = 0; i < length; i++) {
                const item = children[i] as T;
                if (predicate(item, i, children)) {
                    return true;
                }
                if (item instanceof Container && item.length && cascade(item)) {
                    return true;
                }
            }
            return false;
        }
        return cascade(this);
    }

    public cascade(predicate?: (item: T) => boolean) {
        function cascade(container: Container<T>) {
            let result: T[] = [];
            for (const item of container.children) {
                if (predicate === undefined || predicate(item)) {
                    result.push(item);
                }
                if (item instanceof Container && item.length) {
                    result = result.concat(cascade(item));
                }
            }
            return result;
        }
        return cascade(this);
    }

    get children() {
        return this._children;
    }

    get length() {
        return this._children.length;
    }
}