import type { AppFramework, FileCopyingOptions, FileArchivingOptions, RawAsset, UserSettings } from '../base/application';

type View = chrome.base.View;

interface ChromeFramework<T extends View> extends AppFramework<T> {
    getElement: (element: HTMLElement, cache?: boolean) => Promise<Null<View>>;
    getElementById: (value: string, cache?: boolean) => Promise<Null<View>>;
    querySelector: (value: string) => Promise<Null<View>>;
    querySelectorAll: (value: string) => Promise<Null<View[]>>;
}

interface UserSettingsChrome extends UserSettings {
    cacheQuerySelectorResultSet: boolean;
    excludePlainText: boolean;
    outputFileExclusions: string[];
}

interface ChromeAsset extends Omit<RawAsset, keyof Dimension | 'content'> {
    content?: string;
    extension?: string;
}

interface ChromeNodeOptions {
    element: Element;
}

interface FileCopyingOptionsChrome extends FileCopyingOptions {
    name?: string;
    rel?: string;
}

interface FileArchivingOptionsChrome extends FileArchivingOptions {
    name?: string;
    rel?: string;
}