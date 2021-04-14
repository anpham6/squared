import CSS_UNIT = squared.lib.constant.CSS_UNIT;
import USER_AGENT = squared.lib.constant.USER_AGENT;
import BOX_STANDARD = squared.base.lib.constant.BOX_STANDARD;
import NODE_ALIGNMENT = squared.base.lib.constant.NODE_ALIGNMENT;
import EXT_NAME = squared.base.lib.internal.EXT_NAME;
import CONTAINER_NODE = android.lib.constant.CONTAINER_NODE;
import LAYOUT_STRING = internal.android.LAYOUT_STRING;

import { BUILD_VERSION, CONTAINER_ELEMENT, CONTAINER_NODE as CONTAINER_NODE_ENUM, CONTAINER_TAGNAME, CONTAINER_TAGNAME_X, LAYOUT_MAP, RESERVED_JAVA } from './lib/constant';
import { API_VERSION, DEPRECATED_ATTRIBUTE } from './lib/customization';

import Resource from './resource';

import { concatString, getDataSet, isHorizontalAlign, isVerticalAlign, localizeString } from './lib/util';

type T = android.base.View;

const { CSS_PROPERTIES } = squared.lib.internal;

const { NODE_PROCEDURE } = squared.base.lib.constant;

const { isUserAgent } = squared.lib.client;
const { asPercent, formatPX, isLength, isPercent, parseTransform } = squared.lib.css;
const { getNamedItem, getRangeClientRect } = squared.lib.dom;
const { clamp, truncate } = squared.lib.math;
const { capitalize, convertFloat, convertInt, convertWord, fromLastIndexOf, hasKeys, lastItemOf, isString, replaceMap, safeFloat, splitPair, startsWith } = squared.lib.util;

const { parseTask, parseWatchInterval } = squared.base.lib.internal;

const { constraint: LAYOUT_CONSTRAINT, relative: LAYOUT_RELATIVE, relativeParent: LAYOUT_RELATIVE_PARENT } = LAYOUT_MAP;

const BOX_MARGIN = CSS_PROPERTIES.margin!.value as string[];
const BOX_PADDING = CSS_PROPERTIES.padding!.value as string[];

const REGEXP_CONTROLID = /[^\w$\-_.]/g;
const REGEXP_FORMATTED = /^(?:([a-z]+):)?(\w+)="((?:@\+?[a-z]+\/)?.+)"$/;
const CACHE_INDENT: StringMap = {};

const OPTIONS_LINEHEIGHT: CssStyleMap = {
    height: 'auto',
    minHeight: 'auto',
    lineHeight: 'normal',
    whiteSpace: 'nowrap'
};

function checkTextAlign(value: string, ignoreStart?: boolean): Undef<LayoutGravityDirectionAttr> {
    switch (value) {
        case 'left':
        case 'start':
            if (!ignoreStart) {
                return value;
            }
            break;
        case 'center':
            return 'center_horizontal';
        case 'justify':
            if (!ignoreStart) {
                return 'start';
            }
            break;
        default:
            return value as LayoutGravityDirectionAttr;
    }
}

function checkMergableGravity(value: string, direction: string[]) {
    const indexA = direction.indexOf(value + '_horizontal');
    const indexB = direction.indexOf(value + '_vertical');
    if (indexA !== -1 && indexB !== -1) {
        direction.splice(Math.min(indexA, indexB), 1);
        direction.splice(Math.max(indexA, indexB) - 1, 1);
        if (!direction.includes(value)) {
            direction.push(value);
        }
        return true;
    }
    else if (direction.includes(value)) {
        if (indexA !== -1) {
            direction.splice(indexA, 1);
            return true;
        }
        if (indexB !== -1) {
            direction.splice(indexB, 1);
            return true;
        }
    }
    return false;
}

function setMultiline(node: T, value: number, overwrite: boolean) {
    const adjustment = node.dataset.androidLineHeightAdjust;
    if (adjustment !== 'false') {
        let offset = getLineSpacingExtra(node, value);
        value *= adjustment && +adjustment || node.localSettings.lineHeightAdjust;
        if (node.api >= BUILD_VERSION.PIE) {
            node.android('lineHeight', truncate(value, node.localSettings.floatPrecision) + 'px', overwrite);
        }
        else if (offset > 0) {
            node.android('lineSpacingExtra', truncate(offset, node.localSettings.floatPrecision) + 'px', overwrite);
        }
        else {
            return;
        }
        offset = Math.floor(offset);
        if (offset > 0 && node.pageFlow) {
            if (node.inlineDimension) {
                node.modifyBox(BOX_STANDARD.PADDING_TOP, offset);
                node.modifyBox(BOX_STANDARD.PADDING_BOTTOM, offset);
            }
            else {
                const renderParent = node.renderParent as T;
                if (renderParent.layoutVertical || renderParent.layoutRelative || renderParent.hasAlign(NODE_ALIGNMENT.COLUMN)) {
                    const children = renderParent.renderChildren;
                    for (let i = 0, length = children.length; i < length; ++i) {
                        if (children[i] === node) {
                            const options: BoxOptions = { reset: 1, adjustment: offset, max: true };
                            if (i > 0 && offset > Math.max(node.marginTop, 0) + node.borderTopWidth) {
                                node.setBox(BOX_STANDARD.MARGIN_TOP, options);
                            }
                            if ((node.blockStatic || i === length - 1) && offset > Math.max(node.marginBottom, 0) + node.borderBottomWidth) {
                                node.setBox(BOX_STANDARD.MARGIN_BOTTOM, options);
                            }
                            break;
                        }
                    }
                }
            }
        }
    }
}

function setLineHeight(node: T, value: number, inlineStyle: boolean, top: boolean, bottom: boolean, overwrite?: boolean, parent?: T) {
    if (value === 0 || node.imageContainer || node.rendering && !overwrite || node.cssInitial('lineHeight') === 'normal' || node.hasAlign(NODE_ALIGNMENT.WRAPPER)) {
        return;
    }
    if (node.multiline) {
        setMultiline(node, value, false);
    }
    else {
        const height = node.height;
        if (value === height) {
            node.mergeGravity('gravity', 'center_vertical', false);
        }
        else {
            const setBoxPadding = (offset: number, padding?: boolean) => {
                if (offset > 0) {
                    if (!node.inline && (inlineStyle || height > value) && (node.styleText || padding) && !(node.inputElement && !isLength(node.cssInitial('lineHeight'), true)) || parent) {
                        if (top) {
                            let adjustment = offset - (parent ? parent.paddingTop : 0);
                            if (node.pageFlow) {
                                if (!padding) {
                                    adjustment -= node.paddingTop;
                                }
                                if (node.alignParent('top')) {
                                    const marginTop = node.actualParent!.marginTop;
                                    if (marginTop < 0) {
                                        adjustment += marginTop;
                                    }
                                }
                            }
                            adjustment = Math.round(adjustment);
                            if (adjustment > 0) {
                                (parent || node).setBox(BOX_STANDARD.PADDING_TOP, { adjustment });
                            }
                        }
                        if (bottom) {
                            const adjustment = Math.round(offset - (!padding && node.pageFlow ? node.paddingBottom : 0) - (parent ? parent.paddingBottom : 0));
                            if (adjustment > 0) {
                                (parent || node).setBox(BOX_STANDARD.PADDING_BOTTOM, { adjustment });
                            }
                        }
                    }
                    else if (node.pageFlow) {
                        if (top && (inlineStyle || !node.baselineAltered)) {
                            const adjustment = Math.floor(offset - node.paddingTop - node.borderTopWidth - Math.max(0, node.marginTop + node.getBox(BOX_STANDARD.MARGIN_TOP)[1]));
                            if (adjustment > 0) {
                                node.setBox(BOX_STANDARD.MARGIN_TOP, { adjustment });
                            }
                        }
                        if (bottom && !(node.plainText && !node.actualParent!.pageFlow)) {
                            const adjustment = Math.floor(offset - node.paddingBottom - node.borderBottomWidth - Math.max(0, node.marginBottom + node.getBox(BOX_STANDARD.MARGIN_BOTTOM)[1]));
                            if (adjustment > 0) {
                                node.setBox(BOX_STANDARD.MARGIN_BOTTOM, { adjustment });
                            }
                        }
                    }
                }
            };
            if (node.textElement) {
                setBoxPadding(getLineSpacingExtra(node, value));
            }
            else if (node.inputElement) {
                const textHeight = node.actualTextHeight({ tagName: 'span' });
                if (!isNaN(textHeight)) {
                    let rows: number;
                    switch (node.tagName) {
                        case 'SELECT':
                            rows = node.toElementInt('size', 1);
                            break;
                        case 'TEXTAREA':
                            rows = node.toElementInt('rows', 1);
                            break;
                        default:
                            rows = 1;
                            break;
                    }
                    setBoxPadding((value - textHeight * Math.max(rows, 1)) / 2, true);
                }
            }
            else if (height && !node.controlElement) {
                const offset = (value / 2) - node.paddingTop;
                if (offset > 0) {
                    node.modifyBox(BOX_STANDARD.PADDING_TOP, offset);
                }
            }
            else {
                setBoxPadding((value - node.bounds.height) / 2);
            }
        }
    }
}

function getLineHeight(node: T, value: number, checkOnly?: boolean) {
    if (!node.rendering && (!node.multiline || node.lineHeight === 0 && !node.android('lineHeight'))) {
        const result = node.has('lineHeight') ? Math.max(node.lineHeight, value) : value;
        if (!checkOnly) {
            node.setCacheValue('lineHeight', 0);
        }
        return result;
    }
    return 0;
}

function getLineSpacingExtra(node: T, value: number) {
    let height = node.data<number>(Resource.KEY_NAME, 'textRange');
    if (!height && node.plainText) {
        if (node.naturalChild) {
            height = node.bounds.height / (node.bounds.numberOfLines || 1);
        }
        else {
            height = node.actualTextHeight();
            node.data(Resource.KEY_NAME, 'textRange', height);
        }
    }
    if (!height && node.styleText) {
        node.cssTryAll(!node.pseudoElement ? OPTIONS_LINEHEIGHT : { ...OPTIONS_LINEHEIGHT, display: 'inline-block' }, function(this: T) {
            const bounds = getRangeClientRect(this.element!);
            if (bounds) {
                height = bounds.height;
            }
        });
    }
    return height ? (value - height) / 2 : 0;
}

function constraintMinMax(node: T) {
    if (!node.inputElement && !node.imageContainer) {
        const [minWidth, minHeight, maxWidth, maxHeight] = node.cssValues('minWidth', 'minHeight', 'maxWidth', 'maxHeight');
        if (minWidth && isLength(minWidth, true) && minWidth !== '100%' && ascendFlexibleWidth(node)) {
            const value = node.parseUnit(minWidth);
            if (value > 0 && (!node.hasUnit('width', { percent: false }) || value > node.cssUnit('width'))) {
                node.setLayoutWidth('0px', false);
                if (node.flexibleWidth) {
                    node.app('layout_constraintWidth_min', formatPX(value + node.contentBoxWidth));
                    node.css('minWidth', 'auto');
                }
            }
        }
        if (maxWidth && isLength(maxWidth, true) && maxWidth !== '100%' && ascendFlexibleWidth(node)) {
            const value = node.parseUnit(maxWidth);
            if (node.percentWidth || value > node.width) {
                node.setLayoutWidth('0px', false);
                node.app('layout_constraintWidth_max', formatPX(value + (node.contentBox ? node.contentBoxWidth : 0)));
                node.css('maxWidth', 'auto');
            }
        }
        if (minHeight && isLength(minHeight, true) && minHeight !== '100%' && ascendFlexibleHeight(node)) {
            const value = node.parseHeight(minHeight);
            if (value > 0 && (!node.hasUnit('height', { percent: false }) || value > node.cssUnit('height', { dimension: 'height' }))) {
                node.setLayoutHeight('0px', false);
                if (node.flexibleHeight) {
                    node.app('layout_constraintHeight_min', formatPX(value + node.contentBoxHeight));
                    node.css('minHeight', 'auto');
                }
            }
        }
        if (maxHeight && isLength(maxHeight, true) && maxHeight !== '100%' && ascendFlexibleHeight(node)) {
            const value = node.parseHeight(maxHeight);
            if (node.percentHeight || !node.support.maxDimension && value > node.height) {
                node.setLayoutHeight('0px', false);
                node.app('layout_constraintHeight_max', formatPX(value + (node.contentBox ? node.contentBoxHeight : 0)));
                node.css('maxHeight', 'auto');
            }
        }
    }
}

