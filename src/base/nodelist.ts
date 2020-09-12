import type Node from './node';

export default class NodeList<T extends Node> extends squared.lib.base.Container<T> implements squared.base.NodeList<T> {
    public afterAdd?: (node: T, cascade?: boolean, remove?: boolean) => void;

    constructor(
        children?: T[],
        public sessionId = '') {
        super(children);
    }

    public add(node: T, delegate?: boolean, cascade?: boolean, remove?: boolean) {
        super.add(node);
        if (delegate && this.afterAdd) {
            this.afterAdd.call(this, node, cascade, remove);
        }
        return this;
    }

    public sort(predicate: (a: T, b: T) => number) {
        this.children.sort(predicate);
        return this;
    }
}