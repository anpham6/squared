import { SvgTransformExclude } from '../../../src/svg/@types/object';

export interface ConstraintGuidelineOptions {
    circlePosition: boolean;
}

export interface ResourceSvgOptions {
    transformExclude: SvgTransformExclude;
    floatPrecisionKeyTime: number;
    floatPrecisionValue: number;
    animateInterpolator: string;
}

export interface ResourceBackgroundOptions {
    autoSizeBackgroundImage: boolean;
    drawOutlineAsInsetBorder: boolean;
}

export interface ResourceStringsOptions {
    numberResourceValue: boolean;
    replaceCharacterEntities: boolean;
    fontVariantSmallCapsReduction: number;
}

export interface ResourceFontsOptions {
    systemDefaultFont: string;
    disableFontAlias: boolean;
}