import { CachedValue, InitialData } from '../../@types/base/node';

import { CSS_UNIT, NODE_ALIGNMENT } from './lib/enumeration';

type T = Node;

const {
    css: $css,
    dom: $dom,
    regex: $regex,
    session: $session,
    util: $util
} = squared.lib;

const CACHE_PATTERN = {
    BACKGROUND: /\s*(url\(.+?\))\s*/,
    NTH_CHILD_OFTYPE: /^:nth(-last)?-(child|of-type)\((.+)\)$/,
    NTH_CHILD_OFTYPE_VALUE: /^(-)?(\d+)?n\s*([+\-]\d+)?$/,
    LANG: /^:lang\(\s*(.+)\s*\)$/
};

const validateCssSet = (value: string, styleValue: string) => value === styleValue || $css.isLength(value, true) && styleValue.endsWith('px');

export default abstract class Node extends squared.lib.base.Container<T> implements squared.base.Node {
    public static getPseudoElt(node: T) {
        return node.pseudoElement ? $session.getElementCache(<Element> node.element, 'pseudoElement', node.sessionId) : '';
    }

    public documentRoot = false;
    public depth = -1;
    public childIndex = Number.POSITIVE_INFINITY;
    public style!: CSSStyleDeclaration;

    public abstract queryMap?: T[][];

    protected _styleMap!: StringMap;
    protected _box?: BoxRectDimension;
    protected _bounds?: BoxRectDimension;
    protected _linear?: BoxRectDimension;
    protected _textBounds?: BoxRectDimension;
    protected _fontSize = 0;

    protected readonly _element: Element | null = null;
    protected readonly _initial: InitialData<T> = {
        iteration: -1,
        children: [],
        styleMap: {}
    };

    protected abstract _cached: CachedValue<T>;
    protected abstract _naturalChildren?: T[];
    protected abstract _naturalElements?: T[];

