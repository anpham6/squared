import { ExtensionResult } from '../../../../src/base/@types/application';

import View from '../../view';

import { CONTAINER_NODE } from '../../lib/enumeration';

import $Layout = squared.base.Layout;
import $NodeList = squared.base.NodeList;

const $enum = squared.base.lib.enumeration;
const $dom = squared.lib.dom;
const $util = squared.lib.util;

function getFixedNodes<T extends View>(node: T) {
    return node.filter(item => !item.pageFlow && (item.position === 'fixed' || item.absoluteParent === node));
}

function withinBoxRegion(rect: number[], value: number) {
    return rect.some(coord => coord < value);
}

function reduceContainerWidth<T extends View>(node: T, value: string, offset: number) {
    if ($util.isPercent(value)) {
        const actualParent = node.actualParent;
        if (actualParent) {
            const width = parseInt(value) - (offset / actualParent.box.width) * 100;
            if (width > 0) {
                return $util.formatPercent(width);
            }
        }
    }
    else if ($util.isUnit(value)) {
        const width = parseInt(value) - offset;
        if (width > 0) {
            return $util.formatPX(width);
        }
    }
    return value;
}

export default class Fixed<T extends View> extends squared.base.Extension<T> {
    public condition(node: T) {
        const fixed = getFixedNodes(node);
        if (fixed.length > 0) {
            const top = fixed.filter(item => item.has('top') && item.top >= 0).map(item => item.top);
            const right = fixed.filter(item => item.has('right') && item.right >= 0).map(item => item.right);
            const bottom = fixed.filter(item => item.has('bottom') && item.bottom >= 0).map(item => item.bottom);
            const left = fixed.filter(item => item.has('left') && item.left >= 0).map(item => item.left);
            return (
                withinBoxRegion(top, node.paddingTop + (node.documentBody ? node.marginTop : 0)) ||
                withinBoxRegion(right, node.paddingRight + (node.documentBody ? node.marginRight : 0)) ||
                withinBoxRegion(bottom, node.paddingBottom + (node.documentBody ? node.marginBottom : 0)) ||
                withinBoxRegion(left, node.paddingLeft + (node.documentBody ? node.marginLeft : 0)) ||
                node.documentBody && right.length > 0 && node.hasWidth
            );
        }
        return false;
    }

    public processNode(node: T, parent: T): ExtensionResult<T> {
        const container = new View(
            this.application.nextId,
            $dom.createElement(node.element, node.block),
            this.application.controllerHandler.afterInsertNode
        ) as T;
        container.inherit(node, 'initial', 'base');
        container.exclude({
            procedure: $enum.NODE_PROCEDURE.NONPOSITIONAL,
            resource: $enum.NODE_RESOURCE.BOX_STYLE | $enum.NODE_RESOURCE.ASSET
        });
        const [normal, nested] = $util.partitionArray(getFixedNodes(node), item => item.absoluteParent === node);
        normal.push(container);
        const children = [
            ...$util.sortArray(normal, true, 'zIndex', 'id'),
            ...$util.sortArray(nested, true, 'zIndex', 'id')
        ] as T[];
        node.duplicate().forEach((item: T) => {
            if (!children.includes(item)) {
                item.parent = container;
            }
        });
        container.parent = node;
        this.application.processing.cache.append(container);
        children.forEach((item, index) => item.siblingIndex = index);
        node.sort($NodeList.siblingIndex);
        node.resetBox($enum.BOX_STANDARD.PADDING | (node.documentBody ? $enum.BOX_STANDARD.MARGIN : 0), container, true);
        node.companion = container;
        const layout = new $Layout(
            parent,
            node,
            CONTAINER_NODE.CONSTRAINT,
            $enum.NODE_ALIGNMENT.ABSOLUTE,
            children.length,
            children
        );
        const output = this.application.renderLayout(layout);
        return { output };
    }

    public postBaseLayout(node: T) {
        if (node.hasWidth && node.companion) {
            const width = node.cssInitial('width', true);
            const minWidth = node.cssInitial('minWidth', true);
            if (node.documentBody && node.some(item => item.has('right'))) {
                node.css({ width: 'auto', minWidth: 'auto' }, '', true);
                node.companion.css({ width, minWidth }, '', true);
                node.android('layout_width', 'match_parent');
            }
            else {
                const offset = node.paddingLeft + node.paddingRight + (node.documentBody ? node.marginLeft + node.marginRight : 0);
                node.companion.css({ width: reduceContainerWidth(node, width, offset), minWidth: reduceContainerWidth(node, minWidth, offset) }, '', true);
            }
        }
    }
}