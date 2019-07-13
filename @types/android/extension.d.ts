import { SvgTransformExclude } from '../svg/object';

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
    drawOutlineAsInsetBorder: boolean;
}

export interface ResourceStringsOptions {
    numberResourceValue: boolean;
    fontVariantSmallCapsReduction: number;
}

export interface ResourceFontsOptions {
    systemDefaultFont: string;
    disableFontAlias: boolean;
}