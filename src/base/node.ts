import CSS_TRAITS = squared.lib.constant.CSS_TRAITS;
import CSS_UNIT = squared.lib.constant.CSS_UNIT;
import USER_AGENT = squared.lib.constant.USER_AGENT;
import STYLE_STATE = squared.lib.internal.STYLE_STATE;

type T = Node;

const { CSS_BORDER_SET, CSS_PROPERTIES, PROXY_INLINESTYLE, convertFontSize, getInitialValue } = squared.lib.internal;
const { FILE } = squared.lib.regex;

const { isUserAgent } = squared.lib.client;
const { isTransparent } = squared.lib.color;
const { asPercent, asPx, checkStyleValue, checkWritingMode, convertUnit, getRemSize, getStyle, isAngle, isLength, isPercent, isTime, parseUnit } = squared.lib.css;
const { assignRect, getNamedItem, getParentElement, getRangeClientRect } = squared.lib.dom;
const { clamp, truncate } = squared.lib.math;
const { getElementCache, getElementData, setElementCache } = squared.lib.session;
const { convertCamelCase, convertFloat, convertInt, convertPercent, endsWith, hasValue, isObject, iterateArray, iterateReverseArray, lastItemOf, safeFloat, splitPair, splitSome, startsWith } = squared.lib.util;

const TEXT_STYLE: CssStyleAttr[] = [
    'fontFamily',
    'fontWeight',
    'fontStyle',
    'fontVariant',
    'fontStretch',
    'color',
    'whiteSpace',
    'textDecorationLine',
    'textDecorationStyle',
    'textDecorationColor',
    'textTransform',
    'letterSpacing',
    'wordSpacing'
];

const [BORDER_TOP, BORDER_RIGHT, BORDER_BOTTOM, BORDER_LEFT, BORDER_OUTLINE] = CSS_BORDER_SET;

const REGEXP_EM = /\dem$/;

function setStyleCache(sessionId: string, style: CSSStyleDeclaration, element: HTMLElement, attr: CssStyleAttr, value: string): number {
    const current = style[attr];
    if (value !== current) {
        const restore = element.style[attr];
        element.style[attr] = value;
        const updated = element.style[attr];
        if (!updated) {
            return STYLE_STATE.FAIL;
        }
        if (updated !== current) {
            setElementCache(element, attr, restore, sessionId);
            return STYLE_STATE.CHANGED;
        }
    }
    return STYLE_STATE.READY;
}

function parseLineHeight(value: string, fontSize: number) {
    let n = +value;
    if (isNaN(n)) {
        n = asPercent(value);
    }
    return !isNaN(n) ? n * fontSize : parseUnit(value, { fontSize });
}

function isFixedFont(node: T) {
    const [fontFirst, fontSecond] = splitPair(node.css('fontFamily'), ',');
    return fontFirst === 'monospace' && fontSecond.trim() !== 'monospace';
}

function getCssFloat(node: T, attr: CssStyleAttr, fallback: number): number {
    const value = +node.css(attr);
    return !isNaN(value) ? value : fallback;
}

function hasTextAlign(node: T, ...values: string[]) {
    const value = node.cssAscend('textAlign', { startSelf: node.textElement && node.blockStatic && !node.hasUnit('width', { initial: true }) });
    return value !== '' && values.includes(value) && (node.blockStatic ? node.textElement && !node.hasUnit('width', { initial: true }) && !node.hasUnit('maxWidth', { initial: true }) : startsWith(node.display, 'inline'));
}

function setDimension(node: T, style: CssStyleMap, dimension: DimensionAttr) {
    const options: NodeParseUnitOptions = { dimension };
    const value = style[dimension];
    const minValue = style[dimension === 'width' ? 'minWidth' : 'minHeight'];
    const baseValue = value ? node.parseUnit(value, options) : 0;
    let result = minValue ? Math.max(baseValue, node.parseUnit(minValue, options)) : baseValue;
    if (result === 0 && node.styleElement) {
        const element = node.element as HTMLInputElement;
        switch (element.tagName) {
            case 'INPUT':
                if (element.type !== 'image') {
                    break;
                }
            case 'IMG':
            case 'TD':
            case 'TH':
            case 'SVG':
            case 'svg':
            case 'IFRAME':
            case 'VIDEO':
            case 'AUDIO':
            case 'CANVAS':
            case 'OBJECT':
            case 'EMBED': {
                const size = getNamedItem(element, dimension);
                if (size && (!isNaN(result = +size) || (result = node.parseUnit(size, options)))) {
                    node.css(dimension, isPercent(size) ? size : size + 'px');
                }
                break;
            }
        }
    }
    if (baseValue && !node.imageElement) {
        const attr = dimension === 'width' ? 'maxWidth' : 'maxHeight';
        const max = style[attr];
        if (max) {
            if (!(max === value || max === 'auto')) {
                const maxValue = node.parseUnit(max, { dimension, fallback: NaN });
                if (!isNaN(maxValue)) {
                    if (maxValue <= baseValue && value && isLength(value)) {
                        style[dimension] = max;
                    }
                    else {
                        return Math.min(result, maxValue);
                    }
                }
            }
            delete style[attr];
        }
    }
    return result;
}

function convertBorderWidth(node: T, dimension: DimensionAttr, border: CssStyleAttr[]) {
    if (!node.plainText) {
        switch (node.css(border[0])) {
            case 'none':
            case 'hidden':
                return 0;
        }
        const width = node.css(border[1]);
        let result = asPx(width);
        if (isNaN(result)) {
            result = isLength(width, true) ? node.parseUnit(width, { dimension }) : safeFloat(node.style[border[1]]);
        }
        if (result) {
            return Math.max(Math.round(result), 1);
        }
    }
    return 0;
}

function convertBox(node: T, attr: CssStyleAttr, margin: boolean) {
    switch (node.display) {
        case 'table':
            if (!margin && node.valueOf('borderCollapse') === 'collapse') {
                return 0;
            }
            break;
        case 'table-row':
            return 0;
        case 'table-cell':
            if (margin) {
                switch (node.tagName) {
                    case 'TD':
                    case 'TH':
                        return 0;
                    default: {
                        const parent = node.ascend({ condition: item => item.tableElement })[0] as Undef<T>;
                        if (parent) {
                            const [horizontal, vertical] = splitPair(parent.css('borderSpacing'), ' ');
                            switch (attr) {
                                case 'marginTop':
                                case 'marginBottom':
                                    return vertical ? node.parseUnit(vertical, { dimension: 'height', parent: false }) : node.parseUnit(horizontal, { parent: false });
                                case 'marginRight':
                                    return node.actualParent!.lastChild !== node ? node.parseUnit(horizontal, { parent: false }) : 0;
                            }
                        }
                        return 0;
                    }
                }
            }
            break;
    }
    return node.cssUnit(attr, node.actualParent?.gridElement ? { parent: false } : undefined);
}

function convertPosition(node: T, attr: CssStyleAttr) {
    if (!node.positionStatic || node.valueOf('position') === 'sticky') {
        const value = node.valueOf(attr, { modified: true });
        if (value) {
            return node.parseUnit(value, attr === 'top' || attr === 'bottom' ? { dimension: 'height' } : undefined);
        }
    }
    return 0;
}

function recurseNaturalElements(result: T[], items: Element[], children: T[]) {
    for (let i = 0, length = children.length; i < length; ++i) {
        const node = children[i];
        if (items.includes(node.element!) && result.push(node) === items.length) {
            return true;
        }
        const next = node.naturalElements;
        if (next.length && recurseNaturalElements(result, items, next)) {
            return true;
        }
    }
}

function getMinMax(node: T, min: boolean, attr: string, options?: MinMaxOptions) {
    let self: Undef<boolean>,
        last: Undef<boolean>,
        wrapperOf: Undef<boolean>,
        subAttr: Undef<string>,
        initial: Undef<boolean>,
        initialValue: Undef<number>;
    if (options) {
        ({ self, subAttr, last, wrapperOf, initialValue, initial } = options);
    }
    if (initialValue === undefined) {
        initialValue = min ? Infinity : -Infinity;
    }
    let result: Undef<T>;
    node.each(item => {
        if (wrapperOf) {
            item = item.wrapperOf || item;
        }
        let value = NaN;
        if (self || subAttr) {
            const subValue = (subAttr ? item[attr][subAttr] : item[attr]) as unknown;
            switch (typeof subValue) {
                case 'number':
                    value = subValue;
                    break;
                case 'string':
                    value = parseFloat(subValue);
                    break;
                default:
                    return;
            }
        }
        else {
            value = parseFloat(initial ? item.cssInitial(attr as CssStyleAttr, options) : item.css(attr as CssStyleAttr));
        }
        if (!isNaN(value)) {
            if (min) {
                if (last) {
                    if (value <= initialValue!) {
                        result = item;
                        initialValue = value;
                    }
                }
                else if (value < initialValue!) {
                    result = item;
                    initialValue = value;
                }
            }
            else if (last) {
                if (value >= initialValue!) {
                    result = item;
                    initialValue = value;
                }
            }
            else if (value > initialValue!) {
                result = item;
                initialValue = value;
            }
        }
    });
    return result || node;
}

