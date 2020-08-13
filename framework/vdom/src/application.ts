export default class Application<T extends squared.base.Node> extends squared.base.Application<T> implements vdom.base.Application<T> {
    public readonly systemName = 'vdom';

    public insertNode(element: Element, sessionId: string) {
        if (element.nodeName !== '#text') {
            return new this.Node(this.nextId, sessionId, element);
        }
    }
}