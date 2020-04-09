import { SvgAnimationAttribute, SvgAnimationGroup, SvgAnimationIntervalAttributeMap, SvgAspectRatio, SvgBuildOptions, SvgMatrix, SvgOffsetPath, SvgPathCommand, SvgPathExtendData, SvgPoint, SvgRect, SvgStrokeDash, SvgSynchronizeOptions, SvgTransform } from './object';

type SvgGroup = Svg | SvgG | SvgUseSymbol | SvgPattern | SvgShapePattern | SvgUsePattern;

declare class SvgBuild {
    public static isContainer(object: SvgElement): object is SvgGroup;
    public static isElement(object: SvgElement): object is SvgElement;
    public static isShape(object: SvgElement): object is SvgShape;
    public static isAnimate(object: SvgAnimation): object is SvgAnimate;
    public static isAnimateTransform(object: SvgAnimation): object is SvgAnimateTransform;
    public static asSvg(object: SvgElement): object is Svg;
    public static asG(object: SvgElement): object is SvgG;
    public static asPattern(object: SvgElement): object is SvgPattern;
    public static asShapePattern(object: SvgElement): object is SvgShapePattern;
    public static asUsePattern(object: SvgElement): object is SvgUsePattern;
    public static asImage(object: SvgElement): object is SvgImage;
    public static asUse(object: SvgElement): object is SvgUse;
    public static asUseSymbol(object: SvgElement): object is SvgUseSymbol;
    public static asSet(object: SvgAnimation): boolean;
    public static asAnimate(object: SvgAnimation): object is SvgAnimate;
    public static asAnimateTransform(object: SvgAnimation): object is SvgAnimateTransform;
    public static asAnimateMotion(object: SvgAnimation): object is SvgAnimateMotion;
    public static setName(element?: SVGElement): string;
    public static drawLine(x1: number, y1: number, x2?: number, y2?: number, precision?: number): string;
    public static drawRect(width: number, height: number, x?: number, y?: number, precision?: number): string;
    public static drawCircle(cx: number, cy: number, r: number, precision?: number): string;
    public static drawEllipse(cx: number, cy: number, rx: number, ry?: number, precision?: number): string;
    public static drawPolygon(values: Point[] | DOMPoint[], precision?: number): string;
    public static drawPolyline(values: Point[] | DOMPoint[], precision?: number): string;
    public static drawPath(values: SvgPathCommand[], precision?: number): string;
    public static drawRefit(element: SVGGraphicsElement, parent?: SvgContainer, precision?: number): string;
    public static transformRefit(value: string, transforms?: SvgTransform[], parent?: SvgView, container?: SvgContainer, precision?: number): string;
    public static getOffsetPath(value: string, rotation?: string): SvgOffsetPath[];
    public static getPathCommands(value: string): SvgPathCommand[];
    public static filterTransforms(transforms: SvgTransform[], exclude?: number[]): SvgTransform[];
    public static applyTransforms(transforms: SvgTransform[], values: Point[], aspectRatio?: SvgAspectRatio, origin?: Point): SvgPoint[];
    public static convertTransforms(transforms: SVGTransformList): SvgTransform[];
    public static getPathPoints(values: SvgPathCommand[]): SvgPoint[];
    public static syncPathPoints(values: SvgPathCommand[], points: SvgPoint[], transformed?: boolean): SvgPathCommand[];
    public static clonePoints(values: SvgPoint[] | SVGPointList): SvgPoint[];
    public static minMaxPoints(values: SvgPoint[]): [number, number, number, number];
    public static centerPoints(...values: Point[]): Point[];
    public static convertPoints(values: number[]): Point[];
    public static parsePoints(value: string): Point[];
    public static parseCoordinates(value: string): number[];
    public static getBoxRect(value: string): BoxRect;
}

declare interface SvgBaseVal extends SvgElement {
    setBaseValue(attr: string, value?: any): boolean;
    getBaseValue(attr: string, fallback?: any): any;
    refitBaseValue(x: number, y: number, precision?: number, scaleX?: number, scaleY?: number): void;
    verifyBaseValue(attr: string, value?: any): Undef<boolean>;
}

