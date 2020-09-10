interface SvgBuildOptions {
    exclude?: SvgTransformExclude;
    transforms?: SvgTransform[];
    residualHandler?: SvgTransformResidualHandler;
    initialize?: boolean;
    targetElement?: SvgUseElement;
    keyframesMap?: KeyframesMap;
    contentMap?: StringMap;
    precision?: number;
}

interface SvgSynchronizeOptions {
    keyTimeMode?: number;
    framesPerSecond?: number;
    element?: SVGGraphicsElement;
    precision?: number;
}

interface SvgTransformRefitOptions<T, U> {
    transforms?: Null<SvgTransform[]>;
    parent?: Null<T>;
    container?: Null<U>;
    precision?: number;
}