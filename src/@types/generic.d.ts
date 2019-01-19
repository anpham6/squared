type Undefined<T> = T | undefined;
type Null<T> = T | null;
type UndefNull<T> = Undefined<T> | Null<T>;
type Nullable<T> = { [P in keyof T]: T[P] | null; };

type Constructor<T> = new(...args: any[]) => T;

type IteratorPredicate<T, U> = (value: T, index: number) => U;

type BindGeneric<T, U> = (target: T, ...args: any[]) => U;

type FunctionType<T> = (...args: any[]) => T;
type FunctionMap<T> = ObjectMap<FunctionType<T>>;

type ObjectMap<T> = { [key: string]: T; };
type ObjectIndex<T> = { [key: number]: T; };
type ObjectMapNested<T> = ObjectMap<ObjectMap<T>>;
type StringMap = ObjectMap<string>;