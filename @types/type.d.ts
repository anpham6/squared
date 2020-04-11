type Undef<T> = T | undefined;
type Null<T> = T | null;
type UndefNull<T> = Undef<T> | Null<T>;
type Nullable<T> = { [P in keyof T]: T[P] | null; };

type Constructor<T> = new(...args: any[]) => T;

type IteratorPredicate<T, U, V = ArrayLike<T>> = (item: T, index: number, array: V) => U;
type BindGeneric<T, U> = (item: T, ...args: any[]) => U;

type FunctionType<T> = (...args: any[]) => T;
type FunctionMap<T> = ObjectMap<FunctionType<T>>;
type FunctionVoid = () => void;

type ObjectMap<T> = { [key: string]: T };
type ObjectIndex<T> = { [key: number]: T };
type ObjectKeyed<T> = ObjectMap<T> | ObjectIndex<T>;
type ObjectMapNested<T> = ObjectKeyed<ObjectKeyed<T>>;
type StringMap = ObjectMap<string>;
type CallbackResult = (result: {}) => void;

type StandardMap = ObjectMap<any>;

declare class PromiseObject {
    public then(callback: FunctionVoid): void;
    public catch(callback: (error: Error, resume?: FunctionVoid) => void): void;
}