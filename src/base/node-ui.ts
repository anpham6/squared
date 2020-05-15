import Node from './node';

import { CSS_SPACING } from './lib/constant';
import { APP_SECTION, BOX_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE, NODE_TRAVERSE } from './lib/enumeration';

type T = NodeUI;

const { BOX_MARGIN, BOX_PADDING, BOX_POSITION } = squared.lib.css;
const { equal } = squared.lib.math;
const { getElementAsNode } = squared.lib.session;
const { capitalize, cloneObject, convertWord, hasBit, hasKeys, isArray, iterateArray, safeNestedMap, searchObject, withinRange } = squared.lib.util;

const CSS_SPACING_KEYS = Array.from(CSS_SPACING.keys());
const INHERIT_ALIGNMENT = ['position', 'display', 'verticalAlign', 'float', 'clear', 'zIndex'];

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
            else if (canCascadeChildren.call(item)) {
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

function parseExclusions(attr: string, enumeration: {}, dataset: DOMStringMap, parentDataset: DOMStringMap, systemName: string) {
    let exclude = dataset[attr + systemName] || dataset[attr] || '';
    let offset = 0;
    const value = parentDataset[attr + 'Child' + systemName] || parentDataset[attr + 'Child'];
    if (value) {
        exclude += (exclude !== '' ? '|' : '') + value;
    }
    if (exclude !== '') {
        for (const name of exclude.split('|')) {
            const i: number = enumeration[name.trim().toUpperCase()] || 0;
            if (i > 0 && !hasBit(offset, i)) {
                offset |= i;
            }
        }
    }
    return offset;
}

function traverseElementSibling(element: Null<Element>, direction: "previousSibling" | "nextSibling", sessionId: string, options?: SiblingOptions) {
    let floating: Undef<boolean>, pageFlow: Undef<boolean>, lineBreak: Undef<boolean>, excluded: Undef<boolean>;
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

function canCascadeChildren(this: T) {
    return this.naturalElements.length > 0 && !this.layoutElement && !this.tableElement;
}

function checkBlockDimension(this: T, previous: T) {
    return this.blockDimension && Math.ceil(this.bounds.top) >= previous.bounds.bottom && (this.blockVertical || previous.blockVertical || this.percentWidth > 0 || previous.percentWidth > 0);
}

function getPercentWidth(this: T) {
    return this.inlineDimension && !this.hasPX('maxWidth') ? this.percentWidth : -Infinity;
}

function getLayoutWidth(this: T) {
    return this.actualWidth + Math.max(this.marginLeft, 0) + this.marginRight;
}

function applyBoxReset(this: T, boxReset: BoxModel, attrs: string[], region: number, start: number, node?: NodeUI) {
    for (let i = 0; i < 4; ++i) {
        const key = CSS_SPACING_KEYS[i + start];
        if (hasBit(region, key)) {
            const name = attrs[i];
            boxReset[name] = 1;
            if (node) {
                const previous = this.registerBox(key);
                if (previous) {
                    previous.resetBox(key, node);
                }
                else {
                    if (this.naturalChild) {
                        const value = this[name];
                        if (value >= 0) {
                            node.modifyBox(key, value);
                        }
                    }
                    this.transferBox(key, node);
                }
            }
        }
    }
}

function applyBoxAdjustment(this: T, boxAdjustment: BoxModel, attrs: string[], region: number, start: number, node: NodeUI) {
    for (let i = 0; i < 4; ++i) {
        const key = CSS_SPACING_KEYS[i + start];
        if (hasBit(region, key)) {
            const previous = this.registerBox(key);
            if (previous) {
                previous.transferBox(key, node);
            }
            else {
                const name = attrs[i];
                const value: number = boxAdjustment[name];
                if (value !== 0) {
                    node.modifyBox(key, value, false);
                    boxAdjustment[name] = 0;
                }
                this.registerBox(key, node);
            }
        }
    }
}

export default abstract class NodeUI extends Node implements squared.base.NodeUI {
    public static refitScreen(node: T, value: Dimension): Dimension {
        const { width: screenWidth, height: screenHeight } = node.localSettings.screenDimension;
        let { width, height } = value;
        if (width > screenWidth) {
            height = Math.round(height * screenWidth / width);
            width = screenWidth;
        }
        else if (height > screenHeight) {
            width = Math.round(width * screenHeight / height);
            height = screenHeight;
        }
        else {
            return value;
        }
        return { width, height };
    }

    public static outerRegion(node: T): BoxRectDimension {
        let top = Infinity, right = -Infinity, bottom = -Infinity, left = Infinity;
        let actualTop: number, actualRight: number, actualBottom: number, actualLeft: number;
        let negativeRight = -Infinity;
        let negativeBottom = -Infinity;
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

    public static baseline<T extends NodeUI>(list: T[], text = false): Null<T> {
        const result: T[] = [];
        const length = list.length;
        let i = 0;
        while (i < length) {
            const item = list[i++];
            if (item.baseline && (!text || item.textElement) && !item.baselineAltered) {
                if (item.naturalElements.length) {
                    if (item.baselineElement) {
                        result.push(item);
                    }
                }
                else {
                    result.push(item);
                }
            }
        }
        if (result.length > 1) {
            result.sort((a, b) => {
                if (a.length && b.length === 0) {
                    return 1;
                }
                else if (b.length && a.length === 0) {
                    return -1;
                }
                const heightA = a.baselineHeight + a.marginBottom, heightB = b.baselineHeight + b.marginBottom;
                if (!equal(heightA, heightB)) {
                    return heightA > heightB ? -1 : 1;
                }
                else if (a.textElement && b.textElement) {
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
                else if (a.inputElement && b.inputElement && a.containerType !== b.containerType) {
                    return a.containerType > b.containerType ? -1 : 1;
                }
                else if (b.textElement && a.inputElement && b.childIndex < a.childIndex) {
                    return 1;
                }
                else if (a.textElement && b.inputElement && a.childIndex < b.childIndex) {
                    return -1;
                }
                const bottomA = a.bounds.bottom, bottomB = b.bounds.bottom;
                if (bottomA > bottomB) {
                    return -1;
                }
                else if (bottomA < bottomB) {
                    return 1;
                }
                return 0;
            });
        }
        return result[0] || null;
    }

    public static linearData<T extends NodeUI>(list: T[], cleared?: Map<T, string>): LinearData<T> {
        const floated = new Set<string>();
        let linearX = false, linearY = false;
        const length = list.length;
        if (length > 1) {
            const nodes: T[] = new Array(length);
            let i = 0, n = 0;
            while (i < length) {
                const item = list[i++];
                if (item.pageFlow) {
                    if (item.floating) {
                        floated.add(item.float);
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
                let x = 1, y = 1;
                i = 1;
                while (i < n) {
                    const node = nodes[i++];
                    if (node.alignedVertically(siblings, cleared) > 0) {
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
                if (linearX && floated.size) {
                    let boxLeft = Infinity, boxRight = -Infinity;
                    let floatLeft = -Infinity, floatRight = Infinity;
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
        else if (length) {
            linearY = list[0].blockStatic;
            linearX = !linearY;
        }
        return { linearX, linearY, floated, cleared };
    }

    public static partitionRows(list: T[], cleared?: Map<T, string>) {
        const result: T[][] = [];
        let row: T[] = [];
        let siblings: T[] = [];
        const length = list.length;
        let i = 0;
        while (i < length) {
            const node = list[i++];
            let active = node;
            if (!node.naturalChild) {
                if (node.nodeGroup) {
                    if (row.length) {
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
                if (row.length) {
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
        if (row.length) {
            result.push(row);
        }
        return result;
    }

    public alignmentType = 0;
    public rendered = false;
    public excluded = false;
    public originalRoot = false;
    public floatContainer = false;
    public lineBreakLeading = false;
    public lineBreakTrailing = false;
    public baselineActive = false;
    public baselineAltered = false;
    public abstract localSettings: LocalSettingsUI;
    public abstract renderParent?: T;
    public abstract renderExtension?: squared.base.ExtensionUI<T>[];
    public abstract renderTemplates?: NodeTemplate<T>[];
    public abstract outerWrapper?: T;
    public abstract innerWrapped?: T;
    public abstract innerBefore?: T;
    public abstract innerAfter?: T;
    public abstract companion?: T;
    public abstract labelFor?: T;
    public abstract horizontalRows?: T[][];
    public abstract readonly renderChildren: T[];

    protected _boxRegister: ObjectIndex<T> = {};
    protected _preferInitial = true;
    protected _documentParent?: T;
    protected _controlName?: string;
    protected abstract _cached: CachedValueUI<T>;
    protected abstract _namespaces: string[];
    protected abstract _boxAdjustment: BoxModel;
    protected abstract _boxReset: BoxModel;

    private _excludeSection = 0;
    private _excludeProcedure = 0;
    private _excludeResource = 0;
    private _childIndex = Infinity;
    private _containerIndex = Infinity;
    private _visible = true;
    private _renderAs: Null<T> = null;
    private _locked: ObjectMapNested<boolean> = {};
    private _siblingsLeading?: T[];
    private _siblingsTrailing?: T[];

    public abstract setControlType(viewName: string, containerType?: number): void;
    public abstract setLayout(width?: number, height?: number): void;
    public abstract setAlignment(): void;
    public abstract setBoxSpacing(): void;
    public abstract apply(options: {}): void;
    public abstract clone(id?: number, attributes?: boolean, position?: boolean): T;
    public abstract extractAttributes(depth?: number): string;
    public abstract alignParent(position: string): boolean;
    public abstract alignSibling(position: string, documentId?: string): string;
    public abstract actualRect(direction: string, dimension?: BoxType): number;
    public abstract translateX(value: number, options?: TranslateOptions): boolean;
    public abstract translateY(value: number, options?: TranslateOptions): boolean;
    public abstract localizeString(value: string): string;

    public abstract get controlElement(): boolean;
    public abstract set containerType(value: number);
    public abstract get containerType(): number;
    public abstract set controlId(name: string);
    public abstract get controlId(): string;
    public abstract get documentId(): string;
    public abstract get baselineHeight(): number;
    public abstract get support(): SupportUI;
    public abstract set renderExclude(value: boolean);
    public abstract get renderExclude(): boolean;
    public abstract set positioned(value);
    public abstract get positioned(): boolean;

    public is(containerType: number) {
        return this.containerType === containerType;
    }

    public of(containerType: number, ...alignmentType: number[]) {
        return this.is(containerType) && alignmentType.some(value => this.hasAlign(value));
    }

    public attr(name: string, attr: string, value?: string, overwrite = true): string {
        let obj: StringMap = this['__' + name];
        if (value) {
            if (!obj) {
                if (!this._namespaces.includes(name)) {
                    this._namespaces.push(name);
                }
                obj = {};
                this['__' + name] = obj;
            }
            if (overwrite && this.lockedAttr(name, attr)) {
                overwrite = false;
            }
            if (!overwrite && obj[attr]) {
                value = obj[attr];
            }
            else {
                obj[attr] = value;
            }
            return value;
        }
        else {
            return obj?.[attr] || '';
        }
    }

    public unsafe(name: string, value?: any): any {
        if (value !== undefined) {
            this['_' + name] = value;
        }
        else {
            return this['_' + name];
        }
    }

    public unset(name: string) {
        delete this['_' + name];
    }

    public namespace(name: string): StringMap {
        return this['__' + name] || {};
    }

    public delete(name: string, ...attrs: string[]) {
        const obj = this['__' + name];
        if (obj) {
            for (const attr of attrs) {
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

    public lockAttr(name: string, attr: string) {
        safeNestedMap(this._locked, name)[attr] = true;
    }

    public unlockAttr(name: string, attr: string) {
        const locked = this._locked[name];
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

    public parseUnit(value: string, dimension: DimensionAttr = 'width', parent = true, screenDimension?: Dimension) {
        return super.parseUnit(value, dimension, parent, screenDimension || this.localSettings.screenDimension);
    }

    public parseWidth(value: string, parent = true) {
        return super.parseUnit(value, 'width', parent, this.localSettings.screenDimension);
    }

    public parseHeight(value: string, parent = true) {
        return super.parseUnit(value, 'height', parent, this.localSettings.screenDimension);
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
        for (const name of modules) {
            switch (name) {
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
                    cloneObject(node.unsafe('initial') as InitialData<T>, this.initial);
                    break;
                case 'alignment': {
                    const styleMap = this._styleMap;
                    for (const attr of INHERIT_ALIGNMENT) {
                        styleMap[attr] = node.css(attr);
                    }
                    if (!this.positionStatic) {
                        for (const attr of BOX_POSITION) {
                            if (node.hasPX(attr)) {
                                styleMap[attr] = node.css(attr);
                            }
                        }
                    }
                    Object.assign(this.autoMargin, node.autoMargin);
                    this.autoPosition = node.autoPosition;
                    break;
                }
                case 'styleMap':
                    this.cssCopyIfEmpty(node, ...Object.keys(node.unsafe('styleMap')));
                    break;
                case 'textStyle':
                    this.cssApply(node.textStyle);
                    this.setCacheValue('fontSize', node.fontSize);
                    break;
                case 'boxStyle': {
                    const { backgroundColor, backgroundImage } = node;
                    this.cssApply(node.cssAsObject(
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
                    ));
                    this.cssApply({
                        backgroundColor,
                        backgroundImage,
                        border: 'inherit',
                        borderRadius: 'inherit'
                    });
                    this.unsetCache('borderTopWidth', 'borderBottomWidth', 'borderRightWidth', 'borderLeftWidth');
                    this.setCacheValue('backgroundColor', backgroundColor);
                    this.setCacheValue('backgroundImage', backgroundImage);
                    node.setCacheValue('backgroundColor', '');
                    node.setCacheValue('backgroundImage', '');
                    node.cssApply({
                        backgroundColor: 'rgba(0, 0, 0, 0)',
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

    public setExclusions(systemName?: string) {
        if (this.naturalElement) {
            const element = this._element as HTMLElement;
            const dataset = element.dataset;
            const parentDataset = element.parentElement?.dataset || {};
            if (hasKeys(dataset) || hasKeys(parentDataset)) {
                systemName = capitalize(systemName || this.localSettings.systemName);
                this.exclude({
                    resource: parseExclusions('excludeResource', NODE_RESOURCE, dataset, parentDataset, systemName),
                    procedure: parseExclusions('excludeProcedure', NODE_PROCEDURE, dataset, parentDataset, systemName),
                    section: parseExclusions('excludeSection', APP_SECTION, dataset, parentDataset, systemName)
                });
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
                children[i] = replaceWith;
                replaceWith.parent = this;
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
                                        options!.beforeReplace?.call(this, replaceWith);
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
                            options?.beforeReplace?.call(this, undefined);
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
        else if (this.autoPosition && isArray(siblings)) {
            return siblings[siblings.length - 1].blockStatic ? NODE_TRAVERSE.VERTICAL : NODE_TRAVERSE.HORIZONTAL;
        }
        else if (this.pageFlow) {
            const floating = this.floating;
            if (isArray(siblings)) {
                const previous = siblings[siblings.length - 1];
                if (cleared) {
                    if (cleared.size && (cleared.has(this) || this.siblingsLeading.some(item => item.excluded && cleared.has(item)))) {
                        return NODE_TRAVERSE.FLOAT_CLEAR;
                    }
                    else {
                        if (floating && previous.floating) {
                            if (horizontal && this.float === previous.float || Math.floor(this.bounds.top) === Math.floor(previous.bounds.top)) {
                                return NODE_TRAVERSE.HORIZONTAL;
                            }
                            else if (Math.ceil(this.bounds.top) >= previous.bounds.bottom) {
                                if (siblings.every(item => item.inlineDimension)) {
                                    const actualParent = this.actualParent;
                                    if (actualParent && actualParent.ascend({ condition: item => !item.inline && item.hasWidth, error: (item: T) => item.layoutElement, startSelf: true })) {
                                        const length = actualParent.naturalChildren.filter((item: T) => item.visible && item.pageFlow).length;
                                        if (length === siblings.length + 1) {
                                            let width = actualParent.box.width - getLayoutWidth.call(this);
                                            for (const item of siblings) {
                                                width -= getLayoutWidth.call(item);
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
                                if (this.textElement && cleared.size && siblings.some(item => cleared.has(item)) && siblings.some(item => Math.floor(top) < item.bounds.top && Math.ceil(bottom) > item.bounds.bottom)) {
                                    return NODE_TRAVERSE.FLOAT_INTERSECT;
                                }
                                else if (siblings[0].floating) {
                                    if (siblings.length > 1) {
                                        const float = siblings[0].float;
                                        let maxBottom = -Infinity;
                                        let contentWidth = 0;
                                        for (const item of siblings) {
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
                }
                if (checkBlockDimension.call(this, previous)) {
                    return NODE_TRAVERSE.INLINE_WRAP;
                }
                else {
                    const percentWidth = getPercentWidth.call(this);
                    if (percentWidth > 0 && siblings.reduce((a, b) => a + getPercentWidth.call(b), percentWidth) > 1) {
                        return NODE_TRAVERSE.PERCENT_WRAP;
                    }
                }
            }
            const blockStatic = this.blockStatic || this.display === 'table';
            const length = this.siblingsLeading.length;
            if (blockStatic && (this.containerIndex === 0 || length === 0)) {
                return NODE_TRAVERSE.VERTICAL;
            }
            let i = 0;
            while (i < length) {
                const previous = this.siblingsLeading[i++];
                if (previous.lineBreak) {
                    return NODE_TRAVERSE.LINEBREAK;
                }
                else if (previous.blockStatic || previous.autoMargin.leftRight || (floating && previous.childIndex === 0 || horizontal === false) && previous.plainText && previous.multiline) {
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
                if (cleared?.has(previous) && !(siblings?.[0] === previous)) {
                    return NODE_TRAVERSE.FLOAT_CLEAR;
                }
                else if (checkBlockDimension.call(this, previous)) {
                    return NODE_TRAVERSE.INLINE_WRAP;
                }
            }
        }
        else {
            return NODE_TRAVERSE.VERTICAL;
        }
        return NODE_TRAVERSE.HORIZONTAL;
    }

    public previousSiblings(options?: SiblingOptions) {
        return traverseElementSibling((this.nodeGroup ? this.firstChild?.element?.previousSibling : this.innerMostWrapped.element?.previousSibling) as Element, 'previousSibling', this.sessionId, options);
    }

    public nextSiblings(options?: SiblingOptions) {
        return traverseElementSibling((this.nodeGroup ? this.firstChild?.element?.nextSibling : this.innerMostWrapped.element?.nextSibling) as Element, 'nextSibling', this.sessionId, options);
    }

    public modifyBox(region: number, offset?: number, negative = true) {
        if (offset !== 0) {
            const attr = CSS_SPACING.get(region);
            if (attr) {
                const node = this._boxRegister[region];
                if (offset === undefined) {
                    if (node) {
                        const value: number = this[attr] || node.getBox(region)[1];
                        if (value > 0) {
                            node.modifyBox(region, -value, negative);
                        }
                    }
                    else {
                        this._boxReset[attr] = 1;
                    }
                }
                else if (node) {
                    node.modifyBox(region, offset, negative);
                }
                else {
                    const boxAdjustment = this._boxAdjustment;
                    if (!negative && (this._boxReset[attr] === 0 ? this[attr] : 0) + boxAdjustment[attr] + offset <= 0) {
                        boxAdjustment[attr] = 0;
                        if (this[attr] >= 0 && offset < 0) {
                            this._boxReset[attr] = 1;
                        }
                    }
                    else {
                        boxAdjustment[attr] += offset;
                    }
                }
            }
        }
    }

    public getBox(region: number): [number, number] {
        const attr = CSS_SPACING.get(region);
        return attr ? [this._boxReset[attr], this._boxAdjustment[attr]] : [NaN, 0];
    }

    public setBox(region: number, options: BoxOptions) {
        const attr = CSS_SPACING.get(region);
        if (attr) {
            const node = this._boxRegister[region];
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
                    let value = boxAdjustment[attr];
                    if (options.accumulate) {
                        value += adjustment;
                    }
                    else {
                        value = adjustment;
                    }
                    if (options.negative === false && (boxReset[attr] === 0 ? this[attr] : 0) + value <= 0) {
                        value = 0;
                        if (this[attr] >= 0 && value < 0) {
                            boxReset[attr] = 1;
                        }
                    }
                    boxAdjustment[attr] = value;
                }
                else if (reset === 1 && !this.naturalChild) {
                    boxAdjustment[attr] = 0;
                }
            }
        }
    }

    public resetBox(region: number, node?: T) {
        if (hasBit(BOX_STANDARD.MARGIN, region)) {
            applyBoxReset.call(this, this._boxReset, BOX_MARGIN, region, 0, node);
        }
        if (hasBit(BOX_STANDARD.PADDING, region)) {
            applyBoxReset.call(this, this._boxReset, BOX_PADDING, region, 4, node);
        }
    }

    public transferBox(region: number, node: T) {
        if (hasBit(BOX_STANDARD.MARGIN, region)) {
            applyBoxAdjustment.call(this, this._boxAdjustment, BOX_MARGIN, region, 0, node);
        }
        if (hasBit(BOX_STANDARD.PADDING, region)) {
            applyBoxAdjustment.call(this, this._boxAdjustment, BOX_PADDING, region, 4, node);
        }
    }

    public registerBox(region: number, node?: T): Undef<NodeUI> {
        const boxRegister = this._boxRegister;
        if (node) {
            boxRegister[region] = node;
        }
        else {
            node = boxRegister[region];
        }
        while (node) {
            const next: Undef<NodeUI> = (node.unsafe('boxRegister') as ObjectIndex<T>)[region];
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
                    return canCascadeChildren.call(node) && cascadeActualPadding(node.naturalChildren as T[], attr, value) ? 0 : value;
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
        if (this.pageFlow && !this.documentRoot) {
            let offsetLeft = 0;
            let offsetRight = 0;
            let current = this.actualParent;
            while (current) {
                if (current.hasPX('width', false) || !current.pageFlow) {
                    return value;
                }
                else {
                    offsetLeft += Math.max(current.marginLeft, 0) + current.borderLeftWidth + current.paddingLeft;
                    offsetRight += current.paddingRight + current.borderRightWidth + current.marginRight;
                }
                if (current.documentRoot) {
                    break;
                }
                else {
                    current = current.actualParent;
                }
            }
            const screenWidth = this.localSettings.screenDimension.width - offsetLeft - offsetRight;
            if (screenWidth > 0) {
                return Math.min(value, screenWidth);
            }
        }
        return value;
    }

    public cloneBase(node: T) {
        node.localSettings = this.localSettings;
        node.alignmentType = this.alignmentType;
        node.containerName = this.containerName;
        node.depth = this.depth;
        node.visible = this.visible;
        node.excluded = this.excluded;
        node.rendered = this.rendered;
        node.childIndex = this.childIndex;
        node.containerIndex = this.containerIndex;
        node.inlineText = this.inlineText;
        node.lineBreakLeading = this.lineBreakLeading;
        node.lineBreakTrailing = this.lineBreakTrailing;
        node.actualParent = this.actualParent;
        node.documentParent = this.documentParent;
        node.documentRoot = this.documentRoot;
        node.renderParent = this.renderParent;
        if (this.length) {
            node.retain(this.duplicate());
        }
        node.inherit(this, 'initial', 'base', 'alignment', 'styleMap', 'textStyle');
        Object.assign(node.unsafe('cached'), this._cached);
    }

    public unsetCache(...attrs: string[]) {
        if (attrs.length) {
            const cached = this._cached;
            for (const attr of attrs) {
                switch (attr) {
                    case 'top':
                    case 'right':
                    case 'bottom':
                    case 'left':
                        cached.autoPosition = undefined;
                        cached.positiveAxis = undefined;
                        break;
                    case 'fontSize':
                    case 'lineHeight':
                        cached.baselineHeight = undefined;
                        break;
                    case 'whiteSpace':
                        cached.preserveWhiteSpace = undefined;
                        cached.textEmpty = undefined;
                        break;
                }
            }
        }
        super.unsetCache(...attrs);
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
        return this._styleMap[attr] || this.styleElement && this.style[attr] || '';
    }

    public cssApply(values: StringMap, cache = false) {
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
        return this._element || !!this.innerWrapped && this.innerMostWrapped.unsafe('element') as Null<Element> || null;
    }

    set naturalChild(value) {
        this._cached.naturalChild = value;
    }
    get naturalChild() {
        let result = this._cached.naturalChild;
        if (result === undefined) {
            result = !!this._element?.parentElement;
            this._cached.naturalChild = result;
        }
        return result;
    }

    get pseudoElement() {
        return this._element?.className === '__squared.pseudo';
    }

    get layoutElement() {
        let result = this._cached.layoutElement;
        if (result === undefined) {
            result = this.flexElement || this.gridElement;
            this._cached.layoutElement = result;
        }
        return result;
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
        if (!this.rendered && value?.rendered === false) {
            this._renderAs = value;
        }
    }
    get renderAs() {
        return this._renderAs;
    }

    get positionRelative() {
        return this._cached.positionRelative ?? super.positionRelative;
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

    get inlineFlow() {
        let result = this._cached.inlineFlow;
        if (result === undefined) {
            result = this.inline || this.inlineDimension || this.inlineVertical || this.imageElement;
            this._cached.inlineFlow = result;
        }
        return result;
    }

    get blockStatic() {
        return super.blockStatic || this.hasAlign(NODE_ALIGNMENT.BLOCK) && this.pageFlow && !this.floating;
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

    get rightAligned() {
        return super.rightAligned || this.hasAlign(NODE_ALIGNMENT.RIGHT);
    }

    set autoPosition(value) {
        this._cached.autoPosition = value;
    }
    get autoPosition() {
        let result = this._cached.autoPosition;
        if (result === undefined) {
            if (this.pageFlow) {
                result = false;
            }
            else {
                const { top, right, bottom, left } = this._styleMap;
                result = (!top || top === 'auto') && (!left || left === 'auto') && (!right || right === 'auto') && (!bottom || bottom === 'auto');
            }
            this._cached.autoPosition = result;
        }
        return result;
    }

    set textContent(value) {
        this._cached.textContent = value;
    }
    get textContent() {
        let result = this._cached.textContent;
        if (result === undefined) {
            result = super.textContent;
            this._cached.textContent = result;
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

    get leftTopAxis() {
        let result = this._cached.leftTopAxis;
        if (result === undefined) {
            switch (this.cssInitial('position')) {
                case 'absolute':
                    result = this.absoluteParent === this.documentParent;
                    break;
                case 'fixed':
                    result = true;
                    break;
                default:
                    result = false;
                    break;
            }
            this._cached.leftTopAxis = result;
        }
        return result;
    }

    get baselineElement() {
        let result = this._cached.baselineElement;
        if (result === undefined) {
            if (this.baseline) {
                const children = this.naturalChildren;
                if (children.length) {
                    result = children.every((node: T) => node.baselineElement && node.length === 0);
                }
                else {
                    result = this.inlineText && this.textElement || this.plainText && !this.multiline || this.inputElement || this.imageElement || this.svgElement;
                }
            }
            else {
                result = false;
            }
            this._cached.baselineElement = result;
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

    set visible(value) {
        this._visible = value;
    }
    get visible() {
        return this._visible;
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
        let result = this._cached.actualParent;
        if (result === undefined) {
            result = super.actualParent as Null<T> || this.innerMostWrapped.actualParent;
            this._cached.actualParent = result;
        }
        return result;
    }

    set siblingsLeading(value) {
        this._siblingsLeading = value;
    }
    get siblingsLeading() {
        return this._siblingsLeading || this.previousSiblings();
    }

    set siblingsTrailing(value) {
        this._siblingsTrailing = value;
    }
    get siblingsTrailing() {
        return this._siblingsTrailing || this.nextSiblings();
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
                    if (node && (!node.excluded || node.lineBreak)) {
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
                    if (node && (!node.excluded || node.lineBreak)) {
                        return node;
                    }
                }
            }
        }
        return null;
    }

    get firstChild(): Null<NodeUI> {
        return this.naturalChildren[0] as NodeUI || null;
    }

    get lastChild(): Null<NodeUI> {
        const children = this.naturalChildren;
        return children[children.length - 1] as NodeUI || null;
    }

    get firstStaticChild() {
        for (const node of this.naturalChildren) {
            if (node.pageFlow) {
                return node as NodeUI;
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
                return node as NodeUI;
            }
        }
        return null;
    }

    get onlyChild() {
        return (this.renderParent?.renderChildren.length ?? this.parent?.length) === 1 && !this.documentRoot;
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
                while (wrapped);
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
            while (wrapped) {
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

    get textEmpty() {
        if (this.styleElement && !this.imageElement && !this.svgElement && !this.inputElement) {
            const value = this.textContent;
            return value === '' || !this.preserveWhiteSpace && value.trim() === '';
        }
        return false;
    }

    get innerMostWrapped() {
        if (this.naturalChild) {
            return this;
        }
        let result = this.innerWrapped;
        while (result) {
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
        while (result) {
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
        let result = this._cached.preserveWhiteSpace;
        if (result === undefined) {
            const value = this.css('whiteSpace');
            result = value === 'pre' || value === 'pre-wrap';
            this._cached.preserveWhiteSpace = result;
        }
        return result;
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
        let result = this._cached.extensions;
        if (result === undefined) {
            const use = this.use?.trim();
            result = use ? use.split(/\s*,\s*/) : [];
            this._cached.extensions = result;
        }
        return result;
    }
}