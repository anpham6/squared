import { ViewAttribute } from './node';

import * as application from '../base/application';
import * as application_ui from '../base/application-ui';
import * as resource from '../base/resource';

type View = android.base.View;

export interface UserSettings extends application_ui.UserSettings {
    targetAPI: number;
    resolutionDPI: number;
    resolutionScreenWidth: number;
    resolutionScreenHeight: number;
    supportRTL: boolean;
    compressImages: boolean;
    convertImages: string;
    customizationsOverwritePrivilege: boolean;
    convertPixels: string;
    manifestLabelAppName: string;
    manifestThemeName: string;
    manifestParentThemeName: string;
    outputMainFileName: string;
}

export interface ControllerSettings extends application_ui.ControllerSettings {
    deviations: {
        textMarginBoundarySize: number;
        subscriptBottomOffset: number;
        superscriptTopOffset: number;
        legendBottomOffset: number;
    };
}

export interface ResourceStoredMap extends resource.ResourceStoredMap {
    styles: Map<string, StyleAttribute>;
    themes: Map<string, Map<string, StyleAttribute>>;
    dimens: Map<string, string>;
    drawables: Map<string, string>;
    animators: Map<string, string>;
}

export interface FileOutputOptions extends application.FileCopyingOptions, application.FileArchivingOptions {}

export interface GuidelineOptions {
    orientation?: string;
    percent?: boolean;
    opposing?: boolean;
}

export interface RenderSpaceAttribute extends ViewAttribute {
    width?: string;
    height?: string;
    column?: number;
    columnSpan?: number;
    row?: number;
    rowSpan?: number;
}

export interface RenderNodeStaticAttribute {
    controlName?: string;
    controlType?: number;
    width?: string;
    height?: string;
    content?: string;
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

export type CustomizationResult = (result: {}, api?: number, node?: View) => boolean;