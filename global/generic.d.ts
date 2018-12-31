type Undefined<T> = T | undefined;
type Null<T> = T | null;
type UndefNull<T> = Undefined<T> | Null<T>;

type Constructor<T> = new(...args: any[]) => T;

type IteratorPredicate<T, U> = (value: T, index: number) => U;

type SelfWrapped<T, U> = (self: T, ...args: any[]) => U;

type FunctionType<T> = (...args: any[]) => T;
type FunctionVoid = FunctionType<void>;
type FunctionMap<T> = ObjectMap<FunctionType<T>>;

interface ObjectMap<T> {
    [key: string]: T;
}

interface ObjectIndex<T> {
    [key: number]: T;
}

type StringMap = ObjectMap<string>;
type ObjectMapNested<T> = ObjectMap<ObjectMap<T>>;

interface NameValue {
    name: string;
    value: any;
}

interface Point {
    x: number;
    y: number;
}

interface PointR extends Point {
    rx?: number;
    ry?: number;
}

type ExternalData = ObjectMap<any>;