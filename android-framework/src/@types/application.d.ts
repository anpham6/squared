import { ResourceStoredMap, UserSettings } from '../../../src/base/@types/application';

export interface UserSettingsAndroid extends UserSettings {
    targetAPI: number;
    supportRTL: boolean;
    ellipsisOnTextOverflow: boolean;
    collapseUnattributedElements: boolean;
    customizationsOverwritePrivilege: boolean;
    convertPixels: string;
    showAttributes: boolean;
}

export interface ResourceStoredMapAndroid extends ResourceStoredMap {
    styles: Map<string, ResourceStyleData>;
    themes: Map<string, Map<string, ThemeAttribute>>;
    dimens: Map<string, string>;
    drawables: Map<string, string>;
    animators: Map<string, string>;
}

export interface ResourceStyleData {
    name: string;
    attrs: string;
    ids: number[];
    parent?: string;
}

export interface ThemeAttribute {
    output: {
        path: string;
        file: string;
    };
    appTheme: string;
    parentTheme: string;
    items: StringMap;
}