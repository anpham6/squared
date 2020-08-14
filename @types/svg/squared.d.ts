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
        static asUseG(object: SvgElement): object is SvgUseG;
        static asUseShape(object: SvgElement): object is SvgUseShape;
        static asUseShapePattern(object: SvgElement): object is SvgUseShapePattern;
        static asUseSymbol(object: SvgElement): object is SvgUseSymbol;
        static asSet(object: SvgAnimation): boolean;
        static asAnimate(object: SvgAnimation): object is SvgAnimate;
        static asAnimateTransform(object: SvgAnimation): object is SvgAnimateTransform;
        static asAnimateMotion(object: SvgAnimation): object is SvgAnimateMotion;
        static drawLine(x1: number, y1: number, x2?: number, y2?: number, precision?: number): string;
        static drawRect(width: number, height: number, x?: number, y?: number, precision?: number): string;
        static drawCircle(cx: number, cy: number, r: number, precision?: number): string;
        static drawEllipse(cx: number, cy: number, rx: number, ry?: number, precision?: number): string;
        static drawPolygon(values: Point[] | DOMPoint[], precision?: number): string;
        static drawPolyline(values: Point[] | DOMPoint[], precision?: number): string;
        static drawPath(values: SvgPathCommand[], precision?: number): string;
        static drawRefit(element: SVGGraphicsElement, parent?: SvgContainer, precision?: number): string;
        static transformRefit(value: string, options?: SvgTransformRefitOptions): string;
        static getOffsetPath(value: string, rotation?: string): SvgOffsetPath[];
        static getPathCommands(value: string): SvgPathCommand[];
        static filterTransforms(transforms: SvgTransform[], exclude?: number[]): SvgTransform[];
        static applyTransforms(transforms: SvgTransform[], values: Point[], aspectRatio?: SvgAspectRatio, origin?: Point): SvgPoint[];
        static convertTransforms(transforms: SVGTransformList): SvgTransform[];
        static getPathPoints(values: SvgPathCommand[]): SvgPoint[];
        static syncPathPoints(values: SvgPathCommand[], points: SvgPoint[], transformed?: boolean): SvgPathCommand[];
        static clonePoints(values: SvgPoint[] | SVGPointList): SvgPoint[];
        static minMaxPoints(values: SvgPoint[]): BoxRect;
        static centerPoints(...values: Point[]): Point[];
        static convertPoints(values: number[]): Point[];
        static parsePoints(value: string): Point[];
        static parseCoordinates(value: string): number[];
        static getBoxRect(value: string): BoxRect;
        static setName(element: SVGElement): string;
        static resetNameCache(): void;
    }

    interface SvgBaseVal extends SvgElement {
        setBaseValue<T = unknown>(attr: string, value?: T): boolean;
        getBaseValue<T = unknown>(attr: string, fallback?: T): Undef<T>;
        refitBaseValue(x: number, y: number, precision?: number, scaleX?: number, scaleY?: number): void;
        verifyBaseValue(attr: string, value?: any): Undef<boolean>;
    }

    interface SvgView extends SvgElement {
        name: string;
        transformed?: Null<SvgTransform[]>;
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
        rectElement?: SvgRectElement;
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
        useParent?: SvgUse;
        patternParent?: SvgShapePattern;
        setPaint(d?: string[], precision?: number): void;
        setAttribute(attr: string): void;
        getAttribute(attr: string): string;
        resetPaint(): void;
        convertLength(value: string, dimension?: NumString): number;
    }

    interface SvgSynchronize {
        getAnimateShape(element: SVGGraphicsElement): SvgAnimate[];
        getAnimateTransform(options?: SvgSynchronizeOptions): SvgAnimateTransform[];
        getAnimateViewRect(animations?: SvgAnimation[]): SvgAnimate[];
        animateSequentially(animations?: SvgAnimation[], transforms?: SvgAnimateTransform[], path?: SvgPath, options?: SvgSynchronizeOptions): void;
    }

    interface SvgTransformable {
        rotateAngle?: number;
        transformed?: Null<SvgTransform[]>;
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
        readonly element: SvgContainerElement;
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
        constructor(element: SvgContainerElement);
    }

    class SvgUse extends SvgElement implements SvgViewRect, SvgBaseVal {
        readonly useElement: SVGUseElement;
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

    class Svg extends SvgContainer implements SvgViewBox {
        precision?: number;
        transformed?: Null<SvgTransform[]>;
        readonly element: SVGSVGElement;
        readonly documentRoot: boolean;
        readonly definitions: SvgDefinitions;
        findFill(value: string | SVGGraphicsElement): Undef<SVGPatternElement>;
        findFillPattern(value: string | SVGGraphicsElement): Undef<SvgGradient>;
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
        set contentMap(value);
        get contentMap(): Undef<StringMap>;
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
        transformed?: Null<SvgTransform[]>;
        useParent?: SvgUse;
        patternParent?: SvgShapePattern;
        readonly element: SVGGElement;
        constructor(element: SVGGElement);
        setPaint(d?: string[], precision?: number): void;
        resetPaint(): void;
        setAttribute(attr: string, computed?: boolean, inherited?: boolean): void;
        getAttribute(attr: string, computed?: boolean, inherited?: boolean): string;
        convertLength(value: string, dimension?: NumString): number;
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

    class SvgUseG extends SvgG implements SvgUse {
        readonly useElement: SVGUseElement;
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
        constructor(element: SVGGElement, useElement: SVGUseElement);
    }

    class SvgShape extends SvgElement implements SvgView, SvgSynchronize {
        transformed?: Null<SvgTransform[]>;
        readonly element: SVGGeometryElement;
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

    class SvgUseShape extends SvgShape implements SvgViewRect, SvgBaseVal, SvgPaint, SvgUse {
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
        useParent?: SvgUse;
        patternParent?: SvgShapePattern;
        readonly useElement: SVGUseElement;
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
        constructor(element: SVGGraphicsElement, useElement: SVGUseElement, initialize?: boolean);
    }

    class SvgImage extends SvgElement implements SvgView, SvgViewRect, SvgBaseVal, SvgTransformable {
        rotateAngle?: number;
        transformed?: Null<SvgTransform[]>;
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
        static extrapolate(attr: string, value: string, values: string[], transforms?: Null<SvgTransform[]>, parent?: SvgShape, precision?: number): Undef<string[]>;
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
        useParent?: SvgUse;
        patternParent?: SvgShapePattern;
        transformed?: Null<SvgTransform[]>;
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

    class SvgUseSymbol extends SvgContainer implements SvgViewBox, SvgPaint, SvgUse {
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
        transformed?: Null<SvgTransform[]>;
        useParent?: SvgUse;
        patternParent?: SvgShapePattern;
        readonly symbolElement: SVGSymbolElement
        readonly useElement: SVGUseElement;
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
        constructor(element: SVGSymbolElement, useElement: SVGUseElement);
    }

    class SvgPattern extends SvgContainer implements SvgView {
        transformed?: Null<SvgTransform[]>;
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
        transformed?: Null<SvgTransform[]>;
        useParent?: SvgUse;
        patternParent?: SvgShapePattern;
        readonly element: SVGGeometryElement;
        readonly patternElement: SVGPatternElement;
        readonly patternUnits: number;
        readonly patternContentUnits: number;
        readonly patternWidth: number;
        readonly patternHeight: number;
        setPaint(d?: string[], precision?: number): void;
        setAttribute(attr: string, computed?: boolean, inherited?: boolean): void;
        getAttribute(attr: string, computed?: boolean, inherited?: boolean): string;
        resetPaint(): void;
        convertLength(value: string, dimension?: NumString): number;
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

    class SvgUseShapePattern extends SvgShapePattern implements SvgViewRect, SvgUse {
        readonly element: SVGGeometryElement;
        readonly useElement: SVGUseElement;
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
        constructor(element: SVGGeometryElement, useElement: SVGUseElement, patternElement: SVGPatternElement);
    }

    class SvgAnimation {
        static convertClockTime(value: string): number;
        fillMode: number;
        paused: boolean;
        synchronizeState: number;
        replaceValue?: string;
        id?: number;
        baseValue?: string;
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
        get dataset(): SvgDataSet;
        constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimationElement);
    }

    class SvgAnimate extends SvgAnimation {
        static PATTERN_CUBICBEZIER: string;
        static getSplitValue(value: number, next: number, percent: number): number;
        static convertTimingFunction(value: string): string;
        static convertStepTimingFunction(element: SVGElement, attributeName: string, keyTimes: number[], values: string[], keySpline: string, index: number): Undef<[number[], string[]]>;
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
        get keySplines(): Null<string[]>;
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
        evaluateStart(item: SvgAnimate, fallback?: string): string[];
        constructor(animations: SvgAnimation[], ...attrs: string[]);
    }

    namespace lib {
        namespace constant {
            const enum INSTANCE_TYPE {
                SVG_USE = 1,
                SVG_CONTAINER = 1 << 1,
                SVG_ELEMENT = 1 << 2,
                SVG_ANIMATION = 1 << 3,
                SVG = SVG_CONTAINER | 1 << 4,
                SVG_G = SVG_CONTAINER | 1 << 5,
                SVG_USE_G = SVG_USE | SVG | 1 << 5 | 1 << 6,
                SVG_USE_SYMBOL = SVG_CONTAINER | SVG_USE | 1 << 7,
                SVG_PATTERN = SVG_CONTAINER | 1 << 8,
                SVG_SHAPE_PATTERN = SVG_CONTAINER | 1 << 9,
                SVG_USE_SHAPE_PATTERN = SVG_USE | SVG_SHAPE_PATTERN | 1 << 10,
                SVG_SHAPE = SVG_ELEMENT | 1 << 11,
                SVG_USE_SHAPE = SVG_USE | SVG_SHAPE | 1 << 12,
                SVG_IMAGE = SVG_ELEMENT | 1 << 13,
                SVG_PATH = SVG_ELEMENT | 1 << 14,
                SVG_ANIMATE = SVG_ANIMATION | 1 << 15,
                SVG_ANIMATE_TRANSFORM = SVG_ANIMATE | 1 << 16,
                SVG_ANIMATE_MOTION = SVG_ANIMATE_TRANSFORM | 1 << 17
            }
            const enum SYNCHRONIZE_MODE {
                FROMTO_ANIMATE = 1,
                KEYTIME_ANIMATE = 1 << 1,
                IGNORE_ANIMATE = 1 << 2,
                FROMTO_TRANSFORM = 1 << 3,
                KEYTIME_TRANSFORM = 1 << 4,
                IGNORE_TRANSFORM = 1 << 5
            }
            const enum SYNCHRONIZE_STATE {
                BACKWARDS = 1,
                INTERRUPTED = 1 << 1,
                RESUME = 1 << 2,
                COMPLETE = 1 << 3,
                EQUAL_TIME = 1 << 4,
                INVALID = 1 << 5
            }
            const enum FILL_MODE {
                FREEZE = 1,
                FORWARDS = 1 << 1,
                BACKWARDS = 1 << 2
            }
            const enum REGION_UNIT {
                USER_SPACE_ON_USE = 1,
                OBJECT_BOUNDING_BOX
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
                typeAsValue(type: NumString): string;
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
            function getTargetElement(element: SVGElement, rootElement?: Null<SVGSVGElement>, contentMap?: StringMap): Null<SVGElement>;
            function getNearestViewBox(element: SVGElement): Undef<DOMRect>;
            function getRootOffset(element: SVGGraphicsElement, rootElement: Element): Point;
            function getPathLength(value: string): string;
        }
    }
}