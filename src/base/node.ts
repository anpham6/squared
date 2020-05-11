import { NODE_ALIGNMENT } from './lib/enumeration';

type T = Node;

const { USER_AGENT, isUserAgent } = squared.lib.client;
const { BOX_BORDER, CSS_UNIT, TEXT_STYLE, checkStyleValue, checkWritingMode, formatPX, getInheritedStyle, getStyle, hasComputedStyle, isLength, isPercent, parseSelectorText, parseUnit } = squared.lib.css;
const { ELEMENT_BLOCK, assignRect, getNamedItem, getRangeClientRect, newBoxRectDimension } = squared.lib.dom;
const { CHAR, CSS, FILE, XML } = squared.lib.regex;
const { actualClientRect, actualTextRangeRect, deleteElementCache, getElementAsNode, getElementCache, getPseudoElt, setElementCache } = squared.lib.session;
const { aboveRange, belowRange, convertCamelCase, convertFloat, convertInt, hasBit, hasValue, isNumber, isObject, isString, iterateArray, spliceString, splitEnclosing } = squared.lib.util;

const { PX, SELECTOR_ATTR, SELECTOR_G, SELECTOR_LABEL, SELECTOR_PSEUDO_CLASS } = CSS;

const REGEX_BACKGROUND = /\s*(url|[a-z-]+gradient)/;
const REGEX_QUERY_LANG = /^:lang\(\s*(.+)\s*\)$/;
const REGEX_QUERY_NTH_CHILD_OFTYPE = /^:nth(-last)?-(child|of-type)\((.+)\)$/;
const REGEX_QUERY_NTH_CHILD_OFTYPE_VALUE = /^(-)?(\d+)?n\s*([+-]\d+)?$/;
const REGEX_EM = /\dem$/;

function setStyleCache(element: HTMLElement, attr: string, sessionId: string, value: string, current: string) {
    if (current !== value) {
        element.style.setProperty(attr, value);
        if (validateCssSet(value, element.style.getPropertyValue(attr))) {
            setElementCache(element, attr, sessionId, value !== 'auto' ? current : '');
            return true;
        }
        return false;
    }
    return true;
}

function deleteStyleCache(element: HTMLElement, attr: string, sessionId: string) {
    const value: string = getElementCache(element, attr, sessionId);
    if (value !== undefined) {
        element.style.setProperty(attr, value);
        deleteElementCache(element, attr, sessionId);
    }
}

const validateCssSet = (value: string, actualValue: string) => value === actualValue || isLength(value, true) && PX.test(actualValue);
const soryById = (a: T, b: T) => a.id < b.id ? -1 : 1;
const getFontSize = (style: CSSStyleDeclaration) => parseFloat(style.getPropertyValue('font-size'));

function setNaturalChildren(this: T): T[] {
    let children: T[];
    if (this.naturalElement) {
        const sessionId = this.sessionId;
        children = [];
        let i = 0;
        (this.element as HTMLElement).childNodes.forEach((element: Element) => {
            const item = getElementAsNode<T>(element, sessionId);
            if (item) {
                item.childIndex = i++;
                children.push(item);
            }
        });
    }
    else {
        children = (this.initial?.children || this.children).slice(0);
    }
    this.naturalChildren = children;
    return children;
}

function setNaturalElements(this: T): T[] {
    const children = this.naturalChildren.filter(item => item.naturalElement);
    this.naturalElements = children;
    return children;
}

function getFlexValue(this: T, attr: string, fallback: number, parent?: Null<Node>): number {
    const value = (parent || this).css(attr);
    if (isNumber(value)) {
        return parseFloat(value);
    }
    else if (value === 'inherit' && !parent) {
        return getFlexValue.call(this, attr, fallback, this.actualParent);
    }
    return fallback;
}

function hasTextAlign(this: T, value: string, localizedValue?: string) {
    const textAlign = this.cssAscend('textAlign', this.textElement && this.blockStatic && !this.hasPX('width'));
    return (textAlign === value || textAlign === localizedValue) && (this.blockStatic ? this.textElement && !this.hasPX('width', true, true) && !this.hasPX('maxWidth', true, true) : this.display.startsWith('inline'));
}

function setDimension(this: T, styleMap: StringMap, attr: DimensionAttr, attrMin: string, attrMax: string) {
    const valueA = styleMap[attr];
    const baseValue = this.parseUnit(valueA, attr);
    let value = Math.max(baseValue, this.parseUnit(styleMap[attrMin], attr));
    if (value === 0 && this.styleElement) {
        const element =  this.element as HTMLInputElement;
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
                    value = isNumber(size) ? parseFloat(size) : this.parseUnit(size, attr);
                    if (value > 0) {
                        this.css(attr, isPercent(size) ? size : size + 'px');
                    }
                }
                break;
            }
        }
    }
    let maxValue = 0;
    if (baseValue > 0 && !this.imageElement) {
        const valueB = styleMap[attrMax];
        if (valueA === valueB) {
            delete styleMap[attrMax];
        }
        else {
            maxValue = this.parseUnit(valueB, attr);
            if (maxValue > 0 && maxValue <= baseValue && isLength(valueA)) {
                maxValue = 0;
                styleMap[attr] = valueB;
                delete styleMap[attrMax];
            }
        }
    }
    return maxValue > 0 ? Math.min(value, maxValue) : value;
}

function setOverflow(this: T) {
    let result = 0;
    if (this.htmlElement && !this.inputElement && !this.imageElement && this.tagName !== 'HR' && !this.documentBody) {
        const element = this.element as HTMLElement;
        const { overflowX, overflowY } = this.cssAsObject('overflowX', 'overflowY');
        if (this.hasHeight && (this.hasPX('height') || this.hasPX('maxHeight')) && (overflowY === 'scroll' || overflowY === 'auto' && element.clientHeight !== element.scrollHeight)) {
            result |= NODE_ALIGNMENT.VERTICAL;
        }
        if ((this.hasPX('width') || this.hasPX('maxWidth')) && (overflowX === 'scroll' || overflowX === 'auto' && element.clientWidth !== element.scrollWidth)) {
            result |= NODE_ALIGNMENT.HORIZONTAL;
        }
    }
    return result;
}

function convertBorderWidth(this: T, dimension: DimensionAttr, border: string[]) {
    if (!this.plainText) {
        switch (this.css(border[0])) {
            case 'none':
            case 'initial':
            case 'hidden':
                return 0;
        }
        const width = this.css(border[1]);
        const result = isLength(width, true) ? this.parseUnit(width, dimension) : convertFloat(this.style[border[1]]);
        if (result > 0) {
            return Math.max(Math.round(result), 1);
        }
    }
    return 0;
}

function convertBox(this: T, attr: string, margin: boolean) {
    switch (this.display) {
        case 'table':
            if (!margin && this.css('borderCollapse') === 'collapse') {
                return 0;
            }
            break;
        case 'table-row':
            return 0;
        case 'table-cell':
            if (margin) {
                switch (this.tagName) {
                    case 'TD':
                    case 'TH':
                        return 0;
                    default: {
                        const parent = this.ascend({ condition: item => item.tagName === 'TABLE'})[0];
                        if (parent) {
                            const [horizontal, vertical] = parent.css('borderSpacing').split(' ');
                            switch (attr) {
                                case 'marginTop':
                                case 'marginBottom':
                                    return vertical ? this.parseUnit(vertical, 'height', false) : this.parseUnit(horizontal, 'width', false);
                                case 'marginRight':
                                    if (this.actualParent!.lastChild !== this) {
                                        return this.parseUnit(horizontal, 'width', false);
                                    }
                                case 'marginLeft':
                                    return 0;
                            }
                        }
                        break;
                    }
                }
                return 0;
            }
            break;
    }
    return this.parseUnit(this.css(attr), 'width', !(this.actualParent?.gridElement === true));
}

function canTextAlign(this: T) {
    return this.naturalChild && (this.inlineVertical || this.length === 0) && !this.floating && this.autoMargin.horizontal !== true;
}

function getInitialValue(this: T, attr: string, modified?: boolean, computed?: boolean) {
    return !this._preferInitial && this._styleMap[attr] || this.cssInitial(attr, modified, computed);
}

