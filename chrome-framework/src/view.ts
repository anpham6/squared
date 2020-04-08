import { CachedValue } from '../../@types/base/node';

export default class View extends squared.base.Node implements chrome.base.View {
    public queryMap?: View[][];

    protected _cached: CachedValue<View> = {};

    constructor(
        id: number,
        sessionId: string,
        element: Element,
        afterInit?: BindGeneric<View, void>)
    {
        super(id, sessionId, element);
        this.init();
        if (afterInit) {
            afterInit(this);
        }
    }
}