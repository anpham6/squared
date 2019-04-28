import { FileAsset } from '../../src/base/@types/application';
import { ResourceStoredMapAndroid } from '../src/@types/application';

declare global {
    namespace android.base {
        interface File<T extends View> extends squared.base.File<T> {
            readonly stored: ResourceStoredMapAndroid;
            saveAllToDisk(layouts: FileAsset[]): void;
            layoutAllToXml(layouts: FileAsset[], saveToDisk?: boolean): {};
            resourceAllToXml(saveToDisk?: boolean): {};
            resourceStringToXml(saveToDisk?: boolean): string[];
            resourceStringArrayToXml(saveToDisk?: boolean): string[];
            resourceFontToXml(saveToDisk?: boolean): string[];
            resourceColorToXml(saveToDisk?: boolean): string[];
            resourceStyleToXml(saveToDisk?: boolean): string[];
            resourceDimenToXml(saveToDisk?: boolean): string[];
            resourceDrawableToXml(saveToDisk?: boolean): string[];
            resourceDrawableImageToXml(saveToDisk?: boolean): string[];
            resourceAnimToXml(saveToDisk?: boolean): string[];
        }

        class File<T extends View> implements File<T> {}
    }
}

export = android.base.File;