const aboveRange = (a: number, b: number, offset = 1) => a + offset >= b;
const belowRange = (a: number, b: number, offset = 1) => a - offset <= b;
const sortById = (a: T, b: T) => a.id - b.id;
const isInlineVertical = (value: string) => startsWith(value, 'inline') || value === 'table-cell';
const canTextAlign = (node: T) => node.naturalChild && (node.isEmpty() || isInlineVertical(node.display) && node.percentWidth < 1) && !node.floating && node.autoMargin.horizontal !== true;
const newBoxRectDimension = (): BoxRectDimension => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 });

export default class Node extends squared.lib.base.Container<T> implements squared.base.Node {
    public static sanitizeCss(element: DocumentElement, input: CssStyleMap, writingMode?: string, output: CssStyleMap = {}) {
        for (let attr in input) {
            const alias = checkWritingMode(attr, writingMode);
            let value = input[attr as CssStyleAttr]!;
            if (alias !== attr) {
                if (typeof alias === 'string') {
                    if (!input[alias]) {
                        attr = alias;
                    }
                    else {
                        continue;
                    }
                }
                else {
                    let actual: string;
                    for (const alt of alias) {
                        if (!input[alt]) {
                            if (actual ||= checkStyleValue(element, alt, value)) {
                                output[alt] = actual;
                            }
                            else {
                                break;
                            }
                        }
                    }
                    continue;
                }
            }
            if (value = checkStyleValue(element, attr, value)) {
                output[attr] = value;
            }
        }
        return output;
    }

    public documentRoot = false;
    public shadowHost: Null<ShadowRoot> = null;
    public pseudoElt: PseudoElt | "" = '';

    protected _parent: Null<T> = null;
    protected _depth = -1;
    protected _cache: CacheValue = {};
    protected _cacheState: CacheState<T> = {};
    protected _preferInitial = false;
    protected _inlineText = false;
    protected _shadowRoot = false;
    protected _bounds: Null<BoxRectDimension> = null;
    protected _box: Null<BoxRectDimension> = null;
    protected _linear: Null<BoxRectDimension> = null;
    protected _initial: Null<InitialData<T>> = null;
    protected _styleMap: CssStyleMap = {};
    protected _naturalChildren: Null<T[]> = null;
    protected _naturalElements: Null<T[]> = null;
    protected _actualParent: Null<T> = null;
    protected _childIndex = Infinity;
    protected _elementData: Null<ElementData> = null;
    protected readonly _element: Null<Element>;

    private _style: Null<CSSStyleDeclaration> = null;
    private _data: Null<StandardMap> = null;
    private _dataset?: DOMStringMap;

    constructor(
        public readonly id: number,
        public readonly sessionId = '0',
        element?: Null<Element>,
        children?: T[])
    {
        super(children);
        this._element = element || null;
        if (element && sessionId !== '0') {
            this.syncWith(sessionId);
            setElementCache(element, 'node', this, sessionId);
        }
    }

    public internalSelf(parent: Null<T>, depth: number, childIndex?: number, actualParent?: Null<T>) {
        this._parent = parent;
        this._depth = depth;
        if (childIndex !== undefined) {
            this._childIndex = childIndex;
        }
        if (actualParent !== undefined) {
            this._actualParent = actualParent;
        }
    }

    public internalNodes(children: T[], elements?: T[], inlineText?: boolean, shadowRoot?: boolean) {
        this._naturalChildren = children;
        this._naturalElements = elements || children.filter((item: T) => item.naturalElement);
        if (inlineText !== undefined) {
            this._inlineText = inlineText;
        }
        if (shadowRoot !== undefined) {
            this._shadowRoot = shadowRoot;
        }
    }

    public syncWith(sessionId?: string, cache?: boolean) {
        const element = this._element as Null<HTMLElement>;
        if (element) {
            let elementData: Optional<ElementData>;
            if ((sessionId ||= getElementCache(element, 'sessionId', '0')) && (elementData = getElementData(element, sessionId))) {
                this._elementData = elementData;
                const styleMap = elementData.styleMap;
                if (styleMap) {
                    if (!this.plainText && this.naturalChild) {
                        if (!this.pseudoElement) {
                            const length = element.style.length;
                            if (length) {
                                const style = element.style;
                                const specificity = elementData.styleSpecificity ||= {};
                                for (let i = 0; i < length; ++i) {
                                    const attr = style[i];
                                    const baseAttr = convertCamelCase(attr);
                                    const values = specificity[baseAttr];
                                    if (!values || values.length < 5) {
                                        styleMap[baseAttr] = style.getPropertyValue(attr);
                                        specificity[baseAttr] = [1, 0, 0, 0];
                                    }
                                }
                            }
                        }
                        else if (elementData.pseudoElt) {
                            this.pseudoElt = elementData.pseudoElt;
                        }
                        Node.sanitizeCss(element, styleMap, styleMap.writingMode, this._styleMap);
                    }
                    else {
                        this._styleMap = styleMap;
                    }
                    if (cache) {
                        this._cache = {};
                    }
                    return true;
                }
            }
        }
        return false;
    }

    public saveAsInitial() {
        this._initial = {
            styleMap: { ...this._styleMap }
        };
    }

    public data<U = unknown>(name: string, attr: string, value?: unknown, overwrite = true): Undef<U> {
        const data = this._data ||= {};
        if (value === null) {
            if (data[name]) {
                delete data[name][attr];
            }
        }
        else {
            if (value !== undefined) {
                let obj: PlainObject = data[name];
                if (!isObject(obj)) {
                    obj = {};
                    data[name] = obj;
                }
                if (overwrite || !hasValue(obj[attr])) {
                    obj[attr] = value;
                }
            }
            const stored: PlainObject = data[name];
            if (isObject(stored)) {
                return stored[attr] as U;
            }
        }
    }

    public elementAttr<U = unknown>(attr: string, value: U): Undef<U> {
        if (this.naturalElement) {
            const element = this._element!;
            if (attr in element && typeof value === typeof element[attr]) {
                element[attr] = value;
                return element[attr] as U;
            }
        }
    }

    public unsetCache(...attrs: (CssStyleAttr | keyof CacheValue)[]) {
        const length = attrs.length;
        if (length) {
            const cache = this._cache;
            const resetWidth = () => {
                cache.actualHeight = undefined;
                cache.contentBoxWidth = undefined;
            };
            const resetHeight = () => {
                cache.actualHeight = undefined;
                cache.contentBoxHeight = undefined;
            };
            for (let i = 0; i < length; ++i) {
                const attr = attrs[i];
                switch (attr) {
                    case 'position':
                        if (!this._preferInitial) {
                            this.cascade(item => {
                                if (!item.pageFlow) {
                                    item.unsetState('absoluteParent');
                                }
                            });
                        }
                    case 'display':
                    case 'float':
                    case 'tagName':
                        this._cache = {};
                        i = length;
                        break;
                    case 'width':
                        cache.actualWidth = undefined;
                        cache.percentWidth = undefined;
                    case 'minWidth':
                        cache.width = undefined;
                        cache.hasWidth = undefined;
                        break;
                    case 'height':
                        cache.actualHeight = undefined;
                        cache.percentHeight = undefined;
                    case 'minHeight':
                        cache.height = undefined;
                        cache.hasHeight = undefined;
                        if (!this._preferInitial) {
                            this.cascade(item => item.unsetCache('height', 'bottomAligned', 'containerHeight'));
                        }
                        break;
                    case 'actualWidth':
                    case 'contentBoxWidth':
                        resetWidth();
                        break;
                    case 'actualHeight':
                    case 'contentBoxHeight':
                        resetHeight();
                        continue;
                    case 'verticalAlign':
                        cache.baseline = undefined;
                        break;
                    case 'left':
                    case 'right':
                    case 'textAlign':
                        cache.rightAligned = undefined;
                        cache.centerAligned = undefined;
                        break;
                    case 'top':
                    case 'bottom':
                        cache.bottomAligned = undefined;
                        break;
                    case 'paddingLeft':
                    case 'paddingRight':
                        resetWidth();
                        break;
                    case 'marginLeft':
                    case 'marginRight':
                        cache.rightAligned = undefined;
                        cache.centerAligned = undefined;
                        cache.autoMargin = undefined;
                        break;
                    case 'marginTop':
                    case 'marginBottom':
                        cache.bottomAligned = undefined;
                        cache.autoMargin = undefined;
                        break;
                    case 'paddingTop':
                    case 'paddingBottom':
                        resetHeight();
                        break;
                    case 'whiteSpace':
                        cache.preserveWhiteSpace = undefined;
                        cache.textStyle = undefined;
                        this._cacheState.textEmpty = undefined;
                        this._cacheState.textBounds = undefined;
                        continue;
                    default:
                        if (startsWith(attr, 'background')) {
                            cache.visibleStyle = undefined;
                        }
                        else if (startsWith(attr, 'border')) {
                            if (startsWith(attr, 'borderTop')) {
                                cache.borderTopWidth = undefined;
                                resetHeight();
                            }
                            else if (startsWith(attr, 'borderRight')) {
                                cache.borderRightWidth = undefined;
                                resetWidth();
                            }
                            else if (startsWith(attr, 'borderBottom')) {
                                cache.borderBottomWidth = undefined;
                                resetHeight();
                            }
                            else {
                                cache.borderLeftWidth = undefined;
                                resetWidth();
                            }
                            cache.visibleStyle = undefined;
                        }
                        else if (attr === 'fontSize' || TEXT_STYLE.includes(attr as CssStyleAttr)) {
                            cache.lineHeight = undefined;
                            cache.textStyle = undefined;
                        }
                        break;
                }
                if (attr in cache) {
                    cache[attr] = undefined;
                }
            }
        }
        else {
            this._cache = {};
        }
        if (!this._preferInitial && this.naturalChild) {
            let parent: T;
            if (attrs.some(value => !!CSS_PROPERTIES[value] && (CSS_PROPERTIES[value]!.trait & CSS_TRAITS.LAYOUT))) {
                parent = this.pageFlow && this.ascend({ condition: item => item.hasUnit('width') && item.hasUnit('height') || item.documentRoot })[0] || this;
            }
            else if (attrs.some(value => !!CSS_PROPERTIES[value] && (CSS_PROPERTIES[value]!.trait & CSS_TRAITS.CONTAIN))) {
                parent = this;
            }
            else {
                return;
            }
            parent.resetBounds();
            parent.querySelectorAll('*').forEach(item => item.resetBounds());
        }
    }

