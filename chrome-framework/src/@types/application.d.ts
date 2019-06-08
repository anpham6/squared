import { AppFramework, UserSettings } from '../../../src/base/@types/application';

type View = chrome.base.View;

interface ChromeFramework<T extends View> extends AppFramework<T> {
    getElement: (element: HTMLElement) => Promise<View | null>;
    getElementById: (value: string) => Promise<View | null>;
    querySelector: (value: string) => Promise<View | null>;
    querySelectorAll: (value: string) => Promise<View[] | null>;
}

interface UserSettingsChrome extends UserSettings {
    excludePlainText: boolean;
}