import { CONTAINER_NODE } from '../../lib/enumeration';

import View from '../../view';

import LayoutUI = squared.base.LayoutUI;

const $base = squared.base;

const { NODE_ALIGNMENT, NODE_RESOURCE } = $base.lib.enumeration;

const CssGrid = $base.extensions.CssGrid;

const getLayoutDimension = (value: string) => value === 'space-between' ? 'match_parent' : 'wrap_content';

export default class Grid<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return node.gridElement;
    }

    public condition(node: T) {
        return CssGrid.isJustified(node) || CssGrid.isAligned(node);
    }

    public processNode(node: T, parent: T) {
        const container = (<android.base.Controller<T>> this.controller).createNodeWrapper(node, parent, undefined, {
            controlName: View.getControlName(CONTAINER_NODE.CONSTRAINT, node.api),
            containerType: CONTAINER_NODE.CONSTRAINT,
            resource: NODE_RESOURCE.ASSET,
            resetMargin: !node.documentBody
        });
        container.inherit(node, 'styleMap', 'boxStyle');
        if (CssGrid.isJustified(node)) {
            node.setLayoutWidth(getLayoutDimension(node.css('justifyContent')));
        }
        else {
            if (node.hasPX('width', false)) {
                node.setLayoutWidth('match_parent');
            }
            else {
                container.setLayoutWidth(node.blockStatic ? 'match_parent' : 'wrap_content');
            }
        }
        if (CssGrid.isAligned(node)) {
            node.setLayoutHeight(getLayoutDimension(node.css('alignContent')));
        }
        else {
            if (node.hasPX('height', false)) {
                node.setLayoutHeight('match_parent');
            }
            else {
                container.setLayoutHeight('wrap_content');
            }
        }
        container.unsetCache('contentBoxWidth', 'contentBoxHeight');
        return {
            parent: container,
            renderAs: container,
            outputAs: this.application.renderNode(
                new LayoutUI(
                    parent,
                    container,
                    CONTAINER_NODE.CONSTRAINT,
                    NODE_ALIGNMENT.SINGLE,
                    container.children as T[]
                )
            ),
            include: true
        };
    }
}