    public unsetState(...attrs: (keyof CacheState<T>)[]) {
        let reset: Undef<boolean>;
        const length = attrs.length;
        if (length) {
            const cacheState = this._cacheState;
            for (let i = 0; i < length; ++i) {
                const attr = attrs[i];
                if (attr in cacheState) {
                    switch (attr) {
                        case 'dir':
                        case 'absoluteParent':
                            reset = true;
                            break;
                        case 'textContent':
                            cacheState.textEmpty = undefined;
                            cacheState.textBounds = undefined;
                            reset = true;
                            break;
                    }
                    cacheState[attr] = undefined;
                }
            }
        }
        else {
            this._cacheState = {};
            reset = true;
        }
        if (reset && !this._preferInitial && this.naturalChild) {
            this.resetBounds();
        }
    }

    public ascend(options?: AscendOptions<T>) {
        let condition: Undef<(item: T) => boolean>,
            error: Undef<(item: T) => boolean>,
            every: Undef<boolean>,
            including: Undef<T>,
            excluding: Undef<T>,
            attr: Undef<squared.base.NodeParentAttr>,
            startSelf: Undef<boolean>;
        if (options) {
            ({ condition, error, every, including, excluding, attr, startSelf } = options);
        }
        if (!attr) {
            attr = 'actualParent';
        }
        else if (attr !== 'parent' && !endsWith(attr, 'Parent')) {
            return [];
        }
        const result: T[] = [];
        let parent: Optional<T> = startSelf ? this : this[attr];
        while (parent && parent !== excluding) {
            if (error && error(parent)) {
                break;
            }
            if (condition) {
                if (condition(parent)) {
                    result.push(parent);
                    if (!every) {
                        break;
                    }
                }
            }
            else {
                result.push(parent);
            }
            if (parent === including) {
                break;
            }
            parent = parent[attr];
        }
        return result;
    }

    public descend(options?: DescendOptions<T>) {
        let condition: Undef<(item: T) => boolean>,
            error: Undef<(item: T) => boolean>,
            every: Undef<boolean>,
            including: Undef<T>,
            excluding: Undef<T>;
        if (options) {
            ({ condition, error, every, including, excluding } = options);
        }
        let complete: Undef<boolean>;
        return (function recurse(children: T[], result: T[]) {
            for (let i = 0, length = children.length; i < length; ++i) {
                const item = children[i];
                if (error && error(item) || item === excluding) {
                    complete = true;
                    break;
                }
                if (condition) {
                    if (condition(item)) {
                        result.push(item);
                        if (!every) {
                            complete = true;
                            break;
                        }
                    }
                }
                else {
                    result.push(item);
                }
                if (item === including) {
                    complete = true;
                    break;
                }
                if (!item.isEmpty()) {
                    recurse(item.naturalElements, result);
                    if (complete) {
                        break;
                    }
                }
            }
            return result;
        })(this.naturalElements, []);
    }

    public intersectX(rect: BoxRectDimension, options?: CoordsXYOptions) {
        if (rect.width) {
            const { left, right } = this[options && options.dimension || 'linear'];
            const { left: leftA, right: rightA } = rect;
            return (
                Math.ceil(left) >= leftA && left < Math.floor(rightA) ||
                Math.floor(right) > leftA && right <= Math.ceil(rightA) ||
                Math.ceil(leftA) >= left && leftA < Math.floor(right) ||
                Math.floor(rightA) > left && rightA <= Math.ceil(right)
            );
        }
        return false;
    }

    public intersectY(rect: BoxRectDimension, options?: CoordsXYOptions) {
        if (rect.height) {
            const { top, bottom } = this[options && options.dimension || 'linear'];
            const { top: topA, bottom: bottomA } = rect;
            return (
                Math.ceil(top) >= topA && top < Math.floor(bottomA) ||
                Math.floor(bottom) > topA && bottom <= Math.ceil(bottomA) ||
                Math.ceil(topA) >= top && topA < Math.floor(bottom) ||
                Math.floor(bottomA) > top && bottomA <= Math.ceil(bottom)
            );
        }
        return false;
    }

    public withinX(rect: BoxRectDimension, options?: OffsetXYOptions) {
        if (rect.width || this.pageFlow) {
            let dimension: Undef<BoxType>,
                offset: Undef<number>;
            if (options) {
                ({ dimension, offset } = options);
            }
            const { left, right } = this[dimension || 'bounds'];
            return aboveRange(left, rect.left, offset) && belowRange(right, rect.right, offset);
        }
        return true;
    }

    public withinY(rect: BoxRectDimension, options?: OffsetXYOptions) {
        if (rect.height || this.pageFlow) {
            let dimension: Undef<BoxType>,
                offset: Undef<number>;
            if (options) {
                ({ dimension, offset } = options);
            }
            const { top, bottom } = this[dimension || 'bounds'];
            return aboveRange(top, rect.top, offset) && belowRange(bottom, rect.bottom, offset);
        }
        return true;
    }

    public outsideX(rect: BoxRectDimension, options?: OffsetXYOptions) {
        if (rect.width || this.pageFlow) {
            let dimension: Undef<BoxType>,
                offset: Undef<number>;
            if (options) {
                ({ dimension, offset } = options);
            }
            const { left, right } = this[dimension || 'linear'];
            return offset === undefined ? left < Math.floor(rect.left) || right > Math.ceil(rect.right) : left < rect.left - offset || right > rect.right + offset;
        }
        return false;
    }

    public outsideY(rect: BoxRectDimension, options?: OffsetXYOptions) {
        if (rect.height || this.pageFlow) {
            let dimension: Undef<BoxType>,
                offset: Undef<number>;
            if (options) {
                ({ dimension, offset } = options);
            }
            const { top, bottom } = this[dimension || 'linear'];
            return offset === undefined ? top < Math.floor(rect.top) || bottom > Math.ceil(rect.bottom) : top < rect.top - offset || bottom > rect.bottom + offset;
        }
        return false;
    }

    public css(attr: CssStyleAttr, value?: string, cache = true) {
        const style = this.style;
        if (this.styleElement && attr in style && typeof value === 'string') {
            if (value) {
                const current = style[attr];
                style[attr] = value;
                if (current !== style[attr]) {
                    this._styleMap[attr] = value;
                    if (cache) {
                        this.unsetCache(attr);
                    }
                    return value;
                }
                return current;
            }
            style[attr] = 'initial';
            const property = CSS_PROPERTIES[attr];
            if (property && typeof property.value === 'string') {
                this._styleMap[attr] = getInitialValue(this._element!, attr) + (property.trait & CSS_TRAITS.UNIT ? 'px' : '');
            }
            else {
                delete this._styleMap[attr];
            }
            if (cache) {
                this.unsetCache(attr);
            }
        }
        return this._styleMap[attr] || style[attr] || '';
    }

    public cssApply(values: CssStyleMap, overwrite = true, cache = true) {
        if (overwrite) {
            for (const attr in values) {
                this.css(attr as CssStyleAttr, values[attr], cache);
            }
        }
        else {
            const style = this._styleMap;
            for (const attr in values) {
                if (!style[attr]) {
                    this.css(attr as CssStyleAttr, values[attr], cache);
                }
            }
        }
        return this;
    }

    public cssParent(attr: CssStyleAttr, value?: string, cache = false) {
        const parent = this.actualParent;
        return parent ? parent.css(attr, value, cache) : '';
    }

    public cssInitial(attr: CssStyleAttr, options?: CssInitialOptions) {
        const initial = this._initial;
        const dataMap = initial && initial.styleMap || this._styleMap;
        if (options) {
            const value = options.value;
            if (value && initial) {
                return dataMap[attr] = value;
            }
        }
        return dataMap[attr] || options && (options.modified && this._styleMap[attr] || options.computed && this.style[attr]) || '';
    }

    public cssAscend(attr: CssStyleAttr, options?: CssAscendOptions) {
        let value: string,
            parent = options && options.startSelf ? this : this.actualParent;
        while (parent) {
            if ((value = parent.valueOf(attr, options)) && value !== 'inherit') {
                return value;
            }
            parent = parent.actualParent;
        }
        return '';
    }

    public cssAny(attr: CssStyleAttr, values: string[], options?: CssAnyOptions) {
        let ascend: Undef<boolean>,
            initial: Undef<boolean>;
        if (options) {
            ({ ascend, initial } = options);
        }
        let value: string;
        if (ascend) {
            options!.startSelf = true;
            value = this.cssAscend(attr, options);
        }
        else {
            value = initial ? this.cssInitial(attr, options) : this.css(attr);
        }
        return value !== '' && values.includes(value);
    }

