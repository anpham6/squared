import { NodeTemplate } from './@types/application';
import { CachedValue, Support } from './@types/node';

import Node from './node';
import NodeList from './nodelist';
import Extension from './extension';

import { CSS_SPACING } from './lib/constant';
import { APP_SECTION, BOX_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE } from './lib/enumeration';

type T = NodeUI;

const $const = squared.lib.constant;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $math = squared.lib.math;
const $util = squared.lib.util;

const CSS_SPACING_KEYS = Array.from(CSS_SPACING.keys());

export default abstract class NodeUI extends Node implements squared.base.NodeUI {
    public static outerRegion(node: T): BoxRect {
        let top = node.item(0) as T;
        let right = top;
        let bottom = top;
        let left = top;
        node.each((item: T, index) => {
            if (index > 0) {
                if (item.actualRect($const.CSS.TOP) < top.actualRect($const.CSS.TOP)) {
                    top = item;
                }
                if (item.actualRect($const.CSS.RIGHT) > right.actualRect($const.CSS.RIGHT)) {
                    right = item;
                }
                if (item.actualRect($const.CSS.BOTTOM) > bottom.actualRect($const.CSS.BOTTOM)) {
                    bottom = item;
                }
                if (item.actualRect($const.CSS.LEFT) < left.actualRect($const.CSS.LEFT)) {
                    left = item;
                }
            }
        });
        return {
            top: top.linear.top,
            right: right.linear.right,
            bottom: bottom.linear.bottom,
            left: left.linear.left
        };
    }

    public static actualParent(list: T[]): T | null {
        for (const node of list) {
            if (node.naturalElement) {
                if (node.actualParent) {
                    return node.actualParent as T;
                }
            }
            else {
                const innerWrapped = node.innerWrapped;
                if (innerWrapped && innerWrapped.naturalElement && innerWrapped.actualParent) {
                    return innerWrapped.actualParent as T;
                }
                else if (node.groupParent) {
                    const parent = NodeUI.actualParent(node.actualChildren as T[]);
                    if (parent) {
                        return parent as T;
                    }
                }
            }
        }
        return null;
    }

    public static baseline<T extends NodeUI>(list: T[], text = false) {
        list = $util.filterArray(list, item => {
            if ((item.baseline || $css.isLength(item.verticalAlign)) && (!text || item.textElement && item.naturalElement)) {
                return !item.floating && !item.baselineAltered && (item.naturalElement && item.length === 0 || !item.layoutVertical && item.every(child => child.baseline && !child.multiline));
            }
            return false;
        });
        if (list.length > 1) {
            list.sort((a, b) => {
                if (a.length && b.length === 0) {
                    return 1;
                }
                else if (b.length && a.length === 0) {
                    return -1;
                }
                let heightA = a.baselineHeight;
                let heightB = b.baselineHeight;
                if (a.marginTop !== 0) {
                    if (a.imageElement || heightA >= heightB || a.marginTop < 0) {
                        heightA += a.marginTop;
                    }
                    else {
                        return a.marginTop > ((heightB - heightA) / 2) ? -1 : 1;
                    }
                }
                if (b.marginTop !== 0) {
                    if (b.imageElement || heightB >= heightA || b.marginTop < 0) {
                        heightB += b.marginTop;
                    }
                    else {
                        return b.marginTop > ((heightA - heightB) / 2) ? 1 : -1;
                    }
                }
                if (!$math.isEqual(heightA, heightB)) {
                    return heightA > heightB ? -1 : 1;
                }
                else if (a.inputElement && b.inputElement && a.containerType !== b.containerType) {
                    return a.containerType > b.containerType ? -1 : 1;
                }
                else if (a.bounds.bottom > b.bounds.bottom) {
                    return -1;
                }
                else if (a.bounds.bottom < b.bounds.bottom) {
                    return 1;
                }
                return 0;
            });
        }
        return list.shift();
    }

    public static partitionRows(list: T[]) {
        const parent = this.actualParent(list);
        const children = parent ? parent.actualChildren as T[] : list;
        const cleared = NodeList.linearData(list as T[], true).cleared;
        const groupParent = $util.filterArray(list, node => node.groupParent);
        const result: T[][] = [];
        let row: T[] = [];
        function includes(node: T) {
            if (list.includes(node)) {
                return node;
            }
            let current = node.outerWrapper as T;
            while (current) {
                if (list.includes(current)) {
                    return current;
                }
                current = current.outerWrapper as T;
            }
            return undefined;
        }
        for (let i = 0; i < children.length; i++) {
            let node: T | undefined = children[i];
            let next = false;
            for (let j = 0; j < groupParent.length; j++) {
                const group = groupParent[j];
                if (group.contains(node) || group === node) {
                    if (row.length) {
                        result.push(row);
                    }
                    result.push([group]);
                    row = [];
                    groupParent.splice(j, 1);
                    next = true;
                    break;
                }
            }
            if (next) {
                continue;
            }
            if (i === 0 || node.siblingsLeading.length === 0) {
                node = includes(node);
                if (node) {
                    row.push(node);
                }
            }
            else {
                if (node.alignedVertically(row, cleared)) {
                    if (row.length) {
                        result.push(row);
                    }
                    node = includes(node);
                    if (node) {
                        row = [node];
                    }
                    else {
                        row = [];
                    }
                }
                else {
                    node = includes(node);
                    if (node) {
                        row.push(node);
                    }
                }
            }
            if (i === children.length - 1 && row.length) {
                result.push(row);
            }
        }
        return result;
    }

