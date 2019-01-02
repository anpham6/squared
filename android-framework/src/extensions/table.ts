import { ExtensionResult } from '../../../src/base/@types/application';
import { TableData } from '../../../src/base/@types/extension';

import { CONTAINER_NODE } from '../lib/enumeration';

import View from '../view';

import $Layout = squared.base.Layout;

const $const = squared.base.lib.constant;
const $enum = squared.base.lib.enumeration;
const $util = squared.lib.util;

export default class <T extends View> extends squared.base.extensions.Table<T> {
    public processNode(node: T, parent: T): ExtensionResult<T> {
        super.processNode(node, parent);
        const mainData: TableData = node.data($const.EXT_NAME.TABLE, 'mainData');
        let output = '';
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
                                    item.android('layout_columnWeight', $util.trimEnd(percent.toFixed(3), '0'));
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
                                if (item.has('width') && item.toInt('width') < item.bounds.width) {
                                    item.android('layout_width', $util.formatPX(item.bounds.width));
                                }
                            }
                        }
                    }
                });
                if (requireWidth && !node.hasWidth) {
                    let widthParent = 0;
                    node.ascend().some(item => {
                        if (item.hasWidth) {
                            widthParent = item.bounds.width;
                            return true;
                        }
                        return false;
                    });
                    if (node.bounds.width >= widthParent) {
                        node.android('layout_width', 'match_parent');
                    }
                    else {
                        node.css('width', $util.formatPX(node.bounds.width), true);
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
            output = this.application.renderNode(layout);
        }
        return { output, complete: output !== '' };
    }

    public processChild(node: T, parent: T): ExtensionResult<T> {
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
            this.application.controllerHandler.appendAfter(
                node.id,
                (<android.base.Controller<T>> this.application.controllerHandler).renderSpace(parent.renderDepth + 1, 'wrap_content', 'wrap_content', spaceSpan)
            );
        }
        return { output: '' };
    }

    public postProcedure(node: T) {
        const layoutWidth = $util.convertInt(node.android('layout_width'));
        if (layoutWidth > 0) {
            if (node.bounds.width > layoutWidth) {
                node.android('layout_width', $util.formatPX(node.bounds.width));
            }
            if (layoutWidth > 0 && node.cssInitial('width') === 'auto' && node.renderChildren.every(item => item.inlineWidth)) {
                for (const item of node.renderChildren) {
                    item.android('layout_width', '0px');
                    item.android('layout_columnWeight', '1');
                }
            }
        }
    }
}