    public cssSort(attr: CssStyleAttr, options?: CssSortOptions) {
        let ascending: Undef<boolean>,
            byFloat: Undef<boolean>,
            byInt: Undef<boolean>,
            duplicate: Undef<boolean>;
        if (options) {
            ({ ascending, byFloat, byInt, duplicate } = options);
        }
        return (duplicate ? this.toArray() : this.children).sort((a, b) => {
            let valueA: NumString,
                valueB: NumString;
            if (byFloat) {
                valueA = a.toFloat(attr, a.childIndex);
                valueB = b.toFloat(attr, b.childIndex);
            }
            else if (byInt) {
                valueA = a.toInt(attr, a.childIndex);
                valueB = b.toInt(attr, b.childIndex);
            }
            else {
                valueA = a.css(attr);
                valueB = b.css(attr);
            }
            if (valueA === valueB) {
                return 0;
            }
            if (ascending !== false) {
                return valueA < valueB ? -1 : 1;
            }
            return valueA > valueB ? -1 : 1;
        });
    }

    public cssUnit(attr: CssStyleAttr, options?: CssUnitOptions) {
        return this.parseUnit(options && options.initial ? this.cssInitial(attr, options) : this.css(attr), options);
    }

    public cssSpecificity(attr: CssStyleAttr) {
        if (this.styleElement) {
            const styleData = !this.pseudoElt ? this._elementData?.styleSpecificity : this.actualParent?.elementData?.['styleSpecificity' + this.pseudoElt] as Undef<ObjectMap<Specificity>>;
            if (styleData) {
                return styleData[attr];
            }
        }
    }

    public cssTry(attr: CssStyleAttr, value: string, callback?: FunctionBind<this>) {
        if (this.styleElement) {
            const element = this._element as HTMLElement;
            if (setStyleCache(this.sessionId, !this.pseudoElement ? this.style : getStyle(element), element, attr, value)) {
                if (callback) {
                    callback.call(this, attr);
                    this.cssFinally(attr);
                }
                return true;
            }
        }
        return false;
    }

    public cssTryAll(values: CssStyleMap, callback?: FunctionBind<this>) {
        if (this.styleElement) {
            const result: CssStyleMap = {};
            const sessionId = this.sessionId;
            const element = this._element as HTMLElement;
            const style = !this.pseudoElement ? this.style : getStyle(element);
            for (const attr in values) {
                const value = values[attr]!;
                switch (setStyleCache(sessionId, style, element, attr as CssStyleAttr, value)) {
                    case STYLE_STATE.FAIL:
                        this.cssFinally(result);
                        return false;
                    case STYLE_STATE.READY:
                        continue;
                    case STYLE_STATE.CHANGED:
                        result[attr] = value;
                        break;
                }
            }
            if (callback) {
                callback.call(this, result);
                this.cssFinally(result);
                return true;
            }
            return result;
        }
        return false;
    }

    public cssFinally(attrs: CssStyleAttr | CssStyleMap) {
        if (this.styleElement) {
            const elementData = this._elementData;
            if (elementData) {
                if (typeof attrs === 'string') {
                    const value = elementData[attrs] as Undef<string>;
                    if (value !== undefined) {
                        (this._element as HTMLElement).style[attrs] = value;
                    }
                }
                else {
                    for (const attr in attrs) {
                        const value = elementData[attr] as Undef<string>;
                        if (value !== undefined) {
                            (this._element as HTMLElement).style[attr] = value;
                        }
                    }
                }
            }
        }
    }

    public cssCopy(node: T, ...attrs: CssStyleAttr[]) {
        const style = this._styleMap;
        for (let i = 0, attr: CssStyleAttr, length = attrs.length; i < length; ++i) {
            style[attr = attrs[i]] = node.css(attr);
        }
    }

    public cssCopyIfEmpty(node: T, ...attrs: CssStyleAttr[]) {
        const style = this._styleMap;
        for (let i = 0, attr: CssStyleAttr, length = attrs.length; i < length; ++i) {
            if (!style[attr = attrs[i]]) {
                style[attr] = node.css(attr);
            }
        }
    }

    public cssAsTuple(...attrs: CssStyleAttr[]) {
        const length = attrs.length;
        const result: string[] = new Array(length);
        for (let i = 0; i < length; ++i) {
            result[i] = this.css(attrs[i]);
        }
        return result;
    }

    public cssAsObject(...attrs: CssStyleAttr[]) {
        const result: CssStyleMap = {};
        for (let i = 0, attr: CssStyleAttr, length = attrs.length; i < length; ++i) {
            result[attr = attrs[i]] = this.css(attr);
        }
        return result;
    }

    public toInt(attr: CssStyleAttr, fallback = NaN, options?: CssInitialOptions) {
        return convertInt(this.cssInitial(attr, options)!, fallback);
    }

    public toFloat(attr: CssStyleAttr, fallback = NaN, options?: CssInitialOptions) {
        return convertFloat(this.cssInitial(attr, options), fallback);
    }

    public toElementInt(attr: string, fallback = NaN) {
        if (this.naturalElement) {
            const value: unknown = this._element![attr];
            switch (typeof value) {
                case 'number':
                    return Math.floor(value);
                case 'string':
                    return convertInt(value, fallback);
            }
        }
        return fallback;
    }

    public toElementFloat(attr: string, fallback = NaN) {
        if (this.naturalElement) {
            const value: unknown = this._element![attr];
            switch (typeof value) {
                case 'number':
                    return value;
                case 'string':
                    return convertFloat(value, fallback);
            }
        }
        return fallback;
    }

    public toElementBoolean(attr: string, fallback = false) {
        if (this.naturalElement) {
            const value: unknown = this._element![attr];
            if (value !== undefined) {
                return value === true;
            }
        }
        return fallback;
    }

    public toElementString(attr: string, fallback = '') {
        if (this.naturalElement) {
            const value: unknown = this._element![attr];
            if (value !== undefined) {
                return value !== null ? (value as string).toString() : '';
            }
        }
        return fallback;
    }

    public has(attr: CssStyleAttr, options?: HasOptions) {
        const value = options && options.initial ? this.cssInitial(attr, options) : this._styleMap[attr];
        if (value) {
            let type: Undef<number>,
                not: Undef<StringOfArray>,
                ignoreDefault: Undef<boolean>;
            if (options) {
                ({ not, type, ignoreDefault } = options);
            }
            if (ignoreDefault !== true) {
                const property = CSS_PROPERTIES[attr];
                if (property) {
                    const propValue = this.styleElement ? getInitialValue(this._element!, attr) : property.value;
                    if (typeof propValue === 'string' && (value === propValue || (property.trait & CSS_TRAITS.UNIT) && this.parseUnit(value) === parseFloat(propValue))) {
                        return false;
                    }
                }
            }
            if (not && (value === not || Array.isArray(not) && not.includes(value))) {
                return false;
            }
            if (type) {
                return (
                    (type & CSS_UNIT.LENGTH) > 0 && isLength(value) ||
                    (type & CSS_UNIT.PERCENT) > 0 && isPercent(value) ||
                    (type & CSS_UNIT.TIME) > 0 && isTime(value) ||
                    (type & CSS_UNIT.ANGLE) > 0 && isAngle(value)
                );
            }
            return true;
        }
        return false;
    }

    public parseUnit(value: unknown, options?: NodeParseUnitOptions) {
        switch (typeof value) {
            case 'string':
                break;
            case 'number':
                return value;
            default:
                return options && options.fallback !== undefined ? options.fallback : 0;
        }
        let n = asPx(value);
        if (!isNaN(n)) {
            return n;
        }
        if (!isNaN(n = asPercent(value))) {
            return n * this.getContainerSize(options);
        }
        if (!options) {
            options = { fontSize: this.fontSize };
        }
        else {
            options.fontSize ??= this.fontSize;
        }
        return parseUnit(value, options);
    }

    public convertUnit(value: unknown, unit = 'px', options?: NodeConvertUnitOptions) {
        let result = this.parseUnit(value, options);
        if (unit === '%' || unit === 'percent') {
            result *= 100 / this.getContainerSize(options);
            return (options && options.precision !== undefined ? truncate(result, options.precision) : result) + '%';
        }
        return convertUnit(result, unit, options);
    }

    public hasUnit(attr: CssStyleAttr, options?: HasUnitOptions) {
        let percent: Undef<boolean>,
            initial: Undef<boolean>;
        if (options) {
            ({ percent, initial } = options);
        }
        const value = initial ? this.cssInitial(attr, options) : this._styleMap[attr];
        return !!value && isLength(value, percent !== false);
    }

    public setBounds(cache = true) {
        let bounds: BoxRectDimension;
        if (this.styleElement) {
            bounds = assignRect(cache && this._elementData?.clientRect || this._element!.getBoundingClientRect());
        }
        else if (this.plainText) {
            const rect = getRangeClientRect(this._element!);
            if (rect) {
                this._cacheState.textBounds = rect;
                this._cache.multiline = rect.numberOfLines! > 1;
            }
            bounds = rect || newBoxRectDimension();
        }
        else {
            return null;
        }
        if (!cache) {
            this._box = null;
            this._linear = null;
        }
        return this._bounds = bounds;
    }

