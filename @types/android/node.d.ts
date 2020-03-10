import type { CachedValueUI, ExcludeUIOptions, LocalSettingsUI, SupportUI } from '../base/node';

export interface LocalSettingsAndroidUI extends LocalSettingsUI {
    supportRTL: boolean;
    floatPrecision: number;
}

export interface CachedValueAndroidUI<T> extends CachedValueUI<T> {}

export interface Constraint {
    current: ObjectMap<{ documentId: string; horizontal: boolean }>;
    horizontal: boolean;
    vertical: boolean;
    barrier?: ObjectMap<string>;
    guideline?: ObjectMapNested<ObjectMapNested<number>>;
}

export interface ViewAttribute extends ObjectMap<any> {
    android: StringMap;
    app?: StringMap;
    documentId?: string;
}

export interface RenderSpaceAttribute extends ViewAttribute {
    width?: string;
    height?: string;
    column?: number;
    columnSpan?: number;
    row?: number;
    rowSpan?: number;
}

export interface WrapperOptions<T> extends ExcludeUIOptions {
    children?: T[];
    containerType?: number;
    alignmentType?: number;
    cascade?: boolean;
    resetMargin?: boolean;
    inheritDataset?: boolean;
    inheritContentBox?: boolean;
}

export interface SupportAndroid extends SupportUI {
    maxDimension: boolean;
}