declare interface SvgView extends SvgElement {
    name: string;
    transformed?: SvgTransform[];
    translationOffset?: Point;
    readonly opacity: string;
    readonly visible: boolean;
    readonly transforms: SvgTransform[];
    readonly animations: SvgAnimation[];
    getTransforms(element?: SVGGraphicsElement): SvgTransform[];
    getAnimations(element?: SVGGraphicsElement): SvgAnimation[];
}

declare interface SvgViewRect extends SvgBaseVal, SvgRect {
    setRect(): void;
}

declare interface SvgViewBox extends SvgView, SvgViewRect, SvgBaseVal, SvgSynchronize {
    viewBox: DOMRect;
}

declare interface SvgPaint {
    color: string;
    fill: string;
    fillPattern: string;
    fillOpacity: string;
    fillRule: string;
    stroke: string;
    strokeWidth: string;
    strokePattern: string;
    strokeOpacity: string;
    strokeLinecap: string;
    strokeLinejoin: string;
    strokeMiterlimit: string;
    strokeDasharray: string;
    strokeDashoffset: string;
    clipPath: string;
    clipRule: string;
    useParent?: SvgUse | SvgUseSymbol;
    patternParent?: SvgShapePattern;
    setPaint(d?: string[], precision?: number): void;
    setAttribute(attr: string, computed?: boolean, inherited?: boolean): void;
    getAttribute(attr: string, computed?: boolean, inherited?: boolean): string;
    resetPaint(): void;
    convertLength(value: string, dimension?: string | number): number;
}

declare interface SvgSynchronize {
    getAnimateShape(element: SVGGraphicsElement): SvgAnimate[];
    getAnimateTransform(options?: SvgSynchronizeOptions): SvgAnimateTransform[];
    getAnimateViewRect(animations?: SvgAnimation[]): SvgAnimate[];
    animateSequentially(animations?: SvgAnimation[], transforms?: SvgAnimateTransform[], path?: SvgPath, options?: SvgSynchronizeOptions): void;
}

declare interface SvgTransformable {
    rotateAngle?: number;
    transformed?: SvgTransform[];
    transformResidual?: SvgTransform[][];
    readonly transforms: SvgTransform[];
}

declare class SvgElement {
    parent?: SvgContainer;
    viewport?: Svg;
    readonly element: SVGGraphicsElement;
    readonly instanceType: number;
    build(options?: SvgBuildOptions): void;
    synchronize(options?: SvgSynchronizeOptions): void;
    constructor(element: SVGGraphicsElement);
}

declare class SvgContainer extends squared.lib.base.Container<SvgView> implements SvgElement {
    clipRegion: string;
    aspectRatio: SvgAspectRatio;
    parent?: SvgContainer;
    viewport?: Svg;
    readonly element: SVGSVGElement | SVGGElement | SVGUseElement;
    readonly requireRefit: boolean;
    readonly instanceType: number;
    append(item: SvgView, viewport?: Svg): this;
    refitX(value: number): number;
    refitY(value: number): number;
    refitSize(value: number): number;
    refitPoints(values: SvgPoint[]): SvgPoint[];
    getPathAll(cascade?: boolean): string[];
    hasViewBox(): boolean;
    clipViewBox(x: number, y: number, width: number, height: number, precision?: number, documentRoot?: boolean): void;
    build(options?: SvgBuildOptions): void;
    synchronize(options?: SvgSynchronizeOptions): void;
    constructor(element: SVGSVGElement | SVGGElement | SVGUseElement);
}

declare class Svg extends SvgContainer implements SvgViewBox {
    name: string;
    opacity: string;
    visible: boolean;
    transforms: SvgTransform[];
    animations: SvgAnimation[];
    x: number;
    y: number;
    width: number;
    height: number;
    viewBox: DOMRect;
    precision?: number;
    transformed?: SvgTransform[];
    readonly element: SVGSVGElement;
    readonly documentRoot: boolean;
    readonly definitions: {
        clipPath: Map<string, SVGClipPathElement>;
        pattern: Map<string, SVGPatternElement>;
        gradient: Map<string, Gradient>;
    };
    setRect(): void;
    setBaseValue(attr: string, value?: any): boolean;
    getBaseValue(attr: string, fallback?: any): any;
    refitBaseValue(x: number, y: number, precision?: number, scaleX?: number, scaleY?: number): void;
    verifyBaseValue(attr: string, value?: any): Undef<boolean>;
    getTransforms(element?: SVGGraphicsElement): SvgTransform[];
    getAnimations(element?: SVGGraphicsElement): SvgAnimation[];
    getAnimateShape(element: SVGGraphicsElement): SvgAnimate[];
    getAnimateTransform(options?: SvgSynchronizeOptions): SvgAnimateTransform[];
    getAnimateViewRect(animations?: SvgAnimation[]): SvgAnimate[];
    animateSequentially(animations?: SvgAnimation[], transforms?: SvgAnimateTransform[], path?: SvgPath, options?: SvgSynchronizeOptions): void;
    constructor(element: SVGSVGElement, documentRoot?: boolean);
}

