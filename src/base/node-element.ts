import Node from './node';

export default class NodeElement extends Node implements squared.base.NodeElement {
    public queryMap?: NodeElement[][];

    protected _cached: CachedValue<NodeElement> = {};

    constructor(id: number, sessionId: string, element: Element) {
        super(id, sessionId, element);
        this.init();
    }
}