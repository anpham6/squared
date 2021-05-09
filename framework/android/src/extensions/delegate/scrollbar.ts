import BOX_STANDARD = squared.base.lib.constant.BOX_STANDARD;
import NODE_TEMPLATE = squared.base.lib.constant.NODE_TEMPLATE;
import NODE_RESOURCE = squared.base.lib.constant.NODE_RESOURCE;
import CONTAINER_NODE = android.lib.constant.CONTAINER_NODE;

import { BUILD_VERSION, CONTAINER_TAGNAME, CONTAINER_TAGNAME_X } from '../../lib/constant';

import type View from '../../view';

const { formatPX } = squared.lib.css;

export default class ScrollBar<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return node.scrollElement && !node.textElement;
    }

    public condition(node: T) {
        return (node.overflowX && node.hasUnit('width') || node.overflowY && node.hasUnit('height') && node.hasHeight) && !node.rootElement && node.tagName !== 'TEXTAREA';
    }

    public processNode(node: T, parent: T): Void<ExtensionResult<T>> {
        const overflow: string[] = [];
        const scrollView: T[] = [];
        const horizontalScroll = CONTAINER_TAGNAME.HORIZONTAL_SCROLL;
        const verticalScroll = node.api < BUILD_VERSION.Q ? CONTAINER_TAGNAME.VERTICAL_SCROLL : CONTAINER_TAGNAME_X.VERTICAL_SCROLL;
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
                const container = this.application.createNode(node.sessionId, { parent, childIndex: node.childIndex });
                if (i === 0) {
                    container.inherit(node, 'base', 'initial', 'styleMap');
                    if (!parent.replaceTry({ child: node, replaceWith: container })) {
                        return;
                    }
                }
                else {
                    container.inherit(node, 'base');
                    container.exclude({ resource: NODE_RESOURCE.BOX_STYLE });
                }
                container.setControlType(overflow[i], CONTAINER_NODE.BLOCK);
                container.exclude({ resource: NODE_RESOURCE.ASSET });
                container.resetBox(BOX_STANDARD.PADDING);
                scrollView.push(container);
            }
            for (let i = 0; i < length; ++i) {
                const item = scrollView[i];
                switch (item.controlName) {
                    case verticalScroll: {
                        node.setLayoutHeight('wrap_content');
                        item.setLayoutHeight(formatPX(node.actualHeight));
                        item.android('scrollbars', 'vertical');
                        const width = length === 1 && node.cssInitial('width') || 'auto';
                        item.cssApply({
                            width,
                            overflowX: 'visible',
                            overflowY: 'scroll'
                        });
                        if (width === 'auto' && node.blockStatic) {
                            item.setLayoutWidth('match_parent');
                        }
                        break;
                    }
                    case horizontalScroll:
                        node.setLayoutWidth('wrap_content');
                        item.setLayoutWidth(formatPX(node.actualWidth));
                        item.android('scrollbars', 'horizontal');
                        item.cssApply({
                            height: length === 1 && node.cssInitial('height') || 'auto',
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
            for (let i = 0, q = children.length; i < q; ++i) {
                const child = children[i];
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
    }
}