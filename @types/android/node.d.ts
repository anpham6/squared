import * as node from '../base/node';

export interface LocalSettingsUI extends node.LocalSettingsUI {
    supportRTL: boolean;
    floatPrecision: number;
}

export interface CachedValueUI<T> extends node.CachedValueUI<T> {}

export interface SupportUI extends node.SupportUI {
    maxDimension: boolean;
}

export interface ViewAttribute extends ObjectMap<any> {
    android: StringMap;
    app?: StringMap;
    documentId?: string;
}

export interface WrapperOptions<T> extends node.ExcludeUIOptions {
    children?: T[];
    containerType?: number;
    alignmentType?: number;
    cascade?: boolean;
    resetMargin?: boolean;
    inheritDataset?: boolean;
    inheritContentBox?: boolean;
}

export interface Constraint {
    current: ObjectMap<{ documentId: string; horizontal: boolean }>;
    horizontal: boolean;
    vertical: boolean;
    barrier?: ObjectMap<string>;
    guideline?: ObjectMapNested<ObjectMapNested<number>>;
}