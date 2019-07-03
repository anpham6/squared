import { GridCellData, GridData } from '../../../@types/base/extension';

import Resource from '../resource';
import View from '../view';

import { STRING_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';

import $LayoutUI = squared.base.LayoutUI;

const {
    constant: $const,
    css: $css,
    util: $util
} = squared.lib;

const {
    constant: $c,
    enumeration: $e
} = squared.base.lib;

function transferData(parent: View, siblings: View[])  {
    const data = squared.base.extensions.Grid.createDataCellAttribute();
    for (const item of siblings) {
        const source: GridCellData<View> = item.data($c.EXT_NAME.GRID, 'cellData');
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
            item.data($c.EXT_NAME.GRID, 'cellData', null);
        }
    }
    parent.data($c.EXT_NAME.GRID, 'cellData', data);
}

export default class <T extends View> extends squared.base.extensions.Grid<T> {
    public processNode(node: T, parent: T) {
        super.processNode(node, parent);
        const mainData: GridData = node.data($c.EXT_NAME.GRID, $c.STRING_BASE.EXT_DATA);
        if (mainData) {
            const layout = new $LayoutUI(
                parent,
                node,
                CONTAINER_NODE.GRID,
                $e.NODE_ALIGNMENT.AUTO_LAYOUT,
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
        const mainData: GridData = parent.data($c.EXT_NAME.GRID, $c.STRING_BASE.EXT_DATA);
        const cellData: GridCellData<T> = node.data($c.EXT_NAME.GRID, 'cellData');
        if (mainData && cellData) {
            const siblings = cellData.siblings && cellData.siblings.slice(0);
            let layout: $LayoutUI<T> | undefined;
            if (siblings) {
                const controller = <android.base.Controller<T>> this.application.controllerHandler;
                siblings.unshift(node);
                layout = controller.processLayoutHorizontal(
                    new $LayoutUI(
                        parent,
                        controller.createNodeGroup(node, siblings, parent, true),
                        0,
                        cellData.block ? $e.NODE_ALIGNMENT.BLOCK : 0,
                        siblings
                    )
                );
                node = layout.node;
                if (cellData.block) {
                    node.css('display', 'block');
                }
                else {
                    for (const item of siblings) {
                        if (item.percentWidth) {
                            item.css($const.CSS.WIDTH, $css.formatPX(item.bounds.width), true);
                        }
                    }
                }
                transferData(node, siblings);
            }
            if (cellData.rowSpan > 1) {
                node.android('layout_rowSpan', cellData.rowSpan.toString());
            }
            if (cellData.columnSpan > 1) {
                node.android('layout_columnSpan', cellData.columnSpan.toString());
            }
            if (node.display === 'table-cell') {
                node.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, 'fill');
            }
            if (layout) {
                return {
                    parent: layout.node,
                    renderAs: layout.node,
                    outputAs: this.application.renderNode(layout),
                    complete: true
                };
            }
        }
        return undefined;
    }

    public postBaseLayout(node: T) {
        if (node.css('borderCollapse') !== 'collapse') {
            const mainData: GridData = node.data($c.EXT_NAME.GRID, $c.STRING_BASE.EXT_DATA);
            if (mainData) {
                node.renderEach(item => {
                    const cellData: GridCellData<T> = item.data($c.EXT_NAME.GRID, 'cellData');
                    if (cellData) {
                        const parent = item.actualParent as T;
                        if (parent && !parent.visible) {
                            if (cellData.cellStart) {
                                mainData.paddingTop = parent.paddingTop + parent.marginTop;
                            }
                            if (cellData.rowStart) {
                                mainData.paddingLeft = Math.max(parent.marginLeft + parent.paddingLeft, mainData.paddingLeft);
                            }
                            if (cellData.rowEnd) {
                                const heightBottom = parent.marginBottom + parent.paddingBottom + (cellData.cellEnd ? 0 : parent.marginTop + parent.paddingTop);
                                if (heightBottom > 0) {
                                    if (cellData.cellEnd) {
                                        mainData.paddingBottom = heightBottom;
                                    }
                                    else {
                                        const controller = <android.base.Controller<T>> this.application.controllerHandler;
                                        controller.addAfterOutsideTemplate(
                                            item.id,
                                            controller.renderSpace(
                                                STRING_ANDROID.MATCH_PARENT,
                                                `@dimen/${Resource.insertStoredAsset('dimens', `${node.controlId}_grid_space`, $css.formatPX(heightBottom))}`,
                                                mainData.columnCount
                                            ),
                                            false
                                        );
                                    }
                                }
                                mainData.paddingRight = Math.max(parent.marginRight + parent.paddingRight, mainData.paddingRight);
                            }
                        }
                    }
                });
            }
            node.modifyBox($e.BOX_STANDARD.PADDING_TOP, mainData.paddingTop);
            node.modifyBox($e.BOX_STANDARD.PADDING_RIGHT, mainData.paddingRight);
            node.modifyBox($e.BOX_STANDARD.PADDING_BOTTOM, mainData.paddingBottom);
            node.modifyBox($e.BOX_STANDARD.PADDING_LEFT, mainData.paddingLeft);
        }
        if (!node.hasWidth) {
            let maxRight = Number.NEGATIVE_INFINITY;
            $util.captureMap(
                node.renderChildren,
                item => item.inlineFlow || !item.blockStatic,
                item => maxRight = Math.max(maxRight, item.linear.right)
            );
            if ($util.withinRange(node.box.right, maxRight)) {
                node.setLayoutWidth(STRING_ANDROID.WRAP_CONTENT);
            }
        }
    }
}