import { CONTAINER_NODE } from '../../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

type View = android.base.View;

const { CSS_UNIT, NODE_ALIGNMENT } = squared.base.lib.enumeration;

const isFlexible = (node: View) => !node.documentParent.layoutElement && !/^table/.test(node.display);

export default class Percent<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return node.pageFlow;
    }

    public condition(node: T, parent: T) {
        if (node.percentWidth > 0 && !parent.layoutConstraint && (node.cssInitial('width') !== '100%' || node.has('maxWidth', CSS_UNIT.PERCENT, { not: '100%' })) && (node.documentRoot || node.hasPX('height') || (parent.layoutVertical || node.onlyChild) && (parent.blockStatic || parent.hasPX('width')))) {
            return isFlexible(node);
        }
        else if (node.percentHeight > 0 && (node.cssInitial('height') !== '100%' || node.has('maxHeight', CSS_UNIT.PERCENT, { not: '100%' })) && (node.documentRoot || parent.hasHeight)) {
            return isFlexible(node);
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const container = (<android.base.Controller<T>> this.controller).createNodeWrapper(node, parent, undefined, { resetMargin: true });
        if (node.percentWidth > 0) {
            container.css('display', 'block');
            container.setLayoutWidth('match_parent');
            node.setLayoutWidth(node.cssInitial('width') === '100%' && !node.hasPX('maxWidth') ? 'match_parent' : '0px');
        }
        else {
            container.setLayoutWidth('wrap_content');
        }
        if (node.percentHeight > 0) {
            container.setLayoutHeight('match_parent');
            node.setLayoutHeight(node.cssInitial('height') === '100%' && !node.hasPX('maxHeight') ? 'match_parent' : '0px');
        }
        else {
            container.setLayoutHeight('wrap_content');
        }
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