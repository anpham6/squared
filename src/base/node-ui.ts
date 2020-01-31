import { NodeTemplate } from '../../@types/base/application';
import { CachedValueUI, ExcludeOptions, InitialData, LinearData, LocalSettingsUI, SiblingOptions, Support } from '../../@types/base/node';

import Node from './node';

import { CSS_SPACING } from './lib/constant';
import { APP_SECTION, BOX_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE, NODE_TRAVERSE } from './lib/enumeration';

const $lib = squared.lib;
const { BOX_MARGIN, BOX_PADDING, BOX_POSITION, formatPX, isLength, isPercent } = $lib.css;
const { isTextNode, newBoxModel } = $lib.dom;
const { isEqual } = $lib.math;
const { XML } = $lib.regex;
const { getElementAsNode } = $lib.session;
const { aboveRange, assignEmptyProperty, belowRange, cloneObject, convertWord, filterArray, hasBit, isArray, searchObject, spliceArray, withinRange } = $lib.util;

type T = NodeUI;

const CSS_SPACING_KEYS = Array.from(CSS_SPACING.keys());
const INHERIT_ALIGNMENT = ['position', 'display', 'verticalAlign', 'float', 'clear', 'zIndex'];

function cascadeActualPadding(children: T[], attr: string, value: number) {
    let valid = false;
    for (const item of children) {
        if (item.blockStatic) {
            return false;
        }
        else if (item.inlineStatic) {
            if (item.has('lineHeight') && item.lineHeight > item.bounds.height) {
                return false;
            }
            else if (item[attr] >= value) {
                valid = true;
            }
            else if (canCascadeChildren(item)) {
                if (!cascadeActualPadding(item.naturalElements as T[], attr, value)) {
                    return false;
                }
                else {
                    valid = true;
                }
            }
        }
    }
    return valid;
}

