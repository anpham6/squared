import View from './view';
import View$Base from './view-base';

export default class ViewGroup<T extends View> extends View$Base(squared.base.NodeGroup) {
    constructor(
        id: number,
        node: T,
        children: T[],
        afterInit?: BindGeneric<T, void>)
    {
        super(id, undefined, afterInit);
        this.tagName = `${node.tagName}_GROUP`;
        this.documentParent = node.documentParent;
        this.retain(children);
    }
}