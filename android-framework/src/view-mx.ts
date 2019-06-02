import { NodeTemplate } from '../../src/base/@types/application';
import { CachedValue } from '../../src/base/@types/node';
import { CustomizationResult } from './@types/application';
import { Constraint, LocalSettings, SupportAndroid } from './@types/node';

import { CONTAINER_ANDROID, ELEMENT_ANDROID, LAYOUT_ANDROID, RESERVED_JAVA, STRING_ANDROID } from './lib/constant';
import { API_ANDROID, DEPRECATED_ANDROID } from './lib/customization';
import { BUILD_ANDROID, CONTAINER_NODE } from './lib/enumeration';
import { localizeString } from './lib/util';

import $NodeUI = squared.base.NodeUI;
import $ResourceUI = squared.base.ResourceUI;

type T = android.base.View;

const $client = squared.lib.client;
const $const = squared.lib.constant;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $math = squared.lib.math;
const $util = squared.lib.util;
const $c = squared.base.lib.constant;
const $e = squared.base.lib.enumeration;

const REGEXP_DATASETATTR = /^attr[A-Z]/;
const REGEXP_FORMATTED = /^(?:([a-z]+):)?(\w+)="((?:@+?[a-z]+\/)?.+)"$/;
const REGEXP_VALIDSTRING = /[^\w$\-_.]/g;

function checkTextAlign(value: string, ignoreStart = false) {
    switch (value) {
        case 'justify':
        case 'initial':
        case 'inherit':
            return '';
        case $const.CSS.CENTER:
            return STRING_ANDROID.CENTER_HORIZONTAL;
        case $const.CSS.START:
        case $const.CSS.LEFT:
            if (ignoreStart) {
                return '';
            }
        default:
            return value;
    }
}

function isHorizontalAlign(value: string) {
    switch (value) {
        case $const.CSS.LEFT:
        case $const.CSS.START:
        case $const.CSS.RIGHT:
        case $const.CSS.END:
        case STRING_ANDROID.CENTER_HORIZONTAL:
            return true;
    }
    return false;
}

