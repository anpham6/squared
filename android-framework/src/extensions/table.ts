import { TableData } from '../../../src/base/@types/extension';

import View from '../view';

import { STRING_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';

import $LayoutUI = squared.base.LayoutUI;

const $const = squared.lib.constant;
const $css = squared.lib.css;
const $util = squared.lib.util;
const $c = squared.base.lib.constant;
const $e = squared.base.lib.enumeration;

export default class <T extends View> extends squared.base.extensions.Table<T> {
    public processNode(node: T, parent: T) {
        super.processNode(node, parent);
        const mainData: TableData = node.data($c.EXT_NAME.TABLE, $c.STRING_BASE.EXT_DATA);
        if (mainData) {
            let requireWidth = false;
            if (mainData.columnCount > 1) {
                requireWidth = node.data($c.EXT_NAME.TABLE, 'expand') === true;
                node.each((item: T) => {
                    if (item.css($const.CSS.WIDTH) === $const.CSS.PX_0) {
                        item.setLayoutWidth($const.CSS.PX_0);
                        item.android('layout_columnWeight', ((<HTMLTableCellElement> item.element).colSpan || 1).toString());
                    }
                    else {
                        const expand: boolean | undefined = item.data($c.EXT_NAME.TABLE, 'expand');
                        if (expand !== undefined) {
                            if (expand) {
                                const percent = $util.convertFloat(item.data($c.EXT_NAME.TABLE, 'percent')) / 100;
                                if (percent > 0) {
                                    item.setLayoutWidth($const.CSS.PX_0);
                                    item.android('layout_columnWeight', $util.trimEnd(percent.toPrecision(3), '0'));
                                    requireWidth = !node.hasWidth;
                                }
                            }
                            else {
                                item.android('layout_columnWeight', '0');
                            }
                        }
                        if (item.data($c.EXT_NAME.TABLE, 'downsized') === true) {
                            if (item.data($c.EXT_NAME.TABLE, 'exceed') === true) {
                                item.setLayoutWidth($const.CSS.PX_0);
                                item.android('layout_columnWeight', '0.01');
                            }
                            else {
                                if (item.has($const.CSS.WIDTH) && item.actualWidth < item.bounds.width) {
                                    item.setLayoutWidth($css.formatPX(item.bounds.width));
                                }
                            }
                        }
                    }
                    if (item.textElement && item.textContent.length > 1 && !/[\s\n\-]/.test(item.textContent.trim())) {
                        item.android('maxLines', '1');
                    }
                });
                if (requireWidth) {
                    if (parent.has($const.CSS.WIDTH) && $util.aboveRange(node.actualWidth, parent.actualWidth)) {
                        node.setLayoutWidth(STRING_ANDROID.MATCH_PARENT);
                    }
                    else {
                        node.css($const.CSS.WIDTH, $css.formatPX(node.actualWidth), true);
                    }
                }
            }
            if (!requireWidth && node.has($const.CSS.WIDTH) && node.actualWidth < Math.floor(node.bounds.width)) {
                if (mainData.layoutFixed) {
                    node.android($const.CSS.WIDTH, $css.formatPX(node.bounds.width), true);
                }
                else {
                    if (!node.has('minWidth')) {
                        node.android('minWidth', $css.formatPX(node.actualWidth));
                    }
                    node.css($const.CSS.WIDTH, $const.CSS.AUTO, true);
                }
            }
            if (node.has($const.CSS.HEIGHT) && node.actualHeight < Math.floor(node.bounds.height)) {
                if (!node.has('minHeight')) {
                    node.android('minHeight', $css.formatPX(node.actualHeight));
                }
                node.css($const.CSS.HEIGHT, $const.CSS.AUTO, true);
            }
            const layout = new $LayoutUI(
                parent,
                node,
                CONTAINER_NODE.GRID,
                $e.NODE_ALIGNMENT.AUTO_LAYOUT,
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
        const rowSpan = $util.convertInt(node.data($c.EXT_NAME.TABLE, 'rowSpan'));
        const columnSpan = $util.convertInt(node.data($c.EXT_NAME.TABLE, 'colSpan'));
        const spaceSpan = $util.convertInt(node.data($c.EXT_NAME.TABLE, 'spaceSpan'));
        if (rowSpan > 1) {
            node.android('layout_rowSpan', rowSpan.toString());
        }
        if (columnSpan > 1) {
            node.android('layout_columnSpan', columnSpan.toString());
        }
        node.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, 'fill');
        if (spaceSpan > 0) {
            const controller = <android.base.Controller<T>> this.application.controllerHandler;
            controller.addAfterOutsideTemplate(node.id, controller.renderSpace(STRING_ANDROID.WRAP_CONTENT, STRING_ANDROID.WRAP_CONTENT, spaceSpan));
        }
        if (parent.css('empty-cells') === 'hide' && node.actualChildren.length === 0 && node.textContent === '') {
            node.hide(true);
        }
        return undefined;
    }

    public postOptimize(node: T) {
        const layoutWidth = $util.convertInt(node.layoutWidth);
        if (layoutWidth > 0) {
            if (node.bounds.width > layoutWidth) {
                node.setLayoutWidth($css.formatPX(node.bounds.width));
            }
            if (layoutWidth > 0 && node.cssInitial($const.CSS.WIDTH) === $const.CSS.AUTO && node.renderChildren.every(item => item.inlineWidth)) {
                node.renderEach((item: T) => {
                    item.setLayoutWidth($const.CSS.PX_0);
                    item.android('layout_columnWeight', '1');
                });
            }
        }
    }
}