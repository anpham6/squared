import { CachedValue } from '../../src/base/@types/node';
import { CustomizationResult } from './@types/application';
import { Constraint, LocalSettings } from './@types/node';

import { AXIS_ANDROID, CONTAINER_ANDROID, ELEMENT_ANDROID, LAYOUT_ANDROID, RESERVED_JAVA } from './lib/constant';
import { API_ANDROID, DEPRECATED_ANDROID } from './lib/customization';
import { BUILD_ANDROID, CONTAINER_NODE } from './lib/enumeration';
import { localizeString, stripId } from './lib/util';

import $NodeList = squared.base.NodeList;
import $Resource = squared.base.Resource;

type T = android.base.View;

const $enum = squared.base.lib.enumeration;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $util = squared.lib.util;

const REGEXP_DATASETATTR = /^attr[A-Z]/;
const REGEXP_FORMATTED = /^(?:([a-z]+):)?(\w+)="((?:@+?[a-z]+\/)?.+)"$/;
const REGEXP_VALIDSTRING = /[^\w$\-_.]/g;

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
        if (node.autoMargin.leftRight) {
            if (isSingleFrame(node)) {
                (node.renderChildren[0] as T).mergeGravity('layout_gravity', 'center_horizontal');
            }
            else {
                alignment.push('center_horizontal');
            }
        }
        else if (node.autoMargin.left) {
            if (isSingleFrame(node)) {
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
            const attr = node.blockWidth || !node.pageFlow ? 'gravity' : 'layout_gravity';
            for (const value of alignment) {
                node.mergeGravity(attr, value);
            }
            return true;
        }
    }
    return false;
}

function calculateBias(start: number, end: number, accuracy = 4) {
    if (start === 0) {
        return 0;
    }
    else if (end === 0) {
        return 1;
    }
    else {
        return parseFloat(Math.max(start / (start + end), 0).toPrecision(accuracy));
    }
}

const isSingleFrame = (node: T) => node.documentRoot && node.layoutFrame && node.length === 1 && node.has('maxWidth');