    public resetBounds(recalibrate?: boolean) {
        if (!recalibrate) {
            this._bounds = null;
            this._cacheState.textBounds = undefined;
            this._cache.multiline = undefined;
        }
        this._box = null;
        this._linear = null;
    }

    public getContainerSize(options?: NodeUnitOptions) {
        const bounds: Dimension = (!options || options.parent !== false) && (this.positionFixed ? { width: window.innerWidth, height: window.innerHeight } as BoxRectDimension : this.absoluteParent?.box) || this.bounds;
        return bounds[options && options.dimension || 'width'];
    }

    public min(attr: string, options?: MinMaxOptions) {
        return getMinMax(this, true, attr, options);
    }

    public max(attr: string, options?: MinMaxOptions) {
        return getMinMax(this, false, attr, options);
    }

    public querySelector(value: string) {
        if (this.naturalElement) {
            const element = this._element!.querySelector(value);
            if (element) {
                const result: T[] = [];
                if (recurseNaturalElements(result, [element], this.naturalElements)) {
                    return result[0];
                }
            }
        }
        return null;
    }

    public querySelectorAll(value: string, queryMap?: T[], queryRoot?: Null<HTMLElement>) {
        if (!queryRoot) {
            if (!this.naturalElement) {
                return [];
            }
            queryRoot = this._element as HTMLElement;
        }
        const result: T[] = [];
        try {
            const items = Array.from(queryRoot.querySelectorAll(value));
            const itemCount = items.length;
            if (itemCount) {
                if (queryMap) {
                    for (let i = 0, length = queryMap.length; i < length; ++i) {
                        const node = queryMap[i];
                        if (items.includes(node.element!) && result.push(node) === itemCount) {
                            break;
                        }
                    }
                }
                else {
                    recurseNaturalElements(result, items, this.naturalElements);
                }
            }
        }
        catch {
        }
        return result;
    }

    public ancestors(value?: string, options?: AscendOptions<T>) {
        const result = this.ascend(options);
        return value && result.length ? this.querySelectorAll(value, result, document.documentElement) : result.sort(sortById);
    }

    public descendants(value?: string, options?: DescendOptions<T>) {
        if (this.naturalElements.length) {
            if (options) {
                const children: T[] = this.descend(options);
                return value && children.length ? this.querySelectorAll(value, children) : children.filter(item => item.naturalElement).sort(sortById);
            }
            return this.querySelectorAll(value || '*');
        }
        return [];
    }

    public siblings(value?: string, options?: SiblingsOptions<T>) {
        const parent = this.actualParent;
        if (!parent) {
            return [];
        }
        let condition: Undef<(item: T) => boolean>,
            error: Undef<(item: T) => boolean>,
            every: Undef<boolean>,
            including: Undef<T>,
            excluding: Undef<T>,
            reverse: Undef<boolean>;
        if (options) {
            ({ condition, error, every, including, excluding, reverse } = options);
        }
        let result: T[] = [];
        const filterPredicate = (item: T) => {
            if (error && error(item) || item === excluding) {
                return true;
            }
            if (condition) {
                if (condition(item)) {
                    result.push(item);
                    if (!every) {
                        return true;
                    }
                }
            }
            else {
                result.push(item);
            }
            return item === including;
        };
        if (reverse) {
            iterateReverseArray(parent.naturalElements, filterPredicate, 0, this.childIndex);
        }
        else {
            iterateArray(parent.naturalElements, filterPredicate, this.childIndex + 1);
        }
        if (value) {
            result = parent.querySelectorAll(value, result);
            if (reverse && result.length > 1) {
                result.reverse();
            }
        }
        return result;
    }

    public valueOf(attr: CssStyleAttr, options?: CssInitialOptions) {
        return this._preferInitial ? this.cssInitial(attr, options) : this._styleMap[attr] || options && options.computed && this.style[attr] || '';
    }

    get naturalChild() { return true; }

    get pseudoElement() { return false; }

    get parent() {
        return this._parent;
    }

    get shadowRoot() {
        return this._shadowRoot;
    }

    get tagName() {
        const result = this._cache.tagName;
        if (result === undefined) {
            const element = this._element;
            return this._cache.tagName = element ? element.nodeName : '';
        }
        return result;
    }

    get element() {
        return this._element;
    }

    get elementId() {
        const element = this._element;
        return element ? element.id : '';
    }

    get htmlElement() {
        const result = this._cacheState.htmlElement;
        return result === undefined ? this._cacheState.htmlElement = this._element instanceof HTMLElement : result;
    }

    get svgElement() {
        const result = this._cacheState.svgElement;
        return result === undefined ? this._cacheState.svgElement = !this.htmlElement && this._element instanceof SVGElement || this.imageElement && FILE.SVG.test((this._element as HTMLImageElement).src) : result;
    }

    get styleElement() {
        const result = this._cacheState.styleElement;
        return result === undefined ? this._cacheState.styleElement = !!this._element && !this.plainText : result;
    }

    get naturalElement() {
        const result = this._cacheState.naturalElement;
        return result === undefined ? this._cacheState.naturalElement = this.naturalChild && this.styleElement && !this.pseudoElement : result;
    }

    get parentElement() {
        return this._element && getParentElement(this._element) || this.actualParent?.element || null;
    }

    get textElement() {
        return this.plainText || this.inlineText && this.tagName !== 'BUTTON';
    }

    get imageElement() {
        return this.tagName === 'IMG';
    }

    get flexElement() {
        return endsWith(this.display, 'flex');
    }

    get gridElement() {
        return endsWith(this.display, 'grid');
    }

    get tableElement() {
        return this.tagName === 'TABLE';
    }

    get inputElement() {
        switch (this.tagName) {
            case 'INPUT':
            case 'BUTTON':
            case 'SELECT':
            case 'TEXTAREA':
                return true;
        }
        return false;
    }

    get buttonElement() {
        switch (this.tagName) {
            case 'BUTTON':
                return true;
            case 'INPUT':
                switch ((this._element as HTMLInputElement).type) {
                    case 'button':
                    case 'submit':
                    case 'reset':
                    case 'file':
                    case 'image':
                        return true;
                }
        }
        return false;
    }

    get plainText() {
        return this.tagName[0] === '#';
    }

    get lineBreak() {
        return this.tagName === 'BR';
    }

    get positionRelative() {
        return this.valueOf('position') === 'relative';
    }

    get positionFixed() {
        return this.valueOf('position') === 'fixed';
    }

    get display() {
        return this.css('display');
    }

    get float() {
        return this.pageFlow && this.css('float') as FloatDirectionAttr || 'none';
    }

    get floating() {
        return this.float !== 'none';
    }

    get zIndex() {
        return this.toInt('zIndex', 0);
    }

    get opacity() {
        const value = this.valueOf('opacity');
        return value ? clamp(+value) : 1;
    }

    get textContent() {
        return this.naturalChild && !this.svgElement ? this._element!.textContent! : '';
    }

    get dataset(): DOMStringMap {
        return this.naturalElement ? (this._element as HTMLElement).dataset : this._dataset ||= {};
    }

    get documentBody() {
        return this._element === document.body;
    }

    get bounds() {
        return this._bounds || this.setBounds(false) || newBoxRectDimension();
    }

    get linear() {
        if (!this._linear) {
            const bounds = this._bounds || this.setBounds(false);
            if (bounds) {
                if (this.styleElement) {
                    let { marginTop, marginBottom, marginRight, marginLeft } = this; // eslint-disable-line prefer-const
                    if (marginTop < 0) {
                        marginTop = 0;
                    }
                    if (marginLeft < 0) {
                        marginLeft = 0;
                    }
                    return this._linear = {
                        top: bounds.top - marginTop,
                        right: bounds.right + marginRight,
                        bottom: bounds.bottom + marginBottom,
                        left: bounds.left - marginLeft,
                        width: bounds.width + marginLeft + marginRight,
                        height: bounds.height + marginTop + marginBottom
                    };
                }
                return this._linear = bounds;
            }
            return newBoxRectDimension();
        }
        return this._linear;
    }

    get box() {
        if (!this._box) {
            const bounds = this._bounds || this.setBounds(false);
            if (bounds) {
                if (this.styleElement && this.naturalChildren.length) {
                    let { marginTop, marginLeft } = this;
                    if (marginTop > 0) {
                        marginTop = 0;
                    }
                    if (marginLeft > 0) {
                        marginLeft = 0;
                    }
                    return this._box = {
                        top: bounds.top + (this.paddingTop + this.borderTopWidth),
                        right: bounds.right - (this.paddingRight + this.borderRightWidth),
                        bottom: bounds.bottom - (this.paddingBottom + this.borderBottomWidth),
                        left: bounds.left + (this.paddingLeft + this.borderLeftWidth),
                        width: bounds.width + marginLeft - this.contentBoxWidth,
                        height: bounds.height + marginTop - this.contentBoxHeight
                    };
                }
                return this._box = bounds;
            }
            return newBoxRectDimension();
        }
        return this._box;
    }

    get flexdata() {
        let result = this._cache.flexdata;
        if (result === undefined) {
            if (this.flexElement) {
                const [flexWrap, flexDirection, alignContent, justifyContent] = this.cssAsTuple('flexWrap', 'flexDirection', 'alignContent', 'justifyContent');
                const row = startsWith(flexDirection, 'row');
                result = {
                    row,
                    column: !row,
                    reverse: endsWith(flexDirection, 'reverse'),
                    wrap: startsWith(flexWrap, 'wrap'),
                    wrapReverse: flexWrap === 'wrap-reverse',
                    alignContent,
                    justifyContent
                };
            }
            else {
                result = {};
            }
            this._cache.flexdata = result;
        }
        return result;
    }

