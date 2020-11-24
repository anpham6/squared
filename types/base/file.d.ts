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

interface FileAsset extends TextAsset {
    base64?: string;
    commands?: string[];
    compress?: CompressFormat[];
    cloudStorage?: CloudService[];
}

interface RawAsset extends FileAsset, Partial<ImageAsset> {
    buffer?: ArrayBuffer;
}

interface CloudService extends ObjectMap<unknown> {
    service: string;
    credential: string | StringMap;
    admin?: CloudServiceAdmin;
    upload?: CloudServiceUpload;
    download?: CloudServiceDownload;
}

interface CloudServiceAdmin {
    publicRead?: boolean;
    subFolder?: string;
    emptyFolder?: boolean;
}

interface CloudServiceAction {
    active?: boolean;
    filename?: string;
    overwrite?: boolean;
}

interface CloudServiceUpload extends CloudServiceAction {
    localStorage?: boolean;
    endpoint?: string;
    all?: boolean;
    publicAccess?: boolean;
}

interface CloudServiceDownload extends CloudServiceAction, Partial<LocationUri> {}

interface WatchInterval {
    interval?: number;
    expires?: string;
}

interface CloudObject extends Partial<LocationUri> {
    keyName: string;
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
}

interface ResponseData {
    success: boolean;
    data?: unknown;
    zipname?: string;
    bytes?: number;
    files?: string[];
    error?: ResponseError;
}

interface ResponseError {
    message: string;
    hint?: string;
}