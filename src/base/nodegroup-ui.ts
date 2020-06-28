import NodeUI from './node-ui';

import { NODE_ALIGNMENT } from './lib/enumeration';

const { hasCoords, isLength } = squared.lib.css;

export default abstract class NodeGroupUI extends NodeUI {
    public init() {
        if (this.length > 0) {
            this.setBounds();
            this.saveAsInitial();
        }
        this.dir = this.actualParent?.dir || '';
    }

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
        while (node?.nodeGroup);
        return node?.previousSiblings(options) || [];
    }

    public nextSiblings(options?: SiblingOptions) {
        let node = this as NodeUI;
        do {
            node = node.item() as NodeUI;
        }
        while (node?.nodeGroup);
        return node?.nextSiblings(options) || [];
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
                this.some(node => node.blockStatic || node.percentWidth > 0) ||
                this.layoutVertical && (documentParent.hasWidth || this.some(node => node.centerAligned || node.rightAligned)) ||
                documentParent.percentWidth > 0 ||
                documentParent.blockStatic && (documentParent.layoutVertical || this.hasAlign(NODE_ALIGNMENT.COLUMN));
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
        let result = this._cached.baseline;
        if (result === undefined) {
            if (this.some((node: NodeUI) => node.floating || node.hasAlign(NODE_ALIGNMENT.FLOAT))) {
                result = false;
            }
            else {
                const value = this.css('verticalAlign');
                result = value === ''
                    ? this.every((node: NodeUI) => node.baseline)
                    : value === 'baseline' || isLength(value, true);
            }
            this._cached.baseline = result;
        }
        return result;
    }

    get float() {
        if (!this.floating) {
            return 'none';
        }
        else if (this.hasAlign(NODE_ALIGNMENT.RIGHT)) {
            return 'right';
        }
        else if (this.every(node => node.float === 'right')) {
            this.addAlign(NODE_ALIGNMENT.RIGHT);
            return 'right';
        }
        return 'left';
    }

    get floating() {
        return this.every((node: NodeUI) => node.floating || node.hasAlign(NODE_ALIGNMENT.FLOAT));
    }

    get display() {
        return super.display || (
            this.some(node => node.blockStatic)
                ? 'block'
                : this.blockDimension
                    ? 'inline-block'
                    : 'inline'
        );
    }

    get firstChild() {
        return this.children[0] as NodeUI || null;
    }

    get lastChild() {
        const children = this.children;
        return children[children.length - 1] as NodeUI || null;
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

    set containerIndex(value) {
        super.containerIndex = value;
    }
    get containerIndex() {
        let result = super.containerIndex;
        if (result === Infinity) {
            this.each((node: NodeUI) => result = Math.min(node.containerIndex, result));
            super.containerIndex = result;
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