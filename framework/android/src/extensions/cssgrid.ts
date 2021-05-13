import BOX_STANDARD = squared.base.lib.constant.BOX_STANDARD;
import NODE_ALIGNMENT = squared.base.lib.constant.NODE_ALIGNMENT;
import NODE_PROCEDURE = squared.base.lib.constant.NODE_PROCEDURE;
import NODE_RESOURCE = squared.base.lib.constant.NODE_RESOURCE;
import LAYOUT_CSSGRID = squared.lib.internal.LAYOUT_CSSGRID;
import CREATE_NODE = squared.base.lib.internal.CREATE_NODE;
import CONTAINER_NODE = android.lib.constant.CONTAINER_NODE;
import LAYOUT_STRING = internal.android.LAYOUT_STRING;

import { CONTAINER_TAGNAME } from '../lib/constant';

import type View from '../view';

import Resource from '../resource';

import LayoutUI = squared.base.LayoutUI;

interface ICssGridData<T> extends CssGridData<T> {
    unsetContentBox?: boolean;
    constraintData?: T[][];
}

const { asPercent, asPx, formatPercent, formatPX, isLength, isPercent, isPx } = squared.lib.css;
const { truncate } = squared.lib.math;
const { endsWith, lastItemOf, safeFloat, startsWith } = squared.lib.util;

const { flatArray } = squared.base.lib.util;

const CSS_ALIGNSELF = ['start', 'end', 'center', 'baseline'];
const CSS_JUSTIFYSELF = ['start', 'center', 'end', 'baseline', 'right', 'left'];

function getRowData(mainData: CssGridData<View>, horizontal: boolean) {
    const rowData = mainData.rowData;
    if (horizontal) {
        const length = mainData.column.length;
        const result: Undef<View[]>[][] = new Array(length);
        for (let i = 0, q = mainData.row.length; i < length; ++i) {
            const data = new Array(q);
            for (let j = 0; j < q; ++j) {
                data[j] = rowData[j][i];
            }
            result[i] = data;
        }
        return result;
    }
    return rowData;
}

function getRemainingSize(mainData: CssGridData<View>, data: CssGridDirectionData, node: View, dimension: DimensionAttr, maxScreenWidth: number, maxScreenHeight: number) {
    const unit = data.unit;
    const length = unit.length;
    let value = 0;
    if (length) {
        for (let i = 0; i < length; ++i) {
            const unitPX = asPx(unit[i]);
            if (!isNaN(unitPX)) {
                value += unitPX;
            }
            else {
                const rowData = mainData.rowData[i];
                let size = 0;
                for (let j = 0, q = rowData.length; j < q; ++j) {
                    const item = rowData[j];
                    if (item) {
                        size = Math.min(size, ...item.map(child => child.bounds[dimension]));
                    }
                }
                value += size;
            }
        }
    }
    else {
        value = Math.max(...data.unitTotal);
        if (value <= 0) {
            return 0;
        }
    }
    value += data.gap * (data.length - 1);
    if (dimension === 'width') {
        value += node.contentBox ? node.borderLeftWidth + node.borderRightWidth : node.contentBoxWidth;
        return (maxScreenWidth > value ? Math.min(maxScreenWidth, node.actualWidth) : node.actualWidth) - value;
    }
    value += node.contentBox ? node.borderTopWidth + node.borderBottomWidth : node.contentBoxHeight;
    return (maxScreenHeight > value && node.documentBody ? Math.min(maxScreenHeight, node.actualHeight) : node.actualHeight) - value;
}

function setCssPX(node: View, attr: CssStyleAttr, value: number) {
    const current = node.cssValue(attr);
    if (current) {
        const n = asPercent(current);
        if (!isNaN(n)) {
            node.css(attr, formatPercent(n + value / node.actualParent!.box.width), true);
        }
        else if (isLength(current)) {
            node.css(attr, formatPX(value + node.parseUnit(current)), true);
        }
    }
}

function getMarginSize(value: number, gridSize: number) {
    const size = Math.floor(gridSize / value);
    return [size, gridSize - (size * value)];
}

