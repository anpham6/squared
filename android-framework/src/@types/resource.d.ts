import { FileAsset } from '../../../src/base/@types/application';

export interface GradientColorStop {
    color: string;
    offset: string;
}

export interface GradientTemplate {
    type: string;
    item: GradientColorStop[] | false;
    startColor?: string;
    endColor?: string;
    centerColor?: string;
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

export interface FileOutputOptions {
    assets?: FileAsset[];
    copyTo?: string;
    archiveTo?: string;
    callback?: CallbackResult;
}