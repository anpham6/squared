import { CONTAINER_NODE } from '../../lib/enumeration';

import View from '../../view';

import $LayoutUI = squared.base.LayoutUI;

const { NODE_ALIGNMENT } = squared.base.lib.enumeration;

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
        const container = (<android.base.Controller<T>> this.controller).createNodeWrapper(node, parent, undefined, View.getControlName(CONTAINER_NODE.CONSTRAINT, node.api), CONTAINER_NODE.CONSTRAINT);
        container.inherit(node, 'base', 'initial', 'styleMap');
        if (isJustified(node)) {
            node.setLayoutWidth('wrap_content');
            node.cssApply({
                width: 'auto',
                minWidth: 'auto'
            }, true);
        }
        else {
            container.setLayoutWidth('wrap_content');
        }
        if (isAligned(node)) {
            node.setLayoutHeight('wrap_content');
            node.cssApply({
                height: 'auto',
                minHeight: 'auto'
            }, true);
        }
        else {
            container.setLayoutHeight('wrap_content');
        }
        node.css('backgroundColor', 'transparent');
        node.setCacheValue('backgroundColor', '');
        node.css('backgroundImage', 'none');
        node.setCacheValue('backgroundImage', '');
        const visibleStyle = node.visibleStyle;
        visibleStyle.background = false;
        visibleStyle.backgroundImage = false;
        visibleStyle.backgroundColor = false;
        visibleStyle.borderWidth = false;
        return {
            parent: container,
            renderAs: container,
            outputAs: this.application.renderNode(
                new $LayoutUI(
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