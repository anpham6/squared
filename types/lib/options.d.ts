interface ContainerRangeOptions {
    start?: number;
    end?: number;
}

interface ContainerCascadeOptions<T> {
    count?: number;
    also?: BindGeneric<T, unknown>;
    error?: IteratorPredicate<T, boolean>;
}

interface ContainerFindOptions<T> extends ContainerCascadeOptions<T>, ContainerRangeOptions {
    cascade?: boolean | IteratorPredicate<T, boolean>;
}

interface ContainerRemoveIfOptions<T> extends ContainerCascadeOptions<T> {
    cascade?: boolean | IteratorPredicate<T, boolean>;
}

interface UnitOptions {
    fontSize?: number;
    screenDimension?: Null<Dimension>;
}

interface BackgroundPositionOptions extends UnitOptions {
    imageDimension?: Null<Dimension>;
    imageSize?: string;
}

interface CalculateOptions extends UnitOptions {
    min?: number;
    max?: number;
    boundingSize?: number;
    unitType?: number;
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
    attributes?: StandardMap;
    style?: CssStyleMap;
    children?: Element[];
}

interface TransformOptions extends UnitOptions {
    boundingBox?: Null<Dimension>;
    accumulate?: boolean;
}

interface DelimitStringOptions {
    value: string;
    delimiter?: string;
    trim?: boolean;
    remove?: boolean;
    sort?: FunctionSort<string> | boolean;
    not?: string[];
}

interface ParseUnitOptions extends UnitOptions {
    fixedWidth?: boolean;
}

interface ConvertUnitOptions extends ParseUnitOptions {
    precision?: number;
}

interface CloneObjectOptions<T> {
    target?: PlainObject | T[];
    deep?: boolean;
}