import View from '../view';

import { CONTAINER_NODE } from '../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

const { formatPX } = squared.lib.css;
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
        const mainData = node.data<TableData>(this.name, 'mainData')!;
        const hasWidth = node.hasWidth;
        let requireWidth: Undef<boolean>,
            multiline: Undef<boolean>;
        if (mainData.columnCount > 1) {
            requireWidth = mainData.expand;
            node.each((item: T) => {
                const cellData = item.data<TableCellData>(this.name, 'cellData');
                if (cellData) {
                    if (cellData.flexible) {
                        item.android('layout_columnWeight', cellData.colSpan.toString());
                        item.setLayoutWidth('0px');
                        requireWidth = true;
                    }
                    else {
                        if (cellData.expand === false) {
                            item.android('layout_columnWeight', '0');
                        }
                        else if (cellData.percent) {
                            const value = convertFloat(cellData.percent) / 100;
                            if (value > 0) {
                                item.setLayoutWidth('0px');
                                item.android('layout_columnWeight', trimEnd(value.toPrecision(3), '0'));
                                requireWidth = true;
                            }
                        }
                        if (cellData.downsized) {
                            if (cellData.exceed) {
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
                }
                if (item.tagName === 'TD' && item.textElement && !item.multiline && !/[\s\n-]/.test(item.textContent.trim())) {
                    item.android('maxLines', '1');
                }
                setLayoutHeight(item);
            });
        }
        else {
            node.each((item: T) => {
                if (!hasWidth && item.percentWidth > 0) {
                    item.setLayoutWidth('wrap_content');
                    requireWidth = true;
                }
                if (item.tagName !== 'CAPTION' && (item.multiline || item.some((child: T) => child.multiline || child.contentAltered, { cascade: true }))) {
                    multiline = true;
                    requireWidth = true;
                }
                setLayoutHeight(item);
            });
        }
        if (hasWidth) {
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
            if ((parent.blockStatic || parent.hasWidth) && (multiline || Math.ceil(node.bounds.width) >= parent.box.width)) {
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
        const cellData = node.data<TableCellData>(this.name, 'cellData');
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
            if (node.cssInitial('width') === 'auto' && node.every((item: T) => item.inlineWidth)) {
                node.renderEach((item: T) => {
                    item.setLayoutWidth('0px');
                    item.android('layout_columnWeight', '1');
                });
            }
        }
    }
}