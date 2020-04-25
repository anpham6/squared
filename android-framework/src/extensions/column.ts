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
            const application = this.application;
            const { columnCount, columnGap, columnWidth, columnRule, columnSized, boxWidth, rows, multiline } = mainData;
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
                        lineHeight: 'initial',
                        boxSizing: 'border-box',
                        display: 'inline-block'
                    });
                }
                else {
                    width = formatPX(columnGap);
                    divider.cssApply({ width, lineHeight: 'initial', display: 'inline-block' });
                }
                divider.saveAsInitial();
                divider.setLayoutWidth(width);
                divider.setLayoutHeight('0px');
                divider.render(node);
                divider.positioned = true;
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
            let previousRow!: T;
            const length = rows.length;
            for (let i = 0; i < length; ++i) {
                const row = rows[i];
                const q = row.length;
                if (q === 1) {
                    const item = row[0];
                    if (i === 0) {
                        item.anchor('top', 'parent');
                        item.anchorStyle('vertical', 0, 'packed');
                    }
                    else {
                        previousRow.anchor('bottomTop', item.documentId);
                        item.anchor('topBottom', previousRow.documentId);
                    }
                    if (i === length - 1) {
                        item.anchor('bottom', 'parent');
                    }
                    else {
                        previousRow = row[0];
                    }
                    item.anchorParent('horizontal', item.rightAligned ? 1 : (item.centerAligned ? 0.5 : 0));
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
                        for (let j = 0, k = 0, l = 0; j < q; ++j, ++l) {
                            const item = row[j];
                            const iteration = l % perRowCount === 0;
                            if (k < columnMin - 1 && (iteration || excessCount <= 0 || j > 0 && (row[j - 1].bounds.height >= maxHeight || columns[k].length && j < q - 2 && (q - j + 1 === columnMin - k) && row[j - 1].bounds.height > row[j + 1].bounds.height))) {
                                if (j > 0) {
                                    ++k;
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
                    let j = 0;
                    while (j < r) {
                        const data = columns[j];
                        data.forEach(item => {
                            item.app('layout_constraintWidth_percent', truncate((1 / columnMin) - percentGap, node.localSettings.floatPrecision));
                            item.setLayoutWidth('0px');
                            item.setBox(BOX_STANDARD.MARGIN_RIGHT, { reset: 1 });
                            item.exclude({ section: APP_SECTION.EXTENSION });
                            item.anchored = true;
                            item.positioned = true;
                        });
                        above[j++] = data[0];
                    }
                    for (j = 0; j < r; ++j) {
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
                    const columnHeight: number[] = new Array(r);
                    j = 0;
                    while (j < r) {
                        const seg = columns[j];
                        const elements: Element[] = [];
                        let height = 0;
                        const s = seg.length;
                        let k = 0;
                        while (k < s) {
                            const column = seg[k++];
                            if (column.naturalChild) {
                                const element = <HTMLElement> (<Element> column.element).cloneNode(true);
                                if (column.styleElement) {
                                    if (column.imageOrSvgElement) {
                                        element.style.height = formatPX(column.bounds.height);
                                    }
                                    else {
                                        const textStyle = column.textStyle;
                                        for (const attr in textStyle) {
                                            element.style[attr] = textStyle[attr];
                                        }
                                    }
                                }
                                elements.push(element);
                            }
                            else {
                                height += column.linear.height;
                            }
                        }
                        if (elements.length) {
                            const container = createElement(document.body, 'div', { width: formatPX(columnWidth || node.box.width / columnMin), visibility: 'hidden' });
                            elements.forEach(element => container.appendChild(element));
                            height += container.getBoundingClientRect().height;
                            document.body.removeChild(container);
                        }
                        columnHeight[j++] = height;
                    }
                    let anchorTop!: T, anchorBottom!: T;
                    let maxHeight = 0;
                    for (j = 0; j < r; ++j) {
                        const value = columnHeight[j];
                        if (value >= maxHeight) {
                            const column = columns[j];
                            anchorTop = column[0];
                            anchorBottom = column[column.length - 1];
                            maxHeight = value;
                        }
                    }
                    for (j = 0; j < r; ++j) {
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
                    const dividers: T[] = [];
                    for (j = 0; j < r; ++j) {
                        const seg = columns[j];
                        const s = seg.length;
                        for (let k = 0; k < s; ++k) {
                            const item = seg[k];
                            if (k === 0) {
                                if (j > 0) {
                                    const divider = createColumnRule();
                                    divider.anchor('top', anchorTop.documentId);
                                    divider.anchor('left', columns[j - 1][0].documentId);
                                    divider.anchor('right', item.documentId);
                                    dividers.push(divider);
                                }
                                if (i === 0) {
                                    item.anchor('top', 'parent');
                                }
                                else if (item !== anchorTop) {
                                    item.anchor('top', anchorTop.documentId);
                                }
                                else {
                                    previousRow.anchor('bottomTop', item.documentId);
                                    item.anchor('topBottom', previousRow.documentId);
                                }
                                item.anchorStyle('vertical', 0, 'packed');
                                item.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1});
                            }
                            else {
                                const previous = seg[k - 1];
                                previous.anchor('bottomTop', item.documentId);
                                item.anchor('topBottom', previous.documentId);
                                item.app('layout_constraintVertical_bias', '0');
                                item.anchor('left', seg[0].documentId);
                            }
                            if (k === s - 1) {
                                if (i === length - 1) {
                                    item.anchor('bottom', 'parent');
                                }
                                item.setBox(BOX_STANDARD.MARGIN_BOTTOM, { reset: 1 });
                            }
                        }
                    }
                    const documentId = i < length - 1 ? anchorBottom.documentId : 'parent';
                    dividers.forEach(item => item.anchor('bottom', documentId));
                    previousRow = anchorBottom;
                }
            }
        }
    }
}