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

    interface CompressionFormat {
        format: string;
        level: number;
    }

    interface FileAsset {
        pathname: string;
        filename: string;
        content: string;
        mimeType?: string;
        uri?: string;
        base64?: string;
        compress?: CompressionFormat[];
    }
}

export = node;