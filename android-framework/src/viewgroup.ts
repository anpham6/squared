import View$MX from './view-mx';

export default class ViewGroup<T extends android.base.View> extends View$MX(squared.base.NodeGroupUI) {
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
}