function validateQuerySelector(this: T, child: T, selector: QueryData, index: number, last: boolean, adjacent?: string) {
    if (selector.all) {
        return true;
    }
    let tagName = selector.tagName;
    if (tagName && tagName !== child.tagName.toUpperCase()) {
        return false;
    }
    const id = selector.id;
    if (id && id !== child.elementId) {
        return false;
    }
    const { attrList, classList, notList, pseudoList } = selector;
    if (pseudoList) {
        const parent = child.actualParent as T;
        tagName = child.tagName;
        for (const pseudo of pseudoList) {
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
                    let j = 0;
                    for (const item of parent.naturalElements) {
                        if (item.tagName === tagName && ++j > 1) {
                            return false;
                        }
                    }
                    break;
                }
                case ':first-of-type':
                    for (const item of parent.naturalElements) {
                        if (item.tagName === tagName) {
                            if (item !== child) {
                                return false;
                            }
                            break;
                        }
                    }
                    break;
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
                    if (!child.inputElement || child.toElementBoolean('disabled')) {
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
                    if (!child.inputElement || tagName === 'BUTTON' || child.toElementBoolean('required')) {
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
                            const element =  child.element as HTMLInputElement;
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
                                let valid = false;
                                const element = child.element as HTMLElement;
                                iterateArray((form.element as Element).querySelectorAll('*'), (item: HTMLInputElement) => {
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
                        const element =  child.element as HTMLInputElement;
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
                        const element =  child.element as HTMLInputElement;
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
                    else {
                        const element = child.element as HTMLAnchorElement;
                        if (!(location.hash === `#${element.id}` || tagName === 'A' && location.hash === `#${element.name}`)) {
                            return false;
                        }
                    }
                    break;
                case ':scope':
                    if (!last || adjacent === '>' && child !== this) {
                        return false;
                    }
                    break;
                case ':root':
                    if (!last || adjacent) {
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
                    let match = REGEX_QUERY_NTH_CHILD_OFTYPE.exec(pseudo);
                    if (match) {
                        const placement = match[3].trim();
                        let children = parent.naturalElements;
                        if (match[1]) {
                            children = children.slice(0).reverse();
                        }
                        const i = (match[2] === 'child' ? children.indexOf(child) : children.filter(item => item.tagName === tagName).indexOf(child)) + 1;
                        if (i > 0) {
                            if (isNumber(placement)) {
                                if (parseInt(placement) !== i) {
                                    return false;
                                }
                            }
                            else {
                                switch (placement) {
                                    case 'even':
                                        if (i % 2 !== 0) {
                                            return false;
                                        }
                                        break;
                                    case 'odd':
                                        if (i % 2 === 0) {
                                            return false;
                                        }
                                        break;
                                    default: {
                                        const subMatch = REGEX_QUERY_NTH_CHILD_OFTYPE_VALUE.exec(placement);
                                        if (subMatch) {
                                            const modifier = convertInt(subMatch[3]);
                                            if (subMatch[2]) {
                                                if (subMatch[1]) {
                                                    return false;
                                                }
                                                const increment = parseInt(subMatch[2]);
                                                if (increment !== 0) {
                                                    if (i !== modifier) {
                                                        for (let j = increment; ; j += increment) {
                                                            const total = increment + modifier;
                                                            if (total === i) {
                                                                break;
                                                            }
                                                            else if (total > i) {
                                                                return false;
                                                            }
                                                        }
                                                    }
                                                }
                                                else if (i !== modifier) {
                                                    return false;
                                                }
                                            }
                                            else if (subMatch[3]) {
                                                if (modifier > 0) {
                                                    if (subMatch[1]) {
                                                        if (i > modifier) {
                                                            return false;
                                                        }
                                                    }
                                                    else if (i < modifier) {
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
                    else {
                        match = REGEX_QUERY_LANG.exec(pseudo);
                        if (match) {
                            if (child.attributes['lang']?.trim().toLowerCase() === match[1].toLowerCase()) {
                                continue;
                            }
                        }
                    }
                    return false;
                }
            }
        }
    }
    if (notList) {
        for (const not of notList) {
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
                    SELECTOR_ATTR.lastIndex = 0;
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
                    }
                    else {
                        continue;
                    }
                    break;
                }
                default:
                    if (CHAR.WORDDASH.test(not)) {
                        notData.tagName = not;
                    }
                    else {
                        return false;
                    }
                    break;
            }
            if (validateQuerySelector.call(this, child, notData, index, last)) {
                return false;
            }
        }
    }
    if (classList) {
        const elementList = (child.element as HTMLElement).classList;
        for (const className of classList) {
            if (!elementList.contains(className)) {
                return false;
            }
        }
    }
    if (attrList) {
        const attributes = child.attributes;
        for (const attr of attrList) {
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
                const valueA = attr.value;
                if (valueA) {
                    if (attr.caseInsensitive) {
                        value = value.toLowerCase();
                    }
                    if (attr.symbol) {
                        switch (attr.symbol) {
                            case '~':
                                if (!value.split(CHAR.SPACE).includes(valueA)) {
                                    return false;
                                }
                                break;
                            case '^':
                                if (!value.startsWith(valueA)) {
                                    return false;
                                }
                                break;
                            case '$':
                                if (!value.endsWith(valueA)) {
                                    return false;
                                }
                                break;
                            case '*':
                                if (!value.includes(valueA)) {
                                    return false;
                                }
                                break;
                            case '|':
                                if (value !== valueA && !value.startsWith(valueA + '-')) {
                                    return false;
                                }
                                break;
                        }
                    }
                    else if (value !== valueA) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
}

function convertPosition(this: T, attr: string) {
    if (!this.positionStatic) {
        const unit = getInitialValue.call(this, attr, true);
        if (isLength(unit)) {
            return this.parseUnit(unit, attr === 'left' || attr === 'right' ? 'width' : 'height');
        }
        else if (isPercent(unit) && this.styleElement) {
            return convertFloat(this.style[attr]);
        }
    }
    return 0;
}

export default abstract class Node extends squared.lib.base.Container<T> implements squared.base.Node {
    public documentRoot = false;
    public depth = -1;
    public childIndex = Infinity;
    public style!: CSSStyleDeclaration;

    public abstract queryMap?: T[][];

    protected _styleMap!: StringMap;
    protected _cssStyle!: StringMap;
    protected _textBounds!: Null<BoxRectDimension>;
    protected _box?: BoxRectDimension;
    protected _bounds?: BoxRectDimension;
    protected _linear?: BoxRectDimension;
    protected _fontSize?: number;
    protected _initial?: InitialData<T>;

    protected readonly _element: Null<Element> = null;

    protected abstract _cached: CachedValue<T>;
    protected abstract _naturalChildren?: T[];
    protected abstract _naturalElements?: T[];
    protected abstract _preferInitial: boolean;

    private _data = {};
    private _documentBody = false;
    private _inlineText = false;
    private _parent: Null<T> = null;
    private _dataset?: {};
    private _textStyle?: StringMap;

    protected constructor(
        public readonly id: number,
        public readonly sessionId = '0',
        element?: Element)
    {
        super();
        if (element) {
            this._element = element;
            this._documentBody = element === document.body;
        }
        else {
            this.style = {} as CSSStyleDeclaration;
            this._styleMap = {};
            this._cssStyle = {};
        }
    }

    public init() {
        const element = this._element as HTMLElement;
        if (element) {
            const styleElement = this.styleElement;
            const sessionId = this.sessionId;
            const styleMap: StringMap = getElementCache(element, 'styleMap', sessionId) || {};
            let style: CSSStyleDeclaration;
            if (!this.pseudoElement) {
                style = getStyle(element);
                if (styleElement) {
                    const items = Array.from(element.style);
                    const length = items.length;
                    if (length) {
                        const inline = element.style;
                        let i = 0;
                        while (i < length) {
                            const attr = items[i++];
                            styleMap[convertCamelCase(attr)] = inline.getPropertyValue(attr);
                        }
                    }
                }
            }
            else {
                style = getStyle(element.parentElement, getPseudoElt(element, sessionId));
            }
            if (styleElement) {
                const revisedMap: StringMap = {};
                const writingMode = style.writingMode;
                for (let attr in styleMap) {
                    const value = styleMap[attr];
                    const alias = checkWritingMode(attr, writingMode);
                    if (alias !== '') {
                        if (!styleMap[alias]) {
                            attr = alias;
                        }
                        else {
                            continue;
                        }
                    }
                    const result = checkStyleValue(element, attr, value, style);
                    if (result !== '') {
                        revisedMap[attr] = result;
                    }
                }
                this._styleMap = revisedMap;
            }
            else {
                this._styleMap = styleMap;
            }
            this.style = style;
            this._cssStyle = styleMap;
            if (sessionId !== '0') {
                setElementCache(element, 'node', sessionId, this);
            }
        }
    }

    public saveAsInitial(overwrite = false) {
        if (this._initial === undefined || overwrite) {
            this._initial = {
                children: this.duplicate(),
                styleMap: { ...this._styleMap }
            };
        }
    }

    public data(name: string, attr: string, value?: any, overwrite = true) {
        const data = this._data;
        if (hasValue(value)) {
            let obj: {} = data[name];
            if (!isObject(obj)) {
                obj = {};
                data[name] = obj;
            }
            if (overwrite || obj[attr] === undefined) {
                obj[attr] = value;
            }
        }
        else if (value === null) {
            delete data[name];
            return undefined;
        }
        const stored: {} = data[name];
        return isObject(stored) ? stored[attr] : undefined;
    }

    public unsetCache(...attrs: string[]) {
        let length = attrs.length;
        if (length) {
            const cached = this._cached;
            attrs.forEach(attr => {
                switch (attr) {
                    case 'position':
                        if (!this._preferInitial) {
                            this.cascade(item => {
                                if (!item.pageFlow) {
                                    item.unsetCache('absoluteParent');
                                }
                                return false;
                            });
                        }
                        this._cached = {};
                        return;
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
                    case 'maxWidth':
                        cached.overflow = undefined;
                        break;
                    case 'height':
                        cached.actualHeight = undefined;
                        cached.percentHeight = undefined;
                    case 'minHeight':
                        cached.height = undefined;
                        if (!this._preferInitial) {
                            cached.blockVertical = undefined;
                            this.each(item => item.unsetCache('height', 'actualHeight', 'blockVertical', 'overflow', 'bottomAligned'));
                        }
                    case 'maxHeight':
                        cached.overflow = undefined;
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
                    case 'overflowX':
                    case 'overflowY':
                        cached.overflow = undefined;
                        break;
                    default:
                        if (attr.startsWith('margin')) {
                            cached.autoMargin = undefined;
                            cached.rightAligned = undefined;
                            cached.centerAligned = undefined;
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
                            --length;
                        }
                        else if (TEXT_STYLE.includes(attr)) {
                            cached.lineHeight = undefined;
                            this._textStyle = undefined;
                        }
                        else if (!/^(grid|flex|row|column|offset|scroll)/.test(attr)) {
                            --length;
                        }
                        break;
                }
                if (attr in cached) {
                    cached[attr] = undefined;
                }
            });
        }
        else {
            this._cached = {};
            this._textStyle = undefined;
            length = 1;
        }
        if (length !== 0 && !this._preferInitial) {
            this.resetBounds();
            this.cascade(item => {
                item.resetBounds();
                return false;
            });
        }
    }

    public ascend(options: AscendOptions<T>) {
        let attr = options.attr;
        if (!isString(attr)) {
            attr = 'actualParent';
        }
        else if (!/[pP]arent$/.test(attr)) {
            return [];
        }
        const { condition, including, error, every, excluding } = options;
        const result: T[] = [];
        let parent = options.startSelf ? this : this[attr];
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

    public intersectX(rect: BoxRectDimension, dimension: BoxType = 'linear') {
        if (rect.width > 0) {
            const { left, right } = this[dimension];
            const { left: leftA, right: rightA } = rect;
            return (
                Math.ceil(left) >= leftA && Math.floor(left) <= rightA ||
                right >= Math.floor(leftA) && right <= Math.ceil(rightA) ||
                Math.ceil(leftA) >= left && Math.floor(leftA) <= right ||
                rightA >= Math.floor(left) && rightA <= Math.ceil(right)
            );
        }
        return false;
    }

    public intersectY(rect: BoxRectDimension, dimension: BoxType = 'linear') {
        if (rect.height > 0) {
            const { top, bottom } = this[dimension];
            const { top: topA, bottom: bottomA } = rect;
            return (
                Math.ceil(top) >= topA && Math.floor(top) <= bottomA ||
                bottom >= Math.floor(topA) && bottom <= Math.ceil(bottomA) ||
                Math.ceil(topA) >= top && Math.floor(topA) <= bottom ||
                bottomA >= Math.floor(top) && bottomA <= Math.ceil(bottom)
            );
        }
        return false;
    }

    public withinX(rect: BoxRectDimension, dimension: BoxType = 'linear') {
        if (this.pageFlow || rect.width > 0) {
            const bounds = this[dimension];
            return aboveRange(bounds.left, rect.left) && belowRange(bounds.right, rect.right);
        }
        return true;
    }

    public withinY(rect: BoxRectDimension, dimension: BoxType = 'linear') {
        if (this.pageFlow || rect.height > 0) {
            const bounds = this[dimension];
            return Math.ceil(bounds.top) >= rect.top && Math.floor(bounds.bottom) <= rect.bottom;
        }
        return true;
    }

    public outsideX(rect: BoxRectDimension, dimension: BoxType = 'linear') {
        if (this.pageFlow || rect.width > 0) {
            const bounds = this[dimension];
            return bounds.left < Math.floor(rect.left) || bounds.right > Math.ceil(rect.right);
        }
        return false;
    }

    public outsideY(rect: BoxRectDimension, dimension: BoxType = 'linear') {
        if (this.pageFlow || rect.height > 0) {
            const bounds = this[dimension];
            return bounds.top < Math.floor(rect.top) || bounds.bottom > Math.ceil(rect.bottom);
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
        return this._styleMap[attr] || this.styleElement && this.style[attr] || '';
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

    public cssInitial(attr: string, modified = false, computed = false) {
        let value = (this._initial?.styleMap || this._styleMap)[attr] || modified && this._styleMap[attr];
        if (!value && computed) {
            value = this.style[attr];
        }
        return value || '';
    }

    public cssAny(attr: string, ...values: string[]) {
        const result = this.css(attr);
        for (const value of values) {
            if (result === value) {
                return true;
            }
        }
        return false;
    }

    public cssInitialAny(attr: string, ...values: string[]) {
        for (const value of values) {
            if (this.cssInitial(attr) === value) {
                return true;
            }
        }
        return false;
    }

    public cssAscend(attr: string, startSelf = false) {
        let parent = startSelf ? this : this.actualParent;
        let value: string;
        while (parent) {
            value = parent.cssInitial(attr);
            if (value !== '') {
                return value;
            }
            if (parent.documentBody) {
                break;
            }
            parent = parent.actualParent;
        }
        return '';
    }

    public cssSort(attr: string, ascending = true, duplicate = false) {
        return (duplicate ? this.duplicate() : this.children).sort((a, b) => {
            const valueA = a.toFloat(attr, a.childIndex), valueB = b.toFloat(attr, b.childIndex);
            if (valueA === valueB) {
                return 0;
            }
            else if (ascending) {
                return valueA < valueB ? -1 : 1;
            }
            return valueA > valueB ? -1 : 1;
        });
    }

    public cssPX(attr: string, value: number, negative = false, cache = false) {
        const current = this._styleMap[attr];
        if (current && isLength(current)) {
            value += parseUnit(current, this.fontSize);
            if (!negative && value < 0) {
                value = 0;
            }
            const length = formatPX(value);
            this.css(attr, length);
            if (cache) {
                this.unsetCache(attr);
            }
            return length;
        }
        return '';
    }

    public cssSpecificity(attr: string) {
        let result: Undef<number>;
        if (this.styleElement) {
            if (this.pseudoElement) {
                const element = this._element as Element;
                const sessionId = this.sessionId;
                result = getElementCache(element.parentElement as Element, `styleSpecificity${getPseudoElt(element, sessionId)}`, sessionId)?.[attr] as number;
            }
            else {
                result = getElementCache(this._element as Element, 'styleSpecificity', this.sessionId)?.[attr] as number;
            }
        }
        return result || 0;
    }

    public cssTry(attr: string, value: string) {
        if (this.styleElement) {
            const element = this._element as HTMLElement;
            return setStyleCache(element, attr, this.sessionId, value, getStyle(element).getPropertyValue(attr));
        }
        return false;
    }

    public cssFinally(attrs: string | StringMap) {
        if (this.styleElement) {
            if (typeof attrs === 'string') {
                deleteStyleCache(this._element as HTMLElement, attrs, this.sessionId);
            }
            else {
                const sessionId = this.sessionId;
                const element = this._element as HTMLElement;
                for (const attr in attrs) {
                    deleteStyleCache(element, attr, sessionId);
                }
            }
        }
    }

    public cssTryAll(values: StringMap) {
        if (this.styleElement) {
            const sessionId = this.sessionId;
            const element = this._element as HTMLElement;
            const style = getStyle(element);
            const valid: string[] = [];
            for (const attr in values) {
                if (setStyleCache(element, attr, sessionId, values[attr], style.getPropertyValue(attr))) {
                    valid.push(attr);
                }
                else {
                    valid.forEach(value => this.cssFinally(value));
                    return undefined;
                }
            }
            return values;
        }
        return undefined;
    }

    public cssParent(attr: string, value?: string, cache = false) {
        return this.naturalChild ? (this.actualParent as T).css(attr, value, cache) : '';
    }

    public cssCopy(node: T, ...attrs: string[]) {
        const styleMap = this._styleMap;
        attrs.forEach(attr => styleMap[attr] = node.css(attr));
    }

    public cssCopyIfEmpty(node: T, ...attrs: string[]) {
        const styleMap = this._styleMap;
        attrs.forEach(attr => {
            if (!hasValue(styleMap[attr])) {
                styleMap[attr] = node.css(attr);
            }
        });
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
        attrs.forEach(attr => result[attr] = this.css(attr));
        return result;
    }

    public toInt(attr: string, fallback = NaN, initial = false) {
        const value = parseInt((initial && this._initial?.styleMap || this._styleMap)[attr]);
        return isNaN(value) ? fallback : value;
    }

    public toFloat(attr: string, fallback = NaN, initial = false) {
        const value = parseFloat((initial && this._initial?.styleMap || this._styleMap)[attr]);
        return isNaN(value) ? fallback : value;
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
        return (this._element?.[attr] || fallback).toString();
    }

    public parseUnit(value: string, dimension: DimensionAttr = 'width', parent = true, screenDimension?: Dimension) {
        if (value) {
            if (isPercent(value)) {
                const bounds = parent && this.absoluteParent?.box || this.bounds;
                let result = parseFloat(value) / 100;
                switch (dimension) {
                    case 'width':
                        result *= bounds.width;
                        break;
                    case 'height':
                        result *= bounds.height;
                        break;
                }
                return result;
            }
            return parseUnit(value, this.fontSize, screenDimension);
        }
        return 0;
    }

    public has(attr: string, options?: HasOptions) {
        let map: Undef<string>, not: Undef<string | string[]>, type: Undef<number>;
        if (options) {
            ({ map, not, type } = options);
        }
        const value = (map === 'initial' && this._initial?.styleMap || this._styleMap)[attr];
        if (value) {
            switch (value) {
                case 'auto':
                case 'none':
                case 'initial':
                case 'normal':
                case 'rgba(0, 0, 0, 0)':
                    return false;
                case 'baseline':
                    return attr !== 'verticalAlign';
                case 'left':
                case 'start':
                    return attr !== 'textAlign';
                default:
                    if (not) {
                        if (Array.isArray(not)) {
                            for (const exclude of not) {
                                if (value === exclude) {
                                    return false;
                                }
                            }
                        }
                        else if (value === not) {
                            return false;
                        }
                    }
                    if (type) {
                        return hasBit(type, CSS_UNIT.LENGTH) && isLength(value) || hasBit(type, CSS_UNIT.PERCENT) && isPercent(value);
                    }
                    return true;
            }
        }
        return false;
    }

    public hasPX(attr: string, percent = true, initial = false) {
        return isLength((initial && this._initial?.styleMap || this._styleMap)[attr], percent);
    }

    public setBounds(cache = true) {
        let bounds: Undef<BoxRectDimension>;
        if (this.styleElement) {
            if (!cache) {
                deleteElementCache(this._element as Element, 'clientRect', this.sessionId);
            }
            bounds = assignRect(actualClientRect(this._element as Element, this.sessionId));
            this._bounds = bounds;
        }
        else if (this.plainText) {
            const rect = getRangeClientRect(this._element as Element);
            bounds = assignRect(rect);
            const lines = rect.numberOfLines as number;
            bounds.numberOfLines = lines;
            this._bounds = bounds;
            this._textBounds = bounds;
            this._cached.multiline = lines > 1;
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
        this._textBounds = undefined as any;
        this._cached.multiline = undefined;
    }

    public querySelector(value: string) {
        return this.querySelectorAll(value, 1)[0] || null;
    }

    public querySelectorAll(value: string, resultCount = -1) {
        let result: T[] = [];
        const queryMap = this.queryMap;
        if (queryMap && resultCount !== 0) {
            const queries = parseSelectorText(value);
            let length = queries.length;
            let i = 0;
            while (i < length) {
                const query = queries[i++];
                const selectors: QueryData[] = [];
                let offset = -1;
                invalid: {
                    if (query === '*') {
                        selectors.push({ all: true });
                        ++offset;
                    }
                    else {
                        SELECTOR_G.lastIndex = 0;
                        let adjacent: Undef<string>;
                        let match: Null<RegExpExecArray>;
                        while ((match = SELECTOR_G.exec(query)) !== null) {
                            let segment = match[1];
                            let all = false;
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
                                let tagName: Undef<string>;
                                let id: Undef<string>;
                                let classList: Undef<string[]>;
                                let attrList: Undef<QueryAttribute[]>;
                                let pseudoList: Undef<string[]>;
                                let notList: Undef<string[]>;
                                let subMatch: Null<RegExpExecArray>;
                                while ((subMatch = SELECTOR_ATTR.exec(segment)) !== null) {
                                    if (attrList === undefined) {
                                        attrList = [];
                                    }
                                    let key = subMatch[1].replace('\\:', ':');
                                    let endsWith = false;
                                    switch (key.indexOf('|')) {
                                        case -1:
                                            break;
                                        case 1:
                                            if (key.charAt(0) === '*') {
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
                                while ((subMatch = SELECTOR_PSEUDO_CLASS.exec(segment)) !== null) {
                                    const pseudoClass = subMatch[0];
                                    if (pseudoClass.startsWith(':not(')) {
                                        if (subMatch[1]) {
                                            if (notList === undefined) {
                                                notList = [];
                                            }
                                            notList.push(subMatch[1]);
                                        }
                                    }
                                    else {
                                        if (pseudoList === undefined) {
                                            pseudoList = [];
                                        }
                                        pseudoList.push(pseudoClass);
                                    }
                                    segment = spliceString(segment, subMatch.index, pseudoClass.length);
                                }
                                while ((subMatch = SELECTOR_LABEL.exec(segment)) !== null) {
                                    const label = subMatch[0];
                                    switch (label.charAt(0)) {
                                        case '#':
                                            id = label.substring(1);
                                            break;
                                        case '.':
                                            if (classList === undefined) {
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
                }
                length = queryMap.length;
                if (selectors.length && offset !== -1 && offset < length) {
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
                            const dataMap = queryMap[j++];
                            if (dataEnd.all) {
                                pending = pending.concat(dataMap);
                            }
                            else {
                                const q = dataMap.length;
                                let k = 0;
                                while (k < q) {
                                    const node = dataMap[k++];
                                    if ((currentCount === 0 || !result.includes(node)) && validateQuerySelector.call(this, node, dataEnd, i, lastEnd)) {
                                        pending.push(node);
                                    }
                                }
                            }
                        }
                    }
                    if (selectors.length) {
                        const depth = this.depth;
                        selectors.reverse();
                        length = selectors.length;
                        const ascendQuerySelector = (index: number, adjacent: Undef<string>, nodes: T[]): boolean => {
                            const selector = selectors[index];
                            const last = index === length - 1;
                            const next: T[] = [];
                            const q = nodes.length;
                            let j = 0;
                            while (j < q) {
                                const node = nodes[j++];
                                if (adjacent) {
                                    const parent = node.actualParent as T;
                                    if (adjacent === '>') {
                                        if (validateQuerySelector.call(this, parent, selector, i, last, adjacent)) {
                                            next.push(parent);
                                        }
                                    }
                                    else {
                                        const children = parent.naturalElements;
                                        switch (adjacent) {
                                            case '+': {
                                                const indexA = children.indexOf(node);
                                                if (indexA > 0) {
                                                    const sibling = children[indexA - 1];
                                                    if (sibling && validateQuerySelector.call(this, sibling, selector, i, last, adjacent)) {
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
                                                    if (sibling === node) {
                                                        break;
                                                    }
                                                    else if (validateQuerySelector.call(this, sibling, selector, i, last, adjacent)) {
                                                        next.push(sibling);
                                                    }
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                                else if (node.depth - depth >= length - index) {
                                    let parent = node.actualParent as T;
                                    do {
                                        if (validateQuerySelector.call(this, parent, selector, i, last)) {
                                            next.push(parent);
                                        }
                                        parent = parent.actualParent as T;
                                    }
                                    while (parent);
                                }
                            }
                            if (next.length) {
                                if (++index === length) {
                                    return true;
                                }
                                return ascendQuerySelector(index, selector.adjacent, next);
                            }
                            return false;
                        };
                        let count = currentCount;
                        const r = pending.length;
                        let j = 0;
                        while (j < r) {
                            const node = pending[j++];
                            if ((currentCount === 0 || !result.includes(node)) && ascendQuerySelector(0, dataEnd.adjacent, [node])) {
                                result.push(node);
                                if (++count === resultCount) {
                                    return result.sort(soryById);
                                }
                            }
                        }
                    }
                    else if (currentCount === 0) {
                        if (i === queries.length - 1 || resultCount > 0 && resultCount <= pending.length) {
                            if (resultCount > 0 && pending.length > resultCount) {
                                pending.length = resultCount;
                            }
                            return pending.sort(soryById);
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
                                        return result.sort(soryById);
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
        return result.sort(soryById);
    }

    set parent(value) {
        if (value) {
            const parent = this._parent;
            if (value !== parent) {
                parent?.remove(this);
                this._parent = value;
            }
            if (!value.contains(this)) {
                value.append(this);
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
        let result = this._cached.tagName;
        if (result === undefined) {
            const element = this._element as HTMLElement;
            if (element) {
                const nodeName = element.nodeName;
                result = nodeName.charAt(0) === '#' ? nodeName : element.tagName;
            }
            else {
                result = '';
            }
            this._cached.tagName = result;
        }
        return result;
    }

    get element() {
        return this._element;
    }

    get elementId() {
        return this._element?.id || '';
    }

    get htmlElement() {
        let result = this._cached.htmlElement;
        if (result === undefined) {
            result = !this.plainText && this._element instanceof HTMLElement;
            this._cached.htmlElement = result;
        }
        return result;
    }

    get svgElement() {
        let result = this._cached.svgElement;
        if (result === undefined) {
            result = !this.htmlElement && !this.plainText && this._element instanceof SVGElement || this.imageElement && FILE.SVG.test(this.toElementString('src'));
            this._cached.svgElement = result;
        }
        return result;
    }

    get styleElement() {
        return this.htmlElement || this.svgElement;
    }

    get naturalChild() {
        return true;
    }

    get naturalElement() {
        let result = this._cached.naturalElement;
        if (result === undefined) {
            result = this.naturalChild && this.styleElement && !this.pseudoElement;
            this._cached.naturalElement = result;
        }
        return result;
    }

    get pseudoElement() {
        return false;
    }

    get imageElement() {
        return this.tagName === 'IMG';
    }

    get flexElement() {
        let result = this._cached.flexElement;
        if (result === undefined) {
            result = this.display.endsWith('flex');
            this._cached.flexElement = result;
        }
        return result;
    }

    get gridElement() {
        let result = this._cached.gridElement;
        if (result === undefined) {
            result = this.display.endsWith('grid');
            this._cached.gridElement = result;
        }
        return result;
    }

    get textElement() {
        let result = this._cached.textElement;
        if (result === undefined) {
            result = this.plainText || this.inlineText && !this.inputElement;
            this._cached.textElement = result;
        }
        return result;
    }

    get tableElement() {
        let result = this._cached.tableElement;
        if (result === undefined) {
            result = this.tagName === 'TABLE' || this.display === 'table';
            this._cached.tableElement = result;
        }
        return result;
    }

    get inputElement() {
        let result = this._cached.inputElement;
        if (result === undefined) {
            switch (this.tagName) {
                case 'INPUT':
                case 'BUTTON':
                case 'SELECT':
                case 'TEXTAREA':
                    result = true;
                    break;
                default:
                    result = false;
                    break;
            }
            this._cached.inputElement = result;
        }
        return result;
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

    get documentBody() {
        return this._documentBody;
    }

    get initial() {
        return this._initial;
    }

    get bounds() {
        return this._bounds || this.setBounds(false) || assignRect(this.boundingClientRect);
    }

    get linear() {
        let result = this._linear;
        if (result === undefined) {
            const bounds = this.bounds;
            if (bounds) {
                if (this.styleElement) {
                    const { marginBottom, marginRight } = this;
                    const marginTop = Math.max(this.marginTop, 0);
                    const marginLeft = Math.max(this.marginLeft, 0);
                    result = {
                        top: bounds.top - marginTop,
                        right: bounds.right + marginRight,
                        bottom: bounds.bottom + marginBottom,
                        left: bounds.left - marginLeft,
                        width: bounds.width + marginLeft + marginRight,
                        height: bounds.height + marginTop + marginBottom
                    };
                }
                else {
                    result = bounds;
                }
            }
            else {
                result = newBoxRectDimension();
            }
            this._linear = result;
        }
        return result;
    }

    get box() {
        let result = this._box;
        if (result === undefined) {
            const bounds = this.bounds;
            if (bounds) {
                if (this.styleElement) {
                    result = {
                        top: bounds.top + (this.paddingTop + this.borderTopWidth),
                        right: bounds.right - (this.paddingRight + this.borderRightWidth),
                        bottom: bounds.bottom - (this.paddingBottom + this.borderBottomWidth),
                        left: bounds.left + (this.paddingLeft + this.borderLeftWidth),
                        width: bounds.width - this.contentBoxWidth,
                        height: bounds.height - this.contentBoxHeight
                    };
                }
                else {
                    result = bounds;
                }
            }
            else {
                result = newBoxRectDimension();
            }
            this._box = result;
        }
        return result;
    }

    get dataset(): DOMStringMap {
        if (this.styleElement) {
            return (this._element as HTMLElement).dataset;
        }
        else {
            let result = this._dataset;
            if (result === undefined) {
                result = {};
                this._dataset = result;
            }
            return result;
        }
    }

    get flexdata() {
        let result = this._cached.flexdata;
        if (result === undefined) {
            if (this.flexElement) {
                const { flexWrap, flexDirection, alignContent, justifyContent } = this.cssAsObject('flexWrap', 'flexDirection', 'alignContent', 'justifyContent');
                const row = flexDirection.startsWith('row');
                result = {
                    row,
                    column: !row,
                    reverse: flexDirection.endsWith('reverse'),
                    wrap: flexWrap.startsWith('wrap'),
                    wrapReverse: flexWrap === 'wrap-reverse',
                    alignContent,
                    justifyContent
                };
            }
            else {
                result = {};
            }
            this._cached.flexdata = result;
        }
        return result;
    }

    get flexbox() {
        let result = this._cached.flexbox;
        if (result === undefined) {
            if (this.actualParent?.flexElement && this.styleElement) {
                const alignSelf = this.css('alignSelf');
                const justifySelf = this.css('justifySelf');
                result = {
                    alignSelf: alignSelf === 'auto' ? this.cssParent('alignItems') : alignSelf,
                    justifySelf: justifySelf === 'auto' ? this.cssParent('justifyItems') : justifySelf,
                    basis: this.css('flexBasis'),
                    grow: getFlexValue.call(this, 'flexGrow', 0),
                    shrink: getFlexValue.call(this, 'flexShrink', 1),
                    order: this.toInt('order', 0)
                };
            }
            else {
                result = {} as FlexBox;
            }
            this._cached.flexbox = result;
        }
        return result;
    }

    get width() {
        let result = this._cached.width;
        if (result === undefined) {
            result = setDimension.call(this, this._styleMap, 'width', 'minWidth', 'maxWidth');
            this._cached.width = result;
        }
        return result;
    }
    get height() {
        let result = this._cached.height;
        if (result === undefined) {
            result = setDimension.call(this, this._styleMap, 'height', 'minHeight', 'maxHeight');
            this._cached.height = result;
        }
        return result;
    }

    get hasWidth() {
        let result = this._cached.hasWidth;
        if (result === undefined) {
            result = this.width > 0;
            this._cached.hasWidth = result;
        }
        return result;
    }
    get hasHeight(): boolean {
        let result = this._cached.hasHeight;
        if (result === undefined) {
            const value = this.css('height');
            if (isPercent(value)) {
                if (this.pageFlow) {
                    result = this.actualParent?.hasHeight || this.documentBody;
                }
                else {
                    result = this.css('position') === 'fixed' || this.hasPX('top') || this.hasPX('bottom');
                }
            }
            else {
                result = this.height > 0 || this.hasPX('height', false);
            }
            this._cached.hasHeight = result;
        }
        return result;
    }

    get lineHeight() {
        let result = this._cached.lineHeight;
        if (result === undefined) {
            result = 0;
            if (!this.imageElement && !this.svgElement) {
                let hasOwnStyle = this.has('lineHeight');
                let value = 0;
                if (hasOwnStyle) {
                    const lineHeight = this.css('lineHeight');
                    if (isPercent(lineHeight)) {
                        value = convertFloat(this.style.lineHeight);
                    }
                    else if (isNumber(lineHeight)) {
                        value = parseFloat(lineHeight) * this.fontSize;
                    }
                    else {
                        value = parseUnit(lineHeight, this.fontSize);
                        if (PX.test(lineHeight) && this._cssStyle.lineHeight !== 'inherit') {
                            const fontSize = getInitialValue.call(this, 'fontSize');
                            if (REGEX_EM.test(fontSize)) {
                                value *= parseFloat(fontSize);
                            }
                        }
                    }
                }
                else {
                    const parent = this.ascend({ condition: item => item.lineHeight > 0 })[0];
                    if (parent) {
                        value = parent.lineHeight;
                    }
                    if (this.styleElement) {
                        const fontSize = getInitialValue.call(this, 'fontSize');
                        if (REGEX_EM.test(fontSize)) {
                            const emSize = parseFloat(fontSize);
                            if (emSize !== 1) {
                                value *= emSize;
                                this.css('lineHeight', formatPX(value));
                                hasOwnStyle = true;
                            }
                        }
                    }
                }
                if (hasOwnStyle || value > this.height || this.multiline || this.block && this.naturalChildren.some(node => node.textElement)) {
                    result = value;
                }
            }
            this._cached.lineHeight = result;
        }
        return result;
    }

    get display() {
        return this.css('display');
    }

    get positionStatic() {
        let result = this._cached.positionStatic;
        if (result === undefined) {
            switch (this.css('position')) {
                case 'fixed':
                case 'absolute':
                    result = false;
                    break;
                case 'relative':
                    if (!this.documentBody) {
                        result = !this.hasPX('top') && !this.hasPX('right') && !this.hasPX('bottom') && !this.hasPX('left');
                        if (result) {
                            this._cached.positionRelative = false;
                        }
                    }
                    else {
                        result = false;
                    }
                    break;
                case 'inherit': {
                    const element = this._element;
                    const position = element?.parentElement ? getInheritedStyle(element.parentElement, 'position') : '';
                    result = position !== '' && !(position === 'absolute' || position === 'fixed');
                    break;
                }
                default:
                    result = true;
                    break;
            }
            this._cached.positionStatic = result;
        }
        return result;
    }

    get positionRelative() {
        let result = this._cached.positionRelative;
        if (result === undefined) {
            result = this.css('position') === 'relative';
            this._cached.positionRelative = result;
        }
        return result;
    }

    get top() {
        let result = this._cached.top;
        if (result === undefined) {
            result = convertPosition.call(this, 'top');
            this._cached.top = result;
        }
        return result;
    }
    get right() {
        let result = this._cached.right;
        if (result === undefined) {
            result = convertPosition.call(this, 'right');
            this._cached.right = result;
        }
        return result;
    }
    get bottom() {
        let result = this._cached.bottom;
        if (result === undefined) {
            result = convertPosition.call(this, 'bottom');
            this._cached.bottom = result;
        }
        return result;
    }
    get left() {
        let result = this._cached.left;
        if (result === undefined) {
            result = convertPosition.call(this, 'left');
            this._cached.left = result;
        }
        return result;
    }

    get marginTop() {
        let result = this._cached.marginTop;
        if (result === undefined) {
            result = this.inlineStatic ? 0 : convertBox.call(this, 'marginTop', true);
            this._cached.marginTop = result;
        }
        return result;
    }
    get marginRight() {
        let result = this._cached.marginRight;
        if (result === undefined) {
            result = convertBox.call(this, 'marginRight', true);
            this._cached.marginRight = result;
        }
        return result;
    }
    get marginBottom() {
        let result = this._cached.marginBottom;
        if (result === undefined) {
            result = this.inlineStatic ? 0 : convertBox.call(this, 'marginBottom', true);
            this._cached.marginBottom = result;
        }
        return result;
    }
    get marginLeft() {
        let result = this._cached.marginLeft;
        if (result === undefined) {
            result = convertBox.call(this, 'marginLeft', true);
            this._cached.marginLeft = result;
        }
        return result;
    }

    get borderTopWidth() {
        let result = this._cached.borderTopWidth;
        if (result === undefined) {
            result = convertBorderWidth.call(this, 'height', BOX_BORDER[0]);
            this._cached.borderTopWidth = result;
        }
        return result;
    }
    get borderRightWidth() {
        let result = this._cached.borderRightWidth;
        if (result === undefined) {
            result = convertBorderWidth.call(this, 'height', BOX_BORDER[1]);
            this._cached.borderRightWidth = result;
        }
        return result;
    }
    get borderBottomWidth() {
        let result = this._cached.borderBottomWidth;
        if (result === undefined) {
            result = convertBorderWidth.call(this, 'width', BOX_BORDER[2]);
            this._cached.borderBottomWidth = result;
        }
        return result;
    }
    get borderLeftWidth() {
        let result = this._cached.borderLeftWidth;
        if (result === undefined) {
            result = convertBorderWidth.call(this, 'width', BOX_BORDER[3]);
            this._cached.borderLeftWidth = result;
        }
        return result;
    }

    get paddingTop() {
        let result = this._cached.paddingTop;
        if (result === undefined) {
            result = convertBox.call(this, 'paddingTop', false);
            this._cached.paddingTop = result;
        }
        return result;
    }
    get paddingRight() {
        let result = this._cached.paddingRight;
        if (result === undefined) {
            result = convertBox.call(this, 'paddingRight', false);
            this._cached.paddingRight = result;
        }
        return result;
    }
    get paddingBottom() {
        let result = this._cached.paddingBottom;
        if (result === undefined) {
            result = convertBox.call(this, 'paddingBottom', false);
            this._cached.paddingBottom = result;
        }
        return result;
    }
    get paddingLeft() {
        let result = this._cached.paddingLeft;
        if (result === undefined) {
            result = convertBox.call(this, 'paddingLeft', false);
            this._cached.paddingLeft = result;
        }
        return result;
    }

    get contentBox() {
        return this.css('boxSizing') !== 'border-box' || this.tableElement && isUserAgent(USER_AGENT.FIREFOX);
    }

    get contentBoxWidth() {
        let result = this._cached.contentBoxWidth;
        if (result === undefined) {
            result = this.tableElement && this.css('borderCollapse') === 'collapse' ? 0 : this.borderLeftWidth + this.paddingLeft + this.paddingRight + this.borderRightWidth;
            this._cached.contentBoxWidth = result;
        }
        return result;
    }

    get contentBoxHeight() {
        let result = this._cached.contentBoxHeight;
        if (result === undefined) {
            result = this.tableElement && this.css('borderCollapse') === 'collapse' ? 0 : this.borderTopWidth + this.paddingTop + this.paddingBottom + this.borderBottomWidth;
            this._cached.contentBoxHeight = result;
        }
        return result;
    }

    get inline() {
        let result = this._cached.inline;
        if (result === undefined) {
            const value = this.display;
            result = value === 'inline' || value === 'initial' && !ELEMENT_BLOCK.includes(this.tagName);
            this._cached.inline = result;
        }
        return result;
    }

    get inlineStatic() {
        let result = this._cached.inlineStatic;
        if (result === undefined) {
            result = this.inline && this.pageFlow && !this.floating && !this.imageElement;
            this._cached.inlineStatic = result;
        }
        return result;
    }

    get inlineVertical() {
        let result = this._cached.inlineVertical;
        if (result === undefined) {
            if (this.naturalElement && !this.floating) {
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
        let result = this._cached.inlineDimension;
        if (result === undefined) {
            result = this.naturalElement && (this.display.startsWith('inline-') || this.floating);
            this._cached.inlineDimension = result;
        }
        return result;
    }

    set inlineText(value) {
        switch (this.tagName) {
            case 'INPUT':
            case 'IMG':
            case 'SELECT':
            case 'SVG':
            case 'BR':
            case 'HR':
            case 'TEXTAREA':
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
                this._cached.textElement = undefined;
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
                case 'initial':
                    result = ELEMENT_BLOCK.includes(this.tagName);
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
        let result = this._cached.blockStatic;
        if (result === undefined) {
            result = this.pageFlow && (this.block && !this.floating || this.lineBreak || this.blockDimension && (getInitialValue.call(this, 'width') === '100%' || getInitialValue.call(this, 'minWidth') === '100%') && !this.hasPX('maxWidth'));
            this._cached.blockStatic = result;
        }
        return result;
    }

    get blockDimension() {
        let result = this._cached.blockDimension;
        if (result === undefined) {
            if (this.block || this.floating || this.imageElement || this.svgElement) {
                result = true;
            }
            else {
                const value = this.display;
                result = value.startsWith('inline-') || value === 'table';
            }
            this._cached.blockDimension = result;
        }
        return result;
    }

    get blockVertical() {
        let result = this._cached.blockVertical;
        if (result === undefined) {
            result = this.blockDimension && this.hasHeight;
            this._cached.blockVertical = result;
        }
        return result;
    }

    get pageFlow() {
        let result = this._cached.pageFlow;
        if (result === undefined) {
            result = this.positionStatic || this.positionRelative;
            this._cached.pageFlow = result;
        }
        return result;
    }

    get inlineFlow() {
        let result = this._cached.inlineFlow;
        if (result === undefined) {
            result = this.inline || this.inlineDimension || this.inlineVertical || this.imageElement;
            this._cached.inlineFlow = result;
        }
        return result;
    }

    get centerAligned() {
        let result = this._cached.centerAligned;
        if (result === undefined) {
            if (!this.pageFlow) {
                result = this.hasPX('left') && this.hasPX('right');
            }
            else {
                result = this.autoMargin.leftRight || canTextAlign.call(this) && hasTextAlign.call(this, 'center');
            }
            this._cached.centerAligned = result;
        }
        return result;
    }

    get rightAligned() {
        let result = this._cached.rightAligned;
        if (result === undefined) {
            if (!this.pageFlow) {
                result = this.hasPX('right') && !this.hasPX('left');
            }
            else {
                result = this.float === 'right' || this.autoMargin.left || canTextAlign.call(this) && hasTextAlign.call(this, 'right', 'end');
            }
            this._cached.rightAligned = result;
        }
        return result;
    }

    get bottomAligned() {
        let result = this._cached.bottomAligned;
        if (result === undefined) {
            if (!this.pageFlow) {
                result = this.hasPX('bottom') && !this.hasPX('top');
            }
            else {
                result = this.actualParent?.hasHeight === true && this.autoMargin.top === true;
            }
            this._cached.bottomAligned = result;
        }
        return result;
    }

    get autoMargin() {
        let result = this._cached.autoMargin;
        if (result === undefined) {
            if (!this.pageFlow || this.blockStatic || this.display === 'table') {
                const styleMap = this._styleMap;
                const left = styleMap.marginLeft === 'auto' && (this.pageFlow || this.hasPX('right'));
                const right = styleMap.marginRight === 'auto' && (this.pageFlow || this.hasPX('left'));
                const top = styleMap.marginTop === 'auto' && (this.pageFlow || this.hasPX('bottom'));
                const bottom = styleMap.marginBottom === 'auto' && (this.pageFlow || this.hasPX('top'));
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
            this._cached.autoMargin = result;
        }
        return result;
    }

    get floating() {
        let result = this._cached.floating;
        if (result === undefined) {
            result = this.float !== 'none';
            this._cached.floating = result;
        }
        return result;
    }

    get float() {
        let result = this._cached.float;
        if (result === undefined) {
            result = this.pageFlow && this.css('float') || 'none';
            this._cached.float = result;
        }
        return result;
    }

    get zIndex() {
        return this.toInt('zIndex', 0);
    }

    get textContent() {
        let result = this._cached.textContent;
        if (result === undefined) {
            result = this.naturalChild && !this.svgElement ? (this._element as Element).textContent as string : '';
            this._cached.textContent = result;
        }
        return result;
    }

    get overflowX() {
        let result = this._cached.overflow;
        if (result === undefined) {
            result = setOverflow.call(this);
            this._cached.overflow = result;
        }
        return hasBit(result, NODE_ALIGNMENT.HORIZONTAL);
    }
    get overflowY() {
        let result = this._cached.overflow;
        if (result === undefined) {
            result = setOverflow.call(this);
            this._cached.overflow = result;
        }
        return hasBit(result, NODE_ALIGNMENT.VERTICAL);
    }

    get baseline() {
        let result = this._cached.baseline;
        if (result === undefined) {
            if (this.pageFlow && !this.floating) {
                const value = this.css('verticalAlign');
                result = value === 'baseline' || value === 'initial' || this.naturalElements.length === 0 && isLength(value, true);
            }
            else {
                result = false;
            }
            this._cached.baseline = result;
        }
        return result;
    }

    get verticalAlign() {
        let result = this._cached.verticalAlign;
        if (result === undefined) {
            if (this.pageFlow) {
                result = this.css('verticalAlign');
                if (isLength(result, true)) {
                    result = this.parseUnit(result, 'height') + 'px';
                }
            }
            else {
                result = '0px';
            }
            this._cached.verticalAlign = result;
        }
        return result;
    }

    set textBounds(value) {
        this._textBounds = value;
    }
    get textBounds() {
        let result = this._textBounds;
        if (result === undefined) {
            result = null;
            if (this.naturalChild) {
                if (this.textElement) {
                    result = actualTextRangeRect(this._element as Element, this.sessionId);
                }
                else {
                    const children = this.naturalChildren;
                    const length = children.length;
                    if (length) {
                        let top = Infinity, right = -Infinity, bottom = -Infinity, left = Infinity;
                        let numberOfLines = 0;
                        let i = 0;
                        while (i < length) {
                            const node = children[i++];
                            if (node.textElement) {
                                const rect = actualTextRangeRect(node.element as Element, node.sessionId);
                                top = Math.min(rect.top, top);
                                right = Math.max(rect.right, right);
                                left = Math.min(rect.left, left);
                                bottom = Math.max(rect.bottom, bottom);
                                numberOfLines += rect.numberOfLines || 0;
                            }
                        }
                        if (numberOfLines > 0) {
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
            }
            this._textBounds = result;
        }
        return result;
    }

    get multiline() {
        let result = this._cached.multiline;
        if (result === undefined) {
            if (this.plainText) {
                result = Math.floor(getRangeClientRect(this._element as Element).width) > (this.actualParent as T).box.width;
            }
            else if (this.styleText && (this.inlineFlow || this.naturalElements.length === 0)) {
                result = this.textBounds?.numberOfLines as number > 1;
            }
            else {
                result = false;
            }
            this._cached.multiline = result;
        }
        return result;
    }

    get backgroundColor() {
        let result = this._cached.backgroundColor;
        if (result === undefined) {
            result = this.css('backgroundColor');
            switch (result) {
                case 'initial':
                case 'transparent':
                case 'rgba(0, 0, 0, 0)':
                    result = '';
                    break;
                default:
                    if (result !== '' && this.pageFlow && this.styleElement && !this.inputElement && (!this._initial || getInitialValue.call(this, 'backgroundColor') === result)) {
                        let parent = this.actualParent;
                        while (parent) {
                            const color = getInitialValue.call(parent, 'backgroundColor', true);
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
            this._cached.backgroundColor = result;
        }
        return result;
    }

    get backgroundImage() {
        let result = this._cached.backgroundImage;
        if (result === undefined) {
            let value = this.css('backgroundImage');
            if (value !== '' && value !== 'none' && value !== 'initial') {
                result = value;
            }
            else {
                value = this.css('background');
                if (REGEX_BACKGROUND.test(value)) {
                    const segments: string[] = [];
                    const background = splitEnclosing(value);
                    const length = background.length;
                    for (let i = 1; i < length; ++i) {
                        const name = background[i - 1].trim();
                        if (REGEX_BACKGROUND.test(name)) {
                            segments.push(name + background[i]);
                        }
                    }
                    result = segments.join(', ');
                }
                else {
                    result = '';
                }
            }
            this._cached.backgroundImage = result;
        }
        return result;
    }

    get percentWidth() {
        let result = this._cached.percentWidth;
        if (result === undefined) {
            const value = getInitialValue.call(this, 'width');
            result = isPercent(value) ? parseFloat(value) / 100 : 0;
            this._cached.percentWidth = result;
        }
        return result;
    }
    get percentHeight() {
        let result = this._cached.percentHeight;
        if (result === undefined) {
            const value = getInitialValue.call(this, 'height');
            result = isPercent(value) && (this.actualParent?.hasHeight || this.css('position') === 'fixed') ? parseFloat(value) / 100 : 0;
            this._cached.percentHeight = result;
        }
        return result;
    }

    get visibleStyle() {
        let result = this._cached.visibleStyle;
        if (result === undefined) {
            if (this.plainText) {
                result = {
                    background: false,
                    borderWidth: false,
                    backgroundImage: false,
                    backgroundColor: false,
                    backgroundRepeat: false,
                    backgroundRepeatX: false,
                    backgroundRepeatY: false
                };
            }
            else {
                const borderWidth = this.borderTopWidth > 0 || this.borderRightWidth > 0 || this.borderBottomWidth > 0 || this.borderLeftWidth > 0;
                const backgroundColor = this.backgroundColor !== '';
                const backgroundImage = this.backgroundImage !== '';
                let backgroundRepeatX = false, backgroundRepeatY = false;
                if (backgroundImage) {
                    this.css('backgroundRepeat').split(XML.SEPARATOR).forEach(repeat => {
                        const [repeatX, repeatY] = repeat.split(CHAR.SPACE);
                        if (!backgroundRepeatX) {
                            backgroundRepeatX = repeatX === 'repeat' || repeatX === 'repeat-x';
                        }
                        if (!backgroundRepeatY) {
                            backgroundRepeatY = repeatX === 'repeat' || repeatX === 'repeat-y' || repeatY === 'repeat';
                        }
                    });
                }
                result = {
                    background: borderWidth || backgroundImage || backgroundColor,
                    borderWidth,
                    backgroundImage,
                    backgroundColor,
                    backgroundRepeat: backgroundRepeatX || backgroundRepeatY,
                    backgroundRepeatX,
                    backgroundRepeatY
                };
            }
            this._cached.visibleStyle = result;
        }
        return result;
    }

    get absoluteParent() {
        let result = this._cached.absoluteParent;
        if (result === undefined) {
            result = this.actualParent;
            if (!this.pageFlow && !this.documentBody) {
                while (result && !result.documentBody) {
                    switch (getInitialValue.call(result, 'position', false, true)) {
                        case 'static':
                        case 'initial':
                        case 'unset':
                            result = result.actualParent;
                            continue;
                    }
                    break;
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
        let result = this._cached.actualParent;
        if (result === undefined) {
            const parentElement = this._element?.parentElement;
            result = parentElement && getElementAsNode<T>(parentElement, this.sessionId) || null;
            this._cached.actualParent = result;
        }
        return result;
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
                        result = Math.min(bounds.width, (this.actualParent as T).box.width);
                        break;
                    default:
                        result = Math.min(bounds.right - bounds.left, (this.actualParent as T).box.width);
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
            if (!this.inlineStatic && this.display !== 'table-cell' && !(this.actualParent?.flexdata.column === true)) {
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
            else {
                result = this.bounds.height;
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
        return this._naturalChildren || setNaturalChildren.call(this);
    }

    set naturalElements(value) {
        this._naturalElements = value;
    }
    get naturalElements() {
        return this._naturalElements || setNaturalElements.call(this);
    }

    get firstChild(): Null<T> {
        return this.naturalElements[0] || null;
    }

    get lastChild() {
        const children = this.naturalElements;
        const length = children.length;
        return length ? children[length - 1] : null;
    }

    get firstStaticChild() {
        for (const node of this.naturalChildren) {
            if (node.pageFlow) {
                return node;
            }
        }
        return null;
    }

    get lastStaticChild() {
        const children = this.naturalChildren;
        let i = children.length - 1;
        while (i >= 0) {
            const node = children[i--];
            if (node.pageFlow) {
                return node;
            }
        }
        return null;
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
                const attributes = (this._element as Element).attributes;
                const length = attributes.length;
                let i = 0;
                while (i < length) {
                    const { name, value } = attributes.item(i++) as Attr;
                    result[name] = value;
                }
            }
            this._cached.attributes = result;
        }
        return result;
    }

    get boundingClientRect() {
        return (this.naturalElement && this._element?.getBoundingClientRect() || this._bounds || newBoxRectDimension()) as DOMRect;
    }

    get fontSize(): number {
        let result = this._fontSize;
        if (result === undefined) {
            if (this.naturalChild && this.styleElement) {
                const value = this.css('fontSize');
                if (PX.test(value)) {
                    result = parseFloat(value);
                }
                else if (isPercent(value) && !this.documentBody) {
                    result = (this.actualParent?.fontSize || getFontSize(getStyle(document.body))) * parseFloat(value) / 100;
                }
                else {
                    result = getFontSize(this.style);
                }
            }
            else {
                result = parseUnit(this.css('fontSize'));
            }
            if (result === 0 && !this.naturalChild) {
                const element = this.element;
                if (element && hasComputedStyle(element)) {
                    result = getElementAsNode<T>(element, this.sessionId)?.fontSize || getFontSize(getStyle(element));
                }
                else {
                    result = this.ascend({ condition: item => item.fontSize > 0 })[0]?.fontSize || getFontSize(getStyle(document.body));
                }
            }
            this._fontSize = result;
        }
        return result;
    }

    get cssStyle() {
        return this._cssStyle;
    }

    get textStyle() {
        let result = this._textStyle;
        if (result === undefined) {
            result = this.cssAsObject(...TEXT_STYLE);
            result.fontSize = this.fontSize + 'px';
            this._textStyle = result;
        }
        return result;
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
                while (parent) {
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