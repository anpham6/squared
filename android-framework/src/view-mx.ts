import { CachedValue } from '../../src/base/@types/node';
import { CustomizationResult } from './@types/application';
import { Constraint, LocalSettings, SupportAndroid } from './@types/node';

import { AXIS_ANDROID, CONTAINER_ANDROID, ELEMENT_ANDROID, LAYOUT_ANDROID, RESERVED_JAVA } from './lib/constant';
import { API_ANDROID, DEPRECATED_ANDROID } from './lib/customization';
import { BUILD_ANDROID, CONTAINER_NODE } from './lib/enumeration';
import { localizeString, stripId } from './lib/util';

import $NodeList = squared.base.NodeList;
import $Resource = squared.base.Resource;

type T = android.base.View;

const $enum = squared.base.lib.enumeration;
const $client = squared.lib.client;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $util = squared.lib.util;

const REGEXP_DATASETATTR = /^attr[A-Z]/;
const REGEXP_FORMATTED = /^(?:([a-z]+):)?(\w+)="((?:@+?[a-z]+\/)?.+)"$/;
const REGEXP_VALIDSTRING = /[^\w$\-_.]/g;

function checkTextAlign(value: string, ignoreStart = false) {
    switch (value) {
        case 'justify':
        case 'initial':
        case 'inherit':
            return '';
        case 'center':
            return 'center_horizontal';
        case 'start':
        case 'left':
            if (ignoreStart) {
                return '';
            }
        default:
            return value;
    }
}

function isHorizontalAlign(value: string) {
    switch (value) {
        case 'left':
        case 'start':
        case 'right':
        case 'end':
        case 'center_horizontal':
            return true;
    }
    return false;
}

function setAutoMargin(node: T) {
    if (!node.blockWidth || node.width > 0 || node.has('maxWidth') || (node.innerWrapped || node).has('width', $enum.CSS_STANDARD.PERCENT, { not: '100%' })) {
        const alignment: string[] = [];
        if (node.autoMargin.leftRight) {
            alignment.push('center_horizontal');
        }
        else if (node.autoMargin.left) {
            alignment.push('right');
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
            const attr = node.outerWrapper === undefined && (node.blockWidth || !node.pageFlow) ? 'gravity' : 'layout_gravity';
            for (const value of alignment) {
                node.mergeGravity(attr, value);
            }
            return true;
        }
    }
    return false;
}

function setMultiline(node: T, lineHeight: number, overwrite: boolean) {
    if (node.localSettings.targetAPI >= BUILD_ANDROID.PIE) {
        node.android('lineHeight', $css.formatPX(lineHeight), overwrite);
    }
    else {
        const offset = (lineHeight - node.actualHeight) / 2;
        if (offset > 0) {
            node.android('lineSpacingExtra', $css.formatPX(offset), overwrite);
        }
    }
    if (node.styleElement && !node.has('height') && node.cssTry('lineHeight', 'normal')) {
        if (node.cssTry('whiteSpace', 'nowrap')) {
            const offset = (lineHeight - (<Element> node.element).getBoundingClientRect().height) / 2;
            if (Math.floor(offset) > 0) {
                node.modifyBox($enum.BOX_STANDARD.PADDING_TOP, Math.floor(offset));
                node.modifyBox($enum.BOX_STANDARD.PADDING_BOTTOM, Math.ceil(offset));
            }
            node.cssFinally('whiteSpace');
        }
        node.cssFinally('lineHeight');
    }
}

function setMarginOffset(node: T, lineHeight: number, inlineStyle: boolean, top = true, bottom = true) {
    if (node.imageElement || node.svgElement) {
        return;
    }
    if (node.multiline) {
        setMultiline(node, lineHeight, false);
    }
    else if (node.length === 0 && (node.pageFlow || node.textContent.length)) {
        let offset: number;
        if (node.styleElement && !inlineStyle && !node.has('height') && node.cssTry('lineHeight', 'normal')) {
            offset = (lineHeight - ((<Element> node.element).getBoundingClientRect().height || node.actualHeight)) / 2;
            node.cssFinally('lineHeight');
        }
        else if (inlineStyle && node.inlineText && !node.inline) {
            adjustMinHeight(node, lineHeight);
            return;
        }
        else {
            offset = (lineHeight - node.actualHeight) / 2;
        }
        if (Math.floor(offset) > 0) {
            if (top) {
                node.modifyBox(node.textElement ? $enum.BOX_STANDARD.PADDING_TOP : $enum.BOX_STANDARD.MARGIN_TOP, Math.floor(offset));
            }
            if (bottom) {
                node.modifyBox(node.textElement ? $enum.BOX_STANDARD.PADDING_BOTTOM : $enum.BOX_STANDARD.MARGIN_BOTTOM, Math.ceil(offset));
            }
        }
    }
    else if (inlineStyle && lineHeight > node.height && (node.layoutHorizontal && node.horizontalRows === undefined || node.hasAlign($enum.NODE_ALIGNMENT.SINGLE))) {
        adjustMinHeight(node, lineHeight);
    }
}

