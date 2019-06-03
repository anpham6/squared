import { TableData } from '../@types/extension';

import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

import { EXT_NAME, STRING_BASE } from '../lib/constant';
import { BOX_STANDARD, CSS_STANDARD } from '../lib/enumeration';

const $const = squared.lib.constant;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $math = squared.lib.math;
const $util = squared.lib.util;

const enum LAYOUT_TABLE {
    NONE = 0,
    STRETCH = 1,
    FIXED = 2,
    VARIABLE = 3,
    COMPRESS = 4
}
const REGEXP_BACKGROUND = /rgba\(0, 0, 0, 0\)|transparent/;

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
        const table: T[] = [];
        function setAutoWidth(td: T) {
            td.data(EXT_NAME.TABLE, 'percent', `${Math.round((td.bounds.width / node.box.width) * 100)}%`);
            td.data(EXT_NAME.TABLE, 'expand', true);
        }
        function inheritStyles(section: T[]) {
            if (section.length) {
                for (const item of section[0].cascade() as T[]) {
                    if (item.tagName === 'TH' || item.tagName === 'TD') {
                        item.inherit(section[0], 'styleMap');
                        item.unsetCache('visibleStyle');
                    }
                }
                $util.concatArray(table, section[0].children as T[]);
                for (const item of section) {
                    item.hide();
                }
            }
        }
        const setBoundsWidth = (td: T) => td.css($const.CSS.WIDTH, $css.formatPX(td.bounds.width), true);
        const thead: T[] = [];
        const tbody: T[] = [];
        const tfoot: T[] = [];
        node.each((item: T) => {
            switch (item.tagName) {
                case 'THEAD':
                    thead.push(item);
                    break;
                case 'TBODY':
                    tbody.push(item);
                    break;
                case 'TFOOT':
                    tfoot.push(item);
                    break;
            }
        });
        inheritStyles(thead);
        for (const section of tbody) {
            $util.concatArray(table, section.children as T[]);
            section.hide();
        }
        inheritStyles(tfoot);
        const [horizontal, vertical] = mainData.borderCollapse ? [0, 0] : $util.replaceMap<string, number>(node.css('borderSpacing').split(' '), (value, index) => node.parseUnit(value, index === 0 ? $const.CSS.WIDTH : $const.CSS.HEIGHT));
        const spacingWidth = horizontal > 1 ? Math.round(horizontal / 2) : horizontal;
        const spacingHeight = vertical > 1 ? Math.round(vertical / 2) : vertical;
        const colgroup = (<Element> node.element).querySelector('COLGROUP');
        const rowWidth: number[] = [];
        const mapBounds: number[] = [];
        const tableFilled: T[][] = [];
        const mapWidth: string[] = [];
        const rowCount = table.length;
        let columnIndex: number[] = new Array(rowCount).fill(0);
        let columnCount = 0;
        for (let i = 0; i < rowCount; i++) {
            const tr = table[i];
            rowWidth[i] = horizontal;
            tableFilled[i] = [];
            tr.each((td: T, j) => {
                const element = <HTMLTableCellElement> td.element;
                for (let k = 0; k < element.rowSpan - 1; k++)  {
                    const col = i + k + 1;
                    if (columnIndex[col] !== undefined) {
                        columnIndex[col] += element.colSpan;
                    }
                }
                if (!td.has($const.CSS.WIDTH)) {
                    const width = $dom.getNamedItem(element, $const.CSS.WIDTH);
                    if ($css.isPercent(width)) {
                        td.css($const.CSS.WIDTH, width);
                    }
                    else if ($util.isNumber(width)) {
                        td.css($const.CSS.WIDTH, $css.formatPX(parseFloat(width)));
                    }
                }
                if (!td.has($const.CSS.HEIGHT)) {
                    const height = $dom.getNamedItem(element, $const.CSS.HEIGHT);
                    if ($css.isPercent(height)) {
                        td.css($const.CSS.HEIGHT, height);
                    }
                    else if ($util.isNumber(height)) {
                        td.css($const.CSS.HEIGHT, $css.formatPX(parseFloat(height)));
                    }
                }
                if (!td.visibleStyle.backgroundImage && !td.visibleStyle.backgroundColor) {
                    if (colgroup) {
                        const style = $css.getStyle(colgroup.children[columnIndex[i]]);
                        if (style.backgroundImage && style.backgroundImage !== $const.CSS.NONE) {
                            td.css('backgroundImage', style.backgroundImage, true);
                        }
                        if (style.backgroundColor && !REGEXP_BACKGROUND.test(style.backgroundColor)) {
                            td.css('backgroundColor', style.backgroundColor, true);
                        }
                    }
                    else {
                        let value = $css.getInheritedStyle(element, 'backgroundImage', /none/, 'TABLE');
                        if (value !== '') {
                            td.css('backgroundImage', value, true);
                        }
                        value = $css.getInheritedStyle(element, 'backgroundColor', REGEXP_BACKGROUND, 'TABLE');
                        if (value !== '') {
                            td.css('backgroundColor', value, true);
                        }
                    }
                }
                switch (td.tagName) {
                    case 'TH': {
                        function setBorderStyle(attr: string) {
                            td.ascend(undefined, node).some(item => {
                                if (item.has(`${attr}Style`)) {
                                    td.css(`${attr}Style`, item.css(`${attr}Style`));
                                    td.css(`${attr}Color`, item.css(`${attr}Color`));
                                    td.css(`${attr}Width`, item.css(`${attr}Width`), true);
                                    td.css('border', 'inherit');
                                    return true;
                                }
                                return false;
                            });
                        }
                        if (!td.cssInitial('textAlign')) {
                            td.css('textAlign', td.css('textAlign'));
                        }
                        if (td.borderTopWidth === 0) {
                            setBorderStyle('borderTop');
                        }
                        if (td.borderRightWidth === 0) {
                            setBorderStyle('borderRight');
                        }
                        if (td.borderBottomWidth === 0) {
                            setBorderStyle('borderBottom');
                        }
                        if (td.borderLeftWidth === 0) {
                            setBorderStyle('borderLeft');
                        }
                    }
                    case 'TD':
                        if (!td.cssInitial('verticalAlign')) {
                            td.css('verticalAlign', $const.CSS.MIDDLE, true);
                        }
                        break;
                }
                const columnWidth = td.cssInitial($const.CSS.WIDTH);
                const m = columnIndex[i];
                const reevaluate = mapWidth[m] === undefined || mapWidth[m] === $const.CSS.AUTO;
                if (i === 0 || reevaluate || !mainData.layoutFixed) {
                    if (columnWidth === '' || columnWidth === $const.CSS.AUTO) {
                        if (mapWidth[m] === undefined) {
                            mapWidth[m] = columnWidth || $const.CSS.PX_0;
                            mapBounds[m] = 0;
                        }
                        else if (i === table.length - 1) {
                            if (reevaluate && mapBounds[m] === 0) {
                                mapBounds[m] = td.bounds.width;
                            }
                        }
                    }
                    else {
                        const length = $css.isLength(mapWidth[m]);
                        const percent = $css.isPercent(columnWidth);
                        if (reevaluate || td.bounds.width < mapBounds[m] || td.bounds.width === mapBounds[m] && (length && percent || percent && $css.isPercent(mapWidth[m]) && $util.convertFloat(columnWidth) > $util.convertFloat(mapWidth[m]) || length && $css.isLength(columnWidth) && $util.convertFloat(columnWidth) > $util.convertFloat(mapWidth[m]))) {
                            mapWidth[m] = columnWidth;
                        }
                        if (reevaluate || element.colSpan === 1) {
                            mapBounds[m] = td.bounds.width;
                        }
                    }
                }
                if (td.length || td.inlineText) {
                    rowWidth[i] += td.bounds.width + horizontal;
                }
                if (spacingWidth > 0) {
                    td.modifyBox(BOX_STANDARD.MARGIN_LEFT, columnIndex[i] === 0 ? horizontal : spacingWidth);
                    td.modifyBox(BOX_STANDARD.MARGIN_RIGHT, j === 0 ? spacingWidth : horizontal);
                }
                if (spacingHeight > 0) {
                    td.modifyBox(BOX_STANDARD.MARGIN_TOP, i === 0 ? vertical : spacingHeight);
                    td.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, i + element.rowSpan < table.length ? spacingHeight : vertical);
                }
                columnIndex[i] += element.colSpan;
            });
            columnCount = Math.max(columnCount, columnIndex[i]);
        }
        if (node.has($const.CSS.WIDTH, CSS_STANDARD.LENGTH) && mapWidth.some(value => $css.isPercent(value))) {
            $util.replaceMap<string, string>(mapWidth, (value, index) => {
                if (value === $const.CSS.AUTO && mapBounds[index] > 0) {
                    return $css.formatPX(mapBounds[index]);
                }
                return value;
            });
        }
        if (mapWidth.every(value => $css.isPercent(value)) && mapWidth.reduce((a, b) => a + parseFloat(b), 0) > 1) {
            let percentTotal = 100;
            $util.replaceMap<string, string>(mapWidth, value => {
                const percent = parseFloat(value);
                if (percentTotal <= 0) {
                    value = $const.CSS.PX_0;
                }
                else if (percentTotal - percent < 0) {
                    value = $css.formatPercent(percentTotal / 100);
                }
                percentTotal -= percent;
                return value;
            });
        }
        else if (mapWidth.every(value => $css.isLength(value))) {
            const width = mapWidth.reduce((a, b) => a + parseFloat(b), 0);
            if (node.hasWidth) {
                if (width < node.width) {
                    $util.replaceMap<string, string>(mapWidth, value => value !== $const.CSS.PX_0 ? `${(parseFloat(value) / width) * 100}%` : value);
                }
                else if (width > node.width) {
                    node.css($const.CSS.WIDTH, $const.CSS.AUTO, true);
                    if (!mainData.layoutFixed) {
                        for (const item of node.cascade()) {
                            item.css($const.CSS.WIDTH, $const.CSS.AUTO, true);
                        }
                    }
                }
            }
            if (mainData.layoutFixed && !node.has($const.CSS.WIDTH)) {
                node.css($const.CSS.WIDTH, $css.formatPX(node.bounds.width), true);
            }
        }
        const mapPercent = mapWidth.reduce((a, b) => a + ($css.isPercent(b) ? parseFloat(b) : 0), 0);
        mainData.layoutType = (() => {
            if (mainData.layoutFixed && mapWidth.reduce((a, b) => a + ($css.isLength(b) ? parseFloat(b) : 0), 0) >= node.actualWidth) {
                return LAYOUT_TABLE.COMPRESS;
            }
            else if (mapWidth.some(value => $css.isPercent(value)) || mapWidth.every(value => $css.isLength(value) && value !== $const.CSS.PX_0)) {
                return LAYOUT_TABLE.VARIABLE;
            }
            else if (mapWidth.every(value => value === mapWidth[0])) {
                if (node.cascadeSome(td => td.hasHeight)) {
                    mainData.expand = true;
                    return LAYOUT_TABLE.VARIABLE;
                }
                else if (mapWidth[0] === $const.CSS.AUTO) {
                    if (node.hasWidth) {
                        return LAYOUT_TABLE.VARIABLE;
                    }
                    else {
                        const td = node.cascade(item => item.tagName === 'TD');
                        if (td.length && td.every(item => $util.withinRange(item.bounds.width, td[0].bounds.width))) {
                            return LAYOUT_TABLE.NONE;
                        }
                        return LAYOUT_TABLE.VARIABLE;
                    }
                }
                else if (node.hasWidth) {
                    return LAYOUT_TABLE.FIXED;
                }
            }
            if (mapWidth.every(value => value === $const.CSS.AUTO || $css.isLength(value) && value !== $const.CSS.PX_0)) {
                if (!node.hasWidth) {
                    mainData.expand = true;
                }
                return LAYOUT_TABLE.STRETCH;
            }
            return LAYOUT_TABLE.NONE;
        })();
        const caption = node.find(item => item.tagName === 'CAPTION') as T | undefined;
        node.clear();
        if (caption) {
            if (!caption.hasWidth) {
                if (caption.textElement) {
                    if (!caption.has('maxWidth')) {
                        caption.css('maxWidth', $css.formatPX(caption.bounds.width));
                    }
                }
                else if (caption.bounds.width > $math.maxArray(rowWidth)) {
                    setBoundsWidth(caption);
                }
            }
            if (!caption.cssInitial('textAlign')) {
                caption.css('textAlign', $const.CSS.CENTER);
            }
            caption.data(EXT_NAME.TABLE, 'colSpan', columnCount);
            caption.parent = node;
        }
        columnIndex = new Array(table.length).fill(0);
        const hasWidth = node.hasWidth;
        for (let i = 0; i < table.length; i++) {
            const tr = table[i];
            const children = tr.duplicate();
            for (let j = 0; j < children.length; j++) {
                const td = children[j] as T;
                const element = <HTMLTableCellElement> td.element;
                const rowSpan = element.rowSpan;
                const colSpan = element.colSpan;
                for (let k = 0; k < rowSpan - 1; k++)  {
                    const l = (i + 1) + k;
                    if (columnIndex[l] !== undefined) {
                        columnIndex[l] += colSpan;
                    }
                }
                if (rowSpan > 1) {
                    td.data(EXT_NAME.TABLE, 'rowSpan', rowSpan);
                }
                if (colSpan > 1) {
                    td.data(EXT_NAME.TABLE, 'colSpan', colSpan);
                }
                if (!td.has('verticalAlign')) {
                    td.css('verticalAlign', $const.CSS.MIDDLE);
                }
                const columnWidth = mapWidth[columnIndex[i]];
                if (columnWidth !== undefined) {
                    switch (mainData.layoutType) {
                        case LAYOUT_TABLE.VARIABLE:
                            if (columnWidth === $const.CSS.AUTO) {
                                if (mapPercent >= 1) {
                                    setBoundsWidth(td);
                                    td.data(EXT_NAME.TABLE, 'exceed', !hasWidth);
                                    td.data(EXT_NAME.TABLE, 'downsized', true);
                                }
                                else {
                                    setAutoWidth(td);
                                }
                            }
                            else if ($css.isPercent(columnWidth)) {
                                td.data(EXT_NAME.TABLE, 'percent', columnWidth);
                                td.data(EXT_NAME.TABLE, 'expand', true);
                            }
                            else if ($css.isLength(columnWidth) && parseInt(columnWidth) > 0) {
                                if (td.bounds.width >= parseInt(columnWidth)) {
                                    setBoundsWidth(td);
                                    td.data(EXT_NAME.TABLE, 'expand', false);
                                    td.data(EXT_NAME.TABLE, 'downsized', false);
                                }
                                else {
                                    if (mainData.layoutFixed) {
                                        setAutoWidth(td);
                                        td.data(EXT_NAME.TABLE, 'downsized', true);
                                    }
                                    else {
                                        setBoundsWidth(td);
                                        td.data(EXT_NAME.TABLE, 'expand', false);
                                    }
                                }
                            }
                            else {
                                if (!td.has($const.CSS.WIDTH) || td.percentWidth) {
                                    setBoundsWidth(td);
                                }
                                td.data(EXT_NAME.TABLE, 'expand', false);
                            }
                            break;
                        case LAYOUT_TABLE.FIXED:
                            td.css($const.CSS.WIDTH, $const.CSS.PX_0);
                            break;
                        case LAYOUT_TABLE.STRETCH:
                            if (columnWidth === $const.CSS.AUTO) {
                                td.css($const.CSS.WIDTH, $const.CSS.PX_0);
                            }
                            else {
                                if (mainData.layoutFixed) {
                                    td.data(EXT_NAME.TABLE, 'downsized', true);
                                }
                                else {
                                    setBoundsWidth(td);
                                }
                                td.data(EXT_NAME.TABLE, 'expand', false);
                            }
                            break;
                        case LAYOUT_TABLE.COMPRESS:
                            if (!$css.isLength(columnWidth)) {
                                td.hide();
                            }
                            break;

                    }
                }
                columnIndex[i] += colSpan;
                for (let k = 0; k < rowSpan; k++) {
                    for (let l = 0; l < colSpan; l++) {
                        tableFilled[i + k].push(td);
                    }
                }
                td.parent = node;
            }
            if (columnIndex[i] < columnCount) {
                const td = children[children.length - 1];
                td.data(EXT_NAME.TABLE, 'spaceSpan', columnCount - columnIndex[i]);
            }
            tr.hide();
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
                    if (td && td.css('visibility') === 'visible') {
                        if (i === 0) {
                            if (td.borderTopWidth < parseInt(borderTopWidth)) {
                                td.cssApply({
                                    borderTopColor,
                                    borderTopStyle,
                                    borderTopWidth
                                });
                            }
                            else {
                                hideTop = true;
                            }
                        }
                        if (i >= 0 && i < rowCount - 1) {
                            const next = tableFilled[i + 1][j];
                            if (next && next !== td && next.css('visibility') === 'visible') {
                                if (td.borderBottomWidth >= next.borderTopWidth) {
                                    next.css('borderTopWidth', $const.CSS.PX_0, true);
                                }
                                else {
                                    td.css('borderBottomWidth', $const.CSS.PX_0, true);
                                }
                            }
                        }
                        if (i === rowCount - 1) {
                            if (td.borderBottomWidth < parseInt(borderBottomWidth)) {
                                td.cssApply({
                                    borderBottomColor,
                                    borderBottomStyle,
                                    borderBottomWidth
                                });
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
                                });
                            }
                            else {
                                hideLeft = true;
                            }
                        }
                        if (j >= 0 && j < columnCount - 1) {
                            const next = tableFilled[i][j + 1];
                            if (next && next !== td && next.css('visibility') === 'visible') {
                                if (td.borderRightWidth >= next.borderLeftWidth) {
                                    next.css('borderLeftWidth', $const.CSS.PX_0, true);
                                }
                                else {
                                    td.css('borderRightWidth', $const.CSS.PX_0, true);
                                }
                            }
                        }
                        if (j === columnCount - 1) {
                            if (td.borderRightWidth < parseInt(borderRightWidth)) {
                                td.cssApply({
                                    borderRightColor,
                                    borderRightStyle,
                                    borderRightWidth
                                });
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
                    borderTopWidth: $const.CSS.PX_0,
                    borderRightWidth: $const.CSS.PX_0,
                    borderBottomWidth: $const.CSS.PX_0,
                    borderLeftWidth: $const.CSS.PX_0
                }, true);
            }
        }
        mainData.rowCount = rowCount;
        mainData.columnCount = columnCount;
        node.data(EXT_NAME.TABLE, STRING_BASE.EXT_DATA, mainData);
        return undefined;
    }
}