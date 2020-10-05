import { NODE_ALIGNMENT } from '../lib/constant';

import type NodeUI from '../node-ui';

import ExtensionUI from '../extension-ui';

type NodeIntersectXY = "intersectY" | "intersectX";

const { partitionArray, withinRange } = squared.lib.util;

const OPTIONS_BOUNDSDATA: StringMap = {
    'align-self': 'start',
    'justify-self': 'start'
};

function createDataAttribute(node: NodeUI, children: NodeUI[]): FlexboxData<NodeUI> {
    return {
        ...(node.flexdata as Required<FlexData>),
        rowCount: 0,
        columnCount: 0,
        children
    };
}

export default abstract class Flexbox<T extends NodeUI> extends ExtensionUI<T> {
    public is(node: T) {
        return node.flexElement;
    }

    public condition(node: T) {
        return !node.isEmpty();
    }

    public processNode(node: T) {
        const [children, absolute] = partitionArray(node.children, (item: T) => item.pageFlow && item.visible) as [T[], T[]];
        const mainData = createDataAttribute(node, children);
        const dataName = this.name;
        node.cssTryAll({ 'align-items': 'start', 'justify-items': 'start' }, () => {
            for (let i = 0, length = children.length; i < length; ++i) {
                const item = children[i];
                item.cssTryAll(OPTIONS_BOUNDSDATA, function(this: T) {
                    const bounds = this.boundingClientRect;
                    this.data(dataName, 'boundsData', bounds ? { ...this.bounds, width: bounds.width, height: bounds.height } : this.bounds);
                });
            }
        });
        if (mainData.wrap) {
            const controller = this.controller;
            const options: CoordsXYOptions = { dimension: 'bounds' };
            let align: string,
                sort: string,
                size: string,
                method: string;
            if (mainData.row) {
                align = 'top';
                sort = 'left';
                size = 'right';
                method = 'intersectY';
            }
            else {
                align = 'left';
                sort = 'top';
                size = 'bottom';
                method = 'intersectX';
            }
            children.sort((a, b) => {
                const linearA = a.linear;
                const linearB = b.linear;
                if (!a[method as NodeIntersectXY](b.bounds, options)) {
                    return linearA[align] - linearB[align];
                }
                else {
                    const posA = linearA[sort];
                    const posB = linearB[sort];
                    if (!withinRange(posA, posB)) {
                        return posA - posB;
                    }
                }
                return 0;
            });
            let rowStart = children[0],
                row: T[] = [rowStart],
                length = children.length,
                maxCount = 0;
            const rows: T[][] = [row];
            for (let i = 1; i < length; ++i) {
                const item = children[i];
                if (rowStart[method as NodeIntersectXY](item.bounds, options)) {
                    row.push(item);
                }
                else {
                    rowStart = item;
                    row = [item];
                    rows.push(row);
                }
            }
            node.clear();
            length = rows.length;
            if (length > 1) {
                const boxSize: number = node.box[size];
                for (let i = 0; i < length; ++i) {
                    const seg = rows[i];
                    maxCount = Math.max(seg.length, maxCount);
                    const group = controller.createNodeGroup(seg[0], seg, node, { alignmentType: NODE_ALIGNMENT.SEGMENTED, delegate: true, cascade: true });
                    group.box[size] = boxSize;
                }
            }
            else {
                const items = rows[0];
                node.retainAs(items);
                maxCount = items.length;
            }
            node.addAll(absolute);
            if (mainData.row) {
                mainData.rowCount = length;
                mainData.columnCount = maxCount;
            }
            else {
                mainData.rowCount = maxCount;
                mainData.columnCount = length;
            }
        }
        else {
            if (children.some(item => item.flexbox.order !== 0)) {
                const [c, d] = mainData.reverse ? [-1, 1] : [1, -1];
                children.sort((a, b) => {
                    const orderA = a.flexbox.order;
                    const orderB = b.flexbox.order;
                    if (orderA === orderB) {
                        return 0;
                    }
                    return orderA > orderB ? c : d;
                });
            }
            else if (mainData.reverse && children.length > 1) {
                children.reverse();
            }
            if (mainData.row) {
                mainData.rowCount = 1;
                mainData.columnCount = node.size();
            }
            else {
                mainData.rowCount = node.size();
                mainData.columnCount = 1;
            }
        }
        this.data.set(node, mainData);
    }
}