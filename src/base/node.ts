import { NodeTemplate } from './@types/application';
import { CachedValue, InitialData, SiblingDirection, Support } from './@types/node';

import Extension from './extension';

import { CSS_SPACING } from './lib/constant';
import { APP_SECTION, BOX_STANDARD, CSS_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE } from './lib/enumeration';

type T = Node;

const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $session = squared.lib.session;
const $util = squared.lib.util;

const INHERIT_ALIGNMENT = ['position', 'display', 'verticalAlign', 'float', 'clear', 'zIndex'];
const CSS_SPACING_KEYS = Array.from(CSS_SPACING.keys());

export default abstract class Node extends squared.lib.base.Container<T> implements squared.base.Node {
    public alignmentType = 0;
    public depth = -1;
    public siblingIndex = Number.POSITIVE_INFINITY;
    public documentRoot = false;
    public visible = true;
    public excluded = false;
    public rendered = false;
    public baselineActive = false;
    public baselineAltered = false;
    public lineBreakLeading = false;
    public lineBreakTrailing = false;
    public positioned = false;
    public controlId = '';
    public style!: CSSStyleDeclaration;
    public renderParent?: T;
    public renderExtension?: Extension<T>[];
    public renderTemplates?: NodeTemplate<T>[];
    public outerParent?: T;
    public innerChild?: T;
    public companion?: T;
    public extracted?: T[];
    public horizontalRows?: T[][];
    public beforePseudoChild?: T;
    public afterPseudoChild?: T;

    public abstract readonly localSettings: {};
    public abstract readonly renderChildren: T[];

    protected _cached: CachedValue<T> = {};
    protected _styleMap!: StringMap;
    protected _box?: RectDimension;
    protected _bounds?: RectDimension;
    protected _linear?: RectDimension;
    protected _controlName?: string;
    protected _documentParent?: T;
    protected readonly _initial: InitialData<T> = {
        iteration: -1,
        children: [],
        styleMap: {}
    };

    protected abstract _namespaces: string[];
    protected abstract readonly _boxAdjustment: BoxModel;
    protected abstract readonly _boxReset: BoxModel;

    private _data = {};
    private _excludeSection = 0;
    private _excludeProcedure = 0;
    private _excludeResource = 0;
    private _inlineText = false;
    private _parent?: T;
    private _renderAs?: T;
    private readonly _element: Element | null = null;

    protected constructor(
        public readonly id: number,
        public readonly sessionId = '0',
        element?: Element)
    {
        super();
        if (element) {
            this._element = element;
            this.init();
        }
        else {
            this.style = <CSSStyleDeclaration> {};
            this._styleMap = {};
        }
    }

    public abstract setControlType(viewName: string, containerType?: number): void;
    public abstract setLayout(width?: number, height?: number): void;
    public abstract setAlignment(): void;
    public abstract applyOptimizations(): void;
    public abstract applyCustomizations(overwrite?: boolean): void;
    public abstract setBoxSpacing(): void;
    public abstract extractAttributes(depth?: number): string;
    public abstract alignParent(position: string): boolean;
    public abstract alignSibling(position: string, documentId?: string): string;
    public abstract localizeString(value: string): string;
    public abstract clone(id?: number, attributes?: boolean, position?: boolean): T;
    public abstract set containerType(value: number);
    public abstract get containerType(): number;
    public abstract get documentId(): string;
    public abstract get fontSize(): number;
    public abstract get support(): Support;

