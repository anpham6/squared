import { FileAsset, RawAsset, ResourceStoredMap, UserSettings } from '../base/@types/application';

declare global {
    namespace squared.base {
        interface File<T extends Node> {
            resource: Resource<T>;
            userSettings: UserSettings;
            appName: string;
            readonly assets: FileAsset[];
            readonly stored: ResourceStoredMap;
            readonly directory: { string: string, font: string, image: string };
            saveAllToDisk(layouts: FileAsset[]): void;
            addAsset(data: Optional<RawAsset>): void;
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