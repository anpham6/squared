import { NodeXmlTemplate } from '../../../@types/base/application';
import { ListData } from '../../../@types/base/extension';

import Resource from '../resource';
import View from '../view';

import { CONTAINER_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';
import { createViewAttribute } from '../lib/util';

import $LayoutUI = squared.base.LayoutUI;

const {
    css: $css,
    util: $util,
} = squared.lib;

const {
    constant: $c,
    enumeration: $e
} = squared.base.lib;

const $NodeUI = squared.base.NodeUI;

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
                layout.setContainerType(CONTAINER_NODE.GRID, $e.NODE_ALIGNMENT.AUTO_LAYOUT);
            }
            else if (layout.linearX || layout.singleRowAligned) {
                layout.rowCount = 1;
                layout.columnCount = layout.length;
                layout.setContainerType(CONTAINER_NODE.LINEAR, $e.NODE_ALIGNMENT.HORIZONTAL);
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
        const mainData: ListData = node.data($c.EXT_NAME.LIST, $c.STRING_BASE.EXT_DATA);
        if (mainData) {
            const application = this.application;
            const controller = this.controller;
            const firstChild = parent.firstStaticChild === node;
            let minWidth = node.marginLeft;
            let columnCount = 0;
            let adjustPadding = false;
            let resetPadding = NaN;
            node.modifyBox($e.BOX_STANDARD.MARGIN_LEFT);
            if (parent.is(CONTAINER_NODE.GRID)) {
                columnCount = $util.convertInt(parent.android('columnCount'));
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
            let ordinal = !mainData.ordinal ? node.find((item: T) => item.float === 'left' && item.marginLeft < 0 && Math.abs(item.marginLeft) <= item.documentParent.marginLeft) as T : undefined;
            let register = false;
            if (ordinal) {
                const layoutOrdinal = new $LayoutUI(parent, ordinal);
                if (ordinal.inlineText || ordinal.length === 0) {
                    layoutOrdinal.containerType = CONTAINER_NODE.TEXT;
                }
                else {
                    if (layoutOrdinal.singleRowAligned) {
                        layoutOrdinal.setContainerType(CONTAINER_NODE.RELATIVE, $e.NODE_ALIGNMENT.HORIZONTAL);
                    }
                    else {
                        layoutOrdinal.setContainerType(CONTAINER_NODE.CONSTRAINT, $e.NODE_ALIGNMENT.UNKNOWN);
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
                    ordinal.android('minWidth', $css.formatPX(minWidth));
                }
                ordinal.modifyBox($e.BOX_STANDARD.MARGIN_LEFT);
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
                    if (mainData.imagePosition) {
                        ({ top, left } = $css.getBackgroundPosition(mainData.imagePosition, node.actualDimension, this.resource.getImage(mainData.imageSrc), node.fontSize));
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
                    image = (<android.base.Resource<T>> this.resource).addImageSrc(mainData.imageSrc);
                }
                if (gravity === 'left') {
                    minWidth += node.paddingLeft - left;
                    node.modifyBox($e.BOX_STANDARD.PADDING_LEFT);
                }
                else {
                    const length = mainData.ordinal ? mainData.ordinal.length : 1;
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
                            createViewAttribute(undefined, { minWidth: '@dimen/' + Resource.insertStoredAsset('dimens', node.tagName.toLowerCase() + '_space_indent', $css.formatPX(minWidth)) })
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
                    else if (mainData.ordinal) {
                        ordinal.textContent = mainData.ordinal;
                        ordinal.inlineText = true;
                        ordinal.setControlType(CONTAINER_ANDROID.TEXT, CONTAINER_NODE.TEXT);
                        if (node.tagName === 'DFN') {
                            minWidth += PADDINGRIGHT_DFN;
                            ordinal.modifyBox($e.BOX_STANDARD.PADDING_RIGHT, PADDINGRIGHT_DFN);
                        }
                    }
                    else {
                        ordinal.setControlType(CONTAINER_ANDROID.SPACE, CONTAINER_NODE.SPACE);
                        ordinal.renderExclude = false;
                        node.modifyBox($e.BOX_STANDARD.PADDING_LEFT);
                    }
                    ordinal.depth = node.depth;
                    ordinal.inherit(node, 'textStyle');
                    if (mainData.ordinal && !mainData.ordinal.endsWith('.')) {
                        ordinal.fontSize *= 0.75;
                    }
                    ordinal.cssApply({
                        minWidth: minWidth > 0 ? $css.formatPX(minWidth) : '',
                        marginTop: node.marginTop !== 0 ? $css.formatPX(node.marginTop) : '',
                        marginLeft: marginLeft > 0 ? $css.formatPX(marginLeft) : '',
                        paddingTop: node.paddingTop > 0 && node.getBox($e.BOX_STANDARD.PADDING_TOP)[0] === 0 ? $css.formatPX(node.paddingTop) : '',
                        paddingRight: paddingRight > 0 && gravity === 'right' ? $css.formatPX(paddingRight) : '',
                        paddingLeft: paddingRight > 0 && gravity === 'left' && (!image || mainData.imagePosition) ? $css.formatPX(paddingRight) : '',
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
                        ordinal.modifyBox($e.BOX_STANDARD.MARGIN_TOP, top);
                    }
                    if (left !== 0) {
                        ordinal.modifyBox($e.BOX_STANDARD.MARGIN_LEFT, left);
                    }
                    ordinal.render(parent);
                    application.addLayoutTemplate(
                        parent,
                        ordinal,
                        <NodeXmlTemplate<T>> {
                            type: $e.NODE_TEMPLATE.XML,
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
                    parent.modifyBox(parent.paddingLeft > 0 ? $e.BOX_STANDARD.PADDING_LEFT : $e.BOX_STANDARD.MARGIN_LEFT);
                }
                if (resetPadding < 0) {
                    parent.modifyBox($e.BOX_STANDARD.MARGIN_LEFT, resetPadding);
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
                else if (node.filter((item: T) => item.visible).length > 1 && $NodeUI.linearData(node.children).linearY) {
                    node.addAlign($e.NODE_ALIGNMENT.TOP);
                }
            }
            if (node !== container) {
                if (node.marginTop !== 0) {
                    container.modifyBox($e.BOX_STANDARD.MARGIN_TOP, node.marginTop);
                    node.modifyBox($e.BOX_STANDARD.MARGIN_TOP);
                    node.outerWrapper = container;
                    container.innerWrapped = node;
                    if (register) {
                        container.registerBox($e.BOX_STANDARD.MARGIN_TOP, ordinal);
                    }
                }
                return {
                    parent: container,
                    renderAs: container,
                    outputAs: application.renderNode(new $LayoutUI(
                        parent,
                        container,
                        CONTAINER_NODE.LINEAR,
                        $e.NODE_ALIGNMENT.VERTICAL | $e.NODE_ALIGNMENT.UNKNOWN,
                        container.children as T[]
                    ))
                };
            }
            else if (register) {
                node.registerBox($e.BOX_STANDARD.MARGIN_TOP, ordinal);
            }
        }
        return undefined;
    }
}