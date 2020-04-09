import { NodeTemplate } from '../../@types/base/application';
import { AutoMargin, BoxType, HideUIOptions, TranslateUIOptions } from '../../@types/base/node';
import { CachedValueAndroidUI, Constraint, LocalSettingsAndroidUI, SupportAndroid } from '../../@types/android/node';

import { CONTAINER_ANDROID, CONTAINER_ANDROID_X, ELEMENT_ANDROID, LAYOUT_ANDROID, RESERVED_JAVA, STRING_ANDROID } from './lib/constant';
import { API_ANDROID, DEPRECATED_ANDROID } from './lib/customization';
import { BUILD_ANDROID, CONTAINER_NODE } from './lib/enumeration';
import { getDataSet, isHorizontalAlign, isVerticalAlign, localizeString } from './lib/util';

type T = android.base.View;

const $lib = squared.lib;
const $base = squared.base;

const { BOX_MARGIN, BOX_PADDING, CSS_UNIT, formatPX, isLength, isPercent } = $lib.css;
const { createElement, getNamedItem, newBoxModel } = $lib.dom;
const { clamp, truncate } = $lib.math;
const { actualTextRangeRect } = $lib.session;
const { capitalize, convertFloat, convertInt, convertWord, fromLastIndexOf, isNumber, isPlainObject, isString, replaceMap } = $lib.util;

const { EXT_NAME } = $base.lib.constant;
const { BOX_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE } = $base.lib.enumeration;

const ResourceUI = $base.ResourceUI;

const { constraint: LAYOUT_CONSTRAINT, relative: LAYOUT_RELATIVE, relativeParent: LAYOUT_RELATIVE_PARENT } = LAYOUT_ANDROID;
const DEPRECATED = DEPRECATED_ANDROID.android;
const SPACING_SELECT = 2;
const SPACING_CHECKBOX = 4;
const REGEX_DATASETATTR = /^attr[A-Z]/;
const REGEX_FORMATTED = /^(?:([a-z]+):)?(\w+)="((?:@+?[a-z]+\/)?.+)"$/;
const REGEX_STRINGVALID = /[^\w$\-_.]/g;
const REGEX_CLIPNONE = /^rect\(0[a-z]*, 0[a-z]*, 0[a-z]*, 0[a-z]*\)$/;

function checkTextAlign(value: string, ignoreStart: boolean) {
    switch (value) {
        case 'left':
        case 'start':
            return !ignoreStart ? value : '';
        case 'center':
            return 'center_horizontal';
        case 'justify':
        case 'initial':
        case 'inherit':
            return '';
    }
    return value;
}

function setAutoMargin(node: T, autoMargin: AutoMargin) {
    if (autoMargin.horizontal && (!node.blockWidth || node.hasWidth || node.hasPX('maxWidth') || node.innerMostWrapped.has('width', { type: CSS_UNIT.PERCENT, not: '100%' }))) {
        node.mergeGravity(
            (node.blockWidth || !node.pageFlow) && !node.outerWrapper ? 'gravity' : 'layout_gravity',
            autoMargin.leftRight ? 'center_horizontal' : (autoMargin.left ? 'right' : 'left')
        );
        return true;
    }
    return false;
}

function setMultiline(node: T, lineHeight: number, overwrite: boolean) {
    const offset = getLineSpacingExtra(node, lineHeight);
    if (node.api >= BUILD_ANDROID.PIE) {
        node.android('lineHeight', formatPX(lineHeight), overwrite);
    }
    else if (offset > 0) {
        node.android('lineSpacingExtra', formatPX(offset), overwrite);
    }
    else {
        return;
    }
    const upper = Math.round(offset);
    if (upper > 0) {
        node.modifyBox(node.inline ? BOX_STANDARD.MARGIN_TOP : BOX_STANDARD.PADDING_TOP, upper);
        if (!(node.block && !node.floating)) {
            node.modifyBox(node.inline ? BOX_STANDARD.MARGIN_BOTTOM : BOX_STANDARD.PADDING_BOTTOM, Math.floor(offset));
        }
    }
}

function setMarginOffset(node: T, lineHeight: number, inlineStyle: boolean, top: boolean, bottom: boolean) {
    const styleValue = node.cssInitial('lineHeight');
    if (node.imageOrSvgElement || node.renderChildren.length || node.actualHeight === 0 || styleValue === 'initial') {
        return;
    }
    if (node.multiline) {
        setMultiline(node, lineHeight, false);
    }
    else {
        const setBoxPadding = (offset: number, padded = false) => {
            let upper = Math.round(offset);
            if (upper > 0) {
                const boxPadding = inlineStyle && (node.styleText || padded) && !node.inline && !(node.inputElement && !isLength(styleValue, true));
                if (top) {
                    if (boxPadding) {
                        if (upper > 0) {
                            node.modifyBox(BOX_STANDARD.PADDING_TOP, upper);
                        }
                    }
                    else if (inlineStyle || !node.baselineAltered) {
                        upper -= node.paddingTop;
                        if (upper > 0) {
                            node.modifyBox(BOX_STANDARD.MARGIN_TOP, upper);
                        }
                    }
                }
                if (bottom) {
                    offset = Math.floor(offset);
                    if (boxPadding) {
                        if (offset > 0) {
                            node.modifyBox(BOX_STANDARD.PADDING_BOTTOM, offset);
                        }
                    }
                    else {
                        offset -= node.paddingBottom;
                        if (offset > 0) {
                            node.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, offset);
                        }
                    }
                }
            }
        };
        const height = node.height;
        if (lineHeight === height) {
            node.mergeGravity('gravity', 'center_vertical', false);
        }
        else if (height > 0) {
            if (node.styleText) {
                setBoxPadding(getLineSpacingExtra(node, lineHeight));
            }
            else {
                const offset = (lineHeight / 2) - node.paddingTop;
                if (offset > 0) {
                    node.modifyBox(BOX_STANDARD.PADDING_TOP, offset);
                }
            }
        }
        else if (node.textElement) {
            setBoxPadding(getLineSpacingExtra(node, lineHeight));
        }
        else if (node.inputElement) {
            const element = createElement(document.body, 'div', { ...node.textStyle, visibility: 'hidden' });
            element.innerText = 'AgjpyZ';
            const rowHeight = actualTextRangeRect(<Element> element).height;
            document.body.removeChild(element);
            let rows = 1;
            switch (node.tagName)  {
                case 'SELECT':
                    rows = node.toElementInt('size', 1);
                    break;
                case 'TEXTAREA':
                    rows = node.toElementInt('rows', 1);
                    break;
            }
            setBoxPadding((lineHeight - rowHeight * Math.max(rows, 1)) / 2, true);
        }
        else {
            setBoxPadding((lineHeight - node.bounds.height) / 2);
        }
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
    let height = NaN;
    if (node.styleText) {
        const values = node.cssTryAll({
            'display': 'inline-block',
            'height': 'auto',
            'max-height': 'none',
            'min-height': 'auto',
            'line-height': 'normal',
            'white-space': 'nowrap'
        });
        if (values) {
            height = actualTextRangeRect(<Element> node.element).height;
            node.cssFinally(values);
        }
    }
    else if (node.plainText) {
        const bounds = node.bounds;
        height = bounds.height / (bounds.numberOfLines || 1);
    }
    return (lineHeight - (!isNaN(height) ? height : node.boundingClientRect.height)) / 2;
}

