import NODE_ALIGNMENT = squared.base.NODE_ALIGNMENT;

import { CONTAINER_NODE } from '../lib/constant';

import View from '../view';

import LayoutUI = squared.base.LayoutUI;

const { formatPX } = squared.lib.css;
const { truncateTrailingZero } = squared.lib.math;

function setLayoutHeight(node: View) {
    if (node.hasPX('height') && node.height + node.contentBoxHeight < Math.floor(node.bounds.height) && node.css('verticalAlign') !== 'top') {
        node.setLayoutHeight('wrap_content');
    }
}

export default class <T extends View> extends squared.base.extensions.Table<T> {
    public processNode(node: T, parent: T): Void<ExtensionResult<T>> {
        super.processNode(node, parent);
        const mainData = this.data.get(node) as TableData;
        let requireWidth: Undef<boolean>,
            multiline: Undef<boolean>;
        if (mainData.columnCount > 1) {
            requireWidth = mainData.expand;
            node.each((item: T) => {
                const cellData = this.data.get(item) as Undef<TableCellData>;
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
                            const value = parseFloat(cellData.percent) / 100;
                            if (value) {
                                item.setLayoutWidth('0px');
                                item.android('layout_columnWeight', truncateTrailingZero(value.toPrecision(3)));
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
            const item = node.item(0) as Undef<T>;
            if (item) {
                if (item.percentWidth && !node.hasWidth) {
                    item.setLayoutWidth('wrap_content');
                    requireWidth = true;
                }
                if (item.tagName !== 'CAPTION' && (item.multiline || item.find((child: T) => child.multiline || child.contentAltered, { cascade: true }))) {
                    multiline = true;
                    requireWidth = true;
                }
                setLayoutHeight(item);
            }
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
                rowCount: mainData.rowCount,
                columnCount: mainData.columnCount
            })),
            include: true,
            complete: true
        };
    }

    public processChild(node: T, parent: T) {
        const cellData = this.data.get(node) as Undef<TableCellData>;
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
                    node,
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
    }

    public postOptimize(node: T) {
        const layoutWidth = parseInt(node.layoutWidth);
        if (layoutWidth) {
            if (node.bounds.width > layoutWidth) {
                node.setLayoutWidth(formatPX(node.bounds.width));
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