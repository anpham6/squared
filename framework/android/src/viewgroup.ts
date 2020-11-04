import type View from './view';

import View$MX from './view-mx';

export default class ViewGroup<T extends View> extends View$MX(squared.base.NodeGroupUI) {
    constructor(id: number, node: T, children: T[], parent?: T) {
        super(id, node.sessionId);
        this.depth = node.depth;
        this.containerName = node.containerName + '_GROUP';
        this.actualParent = node.actualParent;
        this.documentParent = node.documentParent;
        this.dir = this.actualParent!.dir;
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
            item.init(this, depth);
        }
        super.retainAs(children);
        this.setBounds();
        return this;
    }

    set containerType(value) {
        this._containerType = value;
    }
    get containerType() {
        return this._containerType;
    }
}