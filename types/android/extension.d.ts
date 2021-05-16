interface ExtensionAccessibilityOptions {
    displayLabel: boolean;
}

interface ExtensionListOptions {
    ordinalFontSizeAdjust: number;
}

interface ResourceSvgOptions {
    transformExclude: SvgTransformExclude;
    floatPrecision: number;
    floatPrecisionKeyTime: number;
    animateInterpolator: string;
}

interface ResourceBackgroundOptions {
    outlineAsInsetBorder: boolean;
}

interface ResourceDimensOptions {
    percentAsResource: boolean;
}

interface ResourceStringsOptions {
    numberAsResource: boolean;
}

interface ResourceFontsOptions {
    defaultFontFamily: string;
    systemFonts: string[];
    disableFontAlias: boolean;
    floatPrecision: number;
}