declare class SvgG extends SvgContainer implements SvgView, SvgPaint {
    name: string;
    opacity: string;
    visible: boolean;
    transforms: SvgTransform[];
    animations: SvgAnimation[];
    color: string;
    fill: string;
    fillPattern: string;
    fillOpacity: string;
    fillRule: string;
    stroke: string;
    strokeWidth: string;
    strokePattern: string;
    strokeOpacity: string;
    strokeLinecap: string;
    strokeLinejoin: string;
    strokeMiterlimit: string;
    strokeDasharray: string;
    strokeDashoffset: string;
    clipPath: string;
    clipRule: string;
    transformed?: SvgTransform[];
    translationOffset?: Point;
    readonly element: SVGGElement;
    constructor(element: SVGGElement);
    setPaint(d?: string[], precision?: number): void;
    resetPaint(): void;
    getTransforms(element?: SVGGraphicsElement): SvgTransform[];
    getAnimations(element?: SVGGraphicsElement): SvgAnimation[];
    setAttribute(attr: string, computed?: boolean, inherited?: boolean): void;
    getAttribute(attr: string, computed?: boolean, inherited?: boolean): string;
    convertLength(value: string, dimension?: string | number): number;
}

declare class SvgShape extends SvgElement implements SvgView, SvgSynchronize {
    name: string;
    opacity: string;
    visible: boolean;
    transforms: SvgTransform[];
    animations: SvgAnimation[];
    path?: SvgPath;
    readonly element: SVGGeometryElement | SVGUseElement;
    synchronize(options?: SvgSynchronizeOptions): void;
    getAnimateShape(element: SVGGraphicsElement): SvgAnimate[];
    getAnimateTransform(options?: SvgSynchronizeOptions): SvgAnimateTransform[];
    getAnimateViewRect(animations?: SvgAnimation[]): SvgAnimate[];
    getTransforms(element?: SVGGraphicsElement): SvgTransform[];
    getAnimations(element?: SVGGraphicsElement): SvgAnimation[];
    animateSequentially(animations?: SvgAnimation[], transforms?: SvgAnimateTransform[], path?: SvgPath, options?: SvgSynchronizeOptions): void;
    setPath(): void;
    constructor(element: SVGGraphicsElement, initialize?: boolean);
}

declare class SvgImage extends SvgElement implements SvgView, SvgViewRect, SvgBaseVal, SvgTransformable {
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
    opacity: string;
    visible: boolean;
    transforms: SvgTransform[];
    animations: SvgAnimation[];
    rotateAngle?: number;
    transformed?: SvgTransform[];
    readonly element: SVGImageElement | SVGUseElement;
    readonly href: string;
    setRect(): void;
    setBaseValue(attr: string, value?: any): boolean;
    getBaseValue(attr: string, fallback?: any): any;
    refitBaseValue(x: number, y: number, precision?: number, scaleX?: number, scaleY?: number): void;
    verifyBaseValue(attr: string, value?: any): Undef<boolean>;
    getTransforms(element?: SVGGraphicsElement): SvgTransform[];
    getAnimations(element?: SVGGraphicsElement): SvgAnimation[];
    extract(exclude?: number[]): void;
    constructor(element: SVGImageElement | SVGUseElement, imageElement?: SVGImageElement);
}

