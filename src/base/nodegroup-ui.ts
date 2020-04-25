import { SiblingOptions } from '../../@types/base/node';

import NodeUI from './node-ui';

import { NODE_ALIGNMENT } from './lib/enumeration';

const { isLength } = squared.lib.css;

export default abstract class NodeGroupUI extends NodeUI {
    public init() {
        if (this.length) {
            this.each(item => item.parent = this);
            this.setBounds();
            this.saveAsInitial();
            this.dir = this.actualParent?.dir || '';
        }
    }

    public setBounds() {
        if (this.length) {
            this._bounds = NodeUI.outerRegion(this);
            return this._bounds;
        }
        return undefined;
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
        if (result === undefined) {
            const documentParent = this.actualParent || this.documentParent;
            result = (
                this.some(node => node.blockStatic || node.percentWidth > 0) ||
                documentParent.percentWidth > 0 ||
                this.layoutVertical && (documentParent.hasWidth || this.some(node => node.centerAligned || node.rightAligned)) ||
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
            result = this.every(node => node.blockDimension);
            this._cached.blockDimension = result;
        }
        return result;
    }

    get blockVertical() {
        let result = this._cached.blockVertical;
        if (result === undefined) {
            result = this.every(node => node.blockVertical);
            this._cached.blockVertical = result;
        }
        return result;
    }

    get inline() {
        let result = this._cached.inline;
        if (result === undefined) {
            result = this.every(node => node.inline);
            this._cached.inline = result;
        }
        return result && !this.hasAlign(NODE_ALIGNMENT.BLOCK);
    }

    get inlineStatic() {
        let result = this._cached.inlineStatic;
        if (result === undefined) {
            result = this.every(node => node.inlineStatic);
            this._cached.inlineStatic = result;
        }
        return result && !this.hasAlign(NODE_ALIGNMENT.BLOCK);
    }

    get inlineVertical() {
        let result = this._cached.inlineVertical;
        if (result === undefined) {
            result = this.every(node => node.inlineVertical);
            this._cached.inlineVertical = result;
        }
        return result && !this.hasAlign(NODE_ALIGNMENT.BLOCK);
    }

    get inlineFlow() {
        let result = this._cached.inlineFlow;
        if (result === undefined) {
            result = this.every(node => node.inlineFlow);
            this._cached.inlineFlow = result;
        }
        return result && !this.hasAlign(NODE_ALIGNMENT.BLOCK);
    }

    get inlineDimension() {
        let result = this._cached.inlineDimension;
        if (result === undefined) {
            result = this.every(node => node.inlineDimension);
            this._cached.inlineDimension = result;
        }
        return result && !this.hasAlign(NODE_ALIGNMENT.BLOCK);
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
            if (this.floating) {
                if (this.hasAlign(NODE_ALIGNMENT.RIGHT)) {
                    result = 'right';
                }
                else if (this.every(node => node.float === 'right')) {
                    this.addAlign(NODE_ALIGNMENT.RIGHT);
                    result = 'right';
                }
                else {
                    result = 'left';
                }
            }
            else {
                result = 'none';
            }
            this._cached.float = result;
        }
        return result;
    }

    get floating() {
        let result = this._cached.floating;
        if (result === undefined) {
            result = this.every((node: NodeUI) => node.floating || node.hasAlign(NODE_ALIGNMENT.FLOAT));
            this._cached.floating = result;
        }
        return result;
    }

    get display() {
        return super.display || (this.some(node => node.blockStatic) ? 'block' : (this.blockDimension ? 'inline-block' : 'inline'));
    }

    get firstChild() {
        return <NodeUI> this.children[0] || null;
    }

    get lastChild() {
        const children = this.children;
        return <NodeUI> children[children.length - 1] || null;
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
            this.each(node => result = Math.min((<NodeUI> node).containerIndex, result));
            super.containerIndex = result;
        }
        return result;
    }

    get centerAligned() {
        let result = this._cached.centerAligned;
        if (result === undefined) {
            result = this.every(node => node.centerAligned);
            this._cached.centerAligned = result;
        }
        return result;
    }

    get rightAligned() {
        let result = this._cached.rightAligned;
        if (result === undefined) {
            result = this.every(node => node.rightAligned);
            this._cached.rightAligned = result;
        }
        return result || this.hasAlign(NODE_ALIGNMENT.RIGHT);
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