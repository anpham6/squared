import ListIterator from './listiterator';

import { partitionArray, plainMap } from '../util';

class Iter<T> implements Iterator<T> {
    private index = -1;

    constructor(
        public readonly children: T[],
        public readonly length = children.length)
    {
    }

    public next() {
        const i = ++this.index;
        return (i < this.length ? { value: this.children[i] } : { done: true }) as IteratorResult<T>;
    }
}

export default class Container<T = any> implements squared.lib.base.Container<T>, Iterable<T> {
    constructor(public children: T[] = []) {}

    public [Symbol.iterator]() {
        return new Iter(this.children);
    }

    public item(index: number, value?: T): Undef<T> {
        const children = this.children;
        if (arguments.length === 2) {
            if (index < 0) {
                index += children.length;
            }
            else {
                index = Math.min(index, children.length);
            }
            children[index] = value!;
            return value;
        }
        return index >= 0 ? children[index] : children[children.length + index];
    }

    public add(item: T) {
        this.children.push(item);
        return this;
    }

    public addAll(list: T[] | Container<T>) {
        this.children = this.children.concat(Array.isArray(list) ? list : list.children);
        return this;
    }

    public remove(item: T): Undef<T> {
        const index = this.children.indexOf(item);
        if (index !== -1) {
            return this.removeAt(index);
        }
    }

    public removeAll(list: T[] | Container<T>) {
        if (!Array.isArray(list)) {
            list = list.children;
        }
        const result: T[] = [];
        const children = this.children;
        for (let i = 0, length = list.length; i < length; ++i) {
            const item = list[i];
            for (let j = 0; j < children.length; ++j) {
                if (children[j] === item) {
                    children.splice(j, 1);
                    result.push(item);
                    break;
                }
            }
        }
        return result;
    }

    public removeAt(index: number): Undef<T> {
        return this.children.splice(index, 1)[0];
    }

    public retainAs(list: T[]) {
        this.children = list;
        return this;
    }

    public contains(item: T) {
        return this.children.includes(item);
    }

    public clear() {
        this.children.length = 0;
        return this;
    }

    public each(predicate: IteratorPredicate<T, void>) {
        const children = this.children;
        for (let i = 0, length = children.length; i < length; ++i) {
            predicate(children[i], i, children);
        }
        return this;
    }

    public every(predicate: IteratorPredicate<T, boolean>, options?: ContainerRangeOptions) {
        const children = this.children;
        let length = children.length;
        if (length) {
            let i = 0;
            if (options) {
                const { start, end } = options;
                if (start) {
                    i = Math.max(start, 0);
                }
                if (end) {
                    length = Math.min(end, length);
                }
            }
            for ( ; i < length; ++i) {
                if (!predicate(children[i], i, children)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    public removeIf(predicate: IteratorPredicate<T, boolean>, options?: ContainerCascadeOptions<T>): T[] {
        let also: Undef<BindGeneric<T, void>>,
            error: Undef<IteratorPredicate<T, boolean>>;
        if (options) {
            ({ also, error } = options);
        }
        const result: T[] = [];
        const children = this.children;
        for (let i = 0; i < children.length; ++i) {
            const item = children[i];
            if (error && error(item, i, children)) {
                break;
            }
            if (predicate(item, i, children)) {
                if (also) {
                    also.call(item, item);
                }
                result.push(item);
                children.splice(i--, 1);
            }
        }
        return result;
    }

    public find(predicate: IteratorPredicate<T, boolean>, options?: ContainerFindOptions<T>) {
        if (options) {
            const { also, error, cascade } = options;
            let { start, end, count } = options;
            if (start) {
                start = Math.max(start, 0);
            }
            if (end) {
                end = Math.min(this.size(), end);
            }
            if (count === undefined || count < 0) {
                count = 0;
            }
            let invalid: Undef<boolean>;
            const recurse = (container: Container<T>, level: number): Undef<T> => {
                const children = container.children;
                let i = 0,
                    length = children.length;
                if (level === 0) {
                    if (start) {
                        i = start;
                    }
                    if (end) {
                        length = end;
                    }
                }
                for ( ; i < length; ++i) {
                    const item = children[i];
                    if (error && error(item, i, children)) {
                        invalid = true;
                        break;
                    }
                    if (predicate(item, i, children)) {
                        if (count!-- === 0) {
                            if (also) {
                                also.call(item, item);
                            }
                            return item;
                        }
                    }
                    if (cascade && item instanceof Container && !item.isEmpty()) {
                        const result = recurse(item, level + 1);
                        if (result) {
                            return result;
                        }
                        else if (invalid) {
                            break;
                        }
                    }
                }
            };
            return recurse(this, 0);
        }
        return this.children.find(predicate);
    }

    public cascade(predicate?: IteratorPredicate<T, void | boolean>, options?: ContainerCascadeOptions<T>) {
        let also: Undef<BindGeneric<T, void>>,
            error: Undef<IteratorPredicate<T, boolean>>;
        if (options) {
            ({ also, error } = options);
        }
        let invalid: Undef<boolean>;
        const recurse = (container: Container<T>) => {
            let result: T[] = [];
            const children = container.children;
            for (let i = 0, length = children.length; i < length; ++i) {
                const item = children[i];
                if (error && error(item, i, children)) {
                    invalid = true;
                    break;
                }
                if (!predicate || predicate(item, i, children) === true) {
                    if (also) {
                        also.call(item, item);
                    }
                    result.push(item);
                }
                if (item instanceof Container && !item.isEmpty()) {
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

    public map<U = unknown>(predicate: IteratorPredicate<T, U>): U[] {
        return plainMap(this.children, predicate);
    }

    public partition(predicate: IteratorPredicate<T, boolean>): [T[], T[]] {
        return partitionArray(this.children, predicate);
    }

    public sort(predicate: (a: T, b: T) => number) {
        this.children.sort(predicate);
        return this;
    }

    public toArray() {
        return this.children.slice(0);
    }

    public iterator() {
        return new ListIterator(this.children);
    }

    public isEmpty() {
        return this.children.length === 0;
    }

    public size() {
        return this.children.length;
    }
}