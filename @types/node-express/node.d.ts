import * as file from '../base/file';

declare namespace node {
    interface Settings {
        version?: string;
        disk_read?: boolean;
        disk_write?: boolean;
        unc_read?: boolean;
        unc_write?: boolean;
        request_post_limit?: string;
        gzip_level?: string;
        brotli_quality?: string;
        jpeg_quality?: string;
        tinypng_api_key?: string;
        routing?: { mount: string, path: string }[];
    }

    interface CompressionFormat extends file.CompressionFormat {}

    interface RequestAsset extends Omit<file.RequestAsset, "exclusions"> {}
}

export = node;