type T = Node;

const { USER_AGENT, isUserAgent } = squared.lib.client;
const { CSS_PROPERTIES, CSS_TRAITS, CSS_UNIT, PROXY_INLINESTYLE, SVG_PROPERTIES, checkFontSizeValue, checkStyleValue, checkWritingMode, formatPX, getRemSize, getStyle, isAngle, isLength, isPercent, isTime, parseSelectorText, parseUnit } = squared.lib.css;
const { assignRect, getNamedItem, getRangeClientRect, newBoxRectDimension } = squared.lib.dom;
const { CSS, FILE } = squared.lib.regex;
const { getElementData, getElementAsNode, getElementCache, setElementCache } = squared.lib.session;
const { convertCamelCase, convertFloat, convertInt, hasBit, hasValue, isNumber, isObject, iterateArray, iterateReverseArray, spliceString, splitEnclosing, splitPair } = squared.lib.util;

const { SELECTOR_ATTR, SELECTOR_G, SELECTOR_LABEL, SELECTOR_PSEUDO_CLASS } = CSS;

const enum STYLE_CACHE {
    FAIL,
    READY,
    CHANGED
}
const TEXT_STYLE = [
    'fontFamily',
    'fontWeight',
    'fontStyle',
    'fontVariant',
    'fontStretch',
    'color',
    'whiteSpace',
    'textDecoration',
    'textTransform',
    'letterSpacing',
    'wordSpacing'
];

const BORDER_TOP = CSS_PROPERTIES.borderTop.value as string[];
const BORDER_RIGHT = CSS_PROPERTIES.borderRight.value as string[];
const BORDER_BOTTOM = CSS_PROPERTIES.borderBottom.value as string[];
const BORDER_LEFT = CSS_PROPERTIES.borderLeft.value as string[];

const REGEXP_EM = /\dem$/;
const REGEXP_BACKGROUND = /\s*(url|[a-z-]+gradient)/;
const REGEXP_QUERYNTH = /^:nth(-last)?-(child|of-type)\((.+)\)$/;
const REGEXP_QUERYNTHPOSITION = /^(-)?(\d+)?n\s*([+-]\d+)?$/;

function setStyleCache(element: HTMLElement, attr: string, sessionId: string, value: string, current: string) {
    if (value !== current) {
        element.style.setProperty(attr, value);
        const newValue = element.style.getPropertyValue(attr);
        if (current !== newValue) {
            setElementCache(element, attr, sessionId, value !== 'auto' ? current : '');
            return STYLE_CACHE.CHANGED;
        }
        return STYLE_CACHE.FAIL;
    }
    return STYLE_CACHE.READY;
}

function parseLineHeight(lineHeight: string, fontSize: number) {
    if (isPercent(lineHeight)) {
        return parseFloat(lineHeight) / 100 * fontSize;
    }
    else if (isNumber(lineHeight)) {
        return parseFloat(lineHeight) * fontSize;
    }
    return parseUnit(lineHeight, { fontSize });
}

function isFontFixedWidth(node: T) {
    const [fontFirst, fontSecond] = splitPair(node.css('fontFamily'), ',', true);
    return fontFirst.toLowerCase() === 'monospace' && !(fontSecond !== '' && fontSecond.toLowerCase() === 'monospace');
}

function getFlexValue(node: T, attr: string, fallback: number, parent?: Null<Node>): number {
    const value = (parent || node).css(attr);
    return isNumber(value) ? parseFloat(value) : fallback;
}

function hasTextAlign(node: T, ...values: string[]) {
    const value = node.cssAscend('textAlign', { startSelf: node.textElement && node.blockStatic && !node.hasPX('width', { initial: true }) });
    return value !== '' && values.includes(value) && (node.blockStatic ? node.textElement && !node.hasPX('width', { initial: true }) && !node.hasPX('maxWidth', { initial: true }) : node.display.startsWith('inline'));
}

function setDimension(node: T, styleMap: StringMap, attr: DimensionAttr) {
    const options: NodeParseUnitOptions = { dimension: attr };
    const value = styleMap[attr];
    const min = styleMap[attr === 'width' ? 'minWidth' : 'minHeight'];
    const baseValue = value ? node.parseUnit(value, options) : 0;
    let result = Math.max(baseValue, min ? node.parseUnit(min, options) : 0);
    if (result === 0 && node.styleElement) {
        const element = node.element as HTMLInputElement;
        switch (element.tagName) {
            case 'IMG':
            case 'INPUT':
                if (element.type !== 'image') {
                    break;
                }
            case 'TD':
            case 'TH':
            case 'SVG':
            case 'IFRAME':
            case 'VIDEO':
            case 'AUDIO':
            case 'CANVAS':
            case 'OBJECT':
            case 'EMBED': {
                const size = getNamedItem(element, attr);
                if (size !== '') {
                    result = isNumber(size) ? parseFloat(size) : node.parseUnit(size, options);
                    if (result) {
                        node.css(attr, isPercent(size) ? size : size + 'px');
                    }
                }
                break;
            }
        }
    }
    if (baseValue && !node.imageElement) {
        const attrMax = attr === 'width' ? 'maxWidth' : 'maxHeight';
        const max = styleMap[attrMax];
        if (max) {
            if (value === max) {
                delete styleMap[attrMax];
            }
            else {
                const maxValue = node.parseUnit(max, { dimension: attr });
                if (maxValue) {
                    if (maxValue <= baseValue && value && isLength(value)) {
                        styleMap[attr] = max;
                        delete styleMap[attrMax];
                    }
                    else {
                        return Math.min(result, maxValue);
                    }
                }
            }
        }
    }
    return result;
}

function convertBorderWidth(node: T, dimension: DimensionAttr, border: string[]) {
    if (!node.plainText) {
        switch (node.css(border[1])) {
            case 'none':
            case 'hidden':
                return 0;
        }
        const width = node.css(border[0]);
        if (width !== '') {
            let result: number;
            switch (width) {
                case 'thin':
                    result = 1;
                    break;
                case 'medium':
                    result = 3;
                    break;
                case 'thick':
                    result = 5;
                    break;
                default:
                    result = isLength(width, true) ? node.parseUnit(width, { dimension }) : convertFloat(node.style[border[0]]);
                    break;
            }
            if (result) {
                return Math.max(Math.round(result), 1);
            }
        }
    }
    return 0;
}

