interface FileUniversalOptions extends squared.base.FileCopyingOptions, squared.base.FileArchivingOptions, FileRequestAttribute {
    pathname?: string;
    manifest?: ManifestData;
    dependencies?: string[];
    elements?: FinalizedElement[];
}

interface FileRequestAttribute {
    mainParentDir?: string;
    mainActivityFile?: string;
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

interface IsAnchoredOptions {
    documentId?: string;
    orientation?: OrientationAttr;
    chained?: boolean;
    parent?: boolean;
    relative?: boolean;
}