type Undef<T> = T | undefined;
type Null<T> = T | null;
type UndefNull<T> = Undef<T> | Null<T>;
type Void<T> = T | void;
type Nullable<T> = { [P in keyof T]: T[P] | null; };

type Constructor<T> = new(...args: any[]) => T;

type IteratorPredicate<T, U, V = ArrayLike<T>> = (item: T, index: number, array: V) => U;
type BindGeneric<T, U> = (item: T, ...args: any[]) => U;

type FunctionType<T> = (...args: any[]) => T;
type FunctionMap<T> = ObjectMap<FunctionType<T>>;
type FunctionSelf<T, U = void> = (this: T, ...args: any[]) => U;
type FunctionVoid = () => void;

type ObjectMapNested<T> = ObjectMap<ObjectMap<T>>;
type StringMap = ObjectMap<Undef<string>>;
type StringMapChecked = ObjectMap<string>;
type CallbackResult = (result: any) => void;

type NumString = number | string;

type StandardMap = ObjectMap<any>;
type PlainObject = Record<string | number | symbol, unknown>;

interface ObjectMap<T> {
    [key: string]: T;
}