function setAutoMargin(node: T) {
    if (!node.blockWidth || node.hasWidth || node.has('maxWidth') || node.innerWrapped && node.innerWrapped.has($const.CSS.WIDTH, $e.CSS_STANDARD.PERCENT, { not: $const.CSS.PERCENT_100 })) {
        const alignment: string[] = [];
        if (node.autoMargin.leftRight) {
            alignment.push(STRING_ANDROID.CENTER_HORIZONTAL);
        }
        else if (node.autoMargin.left) {
            alignment.push($const.CSS.RIGHT);
        }
        else if (node.autoMargin.right) {
            alignment.push($const.CSS.LEFT);
        }
        if (node.autoMargin.topBottom) {
            alignment.push(STRING_ANDROID.CENTER_VERTICAL);
        }
        else if (node.autoMargin.top) {
            alignment.push($const.CSS.BOTTOM);
        }
        else if (node.autoMargin.bottom) {
            alignment.push($const.CSS.TOP);
        }
        if (alignment.length) {
            const attr = node.outerWrapper === undefined && (node.blockWidth || !node.pageFlow) ? STRING_ANDROID.GRAVITY : STRING_ANDROID.LAYOUT_GRAVITY;
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
    if (node.styleElement && !node.has($const.CSS.HEIGHT) && node.cssTry('line-height', 'normal')) {
        if (node.cssTry('white-space', 'nowrap')) {
            const offset = (lineHeight - (<Element> node.element).getBoundingClientRect().height) / 2;
            if (Math.floor(offset) > 0) {
                node.modifyBox($e.BOX_STANDARD.PADDING_TOP, Math.round(offset));
                if (!node.blockStatic) {
                    node.modifyBox($e.BOX_STANDARD.PADDING_BOTTOM, Math.floor(offset));
                }
            }
            node.cssFinally('white-space');
        }
        node.cssFinally('line-height');
    }
}

function setMarginOffset(node: T, lineHeight: number, inlineStyle: boolean, top = true, bottom = true) {
    if (node.is(CONTAINER_NODE.IMAGE) || node.actualHeight === 0) {
        return;
    }
    if (node.multiline) {
        setMultiline(node, lineHeight, false);
    }
    else if (node.length === 0 && (node.pageFlow || node.textContent.length)) {
        let offset = 0;
        let usePadding = true;
        if (node.styleElement && !inlineStyle && !node.has($const.CSS.HEIGHT) && node.cssTry('line-height', 'normal')) {
            if (node.cssTry('white-space', 'nowrap')) {
                offset = (lineHeight - ((<Element> node.element).getBoundingClientRect().height || node.actualHeight)) / 2;
                usePadding = false;
                node.cssFinally('white-space');
            }
            node.cssFinally('line-height');
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
                node.modifyBox(usePadding && node.textElement && !node.plainText && !inlineStyle ? $e.BOX_STANDARD.PADDING_TOP : $e.BOX_STANDARD.MARGIN_TOP, Math.round(offset));
            }
            if (bottom) {
                node.modifyBox(usePadding && node.textElement && !node.plainText && !inlineStyle ? $e.BOX_STANDARD.PADDING_BOTTOM : $e.BOX_STANDARD.MARGIN_BOTTOM, Math.floor(offset));
            }
        }
    }
    else if (inlineStyle && (!node.hasHeight || lineHeight > node.height) && (node.layoutHorizontal && node.horizontalRows === undefined || node.hasAlign($e.NODE_ALIGNMENT.SINGLE))) {
        adjustMinHeight(node, lineHeight);
    }
}

function adjustMinHeight(node: T, value: number) {
    if (node.inlineText) {
        value += node.contentBoxHeight;
        node.mergeGravity(STRING_ANDROID.GRAVITY, STRING_ANDROID.CENTER_VERTICAL, false);
    }
    if (value > node.height) {
        node.android('minHeight', $css.formatPX(value));
    }
}

function setSingleLine(node: T) {
    node.android('maxLines', '1');
    node.android('ellipsize', $const.CSS.END);
}

const isFlexibleDimension = (node: T, value: string) => !!node.renderParent && value === $const.CSS.PX_0 && ((node.renderParent as T).layoutConstraint || (node.renderParent as T).is(CONTAINER_NODE.GRID));

const validateString = (value: string) => value ? value.trim().replace(REGEXP_VALIDSTRING, '_').toLowerCase() : '';

export default (Base: Constructor<squared.base.NodeUI>) => {
    return class View extends Base implements android.base.View {
        public static getControlName(containerType: number): string {
            return CONTAINER_ANDROID[CONTAINER_NODE[containerType]];
        }

        public renderParent?: T;
        public renderTemplates?: (NodeTemplate<T> | null)[];
        public outerWrapper?: T;
        public innerWrapped?: T;
        public companion?: T;
        public extracted?: T[];
        public horizontalRows?: T[][];
        public innerBefore?: T;
        public innerAfter?: T;
        public readonly renderChildren: T[] = [];
        public readonly constraint: Constraint = {
            horizontal: false,
            vertical: false,
            current: {}
        };

        protected _namespaces = [STRING_ANDROID.ANDROID, STRING_ANDROID.APP];
        protected _cached: CachedValue<T> = {};
        protected _controlName = '';
        protected _localSettings!: LocalSettings;
        protected _documentParent?: T;
        protected _boxAdjustment?: BoxModel;
        protected _boxReset?: BoxModel;

        private _containerType = 0;

        private __android: StringMap = {};
        private __app: StringMap = {};

        constructor(
            id = 0,
            sessionId = '0',
            element?: Element,
            afterInit?: BindGeneric<T, void>)
        {
            super(id, sessionId, element);
            if (element) {
                this.init();
            }
            if (afterInit) {
                afterInit(this);
            }
        }

        public android(attr: string, value?: string, overwrite = true) {
            if (value) {
                if (this.localSettings.targetAPI < BUILD_ANDROID.LATEST) {
                    const result: ObjectMap<string | boolean> = {};
                    if (!this.supported(attr, result)) {
                        return '';
                    }
                    if (Object.keys(result).length) {
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
                }
                this.attr(STRING_ANDROID.ANDROID, attr, value, overwrite);
            }
            return this.__android[attr] || '';
        }

        public app(attr: string, value?: string, overwrite = true) {
            if (value) {
                this.attr(STRING_ANDROID.APP, attr, value, overwrite);
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
            const node = this.anchorTarget;
            const renderParent = node.renderParent as T;
            if (renderParent && node.documentId !== documentId) {
                if (renderParent.layoutConstraint) {
                    if (documentId === '' || node.constraint.current[position] === undefined || overwrite) {
                        if (documentId && overwrite === undefined) {
                            overwrite = documentId === STRING_ANDROID.PARENT;
                        }
                        const attr: string = LAYOUT_ANDROID.constraint[position];
                        if (attr) {
                            let horizontal = false;
                            node.app(this.localizeString(attr), documentId, overwrite);
                            switch (position) {
                                case $const.CSS.LEFT:
                                case $const.CSS.RIGHT:
                                    if (documentId === STRING_ANDROID.PARENT) {
                                        node.constraint.horizontal = true;
                                    }
                                case $c.STRING_BASE.LEFT_RIGHT:
                                case $c.STRING_BASE.RIGHT_LEFT:
                                    horizontal = true;
                                    break;
                                case $const.CSS.TOP:
                                case $const.CSS.BOTTOM:
                                case 'baseline':
                                    if (documentId === STRING_ANDROID.PARENT) {
                                        node.constraint.vertical = true;
                                    }
                                    break;
                            }
                            node.constraint.current[position] = { documentId, horizontal };
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

        public anchorParent(orientation: string, style?: string, bias?: number, overwrite?: boolean) {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as T;
            if (renderParent) {
                const horizontal = orientation === STRING_ANDROID.HORIZONTAL;
                if (renderParent.layoutConstraint) {
                    if (overwrite || !this.constraint[orientation]) {
                        node.anchor(horizontal ? $const.CSS.LEFT : $const.CSS.TOP, STRING_ANDROID.PARENT, overwrite);
                        node.anchor(horizontal ? $const.CSS.RIGHT : $const.CSS.BOTTOM, STRING_ANDROID.PARENT, overwrite);
                        node.constraint[orientation] = true;
                        if (style) {
                            node.anchorStyle(orientation, style, bias, overwrite);
                        }
                        return true;
                    }
                }
                else if (renderParent.layoutRelative) {
                    node.anchor(horizontal ? $const.CSS.LEFT : $const.CSS.TOP, 'true', overwrite);
                    node.anchor(horizontal ? $const.CSS.RIGHT : $const.CSS.BOTTOM, 'true', overwrite);
                    return true;
                }
            }
            return false;
        }

        public anchorStyle(orientation: string, value = 'packed', bias = 0, overwrite = true) {
            const node = this.anchorTarget;
            const horizontal = orientation === STRING_ANDROID.HORIZONTAL;
            node.app(horizontal ? 'layout_constraintHorizontal_chainStyle' : 'layout_constraintVertical_chainStyle', value, overwrite);
            node.app(horizontal ? 'layout_constraintHorizontal_bias' : 'layout_constraintVertical_bias', bias.toString(), overwrite);
        }

        public anchorDelete(...position: string[]) {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as T;
            if (renderParent) {
                if (renderParent.layoutConstraint) {
                    node.delete(STRING_ANDROID.APP, ...$util.replaceMap<string, string>(position, value => this.localizeString(LAYOUT_ANDROID.constraint[value])));
                }
                else if (renderParent.layoutRelative) {
                    for (const value of position) {
                        if (node.alignSibling(value) !== '') {
                            node.delete(STRING_ANDROID.ANDROID, LAYOUT_ANDROID.relative[value], this.localizeString(LAYOUT_ANDROID.relative[value]));
                        }
                        else if (LAYOUT_ANDROID.relativeParent[value]) {
                            node.delete(STRING_ANDROID.ANDROID, this.localizeString(LAYOUT_ANDROID.relativeParent[value]));
                        }
                    }
                }
            }
        }

        public anchorClear() {
            const node = this.anchorTarget;
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
            const node = this.anchorTarget;
            const renderParent = node.renderParent as T;
            if (renderParent) {
                if (renderParent.layoutConstraint) {
                    const attr = LAYOUT_ANDROID.constraint[position];
                    if (attr) {
                        return node.app(this.localizeString(attr)) === STRING_ANDROID.PARENT || node.app(attr) === STRING_ANDROID.PARENT;
                    }
                }
                else if (renderParent.layoutRelative) {
                    const attr = LAYOUT_ANDROID.relativeParent[position];
                    if (attr) {
                        return node.android(this.localizeString(attr)) === 'true' || node.android(attr) === 'true';
                    }
                }
            }
            return false;
        }

        public alignSibling(position: string, documentId?: string) {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as T;
            if (renderParent) {
                if (documentId) {
                    if (renderParent.layoutConstraint) {
                        const attr = LAYOUT_ANDROID.constraint[position];
                        if (attr) {
                            node.app(this.localizeString(attr), documentId);
                        }
                    }
                    else if (renderParent.layoutRelative) {
                        const attr = LAYOUT_ANDROID.relative[position];
                        if (attr) {
                            node.android(this.localizeString(attr), documentId);
                        }
                    }
                }
                else {
                    if (renderParent.layoutConstraint) {
                        const attr = LAYOUT_ANDROID.constraint[position];
                        if (attr) {
                            const value = node.app(this.localizeString(attr)) || node.app(attr);
                            return value !== STRING_ANDROID.PARENT && value !== renderParent.documentId ? value : '';
                        }
                    }
                    else if (renderParent.layoutRelative) {
                        const attr = LAYOUT_ANDROID.relative[position];
                        if (attr) {
                            return node.android(this.localizeString(attr)) || node.android(attr);
                        }
                    }
                }
            }
            return '';
        }

        public supported(attr: string, result = {}): boolean {
            if (this.localSettings.targetAPI < BUILD_ANDROID.LATEST) {
                const deprecated: ObjectMap<CustomizationResult> = DEPRECATED_ANDROID.android;
                if (deprecated && typeof deprecated[attr] === 'function') {
                    const valid = deprecated[attr](result, this.localSettings.targetAPI, this);
                    if (!valid || Object.keys(result).length) {
                        return valid;
                    }
                }
                for (let i = this.localSettings.targetAPI; i <= BUILD_ANDROID.LATEST; i++) {
                    const version = API_ANDROID[i];
                    if (version && version.android[attr] !== undefined) {
                        const callback: CustomizationResult | boolean = version.android[attr];
                        if (typeof callback === 'function') {
                            return callback(result, this.localSettings.targetAPI, this);
                        }
                        return callback;
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
            if (this.hasProcedure($e.NODE_PROCEDURE.LOCALIZATION)) {
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
            if (id !== undefined) {
                node.setControlType(this.controlName, this.containerType);
            }
            else {
                node.controlId = this.controlId;
                node.controlName = this.controlName;
                node.containerType = this.containerType;
            }
            this.cloneBase(node);
            if (attributes) {
                if (this._boxReset) {
                    Object.assign(node.unsafe('boxReset'), this._boxReset);
                }
                if (this._boxAdjustment) {
                    Object.assign(node.unsafe('boxAdjustment'), this._boxAdjustment);
                }
                for (const name of this._namespaces) {
                    const obj: StringMap = this[`__${name}`];
                    for (const attr in obj) {
                        node.attr(name, attr, name === STRING_ANDROID.ANDROID && attr === 'id' ? node.documentId : obj[attr]);
                    }
                }
            }
            if (position) {
                node.anchorClear();
                if (node.anchor($const.CSS.LEFT, this.documentId)) {
                    node.modifyBox($e.BOX_STANDARD.MARGIN_LEFT);
                    Object.assign(node.unsafe('boxAdjustment'), { marginLeft: 0 });
                }
                if (node.anchor($const.CSS.TOP, this.documentId)) {
                    node.modifyBox($e.BOX_STANDARD.MARGIN_TOP);
                    Object.assign(node.unsafe('boxAdjustment'), { marginTop: 0 });
                }
            }
            return node;
        }

        public setControlType(controlName: string, containerType?: number) {
            this.controlName = controlName;
            if (containerType) {
                this.containerType = containerType;
            }
            else if (this.containerType === 0) {
                this.containerType = CONTAINER_NODE.UNKNOWN;
            }
            if (this.controlId === '') {
                let name: string | undefined;
                if (this.styleElement && this.naturalElement) {
                    name = validateString(this.elementId || $dom.getNamedItem(this.element, 'name'));
                    if (name === STRING_ANDROID.PARENT || RESERVED_JAVA.includes(name)) {
                        name = `_${name}`;
                    }
                }
                this.controlId = $util.convertWord($ResourceUI.generateId(STRING_ANDROID.ANDROID, name || $util.fromLastIndexOf(this.controlName, '.').toLowerCase(), name ? 0 : 1));
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
                    this.setLayoutWidth(STRING_ANDROID.WRAP_CONTENT, false);
                    this.setLayoutHeight(STRING_ANDROID.WRAP_CONTENT, false);
                    return;
                }
                const documentParent = this.documentParent;
                let adjustViewBounds = false;
                if (this.documentBody) {
                    if (!this.hasWidth && this.renderChildren.some(node => node.alignParent($const.CSS.RIGHT))) {
                        this.setLayoutWidth(STRING_ANDROID.MATCH_PARENT, false);
                    }
                    if (!this.hasHeight && this.renderChildren.some(node => node.alignParent($const.CSS.BOTTOM))) {
                        this.setLayoutHeight(STRING_ANDROID.MATCH_PARENT, false);
                    }
                }
                if (this.layoutWidth === '') {
                    let layoutWidth = '';
                    if (this.has($const.CSS.WIDTH) && (!this.inlineStatic || this.cssInitial($const.CSS.WIDTH) === '')) {
                        const width = this.css($const.CSS.WIDTH);
                        let value = -1;
                        if ($css.isLength(width)) {
                            value = this.actualWidth;
                        }
                        else if ($css.isPercent(width)) {
                            if (this.inputElement) {
                                value = this.bounds.width;
                            }
                            else if (renderParent.layoutConstraint && !renderParent.has($const.CSS.WIDTH, $e.CSS_STANDARD.LENGTH)) {
                                if (width === $const.CSS.PERCENT_100) {
                                    layoutWidth = STRING_ANDROID.MATCH_PARENT;
                                }
                                else {
                                    this.app(`layout_constraintWidth_percent`, $math.truncate(parseFloat(width) / 100, this.localSettings.floatPrecision));
                                    layoutWidth = $const.CSS.PX_0;
                                }
                                adjustViewBounds = true;
                            }
                            else if (renderParent.is(CONTAINER_NODE.GRID)) {
                                layoutWidth = $const.CSS.PX_0;
                                this.android('layout_columnWeight', $math.truncate(parseFloat(width) / 100, this.localSettings.floatPrecision));
                                adjustViewBounds = true;
                            }
                            else if (this.imageElement) {
                                if (width === $const.CSS.PERCENT_100 && !renderParent.inlineWidth) {
                                    layoutWidth = STRING_ANDROID.MATCH_PARENT;
                                }
                                else {
                                    value = this.bounds.width;
                                    adjustViewBounds = true;
                                }
                            }
                            else if (width === $const.CSS.PERCENT_100) {
                                if (!this.support.maxWidth) {
                                    const maxWidth = this.css('maxWidth');
                                    const maxValue = this.parseUnit(maxWidth);
                                    const absoluteParent = this.absoluteParent || documentParent;
                                    if (maxWidth === $const.CSS.PERCENT_100) {
                                        if (!renderParent.inlineWidth && $util.aboveRange(maxValue, absoluteParent.box.width)) {
                                            layoutWidth = STRING_ANDROID.MATCH_PARENT;
                                        }
                                        else {
                                            value = Math.min(this.actualWidth, maxValue);
                                        }
                                    }
                                    else if (maxValue > 0) {
                                        if (this.blockDimension) {
                                            value = Math.min(this.actualWidth, maxValue);
                                        }
                                        else {
                                            layoutWidth = Math.ceil(maxValue) < Math.floor(absoluteParent.width) ? STRING_ANDROID.WRAP_CONTENT : STRING_ANDROID.MATCH_PARENT;
                                        }
                                    }
                                }
                                if (layoutWidth === '' && (this.documentRoot || !renderParent.inlineWidth)) {
                                    layoutWidth = STRING_ANDROID.MATCH_PARENT;
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
                    else if (this.imageElement && this.has($const.CSS.HEIGHT)) {
                        layoutWidth = STRING_ANDROID.WRAP_CONTENT;
                        adjustViewBounds = true;
                    }
                    if (layoutWidth === '') {
                        if (this.textElement && this.inlineText && this.textEmpty && !this.visibleStyle.backgroundImage) {
                            layoutWidth = $css.formatPX(this.actualWidth);
                        }
                        else {
                            if (this.blockStatic && !this.inputElement && !renderParent.is(CONTAINER_NODE.GRID)) {
                                if (!documentParent.layoutElement || this.display === 'flex') {
                                    layoutWidth = STRING_ANDROID.MATCH_PARENT;
                                }
                                else if (!documentParent.flexElement && renderParent.layoutConstraint && this.alignParent($const.CSS.LEFT) && this.alignParent($const.CSS.RIGHT)) {
                                    layoutWidth = this.autoMargin.horizontal || this.ascend(false, item => item.has($const.CSS.WIDTH) || item.blockStatic).length ? $const.CSS.PX_0 : STRING_ANDROID.MATCH_PARENT;
                                }
                            }
                            if (layoutWidth === '' && (
                                    renderParent.blockWidth && this.layoutVertical && (renderParent.layoutFrame && this.rightAligned || this.layoutLinear && this.actualChildren.some(item => item.lineBreak) || this.renderChildren.some(item => item.layoutConstraint && item.blockStatic)) ||
                                    !this.pageFlow && this.absoluteParent === documentParent && this.has($const.CSS.LEFT) && this.has($const.CSS.RIGHT) ||
                                    documentParent.flexElement && this.flexbox.grow > 0 && renderParent.flexibleWidth && documentParent.css('flexDirection') === 'row'
                               ))
                            {
                                layoutWidth = STRING_ANDROID.MATCH_PARENT;
                            }
                        }
                    }
                    this.setLayoutWidth(layoutWidth || STRING_ANDROID.WRAP_CONTENT);
                }
                if (this.layoutHeight === '') {
                    let layoutHeight = '';
                    if (this.has($const.CSS.HEIGHT) && (!this.inlineStatic || this.cssInitial($const.CSS.HEIGHT) === '')) {
                        const height = this.css($const.CSS.HEIGHT);
                        let value = -1;
                        if ($css.isLength(height)) {
                            value = this.actualHeight;
                        }
                        else if ($css.isPercent(height)) {
                            if (this.inputElement) {
                                value = this.bounds.height;
                            }
                            else if (this.imageElement) {
                                if (height === $const.CSS.PERCENT_100 && !renderParent.inlineHeight) {
                                    layoutHeight = STRING_ANDROID.MATCH_PARENT;
                                }
                                else {
                                    value = this.bounds.height;
                                    adjustViewBounds = true;
                                }
                            }
                            else if (height === $const.CSS.PERCENT_100) {
                                if (!this.support.maxHeight) {
                                    const maxHeight = this.css('maxHeight');
                                    const maxValue = this.parseUnit(maxHeight);
                                    const absoluteParent = this.absoluteParent || documentParent;
                                    if (maxHeight === $const.CSS.PERCENT_100) {
                                        if (!renderParent.inlineHeight && $util.aboveRange(maxValue, absoluteParent.box.height)) {
                                            layoutHeight = STRING_ANDROID.MATCH_PARENT;
                                        }
                                        else {
                                            value = Math.min(this.actualHeight, maxValue);
                                        }
                                    }
                                    else if (maxValue > 0) {
                                        if (this.blockDimension) {
                                            value = Math.min(this.actualHeight, maxValue);
                                        }
                                        else {
                                            layoutHeight = Math.ceil(maxValue) < Math.floor(absoluteParent.box.height) ? STRING_ANDROID.WRAP_CONTENT : STRING_ANDROID.MATCH_PARENT;
                                        }
                                    }
                                }
                                if (layoutHeight === '' && (this.documentRoot || !renderParent.inlineHeight)) {
                                    layoutHeight = STRING_ANDROID.MATCH_PARENT;
                                }
                            }
                            if (layoutHeight === '' && this.hasHeight) {
                                value = this.actualHeight;
                            }
                        }
                        if (value > 0) {
                            if (this.is(CONTAINER_NODE.LINE) && this.tagName !== 'HR' && this.has($const.CSS.HEIGHT, 0, { map: 'initial' })) {
                                value += this.borderTopWidth + this.borderBottomWidth;
                            }
                            layoutHeight = $css.formatPX(value);
                        }
                    }
                    else if (this.imageElement && this.has($const.CSS.WIDTH)) {
                        layoutHeight = STRING_ANDROID.WRAP_CONTENT;
                        adjustViewBounds = true;
                    }
                    if (layoutHeight === '') {
                        if (this.textEmpty && !this.visibleStyle.backgroundImage) {
                            if (renderParent.layoutConstraint && this.alignParent($const.CSS.TOP) && this.actualHeight >= (this.absoluteParent || documentParent).box.height) {
                                layoutHeight = $const.CSS.PX_0;
                                this.anchor($const.CSS.BOTTOM, STRING_ANDROID.PARENT);
                            }
                            else {
                                layoutHeight = $css.formatPX(this.actualHeight);
                            }
                        }
                        else if (this.display === 'table-cell' || !this.pageFlow && this.leftTopAxis && this.has($const.CSS.TOP) && this.has($const.CSS.BOTTOM) || this.outerWrapper === undefined && this.singleChild && renderParent.flexElement && !renderParent.inlineHeight && renderParent.css('flexDirection') === 'row') {
                            layoutHeight = STRING_ANDROID.MATCH_PARENT;
                        }
                    }
                    this.setLayoutHeight(layoutHeight || STRING_ANDROID.WRAP_CONTENT);
                }
                if (this.has('minWidth') && !(documentParent.flexElement && this.flexbox.grow > 0 && documentParent.css('flexDirection') === 'column')) {
                    this.android('minWidth', this.convertPX(this.css('minWidth')), false);
                }
                if (this.has('minHeight') && !(documentParent.flexElement && this.flexbox.grow > 0 && documentParent.css('flexDirection') === 'row')) {
                    this.android('minHeight', this.convertPX(this.css('minHeight'), $const.CSS.HEIGHT), false);
                }
                if (this.support.maxWidth) {
                    const maxWidth = this.css('maxWidth');
                    let width = -1;
                    if ($css.isLength(maxWidth, true)) {
                        if (maxWidth === $const.CSS.PERCENT_100) {
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
                    else if (!this.pageFlow && this.textElement && this.multiline && this.inlineWidth && !this.preserveWhiteSpace && !/\n/.test(this.textContent)) {
                        width = Math.ceil(this.bounds.width);
                    }
                    if (width !== -1) {
                        this.android('maxWidth', $css.formatPX(width), false);
                        if (this.imageElement) {
                            adjustViewBounds = true;
                        }
                    }
                }
                if (this.support.maxHeight) {
                    const maxHeight = this.css('maxHeight');
                    if ($css.isLength(maxHeight, true)) {
                        let height = -1;
                        if (maxHeight === $const.CSS.PERCENT_100 && this.imageElement) {
                            height = (<HTMLImageElement> this.element).naturalHeight;
                        }
                        else {
                            height = this.parseUnit(this.css('maxHeight'), $const.CSS.HEIGHT);
                        }
                        if (height >= 0) {
                            this.android('maxHeight', $css.formatPX(height));
                            if (this.imageElement) {
                                adjustViewBounds = true;
                            }
                        }
                    }
                }
                if (this.imageElement && (adjustViewBounds || this.blockWidth || this.blockHeight)) {
                    this.android('adjustViewBounds', 'true');
                }
            }
        }

        public setAlignment() {
            const renderParent = this.renderParent;
            if (renderParent) {
                const alignFloat = this.hasAlign($e.NODE_ALIGNMENT.FLOAT);
                const node = this.outerWrapper || this;
                const outerRenderParent = (node.renderParent || renderParent) as T;
                let textAlign = checkTextAlign(this.cssInitial('textAlign', true));
                let textAlignParent = checkTextAlign(this.cssAscend('textAlign'), true);
                if (this.groupParent && !alignFloat && textAlign === '') {
                    const actualParent = $NodeUI.actualParent(this.renderChildren);
                    if (actualParent) {
                        textAlign = checkTextAlign(actualParent.cssInitial('textAlign', true));
                    }
                }
                if (this.pageFlow) {
                    let floating = '';
                    if (this.inlineVertical && (outerRenderParent.layoutHorizontal && !outerRenderParent.support.container.positionRelative || outerRenderParent.is(CONTAINER_NODE.GRID) || this.display === 'table-cell')) {
                        const gravity = this.display === 'table-cell' ? STRING_ANDROID.GRAVITY : STRING_ANDROID.LAYOUT_GRAVITY;
                        switch (this.cssInitial('verticalAlign', true)) {
                            case $const.CSS.TOP:
                                node.mergeGravity(gravity, $const.CSS.TOP);
                                break;
                            case $const.CSS.MIDDLE:
                                node.mergeGravity(gravity, STRING_ANDROID.CENTER_VERTICAL);
                                break;
                            case $const.CSS.BOTTOM:
                                node.mergeGravity(gravity, $const.CSS.BOTTOM);
                                break;
                        }
                    }
                    if (!this.blockWidth) {
                        if (outerRenderParent.layoutVertical || this.documentRoot && (this.layoutVertical || this.layoutFrame)) {
                            if (this.floating) {
                                node.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, this.float);
                            }
                            else if (!setAutoMargin(node) && textAlign !== '' && this.hasWidth && !this.blockStatic && this.display !== 'table') {
                                node.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, textAlign, false);
                            }
                        }
                        if (this.rightAligned || this.renderChildren.length && this.renderChildren.every(item => item.rightAligned)) {
                            floating = $const.CSS.RIGHT;
                        }
                        else if (this.groupParent && alignFloat && !this.renderChildren.some(item => item.rightAligned)) {
                            floating = $const.CSS.LEFT;
                        }
                    }
                    else if (node.groupParent && node.layoutVertical && this.rightAligned) {
                        node.renderEach((item: T) => {
                            if (item.rightAligned) {
                                item.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, $const.CSS.RIGHT);
                            }
                        });
                    }
                    if (renderParent.layoutFrame && this.innerWrapped === undefined) {
                        if (!setAutoMargin(this)) {
                            if (this.floating) {
                                floating = this.float;
                            }
                            if (floating !== '' && (renderParent.inlineWidth || !renderParent.documentRoot && this.singleChild)) {
                                renderParent.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, floating);
                            }
                        }
                        if (this.singleChild && renderParent.display === 'table-cell') {
                            let gravity: string;
                            switch (renderParent.css('verticalAlign')) {
                                case $const.CSS.TOP:
                                    gravity = $const.CSS.TOP;
                                    break;
                                case $const.CSS.BOTTOM:
                                    gravity = $const.CSS.BOTTOM;
                                    break;
                                default:
                                    gravity = STRING_ANDROID.CENTER_VERTICAL;
                                    break;
                            }
                            this.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, gravity);
                        }
                    }
                    else if (outerRenderParent.layoutFrame && renderParent.blockWidth && this.rightAligned) {
                        this.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, $const.CSS.RIGHT);
                    }
                    if (floating !== '') {
                        if (this.blockWidth) {
                            if (textAlign === '' || floating === $const.CSS.RIGHT) {
                                textAlign = floating;
                            }
                        }
                        else {
                            (node.blockWidth && this !== node ? this : node).mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, floating);
                        }
                    }
                    else if (setAutoMargin(node.inlineWidth ? node : this) && textAlign !== '') {
                        textAlignParent = '';
                    }
                }
                if (textAlignParent !== '') {
                    if (this.blockStatic && !this.centerAligned && !this.rightAligned) {
                        node.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, $const.CSS.LEFT, false);
                    }
                }
                if (!this.layoutConstraint && !this.layoutFrame && !this.is(CONTAINER_NODE.GRID) && !this.layoutElement) {
                    if (textAlign !== '') {
                        if (!this.imageOrSvgElement) {
                            this.mergeGravity(STRING_ANDROID.GRAVITY, textAlign);
                        }
                    }
                    else if (textAlignParent !== '' && !this.inputElement) {
                        if (this.imageOrSvgElement) {
                            if (this.pageFlow) {
                                this.mergeGravity(STRING_ANDROID.LAYOUT_GRAVITY, textAlignParent);
                            }
                        }
                        else {
                            this.mergeGravity(STRING_ANDROID.GRAVITY, textAlignParent);
                        }
                    }
                }
            }
        }

        public mergeGravity(attr: string, alignment: string, overwrite = true) {
            if (attr === STRING_ANDROID.LAYOUT_GRAVITY) {
                const renderParent = this.renderParent;
                if (renderParent) {
                    if (isHorizontalAlign(alignment) && (this.blockWidth || renderParent.inlineWidth && this.singleChild || !overwrite && this.outerWrapper && this.has('maxWidth'))) {
                        return;
                    }
                    else if (renderParent.layoutConstraint) {
                        if (!renderParent.layoutHorizontal && !this.positioned) {
                            switch (alignment) {
                                case $const.CSS.TOP:
                                    this.anchor($const.CSS.TOP, STRING_ANDROID.PARENT, false);
                                    break;
                                case $const.CSS.RIGHT:
                                case $const.CSS.END:
                                    this.anchor($const.CSS.RIGHT, STRING_ANDROID.PARENT, false);
                                    break;
                                case $const.CSS.BOTTOM:
                                    this.anchor($const.CSS.BOTTOM, STRING_ANDROID.PARENT, false);
                                    break;
                                case $const.CSS.LEFT:
                                case $const.CSS.START:
                                    this.anchor($const.CSS.LEFT, STRING_ANDROID.PARENT, false);
                                    break;
                                case STRING_ANDROID.CENTER_HORIZONTAL:
                                    this.anchorParent(STRING_ANDROID.HORIZONTAL, undefined, undefined, true);
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
                    checkMergable($const.CSS.CENTER);
                    checkMergable('fill');
                    let x = '';
                    let y = '';
                    let z = '';
                    for (const value of direction.values()) {
                        switch (value) {
                            case $const.CSS.LEFT:
                            case $const.CSS.START:
                            case $const.CSS.RIGHT:
                            case $const.CSS.END:
                            case STRING_ANDROID.CENTER_HORIZONTAL:
                                if (x === '' || overwrite) {
                                    x = value;
                                }
                                break;
                            case $const.CSS.TOP:
                            case $const.CSS.BOTTOM:
                            case STRING_ANDROID.CENTER_VERTICAL:
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
            const renderParent = this.renderParent;
            if (renderParent) {
                const borderWidth = !this.tableElement ? this.styleElement : this.css('boxSizing') === 'content-box' || $client.isUserAgent($client.USER_AGENT.FIREFOX);
                if (borderWidth && this.visibleStyle.borderWidth && !this.is(CONTAINER_NODE.LINE) && (this.actualChildren.length === 0 || !this.actualChildren.every(node => !node.pageFlow && node.absoluteParent === this))) {
                    this.modifyBox($e.BOX_STANDARD.PADDING_LEFT, this.borderLeftWidth);
                    this.modifyBox($e.BOX_STANDARD.PADDING_RIGHT, this.borderRightWidth);
                    this.modifyBox($e.BOX_STANDARD.PADDING_TOP, this.borderTopWidth);
                    this.modifyBox($e.BOX_STANDARD.PADDING_BOTTOM, this.borderBottomWidth);
                }
                this.alignLayout(renderParent);
                this.setLineHeight(renderParent);
                if (this.inlineWidth && this.renderChildren.some(node => node.blockWidth && node.some((item: T) => item.flexibleWidth))) {
                    this.setLayoutWidth(this.documentRoot || renderParent.inlineWidth ? $css.formatPX(this.actualWidth) : STRING_ANDROID.MATCH_PARENT);
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
            const api = API_ANDROID[this.localSettings.targetAPI];
            if (api) {
                setCustomization(api, this.tagName);
                setCustomization(api, this.controlName);
            }
        }

        public setBoxSpacing() {
            const setBoxModel = (attrs: string[], margin: boolean, unmergeable = false) => {
                let top = 0;
                let right = 0;
                let bottom = 0;
                let left = 0;
                for (let i = 0 ; i < attrs.length; i++) {
                    const attr = attrs[i];
                    let value = this._boxReset === undefined || this._boxReset[attr] === 0 ? this[attr] : 0;
                    if (value !== 0 && attr === 'marginRight') {
                        if (value < 0) {
                            if (this.float === $const.CSS.RIGHT) {
                                value = 0;
                            }
                        }
                        else if (this.inline) {
                            const boxRight = this.documentParent.box.right;
                            if (Math.floor(this.bounds.right) > boxRight) {
                                if (this.textElement && !this.singleChild && !this.alignParent($const.CSS.LEFT)) {
                                    setSingleLine(this);
                                }
                                continue;
                            }
                            else if (this.bounds.right + value > boxRight) {
                                value = Math.max(0, boxRight - this.bounds.right);
                            }
                        }
                    }
                    if (this._boxAdjustment) {
                        value += this._boxAdjustment[attr];
                    }
                    switch (i) {
                        case 0:
                            top = value;
                            break;
                        case 1:
                            right = value;
                            break;
                        case 2:
                            bottom = value;
                            break;
                        case 3:
                            left = value;
                            break;
                    }
                }
                if (top !== 0 || left !== 0 || bottom !== 0 || right !== 0) {
                    let mergeAll = 0;
                    let mergeHorizontal = 0;
                    let mergeVertical = 0;
                    if (margin && this.positionStatic && !this.blockWidth && (left < 0 || right < 0)) {
                        switch (this.cssAscend('textAlign')) {
                            case $const.CSS.CENTER: {
                                if (left < right) {
                                    right += Math.abs(left);
                                    right /= 2;
                                    left = 0;
                                }
                                else {
                                    left += Math.abs(right);
                                    left /= 2;
                                    right = 0;
                                }
                                break;
                            }
                            case $const.CSS.RIGHT:
                            case $const.CSS.END:
                                if (left < 0) {
                                    left = 0;
                                }
                                break;
                        }
                    }
                    if (!unmergeable && this.localSettings.targetAPI >= BUILD_ANDROID.OREO) {
                        if (top === right && right === bottom && bottom === left) {
                            mergeAll = top;
                        }
                        else {
                            if (left === right) {
                                mergeHorizontal = left;
                            }
                            if (top === bottom) {
                                mergeVertical = top;
                            }
                        }
                    }
                    if (mergeAll !== 0) {
                        this.android(margin ? STRING_ANDROID.MARGIN : STRING_ANDROID.PADDING, $css.formatPX(mergeAll));
                    }
                    else {
                        if (mergeHorizontal !== 0) {
                            this.android(margin ? STRING_ANDROID.MARGIN_HORIZONTAL : STRING_ANDROID.PADDING_HORIZONTAL, $css.formatPX(mergeHorizontal));
                        }
                        else {
                            if (left !== 0) {
                                this.android(this.localizeString(margin ? STRING_ANDROID.MARGIN_LEFT : STRING_ANDROID.PADDING_LEFT), $css.formatPX(left));
                            }
                            if (right !== 0) {
                                this.android(this.localizeString(margin ? STRING_ANDROID.MARGIN_RIGHT : STRING_ANDROID.PADDING_RIGHT), $css.formatPX(right));
                            }
                        }
                        if (mergeVertical !== 0) {
                            this.android(margin ? STRING_ANDROID.MARGIN_VERTICAL : STRING_ANDROID.PADDING_VERTICAL, $css.formatPX(mergeVertical));
                        }
                        else {
                            if (top !== 0) {
                                this.android(margin ? STRING_ANDROID.MARGIN_TOP : STRING_ANDROID.PADDING_TOP, $css.formatPX(top));
                            }
                            if (bottom !== 0) {
                                this.android(margin ? STRING_ANDROID.MARGIN_BOTTOM : STRING_ANDROID.PADDING_BOTTOM, $css.formatPX(bottom));
                            }
                        }
                    }
                }
            };
            setBoxModel($css.BOX_MARGIN, true, !!this.renderParent && this.renderParent.is(CONTAINER_NODE.GRID));
            setBoxModel($css.BOX_PADDING, false);
        }

        public extractAttributes(depth: number) {
            if (this.dir === 'rtl' && !this.imageOrSvgElement) {
                if (this.textElement) {
                    this.android('textDirection', 'rtl');
                }
                else if (this.renderChildren.length) {
                    this.android('layoutDirection', 'rtl');
                }
            }
            if (this.styleElement && this.naturalElement) {
                const dataset = $css.getDataSet(<HTMLElement> this.element, STRING_ANDROID.ANDROID);
                for (const name in dataset) {
                    const obj = name === 'attr' ? STRING_ANDROID.ANDROID
                                                : REGEXP_DATASETATTR.test(name) ? $util.capitalize(name.substring(4), false) : '';
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

        public setLayoutWidth(value: string, overwrite = true) {
            this.android('layout_width', value, overwrite);
        }

        public setLayoutHeight(value: string, overwrite = true) {
            this.android('layout_height', value, overwrite);
        }

        private alignLayout(renderParent: T) {
            if (this.layoutLinear) {
                const renderChildren = this.renderChildren;
                if (this.layoutVertical) {
                    if (!renderParent.layoutVertical && !renderParent.layoutFrame && !this.documentRoot && !this.hasAlign($e.NODE_ALIGNMENT.TOP)) {
                        let firstChild = renderChildren[0];
                        if (firstChild.baseline) {
                            if (firstChild.renderChildren.length) {
                                firstChild = firstChild.renderChildren[0] as T;
                            }
                            if (firstChild.baseline && (firstChild.textElement || firstChild.inputElement)) {
                                this.android('baselineAlignedChildIndex', '0');
                            }
                        }
                    }
                }
                else {
                    if (renderChildren.some(node => node.floating) && !renderChildren.some(node => node.imageElement && node.baseline)) {
                        this.android('baselineAligned', 'false');
                    }
                    else {
                        const baseline = $NodeUI.baseline(renderChildren, true);
                        if (baseline && (baseline.textElement || baseline.inputElement)) {
                            this.android('baselineAlignedChildIndex', renderChildren.indexOf(baseline).toString());
                        }
                    }
                    if (renderChildren.length > 1) {
                        const child = renderChildren[renderChildren.length - 1];
                        if (child.textElement) {
                            setSingleLine(child);
                        }
                    }
                }
            }
        }

        private setLineHeight(renderParent: T) {
            const lineHeight = this.lineHeight;
            if (lineHeight > 0) {
                const hasOwnStyle = this.has('lineHeight');
                if (this.multiline) {
                    setMultiline(this, lineHeight, hasOwnStyle);
                }
                else if (hasOwnStyle || this.renderChildren.length || renderParent.lineHeight === 0) {
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
                                    if (node.length === 0 && !node.has('lineHeight') && !node.multiline && !node.baselineAltered) {
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

        get anchorTarget(): T {
            const renderParent = this.renderParent;
            if (renderParent && (renderParent.layoutConstraint || renderParent.layoutRelative)) {
                return this;
            }
            return this.outerWrapper || this;
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
                const value: number = ELEMENT_ANDROID[this.tagName];
                if (value) {
                    this._containerType = value;
                }
            }
            return this._containerType;
        }

        get imageOrSvgElement() {
            return this.imageElement || this.svgElement;
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

        set renderExclude(value) {
            this._cached.renderExclude = value;
        }
        get renderExclude() {
            if (this._cached.renderExclude === undefined) {
                if (this.naturalElement && this.length === 0) {
                    if (this.blockStatic || this.layoutVertical) {
                        return this.bounds.height === 0 && this.marginTop <= 0 && this.marginBottom <= 0;
                    }
                    else {
                        return this.bounds.width === 0 && this.textEmpty && this.marginLeft <= 0 && this.marginRight <= 0;
                    }
                }
                else {
                    this._cached.renderExclude = false;
                }
            }
            return this._cached.renderExclude;
        }

        get baselineHeight() {
            if (this._cached.baselineHeight === undefined) {
                let height = 0;
                if (!(this.plainText && this.multiline)) {
                    if (this.multiline && this.cssTry('white-space', 'nowrap')) {
                        height = (<Element> this.element).getBoundingClientRect().height;
                        this.cssFinally('white-space');
                    }
                    else if (this.hasHeight) {
                        height = this.actualHeight;
                    }
                    else {
                        height = this.bounds.height;
                    }
                    if (this.has('lineHeight') && this.lineHeight > height) {
                        height = this.lineHeight;
                    }
                    else if (this.inputElement) {
                        switch (this.controlName) {
                            case CONTAINER_ANDROID.RADIO:
                            case CONTAINER_ANDROID.CHECKBOX:
                                height += 8;
                                break;
                            case CONTAINER_ANDROID.SELECT:
                                height += 4;
                                break;
                        }
                    }
                }
                this._cached.baselineHeight = height;
            }
            return this._cached.baselineHeight;
        }

        get support() {
            if (this._cached.support === undefined) {
                const maxWidth = this.textElement || this.imageOrSvgElement;
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

        get layoutWidth() {
            return this.android('layout_width');
        }

        get layoutHeight() {
            return this.android('layout_height');
        }

        get inlineWidth() {
            return this.layoutWidth === STRING_ANDROID.WRAP_CONTENT;
        }
        get inlineHeight() {
            return this.layoutHeight === STRING_ANDROID.WRAP_CONTENT;
        }

        get blockWidth() {
            return this.layoutWidth === STRING_ANDROID.MATCH_PARENT;
        }
        get blockHeight() {
            return this.layoutHeight === STRING_ANDROID.MATCH_PARENT;
        }

        get flexibleWidth(): boolean {
            return isFlexibleDimension(this, this.layoutWidth);
        }
        get flexibleHeight(): boolean {
            return isFlexibleDimension(this, this.layoutHeight);
        }

        set localSettings(value) {
            if (this._localSettings) {
                Object.assign(this._localSettings, value);
            }
            else {
                this._localSettings = { ...value };
            }
        }
        get localSettings() {
            return this._localSettings;
        }
    };
};