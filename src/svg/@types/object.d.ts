export interface SvgRect extends Point, Dimension {
}

export interface SvgLinearGradient extends Gradient {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x1AsString: string;
    y1AsString: string;
    x2AsString: string;
    y2AsString: string;
}

export interface SvgRadialGradient extends Gradient {
    cx: number;
    cy: number;
    r: number;
    cxAsString: string;
    cyAsString: string;
    rAsString: string;
    fx: number;
    fy: number;
    fxAsString: string;
    fyAsString: string;
}

export interface SvgPathCommand {
    command: string;
    relative: boolean;
    coordinates: number[];
    points: Point[];
    radiusX?: number;
    radiusY?: number;
    xAxisRotation?: number;
    largeArcFlag?: number;
    sweepFlag?: number;
}

export interface SvgBaseValue {
    transformed: SvgTransform[] | null;
}

export interface SvgImageBaseValue extends SvgBaseValue {
    x: number | null;
    y: number | null;
    width: number | null;
    height: number | null;
}

export interface SvgPathBaseValue extends SvgImageBaseValue {
    d: string | null;
    cx: number | null;
    cy: number | null;
    r: number | null;
    rx: number | null;
    ry: number | null;
    x1: number | null;
    x2: number | null;
    y1: number | null;
    y2: number | null;
    points: Point[] | null;
}

export interface SvgTransform {
    type: number;
    angle: number;
    matrix: SvgMatrix | DOMMatrix;
    method: {
        x: boolean;
        y: boolean;
    };
    origin?: Point;
    css?: boolean;
}

export interface SvgMatrix {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
}

export interface SvgPoint extends Point {
    rx?: number;
    ry?: number;
    angle?: number;
}