import { TableData } from '../../../src/base/@types/extension';

import View from '../view';

import { CONTAINER_NODE } from '../lib/enumeration';

import $Layout = squared.base.Layout;

const $const = squared.base.lib.constant;
const $enum = squared.base.lib.enumeration;
const $util = squared.lib.util;

export default class <T extends View> extends squared.base.extensions.Table<T> {
    public processNode(node: T, parent: T) {
        super.processNode(node, parent);
        const mainData: TableData = node.data($const.EXT_NAME.TABLE, 'mainData');
        if (mainData) {
            if (mainData.columnCount > 1) {
                let requireWidth = !!node.data($const.EXT_NAME.TABLE, 'expand');
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
                                    requireWidth = true;
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
                                if (item.has('width') && item.toFloat('width') < item.bounds.width) {
                                    item.android('layout_width', $util.formatPX(item.bounds.width));
                                }
                            }
                        }
                    }
                });
                if (requireWidth && !node.hasWidth) {
                    const actualWidth = node.actualWidth;
                    let parentWidth = 0;
                    node.ascend().some(item => {
                        if (item.hasWidth) {
                            parentWidth = item.bounds.width;
                            return true;
                        }
                        return false;
                    });
                    if (actualWidth >= parentWidth) {
                        node.android('layout_width', 'match_parent');
                    }
                    else {
                        node.css('width', $util.formatPX(actualWidth), true);
                    }
                }
            }
            const layout = new $Layout(
                parent,
                node,
                CONTAINER_NODE.GRID,
                $enum.NODE_ALIGNMENT.AUTO_LAYOUT,
                node.length,
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
        return undefined;
    }

    public postProcedure(node: T) {
        const layoutWidth = $util.convertInt(node.android('layout_width'));
        if (layoutWidth > 0) {
            const actualWidth = node.bounds.width;
            if (actualWidth > layoutWidth) {
                node.android('layout_width', $util.formatPX(actualWidth));
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