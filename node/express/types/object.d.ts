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

interface ChromeModules {
    eval_function?: boolean;
    eval_text_template?: boolean;
    html?: ObjectMap<StandardMap>;
    css?: ObjectMap<StandardMap>;
    js?: ObjectMap<StandardMap>;
}

interface ResizeMode extends Dimension {
    mode: string;
}