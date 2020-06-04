declare module "svg" {
    type SvgGroup = Svg | SvgG | SvgUseG | SvgUseSymbol | SvgPattern | SvgShapePattern | SvgUseShapePattern;

    class SvgBuild {
        static isContainer(object: SvgElement): object is SvgGroup;
        static isElement(object: SvgElement): object is SvgElement;
        static isShape(object: SvgElement): object is SvgShape;
        static isUse(object: SvgElement): object is SvgUse;
        static isAnimate(object: SvgAnimation): object is SvgAnimate;
        static isAnimateTransform(object: SvgAnimation): object is SvgAnimateTransform;
        static asSvg(object: SvgElement): object is Svg;
        static asG(object: SvgElement): object is SvgG;
        static asImage(object: SvgElement): object is SvgImage;
        static asPattern(object: SvgElement): object is SvgPattern;
        static asShapePattern(object: SvgElement): object is SvgShapePattern;
        static asUseShapePattern(object: SvgElement): object is SvgUseShapePattern;
        static asUseG(object: SvgElement): object is SvgUseG;
        static asUseShape(object: SvgElement): object is SvgUseShape;
        static asUseSymbol(object: SvgElement): object is SvgUseSymbol;
        static asSet(object: SvgAnimation): boolean;
        static asAnimate(object: SvgAnimation): object is SvgAnimate;
        static asAnimateTransform(object: SvgAnimation): object is SvgAnimateTransform;
        static asAnimateMotion(object: SvgAnimation): object is SvgAnimateMotion;
        static setName(element?: SVGElement): string;
        static drawLine(x1: number, y1: number, x2?: number, y2?: number, precision?: number): string;
        static drawRect(width: number, height: number, x?: number, y?: number, precision?: number): string;
        static drawCircle(cx: number, cy: number, r: number, precision?: number): string;
        static drawEllipse(cx: number, cy: number, rx: number, ry?: number, precision?: number): string;
        static drawPolygon(values: Point[] | DOMPoint[], precision?: number): string;
        static drawPolyline(values: Point[] | DOMPoint[], precision?: number): string;
        static drawPath(values: SvgPathCommand[], precision?: number): string;
        static drawRefit(element: SVGGraphicsElement, parent?: SvgContainer, precision?: number): string;
        static transformRefit(value: string, transforms?: SvgTransform[], parent?: SvgView, container?: SvgContainer, precision?: number): string;
        static getOffsetPath(value: string, rotation?: string): SvgOffsetPath[];
        static getPathCommands(value: string): SvgPathCommand[];
        static filterTransforms(transforms: SvgTransform[], exclude?: number[]): SvgTransform[];
        static applyTransforms(transforms: SvgTransform[], values: Point[], aspectRatio?: SvgAspectRatio, origin?: Point): SvgPoint[];
        static convertTransforms(transforms: SVGTransformList): SvgTransform[];
        static getPathPoints(values: SvgPathCommand[]): SvgPoint[];
        static syncPathPoints(values: SvgPathCommand[], points: SvgPoint[], transformed?: boolean): SvgPathCommand[];
        static clonePoints(values: SvgPoint[] | SVGPointList): SvgPoint[];
        static minMaxPoints(values: SvgPoint[]): [number, number, number, number];
        static centerPoints(...values: Point[]): Point[];
        static convertPoints(values: number[]): Point[];
        static parsePoints(value: string): Point[];
        static parseCoordinates(value: string): number[];
        static getBoxRect(value: string): BoxRect;
    }

    interface SvgBaseVal extends SvgElement {
        setBaseValue(attr: string, value?: any): boolean;
        getBaseValue(attr: string, fallback?: any): any;
        refitBaseValue(x: number, y: number, precision?: number, scaleX?: number, scaleY?: number): void;
        verifyBaseValue(attr: string, value?: any): Undef<boolean>;
    }

    interface SvgView extends SvgElement {
        name: string;
        transformed?: SvgTransform[];
        readonly opacity: string;
        readonly visible: boolean;
        readonly transforms: SvgTransform[];
        readonly animations: SvgAnimation[];
        getTransforms(element?: SVGGraphicsElement): SvgTransform[];
        getAnimations(element?: SVGGraphicsElement): SvgAnimation[];
        getTitle(lang?: string): string;
        getDesc(lang?: string): string;
    }

    interface SvgViewRect extends SvgBaseVal, SvgRect {
        setRect(): void;
    }

    interface SvgViewBox extends SvgView, SvgViewRect, SvgBaseVal, SvgSynchronize {
        viewBox: DOMRect;
    }

    interface SvgPaint {
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
        useParent?: SvgUseShape | SvgUseSymbol;
        patternParent?: SvgShapePattern;
        setPaint(d?: string[], precision?: number): void;
        setAttribute(attr: string, computed?: boolean, inherited?: boolean): void;
        getAttribute(attr: string, computed?: boolean, inherited?: boolean): string;
        resetPaint(): void;
        convertLength(value: string, dimension?: string | number): number;
    }

    interface SvgSynchronize {
        getAnimateShape(element: SVGGraphicsElement): SvgAnimate[];
        getAnimateTransform(options?: SvgSynchronizeOptions): SvgAnimateTransform[];
        getAnimateViewRect(animations?: SvgAnimation[]): SvgAnimate[];
        animateSequentially(animations?: SvgAnimation[], transforms?: SvgAnimateTransform[], path?: SvgPath, options?: SvgSynchronizeOptions): void;
    }

    interface SvgTransformable {
        rotateAngle?: number;
        transformed?: SvgTransform[];
        transformResidual?: SvgTransform[][];
        readonly transforms: SvgTransform[];
    }

    class SvgElement {
        parent?: SvgContainer;
        viewport?: Svg;
        readonly element: SVGGraphicsElement;
        build(options?: SvgBuildOptions): void;
        synchronize(options?: SvgSynchronizeOptions): void;
        get instanceType(): number;
        constructor(element: SVGGraphicsElement);
    }

    class SvgContainer extends squared.lib.base.Container<SvgView> implements SvgElement {
        aspectRatio: SvgAspectRatio;
        parent?: SvgContainer;
        viewport?: Svg;
        readonly element: SVGSVGElement | SVGGElement | SVGUseElement;
        add(item: SvgView, viewport?: Svg): this;
        refitX(value: number): number;
        refitY(value: number): number;
        refitSize(value: number): number;
        refitPoints(values: SvgPoint[]): SvgPoint[];
        getPathAll(cascade?: boolean): string[];
        hasViewBox(): boolean;
        clipViewBox(x: number, y: number, width: number, height: number, precision?: number, documentRoot?: boolean): void;
        build(options?: SvgBuildOptions): void;
        synchronize(options?: SvgSynchronizeOptions): void;
        set clipRegion(value);
        get clipRegion(): string;
        get requireRefit(): boolean;
        get instanceType(): number;
        constructor(element: SVGSVGElement | SVGGElement | SVGUseElement);
    }

    class Svg extends SvgContainer implements SvgViewBox {
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
        getAnimateShape(element: SVGGraphicsElement): SvgAnimate[];
        getAnimateTransform(options?: SvgSynchronizeOptions): SvgAnimateTransform[];
        getAnimateViewRect(animations?: SvgAnimation[]): SvgAnimate[];
        animateSequentially(animations?: SvgAnimation[], transforms?: SvgAnimateTransform[], path?: SvgPath, options?: SvgSynchronizeOptions): void;
        getTransforms(element?: SVGGraphicsElement): SvgTransform[];
        getAnimations(element?: SVGGraphicsElement): SvgAnimation[];
        getTitle(lang?: string): string;
        getDesc(lang?: string): string;
        set name(value);
        get name(): string;
        set x(value);
        get x(): number;
        set y(value);
        get y(): number;
        set width(value);
        get width(): number;
        set height(value);
        get height(): number;
        get transforms(): SvgTransform[];
        get animations(): SvgAnimation[];
        get viewBox(): DOMRect;
        get visible(): boolean;
        get opacity(): string;
        constructor(element: SVGSVGElement, documentRoot?: boolean);
    }

    class SvgG extends SvgContainer implements SvgView, SvgPaint {
        color: string;
        fill: string;
        fillPattern: string;
        fillOpacity: string;
        fillRule: string;
        stroke: string;
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
        useParent?: SvgUseShape | SvgUseSymbol;
        patternParent?: SvgShapePattern;
        readonly element: SVGGElement;
        constructor(element: SVGGElement);
        setPaint(d?: string[], precision?: number): void;
        resetPaint(): void;
        setAttribute(attr: string, computed?: boolean, inherited?: boolean): void;
        getAttribute(attr: string, computed?: boolean, inherited?: boolean): string;
        convertLength(value: string, dimension?: string | number): number;
        getTransforms(element?: SVGGraphicsElement): SvgTransform[];
        getAnimations(element?: SVGGraphicsElement): SvgAnimation[];
        getTitle(lang?: string): string;
        getDesc(lang?: string): string;
        set name(value);
        get name(): string;
        set strokeWidth(value);
        get strokeWidth(): string;
        get transforms(): SvgTransform[];
        get animations(): SvgAnimation[];
        get visible(): boolean;
        get opacity(): string;
    }

    class SvgUse extends SvgElement implements SvgViewRect, SvgBaseVal {
        element: SVGUseElement;
        setRect(): void;
        setBaseValue(attr: string, value?: any): boolean;
        getBaseValue(attr: string, fallback?: any): any;
        refitBaseValue(x: number, y: number, precision?: number, scaleX?: number, scaleY?: number): void;
        verifyBaseValue(attr: string, value?: any): Undef<boolean>;
        set x(value);
        get x(): number;
        set y(value);
        get y(): number;
        set width(value);
        get width(): number;
        set height(value);
        get height(): number;
    }

    class SvgUseG extends SvgG implements SvgUse {
        readonly element: SVGUseElement;
        readonly groupElement: SVGGElement;
        setRect(): void;
        setBaseValue(attr: string, value?: any): boolean;
        getBaseValue(attr: string, fallback?: any): any;
        refitBaseValue(x: number, y: number, precision?: number, scaleX?: number, scaleY?: number): void;
        verifyBaseValue(attr: string, value?: any): Undef<boolean>;
        set x(value);
        get x(): number;
        set y(value);
        get y(): number;
        set width(value);
        get width(): number;
        set height(value);
        get height(): number;
        constructor(element: SVGUseElement, groupElement: SVGGElement);
    }

    class SvgShape extends SvgElement implements SvgView, SvgSynchronize {
        transformed?: SvgTransform[];
        readonly element: SVGGeometryElement | SVGUseElement;
        synchronize(options?: SvgSynchronizeOptions): void;
        getAnimateShape(element: SVGGraphicsElement): SvgAnimate[];
        getAnimateTransform(options?: SvgSynchronizeOptions): SvgAnimateTransform[];
        getAnimateViewRect(animations?: SvgAnimation[]): SvgAnimate[];
        animateSequentially(animations?: SvgAnimation[], transforms?: SvgAnimateTransform[], path?: SvgPath, options?: SvgSynchronizeOptions): void;
        setPath(): void;
        getTransforms(element?: SVGGraphicsElement): SvgTransform[];
        getAnimations(element?: SVGGraphicsElement): SvgAnimation[];
        getTitle(lang?: string): string;
        getDesc(lang?: string): string;
        set name(value);
        get name(): string;
        set path(value);
        get path(): Undef<SvgPath>;
        get transforms(): SvgTransform[];
        get animations(): SvgAnimation[];
        get visible(): boolean;
        get opacity(): string;
        constructor(element: SVGGraphicsElement, initialize?: boolean);
    }

    class SvgUseShape extends SvgShape implements SvgViewRect, SvgBaseVal, SvgPaint {
        color: string;
        fill: string;
        fillPattern: string;
        fillOpacity: string;
        fillRule: string;
        stroke: string;
        strokePattern: string;
        strokeOpacity: string;
        strokeLinecap: string;
        strokeLinejoin: string;
        strokeMiterlimit: string;
        strokeDasharray: string;
        strokeDashoffset: string;
        clipPath: string;
        clipRule: string;
        useParent?: SvgUseShape | SvgUseSymbol;
        patternParent?: SvgShapePattern;
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
        set x(value);
        get x(): number;
        set y(value);
        get y(): number;
        set width(value);
        get width(): number;
        set height(value);
        get height(): number;
        set strokeWidth(value);
        get strokeWidth(): string;
        constructor(element: SVGUseElement, shapeElement: SVGGraphicsElement, initialize?: boolean);
    }

    class SvgImage extends SvgElement implements SvgView, SvgViewRect, SvgBaseVal, SvgTransformable {
        rotateAngle?: number;
        transformed?: SvgTransform[];
        translationOffset?: Point;
        readonly element: SVGImageElement | SVGUseElement;
        setRect(): void;
        setBaseValue(attr: string, value?: any): boolean;
        getBaseValue(attr: string, fallback?: any): any;
        refitBaseValue(x: number, y: number, precision?: number, scaleX?: number, scaleY?: number): void;
        verifyBaseValue(attr: string, value?: any): Undef<boolean>;
        extract(exclude?: number[]): void;
        getTransforms(element?: SVGGraphicsElement): SvgTransform[];
        getAnimations(element?: SVGGraphicsElement): SvgAnimation[];
        getTitle(lang?: string): string;
        getDesc(lang?: string): string;
        set name(value);
        get name(): string;
        set x(value);
        get x(): number;
        set y(value);
        get y(): number;
        set width(value);
        get width(): number;
        set height(value);
        get height(): number;
        get href(): string;
        get transforms(): SvgTransform[];
        get animations(): SvgAnimation[];
        get visible(): boolean;
        get opacity(): string;
        constructor(element: SVGImageElement | SVGUseElement, imageElement?: SVGImageElement);
    }

    class SvgPath implements SvgBaseVal, SvgPaint, SvgTransformable {
        static transform(value: string, transforms: SvgTransform[], element?: SVGGeometryElement, precision?: number): string;
        static extrapolate(attr: string, value: string, values: string[], transforms?: SvgTransform[], companion?: SvgShape, precision?: number): Undef<string[]>;
        name: string;
        value: string;
        baseValue: string;
        color: string;
        fill: string;
        fillPattern: string;
        fillOpacity: string;
        fillRule: string;
        stroke: string;
        strokePattern: string;
        strokeOpacity: string;
        strokeLinecap: string;
        strokeLinejoin: string;
        strokeMiterlimit: string;
        strokeDasharray: string;
        strokeDashoffset: string;
        clipPath: string;
        clipRule: string;
        useParent?: SvgUseShape | SvgUseSymbol;
        patternParent?: SvgShapePattern;
        transformed?: SvgTransform[];
        transformResidual?: SvgTransform[][];
        readonly element: SVGGeometryElement;
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
        set strokeWidth(value);
        get strokeWidth(): string;
        get transforms(): SvgTransform[];
        get pathLength(): number;
        get totalLength(): number;
        get instanceType(): number;
        constructor(element: SVGGeometryElement);
    }

    class SvgUseSymbol extends SvgContainer implements SvgViewBox, SvgPaint {
        color: string;
        fill: string;
        fillPattern: string;
        fillOpacity: string;
        fillRule: string;
        stroke: string;
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
        useParent?: SvgUseShape | SvgUseSymbol;
        patternParent?: SvgShapePattern;
        readonly element: SVGUseElement;
        readonly symbolElement: SVGSymbolElement;
        setPaint(d?: string[], precision?: number): void;
        setAttribute(attr: string, computed?: boolean, inherited?: boolean): void;
        getAttribute(attr: string, computed?: boolean, inherited?: boolean): string;
        resetPaint(): void;
        convertLength(value: string, dimension?: string|number): number;
        setRect(): void;
        setBaseValue(attr: string, value?: any): boolean;
        getBaseValue(attr: string, fallback?: any): any;
        refitBaseValue(x: number, y: number, precision?: number, scaleX?: number, scaleY?: number): void;
        verifyBaseValue(attr: string, value?: any): Undef<boolean>;
        getAnimateShape(element: SVGGraphicsElement): SvgAnimate[];
        getAnimateTransform(options?: SvgSynchronizeOptions): SvgAnimateTransform[];
        getAnimateViewRect(animations?: SvgAnimation[]): SvgAnimate[];
        animateSequentially(animations?: SvgAnimation[], transforms?: SvgAnimateTransform[], path?: SvgPath, options?: SvgSynchronizeOptions): void;
        getTransforms(element?: SVGGraphicsElement): SvgTransform[];
        getAnimations(element?: SVGGraphicsElement): SvgAnimation[];
        getTitle(lang?: string): string;
        getDesc(lang?: string): string;
        set name(value);
        get name(): string;
        set x(value);
        get x(): number;
        set y(value);
        get y(): number;
        set width(value);
        get width(): number;
        set height(value);
        get height(): number;
        set strokeWidth(value);
        get strokeWidth(): string;
        get viewBox(): DOMRect;
        get transforms(): SvgTransform[];
        get animations(): SvgAnimation[];
        get visible(): boolean;
        get opacity(): string;
        constructor(element: SVGUseElement, symbolElement: SVGSymbolElement);
    }

    class SvgPattern extends SvgContainer implements SvgView {
        transformed?: SvgTransform[];
        readonly element: SVGGraphicsElement;
        readonly patternElement: SVGPatternElement;
        getTransforms(element?: SVGGraphicsElement): SvgTransform[];
        getAnimations(element?: SVGGraphicsElement): SvgAnimation[];
        getTitle(lang?: string): string;
        getDesc(lang?: string): string;
        set name(value);
        get name(): string;
        get transforms(): SvgTransform[];
        get animations(): SvgAnimation[];
        get visible(): boolean;
        get opacity(): string;
        constructor(element: SVGGraphicsElement, patternElement: SVGPatternElement);
    }

    class SvgShapePattern extends SvgPattern implements SvgPaint {
        color: string;
        fill: string;
        fillPattern: string;
        fillOpacity: string;
        fillRule: string;
        stroke: string;
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
        useParent?: SvgUseShape | SvgUseSymbol;
        patternParent?: SvgShapePattern;
        readonly element: SVGGeometryElement | SVGUseElement;
        readonly patternElement: SVGPatternElement;
        readonly patternUnits: number;
        readonly patternContentUnits: number;
        readonly patternWidth: number;
        readonly patternHeight: number;
        setPaint(d?: string[], precision?: number): void;
        setAttribute(attr: string, computed?: boolean, inherited?: boolean): void;
        getAttribute(attr: string, computed?: boolean, inherited?: boolean): string;
        resetPaint(): void;
        convertLength(value: string, dimension?: string | number): number;
        patternRefitX(value: number): number;
        patternRefitY(value: number): number;
        patternRefitPoints(values: SvgPoint[]): SvgPoint[];
        set strokeWidth(value);
        get strokeWidth(): string;
        get offsetX(): number;
        get offsetY(): number;
        get tileWidth(): number;
        get tileHeight(): number;
        constructor(element: SVGGraphicsElement, patternElement: SVGPatternElement);
    }

    class SvgUseShapePattern extends SvgShapePattern implements SvgViewRect {
        readonly element: SVGUseElement;
        readonly shapeElement: SVGGeometryElement;
        setRect(): void;
        setBaseValue(attr: string, value?: any): boolean;
        getBaseValue(attr: string, fallback?: any): any;
        refitBaseValue(x: number, y: number, precision?: number, scaleX?: number, scaleY?: number): void;
        verifyBaseValue(attr: string, value?: any): Undef<boolean>;
        set x(value);
        get x(): number;
        set y(value);
        get y(): number;
        set width(value);
        get width(): number;
        set height(value);
        get height(): number;
        constructor(element: SVGUseElement, shapeElement: SVGGeometryElement, patternElement: SVGPatternElement);
    }

    class SvgAnimation {
        static convertClockTime(value: string): number;
        baseValue: string;
        fillMode: number;
        paused: boolean;
        synchronizeState: number;
        replaceValue?: string;
        id?: number;
        companion?: NumberValue<SvgAnimation>;
        readonly element: Null<SVGGraphicsElement>;
        readonly animationElement: Null<SVGAnimationElement>;
        setAttribute(attr: string, equality?: string): void;
        addState(...values: number[]): void;
        removeState(...values: number[]): void;
        hasState(...values: number[]): boolean;
        set attributeName(value);
        get attributeName(): string;
        set delay(value);
        get delay(): number;
        set duration(value);
        get duration(): number;
        set to(value);
        get to(): string;
        set setterType(value);
        get setterType(): boolean;
        set fillBackwards(value);
        get fillBackwards(): boolean;
        set fillForwards(value);
        get fillForwards(): boolean;
        set fillFreeze(value);
        get fillFreeze(): boolean;
        set parent(value);
        get parent(): Undef<SvgView | SvgPath>;
        set group(value);
        get group(): SvgAnimationGroup;
        get parentContainer(): Undef<SvgContainer>;
        get fillReplace(): boolean;
        get instanceType(): number;
        get dataset(): ObjectMapNested<any>;
        constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimationElement);
    }

    class SvgAnimate extends SvgAnimation {
        static PATTERN_CUBICBEZIER: string;
        static getSplitValue(value: number, next: number, percent: number): number;
        static convertTimingFunction(value: string): string;
        static convertStepTimingFunction(attributeName: string, keyTimes: number[], values: string[], keySpline: string, index: number, fontSize?: number): Undef<[number[], string[]]>;
        static toFractionList(value: string, delimiter?: string, ordered?: boolean): number[];
        type: number;
        from: string;
        additiveSum: boolean;
        accumulateSum: boolean;
        by?: number;
        end?: number;
        synchronized?: NumberValue;
        readonly animationElement: Null<SVGAnimateElement>;
        setCalcMode(attributeName?: string, mode?: string): void;
        convertToValues(keyTimes?: number[]): void;
        setGroupOrdering(value: SvgAnimationAttribute[]): void;
        getIntervalEndTime(leadTime: number, complete?: boolean): number;
        getTotalDuration(minimum?: boolean): number;
        set iterationCount(value);
        get iterationCount(): number;
        set values(value);
        get values(): string[];
        set keyTimes(value);
        get keyTimes(): number[];
        set keySplines(value);
        get keySplines(): Undef<string[]>;
        set timingFunction(value);
        get timingFunction(): string;
        set reverse(value);
        get reverse(): boolean;
        set alternate(value);
        get alternate(): boolean;
        set length(value);
        get length(): number;
        get valueTo(): string;
        get valueFrom(): string;
        get playable(): boolean;
        get fromToType(): boolean;
        get evaluateStart(): boolean;
        get evaluateEnd(): boolean;
        constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimateElement);
    }

    class SvgAnimateTransform extends SvgAnimate {
        static toRotateList(values: string[]): Undef<number[][]>;
        static toScaleList(values: string[]): Undef<number[][]>;
        static toTranslateList(values: string[]): Undef<number[][]>;
        static toSkewList(values: string[]): Undef<number[][]>;
        transformFrom?: string;
        transformOrigin?: Point[];
        readonly animationElement: Null<SVGAnimateTransformElement>;
        setType(value: string): void;
        expandToValues(): void;
        constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimateTransformElement);
    }

    class SvgAnimateMotion extends SvgAnimateTransform {
        motionPathElement: Null<SVGGeometryElement>;
        path: string;
        distance: string;
        rotate: string;
        rotateData?: NumberValue[];
        framesPerSecond?: number;
        readonly animationElement: Null<SVGAnimateMotionElement>;
        addKeyPoint(item: NumberValue): void;
        get offsetPath(): Undef<SvgOffsetPath[]>;
        get rotateValues(): Undef<number[]>;
        get keyPoints(): number[];
        get offsetLength(): number;
    }

    class SvgAnimationIntervalMap {
        static getGroupEndTime(item: SvgAnimationAttribute): number;
        static getKeyName(item: SvgAnimation): string;
        map: SvgAnimationIntervalAttributeMap<SvgAnimation>;
        has(attr: string): boolean;
        get(attr: string, time: number, playing?: boolean): Undef<string>;
        paused(attr: string, time: number): boolean;
        evaluateStart(item: SvgAnimate, otherValue?: any): string[];
        constructor(animations: SvgAnimation[], ...attrs: string[]);
    }

    namespace lib {
        namespace constant {
            const enum INSTANCE_TYPE {
                SVG_USE = 1,
                SVG_CONTAINER = 2,
                SVG_ELEMENT = 4,
                SVG_ANIMATION = 8,
                SVG = 2 | 16,
                SVG_G = 2 | 32,
                SVG_USE_G = 1 | 2 | 32 | 64,
                SVG_USE_SYMBOL = 1 | 2 | 128,
                SVG_PATTERN = 2 | 256,
                SVG_SHAPE_PATTERN = 2 | 512,
                SVG_USE_SHAPE_PATTERN = 1 | 2 | 512 | 1024,
                SVG_SHAPE = 4 | 2048,
                SVG_USE_SHAPE = 1 | 4 | 2048 | 4096,
                SVG_IMAGE = 4 | 8192,
                SVG_PATH = 4 | 16384,
                SVG_ANIMATE = 8 | 32768,
                SVG_ANIMATE_TRANSFORM = 8 | 32768 | 65536,
                SVG_ANIMATE_MOTION = 8 | 32768 | 65536 | 131072
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
}