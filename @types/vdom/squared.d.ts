import * as squared from '../squared';

type NodeElement = squared.base.NodeElement;

declare namespace base {
    class Application<T extends NodeElement> extends squared.base.Application<T> {
    }

    class Controller<T extends NodeElement> extends squared.base.Controller<T> {
        application: Application<T>;
    }
}

export as namespace vdom;