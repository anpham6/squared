interface GradientTemplate {
    type: string;
    positioning: boolean;
    item?: { color: string; offset: string }[];
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

interface Customizations<T> {
    [index: number]: CustomizationsData<T>;
}

interface CustomizationsData<T> {
    android: ObjectMap<boolean | CustomizationResult<T>>;
    assign: {
        [namespace: string]: Undef<ObjectMap<StringMap>>;
    };
}

interface Deprecations<T> {
    android: ObjectMap<CustomizationResult<T>>;
}