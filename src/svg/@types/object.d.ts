export interface SvgRect extends Point, Dimension {
}

export interface SvgAspectRatio extends SvgRect {
    position: Point;
    parent: Point;
    unit: number;
}

export interface SvgGradient extends Gradient {
    element: SVGGradientElement;
}

export interface SvgLinearGradient extends SvgGradient {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x1AsString: string;
    y1AsString: string;
    x2AsString: string;
    y2AsString: string;
}

export interface SvgRadialGradient extends SvgGradient {
    cx: number;
    cy: number;
    r: number;
    fx: number;
    fy: number;
    cxAsString: string;
    cyAsString: string;
    rAsString: string;
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

export interface SvgTransform {
    type: number;
    angle: number;
    matrix: SvgMatrix | DOMMatrix;
    method: {
        x: boolean;
        y: boolean;
    };
    origin?: Point;
    fromCSS?: boolean;
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

export interface SvgAnimationGroup {
    id: number;
    name: string;
    order?: SvgAnimationGroupOrder[];
}

export type SvgAnimationGroupOrder = {
    name: string;
    paused: boolean;
    delay: number;
    duration: number;
    iterationCount: string;
    fillMode: string;
};

export type SvgTransformResidual = (e: SVGGraphicsElement, t: SvgTransform[], rx?: number, ry?: number) => [SvgTransform[][], SvgTransform[]];