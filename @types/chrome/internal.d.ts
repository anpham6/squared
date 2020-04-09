
import { AppFramework } from '../base/internal';

type View = chrome.base.View;

interface ChromeFramework<T extends View> extends AppFramework<T> {
    getElement: (element: HTMLElement, cache?: boolean) => Promise<Null<View>>;
    getElementById: (value: string, cache?: boolean) => Promise<Null<View>>;
    querySelector: (value: string) => Promise<Null<View>>;
    querySelectorAll: (value: string) => Promise<Null<View[]>>;
}