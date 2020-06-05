interface SvgRect extends Point, Dimension {}

interface SvgAspectRatio extends SvgRect {
    position: Point;
    parent: Point;
    unit: number;
    meetOrSlice: number;
    align: number;
    alignX: boolean;
    alignY: boolean;
}

interface SvgGradient extends Gradient {
    element: SVGGradientElement;
    spreadMethod?: number;
}

interface SvgLinearGradient extends SvgGradient {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x1AsString: string;
    y1AsString: string;
    x2AsString: string;
    y2AsString: string;
}

interface SvgRadialGradient extends SvgGradient {
    cx: number;
    cy: number;
    r: number;
    fx: number;
    fy: number;
    fr: number;
    cxAsString: string;
    cyAsString: string;
    rAsString: string;
    fxAsString: string;
    fyAsString: string;
    frAsString: string;
}

interface SvgPathCommand extends KeyValue<string, SvgPoint[]> {
    start: SvgPoint;
    end: SvgPoint;
    relative: boolean;
    coordinates: number[];
    radiusX?: number;
    radiusY?: number;
    xAxisRotation?: number;
    largeArcFlag?: number;
    sweepFlag?: number;
}

interface SvgTransform {
    type: number;
    angle: number;
    matrix: SvgMatrix | DOMMatrix;
    method: {
        x: boolean;
        y: boolean;
    };
    origin?: Point;
    fromStyle?: boolean;
}

interface SvgMatrix {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
}

interface SvgPoint extends Point {
    rx?: number;
    ry?: number;
    angle?: number;
}

interface SvgTransformExclude {
    path?: number[];
    line?: number[];
    rect?: number[];
    ellipse?: number[];
    circle?: number[];
    polyline?: number[];
    polygon?: number[];
    image?: number[];
}

interface SvgAnimationGroup {
    id: number;
    name: string;
    ordering?: SvgAnimationAttribute[];
}

interface SvgAnimationAttribute {
    name: string;
    attributes: string[];
    paused: boolean;
    delay: number;
    duration: number;
    iterationCount: string;
    fillMode: string;
}

interface SvgStrokeDash {
    start: number;
    end: number;
    length?: number;
    offset?: number;
}

interface SvgOffsetPath extends NumberValue<DOMPoint> {
    rotate: number;
}

interface SvgDefinitions {
    clipPath: Map<string, SVGClipPathElement>;
    pattern: Map<string, SVGPatternElement>;
    gradient: Map<string, SvgGradient>;
    contentMap?: StringMap;
}

interface SvgBuildOptions {
    exclude?: SvgTransformExclude;
    transforms?: SvgTransform[];
    residualHandler?: SvgTransformResidualHandler;
    precision?: number;
    initialize?: boolean;
    targetElement?: SVGSymbolElement | SVGPatternElement | SVGGElement;
    contentMap?: StringMap;
}

interface SvgSynchronizeOptions {
    keyTimeMode?: number;
    framesPerSecond?: number;
    precision?: number;
    element?: SVGGraphicsElement;
}

interface SvgPathExtendData {
    items: SvgStrokeDash[];
    dashArray: number[];
    dashArrayTotal: number;
    extendedLength: number;
    startIndex: number;
    leading: number;
    trailing: number;
    lengthRatio: number;
    path?: string;
    leadingOffset?: number;
}

interface SvgAnimationIntervalAttributeMap<T> {
    [key: string]: Map<number, SvgAnimationIntervalValue<T>[]>;
}

interface SvgAnimationIntervalValue<T> {
    time: number;
    value: string;
    endTime: number;
    start: boolean;
    end: boolean;
    fillMode: number;
    infinite: boolean;
    valueFrom?: string;
    animation?: T;
}

type SvgTransformResidualHandler = (e: SVGGraphicsElement, t: SvgTransform[], rx?: number, ry?: number) => [SvgTransform[][], SvgTransform[]];