import { NodeTemplate } from '../../@types/base/application';
import { BoxType, CachedValueUI, ExcludeUIOptions, HideUIOptions, InitialData, LinearDataUI, LocalSettingsUI, SiblingOptions, SupportUI, TranslateUIOptions } from '../../@types/base/node';

import Node from './node';

import { CSS_SPACING } from './lib/constant';
import { APP_SECTION, BOX_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE, NODE_TRAVERSE } from './lib/enumeration';

type T = NodeUI;

const $lib = squared.lib;

const { BOX_MARGIN, BOX_PADDING, BOX_POSITION } = $lib.css;
const { isTextNode, newBoxModel } = $lib.dom;
const { equal } = $lib.math;
const { XML } = $lib.regex;
const { getElementAsNode } = $lib.session;
const { cloneObject, convertWord, hasBit, isArray, safeNestedMap, searchObject, spliceArray, withinRange } = $lib.util;

const CSS_SPACING_KEYS = Array.from(CSS_SPACING.keys());
const INHERIT_ALIGNMENT = ['position', 'display', 'verticalAlign', 'float', 'clear', 'zIndex'];
const REGEX_INLINEDASH = /^inline-/;

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
const isBlockWrap = (node: T) => node.blockVertical || node.percentWidth > 0;
const checkBlockDimension = (node: T, previous: T) => node.blockDimension && Math.ceil(node.bounds.top) >= previous.bounds.bottom && (isBlockWrap(node) || isBlockWrap(previous));
const getPercentWidth = (node: T) => node.inlineDimension && !node.hasPX('maxWidth') ? node.percentWidth : Number.NEGATIVE_INFINITY;

