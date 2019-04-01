import { FileAsset, ResourceStoredMap, UserSettings, ViewData } from '../base/@types/application';

declare global {
    namespace squared.base {
        interface File<T extends Node> {
            resource: Resource<T>;
            userSettings: UserSettings;
            appName: string;
            readonly stored: ResourceStoredMap;
            readonly assets: FileAsset[];
            saveAllToDisk(data: ViewData): void;
            addAsset(pathname: string, filename: string, content?: string, uri?: string): void;
            reset(): void;
            saveToDisk(files: FileAsset[], appName?: string): void;
        }

        class File<T extends Node> implements File<T> {
            public static downloadToDisk(data: Blob, filename: string, mime?: string): void;
            constructor(resource: Resource<T>);
        }
    }
}

export = squared.base.File;