function constraintMinMax(node: T, horizontal: boolean) {
    if (node.support.maxDimension && (horizontal && node.floating || !horizontal)) {
        return;
    }
    if (!node.hasPX(horizontal ? 'width' : 'height', false)) {
        const minWH = node.cssInitial(horizontal ? 'minWidth' : 'minHeight', true);
        if (isLength(minWH, true) && parseFloat(minWH) > 0) {
            if (horizontal) {
                if (ascendFlexibleWidth(node)) {
                    node.setLayoutWidth('0px', false);
                    if (node.flexibleWidth) {
                        node.app('layout_constraintWidth_min', formatPX(node.parseWidth(minWH) + node.contentBoxWidth));
                        node.css('minWidth', 'auto');
                    }
                }
            }
            else if (ascendFlexibleHeight(node)) {
                node.setLayoutHeight('0px', false);
                if (node.flexibleHeight) {
                    node.app('layout_constraintHeight_min', formatPX(node.parseHeight(minWH) + node.contentBoxHeight));
                    node.css(horizontal ? 'minWidth' : 'minHeight', 'auto');
                }
            }
        }
    }
    const maxWH = node.cssInitial(horizontal ? 'maxWidth' : 'maxHeight', true);
    if (isLength(maxWH, true) && maxWH !== '100%') {
        if (horizontal) {
            if (ascendFlexibleWidth(node)) {
                const value = node.parseWidth(maxWH);
                if (value > node.width || node.percentWidth > 0) {
                    node.setLayoutWidth('0px');
                    node.app('layout_constraintWidth_max', formatPX(value + (node.contentBox ? node.contentBoxWidth : 0)));
                    node.css('maxWidth', 'auto');
                }
            }
        }
        else if (ascendFlexibleHeight(node)) {
            const value = node.parseHeight(maxWH);
            if (value > node.height || node.percentHeight > 0) {
                node.setLayoutHeight('0px');
                node.app('layout_constraintHeight_max', formatPX(value + (node.contentBox ? node.contentBoxHeight : 0)));
                node.css('maxHeight', 'auto');
            }
        }
    }
}