function convertBox(node: T, attr: string, margin: boolean) {
    switch (node.display) {
        case 'table':
            if (!margin && node.css('borderCollapse') === 'collapse') {
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
                        const parent = node.ascend({ condition: item => item.tagName === 'TABLE' })[0];
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
    return node.parseUnit(node.css(attr), node.actualParent?.gridElement ? { parent: false } : undefined);
}

function convertPosition(node: T, attr: string) {
    if (!node.positionStatic) {
        const unit = node.valueOf(attr, { modified: true });
        if (unit.endsWith('px')) {
            return parseFloat(unit);
        }
        else if (isPercent(unit)) {
            return node.styleElement ? convertFloat(node.style[attr]) : 0;
        }
        return node.parseUnit(unit, attr === 'top' || attr === 'bottom' ? { dimension: 'height' } : undefined);
    }
    return 0;
}

function validateQuerySelector(node: T, child: T, selector: QueryData, last: boolean, adjacent?: string) {
    if (selector.all) {
        return true;
    }
    else if (selector.tagName && selector.tagName !== child.tagName.toUpperCase() || selector.id && selector.id !== child.elementId) {
        return false;
    }
    const { attrList, classList, notList, pseudoList } = selector;
    if (pseudoList) {
        const { actualParent: parent, tagName } = child;
        for (let i = 0, length = pseudoList.length; i < length; ++i) {
            const pseudo = pseudoList[i];
            switch (pseudo) {
                case ':first-child':
                case ':nth-child(1)':
                    if (child !== parent!.firstChild) {
                        return false;
                    }
                    break;
                case ':last-child':
                case ':nth-last-child(1)':
                    if (child !== parent!.lastChild) {
                        return false;
                    }
                    break;
                case ':only-child':
                    if (parent!.naturalElements.length > 1) {
                        return false;
                    }
                    break;
                case ':only-of-type': {
                    const children = parent!.naturalElements;
                    for (let j = 0, k = 0, q = children.length; j < q; ++j) {
                        if (children[j].tagName === tagName && ++k > 1) {
                            return false;
                        }
                    }
                    break;
                }
                case ':first-of-type': {
                    const children = parent!.naturalElements;
                    for (let j = 0, q = children.length; j < q; ++j) {
                        const item = children[j];
                        if (item.tagName === tagName) {
                            if (item !== child) {
                                return false;
                            }
                            break;
                        }
                    }
                    break;
                }
                case ':nth-child(n)':
                case ':nth-last-child(n)':
                    break;
                case ':empty':
                    if ((child.element as HTMLElement).childNodes.length) {
                        return false;
                    }
                    break;
                case ':checked':
                    switch (tagName) {
                        case 'INPUT':
                            if (!child.toElementBoolean('checked')) {
                                return false;
                            }
                            break;
                        case 'OPTION':
                            if (!child.toElementBoolean('selected')) {
                                return false;
                            }
                            break;
                        default:
                            return false;
                    }
                    break;
                case ':enabled':
                    if (!child.inputElement || child.toElementBoolean('disabled', true)) {
                        return false;
                    }
                    break;
                case ':disabled':
                    if (!child.inputElement || !child.toElementBoolean('disabled')) {
                        return false;
                    }
                    break;
                case ':read-only': {
                    const element = child.element as HTMLInputElement | HTMLTextAreaElement;
                    if (element.isContentEditable || (tagName === 'INPUT' || tagName === 'TEXTAREA') && !element.readOnly) {
                        return false;
                    }
                    break;
                }
                case ':read-write': {
                    const element = child.element as HTMLInputElement | HTMLTextAreaElement;
                    if (!element.isContentEditable || (tagName === 'INPUT' || tagName === 'TEXTAREA') && element.readOnly) {
                        return false;
                    }
                    break;
                }
                case ':required':
                    if (!child.inputElement || tagName === 'BUTTON' || !child.toElementBoolean('required')) {
                        return false;
                    }
                    break;
                case ':optional':
                    if (!child.inputElement || tagName === 'BUTTON' || child.toElementBoolean('required', true)) {
                        return false;
                    }
                    break;
                case ':placeholder-shown':
                    if (!((tagName === 'INPUT' || tagName === 'TEXTAREA') && child.toElementString('placeholder') !== '')) {
                        return false;
                    }
                    break;
                case ':default':
                    switch (tagName) {
                        case 'INPUT': {
                            const element = child.element as HTMLInputElement;
                            switch (element.type) {
                                case 'radio':
                                case 'checkbox':
                                    if (!element.checked) {
                                        return false;
                                    }
                                    break;
                                default:
                                    return false;
                            }
                            break;
                        }
                        case 'OPTION':
                            if ((child.element as HTMLOptionElement).attributes['selected'] === undefined) {
                                return false;
                            }
                            break;
                        case 'BUTTON': {
                            const form = child.ascend({ condition: item => item.tagName === 'FORM' })[0];
                            if (form) {
                                let valid: Undef<boolean>;
                                const element = child.element as HTMLElement;
                                iterateArray(form.element!.querySelectorAll('*'), (item: HTMLInputElement) => {
                                    switch (item.tagName) {
                                        case 'BUTTON':
                                            valid = element === item;
                                            return true;
                                        case 'INPUT':
                                            switch (item.type) {
                                                case 'submit':
                                                case 'image':
                                                    valid = element === item;
                                                    return true;
                                            }
                                            break;
                                    }
                                });
                                if (!valid) {
                                    return false;
                                }
                            }
                            break;
                        }
                        default:
                            return false;
                    }
                    break;
                case ':in-range':
                case ':out-of-range':
                    if (tagName === 'INPUT') {
                        const element = child.element as HTMLInputElement;
                        const value = parseFloat(element.value);
                        if (!isNaN(value)) {
                            const min = parseFloat(element.min);
                            const max = parseFloat(element.max);
                            if (value >= min && value <= max) {
                                if (pseudo === ':out-of-range') {
                                    return false;
                                }
                            }
                            else if (pseudo === ':in-range') {
                                return false;
                            }
                        }
                        else if (pseudo === ':in-range') {
                            return false;
                        }
                    }
                    else {
                        return false;
                    }
                    break;
                case ':indeterminate':
                    if (tagName === 'INPUT') {
                        const element = child.element as HTMLInputElement;
                        switch (element.type) {
                            case 'checkbox':
                                if (!element.indeterminate) {
                                    return false;
                                }
                                break;
                            case 'radio':
                                if (element.checked || element.name && iterateArray((child.ascend({ condition: item => item.tagName === 'FORM' })[0]?.element || document).querySelectorAll(`input[type=radio][name="${element.name}"`), (item: HTMLInputElement) => item.checked) === Infinity) {
                                    return false;
                                }
                                break;
                            default:
                                return false;
                        }
                    }
                    else if (tagName === 'PROGRESS') {
                        if (child.toElementInt('value', -1) !== -1) {
                            return false;
                        }
                    }
                    else {
                        return false;
                    }
                    break;
                case ':target':
                    if (location.hash === '') {
                        return false;
                    }
                    else if (!(location.hash === `#${child.elementId}` || tagName === 'A' && location.hash === `#${child.toElementString('name')}`)) {
                        return false;
                    }
                    break;
                case ':scope':
                    if (!last || adjacent === '>' && child !== node) {
                        return false;
                    }
                    break;
                case ':root':
                    if (!last && node.tagName !== 'HTML') {
                        return false;
                    }
                    break;
                case ':link':
                case ':visited':
                case ':any-link':
                case ':hover':
                case ':focus':
                case ':focus-within':
                case ':valid':
                case ':invalid': {
                    const element = child.element;
                    if (iterateArray((parent!.element as HTMLElement).querySelectorAll(':scope > ' + pseudo), item => item === element) !== Infinity) {
                        return false;
                    }
                    break;
                }
                default: {
                    let match = REGEXP_QUERYNTH.exec(pseudo);
                    if (match) {
                        const placement = match[3].trim();
                        let children = parent!.naturalElements;
                        if (match[1]) {
                            children = children.slice(0).reverse();
                        }
                        const index = match[2] === 'child' ? children.indexOf(child) + 1 : children.filter((item: T) => item.tagName === tagName).indexOf(child) + 1;
                        if (index) {
                            if (isNumber(placement)) {
                                if (parseInt(placement) !== index) {
                                    return false;
                                }
                            }
                            else {
                                switch (placement) {
                                    case 'even':
                                        if (index % 2 !== 0) {
                                            return false;
                                        }
                                        break;
                                    case 'odd':
                                        if (index % 2 === 0) {
                                            return false;
                                        }
                                        break;
                                    default: {
                                        const subMatch = REGEXP_QUERYNTHPOSITION.exec(placement);
                                        if (subMatch) {
                                            const modifier = convertInt(subMatch[3]);
                                            if (subMatch[2]) {
                                                if (subMatch[1]) {
                                                    return false;
                                                }
                                                const increment = parseInt(subMatch[2]);
                                                if (increment !== 0) {
                                                    if (index !== modifier) {
                                                        for (let j = increment; ; j += increment) {
                                                            const total = increment + modifier;
                                                            if (total === index) {
                                                                break;
                                                            }
                                                            else if (total > index) {
                                                                return false;
                                                            }
                                                        }
                                                    }
                                                }
                                                else if (index !== modifier) {
                                                    return false;
                                                }
                                            }
                                            else if (subMatch[3]) {
                                                if (modifier > 0) {
                                                    if (subMatch[1]) {
                                                        if (index > modifier) {
                                                            return false;
                                                        }
                                                    }
                                                    else if (index < modifier) {
                                                        return false;
                                                    }
                                                }
                                                else {
                                                    return false;
                                                }
                                            }
                                        }
                                        break;
                                    }
                                }
                            }
                            continue;
                        }
                    }
                    else if (child.attributes['lang']) {
                        match = /^:lang\((.+)\)$/.exec(pseudo);
                        if (match && child.attributes['lang'].trim().toLowerCase() === match[1].trim().toLowerCase()) {
                            continue;
                        }
                    }
                    return false;
                }
            }
        }
    }
    if (notList) {
        for (let i = 0, length = notList.length; i < length; ++i) {
            const not = notList[i];
            const notData: QueryData = {};
            switch (not[0]) {
                case '.':
                    notData.classList = [not];
                    break;
                case '#':
                    notData.id = not.substring(1);
                    break;
                case ':':
                    notData.pseudoList = [not];
                    break;
                case '[': {
                    const match = SELECTOR_ATTR.exec(not);
                    if (match) {
                        const caseInsensitive = match[6] === 'i';
                        let value = match[3] || match[4] || match[5] || '';
                        if (caseInsensitive) {
                            value = value.toLowerCase();
                        }
                        notData.attrList = [{
                            key: match[1],
                            symbol: match[2],
                            value,
                            caseInsensitive
                        }];
                        SELECTOR_ATTR.lastIndex = 0;
                    }
                    else {
                        continue;
                    }
                    break;
                }
                default:
                    if (/^[a-z\d+#.-]+$/i.test(not)) {
                        notData.tagName = not;
                    }
                    else {
                        return false;
                    }
                    break;
            }
            if (validateQuerySelector(node, child, notData, last)) {
                return false;
            }
        }
    }
    if (classList) {
        const elementList = (child.element as HTMLElement).classList;
        for (let i = 0, length = classList.length; i < length; ++i) {
            if (!elementList.contains(classList[i])) {
                return false;
            }
        }
    }
    if (attrList) {
        const attributes = child.attributes;
        for (let i = 0, length = attrList.length; i < length; ++i) {
            const attr = attrList[i];
            let value: Undef<string>;
            if (attr.endsWith) {
                const pattern = new RegExp(`^(?:.+:)?${attr.key}$`);
                for (const name in attributes) {
                    if (pattern.test(name)) {
                        value = attributes[name];
                        break;
                    }
                }
            }
            else {
                value = attributes[attr.key];
            }
            if (!value) {
                return false;
            }
            else {
                const valueAlt = attr.value;
                if (valueAlt) {
                    if (attr.caseInsensitive) {
                        value = value.toLowerCase();
                    }
                    if (attr.symbol) {
                        switch (attr.symbol) {
                            case '~':
                                if (!value.split(/\s+/).includes(valueAlt)) {
                                    return false;
                                }
                                break;
                            case '^':
                                if (!value.startsWith(valueAlt)) {
                                    return false;
                                }
                                break;
                            case '$':
                                if (!value.endsWith(valueAlt)) {
                                    return false;
                                }
                                break;
                            case '*':
                                if (!value.includes(valueAlt)) {
                                    return false;
                                }
                                break;
                            case '|':
                                if (value !== valueAlt && !value.startsWith(valueAlt + '-')) {
                                    return false;
                                }
                                break;
                        }
                    }
                    else if (value !== valueAlt) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
}

function ascendQuerySelector(node: T, selectors: QueryData[], i: number, j: number, nodes: T[], adjacent: Undef<string>): boolean {
    const depth = node.depth;
    const selector = selectors[j];
    const length = selectors.length;
    const last = j === length - 1;
    const next: T[] = [];
    for (let k = 0, q = nodes.length; k < q; ++k) {
        const child = nodes[k];
        if (adjacent) {
            const parent = child.actualParent!;
            if (adjacent === '>') {
                if (validateQuerySelector(node, parent, selector, last, adjacent)) {
                    next.push(parent);
                }
            }
            else {
                const children = parent.naturalElements;
                switch (adjacent) {
                    case '+': {
                        const l = children.indexOf(child) - 1;
                        if (l >= 0) {
                            const sibling = children[l];
                            if (validateQuerySelector(node, sibling, selector, last, adjacent)) {
                                next.push(sibling);
                            }
                        }
                        break;
                    }
                    case '~': {
                        for (let l = 0, r = children.length; l < r; ++l) {
                            const sibling = children[l];
                            if (sibling === child) {
                                break;
                            }
                            else if (validateQuerySelector(node, sibling, selector, last, adjacent)) {
                                next.push(sibling);
                            }
                        }
                        break;
                    }
                }
            }
        }
        else if (child.depth - depth >= length - j) {
            let parent = child.actualParent;
            while (parent) {
                if (validateQuerySelector(node, parent, selector, last)) {
                    next.push(parent);
                }
                parent = parent.actualParent;
            }
        }
    }
    if (next.length === 0) {
        return false;
    }
    return ++j === length ? true : ascendQuerySelector(node, selectors, i, j, next, selector.adjacent);
}

const aboveRange = (a: number, b: number, offset = 1) => a + offset > b;
const belowRange = (a: number, b: number, offset = 1) => a - offset < b;
const sortById = (a: T, b: T) => a.id - b.id;
const isInlineVertical = (value: string) => value.startsWith('inline') || value === 'table-cell';
const canTextAlign = (node: T) => node.naturalChild && (node.length === 0 || isInlineVertical(node.display)) && !node.floating && node.autoMargin.horizontal !== true;

export default class Node extends squared.lib.base.Container<T> implements squared.base.Node {
    public static sanitizeCss(element: StyleElement, styleMap: StringMap, writingMode?: string) {
        const result: StringMap = {};
        for (let attr in styleMap) {
            let value = styleMap[attr]!;
            const alias = checkWritingMode(attr, writingMode);
            if (alias !== '') {
                if (!styleMap[alias]) {
                    attr = alias;
                }
                else {
                    continue;
                }
            }
            value = checkStyleValue(element, attr, value);
            if (value !== '') {
                result[attr] = value;
            }
        }
        return result;
    }

    public documentRoot = false;
    public depth = -1;
    public queryMap?: T[][];

    protected _parent: Null<T> = null;
    protected _cache: CacheValue = {};
    protected _cacheState: CacheState<T> = {};
    protected _preferInitial = false;
    protected _styleMap!: StringMap;
    protected _bounds: Null<BoxRectDimension> = null;
    protected _box: Null<BoxRectDimension> = null;
    protected _linear: Null<BoxRectDimension> = null;
    protected _textBounds?: Null<BoxRectDimension>;
    protected _initial?: InitialData<T>;
    protected _cssStyle?: StringMap;
    protected _naturalChildren?: T[];
    protected _naturalElements?: T[];
    protected _childIndex = Infinity;
    protected readonly _element: Null<Element> = null;

    private _elementData: Null<ElementData>;
    private _style?: CSSStyleDeclaration;
    private _dataset?: DOMStringMap;
    private _pseudoElt?: PseudoElt;
    private _data?: StandardMap;

    constructor(
        public readonly id: number,
        public sessionId = '0',
        element?: Element,
        children?: T[])
    {
        super(children);
        if (element) {
            this._element = element;
            if (sessionId !== '0') {
                setElementCache(element, 'node', sessionId, this);
                const elementData = getElementData(element, sessionId);
                if (elementData) {
                    this._elementData = elementData;
                    if (!this.syncWith(sessionId)) {
                        this._styleMap = {};
                    }
                    return;
                }
            }
        }
        this._styleMap = {};
        this._elementData = null;
    }

    public init(parent: T, depth: number, index?: number) {
        this._parent = parent;
        this.depth = depth;
        if (index !== undefined) {
            this.childIndex = index;
        }
    }

    public syncWith(sessionId?: string, cache?: boolean) {
        const element = this._element as HTMLElement;
        if (element) {
            let elementData: UndefNull<ElementData>;
            if (!sessionId) {
                sessionId = getElementCache(element, 'sessionId', '0');
                if (sessionId === this.sessionId) {
                    if (cache) {
                        this._cache = {};
                    }
                    return true;
                }
                else if (!sessionId) {
                    return false;
                }
                else {
                    elementData = getElementData(element, sessionId);
                    if (elementData) {
                        this._elementData = elementData;
                    }
                }
            }
            else {
                elementData = this._elementData;
            }
            if (elementData) {
                const styleMap: Undef<StringMap> = elementData.styleMap;
                if (styleMap) {
                    if (this.styleElement) {
                        if (!this.pseudoElement) {
                            const items = Array.from(element.style);
                            const length = items.length;
                            if (length) {
                                for (let i = 0; i < length; ++i) {
                                    const attr = items[i];
                                    styleMap[convertCamelCase(attr)] = element.style.getPropertyValue(attr);
                                }
                            }
                        }
                        else {
                            this._pseudoElt = elementData.pseudoElt;
                        }
                        this._styleMap = Node.sanitizeCss(element, styleMap, styleMap.writingMode);
                    }
                    else {
                        this._styleMap = styleMap;
                    }
                    this._cssStyle = styleMap;
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
            styleMap: { ...this._styleMap },
            bounds: this._bounds,
            children: this.length ? this.toArray() : undefined
        };
    }

    public data<T = unknown>(name: string, attr: string, value?: any, overwrite = true): Undef<T> {
        const data = this._data ?? (this._data = {});
        if (value === null) {
            if (data[name]) {
                delete data[name][attr];
            }
            return;
        }
        else if (value !== undefined) {
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
            return stored[attr] as T;
        }
    }

    public unsetCache(...attrs: string[]) {
        const length = attrs.length;
        if (length) {
            const cache = this._cache;
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
                        break;
                    case 'width':
                        cache.actualWidth = undefined;
                        cache.percentWidth = undefined;
                    case 'minWidth':
                        cache.width = undefined;
                        break;
                    case 'height':
                        cache.actualHeight = undefined;
                        cache.percentHeight = undefined;
                    case 'minHeight':
                        cache.height = undefined;
                        if (!this._preferInitial) {
                            this.unsetCache('blockVertical');
                            this.each(item => item.unsetCache());
                        }
                        break;
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
                    case 'whiteSpace':
                        cache.preserveWhiteSpace = undefined;
                        cache.textStyle = undefined;
                        this._cacheState.textEmpty = undefined;
                        continue;
                    default:
                        if (attr.startsWith('margin')) {
                            cache.autoMargin = undefined;
                            cache.rightAligned = undefined;
                            cache.centerAligned = undefined;
                            cache.bottomAligned = undefined;
                        }
                        else if (attr.startsWith('padding')) {
                            cache.contentBoxWidth = undefined;
                            cache.contentBoxHeight = undefined;
                        }
                        else if (attr.startsWith('border')) {
                            cache.visibleStyle = undefined;
                            cache.contentBoxWidth = undefined;
                            cache.contentBoxHeight = undefined;
                        }
                        else if (attr.startsWith('background')) {
                            cache.visibleStyle = undefined;
                        }
                        else if (TEXT_STYLE.includes(attr)) {
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
            if (attrs.some(value => hasBit(CSS_PROPERTIES[value].trait, CSS_TRAITS.LAYOUT))) {
                parent = this.pageFlow && this.ascend({ condition: item => item.documentRoot })[0] || this;
            }
            else if (attrs.some(value => hasBit(CSS_PROPERTIES[value].trait, CSS_TRAITS.CONTAIN))) {
                parent = this;
            }
            else {
                return;
            }
            parent.resetBounds();
            const queryMap = parent.queryMap;
            if (queryMap) {
                for (let i = 0, q = queryMap.length; i < q; ++i) {
                    const children = queryMap[i];
                    for (let j = 0, r = children.length; j < r; ++j) {
                        children[j].resetBounds();
                    }
                }
            }
            else {
                this.cascade(item => item.resetBounds());
            }
        }
    }

    public unsetState(...attrs: string[]) {
        let reset: Undef<boolean>;
        const length = attrs.length;
        if (length) {
            const cacheState = this._cacheState;
            for (let i = 0; i < length; ++i) {
                const attr = attrs[i];
                if (attr in cacheState) {
                    switch (attr) {
                        case 'actualParent':
                            cacheState.absoluteParent = undefined;
                            reset = true;
                            break;
                        case 'absoluteParent':
                            reset = true;
                            break;
                        case 'textContent':
                            cacheState.textEmpty = undefined;
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
            attr: Undef<string>,
            startSelf: Undef<boolean>;
        if (options) {
            ({ condition, error, every, including, excluding, attr, startSelf } = options);
        }
        if (!attr) {
            attr = 'actualParent';
        }
        else if (attr !== 'parent' && !attr.endsWith('Parent')) {
            return [];
        }
        const result: T[] = [];
        let parent: Null<T> = startSelf ? this : this[attr];
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
        let invalid: Undef<boolean>;
        const recurse = (parent: T) => {
            let result: T[] = [];
            const children = parent.naturalElements;
            for (let i = 0, length = children.length; i < length; ++i) {
                const item = children[i];
                if (error && error(item) || item === excluding) {
                    invalid = true;
                    break;
                }
                if (condition) {
                    if (condition(item)) {
                        result.push(item);
                        if (!every || item === including) {
                            invalid = true;
                            break;
                        }
                    }
                }
                else {
                    result.push(item);
                    if (item === including) {
                        invalid = true;
                        break;
                    }
                }
                if (item instanceof Node && !item.isEmpty) {
                    result = result.concat(recurse(item));
                    if (invalid) {
                        break;
                    }
                }
            }
            return result;
        };
        return recurse(this);
    }

    public intersectX(rect: BoxRectDimension, options?: CoordsXYOptions) {
        if (rect.width) {
            const { left, right } = this[options?.dimension || 'linear'];
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
            const { top, bottom } = this[options?.dimension || 'linear'];
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

    public css(attr: string, value?: string, cache = true): string {
        if (value && this.styleElement) {
            const previousValue = this.style[attr];
            this.style[attr] = value;
            if (previousValue !== this.style[attr]) {
                this._styleMap[attr] = value;
                if (cache) {
                    this.unsetCache(attr);
                }
                return value;
            }
        }
        return this._styleMap[attr] as string || this.naturalChild && this.style[attr] as string || '';
    }

    public cssApply(values: StringMap, overwrite = true, cache = true) {
        if (overwrite) {
            for (const attr in values) {
                this.css(attr, values[attr], cache);
            }
        }
        else {
            const styleMap = this._styleMap;
            for (const attr in values) {
                if (!styleMap[attr]) {
                    this.css(attr, values[attr], cache);
                }
            }
        }
        return this;
    }

    public cssParent(attr: string, value?: string, cache = false) {
        return this.actualParent?.css(attr, value, cache) || '';
    }

    public cssInitial(attr: string, options?: CssInitialOptions) {
        return (this._initial?.styleMap || this._styleMap)[attr] || options && (options.modified && this._styleMap[attr] as string || options.computed && this.style[attr] as string) || '';
    }

    public cssAscend(attr: string, options?: CssAscendOptions) {
        let parent = options && options.startSelf ? this : this.actualParent,
            value: string;
        while (parent) {
            value = parent.valueOf(attr, options);
            if (value !== '' && value !== 'inherit') {
                return value;
            }
            parent = parent.actualParent;
        }
        return '';
    }

    public cssAny(attr: string, values: string[], options?: CssAnyOptions) {
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

    public cssSort(attr: string, options?: CssSortOptions) {
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
            else if (ascending !== false) {
                return valueA < valueB ? -1 : 1;
            }
            return valueA > valueB ? -1 : 1;
        });
    }

    public cssPX(attr: string, value: number, cache?: boolean, options?: CssPXOptions) {
        const current = this._styleMap[attr];
        if (current && isLength(current)) {
            value += parseUnit(current, { fontSize: this.fontSize });
            if (value < 0 && (!options || !options.negative)) {
                value = 0;
            }
            const unit = formatPX(value);
            this.css(attr, unit);
            if (cache) {
                this.unsetCache(attr);
            }
            return unit;
        }
        return '';
    }

    public cssSpecificity(attr: string) {
        let value: Undef<number>;
        if (this.styleElement) {
            const styleData = !this._pseudoElt ? this._elementData?.['styleSpecificity'] : this.actualParent?.elementData?.['styleSpecificity' + this._pseudoElt] as Undef<ObjectMap<number>>;
            if (styleData) {
                value = styleData[attr];
            }
        }
        return value || 0;
    }

    public cssTry(attr: string, value: string, callback?: FunctionSelf<this>) {
        if (this.styleElement) {
            const element = this._element as HTMLElement;
            if (setStyleCache(element, attr, this.sessionId, value, (!this.pseudoElement ? this.style : getStyle(element)).getPropertyValue(attr))) {
                if (callback) {
                    callback.call(this, attr);
                    this.cssFinally(attr);
                }
                return true;
            }
        }
        return false;
    }

    public cssTryAll(values: StringMap, callback?: FunctionSelf<this>) {
        if (this.styleElement) {
            const result: StringMap = {};
            const sessionId = this.sessionId;
            const element = this._element as HTMLElement;
            const style = !this.pseudoElement ? this.style : getStyle(element);
            for (const attr in values) {
                const value = values[attr]!;
                switch (setStyleCache(element, attr, sessionId, value, style.getPropertyValue(attr))) {
                    case STYLE_CACHE.FAIL:
                        this.cssFinally(result);
                        return false;
                    case STYLE_CACHE.READY:
                        continue;
                    case STYLE_CACHE.CHANGED:
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

    public cssFinally(attrs: string | StringMap) {
        if (this.styleElement) {
            const element = this._element as HTMLElement;
            const elementData = this._elementData;
            if (elementData) {
                if (typeof attrs === 'string') {
                    const value = elementData[attrs] as Undef<string>;
                    if (value) {
                        element.style.setProperty(attrs, value);
                    }
                }
                else {
                    for (const attr in attrs) {
                        const value = elementData[attr] as Undef<string>;
                        if (value) {
                            element.style.setProperty(attr, value);
                        }
                    }
                }
            }
        }
    }

    public cssCopy(node: T, ...attrs: string[]) {
        const styleMap = this._styleMap;
        for (let i = 0, length = attrs.length; i < length; ++i) {
            const attr = attrs[i];
            styleMap[attr] = node.css(attr);
        }
    }

    public cssCopyIfEmpty(node: T, ...attrs: string[]) {
        const styleMap = this._styleMap;
        for (let i = 0, length = attrs.length; i < length; ++i) {
            const attr = attrs[i];
            if (!styleMap[attr]) {
                styleMap[attr] = node.css(attr);
            }
        }
    }

    public cssAsTuple(...attrs: string[]) {
        const length = attrs.length;
        const result: string[] = new Array(length);
        for (let i = 0; i < length; ++i) {
            result[i] = this.css(attrs[i]);
        }
        return result;
    }

    public cssAsObject(...attrs: string[]) {
        const result: StringMap = {};
        for (let i = 0, length = attrs.length; i < length; ++i) {
            const attr = attrs[i];
            result[attr] = this.css(attr);
        }
        return result;
    }

    public cssPseudoElement(name: PseudoElt, attr?: string) {
        if (this.naturalElement) {
            if (attr) {
                return getStyle(this._element!, name)[attr] as Undef<string>;
            }
            else {
                const styleMap = this._elementData!['styleMap' + name] as Undef<StringMap>;
                if (styleMap) {
                    switch (name) {
                        case '::first-letter':
                        case '::first-line':
                            switch (this.display) {
                                case 'block':
                                case 'inline-block':
                                case 'list-item':
                                case 'table-cell':
                                    break;
                                default:
                                    return;
                            }
                        case '::before':
                        case '::after':
                            return Node.sanitizeCss(this._element as HTMLElement, styleMap, styleMap.writingMode || this.cssInitial('writingMode'));
                    }
                }
            }
        }
    }

    public toInt(attr: string, fallback = NaN, initial?: boolean) {
        return convertInt((initial && this._initial?.styleMap || this._styleMap)[attr]!, fallback);
    }

    public toFloat(attr: string, fallback = NaN, initial?: boolean) {
        return convertFloat((initial && this._initial?.styleMap || this._styleMap)[attr]!, fallback);
    }

    public toElementInt(attr: string, fallback = NaN) {
        return this.naturalElement ? convertInt(this._element![attr], fallback) : fallback;
    }

    public toElementFloat(attr: string, fallback = NaN) {
        return this.naturalElement ? convertFloat(this._element![attr], fallback) : fallback;
    }

    public toElementBoolean(attr: string, fallback = false) {
        if (this.naturalElement) {
            const value: UndefNull<boolean> = this._element![attr];
            if (value !== undefined && value !== null) {
                return !!value;
            }
        }
        return fallback;
    }

    public toElementString(attr: string, fallback = '') {
        if (this.naturalElement) {
            const value: UndefNull<string> = this._element![attr];
            if (value !== undefined && value !== null) {
                return value.toString();
            }
        }
        return fallback;
    }

    public parseUnit(value: string, options?: NodeParseUnitOptions) {
        if (value === '') {
            return 0;
        }
        else if (value.endsWith('px')) {
            return parseFloat(value);
        }
        else if (isPercent(value)) {
            const bounds: BoxRectDimension = (!options || options.parent !== false) && this.absoluteParent?.box || this.bounds;
            return (parseFloat(value) / 100) * bounds[options && options.dimension || 'width'];
        }
        if (!options) {
            options = { fontSize: this.fontSize };
        }
        else if (options.fontSize === undefined) {
            options.fontSize = this.fontSize;
        }
        return parseUnit(value, options);
    }

    public has(attr: string, options?: HasOptions) {
        const value = options && options.initial ? this.cssInitial(attr, options) : this._styleMap[attr];
        if (value) {
            let not: Undef<string | string[]>,
                type: Undef<number>,
                ignoreDefault: Undef<boolean>;
            if (options) {
                ({ not, type, ignoreDefault } = options);
            }
            if (ignoreDefault !== true) {
                const data = options && options.map === 'svg' ? SVG_PROPERTIES[attr] : CSS_PROPERTIES[attr];
                if (data && (value === data.value || hasBit(data.trait, CSS_TRAITS.UNIT) && parseFloat(value) === parseFloat(data.value as string))) {
                    return false;
                }
            }
            if (not) {
                if (value === not) {
                    return false;
                }
                else if (Array.isArray(not)) {
                    for (let i = 0, length = not.length; i < length; ++i) {
                        if (value === not[i]) {
                            return false;
                        }
                    }
                }
            }
            if (type) {
                return (
                    hasBit(type, CSS_UNIT.LENGTH) && isLength(value) ||
                    hasBit(type, CSS_UNIT.PERCENT) && isPercent(value) ||
                    hasBit(type, CSS_UNIT.TIME) && isTime(value) ||
                    hasBit(type, CSS_UNIT.ANGLE) && isAngle(value)
                );
            }
            return true;
        }
        return false;
    }

    public hasPX(attr: string, options?: HasPXOptions) {
        let percent: Undef<boolean>,
            initial: Undef<boolean>;
        if (options) {
            ({ percent, initial } = options);
        }
        const value = initial ? this.cssInitial(attr, options) : this._styleMap[attr];
        return !!value && isLength(value, percent !== false);
    }

    public setBounds(cache = true) {
        let bounds: Null<BoxRectDimension>;
        if (this.styleElement) {
            bounds = assignRect(cache && this._elementData?.clientRect || this._element!.getBoundingClientRect());
            this._bounds = bounds;
        }
        else if (this.plainText) {
            const rect = getRangeClientRect(this._element!);
            if (rect) {
                this._textBounds = rect;
                this._cache.multiline = rect.numberOfLines! > 1;
            }
            bounds = rect || newBoxRectDimension();
            this._bounds = bounds;
        }
        else {
            return null;
        }
        if (!cache) {
            this._box = null;
            this._linear = null;
        }
        return bounds;
    }

    public resetBounds(recalibrate?: boolean) {
        if (!recalibrate) {
            this._bounds = null;
            this._textBounds = undefined;
            this._cache.multiline = undefined;
        }
        this._box = null;
        this._linear = null;
    }

    public min(attr: string, options?: MinMaxOptions) {
        let self: Undef<boolean>,
            last: Undef<boolean>,
            wrapperOf: Undef<boolean>,
            initial: Undef<boolean>;
        if (options) {
            ({ self, last, wrapperOf, initial } = options);
        }
        let result: Undef<T>,
            min = Infinity;
        this.each(item => {
            if (wrapperOf) {
                const child = item.wrapperOf;
                if (child) {
                    item = child;
                }
            }
            const value = parseFloat(self ? item[attr] as string : initial ? item.cssInitial(attr, options) : item.css(attr));
            if (last) {
                if (value <= min) {
                    result = item;
                    min = value;
                }
            }
            else if (value < min) {
                result = item;
                min = value;
            }
        });
        return result || this;
    }

    public max(attr: string, options?: MinMaxOptions) {
        let self: Undef<boolean>,
            last: Undef<boolean>,
            wrapperOf: Undef<boolean>,
            initial: Undef<boolean>;
        if (options) {
            ({ self, last, wrapperOf, initial } = options);
        }
        let result: Undef<T>,
            max = -Infinity;
        this.each(item => {
            if (wrapperOf) {
                const child = item.wrapperOf;
                if (child) {
                    item = child;
                }
            }
            const value = parseFloat(self ? item[attr] as string : initial ? item.cssInitial(attr, options) : item.css(attr));
            if (last) {
                if (value >= max) {
                    result = item;
                    max = value;
                }
            }
            else if (value > max) {
                result = item;
                max = value;
            }
        });
        return result || this;
    }

    public querySelector(value: string) {
        return this.querySelectorAll(value, undefined, 1)[0] || null;
    }

    public querySelectorAll(value: string, customMap?: T[][], resultCount = -1) {
        const queryMap = customMap || this.queryMap;
        let result: T[] = [];
        if (queryMap && resultCount !== 0) {
            const queries = parseSelectorText(value);
            for (let i = 0, length = queries.length; i < length; ++i) {
                const query = queries[i];
                const selectors: QueryData[] = [];
                let offset = -1;
                if (query === '*') {
                    selectors.push({ all: true });
                    ++offset;
                }
                else {
                    invalid: {
                        let segment: string,
                            all: boolean,
                            adjacent: Undef<string>,
                            match: Null<RegExpExecArray>;
                        while (match = SELECTOR_G.exec(query)) {
                            segment = match[1];
                            all = false;
                            if (segment.length === 1) {
                                const ch = segment[0];
                                switch (ch) {
                                    case '+':
                                    case '~':
                                        --offset;
                                    case '>':
                                        if (adjacent || selectors.length === 0) {
                                            selectors.length = 0;
                                            break invalid;
                                        }
                                        adjacent = ch;
                                        continue;
                                    case '*':
                                        all = true;
                                        break;
                                }
                            }
                            else if (segment.startsWith('*|*')) {
                                if (segment.length > 3) {
                                    selectors.length = 0;
                                    break invalid;
                                }
                                all = true;
                            }
                            else if (segment.startsWith('*|')) {
                                segment = segment.substring(2);
                            }
                            else if (segment.startsWith('::')) {
                                selectors.length = 0;
                                break invalid;
                            }
                            if (all) {
                                selectors.push({ all: true });
                            }
                            else {
                                let tagName: Undef<string>,
                                    id: Undef<string>,
                                    classList: Undef<string[]>,
                                    attrList: Undef<QueryAttribute[]>,
                                    pseudoList: Undef<string[]>,
                                    notList: Undef<string[]>,
                                    subMatch: Null<RegExpExecArray>;
                                while (subMatch = SELECTOR_ATTR.exec(segment)) {
                                    if (!attrList) {
                                        attrList = [];
                                    }
                                    let key = subMatch[1].replace('\\:', ':'),
                                        endsWith = false;
                                    switch (key.indexOf('|')) {
                                        case -1:
                                            break;
                                        case 1:
                                            if (key[0] === '*') {
                                                endsWith = true;
                                                key = key.substring(2);
                                                break;
                                            }
                                        default:
                                            selectors.length = 0;
                                            break invalid;
                                    }
                                    const caseInsensitive = subMatch[6] === 'i';
                                    let attrValue = subMatch[3] || subMatch[4] || subMatch[5] || '';
                                    if (caseInsensitive) {
                                        attrValue = attrValue.toLowerCase();
                                    }
                                    attrList.push({
                                        key,
                                        symbol: subMatch[2],
                                        value: attrValue,
                                        endsWith,
                                        caseInsensitive
                                    });
                                    segment = spliceString(segment, subMatch.index, subMatch[0].length);
                                }
                                if (segment.includes('::')) {
                                    selectors.length = 0;
                                    break invalid;
                                }
                                while (subMatch = SELECTOR_PSEUDO_CLASS.exec(segment)) {
                                    const pseudoClass = subMatch[0];
                                    if (pseudoClass.startsWith(':not(')) {
                                        if (subMatch[1]) {
                                            if (!notList) {
                                                notList = [];
                                            }
                                            notList.push(subMatch[1]);
                                        }
                                    }
                                    else {
                                        if (!pseudoList) {
                                            pseudoList = [];
                                        }
                                        pseudoList.push(pseudoClass);
                                    }
                                    segment = spliceString(segment, subMatch.index, pseudoClass.length);
                                }
                                while (subMatch = SELECTOR_LABEL.exec(segment)) {
                                    const label = subMatch[0];
                                    switch (label[0]) {
                                        case '#':
                                            id = label.substring(1);
                                            break;
                                        case '.':
                                            if (!classList) {
                                                classList = [];
                                            }
                                            classList.push(label.substring(1));
                                            break;
                                        default:
                                            tagName = label.toUpperCase();
                                            break;
                                    }
                                    segment = spliceString(segment, subMatch.index, label.length);
                                }
                                selectors.push({
                                    tagName,
                                    id,
                                    adjacent,
                                    classList,
                                    pseudoList,
                                    notList,
                                    attrList
                                });
                            }
                            ++offset;
                            adjacent = undefined;
                        }
                    }
                    SELECTOR_G.lastIndex = 0;
                }
                if (customMap) {
                    offset = 0;
                }
                const q = queryMap.length;
                if (selectors.length && offset !== -1 && offset < q) {
                    const dataEnd = selectors.pop() as QueryData;
                    const lastEnd = selectors.length === 0;
                    const currentCount = result.length;
                    let pending: T[];
                    if (dataEnd.all && q - offset === 1) {
                        pending = queryMap[offset];
                    }
                    else {
                        pending = [];
                        for (let j = offset; j < q; ++j) {
                            const children = queryMap[j];
                            if (dataEnd.all) {
                                pending = pending.concat(children);
                            }
                            else {
                                for (let k = 0, r = children.length; k < r; ++k) {
                                    const node = children[k];
                                    if ((currentCount === 0 || !result.includes(node)) && validateQuerySelector(this, node, dataEnd, lastEnd)) {
                                        pending.push(node);
                                    }
                                }
                            }
                        }
                    }
                    if (selectors.length && (dataEnd.adjacent || resultCount !== -Infinity)) {
                        selectors.reverse();
                        let count = currentCount;
                        for (let j = 0, r = pending.length; j < r; ++j) {
                            const node = pending[j];
                            if ((currentCount === 0 || !result.includes(node)) && ascendQuerySelector(this, selectors, i, 0, [node], dataEnd.adjacent)) {
                                result.push(node);
                                if (++count === resultCount) {
                                    return result.sort(sortById);
                                }
                            }
                        }
                    }
                    else if (currentCount === 0) {
                        if (i === queries.length - 1 || resultCount > 0 && resultCount <= pending.length) {
                            if (resultCount > 0 && pending.length > resultCount) {
                                pending.length = resultCount;
                            }
                            return pending.sort(sortById);
                        }
                        else {
                            result = pending;
                        }
                    }
                    else {
                        const r = pending.length;
                        if (resultCount > 0) {
                            let count = currentCount;
                            for (let j = 0; j < r; ++j) {
                                const node = pending[j];
                                if (!result.includes(node)) {
                                    result.push(node);
                                    if (++count === resultCount) {
                                        return result.sort(sortById);
                                    }
                                }
                            }
                        }
                        else {
                            for (let j = 0; j < r; ++j) {
                                const node = pending[j];
                                if (!result.includes(node)) {
                                    result.push(node);
                                }
                            }
                        }
                    }
                }
            }
        }
        return result.sort(sortById);
    }

    public ancestors(value?: string, options?: AscendOptions<T>) {
        const result = this.ascend(options);
        if (value && result.length) {
            const customMap: T[][] = [];
            let depth = NaN;
            iterateReverseArray(result, (item: T) => {
                if (!isNaN(depth)) {
                    for (let i = item.depth - 1; i > depth; --i) {
                        customMap.push([]);
                    }
                }
                customMap.push([item]);
                depth = item.depth;
            });
            return this.querySelectorAll(value, customMap, -Infinity);
        }
        return result.sort(sortById);
    }

    public descendants(value?: string, options?: DescendOptions<T>) {
        if (this.naturalElements.length) {
            if (options || !this.queryMap) {
                const children: T[] = this.descend(options).filter(item => item.naturalElement);
                let length = children.length;
                if (value && length) {
                    const result: T[][] = [];
                    const depth = this.depth + 1;
                    let index: number;
                    for (let i = 0; i < length; ++i) {
                        const item = children[i];
                        index = item.depth - depth;
                        (result[index] || (result[index] = [])).push(item);
                    }
                    length = result.length;
                    for (let i = 0; i < length; ++i) {
                        if (result[i] === undefined) {
                            result[i] = [];
                        }
                    }
                    return this.querySelectorAll(value, result);
                }
                return children.sort(sortById);
            }
            return this.querySelectorAll(value || '*');
        }
        return [];
    }

    public siblings(value?: string, options?: SiblingsOptions<T>) {
        if (this.naturalElement) {
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
                iterateReverseArray(this.actualParent!.naturalElements, filterPredicate, 0, this.childIndex);
            }
            else {
                iterateArray(this.actualParent!.naturalElements, filterPredicate, this.childIndex + 1);
            }
            if (value) {
                const ancestors: T[] = this.ascend();
                const customMap: T[][] = [];
                iterateReverseArray(ancestors, (item: T) => {
                    customMap.push([item]);
                });
                customMap.push(result);
                result = this.querySelectorAll(value, customMap).filter(item => !ancestors.includes(item));
            }
            return reverse ? result.reverse() : result;
        }
        return [];
    }

    public valueOf(attr: string, options?: CssInitialOptions) {
        return !this._preferInitial && this._styleMap[attr] || this.cssInitial(attr, options);
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
            if (this.depth === -1) {
                this.depth = value.depth + 1;
            }
        }
    }
    get parent() {
        return this._parent;
    }

    get tagName() {
        const result = this._cache.tagName;
        if (result === undefined) {
            const element = this._element;
            return this._cache.tagName = element ? element.nodeName[0] === '#' ? element.nodeName : element.tagName : '';
        }
        return result;
    }

    get element() {
        return this._element;
    }

    get elementId() {
        return (this._element?.id || '').trim();
    }

    get htmlElement() {
        const result = this._cacheState.htmlElement;
        return result === undefined ? this._cacheState.htmlElement = this._element instanceof HTMLElement : result;
    }

    get svgElement() {
        const result = this._cacheState.svgElement;
        return result === undefined ? this._cacheState.svgElement = !this.plainText && (!this.htmlElement && this._element instanceof SVGElement || this.imageElement && FILE.SVG.test(this.toElementString('src'))) : result;
    }

    get styleElement() {
        return this.htmlElement || this.svgElement;
    }

    get naturalChild() { return true; }

    get naturalElement() {
        const result = this._cacheState.naturalElement;
        return result === undefined ? this._cacheState.naturalElement = this.naturalChild && this.styleElement && !this.pseudoElement : result;
    }

    get parentElement() {
        return this._element?.parentElement || this.actualParent?.element || null;
    }

    get textElement() {
        return this.plainText || this.inlineText && this.tagName !== 'BUTTON';
    }

    get pseudoElement() { return false; }

    get imageElement() {
        return this.tagName === 'IMG';
    }

    get flexElement() {
        return this.display.endsWith('flex');
    }

    get gridElement() {
        return this.display.endsWith('grid');
    }

    get tableElement() {
        return this.tagName === 'TABLE' || this.display === 'table';
    }

    get inputElement() {
        switch (this.tagName) {
            case 'INPUT':
            case 'BUTTON':
            case 'SELECT':
            case 'TEXTAREA':
                return true;
            default:
                return false;
        }
    }

    get plainText() {
        return this.tagName[0] === '#';
    }

    get styleText() {
        return this.naturalElement && this.inlineText;
    }

    get lineBreak() {
        return this.tagName === 'BR';
    }

    get display() {
        return this.css('display');
    }

    get positionRelative() {
        return this.css('position') === 'relative';
    }

    get floating() {
        return this.float !== 'none';
    }

    get float() {
        return this.pageFlow && this.css('float') || 'none';
    }

    get zIndex() {
        return this.toInt('zIndex', 0);
    }

    get textContent() {
        return this.naturalChild && !this.svgElement ? this._element!.textContent! : '';
    }

    get dataset(): DOMStringMap {
        return this._dataset || (this._dataset = this.styleElement ? (this._element as HTMLElement).dataset : {});
    }

    get documentBody() {
        return this._element === document.body;
    }

    get bounds() {
        return this._bounds || this.setBounds(false) || this.boundingClientRect as BoxRectDimension || newBoxRectDimension();
    }

    get linear() {
        if (!this._linear) {
            const bounds = this.bounds;
            if (bounds) {
                if (this.styleElement) {
                    const { marginBottom, marginRight } = this;
                    const marginTop = Math.max(this.marginTop, 0);
                    const marginLeft = Math.max(this.marginLeft, 0);
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
            const bounds = this.bounds;
            if (bounds) {
                if (this.styleElement && this.naturalChildren.length) {
                    return this._box = {
                        top: bounds.top + (this.paddingTop + this.borderTopWidth),
                        right: bounds.right - (this.paddingRight + this.borderRightWidth),
                        bottom: bounds.bottom - (this.paddingBottom + this.borderBottomWidth),
                        left: bounds.left + (this.paddingLeft + this.borderLeftWidth),
                        width: bounds.width - this.contentBoxWidth,
                        height: bounds.height - this.contentBoxHeight
                    };
                }
                return this._box = bounds;
            }
            return newBoxRectDimension();
        }
        return this._box;
    }

    get flexdata() {
        const result = this._cache.flexdata;
        if (result === undefined) {
            if (this.flexElement) {
                const { flexWrap, flexDirection, alignContent, justifyContent } = this.cssAsObject('flexWrap', 'flexDirection', 'alignContent', 'justifyContent') as StringMapChecked;
                const row = flexDirection.startsWith('row');
                return this._cache.flexdata = {
                    row,
                    column: !row,
                    reverse: flexDirection.endsWith('reverse'),
                    wrap: flexWrap.startsWith('wrap'),
                    wrapReverse: flexWrap === 'wrap-reverse',
                    alignContent,
                    justifyContent
                };
            }
            return this._cache.flexdata = {};
        }
        return result;
    }

    get flexbox() {
        const result = this._cache.flexbox;
        if (result === undefined) {
            if (this.styleElement && this.actualParent?.flexElement) {
                const [alignSelf, justifySelf, basis] = this.cssAsTuple('alignSelf', 'justifySelf', 'flexBasis');
                return this._cache.flexbox = {
                    alignSelf: alignSelf === 'auto' ? this.cssParent('alignItems') : alignSelf,
                    justifySelf: justifySelf === 'auto' ? this.cssParent('justifyItems') : justifySelf,
                    basis,
                    grow: getFlexValue(this, 'flexGrow', 0),
                    shrink: getFlexValue(this, 'flexShrink', 1),
                    order: this.toInt('order', 0)
                };
            }
            return this._cache.flexbox = {} as FlexBox;
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
        if (result === undefined) {
            const value = this.css('height');
            return this._cache.hasHeight = isPercent(value) ? this.pageFlow ? this.actualParent?.hasHeight || this.documentBody : this.css('position') === 'fixed' || this.hasPX('top') || this.hasPX('bottom') : this.height > 0 || this.hasPX('height', { percent: false });
        }
        return result;
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
                    let parent = this.ascend({ condition: item => item.has('lineHeight', { initial: true, not: 'inherit' }) })[0];
                    if (parent) {
                        value = parseLineHeight(parent.css('lineHeight'), this.fontSize);
                        if (value) {
                            if (parent !== this.actualParent || REGEXP_EM.test(this.valueOf('fontSize')) || this.multiline) {
                                this.css('lineHeight', value + 'px');
                            }
                            hasOwnStyle = true;
                        }
                    }
                    if (value === 0) {
                        parent = this.ascend({ condition: item => item.lineHeight > 0 })[0];
                        if (parent) {
                            value = parent.lineHeight;
                        }
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
            switch (this.css('position')) {
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
        return result === undefined ? this._cache.contentBoxWidth = this.tableElement && this.css('borderCollapse') === 'collapse' ? 0 : this.borderLeftWidth + this.paddingLeft + this.paddingRight + this.borderRightWidth : result;
    }

    get contentBoxHeight() {
        const result = this._cache.contentBoxHeight;
        return result === undefined ? this._cache.contentBoxHeight = this.tableElement && this.css('borderCollapse') === 'collapse' ? 0 : this.borderTopWidth + this.paddingTop + this.paddingBottom + this.borderBottomWidth : result;
    }

    get inline() {
        const result = this._cache.inline;
        return result === undefined ? this._cache.inline = this.display === 'inline' : result;
    }

    get inlineStatic() {
        const result = this._cache.inlineStatic;
        return result === undefined ? this._cache.inlineStatic = this.inline && this.pageFlow && !this.floating && !this.imageElement : result;
    }

    set inlineText(value) {
        switch (this.tagName) {
            case 'IMG':
            case 'INPUT':
            case 'SELECT':
            case 'TEXTAREA':
            case 'SVG':
            case 'BR':
            case 'HR':
            case 'PROGRESS':
            case 'METER':
            case 'CANVAS':
                this._cacheState.inlineText = false;
                break;
            case 'BUTTON':
                this._cacheState.inlineText = this.textContent.trim() !== '';
                break;
            default:
                this._cacheState.inlineText = value;
                break;
        }
    }
    get inlineText() {
        return this._cacheState.inlineText ?? false;
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
                    if (this.tagName === 'svg' && this.actualParent!.htmlElement) {
                        result = !this.hasPX('width') && convertFloat(getNamedItem(this._element as SVGSVGElement, 'width')) === 0;
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
        const result = this._cache.blockStatic;
        if (result === undefined) {
            const pageFlow = this.pageFlow;
            if (pageFlow && (this.block && !this.floating || this.lineBreak)) {
                return this._cache.blockStatic = true;
            }
            else if (!pageFlow || !this.inline && !this.display.startsWith('table-') && !this.hasPX('maxWidth')) {
                const width = this.valueOf('width');
                const minWidth = this.valueOf('minWidth');
                let percent = 0;
                if (isPercent(width)) {
                    percent = parseFloat(width);
                }
                if (isPercent(minWidth)) {
                    percent = Math.max(parseFloat(minWidth), percent);
                }
                if (percent) {
                    const marginLeft = this.valueOf('marginLeft');
                    const marginRight = this.valueOf('marginRight');
                    return this._cache.blockStatic = percent + (isPercent(marginLeft) ? Math.max(0, parseFloat(marginLeft)) : 0) + (isPercent(marginRight) ? parseFloat(marginRight) : 0) >= 100;
                }
            }
            return this._cache.blockStatic = false;
        }
        return result;
    }

    get pageFlow() {
        const result = this._cache.pageFlow;
        return result === undefined ? this._cache.pageFlow = this.positionStatic || this.positionRelative || this.lineBreak : result;
    }

    get centerAligned() {
        const result = this._cache.centerAligned;
        return result === undefined ? this._cache.centerAligned = !this.pageFlow ? this.hasPX('left') && this.hasPX('right') : this.autoMargin.leftRight || canTextAlign(this) && hasTextAlign(this, 'center') : result;
    }

    get rightAligned() {
        const result = this._cache.rightAligned;
        return result === undefined ? this._cache.rightAligned = !this.pageFlow ? this.hasPX('right') && !this.hasPX('left') : this.float === 'right' || this.autoMargin.left || canTextAlign(this) && hasTextAlign(this, 'right', this.dir === 'rtl' ? 'start' : 'end') : result;
    }

    get bottomAligned() {
        const result = this._cache.bottomAligned;
        return result === undefined ? this._cache.bottomAligned = !this.pageFlow ? this.hasPX('bottom') && !this.hasPX('top') : this.actualParent?.hasHeight === true && this.autoMargin.top === true : result;
    }

    get autoMargin() {
        const result = this._cache.autoMargin;
        if (result === undefined) {
            if (!this.pageFlow || this.blockStatic || this.display === 'table') {
                const styleMap = this._styleMap;
                const left = styleMap.marginLeft === 'auto' && (this.pageFlow || this.hasPX('right'));
                const right = styleMap.marginRight === 'auto' && (this.pageFlow || this.hasPX('left'));
                const top = styleMap.marginTop === 'auto' && (this.pageFlow || this.hasPX('bottom'));
                const bottom = styleMap.marginBottom === 'auto' && (this.pageFlow || this.hasPX('top'));
                return this._cache.autoMargin = {
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
            return this._cache.autoMargin = {};
        }
        return result;
    }

    get baseline() {
        const result = this._cache.baseline;
        if (result === undefined) {
            if (this.pageFlow && !this.floating && !this.tableElement) {
                const display = this.display;
                if (display.startsWith('inline') || display === 'list-item') {
                    const verticalAlign = this.css('verticalAlign');
                    return this._cache.baseline = verticalAlign === 'baseline' || isLength(verticalAlign, true);
                }
            }
            return this._cache.baseline = false;
        }
        return result;
    }

    get verticalAlign() {
        let result = this._cache.verticalAlign;
        if (result === undefined) {
            if (this.pageFlow) {
                const value = this.css('verticalAlign');
                if (value.endsWith('px')) {
                    result = parseFloat(value);
                }
                else if (isLength(value)) {
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
                    if (valid && this.cssTry('vertical-align', 'baseline')) {
                        const bounds = this.boundingClientRect;
                        if (bounds) {
                            result = bounds.top - this.bounds.top;
                        }
                        this.cssFinally('vertical-align');
                    }
                }
            }
            return this._cache.verticalAlign = result || 0;
        }
        return result;
    }

    set textBounds(value) {
        this._textBounds = value;
    }
    get textBounds() {
        const result = this._textBounds;
        if (result === undefined) {
            if (this.naturalChild) {
                if (this.textElement) {
                    return this._textBounds = getRangeClientRect(this._element as Element);
                }
                else if (this.length) {
                    const children = this.naturalChildren;
                    const length = children.length;
                    if (length) {
                        let top = Infinity,
                            right = -Infinity,
                            bottom = -Infinity,
                            left = Infinity,
                            numberOfLines = 0;
                        for (let i = 0; i < length; ++i) {
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
                            return this._textBounds = {
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
            }
            return this._textBounds = null;
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
                result = this.css('backgroundColor');
                switch (result) {
                    case 'transparent':
                    case 'rgba(0, 0, 0, 0)':
                        if (this.inputElement) {
                            if (this.tagName !== 'BUTTON') {
                                switch (this.toElementString('type')) {
                                    case 'button':
                                    case 'submit':
                                    case 'reset':
                                    case 'image':
                                        break;
                                    default:
                                        result = '';
                                        break;
                                }
                            }
                        }
                        else {
                            result = '';
                        }
                        break;
                    default:
                        if (result !== '' && this.styleElement && this.pageFlow && !this.inputElement && this.css('opacity') === '1') {
                            let parent = this.actualParent;
                            while (parent && !REGEXP_BACKGROUND.test(parent.css('background'))) {
                                const backgroundImage = parent.valueOf('backgroundImage');
                                if (backgroundImage === '' || backgroundImage === 'none') {
                                    const color = parent.backgroundColor;
                                    if (color !== '') {
                                        if (color === result && parent.css('opacity') === '1') {
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
                        }
                        break;
                }
            }
            return this._cache.backgroundColor = result || '';
        }
        return result;
    }

    get backgroundImage() {
        let result = this._cache.backgroundImage;
        if (result === undefined) {
            result = '';
            if (!this.plainText) {
                let value = this.css('backgroundImage');
                if (value !== '' && value !== 'none') {
                    result = value;
                }
                else {
                    value = this.css('background');
                    if (REGEXP_BACKGROUND.test(value)) {
                        const background = splitEnclosing(value);
                        for (let i = 1, length = background.length; i < length; ++i) {
                            const name = background[i - 1].trim();
                            if (REGEXP_BACKGROUND.test(name)) {
                                result += (result !== '' ? ', ' : '') + name + background[i];
                            }
                        }
                    }
                }
            }
            this._cache.backgroundImage = result;
        }
        return result;
    }

    get percentWidth() {
        const result = this._cache.percentWidth;
        if (result === undefined) {
            const value = this.valueOf('width');
            return this._cache.percentWidth = isPercent(value) ? parseFloat(value) / 100 : 0;
        }
        return result;
    }
    get percentHeight() {
        const result = this._cache.percentHeight;
        if (result === undefined) {
            const value = this.valueOf('height');
            return this._cache.percentHeight = isPercent(value) && (this.actualParent?.hasHeight || this.css('position') === 'fixed') ? parseFloat(value) / 100 : 0;
        }
        return result;
    }

    get visibleStyle() {
        const result = this._cache.visibleStyle;
        if (result === undefined) {
            if (!this.plainText) {
                const borderWidth = this.borderTopWidth > 0 || this.borderRightWidth > 0 || this.borderBottomWidth > 0 || this.borderLeftWidth > 0;
                const backgroundColor = this.backgroundColor !== '';
                const backgroundImage = this.backgroundImage !== '';
                let backgroundRepeatX = false,
                    backgroundRepeatY = false;
                if (backgroundImage) {
                    for (const repeat of this.css('backgroundRepeat').split(',')) {
                        const [repeatX, repeatY] = splitPair(repeat.trim(), ' ');
                        if (!backgroundRepeatX) {
                            backgroundRepeatX = repeatX === 'repeat' || repeatX === 'repeat-x';
                        }
                        if (!backgroundRepeatY) {
                            backgroundRepeatY = repeatX === 'repeat' || repeatX === 'repeat-y' || repeatY === 'repeat';
                        }
                    }
                }
                return this._cache.visibleStyle = {
                    background: borderWidth || backgroundImage || backgroundColor,
                    borderWidth,
                    backgroundImage,
                    backgroundColor,
                    backgroundRepeat: backgroundRepeatX || backgroundRepeatY,
                    backgroundRepeatX,
                    backgroundRepeatY
                };
            }
            return this._cache.visibleStyle = {} as VisibleStyle;
        }
        return result;
    }

    get absoluteParent() {
        let result = this._cacheState.absoluteParent;
        if (result === undefined) {
            result = this.actualParent;
            if (!this.pageFlow && !this.documentBody) {
                while (result && result.valueOf('position', { computed: true }) === 'static' && !result.documentBody) {
                    result = result.actualParent;
                }
            }
            this._cacheState.absoluteParent = result;
        }
        return result;
    }

    set actualParent(value) {
        this._cacheState.actualParent = value;
    }
    get actualParent() {
        const result = this._cacheState.actualParent;
        if (result === undefined) {
            const parentElement = this.element?.parentElement;
            return this._cacheState.actualParent = parentElement && getElementAsNode<T>(parentElement, this.sessionId) || this.parent;
        }
        return result;
    }

    get wrapperOf() {
        let node = this as T;
        do {
            switch (node.length) {
                case 0:
                    return node === this ? null : node;
                case 1:
                    node = node.children[0];
                    break;
                default:
                    return null;
            }
        }
        while (true);
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
            else if (this.inlineStatic || this.display === 'table-cell' || this.actualParent?.flexdata.row === true) {
                result = this.bounds.width;
            }
            else {
                result = this.width;
                if (result) {
                    if (this.contentBox && !this.tableElement) {
                        result += this.contentBoxWidth;
                    }
                }
                else {
                    result = this.bounds.width;
                }
            }
            this._cache.actualWidth = result;
        }
        return result;
    }

    get actualHeight() {
        let result = this._cache.actualHeight;
        if (result === undefined) {
            if (this.inlineStatic || this.display === 'table-cell' || this.actualParent?.flexdata.column === true) {
                result = this.bounds.height;
            }
            else {
                result = this.height;
                if (result) {
                    if (this.contentBox && !this.tableElement) {
                        result += this.contentBoxHeight;
                    }
                }
                else {
                    result = this.bounds.height;
                }
            }
            this._cache.actualHeight = result;
        }
        return result;
    }

    get actualDimension() {
        return { width: this.actualWidth, height: this.actualHeight };
    }

    set childIndex(value) {
        this._childIndex = value;
    }
    get childIndex() {
        return this._childIndex;
    }

    set naturalChildren(value) {
        this._naturalChildren = value;
    }
    get naturalChildren() {
        return this._naturalChildren || (this._naturalChildren = this.toArray());
    }

    set naturalElements(value) {
        this._naturalElements = value;
    }
    get naturalElements() {
        return this._naturalElements || (this._naturalElements = this.naturalChildren.filter((item: T) => item.naturalElement));
    }

    get firstChild(): Null<T> {
        return this.naturalElements[0] || null;
    }

    get lastChild(): Null<T> {
        const children = this.naturalElements;
        return children[children.length - 1] || null;
    }

    get previousSibling() {
        return this.actualParent?.naturalChildren[this.childIndex - 1] || null;
    }

    get nextSibling() {
        return this.actualParent?.naturalChildren[this.childIndex + 1] || null;
    }

    get previousElementSibling() {
        const children = this.actualParent?.naturalElements;
        if (children) {
            const index = children.indexOf(this);
            if (index > 0) {
                return children[index - 1];
            }
        }
        return null;
    }

    get nextElementSibling() {
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
                    const item = attributes.item(i) as Attr;
                    result[item.name] = item.value;
                }
            }
            this._cacheState.attributes = result;
        }
        return result;
    }

    get boundingClientRect() {
        if (this.styleElement) {
            return this._element!.getBoundingClientRect();
        }
        const bounds = this._bounds || this.setBounds(false);
        if (bounds) {
            const domRect = assignRect(bounds) as DOMRect;
            domRect.x = domRect.left;
            domRect.y = domRect.top;
            return domRect;
        }
        return null;
    }

    get preserveWhiteSpace() {
        const result = this._cache.preserveWhiteSpace;
        if (result === undefined) {
            switch (this.css('whiteSpace')) {
                case 'pre':
                case 'pre-wrap':
                case 'break-spaces':
                    return this._cache.preserveWhiteSpace = true;
                default:
                    return this._cache.preserveWhiteSpace = false;
            }
        }
        return result;
    }

    get fontSize(): number {
        let result = this._cache.fontSize;
        if (result === undefined) {
            if (this.naturalChild) {
                if (this.styleElement) {
                    const fixedWidth = isFontFixedWidth(this);
                    let value = checkFontSizeValue(this.valueOf('fontSize'), fixedWidth),
                        emRatio = 1;
                    if (REGEXP_EM.test(value)) {
                        emRatio *= parseFloat(value);
                        value = 'inherit';
                    }
                    if (value === 'inherit') {
                        let parent: Null<T> = this.actualParent;
                        if (parent) {
                            do {
                                if (parent.tagName === 'HTML') {
                                    value = '1rem';
                                    break;
                                }
                                else {
                                    const fontSize = parent.valueOf('fontSize');
                                    if (fontSize !== '' && fontSize !== 'inherit') {
                                        value = checkFontSizeValue(fontSize);
                                        if (isPercent(value)) {
                                            emRatio *= parseFloat(value) / 100;
                                        }
                                        else if (REGEXP_EM.test(value)) {
                                            emRatio *= parseFloat(value);
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
                    if (value === '1rem') {
                        result = getRemSize(fixedWidth);
                    }
                    else if (value.endsWith('px')) {
                        result = parseFloat(value);
                    }
                    else if (isPercent(value)) {
                        const parent = this.actualParent;
                        result = parent ? parseFloat(value) / 100 * parent.fontSize : getRemSize();
                    }
                    else {
                        result = parseUnit(value, fixedWidth ? { fixedWidth: true } : undefined);
                    }
                    result *= emRatio;
                }
                else {
                    result = this.plainText ? this.actualParent!.fontSize : getRemSize();
                }
            }
            else {
                const options = isFontFixedWidth(this) ? { fixedWidth: true } : undefined;
                result = parseUnit(this.css('fontSize'), options) || (this.ascend({ condition: item => item.fontSize > 0 })[0]?.fontSize ?? parseUnit('1rem', options));
            }
            this._cache.fontSize = result;
        }
        return result;
    }

    get style() {
        const result = this._style;
        return result === undefined ? this._style = this.styleElement ? !this._pseudoElt ? getStyle(this._element!) : getStyle(this._element!.parentElement!, this._pseudoElt) : PROXY_INLINESTYLE : result;
    }

    get cssStyle() {
        return { ...this._cssStyle };
    }

    get textStyle() {
        let result = this._cache.textStyle;
        if (result === undefined) {
            result = this.cssAsObject(...TEXT_STYLE);
            result.fontSize = 'inherit';
            this._cache.textStyle = result;
        }
        return result;
    }

    get elementData() {
        return this._elementData;
    }

    get pseudoElt() {
        return this._pseudoElt;
    }

    set dir(value) {
        this._cacheState.dir = value;
    }
    get dir(): string {
        let result = this._cacheState.dir;
        if (result === undefined) {
            result = this.naturalElement ? (this._element as HTMLElement).dir : '';
            if (result === '') {
                let parent = this.actualParent;
                while (parent) {
                    result = parent.dir;
                    if (result !== '') {
                        break;
                    }
                    parent = parent.actualParent;
                }
            }
            this._cacheState.dir = result;
        }
        return result;
    }

    get center(): Point {
        const bounds = this.bounds;
        return {
            x: (bounds.left + bounds.right) / 2,
            y: (bounds.top + bounds.bottom) / 2
        };
    }
}