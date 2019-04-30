import Node from './node';

const $css = squared.lib.css;
const $util = squared.lib.util;

export interface LinearData<T> {
    linearX: boolean;
    linearY: boolean;
    floated: Set<string>;
    cleared: Map<T, string>;
}

export default class NodeList<T extends Node> extends squared.lib.base.Container<T> implements squared.base.NodeList<T> {
    public static outerRegion<T extends Node>(node: T): BoxRect {
        const nodes = node.duplicate();
        let top = nodes[0];
        let right = top;
        let bottom = top;
        let left = top;
        node.each(item => item.companion && !item.companion.visible && nodes.push(item.companion));
        for (let i = 1; i < nodes.length; i++) {
            const item = nodes[i];
            if (item.linear.top < top.linear.top) {
                top = item;
            }
            if (item.linear.right > right.linear.right) {
                right = item;
            }
            if (item.linear.bottom > bottom.linear.bottom) {
                bottom = item;
            }
            if (item.linear.left < left.linear.left) {
                left = item;
            }
        }
        return {
            top: top.linear.top,
            right: right.linear.right,
            bottom: bottom.linear.bottom,
            left: left.linear.left
        };
    }

    public static actualParent<T extends Node>(list: T[]): T | null {
        for (const node of list) {
            if (node.naturalElement) {
                if (node.actualParent) {
                    return node.actualParent as T;
                }
            }
            else if (node.groupParent) {
                const parent = NodeList.actualParent(node.actualChildren);
                if (parent) {
                    return parent as T;
                }
            }
        }
        return null;
    }

    public static baseline<T extends Node>(list: T[], text = false) {
        const baseline = $util.filterArray(list, item => (item.baseline || $css.isLength(item.verticalAlign)) && !item.floating && !item.baselineAltered && (item.length === 0 || item.every(child => child.baseline && !child.multiline)));
        if (baseline.length) {
            list = baseline;
        }
        else {
            return baseline;
        }
        if (text) {
            $util.spliceArray(list, item => !(item.textElement && item.naturalElement));
        }
        if (list.length > 1) {
            let boundsHeight = 0;
            let lineHeight = 0;
            for (let i = 0; i < list.length; i++) {
                const item = list[i];
                if (!(item.layoutVertical && item.length > 1 || item.plainText && item.multiline)) {
                    let height: number;
                    if (item.multiline && item.cssTry('whiteSpace', 'nowrap')) {
                        height = (<Element> item.element).getBoundingClientRect().height;
                        item.cssFinally('whiteSpace');
                    }
                    else {
                        height = item.bounds.height;
                    }
                    boundsHeight = Math.max(boundsHeight, height);
                    lineHeight = Math.max(lineHeight, item.lineHeight);
                }
                else {
                    list.splice(i--, 1);
                }
            }
            $util.spliceArray(list, item => lineHeight > boundsHeight ? item.lineHeight !== lineHeight : item.bounds.height < boundsHeight);
            list.sort((a, b) => {
                if (a.groupParent || a.length || !a.baseline && b.baseline) {
                    return 1;
                }
                else if (b.groupParent || b.length || a.baseline && !b.baseline) {
                    return -1;
                }
                else if (!a.imageElement || !b.imageElement) {
                    if (a.textElement && b.textElement) {
                        if (a.fontSize === b.fontSize) {
                            if (a.htmlElement && !b.htmlElement) {
                                return -1;
                            }
                            else if (!a.htmlElement && b.htmlElement) {
                                return 1;
                            }
                            return a.siblingIndex < b.siblingIndex ? -1 : 1;
                        }
                        return a.fontSize > b.fontSize ? -1 : 1;
                    }
                    else if (a.containerType !== b.containerType) {
                        if (a.textElement) {
                            return -1;
                        }
                        else if (b.textElement) {
                            return 1;
                        }
                        else if (a.imageElement) {
                            return -1;
                        }
                        else if (b.imageElement) {
                            return 1;
                        }
                        return a.containerType < b.containerType ? -1 : 1;
                    }
                }
                const heightA = Math.max(a.actualHeight, a.lineHeight);
                const heightB = Math.max(b.actualHeight, b.lineHeight);
                if (heightA !== heightB) {
                    return heightA > heightB ? -1 : 1;
                }
                return 0;
            });
        }
        return list;
    }

