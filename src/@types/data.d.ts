interface NameValue {
    name: string;
    value: any;
}

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

interface PointR extends Point {
    rx?: number;
    ry?: number;
    angle?: number;
}

type ExternalData = ObjectMap<any>;