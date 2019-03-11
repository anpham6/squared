import Node from './node';
import NodeList from './nodelist';

import { NODE_ALIGNMENT } from './lib/enumeration';

const $dom = squared.lib.dom;

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
            const actualParent = this.actualParent;
            if (actualParent) {
                this.css('direction', actualParent.dir);
            }
            this.saveAsInitial();
        }
    }

    public setBounds() {
        if (this.length) {
            const bounds = this.outerRegion;
            this._bounds = {
                ...bounds,
                width: bounds.right - bounds.left,
                height: bounds.bottom - bounds.top
            };
        }
    }

    public previousSiblings(lineBreak = true, excluded = true, height = false) {
        const node = this.item(0);
        return node ? node.previousSiblings(lineBreak, excluded, height) : [];
    }

    public nextSiblings(lineBreak = true, excluded = true, height = false) {
        const node = this.item();
        return node ? node.nextSiblings(lineBreak, excluded, height) : [];
    }

    get actualParent() {
        return NodeList.actualParent(this._initial.children);
    }

    get firstChild() {
        const actualParent = this.actualParent;
        if (actualParent) {
            const element = actualParent.element;
            if (element) {
                for (let i = 0; i < element.childNodes.length; i++) {
                    const node = $dom.getElementAsNode<Node>(<Element> element.childNodes[i]);
                    if (node && this.nodes.includes(node)) {
                        return node;
                    }
                }
            }
        }
        if (this._initial.children.length) {
            return this._initial.children[0];
        }
        return undefined;
    }

    get lastChild() {
        const actualParent = this.actualParent;
        if (actualParent && actualParent.element) {
            const element = actualParent.element;
            if (element) {
                for (let i = element.childNodes.length - 1; i >= 0; i--) {
                    const node = $dom.getElementAsNode<Node>(<Element> element.childNodes[i]);
                    if (node && this.nodes.includes(node)) {
                        return node;
                    }
                }
            }
        }
        if (this._initial.children.length) {
            return this._initial.children[this._initial.children.length - 1];
        }
        return undefined;
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
        return this.some(node => node.blockStatic);
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
            this.some(node => node.block) ? 'block' : (this.some(node => node.blockDimension) ? 'inline-block' : 'inline')
        );
    }

    get groupParent() {
        return true;
    }

    private get outerRegion(): BoxRect {
        const nodes = this.children.slice(0);
        let top = nodes[0];
        let right = top;
        let bottom = top;
        let left = top;
        this.each(node => node.companion && !node.companion.visible && nodes.push(node.companion));
        for (let i = 1; i < nodes.length; i++) {
            const node = nodes[i];
            if (node.linear.top < top.linear.top) {
                top = node;
            }
            if (node.linear.right > right.linear.right) {
                right = node;
            }
            if (node.linear.bottom > bottom.linear.bottom) {
                bottom = node;
            }
            if (node.linear.left < left.linear.left) {
                left = node;
            }
        }
        return {
            top: top.linear.top,
            right: right.linear.right,
            bottom: bottom.linear.bottom,
            left: left.linear.left
        };
    }
}