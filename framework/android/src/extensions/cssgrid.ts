import BOX_STANDARD = squared.base.lib.constant.BOX_STANDARD;
import NODE_ALIGNMENT = squared.base.lib.constant.NODE_ALIGNMENT;
import LAYOUT_STRING = android.base.LAYOUT_STRING;

import { CONTAINER_NODE, CONTAINER_TAGNAME } from '../lib/constant';

import type View from '../view';

import Resource from '../resource';

import LayoutUI = squared.base.LayoutUI;

interface ICssGridData<T> extends CssGridData<T> {
    unsetContentBox?: boolean;
    constraintData?: T[][];
}

const { NODE_PROCEDURE, NODE_RESOURCE } = squared.base.lib.constant;

const { formatPercent, formatPX, isLength, isPercent } = squared.lib.css;
const { truncate } = squared.lib.math;
const { flatArray } = squared.lib.util;

const REGEXP_ALIGNSELF = /start|end|center|baseline/;
const REGEXP_JUSTIFYSELF = /start|center|end|baseline|right|left/;

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
            const unitPX = unit[i];
            if (unitPX.endsWith('px')) {
                value += parseFloat(unitPX);
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
    else {
        value += node.contentBox ? node.borderTopWidth + node.borderBottomWidth : node.contentBoxHeight;
        return (maxScreenHeight > value && node.documentBody ? Math.min(maxScreenHeight, node.actualHeight) : node.actualHeight) - value;
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
    if (alignment.startsWith('space')) {
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
                                item.cssPX(dimension, offset / itemCount, true);
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
                                        item.cssPX(dimension, marginEnd, true);
                                    }
                                    else {
                                        item.modifyBox(MARGIN_END, marginEnd);
                                        adjusted.add(item);
                                    }
                                }
                                else {
                                    const unitSpan = parseInt(item.android(horizontal ? 'layout_columnSpan' : 'layout_rowSpan'));
                                    if (unitSpan > 1) {
                                        const marginEnd = marginSize + (marginExcess > 0 ? Math.max(marginExcess - 1, 1) : 0);
                                        item.cssPX(dimension, marginEnd, true);
                                        if (adjusted.has(item)) {
                                            item.modifyBox(MARGIN_END, marginEnd * -1, false);
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
                                item.cssPX(dimension, marginEnd, true);
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
    if (section.every(value => value.endsWith('px'))) {
        const px = section.reduce((a, b) => a + parseFloat(b), insideGap);
        const dimension = formatPX(px);
        if (horizontal) {
            width = dimension;
        }
        else {
            height = dimension;
        }
    }
    else if (section.every(value => value.endsWith('fr'))) {
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

function checkAutoDimension(data: CssGridDirectionData, horizontal: boolean) {
    const unit = data.unit;
    if (unit.length && unit.every(value => value === 'auto')) {
        data.unit = new Array(length).fill(horizontal ? '1fr' : '');
    }
}

function requireDirectionSpacer(data: CssGridDirectionData, dimension: number) {
    const unit = data.unit;
    let size = 0,
        percent = 0;
    for (let i = 0, length = unit.length; i < length; ++i) {
        const value = unit[i];
        if (value.endsWith('px')) {
            size += parseFloat(value);
        }
        else if (isPercent(value)) {
            percent += parseFloat(value);
        }
        else if (value.endsWith('fr')) {
            return 0;
        }
    }
    const content = Math.ceil(size + (data.length - 1) * data.gap);
    if (percent) {
        return percent + (content / dimension * 100);
    }
    else if (size) {
        return content < dimension ? -1 : 0;
    }
    return 0;
}

function applyLayout(node: View, parent: View, item: View, mainData: CssGridData<View>, cellData: CssGridCellData, dimension: string) {
    const horizontal = dimension === 'width';
    const { column, row } = mainData;
    let data: CssGridDirectionData,
        cellStart: number,
        cellSpan: number,
        minDimension: string;
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
        else if (value.endsWith('fr')) {
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
            const cellSize = horizontal ? item.parseUnit(value) : item.parseHeight(value);
            if (minSize === 0) {
                size += cellSize;
            }
            else {
                minSize += cellSize;
            }
        }
        if (node.textElement && /^0[a-zQ]*$/.test(min)) {
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
        if (data.autoFill && size === 0 && (horizontal ? row.length : column.length) === 1) {
            size = Math.max(node.actualWidth, minUnitSize);
            sizeWeight = 0;
        }
        else {
            minSize = minUnitSize;
        }
    }
    if (minSize && !item.hasPX(minDimension)) {
        item.css(minDimension, formatPX(minSize), true);
    }
    if (parent.layoutConstraint) {
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
        else if (!item.hasPX('height', { percent: false })) {
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
        else if (size) {
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
                container = this.controller.createNodeWrapper(node, parent, { containerType: CONTAINER_NODE.CONSTRAINT, resource: NODE_RESOURCE.ASSET, resetContentBox: true });
                container.inherit(node, 'styleMap', 'boxStyle');
                node.resetBox(BOX_STANDARD.MARGIN, container);
                node.resetBox(BOX_STANDARD.PADDING, container);
                unsetContentBox = true;
                if (CssGrid.isJustified(node)) {
                    node.setLayoutWidth(getLayoutDimension(node.valueAt('justifyContent')));
                }
                else if (node.hasPX('width', { percent: false })) {
                    node.setLayoutWidth('match_parent');
                }
                else {
                    container.setLayoutWidth(node.blockStatic ? 'match_parent' : 'wrap_content');
                }
                if (CssGrid.isAligned(node)) {
                    node.setLayoutHeight(getLayoutDimension(node.valueAt('alignContent')));
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
            if (mainData.rowSpanMultiple.length === 0 && unit.length === column.length && unit.every(value => value.endsWith('fr')) && !node.hasWidth && !node.rootElement && node.ascend({ condition: (item: T) => this.isFlexibleContainer(item), error: item => item.hasWidth }).length) {
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
                            if (cell && cell.length === 1) {
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
                    column.frTotal = unit.reduce((a, b) => a + parseFloat(b), 0);
                    row.frTotal = row.unit.reduce((a, b) => a + (b.endsWith('fr') ? parseFloat(b) : 0), 0);
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
            const alignSelf = node.valueAt('alignSelf') || mainData.alignItems;
            const justifySelf = node.valueAt('justifySelf') || mainData.justifyItems;
            let renderAs: Undef<T>,
                outputAs: Undef<NodeXmlTemplate<T>>;
            if (REGEXP_ALIGNSELF.test(alignSelf) || REGEXP_JUSTIFYSELF.test(justifySelf) || parent.layoutConstraint) {
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
            if (target !== node || node.hasPX('maxHeight')) {
                target.mergeGravity('layout_gravity', 'fill');
            }
            else if (!target.hasPX('width')) {
                target.mergeGravity('layout_gravity', 'fill_horizontal');
            }
            const [rowStart, rowSpan] = applyLayout(node, parent, target, mainData, cellData, 'height');
            if (mainData.alignContent === 'normal' && !parent.hasPX('height') && !node.hasPX('minHeight') && (!row.unit[rowStart] || row.unit[rowStart] === 'auto') && cellData.bounds && Math.floor(node.bounds.height) > cellData.bounds.height && this.checkRowSpan(mainData, node, rowSpan, rowStart)) {
                target.css('minHeight', formatPX(node.box.height));
            }
            else if (!target.hasPX('height') && !target.hasPX('maxHeight') && !(row.length === 1 && mainData.alignContent.startsWith('space') && !REGEXP_ALIGNSELF.test(mainData.alignItems))) {
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
            const insertNode = children[children.length - 1];
            if (CssGrid.isJustified(node)) {
                setContentSpacing(mainData, column, node, true, controller.userSettings.resolutionScreenWidth! - node.bounds.left, 0);
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
                    if (column.unit.some(value => value.endsWith('fr'))) {
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
                    if (node.contentBoxWidth && node.hasPX('width', { percent: false })) {
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
                setContentSpacing(mainData, row, node, false, 0, controller.userSettings.resolutionScreenHeight!);
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
                                insertNode,
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
                    if (node.contentBoxHeight && node.hasPX('height', { percent: false })) {
                        node.anchorParent('vertical', 0.5, '', true);
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
                                    layout_constraintWidth_percent: (column.unit.slice(j, length).reduce((a, b) => a + parseFloat(b), 0) / column.frTotal).toString()
                                }
                            } as RenderSpaceAttribute;
                            controller.addAfterInsideTemplate(node, controller.renderSpace(options), false);
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
                            insertNode,
                            controller.renderSpace({
                                width,
                                height,
                                rowSpan,
                                columnSpan,
                                android: {
                                    [horizontal ? node.localizeString(LAYOUT_STRING.MARGIN_RIGHT) : 'bottom']: gapSize && (k + l) < unitData.length ? `@dimen/${Resource.insertStoredAsset('dimens', `${node.controlId.toLowerCase()}_cssgrid_${horizontal ? 'column' : 'row'}_gap`, formatPX(gapSize))}` : '',
                                    [horizontal ? 'bottom' : node.localizeString(LAYOUT_STRING.MARGIN_RIGHT)]: opposingMargin ? `@dimen/${Resource.insertStoredAsset('dimens', `${node.controlId.toLowerCase()}_cssgrid_${horizontal ? 'row' : 'column'}_gap`, formatPX(opposingMargin))}` : '',
                                    layout_row,
                                    layout_column,
                                    layout_rowWeight,
                                    layout_columnWeight,
                                    layout_gravity: 'fill'
                                }
                            }),
                            width.endsWith('px') || height.endsWith('px')
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
        if (node.blockStatic && !node.hasPX('minWidth', { percent: false }) && node.actualParent?.layoutElement === false) {
            const mainData = this.data.get(node) as Undef<CssGridData<T>>;
            if (mainData) {
                const { gap, length, unit } = mainData.column;
                let minWidth = gap * (length - 1);
                for (let i = 0, q = unit.length; i < q; ++i) {
                    const value = unit[i];
                    if (value.endsWith('px')) {
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

    private isFlexibleContainer(node: T) {
        const parent = node.actualParent as Null<T>;
        if (parent && parent.gridElement) {
            const mainData = this.data.get(parent) as Undef<CssGridData<T>>;
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
                    else if (value.endsWith('fr') || isPercent(value)) {
                        valid = true;
                    }
                }
                return valid;
            }
        }
        return node.hasFlex('row') && node.flexbox.grow > 0;
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