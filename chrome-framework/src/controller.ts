
type View = chrome.base.View;

const { isTextNode } = squared.lib.dom;
const { setElementCache } = squared.lib.session;

export default class Controller<T extends View> extends squared.base.Controller<T> implements chrome.base.Controller<T> {
    public readonly localSettings: ControllerSettings = {
        mimeType: {
            font: '*',
            image: '*',
            audio: '*',
            video: '*'
        }
    };

    private _elementMap = new Map<Element, T>();

    constructor(
        public readonly application: chrome.base.Application<T>,
        public readonly cache: squared.base.NodeList<T>)
    {
        super();
    }

    public sortInitialCache() {}

    public init() {
        this.application.processing.unusedStyles.clear();
    }

    public reset() {
        this._elementMap.clear();
    }

    public applyDefaultStyles(element: Element) {
        if (isTextNode(element)) {
            setElementCache(element, 'styleMap', this.sessionId, {
                position: 'static',
                display: 'inline',
                verticalAlign: 'baseline',
                float: 'none',
                clear: 'none'
            });
        }
    }

    public includeElement() {
        return true;
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