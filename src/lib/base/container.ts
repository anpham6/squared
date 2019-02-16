import { flatMap, partitionArray, spliceArray } from '../util';

export default class Container<T> implements squared.lib.base.Container<T>, Iterable<T> {
    private _children: T[];

    constructor(children?: T[]) {
        this._children = children || [];
    }

    public [Symbol.iterator]() {
        const list = this._children;
        let i = 0;
        return {
            next(): IteratorResult<T> {
                if (i < list.length) {
                    return { done: false, value: list[i++] };
                }
                else {
                    return { done: true, value: undefined as any };
                }
            }
        };
    }

    public item(index?: number, value?: T): T | undefined {
        if (index !== undefined && value !== undefined) {
            if (index >= 0 && index < this._children.length) {
                this._children[index] = value;
                return value;
            }
        }
        else {
            if (index === undefined) {
                return this._children[this._children.length - 1];
            }
            return this._children[index];
        }
        return undefined;
    }

    public append(item: T) {
        this._children.push(item);
        return this;
    }

    public remove(item: T) {
        for (let i = 0; i < this._children.length; i++) {
            if (item === this._children[i]) {
                return this._children.splice(i, 1);
            }
        }
        return [];
    }

    public contains(item: T) {
        return this._children.indexOf(item) !== -1;
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
        for (let i = 0; i < this._children.length; i++) {
            predicate(this._children[i], i, this._children);
        }
        return this;
    }

    public find(predicate: IteratorPredicate<T, boolean> | string, value?: any) {
        if (typeof predicate === 'string') {
            return this._children.find(item => item[predicate] === value);
        }
        else {
            return this._children.find(predicate);
        }
    }

    public filter(predicate: IteratorPredicate<T, any>) {
        return this._children.filter(predicate);
    }

    public map<U>(predicate: IteratorPredicate<T, U>): U[] {
        return this._children.map(predicate);
    }

    public sort(predicate: (a: T, b: T) => number) {
        this._children.sort(predicate);
        return this;
    }

    public every(predicate: IteratorPredicate<T, boolean>) {
        return this.length > 0 && this._children.every(predicate);
    }

    public some(predicate: IteratorPredicate<T, boolean>) {
        return this._children.some(predicate);
    }

    public flatMap<U>(predicate: IteratorPredicate<T, U>): U[] {
        return flatMap(this._children, predicate);
    }

    public partition(predicate: IteratorPredicate<T, boolean>): [T[], T[]] {
        return partitionArray(this._children, predicate);
    }

    public splice(predicate: IteratorPredicate<T, boolean>, callback?: (item: T) => void): T[] {
        return spliceArray(this._children, predicate, callback);
    }

    public cascade() {
        function cascade(container: Container<T>) {
            const result: T[] = [];
            for (const item of container.children) {
                result.push(item);
                if (item instanceof Container && item.length) {
                    result.push(...cascade(item));
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