    get flexbox() {
        let result = this._cache.flexbox;
        if (result === undefined) {
            if (this.naturalChild && this.actualParent?.flexElement) {
                const [alignSelf, justifySelf, basis] = this.cssAsTuple('alignSelf', 'justifySelf', 'flexBasis');
                result = {
                    alignSelf: alignSelf === 'auto' ? this.cssParent('alignItems') : alignSelf,
                    justifySelf: justifySelf === 'auto' ? this.cssParent('justifyItems') : justifySelf,
                    basis,
                    grow: getCssFloat(this, 'flexGrow', 0),
                    shrink: getCssFloat(this, 'flexShrink', 1),
                    order: this.toInt('order', 0)
                };
            }
            else {
                result = {} as FlexBox;
            }
            this._cache.flexbox = result;
        }
        return result;
    }

    get width() {
        const result = this._cache.width;
        return result === undefined ? this._cache.width = setDimension(this, this._styleMap, 'width') : result;
    }
    get height() {
        const result = this._cache.height;
        return result === undefined ? this._cache.height = setDimension(this, this._styleMap, 'height') : result;
    }

    get hasWidth() {
        const result = this._cache.hasWidth;
        return result === undefined ? this._cache.hasWidth = this.width > 0 : result;
    }
    get hasHeight(): boolean {
        const result = this._cache.hasHeight;
        return result === undefined ? this._cache.hasHeight = isPercent(this.valueOf('height')) ? this.pageFlow ? this.actualParent?.hasHeight || this.documentBody : this.positionFixed || this.hasUnit('top') || this.hasUnit('bottom') : this.height > 0 || this.hasUnit('height', { percent: false }) : result;
    }

    get lineHeight() {
        let result = this._cache.lineHeight;
        if (result === undefined) {
            if (!this.imageElement && !this.svgElement) {
                let hasOwnStyle = this.has('lineHeight'),
                    value = 0;
                if (hasOwnStyle) {
                    let lineHeight = this.css('lineHeight');
                    if (lineHeight === 'inherit') {
                        lineHeight = this.cssAscend('lineHeight', { initial: true });
                    }
                    value = parseLineHeight(lineHeight, this.fontSize);
                }
                else {
                    let parent = this.ascend({ condition: item => item.has('lineHeight', { initial: true, not: 'inherit' }) })[0] as Undef<T>;
                    if (parent && (value = parseLineHeight(parent.css('lineHeight'), this.fontSize))) {
                        if (parent !== this.actualParent || REGEXP_EM.test(this.valueOf('fontSize')) || this.multiline) {
                            this.css('lineHeight', value + 'px');
                        }
                        hasOwnStyle = true;
                    }
                    if (value === 0 && (parent = this.ascend({ condition: item => item.lineHeight > 0 })[0] as Undef<T>)) {
                        value = parent.lineHeight;
                    }
                }
                result = hasOwnStyle || value > this.height || this.multiline || this.block && this.naturalChildren.some((node: T) => node.textElement) ? value : 0;
            }
            return this._cache.lineHeight = result || 0;
        }
        return result;
    }

    get positionStatic() {
        let result = this._cache.positionStatic;
        if (result === undefined) {
            switch (this.valueOf('position')) {
                case 'absolute':
                case 'fixed':
                    result = false;
                    break;
                case 'relative':
                    result = !this.documentBody && this.toFloat('top', 0) === 0 && this.toFloat('right', 0) === 0 && this.toFloat('bottom', 0) === 0 && this.toFloat('left', 0) === 0;
                    this._cache.positionRelative = !result;
                    break;
                default:
                    result = true;
                    break;
            }
            this._cache.positionStatic = result;
        }
        return result;
    }

    get top() {
        const result = this._cache.top;
        return result === undefined ? this._cache.top = convertPosition(this, 'top') : result;
    }
    get right() {
        const result = this._cache.right;
        return result === undefined ? this._cache.right = convertPosition(this, 'right') : result;
    }
    get bottom() {
        const result = this._cache.bottom;
        return result === undefined ? this._cache.bottom = convertPosition(this, 'bottom') : result;
    }
    get left() {
        const result = this._cache.left;
        return result === undefined ? this._cache.left = convertPosition(this, 'left') : result;
    }

    get marginTop() {
        const result = this._cache.marginTop;
        return result === undefined ? this._cache.marginTop = this.inlineStatic ? 0 : convertBox(this, 'marginTop', true) : result;
    }
    get marginRight() {
        const result = this._cache.marginRight;
        return result === undefined ? this._cache.marginRight = convertBox(this, 'marginRight', true) : result;
    }
    get marginBottom() {
        const result = this._cache.marginBottom;
        return result === undefined ? this._cache.marginBottom = this.inlineStatic ? 0 : convertBox(this, 'marginBottom', true) : result;
    }
    get marginLeft() {
        const result = this._cache.marginLeft;
        return result === undefined ? this._cache.marginLeft = convertBox(this, 'marginLeft', true) : result;
    }

    get borderTopWidth() {
        const result = this._cache.borderTopWidth;
        return result === undefined ? this._cache.borderTopWidth = convertBorderWidth(this, 'height', BORDER_TOP) : result;
    }
    get borderRightWidth() {
        const result = this._cache.borderRightWidth;
        return result === undefined ? this._cache.borderRightWidth = convertBorderWidth(this, 'height', BORDER_RIGHT) : result;
    }
    get borderBottomWidth() {
        const result = this._cache.borderBottomWidth;
        return result === undefined ? this._cache.borderBottomWidth = convertBorderWidth(this, 'width', BORDER_BOTTOM) : result;
    }
    get borderLeftWidth() {
        const result = this._cache.borderLeftWidth;
        return result === undefined ? this._cache.borderLeftWidth = convertBorderWidth(this, 'width', BORDER_LEFT) : result;
    }

    get outlineWidth() {
        const result = this._cache.outlineWidth;
        return result === undefined ? this._cache.outlineWidth = convertBorderWidth(this, 'width', BORDER_OUTLINE) : result;
    }

    get paddingTop() {
        const result = this._cache.paddingTop;
        return result === undefined ? this._cache.paddingTop = convertBox(this, 'paddingTop', false) : result;
    }
    get paddingRight() {
        const result = this._cache.paddingRight;
        return result === undefined ? this._cache.paddingRight = convertBox(this, 'paddingRight', false) : result;
    }
    get paddingBottom() {
        const result = this._cache.paddingBottom;
        return result === undefined ? this._cache.paddingBottom = convertBox(this, 'paddingBottom', false) : result;
    }
    get paddingLeft() {
        const result = this._cache.paddingLeft;
        return result === undefined ? this._cache.paddingLeft = convertBox(this, 'paddingLeft', false) : result;
    }

    get contentBox() {
        return this.css('boxSizing') !== 'border-box' || this.tableElement && isUserAgent(USER_AGENT.FIREFOX);
    }

    get contentBoxWidth() {
        const result = this._cache.contentBoxWidth;
        return result === undefined ? this._cache.contentBoxWidth = this.tableElement && this.valueOf('borderCollapse') === 'collapse' ? 0 : this.borderLeftWidth + this.paddingLeft + this.paddingRight + this.borderRightWidth : result;
    }

    get contentBoxHeight() {
        const result = this._cache.contentBoxHeight;
        return result === undefined ? this._cache.contentBoxHeight = this.tableElement && this.valueOf('borderCollapse') === 'collapse' ? 0 : this.borderTopWidth + this.paddingTop + this.paddingBottom + this.borderBottomWidth : result;
    }

    get inline() {
        const result = this._cache.inline;
        return result === undefined ? this._cache.inline = this.display === 'inline' : result;
    }

    get inlineStatic() {
        const result = this._cache.inlineStatic;
        return result === undefined ? this._cache.inlineStatic = this.inline && this.pageFlow && !this.floating && !this.imageElement : result;
    }

    get inlineText() {
        return this._inlineText;
    }

    get block() {
        let result = this._cache.block;
        if (result === undefined) {
            switch (this.display) {
                case 'block':
                case 'flex':
                case 'grid':
                case 'list-item':
                    result = true;
                    break;
                case 'inline':
                    if (this.tagName.toLowerCase() === 'svg' && this.actualParent!.htmlElement) {
                        result = !this.hasUnit('width') && convertFloat(getNamedItem(this._element as SVGSVGElement, 'width')) === 0;
                        break;
                    }
                default:
                    result = false;
                    break;
            }
            this._cache.block = result;
        }
        return result;
    }

