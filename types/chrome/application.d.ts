interface UserResourceSettings {
    excludePlainText?: boolean;
    webSocketPort?: number;
    webSocketSecurePort?: number;
}

interface FileUniversalAttribute extends PlainObject {
    saveAsWebPage?: boolean;
    productionRelease?: boolean | string;
    useOriginalHtmlPage?: boolean;
    retainUsedStyles?: string[];
    removeUnusedClasses?: boolean;
    removeUnusedSelectors?: boolean;
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