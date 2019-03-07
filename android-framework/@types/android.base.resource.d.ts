import { ResourceStoredMapAndroid, StyleAttribute, UserSettingsAndroid } from '../src/@types/application';
import { BackgroundGradient } from '../src/@types/node';

type SvgPath = squared.svg.SvgPath;

declare global {
    namespace android.base {
        interface Resource<T extends View> extends squared.base.Resource<T> {
            readonly userSettings: UserSettingsAndroid;
        }

        class Resource<T extends View> implements Resource<T> {
            public static STORED: ResourceStoredMapAndroid;
            public static createBackgroundGradient<T extends View>(gradient: Gradient, node?: T, path?: SvgPath, precision?: number): BackgroundGradient | undefined;
            public static formatOptions(options: ExternalData, numberAlias?: boolean): ExternalData;
            public static getOptionArray(element: HTMLSelectElement, replaceEntities?: boolean): (string[] | null)[];
            public static addTheme(...options: Required<StyleAttribute>[]): void;
            public static addString(value: string, name?: string, numberAlias?: boolean): string;
            public static addImageSrcSet(element: HTMLImageElement, prefix?: string): string;
            public static addImage(images: StringMap, prefix?: string): string;
            public static addImageUrl(value: string, prefix?: string): string;
            public static addColor(value: ColorData | string | undefined, transparency?: boolean): string;
        }
    }
}

export = android.base.Resource;