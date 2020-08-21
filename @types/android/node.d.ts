interface AndroidLocalSettingsUI extends LocalSettingsUI {
    supportRTL: boolean;
    lineHeightAdjust: number;
    floatPrecision: number;
}

interface AndroidCacheValueUI extends CacheValueUI {
    support?: AndroidSupportUI;
}

interface AndroidSupportUI extends SupportUI {
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
    barrier?: ObjectMap<string>;
    guideline?: ObjectMapNested<ObjectMapNested<number>>;
}