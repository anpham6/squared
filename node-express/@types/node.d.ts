import { RequestAsset, Routing } from './express';
import { CompressFormat, Exclusions, External, ResizeMode } from './content';

import * as fs from "fs";
import * as cors from "cors";
import * as jimp from "jimp";

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
        getBaseDirectory(location: string, asset: string): [string[], string[]];
        getAbsoluteUrl(value: string, href: string): string;
        getFullUri(file: RequestAsset, filename?: string): string;
        resolvePath(value: string, href: string, hostname?: boolean): Undef<string>;
    }

    interface ICompress {
        readonly gzip_level: number;
        readonly brotli_quality: number;
        readonly jpeg_quality: number;
        getFileSize(filepath: string): number;
        createGzipWriteStream(source: string, filepath: string, level?: number): fs.WriteStream;
        createBrotliWriteStream(source: string, filepath: string, quality?: number, mimeType?: string): fs.WriteStream;
        getFormat(compress: Undef<CompressFormat[]>, format: string): Undef<CompressFormat>;
        removeFormat(compress: Undef<CompressFormat[]>, format: string): void;
        getSizeRange(value: string): [number, number];
        withinSizeRange(filepath: string, value: Undef<string>): boolean;
    }

    interface IImage {
        readonly tinify_api_key: boolean;
        getCompress(compress: Undef<CompressFormat[]>): Undef<CompressFormat>;
        isJpeg(file: RequestAsset, filepath?: string): boolean;
        parseResizeMode(value: string): ResizeMode;
        resize(image: jimp, width: Undef<number>, height: Undef<number>, mode?: string): jimp;
    }

    interface IChrome {
        readonly external: Undef<External>;
        readonly prettier_plugins: {}[];
        findExternalPlugin(data: ObjectMap<StandardMap>, format: string): [string, {}];
        minifyHtml(format: string, value: string): Undef<string>;
        minifyCss(format: string, value: string): Undef<string>;
        minifyJs(format: string, value: string): Undef<string>;
        formatContent(value: string, mimeType: string, format: string): Undef<string>;
        getTrailingContent(file: RequestAsset, mimeType?: string, format?: string): Undef<string>;
        removeCss(source: string, styles: string[]): Undef<string>;
        replacePath(source: string, segment: string, value: string, base64?: boolean): Undef<string>;
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
        replace(file: RequestAsset, replaceWith: string): void;
        validate(file: RequestAsset, exclusions: Exclusions): boolean;
        getFileOutput(file: RequestAsset): { pathname: string; filepath: string };
        getRelativeUrl(file: RequestAsset, url: string): Undef<string>;
        appendContent(file: RequestAsset, content: string): void;
        compressFile(assets: RequestAsset[], file: RequestAsset, filepath: string, finalize: (filepath?: string) => void): void;
        transformBuffer(assets: RequestAsset[], file: RequestAsset, filepath: string, finalize: (filepath?: string) => void): void;
        transformCss(file: RequestAsset, filepath: Undef<string>, content?: string): Undef<string>;
        writeBuffer(assets: RequestAsset[], file: RequestAsset, filepath: string, finalize: (filepath?: string) => void): void;
        processAssetsSync(empty: boolean, finalize: (filepath?: string) => void): void;
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