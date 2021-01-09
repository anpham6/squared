interface ElementScope {
    watch?: boolean | WatchInterval;
    tasks?: string[];
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

interface FileAsset extends TextAsset, OutputAction {
    base64?: string;
}

interface RawAsset extends FileAsset, Partial<ImageAsset> {
    buffer?: ArrayBuffer;
}

interface OutputAction {
    moveTo?: string;
    commands?: string[];
    compress?: CompressFormat[];
    document?: string[];
    cloudStorage?: CloudStorage[];
}

interface BundleAction {
    bundleId?: number;
    bundleIndex?: number;
    bundleRoot?: string;
    trailingContent?: string[];
}

interface CloudService extends ObjectMap<unknown> {
    service: string;
    credential: string | PlainObject;
}

interface CloudDatabase<T = string | PlainObject | any[]> extends CloudService {
    table: string;
    value: string | ObjectMap<string | string[]>;
    name?: string;
    id?: string;
    query?: T;
    limit?: number;
    params?: unknown[];
    options?: PlainObject;
    element?: {
        outerHTML?: string;
    };
}

interface CloudStorage extends CloudService {
    bucket?: string;
    admin?: CloudStorageAdmin;
    upload?: CloudStorageUpload;
    download?: CloudStorageDownload;
}

interface CloudStorageAdmin {
    publicRead?: boolean;
    emptyBucket?: boolean;
    preservePath?: boolean;
}

interface CloudStorageAction extends Partial<LocationUri> {
    active?: boolean;
    overwrite?: boolean;
}

interface CloudStorageUpload extends CloudStorageAction {
    localStorage?: boolean;
    endpoint?: string;
    all?: boolean;
    publicRead?: boolean;
}

interface CloudStorageDownload extends CloudStorageAction {
    versionId?: string;
    deleteObject?: string;
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

interface RequestData extends PlainObject {
    assets?: FileAsset[];
    database?: CloudDatabase[];
    document?: string[];
}

interface ResponseData {
    success: boolean;
    data?: unknown;
    zipname?: string;
    downloadKey?: string;
    bytes?: number;
    files?: string[];
    error?: ResponseError;
}

interface ResponseError {
    message: string;
    hint?: string;
}