interface ElementScope {
    watch?: boolean | WatchInterval;
    tasks?: TaskAction[];
}

interface Asset extends ElementScope {
    uri?: string;
    mimeType?: string;
}

interface LocationUri {
    pathname: string;
    filename: string;
}

interface TextAsset extends Asset, LocationUri {
    content?: string;
}

interface ImageAsset extends Asset, Dimension {}

interface LayoutAsset extends TextAsset {
    index?: number;
}

interface FileAsset<T = unknown> extends TextAsset, OutputAction<T> {
    base64?: string;
}

interface RawAsset extends FileAsset, Partial<ImageAsset> {
    buffer?: ArrayBuffer;
}

interface OutputAction<T = unknown> {
    moveTo?: string;
    process?: string[];
    commands?: string[];
    compress?: CompressFormat[];
    document?: string | string[];
    cloudStorage?: T[];
}

interface TaskAction {
    handler: string;
    task: string;
    preceding?: boolean;
}

interface BundleAction {
    bundleId?: number;
    bundleIndex?: number;
    bundleRoot?: string;
    trailingContent?: string[];
}

interface ElementAction {
    element?: ElementIndex;
}

interface ElementIndex {
    tagName: string;
    tagIndex: number;
    outerHTML: string;
    outerIndex: number;
    srcSet?: boolean;
}

interface WatchInterval {
    interval?: number;
    expires?: string;
}

interface Exclusions {
    glob?: string[];
    pathname?: string[];
    filename?: string[];
    extension?: string[];
    pattern?: (string | RegExp)[];
}

interface CompressFormat {
    format: string;
    level?: number;
    condition?: string;
    plugin?: string;
    options?: PlainObject;
}

interface RequestData<T = unknown> extends PlainObject {
    assets?: FileAsset[];
    database?: T[];
    document?: string[];
    task?: string[];
}

interface ResponseData {
    success: boolean;
    data?: unknown;
    filename?: string;
    downloadKey?: string;
    downloadUrl?: string;
    bytes?: number;
    files?: string[];
    error?: ResponseError;
}

interface ResponseError {
    message: string;
    hint?: string;
}