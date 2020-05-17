interface CssProperties {
    [key: string]: {
        trait: number,
        value: string | string[];
    };
}

interface KeyframesData extends ObjectMap<StringMap> {}

interface FontFaceData {
    fontFamily: string;
    fontWeight: number;
    fontStyle: string;
    srcFormat: string;
    srcUrl?: string;
    srcLocal?: string;
}

interface TransformData {
    method: string;
    values: number[];
}

interface ContainerRangeOptions {
    start?: number;
    end?: number;
}

interface ContainerCascadeOptions<T> {
    also?: BindGeneric<T, void>;
    error?: IteratorPredicate<T, boolean>;
}

interface ContainerFindOptions<T> extends ContainerCascadeOptions<T>, ContainerRangeOptions {
    cascade?: boolean;
}

interface BackgroundPositionOptions {
    fontSize?: number;
    imageDimension?: Dimension;
    imageSize?: string;
    screenDimension?: Dimension;
}

interface CalculateOptions {
    min?: number;
    max?: number;
    boundingSize?: number;
    unitType?: number;
    fontSize?: number;
}

interface CalculateVarAsStringOptions extends CalculateOptions {
    boundingBox?: Dimension;
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

interface DelimitStringOptions {
    value: string;
    delimiter?: string;
    remove?: boolean;
    sort?: boolean;
    not?: string[];
}

type MIMEOrAll = string[] | "*";