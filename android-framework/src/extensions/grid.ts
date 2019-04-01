import { GridCellData, GridData } from '../../../src/base/@types/extension';

import { CONTAINER_NODE } from '../lib/enumeration';

import $Layout = squared.base.Layout;

type View = android.base.View;

const $const = squared.base.lib.constant;
const $enum = squared.base.lib.enumeration;
const $util = squared.lib.util;

function transferData(parent: View, siblings: View[])  {
    let destination: GridCellData<View> | undefined;
    for (let i = 0; i < siblings.length; i++) {
        const item = siblings[i];
        if (destination) {
            const source: GridCellData<View> = item.data($const.EXT_NAME.GRID, 'cellData');
            if (source) {
                for (const attr in source) {
                    switch (typeof source[attr]) {
                        case 'number':
                            destination[attr] += source[attr];
                            break;
                        case 'boolean':
                            if (source[attr] === true) {
                                destination[attr] = true;
                            }
                            break;
                    }
                }
            }
        }
        else {
            destination = item.data($const.EXT_NAME.GRID, 'cellData');
        }
        item.siblingIndex = i;
        item.data($const.EXT_NAME.GRID, 'cellData', null);
    }
    parent.data($const.EXT_NAME.GRID, 'cellData', destination);
}

export default class <T extends View> extends squared.base.extensions.Grid<T> {
    public processNode(node: T, parent: T) {
        super.processNode(node, parent);
        const mainData: GridData = node.data($const.EXT_NAME.GRID, 'mainData');
        if (mainData) {
            const layout = new $Layout(
                parent,
                node,
                CONTAINER_NODE.GRID,
                $enum.NODE_ALIGNMENT.AUTO_LAYOUT,
                node.children as T[]
            );
            layout.columnCount = mainData.columnCount;
            return {
                output: this.application.renderNode(layout),
                complete: true
            };
        }
        return undefined;
    }

    public processChild(node: T, parent: T) {
        const mainData: GridData = parent.data($const.EXT_NAME.GRID, 'mainData');
        const cellData: GridCellData<T> = node.data($const.EXT_NAME.GRID, 'cellData');
        if (mainData && cellData) {
            if (cellData.rowSpan > 1) {
                node.android('layout_rowSpan', cellData.rowSpan.toString());
            }
            if (cellData.columnSpan > 1) {
                node.android('layout_columnSpan', cellData.columnSpan.toString());
            }
            if (node.display === 'table-cell') {
                node.mergeGravity('layout_gravity', 'fill');
            }
            const siblings = cellData.siblings && cellData.siblings.length ? cellData.siblings.slice(0) : undefined;
            if (siblings) {
                const controller = <android.base.Controller<T>> this.application.controllerHandler;
                siblings.unshift(node);
                let layout = new $Layout(
                    parent,
                    node,
                    0,
                    0,
                    siblings
                );
                if (layout.linearY) {
                    layout.node = controller.createNodeGroup(node, siblings, parent);
                    layout.setType(CONTAINER_NODE.LINEAR, $enum.NODE_ALIGNMENT.VERTICAL);
                }
                else {
                    layout = controller.processTraverseHorizontal(layout).layout;
                }
                if (layout.containerType !== 0) {
                    transferData(layout.node, siblings);
                    return {
                        parent: layout.node,
                        renderAs: layout.node,
                        outputAs: this.application.renderNode(layout),
                        complete: true
                    };
                }
            }
        }
        return undefined;
    }

    public postBaseLayout(node: T) {
        if (!(node.tableElement && node.css('borderCollapse') === 'collapse')) {
            const mainData: GridData = node.data($const.EXT_NAME.GRID, 'mainData');
            if (mainData) {
                node.renderEach(item => {
                    const cellData: GridCellData<T> = item.data($const.EXT_NAME.GRID, 'cellData');
                    if (cellData) {
                        const actualParent = item.actualParent;
                        if (actualParent && !actualParent.visible) {
                            if (cellData.cellStart) {
                                mainData.paddingTop = actualParent.paddingTop + actualParent.marginTop;
                            }
                            if (cellData.rowStart) {
                                mainData.paddingLeft = Math.max(actualParent.marginLeft + actualParent.paddingLeft, mainData.paddingLeft);
                            }
                            if (cellData.rowEnd) {
                                const heightBottom = actualParent.marginBottom + actualParent.paddingBottom + (cellData.cellEnd ? 0 : actualParent.marginTop + actualParent.paddingTop);
                                if (heightBottom > 0) {
                                    if (cellData.cellEnd) {
                                        mainData.paddingBottom = heightBottom;
                                    }
                                    else {
                                        const controller = <android.base.Controller<T>> this.application.controllerHandler;
                                        controller.addAfterOutsideTemplate(item.id, controller.renderSpace('match_parent', $util.formatPX(heightBottom), mainData.columnCount));
                                    }
                                }
                                mainData.paddingRight = Math.max(actualParent.marginRight + actualParent.paddingRight, mainData.paddingRight);
                            }
                        }
                    }
                });
            }
            node.modifyBox($enum.BOX_STANDARD.PADDING_TOP, mainData.paddingTop);
            node.modifyBox($enum.BOX_STANDARD.PADDING_RIGHT, mainData.paddingRight);
            node.modifyBox($enum.BOX_STANDARD.PADDING_BOTTOM, mainData.paddingBottom);
            node.modifyBox($enum.BOX_STANDARD.PADDING_LEFT, mainData.paddingLeft);
        }
        if (!node.hasWidth) {
            let maxRight = Number.NEGATIVE_INFINITY;
            $util.captureMap(
                node.renderChildren,
                item => item.inlineFlow || !item.blockStatic,
                item => maxRight = Math.max(maxRight, item.linear.right)
            );
            if ($util.withinRange(node.box.right, maxRight)) {
                node.android('layout_width', 'wrap_content');
            }
        }
    }
}