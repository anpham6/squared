import Node from './node';

const $dom = squared.lib.dom;
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
        let baseline = $util.filterArray(list, item => {
            if (item.baseline || $util.isUnit(item.verticalAlign) && item.verticalAlign !== '0px') {
                const position = item.cssInitial('position');
                return position !== 'absolute' && position !== 'fixed';
            }
            return false;
        });
        if (baseline.length) {
            list = baseline;
        }
        baseline = $util.filterArray(list, item => item.textElement || item.verticalAlign !== 'text-top' && item.verticalAlign !== 'text-bottom');
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
            boundsHeight = Math.max(boundsHeight, item.bounds.height);
        }
        $util.spliceArray(list, item => lineHeight > boundsHeight ? item.lineHeight !== lineHeight : !$util.withinFraction(item.bounds.height, boundsHeight));
        return list.sort((a, b) => {
            if (a.groupParent || a.length || (!a.baseline && b.baseline)) {
                return 1;
            }
            else if (b.groupParent || b.length || (a.baseline && !b.baseline)) {
                return -1;
            }
            if (!a.imageElement || !b.imageElement) {
                if (a.multiline || b.multiline) {
                    if (a.lineHeight > 0 && b.lineHeight > 0) {
                        return a.lineHeight <= b.lineHeight ? 1 : -1;
                    }
                    else if (a.fontSize === b.fontSize) {
                        return a.htmlElement || !b.htmlElement ? -1 : 1;
                    }
                }
                if (a.containerType !== b.containerType) {
                    if (a.textElement || a.imageElement) {
                        return -1;
                    }
                    else if (b.textElement || b.imageElement) {
                        return 1;
                    }
                    return a.containerType < b.containerType ? -1 : 1;
                }
                else if (b.imageElement) {
                    return -1;
                }
                else if (a.imageElement) {
                    return 1;
                }
                else {
                    if (a.fontSize === b.fontSize) {
                        if (a.htmlElement && !b.htmlElement) {
                            return -1;
                        }
                        else if (!a.htmlElement && b.htmlElement) {
                            return 1;
                        }
                        else {
                            return a.siblingIndex >= b.siblingIndex ? 1 : -1;
                        }
                    }
                    else if (a.fontSize !== b.fontSize && a.fontSize > 0 && b.fontSize > 0) {
                        return a.fontSize > b.fontSize ? -1 : 1;
                    }
                }
            }
            return 0;
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
            list.slice(0).sort(this.siblingIndex);
            const actualParent = this.actualParent(list);
            if (actualParent && actualParent.element) {
                const nodes: T[] = [];
                const listEnd = list[list.length - 1];
                let valid = false;
                for (let i = 0; i < actualParent.element.childNodes.length; i++) {
                    const node = $dom.getElementAsNode<T>(<Element> actualParent.element.childNodes[i]);
                    if (node) {
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
                const clear = node.css('clear');
                if (floated.size) {
                    const previousFloat = [];
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
                        if (item && !node.floating && node.linear.top > item.linear.bottom && floated.has(item.float)) {
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
        return this.floated($util.filterArray(parent.actualChildren, item => item.pageFlow) as T[]);
    }

    public static clearedAll<T extends Node>(parent: T) {
        return this.cleared($util.filterArray(parent.actualChildren, item => item.pageFlow) as T[], false);
    }

    public static linearX<T extends Node>(list: T[]) {
        const nodes = $util.filterArray(list, node => node.pageFlow).sort(NodeList.siblingIndex);
        switch (nodes.length) {
            case 0:
                return false;
            case 1:
                return true;
            default:
                const parent = this.actualParent(nodes);
                if (parent) {
                    const cleared = this.clearedAll(parent);
                    for (let i = 1; i < nodes.length; i++) {
                        if (nodes[i].alignedVertically(nodes[i].previousSiblings(), undefined, cleared)) {
                            return false;
                        }
                    }
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
                        if (previous.floating && item.linear.top >= previous.linear.bottom || $util.withinFraction(item.linear.left, previous.linear.left)) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
        }
    }

    public static linearY<T extends Node>(list: T[]) {
        const nodes = $util.filterArray(list, node => node.pageFlow).sort(NodeList.siblingIndex);
        switch (nodes.length) {
            case 0:
                return false;
            case 1:
                return true;
            default:
                const parent = this.actualParent(nodes);
                if (parent) {
                    const cleared = this.clearedAll(parent);
                    for (let i = 1; i < nodes.length; i++) {
                        if (!nodes[i].alignedVertically(nodes[i].previousSiblings(), nodes, cleared)) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
        }
    }

    public static partitionRows<T extends Node>(list: T[]) {
        const [children, cleared] = ((): [T[], Map<T, string>] => {
            const parent = this.actualParent(list);
            if (parent) {
                return [parent.actualChildren as T[], this.clearedAll(parent)];
            }
            else {
                return [list, this.cleared(list)];
            }
        })();
        const result: T[][] = [];
        let row: T[] = [];
        for (let i = 0; i < children.length; i++) {
            const node = children[i];
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