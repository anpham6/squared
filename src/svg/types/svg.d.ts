export interface SvgDefs {
    clipPath: Map<string, squared.svg.SvgGroup>;
    gradient: Map<string, Gradient>;
}

export interface SvgViewBox {
    x: number;
    y: number;
    width: number;
    height: number;
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

export interface SvgPathBaseVal {
    cx: number | null;
    cy: number | null;
    r: number | null;
    rx: number | null;
    ry: number | null;
    x1: number | null;
    x2: number | null;
    y1: number | null;
    y2: number | null;
    x: number | null;
    y: number | null;
    width: number | null;
    height: number | null;
    points: SVGPointList | Point[] | null;
}

export interface SvgTransform {
    type: number;
    matrix: SvgMatrix | DOMMatrix;
    angle: number;
    origin: {
        x: boolean;
        y: boolean;
    };
}

export interface SvgMatrix {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
}