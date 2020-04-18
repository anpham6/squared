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

interface Dimension {
    width: number;
    height: number;
}

interface PromiseObject {
    then(callback: FunctionType<void>): void;
    catch(callback: (error: Error) => void): void;
    finally(callback: FunctionVoid): void;
}