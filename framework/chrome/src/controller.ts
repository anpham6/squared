const { setElementCache } = squared.lib.session;

export default class Controller<T extends squared.base.Node> extends squared.base.Controller<T> implements chrome.base.Controller<T> {
    constructor(public readonly application: chrome.base.Application<T>) {
        super();
    }

    public applyDefaultStyles(element: Element, sessionId: string) {
        if (element.nodeName.charAt(0) === '#') {
            setElementCache(element, 'styleMap', sessionId, {
                position: 'static',
                display: 'inline',
                verticalAlign: 'baseline',
                float: 'none'
            });
        }
    }

    get userSettings() {
        return this.application.userSettings;
    }
}