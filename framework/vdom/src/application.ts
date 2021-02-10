export default class Application<T extends squared.base.Node> extends squared.base.Application<T> implements vdom.base.Application<T> {
    public readonly systemName = 'vdom';

    public insertNode(processing: squared.base.AppProcessing<T>, element: Element) {
        if (element.nodeName[0] !== '#') {
            return new this.Node(this.nextId, processing.sessionId, element);
        }
    }
}