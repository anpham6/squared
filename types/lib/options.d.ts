interface ContainerRangeOptions {
    start?: number;
    end?: number;
}

interface ContainerCascadeOptions<T> {
    count?: number;
    also?: BindGeneric<T, void>;
    error?: IteratorPredicate<T, boolean>;
}

interface ContainerFindOptions<T> extends ContainerCascadeOptions<T>, ContainerRangeOptions {
    cascade?: boolean | IteratorPredicate<T, boolean>;
}

interface ContainerRemoveIfOptions<T> extends ContainerCascadeOptions<T> {
    cascade?: boolean | IteratorPredicate<T, boolean>;
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
    children?: Element[];
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
    sort?: FunctionSort<string> | boolean;
    not?: string[];
}

interface ParseUnitOptions {
    fontSize?: number;
    fixedWidth?: boolean;
    screenDimension?: Null<Dimension>;
}

interface ConvertUnitOptions extends ParseUnitOptions {
    precision?: number;
}

interface CloneObjectOptions<T> {
    target?: PlainObject | T[];
    deep?: boolean;
}