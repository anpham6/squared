import NODE_ALIGNMENT = squared.base.NODE_ALIGNMENT;

import NodeUI from './node-ui';

const { hasCoords } = squared.lib.css;

export default abstract class NodeGroupUI extends NodeUI {
    public setBounds() {
        return !this.isEmpty() ? this._bounds = this.outerRegion : null;
    }

    public previousSiblings(options?: TraverseSiblingsOptions) {
        let node = this as NodeUI;
        do {
            node = node.item(0) as NodeUI;
        }
        while (node && node.nodeGroup);
        return node ? node.previousSiblings(options) : [];
    }

    public nextSiblings(options?: TraverseSiblingsOptions) {
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
        const result = this._cache.inline;
        return result === undefined ? this._cache.inline = this.every(node => node.inline) : result;
    }

    get inlineStatic() {
        if (this.hasAlign(NODE_ALIGNMENT.BLOCK)) {
            return false;
        }
        const result = this._cache.inlineStatic;
        return result === undefined ? this._cache.inlineStatic = this.every(node => node.inlineStatic) : result;
    }

    get inlineVertical() {
        if (this.hasAlign(NODE_ALIGNMENT.BLOCK)) {
            return false;
        }
        const result = this._cache.inlineVertical;
        return result === undefined ? this._cache.inlineVertical = this.every((node: NodeUI) => node.inlineVertical) : result;
    }

    get inlineFlow() {
        if (this.hasAlign(NODE_ALIGNMENT.BLOCK)) {
            return false;
        }
        const result = this._cache.inlineFlow;
        return result === undefined ? this._cache.inlineFlow = this.every((node: NodeUI) => node.inlineFlow) : result;
    }

    get inlineDimension() {
        if (this.hasAlign(NODE_ALIGNMENT.BLOCK)) {
            return false;
        }
        const result = this._cache.inlineDimension;
        return result === undefined ? this._cache.inlineDimension = this.every((node: NodeUI) => node.inlineDimension) : result;
    }

    get block() {
        if (this.hasAlign(NODE_ALIGNMENT.BLOCK)) {
            return true;
        }
        const result = this._cache.block;
        return result === undefined ? this._cache.block = !!this.find(node => node.block) : result;
    }

    get blockStatic() {
        if (this.hasAlign(NODE_ALIGNMENT.BLOCK)) {
            return true;
        }
        let result = this._cache.blockStatic;
        if (result === undefined) {
            const parent = this.actualParent || this.documentParent;
            result = parent.blockStatic && (parent.layoutVertical || this.hasAlign(NODE_ALIGNMENT.COLUMN)) ||
                parent.percentWidth > 0 ||
                this.layoutVertical && (parent.hasWidth || !!this.find(node => node.centerAligned || node.rightAligned)) ||
                !!this.find(node => node.blockStatic && !node.hasWidth || node.percentWidth > 0);
            if (result || this.containerType !== 0) {
                this._cache.blockStatic = result;
            }
        }
        return result;
    }

    get blockDimension() {
        const result = this._cache.blockDimension;
        return result === undefined ? this._cache.blockDimension = this.every((node: NodeUI) => node.blockDimension) : result;
    }

    get blockVertical() {
        const result = this._cache.blockVertical;
        return result === undefined ? this._cache.blockVertical = this.every((node: NodeUI) => node.blockVertical) : result;
    }

    get pageFlow() {
        const result = this._cache.pageFlow;
        return result === undefined ? this._cache.pageFlow = !hasCoords(this.css('position')) : result;
    }

    set baseline(value) {
        this._cache.baseline = value;
    }
    get baseline() {
        const result = this._cache.baseline;
        return result === undefined ? this._cache.baseline = this.every((node: NodeUI) => node.baselineElement) : result;
    }

    get float() {
        const result = this._cache.float;
        return result === undefined ? this._cache.float = !this.floating ? 'none' : this.hasAlign(NODE_ALIGNMENT.RIGHT) ? 'right' : 'left' : result;
    }

    get floating() {
        const result = this._cache.floating;
        return result === undefined ? this._cache.floating = this.hasAlign(NODE_ALIGNMENT.FLOAT) || this.every((node: NodeUI) => node.floating) : result;
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
        const result = this._cache.centerAligned;
        return result === undefined ? this._cache.centerAligned = this.every(node => node.centerAligned) : result;
    }

    get rightAligned() {
        if (this.hasAlign(NODE_ALIGNMENT.RIGHT)) {
            return true;
        }
        const result = this._cache.rightAligned;
        return result === undefined ? this._cache.rightAligned = this.every(node => node.rightAligned) : result;
    }

    set inlineText(value) {}
    get inlineText() { return false; }

    set multiline(value) {}
    get multiline() { return false; }

    get tagName() { return ''; }

    get plainText() { return false; }

    get styleText() { return false; }

    get nodeGroup() { return true; }

    get naturalChild() { return false; }

    get naturalElement() { return false; }

    get pseudoElement() { return false; }

    get previousSibling() { return null; }

    get nextSibling() { return null; }

    get previousElementSibling() { return null; }

    get nextElementSibling() { return null; }
}