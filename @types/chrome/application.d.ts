import { AppFramework, RawAsset, UserSettings } from '../base/application';

type View = chrome.base.View;

interface ChromeFramework<T extends View> extends AppFramework<T> {
    getElement: (element: HTMLElement, cache?: boolean) => Promise<View | null>;
    getElementById: (value: string, cache?: boolean) => Promise<View | null>;
    querySelector: (value: string) => Promise<View | null>;
    querySelectorAll: (value: string) => Promise<View[] | null>;
}

interface UserSettingsChrome extends UserSettings {
    cacheQuerySelectorResultSet: boolean;
    excludePlainText: boolean;
    outputFileExclusions: string[];
}

interface ChromeAsset extends Omit<RawAsset, keyof Dimension | 'content'> {
    content?: string;
    extension?: string;
    gzipQuality?: number;
    brotliQuality?: number;
}