function adjustMinHeight(node: T, value: number) {
    const minHeight = node.parseUnit(node.css('minHeight'), true);
    if (node.inlineText) {
        value += node.contentBoxHeight;
        node.mergeGravity('gravity', 'center_vertical', false);
    }
    if (value > minHeight) {
        node.android('minHeight', $css.formatPX(value));
    }
}

const validateString = (value: string) => value ? value.trim().replace(REGEXP_VALIDSTRING, '_') : '';

export default (Base: Constructor<squared.base.Node>) => {
    return class View extends Base implements android.base.View {
        public static documentBody() {
            if (View._documentBody === undefined) {
                const body = new View(0, '0', document.body);
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

        protected _namespaces = ['android', 'app'];
        protected _cached: CachedValue<T> = {};
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
            sessionId = '0',
            element?: Element,
            afterInit?: BindGeneric<T, void>)
        {
            super(id, sessionId, element);
            if (afterInit) {
                afterInit(this);
            }
        }

        public attr(obj: string, attr: string, value?: string, overwrite = true) {
            const result: ObjectMap<string | boolean> = {};
            if (!this.supported(obj, attr, result)) {
                return '';
            }
            if (Object.keys(result).length) {
                if ($util.isString(result.obj)) {
                    obj = result.obj;
                }
                if ($util.isString(result.attr)) {
                    attr = result.attr;
                }
                if ($util.isString(result.value)) {
                    value = result.value;
                }
                if (typeof result.overwrite === 'boolean') {
                    overwrite = result.overwrite;
                }
            }
            return super.attr(obj, attr, value, overwrite);
        }

        public android(attr: string, value?: string, overwrite = true) {
            if (value) {
                this.attr('android', attr, value, overwrite);
            }
            return this.__android[attr] || '';
        }

        public app(attr: string, value?: string, overwrite = true) {
            if (value) {
                this.attr('app', attr, value, overwrite);
            }
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
            const match = REGEXP_FORMATTED.exec(value);
            if (match) {
                this.attr(match[1] || '_', match[2], match[3], overwrite);
            }
        }

        public anchor(position: string, documentId = '', overwrite?: boolean) {
            const node = this.actualAnchor;
            const renderParent = node.renderParent as T;
            if (renderParent) {
                if (renderParent.layoutConstraint) {
                    if (documentId === '' || this.constraint.current[position] === undefined || overwrite) {
                        if (documentId && overwrite === undefined) {
                            overwrite = documentId === 'parent';
                        }
                        const attr: string = LAYOUT_ANDROID.constraint[position];
                        if (attr) {
                            node.app(this.localizeString(attr), documentId, overwrite);
                            if (documentId === 'parent') {
                                switch (position) {
                                    case 'left':
                                    case 'right':
                                        node.constraint.horizontal = true;
                                        break;
                                    case 'top':
                                    case 'bottom':
                                    case 'baseline':
                                        node.constraint.vertical = true;
                                        break;
                                }
                            }
                            node.constraint.current[position] = {
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
                    node.android(this.localizeString(attr), documentId, overwrite);
                    return true;
                }
            }
            return false;
        }

        public anchorParent(orientation: string, overwrite?: boolean, bias?: number) {
            const node = this.actualAnchor;
            const renderParent = node.renderParent as T;
            if (renderParent) {
                const horizontal = orientation === AXIS_ANDROID.HORIZONTAL;
                if (renderParent.layoutConstraint) {
                    if (overwrite || !this.constraint[orientation]) {
                        node.anchor(horizontal ? 'left' : 'top', 'parent');
                        node.anchor(horizontal ? 'right' : 'bottom', 'parent');
                        node.constraint[orientation] = true;
                        if (bias !== undefined) {
                            node.anchorStyle(orientation, 'packed', bias, overwrite);
                        }
                        return true;
                    }
                }
                else if (renderParent.layoutRelative) {
                    node.anchor(horizontal ? 'left' : 'top', 'true', overwrite);
                    node.anchor(horizontal ? 'right' : 'bottom', 'true', overwrite);
                    return true;
                }
            }
            return false;
        }

        public anchorStyle(orientation: string, value = 'packed', bias = 0, overwrite = true) {
            orientation = $util.capitalize(orientation);
            const node = this.actualAnchor;
            node.app(`layout_constraint${orientation}_chainStyle`, value, overwrite);
            node.app(`layout_constraint${orientation}_bias`, bias.toString(), overwrite);
        }

        public anchorDelete(...position: string[]) {
            const node = this.actualAnchor;
            const renderParent = node.renderParent as T;
            if (renderParent) {
                if (renderParent.layoutConstraint) {
                    node.delete('app', ...$util.replaceMap<string, string>(position, value => this.localizeString(LAYOUT_ANDROID.constraint[value])));
                }
                else if (renderParent.layoutRelative) {
                    for (const value of position) {
                        if (node.alignSibling(value) !== '') {
                            node.delete('android', LAYOUT_ANDROID.relative[value], this.localizeString(LAYOUT_ANDROID.relative[value]));
                        }
                        else if (LAYOUT_ANDROID.relativeParent[value]) {
                            node.delete('android', this.localizeString(LAYOUT_ANDROID.relativeParent[value]));
                        }
                    }
                }
            }
        }

        public anchorClear() {
            const node = this.actualAnchor;
            const renderParent = node.renderParent as T;
            if (renderParent) {
                if (renderParent.layoutConstraint) {
                    node.anchorDelete(...Object.keys(LAYOUT_ANDROID.constraint));
                }
                else if (renderParent.layoutRelative) {
                    node.anchorDelete(...Object.keys(LAYOUT_ANDROID.relativeParent));
                    node.anchorDelete(...Object.keys(LAYOUT_ANDROID.relative));
                }
            }
        }

        public alignParent(position: string) {
            const node = this.actualAnchor;
            const renderParent = node.renderParent as T;
            if (renderParent) {
                if (renderParent.layoutConstraint) {
                    const attr: string | undefined = LAYOUT_ANDROID.constraint[position];
                    if (attr) {
                        return node.app(this.localizeString(attr)) === 'parent' || node.app(attr) === 'parent';
                    }
                }
                else if (renderParent.layoutRelative) {
                    const attr: string | undefined = LAYOUT_ANDROID.relativeParent[position];
                    if (attr) {
                        return node.android(this.localizeString(attr)) === 'true' || node.android(attr) === 'true';
                    }
                }
            }
            return false;
        }

        public alignSibling(position: string, documentId?: string) {
            const node = this.actualAnchor;
            const renderParent = node.renderParent as T;
            if (renderParent) {
                if (documentId) {
                    if (renderParent.layoutConstraint) {
                        const attr: string | undefined = LAYOUT_ANDROID.constraint[position];
                        if (attr) {
                            node.app(this.localizeString(attr), documentId);
                        }
                    }
                    else if (renderParent.layoutRelative) {
                        const attr: string | undefined = LAYOUT_ANDROID.relative[position];
                        if (attr) {
                            node.android(this.localizeString(attr), documentId);
                        }
                    }
                }
                else {
                    if (renderParent.layoutConstraint) {
                        const attr: string | undefined = LAYOUT_ANDROID.constraint[position];
                        if (attr) {
                            const value = node.app(this.localizeString(attr)) || node.app(attr);
                            return value !== 'parent' && value !== renderParent.documentId ? value : '';
                        }
                    }
                    else if (renderParent.layoutRelative) {
                        const attr: string | undefined = LAYOUT_ANDROID.relative[position];
                        if (attr) {
                            return node.android(this.localizeString(attr)) || node.android(attr);
                        }
                    }
                }
            }
            return '';
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
            let id: string | undefined;
            for (const value of this._namespaces) {
                if (objs.length === 0 || objs.includes(value)) {
                    const obj: StringMap = this[`__${value}`];
                    if (obj) {
                        for (const attr in obj) {
                            const item = (value !== '_' ? `${value}:` : '') + `${attr}="${obj[attr]}"`;
                            if (attr === 'id') {
                                id = item;
                            }
                            else {
                                result.push(item);
                            }
                        }
                    }
                }
            }
            result.sort((a, b) => a > b ? 1 : -1);
            if (id) {
                result.unshift(id);
            }
            return result;
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
            const node = new View(id || this.id, this.sessionId, this.element || undefined);
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
                if (this.styleElement && this.naturalElement) {
                    name = validateString(this.elementId || $dom.getNamedItem(this.element, 'name'));
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
                switch (this.cssAscend('visibility', true)) {
                    case 'hidden':
                    case 'collapse':
                        this.hide(true);
                        break;
                }
                if (this.plainText) {
                    this.android('layout_width', 'wrap_content', false);
                    this.android('layout_height', 'wrap_content', false);
                    return;
                }
                if (this.documentBody) {
                    if (!this.hasWidth && this.renderChildren.some(node => node.alignParent('right'))) {
                        this.android('layout_width', 'match_parent', false);
                    }
                    if (!this.hasHeight && this.renderChildren.some(node => node.alignParent('bottom'))) {
                        this.android('layout_height', 'match_parent', false);
                    }
                }
                if (this.android('layout_width') === '') {
                    let layoutWidth = '';
                    if (!this.inlineStatic && this.has('width') || this.toInt('width') > 0 && this.cssInitial('width') === '') {
                        const width = this.css('width');
                        let value = -1;
                        if ($css.isLength(width)) {
                            value = this.actualWidth;
                        }
                        else if ($css.isPercent(width)) {
                            if (width === '100%') {
                                if (this.has('maxWidth', 0, { not: '100%' })) {
                                    const maxWidth = this.parseUnit(this.css('maxWidth'));
                                    if (maxWidth > 0) {
                                        value = Math.min(maxWidth, this.documentParent.box.width);
                                        if (this.support.maxWidth) {
                                            this.android('maxWidth', $css.formatPX(value));
                                            layoutWidth = 'wrap_content';
                                            value = -1;
                                        }
                                    }
                                }
                                else {
                                    layoutWidth = 'match_parent';
                                    if (this.imageElement) {
                                        this.android('adjustViewBounds', 'true');
                                    }
                                }
                            }
                            else if (this.imageElement) {
                                if (this.android('adjustViewBounds') === 'true') {
                                    layoutWidth = 'wrap_content';
                                }
                                else {
                                    value = this.bounds.width;
                                }
                            }
                            else {
                                value = this.actualWidth;
                            }
                        }
                        if (value > 0) {
                            layoutWidth = $css.formatPX(value);
                        }
                    }
                    else if (this.imageElement && this.has('height', $enum.CSS_STANDARD.PERCENT)) {
                        layoutWidth = 'wrap_content';
                        this.android('adjustViewBounds', 'true');
                    }
                    if (layoutWidth === '') {
                        if (this.textElement && this.inlineText && this.textEmpty && !this.visibleStyle.backgroundImage) {
                            layoutWidth = $css.formatPX(this.actualWidth);
                        }
                        else {
                            if (this.blockStatic && !this.inputElement && !renderParent.is(CONTAINER_NODE.GRID)) {
                                if (!this.documentParent.layoutElement || this.display === 'flex') {
                                    layoutWidth = 'match_parent';
                                }
                                else if (!this.documentParent.flexElement && renderParent.layoutConstraint && this.alignParent('left') && this.alignParent('right')) {
                                    layoutWidth = this.autoMargin.horizontal || this.ascend(false, item => item.has('width') || item.blockStatic).length > 0 ? '0px' : 'match_parent';
                                }
                            }
                            if (layoutWidth === '' && (
                                    this.layoutVertical && this.layoutLinear && renderParent.blockWidth && this.actualChildren.some(item => item.lineBreak) ||
                                    !this.pageFlow && this.absoluteParent === this.documentParent && this.has('left') && this.has('right') ||
                                    this.documentParent.flexElement && this.documentParent.css('flexDirection') !== 'column' && this.flexbox.grow > 0 && renderParent.flexibleWidth
                               ))
                            {
                                layoutWidth = 'match_parent';
                            }
                        }
                    }
                    if (layoutWidth === '' && this.some((node: T) => node.layoutConstraint && node.some((child: T) => child.flexibleWidth))) {
                        layoutWidth = $css.formatPX(this.actualWidth);
                    }
                    this.android('layout_width', layoutWidth || 'wrap_content');
                }
                if (this.android('layout_height') === '') {
                    let layoutHeight = '';
                    if (!this.inlineStatic && this.has('height') || this.toInt('height') > 0 && this.cssInitial('height') === '') {
                        const height = this.css('height');
                        let value = -1;
                        if ($css.isLength(height)) {
                            value = this.actualHeight;
                        }
                        else if ($css.isPercent(height)) {
                            if (height === '100%') {
                                if (this.has('maxHeight', 0, { not: '100%' })) {
                                    const maxHeight = this.parseUnit(this.css('maxHeight'), true);
                                    if (maxHeight > 0 && maxHeight < this.documentParent.box.height) {
                                        if (this.support.maxHeight) {
                                            layoutHeight = 'wrap_content';
                                            value = -1;
                                        }
                                        else {

                                        }
                                    }
                                }
                                else if (this.documentRoot || !renderParent.inlineHeight) {
                                    layoutHeight = 'match_parent';
                                }
                                if (this.imageElement) {
                                    this.android('adjustViewBounds', 'true');
                                }
                            }
                            if (value === -1 && layoutHeight === '') {
                                if (this.imageElement) {
                                    if (this.android('adjustViewBounds') === 'true') {
                                        layoutHeight = 'wrap_content';
                                    }
                                    else {
                                        value = this.bounds.height;
                                    }
                                }
                                else {
                                    value = this.actualHeight;
                                }
                            }
                        }
                        if (value > 0) {
                            if (this.is(CONTAINER_NODE.LINE) && this.tagName !== 'HR' && this.has('height', 0, { map: 'initial' })) {
                                value += this.borderTopWidth + this.borderBottomWidth;
                            }
                            layoutHeight = $css.formatPX(value);
                        }
                    }
                    else if (this.imageElement && this.has('width', $enum.CSS_STANDARD.PERCENT)) {
                        layoutHeight = 'wrap_content';
                        this.android('adjustViewBounds', 'true');
                    }
                    if (layoutHeight === '') {
                        if (this.textElement && this.inlineText && this.textEmpty && !this.visibleStyle.backgroundImage) {
                            if (renderParent.layoutConstraint && this.actualHeight >= (this.absoluteParent || this.documentParent).box.height && this.alignParent('top')) {
                                this.anchor('bottom', 'parent');
                                layoutHeight = '0px';
                            }
                            else {
                                layoutHeight = $css.formatPX(this.actualHeight);
                            }
                        }
                        else if (
                            this.display === 'table-cell' ||
                            this.singleChild && renderParent.flexElement && renderParent.css('flexDirection') === 'row' ||
                            !this.pageFlow && this.leftTopAxis && this.has('top') && this.has('bottom'))
                        {
                            layoutHeight = 'match_parent';
                        }
                    }
                    this.android('layout_height', layoutHeight || 'wrap_content');
                }
                if (this.has('minWidth')) {
                    this.android('minWidth', this.convertPX(this.css('minWidth')), false);
                }
                if (this.has('minHeight')) {
                    this.android('minHeight', this.convertPX(this.css('minHeight'), false), false);
                }
                if (this.support.maxWidth) {
                    const maxWidth = this.css('maxWidth');
                    let width = -1;
                    if ($css.isLength(maxWidth, true)) {
                        if (maxWidth === '100%') {
                            if (this.imageElement) {
                                width = (<HTMLImageElement> this.element).naturalWidth;
                            }
                            else if (this.svgElement) {
                                width = this.bounds.width;
                            }
                        }
                        else {
                            width = this.parseUnit(this.css('maxWidth'));
                        }
                    }
                    else if (!this.pageFlow && this.textElement && this.inlineWidth && this.textContent.trim() !== '' && this.textContent.indexOf(' ') !== -1) {
                        width = Math.ceil(this.bounds.width);
                    }
                    if (width !== -1) {
                        this.android('maxWidth', $css.formatPX(width), false);
                        if (this.imageElement) {
                            this.android('adjustViewBounds', 'true');
                        }
                    }
                }
                if (this.support.maxHeight) {
                    const maxHeight = this.css('maxHeight');
                    if ($css.isLength(maxHeight, true)) {
                        let height = -1;
                        if (maxHeight === '100%' && this.imageElement) {
                            height = (<HTMLImageElement> this.element).naturalHeight;
                        }
                        else {
                            height = this.parseUnit(this.css('maxHeight'), false);
                        }
                        if (height >= 0) {
                            this.android('maxHeight', $css.formatPX(height));
                            if (this.imageElement) {
                                this.android('adjustViewBounds', 'true');
                            }
                        }
                    }
                }
            }
        }

        public setAlignment() {
            const renderParent = this.renderParent as T;
            if (renderParent) {
                const alignFloat = this.hasAlign($enum.NODE_ALIGNMENT.FLOAT);
                const node = (this.outerWrapper as T) || this;
                const outerRenderParent = (node.renderParent || renderParent) as T;
                let textAlign = checkTextAlign(this.cssInitial('textAlign', true));
                let textAlignParent = checkTextAlign(this.cssAscend('textAlign'), true);
                if (textAlign === '' && this.groupParent && !alignFloat) {
                    const actualParent = $NodeList.actualParent(this.renderChildren);
                    if (actualParent) {
                        textAlign = checkTextAlign(actualParent.cssInitial('textAlign', true));
                    }
                }
                if (this.pageFlow) {
                    let floating = '';
                    if (this.inlineVertical && (outerRenderParent.layoutHorizontal && !outerRenderParent.support.container.positionRelative || outerRenderParent.is(CONTAINER_NODE.GRID))) {
                        let target = node;
                        let gravity = 'layout_gravity';
                        if (this.display === 'table-cell') {
                            target = this;
                            gravity = 'gravity';
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
                    if (!this.blockWidth) {
                        if (outerRenderParent.layoutVertical || this.documentRoot && (this.layoutVertical || this.layoutFrame)) {
                            if (this.floating) {
                                node.mergeGravity('layout_gravity', this.float);
                            }
                            else if (!setAutoMargin(node) && textAlign !== '' && this.hasWidth && !this.blockStatic && this.display !== 'table') {
                                node.mergeGravity('layout_gravity', textAlign, false);
                            }
                        }
                        if (this.hasAlign($enum.NODE_ALIGNMENT.RIGHT) || this.renderChildren.length && this.renderChildren.every(item => item.rightAligned)) {
                            floating = 'right';
                        }
                        else if (alignFloat && this.groupParent && !this.renderChildren.some(item => item.float === 'right')) {
                            floating = 'left';
                        }
                    }
                    if (renderParent.layoutFrame && this.innerWrapped === undefined) {
                        if (!setAutoMargin(this)) {
                            floating = this.floating ? this.float : floating;
                            if (floating !== '' && (renderParent.inlineWidth || !renderParent.documentRoot && this.singleChild)) {
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
                            this.mergeGravity('layout_gravity', gravity);
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
                    else if (setAutoMargin(node) && textAlign !== '') {
                        textAlignParent = '';
                    }
                }
                if (textAlignParent !== '') {
                    if (this.blockStatic) {
                        node.mergeGravity('layout_gravity', 'left', false);
                    }
                    else if (!this.blockWidth && this.naturalElement && (renderParent.layoutFrame || renderParent.layoutVertical && renderParent.layoutLinear)) {
                        const target = renderParent.inlineWidth ? renderParent : node;
                        if (!target.documentRoot) {
                            target.mergeGravity('layout_gravity', textAlignParent, false);
                        }
                    }
                }
                if (!this.layoutConstraint && !this.layoutFrame && !this.is(CONTAINER_NODE.GRID) && !this.layoutElement) {
                    let fromParent = false;
                    if (textAlign === '') {
                        textAlign = textAlignParent;
                        fromParent = true;
                    }
                    if (textAlign !== '')  {
                        this.mergeGravity('gravity', textAlign, !fromParent);
                    }
                }
            }
        }

        public mergeGravity(attr: string, alignment: string, overwrite = true) {
            if (attr === 'layout_gravity') {
                const renderParent = this.renderParent as T;
                if (renderParent) {
                    if (isHorizontalAlign(alignment) && (renderParent.inlineWidth && this.singleChild || !overwrite && this.outerWrapper && this.has('maxWidth'))) {
                        return;
                    }
                    else if (renderParent.layoutConstraint) {
                        if (!this.positioned) {
                            switch (alignment) {
                                case 'top':
                                    this.anchor('top', 'parent', false);
                                    break;
                                case 'right':
                                case 'end':
                                    this.anchor('right', 'parent', false);
                                    break;
                                case 'bottom':
                                    this.anchor('bottom', 'parent', false);
                                    break;
                                case 'left':
                                case 'start':
                                    this.anchor('left', 'parent', false);
                                    break;
                                case 'center_horizontal':
                                    this.anchorParent(AXIS_ANDROID.HORIZONTAL, true);
                                    break;
                            }
                        }
                        return;
                    }
                }
            }
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
                    function checkMergable(value: string) {
                        const horizontal = `${value}_horizontal`;
                        const vertical = `${value}_vertical`;
                        if (direction.has(value) || direction.has(horizontal) && direction.has(vertical)) {
                            direction.delete(horizontal);
                            direction.delete(vertical);
                            direction.add(value);
                        }
                    }
                    checkMergable('center');
                    checkMergable('fill');
                    let x = '';
                    let y = '';
                    let z = '';
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
                this.android(attr, result);
            }
        }

        public applyOptimizations() {
            if (this.renderParent) {
                this.autoSizeBoxModel();
                this.alignLayout();
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
            const api = API_ANDROID[this.localSettings.targetAPI];
            if (api) {
                setCustomization(api, this.tagName);
                setCustomization(api, this.controlName);
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
                            if (attr === 'marginRight') {
                                if (value < 0 && this.float === 'right') {
                                    value = 0;
                                }
                                else if (this.inline) {
                                    const boxRight = this.documentParent.box.right;
                                    if (Math.floor(this.bounds.right) > boxRight) {
                                        if (this.textElement && !this.multiline) {
                                            this.android('maxLines', '1');
                                            this.android('ellipsize', 'end');
                                        }
                                        continue;
                                    }
                                    else if (this.bounds.right + value > boxRight) {
                                        value = Math.max(0, boxRight - this.bounds.right);
                                    }
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
                    this.android(prefix, $css.formatPX(mergeAll));
                }
                else {
                    if (mergeHorizontal !== 0) {
                        this.android(`${prefix}Horizontal`, $css.formatPX(mergeHorizontal));
                    }
                    else {
                        if (boxModel[left] !== 0) {
                            this.android(this.localizeString(`${prefix}Left`), $css.formatPX(boxModel[left]));
                        }
                        if (boxModel[right] !== 0) {
                            this.android(this.localizeString(`${prefix}Right`), $css.formatPX(boxModel[right]));
                        }
                    }
                    if (mergeVertical !== 0) {
                        this.android(`${prefix}Vertical`, $css.formatPX(mergeVertical));
                    }
                    else {
                        if (boxModel[top] !== 0) {
                            this.android(`${prefix}Top`, $css.formatPX(boxModel[top]));
                        }
                        if (boxModel[bottom] !== 0) {
                            this.android(`${prefix}Bottom`, $css.formatPX(boxModel[bottom]));
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
                    const obj = name === 'attr' ? 'android' : (REGEXP_DATASETATTR.test(name) ? $util.capitalize(name.substring(4), false) : '');
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
            const indent = '\n' + '\t'.repeat(depth);
            let output = '';
            for (const value of this.combine()) {
                output += indent + value;
            }
            return output;
        }

        private autoSizeBoxModel() {
            const renderParent = this.renderParent as T;
            if (renderParent && this.hasProcedure($enum.NODE_PROCEDURE.AUTOFIT)) {
                let borderWidth = false;
                if (this.tableElement) {
                    borderWidth = this.css('boxSizing') === 'content-box' || $client.isUserAgent($client.USER_AGENT.FIREFOX | $client.USER_AGENT.EDGE);
                }
                else if (this.styleElement) {
                    if (this.is(CONTAINER_NODE.BUTTON)) {
                        if (this.inlineHeight && !this.has('minHeight')) {
                            this.android('minHeight', $css.formatPX(Math.ceil(this.actualHeight)));
                        }
                    }
                    borderWidth = true;
                }
                if (borderWidth && this.visibleStyle.borderWidth && !this.is(CONTAINER_NODE.LINE)) {
                    this.modifyBox($enum.BOX_STANDARD.PADDING_LEFT, this.borderLeftWidth);
                    this.modifyBox($enum.BOX_STANDARD.PADDING_RIGHT, this.borderRightWidth);
                    this.modifyBox($enum.BOX_STANDARD.PADDING_TOP, this.borderTopWidth);
                    this.modifyBox($enum.BOX_STANDARD.PADDING_BOTTOM, this.borderBottomWidth);
                }
            }
        }

        private alignLayout() {
            const renderParent = this.renderParent as T;
            const renderChildren = this.renderChildren;
            if (this.layoutHorizontal) {
                if (this.layoutLinear) {
                    if (renderChildren.some(node => node.floating) && !renderChildren.some(node => node.imageElement && node.baseline)) {
                        this.android('baselineAligned', 'false');
                    }
                    else {
                        const baseline = $NodeList.baseline($util.filterArray(renderChildren, node => node.baseline && !node.layoutRelative && !node.layoutConstraint))[0];
                        if (baseline) {
                            this.android('baselineAlignedChildIndex', renderChildren.indexOf(baseline).toString());
                        }
                    }
                }
                if (this.horizontalRows === undefined && !this.hasAlign($enum.NODE_ALIGNMENT.RIGHT) && !this.visibleStyle.background) {
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
            else if (this.layoutVertical) {
                if (this.layoutLinear) {
                    const firstChild = renderChildren[0];
                    if (firstChild.textElement && firstChild.baseline) {
                        this.android('baselineAlignedChildIndex', '0');
                    }
                }
            }
            if (renderParent.layoutConstraint) {
                if (this.pageFlow && !this.documentParent.documentBody && this.alignParent('top') && !this.alignParent('bottom') && !renderParent.blockHeight && (renderParent.horizontalRows === undefined || renderParent.horizontalRows.length && renderParent.horizontalRows[0].find(node => node === this)) && this.alignSibling('bottomTop') === '' && $util.withinRange(this.actualRect('bottom'), renderParent.box.bottom)) {
                    this.anchor('bottom', 'parent', false);
                    this.anchorStyle(AXIS_ANDROID.VERTICAL);
                }
            }
        }

        private setLineHeight() {
            const lineHeight = this.lineHeight;
            if (lineHeight > 0) {
                const hasOwnStyle = this.has('lineHeight');
                if (this.multiline) {
                    setMultiline(this, lineHeight, hasOwnStyle);
                }
                else if (hasOwnStyle || this.renderChildren.length || this.renderParent && this.renderParent.lineHeight === 0) {
                    if (this.length === 0) {
                        setMarginOffset(this, lineHeight, hasOwnStyle);
                    }
                    else if (this.renderChildren.length) {
                        const horizontalRows = this.horizontalRows || [this.renderChildren];
                        const length = horizontalRows.length;
                        let previousMultiline = false;
                        for (let i = 0; i < length; i++) {
                            const row = horizontalRows[i] as T[];
                            const nextRow = horizontalRows[i + 1];
                            let nextMultiline = nextRow && (nextRow.length === 1 && nextRow[0].multiline || nextRow[0].lineBreakLeading);
                            if (!nextMultiline && i < length - 1) {
                                const nextBaseline = horizontalRows[i + 1].find(node => node.baselineActive);
                                if (nextBaseline && nextBaseline.has('lineHeight')) {
                                    nextMultiline = true;
                                }
                            }
                            const baseline = row.find(node => node.baselineActive);
                            const top = !previousMultiline && (i > 0 || length === 1) || row[0].lineBreakLeading;
                            const bottom = !nextMultiline && (i < length - 1 || length === 1);
                            if (baseline) {
                                if (!baseline.has('lineHeight')) {
                                    setMarginOffset(baseline, lineHeight, false, top, bottom);
                                }
                                else {
                                    previousMultiline = true;
                                    continue;
                                }
                            }
                            else {
                                for (let j = 0; j < row.length; j++) {
                                    const node = row[j];
                                    if (node.length === 0 && !node.has('lineHeight') && !node.baselineAltered) {
                                        setMarginOffset(node, lineHeight, false, top, bottom);
                                    }
                                }
                            }
                            previousMultiline = row.length === 1 && row[0].multiline;
                        }
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

        get actualAnchor(): T {
            const renderParent = this.renderParent as T;
            if (renderParent && (renderParent.layoutConstraint || renderParent.layoutRelative)) {
                return this;
            }
            return this.outerWrapper && this.outerWrapper.visible ? this.outerWrapper as T : this;
        }

        get support() {
            if (this._cached.support === undefined) {
                const maxWidth = this.textElement || this.imageElement || this.svgElement;
                const support = <SupportAndroid> {
                    container: {
                        positionRelative: this.layoutRelative || this.layoutConstraint
                    },
                    maxWidth,
                    maxHeight: maxWidth
                };
                if (this.containerType !== 0) {
                    this._cached.support = support;
                }
                return support;
            }
            return <SupportAndroid> this._cached.support;
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

        get flexibleWidth() {
            return !!this.renderParent && (this.renderParent as T).layoutConstraint && this.android('layout_width') === '0px';
        }
        get flexibleHeight() {
            return !!this.renderParent && (this.renderParent as T).layoutConstraint && this.android('layout_height') === '0px';
        }

        get fontSize() {
            if (this._fontSize === 0) {
                this._fontSize = $css.parseUnit(this.css('fontSize')) || 16;
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