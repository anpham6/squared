interface UserResourceSettings {
    excludePlainText?: boolean;
    webSocketPort?: number;
    webSocketSecurePort?: number;
}

interface FileRequestAttribute extends DocumentOutput {
    saveAsWebPage?: boolean;
    useOriginalHtmlPage?: boolean;
    removeInlineStyles?: boolean;
    retainUsedStyles?: (string | RegExp)[];
    removeUnusedClasses?: boolean;
    removeUnusedPseudoClasses?: boolean;
    removeUnusedVariables?: boolean;
    removeUnusedFontFace?: boolean;
    removeUnusedKeyframes?: boolean;
    removeUnusedMedia?: boolean;
    removeUnusedSupports?: boolean;
}

interface FileActionAttribute {
    saveAs?: {
        html?: SaveAsOptions;
        script?: SaveAsOptions;
        link?: SaveAsOptions;
        image?: SaveAsOptions;
        font?: SaveAsOptions;
    };
    preserveCrossOrigin?: boolean;
}

interface TemplateMap {
    html?: ObjectMap<StringMap>;
    js?: ObjectMap<StringMap>;
    css?: ObjectMap<StringMap>;
    data?: StringMap;
}