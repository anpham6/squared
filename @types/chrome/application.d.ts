interface IUserResourceSettings extends UserResourceSettings {
    excludePlainText: boolean;
    outputFileExclusions: string[];
}

interface FileUniversalAttribute {
    saveAsWebPage?: boolean;
    productionRelease?: boolean;
    removeUnusedStyles?: boolean;
}

interface FileActionAttribute {
    name?: string;
    rel?: string;
    saveAs?: { html?: SaveAsOptions; script?: SaveAsOptions; link?: SaveAsOptions; base64?: SaveAsOptions };
    preserveCrossOrigin?: boolean;
}