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

    interface RequestAsset extends file_chrome.RequestAsset {
        filepath?: string;
        excluded?: boolean;
        originalName?: string;
        dataMap?: DataMap;
    }

    interface ResultOfFileAction extends file.ResultOfFileAction {}

    interface DataMap {
        unusedStyles?: string[];
    }
}

export = Express;