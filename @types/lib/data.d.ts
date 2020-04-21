
export interface KeyframesData extends ObjectMap<StringMap> {}

export interface FontFaceData {
    fontFamily: string;
    fontWeight: number;
    fontStyle: string;
    srcFormat: string;
    srcUrl?: string;
    srcLocal?: string;
}

export interface ContainerOptions<T> {
    also?: BindGeneric<T, void>;
    error?: IteratorPredicate<T, boolean>;
}

export interface ContainerFindOptions<T> extends ContainerOptions<T> {
    cascade?: boolean;
}

export interface BackgroundPositionOptions {
    fontSize?: number;
    imageDimension?: Dimension;
    imageSize?: string;
    screenDimension?: Dimension;
}

export interface CalculateOptions {
    min?: number;
    max?: number;
    boundingSize?: number;
    unitType?: number;
    fontSize?: number;
}

export interface CalculateVarAsStringOptions extends CalculateOptions {
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

export interface CalculateVarOptions extends Omit<CalculateVarAsStringOptions, "orderedSize" | "checkUnit" | "separator"> {
    dimension?: DimensionAttr;
}

export interface DelimitStringOptions {
    value: string;
    delimiter?: string;
    remove?: boolean;
    sort?: boolean;
    not?: string[];
}

export type MIMEOrAll = string[] | "*";