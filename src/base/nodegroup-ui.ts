import { SiblingOptions } from '../../@types/base/node';

import NodeUI from './node-ui';

import { NODE_ALIGNMENT } from './lib/enumeration';

export default abstract class NodeGroupUI extends NodeUI {
    public init() {
        if (this.length) {
            for (const item of this.children) {
                item.parent = this;
            }
            this.setBounds();
            this.saveAsInitial();
            const actualParent = this.actualParent;
            if (actualParent) {
                this.dir = actualParent.dir;
            }
        }
    }

    public setBounds() {
        if (this.length) {
            const bounds = <BoxRectDimension> NodeUI.outerRegion(this);
            bounds.width = bounds.right - bounds.left;
            bounds.height = bounds.bottom - bounds.top;
            this._bounds = bounds;
        }
    }

    public previousSiblings(options?: SiblingOptions) {
        const node = <NodeUI> this._initial.children[0];
        return node ? node.previousSiblings(options) : [];
    }

    public nextSiblings(options?: SiblingOptions) {
        const children = this._initial.children;
        const node = <NodeUI> children[children.length - 1];
        return node ? node.nextSiblings(options) : [];
    }

    get block() {
        if (this._cached.block === undefined) {
            this._cached.block = this.some(node => node.block);
        }
        return this._cached.block;
    }

    get blockStatic() {
        if (this._cached.blockStatic === undefined) {
            const documentParent = this.documentParent;
            const value = (
                this.naturalChildren.length > 0 && this.naturalChildren[0].blockStatic ||
                this.actualWidth === documentParent.actualWidth && !this.some(node => node.plainText || node.naturalElement && node.rightAligned) ||
                this.layoutVertical && this.some(node => node.blockStatic || node.rightAligned) ||
                documentParent.blockStatic && (documentParent.layoutVertical || this.hasAlign(NODE_ALIGNMENT.COLUMN))
            );
            if (value || this.containerType !== 0) {
                this._cached.blockStatic = value;
            }
        }
        return this._cached.blockStatic || this.hasAlign(NODE_ALIGNMENT.BLOCK);
    }

    get blockDimension() {
        if (this._cached.blockDimension === undefined) {
            this._cached.blockDimension = this.some(node => node.blockDimension);
        }
        return this._cached.blockDimension;
    }

    get inline() {
        if (this._cached.inline === undefined) {
            this._cached.inline = this.every(node => node.inline);
        }
        return this._cached.inline;
    }

    get inlineStatic() {
        if (this._cached.inlineStatic === undefined) {
            this._cached.inlineStatic = this.every(node => node.inlineStatic);
        }
        return this._cached.inlineStatic;
    }

    get inlineVertical() {
        if (this._cached.inlineVertical === undefined) {
            this._cached.inlineVertical = this.every(node => node.inlineVertical);
        }
        return this._cached.inlineVertical;
    }

    get inlineFlow() {
        if (this._cached.inlineStatic === undefined) {
            this._cached.inlineStatic = this.inlineStatic || this.hasAlign(NODE_ALIGNMENT.SEGMENTED);
        }
        return this._cached.inlineStatic;
    }

    get pageFlow() {
        if (this._cached.pageFlow === undefined) {
            this._cached.pageFlow = !this.cssAny('position', 'absolute', 'fixed');
        }
        return this._cached.pageFlow;
    }

    set baseline(value) {
        this._cached.baseline = value;
    }
    get baseline() {
        if (this._cached.baseline === undefined) {
            const value = this.cssInitial('verticalAlign', true);
            this._cached.baseline = value !== '' ? value === 'baseline' : this.layoutHorizontal && this.every(node => node.baseline);
        }
        return this._cached.baseline;
    }

    get float() {
        if (this._cached.float === undefined) {
            this._cached.float = !this.floating ? 'none'
                                                : this.hasAlign(NODE_ALIGNMENT.RIGHT) ? 'right' : 'left';
        }
        return this._cached.float;
    }

    get floating() {
        if (this._cached.floating === undefined) {
            this._cached.floating = this.every(node => node.floating);
        }
        return this._cached.floating;
    }

    get display() {
        return (
            super.display ||
            this.some(node => node.blockStatic) ? 'block'
                                                : this.blockDimension ? 'inline-block' : 'inline'
        );
    }

    get firstChild() {
        return this.children[0] || null;
    }

    get lastChild() {
        const children = this.children;
        return children[children.length - 1] || null;
    }

    get tagName() {
        return '';
    }

    get plainText() {
        return false;
    }

    get styleText() {
        return false;
    }

    get multiline() {
        return false;
    }

    get nodeGroup() {
        return true;
    }

    get naturalChild() {
        return false;
    }

    get naturalElement() {
        return false;
    }

    get pseudoElement() {
        return false;
    }

    get previousSibling() {
        return null;
    }

    get nextSibling() {
        return null;
    }

    get previousElementSibling() {
        return null;
    }

    get nextElementSibling() {
        return null;
    }
}