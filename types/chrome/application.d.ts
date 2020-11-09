interface UserResourceSettings {
    excludePlainText: boolean;
    outputFileIgnore: string[];
}

interface FileUniversalAttribute extends PlainObject {
    saveAsWebPage?: boolean;
    productionRelease?: boolean;
    unusedStyles?: string[];
    removeUnusedStyles?: boolean;
}

interface FileActionAttribute extends PlainObject {
    saveAs?: {
        html?: SaveAsOptions;
        script?: SaveAsOptions;
        link?: SaveAsOptions;
        image?: SaveAsOptions;
        base64?: SaveAsOptions;
    };
    preserveCrossOrigin?: boolean;
}

interface TranspileMap {
    html: ObjectMap<StringMap>;
    js: ObjectMap<StringMap>;
    css: ObjectMap<StringMap>;
}