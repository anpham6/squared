import { SvgTransformExclude } from '../../../src/svg/@types/object';

export interface ConstraintGuidelineOptions {
    circlePosition: boolean;
}

export interface ResourceSvgOptions {
    transformExclude: SvgTransformExclude;
    decimalPrecisionKeyTime: number;
    decimalPrecisionValue: number;
    animateInterpolator: string;
}

export interface ResourceBackgroundOptions {
    autoSizeBackgroundImage: true;
}

export interface ResourceStringsOptions {
    numberResourceValue: false;
}