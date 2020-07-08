interface AndroidUserSettingsUI extends UserSettingsUI {
    targetAPI: number;
    resolutionDPI: number;
    resolutionScreenWidth: number;
    resolutionScreenHeight: number;
    supportRTL: boolean;
    compressImages: boolean;
    convertImages: string;
    customizationsOverwritePrivilege: boolean;
    convertPixels: string;
    fontMeasureWrap: boolean;
    fontMeasureAdjust: number;
    manifestLabelAppName: string;
    manifestThemeName: string;
    manifestParentThemeName: string;
    outputMainFileName: string;
}

interface AndroidControllerSettingsUI extends ControllerSettingsUI {
    deviations: {
        textMarginBoundarySize: number;
        legendBottomOffset: number;
    };
}

interface AndroidResourceStoredMap extends ResourceStoredMap {
    styles: Map<string, StyleAttribute>;
    themes: Map<string, Map<string, StyleAttribute>>;
    dimens: Map<string, string>;
    drawables: Map<string, string>;
    animators: Map<string, string>;
}

interface FileUniversalOptions extends squared.base.FileCopyingOptions, squared.base.FileArchivingOptions {}

interface GuidelineOptions {
    orientation?: string;
    percent?: boolean;
    opposing?: boolean;
}

interface RenderSpaceAttribute extends ViewAttribute {
    width?: string;
    height?: string;
    column?: number;
    columnSpan?: number;
    row?: number;
    rowSpan?: number;
}

interface RenderNodeStaticAttribute {
    controlName?: string;
    controlType?: number;
    width?: string;
    height?: string;
    content?: string;
}

interface StyleAttribute {
    name: string;
    parent: string;
    items: StringMap | StringValue[];
    output?: {
        path: string;
        file: string;
    };
    ids?: number[];
}

type CustomizationResult<T> = (result: {}, api?: number, node?: T) => boolean;