    public baselineActive = false;
    public baselineAltered = false;
    public positioned = false;
    public controlId = '';
    public abstract renderParent?: T;
    public abstract renderExtension?: Extension<Node>[];
    public abstract renderTemplates?: (NodeTemplate<T> | null)[];
    public abstract outerWrapper?: T;
    public abstract innerWrapped?: T;
    public abstract companion?: T;
    public abstract extracted?: T[];
    public abstract horizontalRows?: T[][];
    public abstract innerBefore?: T;
    public abstract innerAfter?: T;
    public abstract readonly renderChildren: T[];

    protected _controlName?: string;
    protected abstract _namespaces: string[];
    protected abstract _cached: CachedValue<T>;
    protected abstract _boxAdjustment?: BoxModel;
    protected abstract _boxReset?: BoxModel;

    private _excludeSection = 0;
    private _excludeProcedure = 0;
    private _excludeResource = 0;
    private _visible = true;
    private _renderAs?: T;

    public abstract setControlType(viewName: string, containerType?: number): void;
    public abstract setLayout(width?: number, height?: number): void;
    public abstract setAlignment(): void;
    public abstract setBoxSpacing(): void;
    public abstract clone(id?: number, attributes?: boolean, position?: boolean): T;
    public abstract extractAttributes(depth?: number): string;
    public abstract alignParent(position: string): boolean;
    public abstract alignSibling(position: string, documentId?: string): string;
    public abstract localizeString(value: string): string;
    public abstract set containerType(value: number);
    public abstract get containerType(): number;
    public abstract get documentId(): string;
    public abstract get baselineHeight(): number;
    public abstract get support(): Support;
    public abstract set renderExclude(value: boolean);
    public abstract get renderExclude(): boolean;

    public cloneBase(node: T) {
        Object.assign(node.localSettings, this.localSettings);
        node.tagName = this.tagName;
        node.alignmentType = this.alignmentType;
        node.depth = this.depth;
        node.visible = this.visible;
        node.excluded = this.excluded;
        node.rendered = this.rendered;
        node.siblingIndex = this.siblingIndex;
        if (this.inlineText) {
            node.setInlineText(true, true);
        }
        node.lineBreakLeading = this.lineBreakLeading;
        node.lineBreakTrailing = this.lineBreakTrailing;
        node.renderParent = this.renderParent;
        node.documentParent = this.documentParent;
        node.documentRoot = this.documentRoot;
        if (this.length) {
            node.retain(this.duplicate());
        }
        node.inherit(this, 'initial', 'base', 'alignment', 'styleMap', 'textStyle');
        Object.assign(node.unsafe('cached'), this._cached);
    }

    public is(containerType: number) {
        return this.containerType === containerType;
    }

    public of(containerType: number, ...alignmentType: number[]) {
        return this.containerType === containerType && alignmentType.some(value => this.hasAlign(value));
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
        const renderParent = this.renderParent;
        if (renderParent && renderParent.renderTemplates) {
            const index = renderParent.renderChildren.findIndex(node => node === this);
            if (index !== -1) {
                const template = renderParent.renderTemplates[index];
                if (template && template.node === this) {
                    renderParent.renderTemplates[index] = null;
                }
            }
        }
    }

    public inherit(node: T, ...modules: string[]) {
        if (name === 'base') {
            this._boxReset = $dom.newBoxModel();
            this._boxAdjustment = $dom.newBoxModel();
        }
        super.inherit(node, ...modules);
    }

    public ascendOuter(condition?: (item: T) => boolean, parent?: T) {
        const result: T[] = [];
        let current = this.outerWrapper;
        while (current && current !== parent) {
            if (condition) {
                if (condition(current)) {
                    return [current];
                }
            }
            else {
                result.push(current);
            }
            current = current.outerWrapper;
        }
        return result;
    }

    public hasResource(value: number) {
        return !$util.hasBit(this.excludeResource, value);
    }

    public hasProcedure(value: number) {
        return !$util.hasBit(this.excludeProcedure, value);
    }

