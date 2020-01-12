import { NodeXmlTemplate } from '../../../../@types/base/application';

import View from '../../view';

import { CONTAINER_ANDROID, CONTAINER_ANDROID_X, STRING_ANDROID } from '../../lib/constant';
import { BUILD_ANDROID, CONTAINER_NODE } from '../../lib/enumeration';

const { formatPX } = squared.lib.css;

const { BOX_STANDARD, NODE_ALIGNMENT, NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;

export default class ScrollBar<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return node.length > 0;
    }

    public condition(node: T) {
        return node.overflowX && node.hasPX('width') || node.overflowY && node.hasHeight && node.hasPX('height') || this.included(<HTMLElement> node.element);
    }

    public processNode(node: T, parent: T) {
        const overflow: string[] = [];
        const scrollView: T[] = [];
        const horizontalScroll = CONTAINER_ANDROID.HORIZONTAL_SCROLL;
        const verticalScroll = node.api < BUILD_ANDROID.Q ? CONTAINER_ANDROID.VERTICAL_SCROLL : CONTAINER_ANDROID_X.VERTICAL_SCROLL;
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
                overflowType |= NODE_ALIGNMENT.HORIZONTAL;
                overflow.push(horizontalScroll);
            }
            if (node.hasHeight && node.hasPX('height')) {
                overflowType |= NODE_ALIGNMENT.VERTICAL;
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
                    child.css('maxWidth', formatPX(boxWidth), true);
                }
            }
        }
        const length = overflow.length;
        if (length) {
            for (let i = 0; i < length; i++) {
                let container: T;
                if (i === 0) {
                    container = this.application.createNode(<HTMLElement> node.element);
                    container.inherit(node, 'base', 'initial', 'styleMap');
                    parent.appendTry(node, container);
                }
                else {
                    container = this.application.createNode();
                    container.inherit(node, 'base');
                    container.exclude({ resource: NODE_RESOURCE.BOX_STYLE });
                    scrollView[0].innerWrapped = container;
                    container.outerWrapper = scrollView[0];
                }
                container.setControlType(overflow[i], CONTAINER_NODE.BLOCK);
                container.exclude({ resource: NODE_RESOURCE.ASSET });
                container.resetBox(BOX_STANDARD.PADDING);
                scrollView.push(container);
            }
            for (let i = 0; i < length; i++) {
                const item = scrollView[i];
                switch (item.controlName) {
                    case verticalScroll:
                        node.setLayoutHeight('wrap_content');
                        item.setLayoutHeight(formatPX(node.actualHeight));
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
                        item.setLayoutWidth(formatPX(node.actualWidth));
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
                    const dataset = node.dataset;
                    item.render(!dataset.use && dataset.target ? this.application.resolveTarget(dataset.target) : parent);
                }
                else {
                    item.render(scrollView[i - 1]);
                }
                item.unsetCache();
                this.application.addLayoutTemplate(
                    (item.renderParent || parent) as T,
                    item,
                    <NodeXmlTemplate<T>> {
                        type: NODE_TEMPLATE.XML,
                        node: item,
                        controlName: item.controlName
                    }
                );
            }
            node.overflow = 0;
            node.exclude({ resource: NODE_RESOURCE.BOX_STYLE });
            node.resetBox(BOX_STANDARD.MARGIN, scrollView[0]);
            parent = scrollView.pop() as T;
            parent.innerWrapped = node;
            node.parent = parent;
            node.outerWrapper = parent;
            return { parent };
        }
        return undefined;
    }
}