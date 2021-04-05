interface UserResourceSettings {
    excludePlainText?: boolean;
    webSocketPort?: number;
    webSocketSecurePort?: number;
}

interface FileUniversalAttribute extends PlainObject, DocumentOutput {
    saveAsWebPage?: boolean;
    useOriginalHtmlPage?: boolean;
    removeInlineStyles?: boolean;
    retainUsedStyles?: (string | RegExp)[];
    removeUnusedClasses?: boolean;
    removeUnusedSelectors?: boolean;
    removeUnusedVariables?: boolean;
    removeUnusedFonts?: boolean;
    removeUnusedKeyframes?: boolean;
    removeUnusedMediaQueries?: boolean;
    removeUnusedSupports?: boolean;
}

interface FileActionAttribute extends PlainObject {
    saveAs?: {
        html?: SaveAsOptions;
        script?: SaveAsOptions;
        link?: SaveAsOptions;
        image?: SaveAsOptions;
        font?: SaveAsOptions;
    };
    preserveCrossOrigin?: boolean;
}

interface TemplateMap extends StandardMap {
    html: ObjectMap<PlainObject>;
    js: ObjectMap<PlainObject>;
    css: ObjectMap<PlainObject>;
}