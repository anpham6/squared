const { setElementCache } = squared.lib.session;

export default class Controller<T extends squared.base.Node> extends squared.base.Controller<T> implements chrome.base.Controller<T> {
    public applyDefaultStyles(element: Element, sessionId: string) {
        if (element.nodeName[0] === '#') {
            setElementCache(element, 'styleMap', sessionId, {
                position: 'static',
                display: 'inline',
                verticalAlign: 'baseline',
                float: 'none'
            });
        }
    }
}