type Undef<T> = T | undefined;
type Null<T> = T | null;
type Void<T> = T | void;
type Optional<T> = Undef<T> | Null<T>;
type Nullable<T> = { [P in keyof T]: T[P] | null; };
type KeyOfType<T, U = any, V = any> = { [K in keyof T]: K extends U ? T[K] extends V ? K : never : never }[keyof T];
type MapOfType<T, U = any, V = any> = { [K in KeyOfType<T, U, V>]: K extends U ? T[K] extends V ? T[K] : never : never };

type Constructor<T> = new(...args: any[]) => T;

type IteratorPredicate<T, U, V = ArrayLike<T>> = (item: T, index: number, array: V) => U;
type BindGeneric<T, U> = (item: T, ...args: unknown[]) => U;

type FunctionType<T> = (...args: unknown[]) => T;
type FunctionSelf<T, U = void> = (this: T, ...args: unknown[]) => U;
type FunctionSort<T = unknown> = (a: T, b: T) => number;

type NumString = number | string;
type StringOfArray = string | string[];

type StandardMap = Record<string, any>;
type PlainObject = Record<string | number | symbol, unknown>;
type StringMap = Record<string, Undef<string>>;

type ObjectMap<T> = Record<string, T>;
type ObjectMapNested<T> = ObjectMap<Undef<ObjectMap<T>>>;