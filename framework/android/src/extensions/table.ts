import View from '../view';

import { CONTAINER_NODE } from '../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

const { CSS_UNIT, formatPX } = squared.lib.css;
const { convertFloat, convertInt, trimEnd } = squared.lib.util;

const { NODE_ALIGNMENT } = squared.base.lib.enumeration;

function setLayoutHeight(node: View) {
    if (node.hasPX('height') && node.height + node.contentBoxHeight < Math.floor(node.bounds.height) && node.css('verticalAlign') !== 'top') {
        node.setLayoutHeight('wrap_content');
    }
}

export default class <T extends View> extends squared.base.extensions.Table<T> {
    public processNode(node: T, parent: T) {
        super.processNode(node, parent);
        const mainData: TableData = node.data(this.name, 'mainData');
        let requireWidth = false;
        if (mainData.columnCount > 1) {
            requireWidth = mainData.expand;
            node.each((item: T) => {
                const data: TableCellData = item.data(this.name, 'cellData');
                if (data.flexible) {
                    item.android('layout_columnWeight', data.colSpan.toString());
                    item.setLayoutWidth('0px');
                    requireWidth = true;
                }
                else {
                    if (data.expand === false) {
                        item.android('layout_columnWeight', '0');
                    }
                    else if (data.percent) {
                        const value = convertFloat(data.percent) / 100;
                        if (value > 0) {
                            item.setLayoutWidth('0px');
                            item.android('layout_columnWeight', trimEnd(value.toPrecision(3), '0'));
                            requireWidth = true;
                        }
                    }
                    if (data.downsized) {
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
        const cellData: TableCellData = node.data(this.name, 'cellData');
        if (cellData) {
            if (cellData.rowSpan > 1) {
                node.android('layout_rowSpan', cellData.rowSpan.toString());
            }
            if (cellData.colSpan > 1) {
                node.android('layout_columnSpan', cellData.colSpan.toString());
            }
            if (cellData.spaceSpan) {
                const controller = this.controller as android.base.Controller<T>;
                controller.addAfterOutsideTemplate(
                    node.id,
                    controller.renderSpace({
                        width: 'wrap_content',
                        height: 'wrap_content',
                        columnSpan: cellData.spaceSpan,
                        android: {}
                    }),
                    false
                );
            }
            node.mergeGravity('layout_gravity', 'fill');
            if (parent.css('emptyCells') === 'hide' && node.textEmpty) {
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