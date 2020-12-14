import ListIterator from './listiterator';

import { plainMap, sortByArray } from '../util';

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

    public addAt(index: number, ...items: T[]) {
        this.children.splice(index >= 0 ? Math.max(index, this.children.length) : Math.min(0, this.children.length + index), 0, ...items);
        return this;
    }

    public addAll(list: T[] | Container) {
        this.children.push(...Array.isArray(list) ? list : list.children);
        return this;
    }

    public remove(item: T): Undef<T> {
        const index = this.children.indexOf(item);
        if (index !== -1) {
            return this.children.splice(index, 1)[0];
        }
    }

    public removeAt(index: number): Undef<T> {
        if (index >= 0) {
            if (index >= this.children.length) {
                return;
            }
        }
        else {
            index += this.children.length;
            if (index < 0) {
                return;
            }
        }
        return this.children.splice(index, 1)[0];
    }

    public removeAll(list: T[] | Container) {
        if (!Array.isArray(list)) {
            list = list.children;
        }
        const result: T[] = [];
        const children = this.children;
        for (let i = 0, length = list.length; i < length; ++i) {
            const item = list[i];
            for (let j = 0, q = children.length; j < q; ++j) {
                if (children[j] === item) {
                    children.splice(j, 1);
                    result.push(item);
                    break;
                }
            }
        }
        return result;
    }

    public retainAs(list: T[]) {
        this.children = list;
        return this;
    }

    public each(predicate: IteratorPredicate<T, void>, options?: ContainerRangeOptions) {
        const children = this.children;
        let i = 0,
            length = children.length;
        if (options) {
            const { start, end } = options;
            if (start) {
                i = Math.max(start, 0);
            }
            if (end) {
                length = Math.min(end, length);
            }
        }
        while (i < length) {
            predicate(children[i], i++, children);
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
            while (i < length) {
                if (!predicate(children[i], i++, children)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    public removeIf(predicate: IteratorPredicate<T, boolean>, options?: ContainerRemoveIfOptions<T>): T[] {
        let count: Undef<number>,
            cascade: Undef<boolean | IteratorPredicate<T, boolean>>,
            also: Undef<BindGeneric<T, void>>,
            error: Undef<IteratorPredicate<T, boolean>>;
        if (options) {
            ({ count, cascade, also, error } = options);
        }
        if (!count || count < 0) {
            count = Infinity;
        }
        let complete: Undef<boolean>;
        return (function recurse(container: Container<T>, result: T[]) {
            const children = container.children;
            for (let i = 0; i < children.length; ++i) {
                const item = children[i];
                if (error && error(item, i, children)) {
                    complete = true;
                    break;
                }
                if (predicate(item, i, children)) {
                    if (also) {
                        also.call(container, item);
                    }
                    result.push(item);
                    children.splice(i--, 1);
                    if (--count === 0) {
                        complete = true;
                        break;
                    }
                }
                if (cascade && (cascade === true || cascade(item, i, children)) && item instanceof Container && !item.isEmpty()) {
                    recurse(item, result);
                    if (complete) {
                        break;
                    }
                }
            }
            return result;
        })(this, []);
    }

    public find(predicate: IteratorPredicate<T, boolean>, options?: ContainerFindOptions<T>) {
        if (options) {
            const { also, error, cascade } = options;
            let { start, end, count } = options;
            start &&= Math.max(start, 0);
            end &&= Math.min(this.size(), end);
            if (!count || count < 0) {
                count = 0;
            }
            let complete: Undef<boolean>;
            return (function recurse(container: Container<T>, level: number): Undef<T> {
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
                        complete = true;
                        break;
                    }
                    if (predicate(item, i, children)) {
                        if (count-- === 0) {
                            if (also) {
                                also.call(container, item);
                            }
                            return item;
                        }
                    }
                    if (cascade && (cascade === true || cascade(item, i, children)) && item instanceof Container && !item.isEmpty()) {
                        const result = recurse(item, level + 1);
                        if (result) {
                            return result;
                        }
                        else if (complete) {
                            break;
                        }
                    }
                }
            })(this, 0);
        }
        return this.children.find(predicate);
    }

    public cascade(predicate?: IteratorPredicate<T, void | boolean>, options?: ContainerCascadeOptions<T>) {
        let count: Undef<number>,
            also: Undef<BindGeneric<T, void>>,
            error: Undef<IteratorPredicate<T, boolean>>;
        if (options) {
            ({ count, also, error } = options);
        }
        if (!count || count < 0) {
            count = Infinity;
        }
        let complete: Undef<boolean>;
        return (function recurse(container: Container<T>, result: T[]) {
            const children = container.children;
            for (let i = 0, length = children.length; i < length; ++i) {
                const item = children[i];
                if (error && error(item, i, children)) {
                    complete = true;
                    break;
                }
                let ignore: Undef<Void<boolean>>;
                if (!predicate || (ignore = predicate(item, i, children)) === true) {
                    if (also) {
                        also.call(container, item);
                    }
                    result.push(item);
                    if (--count === 0) {
                        complete = true;
                        break;
                    }
                }
                if (ignore !== false && item instanceof Container && !item.isEmpty()) {
                    recurse(item, result);
                    if (complete) {
                        break;
                    }
                }
            }
            return result;
        })(this, []);
    }

    public sortBy(...attrs: (string | boolean)[]) {
        sortByArray(this.children, ...attrs);
        return this;
    }

    public map<U = unknown>(predicate: IteratorPredicate<T, U>): U[] {
        return plainMap(this.children, predicate);
    }

    public contains(item: T) {
        return this.children.includes(item);
    }

    public clear() {
        this.children.length = 0;
        return this;
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

    public toArray() {
        return this.children.slice(0);
    }
}