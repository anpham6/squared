import Application from '../../../src/base/application';
import Node from '../../../src/base/node';

export default class <T extends Node> extends Application<T> implements vdom.base.Application<T> {
    public userSettings!: UserSettings;
    public readonly systemName = 'vdom';

    constructor(
        framework: number,
        nodeConstructor: Constructor<T>,
        ControllerConstructor: Constructor<T>)
    {
        super(framework, nodeConstructor, ControllerConstructor);
    }

    public insertNode(element: Element, sessionId: string) {
        if (element.nodeName !== '#text') {
            return new this.Node(this.nextId, sessionId, element);
        }
    }
}