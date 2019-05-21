import { NodeXmlTemplate } from '../../../../src/base/@types/application';

import View from '../../view';

import { CONTAINER_ANDROID, STRING_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

const $const = squared.lib.constant;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $e = squared.base.lib.enumeration;

export default class ScrollBar<T extends View> extends squared.base.Extension<T> {
    public condition(node: T) {
        return node.length > 0 && (node.overflowX && node.has($const.CSS.WIDTH) || node.overflowY && node.hasHeight && node.has($const.CSS.HEIGHT) || this.included(<HTMLElement> node.element));
    }

    public processNode(node: T, parent: T) {
        const overflow: string[] = [];
        const scrollView: T[] = [];
        const horizontalScroll = CONTAINER_ANDROID.HORIZONTAL_SCROLL;
        const verticalScroll = CONTAINER_ANDROID.VERTICAL_SCROLL;
        if (node.overflowX && node.overflowY) {
            overflow.push(CONTAINER_ANDROID.HORIZONTAL_SCROLL, verticalScroll);
        }
        else if (node.overflowX) {
            overflow.push(horizontalScroll);
        }
        else if (node.overflowY) {
            overflow.push(verticalScroll);
        }
        else {
            let overflowType = 0;
            if (node.has($const.CSS.WIDTH)) {
                overflowType |= $e.NODE_ALIGNMENT.HORIZONTAL;
                overflow.push(horizontalScroll);
            }
            if (node.hasHeight && node.has($const.CSS.HEIGHT)) {
                overflowType |= $e.NODE_ALIGNMENT.VERTICAL;
                overflow.push(verticalScroll);
            }
            node.overflow = overflowType;
        }
        for (let i = 0; i < overflow.length; i++) {
            const container = this.application.createNode(i === 0 ? <Element> node.element : $dom.createElement(node.actualParent && node.actualParent.element, node.block ? 'div' : 'span'));
            container.setControlType(overflow[i], CONTAINER_NODE.BLOCK);
            if (i === 0) {
                container.inherit(node, 'initial', 'base', 'styleMap');
                parent.appendTry(node, container);
            }
            else {
                container.inherit(node, 'base');
                container.exclude($e.NODE_RESOURCE.BOX_STYLE);
            }
            container.exclude($e.NODE_RESOURCE.ASSET);
            container.resetBox($e.BOX_STANDARD.PADDING);
            scrollView.push(container);
        }
        for (let i = 0; i < scrollView.length; i++) {
            const item = scrollView[i];
            const previous = scrollView[i - 1];
            switch (item.controlName) {
                case verticalScroll:
                    node.setLayoutWidth(STRING_ANDROID.WRAP_CONTENT);
                    item.setLayoutHeight($css.formatPX(node.actualHeight));
                    item.android('scrollbars', STRING_ANDROID.VERTICAL);
                    item.cssApply({
                        width: $const.CSS.AUTO,
                        overflow: 'scroll visible',
                        overflowX: 'visible',
                        overflowY: 'scroll'
                    });
                    break;
                case horizontalScroll:
                    node.setLayoutHeight(STRING_ANDROID.WRAP_CONTENT);
                    item.setLayoutWidth($css.formatPX(node.actualWidth));
                    item.android('scrollbars', STRING_ANDROID.HORIZONTAL);
                    item.cssApply({
                        height: $const.CSS.AUTO,
                        overflow: 'visible scroll',
                        overflowX: 'scroll',
                        overflowY: 'visible'
                    });
                    break;
            }
            if (i === 0) {
                item.render(!node.dataset.use && node.dataset.target ? this.application.resolveTarget(node.dataset.target) : parent);
            }
            else {
                item.render(previous);
            }
            item.unsetCache();
            this.application.addLayoutTemplate(
                (item.renderParent || parent) as T,
                item,
                <NodeXmlTemplate<T>> {
                    type: $e.NODE_TEMPLATE.XML,
                    node: item,
                    controlName: item.controlName
                }
            );
        }
        if (scrollView.length === 2) {
            node.setLayoutWidth(STRING_ANDROID.WRAP_CONTENT);
            node.setLayoutHeight(STRING_ANDROID.WRAP_CONTENT);
        }
        else {
            if (node.overflowX) {
                node.setLayoutWidth(STRING_ANDROID.WRAP_CONTENT);
                node.setLayoutHeight(STRING_ANDROID.MATCH_PARENT);
            }
            else {
                node.setLayoutWidth(STRING_ANDROID.MATCH_PARENT);
                node.setLayoutHeight(STRING_ANDROID.WRAP_CONTENT);
            }
        }
        const outer = scrollView.pop() as T;
        node.parent = outer;
        if (parent.layoutConstraint) {
            outer.companion = node;
        }
        node.overflow = 0;
        node.resetBox($e.BOX_STANDARD.MARGIN);
        node.exclude($e.NODE_RESOURCE.BOX_STYLE);
        return { parent: node.parent as T };
    }
}