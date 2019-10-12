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
const REGEXP_JUSTIFYSELF = /(start|left|center|right|end)/;

function getRowData(mainData: CssGridData<View>, horizontal: boolean) {
    const rowData = mainData.rowData;
    if (horizontal) {
        const lengthA = mainData.column.length;
        const lengthB = mainData.row.length;
        const result: Undefined<View[]>[][] = new Array(lengthA);
        for (let i = 0; i < lengthA; i++) {
            const data = new Array(lengthB);
            for (let j = 0; j < lengthB; j++) {
                data[j] = rowData[j][i];
            }
            result[i] = data;
        }
        return result;
    }
    else {
        return rowData;
    }
}

function getGridSize(node: View, mainData: CssGridData<View>, horizontal: boolean) {
    const data = horizontal ? mainData.column : mainData.row;
    const unit = data.unit;
    const length = unit.length;
    let value = 0;
    if (length) {
        const dimension = horizontal ? 'width' : 'height';
        for (let i = 0; i < length; i++) {
            const unitPX = unit[i];
            if (unitPX.endsWith('px')) {
                value += parseFloat(unitPX);
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

function setContentSpacing(node: View, mainData: CssGridData<View>, alignment: string, horizontal: boolean, dimension: string, MARGIN_START: number, MARGIN_END: number) {
    const data = horizontal ? mainData.column : mainData.row;
    if (alignment.startsWith('space')) {
        const sizeTotal = getGridSize(node, mainData, horizontal);
        if (sizeTotal > 0) {
            const rowData = getRowData(mainData, horizontal);
            const itemCount = data.length;
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
                                else if ($util.convertInt(item.android(horizontal ? 'layout_columnSpan' : 'layout_rowSpan')) > 1) {
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
        const sizeTotal = getGridSize(node, mainData, horizontal);
        if (sizeTotal > 0) {
            const padding = horizontal ? $e.BOX_STANDARD.PADDING_LEFT : $e.BOX_STANDARD.PADDING_TOP;
            switch (alignment) {
                case 'center':
                    node.modifyBox(padding, Math.floor(sizeTotal / 2));
                    data.normal = false;
                    break;
                case 'right':
                    if (!horizontal) {
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
            for (const image of node.cascade(item => item.imageElement) as T[]) {
                const asset = this.resource.getImage(image.src);
                if (asset) {
                    if (!image.hasPX('width', false) && asset.width > image.bounds.width) {
                        image.css('width', $css.formatPX(image.bounds.width), true);
                        image.android('adjustViewBounds', 'true');
                    }
                    else if (!image.hasPX('height', false) && asset.height > image.bounds.height) {
                        image.css('height', $css.formatPX(image.bounds.height), true);
                        image.android('adjustViewBounds', 'true');
                    }
                }
            }
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
            function applyLayout(item: T, horizontal: boolean, dimension: string) {
                let data: CssGridDirectionData;
                let cellStart: number;
                let cellSpan: number;
                if (horizontal) {
                    data = mainData.column;
                    cellStart = cellData.columnStart;
                    cellSpan = cellData.columnSpan;
                }
                else {
                    data = mainData.row;
                    cellStart = cellData.rowStart;
                    cellSpan = cellData.rowSpan;
                }
                const unitMin = data.unitMin;
                const unitDimension = horizontal ? STRING_ANDROID.HORIZONTAL : STRING_ANDROID.VERTICAL;
                let unit = data.unit;
                let size = 0;
                let minSize = 0;
                let fitContent = false;
                let minUnitSize = 0;
                let sizeWeight = 0;
                if (unit.length && unit.every(value => value === 'auto')) {
                    if (horizontal) {
                        unit = new Array(unit.length).fill('1fr');
                        data.unit = unit;
                    }
                    else {
                        unit.length = 0;
                    }
                }
                for (let i = 0, j = 0; i < cellSpan; i++) {
                    const k = cellStart + i;
                    const min = unitMin[k];
                    if (min !== '') {
                        minUnitSize += parent.parseUnit(min);
                    }
                    let value = unit[k];
                    if (!value) {
                        const auto = data.auto;
                        if (auto[j]) {
                            value = auto[j];
                            if (auto[j + 1]) {
                                j++;
                            }
                        }
                        else {
                            continue;
                        }
                    }
                    if (value === 'auto' || value === 'max-content') {
                        if (cellSpan < unit.length && (!parent.hasPX(dimension) || unit.some(px => $css.isLength(px)) || value === 'max-content')) {
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
                    else if (value === 'min-content') {
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
                    else if (value.endsWith('fr')) {
                        if (horizontal || node.hasHeight) {
                            sizeWeight += parseFloat(value);
                            minSize = size;
                        }
                        else {
                            sizeWeight = 0;
                            minSize = node.bounds[dimension];
                        }
                        size = 0;
                    }
                    else if ($css.isPercent(value)) {
                        sizeWeight += parseFloat(value) / 100;
                        minSize = size;
                        size = 0;
                    }
                    else {
                        const gap = item.parseUnit(value, unitDimension);
                        if (minSize === 0) {
                            size += gap;
                        }
                        else {
                            minSize += gap;
                        }
                    }
                    if (min === '0px' && node.textElement) {
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
                    if (data.autoFill && size === 0 && (horizontal ? mainData.row.length : mainData.column.length) === 1) {
                        size = Math.max(node.actualWidth, minUnitSize);
                        sizeWeight = 0;
                    }
                    else {
                        minSize = minUnitSize;
                    }
                }
                item.android(horizontal ? 'layout_column' : 'layout_row', cellStart.toString());
                if (cellSpan > 1) {
                    item.android(horizontal ? 'layout_columnSpan' : 'layout_rowSpan', cellSpan.toString());
                }
                if (minSize > 0 && !item.hasPX(horizontal ? 'minWidth' : 'minHeight')) {
                    item.css(horizontal ? 'minWidth' : 'minHeight', $css.formatPX(minSize), true);
                }
                if (sizeWeight > 0) {
                    if (!item.hasPX(dimension)) {
                        const weight = $math.truncate(sizeWeight, node.localSettings.floatPrecision);
                        if (horizontal) {
                            item.android('layout_width', '0px');
                            item.android('layout_columnWeight', weight);
                            item.mergeGravity('layout_gravity', 'fill_horizontal');
                        }
                        else {
                            item.android('layout_height', '0px');
                            item.android('layout_rowWeight', weight);
                            item.mergeGravity('layout_gravity', 'fill_vertical');
                        }
                    }
                }
                else if (size > 0) {
                    if (item.contentBox) {
                        size -= horizontal ? item.contentBoxWidth : item.contentBoxHeight;
                    }
                    if (fitContent && !item.hasPX(horizontal ? 'maxWidth' : 'maxHeight')) {
                        item.css(horizontal ? 'maxWidth' : 'maxHeight', $css.formatPX(size), true);
                        item.mergeGravity('layout_gravity', horizontal ? 'fill_horizontal' : 'fill_vertical');
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
                applyLayout(renderAs, true, 'width');
                applyLayout(renderAs, false, 'height');
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
            const row = mainData.row;
            applyLayout(target, true, 'width');
            if (!target.hasPX('width')) {
                target.mergeGravity('layout_gravity', 'fill_horizontal');
            }
            const [rowStart, rowSpan] = applyLayout(target, false, 'height');
            function checkRowSpan() {
                if (rowSpan === 1 && mainData.rowSpanMultiple[rowStart] === true) {
                    const rowCount = mainData.rowData.length;
                    for (const item of $util.flatMultiArray<T>(mainData.rowData[rowStart])) {
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
            if (mainData.alignContent === 'normal' && !parent.hasPX('height') && (!row.unit[rowStart] || row.unit[rowStart] === 'auto') && node.initial.bounds && node.bounds.height > node.initial.bounds.height && checkRowSpan()) {
                target.css('minHeight', $css.formatPX(node.actualHeight), true);
            }
            else if (!target.hasPX('height') && !(row.length === 1 && mainData.alignContent === 'space-between')) {
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
                setContentSpacing(node, mainData, mainData.justifyContent, true, 'width', $e.BOX_STANDARD.MARGIN_LEFT, $e.BOX_STANDARD.MARGIN_RIGHT);
            }
            if (node.hasHeight && mainData.alignContent !== 'normal') {
                setContentSpacing(node, mainData, mainData.alignContent, false, 'height', $e.BOX_STANDARD.MARGIN_TOP, $e.BOX_STANDARD.MARGIN_BOTTOM);
                const rowWeight = mainData.rowWeight;
                if (rowWeight.length > 1) {
                    const precision = this.controller.localSettings.precision.standardFloat;
                    for (let i = 0; i < mainData.row.length; i++) {
                        if (rowWeight[i] > 0) {
                            const rowData = mainData.rowData[i];
                            const length = rowData.length;
                            for (let j = 0; j < length; j++) {
                                const item = rowData[j];
                                if (item) {
                                    for (let col of item) {
                                        if (col.outerWrapper) {
                                            col = col.outerWrapper as T;
                                        }
                                        col.android('layout_rowWeight', $math.truncate(rowWeight[i], precision).toString());
                                        col.setLayoutHeight('0px');
                                    }
                                }
                            }
                        }
                    }
                }
            }
            const column = mainData.column;
            if (column.normal && !column.unit.includes('auto')) {
                const gap =  column.gap * (column.length - 1);
                if (gap > 0) {
                    const renderParent = node.renderParent;
                    if (renderParent && !renderParent.hasAlign($e.NODE_ALIGNMENT.AUTO_LAYOUT)) {
                        node.cssPX('minWidth', gap);
                        node.cssPX('width', gap, false, true);
                    }
                    if (!node.hasPX('width') && node.hasPX('maxWidth')) {
                        node.css('width', $css.formatPX(node.actualWidth + gap), true);
                    }
                }
            }
        }
    }

    public postOptimize(node: T) {
        const mainData: CssGridData<T> = node.data($c.EXT_NAME.CSS_GRID, $c.STRING_BASE.EXT_DATA);
        if (mainData) {
            const controller = <android.base.Controller<T>> this.controller;
            const { children, column } = mainData;
            const unit = column.unit;
            const lastChild = children[children.length - 1];
            if (unit.length && unit.every(value => $css.isPercent(value))) {
                const columnCount = column.length;
                const percent = unit.reduce((a, b) => a + parseFloat(b), 0) + (column.gap * columnCount * 100) / node.actualWidth;
                if (percent < 100) {
                    const columnGap = '@dimen/' + Resource.insertStoredAsset('dimens', node.controlId + '_cssgrid_column_gap', $css.formatPX(column.gap));
                    const lengthA = mainData.row.length;
                    for (let i = 0; i < lengthA; i++) {
                        controller.addAfterOutsideTemplate(
                            lastChild.id,
                            controller.renderSpace(
                                $css.formatPercent((100 - percent) / 100),
                                'wrap_content',
                                0,
                                0,
                                createViewAttribute(undefined, {
                                    [node.localizeString(STRING_ANDROID.MARGIN_LEFT)]: columnGap,
                                    layout_row: i.toString(),
                                    layout_column: columnCount.toString()
                                })
                            ),
                            false
                        );
                    }
                    node.android('columnCount', (columnCount + 1).toString());
                }
            }
            const emptyRows = mainData.emptyRows;
            const length = emptyRows.length;
            for (let i = 0; i < length; i++) {
                const row = emptyRows[i];
                if (row) {
                    const rowGap = '@dimen/' + Resource.insertStoredAsset('dimens', node.controlId + '_cssgrid_row_gap', $css.formatPX(mainData.row.gap));
                    const lengthA = row.length;
                    for (let j = 0; j < lengthA; j++) {
                        if (row[j] === 1) {
                            controller.addAfterOutsideTemplate(
                                lastChild.id,
                                controller.renderSpace(
                                    'wrap_content',
                                    rowGap,
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