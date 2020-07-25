import Node from './node';

import { APP_SECTION, BOX_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE, NODE_TRAVERSE } from './lib/enumeration';

type T = NodeUI;

const { CSS_PROPERTIES, isLength, newBoxModel } = squared.lib.css;
const { createElement } = squared.lib.dom;
const { equal } = squared.lib.math;
const { actualTextRangeRect, getElementAsNode } = squared.lib.session;
const { capitalize, cloneObject, convertWord, hasBit, hasKeys, isArray, isEmptyString, iterateArray, searchObject, withinRange } = squared.lib.util;

const CSS_SPACING = new Map<number, string>();

const SPACING_MARGIN = [
    BOX_STANDARD.MARGIN_TOP,
    BOX_STANDARD.MARGIN_RIGHT,
    BOX_STANDARD.MARGIN_BOTTOM,
    BOX_STANDARD.MARGIN_LEFT
];
const BOX_MARGIN = CSS_PROPERTIES.margin.value as string[];

const SPACING_PADDING = [
    BOX_STANDARD.PADDING_TOP,
    BOX_STANDARD.PADDING_RIGHT,
    BOX_STANDARD.PADDING_BOTTOM,
    BOX_STANDARD.PADDING_LEFT
];
const BOX_PADDING = CSS_PROPERTIES.padding.value as string[];

for (let i = 0; i < 4; ++i) {
    CSS_SPACING.set(SPACING_MARGIN[i], BOX_MARGIN[i]);
    CSS_SPACING.set(SPACING_PADDING[i], BOX_PADDING[i]);
}

