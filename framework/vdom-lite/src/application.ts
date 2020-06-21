import Application from '../../../src/base/application';
import NodeElement from '../../../src/base/node-element';

export default class <T extends NodeElement> extends Application<T> implements vdom.base.Application<T> {
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