    get blockStatic() {
        let result = this._cache.blockStatic;
        if (result === undefined) {
            const pageFlow = this.pageFlow;
            if (pageFlow) {
                if (this.block && !this.floating || this.lineBreak) {
                    result = true;
                }
                else {
                    const parent = this.actualParent;
                    if (parent && (parent.block && !parent.floating || parent.hasWidth)) {
                        if (this.inlineStatic && this.firstChild?.blockStatic) {
                            result = true;
                        }
                        else if (this.inline || startsWith(this.display, 'table-') || this.hasUnit('maxWidth')) {
                            result = false;
                        }
                    }
                    else {
                        result = false;
                    }
                }
            }
            if (result === undefined) {
                const width = this.valueOf('width');
                const minWidth = this.valueOf('minWidth');
                let percent = 0,
                    n: number;
                if (!isNaN(n = asPercent(width))) {
                    percent = n;
                }
                if (!isNaN(n = asPercent(minWidth))) {
                    percent = Math.max(n, percent);
                }
                if (percent) {
                    const marginLeft = this.valueOf('marginLeft');
                    const marginRight = this.valueOf('marginRight');
                    result = percent + Math.max(0, convertPercent(marginLeft)) + convertPercent(marginRight) >= 1;
                }
            }
            return this._cache.blockStatic = !!result;
        }
        return result;
    }

    get pageFlow() {
        const result = this._cache.pageFlow;
        return result === undefined ? this._cache.pageFlow = this.positionStatic || this.positionRelative || this.lineBreak : result;
    }

    get centerAligned() {
        const result = this._cache.centerAligned;
        return result === undefined ? this._cache.centerAligned = !this.pageFlow ? this.hasUnit('left') && this.hasUnit('right') : this.autoMargin.leftRight || canTextAlign(this) && hasTextAlign(this, 'center') : result;
    }

    get rightAligned() {
        const result = this._cache.rightAligned;
        return result === undefined ? this._cache.rightAligned = !this.pageFlow ? this.hasUnit('right') && !this.hasUnit('left') : this.float === 'right' || this.autoMargin.left || canTextAlign(this) && hasTextAlign(this, 'right', this.dir === 'rtl' ? 'start' : 'end') : result;
    }

    get bottomAligned() {
        const result = this._cache.bottomAligned;
        return result === undefined ? this._cache.bottomAligned = !this.pageFlow ? this.hasUnit('bottom') && !this.hasUnit('top') : !!(this.actualParent?.hasHeight && this.autoMargin.top) : result;
    }

    get autoMargin() {
        let result = this._cache.autoMargin;
        if (result === undefined) {
            if (this.blockStatic || this.actualParent?.flexElement || !this.pageFlow || this.display === 'table') {
                const style = this._styleMap;
                const left = style.marginLeft === 'auto' && (this.pageFlow || this.hasUnit('right'));
                const right = style.marginRight === 'auto' && (this.pageFlow || this.hasUnit('left'));
                const top = style.marginTop === 'auto' && (this.pageFlow || this.hasUnit('bottom'));
                const bottom = style.marginBottom === 'auto' && (this.pageFlow || this.hasUnit('top'));
                result = {
                    horizontal: left || right,
                    left: left && !right,
                    right: !left && right,
                    leftRight: left && right,
                    vertical: top || bottom,
                    top: top && !bottom,
                    bottom: !top && bottom,
                    topBottom: top && bottom
                };
            }
            else {
                result = {};
            }
            this._cache.autoMargin = result;
        }
        return result;
    }

    get baseline() {
        let result = this._cache.baseline;
        if (result === undefined) {
            const display = this.display;
            if ((startsWith(display, 'inline') || display === 'list-item') && this.pageFlow && !this.floating && !this.tableElement) {
                const value = this.css('verticalAlign');
                result = value === 'baseline' || !isNaN(parseFloat(value));
            }
            else {
                result = false;
            }
            this._cache.baseline = result;
        }
        return result;
    }

    get verticalAlign() {
        let result = this._cache.verticalAlign;
        if (result === undefined) {
            const value = this.css('verticalAlign');
            if (value !== 'baseline' && this.pageFlow && (this.actualParent?.flexElement !== true) && isNaN(result = asPx(value))) {
                if (isLength(value)) {
                    result = this.parseUnit(value);
                }
                else if (this.styleElement) {
                    let valid: Undef<boolean>;
                    switch (value) {
                        case 'baseline':
                            break;
                        case 'text-top':
                            if (this.imageElement || this.svgElement) {
                                break;
                            }
                        case 'sub':
                        case 'super':
                        case 'text-bottom':
                        case 'middle':
                        case 'top':
                        case 'bottom':
                            valid = true;
                            break;
                        default:
                            valid = isPercent(value);
                            break;
                    }
                    if (valid && this.cssTry('verticalAlign', 'baseline')) {
                        const bounds = this.boundingClientRect;
                        if (bounds) {
                            result = bounds.top - this.bounds.top;
                        }
                        this.cssFinally('verticalAlign');
                    }
                }
            }
            return this._cache.verticalAlign = result || 0;
        }
        return result;
    }

    get textBounds() {
        let result = this._cacheState.textBounds;
        if (result === undefined) {
            if (this.naturalChild) {
                if (this.textElement) {
                    result = getRangeClientRect(this._element as Element);
                }
                else if (!this.isEmpty()) {
                    let top = Infinity,
                        right = -Infinity,
                        bottom = -Infinity,
                        left = Infinity,
                        numberOfLines = 0;
                    const children = this.naturalChildren;
                    for (let i = 0, length = children.length; i < length; ++i) {
                        const node = children[i];
                        if (node.textElement) {
                            const rect = node.textBounds;
                            if (rect) {
                                numberOfLines += rect.numberOfLines || (top === Infinity || rect.top >= bottom || Math.floor(rect.right - rect.left) > Math.ceil(rect.width) ? 1 : 0);
                                top = Math.min(rect.top, top);
                                right = Math.max(rect.right, right);
                                left = Math.min(rect.left, left);
                                bottom = Math.max(rect.bottom, bottom);
                            }
                        }
                    }
                    if (numberOfLines) {
                        result = {
                            top,
                            right,
                            left,
                            bottom,
                            width: right - left,
                            height: bottom - top,
                            numberOfLines
                        };
                    }
                }
            }
            return this._cacheState.textBounds = result || null;
        }
        return result;
    }

    get multiline() {
        const result = this._cache.multiline;
        return result === undefined ? this._cache.multiline = (this.plainText || this.styleElement && this.inlineText && (this.inline || this.naturalElements.length === 0 || isInlineVertical(this.display) || this.floating || !this.pageFlow)) && this.textBounds?.numberOfLines as number > 1 : result;
    }

    get backgroundColor(): string {
        let result = this._cache.backgroundColor;
        if (result === undefined) {
            if (!this.plainText) {
                if (isTransparent(result = this.css('backgroundColor')) && !this.buttonElement) {
                    result = '';
                }
                else if (result === 'currentcolor') {
                    result = this.style.backgroundColor;
                }
            }
            else {
                result = '';
            }
            this._cache.backgroundColor = result;
        }
        return result;
    }

    get backgroundImage() {
        let result = this._cache.backgroundImage;
        if (result === undefined) {
            if (!this.plainText) {
                result = this.css('backgroundImage');
                if (result === 'none') {
                    result = '';
                }
            }
            else {
                result = '';
            }
            this._cache.backgroundImage = result;
        }
        return result;
    }

    get containerHeight() {
        let result = this._cache.containerHeight;
        if (result === undefined) {
            if (this.pageFlow) {
                result = this.actualParent?.hasHeight === true;
            }
            else if (this.positionFixed) {
                result = true;
            }
            else {
                const parent = this.absoluteParent;
                result = !!parent && (parent.hasHeight || parent.naturalChildren.some(item => item.pageFlow && item.bounds.height > 0));
            }
            this._cache.containerHeight = result;
        }
        return result;
    }

    get percentWidth() {
        const result = this._cache.percentWidth;
        if (result === undefined) {
            let value = asPercent(this.valueOf('width'));
            if (value > 0) {
                const min = asPercent(this.valueOf('minWidth'));
                const max = asPercent(this.valueOf('maxWidth'));
                if (!isNaN(min)) {
                    value = Math.max(value, min);
                }
                if (!isNaN(max)) {
                    value = Math.min(value, max);
                }
            }
            else {
                value = 0;
            }
            return this._cache.percentWidth = value;
        }
        return result;
    }
    get percentHeight() {
        const result = this._cache.percentHeight;
        if (result === undefined) {
            let value = asPercent(this.valueOf('height'));
            if (value > 0 && this.containerHeight) {
                const min = asPercent(this.valueOf('minHeight'));
                const max = asPercent(this.valueOf('maxHeight'));
                if (!isNaN(min)) {
                    value = Math.max(value, min);
                }
                if (!isNaN(max)) {
                    value = Math.min(value, max);
                }
            }
            else {
                value = 0;
            }
            return this._cache.percentHeight = value;
        }
        return result;
    }

    get visibleStyle() {
        let result = this._cache.visibleStyle;
        if (result === undefined) {
            if (!this.plainText) {
                const borderWidth = this.borderTopWidth > 0 || this.borderRightWidth > 0 || this.borderBottomWidth > 0 || this.borderLeftWidth > 0;
                const backgroundColor = this.backgroundColor !== '';
                const backgroundImage = this.backgroundImage !== '';
                const background = backgroundColor || borderWidth || backgroundImage;
                const borderRadius = (background || this.imageElement || this.svgElement) && this.css('borderRadius') !== '0px';
                let backgroundRepeatX = false,
                    backgroundRepeatY = false;
                if (backgroundImage) {
                    splitSome(this.css('backgroundRepeat'), value => {
                        const [repeatX, repeatY] = splitPair(value, ' ');
                        if (repeatX === 'repeat') {
                            backgroundRepeatX = true;
                            backgroundRepeatY = true;
                            return true;
                        }
                        if (repeatX === 'repeat-x') {
                            backgroundRepeatX = true;
                        }
                        if (repeatX === 'repeat-y' || repeatY === 'repeat') {
                            backgroundRepeatY = true;
                        }
                    });
                }
                result = {
                    background: background || borderRadius,
                    borderWidth,
                    borderRadius,
                    backgroundImage,
                    backgroundColor,
                    backgroundRepeat: backgroundRepeatX || backgroundRepeatY,
                    backgroundRepeatX,
                    backgroundRepeatY,
                    outline: this.outlineWidth > 0
                };
            }
            else {
                result = {} as VisibleStyle;
            }
            this._cache.visibleStyle = result;
        }
        return result;
    }

