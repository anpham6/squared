import { CONTAINER_NODE } from '../../lib/enumeration';

import View from '../../view';

import $LayoutUI = squared.base.LayoutUI;

const $e = squared.base.lib.enumeration;

const isFlexible = (node: View) => !node.documentParent.layoutElement && !node.display.startsWith('table');

export default class Percent<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return node.pageFlow;
    }

    public condition(node: T, parent: T) {
        if (node.has('width', $e.CSS_UNIT.PERCENT, { not: '100%' }) && !parent.layoutConstraint && (
                node.documentRoot ||
                node.hasPX('height') ||
                (parent.layoutVertical || node.onlyChild) && (parent.blockStatic || parent.hasPX('width'))
            ))
        {
            return isFlexible(node);
        }
        else if (node.has('height', $e.CSS_UNIT.PERCENT, { not: '100%' }) && (node.documentRoot || parent.hasHeight && node.onlyChild)) {
            return isFlexible(node);
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const container = (<android.base.Controller<T>> this.controller).createNodeWrapper(node, parent);
        if (node.percentWidth) {
            container.css('display', 'block');
            container.setLayoutWidth('match_parent');
            node.setLayoutWidth('0px');
        }
        else {
            container.setLayoutWidth('wrap_content');
        }
        if (node.percentHeight) {
            container.setLayoutHeight('match_parent');
            node.setLayoutHeight('0px');
        }
        else {
            container.setLayoutHeight('wrap_content');
        }
        return {
            parent: container,
            renderAs: container,
            outputAs: this.application.renderNode(
                new $LayoutUI(
                    parent,
                    container,
                    CONTAINER_NODE.CONSTRAINT,
                    $e.NODE_ALIGNMENT.SINGLE,
                    container.children as T[]
                )
            ),
            include: true
        };
    }

    public postConstraints(node: T) {
        const outerWrapper = node.outerWrapper as T;
        if (outerWrapper) {
            node.resetBox($e.BOX_STANDARD.MARGIN, outerWrapper);
        }
    }
}