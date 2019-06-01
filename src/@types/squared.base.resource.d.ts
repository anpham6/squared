import { AppHandler, ImageAsset, RawAsset, ResourceAssetMap, UserSettings } from '../base/@types/application';

type CSSFontFaceData = squared.lib.css.CSSFontFaceData;

declare global {
    namespace squared.base {
        interface Resource<T extends Node> extends AppHandler<T> {
            cache: NodeList<T>;
            readonly userSettings: UserSettings;
            readonly assets: ResourceAssetMap;
            reset(): void;
            addImage(element: HTMLImageElement | undefined): void;
            getImage(src: string): ImageAsset | undefined;
            addFont(data: CSSFontFaceData): void;
            getFont(fontFamily: string, fontStyle?: string, fontWeight?: string): CSSFontFaceData | undefined;
            addRawData(dataURI: string, mimeType: string, encoding: string, content: string): string;
            getRawData(dataURI: string): RawAsset | undefined;
        }

        class Resource<T extends Node> implements Resource<T> {
            public static ASSETS: ResourceAssetMap;
            constructor(application: Application<T>, cache: NodeList<T>);
        }
    }
}

export = squared.base.Resource;