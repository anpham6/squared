import { TableData } from '../../../src/base/@types/extension';

import View from '../view';

import { CONTAINER_NODE } from '../lib/enumeration';

import $Layout = squared.base.Layout;

const $const = squared.base.lib.constant;
const $enum = squared.base.lib.enumeration;
const $css = squared.lib.css;
const $util = squared.lib.util;

export default class <T extends View> extends squared.base.extensions.Table<T> {
    public processNode(node: T, parent: T) {
        super.processNode(node, parent);
        const mainData: TableData = node.data($const.EXT_NAME.TABLE, 'mainData');
        if (mainData) {
            let requireWidth = false;
            if (mainData.columnCount > 1) {
                requireWidth = !!node.data($const.EXT_NAME.TABLE, 'expand');
                node.each((item: T) => {
                    if (item.css('width') === '0px') {
                        item.android('layout_width', '0px');
                        item.android('layout_columnWeight', ((<HTMLTableCellElement> item.element).colSpan || 1).toString());
                    }
                    else {
                        const expand: boolean | undefined = item.data($const.EXT_NAME.TABLE, 'expand');
                        const exceed: boolean = !!item.data($const.EXT_NAME.TABLE, 'exceed');
                        const downsized: boolean = !!item.data($const.EXT_NAME.TABLE, 'downsized');
                        if (typeof expand === 'boolean') {
                            if (expand) {
                                const percent = $util.convertFloat(item.data($const.EXT_NAME.TABLE, 'percent')) / 100;
                                if (percent > 0) {
                                    item.android('layout_width', '0px');
                                    item.android('layout_columnWeight', $util.trimEnd(percent.toPrecision(3), '0'));
                                    requireWidth = !node.hasWidth;
                                }
                            }
                            else {
                                item.android('layout_columnWeight', '0');
                            }
                        }
                        if (downsized) {
                            if (exceed) {
                                item.android('layout_width', '0px');
                                item.android('layout_columnWeight', '0.01');
                            }
                            else {
                                if (item.textElement && !/[\s\n\-]/.test(item.textContent.trim())) {
                                    item.android('maxLines', '1');
                                }
                                if (item.has('width') && item.actualWidth < item.bounds.width) {
                                    item.android('layout_width', $css.formatPX(item.bounds.width));
                                }
                            }
                        }
                    }
                });
                if (requireWidth) {
                    const above = node.ascend(false, item => item.hasWidth);
                    if (above.length && node.actualWidth >= above[0].actualWidth) {
                        node.android('layout_width', 'match_parent');
                    }
                    else {
                        node.css('width', $css.formatPX(node.actualWidth), true);
                    }
                }
            }
            if (!requireWidth && node.has('width') && node.actualWidth < Math.floor(node.bounds.width)) {
                if (mainData.layoutFixed) {
                    node.android('width', $css.formatPX(node.bounds.width), true);
                }
                else {
                    if (!node.has('minWidth')) {
                        node.android('minWidth', $css.formatPX(node.actualWidth));
                    }
                    node.css('width', 'auto', true);
                }
            }
            if (node.has('height') && node.actualHeight < Math.floor(node.bounds.height)) {
                if (!node.has('minHeight')) {
                    node.android('minHeight', $css.formatPX(node.actualHeight));
                }
                node.css('height', 'auto', true);
            }
            const layout = new $Layout(
                parent,
                node,
                CONTAINER_NODE.GRID,
                $enum.NODE_ALIGNMENT.AUTO_LAYOUT,
                node.children as T[]
            );
            layout.rowCount = mainData.rowCount;
            layout.columnCount = mainData.columnCount;
            return {
                output: this.application.renderNode(layout),
                complete: true
            };
        }
        return undefined;
    }

    public processChild(node: T, parent: T) {
        const rowSpan = $util.convertInt(node.data($const.EXT_NAME.TABLE, 'rowSpan'));
        const columnSpan = $util.convertInt(node.data($const.EXT_NAME.TABLE, 'colSpan'));
        const spaceSpan = $util.convertInt(node.data($const.EXT_NAME.TABLE, 'spaceSpan'));
        if (rowSpan > 1) {
            node.android('layout_rowSpan', rowSpan.toString());
        }
        if (columnSpan > 1) {
            node.android('layout_columnSpan', columnSpan.toString());
        }
        node.mergeGravity('layout_gravity', 'fill');
        if (spaceSpan > 0) {
            const controller = <android.base.Controller<T>> this.application.controllerHandler;
            controller.addAfterOutsideTemplate(node.id, controller.renderSpace('wrap_content', 'wrap_content', spaceSpan));
        }
        if (parent.css('empty-cells') === 'hide' && node.actualChildren.length === 0 && node.textContent === '') {
            node.hide(true);
        }
        return undefined;
    }

    public postOptimize(node: T) {
        const layoutWidth = $util.convertInt(node.android('layout_width'));
        if (layoutWidth > 0) {
            if (node.bounds.width > layoutWidth) {
                node.android('layout_width', $css.formatPX(node.bounds.width));
            }
            if (layoutWidth > 0 && node.cssInitial('width') === 'auto' && node.renderChildren.every(item => item.inlineWidth)) {
                node.renderEach((item: T) => {
                    item.android('layout_width', '0px');
                    item.android('layout_columnWeight', '1');
                });
            }
        }
    }
}