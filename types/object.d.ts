interface KeyValue<T, U> {
    key: T;
    value: U;
}

interface StringValue<T = string> extends KeyValue<string, T> {}

interface NumberValue<T = string> extends KeyValue<number, T> {}

interface RGB {
    r: number;
    g: number;
    b: number;
    a?: number;
}

interface HSL {
    h: number;
    s: number;
    l: number;
    a?: number;
}

interface RGBA extends Required<RGB> {}

interface HSLA extends Required<HSL> {}

interface Point {
    x: number;
    y: number;
}

interface Dimension<T = number> {
    width: T;
    height: T;
}