interface LocalSettingsUI {
    supportRTL: boolean;
    lineHeightAdjust: number;
    customizationsBaseAPI: number | number[];
    floatPrecision: number;
}

interface CacheValueUI {
    support?: SupportUI;
}

interface CacheStateUI<T> {
    alignedWithX?: T;
    alignedWithY?: T;
}

interface SupportUI {
    maxDimension: boolean;
}

interface ViewAttribute extends StandardMap {
    android: StringMap;
    app?: StringMap;
    documentId?: string;
}

interface Constraint {
    horizontal: boolean;
    vertical: boolean;
    current: ObjectMap<{ documentId: string; horizontal: boolean }>;
    barrier?: StringMap;
    guideline?: ObjectMapNested<Undef<ObjectMapNested<string>>>;
}