export default abstract class NodeUI extends Node implements squared.base.NodeUI {
    public static refitScreen(node: T, value: Dimension): Dimension {
        const { width: screenWidth, height: screenHeight } = node.localSettings.screenDimension;
        let { width, height } = value;
        if (width > screenWidth) {
            height = Math.round(height * screenWidth / width);
            width = screenWidth;
        }
        else if (height > screenHeight) {
            width = Math.round(width * screenHeight / height);
            height = screenHeight;
        }
        else {
            return value;
        }
        return { width, height };
    }

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
            if (item.baseline && (!text || item.textElement) && !item.baselineAltered) {
                if (item.naturalChildren.length) {
                    if (item.baselineElement) {
                        result.push(item);
                    }
                }
                else {
                    result.push(item);
                }
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
                const heightA = a.baselineHeight + a.marginBottom;
                const heightB = b.baselineHeight + b.marginBottom;
                if (!equal(heightA, heightB)) {
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

    public static linearData<T extends NodeUI>(list: T[], clearOnly = false): LinearDataUI<T> {
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
                                    if (floating.has(float) && Math.ceil(node.bounds.top) >= item.bounds.bottom) {
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
                else if (node.autoPosition) {
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
                        if (node.alignedVertically(siblings, cleared) > 0) {
                            y++;
                        }
                        else {
                            x++;
                        }
                        if (x > 1 && y > 1) {
                            break;
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
                            if (node.float === 'left') {
                                floatLeft = Math.max(floatLeft, right);
                            }
                            else if (node.float === 'right') {
                                floatRight = Math.min(floatRight, left);
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
                            if (withinRange(left, previous.linear.left) || previous.floating && Math.ceil(node.bounds.top) >= previous.bounds.bottom) {
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
        const cleared = parent?.floatContainer ? NodeUI.linearData(parent.naturalChildren as T[], true).cleared : undefined;
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
                const wrapped = node.innerMostWrapped;
                if (wrapped !== node) {
                    active = wrapped;
                }
            }
            if (row.length === 0) {
                row.push(node);
                siblings.push(active);
            }
            else {
                if (active.alignedVertically(siblings, cleared) > 0) {
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
    public abstract renderTemplates?: NodeTemplate<T>[];
    public abstract outerWrapper?: T;
    public abstract innerWrapped?: T;
    public abstract innerBefore?: T;
    public abstract innerAfter?: T;
    public abstract companion?: T;
    public abstract labelFor?: T;
    public abstract extracted?: T[];
    public abstract horizontalRows?: T[][];
    public abstract readonly renderChildren: T[];

    protected _boxRegister: ObjectIndex<T> = {};
    protected _documentParent?: T;
    protected _controlName?: string;
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
    public abstract translateX(value: number, options?: TranslateUIOptions): boolean;
    public abstract translateY(value: number, options?: TranslateUIOptions): boolean;

    public abstract get controlElement(): boolean;
    public abstract set containerType(value: number);
    public abstract get containerType(): number;
    public abstract set controlId(name: string);
    public abstract get controlId(): string;
    public abstract get documentId(): string;
    public abstract get baselineHeight(): number;
    public abstract get support(): SupportUI;
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
        const locked = safeNestedMap(this._locked, name);
        locked[attr] = true;
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

    public parseUnit(value: string, dimension: "width" | "height" = 'width', parent = true, screenDimension?: Dimension) {
        return super.parseUnit(value, dimension, parent, screenDimension || this.localSettings.screenDimension);
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

    public hide(options?: HideUIOptions<T>) {
        let remove: Undef<boolean>;
        let replacement: Undef<T>;
        if (options) {
            ({ remove, replacement } = options);
        }
        if (remove) {
            this.removeTry(replacement);
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
                    const autoMargin = this.autoMargin
                    Object.assign(autoMargin, node.autoMargin);
                    this.autoPosition = node.autoPosition;
                    break;
                }
                case 'styleMap':
                    this.cssCopyIfEmpty(node, ...Object.keys(node.unsafe('styleMap')));
                    break;
                case 'textStyle':
                    this.cssApply(node.textStyle);
                    this.fontSize = node.fontSize;
                    break;
                case 'boxStyle': {
                    const { backgroundColor, backgroundImage } = node;
                    this.cssApply(node.cssAsObject(
                        'backgroundRepeat',
                        'backgroundSize',
                        'backgroundPositionX',
                        'backgroundPositionY',
                        'backgroundClip',
                        'boxSizing',
                        'borderTopWidth',
                        'borderRightWidth',
                        'borderBottomWidth',
                        'borderLeftWidth',
                        'borderTopColor',
                        'borderRightColor',
                        'borderBottomColor',
                        'borderLeftColor',
                        'borderTopStyle',
                        'borderRightStyle',
                        'borderBottomStyle',
                        'borderLeftStyle',
                        'borderTopLeftRadius',
                        'borderTopRightRadius',
                        'borderBottomRightRadius',
                        'borderBottomLeftRadius'
                    ));
                    this.cssApply({
                        backgroundColor,
                        backgroundImage,
                        border: 'inherit',
                        borderRadius: 'inherit'
                    });
                    this.unsetCache('borderTopWidth', 'borderBottomWidth', 'borderRightWidth', 'borderLeftWidth');
                    this.setCacheValue('backgroundColor', backgroundColor);
                    this.setCacheValue('backgroundImage', backgroundImage);
                    node.setCacheValue('backgroundColor', '');
                    node.setCacheValue('backgroundImage', '');
                    node.cssApply({
                        backgroundColor: 'rgba(0, 0, 0, 0)',
                        backgroundImage: 'none',
                        border: 'initial',
                        borderRadius: 'initial'
                    });
                    const visibleStyle = node.visibleStyle;
                    visibleStyle.background = false;
                    visibleStyle.backgroundImage = false;
                    visibleStyle.backgroundColor = false;
                    visibleStyle.borderWidth = false;
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

    public exclude(options: ExcludeUIOptions) {
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
        const children = this.children as T[];
        const length = children.length;
        for (let i = 0; i < length; i++) {
            const item = children[i];
            if (item === node || item === node.innerMostWrapped || item === node.outerMostWrapper) {
                children[i] = replacement;
                replacement.parent = this;
                replacement.containerIndex = node.containerIndex;
                return true;
            }
        }
        if (append) {
            replacement.parent = this;
            return true;
        }
        return false;
    }

    public removeTry(replacement?: T) {
        const renderParent = this.renderParent;
        if (renderParent) {
            const { renderTemplates, renderChildren } = renderParent;
            if (renderTemplates) {
                const index = renderChildren.findIndex(node => node === this);
                if (index !== -1) {
                    const template = renderTemplates[index];
                    if (template?.node === this) {
                        if (replacement) {
                            const parent = replacement.renderParent;
                            if (parent === this) {
                                const templates = parent.renderTemplates;
                                if (templates) {
                                    const replaceIndex = templates.findIndex(item => item?.node === replacement);
                                    if (replaceIndex !== -1) {
                                        parent.renderChildren.splice(replaceIndex, 1);
                                    }
                                    if (renderParent.appendTry(this, replacement, false)) {
                                        renderTemplates[index] = templates[replaceIndex];
                                        replacement.renderParent = renderParent;
                                        renderChildren[index] = replacement;
                                        if (this.documentRoot) {
                                            replacement.documentRoot = true;
                                            this.documentRoot = false;
                                        }
                                        this.renderParent = undefined;
                                        return true;
                                    }
                                }
                            }
                        }
                        else {
                            renderTemplates.splice(index, 1);
                            renderChildren.splice(index, 1);
                            this.renderParent = undefined;
                            return true;
                        }
                    }
                }
            }
        }
        return false;
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
        else if (this.autoPosition && isArray(siblings)) {
            return siblings[siblings.length - 1].blockStatic ? NODE_TRAVERSE.VERTICAL : NODE_TRAVERSE.HORIZONTAL;
        }
        else if (this.pageFlow) {
            const floating = this.floating;
            if (isArray(siblings)) {
                if (cleared?.has(this)) {
                    return NODE_TRAVERSE.FLOAT_CLEAR;
                }
                else {
                    const previous = siblings[siblings.length - 1];
                    if (floating && previous.floating) {
                        const float = this.float;
                        if (horizontal && (float === previous.float || cleared?.size && !siblings.some((item, index) => index > 0 && cleared.get(item) === float))) {
                            return NODE_TRAVERSE.HORIZONTAL;
                        }
                        else if (Math.ceil(this.bounds.top) >= previous.bounds.bottom) {
                            if (siblings.every(item => item.inlineDimension)) {
                                const actualParent = this.actualParent;
                                if (actualParent && actualParent.ascend({ condition: item => !item.inline && item.hasWidth, error: item => item.layoutElement, startSelf: true })) {
                                    const naturalElements = actualParent.naturalElements;
                                    if (naturalElements.length === siblings.length + 1) {
                                        const getLayoutWidth = (node: T) => node.actualWidth + Math.max(node.marginLeft, 0) + node.marginRight;
                                        let width = actualParent.box.width - getLayoutWidth(this);
                                        for (const item of siblings) {
                                            width -= getLayoutWidth(item);
                                        }
                                        if (width >= 0) {
                                            return NODE_TRAVERSE.HORIZONTAL;
                                        }
                                    }
                                }
                            }
                            return NODE_TRAVERSE.FLOAT_WRAP;
                        }
                    }
                    else if (siblings.every(item => item.inlineDimension && Math.ceil(this.bounds.top) >= item.bounds.bottom)) {
                        return NODE_TRAVERSE.FLOAT_BLOCK;
                    }
                    else if (horizontal !== undefined) {
                        if (floating && !horizontal && previous.blockStatic) {
                            return NODE_TRAVERSE.HORIZONTAL;
                        }
                        else if (!REGEX_INLINEDASH.test(this.display)) {
                            let { top, bottom } = this.bounds;
                            if (this.textElement && cleared?.size && siblings.some(item => cleared.has(item)) && siblings.some(item => Math.floor(top) < item.bounds.top && Math.ceil(bottom) > item.bounds.bottom)) {
                                return NODE_TRAVERSE.FLOAT_INTERSECT;
                            }
                            else if (siblings[0].floating) {
                                if (siblings.length > 1) {
                                    const float = siblings[0].float;
                                    let maxBottom = Number.NEGATIVE_INFINITY;
                                    let contentWidth = 0;
                                    for (const item of siblings) {
                                        if (item.floating) {
                                            if (item.float === float) {
                                                maxBottom = Math.max(item.actualRect('bottom', 'bounds'), maxBottom);
                                            }
                                            contentWidth += item.linear.width;
                                        }
                                    }
                                    if (Math.ceil(contentWidth) >= (this.actualParent as T).box.width) {
                                        return NODE_TRAVERSE.FLOAT_BLOCK;
                                    }
                                    else if (this.multiline) {
                                        if (this.styleText) {
                                            const textBounds = this.textBounds;
                                            if (textBounds) {
                                                bottom = textBounds.bottom;
                                            }
                                        }
                                        const offset = bottom - maxBottom;
                                        top = offset <= 0 || offset / (bottom - top) < 0.5 ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
                                    }
                                    else {
                                        top = Math.ceil(top);
                                    }
                                    if (top < maxBottom) {
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
                    if (checkBlockDimension(this, previous)) {
                        return NODE_TRAVERSE.INLINE_WRAP;
                    }
                    else {
                        const percentWidth = getPercentWidth(this);
                        if (percentWidth > 0 && siblings.reduce((a, b) => a + getPercentWidth(b), percentWidth) > 1) {
                            return NODE_TRAVERSE.PERCENT_WRAP;
                        }
                    }
                }
            }
            for (const previous of this.siblingsLeading) {
                if (previous.blockStatic || previous.autoMargin.leftRight || floating && previous.childIndex === 0 && previous.plainText && previous.multiline) {
                    return NODE_TRAVERSE.VERTICAL;
                }
                else if (previous.lineBreak) {
                    return NODE_TRAVERSE.LINEBREAK;
                }
                else if ((this.blockStatic || this.display === 'table') && (!previous.floating || cleared?.has(previous))) {
                    return NODE_TRAVERSE.VERTICAL;
                }
                else if (previous.floating) {
                    if (previous.float === 'left') {
                        if (this.autoMargin.right) {
                            return NODE_TRAVERSE.FLOAT_BLOCK;
                        }
                    }
                    else if (this.autoMargin.left) {
                        return NODE_TRAVERSE.FLOAT_BLOCK;
                    }
                    if (this.floatContainer && this.some(item => item.floating && Math.ceil(item.bounds.top) >= previous.bounds.bottom)) {
                        return NODE_TRAVERSE.FLOAT_BLOCK;
                    }
                }
                if (cleared?.get(previous) === 'both' && !(siblings?.[0] === previous)) {
                    return NODE_TRAVERSE.FLOAT_CLEAR;
                }
                else if (checkBlockDimension(this, previous)) {
                    return NODE_TRAVERSE.INLINE_WRAP;
                }
            }
        }
        return NODE_TRAVERSE.HORIZONTAL;
    }

    public previousSiblings(options: SiblingOptions = {}) {
        return traverseElementSibling(options, <Element> (!this.nodeGroup && this.innerMostWrapped.element?.previousSibling || this.firstChild?.element?.previousSibling), 'previousSibling', this.sessionId);
    }

    public nextSiblings(options: SiblingOptions = {}) {
        return traverseElementSibling(options, <Element> (!this.nodeGroup && this.innerMostWrapped.element?.nextSibling || this.firstChild?.element?.nextSibling), 'nextSibling', this.sessionId);
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
                const node = this._boxRegister[region];
                if (offset === undefined) {
                    if (node) {
                        const value: number = this[attr] || node.getBox(region)[1];
                        if (value > 0) {
                            node.modifyBox(region, -value, negative);
                        }
                    }
                    else {
                        setBoxReset();
                    }
                }
                else {
                    if (node) {
                        node.modifyBox(region, offset, negative);
                    }
                    else {
                        let boxAdjustment = this._boxAdjustment;
                        if (boxAdjustment === undefined) {
                            boxAdjustment = newBoxModel();
                            this._boxAdjustment = boxAdjustment;
                        }
                        if (!negative) {
                            if (this[attr] + boxAdjustment[attr] + offset <= 0) {
                                if (this.naturalChild) {
                                    setBoxReset();
                                }
                                boxAdjustment[attr] = 0;
                                return;
                            }
                        }
                        boxAdjustment[attr] += offset;
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
                const key = CSS_SPACING_KEYS[i + start];
                if (hasBit(region, key)) {
                    const name = attrs[i];
                    boxReset[name] = 1;
                    if (node) {
                        const previous = this.registerBox(key);
                        if (previous) {
                            previous.resetBox(key, node);
                        }
                        else {
                            if (this.naturalChild) {
                                const value = this[name];
                                if (value >= 0) {
                                    node.modifyBox(key, value);
                                }
                            }
                            this.transferBox(key, node);
                        }
                    }
                }
            }
        };
        if (hasBit(BOX_STANDARD.MARGIN, region)) {
            applyReset(BOX_MARGIN, 0);
        }
        if (hasBit(BOX_STANDARD.PADDING, region)) {
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
                const key = CSS_SPACING_KEYS[i + start];
                if (hasBit(region, key)) {
                    const previous = this.registerBox(key);
                    if (previous) {
                        previous.transferBox(key, node);
                    }
                    else {
                        const name = attrs[i];
                        const value: number = boxAdjustment[name];
                        if (value !== 0) {
                            node.modifyBox(key, value, false);
                            boxAdjustment[name] = 0;
                        }
                        this.registerBox(key, node);
                    }
                }
            }
        };
        if (hasBit(BOX_STANDARD.MARGIN, region)) {
            applyReset(BOX_MARGIN, 0);
        }
        if (hasBit(BOX_STANDARD.PADDING, region)) {
            applyReset(BOX_PADDING, 4);
        }
    }

    public registerBox(region: number, node?: T): Undef<NodeUI> {
        const boxRegister = this._boxRegister;
        if (node) {
            boxRegister[region] = node;
        }
        else {
            node = boxRegister[region];
        }
        while (node) {
            const next: Undef<NodeUI> = (<ObjectIndex<T>> node.unsafe('boxRegister'))[region];
            if (next) {
                node = next;
            }
            else {
                break;
            }
        }
        return node;
    }

    public actualPadding(attr: "paddingTop" | "paddingBottom", value: number) {
        if (value > 0) {
            if (!this.layoutElement) {
                const node = (this as T).innerMostWrapped;
                if (node !== this) {
                    if (node.naturalChild) {
                        if (node.getBox(attr === 'paddingTop' ? BOX_STANDARD.PADDING_TOP : BOX_STANDARD.PADDING_BOTTOM)[0] === 0) {
                            return 0;
                        }
                    }
                    else {
                        return value;
                    }
                }
                if (node.naturalChild) {
                    let reset = false;
                    if (canCascadeChildren(node)) {
                        reset = cascadeActualPadding(node.naturalElements as T[], attr, value);
                    }
                    return reset ? 0 : value;
                }
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
        return 0;
    }

    public actualBoxWidth(value?: number) {
        if (!value) {
            value = this.box.width
        }
        if (this.pageFlow && !this.documentRoot) {
            let offsetLeft = 0;
            let offsetRight = 0;
            let current = this.actualParent;
            while (current) {
                if (current.hasPX('width', false) || !current.pageFlow) {
                    return value;
                }
                else {
                    offsetLeft += Math.max(current.marginLeft, 0) + current.borderLeftWidth + current.paddingLeft;
                    offsetRight += current.paddingRight + current.borderRightWidth + current.marginRight;
                }
                if (current.documentRoot) {
                    break;
                }
                else {
                    current = current.actualParent;
                }
            }
            const screenWidth = this.localSettings.screenDimension.width - offsetLeft - offsetRight;
            if (screenWidth > 0) {
                return Math.min(value, screenWidth);
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
                        cached.autoPosition = undefined;
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
        return this._element || !!this.innerWrapped && <Null<Element>> this.innerMostWrapped.unsafe('element') || null;
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

    set autoPosition(value) {
        this._cached.autoPosition = value;
    }
    get autoPosition() {
        let result = this._cached.autoPosition;
        if (result === undefined) {
            if (this.pageFlow) {
                result = false;
            }
            else {
                const { top, right, bottom, left } = this._styleMap;
                result = (!top || top === 'auto') && (!left || left === 'auto') && (!right || right === 'auto') && (!bottom || bottom === 'auto') && this.toFloat('opacity', 1) > 0 && this.childIndex > 0;
            }
            this._cached.autoPosition = result;
        }
        return result;
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
            result = this.naturalChild && (<Element> this._element).textContent || '';
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

    get baseline() {
        return super.baseline;
    }

    get baselineElement() {
        let result = this._cached.baselineElement;
        if (result === undefined) {
            if (this.baseline) {
                const children = this.naturalElements;
                if (children.length) {
                    result = children.every((node: T) => node.baselineElement && node.length === 0);
                }
                else {
                    result = this.inlineText && this.textElement || this.plainText && !this.multiline || this.inputElement || this.imageElement || this.svgElement;
                }
            }
            else {
                result = false;
            }
            this._cached.baselineElement = result;
        }
        return result;
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
                result = this.innerMostWrapped.actualParent;
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
            let wrapped = this.innerWrapped;
            if (wrapped) {
                do {
                    const index = wrapped.childIndex;
                    if (index !== Number.POSITIVE_INFINITY) {
                        result = index;
                        this._childIndex = result;
                        break;
                    }
                    wrapped = wrapped.innerWrapped;
                }
                while (wrapped);
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
            let wrapped = this.innerWrapped;
            while (wrapped) {
                const index = wrapped.containerIndex;
                if (index !== Number.POSITIVE_INFINITY) {
                    result = index;
                    this._containerIndex = result;
                    break;
                }
                wrapped = wrapped.innerWrapped;
            }
        }
        return result;
    }

    get textEmpty() {
        let result = this._cached.textEmpty;
        if (result === undefined) {
            if (this.styleElement && !this.imageElement && !this.svgElement) {
                const value = this.textContent;
                result = value === '' || !this.preserveWhiteSpace && value.trim() === '';
            }
            else {
                result = false;
            }
            this._cached.textEmpty = result;
        }
        return result;
    }

    get innerMostWrapped() {
        if (this.naturalChild) {
            return this;
        }
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
        return result || this;
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
        return result || this;
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