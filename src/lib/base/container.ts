import { filterArray, flatMap, objectMap, partitionArray, sameArray, spliceArray } from '../util';

export default class Container<T> implements squared.lib.base.Container<T>, Iterable<T> {
    private _children: T[];

    constructor(children?: T[]) {
        this._children = children || [];
    }

    public [Symbol.iterator]() {
        const data = <IteratorResult<T>> { done: false };
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

    public item(index?: number, value?: T): Undef<T> {
        const children = this._children;
        if (index !== undefined) {
            if (value) {
                if (index >= 0 && index < children.length) {
                    children[index] = value;
                    return value;
                }
                return undefined;
            }
            return children[index];
        }
        return children[children.length - 1];
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

    public join(...other: Container<T>[]) {
        for (const item of other) {
            this._children = this._children.concat(item.children);
        }
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

    public find(predicate: IteratorPredicate<T, boolean>, options: ContainerFindOptions<T> = {}) {
        const { cascade, error } = options;
        let invalid = false;
        function recurse(container: Container<T>): Undef<T> {
            const children = container.children;
            const length = children.length;
            for (let i = 0; i < length; i++) {
                const item = children[i];
                if (error && error(item, i, children)) {
                    invalid = true;
                    break;
                }
                if (predicate(item, i, children)) {
                    return item;
                }
                if (cascade && item instanceof Container && item.length) {
                    const result = recurse(item);
                    if (result) {
                        return result;
                    }
                    else if (invalid) {
                        break;
                    }
                }
            }
            return undefined;
        }
        return recurse(this);
    }

    public some(predicate: IteratorPredicate<T, boolean>, options: ContainerFindOptions<T> = {}) {
        return this.find(predicate, options) !== undefined;
    }

    public cascade(predicate?: (item: T) => boolean, options: ContainerCascadeOptions<T> = {}) {
        const { error } = options;
        let invalid = false;
        function recurse(container: Container<T>) {
            let result: T[] = [];
            const children = container.children;
            const length = children.length;
            for (let i = 0; i < length; i++) {
                const item = children[i];
                if (error && error(item, i, children)) {
                    invalid = true;
                    break;
                }
                if (predicate === undefined || predicate(item)) {
                    result.push(item);
                }
                if (item instanceof Container && item.length) {
                    result = result.concat(recurse(item));
                    if (invalid) {
                        break;
                    }
                }
            }
            return result;
        }
        return recurse(this);
    }

    get children() {
        return this._children;
    }

    get length() {
        return this._children.length;
    }
}