declare class SvgUse extends SvgShape implements SvgViewRect, SvgBaseVal, SvgPaint {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    fill: string;
    fillPattern: string;
    fillOpacity: string;
    fillRule: string;
    stroke: string;
    strokeWidth: string;
    strokePattern: string;
    strokeOpacity: string;
    strokeLinecap: string;
    strokeLinejoin: string;
    strokeMiterlimit: string;
    strokeDasharray: string;
    strokeDashoffset: string;
    clipPath: string;
    clipRule: string;
    transformed?: SvgTransform[];
    readonly element: SVGUseElement;
    readonly shapeElement: SVGGeometryElement;
    setRect(): void;
    setBaseValue(attr: string, value?: any): boolean;
    getBaseValue(attr: string, fallback?: any): any;
    refitBaseValue(x: number, y: number, precision?: number, scaleX?: number, scaleY?: number): void;
    verifyBaseValue(attr: string, value?: any): Undef<boolean>;
    setPaint(d?: string[], precision?: number): void;
    resetPaint(): void;
    setAttribute(attr: string, computed?: boolean, inherited?: boolean): void;
    getAttribute(attr: string, computed?: boolean, inherited?: boolean): string;
    convertLength(value: string, dimension?: string|number): number;
    synchronize(options?: SvgSynchronizeOptions): void;
    constructor(element: SVGUseElement, shapeElement: SVGGraphicsElement, initialize?: boolean);
}

declare class SvgPath implements SvgBaseVal, SvgPaint, SvgTransformable {
    public static transform(value: string, transforms: SvgTransform[], element?: SVGGeometryElement, precision?: number): string;
    public static extrapolate(attr: string, value: string, values: string[], transforms?: SvgTransform[], companion?: SvgShape, precision?: number): Undef<string[]>;
    name: string;
    value: string;
    baseValue: string;
    instanceType: number;
    transforms: SvgTransform[];
    color: string;
    fill: string;
    fillPattern: string;
    fillOpacity: string;
    fillRule: string;
    stroke: string;
    strokeWidth: string;
    strokePattern: string;
    strokeOpacity: string;
    strokeLinecap: string;
    strokeLinejoin: string;
    strokeMiterlimit: string;
    strokeDasharray: string;
    strokeDashoffset: string;
    clipPath: string;
    clipRule: string;
    patternParent?: SvgShapePattern;
    transformed?: SvgTransform[];
    transformResidual?: SvgTransform[][];
    readonly element: SVGGeometryElement;
    readonly pathLength: number;
    readonly totalLength: number;
    setPaint(d?: string[], precision?: number): void;
    setAttribute(attr: string, computed?: boolean, inherited?: boolean): void;
    getAttribute(attr: string, computed?: boolean, inherited?: boolean): string;
    resetPaint(): void;
    convertLength(value: string, dimension?: string|number): number;
    setBaseValue(attr: string, value?: any): boolean;
    getBaseValue(attr: string, fallback?: any): any;
    refitBaseValue(x: number, y: number, precision?: number, scaleX?: number, scaleY?: number): void;
    verifyBaseValue(attr: string, value?: any): Undef<boolean>;
    build(options?: SvgBuildOptions): void;
    synchronize(options?: SvgSynchronizeOptions): void;
    draw(transforms?: SvgTransform[], options?: SvgBuildOptions): string;
    extendLength(data: SvgPathExtendData, precision?: number): Undef<SvgPathExtendData>;
    flattenStrokeDash(valueArray: number[], valueOffset: number, totalLength: number, pathLength?: number): SvgPathExtendData;
    extractStrokeDash(animations?: SvgAnimation[], precision?: number): [Undef<SvgAnimation[]>, Undef<SvgStrokeDash[]>, string, string];
    constructor(element: SVGGeometryElement);
}

