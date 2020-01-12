import { NodeXmlTemplate } from '../../../@types/base/application';
import { ListData } from '../../../@types/base/extension';

import Resource from '../resource';
import View from '../view';

import { CONTAINER_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';
import { createViewAttribute } from '../lib/util';

import $LayoutUI = squared.base.LayoutUI;

const $lib = squared.lib;
const { formatPX, getBackgroundPosition } = $lib.css;
const { convertInt } = $lib.util;

const $base = squared.base;
const { NodeUI } = $base;

const $base_lib = $base.lib;
const { BOX_STANDARD, NODE_ALIGNMENT, NODE_TEMPLATE } = $base_lib.enumeration;

const { LIST } = $base_lib.constant.EXT_NAME;

const MINWIDTH_INSIDE = 24;
const PADDINGRIGHT_DFN = 8;

export default class <T extends View> extends squared.base.extensions.List<T> {
    public processNode(node: T, parent: T) {
        const layout = new $LayoutUI(parent, node, 0, 0, node.children as T[]);
        if (!layout.unknownAligned || layout.singleRowAligned) {
            super.processNode(node, parent);
            if (layout.linearY) {
                layout.rowCount = node.length;
                layout.columnCount = node.some(item => item.css('listStylePosition') === 'inside') ? 3 : 2;
                layout.setContainerType(CONTAINER_NODE.GRID, NODE_ALIGNMENT.AUTO_LAYOUT);
            }
            else if (layout.linearX || layout.singleRowAligned) {
                layout.rowCount = 1;
                layout.columnCount = layout.length;
                layout.setContainerType(CONTAINER_NODE.LINEAR, NODE_ALIGNMENT.HORIZONTAL);
            }
            if (layout.containerType !== 0) {
                return {
                    output: this.application.renderNode(layout),
                    complete: true
                };
            }
        }
        return undefined;
    }

    public processChild(node: T, parent: T) {
        const mainData: ListData = node.data(LIST, 'mainData');
        if (mainData) {
            const application = this.application;
            const controller = <android.base.Controller<T>> this.controller;
            const firstChild = parent.firstStaticChild === node;
            const ordinalValue = mainData.ordinal || '';
            let minWidth = node.marginLeft;
            let columnCount = 0;
            let adjustPadding = false;
            let resetPadding = NaN;
            let register = false;
            node.modifyBox(BOX_STANDARD.MARGIN_LEFT);
            if (parent.is(CONTAINER_NODE.GRID)) {
                columnCount = convertInt(parent.android('columnCount'));
                adjustPadding = true;
            }
            else if (firstChild) {
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
            const container = node.length === 0 ? controller.createNodeGroup(node, [node], parent) : node;
            let ordinal: T | undefined;
            if (ordinalValue === '') {
                ordinal = node.find((item: T) => item.float === 'left' && item.marginLeft < 0 && Math.abs(item.marginLeft) <= item.documentParent.marginLeft) as T | undefined;
            }
            if (ordinal) {
                const layoutOrdinal = new $LayoutUI(parent, ordinal);
                if (ordinal.inlineText || ordinal.length === 0) {
                    layoutOrdinal.containerType = CONTAINER_NODE.TEXT;
                }
                else {
                    if (layoutOrdinal.singleRowAligned) {
                        layoutOrdinal.setContainerType(CONTAINER_NODE.RELATIVE, NODE_ALIGNMENT.HORIZONTAL);
                    }
                    else {
                        layoutOrdinal.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.UNKNOWN);
                    }
                    layoutOrdinal.retain(ordinal.children as T[]);
                }
                ordinal.parent = parent;
                ordinal.render(parent);
                if (columnCount === 3) {
                    node.android('layout_columnSpan', '2');
                }
                minWidth += ordinal.marginLeft;
                if (minWidth > 0 && !ordinal.hasWidth) {
                    ordinal.android('minWidth', formatPX(minWidth));
                }
                ordinal.modifyBox(BOX_STANDARD.MARGIN_LEFT);
                application.addLayoutTemplate(
                    parent,
                    ordinal,
                    application.renderNode(layoutOrdinal)
                );
            }
            else {
                const inside = node.css('listStylePosition') === 'inside';
                let gravity = 'right';
                let paddingRight = 0;
                let marginLeft = 0;
                let top = 0;
                let left = 0;
                let image: string | undefined;
                if (mainData.imageSrc !== '') {
                    const resource = <android.base.Resource<T>> this.resource;
                    if (mainData.imagePosition) {
                        ({ top, left } = getBackgroundPosition(mainData.imagePosition, node.actualDimension, node.fontSize, resource.getImage(mainData.imageSrc)));
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
                            marginLeft = node.marginLeft;
                        }
                        minWidth = 0;
                    }
                    image = resource.addImageSrc(mainData.imageSrc);
                }
                if (gravity === 'left') {
                    minWidth += node.paddingLeft - left;
                    node.modifyBox(BOX_STANDARD.PADDING_LEFT);
                }
                else {
                    const length = ordinalValue.length || 1;
                    paddingRight = Math.max(minWidth / (image ? 6 : length * 4), 4);
                }
                const options = createViewAttribute();
                ordinal = application.createNode();
                ordinal.containerName = node.containerName + '_ORDINAL';
                if (inside) {
                    controller.addBeforeOutsideTemplate(
                        ordinal.id,
                        controller.renderNodeStatic(
                            CONTAINER_ANDROID.SPACE,
                            createViewAttribute(undefined, {
                                android: {
                                    minWidth: '@dimen/' + Resource.insertStoredAsset('dimens', node.tagName.toLowerCase() + '_space_indent', formatPX(minWidth))
                                }
                            })
                        ),
                        false
                    );
                    minWidth = MINWIDTH_INSIDE;
                }
                else if (columnCount === 3) {
                    container.android('layout_columnSpan', '2');
                }
                if (node.tagName === 'DT' && !image) {
                    container.android('layout_columnSpan', columnCount.toString());
                }
                else {
                    if (image) {
                        ordinal.setControlType(CONTAINER_ANDROID.IMAGE, CONTAINER_NODE.IMAGE);
                        Object.assign(options.android, {
                            src: '@drawable/' + image,
                            scaleType: !inside && gravity === 'right' ? 'fitEnd' : 'fitStart',
                            baselineAlignBottom: adjustPadding ? 'true' : ''
                        });
                    }
                    else if (ordinalValue) {
                        ordinal.textContent = ordinalValue;
                        ordinal.inlineText = true;
                        ordinal.setControlType(CONTAINER_ANDROID.TEXT, CONTAINER_NODE.TEXT);
                        if (node.tagName === 'DFN') {
                            minWidth += PADDINGRIGHT_DFN;
                            ordinal.modifyBox(BOX_STANDARD.PADDING_RIGHT, PADDINGRIGHT_DFN);
                        }
                    }
                    else {
                        ordinal.setControlType(CONTAINER_ANDROID.SPACE, CONTAINER_NODE.SPACE);
                        ordinal.renderExclude = false;
                        node.modifyBox(BOX_STANDARD.PADDING_LEFT);
                    }
                    ordinal.depth = node.depth;
                    ordinal.inherit(node, 'textStyle');
                    if (ordinalValue && !ordinalValue.endsWith('.')) {
                        ordinal.fontSize *= 0.75;
                    }
                    ordinal.cssApply({
                        minWidth: minWidth > 0 ? formatPX(minWidth) : '',
                        marginTop: node.marginTop !== 0 ? formatPX(node.marginTop) : '',
                        marginLeft: marginLeft > 0 ? formatPX(marginLeft) : '',
                        paddingTop: node.paddingTop > 0 && node.getBox(BOX_STANDARD.PADDING_TOP)[0] === 0 ? formatPX(node.paddingTop) : '',
                        paddingRight: paddingRight > 0 && gravity === 'right' ? formatPX(paddingRight) : '',
                        paddingLeft: paddingRight > 0 && gravity === 'left' && (!image || mainData.imagePosition) ? formatPX(paddingRight) : '',
                        lineHeight: node.lineHeight > 0 ? formatPX(node.lineHeight) : ''
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
                        ordinal.modifyBox(BOX_STANDARD.MARGIN_TOP, top);
                    }
                    if (left !== 0) {
                        ordinal.modifyBox(BOX_STANDARD.MARGIN_LEFT, left);
                    }
                    ordinal.render(parent);
                    application.addLayoutTemplate(
                        parent,
                        ordinal,
                        <NodeXmlTemplate<T>> {
                            type: NODE_TEMPLATE.XML,
                            node: ordinal,
                            controlName: ordinal.controlName
                        }
                    );
                    register = true;
                }
            }
            ordinal.positioned = true;
            if (adjustPadding) {
                if (isNaN(resetPadding) || resetPadding <= 0) {
                    parent.modifyBox(parent.paddingLeft > 0 ? BOX_STANDARD.PADDING_LEFT : BOX_STANDARD.MARGIN_LEFT);
                }
                if (resetPadding < 0) {
                    parent.modifyBox(BOX_STANDARD.MARGIN_LEFT, resetPadding);
                }
            }
            if (columnCount > 0) {
                container.setLayoutWidth('0px');
                container.android('layout_columnWeight', '1');
                if (container !== node) {
                    if (node.baseline) {
                        container.android('baselineAlignedChildIndex', '0');
                    }
                }
                else if (node.filter((item: T) => item.visible).length > 1 && NodeUI.linearData(node.children).linearY) {
                    node.addAlign(NODE_ALIGNMENT.TOP);
                }
            }
            if (node !== container) {
                if (node.marginTop !== 0) {
                    container.modifyBox(BOX_STANDARD.MARGIN_TOP, node.marginTop);
                    node.modifyBox(BOX_STANDARD.MARGIN_TOP);
                    node.outerWrapper = container;
                    container.innerWrapped = node;
                    if (register) {
                        container.registerBox(BOX_STANDARD.MARGIN_TOP, ordinal);
                    }
                }
                return {
                    parent: container,
                    renderAs: container,
                    outputAs: application.renderNode(new $LayoutUI(
                        parent,
                        container,
                        CONTAINER_NODE.LINEAR,
                        NODE_ALIGNMENT.VERTICAL | NODE_ALIGNMENT.UNKNOWN,
                        container.children as T[]
                    ))
                };
            }
            else if (register) {
                node.registerBox(BOX_STANDARD.MARGIN_TOP, ordinal);
            }
        }
        return undefined;
    }
}