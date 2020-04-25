import { ColumnData } from '../../../@types/base/extension';

import ExtensionUI from '../extension-ui';

import { EXT_NAME } from '../lib/constant';

type NodeUI = squared.base.NodeUI;

export default abstract class Column<T extends NodeUI> extends ExtensionUI<T> {
    public is(node: T) {
        return (node.blockDimension && node.display !== 'table') && !node.layoutElement && node.length > 1;
    }

    public condition(node: T) {
        return node.has('columnCount') || node.hasPX('columnWidth');
    }

    public processNode(node: T, parent: T) {
        let items: T[] = [];
        const rows: T[][] = [items];
        let maxSize = Infinity;
        let multiline = false;
        node.each((item: T) => {
            if (item.css('columnSpan') === 'all') {
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
            rows.pop();
        }
        const [borderLeftStyle, borderLeftWidth, borderLeftColor] = node.cssAsTuple('columnRuleStyle', 'columnRuleWidth', 'columnRuleColor');
        const boxWidth = node.box.width;
        const columnCount = node.toInt('columnCount');
        const columnWidth = node.parseWidth(node.css('columnWidth'));
        let columnGap = node.parseWidth(node.css('columnGap'));
        let columnSized: number;
        const getColumnSizing = () => isNaN(columnCount) && columnWidth > 0 ? boxWidth / (columnWidth + columnGap) : Infinity;
        if (columnGap > 0) {
            columnSized = Math.floor(getColumnSizing());
        }
        else {
            columnGap = (columnWidth > 0 && !isNaN(maxSize) && maxSize !== Infinity ? Math.max(maxSize - columnWidth, 0) : 0) + 16;
            columnSized = Math.ceil(getColumnSizing());
        }
        node.data(EXT_NAME.COLUMN, 'mainData', <ColumnData<T>> {
            rows,
            columnCount,
            columnWidth,
            columnGap,
            columnSized,
            columnRule: {
                borderLeftStyle,
                borderLeftWidth,
                borderLeftColor
            },
            boxWidth: parent.actualBoxWidth(boxWidth),
            multiline
        });
        return undefined;
    }
}