    private _parent?: T;
    private _data = {};
    private _inlineText = false;
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
        }
    }

    public init() {
        const element = <HTMLElement> this._element;
        if (element) {
            const sessionId = this.sessionId;
            if (sessionId !== '0') {
                $session.setElementCache(element, 'node', sessionId, this);
            }
            this.style = this.pseudoElement ? $css.getStyle(element.parentElement, Node.getPseudoElt(this)) : $css.getStyle(element);
            this._styleMap = $session.getElementCache(element, 'styleMap', sessionId) || {};
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
        return typeof this._data[name] === 'object' && this._data[name] !== null ? this._data[name][attr] : undefined;
    }

    public unsetCache(...attrs: string[]) {
        if (attrs.length) {
            const cached = this._cached;
            for (const attr of attrs) {
                switch (attr) {
                    case 'position':
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
                        break;
                    case 'verticalAlign':
                        cached.baseline = undefined;
                        break;
                    case 'display':
                        cached.block = undefined;
                        cached.blockDimension = undefined;
                        cached.blockStatic = undefined;
                        cached.inline = undefined;
                        cached.inlineVertical = undefined;
                        cached.inlineFlow = undefined;
                        cached.autoMargin = undefined;
                        cached.flexElement = undefined;
                        cached.gridElement = undefined;
                        cached.tableElement = undefined;
                        cached.layoutElement = undefined;
                        break;
                    case 'backgroundColor':
                    case 'backgroundImage':
                        cached.visibleStyle = undefined;
                        break;
                    case 'pageFlow':
                        cached.positionAuto = undefined;
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
                    default:
                        if (attr.startsWith('margin')) {
                            cached.autoMargin = undefined;
                        }
                        if (attr.startsWith('padding') || attr.startsWith('border')) {
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
        if (this._initial.iteration === -1 && !modified) {
            computed = true;
        }
        let value = (modified ? this._styleMap : this._initial.styleMap)[attr];
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
            const data: ObjectMap<number> = $session.getElementCache(this.pseudoElement ? <Element> element.parentElement : element, `styleSpecificity${Node.getPseudoElt(this)}`, this.sessionId);
            if (data) {
                return data[attr] || 0;
            }
        }
        return 0;
    }

    public cssTry(attr: string, value: string) {
        if (this.styleElement) {
            const current = $css.getStyle(this._element).getPropertyValue(attr);
            if (current !== value) {
                const element = <HTMLElement> this._element;
                element.style.setProperty(attr, value);
                if (validateCssSet(value, element.style.getPropertyValue(attr))) {
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

    public parseUnit(value: string, dimension = 'width', parent = true) {
        if (value) {
            if ($css.isPercent(value)) {
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
            return $css.parseUnit(value, this.fontSize);
        }
        return 0;
    }

    public convertPX(value: string, dimension = 'width', parent = true) {
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
                    return this.flexElement || !!this.actualParent && this.actualParent.flexElement;
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
            this._bounds = $dom.assignRect($session.actualClientRect(<Element> this._element, this.sessionId, cache), true);
            if (this.documentBody && this.marginTop === 0) {
                this._bounds.top = 0;
            }
        }
        else if (this.plainText) {
            const rect = $dom.getRangeClientRect(<Element> this._element);
            const bounds = $dom.assignRect(rect, true);
            this._bounds = bounds;
            this._textBounds = bounds;
            this._cached.multiline = (rect.numberOfLines as number) > 0;
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
            const queries = $css.parseSelectorText(value);
            for (let i = 0; i < queries.length; i++) {
                const query = queries[i];
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
                        else if (segment.endsWith('|*')) {
                            all = segment === '*|*';
                        }
                        else if (segment.charAt(0) === '*') {
                            segment = segment.substring(1);
                        }
                        else if (segment.startsWith('::')) {
                            selectors.length = 0;
                            break invalid;
                        }
                        if (!all) {
                            let subMatch: RegExpExecArray | null;
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
                            if (segment.indexOf('::') !== -1) {
                                selectors.length = 0;
                                break invalid;
                            }
                            while ((subMatch = $regex.CSS.SELECTOR_PSEUDO_CLASS.exec(segment)) !== null) {
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
                                        const children = (<HTMLElement> parent.element).querySelectorAll(`:scope > ${pseudo}`);
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
                                        let match = CACHE_PATTERN.NTH_CHILD_OFTYPE.exec(pseudo);
                                        if (match) {
                                            const placement = match[3].trim();
                                            let children = parent.naturalElements;
                                            if (match[1]) {
                                                children = children.slice(0).reverse();
                                            }
                                            const index = (match[2] === 'child' ? children.indexOf(node) : $util.filterArray(children, item => item.tagName === tagName).indexOf(node)) + 1;
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
                                                            const subMatch = CACHE_PATTERN.NTH_CHILD_OFTYPE_VALUE.exec(placement);
                                                            if (subMatch) {
                                                                const modifier = $util.convertInt(subMatch[3]);
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
                                                continue;
                                            }
                                        }
                                        else {
                                            match = CACHE_PATTERN.LANG.exec(pseudo);
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
                                        const children = parent.naturalElements as T[];
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

    public getTextStyle() {
        if (this._textStyle === undefined) {
            this._textStyle = {
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
        }
        return this._textStyle;
    }

    private setDimension(attr: string, attrMin: string, attrMax: string) {
        const styleMap = this._styleMap;
        const baseValue = this.parseUnit(styleMap[attr], attr);
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
            if (styleMap[attrMax] === styleMap[attr]) {
                delete styleMap[attrMax];
            }
            else {
                maxValue = this.parseUnit(styleMap[attrMax], attr);
                if (maxValue > 0 && maxValue <= baseValue && $css.isLength(styleMap[attr])) {
                    maxValue = 0;
                    styleMap[attr] = styleMap[attrMax];
                    delete this._styleMap[attrMax];
                }
            }
        }
        return maxValue > 0 ? Math.min(value, maxValue) : value;
    }

    private setBoxModel(dimension: 'box' | 'linear') {
        const bounds = dimension === 'box' ? this._box : this._linear;
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
                value = $util.convertFloat(this.convertPX(unit, attr === 'left' || attr === 'right' ? 'width' : 'height'));
            }
            else if ($css.isPercent(unit) && this.styleElement) {
                value = $util.convertFloat(this.style[attr]);
            }
        }
        return value;
    }

    private convertBorderWidth(index: number) {
        if (!this.plainText) {
            const value = this.css($css.BOX_BORDER[index][0]);
            if (value !== 'none') {
                const width = this.css($css.BOX_BORDER[index][1]);
                let result: number;
                switch (width) {
                    case 'thin':
                    case 'medium':
                    case 'thick':
                        result = $util.convertFloat(this.style[$css.BOX_BORDER[index][1]]);
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
                    return 0;
                }
                break;
        }
        const result = this.parseUnit(this.css(attr));
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
        let result = this._cached.tagName;
        if (result === undefined) {
            const element = <HTMLElement> this._element;
            if (element) {
                result = element.nodeName.charAt(0) === '#' ? element.nodeName : element.tagName;
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
        return this._element ? this._element.id : '';
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
            result = !this.htmlElement && !this.plainText && this._element instanceof SVGElement;
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
        if (this.styleElement) {
            return (<HTMLElement> this._element).dataset;
        }
        else {
            if (this._dataset === undefined) {
                this._dataset = {};
            }
            return this._dataset;
        }
    }

    get flexbox() {
        let result = this._cached.flexbox;
        if (result === undefined) {
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
            result = {
                alignSelf: alignSelf === 'auto' && actualParent && actualParent.has('alignItems') ? actualParent.css('alignItems') : alignSelf,
                justifySelf: justifySelf === 'auto' && actualParent && actualParent.has('justifyItems') ? actualParent.css('justifyItems') : justifySelf,
                basis: this.css('flexBasis'),
                grow: getFlexValue('flexGrow', 0),
                shrink: getFlexValue('flexShrink', 1),
                order: this.toInt('order')
            };
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
        const value = this.css('height');
        if ($css.isPercent(value)) {
            if (this.pageFlow) {
                const parent = this.actualParent;
                if (parent && parent.hasHeight) {
                    return parseFloat(value) > 0;
                }
            }
            return false;
        }
        return this.height > 0;
    }

    get lineHeight() {
        let result = this._cached.lineHeight;
        if (result === undefined) {
            if (!this.imageElement && !this.svgElement) {
                let hasOwnStyle = this.has('lineHeight');
                let value = 0;
                if (hasOwnStyle) {
                    const lineHeight = this.css('lineHeight');
                    if ($css.isPercent(lineHeight)) {
                        value = $util.convertFloat(this.style.lineHeight as string);
                    }
                    else {
                        value = $css.parseUnit(lineHeight, this.fontSize);
                    }
                }
                else if (this.naturalChild) {
                    let current = this.actualParent;
                    while (current) {
                        if (current.lineHeight > 0) {
                            value = current.lineHeight;
                            break;
                        }
                        current = current.actualParent;
                    }
                    if (this.styleElement) {
                        const fontSize = this.cssInitial('fontSize');
                        if (fontSize.endsWith('em')) {
                            const emSize = parseFloat(fontSize);
                            if (emSize !== 1) {
                                value *= emSize;
                                this.css('lineHeight', $css.formatPX(value));
                                hasOwnStyle = true;
                            }
                        }
                    }
                }
                result = hasOwnStyle || value > this.actualHeight || this.multiline || this.block && this.naturalChildren.some(node => node.textElement) ? value : 0;
            }
            else {
                result = 0;
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
                case 'sticky':
                case 'relative':
                    result = !this.hasPX('top') && !this.hasPX('right') && !this.hasPX('bottom') && !this.hasPX('left');
                    if (result) {
                        this._cached.positionRelative = false;
                    }
                    break;
                case 'inherit':
                    const position = this._element && this._element.parentElement ? $css.getInheritedStyle(this._element.parentElement, 'position') : '';
                    result = position !== '' && !(position === 'absolute' || position === 'fixed');
                    break;
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
            const value = this.css('position');
            result = value === 'relative' || value === 'sticky';
            this._cached.positionRelative = result;
        }
        return result;
    }

    get positionAuto() {
        let result = this._cached.positionAuto;
        if (result === undefined) {
            const styleMap = this._initial.iteration === -1 ? this._styleMap : this._initial.styleMap;
            result = !this.pageFlow && (
                (!styleMap.top || styleMap.top === 'auto') &&
                (!styleMap.right || styleMap.right === 'auto') &&
                (!styleMap.bottom || styleMap.bottom === 'auto') &&
                (!styleMap.left || styleMap.left === 'auto')
            );
            this._cached.positionAuto = result;
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
            if (this.inlineStatic) {
                result = 0;
            }
            else {
                const value = this.convertBox('marginBottom', true);
                result = this.bounds.height === 0 && !this.overflowY && value > 0 ? 0 : value;
            }
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
                result = Math.max(0, value - top);
            }
            else {
                result = this.inlineStatic && !this.visibleStyle.background ? 0 : value;
            }
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
                result = Math.max(0, value - bottom);
            }
            else {
                result = this.inlineStatic && !this.visibleStyle.background ? 0 : value;
            }
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
            result = value === 'inline' || (value === 'initial' || value === 'unset') && !$dom.ELEMENT_BLOCK.includes(this.tagName);
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
            if (this.naturalElement) {
                const value = this.display;
                result = (value.startsWith('inline') || value === 'table-cell') && !this.floating && !this.plainText;
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
                    result = $dom.ELEMENT_BLOCK.includes(this.tagName);
                    break;
                case 'inline':
                    if (this.tagName === 'svg' && (this.actualParent as T).htmlElement) {
                        result = !this.hasPX('width') && $util.convertFloat($dom.getNamedItem(<SVGSVGElement> this._element, 'width')) === 0;
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
            const value = this.display;
            result = this.block || value.startsWith('inline-') || value === 'table' || this.imageElement || this.svgElement;
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
            const display = this.display;
            result = this.inline || display.startsWith('inline') || display === 'table-cell' || this.imageElement || this.floating;
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
            result = this.float === 'right' || this.autoMargin.left || !this.pageFlow && this.hasPX('right') || this.textElement && this.blockStatic && this.cssInitial('textAlign') === 'right';
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
                const styleMap = this._initial.iteration === -1 ? this._styleMap : this._initial.styleMap;
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
            if (this.pageFlow) {
                result = this.cssAny('float', 'left', 'right');
            }
            else {
                result = false;
            }
            this._cached.floating = result;
        }
        return result;
    }

    get float() {
        let result = this._cached.float;
        if (result === undefined) {
            result = this.css('float') || 'none';
            this._cached.float = result;
        }
        return result;
    }

    get zIndex() {
        return this.toInt('zIndex');
    }

    get textContent() {
        return this.htmlElement || this.plainText ? (<Element> this._element).textContent as string : '';
    }

    get src() {
        return this.htmlElement && (<HTMLImageElement> this._element).src || '';
    }

    get overflow() {
        let result = this._cached.overflow;
        if (result === undefined) {
            result = 0;
            if (this.styleElement && !this.documentBody) {
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
        return $util.hasBit(this.overflow, NODE_ALIGNMENT.HORIZONTAL);
    }
    get overflowY() {
        return $util.hasBit(this.overflow, NODE_ALIGNMENT.VERTICAL);
    }

    get baseline() {
        let result = this._cached.baseline;
        if (result === undefined) {
            result = this.pageFlow && !this.floating && this.cssAny('verticalAlign', 'baseline', 'initial', '0px', '0%', 'unset');
            this._cached.baseline = result;
        }
        return result;
    }

    get verticalAlign() {
        let result = this._cached.verticalAlign;
        if (result === undefined) {
            result = this.css('verticalAlign');
            if ($css.isLength(result, true)) {
                result = this.convertPX(result, 'height');
            }
            this._cached.verticalAlign = result;
        }
        return result;
    }

    set textBounds(value) {
        if (value) {
            this._textBounds = value;
        }
        else {
            this._textBounds = undefined;
        }
    }
    get textBounds() {
        if (this.naturalChild && this._textBounds === undefined) {
            this._textBounds = $session.actualTextRangeRect(<Element> this._element, this.sessionId);
        }
        return this._textBounds;
    }

    get multiline() {
        let result = this._cached.multiline;
        if (result === undefined) {
            if (this.plainText) {
                result = ($dom.getRangeClientRect(<Element> this._element).numberOfLines as number) > 0;
            }
            else if (this.styleText && (this.inlineFlow || this.naturalElements.length === 0)) {
                const textBounds = this.textBounds;
                result = textBounds ? (textBounds.numberOfLines as number) > 0 : false;
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
                case 'unset':
                case 'rgba(0, 0, 0, 0)':
                    result = '';
                    break;
                default:
                    if (result !== '' && this.pageFlow && !this.plainText && !this.inputElement && (this._initial.iteration === -1 || this.cssInitial('backgroundColor') === result)) {
                        let current = this.actualParent;
                        while (current && current.id !== 0) {
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
                const match = CACHE_PATTERN.BACKGROUND.exec(this.css('background'));
                result = match ? match[1] : '';
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
                    backgroundRepeat: false
                };
            }
            else {
                const borderWidth = this.borderTopWidth > 0 || this.borderRightWidth > 0 || this.borderBottomWidth > 0 || this.borderLeftWidth > 0;
                const backgroundColor = this.backgroundColor !== '';
                const backgroundImage = this.backgroundImage !== '';
                result = {
                    background: borderWidth || backgroundImage || backgroundColor,
                    borderWidth,
                    backgroundImage,
                    backgroundColor,
                    backgroundRepeat: this.css('backgroundRepeat') !== 'no-repeat'
                };
            }
            this._cached.visibleStyle = result;
        }
        return result;
    }

    get percentWidth() {
        let result = this._cached.percentWidth;
        if (result === undefined) {
            result = $css.isPercent(this.cssInitial('width', true));
            this._cached.percentWidth = result;
        }
        return result;
    }

    get percentHeight() {
        let result = this._cached.percentHeight;
        if (result === undefined) {
            result = $css.isPercent(this.cssInitial('height', true));
            this._cached.percentHeight = result;
        }
        return result;
    }

    get absoluteParent() {
        let result = this._cached.absoluteParent;
        if (result === undefined) {
            result = this.actualParent;
            if (!this.pageFlow) {
                while (result && result.id !== 0) {
                    const position = result.cssInitial('position', false, true);
                    if (result.documentBody || position !== 'static' && position !== 'initial' && position !== 'unset') {
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
            const element = this._element;
            result = element && element.parentElement && $session.getElementAsNode<T>(element.parentElement, this.sessionId) || null;
            this._cached.actualParent = result;
        }
        return result;
    }

    get actualWidth() {
        let result = this._cached.actualWidth;
        if (result === undefined) {
            if (this.plainText) {
                result = this.bounds.right - this.bounds.left;
            }
            else {
                result = this.bounds.width;
                const parent = this.actualParent;
                if (parent && !parent.flexElement && this.display !== 'table-cell') {
                    const width = this.parseUnit(this.cssInitial('width', true));
                    if (width > 0) {
                        result = width;
                        const maxWidth = this.parseUnit(this.css('maxWidth'));
                        if (maxWidth > 0) {
                            result = Math.min(result, maxWidth);
                        }
                        if (this.contentBox && !this.tableElement) {
                            result += this.contentBoxWidth;
                        }
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
            result = this.bounds.height;
            if (!this.plainText) {
                const parent = this.actualParent;
                if (parent && !parent.flexElement && this.display !== 'table-cell') {
                    const height = this.parseUnit(this.cssInitial('height', true), 'height');
                    if (height > 0) {
                        result = height;
                        const maxHeight = this.parseUnit(this.css('maxHeight'));
                        if (maxHeight > 0) {
                            result = Math.min(result, maxHeight);
                        }
                        if (this.contentBox && !this.tableElement) {
                            result += this.contentBoxHeight;
                        }
                    }
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
                const children: T[] = [];
                let i = 0;
                (<HTMLElement> this._element).childNodes.forEach((child: Element) => {
                    const node = $session.getElementAsNode<T>(child, this.sessionId);
                    if (node) {
                        node.childIndex = i++;
                        children.push(node);
                    }
                });
                this._naturalChildren = children;
            }
            else {
                if (this._initial.iteration === -1) {
                    this.saveAsInitial();
                }
                this._naturalChildren = this._initial.children;
            }
        }
        return this._naturalChildren;
    }

    set naturalElements(value) {
        this._naturalElements = value;
    }
    get naturalElements() {
        if (this._naturalElements === undefined) {
            this._naturalElements = $util.filterArray(this.naturalChildren, node => node.naturalElement);
        }
        return this._naturalElements;
    }

    get firstChild(): T | null {
        return this.naturalElements[0] || null;
    }

    get lastChild() {
        const children = this.naturalElements;
        const length = children.length;
        return length ? children[length - 1] : null;
    }

    get previousSibling() {
        const parent = this.actualParent;
        if (parent) {
            return parent.naturalChildren[this.childIndex - 1] || null;
        }
        return null;
    }

    get nextSibling() {
        const parent = this.actualParent;
        if (parent) {
            return parent.naturalChildren[this.childIndex + 1] || null;
        }
        return null;
    }

    get previousElementSibling() {
        const parent = this.actualParent;
        if (parent) {
            const children = parent.naturalElements;
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
            const children = parent.naturalElements;
            const index = children.indexOf(this);
            if (index < children.length - 1) {
                return children[index + 1];
            }
        }
        return null;
    }

    get attributes() {
        let result = this._cached.attributes;
        if (result === undefined) {
            result = {};
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
        return result;
    }

    get fontSize() {
        if (this._fontSize === 0) {
            this._fontSize = this.naturalElement ? parseFloat(this.style.getPropertyValue('font-size')) : $css.parseUnit(this.css('fontSize'));
        }
        return this._fontSize || parseFloat($css.getStyle(document.body).getPropertyValue('font-size'));
    }

    set dir(value) {
        this._cached.dir = value;
    }
    get dir() {
        let result = this._cached.dir;
        if (result === undefined) {
            result = '';
            if (this.naturalElement) {
                result = (<HTMLElement> this._element).dir;
            }
            else {
                let current = this.actualParent;
                while (current && !current.naturalElement) {
                    current = current.actualParent;
                }
                if (current) {
                    result = (<HTMLElement> current.element).dir;
                }
            }
            this._cached.dir = result;
        }
        return result;
    }

    get center(): Point {
        return {
            x: (this.bounds.left + this.bounds.right) / 2,
            y: (this.bounds.top + this.bounds.bottom) / 2
        };
    }

    get extensions() {
        let result = this._cached.extensions;
        if (result === undefined) {
            result = this.dataset.use ? $util.spliceArray(this.dataset.use.split($regex.XML.SEPARATOR), value => value === '') : [];
            this._cached.extensions = result;
        }
        return result;
    }
}