    public init() {
        const element = <HTMLElement> this._element;
        if (element) {
            if (this.sessionId !== '0') {
                $session.setElementCache(element, 'node', this.sessionId, this);
            }
            this.style = $session.getElementCache(element, 'style', '0') || $css.getStyle(element, undefined, false);
            this._styleMap = { ...$session.getElementCache(element, 'styleMap', this.sessionId) };
            if (this.styleElement && !this.pseudoElement && this.sessionId !== '0') {
                const fontSize = parseFloat(this.style.getPropertyValue('font-size'));
                for (let attr of Array.from(element.style)) {
                    let value = element.style.getPropertyValue(attr);
                    attr = $util.convertCamelCase(attr);
                    value = $css.checkStyleValue(element, attr, value, this.style, 1000, fontSize);
                    if (value) {
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

    public is(...containers: number[]) {
        return containers.some(value => this.containerType === value);
    }

    public of(containerType: number, ...alignmentType: number[]) {
        return this.containerType === containerType && alignmentType.some(value => this.hasAlign(value));
    }

    public unsafe(name: string): any {
        return this[`_${name}`] || undefined;
    }

    public attr(name: string, attr: string, value?: string, overwrite = true): string {
        let obj = this[`__${name}`];
        if (value) {
            if (obj === undefined) {
                if (!this._namespaces.includes(name)) {
                    this._namespaces.push(name);
                }
                obj = {};
                this[`__${name}`] = obj;
            }
            if (!overwrite && obj[attr]) {
                return '';
            }
            obj[attr] = value.toString();
            return obj[attr];
        }
        else {
            return obj && obj[attr] || '';
        }
    }

    public namespace(name: string): StringMap {
        return this[`__${name}`] || {};
    }

    public delete(name: string, ...attrs: string[]) {
        const obj = this[`__${name}`];
        if (obj) {
            for (const attr of attrs) {
                if (attr.indexOf('*') !== -1) {
                    for (const [key] of $util.searchObject(obj, attr)) {
                        delete obj[key];
                    }
                }
                else {
                    delete obj[attr];
                }
            }
        }
    }

    public apply(options: {}) {
        for (const name in options) {
            const obj = options[name];
            if (typeof obj === 'object') {
                for (const attr in obj) {
                    this.attr(name, attr, obj[attr]);
                }
                delete options[name];
            }
        }
    }

    public render(parent?: T) {
        this.renderParent = parent;
        this.rendered = true;
    }

    public renderEach(predicate: IteratorPredicate<T, void>) {
        for (let i = 0; i < this.renderChildren.length; i++) {
            if (this.renderChildren[i].visible) {
                predicate(this.renderChildren[i], i, this.renderChildren);
            }
        }
        return this;
    }

    public renderFilter(predicate: IteratorPredicate<T, boolean>) {
        return $util.filterArray(this.renderChildren, predicate);
    }

    public hide(invisible?: boolean) {
        this.rendered = true;
        this.visible = false;
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
                        this._cached.actualWidth = undefined;
                    case 'minWidth':
                        this._cached.hasWidth = undefined;
                        break;
                    case 'height':
                        this._cached.actualHeight = undefined;
                    case 'minHeight':
                        this._cached.hasHeight = undefined;
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

    public ascend(generated = false, condition?: (item: T) => boolean, parent?: T) {
        const result: T[] = [];
        const attr = generated ? (this.renderParent ? 'renderParent' : 'parent') : 'actualParent';
        let current: UndefNull<T> = this[attr];
        while (current && current.id !== 0 && !result.includes(current)) {
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

    public cascade(predicate?: (item: T) => boolean, element = false) {
        const result = super.cascade(predicate);
        return element ? $util.spliceArray(result, node => node.element === null) : result;
    }

    public inherit(node: T, ...modules: string[]) {
        const initial = <InitialData<T>> node.unsafe('initial');
        for (const name of modules) {
            switch (name) {
                case 'initial':
                    $util.cloneObject(initial, this._initial);
                    break;
                case 'base':
                    this._documentParent = node.documentParent;
                    this._bounds = $dom.assignRect(node.bounds);
                    this._linear = $dom.assignRect(node.linear);
                    this._box = $dom.assignRect(node.box);
                    const actualParent = node.actualParent;
                    if (actualParent) {
                        this.dir = actualParent.dir;
                    }
                    break;
                case 'alignment':
                    for (const attr of INHERIT_ALIGNMENT) {
                        this._styleMap[attr] = node.css(attr);
                        this._initial.styleMap[attr] = initial.styleMap[attr];
                    }
                    if (!this.positionStatic) {
                        for (const attr of $css.BOX_POSITION) {
                            this._styleMap[attr] = node.css(attr);
                            this._initial.styleMap[attr] = initial.styleMap[attr];
                        }
                    }
                    if (node.autoMargin.horizontal || node.autoMargin.vertical) {
                        for (const attr of $css.BOX_MARGIN) {
                            if (node.cssInitial(attr, true) === 'auto') {
                                this._styleMap[attr] = 'auto';
                            }
                            if (node.cssInitial(attr) === 'auto') {
                                this._initial.styleMap[attr] = 'auto';
                            }
                        }
                    }
                    break;
                case 'styleMap':
                    $util.assignEmptyProperty(this._styleMap, node.unsafe('styleMap'));
                    break;
                case 'textStyle':
                    this.cssApply({
                        fontFamily: node.css('fontFamily'),
                        fontSize: node.css('fontSize'),
                        fontWeight: node.css('fontWeight'),
                        color: node.css('color'),
                        whiteSpace: node.css('whiteSpace'),
                        textTransform: node.css('textTransform'),
                        opacity: node.css('opacity')
                    });
                    break;
            }
        }
    }

    public alignedVertically(previousSiblings: T[], siblings?: T[], cleared?: Map<T, string>, horizontal?: boolean) {
        const actualParent = this.actualParent;
        if (this.lineBreak || !actualParent) {
            return true;
        }
        else if (this.pageFlow && previousSiblings.length) {
            if ($util.isArray(siblings) && this !== siblings[0]) {
                const previous = siblings[siblings.length - 1];
                if (cleared && cleared.has(this)) {
                    return true;
                }
                else if (this.floating && previous.floating) {
                    if (this.linear.top >= Math.floor(previous.linear.bottom) || this.float === 'left' && siblings.find(node => node.siblingIndex < this.siblingIndex && $util.withinRange(this.linear.left, node.linear.left)) !== undefined || this.float === 'right' && siblings.find(node => node.siblingIndex < this.siblingIndex && $util.withinRange(this.linear.right, node.linear.right)) !== undefined) {
                        return true;
                    }
                }
                else if (horizontal && this.blockStatic) {
                    const floated = siblings.find(item => item.floating);
                    if (floated) {
                        let { top, bottom } = this.linear;
                        if (this.textElement && !this.plainText) {
                            const rect = $session.getRangeClientRect(<Element> this._element, this.sessionId);
                            if (rect.top > top) {
                                top = rect.top;
                            }
                            if (rect.bottom > bottom) {
                                bottom = rect.bottom;
                            }
                        }
                        return !$util.withinRange(top, floated.linear.top) && bottom > floated.linear.bottom;
                    }
                }
            }
            for (const previous of previousSiblings) {
                if ((this.blockStatic || this.display === 'table') && (!previous.floating || previous.float !== 'right' && $util.withinRange(previous.linear.right, actualParent.box.right) || cleared && cleared.has(previous)) ||
                    previous.blockStatic ||
                    previous.lineBreak ||
                    previous.autoMargin.leftRight ||
                    previous.float === 'left' && this.autoMargin.right ||
                    previous.float === 'right' && this.autoMargin.left ||
                    cleared && cleared.get(previous) === 'both' && (!$util.isArray(siblings) || siblings[0] !== previous))
                {
                    return true;
                }
                if (this.blockDimension) {
                    const previousBottom = $util.isArray(siblings) && this.linear.top >= Math.floor(siblings[siblings.length - 1].linear.bottom);
                    if (previousBottom && (!previous.floating || this.has('width', CSS_STANDARD.PERCENT)) || this.css('width') === '100%' && !this.has('maxWidth')) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    public intersectX(rect: RectDimension, dimension = 'linear') {
        const self: RectDimension = this[dimension];
        return (
            rect.left >= self.left && rect.left < self.right ||
            rect.right > self.left && rect.right <= self.right ||
            self.left >= rect.left && self.right <= rect.right ||
            rect.left >= self.left && rect.right <= self.right
        );
    }

    public intersectY(rect: RectDimension, dimension = 'linear') {
        const self: RectDimension = this[dimension];
        return (
            rect.top >= self.top && rect.top < self.bottom ||
            rect.bottom > self.top && rect.bottom <= self.bottom ||
            self.top >= rect.top && self.bottom <= rect.bottom ||
            rect.top >= self.top && rect.bottom <= self.bottom
        );
    }

    public withinX(rect: RectDimension, dimension = 'linear') {
        const self: RectDimension = this[dimension];
        return Math.ceil(self.left) >= Math.floor(rect.left) && Math.floor(self.right) <= Math.ceil(rect.right);
    }

    public withinY(rect: RectDimension, dimension = 'linear') {
        const self: RectDimension = this[dimension];
        return Math.ceil(self.top) >= Math.floor(rect.top) && Math.floor(self.bottom) <= Math.ceil(rect.bottom);
    }

    public outsideX(rect: RectDimension, dimension = 'linear') {
        const self: RectDimension = this[dimension];
        return Math.ceil(self.left) < Math.floor(rect.left) || Math.floor(self.right) > Math.ceil(rect.right);
    }

    public outsideY(rect: RectDimension, dimension = 'linear') {
        const self: RectDimension = this[dimension];
        return Math.ceil(self.top) < Math.floor(rect.top) || Math.floor(self.bottom) > Math.ceil(rect.bottom);
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

    public cssAscend(attr: string, startChild = false, visible = false) {
        let value = '';
        let current = startChild ? this : this.actualParent;
        while (current) {
            value = current.cssInitial(attr);
            if (value !== '') {
                if (visible && !current.visible) {
                    value = '';
                }
                else {
                    break;
                }
            }
            if (current.documentBody) {
                break;
            }
            current = current.actualParent;
        }
        return value;
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
        if (current && $util.isLength(current)) {
            value += $util.parseUnit(current, this.fontSize);
            if (!negative && value < 0) {
                value = 0;
            }
            const length = $util.formatPX(value);
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
            const target = this.pseudoElement ? $session.getElementCache(element, 'pseudoType', this.sessionId) : '';
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
            let current = this.css(attr);
            if (value === current) {
                current = element.style[attr];
            }
            element.style[attr] = value;
            if (element.style[attr] === value) {
                $session.setElementCache(element, attr, this.sessionId, current);
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
                element.style[attr] = value;
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

    public parseUnit(value: string, horizontal = true, parent = true) {
        if (value !== '') {
            if ($util.isPercent(value)) {
                const attr = horizontal ? 'width' : 'height';
                let result = parseFloat(value) / 100;
                if (parent) {
                    const absoluteParent = this.absoluteParent;
                    if (absoluteParent) {
                        if (absoluteParent.has(attr, CSS_STANDARD.LENGTH)) {
                            result *= horizontal ? absoluteParent.toFloat('width') : absoluteParent.toFloat('height');
                        }
                        else {
                            result *= absoluteParent.box[attr];
                        }
                        return result;
                    }
                }
                return result * (this.has(attr, CSS_STANDARD.LENGTH) ? this.toFloat(attr) : this.bounds[attr]);
            }
            return $util.parseUnit(value, this.fontSize);
        }
        return 0;
    }

    public convertPX(value: string, horizontal = true, parent = true) {
        return `${Math.round(this.parseUnit(value, horizontal, parent))}px`;
    }

    public has(attr: string, checkType: number = 0, options?: ObjectMap<string | string[] | boolean>): boolean {
        const value = (options && options.map === 'initial' ? this._initial.styleMap : this._styleMap)[attr];
        if (value) {
            switch (value) {
                case '0px':
                    if ($util.hasBit(checkType, CSS_STANDARD.ZERO)) {
                        return true;
                    }
                    else {
                        switch (attr) {
                            case 'top':
                            case 'right':
                            case 'bottom':
                            case 'left':
                                return true;
                        }
                    }
                case 'left':
                    if ($util.hasBit(checkType, CSS_STANDARD.LEFT)) {
                        return true;
                    }
                case 'baseline':
                    if ($util.hasBit(checkType, CSS_STANDARD.BASELINE)) {
                        return true;
                    }
                case 'auto':
                    if ($util.hasBit(checkType, CSS_STANDARD.AUTO)) {
                        return true;
                    }
                case 'none':
                case 'initial':
                case 'unset':
                case 'normal':
                case 'transparent':
                case 'rgba(0, 0, 0, 0)':
                    return false;
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
                        if (options.all) {
                            return true;
                        }
                    }
                    if (checkType > 0) {
                        if ($util.hasBit(checkType, CSS_STANDARD.LENGTH) && $util.isLength(value)) {
                            return true;
                        }
                        if ($util.hasBit(checkType, CSS_STANDARD.PERCENT) && $util.isPercent(value)) {
                            return true;
                        }
                    }
                    return checkType === 0;
            }
        }
        return false;
    }

    public hasAlign(value: number) {
        return $util.hasBit(this.alignmentType, value);
    }

    public hasProcedure(value: number) {
        return !$util.hasBit(this.excludeProcedure, value);
    }

    public hasResource(value: number) {
        return !$util.hasBit(this.excludeResource, value);
    }

    public hasSection(value: number) {
        return !$util.hasBit(this.excludeSection, value);
    }

    public exclude({ section = 0, procedure = 0, resource = 0 }) {
        if (section > 0 && !$util.hasBit(this._excludeSection, section)) {
            this._excludeSection |= section;
        }
        if (procedure > 0 && !$util.hasBit(this._excludeProcedure, procedure)) {
            this._excludeProcedure |= procedure;
        }
        if (resource > 0 && !$util.hasBit(this._excludeResource, resource)) {
            this._excludeResource |= resource;
        }
    }

    public setExclusions() {
        if (this.styleElement) {
            const actualParent = this.actualParent;
            if (actualParent) {
                const applyExclusions = (attr: string, enumeration: {}) => {
                    let exclude = this.dataset[`exclude${attr}`] || '';
                    if (actualParent.dataset[`exclude${attr}Child`]) {
                        exclude += (exclude !== '' ? '|' : '') + actualParent.dataset[`exclude${attr}Child`];
                    }
                    if (exclude !== '') {
                        let offset = 0;
                        for (let name of exclude.split('|')) {
                            name = name.trim().toUpperCase();
                            if (enumeration[name] && !$util.hasBit(offset, enumeration[name])) {
                                offset |= enumeration[name];
                            }
                        }
                        if (offset > 0) {
                            this.exclude({ [attr.toLowerCase()]: offset });
                        }
                    }
                };
                applyExclusions('Section', APP_SECTION);
                applyExclusions('Procedure', NODE_PROCEDURE);
                applyExclusions('Resource', NODE_RESOURCE);
            }
        }
    }

    public setBounds(cache = true) {
        if (this.styleElement) {
            this._bounds = $dom.assignRect($session.getClientRect(<Element> this._element, this.sessionId, cache));
            if (this.documentBody) {
                let marginTop = this.marginTop;
                if (marginTop > 0) {
                    const firstChild = this.firstChild;
                    if (firstChild && firstChild.blockStatic && !firstChild.lineBreak && firstChild.marginTop >= marginTop) {
                        marginTop = 0;
                    }
                }
                this._bounds.top = marginTop;
            }
        }
        else if (this.plainText) {
            const rect = $session.getRangeClientRect(<Element> this._element, this.sessionId, cache);
            this._bounds = $dom.assignRect(rect);
            this._cached.multiline = rect.multiline > 0;
        }
    }

    public setInlineText(value: boolean, overwrite = false) {
        if (overwrite) {
            this._inlineText = value;
        }
        else if (this.htmlElement && !this.svgElement) {
            const element = <Element> this._element;
            switch (element.tagName) {
                case 'INPUT':
                case 'IMG':
                case 'SELECT':
                case 'TEXTAREA':
                case 'HR':
                case 'SVG':
                    break;
                default:
                    this._inlineText = value;
            }
        }
    }

    public appendTry(node: T, replacement: T, append = true) {
        let valid = false;
        for (let i = 0; i < this.length; i++) {
            if (this.children[i] === node) {
                this.children[i] = replacement;
                replacement.parent = this;
                replacement.innerChild = node;
                valid = true;
                break;
            }
        }
        if (append) {
            replacement.parent = this;
            valid = true;
        }
        return valid;
    }

    public modifyBox(region: number, offset: number | null, negative = true) {
        if (offset !== 0) {
            const attr = CSS_SPACING.get(region);
            if (attr) {
                if (offset === null) {
                    this._boxReset[attr] = 1;
                }
                else if (!negative) {
                    if (this[attr] + this._boxAdjustment[attr] + offset <= 0) {
                        this._boxReset[attr] = 1;
                        this._boxAdjustment[attr] = 0;
                    }
                    else {
                        this._boxAdjustment[attr] += offset;
                    }
                }
                else {
                    this._boxAdjustment[attr] += offset;
                }
            }
        }
    }

    public valueBox(region: number): [number, number] {
        const attr = CSS_SPACING.get(region);
        return attr ? [this._boxReset[attr], this._boxAdjustment[attr]] : [0, 0];
    }

    public resetBox(region: number, node?: T, fromParent = false) {
        const applyReset = (attrs: string[], start: number) => {
            for (let i = 0; i < attrs.length; i++) {
                if (this._boxReset[attrs[i]] !== 1) {
                    this._boxReset[attrs[i]] = 1;
                    const attr = CSS_SPACING.get(CSS_SPACING_KEYS[i + start]) as string;
                    const value = this[attr];
                    if (node && value !== 0) {
                        if (!node.naturalElement && node[attr] === 0) {
                            node.css(attr, $util.formatPX(value), true);
                        }
                        else {
                            node.modifyBox(CSS_SPACING_KEYS[i + (fromParent ? 0 : 4)], value);
                        }
                    }
                }
            }
        };
        if ($util.hasBit(region, BOX_STANDARD.MARGIN)) {
            applyReset($css.BOX_MARGIN, 0);
        }
        if ($util.hasBit(region, BOX_STANDARD.PADDING)) {
            applyReset($css.BOX_PADDING, 4);
        }
    }

    public inheritBox(region: number, node: T) {
        const applyReset = (attrs: string[], start: number) => {
            for (let i = 0; i < attrs.length; i++) {
                const value: number = this._boxAdjustment[attrs[i]];
                if (value > 0) {
                    node.modifyBox(CSS_SPACING_KEYS[i + start], value, false);
                    this._boxAdjustment[attrs[i]] = 0;
                }
            }
        };
        if ($util.hasBit(region, BOX_STANDARD.MARGIN)) {
            applyReset($css.BOX_MARGIN, 0);
        }
        if ($util.hasBit(region, BOX_STANDARD.PADDING)) {
            applyReset($css.BOX_PADDING, 4);
        }
    }

    public previousSiblings(options: SiblingDirection = {}) {
        const { floating, pageFlow, lineBreak, excluded } = options;
        const result: T[] = [];
        let element: Element | null = null;
        if (this._element) {
            element = <Element> this._element.previousSibling;
        }
        else if (this.actualChildren.length) {
            const children = $util.filterArray(this.actualChildren, node => node.pageFlow);
            element = children.length && children[0].element ? <Element> children[0].element.previousSibling : null;
        }
        while (element) {
            const node = $session.getElementAsNode<T>(element, this.sessionId);
            if (node && node.naturalElement) {
                if (lineBreak !== false && node.lineBreak || excluded !== false && node.excluded) {
                    result.push(node);
                }
                else if (!node.excluded && node.pageFlow) {
                    if (pageFlow === false) {
                        break;
                    }
                    result.push(node);
                    if (floating !== false || !node.floating && (node.visible || node.rendered)) {
                        break;
                    }
                }
            }
            element = <Element> element.previousSibling;
        }
        return result;
    }

    public nextSiblings(options: SiblingDirection = {}) {
        const { floating, pageFlow, lineBreak, excluded } = options;
        const result: T[] = [];
        let element: Element | null = null;
        if (this._element) {
            element = <Element> this._element.nextSibling;
        }
        else if (this.actualChildren.length) {
            const children = $util.filterArray(this.actualChildren, node => node.pageFlow);
            if (children.length) {
                const lastChild = children[children.length - 1];
                element = lastChild.element && lastChild.element.nextSibling as Element;
            }
        }
        while (element) {
            const node = $session.getElementAsNode<T>(element, this.sessionId);
            if (node && node.naturalElement) {
                if (lineBreak !== false && node.lineBreak || excluded !== false && node.excluded) {
                    result.push(node);
                }
                else if (!node.excluded && node.pageFlow) {
                    if (pageFlow === false) {
                        break;
                    }
                    result.push(node);
                    if (floating !== false || !node.floating && (node.visible || node.rendered)) {
                        break;
                    }
                }
            }
            element = <Element> element.nextSibling;
        }
        return result;
    }

    public getFirstChildElement(options: SiblingDirection = {}) {
        const { lineBreak, excluded } = options;
        if (this.htmlElement) {
            for (const node of this.actualChildren) {
                if (!node.pseudoElement && (!node.excluded || lineBreak !== false && node.lineBreak || excluded !== false && node.excluded)) {
                    return node.element;
                }
            }
        }
        return null;
    }

    public getLastChildElement(options: SiblingDirection = {}) {
        const { lineBreak, excluded } = options;
        if (this.htmlElement) {
            const children = this.actualChildren;
            for (let i = children.length - 1; i >= 0; i--) {
                const node = children[i];
                if (!node.pseudoElement && (!node.excluded || lineBreak !== false && node.lineBreak || excluded !== false && node.excluded)) {
                    return node.element;
                }
            }
        }
        return null;
    }

    public actualRect(direction: string, dimension = 'linear') {
        let node: T;
        switch (direction) {
            case 'top':
            case 'left':
                node = this.companion && !this.companion.visible && this.companion[dimension][direction] < this[dimension][direction] ? this.companion : this;
                break;
            case 'right':
            case 'bottom':
                node = this.companion && !this.companion.visible && this.companion[dimension][direction] > this[dimension][direction] ? this.companion : this;
                break;
            default:
                return NaN;
        }
        return node[dimension][direction] as number;
    }

    private setDimensions(dimension: string) {
        const bounds: RectDimension = this.unsafe(dimension);
        if (bounds) {
            bounds.width = this.bounds.width;
            bounds.height = bounds.bottom - bounds.top;
            if (this.styleElement) {
                switch (dimension) {
                    case 'linear':
                        bounds.width += (this.marginLeft > 0 ? this.marginLeft : 0) + this.marginRight;
                        break;
                    case 'box':
                        bounds.width -= this.contentBoxWidth;
                        break;
                }
            }
            if (this._initial[dimension] === undefined) {
                this._initial[dimension] = $dom.assignRect(bounds);
            }
        }
    }

    private getDimension(value: string, horizontal = true) {
        if ($util.isLength(value) || $util.isPercent(value)) {
            return this.parseUnit(value, horizontal);
        }
        return 0;
    }

    private convertPosition(attr: string) {
        let value = 0;
        if (!this.positionStatic) {
            const unit = this.cssInitial(attr, true);
            if ($util.isLength(unit) || $util.isPercent(unit)) {
                value = $util.convertFloat(this.convertLength(attr, unit, attr === 'left' || attr === 'right'));
            }
        }
        return value;
    }

    private convertBox(region: string, direction: string) {
        const attr = region + direction;
        return $util.convertFloat(this.convertLength(attr, this.css(attr), direction === 'Left' || direction === 'Right'));
    }

    private convertLength(attr: string, value: string, horizontal: boolean, parent = true): string {
        if ($util.isPercent(value)) {
            return $util.isLength(this.style[attr]) ? this.style[attr] : this.convertPX(value, horizontal, parent);
        }
        return value;
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

    set tagName(value) {
        this._cached.tagName = value.toUpperCase();
    }
    get tagName() {
        if (this._cached.tagName === undefined) {
            const element = <HTMLInputElement> this._element;
            let value = '';
            if (element) {
                if (element.nodeName === '#text') {
                    value = 'PLAINTEXT';
                }
                else if (element.tagName === 'INPUT') {
                    value = element.type;
                }
                else {
                    value = element.tagName;
                }
            }
            this._cached.tagName = value.toUpperCase();
        }
        return this._cached.tagName;
    }

    get element() {
        if (!this.naturalElement && this.innerChild) {
            const element: Element | null = this.innerChild.unsafe('element');
            if (element) {
                return element;
            }
        }
        return this._element;
    }

    get elementId() {
        return this._element ? this._element.id : '';
    }

    get htmlElement() {
        if (this._cached.htmlElement === undefined) {
            this._cached.htmlElement = this._element !== null && !this.plainText && !this.svgElement;
        }
        return this._cached.htmlElement;
    }

    get svgElement() {
        return this._element !== null && this._element.tagName === 'svg';
    }

    get styleElement() {
        return this.htmlElement || this.svgElement;
    }

    get naturalElement() {
        return this._element !== null && this._element.className !== '__squared.placeholder';
    }

    get pseudoElement() {
        return this._element !== null && this._element.className === '__squared.pseudo';
    }

    get imageElement() {
        return this.tagName === 'IMG';
    }

    get flexElement() {
        return this.display === 'flex' || this.display === 'inline-flex';
    }

    get gridElement() {
        return this.display === 'grid';
    }

    get textElement() {
        return this.plainText || this.inlineText && !this.inputElement;
    }

    get tableElement() {
        return this.tagName === 'TABLE' || this.display === 'table';
    }

    get inputElement() {
        return this._element !== null && this._element.tagName === 'INPUT' || this.tagName === 'BUTTON';
    }

    get layoutElement() {
        return this.flexElement || this.gridElement;
    }

    get groupParent() {
        return false;
    }

    get plainText() {
        return this.tagName === 'PLAINTEXT';
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
        return this._bounds || $dom.newRectDimension();
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
            this.setDimensions('linear');
        }
        return this._linear || $dom.newRectDimension();
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
            this.setDimensions('box');
        }
        return this._box || $dom.newRectDimension();
    }

    set renderAs(value) {
        if (!this.rendered && value && !value.rendered) {
            this._renderAs = value;
        }
    }
    get renderAs() {
        return this._renderAs;
    }

    get dataset(): DOMStringMap {
        return this.htmlElement ? (<HTMLElement> this._element).dataset : {};
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

    get extensions() {
        if (this._cached.extensions === undefined) {
            this._cached.extensions = this.dataset.use ? $util.spliceArray(this.dataset.use.split(/\s*,\s*/), value => value === '') : [];
        }
        return this._cached.extensions;
    }

    set flexbox(value) {
        this._cached.flexbox = value;
    }
    get flexbox() {
        if (this._cached.flexbox === undefined) {
            const actualParent = this.actualParent;
            const getFlexValue = (attr: string, initialValue: number, parent?: Node): number => {
                const value = (parent || this).css(attr);
                if ($util.isNumber(value)) {
                    return parseFloat(value);
                }
                else if (value === 'inherit' && actualParent && parent === undefined) {
                    return getFlexValue(attr, initialValue, actualParent);
                }
                return initialValue;
            };
            const alignSelf = this.css('alignSelf');
            const justifySelf = this.css('justifySelf');
            this._cached.flexbox = {
                alignSelf: alignSelf === 'auto' && actualParent && actualParent.has('alignItems', CSS_STANDARD.BASELINE, { all: true }) ? actualParent.css('alignItems') : alignSelf,
                justifySelf: justifySelf === 'auto' && actualParent && actualParent.has('justifyItems') ? actualParent.css('justifyItems') : justifySelf,
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
            this._cached.width = Math.max(this.getDimension(this._styleMap.width), this.getDimension(this._styleMap.minWidth));
        }
        return this._cached.width;
    }
    get height() {
        if (this._cached.height === undefined) {
            this._cached.height = Math.max(this.getDimension(this._styleMap.height, false), this.getDimension(this._styleMap.minHeight, false));
        }
        return this._cached.height;
    }

    get hasWidth() {
        if (this._cached.hasWidth === undefined) {
            const value = this.cssInitial('width', true);
            if (this.inlineStatic) {
                this._cached.hasWidth = false;
            }
            else if ($util.isPercent(value)) {
                this._cached.hasWidth = parseFloat(value) > 0;
            }
            else {
                this._cached.hasWidth = $util.isLength(value) && value !== '0px' || this.toInt('minWidth') > 0;
            }
        }
        return this._cached.hasWidth;
    }
    get hasHeight() {
        if (this._cached.hasHeight === undefined) {
            const value = this.cssInitial('height', true);
            this._cached.hasHeight = (() => {
                if (this.inlineStatic) {
                    return false;
                }
                else if ($util.isPercent(value)) {
                    const actualParent = this.actualParent;
                    if (actualParent && actualParent.hasHeight) {
                        return parseFloat(value) > 0;
                    }
                }
                else if ($util.isLength(value) && value !== '0px' || this.toFloat('minHeight') > 0) {
                    return true;
                }
                return false;
            })();
        }
        return this._cached.hasHeight;
    }

    get lineHeight() {
        if (this._cached.lineHeight === undefined) {
            if (!this.imageElement && !this.svgElement) {
                let hasOwnStyle = this.has('lineHeight');
                let lineHeight = 0;
                if (hasOwnStyle) {
                    lineHeight = this.toFloat('lineHeight');
                }
                else if (this.naturalElement) {
                    lineHeight = $util.convertFloat(this.cssAscend('lineHeight', true));
                    if (!this.plainText) {
                        const element = <Element> (this.styleElement ? this._element : this.documentParent.element);
                        const fontSize: string | undefined = $session.getElementCache(element, 'fontSize', this.cssSpecificity('fontSize').toString());
                        if (fontSize && fontSize.endsWith('em')) {
                            const emSize = parseFloat(fontSize);
                            if (emSize < 1) {
                                lineHeight *= emSize;
                                this.css('lineHeight', $util.formatPX(lineHeight));
                                hasOwnStyle = true;
                            }
                        }
                    }
                }
                this._cached.lineHeight = hasOwnStyle || lineHeight > this.actualHeight || this.multiline || this.block && this.actualChildren.some(node => node.textElement) ? lineHeight : 0;
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

    get position() {
        return this.css('position');
    }

    set positionStatic(value) {
        this._cached.positionStatic = value;
        this.unsetCache('pageFlow');
    }
    get positionStatic() {
        if (this._cached.positionStatic === undefined) {
            switch (this.position) {
                case 'fixed':
                case 'absolute':
                    this._cached.positionStatic = false;
                    break;
                case 'sticky':
                case 'relative':
                    this._cached.positionStatic = this.toInt('top') === 0 && this.toInt('right') === 0 && this.toInt('bottom') === 0 && this.toInt('left') === 0;
                    break;
                case 'inherit':
                    const position = this._element ? $css.getInheritedStyle(this._element.parentElement, 'position') : '';
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
            const value = this.position;
            this._cached.positionRelative = value === 'relative' || value === 'sticky';
        }
        return this._cached.positionRelative;
    }

    get positionAuto() {
        if (this._cached.positionAuto === undefined) {
            const styleMap = this._initial.iteration === -1 ? this._styleMap : this._initial.styleMap;
            this._cached.positionAuto = !this.pageFlow && (
                (styleMap.top === 'auto' || !styleMap.top) &&
                (styleMap.right === 'auto' || !styleMap.right) &&
                (styleMap.bottom === 'auto' || !styleMap.bottom) &&
                (styleMap.left === 'auto' || !styleMap.left)
            );
        }
        return this._cached.positionAuto;
    }

    get top() {
        if (this._cached.top === undefined) {
            this._cached.top = this.convertPosition('top');
        }
        return this._cached.top;
    }
    get right() {
        if (this._cached.right === undefined) {
            this._cached.right = this.convertPosition('right');
        }
        return this._cached.right;
    }
    get bottom() {
        if (this._cached.bottom === undefined) {
            this._cached.bottom = this.convertPosition('bottom');
        }
        return this._cached.bottom;
    }
    get left() {
        if (this._cached.left === undefined) {
            this._cached.left = this.convertPosition('left');
        }
        return this._cached.left;
    }

    get marginTop() {
        if (this._cached.marginTop === undefined) {
            this._cached.marginTop = this.inlineStatic ? 0 : this.convertBox('margin', 'Top');
        }
        return this._cached.marginTop;
    }
    get marginRight() {
        if (this._cached.marginRight === undefined) {
            this._cached.marginRight = this.convertBox('margin', 'Right');
        }
        return this._cached.marginRight;
    }
    get marginBottom() {
        if (this._cached.marginBottom === undefined) {
            this._cached.marginBottom = this.inlineStatic || this.bounds.height === 0 && this.every(node => !node.pageFlow || node.floating && node.css('clear') === 'none') && this.css('overflow') !== 'hidden' ? 0 : this.convertBox('margin', 'Bottom');
        }
        return this._cached.marginBottom;
    }
    get marginLeft() {
        if (this._cached.marginLeft === undefined) {
            this._cached.marginLeft = this.convertBox('margin', 'Left');
        }
        return this._cached.marginLeft;
    }

    get borderTopWidth() {
        if (this._cached.borderTopWidth === undefined) {
            this._cached.borderTopWidth = this.styleElement && this.css('borderTopStyle') !== 'none' ? $util.convertFloat(this.css('borderTopWidth')) : 0;
        }
        return this._cached.borderTopWidth;
    }
    get borderRightWidth() {
        if (this._cached.borderRightWidth === undefined) {
            this._cached.borderRightWidth = this.styleElement && this.css('borderRightStyle') !== 'none' ? $util.convertFloat(this.css('borderRightWidth')) : 0;
        }
        return this._cached.borderRightWidth;
    }
    get borderBottomWidth() {
        if (this._cached.borderBottomWidth === undefined) {
            this._cached.borderBottomWidth = this.styleElement && this.css('borderBottomStyle') !== 'none' ? $util.convertFloat(this.css('borderBottomWidth')) : 0;
        }
        return this._cached.borderBottomWidth;
    }
    get borderLeftWidth() {
        if (this._cached.borderLeftWidth === undefined) {
            this._cached.borderLeftWidth = this.styleElement && this.css('borderLeftStyle') !== 'none' ? $util.convertFloat(this.css('borderLeftWidth')) : 0;
        }
        return this._cached.borderLeftWidth;
    }

    get paddingTop() {
        if (this._cached.paddingTop === undefined) {
            const value = this.convertBox('padding', 'Top');
            if (this.length && value > 0 && !this.layoutElement) {
                let top = 0;
                for (const node of this) {
                    if (node.inline) {
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
                this._cached.paddingTop = value;
            }
        }
        return this._cached.paddingTop;
    }
    get paddingRight() {
        if (this._cached.paddingRight === undefined) {
            this._cached.paddingRight = this.convertBox('padding', 'Right');
        }
        return this._cached.paddingRight;
    }
    get paddingBottom() {
        if (this._cached.paddingBottom === undefined) {
            const value = this.convertBox('padding', 'Bottom');
            if (this.length && value > 0 && !this.layoutElement) {
                let bottom = 0;
                for (const node of this) {
                    if (node.inline) {
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
                this._cached.paddingBottom = value;
            }
        }
        return this._cached.paddingBottom;
    }
    get paddingLeft() {
        if (this._cached.paddingLeft === undefined) {
            this._cached.paddingLeft = this.convertBox('padding', 'Left');
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
            this._cached.inlineStatic = this.inline && !this.floating && !this.imageElement;
        }
        return this._cached.inlineStatic;
    }

    get inlineVertical() {
        if (this._cached.inlineVertical === undefined) {
            const display = this.display;
            this._cached.inlineVertical = (display.startsWith('inline') || display === 'table-cell') && !this.floating && !this.plainText;
        }
        return this._cached.inlineVertical;
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
                default:
                    this._cached.block = false;
                    break;
            }
        }
        return this._cached.block;
    }

    get blockStatic() {
        if (this._cached.blockStatic === undefined) {
            this._cached.blockStatic = this.pageFlow && this.block && (!this.floating || this.cssInitial('width') === '100%' && !this.has('maxWidth')) || this.hasAlign(NODE_ALIGNMENT.BLOCK);
        }
        return this._cached.blockStatic;
    }

    get blockDimension() {
        if (this._cached.blockDimension === undefined) {
            const value = this.display;
            this._cached.blockDimension = this.block || value.startsWith('inline-') || value === 'table' || this.imageElement;
        }
        return this._cached.blockDimension;
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
            this._cached.centerAligned = this.autoMargin.leftRight || this.textElement && this.blockStatic && this.cssInitial('textAlign') === 'center';
        }
        return this._cached.centerAligned;
    }

    get rightAligned() {
        if (this._cached.rightAligned === undefined) {
            this._cached.rightAligned = this.float === 'right' || this.autoMargin.left || !this.pageFlow && this.has('right') || this.textElement && this.blockStatic && this.cssInitial('textAlign') === 'right';
        }
        return this._cached.rightAligned || this.hasAlign(NODE_ALIGNMENT.RIGHT);
    }

    get bottomAligned() {
        if (this._cached.bottomAligned === undefined) {
            this._cached.bottomAligned = !this.pageFlow && this.has('bottom') && this.bottom >= 0;
        }
        return this._cached.bottomAligned;
    }

    get horizontalAligned() {
        if (this._cached.horizontalAligned === undefined) {
            this._cached.horizontalAligned = !this.blockStatic && !this.autoMargin.horizontal && !(this.blockDimension && this.css('width') === '100%');
        }
        return this._cached.horizontalAligned;
    }

    get autoMargin() {
        if (this._cached.autoMargin === undefined) {
            if (!this.pageFlow || this.blockStatic || this.display === 'table') {
                const styleMap = this._initial.iteration === -1 ? this._styleMap : this._initial.styleMap;
                const left = styleMap.marginLeft === 'auto' && (this.pageFlow || this.has('right'));
                const right = styleMap.marginRight === 'auto' && (this.pageFlow || this.has('left'));
                const top = styleMap.marginTop === 'auto' && (this.pageFlow || this.has('bottom'));
                const bottom = styleMap.marginBottom === 'auto' && (this.pageFlow || this.has('top'));
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
                const value = this.css('float');
                this._cached.floating = value === 'left' || value === 'right';
            }
            else {
                this._cached.floating = false;
            }
        }
        return this._cached.floating;
    }

    get float() {
        if (this._cached.float === undefined) {
            this._cached.float = this.floating ? this.css('float') : 'none';
        }
        return this._cached.float;
    }

    get zIndex() {
        return this.toInt('zIndex');
    }

    set textContent(value) {
        this._cached.textContent = value;
    }
    get textContent() {
        if (this._cached.textContent === undefined) {
            this._cached.textContent = (this.htmlElement || this.plainText) && (<HTMLElement> this._element).textContent || '';
        }
        return this._cached.textContent;
    }

    get textEmpty() {
        return this.inlineText && (this.textContent === '' || !this.preserveWhiteSpace && this.textContent.trim() === '');
    }

    get src() {
        const element = <HTMLInputElement> this._element;
        if (element && (this.imageElement || element.type === 'image')) {
            return element.src;
        }
        return '';
    }

    set overflow(value) {
        if (value === 0 || value === NODE_ALIGNMENT.VERTICAL || value === NODE_ALIGNMENT.HORIZONTAL || value === (NODE_ALIGNMENT.HORIZONTAL | NODE_ALIGNMENT.VERTICAL)) {
            this._cached.overflow = value;
        }
    }
    get overflow() {
        if (this._cached.overflow === undefined) {
            const element = this._element;
            const overflow = this.css('overflow');
            const overflowX = this.css('overflowX');
            const overflowY = this.css('overflowY');
            let value = 0;
            if (this.hasWidth && (overflow === 'scroll' || overflowX === 'scroll' || overflowX === 'auto' && element && element.clientWidth !== element.scrollWidth)) {
                value |= NODE_ALIGNMENT.HORIZONTAL;
            }
            if (this.hasHeight && (overflow === 'scroll' || overflowY === 'scroll' || overflowY === 'auto' && element && element.clientHeight !== element.scrollHeight)) {
                value |= NODE_ALIGNMENT.VERTICAL;
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

    set baseline(value) {
        this._cached.baseline = value;
    }
    get baseline() {
        if (this._cached.baseline === undefined) {
            const value = this.verticalAlign;
            const initialValue = this.cssInitial('verticalAlign');
            this._cached.baseline = this.pageFlow && !this.floating && !this.svgElement && (value === 'baseline' || value === 'initial' || $util.isLength(initialValue) && parseInt(initialValue) === 0);
        }
        return this._cached.baseline;
    }

    get verticalAlign() {
        if (this._cached.verticalAlign === undefined) {
            let value = this.css('verticalAlign');
            if ($util.isPercent(value)) {
                value = $util.formatPX(parseInt(value) / 100 * this.bounds.height);
            }
            this._cached.verticalAlign = value;
        }
        return this._cached.verticalAlign;
    }

    set multiline(value) {
        this._cached.multiline = value;
    }
    get multiline() {
        if (this._cached.multiline === undefined) {
            this._cached.multiline = this.plainText || this.inlineText && (this.inlineFlow || this.length === 0) ? $session.getRangeClientRect(<Element> this._element, this.sessionId).multiline > 0 : false;
        }
        return this._cached.multiline;
    }

    get positiveAxis() {
        if (this._cached.positiveAxis === undefined) {
            this._cached.positiveAxis = (!this.positionRelative || this.positionRelative && this.top >= 0 && this.left >= 0 && (this.right <= 0 || this.has('left')) && (this.bottom <= 0 || this.has('top'))) && this.marginTop >= 0 && this.marginLeft >= 0 && this.marginRight >= 0;
        }
        return this._cached.positiveAxis;
    }

    get leftTopAxis() {
        return this.absoluteParent === this.documentParent || this.position === 'fixed';
    }

    set renderExclude(value) {
        this._cached.renderExclude = value;
    }
    get renderExclude() {
        if (this._cached.renderExclude === undefined) {
            this._cached.renderExclude = (
                this.pseudoElement && this.css('content') === '""' && this.contentBoxWidth === 0 && this.contentBoxHeight === 0 ||
                this.bounds.height === 0 && (this.marginTop < 0 || this.marginBottom < 0)
            );
        }
        return this._cached.renderExclude;
    }

    get visibleStyle() {
        if (this._cached.visibleStyle === undefined) {
            const borderWidth = this.borderTopWidth > 0 || this.borderRightWidth > 0 || this.borderBottomWidth > 0 || this.borderLeftWidth > 0;
            const backgroundImage = $util.REGEXP_COMPILED.URL.test(this.css('backgroundImage')) || $util.REGEXP_COMPILED.URL.test(this.css('background'));
            const backgroundColor = this.has('backgroundColor');
            this._cached.visibleStyle = {
                padding: this.paddingTop > 0 || this.paddingRight > 0 || this.paddingBottom > 0 || this.paddingLeft > 0,
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
        if (this._cached.preserveWhiteSpace === undefined) {
            const value = this.css('whiteSpace');
            this._cached.preserveWhiteSpace = value === 'pre' || value === 'pre-wrap';
        }
        return this._cached.preserveWhiteSpace;
    }

    get layoutHorizontal() {
        return this.hasAlign(NODE_ALIGNMENT.HORIZONTAL);
    }
    get layoutVertical() {
        return this.hasAlign(NODE_ALIGNMENT.VERTICAL);
    }

    set controlName(value) {
        if (!this.rendered || this._controlName === undefined) {
            this._controlName = value;
        }
    }
    get controlName() {
        return this._controlName || '';
    }

    set documentParent(value) {
        this._documentParent = value;
    }
    get documentParent() {
        return this._documentParent || this.actualParent || this.parent || this;
    }

    get absoluteParent() {
        if (this._cached.absoluteParent === undefined) {
            let current = this.actualParent;
            if (!this.pageFlow) {
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

    get actualParent() {
        if (this._cached.actualParent === undefined) {
            this._cached.actualParent = this._element && this._element.parentElement && $session.getElementAsNode<T>(this._element.parentElement, this.sessionId) || null;
        }
        return this._cached.actualParent;
    }

    set actualChildren(value) {
        this._cached.actualChildren = value;
    }

    get actualChildren() {
        if (this._cached.actualChildren === undefined) {
            if (this.htmlElement && this.naturalElement) {
                const actualChildren: T[] = [];
                (<HTMLElement> this._element).childNodes.forEach((element: Element) => {
                    const node = $session.getElementAsNode<T>(element, this.sessionId);
                    if (node && node.naturalElement) {
                        actualChildren.push(node);
                    }
                });
                this._cached.actualChildren = actualChildren;
            }
            else {
                this._cached.actualChildren = this._initial.children;
            }
        }
        return this._cached.actualChildren;
    }

    get actualWidth() {
        if (this._cached.actualWidth === undefined) {
            if (this.plainText) {
                this._cached.actualWidth = this.bounds.right - this.bounds.left;
            }
            else if (!this.documentParent.flexElement && this.display !== 'table-cell') {
                let width = this.parseUnit(this.cssInitial('width', true));
                if (width > 0) {
                    const maxWidth = this.parseUnit(this.css('maxWidth'));
                    if (maxWidth > 0) {
                        width = Math.min(width, maxWidth);
                    }
                    if (this.contentBox && !this.documentParent.gridElement && !this.tableElement) {
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
            if (this.plainText) {
                this._cached.actualHeight = this.bounds.bottom - this.bounds.top;
            }
            else if (!this.documentParent.flexElement && this.display !== 'table-cell') {
                let height = this.parseUnit(this.cssInitial('height', true), false);
                if (height > 0) {
                    const maxHeight = this.parseUnit(this.css('maxHeight'));
                    if (maxHeight > 0) {
                        height = Math.min(height, maxHeight);
                    }
                    if (this.contentBox && !this.documentParent.gridElement && !this.tableElement) {
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
        if (this.actualChildren.length) {
            return this.actualChildren[0];
        }
        return null;
    }

    get lastChild() {
        if (this.actualChildren.length) {
            return this.actualChildren[this.actualChildren.length - 1];
        }
        return null;
    }

    get singleChild() {
        if (this.renderParent) {
            return this.renderParent.length === 1;
        }
        else if (this.parent && this.parent.id !== 0) {
            return this.parent.length === 1;
        }
        return false;
    }

    get previousSibling() {
        if (this._cached.previousSibling === undefined) {
            if (this.naturalElement) {
                let element = <Element> (this._element as Element).previousSibling;
                while (element) {
                    const node = $session.getElementAsNode<Node>(element, this.sessionId);
                    if (node && node.naturalElement && !node.pseudoElement && (!node.excluded || node.lineBreak)) {
                        this._cached.previousSibling = node;
                        return node;
                    }
                    element = <Element> element.previousSibling;
                }
            }
            this._cached.previousSibling = null;
        }
        return this._cached.previousSibling;
    }

    get nextSibling() {
        if (this._cached.nextSibling === undefined) {
            if (this.naturalElement) {
                let element = <Element> (this._element as Element).nextSibling;
                while (element) {
                    const node =  $session.getElementAsNode<Node>(element, this.sessionId);
                    if (node && node.naturalElement && !node.pseudoElement && (!node.excluded || node.lineBreak)) {
                        this._cached.nextSibling = node;
                        return node;
                    }
                    element = <Element> element.nextSibling;
                }
            }
            this._cached.nextSibling = null;
        }
        return this._cached.nextSibling;
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

    get nodes() {
        return this.rendered ? this.renderChildren : this.children;
    }

    get center(): Point {
        return {
            x: this.bounds.left + Math.floor(this.bounds.width / 2),
            y: this.bounds.top + Math.floor(this.actualHeight / 2)
        };
    }
}