function setConstraintPercent(node: T, value: number, horizontal: boolean, percentAvailable: number) {
    if (value < 1 && !isNaN(percentAvailable) && node.pageFlow) {
        const parent = node.actualParent || node.documentParent;
        let boxPercent: number,
            marginPercent: number;
        if (horizontal) {
            const width = parent.box.width;
            boxPercent = !parent.gridElement ? node.contentBoxWidth / width : 0;
            marginPercent = (Math.max(!node.getBox(BOX_STANDARD.MARGIN_LEFT)[0] ? node.marginLeft : 0, 0) + (!node.getBox(BOX_STANDARD.MARGIN_RIGHT)[0] ? node.marginRight : 0)) / width;
        }
        else {
            const height = parent.box.height;
            boxPercent = !parent.gridElement ? node.contentBoxHeight / height : 0;
            marginPercent = (Math.max(!node.getBox(BOX_STANDARD.MARGIN_TOP)[0] ? node.marginTop : 0, 0) + (!node.getBox(BOX_STANDARD.MARGIN_BOTTOM)[0] ? node.marginBottom : 0)) / height;
        }
        if (percentAvailable === 1 && value + marginPercent >= 1) {
            value = 1 - marginPercent;
        }
        else {
            if (boxPercent) {
                if (percentAvailable < boxPercent) {
                    boxPercent = Math.max(percentAvailable, 0);
                    percentAvailable = 0;
                }
                else {
                    percentAvailable -= boxPercent;
                }
            }
            if (percentAvailable === 0) {
                boxPercent -= marginPercent;
            }
            else {
                percentAvailable = Math.max(percentAvailable - marginPercent, 0);
            }
            value = Math.min(value + boxPercent, 1);
        }
    }
    let outerWrapper = node.outerMostWrapper as T;
    if (outerWrapper !== node && outerWrapper.css(horizontal ? 'width' : 'height') !== node.css(horizontal ? 'width' : 'height')) {
        outerWrapper = node;
    }
    if (value === 1 && !node.hasUnit(horizontal ? 'maxWidth' : 'maxHeight')) {
        setLayoutDimension(outerWrapper, horizontal ? outerWrapper.getMatchConstraint() : 'match_parent', horizontal, false);
        if (node !== outerWrapper) {
            setLayoutDimension(node, horizontal ? node.getMatchConstraint() : 'match_parent', horizontal, false);
        }
    }
    else {
        let unit: Undef<string>;
        if (value === 1 && node.onlyChild && !node.layoutGrid) {
            unit = 'match_parent';
        }
        else {
            outerWrapper.app(horizontal ? 'layout_constraintWidth_percent' : 'layout_constraintHeight_percent', truncate(value, node.localSettings.floatPrecision));
        }
        setLayoutDimension(outerWrapper, unit || '0px', horizontal, false);
        if (node !== outerWrapper) {
            setLayoutDimension(node, '0px', horizontal, false);
        }
    }
    return percentAvailable;
}

function withinFixedBoxDimension(node: T, dimension: DimensionAttr) {
    if (node.pageFlow) {
        const parent = node.actualParent!;
        return parent.hasUnit(dimension, { percent: false }) && (!parent.flexElement || !parent.flexdata[dimension === 'width' ? 'row' : 'column']);
    }
    return false;
}

function constraintPercentWidth(node: T, percentAvailable = 1) {
    const value = node.percentWidth;
    if (value) {
        if (withinFixedBoxDimension(node, 'width')) {
            if (value < 1) {
                node.setLayoutWidth(formatPX(node.actualWidth));
            }
            else {
                node.setLayoutWidth(node.getMatchConstraint(), false);
            }
        }
        else if (!node.inputElement || node.buttonElement) {
            return setConstraintPercent(node, value, true, percentAvailable);
        }
    }
    return percentAvailable;
}

function constraintPercentHeight(node: T, percentAvailable = 1) {
    const value = node.percentHeight;
    if (value) {
        if (withinFixedBoxDimension(node, 'height')) {
            if (value < 1) {
                node.setLayoutHeight(formatPX(node.actualHeight));
            }
            else {
                node.setLayoutHeight('match_parent', false);
            }
        }
        else if (!node.inputElement || node.buttonElement) {
            return setConstraintPercent(node, value, false, percentAvailable);
        }
    }
    return percentAvailable;
}

function setLayoutDimension(node: T, value: string, horizontal: boolean, overwrite: boolean) {
    if (horizontal) {
        node.setLayoutWidth(value, overwrite);
    }
    else {
        node.setLayoutHeight(value, overwrite);
    }
}

function transferLayoutAlignment(node: T, target: T) {
    target.anchorClear();
    for (const [name, item] of node.namespaces()) {
        for (const attr in item) {
            switch (attr) {
                case 'layout_width':
                case 'layout_height':
                    break;
                default:
                    if (startsWith(attr, 'layout_') && attr.indexOf('margin') === -1) {
                        target.attr(name, attr, item[attr], true);
                    }
                    break;
            }
        }
    }
}

function replaceLayoutPosition(node: T, parentId: string) {
    const left = node.anchorChain('left').shift();
    const right = node.anchorChain('right').shift();
    const top = node.anchorChain('top').shift();
    const bottom = node.anchorChain('bottom').shift();
    const transferHorizontalStyle = (sibling: T) => {
        sibling.app('layout_constraintHorizontal_bias', node.app('layout_constraintHorizontal_bias'));
        sibling.app('layout_constraintHorizontal_chainStyle', node.app('layout_constraintHorizontal_chainStyle'));
    };
    const transferVerticalStyle = (sibling: T) => {
        sibling.app('layout_constraintVertical_bias', node.app('layout_constraintVertical_bias'));
        sibling.app('layout_constraintVertical_chainStyle', node.app('layout_constraintVertical_chainStyle'));
    };
    if (left && right) {
        left.anchor('rightLeft', right.documentId, true);
        right.anchor('leftRight', left.documentId, true);
    }
    else if (left) {
        left.anchorDelete('rightLeft');
        if (node.alignParent('right')) {
            left.anchor('right', parentId);
            transferHorizontalStyle(left);
        }
    }
    else if (right) {
        right.anchorDelete('leftRight');
        if (node.alignParent('left')) {
            right.anchor('left', parentId);
            transferHorizontalStyle(right);
        }
    }
    if (top && bottom) {
        top.anchor('bottomTop', bottom.documentId, true);
        bottom.anchor('topBottom', top.documentId, true);
    }
    else if (top) {
        top.anchorDelete('bottomTop');
        if (node.alignParent('bottom')) {
            top.anchor('bottom', parentId);
            transferVerticalStyle(top);
        }
    }
    else if (bottom) {
        bottom.anchorDelete('topBottom');
        if (node.alignParent('top')) {
            bottom.anchor('top', parentId);
            transferVerticalStyle(bottom);
        }
    }
}

function getGravityValues(node: T, attr: string, value?: string) {
    const gravity = node.android(attr);
    if (gravity) {
        const result = gravity.split('|');
        if (value) {
            if (result.includes(value)) {
                return;
            }
            result.push(value);
        }
        return result;
    }
    else if (value) {
        node.android(attr, value);
    }
}

function calculateBias(start: number, end: number, accuracy = 3) {
    if (start === 0) {
        return 0;
    }
    else if (end === 0) {
        return 1;
    }
    return +truncate(Math.max(start / (start + end), 0), accuracy);
}

const hasFlexibleContainer = (parent: Null<T>) => !!parent && (parent.layoutConstraint || parent.layoutGrid);
const hasFlexibleHeight = (node: T) => node.hasHeight || node.layoutGrid || node.gridElement || node.layoutConstraint && (node.blockHeight || node.flexibleHeight);

export function ascendFlexibleWidth(node: T, container?: boolean) {
    let current = container ? node : node.renderParent as Null<T>,
        i = 0;
    while (current && !current.inlineWidth && current.pageFlow) {
        if (current.hasWidth || safeFloat(current.layoutWidth) || (current.blockStatic || current.blockWidth) && current.innerMostWrapped.rootElement || current.of(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.BLOCK)) {
            return true;
        }
        const flexRow = current.flexElement && current.flexdata.row;
        if (flexRow && current.flexdata.wrap) {
            return true;
        }
        if (current.inlineVertical && current.naturalElement || current.flexibleWidth && i++ === 1 || flexRow && current.flexbox.grow === 0 && !current.onlyChild && !current.flexibleWidth) {
            return false;
        }
        current = current.renderParent as Null<T>;
    }
    return false;
}

export function ascendFlexibleHeight(node: T, container?: boolean) {
    let current = container ? node : node.actualParent as Null<T>;
    if (current && hasFlexibleHeight(current) || container && node.flexElement && node.flexdata.column && (current = node.actualParent as Null<T>) && hasFlexibleHeight(current)) {
        return true;
    }
    return false;
}

