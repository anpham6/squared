import { ResourceStoredMapAndroid, StyleAttribute, UserSettingsAndroid } from '../src/@types/application';

declare global {
    namespace android.base {
        interface Resource<T extends View> extends squared.base.ResourceUI<T> {
            readonly userSettings: UserSettingsAndroid;
            addImageSrc(element: HTMLImageElement | string, prefix?: string, imageSet?: ImageSrcSet[]): string;
        }

        class Resource<T extends View> implements Resource<T> {
            public static STORED: ResourceStoredMapAndroid;
            public static formatOptions(options: ExternalData, numberAlias?: boolean): ExternalData;
            public static formatName(value: string): string;
            public static addTheme(...options: StyleAttribute[]): void;
            public static addString(value: string, name?: string, numberAlias?: boolean): string;
            public static addImage(images: StringMap, prefix?: string): string;
            public static addColor(value: ColorData | string | undefined, transparency?: boolean): string;
        }
    }
}

export = android.base.Resource;