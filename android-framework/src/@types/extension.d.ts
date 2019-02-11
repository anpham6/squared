import { SvgTransformExclude } from '../../../src/svg/@types/object';

export interface ConstraintGuidelineOptions {
    circlePosition: boolean;
}

export interface ResourceSvgOptions {
    transformExclude: SvgTransformExclude;
    animateInterpolator: string;
}

export interface ResourceBackgroundOptions {
    autoSizeBackgroundImage: true;
}

export interface ResourceStringsOptions {
    numberResourceValue: false;
}