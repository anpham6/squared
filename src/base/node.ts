import { CachedValue, InitialData } from './@types/node';

import { CSS_UNIT, NODE_ALIGNMENT } from './lib/enumeration';

type T = Node;

const $const = squared.lib.constant;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $regex = squared.lib.regex;
const $session = squared.lib.session;
const $util = squared.lib.util;

const REGEXP_BACKGROUND = /\s*(url\(.+?\))\s*/;

export default abstract class Node extends squared.lib.base.Container<T> implements squared.base.Node {
    public static copyTextStyle(dest: T, source: T) {
        dest.cssApply({
            fontFamily: source.css('fontFamily'),
            fontSize: $css.formatPX(source.fontSize),
            fontWeight: source.css('fontWeight'),
            fontStyle: source.css('fontStyle'),
            color: source.css('color'),
            whiteSpace: source.css('whiteSpace'),
            textDecoration: source.css('textDecoration'),
            textTransform: source.css('textTransform'),
            wordSpacing: source.css('wordSpacing'),
            opacity: source.css('opacity')
        });
    }

    public documentRoot = false;
    public depth = -1;
    public siblingIndex = Number.POSITIVE_INFINITY;
    public style!: CSSStyleDeclaration;

    public abstract innerBefore?: T;
    public abstract innerAfter?: T;
    public abstract queryMap?: T[][];

    protected _styleMap!: StringMap;
    protected _box?: BoxRectDimension;
    protected _bounds?: BoxRectDimension;
    protected _linear?: BoxRectDimension;

    protected readonly _element: Element | null = null;
    protected readonly _initial: InitialData<T> = {
        iteration: -1,
        children: [],
        styleMap: {}
    };

    protected abstract _documentParent?: T;
    protected abstract _cached: CachedValue<T>;

