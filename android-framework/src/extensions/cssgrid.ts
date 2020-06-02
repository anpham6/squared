import Resource from '../resource';

import { CONTAINER_ANDROID, STRING_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

type View = android.base.View;

const { formatPercent, formatPX, isLength, isPercent, isPx } = squared.lib.css;
const { maxArray, truncate } = squared.lib.math;
const { conditionArray, flatArray, isArray, isString } = squared.lib.util;

const { BOX_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE } = squared.base.lib.enumeration;

function getRowData(mainData: CssGridData<View>, horizontal: boolean) {
    const rowData = mainData.rowData;
    if (horizontal) {
        const length = mainData.column.length;
        const q = mainData.row.length;
        const result: Undef<View[]>[][] = new Array(length);
        let i = 0, j: number;
        while (i < length) {
            const data = new Array(q);
            j = 0;
            while (j < q) {
                data[j] = rowData[j++][i];
            }
            result[i++] = data;
        }
        return result;
    }
    return rowData;
}

function getGridSize(node: View, mainData: CssGridData<View>, horizontal: boolean, maxScreenWidth: number, maxScreenHeight: number) {
    const data = horizontal ? mainData.column : mainData.row;
    const unit = data.unit;
    const length = unit.length;
    let value = 0;
    if (length) {
        const dimension = horizontal ? 'width' : 'height';
        for (let i = 0; i < length; ++i) {
            const unitPX = unit[i];
            if (isPx(unitPX)) {
                value += parseFloat(unitPX);
            }
            else {
                let size = 0;
                conditionArray(
                    mainData.rowData[i] as View[][],
                    item => isArray(item),
                    item => size = Math.min(size, ...item.map(child => child.bounds[dimension]))
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
        return (maxScreenWidth > value ? Math.min(maxScreenWidth, node.actualWidth) : node.actualWidth) - value;
    }
    else {
        value += node.contentBox ? node.borderTopWidth + node.borderBottomWidth : node.contentBoxHeight;
        return (maxScreenHeight > value && node.documentBody ? Math.min(maxScreenHeight, node.actualHeight) : node.actualHeight) - value;
    }
}

function getMarginSize(value: number, gridSize: number) {
    const size = Math.floor(gridSize / value);
    return [size, gridSize - (size * value)];
}

function setContentSpacing(node: View, mainData: CssGridData<View>, alignment: string, horizontal: boolean, dimension: string, wrapped: boolean, MARGIN_START: number, MARGIN_END: number, maxScreenWidth: number, maxScreenHeight: number) {
    const data = horizontal ? mainData.column : mainData.row;
    if (alignment.startsWith('space')) {
        const gridSize = getGridSize(node, mainData, horizontal, maxScreenWidth, maxScreenHeight);
        if (gridSize > 0) {
            const rowData = getRowData(mainData, horizontal);
            const itemCount = data.length;
            const adjusted = new Set<View>();
            switch (alignment) {
                case 'space-around': {
                    const [marginSize, marginExcess] = getMarginSize(itemCount * 2, gridSize);
                    for (let i = 0; i < itemCount; ++i) {
                        for (const item of new Set(flatArray<View>(rowData[i], Infinity))) {
                            const marginStart = (i > 0 && i <= marginExcess ? 1 : 0) + marginSize;
                            if (!adjusted.has(item)) {
                                item.modifyBox(MARGIN_START, marginStart);
                                item.modifyBox(MARGIN_END, marginSize);
                                adjusted.add(item);
                            }
                            else {
                                item.cssPX(dimension, gridSize / itemCount, true);
                            }
                        }
                    }
                    break;
                }
                case 'space-between':
                    if (itemCount > 1) {
                        const [marginSize, marginExcess] = getMarginSize(itemCount - 1, gridSize);
                        for (let i = 0; i < itemCount; ++i) {
                            for (const item of new Set(flatArray<View>(rowData[i], Infinity))) {
                                if (i < itemCount - 1) {
                                    const marginEnd = marginSize + (i < marginExcess ? 1 : 0);
                                    if (!adjusted.has(item)) {
                                        item.modifyBox(MARGIN_END, marginEnd);
                                        adjusted.add(item);
                                    }
                                    else {
                                        item.cssPX(dimension, marginEnd, true);
                                    }
                                }
                                else {
                                    const unitSpan = parseInt(item.android(horizontal ? 'layout_columnSpan' : 'layout_rowSpan'));
                                    if (unitSpan > 1) {
                                        const marginEnd = marginSize + (marginExcess > 0 ? Math.max(marginExcess - 1, 1) : 0);
                                        item.cssPX(dimension, marginEnd, true);
                                        if (adjusted.has(item)) {
                                            item.modifyBox(MARGIN_END, -marginEnd, false);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else {
                        return;
                    }
                    break;
                case 'space-evenly': {
                    const [marginSize, marginExcess] = getMarginSize(itemCount + 1, gridSize);
                    for (let i = 0; i < itemCount; ++i) {
                        for (const item of new Set(flatArray<View>(rowData[i], Infinity))) {
                            let marginEnd = marginSize + (i < marginExcess ? 1 : 0);
                            if (!adjusted.has(item)) {
                                if (wrapped) {
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
                                item.cssPX(dimension, marginEnd, true);
                            }
                        }
                    }
                    break;
                }
            }
        }
    }
    else if (!wrapped) {
        let gridSize = getGridSize(node, mainData, horizontal, maxScreenWidth, maxScreenHeight);
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

function getCellDimensions(node: View, horizontal: boolean, section: string[], insideGap: number): Undef<string>[] {
    let width: Undef<string>;
    let height: Undef<string>;
    let columnWeight: Undef<string>;
    let rowWeight: Undef<string>;
    if (section.every(value => isPx(value))) {
        const px = section.reduce((a, b) => a + parseFloat(b), insideGap);
        const dimension = formatPX(px);
        if (horizontal) {
            width = dimension;
        }
        else {
            height = dimension;
        }
    }
    else if (section.every(value => CssGrid.isFr(value))) {
        const fr = section.reduce((a, b) => a + parseFloat(b), 0);
        const weight = truncate(fr, node.localSettings.floatPrecision);
        if (horizontal) {
            width = '0px';
            columnWeight = weight;
        }
        else {
            height = '0px';
            rowWeight = weight;
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
    else if (horizontal) {
        width = 'wrap_content';
    }
    else {
        height = 'wrap_content';
    }
    return [width, height, columnWeight, rowWeight];
}

function checkRowSpan(node: View, rowSpan: number, rowStart: number, mainData: CssGridData<View>, dataName: string) {
    if (rowSpan === 1 && mainData.rowSpanMultiple[rowStart]) {
        const rowData = mainData.rowData;
        for (const item of flatArray<View>(rowData[rowStart], Infinity)) {
            if (item !== node) {
                const data: CssGridCellData = item.data(dataName, 'cellData');
                if (data && data.rowSpan > rowSpan && (rowStart === 0 || data.rowSpan < rowData.length)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function checkAutoDimension(data: CssGridDirectionData, horizontal: boolean) {
    const unit = data.unit;
    const length = unit.length;
    if (length && unit.every(value => value === 'auto')) {
        data.unit = new Array(length).fill(horizontal ? '1fr' : '');
    }
}

function isFlexibleParent(node: View, dataName: string) {
    const parent = node.actualParent;
    if (parent?.gridElement) {
        const mainData: CssGridData<View> = parent.data(dataName, 'mainData');
        const cellData: CssGridCellData = node.data(dataName, 'cellData');
        if (mainData && cellData) {
            const unit = mainData.column.unit;
            const { columnStart, columnSpan } = cellData;
            let valid = false;
            let i = 0;
            while (i < columnSpan) {
                const value = unit[columnStart + i++];
                if (CssGrid.isFr(value) || isPercent(value)) {
                    valid = true;
                }
                else if (value === 'auto') {
                    valid = false;
                    break;
                }
            }
            return valid;
        }
    }
    else if (node.hasFlex('row') && node.flexbox.grow > 0) {
        return true;
    }
    return false;
}

function requireDirectionSpacer(data: CssGridDirectionData, dimension: number) {
    const unit = data.unit;
    let size = 0;
    let percent = 0;
    for (let i = 0; i < unit.length; ++i) {
        const value = unit[i];
        if (isPx(value)) {
            size += parseFloat(value);
        }
        else if (isPercent(value)) {
            percent += parseFloat(value);
        }
        else if (CssGrid.isFr(value)) {
            return 0;
        }
    }
    const content = Math.ceil(size + (data.length - 1) * data.gap);
    if (percent > 0) {
        return (percent + (content / dimension * 100));
    }
    else if (size > 0) {
        return content < dimension ? -1 : 0;
    }
    return 0;
}

const getLayoutDimension = (value: string) => value === 'space-between' ? 'match_parent' : 'wrap_content';
const hasAlignment = (value: string) => /start|end|center|baseline/.test(value);

export default class CssGrid<T extends View> extends squared.base.extensions.CssGrid<T> {
    public processNode(node: T, parent: T) {
        let container: Undef<T>;
        let renderAs: Undef<T>;
        let outputAs: Undef<NodeTemplate<T>>;
        if (CssGrid.isJustified(node) || CssGrid.isAligned(node)) {
            container = (this.controller as android.base.Controller<T>).createNodeWrapper(node, parent, { containerType: CONTAINER_NODE.CONSTRAINT, resource: NODE_RESOURCE.ASSET });
            container.inherit(node, 'styleMap', 'boxStyle');
            node.resetBox(BOX_STANDARD.MARGIN, container);
            node.resetBox(BOX_STANDARD.PADDING, container);
            node.data(this.name, 'unsetContentBox', true);
            if (CssGrid.isJustified(node)) {
                node.setLayoutWidth(getLayoutDimension(node.css('justifyContent')));
            }
            else if (node.hasPX('width', { percent: false })) {
                node.setLayoutWidth('match_parent');
            }
            else {
                container.setLayoutWidth(node.blockStatic ? 'match_parent' : 'wrap_content');
            }
            if (CssGrid.isAligned(node)) {
                node.setLayoutHeight(getLayoutDimension(node.css('alignContent')));
            }
            else if (node.hasPX('height', { percent: false })) {
                node.setLayoutHeight('match_parent');
            }
            else {
                container.setLayoutHeight('wrap_content');
            }
            renderAs = container;
            outputAs = this.application.renderNode(
                new LayoutUI(
                    parent,
                    container,
                    CONTAINER_NODE.CONSTRAINT,
                    NODE_ALIGNMENT.SINGLE,
                    container.children as T[]
                )
            );
        }
        super.processNode(node, parent);
        const mainData: CssGridData<T> = node.data(this.name, 'mainData');
        if (mainData) {
            const { column, row } = mainData;
            const unit = column.unit;
            const columnCount = column.length;
            const layout = LayoutUI.create({
                parent: container || parent,
                node,
                containerType: CONTAINER_NODE.GRID,
                alignmentType: NODE_ALIGNMENT.AUTO_LAYOUT,
                children: node.children as T[],
                rowCount: row.length,
                columnCount
            });
            if (!node.rootElement && !node.hasWidth && mainData.rowSpanMultiple.length === 0 && unit.length === columnCount && unit.every(value => CssGrid.isFr(value)) && node.ascend({ condition: (item: T) => isFlexibleParent(item, this.name), error: item => item.hasWidth }).length > 0) {
                const rowData = mainData.rowData;
                const rowCount = rowData.length;
                const constraintData: T[][] = new Array(rowCount);
                let valid = true;
                invalid: {
                    let i = 0, j: number;
                    while (i < rowCount) {
                        const nodes: T[] = [];
                        const data = rowData[i];
                        const length = data.length;
                        j = 0;
                        while (j < length) {
                            const cell = data[j++];
                            if (cell?.length === 1) {
                                nodes.push(cell[0]);
                            }
                            else {
                                valid = false;
                                break invalid;
                            }
                        }
                        constraintData[i++] = nodes;
                    }
                }
                if (valid) {
                    column.frTotal = unit.reduce((a, b) => a + parseFloat(b), 0);
                    row.frTotal = row.unit.reduce((a, b) => a + (CssGrid.isFr(b) ? parseFloat(b) : 0), 0);
                    node.setLayoutWidth('match_parent');
                    node.lockAttr('android', 'layout_width');
                    node.data(this.name, 'constraintData', constraintData);
                    layout.setContainerType(CONTAINER_NODE.CONSTRAINT);
                }
            }
            if (layout.containerType === CONTAINER_NODE.GRID) {
                checkAutoDimension(column, true);
                checkAutoDimension(row, false);
            }
            return {
                parent: container,
                renderAs,
                outputAs,
                outerParent: container,
                output: this.application.renderNode(layout),
                include: true,
                complete: true
            };
        }
        return undefined;
    }

    public processChild(node: T, parent: T) {
        const mainData: CssGridData<T> = parent.data(this.name, 'mainData');
        const cellData: CssGridCellData = node.data(this.name, 'cellData');
        let renderAs: Undef<T>;
        let outputAs: Undef<NodeXmlTemplate<T>>;
        if (mainData && cellData) {
            const { column, row } = mainData;
            const alignSelf = node.has('alignSelf') ? node.css('alignSelf') : mainData.alignItems;
            const justifySelf = node.has('justifySelf') ? node.css('justifySelf') : mainData.justifyItems;
            const layoutConstraint = parent.layoutConstraint;
            const applyLayout = (item: T, horizontal: boolean, dimension: string) => {
                const [data, cellStart, cellSpan, minDimension] =
                    horizontal
                        ? [column, cellData.columnStart, cellData.columnSpan, 'minWidth']
                        : [row, cellData.rowStart, cellData.rowSpan, 'minHeight'];
                const { unit, unitMin } = data;
                let size = 0;
                let minSize = 0;
                let minUnitSize = 0;
                let sizeWeight = 0;
                let fitContent = false;
                let autoSize = false;
                let i = 0, j = 0;
                while (i < cellSpan) {
                    const k = cellStart + i++;
                    const min = unitMin[k];
                    if (min !== '') {
                        minUnitSize += horizontal ? parent.parseUnit(min) : parent.parseUnit(min, { dimension: 'height' });
                    }
                    let value = unit[k];
                    if (!isString(value)) {
                        const auto = data.auto;
                        if (auto[j]) {
                            value = auto[j];
                            if (auto[j + 1]) {
                                ++j;
                            }
                        }
                        else {
                            continue;
                        }
                    }
                    if (value === 'auto' || value === 'max-content') {
                        autoSize = true;
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
                    else if (CssGrid.isFr(value)) {
                        if (horizontal || parent.hasHeight) {
                            if (sizeWeight === -1) {
                                sizeWeight = 0;
                            }
                            sizeWeight += parseFloat(value);
                            minSize = size;
                        }
                        else {
                            sizeWeight = 0;
                            minSize += mainData.minCellHeight * parseFloat(value);
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
                        const cellSize = horizontal ? item.parseUnit(value) : item.parseUnit(value, { dimension:  'height' });
                        if (minSize === 0) {
                            size += cellSize;
                        }
                        else {
                            minSize += cellSize;
                        }
                    }
                    if (node.textElement && /^\s*0[a-z]*\s*$/.test(min)) {
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
                if (minSize > 0 && !item.hasPX(minDimension)) {
                    item.css(minDimension, formatPX(minSize), true);
                }
                if (layoutConstraint) {
                    if (horizontal) {
                        if (!item.hasPX('width', { percent: false })) {
                            item.app('layout_constraintWidth_percent', truncate(sizeWeight / column.frTotal, item.localSettings.floatPrecision));
                            item.setLayoutWidth('0px');
                        }
                        if (cellStart === 0) {
                            item.anchor('left', 'parent');
                            item.anchorStyle('horizontal', 0, 'spread');
                        }
                        else {
                            const previousSibling = item.innerMostWrapped.previousSibling as Null<T>;
                            if (previousSibling) {
                                previousSibling.anchor('rightLeft', item.documentId);
                                item.anchor('leftRight', previousSibling.anchorTarget.documentId);
                            }
                        }
                        if (cellStart + cellSpan === column.length) {
                            item.anchor('right', 'parent');
                        }
                        item.positioned = true;
                    }
                    else if (!item.hasPX('height', { percent: false })) {
                        if (sizeWeight > 0) {
                            if (row.length === 1) {
                                item.setLayoutHeight('match_parent');
                            }
                            else {
                                item.app('layout_constraintHeight_percent', truncate(sizeWeight / row.frTotal, item.localSettings.floatPrecision));
                                item.setLayoutHeight('0px');
                            }
                        }
                        else if (size > 0) {
                            if (item.contentBox) {
                                size -= item.contentBoxHeight;
                            }
                            item.css(autoSize ? 'minHeight' : 'height', formatPX(size), true);
                        }
                    }
                }
                else {
                    item.android(horizontal ? 'layout_column' : 'layout_row', cellStart.toString());
                    item.android(horizontal ? 'layout_columnSpan' : 'layout_rowSpan', cellSpan.toString());
                    let columnWeight = horizontal && column.flexible;
                    if (sizeWeight !== 0) {
                        if (!item.hasPX(dimension)) {
                            if (horizontal) {
                                if (cellData.columnSpan === column.length) {
                                    item.setLayoutWidth('match_parent');
                                }
                                else {
                                    item.setLayoutWidth('0px');
                                    item.android('layout_columnWeight', sizeWeight === -1 ? '0.01' : truncate(sizeWeight, node.localSettings.floatPrecision));
                                    item.mergeGravity('layout_gravity', 'fill_horizontal');
                                }
                                columnWeight = false;
                            }
                            else if (cellData.rowSpan === row.length) {
                                item.setLayoutHeight('match_parent');
                            }
                            else {
                                item.setLayoutHeight('0px');
                                item.android('layout_rowWeight', truncate(sizeWeight, node.localSettings.floatPrecision));
                                item.mergeGravity('layout_gravity', 'fill_vertical');
                            }
                        }
                    }
                    else if (size > 0) {
                        const maxDimension = horizontal ? 'maxWidth' : 'maxHeight';
                        if (fitContent && !item.hasPX(maxDimension)) {
                            item.css(maxDimension, formatPX(size), true);
                            item.mergeGravity('layout_gravity', horizontal ? 'fill_horizontal' : 'fill_vertical');
                        }
                        else if (!item.hasPX(dimension)) {
                            if (item.contentBox) {
                                size -= horizontal ? item.contentBoxWidth : item.contentBoxHeight;
                            }
                            if (autoSize && !parent.hasPX(maxDimension)) {
                                item.css(minDimension, formatPX(size), true);
                                if (horizontal) {
                                    item.setLayoutWidth('wrap_content');
                                }
                                else {
                                    item.setLayoutHeight('wrap_content');
                                }
                            }
                            else {
                                item.css(dimension, formatPX(size), true);
                            }
                        }
                    }
                    else if (unit.length === 0 && !item.hasPX(dimension)) {
                        if (horizontal) {
                            item.setLayoutWidth('match_parent', false);
                        }
                        else {
                            item.setLayoutHeight('wrap_content', false);
                        }
                    }
                    if (columnWeight) {
                        item.android('layout_columnWeight', '0');
                    }
                }
                return [cellStart, cellSpan];
            };
            if (hasAlignment(alignSelf) || /start|center|end|baseline|right|left/.test(justifySelf) || layoutConstraint) {
                renderAs = this.application.createNode({ parent, innerWrap: node });
                renderAs.containerName = node.containerName;
                renderAs.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                renderAs.inherit(node, 'base', 'initial');
                renderAs.exclude({ resource: NODE_RESOURCE.BOX_STYLE | NODE_RESOURCE.ASSET, procedure: NODE_PROCEDURE.CUSTOMIZATION });
                renderAs.resetBox(BOX_STANDARD.MARGIN);
                renderAs.resetBox(BOX_STANDARD.PADDING);
                renderAs.render(parent);
                node.transferBox(BOX_STANDARD.MARGIN, renderAs);
                let inlineWidth = true;
                switch (justifySelf) {
                    case 'first baseline':
                    case 'baseline':
                    case 'left':
                    case 'start':
                    case 'flex-start':
                    case 'self-start':
                        node.mergeGravity('layout_gravity', 'left');
                        break;
                    case 'last baseline':
                    case 'right':
                    case 'end':
                    case 'flex-end':
                    case 'self-end':
                        node.mergeGravity('layout_gravity', 'right');
                        break;
                    case 'center':
                        node.mergeGravity('layout_gravity', 'center_horizontal');
                        break;
                    default:
                        inlineWidth = false;
                        break;
                }
                if (!node.hasWidth) {
                    node.setLayoutWidth(inlineWidth ? 'wrap_content' : 'match_parent', false);
                }
                switch (alignSelf) {
                    case 'first baseline':
                    case 'baseline':
                    case 'start':
                    case 'flex-start':
                    case 'self-start':
                        node.mergeGravity('layout_gravity', 'top');
                        break;
                    case 'last baseline':
                    case 'end':
                    case 'flex-end':
                    case 'self-end':
                        node.mergeGravity('layout_gravity', 'bottom');
                        break;
                    case 'center':
                        node.mergeGravity('layout_gravity', 'center_vertical');
                        break;
                    default:
                        if (!node.hasHeight) {
                            node.setLayoutHeight('match_parent', false);
                        }
                        break;
                }
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
            if (target !== node || node.hasPX('maxHeight')) {
                target.mergeGravity('layout_gravity', 'fill');
            }
            else if (!target.hasPX('width')) {
                target.mergeGravity('layout_gravity', 'fill_horizontal');
            }
            const [rowStart, rowSpan] = applyLayout(target, false, 'height');
            if (mainData.alignContent === 'normal' && !parent.hasPX('height') && !node.hasPX('minHeight') && (!row.unit[rowStart] || row.unit[rowStart] === 'auto') && Math.floor(node.bounds.height) > (node.data(this.name, 'boundsData') as BoxRectDimension)?.height && checkRowSpan(node, rowSpan, rowStart, mainData, this.name)) {
                target.css('minHeight', formatPX(node.box.height));
            }
            else if (!target.hasPX('height') && !target.hasPX('maxHeight') && !(row.length === 1 && mainData.alignContent.startsWith('space') && !hasAlignment(mainData.alignItems))) {
                target.mergeGravity('layout_gravity', 'fill_vertical');
            }
        }
        return {
            parent: renderAs,
            renderAs, outputAs
        };
    }

    public postBaseLayout(node: T) {
        const mainData: CssGridData<T> = node.data(this.name, 'mainData');
        if (mainData) {
            const controller = this.controller as android.base.Controller<T>;
            const { children, column, row, rowData } = mainData;
            const wrapped = node.data(this.name, 'unsetContentBox') === true;
            const insertId = children[children.length - 1].id;
            if (CssGrid.isJustified(node)) {
                setContentSpacing(node, mainData, mainData.justifyContent, true, 'width', wrapped, BOX_STANDARD.MARGIN_LEFT, BOX_STANDARD.MARGIN_RIGHT, controller.userSettings.resolutionScreenWidth - node.bounds.left, 0);
                switch (mainData.justifyContent) {
                    case 'center':
                    case 'space-around':
                    case 'space-evenly':
                        if (wrapped) {
                            node.anchorParent('horizontal', 0.5, '', true);
                        }
                        break;
                    case 'right':
                    case 'end':
                    case 'flex-end':
                        if (wrapped) {
                            node.anchorParent('horizontal', 1, '', true);
                        }
                        break;
                    default:
                        if (mainData.column.length === 1) {
                            node.setLayoutWidth('match_parent');
                        }
                        break;
                }
                if (wrapped) {
                    if (column.unit.some(value => CssGrid.isFr(value))) {
                        node.setLayoutWidth('match_parent');
                    }
                }
            }
            else {
                const length = column.length;
                if (node.blockStatic || node.hasWidth) {
                    const percent = requireDirectionSpacer(column, node.actualWidth);
                    if (percent !== 0 && percent < 100) {
                        if (percent > 0) {
                            controller.addAfterOutsideTemplate(
                                insertId,
                                controller.renderSpace({
                                    width: formatPercent((100 - percent) / 100),
                                    height: 'match_parent',
                                    rowSpan: row.length,
                                    android: {
                                        layout_row: '0',
                                        layout_column: length.toString(),
                                        layout_columnWeight: column.flexible ? '0.01' : ''
                                    }
                                }),
                                false
                            );
                        }
                        node.android('columnCount', (length + 1).toString());
                    }
                }
                if (wrapped) {
                    if (node.contentBoxWidth > 0 && node.hasPX('width', { percent: false })) {
                        node.anchorParent('horizontal', 0.5, '', true);
                    }
                    else if (length === 1) {
                        node.setLayoutWidth('match_parent');
                    }
                    else {
                        node.setLayoutWidth('wrap_content', false);
                    }
                }
            }
            if (CssGrid.isAligned(node)) {
                setContentSpacing(node, mainData, mainData.alignContent, false, 'height', wrapped, BOX_STANDARD.MARGIN_TOP, BOX_STANDARD.MARGIN_BOTTOM, 0, (this.controller as android.base.Controller<T>).userSettings.resolutionScreenHeight);
                if (wrapped) {
                    switch (mainData.alignContent) {
                        case 'center':
                        case 'space-around':
                        case 'space-evenly':
                            node.anchorParent('vertical', 0.5, '', true);
                            break;
                        case 'end':
                        case 'flex-end':
                            node.anchorParent('vertical', 1, '', true);
                            break;
                    }
                }
            }
            else {
                if (node.hasHeight) {
                    const percent = requireDirectionSpacer(row, node.actualHeight);
                    if (percent !== 0 && percent < 100) {
                        if (percent > 0) {
                            controller.addAfterOutsideTemplate(
                                insertId,
                                controller.renderSpace({
                                    width: 'match_parent',
                                    height: formatPercent((100 - percent) / 100),
                                    columnSpan: column.length,
                                    android: {
                                        layout_row: row.length.toString(),
                                        layout_column: '0',
                                        layout_rowWeight: row.flexible ? '0.01' : ''
                                    }
                                }),
                                false
                            );
                        }
                        node.android('rowCount', (row.length + 1).toString());
                    }
                }
                if (wrapped) {
                    if (node.contentBoxHeight > 0 && node.hasPX('height', { percent: false })) {
                        node.anchorParent('vertical', 0.5, '', true);
                    }
                    else {
                        node.setLayoutHeight('wrap_content', false);
                    }
                }
            }
            const constraintData: T[][] = node.data(this.name, 'constraintData');
            if (constraintData) {
                const { gap, length } = column;
                const rowCount = constraintData.length;
                const barrierIds: string[] = new Array(rowCount - 1);
                let i = 1, j = 0;
                while (i < rowCount) {
                    barrierIds[j++] = controller.addBarrier(constraintData[i++], 'top');
                }
                for (i = 0; i < rowCount; ++i) {
                    const nodes = constraintData[i];
                    const previousBarrierId = barrierIds[i - 1];
                    const barrierId = barrierIds[i];
                    let previousItem: Undef<T>;
                    for (j = 0; j < length; ++j) {
                        const item = nodes[j];
                        if (item) {
                            if (i === 0) {
                                item.anchor('top', 'parent');
                                item.anchor('bottomTop', barrierId);
                                item.anchorStyle('vertical', 0, 'packed');
                            }
                            else {
                                if (i === rowCount - 1) {
                                    item.anchor('bottom', 'parent');
                                }
                                else {
                                    item.anchor('bottomTop', barrierId);
                                }
                                item.anchor('topBottom', previousBarrierId);
                            }
                            if (j === length - 1) {
                                item.anchor('right', 'parent');
                            }
                            else {
                                item.modifyBox(BOX_STANDARD.MARGIN_RIGHT, -gap);
                            }
                            if (previousItem) {
                                previousItem.anchor('rightLeft', item.documentId);
                                item.anchor('leftRight', previousItem.documentId);
                            }
                            else {
                                item.anchor('left', 'parent');
                                item.anchorStyle('horizontal', 0, 'packed');
                            }
                            item.anchored = true;
                            item.positioned = true;
                            previousItem = item;
                        }
                        else if (previousItem) {
                            const options = {
                                width: '0px',
                                height: 'wrap_content',
                                android: {},
                                app: {
                                    layout_constraintTop_toTopOf: i === 0 ? 'parent' : '',
                                    layout_constraintTop_toBottomOf: previousBarrierId,
                                    layout_constraintBottom_toTopOf: i < length - 1 ? barrierId : '',
                                    layout_constraintBottom_toBottomOf: i === length - 1 ? 'parent' : '',
                                    layout_constraintStart_toEndOf: previousItem.anchorTarget.documentId,
                                    layout_constraintEnd_toEndOf: 'parent',
                                    layout_constraintVertical_bias: i === 0 ? '0' : '',
                                    layout_constraintVertical_chainStyle: i === 0 ? 'packed' : '',
                                    layout_constraintWidth_percent: (column.unit.slice(j, length).reduce((a, b) => a + parseFloat(b), 0) / column.frTotal).toString()
                                }
                            } as RenderSpaceAttribute;
                            controller.addAfterInsideTemplate(node.id, controller.renderSpace(options), false);
                            previousItem.anchor('rightLeft', options.documentId);
                            break;
                        }
                    }
                }
            }
            else {
                const { emptyRows, rowDirection: horizontal } = mainData;
                const { flexible, gap, unit } = horizontal ? column : row;
                const unitSpan = unit.length;
                let k = -1;
                let l = 0;
                const createSpacer = (i: number, unitData: string[], gapSize: number, opposing = 'wrap_content', opposingWeight = '', opposingMargin = 0) => {
                    if (k !== -1) {
                        const section = unitData.slice(k, k + l);
                        let width = '';
                        let height = '';
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
                                layout_columnWeight = '';
                            }
                            else {
                                height = 'match_parent';
                                layout_rowWeight = '';
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
                                    [horizontal ? node.localizeString(STRING_ANDROID.MARGIN_RIGHT) : 'bottom']:
                                        gapSize > 0 && (k + l) < unitData.length
                                            ? '@dimen/' + Resource.insertStoredAsset('dimens', `${node.controlId}_cssgrid_${horizontal ? 'column' : 'row'}_gap`, formatPX(gapSize))
                                            : '',
                                    [horizontal ? 'bottom' : node.localizeString(STRING_ANDROID.MARGIN_RIGHT)]:
                                        opposingMargin > 0
                                            ? '@dimen/' + Resource.insertStoredAsset('dimens', `${node.controlId}_cssgrid_${horizontal ? 'row' : 'column'}_gap`, formatPX(opposingMargin))
                                            : '',
                                    layout_row,
                                    layout_column,
                                    layout_rowWeight,
                                    layout_columnWeight,
                                    layout_gravity: 'fill'
                                }
                            }),
                            isPx(width) || isPx(height)
                        );
                        k = -1;
                    }
                    l = 0;
                };
                let length = Math.max(rowData.length, 1);
                for (let i = 0; i < length; ++i) {
                    if (emptyRows[i] === undefined) {
                        const data = rowData[i];
                        for (let j = 0; j < unitSpan; ++j) {
                            if (data[j]) {
                                createSpacer(i, unit, gap);
                            }
                            else {
                                if (k === -1) {
                                    k = j;
                                }
                                ++l;
                            }
                        }
                        createSpacer(i, unit, gap);
                    }
                }
                length = emptyRows.length;
                for (let i = 0; i < length; ++i) {
                    const emptyRow = emptyRows[i];
                    if (emptyRow) {
                        const q = emptyRow.length;
                        for (let j = 0; j < q; ++j) {
                            const value = emptyRow[j];
                            if (value > 0) {
                                k = j;
                                const { unit: unitOpposing, gap: gapOpposing } = horizontal ? row : column;
                                const dimensions = getCellDimensions(node, !horizontal, [unitOpposing[horizontal ? j : i]], 0);
                                l = value === Infinity ? unit.length : 1;
                                if (horizontal) {
                                    createSpacer(
                                        i,
                                        unitOpposing,
                                        gapOpposing,
                                        dimensions[1],
                                        dimensions[3],
                                        i < length - 1 ? gap : 0
                                    );
                                }
                                else {
                                    createSpacer(
                                        i,
                                        unitOpposing,
                                        gapOpposing,
                                        dimensions[0],
                                        dimensions[2],
                                        j < q - 1 ? gap : 0
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    public postOptimize(node: T) {
        const mainData: CssGridData<T> = node.data(this.name, 'mainData');
        if (mainData) {
            if (node.blockStatic && !node.hasPX('minWidth', { percent: false }) && node.actualParent?.layoutElement === false) {
                const { gap, length, unit } = mainData.column;
                let minWidth = gap * (length - 1);
                for (let i = 0; i < unit.length; ++i) {
                    const value = unit[i];
                    if (isPx(value)) {
                        minWidth += parseFloat(value);
                    }
                    else {
                        return;
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