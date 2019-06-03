import { CachedValue } from '../../src/base/@types/node';
import { LocalSettings } from './@types/node';

type T = View;

export default class View extends squared.base.Node implements chrome.base.View {
    protected _cached: CachedValue<T> = {};
    protected _localSettings: LocalSettings = {};
    protected _documentParent?: T;

    constructor(
        id: number,
        sessionId: string,
        element: Element,
        afterInit?: BindGeneric<T, void>)
    {
        super(id, sessionId, element);
        if (element) {
            this.init();
        }
        if (afterInit) {
            afterInit(this);
        }
    }

    set localSettings(value) {
        Object.assign(this._localSettings, value);
    }
    get localSettings() {
        return this._localSettings;
    }
}