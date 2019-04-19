import View from '../../view';

import { CONTAINER_NODE } from '../../lib/enumeration';

import $Layout = squared.base.Layout;

const $enum = squared.base.lib.enumeration;
const $util = squared.lib.util;

const getFixedNodes = (node: View) => node.filter(item => !item.pageFlow && (item.position === 'fixed' || item.absoluteParent === node));

const withinBoxRegion = (rect: number[], value: number) => rect.some(coord => coord < value);

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

    public processNode(node: T, parent: T) {
        const [children, nested] = $util.partitionArray(getFixedNodes(node), item => item.absoluteParent === node) as [T[], T[]];
        $util.concatArray($util.sortArray(children, true, 'zIndex', 'siblingIndex'), $util.sortArray(nested, true, 'zIndex', 'siblingIndex'));
        nested.length = 0;
        for (const item of node.duplicate() as T[]) {
            if (!children.includes(item)) {
                nested.push(item);
            }
        }
        if (nested.length) {
            const container = this.application.controllerHandler.createNodeGroup(nested[0], nested, node);
            container.inherit(node, 'initial', 'base');
            container.exclude({
                procedure: $enum.NODE_PROCEDURE.NONPOSITIONAL,
                resource: $enum.NODE_RESOURCE.BOX_STYLE | $enum.NODE_RESOURCE.ASSET
            });
            container.outerParent = node;
            children.push(container);
            node.retain(children);
            node.resetBox($enum.BOX_STANDARD.PADDING | (node.documentBody ? $enum.BOX_STANDARD.MARGIN : 0), container, true);
            node.innerChild = container;
            return {
                output: this.application.renderNode(
                    new $Layout(
                        parent,
                        node,
                        CONTAINER_NODE.CONSTRAINT,
                        $enum.NODE_ALIGNMENT.ABSOLUTE,
                        children
                    )
                )
            };
        }
        return undefined;
    }

    public postBaseLayout(node: T) {
        if (node.hasWidth && node.outerParent && node.documentBody && node.some(item => item.has('right'))) {
            const width = node.cssInitial('width', true);
            const minWidth = node.cssInitial('minWidth', true);
            node.cssApply({ width: 'auto', minWidth: 'auto' }, true);
            node.outerParent.cssApply({ width, minWidth }, true);
            node.android('layout_width', 'match_parent');
        }
    }
}