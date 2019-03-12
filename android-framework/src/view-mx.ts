import { CachedValue } from '../../src/base/@types/node';
import { CustomizationResult } from './@types/application';
import { Constraint, LocalSettings } from './@types/node';

import { AXIS_ANDROID, CONTAINER_ANDROID, ELEMENT_ANDROID, LAYOUT_ANDROID, RESERVED_JAVA } from './lib/constant';
import { API_ANDROID, DEPRECATED_ANDROID } from './lib/customization';
import { BUILD_ANDROID, CONTAINER_NODE } from './lib/enumeration';
import { calculateBias, replaceRTL, stripId, validateString } from './lib/util';

import $NodeList = squared.base.NodeList;
import $Resource = squared.base.Resource;

type T = android.base.View;

const $enum = squared.base.lib.enumeration;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $util = squared.lib.util;

function checkTextAlign(value: string) {
    switch (value) {
        case 'justify':
        case 'initial':
        case 'inherit':
            return '';
        case 'center':
            return 'center_horizontal';
        default:
            return value;
    }
}

function setAutoMargin(node: T) {
    if (!node.blockWidth) {
        const alignment: string[] = [];
        const singleFrame = node.documentRoot && node.layoutFrame && node.length === 1 && node.has('maxWidth');
        if (node.autoMargin.leftRight) {
            if (singleFrame) {
                (node.renderChildren[0] as T).mergeGravity('layout_gravity', 'center_horizontal');
            }
            else {
                alignment.push('center_horizontal');
            }
        }
        else if (node.autoMargin.left) {
            if (singleFrame) {
                (node.renderChildren[0] as T).mergeGravity('layout_gravity', 'right');
            }
            else {
                alignment.push('right');
            }
        }
        else if (node.autoMargin.right) {
            alignment.push('left');
        }
        if (node.autoMargin.topBottom) {
            alignment.push('center_vertical');
        }
        else if (node.autoMargin.top) {
            alignment.push('bottom');
        }
        else if (node.autoMargin.bottom) {
            alignment.push('top');
        }
        if (alignment.length) {
            node.mergeGravity(node.blockWidth || !node.pageFlow ? 'gravity' : 'layout_gravity', ...alignment);
            return true;
        }
    }
    return false;
}

