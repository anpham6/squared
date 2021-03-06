import Iterator from './iterator';
import ListIterator from './listiterator';

import { sortByArray } from '../util';

export default class Container<T = unknown> implements squared.lib.base.Container<T>, Iterable<T> {
    constructor(public children: T[] = []) {}

    public [Symbol.iterator]() {
        return new Iterator(this.children) as IterableIterator<T>;
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
            return children[index] = value!;
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
        this.children.push(...Array.isArray(list) ? list : list.children as T[]);
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
            list = list.children as T[];
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

    public every(predicate: IteratorPredicate<T, unknown>, options?: ContainerRangeOptions) {
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

    public removeIf(predicate: IteratorPredicate<T, unknown>, options?: ContainerRemoveIfOptions<T>): T[] {
        let count: Undef<number>,
            cascade: Undef<boolean | IteratorPredicate<T, boolean>>,
            also: Undef<FunctionSelf<T, unknown>>,
            error: Undef<IteratorPredicate<T, boolean>>;
        if (options) {
            ({ cascade, also, error } = options);
        }
        count ||= 0;
        let complete: Undef<boolean>;
        return (function recurse(container: Container<T>, result: T[]) {
            const children = container.children;
            for (let i = 0; i < children.length; ++i) {
                const item = children[i];
                if (error && error(item, i, children)) {
                    options!.hadError = true;
                    complete = true;
                    break;
                }
                let next: unknown;
                if (predicate(item, i, children)) {
                    if (also) {
                        next = also.call(container, item);
                    }
                    result.push(item);
                    children.splice(i--, 1);
                    if (--count === 0) {
                        complete = true;
                        break;
                    }
                }
                if (!(next === false) && (cascade === true || cascade && cascade(item, i, children)) && item instanceof Container && !item.isEmpty()) {
                    recurse(item, result);
                    if (complete) {
                        break;
                    }
                }
            }
            return result;
        })(this, []);
    }

    public find(predicate: IteratorPredicate<T, unknown>, options?: ContainerFindOptions<T>) {
        if (options) {
            let { count = 0, also, error, cascade, start, end } = options; // eslint-disable-line prefer-const
            start &&= Math.max(start, 0);
            end &&= Math.min(this.size(), end);
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
                        options.hadError = true;
                        complete = true;
                        break;
                    }
                    let next: unknown;
                    if (predicate(item, i, children)) {
                        if (also) {
                            next = also.call(container, item);
                        }
                        if (count-- === 0) {
                            return item;
                        }
                    }
                    if (!(next === false) && (cascade === true || cascade && cascade(item, i, children)) && item instanceof Container && !item.isEmpty()) {
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

    public cascade(predicate?: IteratorPredicate<T, unknown>, options?: ContainerCascadeOptions<T>) {
        let count: Undef<number>,
            also: Undef<FunctionSelf<T, unknown>>,
            error: Undef<IteratorPredicate<T, boolean>>;
        if (options) {
            ({ count, also, error } = options);
        }
        count ||= 0;
        let complete: Undef<boolean>;
        return (function recurse(container: Container<T>, result: T[]) {
            const children = container.children;
            for (let i = 0, length = children.length, next: unknown; i < length; ++i) {
                const item = children[i];
                if (error && error(item, i, children)) {
                    options!.hadError = true;
                    complete = true;
                    break;
                }
                if (!predicate || (next = predicate(item, i, children)) === true) {
                    if (also) {
                        next = also.call(container, item);
                    }
                    result.push(item);
                    if (--count === 0) {
                        complete = true;
                        break;
                    }
                }
                if (!(next === false) && item instanceof Container && !item.isEmpty()) {
                    recurse(item, result);
                    if (complete) {
                        break;
                    }
                }
            }
            return result;
        })(this, []);
    }

    public sortBy(...attrs: [...string[], boolean]) {
        sortByArray(this.children, ...attrs);
        return this;
    }

    public map<U = unknown>(predicate: IteratorPredicate<T, U>): U[] {
        return this.children.map(predicate);
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