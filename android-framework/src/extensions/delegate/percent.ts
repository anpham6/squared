import { CONTAINER_NODE } from '../../lib/enumeration';

import View from '../../view';

import LayoutUI = squared.base.LayoutUI;

const { BOX_STANDARD, NODE_ALIGNMENT } = squared.base.lib.enumeration;

const isFlexible = (node: View) => !node.documentParent.layoutElement && !/^table/.test(node.display);

export default class Percent<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return node.pageFlow;
    }

    public condition(node: T, parent: T) {
        if (node.percentWidth && !parent.layoutConstraint && node.css('width') !== '100%' && (node.documentRoot || node.hasPX('height') || (parent.layoutVertical || node.onlyChild) && (parent.blockStatic || parent.hasPX('width')))) {
            return isFlexible(node);
        }
        else if (node.percentWidth && node.css('height') !== '100%' && (node.documentRoot || parent.hasHeight && node.onlyChild)) {
            return isFlexible(node);
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const container = (<android.base.Controller<T>> this.controller).createNodeWrapper(node, parent);
        if (node.percentWidth) {
            container.css('display', 'block');
            container.setLayoutWidth('match_parent');
            node.setLayoutWidth(node.css('width') === '100%' ? 'match_parent' : '0px');
        }
        else {
            container.setLayoutWidth('wrap_content');
        }
        if (node.percentHeight) {
            container.setLayoutHeight('match_parent');
            node.setLayoutHeight(node.css('height') === '100%' ? 'match_parent' : '0px');
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

    public postConstraints(node: T) {
        const outerWrapper = node.outerMostWrapper;
        if (outerWrapper) {
            node.resetBox(BOX_STANDARD.MARGIN, outerWrapper);
        }
    }
}