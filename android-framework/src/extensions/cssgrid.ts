import { NodeXmlTemplate } from '../../../@types/base/application';
import { CssGridCellData, CssGridData, CssGridDirectionData } from '../../../@types/base/extension';

import Resource from '../resource';
import View from '../view';

import { CONTAINER_ANDROID, STRING_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';
import { createViewAttribute } from '../lib/util';

import $LayoutUI = squared.base.LayoutUI;

const {
    css: $css,
    math: $math,
    util: $util
} = squared.lib;

const {
    constant: $c,
    enumeration: $e
} = squared.base.lib;

const REGEXP_ALIGNSELF = /(start|end|center|baseline)/;
const REGEXP_JUSTIFYSELF = /(start|end|center|baseline|left|right)/;

function getRowData(mainData: CssGridData<View>, direction: string) {
    const result: Undefined<View[]>[][] = [];
    if (direction === 'column') {
        for (let i = 0; i < mainData.column.length; i++) {
            result[i] = [];
            for (let j = 0; j < mainData.row.length; j++) {
                result[i].push(mainData.rowData[j][i]);
            }
        }
    }
    else {
        for (let i = 0; i < mainData.row.length; i++) {
            result.push(mainData.rowData[i]);
        }
    }
    return result;
}

function getGridSize(mainData: CssGridData<View>, direction: string, node: View) {
    const horizontal = direction === 'column';
    const data: CssGridDirectionData = mainData[direction];
    const length = data.unit.length;
    let value = 0;
    if (length) {
        const dimension = horizontal ? 'width' : 'height';
        for (let i = 0; i < length; i++) {
            const unit = data.unit[i];
            if (unit.endsWith('px')) {
                value += parseFloat(unit);
            }
            else {
                let size = 0;
                $util.captureMap(
                    <View[][]> mainData.rowData[i],
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
    value += data.gap * (data.length - 1);
    if (horizontal) {
        value += node.contentBox ? node.borderLeftWidth + node.borderRightWidth : node.contentBoxWidth;
        return node.actualWidth - value;
    }
    else {
        value += node.contentBox ? node.borderTopWidth + node.borderBottomWidth : node.contentBoxHeight;
        return node.actualHeight - value;
    }
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
                dimension = 'width';
            }
            else {
                MARGIN_START = $e.BOX_STANDARD.MARGIN_TOP;
                MARGIN_END = $e.BOX_STANDARD.MARGIN_BOTTOM;
                dimension = 'height';
            }
            const rowData = getRowData(mainData, direction);
            const itemCount = mainData[direction].length;
            const adjusted = new Set<View>();
            function getMarginSize(value: number) {
                const marginSize = Math.floor(sizeTotal / value);
                return [marginSize, sizeTotal - (marginSize * value)];
            }
            switch (alignment) {
                case 'space-around': {
                    const [marginSize, marginExcess] = getMarginSize(itemCount * 2);
                    for (let i = 0; i < itemCount; i++) {
                        for (const item of new Set($util.flatMultiArray<View>(rowData[i]))) {
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
                            for (const item of new Set($util.flatMultiArray<View>(rowData[i]))) {
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
                        for (const item of new Set($util.flatMultiArray<View>(rowData[i]))) {
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
                case 'center':
                    node.modifyBox(padding, Math.floor(sizeTotal / 2));
                    data.normal = false;
                    break;
                case 'right':
                    if (direction === 'row') {
                        break;
                    }
                case 'end':
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
            const layout = new $LayoutUI(
                parent,
                node,
                CONTAINER_NODE.GRID,
                $e.NODE_ALIGNMENT.AUTO_LAYOUT,
                node.children as T[]
            );
            layout.rowCount = mainData.row.length;
            layout.columnCount = mainData.column.length;
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
                const horizontal = dimension === 'width';
                let size = 0;
                let minSize = 0;
                let fitContent = false;
                let minUnitSize = 0;
                let sizeWeight = 0;
                if (data.unit.length && data.unit.every(value => value === 'auto')) {
                    if (horizontal) {
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
                    if (unit === 'auto' || unit === 'max-content') {
                        if (cellSpan < data.unit.length && (!parent.hasPX(dimension) || data.unit.some(value => $css.isLength(value)) || unit === 'max-content')) {
                            size = node.bounds[dimension];
                            minSize = 0;
                            sizeWeight = 0;
                            break;
                        }
                        else if (horizontal) {
                            size = 0;
                            minSize = 0;
                            sizeWeight = 0.01;
                            break;
                        }
                    }
                    else if (unit === 'min-content') {
                        if (!item.hasPX(dimension)) {
                            if (horizontal) {
                                item.setLayoutWidth('wrap_content', false);
                            }
                            else {
                                item.setLayoutHeight('wrap_content', false);
                            }
                            break;
                        }
                    }
                    else if ($css.isPercent(unit)) {
                        sizeWeight += parseFloat(unit) / 100;
                        minSize = size;
                        size = 0;
                    }
                    else if (unit.endsWith('fr')) {
                        if (horizontal || node.hasHeight) {
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
                    if (unitMin === '0px' && node.textElement) {
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
                    if (data.autoFill && size === 0 && mainData[direction === 'column' ? 'row' : 'column'].length === 1) {
                        size = Math.max(node.actualWidth, minUnitSize);
                        sizeWeight = 0;
                    }
                    else {
                        minSize = minUnitSize;
                    }
                }
                const dimensionA = $util.capitalize(dimension);
                item.android(`layout_${direction}`, cellStart.toString());
                if (cellSpan > 1) {
                    item.android(`layout_${direction}Span`, cellSpan.toString());
                }
                if (minSize > 0 && !item.hasPX(`min${dimensionA}`)) {
                    item.css(`min${dimensionA}`, $css.formatPX(minSize), true);
                }
                if (sizeWeight > 0) {
                    if (!item.hasPX(dimension)) {
                        item.android(`layout_${dimension}`, '0px');
                        item.android(`layout_${direction}Weight`, $math.truncate(sizeWeight, node.localSettings.floatPrecision));
                        item.mergeGravity('layout_gravity', direction === 'column' ? 'fill_horizontal' : 'fill_vertical');
                    }
                }
                else if (size > 0) {
                    if (item.contentBox) {
                        size -= item[`contentBox${dimensionA}`];
                    }
                    if (fitContent && !item.hasPX(`max${dimensionA}`)) {
                        item.css(`max${dimensionA}`, $css.formatPX(size), true);
                        item.mergeGravity('layout_gravity', direction === 'column' ? 'fill_horizontal' : 'fill_vertical');
                    }
                    else if (!item.hasPX(dimension)) {
                        item.css(dimension, $css.formatPX(size), true);
                    }
                }
                return [cellStart, cellSpan];
            }
            const { alignSelf, justifySelf } = node.flexbox;
            if (REGEXP_ALIGNSELF.test(alignSelf) || REGEXP_JUSTIFYSELF.test(justifySelf)) {
                renderAs = this.application.createNode();
                renderAs.containerName = node.containerName;
                renderAs.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                renderAs.inherit(node, 'base', 'initial');
                renderAs.resetBox($e.BOX_STANDARD.MARGIN | $e.BOX_STANDARD.PADDING);
                renderAs.exclude($e.NODE_RESOURCE.BOX_STYLE | $e.NODE_RESOURCE.ASSET, $e.NODE_PROCEDURE.CUSTOMIZATION);
                parent.appendTry(node, renderAs);
                renderAs.render(parent);
                node.transferBox($e.BOX_STANDARD.MARGIN, renderAs);
                applyLayout(renderAs, 'column', 'width');
                applyLayout(renderAs, 'row', 'height');
                let inlineWidth = false;
                if (justifySelf.endsWith('start') || justifySelf.endsWith('left') || justifySelf.endsWith('baseline')) {
                    node.mergeGravity('layout_gravity', 'left');
                    inlineWidth = true;
                }
                else if (justifySelf.endsWith('end') || justifySelf.endsWith('right')) {
                    node.mergeGravity('layout_gravity', 'right');
                    inlineWidth = true;
                }
                else if (justifySelf.endsWith('center')) {
                    node.mergeGravity('layout_gravity', STRING_ANDROID.CENTER_HORIZONTAL);
                    inlineWidth = true;
                }
                if (!node.hasWidth) {
                    node.setLayoutWidth(inlineWidth ? 'wrap_content' : 'match_parent', false);
                }
                if (alignSelf.endsWith('start') || alignSelf.endsWith('baseline')) {
                    node.mergeGravity('layout_gravity', 'top');
                }
                else if (alignSelf.endsWith('end')) {
                    node.mergeGravity('layout_gravity', 'bottom');
                }
                else if (alignSelf.endsWith('center')) {
                    node.mergeGravity('layout_gravity', STRING_ANDROID.CENTER_VERTICAL);
                }
                else if (!node.hasHeight) {
                    node.setLayoutHeight('match_parent', false);
                }
                renderAs.innerWrapped = node;
                node.outerWrapper = renderAs;
                node.parent = renderAs;
                outputAs = this.application.renderNode(
                    new $LayoutUI(
                        parent,
                        renderAs,
                        CONTAINER_NODE.FRAME,
                        $e.NODE_ALIGNMENT.SINGLE,
                        renderAs.children as T[]
                    )
                );
            }
            const target = renderAs || node;
            applyLayout(target, 'column', 'width');
            if (!target.hasPX('width')) {
                target.mergeGravity('layout_gravity', 'fill_horizontal');
            }
            const [rowStart, rowSpan] = applyLayout(target, 'row', 'height');
            function checkRowSpan() {
                if (rowSpan === 1 && mainData.rowSpanMultiple[rowStart] === true) {
                    const row = $util.flatMultiArray<T>(mainData.rowData[rowStart]);
                    const rowCount = mainData.rowData.length;
                    for (const item of row) {
                        if (item !== node) {
                            const data: CssGridCellData = item.data($c.EXT_NAME.CSS_GRID, 'cellData');
                            if (data && (rowStart === 0 || data.rowSpan < rowCount) && data.rowSpan > rowSpan) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            }
            if (mainData.alignContent === 'normal' && !parent.hasPX('height') && (!mainData.row.unit[rowStart] || mainData.row.unit[rowStart] === 'auto') && node.initial.bounds && node.bounds.height > node.initial.bounds.height && checkRowSpan()) {
                target.css('minHeight', $css.formatPX(node.actualHeight), true);
            }
            else if (!target.hasPX('height') && !(mainData.row.length === 1 && mainData.alignContent === 'space-between')) {
                if (!REGEXP_ALIGNSELF.test(mainData.alignItems)) {
                    target.mergeGravity('layout_gravity', 'fill_vertical');
                }
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
                    const precision = this.controller.localSettings.precision.standardFloat;
                    for (let i = 0; i < mainData.row.length; i++) {
                        if (mainData.rowWeight[i] > 0) {
                            const rowData = mainData.rowData[i];
                            const length = rowData.length;
                            for (let j = 0; j < length; j++) {
                                const item = rowData[j];
                                if (item) {
                                    for (let column of item) {
                                        if (column.outerWrapper) {
                                            column = column.outerWrapper as T;
                                        }
                                        column.android('layout_rowWeight', $math.truncate(mainData.rowWeight[i], precision).toString());
                                        column.setLayoutHeight('0px');
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (mainData.column.normal && !mainData.column.unit.includes('auto')) {
                const columnGap =  mainData.column.gap * (mainData.column.length - 1);
                if (columnGap > 0) {
                    if (node.renderParent && !node.renderParent.hasAlign($e.NODE_ALIGNMENT.AUTO_LAYOUT)) {
                        node.cssPX('minWidth', columnGap);
                        node.cssPX('width', columnGap, false, true);
                    }
                    if (!node.hasPX('width') && node.hasPX('maxWidth')) {
                        node.css('width', $css.formatPX(node.actualWidth + columnGap), true);
                    }
                }
            }
        }
    }

    public postOptimize(node: T) {
        const mainData: CssGridData<T> = node.data($c.EXT_NAME.CSS_GRID, $c.STRING_BASE.EXT_DATA);
        if (mainData) {
            const controller = <android.base.Controller<T>> this.controller;
            const lastChild = Array.from(mainData.children)[mainData.children.size - 1];
            if (mainData.column.unit.length && mainData.column.unit.every(value => $css.isPercent(value))) {
                const percentTotal = mainData.column.unit.reduce((a, b) => a + parseFloat(b), 0) + (mainData.column.gap * mainData.column.length * 100) / node.actualWidth;
                if (percentTotal < 100) {
                    node.android('columnCount', (mainData.column.length + 1).toString());
                    for (let i = 0; i < mainData.row.length; i++) {
                        controller.addAfterOutsideTemplate(
                            lastChild.id,
                            controller.renderSpace(
                                $css.formatPercent((100 - percentTotal) / 100),
                                'wrap_content',
                                0,
                                0,
                                createViewAttribute(undefined, {
                                    [node.localizeString(STRING_ANDROID.MARGIN_LEFT)]: `@dimen/${Resource.insertStoredAsset('dimens', `${node.controlId}_cssgrid_column_gap_`, $css.formatPX(mainData.column.gap))}`,
                                    layout_row: i.toString(),
                                    layout_column: mainData.column.length.toString()
                                })
                            ),
                            false
                        );
                    }
                }
            }
            const emptyRows = mainData.emptyRows;
            const lengthA = emptyRows.length;
            for (let i = 0; i < lengthA; i++) {
                const item = emptyRows[i];
                if (item) {
                    const lengthB = item.length;
                    for (let j = 0; j < lengthB; j++) {
                        if (item[j] === 1) {
                            controller.addAfterOutsideTemplate(
                                lastChild.id,
                                controller.renderSpace(
                                    'wrap_content',
                                    `@dimen/${Resource.insertStoredAsset('dimens', `${node.controlId}_cssgrid_row_gap_`, $css.formatPX(mainData.row.gap))}`,
                                    0,
                                    0,
                                    createViewAttribute(undefined, { layout_row: i.toString(), layout_column: j.toString() })
                                ),
                                false
                            );
                            break;
                        }
                    }
                }
            }
        }
    }
}