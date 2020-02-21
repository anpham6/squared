import { NodeXmlTemplate } from '../../../@types/base/application';
import { ColumnData } from '../../../@types/base/extension';

import View from '../view';

import { CONTAINER_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';

const $lib = squared.lib;
const $base_lib = squared.base.lib;

const { formatPX } = $lib.css;
const { createElement } = $lib.dom;
const { maxArray, truncate } = $lib.math;
const { safeNestedArray } = $lib.util;

const { APP_SECTION, BOX_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE, NODE_TEMPLATE } = $base_lib.enumeration;

const COLUMN = $base_lib.constant.EXT_NAME.COLUMN;

export default class <T extends View> extends squared.base.extensions.Column<T> {
    public processNode(node: T, parent: T) {
        super.processNode(node, parent);
        node.containerType = CONTAINER_NODE.CONSTRAINT;
        node.addAlign(NODE_ALIGNMENT.AUTO_LAYOUT);
        return {
            complete: true,
            subscribe: true
        };
    }

    public postBaseLayout(node: T) {
        const mainData = <ColumnData<T>> node.data(COLUMN, 'mainData');
        if (mainData) {
            const { columnCount, columnGap, columnWidth, columnRule, columnSized, boxWidth, rows, multiline } = mainData;
            const application = this.application;
            const controller = <android.base.Controller<T>> this.controller;
            const { borderLeftWidth, borderLeftColor, borderLeftStyle } = columnRule;
            const dividerWidth = node.parseUnit(borderLeftWidth);
            const displayBorder = borderLeftStyle !== 'none' && dividerWidth > 0;
            const createColumnRule = () => {
                const divider = application.createNode({ parent: node, append: true });
                divider.inherit(node, 'base');
                divider.containerName = node.containerName + '_COLUMNRULE';
                divider.setControlType(CONTAINER_ANDROID.LINE, CONTAINER_NODE.LINE);
                divider.exclude({ resource: NODE_RESOURCE.ASSET, procedure: NODE_PROCEDURE.ALL });
                let width: string;
                if (displayBorder) {
                    width = formatPX(dividerWidth);
                    divider.cssApply({
                        width,
                        paddingLeft: width,
                        borderLeftStyle,
                        borderLeftWidth,
                        borderLeftColor,
                        boxSizing: 'border-box',
                        display: 'inline-block'
                    });
                }
                else {
                    width = formatPX(columnGap);
                    divider.cssApply({ width, display: 'inline-block' });
                }
                divider.saveAsInitial();
                divider.setLayoutWidth(width);
                divider.setLayoutHeight('0px');
                divider.render(node);
                divider.renderExclude = false;
                application.addLayoutTemplate(
                    node,
                    divider,
                    <NodeXmlTemplate<T>> {
                        type: NODE_TEMPLATE.XML,
                        node: divider,
                        controlName: divider.controlName
                    }
                );
                return divider;
            };
            let previousRow: Undef<T | string>;
            const length = rows.length;
            for (let i = 0; i < length; i++) {
                const row = rows[i];
                const q = row.length;
                if (q === 1) {
                    const item = row[0];
                    if (i === 0) {
                        item.anchor('top', 'parent');
                        item.anchorStyle('vertical', 0);
                    }
                    else if (previousRow) {
                        previousRow.anchor('bottomTop', item.documentId);
                        item.anchor('topBottom', typeof previousRow === 'string' ? previousRow : previousRow.documentId);
                    }
                    if (i === length - 1) {
                        item.anchor('bottom', 'parent');
                    }
                    else {
                        previousRow = row[0];
                    }
                    item.anchorParent('horizontal', item.rightAligned ? 1 : (item.centerAligned ? 0.5 : 0));
                    item.exclude({ section: APP_SECTION.EXTENSION });
                    item.anchored = true;
                    item.positioned = true;
                }
                else {
                    const columns: T[][] = [];
                    let columnMin = Math.min(q, columnSized, columnCount || Number.POSITIVE_INFINITY);
                    let percentGap = 0;
                    if (columnMin > 1) {
                        const maxHeight = Math.floor(row.reduce((a, b) => a + b.bounds.height, 0) / columnMin);
                        let perRowCount = q >= columnMin ? Math.ceil(q / columnMin) : 1;
                        let rowReduce = multiline || perRowCount > 1 && (q % perRowCount !== 0 || !isNaN(columnCount) && perRowCount * columnCount % q > 1);
                        let excessCount = rowReduce && q % columnMin !== 0 ? q - columnMin : Number.POSITIVE_INFINITY;
                        let totalGap = 0;
                        for (let j = 0, k = 0, l = 0; j < q; j++, l++) {
                            const item = row[j];
                            const iteration = l % perRowCount === 0;
                            if (k < columnMin - 1 && (iteration || excessCount <= 0 || j > 0 && (row[j - 1].bounds.height >= maxHeight || columns[k].length && j < q - 2 && (q - j + 1 === columnMin - k) && row[j - 1].bounds.height > row[j + 1].bounds.height))) {
                                if (j > 0) {
                                    k++;
                                    if (iteration) {
                                        excessCount--;
                                    }
                                    else {
                                        excessCount++;
                                    }
                                }
                                l = 0;
                                if (!iteration && excessCount > 0) {
                                    rowReduce = true;
                                }
                            }
                            const column = safeNestedArray(columns, k);
                            column.push(item);
                            if (item.length) {
                                totalGap += maxArray(item.map(child => child.marginLeft + child.marginRight));
                            }
                            if (j > 0 && /^H\d/.test(item.tagName)) {
                                if (column.length === 1 && j === q - 2) {
                                    columnMin--;
                                    excessCount = 0;
                                }
                                else if ((l + 1) % perRowCount === 0 && q - j > columnMin && !row[j + 1].multiline && row[j + 1].bounds.height < maxHeight) {
                                    column.push(row[++j]);
                                    l = -1;
                                }
                            }
                            else if (rowReduce && q - j === columnMin - k && excessCount !== Number.POSITIVE_INFINITY) {
                                perRowCount = 1;
                            }
                        }
                        percentGap = columnMin > 1 ? Math.max(((totalGap + (columnGap * (columnMin - 1))) / boxWidth) / columnMin, 0.01) : 0;
                    }
                    else {
                        columns.push(row);
                    }
                    const r = columns.length;
                    const above: T[] = new Array(r);
                    for (let j = 0; j < r; j++) {
                        const data = columns[j];
                        for (const item of data) {
                            item.app('layout_constraintWidth_percent', truncate((1 / columnMin) - percentGap, node.localSettings.floatPrecision));
                            item.setLayoutWidth('0px');
                            item.anchored = true;
                            item.positioned = true;
                            item.modifyBox(BOX_STANDARD.MARGIN_RIGHT);
                            item.exclude({ section: APP_SECTION.EXTENSION });
                        }
                        above[j] = data[0];
                    }
                    for (let j = 0; j < r; j++) {
                        const item = columns[j];
                        if (j < r - 1 && item.length > 1) {
                            const columnEnd = item[item.length - 1];
                            if (/^H\d/.test(columnEnd.tagName)) {
                                item.pop();
                                const k = j + 1;
                                above[k] = columnEnd;
                                columns[k].unshift(columnEnd);
                            }
                        }
                    }
                    for (let j = 0; j < r; j++) {
                        const item = above[j];
                        if (j === 0) {
                            item.anchor('left', 'parent');
                            item.anchorStyle('horizontal', 0, 'spread_inside');
                        }
                        else {
                            const previous = above[j - 1];
                            item.anchor('leftRight', previous.documentId);
                            item.modifyBox(BOX_STANDARD.MARGIN_LEFT, columnGap);
                        }
                        if (j === r - 1) {
                            item.anchor('right', 'parent');
                        }
                        else {
                            item.anchor('rightLeft', above[j + 1].documentId);
                        }
                    }
                    let barrierTop: Undef<string>;
                    if (i > 0) {
                        barrierTop = controller.addBarrier(above, 'top');
                        if (typeof previousRow === 'object') {
                            previousRow.anchor('bottomTop', barrierTop);
                        }
                    }
                    const dividers: T[] = [];
                    for (let j = 0; j < r; j++) {
                        const seg = columns[j];
                        const s = seg.length;
                        const anchorTop = above[1].documentId;
                        for (let k = 0; k < s; k++) {
                            const item = seg[k];
                            if (k === 0) {
                                if (j > 0) {
                                    const divider = createColumnRule();
                                    divider.anchor('top', anchorTop);
                                    divider.anchor('left', columns[j - 1][0].documentId);
                                    divider.anchor('right', item.documentId);
                                    dividers.push(divider);
                                }
                                if (i === 0) {
                                    item.anchor('top', 'parent');
                                }
                                else {
                                    if (typeof previousRow === 'string') {
                                        item.anchor('top', previousRow);
                                    }
                                    else if (barrierTop) {
                                        item.anchor('top', barrierTop);
                                    }
                                }
                                if (j > 0) {
                                    item.modifyBox(BOX_STANDARD.MARGIN_TOP);
                                }
                                item.anchorStyle('vertical', 0);
                            }
                            else {
                                const previous = seg[k - 1];
                                previous.anchor('bottomTop', item.documentId);
                                item.anchor('topBottom', previous.documentId);
                                item.anchor('left', seg[0].documentId);
                                item.app('layout_constraintVertical_bias', '0');
                            }
                            if (k === s - 1) {
                                if (i === length - 1) {
                                    item.anchor('bottom', 'parent');
                                }
                                item.modifyBox(BOX_STANDARD.MARGIN_BOTTOM);
                            }
                        }
                    }
                    if (i < length - 1) {
                        if (columns.every(item => item.length === 1)) {
                            const barrier: T[] = [];
                            for (const item of columns) {
                                barrier.push(item[0]);
                            }
                            previousRow = controller.addBarrier(barrier, 'bottom');
                            for (const item of barrier) {
                                item.anchor('bottomTop', previousRow);
                            }
                            for (const item of dividers) {
                                item.anchor('bottom', previousRow);
                            }
                        }
                        else {
                            const columnHeight: number[] = new Array(r);
                            for (let j = 0; j < r; j++) {
                                const seg = columns[j];
                                const elements: Element[] = [];
                                let height = 0;
                                const s = seg.length;
                                for (let k = 0; k < s; k++) {
                                    const column = seg[k];
                                    if (column.naturalChild) {
                                        elements.push(<Element> (<Element> column.element).cloneNode(true));
                                    }
                                    else {
                                        height += column.linear.height;
                                    }
                                }
                                if (elements.length) {
                                    const container = createElement(document.body, 'div', { width: formatPX(columnWidth || node.box.width / columnMin), visibility: 'hidden' });
                                    for (const element of elements) {
                                        container.appendChild(element);
                                    }
                                    height += container.getBoundingClientRect().height;
                                    document.body.removeChild(container);
                                }
                                columnHeight[j] = height;
                            }
                            let maxHeight = 0;
                            for (let j = 0; j < r; j++) {
                                const value = columnHeight[j];
                                if (value >= maxHeight) {
                                    previousRow = columns[j].pop();
                                    maxHeight = value;
                                }
                            }
                            for (const item of dividers) {
                                item.anchor('bottom', (previousRow as T).documentId);
                            }
                        }
                    }
                    else {
                        for (const item of dividers) {
                            item.anchor('bottom', 'parent');
                        }
                    }
                }
            }
        }
    }
}