interface ExpressAsset extends ChromeAsset, RawAsset {
    filepath?: string;
    excluded?: boolean;
    originalName?: string;
    dataMap?: DataMap;
}

interface DataMap {
    unusedStyles?: string[];
}

interface ExternalModules {
    html?: ObjectMap<StandardMap>;
    css?: ObjectMap<StandardMap>;
    js?: ObjectMap<StandardMap>;
}

interface ResizeMode extends Dimension {
    mode: string;
}