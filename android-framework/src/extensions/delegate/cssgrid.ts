import { CONTAINER_NODE } from '../../lib/enumeration';

import View from '../../view';

import LayoutUI = squared.base.LayoutUI;
import CssGrid = squared.base.extensions.CssGrid;

const { formatPX } = squared.lib.css;

const { NODE_ALIGNMENT, NODE_RESOURCE } = squared.base.lib.enumeration;

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
            resource: NODE_RESOURCE.ASSET
        });
        container.inherit(node, 'base', 'initial', 'styleMap', 'boxStyle');
        if (CssGrid.isJustified(node)) {
            node.setLayoutWidth(getLayoutDimension(node.css('justifyContent')));
        }
        else {
            if (node.contentBoxWidth > 0 && node.hasPX('width', false)) {
                node.setLayoutWidth(formatPX(node.actualWidth - node.contentBoxWidth));
            }
            else {
                container.setLayoutWidth(node.blockStatic ? 'match_parent' : 'wrap_content');
            }
        }
        if (CssGrid.isAligned(node)) {
            node.setLayoutHeight(getLayoutDimension(node.css('alignContent')));
        }
        else {
            if (node.contentBoxHeight > 0 && node.hasPX('height', false)) {
                node.setLayoutHeight(formatPX(node.actualHeight - node.contentBoxHeight));
            }
            else {
                container.setLayoutHeight('wrap_content');
            }
        }
        container.unsetCache('contentBoxWidth', 'contentBoxHeight');
        const visibleStyle = node.visibleStyle;
        visibleStyle.background = false;
        visibleStyle.backgroundImage = false;
        visibleStyle.backgroundColor = false;
        visibleStyle.borderWidth = false;
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