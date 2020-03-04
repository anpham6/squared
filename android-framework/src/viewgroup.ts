import View$MX from './view-mx';

type View = android.base.View;

export default class ViewGroup<T extends View> extends View$MX(squared.base.NodeGroupUI) {
    constructor(
        id: number,
        node: T,
        children: T[],
        afterInit?: BindGeneric<T, void>)
    {
        super(id, node.sessionId, undefined, afterInit);
        this.depth = node.depth;
        this.containerName = node.containerName + '_GROUP';
        this.actualParent = node.actualParent;
        this.documentParent = node.documentParent;
        this.retain(children);
    }

    set containerType(value) {
        this._containerType = value;
    }
    get containerType() {
        return this._containerType;
    }

    set renderExclude(value) {}
    get renderExclude() {
        return false;
    }
}