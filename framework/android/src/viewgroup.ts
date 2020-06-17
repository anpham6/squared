import View$MX from './view-mx';

type View = android.base.View;

export default class ViewGroup<T extends View> extends View$MX(squared.base.NodeGroupUI) {
    constructor(id: number, node: T, children: T[]) {
        super(id, node.sessionId);
        this.depth = node.depth;
        this.containerName = node.containerName + '_GROUP';
        this.actualParent = node.actualParent;
        this.documentParent = node.documentParent;
        const length = children.length;
        let i = 0;
        while (i < length) {
            children[i++].parent = this;
        }
    }

    set containerType(value) {
        this._containerType = value;
    }
    get containerType() {
        return this._containerType;
    }
}