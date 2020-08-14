interface AccessibilityOptions {
    displayLabel: boolean;
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

interface ResourceStringsOptions {
    numberAsResource: boolean;
}

interface ResourceFontsOptions {
    defaultFontFamily: string;
    disableFontAlias: boolean;
    floatPrecision: number;
}