declare class SvgUseSymbol extends SvgContainer implements SvgViewBox, SvgPaint {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    viewBox: DOMRect;
    opacity: string;
    visible: boolean;
    transforms: SvgTransform[];
    animations: SvgAnimation[];
    color: string;
    fill: string;
    fillPattern: string;
    fillOpacity: string;
    fillRule: string;
    stroke: string;
    strokeWidth: string;
    strokePattern: string;
    strokeOpacity: string;
    strokeLinecap: string;
    strokeLinejoin: string;
    strokeMiterlimit: string;
    strokeDasharray: string;
    strokeDashoffset: string;
    clipPath: string;
    clipRule: string;
    transformed?: SvgTransform[];
    readonly element: SVGUseElement;
    readonly symbolElement: SVGSymbolElement;
    setPaint(d?: string[], precision?: number): void;
    setAttribute(attr: string, computed?: boolean, inherited?: boolean): void;
    getAttribute(attr: string, computed?: boolean, inherited?: boolean): string;
    resetPaint(): void;
    convertLength(value: string, dimension?: string|number): number;
    getTransforms(element?: SVGGraphicsElement): SvgTransform[];
    getAnimations(element?: SVGGraphicsElement): SvgAnimation[];
    setRect(): void;
    setBaseValue(attr: string, value?: any): boolean;
    getBaseValue(attr: string, fallback?: any): any;
    refitBaseValue(x: number, y: number, precision?: number, scaleX?: number, scaleY?: number): void;
    verifyBaseValue(attr: string, value?: any): Undef<boolean>;
    getAnimateShape(element: SVGGraphicsElement): SvgAnimate[];
    getAnimateTransform(options?: SvgSynchronizeOptions): SvgAnimateTransform[];
    getAnimateViewRect(animations?: SvgAnimation[]): SvgAnimate[];
    animateSequentially(animations?: SvgAnimation[], transforms?: SvgAnimateTransform[], path?: SvgPath, options?: SvgSynchronizeOptions): void;
    constructor(element: SVGUseElement, symbolElement: SVGSymbolElement);
}

declare class SvgPattern extends SvgContainer implements SvgView {
    name: string;
    opacity: string;
    visible: boolean;
    transforms: SvgTransform[];
    animations: SvgAnimation[];
    transformed?: SvgTransform[];
    translationOffset?: Point;
    readonly element: SVGGraphicsElement;
    readonly patternElement: SVGPatternElement;
    getTransforms(element?: SVGGraphicsElement): SvgTransform[];
    getAnimations(element?: SVGGraphicsElement): SvgAnimation[];
    constructor(element: SVGGraphicsElement, patternElement: SVGPatternElement);
}

declare class SvgShapePattern extends SvgPattern implements SvgPaint {
    color: string;
    fill: string;
    fillPattern: string;
    fillOpacity: string;
    fillRule: string;
    stroke: string;
    strokeWidth: string;
    strokePattern: string;
    strokeOpacity: string;
    strokeLinecap: string;
    strokeLinejoin: string;
    strokeMiterlimit: string;
    strokeDasharray: string;
    strokeDashoffset: string;
    clipPath: string;
    clipRule: string;
    drawRegion?: BoxRect;
    transformed?: SvgTransform[];
    readonly element: SVGGeometryElement | SVGUseElement;
    readonly patternElement: SVGPatternElement;
    readonly patternUnits: number;
    readonly patternContentUnits: number;
    readonly patternWidth: number;
    readonly patternHeight: number;
    readonly tileWidth: number;
    readonly tileHeight: number;
    setPaint(d?: string[], precision?: number): void;
    setAttribute(attr: string, computed?: boolean, inherited?: boolean): void;
    getAttribute(attr: string, computed?: boolean, inherited?: boolean): string;
    resetPaint(): void;
    convertLength(value: string, dimension?: string | number): number;
    patternRefitX(value: number): number;
    patternRefitY(value: number): number;
    patternRefitPoints(values: SvgPoint[]): SvgPoint[];
    constructor(element: SVGGraphicsElement, patternElement: SVGPatternElement);
}

declare class SvgUsePattern extends SvgShapePattern implements SvgViewRect {
    x: number;
    y: number;
    width: number;
    height: number;
    transformed?: SvgTransform[];
    readonly element: SVGUseElement;
    readonly shapeElement: SVGGeometryElement;
    setRect(): void;
    setBaseValue(attr: string, value?: any): boolean;
    getBaseValue(attr: string, fallback?: any): any;
    refitBaseValue(x: number, y: number, precision?: number, scaleX?: number, scaleY?: number): void;
    verifyBaseValue(attr: string, value?: any): Undef<boolean>;
    constructor(element: SVGUseElement, shapeElement: SVGGeometryElement, patternElement: SVGPatternElement);
}

