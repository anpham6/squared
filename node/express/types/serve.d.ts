import type * as express from 'express';
import type * as cors from 'cors';
import type * as fs from 'fs';
import type * as jimp from 'jimp';

type BoolString = boolean | string;
type ExternalCategory = "html" | "css" | "js";

interface INode {
    readonly disk_read: boolean;
    readonly disk_write: boolean;
    readonly unc_read: boolean;
    readonly unc_write: boolean;
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
    checkVersion(major: number, minor: number, patch?: number): boolean;
    checkPermissions(res: express.Response, dirname: string): boolean;
    isFileURI(value: string): boolean;
    isFileUNC(value: string): boolean;
    isDirectoryUNC(value: string): boolean;
    writeFail(description: string, message: any): void;
}

interface IExpress {
    readonly PATTERN_URL: RegExp;
    fromSameOrigin(base: string, other: string): boolean;
    getBaseDirectory(location: string, asset: string): [string[], string[]];
    getAbsoluteUrl(value: string, href: string): string;
    getFullUri(file: ExpressAsset, filename?: string): string;
    resolvePath(value: string, href: string, hostname?: boolean): Undef<string>;
}

interface ICompress {
    readonly gzip_level: number;
    readonly brotli_quality: number;
    readonly jpeg_quality: number;
    getFileSize(filepath: string): number;
    createGzipWriteStream(source: string, filepath: string, level?: number): fs.WriteStream;
    createBrotliWriteStream(source: string, filepath: string, quality?: number, mimeType?: string): fs.WriteStream;
    findFormat(compress: Undef<CompressFormat[]>, format: string): Undef<CompressFormat>;
    removeFormat(compress: Undef<CompressFormat[]>, format: string): void;
    getSizeRange(value: string): [number, number];
    withinSizeRange(filepath: string, value: Undef<string>): boolean;
}

interface IImage {
    findCompress(compress: Undef<CompressFormat[]>): Undef<CompressFormat>;
    isJpeg(file: ExpressAsset, filepath?: string): boolean;
    parseResizeMode(value: string): Undef<ResizeMode>;
    parseOpacity(value: string): Undef<number>;
    parseRotation(value: string): Undef<number[]>;
    resize(self: jimp, width: number, height: number, mode?: string): jimp;
    rotate(self: jimp, filepath: string, values: number[], manager: IFileManager): jimp;
    opacity(self: jimp, value: Undef<number>): jimp;
}

interface IChrome {
    readonly modules: Undef<ChromeModules>;
    configureTranspiler(config: ObjectMap<StandardMap>, name: string, category: ExternalCategory, transpileMap?: TranspileMap): [string, StandardMap | FunctionType<string>];
    createTranspilerFunction(value: string): Null<FunctionType<string>>;
    findExternalPlugin(data: ObjectMap<StandardMap>, name: string): [string, StandardMap | FunctionType<string>];
    getPrettierParser(name: string): NodeModule[];
    minifyHtml(format: string, value: string, transpileMap?: TranspileMap): Promise<Void<string>>;
    minifyCss(format: string, value: string, transpileMap?: TranspileMap): Promise<Void<string>>;
    minifyJs(format: string, value: string, transpileMap?: TranspileMap): Promise<Void<string>>;
    formatContent(mimeType: string, format: string, value: string, transpileMap?: TranspileMap): Promise<Void<string>>;
    removeCss(source: string, styles: string[]): Undef<string>;
}

interface IFileManager {
    delayed: number;
    readonly files: Set<string>;
    readonly filesToRemove: Set<string>;
    readonly filesToCompare: Map<ExpressAsset, string[]>;
    readonly contentToAppend: Map<string, string[]>;
    readonly assets: ExpressAsset[];
    readonly dirname: string;
    readonly requestMain?: ExpressAsset;
    add(value: string): void;
    delete(value: string): void;
    replace(file: ExpressAsset, replaceWith: string): void;
    validate(file: ExpressAsset, exclusions: Exclusions): boolean;
    getFileOutput(file: ExpressAsset): { pathname: string; filepath: string };
    getRelativeUrl(file: ExpressAsset, url: string): Undef<string>;
    replacePath(source: string, segment: string, value: string, base64?: boolean): Undef<string>;
    replaceExtension(value: string, ext: string): string;
    getTrailingContent(file: ExpressAsset): Promise<string>;
    appendContent(file: ExpressAsset, content: string, outputOnly?: boolean): Promise<string>;
    transformBuffer(assets: ExpressAsset[], file: ExpressAsset, filepath: string): Promise<void>;
    transformCss(file: ExpressAsset, content: string): Undef<string>;
    compressFile(assets: ExpressAsset[], file: ExpressAsset, filepath: string): void;
    writeBuffer(assets: ExpressAsset[], file: ExpressAsset, filepath: string): void;
    processAssets(empty: boolean): void;
    finalizeAssetsAsync(release: boolean): Promise<void>;
}

interface Settings {
    version?: string;
    disk_read?: BoolString;
    disk_write?: BoolString;
    unc_read?: BoolString;
    unc_write?: BoolString;
    cors?: cors.CorsOptions;
    request_post_limit?: string;
    gzip_level?: NumString;
    brotli_quality?: NumString;
    jpeg_quality?: NumString;
    tinypng_api_key?: string;
    env?: string;
    port?: StringMap;
    routing?: Routing;
    chrome?: ChromeModules;
}

interface Arguments {
    accessAll?: boolean;
    accessDisk?: boolean;
    accessUnc?: boolean;
    diskRead?: boolean;
    diskWrite?: boolean;
    uncRead?: boolean;
    uncWrite?: boolean;
    env?: string;
    port?: number;
    cors?: string;
}

interface Routing {
    [key: string]: Route[];
}

interface Route {
    mount?: string;
    path?: string;
}

export as namespace serve;