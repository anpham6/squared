import { SiblingOptions } from '../../@types/base/node';

import NodeUI from './node-ui';

import { NODE_ALIGNMENT } from './lib/enumeration';

const { isLength } = squared.lib.css;

export default abstract class NodeGroupUI extends NodeUI {
    public init() {
        if (this.length) {
            for (const item of this.children) {
                item.parent = this;
            }
            this.setBounds();
            this.saveAsInitial();
            this.dir = this.actualParent?.dir || '';
        }
    }

    public setBounds() {
        if (this.length) {
            this._bounds = NodeUI.outerRegion(this);
        }
    }

    public previousSiblings(options?: SiblingOptions) {
        const node = <NodeUI> (this._initial?.children || this.children)[0];
        return node?.previousSiblings(options) || [];
    }

    public nextSiblings(options?: SiblingOptions) {
        const children = this._initial?.children || this.children;
        const node = <NodeUI> children[children.length - 1];
        return node?.nextSiblings(options) || [];
    }

    get block() {
        let result = this._cached.block;
        if (result === undefined) {
            result = this.some(node => node.block);
            this._cached.block = result;
        }
        return result;
    }

    get blockStatic() {
        let result = this._cached.blockStatic;
        if (this._cached.blockStatic === undefined) {
            const documentParent = this.actualParent || this.documentParent;
            result = (
                this.naturalChildren.length > 0 && this.naturalChildren[0].blockStatic ||
                this.actualWidth === documentParent.actualWidth && !this.some(node => node.plainText || node.naturalElement && node.rightAligned) ||
                this.layoutVertical && this.some(node => node.blockStatic || node.rightAligned) ||
                documentParent.blockStatic && (documentParent.layoutVertical || this.hasAlign(NODE_ALIGNMENT.COLUMN))
            );
            if (result || this.containerType !== 0) {
                this._cached.blockStatic = result;
            }
        }
        return result || this.hasAlign(NODE_ALIGNMENT.BLOCK);
    }

    get blockDimension() {
        let result = this._cached.blockDimension;
        if (result === undefined) {
            result = this.some(node => node.blockDimension);
            this._cached.blockDimension = result;
        }
        return result;
    }

    get inline() {
        let result = this._cached.inline;
        if (result === undefined) {
            result = this.every(node => node.inline);
            this._cached.inline = result;
        }
        return result;
    }

    get inlineStatic() {
        let result = this._cached.inlineStatic;
        if (result === undefined) {
            result = this.every(node => node.inlineStatic);
            this._cached.inlineStatic = result;
        }
        return result;
    }

    get inlineVertical() {
        let result = this._cached.inlineVertical;
        if (result === undefined) {
            result = this.every(node => node.inlineVertical);
            this._cached.inlineVertical = result;
        }
        return result;
    }

    get inlineFlow() {
        let result = this._cached.inlineStatic;
        if (result === undefined) {
            result = this.inlineStatic || this.hasAlign(NODE_ALIGNMENT.SEGMENTED);
            this._cached.inlineStatic = result;
        }
        return result;
    }

    get pageFlow() {
        let result = this._cached.pageFlow;
        if (result === undefined) {
            const value = this.css('position');
            result = value !== 'absolute' && value !== 'fixed';
            this._cached.pageFlow = result;
        }
        return result;
    }

    set baseline(value) {
        this._cached.baseline = value;
    }
    get baseline() {
        let result = this._cached.baseline;
        if (result === undefined) {
            const value = this.cssInitial('verticalAlign', true);
            if (value === '') {
                result = this.every((node: NodeUI) => node.baseline);
            }
            else {
                result = value === 'baseline' || isLength(value, true);
            }
            this._cached.baseline = result;
        }
        return result;
    }

    get float() {
        let result = this._cached.float;
        if (result === undefined) {
            result = !this.floating ? 'none' : (this.hasAlign(NODE_ALIGNMENT.RIGHT) ? 'right' : 'left');
            this._cached.float = result;
        }
        return result;
    }

    get floating() {
        let result = this._cached.floating;
        if (result === undefined) {
            result = this.every(node => node.floating);
            this._cached.floating = result;
        }
        return result;
    }

    get display() {
        return super.display || (this.some(node => node.blockStatic) ? 'block' : (this.blockDimension ? 'inline-block' : 'inline'));
    }

    get firstChild() {
        return this.children[0] || null;
    }

    get lastChild() {
        const children = this.children;
        return children[children.length - 1] || null;
    }

    set childIndex(value) {
        super.childIndex = value;
    }
    get childIndex() {
        let result = super.childIndex;
        if (result === Number.POSITIVE_INFINITY) {
            for (const node of this) {
                result = Math.min(node.childIndex, result);
            }
            super.childIndex = result;
        }
        return result;
    }

    set containerIndex(value) {
        super.containerIndex = value;
    }
    get containerIndex() {
        let result = super.containerIndex;
        if (result === Number.POSITIVE_INFINITY) {
            for (const node of this) {
                result = Math.min((<NodeUI> node).containerIndex, result);
            }
            super.containerIndex = result;
        }
        return result;
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