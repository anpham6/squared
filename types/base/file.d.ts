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
    index?: number;
}

interface FileAsset<T = unknown> extends TextAsset, OutputAction<T> {
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
    source: "uri" | "cloud";
    query?: unknown;
    index?: number;
    limit?: number;
    removeEmpty?: boolean;
}

interface OutputAction<T = unknown> extends DocumentAction {
    moveTo?: string;
    process?: string[];
    commands?: string[];
    compress?: CompressFormat[];
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

interface DocumentAction {
    document?: StringOfArray;
}

interface ElementAction {
    element?: XmlTagNode | HTMLElement;
}

interface AttributeAction {
    attributes?: AttributeMap;
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
    lowerCase?: boolean;
}

interface XmlTagNode extends XmlNode, TagData {
    id?: StringMap;
    textContent?: string;
    append?: TagAppend;
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
    files?: string[];
    error?: ResponseError;
}

interface ResponseError {
    message: string;
    hint?: string;
}