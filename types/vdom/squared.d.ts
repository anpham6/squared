import * as squared from '../squared';

declare namespace base {
    class Application<T extends Node> extends squared.base.Application<T> {}
    class Node extends squared.base.Node {}
}

export as namespace vdom;