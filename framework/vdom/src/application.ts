export default class Application<T extends squared.base.Node> extends squared.base.Application<T> implements vdom.base.Application<T> {
    public readonly systemName = 'vdom';

    public insertNode(element: Element, sessionId: string) {
        if (element.nodeName.charAt(0) !== '#') {
            return new this.Node(this.nextId, sessionId, element);
        }
    }
}