    public hasSection(value: number) {
        return !$util.hasBit(this.excludeSection, value);
    }

    public exclude(resource = 0, procedure = 0, section = 0) {
        if (resource > 0 && !$util.hasBit(this._excludeResource, resource)) {
            this._excludeResource |= resource;
        }
        if (procedure > 0 && !$util.hasBit(this._excludeProcedure, procedure)) {
            this._excludeProcedure |= procedure;
        }
        if (section > 0 && !$util.hasBit(this._excludeSection, section)) {
            this._excludeSection |= section;
        }
    }

    public setExclusions() {
        if (this.styleElement) {
            const parent = this.actualParent;
            const parseExclusions = (attr: string, enumeration: {}) => {
                let exclude = this.dataset[`exclude${attr}`] || '';
                let offset = 0;
                if (parent && parent.dataset[`exclude${attr}Child`]) {
                    exclude += (exclude !== '' ? '|' : '') + parent.dataset[`exclude${attr}Child`];
                }
                if (exclude !== '') {
                    for (let name of exclude.split('|')) {
                        name = name.trim().toUpperCase();
                        if (enumeration[name] && !$util.hasBit(offset, enumeration[name])) {
                            offset |= enumeration[name];
                        }
                    }
                }
                return offset;
            };
            this.exclude(
                parseExclusions('Resource', NODE_RESOURCE),
                parseExclusions('Procedure', NODE_PROCEDURE),
                parseExclusions('Section', APP_SECTION)
            );
        }
    }

    public appendTry(node: T, replacement: T, append = true) {
        let valid = false;
        for (let i = 0; i < this.length; i++) {
            if (this.item(i) === node) {
                this.item(i, replacement);
                replacement.parent = this;
                replacement.innerWrapped = node;
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

    public modifyBox(region: number, offset?: number, negative = true) {
        if (offset !== 0) {
            const attr = CSS_SPACING.get(region);
            if (attr) {
                if (offset === undefined) {
                    if (this._boxReset === undefined) {
                        this._boxReset = $dom.newBoxModel();
                    }
                    this._boxReset[attr] = 1;
                }
                else {
                    if (this._boxAdjustment === undefined) {
                        this._boxAdjustment = $dom.newBoxModel();
                    }
                    if (!negative) {
                        if (this[attr] + this._boxAdjustment[attr] + offset <= 0) {
                            if (this._boxReset === undefined) {
                                this._boxReset = $dom.newBoxModel();
                            }
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
    }

    public getBox(region: number): [number, number] {
        const attr = CSS_SPACING.get(region);
        return attr ? [this._boxReset ? this._boxReset[attr] : 0, this._boxAdjustment ? this._boxAdjustment[attr] : 0] : [0, 0];
    }

    public resetBox(region: number, node?: T, fromParent = false) {
        if (this._boxReset === undefined) {
            this._boxReset = $dom.newBoxModel();
        }
        const boxReset = this._boxReset;
        const applyReset = (attrs: string[], start: number) => {
            for (let i = 0; i < attrs.length; i++) {
                if (boxReset[attrs[i]] === 0) {
                    boxReset[attrs[i]] = 1;
                    const attr = CSS_SPACING.get(CSS_SPACING_KEYS[i + start]) as string;
                    const value = this[attr];
                    if (node && value !== 0) {
                        if (!node.naturalElement && node[attr] === 0) {
                            node.css(attr, $css.formatPX(value), true);
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

    public transferBox(region: number, node: T) {
        const boxAdjustment = this._boxAdjustment;
        if (boxAdjustment) {
            const applyReset = (attrs: string[], start: number) => {
                for (let i = 0; i < attrs.length; i++) {
                    const value: number = boxAdjustment[attrs[i]];
                    if (value > 0) {
                        node.modifyBox(CSS_SPACING_KEYS[i + start], value, false);
                        boxAdjustment[attrs[i]] = 0;
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
    }

    public actualRect(direction: string, dimension = 'linear') {
        let node: T;
        switch (direction) {
            case $const.CSS.TOP:
            case $const.CSS.LEFT:
                node = this.companion && !this.companion.visible && this.companion[dimension][direction] < this[dimension][direction] ? this.companion : this;
                break;
            case $const.CSS.RIGHT:
            case $const.CSS.BOTTOM:
                node = this.companion && !this.companion.visible && this.companion[dimension][direction] > this[dimension][direction] ? this.companion : this;
                break;
            default:
                return NaN;
        }
        return node[dimension][direction] as number;
    }

    get groupParent() {
        return false;
    }

    set renderAs(value) {
        if (!this.rendered && value && !value.rendered) {
            this._renderAs = value;
        }
    }
    get renderAs() {
        return this._renderAs;
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

    set visible(value) {
        this._visible = value;
    }
    get visible() {
        return this._visible;
    }
}