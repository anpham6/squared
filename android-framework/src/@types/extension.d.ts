import { SvgTransformExclusions } from '../../../src/svg/@types/object';

export interface ConstraintGuidelineOptions {
    circlePosition: boolean;
}

export interface ResourceSvgOptions {
    excludeFromTransform: SvgTransformExclusions;
    vectorAnimateOrdering: string;
    vectorAnimateInterpolator: string;
    vectorAnimateAlwaysUseKeyframes: boolean;
}

export interface ResourceBackgroundOptions {
    autoSizeBackgroundImage: true;
}

export interface ResourceStringsOptions {
    numberResourceValue: false;
}