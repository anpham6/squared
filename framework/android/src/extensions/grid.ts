import CREATE_NODE = squared.base.lib.internal.CREATE_NODE;
import BOX_STANDARD = squared.base.lib.constant.BOX_STANDARD;
import NODE_ALIGNMENT = squared.base.lib.constant.NODE_ALIGNMENT;
import LAYOUT_GRIDCELL = squared.lib.internal.LAYOUT_GRIDCELL;

import { CONTAINER_NODE } from '../lib/constant';

import type View from '../view';

import Resource from '../resource';

import LayoutUI = squared.base.LayoutUI;

const { formatPX } = squared.lib.css;
const { withinRange } = squared.lib.util;

export default class Grid <T extends View> extends squared.base.extensions.Grid<T> {
    public processNode(node: T, parent: T): Void<ExtensionResult<T>> {
        super.processNode(node, parent);
        const columnCount = this.data.get(node) as Undef<number>;
        if (columnCount) {
            return {
                output: this.application.renderNode(
                    LayoutUI.create({
                        parent,
                        node,
                        containerType: CONTAINER_NODE.GRID,
                        alignmentType: NODE_ALIGNMENT.COLUMN,
                        columnCount
                    })
                ),
                include: true,
                complete: true
            };
        }
    }

    public processChild(node: T, parent: T): Void<ExtensionResult<T>> {
        const cellData = this.data.get(node) as Undef<GridCellData<T>>;
        if (cellData) {
            const siblings = cellData.siblings?.slice(0);
            let layout: Undef<LayoutUI<T>>;
            if (siblings) {
                const controller = this.controller as android.base.Controller<T>;
                const data = Grid.createDataCellAttribute();
                siblings.unshift(node);
                layout = controller.processLayoutHorizontal(
                    new LayoutUI(
                        parent,
                        controller.createNodeGroup(node, siblings, parent, { flags: CREATE_NODE.DELEGATE | CREATE_NODE.CASCADE })
                    )
                );
                node = layout.node;
                for (let i = 0, length = siblings.length; i < length; ++i) {
                    const item = siblings[i];
                    const siblingData = this.data.get(item) as Undef<GridCellData<T>>;
                    if (siblingData) {
                        const flags = siblingData.flags;
                        if (flags & LAYOUT_GRIDCELL.CELL_START) {
                            data.flags |= LAYOUT_GRIDCELL.CELL_START;
                        }
                        if (flags & LAYOUT_GRIDCELL.CELL_END) {
                            data.flags |= LAYOUT_GRIDCELL.CELL_END;
                        }
                        if (flags & LAYOUT_GRIDCELL.ROW_START) {
                            data.flags |= LAYOUT_GRIDCELL.ROW_START;
                        }
                        if (flags & LAYOUT_GRIDCELL.ROW_END) {
                            data.flags |= LAYOUT_GRIDCELL.ROW_END;
                        }
                        this.data.delete(item);
                    }
                }
                this.data.set(node, data);
            }
            if (cellData.rowSpan > 1) {
                node.android('layout_rowSpan', cellData.rowSpan.toString());
            }
            if (cellData.columnSpan > 1) {
                node.android('layout_columnSpan', cellData.columnSpan.toString());
            }
            if (node.display === 'table-cell') {
                node.mergeGravity('layout_gravity', 'fill');
            }
            if (layout) {
                return {
                    parent: layout.node,
                    renderAs: layout.node,
                    outputAs: this.application.renderNode(layout)
                };
            }
        }
    }

    public postConstraints(node: T) {
        const columnCount = this.data.get(node) as Undef<number>;
        if (columnCount && node.valueAt('borderCollapse') !== 'collapse') {
            let paddingTop = 0,
                paddingRight = 0,
                paddingBottom = 0,
                paddingLeft = 0;
            node.renderEach((item: T) => {
                const cellData = this.data.get(item) as Undef<GridCellData<T>>;
                if (cellData) {
                    const parent = item.actualParent;
                    if (parent && !parent.visible) {
                        const marginTop = !parent.getBox(BOX_STANDARD.MARGIN_TOP)[0] ? parent.marginTop : 0;
                        const marginBottom = !parent.getBox(BOX_STANDARD.MARGIN_BOTTOM)[0] ? parent.marginBottom : 0;
                        const flags = cellData.flags;
                        if (flags & LAYOUT_GRIDCELL.CELL_START) {
                            paddingTop = marginTop + parent.paddingTop;
                        }
                        if (flags & LAYOUT_GRIDCELL.ROW_START) {
                            paddingLeft = Math.max(parent.marginLeft + parent.paddingLeft, paddingLeft);
                        }
                        if (flags & LAYOUT_GRIDCELL.ROW_END) {
                            const heightBottom = marginBottom + parent.paddingBottom + (flags & LAYOUT_GRIDCELL.CELL_END ? 0 : marginTop + parent.paddingTop);
                            if (heightBottom > 0) {
                                if (flags & LAYOUT_GRIDCELL.CELL_END) {
                                    paddingBottom = heightBottom;
                                }
                                else {
                                    const controller = this.controller as android.base.Controller<T>;
                                    controller.addAfterOutsideTemplate(
                                        item,
                                        controller.renderSpace({
                                            width: 'match_parent',
                                            height: `@dimen/${Resource.insertStoredAsset('dimens', node.controlId.toLowerCase() + '_grid_space', formatPX(heightBottom))}`,
                                            columnSpan: columnCount,
                                            android: {}
                                        }),
                                        false
                                    );
                                }
                            }
                            paddingRight = Math.max(parent.marginRight + parent.paddingRight, paddingRight);
                        }
                    }
                }
            });
            const boxAdjustment = node.boxAdjustment;
            boxAdjustment[4] += paddingTop;
            boxAdjustment[5] += paddingRight;
            boxAdjustment[6] += paddingBottom;
            boxAdjustment[7] += paddingLeft;
        }
        if (!node.hasWidth) {
            let maxRight = -Infinity;
            node.renderEach(item => {
                if (item.inlineFlow || !item.blockStatic) {
                    maxRight = Math.max(maxRight, item.linear.right);
                }
            });
            if (withinRange(node.box.right, maxRight)) {
                node.setLayoutWidth('wrap_content');
            }
        }
    }
}