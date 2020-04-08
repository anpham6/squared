import { AppFramework, FileCopyingOptions, FileArchivingOptions, RawAsset, UserSettings } from '../base/application';

type View = chrome.base.View;

interface ChromeFramework<T extends View> extends AppFramework<T> {
    getElement: (element: HTMLElement, cache?: boolean) => Promise<Null<View>>;
    getElementById: (value: string, cache?: boolean) => Promise<Null<View>>;
    querySelector: (value: string) => Promise<Null<View>>;
    querySelectorAll: (value: string) => Promise<Null<View[]>>;
}

interface ChromeAsset extends Omit<RawAsset, keyof Dimension | 'content'> {
    content?: string;
    extension?: string;
}

interface UserSettingsChrome extends UserSettings {
    compressImages: boolean;
    cacheQuerySelectorResultSet: boolean;
    excludePlainText: boolean;
    outputFileExclusions: string[];
}

interface NodeOptionsChrome {
    element: Element;
}

interface FileActionAttributeChrome {
    name?: string;
    rel?: string;
}

interface FileCopyingOptionsChrome extends FileCopyingOptions, FileActionAttributeChrome {
}

interface FileArchivingOptionsChrome extends FileArchivingOptions, FileActionAttributeChrome {
}