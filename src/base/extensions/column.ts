import type NodeUI from '../node-ui';

import ExtensionUI from '../extension-ui';

const { isLength } = squared.lib.css;
const { safeFloat } = squared.lib.util;

export default abstract class Column<T extends NodeUI> extends ExtensionUI<T> {
    public is(node: T) {
        return node.size() > 1 && (node.blockDimension && node.display !== 'table') && !node.layoutElement;
    }

    public condition(node: T) {
        return node.has('columnCount') || node.hasUnit('columnWidth');
    }

    public processNode(node: T, parent: T) {
        let items: T[] = [],
            maxSize = Infinity,
            multiline = false;
        const rows: T[][] = [items];
        node.each((item: T) => {
            if (item.valueOf('columnSpan') === 'all') {
                if (items.length) {
                    rows.push([item]);
                }
                else {
                    items.push(item);
                }
                items = [];
                rows.push(items);
            }
            else {
                if (item.textElement && item.textBounds?.overflow) {
                    maxSize = NaN;
                }
                if (item.multiline) {
                    multiline = true;
                }
                else if (!isNaN(maxSize)) {
                    maxSize = Math.min(item.bounds.width, maxSize);
                }
                items.push(item);
            }
        });
        if (items.length === 0) {
            --rows.length;
        }
        const [borderLeftStyle, borderLeftWidth, borderLeftColor] = node.cssAsTuple('columnRuleStyle', 'columnRuleWidth', 'columnRuleColor');
        const boxWidth = node.box.width;
        const columnCount = node.toInt('columnCount');
        const columnWidth = node.cssUnit('columnWidth');
        let columnGap = node.cssUnit('columnGap'),
            columnSized: number;
        const getColumnSizing = () => isNaN(columnCount) && columnWidth > 0 ? boxWidth / (columnWidth + columnGap) : Infinity;
        if (columnGap) {
            columnSized = Math.floor(getColumnSizing());
        }
        else {
            columnGap = (columnWidth && !isNaN(maxSize) && maxSize !== Infinity ? Math.max(maxSize - columnWidth, 0) : 0) + 16;
            columnSized = Math.ceil(getColumnSizing());
        }
        this.data.set(node, {
            rows,
            columnCount,
            columnWidth,
            columnGap,
            columnSized,
            columnRule: {
                borderLeftStyle,
                borderLeftWidth: borderLeftStyle !== 'none' ? isLength(borderLeftWidth, true) ? node.parseUnit(borderLeftWidth) : safeFloat(node.style.borderLeftWidth) : 0,
                borderLeftColor
            },
            boxWidth: parent.actualBoxWidth(boxWidth),
            multiline
        } as ColumnData<T>);
    }
}