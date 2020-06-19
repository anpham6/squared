export default class Application<T extends squared.base.NodeElement> extends squared.base.Application<T> implements vdom.base.Application<T> {
    public readonly systemName = 'vdom';

    public insertNode(element: Element, sessionId: string) {
        return element.nodeName !== '#text' ? new this.Node(this.nextId, sessionId, element) : undefined;
    }

    public afterCreateCache() {}
}