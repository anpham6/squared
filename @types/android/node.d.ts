import * as node from '../base/node-ui';

export interface LocalSettings extends node.LocalSettings {
    supportRTL: boolean;
    floatPrecision: number;
}

export interface CachedValue<T> extends node.CachedValue<T> {}

export interface Support extends node.Support {
    maxDimension: boolean;
}

export interface CreateNodeWrapperOptions<T> extends node.ExcludeOptions {
    children?: T[];
    containerType?: number;
    alignmentType?: number;
    cascade?: boolean;
    resetMargin?: boolean;
    inheritDataset?: boolean;
    inheritContentBox?: boolean;
}

export interface ViewAttribute extends ObjectMap<any> {
    android: StringMap;
    app?: StringMap;
    documentId?: string;
}

export interface Constraint {
    horizontal: boolean;
    vertical: boolean;
    current: ObjectMap<{ documentId: string; horizontal: boolean }>;
    barrier?: ObjectMap<string>;
    guideline?: ObjectMapNested<ObjectMapNested<number>>;
}