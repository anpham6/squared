import { NodeTemplate } from './@types/application';
import { InitialData, LinearData, SiblingOptions, Support } from './@types/node';

import Node from './node';
import Extension from './extension';

import { CSS_SPACING } from './lib/constant';
import { APP_SECTION, BOX_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE, NODE_TRAVERSE } from './lib/enumeration';

type T = NodeUI;

const $const = squared.lib.constant;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $math = squared.lib.math;
const $session = squared.lib.session;
const $util = squared.lib.util;

const CSS_SPACING_KEYS = Array.from(CSS_SPACING.keys());
const INHERIT_ALIGNMENT = ['position', 'display', 'verticalAlign', 'float', 'clear', 'zIndex'];

export default abstract class NodeUI extends Node implements squared.base.NodeUI {
    public static outerRegion(node: T): BoxRect {
        let top = Number.POSITIVE_INFINITY;
        let right = Number.NEGATIVE_INFINITY;
        let bottom = Number.NEGATIVE_INFINITY;
        let left = Number.POSITIVE_INFINITY;
        node.each((item: T) => {
            let actualTop: number;
            let actualRight: number;
            let actualBottom: number;
            let actualLeft: number;
            if (item.companion) {
                actualTop = item.actualRect($const.CSS.TOP);
                actualRight = item.actualRect($const.CSS.RIGHT);
                actualBottom = item.actualRect($const.CSS.BOTTOM);
                actualLeft = item.actualRect($const.CSS.LEFT);
            }
            else {
                actualTop = item.linear.top;
                actualRight = item.linear.right;
                actualBottom = item.linear.bottom;
                actualLeft = item.linear.left;
            }
            if (actualTop < top) {
                top = actualTop;
            }
            if (actualRight > right) {
                right = actualRight;
            }
            if (actualBottom > bottom) {
                bottom = actualBottom;
            }
            if (actualLeft < left) {
                left = actualLeft;
            }
        });
        return {
            top,
            right,
            bottom,
            left
        };
    }

    public static baseline<T extends NodeUI>(list: T[], text = false) {
        list = $util.filterArray(list, item => {
            if ((item.baseline || $css.isLength(item.verticalAlign)) && (!text || item.textElement)) {
                return !item.floating && !item.baselineAltered && (item.naturalChild && item.length === 0 || !item.layoutVertical && item.every(child => child.baseline && !child.multiline));
            }
            return false;
        });
        if (list.length > 1) {
            list.sort((a, b) => {
                if (a.length && b.length === 0) {
                    return 1;
                }
                else if (b.length && a.length === 0) {
                    return -1;
                }
                let heightA = a.baselineHeight;
                let heightB = b.baselineHeight;
                if (a.marginTop !== 0) {
                    if (a.imageElement || heightA >= heightB || a.marginTop < 0) {
                        heightA += a.marginTop;
                    }
                    else {
                        return a.marginTop > ((heightB - heightA) / 2) ? -1 : 1;
                    }
                }
                if (b.marginTop !== 0) {
                    if (b.imageElement || heightB >= heightA || b.marginTop < 0) {
                        heightB += b.marginTop;
                    }
                    else {
                        return b.marginTop > ((heightA - heightB) / 2) ? 1 : -1;
                    }
                }
                if (!$math.isEqual(heightA, heightB)) {
                    return heightA > heightB ? -1 : 1;
                }
                else if (a.inputElement && b.inputElement && a.containerType !== b.containerType) {
                    return a.containerType > b.containerType ? -1 : 1;
                }
                else if (a.bounds.bottom > b.bounds.bottom) {
                    return -1;
                }
                else if (a.bounds.bottom < b.bounds.bottom) {
                    return 1;
                }
                return 0;
            });
        }
        return list.shift() || null;
    }

