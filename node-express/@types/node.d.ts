import * as file from '../../@types/base/file';
import * as file_chrome from '../../@types/chrome/file';

declare namespace Node {
    interface Settings {
        version?: string;
        disk_read?: string | boolean;
        disk_write?: string | boolean;
        unc_read?: string | boolean;
        unc_write?: string | boolean;
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

    type Environment = "production" | "development";

    interface Routing {
        shared?: Route[];
        production?: Route[];
        development?: Route[];
    }

    interface Route {
        mount?: string;
        path?: string;
    }

    interface External {
        html?: ObjectMap<StandardMap>;
        css?: ObjectMap<StandardMap>;
        js?: ObjectMap<StandardMap>;
    }

    interface CompressionFormat extends file.CompressionFormat {}

    interface FormattableContent extends file_chrome.FormattableContent {}

    interface RequestAsset extends Omit<file_chrome.RequestAsset, "exclusions"> {
        filepath?: string;
        originalName?: string;
    }

    interface ResultOfFileAction extends file.ResultOfFileAction {}
}

export = Node;