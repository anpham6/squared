import type Node from '../../../src/base/node';

import Application from '../../../src/base/application';

export default class <T extends Node> extends Application<T> implements vdom.base.Application<T> {
    public userSettings!: UserSettings;
    public readonly systemName = 'vdom';

    public init() {}

    public insertNode(processing: squared.base.AppProcessing<T>, element: Element) {
        if (element.nodeName[0] !== '#') {
            return new this.Node(this.nextId, processing.sessionId, element);
        }
    }
}