    get absoluteParent() {
        let result = this._cacheState.absoluteParent;
        if (result === undefined) {
            result = this.actualParent;
            if (!this.pageFlow && !this.documentBody) {
                while (result && result.css('position') === 'static' && !result.documentBody) {
                    result = result.actualParent;
                }
            }
            this._cacheState.absoluteParent = result;
        }
        return result;
    }

    get actualParent() {
        return this._actualParent;
    }

    get wrapperOf(): Null<T> {
        let result = this._cacheState.wrapperOf;
        if (result === undefined) {
            let node = this as T;
            do {
                if (node.size()) {
                    const children = node.children.filter(item => item.pageFlow);
                    if (children.length === 1) {
                        node = children[0];
                    }
                    else {
                        result = null;
                        break;
                    }
                }
                else {
                    result = node === this ? null : node;
                    break;
                }
            }
            while (true);
            this._cacheState.wrapperOf = result;
        }
        return result;
    }

    get actualWidth() {
        let result = this._cache.actualWidth;
        if (result === undefined) {
            if (this.plainText) {
                const bounds = this.bounds;
                switch (bounds.numberOfLines || 1) {
                    case 1:
                        result = bounds.width;
                        break;
                    case 2:
                        result = Math.min(bounds.width, this.actualParent!.box.width);
                        break;
                    default:
                        result = Math.min(bounds.right - bounds.left, this.actualParent!.box.width);
                        break;
                }
            }
            else {
                let parent: Null<T>;
                if (!(this.inlineStatic && !this.valueOf('width') || this.display === 'table-cell' || this.bounds.width && (parent = this.actualParent) && parent.flexElement && parent.flexdata.row) && (result = this.width) && this.contentBox && !this.tableElement) {
                    result += this.contentBoxWidth;
                }
            }
            return this._cache.actualWidth = result || this.bounds.width;
        }
        return result;
    }

    get actualHeight() {
        let result = this._cache.actualHeight;
        if (result === undefined) {
            let parent: Null<T>;
            if (!(this.inlineStatic && !this.valueOf('height') || this.display === 'table-cell' || this.bounds.height && (parent = this.actualParent) && parent.flexElement && parent.flexdata.column) && (result = this.height) && this.contentBox && !this.tableElement) {
                result += this.contentBoxHeight;
            }
            return this._cache.actualHeight = result || this.bounds.height;
        }
        return result;
    }

    get actualDimension() {
        return { width: this.actualWidth, height: this.actualHeight };
    }

    get depth() {
        return this._depth;
    }

    get childIndex() {
        return this._childIndex;
    }

    get naturalChildren() {
        return this._naturalChildren ||= this.toArray();
    }

    get naturalElements() {
        return this._naturalElements ||= this.naturalChildren.filter((item: T) => item.naturalElement);
    }

    get firstChild(): Null<T> {
        return this.naturalChildren[0] || null;
    }

    get lastChild(): Null<T> {
        return lastItemOf(this.naturalChildren) || null;
    }

    get firstElementChild(): Null<T> {
        return this.naturalElements[0] || null;
    }

    get lastElementChild(): Null<T> {
        return lastItemOf(this.naturalElements) || null;
    }

    get previousSibling(): Null<T> {
        return this.actualParent?.naturalChildren[this.childIndex - 1] || null;
    }

    get nextSibling(): Null<T> {
        return this.actualParent?.naturalChildren[this.childIndex + 1] || null;
    }

    get previousElementSibling(): Null<T> {
        const children = this.actualParent?.naturalElements;
        if (children) {
            const index = children.indexOf(this);
            if (index > 0) {
                return children[index - 1];
            }
        }
        return null;
    }

    get nextElementSibling(): Null<T> {
        const children = this.actualParent?.naturalElements;
        if (children) {
            const index = children.indexOf(this);
            if (index !== -1) {
                return children[index + 1] || null;
            }
        }
        return null;
    }

    get attributes() {
        let result = this._cacheState.attributes;
        if (result === undefined) {
            result = {};
            if (this.styleElement) {
                const attributes = this._element!.attributes;
                for (let i = 0, length = attributes.length; i < length; ++i) {
                    const item = attributes[i];
                    result[item.name] = item.value;
                }
            }
            this._cacheState.attributes = result;
        }
        return result;
    }

    get checked() {
        switch (this.tagName) {
            case 'INPUT': {
                const element = this._element as HTMLInputElement;
                switch (element.type) {
                    case 'radio':
                    case 'checkbox':
                        return element.checked;
                }
                break;
            }
            case 'OPTION':
                return this.parentElement?.tagName === 'SELECT' && Array.from((this.parentElement as HTMLSelectElement).selectedOptions).includes(this._element as HTMLOptionElement);
        }
        return false;
    }

    get boundingClientRect() {
        if (this.naturalElement) {
            return this._element!.getBoundingClientRect();
        }
        else if (this.plainText && this.naturalChild) {
            const rect = getRangeClientRect(this._element!) as DOMRect;
            rect.x = rect.left;
            rect.y = rect.top;
            return rect;
        }
        return null;
    }

    get preserveWhiteSpace() {
        let result = this._cache.preserveWhiteSpace;
        if (result === undefined) {
            switch (this.css('whiteSpace')) {
                case 'pre':
                case 'pre-wrap':
                case 'break-spaces':
                    result = true;
                    break;
            }
            return this._cache.preserveWhiteSpace = !!result;
        }
        return result;
    }

    get fontSize(): number {
        let result = this._cache.fontSize;
        if (result === undefined) {
            if (this.naturalChild) {
                if (this.styleElement) {
                    const fixed = isFixedFont(this);
                    let value = convertFontSize(this.valueOf('fontSize'), fixed);
                    if (isNaN(result = asPx(value)) && !isNaN(result = asPercent(value))) {
                        const parent = this.actualParent;
                        if (parent) {
                            result *= parent.fontSize;
                            if (fixed && !isFixedFont(parent)) {
                                result *= 13 / getRemSize();
                            }
                        }
                        else {
                            result = getRemSize(fixed);
                        }
                    }
                    else {
                        let emRatio = 1;
                        if (REGEXP_EM.test(value)) {
                            emRatio = safeFloat(value);
                            value = 'inherit';
                        }
                        if (value === 'inherit') {
                            let parent = this.actualParent;
                            if (parent) {
                                do {
                                    if (parent.tagName === 'HTML') {
                                        value = '1rem';
                                        break;
                                    }
                                    else {
                                        const fontSize = parent.valueOf('fontSize');
                                        if (fontSize && fontSize !== 'inherit') {
                                            const n = asPercent(value = convertFontSize(fontSize));
                                            if (!isNaN(n)) {
                                                emRatio *= n;
                                            }
                                            else if (REGEXP_EM.test(value)) {
                                                emRatio *= safeFloat(value);
                                            }
                                            else {
                                                break;
                                            }
                                        }
                                        parent = parent.actualParent;
                                    }
                                }
                                while (parent);
                            }
                            else {
                                value = '1rem';
                            }
                        }
                        result = (endsWith(value, 'rem') ? safeFloat(value, 3) * getRemSize(fixed) : parseUnit(value, { fixedWidth: fixed })) * emRatio;
                    }
                }
                else {
                    result = this.actualParent!.fontSize;
                }
            }
            else {
                const options = { fixedWidth: isFixedFont(this) };
                result = parseUnit(this.css('fontSize'), options) || ((this.ascend({ condition: item => item.fontSize > 0 })[0] as Undef<T>)?.fontSize ?? parseUnit('1rem', options));
            }
            this._cache.fontSize = result;
        }
        return result;
    }

    get style() {
        return this._style ||= this.styleElement ? !this.pseudoElt ? getStyle(this._element!) : getStyle(getParentElement(this._element!)!, this.pseudoElt) : PROXY_INLINESTYLE;
    }

    get cssStyle() {
        return this._elementData ? { ...this._elementData.styleMap } : {};
    }

    get textStyle() {
        let result = this._cache.textStyle;
        if (result === undefined) {
            result = this.cssAsObject(...TEXT_STYLE);
            result.fontSize = 'inherit';
            result.lineHeight = 'inherit';
            this._cache.textStyle = result;
        }
        return result;
    }

    get dir(): string {
        let result = this._cacheState.dir;
        if (result === undefined) {
            result = this.naturalElement ? (this._element as HTMLElement).dir : '';
            if (!result) {
                let parent = this.actualParent;
                while (parent) {
                    if (result = parent.dir) {
                        break;
                    }
                    parent = parent.actualParent;
                }
            }
            this._cacheState.dir = result;
        }
        return result;
    }

    get elementData() {
        return this._elementData;
    }

    get initial() {
        return this._initial;
    }
}