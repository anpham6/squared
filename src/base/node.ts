import { AscendOptions, CachedValue, InitialData } from '../../@types/base/node';

import { CSS_UNIT, NODE_ALIGNMENT } from './lib/enumeration';

const $lib = squared.lib;
const { BOX_BORDER, checkStyleValue, formatPX, getInheritedStyle, getStyle, isLength, isPercent, parseSelectorText, parseUnit } = $lib.css;
const { ELEMENT_BLOCK, assignRect, getNamedItem, getRangeClientRect, newBoxRectDimension } = $lib.dom;
const { CHAR, CSS, XML } = $lib.regex;
const { actualClientRect, actualTextRangeRect, deleteElementCache, getElementAsNode, getElementCache, getPseudoElt, setElementCache } = $lib.session;
const { aboveRange, belowRange, convertCamelCase, convertFloat, convertInt, filterArray, hasBit, hasValue, isNumber, isObject, isString, spliceString } = $lib.util;

const { PX, SELECTOR_ATTR, SELECTOR_G, SELECTOR_LABEL, SELECTOR_PSEUDO_CLASS } = CSS;

type T = Node;

const REGEX_INLINE = /^inline/;
const REGEX_INLINEDASH = /^inline-/;
const REGEX_TABLE = /^table/;
const REGEX_MARGIN = /^margin/;
const REGEX_PADDING = /^padding/;
const REGEX_BORDER = /^border/;
const REGEX_BACKGROUND = /\s*(url\(.+?\))\s*/;
const REGEX_QUERY_LANG = /^:lang\(\s*(.+)\s*\)$/;
const REGEX_QUERY_NTH_CHILD_OFTYPE = /^:nth(-last)?-(child|of-type)\((.+)\)$/;
const REGEX_QUERY_NTH_CHILD_OFTYPE_VALUE = /^(-)?(\d+)?n\s*([+-]\d+)?$/;
const REGEX_EM = /em$/;
const REGEX_GRID = /grid$/;
const REGEX_FLEX = /flex$/;

function setNaturalChildren(node: T) {
    let children: T[];
    if (node.naturalElement) {
        const sessionId = node.sessionId;
        let i = 0;
        children = [];
        (<HTMLElement> node.element).childNodes.forEach((element: Element) => {
            const item = getElementAsNode<T>(element, sessionId);
            if (item) {
                item.childIndex = i++;
                children.push(item);
            }
        });
    }
    else {
        children = (node.initial?.children || node.children).slice(0);
    }
    node.naturalChildren = children;
    return children;
}

function setNaturalElements(node: T) {
    const children = filterArray(node.naturalChildren, item => item.naturalElement);
    node.naturalElements = children;
    return children;
}

const validateCssSet = (value: string, actualValue: string) => value === actualValue || isLength(value, true) && PX.test(actualValue);

export default abstract class Node extends squared.lib.base.Container<T> implements squared.base.Node {
    public documentRoot = false;
    public depth = -1;
    public childIndex = Number.POSITIVE_INFINITY;
    public style!: CSSStyleDeclaration;

    public abstract queryMap?: T[][];

    protected _styleMap!: StringMap;
    protected _cssStyle!: StringMap;
    protected _box?: BoxRectDimension;
    protected _bounds?: BoxRectDimension;
    protected _linear?: BoxRectDimension;
    protected _textBounds?: BoxRectDimension;
    protected _fontSize?: number;
    protected _initial?: InitialData<T>;

    protected readonly _element: Element | null = null;

    protected abstract _cached: CachedValue<T>;
    protected abstract _naturalChildren?: T[];
    protected abstract _naturalElements?: T[];