declare class SvgAnimation {
    public static convertClockTime(value: string): number;
    attributeName: string;
    delay: number;
    to: string;
    baseValue: string;
    fillMode: number;
    fillBackwards: boolean;
    fillForwards: boolean;
    fillFreeze: boolean;
    duration: number;
    paused: boolean;
    synchronizeState: number;
    group: SvgAnimationGroup;
    setterType: boolean;
    parent?: SvgView | SvgPath;
    replaceValue?: string;
    id?: number;
    companion?: NumberValue<SvgAnimation>;
    readonly element: Null<SVGGraphicsElement>;
    readonly animationElement: Null<SVGAnimationElement>;
    readonly instanceType: number;
    readonly fillReplace: boolean;
    readonly dataset: ObjectMapNested<any>;
    readonly parentContainer?: SvgContainer;
    setAttribute(attr: string, equality?: string): void;
    addState(...values: number[]): void;
    removeState(...values: number[]): void;
    hasState(...values: number[]): boolean;
    constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimationElement);
}

declare class SvgAnimate extends SvgAnimation {
    public static getSplitValue(value: number, next: number, percent: number): number;
    public static convertTimingFunction(value: string): string;
    public static convertStepTimingFunction(attributeName: string, keyTimes: number[], values: string[], keySpline: string, index: number, fontSize?: number): Undef<[number[], string[]]>;
    public static toFractionList(value: string, delimiter?: string, ordered?: boolean): number[];
    type: number;
    from: string;
    values: string[];
    keyTimes: number[];
    iterationCount: number;
    timingFunction: string;
    reverse: boolean;
    alternate: boolean;
    additiveSum: boolean;
    accumulateSum: boolean;
    length: number;
    keySplines?: string[];
    by?: number;
    end?: number;
    synchronized?: NumberValue;
    readonly animationElement: Null<SVGAnimateElement>;
    readonly playable: boolean;
    readonly valueTo: string;
    readonly valueFrom: string;
    readonly fromToType: boolean;
    readonly evaluateStart: boolean;
    readonly evaluateEnd: boolean;
    setCalcMode(attributeName?: string, mode?: string): void;
    convertToValues(keyTimes?: number[]): void;
    setGroupOrdering(value: SvgAnimationAttribute[]): void;
    getIntervalEndTime(leadTime: number, complete?: boolean): number;
    getTotalDuration(minimum?: boolean): number;
    constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimateElement);
}

declare class SvgAnimateTransform extends SvgAnimate {
    public static toRotateList(values: string[]): Undef<number[][]>;
    public static toScaleList(values: string[]): Undef<number[][]>;
    public static toTranslateList(values: string[]): Undef<number[][]>;
    public static toSkewList(values: string[]): Undef<number[][]>;
    transformFrom?: string;
    transformOrigin?: Point[];
    readonly animationElement: Null<SVGAnimateTransformElement>;
    setType(value: string): void;
    expandToValues(): void;
    constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimateTransformElement);
}

declare class SvgAnimateMotion extends SvgAnimateTransform {
    motionPathElement: Null<SVGGeometryElement>;
    path: string;
    distance: string;
    rotate: string;
    rotateData?: NumberValue[];
    framesPerSecond?: number;
    readonly animationElement: Null<SVGAnimateMotionElement>;
    readonly keyPoints: number[];
    readonly offsetLength: number;
    readonly offsetPath?: SvgOffsetPath[];
    readonly rotateValues?: number[];
    addKeyPoint(item: NumberValue): void;
    constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimateMotionElement);
}

declare class SvgAnimationIntervalMap {
    public static getGroupEndTime(item: SvgAnimationAttribute): number;
    public static getKeyName(item: SvgAnimation): string;
    map: SvgAnimationIntervalAttributeMap;
    has(attr: string): boolean;
    get(attr: string, time: number, playing?: boolean): Undef<string>;
    paused(attr: string, time: number): boolean;
    evaluateStart(item: SvgAnimate, otherValue?: any): string[];
    constructor(animations: SvgAnimation[], ...attrs: string[]);
}

