import { CachedValue } from '../../src/base/@types/node';

type T = chrome.base.View;

export default class View extends squared.base.Node implements chrome.base.View {
    protected _cached: CachedValue<T> = {};

    private _localSettings: { floatPrecision: number } = { floatPrecision: 3 };

    constructor(
        id = 0,
        sessionId = '0',
        element: Element,
        afterInit?: BindGeneric<T, void>)
    {
        super(id, sessionId, element);
        this.init();
        if (afterInit) {
            afterInit(this);
        }
    }

    public clone(id?: number) {
        const node = new View(id || this.id, this.sessionId, <Element> this.element);
        this.cloneBase(node);
        return node;
    }

    set localSettings(value) {
        Object.assign(this._localSettings, value);
    }
    get localSettings() {
        return this._localSettings;
    }
}