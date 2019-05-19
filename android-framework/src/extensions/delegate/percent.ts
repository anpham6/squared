import { STRING_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import $Layout = squared.base.Layout;

const $const = squared.lib.constant;
const $e = squared.base.lib.enumeration;

export default class Percent<T extends android.base.View> extends squared.base.Extension<T> {
    public condition(node: T, parent: T) {
        if (node.pageFlow && !node.documentParent.layoutElement) {
            if (node.has($const.CSS.WIDTH, $e.CSS_STANDARD.PERCENT, { not: $const.CSS.PERCENT_100 }) && (node.documentRoot || (parent.layoutVertical || parent.layoutFrame && node.singleChild) && (node.has($const.CSS.HEIGHT) || parent.blockStatic || parent.has($const.CSS.WIDTH)))) {
                return true;
            }
            else if (node.has($const.CSS.HEIGHT, $e.CSS_STANDARD.PERCENT, { not: $const.CSS.PERCENT_100 }) && (node.documentRoot || parent.hasHeight)) {
                return true;
            }
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const container = (<android.base.Controller<T>> this.application.controllerHandler).createNodeWrapper(node, parent);
        if (node.has($const.CSS.WIDTH, $e.CSS_STANDARD.PERCENT)) {
            container.css('display', 'block');
            container.setLayoutWidth(STRING_ANDROID.MATCH_PARENT);
            node.setLayoutWidth($const.CSS.PX_ZERO);
        }
        else {
            container.setLayoutWidth(STRING_ANDROID.WRAP_CONTENT);
        }
        if (node.hasHeight && node.has($const.CSS.HEIGHT, $e.CSS_STANDARD.PERCENT)) {
            container.setLayoutHeight(STRING_ANDROID.MATCH_PARENT);
            node.setLayoutHeight($const.CSS.PX_ZERO);
        }
        else {
            container.setLayoutHeight(STRING_ANDROID.WRAP_CONTENT);
        }
        return {
            parent: container,
            renderAs: container,
            outputAs: this.application.renderNode(
                new $Layout(
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
        const renderParent = node.renderParent;
        if (renderParent) {
            node.resetBox($e.BOX_STANDARD.MARGIN, renderParent, true);
        }
    }
}