const validateString = (value: string) => value ? value.trim().replace(REGEXP_VALIDSTRING, '_') : '';

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
        protected _documentParent?: T;
        protected readonly _boxAdjustment: BoxModel = $dom.newBoxModel();
        protected readonly _boxReset: BoxModel = $dom.newBoxModel();

        private _containerType = 0;
        private _localSettings: LocalSettings = {
            targetAPI: BUILD_ANDROID.LATEST,
            supportRTL: false,
            floatPrecision: 3
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
            const match = value.match(REGEXP_FORMATTED);
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
                return calculateBias(left, right, this.localSettings.floatPrecision);
            }
            return 0.5;
        }

        public verticalBias() {
            const parent = this.documentParent;
            if (parent !== this) {
                const top = Math.max(0, this.linear.top - parent.box.top);
                const bottom = Math.max(0, parent.box.bottom - this.linear.bottom);
                return calculateBias(top, bottom, this.localSettings.floatPrecision);
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
            if (this.hasProcedure($enum.NODE_PROCEDURE.LOCALIZATION)) {
                return localizeString(value, this.localSettings.supportRTL, this.localSettings.targetAPI);
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
            this.controlName = controlName;
            this.containerType = containerType || CONTAINER_NODE.UNKNOWN;
            this.controlId = stripId(this.android('id'));
            if (this.controlId === '') {
                let name: string | undefined;
                if (this.naturalElement) {
                    const inputName = (<HTMLInputElement> this.element).name;
                    name = validateString(this.elementId || (typeof inputName === 'string' ? inputName : ''));
                    if (name === 'parent' || RESERVED_JAVA.includes(name)) {
                        name = `_${name}`;
                    }
                }
                this.controlId = $util.convertWord($Resource.generateId('android', name || $util.fromLastIndexOf(this.controlName, '.').toLowerCase(), name ? 0 : 1));
                this.android('id', this.documentId);
            }
        }

        public setLayout() {
            const renderParent = this.renderParent as T | undefined;
            if (renderParent) {
                const renderChildren = this.renderChildren;
                const parent = this.groupParent ? $NodeList.actualParent(renderChildren) : this.absoluteParent as T | undefined;
                let hasWidth = true;
                let hasHeight = true;
                this.setVisibility();
                if (this.documentBody) {
                    if (!this.hasWidth && renderChildren.some(node => node.alignParent('right')) || this.visibleStyle.backgroundColor || this.borderRightWidth > 0) {
                        this.android('layout_width', 'match_parent', false);
                    }
                    if (!this.hasHeight && renderChildren.some(node => node.alignParent('bottom')) || this.visibleStyle.backgroundColor || this.borderBottomWidth > 0) {
                        this.android('layout_height', 'match_parent', false);
                    }
                }
                if (this.android('layout_height') === '') {
                    if (!this.inlineStatic && this.has('height') || this.toInt('height') > 0 && !this.cssInitial('height')) {
                        const height = this.css('height');
                        let value = -1;
                        if ($util.isLength(height)) {
                            value = this.parseUnit(height, false);
                            if (this.positionStatic && !this.layoutFrame && this.documentParent.css('overflow') !== 'hidden') {
                                const heightParent = $util.convertInt(renderParent.android('layout_height'));
                                if (heightParent > 0 && value >= heightParent) {
                                    if (this.singleChild) {
                                        renderParent.android('layout_height', 'wrap_content');
                                    }
                                    else {
                                        this.android('layout_height', 'match_parent');
                                        value = -1;
                                    }
                                }
                            }
                        }
                        else if ($util.isPercent(height)) {
                            if (height === '100%') {
                                this.android('layout_height', 'match_parent');
                            }
                            else if (this.documentParent.has('height')) {
                                value = Math.ceil(this.bounds.height) - this.contentBoxHeight;
                            }
                            else {
                                hasHeight = false;
                            }
                        }
                        if (value !== -1) {
                            if (this.display.startsWith('table') && value < Math.floor(this.bounds.height)) {
                                if (!this.has('minHeight')) {
                                    this.android('minHeight', $util.formatPX(value));
                                }
                                this.android('layout_height', 'wrap_content');
                            }
                            else {
                                this.android('layout_height', $util.formatPX(value));
                            }
                        }
                    }
                    else {
                        hasHeight = false;
                    }
                }
                if (this.android('layout_width') === '') {
                    if (!this.inlineStatic && this.has('width') || this.toInt('width') > 0 && !this.cssInitial('width')) {
                        const width = this.css('width');
                        let value = -1;
                        if ($util.isLength(width)) {
                            value = this.parseUnit(width);
                            if (this.positionStatic && !this.layoutFrame && this.documentParent.css('overflow') !== 'hidden') {
                                const widthParent = $util.convertInt(renderParent.android('layout_width'));
                                if (widthParent > 0 && value >= widthParent) {
                                    if (this.singleChild) {
                                        renderParent.android('layout_width', 'wrap_content');
                                    }
                                    else {
                                        this.android('layout_width', 'match_parent');
                                        value = -1;
                                    }
                                }
                            }
                        }
                        else if ($util.isPercent(width)) {
                            if (renderParent.is(CONTAINER_NODE.GRID)) {
                                this.android('layout_width', '0px', false);
                                this.android('layout_columnWeight', (parseInt(width) / 100).toPrecision(this.localSettings.floatPrecision), false);
                            }
                            else if (width === '100%') {
                                this.android('layout_width', 'match_parent');
                            }
                            else {
                                value = this.parseUnit(width);
                            }
                        }
                        else {
                            hasWidth = false;
                        }
                        if (value !== -1) {
                            if (this.display.startsWith('table') && value < Math.floor(this.bounds.width)) {
                                if (!this.has('minWidth')) {
                                    this.android('minWidth', $util.formatPX(value));
                                }
                                this.android('layout_width', 'wrap_content');
                            }
                            else {
                                this.android('layout_width', $util.formatPX(value));
                            }
                        }
                    }
                    else {
                        hasWidth = false;
                    }
                }
                if (!hasWidth && parent) {
                    const blockStatic = this.blockStatic && (this.htmlElement || this.svgElement) && (!this.has('maxWidth') || this.some(node => node.blockStatic));
                    if (this.plainText) {
                        if (this.multiline && renderParent.layoutFrame && renderParent.renderChildren.length > 1 && renderParent.ascend(true).some(node => !node.inlineStatic && node.has('width'))) {
                            let width = renderParent.actualWidth;
                            renderParent.renderEach(node => {
                                if (node !== this) {
                                    width -= node.actualWidth;
                                }
                            });
                            if (width > 0) {
                                this.android('maxWidth', $util.formatPX(width));
                            }
                        }
                        this.android('layout_width', this.actualWidth > renderParent.box.width && this.multiline && this.alignParent('left') ? 'match_parent' : 'wrap_content', false);
                        hasWidth = true;
                    }
                    else {
                        let inlineVertical = 0;
                        let blockVertical = 0;
                        let boxHorizotnal = 0;
                        if (this.groupParent) {
                            for (const node of renderChildren) {
                                if (node.inlineVertical) {
                                    inlineVertical++;
                                }
                                if (node.blockStatic) {
                                    blockVertical++;
                                }
                                if (!node.plainText && !node.multiline && node.linear.width >= this.documentParent.box.width) {
                                    boxHorizotnal++;
                                }
                            }
                        }
                        if (!this.pageFlow ||
                            this.inputElement ||
                            renderParent.is(CONTAINER_NODE.GRID) ||
                            this.groupParent && inlineVertical === renderChildren.length ||
                            this.tableElement || parent.gridElement || parent.flexElement)
                        {
                            this.android('layout_width', 'wrap_content', false);
                            hasWidth = true;
                        }
                        else if (
                            blockStatic && (
                                this.linear.width >= parent.box.width ||
                                this.visibleStyle.background ||
                                this.layoutVertical && !this.autoMargin.horizontal ||
                                this.documentBody ||
                                this.gridElement ||
                                this.flexElement ||
                                parent.documentBody ||
                                parent.has('width', $enum.CSS_STANDARD.PERCENT) ||
                                parent.blockStatic && (this.singleChild || this.alignedVertically(this.previousSiblings()) ||
                                !this.documentRoot && renderChildren.some(node => node.layoutVertical && !node.autoMargin.horizontal && !node.hasWidth && !node.floating))
                            ) ||
                            this.groupParent && (boxHorizotnal > 0 || this.layoutVertical && blockVertical > 0) ||
                            this.layoutFrame && (this.hasAlign($enum.NODE_ALIGNMENT.COLUMN) || $NodeList.linearData(renderChildren, true).floated.size === 2 || renderChildren.some(node => node.blockStatic && (node.autoMargin.leftRight || node.hasAlign($enum.NODE_ALIGNMENT.AUTO_LAYOUT) || node.rightAligned))))
                        {
                            this.android('layout_width', 'match_parent', false);
                            hasWidth = true;
                        }
                    }
                }
                if (this.has('minWidth') && !this.constraint.minWidth) {
                    this.android('minWidth', this.convertPX(this.css('minWidth')), false);
                    this.android('layout_width', 'wrap_content', false);
                }
                else if (!hasWidth) {
                    this.android('layout_width', 'wrap_content', false);
                }
                if (this.has('minHeight') && !this.constraint.minHeight) {
                    this.android('minHeight', this.convertPX(this.css('minHeight'), false), false);
                    this.android('layout_height', 'wrap_content', false);
                }
                else if (!hasHeight) {
                    this.android('layout_height', 'wrap_content', false);
                }
                if (this.layoutFrame && this.hasAlign($enum.NODE_ALIGNMENT.FLOAT) && this.length > 1 && this.ascend(true).some(node => node.has('width'))) {
                    this.each(node => {
                        const target = node.innerChild || node;
                        if (target.element && !target.has('width')) {
                            node.css('width', $util.formatPX(node.bounds.width));
                        }
                    });
                }
            }
        }

        public setAlignment() {
            const renderParent = this.renderParent as T;
            if (renderParent) {
                const alignFloat = this.hasAlign($enum.NODE_ALIGNMENT.FLOAT);
                const node = (this.outerParent || this) as T;
                const outerRenderParent = (node.renderParent || renderParent) as T;
                let textAlign = checkTextAlign(this.cssInitial('textAlign', true));
                let textAlignParent = checkTextAlign(this.cssAscend('textAlign'));
                if (textAlign === '' && this.groupParent && !alignFloat) {
                    const actualParent = $NodeList.actualParent(this.renderChildren);
                    if (actualParent) {
                        textAlign = checkTextAlign(actualParent.cssInitial('textAlign', true));
                    }
                }
                if (this.pageFlow) {
                    let floating = '';
                    if (this.inlineVertical && (outerRenderParent.layoutHorizontal && !outerRenderParent.support.container.positionRelative || outerRenderParent.is(CONTAINER_NODE.GRID))) {
                        let gravity: string;
                        let target: T;
                        if (this.display === 'table-cell') {
                            gravity = 'gravity';
                            target = this;
                        }
                        else {
                            gravity = 'layout_gravity';
                            target = node;
                        }
                        switch (this.cssInitial('verticalAlign', true)) {
                            case 'top':
                                target.mergeGravity(gravity, 'top');
                                break;
                            case 'middle':
                                target.mergeGravity(gravity, 'center_vertical');
                                break;
                            case 'bottom':
                                target.mergeGravity(gravity, 'bottom');
                                break;
                        }
                    }
                    if (!this.blockWidth && (outerRenderParent.layoutVertical || this.documentRoot && (this.layoutVertical || this.layoutFrame))) {
                        if (this.floating) {
                            node.mergeGravity('layout_gravity', this.float);
                        }
                        else if (!setAutoMargin(node)) {
                            if (textAlign !== '' && this.hasWidth && !this.blockStatic) {
                                node.mergeGravity('layout_gravity', textAlign, false);
                            }
                        }
                    }
                    if (alignFloat) {
                        if (this.hasAlign($enum.NODE_ALIGNMENT.RIGHT) || this.renderChildren.length && this.renderChildren.every(item => item.rightAligned)) {
                            floating = 'right';
                        }
                        else if (this.groupParent && !this.renderChildren.some(item => item.float === 'right')) {
                            floating = 'left';
                        }
                    }
                    if (renderParent.layoutFrame && this.innerChild === undefined) {
                        if (!setAutoMargin(node)) {
                            floating = this.floating ? this.float : floating;
                            if (floating !== '' && (renderParent.inlineWidth || this.singleChild && !renderParent.documentRoot)) {
                                renderParent.mergeGravity('layout_gravity', floating);
                            }
                        }
                        if (renderParent.display === 'table-cell' && this.singleChild) {
                            let gravity: string | undefined;
                            switch (renderParent.css('verticalAlign')) {
                                case 'top':
                                    gravity = 'top';
                                    break;
                                case 'bottom':
                                    gravity = 'bottom';
                                    break;
                                default:
                                    gravity = 'center_vertical';
                                    break;
                            }
                            node.mergeGravity('layout_gravity', gravity);
                        }
                    }
                    if (floating !== '') {
                        if (this.blockWidth) {
                            if (textAlign === '' || floating === 'right') {
                                textAlign = floating;
                            }
                        }
                        else {
                            node.mergeGravity('layout_gravity', floating);
                        }
                    }
                    else if (setAutoMargin(this) && textAlign !== '') {
                        textAlignParent = '';
                    }
                }
                if (textAlign === '' && textAlignParent !== '') {
                    switch (textAlignParent) {
                        case 'left':
                        case 'start':
                            break;
                        default:
                            if (outerRenderParent.layoutFrame) {
                                if (this.pageFlow && !alignFloat) {
                                    node.mergeGravity('layout_gravity', textAlignParent, false);
                                }
                            }
                            else if (this.blockStatic && !this.floating && !this.autoMargin.horizontal) {
                                node.mergeGravity('layout_gravity', 'left', false);
                            }
                            textAlign = textAlignParent;
                            break;
                    }
                }
                if (textAlign !== '' && !(this.layoutFrame || this.layoutConstraint || !this.textElement && this.length === 0)) {
                    this.mergeGravity('gravity', textAlign);
                }
            }
        }

        public mergeGravity(attr: string, alignment: string, overwrite = true) {
            const direction = new Set<string>();
            const stored = this.android(attr);
            if (stored !== '') {
                for (const value of stored.split('|')) {
                    direction.add(value);
                }
            }
            direction.add(this.localizeString(alignment));
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
                                if (x === '' || overwrite) {
                                    x = value;
                                }
                                break;
                            case 'top':
                            case 'bottom':
                            case 'center_vertical':
                                if (y === '' || overwrite) {
                                    y = value;
                                }
                                break;
                            default:
                                z += (z !== '' ? '|' : '') + value;
                                break;
                        }
                    }
                    result = x !== '' && y !== '' ? `${x}|${y}` : x || y;
                    if (z !== '') {
                        result += (result !== '' ? '|' : '') + z;
                    }
            }
            if (result !== '') {
                return this.android(attr, result);
            }
            else {
                this.delete('android', attr);
                return '';
            }
        }

        public applyOptimizations() {
            if (this.renderParent) {
                this.autoSizeBoxModel();
                this.alignHorizontalLayout();
                this.setLineHeight();
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
            const supported = this.localSettings.targetAPI >= BUILD_ANDROID.OREO;
            const setBoxModel = (attrs: string[], prefix: string, mergeable = true) => {
                const [top, right, bottom, left] = attrs;
                const boxModel: ObjectMap<number> = {};
                let mergeAll = 0;
                let mergeHorizontal = 0;
                let mergeVertical = 0;
                for (const attr of attrs) {
                    boxModel[attr] = this._boxAdjustment[attr];
                    if (this._boxReset[attr] === 0) {
                        let value = this[attr];
                        if (value !== 0) {
                            if (attr === 'marginRight' && this.inline) {
                                const boxRight = this.documentParent.box.right;
                                if (Math.floor(this.bounds.right) > boxRight) {
                                    if (this.textElement && !this.multiline) {
                                        this.android('singleLine', 'true');
                                    }
                                    continue;
                                }
                                else if (this.bounds.right + value > boxRight) {
                                    value = Math.max(0, boxRight - this.bounds.right);
                                }
                            }
                            boxModel[attr] += value;
                        }
                    }
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
                            this.android(this.localizeString(prefix + 'Left'), $util.formatPX(boxModel[left]));
                        }
                        if (boxModel[right] !== 0) {
                            this.android(this.localizeString(prefix + 'Right'), $util.formatPX(boxModel[right]));
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
            setBoxModel($css.BOX_MARGIN, 'layout_margin', this.renderParent === undefined || !this.renderParent.is(CONTAINER_NODE.GRID));
            setBoxModel($css.BOX_PADDING, 'padding');
        }

        public extractAttributes(depth: number) {
            if (this.dir === 'rtl') {
                this.android(this.length ? 'layoutDirection' : 'textDirection', 'rtl');
            }
            if (this.styleElement) {
                const dataset = $css.getDataSet(<HTMLElement> this.element, 'android');
                for (const name in dataset) {
                    const obj = name === 'attr' ? 'android' : REGEXP_DATASETATTR.test(name) ? $util.capitalize(name.substring(4), false) : '';
                    if (obj !== '') {
                        for (const values of dataset[name].split(';')) {
                            const [key, value] = values.split('::');
                            if (key && value) {
                                this.attr(obj, key, value);
                            }
                        }
                    }
                }
            }
            const indent = '\t'.repeat(depth);
            let output = '';
            for (const value of this.combine()) {
                output += `\n${indent + value}`;
            }
            return output;
        }

        private autoSizeBoxModel() {
            if (this.hasProcedure($enum.NODE_PROCEDURE.AUTOFIT)) {
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
                    else if (this.styleElement && this.hasResource($enum.NODE_RESOURCE.BOX_SPACING)) {
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
                        if (baseline && baseline.containerType <= CONTAINER_NODE.INLINE) {
                            this.android('baselineAlignedChildIndex', renderChildren.indexOf(baseline).toString());
                            baseline.baselineActive = true;
                        }
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

        private setLineHeight() {
            const lineHeight = this.lineHeight;
            if (lineHeight > 0) {
                if (this.textElement && this.multiline) {
                    if (this.localSettings.targetAPI >= BUILD_ANDROID.PIE) {
                        this.android('lineHeight', $util.formatPX(lineHeight));
                    }
                    else {
                        const spacing = lineHeight - this.fontSize;
                        if (spacing > 0) {
                            this.android('lineSpacingExtra', $util.formatPX(spacing));
                        }
                    }
                }
                else {
                    const hasLineHeight = this.has('lineHeight');
                    if (this.length || hasLineHeight) {
                        const setMarginOffset = (node: T, bottom = true) => {
                            if (hasLineHeight && node === this) {
                                const offset = lineHeight - (node.hasHeight ? node.height : node.bounds.height);
                                if (offset > 0) {
                                    node.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, Math.floor(offset / 2));
                                    node.modifyBox($enum.BOX_STANDARD.MARGIN_BOTTOM, Math.ceil(offset / 2));
                                }
                                else {
                                    if (!node.has('height') && lineHeight > node.toInt('minHeight')) {
                                        node.android('minHeight', $util.formatPX(lineHeight));
                                    }
                                    if (node.textElement && !node.has('verticalAlign')) {
                                        node.mergeGravity('gravity', 'center_vertical');
                                    }
                                }
                            }
                            else {
                                let offset = (lineHeight - ((node === this || node.layoutVertical && node.length > 1 || node.hasAlign($enum.NODE_ALIGNMENT.MULTILINE) ? node.bounds.height : node.fontSize) + node.paddingTop + node.paddingBottom)) / 2;
                                if (offset > 0) {
                                    node.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, Math.floor(offset) - (node.inlineVertical && !node.baseline ? $util.convertFloat(node.verticalAlign) : 0));
                                    if (bottom && lineHeight > node.height) {
                                        if (node.height > 0) {
                                            offset = lineHeight - node.height;
                                        }
                                        node.modifyBox($enum.BOX_STANDARD.MARGIN_BOTTOM, Math.ceil(offset));
                                    }
                                }
                            }
                        };
                        if (this.length) {
                            const baseline = $util.filterArray(this.renderChildren, node => node.baselineActive);
                            if (baseline.length) {
                                for (let i = 0; i < baseline.length; i++) {
                                    const node = baseline[i];
                                    if (!node.has('lineHeight')) {
                                        setMarginOffset(node, i > 0);
                                    }
                                }
                            }
                            else {
                                this.renderEach((node: T) => {
                                    if (!(node.has('lineHeight') || this.textElement && node.multiline || node.inputElement)) {
                                        setMarginOffset(node);
                                    }
                                });
                            }
                        }
                        setMarginOffset(this);
                    }
                }
            }
        }

        private setVisibility() {
            switch (this.cssAscend('visibility', true)) {
                case 'hidden':
                case 'collapse':
                    this.hide(true);
                    break;
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