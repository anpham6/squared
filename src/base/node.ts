type T = Node;

const { USER_AGENT, isUserAgent } = squared.lib.client;
const { CSS_PROPERTIES, CSS_TRAITS, CSS_UNIT, PROXY_INLINESTYLE, SVG_PROPERTIES, checkFontSizeValue, checkStyleValue, checkWritingMode, formatPX, getRemSize, getStyle, hasComputedStyle, isAngle, isEm, isLength, isPercent, isTime, parseSelectorText, parseUnit } = squared.lib.css;
const { assignRect, getNamedItem, getRangeClientRect, newBoxRectDimension } = squared.lib.dom;
const { CSS, FILE } = squared.lib.regex;
const { getElementData, getElementAsNode, getElementCache, setElementCache } = squared.lib.session;
const { convertCamelCase, convertFloat, convertInt, hasBit, hasValue, isNumber, isObject, iterateArray, spliceString, splitEnclosing, splitPair } = squared.lib.util;

const { SELECTOR_ATTR, SELECTOR_G, SELECTOR_LABEL, SELECTOR_PSEUDO_CLASS } = CSS;

const BORDER_TOP = CSS_PROPERTIES.borderTop.value as string[];
const BORDER_RIGHT = CSS_PROPERTIES.borderRight.value as string[];
const BORDER_BOTTOM = CSS_PROPERTIES.borderBottom.value as string[];
const BORDER_LEFT = CSS_PROPERTIES.borderLeft.value as string[];

const REGEXP_BACKGROUND = /\s*(url|[a-z-]+gradient)/;
const REGEXP_QUERYNTH = /^:nth(-last)?-(child|of-type)\((.+)\)$/;
const REGEXP_QUERYNTHPOSITION = /^(-)?(\d+)?n\s*([+-]\d+)?$/;

function setStyleCache(element: HTMLElement, attr: string, sessionId: string, value: string, current: string) {
    if (current !== value) {
        element.style.setProperty(attr, value);
        if (validateCssSet(value, element.style.getPropertyValue(attr))) {
            setElementCache(element, attr, sessionId, value !== 'auto' ? current : '');
            return 2;
        }
        return 0;
    }
    return 1;
}

