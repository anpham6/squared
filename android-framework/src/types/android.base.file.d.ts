import { SessionData } from '../../../src/base/types/application';

declare global {
    namespace android.base {
        export interface File<T extends View> extends squared.base.File<T> {
            layoutAllToXml(data: SessionData<squared.base.NodeList<T>>, saveToDisk?: boolean): {};
            resourceAllToXml(saveToDisk?: boolean): {};
            resourceStringToXml(saveToDisk?: boolean): string;
            resourceStringArrayToXml(saveToDisk?: boolean): string;
            resourceFontToXml(saveToDisk?: boolean): string;
            resourceColorToXml(saveToDisk?: boolean): string;
            resourceStyleToXml(saveToDisk?: boolean): string;
            resourceDimenToXml(saveToDisk?: boolean): string;
            resourceDrawableToXml(saveToDisk?: boolean): string;
        }

        export class File<T extends View> implements File<T> {}
    }
}

export {};