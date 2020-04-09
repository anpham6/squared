import { ControllerUISettings, FileCopyingOptions, FileArchivingOptions, UserUISettings } from '../base/application';
import { ResourceStoredMap } from '../base/resource';

type View = android.base.View;

export interface UserSettingsAndroid extends UserUISettings {
    targetAPI: number;
    resolutionDPI: number;
    resolutionScreenWidth: number;
    resolutionScreenHeight: number;
    supportRTL: boolean;
    compressImages: boolean;
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

export interface GuidelineOptions {
    orientation?: string;
    percent?: boolean;
    opposing?: boolean;
}

export interface RenderNodeStaticAttribute {
    controlName?: string;
    controlType?: number;
    width?: string;
    height?: string;
    content?: string;
}

export interface FileOutputOptions extends FileCopyingOptions, FileArchivingOptions {}

export type CustomizationResult = (result: {}, api?: number, node?: View) => boolean;