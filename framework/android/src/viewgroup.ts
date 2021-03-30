import type View from './view';

import View$MX from './view-mx';

export default class ViewGroup<T extends View> extends View$MX(squared.base.NodeGroupUI) {
    constructor(id: number, node: T, children: T[], parent?: T) {
        super(id, node.sessionId);
        const actualParent = node.actualParent!;
        this.containerName = node.containerName + '_GROUP';
        this.actualParent = actualParent;
        this.documentParent = node.documentParent;
        this.dir = actualParent.dir;
        this.unsafe('depth', node.depth);
        this.retainAs(children, node, parent);
    }

    public retainAs(children: T[], child?: T, parentAs?: T) {
        const depth = this.depth;
        for (let i = 0, length = children.length; i < length; ++i) {
            const item = children[i];
            const parent = item.parent;
            if (parent && !(item === child && parent === parentAs && parentAs.replaceTry({ child, replaceWith: this }))) {
                const index = parent.children.indexOf(item);
                if (index !== -1) {
                    parent.children.splice(index, 1);
                }
            }
            item.internalSelf(this, depth);
        }
        super.retainAs(children);
        this.setBounds();
        return this;
    }
}