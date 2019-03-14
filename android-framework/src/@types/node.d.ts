export interface LocalSettings {
    targetAPI: number;
    supportRTL: boolean;
    floatPrecision: number;
}

export interface Constraint {
    current: ObjectMap<{ documentId: string; horizontal: boolean; }>;
    horizontal: boolean;
    vertical: boolean;
    minWidth?: boolean;
    minHeight?: boolean;
    guideline?: ObjectMapNested<ObjectMapNested<number>>;
    guidelineHorizontal?: string;
    guidelineVertical?: string;
}

export interface ViewAttribute {
    android: StringMap;
    app: StringMap;
}