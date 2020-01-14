import { NodeTemplate } from '../../@types/base/application';
import { CachedValueUI, AutoMargin } from '../../@types/base/node';
import { CustomizationResult } from '../../@types/android/application';
import { Constraint, LocalSettings, SupportAndroid } from '../../@types/android/node';

import { CONTAINER_ANDROID, CONTAINER_ANDROID_X, ELEMENT_ANDROID, LAYOUT_ANDROID, RESERVED_JAVA, STRING_ANDROID } from './lib/constant';
import { API_ANDROID, DEPRECATED_ANDROID } from './lib/customization';
import { BUILD_ANDROID, CONTAINER_NODE } from './lib/enumeration';
import { localizeString } from './lib/util';

const $lib = squared.lib;
const { USER_AGENT, isUserAgent } = $lib.client;
const { BOX_MARGIN, BOX_PADDING, formatPX, getDataSet, isLength, isPercent } = $lib.css;
const { getNamedItem } = $lib.dom;
const { clampRange, truncate } = $lib.math;
const { aboveRange, capitalize, convertWord, fromLastIndexOf, isPlainObject, isString, replaceMap } = $lib.util;

const { BOX_STANDARD, CSS_UNIT, NODE_ALIGNMENT, NODE_PROCEDURE } = squared.base.lib.enumeration;

type T = android.base.View;

const REGEX_DATASETATTR = /^attr[A-Z]/;
const REGEX_FORMATTED = /^(?:([a-z]+):)?(\w+)="((?:@+?[a-z]+\/)?.+)"$/;
const REGEX_VALIDSTRING = /[^\w$\-_.]/g;

function checkTextAlign(value: string, ignoreStart: boolean) {
    switch (value) {
        case 'left':
        case 'start':
            return !ignoreStart ? value : '';
        case 'center':
            return STRING_ANDROID.CENTER_HORIZONTAL;
        case 'justify':
        case 'initial':
        case 'inherit':
            return '';
    }
    return value;
}

function isHorizontalAlign(value: string) {
    switch (value) {
        case 'left':
        case 'start':
        case 'right':
        case 'end':
        case STRING_ANDROID.CENTER_HORIZONTAL:
            return true;
    }
    return false;
}

function setAutoMargin(node: T, autoMargin: AutoMargin) {
    if (autoMargin.horizontal && (!node.blockWidth || node.hasWidth || node.hasPX('maxWidth') || node.innerWrapped?.has('width', CSS_UNIT.PERCENT, { not: '100%' }))) {
        node.mergeGravity((node.blockWidth || !node.pageFlow) && node.outerWrapper === undefined ? 'gravity' : 'layout_gravity', autoMargin.leftRight ? STRING_ANDROID.CENTER_HORIZONTAL : (autoMargin.left ? 'right' : 'left'));
        return true;
    }
    return false;
}

function setMultiline(node: T, lineHeight: number, overwrite: boolean, autoPadding: boolean) {
    if (node.api >= BUILD_ANDROID.PIE) {
        node.android('lineHeight', formatPX(lineHeight), overwrite);
    }
    else {
        const offset = (lineHeight - node.actualHeight) / 2;
        if (offset > 0) {
            node.android('lineSpacingExtra', formatPX(offset), overwrite);
        }
    }
    if (autoPadding && node.styleElement && !node.hasPX('height') && node.cssTry('line-height', 'normal')) {
        if (node.cssTry('white-space', 'nowrap')) {
            const offset = (lineHeight - node.boundingClientRect.height) / 2;
            const upper = Math.round(offset);
            if (upper > 0) {
                node.modifyBox(BOX_STANDARD.PADDING_TOP, upper);
                if (!node.blockStatic) {
                    node.modifyBox(BOX_STANDARD.PADDING_BOTTOM, Math.floor(offset));
                }
            }
            node.cssFinally('white-space');
        }
        node.cssFinally('line-height');
    }
}

function setMarginOffset(node: T, lineHeight: number, inlineStyle: boolean, top: boolean, bottom: boolean) {
    if (node.baselineAltered && !node.multiline || node.imageOrSvgElement || node.actualHeight === 0 || node.cssInitial('lineHeight') === 'initial') {
        return;
    }
    if (node.multiline) {
        setMultiline(node, lineHeight, false, true);
    }
    else if ((node.renderChildren.length === 0 || node.inline) && (node.pageFlow || node.textContent.length)) {
        if (inlineStyle && !node.inline && node.inlineText) {
            setMinHeight(node, lineHeight);
            setMultiline(node, lineHeight, false, false);
        }
        else {
            let offset = 0;
            let usePadding = true;
            if (!inlineStyle && node.styleElement && !node.hasPX('height') && node.cssTry('line-height', 'normal')) {
                if (node.cssTry('white-space', 'nowrap')) {
                    offset = (lineHeight - node.boundingClientRect.height) / 2;
                    usePadding = false;
                    node.cssFinally('white-space');
                }
                node.cssFinally('line-height');
            }
            else {
                const { height, numberOfLines } = node.bounds;
                if (node.plainText && <number> numberOfLines > 1) {
                    node.android('minHeight', formatPX(height / <number> numberOfLines));
                    node.mergeGravity('gravity', STRING_ANDROID.CENTER_VERTICAL);
                    return;
                }
                else {
                    offset = (lineHeight - height) / 2;
                }
            }
            const upper = Math.round(offset);
            if (upper > 0) {
                const boxPadding = usePadding && node.textElement && !node.plainText && !inlineStyle;
                if (top) {
                    node.modifyBox(boxPadding ? BOX_STANDARD.PADDING_TOP : BOX_STANDARD.MARGIN_TOP, upper);
                }
                if (bottom) {
                    node.modifyBox(boxPadding ? BOX_STANDARD.PADDING_BOTTOM : BOX_STANDARD.MARGIN_BOTTOM, Math.floor(offset));
                }
            }
        }
    }
    else if (inlineStyle && (!node.hasHeight || lineHeight > node.height) && (node.layoutHorizontal && node.horizontalRows === undefined || node.hasAlign(NODE_ALIGNMENT.SINGLE))) {
        setMinHeight(node, lineHeight);
    }
}

function setMinHeight(node: T, value: number) {
    if (node.inlineText) {
        value += node.contentBoxHeight;
        if (!node.hasPX('height') || value >= Math.floor(node.height)) {
            node.mergeGravity('gravity', STRING_ANDROID.CENTER_VERTICAL, false);
        }
    }
    if (value > node.height) {
        node.android('minHeight', formatPX(value));
    }
}

function isFlexibleDimension(node: T, value: string) {
    if (value === '0px') {
        const renderParent = node.renderParent as T;
        if (renderParent) {
            return renderParent.layoutConstraint || renderParent.is(CONTAINER_NODE.GRID);
        }
    }
    return false;
}

const excludeHorizontal = (node: T) => node.textEmpty && (node.bounds.width === 0 && node.contentBoxWidth === 0 && node.marginLeft <= 0 && node.marginRight <= 0 && !node.visibleStyle.background || node.bounds.height === 0 && node.contentBoxHeight === 0 && node.marginTop <= 0 && node.marginBottom <= 0);
const excludeVertical = (node: T) => node.contentBoxHeight === 0 && (node.bounds.height === 0 || node.pseudoElement && node.textEmpty && node.pageFlow) && (node.marginTop <= 0 && node.marginBottom <= 0 || node.css('overflow') === 'hidden' && $lib.regex.CHAR.UNITZERO.test(node.css('height')));

