import { NodeXmlTemplate } from '../../../src/base/@types/application';
import { ListData } from '../../../src/base/@types/extension';

import Resource from '../resource';
import View from '../view';

import { BOX_ANDROID, CONTAINER_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';
import { createViewAttribute } from '../lib/util';

import $Layout = squared.base.Layout;

const $const = squared.base.lib.constant;
const $enum = squared.base.lib.enumeration;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $util = squared.lib.util;

const MINWIDTH_INSIDE = 24;

export default class <T extends View> extends squared.base.extensions.List<T> {
    public processNode(node: T, parent: T) {
        super.processNode(node, parent);
        const layout = new $Layout(
            parent,
            node,
            0,
            0,
            node.children as T[]
        );
        if (layout.linearY) {
            layout.rowCount = node.length;
            layout.columnCount = node.some(item => item.css('listStylePosition') === 'inside') ? 3 : 2;
            layout.setType(CONTAINER_NODE.GRID, $enum.NODE_ALIGNMENT.AUTO_LAYOUT);
        }
        else if ((<android.base.Controller<T>> this.application.controllerHandler).checkRelativeHorizontal(layout)) {
            layout.rowCount = 1;
            layout.columnCount = layout.length;
            layout.setType(CONTAINER_NODE.RELATIVE, $enum.NODE_ALIGNMENT.HORIZONTAL);
        }
        if (layout.containerType !== 0) {
            return {
                output: this.application.renderNode(layout),
                complete: true
            };
        }
        return undefined;
    }

    public processChild(node: T, parent: T) {
        const mainData: ListData = node.data($const.EXT_NAME.LIST, 'mainData');
        if (mainData) {
            const controller = <android.base.Controller<T>> this.application.controllerHandler;
            let minWidth = node.marginLeft;
            let columnCount = 0;
            node.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, null);
            let adjustPadding = false;
            if (parent.is(CONTAINER_NODE.GRID)) {
                columnCount = $util.convertInt(parent.android('columnCount'));
                adjustPadding = true;
            }
            else if (parent.item(0) === node) {
                adjustPadding = true;
            }
            if (adjustPadding) {
                if (parent.paddingLeft > 0) {
                    minWidth += parent.paddingLeft;
                }
                else {
                    minWidth += parent.marginLeft;
                }
            }
            let ordinal = !mainData.ordinal ? node.find(item => item.float === 'left' && item.marginLeft < 0 && Math.abs(item.marginLeft) <= item.documentParent.marginLeft) as T : undefined;
            if (ordinal) {
                const layout = new $Layout(parent, ordinal);
                if (ordinal.inlineText || ordinal.length === 0) {
                    layout.containerType = CONTAINER_NODE.TEXT;
                }
                else {
                    layout.retain(ordinal.children as T[]);
                    if (controller.checkRelativeHorizontal(layout)) {
                        layout.setType(CONTAINER_NODE.RELATIVE, $enum.NODE_ALIGNMENT.HORIZONTAL);
                    }
                    else {
                        layout.setType(CONTAINER_NODE.CONSTRAINT, $enum.NODE_ALIGNMENT.UNKNOWN);
                    }
                }
                ordinal.parent = parent;
                ordinal.render(parent);
                if (columnCount === 3) {
                    node.android('layout_columnSpan', '2');
                }
                minWidth += ordinal.marginLeft;
                if (minWidth > 0 && !ordinal.hasWidth) {
                    ordinal.android('minWidth', $util.formatPX(minWidth));
                }
                ordinal.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, null);
                this.application.addRenderTemplate(
                    parent,
                    ordinal,
                    this.application.renderNode(layout)
                );
            }
            else {
                const columnWeight = columnCount > 0 ? '0' : '';
                const inside = node.css('listStylePosition') === 'inside';
                let gravity = 'right';
                let top = 0;
                let left = 0;
                let image: string | undefined;
                if (mainData.imageSrc !== '') {
                    if (mainData.imagePosition) {
                        const position = $css.getBackgroundPosition(mainData.imagePosition, node.actualDimension, node.fontSize);
                        top = position.top;
                        left = position.left;
                        gravity = 'left';
                    }
                    image = Resource.addImageURL(mainData.imageSrc);
                }
                let paddingRight = 0;
                if (gravity === 'left') {
                    minWidth += node.paddingLeft - left;
                    node.modifyBox($enum.BOX_STANDARD.PADDING_LEFT, null);
                }
                else {
                    const length = mainData.ordinal ? mainData.ordinal.length : 1;
                    paddingRight = Math.max(minWidth / (image ? 8 : length * 4), 4);
                }
                const options = createViewAttribute({
                    android: {
                        layout_columnWeight: columnWeight
                    }
                });
                const element = $dom.createElement(node.actualParent && node.actualParent.element);
                ordinal = this.application.createNode(element);
                if (inside) {
                    controller.addBeforeOutsideTemplate(
                        ordinal.id,
                        controller.renderNodeStatic(
                            CONTAINER_ANDROID.SPACE,
                            {
                                android: {
                                    minWidth: $util.formatPX(minWidth),
                                    layout_columnWeight: columnWeight
                                }
                            }
                        )
                    );
                    minWidth = MINWIDTH_INSIDE;
                }
                else if (columnCount === 3) {
                    node.android('layout_columnSpan', '2');
                }
                if (node.tagName === 'DT' && !image) {
                    node.android('layout_columnSpan', columnCount.toString());
                }
                else {
                    ordinal.tagName = `${node.tagName}_ORDINAL`;
                    if (image) {
                        Object.assign(options.android, {
                            src: `@drawable/${image}`,
                            scaleType: !inside && gravity === 'right' ? 'fitEnd' : 'fitStart',
                            baselineAlignBottom: 'true'
                        });
                        ordinal.setControlType(CONTAINER_ANDROID.IMAGE, CONTAINER_NODE.IMAGE);
                    }
                    else if (mainData.ordinal) {
                        element.innerHTML = mainData.ordinal;
                        ordinal.setInlineText(true);
                        ordinal.setControlType(CONTAINER_ANDROID.TEXT, CONTAINER_NODE.TEXT);
                    }
                    else {
                        ordinal.setControlType(CONTAINER_ANDROID.SPACE, CONTAINER_NODE.SPACE);
                        node.modifyBox($enum.BOX_STANDARD.PADDING_LEFT, null);
                    }
                    ordinal.inherit(node, 'textStyle');
                    ordinal.cssApply({
                        minWidth: minWidth > 0 ? $util.formatPX(minWidth) : '',
                        marginTop: node.marginTop !== 0 ? $util.formatPX(node.marginTop) : '',
                        paddingTop: node.paddingTop > 0 ? $util.formatPX(node.paddingTop) : '',
                        paddingRight: paddingRight > 0 && gravity === 'right' ? $util.formatPX(paddingRight) : '',
                        paddingLeft: paddingRight > 0 && gravity === 'left' && (!image || mainData.imagePosition) ? $util.formatPX(paddingRight) : '',
                        fontSize: mainData.ordinal && !mainData.ordinal.endsWith('.') ? $util.formatPX(ordinal.toInt('fontSize') * 0.75) : ''
                    });
                    ordinal.apply(options);
                    if (!inside) {
                        ordinal.mergeGravity('gravity', node.localizeString(gravity));
                    }
                    if (top !== 0) {
                        ordinal.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, top);
                    }
                    if (left !== 0) {
                        ordinal.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, left);
                    }
                    ordinal.render(parent);
                    this.application.addRenderTemplate(
                        parent,
                        ordinal,
                        <NodeXmlTemplate<T>> {
                            type: $enum.NODE_TEMPLATE.XML,
                            node: ordinal,
                            controlName: ordinal.controlName
                        }
                    );
                    node.companion = ordinal;
                }
            }
            if (columnCount > 0) {
                node.android('layout_width', '0px');
                node.android('layout_columnWeight', '1');
            }
            if (node.length && node.every(item => item.baseline)) {
                const layout = new $Layout(
                    parent,
                    node,
                    CONTAINER_NODE.LINEAR,
                    0,
                    node.children as T[]
                );
                if (layout.linearX || layout.linearY) {
                    layout.add(layout.linearX ? $enum.NODE_ALIGNMENT.HORIZONTAL : $enum.NODE_ALIGNMENT.VERTICAL);
                    return {
                        output: this.application.renderNode(layout),
                        next: true
                    };
                }
            }
        }
        return undefined;
    }

    public postBaseLayout(node: T) {
        super.postBaseLayout(node);
        const columnCount = node.android('columnCount');
        for (let i = 0; i < node.renderChildren.length; i++) {
            const item = node.renderChildren[i];
            const previous = node.renderChildren[i - 1];
            let spaceHeight = 0;
            if (previous) {
                const marginBottom = $util.convertInt(previous.android(BOX_ANDROID.MARGIN_BOTTOM));
                if (marginBottom !== 0) {
                    spaceHeight += marginBottom;
                    previous.delete('android', BOX_ANDROID.MARGIN_BOTTOM);
                    previous.modifyBox($enum.BOX_STANDARD.MARGIN_BOTTOM, null);
                }
            }
            const marginTop = $util.convertInt(item.android(BOX_ANDROID.MARGIN_TOP));
            if (marginTop !== 0) {
                spaceHeight += marginTop;
                item.delete('android', BOX_ANDROID.MARGIN_TOP);
                item.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, null);
            }
            if (spaceHeight > 0) {
                const controller = this.application.controllerHandler;
                const options = createViewAttribute({
                    android: {
                        layout_columnSpan: columnCount.toString()
                    }
                });
                controller.addBeforeOutsideTemplate(
                    item.id,
                    controller.renderNodeStatic(CONTAINER_ANDROID.SPACE, options, 'match_parent', $util.formatPX(spaceHeight)),
                    0
                );
            }
        }
    }

    public postProcedure(node: T) {
        if (node.blockStatic && node.inlineWidth) {
            node.android('layout_width', 'match_parent');
        }
    }
}