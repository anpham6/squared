
import * as node from './node';

export interface CachedValue<T> extends node.CachedValue<T> {
    layoutElement?: boolean;
    leftTopAxis?: boolean;
    autoPosition?: boolean;
    positiveAxis?: boolean;
    renderExclude?: boolean;
    containerName?: string;
    baselineHeight?: number;
    support?: Support;
    extensions?: string[];
}

export interface LocalSettings {
    systemName: string;
    screenDimension: Dimension;
}

export interface Support {
    positionRelative: boolean;
    positionTranslation: boolean;
}

export interface LinearData<T> {
    linearX: boolean;
    linearY: boolean;
    floated: Set<string>;
    cleared?: Map<T, string>;
}

export interface ExcludeOptions {
    resource?: number;
    procedure?: number;
    section?: number;
}

export interface ReplaceTryOptions<T> {
    child: T;
    replaceWith: T;
    notFoundAppend?: boolean;
}

export interface RemoveTryOptions<T> {
    replaceWith?: T;
    alignSiblings?: boolean;
    beforeReplace?: BindGeneric<Undef<T>, void>;
}

export interface HideOptions<T> extends RemoveTryOptions<T> {
    hidden?: boolean;
    collapse?: boolean;
    remove?: boolean;
}

export interface TranslateOptions {
    accumulate?: boolean;
    contain?: boolean;
    oppose?: boolean;
    relative?: boolean;
}
