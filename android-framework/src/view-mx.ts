import { NodeTemplate } from '../../@types/base/application';
import { AutoMargin, BoxType, HideOptions } from '../../@types/base/node';
import { CustomizationResult } from '../../@types/android/application';
import { CachedValueAndroidUI, Constraint, LocalSettingsAndroidUI, SupportAndroid } from '../../@types/android/node';

import { CONTAINER_ANDROID, CONTAINER_ANDROID_X, ELEMENT_ANDROID, LAYOUT_ANDROID, RESERVED_JAVA, STRING_ANDROID } from './lib/constant';
import { API_ANDROID, DEPRECATED_ANDROID } from './lib/customization';
import { BUILD_ANDROID, CONTAINER_NODE } from './lib/enumeration';
import { localizeString } from './lib/util';

type T = android.base.View;

const $lib = squared.lib;

const { Node, ResourceUI } = squared.base;

const { BOX_MARGIN, BOX_PADDING, formatPX, getDataSet, isLength, isPercent } = $lib.css;
const { getNamedItem } = $lib.dom;
const { clamp, truncate } = $lib.math;
const { actualTextRangeRect } = $lib.session;
const { aboveRange, capitalize, convertFloat, convertWord, fromLastIndexOf, isNumber, isPlainObject, isString, replaceMap } = $lib.util;

const { BOX_STANDARD, CSS_UNIT, NODE_ALIGNMENT, NODE_PROCEDURE } = squared.base.lib.enumeration;

const SPACING_CHECKBOX = 4;
const SPACING_SELECT = 2;
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

function isVerticalAlign(value: string) {
    switch (value) {
        case 'top':
        case 'bottom':
        case STRING_ANDROID.CENTER_VERTICAL:
            return true;
    }
    return false;
}

function getGravityValues(node: T, attr: string) {
    const result = new Set<string>();
    const gravity = node.android(attr);
    if (gravity !== '') {
        for (const value of gravity.split('|')) {
            result.add(value);
        }
    }
    return result;
}

function setAutoMargin(node: T, autoMargin: AutoMargin) {
    if (autoMargin.horizontal && (!node.blockWidth || node.hasWidth || node.hasPX('maxWidth') || node.innerMostWrapped.has('width', CSS_UNIT.PERCENT, { not: '100%' }))) {
        node.mergeGravity(
            (node.blockWidth || !node.pageFlow) && node.outerWrapper === undefined ? 'gravity' : 'layout_gravity',
            autoMargin.leftRight ? STRING_ANDROID.CENTER_HORIZONTAL : (autoMargin.left ? 'right' : 'left')
        );
        return true;
    }
    return false;
}

