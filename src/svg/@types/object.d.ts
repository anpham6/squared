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

export interface SvgRectBaseValue extends SvgBaseValue, SvgRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface SvgPathBaseValue extends SvgBaseValue {
    d: string;
    cx: number;
    cy: number;
    r: number;
    rx: number;
    ry: number;
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    x: number;
    y: number;
    width: number;
    height: number;
    points: Point[];
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

export interface SvgTransformExclusions {
    path?: number[];
    line?: number[];
    rect?: number[];
    ellipse?: number[];
    circle?: number[];
    polyline?: number[];
    polygon?: number[];
    image?: number[];
}

export type SvgTransformResidual = (e: SVGGraphicsElement, t: SvgTransform[], rx?: number, ry?: number) => [SvgTransform[][], SvgTransform[]];