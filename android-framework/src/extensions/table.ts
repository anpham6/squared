import { TableData, TableCellData } from '../../../@types/base/extension';

import View from '../view';

import { CONTAINER_NODE } from '../lib/enumeration';

import $LayoutUI = squared.base.LayoutUI;

const $lib = squared.lib;
const { formatPX } = $lib.css;
const { aboveRange, convertFloat, convertInt, trimEnd } = $lib.util;

const { UNITZERO } = $lib.regex.CHAR;

const $base_lib = squared.base.lib;
const { TABLE } = $base_lib.constant.EXT_NAME;
const { CSS_UNIT, NODE_ALIGNMENT } = $base_lib.enumeration;

function setLayoutHeight(node: View) {
    if (node.hasPX('height') && node.height + node.contentBoxHeight < Math.floor(node.bounds.height) && node.css('verticalAlign') !== 'top') {
        node.setLayoutHeight('wrap_content');
    }
}

export default class <T extends View> extends squared.base.extensions.Table<T> {
    public processNode(node: T, parent: T) {
        super.processNode(node, parent);
        const mainData: TableData = node.data(TABLE, 'mainData');
        if (mainData) {
            let requireWidth = false;
            if (mainData.columnCount > 1) {
                requireWidth = mainData.expand;
                node.each((item: T) => {
                    const data = item.data(TABLE, 'cellData');
                    if (UNITZERO.test(item.css('width'))) {
                        item.setLayoutWidth('0px');
                        item.android('layout_columnWeight', item.toElementString('colSpan', '1'));
                    }
                    else {
                        const expand: boolean | undefined = data.expand;
                        if (expand) {
                            const percent = convertFloat(data.percent) / 100;
                            if (percent > 0) {
                                item.setLayoutWidth('0px');
                                item.android('layout_columnWeight', trimEnd(percent.toPrecision(3), '0'));
                                if (!requireWidth) {
                                    requireWidth = !item.hasWidth;
                                }
                            }
                        }
                        else if (expand === false) {
                            item.android('layout_columnWeight', '0');
                        }
                        if (data.downsized) {
                            if (data.exceed) {
                                item.setLayoutWidth('0px');
                                item.android('layout_columnWeight', '0.01');
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
                    if (item.has('width', CSS_UNIT.PERCENT)) {
                        item.setLayoutWidth('wrap_content');
                        requireWidth = true;
                    }
                    setLayoutHeight(item);
                });
            }
            if (requireWidth) {
                if (parent.hasPX('width') && aboveRange(node.actualWidth, parent.actualWidth)) {
                    node.setLayoutWidth('match_parent');
                }
                else {
                    node.css('width', formatPX(node.actualWidth), true);
                }
            }
            else if (node.hasPX('width') && node.actualWidth < Math.floor(node.bounds.width)) {
                if (mainData.layoutFixed) {
                    node.android('width', formatPX(node.bounds.width), true);
                }
                else {
                    if (!node.hasPX('minWidth')) {
                        node.android('minWidth', formatPX(node.actualWidth));
                    }
                    node.css('width', 'auto', true);
                }
            }
            if (node.hasPX('height') && node.actualHeight < Math.floor(node.bounds.height)) {
                if (!node.hasPX('minHeight')) {
                    node.android('minHeight', formatPX(node.actualHeight));
                }
                node.css('height', 'auto', true);
            }
            const layout = new $LayoutUI(
                parent,
                node,
                CONTAINER_NODE.GRID,
                NODE_ALIGNMENT.AUTO_LAYOUT,
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
                    controller.renderSpace('wrap_content', 'wrap_content', spaceSpan),
                    false
                );
            }
            node.mergeGravity('layout_gravity', 'fill');
            if (parent.css('empty-cells') === 'hide' && node.naturalChildren.length === 0 && node.textContent === '') {
                node.hide(true);
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
            if (layoutWidth > 0 && node.cssInitial('width') === 'auto' && node.renderChildren.every(item => item.inlineWidth)) {
                node.renderEach((item: T) => {
                    item.setLayoutWidth('0px');
                    item.android('layout_columnWeight', '1');
                });
            }
        }
    }
}