function parseLineHeight(lineHeight: string, fontSize: number) {
    if (lineHeight.endsWith('%')) {
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

const aboveRange = (a: number, b: number, offset = 1) => a + offset > b;
const belowRange = (a: number, b: number, offset = 1) => a - offset < b;
const validateCssSet = (value: string, actualValue: string) => value === actualValue || actualValue.endsWith('px') && isLength(value, true);
const sortById = (a: T, b: T) => a.id < b.id ? -1 : 1;
const isInlineVertical = (value: string) => value.startsWith('inline') || value === 'table-cell';

function getFlexValue(node: T, attr: string, fallback: number, parent?: Null<Node>): number {
    const value = (parent || node).css(attr);
    return isNumber(value) ? parseFloat(value) : fallback;
}

function hasTextAlign(node: T, ...values: string[]) {
    const value = node.cssAscend('textAlign', { startSelf: node.textElement && node.blockStatic && !node.hasPX('width', { initial: true }) });
    return value !== '' && values.includes(value) && (
        node.blockStatic
            ? node.textElement && !node.hasPX('width', { initial: true }) && !node.hasPX('maxWidth', { initial: true })
            : node.display.startsWith('inline')
    );
}

function setDimension(node: T, styleMap: StringMap, attr: DimensionAttr, attrMin: string, attrMax: string) {
    const options: NodeParseUnitOptions = { dimension: attr };
    const value = styleMap[attr];
    const min = styleMap[attrMin];
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
                    if (result > 0) {
                        node.css(attr, size.endsWith('%') ? size : size + 'px');
                    }
                }
                break;
            }
        }
    }
    if (baseValue > 0 && !node.imageElement) {
        const max = styleMap[attrMax];
        if (max) {
            if (value === max) {
                delete styleMap[attrMax];
            }
            else {
                const maxValue = node.parseUnit(max, { dimension: attr });
                if (maxValue > 0) {
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
            if (result > 0) {
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
                        const parent = node.ascend({ condition: item => item.tagName === 'TABLE'})[0];
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
    return node.parseUnit(node.css(attr), { parent: !(node.actualParent?.gridElement === true) });
}

function convertPosition(node: T, attr: string) {
    if (!node.positionStatic) {
        const unit = node.valueOf(attr, { modified: true });
        if (unit.endsWith('px')) {
            return parseFloat(unit);
        }
        else if (unit.endsWith('%')) {
            return node.styleElement ? convertFloat(node.style[attr]) : 0;
        }
        return node.parseUnit(unit, attr === 'top' || attr === 'bottom' ? { dimension:  'height' } : undefined);
    }
    return 0;
}

function validateQuerySelector(node: T, child: T, selector: QueryData, index: number, last: boolean, adjacent?: string) {
    if (selector.all) {
        return true;
    }
    else if (selector.tagName && selector.tagName !== child.tagName.toUpperCase() || selector.id && selector.id !== child.elementId) {
        return false;
    }
    const { attrList, classList, notList, pseudoList } = selector;
    if (pseudoList) {
        const parent = child.actualParent as T;
        const tagName = child.tagName;
        let i = 0;
        while (i < pseudoList.length) {
            const pseudo = pseudoList[i++];
            switch (pseudo) {
                case ':first-child':
                case ':nth-child(1)':
                    if (child !== parent.firstChild) {
                        return false;
                    }
                    break;
                case ':last-child':
                case ':nth-last-child(1)':
                    if (child !== parent.lastChild) {
                        return false;
                    }
                    break;
                case ':only-child':
                    if (parent.naturalElements.length > 1) {
                        return false;
                    }
                    break;
                case ':only-of-type': {
                    const children = parent.naturalElements;
                    const length = children.length;
                    let j = 0, k = 0;
                    while (j < length) {
                        if (children[j++].tagName === tagName && ++k > 1) {
                            return false;
                        }
                    }
                    break;
                }
                case ':first-of-type': {
                    const children = parent.naturalElements;
                    const length = children.length;
                    let j = 0;
                    while (j < length) {
                        const item = children[j++];
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
                    if ((child.element as HTMLElement).childNodes.length > 0) {
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
                                    return;
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
                                if (element.checked) {
                                    return false;
                                }
                                else if (element.name) {
                                    if (iterateArray((child.ascend({ condition: item => item.tagName === 'FORM' })[0]?.element || document).querySelectorAll(`input[type=radio][name="${element.name}"`), (item: HTMLInputElement) => item.checked) === Infinity) {
                                        return false;
                                    }
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
                    if (iterateArray((parent.element as HTMLElement).querySelectorAll(':scope > ' + pseudo), item => item === element) !== Infinity) {
                        return false;
                    }
                    break;
                }
                default: {
                    let match = REGEXP_QUERYNTH.exec(pseudo);
                    if (match) {
                        const placement = match[3].trim();
                        let children = parent.naturalElements;
                        if (match[1]) {
                            children = children.slice(0).reverse();
                        }
                        const j = match[2] === 'child' ? children.indexOf(child) + 1 : children.filter((item: T) => item.tagName === tagName).indexOf(child) + 1;
                        if (j > 0) {
                            if (isNumber(placement)) {
                                if (parseInt(placement) !== j) {
                                    return false;
                                }
                            }
                            else {
                                switch (placement) {
                                    case 'even':
                                        if (j % 2 !== 0) {
                                            return false;
                                        }
                                        break;
                                    case 'odd':
                                        if (j % 2 === 0) {
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
                                                    if (j !== modifier) {
                                                        for (let k = increment; ; k += increment) {
                                                            const total = increment + modifier;
                                                            if (total === j) {
                                                                break;
                                                            }
                                                            else if (total > j) {
                                                                return false;
                                                            }
                                                        }
                                                    }
                                                }
                                                else if (j !== modifier) {
                                                    return false;
                                                }
                                            }
                                            else if (subMatch[3]) {
                                                if (modifier > 0) {
                                                    if (subMatch[1]) {
                                                        if (j > modifier) {
                                                            return false;
                                                        }
                                                    }
                                                    else if (j < modifier) {
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
        let i = 0;
        while (i < notList.length) {
            const not = notList[i++];
            const notData: QueryData = {};
            switch (not.charAt(0)) {
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
            if (validateQuerySelector(node, child, notData, index, last)) {
                return false;
            }
        }
    }
    if (classList) {
        const elementList = (child.element as HTMLElement).classList;
        let i = 0;
        while (i < classList.length) {
            if (!elementList.contains(classList[i++])) {
                return false;
            }
        }
    }
    if (attrList) {
        const attributes = child.attributes;
        let i = 0;
        while (i < attrList.length) {
            const attr = attrList[i++];
            let value: Undef<string>;
            if (attr.endsWith) {
                const pattern = new RegExp(`^(.+:)?${attr.key}$`);
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
            if (value === undefined) {
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

function ascendQuerySelector(node: T, selectors: QueryData[], i: number, index: number, adjacent: Undef<string>, nodes: T[]): boolean {
    const depth = node.depth;
    const selector = selectors[index];
    const length = selectors.length;
    const last = index === length - 1;
    const next: T[] = [];
    const q = nodes.length;
    let j = 0;
    while (j < q) {
        const child = nodes[j++];
        if (adjacent) {
            const parent = child.actualParent as T;
            if (adjacent === '>') {
                if (validateQuerySelector(node, parent, selector, i, last, adjacent)) {
                    next.push(parent);
                }
            }
            else {
                const children = parent.naturalElements;
                switch (adjacent) {
                    case '+': {
                        const k = children.indexOf(child) - 1;
                        if (k >= 0) {
                            const sibling = children[k];
                            if (validateQuerySelector(node, sibling, selector, i, last, adjacent)) {
                                next.push(sibling);
                            }
                        }
                        break;
                    }
                    case '~': {
                        const r = children.length;
                        let k = 0;
                        while (k < r) {
                            const sibling = children[k++];
                            if (sibling === child) {
                                break;
                            }
                            else if (validateQuerySelector(node, sibling, selector, i, last, adjacent)) {
                                next.push(sibling);
                            }
                        }
                        break;
                    }
                }
            }
        }
        else if (child.depth - depth >= length - index) {
            let parent = child.actualParent as T;
            do {
                if (validateQuerySelector(node, parent, selector, i, last)) {
                    next.push(parent);
                }
                parent = parent.actualParent as T;
            }
            while (parent !== null);
        }
    }
    if (next.length > 0) {
        return ++index === length ? true : ascendQuerySelector(node, selectors, i, index, selector.adjacent, next);
    }
    return false;
}

const canTextAlign = (node: T) => node.naturalChild && (node.length === 0 || isInlineVertical(node.display)) && !node.floating && node.autoMargin.horizontal !== true;

export default class Node extends squared.lib.base.Container<T> implements squared.base.Node {
    public static readonly TEXT_STYLE = [
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

    public static getPseudoElt(element: Element, sessionId: string) {
        return getElementCache<string>(element, 'pseudoElt', sessionId) || '';
    }

    public static sanitizeCss(element: HTMLElement, styleMap: StringMap, writingMode?: string) {
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
    public childIndex = Infinity;

    public queryMap?: T[][];

    protected _parent: Null<T> = null;
    protected _cached: CachedValue<T> = {};
    protected _preferInitial = false;
    protected _styleMap!: StringMap;
    protected _cssStyle?: StringMap;
    protected _textBounds?: Null<BoxRectDimension>;
    protected _box?: BoxRectDimension;
    protected _bounds?: BoxRectDimension;
    protected _linear?: BoxRectDimension;
    protected _fontSize?: number;
    protected _initial?: InitialData<T>;
    protected _naturalChildren?: T[];
    protected _naturalElements?: T[];

    protected readonly _element: Null<Element> = null;

    private _data = {};
    private _inlineText = false;
    private _style?: CSSStyleDeclaration;
    private _dataset?: {};
    private _textStyle?: StringMap;
    private _elementData?: ElementData;

    constructor(
        public readonly id: number,
        public sessionId = '0',
        element?: Element)
    {
        super();
        if (element) {
            this._element = element;
            if (!this.syncWith(sessionId)) {
                this._styleMap = {};
            }
            if (sessionId !== '0') {
                setElementCache(element, 'node', sessionId, this);
                this._elementData = getElementData(element, sessionId);
            }
        }
        else {
            this._styleMap = {};
        }
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
            if (!sessionId) {
                sessionId = getElementCache(element, 'sessionId', '0');
                if (sessionId === this.sessionId) {
                    return true;
                }
            }
            const styleMap: Undef<StringMap> = getElementCache(element, 'styleMap', sessionId);
            if (styleMap) {
                if (this.styleElement) {
                    if (!this.pseudoElement) {
                        const items = Array.from(element.style);
                        const length = items.length;
                        if (length > 0) {
                            let i = 0;
                            while (i < length) {
                                const attr = items[i++];
                                styleMap[convertCamelCase(attr)] = element.style.getPropertyValue(attr);
                            }
                        }
                    }
                    this._styleMap = Node.sanitizeCss(element, styleMap, styleMap.writingMode);
                }
                else {
                    this._styleMap = styleMap;
                }
                this._cssStyle = styleMap;
                if (cache) {
                    this._cached = {};
                }
                return true;
            }
        }
        return false;
    }

    public saveAsInitial() {
        this._initial = {
            styleMap: { ...this._styleMap },
            children: this.length > 0 ? this.duplicate() : undefined,
            bounds: this._bounds
        };
    }

    public data<T = unknown>(name: string, attr: string, value?: any, overwrite = true): Undef<T> {
        const data = this._data;
        if (value === null) {
            if (data[name]) {
                delete data[name][attr];
            }
            return undefined;
        }
        else if (value !== undefined) {
            let obj: {} = data[name];
            if (!isObject(obj)) {
                obj = {};
                data[name] = obj;
            }
            if (overwrite || !hasValue(obj[attr])) {
                obj[attr] = value;
            }
        }
        const stored: {} = data[name];
        return isObject(stored) ? stored[attr] as T : undefined;
    }

    public unsetCache(...attrs: string[]) {
        const length = attrs.length;
        if (length > 0) {
            const cached = this._cached;
            let i = 0;
            while (i < length) {
                const attr = attrs[i++];
                switch (attr) {
                    case 'position':
                        if (!this._preferInitial) {
                            this.cascade(item => {
                                if (!item.pageFlow) {
                                    item.unsetCache('absoluteParent');
                                }
                            });
                        }
                    case 'display':
                    case 'float':
                    case 'tagName':
                        this._cached = {};
                        return;
                    case 'width':
                        cached.actualWidth = undefined;
                        cached.percentWidth = undefined;
                    case 'minWidth':
                        cached.width = undefined;
                        break;
                    case 'height':
                        cached.actualHeight = undefined;
                        cached.percentHeight = undefined;
                    case 'minHeight':
                        cached.height = undefined;
                        if (!this._preferInitial) {
                            this.unsetCache('blockVertical');
                            this.each(item => item.unsetCache());
                        }
                        break;
                    case 'verticalAlign':
                        cached.baseline = undefined;
                        break;
                    case 'left':
                    case 'right':
                    case 'textAlign':
                        cached.rightAligned = undefined;
                        cached.centerAligned = undefined;
                        break;
                    case 'top':
                    case 'bottom':
                        cached.bottomAligned = undefined;
                        break;
                    default:
                        if (attr.startsWith('margin')) {
                            cached.autoMargin = undefined;
                            cached.rightAligned = undefined;
                            cached.centerAligned = undefined;
                            cached.bottomAligned = undefined;
                        }
                        else if (attr.startsWith('padding')) {
                            cached.contentBoxWidth = undefined;
                            cached.contentBoxHeight = undefined;
                        }
                        else if (attr.startsWith('border')) {
                            cached.visibleStyle = undefined;
                            cached.contentBoxWidth = undefined;
                            cached.contentBoxHeight = undefined;
                        }
                        else if (attr.startsWith('background')) {
                            cached.visibleStyle = undefined;
                        }
                        else if (Node.TEXT_STYLE.includes(attr)) {
                            cached.lineHeight = undefined;
                            this._textStyle = undefined;
                        }
                        break;
                }
                if (attr in cached) {
                    cached[attr] = undefined;
                }
            }
        }
        else {
            this._cached = {};
            this._textStyle = undefined;
        }
        if (!this._preferInitial) {
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
                const q = queryMap.length;
                let i = 0, j: number;
                while (i < q) {
                    const children = queryMap[i++];
                    const r = children.length;
                    j = 0;
                    while (j < r) {
                        children[j++].resetBounds();
                    }
                }
            }
            else {
                this.cascade(item => item.resetBounds());
            }
        }
    }

    public ascend(options: AscendOptions<T>) {
        let attr = options.attr;
        if (!attr) {
            attr = 'actualParent';
        }
        else if (attr !== 'parent' && !attr.endsWith('Parent')) {
            return [];
        }
        const { condition, error, every, including, excluding } = options;
        const result: T[] = [];
        let parent: Null<T> = options.startSelf ? this : this[attr];
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

    public intersectX(rect: BoxRectDimension, options?: CoordsXYOptions) {
        if (rect.width > 0) {
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
        if (rect.height > 0) {
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
        if (rect.width > 0 || this.pageFlow) {
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
        if (rect.height > 0 || this.pageFlow) {
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
        if (rect.width > 0 || this.pageFlow) {
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
        if (rect.height > 0 || this.pageFlow) {
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
            this.style[attr] = value;
            if (validateCssSet(value, this.style[attr])) {
                this._styleMap[attr] = value;
                if (cache) {
                    this.unsetCache(attr);
                }
                return value;
            }
        }
        return this._styleMap[attr] as string || this.naturalChild && this.style[attr] as string || '';
    }

    public cssApply(values: StringMap, cache = true) {
        for (const attr in values) {
            const value = values[attr];
            if (this.css(attr, value, cache) === value && cache) {
                this.unsetCache(attr);
            }
        }
        return this;
    }

    public cssParent(attr: string, value?: string, cache = false) {
        return this.actualParent?.css(attr, value, cache) || '';
    }

    public cssInitial(attr: string, options?: CssInitialOptions) {
        const value = (this._initial?.styleMap || this._styleMap)[attr];
        if (value) {
            return value;
        }
        else if (options) {
            return options.modified && this._styleMap[attr] as string || options.computed && this.style[attr] as string || '';
        }
        return '';
    }

    public cssAscend(attr: string, options?: CssAscendOptions) {
        let startSelf: Undef<boolean>,
            initial: Undef<boolean>;
        if (options) {
            ({ startSelf, initial } = options);
        }
        let parent = startSelf ? this : this.actualParent,
            value: string;
        while (parent !== null) {
            value = initial ? parent.cssInitial(attr, options) : parent.css(attr);
            if (value !== '' && value !== 'inherit') {
                return value;
            }
            parent = parent.actualParent;
        }
        return '';
    }

    public cssAny(attr: string, options: CssAnyOptions) {
        let value: string;
        if (options.ascend) {
            options.startSelf = true;
            value = this.cssAscend(attr, options);
        }
        else {
            value = options.initial ? this.cssInitial(attr, options) : this.css(attr);
        }
        return value !== '' && options.values.includes(value);
    }

    public cssSort(attr: string, options?: CssSortOptions) {
        let ascending: Undef<boolean>,
            byFloat: Undef<boolean>,
            byInt: Undef<boolean>,
            duplicate: Undef<boolean>;
        if (options) {
            ({ ascending, byFloat, byInt, duplicate } = options);
        }
        return (duplicate ? this.duplicate() : this.children).sort((a, b) => {
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
            if (value < 0 && options?.negative !== true) {
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
        if (this.styleElement) {
            const element = this._element as Element;
            return (this.pseudoElement
                ? getElementCache<ObjectMap<number>>(element.parentElement as Element, 'styleSpecificity' + Node.getPseudoElt(element, this.sessionId), this.sessionId)?.[attr]
                : getElementCache<ObjectMap<number>>(element, 'styleSpecificity', this.sessionId)?.[attr]) || 0;
        }
        return 0;
    }

    public cssTry(attr: string, value: string, callback?: FunctionSelf<this>) {
        if (this.styleElement) {
            const element = this._element as HTMLElement;
            if (setStyleCache(element, attr, this.sessionId, value, getStyle(element).getPropertyValue(attr)) > 0) {
                if (callback) {
                    callback.call(this);
                    this.cssFinally(attr);
                }
                return true;
            }
        }
        return false;
    }

    public cssTryAll(values: StringMap, callback?: FunctionSelf<this>) {
        if (this.styleElement) {
            const succeeded: StringMap = {};
            const sessionId = this.sessionId;
            const element = this._element as HTMLElement;
            const style = getStyle(element);
            for (const attr in values) {
                const value = values[attr]!;
                switch (setStyleCache(element, attr, sessionId, value, style.getPropertyValue(attr))) {
                    case 0:
                        this.cssFinally(succeeded);
                        return false;
                    case 1:
                        continue;
                    case 2:
                       succeeded[attr] = value;
                       break;
                }
            }
            if (callback) {
                callback.call(this);
                this.cssFinally(succeeded);
                return true;
            }
            else {
                return succeeded;
            }
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
                    if (value !== undefined) {
                        element.style.setProperty(attrs, value);
                    }
                    elementData[attrs] = undefined;
                }
                else {
                    for (const attr in attrs) {
                        const value = elementData[attr] as Undef<string>;
                        if (value !== undefined) {
                            element.style.setProperty(attr, value);
                        }
                        elementData[attr] = undefined;
                    }
                }
            }
        }
    }

    public cssCopy(node: T, ...attrs: string[]) {
        const styleMap = this._styleMap;
        let i = 0;
        while (i < attrs.length) {
            const attr = attrs[i++];
            styleMap[attr] = node.css(attr);
        }
    }

    public cssCopyIfEmpty(node: T, ...attrs: string[]) {
        const styleMap = this._styleMap;
        let i = 0;
        while (i < attrs.length) {
            const attr = attrs[i++];
            if (!hasValue(styleMap[attr])) {
                styleMap[attr] = node.css(attr);
            }
        }
    }

    public cssAsTuple(...attrs: string[]) {
        const length = attrs.length;
        const result: string[] = new Array(length);
        let i = 0;
        while (i < length) {
            result[i] = this.css(attrs[i++]);
        }
        return result;
    }

    public cssAsObject(...attrs: string[]) {
        const result: StringMap = {};
        let i = 0;
        while (i < attrs.length) {
            const attr = attrs[i++];
            result[attr] = this.css(attr);
        }
        return result;
    }

    public cssPseudoElement(name: string) {
        if (this.naturalElement) {
            const styleMap = getElementCache<StringMap>(this._element!, 'styleMap::' + name, this.sessionId);
            if (styleMap) {
                switch (name) {
                    case 'first-letter':
                    case 'first-line':
                        switch (this.display) {
                            case 'block':
                            case 'inline-block':
                            case 'list-item':
                            case 'table-cell':
                                break;
                            default:
                                return null;
                        }
                    case 'before':
                    case 'after':
                        return Node.sanitizeCss(this._element as HTMLElement, styleMap, styleMap.writingMode || this.cssInitial('writingMode'));
                }
            }
        }
        return null;
    }

    public toInt(attr: string, fallback = NaN, initial = false) {
        const value = parseInt((initial && this._initial?.styleMap || this._styleMap)[attr]!);
        return !isNaN(value) ? value : fallback;
    }

    public toFloat(attr: string, fallback = NaN, initial = false) {
        const value = parseFloat((initial && this._initial?.styleMap || this._styleMap)[attr]!);
        return !isNaN(value) ? value : fallback;
    }

    public toElementInt(attr: string, fallback = NaN) {
        const value = parseInt(this._element?.[attr]);
        return !isNaN(value) ? value : fallback;
    }

    public toElementFloat(attr: string, fallback = NaN) {
        const value = parseFloat(this._element?.[attr]);
        return !isNaN(value) ? value : fallback;
    }

    public toElementBoolean(attr: string, fallback = false) {
        const value = this._element?.[attr];
        return typeof value === 'boolean' ? value : fallback;
    }

    public toElementString(attr: string, fallback = '') {
        return (this._element?.[attr] as Undef<string> ?? fallback).toString();
    }

    public parseUnit(value: string, options?: NodeParseUnitOptions) {
        if (value.endsWith('px')) {
            return parseFloat(value);
        }
        else if (value.endsWith('%')) {
            let parent: Undef<boolean>,
                dimension: Undef<DimensionAttr>;
            if (options) {
                ({ parent, dimension } = options);
            }
            const bounds = parent !== false && this.absoluteParent?.box || this.bounds;
            let result = parseFloat(value) / 100;
            switch (dimension) {
                case 'height':
                    result *= bounds.height;
                    break;
                default:
                    result *= bounds.width;
                    break;
            }
            return result;
        }
        (options ?? (options = {})).fontSize = this.fontSize;
        return parseUnit(value, options);
    }

    public has(attr: string, options?: HasOptions) {
        const value = options?.initial ? this.cssInitial(attr, options) : this._styleMap[attr];
        if (value) {
            let not: Undef<string | string[]>,
                type: Undef<number>,
                ignoreDefault: Undef<boolean>;
            if (options) {
                ({ not, type, ignoreDefault } = options);
            }
            if (ignoreDefault !== true) {
                const data = options?.map === 'svg' ? SVG_PROPERTIES[attr] : CSS_PROPERTIES[attr];
                if (data && (value === data.value || hasBit(data.trait, CSS_TRAITS.UNIT) && parseFloat(value) === parseFloat(data.value as string))) {
                    return false;
                }
            }
            if (not) {
                if (value === not) {
                    return false;
                }
                else if (Array.isArray(not)) {
                    let i = 0;
                    while (i < not.length) {
                        if (value === not[i++]) {
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
        let bounds: Undef<BoxRectDimension>;
        if (this.styleElement) {
            const elementData = this._elementData;
            if (elementData) {
                if (!cache || !elementData.clientRect) {
                    elementData.clientRect = this._element!.getBoundingClientRect();
                }
                bounds = assignRect(elementData.clientRect);
            }
            else {
                bounds = assignRect(this._element!.getBoundingClientRect());
            }
            this._bounds = bounds;
        }
        else if (this.plainText) {
            const rect = getRangeClientRect(this._element!);
            if (rect) {
                const lines = rect.numberOfLines || 1;
                rect.numberOfLines = lines;
                this._textBounds = bounds;
                this._cached.multiline = lines > 1;
            }
            bounds = rect || newBoxRectDimension();
            this._bounds = bounds;
        }
        if (!cache && bounds) {
            this._box = undefined;
            this._linear = undefined;
        }
        return bounds;
    }

    public resetBounds() {
        this._bounds = undefined;
        this._box = undefined;
        this._linear = undefined;
        this._textBounds = undefined;
        this._cached.multiline = undefined;
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
            const value = parseFloat(
                self
                    ? item[attr] as string
                    : initial
                        ? item.cssInitial(attr, options)
                        : item.css(attr)
            );
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
            const value = parseFloat(
                self
                    ? item[attr] as string
                    : initial
                        ? item.cssInitial(attr, options)
                        : item.css(attr)
            );
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
        return this.querySelectorAll(value, 1)[0] || null;
    }

    public querySelectorAll(value: string, resultCount = -1) {
        let result: T[] = [];
        const queryMap = this.queryMap;
        if (queryMap && resultCount !== 0) {
            const queries = parseSelectorText(value);
            let i = 0, length = queries.length;
            while (i < length) {
                const query = queries[i++];
                const selectors: QueryData[] = [];
                let offset = -1;
                if (query === '*') {
                    selectors.push({ all: true });
                    ++offset;
                }
                else {
                    invalid: {
                        let adjacent: Undef<string>,
                            match: Null<RegExpExecArray>;
                        while (match = SELECTOR_G.exec(query)) {
                            let segment = match[1],
                                all = false;
                            if (segment.length === 1) {
                                const ch = segment.charAt(0);
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
                                            if (key.startsWith('*')) {
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
                                    switch (label.charAt(0)) {
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
                length = queryMap.length;
                if (selectors.length > 0 && offset !== -1 && offset < length) {
                    const dataEnd = selectors.pop() as QueryData;
                    const lastEnd = selectors.length === 0;
                    const currentCount = result.length;
                    let pending: T[];
                    if (dataEnd.all && length - offset === 1) {
                        pending = queryMap[offset];
                    }
                    else {
                        pending = [];
                        let j = offset;
                        while (j < length) {
                            const children = queryMap[j++];
                            if (dataEnd.all) {
                                pending = pending.concat(children);
                            }
                            else {
                                const q = children.length;
                                let k = 0;
                                while (k < q) {
                                    const node = children[k++];
                                    if ((currentCount === 0 || !result.includes(node)) && validateQuerySelector(this, node, dataEnd, i, lastEnd)) {
                                        pending.push(node);
                                    }
                                }
                            }
                        }
                    }
                    if (selectors.length > 0) {
                        selectors.reverse();
                        let count = currentCount;
                        const r = pending.length;
                        let j = 0;
                        while (j < r) {
                            const node = pending[j++];
                            if ((currentCount === 0 || !result.includes(node)) && ascendQuerySelector(this, selectors, i, 0, dataEnd.adjacent, [node])) {
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
                        const q = pending.length;
                        if (resultCount > 0) {
                            let count = currentCount;
                            let j = 0;
                            while (j < q) {
                                const node = pending[j++];
                                if (!result.includes(node)) {
                                    result.push(node);
                                    if (++count === resultCount) {
                                        return result.sort(sortById);
                                    }
                                }
                            }
                        }
                        else {
                            let j = 0;
                            while (j < q) {
                                const node = pending[j++];
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
        const result = this._cached.tagName;
        if (result === undefined) {
            const element = this._element;
            if (element) {
                const nodeName = element.nodeName;
                return this._cached.tagName = nodeName.startsWith('#') ? nodeName : element.tagName;
            }
            return this._cached.tagName = '';
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
        const result = this._cached.htmlElement;
        return result === undefined ? this._cached.htmlElement = this._element instanceof HTMLElement : result;
    }

    get svgElement() {
        const result = this._cached.svgElement;
        return result === undefined ? this._cached.svgElement = !this.plainText && (!this.htmlElement && this._element instanceof SVGElement || this.imageElement && FILE.SVG.test(this.toElementString('src'))) : result;
    }

    get styleElement() {
        return this.htmlElement || this.svgElement;
    }

    get naturalChild() {
        return true;
    }

    get naturalElement() {
        const result = this._cached.naturalElement;
        return result === undefined ? this._cached.naturalElement = this.naturalChild && this.styleElement && !this.pseudoElement : result;
    }

    get parentElement() {
        return this._element?.parentElement || this.actualParent?.element || null;
    }

    get textElement() {
        return this.plainText || this.inlineText && this.tagName !== 'BUTTON';
    }

    get pseudoElement() {
        return false;
    }

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
        return this.tagName === '#text';
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
        return this.naturalChild && !this.svgElement ? this._element!.textContent as string : '';
    }

    get dataset(): DOMStringMap {
        return this._dataset ?? (this._dataset = this.styleElement ? (this._element as HTMLElement).dataset : {});
    }

    get documentBody() {
        return this._element === document.body;
    }

    get bounds() {
        return this._bounds || this.setBounds(false) || assignRect(this.boundingClientRect);
    }

    get linear() {
        if (this._linear === undefined) {
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
        if (this._box === undefined) {
            const bounds = this.bounds;
            if (bounds) {
                if (this.styleElement && this.naturalChildren.length > 0) {
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
        const result = this._cached.flexdata;
        if (result === undefined) {
            if (this.flexElement) {
                const { flexWrap, flexDirection, alignContent, justifyContent } = this.cssAsObject('flexWrap', 'flexDirection', 'alignContent', 'justifyContent') as StringMapChecked;
                const row = flexDirection.startsWith('row');
                return this._cached.flexdata = {
                    row,
                    column: !row,
                    reverse: flexDirection.endsWith('reverse'),
                    wrap: flexWrap.startsWith('wrap'),
                    wrapReverse: flexWrap === 'wrap-reverse',
                    alignContent,
                    justifyContent
                };
            }
            return this._cached.flexdata = {};
        }
        return result;
    }

    get flexbox() {
        const result = this._cached.flexbox;
        if (result === undefined) {
            if (this.styleElement && this.actualParent!.flexElement) {
                const [alignSelf, justifySelf, basis] = this.cssAsTuple('alignSelf', 'justifySelf', 'flexBasis');
                return this._cached.flexbox = {
                    alignSelf: alignSelf === 'auto' ? this.cssParent('alignItems') : alignSelf,
                    justifySelf: justifySelf === 'auto' ? this.cssParent('justifyItems') : justifySelf,
                    basis,
                    grow: getFlexValue(this, 'flexGrow', 0),
                    shrink: getFlexValue(this, 'flexShrink', 1),
                    order: this.toInt('order', 0)
                };
            }
            return this._cached.flexbox = {} as FlexBox;
        }
        return result;
    }

    get width() {
        const result = this._cached.width;
        return result === undefined ? this._cached.width = setDimension(this, this._styleMap, 'width', 'minWidth', 'maxWidth') : result;
    }
    get height() {
        const result = this._cached.height;
        return result === undefined ? this._cached.height = setDimension(this, this._styleMap, 'height', 'minHeight', 'maxHeight') : result;
    }

    get hasWidth() {
        const result = this._cached.hasWidth;
        return result === undefined ? this._cached.hasWidth = this.width > 0 : result;
    }
    get hasHeight(): boolean {
        const result = this._cached.hasHeight;
        if (result === undefined) {
            const value = this.css('height');
            return this._cached.hasHeight = isPercent(value)
                ? this.pageFlow
                    ? this.actualParent?.hasHeight || this.documentBody
                    : this.css('position') === 'fixed' || this.hasPX('top') || this.hasPX('bottom')
                : this.height > 0 || this.hasPX('height', { percent: false });
        }
        return result;
    }

    get lineHeight() {
        let result = this._cached.lineHeight;
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
                        if (value > 0) {
                            if (parent !== this.actualParent || isEm(this.valueOf('fontSize')) || this.multiline) {
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
            else {
                result = 0;
            }
            this._cached.lineHeight = result;
        }
        return result;
    }

    get positionStatic() {
        let result = this._cached.positionStatic;
        if (result === undefined) {
            switch (this.css('position')) {
                case 'absolute':
                case 'fixed':
                    result = false;
                    break;
                case 'relative':
                    result = !this.documentBody && this.toFloat('top', 0) === 0 && this.toFloat('right', 0) === 0 && this.toFloat('bottom', 0) === 0 && this.toFloat('left', 0) === 0;
                    this._cached.positionRelative = !result;
                    break;
                default:
                    result = true;
                    break;
            }
            this._cached.positionStatic = result;
        }
        return result;
    }

    get top() {
        const result = this._cached.top;
        return result === undefined ? this._cached.top = convertPosition(this, 'top') : result;
    }
    get right() {
        const result = this._cached.right;
        return result === undefined ? this._cached.right = convertPosition(this, 'right') : result;
    }
    get bottom() {
        const result = this._cached.bottom;
        return result === undefined ? this._cached.bottom = convertPosition(this, 'bottom') : result;
    }
    get left() {
        const result = this._cached.left;
        return result === undefined ? this._cached.left = convertPosition(this, 'left') : result;
    }

    get marginTop() {
        const result = this._cached.marginTop;
        return result === undefined ? this._cached.marginTop = this.inlineStatic ? 0 : convertBox(this, 'marginTop', true) : result;
    }
    get marginRight() {
        const result = this._cached.marginRight;
        return result === undefined ? this._cached.marginRight = convertBox(this, 'marginRight', true) : result;
    }
    get marginBottom() {
        const result = this._cached.marginBottom;
        return result === undefined ? this._cached.marginBottom = this.inlineStatic ? 0 : convertBox(this, 'marginBottom', true) : result;
    }
    get marginLeft() {
        const result = this._cached.marginLeft;
        return result === undefined ? this._cached.marginLeft = convertBox(this, 'marginLeft', true) : result;
    }

    get borderTopWidth() {
        const result = this._cached.borderTopWidth;
        return result === undefined ? this._cached.borderTopWidth = convertBorderWidth(this, 'height', BORDER_TOP) : result;
    }
    get borderRightWidth() {
        const result = this._cached.borderRightWidth;
        return result === undefined ? this._cached.borderRightWidth = convertBorderWidth(this, 'height', BORDER_RIGHT) : result;
    }
    get borderBottomWidth() {
        const result = this._cached.borderBottomWidth;
        return result === undefined ? this._cached.borderBottomWidth = convertBorderWidth(this, 'width', BORDER_BOTTOM) : result;
    }
    get borderLeftWidth() {
        const result = this._cached.borderLeftWidth;
        return result === undefined ? this._cached.borderLeftWidth = convertBorderWidth(this, 'width', BORDER_LEFT) : result;
    }

    get paddingTop() {
        const result = this._cached.paddingTop;
        return result === undefined ? this._cached.paddingTop = convertBox(this, 'paddingTop', false) : result;
    }
    get paddingRight() {
        const result = this._cached.paddingRight;
        return result === undefined ? this._cached.paddingRight = convertBox(this, 'paddingRight', false) : result;
    }
    get paddingBottom() {
        const result = this._cached.paddingBottom;
        return result === undefined ? this._cached.paddingBottom = convertBox(this, 'paddingBottom', false) : result;
    }
    get paddingLeft() {
        const result = this._cached.paddingLeft;
        return result === undefined ? this._cached.paddingLeft = convertBox(this, 'paddingLeft', false) : result;
    }

    get contentBox() {
        return this.css('boxSizing') !== 'border-box' || this.tableElement && isUserAgent(USER_AGENT.FIREFOX);
    }

    get contentBoxWidth() {
        const result = this._cached.contentBoxWidth;
        return result === undefined ? this._cached.contentBoxWidth = this.tableElement && this.css('borderCollapse') === 'collapse' ? 0 : this.borderLeftWidth + this.paddingLeft + this.paddingRight + this.borderRightWidth : result;
    }

    get contentBoxHeight() {
        const result = this._cached.contentBoxHeight;
        return result === undefined ? this._cached.contentBoxHeight = this.tableElement && this.css('borderCollapse') === 'collapse' ? 0 : this.borderTopWidth + this.paddingTop + this.paddingBottom + this.borderBottomWidth : result;
    }

    get inline() {
        const result = this._cached.inline;
        return result === undefined ? this._cached.inline = this.display === 'inline' : result;
    }

    get inlineStatic() {
        const result = this._cached.inlineStatic;
        return result === undefined ? this._cached.inlineStatic = this.inline && this.pageFlow && !this.floating && !this.imageElement : result;
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
                this._inlineText = false;
                break;
            case 'BUTTON':
                this._inlineText = this.textContent.trim() !== '';
                break;
            default:
                this._inlineText = value;
                break;
        }
    }
    get inlineText() {
        return this._inlineText;
    }

    get block() {
        let result = this._cached.block;
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
            this._cached.block = result;
        }
        return result;
    }

    get blockStatic() {
        const result = this._cached.blockStatic;
        if (result === undefined) {
            const pageFlow = this.pageFlow;
            if (pageFlow && (this.block && !this.floating || this.lineBreak)) {
                return this._cached.blockStatic = true;
            }
            else if (!pageFlow || !this.inline && !this.display.startsWith('table-') && !this.hasPX('maxWidth')) {
                const width = this.valueOf('width');
                const minWidth = this.valueOf('minWidth');
                let percent = 0;
                if (width.endsWith('%')) {
                    percent = parseFloat(width);
                }
                if (minWidth.endsWith('%')) {
                    percent = Math.max(parseFloat(minWidth), percent);
                }
                if (percent > 0) {
                    const marginLeft = this.valueOf('marginLeft');
                    const marginRight = this.valueOf('marginRight');
                    return this._cached.blockStatic = percent + (isPercent(marginLeft) ? parseFloat(marginLeft) : 0) + (isPercent(marginRight) ? parseFloat(marginRight) : 0) >= 100;
                }
            }
            return this._cached.blockStatic = false;
        }
        return result;
    }

    get pageFlow() {
        const result = this._cached.pageFlow;
        return result === undefined ? this._cached.pageFlow = this.positionStatic || this.positionRelative || this.lineBreak : result;
    }

    get centerAligned() {
        const result = this._cached.centerAligned;
        return result === undefined ? this._cached.centerAligned = !this.pageFlow ? this.hasPX('left') && this.hasPX('right') : this.autoMargin.leftRight || canTextAlign(this) && hasTextAlign(this, 'center') : result;
    }

    get rightAligned() {
        const result = this._cached.rightAligned;
        return result === undefined ? this._cached.rightAligned = !this.pageFlow ? this.hasPX('right') && !this.hasPX('left') : this.float === 'right' || this.autoMargin.left || canTextAlign(this) && hasTextAlign(this, 'right', this.dir === 'rtl' ? 'start' : 'end') : result;
    }

    get bottomAligned() {
        const result = this._cached.bottomAligned;
        return result === undefined ? this._cached.bottomAligned = !this.pageFlow ? this.hasPX('bottom') && !this.hasPX('top') : this.actualParent?.hasHeight === true && this.autoMargin.top === true : result;
    }

    get autoMargin() {
        const result = this._cached.autoMargin;
        if (result === undefined) {
            if (!this.pageFlow || this.blockStatic || this.display === 'table') {
                const styleMap = this._styleMap;
                const left = styleMap.marginLeft === 'auto' && (this.pageFlow || this.hasPX('right'));
                const right = styleMap.marginRight === 'auto' && (this.pageFlow || this.hasPX('left'));
                const top = styleMap.marginTop === 'auto' && (this.pageFlow || this.hasPX('bottom'));
                const bottom = styleMap.marginBottom === 'auto' && (this.pageFlow || this.hasPX('top'));
                return this._cached.autoMargin = {
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
            return this._cached.autoMargin = {};
        }
        return result;
    }

    get baseline() {
        const result = this._cached.baseline;
        if (result === undefined) {
            if (this.pageFlow && !this.floating && !this.tableElement) {
                const display = this.display;
                if (display.startsWith('inline') || display === 'list-item') {
                    const verticalAlign = this.css('verticalAlign');
                    return this._cached.baseline = verticalAlign === 'baseline' || isLength(verticalAlign, true);
                }
            }
            return this._cached.baseline = false;
        }
        return result;
    }

    get verticalAlign() {
        let result = this._cached.verticalAlign;
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
            return this._cached.verticalAlign = result || 0;
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
                    return this._textBounds = getRangeClientRect(this._element as Element) || null;
                }
                else if (this.length > 0) {
                    const naturalChildren = this.naturalChildren;
                    const length = naturalChildren.length;
                    if (length > 0) {
                        let top = Infinity,
                            right = -Infinity,
                            bottom = -Infinity,
                            left = Infinity,
                            numberOfLines = 0;
                        let i = 0;
                        while (i < length) {
                            const node = naturalChildren[i++];
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
                        if (numberOfLines > 0) {
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
        const result = this._cached.multiline;
        return result === undefined ? this._cached.multiline = (this.plainText || this.styleElement && this.inlineText && (this.inline || this.naturalElements.length === 0 || isInlineVertical(this.display) || this.floating || !this.pageFlow)) && this.textBounds?.numberOfLines as number > 1 : result;
    }

    get backgroundColor() {
        let result = this._cached.backgroundColor;
        if (result === undefined) {
            if (!this.plainText) {
                result = this.css('backgroundColor');
                switch (result) {
                    case 'transparent':
                    case 'rgba(0, 0, 0, 0)':
                        result = '';
                        if (this.inputElement) {
                            if (this.tagName === 'BUTTON') {
                                result = 'rgba(0, 0, 0, 0)';
                            }
                            else {
                                switch (this.toElementString('type')) {
                                    case 'button':
                                    case 'submit':
                                    case 'reset':
                                    case 'image':
                                        result = 'rgba(0, 0, 0, 0)';
                                        break;
                                }
                            }
                        }
                        break;
                    default:
                        if (result !== '' && this.styleElement && !this.inputElement && (this._initial === undefined || this.valueOf('backgroundColor') === result)) {
                            let parent = this.actualParent;
                            while (parent !== null) {
                                const color = parent.valueOf('backgroundColor', { modified: true });
                                if (color !== '') {
                                    if (color === result && parent.backgroundColor === '') {
                                        result = '';
                                    }
                                    break;
                                }
                                parent = parent.actualParent;
                            }
                        }
                        break;
                }
            }
            else {
                result = '';
            }
            this._cached.backgroundColor = result;
        }
        return result;
    }

    get backgroundImage() {
        let result = this._cached.backgroundImage;
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
            this._cached.backgroundImage = result;
        }
        return result;
    }

    get percentWidth() {
        const result = this._cached.percentWidth;
        if (result === undefined) {
            const value = this.valueOf('width');
            return this._cached.percentWidth = isPercent(value) ? parseFloat(value) / 100 : 0;
        }
        return result;
    }
    get percentHeight() {
        const result = this._cached.percentHeight;
        if (result === undefined) {
            const value = this.valueOf('height');
            return this._cached.percentHeight = isPercent(value) && (this.actualParent?.hasHeight || this.css('position') === 'fixed') ? parseFloat(value) / 100 : 0;
        }
        return result;
    }

    get visibleStyle() {
        const result = this._cached.visibleStyle;
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
                return this._cached.visibleStyle = {
                    background: borderWidth || backgroundImage || backgroundColor,
                    borderWidth,
                    backgroundImage,
                    backgroundColor,
                    backgroundRepeat: backgroundRepeatX || backgroundRepeatY,
                    backgroundRepeatX,
                    backgroundRepeatY
                };
            }
            return this._cached.visibleStyle = {} as VisibleStyle;
        }
        return result;
    }

    get absoluteParent() {
        let result = this._cached.absoluteParent;
        if (result === undefined) {
            result = this.actualParent;
            if (!this.pageFlow && !this.documentBody) {
                while (result?.documentBody === false && result.valueOf('position', { computed: true }) === 'static') {
                    result = result.actualParent;
                }
            }
            this._cached.absoluteParent = result;
        }
        return result;
    }

    set actualParent(value) {
        this._cached.actualParent = value;
    }
    get actualParent() {
        const result = this._cached.actualParent;
        if (result === undefined) {
            const parentElement = this._element?.parentElement;
            return this._cached.actualParent = parentElement && getElementAsNode<T>(parentElement, this.sessionId) || null;
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
        let result = this._cached.actualWidth;
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
                if (result > 0) {
                    if (this.contentBox && !this.tableElement) {
                        result += this.contentBoxWidth;
                    }
                }
                else {
                    result = this.bounds.width;
                }
            }
            this._cached.actualWidth = result;
        }
        return result;
    }

    get actualHeight() {
        let result = this._cached.actualHeight;
        if (result === undefined) {
            if (this.inlineStatic || this.display === 'table-cell' || this.actualParent?.flexdata.column === true) {
                result = this.bounds.height;
            }
            else {
                result = this.height;
                if (result > 0) {
                    if (this.contentBox && !this.tableElement) {
                        result += this.contentBoxHeight;
                    }
                }
                else {
                    result = this.bounds.height;
                }
            }
            this._cached.actualHeight = result;
        }
        return result;
    }

    get actualDimension() {
        return { width: this.actualWidth, height: this.actualHeight };
    }

    set naturalChildren(value) {
        this._naturalChildren = value;
    }
    get naturalChildren() {
        if (this._naturalChildren === undefined) {
            if (this.naturalElement) {
                const sessionId = this.sessionId;
                const children: T[] = [];
                let i = 0;
                (this.element as HTMLElement).childNodes.forEach((element: Element) => {
                    const item = getElementAsNode<T>(element, sessionId);
                    if (item) {
                        item.childIndex = i++;
                        children.push(item);
                    }
                });
                if (children.length > 0) {
                    return this._naturalChildren = children;
                }
            }
            return this._naturalChildren = this.children.slice(0);
        }
        return this._naturalChildren;
    }

    set naturalElements(value) {
        this._naturalElements = value;
    }
    get naturalElements() {
        return this._naturalElements ?? (this._naturalElements = this.naturalChildren.filter((item: T) => item.naturalElement));
    }

    get firstChild(): Null<T> {
        return this.naturalElements[0] || null;
    }

    get lastChild() {
        const children = this.naturalElements;
        const length = children.length;
        return length ? children[length - 1] : null;
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
        let result = this._cached.attributes;
        if (result === undefined) {
            result = {};
            if (this.styleElement) {
                const attributes = this._element!.attributes;
                const length = attributes.length;
                let i = 0;
                while (i < length) {
                    const item = attributes.item(i++) as Attr;
                    result[item.name] = item.value;
                }
            }
            this._cached.attributes = result;
        }
        return result;
    }

    get boundingClientRect() {
        return this.styleElement && this._element!.getBoundingClientRect() || this._bounds as DOMRect || null;
    }

    get preserveWhiteSpace() {
        const result = this._cached.preserveWhiteSpace;
        if (result === undefined) {
            switch (this.css('whiteSpace')) {
                case 'pre':
                case 'pre-wrap':
                case 'break-spaces':
                    return this._cached.preserveWhiteSpace = true;
                default:
                    return this._cached.preserveWhiteSpace = false;
            }
        }
        return result;
    }

    get fontSize(): number {
        let result = this._fontSize;
        if (result === undefined) {
            if (this.naturalChild) {
                if (this.styleElement) {
                    const fixedWidth = isFontFixedWidth(this);
                    let value = checkFontSizeValue(this.valueOf('fontSize'), fixedWidth),
                        emRatio = 1;
                    if (isEm(value)) {
                        emRatio *= parseFloat(value);
                        value = 'inherit';
                    }
                    if (value === 'inherit') {
                        let parent: Null<T> = this.actualParent;
                        if (parent !== null) {
                            do {
                                if (parent.tagName === 'HTML') {
                                    value = '1rem';
                                    break;
                                }
                                else {
                                    const fontSize = parent.valueOf('fontSize');
                                    if (fontSize !== '' && fontSize !== 'inherit') {
                                        value = checkFontSizeValue(fontSize);
                                        if (value.endsWith('%')) {
                                            emRatio *= parseFloat(value) / 100;
                                        }
                                        else if (isEm(value)) {
                                            emRatio *= parseFloat(value);
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                    parent = parent.actualParent;
                                }
                            }
                            while (parent !== null);
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
                    else if (value.endsWith('%')) {
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
                result = parseUnit(this.css('fontSize'));
                if (result === 0) {
                    const element = this.element;
                    result = element && hasComputedStyle(element)
                        ? getElementAsNode<T>(element, this.sessionId)?.fontSize ?? parseFloat(getStyle(element).getPropertyValue('font-size'))
                        : this.ascend({ condition: item => item.fontSize > 0 })[0]?.fontSize ?? parseUnit('1rem', isFontFixedWidth(this) ? { fixedWidth: true } : undefined);
                }
            }
            this._fontSize = result;
        }
        return result;
    }

    get style() {
        const result = this._style;
        if (result === undefined) {
            if (this.naturalChild && this.styleElement) {
                if (!this.pseudoElement) {
                    return this._style = getStyle(this._element!);
                }
                else {
                    const element = this._element!;
                    return this._style = getStyle(element.parentElement!, Node.getPseudoElt(element, this.sessionId));
                }
            }
            return this._style = PROXY_INLINESTYLE;
        }
        return result;
    }

    get cssStyle() {
        return { ...this._cssStyle };
    }

    get textStyle() {
        const result = this._textStyle;
        return result === undefined ? this._textStyle = this.cssAsObject(...Node.TEXT_STYLE) : result;
    }

    get elementData() {
        return this._elementData;
    }

    set dir(value) {
        this._cached.dir = value;
    }
    get dir(): string {
        let result = this._cached.dir;
        if (result === undefined) {
            result = this.naturalElement ? (this._element as HTMLElement).dir : '';
            if (result === '') {
                let parent = this.actualParent;
                while (parent !== null) {
                    result = parent.dir;
                    if (result !== '') {
                        break;
                    }
                    parent = parent.actualParent;
                }
            }
            this._cached.dir = result;
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