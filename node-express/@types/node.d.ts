import { RequestAsset, Routing } from './express';
import { CompressFormat, External } from './content';

import * as fs from "fs";
import * as cors from "cors";

declare namespace Node {
    interface INode {
        readonly disk_read: boolean;
        readonly disk_write: boolean;
        readonly unc_read: boolean;
        readonly unc_write: boolean;
        readonly major: number;
        readonly minor: number;
        readonly patch: number;
        checkVersion(major: number, minor: number, patch?: number): boolean;
        checkPermissions(res: {}, dirname: string): boolean;
        isFileURI(value: string): boolean;
        isFileUNC(value: string): boolean;
        isDirectoryUNC(value: string): boolean;
        writeError(description: string, message: any): void;
    }

    interface IExpress {
        readonly PATTERN_URL: RegExp;
        fromSameOrigin(base: string, other: string): boolean;
        resolvePath(value: string, href: string, hostname?: boolean): string;
        getBaseDirectory(location: string, asset: string): [string[], string[]];
        getAbsoluteUrl(value: string, href: string): string;
        getFullUri(file: RequestAsset, filename?: string): string;
    }

    interface ICompress {
        readonly gzip_level: number;
        readonly brotli_quality: number;
        readonly jpeg_quality: number;
        readonly tinify_api_key: boolean;
        getFileSize(filepath: string): number;
        createGzipWriteStream(source: string, filepath: string, level?: number): fs.WriteStream;
        createBrotliWriteStream(source: string, filepath: string, quality?: number, mimeType?: string): fs.WriteStream;
        getFormat(compress: Undef<CompressFormat[]>, format: string): Undef<CompressFormat>;
        removeFormat(compress: Undef<CompressFormat[]>, format: string): void;
        getPng(compress: Undef<CompressFormat[]>): Undef<CompressFormat>;
        isJpeg(file: RequestAsset): boolean;
        getSizeRange(value: string): [number, number];
        withinSizeRange(filepath: string, value: Undef<string>): boolean;
    }

    interface IChrome {
        readonly external: Undef<External>;
        readonly prettier_plugins: {}[];
        formatContent(value: string, mimeType: string, format: string): string;
        getTrailingContent(file: RequestAsset, mimeType?: string, format?: string): string;
        findExternalPlugin(data: ObjectMap<StandardMap>, format: string): [string, {}];
        minifyHtml(format: string, value: string): string;
        minifyCss(format: string, value: string): string;
        minifyJs(format: string, value: string): string;
        replacePath(source: string, segment: string, value: string, base64?: boolean): string;
    }

    interface IFileManager {
        archiving: boolean;
        delayed: number;
        files: Set<string>;
        filesToRemove: Set<string>;
        filesToCompare: Map<RequestAsset, string[]>;
        contentToAppend: Map<string, string[]>;
        dirname: string;
        assets: RequestAsset[];
        readonly requestMain?: RequestAsset;
        add(value: string): void;
        delete(value: string): void;
        getFileOutput(file: RequestAsset): { pathname: string; filepath: string };
        replaceFileOutput(file: RequestAsset, replaceWith: string): void;
        getRelativeUrl(file: RequestAsset, url: string): string;
        appendContent(file: RequestAsset, content: string): void;
        compressFile(assets: RequestAsset[], file: RequestAsset, filepath: string, finalize: (filepath?: string) => void): void;
        transformBuffer(assets: RequestAsset[], file: RequestAsset, filepath: string, finalize: (filepath?: string) => void): void;
        transformCss(file: RequestAsset, filepath: Undef<string>, content?: string): string;
        writeBuffer(assets: RequestAsset[], file: RequestAsset, filepath: string, finalize: (filepath?: string) => void): void;
        processAssetsAsync(empty: boolean, finalize: (filepath?: string) => void): void;
        finalizeAssetsAsync(release: boolean): Promise<void>;
    }

    interface Settings {
        version?: string;
        disk_read?: string | boolean;
        disk_write?: string | boolean;
        unc_read?: string | boolean;
        unc_write?: string | boolean;
        cors?: cors.CorsOptions;
        request_post_limit?: string;
        gzip_level?: string | number;
        brotli_quality?: string | number;
        jpeg_quality?: string | number;
        tinypng_api_key?: string;
        env?: string;
        port?: { development?: string; production?: string };
        routing?: Routing;
        external?: External;
    }
}

export = Node;