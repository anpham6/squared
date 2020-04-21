export interface GradientTemplate {
    type: string;
    item: { color: string; offset: string }[] | false;
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
    positioning: boolean;
}