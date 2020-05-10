export default class View extends squared.base.Node implements chrome.base.View {
    public queryMap?: View[][];

    protected _cached: CachedValue<View> = {};
    protected _preferInitial = false;

    constructor(id: number, sessionId: string, element: Element) {
        super(id, sessionId, element);
        this.init();
    }
}