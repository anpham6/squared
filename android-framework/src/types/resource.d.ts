export interface BackgroundGradient {
    type: string;
    startColor: string;
    endColor: string;
    centerColor: string;
    colorStop: ColorStop[];
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