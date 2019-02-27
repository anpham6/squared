import { ResourceStoredMap, UserSettings } from '../../../src/base/@types/application';

export interface UserSettingsAndroid extends UserSettings {
    targetAPI: number;
    resolutionDPI: number;
    supportRTL: boolean;
    ellipsisOnTextOverflow: boolean;
    collapseUnattributedElements: boolean;
    customizationsOverwritePrivilege: boolean;
    convertPixels: string;
    showAttributes: boolean;
}

export interface ResourceStoredMapAndroid extends ResourceStoredMap {
    styles: Map<string, StyleAttribute>;
    themes: Map<string, Map<string, StyleAttribute>>;
    dimens: Map<string, string>;
    drawables: Map<string, string>;
    animators: Map<string, string>;
}

export interface StyleAttribute {
    output?: {
        path: string;
        file: string;
    };
    name: string;
    parent: string;
    items: StringMap | NameValue[];
    ids?: number[];
}

export type CustomizationResult = (result: {}, api?: number, node?: android.base.View) => boolean;