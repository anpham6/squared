interface ElementScope {
    watch?: WatchValue;
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
    index: number;
}

interface FileAsset extends TextAsset, OutputAction {
    format?: string;
    base64?: string;
}

interface RawAsset extends FileAsset, Partial<ImageAsset> {
    buffer?: ArrayBuffer;
}

interface ViewEngine {
    name: string;
    options?: {
        compile?: PlainObject;
        output?: PlainObject;
    };
}

interface DataSource extends ElementAction, DocumentAction, PlainObject {
    source: string;
    query?: unknown;
    index?: number;
    limit?: number;
    removeEmpty?: boolean;
}

interface OutputAction extends DocumentAction {
    moveTo?: string;
    process?: string[];
    commands?: string[];
    compress?: CompressFormat[];
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

interface DocumentAction {
    document?: StringOfArray;
}

interface ElementAction {
    element?: XmlTagNode | HTMLElement;
}

interface AttributeAction {
    attributes?: AttributeMap;
}

interface StorageAction<T = unknown> {
    cloudStorage?: T[];
}

interface TagData {
    tagName: string;
    tagCount?: number;
    tagIndex?: number;
}

interface TagAppend extends TagData {
    order: number;
    id?: string;
    textContent?: string;
    prepend?: boolean;
    nextSibling?: number;
}

interface XmlNode extends AttributeAction {
    index: number;
    outerXml?: string;
    innerXml?: string;
    ignoreCase?: boolean;
}

interface XmlTagNode extends XmlNode, TagData {
    id?: StringMap;
    textContent?: string;
    append?: TagAppend;
}

interface WatchInterval {
    id?: string;
    interval?: number;
    expires?: string;
    reload?: boolean | WatchReload;
}

interface WatchReload {
    socketId?: string;
    port?: number;
    secure?: boolean;
    module?: boolean;
    handler?: { open?: string; message?: string; error?: string; close?: string };
}

interface Exclusions {
    glob?: string[];
    pathname?: string[];
    filename?: string[];
    extension?: string[];
    pattern?: (string | RegExp)[];
}

interface CompressLevel {
    level?: number;
    chunkSize?: number;
    mimeType?: string;
}

interface CompressFormat extends CompressLevel {
    format: string;
    condition?: string;
    plugin?: string;
    options?: PlainObject;
}

interface FileInfo {
    name: string;
    size: string;
}

interface RequestData extends PlainObject {
    assets?: FileAsset[];
    dataSource?: DataSource[];
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
    files?: FileInfo[];
    error?: ResponseError;
}

interface ResponseError {
    message: string;
    hint?: string;
}

interface OutputCommand extends Partial<LocationUri>, ElementScope, DocumentAction, OutputAction, AttributeAction, StorageAction {
    selector?: string;
    type?: string;
}