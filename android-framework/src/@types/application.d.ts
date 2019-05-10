import { ControllerSettings, ResourceStoredMap, UserSettings } from '../../../src/base/@types/application';

export interface UserSettingsAndroid extends UserSettings {
    targetAPI: number;
    resolutionDPI: number;
    supportRTL: boolean;
    collapseUnattributedElements: boolean;
    customizationsOverwritePrivilege: boolean;
    convertPixels: string;
    manifestLabelAppName: string;
    manifestThemeName: string;
    manifestParentThemeName: string;
}

export interface ControllerSettingsAndroid extends ControllerSettings {
    deviations: {
        textMarginBoundarySize: number;
        constraintParentBottomOffset: number;
        subscriptBottomOffset: number;
        superscriptTopOffset: number;
        legendBottomOffset: number;
    };
}

export interface ResourceStoredMapAndroid extends ResourceStoredMap {
    styles: Map<string, StyleAttribute>;
    themes: Map<string, Map<string, StyleAttribute>>;
    dimens: Map<string, string>;
    drawables: Map<string, string>;
    animators: Map<string, string>;
}

export interface StyleAttribute {
    name: string;
    parent: string;
    items: StringMap | StringValue[];
    output?: {
        path: string;
        file: string;
    };
    ids?: number[];
}

export type CustomizationResult = (result: {}, api?: number, node?: android.base.View) => boolean;