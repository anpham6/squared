import { NodeXmlTemplate } from '../../../@types/base/application';
import { CssGridCellData, CssGridData, CssGridDirectionData } from '../../../@types/base/extension';

import Resource from '../resource';
import View from '../view';

import { CONTAINER_ANDROID, STRING_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;
import CssGrid = squared.base.extensions.CssGrid;

const $lib = squared.lib;
const { formatPercent, formatPX, isLength, isPercent } = $lib.css;
const { maxArray, truncate } = $lib.math;
const { CHAR, CSS } = $lib.regex;
const { captureMap, flatMultiArray, objectMap } = $lib.util;

const $base_lib = squared.base.lib;
const { BOX_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE } = $base_lib.enumeration;

const { CSS_GRID } = $base_lib.constant.EXT_NAME;

const REGEX_ALIGNSELF = /start|end|center|baseline/;
const REGEX_JUSTIFYSELF = /start|left|center|right|end/;
const REGEX_FR = /fr$/;

function getRowData(mainData: CssGridData<View>, horizontal: boolean) {
    const rowData = mainData.rowData;
    if (horizontal) {
        const length = mainData.column.length;
        const lengthA = mainData.row.length;
        const result: Undefined<View[]>[][] = new Array(length);
        for (let i = 0; i < length; i++) {
            const data = new Array(lengthA);
            for (let j = 0; j < lengthA; j++) {
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
            if (CSS.PX.test(unitPX)) {
                value += parseFloat(unitPX);
            }
            else {
                let size = 0;
                captureMap(
                    <View[][]> mainData.rowData[i],
                    item => !!item && item.length > 0,
                    item => size = Math.min(size, ...objectMap(item, child => child.bounds[dimension]))
                );
                value += size;
            }
        }
    }
    else {
        value = maxArray(data.unitTotal);
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

function setContentSpacing(node: View, mainData: CssGridData<View>, alignment: string, horizontal: boolean, dimension: string, outerWrapper: boolean, MARGIN_START: number, MARGIN_END: number) {
    const data = horizontal ? mainData.column : mainData.row;
    if (/^space/.test(alignment)) {
        const gridSize = getGridSize(node, mainData, horizontal);
        if (gridSize > 0) {
            const rowData = getRowData(mainData, horizontal);
            const itemCount = data.length;
            const adjusted = new Set<View>();
            function getMarginSize(value: number) {
                const marginSize = Math.floor(gridSize / value);
                return [marginSize, gridSize - (marginSize * value)];
            }
            switch (alignment) {
                case 'space-around': {
                    const [marginSize, marginExcess] = getMarginSize(itemCount * 2);
                    for (let i = 0; i < itemCount; i++) {
                        for (const item of new Set(flatMultiArray<View>(rowData[i]))) {
                            const marginStart = (i > 0 && i <= marginExcess ? 1 : 0) + marginSize;
                            if (!adjusted.has(item)) {
                                item.modifyBox(MARGIN_START, marginStart);
                                item.modifyBox(MARGIN_END, marginSize);
                                adjusted.add(item);
                            }
                            else {
                                item.cssPX(dimension, gridSize / itemCount, false, true);
                            }
                        }
                    }
                    break;
                }
                case 'space-between': {
                    if (itemCount > 1) {
                        const [marginSize, marginExcess] = getMarginSize(itemCount - 1);
                        for (let i = 0; i < itemCount; i++) {
                            for (const item of new Set(flatMultiArray<View>(rowData[i]))) {
                                const marginEnd = marginSize + (i < marginExcess ? 1 : 0);
                                if (i < itemCount - 1) {
                                    if (!adjusted.has(item)) {
                                        item.modifyBox(MARGIN_END, marginEnd);
                                        adjusted.add(item);
                                    }
                                    else {
                                        item.cssPX(dimension, marginEnd, false, true);
                                    }
                                }
                                else if (parseInt(item.android(horizontal ? 'layout_columnSpan' : 'layout_rowSpan')) > 1) {
                                    item.cssPX(dimension, marginEnd, true);
                                    if (adjusted.has(item)) {
                                        item.modifyBox(MARGIN_END, -marginEnd);
                                    }
                                }
                            }
                        }
                        break;
                    }
                    else {
                        return;
                    }
                }
                case 'space-evenly': {
                    const [marginSize, marginExcess] = getMarginSize(itemCount + 1);
                    for (let i = 0; i < itemCount; i++) {
                        for (const item of new Set(flatMultiArray<View>(rowData[i]))) {
                            let marginEnd = marginSize + (i < marginExcess ? 1 : 0);
                            if (!adjusted.has(item)) {
                                if (outerWrapper) {
                                    marginEnd /= 2;
                                    item.modifyBox(MARGIN_START, marginEnd);
                                    item.modifyBox(MARGIN_END, marginEnd);
                                }
                                else {
                                    if (i === 0) {
                                        item.modifyBox(MARGIN_START, marginSize);
                                    }
                                    item.modifyBox(MARGIN_END, marginEnd);
                                }
                                adjusted.add(item);
                            }
                            else {
                                item.cssPX(dimension, marginEnd, false, true);
                            }
                        }
                    }
                    break;
                }
            }
        }
    }
    else {
        if (outerWrapper) {
            switch (alignment) {
                case 'center':
                    node.anchorParent(horizontal ? STRING_ANDROID.HORIZONTAL : STRING_ANDROID.VERTICAL, 'packed', 0.5, true);
                    break;
                case 'right':
                    if (!horizontal) {
                        break;
                    }
                case 'end':
                case 'flex-end':
                    node.anchorParent(horizontal ? STRING_ANDROID.HORIZONTAL : STRING_ANDROID.VERTICAL, 'packed', 1, true);
                    break;
            }
        }
        else {
            let gridSize = getGridSize(node, mainData, horizontal);
            if (gridSize > 0) {
                switch (alignment) {
                    case 'center':
                        gridSize /= 2;
                        if (horizontal) {
                            node.modifyBox(BOX_STANDARD.PADDING_LEFT, Math.floor(gridSize));
                        }
                        else {
                            node.modifyBox(BOX_STANDARD.PADDING_TOP, Math.floor(gridSize));
                            node.modifyBox(BOX_STANDARD.PADDING_BOTTOM, Math.ceil(gridSize));
                        }
                        break;
                    case 'right':
                        if (!horizontal) {
                            break;
                        }
                    case 'end':
                    case 'flex-end':
                        node.modifyBox(horizontal ? BOX_STANDARD.PADDING_LEFT : BOX_STANDARD.PADDING_TOP, gridSize);
                        break;
                }
            }
        }
    }
}

function getCellDimensions(node: View, horizontal: boolean, section: string[], insideGap: number): (string | undefined)[] {
    let width: string | undefined;
    let height: string | undefined;
    let layout_columnWeight: string | undefined;
    let layout_rowWeight: string | undefined;
    if (section.every(value => CSS.PX.test(value))) {
        let px = insideGap;
        for (const value of section) {
            px += parseFloat(value);
        }
        const dimension = formatPX(px);
        if (horizontal) {
            width = dimension;
        }
        else {
            height = dimension;
        }
    }
    else if (section.every(value => REGEX_FR.test(value))) {
        let fr = 0;
        for (const value of section) {
            fr += parseFloat(value);
        }
        const weight = truncate(fr, node.localSettings.floatPrecision);
        if (horizontal) {
            layout_columnWeight = weight;
            width = '0px';
        }
        else {
            layout_rowWeight = weight;
            height = '0px';
        }
    }
    else if (section.every(value => isPercent(value))) {
        const percent = formatPercent((section.reduce((a, b) => a + parseFloat(b), 0) + insideGap / (horizontal ? node.actualWidth : node.actualHeight)) / 100);
        if (horizontal) {
            width = percent;
        }
        else {
            height = percent;
        }
    }
    else {
        if (horizontal) {
            width = 'wrap_content';
        }
        else {
            height = 'wrap_content';
        }
    }
    return [width, height, layout_columnWeight, layout_rowWeight];
}

export default class <T extends View> extends squared.base.extensions.CssGrid<T> {
    public processNode(node: T, parent: T) {
        super.processNode(node, parent);
        const mainData: CssGridData<T> = node.data(CSS_GRID, 'mainData');
        if (mainData) {
            const layout = new LayoutUI(
                parent,
                node,
                CONTAINER_NODE.GRID,
                NODE_ALIGNMENT.AUTO_LAYOUT,
                node.children as T[]
            );
            layout.rowCount = mainData.row.length;
            layout.columnCount = mainData.column.length;
            for (const image of node.cascade(item => item.imageElement) as T[]) {
                const asset = this.resource.getImage(image.src);
                if (asset) {
                    const { width, height } = image.bounds;
                    if (!image.hasPX('width', false) && asset.width > width) {
                        image.css('width', formatPX(width));
                        image.android('adjustViewBounds', 'true');
                    }
                    else if (!image.hasPX('height', false) && asset.height > height) {
                        image.css('height', formatPX(height));
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
        const mainData: CssGridData<T> = parent.data(CSS_GRID, 'mainData');
        const cellData: CssGridCellData = node.data(CSS_GRID, 'cellData');
        let renderAs: T | undefined;
        let outputAs: NodeXmlTemplate<T> | undefined;
        if (mainData && cellData) {
            const { alignContent, column, row } = mainData;
            const { alignSelf, justifySelf } = node.flexbox;
            function applyLayout(item: T, horizontal: boolean, dimension: string) {
                let data: CssGridDirectionData;
                let cellStart: number;
                let cellSpan: number;
                let unitDimension: string;
                if (horizontal) {
                    data = column;
                    unitDimension = STRING_ANDROID.HORIZONTAL;
                    ({ columnStart: cellStart, columnSpan: cellSpan } = cellData);
                }
                else {
                    data = row;
                    unitDimension = STRING_ANDROID.VERTICAL;
                    ({ rowStart: cellStart, rowSpan: cellSpan } = cellData);
                }
                const unitMin = data.unitMin;
                let unit = data.unit;
                let size = 0;
                let minSize = 0;
                let fitContent = false;
                let minUnitSize = 0;
                let sizeWeight = 0;
                if (unit.every(value => value === 'auto')) {
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
                        if (cellSpan < unit.length && (!parent.hasPX(dimension) || unit.some(px => isLength(px)) || value === 'max-content')) {
                            size = node.bounds[dimension];
                            minSize = 0;
                            sizeWeight = 0;
                            break;
                        }
                        else if (horizontal) {
                            size = 0;
                            minSize = 0;
                            sizeWeight = -1;
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
                    else if (/fr$/.test(value)) {
                        if (horizontal || parent.hasHeight) {
                            if (sizeWeight === -1) {
                                sizeWeight = 0;
                            }
                            sizeWeight += parseFloat(value);
                            minSize = size;
                        }
                        else {
                            sizeWeight = 0;
                            minSize = node.bounds[dimension];
                        }
                        size = 0;
                    }
                    else if (isPercent(value)) {
                        if (sizeWeight === -1) {
                            sizeWeight = 0;
                        }
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
                    if (node.textElement && CHAR.UNITZERO.test(min)) {
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
                    if (data.autoFill && size === 0 && (horizontal ? row.length : column.length) === 1) {
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
                    item.css(horizontal ? 'minWidth' : 'minHeight', formatPX(minSize), true);
                }
                if (size === 0 && cellSpan === data.length) {
                    if (horizontal) {
                        item.setLayoutWidth('match_parent');
                    }
                    else {
                        item.setLayoutHeight('match_parent');
                    }
                }
                else {
                    let columnWeight = horizontal && column.flexible;
                    if (sizeWeight !== 0) {
                        if (!item.hasPX(dimension)) {
                            if (horizontal) {
                                if ((sizeWeight === 1 || sizeWeight === -1) && cellData.columnSpan === column.length) {
                                    item.setLayoutWidth('match_parent');
                                }
                                else {
                                    item.setLayoutWidth('0px');
                                    item.android('layout_columnWeight', sizeWeight === -1 ? '0.01' : truncate(sizeWeight, node.localSettings.floatPrecision));
                                    item.mergeGravity('layout_gravity', 'fill_horizontal');
                                }
                                columnWeight = false;
                            }
                            else {
                                if (sizeWeight === 1 && cellData.rowSpan === row.length) {
                                    item.setLayoutHeight('match_parent');
                                }
                                else {
                                    item.setLayoutHeight('0px');
                                    item.android('layout_rowWeight', truncate(sizeWeight, node.localSettings.floatPrecision));
                                    item.mergeGravity('layout_gravity', 'fill_vertical');
                                }
                            }
                        }
                    }
                    else if (size > 0) {
                        if (item.contentBox) {
                            size -= horizontal ? item.contentBoxWidth : item.contentBoxHeight;
                        }
                        if (fitContent && !item.hasPX(horizontal ? 'maxWidth' : 'maxHeight')) {
                            item.css(horizontal ? 'maxWidth' : 'maxHeight', formatPX(size), true);
                            item.mergeGravity('layout_gravity', horizontal ? 'fill_horizontal' : 'fill_vertical');
                        }
                        else if (!item.hasPX(dimension)) {
                            item.css(dimension, formatPX(size), true);
                        }
                    }
                    if (columnWeight) {
                        item.android('layout_columnWeight', '0');
                    }
                }
                return [cellStart, cellSpan];
            }
            if (REGEX_ALIGNSELF.test(alignSelf) || REGEX_JUSTIFYSELF.test(justifySelf)) {
                renderAs = this.application.createNode();
                renderAs.containerName = node.containerName;
                renderAs.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                renderAs.inherit(node, 'base', 'initial');
                renderAs.resetBox(BOX_STANDARD.MARGIN | BOX_STANDARD.PADDING);
                renderAs.exclude({ resource: NODE_RESOURCE.BOX_STYLE | NODE_RESOURCE.ASSET, procedure: NODE_PROCEDURE.CUSTOMIZATION });
                parent.appendTry(node, renderAs);
                renderAs.render(parent);
                node.transferBox(BOX_STANDARD.MARGIN, renderAs);
                let inlineWidth: boolean;
                if (/(start|left|baseline)$/.test(justifySelf)) {
                    node.mergeGravity('layout_gravity', 'left');
                    inlineWidth = true;
                }
                else if (/(end|right)$/.test(justifySelf)) {
                    node.mergeGravity('layout_gravity', 'right');
                    inlineWidth = true;
                }
                else if (justifySelf === 'center') {
                    node.mergeGravity('layout_gravity', STRING_ANDROID.CENTER_HORIZONTAL);
                    inlineWidth = true;
                }
                else {
                    inlineWidth = false;
                }
                if (!node.hasWidth) {
                    node.setLayoutWidth(inlineWidth ? 'wrap_content' : 'match_parent', false);
                }
                if (/(start|baseline)$/.test(alignSelf)) {
                    node.mergeGravity('layout_gravity', 'top');
                }
                else if (/end$/.test(alignSelf)) {
                    node.mergeGravity('layout_gravity', 'bottom');
                }
                else if (alignSelf === 'center') {
                    node.mergeGravity('layout_gravity', STRING_ANDROID.CENTER_VERTICAL);
                }
                else if (!node.hasHeight) {
                    node.setLayoutHeight('match_parent', false);
                }
                renderAs.innerWrapped = node;
                node.parent = renderAs;
                outputAs = this.application.renderNode(
                    new LayoutUI(
                        parent,
                        renderAs,
                        CONTAINER_NODE.FRAME,
                        NODE_ALIGNMENT.SINGLE,
                        renderAs.children as T[]
                    )
                );
            }
            else {
                node.mergeGravity('layout_gravity', 'top');
            }
            const target = renderAs || node;
            applyLayout(target, true, 'width');
            const [rowStart, rowSpan] = applyLayout(target, false, 'height');
            function checkRowSpan() {
                if (rowSpan === 1 && mainData.rowSpanMultiple[rowStart] === true) {
                    const rowData = mainData.rowData;
                    const rowCount = rowData.length;
                    for (const item of flatMultiArray<T>(rowData[rowStart])) {
                        if (item !== node) {
                            const data: CssGridCellData = item.data(CSS_GRID, 'cellData');
                            if (data && (rowStart === 0 || data.rowSpan < rowCount) && data.rowSpan > rowSpan) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            }
            if (!target.hasPX('width')) {
                target.mergeGravity('layout_gravity', 'fill_horizontal');
            }
            if (alignContent === 'normal' && !parent.hasPX('height') && (!row.unit[rowStart] || row.unit[rowStart] === 'auto') && node.bounds.height > (<BoxRectDimension> node.data(CSS_GRID, 'boundsData') || node.bounds).height && checkRowSpan()) {
                target.css('minHeight', formatPX(node.actualHeight), true);
            }
            else if (!target.hasPX('height') && !target.hasPX('maxHeight') && !(row.length === 1 && alignContent === 'space-between')) {
                if (!REGEX_ALIGNSELF.test(mainData.alignItems)) {
                    target.mergeGravity('layout_gravity', 'fill_vertical');
                }
                if (alignContent === 'normal' && parent.hasHeight && mainData.rowSpanMultiple.length === 0) {
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
        const mainData: CssGridData<T> = node.data(CSS_GRID, 'mainData');
        if (mainData) {
            const { alignContent, justifyContent } = mainData;
            const outerWrapper = node.renderParent === node.outerWrapper;
            if (CssGrid.isJustified(node)) {
                setContentSpacing(node, mainData, justifyContent, true, 'width', outerWrapper, BOX_STANDARD.MARGIN_LEFT, BOX_STANDARD.MARGIN_RIGHT);
                if (mainData.column.length === 1) {
                    node.setLayoutWidth('match_parent');
                }
            }
            else if (outerWrapper) {
                if (node.contentBoxWidth > 0 && node.hasPX('width', false)) {
                    node.anchorParent(STRING_ANDROID.HORIZONTAL, 'packed', 0.5, true);
                }
                else if (mainData.column.length === 1) {
                    node.setLayoutWidth('match_parent');
                }
                else {
                    node.setLayoutWidth('wrap_content', false);
                }
            }
            if (CssGrid.isAligned(node)) {
                setContentSpacing(node, mainData, alignContent, false, 'height', outerWrapper, BOX_STANDARD.MARGIN_TOP, BOX_STANDARD.MARGIN_BOTTOM);
            }
            else if (outerWrapper) {
                if (node.contentBoxHeight > 0 && node.hasPX('height', false)) {
                    node.anchorParent(STRING_ANDROID.VERTICAL, 'packed', 0.5, true);
                }
                else {
                    node.setLayoutHeight('wrap_content', false);
                }
            }
        }
    }

    public postOptimize(node: T) {
        const mainData: CssGridData<T> = node.data(CSS_GRID, 'mainData');
        if (mainData) {
            const controller = <android.base.Controller<T>> this.controller;
            const { children, column, emptyRows, row, rowDirection, rowData } = mainData;
            const { flexible, gap, unit } = rowDirection ? column : row;
            const unitSpan = unit.length;
            const insertId = children[children.length - 1].id;
            {
                let k = -1;
                let l = 0;
                function createSpacer(i: number, horizontal: boolean, unitData: string[], gapSize: number, opposing = 'wrap_content', opposingWeight = '') {
                    let width = '';
                    let height = '';
                    if (k !== -1) {
                        const section = unitData.slice(k, k + l);
                        let layout_columnWeight = '';
                        let layout_rowWeight = '';
                        let rowSpan = 1;
                        let columnSpan = 1;
                        let layout_row: string;
                        let layout_column: string;
                        if (horizontal) {
                            layout_row = i.toString();
                            layout_column = k.toString();
                            height = opposing;
                            layout_columnWeight = flexible ? '0.01' : '';
                            layout_rowWeight = opposingWeight;
                            columnSpan = l;
                        }
                        else {
                            layout_row = k.toString();
                            layout_column = i.toString();
                            layout_rowWeight = flexible ? '0.01' : '';
                            layout_columnWeight = opposingWeight;
                            width = opposing;
                            rowSpan = l;
                        }
                        if (section.length === unitData.length) {
                            if (horizontal) {
                                width = 'match_parent';
                            }
                            else {
                                height = 'match_parent';
                            }
                            gapSize = 0;
                        }
                        else {
                            const [widthA, heightA, columnWeightA, rowWeightA] = getCellDimensions(node, horizontal, section, gapSize * (section.length - 1));
                            if (widthA) {
                                width = widthA;
                            }
                            if (heightA) {
                                height = heightA;
                            }
                            if (columnWeightA) {
                                layout_columnWeight = columnWeightA;
                            }
                            if (rowWeightA) {
                                layout_rowWeight = rowWeightA;
                            }
                        }
                        controller.addAfterOutsideTemplate(
                            insertId,
                            controller.renderSpace({
                                width,
                                height,
                                rowSpan,
                                columnSpan,
                                android: {
                                    [horizontal ? node.localizeString(STRING_ANDROID.MARGIN_RIGHT) : 'bottom']: gapSize > 0 && (k + l) < unitData.length ? '@dimen/' + Resource.insertStoredAsset('dimens', `${node.controlId}_cssgrid_${horizontal ? 'column' : 'row'}_gap`, formatPX(gapSize)) : '',
                                    layout_row,
                                    layout_column,
                                    layout_rowWeight,
                                    layout_columnWeight,
                                    layout_gravity: 'fill'
                                }
                            }),
                            CSS.PX.test(width) || CSS.PX.test(height)
                        );
                        k = -1;
                    }
                    l = 0;
                    return [width, height];
                }
                let length = Math.max(rowData.length, 1);
                for (let i = 0; i < length; i++) {
                    if (emptyRows[i] === undefined) {
                        const data = rowData[i];
                        for (let j = 0; j < unitSpan; j++) {
                            if (data[j] === undefined) {
                                if (k === -1) {
                                    k = j;
                                }
                                l++;
                            }
                            else {
                                createSpacer(i, rowDirection, unit, gap);
                            }
                        }
                    }
                }
                createSpacer(length - 1, rowDirection, unit, gap);
                length = emptyRows.length;
                for (let i = 0; i < length; i++) {
                    const emptyRow = emptyRows[i];
                    if (emptyRow) {
                        const lengthA = emptyRow.length;
                        for (let j = 0; j < lengthA; j++) {
                            const value = emptyRow[j];
                            if (value > 0) {
                                k = j;
                                const { unit: unitA, gap: gapA } = rowDirection ? row : column;
                                l = value === Number.POSITIVE_INFINITY ? unitA.length : 1;
                                const dimensions = getCellDimensions(node, !rowDirection, [unitA[j]], gapA * (l - 1));
                                createSpacer(i, rowDirection, unitA, gapA, dimensions[rowDirection ? 1 : 0], dimensions[rowDirection ? 3 : 2]);
                                break;
                            }
                        }
                    }
                }
            }
            if (unit.every(value => isPercent(value))) {
                const percent = unit.reduce((a, b) => a + parseFloat(b), 0) + (gap * (unitSpan + 1) * 100) / (rowDirection ? node.actualWidth : node.actualHeight);
                if (percent < 100) {
                    if (rowDirection) {
                        controller.addAfterOutsideTemplate(
                            insertId,
                            controller.renderSpace({
                                width: formatPercent((100 - percent) / 100),
                                height: 'match_parent',
                                rowSpan: row.length,
                                android: {
                                    layout_row: '0',
                                    layout_column: unitSpan.toString(),
                                    layout_columnWeight: flexible ? '0.01' : ''
                                }
                            }),
                            false
                        );
                        node.android('columnCount', (unitSpan + 1).toString());
                    }
                    else {
                        controller.addAfterOutsideTemplate(
                            insertId,
                            controller.renderSpace({
                                width: 'match_parent',
                                height: formatPercent((100 - percent) / 100),
                                columnSpan: column.length,
                                android: {
                                    layout_row: unitSpan.toString(),
                                    layout_column: '0',
                                    layout_rowWeight: flexible ? '0.01' : ''
                                }
                            }),
                            false
                        );
                        node.android('rowCount', (unitSpan + 1).toString());
                    }
                }
            }
            if (!column.fixedWidth) {
                if (flexible) {
                    for (const parent of node.ascend({ attr: 'renderParent' }) as T[]) {
                        if (parseFloat(parent.android('width')) > 0) {
                            break;
                        }
                        else if (parseFloat(parent.android('minWidth')) > 0) {
                            break;
                        }
                        else if (parseFloat(parent.android('layout_columnWeight')) > 0) {
                            node.setLayoutWidth('wrap_content');
                            node.each((item: T) => {
                                if (item.flexibleWidth) {
                                    item.delete('android', 'layout_columnWeight');
                                    item.setLayoutWidth('wrap_content');
                                }
                            });
                            const renderParent = node.renderParent as T;
                            if (renderParent.layoutConstraint || renderParent.layoutRelative) {
                                node.anchorParent(STRING_ANDROID.HORIZONTAL, 'packed', 0.5, true);
                            }
                            else {
                                node.mergeGravity('layout_gravity', STRING_ANDROID.CENTER_HORIZONTAL);
                            }
                            break;
                        }
                    }
                }
            }
            else if (node.blockStatic && node.width > 0 && !node.hasPX('minWidth') && !node.documentParent.layoutElement) {
                let minWidth = column.gap * (column.length - 1);
                for (const value of unit) {
                    if (CSS.PX.test(value)) {
                        minWidth += parseFloat(value);
                    }
                    else {
                        minWidth = 0;
                        break;
                    }
                }
                if (minWidth > node.width) {
                    node.android('minWidth', formatPX(minWidth));
                    if (!node.flexibleWidth && !node.blockWidth) {
                        node.setLayoutWidth('wrap_content');
                    }
                }
            }
        }
    }
}