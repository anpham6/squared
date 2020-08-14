interface FileUniversalOptions extends squared.base.FileCopyingOptions, squared.base.FileArchivingOptions {}

interface GuidelineOptions<T> {
    target: T;
    parent: T;
    orientation?: OrientationAttr;
    percent?: boolean;
    opposing?: boolean;
}

interface AndroidCloneOptions {
    position?: boolean;
    attributes?: boolean;
}

interface AndroidCreateNodeWrapperUIOptions<T> extends CreateNodeWrapperUIOptions<T> {
    resetMargin?: boolean;
    resetContentBox?: boolean;
    inheritDataset?: boolean;
    inheritContentBox?: boolean;
}