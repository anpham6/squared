interface ContainerRangeOptions {
    start?: number;
    end?: number;
}

interface ContainerCascadeOptions<T> {
    also?: BindGeneric<T, void>;
    error?: IteratorPredicate<T, boolean>;
}

interface ContainerFindIndexOptions<T> extends ContainerCascadeOptions<T>, ContainerRangeOptions {}

interface ContainerFindOptions<T> extends ContainerFindIndexOptions<T> {
    count?: number;
    cascade?: boolean;
}

interface BackgroundPositionOptions {
    fontSize?: number;
    imageDimension?: Null<Dimension>;
    imageSize?: string;
    screenDimension?: Null<Dimension>;
}

interface CalculateOptions {
    min?: number;
    max?: number;
    boundingSize?: number;
    unitType?: number;
    fontSize?: number;
}

interface CalculateVarAsStringOptions extends CalculateOptions {
    boundingBox?: Null<Dimension>;
    dimension?: DimensionAttr[] | DimensionAttr;
    orderedSize?: number[];
    parent?: boolean;
    roundValue?: boolean;
    precision?: number;
    separator?: string;
    checkUnit?: boolean;
    supportPercent?: boolean;
    errorString?: RegExp;
}

interface CalculateVarOptions extends Omit<CalculateVarAsStringOptions, "orderedSize" | "checkUnit" | "separator"> {
    dimension?: DimensionAttr;
}

interface CreateElementOptions {
    parent?: HTMLElement;
    attrs?: StandardMap;
    style?: StringMap;
}

interface TransformOptions {
    boundingBox?: Null<Dimension>;
    accumulate?: boolean;
    fontSize?: number;
}

interface DelimitStringOptions {
    value: string;
    delimiter?: string;
    remove?: boolean;
    sort?: boolean;
    not?: string[];
}

interface ParseUnitOptions {
    fontSize?: number;
    fixedWidth?: boolean;
    screenDimension?: Null<Dimension>;
}

interface CloneObjectOptions<T> {
    target?: PlainObject | T[];
    deep?: boolean;
}