    private _data = {};
    private _inlineText = false;
    private _parent?: T;
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
        }
        else {
            this.style = <CSSStyleDeclaration> {};
            this._styleMap = {};
            this._cssStyle = {};
        }
    }

    public init() {
        const element = <HTMLElement> this._element;
        if (element) {
            const sessionId = this.sessionId;
            const styleMap = getElementCache(element, 'styleMap', sessionId) || {};
            let style: CSSStyleDeclaration;
            if (!this.pseudoElement) {
                style = getStyle(element);
                if (this.styleElement) {
                    const items = Array.from(element.style);
                    if (items.length) {
                        const inline = element.style;
                        for (const attr of items) {
                            styleMap[convertCamelCase(attr)] = inline.getPropertyValue(attr);
                        }
                    }
                }
            }
            else {
                style = getStyle(element.parentElement, getPseudoElt(element, sessionId));
            }
            if (this.styleElement) {
                const revisedMap: StringMap = {};
                for (const attr in styleMap) {
                    const value = checkStyleValue(element, attr, styleMap[attr], style);
                    if (value !== '') {
                        revisedMap[attr] = value;
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
            let obj = data[name];
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
        if (attrs.length) {
            const cached = this._cached;
            for (const attr of attrs) {
                switch (attr) {
                    case 'position':
                    case 'display':
                        this._cached = {};
                        return;
                    case 'width':
                        cached.percentWidth = undefined;
                    case 'minWidth':
                        cached.width = undefined;
                        break;
                    case 'height':
                        cached.percentHeight = undefined;
                    case 'minHeight':
                        cached.height = undefined;
                        cached.hasHeight = undefined;
                        break;
                    case 'verticalAlign':
                        cached.baseline = undefined;
                        break;
                    case 'backgroundColor':
                    case 'backgroundImage':
                        cached.visibleStyle = undefined;
                        break;
                    case 'pageFlow':
                        cached.blockStatic = undefined;
                        cached.baseline = undefined;
                        cached.floating = undefined;
                        cached.autoMargin = undefined;
                        cached.rightAligned = undefined;
                        cached.bottomAligned = undefined;
                        break;
                    case 'float':
                        cached.floating = undefined;
                        break;
                    case 'visibleStyle':
                        cached.borderTopWidth = undefined;
                        cached.borderRightWidth = undefined;
                        cached.borderBottomWidth = undefined;
                        cached.borderLeftWidth = undefined;
                        cached.backgroundColor = undefined;
                        cached.backgroundImage = undefined;
                        break;
                    default:
                        if (REGEX_MARGIN.test(attr)) {
                            cached.autoMargin = undefined;
                        }
                        else if (REGEX_PADDING.test(attr)) {
                            cached.contentBoxWidth = undefined;
                            cached.contentBoxHeight = undefined;
                        }
                        else if (REGEX_BORDER.test(attr)) {
                            cached.visibleStyle = undefined;
                            cached.contentBoxWidth = undefined;
                            cached.contentBoxHeight = undefined;
                        }
                        break;
                }
                cached[attr] = undefined;
            }
        }
        else {
            this._cached = {};
            this._textStyle = undefined;
        }
    }

    public ascend(options: AscendOptions = {}) {
        const { condition, including, excluding } = options;
        let attr = options.attr;
        if (!isString(attr)) {
            attr = 'actualParent';
        }
        const result: T[] = [];
        let current = options.startSelf ? this : this[attr];
        while (current && current !== excluding) {
            if (condition) {
                if (condition(current)) {
                    result.push(current);
                    break;
                }
            }
            else {
                result.push(current);
            }
            if (current === including) {
                break;
            }
            current = current[attr];
        }
        return result;
    }

    public intersectX(rect: BoxRectDimension, dimension: BoxType = 'linear') {
        if (rect.width > 0) {
            const { left, right } = this[dimension];
            const { left: leftA, right: rightA } = rect;
            return (
                aboveRange(leftA, left) && Math.ceil(leftA) < right ||
                rightA > Math.ceil(left) && belowRange(rightA, right) ||
                aboveRange(left, leftA) && belowRange(right, rightA) ||
                aboveRange(leftA, left) && belowRange(rightA, right)
            );
        }
        return false;
    }

    public intersectY(rect: BoxRectDimension, dimension: BoxType = 'linear') {
        if (rect.height > 0) {
            const { top, bottom } = this[dimension];
            const { top: topA, bottom: bottomA } = rect;
            return (
                aboveRange(topA, top) && Math.ceil(topA) < bottom ||
                bottomA > Math.ceil(top) && belowRange(bottomA, bottom) ||
                aboveRange(top, topA) && belowRange(bottom, bottomA) ||
                aboveRange(topA, top) && belowRange(bottomA, bottom)
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
            return aboveRange(bounds.top, rect.top) && belowRange(bounds.bottom, rect.bottom);
        }
        return true;
    }

    public outsideX(rect: BoxRectDimension, dimension: BoxType = 'linear') {
        if (this.pageFlow || rect.width > 0) {
            const bounds = this[dimension];
            return bounds.left < Math.floor(rect.left) || Math.floor(bounds.right) > rect.right;
        }
        return false;
    }

    public outsideY(rect: BoxRectDimension, dimension: BoxType = 'linear') {
        if (this.pageFlow || rect.height > 0) {
            const bounds = this[dimension];
            return bounds.top < Math.floor(rect.top) || Math.floor(bounds.bottom) > rect.bottom;
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
        if (this._initial === undefined && !modified) {
            computed = true;
        }
        let value = (!modified && this._initial?.styleMap || this._styleMap)[attr];
        if (computed && !value) {
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
        let current = startSelf ? this : this.actualParent;
        let value: string;
        while (current) {
            value = current.cssInitial(attr);
            if (value !== '') {
                return value;
            }
            if (current.documentBody) {
                break;
            }
            current = current.actualParent;
        }
        return '';
    }

    public cssSort(attr: string, ascending = true, duplicate = false) {
        const children = duplicate ? this.duplicate() : this.children;
        children.sort((a, b) => {
            const valueA = a.toFloat(attr);
            const valueB = b.toFloat(attr);
            if (valueA === valueB) {
                return 0;
            }
            else if (ascending) {
                return valueA < valueB ? -1 : 1;
            }
            return valueA > valueB ? -1 : 1;
        });
        return children;
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
        let result: number | undefined;
        if (this.styleElement) {
            if (this.pseudoElement) {
                const element = <Element> this._element;
                const sessionId = this.sessionId;
                result = getElementCache(<Element> element.parentElement, 'styleSpecificity' + getPseudoElt(element, sessionId), sessionId)?.[attr] as number;
            }
            else {
                result = getElementCache(<Element> this._element, 'styleSpecificity', this.sessionId)?.[attr] as number;
            }
        }
        return result || 0;
    }

    public cssTry(attr: string, value: string) {
        if (this.styleElement) {
            const element = <HTMLElement> this._element;
            const current = getStyle(element).getPropertyValue(attr);
            if (current !== value) {
                const style = element.style;
                style.setProperty(attr, value);
                if (validateCssSet(value, style.getPropertyValue(attr))) {
                    setElementCache(element, attr, this.sessionId, current);
                    return true;
                }
            }
            else {
                return true;
            }
        }
        return false;
    }

    public cssFinally(attr: string) {
        if (this.styleElement) {
            const sessionId = this.sessionId;
            const element = <HTMLElement> this._element;
            const value: string = getElementCache(element, attr, sessionId);
            if (value) {
                element.style.setProperty(attr, value);
                deleteElementCache(element, attr, sessionId);
                return true;
            }
        }
        return false;
    }

    public toInt(attr: string, initial = false, fallback = 0) {
        const value = parseInt((initial && this._initial?.styleMap || this._styleMap)[attr]);
        return isNaN(value) ? fallback : value;
    }

    public toFloat(attr: string, initial = false, fallback = 0) {
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

    public parseUnit(value: string, dimension = 'width', parent = true) {
        if (value) {
            if (isPercent(value)) {
                const node = parent && this.absoluteParent || this;
                let result = parseFloat(value) / 100;
                switch (dimension) {
                    case 'width':
                        result *= node.bounds.width;
                        break;
                    case 'height':
                        result *= node.bounds.height;
                        break;
                }
                return result;
            }
            return parseUnit(value, this.fontSize);
        }
        return 0;
    }

    public convertPX(value: string, dimension = 'width', parent = true) {
        return PX.test(value) ? value : Math.round(this.parseUnit(value, dimension, parent)) + 'px';
    }

    public has(attr: string, checkType = 0, options?: ObjectMap<string | string[] | boolean>) {
        const value = (options?.map === 'initial' && this._initial?.styleMap || this._styleMap)[attr];
        if (value) {
            switch (value) {
                case 'auto':
                case 'none':
                case 'initial':
                case 'normal':
                case 'transparent':
                case 'rgba(0, 0, 0, 0)':
                    return false;
                case 'baseline':
                case 'left':
                case 'start':
                    return this.flexElement || this.actualParent?.flexElement ? /^(align|justify|place)-/.test(attr) : false;
                default:
                    if (options) {
                        if (options.not) {
                            if (value === options.not) {
                                return false;
                            }
                            else if (Array.isArray(options.not)) {
                                for (const exclude of options.not) {
                                    if (value === exclude) {
                                        return false;
                                    }
                                }
                            }
                        }
                    }
                    if (checkType > 0) {
                        if (hasBit(checkType, CSS_UNIT.LENGTH) && isLength(value)) {
                            return true;
                        }
                        if (hasBit(checkType, CSS_UNIT.PERCENT) && isPercent(value)) {
                            return true;
                        }
                    }
                    return checkType === 0;
            }
        }
        return false;
    }

    public hasPX(attr: string, percent = true, initial = false) {
        const value = (initial && this._initial?.styleMap || this._styleMap)[attr];
        return value ? isLength(value, percent) : false;
    }

    public setBounds(cache = true) {
        if (this.styleElement) {
            this._bounds = assignRect(actualClientRect(<Element> this._element, this.sessionId, cache));
            if (this.documentBody && this.marginTop === 0) {
                this._bounds.top = 0;
            }
        }
        else if (this.plainText) {
            const rect = getRangeClientRect(<Element> this._element);
            const bounds = assignRect(rect);
            const lines = rect.numberOfLines as number;
            bounds.numberOfLines = lines;
            this._bounds = bounds;
            this._textBounds = bounds;
            this._cached.multiline = lines > 1;
        }
        if (!cache) {
            this._box = undefined;
            this._linear = undefined;
        }
    }

    public querySelector(value: string) {
        return this.querySelectorAll(value, 1)[0] || null;
    }

    public querySelectorAll(value: string, resultCount = -1) {
        let result: T[] = [];
        const queryMap = this.queryMap;
        if (queryMap) {
            const queries = parseSelectorText(value);
            for (let i = 0; i < queries.length; i++) {
                const query = queries[i];
                const selectors: QueryData[] = [];
                let offset = -1;
                invalid: {
                    let adjacent: string | undefined;
                    let match: RegExpExecArray | null;
                    while ((match = SELECTOR_G.exec(query)) !== null) {
                        let segment = match[1];
                        let all = false;
                        let tagName: string | undefined;
                        let id: string | undefined;
                        let classList: string[] | undefined;
                        let attrList: QueryAttribute[] | undefined;
                        let pseudoList: string[] | undefined;
                        let notList: string[] | undefined;
                        if (segment.length === 1) {
                            const ch = segment.charAt(0);
                            switch (ch) {
                                case '+':
                                case '~':
                                    offset--;
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
                        else if (/\|\*$/.test(segment)) {
                            all = segment === '*|*';
                        }
                        else if (segment.charAt(0) === '*') {
                            segment = segment.substring(1);
                        }
                        else if (/^::/.test(segment)) {
                            selectors.length = 0;
                            break invalid;
                        }
                        if (!all) {
                            let subMatch: RegExpExecArray | null;
                            while ((subMatch = SELECTOR_ATTR.exec(segment)) !== null) {
                                if (attrList === undefined) {
                                    attrList = [];
                                }
                                const caseInsensitive = subMatch[6] === 'i';
                                let attrValue = subMatch[3] || subMatch[4] || subMatch[5] || '';
                                if (caseInsensitive) {
                                    attrValue = attrValue.toLowerCase();
                                }
                                attrList.push({
                                    key: subMatch[1],
                                    symbol: subMatch[2],
                                    value: attrValue,
                                    caseInsensitive
                                });
                                segment = spliceString(segment, subMatch.index, subMatch[0].length);
                            }
                            if (segment.includes('::')) {
                                selectors.length = 0;
                                break invalid;
                            }
                            while ((subMatch = SELECTOR_PSEUDO_CLASS.exec(segment)) !== null) {
                                if (/^:not\(/.test(subMatch[0])) {
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
                                    pseudoList.push(subMatch[0]);
                                }
                                segment = spliceString(segment, subMatch.index, subMatch[0].length);
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
                                segment = spliceString(segment, subMatch.index, subMatch[0].length);
                            }
                        }
                        selectors.push({
                            all,
                            tagName,
                            id,
                            adjacent,
                            classList,
                            pseudoList,
                            notList,
                            attrList
                        });
                        offset++;
                        adjacent = undefined;
                    }
                    SELECTOR_G.lastIndex = 0;
                }
                let length = queryMap.length;
                if (selectors.length && offset !== -1 && offset < length) {
                    const validate = (node: T, data: QueryData, last: boolean, adjacent?: string) => {
                        if (data.all) {
                            return true;
                        }
                        let tagName = data.tagName;
                        if (tagName && tagName !== node.tagName.toUpperCase()) {
                            return false;
                        }
                        const id = data.id;
                        if (id && id !== node.elementId) {
                            return false;
                        }
                        const { attrList, classList, notList, pseudoList } = data;
                        if (pseudoList) {
                            const parent = node.actualParent as T;
                            tagName = node.tagName;
                            for (const pseudo of pseudoList) {
                                switch (pseudo) {
                                    case ':first-child':
                                    case ':nth-child(1)':
                                        if (node !== parent.firstChild) {
                                            return false;
                                        }
                                        break;
                                    case ':last-child':
                                    case ':nth-last-child(1)':
                                        if (node !== parent.lastChild) {
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
                                    case ':first-of-type': {
                                        for (const item of parent.naturalElements) {
                                            if (item.tagName === tagName) {
                                                if (item !== node) {
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
                                        if ((<HTMLElement> node.element).childNodes.length) {
                                            return false;
                                        }
                                        break;
                                    case ':checked':
                                        if (tagName === 'INPUT') {
                                            if (!node.toElementBoolean('checked')) {
                                                return false;
                                            }
                                        }
                                        else if (tagName === 'OPTION') {
                                            if (!node.toElementBoolean('selected')) {
                                                return false;
                                            }
                                        }
                                        else {
                                            return false;
                                        }
                                        break;
                                    case ':enabled':
                                        if (!node.inputElement || node.toElementBoolean('disabled')) {
                                            return false;
                                        }
                                        break;
                                    case ':disabled':
                                        if (!node.inputElement || !node.toElementBoolean('disabled')) {
                                            return false;
                                        }
                                        break;
                                    case ':read-only': {
                                        const element = <HTMLInputElement | HTMLTextAreaElement> node.element;
                                        if (element.isContentEditable || (tagName === 'INPUT' || tagName === 'TEXTAREA') && !element.readOnly) {
                                            return false;
                                        }
                                        break;
                                    }
                                    case ':read-write': {
                                        const element = <HTMLInputElement | HTMLTextAreaElement> node.element;
                                        if (!element.isContentEditable || (tagName === 'INPUT' || tagName === 'TEXTAREA') && element.readOnly) {
                                            return false;
                                        }
                                        break;
                                    }
                                    case ':required':
                                        if (!node.inputElement || tagName === 'BUTTON' || !node.toElementBoolean('required')) {
                                            return false;
                                        }
                                        break;
                                    case ':optional':
                                        if (!node.inputElement || tagName === 'BUTTON' || node.toElementBoolean('required')) {
                                            return false;
                                        }
                                        break;
                                    case ':placeholder-shown': {
                                        if (!((tagName === 'INPUT' || tagName === 'TEXTAREA') && node.toElementString('placeholder') !== '')) {
                                            return false;
                                        }
                                        break;
                                    }
                                    case ':default': {
                                        switch (tagName) {
                                            case 'INPUT': {
                                                const element = <HTMLInputElement> node.element;
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
                                                if ((<HTMLOptionElement> node.element).attributes['selected'] === undefined) {
                                                    return false;
                                                }
                                                break;
                                            case 'BUTTON': {
                                                const form = node.ascend({ condition: item => item.tagName === 'FORM' })[0];
                                                if (form) {
                                                    const element = <HTMLElement> node.element;
                                                    let valid = false;
                                                    const children = (form.element as Element).querySelectorAll('*');
                                                    const lengthA = children.length;
                                                    for (let j = 0; j < lengthA; j++) {
                                                        const item = <HTMLInputElement> children[i];
                                                        if (item.tagName === 'BUTTON') {
                                                            valid = element === item;
                                                            break;
                                                        }
                                                        else if (item.tagName === 'INPUT') {
                                                            const type = item.type;
                                                            if (type === 'submit' || type === 'image') {
                                                                valid = element === item;
                                                                break;
                                                            }
                                                        }
                                                    }
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
                                    }
                                    case ':in-range':
                                    case ':out-of-range': {
                                        if (tagName === 'INPUT') {
                                            const element = <HTMLInputElement> node.element;
                                            const rangeValue = parseFloat(element.value);
                                            if (!isNaN(rangeValue)) {
                                                const min = parseFloat(element.min);
                                                const max = parseFloat(element.max);
                                                if (rangeValue >= min && rangeValue <= max) {
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
                                    }
                                    case ':indeterminate':
                                        if (tagName === 'INPUT') {
                                            const element = <HTMLInputElement> node.element;
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
                                                        const children = (node.ascend({ condition: item => item.tagName === 'FORM' })[0]?.element || document).querySelectorAll(`input[type=radio][name="${element.name}"`);
                                                        const lengthA = children.length;
                                                        for (let j = 0; j < lengthA; j++) {
                                                            if ((<HTMLInputElement> children[j]).checked) {
                                                                return false;
                                                            }
                                                        }
                                                    }
                                                    break;
                                                default:
                                                    return false;
                                            }
                                        }
                                        else if (tagName === 'PROGRESS') {
                                            if (node.toElementInt('value', -1) !== -1) {
                                                return false;
                                            }
                                        }
                                        else {
                                            return false;
                                        }
                                        break;
                                    case ':target': {
                                        if (location.hash === '') {
                                            return false;
                                        }
                                        else {
                                            const element = <HTMLAnchorElement> node.element;
                                            if (!(location.hash === '#' + element.id || tagName === 'A' && location.hash === '#' + element.name)) {
                                                return false;
                                            }
                                        }
                                        break;
                                    }
                                    case ':scope':
                                        if (!last || adjacent === '>' && node !== this) {
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
                                        const element = node.element;
                                        const children = (<HTMLElement> parent.element).querySelectorAll(':scope > ' + pseudo);
                                        let valid = false;
                                        const lengthA = children.length;
                                        for (let j = 0; j < lengthA; j++) {
                                            if (children.item(i) === element) {
                                                valid = true;
                                                break;
                                            }
                                        }
                                        if (!valid) {
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
                                            const index = (match[2] === 'child' ? children.indexOf(node) : filterArray(children, item => item.tagName === tagName).indexOf(node)) + 1;
                                            if (index > 0) {
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
                                                            const subMatch = REGEX_QUERY_NTH_CHILD_OFTYPE_VALUE.exec(placement);
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
                                        else {
                                            match = REGEX_QUERY_LANG.exec(pseudo);
                                            if (match) {
                                                const attributes = node.attributes;
                                                if (attributes['lang'] && match[1].toLowerCase() === attributes['lang'].toLowerCase()) {
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
                                const notData: QueryData = { all: false };
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
                                            let attrValue = match[3] || match[4] || match[5] || '';
                                            if (caseInsensitive) {
                                                attrValue = attrValue.toLowerCase();
                                            }
                                            notData.attrList = [{
                                                key: match[1],
                                                symbol: match[2],
                                                value: attrValue,
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
                                }
                                if (validate(node, notData, last)) {
                                    return false;
                                }
                            }
                        }
                        if (classList) {
                            const elementList = (<HTMLElement> node.element).classList;
                            for (const className of classList) {
                                if (!elementList.contains(className)) {
                                    return false;
                                }
                            }
                        }
                        if (attrList) {
                            const attributes = node.attributes;
                            for (const attr of attrList) {
                                let actualValue = attributes[attr.key];
                                if (actualValue === undefined) {
                                    return false;
                                }
                                else {
                                    const attrValue = attr.value;
                                    if (attrValue) {
                                        if (attr.caseInsensitive) {
                                            actualValue = actualValue.toLowerCase();
                                        }
                                        if (attr.symbol) {
                                            switch (attr.symbol) {
                                                case '~':
                                                    if (!actualValue.split(CHAR.SPACE).includes(attrValue)) {
                                                        return false;
                                                    }
                                                    break;
                                                case '^':
                                                    if (!actualValue.startsWith(attrValue)) {
                                                        return false;
                                                    }
                                                    break;
                                                case '$':
                                                    if (!actualValue.endsWith(attrValue)) {
                                                        return false;
                                                    }
                                                    break;
                                                case '*':
                                                    if (!actualValue.includes(attrValue)) {
                                                        return false;
                                                    }
                                                    break;
                                                case '|':
                                                    if (actualValue !== attrValue && !actualValue.startsWith(attrValue + '-')) {
                                                        return false;
                                                    }
                                                    break;
                                            }
                                        }
                                        else if (actualValue !== attrValue) {
                                            return false;
                                        }
                                    }
                                }
                            }
                        }
                        return true;
                    };
                    const dataEnd = <QueryData> selectors.pop();
                    const lastEnd = selectors.length === 0;
                    let pending: T[] = [];
                    for (let j = offset; j < length; j++) {
                        const dataMap = queryMap[j];
                        if (dataEnd.all) {
                            pending = pending.concat(dataMap);
                        }
                        else {
                            for (const node of dataMap) {
                                if (validate(node, dataEnd, lastEnd)) {
                                    pending.push(node);
                                }
                            }
                        }
                    }
                    if (selectors.length) {
                        const depth = this.depth;
                        selectors.reverse();
                        length = selectors.length;
                        function ascend(index: number, adjacent: string | undefined, nodes: T[]): boolean {
                            const selector = selectors[index];
                            const last = index === length - 1;
                            const next: T[] = [];
                            for (const node of nodes) {
                                if (adjacent) {
                                    const parent = node.actualParent as T;
                                    if (adjacent === '>') {
                                        if (validate(parent, selector, last, adjacent)) {
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
                                                    if (sibling && validate(sibling, selector, last, adjacent)) {
                                                        next.push(sibling);
                                                    }
                                                }
                                                break;
                                            }
                                            case '~': {
                                                const lengthA = children.length;
                                                for (let k = 0; k < lengthA; k++) {
                                                    const sibling = children[k];
                                                    if (sibling === node) {
                                                        break;
                                                    }
                                                    else if (validate(sibling, selector, last, adjacent)) {
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
                                        if (validate(parent, selector, last)) {
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
                                return ascend(index, selector.adjacent, next);
                            }
                            return false;
                        }
                        for (const node of pending) {
                            if (ascend(0, dataEnd.adjacent, [node])) {
                                result.push(node);
                                if (result.length === resultCount) {
                                    return result;
                                }
                            }
                        }
                    }
                    else if (result.length === 0 && (i === queries.length - 1 || resultCount >= 0 && resultCount <= pending.length)) {
                        if (resultCount >= 0 && pending.length > resultCount) {
                            pending.length = resultCount;
                        }
                        return pending;
                    }
                    else {
                        result = result.concat(pending);
                        if (resultCount >= 0 && result.length >= resultCount) {
                            result.length = resultCount;
                            return result;
                        }
                    }
                }
            }
        }
        return result;
    }

    private setDimension(attr: string, attrMin: string, attrMax: string) {
        const styleMap = this._styleMap;
        const valueA = styleMap[attr];
        const baseValue = this.parseUnit(valueA, attr);
        let value = Math.max(baseValue, this.parseUnit(styleMap[attrMin], attr));
        if (value === 0 && this.styleElement) {
            const element = <HTMLInputElement> this._element;
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

    private convertPosition(attr: string) {
        if (!this.positionStatic) {
            const unit = this.cssInitial(attr, true);
            if (isLength(unit)) {
                return convertFloat(this.convertPX(unit, attr === 'left' || attr === 'right' ? 'width' : 'height'));
            }
            else if (isPercent(unit) && this.styleElement) {
                return convertFloat(this.style[attr]);
            }
        }
        return 0;
    }

    private convertBorderWidth(index: number) {
        if (!this.plainText) {
            const border = BOX_BORDER[index];
            const value = this.css(border[0]);
            if (value !== 'none') {
                const attr = border[1];
                const width = this.css(attr);
                let result: number;
                switch (width) {
                    case 'thin':
                    case 'medium':
                    case 'thick':
                        result = convertFloat(this.style[attr]);
                        break;
                    default:
                        result = this.parseUnit(width, index === 1 || index === 3 ? 'width' : 'height');
                        break;
                }
                if (result > 0) {
                    return Math.max(Math.round(result), 1);
                }
            }
        }
        return 0;
    }

    private convertBox(attr: string, margin: boolean) {
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
                            const parent = this.ascend({ condition: node => node.tagName === 'TABLE'})[0];
                            if (parent) {
                                const [horizontal, vertical] = parent.css('borderSpacing').split(' ');
                                switch (attr) {
                                    case 'marginTop':
                                    case 'marginBottom':
                                        return vertical ? this.parseUnit(vertical, 'height', false) : this.parseUnit(horizontal, 'width', false);
                                    case 'marginRight':
                                        if (!(this.actualParent?.lastChild === this)) {
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
        const result = this.parseUnit(this.css(attr), 'width', !(this.actualParent?.gridElement === true));
        if (!margin) {
            let paddingStart = this.toFloat('paddingInlineStart');
            let paddingEnd = this.toFloat('paddingInlineEnd');
            if (paddingStart > 0 || paddingEnd > 0) {
                if (this.css('writingMode') === 'vertical-rl') {
                    if (this.dir === 'rtl') {
                        if (attr !== 'paddingBottom') {
                            paddingStart = 0;
                        }
                        if (attr !== 'paddingTop') {
                            paddingEnd = 0;
                        }
                    }
                    else {
                        if (attr !== 'paddingTop') {
                            paddingStart = 0;
                        }
                        if (attr !== 'paddingBottom') {
                            paddingEnd = 0;
                        }
                    }
                }
                else {
                    if (this.dir === 'rtl') {
                        if (attr !== 'paddingRight') {
                            paddingStart = 0;
                        }
                        if (attr !== 'paddingLeft') {
                            paddingEnd = 0;
                        }
                    }
                    else {
                        if (attr !== 'paddingLeft') {
                            paddingStart = 0;
                        }
                        if (attr !== 'paddingRight') {
                            paddingEnd = 0;
                        }
                    }
                }
                return paddingStart + result + paddingEnd;
            }
        }
        return result;
    }

    set parent(value) {
        if (value) {
            const parent = this._parent;
            if (value !== parent) {
                if (parent) {
                    parent.remove(this);
                }
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
            const element = <HTMLElement> this._element;
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
            result = !this.htmlElement && !this.plainText && this._element instanceof SVGElement || this.imageElement && /\.svg$/.test(this.src.toLowerCase());
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
            result = REGEX_FLEX.test(this.display);
            this._cached.flexElement = result;
        }
        return result;
    }

    get gridElement() {
        let result = this._cached.gridElement;
        if (result === undefined) {
            result = REGEX_GRID.test(this.display);
            this._cached.gridElement = result;
        }
        return result;
    }

    get textElement() {
        let result = this._cached.textElement;
        if (result === undefined) {
            result = this.plainText || this.inlineText;
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

    get layoutElement() {
        let result = this._cached.layoutElement;
        if (result === undefined) {
            result = this.flexElement || this.gridElement;
            this._cached.layoutElement = result;
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
        return this._element === document.body;
    }

    get initial() {
        return this._initial;
    }

    get bounds() {
        return this._bounds || assignRect(this.boundingClientRect);
    }

    get linear() {
        const setDimension = () => {
            const bounds = this._bounds;
            if (bounds) {
                if (this.styleElement) {
                    const { marginTop, marginBottom, marginLeft, marginRight } = this;
                    this._linear = {
                        top: bounds.top - (marginTop > 0 ? marginTop : 0),
                        right: bounds.right + marginRight,
                        bottom: bounds.bottom + marginBottom,
                        left: bounds.left - (marginLeft > 0 ? marginLeft : 0),
                        width: bounds.width + Math.max(marginLeft, 0) + marginRight,
                        height: bounds.height + Math.max(marginTop, 0) + marginBottom
                    };
                }
                else {
                    this._linear = bounds;
                }
                return this._linear;
            }
            return newBoxRectDimension();
        };
        return this._linear || setDimension();
    }

    get box() {
        const setDimension = () => {
            const bounds = this._bounds;
            if (bounds) {
                if (this.styleElement) {
                    this._box = {
                        top: bounds.top + (this.paddingTop + this.borderTopWidth),
                        right: bounds.right - (this.paddingRight + this.borderRightWidth),
                        bottom: bounds.bottom - (this.paddingBottom + this.borderBottomWidth),
                        left: bounds.left + (this.paddingLeft + this.borderLeftWidth),
                        width: bounds.width - this.contentBoxWidth,
                        height: bounds.height - this.contentBoxHeight
                    };
                }
                else {
                    this._box = bounds;
                }
                return this._box;
            }
            return newBoxRectDimension();
        };
        return this._box || setDimension();
    }

    get dataset(): DOMStringMap {
        if (this.styleElement) {
            return (<HTMLElement> this._element).dataset;
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

    get flexbox() {
        let result = this._cached.flexbox;
        if (result === undefined) {
            if (this.styleElement) {
                const actualParent = this.actualParent as T;
                const getFlexValue = (attr: string, initialValue: number, parent?: Node): number => {
                    const value = (parent || this).css(attr);
                    if (isNumber(value)) {
                        return parseFloat(value);
                    }
                    else if (value === 'inherit' && parent === undefined) {
                        return getFlexValue(attr, initialValue, actualParent);
                    }
                    return initialValue;
                };
                const alignSelf = this.css('alignSelf');
                const justifySelf = this.css('justifySelf');
                result = {
                    alignSelf: alignSelf === 'auto' ? actualParent.css('alignItems') : alignSelf,
                    justifySelf: justifySelf === 'auto' ? actualParent.css('justifyItems') : justifySelf,
                    basis: this.css('flexBasis'),
                    grow: getFlexValue('flexGrow', 0),
                    shrink: getFlexValue('flexShrink', 1),
                    order: this.toInt('order')
                };
            }
            else {
                result = {
                    alignSelf: 'auto',
                    justifySelf: 'auto',
                    basis: 'auto',
                    grow: 0,
                    shrink: 1,
                    order: Number.POSITIVE_INFINITY
                };
            }
            this._cached.flexbox = result;
        }
        return result;
    }

    get width() {
        let result = this._cached.width;
        if (result === undefined) {
            result = this.setDimension('width', 'minWidth', 'maxWidth');
            this._cached.width = result;
        }
        return result;
    }
    get height() {
        let result = this._cached.height;
        if (result === undefined) {
            result = this.setDimension('height', 'minHeight', 'maxHeight');
            this._cached.height = result;
        }
        return result;
    }

    get hasWidth() {
        return this.width > 0;
    }
    get hasHeight() {
        let result = this._cached.hasHeight;
        if (result === undefined) {
            const value = this.css('height');
            if (isPercent(value)) {
                if (this.pageFlow && this.actualParent?.hasHeight) {
                    result = parseFloat(value) > 0;
                }
                else {
                    result = false;
                }
            }
            else {
                result = this.height > 0;
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
                    else {
                        value = parseUnit(lineHeight, this.fontSize);
                        if (PX.test(lineHeight) && this._cssStyle.lineHeight !== 'inherit') {
                            const fontSize = this.cssInitial('fontSize');
                            if (REGEX_EM.test(fontSize)) {
                                value *= parseFloat(fontSize);
                            }
                        }
                    }
                }
                else if (this.naturalChild) {
                    const parent = this.ascend({ condition: item => item.lineHeight > 0 })[0];
                    if (parent) {
                        value = parent.lineHeight;
                    }
                    if (this.styleElement) {
                        const fontSize = this.cssInitial('fontSize');
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
                if (hasOwnStyle || value > this.actualHeight || this.multiline || this.block && this.naturalChildren.some(node => node.textElement)) {
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
            result = this.convertPosition('top');
            this._cached.top = result;
        }
        return result;
    }
    get right() {
        let result = this._cached.right;
        if (result === undefined) {
            result = this.convertPosition('right');
            this._cached.right = result;
        }
        return result;
    }
    get bottom() {
        let result = this._cached.bottom;
        if (result === undefined) {
            result = this.convertPosition('bottom');
            this._cached.bottom = result;
        }
        return result;
    }
    get left() {
        let result = this._cached.left;
        if (result === undefined) {
            result = this.convertPosition('left');
            this._cached.left = result;
        }
        return result;
    }

    get marginTop() {
        let result = this._cached.marginTop;
        if (result === undefined) {
            result = this.inlineStatic ? 0 : this.convertBox('marginTop', true);
            this._cached.marginTop = result;
        }
        return result;
    }
    get marginRight() {
        let result = this._cached.marginRight;
        if (result === undefined) {
            result = this.convertBox('marginRight', true);
            this._cached.marginRight = result;
        }
        return result;
    }
    get marginBottom() {
        let result = this._cached.marginBottom;
        if (result === undefined) {
            result = this.inlineStatic ? 0 : this.convertBox('marginBottom', true);
            this._cached.marginBottom = result;
        }
        return result;
    }
    get marginLeft() {
        let result = this._cached.marginLeft;
        if (result === undefined) {
            result = this.convertBox('marginLeft', true);
            this._cached.marginLeft = result;
        }
        return result;
    }

    get borderTopWidth() {
        let result = this._cached.borderTopWidth;
        if (result === undefined) {
            result = this.convertBorderWidth(0);
            this._cached.borderTopWidth = result;
        }
        return result;
    }
    get borderRightWidth() {
        let result = this._cached.borderRightWidth;
        if (result === undefined) {
            result = this.convertBorderWidth(1);
            this._cached.borderRightWidth = result;
        }
        return result;
    }
    get borderBottomWidth() {
        let result = this._cached.borderBottomWidth;
        if (result === undefined) {
            result = this.convertBorderWidth(2);
            this._cached.borderBottomWidth = result;
        }
        return result;
    }
    get borderLeftWidth() {
        let result = this._cached.borderLeftWidth;
        if (result === undefined) {
            result = this.convertBorderWidth(3);
            this._cached.borderLeftWidth = result;
        }
        return result;
    }

    get paddingTop() {
        let result = this._cached.paddingTop;
        if (result === undefined) {
            result = this.convertBox('paddingTop', false);
            this._cached.paddingTop = result;
        }
        return result;
    }
    get paddingRight() {
        let result = this._cached.paddingRight;
        if (result === undefined) {
            result = this.convertBox('paddingRight', false);
            this._cached.paddingRight = result;
        }
        return result;
    }
    get paddingBottom() {
        let result = this._cached.paddingBottom;
        if (result === undefined) {
            result = this.convertBox('paddingBottom', false);
            this._cached.paddingBottom = result;
        }
        return result;
    }
    get paddingLeft() {
        let result = this._cached.paddingLeft;
        if (result === undefined) {
            result = this.convertBox('paddingLeft', false);
            this._cached.paddingLeft = result;
        }
        return result;
    }

    get contentBox() {
        return this.css('boxSizing') !== 'border-box';
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

    get inlineHorizontal() {
        let result = this._cached.inlineHorizontal;
        if (result === undefined) {
            if (this.naturalElement) {
                if (this.flexElement || this.floating) {
                    result = true;
                }
                else {
                    const value = this.display;
                    result = REGEX_INLINEDASH.test(value) || REGEX_TABLE.test(value) || this.tagName === 'RUBY';
                }
            }
            else {
                result = this.plainText;
            }
            this._cached.inlineVertical = result;
        }
        return result;
    }

    get inlineVertical() {
        let result = this._cached.inlineVertical;
        if (result === undefined) {
            if (this.naturalElement && !this.plainText && !this.floating) {
                const value = this.display;
                result = REGEX_INLINE.test(value) || value === 'table-cell';
            }
            else {
                result = false;
            }
            this._cached.inlineVertical = result;
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
                case 'initial':
                    result = ELEMENT_BLOCK.includes(this.tagName);
                    break;
                case 'inline':
                    if (this.tagName === 'svg' && this.actualParent?.htmlElement) {
                        result = !this.hasPX('width') && convertFloat(getNamedItem(<SVGSVGElement> this._element, 'width')) === 0;
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
            result = this.pageFlow && (this.block && !this.floating || this.blockDimension && this.cssInitial('width') === '100%' && !this.hasPX('maxWidth'));
            this._cached.blockStatic = result;
        }
        return result;
    }

    get blockDimension() {
        let result = this._cached.blockDimension;
        if (result === undefined) {
            if (this.block || this.imageElement || this.svgElement) {
                result = true;
            }
            else {
                const value = this.display;
                result = REGEX_INLINEDASH.test(value) || value === 'table';
            }
            this._cached.blockDimension = result;
        }
        return result;
    }

    get blockVertical() {
        let result = this._cached.blockVertical;
        if (result === undefined) {
            result = this.blockDimension && this.hasPX('height');
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
            if (this.inline || this.imageElement || this.floating) {
                result = true;
            }
            else {
                const value = this.display;
                result = REGEX_INLINE.test(value) || value === 'table-cell';
            }
            this._cached.inlineFlow = result;
        }
        return result;
    }

    get centerAligned() {
        let result = this._cached.centerAligned;
        if (result === undefined) {
            result = this.autoMargin.leftRight || this.textElement && this.blockStatic && this.cssInitial('textAlign') === 'center' || this.inlineStatic && this.cssAscend('textAlign', true) === 'center';
            this._cached.centerAligned = result;
        }
        return result;
    }

    get rightAligned() {
        let result = this._cached.rightAligned;
        if (result === undefined) {
            const actualParent = this.actualParent;
            if (actualParent && actualParent.flexElement) {
                result = /right|end$/.test(actualParent.css('justifyContent'));
            }
            else {
                result = this.float === 'right' || this.autoMargin.left || !this.pageFlow && this.hasPX('right') || this.textElement && this.blockStatic && this.cssInitial('textAlign') === 'right';
            }
            this._cached.rightAligned = result;
        }
        return result;
    }

    get bottomAligned() {
        let result = this._cached.bottomAligned;
        if (result === undefined) {
            result = !this.pageFlow && this.hasPX('bottom') && this.bottom >= 0;
            this._cached.bottomAligned = result;
        }
        return result;
    }

    get horizontalAligned() {
        let result = this._cached.horizontalAligned;
        if (result === undefined) {
            result = !this.blockStatic && !this.autoMargin.horizontal && !(this.blockDimension && this.css('width') === '100%');
            this._cached.horizontalAligned = result;
        }
        return result;
    }

    get autoMargin() {
        let result = this._cached.autoMargin;
        if (result === undefined) {
            if (!this.pageFlow || this.blockStatic || this.display === 'table') {
                const styleMap = this._initial?.styleMap || this._styleMap;
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
        return this.toInt('zIndex');
    }

    get textContent() {
        let result = this._cached.textContent;
        if (result === undefined) {
            result = !this.svgElement ? (<Element> this._element).textContent as string : '';
            this._cached.textContent = result;
        }
        return result;
    }

    get src() {
        return this.htmlElement && (<HTMLImageElement> this._element).src || '';
    }

    get overflow() {
        let result = this._cached.overflow;
        if (result === undefined) {
            result = 0;
            if (this.htmlElement && !this.inputElement && !this.imageElement && this.tagName !== 'HR' && !this.documentBody) {
                const element = <HTMLElement> this._element;
                const overflowX = this.css('overflowX');
                const overflowY = this.css('overflowY');
                if (this.hasHeight && (this.hasPX('height') || this.hasPX('maxHeight')) && (overflowY === 'scroll' || overflowY === 'auto' && element.clientHeight !== element.scrollHeight)) {
                    result |= NODE_ALIGNMENT.VERTICAL;
                }
                if ((this.hasPX('width') || this.hasPX('maxWidth')) && (overflowX === 'scroll' || overflowX === 'auto' && element.clientWidth !== element.scrollWidth)) {
                    result |= NODE_ALIGNMENT.HORIZONTAL;
                }
                if (overflowX === 'auto' || overflowX === 'hidden' || overflowX === 'overlay' || overflowY === 'auto' || overflowY === 'hidden' || overflowY === 'overlay') {
                    result |= NODE_ALIGNMENT.BLOCK;
                }
            }
            this._cached.overflow = result;
        }
        return result;
    }

    get overflowX() {
        return hasBit(this.overflow, NODE_ALIGNMENT.HORIZONTAL);
    }
    get overflowY() {
        return hasBit(this.overflow, NODE_ALIGNMENT.VERTICAL);
    }

    get baseline() {
        let result = this._cached.baseline;
        if (result === undefined) {
            if (this.pageFlow && !this.floating) {
                const value = this.verticalAlign;
                result = value === 'baseline' || value === '0px' || value === 'initial';
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
            result = this.css('verticalAlign');
            if (isLength(result, true)) {
                result = this.convertPX(result, 'height');
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
        if (this.naturalChild && result === undefined) {
            if (this.textElement) {
                result = actualTextRangeRect(<Element> this._element, this.sessionId);
            }
            else if (this.length) {
                const nodes = this.cascade(node => node.length === 0);
                if (nodes.length && nodes.every(item => item.textElement)) {
                    let top = Number.POSITIVE_INFINITY;
                    let right = Number.NEGATIVE_INFINITY;
                    let left = Number.POSITIVE_INFINITY;
                    let bottom = Number.NEGATIVE_INFINITY;
                    let numberOfLines = 0;
                    for (const node of nodes) {
                        const rect = actualTextRangeRect(<Element> node.element, node.sessionId);
                        top = Math.min(rect.top, top);
                        right = Math.max(rect.right, right);
                        left = Math.min(rect.left, left);
                        bottom = Math.max(rect.bottom, bottom);
                        numberOfLines += rect.numberOfLines || 0;
                    }
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
            this._textBounds = result;
        }
        return result;
    }

    get multiline() {
        let result = this._cached.multiline;
        if (result === undefined) {
            if (this.plainText) {
                result = <number> getRangeClientRect(<Element> this._element).numberOfLines > 1;
            }
            else if (this.styleText && (this.inlineFlow || this.naturalElements.length === 0)) {
                result = <number> this.textBounds?.numberOfLines > 1;
            }
            else {
                result = false;
            }
            this._cached.multiline = result;
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

    get backgroundColor() {
        let result = this._cached.backgroundColor;
        if (result === undefined) {
            result = this.css('backgroundColor');
            switch (result) {
                case 'initial':
                case 'rgba(0, 0, 0, 0)':
                case 'transparent':
                    result = '';
                    break;
                default:
                    if (result !== '' && this.pageFlow && !this.plainText && !this.inputElement && (this._initial === undefined || this.cssInitial('backgroundColor') === result)) {
                        let current = this.actualParent;
                        while (current) {
                            const color = current.cssInitial('backgroundColor', true);
                            if (color !== '') {
                                if (color === result && current.backgroundColor === '') {
                                    result = '';
                                }
                                break;
                            }
                            current = current.actualParent;
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
            const value = this.css('backgroundImage');
            if (value !== '' && value !== 'none' && value !== 'initial') {
                result = value;
            }
            else {
                result = REGEX_BACKGROUND.exec(this.css('background'))?.[1] || '';
            }
            this._cached.backgroundImage = result;
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
                let backgroundRepeatX = false;
                let backgroundRepeatY = false;
                if (backgroundImage) {
                    for (const repeat of this.css('backgroundRepeat').split(XML.SEPARATOR)) {
                        const [repeatX, repeatY] = repeat.split(' ');
                        if (!backgroundRepeatX) {
                            backgroundRepeatX = repeatX === 'repeat' || repeatX === 'repeat-x';
                        }
                        if (!backgroundRepeatY) {
                            backgroundRepeatY = repeatX === 'repeat' || repeatX === 'repeat-y' || repeatY === 'repeat';
                        }
                    }
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

    get absoluteParent() {
        let result = this._cached.absoluteParent;
        if (result === undefined) {
            result = this.actualParent;
            if (!this.pageFlow && !this.documentBody) {
                while (result) {
                    const position = result.cssInitial('position', false, true);
                    if (result.documentBody || position !== 'static' && position !== 'initial') {
                        break;
                    }
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
                const { left, right } = this.bounds;
                result = right - left;
            }
            else {
                if (this.display === 'table-cell' || this.actualParent?.flexElement && /^row/.test(this.actualParent.css('flexDirection')) && this.flexbox.grow > 0) {
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
            }
            this._cached.actualWidth = result;
        }
        return result;
    }

    get actualHeight() {
        let result = this._cached.actualHeight;
        if (result === undefined) {
            if (!this.plainText) {
                if (this.display === 'table-cell' || this.actualParent?.flexElement && /^column/.test(this.actualParent.css('flexDirection')) && this.flexbox.grow > 0) {
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
        return this._naturalChildren || setNaturalChildren(this);
    }

    set naturalElements(value) {
        this._naturalElements = value;
    }
    get naturalElements() {
        return this._naturalElements || setNaturalElements(this);
    }

    get firstChild(): T | null {
        return this.naturalElements[0] || null;
    }

    get lastChild() {
        const children = this.naturalElements;
        const length = children.length;
        return length > 0 ? children[length - 1] : null;
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
        for (let i = children.length - 1; i >= 0; i--) {
            const node = children[i];
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
                const attributes = (<Element> this._element).attributes;
                const length = attributes.length;
                for (let i = 0; i < length; i++) {
                    const { name, value } = <Attr> attributes.item(i);
                    result[name] = value;
                }
            }
            this._cached.attributes = result;
        }
        return result;
    }

    get boundingClientRect() {
        return <DOMRect> (this.naturalElement && this._element?.getBoundingClientRect() || this._bounds || newBoxRectDimension());
    }

    get fontSize() {
        let result = this._fontSize;
        if (result === undefined) {
            const getFontSize = (style: CSSStyleDeclaration) => parseFloat(style.getPropertyValue('font-size'));
            result = this.naturalElement ? getFontSize(this.style) : parseUnit(this.css('fontSize'));
            if (result === 0 && !this.naturalChild) {
                const element = this.element;
                result = element ? getFontSize(getStyle(element)) : NaN;
            }
            while (isNaN(result)) {
                const parent = this.actualParent;
                if (parent) {
                    result = getFontSize(parent.style);
                }
                else {
                    result = getFontSize(getStyle(document.body));
                    break;
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
            result = {
                fontFamily: this.css('fontFamily'),
                fontSize: this.css('fontSize'),
                fontWeight: this.css('fontWeight'),
                fontStyle: this.css('fontStyle'),
                color: this.css('color'),
                whiteSpace: this.css('whiteSpace'),
                textDecoration: this.css('textDecoration'),
                textTransform: this.css('textTransform'),
                letterSpacing: this.css('letterSpacing'),
                wordSpacing: this.css('wordSpacing')
            };
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
            result = this.naturalElement ? (<HTMLElement> this._element).dir : '';
            if (result === '') {
                let current = this.actualParent;
                while (current) {
                    result = current.dir;
                    if (result !== '') {
                        break;
                    }
                    current = current.actualParent;
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