function cascadeActualPadding(children: T[], attr: string, value: number) {
    let valid = false;
    const length = children.length;
    let i = 0;
    while (i < length) {
        const item = children[i++];
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
                if (!cascadeActualPadding(item.naturalChildren as T[], attr, value)) {
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

function traverseElementSibling(element: UndefNull<Element>, direction: "previousSibling" | "nextSibling", sessionId: string, options?: SiblingOptions) {
    let floating: Undef<boolean>,
        pageFlow: Undef<boolean>,
        lineBreak: Undef<boolean>,
        excluded: Undef<boolean>;
    if (options) {
        ({ floating, pageFlow, lineBreak, excluded } = options);
    }
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
        element = element[direction] as Element;
    }
    return result;
}

function applyBoxReset(node: T, boxReset: BoxModel, attrs: string[], spacing: number[], region: number, other?: NodeUI) {
    for (let i = 0; i < 4; ++i) {
        const key = spacing[i];
        if (hasBit(region, key)) {
            const name = attrs[i];
            boxReset[name] = 1;
            if (other) {
                const previous = node.registerBox(key);
                if (previous) {
                    previous.resetBox(key, other);
                }
                else {
                    if (node.naturalChild) {
                        const value = node[name];
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

function applyBoxAdjustment(node: T, boxAdjustment: BoxModel, attrs: string[], spacing: number[], region: number, other: NodeUI) {
    for (let i = 0; i < 4; ++i) {
        const key = spacing[i];
        if (hasBit(region, key)) {
            const previous = node.registerBox(key);
            if (previous) {
                previous.transferBox(key, other);
            }
            else {
                const name = attrs[i];
                const value: number = boxAdjustment[name];
                if (value !== 0) {
                    other.modifyBox(key, value, false);
                    boxAdjustment[name] = 0;
                }
                node.registerBox(key, other);
            }
        }
    }
}

function setOverflow(node: T) {
    let result = 0;
    if (node.scrollElement) {
        const element = node.element as HTMLElement;
        const [overflowX, overflowY] = node.cssAsTuple('overflowX', 'overflowY');
        if (node.hasHeight && (node.hasPX('height') || node.hasPX('maxHeight')) && (overflowY === 'scroll' || overflowY === 'auto' && element.clientHeight !== element.scrollHeight)) {
            result |= NODE_ALIGNMENT.VERTICAL;
        }
        if ((node.hasPX('width') || node.hasPX('maxWidth')) && (overflowX === 'scroll' || overflowX === 'auto' && element.clientWidth !== element.scrollWidth)) {
            result |= NODE_ALIGNMENT.HORIZONTAL;
        }
    }
    return result;
}

function getExclusionValue(enumeration: {}, offset: number, value?: string) {
    if (value) {
        for (const name of value.split('|')) {
            const i: number = enumeration[name.trim().toUpperCase()] || 0;
            if (i > 0 && !hasBit(offset, i)) {
                offset |= i;
            }
        }
    }
    return offset;
}

const hasTextIndent = (node: T) => node.blockDimension || node.display === 'table-cell';
const canCascadeChildren = (node: T) =>  node.naturalElements.length > 0 && !node.layoutElement && !node.tableElement;
const checkBlockDimension = (node: T, previous: T) => node.blockDimension && Math.ceil(node.bounds.top) >= previous.bounds.bottom && (node.blockVertical || previous.blockVertical || node.percentWidth > 0 || previous.percentWidth > 0);
const getPercentWidth = (node: T) => node.inlineDimension && !node.hasPX('maxWidth') ? node.percentWidth : -Infinity;
const getLayoutWidth = (node: T) => node.actualWidth + Math.max(node.marginLeft, 0) + node.marginRight;

export default abstract class NodeUI extends Node implements squared.base.NodeUI {
    public static justified(node: T) {
        if (node.naturalChild && node.cssAscend('textAlign') === 'justify') {
            const { box, naturalChildren } = node.actualParent!;
            let inlineWidth = 0;
            const length = naturalChildren.length;
            let i = 0;
            while (i < length) {
                const item = naturalChildren[i++] as T;
                if (!item.inlineVertical) {
                    inlineWidth = NaN;
                    break;
                }
                else {
                    inlineWidth += item.linear.width;
                }
            }
            if (Math.floor(inlineWidth) > box.width) {
                return true;
            }
        }
        return false;
    }

    public static refitScreen(node: T, value: Dimension): Dimension {
        const { width, height } = node.localSettings.screenDimension;
        if (value.width > width) {
            return { width, height: Math.round(value.height * width / value.width) };
        }
        else if (value.height > height) {
            return { width: Math.round(value.width * height / value.height), height };
        }
        return value;
    }

    public static outerRegion(node: T): BoxRectDimension {
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

    public static baseline<T extends NodeUI>(list: T[], text = false, image = false): Null<T> {
        const length = list.length;
        const result: T[] = new Array(length);
        let i = 0, j = 0;
        while (i < length) {
            const item = list[i++];
            if (image && item.imageContainer) {
                continue;
            }
            if (item.baseline && !item.baselineAltered && (!text || item.textElement)) {
                if (item.naturalElements.length > 0) {
                    if (item.baselineElement) {
                        result[j++] = item;
                    }
                }
                else {
                    result[j++] = item;
                }
            }
        }
        if (j > 1) {
            result.length = j;
            result.sort((a, b) => {
                const vA = a.css('verticalAlign') === 'baseline';
                const vB = b.css('verticalAlign') === 'baseline';
                if (vA && !vB) {
                    return -1;
                }
                else if (vB && !vA) {
                    return 1;
                }
                const renderA = a.rendering;
                const renderB = b.rendering;
                if (!renderA && renderB && b.some(item => item.css('verticalAlign') !== 'baseline')) {
                    return -1;
                }
                else if (!renderB && renderA && a.some(item => item.css('verticalAlign') !== 'baseline')) {
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
                else if (!imageB && imageA) {
                    return 1;
                }
                const heightA = a.baselineHeight;
                const heightB = b.baselineHeight;
                if (!equal(heightA, heightB)) {
                    return heightA > heightB ? -1 : 1;
                }
                else if (!imageA && !imageB) {
                    const textA = a.textElement;
                    const textB = b.textElement;
                    if (textA && textB) {
                        if (!a.pseudoElement && b.pseudoElement) {
                            return -1;
                        }
                        else if (a.pseudoElement && !b.pseudoElement) {
                            return 1;
                        }
                        else if (!a.plainText && b.plainText) {
                            return -1;
                        }
                        else if (a.plainText && !b.plainText) {
                            return 1;
                        }
                    }
                    else if (a.containerType !== b.containerType && a.inputElement && b.inputElement) {
                        return a.containerType > b.containerType ? -1 : 1;
                    }
                    else if (textA && !textB && a.childIndex < b.childIndex) {
                        return -1;
                    }
                    else if (textB && !textA && b.childIndex < a.childIndex) {
                        return 1;
                    }
                }
                return 0;
            });
        }
        return result[0] || null;
    }

    public static linearData<T extends NodeUI>(list: T[], cleared?: Map<T, string>): LinearData<T> {
        let linearX = false,
            linearY = false,
            floated: Undef<Set<string>>;
        const length = list.length;
        if (length > 1) {
            const nodes: T[] = new Array(length);
            let i = 0, n = 0;
            while (i < length) {
                const item = list[i++];
                if (item.pageFlow) {
                    if (item.floating) {
                        (floated || (floated = new Set<string>())).add(item.float);
                    }
                    nodes[n++] = item;
                }
                else if (item.autoPosition) {
                    nodes[n++] = item;
                }
            }
            if (n) {
                nodes.length = n;
                const siblings = [nodes[0]];
                let x = 1,
                    y = 1;
                i = 1;
                while (i < n) {
                    const node = nodes[i++];
                    if (node.alignedVertically(siblings, floated ? cleared : undefined) > 0) {
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
                if (linearX && floated) {
                    let boxLeft = Infinity,
                        boxRight = -Infinity,
                        floatLeft = -Infinity,
                        floatRight = Infinity;
                    i = 0;
                    while (i < n) {
                        const node = nodes[i++];
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
                    let j = 0, k = 0, l = 0, m = 0;
                    for (i = 0; i < n; ++i) {
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
        }
        else if (length > 0) {
            linearY = list[0].blockStatic;
            linearX = !linearY;
        }
        return { linearX, linearY, floated };
    }

    public static partitionRows(list: T[], cleared?: Map<T, string>) {
        const result: T[][] = [];
        let row: T[] = [],
            siblings: T[] = [];
        const length = list.length;
        let i = 0;
        while (i < length) {
            const node = list[i++];
            let active = node;
            if (!node.naturalChild) {
                if (node.nodeGroup) {
                    if (row.length > 0) {
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
            else if (active.alignedVertically(siblings, cleared) > 0) {
                if (row.length > 0) {
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
        if (row.length > 0) {
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
    public documentChildren?: T[];
    public horizontalRowStart?: boolean;
    public horizontalRowEnd?: boolean;
    public renderParent?: T;
    public outerWrapper?: T;
    public innerWrapped?: T;
    public innerBefore?: T;
    public innerAfter?: T;
    public companion?: T;
    public labelFor?: T;
    public renderExtension?: squared.base.ExtensionUI<T>[];
    public renderTemplates?: NodeTemplate<T>[];
    public renderedAs?: NodeTemplate<T>;
    public horizontalRows?: T[][];

    protected _boxAdjustment = newBoxModel();
    protected _boxReset = newBoxModel();
    protected _preferInitial = true;
    protected _cached!: CachedValueUI<T>;
    protected _documentParent?: T;
    protected _controlName?: string;
    protected _boxRegister?: ObjectIndex<T>;
    protected abstract _namespaces: ObjectMap<StringMap>;

    private _excludeSection = 0;
    private _excludeProcedure = 0;
    private _excludeResource = 0;
    private _childIndex = Infinity;
    private _containerIndex = Infinity;
    private _renderAs: Null<T> = null;
    private _locked: ObjectMapNested<boolean> = {};
    private _siblingsLeading?: T[];
    private _siblingsTrailing?: T[];

    public abstract setControlType(viewName: string, containerType?: number): void;
    public abstract setLayout(width?: number, height?: number): void;
    public abstract setAlignment(): void;
    public abstract setBoxSpacing(): void;
    public abstract apply(options: {}): void;
    public abstract clone(id: number): T;
    public abstract extractAttributes(depth?: number): string;
    public abstract alignParent(position: string): boolean;
    public abstract alignSibling(position: string, documentId?: string): string;
    public abstract actualRect(direction: string, dimension?: BoxType): number;
    public abstract translateX(value: number, options?: TranslateOptions): boolean;
    public abstract translateY(value: number, options?: TranslateOptions): boolean;
    public abstract localizeString(value: string): string;

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
        return this.is(containerType) && alignmentType.some(value => this.hasAlign(value));
    }

    public attr(name: string, attr: string, value?: string, overwrite = true): string {
        const obj = this.namespace(name);
        if (value) {
            if (overwrite && this.lockedAttr(name, attr)) {
                overwrite = false;
            }
            if (!overwrite && obj[attr]) {
                return obj[attr] as string;
            }
            else {
                obj[attr] = value;
                return value;
            }
        }
        return obj[attr] || '';
    }

    public delete(name: string, ...attrs: string[]) {
        const obj = this._namespaces[name];
        if (obj) {
            let i = 0;
            while (i < attrs.length) {
                const attr = attrs[i++];
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

    public namespace(name: string) {
        const result = this._namespaces[name];
        return result === undefined ? this._namespaces[name] = {} : result;
    }

    public namespaces(): [string, StringMap][] {
        return Object.entries(this._namespaces);
    }

    public unsafe<T = unknown>(name: string, value?: any): Undef<T> {
        if (value !== undefined) {
            this['_' + name] = value;
        }
        return this['_' + name] as Undef<T>;
    }

    public unset(name: string) {
        delete this['_' + name];
    }

    public lockAttr(name: string, attr: string) {
        (this._locked[name] ?? (this._locked[name] = {}))[attr] = true;
    }

    public unlockAttr(name: string, attr: string) {
        const locked: Undef<ObjectKeyed<boolean>> = this._locked[name];
        if (locked) {
            locked[attr] = false;
        }
    }

    public lockedAttr(name: string, attr: string) {
        return this._locked[name]?.[attr] === true;
    }

    public render(parent?: T) {
        this.renderParent = parent;
        this.rendered = true;
    }

    public parseUnit(value: string, options: ParseUnitOptions = {}) {
        if (!options.screenDimension) {
            options.screenDimension = this.localSettings.screenDimension;
        }
        return super.parseUnit(value, options);
    }

    public parseWidth(value: string, parent = true) {
        return super.parseUnit(value, { parent, screenDimension: this.localSettings.screenDimension });
    }

    public parseHeight(value: string, parent = true) {
        return super.parseUnit(value, { dimension: 'height', parent, screenDimension: this.localSettings.screenDimension });
    }

    public renderEach(predicate: IteratorPredicate<T, void>) {
        const children = this.renderChildren;
        const length = children.length;
        let i = 0;
        while (i < length) {
            predicate(children[i], i++, children);
        }
        return this;
    }

    public hide(options?: HideOptions<T>) {
        if (options?.remove) {
            this.removeTry(options);
        }
        this.rendered = true;
        this.visible = false;
    }

    public inherit(node: T, ...modules: string[]) {
        let result: Undef<StandardMap>;
        let i = 0;
        while (i < modules.length) {
            switch (modules[i++]) {
                case 'base': {
                    this._documentParent = node.documentParent;
                    this._bounds =  node.bounds;
                    this._linear = node.linear;
                    this._box = node.box;
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
                    result = node.unsafe<InitialData<T>>('initial');
                    if (result) {
                        this.inheritApply('initial', result);
                    }
                    break;
                case 'alignment': {
                    this.cssCopy(node, 'position', 'display', 'verticalAlign', 'float', 'clear', 'zIndex');
                    if (!this.positionStatic) {
                        const setPosition = (attr: string) => {
                            if (node.hasPX(attr)) {
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
                }
                case 'styleMap':
                    this.cssCopyIfEmpty(node, ...Object.keys(node.unsafe<StringMap>('styleMap')!));
                    break;
                case 'textStyle':
                    result = node.textStyle;
                    this.inheritApply('textStyle', result);
                    break;
                case 'boxStyle': {
                    if (this.naturalChild) {
                        const options = { values: ['none', '0px', 'transparent', 'rgba(0, 0, 0, 0)'] };
                        let properties: string[] = [];
                        if (this.css('backgroundImage') === 'none') {
                            properties = properties.concat(CSS_PROPERTIES.background.value as string[]);
                            --properties.length;
                        }
                        if (this.cssAny('backgroundColor', options)) {
                            properties.push('backgroundColor');
                        }
                        if (this.cssAny('borderTopStyle', options)) {
                            properties = properties.concat(CSS_PROPERTIES.borderLeft.value as string[]);
                        }
                        if (this.cssAny('borderRightStyle', options)) {
                            properties = properties.concat(CSS_PROPERTIES.borderRight.value as string[]);
                        }
                        if (this.cssAny('borderBottomStyle', options)) {
                            properties = properties.concat(CSS_PROPERTIES.borderBottom.value as string[]);
                        }
                        if (this.cssAny('borderLeftStyle', options)) {
                            properties = properties.concat(CSS_PROPERTIES.borderLeft.value as string[]);
                        }
                        if (this.cssAny('borderRadius', options)) {
                            properties = properties.concat(CSS_PROPERTIES.borderRadius.value as string[]);
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
                            'borderTopLeftRadius',
                            'borderTopRightRadius',
                            'borderBottomRightRadius',
                            'borderBottomLeftRadius'
                        );
                        Object.assign(result, {
                            backgroundColor: node.backgroundColor,
                            backgroundImage: node.backgroundImage,
                            border: 'inherit',
                            borderRadius: 'inherit'
                        });
                        this.inheritApply('boxStyle', result);
                    }
                    this.setCacheValue('visibleStyle', undefined);
                    node.setCacheValue('backgroundColor', '');
                    node.setCacheValue('backgroundImage', '');
                    node.cssApply({
                        backgroundColor: 'transparent',
                        backgroundImage: 'none',
                        border: 'initial',
                        borderRadius: 'initial'
                    });
                    const visibleStyle = node.visibleStyle;
                    visibleStyle.background = false;
                    visibleStyle.backgroundImage = false;
                    visibleStyle.backgroundRepeatX = false;
                    visibleStyle.backgroundRepeatY = false;
                    visibleStyle.backgroundColor = false;
                    visibleStyle.borderWidth = false;
                    break;
                }
            }
        }
        return result;
    }

    public inheritApply(module: string, data: StandardMap) {
        switch (module) {
            case 'initial':
                cloneObject(data, this._initial);
                break;
            case 'textStyle':
                this.cssApply(data);
                this.setCacheValue('fontSize', parseFloat(data.fontSize));
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
        return !hasBit(this._excludeResource, value);
    }

    public hasProcedure(value: number) {
        return !hasBit(this._excludeProcedure, value);
    }

    public hasSection(value: number) {
        return !hasBit(this._excludeSection, value);
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
        if (this.naturalElement) {
            const dataset = (this._element as HTMLElement).dataset;
            if (hasKeys(dataset)) {
                const systemName = capitalize(this.localSettings.systemName);
                this._excludeResource = getExclusionValue(NODE_RESOURCE, this._excludeResource, dataset['excludeResource' + systemName] || dataset.excludeResource);
                this._excludeProcedure = getExclusionValue(NODE_PROCEDURE, this._excludeProcedure, dataset['excludeProcedure' + systemName] || dataset.excludeProcedure);
                this._excludeSection = getExclusionValue(APP_SECTION, this._excludeSection, dataset['excludeSection' + systemName] || dataset.excludeSection);
                if (this.length) {
                    const resource = getExclusionValue(NODE_RESOURCE, 0, dataset['excludeResourceChild' + systemName] || dataset.excludeResourceChild);
                    const procedure = getExclusionValue(NODE_PROCEDURE, 0, dataset['excludeProcedureChild' + systemName] || dataset.excludeProcedureChild);
                    const section = getExclusionValue(APP_SECTION, 0, dataset['excludeSectionChild' + systemName] || dataset.excludeSectionChild);
                    if (resource > 0 || procedure > 0 || section > 0) {
                        const data = { resource, procedure, section };
                        this.each((node: T) => node.exclude(data));
                    }
                }
            }
        }
    }

    public replaceTry(options: ReplaceTryOptions<T>) {
        const { child, replaceWith } = options;
        const children = this.children as T[];
        const length = children.length;
        for (let i = 0; i < length; ++i) {
            const item = children[i];
            if (item === child || item === child.outerMostWrapper) {
                replaceWith.parent?.remove(replaceWith);
                let childIndex: Undef<number>;
                if (replaceWith.naturalChild && this.naturalElement) {
                    childIndex = child.childIndex;
                    replaceWith.actualParent!.naturalChildren.splice(replaceWith.childIndex, 1);
                    this.naturalChildren.splice(childIndex, 1, replaceWith);
                }
                replaceWith.init(this, child.depth, childIndex);
                children[i] = replaceWith;
                replaceWith.containerIndex = child.containerIndex;
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
                const index = renderChildren.findIndex(node => node === this);
                if (index !== -1) {
                    const template = renderTemplates[index];
                    if (template.node === this) {
                        const replaceWith = options?.replaceWith;
                        if (replaceWith) {
                            const replaceParent = replaceWith.renderParent;
                            if (replaceParent) {
                                const replaceTemplates = replaceParent.renderTemplates;
                                if (replaceTemplates) {
                                    const replaceIndex = replaceTemplates.findIndex(item => item.node === replaceWith);
                                    if (replaceIndex !== -1) {
                                        options!.beforeReplace?.(this, replaceWith);
                                        renderChildren[index] = replaceWith;
                                        renderTemplates[index] = replaceTemplates[replaceIndex];
                                        replaceTemplates.splice(replaceIndex, 1);
                                        replaceParent.renderChildren.splice(replaceIndex, 1);
                                        replaceWith.renderParent = renderParent;
                                        if (this.documentRoot) {
                                            replaceWith.documentRoot = true;
                                            this.documentRoot = false;
                                        }
                                        replaceWith.depth = this.depth;
                                        this.renderParent = undefined;
                                        return template;
                                    }
                                }
                            }
                        }
                        else {
                            options?.beforeReplace?.(this, undefined);
                            renderChildren.splice(index, 1);
                            this.renderParent = undefined;
                            return renderTemplates.splice(index, 1)[0];
                        }
                    }
                }
            }
        }
        return undefined;
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
        else if (!this.pageFlow) {
            if (this.autoPosition) {
                if (!siblings) {
                    siblings = this.siblingsLeading;
                }
                const length = siblings.length;
                let i = length - 1;
                while (i >= 0) {
                    const previous = siblings[i--];
                    if (previous.pageFlow) {
                        return previous.blockStatic || cleared?.has(previous) ? NODE_TRAVERSE.VERTICAL : NODE_TRAVERSE.HORIZONTAL;
                    }
                }
                return NODE_TRAVERSE.HORIZONTAL;
            }
            return NODE_TRAVERSE.VERTICAL;
        }
        else {
            const floating = this.floating;
            if (isArray(siblings)) {
                const previous = siblings[siblings.length - 1];
                if (cleared) {
                    if (cleared.size > 0 && (cleared.has(this) || this.siblingsLeading.some(item => item.excluded && cleared.has(item)))) {
                        return NODE_TRAVERSE.FLOAT_CLEAR;
                    }
                    else if (floating && previous.floating) {
                        if (horizontal && this.float === previous.float || Math.floor(this.bounds.top) === Math.floor(previous.bounds.top)) {
                            return NODE_TRAVERSE.HORIZONTAL;
                        }
                        else if (Math.ceil(this.bounds.top) >= previous.bounds.bottom) {
                            if (siblings.every(item => item.inlineDimension)) {
                                const actualParent = this.actualParent;
                                if (actualParent && actualParent.ascend({ condition: item => !item.inline && item.hasWidth, error: (item: T) => item.layoutElement, startSelf: true })) {
                                    const length = siblings.length;
                                    if (actualParent.naturalChildren.filter((item: T) => item.visible && item.pageFlow).length === length + 1) {
                                        let width = actualParent.box.width - getLayoutWidth(this);
                                        let i = 0;
                                        while (i < length) {
                                            width -= getLayoutWidth(siblings[i++]);
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
                    else if (this.blockStatic && siblings.reduce((a, b) => a + (b.floating ? b.linear.width : -Infinity), 0) / this.actualParent!.box.width >= 0.8) {
                        return NODE_TRAVERSE.FLOAT_INTERSECT;
                    }
                    else if (siblings.every(item => item.inlineDimension && Math.ceil(this.bounds.top) >= item.bounds.bottom)) {
                        return NODE_TRAVERSE.FLOAT_BLOCK;
                    }
                    else if (horizontal !== undefined) {
                        if (floating && !horizontal && previous.blockStatic) {
                            return NODE_TRAVERSE.HORIZONTAL;
                        }
                        else if (!this.display.startsWith('inline-')) {
                            let { top, bottom } = this.bounds;
                            if (this.textElement && cleared.size > 0 && siblings.some(item => cleared.has(item)) && siblings.some(item => Math.floor(top) < item.bounds.top && Math.ceil(bottom) > item.bounds.bottom)) {
                                return NODE_TRAVERSE.FLOAT_INTERSECT;
                            }
                            else if (siblings[0].floating) {
                                const length = siblings.length;
                                if (length > 1) {
                                    const float = siblings[0].float;
                                    let maxBottom = -Infinity,
                                        contentWidth = 0;
                                    let i = 0;
                                    while (i < length) {
                                        const item = siblings[i++];
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
            const blockStatic = this.blockStatic || this.display === 'table';
            const length = this.siblingsLeading.length;
            if (blockStatic && (length === 0 || this.containerIndex === 0)) {
                return NODE_TRAVERSE.VERTICAL;
            }
            for (let i = length - 1; i >= 0; --i) {
                const previous = this.siblingsLeading[i];
                if (previous.excluded && cleared?.has(previous)) {
                    return NODE_TRAVERSE.FLOAT_CLEAR;
                }
                else if (previous.blockStatic || previous.autoMargin.leftRight || (horizontal === false || floating && previous.childIndex === 0) && previous.plainText && previous.multiline) {
                    return NODE_TRAVERSE.VERTICAL;
                }
                else if (blockStatic && (!previous.floating || cleared?.has(previous) || i === length - 1 && !previous.pageFlow)) {
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
                if (checkBlockDimension(this, previous)) {
                    return NODE_TRAVERSE.INLINE_WRAP;
                }
            }
            return NODE_TRAVERSE.HORIZONTAL;
        }
    }

    public previousSiblings(options?: SiblingOptions): T[] {
        const node = this.innerMostWrapped;
        return options ? traverseElementSibling(node.element?.previousSibling as Element, 'previousSibling', this.sessionId, options) : node.siblingsLeading;
    }

    public nextSiblings(options?: SiblingOptions): T[] {
        const node = this.innerMostWrapped;
        return options ? traverseElementSibling(node.element?.nextSibling as Element, 'nextSibling', this.sessionId, options) : node.siblingsTrailing;
    }

    public modifyBox(region: number, value: number, negative = true) {
        if (value !== 0) {
            const attr = CSS_SPACING.get(region);
            if (attr) {
                const node = this._boxRegister?.[region];
                if (node) {
                    node.modifyBox(region, value, negative);
                }
                else {
                    const boxAdjustment = this._boxAdjustment;
                    if (!negative && (this._boxReset[attr] === 0 ? this[attr] : 0) + boxAdjustment[attr] + value <= 0) {
                        boxAdjustment[attr] = 0;
                        if (this[attr] >= 0 && value < 0) {
                            this._boxReset[attr] = 1;
                        }
                    }
                    else {
                        boxAdjustment[attr] += value;
                    }
                }
            }
        }
    }

    public getBox(region: number): [number, number] {
        const attr = CSS_SPACING.get(region);
        return attr ? [this._boxReset[attr] as number, this._boxAdjustment[attr] as number] : [NaN, 0];
    }

    public setBox(region: number, options: BoxOptions) {
        const attr = CSS_SPACING.get(region);
        if (attr) {
            const node = this._boxRegister?.[region];
            if (node) {
                node.setBox(region, options);
            }
            else {
                const { reset, adjustment } = options;
                const boxReset = this._boxReset;
                const boxAdjustment = this._boxAdjustment;
                if (reset !== undefined) {
                    boxReset[attr] = reset;
                }
                if (adjustment !== undefined) {
                    let value = adjustment;
                    if (options.max) {
                        boxAdjustment[attr] = Math.max(value, boxAdjustment[attr]);
                    }
                    else if (options.min) {
                        boxAdjustment[attr] = Math.min(value, boxAdjustment[attr] || Infinity);
                    }
                    else {
                        if (options.accumulate) {
                            value += boxAdjustment[attr];
                        }
                        if (options.negative === false && (boxReset[attr] === 0 ? this[attr] : 0) + value <= 0) {
                            value = 0;
                            if (this[attr] >= 0 && value < 0) {
                                boxReset[attr] = 1;
                            }
                        }
                        boxAdjustment[attr] = value;
                    }
                }
                else if (reset === 1 && !this.naturalChild) {
                    boxAdjustment[attr] = 0;
                }
            }
        }
    }

    public resetBox(region: number, node?: T) {
        if (hasBit(BOX_STANDARD.MARGIN, region)) {
            applyBoxReset(this, this._boxReset, BOX_MARGIN, SPACING_MARGIN, region, node);
        }
        if (hasBit(BOX_STANDARD.PADDING, region)) {
            applyBoxReset(this, this._boxReset, BOX_PADDING, SPACING_PADDING, region, node);
        }
    }

    public transferBox(region: number, node: T) {
        if (hasBit(BOX_STANDARD.MARGIN, region)) {
            applyBoxAdjustment(this, this._boxAdjustment, BOX_MARGIN, SPACING_MARGIN, region, node);
        }
        if (hasBit(BOX_STANDARD.PADDING, region)) {
            applyBoxAdjustment(this, this._boxAdjustment, BOX_PADDING, SPACING_PADDING, region, node);
        }
    }

    public registerBox(region: number, node?: T): Undef<T> {
        if (this._boxRegister === undefined) {
            this._boxRegister = {};
        }
        if (node) {
            this._boxRegister[region] = node;
        }
        else {
            node = this._boxRegister[region];
        }
        while (node !== undefined) {
            const next: Undef<T> = node.unsafe<ObjectIndex<T>>('boxRegister')?.[region];
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
                const node = this.innerMostWrapped;
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
                    return canCascadeChildren(node) && cascadeActualPadding(node.naturalChildren as T[], attr, value) ? 0 : value;
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
            value = this.box.width;
        }
        if (this.pageFlow) {
            let offsetLeft = 0,
                offsetRight = 0,
                current = this.actualParent;
            while (current !== null) {
                if (current.hasPX('width', { percent: false }) || !current.pageFlow) {
                    return value;
                }
                else {
                    offsetLeft += Math.max(current.marginLeft, 0) + current.borderLeftWidth + current.paddingLeft;
                    offsetRight += current.paddingRight + current.borderRightWidth + current.marginRight;
                }
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
        if (!tagName) {
            tagName = this.tagName;
        }
        const style: StringMap =
            tagName === '#text'
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
        if (this.naturalElement) {
            style.fontSize = this.cssInitial('fontSize') || this.fontSize + 'px';
        }
        else {
            style.fontSize = this.fontSize + 'px';
        }
        if (width) {
            style.width = width;
        }
        if (textWrap !== true) {
            style.whiteSpace = 'nowrap';
        }
        style.display = 'inline-block';
        const parent = this.actualParent?.element || document.body;
        const element = createElement(tagName !== '#text' ? tagName : 'span', { attrs: { textContent: textContent || 'AgjpqyZ' }, style });
        parent.appendChild(element);
        const result = actualTextRangeRect(element);
        parent.removeChild(element);
        return result ? result.height : NaN;
    }

    public cloneBase(node: T) {
        node.depth = this.depth;
        node.childIndex = this.childIndex;
        node.inlineText = this.inlineText;
        node.actualParent = this.actualParent;
        node.documentRoot = this.documentRoot;
        node.localSettings = this.localSettings;
        node.alignmentType = this.alignmentType;
        node.containerName = this.containerName;
        node.visible = this.visible;
        node.excluded = this.excluded;
        node.rendered = this.rendered;
        node.containerIndex = this.containerIndex;
        node.lineBreakLeading = this.lineBreakLeading;
        node.lineBreakTrailing = this.lineBreakTrailing;
        node.documentParent = this.documentParent;
        node.renderParent = this.renderParent;
        node.renderedAs = this.renderedAs;
        node.rootElement = this.rootElement;
        if (this.length > 0) {
            node.retainAs(this.duplicate());
        }
        node.inherit(this, 'initial', 'base', 'alignment', 'styleMap', 'textStyle');
        Object.assign(node.unsafe<CachedValueUI<T>>('cached'), this._cached);
    }

    public unsetCache(...attrs: string[]) {
        const length = attrs.length;
        if (length > 0) {
            const cached = this._cached;
            let i = 0;
            while (i < length) {
                switch (attrs[i++]) {
                    case 'top':
                    case 'right':
                    case 'bottom':
                    case 'left':
                        cached.autoPosition = undefined;
                        cached.positiveAxis = undefined;
                        break;
                    case 'float':
                        cached.floating = undefined;
                        break;
                    case 'fontSize':
                    case 'lineHeight':
                        cached.baselineHeight = undefined;
                        break;
                    case 'whiteSpace':
                        cached.preserveWhiteSpace = undefined;
                        cached.textEmpty = undefined;
                        break;
                    case 'width':
                    case 'height':
                    case 'maxWidth':
                    case 'maxHeight':
                    case 'overflowX':
                    case 'overflowY':
                        cached.overflow = undefined;
                        break;
                }
            }
        }
        super.unsetCache(...attrs);
    }

    public css(attr: string, value?: string, cache = false) {
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
        return this._styleMap[attr] as string || this.styleElement && this.style[attr] as string || '';
    }

    public cssApply(values: StringMap, cache?: boolean) {
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
        return this._element || this.innerWrapped && this.innerMostWrapped.unsafe<Null<Element>>('element') || null;
    }

    set naturalChild(value) {
        this._cached.naturalChild = value;
    }
    get naturalChild() {
        const result = this._cached.naturalChild;
        if (result === undefined) {
            const element = this._element;
            return this._cached.naturalChild =
                element
                    ? element.parentElement
                        ? true
                        : element === document.documentElement
                    : false;
        }
        return result;
    }

    get pseudoElement() {
        return this._element?.className === '__squared.pseudo';
    }

    get scrollElement() {
        let result = this._cached.scrollElement;
        if (result === undefined) {
            if (this.htmlElement) {
                switch (this.tagName) {
                    case 'INPUT':
                        switch (this.toElementString('type')) {
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
                    case 'WBR':
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
            this._cached.scrollElement = result;
        }
        return result;
    }

    get layoutElement() {
        const result = this._cached.layoutElement;
        return result === undefined ? this._cached.layoutElement = this.flexElement || this.gridElement : result;
    }

    get imageElement() {
        const result = this._cached.imageElement;
        return result === undefined ? this._cached.imageElement = super.imageElement : result;
    }

    get flexElement() {
        const result = this._cached.flexElement;
        return result === undefined ? this._cached.flexElement = super.flexElement : result;
    }

    get gridElement() {
        const result = this._cached.gridElement;
        return result === undefined ? this._cached.gridElement = super.gridElement : result;
    }

    get tableElement() {
        const result = this._cached.tableElement;
        return result === undefined ? this._cached.tableElement = super.tableElement : result;
    }

    get inputElement() {
        const result = this._cached.inputElement;
        return result === undefined ? this._cached.inputElement = super.inputElement : result;
    }

    get floating() {
        const result = this._cached.floating;
        return result === undefined ? this._cached.floating = super.floating : result;
    }

    get float() {
        const result = this._cached.float;
        return result === undefined ? this._cached.float = super.float : result;
    }

    set textContent(value) {
        this._cached.textContent = value;
    }
    get textContent() {
        const result = this._cached.textContent;
        return result === undefined ? this._cached.textContent = super.textContent : result;
    }

    get contentBox() {
        const result = this._cached.contentBox;
        return result === undefined ? this._cached.contentBox = super.contentBox : result;
    }

    get positionRelative() {
        const result = this._cached.positionRelative;
        return result === undefined ? this._cached.positionRelative = super.positionRelative : result;
    }

    set documentParent(value) {
        this._documentParent = value;
    }
    get documentParent() {
        return (this._documentParent || this.absoluteParent || this.actualParent || this.parent || this) as NodeUI;
    }

    set containerName(value) {
        this._cached.containerName = value.toUpperCase();
    }
    get containerName() {
        let result = this._cached.containerName;
        if (result === undefined) {
            const element = this.element as HTMLInputElement;
            if (element) {
                if (element.nodeName === '#text') {
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

    get nodeGroup() {
        return false;
    }

    set renderAs(value) {
        if (value && !value.renderParent && !this.rendered) {
            this._renderAs = value;
        }
    }
    get renderAs() {
        return this._renderAs;
    }

    get inlineVertical() {
        let result = this._cached.inlineVertical;
        if (result === undefined) {
            if ((this.naturalElement || this.pseudoElement) && !this.floating) {
                const value = this.display;
                result = value.startsWith('inline') || value === 'table-cell';
            }
            else {
                result = false;
            }
            this._cached.inlineVertical = result;
        }
        return result;
    }

    get inlineDimension() {
        const result = this._cached.inlineDimension;
        return result === undefined ? this._cached.inlineDimension = (this.naturalElement || this.pseudoElement) && (this.display.startsWith('inline-') || this.floating) : result;
    }

    get inlineFlow() {
        const result = this._cached.inlineFlow;
        return result === undefined ? this._cached.inlineFlow = (this.inline || this.inlineDimension || this.inlineVertical || this.floating || this.imageElement || this.svgElement && this.hasPX('width', { percent: false }) || this.tableElement && this.previousSibling?.floating === true) && this.pageFlow : result;
    }

    get blockStatic() {
        return super.blockStatic || this.hasAlign(NODE_ALIGNMENT.BLOCK) && this.pageFlow && !this.floating;
    }

    get blockDimension() {
        const result = this._cached.blockDimension;
        return result === undefined ? this.block || this.inlineDimension || this.imageElement || this.svgElement || this.display === 'table' : result;
    }

    get blockVertical() {
        const result = this._cached.blockVertical;
        return result === undefined ? this._cached.blockVertical = this.blockDimension && this.hasHeight : result;
    }

    get rightAligned() {
        if (this.hasAlign(NODE_ALIGNMENT.RIGHT)) {
            return true;
        }
        return super.rightAligned;
    }

    get verticalAligned() {
        const result = this._cached.verticalAligned;
        return result === undefined ? this._cached.verticalAligned = isLength(this.cssInitial('verticalAlign'), true) && this.verticalAlign !== 0 : result;
    }

    set autoPosition(value) {
        this._cached.autoPosition = value;
    }
    get autoPosition() {
        const result = this._cached.autoPosition;
        if (result === undefined) {
            if (this.pageFlow) {
                return this._cached.autoPosition = false;
            }
            else {
                const { top, right, bottom, left } = this._styleMap;
                return this._cached.autoPosition = (!top || top === 'auto') && (!left || left === 'auto') && (!right || right === 'auto') && (!bottom || bottom === 'auto');
            }
        }
        return result;
    }

    get positiveAxis() {
        const result = this._cached.positiveAxis;
        return result === undefined ? this._cached.positiveAxis = (!this.positionRelative || this.positionRelative && this.top >= 0 && this.left >= 0 && (this.right <= 0 || this.hasPX('left')) && (this.bottom <= 0 || this.hasPX('top'))) && this.marginTop >= 0 && this.marginLeft >= 0 && this.marginRight >= 0 : result;
    }

    get leftTopAxis() {
        const result = this._cached.leftTopAxis;
        if (result === undefined) {
            switch (this.cssInitial('position')) {
                case 'absolute':
                    return this._cached.leftTopAxis = this.absoluteParent === this.documentParent;
                case 'fixed':
                    return this._cached.leftTopAxis = true;
                default:
                    return this._cached.leftTopAxis = false;
            }
        }
        return result;
    }

    get baselineElement(): boolean {
        let result = this._cached.baselineElement;
        if (result === undefined) {
            if (this.css('verticalAlign') === 'baseline' && !this.floating) {
                const children = this.naturalChildren;
                if (children.length > 0) {
                    result = children.every((node: T) => {
                        do {
                            if (node.css('verticalAlign') === 'baseline' && !node.floating) {
                                switch (node.length) {
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
            return this._cached.baselineElement = result;
        }
        return result;
    }

    set multiline(value) {
        this._cached.multiline = value;
        this._cached.baselineElement = undefined;
    }
    get multiline() {
        return super.multiline;
    }

    set controlName(value) {
        if (!this.rendered || !this._controlName) {
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
        const result = this._cached.actualParent;
        return result === undefined ? this._cached.actualParent = super.actualParent as Null<T> || this.innerMostWrapped.actualParent : result;
    }

    set siblingsLeading(value) {
        this._siblingsLeading = value;
    }
    get siblingsLeading() {
        return this._siblingsLeading ?? (this._siblingsLeading = this.previousSiblings({ lineBreak: true, excluded: true }));
    }

    set siblingsTrailing(value) {
        this._siblingsTrailing = value;
    }
    get siblingsTrailing() {
        return this._siblingsTrailing ?? (this._siblingsTrailing = this.nextSiblings({ lineBreak: true, excluded: true }));
    }

    get flowElement() {
        return this.pageFlow && (!this.excluded || this.lineBreak);
    }

    get previousSibling() {
        const parent = this.actualParent;
        if (parent) {
            const children = parent.naturalChildren as NodeUI[];
            const index = children.indexOf(this);
            if (index !== -1) {
                let i = index - 1;
                while (i >= 0) {
                    const node = children[i--];
                    if (node.flowElement) {
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
            const children = parent.naturalChildren as NodeUI[];
            const index = children.indexOf(this);
            if (index !== -1) {
                const length = children.length;
                let i = index + 1;
                while (i < length) {
                    const node = children[i++];
                    if (node.flowElement) {
                        return node;
                    }
                }
            }
        }
        return null;
    }

    get firstChild(): Null<NodeUI> {
        return (this.naturalChildren as NodeUI[]).find(node => !node.excluded || node.lineBreak) || null;
    }

    get lastChild(): Null<NodeUI> {
        const children = this.naturalChildren;
        let i = children.length - 1;
        while (i >= 0) {
            const node = children[i--] as NodeUI;
            if (!node.excluded || node.lineBreak) {
                return node;
            }
        }
        return null;
    }

    get firstStaticChild() {
        return (this.naturalChildren as NodeUI[]).find(node => node.flowElement) || null;
    }

    get lastStaticChild() {
        const children = this.naturalChildren;
        let i = children.length - 1;
        while (i >= 0) {
            const node = children[i--] as NodeUI;
            if (node.flowElement) {
                return node;
            }
        }
        return null;
    }

    get onlyChild() {
        return (this.renderParent?.renderChildren.length ?? this.parent?.length) === 1 && !this.documentRoot;
    }

    get rendering() {
        return this.renderChildren.length > 0;
    }

    get overflowX() {
        let result = this._cached.overflow;
        if (result === undefined) {
            result = setOverflow(this);
            this._cached.overflow = result;
        }
        return hasBit(result, NODE_ALIGNMENT.HORIZONTAL);
    }
    get overflowY() {
        let result = this._cached.overflow;
        if (result === undefined) {
            result = setOverflow(this);
            this._cached.overflow = result;
        }
        return hasBit(result, NODE_ALIGNMENT.VERTICAL);
    }

    get textEmpty() {
        let result = this._cached.textEmpty;
        if (result === undefined) {
            if (this.styleElement && !this.imageElement && !this.svgElement && !this.inputElement) {
                const value = this.textContent;
                result = value === '' || !this.preserveWhiteSpace && isEmptyString(value);
            }
            else {
                result = false;
            }
            this._cached.textEmpty = result;
        }
        return result;
    }

    set textIndent(value) {
        this._cached.textIndent = value;
    }
    get textIndent() {
        let result = this._cached.textIndent;
        if (result === undefined) {
            if (this.naturalChild) {
                if (hasTextIndent(this)) {
                    const value = this.css('textIndent');
                    result = this.parseUnit(value);
                    if (value === '100%' || result + this.bounds.width < 0) {
                        return this._cached.textIndent = NaN;
                    }
                }
                if (!result) {
                    const parent = this.actualParent;
                    if (parent?.firstStaticChild === this && hasTextIndent(parent)) {
                        result = parent.parseUnit(parent.css('textIndent'));
                    }
                }
            }
            return this._cached.textIndent = result || 0;
        }
        return result;
    }

    get textWidth() {
        const result = this._cached.textWidth;
        if (result === undefined) {
            if (this.styleText && !this.hasPX('width')) {
                const textBounds = this.textBounds;
                if (textBounds && (textBounds.numberOfLines as number > 1 || Math.ceil(textBounds.width) < this.box.width)) {
                    return this._cached.textWidth = textBounds.width;
                }
            }
            return this._cached.textWidth = this.bounds.width;
        }
        return result;
    }

    set childIndex(value) {
        this._childIndex = value;
    }
    get childIndex() {
        let result = this._childIndex;
        if (result === Infinity) {
            let wrapped = this.innerWrapped;
            if (wrapped) {
                do {
                    const index = wrapped.childIndex;
                    if (index !== Infinity) {
                        result = index;
                        this._childIndex = result;
                        break;
                    }
                    wrapped = wrapped.innerWrapped;
                }
                while (wrapped !== undefined);
            }
            else {
                const element = this._element;
                if (element) {
                    const parentElement = element.parentElement;
                    if (parentElement) {
                        iterateArray(parentElement.childNodes, (item: Element, index: number) => {
                            if (item === element) {
                                result = index;
                                this._childIndex = index;
                                return true;
                            }
                            return;
                        });
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
        if (result === Infinity) {
            let wrapped = this.innerWrapped;
            while (wrapped !== undefined) {
                const index = wrapped.containerIndex;
                if (index !== Infinity) {
                    result = index;
                    this._containerIndex = result;
                    break;
                }
                wrapped = wrapped.innerWrapped;
            }
        }
        return result;
    }

    get innerMostWrapped() {
        if (this.naturalChild) {
            return this;
        }
        let result = this.innerWrapped;
        while (result !== undefined) {
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
        while (result !== undefined) {
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
        const result = this._cached.preserveWhiteSpace;
        if (result === undefined) {
            const value = this.css('whiteSpace');
            return this._cached.preserveWhiteSpace = value === 'pre' || value === 'pre-wrap';
        }
        return result;
    }

    get firstLetterStyle() {
        const result = this._cached.firstLetterStyle;
        return result === undefined ? this._cached.firstLetterStyle = this.cssPseudoElement('first-letter') : result;
    }

    get firstLineStyle() {
        const result = this._cached.firstLineStyle;
        return result === undefined ? this._cached.firstLineStyle = this.cssPseudoElement('first-line') : result;
    }

    get textAlignLast() {
        if (!this.inlineStatic) {
            const value = this.cssAscend('textAlignLast', { startSelf: true });
            if (value === 'auto') {
                return '';
            }
            const rtl = this.dir === 'rtl';
            let valid: boolean;
            switch (this.cssAscend('textAlign', { startSelf: true })) {
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

    set use(value) {
        const use = this.use;
        this.dataset['use' + capitalize(this.localSettings.systemName)] = (use ? use + ', ' : '') + value;
    }
    get use() {
        const dataset = this.dataset;
        return dataset['use' + capitalize(this.localSettings.systemName)] || dataset['use'];
    }

    get extensions() {
        const result = this._cached.extensions;
        if (result === undefined) {
            const use = this.use?.trim();
            return this._cached.extensions = use ? use.split(/\s*,\s*/) : [];
        }
        return result;
    }
}