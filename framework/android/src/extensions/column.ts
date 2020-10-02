import BOX_STANDARD = squared.base.lib.constant.BOX_STANDARD;
import NODE_ALIGNMENT = squared.base.lib.constant.NODE_ALIGNMENT;
import NODE_TEMPLATE = squared.base.lib.constant.NODE_TEMPLATE;

import { CONTAINER_NODE, CONTAINER_TAGNAME } from '../lib/constant';

import type View from '../view';

const { APP_SECTION, NODE_PROCEDURE, NODE_RESOURCE } = squared.base.lib.constant;

const { formatPX } = squared.lib.css;
const { createElement } = squared.lib.dom;
const { truncate } = squared.lib.math;

export default class <T extends View> extends squared.base.extensions.Column<T> {
    public processNode(node: T, parent: T) {
        super.processNode(node, parent);
        node.containerType = CONTAINER_NODE.CONSTRAINT;
        node.addAlign(NODE_ALIGNMENT.AUTO_LAYOUT);
        node.addAlign(NODE_ALIGNMENT.COLUMN);
        return {
            complete: true,
            subscribe: true
        };
    }

    public postBaseLayout(node: T) {
        const mainData = this.data.get(node) as Undef<ColumnData<T>>;
        if (mainData) {
            const application = this.application;
            const { columnCount, columnGap, columnWidth, columnRule, columnSized, boxWidth, rows, multiline } = mainData;
            const { borderLeftWidth, borderLeftColor, borderLeftStyle } = columnRule;
            const createColumnRule = () => {
                const rule = application.createNode(node.sessionId, { parent: node, append: true });
                rule.containerName = node.containerName + '_COLUMNRULE';
                rule.inherit(node, 'base');
                rule.setControlType(CONTAINER_TAGNAME.LINE, CONTAINER_NODE.LINE);
                rule.exclude({ resource: NODE_RESOURCE.ASSET, procedure: NODE_PROCEDURE.ALL });
                let width: string;
                if (borderLeftWidth) {
                    width = formatPX(borderLeftWidth);
                    rule.cssApply({
                        width,
                        paddingLeft: width,
                        borderLeftStyle,
                        borderLeftWidth: width,
                        borderLeftColor,
                        lineHeight: 'inherit',
                        boxSizing: 'border-box',
                        display: 'inline-block'
                    });
                }
                else {
                    width = formatPX(columnGap);
                    rule.cssApply({ width, lineHeight: 'inherit', display: 'inline-block' });
                }
                rule.saveAsInitial();
                rule.setLayoutWidth(width);
                rule.setLayoutHeight('0px');
                rule.render(node);
                rule.positioned = true;
                rule.renderExclude = false;
                application.addLayoutTemplate(
                    node,
                    rule,
                    {
                        type: NODE_TEMPLATE.XML,
                        node: rule,
                        controlName: rule.controlName
                    } as NodeXmlTemplate<T>
                );
                return rule;
            };
            let previousRow!: T;
            for (let i = 0, length = rows.length; i < length; ++i) {
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
                    if (!item.isEmpty()) {
                        item.box.width = Math.max(boxWidth, item.box.width);
                    }
                    item.anchorParent('horizontal', item.centerAligned ? 0.5 : item.rightAligned ? 1 : 0);
                    item.anchored = true;
                    item.positioned = true;
                }
                else {
                    const columns: T[][] = [];
                    let columnMin = Math.min(q, columnSized, columnCount || Infinity),
                        percentGap = 0;
                    if (columnMin > 1) {
                        const maxHeight = Math.floor(row.reduce((a, b) => a + b.bounds.height, 0) / columnMin);
                        let perRowCount = q >= columnMin ? Math.ceil(q / columnMin) : 1,
                            rowReduce = multiline || perRowCount > 1 && (q % perRowCount !== 0 || !isNaN(columnCount) && perRowCount * columnCount % q > 1),
                            excessCount = rowReduce && q % columnMin !== 0 ? q - columnMin : Infinity;
                        for (let j = 0, k = 0, l = 0; j < q; ++j, ++l) {
                            const item = row[j];
                            const iteration = l % perRowCount === 0;
                            if (k < columnMin - 1 && (iteration || excessCount <= 0 || j && !item.contentAltered && (row[j - 1].bounds.height >= maxHeight || columns[k].length && j < q - 2 && (q - j + 1 === columnMin - k) && row[j - 1].bounds.height > row[j + 1].bounds.height))) {
                                if (j > 0) {
                                    ++k;
                                    if (iteration) {
                                        --excessCount;
                                    }
                                    else {
                                        ++excessCount;
                                    }
                                }
                                l = 0;
                                if (!iteration && excessCount > 0) {
                                    rowReduce = true;
                                }
                            }
                            const column = columns[k] ||= [];
                            column.push(item);
                            if (j > 0 && /^H\d/.test(item.tagName)) {
                                if (column.length === 1 && j === q - 2) {
                                    --columnMin;
                                    excessCount = 0;
                                }
                                else if ((l + 1) % perRowCount === 0 && q - j > columnMin && !row[j + 1].multiline && row[j + 1].bounds.height < maxHeight) {
                                    column.push(row[++j]);
                                    l = -1;
                                }
                            }
                            else if (rowReduce && q - j === columnMin - k && excessCount !== Infinity) {
                                perRowCount = 1;
                            }
                        }
                        percentGap = columnMin > 1 ? Math.max(((columnGap * (columnMin - 1)) / boxWidth) / columnMin, 0.01) : 0;
                    }
                    else {
                        columns.push(row);
                    }
                    const r = columns.length;
                    const above: T[] = new Array(r);
                    for (let j = 0; j < r; ++j) {
                        const data = columns[j];
                        for (let k = 0, s = data.length; k < s; ++k) {
                            const item = data[k];
                            const percent = (1 / columnMin) - percentGap;
                            item.app('layout_constraintWidth_percent', truncate(percent, node.localSettings.floatPrecision));
                            item.setLayoutWidth('0px');
                            item.setBox(BOX_STANDARD.MARGIN_RIGHT, { reset: 1 });
                            item.exclude({ section: APP_SECTION.EXTENSION });
                            item.box.width = percent * boxWidth;
                            item.anchored = true;
                            item.positioned = true;
                        }
                        above[j] = data[0];
                    }
                    for (let j = 0; j < r; ++j) {
                        const items = columns[j];
                        if (j < r - 1 && items.length > 1) {
                            const columnEnd = items[items.length - 1];
                            if (/^H\d/.test(columnEnd.tagName)) {
                                --items.length;
                                above[j + 1] = columnEnd;
                                columns[j + 1].unshift(columnEnd);
                            }
                        }
                    }
                    const columnHeight: number[] = new Array(r);
                    for (let j = 0; j < r; ++j) {
                        const seg = columns[j];
                        const elements: Element[] = [];
                        let height = 0;
                        for (let k = 0, s = seg.length; k < s; ++k) {
                            const column = seg[k];
                            if (column.naturalChild) {
                                const element = column.element!.cloneNode(true) as HTMLElement;
                                if (column.styleElement) {
                                    const style = element.style;
                                    if (column.imageContainer || column.find((item: T) => item.imageContainer, { cascade: true })) {
                                        style.height = formatPX(column.bounds.height);
                                    }
                                    else {
                                        const textStyle = column.textStyle;
                                        style.fontSize = column.fontSize + 'px';
                                        for (const attr in textStyle) {
                                            style[attr] = textStyle[attr];
                                        }
                                    }
                                }
                                elements.push(element);
                            }
                            else {
                                height += column.linear.height;
                            }
                        }
                        const s = elements.length;
                        if (s) {
                            const container = createElement('div', {
                                parent: document.body,
                                style: {
                                    width: formatPX(columnWidth || node.box.width / columnMin),
                                    visibility: 'hidden'
                                }
                            });
                            for (let k = 0; k < s; ++k) {
                                container.appendChild(elements[k]);
                            }
                            height += container.getBoundingClientRect().height;
                            document.body.removeChild(container);
                        }
                        columnHeight[j] = height;
                    }
                    let anchorTop!: T,
                        anchorBottom!: T,
                        maxHeight = 0;
                    for (let j = 0; j < r; ++j) {
                        const value = columnHeight[j];
                        if (value >= maxHeight) {
                            const column = columns[j];
                            anchorTop = column[0];
                            anchorBottom = column[column.length - 1];
                            maxHeight = value;
                        }
                    }
                    for (let j = 0; j < r; ++j) {
                        const item = above[j];
                        if (j === 0) {
                            item.anchor('left', 'parent');
                            item.anchorStyle('horizontal', 0, 'packed');
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
                    const rules: T[] = [];
                    for (let j = 0; j < r; ++j) {
                        const seg = columns[j];
                        for (let k = 0, s = seg.length; k < s; ++k) {
                            const item = seg[k];
                            if (k === 0) {
                                if (j > 0) {
                                    const rule = createColumnRule();
                                    rule.anchor('top', anchorTop.documentId);
                                    rule.anchor('left', columns[j - 1][0].documentId);
                                    rule.anchor('right', item.documentId);
                                    rules.push(rule);
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
                                item.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1 });
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
                    for (let j = 0, s = rules.length; j < s; ++j) {
                        rules[j].anchor('bottom', documentId);
                    }
                    previousRow = anchorBottom;
                }
            }
        }
    }
}