import { TableData, TableCellData } from '../../../@types/base/extension';

import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

import { EXT_NAME } from '../lib/constant';
import { BOX_STANDARD } from '../lib/enumeration';

const $lib = squared.lib;
const { formatPercent, formatPX, getInheritedStyle, getStyle, isLength, isPercent } = $lib.css;
const { getNamedItem } = $lib.dom;
const { maxArray } = $lib.math;
const { isNumber, replaceMap, withinRange } = $lib.util;

const enum LAYOUT_TABLE {
    NONE = 0,
    STRETCH = 1,
    FIXED = 2,
    VARIABLE = 3,
    COMPRESS = 4
}

const TABLE = EXT_NAME.TABLE;
const REGEX_BACKGROUND = /rgba\(0, 0, 0, 0\)|transparent/;

function setAutoWidth(node: NodeUI, td: NodeUI, data: ExternalData) {
    data.percent = Math.round((td.bounds.width / node.box.width) * 100) + '%';
    data.expand = true;
}

const setBoundsWidth = (td: NodeUI) => td.css('width', formatPX(td.bounds.width), true);

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
        function inheritStyles(parent: Undef<T>) {
            if (parent) {
                for (const item of parent.cascade() as T[]) {
                    switch (item.tagName) {
                        case 'TH':
                        case 'TD':
                            item.inherit(parent, 'styleMap');
                            item.unsetCache('visibleStyle');
                            break;
                    }
                }
                table = table.concat(parent.children as T[]);
                parent.hide();
            }
        }
        node.each((item: T) => {
            switch (item.tagName) {
                case 'THEAD':
                    if (thead === undefined) {
                        thead = item;
                    }
                    else {
                        item.hide();
                    }
                    break;
                case 'TBODY':
                    tbody.push(item);
                    break;
                case 'TFOOT':
                    if (tfoot === undefined) {
                        tfoot = item;
                    }
                    else {
                        item.hide();
                    }
                    break;
            }
        });
        inheritStyles(thead);
        for (const section of tbody) {
            table = table.concat(section.children as T[]);
            section.hide();
        }
        inheritStyles(tfoot);
        const [horizontal, vertical] = mainData.borderCollapse ? [0, 0] : replaceMap<string, number>(node.css('borderSpacing').split(' '), (value, index) => node.parseUnit(value, index === 0 ? 'width' : 'height'));
        const spacingWidth = horizontal > 1 ? Math.round(horizontal / 2) : horizontal;
        const spacingHeight = vertical > 1 ? Math.round(vertical / 2) : vertical;
        const colgroup = (<Element> node.element).querySelector('COLGROUP');
        const rowWidth: number[] = [];
        const mapBounds: number[] = [];
        const tableFilled: T[][] = [];
        const mapWidth: string[] = [];
        const rowCount = table.length;
        let columnCount = 0;
        for (let i = 0; i < rowCount; i++) {
            const tr = table[i];
            rowWidth[i] = horizontal;
            const row: T[] = tableFilled[i] || [];
            tableFilled[i] = row;
            tr.each((td: T, index) => {
                const element = <HTMLTableCellElement> td.element;
                const rowSpan = element.rowSpan;
                let colSpan = element.colSpan;
                let j = -1;
                for (let k = 0; j === -1; k++) {
                    if (row[k] === undefined) {
                        j = k;
                    }
                }
                for (let k = i; k < i + rowSpan; k++) {
                    if (tableFilled[k] === undefined) {
                        tableFilled[k] = [];
                    }
                    for (let l = j, m = 0; l < j + colSpan; l++) {
                        if (tableFilled[k][l] === undefined) {
                            tableFilled[k][l] = td;
                            m++;
                        }
                        else {
                            colSpan = m
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
                if (!td.visibleStyle.backgroundImage && !td.visibleStyle.backgroundColor) {
                    if (colgroup) {
                        const { backgroundImage, backgroundColor } = getStyle(colgroup.children[index + 1]);
                        if (backgroundImage && backgroundImage !== 'none') {
                            td.css('backgroundImage', backgroundImage, true);
                        }
                        if (backgroundColor && !REGEX_BACKGROUND.test(backgroundColor)) {
                            td.css('backgroundColor', backgroundColor, true);
                        }
                    }
                    else {
                        let value = getInheritedStyle(element, 'backgroundImage', /none/, 'TABLE');
                        if (value !== '') {
                            td.css('backgroundImage', value, true);
                        }
                        value = getInheritedStyle(element, 'backgroundColor', REGEX_BACKGROUND, 'TABLE');
                        if (value !== '') {
                            td.css('backgroundColor', value, true);
                        }
                    }
                }
                function setBorderStyle(attr: string, including: T) {
                    const cssStyle = attr + 'Style';
                    td.ascend({ including }).some((item: T) => {
                        if (item.has(cssStyle)) {
                            const cssColor = attr + 'Color';
                            const cssWidth = attr + 'Width';
                            td.css(cssStyle, item.css(cssStyle));
                            td.css(cssColor, item.css(cssColor));
                            td.css(cssWidth, item.css(cssWidth), true);
                            td.css('border', 'inherit');
                            return true;
                        }
                        return false;
                    });
                }
                switch (td.tagName) {
                    case 'TD': {
                        const including = td.parent as T;
                        if (td.cssInitial('verticalAlign') === '') {
                            td.css('verticalAlign', 'middle', true);
                        }
                        if (td.borderTopWidth === 0) {
                            setBorderStyle('borderTop', including);
                        }
                        if (td.borderRightWidth === 0) {
                            setBorderStyle('borderRight', including);
                        }
                        if (td.borderBottomWidth === 0) {
                            setBorderStyle('borderBottom', including);
                        }
                        if (td.borderLeftWidth === 0) {
                            setBorderStyle('borderLeft', including);
                        }
                        break;
                    }
                    case 'TH': {
                        if (td.cssInitial('textAlign') === '') {
                            td.css('textAlign', 'center');
                        }
                        if (td.borderTopWidth === 0) {
                            setBorderStyle('borderTop', node);
                        }
                        if (td.borderBottomWidth === 0) {
                            setBorderStyle('borderBottom', node);
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
                        else if (i === rowCount - 1) {
                            if (reevaluate && mapBounds[j] === 0) {
                                mapBounds[j] = width;
                            }
                        }
                    }
                    else {
                        const percent = isPercent(columnWidth);
                        const length = isLength(mapWidth[j]);
                        if (reevaluate || width < mapBounds[j] || width === mapBounds[j] && (length && percent || percent && isPercent(mapWidth[j]) && td.parseUnit(columnWidth) >= td.parseUnit(mapWidth[j]) || length && isLength(columnWidth) && td.parseUnit(columnWidth) > td.parseUnit(mapWidth[j]))) {
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
            tr.hide();
            columnCount = Math.max(columnCount, row.length);
        }
        if (node.hasPX('width', false) && mapWidth.some(value => isPercent(value))) {
            replaceMap<string, string>(mapWidth, (value, index) => {
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
        if (mapWidth.every(value => isPercent(value))) {
            if (mapWidth.reduce((a, b) => a + parseFloat(b), 0) > 1) {
                let percentTotal = 100;
                replaceMap<string, string>(mapWidth, value => {
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
                    replaceMap<string, string>(mapWidth, value => value !== '0px' ? ((parseFloat(value) / width) * 100) + '%' : value);
                }
                else if (width > node.width) {
                    node.css('width', 'auto');
                    if (!mainData.layoutFixed) {
                        for (const item of node.cascade()) {
                            item.css('width', 'auto');
                        }
                    }
                }
            }
            if (mainData.layoutFixed && !node.hasPX('width')) {
                node.css('width', formatPX(node.bounds.width));
            }
        }
        let mapPercent = 0;
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
                    if (node.cascadeSome(td => td.hasHeight)) {
                        mainData.expand = true;
                        return LAYOUT_TABLE.VARIABLE;
                    }
                    else if (mapWidth[0] === 'auto') {
                        if (node.hasWidth) {
                            return LAYOUT_TABLE.VARIABLE;
                        }
                        else {
                            const td = node.cascade(item => item.tagName === 'TD');
                            if (td.length && td.every(item => withinRange(item.bounds.width, td[0].bounds.width))) {
                                return LAYOUT_TABLE.NONE;
                            }
                            return LAYOUT_TABLE.VARIABLE;
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
        const caption = node.find(item => item.tagName === 'CAPTION');
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
            caption.parent = node;
        }
        const hasWidth = node.hasWidth;
        for (let i = 0; i < rowCount; i++) {
            const tr = tableFilled[i];
            const length = tr.length;
            for (let j = 0; j < length; ) {
                const td = tr[j];
                const data: TableCellData = td.data(TABLE, 'cellData');
                if (data.placed) {
                    j += data.colSpan;
                    continue;
                }
                const columnWidth = mapWidth[j];
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
                            td.css('width', '0px');
                            break;
                        case LAYOUT_TABLE.STRETCH:
                            if (columnWidth === 'auto') {
                                td.css('width', '0px');
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
                j += data.colSpan;
            }
            if (length < columnCount) {
                const data: ExternalData = tr[length - 1].data(TABLE, 'cellData');
                if (data) {
                    data.spaceSpan = columnCount - length;
                }
            }
        }
        if (mainData.borderCollapse) {
            const borderTopColor = node.css('borderTopColor');
            const borderTopStyle = node.css('borderTopStyle');
            const borderTopWidth = node.css('borderTopWidth');
            const borderRightColor = node.css('borderRightColor');
            const borderRightStyle = node.css('borderRightStyle');
            const borderRightWidth = node.css('borderRightWidth');
            const borderBottomColor = node.css('borderBottomColor');
            const borderBottomStyle = node.css('borderBottomStyle');
            const borderBottomWidth = node.css('borderBottomWidth');
            const borderLeftColor = node.css('borderLeftColor');
            const borderLeftStyle = node.css('borderLeftStyle');
            const borderLeftWidth = node.css('borderLeftWidth');
            let hideTop = false;
            let hideRight = false;
            let hideBottom = false;
            let hideLeft = false;
            for (let i = 0; i < rowCount; i++) {
                for (let j = 0; j < columnCount; j++) {
                    const td = tableFilled[i][j];
                    if (td?.css('visibility') === 'visible') {
                        if (i === 0) {
                            if (td.borderTopWidth < parseInt(borderTopWidth)) {
                                td.cssApply({
                                    borderTopColor,
                                    borderTopStyle,
                                    borderTopWidth
                                }, true);
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
                            if (td.borderBottomWidth < parseInt(borderBottomWidth)) {
                                td.cssApply({
                                    borderBottomColor,
                                    borderBottomStyle,
                                    borderBottomWidth
                                }, true);
                            }
                            else {
                                hideBottom = true;
                            }
                        }
                        if (j === 0) {
                            if (td.borderLeftWidth < parseInt(borderLeftWidth)) {
                                td.cssApply({
                                    borderLeftColor,
                                    borderLeftStyle,
                                    borderLeftWidth
                                }, true);
                            }
                            else {
                                hideLeft = true;
                            }
                        }
                        if (j >= 0 && j < columnCount - 1) {
                            const next = tableFilled[i][j + 1];
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
                            if (td.borderRightWidth < parseInt(borderRightWidth)) {
                                td.cssApply({
                                    borderRightColor,
                                    borderRightStyle,
                                    borderRightWidth
                                }, true);
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
        mainData.rowCount = rowCount;
        mainData.columnCount = columnCount;
        node.data(TABLE, 'mainData', mainData);
        return undefined;
    }
}