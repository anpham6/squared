import { FileAsset, RawAsset, ResourceStoredMap, UserUISettings } from '../base/@types/application';

declare global {
    namespace squared.base {
        interface FileUI<T extends NodeUI> {
            resource: ResourceUI<T>;
            userSettings: UserUISettings;
            appName: string;
            readonly assets: FileAsset[];
            readonly stored: ResourceStoredMap;
            readonly directory: { string: string, font: string, image: string };
            saveAllToDisk(layouts: FileAsset[]): void;
            addAsset(data: Optional<RawAsset>): void;
            reset(): void;
            saveToDisk(files: FileAsset[], appName?: string): void;
        }

        class FileUI<T extends NodeUI> implements FileUI<T> {
            public static downloadToDisk(data: Blob, filename: string, mime?: string): void;
            constructor(resource: ResourceUI<T>);
        }
    }
}

export = squared.base.FileUI;