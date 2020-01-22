import { ControllerUISettings, ResourceStoredMap, UserUISettings } from '../base/application';

export interface UserSettingsAndroid extends UserUISettings {
    targetAPI: number;
    resolutionDPI: number;
    resolutionScreenWidth: number;
    resolutionScreenHeight: number;
    supportRTL: boolean;
    customizationsOverwritePrivilege: boolean;
    convertPixels: string;
    manifestLabelAppName: string;
    manifestThemeName: string;
    manifestParentThemeName: string;
    outputMainFileName: string;
}

export interface ControllerSettingsAndroid extends ControllerUISettings {
    deviations: {
        textMarginBoundarySize: number;
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