declare namespace lib {
    namespace constant {
        const enum INSTANCE_TYPE {
            SVG_CONTAINER = 2,
            SVG_ELEMENT = 4,
            SVG_ANIMATION = 8,
            SVG = 2 | 16,
            SVG_G = 2 | 32,
            SVG_USE_SYMBOL = 2 | 64,
            SVG_PATTERN = 2 | 128,
            SVG_SHAPE_PATTERN = 2 | 256,
            SVG_USE_PATTERN = 2 | 512,
            SVG_PATH = 4 | 1024,
            SVG_SHAPE = 4 | 2048,
            SVG_IMAGE = 4 | 4096,
            SVG_USE = 4 | 2048 | 8192,
            SVG_ANIMATE = 8 | 16384,
            SVG_ANIMATE_TRANSFORM = 8 | 16384 | 32768,
            SVG_ANIMATE_MOTION = 8 | 16384 | 65536 | 49160
        }
        const enum SYNCHRONIZE_MODE {
            FROMTO_ANIMATE = 2,
            KEYTIME_ANIMATE = 4,
            IGNORE_ANIMATE = 8,
            FROMTO_TRANSFORM = 16,
            KEYTIME_TRANSFORM = 32,
            IGNORE_TRANSFORM = 64
        }
        const enum SYNCHRONIZE_STATE {
            BACKWARDS = 2,
            INTERRUPTED = 4,
            RESUME = 8,
            COMPLETE = 16,
            EQUAL_TIME = 32,
            INVALID = 64
        }
        const enum FILL_MODE {
            FREEZE = 2,
            FORWARDS = 4,
            BACKWARDS = 8
        }
        const enum REGION_UNIT {
            USER_SPACE_ON_USE = 1,
            OBJECT_BOUNDING_BOX = 2
        }

        const KEYSPLINE_NAME: {
            'ease': string;
            'ease-in': string;
            'ease-in-out': string;
            'ease-out': string;
            'linear': string;
            'step-start': string;
            'step-end': string;
        };
        const STRING_CUBICBEZIER: string;
    }

    namespace util {
        const MATRIX: {
            applyX(matrix: SvgMatrix | DOMMatrix, x: number, y: number): number;
            applyY(matrix: SvgMatrix | DOMMatrix, x: number, y: number): number;
            clone(matrix: SvgMatrix | DOMMatrix): SvgMatrix;
            rotate(angle: number): SvgMatrix;
            skew(x?: number, y?: number): SvgMatrix;
            scale(x?: number, y?: number): SvgMatrix;
            translate(x?: number, y?: number): SvgMatrix;
        };
        const TRANSFORM: {
            create(type: number, matrix: SvgMatrix | DOMMatrix, angle?: number, x?: boolean, y?: boolean): SvgTransform;
            parse(element: SVGElement, value?: string): Undef<SvgTransform[]>;
            matrix(element: SVGElement, value?: string): Undef<SvgMatrix>;
            origin(element: SVGElement, value?: string): Point;
            rotateOrigin(element: SVGElement, attr?: string): SvgPoint[];
            typeAsName(type: number): string;
            typeAsValue(type: string | number): string;
        };
        const SVG: {
            svg(element: Element): element is SVGSVGElement;
            g(element: Element): element is SVGGElement;
            symbol(element: Element): element is SVGSymbolElement;
            path(element: Element): element is SVGPathElement;
            shape(element: Element): element is SVGGeometryElement;
            image(element: Element): element is SVGImageElement;
            use(element: Element): element is SVGUseElement;
            line(element: Element): element is SVGLineElement;
            rect(element: Element): element is SVGRectElement;
            circle(element: Element): element is SVGCircleElement;
            ellipse(element: Element): element is SVGEllipseElement;
            polygon(element: Element): element is SVGPolygonElement;
            polyline(element: Element): element is SVGPolylineElement;
            clipPath(element: Element): element is SVGClipPathElement;
            pattern(element: Element): element is SVGPatternElement;
            linearGradient(element: Element): element is SVGLinearGradientElement;
            radialGradient(element: Element): element is SVGRadialGradientElement;
        };
        function calculateStyle(element: SVGElement, attr: string, value: string): string;
        function createPath(value: string): SVGPathElement;
        function getAttribute(element: SVGElement, attr: string, computed?: boolean): string;
        function getParentAttribute(element: SVGElement, attr: string, computed?: boolean): string;
        function getDOMRect(element: SVGElement): DOMRect;
        function getTargetElement(element: SVGElement, rootElement?: Null<CSSElement>): Null<SVGElement>;
        function getNearestViewBox(element: SVGElement): Undef<DOMRect>;
        function getPathLength(value: string): string;
    }
}