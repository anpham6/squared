import NodeUI from './node-ui';

import { NODE_ALIGNMENT } from './lib/enumeration';

const { hasCoords } = squared.lib.css;

export default abstract class NodeGroupUI extends NodeUI {
    public setBounds() {
        if (this.length > 0) {
            this._bounds = NodeUI.outerRegion(this);
            return this._bounds;
        }
        return undefined;
    }

    public previousSiblings(options?: SiblingOptions) {
        let node = this as NodeUI;
        do {
            node = node.item(0) as NodeUI;
        }
        while (node && node.nodeGroup);
        return node ? node.previousSiblings(options) : [];
    }

    public nextSiblings(options?: SiblingOptions) {
        let node = this as NodeUI;
        do {
            node = node.item(-1) as NodeUI;
        }
        while (node && node.nodeGroup);
        return node ? node.nextSiblings(options) : [];
    }

    get inline() {
        if (this.hasAlign(NODE_ALIGNMENT.BLOCK)) {
            return false;
        }
        const result = this._cached.inline;
        return result === undefined ? this._cached.inline = this.every(node => node.inline) : result;
    }

    get inlineStatic() {
        if (this.hasAlign(NODE_ALIGNMENT.BLOCK)) {
            return false;
        }
        const result = this._cached.inlineStatic;
        return result === undefined ? this._cached.inlineStatic = this.every(node => node.inlineStatic) : result;
    }

    get inlineVertical() {
        if (this.hasAlign(NODE_ALIGNMENT.BLOCK)) {
            return false;
        }
        const result = this._cached.inlineVertical;
        return result === undefined ? this._cached.inlineVertical = this.every((node: NodeUI) => node.inlineVertical) : result;
    }

    get inlineFlow() {
        if (this.hasAlign(NODE_ALIGNMENT.BLOCK)) {
            return false;
        }
        const result = this._cached.inlineFlow;
        return result === undefined ? this._cached.inlineFlow = this.every((node: NodeUI) => node.inlineFlow) : result;
    }

    get inlineDimension() {
        if (this.hasAlign(NODE_ALIGNMENT.BLOCK)) {
            return false;
        }
        const result = this._cached.inlineDimension;
        return result === undefined ? this._cached.inlineDimension = this.every((node: NodeUI) => node.inlineDimension) : result;
    }

    get block() {
        if (this.hasAlign(NODE_ALIGNMENT.BLOCK)) {
            return true;
        }
        const result = this._cached.block;
        return result === undefined ? this._cached.block = this.some(node => node.block) : result;
    }

    get blockStatic() {
        if (this.hasAlign(NODE_ALIGNMENT.BLOCK)) {
            return true;
        }
        let result = this._cached.blockStatic;
        if (result === undefined) {
            const documentParent = this.actualParent || this.documentParent;
            result =
                documentParent.blockStatic && (documentParent.layoutVertical || this.hasAlign(NODE_ALIGNMENT.COLUMN)) ||
                this.layoutVertical && (documentParent.hasWidth || this.some(node => node.centerAligned || node.rightAligned)) ||
                this.some(node => node.blockStatic || node.percentWidth > 0) ||
                documentParent.percentWidth > 0;
            if (result || this.containerType !== 0) {
                this._cached.blockStatic = result;
            }
        }
        return result;
    }

    get blockDimension() {
        const result = this._cached.blockDimension;
        return result === undefined ? this._cached.blockDimension = this.every((node: NodeUI) => node.blockDimension) : result;
    }

    get blockVertical() {
        const result = this._cached.blockVertical;
        return result === undefined ? this._cached.blockVertical = this.every((node: NodeUI) => node.blockVertical) : result;
    }

    get pageFlow() {
        const result = this._cached.pageFlow;
        return result === undefined ? this._cached.pageFlow = !hasCoords(this.css('position')) : result;
    }

    set baseline(value) {
        this._cached.baseline = value;
    }
    get baseline() {
        const result = this._cached.baseline;
        return result === undefined ? this._cached.baseline = this.every((node: NodeUI) => node.baselineElement) : result;
    }

    get float() {
        const result = this._cached.float;
        return result === undefined ? this._cached.float = !this.floating ? 'none' : this.hasAlign(NODE_ALIGNMENT.RIGHT) ? 'right' : 'left' : result;
    }

    get floating() {
        const result = this._cached.floating;
        return result === undefined ? this._cached.floating = this.hasAlign(NODE_ALIGNMENT.FLOAT) || this.every((node: NodeUI) => node.floating) : result;
    }

    get display() {
        return super.display || this.firstChild?.blockStatic ? 'block' : this.blockDimension ? 'inline-block' : 'inline';
    }

    get firstChild() {
        return this.item(0) as NodeUI || null;
    }

    get lastChild() {
        return this.item(-1) as NodeUI || null;
    }

    set childIndex(value) {
        super.childIndex = value;
    }
    get childIndex() {
        let result = super.childIndex;
        if (result === Infinity) {
            this.each(node => result = Math.min(node.childIndex, result));
            super.childIndex = result;
        }
        return result;
    }

    get centerAligned() {
        const result = this._cached.centerAligned;
        return result === undefined ? this._cached.centerAligned = this.every(node => node.centerAligned) : result;
    }

    get rightAligned() {
        if (this.hasAlign(NODE_ALIGNMENT.RIGHT)) {
            return true;
        }
        const result = this._cached.rightAligned;
        return result === undefined ? this._cached.rightAligned = this.every(node => node.rightAligned) : result;
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

    set inlineText(value) {}
    get inlineText() {
        return false;
    }

    set multiline(value) {}
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