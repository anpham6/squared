interface SvgBuildOptions {
    exclude?: SvgTransformExclude;
    transforms?: SvgTransform[];
    residualHandler?: SvgTransformResidualHandler;
    precision?: number;
    initialize?: boolean;
    targetElement?: SvgUseElement;
    keyframesMap?: KeyframesMap;
    contentMap?: StringMap;
}

interface SvgSynchronizeOptions {
    keyTimeMode?: number;
    framesPerSecond?: number;
    precision?: number;
    element?: SVGGraphicsElement;
}

interface SvgTransformRefitOptions<T, U> {
    transforms?: Null<SvgTransform[]>;
    parent?: Null<T>;
    container?: Null<U>;
    precision?: number;
}