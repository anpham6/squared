export default class Controller<T extends squared.base.NodeElement> extends squared.base.Controller<T> implements vdom.base.Controller<T> {
    constructor(public readonly application: vdom.base.Application<T>) {
        super();
    }
}