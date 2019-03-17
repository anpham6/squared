import { ExtensionResult } from '../../../src/base/@types/application';
import { ListData } from '../../../src/base/@types/extension';

import Resource from '../resource';
import View from '../view';

import { BOX_ANDROID, CONTAINER_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';
import { createViewAttribute } from '../lib/util';

import $Layout = squared.base.Layout;
import $NodeList = squared.base.NodeList;

const $const = squared.base.lib.constant;
const $enum = squared.base.lib.enumeration;
const $css = squared.lib.css;
const $element = squared.lib.element;
const $util = squared.lib.util;

export default class <T extends View> extends squared.base.extensions.List<T> {
    public processNode(node: T, parent: T): ExtensionResult<T> {
        super.processNode(node, parent);
        const layout = new $Layout(
            parent,
            node,
            0,
            0,
            node.length,
            node.children as T[]
        );
        if ($NodeList.linearY(layout.children)) {
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
        return { output: '' };
    }

    public processChild(node: T, parent: T): ExtensionResult<T> {
        const mainData: ListData = node.data($const.EXT_NAME.LIST, 'mainData');
        if (mainData) {
            const controller = <android.base.Controller<T>> this.application.controllerHandler;
            const parentLeft = parent.paddingLeft + parent.marginLeft;
            let columnCount = 0;
            let paddingLeft = node.marginLeft;
            node.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, null);
            if (parent.is(CONTAINER_NODE.GRID)) {
                columnCount = $util.convertInt(parent.android('columnCount'));
                paddingLeft += parentLeft;
            }
            else if (parent.item(0) === node) {
                paddingLeft += parentLeft;
            }
            const ordinal = mainData.ordinal === '' && node.find(item => item.float === 'left' && item.marginLeft < 0 && Math.abs(item.marginLeft) <= item.documentParent.marginLeft) as T | undefined;
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
                controller.addBeforeOutsideTemplate(node.id, this.application.renderNode(layout));
                if (columnCount === 3) {
                    node.android('layout_columnSpan', '2');
                }
                paddingLeft += ordinal.marginLeft;
                if (paddingLeft > 0 && !ordinal.hasWidth) {
                    ordinal.android('minWidth', $util.formatPX(paddingLeft));
                }
                ordinal.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, null);
            }
            else {
                const columnWeight = columnCount > 0 ? '0' : '';
                const inside = node.css('listStylePosition') === 'inside';
                let gravity = '';
                let image: string | undefined;
                let top: number | undefined;
                let left: number | undefined;
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
                const paddingRight = (() => {
                    const ratio = image ? 2 : 1;
                    if (paddingLeft <= 24) {
                        return 6 / ratio;
                    }
                    else if (paddingLeft <= 32) {
                        return 8 / ratio;
                    }
                    else {
                        return 12 / ratio;
                    }
                })();
                let minWidth = paddingLeft > 0 ? $util.formatPX(paddingLeft) : '';
                const options = createViewAttribute({
                    android: {
                        layout_columnWeight: columnWeight
                    }
                });
                if (inside) {
                    const xml = controller.renderNodeStatic(
                        CONTAINER_ANDROID.SPACE,
                        parent.renderDepth + 1, {
                            android: {
                                minWidth,
                                layout_columnWeight: columnWeight
                            }
                        },
                        'wrap_content',
                        'wrap_content'
                    );
                    controller.addBeforeOutsideTemplate(node.id, xml);
                    minWidth = '24px';
                }
                else if (columnCount === 3) {
                    node.android('layout_columnSpan', '2');
                }
                if (node.tagName === 'DT' && !image) {
                    node.android('layout_columnSpan', columnCount.toString());
                }
                else {
                    const companion = this.application.createNode($element.createElement(node.actualParent ? node.actualParent.element : null));
                    companion.tagName = `${node.tagName}_ORDINAL`;
                    if (image) {
                        Object.assign(options.android, {
                            src: `@drawable/${image}`,
                            scaleType: !inside && gravity === 'right' ? 'fitEnd' : 'fitStart'
                        });
                        companion.setControlType(CONTAINER_ANDROID.IMAGE);
                    }
                    else {
                        options.android.text = mainData.ordinal;
                        companion.setControlType(mainData.ordinal !== '' ? CONTAINER_ANDROID.TEXT : CONTAINER_ANDROID.SPACE);
                    }
                    companion.inherit(node, 'textStyle');
                    companion.cssApply({
                        minWidth,
                        marginTop: node.marginTop !== 0 ? $util.formatPX(node.marginTop) : '',
                        paddingTop: node.paddingTop > 0 ? $util.formatPX(node.paddingTop) : '',
                        paddingRight: gravity === 'right' ? $util.formatPX(paddingRight) : '',
                        paddingLeft: gravity === '' && !image ? $util.formatPX(paddingRight) : '',
                        fontSize: mainData.ordinal !== '' && !/[A-Za-z\d]+\./.test(mainData.ordinal) && companion.toInt('fontSize') > 12 ? '12px' : ''
                    });
                    if (!inside && paddingLeft > 20) {
                        companion.mergeGravity('gravity', node.localizeString(gravity));
                    }
                    if (top) {
                        companion.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, top);
                    }
                    if (left) {
                        companion.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, left);
                    }
                    node.companion = companion;
                    companion.render(parent);
                    this.application.processing.cache.append(companion, false);
                    const xml = controller.renderNodeStatic(
                        companion.controlName,
                        parent.renderDepth + 1,
                        options,
                        'wrap_content',
                        'wrap_content',
                        companion
                    );
                    this.application.addRenderTemplate(parent, companion, xml);
                }
            }
            if (columnCount > 0) {
                node.android('layout_width', '0px');
                node.android('layout_columnWeight', '1');
            }
            if (node.length) {
                const linearX = $NodeList.linearX(node.children);
                if (linearX || $NodeList.linearY(node.children)) {
                    const layout = new $Layout(
                        parent,
                        node,
                        CONTAINER_NODE.LINEAR,
                        linearX ? $enum.NODE_ALIGNMENT.HORIZONTAL : $enum.NODE_ALIGNMENT.VERTICAL,
                        node.length,
                        node.children as T[]
                    );
                    return {
                        output: this.application.renderNode(layout),
                        next: true
                    };
                }
            }
        }
        return { output: '' };
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
                    controller.renderNodeStatic(CONTAINER_ANDROID.SPACE, item.renderDepth, options, 'match_parent', $util.formatPX(spaceHeight)),
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