import * as file from '../base/file';

declare namespace node {
    interface Settings {
        version?: string;
        disk_read?: boolean;
        disk_write?: boolean;
        unc_read?: boolean;
        unc_write?: boolean;
        request_post_limit?: number | string;
        gzip_level?: number | string;
        brotli_quality?: number | string;
        tinypng_api_key?: string;
    }

    interface CompressionFormat extends file.CompressionFormat {}

    interface RawAsset extends Omit<file.RawAsset, "width" | "height" | "index" | "exclusions"> {}
}

export = node;