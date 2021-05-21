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
    [index: number]: Undef<CustomizationsData<T>>;
}

interface CustomizationsData<T> {
    android: ObjectMap<boolean | CustomizationResult<T>>;
    assign?: {
        [namespace: string]: Undef<ObjectMap<StringMap>>;
    };
}

interface Deprecations<T> {
    android: ObjectMap<CustomizationResult<T>>;
}

interface ViewModelAction {
    setViewModel(data?: PlainObject, sessionId?: string): void;
}

interface FontProviderAction {
    addFontProvider(authority: string, package: string, certs: string[], webFonts: PlainObject): Void<Promise<void>>;
}

interface FontProvider {
    authority: string;
    package: string;
    certs: string[];
    fonts: FontProviderFonts;
}

interface FontProviderFonts {
    [name: string]: Undef<FontProviderFontsStyle>;
}

interface FontProviderFontsStyle {
    normal?: string[];
    italic?: string[];
    width?: string;
}

interface WebFont {
    family: string;
    variants: string[];
    subsets: string[];
    version: string;
    lastModified: string;
    files: string[];
    category: string;
    kind: string;
}
