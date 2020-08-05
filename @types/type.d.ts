type Undef<T> = T | undefined;
type Null<T> = T | null;
type UndefNull<T> = Undef<T> | Null<T>;
type Nullable<T> = { [P in keyof T]: T[P] | null; };

type Constructor<T> = new(...args: any[]) => T;

type IteratorPredicate<T, U, V = ArrayLike<T>> = (item: T, index: number, array: V) => U;
type BindGeneric<T, U> = (item: T, ...args: any[]) => U;

type FunctionType<T> = (...args: any[]) => T;
type FunctionMap<T> = ObjectMap<FunctionType<T>>;
type FunctionSelf<T, U = void> = (this: T, ...args: any[]) => U;
type FunctionVoid = () => void;

type ObjectKeyed<T> = ObjectMap<T> | ObjectIndex<T>;
type ObjectMapNested<T> = ObjectKeyed<ObjectKeyed<T>>;
type StringMap = ObjectMap<Undef<string>>;
type StringMapChecked = ObjectMap<string>;
type CallbackResult = (result: {}) => void;

type NumString = number | string;

type StandardMap = ObjectMap<any>;

interface ObjectMap<T> {
    [key: string]: T;
}

interface ObjectIndex<T> {
    [key: number]: T;
}