function setConstraintPercent(node: T, value: number, horizontal: boolean, percent: number) {
    if (value < 1 && !isNaN(percent) && node.pageFlow) {
        const parent = node.actualParent || node.documentParent;
        let boxPercent: number;
        let marginPercent: number;
        if (horizontal) {
            const width = parent.box.width;
            boxPercent = !parent.gridElement ? node.contentBoxWidth / width : 0;
            marginPercent = (Math.max(node.marginLeft, 0) + node.marginRight) / width;
        }
        else {
            const height = parent.box.height;
            boxPercent = !parent.gridElement ? node.contentBoxHeight / height : 0;
            marginPercent = (Math.max(node.marginTop, 0) + node.marginBottom) / height;
        }
        if (percent === 1 && value + marginPercent >= percent) {
            value = percent - marginPercent;
        }
        else {
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
    }
    if (value === 1 && !node.hasPX(horizontal ? 'maxWidth' : 'maxHeight')) {
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

function constraintPercentValue(node: T, horizontal: boolean, percent: number) {
    const value = horizontal ? node.percentWidth : node.percentHeight;
    return value > 0 ? setConstraintPercent(node, value, horizontal, percent) : percent;
}

function constraintPercentWidth(node: T, percent = 1) {
    const value = node.percentWidth;
    if (value > 0) {
        if ((node.renderParent as T).hasPX('width', false) && !(node.actualParent || node.documentParent).layoutElement) {
            if (value < 1) {
                node.setLayoutWidth(formatPX(node.actualWidth));
            }
            else {
                node.setLayoutWidth('match_parent', false);
            }
        }
        else if (!node.inputElement) {
            return constraintPercentValue(node, true, percent);
        }
    }
    return percent;
}

function constraintPercentHeight(node: T, percent = 1) {
    const value = node.percentHeight;
    if (value > 0) {
        if ((node.renderParent as T).hasPX('height', false) && !(node.actualParent || node.documentParent).layoutElement) {
            if (value < 1) {
                node.setLayoutHeight(formatPX(node.actualHeight));
            }
            else {
                node.setLayoutHeight('match_parent', false);
            }
        }
        else if (!node.inputElement) {
            return constraintPercentValue(node, false, percent);
        }
    }
    return percent;
}

function ascendFlexibleWidth(node: T) {
    if (node.documentRoot && (node.hasWidth || node.blockStatic || node.blockWidth)) {
        return true;
    }
    let parent = <Undef<T>> node.renderParent;
    let i = 0;
    while (parent) {
        if (!parent.inlineWidth && (parent.hasWidth || parseInt(parent.layoutWidth) > 0 || parent.of(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.BLOCK) || parent.documentRoot && (parent.blockWidth || parent.blockStatic))) {
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

function ascendFlexibleHeight(node: T) {
    if (node.documentRoot && node.hasHeight) {
        return true;
    }
    const parent = <Undef<T>> node.renderParent;
    return !!parent && (parent.hasHeight || parent.layoutConstraint && parent.blockHeight) || node.absoluteParent?.hasHeight === true;
}

const excludeHorizontal = (node: T) => node.bounds.width === 0 && node.contentBoxWidth === 0 && node.textEmpty && node.marginLeft === 0 && node.marginRight === 0 && !node.visibleStyle.background;
const excludeVertical = (node: T) => node.bounds.height === 0 && node.contentBoxHeight === 0 && (node.marginTop === 0 && node.marginBottom === 0 || node.css('overflow') === 'hidden');

function setLineHeight(node: T, renderParent: T) {
    const lineHeight = node.lineHeight;
    if (lineHeight > 0) {
        const hasOwnStyle = node.has('lineHeight', { map: 'initial' });
        if (node.multiline) {
            setMultiline(node, lineHeight, hasOwnStyle);
        }
        else if (node.renderChildren.length) {
            if (!hasOwnStyle && node.layoutHorizontal && node.alignSibling('baseline')) {
                return;
            }
            else if (node.layoutVertical || node.layoutFrame) {
                node.renderChildren.forEach((item: T) => {
                    if (item.length === 0 && !item.multiline && !isNaN(item.lineHeight) && !item.has('lineHeight')) {
                        setMarginOffset(item, lineHeight, true, true, true);
                    }
                });
            }
            else {
                const horizontalRows = node.horizontalRows || [node.renderChildren];
                let previousMultiline = false;
                const length = horizontalRows.length;
                for (let i = 0; i < length; ++i) {
                    const row = horizontalRows[i];
                    const q = row.length;
                    const nextRow = horizontalRows[i + 1];
                    const nextMultiline = !!nextRow && (nextRow.length === 1 && nextRow[0].multiline || nextRow[0].lineBreakLeading || i < length - 1 && !!nextRow.find(item => item.baselineActive)?.has('lineHeight'));
                    const first = row[0];
                    const singleItem = q === 1;
                    const singleLine = singleItem && !first.multiline;
                    const baseline = !singleItem && row.find(item => item.baselineActive && item.renderChildren.length === 0);
                    const top = singleLine || !previousMultiline && (i > 0 || length === 1) || first.lineBreakLeading;
                    const bottom = singleLine || !nextMultiline && (i < length - 1 || length === 1);
                    if (baseline && q > 1) {
                        if (!isNaN(baseline.lineHeight) && !baseline.has('lineHeight')) {
                            setMarginOffset(baseline as T, lineHeight, false, top, bottom);
                        }
                        else {
                            previousMultiline = true;
                            continue;
                        }
                    }
                    else {
                        row.forEach((item: T) => {
                            if (item.length === 0 && !item.multiline && !isNaN(item.lineHeight) && !item.has('lineHeight')) {
                                setMarginOffset(item, lineHeight, singleItem, top, bottom);
                            }
                        });
                    }
                    previousMultiline = singleItem && first.multiline;
                }
            }
        }
        else if (hasOwnStyle || renderParent.lineHeight === 0) {
            setMarginOffset(node, lineHeight, hasOwnStyle, true, true);
        }
    }
}

function finalizeGravity(node: T, attr: string) {
    const direction = getGravityValues(node, attr);
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
        node.android(attr, result);
    }
    else {
        node.delete('android', attr);
    }
}

const getGravityValues = (node: T, attr: string) => new Set<string>(node.android(attr).split('|'));

export default (Base: Constructor<squared.base.NodeUI>) => {
    return class View extends Base implements android.base.View {
        public static setConstraintDimension<T extends View>(node: T, percentWidth = NaN) {
            percentWidth = constraintPercentWidth(node, percentWidth);
            constraintPercentHeight(node, 1);
            if (!node.inputElement) {
                constraintMinMax(node, true);
                constraintMinMax(node, false);
            }
            return percentWidth;
        }

        public static setFlexDimension<T extends View>(node: T, dimension: DimensionAttr) {
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
                    setConstraintPercent(node, percent, true, NaN);
                }
                else {
                    setConstraintPercent(node, percent, false, NaN);
                }
            }
            else {
                let flexible = false;
                if (node.hasFlex(horizontal ? 'row' : 'column')) {
                    flexible = setFlexGrow(node.hasPX(dimension, false) ? horizontal ? node.actualWidth : node.actualHeight : 0);
                    if (flexible) {
                        setLayoutDimension(node, '0px', horizontal, true);
                    }
                }
                if (!flexible) {
                    if (horizontal) {
                        constraintPercentWidth(node, 0);
                    }
                    else {
                        constraintPercentHeight(node, 0);
                    }
                }
            }
            if (shrink > 1) {
                node.app(horizontal ? 'layout_constrainedWidth' : 'layout_constrainedHeight', 'true');
            }
            if (horizontal) {
                constraintPercentHeight(node);
            }
            if (!node.inputElement && !node.imageOrSvgElement) {
                constraintMinMax(node, true);
                constraintMinMax(node, false);
            }
        }

        public static availablePercent(nodes: T[], dimension: DimensionAttr, boxSize: number) {
            const horizontal = dimension === 'width';
            let percent = 1;
            let i = 0;
            nodes.forEach(sibling => {
                sibling = sibling.innerMostWrapped as T;
                if (sibling.pageFlow) {
                    ++i;
                    if (sibling.hasPX(dimension, true, true)) {
                        const value = sibling.cssInitial(dimension);
                        if (isPercent(value)) {
                            percent -= parseFloat(value) / 100;
                            return;
                        }
                        else if (isLength(value)) {
                            if (horizontal) {
                                percent -= (Math.max(sibling.actualWidth + sibling.marginLeft + sibling.marginRight, 0)) / boxSize;
                            }
                            else {
                                percent -= (Math.max(sibling.actualHeight + sibling.marginTop + sibling.marginBottom, 0)) / boxSize;
                            }
                            return;
                        }
                    }
                    percent -= sibling.linear[dimension] / boxSize;
                }
            });
            return i > 0 ? Math.max(0, percent) : 1;
        }

        public static getControlName(containerType: number, api = BUILD_ANDROID.Q): string {
            const name = CONTAINER_NODE[containerType];
            return api >= BUILD_ANDROID.Q && CONTAINER_ANDROID_X[name] || CONTAINER_ANDROID[name];
        }

        public api = BUILD_ANDROID.LATEST;
        public renderParent?: T;
        public renderTemplates?: NodeTemplate<T>[];
        public outerWrapper?: T;
        public companion?: T;
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
        protected _containerType = 0;
        protected _controlName = '';
        protected _localSettings!: LocalSettingsAndroidUI;
        protected _documentParent?: T;
        protected _boxAdjustment = newBoxModel();
        protected _boxReset = newBoxModel();
        protected _innerWrapped?: T;

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

        public setControlType(controlName: string, containerType?: number) {
            this.controlName = controlName;
            if (containerType) {
                this._containerType = containerType;
            }
            else if (this._containerType === 0) {
                this._containerType = CONTAINER_NODE.UNKNOWN;
            }
        }

        public setLayout() {
            if (this.plainText) {
                this.setLayoutWidth('wrap_content', false);
                this.setLayoutHeight('wrap_content', false);
                return;
            }
            switch (this.css('visibility')) {
                case 'visible':
                    break;
                case 'hidden':
                    this.hide({ hidden: true });
                    break;
                case 'collapse':
                    this.hide({ collapse: true });
                    break;
            }
            if (!this.pageFlow && REGEX_CLIPNONE.test(this.css('clip'))) {
                this.hide({ hidden: true });
            }
            const actualParent = this.actualParent || this.documentParent;
            const renderParent = this.renderParent as T;
            const flexibleWidth = !renderParent.inlineWidth;
            const flexibleHeight = !renderParent.inlineHeight;
            const maxDimension = this.support.maxDimension;
            const matchParent = renderParent.layoutConstraint && !renderParent.flexibleWidth && (!renderParent.inlineWidth || this.renderChildren.length) && !this.onlyChild && (!this.textElement && !this.inputElement && !this.controlElement && this.alignParent('left') && this.alignParent('right') || this.alignSibling('leftRight') || this.alignSibling('rightLeft')) ? '0px' : 'match_parent';
            let { layoutWidth, layoutHeight } = this;
            if (layoutWidth === '') {
                if (this.hasPX('width') && (!this.inlineStatic || this.cssInitial('width') === '')) {
                    const width = this.css('width');
                    let value = -1;
                    if (isPercent(width)) {
                        const expandable = () => width === '100%' && flexibleWidth && (maxDimension || !this.hasPX('maxWidth'));
                        if (this.inputElement) {
                            if (expandable()) {
                                layoutWidth = matchParent;
                            }
                            else {
                                value = this.actualWidth;
                            }
                        }
                        else if (renderParent.layoutConstraint) {
                            if (flexibleWidth) {
                                if (expandable()) {
                                    layoutWidth = matchParent;
                                }
                                else {
                                    View.setConstraintDimension(this, 1);
                                    layoutWidth = this.layoutWidth;
                                }
                            }
                            else {
                                value = this.actualWidth;
                            }
                        }
                        else if (renderParent.layoutGrid) {
                            layoutWidth = '0px';
                            this.android('layout_columnWeight', truncate(parseFloat(width) / 100, this.localSettings.floatPrecision));
                        }
                        else if (this.imageElement) {
                            if (expandable()) {
                                layoutWidth = matchParent;
                            }
                            else {
                                value = this.bounds.width;
                            }
                        }
                        else if (width === '100%') {
                            if (!maxDimension && this.hasPX('maxWidth')) {
                                const maxWidth = this.css('maxWidth');
                                const maxValue = this.parseWidth(maxWidth);
                                const absoluteParent = this.absoluteParent || actualParent;
                                if (maxWidth === '100%') {
                                    if (flexibleWidth && Math.ceil(maxValue) >= absoluteParent.box.width) {
                                        layoutWidth = matchParent;
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
                                        layoutWidth = Math.floor(maxValue) < absoluteParent.box.width ? 'wrap_content' : matchParent;
                                    }
                                }
                            }
                            if (layoutWidth === '' && (this.documentRoot || flexibleWidth)) {
                                layoutWidth = matchParent;
                            }
                        }
                        else {
                            value = this.actualWidth;
                        }
                    }
                    else if (isLength(width)) {
                        value = this.actualWidth;
                    }
                    if (value !== -1) {
                        layoutWidth = formatPX(value);
                    }
                }
                else if (this.length) {
                    switch (this.cssInitial('width')) {
                        case 'max-content':
                        case 'fit-content':
                            this.renderEach((node: T) => {
                                if (!node.hasPX('width') && !node.hasPX('maxWidth')) {
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
                                const width = formatPX(maxWidth);
                                nodes.forEach(node => {
                                    if (!node.hasPX('maxWidth')) {
                                        node.css('maxWidth', width);
                                    }
                                });
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
                    else if (this.imageElement && this.hasHeight) {
                        layoutWidth = 'wrap_content';
                    }
                    else if (
                        flexibleWidth && (
                            this.nodeGroup && (renderParent.layoutFrame && (this.hasAlign(NODE_ALIGNMENT.FLOAT) || this.hasAlign(NODE_ALIGNMENT.RIGHT)) || this.hasAlign(NODE_ALIGNMENT.PERCENT)) ||
                            this.layoutGrid && this.some((node: T) => node.flexibleWidth)
                        ))
                    {
                        layoutWidth = 'match_parent';
                    }
                    else if (!this.imageElement && !this.inputElement && !this.controlElement) {
                        const checkParentWidth = (block: boolean) => {
                            if (!actualParent.pageFlow && this.some(node => node.textElement)) {
                                return;
                            }
                            else if (this.styleText) {
                                const multiline = (this.textBounds?.numberOfLines as number) > 1;
                                if (multiline) {
                                    if (block) {
                                        layoutWidth = 'match_parent';
                                    }
                                    return;
                                }
                                else if (this.cssTry('display', 'inline-block')) {
                                    const width = Math.ceil(actualTextRangeRect(<Element> this.element).width);
                                    layoutWidth = width >= actualParent.box.width ? 'wrap_content' : 'match_parent';
                                    this.cssFinally('display');
                                    return;
                                }
                            }
                            layoutWidth = matchParent;
                        };
                        if (renderParent.layoutGrid) {
                            if (this.blockStatic && renderParent.android('columnCount') === '1') {
                                layoutWidth = matchParent;
                            }
                        }
                        else if (this.blockStatic) {
                            if (!actualParent.layoutElement) {
                                if (this.nodeGroup || renderParent.hasWidth || this.hasAlign(NODE_ALIGNMENT.BLOCK) || this.originalRoot || this.documentRoot) {
                                    layoutWidth = matchParent;
                                }
                                else {
                                    checkParentWidth(true);
                                }
                            }
                            else if (flexibleWidth && actualParent.gridElement && !renderParent.layoutElement) {
                                layoutWidth = matchParent;
                            }
                        }
                        else if (this.floating && this.block && !this.rightAligned && this.alignParent('left') && this.alignParent('right')) {
                            layoutWidth = 'match_parent';
                        }
                        else if (
                            this.inlineStatic && !this.blockDimension && this.naturalElement && this.some(item => item.naturalElement && item.blockStatic) && !actualParent.layoutElement && (
                                renderParent.layoutVertical ||
                                !this.alignSibling('leftRight') && !this.alignSibling('rightLeft')
                            ))
                        {
                            checkParentWidth(false);
                        }
                    }
                }
                this.setLayoutWidth(layoutWidth || 'wrap_content');
            }
            if (this.layoutHeight === '') {
                if (this.hasPX('height') && (!this.inlineStatic || this.cssInitial('height') === '')) {
                    const height = this.css('height');
                    let value = -1;
                    if (isPercent(height)) {
                        if (this.inputElement) {
                            value = this.bounds.height;
                        }
                        else if (this.imageElement) {
                            if (height === '100%' && flexibleHeight) {
                                layoutHeight = 'match_parent';
                            }
                            else {
                                value = this.bounds.height;
                            }
                        }
                        else if (height === '100%') {
                            if (!maxDimension) {
                                const maxHeight = this.css('maxHeight');
                                const maxValue = this.parseHeight(maxHeight);
                                const absoluteParent = this.absoluteParent || actualParent;
                                if (maxHeight === '100%') {
                                    if (flexibleHeight && Math.ceil(maxValue) >= absoluteParent.box.height) {
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
                                        layoutHeight = Math.floor(maxValue) < absoluteParent.box.height ? 'wrap_content' : 'match_parent';
                                    }
                                }
                            }
                            if (layoutHeight === '' && (this.documentRoot || flexibleHeight && this.onlyChild || this.css('position') === 'fixed')) {
                                layoutHeight = 'match_parent';
                            }
                        }
                        if (layoutHeight === '' && this.hasHeight) {
                            value = this.actualHeight;
                        }
                    }
                    else if (isLength(height)) {
                        value = this.actualHeight;
                    }
                    if (value !== -1) {
                        if (this.is(CONTAINER_NODE.LINE) && this.tagName !== 'HR' && this.hasPX('height', true, true)) {
                            value += this.borderTopWidth + this.borderBottomWidth;
                        }
                        if (this.styleText && this.multiline && !actualParent.layoutElement && !this.hasPX('minHeight')) {
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
                        else if (this.naturalChild && !this.pseudoElement) {
                            layoutHeight = formatPX(this.actualHeight);
                        }
                    }
                    else if (this.imageElement && this.hasWidth) {
                        layoutHeight = 'wrap_content';
                    }
                    else if (this.display === 'table-cell' && actualParent.hasHeight) {
                        layoutHeight = 'match_parent';
                    }
                }
                this.setLayoutHeight(layoutHeight || 'wrap_content');
            }
            else if (layoutHeight === '0px' && renderParent.inlineHeight && renderParent.android('minHeight') === '' && !actualParent.layoutElement && actualParent === this.absoluteParent) {
                this.setLayoutHeight('wrap_content');
            }
            if (this.hasPX('minWidth') && (!this.hasFlex('row') || actualParent.flexElement && !this.flexibleWidth)) {
                const minWidth = this.css('minWidth');
                if (minWidth === '100%' && this.inlineWidth) {
                    this.setLayoutWidth(matchParent);
                }
                else {
                    this.android('minWidth', formatPX(this.parseWidth(minWidth) + (this.contentBox ? this.contentBoxWidth : 0)), false);
                }
            }
            if (this.hasPX('minHeight') && this.display !== 'table-cell' && (!this.hasFlex('column') || actualParent.flexElement && !this.flexibleHeight)) {
                const minHeight = this.css('minHeight');
                if (minHeight === '100%' && flexibleHeight && this.inlineHeight) {
                    this.setLayoutHeight('match_parent');
                }
                else {
                    this.android('minHeight', formatPX(this.parseHeight(minHeight) + (this.contentBox ? this.contentBoxHeight : 0)), false);
                }
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
                        else if (flexibleWidth) {
                            this.setLayoutWidth('match_parent');
                        }
                    }
                    else {
                        width = this.parseWidth(maxWidth);
                    }
                }
                else if (!this.pageFlow && this.multiline && this.inlineWidth && !this.preserveWhiteSpace && (this.ascend({ condition: item => item.hasPX('width') }).length || !this.textContent.includes('\n'))) {
                    width = this.actualWidth;
                }
                if (width >= 0) {
                    this.android('maxWidth', formatPX(width), false);
                }
                if (isLength(maxHeight, true)) {
                    let height = -1;
                    if (maxHeight === '100%' && !this.svgElement) {
                        if (flexibleHeight) {
                            this.setLayoutHeight('match_parent');
                        }
                        else {
                            height = this.imageElement ? this.toElementInt('naturalHeight') : this.parseHeight(maxHeight);
                        }
                    }
                    else {
                        height = this.parseHeight(maxHeight);
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
                if (this.inlineVertical && (outerRenderParent.layoutFrame || outerRenderParent.layoutGrid) || this.display === 'table-cell') {
                    const gravity = this.display === 'table-cell' ? 'gravity' : 'layout_gravity';
                    switch (this.cssInitial('verticalAlign', true)) {
                        case 'top':
                            node.mergeGravity(gravity, 'top');
                            break;
                        case 'middle':
                            node.mergeGravity(gravity, 'center_vertical');
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
                        if (!this.innerWrapped) {
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
                node.mergeGravity('layout_gravity', autoMargin.topBottom ? 'center_vertical' : (autoMargin.top ? 'bottom' : 'top'));
            }
        }

        public setBoxSpacing() {
            const boxReset = this._boxReset;
            const boxAdjustment = this._boxAdjustment;
            const renderParent = this.renderParent as T;
            const setBoxModel = (attrs: string[], margin: boolean, unmergeable: boolean) => {
                let top = 0;
                let right = 0;
                let bottom = 0;
                let left = 0;
                for (let i = 0; i < 4; ++i) {
                    const attr = attrs[i];
                    let value: number = boxReset[attr] === 0 ? this[attr] : 0;
                    if (value !== 0) {
                        switch (attr) {
                            case 'marginRight':
                                if (this.inline) {
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
                                    this.naturalChildren.forEach(item => {
                                        if (item.floating) {
                                            maxBottom = Math.max(item.bounds.bottom, maxBottom);
                                        }
                                    });
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
                        let node = <Undef<T>> renderParent.renderChildren.find(item => !item.floating);
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
                                const [reset, adjustment] = actualNode.getBox(BOX_STANDARD.MARGIN_TOP);
                                top += (reset === 0 ? actualNode.marginTop : 0) + adjustment;
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
                    if (top < 0) {
                        if (!this.pageFlow) {
                            if (bottom >= 0 && this.leftTopAxis && (this.hasPX('top') || !this.hasPX('bottom')) && this.translateY(top)) {
                                top = 0;
                            }
                        }
                        else if (this.blockDimension && !this.inputElement && this.translateY(top)) {
                            this.anchorChain('bottom').forEach(item => item.translateY(top));
                            top = 0;
                        }
                    }
                    if (bottom < 0) {
                        if (!this.pageFlow) {
                            if (top >= 0 && this.leftTopAxis && this.hasPX('bottom') && !this.hasPX('top') && this.translateY(-bottom)) {
                                bottom = 0;
                            }
                        }
                        else if (this.blockDimension && !this.inputElement && renderParent.layoutConstraint) {
                            this.anchorChain('bottom').forEach(item => item.translateY(-bottom));
                            bottom = 0;
                        }
                    }
                    if (left < 0) {
                        if (!this.pageFlow) {
                            if (right >= 0 && this.leftTopAxis && (this.hasPX('left') || !this.hasPX('right')) && this.translateX(left)) {
                                left = 0;
                            }
                        }
                        else if (this.float === 'right') {
                            const siblings = this.anchorChain('left');
                            left = Math.min(-left, -this.bounds.width);
                            siblings.forEach(item => item.translateX(-left));
                            left = 0;
                        }
                        else if (this.blockDimension && this.translateX(left)) {
                            this.anchorChain('right').forEach(item => item.translateX(left));
                            left = 0;
                        }
                    }
                    if (right < 0) {
                        if (!this.pageFlow) {
                            if (left >= 0 && this.leftTopAxis && this.hasPX('right') && !this.hasPX('left') && this.translateX(-right)) {
                                right = 0;
                            }
                        }
                        else if (this.rightAligned) {
                            if (this.translateX(-right)) {
                                right = 0;
                            }
                        }
                        else if (this.blockDimension && renderParent.layoutConstraint) {
                            this.anchorChain('right').forEach(item => item.translateX(right));
                            right = 0;
                        }
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
            setBoxModel(BOX_MARGIN, true, renderParent.layoutGrid);
            setBoxModel(BOX_PADDING, false, false);
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
                this._namespaces.forEach(name => {
                    const obj: StringMap = this['__' + name];
                    for (const attr in obj) {
                        node.attr(name, attr, attr === 'id' && name === 'android' ? node.documentId : obj[attr]);
                    }
                });
            }
            if (position) {
                node.anchorClear();
                const documentId = this.documentId;
                if (node.anchor('left', documentId)) {
                    node.setBox(BOX_STANDARD.MARGIN_LEFT, { reset: 1, adjustment: 0 });
                }
                if (node.anchor('top', documentId)) {
                    node.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1, adjustment: 0 });
                }
            }
            node.saveAsInitial(true);
            return node;
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
            if (this.styleElement || this.hasAlign(NODE_ALIGNMENT.WRAPPER)) {
                const dataset = getDataSet(this.dataset, 'android');
                if (dataset) {
                    for (const namespace in dataset) {
                        const name = namespace === 'attr' ? 'android' : (REGEX_DATASETATTR.test(namespace) ? capitalize(namespace.substring(4), false) : '');
                        if (name !== '') {
                            dataset[namespace].split(';').forEach(values => {
                                const [key, value] = values.split('::');
                                if (value) {
                                    this.attr(name, key, value);
                                }
                            });
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
            this.combine().forEach(value => output += indent + value);
            return output;
        }

        public alignParent(position: string) {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as T;
            if (renderParent) {
                if (renderParent.layoutConstraint) {
                    const attr: Undef<string> = LAYOUT_CONSTRAINT[position];
                    if (attr) {
                        return node.app(this.localizeString(attr)) === 'parent';
                    }
                }
                else if (renderParent.layoutRelative) {
                    const attr: Undef<string> = LAYOUT_RELATIVE_PARENT[position];
                    if (attr) {
                        return node.android(this.localizeString(attr)) === 'true';
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
                            const value = node.app(this.localizeString(attr));
                            return value !== 'parent' && value !== renderParent.documentId ? value : '';
                        }
                    }
                    else if (renderParent.layoutRelative) {
                        const attr: Undef<string> = LAYOUT_RELATIVE[position];
                        if (attr) {
                            return node.android(this.localizeString(attr));
                        }
                    }
                }
            }
            return '';
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

        public translateX(value: number, options: TranslateUIOptions = {}) {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as T;
            if (renderParent?.layoutConstraint) {
                let x = convertInt(node.android('translationX'));
                if (options.oppose === false && (x > 0 && value < 0 || x < 0 && value > 0)) {
                    return false;
                }
                else if (options.accumulate !== false) {
                    x += value;
                }
                if (options.contain) {
                    const { left, right } = renderParent.box;
                    const { left: x1, right: x2 } = this.linear;
                    if (x1 + x < left) {
                        x = Math.max(x1 - left, 0);
                    }
                    else if (x2 + x > right) {
                        x = Math.max(right - x2, 0);
                    }
                }
                if (x !== 0) {
                    node.android('translationX', formatPX(x));
                }
                else {
                    node.delete('android', 'translationX');
                }
                return true;
            }
            return false;
        }

        public translateY(value: number, options: TranslateUIOptions = {}) {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as T;
            if (renderParent?.layoutConstraint) {
                let y = convertInt(node.android('translationY'));
                if (options.oppose === false && (y > 0 && value < 0 || y < 0 && value > 0)) {
                    return false;
                }
                else if (options.accumulate !== false) {
                    y += value;
                }
                if (options.contain) {
                    const { top, bottom } = renderParent.box;
                    const { top: y1, bottom: y2 } = this.linear;
                    if (y1 + y < top) {
                        y = Math.max(y1 - top, 0);
                    }
                    else if (y2 + y > bottom) {
                        y = Math.max(bottom - y2, 0);
                    }
                }
                if (y !== 0) {
                    node.android('translationY', formatPX(y));
                }
                else {
                    node.delete('android', 'translationY');
                }
                return true;
            }
            return false;
        }

        public localizeString(value: string) {
            return localizeString(value, this._localization, this.api);
        }

        public removeTry(replacement?: T, beforeReplace?: () => void) {
            if (!beforeReplace && replacement) {
                beforeReplace = () => replacement.anchorClear();
            }
            return super.removeTry(replacement, beforeReplace);
        }

        public hasFlex(direction: "row" | "column") {
            if (super.hasFlex(direction)) {
                const parent = this.actualParent as T;
                if (direction === 'column' && !parent.hasHeight) {
                    const grandParent = parent.actualParent;
                    if (grandParent) {
                        if (grandParent.flexElement && !grandParent.flexdata.column) {
                            if (!grandParent.hasHeight) {
                                let maxHeight = 0;
                                let parentHeight = 0;
                                for (const item of grandParent) {
                                    const height = (item.data(EXT_NAME.FLEXBOX, 'boundsData') || item.bounds).height;
                                    if (height > maxHeight) {
                                        maxHeight = height;
                                    }
                                    if (item === parent) {
                                        parentHeight = height;
                                        if (parentHeight < maxHeight) {
                                            break;
                                        }
                                    }
                                }
                                if (parentHeight >= maxHeight) {
                                    return false;
                                }
                            }
                        }
                        else if (!grandParent.gridElement) {
                            return false;
                        }
                    }
                    else {
                        return false;
                    }
                }
                const { grow, shrink } = this.flexbox;
                return grow > 0 || shrink !== 1;
            }
            return false;
        }

        public hide(options?: HideUIOptions<T>) {
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
                        const anchored = documentId === 'parent';
                        if (overwrite === undefined && documentId !== '') {
                            overwrite = anchored;
                        }
                        const attr: Undef<string> = LAYOUT_CONSTRAINT[position];
                        if (attr) {
                            let horizontal = false;
                            node.app(this.localizeString(attr), documentId, overwrite);
                            switch (position) {
                                case 'left':
                                case 'right':
                                    if (anchored) {
                                        node.constraint.horizontal = true;
                                    }
                                case 'leftRight':
                                case 'rightLeft':
                                    horizontal = true;
                                    break;
                                case 'top':
                                case 'bottom':
                                case 'baseline':
                                    if (anchored) {
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

        public anchorParent(orientation: string, bias?: number, style = '', overwrite?: boolean) {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as T;
            if (renderParent) {
                const horizontal = orientation === 'horizontal';
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
                        if (bias !== undefined) {
                            node.anchorStyle(orientation, bias, style, overwrite);
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

        public anchorStyle(orientation: string, bias: number, style?: string, overwrite = true) {
            const node = this.anchorTarget;
            if (orientation === 'horizontal') {
                node.app('layout_constraintHorizontal_bias', bias.toString(), overwrite);
                if (style) {
                    node.app('layout_constraintHorizontal_chainStyle', style, overwrite);
                }
            }
            else {
                node.app('layout_constraintVertical_bias', bias.toString(), overwrite);
                if (style) {
                    node.app('layout_constraintVertical_chainStyle', style, overwrite);
                }
            }
        }

        public anchorChain(direction: PositionAttr) {
            const result: T[] = [];
            const node = this.anchorTarget;
            const renderParent = node.renderParent as T;
            if (renderParent && (renderParent.layoutConstraint || renderParent.layoutRelative)) {
                let anchorA: string;
                let anchorB: string;
                switch (direction) {
                    case 'top':
                        anchorA = 'topBottom';
                        anchorB = 'bottomTop';
                        break;
                    case 'right':
                        anchorA = 'rightLeft';
                        anchorB = 'leftRight';
                        break;
                    case 'bottom':
                        anchorA = 'bottomTop';
                        anchorB = 'topBottom';
                        break;
                    case 'left':
                        anchorA = 'leftRight';
                        anchorB = 'rightLeft';
                        break;
                }
                const siblings = renderParent.renderChildren;
                let current = node;
                do {
                    const adjacent = current.alignSibling(anchorA);
                    if (adjacent !== '') {
                        const sibling = siblings.find(item => item.documentId === adjacent) as T | undefined;
                        if (sibling?.alignSibling(anchorB) === current.documentId) {
                            result.push(sibling);
                            current = sibling;
                        }
                        else {
                            break;
                        }
                    }
                    else {
                        break;
                    }
                }
                while (true);
            }
            return result;
        }

        public anchorDelete(...position: string[]) {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as T;
            if (renderParent) {
                if (renderParent.layoutConstraint) {
                    node.delete('app', ...replaceMap(position, (value: string) => this.localizeString(LAYOUT_CONSTRAINT[value])));
                }
                else if (renderParent.layoutRelative) {
                    const layout: string[] = [];
                    position.forEach(value => {
                        let attr: Undef<string> = LAYOUT_RELATIVE[value];
                        if (attr) {
                            layout.push(this.localizeString(attr));
                        }
                        attr = LAYOUT_RELATIVE_PARENT[value];
                        if (attr) {
                            layout.push(this.localizeString(attr));
                        }
                    });
                    node.delete('android', ...layout);
                }
            }
        }

        public anchorClear() {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as T;
            if (renderParent) {
                if (renderParent.layoutConstraint) {
                    node.anchorDelete(...Object.keys(LAYOUT_CONSTRAINT));
                    node.delete('app', 'layout_constraintHorizontal_bias', 'layout_constraintHorizontal_chainStyle', 'layout_constraintVertical_bias', 'layout_constraintVertical_chainStyle');
                }
                else if (renderParent.layoutRelative) {
                    node.anchorDelete(...Object.keys(LAYOUT_RELATIVE_PARENT));
                    node.anchorDelete(...Object.keys(LAYOUT_RELATIVE));
                }
            }
        }

        public supported(attr: string, result = {}): boolean {
            if (typeof DEPRECATED[attr] === 'function') {
                const valid = DEPRECATED[attr](result, this.api, this);
                if (!valid || Object.keys(result).length) {
                    return valid;
                }
            }
            let i = this.api;
            while (i <= BUILD_ANDROID.LATEST) {
                const callback = API_ANDROID[i++]?.android[attr];
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
            const all = objs.length === 0;
            const result: string[] = [];
            let requireId = false;
            let id = '';
            this._namespaces.forEach(name => {
                if (all || objs.includes(name)) {
                    const obj: StringMap = this['__' + name];
                    if (obj) {
                        let prefix = name + ':';
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
                                prefix = '';
                            default:
                                for (const attr in obj) {
                                    result.push(prefix + `${attr}="${obj[attr]}"`);
                                }
                                break;
                        }
                    }
                }
            });
            result.sort((a, b) => a > b ? 1 : -1);
            if (requireId) {
                result.unshift('android:id="' + (id || `@+id/${this.controlId}`) + '"');
            }
            return result;
        }

        public mergeGravity(attr: string, alignment: string, overwrite = true) {
            if (attr === 'layout_gravity') {
                const renderParent = this.renderParent;
                if (renderParent) {
                    if (isHorizontalAlign(alignment) && (this.blockWidth || renderParent.inlineWidth && this.onlyChild || !overwrite && this.outerWrapper && this.hasPX('maxWidth'))) {
                        return;
                    }
                    else if (renderParent.layoutRelative) {
                        if (alignment === 'center_horizontal' && !this.alignSibling('leftRight') && !this.alignSibling('rightLeft')) {
                            this.anchorDelete('left', 'right');
                            this.anchor('centerHorizontal', 'true');
                            return;
                        }
                    }
                    else if (renderParent.layoutConstraint) {
                        if (!renderParent.layoutHorizontal && !this.positioned) {
                            switch (alignment) {
                                case 'top':
                                    this.anchorStyle('vertical', 0);
                                    break;
                                case 'right':
                                case 'end':
                                    if (!this.alignSibling('rightLeft')) {
                                        this.anchor('right', 'parent', false);
                                        if (this.alignParent('left') || this.alignSibling('left')) {
                                            this.anchorStyle('horizontal', 1);
                                        }
                                    }
                                    break;
                                case 'bottom':
                                    this.anchorStyle('vertical', 1);
                                    break;
                                case 'left':
                                case 'start':
                                    if (!this.alignSibling('leftRight')) {
                                        this.anchor('left', 'parent', false);
                                        if (this.alignParent('right') || this.alignSibling('right')) {
                                            this.anchorStyle('horizontal', 0);
                                        }
                                    }
                                    break;
                                case 'center_horizontal':
                                    if (!this.alignSibling('leftRight') && !this.alignSibling('rightLeft')) {
                                        this.anchorParent('horizontal', 0.5);
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
                setLineHeight(this, renderParent);
                finalizeGravity(this, 'layout_gravity');
                finalizeGravity(this, 'gravity');
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
            const setCustomization = (obj: Undef<ObjectMap<StringMap>>) => {
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

        public setSingleLine(ellipsize = false) {
            if (this.textElement && this.naturalChild) {
                const parent = this.actualParent as T;
                if (!parent.preserveWhiteSpace && parent.tagName !== 'CODE' && (!this.multiline || parent.css('whiteSpace') === 'nowrap')) {
                    this.android('maxLines', '1');
                }
                if (ellipsize && this.textContent.trim().length > 1) {
                    this.android('ellipsize', 'end');
                }
            }
        }

        public setLayoutWidth(value: string, overwrite = true) {
            this.android('layout_width', value, overwrite);
        }

        public setLayoutHeight(value: string, overwrite = true) {
            this.android('layout_height', value, overwrite);
        }

        protected alignLayout(renderParent: T) {
            if (this.layoutLinear) {
                const children = this.renderChildren;
                if (this.layoutVertical) {
                    if (!renderParent.layoutFrame && !this.documentRoot && children.length && (this.baselineElement || children.every(node => node.textElement))) {
                        this.android('baselineAlignedChildIndex', '0');
                    }
                }
                else {
                    let baseline = !this.baselineActive;
                    if (children.some(node => node.floating) && !children.some(node => node.imageElement && node.baseline)) {
                        this.android('baselineAligned', 'false');
                        baseline = false;
                    }
                    const length = children.length;
                    for (let i = 0; i < length; ++i) {
                        const item = children[i];
                        item.setSingleLine(i === length - 1);
                        if (baseline && item.baselineElement) {
                            this.android('baselineAlignedChildIndex', i.toString());
                            baseline = false;
                        }
                    }
                }
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
                            name = value.replace(REGEX_STRINGVALID, '_').toLowerCase();
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

        get documentId() {
            const controlId = this.controlId;
            return controlId !== '' ? `@id/${controlId}` : '';
        }

        get support() {
            let result = this._cached.support;
            if (result === undefined) {
                result = <SupportAndroid> {
                    positionTranslation: this.layoutConstraint,
                    positionRelative: this.layoutRelative,
                    maxDimension: this.textElement || this.imageOrSvgElement
                };
                if (this.containerType !== 0) {
                    this._cached.support = result;
                }
            }
            return <SupportAndroid> result;
        }

        set renderExclude(value) {
            this._cached.renderExclude = value;
        }
        get renderExclude(): boolean {
            let result = this._cached.renderExclude;
            if (result === undefined) {
                if (this.naturalChild && !this.originalRoot) {
                    const renderParent = this.renderParent;
                    if (renderParent) {
                        if (!this.onlyChild && this.length === 0 && this.styleElement && !this.imageElement && !this.pseudoElement) {
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
                    }
                    else {
                        return false;
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
                    if (this.naturalElement && !this.pseudoElement && this.lineHeight > result) {
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
            const { horizontal, vertical } = this.constraint;
            return horizontal === true && vertical === true;
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

        get labelFor() {
            return this._labelFor;
        }
        set labelFor(value) {
            if (value) {
                value.companion = this;
            }
            this._labelFor = value;
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