    public static linearData<T extends NodeUI>(list: T[], clearOnly = false): LinearData<T> {
        const floated = new Set<string>();
        const cleared = new Map<T, string>();
        let linearX = false;
        let linearY = false;
        if (list.length > 1) {
            const nodes: T[] = [];
            const floating = new Set<string>();
            const clearable: ObjectMap<Undefined<T>> = {};
            for (const node of list) {
                if (node.pageFlow) {
                    if (floating.size) {
                        const previousFloat = [];
                        const clear = node.css('clear');
                        switch (clear) {
                            case $const.CSS.LEFT:
                                previousFloat.push(clearable.left);
                                break;
                            case $const.CSS.RIGHT:
                                previousFloat.push(clearable.right);
                                break;
                            case 'both':
                                previousFloat.push(clearable.left, clearable.right);
                                break;
                        }
                        for (const item of previousFloat) {
                            if (item && floating.has(item.float) && !node.floating && $util.aboveRange(node.linear.top, item.linear.bottom)) {
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
                else if (node.positionAuto) {
                    nodes.push(node);
                }
            }
            const length = nodes.length;
            if (length) {
                if (!clearOnly) {
                    const siblings = [nodes[0]];
                    let x = 1;
                    let y = 1;
                    for (let i = 1; i < length; i++) {
                        if (nodes[i].alignedVertically(siblings, cleared)) {
                            y++;
                        }
                        else {
                            x++;
                        }
                        siblings.push(nodes[i]);
                    }
                    linearX = x === length;
                    linearY = y === length;
                    if (linearX && floated.size) {
                        let boxLeft = Number.POSITIVE_INFINITY;
                        let boxRight = Number.NEGATIVE_INFINITY;
                        let floatLeft = Number.NEGATIVE_INFINITY;
                        let floatRight = Number.POSITIVE_INFINITY;
                        for (const node of nodes) {
                            boxLeft = Math.min(boxLeft, node.linear.left);
                            boxRight = Math.max(boxRight, node.linear.right);
                            if (node.floating) {
                                if (node.float === $const.CSS.LEFT) {
                                    floatLeft = Math.max(floatLeft, node.linear.right);
                                }
                                else {
                                    floatRight = Math.min(floatRight, node.linear.left);
                                }
                            }
                        }
                        for (let i = 0, j = 0, k = 0, l = 0, m = 0; i < length; i++) {
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
                            if (previous.floating && $util.aboveRange(item.linear.top, previous.linear.bottom) || $util.withinRange(item.linear.left, previous.linear.left)) {
                                linearX = false;
                                break;
                            }
                        }
                    }
                }
            }
        }
        else if (list.length) {
            linearY = list[0].blockStatic;
            linearX = !linearY;
        }
        return {
            linearX,
            linearY,
            cleared,
            floated
        };
    }

    public static partitionRows(list: T[]) {
        const parent = list[0].actualParent as T;
        const cleared = parent && parent.floatContainer ? NodeUI.linearData(parent.naturalElements as T[], true).cleared : undefined;
        const result: T[][] = [];
        let row: T[] = [];
        let siblings: T[] = [];
        const length = list.length;
        for (let i = 0; i < length; i++) {
            const node = list[i];
            let active = node;
            if (!node.naturalChild) {
                if (node.nodeGroup) {
                    if (row.length) {
                        result.push(row);
                    }
                    result.push([node]);
                    row = [];
                    siblings.length = 0;
                    continue;
                }
                let current = node.innerWrapped;
                while (current) {
                    if (current.naturalChild) {
                        active = current;
                        break;
                    }
                    current = current.innerWrapped;
                }
            }
            if (row.length === 0) {
                row.push(node);
            }
            else {
                if (active.alignedVertically(siblings, cleared)) {
                    if (row.length) {
                        result.push(row);
                    }
                    row = [node];
                    siblings = [active];
                }
                else {
                    row.push(node);
                    siblings.push(active);
                }
            }
        }
        if (row.length) {
            result.push(row);
        }
        return result;
    }

    public alignmentType = 0;
    public baselineActive = false;
    public baselineAltered = false;
    public positioned = false;
    public rendered = false;
    public excluded = false;
    public controlId = '';
    public floatContainer = false;
    public containerIndex = Number.POSITIVE_INFINITY;
    public lineBreakLeading = false;
    public lineBreakTrailing = false;
    public abstract localSettings: {};
    public abstract renderParent?: T;
    public abstract renderExtension?: Extension<T>[];
    public abstract renderTemplates?: (NodeTemplate<T> | null)[];
    public abstract outerWrapper?: T;
    public abstract innerWrapped?: T;
    public abstract innerBefore?: T;
    public abstract innerAfter?: T;
    public abstract companion?: T;
    public abstract extracted?: T[];
    public abstract horizontalRows?: T[][];
    public abstract readonly renderChildren: T[];

    protected _controlName?: string;
    protected abstract _namespaces: string[];
    protected abstract _boxAdjustment?: BoxModel;
    protected abstract _boxReset?: BoxModel;

    private _excludeSection = 0;
    private _excludeProcedure = 0;
    private _excludeResource = 0;
    private _visible = true;
    private _siblingsLeading?: T[];
    private _siblingsTrailing?: T[];
    private _renderAs?: T;
    private _textContent?: string;

    public abstract setControlType(viewName: string, containerType?: number): void;
    public abstract setLayout(width?: number, height?: number): void;
    public abstract setAlignment(): void;
    public abstract setBoxSpacing(): void;
    public abstract clone(id?: number, attributes?: boolean, position?: boolean): T;
    public abstract extractAttributes(depth?: number): string;
    public abstract alignParent(position: string): boolean;
    public abstract alignSibling(position: string, documentId?: string): string;
    public abstract localizeString(value: string): string;
    public abstract set containerType(value: number);
    public abstract get containerType(): number;
    public abstract get documentId(): string;
    public abstract get baselineHeight(): number;
    public abstract get support(): Support;
    public abstract set renderExclude(value: boolean);
    public abstract get renderExclude(): boolean;

    public is(containerType: number) {
        return this.containerType === containerType;
    }

    public of(containerType: number, ...alignmentType: number[]) {
        return this.containerType === containerType && alignmentType.some(value => this.hasAlign(value));
    }

    public attr(name: string, attr: string, value?: string, overwrite = true): string {
        let obj = this[`__${name}`];
        if (value) {
            if (obj === undefined) {
                if (!this._namespaces.includes(name)) {
                    this._namespaces.push(name);
                }
                obj = {};
                this[`__${name}`] = obj;
            }
            if (!overwrite && obj[attr]) {
                return '';
            }
            obj[attr] = value.toString();
            return obj[attr];
        }
        else {
            return obj && obj[attr] || '';
        }
    }

    public namespace(name: string): StringMap {
        return this[`__${name}`] || {};
    }

    public delete(name: string, ...attrs: string[]) {
        const obj = this[`__${name}`];
        if (obj) {
            for (const attr of attrs) {
                if (attr.indexOf('*') !== -1) {
                    for (const [key] of $util.searchObject(obj, attr)) {
                        delete obj[key];
                    }
                }
                else {
                    delete obj[attr];
                }
            }
        }
    }

    public apply(options: {}) {
        for (const name in options) {
            const obj = options[name];
            if (typeof obj === 'object') {
                for (const attr in obj) {
                    this.attr(name, attr, obj[attr]);
                }
                delete options[name];
            }
        }
    }

    public render(parent?: T) {
        this.renderParent = parent;
        this.rendered = true;
    }

    public renderEach(predicate: IteratorPredicate<T, void>) {
        const renderChildren = this.renderChildren;
        const length = renderChildren.length;
        for (let i = 0; i < length; i++) {
            const item = renderChildren[i];
            if (item.visible) {
                predicate(item, i, renderChildren);
            }
        }
        return this;
    }

    public renderFilter(predicate: IteratorPredicate<T, boolean>) {
        return $util.filterArray(this.renderChildren, predicate);
    }

    public hide(invisible?: boolean) {
        this.rendered = true;
        this.visible = false;
        const renderParent = this.renderParent;
        if (renderParent && renderParent.renderTemplates) {
            const index = renderParent.renderChildren.findIndex(node => node === this);
            if (index !== -1) {
                const template = renderParent.renderTemplates[index];
                if (template && template.node === this) {
                    renderParent.renderTemplates[index] = null;
                }
            }
        }
    }

    public inherit(node: T, ...modules: string[]) {
        const initial = <InitialData<T>> node.unsafe('initial');
        for (const name of modules) {
            switch (name) {
                case 'base':
                    this._documentParent = node.documentParent;
                    this._bounds = $dom.assignRect(node.bounds);
                    this._linear = $dom.assignRect(node.linear);
                    this._box = $dom.assignRect(node.box);
                    this._boxReset = $dom.newBoxModel();
                    this._boxAdjustment = $dom.newBoxModel();
                    if (this.depth === -1) {
                        this.depth = node.depth;
                    }
                    const actualParent = node.actualParent;
                    if (actualParent) {
                        this.actualParent = actualParent;
                        this.dir = actualParent.dir;
                    }
                    break;
                case 'initial':
                    $util.cloneObject(initial, this.initial);
                    break;
                case 'alignment':
                    this.positionAuto = node.positionAuto;
                    for (const attr of INHERIT_ALIGNMENT) {
                        this._styleMap[attr] = node.css(attr);
                        this._initial.styleMap[attr] = initial.styleMap[attr];
                    }
                    if (!this.positionStatic) {
                        for (const attr of $css.BOX_POSITION) {
                            if (node.hasPX(attr)) {
                                this._styleMap[attr] = node.css(attr);
                            }
                            this._initial.styleMap[attr] = initial.styleMap[attr];
                        }
                    }
                    if (node.autoMargin.horizontal || node.autoMargin.vertical) {
                        for (const attr of $css.BOX_MARGIN) {
                            if (node.cssInitial(attr) === $const.CSS.AUTO) {
                                this._styleMap[attr] = $const.CSS.AUTO;
                                this._initial.styleMap[attr] = $const.CSS.AUTO;
                            }
                        }
                    }
                    break;
                case 'styleMap':
                    $util.assignEmptyProperty(this._styleMap, node.unsafe('styleMap'));
                    break;
                case 'textStyle':
                    NodeUI.copyTextStyle(this, node);
                    break;
            }
        }
    }

    public addAlign(value: number) {
        if (!this.hasAlign(value)) {
            this.alignmentType |= value;
        }
    }

    public removeAlign(value: number) {
        if (this.hasAlign(value)) {
            this.alignmentType ^= value;
        }
    }

    public hasAlign(value: number) {
        return $util.hasBit(this.alignmentType, value);
    }

    public hasResource(value: number) {
        return !$util.hasBit(this.excludeResource, value);
    }

    public hasProcedure(value: number) {
        return !$util.hasBit(this.excludeProcedure, value);
    }

    public hasSection(value: number) {
        return !$util.hasBit(this.excludeSection, value);
    }

    public exclude(resource = 0, procedure = 0, section = 0) {
        if (resource > 0 && !$util.hasBit(this._excludeResource, resource)) {
            this._excludeResource |= resource;
        }
        if (procedure > 0 && !$util.hasBit(this._excludeProcedure, procedure)) {
            this._excludeProcedure |= procedure;
        }
        if (section > 0 && !$util.hasBit(this._excludeSection, section)) {
            this._excludeSection |= section;
        }
    }

    public setExclusions() {
        if (this.styleElement) {
            const parent = this.actualParent;
            const parseExclusions = (attr: string, enumeration: {}) => {
                let exclude = this.dataset[attr] || '';
                let offset = 0;
                if (parent && parent.dataset[`${attr}Child`]) {
                    exclude += (exclude !== '' ? '|' : '') + parent.dataset[`${attr}Child`];
                }
                if (exclude !== '') {
                    for (let name of exclude.split('|')) {
                        name = name.trim().toUpperCase();
                        if (enumeration[name] && !$util.hasBit(offset, enumeration[name])) {
                            offset |= enumeration[name];
                        }
                    }
                }
                return offset;
            };
            this.exclude(
                parseExclusions('excludeResource', NODE_RESOURCE),
                parseExclusions('excludeProcedure', NODE_PROCEDURE),
                parseExclusions('excludeSection', APP_SECTION)
            );
        }
    }

    public appendTry(node: T, replacement: T, append = true) {
        let valid = false;
        const children = this.children as T[];
        const length = children.length;
        for (let i = 0; i < length; i++) {
            if (children[i] === node) {
                children[i] = replacement;
                replacement.parent = this;
                replacement.containerIndex = node.containerIndex;
                valid = true;
                break;
            }
        }
        if (!valid && append) {
            replacement.parent = this;
            valid = true;
        }
        return valid;
    }

    public sort(predicate?: (a: T, b: T) => number) {
        if (predicate) {
            super.sort(predicate);
        }
        else {
            this.children.sort((a: T, b: T) => a.containerIndex < b.containerIndex ? -1 : 1);
        }
        return this;
    }

    public alignedVertically(siblings?: T[], cleared?: Map<T, string>, horizontal?: boolean) {
        if (this.lineBreak) {
            return NODE_TRAVERSE.LINEBREAK;
        }
        else if (this.pageFlow || this.positionAuto) {
            const isBlockWrap = (node: T) => node.blockVertical || node.percentWidth;
            const checkBlockDimension = (previous: T) => $util.aboveRange(this.linear.top, previous.linear.bottom) && (isBlockWrap(this) || isBlockWrap(previous) || this.float !== previous.float);
            if ($util.isArray(siblings)) {
                if (cleared && cleared.has(this)) {
                    return NODE_TRAVERSE.FLOAT_CLEAR;
                }
                else {
                    const lastSibling = siblings[siblings.length - 1];
                    if (this.floating && lastSibling.floating) {
                        if (horizontal && this.float === lastSibling.float) {
                            return NODE_TRAVERSE.HORIZONTAL;
                        }
                        else if ($util.aboveRange(this.linear.top, lastSibling.linear.bottom)) {
                            return NODE_TRAVERSE.FLOAT_WRAP;
                        }
                        else if (horizontal && cleared && !siblings.some((item, index) => index > 0 && cleared.get(item) === this.float)) {
                            return NODE_TRAVERSE.HORIZONTAL;
                        }
                    }
                    else if (horizontal === false && this.floating && lastSibling.blockStatic) {
                        return NODE_TRAVERSE.HORIZONTAL;
                    }
                    else if (horizontal !== undefined) {
                        if (!this.display.startsWith('inline-')) {
                            const { top, bottom } = this.linear;
                            if (this.textElement && cleared && cleared.size && siblings.some((item, index) => index > 0 && cleared.has(item)) && siblings.some(item => top < item.linear.top && bottom > item.linear.bottom)) {
                                return NODE_TRAVERSE.FLOAT_INTERSECT;
                            }
                            else if (siblings[0].float === $const.CSS.RIGHT) {
                                if (siblings.length > 1) {
                                    let minTop = Number.POSITIVE_INFINITY;
                                    let maxBottom = Number.NEGATIVE_INFINITY;
                                    let actualBottom = top;
                                    for (const item of siblings) {
                                        if (item.float === $const.CSS.RIGHT) {
                                            if (item.linear.top < minTop) {
                                                minTop = item.linear.top;
                                            }
                                            if (item.linear.bottom > maxBottom) {
                                                maxBottom = item.linear.bottom;
                                            }
                                        }
                                    }
                                    if (this.multiline) {
                                        actualBottom = bottom;
                                        if (this.textElement && !this.plainText) {
                                            const rect = $session.getRangeClientRect(<Element> this._element, this.sessionId);
                                            if (rect.bottom > bottom) {
                                                actualBottom = rect.bottom;
                                            }
                                        }
                                    }
                                    if ($util.belowRange(actualBottom, maxBottom)) {
                                        return horizontal ? NODE_TRAVERSE.HORIZONTAL : NODE_TRAVERSE.FLOAT_BLOCK;
                                    }
                                    else {
                                        return horizontal ? NODE_TRAVERSE.FLOAT_BLOCK : NODE_TRAVERSE.HORIZONTAL;
                                    }
                                }
                                else if (!horizontal) {
                                    return NODE_TRAVERSE.FLOAT_BLOCK;
                                }
                            }
                        }
                    }
                    if (this.blockDimension && checkBlockDimension(lastSibling)) {
                        return NODE_TRAVERSE.INLINE_WRAP;
                    }
                }
            }
            if (this.blockDimension && this.css($const.CSS.WIDTH) === $const.CSS.PERCENT_100 && !this.hasPX('maxWidth')) {
                return NODE_TRAVERSE.VERTICAL;
            }
            const parent = this.actualParent || this.documentParent;
            const blockStatic = this.blockStatic || this.display === 'table';
            for (const previous of this.siblingsLeading) {
                if (previous.lineBreak) {
                    return NODE_TRAVERSE.LINEBREAK;
                }
                else if (cleared && cleared.get(previous) === 'both' && (!$util.isArray(siblings) || siblings[0] !== previous)) {
                    return NODE_TRAVERSE.FLOAT_CLEAR;
                }
                else if (
                    blockStatic && (!previous.floating || !previous.rightAligned && $util.withinRange(previous.linear.right, parent.box.right) || cleared && cleared.has(previous)) ||
                    previous.blockStatic ||
                    previous.autoMargin.leftRight ||
                    previous.float === $const.CSS.LEFT && this.autoMargin.right ||
                    previous.float === $const.CSS.RIGHT && this.autoMargin.left)
                {
                    return NODE_TRAVERSE.VERTICAL;
                }
                else if (this.blockDimension && checkBlockDimension(previous)) {
                    return NODE_TRAVERSE.INLINE_WRAP;
                }
            }
        }
        return NODE_TRAVERSE.HORIZONTAL;
    }

    public previousSiblings(options: SiblingOptions = {}) {
        const floating = options.floating;
        const pageFlow = options.pageFlow;
        const lineBreak = options.lineBreak;
        const excluded = options.excluded;
        const result: T[] = [];
        let element = this.element;
        if (element) {
            element = <Element> element.previousSibling;
        }
        else {
            const node = this.firstChild;
            if (node) {
                element = <Element> node.element;
                if (element) {
                    element = element.previousSibling as Element;
                }
            }
        }
        while (element) {
            const node = $session.getElementAsNode<T>(element, this.sessionId);
            if (node) {
                if (lineBreak !== false && node.lineBreak || excluded !== false && node.excluded) {
                    result.push(node);
                }
                else if (node.pageFlow && !node.excluded) {
                    if (pageFlow === false) {
                        break;
                    }
                    result.push(node);
                    if (floating !== false || !node.floating && (node.visible || node.rendered) && node.display !== 'none') {
                        break;
                    }
                }
            }
            element = <Element> element.previousSibling;
        }
        return result;
    }

    public nextSiblings(options: SiblingOptions = {}) {
        const floating = options.floating;
        const pageFlow = options.pageFlow;
        const lineBreak = options.lineBreak;
        const excluded = options.excluded;
        const result: T[] = [];
        let element = this._element;
        if (element) {
            element = <Element> element.nextSibling;
        }
        else {
            const node = this.lastChild;
            if (node) {
                element = <Element> node.element;
                if (element) {
                    element = element.nextSibling as Element;
                }
            }
        }
        while (element) {
            const node = $session.getElementAsNode<T>(element, this.sessionId);
            if (node) {
                if (lineBreak !== false && node.lineBreak || excluded !== false && node.excluded) {
                    result.push(node);
                }
                else if (node.pageFlow && !node.excluded) {
                    if (pageFlow === false) {
                        break;
                    }
                    result.push(node);
                    if (floating !== false || !node.floating && (node.visible || node.rendered) && node.display !== 'none') {
                        break;
                    }
                }
            }
            element = <Element> element.nextSibling;
        }
        return result;
    }

    public modifyBox(region: number, offset?: number, negative = true) {
        if (offset !== 0) {
            const attr = CSS_SPACING.get(region);
            if (attr) {
                if (offset === undefined) {
                    if (this._boxReset === undefined) {
                        this._boxReset = $dom.newBoxModel();
                    }
                    this._boxReset[attr] = 1;
                }
                else {
                    if (this._boxAdjustment === undefined) {
                        this._boxAdjustment = $dom.newBoxModel();
                    }
                    if (!negative) {
                        if (this[attr] + this._boxAdjustment[attr] + offset <= 0) {
                            if (this._boxReset === undefined) {
                                this._boxReset = $dom.newBoxModel();
                            }
                            this._boxReset[attr] = 1;
                            this._boxAdjustment[attr] = 0;
                        }
                        else {
                            this._boxAdjustment[attr] += offset;
                        }
                    }
                    else {
                        this._boxAdjustment[attr] += offset;
                    }
                }
            }
        }
    }

    public getBox(region: number): [number, number] {
        const attr = CSS_SPACING.get(region);
        return attr ? [this._boxReset ? this._boxReset[attr] : 0, this._boxAdjustment ? this._boxAdjustment[attr] : 0] : [0, 0];
    }

    public resetBox(region: number, node?: T, fromParent = false) {
        if (this._boxReset === undefined) {
            this._boxReset = $dom.newBoxModel();
        }
        const boxReset = this._boxReset;
        const applyReset = (attrs: string[], start: number) => {
            for (let i = 0; i < 4; i++) {
                if (boxReset[attrs[i]] === 0) {
                    boxReset[attrs[i]] = 1;
                    const attr = CSS_SPACING.get(CSS_SPACING_KEYS[i + start]) as string;
                    const value = this[attr];
                    if (node && value !== 0) {
                        if (!node.naturalChild && node[attr] === 0) {
                            node.css(attr, $css.formatPX(value), true);
                        }
                        else {
                            node.modifyBox(CSS_SPACING_KEYS[i + (fromParent ? 0 : 4)], value);
                        }
                    }
                }
            }
        };
        if ($util.hasBit(region, BOX_STANDARD.MARGIN)) {
            applyReset($css.BOX_MARGIN, 0);
        }
        if ($util.hasBit(region, BOX_STANDARD.PADDING)) {
            applyReset($css.BOX_PADDING, 4);
        }
    }

    public transferBox(region: number, node: T) {
        const boxAdjustment = this._boxAdjustment;
        if (boxAdjustment) {
            const applyReset = (attrs: string[], start: number) => {
                for (let i = 0; i < 4; i++) {
                    const value: number = boxAdjustment[attrs[i]];
                    if (value > 0) {
                        node.modifyBox(CSS_SPACING_KEYS[i + start], value, false);
                        boxAdjustment[attrs[i]] = 0;
                    }
                }
            };
            if ($util.hasBit(region, BOX_STANDARD.MARGIN)) {
                applyReset($css.BOX_MARGIN, 0);
            }
            if ($util.hasBit(region, BOX_STANDARD.PADDING)) {
                applyReset($css.BOX_PADDING, 4);
            }
        }
    }

    public actualRect(direction: string, dimension = 'linear') {
        let node: T;
        switch (direction) {
            case $const.CSS.TOP:
            case $const.CSS.LEFT:
                node = this.companion && !this.companion.visible && this.companion[dimension][direction] < this[dimension][direction] ? this.companion : this;
                break;
            case $const.CSS.RIGHT:
            case $const.CSS.BOTTOM:
                node = this.companion && !this.companion.visible && this.companion[dimension][direction] > this[dimension][direction] ? this.companion : this;
                break;
            default:
                return NaN;
        }
        return node[dimension][direction] as number;
    }

    public cloneBase(node: T) {
        node.localSettings = this.localSettings;
        node.alignmentType = this.alignmentType;
        node.containerName = this.containerName;
        node.depth = this.depth;
        node.visible = this.visible;
        node.excluded = this.excluded;
        node.rendered = this.rendered;
        node.childIndex = this.childIndex;
        node.containerIndex = this.containerIndex;
        node.inlineText = this.inlineText;
        node.lineBreakLeading = this.lineBreakLeading;
        node.lineBreakTrailing = this.lineBreakTrailing;
        node.actualParent = this.actualParent;
        node.documentParent = this.documentParent;
        node.documentRoot = this.documentRoot;
        node.renderParent = this.renderParent;
        if (this.length) {
            node.retain(this.duplicate());
        }
        node.inherit(this, 'initial', 'base', 'alignment', 'styleMap', 'textStyle');
        Object.assign(node.unsafe('cached'), this._cached);
    }

    get element() {
        let element = this._element;
        if (element === null) {
            let current = this.innerWrapped;
            while (current) {
                element = <Element | null> current.unsafe('element');
                if (element) {
                    break;
                }
                current = current.innerWrapped;
            }
        }
        return element;
    }

    get naturalChild() {
        return this._element !== null;
    }

    get pseudoElement() {
        return this._element !== null && this._element.className === '__squared.pseudo';
    }

    set containerName(value) {
        this._cached.containerName = value.toUpperCase();
    }
    get containerName() {
        if (this._cached.containerName === undefined) {
            const element = <HTMLInputElement> this.element;
            let value = '';
            if (element) {
                if (element.nodeName === '#text') {
                    value = 'PLAINTEXT';
                }
                else if (element.tagName === 'INPUT') {
                    value = `INPUT_${element.type}`;
                }
                else {
                    value = element.tagName;
                }
                value = value.toUpperCase();
            }
            this._cached.containerName = value;
        }
        return this._cached.containerName;
    }

    get excludeSection() {
        return this._excludeSection;
    }

    get excludeProcedure() {
        return this._excludeProcedure;
    }

    get excludeResource() {
        return this._excludeResource;
    }

    get layoutHorizontal() {
        return this.hasAlign(NODE_ALIGNMENT.HORIZONTAL);
    }
    get layoutVertical() {
        return this.hasAlign(NODE_ALIGNMENT.VERTICAL);
    }

    get nodeGroup() {
        return false;
    }

    set renderAs(value) {
        if (!this.rendered && value && !value.rendered) {
            this._renderAs = value;
        }
    }
    get renderAs() {
        return this._renderAs;
    }

    get blockStatic() {
        return super.blockStatic || this.hasAlign(NODE_ALIGNMENT.BLOCK) && !this.floating;
    }

    get rightAligned() {
        return super.rightAligned || this.hasAlign(NODE_ALIGNMENT.RIGHT);
    }

    set positionAuto(value: boolean) {
        this._cached.positionAuto = value;
    }
    get positionAuto() {
        return super.positionAuto;
    }

    set flexbox(value: Flexbox) {
        this._cached.flexbox = value;
    }
    get flexbox() {
        return super.flexbox;
    }

    set contentBoxWidth(value: number) {
        this._cached.contentBoxWidth = value;
    }
    get contentBoxWidth() {
        return super.contentBoxWidth;
    }

    set contentBoxHeight(value: number) {
        this._cached.contentBoxHeight = value;
    }
    get contentBoxHeight() {
        return super.contentBoxHeight;
    }

    set textContent(value: string) {
        this._textContent = value;
    }
    get textContent() {
        return this._textContent || super.textContent;
    }

    set overflow(value: number) {
        if (value === 0 || value === NODE_ALIGNMENT.VERTICAL || value === NODE_ALIGNMENT.HORIZONTAL || value === (NODE_ALIGNMENT.HORIZONTAL | NODE_ALIGNMENT.VERTICAL)) {
            if ($util.hasBit(this.overflow, NODE_ALIGNMENT.BLOCK)) {
                value |= NODE_ALIGNMENT.BLOCK;
            }
            this._cached.overflow = value;
        }
    }
    get overflow() {
        return super.overflow;
    }

    set baseline(value: boolean) {
        this._cached.baseline = value;
    }
    get baseline() {
        return super.baseline;
    }

    set multiline(value: boolean) {
        this._cached.multiline = value;
    }
    get multiline() {
        return super.multiline;
    }

    set visible(value) {
        this._visible = value;
    }
    get visible() {
        return this._visible;
    }

    set controlName(value) {
        if (!this.rendered || this._controlName === undefined) {
            this._controlName = value;
        }
    }
    get controlName() {
        return this._controlName || '';
    }

    set siblingsLeading(value) {
        this._siblingsLeading = value;
    }
    get siblingsLeading() {
        if (this._siblingsLeading === undefined) {
            this._siblingsLeading = this.previousSiblings();
        }
        return this._siblingsLeading;
    }

    set siblingsTrailing(value) {
        this._siblingsTrailing = value;
    }
    get siblingsTrailing() {
        if (this._siblingsTrailing === undefined) {
            this._siblingsTrailing = this.nextSiblings();
        }
        return this._siblingsTrailing;
    }

    get previousSibling() {
        const parent = this.actualParent;
        if (parent) {
            const children = <NodeUI[]> parent.naturalChildren;
            const index = children.indexOf(this);
            if (index !== -1) {
                for (let i = index - 1; i >= 0; i--) {
                    const node = children[i];
                    if (node && (!node.excluded || node.lineBreak)) {
                        return node;
                    }
                }
            }
        }
        return null;
    }

    get nextSibling() {
        const parent = this.actualParent;
        if (parent) {
            const children = <NodeUI[]> parent.naturalChildren;
            const index = children.indexOf(this);
            if (index !== -1) {
                const length = children.length;
                for (let i = index + 1; i < length; i++) {
                    const node = children[i];
                    if (node && (!node.excluded || node.lineBreak)) {
                        return node;
                    }
                }
            }
        }
        return null;
    }

    get firstChild() {
        return this.naturalChildren[0] || null;
    }

    get lastChild() {
        const children = this.naturalChildren;
        return children.length ? children[children.length - 1] : null;
    }

    get onlyChild() {
        if (this.renderParent) {
            return this.renderParent.length === 1;
        }
        else if (this.parent && this.parent.id !== 0) {
            return this.parent.length === 1;
        }
        return false;
    }

    get textEmpty() {
        if (this._cached.textEmpty === undefined) {
            this._cached.textEmpty = this.naturalElement && (this.textContent === '' || !this.preserveWhiteSpace && this.textContent.trim() === '');
        }
        return this._cached.textEmpty;
    }

    get preserveWhiteSpace() {
        if (this._cached.whiteSpace === undefined) {
            this._cached.whiteSpace = this.cssAny('whiteSpace', 'pre', 'pre-wrap');
        }
        return this._cached.whiteSpace;
    }
}