    private _parent?: T;
    private _data = {};
    private _fontSize = 0;
    private _inlineText = false;

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
            this._styleMap = {};
            this.style = <CSSStyleDeclaration> {};
        }
    }

    public init() {
        const element = <HTMLElement> this._element;
        if (element) {
            const sessionId = this.sessionId;
            if (sessionId !== '0') {
                $session.setElementCache(element, 'node', sessionId, this);
            }
            this.style = $session.getElementCache(element, 'style', '0') || $css.getStyle(element, undefined, false);
            this._styleMap = { ...$session.getElementCache(element, 'styleMap', sessionId) };
            if (this.styleElement && !this.pseudoElement && sessionId !== '0') {
                for (let attr of Array.from(element.style)) {
                    let value = element.style.getPropertyValue(attr);
                    attr = $util.convertCamelCase(attr);
                    value = $css.checkStyleValue(element, attr, value, this.style);
                    if (value !== '') {
                        this._styleMap[attr] = value;
                    }
                }
            }
        }
    }

    public saveAsInitial(overwrite = false) {
        if (this._initial.iteration === -1 || overwrite) {
            this._initial.children = this.duplicate();
            this._initial.styleMap = { ...this._styleMap };
        }
        if (this._bounds) {
            this._initial.bounds = $dom.assignRect(this._bounds);
            this._initial.linear = $dom.assignRect(this.linear);
            this._initial.box = $dom.assignRect(this.box);
        }
        this._initial.iteration++;
    }

    public unsafe(name: string, unset = false): any {
        if (unset) {
            delete this[`_${name}`];
        }
        else {
            return this[`_${name}`];
        }
    }

    public data(name: string, attr: string, value?: any, overwrite = true) {
        if ($util.hasValue(value)) {
            if (typeof this._data[name] !== 'object') {
                this._data[name] = {};
            }
            if (overwrite || this._data[name][attr] === undefined) {
                this._data[name][attr] = value;
            }
        }
        else if (value === null) {
            delete this._data[name];
        }
        return this._data[name] === undefined || this._data[name][attr] === undefined ? undefined : this._data[name][attr];
    }

    public unsetCache(...attrs: string[]) {
        if (attrs.length) {
            for (const attr of attrs) {
                switch (attr) {
                    case 'position':
                        this._cached = {};
                        return;
                    case 'width':
                        this._cached.percentWidth = undefined;
                        this._cached.actualWidth = undefined;
                    case 'minWidth':
                        this._cached.width = undefined;
                        break;
                    case 'height':
                        this._cached.percentHeight = undefined;
                        this._cached.actualHeight = undefined;
                    case 'minHeight':
                        this._cached.height = undefined;
                        break;
                    case 'verticalAlign':
                        this._cached.baseline = undefined;
                        break;
                    case 'display':
                        this._cached.inline = undefined;
                        this._cached.inlineVertical = undefined;
                        this._cached.inlineFlow = undefined;
                        this._cached.block = undefined;
                        this._cached.blockDimension = undefined;
                        this._cached.blockStatic = undefined;
                        this._cached.autoMargin = undefined;
                        break;
                    case 'backgroundColor':
                    case 'backgroundImage':
                        this._cached.visibleStyle = undefined;
                        break;
                    case 'pageFlow':
                        this._cached.positionAuto = undefined;
                        this._cached.blockStatic = undefined;
                        this._cached.baseline = undefined;
                        this._cached.floating = undefined;
                        this._cached.autoMargin = undefined;
                        this._cached.rightAligned = undefined;
                        this._cached.bottomAligned = undefined;
                        break;
                    case 'float':
                        this._cached.floating = undefined;
                        break;
                    default:
                        if (attr.startsWith('margin')) {
                            this._cached.autoMargin = undefined;
                        }
                        if (attr.startsWith('padding') || attr.startsWith('border')) {
                            this._cached.contentBoxWidth = undefined;
                            this._cached.contentBoxHeight = undefined;
                        }
                        break;
                }
                this._cached[attr] = undefined;
            }
        }
        else {
            this._cached = {};
        }
    }

    public ascend(condition?: (item: T) => boolean, parent?: T, attr = 'actualParent') {
        const result: T[] = [];
        let current = this[attr];
        while (current && current.id !== 0) {
            if (condition) {
                if (condition(current)) {
                    return [current];
                }
            }
            else {
                result.push(current);
            }
            if (current === parent) {
                break;
            }
            current = current[attr];
        }
        return result;
    }

    public intersectX(rect: BoxRectDimension, dimension = 'linear') {
        const self: BoxRectDimension = this[dimension];
        return (
            $util.aboveRange(rect.left, self.left) && Math.ceil(rect.left) < self.right ||
            rect.right > Math.ceil(self.left) && $util.belowRange(rect.right, self.right) ||
            $util.aboveRange(self.left, rect.left) && $util.belowRange(self.right, rect.right) ||
            $util.aboveRange(rect.left, self.left) && $util.belowRange(rect.right, self.right)
        );
    }

    public intersectY(rect: BoxRectDimension, dimension = 'linear') {
        const self: BoxRectDimension = this[dimension];
        return (
            $util.aboveRange(rect.top, self.top) && Math.ceil(rect.top) < self.bottom ||
            rect.bottom > Math.ceil(self.top) && $util.belowRange(rect.bottom, self.bottom) ||
            $util.aboveRange(self.top, rect.top) && $util.belowRange(self.bottom, rect.bottom) ||
            $util.aboveRange(rect.top, self.top) && $util.belowRange(rect.bottom, self.bottom)
        );
    }

    public withinX(rect: BoxRectDimension, dimension = 'linear') {
        const self: BoxRectDimension = this[dimension];
        return $util.aboveRange(self.left, rect.left) && $util.belowRange(self.right, rect.right);
    }

    public withinY(rect: BoxRectDimension, dimension = 'linear') {
        const self: BoxRectDimension = this[dimension];
        return $util.aboveRange(self.top, rect.top) && $util.belowRange(self.bottom, rect.bottom);
    }

    public outsideX(rect: BoxRectDimension, dimension = 'linear') {
        const self: BoxRectDimension = this[dimension];
        return self.left < Math.floor(rect.left) || Math.floor(self.right) > rect.right;
    }

    public outsideY(rect: BoxRectDimension, dimension = 'linear') {
        const self: BoxRectDimension = this[dimension];
        return self.top < Math.floor(rect.top) || Math.floor(self.bottom) > rect.bottom;
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
        return this._styleMap[attr] || this.style[attr] || '';
    }

    public cssSet(attr: string, value: string, cache = true) {
        let valid = true;
        if (this.styleElement) {
            this.style[attr] = value;
            const result = this.style[attr];
            valid = result === value || $css.isLength(value, true) && result.endsWith('px');
        }
        if (valid) {
            this.css(attr, value, cache);
        }
        return this;
    }

    public cssApply(values: StringMap, cache = false) {
        Object.assign(this._styleMap, values);
        if (cache) {
            for (const name in values) {
                this.unsetCache(name);
            }
        }
        return this;
    }

    public cssInitial(attr: string, modified = false, computed = false) {
        if (this._initial.iteration === -1 && !modified) {
            computed = true;
        }
        let value = modified ? this._styleMap[attr] : this._initial.styleMap[attr];
        if (computed && !value) {
            value = this.style[attr];
        }
        return value || '';
    }

    public cssAny(attr: string, ...values: string[]) {
        for (const value of values) {
            if (this.css(attr) === value) {
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

    public cssAscend(attr: string, startChild = false, dimension?: string) {
        let current = startChild ? this : this.actualParent;
        let value: string;
        while (current) {
            value = current.cssInitial(attr);
            if (value !== '') {
                if (dimension) {
                    return current.convertPX(value, dimension);
                }
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
            if (ascending) {
                return valueA < valueB ? -1 : 1;
            }
            else {
                return valueA > valueB ? -1 : 1;
            }
        });
        return children;
    }

    public cssPX(attr: string, value: number, negative = false, cache = false) {
        const current = this._styleMap[attr];
        if (current && $css.isLength(current)) {
            value += $css.parseUnit(current, this.fontSize);
            if (!negative && value < 0) {
                value = 0;
            }
            const length = $css.formatPX(value);
            this.css(attr, length);
            if (cache) {
                this.unsetCache(attr);
            }
            return length;
        }
        return '';
    }

    public cssSpecificity(attr: string) {
        if (this.styleElement) {
            const element = <Element> this._element;
            const target = this.pseudoElement ? $session.getElementCache(element, 'pseudoElement', this.sessionId) : '';
            const data: ObjectMap<number> = $session.getElementCache(element, `styleSpecificity${target ? '::' + target : ''}`, this.sessionId);
            if (data) {
                return data[attr] || 0;
            }
        }
        return 0;
    }

    public cssTry(attr: string, value: string) {
        if (this.styleElement) {
            const element = <HTMLElement> this._element;
            const current = (this.pseudoElement ? element.style : this.style).getPropertyValue(attr);
            if (current !== value) {
                element.style.setProperty(attr, value);
                const result = element.style.getPropertyValue(attr);
                if (result === value || $css.isLength(value, true) && result.endsWith('px')) {
                    $session.setElementCache(element, attr, this.sessionId, current);
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
            const element = <HTMLElement> this._element;
            const value: string = $session.getElementCache(element, attr, this.sessionId);
            if (value) {
                element.style.setProperty(attr, value);
                $session.deleteElementCache(element, attr, this.sessionId);
                return true;
            }
        }
        return false;
    }

    public toInt(attr: string, initial = false, fallback = 0) {
        const value = parseInt((initial ? this._initial.styleMap : this._styleMap)[attr]);
        return isNaN(value) ? fallback : value;
    }

    public toFloat(attr: string, initial = false, fallback = 0) {
        const value = parseFloat((initial ? this._initial.styleMap : this._styleMap)[attr]);
        return isNaN(value) ? fallback : value;
    }

    public parseUnit(value: string, dimension = $const.CSS.WIDTH, parent = true) {
        if (value) {
            if ($css.isPercent(value)) {
                let result = parseFloat(value) / 100;
                let node = this as T;
                if (parent) {
                    const absoluteParent = this.absoluteParent;
                    if (absoluteParent) {
                        node = absoluteParent;
                    }
                }
                switch (dimension) {
                    case $const.CSS.WIDTH:
                        result *= node.hasPX(dimension, false) ? node.actualWidth : node.bounds.width;
                        break;
                    case $const.CSS.HEIGHT:
                        result *= node.hasPX(dimension, false) ? node.actualHeight : node.bounds.height;
                        break;
                    default:
                        result *= Math.max(node.actualWidth, node.actualHeight);
                        break;
                }
                return result;
            }
            return $css.parseUnit(value, this.fontSize);
        }
        return 0;
    }

    public convertPX(value: string, dimension = $const.CSS.WIDTH, parent = true) {
        return value.endsWith('px') ? value : `${Math.round(this.parseUnit(value, dimension, parent))}px`;
    }

    public has(attr: string, checkType: number = 0, options?: ObjectMap<string | string[] | boolean>) {
        const value = (options && options.map === 'initial' ? this._initial.styleMap : this._styleMap)[attr];
        if (value) {
            switch (value) {
                case 'auto':
                case 'none':
                case 'initial':
                case 'unset':
                case 'normal':
                case 'transparent':
                case 'rgba(0, 0, 0, 0)':
                    return false;
                case 'baseline':
                case 'left':
                case 'start':
                    return this.flexElement || this.documentParent.flexElement;
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
                        if ($util.hasBit(checkType, CSS_UNIT.LENGTH) && $css.isLength(value)) {
                            return true;
                        }
                        if ($util.hasBit(checkType, CSS_UNIT.PERCENT) && $css.isPercent(value)) {
                            return true;
                        }
                    }
                    return checkType === 0;
            }
        }
        return false;
    }

    public hasPX(attr: string, percent = true, initial = false) {
        const value = (initial ? this._initial.styleMap : this._styleMap)[attr];
        return value ? $css.isLength(value, percent) : false;
    }

    public setBounds(cache = true) {
        if (this.styleElement) {
            this._bounds = $dom.assignRect($session.getClientRect(<Element> this._element, this.sessionId, cache), true);
            if (this.documentBody && this.marginTop === 0) {
                this._bounds.top = 0;
            }
        }
        else if (this.plainText) {
            const rect = $session.getRangeClientRect(<Element> this._element, this.sessionId, cache);
            this._bounds = $dom.assignRect(rect, true);
            this._cached.multiline = (rect.numberOfLines as number) > 0;
        }
        if (!cache) {
            this._linear = undefined;
            this._box = undefined;
        }
    }

    public querySelector(value: string) {
        return this.querySelectorAll(value, 1)[0] || null;
    }

    public querySelectorAll(value: string, resultCount = -1) {
        let result: T[] = [];
        if (this.length) {
            const queryMap = this.queryMap;
            if (queryMap) {
                const queries = value.split($regex.XML.SEPARATOR);
                for (let i = 0; i < queries.length; i++) {
                    const query = queries[i];
                    if (query.indexOf('::') !== -1) {
                        continue;
                    }
                    const selectors: QueryData[] = [];
                    let offset = -1;
                    invalid: {
                        $regex.CSS.SELECTOR_G.lastIndex = 0;
                        let adjacent: string | undefined;
                        let match: RegExpExecArray | null;
                        while ((match = $regex.CSS.SELECTOR_G.exec(query)) !== null) {
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
                            else if (segment.charAt(0) === '*') {
                                if (segment.endsWith('|*')) {
                                    all = true;
                                }
                                else {
                                    segment = segment.substring(1);
                                }
                            }
                            if (!all) {
                                let subMatch: RegExpExecArray | null;
                                while ((subMatch = $regex.CSS.SELECTOR_PSEUDO.exec(segment)) !== null) {
                                    if (subMatch[0].startsWith(':not(')) {
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
                                    segment = $util.spliceString(segment, subMatch.index, subMatch[0].length);
                                }
                                while ((subMatch = $regex.CSS.SELECTOR_ATTR.exec(segment)) !== null) {
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
                                    segment = $util.spliceString(segment, subMatch.index, subMatch[0].length);
                                }
                                while ((subMatch = $regex.CSS.SELECTOR_LABEL.exec(segment)) !== null) {
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
                                    segment = $util.spliceString(segment, subMatch.index, subMatch[0].length);
                                }
                            }
                            if (selectors.length > 0 || pseudoList === undefined) {
                                offset++;
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
                            adjacent = undefined;
                        }
                    }
                    let length = queryMap.length;
                    if (selectors.length && offset !== -1 && offset < length) {
                        const validate = (node: T, data: QueryData, last: boolean, adjacent?: string) => {
                            if (data.all) {
                                return true;
                            }
                            if (data.tagName && data.tagName !== node.tagName.toUpperCase()) {
                                return false;
                            }
                            if (data.id && data.id !== node.elementId) {
                                return false;
                            }
                            if (data.pseudoList) {
                                const parent = node.actualParent as T;
                                const tagName = node.tagName;
                                for (const pseudo of data.pseudoList) {
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
                                            if (parent.childrenElements.length > 1) {
                                                return false;
                                            }
                                            break;
                                        case ':only-of-type': {
                                            let j = 0;
                                            for (const item of parent.childrenElements) {
                                                if (item.tagName === tagName && ++j > 1) {
                                                    return false;
                                                }
                                            }
                                            break;
                                        }
                                        case ':first-of-type': {
                                            for (const item of parent.childrenElements) {
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
                                            if (node.inputElement) {
                                                if (!(<HTMLInputElement> node.element).checked) {
                                                    return false;
                                                }
                                            }
                                            else if (tagName === 'OPTION') {
                                                if (!(<HTMLOptionElement> node.element).selected) {
                                                    return false;
                                                }
                                            }
                                            else {
                                                return false;
                                            }
                                            break;
                                        case ':enabled':
                                            if ((<HTMLInputElement> node.element).disabled) {
                                                return false;
                                            }
                                            break;
                                        case ':disabled':
                                            if (!(<HTMLInputElement> node.element).disabled) {
                                                return false;
                                            }
                                            break;
                                        case ':read-only':
                                            if (tagName !== 'INPUT' && tagName !== 'TEXTAREA' || !(<HTMLInputElement> node.element).readOnly) {
                                                return false;
                                            }
                                            break;
                                        case ':read-write':
                                            if (tagName !== 'INPUT' && tagName !== 'TEXTAREA' || (<HTMLInputElement> node.element).readOnly) {
                                                return false;
                                            }
                                            break;
                                        case ':required':
                                            if (!(node.inputElement && (<HTMLInputElement> node.element).required) && tagName !== 'BUTTON') {
                                                return false;
                                            }
                                            break;
                                        case ':optional':
                                            if (!node.inputElement || tagName === 'BUTTON' || (<HTMLInputElement> node.element).required) {
                                                return false;
                                            }
                                            break;
                                        case ':in-range':
                                        case ':out-of-range': {
                                            if (tagName === 'INPUT') {
                                                const element = <HTMLInputElement> node.element;
                                                const rangeValue = parseFloat(element.value);
                                                if (!isNaN(rangeValue)) {
                                                    const min = $util.convertFloat(element.min);
                                                    const max = $util.convertFloat(element.max);
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
                                                            let form = element.parentElement;
                                                            while (form) {
                                                                if (form.tagName === 'FORM') {
                                                                    break;
                                                                }
                                                                form = form.parentElement;
                                                            }
                                                            const children = (form || document).querySelectorAll(`input[type=radio][name="${element.name}"`);
                                                            const lengthA = children.length;
                                                            for (let j = 0; j < lengthA; j++) {
                                                                if ((<HTMLInputElement> children.item(j)).checked) {
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
                                                if ((<HTMLProgressElement> node.element).value !== -1) {
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
                                                if (!(location.hash === `#${element.id}` || tagName === 'A' && location.hash === `#${element.name}`)) {
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
                                        case ':hover':
                                        case ':focus':
                                        case ':valid':
                                        case ':invalid': {
                                            const element = node.element;
                                            let valid = false;
                                            const children = (<HTMLElement> parent.element).querySelectorAll(`:scope > ${pseudo}`);
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
                                            continue;
                                        }
                                        default: {
                                            let match = /^:nth(-last)?-(child|of-type)\((.+)\)$/.exec(pseudo);
                                            if (match) {
                                                const placement = match[3].trim();
                                                const children = parent.childrenElements;
                                                if (match[1]) {
                                                    children.reverse();
                                                }
                                                let index: number;
                                                if (match[2] === 'child') {
                                                    index = children.indexOf(node);
                                                }
                                                else {
                                                    index = $util.filterArray(children, item => item.tagName === tagName).indexOf(node);
                                                }
                                                index++;
                                                if (index > 0) {
                                                    if ($util.isNumber(placement)) {
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
                                                            default:
                                                                const subMatch = /(-)?(\d+)?n\s*(\+\d+)?/.exec(placement);
                                                                if (subMatch) {
                                                                    const childOffset = $util.convertInt(subMatch[3]);
                                                                    if (subMatch[2]) {
                                                                        if (subMatch[1]) {
                                                                            return false;
                                                                        }
                                                                        const increment = parseInt(subMatch[2]);
                                                                        if (increment > 0) {
                                                                            if (index !== childOffset) {
                                                                                for (let j = increment; ; j += increment) {
                                                                                    const total = increment + childOffset;
                                                                                    if (total === index) {
                                                                                        break;
                                                                                    }
                                                                                    else if (total > index) {
                                                                                        return false;
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                        else if (index !== childOffset) {
                                                                            return false;
                                                                        }
                                                                    }
                                                                    else if (subMatch[3]) {
                                                                        if (subMatch[1]) {
                                                                            if (index > childOffset) {
                                                                                return false;
                                                                            }
                                                                        }
                                                                        else if (index < childOffset) {
                                                                            return false;
                                                                        }
                                                                    }
                                                                }
                                                                break;
                                                        }
                                                    }
                                                    continue;
                                                }
                                            }
                                            else {
                                                match = /^:lang\(\s*(.+)\s*\)$/.exec(pseudo);
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
                            if (data.notList) {
                                for (const not of data.notList) {
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
                                            $regex.CSS.SELECTOR_ATTR.lastIndex = 0;
                                            const match = $regex.CSS.SELECTOR_ATTR.exec(not);
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
                                            if ($regex.CHAR.WORDDASH.test(not)) {
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
                            if (data.classList) {
                                const classList = (<HTMLElement> node.element).classList;
                                for (const className of data.classList) {
                                    if (!classList.contains(className)) {
                                        return false;
                                    }
                                }
                            }
                            if (data.attrList) {
                                const attributes = node.attributes;
                                for (const attr of data.attrList) {
                                    let actualValue = attributes[attr.key];
                                    if (actualValue === undefined) {
                                        return false;
                                    }
                                    else if (attr.value) {
                                        if (attr.caseInsensitive) {
                                            actualValue = actualValue.toLowerCase();
                                        }
                                        if (attr.symbol) {
                                            switch (attr.symbol) {
                                                case '~':
                                                    if (!actualValue.split($regex.CHAR.SPACE).includes(attr.value)) {
                                                        return false;
                                                    }
                                                    break;
                                                case '^':
                                                    if (!actualValue.startsWith(attr.value)) {
                                                        return false;
                                                    }
                                                    break;
                                                case '$':
                                                    if (!actualValue.endsWith(attr.value)) {
                                                        return false;
                                                    }
                                                    break;
                                                case '*':
                                                    if (actualValue.indexOf(attr.value) === -1) {
                                                        return false;
                                                    }
                                                    break;
                                                case '|':
                                                    if (actualValue !== attr.value && !actualValue.startsWith(`${attr.value}-`)) {
                                                        return false;
                                                    }
                                                    break;
                                            }
                                        }
                                        else if (actualValue !== attr.value) {
                                            return false;
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
                                            const children = parent.childrenElements as T[];
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
        }
        return result;
    }

    private setDimension(attr: string, attrMin: string, attrMax: string) {
        const baseValue = this.parseUnit(this._styleMap[attr], attr);
        let value = Math.max(baseValue, this.parseUnit(this._styleMap[attrMin], attr));
        if (value === 0 && this.naturalElement && this.styleElement) {
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
                case 'EMBED':
                    const size = $dom.getNamedItem(element, attr);
                    if (size !== '') {
                        value = this.parseUnit(size, attr);
                        if (value > 0) {
                            this.css(attr, $css.isPercent(size) ? size : `${size}px`);
                        }
                    }
                    break;
            }
        }
        let maxValue = 0;
        if (baseValue > 0 && !this.imageElement) {
            if (this._styleMap[attrMax] === this._styleMap[attr]) {
                delete this._styleMap[attrMax];
            }
            else {
                maxValue = this.parseUnit(this._styleMap[attrMax], attr);
                if (maxValue > 0 && maxValue <= baseValue && $css.isLength(this._styleMap[attr])) {
                    maxValue = 0;
                    this._styleMap[attr] = this._styleMap[attrMax];
                    delete this._styleMap[attrMax];
                }
            }
        }
        return maxValue > 0 ? Math.min(value, maxValue) : value;
    }

    private setBoxModel(dimension: 'box' | 'linear') {
        const bounds: BoxRectDimension = this.unsafe(dimension);
        if (bounds) {
            bounds.width = this.bounds.width;
            if (this.plainText) {
                bounds.height = bounds.bottom - bounds.top;
            }
            else {
                bounds.height = this.bounds.height;
                switch (dimension) {
                    case 'box':
                        bounds.width -= this.contentBoxWidth;
                        bounds.height -= this.contentBoxHeight;
                        break;
                    case 'linear':
                        bounds.width += (this.marginLeft > 0 ? this.marginLeft : 0) + this.marginRight;
                        bounds.height += (this.marginTop > 0 ? this.marginTop : 0) + this.marginBottom;
                        break;
                }
            }
            if (this._initial[dimension] === undefined) {
                this._initial[dimension] = $dom.assignRect(bounds);
            }
        }
    }

    private convertPosition(attr: string) {
        let value = 0;
        if (!this.positionStatic) {
            const unit = this.cssInitial(attr, true);
            if ($css.isLength(unit)) {
                value = $util.convertFloat(this.convertPX(unit, attr === $const.CSS.LEFT || attr === $const.CSS.RIGHT ? $const.CSS.WIDTH : $const.CSS.HEIGHT));
            }
            else if ($css.isPercent(unit) && this.styleElement) {
                value = $util.convertFloat(this.style[attr]);
            }
        }
        return value;
    }

    private convertBorderWidth(index: number) {
        if (this.styleElement) {
            const value = this.css($css.BOX_BORDER[index][0]);
            if (value !== $const.CSS.NONE) {
                const width = this.css($css.BOX_BORDER[index][1]);
                let result: number;
                switch (width) {
                    case 'thin':
                    case 'medium':
                    case 'thick':
                        result = $util.convertFloat(this.style[$css.BOX_BORDER[index][1]]);
                        break;
                    default:
                        result = this.parseUnit(width, index === 1 || index === 3 ? $const.CSS.WIDTH : $const.CSS.HEIGHT);
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
                    return 0;
                }
                break;
        }
        const result = this.parseUnit(this.css(attr), $const.CSS.NONE);
        if (!margin) {
            let paddingStart = this.toFloat('paddingInlineStart');
            let paddingEnd = this.toFloat('paddingInlineEnd');
            if (paddingStart > 0 || paddingEnd > 0) {
                if (this.css('writingMode') === 'vertical-rl') {
                    if (this.dir === 'ltr') {
                        if (attr !== 'paddingTop') {
                            paddingStart = 0;
                        }
                        if (attr !== 'paddingBottom') {
                            paddingEnd = 0;
                        }
                    }
                    else {
                        if (attr !== 'paddingBottom') {
                            paddingStart = 0;
                        }
                        if (attr !== 'paddingTop') {
                            paddingEnd = 0;
                        }
                    }
                }
                else {
                    if (this.dir === 'ltr') {
                        if (attr !== 'paddingLeft') {
                            paddingStart = 0;
                        }
                        if (attr !== 'paddingRight') {
                            paddingEnd = 0;
                        }
                    }
                    else {
                        if (attr !== 'paddingRight') {
                            paddingStart = 0;
                        }
                        if (attr !== 'paddingLeft') {
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
            if (value !== this._parent) {
                if (this._parent) {
                    this._parent.remove(this);
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
        if (this._cached.tagName === undefined) {
            const element = <HTMLElement> this._element;
            if (element) {
                this._cached.tagName = element.nodeName.charAt(0) === '#' ? element.nodeName : element.tagName;
            }
            else {
                this._cached.tagName = '';
            }
        }
        return this._cached.tagName;
    }

    get element() {
        return this._element;
    }

    get elementId() {
        return this._element ? this._element.id : '';
    }

    get htmlElement() {
        if (this._cached.htmlElement === undefined) {
            this._cached.htmlElement = this._element instanceof HTMLElement;
        }
        return this._cached.htmlElement;
    }

    get svgElement() {
        if (this._cached.svgElement === undefined) {
            this._cached.svgElement = this._element instanceof SVGElement;
        }
        return this._cached.svgElement;
    }

    get styleElement() {
        return this.htmlElement || this.svgElement;
    }

    get naturalElement() {
        return true;
    }

    get actualElement() {
        if (this._cached.actualElement === undefined) {
            this._cached.actualElement = this.naturalElement && this.styleElement && !this.pseudoElement;
        }
        return this._cached.actualElement;
    }

    get pseudoElement() {
        return this._element !== null && this._element.className === '__squared.pseudo';
    }

    get imageElement() {
        return this.tagName === 'IMG';
    }

    get flexElement() {
        const value = this.display;
        return value === 'flex' || value === 'inline-flex';
    }

    get gridElement() {
        const value = this.display;
        return value === 'grid' || value === 'inline-grid';
    }

    get textElement() {
        return this.plainText || this.inlineText;
    }

    get tableElement() {
        return this.tagName === 'TABLE' || this.display === 'table';
    }

    get inputElement() {
        if (this._cached.inputElement === undefined) {
            switch (this.tagName) {
                case 'INPUT':
                case 'BUTTON':
                case 'SELECT':
                case 'TEXTAREA':
                    this._cached.inputElement = true;
                    break;
                default:
                    this._cached.inputElement = false;
                    break;
            }
        }
        return this._cached.inputElement;
    }

    get layoutElement() {
        return this.flexElement || this.gridElement;
    }

    get plainText() {
        return this.tagName === '#text';
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
        return this._bounds || $dom.newBoxRectDimension();
    }

    get linear() {
        if (this._linear === undefined && this._bounds) {
            if (this._element) {
                const bounds = this._bounds;
                this._linear = {
                    top: bounds.top - (this.marginTop > 0 ? this.marginTop : 0),
                    right: bounds.right + this.marginRight,
                    bottom: bounds.bottom + this.marginBottom,
                    left: bounds.left - (this.marginLeft > 0 ? this.marginLeft : 0),
                    width: 0,
                    height: 0
                };
            }
            else {
                this._linear = $dom.assignRect(this._bounds);
            }
            this.setBoxModel('linear');
        }
        return this._linear || $dom.newBoxRectDimension();
    }

    get box() {
        if (this._box === undefined && this._bounds) {
            if (this._element) {
                const bounds = this._bounds;
                this._box = {
                    top: bounds.top + (this.paddingTop + this.borderTopWidth),
                    right: bounds.right - (this.paddingRight + this.borderRightWidth),
                    bottom: bounds.bottom - (this.paddingBottom + this.borderBottomWidth),
                    left: bounds.left + (this.paddingLeft + this.borderLeftWidth),
                    width: 0,
                    height: 0
                };
            }
            else {
                this._box = $dom.assignRect(this._bounds);
            }
            this.setBoxModel('box');
        }
        return this._box || $dom.newBoxRectDimension();
    }

    get dataset(): DOMStringMap {
        return this.htmlElement ? (<HTMLElement> this._element).dataset : {};
    }

    get flexbox() {
        if (this._cached.flexbox === undefined) {
            const actualParent = this.actualParent;
            const alignSelf = this.css('alignSelf');
            const justifySelf = this.css('justifySelf');
            const getFlexValue = (attr: string, initialValue: number, parent?: Node): number => {
                const value = (parent || this).css(attr);
                if ($util.isNumber(value)) {
                    return parseFloat(value);
                }
                else if (value === 'inherit' && parent === undefined && actualParent) {
                    return getFlexValue(attr, initialValue, actualParent);
                }
                return initialValue;
            };
            this._cached.flexbox = {
                alignSelf: alignSelf === $const.CSS.AUTO && actualParent && actualParent.has('alignItems') ? actualParent.css('alignItems') : alignSelf,
                justifySelf: justifySelf === $const.CSS.AUTO && actualParent && actualParent.has('justifyItems') ? actualParent.css('justifyItems') : justifySelf,
                basis: this.css('flexBasis'),
                grow: getFlexValue('flexGrow', 0),
                shrink: getFlexValue('flexShrink', 1),
                order: this.toInt('order')
            };
        }
        return this._cached.flexbox;
    }

    get width() {
        if (this._cached.width === undefined) {
            this._cached.width = this.setDimension($const.CSS.WIDTH, 'minWidth', 'maxWidth');
        }
        return this._cached.width;
    }
    get height() {
        if (this._cached.height === undefined) {
            this._cached.height = this.setDimension($const.CSS.HEIGHT, 'minHeight', 'maxHeight');
        }
        return this._cached.height;
    }

    get hasWidth() {
        return this.width > 0;
    }
    get hasHeight() {
        const value = this.css($const.CSS.HEIGHT);
        if ($css.isPercent(value)) {
            if (this.pageFlow) {
                const actualParent = this.actualParent;
                if (actualParent && actualParent.hasHeight) {
                    return parseFloat(value) > 0;
                }
            }
            return false;
        }
        return this.height > 0;
    }

    get lineHeight() {
        if (this._cached.lineHeight === undefined) {
            if (!this.imageElement && !this.svgElement) {
                let hasOwnStyle = this.has('lineHeight');
                let value = 0;
                if (hasOwnStyle) {
                    value = $css.parseUnit(this.css('lineHeight'), this.fontSize);
                }
                else if (this.naturalElement) {
                    value = $util.convertFloat(this.cssAscend('lineHeight', false, $const.CSS.HEIGHT));
                    if (this.styleElement) {
                        const fontSize = this.cssInitial('fontSize');
                        if (fontSize.endsWith('em')) {
                            const emSize = parseFloat(fontSize);
                            if (emSize < 1) {
                                value *= emSize;
                                this.css('lineHeight', $css.formatPX(value));
                                hasOwnStyle = true;
                            }
                        }
                    }
                }
                this._cached.lineHeight = hasOwnStyle || value > this.actualHeight || this.multiline || this.block && this.actualChildren.some(node => node.textElement) ? value : 0;
            }
            else {
                this._cached.lineHeight = 0;
            }
        }
        return this._cached.lineHeight;
    }

    get display() {
        return this.css('display');
    }

    get positionStatic() {
        if (this._cached.positionStatic === undefined) {
            switch (this.css('position')) {
                case 'fixed':
                case 'absolute':
                    this._cached.positionStatic = false;
                    break;
                case 'sticky':
                case 'relative':
                    this._cached.positionStatic = !this.hasPX($const.CSS.TOP) && !this.hasPX($const.CSS.RIGHT) && !this.hasPX($const.CSS.BOTTOM) && !this.hasPX($const.CSS.LEFT);
                    if (this._cached.positionStatic) {
                        this._cached.positionRelative = false;
                    }
                    break;
                case 'inherit':
                    const position = this._element && this._element.parentElement ? $css.getInheritedStyle(this._element.parentElement, 'position') : '';
                    this._cached.positionStatic = position !== '' && !(position === 'absolute' || position === 'fixed');
                    break;
                default:
                    this._cached.positionStatic = true;
                    break;
            }
        }
        return this._cached.positionStatic;
    }

    get positionRelative() {
        if (this._cached.positionRelative === undefined) {
            const value = this.css('position');
            this._cached.positionRelative = value === 'relative' || value === 'sticky';
        }
        return this._cached.positionRelative;
    }

    get positionAuto() {
        if (this._cached.positionAuto === undefined) {
            const styleMap = this._initial.iteration === -1 ? this._styleMap : this._initial.styleMap;
            this._cached.positionAuto = !this.pageFlow && (
                (!styleMap.top || styleMap.top === $const.CSS.AUTO) &&
                (!styleMap.right || styleMap.right === $const.CSS.AUTO) &&
                (!styleMap.bottom || styleMap.bottom === $const.CSS.AUTO) &&
                (!styleMap.left || styleMap.left === $const.CSS.AUTO)
            );
        }
        return this._cached.positionAuto;
    }

    get top() {
        if (this._cached.top === undefined) {
            this._cached.top = this.convertPosition($const.CSS.TOP);
        }
        return this._cached.top;
    }
    get right() {
        if (this._cached.right === undefined) {
            this._cached.right = this.convertPosition($const.CSS.RIGHT);
        }
        return this._cached.right;
    }
    get bottom() {
        if (this._cached.bottom === undefined) {
            this._cached.bottom = this.convertPosition($const.CSS.BOTTOM);
        }
        return this._cached.bottom;
    }
    get left() {
        if (this._cached.left === undefined) {
            this._cached.left = this.convertPosition($const.CSS.LEFT);
        }
        return this._cached.left;
    }

    get marginTop() {
        if (this._cached.marginTop === undefined) {
            this._cached.marginTop = this.inlineStatic ? 0 : this.convertBox('marginTop', true);
        }
        return this._cached.marginTop;
    }
    get marginRight() {
        if (this._cached.marginRight === undefined) {
            this._cached.marginRight = this.convertBox('marginRight', true);
        }
        return this._cached.marginRight;
    }
    get marginBottom() {
        if (this._cached.marginBottom === undefined) {
            if (this.inlineStatic) {
                this._cached.marginBottom = 0;
            }
            else {
                const value = this.convertBox('marginBottom', true);
                this._cached.marginBottom = this.bounds.height === 0 && !this.overflowY && value > 0 ? 0 : value;
            }
        }
        return this._cached.marginBottom;
    }
    get marginLeft() {
        if (this._cached.marginLeft === undefined) {
            this._cached.marginLeft = this.convertBox('marginLeft', true);
        }
        return this._cached.marginLeft;
    }

    get borderTopWidth() {
        if (this._cached.borderTopWidth === undefined) {
            this._cached.borderTopWidth = this.convertBorderWidth(0);
        }
        return this._cached.borderTopWidth;
    }
    get borderRightWidth() {
        if (this._cached.borderRightWidth === undefined) {
            this._cached.borderRightWidth = this.convertBorderWidth(1);
        }
        return this._cached.borderRightWidth;
    }
    get borderBottomWidth() {
        if (this._cached.borderBottomWidth === undefined) {
            this._cached.borderBottomWidth = this.convertBorderWidth(2);
        }
        return this._cached.borderBottomWidth;
    }
    get borderLeftWidth() {
        if (this._cached.borderLeftWidth === undefined) {
            this._cached.borderLeftWidth = this.convertBorderWidth(3);
        }
        return this._cached.borderLeftWidth;
    }

    get paddingTop() {
        if (this._cached.paddingTop === undefined) {
            const value = this.convertBox('paddingTop', false);
            if (this.length && value > 0 && !this.layoutElement) {
                let top = 0;
                for (const node of this.children) {
                    if (node.inline && !node.has('lineHeight')) {
                        top = Math.max(top, node.paddingTop);
                    }
                    else {
                        top = 0;
                        break;
                    }
                }
                this._cached.paddingTop = Math.max(0, value - top);
            }
            else {
                this._cached.paddingTop = this.inlineStatic && !this.visibleStyle.background ? 0 : value;
            }
        }
        return this._cached.paddingTop;
    }
    get paddingRight() {
        if (this._cached.paddingRight === undefined) {
            this._cached.paddingRight = this.convertBox('paddingRight', false);
        }
        return this._cached.paddingRight;
    }
    get paddingBottom() {
        if (this._cached.paddingBottom === undefined) {
            const value = this.convertBox('paddingBottom', false);
            if (this.length && value > 0 && !this.layoutElement) {
                let bottom = 0;
                for (const node of this.children) {
                    if (node.inline && !node.has('lineHeight')) {
                        bottom = Math.max(bottom, node.paddingBottom);
                    }
                    else {
                        bottom = 0;
                        break;
                    }
                }
                this._cached.paddingBottom = Math.max(0, value - bottom);
            }
            else {
                this._cached.paddingBottom = this.inlineStatic && !this.visibleStyle.background ? 0 : value;
            }
        }
        return this._cached.paddingBottom;
    }
    get paddingLeft() {
        if (this._cached.paddingLeft === undefined) {
            this._cached.paddingLeft = this.convertBox('paddingLeft', false);
        }
        return this._cached.paddingLeft;
    }

    get contentBox() {
        return this.css('boxSizing') !== 'border-box';
    }

    get contentBoxWidth() {
        if (this._cached.contentBoxWidth === undefined) {
            this._cached.contentBoxWidth = this.tableElement && this.css('borderCollapse') === 'collapse' ? 0 : this.borderLeftWidth + this.paddingLeft + this.paddingRight + this.borderRightWidth;
        }
        return this._cached.contentBoxWidth;
    }

    get contentBoxHeight() {
        if (this._cached.contentBoxHeight === undefined) {
            this._cached.contentBoxHeight = this.tableElement && this.css('borderCollapse') === 'collapse' ? 0 : this.borderTopWidth + this.paddingTop + this.paddingBottom + this.borderBottomWidth;
        }
        return this._cached.contentBoxHeight;
    }

    get inline() {
        if (this._cached.inline === undefined) {
            const value = this.display;
            this._cached.inline = value === 'inline' || (value === 'initial' || value === 'unset') && !$dom.ELEMENT_BLOCK.includes(this.tagName);
        }
        return this._cached.inline;
    }

    get inlineStatic() {
        if (this._cached.inlineStatic === undefined) {
            this._cached.inlineStatic = this.inline && this.pageFlow && !this.floating && !this.imageElement;
        }
        return this._cached.inlineStatic;
    }

    get inlineVertical() {
        if (this._cached.inlineVertical === undefined) {
            const value = this.display;
            this._cached.inlineVertical = (value.startsWith('inline') || value === 'table-cell') && !this.floating && !this.plainText;
        }
        return this._cached.inlineVertical;
    }

    set inlineText(value) {
        switch (this.tagName) {
            case '':
            case 'INPUT':
            case 'IMG':
            case 'SELECT':
            case 'SVG':
            case 'HR':
            case 'TEXTAREA':
                break;
            case 'BUTTON':
                this._inlineText = true;
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
        if (this._cached.block === undefined) {
            const value = this.display;
            switch (value) {
                case 'block':
                case 'flex':
                case 'grid':
                case 'list-item':
                    this._cached.block = true;
                    break;
                case 'initial':
                    this._cached.block = $dom.ELEMENT_BLOCK.includes(this.tagName);
                    break;
                case 'inline':
                    if (this.tagName === 'svg') {
                        this._cached.block = !this.hasPX($const.CSS.WIDTH);
                        break;
                    }
                default:
                    this._cached.block = false;
                    break;
            }
        }
        return this._cached.block;
    }

    get blockStatic() {
        if (this._cached.blockStatic === undefined) {
            this._cached.blockStatic = this.pageFlow && (this.block && !this.floating || this.blockDimension && this.cssInitial($const.CSS.WIDTH) === $const.CSS.PERCENT_100 && !this.hasPX('maxWidth'));
        }
        return this._cached.blockStatic;
    }

    get blockDimension() {
        if (this._cached.blockDimension === undefined) {
            const value = this.display;
            this._cached.blockDimension = this.block || value.startsWith('inline-') || value === 'table' || this.imageElement || this.svgElement;
        }
        return this._cached.blockDimension;
    }

    get blockVertical() {
        if (this._cached.blockVertical === undefined) {
            this._cached.blockVertical = this.blockDimension && this.hasPX($const.CSS.HEIGHT);
        }
        return this._cached.blockVertical;
    }

    get pageFlow() {
        if (this._cached.pageFlow === undefined) {
            this._cached.pageFlow = this.positionStatic || this.positionRelative;
        }
        return this._cached.pageFlow;
    }

    get inlineFlow() {
        if (this._cached.inlineFlow === undefined) {
            const display = this.display;
            this._cached.inlineFlow = this.inline || display.startsWith('inline') || display === 'table-cell' || this.imageElement || this.floating;
        }
        return this._cached.inlineFlow;
    }

    get centerAligned() {
        if (this._cached.centerAligned === undefined) {
            this._cached.centerAligned = this.autoMargin.leftRight || this.textElement && this.blockStatic && this.cssInitial('textAlign') === $const.CSS.CENTER || this.inlineStatic && this.cssAscend('textAlign', true) === $const.CSS.CENTER;
        }
        return this._cached.centerAligned;
    }

    get rightAligned() {
        if (this._cached.rightAligned === undefined) {
            this._cached.rightAligned = this.float === $const.CSS.RIGHT || this.autoMargin.left || !this.pageFlow && this.hasPX($const.CSS.RIGHT) || this.textElement && this.blockStatic && this.cssInitial('textAlign') === $const.CSS.RIGHT;
        }
        return this._cached.rightAligned;
    }

    get bottomAligned() {
        if (this._cached.bottomAligned === undefined) {
            this._cached.bottomAligned = !this.pageFlow && this.hasPX($const.CSS.BOTTOM) && this.bottom >= 0;
        }
        return this._cached.bottomAligned;
    }

    get horizontalAligned() {
        if (this._cached.horizontalAligned === undefined) {
            this._cached.horizontalAligned = !this.blockStatic && !this.autoMargin.horizontal && !(this.blockDimension && this.css($const.CSS.WIDTH) === $const.CSS.PERCENT_100);
        }
        return this._cached.horizontalAligned;
    }

    get autoMargin() {
        if (this._cached.autoMargin === undefined) {
            if (!this.pageFlow || this.blockStatic || this.display === 'table') {
                const styleMap = this._initial.iteration === -1 ? this._styleMap : this._initial.styleMap;
                const left = styleMap.marginLeft === $const.CSS.AUTO && (this.pageFlow || this.hasPX($const.CSS.RIGHT));
                const right = styleMap.marginRight === $const.CSS.AUTO && (this.pageFlow || this.hasPX($const.CSS.LEFT));
                const top = styleMap.marginTop === $const.CSS.AUTO && (this.pageFlow || this.hasPX($const.CSS.BOTTOM));
                const bottom = styleMap.marginBottom === $const.CSS.AUTO && (this.pageFlow || this.hasPX($const.CSS.TOP));
                this._cached.autoMargin = {
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
                this._cached.autoMargin = {
                    horizontal: false,
                    left: false,
                    right: false,
                    leftRight: false,
                    top: false,
                    bottom: false,
                    vertical: false,
                    topBottom: false
                };
            }
        }
        return this._cached.autoMargin;
    }

    get floating() {
        if (this._cached.floating === undefined) {
            if (this.pageFlow) {
                this._cached.floating = this.cssAny('float', $const.CSS.LEFT, $const.CSS.RIGHT);
            }
            else {
                this._cached.floating = false;
            }
        }
        return this._cached.floating;
    }

    get float() {
        if (this._cached.float === undefined) {
            this._cached.float = this.css('float') ||  $const.CSS.NONE;
        }
        return this._cached.float;
    }

    get zIndex() {
        return this.toInt('zIndex');
    }

    get textContent() {
        if (this._cached.textContent === undefined) {
            this._cached.textContent = this.htmlElement || this.plainText ? (<Element> this._element).textContent as string : '';
        }
        return this._cached.textContent;
    }

    get textEmpty() {
        return this.inlineText && (this.textContent === '' || !this.preserveWhiteSpace && this.textContent.trim() === '');
    }

    get src() {
        return this.htmlElement && (<HTMLImageElement> this._element).src || '';
    }

    get overflow() {
        if (this._cached.overflow === undefined) {
            let value = 0;
            if (this.styleElement && !this.documentBody) {
                const element = <HTMLElement> this._element;
                const overflowX = this.css('overflowX');
                const overflowY = this.css('overflowY');
                if ((this.hasPX($const.CSS.WIDTH) || this.hasPX('maxWidth')) && (overflowX === 'scroll' || overflowX === $const.CSS.AUTO && element && element.clientWidth !== element.scrollWidth)) {
                    value |= NODE_ALIGNMENT.HORIZONTAL;
                }
                if (this.hasHeight && (this.hasPX($const.CSS.HEIGHT) || this.hasPX('maxHeight')) && (overflowY === 'scroll' || overflowY === $const.CSS.AUTO && element && element.clientHeight !== element.scrollHeight)) {
                    value |= NODE_ALIGNMENT.VERTICAL;
                }
                if (overflowX === $const.CSS.AUTO || overflowX === 'hidden' || overflowX === 'overlay' || overflowY === $const.CSS.AUTO || overflowY === 'hidden' || overflowY === 'overlay') {
                    value |= NODE_ALIGNMENT.BLOCK;
                }
            }
            this._cached.overflow = value;
        }
        return this._cached.overflow;
    }

    get overflowX() {
        return $util.hasBit(this.overflow, NODE_ALIGNMENT.HORIZONTAL);
    }
    get overflowY() {
        return $util.hasBit(this.overflow, NODE_ALIGNMENT.VERTICAL);
    }

    get baseline() {
        if (this._cached.baseline === undefined) {
            this._cached.baseline = this.pageFlow && !this.floating && this.cssAny('verticalAlign', 'baseline', 'initial', $const.CSS.PX_0, $const.CSS.PERCENT_0, 'unset');
        }
        return this._cached.baseline;
    }

    get verticalAlign() {
        if (this._cached.verticalAlign === undefined) {
            let value = this.css('verticalAlign');
            if ($css.isLength(value, true)) {
                value = this.convertPX(value, $const.CSS.HEIGHT);
            }
            this._cached.verticalAlign = value;
        }
        return this._cached.verticalAlign;
    }

    get multiline() {
        if (this._cached.multiline === undefined) {
            this._cached.multiline = this.plainText || this.inlineText && (this.inlineFlow || this.length === 0) ? ($session.getRangeClientRect(<Element> this._element, this.sessionId).numberOfLines as number) > 0 : false;
        }
        return this._cached.multiline;
    }

    get positiveAxis() {
        if (this._cached.positiveAxis === undefined) {
            this._cached.positiveAxis = (!this.positionRelative || this.positionRelative && this.top >= 0 && this.left >= 0 && (this.right <= 0 || this.hasPX($const.CSS.LEFT)) && (this.bottom <= 0 || this.hasPX($const.CSS.TOP))) && this.marginTop >= 0 && this.marginLeft >= 0 && this.marginRight >= 0;
        }
        return this._cached.positiveAxis;
    }

    get leftTopAxis() {
        if (this._cached.leftTopAxis === undefined) {
            const value = this.cssInitial('position');
            this._cached.leftTopAxis = value === 'absolute' && this.absoluteParent === this.documentParent || value === 'fixed';
        }
        return this._cached.leftTopAxis;
    }

    get backgroundColor() {
        if (this._cached.backgroundColor === undefined) {
            let value = this.css('backgroundColor');
            switch (value) {
                case 'initial':
                case 'unset':
                case 'rgba(0, 0, 0, 0)':
                    this._cached.backgroundColor = '';
                    break;
                default:
                    if (value !== '' && this.pageFlow && (this._initial.iteration === -1 || this.cssInitial('backgroundColor') === value)) {
                        let current = this.actualParent;
                        while (current && current.id !== 0) {
                            const color = current.cssInitial('backgroundColor', true);
                            if (color !== '') {
                                if (color === value) {
                                    value = '';
                                }
                                break;
                            }
                            current = current.actualParent;
                        }
                    }
                    this._cached.backgroundColor = value;
                    break;
            }
        }
        return this._cached.backgroundColor;
    }

    get backgroundImage() {
        if (this._cached.backgroundImage === undefined) {
            const value = this.css('backgroundImage');
            if (value !== '' && value !== $const.CSS.NONE) {
                this._cached.backgroundImage = value;
            }
            else {
                const match = REGEXP_BACKGROUND.exec(this.css('background'));
                this._cached.backgroundImage = match ? match[1] : '';
            }
        }
        return this._cached.backgroundImage;
    }

    get visibleStyle() {
        if (this._cached.visibleStyle === undefined) {
            const borderWidth = this.borderTopWidth > 0 || this.borderRightWidth > 0 || this.borderBottomWidth > 0 || this.borderLeftWidth > 0;
            const backgroundColor = this.backgroundColor !== '';
            const backgroundImage = this.backgroundImage !== '';
            this._cached.visibleStyle = {
                background: borderWidth || backgroundImage || backgroundColor,
                borderWidth,
                backgroundImage,
                backgroundColor,
                backgroundRepeat: this.css('backgroundRepeat') !== 'no-repeat'
            };
        }
        return this._cached.visibleStyle;
    }

    get preserveWhiteSpace() {
        if (this._cached.whiteSpace === undefined) {
            this._cached.whiteSpace = this.cssAny('whiteSpace', 'pre', 'pre-wrap');
        }
        return this._cached.whiteSpace;
    }

    get percentWidth() {
        if (this._cached.percentWidth === undefined) {
            this._cached.percentWidth = $css.isPercent(this.cssInitial($const.CSS.WIDTH, true));
        }
        return this._cached.percentWidth;
    }

    get percentHeight() {
        if (this._cached.percentHeight === undefined) {
            this._cached.percentHeight = $css.isPercent(this.cssInitial($const.CSS.HEIGHT, true));
        }
        return this._cached.percentHeight;
    }

    set documentParent(value) {
        this._documentParent = value;
    }
    get documentParent() {
        return this._documentParent || this.absoluteParent || this.actualParent || this.parent || this;
    }

    get absoluteParent() {
        if (this._cached.absoluteParent === undefined) {
            let current = this.actualParent;
            if (this.naturalElement && !this.pageFlow) {
                while (current && current.id !== 0) {
                    const position = current.cssInitial('position', false, true);
                    if (current.documentBody || position !== 'static' && position !== 'initial' && position !== 'unset') {
                        break;
                    }
                    current = current.actualParent;
                }
            }
            this._cached.absoluteParent = current || null;
        }
        return this._cached.absoluteParent;
    }

    set actualParent(value) {
        this._cached.actualParent = value;
    }
    get actualParent() {
        if (this._cached.actualParent === undefined) {
            const element = this.element;
            this._cached.actualParent = element && element.parentElement && $session.getElementAsNode<T>(element.parentElement, this.sessionId) || null;
        }
        return this._cached.actualParent;
    }

    set actualChildren(value) {
        this._cached.actualChildren = value;
    }

    get actualChildren() {
        if (this._cached.actualChildren === undefined) {
            if (this.actualElement) {
                const children: T[] = [];
                let i = 0;
                (<HTMLElement> this._element).childNodes.forEach((element: Element) => {
                    const node = $session.getElementAsNode<T>(element, this.sessionId);
                    if (node) {
                        children.push(node);
                        node.siblingIndex = i++;
                    }
                });
                this._cached.actualChildren = children;
            }
            else {
                if (this._initial.iteration === -1) {
                    this.saveAsInitial();
                }
                this._cached.actualChildren = this._initial.children;
            }
        }
        return this._cached.actualChildren;
    }

    get childrenElements() {
        if (this._cached.childrenElements === undefined) {
            this._cached.childrenElements = $util.filterArray(this.actualChildren, node => node.actualElement);
        }
        return this._cached.childrenElements;
    }

    get actualWidth() {
        if (this._cached.actualWidth === undefined) {
            if (this.plainText) {
                this._cached.actualWidth = this.bounds.right - this.bounds.left;
            }
            else if (!this.documentParent.flexElement && this.display !== 'table-cell') {
                let width = this.parseUnit(this.cssInitial($const.CSS.WIDTH, true));
                if (width > 0) {
                    const maxWidth = this.parseUnit(this.css('maxWidth'));
                    if (maxWidth > 0) {
                        width = Math.min(width, maxWidth);
                    }
                    if (this.contentBox && !this.tableElement) {
                        width += this.contentBoxWidth;
                    }
                    this._cached.actualWidth = width;
                    return width;
                }
            }
            this._cached.actualWidth = this.bounds.width;
        }
        return this._cached.actualWidth;
    }

    get actualHeight() {
        if (this._cached.actualHeight === undefined) {
            if (!this.plainText && !this.documentParent.flexElement && this.display !== 'table-cell') {
                let height = this.parseUnit(this.cssInitial($const.CSS.HEIGHT, true), $const.CSS.HEIGHT);
                if (height > 0) {
                    const maxHeight = this.parseUnit(this.css('maxHeight'));
                    if (maxHeight > 0) {
                        height = Math.min(height, maxHeight);
                    }
                    if (this.contentBox && !this.tableElement) {
                        height += this.contentBoxHeight;
                    }
                    this._cached.actualHeight = height;
                    return height;
                }
            }
            this._cached.actualHeight = this.bounds.height;
        }
        return this._cached.actualHeight;
    }

    get actualDimension(): Dimension {
        return { width: this.actualWidth, height: this.actualHeight };
    }

    get firstChild() {
        return this.childrenElements[0] || null;
    }

    get lastChild() {
        const children = this.childrenElements;
        return children.length ? children[children.length - 1] : null;
    }

    get previousSibling() {
        const parent = this.actualParent;
        if (parent) {
            return parent.actualChildren[this.siblingIndex - 1] || null;
        }
        return null;
    }

    get nextSibling() {
        const parent = this.actualParent;
        if (parent) {
            return parent.actualChildren[this.siblingIndex + 1] || null;
        }
        return null;
    }

    get previousElementSibling() {
        const parent = this.actualParent;
        if (parent) {
            const children = parent.childrenElements;
            const index = children.indexOf(this);
            if (index > 0) {
                return children[index - 1];
            }
        }
        return null;
    }

    get nextElementSibling() {
        const parent = this.actualParent;
        if (parent) {
            const children = parent.childrenElements;
            const index = children.indexOf(this);
            if (index < children.length - 1) {
                return children[index + 1];
            }
        }
        return null;
    }

    get attributes() {
        if (this._cached.attributes === undefined) {
            const result: StringMap = {};
            if (this.styleElement) {
                const element = <Element> this._element;
                const attributes = element.attributes;
                const length = attributes.length;
                for (let i = 0; i < length; i++) {
                    const attr = <Attr> attributes.item(i);
                    result[attr.name] = attr.value;
                }
            }
            this._cached.attributes = result;
        }
        return this._cached.attributes;
    }

    get fontSize() {
        if (this._fontSize === 0) {
            this._fontSize = this.styleElement && !this.pseudoElement ? parseFloat(this.style.getPropertyValue('font-size')) : $css.parseUnit(this.css('fontSize'));
        }
        return this._fontSize || parseFloat($css.getStyle(document.body).getPropertyValue('font-size'));
    }

    set dir(value) {
        this._cached.dir = value;
    }
    get dir() {
        if (this._cached.dir === undefined) {
            let value = this.naturalElement && this.styleElement && !this.pseudoElement ? (<HTMLElement> this._element).dir : '';
            switch (value) {
                case 'ltr':
                case 'rtl':
                    break;
                default:
                    let parent = this.actualParent;
                    while (parent) {
                        value = parent.dir;
                        if (value) {
                            this._cached.dir = value;
                            break;
                        }
                        parent = parent.actualParent;
                    }
                    break;
            }
            this._cached.dir = value || document.body.dir;
        }
        return this._cached.dir;
    }

    get center(): Point {
        return {
            x: (this.bounds.left + this.bounds.right) / 2,
            y: (this.bounds.top + this.bounds.bottom) / 2
        };
    }

    set visible(value) {
        if (this.styleElement) {
            this.cssSet('visibility', value ? 'visible' : 'hidden');
        }
    }
    get visible() {
        return !this.cssAny('visibility', 'hidden', 'collapse');
    }

    get extensions() {
        if (this._cached.extensions === undefined) {
            this._cached.extensions = this.dataset.use ? $util.spliceArray(this.dataset.use.split($regex.XML.SEPARATOR), value => value === '') : [];
        }
        return this._cached.extensions;
    }
}