export default (Base: Constructor<squared.base.Node>) => {
    return class View extends Base implements android.base.View {
        public static documentBody() {
            if (View._documentBody === undefined) {
                const body = new View(0, document.body);
                body.hide();
                body.setBounds();
                View._documentBody = body;
            }
            return View._documentBody;
        }

        public static getControlName(containerType: number): string {
            return CONTAINER_ANDROID[CONTAINER_NODE[containerType]];
        }

        private static _documentBody: T;

        public readonly renderChildren: T[] = [];
        public readonly constraint: Constraint = {
            horizontal: false,
            vertical: false,
            current: {}
        };

        protected _namespaces = new Set(['android', 'app']);
        protected _controlName = '';
        protected _fontSize = 0;
        protected _renderParent?: T;
        protected _documentParent?: T;
        protected readonly _boxAdjustment: BoxModel = $dom.newBoxModel();
        protected readonly _boxReset: BoxModel = $dom.newBoxModel();

        private _containerType = 0;
        private _localSettings: LocalSettings = {
            targetAPI: BUILD_ANDROID.LATEST,
            supportRTL: false,
            constraintPercentPrecision: 4
        };
        private __android: StringMap = {};
        private __app: StringMap = {};

        constructor(
            id = 0,
            element?: Element | null,
            afterInit?: BindGeneric<T, void>)
        {
            super(id, element);
            if (afterInit) {
                afterInit(this);
            }
        }

        public attr(obj: string, attr: string, value = '', overwrite = true) {
            const result = {};
            if (!this.supported(obj, attr, result)) {
                return '';
            }
            if (Object.keys(result).length) {
                if ($util.isString(result['obj'])) {
                    obj = result['obj'];
                }
                if ($util.isString(result['attr'])) {
                    attr = result['attr'];
                }
                if ($util.isString(result['value'])) {
                    value = result['value'];
                }
                if (typeof result['overwrite'] === 'boolean') {
                    overwrite = result['overwrite'];
                }
            }
            return super.attr(obj, attr, value, overwrite);
        }

        public android(attr: string, value = '', overwrite = true) {
            this.attr('android', attr, value, overwrite);
            return this.__android[attr] || '';
        }

        public app(attr: string, value = '', overwrite = true) {
            this.attr('app', attr, value, overwrite);
            return this.__app[attr] || '';
        }

        public apply(options: {}) {
            const data = { ...options };
            super.apply(data);
            for (const obj in data) {
                this.formatted(`${obj}="${data[obj]}"`);
            }
        }

        public formatted(value: string, overwrite = true) {
            const match = value.match(/^(?:([a-z]+):)?(\w+)="((?:@+?[a-z]+\/)?.+)"$/);
            if (match) {
                this.attr(match[1] || '_', match[2], match[3], overwrite);
            }
        }

        public anchor(position: string, documentId = '', overwrite?: boolean) {
            const renderParent = this.renderParent as T;
            if (renderParent) {
                if (renderParent.layoutConstraint) {
                    if (documentId === undefined || this.constraint.current[position] === undefined || overwrite) {
                        if (documentId && overwrite === undefined) {
                            overwrite = documentId === 'parent';
                        }
                        const attr: string = LAYOUT_ANDROID.constraint[position];
                        if (attr) {
                            this.app(this.localizeString(attr), documentId, overwrite);
                            if (documentId === 'parent') {
                                switch (position) {
                                    case 'left':
                                    case 'right':
                                        this.constraint.horizontal = true;
                                        break;
                                    case 'top':
                                    case 'bottom':
                                    case 'baseline':
                                        this.constraint.vertical = true;
                                        break;
                                }
                            }
                            this.constraint.current[position] = {
                                documentId,
                                horizontal: $util.firstIndexOf(position.toLowerCase(), 'left', 'right') !== -1
                            };
                            return true;
                        }
                    }
                }
                else if (renderParent.layoutRelative) {
                    if (documentId && overwrite === undefined) {
                        overwrite = documentId === 'true';
                    }
                    const attr: string = LAYOUT_ANDROID[documentId === 'true' ? 'relativeParent' : 'relative'][position];
                    this.android(this.localizeString(attr), documentId, overwrite);
                    return true;
                }
            }
            return false;
        }

        public anchorParent(orientation: string, overwrite = false, constraintBias = false) {
            const renderParent = this.renderParent as T;
            if (renderParent) {
                const horizontal = orientation === AXIS_ANDROID.HORIZONTAL;
                if (renderParent.layoutConstraint) {
                    if (overwrite || !this.constraint[orientation]) {
                        this.anchor(horizontal ? 'left' : 'top', 'parent');
                        this.anchor(horizontal ? 'right' : 'bottom', 'parent');
                        this.constraint[orientation] = true;
                        if (constraintBias) {
                            this.app(`layout_constraint${$util.capitalize(orientation)}_bias`, this[`${orientation}Bias`]);
                        }
                        return true;
                    }
                }
                else if (renderParent.layoutRelative) {
                    this.anchor(horizontal ? 'left' : 'top', 'true');
                    this.anchor(horizontal ? 'right' : 'bottom', 'true');
                    return true;
                }
            }
            return false;
        }

        public anchorDelete(...position: string[]) {
            const renderParent = this.renderParent as T;
            if (renderParent) {
                if (renderParent.layoutConstraint) {
                    this.delete('app', ...$util.replaceMap<string, string>(position, value => this.localizeString(LAYOUT_ANDROID.constraint[value])));
                }
                else if (renderParent.layoutRelative) {
                    for (const value of position) {
                        if (this.alignSibling(value) !== '') {
                            this.delete('android', LAYOUT_ANDROID.relative[value], this.localizeString(LAYOUT_ANDROID.relative[value]));
                        }
                        else if (LAYOUT_ANDROID.relativeParent[value]) {
                            this.delete('android', this.localizeString(LAYOUT_ANDROID.relativeParent[value]));
                        }
                    }
                }
            }
        }

        public anchorClear() {
            const renderParent = this.renderParent as T;
            if (renderParent) {
                if (renderParent.layoutConstraint) {
                    this.anchorDelete(...Object.keys(LAYOUT_ANDROID.constraint));
                }
                else if (renderParent.layoutRelative) {
                    this.anchorDelete(...Object.keys(LAYOUT_ANDROID.relativeParent));
                    this.anchorDelete(...Object.keys(LAYOUT_ANDROID.relative));
                }
            }
        }

        public alignParent(position: string) {
            const renderParent = this.renderParent as T;
            if (renderParent) {
                if (renderParent.layoutConstraint) {
                    const attr: string | undefined = LAYOUT_ANDROID.constraint[position];
                    if (attr) {
                        return this.app(this.localizeString(attr)) === 'parent' || this.app(attr) === 'parent';
                    }
                }
                else if (renderParent.layoutRelative) {
                    const attr: string | undefined = LAYOUT_ANDROID.relativeParent[position];
                    if (attr) {
                        return this.android(this.localizeString(attr)) === 'true' || this.android(attr) === 'true';
                    }
                }
            }
            return false;
        }

        public alignSibling(position: string, documentId?: string) {
            const renderParent = this.renderParent as T;
            if (renderParent) {
                if (documentId) {
                    if (renderParent.layoutConstraint) {
                        const attr: string | undefined = LAYOUT_ANDROID.constraint[position];
                        if (attr) {
                            this.app(this.localizeString(attr), documentId);
                        }
                    }
                    else if (renderParent.layoutRelative) {
                        const attr: string | undefined = LAYOUT_ANDROID.relative[position];
                        if (attr) {
                            this.android(this.localizeString(attr), documentId);
                        }
                    }
                }
                else {
                    if (renderParent.layoutConstraint) {
                        const attr: string | undefined = LAYOUT_ANDROID.constraint[position];
                        if (attr) {
                            const value = this.app(this.localizeString(attr)) || this.app(attr);
                            return value !== 'parent' && value !== renderParent.documentId ? value : '';
                        }
                    }
                    else if (renderParent.layoutRelative) {
                        const attr: string | undefined = LAYOUT_ANDROID.relative[position];
                        if (attr) {
                            return this.android(this.localizeString(attr)) || this.android(attr);
                        }
                    }
                }
            }
            return '';
        }

        public horizontalBias() {
            const parent = this.documentParent;
            if (parent !== this) {
                const left = Math.max(0, this.linear.left - parent.box.left);
                const right = Math.max(0, parent.box.right - this.linear.right);
                return calculateBias(left, right, this.localSettings.constraintPercentPrecision);
            }
            return 0.5;
        }

        public verticalBias() {
            const parent = this.documentParent;
            if (parent !== this) {
                const top = Math.max(0, this.linear.top - parent.box.top);
                const bottom = Math.max(0, parent.box.bottom - this.linear.bottom);
                return calculateBias(top, bottom, this.localSettings.constraintPercentPrecision);
            }
            return 0.5;
        }

        public supported(obj: string, attr: string, result = {}): boolean {
            if (this.localSettings.targetAPI < BUILD_ANDROID.LATEST) {
                const deprecated: ObjectMap<CustomizationResult> = DEPRECATED_ANDROID[obj];
                if (deprecated && typeof deprecated[attr] === 'function') {
                    const valid = deprecated[attr](result, this.localSettings.targetAPI, this);
                    if (!valid || Object.keys(result).length) {
                        return valid;
                    }
                }
                for (let i = this.localSettings.targetAPI; i <= BUILD_ANDROID.LATEST; i++) {
                    const version = API_ANDROID[i];
                    if (version && version[obj] && version[obj][attr] !== undefined) {
                        const callback: CustomizationResult | boolean = version[obj][attr];
                        if (typeof callback === 'boolean') {
                            return callback;
                        }
                        else if (typeof callback === 'function') {
                            return callback(result, this.localSettings.targetAPI, this);
                        }
                    }
                }
            }
            return true;
        }

        public combine(...objs: string[]) {
            const result: string[] = [];
            for (const value of this._namespaces) {
                const obj: StringMap = this[`__${value}`];
                if (objs.length === 0 || objs.includes(value)) {
                    for (const attr in obj) {
                        result.push((value !== '_' ? `${value}:` : '') + `${attr}="${obj[attr]}"`);
                    }
                }
            }
            return result.sort((a, b) => a > b || b.startsWith('android:id=') ? 1 : -1);
        }

        public localizeString(value: string) {
            if (!this.hasBit('excludeProcedure', $enum.NODE_PROCEDURE.LOCALIZATION)) {
                return replaceRTL(value, this.localSettings.supportRTL, this.localSettings.targetAPI);
            }
            return value;
        }

        public hide(invisible?: boolean) {
            if (invisible) {
                this.android('visibility', 'invisible');
            }
            else {
                super.hide();
            }
        }

        public clone(id?: number, attributes = false, position = false): T {
            const node = new View(id || this.id, this.element);
            Object.assign(node.localSettings, this.localSettings);
            node.tagName = this.tagName;
            if (id !== undefined) {
                node.setControlType(this.controlName, this.containerType);
            }
            else {
                node.controlId = this.controlId;
                node.controlName = this.controlName;
                node.containerType = this.containerType;
            }
            node.alignmentType = this.alignmentType;
            node.depth = this.depth;
            node.visible = this.visible;
            node.excluded = this.excluded;
            node.rendered = this.rendered;
            node.renderDepth = this.renderDepth;
            node.renderParent = this.renderParent;
            node.documentParent = this.documentParent;
            node.documentRoot = this.documentRoot;
            if (this.length) {
                node.retain(this.duplicate());
            }
            if (attributes) {
                Object.assign(node.unsafe('boxReset'), this._boxReset);
                Object.assign(node.unsafe('boxAdjustment'), this._boxAdjustment);
                for (const value of this._namespaces) {
                    const obj: StringMap = this[`__${value}`];
                    for (const attr in obj) {
                        if (value === 'android' && attr === 'id') {
                            node.attr(value, attr, node.documentId);
                        }
                        else {
                            node.attr(value, attr, obj[attr]);
                        }
                    }
                }
            }
            if (position) {
                node.anchorClear();
                if (node.anchor('left', this.documentId)) {
                    Object.assign(node.unsafe('boxReset'), { marginLeft: 1 });
                    Object.assign(node.unsafe('boxAdjustment'), { marginLeft: 0 });
                }
                if (node.anchor('top', this.documentId)) {
                    Object.assign(node.unsafe('boxReset'), { marginTop: 1 });
                    Object.assign(node.unsafe('boxAdjustment'), { marginTop: 0 });
                }
            }
            node.inherit(this, 'initial', 'base', 'alignment', 'styleMap');
            Object.assign(node.unsafe('cached'), this.unsafe('cached'));
            return node;
        }

        public setControlType(controlName: string, containerType?: number) {
            if (containerType) {
                this.containerType = containerType;
            }
            else if (this.containerType === 0) {
                for (const global in CONTAINER_ANDROID) {
                    if (CONTAINER_ANDROID[global] === controlName) {
                        for (const local in CONTAINER_NODE) {
                            if (CONTAINER_NODE[CONTAINER_NODE[local]] === global) {
                                this.containerType = CONTAINER_NODE[local] as any;
                                break;
                            }
                        }
                        break;
                    }
                }
            }
            this.controlName = controlName;
            if (this.android('id') !== '') {
                this.controlId = stripId(this.android('id'));
            }
            if (this.controlId === '') {
                const element = this.element;
                let name: string | undefined;
                if (element) {
                    name = validateString(element.id || (<HTMLInputElement> element).name);
                    if (name === 'parent' || RESERVED_JAVA.includes(name)) {
                        name = `_${name}`;
                    }
                }
                this.controlId = $util.convertWord($Resource.generateId('android', name || $util.fromLastIndexOf(this.controlName, '.').toLowerCase(), name ? 0 : 1));
                this.android('id', this.documentId);
            }
        }

        public setLayout() {
            const parent = this.absoluteParent as View | undefined;
            const renderParent = this.renderParent as View | undefined;
            const renderChildren = this.renderChildren;
            let hasWidth = true;
            let hasHeight = true;
            if (this.documentBody) {
                if (!this.hasWidth && renderChildren.some(node => node.alignParent('right'))) {
                    this.android('layout_width', 'match_parent', false);
                }
                if (!this.hasHeight && renderChildren.some(node => node.alignParent('bottom'))) {
                    this.android('layout_height', 'match_parent', false);
                }
            }
            if (this.android('layout_height') === '') {
                if (!this.inlineStatic && this.has('height') || this.toInt('height') > 0 && !this.cssInitial('height')) {
                    const height = this.css('height');
                    if ($util.isLength(height)) {
                        const value = this.parseUnit(height, false);
                        this.android('layout_height', this.css('overflow') === 'hidden' && value < Math.floor(this.box.height) ? 'wrap_content' : $util.formatPX(value));
                    }
                    else if ($util.isPercent(height)) {
                        if (height === '100%') {
                            this.android('layout_height', 'match_parent');
                        }
                        else if (this.documentParent.has('height')) {
                            this.android('layout_height', $util.formatPX(Math.ceil(this.bounds.height) - this.contentBoxHeight));
                        }
                        else {
                            hasHeight = false;
                        }
                    }
                }
                else {
                    hasHeight = false;
                }
            }
            if (this.has('minHeight') && !this.constraint.minHeight) {
                this.android('minHeight', this.convertPX(this.css('minHeight'), false), false);
                this.android('layout_height', 'wrap_content', false);
            }
            else if (!hasHeight) {
                this.android('layout_height', 'wrap_content', false);
            }
            if (this.android('layout_width') === '') {
                if (!this.inlineStatic && this.has('width') || this.toInt('width') > 0 && !this.cssInitial('width')) {
                    const width = this.css('width');
                    if ($util.isLength(width)) {
                        const widthParent = renderParent ? $util.convertInt((renderParent as T).android('layout_width')) : 0;
                        const value = this.parseUnit(width);
                        if (parent === renderParent && widthParent > 0 && value >= widthParent) {
                            this.android('layout_width', 'match_parent');
                        }
                        else {
                            this.android('layout_width', $util.formatPX(value));
                        }
                    }
                    else if ($util.isPercent(width)) {
                        if (renderParent && renderParent.is(CONTAINER_NODE.GRID)) {
                            this.android('layout_width', '0px', false);
                            this.android('layout_columnWeight', (parseInt(width) / 100).toPrecision(2), false);
                        }
                        else if (width === '100%') {
                            this.android('layout_width', 'match_parent');
                        }
                        else {
                            this.android('layout_width', this.convertPX(width));
                        }
                    }
                    else {
                        hasWidth = false;
                    }
                }
                else {
                    hasWidth = false;
                }
            }
            if (this.has('minWidth') && !this.constraint.minWidth) {
                this.android('minWidth', this.convertPX(this.css('minWidth')), false);
                this.android('layout_width', 'wrap_content', false);
            }
            else if (!hasWidth) {
                if (parent && renderParent) {
                    const blockStatic = this.blockStatic && !this.has('maxWidth') && (this.htmlElement || this.svgElement);
                    if (this.plainText) {
                        this.android('layout_width', this.actualWidth > renderParent.box.width && this.multiline && this.alignParent('left') ? 'match_parent' : 'wrap_content', false);
                        return;
                    }
                    else if (renderChildren.some(node => Math.ceil(node.actualWidth) >= this.box.width && !node.autoMargin.horizontal && (renderParent.inlineWidth || node.inlineStatic && !node.plainText || $util.isLength(node.cssInitial('width'))))) {
                        this.android('layout_width', 'wrap_content', false);
                        return;
                    }
                    else if (
                        this.flexElement && renderParent.hasWidth ||
                        this.groupParent && renderChildren.some(node => !(node.plainText && node.multiline) && node.linear.width >= this.documentParent.box.width) ||
                        blockStatic && (this.documentBody || (
                            parent.documentBody ||
                            parent.has('width', $enum.CSS_STANDARD.PERCENT) ||
                            parent.blockStatic && (this.singleChild || this.alignedVertically(this.previousSiblings()))
                        )) ||
                        this.layoutFrame && ($NodeList.floated(renderChildren).size === 2 || renderChildren.some(node => node.blockStatic && (node.autoMargin.leftRight || node.rightAligned))))
                    {
                        this.android('layout_width', 'match_parent', false);
                        return;
                    }
                    else {
                        const wrap = !blockStatic && (
                            this.containerType < CONTAINER_NODE.INLINE ||
                            this.inlineFlow ||
                            !this.pageFlow ||
                            this.tableElement ||
                            this.flexElement ||
                            this.groupParent && this.renderChildren.every(node => node.inlineVertical) ||
                            renderParent.is(CONTAINER_NODE.GRID) ||
                            parent.flexElement ||
                            parent.gridElement
                        );
                        if ((!wrap || blockStatic) && (this.linear.width >= parent.box.width || this.layoutVertical && !this.autoMargin.horizontal || !this.documentRoot && renderChildren.some(node => node.layoutVertical && !node.autoMargin.horizontal && !node.hasWidth && !node.floating))) {
                            this.android('layout_width', 'match_parent', false);
                            return;
                        }
                    }
                }
                this.android('layout_width', 'wrap_content', false);
            }
        }

        public setAlignment() {
            const renderParent = this.renderParent as T;
            if (renderParent) {
                let textAlign = checkTextAlign(this.cssInitial('textAlign', true));
                if (this.pageFlow) {
                    let floating = '';
                    if (this.inlineVertical && (renderParent.layoutHorizontal && !renderParent.support.container.positionRelative || renderParent.is(CONTAINER_NODE.GRID))) {
                        const gravity = this.display === 'table-cell' ? 'gravity' : 'layout_gravity';
                        switch (this.cssInitial('verticalAlign', true)) {
                            case 'top':
                                this.mergeGravity(gravity, 'top');
                                break;
                            case 'middle':
                                this.mergeGravity(gravity, 'center_vertical');
                                break;
                            case 'bottom':
                                this.mergeGravity(gravity, 'bottom');
                                break;
                        }
                    }
                    if (!this.blockWidth && (renderParent.layoutVertical || this.documentRoot && (this.layoutVertical || this.layoutFrame))) {
                        if (this.floating) {
                            this.mergeGravity('layout_gravity', this.float);
                        }
                        else {
                            setAutoMargin(this);
                        }
                    }
                    if (this.hasAlign($enum.NODE_ALIGNMENT.FLOAT)) {
                        if (this.hasAlign($enum.NODE_ALIGNMENT.RIGHT) || this.renderChildren.length && this.renderChildren.every(node => node.rightAligned)) {
                            floating = 'right';
                        }
                        else if (this.groupParent && !this.renderChildren.some(item => item.float === 'right')) {
                            floating = 'left';
                        }
                    }
                    if (renderParent.layoutFrame && !setAutoMargin(this)) {
                        floating = this.floating ? this.float : floating;
                        if (floating !== '' && (renderParent.inlineWidth || this.singleChild && !renderParent.documentRoot)) {
                            renderParent.mergeGravity('layout_gravity', floating);
                        }
                        if (renderParent.display === 'table-cell' && this.singleChild) {
                            this.mergeGravity('layout_gravity', 'center_vertical');
                        }
                    }
                    if (floating !== '') {
                        if (this.blockWidth) {
                            if (textAlign === '' || floating === 'right') {
                                textAlign = floating;
                            }
                        }
                        else {
                            this.mergeGravity('layout_gravity', floating);
                        }
                    }
                }
                else {
                    setAutoMargin(this);
                }
                const textAlignParent = checkTextAlign(this.cssAscend('textAlign'));
                if (textAlignParent !== '' && textAlignParent !== 'left' && textAlignParent !== 'start') {
                    if (renderParent.layoutFrame && this.pageFlow && !this.floating && !this.autoMargin.horizontal && !this.blockWidth) {
                        this.mergeGravity('layout_gravity', textAlignParent);
                    }
                    if (!this.imageElement && textAlign === '') {
                        textAlign = textAlignParent;
                    }
                }
                if (textAlign !== '' && !this.layoutConstraint) {
                    this.mergeGravity('gravity', textAlign);
                }
            }
        }

        public mergeGravity(attr: string, ...alignment: string[]) {
            if (this.layoutFrame && attr === 'gravity') {
                return '';
            }
            const direction = new Set<string>();
            const previousValue = this.android(attr);
            if (previousValue !== '') {
                for (const value of previousValue.split('|')) {
                    direction.add(value.trim());
                }
            }
            for (const value of alignment) {
                if (value !== '') {
                    direction.add(this.localizeString(value.trim()));
                }
            }
            let result = '';
            switch (direction.size) {
                case 0:
                    break;
                case 1:
                    result = checkTextAlign(direction.values().next().value);
                default:
                    let x = '';
                    let y = '';
                    let z = '';
                    for (const value of ['center', 'fill']) {
                        const horizontal = `${value}_horizontal`;
                        const vertical = `${value}_vertical`;
                        if (direction.has(value) || direction.has(horizontal) && direction.has(vertical)) {
                            direction.delete(horizontal);
                            direction.delete(vertical);
                            direction.add(value);
                        }
                    }
                    for (const value of direction.values()) {
                        switch (value) {
                            case 'justify':
                            case 'initial':
                            case 'inherit':
                                continue;
                            case 'left':
                            case 'start':
                            case 'right':
                            case 'end':
                            case 'center_horizontal':
                                x = value;
                                break;
                            case 'top':
                            case 'bottom':
                            case 'center_vertical':
                                y = value;
                                break;
                            default:
                                z += (z !== '' ? '|' : '') + value;
                                break;
                        }
                    }
                    const gravity = x !== '' && y !== '' ? `${x}|${y}` : x || y;
                    result = gravity + (z !== '' ? (gravity !== '' ? '|' : '') + z : '');
            }
            if (result !== '') {
                return this.android(attr, result);
            }
            else {
                this.delete('android', attr);
                return '';
            }
        }

        public setLineHeight(value: number) {
            const offset = value - (this.hasHeight ? this.height : this.bounds.height);
            if (offset > 0) {
                this.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, Math.floor(offset / 2) - (this.inlineVertical ? $util.convertInt(this.verticalAlign) : 0));
                this.modifyBox($enum.BOX_STANDARD.MARGIN_BOTTOM, Math.ceil(offset / 2));
            }
            else if (!this.hasHeight && !this.multiline) {
                this.android('minHeight', $util.formatPX(value));
                this.mergeGravity('gravity', 'center_vertical');
            }
        }

        public applyOptimizations() {
            if (this.renderParent) {
                this.autoSizeBoxModel();
                this.alignHorizontalLayout();
                this.alignVerticalLayout();
                switch (this.cssAscend('visibility', true)) {
                    case 'hidden':
                    case 'collapse':
                        this.hide(true);
                        break;
                }
            }
        }

        public applyCustomizations(overwrite = true) {
            const setCustomization = (build: ExternalData, tagName: string) => {
                const assign = build.assign[tagName];
                if (assign) {
                    for (const obj in assign) {
                        for (const attr in assign[obj]) {
                            this.attr(obj, attr, assign[obj][attr], overwrite);
                        }
                    }
                }
            };
            setCustomization(API_ANDROID[0], this.tagName);
            setCustomization(API_ANDROID[0], this.controlName);
            const targetBuild = API_ANDROID[this.localSettings.targetAPI];
            if (targetBuild) {
                setCustomization(targetBuild, this.tagName);
                setCustomization(targetBuild, this.controlName);
            }
        }

        public setBoxSpacing() {
            const renderParent = this.renderParent;
            if (renderParent) {
                const supported = this.supported('android', 'layout_marginHorizontal');
                const setBoxModel = (attrs: string[], prefix: string, mergeable = true) => {
                    const [top, right, bottom, left] = attrs;
                    const boxModel: ObjectMap<number> = {};
                    let mergeAll = 0;
                    let mergeHorizontal = 0;
                    let mergeVertical = 0;
                    for (const attr of attrs) {
                        boxModel[attr] = this._boxAdjustment[attr] + (this._boxReset[attr] === 0 && !(attr === 'marginRight' && this.inline && this.bounds.right >= this.documentParent.box.right) ? this[attr] : 0);
                    }
                    if (supported && mergeable) {
                        if (boxModel[top] === boxModel[right] && boxModel[right] === boxModel[bottom] && boxModel[bottom] === boxModel[left]) {
                            mergeAll = boxModel[top];
                        }
                        else {
                            if (boxModel[left] === boxModel[right]) {
                                mergeHorizontal = boxModel[left];
                            }
                            if (boxModel[top] === boxModel[bottom]) {
                                mergeVertical = boxModel[top];
                            }
                        }
                    }
                    if (mergeAll !== 0) {
                        this.android(prefix, $util.formatPX(mergeAll));
                    }
                    else {
                        if (mergeHorizontal !== 0) {
                            this.android(`${prefix}Horizontal`, $util.formatPX(mergeHorizontal));
                        }
                        else {
                            if (boxModel[left] !== 0) {
                                this.android(prefix + this.localizeString('Left'), $util.formatPX(boxModel[left]));
                            }
                            if (boxModel[right] !== 0) {
                                this.android(prefix + this.localizeString('Right'), $util.formatPX(boxModel[right]));
                            }
                        }
                        if (mergeVertical !== 0) {
                            this.android(`${prefix}Vertical`, $util.formatPX(mergeVertical));
                        }
                        else {
                            if (boxModel[top] !== 0) {
                                this.android(`${prefix}Top`, $util.formatPX(boxModel[top]));
                            }
                            if (boxModel[bottom] !== 0) {
                                this.android(`${prefix}Bottom`, $util.formatPX(boxModel[bottom]));
                            }
                        }
                    }
                };
                setBoxModel($css.BOX_MARGIN, 'layout_margin', !renderParent.is(CONTAINER_NODE.GRID));
                setBoxModel($css.BOX_PADDING, 'padding');
            }
        }

        private autoSizeBoxModel() {
            if (!this.hasBit('excludeProcedure', $enum.NODE_PROCEDURE.AUTOFIT)) {
                const renderParent = this.renderParent as T;
                let layoutWidth = $util.convertInt(this.android('layout_width'));
                let layoutHeight = $util.convertInt(this.android('layout_height'));
                if (this.is(CONTAINER_NODE.BUTTON) && layoutHeight === 0) {
                    if (!this.has('minHeight')) {
                        this.android('layout_height', $util.formatPX(this.bounds.height + (this.css('borderStyle') === 'outset' ? $util.convertInt(this.css('borderWidth')) : 0)));
                    }
                }
                else if (this.is(CONTAINER_NODE.LINE)) {
                    if (this.tagName !== 'HR' && layoutHeight > 0 && this.toInt('height', true) > 0) {
                        this.android('layout_height', $util.formatPX(layoutHeight + this.borderTopWidth + this.borderBottomWidth));
                    }
                }
                else if (renderParent) {
                    let borderWidth = false;
                    if (this.tableElement) {
                        borderWidth = this.css('boxSizing') === 'content-box' || $util.isUserAgent($util.USER_AGENT.FIREFOX | $util.USER_AGENT.EDGE);
                    }
                    else if (this.styleElement && !this.hasBit('excludeResource', $enum.NODE_RESOURCE.BOX_SPACING)) {
                        if (this.css('boxSizing') !== 'border-box' && !renderParent.tableElement) {
                            if (layoutWidth > 0 && this.toInt('width', !this.imageElement) > 0 && this.contentBoxWidth > 0) {
                                this.android('layout_width', $util.formatPX(layoutWidth + this.contentBoxWidth));
                            }
                            else if (this.imageElement && this.singleChild) {
                                layoutWidth = $util.convertInt(renderParent.android('layout_width'));
                                if (layoutWidth > 0) {
                                    renderParent.android('layout_width', $util.formatPX(layoutWidth + this.marginLeft + this.contentBoxWidth));
                                }
                            }
                            if (layoutHeight > 0 && this.toInt('height', !this.imageElement) > 0 && this.contentBoxHeight > 0) {
                                this.android('layout_height', $util.formatPX(layoutHeight + this.contentBoxHeight));
                            }
                            else if (this.imageElement && this.singleChild) {
                                layoutHeight = $util.convertInt(renderParent.android('layout_height'));
                                if (layoutHeight > 0) {
                                    renderParent.android('layout_height', $util.formatPX(layoutHeight + this.marginTop + this.contentBoxHeight));
                                }
                            }
                        }
                        borderWidth = true;
                    }
                    if (borderWidth && this.visibleStyle.borderWidth) {
                        this.modifyBox($enum.BOX_STANDARD.PADDING_LEFT, this.borderLeftWidth);
                        this.modifyBox($enum.BOX_STANDARD.PADDING_RIGHT, this.borderRightWidth);
                        this.modifyBox($enum.BOX_STANDARD.PADDING_TOP, this.borderTopWidth);
                        this.modifyBox($enum.BOX_STANDARD.PADDING_BOTTOM, this.borderBottomWidth);
                    }
                }
            }
        }

        private alignHorizontalLayout() {
            if (this.layoutHorizontal) {
                if (this.layoutLinear) {
                    const renderChildren = this.renderChildren;
                    let baseline: T | undefined;
                    if (renderChildren.some(node => node.floating) && !renderChildren.some(node => node.imageElement && node.baseline)) {
                        this.android('baselineAligned', 'false');
                    }
                    else {
                        baseline = $NodeList.baseline(renderChildren.filter(node => node.baseline && !node.layoutRelative && !node.layoutConstraint), true)[0];
                        if (baseline) {
                            this.android('baselineAlignedChildIndex', renderChildren.indexOf(baseline).toString());
                        }
                    }
                    let lineHeight = this.lineHeight;
                    this.renderEach(node => lineHeight = Math.max(lineHeight, node.lineHeight));
                    if (lineHeight > 0) {
                        this.setLineHeight(lineHeight);
                    }
                }
                if (!this.hasAlign($enum.NODE_ALIGNMENT.MULTILINE) && !this.hasAlign($enum.NODE_ALIGNMENT.RIGHT) && !this.visibleStyle.background) {
                    const firstChild = this.find(node => node.float === 'left') || this.renderChildren[0];
                    if (firstChild && firstChild.marginLeft < 0) {
                        const value = Math.abs(firstChild.marginLeft);
                        if (value === this.marginLeft) {
                            this.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, null);
                            firstChild.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, null);
                        }
                        else if (value < this.marginLeft) {
                            this.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, firstChild.marginLeft);
                            firstChild.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, null);
                        }
                        else {
                            this.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, null);
                            firstChild.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, this.marginLeft);
                        }
                    }
                }
            }
        }

        private alignVerticalLayout() {
            const renderParent = this.renderParent as T;
            if (!renderParent.layoutHorizontal) {
                const lineHeight = this.lineHeight;
                if (lineHeight > 0) {
                    const setMinHeight = () => {
                        const value = lineHeight + this.contentBoxHeight;
                        if (this.toInt('minHeight') < value) {
                            this.android('minHeight', $util.formatPX(value));
                            this.mergeGravity('gravity', 'center_vertical');
                        }
                    };
                    if (this.length === 0) {
                        if (!this.layoutHorizontal) {
                            if (this.support.lineHeight || this.inlineStatic && this.visibleStyle.background) {
                                this.setLineHeight(lineHeight);
                            }
                            else {
                                setMinHeight();
                            }
                        }
                    }
                    else if (this.layoutVertical) {
                        this.renderEach((node: T) => {
                            if (!node.layoutHorizontal) {
                                node.setLineHeight(lineHeight);
                            }
                        });
                    }
                }
            }
        }

        get documentId() {
            return this.controlId ? `@+id/${this.controlId}` : '';
        }

        set anchored(value) {
            this.constraint.horizontal = value;
            this.constraint.vertical = value;
        }
        get anchored() {
            return this.constraint.horizontal && this.constraint.vertical;
        }

        set containerType(value) {
            this._containerType = value;
        }
        get containerType() {
            if (this._containerType === 0) {
                const value = ELEMENT_ANDROID[this.tagName] || 0;
                if (value !== 0) {
                    this._containerType = value;
                }
            }
            return this._containerType || 0;
        }

        get layoutFrame() {
            return this.is(CONTAINER_NODE.FRAME);
        }
        get layoutLinear() {
            return this.is(CONTAINER_NODE.LINEAR);
        }
        get layoutRelative() {
            return this.is(CONTAINER_NODE.RELATIVE);
        }
        get layoutConstraint() {
            return this.is(CONTAINER_NODE.CONSTRAINT);
        }

        get support() {
            const cached: CachedValue<T> = this.unsafe('cached') || {};
            if (cached.support === undefined) {
                cached.support = {
                    lineHeight: this.textElement && this.supported('android', 'lineHeight'),
                    container: {
                        positionRelative: this.layoutRelative || this.layoutConstraint
                    }
                };
            }
            return cached.support;
        }

        get inlineWidth() {
            return this.android('layout_width') === 'wrap_content';
        }
        get inlineHeight() {
            return this.android('layout_height') === 'wrap_content';
        }

        get blockWidth() {
            return this.android('layout_width') === 'match_parent';
        }
        get blockHeight() {
            return this.android('layout_height') === 'match_parent';
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

        get fontSize() {
            if (this._fontSize === 0) {
                this._fontSize = $util.parseUnit(this.css('fontSize')) || 16;
            }
            return this._fontSize;
        }

        set localSettings(value) {
            Object.assign(this._localSettings, value);
        }
        get localSettings() {
            return this._localSettings;
        }
    };
};