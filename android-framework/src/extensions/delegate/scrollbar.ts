import { NodeXmlTemplate } from '../../../../src/base/@types/application';

import View from '../../view';

import { CONTAINER_NODE } from '../../lib/enumeration';

const $enum = squared.base.lib.enumeration;
const $css = squared.lib.css;
const $dom = squared.lib.dom;

const SCROLL_HORIZONTAL = 'HorizontalScrollView';
const SCROLL_VERTICAL = 'android.support.v4.widget.NestedScrollView';

export default class ScrollBar<T extends View> extends squared.base.Extension<T> {
    public condition(node: T) {
        return node.length > 0 && (
            node.overflowX ||
            node.overflowY ||
            this.included(<HTMLElement> node.element) && (node.hasWidth || node.hasHeight)
        );
    }

    public processNode(node: T, parent: T) {
        const overflow: string[] = [];
        const scrollView: T[] = [];
        if (node.overflowX && node.overflowY) {
            overflow.push(SCROLL_HORIZONTAL, SCROLL_VERTICAL);
        }
        else if (node.overflowX) {
            overflow.push(SCROLL_HORIZONTAL);
        }
        else if (node.overflowY) {
            overflow.push(SCROLL_VERTICAL);
        }
        else {
            let overflowType = 0;
            if (node.hasWidth) {
                overflowType |= $enum.NODE_ALIGNMENT.HORIZONTAL;
                overflow.push(SCROLL_HORIZONTAL);
            }
            if (node.hasHeight) {
                overflowType |= $enum.NODE_ALIGNMENT.VERTICAL;
                overflow.push(SCROLL_VERTICAL);
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
                container.exclude({ resource: $enum.NODE_RESOURCE.BOX_STYLE });
            }
            container.exclude({ resource: $enum.NODE_RESOURCE.ASSET });
            container.resetBox($enum.BOX_STANDARD.PADDING);
            scrollView.push(container);
        }
        for (let i = 0; i < scrollView.length; i++) {
            const item = scrollView[i];
            const previous = scrollView[i - 1];
            switch (item.controlName) {
                case SCROLL_VERTICAL: {
                    node.android('layout_width', 'wrap_content');
                    item.android('layout_height', $css.formatPX(node.actualHeight));
                    item.cssApply({
                        overflow: 'scroll visible',
                        overflowX: 'visible',
                        overflowY: 'scroll'
                    });
                    break;
                }
                case SCROLL_HORIZONTAL: {
                    item.android('layout_width', $css.formatPX(node.actualWidth));
                    node.android('layout_height', 'wrap_content');
                    item.cssApply({
                        overflow: 'visible scroll',
                        overflowX: 'scroll',
                        overflowY: 'visible'
                    });
                    break;
                }
            }
            item.render(i === 0 ? (!node.dataset.use && node.dataset.target ? this.application.resolveTarget(node.dataset.target) : parent) : previous);
            item.unsetCache();
            this.application.addLayoutTemplate(
                (item.renderParent || parent) as T,
                item,
                <NodeXmlTemplate<T>> {
                    type: $enum.NODE_TEMPLATE.XML,
                    node: item,
                    controlName: item.controlName
                }
            );
        }
        if (scrollView.length === 2) {
            node.android('layout_width', 'wrap_content');
            node.android('layout_height', 'wrap_content');
        }
        else {
            if (node.overflowX) {
                node.android('layout_width', 'wrap_content');
                node.android('layout_height', 'match_parent');
            }
            else {
                node.android('layout_width', 'match_parent');
                node.android('layout_height', 'wrap_content');
            }
        }
        const outer = scrollView.pop() as T;
        node.parent = outer;
        if (parent.layoutConstraint) {
            outer.companion = node;
        }
        node.overflow = 0;
        node.resetBox($enum.BOX_STANDARD.MARGIN);
        node.exclude({ resource: $enum.NODE_RESOURCE.BOX_STYLE });
        return { parent: node.parent as T };
    }
}