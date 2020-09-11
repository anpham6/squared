interface LocalSettingsUI {
    supportRTL: boolean;
    lineHeightAdjust: number;
    floatPrecision: number;
}

interface CacheValueUI {
    support?: SupportUI;
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
    guideline?: ObjectMapNested<ObjectMapNested<string>>;
}