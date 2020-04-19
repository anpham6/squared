import { TableData, TableCellData } from '../../../@types/base/extension';

import ExtensionUI from '../extension-ui';

import { EXT_NAME } from '../lib/constant';
import { BOX_STANDARD, NODE_RESOURCE } from '../lib/enumeration';

type NodeUI = squared.base.NodeUI;

const $lib = squared.lib;

const { formatPercent, formatPX, getInheritedStyle, getStyle, isLength, isPercent } = $lib.css;
const { getNamedItem } = $lib.dom;
const { maxArray } = $lib.math;
const { isNumber, replaceMap, safeNestedArray, withinRange } = $lib.util;

const enum LAYOUT_TABLE {
    NONE = 0,
    STRETCH = 1,
    FIXED = 2,
    VARIABLE = 3,
    COMPRESS = 4
}

const TABLE = EXT_NAME.TABLE;
const REGEX_BACKGROUND = /rgba\(0, 0, 0, 0\)|transparent/;

function setAutoWidth(node: NodeUI, td: NodeUI, data: StandardMap) {
    data.percent = Math.round((td.bounds.width / node.box.width) * 100) + '%';
    data.expand = true;
}

function setBorderStyle(node: NodeUI, attr: string, including: NodeUI) {
    const cssStyle = attr + 'Style';
    node.ascend({ including }).some((item: NodeUI) => {
        if (item.has(cssStyle)) {
            const cssColor = attr + 'Color';
            const cssWidth = attr + 'Width';
            node.css('border', 'inherit');
            node.cssApply(item.cssAsObject(cssStyle, cssColor, cssWidth));
            node.unsetCache(cssWidth);
            return true;
        }
        return false;
    });
}

function hideCell(node: NodeUI) {
    node.exclude({ resource: NODE_RESOURCE.ALL });
    node.hide();
}

const setBoundsWidth = (node: NodeUI) => node.css('width', formatPX(node.bounds.width), true);

export default abstract class Table<T extends NodeUI> extends ExtensionUI<T> {
    public static createDataAttribute(node: NodeUI): TableData {
        return {
            layoutType: 0,
            rowCount: 0,
            columnCount: 0,
            layoutFixed: node.css('tableLayout') === 'fixed',
            borderCollapse: node.css('borderCollapse') === 'collapse',
            expand: false
        };
    }

