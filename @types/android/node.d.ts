interface AndroidLocalSettingsUI extends LocalSettingsUI {
    supportRTL: boolean;
    floatPrecision: number;
}

interface AndroidCachedValueUI<T> extends CachedValueUI<T> {
    renderExclude?: boolean;
    support?: AndroidSupportUI;
}

interface AndroidSupportUI extends SupportUI {
    maxDimension: boolean;
}

interface AndroidCloneOptions {
    position?: boolean;
    attributes?: boolean;
}

interface CreateNodeWrapperOptions<T> extends ExcludeOptions {
    children?: T[];
    containerType?: number;
    alignmentType?: number;
    cascade?: boolean;
    resetMargin?: boolean;
    inheritDataset?: boolean;
    inheritContentBox?: boolean;
}

interface ViewAttribute extends ObjectMap<any> {
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