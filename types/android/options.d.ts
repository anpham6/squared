interface FileUniversalOptions extends squared.base.FileCopyingOptions, squared.base.FileArchivingOptions {
    pathname?: string;
    updateXmlOnly?: boolean;
}

interface GuidelineOptions<T> {
    target: T;
    parent: T;
    orientation?: OrientationAttr;
    percent?: boolean;
    opposing?: boolean;
}

interface CloneOptions {
    position?: boolean;
    attributes?: boolean;
}

interface IsUnanchoredOptions {
    documentId?: string;
    orientation?: OrientationAttr;
    chained?: boolean;
    parent?: boolean;
    relative?: boolean;
}