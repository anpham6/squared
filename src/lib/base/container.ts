import ListIterator from './listiterator';

import { iterateArray, objectMap, partitionArray, sameArray } from '../util';

class Iter<T> implements Iterator<T> {
    public index = -1;
    public length: number;

    constructor(public children: T[]) {
        this.length = children.length;
    }

    public next() {
        const i = ++this.index;
        return (i < this.length ? { value: this.children[i] } : { done: true }) as IteratorResult<T>;
    }
}

export default class Container<T> implements squared.lib.base.Container<T>, Iterable<T> {
    private _children: T[];

    constructor(children?: T[]) {
        this._children = children || [];
    }

    public [Symbol.iterator]() {
        return new Iter(this._children);
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

    public remove(...items: T[]) {
        const result: T[] = [];
        const children = this._children;
        items.forEach(item => {
            const length = children.length;
            for (let i = 0; i < length; ++i) {
                if (children[i] === item) {
                    children.splice(i, 1);
                    result.push(item);
                    break;
                }
            }
        });
        return result;
    }

    public removeAt(index: number): Undef<T> {
        return this._children.splice(index, 1)[0];
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
        let i = 0;
        while (i < length) {
            predicate(children[i], i++, children);
        }
        return this;
    }

    public iterate(predicate: IteratorPredicate<T, void | boolean>, start?: number, end?: number) {
        return iterateArray(this._children, predicate, start, end);
    }

    public join(...other: Container<T>[]) {
        let children = this._children;
        other.forEach(item => children = children.concat(item.children));
        this._children = children;
        return this;
    }

    public every(predicate: IteratorPredicate<T, boolean>) {
        const children = this._children;
        const length = children.length;
        if (length) {
            let i = 0;
            while (i < length) {
                if (!predicate(children[i], i++, children)) {
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

    public partition(predicate: IteratorPredicate<T, boolean>): [T[], T[]] {
        return partitionArray(this._children, predicate);
    }

    public extract(predicate: IteratorPredicate<T, boolean>, options?: ContainerCascadeOptions<T>): T[] {
        let also: Undef<BindGeneric<T, void>>, error: Undef<IteratorPredicate<T, boolean>>;
        if (options) {
            ({ also, error } = options);
        }
        const result: T[] = [];
        const children = this._children;
        for (let i = 0; i < children.length; ++i) {
            const item = children[i];
            if (error && error(item, i, children)) {
                break;
            }
            if (predicate(item, i, children)) {
                also?.call(item, item);
                result.push(item);
                children.splice(i--, 1);
            }
        }
        return result;
    }

    public findIndex(predicate: IteratorPredicate<T, boolean>, options?: ContainerCascadeOptions<T>) {
        let also: Undef<BindGeneric<T, void>>, error: Undef<IteratorPredicate<T, boolean>>;
        if (options) {
            ({ also, error } = options);
        }
        const children = this._children;
        const length = children.length;
        for (let i = 0; i < length; ++i) {
            const item = children[i];
            if (error && error(item, i, children)) {
                return -1;
            }
            if (predicate(item, i, children)) {
                also?.call(item, item);
                return i;
            }
        }
        return -1;
    }

    public find(predicate: IteratorPredicate<T, boolean>, options?: ContainerFindOptions<T>) {
        let error: Undef<IteratorPredicate<T, boolean>>, also: Undef<BindGeneric<T, void>>, cascade: Undef<boolean>;
        if (options) {
            ({ also, error, cascade } = options);
        }
        let invalid = false;
        const recurse = (container: Container<T>): Undef<T> => {
            const children = container.children;
            const length = children.length;
            for (let i = 0; i < length; ++i) {
                const item = children[i];
                if (error && error(item, i, children)) {
                    invalid = true;
                    break;
                }
                if (predicate(item, i, children)) {
                    also?.call(item, item);
                    return item;
                }
                if (cascade && item instanceof Container && !item.isEmpty) {
                    const result = recurse(item);
                    if (result) {
                        also?.call(item, item);
                        return result;
                    }
                    else if (invalid) {
                        break;
                    }
                }
            }
            return undefined;
        };
        return recurse(this);
    }

    public some(predicate: IteratorPredicate<T, boolean>, options?: ContainerFindOptions<T>) {
        return this.find(predicate, options) !== undefined;
    }

    public cascade(predicate?: (item: T) => boolean, options?: ContainerCascadeOptions<T>) {
        let error: Undef<IteratorPredicate<T, boolean>>, also: Undef<BindGeneric<T, void>>;
        if (options) {
            ({ also, error } = options);
        }
        let invalid = false;
        const recurse = (container: Container<T>) => {
            let result: T[] = [];
            const children = container.children;
            const length = children.length;
            for (let i = 0; i < length; ++i) {
                const item = children[i];
                if (error && error(item, i, children)) {
                    invalid = true;
                    break;
                }
                if (!predicate || predicate(item)) {
                    also?.call(item, item);
                    result.push(item);
                }
                if (item instanceof Container && !item.isEmpty) {
                    result = result.concat(recurse(item));
                    if (invalid) {
                        break;
                    }
                }
            }
            return result;
        };
        return recurse(this);
    }

    public map<U>(predicate: IteratorPredicate<T, U>): U[] {
        return objectMap(this._children, predicate);
    }

    public sort(predicate: (a: T, b: T) => number) {
        this._children.sort(predicate);
        return this;
    }

    public concat(list: T[]) {
        this._children = this._children.concat(list);
        return this;
    }

    public iter() {
        return new ListIterator(this._children);
    }

    get children() {
        return this._children;
    }

    get isEmpty() {
        return this._children.length === 0;
    }

    get length() {
        return this._children.length;
    }
}