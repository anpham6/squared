import { CONTAINER_ANDROID, CONTAINER_ANDROID_X } from '../../lib/constant';
import { BUILD_ANDROID, CONTAINER_NODE } from '../../lib/enumeration';

type View = android.base.View;

const { formatPX } = squared.lib.css;

const { BOX_STANDARD, NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;

export default class ScrollBar<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return node.scrollElement && !node.textElement;
    }

    public condition(node: T) {
        return (node.overflowX && node.hasPX('width') || node.overflowY && node.hasPX('height') && node.hasHeight) && !node.rootElement && node.tagName !== 'TEXTAREA';
    }

    public processNode(node: T, parent: T) {
        const overflow: string[] = [];
        const scrollView: T[] = [];
        const horizontalScroll = CONTAINER_ANDROID.HORIZONTAL_SCROLL;
        const verticalScroll = node.api < BUILD_ANDROID.Q ? CONTAINER_ANDROID.VERTICAL_SCROLL : CONTAINER_ANDROID_X.VERTICAL_SCROLL;
        const children: T[] = [];
        let boxWidth = NaN;
        if (node.overflowX && node.overflowY) {
            overflow.push(horizontalScroll, verticalScroll);
        }
        else if (node.overflowX) {
            overflow.push(horizontalScroll);
        }
        else if (node.overflowY) {
            overflow.push(verticalScroll);
        }
        if (overflow.includes(horizontalScroll)) {
            boxWidth = node.actualWidth - node.contentBoxWidth;
            let valid = true,
                contentWidth = 0;
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
        }
        const length = overflow.length;
        if (length) {
            for (let i = 0; i < length; ++i) {
                const container = this.application.createNode(node.sessionId, { parent });
                if (i === 0) {
                    container.inherit(node, 'base', 'initial', 'styleMap');
                    if (!parent.replaceTry({ child: node, replaceWith: container })) {
                        return undefined;
                    }
                }
                else {
                    container.inherit(node, 'base');
                    container.exclude({ resource: NODE_RESOURCE.BOX_STYLE });
                }
                container.setControlType(overflow[i], CONTAINER_NODE.BLOCK);
                container.exclude({ resource: NODE_RESOURCE.ASSET });
                container.resetBox(BOX_STANDARD.PADDING);
                container.childIndex = node.childIndex;
                scrollView.push(container);
            }
            for (let i = 0; i < length; ++i) {
                const item = scrollView[i];
                switch (item.controlName) {
                    case verticalScroll:
                        node.setLayoutHeight('wrap_content');
                        item.setLayoutHeight(formatPX(node.actualHeight));
                        item.android('scrollbars', 'vertical');
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
                        item.android('scrollbars', 'horizontal');
                        item.cssApply({
                            height: length === 1 && node.css('height') || 'auto',
                            overflow: 'visible scroll',
                            overflowX: 'scroll',
                            overflowY: 'visible'
                        });
                        break;
                }
                if (i === 0) {
                    item.render(parent);
                }
                else {
                    item.render(scrollView[i - 1]);
                }
                item.unsetCache();
                this.application.addLayoutTemplate(
                    (item.renderParent || parent) as T,
                    item,
                    {
                        type: NODE_TEMPLATE.XML,
                        node: item,
                        controlName: item.controlName
                    } as NodeXmlTemplate<T>
                );
            }
            const q = children.length;
            let i = 0;
            while (i < q) {
                const child = children[i++];
                if (child.textElement) {
                    child.css('maxWidth', formatPX(boxWidth));
                }
            }
            let first = true,
                item: T;
            do {
                item = scrollView.pop() as T;
                if (first) {
                    parent = item;
                    item.innerWrapped = node;
                    first = false;
                }
                else {
                    item.innerWrapped = parent;
                }
            }
            while (scrollView.length);
            node.exclude({ resource: NODE_RESOURCE.BOX_STYLE });
            node.resetBox(BOX_STANDARD.MARGIN, item);
            node.parent = parent;
            return { parent };
        }
        return undefined;
    }
}