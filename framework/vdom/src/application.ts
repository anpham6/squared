export default class Application<T extends squared.base.Node> extends squared.base.Application<T> implements vdom.base.Application<T> {
    public readonly systemName = 'vdom';

    public init() {}

    public insertNode(element: Element, sessionId: string) {
        if (element.nodeName[0] !== '#') {
            return new this.Node(this.nextId, sessionId, element);
        }
    }
}