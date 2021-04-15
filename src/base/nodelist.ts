import type Node from './node';

export default class NodeList<T extends Node> extends squared.lib.base.Container<T> implements squared.base.NodeList<T> {
    public afterAdd?: (this: T, options: NodeListAddOptions) => void;

    constructor(
        children?: T[],
        public sessionId = '0',
        public resourceId = -1) {
        super(children);
    }

    public add(node: T, options?: NodeListAddOptions) {
        super.add(node);
        if (options && this.afterAdd) {
            this.afterAdd.call(node, options);
        }
        return this;
    }

    public sort(predicate: FunctionSort<T>) {
        this.children.sort(predicate);
        return this;
    }
}