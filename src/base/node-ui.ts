import CSS_UNIT = squared.lib.constant.CSS_UNIT;
import BOX_STANDARD = squared.base.lib.constant.BOX_STANDARD;
import NODE_ALIGNMENT = squared.base.lib.constant.NODE_ALIGNMENT;
import NODE_TRAVERSE = squared.base.lib.constant.NODE_TRAVERSE;

import { APP_SECTION, NODE_PROCEDURE, NODE_RESOURCE } from './lib/constant';

import type ExtensionUI from './extension-ui';

import Node from './node';

import { searchObject } from './lib/util';

type T = NodeUI;

const { CSS_BORDER_SET, CSS_PROPERTIES } = squared.lib.internal;

const { getStyle } = squared.lib.css;
const { createElement, getParentElement, getRangeClientRect } = squared.lib.dom;
const { equal } = squared.lib.math;
const { getElementAsNode } = squared.lib.session;
const { cloneObject, findReverse, hasKeys, isArray, isEmptyString, replaceAll, startsWith, withinRange } = squared.lib.util;

const CSS_SPACINGINDEX = [BOX_STANDARD.MARGIN_TOP, BOX_STANDARD.MARGIN_RIGHT, BOX_STANDARD.MARGIN_BOTTOM, BOX_STANDARD.MARGIN_LEFT, BOX_STANDARD.PADDING_TOP, BOX_STANDARD.PADDING_RIGHT, BOX_STANDARD.PADDING_BOTTOM, BOX_STANDARD.PADDING_LEFT];

function cascadeActualPadding(children: T[], attr: "paddingTop" | "paddingBottom", value: number) {
    let valid = false;
    for (let i = 0, length = children.length; i < length; ++i) {
        const item = children[i];
        if (item.blockStatic) {
            return false;
        }
        if (item.inlineStatic) {
            if (item.has('lineHeight') && item.lineHeight > item.bounds.height) {
                return false;
            }
            if (item[attr] >= value) {
                valid = true;
            }
            else if (canCascadeChildren(item)) {
                if (!cascadeActualPadding(item.naturalChildren as T[], attr, value)) {
                    return false;
                }
                valid = true;
            }
        }
    }
    return valid;
}

function traverseElementSibling(element: Null<Element>, direction: "previousSibling" | "nextSibling", sessionId: string, options?: TraverseSiblingsOptions) {
    const result: T[] = [];
    let i = 0,
        floating: Undef<boolean>,
        pageFlow: Undef<boolean>,
        lineBreak: Undef<boolean>,
        excluded: Undef<boolean>;
    while (element) {
        if (i++) {
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
                    if (floating || !node.floating && (node.visible || node.rendered) && node.display !== 'none') {
                        break;
                    }
                }
            }
        }
        else if (options) {
            ({ floating, pageFlow, lineBreak, excluded } = options);
        }
        element = element[direction] as Null<Element>;
    }
    return result;
}

function applyBoxReset(node: T, start: number, region: number, other?: T) {
    const boxReset = node.boxReset;
    for (let i = start; i < start + 4; ++i) {
        const key = CSS_SPACINGINDEX[i];
        if (region & key) {
            boxReset[i] = 1;
            if (other) {
                const previous = node.registerBox(key);
                if (previous) {
                    previous.resetBox(key, other);
                }
                else {
                    if (node.naturalChild) {
                        const value = getBoxOffset(node, i);
                        if (value >= 0) {
                            other.modifyBox(key, value);
                        }
                    }
                    node.transferBox(key, other);
                }
            }
        }
    }
}

function applyBoxAdjustment(node: T, start: number, region: number, other: T, boxAdjustment: Null<number[]>) {
    for (let i = start; i < start + 4; ++i) {
        const key = CSS_SPACINGINDEX[i];
        if (region & key) {
            const previous = node.registerBox(key);
            if (previous) {
                previous.transferBox(key, other);
            }
            else {
                if (boxAdjustment) {
                    const value: number = boxAdjustment[i];
                    if (value !== 0) {
                        other.modifyBox(key, value, false);
                        boxAdjustment[i] = 0;
                    }
                }
                node.registerBox(key, other);
            }
        }
    }
}

function getBoxSpacing(value: BOX_STANDARD) {
    switch (value) {
        case BOX_STANDARD.MARGIN_TOP:
            return 0;
        case BOX_STANDARD.MARGIN_RIGHT:
            return 1;
        case BOX_STANDARD.MARGIN_BOTTOM:
            return 2;
        case BOX_STANDARD.MARGIN_LEFT:
            return 3;
        case BOX_STANDARD.PADDING_TOP:
            return 4;
        case BOX_STANDARD.PADDING_RIGHT:
            return 5;
        case BOX_STANDARD.PADDING_BOTTOM:
            return 6;
        case BOX_STANDARD.PADDING_LEFT:
            return 7;
    }
    return NaN;
}

function getBoxOffset(node: T, index: number) {
    switch (index) {
        case 0:
            return node.marginTop;
        case 1:
            return node.marginRight;
        case 2:
            return node.marginBottom;
        case 3:
            return node.marginLeft;
        case 4:
            return node.paddingTop;
        case 5:
            return node.paddingRight;
        case 6:
            return node.paddingBottom;
        case 7:
            return node.paddingLeft;
    }
    return 0;
}

function setOverflow(node: T) {
    let result = 0;
    if (node.scrollElement) {
        const element = node.element as HTMLElement;
        const [overflowX, overflowY] = node.cssAsTuple('overflowX', 'overflowY');
        if (node.hasHeight && (node.hasUnit('height') || node.hasUnit('maxHeight')) && (overflowY === 'scroll' || overflowY === 'auto' && element.clientHeight !== element.scrollHeight)) {
            result |= NODE_ALIGNMENT.VERTICAL;
        }
        if ((node.hasUnit('width') || node.hasUnit('maxWidth')) && (overflowX === 'scroll' || overflowX === 'auto' && element.clientWidth !== element.scrollWidth)) {
            result |= NODE_ALIGNMENT.HORIZONTAL;
        }
    }
    return result;
}

function applyExclusionValue(enumeration: StandardMap, value: Undef<string>) {
    let offset = 0;
    if (value) {
        for (const name of value.split('|')) {
            offset |= enumeration[name.trim().toUpperCase()] as number || 0;
        }
    }
    return offset;
}

const canCascadeChildren = (node: T) => node.naturalElements.length > 0 && !node.layoutElement && !node.tableElement;

export default abstract class NodeUI extends Node implements squared.base.NodeUI {
    public static baseline(list: T[], text?: boolean, image?: boolean): Null<T> {
        const result: T[] = [];
        for (let i = 0, length = list.length; i < length; ++i) {
            const item = list[i];
            if (item.naturalElements.length && !item.baselineElement || image && item.imageContainer) {
                continue;
            }
            if (item.baseline && !item.baselineAltered && (!text || item.textElement)) {
                result.push(item);
            }
        }
        if (result.length > 1) {
            result.sort((a, b) => {
                const vA = a.css('verticalAlign') === 'baseline';
                const vB = b.css('verticalAlign') === 'baseline';
                if (vA && !vB) {
                    return -1;
                }
                if (vB && !vA) {
                    return 1;
                }
                const renderA = a.rendering;
                const renderB = b.rendering;
                if (!renderA) {
                    if (renderB && b.find(item => item.css('verticalAlign') !== 'baseline')) {
                        return -1;
                    }
                }
                else if (!renderB && a.find(item => item.css('verticalAlign') !== 'baseline')) {
                    return 1;
                }
                if (renderA && a.baselineElement) {
                    a = a.max('baselineHeight', { self: true, wrapperOf: true }) as T;
                }
                if (renderB && b.baselineElement) {
                    b = b.max('baselineHeight', { self: true, wrapperOf: true }) as T;
                }
                const imageA = a.imageContainer;
                const imageB = b.imageContainer;
                if (!imageA && imageB) {
                    return -1;
                }
                if (!imageB && imageA) {
                    return 1;
                }
                const heightA = a.baselineHeight;
                const heightB = b.baselineHeight;
                if (!equal(heightA, heightB)) {
                    return heightB - heightA;
                }
                else if (!imageA && !imageB) {
                    const textA = a.textElement;
                    const textB = b.textElement;
                    if (textA && textB) {
                        if (!a.pseudoElement && b.pseudoElement) {
                            return -1;
                        }
                        if (a.pseudoElement && !b.pseudoElement) {
                            return 1;
                        }
                        if (!a.plainText && b.plainText) {
                            return -1;
                        }
                        if (a.plainText && !b.plainText) {
                            return 1;
                        }
                    }
                    else {
                        if (a.containerType !== b.containerType && a.inputElement && b.inputElement) {
                            return b.containerType - a.containerType;
                        }
                        if (textA && !textB && a.childIndex < b.childIndex) {
                            return -1;
                        }
                        if (textB && !textA && b.childIndex < a.childIndex) {
                            return 1;
                        }
                    }
                }
                return 0;
            });
        }
        return result[0] || null;
    }

