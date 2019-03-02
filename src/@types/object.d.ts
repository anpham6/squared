interface NameValue {
    name: string;
    value: any;
}

type NumberValue<T> = {
    index: number;
    value: T;
};

interface RGBA {
    r: number;
    g: number;
    b: number;
    a: number;
}

interface HSL {
    h: number;
    s: number;
    l: number;
}

interface Color extends NameValue {
    rgba?: RGBA;
    hsl?: HSL;
}

interface ColorData {
    valueRGB: string;
    valueRGBA: string;
    valueARGB: string;
    rgba: RGBA;
    alpha: number;
    opaque: boolean;
    visible: boolean;
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