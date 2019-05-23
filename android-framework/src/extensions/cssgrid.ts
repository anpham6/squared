import { NodeXmlTemplate } from '../../../src/base/@types/application';
import { CssGridCellData, CssGridData, CssGridDirectionData } from '../../../src/base/@types/extension';

import View from '../view';

import { CONTAINER_ANDROID, STRING_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';
import { createViewAttribute } from '../lib/util';

import $Layout = squared.base.Layout;

const $css = squared.lib.css;
const $const = squared.lib.constant;
const $dom = squared.lib.dom;
const $math = squared.lib.math;
const $util = squared.lib.util;
const $c = squared.base.lib.constant;
const $e = squared.base.lib.enumeration;

const REGEXP_ALIGNSELF = /(start|end|center|baseline)/;
const REGEXP_JUSTIFYSELF = /(start|end|center|baseline|left|right)/;

function getRowData(mainData: CssGridData<View>, direction: string) {
    const result: Undefined<View[]>[][] = [];
    if (direction === 'column') {
        for (let i = 0; i < mainData.column.count; i++) {
            result[i] = [];
            for (let j = 0; j < mainData.row.count; j++) {
                result[i].push(mainData.rowData[j][i]);
            }
        }
    }
    else {
        for (let i = 0; i < mainData.row.count; i++) {
            result.push(mainData.rowData[i]);
        }
    }
    return result;
}

function getGridSize(mainData: CssGridData<View>, direction: string, node: View) {
    const horizontal = direction === 'column';
    const dimension = horizontal ? $const.CSS.WIDTH : $const.CSS.HEIGHT;
    const data = mainData[direction];
    let value = 0;
    if (data.unit.length) {
        for (let i = 0; i < data.unit.length; i++) {
            const unit = data.unit[i];
            if (unit.endsWith('px')) {
                value += parseFloat(unit);
            }
            else {
                let size = 0;
                $util.captureMap(
                    mainData.rowData[i] as View[][],
                    item => item && item.length > 0,
                    item => size = Math.min(size, ...$util.objectMap(item, child => child.bounds[dimension]))
                );
                value += size;
            }
        }
    }
    else {
        value = $math.maxArray(data.unitTotal);
        if (value <= 0) {
            return 0;
        }
    }
    value += data.gap * (data.count - 1);
    if (node.contentBox) {
        value += horizontal ? node.borderLeftWidth + node.borderRightWidth : node.borderTopWidth + node.borderBottomWidth;
    }
    else {
        value += horizontal ? node.contentBoxWidth : node.contentBoxHeight;
    }
    return (horizontal ? node.actualWidth : node.actualHeight) - value;
}

function setContentSpacing(mainData: CssGridData<View>, node: View, alignment: string, direction: string) {
    const data = <CssGridDirectionData> mainData[direction];
    if (alignment.startsWith('space')) {
        const sizeTotal = getGridSize(mainData, direction, node);
        if (sizeTotal > 0) {
            let MARGIN_START: number;
            let MARGIN_END: number;
            let dimension: string;
            if (direction === 'column') {
                MARGIN_START = $e.BOX_STANDARD.MARGIN_LEFT;
                MARGIN_END = $e.BOX_STANDARD.MARGIN_RIGHT;
                dimension = $const.CSS.WIDTH;
            }
            else {
                MARGIN_START = $e.BOX_STANDARD.MARGIN_TOP;
                MARGIN_END = $e.BOX_STANDARD.MARGIN_BOTTOM;
                dimension = $const.CSS.HEIGHT;
            }
            const rowData = getRowData(mainData, direction);
            const itemCount = mainData[direction].count;
            const adjusted = new Set<View>();
            function getMarginSize(value: number) {
                const marginSize = Math.floor(sizeTotal / value);
                return [marginSize, sizeTotal - (marginSize * value)];
            }
            switch (alignment) {
                case 'space-around': {
                    const [marginSize, marginExcess] = getMarginSize(itemCount * 2);
                    for (let i = 0; i < itemCount; i++) {
                        for (const item of new Set($util.flatArray<View>(rowData[i]))) {
                            const marginStart = (i > 0 && i <= marginExcess ? 1 : 0) + marginSize;
                            if (!adjusted.has(item)) {
                                item.modifyBox(MARGIN_START, marginStart);
                                item.modifyBox(MARGIN_END, marginSize);
                                adjusted.add(item);
                            }
                            else {
                                item.cssPX(dimension, sizeTotal / itemCount);
                            }
                        }
                    }
                    data.normal = false;
                    break;
                }
                case 'space-between': {
                    if (itemCount > 1) {
                        const [marginSize, marginExcess] = getMarginSize(itemCount - 1);
                        for (let i = 0; i < itemCount; i++) {
                            for (const item of new Set($util.flatArray<View>(rowData[i]))) {
                                const marginEnd = marginSize + (i < marginExcess ? 1 : 0);
                                if (i < itemCount - 1) {
                                    if (!adjusted.has(item)) {
                                        item.modifyBox(MARGIN_END, marginEnd);
                                        adjusted.add(item);
                                    }
                                    else {
                                        item.cssPX(dimension, marginEnd);
                                    }
                                }
                                else if ($util.convertInt(item.android(direction === 'column' ? 'layout_columnSpan' : 'layout_rowSpan')) > 1) {
                                    item.cssPX(dimension, marginEnd);
                                    if (adjusted.has(item)) {
                                        item.modifyBox(MARGIN_END, -marginEnd);
                                    }
                                }
                            }
                        }
                    }
                    data.normal = false;
                    break;
                }
                case 'space-evenly': {
                    const [marginSize, marginExcess] = getMarginSize(itemCount + 1);
                    for (let i = 0; i < itemCount; i++) {
                        for (const item of new Set($util.flatArray<View>(rowData[i]))) {
                            const marginEnd = marginSize + (i < marginExcess ? 1 : 0);
                            if (!adjusted.has(item)) {
                                if (i === 0) {
                                    item.modifyBox(MARGIN_START, marginSize);
                                }
                                item.modifyBox(MARGIN_END, marginEnd);
                                adjusted.add(item);
                            }
                            else {
                                item.cssPX(dimension, marginEnd);
                            }
                        }
                    }
                    data.normal = false;
                    break;
                }
            }
        }
    }
    else {
        const sizeTotal = getGridSize(mainData, direction, node);
        if (sizeTotal > 0) {
            const padding = direction === 'column' ? $e.BOX_STANDARD.PADDING_LEFT : $e.BOX_STANDARD.PADDING_TOP;
            switch (alignment) {
                case $const.CSS.CENTER:
                    node.modifyBox(padding, Math.floor(sizeTotal / 2));
                    data.normal = false;
                    break;
                case $const.CSS.RIGHT:
                    if (direction === 'row') {
                        break;
                    }
                case $const.CSS.END:
                case 'flex-end':
                    node.modifyBox(padding, sizeTotal);
                    data.normal = false;
                    break;
            }
        }
    }
}

export default class <T extends View> extends squared.base.extensions.CssGrid<T> {
    public processNode(node: T, parent: T) {
        super.processNode(node, parent);
        const mainData: CssGridData<T> = node.data($c.EXT_NAME.CSS_GRID, $c.STRING_BASE.EXT_DATA);
        if (mainData) {
            const layout = new $Layout(
                parent,
                node,
                CONTAINER_NODE.GRID,
                $e.NODE_ALIGNMENT.AUTO_LAYOUT,
                node.children as T[]
            );
            layout.rowCount = mainData.row.count;
            layout.columnCount = mainData.column.count;
            return {
                output: this.application.renderNode(layout),
                complete: true
            };
        }
        return undefined;
    }

    public processChild(node: T, parent: T) {
        const mainData: CssGridData<T> = parent.data($c.EXT_NAME.CSS_GRID, $c.STRING_BASE.EXT_DATA);
        const cellData: CssGridCellData = node.data($c.EXT_NAME.CSS_GRID, 'cellData');
        let renderAs: T | undefined;
        let outputAs: NodeXmlTemplate<T> | undefined;
        if (mainData && cellData) {
            function applyLayout(item: T, direction: string, dimension: string) {
                const data: CssGridDirectionData = mainData[direction];
                const cellStart = cellData[`${direction}Start`];
                const cellSpan = cellData[`${direction}Span`];
                const dimensionA = $util.capitalize(dimension);
                let size = 0;
                let minSize = 0;
                let fitContent = false;
                let minUnitSize = 0;
                let sizeWeight = 0;
                if (data.unit.length && data.unit.every(value => value === $const.CSS.AUTO)) {
                    if (dimension === $const.CSS.WIDTH) {
                        data.unit = new Array(data.unit.length).fill('1fr');
                    }
                    else {
                        data.unit.length = 0;
                    }
                }
                for (let i = 0, j = 0; i < cellSpan; i++) {
                    const unitMin = data.unitMin[cellStart + i];
                    if (unitMin !== '') {
                        minUnitSize += parent.parseUnit(unitMin);
                    }
                    let unit = data.unit[cellStart + i];
                    if (!unit) {
                        if (data.auto[j]) {
                            unit = data.auto[j];
                            if (data.auto[j + 1]) {
                                j++;
                            }
                        }
                        else {
                            continue;
                        }
                    }
                    if (unit === $const.CSS.AUTO || unit === 'max-content') {
                        if (cellSpan < data.unit.length && (!parent.has(dimension) || data.unit.some(value => $css.isLength(value)) || unit === 'max-content')) {
                            size = node.bounds[dimension];
                            minSize = 0;
                            sizeWeight = 0;
                            break;
                        }
                        else if (dimension === $const.CSS.WIDTH) {
                            size = 0;
                            minSize = 0;
                            sizeWeight = 0.01;
                            break;
                        }
                    }
                    else if (unit === 'min-content') {
                        if (!item.has(dimension)) {
                            item.android(`layout_${dimension}`, STRING_ANDROID.WRAP_CONTENT, false);
                            break;
                        }
                    }
                    else if ($css.isPercent(unit)) {
                        sizeWeight += parseFloat(unit) / 100;
                        minSize = size;
                        size = 0;
                    }
                    else if (unit.endsWith('fr')) {
                        if (dimension === $const.CSS.WIDTH || node.hasHeight) {
                            sizeWeight += parseFloat(unit);
                            minSize = size;
                        }
                        else {
                            sizeWeight = 0;
                            minSize = node.bounds[dimension];
                        }
                        size = 0;
                    }
                    else if (unit.endsWith('px')) {
                        const gap = parseFloat(unit);
                        if (minSize === 0) {
                            size += gap;
                        }
                        else {
                            minSize += gap;
                        }
                    }
                    if (unitMin === $const.CSS.PX_0 && node.textElement) {
                        fitContent = true;
                    }
                }
                if (cellSpan > 1) {
                    const value = (cellSpan - 1) * data.gap;
                    if (size > 0 && minSize === 0) {
                        size += value;
                    }
                    else if (minSize > 0) {
                        minSize += value;
                    }
                    if (minUnitSize > 0) {
                        minUnitSize += value;
                    }
                }
                if (minUnitSize > 0) {
                    if (data.autoFill && size === 0 && mainData[direction === 'column' ? 'row' : 'column'].count === 1) {
                        size = Math.max(node.actualWidth, minUnitSize);
                        sizeWeight = 0;
                    }
                    else {
                        minSize = minUnitSize;
                    }
                }
                item.android(`layout_${direction}`, cellStart.toString());
                if (cellSpan > 1) {
                    item.android(`layout_${direction}Span`, cellSpan.toString());
                }
                if (minSize > 0 && !item.has(`min${dimensionA}`)) {
                    item.css(`min${dimensionA}`, $css.formatPX(minSize), true);
                }
                if (sizeWeight > 0) {
                    if (!item.has(dimension)) {
                        item.android(`layout_${dimension}`, $const.CSS.PX_0);
                        item.android(`layout_${direction}Weight`, $math.truncate(sizeWeight, node.localSettings.floatPrecision));
                        item.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, direction === 'column' ? 'fill_horizontal' : 'fill_vertical');
                    }
                }
                else if (size > 0) {
                    if (item.contentBox) {
                        size -= item[`contentBox${dimensionA}`];
                    }
                    if (fitContent && !item.has(`max${dimensionA}`)) {
                        item.css(`max${dimensionA}`, $css.formatPX(size), true);
                        item.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, direction === 'column' ? 'fill_horizontal' : 'fill_vertical');
                    }
                    else if (!item.has(dimension)) {
                        item.css(dimension, $css.formatPX(size), true);
                    }
                }
                return [cellStart, cellSpan];
            }
            const { alignSelf, justifySelf } = node.flexbox;
            if (REGEXP_ALIGNSELF.test(alignSelf) || REGEXP_JUSTIFYSELF.test(justifySelf)) {
                renderAs = this.application.createNode($dom.createElement(node.actualParent && node.actualParent.element));
                renderAs.tagName = node.tagName;
                renderAs.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                renderAs.inherit(node, 'initial', 'base');
                renderAs.resetBox($e.BOX_STANDARD.MARGIN | $e.BOX_STANDARD.PADDING);
                renderAs.exclude($e.NODE_RESOURCE.BOX_STYLE | $e.NODE_RESOURCE.ASSET, $e.NODE_PROCEDURE.CUSTOMIZATION);
                parent.appendTry(node, renderAs);
                renderAs.render(parent);
                node.transferBox($e.BOX_STANDARD.MARGIN, renderAs);
                applyLayout(renderAs, 'column', $const.CSS.WIDTH);
                applyLayout(renderAs, 'row', $const.CSS.HEIGHT);
                let inlineWidth = false;
                if (justifySelf.endsWith($const.CSS.START) || justifySelf.endsWith($const.CSS.LEFT) || justifySelf.endsWith('baseline')) {
                    node.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, $const.CSS.LEFT);
                    inlineWidth = true;
                }
                else if (justifySelf.endsWith($const.CSS.END) || justifySelf.endsWith($const.CSS.RIGHT)) {
                    node.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, $const.CSS.RIGHT);
                    inlineWidth = true;
                }
                else if (justifySelf.endsWith($const.CSS.CENTER)) {
                    node.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, STRING_ANDROID.CENTER_HORIZONTAL);
                    inlineWidth = true;
                }
                if (!node.hasWidth) {
                    node.setLayoutWidth(inlineWidth ? STRING_ANDROID.WRAP_CONTENT : STRING_ANDROID.MATCH_PARENT, false);
                }
                if (alignSelf.endsWith($const.CSS.START) || alignSelf.endsWith('baseline')) {
                    node.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, $const.CSS.TOP);
                }
                else if (alignSelf.endsWith($const.CSS.END)) {
                    node.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, $const.CSS.BOTTOM);
                }
                else if (alignSelf.endsWith($const.CSS.CENTER)) {
                    node.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, STRING_ANDROID.CENTER_VERTICAL);
                }
                else if (!node.hasHeight) {
                    node.setLayoutHeight(STRING_ANDROID.MATCH_PARENT, false);
                }
                node.outerWrapper = renderAs;
                node.parent = renderAs;
                outputAs = this.application.renderNode(
                    new $Layout(
                        parent,
                        renderAs,
                        CONTAINER_NODE.FRAME,
                        $e.NODE_ALIGNMENT.SINGLE,
                        renderAs.children as T[]
                    )
                );
            }
            const target = renderAs || node;
            applyLayout(target, 'column', $const.CSS.WIDTH);
            if (!target.has($const.CSS.WIDTH)) {
                target.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, 'fill_horizontal');
            }
            const [rowStart, rowSpan] = applyLayout(target, 'row', $const.CSS.HEIGHT);
            if (mainData.alignContent === 'normal' && !parent.has($const.CSS.HEIGHT) && rowSpan === 1 && mainData.rowSpanMultiple[rowStart] === true && (!mainData.row.unit[rowStart] || mainData.row.unit[rowStart] === $const.CSS.AUTO) && node.initial.bounds && node.bounds.height > node.initial.bounds.height) {
                target.css('minHeight', $css.formatPX(node.actualHeight), true);
            }
            else if (!target.has($const.CSS.HEIGHT) && !(mainData.row.count === 1 && mainData.alignContent === 'space-between')) {
                target.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, 'fill_vertical');
                if (mainData.alignContent === 'normal' && parent.hasHeight && mainData.rowSpanMultiple.length === 0) {
                    target.mergeGravity('layout_rowWeight', '1');
                }
            }
        }
        return {
            parent: renderAs,
            renderAs,
            outputAs
        };
    }

    public postBaseLayout(node: T) {
        const mainData: CssGridData<T> = node.data($c.EXT_NAME.CSS_GRID, $c.STRING_BASE.EXT_DATA);
        if (mainData) {
            if (node.hasWidth && mainData.justifyContent !== 'normal') {
                setContentSpacing(mainData, node, mainData.justifyContent, 'column');
            }
            if (node.hasHeight && mainData.alignContent !== 'normal') {
                setContentSpacing(mainData, node, mainData.alignContent, 'row');
                if (mainData.rowWeight.length > 1) {
                    for (let i = 0; i < mainData.row.count; i++) {
                        if (mainData.rowWeight[i] > 0) {
                            const precision = this.application.controllerHandler.localSettings.precision.standardFloat;
                            for (let j = 0; j < mainData.rowData[i].length; j++) {
                                const item = mainData.rowData[i][j];
                                if (item) {
                                    for (let column of item) {
                                        if (column.outerWrapper) {
                                            column = column.outerWrapper as T;
                                        }
                                        column.android('layout_rowWeight', $math.truncate(mainData.rowWeight[i], precision).toString());
                                        column.setLayoutHeight($const.CSS.PX_0);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (mainData.column.normal && !mainData.column.unit.includes($const.CSS.AUTO)) {
                const columnGap =  mainData.column.gap * (mainData.column.count - 1);
                if (columnGap > 0) {
                    if (node.renderParent && !node.renderParent.hasAlign($e.NODE_ALIGNMENT.AUTO_LAYOUT)) {
                        node.cssPX('minWidth', columnGap);
                        node.cssPX($const.CSS.WIDTH, columnGap, false, true);
                    }
                    if (!node.has($const.CSS.WIDTH) && node.has('maxWidth')) {
                        node.css($const.CSS.WIDTH, $css.formatPX(node.actualWidth + columnGap), true);
                    }
                }
            }
        }
    }

    public postOptimize(node: T) {
        const mainData: CssGridData<T> = node.data($c.EXT_NAME.CSS_GRID, $c.STRING_BASE.EXT_DATA);
        if (mainData) {
            const controller = <android.base.Controller<T>> this.application.controllerHandler;
            const lastChild = Array.from(mainData.children)[mainData.children.size - 1];
            if (mainData.column.unit.length && mainData.column.unit.every(value => $css.isPercent(value))) {
                const percentTotal = mainData.column.unit.reduce((a, b) => a + parseFloat(b), 0) + (mainData.column.gap * mainData.column.count * 100) / node.actualWidth;
                if (percentTotal < 100) {
                    node.android('columnCount', (mainData.column.count + 1).toString());
                    for (let i = 0; i < mainData.row.count; i++) {
                        controller.addAfterOutsideTemplate(
                            lastChild.id,
                            controller.renderSpace(
                                $css.formatPercent((100 - percentTotal) / 100),
                                STRING_ANDROID.WRAP_CONTENT,
                                0,
                                0,
                                createViewAttribute(undefined, {
                                    [node.localizeString(STRING_ANDROID.MARGIN_LEFT)]: $css.formatPX(mainData.column.gap),
                                    layout_row: i.toString(),
                                    layout_column: mainData.column.count.toString()
                                })
                            )
                        );
                    }
                }
            }
            for (let i = 0; i < mainData.emptyRows.length; i++) {
                const item = mainData.emptyRows[i];
                if (item) {
                    for (let j = 0; j < item.length; j++) {
                        if (item[j] === 1) {
                            controller.addAfterOutsideTemplate(
                                lastChild.id,
                                controller.renderSpace(
                                    STRING_ANDROID.WRAP_CONTENT,
                                    $css.formatPX(mainData.row.gap),
                                    0,
                                    0,
                                    createViewAttribute(undefined, { layout_row: i.toString(), layout_column: j.toString() })
                                )
                            );
                            break;
                        }
                    }
                }
            }
        }
    }
}