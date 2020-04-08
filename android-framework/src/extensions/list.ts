import { NodeXmlTemplate } from '../../../@types/base/application';
import { ListData } from '../../../@types/base/extension';

import View from '../view';

import { CONTAINER_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';
import { createViewAttribute } from '../lib/util';

import LayoutUI = squared.base.LayoutUI;

const $lib = squared.lib;
const $base_lib = squared.base.lib;

const { formatPX, getBackgroundPosition } = $lib.css;
const { convertInt } = $lib.util;
const { STRING_SPACE } = $lib.xml;

const { BOX_STANDARD, NODE_ALIGNMENT, NODE_TEMPLATE } = $base_lib.enumeration;

const LIST = $base_lib.constant.EXT_NAME.LIST;

export default class <T extends View> extends squared.base.extensions.List<T> {
    public processNode(node: T, parent: T) {
        const layout = new LayoutUI(parent, node, 0, 0, node.children as T[]);
        if (!layout.unknownAligned || layout.singleRowAligned) {
            super.processNode(node, parent);
            if (layout.linearY) {
                layout.rowCount = node.length;
                layout.columnCount = node.some(item => item.css('listStylePosition') === 'inside') ? 3 : 2;
                layout.setContainerType(CONTAINER_NODE.GRID, NODE_ALIGNMENT.VERTICAL);
            }
            else if (layout.linearX || layout.singleRowAligned) {
                layout.rowCount = 1;
                layout.columnCount = layout.length;
                layout.setContainerType(CONTAINER_NODE.LINEAR, NODE_ALIGNMENT.HORIZONTAL);
            }
            else {
                return undefined;
            }
            return {
                output: this.application.renderNode(layout),
                complete: true,
                include: true
            };
        }
        return undefined;
    }

    public processChild(node: T, parent: T) {
        const mainData: ListData = node.data(LIST, 'mainData');
        if (mainData) {
            const application = this.application;
            const controller = <android.base.Controller<T>> this.controller;
            const firstChild = parent.firstStaticChild === node;
            const marginTop = node.marginTop;
            let value = mainData.ordinal || '';
            let minWidth = node.marginLeft;
            let marginLeft = 0;
            let columnCount = 0;
            let adjustPadding = false;
            let resetPadding = NaN;
            node.setBox(BOX_STANDARD.MARGIN_LEFT, { reset: 1 });
            if (parent.layoutGrid) {
                columnCount = convertInt(parent.android('columnCount')) || 1;
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
            let container: T;
            if (node.length === 0) {
                container = controller.createNodeWrapper(node, parent, { ...controller.containerTypeVertical });
                node.resetBox(BOX_STANDARD.MARGIN_VERTICAL, container);
            }
            else {
                container = node;
            }
            let ordinal = value === '' ? node.find((item: T) => item.float === 'left' && item.marginLeft < 0 && Math.abs(item.marginLeft) <= item.documentParent.marginLeft) as Undef<T> : undefined;
            if (ordinal) {
                if (columnCount === 3) {
                    node.android('layout_columnSpan', '2');
                }
                if (!ordinal.hasWidth) {
                    minWidth += ordinal.marginLeft;
                    if (minWidth > 0) {
                        ordinal.android('minWidth', formatPX(minWidth));
                    }
                }
                ordinal.parent = parent;
                ordinal.setControlType(CONTAINER_ANDROID.TEXT, CONTAINER_NODE.INLINE);
                ordinal.setBox(BOX_STANDARD.MARGIN_LEFT, { reset: 1 });
                ordinal.render(parent);
                const layout = new LayoutUI(parent, ordinal);
                if (ordinal.inlineText || ordinal.length === 0) {
                    layout.setContainerType(CONTAINER_NODE.TEXT);
                }
                else {
                    if (layout.singleRowAligned) {
                        layout.setContainerType(CONTAINER_NODE.RELATIVE, NODE_ALIGNMENT.HORIZONTAL);
                    }
                    else {
                        layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.UNKNOWN);
                    }
                    layout.retain(ordinal.children as T[]);
                }
                application.addLayoutTemplate(parent, ordinal, application.renderNode(layout));
            }
            else {
                let gravity = 'right';
                let paddingRight = 0;
                let top = 0;
                let left = 0;
                let image: Undef<string>;
                if (mainData.imageSrc !== '') {
                    const resource = <android.base.Resource<T>> this.resource;
                    if (mainData.imagePosition) {
                        ({ top, left } = getBackgroundPosition(mainData.imagePosition, node.actualDimension, {
                            fontSize: node.fontSize,
                            imageDimension: resource.getImage(mainData.imageSrc),
                            screenDimension: node.localSettings.screenDimension
                        }));
                        if (node.marginLeft < 0) {
                            resetPadding = node.marginLeft + (parent.paddingLeft > 0 ? parent.paddingLeft : parent.marginLeft);
                        }
                        else {
                            adjustPadding = false;
                            marginLeft = node.marginLeft;
                        }
                        minWidth = node.paddingLeft - left;
                        node.setBox(BOX_STANDARD.PADDING_LEFT, { reset: 1 });
                        gravity = '';
                    }
                    image = resource.addImageSrc(mainData.imageSrc);
                }
                const options = createViewAttribute();
                ordinal = application.createNode({ parent });
                ordinal.childIndex = node.childIndex;
                ordinal.containerName = node.containerName + '_ORDINAL';
                ordinal.inherit(node, 'textStyle');
                if (value !== '' && !value.endsWith('.')) {
                    ordinal.setCacheValue('fontSize', ordinal.fontSize * 0.75);
                }
                if (gravity === 'right') {
                    if (image) {
                        paddingRight = Math.max(minWidth / 6, 4);
                        minWidth -= paddingRight;
                    }
                    else if (value !== '') {
                        value += STRING_SPACE.repeat(value.length === 1 ? 3 : 2);
                    }
                }
                if (columnCount === 3) {
                    container.android('layout_columnSpan', '2');
                }
                if (node.tagName === 'DT' && !image) {
                    container.android('layout_columnSpan', columnCount.toString());
                }
                else {
                    if (image) {
                        ordinal.setControlType(CONTAINER_ANDROID.IMAGE, CONTAINER_NODE.IMAGE);
                        Object.assign(options.android, {
                            src: `@drawable/${image}`,
                            scaleType: gravity === 'right' ? 'fitEnd' : 'fitStart',
                            baselineAlignBottom: adjustPadding ? 'true' : ''
                        });
                    }
                    else if (value !== '') {
                        ordinal.textContent = value;
                        ordinal.inlineText = true;
                        ordinal.setControlType(CONTAINER_ANDROID.TEXT, CONTAINER_NODE.TEXT);
                        if (node.tagName === 'DFN') {
                            minWidth += 8;
                            ordinal.modifyBox(BOX_STANDARD.PADDING_RIGHT, 8);
                        }
                    }
                    else {
                        ordinal.setControlType(CONTAINER_ANDROID.SPACE, CONTAINER_NODE.SPACE);
                        ordinal.renderExclude = false;
                        node.setBox(BOX_STANDARD.PADDING_LEFT, { reset: 1 });
                    }
                    const { paddingTop, lineHeight } = node;
                    ordinal.cssApply({
                        minWidth: minWidth > 0 ? formatPX(minWidth) : '',
                        marginLeft: marginLeft > 0 ? formatPX(marginLeft) : '',
                        paddingTop: paddingTop > 0 && node.getBox(BOX_STANDARD.PADDING_TOP)[0] === 0 ? formatPX(paddingTop) : '',
                        paddingRight: paddingRight > 0 ? formatPX(paddingRight) : '',
                        lineHeight: lineHeight > 0 ? formatPX(lineHeight) : ''
                    });
                    ordinal.apply(options);
                    ordinal.modifyBox(BOX_STANDARD.PADDING_LEFT, 2);
                    if (ordinal.cssTry('display', 'block')) {
                        ordinal.setBounds();
                        ordinal.cssFinally('display');
                    }
                    ordinal.saveAsInitial();
                    if (gravity !== '') {
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
                }
            }
            if (marginTop !== 0) {
                ordinal.modifyBox(BOX_STANDARD.MARGIN_TOP, marginTop);
                ordinal.companion = container;
                this.subscribers.add(ordinal);
            }
            ordinal.positioned = true;
            if (adjustPadding) {
                if (isNaN(resetPadding) || resetPadding <= 0) {
                    parent.setBox(parent.paddingLeft > 0 ? BOX_STANDARD.PADDING_LEFT : BOX_STANDARD.MARGIN_LEFT, { reset: 1 });
                }
                if (resetPadding < 0) {
                    parent.modifyBox(BOX_STANDARD.MARGIN_LEFT, resetPadding);
                }
            }
            if (columnCount > 0) {
                container.setLayoutWidth('0px');
                container.android('layout_columnWeight', '1');
            }
            if (node !== container) {
                return {
                    parent: container,
                    renderAs: container,
                    outputAs: application.renderNode(new LayoutUI(
                        parent,
                        container,
                        CONTAINER_NODE.LINEAR,
                        NODE_ALIGNMENT.VERTICAL | NODE_ALIGNMENT.UNKNOWN,
                        container.children as T[]
                    )),
                    subscribe: true
                };
            }
        }
        return undefined;
    }

    public postConstraints(node: T) {
        const companion = !node.naturalChild && node.companion;
        if (companion) {
            const [reset, adjustment] = companion.getBox(BOX_STANDARD.MARGIN_TOP);
            if (reset === 0) {
                node.modifyBox(BOX_STANDARD.MARGIN_TOP, adjustment - node.getBox(BOX_STANDARD.MARGIN_TOP)[1], false);
            }
            else {
                node.setBox(BOX_STANDARD.MARGIN_TOP, { adjustment: 0 });
            }
        }
    }
}