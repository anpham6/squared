import Node from './node';

const $util = squared.lib.util;

export default class NodeList<T extends Node> extends squared.lib.base.Container<T> implements squared.base.NodeList<T> {
    public static actualParent<T extends Node>(list: T[]) {
        for (const node of list) {
            if (node.naturalElement && node.actualParent) {
                return node.actualParent as T;
            }
        }
        return undefined;
    }

    public static baseline<T extends Node>(list: T[], text = false) {
        let baseline = $util.filterArray(list, item => item.baseline || $util.isLength(item.verticalAlign) && item.verticalAlign !== '0px');
        if (baseline.length) {
            list = baseline;
        }
        baseline = $util.filterArray(list, item => item.textElement || !item.verticalAlign.startsWith('text-'));
        if (baseline.length) {
            list = baseline;
        }
        if (text) {
            $util.spliceArray(list, item => item.imageElement || !item.naturalElement);
        }
        let lineHeight = 0;
        let boundsHeight = 0;
        for (const item of list) {
            lineHeight = Math.max(lineHeight, item.lineHeight);
            boundsHeight = Math.max(boundsHeight, item.actualHeight);
        }
        $util.spliceArray(list, item => lineHeight > boundsHeight ? item.lineHeight !== lineHeight : !$util.withinRange(item.actualHeight, boundsHeight));
        return list.sort((a, b) => {
            if (a.groupParent || a.length || (!a.baseline && b.baseline)) {
                return 1;
            }
            else if (b.groupParent || b.length || (a.baseline && !b.baseline)) {
                return -1;
            }
            else if (!a.imageElement || !b.imageElement) {
                if (a.multiline || b.multiline) {
                    if (a.lineHeight > 0 && b.lineHeight > 0) {
                        return a.lineHeight <= b.lineHeight ? 1 : -1;
                    }
                    else if (a.fontSize === b.fontSize) {
                        return a.htmlElement || !b.htmlElement ? -1 : 1;
                    }
                }
                else if (a.textElement && b.textElement) {
                    if (a.fontSize === b.fontSize) {
                        if (a.htmlElement && !b.htmlElement) {
                            return -1;
                        }
                        else if (!a.htmlElement && b.htmlElement) {
                            return 1;
                        }
                        return a.siblingIndex >= b.siblingIndex ? 1 : -1;
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
            return a.actualHeight <= b.actualHeight ? 1 : -1;
        });
    }

    public static floated<T extends Node>(list: T[]) {
        const result = new Set<string>();
        for (const node of list) {
            if (node.floating) {
                result.add(node.float);
            }
        }
        return result;
    }

    public static cleared<T extends Node>(list: T[], parent = true) {
        if (parent && list.length > 1) {
            const actualParent = this.actualParent(list);
            if (actualParent) {
                const nodes: T[] = [];
                const listEnd = list[list.length - 1];
                let valid = false;
                const children = actualParent.actualChildren;
                for (let i = 0; i < children.length; i++) {
                    const node = children[i] as T;
                    if (node === list[0]) {
                        valid = true;
                    }
                    if (valid) {
                        nodes.push(node);
                    }
                    if (node === listEnd) {
                        break;
                    }
                }
                if (nodes.length >= list.length) {
                    list = nodes;
                }
            }
        }
        const result = new Map<T, string>();
        const floated = new Set<string>();
        const previous: ObjectMap<Undefined<T>> = {};
        for (const node of list) {
            if (node.pageFlow) {
                if (floated.size) {
                    const previousFloat = [];
                    const clear = node.css('clear');
                    switch (clear) {
                        case 'left':
                            previousFloat.push(previous.left);
                            break;
                        case 'right':
                            previousFloat.push(previous.right);
                            break;
                        case 'both':
                            previousFloat.push(previous.left, previous.right);
                            break;
                    }
                    for (const item of previousFloat) {
                        if (item && floated.has(item.float) && !node.floating && node.linear.top > item.linear.bottom) {
                            floated.delete(item.float);
                            previous[item.float] = undefined;
                        }
                    }
                    if (clear === 'both') {
                        result.set(node, floated.size === 2 ? 'both' : floated.values().next().value);
                        floated.clear();
                        previous.left = undefined;
                        previous.right = undefined;
                    }
                    else if (floated.has(clear)) {
                        result.set(node, clear);
                        floated.delete(clear);
                        previous[clear] = undefined;
                    }
                }
                if (node.floating) {
                    floated.add(node.float);
                    previous[node.float] = node;
                }
            }
        }
        return result;
    }

    public static floatedAll<T extends Node>(parent: T) {
        return this.floated($util.filterArray(parent.actualChildren as T[], item => item.pageFlow));
    }

    public static clearedAll<T extends Node>(parent: T) {
        return this.cleared($util.filterArray(parent.actualChildren as T[], item => item.pageFlow), false);
    }

    public static linearX<T extends Node>(list: T[], segmented = false) {
        const nodes: T[] = [];
        let hasFloat = false;
        for (const item of list) {
            if (item.pageFlow) {
                nodes.push(item);
            }
            if (item.floating) {
                hasFloat = true;
            }
        }
        switch (nodes.length) {
            case 0:
                return false;
            case 1:
                return true;
            default:
                const parent = this.actualParent(nodes);
                if (parent) {
                    const cleared = hasFloat ? this.clearedAll(parent) : undefined;
                    for (let i = 1; i < nodes.length; i++) {
                        const previousSiblings = nodes[i].previousSiblings() as T[];
                        if (segmented) {
                            $util.spliceArray(previousSiblings, item => !list.includes(item));
                        }
                        if (nodes[i].alignedVertically(previousSiblings, undefined, cleared)) {
                            return false;
                        }
                    }
                    if (hasFloat) {
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
                                return false;
                            }
                            const previous = nodes[i - 1];
                            if (previous.floating && item.linear.top >= previous.linear.bottom || $util.withinRange(item.linear.left, previous.linear.left)) {
                                return false;
                            }
                        }
                    }
                    return true;
                }
                return false;
        }
    }

    public static linearY<T extends Node>(list: T[], segmented = false) {
        const nodes: T[] = [];
        let hasFloat = false;
        for (const item of list) {
            if (item.pageFlow) {
                nodes.push(item);
            }
            if (item.floating) {
                hasFloat = true;
            }
        }
        switch (nodes.length) {
            case 0:
                return false;
            case 1:
                return true;
            default:
                const parent = this.actualParent(nodes);
                if (parent) {
                    const cleared = hasFloat ? this.clearedAll(parent) : undefined;
                    for (let i = 1; i < nodes.length; i++) {
                        const previousSiblings = nodes[i].previousSiblings() as T[];
                        if (segmented) {
                            $util.spliceArray(previousSiblings, item => !list.includes(item));
                        }
                        if (!nodes[i].alignedVertically(previousSiblings, nodes, cleared)) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
        }
    }

    public static partitionRows<T extends Node>(list: T[]) {
        let children: T[];
        let cleared: Map<T, string>;
        const parent = this.actualParent(list);
        if (parent) {
            children = parent.actualChildren as T[];
            cleared = this.clearedAll(parent);
        }
        else {
            children = list;
            cleared = this.cleared(list);
        }
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
                else {
                    if (list.includes(node)) {
                        row.push(node);
                    }
                }
            }
            if (i === children.length - 1 && row.length) {
                result.push(row);
            }
        }
        return result;
    }

    public static siblingIndex<T extends Node>(a: T, b: T) {
        return a.siblingIndex >= b.siblingIndex ? 1 : -1;
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