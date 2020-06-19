import * as squared from '../squared';

type NodeElement = squared.base.NodeElement;

declare namespace base {
    class Application<T extends NodeElement> extends squared.base.Application<T> {
    }
}

export as namespace vdom;