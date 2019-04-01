declare global {
    namespace squared.lib.base {
        interface Container<T> extends Iterable<T> {
            readonly children: T[];
            readonly length: number;
            [Symbol.iterator](): Iterator<T>;
            item(index?: number, value?: T): T | undefined;
            append(item: T): this;
            remove(item: T): T[];
            retain(list: T[]): this;
            contains(item: T): boolean;
            duplicate(): T[];
            clear(): this;
            each(predicate: IteratorPredicate<T, void>): this;
            find(predicate: IteratorPredicate<T, boolean> | string, value?: any): T | undefined;
            sort(predicate: (a: T, b: T) => number): this;
            concat(list: T[]): this;
            every(predicate: IteratorPredicate<T, boolean>): boolean;
            some(predicate: IteratorPredicate<T, boolean>): boolean;
            filter(predicate: IteratorPredicate<T, void>): T[];
            splice(predicate: IteratorPredicate<T, boolean>, callback?: (item: T) => void): T[];
            partition(predicate: IteratorPredicate<T, boolean>): [T[], T[]];
            map<U>(predicate: IteratorPredicate<T, U>): U[];
            flatMap<U>(predicate: IteratorPredicate<T, U>): U[];
            cascade(): T[];
            cascadeSome(predicate: IteratorPredicate<T, boolean>): boolean;
        }

        class Container<T> implements Container<T> {
            constructor(children?: T[]);
        }
    }
}

export = squared.lib.base.Container;