    public static linearData<T extends Node>(list: T[], clearOnly = false): LinearData<T> {
        const nodes: T[] = [];
        const floating = new Set<string>();
        const clearable: ObjectMap<Undefined<T>> = {};
        const floated = new Set<string>();
        const cleared = new Map<T, string>();
        let linearX = false;
        let linearY = false;
        for (const node of list) {
            if (node.pageFlow) {
                if (floating.size) {
                    const previousFloat = [];
                    const clear = node.css('clear');
                    switch (clear) {
                        case 'left':
                            previousFloat.push(clearable.left);
                            break;
                        case 'right':
                            previousFloat.push(clearable.right);
                            break;
                        case 'both':
                            previousFloat.push(clearable.left, clearable.right);
                            break;
                    }
                    for (const item of previousFloat) {
                        if (item && floating.has(item.float) && !node.floating && node.linear.top >= item.linear.bottom) {
                            floating.delete(item.float);
                            clearable[item.float] = undefined;
                        }
                    }
                    if (clear === 'both') {
                        cleared.set(node, floating.size === 2 ? 'both' : floating.values().next().value);
                        floating.clear();
                        clearable.left = undefined;
                        clearable.right = undefined;
                    }
                    else if (floating.has(clear)) {
                        cleared.set(node, clear);
                        floating.delete(clear);
                        clearable[clear] = undefined;
                    }
                }
                if (node.floating) {
                    floating.add(node.float);
                    floated.add(node.float);
                    clearable[node.float] = node;
                }
                nodes.push(node);
            }
        }
        if (nodes.length) {
            if (!clearOnly) {
                const siblings = [nodes[0]];
                let x = 1;
                let y = 1;
                for (let i = 1; i < nodes.length; i++) {
                    if (nodes[i].alignedVertically(nodes[i].previousSiblings() as T[], siblings, cleared)) {
                        y++;
                    }
                    else {
                        x++;
                    }
                    siblings.push(nodes[i]);
                }
                linearX = x === nodes.length;
                linearY = y === nodes.length;
                if (linearX && floated.size) {
                    let boxLeft = Number.POSITIVE_INFINITY;
                    let boxRight = Number.NEGATIVE_INFINITY;
                    let floatLeft = Number.NEGATIVE_INFINITY;
                    let floatRight = Number.POSITIVE_INFINITY;
                    for (const node of nodes) {
                        boxLeft = Math.min(boxLeft, node.linear.left);
                        boxRight = Math.max(boxRight, node.linear.right);
                        if (node.floating) {
                            if (node.float === 'left') {
                                floatLeft = Math.max(floatLeft, node.linear.right);
                            }
                            else {
                                floatRight = Math.min(floatRight, node.linear.left);
                            }
                        }
                    }
                    for (let i = 0, j = 0, k = 0, l = 0, m = 0; i < nodes.length; i++) {
                        const item = nodes[i];
                        if (Math.floor(item.linear.left) <= boxLeft) {
                            j++;
                        }
                        if (Math.ceil(item.linear.right) >= boxRight) {
                            k++;
                        }
                        if (!item.floating) {
                            if (item.linear.left === floatLeft) {
                                l++;
                            }
                            if (item.linear.right === floatRight) {
                                m++;
                            }
                        }
                        if (i === 0) {
                            continue;
                        }
                        if (j === 2 || k === 2 || l === 2 || m === 2) {
                            linearX = false;
                            break;
                        }
                        const previous = nodes[i - 1];
                        if (previous.floating && item.linear.top >= previous.linear.bottom || $util.withinRange(item.linear.left, previous.linear.left)) {
                            linearX = false;
                            break;
                        }
                    }
                }
            }
        }
        return {
            linearX,
            linearY,
            cleared,
            floated
        };
    }

    public static partitionRows<T extends Node>(list: T[]) {
        const parent = this.actualParent(list);
        const children = parent ? parent.actualChildren as T[] : list;
        const cleared = this.linearData(list, true).cleared;
        const groupParent = $util.filterArray(list, node => node.groupParent);
        const result: T[][] = [];
        let row: T[] = [];
        for (let i = 0; i < children.length; i++) {
            const node = children[i];
            let next = false;
            for (let j = 0; j < groupParent.length; j++) {
                const group = groupParent[j];
                if (group.contains(node) || group === node) {
                    if (row.length) {
                        result.push(row);
                    }
                    result.push([group]);
                    row = [];
                    groupParent.splice(j, 1);
                    next = true;
                    break;
                }
            }
            if (next) {
                continue;
            }
            const previousSiblings = node.previousSiblings() as T[];
            if (i === 0 || previousSiblings.length === 0) {
                if (list.includes(node)) {
                    row.push(node);
                }
            }
            else {
                if (node.alignedVertically(previousSiblings, row, cleared)) {
                    if (row.length) {
                        result.push(row);
                    }
                    if (list.includes(node)) {
                        row = [node];
                    }
                    else {
                        row = [];
                    }
                }
                else if (list.includes(node)) {
                    row.push(node);
                }
            }
            if (i === children.length - 1 && row.length) {
                result.push(row);
            }
        }
        return result;
    }

    public static siblingIndex<T extends Node>(a: T, b: T) {
        return a.siblingIndex < b.siblingIndex ? -1 : 1;
    }

    public afterAppend?: (node: T) => void;

    private _currentId = 0;

    constructor(children?: T[]) {
        super(children);
    }

    public append(node: T, delegate = true) {
        super.append(node);
        if (delegate && this.afterAppend) {
            this.afterAppend.call(this, node);
        }
        return this;
    }

    public reset() {
        this._currentId = 0;
        this.clear();
        return this;
    }

    get nextId() {
        return ++this._currentId;
    }
}