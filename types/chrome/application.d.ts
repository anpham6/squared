interface UserResourceSettings {
    excludePlainText?: boolean;
}

interface FileUniversalAttribute extends PlainObject {
    saveAsWebPage?: boolean;
    productionRelease?: boolean;
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

interface TemplateMap extends StandardMap {
    html: ObjectMap<PlainObject>;
    js: ObjectMap<PlainObject>;
    css: ObjectMap<PlainObject>;
}