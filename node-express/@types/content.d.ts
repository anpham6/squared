import * as file from '../../@types/base/file';
import * as file_chrome from '../../@types/chrome/file';

declare namespace Content {
    interface External {
        html?: ObjectMap<StandardMap>;
        css?: ObjectMap<StandardMap>;
        js?: ObjectMap<StandardMap>;
    }

    interface CompressOutput {
        jpeg: number;
        gzip?: number;
        brotli?: number;
    }

    interface CompressFormat extends file.CompressFormat {}

    interface FormattableContent extends file_chrome.FormattableContent {}
}

export = Content;