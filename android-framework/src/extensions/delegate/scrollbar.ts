import { NodeXmlTemplate } from '../../../../@types/base/application';

import View from '../../view';

import { CONTAINER_ANDROID, STRING_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

const $css = squared.lib.css;
const $e = squared.base.lib.enumeration;

export default class ScrollBar<T extends View> extends squared.base.ExtensionUI<T> {
    public condition(node: T) {
        return node.length > 0 && (node.overflowX && node.hasPX('width') || node.overflowY && node.hasHeight && node.hasPX('height') || this.included(<HTMLElement> node.element));
    }

    public processNode(node: T, parent: T) {
        const overflow: string[] = [];
        const scrollView: T[] = [];
        const horizontalScroll = CONTAINER_ANDROID.HORIZONTAL_SCROLL;
        const verticalScroll = CONTAINER_ANDROID.VERTICAL_SCROLL;
        if (node.overflowX && node.overflowY) {
            overflow.push(horizontalScroll, verticalScroll);
        }
        else if (node.overflowX) {
            overflow.push(horizontalScroll);
        }
        else if (node.overflowY) {
            overflow.push(verticalScroll);
        }
        else {
            let overflowType = 0;
            if (node.hasPX('width')) {
                overflowType |= $e.NODE_ALIGNMENT.HORIZONTAL;
                overflow.push(horizontalScroll);
            }
            if (node.hasHeight && node.hasPX('height')) {
                overflowType |= $e.NODE_ALIGNMENT.VERTICAL;
                overflow.push(verticalScroll);
            }
            node.overflow = overflowType;
        }
        if (overflow.includes(horizontalScroll)) {
            const children: T[] = [];
            let boxWidth = node.actualWidth - node.contentBoxWidth;
            let valid = true;
            let contentWidth = 0;
            node.each((child: T) => {
                if (child.textElement && child.css('whiteSpace') !== 'nowrap') {
                    children.push(child);
                }
                else {
                    const childWidth = child.actualWidth;
                    if (childWidth <= boxWidth) {
                        return;
                    }
                    else if (childWidth > contentWidth) {
                        contentWidth = childWidth;
                    }
                }
                valid = false;
            });
            if (!valid) {
                if (contentWidth > boxWidth) {
                    boxWidth = contentWidth;
                }
            }
            else {
                overflow.shift();
            }
            if (overflow.length) {
                for (const child of children) {
                    child.css('maxWidth', $css.formatPX(boxWidth), true);
                }
            }
        }
        const length = overflow.length;
        if (length > 0) {
            for (let i = 0; i < length; i++) {
                let container: T;
                if (i === 0) {
                    container = this.application.createNode(<HTMLElement> node.element);
                    container.inherit(node, 'base', 'initial', 'styleMap');
                    parent.appendTry(node, container);
                    container.innerWrapped = node;
                    node.outerWrapper = container;
                }
                else {
                    container = this.application.createNode();
                    container.inherit(node, 'base');
                    container.exclude($e.NODE_RESOURCE.BOX_STYLE);
                    scrollView[0].outerWrapper = container;
                    container.innerWrapped = scrollView[0];
                }
                container.setControlType(overflow[i], CONTAINER_NODE.BLOCK);
                container.exclude($e.NODE_RESOURCE.ASSET);
                container.resetBox($e.BOX_STANDARD.PADDING);
                scrollView.push(container);
            }
            for (let i = 0; i < length; i++) {
                const item = scrollView[i];
                const previous = scrollView[i - 1];
                switch (item.controlName) {
                    case verticalScroll:
                        node.setLayoutHeight('wrap_content');
                        item.setLayoutHeight($css.formatPX(node.actualHeight));
                        item.android('scrollbars', STRING_ANDROID.VERTICAL);
                        item.cssApply({
                            width: length === 1 && node.css('width') || 'auto',
                            overflow: 'scroll visible',
                            overflowX: 'visible',
                            overflowY: 'scroll'
                        });
                        break;
                    case horizontalScroll:
                        node.setLayoutWidth('wrap_content');
                        item.setLayoutWidth($css.formatPX(node.actualWidth));
                        item.android('scrollbars', STRING_ANDROID.HORIZONTAL);
                        item.cssApply({
                            height: length === 1 && node.css('height') || 'auto',
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
        return undefined;
    }
}