
import { AppFramework } from '../base/internal';
import { FileArchivingOptions } from './file';

type View = chrome.base.View;

export interface ChromeFramework<T extends View> extends AppFramework<T> {
    getElement: (element: HTMLElement, cache?: boolean) => Promise<Null<View>>;
    getElementById: (value: string, cache?: boolean) => Promise<Null<View>>;
    querySelector: (value: string) => Promise<Null<View>>;
    querySelectorAll: (value: string) => Promise<View[]>;
    saveAsWebPage: (filename?: string, options?: FileArchivingOptions) => Promise<unknown>;
}