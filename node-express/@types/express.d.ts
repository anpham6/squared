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

    interface ExpressAsset extends ChromeAsset {
        filepath?: string;
        excluded?: boolean;
        originalName?: string;
        dataMap?: DataMap;
    }

    interface DataMap {
        unusedStyles?: string[];
    }
}

export = Express;