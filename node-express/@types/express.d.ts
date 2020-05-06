import * as file from '../../@types/base/file';
import * as file_chrome from '../../@types/chrome/file';

declare namespace Express {
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

    interface RequestAsset extends Omit<file_chrome.RequestAsset, "exclusions"> {
        filepath?: string;
        originalName?: string;
    }

    interface ResultOfFileAction extends file.ResultOfFileAction {}
}

export = Express;