import { NodeTemplate } from '../../@types/base/application';
import { CachedValue } from '../../@types/base/node';
import { CustomizationResult } from '../../@types/android/application';
import { Constraint, LocalSettings, SupportAndroid } from '../../@types/android/node';

import { CONTAINER_ANDROID, CONTAINER_ANDROID_X, ELEMENT_ANDROID, LAYOUT_ANDROID, RESERVED_JAVA, STRING_ANDROID } from './lib/constant';
import { API_ANDROID, DEPRECATED_ANDROID } from './lib/customization';
import { BUILD_ANDROID, CONTAINER_NODE } from './lib/enumeration';
import { localizeString } from './lib/util';

type T = android.base.View;

const {
    client: $client,
    css: $css,
    dom: $dom,
    math: $math,
    util: $util
} = squared.lib;

const {
    constant: $c,
    enumeration: $e
} = squared.base.lib;

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
            return STRING_ANDROID.CENTER_HORIZONTAL;
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
        case STRING_ANDROID.CENTER_HORIZONTAL:
            return true;
    }
    return false;
}

function setAutoMargin(node: T) {
    if (!node.blockWidth || node.hasWidth || node.hasPX('maxWidth') || node.innerWrapped && node.innerWrapped.has('width', $e.CSS_UNIT.PERCENT, { not: '100%' })) {
        const autoMargin = node.autoMargin;
        const alignment: string[] = [];
        if (autoMargin.horizontal) {
            if (autoMargin.leftRight) {
                alignment.push(STRING_ANDROID.CENTER_HORIZONTAL);
            }
            else if (autoMargin.left) {
                alignment.push('right');
            }
            else {
                alignment.push('left');
            }
        }
        if (autoMargin.vertical) {
            if (node.autoMargin.topBottom) {
                alignment.push(STRING_ANDROID.CENTER_VERTICAL);
            }
            else if (node.autoMargin.top) {
                alignment.push('bottom');
            }
            else {
                alignment.push('top');
            }
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

function setMultiline(node: T, lineHeight: number, overwrite: boolean, autoPadding: boolean) {
    if (node.localSettings.targetAPI >= BUILD_ANDROID.PIE) {
        node.android('lineHeight', $css.formatPX(lineHeight), overwrite);
    }
    else {
        const offset = (lineHeight - node.actualHeight) / 2;
        if (offset > 0) {
            node.android('lineSpacingExtra', $css.formatPX(offset), overwrite);
        }
    }
    if (autoPadding && node.styleElement && !node.hasPX('height') && node.cssTry('line-height', 'normal')) {
        if (node.cssTry('white-space', 'nowrap')) {
            const offset = (lineHeight - (<Element> node.element).getBoundingClientRect().height) / 2;
            const upper = Math.round(offset);
            if (upper > 0) {
                node.modifyBox($e.BOX_STANDARD.PADDING_TOP, upper);
                if (!node.blockStatic) {
                    node.modifyBox($e.BOX_STANDARD.PADDING_BOTTOM, Math.floor(offset));
                }
            }
            node.cssFinally('white-space');
        }
        node.cssFinally('line-height');
    }
}

function setMarginOffset(node: T, lineHeight: number, inlineStyle: boolean, top: boolean, bottom: boolean) {
    if (node.imageOrSvgElement || node.actualHeight === 0 || node.cssInitial('lineHeight') === 'initial') {
        return;
    }
    if (node.multiline) {
        setMultiline(node, lineHeight, false, true);
    }
    else if ((node.renderChildren.length === 0 || node.inline) && (node.pageFlow || node.textContent.length)) {
        let offset = 0;
        let usePadding = true;
        if (inlineStyle && !node.inline && node.inlineText) {
            setMinHeight(node, lineHeight);
            setMultiline(node, lineHeight, false, false);
        }
        else if (!inlineStyle && node.styleElement && !node.hasPX('height') && node.cssTry('line-height', 'normal')) {
            if (node.cssTry('white-space', 'nowrap')) {
                offset = (lineHeight - (<Element> node.element).getBoundingClientRect().height) / 2;
                usePadding = false;
                node.cssFinally('white-space');
            }
            node.cssFinally('line-height');
        }
        else {
            const bounds = node.bounds;
            if (node.plainText && <number> bounds.numberOfLines > 1) {
                node.android('minHeight', $css.formatPX(bounds.height / <number> bounds.numberOfLines));
                node.mergeGravity('gravity', STRING_ANDROID.CENTER_VERTICAL);
                return;
            }
            else {
                offset = (lineHeight - bounds.height) / 2;
            }
        }
        const upper = Math.round(offset);
        if (upper > 0) {
            const boxPadding = usePadding && node.textElement && !node.plainText && !inlineStyle;
            if (top) {
                node.modifyBox(boxPadding ? $e.BOX_STANDARD.PADDING_TOP : $e.BOX_STANDARD.MARGIN_TOP, upper);
            }
            if (bottom) {
                node.modifyBox(boxPadding ? $e.BOX_STANDARD.PADDING_BOTTOM : $e.BOX_STANDARD.MARGIN_BOTTOM, Math.floor(offset));
            }
        }
    }
    else if (inlineStyle && (!node.hasHeight || lineHeight > node.height) && (node.layoutHorizontal && node.horizontalRows === undefined || node.hasAlign($e.NODE_ALIGNMENT.SINGLE))) {
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
        node.android('minHeight', $css.formatPX(value));
    }
}

const isFlexibleDimension = (node: T, value: string) => !!node.renderParent && value === '0px' && ((node.renderParent as T).layoutConstraint || (node.renderParent as T).is(CONTAINER_NODE.GRID));

const validateString = (value: string) => value ? value.trim().replace(REGEXP_VALIDSTRING, '_').toLowerCase() : '';

export default (Base: Constructor<squared.base.NodeUI>) => {
    return class View extends Base implements android.base.View {
        public static getControlName(containerType: number, api = BUILD_ANDROID.Q): string {
            const name = CONTAINER_NODE[containerType];
            if (api >= BUILD_ANDROID.Q) {
                const controlName: string | undefined = CONTAINER_ANDROID_X[name];
                if (controlName) {
                    return controlName;
                }
            }
            return CONTAINER_ANDROID[name];
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
        public queryMap?: T[][];
        public readonly renderChildren: T[] = [];
        public readonly constraint: Constraint = {
            horizontal: false,
            vertical: false,
            current: {}
        };

        protected _namespaces = ['android', 'app'];
        protected _cached: CachedValue<T> = {};
        protected _controlName = '';
        protected _localSettings!: LocalSettings;
        protected _documentParent?: T;
        protected _boxAdjustment?: BoxModel;
        protected _boxReset?: BoxModel;

        private _requireDocumentId = false;
        private _containerType = 0;
        private _api = BUILD_ANDROID.LATEST;
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
            }
        }

        public android(attr: string, value?: string, overwrite = true) {
            if (value) {
                if (this._api < BUILD_ANDROID.LATEST) {
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
            const node = this.anchorTarget;
            const renderParent = node.renderParent as T;
            if (renderParent && node.documentId !== documentId) {
                if (renderParent.layoutConstraint) {
                    if (documentId === '' || node.constraint.current[position] === undefined || overwrite) {
                        if (documentId && overwrite === undefined) {
                            overwrite = documentId === 'parent';
                        }
                        const attr: string = LAYOUT_ANDROID.constraint[position];
                        if (attr) {
                            let horizontal = false;
                            node.app(this.localizeString(attr), documentId, overwrite);
                            switch (position) {
                                case 'left':
                                case 'right':
                                    if (documentId === 'parent') {
                                        node.constraint.horizontal = true;
                                    }
                                case $c.STRING_BASE.LEFT_RIGHT:
                                case $c.STRING_BASE.RIGHT_LEFT:
                                    horizontal = true;
                                    break;
                                case 'top':
                                case 'bottom':
                                case 'baseline':
                                    if (documentId === 'parent') {
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
                        node.anchor(horizontal ? 'left' : 'top', 'parent', overwrite);
                        node.anchor(horizontal ? 'right' : 'bottom', 'parent', overwrite);
                        node.constraint[orientation] = true;
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
            const horizontal = orientation === STRING_ANDROID.HORIZONTAL;
            node.app(horizontal ? 'layout_constraintHorizontal_chainStyle' : 'layout_constraintVertical_chainStyle', value, overwrite);
            node.app(horizontal ? 'layout_constraintHorizontal_bias' : 'layout_constraintVertical_bias', bias.toString(), overwrite);
        }

        public anchorDelete(...position: string[]) {
            const node = this.anchorTarget;
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
                        return node.app(this.localizeString(attr)) === 'parent' || node.app(attr) === 'parent';
                    }
                }
                else if (renderParent.layoutRelative) {
                    const attr = LAYOUT_ANDROID.relativeParent[position];
                    if (attr) {
                        return node.android(this.localizeString(attr)) === 'true' || node.android(attr) === 'true';
                    }
                }
                else if (renderParent.layoutLinear) {
                    const children = renderParent.renderChildren;
                    switch (position) {
                        case 'left':
                            return renderParent.layoutHorizontal && node === children[0];
                        case 'top':
                            return renderParent.layoutVertical && node === children[0];
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
                            return value !== 'parent' && value !== renderParent.documentId ? value : '';
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
            if (this._api < BUILD_ANDROID.LATEST) {
                const deprecated: ObjectMap<CustomizationResult> = DEPRECATED_ANDROID.android;
                if (deprecated && typeof deprecated[attr] === 'function') {
                    const valid = deprecated[attr](result, this._api, this);
                    if (!valid || Object.keys(result).length) {
                        return valid;
                    }
                }
                for (let i = this._api; i <= BUILD_ANDROID.LATEST; i++) {
                    const version = API_ANDROID[i];
                    if (version && version.android[attr] !== undefined) {
                        const callback: CustomizationResult | boolean = version.android[attr];
                        if (typeof callback === 'function') {
                            return callback(result, this._api, this);
                        }
                        return callback;
                    }
                }
            }
            return true;
        }

        public combine(...objs: string[]) {
            const result: string[] = [];
            const all = objs.length === 0;
            for (const value of this._namespaces) {
                if (all || objs.includes(value)) {
                    const obj: StringMap = this['__' + value];
                    if (obj) {
                        for (const attr in obj) {
                            result.push((value !== '_' ? value + ':' : '') + `${attr}="${obj[attr]}"`);
                        }
                    }
                }
            }
            result.sort((a, b) => a > b ? 1 : -1);
            if (this._requireDocumentId) {
                result.unshift(`android:id="@+id/${this.controlId}"`);
            }
            return result;
        }

        public localizeString(value: string) {
            if (this.hasProcedure($e.NODE_PROCEDURE.LOCALIZATION)) {
                return localizeString(value, this.localSettings.supportRTL, this._api);
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
                if (this._boxReset) {
                    Object.assign(node.unsafe('boxReset'), this._boxReset);
                }
                if (this._boxAdjustment) {
                    Object.assign(node.unsafe('boxAdjustment'), this._boxAdjustment);
                }
                for (const name of this._namespaces) {
                    const obj: StringMap = this['__' + name];
                    for (const attr in obj) {
                        node.attr(name, attr, name === 'android' && attr === 'id' ? node.documentId : obj[attr]);
                    }
                }
            }
            if (position) {
                node.anchorClear();
                if (node.anchor('left', this.documentId)) {
                    node.modifyBox($e.BOX_STANDARD.MARGIN_LEFT);
                    Object.assign(node.unsafe('boxAdjustment'), { marginLeft: 0 });
                }
                if (node.anchor('top', this.documentId)) {
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
                if (this.styleElement) {
                    const elementId = this.elementId;
                    if (elementId !== '') {
                        name = validateString(elementId);
                        this._requireDocumentId = true;
                    }
                    else {
                        name = validateString($dom.getNamedItem(<HTMLElement> this.element, 'name'));
                        if (this.svgElement) {
                            this._requireDocumentId = true;
                        }
                    }
                    if (name === 'parent' || RESERVED_JAVA.includes(name)) {
                        name = '_' + name;
                    }
                }
                this.controlId = $util.convertWord(squared.base.ResourceUI.generateId('android', name || $util.fromLastIndexOf(this.controlName, '.').toLowerCase(), name ? 0 : 1));
            }
        }

        public setLayout() {
            const renderParent = this.renderParent as T;
            switch (this.cssAscend('visibility', true)) {
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
            let adjustViewBounds = false;
            if (this.documentBody) {
                if (this.css('width') === '100%' || this.css('minWidth') === '100%' || !this.hasWidth && this.renderChildren.some(node => node.alignParent('right'))) {
                    this.setLayoutWidth('match_parent', false);
                }
                if (this.css('height') === '100%' || this.css('minHeight') === '100%' || !this.hasHeight && this.renderChildren.some(node => node.alignParent('bottom'))) {
                    this.setLayoutHeight('match_parent', false);
                }
            }
            if (this.layoutWidth === '') {
                let layoutWidth = '';
                if (this.hasPX('width') && (!this.inlineStatic || this.cssInitial('width') === '')) {
                    const width = this.css('width');
                    let value = -1;
                    if ($css.isLength(width)) {
                        value = this.actualWidth;
                    }
                    else if ($css.isPercent(width)) {
                        if (this.inputElement) {
                            value = this.bounds.width;
                        }
                        else if (renderParent.layoutConstraint && !renderParent.hasPX('width', false)) {
                            if (width === '100%') {
                                layoutWidth = 'match_parent';
                            }
                            else {
                                this.app('layout_constraintWidth_percent', $math.truncate(parseFloat(width) / 100, this.localSettings.floatPrecision));
                                layoutWidth = '0px';
                            }
                            adjustViewBounds = true;
                        }
                        else if (renderParent.is(CONTAINER_NODE.GRID)) {
                            layoutWidth = '0px';
                            this.android('layout_columnWeight', $math.truncate(parseFloat(width) / 100, this.localSettings.floatPrecision));
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
                            if (!this.support.maxWidth) {
                                const maxWidth = this.css('maxWidth');
                                const maxValue = this.parseUnit(maxWidth);
                                const absoluteParent = this.absoluteParent || documentParent;
                                if (maxWidth === '100%') {
                                    if (!renderParent.inlineWidth && $util.aboveRange(maxValue, absoluteParent.box.width)) {
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
                        layoutWidth = $css.formatPX(value);
                    }
                }
                else if (this.length > 0) {
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
                                const widthPX = $css.formatPX(maxWidth);
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
                        layoutWidth = $css.formatPX(this.actualWidth);
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
                                    else if (this.cssTry('display', 'inline-block')) {
                                        if ((<Element> this.element).getBoundingClientRect().width < this.bounds.width) {
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
                            if (blockAll && (renderParent.layoutVertical || renderParent.layoutFrame || this.onlyChild || (renderParent.layoutRelative || renderParent.layoutConstraint) && this.alignSibling('left') === '' && this.alignSibling('right') === '')) {
                                layoutWidth = 'match_parent';
                            }
                        };
                        if (this.blockStatic && !this.inputElement && !renderParent.is(CONTAINER_NODE.GRID)) {
                            if (this.display === 'flex') {
                                if (renderParent.layoutConstraint && this.css('flexDirection') === 'column') {
                                    layoutWidth = '0px';
                                }
                                else if (!documentParent.layoutElement) {
                                    layoutWidth = 'match_parent';
                                }
                            }
                            else if (!documentParent.layoutElement) {
                                checkParentWidth();
                            }
                            else if (renderParent.layoutConstraint) {
                                if (documentParent.flexElement) {
                                    if (documentParent.css('flexDirection') === 'column' || this.flexbox.grow > 0) {
                                        layoutWidth = '0px';
                                    }
                                }
                                else if (this.alignParent('left') && this.alignParent('right')) {
                                    layoutWidth = this.autoMargin.horizontal || !renderParent.inlineWidth ? '0px' : 'match_parent';
                                }
                            }
                        }
                        if (layoutWidth === '') {
                            if (this.layoutVertical && !renderParent.inlineWidth && (renderParent.layoutFrame && this.rightAligned || this.layoutLinear && this.naturalElements.some(item => item.lineBreak) || this.renderChildren.some(item => item.layoutConstraint && item.blockStatic)) && !this.documentRoot ||
                                !this.pageFlow && this.absoluteParent === documentParent && this.hasPX('left') && this.hasPX('right') ||
                                this.is(CONTAINER_NODE.GRID) && this.some((node: T) => parseFloat(node.android('layout_columnWeight')) > 0) ||
                                documentParent.flexElement && this.flexbox.grow > 0 && renderParent.flexibleWidth && documentParent.css('flexDirection') === 'row')
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
                    if ($css.isLength(height)) {
                        value = this.actualHeight;
                    }
                    else if ($css.isPercent(height)) {
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
                            if (!this.support.maxHeight) {
                                const maxHeight = this.css('maxHeight');
                                const maxValue = this.parseUnit(maxHeight);
                                const absoluteParent = this.absoluteParent || documentParent;
                                if (maxHeight === '100%') {
                                    if (!renderParent.inlineHeight && $util.aboveRange(maxValue, absoluteParent.box.height)) {
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
                            if (layoutHeight === '' && (this.documentRoot || !renderParent.inlineHeight)) {
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
                        layoutHeight = $css.formatPX(value);
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
                            layoutHeight = $css.formatPX(this.actualHeight);
                        }
                    }
                    else if (this.display === 'table-cell' || !this.pageFlow && this.leftTopAxis && this.hasPX('top') && this.hasPX('bottom') || this.onlyChild && renderParent.flexElement && !renderParent.inlineHeight && renderParent.css('flexDirection') === 'row' && this.outerWrapper === undefined) {
                        layoutHeight = 'match_parent';
                    }
                }
                this.setLayoutHeight(layoutHeight || 'wrap_content');
            }
            else if (layoutHeight === '0px' && renderParent.inlineHeight && renderParent.android('minHeight') === '' && !this.lockedAttr('android', 'layout_height')) {
                this.setLayoutHeight('wrap_content');
            }
            const isFlexible = (direction: string) => !(documentParent.flexElement && this.flexbox.grow > 0 && documentParent.css('flexDirection') === direction);
            if (this.hasPX('minWidth') && isFlexible('column')) {
                this.android('minWidth', this.convertPX(this.css('minWidth')), false);
            }
            if (this.hasPX('minHeight') && isFlexible('row')) {
                this.android('minHeight', this.convertPX(this.css('minHeight'), 'height'), false);
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
                else if (!this.pageFlow && this.multiline && this.inlineWidth && !this.preserveWhiteSpace && (this.ascend(item => item.hasPX('width')).length > 0 || !/\n/.test(this.textContent))) {
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
                    if (maxHeight === '100%' && this.imageElement) {
                        height = (<HTMLImageElement> this.element).naturalHeight;
                    }
                    else {
                        height = this.parseUnit(this.css('maxHeight'), 'height');
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

        public setAlignment() {
            const renderParent = this.renderParent as T;
            const node = this.outerWrapper || this;
            const outerRenderParent = (node.renderParent || renderParent) as T;
            let textAlign = checkTextAlign(this.cssInitial('textAlign', true));
            let textAlignParent = checkTextAlign(this.cssAscend('textAlign'), true);
            if (this.nodeGroup && textAlign === '' && !this.hasAlign($e.NODE_ALIGNMENT.FLOAT)) {
                const parent = this.actualParent;
                if (parent) {
                    textAlign = checkTextAlign(parent.cssInitial('textAlign', true));
                }
            }
            if (this.pageFlow) {
                let floating = '';
                if (this.inlineVertical && (outerRenderParent.layoutHorizontal && !outerRenderParent.support.container.positionRelative || outerRenderParent.is(CONTAINER_NODE.GRID) || this.display === 'table-cell')) {
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
                        else if (!setAutoMargin(node) && textAlign !== '' && this.hasWidth && !this.blockStatic && this.display !== 'table') {
                            node.mergeGravity('layout_gravity', textAlign, false);
                        }
                    }
                    if (this.rightAligned || this.nodeGroup && this.renderChildren.length && this.renderChildren.every(item => item.rightAligned)) {
                        floating = 'right';
                    }
                    else if (this.nodeGroup && this.hasAlign($e.NODE_ALIGNMENT.FLOAT) && !this.renderChildren.some(item => item.rightAligned)) {
                        floating = 'left';
                    }
                }
                else if (node.nodeGroup && node.layoutVertical && this.rightAligned) {
                    node.renderEach((item: T) => {
                        if (item.rightAligned) {
                            item.mergeGravity('layout_gravity', 'right');
                        }
                    });
                }
                if (renderParent.layoutFrame && this.innerWrapped === undefined) {
                    if (!setAutoMargin(this)) {
                        if (this.floating) {
                            floating = this.float;
                        }
                        if (floating !== '' && !renderParent.naturalElement && (renderParent.inlineWidth || !renderParent.documentRoot && this.onlyChild)) {
                            renderParent.mergeGravity('layout_gravity', floating);
                            floating = '';
                        }
                        if (this.centerAligned) {
                            this.mergeGravity('layout_gravity', checkTextAlign('center'));
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
                else if (outerRenderParent.layoutFrame && renderParent.blockWidth && this.rightAligned) {
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
                else if (setAutoMargin(node.inlineWidth ? node : this) && textAlign !== '') {
                    textAlignParent = '';
                }
            }
            if (textAlignParent !== '') {
                if (this.blockStatic && !this.centerAligned && !this.rightAligned) {
                    node.mergeGravity('layout_gravity', 'left', false);
                }
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
                    else if (!this.nodeGroup || !this.hasAlign($e.NODE_ALIGNMENT.FLOAT)) {
                        this.mergeGravity('gravity', textAlignParent);
                    }
                }
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
                        if (alignment === STRING_ANDROID.CENTER_HORIZONTAL && this.alignSibling($c.STRING_BASE.LEFT_RIGHT) === '' && this.alignSibling($c.STRING_BASE.RIGHT_LEFT) === '') {
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
                                    if (this.alignSibling($c.STRING_BASE.RIGHT_LEFT) === '') {
                                        this.anchor('right', 'parent', false);
                                    }
                                    break;
                                case 'bottom':
                                    this.anchor('bottom', 'parent', false);
                                    break;
                                case 'left':
                                case 'start':
                                    if (this.alignSibling($c.STRING_BASE.LEFT_RIGHT) === '') {
                                        this.anchor('left', 'parent', false);
                                    }
                                    break;
                                case STRING_ANDROID.CENTER_HORIZONTAL:
                                    if (this.alignSibling($c.STRING_BASE.LEFT_RIGHT) === '' && this.alignSibling($c.STRING_BASE.LEFT_RIGHT) === '') {
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
                    result = checkTextAlign(direction.values().next().value);
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
                const borderWidth = !this.tableElement ? this.styleElement : this.css('boxSizing') === 'content-box' || $client.isUserAgent($client.USER_AGENT.FIREFOX);
                if (borderWidth && this.visibleStyle.borderWidth && !this.is(CONTAINER_NODE.LINE) && (this.renderChildren.length === 0 || !this.naturalChildren.every(node => !node.pageFlow && node.absoluteParent === this))) {
                    this.modifyBox($e.BOX_STANDARD.PADDING_LEFT, this.borderLeftWidth);
                    this.modifyBox($e.BOX_STANDARD.PADDING_RIGHT, this.borderRightWidth);
                    this.modifyBox($e.BOX_STANDARD.PADDING_TOP, this.borderTopWidth);
                    this.modifyBox($e.BOX_STANDARD.PADDING_BOTTOM, this.borderBottomWidth);
                }
                this.alignLayout(renderParent);
                this.setLineHeight(renderParent);
                if (this.inlineWidth && this.renderChildren.some(node => node.blockWidth && node.some((item: T) => item.flexibleWidth))) {
                    this.setLayoutWidth(this.documentRoot || renderParent.inlineWidth ? $css.formatPX(this.actualWidth) : 'match_parent');
                }
            }
        }

        public applyCustomizations(overwrite = true) {
            const setCustomization = (build: ExternalData, name: string) => {
                const assign = build.assign[name];
                if (assign) {
                    for (const obj in assign) {
                        const data = assign[obj];
                        for (const attr in data) {
                            this.attr(obj, attr, data[attr], overwrite);
                        }
                    }
                }
            };
            const tagName = this.tagName;
            const controlName = this.controlName;
            setCustomization(API_ANDROID[0], tagName);
            setCustomization(API_ANDROID[0], controlName);
            const api = API_ANDROID[this._api];
            if (api) {
                setCustomization(api, tagName);
                setCustomization(api, controlName);
            }
        }

        public setBoxSpacing() {
            const boxReset = this._boxReset;
            const boxAdjustment = this._boxAdjustment;
            const setBoxModel = (attrs: string[], margin: boolean, unmergeable = false) => {
                let top = 0;
                let right = 0;
                let bottom = 0;
                let left = 0;
                for (let i = 0 ; i < 4; i++) {
                    const attr = attrs[i];
                    let value: number = boxReset === undefined || boxReset[attr] === 0 ? this[attr] : 0;
                    if (value !== 0) {
                        switch (attr) {
                            case 'marginRight': {
                                if (value < 0) {
                                    if (this.float === 'right' && $util.aboveRange(this.linear.right, this.documentParent.box.right)) {
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
                                        value = $math.clampRange(outer - inner, 0, value);
                                    }
                                }
                                break;
                            }
                            case 'marginBottom':
                                if (value < 0 && this.pageFlow && !this.blockStatic) {
                                    value = 0;
                                }
                                break;
                            case 'paddingTop':
                            case 'paddingBottom':
                                value = this.actualPadding(attr, value);
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
                    if (!unmergeable && this._api >= BUILD_ANDROID.OREO) {
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
                const dataset = $css.getDataSet(<HTMLElement> this.element, 'android');
                for (const name in dataset) {
                    const obj = name === 'attr' ? 'android'
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
                    if (!renderParent.layoutVertical && !renderParent.layoutFrame && !this.documentRoot && !this.hasAlign($e.NODE_ALIGNMENT.TOP)) {
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
                                        const nextBaseline = horizontalRows[i + 1].find(node => node.baselineActive);
                                        if (nextBaseline && nextBaseline.has('lineHeight')) {
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
            }
        }

        get documentId() {
            const controlId = this.controlId;
            if (controlId) {
                this._requireDocumentId = true;
                return '@id/' + controlId;
            }
            return '';
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
        get renderExclude() {
            let result = this._cached.renderExclude;
            if (result === undefined) {
                if (this.styleElement && this.length === 0 && !this.imageElement) {
                    if (this.blockStatic || this.layoutVertical) {
                        result = this.contentBoxHeight === 0 && (this.bounds.height === 0 && this.marginTop <= 0 && this.marginBottom <= 0 || this.css('height') === '0px' && this.css('overflow') === 'hidden');
                    }
                    else {
                        result = this.bounds.width === 0 && this.contentBoxWidth === 0 && this.textEmpty && !this.visibleStyle.background && this.marginLeft <= 0 && this.marginRight <= 0;
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
                    result = this.bounds.height / (this.bounds.numberOfLines || 1);
                }
                else {
                    if (this.multiline && this.cssTry('white-space', 'nowrap')) {
                        result = (<Element> this.element).getBoundingClientRect().height;
                        this.cssFinally('white-space');
                    }
                    else if (this.hasHeight) {
                        result = this.actualHeight;
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
                                result /= (<HTMLSelectElement> this.element).size || 1;
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
                switch (this.cssInitial('position')) {
                    case 'absolute':
                        const { absoluteParent, documentParent } = this;
                        if (absoluteParent === documentParent) {
                            result = true;
                        }
                        else if (absoluteParent) {
                            if (this.has('right') && !this.has('left') && absoluteParent.box.right === documentParent.linear.right) {
                                this.css('top', $css.formatPX(this.linear.top - documentParent.box.top), true);
                                result = true;
                            }
                            else {
                                result = false;
                            }
                        }
                        else {
                            result = false;
                        }
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

        get support() {
            let result = this._cached.support;
            if (result === undefined) {
                const maxWidth = this.textElement || this.imageOrSvgElement;
                result = <SupportAndroid> {
                    container: {
                        positionRelative: this.layoutRelative || this.layoutConstraint
                    },
                    maxWidth,
                    maxHeight: maxWidth
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

        set localSettings(value) {
            if (this._localSettings) {
                Object.assign(this._localSettings, value);
            }
            else {
                this._localSettings = { ...value };
            }
            const api = value.targetAPI;
            if (api) {
                this._api = api;
            }
        }
        get localSettings() {
            return this._localSettings;
        }
    };
};