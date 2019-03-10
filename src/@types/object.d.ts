interface NameValue {
    name: string;
    value: any;
}

type NumberValue<T> = {
    index: number;
    value: T;
};

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

interface ColorData extends NameValue {
    name: string;
    value: string;
    valueAsRGBA: string;
    valueAsARGB: string;
    rgba: RGBA;
    hsl: HSL;
    opacity: number;
    semiopaque: boolean;
    transparent: boolean;
}

interface ColorResult extends NameValue {
    rgb: RGB;
    hsl: HSL;
}

interface Point {
    x: number;
    y: number;
}

interface Dimension {
    width: number;
    height: number;
}

type ExternalData = ObjectMap<any>;