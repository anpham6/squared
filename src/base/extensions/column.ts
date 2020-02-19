import { ColumnData } from '../../../@types/base/extension';

import ExtensionUI from '../extension-ui';

import { EXT_NAME } from '../lib/constant';

type NodeUI = squared.base.NodeUI;

const { USER_AGENT, isUserAgent } = squared.lib.client;

export default abstract class Column<T extends NodeUI> extends ExtensionUI<T> {
    public is(node: T) {
        return (node.blockDimension && node.display !== 'table') && !node.layoutElement;
    }

    public condition(node: T) {
        return node.has('columnCount') || node.hasPX('columnWidth');
    }

    public processNode(node: T, parent: T) {
        let items: T[] = [];
        const rows: T[][] = [items];
        let maxSize = Number.POSITIVE_INFINITY;
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
                if (item.multiline) {
                    multiline = true;
                }
                else {
                    maxSize = Math.min(item.bounds.width, maxSize);
                }
                items.push(item);
            }
        });
        if (items.length === 0) {
            rows.pop();
        }
        const columnCount = node.toInt('columnCount');
        const columnWidth = node.parseUnit(node.css('columnWidth'));
        let columnGap = node.parseUnit(node.css('columnGap'));
        let columnSized: number;
        let boxWidth: number;
        const getColumnSizing = () => isNaN(columnCount) && columnWidth > 0 ? boxWidth / (columnWidth + columnGap) : Number.POSITIVE_INFINITY;
        if (isUserAgent(USER_AGENT.SAFARI)) {
            boxWidth = Math.min(node.width > 0 ? node.width - (!node.contentBox ? node.contentBoxWidth : 0) : Number.POSITIVE_INFINITY, node.box.width * (columnCount || 1), node.documentParent.box.width - node.contentBoxWidth);
        }
        else {
            boxWidth = node.box.width;
        }
        if (columnGap > 0) {
            columnSized = Math.floor(getColumnSizing());
        }
        else {
            columnGap = (columnWidth > 0 ? Math.max(maxSize - columnWidth, 0) : 0) + 16;
            columnSized = Math.ceil(getColumnSizing());
        }
        node.data(EXT_NAME.COLUMN, 'mainData', <ColumnData<T>> {
            boxWidth: parent.actualBoxWidth(boxWidth),
            columnCount,
            columnWidth,
            columnGap,
            columnSized,
            rows,
            multiline
        });
        return undefined;
    }
}