    public static linearData(list: T[], cleared?: Null<Map<T, string>>, absolute?: boolean): LinearData {
        let linearX = false,
            linearY = false;
        const length = list.length;
        if (length > 1) {
            let nodes: T[],
                floated: Undef<Set<string>>;
            if (cleared) {
                nodes = [];
                for (let i = 0; i < length; ++i) {
                    const item = list[i];
                    if (item.pageFlow) {
                        if (item.floating) {
                            (floated ||= new Set<string>()).add(item.float);
                        }
                    }
                    else if (!item.autoPosition) {
                        continue;
                    }
                    nodes.push(item);
                }
            }
            else {
                nodes = absolute === false ? list : list.filter(item => item.pageFlow || item.autoPosition);
            }
            const n = nodes.length;
            if (n) {
                const siblings = [nodes[0]];
                let x = 1,
                    y = 1;
                for (let i = 1; i < n; ++i) {
                    const node = nodes[i];
                    if (node.alignedVertically(siblings, floated && cleared)) {
                        ++y;
                    }
                    else {
                        ++x;
                    }
                    if (x > 1 && y > 1) {
                        break;
                    }
                    siblings.push(node);
                }
                linearX = x === n;
                linearY = y === n;
                if (floated) {
                    if (linearX) {
                        let boxLeft = Infinity,
                            boxRight = -Infinity,
                            floatLeft = -Infinity,
                            floatRight = Infinity;
                        for (let i = 0; i < n; ++i) {
                            const node = nodes[i];
                            const { left, right } = node.linear;
                            boxLeft = Math.min(boxLeft, left);
                            boxRight = Math.max(boxRight, right);
                            switch (node.float) {
                                case 'left':
                                    floatLeft = Math.max(floatLeft, right);
                                    break;
                                case 'right':
                                    floatRight = Math.min(floatRight, left);
                                    break;
                            }
                        }
                        for (let i = 0, j = 0, k = 0, l = 0, m = 0; i < n; ++i) {
                            const node = nodes[i];
                            const { left, right } = node.linear;
                            if (Math.floor(left) <= boxLeft) {
                                ++j;
                            }
                            if (Math.ceil(right) >= boxRight) {
                                ++k;
                            }
                            if (!node.floating) {
                                if (left === floatLeft) {
                                    ++l;
                                }
                                if (right === floatRight) {
                                    ++m;
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
                return { linearX, linearY, floated };
            }
        }
        else if (length) {
            linearY = list[0].blockStatic;
            linearX = !linearY;
        }
        return { linearX, linearY };
    }

    public static partitionRows(list: T[], cleared?: Map<T, string>) {
        const result: T[][] = [];
        let row: T[] = [],
            siblings: T[] = [];
        for (let i = 0, length = list.length; i < length; ++i) {
            const node = list[i];
            let active = node;
            if (!node.naturalChild) {
                if (node.nodeGroup) {
                    if (row.length) {
                        result.push(row);
                    }
                    result.push([node]);
                    row = [];
                    siblings = [];
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
            else if (active.alignedVertically(siblings, cleared, undefined, true)) {
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
        if (row.length) {
            result.push(row);
        }
        return result;
    }

    public alignmentType = 0;
    public rendered = false;
    public excluded = false;
    public rootElement = false;
    public floatContainer = false;
    public lineBreakLeading = false;
    public lineBreakTrailing = false;
    public baselineActive = false;
    public baselineAltered = false;
    public contentAltered = false;
    public visible = true;
    public renderChildren: T[] = [];
    public renderParent: Null<T> = null;
    public renderExtension: Null<ExtensionUI<T>[]> = null;
    public renderTemplates: Null<NodeTemplate<T>[]> = null;
    public renderedAs: Null<NodeTemplate<T>> = null;
    public outerWrapper: Null<T> = null;
    public companion: Null<T> = null;
    public documentChildren?: Undef<T[]>;

    protected _preferInitial = true;
    protected _boxRegister: Null<T[]> = null;
    protected _documentParent: Null<T> = null;
    protected _cache!: CacheValueUI;
    protected _cacheState!: CacheStateUI<T>;
    protected _boxReset: Null<number[]> = null;
    protected _boxAdjustment: Null<number[]> = null;
    protected abstract _namespaces: ObjectMap<StringMap>;

    private _locked: Null<ObjectMapNested<boolean>> = null;
    private _siblingsLeading: Null<T[]> = null;
    private _siblingsTrailing: Null<T[]> = null;
    private _renderAs: Null<T> = null;
    private _exclusions: Null<number[]> = null;
    private _horizontalRows: Null<T[][]> = null;

    public abstract setControlType(viewName: string, containerType?: number): void;
    public abstract setLayout(width?: number, height?: number): void;
    public abstract setAlignment(): void;
    public abstract setBoxSpacing(): void;
    public abstract apply(options: PlainObject): void;
    public abstract clone(id: number): T;
    public abstract extractAttributes(depth?: number): string;
    public abstract alignParent(position: AnchorPositionAttr): boolean;
    public abstract alignSibling(position: AnchorPositionAttr, documentId?: string): string;
    public abstract anchorChain(...values: PositionAttr[]): T[];
    public abstract actualRect(position: PositionAttr, dimension?: BoxType): number;
    public abstract translateX(value: number, options?: TranslateOptions): boolean;
    public abstract translateY(value: number, options?: TranslateOptions): boolean;
    public abstract localizeString(value: string): string;

    public abstract set labelFor(value);
    public abstract get labelFor(): Null<T>;
    public abstract set innerWrapped(value);
    public abstract get innerWrapped(): Null<T>;
    public abstract set containerType(value: number);
    public abstract get containerType(): number;
    public abstract set controlId(name: string);
    public abstract get controlId(): string;
    public abstract set renderExclude(value: boolean);
    public abstract get renderExclude(): boolean;
    public abstract set positioned(value);
    public abstract get positioned(): boolean;
    public abstract set localSettings(value);
    public abstract get localSettings(): LocalSettingsUI;
    public abstract get controlElement(): boolean;
    public abstract get documentId(): string;
    public abstract get baselineHeight(): number;
    public abstract get imageContainer(): boolean;
    public abstract get support(): SupportUI;

    public is(containerType: number) {
        return this.containerType === containerType;
    }

    public of(containerType: number, ...alignmentType: number[]) {
        return this.is(containerType) && alignmentType.every(value => this.hasAlign(value));
    }

    public attr(name: string, attr: string, value?: string, overwrite = true) {
        const obj = this.namespace(name);
        if (value) {
            if (!obj[attr] || overwrite && !this.lockedAttr(name, attr)) {
                return obj[attr] = value;
            }
        }
        return obj[attr] || '';
    }

    public attrx(attr: string, value?: string, overwrite?: boolean) {
        return this.attr('_', attr, value, overwrite);
    }

    public delete(name: string, ...attrs: string[]) {
        const obj = this._namespaces[name];
        if (obj) {
            for (let i = 0, length = attrs.length; i < length; ++i) {
                const attr = attrs[i];
                if (attr.indexOf('*') !== -1) {
                    for (const item of searchObject(obj, attr, true)) {
                        delete obj[item[0]];
                    }
                }
                else if (attr in obj) {
                    delete obj[attr];
                }
            }
        }
    }

    public deleteOne(name: string, attr: string) {
        const obj = this._namespaces[name];
        if (obj && attr in obj) {
            delete obj[attr];
        }
    }

    public namespace(name: string) {
        return this._namespaces[name] ||= {};
    }

    public namespaces() {
        return Object.entries(this._namespaces) as [string, StringMap][];
    }

    public unsafe<U = unknown>(name: string | PlainObject, value?: unknown): Undef<U> {
        if (typeof name === 'string') {
            return arguments.length === 1 ? this['_' + name] as Undef<U> : this['_' + name] = value as Undef<U>;
        }
        for (const attr in name) {
            this['_' + attr] = name[attr];
        }
    }

    public lockAttr(name: string, attr: string) {
        ((this._locked ||= {})[name] ||= {})[attr] = true;
    }

    public unlockAttr(name: string, attr: string) {
        const locked = this._locked;
        if (locked) {
            const data = locked[name];
            if (data) {
                data[attr] = false;
            }
        }
    }

    public lockedAttr(name: string, attr: string) {
        const locked = this._locked;
        if (locked && locked[name]) {
            return attr in locked[name]!;
        }
        return false;
    }

    public render(parent: T) {
        this.renderParent = parent;
        this.rendered = true;
    }

    public parseUnit(value: unknown, options?: NodeParseUnitOptions) {
         (options ||= {}).screenDimension ||= this.localSettings.screenDimension;
        return super.parseUnit(...(arguments as unknown) as [unknown, NodeParseUnitOptions?]);
    }

    public parseWidth(value: string, parent?: boolean) {
        return this.parseUnit(value, { parent });
    }

    public parseHeight(value: string, parent?: boolean) {
        return this.parseUnit(value, { dimension: 'height', parent });
    }

    public renderEach(predicate: IteratorPredicate<T, void>) {
        const children = this.renderChildren;
        for (let i = 0, length = children.length; i < length; ++i) {
            predicate(children[i], i, children);
        }
        return this;
    }

    public hide(options?: HideOptions<T>) {
        this.rendered = true;
        this.visible = false;
        return options && options.remove ? this.removeTry(options) : null;
    }

    public inherit(node: T, ...modules: string[]) {
        let result: Null<PlainObject> = null;
        for (const module of modules) {
            switch (module) {
                case 'base': {
                    this._documentParent = node.documentParent;
                    this._bounds = node.bounds;
                    this._linear = node.linear;
                    this._box = node.box;
                    if (this._depth === -1) {
                        this._depth = node.depth;
                    }
                    const actualParent = node.actualParent;
                    if (actualParent) {
                        this.actualParent = actualParent;
                        this.setCacheState('dir', actualParent.dir);
                    }
                    break;
                }
                case 'initial':
                    if (result = node.initial) {
                        this.inheritApply('initial', result);
                    }
                    break;
                case 'alignment':
                    this.cssCopy(node, 'position', 'display', 'verticalAlign', 'float', 'clear', 'zIndex');
                    if (!this.positionStatic) {
                        const setPosition = (attr: CssStyleAttr) => {
                            if (node.hasUnit(attr)) {
                                this._styleMap[attr] = node.css(attr);
                            }
                        };
                        setPosition('top');
                        setPosition('right');
                        setPosition('bottom');
                        setPosition('left');
                    }
                    Object.assign(this.autoMargin, node.autoMargin);
                    this.autoPosition = node.autoPosition;
                    break;
                case 'styleMap':
                    this.cssCopyIfEmpty(node, ...Object.keys(node.unsafe<CssStyleMap>('styleMap')!) as CssStyleAttr[]);
                    break;
                case 'textStyle':
                    result = node.textStyle;
                    result.fontSize = node.fontSize + 'px';
                    result.lineHeight = node.lineHeight + 'px';
                    this.cssApply(result);
                    break;
                case 'boxStyle': {
                    if (this.naturalElement) {
                        const properties: CssStyleAttr[] = [];
                        if (!this.backgroundImage) {
                            properties.push(...CSS_PROPERTIES.background!.value as CssStyleAttr[]);
                            --properties.length;
                        }
                        if (this.borderTopWidth === 0) {
                            properties.push(...CSS_BORDER_SET[0]);
                        }
                        if (this.borderRightWidth === 0) {
                            properties.push(...CSS_BORDER_SET[1]);
                        }
                        if (this.borderBottomWidth === 0) {
                            properties.push(...CSS_BORDER_SET[2]);
                        }
                        if (this.borderLeftWidth === 0) {
                            properties.push(...CSS_BORDER_SET[3]);
                        }
                        if (this.cssAny('backgroundColor', ['none', 'transparent', 'rgba(0, 0, 0, 0)'])) {
                            properties.push('backgroundColor');
                        }
                        if (this.css('borderRadius') === '0px') {
                            properties.push(...CSS_PROPERTIES.borderRadius!.value as CssStyleAttr[]);
                        }
                        this.cssCopy(node, ...properties);
                    }
                    else {
                        result = node.cssAsObject(
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
                            'borderRadius',
                            'borderTopLeftRadius',
                            'borderTopRightRadius',
                            'borderBottomRightRadius',
                            'borderBottomLeftRadius'
                        );
                        result.backgroundColor = node.backgroundColor;
                        result.backgroundImage = node.backgroundImage;
                        this.inheritApply('boxStyle', result);
                    }
                    this.setCacheValue('visibleStyle', undefined);
                    node.setCacheValue('backgroundColor', '');
                    node.setCacheValue('backgroundImage', '');
                    node.cssApply({
                        backgroundColor: 'transparent',
                        backgroundImage: 'none',
                        borderRadius: '0px'
                    });
                    const visibleStyle = node.visibleStyle;
                    visibleStyle.background = false;
                    visibleStyle.backgroundImage = false;
                    visibleStyle.backgroundRepeatX = false;
                    visibleStyle.backgroundRepeatY = false;
                    visibleStyle.backgroundColor = false;
                    visibleStyle.borderWidth = false;
                    visibleStyle.borderRadius = false;
                    break;
                }
            }
        }
        return result;
    }

    public inheritApply(module: string, data: PlainObject) {
        switch (module) {
            case 'initial':
                this._initial = this._initial ? cloneObject<InitialData<T>>(data, { target: this._initial }) : { ...data };
                break;
            case 'textStyle':
                this.cssApply(data);
                break;
            case 'boxStyle':
                this.cssApply(data);
                this.unsetCache('borderTopWidth', 'borderBottomWidth', 'borderRightWidth', 'borderLeftWidth');
                this.setCacheValue('backgroundColor', data.backgroundColor);
                this.setCacheValue('backgroundImage', data.backgroundImage);
                break;
        }
    }

    public addAlign(value: number) {
        this.alignmentType |= value;
    }

    public removeAlign(value: number) {
        this.alignmentType &= ~value;
    }

    public hasAlign(value: number) {
        return (this.alignmentType & value) > 0;
    }

    public hasResource(value: number) {
        return !this._exclusions || !(this._exclusions[0] & value);
    }

    public hasProcedure(value: number) {
        return !this._exclusions || !(this._exclusions[1] & value);
    }

    public hasSection(value: number) {
        return !this._exclusions || !(this._exclusions[2] & value);
    }

    public exclude(options: ExcludeOptions) {
        const { resource, procedure, section } = options;
        const exclusions = this._exclusions ||= [0, 0, 0];
        if (resource) {
            exclusions[0] |= resource;
        }
        if (procedure) {
            exclusions[1] |= procedure;
        }
        if (section) {
            exclusions[2] |= section;
        }
    }

    public setExclusions() {
        if (this.naturalElement) {
            const dataset = (this._element as HTMLElement).dataset;
            if (hasKeys(dataset)) {
                const systemName = this.localSettings.systemName;
                const exclusions = this._exclusions ||= [0, 0, 0];
                exclusions[0] |= applyExclusionValue(NODE_RESOURCE, dataset['excludeResource' + systemName] || dataset.excludeResource);
                exclusions[1] |= applyExclusionValue(NODE_PROCEDURE, dataset['excludeProcedure' + systemName] || dataset.excludeProcedure);
                exclusions[2] |= applyExclusionValue(APP_SECTION, dataset['excludeSection' + systemName] || dataset.excludeSection);
                if (!this.isEmpty()) {
                    const resource = applyExclusionValue(NODE_RESOURCE, dataset['excludeResourceChild' + systemName] || dataset.excludeResourceChild);
                    const procedure = applyExclusionValue(NODE_PROCEDURE, dataset['excludeProcedureChild' + systemName] || dataset.excludeProcedureChild);
                    const section = applyExclusionValue(APP_SECTION, dataset['excludeSectionChild' + systemName] || dataset.excludeSectionChild);
                    if (resource || procedure || section) {
                        const data: ExcludeOptions = { resource, procedure, section };
                        this.each((node: T) => node.exclude(data));
                    }
                }
            }
        }
    }

    public replaceTry(options: ReplaceTryOptions<T>) {
        const { child, replaceWith } = options;
        const children = this.children as T[];
        for (let i = 0, length = children.length; i < length; ++i) {
            const item = children[i];
            if (item === child || item === child.outerMostWrapper) {
                replaceWith.parent?.remove(replaceWith);
                let childIndex: Undef<number>;
                if (replaceWith.naturalChild && this.naturalElement) {
                    replaceWith.actualParent!.naturalChildren.splice(replaceWith.childIndex, 1);
                    this.naturalChildren.splice(childIndex = child.childIndex, 1, replaceWith);
                }
                replaceWith.internalSelf(this, child.depth, childIndex);
                children[i] = replaceWith;
                return true;
            }
        }
        if (options.notFoundAppend) {
            replaceWith.parent = this;
            return true;
        }
        return false;
    }

    public removeTry(options?: RemoveTryOptions<T>) {
        const renderParent = this.renderParent;
        if (renderParent) {
            const { renderTemplates, renderChildren } = renderParent;
            if (renderTemplates) {
                const index = renderChildren.indexOf(this);
                if (index !== -1) {
                    const template = renderTemplates[index];
                    if (template.node === this) {
                        let replaceWith: Undef<T>,
                            beforeReplace: Undef<FunctionBind<T>>;
                        if (options) {
                            ({ replaceWith, beforeReplace } = options);
                        }
                        if (replaceWith) {
                            const replaceParent = replaceWith.renderParent;
                            if (replaceParent) {
                                const replaceTemplates = replaceParent.renderTemplates;
                                if (replaceTemplates) {
                                    const replaceIndex = replaceTemplates.findIndex(item => item.node === replaceWith);
                                    if (replaceIndex !== -1) {
                                        if (beforeReplace) {
                                            beforeReplace.call(this, replaceWith);
                                        }
                                        renderChildren[index] = replaceWith;
                                        renderTemplates[index] = replaceTemplates[replaceIndex];
                                        replaceTemplates.splice(replaceIndex, 1);
                                        replaceParent.renderChildren.splice(replaceIndex, 1);
                                        replaceWith.renderParent = renderParent;
                                        if (this.documentRoot) {
                                            replaceWith.documentRoot = true;
                                            this.documentRoot = false;
                                        }
                                        replaceWith.unsafe('depth', this.depth);
                                        this.renderParent = null;
                                        return template;
                                    }
                                }
                            }
                        }
                        else {
                            if (beforeReplace) {
                                beforeReplace.call(this);
                            }
                            renderChildren.splice(index, 1);
                            this.renderParent = null;
                            return renderTemplates.splice(index, 1)[0];
                        }
                    }
                }
            }
        }
        return null;
    }

    public alignedVertically(siblings?: Null<T[]>, cleared?: Null<Map<T, string>>, horizontal?: boolean, partition?: boolean): number {
        if (this.lineBreak) {
            return NODE_TRAVERSE.LINEBREAK;
        }
        else if (!this.pageFlow) {
            if (this.autoPosition) {
                siblings ||= this.siblingsLeading;
                for (let i = siblings.length - 1; i >= 0; --i) {
                    const previous = siblings[i];
                    if (previous.pageFlow) {
                        return previous.blockStatic || cleared && cleared.has(previous) ? NODE_TRAVERSE.VERTICAL : NODE_TRAVERSE.HORIZONTAL;
                    }
                }
                return NODE_TRAVERSE.HORIZONTAL;
            }
            return NODE_TRAVERSE.VERTICAL;
        }
        const floating = this.floating;
        const checkBlockDimension = (previous: T) => this.blockDimension && Math.ceil(this.bounds.top) >= previous.bounds.bottom && (this.blockVertical || previous.blockVertical || this.percentWidth > 0 || previous.percentWidth > 0);
        if (isArray(siblings)) {
            const previous = siblings[siblings.length - 1];
            const getPercentWidth = (node: T) => node.inlineDimension && !node.hasUnit('maxWidth') ? node.percentWidth : -Infinity;
            if (cleared) {
                if (cleared.size && (cleared.has(this) || this.siblingsLeading.some(item => item.excluded && cleared.has(item)))) {
                    return NODE_TRAVERSE.FLOAT_CLEAR;
                }
                else if (floating && previous.floating) {
                    if (horizontal && this.float === previous.float || Math.floor(this.bounds.top) === Math.floor(previous.bounds.top)) {
                        return NODE_TRAVERSE.HORIZONTAL;
                    }
                    else if (Math.ceil(this.bounds.top) >= previous.bounds.bottom) {
                        if (siblings.every(item => item.inlineDimension)) {
                            const parent = this.actualParent!;
                            if (parent.ascend({ condition: item => !item.inline && item.hasWidth, error: (item: T) => item.layoutElement, startSelf: true }).length) {
                                const length = siblings.length;
                                if (parent.naturalChildren.filter((item: T) => item.visible && item.pageFlow).length === length + 1) {
                                    const getLayoutWidth = (node: T) => node.actualWidth + Math.max(node.marginLeft, 0) + node.marginRight;
                                    let width = parent.box.width - getLayoutWidth(this);
                                    for (let i = 0; i < length; ++i) {
                                        width -= getLayoutWidth(siblings[i]);
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
                else {
                    if (this.blockStatic && siblings.reduce((a, b) => a + (b.floating ? b.linear.width : -Infinity), 0) / this.actualParent!.box.width >= 0.8) {
                        return NODE_TRAVERSE.FLOAT_INTERSECT;
                    }
                    if (siblings.every(item => item.inlineDimension && Math.ceil(this.bounds.top) >= item.bounds.bottom)) {
                        return NODE_TRAVERSE.FLOAT_BLOCK;
                    }
                    if (horizontal !== undefined) {
                        if (floating && !horizontal && previous.blockStatic) {
                            return NODE_TRAVERSE.HORIZONTAL;
                        }
                        if (!startsWith(this.display, 'inline-')) {
                            let { top, bottom } = this.bounds;
                            if (this.textElement && cleared.size && siblings.some(item => cleared.has(item)) && siblings.some(item => Math.floor(top) < item.bounds.top && Math.ceil(bottom) > item.bounds.bottom)) {
                                return NODE_TRAVERSE.FLOAT_INTERSECT;
                            }
                            if (siblings[0].floating) {
                                const length = siblings.length;
                                if (length > 1) {
                                    const float = siblings[0].float;
                                    let maxBottom = -Infinity,
                                        contentWidth = 0;
                                    for (let i = 0; i < length; ++i) {
                                        const item = siblings[i];
                                        if (item.floating) {
                                            if (item.float === float) {
                                                maxBottom = Math.max(item.actualRect('bottom', 'bounds'), maxBottom);
                                            }
                                            contentWidth += item.linear.width;
                                        }
                                    }
                                    if (Math.ceil(contentWidth) >= this.actualParent!.box.width) {
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
                                        top = offset <= 0 || offset / (bottom - top) < 0.5 ? -Infinity : Infinity;
                                    }
                                    else {
                                        top = Math.ceil(top);
                                    }
                                    if (top < Math.floor(maxBottom)) {
                                        return horizontal ? NODE_TRAVERSE.HORIZONTAL : NODE_TRAVERSE.FLOAT_BLOCK;
                                    }
                                    return horizontal ? NODE_TRAVERSE.FLOAT_BLOCK : NODE_TRAVERSE.HORIZONTAL;
                                }
                                if (!horizontal) {
                                    return NODE_TRAVERSE.FLOAT_BLOCK;
                                }
                            }
                        }
                    }
                }
            }
            if (checkBlockDimension(previous) || partition && Math.ceil(this.bounds.top) >= previous.bounds.bottom) {
                return NODE_TRAVERSE.INLINE_WRAP;
            }
            const percentWidth = getPercentWidth(this);
            if (percentWidth > 0 && siblings.reduce((a, b) => a + getPercentWidth(b), percentWidth) > 1) {
                return NODE_TRAVERSE.PERCENT_WRAP;
            }
        }
        const blockStatic = this.blockStatic || this.display === 'table';
        const length = this.siblingsLeading.length;
        if (blockStatic && length === 0) {
            return NODE_TRAVERSE.VERTICAL;
        }
        for (let i = length - 1; i >= 0; --i) {
            const previous = this.siblingsLeading[i];
            if (previous.excluded && cleared && cleared.has(previous)) {
                return NODE_TRAVERSE.FLOAT_CLEAR;
            }
            if (previous.blockStatic || previous.autoMargin.leftRight || (horizontal === false || floating && previous.childIndex === 0) && previous.plainText && previous.multiline) {
                return NODE_TRAVERSE.VERTICAL;
            }
            if (blockStatic && (!previous.floating || cleared && cleared.has(previous) || i === length - 1 && !previous.pageFlow)) {
                return NODE_TRAVERSE.VERTICAL;
            }
            if (previous.floating) {
                if (previous.float === 'left') {
                    if (this.autoMargin.right) {
                        return NODE_TRAVERSE.FLOAT_BLOCK;
                    }
                }
                else if (this.autoMargin.left) {
                    return NODE_TRAVERSE.FLOAT_BLOCK;
                }
                if (this.floatContainer && this.find(item => item.floating && Math.ceil(item.bounds.top) >= previous.bounds.bottom)) {
                    return NODE_TRAVERSE.FLOAT_BLOCK;
                }
            }
            if (checkBlockDimension(previous)) {
                return NODE_TRAVERSE.INLINE_WRAP;
            }
        }
        return NODE_TRAVERSE.HORIZONTAL;
    }

    public previousSiblings(options?: TraverseSiblingsOptions): T[] {
        return traverseElementSibling(this.innerMostWrapped.element, 'previousSibling', this.sessionId, options);
    }

    public nextSiblings(options?: TraverseSiblingsOptions): T[] {
        return traverseElementSibling(this.innerMostWrapped.element, 'nextSibling', this.sessionId, options);
    }

    public actualSpacing(region: BOX_STANDARD) {
        const index = getBoxSpacing(region);
        return (!this._boxReset || this._boxReset[index] === 0 ? getBoxOffset(this, index) : 0) + (this._boxAdjustment ? this._boxAdjustment[index] : 0);
    }

    public modifyBox(region: BOX_STANDARD, value: number, negative = true) {
        if (value !== 0) {
            const index = getBoxSpacing(region);
            const node = this._boxRegister?.[index];
            if (node) {
                node.modifyBox(region, value, negative);
            }
            else {
                const boxReset = this.boxReset;
                const boxAdjustment = this.boxAdjustment;
                if (!negative && (boxReset[index] === 0 ? getBoxOffset(this, index) : 0) + boxAdjustment[index] + value <= 0) {
                    boxAdjustment[index] = 0;
                    if (value < 0 && getBoxOffset(this, index) >= 0) {
                        boxReset[index] = 1;
                    }
                }
                else {
                    boxAdjustment[index] += value;
                }
            }
        }
    }

    public getBox(region: BOX_STANDARD): [number, number] {
        const index = getBoxSpacing(region);
        return [this._boxReset ? this._boxReset[index] : 0, this._boxAdjustment ? this._boxAdjustment[index] : 0];
    }

    public setBox(region: BOX_STANDARD, options: BoxOptions) {
        const index = getBoxSpacing(region);
        const node = this._boxRegister?.[index];
        if (node) {
            node.setBox(region, options);
        }
        else {
            const reset = options.reset;
            if (reset !== undefined) {
                this.boxReset[index] = reset;
            }
            let value = options.adjustment;
            if (value !== undefined) {
                const boxAdjustment = this.boxAdjustment;
                if (options.max) {
                    boxAdjustment[index] = Math.max(value, boxAdjustment[index]);
                }
                else if (options.min) {
                    boxAdjustment[index] = Math.min(value, boxAdjustment[index] || Infinity);
                }
                else {
                    if (options.accumulate) {
                        value += boxAdjustment[index];
                    }
                    if (options.negative === false) {
                        if ((!this._boxReset || this.boxReset[index] === 0 ? getBoxOffset(this, index) : 0) + value <= 0) {
                            if (value < 0 && getBoxOffset(this, index) >= 0) {
                                this.boxReset[index] = 1;
                            }
                            value = 0;
                        }
                    }
                    boxAdjustment[index] = value;
                }
            }
            else if (reset === 1 && !this.naturalChild) {
                this.boxAdjustment[index] = 0;
            }
        }
    }

    public resetBox(region: BOX_STANDARD, node?: T) {
        if (BOX_STANDARD.MARGIN & region) {
            applyBoxReset(this, 0, region, node);
        }
        if (BOX_STANDARD.PADDING & region) {
            applyBoxReset(this, 4, region, node);
        }
    }

    public transferBox(region: BOX_STANDARD, node: T) {
        if (BOX_STANDARD.MARGIN & region) {
            applyBoxAdjustment(this, 0, region, node, this._boxAdjustment);
        }
        if (BOX_STANDARD.PADDING & region) {
            applyBoxAdjustment(this, 4, region, node, this._boxAdjustment);
        }
    }

    public registerBox(region: BOX_STANDARD, node?: T): Null<T> {
        this._boxRegister ||= new Array(8);
        const index = getBoxSpacing(region);
        if (node) {
            this._boxRegister[index] = node;
        }
        else {
            node = this._boxRegister[index] as Undef<T>;
        }
        while (node) {
            const next: Undef<T> = node.unsafe<T[]>('boxRegister')?.[index];
            if (next) {
                node = next;
            }
            else {
                break;
            }
        }
        return node || null;
    }

    public actualPadding(attr: "paddingTop" | "paddingBottom", value: number) {
        if (value > 0) {
            if (!this.layoutElement) {
                const node = this.innerMostWrapped;
                if (node !== this) {
                    if (node.naturalChild) {
                        if (!node.getBox(attr === 'paddingTop' ? BOX_STANDARD.PADDING_TOP : BOX_STANDARD.PADDING_BOTTOM)[0]) {
                            return 0;
                        }
                    }
                    else {
                        return value;
                    }
                }
                if (node.naturalChild) {
                    return canCascadeChildren(node) && cascadeActualPadding(node.naturalElements as T[], attr, value) ? 0 : value;
                }
            }
            else if (this.gridElement) {
                switch (this.valueOf('alignContent')) {
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
        value ||= this.box.width;
        if (this.pageFlow) {
            let offsetLeft = 0,
                offsetRight = 0,
                current = this.actualParent;
            while (current) {
                if (current.hasUnit('width', { percent: false }) || !current.pageFlow) {
                    return value;
                }
                offsetLeft += Math.max(current.marginLeft, 0) + current.borderLeftWidth + current.paddingLeft;
                offsetRight += current.paddingRight + current.borderRightWidth + current.marginRight;
                current = current.actualParent;
            }
            const screenWidth = this.localSettings.screenDimension.width - offsetLeft - offsetRight;
            if (screenWidth > 0) {
                return Math.min(value, screenWidth);
            }
        }
        return value;
    }

    public actualTextHeight(options?: TextHeightOptions) {
        let tagName: Undef<string>,
            width: Undef<string>,
            textWrap: Undef<boolean>,
            textContent: Undef<string>;
        if (options) {
            ({ tagName, width, textContent, textWrap } = options);
        }
        tagName ||= this.tagName;
        const style: CssStyleMap = tagName[0] === '#'
            ? {}
            : this.cssAsObject(
                'paddingTop',
                'paddingRight',
                'paddingBottom',
                'paddingLeft',
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
                'borderLeftStyle'
            );
        Object.assign(style, this.textStyle);
        style.fontSize = this.naturalElement && this.valueOf('fontSize') || this.fontSize + 'px';
        style.lineHeight = this.naturalElement && this.valueOf('lineHeight') || this.lineHeight + 'px';
        if (width) {
            style.width = width;
        }
        if (textWrap !== true) {
            style.whiteSpace = 'nowrap';
        }
        style.display = 'inline-block';
        const parent = this.parentElement || document.body;
        const element = createElement(tagName !== '#text' ? tagName : 'span', { attributes: { textContent: textContent || 'AgjpqyZ' }, style });
        parent.appendChild(element);
        const result = getRangeClientRect(element);
        parent.removeChild(element);
        return result ? result.height : NaN;
    }

    public cloneBase(node: T) {
        node.internalSelf(this.parent, this.depth, this.childIndex, this.actualParent);
        node.inlineText = this.inlineText;
        node.documentRoot = this.documentRoot;
        node.localSettings = this.localSettings;
        node.alignmentType = this.alignmentType;
        node.containerName = this.containerName;
        node.visible = this.visible;
        node.excluded = this.excluded;
        node.rendered = this.rendered;
        node.lineBreakLeading = this.lineBreakLeading;
        node.lineBreakTrailing = this.lineBreakTrailing;
        node.documentParent = this.documentParent;
        node.renderParent = this.renderParent;
        node.renderedAs = this.renderedAs;
        node.rootElement = this.rootElement;
        if (!this.isEmpty()) {
            node.retainAs(this.toArray());
        }
        node.inherit(this, 'initial', 'base', 'alignment', 'styleMap', 'textStyle');
        Object.assign(node.unsafe<CacheValueUI>('cache'), this._cache);
        Object.assign(node.unsafe<CacheStateUI<T>>('cacheState'), this._cacheState);
    }

    public css(attr: CssStyleAttr, value?: Null<string>, cache = false) {
        if (arguments.length >= 2) {
            if (value) {
                this._styleMap[attr] = value;
            }
            else if (value === null) {
                delete this._styleMap[attr];
            }
            if (cache) {
                this.unsetCache(attr);
            }
        }
        return this._styleMap[attr] || this.naturalChild && this.style[attr] || '';
    }

    public cssApply(values: CssStyleMap, overwrite = true, cache?: boolean) {
        if (overwrite) {
            Object.assign(this._styleMap, values);
            if (cache) {
                this.unsetCache(...Object.keys(values) as CssStyleAttr[]);
            }
        }
        else {
            const style = this._styleMap;
            for (const attr in values) {
                if (!style[attr]) {
                    style[attr] = values[attr];
                    if (cache) {
                        this.unsetCache(attr as CssStyleAttr);
                    }
                }
            }
        }
        return this;
    }

    public cssSet(attr: CssStyleAttr, value: string, cache = true) {
        return super.css(...(arguments as unknown) as [CssStyleAttr, string, boolean?]);
    }

    public setCacheValue(attr: keyof CacheValueUI, value: any) {
        this._cache[attr] = value;
    }

    public setCacheState(attr: keyof CacheStateUI<T>, value: any) {
        this._cacheState[attr] = value;
    }

    public unsetCache(...attrs: (CssStyleAttr | keyof CacheValueUI)[]) {
        const length = attrs.length;
        if (length) {
            const cache = this._cache;
            for (let i = 0; i < length; ++i) {
                switch (attrs[i]) {
                    case 'top':
                    case 'right':
                    case 'bottom':
                    case 'left':
                        cache.autoPosition = undefined;
                        cache.positiveAxis = undefined;
                        break;
                    case 'float':
                        cache.floating = undefined;
                        break;
                    case 'fontSize':
                    case 'lineHeight':
                        cache.baselineHeight = undefined;
                        break;
                    case 'baseline':
                        cache.baselineElement = undefined;
                        this.actualParent?.unsetCache('baselineElement');
                        break;
                    case 'height':
                        cache.overflow = undefined;
                    case 'minHeight':
                        cache.blockVertical = undefined;
                        break;
                    case 'width':
                    case 'maxWidth':
                    case 'maxHeight':
                    case 'overflowX':
                    case 'overflowY':
                        cache.overflow = undefined;
                        break;
                }
            }
        }
        super.unsetCache(...attrs as CssStyleAttr[]);
    }

    public getAnchoredSiblings(orientation: OrientationAttr) {
        const renderParent = this.renderParent;
        if (renderParent) {
            if (orientation === 'horizontal') {
                const horizontalRows = renderParent.horizontalRows;
                if (horizontalRows) {
                    for (let i = 0, length = horizontalRows.length; i < length; ++i) {
                        const row = horizontalRows[i];
                        const index = row.indexOf(this);
                        if (index !== -1) {
                            const q = row.length;
                            if (q === 1) {
                                return [];
                            }
                            if (index === 0) {
                                return row.splice(1);
                            }
                            const siblings = row.splice(0, index);
                            return index === q - 1 ? siblings : [...siblings, ...row.splice(index + 1)];
                        }
                    }
                }
                return this.anchorChain('left', 'right');
            }
            return this.anchorChain('top', 'bottom');
        }
        return [];
    }

    public getBoxSpacing(): [number, number, number, number] {
        const { boxReset, boxAdjustment } = this;
        return [
            (!boxReset[0] ? this.marginTop : 0) + this.borderTopWidth + (!boxReset[4] ? this.paddingTop : 0) + boxAdjustment[0] + boxAdjustment[4],
            (!boxReset[1] ? this.marginRight : 0) + this.borderRightWidth + (!boxReset[5] ? this.paddingRight : 0) + boxAdjustment[1] + boxAdjustment[5],
            (!boxReset[2] ? this.marginBottom : 0) + this.borderBottomWidth + (!boxReset[6] ? this.paddingBottom : 0) + boxAdjustment[2] + boxAdjustment[6],
            (!boxReset[3]? this.marginLeft : 0) + this.borderLeftWidth + (!boxReset[7] ? this.paddingLeft : 0) + boxAdjustment[3] + boxAdjustment[7]
        ];
    }

    public getPseudoElement(name: PseudoElt, attr?: CssStyleAttr) {
        if (this.naturalElement) {
            if (attr) {
                return getStyle(this._element!, name)[attr] || '';
            }
            const style = this._elementData!['styleMap' + name] as Undef<CssStyleMap>;
            if (style) {
                switch (name) {
                    case '::before':
                    case '::after':
                    case '::first-letter':
                    case '::first-line':
                    case '::marker':
                    case '::placeholder':
                        return Node.sanitizeCss(this._element as HTMLElement, style, style.writingMode || this.valueOf('writingMode'));
                }
            }
        }
        return attr ? '' : null;
    }

    public isResizable(attr: DimensionSizableAttr, not?: StringOfArray) {
        return this.has(attr, { type: CSS_UNIT.PERCENT | (attr === 'width' || attr === 'height' ? 0 : CSS_UNIT.LENGTH), not: not || '100%' });
    }

    public fitToScreen(value: Dimension): Dimension {
        const { width, height } = this.localSettings.screenDimension;
        if (value.width > width) {
            return { width, height: Math.round(value.height * width / value.width) };
        }
        if (value.height > height) {
            return { width: Math.round(value.width * height / value.height), height };
        }
        return value;
    }

    public cssValue(attr: CssStyleAttr) {
        return this._styleMap[attr] || '';
    }

    public cssValues(...attrs: CssStyleAttr[]) {
        const style = this._styleMap;
        const length = attrs.length;
        const result: string[] = new Array(length);
        for (let i = 0; i < length; ++i) {
            result[i] = style[attrs[i]] || '';
        }
        return result;
    }

    get element() {
        return this._element || this.innerWrapped && this.innerMostWrapped.unsafe<Null<Element>>('element') || null;
    }

    get naturalChild() {
        const result = this._cacheState.naturalChild;
        if (result === undefined) {
            const element = this._element;
            return this._cacheState.naturalChild = !!(element && (element.parentNode || element === document.documentElement));
        }
        return result;
    }

    get pseudoElement() {
        const result = this._cacheState.pseudoElement;
        return result === undefined ? this._cacheState.pseudoElement = !!this._element && this._element.className === '__squared-pseudo' : result;
    }

    get scrollElement() {
        let result = this._cache.scrollElement;
        if (result === undefined) {
            if (this.htmlElement) {
                switch (this.tagName) {
                    case 'INPUT':
                        switch ((this._element as HTMLInputElement).type) {
                            case 'button':
                            case 'submit':
                            case 'reset':
                            case 'file':
                            case 'date':
                            case 'datetime-local':
                            case 'month':
                            case 'week':
                            case 'time':
                            case 'range':
                            case 'color':
                                result = true;
                                break;
                            default:
                                result = false;
                                break;
                        }
                        break;
                    case 'IMG':
                    case 'SELECT':
                    case 'TABLE':
                    case 'VIDEO':
                    case 'AUDIO':
                    case 'PROGRESS':
                    case 'METER':
                    case 'HR':
                    case 'BR':
                        result = false;
                        break;
                    default:
                        result = this.blockDimension;
                        break;
                }
            }
            else {
                result = false;
            }
            this._cache.scrollElement = result;
        }
        return result;
    }

    get layoutElement() {
        const result = this._cache.layoutElement;
        return result === undefined ? this._cache.layoutElement = this.flexElement || this.gridElement : result;
    }

    get imageElement() {
        const result = this._cache.imageElement;
        return result === undefined ? this._cache.imageElement = super.imageElement : result;
    }

    get flexElement() {
        const result = this._cache.flexElement;
        return result === undefined ? this._cache.flexElement = super.flexElement : result;
    }

    get gridElement() {
        const result = this._cache.gridElement;
        return result === undefined ? this._cache.gridElement = super.gridElement : result;
    }

    get tableElement() {
        const result = this._cache.tableElement;
        return result === undefined ? this._cache.tableElement = super.tableElement : result;
    }

    get inputElement() {
        const result = this._cache.inputElement;
        return result === undefined ? this._cache.inputElement = super.inputElement : result;
    }

    get buttonElement() {
        const result = this._cache.buttonElement;
        return result === undefined ? this._cache.buttonElement = super.buttonElement : result;
    }

    get floating() {
        const result = this._cache.floating;
        return result === undefined ? this._cache.floating = super.floating : result;
    }

    get float() {
        const result = this._cache.float;
        return result === undefined ? this._cache.float = super.float : result;
    }

    set textContent(value) {
        this._cacheState.textContent = value;
    }
    get textContent() {
        const result = this._cacheState.textContent;
        return result === undefined ? this._cacheState.textContent = super.textContent : result;
    }

    get contentBox() {
        const result = this._cache.contentBox;
        return result === undefined ? this._cache.contentBox = super.contentBox : result;
    }

    get positionRelative() {
        const result = this._cache.positionRelative;
        return result === undefined ? this._cache.positionRelative = super.positionRelative : result;
    }

    set parent(value) {
        if (value) {
            const parent = this._parent;
            if (value !== parent) {
                if (parent) {
                    parent.remove(this);
                }
                this._parent = value;
                value.add(this);
            }
            else if (!value.contains(this)) {
                value.add(this);
            }
            if (this._depth === -1) {
                this._depth = value.depth + 1;
            }
        }
    }
    get parent() {
        return this._parent as Null<T>;
    }

    set actualParent(value: Null<T>) {
        this._actualParent = value;
    }
    get actualParent(): Null<T> {
        const result = this._actualParent as Null<T>;
        if (!result && !this.naturalChild) {
            const element = this.innerMostWrapped.element;
            const parentElement = element && getParentElement(element);
            return this._actualParent = parentElement && getElementAsNode<T>(parentElement, this.sessionId) || this.parent;
        }
        return result;
    }

    set documentParent(value) {
        this._documentParent = value;
    }
    get documentParent(): T {
        return this._documentParent ||= (this.absoluteParent || this.actualParent || this.parent || this) as T;
    }

    set containerName(value) {
        this._cacheState.containerName = value.toUpperCase();
    }
    get containerName() {
        let result = this._cacheState.containerName;
        if (result === undefined) {
            const element = this.element;
            if (element) {
                if ((result = element.nodeName)[0] === '#') {
                    result = 'PLAINTEXT';
                }
                else {
                    if ((result = result.toUpperCase()) === 'INPUT') {
                        result += '_' + (element as HTMLInputElement).type.toUpperCase();
                    }
                    result = replaceAll(result, '-', '_');
                }
            }
            return this._cacheState.containerName = result || 'UNKNOWN';
        }
        return result;
    }

    get layoutHorizontal() {
        return this.hasAlign(NODE_ALIGNMENT.HORIZONTAL);
    }
    get layoutVertical() {
        if (this.hasAlign(NODE_ALIGNMENT.VERTICAL)) {
            return true;
        }
        else if (this.naturalChild) {
            const children = this.naturalChildren;
            return children.length === 1 && children[0].blockStatic;
        }
        return false;
    }

    get nodeGroup() { return false; }

    set renderAs(value) {
        if (!this.rendered && value && !value.renderParent) {
            this._renderAs = value;
        }
        else {
            this._renderAs = null;
        }
    }
    get renderAs() {
        return this._renderAs;
    }

    get inlineVertical() {
        let result = this._cache.inlineVertical;
        if (result === undefined) {
            if (this.naturalElement || this.pseudoElement) {
                const value = this.display;
                result = (startsWith(value, 'inline') || value === 'table-cell') && !this.floating && this._element !== document.documentElement;
            }
            else {
                result = false;
            }
            this._cache.inlineVertical = result;
        }
        return result;
    }

    get inlineDimension() {
        const result = this._cache.inlineDimension;
        return result === undefined ? this._cache.inlineDimension = (this.naturalElement || this.pseudoElement) && (startsWith(this.display, 'inline-') || this.floating) : result;
    }

    get inlineFlow() {
        const result = this._cache.inlineFlow;
        return result === undefined ? this._cache.inlineFlow = (this.inline || this.inlineDimension || this.inlineVertical || this.floating || this.imageElement || this.svgElement && this.hasUnit('width', { percent: false }) || this.tableElement && !!this.previousSibling?.floating) && this.pageFlow : result;
    }

    set inlineText(value) {
        this._inlineText = value;
    }
    get inlineText() {
        return this._inlineText;
    }

    get blockStatic() {
        return super.blockStatic || this.hasAlign(NODE_ALIGNMENT.BLOCK) && this.pageFlow && !this.floating;
    }

    get blockDimension(): boolean {
        const result = this._cache.blockDimension;
        return result === undefined ? this._cache.blockDimension = this.inlineStatic && !this.isEmpty() ? !!this.firstStaticChild?.blockStatic : this.block || this.inlineDimension || this.display === 'table' || this.imageElement || this.svgElement : result;
    }

    get blockVertical() {
        const result = this._cache.blockVertical;
        return result === undefined ? this._cache.blockVertical = this.blockDimension && this.height > 0 : result;
    }

    get rightAligned() {
        return this.hasAlign(NODE_ALIGNMENT.RIGHT) || super.rightAligned;
    }

    get verticalAligned() {
        const result = this._cache.verticalAligned;
        return result === undefined ? this._cache.verticalAligned = this.verticalAlign !== 0 && !isNaN(parseFloat(this.valueOf('verticalAlign'))) : result;
    }

    get variableWidth() {
        const result = this._cache.variableWidth;
        if (result === undefined) {
            const percent = this.percentWidth;
            return this._cache.variableWidth = percent > 0 && percent < 1 || this.isResizable('maxWidth');
        }
        return result;
    }

    get variableHeight() {
        const result = this._cache.variableHeight;
        if (result === undefined) {
            const percent = this.percentHeight;
            return this._cache.variableHeight = percent > 0 && percent < 1 || this.isResizable('maxHeight') && this.containerHeight;
        }
        return result;
    }

    get fullWidth() {
        const result = this._cache.fullWidth;
        if (result === undefined) {
            const width = this.valueOf('width');
            const minWidth = this.valueOf('minWidth');
            let documentBody: Undef<boolean>;
            return this._cache.fullWidth = (width === '100%' || minWidth === '100%' || (width === '100vw' || minWidth === '100vw') && (documentBody = this.absoluteParent?.documentBody && (!this.pageFlow || this.onlyStaticChild) || this.documentBody)) && !this.isResizable('maxWidth', documentBody ? ['100%', '100vw'] : undefined);
        }
        return result;
    }

    get fullHeight() {
        const result = this._cache.fullHeight;
        if (result === undefined) {
            const height = this.valueOf('height');
            const minHeight = this.valueOf('minHeight');
            let documentBody: Undef<boolean>;
            return this._cache.fullHeight = (height === '100%' || minHeight === '100%' || (height === '100vh' || minHeight === '100vh') && (documentBody = this.absoluteParent?.documentBody && (!this.pageFlow || this.onlyStaticChild) || this.documentBody)) && !this.isResizable('maxHeight', documentBody ? ['100%', '100vh'] : undefined) && this.containerHeight;
        }
        return result;
    }

    get flexRow() {
        return this.flexElement && !!this.flexdata.row;
    }

    get flexColumn() {
        return this.flexElement && !!this.flexdata.column;
    }

    set autoPosition(value) {
        this._cache.autoPosition = value;
    }
    get autoPosition() {
        let result = this._cache.autoPosition;
        if (result === undefined) {
            if (!this.pageFlow) {
                const { top, right, bottom, left } = this._styleMap;
                result = (!top || top === 'auto') && (!left || left === 'auto') && (!right || right === 'auto') && (!bottom || bottom === 'auto');
            }
            else {
                result = false;
            }
            this._cache.autoPosition = result;
        }
        return result;
    }

    get positiveAxis() {
        const result = this._cache.positiveAxis;
        return result === undefined ? this._cache.positiveAxis = (!this.positionRelative || this.top >= 0 && this.left >= 0 && (this.right <= 0 || this.hasUnit('left')) && (this.bottom <= 0 || this.hasUnit('top'))) && this.marginTop >= 0 && this.marginLeft >= 0 && this.marginRight >= 0 : result;
    }

    get leftTopAxis() {
        let result = this._cache.leftTopAxis;
        if (result === undefined) {
            switch (this.valueOf('position')) {
                case 'absolute':
                    result = this.absoluteParent === this.documentParent;
                    break;
                case 'fixed':
                    result = true;
                    break;
                default:
                    result = false;
                    break;
            }
            this._cache.leftTopAxis = result;
        }
        return result;
    }

    get baselineElement(): boolean {
        let result = this._cache.baselineElement;
        if (result === undefined) {
            if (this.css('verticalAlign') === 'baseline' && !this.floating) {
                const children = this.naturalChildren;
                if (children.length) {
                    result = children.every((node: T) => {
                        do {
                            if (node.css('verticalAlign') === 'baseline' && !node.floating) {
                                switch (node.size()) {
                                    case 0:
                                        return node.baselineElement && !(node.positionRelative && (node.top !== 0 || node.bottom !== 0));
                                    case 1:
                                        node = node.children[0] as T;
                                        break;
                                    default:
                                        return false;
                                }
                            }
                            else {
                                return false;
                            }
                        }
                        while (true);
                    });
                }
                else {
                    result = this.inlineText && this.textElement || this.plainText && !this.multiline || this.inputElement || this.imageElement || this.svgElement;
                }
            }
            else {
                result = false;
            }
            this._cache.baselineElement = result;
        }
        return result;
    }

    get styleText() {
        return this.naturalElement && this.inlineText;
    }

    set multiline(value) {
        this._cache.multiline = value;
        this._cache.baselineElement = undefined;
    }
    get multiline() {
        return super.multiline;
    }

    set controlName(value) {
        if (!this.rendered || !this._cacheState.controlName) {
            this._cacheState.controlName = value;
        }
    }
    get controlName() {
        return this._cacheState.controlName || '';
    }

    set siblingsLeading(value) {
        this._siblingsLeading = value;
    }
    get siblingsLeading() {
        return this._siblingsLeading ||= this.previousSiblings({ floating: true });
    }

    set siblingsTrailing(value) {
        this._siblingsTrailing = value;
    }
    get siblingsTrailing() {
        return this._siblingsTrailing ||= this.nextSiblings({ floating: true });
    }

    get flowElement() {
        return this.pageFlow && (!this.excluded || this.lineBreak);
    }

    get flexbox(): FlexBox {
        return this.naturalChild || !this.innerWrapped ? super.flexbox : this.innerMostWrapped.flexbox;
    }

    get previousSibling(): Null<T> {
        const parent = this.actualParent;
        if (parent) {
            const children = parent.naturalChildren as T[];
            for (let i = children.length - 1, found: Undef<boolean>; i >= 0; --i) {
                const node = children[i];
                if (found) {
                    if (node.flowElement) {
                        return node;
                    }
                }
                else if (node === this) {
                    found = true;
                }
            }
        }
        return null;
    }

    get nextSibling(): Null<T> {
        const parent = this.actualParent;
        if (parent) {
            const children = parent.naturalChildren as T[];
            for (let i = 0, length = children.length, found: Undef<boolean>; i < length; ++i) {
                const node = children[i];
                if (found) {
                    if (node.flowElement) {
                        return node;
                    }
                }
                else if (node === this) {
                    found = true;
                }
            }
        }
        return null;
    }

    get firstChild(): Null<T> {
        return (this.naturalChildren as T[]).find(node => !node.excluded || node.lineBreak) || null;
    }

    get lastChild(): Null<T> {
        return findReverse(this.naturalChildren as T[], node => !node.excluded || node.lineBreak) || null;
    }

    get firstStaticChild(): Null<T> {
        return this.naturalChildren.find((node: T) => node.flowElement) as Undef<T> || null;
    }

    get lastStaticChild(): Null<T> {
        return findReverse(this.naturalChildren as T[], node => node.flowElement) || null;
    }

    get onlyChild() {
        if (!this.rootElement) {
            const children = this.renderParent?.renderChildren || this.parent?.children;
            if (children) {
                const length = children.length;
                if (length > 1) {
                    for (let i = 0; i < length; ++i) {
                        const node = children[i] as T;
                        if (node !== this && node.visible && !node.renderExclude) {
                            return false;
                        }
                    }
                }
                return true;
            }
        }
        return false;
    }

    get onlyStaticChild() {
        if (this.pageFlow && !this.rootElement) {
            const children = this.renderParent?.renderChildren || this.parent?.children;
            if (children) {
                const length = children.length;
                if (length > 1) {
                    for (let i = 0; i < length; ++i) {
                        const node = children[i] as T;
                        if (node !== this && node.pageFlow && node.visible && !node.renderExclude) {
                            return false;
                        }
                    }
                }
                return true;
            }
        }
        return false;
    }

    get innerBefore(): Null<T> {
        return this.naturalChildren.find(node => node.pseudoElt === '::before') as Undef<T> || null;
    }

    get innerAfter(): Null<T> {
        return findReverse(this.naturalChildren as T[], node => node.pseudoElt === '::after') || null;
    }

    get rendering() {
        return this.renderChildren.length > 0;
    }

    get overflowX() {
        let result = this._cache.overflow;
        if (result === undefined) {
            result = setOverflow(this);
            this._cache.overflow = result;
        }
        return (result & NODE_ALIGNMENT.HORIZONTAL) > 0;
    }
    get overflowY() {
        let result = this._cache.overflow;
        if (result === undefined) {
            result = setOverflow(this);
            this._cache.overflow = result;
        }
        return (result & NODE_ALIGNMENT.VERTICAL) > 0;
    }

    get boxReset() {
        return this._boxReset ||= [0, 0, 0, 0, 0, 0, 0, 0];
    }

    get boxAdjustment() {
        return this._boxAdjustment ||= [0, 0, 0, 0, 0, 0, 0, 0];
    }

    get backgroundColor(): string {
        let result = this._cache.backgroundColor;
        if (result === undefined) {
            if ((result = super.backgroundColor) && result[4] !== '(' && this.styleElement && !this.inputElement && this.pageFlow && this.opacity === 1) {
                let parent = this.actualParent;
                while (parent && parent.pageFlow) {
                    const backgroundImage = parent.backgroundImage;
                    if (!backgroundImage) {
                        const color = parent.backgroundColor;
                        if (color) {
                            if (color === result && parent.opacity === 1) {
                                result = '';
                            }
                            break;
                        }
                        parent = parent.actualParent;
                    }
                    else {
                        break;
                    }
                }
                this._cache.backgroundColor = result;
            }
        }
        return result;
    }

    get textEmpty() {
        let result = this._cacheState.textEmpty;
        if (result === undefined) {
            if (this.styleElement && !this.imageElement && !this.svgElement && !this.inputElement) {
                const value = this.textContent;
                result = value === '' || !this.preserveWhiteSpace && isEmptyString(value);
            }
            else {
                result = false;
            }
            this._cacheState.textEmpty = result;
        }
        return result;
    }

    set textIndent(value) {
        this._cache.textIndent = value;
    }
    get textIndent() {
        let result = this._cache.textIndent;
        if (result === undefined) {
            if (this.naturalChild) {
                const hasTextIndent = (node: T) => node.blockDimension || node.display === 'table-cell';
                if (hasTextIndent(this)) {
                    const value = this.css('textIndent');
                    if (value === '100%' || (result = this.parseUnit(value)) + this.bounds.width < 0) {
                        return this._cache.textIndent = NaN;
                    }
                }
                if (!result) {
                    const parent = this.actualParent;
                    if (parent && parent.firstStaticChild === this && hasTextIndent(parent)) {
                        result = parent.cssUnit('textIndent');
                    }
                }
            }
            return this._cache.textIndent = result || 0;
        }
        return result;
    }

    get textWidth() {
        const result = this._cache.textWidth;
        if (result === undefined) {
            if (this.styleText && !this.hasUnit('width')) {
                const textBounds = this.textBounds;
                if (textBounds && (textBounds.numberOfLines! > 1 || Math.ceil(textBounds.width) < this.box.width)) {
                    return this._cache.textWidth = textBounds.width;
                }
            }
            return this._cache.textWidth = this.bounds.width;
        }
        return result;
    }

    set horizontalRows(value) {
        if (value) {
            for (let i = 0, length = value.length; i < length; ++i) {
                const row = value[i];
                const first = row[0];
                if (row.length === 1) {
                    first.setCacheState('horizontalRowStart', true);
                    first.setCacheState('horizontalRowEnd', true);
                }
                else {
                    let direction = 0;
                    if (!first.alignParent('left')) {
                        if (first.alignParent('right')) {
                            direction = 1;
                        }
                        else {
                            let siblings = first.anchorChain('left');
                            if (siblings.length) {
                                if (row.includes(siblings[0])) {
                                    direction = 1;
                                }
                            }
                            else if ((siblings = first.anchorChain('right')).length && !row.includes(siblings[0])) {
                                direction = 1;
                            }
                        }
                    }
                    first.setCacheState(direction === 0 ? 'horizontalRowStart' : 'horizontalRowEnd', true);
                    row[row.length - 1].setCacheState(direction === 0 ? 'horizontalRowEnd' : 'horizontalRowStart', true);
                }
            }
            this._horizontalRows = value;
        }
    }
    get horizontalRows() {
        return this._horizontalRows;
    }

    get horizontalRowStart() {
        return this._cacheState.horizontalRowStart ?? false;
    }
    get horizontalRowEnd() {
        return this._cacheState.horizontalRowEnd ?? false;
    }

    get childIndex(): number {
        const result = this._childIndex;
        return result === Infinity && this.innerWrapped ? this._childIndex = this.innerMostWrapped.childIndex : result;
    }

    get innerMostWrapped(): T {
        if (this.naturalChild) {
            return this;
        }
        const result = this._cacheState.innerMostWrapped;
        if (result === undefined) {
            let current = this.innerWrapped;
            while (current) {
                const innerWrapped = current.innerWrapped;
                if (innerWrapped) {
                    current = innerWrapped;
                }
                else {
                    break;
                }
            }
            return this._cacheState.innerMostWrapped = current || this;
        }
        return result;
    }

    get outerMostWrapper(): T {
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

    get firstLetterStyle() {
        const result = this._cacheState.firstLetterStyle;
        return result === undefined ? this._cacheState.firstLetterStyle = this.getPseudoElement('::first-letter') as Null<CssStyleMap> : result;
    }

    get firstLineStyle() {
        let result = this._cacheState.firstLineStyle;
        if (result === undefined) {
            switch (this.display) {
                case 'block':
                case 'inline-block':
                case 'list-item':
                case 'table-caption':
                case 'table-cell':
                case 'flow-root':
                    result = this.getPseudoElement('::first-line') as Null<CssStyleMap>;
                    break;
            }
            return this._cacheState.firstLineStyle = result || null;
        }
        return result;
    }

    get textAlignLast() {
        if (!this.inlineStatic) {
            const value = this.cssAscend('textAlignLast', { startSelf: true });
            if (!value || value === 'auto') {
                return '';
            }
            const rtl = this.dir === 'rtl';
            let valid: boolean;
            switch (this.css('textAlign')) {
                case 'left':
                    valid = !(value === 'left' || value === (rtl ? 'end' : 'start'));
                    break;
                case 'right':
                    valid = !(value === 'right' || value === (rtl ? 'start' : 'end'));
                    break;
                case 'start':
                    valid = !(value === 'start' || value === (rtl ? 'right' : 'left'));
                    break;
                case 'end':
                    valid = !(value === 'end' || value === (rtl ? 'left' : 'right'));
                    break;
                case 'center':
                    valid = value !== 'center';
                    break;
                case 'justify':
                    valid = value !== 'justify';
                    break;
                default:
                    return '';
            }
            if (valid) {
                return value;
            }
        }
        return '';
    }

    get textJustified() {
        if (this.naturalChild && this.cssAscend('textAlign') === 'justify') {
            const { box, naturalChildren } = this.actualParent!;
            let inlineWidth = 0;
            for (let i = 0, length = naturalChildren.length; i < length; ++i) {
                const item = naturalChildren[i] as T;
                if (item.inlineVertical) {
                    inlineWidth += item.linear.width;
                }
                else {
                    return false;
                }
            }
            if (Math.floor(inlineWidth) > box.width) {
                return true;
            }
        }
        return false;
    }

    get outerRegion(): BoxRectDimension {
        let top = Infinity,
            right = -Infinity,
            bottom = -Infinity,
            left = Infinity,
            negativeRight = -Infinity,
            negativeBottom = -Infinity,
            actualTop: number,
            actualRight: number,
            actualBottom: number,
            actualLeft: number;
        this.each((item: T) => {
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

    set use(value) {
        const use = this.use;
        this.dataset['use' + this.localSettings.systemName] = use ? use + ', ' + value : value;
    }
    get use() {
        const dataset = this.dataset;
        const use = dataset['use' + this.localSettings.systemName] || dataset.use;
        return use ? use.trim() : '';
    }

    get extensions() {
        const result = this._cacheState.extensions;
        if (result === undefined) {
            const use = this.use;
            return this._cacheState.extensions = use ? use.split(/\s*,\s*/) : [];
        }
        return result;
    }
}