import { ExcludeOptions, Support } from '../base/node';

export interface LocalSettings {
    supportRTL: boolean;
    floatPrecision: number;
}

export interface Constraint {
    current: ObjectMap<{ documentId: string; horizontal: boolean }>;
    horizontal: boolean;
    vertical: boolean;
    barrier?: ObjectMap<string>;
    guideline?: ObjectMapNested<ObjectMapNested<number>>;
}

export interface ViewAttribute {
    android: StringMap;
    app?: StringMap;
    documentId?: string;
}

export interface SpacerAttribute extends ViewAttribute {
    width?: string;
    height?: string;
    column?: number;
    columnSpan?: number;
    row?: number;
    rowSpan?: number;
}

export interface WrapperOptions extends ExcludeOptions {
    controlName?: string;
    containerType?: number;
}

export interface SupportAndroid extends Support {
    maxDimension: boolean;
}