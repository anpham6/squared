interface UserResourceSettingsUI {
    targetAPI: number;
    resolutionDPI: number;
    supportRTL: boolean;
    enabledMultiline: boolean;
    enabledViewModel: boolean;
    enabledIncludes: boolean;
    compressImages: boolean;
    convertImages: string;
    baseLayoutAsFragment: boolean;
    customizationsBaseAPI: number | number[];
    customizationsOverwritePrivilege: boolean;
    convertPixels: string;
    fontMeasureAdjust: number;
    lineHeightAdjust: number;
    createDownloadableFonts: boolean;
    manifestLabelAppName: string;
    manifestThemeName: string;
    manifestParentThemeName: string;
    createBuildDependencies: boolean;
    outputMainFileName: string;
}

interface ControllerSettingsDirectoryUI {
    animation: string;
    theme: string;
}

interface ControllerSettingsStyleUI {
    progressOrientation: string;
}

interface ControllerSettingsDeviationsUI {
    legendBottomOffset: number;
}

interface ResourceStoredMap {
    styles?: Map<string, StyleAttribute>;
    themes?: Map<string, Map<string, ThemeAttribute>>;
    dimens?: Map<string, string>;
    drawables?: Map<string, string>;
    animators?: Map<string, string>;
}

interface RenderSpaceAttribute extends ViewAttribute, Partial<Dimension<string>> {
    column?: number;
    columnSpan?: number;
    row?: number;
    rowSpan?: number;
}

interface RenderNodeStaticAttribute extends Partial<Dimension<string>> {
    controlName?: string;
    containerType?: number;
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