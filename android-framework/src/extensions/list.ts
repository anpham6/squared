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
const $dom = squared.lib.dom;
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
        let output = '';
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
            output = this.application.renderNode(layout);
        }
        return { output, complete: output !== '' };
    }

    public processChild(node: T, parent: T): ExtensionResult<T> {
        const mainData: ListData = node.data($const.EXT_NAME.LIST, 'mainData');
        let output = '';
        if (mainData) {
            const controller = <android.base.Controller<T>> this.application.controllerHandler;
            const parentLeft = $util.convertInt(parent.css('paddingLeft')) + $util.convertInt(parent.css('marginLeft'));
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
            const ordinal = node.find(item => item.float === 'left' && item.marginLeft < 0 && Math.abs(item.marginLeft) <= $util.convertInt(item.documentParent.cssInitial('marginLeft'))) as T | undefined;
            if (ordinal && mainData.ordinal === '') {
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
                controller.prependBefore(node.id, this.application.renderNode(layout));
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
                const positionInside = node.css('listStylePosition') === 'inside';
                let left = 0;
                let top = 0;
                let image = '';
                if (mainData.imageSrc !== '') {
                    const boxPosition = $dom.cssBackgroundPosition(mainData.imagePosition, node.bounds, node.fontSize);
                    left = boxPosition.left;
                    top = boxPosition.top;
                    image = Resource.addImageUrl(mainData.imageSrc);
                }
                const gravity = image !== '' && !node.has('listStyleImage') || parentLeft === 0 && node.marginLeft === 0 ? '' : 'right';
                if (gravity === '') {
                    paddingLeft += node.paddingLeft;
                    node.modifyBox($enum.BOX_STANDARD.PADDING_LEFT, null);
                }
                if (left > 0 && paddingLeft > left) {
                    paddingLeft -= left;
                }
                paddingLeft = Math.max(paddingLeft, 20);
                const paddingRight = (() => {
                    if (paddingLeft <= 24) {
                        return 6;
                    }
                    else if (paddingLeft <= 32) {
                        return 8;
                    }
                    else {
                        return 10;
                    }
                })();
                const marginLeft = left > 0 ? $util.formatPX(left) : '';
                const minWidth = paddingLeft > 0 ? $util.formatPX(paddingLeft) : '';
                const options = createViewAttribute({
                    android: {
                        layout_columnWeight: columnWeight
                    }
                });
                if (positionInside) {
                    const xml = controller.renderNodeStatic(
                        CONTAINER_ANDROID.SPACE,
                        parent.renderDepth + 1,
                        {
                            android: {
                                minWidth,
                                layout_columnWeight: columnWeight,
                                [node.localizeString(BOX_ANDROID.MARGIN_LEFT)]: marginLeft
                            }
                        },
                        'wrap_content',
                        'wrap_content'
                    );
                    controller.prependBefore(node.id, xml);
                    options.android.minWidth = $util.formatPX('24');
                }
                else {
                    Object.assign(options.android, {
                        minWidth,
                        gravity: paddingLeft > 20 ? node.localizeString(gravity) : '',
                        [BOX_ANDROID.MARGIN_TOP]: node === parent.children[0] && node.marginTop > 0 ? $util.formatPX(node.marginTop) : '',
                        [node.localizeString(BOX_ANDROID.MARGIN_LEFT)]: marginLeft,
                        [node.localizeString(BOX_ANDROID.PADDING_LEFT)]: gravity === '' && image === '' ? $util.formatPX(paddingRight) : (paddingLeft === 20 ? '2px' : ''),
                        [node.localizeString(BOX_ANDROID.PADDING_RIGHT)]: gravity === 'right' && paddingLeft > 20 ? $util.formatPX(paddingRight) : '',
                        [BOX_ANDROID.PADDING_TOP]: node.paddingTop > 0 ? $util.formatPX(node.paddingTop) : ''
                    });
                    if (columnCount === 3) {
                        node.android('layout_columnSpan', '2');
                    }
                }
                if (node.tagName === 'DT' && image === '') {
                    node.android('layout_columnSpan', columnCount.toString());
                }
                else {
                    if (image !== '') {
                        Object.assign(options.android, {
                            src: `@drawable/${image}`,
                            [BOX_ANDROID.MARGIN_TOP]: top > 0 ? $util.formatPX(top) : '',
                            scaleType: !positionInside && gravity === 'right' ? 'fitEnd' : 'fitStart'
                        });
                    }
                    else {
                        options.android.text = mainData.ordinal;
                    }
                    const companion = this.application.createNode($dom.createElement(node.actualParent ? node.actualParent.element : null));
                    companion.tagName = `${node.tagName}_ORDINAL`;
                    companion.inherit(node, 'textStyle');
                    if (mainData.ordinal !== '' && !/[A-Za-z\d]+\./.test(mainData.ordinal) && companion.toInt('fontSize') > 12) {
                        companion.css('fontSize', '12px');
                    }
                    this.application.processing.cache.append(companion, false);
                    const xml = controller.renderNodeStatic(
                        image !== '' ? CONTAINER_ANDROID.IMAGE : (mainData.ordinal !== '' ? CONTAINER_ANDROID.TEXT : CONTAINER_ANDROID.SPACE),
                        parent.renderDepth + 1,
                        options,
                        'wrap_content',
                        'wrap_content',
                        companion
                    );
                    controller.prependBefore(node.id, xml);
                }
            }
            if (columnCount > 0) {
                node.android('layout_width', '0px');
                node.android('layout_columnWeight', '1');
            }
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
                output = this.application.renderNode(layout);
            }
        }
        return { output, next: output !== '' };
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
                if (marginBottom > 0) {
                    spaceHeight += marginBottom;
                    previous.delete('android', BOX_ANDROID.MARGIN_BOTTOM);
                    previous.modifyBox($enum.BOX_STANDARD.MARGIN_BOTTOM, null);
                }
            }
            const marginTop = $util.convertInt(item.android(BOX_ANDROID.MARGIN_TOP));
            if (marginTop > 0) {
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
                const output = controller.renderNodeStatic(CONTAINER_ANDROID.SPACE, item.renderDepth, options, 'match_parent', $util.formatPX(spaceHeight));
                controller.prependBefore(item.id, output, 0);
            }
        }
    }

    public postProcedure(node: T) {
        if (node.blockStatic && node.inlineWidth) {
            node.android('layout_width', 'match_parent');
        }
    }
}