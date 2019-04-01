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
            const parentLeft = parent.paddingLeft + parent.marginLeft;
            let paddingLeft = node.marginLeft;
            let columnCount = 0;
            node.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, null);
            if (parent.is(CONTAINER_NODE.GRID)) {
                columnCount = $util.convertInt(parent.android('columnCount'));
                paddingLeft += parentLeft;
            }
            else if (parent.item(0) === node) {
                paddingLeft += parentLeft;
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
                paddingLeft += ordinal.marginLeft;
                if (paddingLeft > 0 && !ordinal.hasWidth) {
                    ordinal.android('minWidth', $util.formatPX(paddingLeft));
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
                let gravity = '';
                let image: string | undefined;
                let top = NaN;
                let left = NaN;
                if (mainData.imageSrc !== '') {
                    if (mainData.imagePosition) {
                        const position = $css.getBackgroundPosition(mainData.imagePosition, node.actualDimension, node.fontSize);
                        top = position.top;
                        left = position.left;
                    }
                    else {
                        gravity = 'right';
                    }
                    image = Resource.addImageUrl(mainData.imageSrc);
                }
                else if (parentLeft > 0 || node.marginLeft > 0) {
                    gravity = 'right';
                }
                if (gravity === '') {
                    paddingLeft += node.paddingLeft;
                    node.modifyBox($enum.BOX_STANDARD.PADDING_LEFT, null);
                }
                const paddingRight = (paddingLeft * 0.15) / (image ? 2 : 1);
                let minWidth = paddingLeft;
                const options = createViewAttribute({
                    android: {
                        layout_columnWeight: columnWeight
                    }
                });
                const element = $dom.createElement(node.actualParent ? node.actualParent.element : null);
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
                            scaleType: !inside && gravity === 'right' ? 'fitEnd' : 'fitStart'
                        });
                        ordinal.setControlType(CONTAINER_ANDROID.IMAGE, CONTAINER_NODE.IMAGE);
                        if (left) {
                            minWidth = Math.max(0, minWidth - left);
                        }
                    }
                    else if (mainData.ordinal) {
                        element.innerHTML = mainData.ordinal;
                        ordinal.setControlType(CONTAINER_ANDROID.TEXT, CONTAINER_NODE.TEXT);
                    }
                    else {
                        ordinal.setControlType(CONTAINER_ANDROID.SPACE, CONTAINER_NODE.SPACE);
                        node.modifyBox($enum.BOX_STANDARD.PADDING_LEFT, null);
                    }
                    ordinal.inherit(node, 'textStyle');
                    ordinal.cssApply({
                        minWidth: $util.formatPX(minWidth),
                        marginTop: node.marginTop !== 0 ? $util.formatPX(node.marginTop) : '',
                        paddingTop: node.paddingTop > 0 ? $util.formatPX(node.paddingTop) : '',
                        paddingRight: paddingRight > 0 && gravity === 'right' ? $util.formatPX(paddingRight) : '',
                        paddingLeft: paddingRight > 0 && gravity === '' && !image ? $util.formatPX(paddingRight) : '',
                        fontSize: mainData.ordinal && !mainData.ordinal.endsWith('.') ? $util.formatPX(ordinal.toInt('fontSize') * 0.75) : ''
                    });
                    ordinal.apply(options);
                    if (!inside) {
                        ordinal.mergeGravity('gravity', paddingLeft > 20 ? node.localizeString(gravity) : 'center_horizontal');
                    }
                    if (top) {
                        ordinal.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, top);
                    }
                    if (left) {
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