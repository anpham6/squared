import { CONTAINER_ANDROID, EXT_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import $Layout = squared.base.Layout;

type MaxWidthHeightData = {
    maxWidth: boolean;
    maxHeight: boolean;
};

const $enum = squared.base.lib.enumeration;

export default class MaxWidthHeight<T extends android.base.View> extends squared.base.Extension<T> {
    public condition(node: T, parent: T) {
        let maxWidth = false;
        let maxHeight = false;
        if (!node.support.maxWidth && !isNaN(node.width) && node.has('maxWidth') && !parent.hasAlign($enum.NODE_ALIGNMENT.COLUMN)) {
            const blockWidth = node.css('width') === '100%';
            if (node.width === 0 || blockWidth) {
                if (node.blockStatic && !node.autoMargin.horizontal || blockWidth) {
                    node.css('width', node.css('maxWidth'));
                }
                else {
                    maxWidth = true;
                }
            }
            else {
                maxWidth = true;
            }
        }
        if (!node.support.maxHeight && !isNaN(node.height) && node.has('maxHeight') && parent.hasHeight) {
            if (node.hasHeight && node.css('height') === '100%') {
                node.css('height', node.css('maxHeight'));
            }
            else {
                maxHeight = true;
            }
        }
        if (maxWidth || maxHeight) {
            node.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, 'mainData', <MaxWidthHeightData> { maxWidth, maxHeight });
            return true;
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const mainData: MaxWidthHeightData = node.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, 'mainData');
        if (mainData) {
            const container = (<android.base.Controller<T>> this.application.controllerHandler).createNodeWrapper(node, parent, undefined, CONTAINER_ANDROID.CONSTRAINT, CONTAINER_NODE.CONSTRAINT);
            container.inherit(node, 'styleMap');
            if (mainData.maxWidth) {
                node.android('layout_width', '0px');
                container.android('layout_width', 'match_parent');
                if (parent.layoutElement) {
                    node.autoMargin.horizontal = false;
                    node.autoMargin.left = false;
                    node.autoMargin.right = false;
                    node.autoMargin.leftRight = false;
                }
            }
            if (mainData.maxHeight) {
                node.android('layout_height', '0px');
                container.android('layout_height', 'match_parent');
                if (parent.layoutElement) {
                    node.autoMargin.vertical = false;
                    node.autoMargin.top = false;
                    node.autoMargin.bottom = false;
                    node.autoMargin.topBottom = false;
                }
            }
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(
                    new $Layout(
                        parent,
                        container,
                        container.containerType,
                        $enum.NODE_ALIGNMENT.SINGLE,
                        container.children as T[]
                    )
                )
            };
        }
        return undefined;
    }
}