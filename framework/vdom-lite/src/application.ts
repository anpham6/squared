import Application from '../../../src/base/application';
import Node from '../../../src/base/node';

export default class <T extends Node> extends Application<T> implements vdom.base.Application<T> {
    public userSettings!: UserSettings;
    public viewModel!: squared.base.AppViewModel;
    public readonly systemName = 'vdom';

    constructor(
        framework: number,
        nodeConstructor: Constructor<T>,
        ControllerConstructor: Constructor<T>)
    {
        super(framework, nodeConstructor, ControllerConstructor);
    }

    public insertNode(element: Element, sessionId: string) {
        return element.nodeName !== '#text' ? new this.Node(this.nextId, sessionId, element) : undefined;
    }

    public afterCreateCache() {}
}