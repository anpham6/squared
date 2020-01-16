import { CONTAINER_NODE } from '../../lib/enumeration';

import View from '../../view';

import LayoutUI = squared.base.LayoutUI;

const { BOX_STANDARD, NODE_ALIGNMENT, NODE_RESOURCE } = squared.base.lib.enumeration;

const isJustified = (node: View) => (node.blockStatic || node.hasWidth) && /center|end|right$/.test(node.css('justifyContent'));
const isAligned = (node: View) => node.hasHeight && /center|end$/.test(node.css('alignContent'));

export default class Grid<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return node.gridElement;
    }

    public condition(node: T) {
        return isJustified(node) || isAligned(node);
    }

    public processNode(node: T, parent: T) {
        const container = (<android.base.Controller<T>> this.controller).createNodeWrapper(node, parent, undefined, {
            controlName: View.getControlName(CONTAINER_NODE.CONSTRAINT, node.api),
            containerType: CONTAINER_NODE.CONSTRAINT,
            resource: NODE_RESOURCE.ASSET
        });
        container.inherit(node, 'base', 'initial', 'styleMap', 'boxStyle');
        if (isJustified(node)) {
            node.setLayoutWidth('wrap_content');
        }
        else {
            container.setLayoutWidth(node.blockStatic ? 'match_parent' : 'wrap_content');
        }
        if (isAligned(node)) {
            node.setLayoutHeight('wrap_content');
        }
        else {
            container.setLayoutHeight('wrap_content');
        }
        node.css('backgroundColor', 'transparent');
        node.setCacheValue('backgroundColor', '');
        node.css('backgroundImage', 'none');
        node.setCacheValue('backgroundImage', '');
        node.resetBox(BOX_STANDARD.MARGIN | BOX_STANDARD.PADDING, container);
        const visibleStyle = node.visibleStyle;
        visibleStyle.background = false;
        visibleStyle.backgroundImage = false;
        visibleStyle.backgroundColor = false;
        visibleStyle.borderWidth = false;
        return {
            parent: container,
            renderAs: container,
            outputAs: this.application.renderNode(
                new LayoutUI(
                    parent,
                    container,
                    CONTAINER_NODE.CONSTRAINT,
                    NODE_ALIGNMENT.SINGLE,
                    container.children as T[]
                )
            ),
            include: true
        };
    }
}