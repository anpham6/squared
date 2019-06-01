import { FileAsset, ResourceStoredMap, UserUISettings } from '../base/@types/application';

declare global {
    namespace squared.base {
        interface ResourceUI<T extends NodeUI> extends Resource<T> {
            fileHandler?: FileUI<T>;
            readonly userSettings: UserUISettings;
            readonly stored: ResourceStoredMap;
            finalize(layouts: FileAsset[]): void;
            writeRawImage(filename: string, base64: string): void;
            setBoxStyle(node: T): void;
            setFontStyle(node: T): void;
            setValueString(node: T): void;
        }

        class ResourceUI<T extends NodeUI> implements ResourceUI<T> {
            public static KEY_NAME: string;
            public static STORED: ResourceStoredMap;
            public static generateId(section: string, name: string, start?: number): string;
            public static insertStoredAsset(asset: string, name: string, value: any): string;
            public static getOptionArray(element: HTMLSelectElement, showDisabled?: boolean): (string[] | undefined)[];
            public static isBackgroundVisible(object: BoxStyle | undefined): boolean;
            public static getBackgroundSize<T extends NodeUI>(node: T, value: string): Dimension | undefined;
            public static isInheritedStyle<T extends NodeUI>(node: T, attr: string): boolean;
            public static hasLineBreak<T extends NodeUI>(node: T, lineBreak?: boolean, trim?: boolean): boolean;
            constructor(application: Application<T>, cache: NodeList<T>);
        }
    }
}

export = squared.base.ResourceUI;