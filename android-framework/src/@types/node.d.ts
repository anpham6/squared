import { Support } from '../../../src/base/@types/node';

export interface LocalSettings {
    targetAPI: number;
    supportRTL: boolean;
    floatPrecision: number;
}

export interface Constraint {
    current: ObjectMap<{ documentId: string; horizontal: boolean; }>;
    horizontal: boolean;
    vertical: boolean;
    barrier?: ObjectMap<string>;
    guideline?: ObjectMapNested<ObjectMapNested<number>>;
}

export interface ViewAttribute {
    android: StringMap;
    app: StringMap;
    documentId?: string;
}

export interface SupportAndroid extends Support {
    maxWidth: boolean;
    maxHeight: boolean;
}