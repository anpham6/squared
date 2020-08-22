interface ExpressAsset extends ChromeAsset, RawAsset {
    filepath?: string;
    excluded?: boolean;
    originalName?: string;
    dataMap?: DataMap;
}

interface DataMap {
    unusedStyles?: string[];
    transpileMap?: TranspileMap;
}

interface TranspileMap {
    html: ObjectMap<StringMap>;
    js: ObjectMap<StringMap>;
    css: ObjectMap<StringMap>
}

interface ExternalModules {
    html?: ObjectMap<StandardMap>;
    css?: ObjectMap<StandardMap>;
    js?: ObjectMap<StandardMap>;
}

interface ResizeMode extends Dimension {
    mode: string;
}