    public processNode(node: T) {
        const mainData = Table.createDataAttribute(node);
        const tbody: T[] = [];
        let table: T[] = [];
        let tfoot: Undef<T>;
        let thead: Undef<T>;
        const inheritStyles = (parent: Undef<T>) => {
            if (parent) {
                parent.cascade((item: T) => {
                    switch (item.tagName) {
                        case 'TH':
                        case 'TD':
                            item.inherit(parent, 'styleMap');
                            item.unsetCache('visibleStyle');
                            break;
                    }
                    return false;
                });
                table = table.concat(parent.children as T[]);
                hideCell(parent);
            }
        };
        node.each((item: T) => {
            switch (item.tagName) {
                case 'THEAD':
                    if (!thead) {
                        thead = item;
                    }
                    else {
                        hideCell(item);
                    }
                    break;
                case 'TBODY':
                    tbody.push(item);
                    break;
                case 'TFOOT':
                    if (!tfoot) {
                        tfoot = item;
                    }
                    else {
                        hideCell(item);
                    }
                    break;
            }
        });
        inheritStyles(thead);
        tbody.forEach(section => {
            table = table.concat(section.children as T[]);
            hideCell(section);
        });
        inheritStyles(tfoot);
        const hasWidth = node.hasWidth;
        const borderCollapse = mainData.borderCollapse;
        const [horizontal, vertical] = borderCollapse ? [0, 0] : replaceMap(node.css('borderSpacing').split(' '), (value: string, index) => index === 0 ? node.parseWidth(value) : node.parseHeight(value));
        const spacingWidth = horizontal > 1 ? Math.round(horizontal / 2) : horizontal;
        const spacingHeight = vertical > 1 ? Math.round(vertical / 2) : vertical;
        const colgroup = (<Element> node.element).querySelector('COLGROUP');
        const caption = node.find(item => item.tagName === 'CAPTION');
        const captionBottom = node.css('captionSide') === 'bottom';
        const rowWidth: number[] = [];
        const mapBounds: number[] = [];
        const tableFilled: T[][] = [];
        const mapWidth: string[] = [];
        const rowCount = table.length;
        let columnCount = 0;
        for (let i = 0; i < rowCount; ++i) {
            const tr = table[i];
            rowWidth[i] = horizontal;
            const row: T[] = tableFilled[i] || [];
            tableFilled[i] = row;
            tr.each((td: T, index) => {
                const element = <HTMLTableCellElement> td.element;
                const rowSpan = element.rowSpan;
                let colSpan = element.colSpan;
                let j = 0;
                while (row[j]) {
                    j++;
                }
                const q = i + rowSpan;
                let k = i;
                while (k < q) {
                    const item = safeNestedArray(tableFilled, k++);
                    const r = j + colSpan;
                    for (let l = j, m = 0; l < r; ++l) {
                        if (!item[l]) {
                            item[l] = td;
                            m++;
                        }
                        else {
                            colSpan = m;
                            break;
                        }
                    }
                }
                if (!td.hasPX('width')) {
                    const value = getNamedItem(element, 'width');
                    if (isPercent(value)) {
                        td.css('width', value, true);
                    }
                    else if (isNumber(value)) {
                        td.css('width', formatPX(parseFloat(value)), true);
                    }
                }
                if (!td.hasPX('height')) {
                    const value = getNamedItem(element, 'height');
                    if (isPercent(value)) {
                        td.css('height', value);
                    }
                    else if (isNumber(value)) {
                        td.css('height', formatPX(parseFloat(value)));
                    }
                }
                if (td.cssInitial('verticalAlign') === '') {
                    td.css('verticalAlign', 'middle', true);
                }
                if (!td.visibleStyle.backgroundImage && !td.visibleStyle.backgroundColor) {
                    if (colgroup) {
                        const { backgroundImage, backgroundColor } = getStyle(colgroup.children[index + 1]);
                        if (backgroundImage && backgroundImage !== 'none') {
                            td.css('backgroundImage', backgroundImage, true);
                        }
                        if (backgroundColor && !REGEX_BACKGROUND.test(backgroundColor)) {
                            td.css('backgroundColor', backgroundColor);
                            td.setCacheValue('backgroundColor', backgroundColor);
                        }
                    }
                    else {
                        let value = getInheritedStyle(element, 'backgroundImage', /none/, 'TABLE');
                        if (value !== '') {
                            td.css('backgroundImage', value, true);
                        }
                        value = getInheritedStyle(element, 'backgroundColor', REGEX_BACKGROUND, 'TABLE');
                        if (value !== '') {
                            td.css('backgroundColor', value);
                            td.setCacheValue('backgroundColor', value);
                        }
                    }
                }
                switch (td.tagName) {
                    case 'TD': {
                        const including = td.parent as T;
                        if (td.borderTopWidth === 0) {
                            setBorderStyle(td, 'borderTop', including);
                        }
                        if (td.borderRightWidth === 0) {
                            setBorderStyle(td, 'borderRight', including);
                        }
                        if (td.borderBottomWidth === 0) {
                            setBorderStyle(td, 'borderBottom', including);
                        }
                        if (td.borderLeftWidth === 0) {
                            setBorderStyle(td, 'borderLeft', including);
                        }
                        break;
                    }
                    case 'TH': {
                        if (td.cssInitial('textAlign') === '') {
                            td.css('textAlign', 'center');
                        }
                        if (td.borderTopWidth === 0) {
                            setBorderStyle(td, 'borderTop', node);
                        }
                        if (td.borderBottomWidth === 0) {
                            setBorderStyle(td, 'borderBottom', node);
                        }
                        break;
                    }
                }
                const columnWidth = td.cssInitial('width');
                const reevaluate = mapWidth[j] === undefined || mapWidth[j] === 'auto';
                const width = td.bounds.width;
                if (i === 0 || reevaluate || !mainData.layoutFixed) {
                    if (columnWidth === '' || columnWidth === 'auto') {
                        if (mapWidth[j] === undefined) {
                            mapWidth[j] = columnWidth || '0px';
                            mapBounds[j] = 0;
                        }
                        else if (i === rowCount - 1 && reevaluate && mapBounds[j] === 0) {
                            mapBounds[j] = width;
                        }
                    }
                    else {
                        const percent = isPercent(columnWidth);
                        const length = isLength(mapWidth[j]);
                        if (reevaluate || width < mapBounds[j] || width === mapBounds[j] && (length && percent || percent && isPercent(mapWidth[j]) && td.parseWidth(columnWidth) >= td.parseWidth(mapWidth[j]) || length && isLength(columnWidth) && td.parseWidth(columnWidth) > td.parseWidth(mapWidth[j]))) {
                            mapWidth[j] = columnWidth;
                        }
                        if (reevaluate || element.colSpan === 1) {
                            mapBounds[j] = width;
                        }
                    }
                }
                if (td.length || td.inlineText) {
                    rowWidth[i] += width + horizontal;
                }
                if (spacingWidth > 0) {
                    td.modifyBox(BOX_STANDARD.MARGIN_LEFT, j === 0 ? horizontal : spacingWidth);
                    td.modifyBox(BOX_STANDARD.MARGIN_RIGHT, index === 0 ? spacingWidth : horizontal);
                }
                if (spacingHeight > 0) {
                    td.modifyBox(BOX_STANDARD.MARGIN_TOP, i === 0 ? vertical : spacingHeight);
                    td.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, i + rowSpan < rowCount ? spacingHeight : vertical);
                }
                td.data(TABLE, 'cellData', { colSpan, rowSpan });
            });
            hideCell(tr);
            columnCount = Math.max(columnCount, row.length);
        }
        if (node.hasPX('width', false) && mapWidth.some(value => isPercent(value))) {
            replaceMap(mapWidth, (value: string, index) => {
                if (value === 'auto') {
                    const dimension = mapBounds[index];
                    if (dimension > 0) {
                        return formatPX(dimension);
                    }
                }
                return value;
            });
        }
        let percentAll = false;
        let mapPercent = 0;
        if (mapWidth.every(value => isPercent(value))) {
            if (mapWidth.reduce((a, b) => a + parseFloat(b), 0) > 1) {
                let percentTotal = 100;
                replaceMap(mapWidth, (value: string) => {
                    const percent = parseFloat(value);
                    if (percentTotal <= 0) {
                        value = '0px';
                    }
                    else if (percentTotal - percent < 0) {
                        value = formatPercent(percentTotal / 100);
                    }
                    percentTotal -= percent;
                    return value;
                });
            }
            if (!node.hasWidth) {
                mainData.expand = true;
            }
            percentAll = true;
        }
        else if (mapWidth.every(value => isLength(value))) {
            const width = mapWidth.reduce((a, b) => a + parseFloat(b), 0);
            if (node.hasWidth) {
                if (width < node.width) {
                    replaceMap(mapWidth, (value: string) => value !== '0px' ? ((parseFloat(value) / width) * 100) + '%' : value);
                }
                else if (width > node.width) {
                    node.css('width', 'auto');
                    if (!mainData.layoutFixed) {
                        node.cascade((item: T) => {
                            item.css('width', 'auto');
                            return false;
                        });
                    }
                }
            }
            if (mainData.layoutFixed && !node.hasPX('width')) {
                node.css('width', formatPX(node.bounds.width));
            }
        }
        mainData.layoutType = (() => {
            if (mapWidth.length > 1) {
                mapPercent = mapWidth.reduce((a, b) => a + (isPercent(b) ? parseFloat(b) : 0), 0);
                if (mainData.layoutFixed && mapWidth.reduce((a, b) => a + (isLength(b) ? parseFloat(b) : 0), 0) >= node.actualWidth) {
                    return LAYOUT_TABLE.COMPRESS;
                }
                else if (mapWidth.length > 1 && mapWidth.some(value => isPercent(value)) || mapWidth.every(value => isLength(value) && value !== '0px')) {
                    return LAYOUT_TABLE.VARIABLE;
                }
                else if (mapWidth.every(value => value === mapWidth[0])) {
                    if (node.find(td => td.hasHeight, { cascade: true })) {
                        mainData.expand = true;
                        return LAYOUT_TABLE.VARIABLE;
                    }
                    else if (mapWidth[0] === 'auto') {
                        if (node.hasWidth) {
                            return LAYOUT_TABLE.VARIABLE;
                        }
                        else {
                            const td = node.cascade(item => item.tagName === 'TD');
                            return td.length && td.every(item => withinRange(item.bounds.width, td[0].bounds.width)) ? LAYOUT_TABLE.NONE : LAYOUT_TABLE.VARIABLE;
                        }
                    }
                    else if (node.hasWidth) {

                        return LAYOUT_TABLE.FIXED;
                    }
                }
                if (mapWidth.every(value => value === 'auto' || isLength(value) && value !== '0px')) {
                    if (!node.hasWidth) {
                        mainData.expand = true;
                    }
                    return LAYOUT_TABLE.STRETCH;
                }
            }
            return LAYOUT_TABLE.NONE;
        })();
        node.clear();
        if (caption) {
            if (!caption.hasWidth) {
                if (caption.textElement) {
                    if (!caption.hasPX('maxWidth')) {
                        caption.css('maxWidth', formatPX(caption.bounds.width));
                    }
                }
                else if (caption.bounds.width > maxArray(rowWidth)) {
                    setBoundsWidth(caption as T);
                }
            }
            if (!caption.cssInitial('textAlign')) {
                caption.css('textAlign', 'center');
            }
            caption.data(TABLE, 'cellData', { colSpan: columnCount });
            if (!captionBottom) {
                caption.parent = node;
            }
        }
        let i = 0;
        while (i < rowCount) {
            const tr = tableFilled[i++];
            const length = tr.length;
            let j = 0;
            while (j < length) {
                const td = tr[j];
                const data: TableCellData = td.data(TABLE, 'cellData');
                const columnWidth = mapWidth[j];
                j += data.colSpan;
                if (data.placed) {
                    continue;
                }
                if (columnWidth) {
                    switch (mainData.layoutType) {
                        case LAYOUT_TABLE.NONE:
                            break;
                        case LAYOUT_TABLE.VARIABLE:
                            if (columnWidth === 'auto') {
                                if (mapPercent >= 1) {
                                    setBoundsWidth(td);
                                    data.exceed = !hasWidth;
                                    data.downsized = true;
                                }
                                else {
                                    setAutoWidth(node, td, data);
                                }
                            }
                            else if (isPercent(columnWidth)) {
                                if (percentAll) {
                                    data.percent = columnWidth;
                                    data.expand = true;
                                }
                                else {
                                    setBoundsWidth(td);
                                }
                            }
                            else if (isLength(columnWidth) && parseInt(columnWidth) > 0) {
                                if (td.bounds.width >= parseInt(columnWidth)) {
                                    setBoundsWidth(td);
                                    data.expand = false;
                                    data.downsized = false;
                                }
                                else {
                                    if (mainData.layoutFixed) {
                                        setAutoWidth(node, td, data);
                                        data.downsized = true;
                                    }
                                    else {
                                        setBoundsWidth(td);
                                        data.expand = false;
                                    }
                                }
                            }
                            else {
                                if (!td.hasPX('width', false) || td.percentWidth) {
                                    setBoundsWidth(td);
                                }
                                data.expand = false;
                            }
                            break;
                        case LAYOUT_TABLE.FIXED:
                            setAutoWidth(node, td, data);
                            break;
                        case LAYOUT_TABLE.STRETCH:
                            if (columnWidth === 'auto') {
                                data.flexible = true;
                            }
                            else {
                                if (mainData.layoutFixed) {
                                    data.downsized = true;
                                }
                                else {
                                    setBoundsWidth(td);
                                }
                                data.expand = false;
                            }
                            break;
                        case LAYOUT_TABLE.COMPRESS:
                            if (!isLength(columnWidth)) {
                                td.hide();
                            }
                            break;
                    }
                }
                data.placed = true;
                td.parent = node;
            }
            if (length < columnCount) {
                const data: StandardMap = tr[length - 1].data(TABLE, 'cellData');
                if (data) {
                    data.spaceSpan = columnCount - length;
                }
            }
        }
        if (caption && captionBottom) {
            caption.parent = node;
        }
        if (mainData.borderCollapse) {
            const borderTop = node.cssAsObject('borderTopColor', 'borderTopStyle', 'borderTopWidth');
            const borderRight = node.cssAsObject('borderRightColor', 'borderRightStyle', 'borderRightWidth');
            const borderBottom = node.cssAsObject('borderBottomColor', 'borderBottomStyle', 'borderBottomWidth');
            const borderLeft = node.cssAsObject('borderLeftColor', 'borderLeftStyle', 'borderLeftWidth');
            const borderTopWidth = parseInt(borderTop.borderTopWidth), borderRightWidth = parseInt(borderRight.borderRightWidth), borderBottomWidth = parseInt(borderBottom.borderBottomWidth), borderLeftWidth = parseInt(borderLeft.borderLeftWidth);
            let hideTop = false, hideRight = false, hideBottom = false, hideLeft = false;
            for (i = 0; i < rowCount; ++i) {
                const tr = tableFilled[i];
                for (let j = 0; j < columnCount; ++j) {
                    const td = tr[j];
                    if (td?.css('visibility') === 'visible') {
                        if (i === 0) {
                            if (td.borderTopWidth < borderTopWidth) {
                                td.cssApply(borderTop);
                                td.unsetCache('borderTopWidth');
                            }
                            else {
                                hideTop = true;
                            }
                        }
                        if (i >= 0 && i < rowCount - 1) {
                            const next = tableFilled[i + 1][j];
                            if (next?.css('visibility') === 'visible' && next !== td) {
                                if (td.borderBottomWidth > next.borderTopWidth) {
                                    next.css('borderTopWidth', '0px', true);
                                }
                                else {
                                    td.css('borderBottomWidth', '0px', true);
                                }
                            }
                        }
                        if (i === rowCount - 1) {
                            if (td.borderBottomWidth < borderBottomWidth) {
                                td.cssApply(borderBottom);
                                td.unsetCache('borderBottomWidth');
                            }
                            else {
                                hideBottom = true;
                            }
                        }
                        if (j === 0) {
                            if (td.borderLeftWidth < borderLeftWidth) {
                                td.cssApply(borderLeft);
                                td.unsetCache('borderLeftWidth');
                            }
                            else {
                                hideLeft = true;
                            }
                        }
                        if (j >= 0 && j < columnCount - 1) {
                            const next = tr[j + 1];
                            if (next?.css('visibility') === 'visible' && next !== td) {
                                if (td.borderRightWidth >= next.borderLeftWidth) {
                                    next.css('borderLeftWidth', '0px', true);
                                }
                                else {
                                    td.css('borderRightWidth', '0px', true);
                                }
                            }
                        }
                        if (j === columnCount - 1) {
                            if (td.borderRightWidth < borderRightWidth) {
                                td.cssApply(borderRight);
                                td.unsetCache('borderRightWidth');
                            }
                            else {
                                hideRight = true;
                            }
                        }
                    }
                }
            }
            if (hideTop || hideRight || hideBottom || hideLeft) {
                node.cssApply({
                    borderTopWidth: '0px',
                    borderRightWidth: '0px',
                    borderBottomWidth: '0px',
                    borderLeftWidth: '0px'
                }, true);
            }
        }
        mainData.rowCount = rowCount + (caption ? 1 : 0);
        mainData.columnCount = columnCount;
        node.data(TABLE, 'mainData', mainData);
        return undefined;
    }
}