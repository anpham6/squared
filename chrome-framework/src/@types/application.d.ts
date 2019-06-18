import { AppFramework, UserSettings } from '../../../src/base/@types/application';

type View = chrome.base.View;

interface ChromeFramework<T extends View> extends AppFramework<T> {
    getElement: (element: HTMLElement, cache?: boolean) => Promise<View | null>;
    getElementById: (value: string, cache?: boolean) => Promise<View | null>;
    querySelector: (value: string) => Promise<View | null>;
    querySelectorAll: (value: string) => Promise<View[] | null>;
}

interface UserSettingsChrome extends UserSettings {
    brotliCompressionQuality: number;
    brotliCompatibleExtensions: string[];
    excludePlainText: boolean;
}