import NODE_ALIGNMENT = squared.base.lib.constant.NODE_ALIGNMENT;
import LAYOUT_TABLE = squared.lib.internal.LAYOUT_TABLE;
import LAYOUT_TABLECELL = squared.lib.internal.LAYOUT_TABLECELL;
import CONTAINER_NODE = android.lib.constant.CONTAINER_NODE;

import type View from '../view';

import LayoutUI = squared.base.LayoutUI;

const { asPercent, formatPX } = squared.lib.css;
const { truncateTrailingZero } = squared.lib.math;
const { safeFloat } = squared.lib.util;

function setLayoutHeight(node: View) {
    if (node.hasUnit('height') && node.height + node.contentBoxHeight < Math.floor(node.bounds.height) && node.css('verticalAlign') !== 'top') {
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
            requireWidth = (mainData.flags & LAYOUT_TABLE.EXPAND) > 0;
            node.each((item: T) => {
                const cellData = this.data.get(item) as Undef<TableCellData>;
                if (cellData) {
                    const flags = cellData.flags;
                    if (flags & LAYOUT_TABLECELL.FLEXIBLE) {
                        item.android('layout_columnWeight', cellData.colSpan.toString());
                        item.setLayoutWidth('0px');
                        requireWidth = true;
                    }
                    else {
                        if (flags & LAYOUT_TABLECELL.SHRINK) {
                            item.android('layout_columnWeight', '0');
                        }
                        else if (cellData.percent) {
                            const value = asPercent(cellData.percent);
                            if (value) {
                                item.setLayoutWidth('0px');
                                item.android('layout_columnWeight', truncateTrailingZero(value.toPrecision(node.localSettings.floatPrecision)));
                                requireWidth = true;
                            }
                        }
                        if (flags & LAYOUT_TABLECELL.DOWNSIZED) {
                            if (flags & LAYOUT_TABLECELL.EXCEED) {
                                item.setLayoutWidth('0px');
                                item.android('layout_columnWeight', '0.01');
                                requireWidth = true;
                            }
                            else if (item.hasUnit('width')) {
                                const width = item.bounds.width;
                                if (item.actualWidth < width) {
                                    item.setLayoutWidth(formatPX(width));
                                }
                            }
                        }
                    }
                }
                if (item.textElement && !item.multiline && !/[\s-]/.test(item.textContent.trim())) {
                    switch (item.tagName) {
                        case 'TH':
                            item.android('singleLine', 'true');
                            break;
                        case 'TD':
                            item.android('maxLines', '1');
                            break;
                    }
                }
                setLayoutHeight(item);
            });
        }
        else {
            const item = node.item(0) as Undef<T>;
            if (item) {
                if (item.percentWidth > 0 && !node.hasWidth) {
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
                if (mainData.flags & LAYOUT_TABLE.FIXED) {
                    node.android('width', formatPX(node.bounds.width));
                }
                else {
                    if (!node.hasUnit('minWidth')) {
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
            if (!node.hasUnit('minHeight')) {
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
                    controller.renderSpace(node.sessionId, {
                        width: 'wrap_content',
                        height: 'wrap_content',
                        columnSpan: cellData.spaceSpan,
                        android: {}
                    })
                );
            }
            node.mergeGravity('layout_gravity', 'fill');
            if (node.textEmpty && parent.cssValue('emptyCells') === 'hide') {
                node.hide({ hidden: true });
            }
        }
    }

    public postOptimize(node: T) {
        const layoutWidth = safeFloat(node.layoutWidth);
        if (layoutWidth) {
            if (node.bounds.width > layoutWidth) {
                node.setLayoutWidth(formatPX(node.bounds.width));
            }
            if (node.css('width') === 'auto' && node.every((item: T) => item.inlineWidth)) {
                node.renderEach((item: T) => {
                    item.setLayoutWidth('0px');
                    item.android('layout_columnWeight', '1');
                });
            }
        }
    }
}