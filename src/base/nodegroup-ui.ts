import { SiblingOptions } from './@types/node';

import NodeUI from './node-ui';

import { NODE_ALIGNMENT } from './lib/enumeration';

const $const = squared.lib.constant;

export default abstract class NodeGroupUI extends NodeUI {
    public init() {
        if (this.length) {
            let siblingIndex = Number.POSITIVE_INFINITY;
            for (const item of this.children) {
                siblingIndex = Math.min(siblingIndex, item.siblingIndex);
                item.parent = this;
            }
            if (this.siblingIndex === Number.POSITIVE_INFINITY) {
                this.siblingIndex = siblingIndex;
            }
            if (this.parent) {
                this.parent.sort(NodeUI.siblingIndex);
            }
            this.setBounds();
            this.saveAsInitial();
            if (this.actualParent) {
                this.dir = this.actualParent.dir;
            }
        }
    }

    public setBounds() {
        if (this.length) {
            const bounds = NodeUI.outerRegion(this);
            this._bounds = {
                ...bounds,
                width: bounds.right - bounds.left,
                height: bounds.bottom - bounds.top
            };
        }
    }

    public previousSiblings(options?: SiblingOptions) {
        const node = this.item(0) as NodeUI;
        return node ? node.previousSiblings(options) : [];
    }

    public nextSiblings(options?: SiblingOptions) {
        const node = this.item() as NodeUI;
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
            const value = (
                this.actualChildren.length && this.actualChildren[0].blockStatic ||
                this.actualWidth === this.documentParent.actualWidth && !this.some(node => node.plainText || node.naturalElement && node.rightAligned) ||
                this.layoutVertical && this.some(node => node.naturalElement && node.blockStatic) ||
                this.documentParent.blockStatic && this.hasAlign(NODE_ALIGNMENT.COLUMN)
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
        super.baseline = value;
    }
    get baseline() {
        if (this._cached.baseline === undefined) {
            const value = this.cssInitial('verticalAlign', true);
            this._cached.baseline = value !== '' ? value === 'baseline'
                                                 : this.layoutHorizontal && this.every(node => node.baseline);
        }
        return this._cached.baseline;
    }

    get float() {
        if (this._cached.float === undefined) {
            this._cached.float = !this.floating ? $const.CSS.NONE
                                                : this.hasAlign(NODE_ALIGNMENT.RIGHT) ? $const.CSS.RIGHT : $const.CSS.LEFT;
        }
        return this._cached.float;
    }

    get floating() {
        if (this._cached.floating === undefined) {
            this._cached.floating = this.every(node => node.naturalElement && node.floating);
        }
        return this._cached.floating;
    }

    get display() {
        return (
            this.css('display') ||
            this.some(node => node.blockStatic) ? 'block'
                                                : this.some(node => node.blockDimension || node.inlineVertical) ? 'inline-block' : 'inline'
        );
    }

    get actualParent() {
        if (this._cached.actualParent === undefined) {
            this._cached.actualParent = NodeUI.actualParent(this._initial.children as NodeUI[]);
        }
        return this._cached.actualParent;
    }

    get groupParent() {
        return true;
    }

    get tagName() {
        return '';
    }

    get plainText() {
        return false;
    }

    get multiline() {
        return false;
    }
}