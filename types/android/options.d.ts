interface FileUniversalOptions extends squared.base.FileCopyingOptions, squared.base.FileArchivingOptions {
    pathname?: string;
    xmlOnly?: boolean;
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