import { AppHandler, ResourceAssetMap, ResourceStoredMap, SessionData, UserSettings } from '../src/base/types/application';

declare global {
    namespace squared.base {
        interface Resource<T extends Node> extends AppHandler<T> {
            application: Application<T>;
            cache: NodeList<T>;
            fileHandler: File<T> | undefined;
            readonly userSettings: UserSettings;
            readonly stored: ResourceStoredMap;
            finalize(data: SessionData<NodeList<T>>): void;
            reset(): void;
            setBoxStyle(): void;
            setFontStyle(): void;
            setValueString(): void;
        }

        class Resource<T extends Node> implements Resource<T> {
            public static KEY_NAME: string;
            public static ASSETS: ResourceAssetMap;
            public static STORED: ResourceStoredMap;
            public static generateId(section: string, name: string, start: number): string;
            public static getStoredName(asset: string, value: any): string;
            public static insertStoredAsset(asset: string, name: string, value: any): string;
            public static isBorderVisible(border: BorderAttribute | undefined): boolean;
            public static isBackgroundVisible<T extends Node>(node: T): boolean;
            public static hasDrawableBackground(object: BoxStyle | undefined): boolean;
            constructor(application: Application<T>);
        }
    }
}

export {};