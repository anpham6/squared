import { ExtensionResult } from '../../../../src/base/@types/application';

import View from '../../view';

import { CONTAINER_NODE } from '../../lib/enumeration';

import $Layout = squared.base.Layout;
import $NodeList = squared.base.NodeList;

const $enum = squared.base.lib.enumeration;
const $element = squared.lib.element;
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
            const width = parseFloat(value) - (offset / actualParent.box.width) * 100;
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
        if (fixed.length) {
            const top: number[] = [];
            const right: number[] = [];
            const bottom: number[] = [];
            const left: number[] = [];
            for (const item of fixed) {
                if (item.has('top') && item.top >= 0) {
                    top.push(item.top);
                }
                if (item.has('right') && item.right >= 0) {
                    right.push(item.right);
                }
                if (item.has('bottom') && item.bottom >= 0) {
                    bottom.push(item.bottom);
                }
                if (item.has('left') && item.left >= 0) {
                    left.push(item.left);
                }
            }
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
        const container = this.application.createNode($element.createElement(node.element, node.block));
        container.inherit(node, 'initial', 'base');
        container.exclude({
            procedure: $enum.NODE_PROCEDURE.NONPOSITIONAL,
            resource: $enum.NODE_RESOURCE.BOX_STYLE | $enum.NODE_RESOURCE.ASSET
        });
        const [children, nested] = $util.partitionArray(getFixedNodes(node), item => item.absoluteParent === node) as [T[], T[]];
        children.push(container);
        $util.concatArray($util.sortArray(children, true, 'zIndex', 'id'), $util.sortArray(nested, true, 'zIndex', 'id'));
        for (const item of node.duplicate()) {
            if (!children.includes(item as T)) {
                item.parent = container;
            }
        }
        container.parent = node;
        this.application.processing.cache.append(container);
        for (let i = 0; i < children.length; i++) {
            children[i].siblingIndex = i;
        }
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
        return { output: this.application.renderLayout(layout) };
    }

    public postBaseLayout(node: T) {
        if (node.hasWidth && node.companion) {
            const width = node.cssInitial('width', true);
            const minWidth = node.cssInitial('minWidth', true);
            if (node.documentBody && node.some(item => item.has('right'))) {
                node.cssApply({
                    width: 'auto',
                    minWidth: 'auto'
                }, true);
                node.companion.cssApply({
                    width,
                    minWidth
                }, true);
                node.android('layout_width', 'match_parent');
            }
            else {
                const offset = node.paddingLeft + node.paddingRight + (node.documentBody ? node.marginLeft + node.marginRight : 0);
                node.companion.cssApply({
                    width: reduceContainerWidth(node, width, offset),
                    minWidth: reduceContainerWidth(node, minWidth, offset)
                }, true);
            }
        }
    }
}