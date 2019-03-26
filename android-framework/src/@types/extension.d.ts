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
}

export interface ResourceStringsOptions {
    numberResourceValue: boolean;
    replaceCharacterEntities: boolean;
}