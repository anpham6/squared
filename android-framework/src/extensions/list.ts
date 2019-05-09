import { NodeXmlTemplate } from '../../../src/base/@types/application';
import { ListData } from '../../../src/base/@types/extension';

import Resource from '../resource';
import View from '../view';

import { CONTAINER_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';
import { createViewAttribute } from '../lib/util';

import $Layout = squared.base.Layout;

const $const = squared.base.lib.constant;
const $enum = squared.base.lib.enumeration;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $util = squared.lib.util;

const MINWIDTH_INSIDE = 24;
const PADDINGRIGHT_DFN = 8;

export default class <T extends View> extends squared.base.extensions.List<T> {
    public processNode(node: T, parent: T) {
        super.processNode(node, parent);
        const layout = new $Layout(parent, node, 0, 0, node.children as T[]);
        if (layout.linearY && !layout.linearX) {
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
            let adjustPadding = false;
            let resetPadding: number | null = null;
            node.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, null);
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
                    ordinal.android('minWidth', $css.formatPX(minWidth));
                }
                ordinal.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, null);
                this.application.addLayoutTemplate(
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
                        if (node.marginLeft < 0) {
                            resetPadding = node.marginLeft;
                            if (parent.paddingLeft > 0) {
                                resetPadding += parent.paddingLeft;
                            }
                            else {
                                resetPadding += parent.marginLeft;
                            }
                        }
                        else {
                            adjustPadding = false;
                        }
                        minWidth = 0;
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
                    paddingRight = Math.max(minWidth / (image ? 6 : length * 4), 4);
                }
                const options = createViewAttribute(undefined, { layout_columnWeight: columnWeight });
                const element = $dom.createElement(node.actualParent && node.actualParent.element, image ? 'img' : 'span');
                ordinal = this.application.createNode(element);
                if (inside) {
                    controller.addBeforeOutsideTemplate(ordinal.id, controller.renderNodeStatic(CONTAINER_ANDROID.SPACE, createViewAttribute(undefined, { minWidth: $css.formatPX(minWidth), layout_columnWeight: columnWeight })));
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
                            baselineAlignBottom: adjustPadding ? 'true' : ''
                        });
                        ordinal.setControlType(CONTAINER_ANDROID.IMAGE, CONTAINER_NODE.IMAGE);
                        (<HTMLImageElement> element).src = $css.resolveURL(mainData.imageSrc);
                    }
                    else if (mainData.ordinal) {
                        element.innerHTML = mainData.ordinal;
                        ordinal.setInlineText(true);
                        ordinal.setControlType(CONTAINER_ANDROID.TEXT, CONTAINER_NODE.TEXT);
                        if (node.tagName === 'DFN') {
                            minWidth += PADDINGRIGHT_DFN;
                            ordinal.modifyBox($enum.BOX_STANDARD.PADDING_RIGHT, PADDINGRIGHT_DFN);
                        }
                    }
                    else {
                        ordinal.setControlType(CONTAINER_ANDROID.SPACE, CONTAINER_NODE.SPACE);
                        node.modifyBox($enum.BOX_STANDARD.PADDING_LEFT, null);
                    }
                    ordinal.inherit(node, 'textStyle');
                    ordinal.cssApply({
                        minWidth: minWidth > 0 ? $css.formatPX(minWidth) : '',
                        marginTop: node.marginTop !== 0 ? $css.formatPX(node.marginTop) : '',
                        paddingTop: node.paddingTop > 0 ? $css.formatPX(node.paddingTop) : '',
                        paddingRight: paddingRight > 0 && gravity === 'right' ? $css.formatPX(paddingRight) : '',
                        paddingLeft: paddingRight > 0 && gravity === 'left' && (!image || mainData.imagePosition) ? $css.formatPX(paddingRight) : '',
                        fontSize: mainData.ordinal && !mainData.ordinal.endsWith('.') ? $css.formatPX(ordinal.toInt('fontSize') * 0.75) : '',
                        lineHeight: node.lineHeight > 0 ? $css.formatPX(node.lineHeight) : ''
                    });
                    ordinal.apply(options);
                    if (ordinal.cssTry('display', 'block')) {
                        ordinal.setBounds();
                        ordinal.cssFinally('display');
                    }
                    ordinal.saveAsInitial();
                    if (!inside) {
                        ordinal.mergeGravity('gravity', node.localizeString(gravity));
                    }
                    if (top !== 0) {
                        ordinal.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, top);
                    }
                    if (left !== 0) {
                        ordinal.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, left);
                    }
                    ordinal.positioned = true;
                    ordinal.render(parent);
                    this.application.addLayoutTemplate(
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
            if (adjustPadding) {
                if (resetPadding === null || resetPadding <= 0) {
                    parent.modifyBox(parent.paddingLeft > 0 ? $enum.BOX_STANDARD.PADDING_LEFT : $enum.BOX_STANDARD.MARGIN_LEFT, null);
                }
                if (typeof resetPadding === 'number' && resetPadding < 0) {
                    parent.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, resetPadding);
                }
            }
            if (node.length && node.every(item => item.baseline)) {
                const layout = new $Layout(
                    parent,
                    node,
                    CONTAINER_NODE.LINEAR,
                    0,
                    node.children as T[]
                );
                layout.add(layout.length === 1 || layout.linearX ? $enum.NODE_ALIGNMENT.HORIZONTAL : $enum.NODE_ALIGNMENT.VERTICAL);
                return {
                    output: this.application.renderNode(layout),
                    next: true
                };
            }
        }
        return undefined;
    }

    public postOptimize(node: T) {
        if (node.blockStatic && node.inlineWidth) {
            node.android('layout_width', 'match_parent');
        }
    }
}