function setMultiline(node: T, lineHeight: number, overwrite: boolean, autoPadding: boolean) {
    if (node.api >= BUILD_ANDROID.PIE) {
        node.android('lineHeight', formatPX(lineHeight), overwrite);
    }
    else {
        const offset = getLineSpacingExtra(node, lineHeight);
        if (offset > 0) {
            node.android('lineSpacingExtra', formatPX(offset), overwrite);
        }
    }
    if (autoPadding && node.styleText && !node.hasPX('height') && node.cssTry('line-height', 'normal')) {
        if (node.cssTry('white-space', 'nowrap')) {
            const offset = getLineSpacingExtra(node, lineHeight);
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
    if (node.imageOrSvgElement || node.baselineAltered && !node.multiline || node.actualHeight === 0 || node.cssInitial('lineHeight') === 'initial') {
        return;
    }
    if (node.multiline) {
        setMultiline(node, lineHeight, false, true);
    }
    else if ((node.renderChildren.length === 0 || node.inline) && (node.pageFlow || node.textContent.length)) {
        if (inlineStyle && !node.inline && node.inlineText) {
            setMinHeight(node, lineHeight);
        }
        else {
            let offset = 0;
            let usePadding = true;
            if (!inlineStyle && node.inlineText && node.styleElement && !node.hasPX('height') && node.cssTry('line-height', 'normal')) {
                if (node.cssTry('white-space', 'nowrap')) {
                    offset = getLineSpacingExtra(node, lineHeight);
                    usePadding = false;
                    node.cssFinally('white-space');
                }
                node.cssFinally('line-height');
            }
            else {
                const height = node.bounds.height;
                if (node.plainText) {
                    const numberOfLines = node.bounds.numberOfLines as number;
                    if (numberOfLines > 1) {
                        node.android('minHeight', formatPX(height / numberOfLines));
                        node.mergeGravity('gravity', STRING_ANDROID.CENTER_VERTICAL);
                        return;
                    }
                }
                offset = (lineHeight - height) / 2;
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
        return !!renderParent && (renderParent.layoutConstraint || renderParent.layoutGrid);
    }
    return false;
}

function checkMergableGravity(value: string, direction: Set<string>) {
    const horizontal = value + '_horizontal';
    const vertical = value + '_vertical';
    if (direction.has(value) || direction.has(horizontal) && direction.has(vertical)) {
        direction.delete(horizontal);
        direction.delete(vertical);
        direction.add(value);
    }
}

function getLineSpacingExtra(node: T, lineHeight: number) {
    let height = Number.POSITIVE_INFINITY;
    if (node.naturalChild) {
        height = actualTextRangeRect(<Element> node.element, node.sessionId, false).height;
    }
    return (lineHeight - Math.min(height, node.boundingClientRect.height)) / 2;
}


function constraintMinMax(node: T, horizontal: boolean) {
    const minWH = node.cssInitial(horizontal ? 'minWidth' : 'minHeight', true);
    if (isLength(minWH, true) && parseFloat(minWH) > 0) {
        if (horizontal) {
            if (ascendFlexibleWidth(node)) {
                node.setLayoutWidth('0px', false);
                if (node.flexibleWidth) {
                    node.app('layout_constraintWidth_min', formatPX(node.parseUnit(minWH) + node.contentBoxWidth));
                    node.css('minWidth', 'auto');
                }
            }
        }
        else if (ascendFlexibleHeight(node)) {
            node.setLayoutHeight('0px', false);
            if (node.flexibleHeight) {
                node.app('layout_constraintHeight_min', formatPX(node.parseUnit(minWH, 'height') + node.contentBoxHeight));
                node.css(horizontal ? 'minWidth' : 'minHeight', 'auto');
            }
        }
    }
    const maxWH = node.cssInitial(horizontal ? 'maxWidth' : 'maxHeight', true);
    if (isLength(maxWH, true) && maxWH !== '100%') {
        if (horizontal) {
            if (ascendFlexibleWidth(node)) {
                node.setLayoutWidth((node.renderParent as T).flexibleWidth ? 'match_parent' : '0px', node.innerWrapped?.naturalChild === true);
                if (node.flexibleWidth) {
                    const value = node.parseUnit(maxWH);
                    node.app('layout_constraintWidth_max', formatPX(value + node.contentBoxWidth));
                    node.css('maxWidth', 'auto');
                    if (node.layoutVertical) {
                        node.each(item => {
                            if (item.textElement && !item.hasPX('maxWidth')) {
                                item.css('maxWidth', formatPX(value));
                            }
                        });
                    }
                }
            }
        }
        else if (ascendFlexibleHeight(node)) {
            node.setLayoutHeight((node.renderParent as T).flexibleHeight ? 'match_parent' : '0px', node.innerWrapped?.naturalChild === true);
            if (node.flexibleHeight) {
                node.app('layout_constraintHeight_max', formatPX(node.parseUnit(maxWH, 'height') + node.contentBoxHeight));
                node.css('maxHeight', 'auto');
            }
        }
    }
}

function setConstraintPercent(node: T, value: number, horizontal: boolean, percent: number) {
    const parent = node.actualParent || node.documentParent;
    if (value < 1 && node.pageFlow && !(parent.flexElement && isPercent(node.flexbox.basis)) && (percent < 1 || node.blockStatic && !parent.gridElement)) {
        let boxPercent: number;
        let marginPercent: number;
        if (horizontal) {
            boxPercent = node.contentBoxWidthPercent;
            marginPercent = (node.marginLeft + node.marginRight) / parent.box.width;
        }
        else {
            boxPercent = node.contentBoxHeightPercent;
            marginPercent = (node.marginTop + node.marginBottom) / parent.box.height;
        }
        if (boxPercent > 0) {
            if (percent < boxPercent) {
                boxPercent = Math.max(percent, 0);
                percent = 0;
            }
            else {
                percent -= boxPercent;
            }
        }
        if (percent === 0) {
            boxPercent -= marginPercent;
        }
        else {
            percent = Math.max(percent - marginPercent, 0);
        }
        value = Math.min(value + boxPercent, 1);
    }
    if (value === 1 && !node.hasPX('maxWidth')) {
        setLayoutDimension(node, 'match_parent', horizontal, false);
    }
    else {
        node.app(horizontal ? 'layout_constraintWidth_percent' : 'layout_constraintHeight_percent', truncate(value, node.localSettings.floatPrecision));
        setLayoutDimension(node, '0px', horizontal, false);
    }
    return percent;
}

function setLayoutDimension(node: T, value: string, horizontal: boolean, overwrite: boolean) {
    if (horizontal) {
        node.setLayoutWidth(value, overwrite);
    }
    else {
        node.setLayoutHeight(value, overwrite);
    }
}

function constraintPercentValue(node: T, dimension: string, horizontal: boolean, opposing: boolean, percent: number) {
    const value = horizontal ? node.percentWidth : node.percentHeight;
    if (opposing) {
        if (value > 0) {
            const size = node.bounds[dimension];
            setLayoutDimension(node, formatPX(size), horizontal, true);
            if (node.imageElement) {
                const { naturalWidth, naturalHeight } = <HTMLImageElement> node.element;
                if (naturalWidth > 0 && naturalHeight > 0) {
                    const opposingUnit = formatPX((size / (horizontal ? naturalWidth : naturalHeight)) * (horizontal ? naturalHeight : naturalWidth));
                    if (horizontal) {
                        node.setLayoutHeight(opposingUnit, false);
                    }
                    else {
                        node.setLayoutWidth(opposingUnit, false);
                    }
                }
            }
        }
    }
    else if (value > 0) {
        return setConstraintPercent(node, value, horizontal, percent);
    }
    return percent;
}

function constraintPercentWidth(node: T, opposing: boolean, percent = 1) {
    if (!opposing && (node.renderParent as T).hasPX('width', false) && !(node.actualParent || node.documentParent).layoutElement) {
        const value = node.percentWidth;
        if (value > 0) {
            if (value < 1) {
                node.setLayoutWidth(formatPX(node.actualWidth));
            }
            else {
                node.setLayoutWidth('match_parent', false);
            }
        }
    }
    else if (!node.inputElement) {
        return constraintPercentValue(node, 'width', true, opposing, percent);
    }
    return percent;
}

function constraintPercentHeight(node: T, opposing: boolean, percent = 1) {
    const parent = node.renderParent as T;
    if (parent.hasHeight) {
        if (!opposing && parent.hasPX('height', false) && !(node.actualParent || node.documentParent).layoutElement) {
            const value = node.percentHeight;
            if (value > 0) {
                if (value < 1) {
                    node.setLayoutHeight(formatPX(node.actualHeight));
                }
                else {
                    node.setLayoutHeight('match_parent', false);
                }
            }
        }
        else if (!node.inputElement) {
            return constraintPercentValue(node, 'height', false, opposing, percent);
        }
    }
    else {
        const value = node.percentHeight;
        if (value > 0) {
            if (value === 1) {
                if (node.alignParent('top') && node.alignParent('bottom')) {
                    node.setLayoutHeight('0px', false);
                    return percent;
                }
                else if (parent.flexibleHeight) {
                    node.setLayoutHeight('match_parent', false);
                    return percent;
                }
            }
            node.setLayoutHeight('wrap_content', false);
        }
    }
    return percent;
}

export function ascendFlexibleWidth(node: T) {
    if (node.documentRoot && (node.hasWidth || node.blockStatic || node.blockWidth)) {
        return true;
    }
    let parent = <Undef<T>> node.renderParent;
    let i = 0;
    while (parent) {
        if (parent.hasWidth || parseInt(parent.layoutWidth) > 0 || parent.of(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.BLOCK) || parent.documentRoot && (parent.blockWidth || parent.blockStatic)) {
            return true;
        }
        else if (parent.flexibleWidth) {
            if (++i > 1) {
                return false;
            }
        }
        else if (parent.inlineWidth || parent.naturalElement && parent.inlineVertical) {
            return false;
        }
        parent = parent.renderParent as T;
    }
    return false;
}

export function ascendFlexibleHeight(node: T) {
    if (node.documentRoot && node.hasHeight) {
        return true;
    }
    const parent = <Undef<T>> node.renderParent;
    return !!parent && (parent.hasHeight || parent.layoutConstraint && parent.blockHeight) || node.absoluteParent?.hasHeight === true;
}

const excludeHorizontal = (node: T) => node.bounds.width === 0 && node.contentBoxWidth === 0 && node.textEmpty && node.marginLeft <= 0 && node.marginRight <= 0 && !node.visibleStyle.background;
const excludeVertical = (node: T) => (node.bounds.height === 0 || node.pseudoElement && node.textEmpty) && node.contentBoxHeight === 0 && (node.marginTop <= 0 && node.marginBottom <= 0 || node.css('overflow') === 'hidden' && parseFloat(node.css('height')) === 0);

const LAYOUT_RELATIVE_PARENT = LAYOUT_ANDROID.relativeParent;
const LAYOUT_RELATIVE = LAYOUT_ANDROID.relative;
const LAYOUT_CONSTRAINT = LAYOUT_ANDROID.constraint;
const DEPRECATED: ObjectMap<CustomizationResult> = DEPRECATED_ANDROID.android;

export default (Base: Constructor<squared.base.NodeUI>) => {
    return class View extends Base implements android.base.View {
        public static setConstraintDimension<T extends View>(node: T, percentWidth = 1): number {
            percentWidth = constraintPercentWidth(node, false, percentWidth);
            constraintPercentHeight(node, false, 1);
            if (!node.inputElement) {
                constraintMinMax(node, true);
                constraintMinMax(node, false);
            }
            return percentWidth;
        }

        public static setFlexDimension<T extends View>(node: T, dimension: "width" | "height", percentWidth = 1, percentHeight = 1): [number, number] {
            const { grow, basis, shrink } = node.flexbox;
            const horizontal = dimension === 'width';
            const setFlexGrow = (value: number) => {
                if (grow > 0) {
                    node.app(horizontal ? 'layout_constraintHorizontal_weight' : 'layout_constraintVertical_weight', truncate(grow, node.localSettings.floatPrecision));
                    return true;
                }
                else if (value > 0) {
                    if (shrink > 1) {
                        value /= shrink;
                    }
                    else if (shrink > 1) {
                        value *= 1 - shrink;
                    }
                    node.app(horizontal ? 'layout_constraintWidth_min' : 'layout_constraintHeight_min', formatPX(value));
                }
                return false;
            };
            if (isLength(basis)) {
                setFlexGrow(node.parseUnit(basis, dimension));
                setLayoutDimension(node, '0px', horizontal, true);
            }
            else if (basis !== '0%' && isPercent(basis)) {
                setFlexGrow(0);
                const percent = parseFloat(basis) / 100;
                if (horizontal) {
                    percentWidth = setConstraintPercent(node, percent, true, percentWidth);
                }
                else {
                    percentHeight = setConstraintPercent(node, percent, false, percentHeight);
                }
            }
            else {
                let flexible = false;
                if (Node.isFlexDirection(node, horizontal ? 'row' : 'column')) {
                    flexible = setFlexGrow(node.hasPX(dimension, false) ? horizontal ? node.actualWidth : node.actualHeight : 0);
                    if (flexible) {
                        setLayoutDimension(node, '0px', horizontal, true);
                    }
                }
                if (!flexible) {
                    if (horizontal) {
                        percentWidth = constraintPercentWidth(node, false, percentWidth);
                    }
                    else {
                        percentHeight = constraintPercentHeight(node, false, percentHeight);
                    }
                }
            }
            if (shrink > 1) {
                node.app(horizontal ? 'layout_constrainedWidth' : 'layout_constrainedHeight', 'true');
            }
            if (horizontal) {
                constraintPercentHeight(node, true);
            }
            else {
                constraintPercentWidth(node, true);
            }
            if (!node.inputElement && !node.imageOrSvgElement) {
                constraintMinMax(node, true);
                constraintMinMax(node, false);
            }
            return [percentWidth, percentHeight];
        }

        public static availablePercent(nodes: T[], dimension: "width" | "height", boxSize: number) {
            let percent = 1;
            let i = 0;
            for (const sibling of nodes) {
                if (sibling.pageFlow) {
                    i++;
                    if (sibling[dimension] > 0) {
                        const value = sibling.cssInitial(dimension);
                        if (isPercent(value)) {
                            percent -= parseFloat(value) / 100;
                            continue;
                        }
                        else if (isLength(value)) {
                            percent -= sibling.parseUnit(value, dimension) / boxSize;
                            continue;
                        }
                    }
                    percent -= sibling.bounds[dimension] / boxSize;
                }
            }
            return i > 0 ? Math.max(0, percent) : 1;
        }

        public static getControlName(containerType: number, api = BUILD_ANDROID.Q): string {
            const name = CONTAINER_NODE[containerType];
            return api >= BUILD_ANDROID.Q && CONTAINER_ANDROID_X[name] || CONTAINER_ANDROID[name];
        }

        public api = BUILD_ANDROID.LATEST;
        public renderParent?: T;
        public renderTemplates?: Null<NodeTemplate<T>>[];
        public outerWrapper?: T;
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
        protected _cached: CachedValueAndroidUI<T> = {};
        protected _controlName = '';
        protected _localSettings!: LocalSettingsAndroidUI;
        protected _documentParent?: T;
        protected _boxAdjustment?: BoxModel;
        protected _boxReset?: BoxModel;
        protected _innerWrapped?: T;

        private _containerType = 0;
        private _controlId?: string;
        private _labelFor?: T;
        private __android: StringMap = {};
        private __app: StringMap = {};
        private readonly _localization: boolean;

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
            else {
                this._localization = false;
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
                        const attr: Undef<string> = LAYOUT_CONSTRAINT[position];
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
                    const attr: Undef<string> = (relativeParent ? LAYOUT_RELATIVE_PARENT : LAYOUT_RELATIVE)[position];
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
                    if (overwrite || !node.constraint[orientation]) {
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
                        let attr: Undef<string> = LAYOUT_RELATIVE[value];
                        if (attr) {
                            node.delete('android', attr, this.localizeString(attr));
                        }
                        attr = LAYOUT_RELATIVE_PARENT[value];
                        if (attr) {
                            node.delete('android', attr, this.localizeString(attr));
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
                    const attr: Undef<string> = LAYOUT_CONSTRAINT[position];
                    if (attr) {
                        return node.app(this.localizeString(attr)) === 'parent' || node.app(attr) === 'parent';
                    }
                }
                else if (renderParent.layoutRelative) {
                    const attr: Undef<string> = LAYOUT_RELATIVE_PARENT[position];
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
                        const attr: Undef<string> = LAYOUT_CONSTRAINT[position];
                        if (attr) {
                            node.app(this.localizeString(attr), documentId);
                        }
                    }
                    else if (renderParent.layoutRelative) {
                        const attr: Undef<string> = LAYOUT_RELATIVE[position];
                        if (attr) {
                            node.android(this.localizeString(attr), documentId);
                        }
                    }
                }
                else {
                    if (renderParent.layoutConstraint) {
                        const attr: Undef<string> = LAYOUT_CONSTRAINT[position];
                        if (attr) {
                            const value = node.app(this.localizeString(attr)) || node.app(attr);
                            return value !== 'parent' && value !== renderParent.documentId ? value : '';
                        }
                    }
                    else if (renderParent.layoutRelative) {
                        const attr: Undef<string> = LAYOUT_RELATIVE[position];
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
                switch (typeof callback) {
                    case 'boolean':
                        return callback;
                    case 'function':
                        return callback(result, this.api, this);
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

        public hide(options?: HideOptions<T>) {
            if (options) {
                if (options.hidden) {
                    this.android('visibility', 'invisible');
                    return;
                }
                else if (options.collapse) {
                    this.android('visibility', 'gone');
                    return;
                }
            }
            super.hide(options);
        }

        public clone(id?: number, attributes = true, position = false): T {
            const node = new View(id || this.id, this.sessionId, this.element || undefined);
            node.unsafe('localization', this._localization);
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
            node.saveAsInitial(true);
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
            if (this.plainText) {
                this.setLayoutWidth('wrap_content', false);
                this.setLayoutHeight('wrap_content', false);
                return;
            }
            switch (this.css('visibility')) {
                case 'hidden':
                    this.hide({ hidden: true });
                    break;
                case 'collapse':
                    this.hide({ collapse: true });
                    break;
            }
            const actualParent = this.actualParent || this.documentParent;
            const renderParent = this.renderParent as T;
            const maxDimension = this.support.maxDimension;
            if (this.documentBody) {
                const fixed = renderParent.id === 0 && this.renderChildren.some(node => node.css('position') === 'fixed');
                if (fixed || this.css('width') === '100%' || this.css('minWidth') === '100%' || this.blockStatic && !this.hasPX('width') && !this.hasPX('maxWidth')) {
                    this.setLayoutWidth('match_parent', false);
                }
                if (fixed || this.css('height') === '100%' || this.css('minHeight') === '100%') {
                    this.setLayoutHeight('match_parent', false);
                }
            }
            if (this.layoutWidth === '') {
                let layoutWidth = '';
                if (this.hasPX('width') && (!this.inlineStatic || this.cssInitial('width') === '')) {
                    const width = this.css('width');
                    let value = 0;
                    if (isPercent(width)) {
                        const expandable = () => width === '100%' && !renderParent.inlineWidth && (maxDimension || !this.hasPX('maxWidth'));
                        if (this.inputElement) {
                            if (expandable()) {
                                layoutWidth = 'match_parent';
                            }
                            else {
                                value = this.actualWidth;
                            }
                        }
                        else if (renderParent.layoutConstraint && !renderParent.inlineWidth) {
                            if (expandable()) {
                                layoutWidth = 'match_parent';
                            }
                            else {
                                View.setConstraintDimension(this);
                                layoutWidth = this.layoutWidth;
                            }
                        }
                        else if (renderParent.layoutGrid) {
                            layoutWidth = '0px';
                            this.android('layout_columnWeight', truncate(parseFloat(width) / 100, this.localSettings.floatPrecision));
                        }
                        else if (this.imageElement) {
                            if (expandable()) {
                                layoutWidth = 'match_parent';
                            }
                            else {
                                value = this.bounds.width;
                            }
                        }
                        else if (width === '100%') {
                            if (!maxDimension && this.hasPX('maxWidth')) {
                                const maxWidth = this.css('maxWidth');
                                const maxValue = this.parseUnit(maxWidth);
                                const absoluteParent = this.absoluteParent || actualParent;
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
                    else {
                        value = this.actualWidth;
                    }
                    if (value > 0) {
                        layoutWidth = formatPX(value);
                    }
                }
                else if (this.length) {
                    switch (this.cssInitial('width')) {
                        case 'max-content':
                        case 'fit-content':
                            this.renderEach((node: T) => {
                                if (!node.hasPX('width')) {
                                    node.setLayoutWidth('wrap_content');
                                }
                            });
                            layoutWidth = 'wrap_content';
                            break;
                        case 'min-content': {
                            const nodes: T[] = [];
                            let maxWidth = 0;
                            this.renderEach((node: T) => {
                                if (!node.textElement || node.hasPX('width')) {
                                    maxWidth = Math.max(node.actualWidth, maxWidth);
                                }
                                else {
                                    maxWidth = Math.max(node.width, maxWidth);
                                    if (node.support.maxDimension) {
                                        nodes.push(node);
                                    }
                                }
                            });
                            if (maxWidth > 0 && nodes.length) {
                                const widthPX = formatPX(maxWidth);
                                for (const node of nodes) {
                                    if (!node.hasPX('maxWidth')) {
                                        node.css('maxWidth', widthPX);
                                    }
                                }
                            }
                            layoutWidth = 'wrap_content';
                            break;
                        }
                    }
                }
                if (layoutWidth === '') {
                    if (this.textElement && this.textEmpty && !this.visibleStyle.backgroundImage) {
                        layoutWidth = formatPX(this.actualWidth);
                    }
                    else if (this.imageElement && this.hasPX('height')) {
                        layoutWidth = 'wrap_content';
                    }
                    else {
                        const checkParentWidth = () => {
                            let parent = renderParent;
                            do {
                                if (!parent.blockWidth) {
                                    if (!parent.inlineWidth) {
                                        layoutWidth = 'match_parent';
                                    }
                                    else if (this.styleText && this.visibleStyle.background && this.cssTry('display', 'inline-block')) {
                                        if (actualTextRangeRect(<Element> this.element, this.sessionId, false).width < this.bounds.width) {
                                            layoutWidth = 'match_parent';
                                        }
                                        this.cssFinally('display');
                                    }
                                    return;
                                }
                                else if (parent.documentBody) {
                                    break;
                                }
                                parent = parent.renderParent as T;
                            }
                            while (parent);
                            if (renderParent.layoutVertical || renderParent.layoutFrame || !renderParent.inlineWidth && this.onlyChild || (renderParent.layoutRelative || renderParent.layoutConstraint) && this.alignParent('right')) {
                                layoutWidth = 'match_parent';
                            }
                        };
                        if (this.blockStatic && !this.inputElement && !renderParent.layoutGrid) {
                            if (!actualParent.layoutElement) {
                                if (this.nodeGroup || renderParent.hasWidth || this.hasAlign(NODE_ALIGNMENT.BLOCK)) {
                                    layoutWidth = 'match_parent';
                                }
                                else {
                                    checkParentWidth();
                                }
                            }
                            else if (this.layoutElement && this.onlyChild) {
                                layoutWidth = renderParent.inlineWidth ? 'wrap_content' : 'match_parent';
                            }
                        }
                        if (layoutWidth === '') {
                            if (this.naturalElement && this.inlineStatic && !this.blockDimension && !actualParent.layoutElement && this.some(item => item.naturalElement && item.blockStatic)) {
                                checkParentWidth();
                            }
                            else if (this.layoutGrid && !this.hasWidth && this.some((node: T) => node.flexibleWidth)) {
                                layoutWidth = renderParent.inlineWidth && this.onlyChild ? formatPX(this.actualWidth) : 'match_parent';
                            }
                            else if (renderParent.layoutFrame && !renderParent.inlineWidth && !this.naturalChild && this.layoutVertical && this.rightAligned) {
                                layoutWidth = 'match_parent';
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
                    let value = 0;
                    if (isPercent(height)) {
                        if (this.inputElement) {
                            value = this.bounds.height;
                        }
                        else if (this.imageElement) {
                            if (height === '100%' && !renderParent.inlineHeight) {
                                layoutHeight = 'match_parent';
                            }
                            else {
                                value = this.bounds.height;
                            }
                        }
                        else if (height === '100%') {
                            if (!maxDimension) {
                                const maxHeight = this.css('maxHeight');
                                const maxValue = this.parseUnit(maxHeight);
                                const absoluteParent = this.absoluteParent || actualParent;
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
                            if (layoutHeight === '' && (this.documentRoot || this.onlyChild && !renderParent.inlineHeight || this.css('position') === 'fixed')) {
                                layoutHeight = 'match_parent';
                            }
                        }
                        if (layoutHeight === '' && this.hasHeight) {
                            value = this.actualHeight;
                        }
                    }
                    else {
                        value = this.actualHeight;
                    }
                    if (value > 0) {
                        if (this.is(CONTAINER_NODE.LINE) && this.tagName !== 'HR' && this.hasPX('height', true, true)) {
                            value += this.borderTopWidth + this.borderBottomWidth;
                        }
                        if (this.multiline && this.styleText && !this.hasPX('minHeight') && !actualParent.layoutElement) {
                            this.android('minHeight', formatPX(value));
                            layoutHeight = 'wrap_content';
                        }
                        else {
                            layoutHeight = formatPX(value);
                        }
                    }
                }
                if (layoutHeight === '') {
                    if (this.textElement && this.textEmpty && !this.visibleStyle.backgroundImage) {
                        if (renderParent.layoutConstraint && !this.floating && this.alignParent('top') && this.actualHeight >= (this.absoluteParent || actualParent).box.height) {
                            layoutHeight = '0px';
                            this.anchor('bottom', 'parent');
                        }
                        else if (this.naturalChild) {
                            layoutHeight = formatPX(this.actualHeight);
                        }
                    }
                    else if (this.imageElement && this.hasPX('width')) {
                        layoutHeight = 'wrap_content';
                    }
                    else if (this.display === 'table-cell') {
                        layoutHeight = 'match_parent';
                    }
                }
                this.setLayoutHeight(layoutHeight || 'wrap_content');
            }
            else if (layoutHeight === '0px' && renderParent.inlineHeight && renderParent.android('minHeight') === '' && !actualParent.layoutElement && actualParent === this.absoluteParent) {
                this.setLayoutHeight('wrap_content');
            }
            if (this.hasPX('minWidth') && (!Node.isFlexDirection(this, 'row') || actualParent.flexElement && !this.flexibleWidth)) {
                this.android('minWidth', formatPX(this.parseUnit(this.css('minWidth')) + (this.contentBox && !actualParent.gridElement ? this.contentBoxWidth : 0)), false);
            }
            if (this.hasPX('minHeight') && this.display !== 'table-cell' && (!Node.isFlexDirection(this, 'column') || actualParent.flexElement && !this.flexibleHeight)) {
                this.android('minHeight', formatPX(this.parseUnit(this.css('minHeight'), 'height') + (this.contentBox && !actualParent.gridElement ? this.contentBoxHeight : 0)), false);
            }
            if (maxDimension) {
                const maxWidth = this.css('maxWidth');
                let maxHeight = this.css('maxHeight');
                let width = -1;
                if (isLength(maxWidth, true)) {
                    if (maxWidth === '100%') {
                        if (this.svgElement) {
                            width = this.bounds.width;
                        }
                        else if (this.imageElement) {
                            width = this.toElementInt('naturalWidth');
                            if (width > this.documentParent.actualWidth) {
                                this.setLayoutWidth('match_parent');
                                this.setLayoutHeight('wrap_content');
                                width = -1;
                                maxHeight = '';
                            }
                        }
                        else if (!renderParent.inlineWidth) {
                            this.setLayoutWidth('match_parent');
                        }
                    }
                    else {
                        width = this.parseUnit(maxWidth);
                    }
                }
                else if (!this.pageFlow && this.multiline && this.inlineWidth && !this.preserveWhiteSpace && (this.ascend({ condition: item => item.hasPX('width') }).length || !this.textContent.includes('\n'))) {
                    width = this.bounds.width + this.contentBoxWidth;
                }
                if (width >= 0) {
                    this.android('maxWidth', formatPX(width), false);
                }
                if (isLength(maxHeight, true)) {
                    let height = -1;
                    if (maxHeight === '100%' && !this.svgElement) {
                        if (!renderParent.inlineHeight) {
                            this.setLayoutHeight('match_parent');
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
                    }
                }
            }
        }

        public setAlignment() {
            const node = this.outerMostWrapper as T;
            const renderParent = this.renderParent as T;
            const outerRenderParent = (node.renderParent || renderParent) as T;
            const autoMargin = this.autoMargin;
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
                if (this.inlineVertical && (outerRenderParent.layoutHorizontal && !outerRenderParent.support.positionRelative || outerRenderParent.layoutGrid || this.display === 'table-cell')) {
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
                    if (this.rightAligned) {
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
                else if (this.rightAligned && node.nodeGroup && node.layoutVertical) {
                    node.renderEach((item: T) => {
                        if (item.rightAligned) {
                            item.mergeGravity('layout_gravity', 'right');
                        }
                    });
                }
                if (renderParent.layoutFrame) {
                    if (!setAutoMargin(this, autoMargin)) {
                        if (this.innerWrapped === undefined) {
                            if (this.floating) {
                                floating = this.float;
                            }
                            if (floating !== '' && !renderParent.naturalElement && (renderParent.inlineWidth || !renderParent.documentRoot && this.onlyChild)) {
                                renderParent.mergeGravity('layout_gravity', floating);
                                floating = '';
                            }
                        }
                        if (this.centerAligned) {
                            this.mergeGravity('layout_gravity', checkTextAlign('center', false));
                        }
                        else if (this.rightAligned && renderParent.blockWidth) {
                            this.mergeGravity('layout_gravity', 'right');
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
            if (textAlignParent !== '' && this.blockStatic && !this.centerAligned && !this.rightAligned) {
                node.mergeGravity('layout_gravity', 'left', false);
            }
            if (!this.layoutConstraint && !this.layoutFrame && !this.layoutElement && !this.layoutGrid) {
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
            if (autoMargin.vertical && (renderParent.layoutFrame || renderParent.layoutVertical && renderParent.layoutLinear)) {
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
                                        this.anchorParent(STRING_ANDROID.HORIZONTAL, 'packed', 0.5);
                                    }
                                    break;
                            }
                        }
                        return;
                    }
                }
            }
            else {
                switch (this.tagName) {
                    case '#text':
                    case 'IMG':
                    case 'SVG':
                    case 'HR':
                        return;
                    case 'INPUT':
                        switch (this.toElementString('type')) {
                            case 'radio':
                            case 'checkbox':
                            case 'image':
                            case 'range':
                                return;
                        }
                        break;
                    default:
                        if (this.controlElement || this.is(CONTAINER_NODE.TEXT) && this.textEmpty || this.length && (this.layoutFrame || this.layoutConstraint || this.layoutGrid)) {
                            return;
                        }
                        break;
                }
            }
            const direction = getGravityValues(this, attr);
            const gravity = this.localizeString(alignment);
            if (!direction.has(gravity)) {
                direction.add(gravity);
                let result = '';
                let x = '';
                let y = '';
                let z = '';
                for (const value of direction.values()) {
                    if (isHorizontalAlign(value)) {
                        if (x === '' || overwrite) {
                            x = value;
                        }
                    }
                    else if (isVerticalAlign(value)) {
                        if (y === '' || overwrite) {
                            y = value;
                        }
                    }
                    else {
                        z += (z !== '' ? '|' : '') + value;
                    }
                }
                result = x !== '' && y !== '' ? x + '|' + y : x || y;
                if (z !== '') {
                    result += (result !== '' ? '|' : '') + z;
                }
                if (result !== '') {
                    this.android(attr, result);
                }
            }
        }

        public applyOptimizations() {
            const renderParent = this.renderParent;
            if (renderParent) {
                this.alignLayout(renderParent);
                this.setLineHeight(renderParent);
                this.finalizeGravity(renderParent, 'layout_gravity');
                this.finalizeGravity(renderParent, 'gravity');
                if (this.imageElement) {
                    const layoutWidth = this.layoutWidth;
                    const layoutHeight = this.layoutHeight;
                    if (layoutWidth === 'wrap_content' && layoutHeight !== 'wrap_content' ||
                        layoutWidth !== 'wrap_content' && layoutHeight === 'wrap_content' ||
                        layoutWidth === 'match_parent' || layoutHeight === 'match_parent' ||
                        layoutWidth === '0px' || layoutHeight === '0px' ||
                        this.android('minWidth') !== '' || this.android('minHeight') !== '' ||
                        this.android('maxWidth') !== '' || this.android('maxHeight') !== '')
                    {
                        this.android('adjustViewBounds', 'true');
                    }
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
                for (let i = 0; i < 4; i++) {
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
                                        value = clamp(outer - inner, 0, value);
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
                                if (this.hasPX('height', false, true) && (!this.layoutElement && (this.layoutVertical || this.layoutFrame) || !this.pageFlow) || this.documentParent.gridElement && this.hasPX('height', false)) {
                                    continue;
                                }
                                else if (this.floatContainer) {
                                    let maxBottom = Number.NEGATIVE_INFINITY;
                                    for (const item of this.naturalElements) {
                                        if (item.floating) {
                                            maxBottom = Math.max(item.bounds.bottom, maxBottom);
                                        }
                                    }
                                    value = clamp(this.bounds.bottom - maxBottom, 0, value);
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
                        let node = <Undef<T>> (this.renderParent as T).renderChildren.find(item => !item.floating);
                        if (node) {
                            const boundsTop = Math.floor(this.bounds.top);
                            let actualNode: Undef<T>;
                            while (Math.floor(node.bounds.top) === boundsTop) {
                                actualNode = node;
                                const innerWrapped = node.innerWrapped as T;
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
                    else if (top > 0 && (this.actualParent as T)?.floatContainer && this.getBox(BOX_STANDARD.MARGIN_TOP)[1] !== 1) {
                        const renderParent = this.renderParent as T;
                        if (renderParent.layoutVertical && renderParent.ascend({ condition: (item: T) => item.hasAlign(NODE_ALIGNMENT.FLOAT) || item.hasAlign(NODE_ALIGNMENT.COLUMN), error: (item: T) => item.naturalChild, attr: 'renderParent' }).length === 0) {
                            const boundsTop = Math.floor(this.bounds.top);
                            const renderChildren = renderParent.renderChildren;
                            let previous: Undef<T>;
                            for (const node of (this.actualParent as T).naturalElements as T[]) {
                                if (node.floating && Math.floor(node.bounds.top) === boundsTop && !renderChildren.includes(node)) {
                                    if (previous === undefined || !previous.lineBreak && previous.css('clear') === 'none') {
                                        top = Math.max(top - node.bounds.height, 0);
                                    }
                                    break;
                                }
                                previous = node;
                            }
                        }
                    }
                    if (this.positionStatic && !this.blockWidth && (left < 0 || right < 0)) {
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
                    switch (this.controlName) {
                        case CONTAINER_ANDROID.RADIO:
                        case CONTAINER_ANDROID.CHECKBOX:
                            top = Math.max(top - SPACING_CHECKBOX, 0);
                            bottom = Math.max(bottom - SPACING_CHECKBOX, 0);
                            break;
                        case CONTAINER_ANDROID.SELECT:
                            top = Math.max(top - SPACING_SELECT, 0);
                            bottom = Math.max(bottom - SPACING_SELECT, 0);
                            break;
                    }
                }
                else if (this.visibleStyle.borderWidth && !this.is(CONTAINER_NODE.LINE)) {
                    top += this.borderTopWidth;
                    bottom += this.borderBottomWidth;
                    right += this.borderRightWidth;
                    left += this.borderLeftWidth;
                }
                if (top !== 0 || left !== 0 || bottom !== 0 || right !== 0) {
                    let mergeAll = 0;
                    let mergeHorizontal = 0;
                    let mergeVertical = 0;
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
            setBoxModel(BOX_MARGIN, true, (this.renderParent as T).layoutGrid);
            setBoxModel(BOX_PADDING, false, false);
        }

        public setSingleLine(ellipsize = false) {
            if (this.textElement && this.naturalChild) {
                const parent = <View> this.actualParent;
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
                if (!this.svgElement) {
                    const opacity = this.css('opacity');
                    if (opacity !== '1' && isNumber(opacity)) {
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

        public actualRect(direction: string, dimension: BoxType = 'linear') {
            let value: number = this[dimension][direction];
            if (this.positionRelative && this.floating) {
                switch (direction) {
                    case 'top':
                        if (this.hasPX('top')) {
                            value += this.top;
                        }
                        else {
                            value -= this.bottom;
                        }
                        break;
                    case 'bottom':
                        if (!this.hasPX('top')) {
                            value -= this.bottom;
                        }
                        else {
                            value += this.top;
                        }
                        break;
                    case 'left':
                        if (this.hasPX('left')) {
                            value += this.left;
                        }
                        else {
                            value -= this.right;
                        }
                    case 'right':
                        if (!this.hasPX('left')) {
                            value -= this.right;
                        }
                        else {
                            value += this.left;
                        }
                        break;
                }
            }
            if (this.inputElement) {
                const companion = this.companion;
                if (companion?.labelFor === this && !companion.visible) {
                    const outer: number = companion[dimension][direction];
                    switch (direction) {
                        case 'top':
                        case 'left':
                            return Math.min(outer, value);
                        case 'right':
                        case 'bottom':
                            return Math.max(outer, value);
                    }
                }
            }
            return value;
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
                    if (this.baselineElement && !renderParent.layoutFrame && !this.documentRoot) {
                        this.android('baselineAlignedChildIndex', '0');
                    }
                }
                else {
                    let baseline = true;
                    const children = this.renderChildren;
                    if (children.some(node => node.floating) && !children.some(node => node.imageElement && node.baseline)) {
                        this.android('baselineAligned', 'false');
                        baseline = false;
                    }
                    const length = children.length;
                    for (let i = 0; i < length; i++) {
                        const item = children[i];
                        if (i > 0) {
                            item.setSingleLine(i === length - 1);
                        }
                        if (baseline && item.baselineElement) {
                            this.android('baselineAlignedChildIndex', i.toString());
                            baseline = false;
                        }
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
                                    const row = horizontalRows[i];
                                    const nextRow = horizontalRows[i + 1];
                                    const nextMultiline = !!nextRow && (nextRow.length === 1 && nextRow[0].multiline || nextRow[0].lineBreakLeading || i < length - 1 && nextRow.find(node => node.baselineActive)?.has('lineHeight'));
                                    const first = row[0];
                                    const baseline = row.find(node => node.baselineActive);
                                    const singleLine = row.length === 1 && !first.multiline;
                                    const top = singleLine || !previousMultiline && (i > 0 || length === 1) || first.lineBreakLeading;
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
                                    previousMultiline = row.length === 1 && first.multiline;
                                }
                            }
                        }
                    }
                }
            }
        }

        private finalizeGravity(renderParent: T, attr: string) {
            const direction = getGravityValues(this, attr);
            if (direction.size > 1) {
                checkMergableGravity('center', direction);
                checkMergableGravity('fill', direction);
            }
            let result = '';
            let x = '';
            let y = '';
            let z = '';
            for (const value of direction.values()) {
                if (isHorizontalAlign(value)) {
                    x = value;
                }
                else if (isVerticalAlign(value)) {
                    y = value;
                }
                else {
                    z += (z !== '' ? '|' : '') + value;
                }
            }
            result = x !== '' && y !== '' ? x + '|' + y : x || y;
            if (z !== '') {
                result += (result !== '' ? '|' : '') + z;
            }
            if (result !== '') {
                this.android(attr, result);
            }
            else {
                this.delete('android', attr);
            }
        }

        get controlElement() {
            switch (this.tagName) {
                case 'PROGRESS':
                case 'METER':
                    return true;
                case 'INPUT':
                    return this.toElementString('type') === 'range';
            }
            return false;
        }

        get documentId() {
            const controlId = this.controlId;
            return controlId !== '' ? '@id/' + controlId : '';
        }

        set controlId(value) {
            this._controlId = value;
        }
        get controlId() {
            let result = this._controlId;
            if (result === undefined) {
                const controlName = this.controlName;
                if (controlName) {
                    let name: Undef<string>;
                    if (this.styleElement) {
                        const value = this.elementId?.trim() || getNamedItem(<HTMLElement> this.element, 'name');
                        if (value !== '') {
                            name = value.replace(REGEX_VALIDSTRING, '_').toLowerCase();
                            if (name === 'parent' || RESERVED_JAVA.includes(name)) {
                                name = '_' + name;
                            }
                        }
                    }
                    result = convertWord(ResourceUI.generateId('android', name || fromLastIndexOf(controlName, '.').toLowerCase(), name ? 0 : 1));
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
            let target = this as T;
            do {
                const renderParent = target.renderParent as T;
                if (renderParent) {
                    if (renderParent.layoutConstraint || renderParent.layoutRelative) {
                        return target;
                    }
                }
                else {
                    break;
                }
                target = target.outerWrapper as T;
            }
            while (target);
            return this;
        }

        set anchored(value) {
            const constraint = this.constraint;
            constraint.horizontal = value;
            constraint.vertical = value;
        }
        get anchored() {
            const constraint = this.constraint;
            return constraint.horizontal === true && constraint.vertical === true;
        }

        set containerType(value) {
            this._containerType = value;
        }
        get containerType() {
            if (this._containerType === 0) {
                const value: number = ELEMENT_ANDROID[this.containerName];
                if (value > 0) {
                    this._containerType = value;
                }
            }
            return this._containerType;
        }

        get imageOrSvgElement() {
            return this.imageElement || this.svgElement;
        }

        get layoutFrame() {
            return this._containerType === CONTAINER_NODE.FRAME;
        }
        get layoutLinear() {
            return this._containerType === CONTAINER_NODE.LINEAR;
        }
        get layoutGrid() {
            return this._containerType === CONTAINER_NODE.GRID;
        }
        get layoutRelative() {
            return this._containerType === CONTAINER_NODE.RELATIVE;
        }
        get layoutConstraint() {
            return this._containerType === CONTAINER_NODE.CONSTRAINT;
        }

        set renderExclude(value) {
            this._cached.renderExclude = value;
        }
        get renderExclude(): boolean {
            let result = this._cached.renderExclude;
            if (result === undefined) {
                const renderParent = this.renderParent;
                if (renderParent && this.length === 0 && this.styleElement && !this.imageElement) {
                    if (this.pageFlow) {
                        if (renderParent.layoutVertical) {
                            result = excludeVertical(this) && this.alignSibling('topBottom') === '' && this.alignSibling('bottomTop') === '';
                        }
                        else {
                            result = excludeHorizontal(this) && (renderParent.layoutHorizontal || excludeVertical(this)) && this.alignSibling('leftRight') === '' && this.alignSibling('rightLeft') === '' && this.alignSibling('topBottom') === '' && this.alignSibling('bottomTop') === '';
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
                            case CONTAINER_ANDROID.RADIO:
                            case CONTAINER_ANDROID.CHECKBOX:
                                result += SPACING_CHECKBOX * 2;
                                break;
                            case CONTAINER_ANDROID.SELECT:
                                result /= this.toElementInt('size') || 1;
                                result += SPACING_SELECT * 2;
                                break;
                            default:
                                result += Math.max(convertFloat(this.verticalAlign) * -1, 0);
                                break;
                        }
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
                    case 'absolute': {
                        const { absoluteParent, documentParent } = this;
                        if (absoluteParent) {
                            if (absoluteParent === documentParent) {
                                result = true;
                            }
                            else if (absoluteParent.box.right === documentParent.linear.right && this.hasPX('right') && !this.hasPX('left')) {
                                this.css('top', formatPX(this.linear.top - documentParent.box.top), true);
                                result = true;
                            }
                        }
                        break;
                    }
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
            return this.__android['layout_width'] || '';
        }

        get layoutHeight() {
            return this.__android['layout_height'] || '';
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
            const parent = this.actualParent;
            if (parent?.gridElement === false) {
                const boxWidth = parent.box.width;
                return boxWidth > 0 ? this.contentBoxWidth / boxWidth : 0;
            }
            return 0;
        }
        get contentBoxHeightPercent() {
            const parent = this.actualParent;
            if (parent?.gridElement === false) {
                const boxHeight = parent.box.height;
                return boxHeight > 0 ? this.contentBoxHeight / boxHeight : 0;
            }
            return 0;
        }

        get labelFor() {
            return this._labelFor;
        }
        set labelFor(value) {
            if (value) {
                value.companion = this;
            }
            this._labelFor = value;
        }

        get innerWrapped() {
            return this._innerWrapped;
        }
        set innerWrapped(value) {
            if (value) {
                value = value.outerMostWrapper as T;
                this._innerWrapped = value;
                value.outerWrapper = this;
            }
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