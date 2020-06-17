const { setElementCache } = squared.lib.session;

export default class Controller<T extends squared.base.NodeElement> extends squared.base.Controller<T> implements chrome.base.Controller<T> {
    private _elementMap = new Map<Element, T>();

    constructor(public readonly application: chrome.base.Application<T>) {
        super();
    }

    public reset() {
        this._elementMap.clear();
    }

    public applyDefaultStyles(element: Element, sessionId: string) {
        if (element.nodeName === '#text') {
            setElementCache(element, 'styleMap', sessionId, {
                position: 'static',
                display: 'inline',
                verticalAlign: 'baseline',
                float: 'none',
                clear: 'none'
            });
        }
    }

    public cacheElement(node: T) {
        this._elementMap.set(node.element as Element, node);
    }

    public cacheElementList(list: squared.base.NodeList<T>) {
        const elementMap = this._elementMap;
        list.each(node => elementMap.set(node.element as Element, node));
    }

    get elementMap() {
        return this._elementMap;
    }

    get userSettings() {
        return this.application.userSettings;
    }
}