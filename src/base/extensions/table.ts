import BOX_STANDARD = squared.base.lib.constant.BOX_STANDARD;
import NODE_RESOURCE = squared.base.lib.constant.NODE_RESOURCE;
import LAYOUT_TABLE = squared.lib.internal.LAYOUT_TABLE;
import LAYOUT_TABLETYPE = squared.lib.internal.LAYOUT_TABLETYPE;
import LAYOUT_TABLECELL = squared.lib.internal.LAYOUT_TABLECELL;

import type NodeUI from '../node-ui';

import Resource from '../resource';
import ExtensionUI from '../extension-ui';

const { formatPercent, formatPX, getStyle, isLength, isPercent } = squared.lib.css;
const { getNamedItem } = squared.lib.dom;
const { convertPercent, replaceMap } = squared.lib.util;

function setAutoWidth(node: NodeUI, td: NodeUI, data: StandardMap) {
    data.percent = Math.round(td.bounds.width / node.box.width * 100) + '%';
    data.expand = true;
}

function setBorderStyle(node: NodeUI, attr: "borderTop" | "borderRight" | "borderBottom" | "borderLeft", including: NodeUI) {
    const cssStyle = attr + 'Style' as CssStyleAttr;
    node.ascend({ including }).some((item: NodeUI) => {
        if (item.has(cssStyle)) {
            const cssWidth = attr + 'Width' as CssStyleAttr;
            node.cssApply(item.cssAsObject(cssStyle, attr + 'Color' as CssStyleAttr, cssWidth));
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

function createDataAttribute(node: NodeUI): TableData {
    let flags = 0;
    if (node.valueOf('tableLayout') === 'fixed') {
        flags |= LAYOUT_TABLE.FIXED;
    }
    if (node.valueOf('borderCollapse') === 'collapse') {
        flags |= LAYOUT_TABLE.COLLAPSE;
    }
    return {
        layoutType: 0,
        rowCount: 0,
        columnCount: 0,
        flags
    };
}

function getInheritedStyle(element: Element, attr: string, exclude: RegExp) {
    let value = '',
        current = element.parentElement;
    while (current && current.tagName !== 'TABLE') {
        value = getStyle(current)[attr];
        if (exclude.test(value)) {
            value = '';
        }
        else if (value) {
            break;
        }
        current = current.parentElement;
    }
    return value;
}

const setBoundsWidth = (node: NodeUI) => node.css('width', formatPX(node.bounds.width), true);

export default abstract class Table<T extends NodeUI> extends ExtensionUI<T> {
    public is(node: T) {
        return node.tableElement;
    }

    public condition() { return true; }

    public processNode(node: T) {
        const mainData = createDataAttribute(node);
        let table: T[] = [],
            tfoot: Undef<T>,
            thead: Undef<T>;
        const inheritStyles = (parent: Undef<T>, append: boolean) => {
            if (parent) {
                parent.cascade((item: T) => {
                    switch (item.tagName) {
                        case 'TH':
                        case 'TD':
                            item.inherit(parent, 'styleMap');
                            item.unsetCache('visibleStyle');
                            break;
                    }
                });
                if (append) {
                    table.push(...parent.children as T[]);
                }
                else {
                    table = parent.children.concat(table) as T[];
                }
            }
        };
        node.each((item: T) => {
            switch (item.tagName) {
                case 'THEAD':
                    thead ||= item;
                    hideCell(item);
                    break;
                case 'TBODY':
                    table.push(...item.children as T[]);
                    hideCell(item);
                    break;
                case 'TFOOT':
                    tfoot ||= item;
                    hideCell(item);
                    break;
            }
        });
        inheritStyles(thead, false);
        inheritStyles(tfoot, true);
        const layoutFixed = (mainData.flags & LAYOUT_TABLE.FIXED) > 0;
        const borderCollapse = (mainData.flags & LAYOUT_TABLE.COLLAPSE) > 0;
        const [horizontal, vertical] = !borderCollapse ? replaceMap(node.css('borderSpacing').split(' '), (value, index) => index === 0 ? node.parseUnit(value) : node.parseHeight(value)) : [0, 0];
        const spacingWidth = horizontal > 1 ? Math.round(horizontal / 2) : horizontal;
        const spacingHeight = vertical > 1 ? Math.round(vertical / 2) : vertical;
        const hasWidth = node.hasWidth;
        const colgroup = node.element!.querySelector('COLGROUP');
        const caption = node.find(item => item.tagName === 'CAPTION') as Undef<T>;
        const captionBottom = caption && node.valueOf('captionSide') === 'bottom';
        const rowWidth: number[] = [];
        const mapBounds: number[] = [];
        const tableFilled: T[][] = [];
        const mapWidth: string[] = [];
        const rowCount = table.length;
        let columnCount = 0,
            mapPercent = 0,
            percentAll: Undef<boolean>;
        for (let i = 0; i < rowCount; ++i) {
            const tr = table[i];
            rowWidth[i] = horizontal;
            const row: T[] = tableFilled[i] || [];
            tableFilled[i] = row;
            tr.each((td: T, index) => {
                const element = td.element as HTMLTableCellElement;
                const rowSpan = element.rowSpan;
                let colSpan = element.colSpan,
                    j = 0;
                while (row[j]) {
                    ++j;
                }
                for (let k = i, q = i + rowSpan; k < q; ++k) {
                    const item = tableFilled[k] ||= [];
                    for (let l = j, m = 0, r = j + colSpan; l < r; ++l) {
                        if (!item[l]) {
                            item[l] = td;
                            ++m;
                        }
                        else {
                            colSpan = m;
                            break;
                        }
                    }
                }
                if (!td.hasUnit('width')) {
                    let value: NumString = getNamedItem(element, 'width');
                    if (value) {
                        if (isPercent(value)) {
                            td.css('width', value, true);
                        }
                        else if (!isNaN(value = +value)) {
                            td.css('width', formatPX(value), true);
                        }
                    }
                }
                if (!td.hasUnit('height')) {
                    let value: NumString = getNamedItem(element, 'height');
                    if (value) {
                        if (isPercent(value)) {
                            td.css('height', value);
                        }
                        else if (!isNaN(value = +value)) {
                            td.css('height', formatPX(value));
                        }
                    }
                }
                if (!td.valueOf('verticalAlign')) {
                    td.css('verticalAlign', 'middle');
                }
                const visibleStyle = td.visibleStyle;
                if (!visibleStyle.backgroundImage && !visibleStyle.backgroundColor) {
                    const exclude = /rgba\(0, 0, 0, 0\)|transparent/;
                    if (colgroup) {
                        const group = colgroup.children[index + 1];
                        if (group) {
                            const { backgroundImage, backgroundColor } = getStyle(group);
                            if (backgroundImage !== 'none') {
                                td.css('backgroundImage', backgroundImage, true);
                                visibleStyle.backgroundImage = true;
                            }
                            if (!exclude.test(backgroundColor)) {
                                td.css('backgroundColor', backgroundColor);
                                td.setCacheValue('backgroundColor', backgroundColor);
                                visibleStyle.backgroundColor = true;
                            }
                        }
                    }
                    else {
                        let value = getInheritedStyle(element, 'backgroundImage', /none/);
                        if (value) {
                            td.css('backgroundImage', value, true);
                            visibleStyle.backgroundImage = true;
                        }
                        if (value = getInheritedStyle(element, 'backgroundColor', exclude)) {
                            td.css('backgroundColor', value);
                            td.setCacheValue('backgroundColor', value);
                            visibleStyle.backgroundColor = true;
                        }
                    }
                    if (visibleStyle.backgroundImage || visibleStyle.backgroundColor) {
                        visibleStyle.background = true;
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
                    case 'TH':
                        if (!td.valueOf('textAlign')) {
                            td.css('textAlign', 'center');
                        }
                        if (td.borderTopWidth === 0) {
                            setBorderStyle(td, 'borderTop', node);
                        }
                        if (td.borderBottomWidth === 0) {
                            setBorderStyle(td, 'borderBottom', node);
                        }
                        if (td.textElement) {
                            td.data(Resource.KEY_NAME, 'hintString', td.textContent);
                        }
                        break;
                }
                const columnWidth = td.valueOf('width');
                const reevaluate = !mapWidth[j] || mapWidth[j] === 'auto';
                const width = td.bounds.width;
                if (i === 0 || reevaluate || !layoutFixed) {
                    if (!columnWidth || columnWidth === 'auto') {
                        if (!mapWidth[j]) {
                            mapWidth[j] = columnWidth || '0px';
                            mapBounds[j] = 0;
                        }
                        else if (i === rowCount - 1 && reevaluate && mapBounds[j] === 0) {
                            mapBounds[j] = width;
                        }
                    }
                    else if (reevaluate) {
                        mapWidth[j] = columnWidth;
                        mapBounds[j] = width;
                    }
                    else {
                        const percent = isPercent(columnWidth);
                        const length = isLength(mapWidth[j]);
                        if (width < mapBounds[j] || width === mapBounds[j] && (percent && length || percent && isPercent(mapWidth[j]) && td.parseUnit(columnWidth) >= td.parseUnit(mapWidth[j]) || length && isLength(columnWidth) && td.parseUnit(columnWidth) > td.parseUnit(mapWidth[j]))) {
                            mapWidth[j] = columnWidth;
                        }
                        if (element.colSpan === 1) {
                            mapBounds[j] = width;
                        }
                    }
                }
                if (!td.isEmpty() || td.inlineText) {
                    rowWidth[i] += width + horizontal;
                }
                if (spacingWidth) {
                    td.modifyBox(BOX_STANDARD.MARGIN_LEFT, j === 0 ? horizontal : spacingWidth);
                    td.modifyBox(BOX_STANDARD.MARGIN_RIGHT, index === 0 ? spacingWidth : horizontal);
                }
                if (spacingHeight) {
                    td.modifyBox(BOX_STANDARD.MARGIN_TOP, i === 0 ? vertical : spacingHeight);
                    td.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, i + rowSpan < rowCount ? spacingHeight : vertical);
                }
                this.data.set(td, { colSpan, rowSpan, flags: 0 } as TableCellData);
            });
            hideCell(tr);
            columnCount = Math.max(columnCount, row.length);
        }
        if (node.hasUnit('width', { percent: false }) && mapWidth.some(value => isPercent(value))) {
            replaceMap(mapWidth, (value, index) => {
                if (value === 'auto') {
                    const dimension = mapBounds[index];
                    if (dimension) {
                        return formatPX(dimension);
                    }
                }
                return value;
            });
        }
        if (mapWidth.every(value => isPercent(value))) {
            if (mapWidth.reduce((a, b) => a + convertPercent(b), 0) > 1) {
                let percentTotal = 1;
                replaceMap(mapWidth, value => {
                    const percent = convertPercent(value);
                    if (percentTotal <= 0) {
                        value = '0px';
                    }
                    else if (percentTotal - percent < 0) {
                        value = formatPercent(percentTotal);
                    }
                    percentTotal -= percent;
                    return value;
                });
            }
            if (!hasWidth) {
                mainData.flags |= LAYOUT_TABLE.EXPAND;
            }
            percentAll = true;
        }
        else if (mapWidth.every(value => isLength(value))) {
            if (hasWidth) {
                const columnWidth = mapWidth.map(value => value !== '0px' ? node.parseWidth(value, false) : 0);
                const width = columnWidth.reduce((a, b) => a + b, 0);
                if (width < node.width) {
                    for (let i = 0, length = mapWidth.length; i < length; ++i) {
                        const value = columnWidth[i];
                        if (value > 0) {
                            mapWidth[i] = formatPercent(columnWidth[i] / width);
                        }
                    }
                }
                else if (width > node.width) {
                    node.css('width', 'auto');
                    if (!layoutFixed) {
                        table.forEach(tr => tr.each(td => td.css('width', 'auto')));
                    }
                }
            }
            if (layoutFixed && !node.hasUnit('width')) {
                node.css('width', formatPX(node.bounds.width));
            }
        }
        mainData.layoutType = (() => {
            if (mapWidth.length > 1) {
                mapPercent = mapWidth.reduce((a, b) => a + convertPercent(b), 0);
                if (layoutFixed && mapWidth.reduce((a, b) => a + (b !== '0px' && isLength(b) ? node.parseWidth(b, false) : 0), 0) >= node.actualWidth) {
                    return LAYOUT_TABLETYPE.COMPRESS;
                }
                else if (mapWidth.length > 1 && mapWidth.some(value => isPercent(value)) || mapWidth.every(value => isLength(value) && value !== '0px')) {
                    return LAYOUT_TABLETYPE.VARIABLE;
                }
                const baseWidth = mapWidth[0];
                if (mapWidth.every(value => value === baseWidth)) {
                    if (node.find(td => td.tagName === 'TD' && td.hasHeight, { cascade: true })) {
                        mainData.flags |= LAYOUT_TABLE.EXPAND;
                        return LAYOUT_TABLETYPE.VARIABLE;
                    }
                    else if (baseWidth === 'auto') {
                        return hasWidth ? LAYOUT_TABLETYPE.VARIABLE : table.some(tr => tr.find(td => td.multiline)) ? LAYOUT_TABLETYPE.VARIABLE : LAYOUT_TABLETYPE.NONE;
                    }
                    else if (hasWidth) {
                        return LAYOUT_TABLETYPE.FIXED;
                    }
                    else if (baseWidth === '0px') {
                        return LAYOUT_TABLETYPE.NONE;
                    }
                }
                if (mapWidth.every(value => value === 'auto' || value !== '0px' && isLength(value, true))) {
                    if (!hasWidth) {
                        mainData.flags |= LAYOUT_TABLE.EXPAND;
                    }
                    return LAYOUT_TABLETYPE.STRETCH;
                }
            }
            return LAYOUT_TABLETYPE.NONE;
        })();
        node.clear();
        if (caption) {
            if (!caption.hasWidth) {
                if (caption.textElement) {
                    if (!caption.hasUnit('maxWidth')) {
                        caption.css('maxWidth', formatPX(caption.bounds.width));
                    }
                }
                else if (caption.bounds.width > Math.max(...rowWidth)) {
                    setBoundsWidth(caption);
                }
            }
            if (!caption.valueOf('textAlign')) {
                caption.css('textAlign', 'center');
            }
            this.data.set(caption, { colSpan: columnCount } as TableCellSpanData);
            if (!captionBottom) {
                caption.parent = node;
            }
        }
        for (let i = 0; i < rowCount; ++i) {
            const tr = tableFilled[i];
            const length = tr.length;
            for (let j = 0; j < length; ) {
                const td = tr[j];
                const cellData = this.data.get(td) as TableCellData;
                const columnWidth = mapWidth[j];
                let flags = cellData.flags;
                j += cellData.colSpan;
                if (flags & LAYOUT_TABLECELL.PLACED) {
                    continue;
                }
                if (columnWidth) {
                    switch (mainData.layoutType) {
                        case LAYOUT_TABLETYPE.NONE:
                            break;
                        case LAYOUT_TABLETYPE.VARIABLE:
                            if (columnWidth === 'auto') {
                                if (mapPercent >= 1) {
                                    setBoundsWidth(td);
                                    if (!hasWidth) {
                                        flags |= LAYOUT_TABLECELL.EXCEED;
                                    }
                                    flags |= LAYOUT_TABLECELL.DOWNSIZED;
                                }
                                else {
                                    setAutoWidth(node, td, cellData);
                                }
                            }
                            else if (isPercent(columnWidth)) {
                                if (percentAll) {
                                    cellData.percent = columnWidth;
                                    flags |= LAYOUT_TABLECELL.EXPAND;
                                }
                                else {
                                    setBoundsWidth(td);
                                }
                            }
                            else if (isLength(columnWidth)) {
                                if (td.bounds.width >= td.parseWidth(columnWidth)) {
                                    setBoundsWidth(td);
                                    flags |= LAYOUT_TABLECELL.SHRINK;
                                }
                                else if (layoutFixed) {
                                    setAutoWidth(node, td, cellData);
                                    flags |= LAYOUT_TABLECELL.DOWNSIZED;
                                }
                                else {
                                    setBoundsWidth(td);
                                    flags |= LAYOUT_TABLECELL.SHRINK;
                                }
                            }
                            else {
                                if (!td.hasUnit('width', { percent: false }) || td.percentWidth) {
                                    setBoundsWidth(td);
                                }
                                flags |= LAYOUT_TABLECELL.SHRINK;
                            }
                            break;
                        case LAYOUT_TABLETYPE.FIXED:
                            setAutoWidth(node, td, cellData);
                            break;
                        case LAYOUT_TABLETYPE.STRETCH:
                            if (columnWidth === 'auto') {
                                flags |= LAYOUT_TABLECELL.FLEXIBLE;
                            }
                            else {
                                if (layoutFixed) {
                                    flags |= LAYOUT_TABLECELL.DOWNSIZED;
                                }
                                else {
                                    setBoundsWidth(td);
                                }
                                flags |= LAYOUT_TABLECELL.SHRINK;
                            }
                            break;
                        case LAYOUT_TABLETYPE.COMPRESS:
                            if (!isLength(columnWidth)) {
                                td.hide();
                            }
                            break;
                    }
                }
                flags |= LAYOUT_TABLECELL.PLACED;
                cellData.flags = flags;
                td.parent = node;
            }
            if (length < columnCount) {
                const cellData = this.data.get(tr[length - 1]) as Undef<TableCellData>;
                if (cellData) {
                    cellData.spaceSpan = columnCount - length;
                }
            }
        }
        if (caption && captionBottom) {
            caption.parent = node;
        }
        if (borderCollapse) {
            let borderTop: Undef<StringMap>,
                borderRight: Undef<StringMap>,
                borderBottom: Undef<StringMap>,
                borderLeft: Undef<StringMap>,
                hideTop: Undef<boolean>,
                hideRight: Undef<boolean>,
                hideBottom: Undef<boolean>,
                hideLeft: Undef<boolean>;
            for (let i = 0; i < rowCount; ++i) {
                const tr = tableFilled[i];
                for (let j = 0; j < columnCount; ++j) {
                    const td = tr[j];
                    if (td && td.css('visibility') === 'visible') {
                        if (i === 0) {
                            if (td.borderTopWidth < node.borderTopWidth) {
                                td.cssApply(borderTop ||= node.cssAsObject('borderTopColor', 'borderTopStyle', 'borderTopWidth'));
                                td.unsetCache('borderTopWidth');
                            }
                            else {
                                hideTop = true;
                            }
                        }
                        if (i >= 0 && i < rowCount - 1) {
                            const next = tableFilled[i + 1][j];
                            if (next && next.css('visibility') === 'visible' && next !== td) {
                                if (td.borderBottomWidth > next.borderTopWidth) {
                                    next.css('borderTopWidth', '0px', true);
                                }
                                else {
                                    td.css('borderBottomWidth', '0px', true);
                                }
                            }
                        }
                        if (i === rowCount - 1) {
                            if (td.borderBottomWidth < node.borderBottomWidth) {
                                td.cssApply(borderBottom ||= node.cssAsObject('borderBottomColor', 'borderBottomStyle', 'borderBottomWidth'));
                                td.unsetCache('borderBottomWidth');
                            }
                            else {
                                hideBottom = true;
                            }
                        }
                        if (j === 0) {
                            if (td.borderLeftWidth < node.borderLeftWidth) {
                                td.cssApply(borderLeft ||= node.cssAsObject('borderLeftColor', 'borderLeftStyle', 'borderLeftWidth'));
                                td.unsetCache('borderLeftWidth');
                            }
                            else {
                                hideLeft = true;
                            }
                        }
                        if (j >= 0 && j < columnCount - 1) {
                            const next = tr[j + 1];
                            if (next && next.css('visibility') === 'visible' && next !== td) {
                                if (td.borderRightWidth >= next.borderLeftWidth) {
                                    next.css('borderLeftWidth', '0px', true);
                                }
                                else {
                                    td.css('borderRightWidth', '0px', true);
                                }
                            }
                        }
                        if (j === columnCount - 1) {
                            if (td.borderRightWidth < node.borderRightWidth) {
                                td.cssApply(borderRight ||= node.cssAsObject('borderRightColor', 'borderRightStyle', 'borderRightWidth'));
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
                }, true, true);
            }
        }
        mainData.rowCount = rowCount + (caption ? 1 : 0);
        mainData.columnCount = columnCount;
        this.data.set(node, mainData);
    }
}