export default (Base: Constructor<squared.base.NodeUI>) => {
    return class View extends Base implements android.base.View {
        public static availablePercent(nodes: T[], dimension: DimensionAttr, boxSize: number) {
            const horizontal = dimension === 'width';
            let percent = 1;
            for (let i = 0, n: number, length = nodes.length; i < length; ++i) {
                const sibling = nodes[i].innerMostWrapped;
                if (sibling.pageFlow) {
                    if (sibling.hasUnit(dimension, { initial: true })) {
                        const value = sibling.cssInitial(dimension);
                        if (!isNaN(n = asPercent(value))) {
                            percent -= n;
                            continue;
                        }
                        else if (isLength(value)) {
                            percent -= horizontal
                                ? Math.max(sibling.actualWidth + sibling.marginLeft + sibling.marginRight, 0) / boxSize
                                : Math.max(sibling.actualHeight + sibling.marginTop + sibling.marginBottom, 0) / boxSize;
                            continue;
                        }
                    }
                    percent -= sibling.linear[dimension] / boxSize;
                }
            }
            return Math.max(0, percent);
        }

        public static getControlName(containerType: number, api = BUILD_VERSION.LATEST) {
            const name = CONTAINER_NODE_ENUM[containerType];
            return api >= BUILD_VERSION.Q && CONTAINER_TAGNAME_X[name] as string || CONTAINER_TAGNAME[name] as string || '';
        }

        public api = BUILD_VERSION.LATEST;
        public renderChildren!: T[];
        public renderParent!: Null<T>;
        public companion?: T;
        public horizontalRows!: T[][];
        public alignedWithX?: T;
        public alignedWithY?: T;

        protected _namespaces: ObjectMap<StringMap> = { android: {} };
        protected _containerType = 0;
        protected _cache!: CacheValueUI;
        protected _localSettings!: LocalSettingsUI;
        protected _styleMap!: CssStyleMap;
        protected _boxReset?: number[];
        protected _boxAdjustment?: number[];
        protected _innerWrapped?: T;

        private _controlId = '';
        private _positioned = false;
        private _labelFor?: T;
        private _constraint?: Constraint;
        private _anchored?: boolean;

        public setControlType(controlName: string, containerType?: number) {
            this.controlName = controlName;
            if (containerType) {
                this._containerType = containerType;
            }
        }

        public setExclusions() {
            super.setExclusions();
            if (!this.hasProcedure(NODE_PROCEDURE.LOCALIZATION)) {
                this.localSettings.supportRTL = false;
            }
        }

        public setLayout() {
            const renderParent = this.renderParent;
            if (this.plainText || !renderParent) {
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
            const actualParent = this.actualParent as T;
            const containsWidth = !renderParent.inlineWidth;
            const containsHeight = !renderParent.inlineHeight;
            const box = (this.absoluteParent || actualParent).box;
            let { layoutWidth, layoutHeight } = this;
            if (!layoutWidth) {
                if (this.hasUnit('width') && (!this.inlineStatic || !this.cssInitial('width'))) {
                    const width = this.cssValue('width');
                    let value = -1;
                    if (isPercent(width)) {
                        const expandable = (override?: boolean) => width === '100%' && (containsWidth || override) && (this.support.maxDimension || !this.hasUnit('maxWidth'));
                        const setActualWidth = (boundsWidth?: number) => {
                            if (width === '100%' && (!this.onlyChild || containsWidth) && this.isEmpty() && !this.hasUnit('maxWidth')) {
                                layoutWidth = 'match_parent';
                            }
                            else {
                                value = boundsWidth ?? this.actualWidth;
                            }
                        };
                        if (this.inputElement) {
                            if (expandable() && this.ascend({ condition: (item: T) => item.inlineWidth, attr: 'renderParent' }).length === 0) {
                                layoutWidth = this.getMatchConstraint(renderParent);
                            }
                            else {
                                setActualWidth();
                            }
                        }
                        else if (renderParent.layoutConstraint && !actualParent.layoutElement) {
                            if (containsWidth || !actualParent.inlineWidth) {
                                if (expandable(true)) {
                                    layoutWidth = this.getMatchConstraint(renderParent, true);
                                }
                                else {
                                    this.setConstraintDimension(1);
                                    layoutWidth = this.layoutWidth;
                                }
                            }
                            else {
                                setActualWidth();
                            }
                        }
                        else if (renderParent.layoutGrid) {
                            layoutWidth = '0px';
                            this.android('layout_columnWeight', truncate(asPercent(width) / 100, this.localSettings.floatPrecision));
                        }
                        else if (this.imageElement) {
                            if (expandable()) {
                                layoutWidth = this.getMatchConstraint(renderParent);
                            }
                            else {
                                setActualWidth(this.bounds.width);
                            }
                        }
                        else if (width === '100%') {
                            if (!this.support.maxDimension && this.hasUnit('maxWidth')) {
                                const maxWidth = this.cssValue('maxWidth');
                                const maxValue = this.parseUnit(maxWidth);
                                if (maxWidth === '100%') {
                                    if (containsWidth && Math.ceil(maxValue) >= box.width) {
                                        layoutWidth = this.getMatchConstraint(renderParent);
                                    }
                                    else {
                                        value = Math.min(this.actualWidth, maxValue);
                                    }
                                }
                                else if (maxValue) {
                                    if (this.blockDimension) {
                                        value = Math.min(this.actualWidth, maxValue);
                                    }
                                    else {
                                        layoutWidth = Math.floor(maxValue) < box.width ? 'wrap_content' : this.getMatchConstraint(renderParent);
                                    }
                                }
                            }
                            if (!layoutWidth && (this.documentRoot || containsWidth)) {
                                layoutWidth = this.getMatchConstraint(renderParent);
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
                else if (!this.isEmpty()) {
                    switch (this.cssInitial('width')) {
                        case 'max-content':
                        case 'fit-content':
                            this.renderEach((node: T) => {
                                if (!node.hasUnit('width') && !node.hasUnit('maxWidth')) {
                                    node.setLayoutWidth('wrap_content');
                                }
                            });
                            layoutWidth = 'wrap_content';
                            break;
                        case 'min-content': {
                            const nodes: T[] = [];
                            let maxWidth = 0;
                            this.renderEach((node: T) => {
                                if (!node.textElement || node.hasUnit('width')) {
                                    maxWidth = Math.max(node.actualWidth, maxWidth);
                                }
                                else {
                                    maxWidth = Math.max(node.width, maxWidth);
                                    if (node.support.maxDimension) {
                                        nodes.push(node);
                                    }
                                }
                            });
                            const length = nodes.length;
                            if (length && maxWidth) {
                                const width = formatPX(maxWidth);
                                for (let i = 0; i < length; ++i) {
                                    const node = nodes[i];
                                    if (!node.hasUnit('maxWidth')) {
                                        node.css('maxWidth', width);
                                    }
                                }
                            }
                            layoutWidth = 'wrap_content';
                            break;
                        }
                    }
                }
                if (!layoutWidth) {
                    if (this.textElement && this.textEmpty && this.inlineFlow && !this.visibleStyle.backgroundImage) {
                        layoutWidth = formatPX(this.actualWidth);
                    }
                    else if (
                        containsWidth && (
                            this.nodeGroup && (this.hasAlign(NODE_ALIGNMENT.FLOAT) && (this.hasAlign(NODE_ALIGNMENT.BLOCK) || this.hasAlign(NODE_ALIGNMENT.RIGHT)) || this.hasAlign(NODE_ALIGNMENT.PERCENT)) ||
                            actualParent.flexElement && this.find(item => item.multiline, { cascade: item => !item.hasUnit('width', { percent: false }) }) ||
                            this.layoutGrid && this.find((node: T) => node.flexibleWidth)
                        ))
                    {
                        layoutWidth = this.getMatchConstraint(renderParent);
                    }
                    else if (!this.imageElement && !this.inputElement && !this.controlElement) {
                        const checkParentWidth = (block: boolean) => {
                            if (!actualParent.pageFlow && this.find(node => node.textElement)) {
                                return;
                            }
                            else if (this.styleText) {
                                if (this.textBounds?.numberOfLines as number > 1) {
                                    if (block) {
                                        layoutWidth = 'match_parent';
                                    }
                                    return;
                                }
                                else if (this.cssTry('display', 'inline-block')) {
                                    const bounds = getRangeClientRect(this.element!);
                                    layoutWidth = (bounds ? bounds.width : 0) >= actualParent.box.width ? 'wrap_content' : 'match_parent';
                                    this.cssFinally('display');
                                    return;
                                }
                            }
                            layoutWidth = this.getMatchConstraint(renderParent);
                        };
                        if (renderParent.layoutGrid) {
                            if (this.blockStatic && renderParent.android('columnCount') === '1') {
                                layoutWidth = this.getMatchConstraint(renderParent);
                            }
                        }
                        else if (this.blockStatic) {
                            if (this.documentRoot) {
                                layoutWidth = 'match_parent';
                            }
                            else if (!actualParent.layoutElement) {
                                if (this.nodeGroup || renderParent.hasWidth || this.hasAlign(NODE_ALIGNMENT.BLOCK) || this.rootElement) {
                                    layoutWidth = this.getMatchConstraint(renderParent);
                                }
                                else {
                                    checkParentWidth(true);
                                }
                            }
                            else if (containsWidth && (actualParent.gridElement && !renderParent.layoutElement || actualParent.flexElement && (this.layoutVertical && this.find(item => item.textElement && item.multiline)) || this.layoutFrame && this.find(item => item.autoMargin.horizontal))) {
                                layoutWidth = this.getMatchConstraint(renderParent);
                            }
                        }
                        else if (this.floating && this.block && !this.rightAligned && this.alignParent('left') && this.alignParent('right')) {
                            layoutWidth = 'match_parent';
                        }
                        else if (this.naturalElement && this.inlineStatic && !this.blockDimension && this.find(item => item.naturalElement && item.blockStatic) && !actualParent.layoutElement && (renderParent.layoutVertical || !this.alignSibling('leftRight') && !this.alignSibling('rightLeft'))) {
                            checkParentWidth(false);
                        }
                    }
                }
                this.setLayoutWidth(layoutWidth || 'wrap_content');
            }
            if (!layoutHeight) {
                if (this.hasUnit('height') && (!this.inlineStatic || !this.cssInitial('height'))) {
                    const height = this.cssValue('height');
                    let value = -1;
                    if (isPercent(height)) {
                        if (this.inputElement) {
                            value = this.bounds.height;
                        }
                        else if (this.imageElement) {
                            if (height === '100%' && containsHeight) {
                                layoutHeight = 'match_parent';
                            }
                            else {
                                value = this.bounds.height;
                            }
                        }
                        else if (height === '100%') {
                            if (!this.support.maxDimension) {
                                const maxHeight = this.cssValue('maxHeight');
                                const maxValue = this.parseHeight(maxHeight);
                                if (maxHeight === '100%') {
                                    if (containsHeight || Math.ceil(maxValue) >= box.height) {
                                        layoutHeight = 'match_parent';
                                    }
                                    else {
                                        value = Math.min(this.actualHeight, maxValue);
                                    }
                                }
                                else if (maxValue) {
                                    if (this.blockDimension) {
                                        value = Math.min(this.actualHeight, maxValue);
                                    }
                                    else {
                                        layoutHeight = Math.floor(maxValue) < box.height ? 'wrap_content' : 'match_parent';
                                    }
                                }
                                else if (containsHeight) {
                                    layoutHeight = 'match_parent';
                                }
                            }
                            if (!layoutHeight) {
                                if (!this.pageFlow) {
                                    if (this.cssValue('position') === 'fixed') {
                                        layoutHeight = 'match_parent';
                                    }
                                    else if (renderParent.layoutConstraint && (this.hasUnit('top') || this.hasUnit('bottom'))) {
                                        layoutHeight = '0px';
                                    }
                                }
                                else if (this.documentRoot || containsHeight && this.onlyChild) {
                                    layoutHeight = 'match_parent';
                                }
                            }
                        }
                        if (!layoutHeight && this.hasHeight) {
                            value = this.actualHeight;
                        }
                    }
                    else if (isLength(height)) {
                        value = this.actualHeight;
                    }
                    if (value !== -1) {
                        if (this.is(CONTAINER_NODE.LINE) && this.tagName !== 'HR' && this.hasUnit('height', { initial: true })) {
                            value += this.borderTopWidth + this.borderBottomWidth;
                        }
                        if ((this.controlElement && !this.is(CONTAINER_NODE.RANGE) || this.styleText && this.multiline && !this.overflowY && !actualParent.layoutElement) && !this.hasUnit('minHeight')) {
                            this.android('minHeight', formatPX(value));
                            layoutHeight = 'wrap_content';
                        }
                        else {
                            layoutHeight = formatPX(value);
                        }
                    }
                }
                if (!layoutHeight) {
                    if (this.textElement && this.textEmpty && !this.visibleStyle.backgroundImage) {
                        if (renderParent.layoutConstraint && !this.floating && this.alignParent('top') && this.actualHeight >= box.height) {
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
            else if (layoutHeight === '0px' && renderParent.inlineHeight && !(this.alignParent('top') && this.alignParent('bottom')) && !renderParent.android('minHeight') && !actualParent.layoutElement && actualParent === this.absoluteParent) {
                this.setLayoutHeight('wrap_content');
            }
            if (this.hasUnit('minWidth') && (!actualParent.flexElement || !this.flexibleWidth || !this.hasFlex('row'))) {
                const minWidth = this.cssValue('minWidth');
                if (minWidth === '100%' && this.inlineWidth) {
                    this.setLayoutWidth(this.getMatchConstraint(renderParent));
                }
                else {
                    const width = this.parseUnit(minWidth) + (this.contentBox ? this.contentBoxWidth : 0);
                    if (width) {
                        this.android('minWidth', formatPX(width), false);
                    }
                }
            }
            if (this.hasUnit('minHeight') && this.display !== 'table-cell' && (!actualParent.flexElement || !this.flexibleHeight || !this.hasFlex('column'))) {
                const minHeight = this.cssValue('minHeight');
                if (minHeight === '100%' && containsHeight && this.inlineHeight) {
                    this.setLayoutHeight('match_parent');
                }
                else {
                    const height = this.parseHeight(minHeight) + (this.contentBox ? this.contentBoxHeight : 0);
                    if (height) {
                        this.android('minHeight', formatPX(height), false);
                    }
                }
            }
            if (this.support.maxDimension) {
                const maxWidth = this.cssValue('maxWidth');
                let maxHeight = this.cssValue('maxHeight'),
                    width = -1;
                if (isLength(maxWidth, true)) {
                    if (maxWidth === '100%') {
                        if (!this.hasUnit('width', { initial: true })) {
                            if (this.svgElement) {
                                width = this.bounds.width;
                            }
                            else if (this.imageElement) {
                                width = this.toElementInt('naturalWidth');
                                if (width > this.documentParent.actualWidth) {
                                    this.setLayoutWidth(this.getMatchConstraint(renderParent));
                                    this.setLayoutHeight('wrap_content');
                                    width = -1;
                                    maxHeight = '';
                                }
                            }
                            else if (containsWidth) {
                                this.setLayoutWidth(this.getMatchConstraint(renderParent));
                            }
                        }
                    }
                    else {
                        width = this.parseUnit(maxWidth);
                    }
                }
                else if (!this.pageFlow && this.multiline && this.inlineWidth && !this.preserveWhiteSpace && (this.ascend({ condition: item => item.hasUnit('width') }).length || this.textContent.indexOf('\n') === -1)) {
                    const maxLines = this.textBounds?.numberOfLines;
                    if (maxLines && maxLines > 1) {
                        this.android('maxLines', maxLines.toString());
                    }
                    this.android('ellipsize', 'end');
                    this.android('breakStrategy', 'simple');
                    width = Math.ceil(this.actualWidth);
                }
                if (width >= 0) {
                    this.android('maxWidth', formatPX(width), false);
                }
                if (isLength(maxHeight, true)) {
                    let height = -1;
                    if (maxHeight === '100%' && !this.svgElement) {
                        if (!this.hasUnit('height', { initial: true })) {
                            if (containsHeight) {
                                this.setLayoutHeight('match_parent');
                            }
                            else {
                                height = this.imageElement ? this.toElementInt('naturalHeight') : this.parseHeight(maxHeight);
                            }
                        }
                    }
                    else {
                        height = this.parseHeight(maxHeight);
                    }
                    if (height >= 0) {
                        this.android('maxHeight', formatPX(height));
                        if (this.flexibleHeight) {
                            this.setLayoutHeight('wrap_content');
                        }
                    }
                }
            }
        }

        public setAlignment() {
            const node = this.outerMostWrapper as T;
            const renderParent = this.renderParent as T;
            const outerRenderParent = node.renderParent as T || renderParent;
            const autoMargin = this.autoMargin;
            const setAutoMargin = (target: T) => {
                if (autoMargin.horizontal && (!target.blockWidth || target.hasWidth || target.hasUnit('maxWidth') || target.innerMostWrapped.has('width', { type: CSS_UNIT.PERCENT, not: '100%' }))) {
                    target.mergeGravity((target.blockWidth || !target.pageFlow) && !target.outerWrapper ? 'gravity' : 'layout_gravity', autoMargin.leftRight ? 'center_horizontal' : autoMargin.left ? 'right' : 'left');
                    return true;
                }
                return false;
            };
            let textAlign = checkTextAlign(this.cssValue('textAlign') || this.nodeGroup && !this.hasAlign(NODE_ALIGNMENT.FLOAT) && (this.actualParent as Null<T>)?.cssValue('textAlign') || ''),
                marginAlign: Undef<boolean>;
            if (this.pageFlow) {
                let floatAlign: Undef<LayoutGravityDirectionAttr>;
                if (this.inlineVertical && (outerRenderParent.layoutFrame || outerRenderParent.layoutGrid) || this.display === 'table-cell') {
                    const gravity = this.display === 'table-cell' ? 'gravity' : 'layout_gravity';
                    switch (this.css('verticalAlign')) {
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
                            node.mergeGravity('layout_gravity', this.float as LayoutGravityDirectionAttr);
                        }
                        else if (!setAutoMargin(node) && !this.blockStatic && this.display !== 'table') {
                            const parentAlign = node.tagName === 'LEGEND' ? !isUserAgent(USER_AGENT.FIREFOX) ? textAlign || checkTextAlign(this.cssAscend('textAlign'), true) : 'left' : checkTextAlign(this.cssAscend('textAlign'), true);
                            if (parentAlign) {
                                node.mergeGravity('layout_gravity', parentAlign, false);
                            }
                        }
                    }
                    if (this.rightAligned) {
                        floatAlign = 'right';
                    }
                    else if (this.nodeGroup) {
                        if (this.hasAlign(NODE_ALIGNMENT.FLOAT)) {
                            floatAlign = this.hasAlign(NODE_ALIGNMENT.RIGHT) ? 'right' : 'left';
                        }
                        else if (this.every(item => item.rightAligned)) {
                            floatAlign = 'right';
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
                    if (!setAutoMargin(this)) {
                        if (!this.innerWrapped) {
                            if (this.floating) {
                                floatAlign = this.float as LayoutGravityDirectionAttr;
                            }
                            if (floatAlign && !renderParent.naturalElement && (renderParent.inlineWidth || !renderParent.documentRoot && this.onlyChild)) {
                                renderParent.mergeGravity('layout_gravity', floatAlign);
                                floatAlign = undefined;
                            }
                        }
                        if (this.centerAligned) {
                            this.mergeGravity('layout_gravity', 'center_horizontal');
                        }
                        else if (this.rightAligned) {
                            this.mergeGravity('layout_gravity', 'right');
                        }
                    }
                    if (this.onlyChild && this.cssParent('display') === 'table-cell') {
                        let gravity: LayoutGravityDirectionAttr;
                        switch (this.cssParent('verticalAlign')) {
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
                if (floatAlign) {
                    if (this.blockWidth) {
                        if (!textAlign || floatAlign === 'right') {
                            textAlign = floatAlign;
                        }
                    }
                    else {
                        (node.blockWidth && this !== node ? this : node).mergeGravity('layout_gravity', floatAlign);
                    }
                }
                else if (setAutoMargin(node.inlineWidth ? node : this)) {
                    marginAlign = !this.textElement;
                }
                else if (this.blockStatic && outerRenderParent.layoutVertical && (outerRenderParent.layoutLinear || outerRenderParent.layoutRelative)) {
                    node.mergeGravity('layout_gravity', 'left', false);
                }
            }
            if (this.layoutElement && !this.inputElement) {
                if (this.textElement) {
                    switch (this.cssValue('justifyContent')) {
                        case 'center':
                        case 'space-around':
                        case 'space-evenly':
                            this.mergeGravity('gravity', 'center_horizontal');
                            break;
                        case 'flex-end':
                            this.mergeGravity('gravity', 'right');
                            break;
                    }
                    switch (this.cssValue('alignItems')) {
                        case 'center':
                            this.mergeGravity('gravity', 'center_vertical');
                            break;
                        case 'flex-end':
                            this.mergeGravity('gravity', 'bottom');
                            break;
                    }
                }
            }
            else if (!this.layoutConstraint && !this.layoutFrame && !this.layoutGrid) {
                if (textAlign) {
                    if (!this.imageContainer) {
                        this.mergeGravity('gravity', textAlign);
                    }
                }
                else if (!marginAlign) {
                    const parentAlign = checkTextAlign(this.cssAscend('textAlign'), true);
                    if (parentAlign) {
                        if (this.pageFlow && !this.floating) {
                            this.mergeGravity('layout_gravity', parentAlign, false);
                        }
                        if (this.rendering || this.textElement && (!this.inlineWidth || this.multiline) || startsWith(this.display, 'table-')) {
                            this.mergeGravity('gravity', parentAlign, false);
                        }
                    }
                }
            }
            if (autoMargin.vertical && (renderParent.layoutFrame || renderParent.layoutVertical && renderParent.layoutLinear)) {
                (renderParent.hasAlign(NODE_ALIGNMENT.COLUMN) ? this : node).mergeGravity('layout_gravity', autoMargin.topBottom ? 'center_vertical' : autoMargin.top ? 'bottom' : 'top');
            }
        }

        public setBoxSpacing() {
            const boxReset = this._boxReset;
            const boxAdjustment = this._boxAdjustment;
            for (let i = 0; i < 2; ++i) {
                const margin = i === 0;
                const attrs = margin ? BOX_MARGIN : BOX_PADDING;
                let top = 0,
                    right = 0,
                    bottom = 0,
                    left = 0;
                for (let j = 0; j < 4; ++j) {
                    const attr = attrs[j];
                    let value: number = !boxReset || boxReset[margin ? j : j + 4] === 0 ? this[attr] : 0;
                    if (value !== 0) {
                        if (margin) {
                            switch (j) {
                                case 0:
                                    if (value < 0 && this.controlElement) {
                                        value = 0;
                                    }
                                    break;
                                case 1:
                                    if (this.inline) {
                                        const outer = this.documentParent.box.right;
                                        const inner = this.bounds.right;
                                        if (Math.floor(inner) > outer) {
                                            if (!this.onlyChild && !this.alignParent('left')) {
                                                this.setSingleLine(true, true);
                                            }
                                            continue;
                                        }
                                        else if (inner + value > outer) {
                                            value = clamp(outer - inner, 0, value);
                                        }
                                    }
                                    break;
                                case 2:
                                    if (value < 0 && (this.pageFlow && !this.blockStatic || this.controlElement)) {
                                        value = 0;
                                    }
                                    break;
                            }
                        }
                        else {
                            switch (j) {
                                case 0:
                                    value = this.actualPadding(attr as "paddingTop", value);
                                    break;
                                case 2:
                                    if (this.hasUnit('height', { percent: false, initial: true }) && (!this.layoutElement && (this.layoutVertical || this.layoutFrame) || !this.pageFlow) || this.documentParent.gridElement && this.hasUnit('height', { percent: false })) {
                                        continue;
                                    }
                                    else if (this.floatContainer) {
                                        let maxBottom = -Infinity;
                                        for (const item of this.naturalChildren) {
                                            if (item.floating) {
                                                maxBottom = Math.max(item.bounds.bottom, maxBottom);
                                            }
                                        }
                                        value = clamp(this.bounds.bottom - maxBottom, 0, value);
                                    }
                                    else {
                                        value = this.actualPadding(attr as "paddingBottom", value);
                                    }
                                    break;
                            }
                        }
                    }
                    if (boxAdjustment) {
                        value += boxAdjustment[margin ? j : j + 4];
                    }
                    switch (j) {
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
                let unmergeable: Undef<boolean>;
                if (margin) {
                    const renderParent = this.renderParent as T;
                    if (this.floating) {
                        let sibling = renderParent.renderChildren.find(item => !item.floating) as Undef<T>;
                        if (sibling) {
                            const boundsTop = Math.floor(this.bounds.top);
                            let actualNode: Undef<T>;
                            while (Math.floor(sibling.bounds.top) === boundsTop) {
                                actualNode = sibling;
                                const innerWrapped = sibling.innerWrapped as T;
                                if (innerWrapped) {
                                    sibling = innerWrapped;
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
                    else if (this.inlineStatic && renderParent.layoutVertical && this.renderChildren.find(item => item.blockStatic)) {
                        left = 0;
                        right = 0;
                    }
                    if (this.positionStatic && !this.blockWidth && (left < 0 || right < 0)) {
                        switch (this.cssAscend('textAlign')) {
                            case 'center':
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
                            case 'right':
                            case this.dir === 'rtl' ? 'start' : 'end':
                                if (left < 0) {
                                    left = 0;
                                }
                                break;
                        }
                    }
                    if (this.tagName === 'PICTURE') {
                        bottom += 4;
                        right += 4;
                    }
                    switch (this.controlName) {
                        case CONTAINER_TAGNAME.RADIO:
                        case CONTAINER_TAGNAME.CHECKBOX:
                            top = Math.max(top - 4, 0);
                            bottom = Math.max(bottom - 4, 0);
                            break;
                        case CONTAINER_TAGNAME.SELECT:
                            top = Math.max(top - 2, 0);
                            bottom = Math.max(bottom - 2, 0);
                            break;
                    }
                    if (top < 0) {
                        if (!this.pageFlow) {
                            if (bottom >= 0 && this.leftTopAxis && (this.hasUnit('top') || !this.hasUnit('bottom')) && this.translateY(top)) {
                                top = 0;
                            }
                        }
                        else if (this.blockDimension && !this.inputElement && this.translateY(top)) {
                            for (const item of this.anchorChain('bottom')) {
                                item.translateY(top);
                            }
                            top = 0;
                        }
                    }
                    if (bottom < 0) {
                        if (!this.pageFlow) {
                            if (top >= 0 && this.leftTopAxis && this.hasUnit('bottom') && !this.hasUnit('top') && this.translateY(-bottom)) {
                                bottom = 0;
                            }
                        }
                        else if (this.blockDimension && !this.inputElement && renderParent.layoutConstraint) {
                            for (const item of this.anchorChain('bottom')) {
                                item.translateY(-bottom);
                            }
                            bottom = 0;
                        }
                    }
                    if (left < 0) {
                        if (!this.pageFlow) {
                            if (right >= 0 && this.leftTopAxis && (this.hasUnit('left') || !this.hasUnit('right')) && this.translateX(left)) {
                                left = 0;
                            }
                        }
                        else if (this.float === 'right') {
                            left = Math.min(-left, this.bounds.width * -1);
                            for (const item of this.anchorChain('left')) {
                                item.translateX(-left);
                            }
                            left = 0;
                        }
                        else if (this.blockDimension && this.translateX(left)) {
                            for (const item of this.anchorChain('right')) {
                                item.translateX(left);
                            }
                            left = 0;
                        }
                    }
                    if (right < 0) {
                        if (!this.pageFlow) {
                            if (left >= 0 && this.leftTopAxis && this.hasUnit('right') && !this.hasUnit('left') && this.translateX(-right)) {
                                right = 0;
                            }
                        }
                        else if (this.rightAligned) {
                            if (this.translateX(-right)) {
                                right = 0;
                            }
                        }
                        else if (this.blockDimension && renderParent.layoutConstraint) {
                            for (const item of this.anchorChain('right')) {
                                item.translateX(right);
                            }
                            right = 0;
                        }
                    }
                    unmergeable = renderParent.layoutGrid;
                }
                else if (this.visibleStyle.borderWidth && !this.is(CONTAINER_NODE.LINE)) {
                    top += this.borderTopWidth;
                    bottom += this.borderBottomWidth;
                    right += this.borderRightWidth;
                    left += this.borderLeftWidth;
                }
                if (top !== 0 || left !== 0 || bottom !== 0 || right !== 0) {
                    let horizontal = NaN,
                        vertical = NaN;
                    top = Math.round(top);
                    right = Math.round(right);
                    bottom = Math.round(bottom);
                    left = Math.round(left);
                    if (!unmergeable && this.api >= BUILD_VERSION.OREO) {
                        if (top === right && right === bottom && bottom === left) {
                            if (top !== 0) {
                                this.android(margin ? LAYOUT_STRING.MARGIN : LAYOUT_STRING.PADDING, top + 'px');
                            }
                            continue;
                        }
                        else {
                            if (left === right) {
                                horizontal = left;
                            }
                            if (top === bottom) {
                                vertical = top;
                            }
                        }
                    }
                    if (!isNaN(horizontal)) {
                        if (horizontal !== 0) {
                            this.android(margin ? LAYOUT_STRING.MARGIN_HORIZONTAL : LAYOUT_STRING.PADDING_HORIZONTAL, horizontal + 'px');
                        }
                    }
                    else {
                        if (left !== 0) {
                            this.android(this.localizeString(margin ? LAYOUT_STRING.MARGIN_LEFT : LAYOUT_STRING.PADDING_LEFT), left + 'px');
                        }
                        if (right !== 0) {
                            this.android(this.localizeString(margin ? LAYOUT_STRING.MARGIN_RIGHT : LAYOUT_STRING.PADDING_RIGHT), right + 'px');
                        }
                    }
                    if (!isNaN(vertical)) {
                        if (vertical !== 0) {
                            this.android(margin ? LAYOUT_STRING.MARGIN_VERTICAL : LAYOUT_STRING.PADDING_VERTICAL, vertical + 'px');
                        }
                    }
                    else {
                        if (top !== 0) {
                            this.android(margin ? LAYOUT_STRING.MARGIN_TOP : LAYOUT_STRING.PADDING_TOP, top + 'px');
                        }
                        if (bottom !== 0) {
                            this.android(margin ? LAYOUT_STRING.MARGIN_BOTTOM : LAYOUT_STRING.PADDING_BOTTOM, bottom + 'px');
                        }
                    }
                }
            }
        }

        public apply(options: PlainObject) {
            for (const name in options) {
                const data = options[name];
                switch (typeof data) {
                    case 'object':
                        if (data) {
                            for (const attr in data) {
                                this.attr(name, attr, data[attr]);
                            }
                        }
                        break;
                    case 'string':
                    case 'number':
                    case 'boolean':
                        this.attr('_', name, data.toString());
                        break;
                }
            }
        }

        public clone(id: number, options?: CloneOptions): T {
            let attributes: Undef<boolean>,
                position: Undef<boolean>;
            if (options) {
                ({ attributes, position } = options);
            }
            const newInstance = !isNaN(id);
            const node = new View(newInstance ? id : this.id, this.sessionId, this.element!);
            if (newInstance) {
                node.setControlType(this.controlName, this.containerType);
            }
            else {
                node.controlId = this.controlId;
                node.controlName = this.controlName;
                node.containerType = this.containerType;
            }
            this.cloneBase(node);
            if (attributes !== false) {
                if (this._boxReset) {
                    node.unsafe('boxReset', this._boxReset.slice(0));
                }
                if (this._boxAdjustment) {
                    node.unsafe('boxAdjustment', this._boxAdjustment.slice(0));
                }
                for (const name in this._namespaces) {
                    const obj = this._namespaces[name];
                    for (const attr in obj) {
                        node.attr(name, attr, attr === 'id' && name === 'android' ? node.documentId : obj[attr]);
                    }
                }
            }
            if (position !== false) {
                node.anchorClear();
                const documentId = this.documentId;
                if (node.anchor('left', documentId)) {
                    node.setBox(BOX_STANDARD.MARGIN_LEFT, { reset: 1, adjustment: 0 });
                }
                if (node.anchor('top', documentId)) {
                    node.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1, adjustment: 0 });
                }
            }
            node.saveAsInitial();
            return node;
        }

        public extractAttributes(depth: number) {
            if (this.dir === 'rtl') {
                if (this.textElement) {
                    this.android('textDirection', 'rtl');
                }
                else if (this.rendering) {
                    this.android('layoutDirection', 'rtl');
                }
            }
            if (this.styleElement || this.hasAlign(NODE_ALIGNMENT.WRAPPER)) {
                const dataset = getDataSet(this.dataset, 'android');
                if (dataset) {
                    const pattern = /^attr[A-Z]/;
                    for (const namespace in dataset) {
                        const name = namespace === 'attr' ? 'android' : pattern.test(namespace) ? capitalize(namespace.substring(4), false) : '';
                        if (name) {
                            for (const values of dataset[namespace]!.split(';')) {
                                const [key, value] = splitPair(values, '::', true);
                                if (value) {
                                    this.attr(name, key, value);
                                }
                            }
                        }
                    }
                }
                if (!this.svgElement) {
                    const opacity = this.opacity;
                    if (opacity < 1) {
                        if (opacity === 0) {
                            this.android('visibility', !this.pageFlow ? 'gone' : 'invisible');
                        }
                        this.android('alpha', opacity.toString());
                    }
                }
            }
            const indent = CACHE_INDENT[depth] ||= '\n' + '\t'.repeat(depth);
            return this.combine().reduce((a, b) => a + indent + b, '');
        }

        public alignParent(position: AnchorPositionAttr) {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as Null<T>;
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
                                return node === lastItemOf(children);
                        }
                    }
                    else {
                        switch (position) {
                            case 'left':
                                return node === children[0];
                            case 'right':
                                return node === lastItemOf(children);
                        }
                    }
                }
            }
            return false;
        }

        public alignSibling(position: AnchorPositionAttr, documentId?: string) {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as Null<T>;
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
                else if (renderParent.layoutConstraint) {
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
            return '';
        }

        public actualRect(direction: PositionAttr, dimension: BoxType = 'linear') {
            let value: number = this[dimension][direction];
            if (this.positionRelative && this.floating) {
                switch (direction) {
                    case 'top':
                        if (this.hasUnit('top')) {
                            value += this.top;
                        }
                        else {
                            value -= this.bottom;
                        }
                        break;
                    case 'bottom':
                        if (!this.hasUnit('top')) {
                            value -= this.bottom;
                        }
                        else {
                            value += this.top;
                        }
                        break;
                    case 'left':
                        if (this.hasUnit('left')) {
                            value += this.left;
                        }
                        else {
                            value -= this.right;
                        }
                        break;
                    case 'right':
                        if (!this.hasUnit('left')) {
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
                if (companion && companion.labelFor === this && !companion.visible) {
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

        public translateX(value: number, options?: TranslateOptions) {
            if (!isNaN(value)) {
                const node = this.anchorTarget;
                const renderParent = node.renderParent as Null<T>;
                if (renderParent && renderParent.layoutConstraint) {
                    let oppose: Undef<boolean>,
                        accumulate: Undef<boolean>,
                        contain: Undef<boolean>;
                    if (options) {
                        ({ oppose, accumulate, contain } = options);
                    }
                    let x = convertInt(node.android('translationX'));
                    if (oppose === false && (x > 0 && value < 0 || x < 0 && value > 0)) {
                        return false;
                    }
                    else if (accumulate !== false) {
                        x += value;
                    }
                    if (contain) {
                        const { left, right } = renderParent.box;
                        const linear = this.linear;
                        if (linear.left + x < left) {
                            x = Math.max(linear.left - left, 0);
                        }
                        else if (linear.right + x > right) {
                            x = Math.max(right - linear.right, 0);
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
            }
            return false;
        }

        public translateY(value: number, options?: TranslateOptions) {
            if (!isNaN(value)) {
                const node = this.anchorTarget;
                const renderParent = node.renderParent as Null<T>;
                if (renderParent && renderParent.layoutConstraint) {
                    let oppose: Undef<boolean>,
                        accumulate: Undef<boolean>,
                        contain: Undef<boolean>;
                    if (options) {
                        ({ oppose, accumulate, contain } = options);
                    }
                    let y = convertInt(node.android('translationY'));
                    if (oppose === false && (y > 0 && value < 0 || y < 0 && value > 0)) {
                        return false;
                    }
                    else if (accumulate !== false) {
                        y += value;
                    }
                    if (contain) {
                        const { top, bottom } = renderParent.box;
                        const linear = this.linear;
                        if (linear.top + y < top) {
                            y = Math.max(linear.top - top, 0);
                        }
                        else if (linear.bottom + y > bottom) {
                            y = Math.max(bottom - linear.bottom, 0);
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
            }
            return false;
        }

        public localizeString(value: string) {
            return localizeString(value, this.localSettings.supportRTL, this.api);
        }

        public removeTry(options?: RemoveTryOptions<T>) {
            if (options && !options.beforeReplace) {
                const updating = options.replaceWith || options.alignSiblings;
                if (updating) {
                    options.beforeReplace = () => this.anchorClear(updating);
                }
            }
            return super.removeTry(options);
        }

        public hasFlex(direction: LayoutDirectionAttr) {
            let parent = this.actualParent as Null<T>;
            if (parent && parent.flexdata[direction]) {
                let current: Undef<T>;
                const checkDimension = (attr: DimensionAttr) => {
                    let largest = 0,
                        fitSize = 0;
                    for (const item of parent!) {
                        const value = (item.data<BoxRectDimension>(EXT_NAME.FLEXBOX, 'boundsData') || item.bounds)[attr];
                        if (value > largest) {
                            largest = value;
                        }
                        if (item === current) {
                            fitSize = value;
                            if (fitSize < largest) {
                                break;
                            }
                        }
                    }
                    return fitSize >= largest;
                };
                switch (direction) {
                    case 'row': {
                        current = this as T;
                        while (parent) {
                            if (parent.flexElement) {
                                if (parent.flexdata.column) {
                                    if (current === this) {
                                        if (checkDimension('width')) {
                                            return 0;
                                        }
                                    }
                                    else if (current.flexbox.alignSelf !== 'normal') {
                                        return 0;
                                    }
                                    break;
                                }
                                else if (current.flexbox.grow === 0) {
                                    return current.hasWidth;
                                }
                            }
                            if (parent.hasWidth) {
                                break;
                            }
                            current = parent;
                            parent = current.actualParent as Null<T>;
                        }
                        break;
                    }
                    case 'column':
                        if (!parent.hasHeight) {
                            current = parent;
                            parent = parent.actualParent as Null<T>;
                            if (parent && !parent.hasHeight) {
                                if (parent.flexElement && parent.flexdata.row) {
                                    if (checkDimension('height')) {
                                        return 0;
                                    }
                                }
                                else if (!parent.layoutGrid && !parent.gridElement) {
                                    return false;
                                }
                            }
                        }
                        break;
                }
                return this.flexbox.grow > 0 || this.flexbox.shrink !== 1;
            }
            return false;
        }

        public hide(options?: HideOptions<T>) {
            if (options) {
                if (options.hidden) {
                    this.android('visibility', 'invisible');
                    return null;
                }
                else if (options.collapse) {
                    this.android('visibility', 'gone');
                    return null;
                }
            }
            return super.hide(options);
        }

        public android(attr: string, value?: string, overwrite = true) {
            if (value) {
                if (value = this.attr('android', attr, value, overwrite)) {
                    return value;
                }
            }
            else if (value === '') {
                this.delete('android', attr);
                return '';
            }
            return this._namespaces.android![attr] || '';
        }

        public app(attr: string, value?: string, overwrite = true) {
            if (value) {
                if (value = this.attr('app', attr, value, overwrite)) {
                    return value;
                }
            }
            else if (value === '') {
                this.delete('app', attr);
                return '';
            }
            const app = this._namespaces.app;
            return app && app[attr] || '';
        }

        public formatted(value: string, overwrite = true) {
            const match = REGEXP_FORMATTED.exec(value);
            if (match) {
                this.attr(match[1] || '_', match[2], match[3], overwrite);
            }
        }

        public anchor(position: AnchorPositionAttr, documentId = '', overwrite?: boolean) {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as Null<T>;
            if (renderParent && node.documentId !== documentId) {
                if (renderParent.layoutConstraint) {
                    if (!documentId || !node.constraint.current[position] || overwrite) {
                        const anchored = documentId === 'parent';
                        if (overwrite === undefined && documentId) {
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
                                    if (renderParent.layoutElement) {
                                        node.constraint.horizontal = true;
                                    }
                                    horizontal = true;
                                    break;
                                case 'top':
                                case 'bottom':
                                case 'baseline':
                                    if (anchored) {
                                        node.constraint.vertical = true;
                                    }
                                    break;
                                case 'topBottom':
                                case 'bottomTop':
                                    if (renderParent.layoutElement) {
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
                    if (overwrite === undefined && documentId) {
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

        public anchorParent(orientation: OrientationAttr, bias?: number, style?: LayoutChainStyle, overwrite?: boolean) {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as Null<T>;
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

        public anchorStyle(orientation: OrientationAttr, bias: number, style?: LayoutChainStyle, overwrite = true) {
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
            const renderParent = node.renderParent as Null<T>;
            if (renderParent && (renderParent.layoutConstraint || renderParent.layoutRelative)) {
                let anchorA: AnchorPositionAttr,
                    anchorB: AnchorPositionAttr;
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
                    if (adjacent) {
                        const sibling = siblings.find(item => item.documentId === adjacent) as Undef<T>;
                        if (sibling && (sibling.alignSibling(anchorB) === current.documentId || sibling.floating && sibling.alignParent(direction))) {
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

        public anchorDelete(...position: AnchorPositionAttr[]) {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as Null<T>;
            if (renderParent) {
                if (renderParent.layoutConstraint) {
                    node.delete('app', ...replaceMap(position, value => this.localizeString(LAYOUT_CONSTRAINT[value])));
                }
                else if (renderParent.layoutRelative) {
                    const layout: string[] = [];
                    for (let i = 0, length = position.length, attr: string; i < length; ++i) {
                        const value = position[i];
                        if (attr = LAYOUT_RELATIVE[value]) {
                            layout.push(this.localizeString(attr));
                        }
                        if (attr = LAYOUT_RELATIVE_PARENT[value]) {
                            layout.push(this.localizeString(attr));
                        }
                    }
                    node.delete('android', ...layout);
                }
            }
        }

        public anchorClear(update?: T | true) {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as Null<T>;
            if (renderParent) {
                if (renderParent.layoutConstraint) {
                    if (update === true) {
                        replaceLayoutPosition(node, 'parent');
                    }
                    else if (update) {
                        transferLayoutAlignment(node, update);
                    }
                    node.anchorDelete(...Object.keys(LAYOUT_CONSTRAINT) as AnchorPositionAttr[]);
                    node.delete('app', 'layout_constraint*');
                }
                else if (renderParent.layoutRelative) {
                    if (update === true) {
                        replaceLayoutPosition(node, 'true');
                    }
                    else if (update) {
                        transferLayoutAlignment(node, update);
                    }
                    node.anchorDelete(...Object.keys(LAYOUT_RELATIVE_PARENT) as AnchorPositionAttr[]);
                    node.anchorDelete(...Object.keys(LAYOUT_RELATIVE) as AnchorPositionAttr[]);
                }
            }
        }

        public supported(attr: string, value: string, result: PlainObject): boolean {
            const api = this.api;
            if (DEPRECATED_ATTRIBUTE.android[attr]) {
                const valid = DEPRECATED_ATTRIBUTE.android[attr]!.call(this, result, api, value);
                if (!valid || hasKeys(result)) {
                    return valid;
                }
            }
            for (let i = api; i <= BUILD_VERSION.LATEST; ++i) {
                const callback = API_VERSION[i]!.android[attr];
                switch (typeof callback) {
                    case 'boolean':
                        return callback;
                    case 'function':
                        return callback.call(this, result, api, value);
                }
            }
            return true;
        }

        public combine(...objs: string[]) {
            const all = objs.length === 0;
            const result: string[] = [];
            let id: Undef<string>,
                requireId: Undef<boolean>;
            for (const name in this._namespaces) {
                if (all || objs.includes(name)) {
                    const obj = this._namespaces[name];
                    let prefix = name + ':';
                    switch (name) {
                        case 'android':
                            if (this.api < BUILD_VERSION.LATEST) {
                                for (let attr in obj) {
                                    if (attr === 'id') {
                                        id = obj.id;
                                    }
                                    else {
                                        const data: ObjectMap<string | boolean> = {};
                                        let value = obj[attr]!;
                                        if (!this.supported(attr, value, data)) {
                                            continue;
                                        }
                                        if (hasKeys(data)) {
                                            if (isString(data.attr)) {
                                                attr = data.attr;
                                            }
                                            if (isString(data.value)) {
                                                value = data.value;
                                            }
                                        }
                                        result.push(prefix + attr + `="${value}"`);
                                    }
                                }
                            }
                            else {
                                for (const attr in obj) {
                                    if (attr === 'id') {
                                        id = obj.id;
                                    }
                                    else {
                                        result.push(prefix + attr + `="${obj[attr]!}"`);
                                    }
                                }
                            }
                            requireId = true;
                            break;
                        case '_':
                            prefix = '';
                        default:
                            for (const attr in obj) {
                                result.push(prefix + attr + `="${obj[attr]!}"`);
                            }
                            break;
                    }
                }
            }
            result.sort((a, b) => a > b ? 1 : -1);
            if (requireId) {
                result.unshift(`android:id="${id || `@+id/${this.controlId}`}"`);
            }
            return result;
        }

        public mergeGravity(attr: LayoutGravityAttr, alignment: LayoutGravityDirectionAttr, overwrite = true) {
            if (attr === 'layout_gravity') {
                const renderParent = this.renderParent;
                if (renderParent) {
                    if (renderParent.layoutRelative || isHorizontalAlign(alignment) && (this.blockWidth || renderParent.inlineWidth && this.onlyChild || !overwrite && this.outerWrapper && this.hasUnit('maxWidth'))) {
                        return;
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
                switch (this.containerType) {
                    case CONTAINER_NODE.IMAGE:
                    case CONTAINER_NODE.SVG:
                    case CONTAINER_NODE.RADIO:
                    case CONTAINER_NODE.CHECKBOX:
                    case CONTAINER_NODE.LINE:
                    case CONTAINER_NODE.PROGRESS:
                    case CONTAINER_NODE.RANGE:
                    case CONTAINER_NODE.VIDEOVIEW:
                    case CONTAINER_NODE.WEBVIEW:
                    case CONTAINER_NODE.SPACE:
                        return;
                    default:
                        if (this.plainText || !this.isEmpty() && (this.layoutFrame || this.layoutConstraint || this.layoutRelative && this.layoutHorizontal || this.layoutGrid) || this.is(CONTAINER_NODE.TEXT) && this.textEmpty || this.controlElement) {
                            return;
                        }
                        break;
                }
            }
            const direction = getGravityValues(this, attr, this.localizeString(alignment));
            if (direction) {
                let x: Undef<string>,
                    y: Undef<string>,
                    z: Undef<string>;
                for (let i = 0, length = direction.length; i < length; ++i) {
                    const value = direction[i];
                    if (isHorizontalAlign(value)) {
                        if (!x || overwrite) {
                            x = value;
                        }
                    }
                    else if (isVerticalAlign(value)) {
                        if (!y || overwrite) {
                            y = value;
                        }
                    }
                    else if (z) {
                        z += '|' + value;
                    }
                    else {
                        z = value;
                    }
                }
                const result = x && y ? x + '|' + y : x || y;
                this.android(attr, result ? z ? result + '|' + z : result : z || '');
            }
        }

        public applyOptimizations() {
            const renderParent = this.renderParent!;
            if (this.renderExclude || renderParent.layoutLinear && renderParent.layoutVertical && this.layoutFrame && !this.rendering && this.inlineHeight && this.getBoxSpacing().every((value, index) => value === 0 || index % 2 === 1)) {
                if (!this.alignSibling('topBottom') && !this.alignSibling('bottomTop') && !this.alignSibling('leftRight') && !this.alignSibling('rightLeft') && this.hide({ remove: true })) {
                    return false;
                }
                this.hide({ collapse: true });
                return true;
            }
            const lineHeight = this.lineHeight;
            if (lineHeight) {
                const hasOwnStyle = this.has('lineHeight', { initial: true });
                if (this.multiline) {
                    setMultiline(this, lineHeight, hasOwnStyle);
                }
                else if (this.rendering && !(!hasOwnStyle && this.layoutHorizontal && this.alignSibling('baseline'))) {
                    if (this.layoutVertical || this.layoutFrame) {
                        this.renderEach((item: T) => {
                            const value = getLineHeight(item, lineHeight);
                            if (value) {
                                setLineHeight(item, value, true, true, true);
                            }
                        });
                    }
                    else {
                        const horizontalRows = this.horizontalRows || [this.renderChildren];
                        for (let i = 0, q = horizontalRows.length; i < q; ++i) {
                            const row = horizontalRows[i];
                            const r = row.length;
                            const onlyChild = r === 1;
                            const baseline = !onlyChild && row.find(item => item.baselineActive && !item.rendering && !item.imageContainer);
                            let top: boolean,
                                bottom: boolean;
                            if (q === 1) {
                                if (this.inline && row.every(item => item.inline)) {
                                    setLineHeight(this, Math.max(lineHeight, ...row.map(item => item.lineHeight)), true, true, true, true);
                                    break;
                                }
                                top = true;
                                bottom = true;
                            }
                            else {
                                top = i > 0 || row[0].lineBreakLeading;
                                bottom = i < q - 1 && !horizontalRows[i + 1][0].lineBreakLeading;
                                if (!top && !bottom) {
                                    continue;
                                }
                            }
                            if (baseline) {
                                if (q === 1) {
                                    let invalid: Undef<boolean>;
                                    for (let j = 0; j < r; ++j) {
                                        const item = row[j];
                                        if (!item.alignSibling('baseline') && item !== baseline || getLineHeight(item, lineHeight, true) !== lineHeight) {
                                            invalid = true;
                                            break;
                                        }
                                    }
                                    if (!invalid) {
                                        baseline.setCacheValue('lineHeight', 0);
                                        setLineHeight(baseline, lineHeight, false, top, bottom, false, this);
                                        continue;
                                    }
                                }
                                setLineHeight(baseline, getLineHeight(baseline, lineHeight), false, top, bottom);
                            }
                            else if (onlyChild) {
                                const item = row[0];
                                if (item.multiline && item.lineHeight) {
                                    continue;
                                }
                                else {
                                    setLineHeight(item, getLineHeight(item, lineHeight), true, top, bottom);
                                }
                            }
                            else {
                                for (let j = 0; j < r; ++j) {
                                    const item = row[j];
                                    const value = getLineHeight(item, lineHeight);
                                    if (value) {
                                        setLineHeight(item, value, false, top, bottom);
                                    }
                                }
                            }
                        }
                    }
                }
                else if ((hasOwnStyle || renderParent.lineHeight === 0) && (this.inlineText && !this.textEmpty || this.inputElement)) {
                    setLineHeight(this, lineHeight, hasOwnStyle, true, true);
                }
            }
            const setAttribute = (attr: string) => {
                const direction = getGravityValues(this, attr);
                if (direction && direction.length > 1) {
                    let modified: Undef<boolean>;
                    if (checkMergableGravity('center', direction)) {
                        modified = true;
                    }
                    if (checkMergableGravity('fill', direction)) {
                        modified = true;
                    }
                    if (modified) {
                        this.android(attr, concatString(direction, '|'));
                    }
                }
            };
            setAttribute('layout_gravity');
            setAttribute('gravity');
            const transform = this.cssValue('transform');
            if (transform) {
                const transforms = parseTransform(transform, { accumulate: true, boundingBox: this.bounds, fontSize: this.fontSize });
                let offsetX = 0,
                    offsetY = 0,
                    pivoted: Undef<boolean>;
                for (let i = 0, length = transforms.length; i < length; ++i) {
                    const item = transforms[i];
                    const [x, y, z] = item.values;
                    switch (item.group) {
                        case 'rotate':
                            if (x === y) {
                                this.android('rotation', x.toString());
                            }
                            else {
                                if (x !== 0) {
                                    this.android('rotationX', x.toString());
                                }
                                if (y !== 0) {
                                    this.android('rotationY', y.toString());
                                }
                            }
                            pivoted = true;
                            break;
                        case 'scale':
                            if (x !== 1) {
                                this.android('scaleX', x.toString());
                            }
                            if (y !== 1) {
                                this.android('scaleY', y.toString());
                            }
                            pivoted = true;
                            break;
                        case 'translate':
                            if (x !== 0 && !this.translateX(x)) {
                                this.android('translationX', formatPX(x));
                            }
                            if (y !== 0 && !this.translateY(y)) {
                                this.android('translationY', formatPX(y));
                            }
                            if (z !== 0) {
                                this.android('translationZ', formatPX(z));
                            }
                            offsetX = x;
                            offsetY = y;
                            break;
                    }
                }
                if (pivoted && this.has('transformOrigin')) {
                    const { left, top } = Resource.getBackgroundPosition(this.cssValue('transformOrigin'), this.bounds, { fontSize: this.fontSize, screenDimension: this.localSettings.screenDimension });
                    if (top !== 0) {
                        this.android('transformPivotX', formatPX(top - (offsetX >= 0 ? offsetX : offsetX * -2)));
                    }
                    if (left !== 0) {
                        this.android('transformPivotY', formatPX(left - (offsetY >= 0 ? offsetY : offsetY * -2)));
                    }
                }
            }
            if (this.alignedWithX) {
                this.translateX(safeFloat(this.alignedWithX.android('translationX')));
            }
            if (this.alignedWithY) {
                this.translateY(safeFloat(this.alignedWithY.android('translationY')));
            }
            if (this.textElement) {
                if (this.multiline) {
                    switch (this.css('whiteSpace')) {
                        case 'nowrap':
                        case 'pre':
                            break;
                        default:
                            this.android('hyphenationFrequency', 'full');
                            break;
                    }
                }
            }
            else if (this.imageElement) {
                const { layoutWidth, layoutHeight } = this;
                if (layoutWidth === 'wrap_content' && layoutHeight !== 'wrap_content' ||
                    layoutWidth !== 'wrap_content' && layoutHeight === 'wrap_content' ||
                    layoutWidth === 'match_parent' || layoutHeight === 'match_parent' ||
                    layoutWidth === '0px' || layoutHeight === '0px' ||
                    this.android('minWidth') || this.android('minHeight') ||
                    this.android('maxWidth') || this.android('maxHeight'))
                {
                    this.android('adjustViewBounds', 'true');
                }
            }
            else if (this.inputElement) {
                if (!this.hasAlign(NODE_ALIGNMENT.WRAPPER)) {
                    if (this.flexibleWidth && renderParent.inlineWidth) {
                        this.android('minWidth', Math.ceil(this.bounds.width) + 'px');
                        this.setLayoutWidth('wrap_content');
                        this.delete('app', 'layout_constraintWidth*');
                    }
                    if (this.flexibleHeight && renderParent.inlineHeight) {
                        this.android('minHeight', Math.ceil(this.bounds.height) + 'px');
                        this.setLayoutHeight('wrap_content');
                        this.delete('app', 'layout_constraintHeight*');
                    }
                }
            }
            else if (this.rendering) {
                if (this.layoutLinear) {
                    if (this.layoutVertical) {
                        if ((renderParent.layoutHorizontal || renderParent.layoutGrid || this.alignSibling('baseline') || this.baselineActive) && (this.baselineElement || this.renderChildren[0].baselineElement) && !this.documentRoot) {
                            this.android('baselineAlignedChildIndex', '0', false);
                        }
                    }
                    else {
                        const children = this.renderChildren;
                        let baseline = true;
                        if ((this.floatContainer || this.nodeGroup && (this.hasAlign(NODE_ALIGNMENT.FLOAT) || children.some(node => node.floating))) && !children.some(node => node.imageElement && node.baseline)) {
                            this.android('baselineAligned', 'false');
                            baseline = false;
                        }
                        for (let i = 0, length = children.length; i < length; ++i) {
                            const item = children[i];
                            if (item.textElement && item.textContent.length > 1) {
                                item.android('maxLines', '1');
                                if (i === length - 1) {
                                    item.android('ellipsize', 'end');
                                }
                            }
                            if (baseline && item.baselineElement) {
                                this.android('baselineAlignedChildIndex', i.toString(), false);
                                baseline = false;
                            }
                        }
                    }
                }
                else if (this.layoutConstraint && this.onlyChild && this.flexibleWidth) {
                    const minMax = this.app('layout_constraintWidth_min') || this.app('layout_constraintWidth_max');
                    if (renderParent.inlineWidth || this.alignParent('left') && this.alignParent('right') && !minMax && !this.percentWidth) {
                        this.setLayoutWidth(minMax ? 'match_parent' : 'wrap_content');
                    }
                }
                if (this.naturalChild) {
                    const getContainerHeight = (node: T) => Math.max(convertFloat(node.layoutHeight), convertFloat(node.android('minHeight')));
                    const height = getContainerHeight(this);
                    if (height) {
                        const wrapperOf = this.wrapperOf;
                        if (wrapperOf && !wrapperOf.positionRelative) {
                            const wrapperHeight = getContainerHeight(wrapperOf as T);
                            if (height <= wrapperHeight) {
                                this.setLayoutHeight('wrap_content');
                            }
                        }
                    }
                }
                if (this.onlyChild && this.controlName === renderParent.controlName && !this.hasWidth && !this.hasHeight && !this.visibleStyle.borderWidth && !this.elementId.trim() && !safeFloat(this.android('translationX')) && !safeFloat(this.android('translationY'))) {
                    for (const [name, namespace] of renderParent.namespaces()) {
                        const data = this._namespaces[name];
                        if (data) {
                            for (const attr in data) {
                                if (attr === 'id' || data[attr] === namespace[attr]) {
                                    continue;
                                }
                                return true;
                            }
                        }
                        else {
                            return true;
                        }
                    }
                    const renderTemplates = this.renderTemplates as NodeXmlTemplate<T>[];
                    for (let i = 0, q = renderTemplates.length; i < q; ++i) {
                        const template = renderTemplates[i];
                        template.parent = renderParent;
                        template.node.renderParent = renderParent;
                    }
                    renderParent.renderChildren = this.renderChildren;
                    renderParent.renderTemplates = renderTemplates;
                    const renderAdjustment = renderParent.boxAdjustment;
                    const boxSpacing = this.getBoxSpacing();
                    renderAdjustment[4] += boxSpacing[0];
                    renderAdjustment[5] += boxSpacing[1];
                    renderAdjustment[6] += boxSpacing[2];
                    renderAdjustment[7] += boxSpacing[3];
                }
            }
            return true;
        }

        public applyCustomizations(overwrite = true) {
            const { tagName, controlName } = this;
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
            let assign = API_VERSION[0]!.assign;
            setCustomization(assign[tagName]);
            setCustomization(assign[controlName]);
            const api = API_VERSION[this.api];
            if (api) {
                assign = api.assign;
                setCustomization(assign[tagName]);
                setCustomization(assign[controlName]);
            }
        }

        public setSingleLine(maxLines: boolean, ellipsize?: boolean) {
            if (this.textElement && (this.plainText || !this.hasUnit('width')) && this.textContent.length > 1) {
                if (maxLines) {
                    this.android('maxLines', '1');
                }
                if (ellipsize) {
                    this.android('ellipsize', 'end');
                }
            }
        }

        public setConstraintDimension(percentAvailable = NaN) {
            percentAvailable = constraintPercentWidth(this, percentAvailable);
            constraintPercentHeight(this, 1);
            constraintMinMax(this);
            return percentAvailable;
        }

        public setFlexDimension(dimension: DimensionAttr, percentAvailable = NaN, weight?: number) {
            if (!weight) {
                const { grow, shrink, basis } = this.flexbox;
                const horizontal = dimension === 'width';
                const setFlexGrow = (value: number) => {
                    if (value > 0) {
                        if (grow > 0 || shrink !== 1) {
                            let size = this.bounds[dimension];
                            if (size !== value) {
                                if (size < value) {
                                    [value, size] = [size, value];
                                }
                                this.app(horizontal ? 'layout_constraintWidth_max' : 'layout_constraintHeight_max', formatPX(size));
                            }
                        }
                        this.app(horizontal ? 'layout_constraintWidth_min' : 'layout_constraintHeight_min', formatPX(value));
                        return true;
                    }
                    return false;
                };
                const n = asPercent(basis);
                if (n) {
                    setConstraintPercent(this, n, horizontal, NaN);
                }
                else if (isLength(basis) && setFlexGrow(this.parseUnit(basis, { dimension }))) {
                    setLayoutDimension(this, '0px', horizontal, true);
                }
                else if (horizontal) {
                    percentAvailable = constraintPercentWidth(this, percentAvailable);
                    if (grow > 0 && !this.layoutWidth && (this.isEmpty() || this.actualParent!.flexdata.wrap && !this.onlyChild && ascendFlexibleWidth(this))) {
                        this.setLayoutWidth('0px');
                    }
                }
                else {
                    percentAvailable = constraintPercentHeight(this, percentAvailable);
                    if (grow > 0 && !this.layoutHeight && ascendFlexibleHeight(this)) {
                        this.setLayoutHeight('0px');
                    }
                }
                if (shrink > 1) {
                    this.app(horizontal ? 'layout_constrainedWidth' : 'layout_constrainedHeight', 'true');
                }
                if (horizontal) {
                    constraintPercentHeight(this);
                }
            }
            constraintMinMax(this);
            return percentAvailable;
        }

        public getMatchConstraint(parent = this.renderParent, override?: boolean) {
            if (parent && (parent.layoutWidth || parent.blockStatic || parent.hasWidth || override)) {
                if (this.pageFlow && !this.percentWidth && !override) {
                    let current: Null<T> = parent;
                    while (current && (current.blockWidth || current.blockStatic && !current.hasWidth)) {
                        if (current.flexElement) {
                            const flexdata = current.flexdata;
                            if (flexdata.row) {
                                if (flexdata.wrap) {
                                    return 'wrap_content';
                                }
                            }
                            else {
                                break;
                            }
                        }
                        current = current.actualParent as Null<T>;
                    }
                }
                return parent.layoutConstraint && !parent.flexibleWidth && (!parent.inlineWidth || this.rendering) && !this.onlyChild && !(parent.documentRoot && this.blockStatic) && (!this.rendering || !this.renderChildren.some(item => item.percentWidth)) && (
                    this.alignSibling('leftRight') ||
                    this.alignSibling('rightLeft') ||
                    this.alignParent('left') && this.alignParent('right') && !this.textElement && !this.inputElement && !this.controlElement ||
                    this.hasUnit('minWidth') && parent.inlineWidth)
                    ? '0px'
                    : 'match_parent';
            }
            return '';
        }

        public getAnchorPosition(parent: T, horizontal: boolean, modifyAnchor = true) {
            let orientation: OrientationAttr,
                dimension: DimensionAttr,
                posA: AnchorPositionAttr,
                posB: AnchorPositionAttr,
                marginA: number,
                marginB: number,
                paddingA: number,
                paddingB: number;
            if (horizontal) {
                orientation = 'horizontal';
                dimension = 'width';
                posA = 'left';
                posB = 'right';
                marginA = BOX_STANDARD.MARGIN_LEFT;
                marginB = BOX_STANDARD.MARGIN_RIGHT;
                paddingA = BOX_STANDARD.PADDING_LEFT;
                paddingB = BOX_STANDARD.PADDING_RIGHT;
            }
            else {
                orientation = 'vertical';
                dimension = 'height';
                posA = 'top';
                posB = 'bottom';
                marginA = BOX_STANDARD.MARGIN_TOP;
                marginB = BOX_STANDARD.MARGIN_BOTTOM;
                paddingA = BOX_STANDARD.PADDING_TOP;
                paddingB = BOX_STANDARD.PADDING_BOTTOM;
            }
            const autoMargin = this.autoMargin;
            const hasDimension = this.hasUnit(dimension);
            const result: Partial<BoxRect> = {};
            const hasA = this.hasUnit(posA);
            const hasB = this.hasUnit(posB);
            if (hasDimension && autoMargin[orientation]) {
                if (hasA && autoMargin[posB]) {
                    if (modifyAnchor) {
                        this.anchor(posA, 'parent');
                        this.modifyBox(marginA, this[posA]);
                    }
                    else {
                        result[posA] = this[posA];
                    }
                }
                else if (hasB && autoMargin[posA]) {
                    if (modifyAnchor) {
                        this.anchor(posB, 'parent');
                        this.modifyBox(marginB, this[posB]);
                    }
                    else {
                        result[posB] = this[posB];
                    }
                }
                else if (modifyAnchor) {
                    this.anchorParent(orientation, 0.5);
                    this.modifyBox(marginA, this[posA]);
                    this.modifyBox(marginB, this[posB]);
                }
                else {
                    result[posA] = this[posA];
                    result[posB] = this[posB];
                }
            }
            else {
                const matchParent = this.css(dimension) === '100%' || this.css(horizontal ? 'minWidth' : 'minHeight') === '100%';
                if (matchParent) {
                    const offsetA = hasA && parent.getAbsolutePaddingOffset(paddingA, this[posA]);
                    const offsetB = hasB && parent.getAbsolutePaddingOffset(paddingB, this[posB]);
                    if (modifyAnchor) {
                        this.anchorParent(orientation);
                        if (horizontal) {
                            this.setLayoutWidth(this.getMatchConstraint(parent));
                        }
                        else {
                            this.setLayoutHeight('0px');
                        }
                        if (offsetA) {
                            this.modifyBox(marginA, offsetA);
                        }
                        if (offsetB) {
                            this.modifyBox(marginB, offsetB);
                        }
                    }
                    else {
                        if (offsetA) {
                            result[posA] = offsetA;
                        }
                        if (offsetB) {
                            result[posB] = offsetB;
                        }
                    }
                }
                else {
                    let expand = 0;
                    if (hasA) {
                        const value = parent.getAbsolutePaddingOffset(paddingA, this[posA]);
                        if (modifyAnchor) {
                            this.anchor(posA, 'parent');
                            this.modifyBox(marginA, value);
                            ++expand;
                        }
                        else {
                            result[posA] = value;
                        }
                    }
                    if (hasB) {
                        if (!hasA || !hasDimension) {
                            const value = parent.getAbsolutePaddingOffset(paddingB, this[posB]);
                            if (modifyAnchor) {
                                this.anchor(posB, 'parent');
                                this.modifyBox(marginB, value);
                                ++expand;
                            }
                            else {
                                result[posB] = value;
                            }
                        }
                    }
                    if (modifyAnchor) {
                        switch (expand) {
                            case 0:
                                if (horizontal) {
                                    if (this.centerAligned) {
                                        this.anchorParent('horizontal', 0.5);
                                    }
                                    else if (this.rightAligned) {
                                        if (this.blockStatic) {
                                            this.anchorParent('horizontal', 1);
                                        }
                                        else {
                                            this.anchor('right', 'parent');
                                        }
                                    }
                                }
                                break;
                            case 2:
                                if (!hasDimension && !(autoMargin[orientation] && !autoMargin[posA] && !autoMargin[posB])) {
                                    if (horizontal) {
                                        this.setLayoutWidth(this.getMatchConstraint(parent));
                                    }
                                    else {
                                        this.setLayoutHeight('0px');
                                    }
                                    if (parent.innerMostWrapped.documentBody) {
                                        const options: HasOptions = {
                                            type: CSS_UNIT.LENGTH | CSS_UNIT.PERCENT,
                                            not: '100%'
                                        };
                                        do {
                                            if (!parent.has(dimension, options) && !parent.has(horizontal ? 'maxWidth' : 'maxHeight', options)) {
                                                if (horizontal) {
                                                    parent.setLayoutWidth('match_parent', parent.inlineWidth);
                                                }
                                                else {
                                                    parent.setLayoutHeight('match_parent', parent.inlineWidth);
                                                }
                                                parent = parent.outerWrapper as T;
                                            }
                                            else {
                                                break;
                                            }
                                        }
                                        while (parent);
                                    }
                                }
                                break;
                        }
                    }
                }
            }
            return result;
        }

        public isUnstyled(checkMargin = true) {
            return this.contentBoxWidth === 0 && this.contentBoxHeight === 0 && this.css('verticalAlign') === 'baseline' && !this.hasAlign(NODE_ALIGNMENT.WRAPPER) && (!checkMargin || !this.blockStatic && this.marginTop === 0 && this.marginBottom === 0) && !this.visibleStyle.background && !this.positionRelative && !this.hasWidth && !this.hasHeight && !this.has('maxWidth') && !this.has('maxHeight') && this.css('whiteSpace') !== 'nowrap';
        }

        public getHorizontalBias(rect: BoxRect = this.documentParent.box) {
            const { left, right } = rect;
            return calculateBias(Math.max(0, this.actualRect('left', 'bounds') - left), Math.max(0, right - this.actualRect('right', 'bounds')), this.localSettings.floatPrecision);
        }

        public getVerticalBias(rect: BoxRect = this.documentParent.box) {
            const { top, bottom } = rect;
            return calculateBias(Math.max(0, this.actualRect('top', 'bounds') - top), Math.max(0, bottom - this.actualRect('bottom', 'bounds')), this.localSettings.floatPrecision);
        }

        public getAbsolutePaddingOffset(region: number, value: number) {
            if (value > 0) {
                if (this.documentBody) {
                    switch (region) {
                        case BOX_STANDARD.PADDING_TOP:
                            if (!this.getBox(BOX_STANDARD.MARGIN_TOP)[0]) {
                                value -= this.marginTop;
                            }
                            break;
                        case BOX_STANDARD.PADDING_RIGHT:
                            value -= this.marginRight;
                            break;
                        case BOX_STANDARD.PADDING_BOTTOM:
                            if (!this.getBox(BOX_STANDARD.MARGIN_BOTTOM)[0]) {
                                value -= this.marginBottom;
                            }
                            break;
                        case BOX_STANDARD.PADDING_LEFT:
                            value -= this.marginLeft;
                            break;
                    }
                }
                if (!this.getBox(region)[0]) {
                    switch (region) {
                        case BOX_STANDARD.PADDING_TOP:
                            value += this.borderTopWidth - this.paddingTop;
                            break;
                        case BOX_STANDARD.PADDING_RIGHT:
                            value += this.borderRightWidth - this.paddingRight;
                            break;
                        case BOX_STANDARD.PADDING_BOTTOM:
                            value += this.borderBottomWidth - this.paddingBottom;
                            break;
                        case BOX_STANDARD.PADDING_LEFT:
                            value += this.borderLeftWidth - this.paddingLeft;
                            break;
                    }
                }
                return Math.max(value, 0);
            }
            else if (value < 0) {
                switch (region) {
                    case BOX_STANDARD.PADDING_TOP:
                        value += this.marginTop;
                        break;
                    case BOX_STANDARD.PADDING_RIGHT:
                        value += this.marginRight;
                        break;
                    case BOX_STANDARD.PADDING_BOTTOM:
                        value += this.marginBottom;
                        break;
                    case BOX_STANDARD.PADDING_LEFT:
                        value += this.marginLeft;
                        break;
                }
                return value;
            }
            return 0;
        }

        public setLayoutWidth(value: string, overwrite = true) {
            this.android('layout_width', value, overwrite);
        }

        public setLayoutHeight(value: string, overwrite = true) {
            this.android('layout_height', value, overwrite);
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

        get imageElement() {
            switch (this.tagName) {
                case 'IMG':
                case 'CANVAS':
                    return true;
            }
            return false;
        }

        get imageContainer() {
            return this._containerType === CONTAINER_NODE.IMAGE || this.imageElement || this.svgElement;
        }

        set containerType(value) {
            this._containerType = value;
        }
        get containerType() {
            const result = this._containerType;
            if (result === 0) {
                const value: Undef<number> = CONTAINER_ELEMENT[this.containerName];
                if (value) {
                    return this._containerType = value;
                }
            }
            return result;
        }

        set controlId(value) {
            this._controlId = value;
        }
        get controlId() {
            const result = this._controlId;
            if (!result) {
                const controlName = this.controlName;
                if (controlName) {
                    let name: Undef<string>;
                    if (this.styleElement) {
                        const value = this.elementId.trim() || getNamedItem(this.element as HTMLElement, 'name');
                        if (value) {
                            name = value === 'parent' || RESERVED_JAVA.includes(value) ? '_' + value : value.replace(REGEXP_CONTROLID, '_');
                        }
                    }
                    return this._controlId = convertWord(Resource.generateId(this.localSettings.resourceId, 'android', name || fromLastIndexOf(controlName, '.').toLowerCase(), name ? 0 : 1));
                }
                else if (this.id <= 0) {
                    return this._controlId = 'baseroot' + (this.id === 0 ? '' : '_' + Math.abs(this.id));
                }
            }
            return result;
        }

        get documentId() {
            const controlId = this.controlId;
            return controlId && `@id/${controlId}`;
        }

        get support() {
            let result = this._cache.support;
            if (result === undefined) {
                result = {
                    positionTranslation: this.layoutConstraint,
                    positionRelative: this.layoutRelative,
                    maxDimension: this.textElement || this.imageContainer
                };
                if (this.containerType !== 0) {
                    this._cache.support = result;
                }
            }
            return result;
        }

        set renderExclude(value) {
            this._cache.renderExclude = value;
        }
        get renderExclude(): boolean {
            let result = this._cache.renderExclude;
            if (result === undefined) {
                if (this.naturalChild && !this.positioned) {
                    const excludeHorizontal = (node: T) => node.bounds.width === 0 && node.contentBoxWidth === 0 && node.marginLeft === 0 && node.marginRight === 0 && !node.visibleStyle.background;
                    const excludeVertical = (node: T) => node.bounds.height === 0 && node.contentBoxHeight === 0 && (node.marginTop === 0 && node.marginBottom === 0 || node.cssValue('overflowY') === 'hidden');
                    if (this.plainText) {
                        result = this.bounds.height === 0;
                    }
                    else if (!this.pageFlow) {
                        result = this.isEmpty() && (excludeHorizontal(this) || excludeVertical(this)) || /^rect\(0[a-z]*, 0[a-z]*, 0[a-z]*, 0[a-z]*\)$/.test(this.cssValue('clip'));
                    }
                    else {
                        const parent = this.renderParent || this.parent as T;
                        if (!parent.hasAlign(NODE_ALIGNMENT.AUTO_LAYOUT)) {
                            if (this.pseudoElement) {
                                result = parent.layoutConstraint && (excludeHorizontal(this) || excludeVertical(this)) && parent.every((item: T) => {
                                    if (item === this || !item.pageFlow) {
                                        return true;
                                    }
                                    else if (item.pseudoElement) {
                                        return excludeHorizontal(item) || excludeVertical(item);
                                    }
                                    return item.renderExclude;
                                });
                            }
                            else if (this.isEmpty() && !this.imageContainer && (!this.textElement || this.textEmpty)) {
                                if (parent.layoutFrame) {
                                    result = excludeHorizontal(this) || excludeVertical(this);
                                }
                                else if (parent.layoutVertical) {
                                    result = excludeVertical(this);
                                }
                                else if (!parent.layoutGrid) {
                                    result = excludeHorizontal(this) && (parent.layoutHorizontal || excludeVertical(this));
                                }
                            }
                        }
                    }
                }
                return this._cache.renderExclude = !!result;
            }
            return result;
        }

        get baselineHeight() {
            let result = this._cache.baselineHeight;
            if (result === undefined) {
                if (this.plainText) {
                    const { height, numberOfLines } = this.bounds;
                    result = height / (numberOfLines || 1);
                }
                else {
                    if (this.multiline && this.cssTry('whiteSpace', 'nowrap')) {
                        const bounds = this.boundingClientRect;
                        result = bounds ? bounds.height : this.bounds.height;
                        this.cssFinally('whiteSpace');
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
                            case CONTAINER_TAGNAME.RADIO:
                            case CONTAINER_TAGNAME.CHECKBOX:
                                result += 8;
                                break;
                            case CONTAINER_TAGNAME.SELECT:
                                result /= this.toElementInt('size') || 1;
                                result += 4;
                                break;
                            default:
                                result += Math.max(-this.verticalAlign, 0);
                                break;
                        }
                    }
                    result += this.marginBottom + this.getBox(BOX_STANDARD.MARGIN_TOP)[1];
                }
                this._cache.baselineHeight = result;
            }
            return result;
        }

        get innerWrapped() {
            return this._innerWrapped;
        }
        set innerWrapped(value) {
            if (!this.naturalChild && value) {
                value = value.outerMostWrapper as T;
                this._innerWrapped = value;
                value.outerWrapper = this;
            }
        }

        get anchorTarget(): T {
            let target = this as T;
            do {
                const renderParent = target.renderParent as Null<T>;
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
            this._anchored = value;
        }
        get anchored() {
            return this._anchored ||= this.constraint.horizontal && this.constraint.vertical;
        }

        get constraint() {
            return this._constraint ||= { horizontal: false, vertical: false, current: {} };
        }

        get layoutFrame() {
            switch (this._containerType) {
                case CONTAINER_NODE.FRAME:
                case CONTAINER_NODE.FRAGMENT:
                    return true;
            }
            return false;
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
            return this._namespaces.android!.layout_width || '';
        }

        get layoutHeight() {
            return this._namespaces.android!.layout_height || '';
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
            return this.layoutWidth === '0px' && hasFlexibleContainer(this.renderParent);
        }
        get flexibleHeight(): boolean {
            return this.layoutHeight === '0px' && hasFlexibleContainer(this.renderParent);
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

        set positioned(value) {
            this._positioned = value;
        }
        get positioned() {
            return this._positioned || !!this.target;
        }

        get watch() {
            if (this.naturalElement) {
                return parseWatchInterval((this.element as HTMLElement).dataset.androidWatch);
            }
        }

        get tasks() {
            if (this.naturalElement) {
                return parseTask((this.element as HTMLElement).dataset.androidTasks);
            }
        }

        get target() {
            const target = this.dataset.androidTarget;
            return target ? document.getElementById(target) : null;
        }
    };
};