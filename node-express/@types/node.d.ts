import * as file from '../../@types/base/file';

declare namespace Node {
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
        env?: string;
        port?: { development?: string; production?: string };
        routing?: {
            shared?: Route[];
            production?: Route[];
            development?: Route[];
        };
    }

    type Environment = "production" | "development";

    interface Route {
        mount?: string;
        path?: string;
    }

    interface CompressionFormat extends file.CompressionFormat {}

    interface RequestAsset extends Omit<file.RequestAsset, "exclusions"> {}

    interface ResultOfFileAction extends file.ResultOfFileAction {}
}

export = Node;