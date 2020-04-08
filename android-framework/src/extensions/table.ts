import { TableData, TableCellData } from '../../../@types/base/extension';

import View from '../view';

import { CONTAINER_NODE } from '../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

const $lib = squared.lib;
const $base_lib = squared.base.lib;

const { CSS_UNIT, formatPX } = $lib.css;
const { convertFloat, convertInt, trimEnd } = $lib.util;

const { NODE_ALIGNMENT } = $base_lib.enumeration;

const TABLE = $base_lib.constant.EXT_NAME.TABLE;

function setLayoutHeight(node: View) {
    if (node.hasPX('height') && node.height + node.contentBoxHeight < Math.floor(node.bounds.height) && node.css('verticalAlign') !== 'top') {
        node.setLayoutHeight('wrap_content');
    }
}

export default class <T extends View> extends squared.base.extensions.Table<T> {
    public processNode(node: T, parent: T) {
        super.processNode(node, parent);
        const mainData: TableData = node.data(TABLE, 'mainData');
        let requireWidth = false;
        if (mainData.columnCount > 1) {
            requireWidth = mainData.expand;
            node.each((item: T) => {
                const data: TableCellData = item.data(TABLE, 'cellData');
                if (data.flexible) {
                    item.android('layout_columnWeight', data.colSpan.toString());
                    item.setLayoutWidth('0px');
                    requireWidth = true;
                }
                else {
                    const { downsized, expand, percent } = data;
                    if (expand) {
                        if (percent) {
                            const value = convertFloat(percent) / 100;
                            if (value > 0) {
                                item.setLayoutWidth('0px');
                                item.android('layout_columnWeight', trimEnd(value.toPrecision(3), '0'));
                                requireWidth = true;
                            }
                        }
                    }
                    else if (expand === false) {
                        item.android('layout_columnWeight', '0');
                    }
                    if (downsized) {
                        if (data.exceed) {
                            item.setLayoutWidth('0px');
                            item.android('layout_columnWeight', '0.01');
                            requireWidth = true;
                        }
                        else if (item.hasPX('width')) {
                            const width = item.bounds.width;
                            if (item.actualWidth < width) {
                                item.setLayoutWidth(formatPX(width));
                            }
                        }
                    }
                }
                if (item.tagName === 'TD') {
                    item.setSingleLine(true);
                }
                setLayoutHeight(item);
            });
        }
        else {
            node.each((item: T) => {
                if (item.has('width', { type: CSS_UNIT.PERCENT })) {
                    item.setLayoutWidth('wrap_content');
                    requireWidth = true;
                }
                setLayoutHeight(item);
            });
        }
        if (node.hasWidth) {
            if (node.width < Math.floor(node.bounds.width)) {
                if (mainData.layoutFixed) {
                    node.android('width', formatPX(node.bounds.width));
                }
                else {
                    if (!node.hasPX('minWidth')) {
                        node.android('minWidth', formatPX(node.actualWidth));
                    }
                    node.css('width', 'auto');
                }
            }
        }
        else if (requireWidth) {
            if ((parent.blockStatic || parent.hasPX('width')) && Math.ceil(node.bounds.width) >= parent.box.width) {
                node.setLayoutWidth('match_parent');
            }
            else {
                node.css('width', formatPX(node.actualWidth));
            }
        }
        if (node.hasHeight && node.height < Math.floor(node.bounds.height)) {
            if (!node.hasPX('minHeight')) {
                node.android('minHeight', formatPX(node.actualHeight));
            }
            node.css('height', 'auto');
        }
        return {
            output: this.application.renderNode(LayoutUI.create({
                parent,
                node,
                containerType: CONTAINER_NODE.GRID,
                alignmentType: NODE_ALIGNMENT.AUTO_LAYOUT,
                children: node.children as T[],
                rowCount: mainData.rowCount,
                columnCount: mainData.columnCount
            })),
            include: true,
            complete: true
        };
    }

    public processChild(node: T, parent: T) {
        const cellData: TableCellData = node.data(TABLE, 'cellData');
        if (cellData) {
            const { rowSpan, colSpan, spaceSpan } = cellData;
            if (rowSpan > 1) {
                node.android('layout_rowSpan', rowSpan.toString());
            }
            if (colSpan > 1) {
                node.android('layout_columnSpan', colSpan.toString());
            }
            if (spaceSpan) {
                const controller = <android.base.Controller<T>> this.controller;
                controller.addAfterOutsideTemplate(
                    node.id,
                    controller.renderSpace({
                        width: 'wrap_content',
                        height: 'wrap_content',
                        columnSpan: spaceSpan,
                        android: {}
                    }),
                    false
                );
            }
            node.mergeGravity('layout_gravity', 'fill');
            if (parent.css('empty-cells') === 'hide' && node.naturalChildren.length === 0 && node.textContent === '') {
                node.hide({ hidden: true });
            }
        }
        return undefined;
    }

    public postOptimize(node: T) {
        const layoutWidth = convertInt(node.layoutWidth);
        if (layoutWidth > 0) {
            const width = node.bounds.width;
            if (width > layoutWidth) {
                node.setLayoutWidth(formatPX(width));
            }
            if (node.cssInitial('width') === 'auto' && node.renderChildren.every(item => item.inlineWidth)) {
                node.renderEach((item: T) => {
                    item.setLayoutWidth('0px');
                    item.android('layout_columnWeight', '1');
                });
            }
        }
    }
}