import { AppHandler, ResourceAssetMap, ResourceStoredMap, UserSettings, ViewData } from '../base/@types/application';

declare global {
    namespace squared.base {
        interface Resource<T extends Node> extends AppHandler<T> {
            application: Application<T>;
            cache: NodeList<T>;
            fileHandler?: File<T>;
            readonly userSettings: UserSettings;
            readonly stored: ResourceStoredMap;
            finalize(data: ViewData): void;
            reset(): void;
            setBoxStyle(): void;
            setFontStyle(): void;
            setValueString(): void;
        }

        class Resource<T extends Node> implements Resource<T> {
            public static KEY_NAME: string;
            public static ASSETS: ResourceAssetMap;
            public static STORED: ResourceStoredMap;
            public static generateId(section: string, name: string, start?: number): string;
            public static insertStoredAsset(asset: string, name: string, value: any): string;
            public static getOptionArray(element: HTMLSelectElement, replaceEntities?: boolean): [string[] | undefined, string[] | undefined];
            public static isBackgroundVisible(object: BoxStyle | undefined): boolean;
            public static getBackgroundSize<T extends Node>(node: T, value: string): Dimension | undefined;
            public static isInheritedStyle(node: Node, attr: string): boolean;
            public static hasLineBreak(node: Node, lineBreak?: boolean, trim?: boolean): boolean;
            constructor(application: Application<T>, cache: NodeList<T>);
        }
    }
}

export = squared.base.Resource;