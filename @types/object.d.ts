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
}

interface HSL {
    h: number;
    s: number;
    l: number;
}

interface RGBA extends RGB {
    a: number;
}

interface HSLA extends HSL {
    a: number;
}

interface Point {
    x: number;
    y: number;
}

interface Dimension<T = number> {
    width: T;
    height: T;
}