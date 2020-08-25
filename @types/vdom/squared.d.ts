import * as squared from '../squared';

type Node = squared.base.Node;

declare namespace base {
    class Application<T extends Node> extends squared.base.Application<T> {}
}

export as namespace vdom;