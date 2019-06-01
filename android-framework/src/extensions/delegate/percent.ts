import { STRING_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import $LayoutUI = squared.base.LayoutUI;

type View = android.base.View;

const $const = squared.lib.constant;
const $e = squared.base.lib.enumeration;

const isFlexible = (node: View) => !node.documentParent.layoutElement && !node.display.startsWith('table');

export default class Percent<T extends android.base.View> extends squared.base.ExtensionUI<T> {
    public condition(node: T, parent: T) {
        if (node.pageFlow) {
            if (node.has($const.CSS.WIDTH, $e.CSS_STANDARD.PERCENT, { not: $const.CSS.PERCENT_100 }) && !parent.layoutConstraint && (
                    node.documentRoot ||
                    node.has($const.CSS.HEIGHT) ||
                    (parent.layoutVertical || node.singleChild) && (parent.blockStatic || parent.has($const.CSS.WIDTH))
               ))
            {
                return isFlexible(node);
            }
            else if (node.has($const.CSS.HEIGHT, $e.CSS_STANDARD.PERCENT, { not: $const.CSS.PERCENT_100 }) && (node.documentRoot || parent.hasHeight && node.singleChild)) {
                return isFlexible(node);
            }
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const container = (<android.base.Controller<T>> this.application.controllerHandler).createNodeWrapper(node, parent);
        if (node.percentWidth) {
            container.css('display', 'block');
            container.setLayoutWidth(STRING_ANDROID.MATCH_PARENT);
            node.setLayoutWidth($const.CSS.PX_0);
        }
        else {
            container.setLayoutWidth(STRING_ANDROID.WRAP_CONTENT);
        }
        if (node.percentHeight) {
            container.setLayoutHeight(STRING_ANDROID.MATCH_PARENT);
            node.setLayoutHeight($const.CSS.PX_0);
        }
        else {
            container.setLayoutHeight(STRING_ANDROID.WRAP_CONTENT);
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
        const renderParent = node.renderParent as T;
        if (renderParent) {
            node.resetBox($e.BOX_STANDARD.MARGIN, renderParent, true);
        }
    }
}