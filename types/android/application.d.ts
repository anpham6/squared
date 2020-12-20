interface UserResourceSettingsUI {
    targetAPI: number;
    resolutionDPI: number;
    supportRTL: boolean;
    compressImages: boolean;
    convertImages: string;
    customizationsOverwritePrivilege: boolean;
    convertPixels: string;
    fontMeasureWrap: boolean;
    fontMeasureAdjust: number;
    lineHeightAdjust: number;
    manifestLabelAppName: string;
    manifestThemeName: string;
    manifestParentThemeName: string;
    outputMainFileName: string;
}

interface ControllerSettingsDeviationsUI {
    legendBottomOffset: number;
}

interface ResourceStoredMap {
    styles: Map<string, StyleAttribute>;
    themes: Map<string, Map<string, ThemeAttribute>>;
    dimens: Map<string, string>;
    drawables: Map<string, string>;
    animators: Map<string, string>;
}

interface RenderSpaceAttribute extends ViewAttribute, Partial<Dimension<string>> {
    column?: number;
    columnSpan?: number;
    row?: number;
    rowSpan?: number;
}

interface RenderNodeStaticAttribute extends Partial<Dimension<string>> {
    controlName?: string;
    controlType?: number;
    content?: string;
}

interface GroupAttribute {
    name: string;
    parent: string;
 }

interface StyleAttribute extends GroupAttribute {
    items: StringValue[];
}

interface ThemeAttribute extends GroupAttribute {
    items: StringMap;
    output?: Partial<LocationUri>;
}

type CustomizationResult<T> = (this: T, result: StandardMap, api: number, value: string) => boolean;