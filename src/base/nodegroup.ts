import Node from './node';
import NodeList from './nodelist';

import { NODE_ALIGNMENT } from './lib/enumeration';

export default abstract class NodeGroup extends Node {
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
                this.parent.sort(NodeList.siblingIndex);
            }
            this.setBounds();
            this.saveAsInitial();
            const actualParent = this.actualParent;
            if (actualParent) {
                this.css('direction', actualParent.dir);
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

    public previousSiblings(floating = true, pageFlow = true, lineBreak = true, excluded = true) {
        const node = this.item(0);
        return node ? node.previousSiblings(floating, pageFlow, lineBreak, excluded) : [];
    }

    public nextSiblings(floating = true, pageFlow = true, lineBreak = true, excluded = true) {
        const node = this.item();
        return node ? node.nextSiblings(floating, pageFlow, lineBreak, excluded) : [];
    }

    get actualParent() {
        return NodeList.actualParent(this._initial.children);
    }

    get inline() {
        return this.every(node => node.inline);
    }

    get pageFlow() {
        return this.every(node => node.pageFlow);
    }

    get inlineFlow() {
        return this.inlineStatic || this.hasAlign(NODE_ALIGNMENT.SEGMENTED);
    }

    get inlineStatic() {
        return this.every(node => node.inlineStatic);
    }

    get inlineVertical() {
        return this.every(node => node.inlineVertical);
    }

    get block() {
        return this.some(node => node.block);
    }

    get blockStatic() {
        return this.hasAlign(NODE_ALIGNMENT.BLOCK) || this.layoutVertical && this.some(node => node.blockStatic) || this.documentParent.blockStatic && this.hasAlign(NODE_ALIGNMENT.COLUMN);
    }

    get blockDimension() {
        return this.some(node => node.blockDimension);
    }

    get floating() {
        return this.every(node => node.floating);
    }

    get float() {
        if (this.floating) {
            return this.hasAlign(NODE_ALIGNMENT.RIGHT) ? 'right' : 'left';
        }
        return 'none';
    }

    get baseline() {
        const value = this.cssInitial('verticalAlign', true);
        return value !== '' ? value === 'baseline' : this.every(node => node.baseline);
    }

    get multiline() {
        return this.some(node => node.multiline);
    }

    get display() {
        return (
            this.css('display') ||
            this.some(node => node.block) ? 'block' : (this.some(node => node.blockDimension || node.inlineVertical) ? 'inline-block' : 'inline')
        );
    }

    get groupParent() {
        return true;
    }
}