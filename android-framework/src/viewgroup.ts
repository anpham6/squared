import View$MX from './view-mx';
import View from './view';

export default class ViewGroup<T extends View> extends View$MX(squared.base.NodeGroup) {
    constructor(
        id: number,
        node: T,
        children: T[],
        afterInit?: BindGeneric<T, void>)
    {
        super(id, node.sessionId, undefined, afterInit);
        this.depth = node.depth;
        this.tagName = `${node.tagName}_GROUP`;
        this.documentParent = node.documentParent;
        this.retain(children);
    }
}