interface ILocalSettingsUI extends LocalSettingsUI {
    supportRTL: boolean;
    lineHeightAdjust: number;
    floatPrecision: number;
}

interface ICacheValueUI extends CacheValueUI {
    support?: ISupportUI;
}

interface ISupportUI extends SupportUI {
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