const LAYOUT_RELATIVE_PARENT = LAYOUT_ANDROID.relativeParent;
const LAYOUT_RELATIVE = LAYOUT_ANDROID.relative;
const LAYOUT_CONSTRAINT = LAYOUT_ANDROID.constraint;
const DEPRECATED: ObjectMap<CustomizationResult> = DEPRECATED_ANDROID.android;

export default (Base: Constructor<squared.base.NodeUI>) => {
    return class View extends Base implements android.base.View {
        public static getControlName(containerType: number, api = BUILD_ANDROID.Q): string {
            const name = CONTAINER_NODE[containerType];
            return api >= BUILD_ANDROID.Q && CONTAINER_ANDROID_X[name] || CONTAINER_ANDROID[name];
        }

        public api = BUILD_ANDROID.LATEST;
        public renderParent?: T;
        public renderTemplates?: (NodeTemplate<T> | null)[];
        public outerWrapper?: T;
        public innerWrapped?: T;
        public companion?: T;
        public extracted?: T[];
        public horizontalRows?: T[][];
        public innerBefore?: T;
        public innerAfter?: T;
        public queryMap?: T[][];
        public readonly renderChildren: T[] = [];
        public readonly constraint: Constraint = {
            horizontal: false,
            vertical: false,
            current: {}
        };

        protected _namespaces = ['android', 'app'];
        protected _cached: CachedValueUI<T> = {};
        protected _controlName = '';
        protected _localSettings!: LocalSettings;
        protected _documentParent?: T;
        protected _boxAdjustment?: BoxModel;
        protected _boxReset?: BoxModel;

        private _localization = false;
        private _containerType = 0;
        private _controlId?: string;
        private __android: StringMap = {};
        private __app: StringMap = {};

        constructor(
            id = 0,
            sessionId = '0',
            element?: Element,
            afterInit?: BindGeneric<T, void>)
        {
            super(id, sessionId, element);
            this.init();
            if (afterInit) {
                afterInit(this);
                this._localization = this.hasProcedure(NODE_PROCEDURE.LOCALIZATION) && this.localSettings.supportRTL;
            }
        }

        public android(attr: string, value?: string, overwrite = true) {
            if (value) {
                value = this.attr('android', attr, value, overwrite);
                if (value !== '') {
                    return value;
                }
            }
            return this.__android[attr] || '';
        }

        public app(attr: string, value?: string, overwrite = true) {
            if (value) {
                value = this.attr('app', attr, value, overwrite);
                if (value !== '') {
                    return value;
                }
            }
            return this.__app[attr] || '';
        }

        public apply(options: {}) {
            for (const name in options) {
                const data = options[name];
                if (isPlainObject(data)) {
                    for (const attr in data) {
                        this.attr(name, attr, data[attr]);
                    }
                }
                else if (data) {
                    this.attr('_', name, data.toString());
                }
            }
        }

        public formatted(value: string, overwrite = true) {
            const match = REGEX_FORMATTED.exec(value);
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
                        const relativeParent = documentId === 'parent';
                        if (overwrite === undefined && documentId !== '') {
                            overwrite = relativeParent;
                        }
                        const attr: string | undefined = LAYOUT_CONSTRAINT[position];
                        if (attr) {
                            let horizontal = false;
                            node.app(this.localizeString(attr), documentId, overwrite);
                            switch (position) {
                                case 'left':
                                case 'right':
                                    if (relativeParent) {
                                        node.constraint.horizontal = true;
                                    }
                                case 'leftRight':
                                case 'rightLeft':
                                    horizontal = true;
                                    break;
                                case 'top':
                                case 'bottom':
                                case 'baseline':
                                    if (relativeParent) {
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
                    const relativeParent = documentId === 'true';
                    if (overwrite === undefined && documentId !== '') {
                        overwrite = relativeParent;
                    }
                    const attr: string | undefined = (relativeParent ? LAYOUT_RELATIVE_PARENT : LAYOUT_RELATIVE)[position];
                    if (attr) {
                        node.android(this.localizeString(attr), documentId, overwrite);
                        return true;
                    }
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
                        if (horizontal) {
                            node.anchor('left', 'parent', overwrite);
                            node.anchor('right', 'parent', overwrite);
                            node.constraint.horizontal = true;
                        }
                        else {
                            node.anchor('top', 'parent', overwrite);
                            node.anchor('bottom', 'parent', overwrite);
                            node.constraint.vertical = true;
                        }
                        if (style) {
                            node.anchorStyle(orientation, style, bias, overwrite);
                        }
                        return true;
                    }
                }
                else if (renderParent.layoutRelative) {
                    node.anchor(horizontal ? 'centerHorizontal' : 'centerVertical', 'true', overwrite);
                    return true;
                }
            }
            return false;
        }

        public anchorStyle(orientation: string, value = 'packed', bias = 0, overwrite = true) {
            const node = this.anchorTarget;
            if (orientation === STRING_ANDROID.HORIZONTAL) {
                node.app('layout_constraintHorizontal_chainStyle', value, overwrite);
                node.app('layout_constraintHorizontal_bias', bias.toString(), overwrite);
            }
            else {
                node.app('layout_constraintVertical_chainStyle', value, overwrite);
                node.app('layout_constraintVertical_bias', bias.toString(), overwrite);
            }
        }

        public anchorDelete(...position: string[]) {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as T;
            if (renderParent) {
                if (renderParent.layoutConstraint) {
                    node.delete('app', ...replaceMap<string, string>(position, value => this.localizeString(LAYOUT_CONSTRAINT[value])));
                }
                else if (renderParent.layoutRelative) {
                    for (const value of position) {
                        if (node.alignSibling(value) !== '') {
                            const attr: string | undefined = LAYOUT_RELATIVE[value];
                            if (attr) {
                                node.delete('android', LAYOUT_RELATIVE[value], this.localizeString(LAYOUT_RELATIVE[value]));
                            }
                        }
                        else {
                            const attr: string | undefined = LAYOUT_RELATIVE_PARENT[value];
                            if (attr) {
                                node.delete('android', this.localizeString(attr));
                            }
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
                    node.anchorDelete(...Object.keys(LAYOUT_CONSTRAINT));
                }
                else if (renderParent.layoutRelative) {
                    node.anchorDelete(...Object.keys(LAYOUT_RELATIVE_PARENT));
                    node.anchorDelete(...Object.keys(LAYOUT_RELATIVE));
                }
            }
        }

        public alignParent(position: string) {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as T;
            if (renderParent) {
                if (renderParent.layoutConstraint) {
                    const attr: string | undefined = LAYOUT_CONSTRAINT[position];
                    if (attr) {
                        return node.app(this.localizeString(attr)) === 'parent' || node.app(attr) === 'parent';
                    }
                }
                else if (renderParent.layoutRelative) {
                    const attr: string | undefined = LAYOUT_RELATIVE_PARENT[position];
                    if (attr) {
                        return node.android(this.localizeString(attr)) === 'true' || node.android(attr) === 'true';
                    }
                }
                else if (renderParent.layoutLinear) {
                    const children = renderParent.renderChildren;
                    if (renderParent.layoutVertical) {
                        switch (position) {
                            case 'top':
                                return node === children[0];
                            case 'bottom':
                                return node === children[children.length - 1];
                        }
                    }
                    else {
                        switch (position) {
                            case 'left':
                            case 'start':
                                return node === children[0];
                            case 'right':
                            case 'end':
                                return node === children[children.length - 1];
                        }
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
                        const attr: string | undefined = LAYOUT_CONSTRAINT[position];
                        if (attr) {
                            node.app(this.localizeString(attr), documentId);
                        }
                    }
                    else if (renderParent.layoutRelative) {
                        const attr: string | undefined = LAYOUT_RELATIVE[position];
                        if (attr) {
                            node.android(this.localizeString(attr), documentId);
                        }
                    }
                }
                else {
                    if (renderParent.layoutConstraint) {
                        const attr: string | undefined = LAYOUT_CONSTRAINT[position];
                        if (attr) {
                            const value = node.app(this.localizeString(attr)) || node.app(attr);
                            return value !== 'parent' && value !== renderParent.documentId ? value : '';
                        }
                    }
                    else if (renderParent.layoutRelative) {
                        const attr: string | undefined = LAYOUT_RELATIVE[position];
                        if (attr) {
                            return node.android(this.localizeString(attr)) || node.android(attr);
                        }
                    }
                }
            }
            return '';
        }

        public supported(attr: string, result = {}): boolean {
            if (typeof DEPRECATED[attr] === 'function') {
                const valid = DEPRECATED[attr](result, this.api, this);
                if (!valid || Object.keys(result).length) {
                    return valid;
                }
            }
            for (let i = this.api; i <= BUILD_ANDROID.LATEST; i++) {
                const callback = API_ANDROID[i]?.android[attr];
                if (callback !== undefined) {
                    if (typeof callback === 'function') {
                        return callback(result, this.api, this);
                    }
                    return callback;
                }
            }
            return true;
        }

        public combine(...objs: string[]) {
            const namespaces = this._namespaces;
            const all = objs.length === 0;
            const result: string[] = [];
            let requireId = false;
            let id = '';
            for (const name of namespaces) {
                if (all || objs.includes(name)) {
                    const obj: StringMap = this['__' + name];
                    if (obj) {
                        const prefix = name + ':';
                        switch (name) {
                            case 'android':
                                if (this.api < BUILD_ANDROID.LATEST) {
                                    for (let attr in obj) {
                                        if (attr === 'id') {
                                            id = obj[attr];
                                        }
                                        else {
                                            const data: ObjectMap<string | boolean> = {};
                                            let value = obj[attr];
                                            if (!this.supported(attr, data)) {
                                                continue;
                                            }
                                            if (Object.keys(data).length) {
                                                if (isString(data.attr)) {
                                                    attr = data.attr;
                                                }
                                                if (isString(data.value)) {
                                                    value = data.value;
                                                }
                                            }
                                            result.push(prefix + `${attr}="${value}"`);
                                        }
                                    }
                                }
                                else {
                                    for (const attr in obj) {
                                        if (attr === 'id') {
                                            id = obj[attr];
                                        }
                                        else {
                                            result.push(prefix + `${attr}="${obj[attr]}"`);
                                        }
                                    }
                                }
                                requireId = true;
                                break;
                            case '_':
                                for (const attr in obj) {
                                    result.push(`${attr}="${obj[attr]}"`);
                                }
                                break;
                            default:
                                for (const attr in obj) {
                                    result.push(prefix + `${attr}="${obj[attr]}"`);
                                }
                                break;
                        }
                    }
                }
            }
            result.sort((a, b) => a > b ? 1 : -1);
            if (requireId) {
                result.unshift(`android:id="${id !== '' ? id : '@+id/' + this.controlId}"`);
            }
            return result;
        }

        public localizeString(value: string) {
            return localizeString(value, this._localization, this.api);
        }

        public hide(invisible?: boolean) {
            if (invisible) {
                this.android('visibility', 'invisible');
            }
            else {
                super.hide();
            }
        }

        public clone(id?: number, attributes = true, position = false): T {
            const node = new View(id || this.id, this.sessionId, this.element || undefined);
            node.localSettings = { ...this.localSettings };
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
                Object.assign(node.unsafe('boxReset'), this._boxReset);
                Object.assign(node.unsafe('boxAdjustment'), this._boxAdjustment);
                for (const name of this._namespaces) {
                    const obj: StringMap = this['__' + name];
                    if (obj) {
                        for (const attr in obj) {
                            node.attr(name, attr, attr === 'id' && name === 'android' ? node.documentId : obj[attr]);
                        }
                    }
                }
            }
            if (position) {
                node.anchorClear();
                const documentId = this.documentId;
                if (node.anchor('left', documentId)) {
                    node.modifyBox(BOX_STANDARD.MARGIN_LEFT);
                    Object.assign(node.unsafe('boxAdjustment'), { marginLeft: 0 });
                }
                if (node.anchor('top', documentId)) {
                    node.modifyBox(BOX_STANDARD.MARGIN_TOP);
                    Object.assign(node.unsafe('boxAdjustment'), { marginTop: 0 });
                }
            }
            node.saveAsInitial();
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
        }

        public setLayout() {
            switch (this.css('visibility')) {
                case 'hidden':
                case 'collapse':
                    this.hide(true);
                    break;
            }
            if (this.plainText) {
                this.setLayoutWidth('wrap_content', false);
                this.setLayoutHeight('wrap_content', false);
                return;
            }
            const documentParent = this.documentParent as T;
            const renderParent = this.renderParent as T;
            const maxDimension = this.support.maxDimension;
            let adjustViewBounds = false;
            if (this.documentBody) {
                const hasFixedElements = renderParent.id === 0 && this.renderChildren.some(node => node.css('position') === 'fixed');
                if (this.css('width') === '100%' || this.css('minWidth') === '100%' || hasFixedElements || this.blockStatic && !this.hasPX('width') && !this.hasPX('maxWidth')) {
                    this.setLayoutWidth('match_parent', false);
                }
                if (this.css('height') === '100%' || this.css('minHeight') === '100%' || hasFixedElements) {
                    this.setLayoutHeight('match_parent', false);
                }
            }
            if (this.layoutWidth === '') {
                let layoutWidth = '';
                if (this.hasPX('width') && (!this.inlineStatic || this.cssInitial('width') === '')) {
                    const width = this.css('width');
                    let value = -1;
                    if (isLength(width)) {
                        value = this.actualWidth;
                    }
                    else if (isPercent(width)) {
                        if (this.inputElement) {
                            value = this.bounds.width;
                        }
                        else if (renderParent.layoutConstraint && !renderParent.hasPX('width', false)) {
                            if (width === '100%') {
                                layoutWidth = 'match_parent';
                            }
                            else {
                                const percent = Math.min((parseFloat(width) / 100) + this.contentBoxWidthPercent, 1);
                                this.app('layout_constraintWidth_percent', truncate(percent, this.localSettings.floatPrecision));
                                layoutWidth = percent === 1 ? 'match_parent' : '0px';
                            }
                            adjustViewBounds = true;
                        }
                        else if (renderParent.is(CONTAINER_NODE.GRID)) {
                            layoutWidth = '0px';
                            this.android('layout_columnWeight', truncate(parseFloat(width) / 100, this.localSettings.floatPrecision));
                            adjustViewBounds = true;
                        }
                        else if (this.imageElement) {
                            if (width === '100%' && !renderParent.inlineWidth) {
                                layoutWidth = 'match_parent';
                            }
                            else {
                                value = this.bounds.width;
                                adjustViewBounds = true;
                            }
                        }
                        else if (width === '100%') {
                            if (!maxDimension) {
                                const maxWidth = this.css('maxWidth');
                                const maxValue = this.parseUnit(maxWidth);
                                const absoluteParent = this.absoluteParent || documentParent;
                                if (maxWidth === '100%') {
                                    if (!renderParent.inlineWidth && aboveRange(maxValue, absoluteParent.box.width)) {
                                        layoutWidth = 'match_parent';
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
                                        layoutWidth = Math.ceil(maxValue) < Math.floor(absoluteParent.width) ? 'wrap_content' : 'match_parent';
                                    }
                                }
                            }
                            if (layoutWidth === '' && (this.documentRoot || !renderParent.inlineWidth)) {
                                layoutWidth = 'match_parent';
                            }
                        }
                        else {
                            value = this.actualWidth;
                        }
                    }
                    if (value > 0) {
                        layoutWidth = formatPX(value);
                    }
                }
                else if (this.length) {
                    switch (this.cssInitial('width')) {
                        case 'max-content':
                        case 'fit-content':
                            for (const node of this.renderChildren) {
                                if (!node.hasPX('width')) {
                                    node.setLayoutWidth('wrap_content');
                                }
                            }
                            layoutWidth = 'wrap_content';
                            break;
                        case 'min-content':
                            const nodes: T[] = [];
                            let maxWidth = 0;
                            for (const node of this.renderChildren) {
                                if (!node.textElement || node.hasPX('width')) {
                                    const actualWidth = node.actualWidth;
                                    if (actualWidth > maxWidth) {
                                        maxWidth = actualWidth;
                                    }
                                }
                                else {
                                    const minWidth = node.parseUnit(node.css('minWidth'));
                                    if (minWidth > maxWidth) {
                                        maxWidth = minWidth;
                                    }
                                    nodes.push(node);
                                }
                            }
                            if (nodes.length) {
                                const widthPX = formatPX(maxWidth);
                                for (const node of nodes) {
                                    node.css('maxWidth', widthPX);
                                }
                            }
                            layoutWidth = 'wrap_content';
                            break;
                    }
                }
                else if (this.imageElement && this.hasPX('height')) {
                    layoutWidth = 'wrap_content';
                    adjustViewBounds = true;
                }
                if (layoutWidth === '') {
                    if (this.textElement && this.textEmpty && !this.visibleStyle.backgroundImage) {
                        layoutWidth = formatPX(this.actualWidth);
                    }
                    else {
                        const checkParentWidth = () => {
                            let current = renderParent;
                            let blockAll = true;
                            do {
                                if (!current.blockWidth) {
                                    blockAll = false;
                                    if (!current.inlineWidth) {
                                        layoutWidth = 'match_parent';
                                    }
                                    else if (this.styleElement && this.cssTry('display', 'inline-block')) {
                                        if (this.boundingClientRect.width < this.bounds.width) {
                                            layoutWidth = 'match_parent';
                                        }
                                        this.cssFinally('display');
                                    }
                                    return;
                                }
                                else if (current.documentBody) {
                                    break;
                                }
                                current = current.renderParent as T;
                            }
                            while (current);
                            if (blockAll && (renderParent.layoutVertical || renderParent.layoutFrame || this.onlyChild || (renderParent.layoutRelative || renderParent.layoutConstraint) && this.alignSibling('leftRight') === '' && this.alignSibling('rightLeft') === '')) {
                                layoutWidth = 'match_parent';
                            }
                        };
                        if (this.blockStatic && !this.inputElement && !renderParent.is(CONTAINER_NODE.GRID)) {
                            if (this.display === 'flex') {
                                if (renderParent.layoutConstraint && this.css('flexDirection').startsWith('column')) {
                                    layoutWidth = '0px';
                                }
                                else if (!documentParent.layoutElement) {
                                    layoutWidth = 'match_parent';
                                }
                            }
                            else if (!documentParent.layoutElement) {
                                checkParentWidth();
                            }
                            else if (this.gridElement && this.onlyChild) {
                                layoutWidth = 'match_parent';
                            }
                        }
                        if (layoutWidth === '' && !this.floating) {
                            if (this.layoutVertical && !renderParent.inlineWidth && (renderParent.layoutFrame && this.rightAligned || this.layoutLinear && this.naturalElements.some(item => item.lineBreak) || this.renderChildren.some(item => item.layoutConstraint && item.blockStatic)) && !this.documentRoot ||
                                !this.pageFlow && this.absoluteParent === documentParent && this.hasPX('left') && this.hasPX('right') ||
                                this.is(CONTAINER_NODE.GRID) && this.some((node: T) => parseFloat(node.android('layout_columnWeight')) > 0) ||
                                documentParent.flexElement && this.flexbox.grow > 0 && renderParent.flexibleWidth && documentParent.css('flexDirection').startsWith('row'))
                            {
                                layoutWidth = 'match_parent';
                            }
                            else if (this.naturalElement && !this.inlineHorizontal && this.some(item => item.naturalElement && item.blockStatic && item.textElement) && !documentParent.layoutElement) {
                                checkParentWidth();
                            }
                        }
                    }
                }
                this.setLayoutWidth(layoutWidth || 'wrap_content');
            }
            let layoutHeight = this.layoutHeight;
            if (this.layoutHeight === '') {
                if (this.hasPX('height') && (!this.inlineStatic || this.cssInitial('height') === '')) {
                    const height = this.css('height');
                    let value = -1;
                    if (isLength(height)) {
                        value = this.actualHeight;
                    }
                    else if (isPercent(height)) {
                        if (this.inputElement) {
                            value = this.bounds.height;
                        }
                        else if (this.imageElement) {
                            if (height === '100%' && !renderParent.inlineHeight) {
                                layoutHeight = 'match_parent';
                            }
                            else {
                                value = this.bounds.height;
                                adjustViewBounds = true;
                            }
                        }
                        else if (height === '100%') {
                            if (!maxDimension) {
                                const maxHeight = this.css('maxHeight');
                                const maxValue = this.parseUnit(maxHeight);
                                const absoluteParent = this.absoluteParent || documentParent;
                                if (maxHeight === '100%') {
                                    if (!renderParent.inlineHeight && aboveRange(maxValue, absoluteParent.box.height)) {
                                        layoutHeight = 'match_parent';
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
                                        layoutHeight = Math.ceil(maxValue) < Math.floor(absoluteParent.box.height) ? 'wrap_content' : 'match_parent';
                                    }
                                }
                            }
                            if (layoutHeight === '' && (this.documentRoot || this.onlyChild && !renderParent.inlineHeight)) {
                                layoutHeight = 'match_parent';
                            }
                        }
                        if (layoutHeight === '' && this.hasHeight) {
                            value = this.actualHeight;
                        }
                    }
                    if (value > 0) {
                        if (this.is(CONTAINER_NODE.LINE) && this.tagName !== 'HR' && this.hasPX('height', true, true)) {
                            value += this.borderTopWidth + this.borderBottomWidth;
                        }
                        layoutHeight = formatPX(value);
                    }
                }
                else if (this.imageElement && this.hasPX('width')) {
                    layoutHeight = 'wrap_content';
                    adjustViewBounds = true;
                }
                if (layoutHeight === '') {
                    if (this.textElement && this.textEmpty && !this.visibleStyle.backgroundImage) {
                        if (renderParent.layoutConstraint && !this.floating && this.alignParent('top') && this.actualHeight >= (this.absoluteParent || documentParent).box.height) {
                            layoutHeight = '0px';
                            this.anchor('bottom', 'parent');
                        }
                        else {
                            layoutHeight = formatPX(this.actualHeight);
                        }
                    }
                    else if (this.display === 'table-cell' || !this.pageFlow && this.leftTopAxis && this.hasPX('top') && this.hasPX('bottom') || this.onlyChild && renderParent.flexElement && !renderParent.inlineHeight && renderParent.css('flexDirection').startsWith('row') && this.outerWrapper === undefined) {
                        layoutHeight = 'match_parent';
                    }
                }
                this.setLayoutHeight(layoutHeight || 'wrap_content');
            }
            else if (layoutHeight === '0px' && renderParent.inlineHeight && renderParent.android('minHeight') === '' && !documentParent.layoutElement) {
                this.setLayoutHeight('wrap_content');
            }
            const isFlexible = (direction: string) => !(documentParent.flexElement && documentParent.css('flexDirection').startsWith(direction) && this.flexbox.grow > 0);
            if (this.hasPX('minWidth') && isFlexible('column')) {
                this.android('minWidth', this.convertPX(this.css('minWidth')), false);
            }
            if (this.hasPX('minHeight') && isFlexible('row') && this.display !== 'table-cell') {
                this.android('minHeight', this.convertPX(this.css('minHeight'), 'height'), false);
            }
            if (maxDimension) {
                const maxWidth = this.css('maxWidth');
                const maxHeight = this.css('maxHeight');
                let width = -1;
                if (isLength(maxWidth, true)) {
                    if (maxWidth === '100%') {
                        if (this.svgElement) {
                            width = this.bounds.width;
                        }
                        else if (this.imageElement) {
                            width = this.toElementInt('naturalWidth');
                            if (width > documentParent.actualWidth) {
                                width = -1;
                                this.setLayoutWidth('match_parent');
                                adjustViewBounds = true;
                            }
                        }
                        else if (!renderParent.inlineWidth) {
                            this.setLayoutWidth('match_parent');
                            adjustViewBounds = true;
                        }
                    }
                    else {
                        width = this.parseUnit(maxWidth);
                    }
                }
                else if (!this.pageFlow && this.multiline && this.inlineWidth && !this.preserveWhiteSpace && (this.ascend({ condition: item => item.hasPX('width') }).length > 0 || !/\n/.test(this.textContent))) {
                    width = Math.ceil(this.bounds.width);
                }
                if (width >= 0) {
                    this.android('maxWidth', formatPX(width), false);
                    if (this.textElement) {
                        this.android('ellipsize', 'end');
                    }
                    else if (this.imageElement) {
                        adjustViewBounds = true;
                    }
                }
                if (isLength(maxHeight, true)) {
                    let height = -1;
                    if (maxHeight === '100%' && !this.svgElement) {
                        if (!renderParent.inlineHeight) {
                            this.setLayoutHeight('match_parent');
                            adjustViewBounds = true;
                        }
                        else {
                            height = this.imageElement ? this.toElementInt('naturalHeight') : this.parseUnit(maxHeight, 'height');
                        }
                    }
                    else {
                        height = this.parseUnit(maxHeight, 'height');
                    }
                    if (height >= 0) {
                        this.android('maxHeight', formatPX(height));
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

        public setAlignment() {
            const node = this.outerWrapper || this;
            const renderParent = this.renderParent as T;
            const outerRenderParent = (node.renderParent || renderParent) as T;
            const { autoMargin, rightAligned } = this;
            let textAlign = checkTextAlign(this.cssInitial('textAlign', true), false);
            let textAlignParent = checkTextAlign(this.cssAscend('textAlign'), true);
            if (this.nodeGroup && textAlign === '' && !this.hasAlign(NODE_ALIGNMENT.FLOAT)) {
                const parent = this.actualParent;
                if (parent) {
                    textAlign = checkTextAlign(parent.cssInitial('textAlign', true), false);
                }
            }
            if (this.pageFlow) {
                let floating = '';
                if (this.inlineVertical && (outerRenderParent.layoutHorizontal && !outerRenderParent.support.positionRelative || outerRenderParent.is(CONTAINER_NODE.GRID) || this.display === 'table-cell')) {
                    const gravity = this.display === 'table-cell' ? 'gravity' : 'layout_gravity';
                    switch (this.cssInitial('verticalAlign', true)) {
                        case 'top':
                            node.mergeGravity(gravity, 'top');
                            break;
                        case 'middle':
                            node.mergeGravity(gravity, STRING_ANDROID.CENTER_VERTICAL);
                            break;
                        case 'bottom':
                            node.mergeGravity(gravity, 'bottom');
                            break;
                    }
                }
                if (!this.blockWidth) {
                    if (outerRenderParent.layoutVertical || this.documentRoot && (this.layoutVertical || this.layoutFrame)) {
                        if (this.floating) {
                            node.mergeGravity('layout_gravity', this.float);
                        }
                        else if (!setAutoMargin(node, autoMargin) && textAlign !== '' && this.hasWidth && !this.blockStatic && !this.inputElement && this.display !== 'table') {
                            node.mergeGravity('layout_gravity', textAlign, false);
                        }
                    }
                    if (rightAligned) {
                        floating = 'right';
                    }
                    else if (this.nodeGroup) {
                        if (this.renderChildren.every(item => item.rightAligned)) {
                            floating = 'right';
                        }
                        else if (this.hasAlign(NODE_ALIGNMENT.FLOAT) && !this.renderChildren.some(item => item.rightAligned)) {
                            floating = 'left';
                        }
                    }
                }
                else if (rightAligned && node.nodeGroup && node.layoutVertical) {
                    node.renderEach((item: T) => {
                        if (item.rightAligned) {
                            item.mergeGravity('layout_gravity', 'right');
                        }
                    });
                }
                if (renderParent.layoutFrame && this.innerWrapped === undefined) {
                    if (!setAutoMargin(this, autoMargin)) {
                        if (this.floating) {
                            floating = this.float;
                        }
                        if (floating !== '' && !renderParent.naturalElement && (renderParent.inlineWidth || !renderParent.documentRoot && this.onlyChild)) {
                            renderParent.mergeGravity('layout_gravity', floating);
                            floating = '';
                        }
                        if (this.centerAligned) {
                            this.mergeGravity('layout_gravity', checkTextAlign('center', false));
                        }
                    }
                    if (this.onlyChild && renderParent.display === 'table-cell') {
                        let gravity: string;
                        switch (renderParent.css('verticalAlign')) {
                            case 'top':
                                gravity = 'top';
                                break;
                            case 'bottom':
                                gravity = 'bottom';
                                break;
                            default:
                                gravity = STRING_ANDROID.CENTER_VERTICAL;
                                break;
                        }
                        this.mergeGravity('layout_gravity', gravity);
                    }
                }
                else if (rightAligned && outerRenderParent.layoutFrame && renderParent.blockWidth) {
                    this.mergeGravity('layout_gravity', 'right');
                }
                if (floating !== '') {
                    if (this.blockWidth) {
                        if (textAlign === '' || floating === 'right') {
                            textAlign = floating;
                        }
                    }
                    else {
                        (node.blockWidth && this !== node ? this : node).mergeGravity('layout_gravity', floating);
                    }
                }
                else if (setAutoMargin(node.inlineWidth ? node : this, autoMargin) && textAlign !== '') {
                    textAlignParent = '';
                }
            }
            if (textAlignParent !== '' && this.blockStatic && !this.centerAligned && !rightAligned) {
                node.mergeGravity('layout_gravity', 'left', false);
            }
            if (!this.layoutConstraint && !this.layoutFrame && !this.is(CONTAINER_NODE.GRID) && !this.layoutElement) {
                if (textAlign !== '') {
                    if (!this.imageOrSvgElement) {
                        this.mergeGravity('gravity', textAlign);
                    }
                }
                else if (textAlignParent !== '' && !this.inputElement) {
                    if (this.imageOrSvgElement) {
                        if (this.pageFlow) {
                            this.mergeGravity('layout_gravity', textAlignParent);
                        }
                    }
                    else if (!this.nodeGroup || !this.hasAlign(NODE_ALIGNMENT.FLOAT)) {
                        this.mergeGravity('gravity', textAlignParent);
                    }
                }
            }
            if (autoMargin.vertical && (renderParent.layoutFrame || renderParent.layoutLinear && renderParent.layoutVertical)) {
                node.mergeGravity('layout_gravity', autoMargin.topBottom ? STRING_ANDROID.CENTER_VERTICAL : (autoMargin.top ? 'bottom' : 'top'));
            }
        }

        public mergeGravity(attr: string, alignment: string, overwrite = true) {
            if (attr === 'layout_gravity') {
                const renderParent = this.renderParent;
                if (renderParent) {
                    if (isHorizontalAlign(alignment) && (this.blockWidth || renderParent.inlineWidth && this.onlyChild || !overwrite && this.outerWrapper && this.hasPX('maxWidth'))) {
                        return;
                    }
                    else if (renderParent.layoutRelative) {
                        if (alignment === STRING_ANDROID.CENTER_HORIZONTAL && this.alignSibling('leftRight') === '' && this.alignSibling('rightLeft') === '') {
                            this.anchorDelete('left', 'right');
                            this.anchor('centerHorizontal', 'true');
                            return;
                        }
                    }
                    else if (renderParent.layoutConstraint) {
                        if (!renderParent.layoutHorizontal && !this.positioned) {
                            switch (alignment) {
                                case 'top':
                                    this.anchor('top', 'parent', false);
                                    break;
                                case 'right':
                                case 'end':
                                    if (this.alignSibling('rightLeft') === '') {
                                        this.anchor('right', 'parent', false);
                                    }
                                    break;
                                case 'bottom':
                                    this.anchor('bottom', 'parent', false);
                                    break;
                                case 'left':
                                case 'start':
                                    if (this.alignSibling('leftRight') === '') {
                                        this.anchor('left', 'parent', false);
                                    }
                                    break;
                                case STRING_ANDROID.CENTER_HORIZONTAL:
                                    if (this.alignSibling('leftRight') === '' && this.alignSibling('rightLeft') === '') {
                                        this.anchorParent(STRING_ANDROID.HORIZONTAL, undefined, undefined, true);
                                    }
                                    break;
                            }
                        }
                        return;
                    }
                }
            }
            else if (this.is(CONTAINER_NODE.TEXT) && this.textEmpty) {
                return;
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
                    result = checkTextAlign(direction.values().next().value, false);
                default:
                    function checkMergable(value: string) {
                        const horizontal = value + '_horizontal';
                        const vertical = value + '_vertical';
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
                            case 'left':
                            case 'start':
                            case 'right':
                            case 'end':
                            case STRING_ANDROID.CENTER_HORIZONTAL:
                                if (x === '' || overwrite) {
                                    x = value;
                                }
                                break;
                            case 'top':
                            case 'bottom':
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
                    result = x !== '' && y !== '' ? x + '|' + y : x || y;
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
                const borderWidth = !this.tableElement ? this.styleElement : this.css('boxSizing') === 'content-box' || isUserAgent(USER_AGENT.FIREFOX);
                if (borderWidth && this.visibleStyle.borderWidth && !this.is(CONTAINER_NODE.LINE) && (this.renderChildren.length === 0 || !this.naturalChildren.every(node => !node.pageFlow && node.absoluteParent === this))) {
                    this.modifyBox(BOX_STANDARD.PADDING_LEFT, this.borderLeftWidth);
                    this.modifyBox(BOX_STANDARD.PADDING_RIGHT, this.borderRightWidth);
                    this.modifyBox(BOX_STANDARD.PADDING_TOP, this.borderTopWidth);
                    this.modifyBox(BOX_STANDARD.PADDING_BOTTOM, this.borderBottomWidth);
                }
                this.alignLayout(renderParent);
                this.setLineHeight(renderParent);
                if (this.inlineWidth && this.renderChildren.some(node => node.blockWidth && node.some((item: T) => item.flexibleWidth))) {
                    this.setLayoutWidth(this.documentRoot || renderParent.inlineWidth ? formatPX(this.actualWidth) : 'match_parent');
                }
            }
        }

        public applyCustomizations(overwrite = true) {
            const setCustomization = (obj: ObjectMap<StringMap>) => {
                if (obj) {
                    for (const name in obj) {
                        const data = obj[name];
                        for (const attr in data) {
                            this.attr(name, attr, data[attr], overwrite);
                        }
                    }
                }
            };
            const { tagName, controlName } = this;
            let assign = API_ANDROID[0].assign;
            setCustomization(assign[tagName]);
            setCustomization(assign[controlName]);
            const api = API_ANDROID[this.api];
            if (api) {
                assign = api.assign;
                setCustomization(assign[tagName]);
                setCustomization(assign[controlName]);
            }
        }

        public setBoxSpacing() {
            const boxReset = this._boxReset;
            const boxAdjustment = this._boxAdjustment;
            const setBoxModel = (attrs: string[], margin: boolean, unmergeable: boolean) => {
                let top = 0;
                let right = 0;
                let bottom = 0;
                let left = 0;
                for (let i = 0 ; i < 4; i++) {
                    const attr = attrs[i];
                    let value: number = boxReset === undefined || boxReset[attr] === 0 ? this[attr] : 0;
                    if (value !== 0) {
                        switch (attr) {
                            case 'marginRight':
                                if (value < 0) {
                                    if (this.float === 'right' && aboveRange(this.linear.right, this.documentParent.box.right)) {
                                        value = 0;
                                    }
                                }
                                else if (this.inline) {
                                    const outer = this.documentParent.box.right;
                                    const inner = this.bounds.right;
                                    if (Math.floor(inner) > outer) {
                                        if (!this.onlyChild && !this.alignParent('left')) {
                                            this.setSingleLine(true);
                                        }
                                        continue;
                                    }
                                    else if (inner + value > outer) {
                                        value = clampRange(outer - inner, 0, value);
                                    }
                                }
                                break;
                            case 'marginBottom':
                                if (value < 0 && this.pageFlow && !this.blockStatic) {
                                    value = 0;
                                }
                                break;
                            case 'paddingTop':
                                value = this.actualPadding(attr, value);
                                break;
                            case 'paddingBottom':
                                if (this.layoutVertical && this.hasPX('height')) {
                                    continue;
                                }
                                else {
                                    value = this.actualPadding(attr, value);
                                }
                                break;
                        }
                    }
                    if (boxAdjustment) {
                        value += boxAdjustment[attr];
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
                if (margin) {
                    if (this.floating) {
                        let node = (this.renderParent as T).renderChildren.find(item => !item.floating) as T | undefined;
                        if (node) {
                            const boundsTop = this.bounds.top;
                            let actualNode: T | undefined;
                            while (node.bounds.top === boundsTop) {
                                actualNode = node;
                                const innerWrapped = node.innerWrapped as T | undefined;
                                if (innerWrapped) {
                                    node = innerWrapped;
                                }
                                else {
                                    break;
                                }
                            }
                            if (actualNode) {
                                const boxData = actualNode.getBox(BOX_STANDARD.MARGIN_TOP);
                                top += (boxData[0] !== 1 ? actualNode.marginTop : 0) + boxData[1];
                            }
                        }
                    }
                    else if (top > 0) {
                        const renderParent = this.renderParent as T;
                        if (renderParent.layoutVertical) {
                            const actualParent = this.actualParent as T;
                            if (actualParent.floatContainer) {
                                const boundsTop = this.bounds.top;
                                const renderChildren = renderParent.renderChildren;
                                for (const node of actualParent.naturalElements as T[]) {
                                    if (node.floating && node.bounds.top === boundsTop && !renderChildren.includes(node)) {
                                        top = Math.max(top - node.linear.height, 0);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                if (top !== 0 || left !== 0 || bottom !== 0 || right !== 0) {
                    let mergeAll = 0;
                    let mergeHorizontal = 0;
                    let mergeVertical = 0;
                    if (margin && this.positionStatic && !this.blockWidth && (left < 0 || right < 0)) {
                        switch (this.cssAscend('textAlign')) {
                            case 'center': {
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
                            case 'right':
                            case 'end':
                                if (left < 0) {
                                    left = 0;
                                }
                                break;
                        }
                    }
                    if (!unmergeable && this.api >= BUILD_ANDROID.OREO) {
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
                        this.android(margin ? STRING_ANDROID.MARGIN : STRING_ANDROID.PADDING, formatPX(mergeAll));
                    }
                    else {
                        if (mergeHorizontal !== 0) {
                            this.android(margin ? STRING_ANDROID.MARGIN_HORIZONTAL : STRING_ANDROID.PADDING_HORIZONTAL, formatPX(mergeHorizontal));
                        }
                        else {
                            if (left !== 0) {
                                this.android(this.localizeString(margin ? STRING_ANDROID.MARGIN_LEFT : STRING_ANDROID.PADDING_LEFT), formatPX(left));
                            }
                            if (right !== 0) {
                                this.android(this.localizeString(margin ? STRING_ANDROID.MARGIN_RIGHT : STRING_ANDROID.PADDING_RIGHT), formatPX(right));
                            }
                        }
                        if (mergeVertical !== 0) {
                            this.android(margin ? STRING_ANDROID.MARGIN_VERTICAL : STRING_ANDROID.PADDING_VERTICAL, formatPX(mergeVertical));
                        }
                        else {
                            if (top !== 0) {
                                this.android(margin ? STRING_ANDROID.MARGIN_TOP : STRING_ANDROID.PADDING_TOP, formatPX(top));
                            }
                            if (bottom !== 0) {
                                this.android(margin ? STRING_ANDROID.MARGIN_BOTTOM : STRING_ANDROID.PADDING_BOTTOM, formatPX(bottom));
                            }
                        }
                    }
                }
            };
            setBoxModel(BOX_MARGIN, true, (this.renderParent as T).is(CONTAINER_NODE.GRID) === true);
            setBoxModel(BOX_PADDING, false, false);
        }

        public setSingleLine(ellipsize = false) {
            if (this.textElement && this.naturalChild) {
                const parent = this.actualParent as View;
                if (!parent.preserveWhiteSpace && parent.tagName !== 'CODE' && (!this.multiline || parent.css('whiteSpace') === 'nowrap')) {
                    this.android('maxLines', '1');
                }
                if (ellipsize && this.textContent.trim().length > 1) {
                    this.android('ellipsize', 'end');
                }
            }
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
            if (this.styleElement) {
                const dataset = getDataSet(<HTMLElement> this.element, 'android');
                for (const namespace in dataset) {
                    const name = namespace === 'attr' ? 'android' : (REGEX_DATASETATTR.test(namespace) ? capitalize(namespace.substring(4), false) : '');
                    if (name !== '') {
                        for (const values of dataset[namespace].split(';')) {
                            const [key, value] = values.split('::');
                            if (key) {
                                this.attr(name, key, value);
                            }
                        }
                    }
                }
                if (this.naturalElement) {
                    const opacity = this.css('opacity');
                    if (opacity !== '1') {
                        this.android('alpha', opacity);
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
                if (this.layoutVertical) {
                    if (!renderParent.layoutVertical && !renderParent.layoutFrame && !this.documentRoot && !this.hasAlign(NODE_ALIGNMENT.TOP)) {
                        let children = this.renderChildren;
                        let firstChild: T | undefined;
                        do {
                            firstChild = children[0];
                            if (firstChild && firstChild.naturalChild) {
                                break;
                            }
                            children = firstChild.renderChildren as T[];
                        }
                        while (children.length);
                        if (firstChild.baseline && (firstChild.textElement || firstChild.inputElement)) {
                            this.android('baselineAlignedChildIndex', '0');
                        }
                    }
                }
                else {
                    const children = this.renderChildren;
                    if (children.some(node => node.floating) && !children.some(node => node.imageElement && node.baseline)) {
                        this.android('baselineAligned', 'false');
                    }
                    else {
                        const baseline = squared.base.NodeUI.baseline(children, true);
                        if (baseline && (baseline.textElement || baseline.inputElement)) {
                            this.android('baselineAlignedChildIndex', children.indexOf(baseline).toString());
                        }
                    }
                    const length = children.length;
                    for (let i = 1; i < length; i++) {
                        children[i].setSingleLine(i === length - 1);
                    }
                }
            }
        }

        private setLineHeight(renderParent: T) {
            let lineHeight = this.lineHeight;
            if (lineHeight > 0) {
                const hasOwnStyle = this.has('lineHeight');
                if (this.multiline) {
                    setMultiline(this, lineHeight, hasOwnStyle, true);
                }
                else {
                    const hasChildren = this.renderChildren.length > 0;
                    if (hasOwnStyle || hasChildren || renderParent.lineHeight === 0) {
                        if (!hasChildren) {
                            setMarginOffset(this, lineHeight, hasOwnStyle, true, true);
                        }
                        else {
                            if (this.inline) {
                                this.renderEach(item => {
                                    if (item.lineHeight > lineHeight) {
                                        lineHeight = item.lineHeight;
                                    }
                                    item.setCacheValue('lineHeight', 0);
                                });
                                setMarginOffset(this, lineHeight, hasOwnStyle, true, true);
                            }
                            else {
                                const horizontalRows = this.horizontalRows || [this.renderChildren];
                                let previousMultiline = false;
                                const length = horizontalRows.length;
                                for (let i = 0; i < length; i++) {
                                    const row = horizontalRows[i] as T[];
                                    const nextRow = horizontalRows[i + 1];
                                    let nextMultiline = nextRow && (nextRow.length === 1 && nextRow[0].multiline || nextRow[0].lineBreakLeading);
                                    if (!nextMultiline && i < length - 1) {
                                        if (horizontalRows[i + 1].find(node => node.baselineActive)?.has('lineHeight')) {
                                            nextMultiline = true;
                                        }
                                    }
                                    const baseline = row.find(node => node.baselineActive);
                                    const singleLine = row.length === 1 && !row[0].multiline;
                                    const top = singleLine || !previousMultiline && (i > 0 || length === 1) || row[0].lineBreakLeading;
                                    const bottom = singleLine || !nextMultiline && (i < length - 1 || length === 1);
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
                                        for (const node of row) {
                                            if (node.length === 0 && !node.has('lineHeight') && !node.multiline) {
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
            }
        }

        get documentId() {
            const controlId = this.controlId;
            if (controlId) {
                return '@id/' + controlId;
            }
            return '';
        }

        set controlId(value) {
            this._controlId = value;
        }
        get controlId() {
            let result = this._controlId;
            if (result === undefined) {
                const controlName = this.controlName;
                if (controlName) {
                    let name: string | undefined;
                    if (this.styleElement) {
                        const elementId = this.elementId;
                        const value = elementId?.trim() || getNamedItem(<HTMLElement> this.element, 'name');
                        if (value !== '') {
                            name = value.replace(REGEX_VALIDSTRING, '_').toLowerCase();
                            if (name === 'parent' || RESERVED_JAVA.includes(name)) {
                                name = '_' + name;
                            }
                        }
                    }
                    result = convertWord(squared.base.ResourceUI.generateId('android', name || fromLastIndexOf(controlName, '.').toLowerCase(), name ? 0 : 1));
                    this._controlId = result;
                }
                else if (this.id === 0) {
                    return 'baseroot';
                }
                else {
                    return '';
                }
            }
            return result;
        }

        get anchorTarget(): T {
            const outerWrapper = this.outerWrapper;
            if (outerWrapper === undefined) {
                return this;
            }
            const renderParent = this.renderParent;
            return renderParent && (renderParent.layoutConstraint || renderParent.layoutRelative) ? this : outerWrapper;
        }

        set anchored(value) {
            const constraint = this.constraint;
            constraint.horizontal = value;
            constraint.vertical = value;
        }
        get anchored() {
            const constraint = this.constraint;
            return constraint.horizontal && constraint.vertical;
        }

        set containerType(value) {
            this._containerType = value;
        }
        get containerType() {
            if (this._containerType === 0) {
                const value: number = ELEMENT_ANDROID[this.containerName];
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
        get renderExclude(): boolean {
            let result = this._cached.renderExclude;
            if (result === undefined) {
                if (this.styleElement && this.length === 0 && !this.imageElement) {
                    if (this.pageFlow) {
                        const blockStatic = this.blockStatic || this.display === 'table';
                        const renderParent = this.renderParent;
                        if (renderParent) {
                            if (blockStatic || renderParent.layoutVertical || renderParent.layoutFrame) {
                                result = excludeVertical(this) && this.alignSibling('topBottom') === '' && this.alignSibling('bottomTop') === '';
                            }
                            else {
                                result = excludeHorizontal(this) && this.alignSibling('leftRight') === '' && this.alignSibling('rightLeft') === '' && this.alignSibling('topBottom') === '' && this.alignSibling('bottomTop') === '';
                            }
                        }
                        else {
                            const parent = this.parent as T;
                            if (blockStatic || parent && (parent.layoutVertical || parent.layoutFrame)) {
                                return excludeVertical(this);
                            }
                            else if (parent && parent.alignmentType > 0) {
                                return excludeHorizontal(this);
                            }
                            else {
                                return false;
                            }
                        }
                    }
                    else {
                        result = excludeHorizontal(this) || excludeVertical(this);
                    }
                }
                else {
                    result = false;
                }
                this._cached.renderExclude = result;
            }
            return result;
        }

        get baselineHeight() {
            let result = this._cached.baselineHeight;
            if (result === undefined) {
                result = 0;
                if (this.plainText) {
                    const { height, numberOfLines } = this.bounds;
                    result = height / (numberOfLines || 1);
                }
                else {
                    if (this.multiline && this.cssTry('white-space', 'nowrap')) {
                        result = this.boundingClientRect.height;
                        this.cssFinally('white-space');
                    }
                    else if (this.hasHeight) {
                        result = this.actualHeight;
                    }
                    else if (this.tagName === 'PICTURE') {
                        result = Math.max(this.naturalElements.find(node => node.tagName === 'IMG')?.height || 0, this.bounds.height);
                    }
                    else {
                        result = this.bounds.height;
                    }
                    if (this.naturalElement && this.lineHeight > result) {
                        result = this.lineHeight;
                    }
                    else if (this.inputElement) {
                        switch (this.controlName) {
                            case CONTAINER_ANDROID.BUTTON:
                                result += 2;
                                break;
                            case CONTAINER_ANDROID.RADIO:
                            case CONTAINER_ANDROID.CHECKBOX:
                                result += 8;
                                break;
                            case CONTAINER_ANDROID.SELECT:
                                result += 4;
                                result /= this.toElementInt('size') || 1;
                                break;
                        }
                    }
                    else if (this.is(CONTAINER_NODE.PROGRESS)) {
                        result += 4;
                    }
                }
                this._cached.baselineHeight = result;
            }
            return result;
        }

        get leftTopAxis() {
            let result = this._cached.leftTopAxis;
            if (result === undefined) {
                result = false;
                switch (this.cssInitial('position')) {
                    case 'absolute':
                        const { absoluteParent, documentParent } = this;
                        if (absoluteParent === documentParent) {
                            result = true;
                        }
                        else if (absoluteParent && absoluteParent.box.right === documentParent.linear.right && this.has('right') && !this.has('left')) {
                            this.css('top', formatPX(this.linear.top - documentParent.box.top), true);
                            result = true;
                        }
                        break;
                    case 'fixed':
                        result = true;
                        break;
                }
                this._cached.leftTopAxis = result;
            }
            return result;
        }

        get support() {
            let result = this._cached.support;
            if (result === undefined) {
                result = <SupportAndroid> {
                    positionRelative: this.layoutRelative || this.layoutConstraint,
                    maxDimension: this.textElement || this.imageOrSvgElement
                };
                if (this.containerType !== 0) {
                    this._cached.support = result;
                }
            }
            return <SupportAndroid> result;
        }

        get layoutWidth() {
            return this.android('layout_width');
        }

        get layoutHeight() {
            return this.android('layout_height');
        }

        get inlineWidth() {
            return this.layoutWidth === 'wrap_content';
        }
        get inlineHeight() {
            return this.layoutHeight === 'wrap_content';
        }

        get blockWidth() {
            return this.layoutWidth === 'match_parent';
        }
        get blockHeight() {
            return this.layoutHeight === 'match_parent';
        }

        get flexibleWidth(): boolean {
            return isFlexibleDimension(this, this.layoutWidth);
        }
        get flexibleHeight(): boolean {
            return isFlexibleDimension(this, this.layoutHeight);
        }

        get contentBoxWidthPercent() {
            const actualParent = this.actualParent;
            if (actualParent && !actualParent.layoutElement) {
                const boxWidth = actualParent.box.width || 0;
                return boxWidth > 0 ? this.contentBoxWidth / boxWidth : 0;
            }
            return 0;
        }

        get contentBoxHeightPercent() {
            const actualParent = this.actualParent;
            if (actualParent && !actualParent.layoutElement) {
                const boxHeight = actualParent.box.height || 0;
                return boxHeight > 0 ? this.contentBoxHeight / boxHeight : 0;
            }
            return 0;
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