interface IUserResourceSettingsUI extends UserResourceSettingsUI {
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
    lineHeightAdjust: number;
    manifestLabelAppName: string;
    manifestThemeName: string;
    manifestParentThemeName: string;
    outputMainFileName: string;
}

interface IControllerSettingsUI extends ControllerSettingsUI {
    deviations: IControllerSettingsDeviationsUI;
}

interface IControllerSettingsDeviationsUI extends ControllerSettingsDeviationsUI {
    legendBottomOffset: number;
}

interface IResourceStoredMap extends ResourceStoredMap {
    styles: Map<string, StyleAttribute>;
    themes: Map<string, Map<string, StyleAttribute>>;
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

type CustomizationResult<T> = (this: T, result: PlainObject, api: number, value: string) => boolean;