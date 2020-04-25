import { GridCellData } from '../../../@types/base/extension';

import Resource from '../resource';

import { CONTAINER_NODE } from '../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

type View = android.base.View;

const $lib = squared.lib;
const $base_lib = squared.base.lib;

const { formatPX } = $lib.css;
const { withinRange } = $lib.util;

const { BOX_STANDARD, NODE_ALIGNMENT } = $base_lib.enumeration;

const Grid = squared.base.extensions.Grid;

const GRID = $base_lib.constant.EXT_NAME.GRID;

function transferData(parent: View, siblings: View[])  {
    const data = Grid.createDataCellAttribute();
    siblings.forEach(item => {
        const source: GridCellData<View> = item.data(GRID, 'cellData');
        if (source) {
            if (source.cellStart) {
                data.cellStart = true;
            }
            if (source.cellEnd) {
                data.cellEnd = true;
            }
            if (source.rowEnd) {
                data.rowEnd = true;
            }
            if (source.rowStart) {
                data.rowStart = true;
            }
            item.data(GRID, 'cellData', null);
        }
    });
    parent.data(GRID, 'cellData', data);
}

export default class <T extends View> extends squared.base.extensions.Grid<T> {
    public processNode(node: T, parent: T) {
        super.processNode(node, parent);
        const columnCount: number = node.data(GRID, 'columnCount');
        if (columnCount) {
            return {
                output: this.application.renderNode(
                    LayoutUI.create({
                        parent,
                        node,
                        containerType: CONTAINER_NODE.GRID,
                        alignmentType: NODE_ALIGNMENT.COLUMN,
                        children: node.children as T[],
                        columnCount
                    })
                ),
                include: true,
                complete: true
            };
        }
        return undefined;
    }

    public processChild(node: T, parent: T) {
        const cellData: GridCellData<T> = node.data(GRID, 'cellData');
        if (cellData) {
            const siblings = cellData.siblings?.slice(0);
            let layout: Undef<LayoutUI<T>>;
            if (siblings) {
                const controller = <android.base.Controller<T>> this.controller;
                siblings.unshift(node);
                layout = controller.processLayoutHorizontal(
                    new LayoutUI(
                        parent,
                        controller.createNodeGroup(node, siblings, { parent, delegate: true, cascade: true }),
                        0,
                        0,
                        siblings
                    )
                );
                node = layout.node;
                transferData(node, siblings);
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
        return undefined;
    }

    public postConstraints(node: T) {
        if (node.css('borderCollapse') !== 'collapse') {
            const columnCount: number = node.data(GRID, 'columnCount');
            if (columnCount) {
                let paddingTop = 0, paddingRight = 0, paddingBottom = 0, paddingLeft = 0;
                node.renderEach(item => {
                    const cellData: GridCellData<T> = item.data(GRID, 'cellData');
                    if (cellData) {
                        const parent = <Null<T>> item.actualParent;
                        if (parent?.visible === false) {
                            const marginTop = parent.getBox(BOX_STANDARD.MARGIN_TOP)[0] === 0 ? parent.marginTop : 0;
                            const marginBottom = parent.getBox(BOX_STANDARD.MARGIN_BOTTOM)[0] === 0 ? parent.marginBottom : 0;
                            if (cellData.cellStart) {
                                paddingTop = marginTop + parent.paddingTop;
                            }
                            if (cellData.rowStart) {
                                paddingLeft = Math.max(parent.marginLeft + parent.paddingLeft, paddingLeft);
                            }
                            if (cellData.rowEnd) {
                                const heightBottom = marginBottom + parent.paddingBottom + (cellData.cellEnd ? 0 : marginTop + parent.paddingTop);
                                if (heightBottom > 0) {
                                    if (cellData.cellEnd) {
                                        paddingBottom = heightBottom;
                                    }
                                    else {
                                        const controller = <android.base.Controller<T>> this.controller;
                                        controller.addAfterOutsideTemplate(
                                            item.id,
                                            controller.renderSpace({
                                                width: 'match_parent',
                                                height: '@dimen/' + Resource.insertStoredAsset('dimens', `${node.controlId}_grid_space`, formatPX(heightBottom)),
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
                node.modifyBox(BOX_STANDARD.PADDING_TOP, paddingTop);
                node.modifyBox(BOX_STANDARD.PADDING_RIGHT, paddingRight);
                node.modifyBox(BOX_STANDARD.PADDING_BOTTOM, paddingBottom);
                node.modifyBox(BOX_STANDARD.PADDING_LEFT, paddingLeft);
            }
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