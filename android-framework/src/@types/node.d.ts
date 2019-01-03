import { EnvironmentSettings } from '../../../src/base/@types/application';

export interface LocalSettings extends EnvironmentSettings {
    targetAPI: number;
    supportRTL: boolean;
    constraintPercentAccuracy?: number;
    customizationsOverwritePrivilege?: boolean;
}

export interface Constraint {
    current: ObjectMap<{ documentId: string; horizontal: boolean; }>;
    horizontal: boolean;
    vertical: boolean;
    minWidth?: boolean;
    minHeight?: boolean;
    guideline?: ObjectMapNested<ObjectMapNested<number>>;
    guidelineHorizontal?: string;
    guidelineVertical?: string;
}

export interface ViewAttribute {
    android: StringMap;
    app: StringMap;
}

export interface BackgroundGradient {
    type: string;
    startColor: string;
    endColor: string;
    centerColor: string;
    colorStops: ColorStop[];
    angle?: string;
    startX?: string;
    startY?: string;
    endX?: string;
    endY?: string;
    centerX?: string;
    centerY?: string;
    gradientRadius?: string;
    tileMode?: string;
}