function traverseElementSibling(options: SiblingOptions = {}, element: Null<Element>, direction: "previousSibling" | "nextSibling", sessionId: string) {
    const { floating, pageFlow, lineBreak, excluded } = options;
    const result: T[] = [];
    while (element) {
        const node = getElementAsNode<T>(element, sessionId);
        if (node) {
            if (lineBreak !== false && node.lineBreak || excluded !== false && node.excluded && !node.lineBreak) {
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
        element = <Element> element[direction];
    }
    return result;
}

const canCascadeChildren = (node: T) => node.naturalElements.length > 0 && !node.layoutElement && !node.tableElement;
const isBlockWrap = (node: T) => node.blockVertical || node.percentWidth;
const checkBlockDimension = (node: T, previous: T) => aboveRange(node.linear.top, previous.linear.bottom) && (isBlockWrap(node) || isBlockWrap(previous) || node.float !== previous.float);

export default abstract class NodeUI extends Node implements squared.base.NodeUI {
    public static outerRegion(node: T): BoxRectDimension {
        let top = Number.POSITIVE_INFINITY;
        let right = Number.NEGATIVE_INFINITY;
        let bottom = Number.NEGATIVE_INFINITY;
        let left = Number.POSITIVE_INFINITY;
        let negativeRight = Number.NEGATIVE_INFINITY;
        let negativeBottom = Number.NEGATIVE_INFINITY;
        let actualTop: number;
        let actualRight: number;
        let actualBottom: number;
        let actualLeft: number;
        node.each((item: T) => {
            if (item.companion) {
                actualTop = item.actualRect('top');
                actualRight = item.actualRect('right');
                actualBottom = item.actualRect('bottom');
                actualLeft = item.actualRect('left');
            }
            else {
                ({ top: actualTop, right: actualRight, bottom: actualBottom, left: actualLeft } = item.linear);
                if (item.marginRight < 0) {
                    const value = actualRight + Math.abs(item.marginRight);
                    if (value > negativeRight) {
                        negativeRight = value;
                    }
                }
                if (item.marginBottom < 0) {
                    const value = actualBottom + Math.abs(item.marginBottom);
                    if (value > negativeBottom) {
                        negativeBottom = value;
                    }
                }
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
            left,
            width: Math.max(right, negativeRight) - left,
            height: Math.max(bottom, negativeBottom) - top
        };
    }

    public static baseline<T extends NodeUI>(list: T[], text = false): Null<T> {
        const result: T[] = [];
        for (const item of list) {
            if ((item.baseline || isLength(item.verticalAlign)) && (!text || item.textElement) && !item.floating && (item.naturalChild && item.length === 0 || !item.layoutVertical && item.every(child => child.baseline && !child.multiline)) && !item.baselineAltered) {
                result.push(item);
            }
        }
        if (result.length > 1) {
            result.sort((a, b) => {
                if (a.length && b.length === 0) {
                    return 1;
                }
                else if (b.length && a.length === 0) {
                    return -1;
                }
                const heightA = a.baselineHeight + a.marginTop;
                const heightB = b.baselineHeight + b.marginTop;
                if (!isEqual(heightA, heightB)) {
                    return heightA > heightB ? -1 : 1;
                }
                else if (a.textElement && b.textElement) {
                    if (!a.plainText && b.plainText) {
                        return -1;
                    }
                    else if (a.plainText && !b.plainText) {
                        return 1;
                    }
                }
                else if (a.inputElement && b.inputElement && a.containerType !== b.containerType) {
                    return a.containerType > b.containerType ? -1 : 1;
                }
                else if (b.textElement && a.inputElement && b.childIndex < a.childIndex) {
                    return 1;
                }
                else if (a.textElement && b.inputElement && a.childIndex < b.childIndex) {
                    return -1;
                }
                const bottomA = a.bounds.bottom;
                const bottomB = b.bounds.bottom;
                if (bottomA > bottomB) {
                    return -1;
                }
                else if (bottomA < bottomB) {
                    return 1;
                }
                return 0;
            });
        }
        return result[0] || null;
    }

    public static linearData<T extends NodeUI>(list: T[], clearOnly = false): LinearData<T> {
        const floated = new Set<string>();
        const cleared = new Map<T, string>();
        let linearX = false;
        let linearY = false;
        if (list.length > 1) {
            const nodes: T[] = [];
            const floating = new Set<string>();
            const clearable: ObjectMap<Undef<T>> = {};
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
                        if (!node.floating) {
                            for (const item of previousFloat) {
                                if (item) {
                                    const float = item.float;
                                    if (floating.has(float) && aboveRange(node.linear.top, item.linear.bottom)) {
                                        floating.delete(float);
                                        clearable[float] = undefined;
                                    }
                                }
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
                        const float = node.float;
                        floating.add(float);
                        floated.add(float);
                        clearable[float] = node;
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
                        const node = nodes[i];
                        if (node.alignedVertically(siblings, cleared)) {
                            y++;
                        }
                        else {
                            x++;
                        }
                        siblings.push(node);
                    }
                    linearX = x === length;
                    linearY = y === length;
                    if (linearX && floated.size) {
                        let boxLeft = Number.POSITIVE_INFINITY;
                        let boxRight = Number.NEGATIVE_INFINITY;
                        let floatLeft = Number.NEGATIVE_INFINITY;
                        let floatRight = Number.POSITIVE_INFINITY;
                        for (const node of nodes) {
                            const { left, right } = node.linear;
                            boxLeft = Math.min(boxLeft, left);
                            boxRight = Math.max(boxRight, right);
                            if (node.floating) {
                                if (node.float === 'left') {
                                    floatLeft = Math.max(floatLeft, right);
                                }
                                else {
                                    floatRight = Math.min(floatRight, left);
                                }
                            }
                        }
                        for (let i = 0, j = 0, k = 0, l = 0, m = 0; i < length; i++) {
                            const node = nodes[i];
                            const { left, right } = node.linear;
                            if (Math.floor(left) <= boxLeft) {
                                j++;
                            }
                            if (Math.ceil(right) >= boxRight) {
                                k++;
                            }
                            if (!node.floating) {
                                if (left === floatLeft) {
                                    l++;
                                }
                                if (right === floatRight) {
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
                            if (withinRange(left, previous.linear.left) || previous.floating && aboveRange(node.linear.top, previous.linear.bottom)) {
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
        return { linearX, linearY, cleared, floated };
    }

    public static partitionRows(list: T[]) {
        const parent = list[0].actualParent;
        const cleared = parent?.floatContainer ? NodeUI.linearData(parent.naturalElements as T[], true).cleared : undefined;
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
                let wrapped = node.innerWrapped;
                while (wrapped) {
                    if (wrapped.naturalChild) {
                        active = wrapped;
                        break;
                    }
                    wrapped = wrapped.innerWrapped;
                }
            }
            if (row.length === 0) {
                row.push(node);
                siblings.push(active);
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
    public floatContainer = false;
    public lineBreakLeading = false;
    public lineBreakTrailing = false;
    public abstract localSettings: LocalSettingsUI;
    public abstract renderParent?: T;
    public abstract renderExtension?: squared.base.ExtensionUI<T>[];
    public abstract renderTemplates?: Null<NodeTemplate<T>>[];
    public abstract outerWrapper?: T;
    public abstract innerWrapped?: T;
    public abstract innerBefore?: T;
    public abstract innerAfter?: T;
    public abstract companion?: T;
    public abstract labelFor?: T;
    public abstract extracted?: T[];
    public abstract horizontalRows?: T[][];
    public abstract readonly renderChildren: T[];

    protected _documentParent?: T;
    protected _controlName?: string;
    protected _boxRegister?: ObjectMap<Set<T>>;
    protected abstract _cached: CachedValueUI<T>;
    protected abstract _namespaces: string[];
    protected abstract _boxAdjustment?: BoxModel;
    protected abstract _boxReset?: BoxModel;

    private _excludeSection = 0;
    private _excludeProcedure = 0;
    private _excludeResource = 0;
    private _childIndex = Number.POSITIVE_INFINITY;
    private _containerIndex = Number.POSITIVE_INFINITY;
    private _visible = true;
    private _locked: ObjectMapNested<boolean> = {};
    private _siblingsLeading?: T[];
    private _siblingsTrailing?: T[];
    private _renderAs?: T;

    public abstract setControlType(viewName: string, containerType?: number): void;
    public abstract setLayout(width?: number, height?: number): void;
    public abstract setAlignment(): void;
    public abstract setBoxSpacing(): void;
    public abstract apply(options: {}): void;
    public abstract clone(id?: number, attributes?: boolean, position?: boolean): T;
    public abstract extractAttributes(depth?: number): string;
    public abstract alignParent(position: string): boolean;
    public abstract alignSibling(position: string, documentId?: string): string;
    public abstract actualRect(direction: string, dimension?: BoxType): number;
    public abstract localizeString(value: string): string;

    public abstract set containerType(value: number);
    public abstract get containerType(): number;
    public abstract set controlId(name: string);
    public abstract get controlId(): string;
    public abstract get documentId(): string;
    public abstract get baselineHeight(): number;
    public abstract get support(): Support;
    public abstract set renderExclude(value: boolean);
    public abstract get renderExclude(): boolean;

    public is(containerType: number) {
        return this.containerType === containerType;
    }

    public of(containerType: number, ...alignmentType: number[]) {
        return this.is(containerType) && alignmentType.some(value => this.hasAlign(value));
    }

    public attr(name: string, attr: string, value?: string, overwrite = true): string {
        let obj: StringMap = this['__' + name];
        if (value) {
            if (obj === undefined) {
                if (!this._namespaces.includes(name)) {
                    this._namespaces.push(name);
                }
                obj = {};
                this['__' + name] = obj;
            }
            if (overwrite && this.lockedAttr(name, attr)) {
                overwrite = false;
            }
            if (!overwrite && obj[attr]) {
                value = obj[attr];
            }
            else {
                obj[attr] = value;
            }
            return value;
        }
        else {
            return obj?.[attr] || '';
        }
    }

    public unsafe(name: string, value?: any): any {
        if (value !== undefined) {
            this['_' + name] = value;
        }
        else {
            return this['_' + name];
        }
    }

    public unset(name: string) {
        delete this['_' + name];
    }

    public namespace(name: string): StringMap {
        return this['__' + name] || {};
    }

    public delete(name: string, ...attrs: string[]) {
        const obj = this['__' + name];
        if (obj) {
            for (const attr of attrs) {
                if (attr.includes('*')) {
                    for (const [key] of searchObject(obj, attr)) {
                        delete obj[key];
                    }
                }
                else {
                    delete obj[attr];
                }
            }
        }
    }

    public lockAttr(name: string, attr: string) {
        const locked = this._locked;
        let lockedData = locked[name];
        if (lockedData === undefined) {
            lockedData = {};
            locked[name] = lockedData;
        }
        lockedData[attr] = true;
    }

    public unlockAttr(name: string, attr: string) {
        const locked = this._locked[name];
        if (locked) {
            locked[attr] = false;
        }
    }

    public lockedAttr(name: string, attr: string) {
        return this._locked[name]?.[attr] || false;
    }

    public render(parent?: T) {
        this.renderParent = parent;
        this.rendered = true;
    }

    public parseUnit(value: string, dimension = 'width', parent = true, screenDimension?: Dimension) {
        return super.parseUnit(value, dimension, parent, screenDimension || this.localSettings.screenDimension);
    }

    public convertPX(value: string, dimension = 'width', parent = true, screenDimension?: Dimension) {
        return super.convertPX(value, dimension, parent, screenDimension || this.localSettings.screenDimension);
    }

    public renderEach(predicate: IteratorPredicate<T, void>) {
        const children = this.renderChildren;
        const length = children.length;
        for (let i = 0; i < length; i++) {
            const item = children[i];
            if (item.visible) {
                predicate(item, i, children);
            }
        }
        return this;
    }

    public renderFilter(predicate: IteratorPredicate<T, boolean>) {
        return filterArray(this.renderChildren, predicate);
    }

    public hide(invisible?: boolean) {
        const renderParent = this.renderParent;
        if (renderParent) {
            const renderTemplates = renderParent.renderTemplates;
            if (renderTemplates) {
                const index = renderParent.renderChildren.findIndex(node => node === this);
                if (index !== -1) {
                    const template = renderTemplates[index];
                    if (template?.node === this) {
                        renderTemplates[index] = null;
                    }
                }
            }
        }
        this.rendered = true;
        this.visible = false;
    }

    public inherit(node: T, ...modules: string[]) {
        for (const name of modules) {
            switch (name) {
                case 'base': {
                    this._documentParent = node.documentParent;
                    this._bounds =  { ...node.bounds };
                    this._linear = { ...node.linear };
                    this._box = { ...node.box };
                    this._boxReset = newBoxModel();
                    this._boxAdjustment = newBoxModel();
                    if (this.depth === -1) {
                        this.depth = node.depth;
                    }
                    const actualParent = node.actualParent;
                    if (actualParent) {
                        this.actualParent = actualParent;
                        this.dir = actualParent.dir;
                    }
                    break;
                }
                case 'initial':
                    cloneObject(<InitialData<T>> node.unsafe('initial'), this.initial);
                    break;
                case 'alignment': {
                    const styleMap = this._styleMap;
                    for (const attr of INHERIT_ALIGNMENT) {
                        styleMap[attr] = node.css(attr);
                    }
                    if (!this.positionStatic) {
                        for (const attr of BOX_POSITION) {
                            if (node.hasPX(attr)) {
                                styleMap[attr] = node.css(attr);
                            }
                        }
                    }
                    if (node.autoMargin.horizontal || node.autoMargin.vertical) {
                        for (const attr of BOX_MARGIN) {
                            if (node.cssInitial(attr) === 'auto') {
                                styleMap[attr] = 'auto';
                            }
                        }
                    }
                    this.positionAuto = node.positionAuto;
                    break;
                }
                case 'styleMap':
                    assignEmptyProperty(this._styleMap, node.unsafe('styleMap'));
                    break;
                case 'textStyle':
                    this.cssApply(node.textStyle);
                    this.fontSize = node.fontSize;
                    break;
                case 'boxStyle': {
                    const { backgroundColor, backgroundImage } = node;
                    this.cssApply({
                        backgroundColor,
                        backgroundImage,
                        backgroundRepeat: node.css('backgroundRepeat'),
                        backgroundSize: node.css('backgroundSize'),
                        backgroundPositionX: node.css('backgroundPositionX'),
                        backgroundPositionY: node.css('backgroundPositionY'),
                        backgroundClip: node.css('backgroundClip'),
                        boxSizing: node.css('boxSizing'),
                        border: 'initial',
                        borderRadius: 'initial',
                        borderTopWidth: node.css('borderTopWidth'),
                        borderBottomWidth: node.css('borderBottomWidth'),
                        borderRightWidth: node.css('borderRightWidth'),
                        borderLeftWidth: node.css('borderLeftWidth'),
                        borderTopColor: node.css('borderTopColor'),
                        borderBottomColor: node.css('borderBottomColor'),
                        borderRightColor: node.css('borderRightColor'),
                        borderLeftColor: node.css('borderLeftColor'),
                        borderTopStyle: node.css('borderTopStyle'),
                        borderBottomStyle: node.css('borderBottomStyle'),
                        borderRightStyle: node.css('borderRightStyle'),
                        borderLeftStyle: node.css('borderLeftStyle'),
                        borderTopLeftRadius: node.css('borderTopLeftRadius'),
                        borderTopRightRadius: node.css('borderTopRightRadius'),
                        borderBottomRightRadius: node.css('borderBottomRightRadius'),
                        borderBottomLeftRadius: node.css('borderBottomLeftRadius')
                    }, true);
                    this.setCacheValue('backgroundColor', backgroundColor);
                    this.setCacheValue('backgroundImage', backgroundImage);
                    node.cssApply({
                        borderTopWidth: '0px',
                        borderBottomWidth: '0px',
                        borderRightWidth: '0px',
                        borderLeftWidth: '0px',
                        backgroundColor: 'transparent',
                        backgroundImage: 'none',
                        border: '0px none solid',
                        borderRadius: '0px'
                    }, true);
                    node.setCacheValue('backgroundColor', '');
                    node.setCacheValue('backgroundImage', '');
                    node.resetBox(BOX_STANDARD.MARGIN | BOX_STANDARD.PADDING, this);
                    break;
                }
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
        return hasBit(this.alignmentType, value);
    }

    public hasResource(value: number) {
        return !hasBit(this.excludeResource, value);
    }

    public hasProcedure(value: number) {
        return !hasBit(this.excludeProcedure, value);
    }

    public hasSection(value: number) {
        return !hasBit(this.excludeSection, value);
    }

    public exclude(options: ExcludeOptions) {
        const { resource, procedure, section } = options;
        if (resource && !hasBit(this._excludeResource, resource)) {
            this._excludeResource |= resource;
        }
        if (procedure && !hasBit(this._excludeProcedure, procedure)) {
            this._excludeProcedure |= procedure;
        }
        if (section && !hasBit(this._excludeSection, section)) {
            this._excludeSection |= section;
        }
    }

    public setExclusions() {
        if (this.styleElement) {
            const dataset = (this._element as HTMLElement).dataset;
            const parentDataset = this.actualParent?.dataset || {};
            if (Object.keys(dataset).length || Object.keys(parentDataset).length) {
                const parseExclusions = (attr: string, enumeration: {}) => {
                    let exclude = dataset[attr] || '';
                    let offset = 0;
                    const value = parentDataset[attr + 'Child'];
                    if (value) {
                        exclude += (exclude !== '' ? '|' : '') + value;
                    }
                    if (exclude !== '') {
                        for (const name of exclude.split(/\s*\|\s*/)) {
                            const i: number = enumeration[name.toUpperCase()] || 0;
                            if (i > 0 && !hasBit(offset, i)) {
                                offset |= i;
                            }
                        }
                    }
                    return offset;
                };
                this.exclude({
                    resource: parseExclusions('excludeResource', NODE_RESOURCE),
                    procedure: parseExclusions('excludeProcedure', NODE_PROCEDURE),
                    section: parseExclusions('excludeSection', APP_SECTION)
                });
            }
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
            const blockDimension = this.blockDimension;
            if (isArray(siblings)) {
                if (cleared?.has(this)) {
                    return NODE_TRAVERSE.FLOAT_CLEAR;
                }
                else {
                    const previous = siblings[siblings.length - 1];
                    const floating = this.floating;
                    if (floating && previous.floating) {
                        const float = this.float;
                        if (horizontal && (float === previous.float || cleared?.size && !siblings.some((item, index) => index > 0 && cleared.get(item) === float))) {
                            return NODE_TRAVERSE.HORIZONTAL;
                        }
                        else if (aboveRange(this.linear.top, previous.linear.bottom)) {
                            return NODE_TRAVERSE.FLOAT_WRAP;
                        }
                    }
                    else if (floating && siblings.some(item => item.multiline)) {
                        return NODE_TRAVERSE.FLOAT_WRAP;
                    }
                    else if (!floating && siblings.every(item => item.float === 'right' && aboveRange(this.textBounds?.top || Number.NEGATIVE_INFINITY, item.bounds.bottom))) {
                        return NODE_TRAVERSE.FLOAT_BLOCK;
                    }
                    else if (horizontal !== undefined) {
                        if (floating && previous.blockStatic && !horizontal) {
                            return NODE_TRAVERSE.HORIZONTAL;
                        }
                        else if (!/^inline-/.test(this.display)) {
                            const { top, bottom } = this.linear;
                            if (this.textElement && cleared?.size && siblings.some(item => cleared.has(item)) && siblings.some(item => top < item.linear.top && bottom > item.linear.bottom)) {
                                return NODE_TRAVERSE.FLOAT_INTERSECT;
                            }
                            else if (siblings[0].float === 'right') {
                                if (siblings.length > 1) {
                                    let actualTop = top;
                                    if (this.multiline) {
                                        if (this.plainText) {
                                            actualTop = bottom;
                                        }
                                        else if (this.styleText) {
                                            const textBounds = this.textBounds;
                                            if (textBounds) {
                                                actualTop = Math.max(top, siblings.length > 2 ? (textBounds.top + textBounds.bottom) * 0.5 : actualTop);
                                            }
                                        }
                                    }
                                    let maxBottom = Number.NEGATIVE_INFINITY;
                                    for (const item of siblings) {
                                        if (item.float === 'right') {
                                            maxBottom = Math.max(item.actualRect('bottom', 'bounds'), maxBottom);
                                        }
                                    }
                                    if (belowRange(actualTop, maxBottom)) {
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
                    if (blockDimension && checkBlockDimension(this, previous)) {
                        return NODE_TRAVERSE.INLINE_WRAP;
                    }
                }
            }
            for (const previous of this.siblingsLeading) {
                if (previous.blockStatic || previous.autoMargin.leftRight) {
                    return NODE_TRAVERSE.VERTICAL;
                }
                else if (previous.lineBreak) {
                    return NODE_TRAVERSE.LINEBREAK;
                }
                else if (cleared?.get(previous) === 'both' && (!isArray(siblings) || siblings[0] !== previous)) {
                    return NODE_TRAVERSE.FLOAT_CLEAR;
                }
                else {
                    const blockStatic = this.blockStatic || this.display === 'table';
                    if (blockStatic && (!previous.floating || !previous.rightAligned && withinRange(previous.linear.right, (this.actualParent || this.documentParent).box.right) || cleared?.has(previous))) {
                        return NODE_TRAVERSE.VERTICAL;
                    }
                    else if (previous.floating) {
                        if (blockDimension && this.css('width') === '100%' && !this.hasPX('maxWidth') || previous.float === 'left' && this.autoMargin.right || previous.float === 'right' && this.autoMargin.left) {
                            return NODE_TRAVERSE.VERTICAL;
                        }
                        else if (blockStatic && this.some(item => item.floating && aboveRange(item.linear.top, previous.linear.bottom))) {
                            return NODE_TRAVERSE.FLOAT_BLOCK;
                        }
                    }
                }
                if (blockDimension && checkBlockDimension(this, previous)) {
                    return NODE_TRAVERSE.INLINE_WRAP;
                }
            }
        }
        return NODE_TRAVERSE.HORIZONTAL;
    }

    public previousSiblings(options: SiblingOptions = {}) {
        return traverseElementSibling(options, <Element> (this.element?.previousSibling || this.innerMostWrapped?.element?.previousSibling || this.firstChild?.element?.previousSibling), 'previousSibling', this.sessionId);
    }

    public nextSiblings(options: SiblingOptions = {}) {
        return traverseElementSibling(options, <Element> (this.element?.nextSibling || this.innerMostWrapped?.element?.nextSibling || this.firstChild?.element?.nextSibling), 'nextSibling', this.sessionId);
    }

    public modifyBox(region: number, offset?: number, negative = true) {
        if (offset !== 0) {
            const attr = CSS_SPACING.get(region);
            if (attr) {
                const setBoxReset = () => {
                    let boxReset = this._boxReset;
                    if (boxReset === undefined) {
                        boxReset = newBoxModel();
                        this._boxReset = boxReset;
                    }
                    boxReset[attr] = 1;
                };
                if (offset === undefined) {
                    setBoxReset();
                }
                else {
                    const nodes = this._boxRegister?.[region];
                    if (nodes) {
                        for (const node of nodes) {
                            node.modifyBox(region, offset, negative);
                        }
                    }
                    else {
                        let boxAdjustment = this._boxAdjustment;
                        if (boxAdjustment === undefined) {
                            boxAdjustment = newBoxModel();
                            this._boxAdjustment = boxAdjustment;
                        }
                        if (!negative) {
                            if (this[attr] + boxAdjustment[attr] + offset <= 0) {
                                setBoxReset();
                                boxAdjustment[attr] = 0;
                            }
                            else {
                                boxAdjustment[attr] += offset;
                            }
                        }
                        else {
                            boxAdjustment[attr] += offset;
                        }
                    }
                }
            }
        }
    }

    public getBox(region: number): [number, number] {
        const attr = CSS_SPACING.get(region);
        return attr ? [this._boxReset?.[attr] || 0, this._boxAdjustment?.[attr] || 0] : [0, 0];
    }

    public resetBox(region: number, node?: T) {
        let boxReset = <BoxModel> this._boxReset;
        if (boxReset === undefined) {
            boxReset = newBoxModel();
            this._boxReset = boxReset;
        }
        const applyReset = (attrs: string[], start: number) => {
            for (let i = 0; i < 4; i++) {
                const name = attrs[i];
                if (boxReset[name] === 0) {
                    boxReset[name] = 1;
                    if (node) {
                        const key = CSS_SPACING_KEYS[i + start];
                        const attr = CSS_SPACING.get(key) as string;
                        const value = this[attr];
                        if (value !== 0) {
                            if (!node.naturalChild && node[attr] === 0) {
                                node.css(attr, formatPX(value), true);
                            }
                            else {
                                node.modifyBox(key, value);
                            }
                            this.registerBox(key, node);
                        }
                    }
                }
            }
        };
        if (hasBit(region, BOX_STANDARD.MARGIN)) {
            applyReset(BOX_MARGIN, 0);
        }
        if (hasBit(region, BOX_STANDARD.PADDING)) {
            applyReset(BOX_PADDING, 4);
        }
    }

    public transferBox(region: number, node: T) {
        let boxAdjustment = <BoxModel> this._boxAdjustment;
        if (boxAdjustment === undefined) {
            boxAdjustment = newBoxModel();
            this._boxAdjustment = boxAdjustment;
        }
        const applyReset = (attrs: string[], start: number) => {
            for (let i = 0; i < 4; i++) {
                const value: number = boxAdjustment[attrs[i]];
                if (value > 0) {
                    const key = CSS_SPACING_KEYS[i + start];
                    node.modifyBox(key, value, false);
                    this.registerBox(key, node);
                    boxAdjustment[attrs[i]] = 0;
                }
            }
        };
        if (hasBit(region, BOX_STANDARD.MARGIN)) {
            applyReset(BOX_MARGIN, 0);
        }
        if (hasBit(region, BOX_STANDARD.PADDING)) {
            applyReset(BOX_PADDING, 4);
        }
    }

    public registerBox(region: number, node?: T) {
        let boxRegister = this._boxRegister;
        if (boxRegister === undefined) {
            boxRegister = {};
            this._boxRegister = boxRegister;
        }
        let result = boxRegister[region];
        if (result === undefined) {
            result = new Set();
            boxRegister[region] = result;
        }
        if (node) {
            result.add(node);
        }
        return result;
    }

    public actualPadding(attr: "paddingTop" | "paddingBottom", value: number) {
        if (!this.layoutElement) {
            let node = this as T;
            while (!node.naturalChild) {
                const innerWrapped = node.innerWrapped as T;
                if (innerWrapped) {
                    node = innerWrapped;
                    if (node.naturalChild && node.getBox(attr === 'paddingTop' ? BOX_STANDARD.PADDING_TOP : BOX_STANDARD.PADDING_BOTTOM)[0] !== 1) {
                        return value;
                    }
                }
                else {
                    return value;
                }
            }
            let reset = false;
            if (canCascadeChildren(node)) {
                reset = cascadeActualPadding(node.naturalElements as T[], attr, value);
            }
            return reset ? 0 : value;
        }
        else if (this.gridElement) {
            switch (this.css('alignContent')) {
                case 'space-around':
                case 'space-evenly':
                    return 0;
            }
        }
        return value;
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

    public unsetCache(...attrs: string[]) {
        if (attrs.length) {
            const cached = this._cached;
            for (const attr of attrs) {
                switch (attr) {
                    case 'top':
                    case 'right':
                    case 'bottom':
                    case 'left':
                        cached.positionAuto = undefined;
                        break;
                    case 'lineHeight':
                        cached.baselineHeight = undefined;
                        break;
                }
            }
        }
        super.unsetCache(...attrs);
    }

    public css(attr: string, value?: string, cache = false): string {
        if (arguments.length >= 2) {
            if (value) {
                this._styleMap[attr] = value;
            }
            else {
                delete this._styleMap[attr];
            }
            if (cache) {
                this.unsetCache(attr);
            }
        }
        return this._styleMap[attr] || this.styleElement && this.style[attr] || '';
    }

    public cssApply(values: StringMap, cache = false) {
        Object.assign(this._styleMap, values);
        if (cache) {
            this.unsetCache(...Object.keys(values));
        }
        return this;
    }

    public cssSet(attr: string, value: string, cache = true) {
        return super.css(attr, value, cache);
    }

    public setCacheValue(attr: string, value: any) {
        this._cached[attr] = value;
    }

    get element() {
        return this._element || <Null<Element>> this.innerMostWrapped?.unsafe('element') || null;
    }

    set naturalChild(value) {
        this._cached.naturalChild = value;
    }
    get naturalChild() {
        let result = this._cached.naturalChild;
        if (result === undefined) {
            result = !!this._element?.parentElement;
            this._cached.naturalChild = result;
        }
        return result;
    }

    get pseudoElement() {
        return this._element?.className === '__squared.pseudo';
    }

    set documentParent(value) {
        this._documentParent = value;
    }
    get documentParent() {
        return <NodeUI> (this._documentParent || this.absoluteParent || this.actualParent || this.parent || this);
    }

    set containerName(value) {
        this._cached.containerName = value.toUpperCase();
    }
    get containerName() {
        let result = this._cached.containerName;
        if (result === undefined) {
            const element = <HTMLInputElement> this.element;
            if (element) {
                if (isTextNode(element)) {
                    result = 'PLAINTEXT';
                }
                else if (element.tagName === 'INPUT') {
                    result = 'INPUT_' + convertWord(element.type, true).toUpperCase();
                }
                else {
                    result = element.tagName.toUpperCase();
                }
            }
            else {
                result = '';
            }
            this._cached.containerName = result;
        }
        return result;
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
        if (!this.rendered && value?.rendered === false) {
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

    set positionAuto(value) {
        this._cached.positionAuto = value;
    }
    get positionAuto() {
        let result = this._cached.positionAuto;
        if (result === undefined) {
            if (this.pageFlow) {
                result = false;
            }
            else {
                const { top, right, bottom, left } = this._initial?.styleMap || this._styleMap;
                result = (!top || top === 'auto') && (!right || right === 'auto') && (!bottom || bottom === 'auto') && (!left || left === 'auto') && this.toFloat('opacity', 1) > 0;
            }
            this._cached.positionAuto = result;
        }
        return result;
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
        this._cached.textContent = value;
    }
    get textContent() {
        let result = this._cached.textContent;
        if (result === undefined) {
            result = this.naturalChild ? (<Element> this._element).textContent as string : '';
            this._cached.textContent = result;
        }
        return result;
    }

    get positiveAxis() {
        let result = this._cached.positiveAxis;
        if (result === undefined) {
            result = (!this.positionRelative || this.positionRelative && this.top >= 0 && this.left >= 0 && (this.right <= 0 || this.hasPX('left')) && (this.bottom <= 0 || this.hasPX('top'))) && this.marginTop >= 0 && this.marginLeft >= 0 && this.marginRight >= 0;
            this._cached.positiveAxis = result;
        }
        return result;
    }

    set overflow(value: number) {
        if (value === 0 || value === NODE_ALIGNMENT.VERTICAL || value === NODE_ALIGNMENT.HORIZONTAL || value === (NODE_ALIGNMENT.HORIZONTAL | NODE_ALIGNMENT.VERTICAL)) {
            if (hasBit(this.overflow, NODE_ALIGNMENT.BLOCK)) {
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

    set actualParent(value) {
        this._cached.actualParent = value;
    }
    get actualParent(): Null<T> {
        let result = this._cached.actualParent;
        if (result === undefined) {
            result = <Null<T>> super.actualParent;
            if (result === null) {
                const innerWrapped = this.innerMostWrapped;
                if (innerWrapped) {
                    result = innerWrapped.actualParent;
                }
            }
            this._cached.actualParent = result;
        }
        return result;
    }

    set siblingsLeading(value) {
        this._siblingsLeading = value;
    }
    get siblingsLeading() {
        return this._siblingsLeading || this.previousSiblings();
    }

    set siblingsTrailing(value) {
        this._siblingsTrailing = value;
    }
    get siblingsTrailing() {
        return this._siblingsTrailing || this.nextSiblings();
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

    get firstChild(): Null<Node> {
        return this.naturalChildren[0] || null;
    }

    get lastChild() {
        const children = this.naturalChildren;
        return children[children.length - 1] || null;
    }

    get onlyChild() {
        return (this.renderParent?.renderChildren.length ?? this.parent?.length) === 1 && !this.documentRoot;
    }

    set childIndex(value) {
        this._childIndex = value;
    }
    get childIndex() {
        let result = this._childIndex;
        if (result === Number.POSITIVE_INFINITY) {
            const innerWrapped = this.innerMostWrapped;
            if (innerWrapped) {
                result = innerWrapped.childIndex;
                this._childIndex = result;
            }
            else {
                const element = this._element;
                if (element) {
                    const parentElement = element.parentElement;
                    if (parentElement) {
                        const childNodes = parentElement.childNodes;
                        const length = childNodes.length;
                        for (let i = 0; i < length; i++) {
                            if (childNodes[i] === element) {
                                result = i;
                                this._childIndex = i;
                            }
                        }
                    }
                }
            }
        }
        return result;
    }

    set containerIndex(value) {
        this._containerIndex = value;
    }
    get containerIndex() {
        let result = this._containerIndex;
        if (result === Number.POSITIVE_INFINITY) {
            const innerWrapped = this.innerMostWrapped;
            if (innerWrapped) {
                result = innerWrapped.containerIndex;
                this._containerIndex = result;
            }
        }
        return this._containerIndex;
    }

    get textEmpty() {
        let result = this._cached.textEmpty;
        if (result === undefined) {
            if (this.styleElement && !this.imageElement && !this.svgElement && this.tagName !== 'HR') {
                const value = this.textContent;
                result = value === '' || !this.preserveWhiteSpace && !this.pseudoElement && value.trim() === '';
            }
            else {
                result = false;
            }
            this._cached.textEmpty = result;
        }
        return result;
    }

    get percentWidth() {
        let result = this._cached.percentWidth;
        if (result === undefined) {
            result = isPercent(this.cssInitial('width'));
            this._cached.percentWidth = result;
        }
        return result;
    }

    get percentHeight() {
        let result = this._cached.percentHeight;
        if (result === undefined) {
            result = isPercent(this.cssInitial('height'));
            this._cached.percentHeight = result;
        }
        return result;
    }

    get innerMostWrapped() {
        let result = this.innerWrapped;
        while (result) {
            const innerWrapped = result.innerWrapped;
            if (innerWrapped) {
                result = innerWrapped;
            }
            else {
                break;
            }
        }
        return result || null;
    }

    get outerMostWrapper() {
        let result = this.outerWrapper;
        while (result) {
            const outerWrapper = result.outerWrapper;
            if (outerWrapper) {
                result = outerWrapper;
            }
            else {
                break;
            }
        }
        return result || null;
    }

    get preserveWhiteSpace() {
        let result = this._cached.whiteSpace;
        if (result === undefined) {
            const value = this.css('whiteSpace');
            result = value === 'pre' || value === 'pre-wrap';
            this._cached.whiteSpace = result;
        }
        return result;
    }

    get outerExtensionElement() {
        if (this.naturalChild) {
            let parent = (<Element> this._element).parentElement;
            while (parent) {
                if (parent.dataset.use) {
                    return parent;
                }
                parent = parent.parentElement;
            }
        }
        return null;
    }

    set fontSize(value) {
        this._fontSize = value;
    }
    get fontSize() {
        return super.fontSize;
    }

    get extensions() {
        let result = this._cached.extensions;
        if (result === undefined) {
            const use = this.dataset.use;
            result = use ? spliceArray(use.split(XML.SEPARATOR), value => value === '') : [];
            this._cached.extensions = result;
        }
        return result;
    }
}