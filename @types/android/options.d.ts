interface FileUniversalOptions extends squared.base.FileCopyingOptions, squared.base.FileArchivingOptions {
}

interface GuidelineOptions {
    orientation?: OrientationAttr;
    percent?: boolean;
    opposing?: boolean;
}

interface AndroidCloneOptions {
    position?: boolean;
    attributes?: boolean;
}

interface CreateNodeWrapperUIOptions<T> extends ExcludeOptions {
    children?: T[];
    containerType?: number;
    alignmentType?: number;
    cascade?: boolean;
    resetMargin?: boolean;
    inheritDataset?: boolean;
    inheritContentBox?: boolean;
}