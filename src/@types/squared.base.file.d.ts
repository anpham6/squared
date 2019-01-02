import { FileAsset, ResourceStoredMap, SessionData, UserSettings } from '../base/@types/application';

declare global {
    namespace squared.base {
        interface File<T extends Node> {
            resource: Resource<T>;
            userSettings: UserSettings;
            appName: string;
            stored: ResourceStoredMap;
            readonly assets: FileAsset[];
            saveAllToDisk(data: SessionData<NodeList<T>>): void;
            addAsset(pathname: string, filename: string, content?: string, uri?: string): void;
            reset(): void;
            saveToDisk(files: FileAsset[]): void;
        }

        class File<T extends Node> implements File<T> {
            public static downloadToDisk(data: Blob, filename: string, mime?: string): void;
            constructor(resource: Resource<T>);
        }
    }
}

export = squared.base.File;