import { SiblingDirection } from './@types/node';

import Node from './node';
import NodeList from './nodelist';

import { NODE_ALIGNMENT } from './lib/enumeration';

export default abstract class NodeGroup extends Node {
    public init() {
        if (this.length) {
            let siblingIndex = Number.POSITIVE_INFINITY;
            for (const item of this) {
                siblingIndex = Math.min(siblingIndex, item.siblingIndex);
                item.parent = this;
            }
            if (this.siblingIndex === Number.POSITIVE_INFINITY) {
                this.siblingIndex = siblingIndex;
            }
            if (this.parent) {
                this.parent.sort(NodeList.siblingIndex);
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
            const bounds = NodeList.outerRegion(this);
            this._bounds = {
                ...bounds,
                width: bounds.right - bounds.left,
                height: bounds.bottom - bounds.top
            };
        }
    }

    public previousSiblings(options: SiblingDirection = {}) {
        const node = this.item(0);
        return node ? node.previousSiblings(options) : [];
    }

    public nextSiblings(options: SiblingDirection = {}) {
        const node = this.item();
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
            const value = this.actualChildren.length && this.actualChildren[0].blockStatic || this.actualWidth === this.documentParent.actualWidth || this.hasAlign(NODE_ALIGNMENT.BLOCK) || this.layoutVertical && this.some(node => node.blockStatic) || this.documentParent.blockStatic && this.hasAlign(NODE_ALIGNMENT.COLUMN);
            if (!value && this.containerType === 0) {
                return false;
            }
            this._cached.blockStatic = value;
        }
        return this._cached.blockStatic;
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
            this._cached.inlineStatic = this.hasAlign(NODE_ALIGNMENT.SEGMENTED) || this.inlineStatic;
        }
        return this._cached.inlineStatic;
    }

    get pageFlow() {
        if (this._cached.pageFlow === undefined) {
            this._cached.pageFlow = this.every(node => node.pageFlow);
        }
        return this._cached.pageFlow;
    }

    get baseline() {
        if (this._cached.baseline === undefined) {
            const value = this.cssInitial('verticalAlign', true);
            if (value !== '') {
                this._cached.baseline = value === 'baseline';
            }
            else {
                this._cached.baseline = this.every(node => node.baseline);
            }
        }
        return this._cached.baseline;
    }

    get float() {
        if (this._cached.float === undefined) {
            if (this.floating) {
                this._cached.float = this.hasAlign(NODE_ALIGNMENT.RIGHT) ? 'right' : 'left';
            }
            else {
                this._cached.float = 'none';
            }
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
            this._cached.actualParent = NodeList.actualParent(this._initial.children);
        }
        return this._cached.actualParent;
    }

    get groupParent() {
        return true;
    }

    get multiline() {
        return false;
    }
}