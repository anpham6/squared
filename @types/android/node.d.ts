import { CachedValueUI, ExcludeOptions, LocalSettingsUI, Support } from '../base/node';

export interface LocalSettingsAndroidUI extends LocalSettingsUI {
    supportRTL: boolean;
    floatPrecision: number;
}

export interface CachedValueAndroidUI<T> extends CachedValueUI<T> {
    leftTopAxis?: boolean;
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
    alignmentType?: number;
    resetMargin?: boolean;
}

export interface SupportAndroid extends Support {
    maxDimension: boolean;
}