function setContentSpacing(mainData: ICssGridData<View>, data: CssGridDirectionData, node: View, horizontal: boolean, maxScreenWidth: number, maxScreenHeight: number) {
    let alignment: string,
        dimension: DimensionAttr,
        MARGIN_START: number,
        MARGIN_END: number;
    if (horizontal) {
        alignment = mainData.justifyContent;
        dimension = 'width';
        MARGIN_START = BOX_STANDARD.MARGIN_LEFT;
        MARGIN_END = BOX_STANDARD.MARGIN_RIGHT;
    }
    else {
        alignment = mainData.alignContent;
        dimension = 'height';
        MARGIN_START = BOX_STANDARD.MARGIN_TOP;
        MARGIN_END = BOX_STANDARD.MARGIN_BOTTOM;
    }
    if (startsWith(alignment, 'space')) {
        const offset = getRemainingSize(mainData, data, node, dimension, maxScreenWidth, maxScreenHeight);
        if (offset > 0) {
            const rowData = getRowData(mainData, horizontal);
            const itemCount = data.length;
            const adjusted = new WeakSet<View>();
            switch (alignment) {
                case 'space-around': {
                    const [marginSize, marginExcess] = getMarginSize(itemCount * 2, offset);
                    for (let i = 0; i < itemCount; ++i) {
                        for (const item of new Set(flatArray<View>(rowData[i], Infinity))) {
                            const marginStart = (i > 0 && i <= marginExcess ? 1 : 0) + marginSize;
                            if (adjusted.has(item)) {
                                setCssPX(item, dimension, offset / itemCount);
                            }
                            else {
                                item.modifyBox(MARGIN_START, marginStart);
                                item.modifyBox(MARGIN_END, marginSize);
                                adjusted.add(item);
                            }
                        }
                    }
                    break;
                }
                case 'space-between':
                    if (itemCount > 1) {
                        const [marginSize, marginExcess] = getMarginSize(itemCount - 1, offset);
                        for (let i = 0; i < itemCount; ++i) {
                            for (const item of new Set(flatArray<View>(rowData[i], Infinity))) {
                                if (i < itemCount - 1) {
                                    const marginEnd = marginSize + (i < marginExcess ? 1 : 0);
                                    if (adjusted.has(item)) {
                                        setCssPX(item, dimension, marginEnd);
                                    }
                                    else {
                                        item.modifyBox(MARGIN_END, marginEnd);
                                        adjusted.add(item);
                                    }
                                }
                                else {
                                    const unitSpan = +item.android(horizontal ? 'layout_columnSpan' : 'layout_rowSpan');
                                    if (unitSpan > 1) {
                                        const marginEnd = marginSize + (marginExcess > 0 ? Math.max(marginExcess - 1, 1) : 0);
                                        setCssPX(item, dimension, marginEnd);
                                        if (adjusted.has(item)) {
                                            item.modifyBox(MARGIN_END, marginEnd * -1, false);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    break;
                case 'space-evenly': {
                    const [marginSize, marginExcess] = getMarginSize(itemCount + 1, offset);
                    const wrapped = mainData.unsetContentBox;
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
                                setCssPX(item, dimension, marginEnd);
                            }
                        }
                    }
                    break;
                }
            }
        }
    }
    else if (!mainData.unsetContentBox) {
        let offset = getRemainingSize(mainData, data, node, dimension, maxScreenWidth, maxScreenHeight);
        if (offset > 0) {
            switch (alignment) {
                case 'center':
                    offset /= 2;
                    if (horizontal) {
                        node.modifyBox(BOX_STANDARD.PADDING_LEFT, Math.floor(offset));
                    }
                    else {
                        node.modifyBox(BOX_STANDARD.PADDING_TOP, Math.floor(offset));
                        node.modifyBox(BOX_STANDARD.PADDING_BOTTOM, Math.ceil(offset));
                    }
                    break;
                case 'right':
                    if (!horizontal) {
                        break;
                    }
                case 'end':
                case 'flex-end':
                    node.modifyBox(horizontal ? BOX_STANDARD.PADDING_LEFT : BOX_STANDARD.PADDING_TOP, offset);
                    break;
            }
        }
    }
}

function getCellDimensions(node: View, horizontal: boolean, section: string[], insideGap: number): Undef<string>[] {
    let width: Undef<string>,
        height: Undef<string>,
        columnWeight: Undef<string>,
        rowWeight: Undef<string>;
    if (section.every(value => isPx(value))) {
        const px = section.reduce((a, b) => a + safeFloat(b), insideGap);
        const dimension = formatPX(px);
        if (horizontal) {
            width = dimension;
        }
        else {
            height = dimension;
        }
    }
    else if (section.every(value => endsWith(value, 'fr'))) {
        const fr = section.reduce((a, b) => a + safeFloat(b), 0);
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
        const percent = formatPercent((section.reduce((a, b) => a + asPercent(b), 0) + insideGap / (horizontal ? node.actualWidth : node.actualHeight)) / 100);
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

function checkAutoDimension(data: CssGridDirectionData, horizontal: boolean) {
    const unit = data.unit;
    if (unit.length && unit.every(value => value === 'auto')) {
        data.unit = new Array(length).fill(horizontal ? '1fr' : '');
    }
}

function requireDirectionSpacer(data: CssGridDirectionData, dimension: number) {
    const unit = data.unit;
    let size = 0,
        percent = 0,
        n: number;
    for (let i = 0, length = unit.length; i < length; ++i) {
        const value = unit[i];
        if (!isNaN(n = asPx(value))) {
            size += n;
        }
        else if (!isNaN(n = asPercent(value))) {
            percent += n;
        }
        else if (endsWith(value, 'fr')) {
            return 0;
        }
    }
    const content = Math.ceil(size + (data.length - 1) * data.gap);
    if (percent) {
        return percent * 100 + (content / dimension * 100);
    }
    if (size) {
        return content < dimension ? -1 : 0;
    }
    return 0;
}

function applyLayout(node: View, parent: View, item: View, mainData: CssGridData<View>, cellData: CssGridCellData, dimension: DimensionAttr) {
    const horizontal = dimension === 'width';
    const { column, row } = mainData;
    let data: CssGridDirectionData,
        cellStart: number,
        cellSpan: number,
        minDimension: CssStyleAttr;
    if (horizontal) {
        data = column;
        cellStart = cellData.columnStart;
        cellSpan = cellData.columnSpan;
        minDimension = 'minWidth';
    }
    else {
        data = row;
        cellStart = cellData.rowStart;
        cellSpan = cellData.rowSpan;
        minDimension = 'minHeight';
    }
    const { unit, unitMin } = data;
    let size = 0,
        minSize = 0,
        minUnitSize = 0,
        sizeWeight = 0,
        n: number,
        fitContent: Undef<boolean>,
        autoSize: Undef<boolean>;
    for (let i = 0, j = 0; i < cellSpan; ++i) {
        const k = cellStart + i;
        const min = unitMin[k];
        if (min) {
            minUnitSize += horizontal ? parent.parseUnit(min) : parent.parseHeight(min);
        }
        let value = unit[k];
        if (!value) {
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
            if (cellSpan < unit.length && (!parent.hasUnit(dimension) || unit.some(px => isLength(px)) || value === 'max-content')) {
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
            if (!item.hasUnit(dimension)) {
                if (horizontal) {
                    item.setLayoutWidth('wrap_content', false);
                }
                else {
                    item.setLayoutHeight('wrap_content', false);
                }
                break;
            }
        }
        else if (endsWith(value, 'fr')) {
            if (horizontal || parent.hasHeight) {
                if (sizeWeight === -1) {
                    sizeWeight = 0;
                }
                sizeWeight += safeFloat(value);
                minSize = size;
            }
            else {
                sizeWeight = 0;
                minSize += mainData.minCellHeight * safeFloat(value);
            }
            size = 0;
        }
        else if (n = asPercent(value)) {
            if (sizeWeight === -1) {
                sizeWeight = 0;
            }
            sizeWeight += n;
            minSize = size;
            size = 0;
        }
        else {
            const cellSize = horizontal ? item.parseUnit(value) : item.parseHeight(value);
            if (minSize === 0) {
                size += cellSize;
            }
            else {
                minSize += cellSize;
            }
        }
        if (node.textElement && /^0[a-z]*$/.test(min)) {
            fitContent = true;
        }
    }
    if (cellSpan > 1) {
        const value = (cellSpan - 1) * data.gap;
        if (size && minSize === 0) {
            size += value;
        }
        else if (minSize) {
            minSize += value;
        }
        if (minUnitSize) {
            minUnitSize += value;
        }
    }
    if (minUnitSize) {
        if ((data.flags & LAYOUT_CSSGRID.AUTO_FILL) && size === 0 && (horizontal ? row.length : column.length) === 1) {
            size = Math.max(node.actualWidth, minUnitSize);
            sizeWeight = 0;
        }
        else {
            minSize = minUnitSize;
        }
    }
    if (minSize && !item.hasUnit(minDimension)) {
        minSize -= item.contentBox ? horizontal ? item.contentBoxWidth : item.contentBoxHeight : 0;
        if (minSize > 0) {
            item.css(minDimension, formatPX(minSize), true);
        }
    }
    if (parent.layoutConstraint) {
        if (horizontal) {
            if (!item.hasUnit('width', { percent: false })) {
                item.app('layout_constraintWidth_percent', truncate(sizeWeight / column.frTotal, item.localSettings.floatPrecision));
                item.setLayoutWidth('0px');
            }
            if (cellStart === 0) {
                item.anchor('left', 'parent');
                item.anchorStyle('horizontal', 0, 'spread');
            }
            else {
                const previousSibling = item.innerMostWrapped.previousSibling as Null<View>;
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
        else if (!item.hasUnit('height', { percent: false })) {
            if (sizeWeight) {
                if (row.length === 1) {
                    item.setLayoutHeight('match_parent');
                }
                else {
                    item.app('layout_constraintHeight_percent', truncate(sizeWeight / row.frTotal, item.localSettings.floatPrecision));
                    item.setLayoutHeight('0px');
                }
            }
            else if (size) {
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
        let columnWeight = horizontal && (column.flags & LAYOUT_CSSGRID.FLEXIBLE) > 0;
        if (sizeWeight !== 0) {
            if (!item.hasUnit(dimension)) {
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
        else if (size) {
            const maxDimension = horizontal ? 'maxWidth' : 'maxHeight';
            if (fitContent && !item.hasUnit(maxDimension)) {
                item.css(maxDimension, formatPX(size), true);
                item.mergeGravity('layout_gravity', horizontal ? 'fill_horizontal' : 'fill_vertical');
            }
            else if (!item.hasUnit(dimension)) {
                if (item.contentBox) {
                    size -= horizontal ? item.contentBoxWidth : item.contentBoxHeight;
                }
                if (autoSize && !parent.hasUnit(maxDimension)) {
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
        else if (unit.length === 0 && !item.hasUnit(dimension)) {
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
}

const getLayoutDimension = (value: string) => value === 'space-between' ? 'match_parent' : 'wrap_content';

export default class CssGrid<T extends View> extends squared.base.extensions.CssGrid<T> {
    public processNode(node: T, parent: T): Void<ExtensionResult<T>> {
        super.processNode(node, parent);
        const mainData = this.data.get(node) as Undef<ICssGridData<T>>;
        if (mainData) {
            let container: Undef<T>,
                renderAs: Undef<T>,
                outputAs: Undef<NodeTemplate<T>>,
                unsetContentBox: Undef<boolean>;
            if (CssGrid.isJustified(node) || CssGrid.isAligned(node)) {
                container = this.controller.createNodeWrapper(node, parent, { containerType: CONTAINER_NODE.CONSTRAINT, resource: NODE_RESOURCE.ASSET, flags: CREATE_NODE.RESET_CONTENTBOX });
                container.inherit(node, 'styleMap', 'boxStyle');
                node.resetBox(BOX_STANDARD.MARGIN, container);
                node.resetBox(BOX_STANDARD.PADDING, container);
                unsetContentBox = true;
                if (CssGrid.isJustified(node)) {
                    node.setLayoutWidth(getLayoutDimension(node.cssValue('justifyContent')));
                }
                else if (node.hasUnit('width', { percent: false })) {
                    node.setLayoutWidth('match_parent');
                }
                else {
                    container.setLayoutWidth(node.blockStatic ? 'match_parent' : 'wrap_content');
                }
                if (CssGrid.isAligned(node)) {
                    node.setLayoutHeight(getLayoutDimension(node.cssValue('alignContent')));
                }
                else if (node.hasUnit('height', { percent: false })) {
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
                        NODE_ALIGNMENT.SINGLE
                    )
                );
            }
            mainData.unsetContentBox = unsetContentBox;
            const { column, row } = mainData;
            const unit = column.unit;
            const layout = LayoutUI.create({
                parent: container || parent,
                node,
                containerType: CONTAINER_NODE.GRID,
                alignmentType: NODE_ALIGNMENT.AUTO_LAYOUT,
                rowCount: row.length,
                columnCount: column.length
            });
            if (mainData.rowSpanMultiple.length === 0 && unit.length === column.length && unit.every(value => endsWith(value, 'fr')) && !node.hasWidth && !node.rootElement && node.ascend({ condition: (item: T) => this.isFlexibleContainer(item), error: item => item.hasWidth }).length) {
                const rowData = mainData.rowData;
                const rowCount = rowData.length;
                const constraintData: T[][] = new Array(rowCount);
                let valid = true;
                invalid: {
                    for (let i = 0; i < rowCount; ++i) {
                        const nodes: T[] = [];
                        const data = rowData[i];
                        for (let j = 0, length = data.length; j < length; ++j) {
                            const cell = data[j];
                            if (cell && cell.length === 1 && !cell[0].isResizable('maxHeight')) {
                                nodes.push(cell[0]);
                            }
                            else {
                                valid = false;
                                break invalid;
                            }
                        }
                        constraintData[i] = nodes;
                    }
                }
                if (valid) {
                    column.frTotal = unit.reduce((a, b) => a + safeFloat(b), 0);
                    row.frTotal = row.unit.reduce((a, b) => a + (endsWith(b, 'fr') ? safeFloat(b) : 0), 0);
                    node.setLayoutWidth('match_parent');
                    node.lockAttr('android', 'layout_width');
                    mainData.constraintData = constraintData;
                    layout.containerType = CONTAINER_NODE.CONSTRAINT;
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
    }

    public processChild(node: T, parent: T) {
        const mainData = this.data.get(parent) as Undef<ICssGridData<T>>;
        const cellData = this.data.get(node) as Undef<CssGridCellData>;
        if (mainData && cellData) {
            const row = mainData.row;
            const alignSelf = node.cssValue('alignSelf') || mainData.alignItems;
            const justifySelf = node.cssValue('justifySelf') || mainData.justifyItems;
            let renderAs: Undef<T>,
                outputAs: Undef<NodeXmlTemplate<T>>;
            if (CSS_ALIGNSELF.includes(alignSelf) || CSS_JUSTIFYSELF.includes(justifySelf) || parent.layoutConstraint) {
                renderAs = this.application.createNode(node.sessionId, { parent, innerWrapped: node });
                renderAs.containerName = node.containerName;
                renderAs.setControlType(CONTAINER_TAGNAME.FRAME, CONTAINER_NODE.FRAME);
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
                        NODE_ALIGNMENT.SINGLE
                    )
                ) as NodeXmlTemplate<T>;
            }
            else {
                node.mergeGravity('layout_gravity', 'top');
            }
            const target = renderAs || node;
            applyLayout(node, parent, target, mainData, cellData, 'width');
            if (target !== node || node.hasUnit('maxHeight')) {
                target.mergeGravity('layout_gravity', 'fill');
            }
            else if (!target.hasUnit('width')) {
                target.mergeGravity('layout_gravity', 'fill_horizontal');
            }
            const [rowStart, rowSpan] = applyLayout(node, parent, target, mainData, cellData, 'height');
            if (mainData.alignContent === 'normal' && !parent.hasUnit('height') && !node.hasUnit('minHeight') && (!row.unit[rowStart] || row.unit[rowStart] === 'auto') && cellData.bounds && Math.floor(node.bounds.height) > cellData.bounds.height && this.checkRowSpan(mainData, node, rowSpan, rowStart)) {
                target.css('minHeight', formatPX(node.box.height), true);
            }
            else if (!target.hasUnit('height') && !target.hasUnit('maxHeight') && !(row.length === 1 && startsWith(mainData.alignContent, 'space') && !CSS_ALIGNSELF.includes(mainData.alignItems))) {
                target.mergeGravity('layout_gravity', 'fill_vertical');
            }
            return {
                parent: renderAs,
                renderAs,
                outputAs
            };
        }
    }

    public postBaseLayout(node: T) {
        const mainData = this.data.get(node) as Undef<ICssGridData<T>>;
        if (mainData) {
            const controller = this.controller as android.base.Controller<T>;
            const { children, column, row, rowData } = mainData;
            const wrapped = mainData.unsetContentBox;
            const insertNode = lastItemOf(children)!;
            if (CssGrid.isJustified(node)) {
                setContentSpacing(mainData, column, node, true, this.application.getUserSetting<number>(node.sessionId, 'resolutionScreenWidth') - node.bounds.left, 0);
                switch (mainData.justifyContent) {
                    case 'center':
                    case 'space-around':
                    case 'space-evenly':
                        if (wrapped) {
                            node.anchorParent('horizontal', 0.5, undefined, true);
                        }
                        break;
                    case 'right':
                    case 'end':
                    case 'flex-end':
                        if (wrapped) {
                            node.anchorParent('horizontal', 1, undefined, true);
                        }
                        break;
                    default:
                        if (mainData.column.length === 1) {
                            node.setLayoutWidth('match_parent');
                        }
                        break;
                }
                if (wrapped) {
                    if (column.unit.some(value => endsWith(value, 'fr'))) {
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
                                insertNode,
                                controller.renderSpace(node.sessionId, {
                                    width: formatPercent((100 - percent) / 100),
                                    height: 'match_parent',
                                    rowSpan: row.length,
                                    android: {
                                        layout_row: '0',
                                        layout_column: length.toString(),
                                        layout_columnWeight: column.flags & LAYOUT_CSSGRID.FLEXIBLE ? '0.01' : ''
                                    }
                                })
                            );
                        }
                        node.android('columnCount', (length + 1).toString());
                    }
                }
                if (wrapped) {
                    if (node.contentBoxWidth && node.hasUnit('width', { percent: false })) {
                        node.anchorParent('horizontal', 0.5, undefined, true);
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
                setContentSpacing(mainData, row, node, false, 0, this.application.getUserSetting<number>(node.sessionId, 'resolutionScreenHeight'));
                if (wrapped) {
                    switch (mainData.alignContent) {
                        case 'center':
                        case 'space-around':
                        case 'space-evenly':
                            node.anchorParent('vertical', 0.5, undefined, true);
                            break;
                        case 'end':
                        case 'flex-end':
                            node.anchorParent('vertical', 1, undefined, true);
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
                                insertNode,
                                controller.renderSpace(node.sessionId, {
                                    width: 'match_parent',
                                    height: formatPercent((100 - percent) / 100),
                                    columnSpan: column.length,
                                    android: {
                                        layout_row: row.length.toString(),
                                        layout_column: '0',
                                        layout_rowWeight: row.flags & LAYOUT_CSSGRID.FLEXIBLE ? '0.01' : ''
                                    }
                                })
                            );
                        }
                        node.android('rowCount', (row.length + 1).toString());
                    }
                }
                if (wrapped) {
                    if (node.contentBoxHeight && node.hasUnit('height', { percent: false })) {
                        node.anchorParent('vertical', 0.5, undefined, true);
                    }
                    else {
                        node.setLayoutHeight('wrap_content', false);
                    }
                }
            }
            const constraintData = mainData.constraintData;
            if (constraintData) {
                const { gap, length } = column;
                const rowCount = constraintData.length;
                const barrierIds: string[] = new Array(rowCount - 1);
                for (let i = 1, j = 0; i < rowCount; ++i) {
                    barrierIds[j++] = controller.addBarrier(constraintData[i], 'top');
                }
                for (let i = 0; i < rowCount; ++i) {
                    const nodes = constraintData[i];
                    const previousBarrierId = barrierIds[i - 1];
                    const barrierId = barrierIds[i];
                    let previousItem: Undef<T>;
                    for (let j = 0; j < length; ++j) {
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
                                item.modifyBox(BOX_STANDARD.MARGIN_RIGHT, gap * -1);
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
                                    layout_constraintWidth_percent: (column.unit.slice(j, length).reduce((a, b) => a + safeFloat(b), 0) / column.frTotal).toString()
                                }
                            } as RenderSpaceAttribute;
                            controller.addAfterInsideTemplate(node, controller.renderSpace(node.sessionId, options), false);
                            previousItem.anchor('rightLeft', options.documentId);
                            break;
                        }
                    }
                }
            }
            else {
                const { emptyRows, rowDirection: horizontal } = mainData;
                const { flags, gap, unit } = horizontal ? column : row;
                const unitSpan = unit.length;
                const resourceId = node.localSettings.resourceId;
                let k = -1, l = 0;
                const createSpacer = (i: number, unitData: string[], gapSize: number, opposing = 'wrap_content', opposingWeight = '', opposingMargin = 0) => {
                    if (k !== -1) {
                        const section = unitData.slice(k, k + l);
                        let width = '',
                            height = '',
                            rowSpan = 1,
                            columnSpan = 1,
                            layout_columnWeight: string,
                            layout_rowWeight: string,
                            layout_row: string,
                            layout_column: string;
                        if (horizontal) {
                            layout_row = i.toString();
                            layout_column = k.toString();
                            height = opposing;
                            layout_columnWeight = flags & LAYOUT_CSSGRID.FLEXIBLE ? '0.01' : '';
                            layout_rowWeight = opposingWeight;
                            columnSpan = l;
                        }
                        else {
                            layout_row = k.toString();
                            layout_column = i.toString();
                            layout_rowWeight = flags & LAYOUT_CSSGRID.FLEXIBLE ? '0.01' : '';
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
                            insertNode,
                            controller.renderSpace(node.sessionId, {
                                width,
                                height,
                                rowSpan,
                                columnSpan,
                                android: {
                                    [horizontal ? node.localizeString(LAYOUT_STRING.MARGIN_RIGHT) : 'bottom']: gapSize && (k + l) < unitData.length ? `@dimen/${Resource.insertStoredAsset(resourceId, 'dimens', `${node.controlId.toLowerCase()}_cssgrid_${horizontal ? 'column' : 'row'}_gap`, formatPX(gapSize))}` : '',
                                    [horizontal ? 'bottom' : node.localizeString(LAYOUT_STRING.MARGIN_RIGHT)]: opposingMargin ? `@dimen/${Resource.insertStoredAsset(resourceId, 'dimens', `${node.controlId.toLowerCase()}_cssgrid_${horizontal ? 'row' : 'column'}_gap`, formatPX(opposingMargin))}` : '',
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
                for (let i = 0, length = Math.max(rowData.length, 1); i < length; ++i) {
                    if (!emptyRows[i]) {
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
                for (let i = 0, length = emptyRows.length; i < length; ++i) {
                    const emptyRow = emptyRows[i];
                    if (emptyRow) {
                        for (let j = 0, q = emptyRow.length; j < q; ++j) {
                            const value = emptyRow[j];
                            if (value) {
                                k = j;
                                const { unit: unitOpposing, gap: gapOpposing } = horizontal ? row : column;
                                const dimensions = getCellDimensions(node, !horizontal, [unitOpposing[horizontal ? j : i] || ''], 0);
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
        if (node.blockStatic && !node.hasUnit('minWidth', { percent: false }) && node.actualParent?.layoutElement === false) {
            const mainData = this.data.get(node) as Undef<CssGridData<T>>;
            if (mainData) {
                const { gap, length, unit } = mainData.column;
                let minWidth = gap * (length - 1);
                for (let i = 0, q = unit.length; i < q; ++i) {
                    const value = asPx(unit[i]);
                    if (!isNaN(value)) {
                        minWidth += value;
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

    private isFlexibleContainer(node: T) {
        const parent = node.actualParent;
        if (parent && parent.gridElement) {
            const mainData = this.data.get(parent as T) as Undef<CssGridData<T>>;
            const cellData = this.data.get(node) as Undef<CssGridCellData>;
            if (mainData && cellData) {
                const unit = mainData.column.unit;
                const { columnStart, columnSpan } = cellData;
                let valid = false;
                for (let i = 0; i < columnSpan; ++i) {
                    const value = unit[columnStart + i];
                    if (value === 'auto') {
                        return false;
                    }
                    else if (endsWith(value, 'fr') || isPercent(value)) {
                        valid = true;
                    }
                }
                return valid;
            }
        }
        return node.hasFlex('row') ? node.flexbox.grow > 0 : false;
    }

    private checkRowSpan(mainData: CssGridData<T>, node: T, rowSpan: number, rowStart: number) {
        if (rowSpan === 1 && mainData.rowSpanMultiple[rowStart]) {
            for (const item of flatArray<T>(mainData.rowData[rowStart], Infinity)) {
                if (item !== node) {
                    const cellData = this.data.get(item) as Undef<CssGridCellData>;
                    if (cellData && cellData.rowSpan > rowSpan && (rowStart === 0 || cellData.rowSpan < mainData.rowData.length)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}