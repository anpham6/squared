import Application from '../../../src/base/application';
import Node from '../../../src/base/node';

export default class <T extends Node> extends Application<T> implements vdom.base.Application<T> {
    public userSettings!: UserSettings;
    public readonly systemName = 'vdom';

    public insertNode(element: Element, sessionId: string) {
        if (element.nodeName[0] !== '#') {
            return new this.Node(this.nextId, sessionId, element);
        }
    }
}