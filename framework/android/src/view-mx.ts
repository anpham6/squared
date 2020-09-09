import BOX_STANDARD = squared.base.BOX_STANDARD;
import NODE_ALIGNMENT = squared.base.NODE_ALIGNMENT;
import BUILD_ANDROID = android.base.BUILD_ANDROID;
import STRING_ANDROID = android.base.STRING_ANDROID;
import CSS_UNIT = squared.lib.constant.CSS_UNIT;

import { CONTAINER_ANDROID, CONTAINER_ANDROID_X, CONTAINER_NODE, ELEMENT_ANDROID, LAYOUT_ANDROID, RESERVED_JAVA } from './lib/constant';
import { API_ANDROID, DEPRECATED_ANDROID } from './lib/customization';

import Resource from './resource';

import ResourceUI = squared.base.ResourceUI;

import { concatString, getDataSet, isHorizontalAlign, isVerticalAlign, localizeString } from './lib/util';

type T = android.base.View;

const { NODE_PROCEDURE } = squared.base.lib.constant;

const { CSS_PROPERTIES, formatPX, isLength, isPercent, parseTransform } = squared.lib.css;
const { getNamedItem, getRangeClientRect } = squared.lib.dom;
const { clamp, truncate } = squared.lib.math;
const { capitalize, convertInt, convertWord, fromLastIndexOf, hasKeys, isString, replaceMap, splitPair } = squared.lib.util;

const BOX_MARGIN = CSS_PROPERTIES.margin.value as string[];
const BOX_PADDING = CSS_PROPERTIES.padding.value as string[];

const {
    constraint: LAYOUT_CONSTRAINT,
    relative: LAYOUT_RELATIVE,
    relativeParent: LAYOUT_RELATIVE_PARENT } = LAYOUT_ANDROID;

const OPTIONS_LINEHEIGHT: StringMap = {
    'height': 'auto',
    'min-height': 'auto',
    'line-height': 'normal',
    'white-space': 'nowrap'
};

function checkTextAlign(value: string, ignoreStart?: boolean) {
    switch (value) {
        case 'left':
        case 'start':
            return !ignoreStart ? value : '';
        case 'center':
            return 'center_horizontal';
        case 'justify':
        case 'initial':
            return !ignoreStart ? 'start' : '';
        default:
            return value;
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

function setMultiline(node: T, lineHeight: number, overwrite: boolean) {
    const lineHeightAdjust = node.dataset.androidLineHeightAdjust;
    if (lineHeightAdjust !== 'false') {
        let offset = getLineSpacingExtra(node, lineHeight);
        lineHeight *= lineHeightAdjust && parseFloat(lineHeightAdjust) || node.localSettings.lineHeightAdjust;
        if (node.api >= BUILD_ANDROID.PIE) {
            node.android('lineHeight', truncate(lineHeight, node.localSettings.floatPrecision) + 'px', overwrite);
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
                    const renderChildren = node.renderParent!.renderChildren;
                    const index = renderChildren.findIndex(item => item === node);
                    if (index > 0 && offset > Math.max(node.marginTop, 0) + node.borderTopWidth) {
                        node.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1, adjustment: offset, max: true });
                    }
                    if ((node.blockStatic || index === renderChildren.length - 1) && offset > Math.max(node.marginBottom, 0)+ node.borderBottomWidth) {
                        node.setBox(BOX_STANDARD.MARGIN_BOTTOM, { reset: 1, adjustment: offset, max: true });
                    }
                }
            }
        }
    }
}

function setLineHeight(node: T, lineHeight: number, inlineStyle: boolean, top: boolean, bottom: boolean, overwrite?: boolean, parent?: T) {
    if (lineHeight === 0 || node.imageContainer || node.rendering && !overwrite || node.cssInitial('lineHeight') === 'normal') {
        return;
    }
    if (node.multiline) {
        setMultiline(node, lineHeight, false);
    }
    else {
        const height = node.height;
        if (lineHeight === height) {
            node.mergeGravity('gravity', 'center_vertical', false);
        }
        else {
            const setBoxPadding = (offset: number, padding?: boolean) => {
                if (offset > 0) {
                    if (!node.inline && (inlineStyle || height > lineHeight) && (node.styleText || padding) && !(node.inputElement && !isLength(node.cssInitial('lineHeight'), true)) || parent) {
                        if (top) {
                            let adjustment = offset;
                            if (parent) {
                                adjustment -= parent.paddingTop;
                            }
                            adjustment = Math.round(adjustment - (!padding ? node.paddingTop : 0));
                            if (adjustment > 0) {
                                (parent || node).setBox(BOX_STANDARD.PADDING_TOP, { adjustment });
                            }
                        }
                        if (bottom) {
                            if (parent) {
                                offset -= parent.paddingBottom;
                            }
                            offset = Math.round(offset - (!padding ? node.paddingBottom : 0));
                            if (offset > 0) {
                                (parent || node).setBox(BOX_STANDARD.PADDING_BOTTOM, { adjustment: offset });
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
                        if (bottom) {
                            offset = Math.floor(offset - node.paddingBottom - node.borderBottomWidth - Math.max(0, node.marginBottom + node.getBox(BOX_STANDARD.MARGIN_BOTTOM)[1]));
                            if (offset > 0) {
                                node.setBox(BOX_STANDARD.MARGIN_BOTTOM, { adjustment: offset });
                            }
                        }
                    }
                }
            };
            if (node.textElement) {
                setBoxPadding(getLineSpacingExtra(node, lineHeight));
            }
            else if (height) {
                const offset = (lineHeight / 2) - node.paddingTop;
                if (offset > 0) {
                    node.modifyBox(BOX_STANDARD.PADDING_TOP, offset);
                }
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
                    setBoxPadding((lineHeight - textHeight * Math.max(rows, 1)) / 2, true);
                }
            }
            else {
                setBoxPadding((lineHeight - node.bounds.height) / 2);
            }
        }
    }
}

function getLineHeight(node: T, lineHeight: number, checkOnly?: boolean) {
    if (!node.rendering && (!node.multiline || node.lineHeight === 0 && node.android('lineHeight') === '')) {
        const result = node.has('lineHeight') ? Math.max(node.lineHeight, lineHeight) : lineHeight;
        if (!checkOnly) {
            node.setCacheValue('lineHeight', 0);
        }
        return result;
    }
    return 0;
}

function getLineSpacingExtra(node: T, lineHeight: number) {
    let height = node.data<number>(ResourceUI.KEY_NAME, 'textRange');
    if (!height) {
        if (node.plainText) {
            if (node.naturalChild) {
                height = node.bounds.height / (node.bounds.numberOfLines || 1);
            }
            else {
                height = node.actualTextHeight();
                node.data<number>(ResourceUI.KEY_NAME, 'textRange', height);
            }
        }
    }
    if (!height && node.styleText) {
        node.cssTryAll(!node.pseudoElement ? OPTIONS_LINEHEIGHT : { ...OPTIONS_LINEHEIGHT, display: 'inline-block' }, function(this: T) { height = getRangeClientRect(this.element!)?.height; });
    }
    return height ? (lineHeight - height) / 2 : 0;
}

function constraintMinMax(node: T, horizontal: boolean) {
    if (!node.hasPX(horizontal ? 'width' : 'height', { percent: false })) {
        const minWH = node.cssInitial(horizontal ? 'minWidth' : 'minHeight', { modified: true });
        if (minWH !== '' && minWH !== '100%' && parseFloat(minWH) > 0 && isLength(minWH, true)) {
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
    if (horizontal || !node.support.maxDimension) {
        const maxWH = node.cssInitial(horizontal ? 'maxWidth' : 'maxHeight', { modified: true });
        if (maxWH !== '' && maxWH !== '100%' && isLength(maxWH, true)) {
            if (horizontal) {
                if (ascendFlexibleWidth(node)) {
                    const value = node.parseWidth(maxWH);
                    if (value > node.width || node.percentWidth) {
                        node.setLayoutWidth('0px');
                        node.app('layout_constraintWidth_max', formatPX(value + (node.contentBox ? node.contentBoxWidth : 0)));
                        node.css('maxWidth', 'auto');
                    }
                }
            }
            else if (ascendFlexibleHeight(node)) {
                const value = node.parseHeight(maxWH);
                if (value > node.height || node.percentHeight) {
                    node.setLayoutHeight('0px');
                    node.app('layout_constraintHeight_max', formatPX(value + (node.contentBox ? node.contentBoxHeight : 0)));
                    node.css('maxHeight', 'auto');
                }
            }
        }
    }
}

function setConstraintPercent(node: T, value: number, horizontal: boolean, percent: number) {
    if (value < 1 && !isNaN(percent) && node.pageFlow) {
        const parent = node.actualParent || node.documentParent;
        let boxPercent: number,
            marginPercent: number;
        if (horizontal) {
            const width = parent.box.width;
            boxPercent = !parent.gridElement ? node.contentBoxWidth / width : 0;
            marginPercent = (Math.max(node.getBox(BOX_STANDARD.MARGIN_LEFT)[0] === 0 ? node.marginLeft : 0, 0) + (node.getBox(BOX_STANDARD.MARGIN_RIGHT)[0] === 0 ? node.marginRight : 0)) / width;
        }
        else {
            const height = parent.box.height;
            boxPercent = !parent.gridElement ? node.contentBoxHeight / height : 0;
            marginPercent = (Math.max(node.getBox(BOX_STANDARD.MARGIN_TOP)[0] === 0 ? node.marginTop : 0, 0) + (node.getBox(BOX_STANDARD.MARGIN_BOTTOM)[0] === 0 ? node.marginBottom : 0)) / height;
        }
        if (percent === 1 && value + marginPercent >= 1) {
            value = 1 - marginPercent;
        }
        else {
            if (boxPercent) {
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
    let outerWrapper = node.outerMostWrapper as T;
    if (outerWrapper !== node && outerWrapper.css(horizontal ? 'width' : 'height') !== node.css(horizontal ? 'width' : 'height')) {
        outerWrapper = node;
    }
    if (value === 1 && !node.hasPX(horizontal ? 'maxWidth' : 'maxHeight')) {
        setLayoutDimension(outerWrapper, horizontal ? outerWrapper.getMatchConstraint() : 'match_parent', horizontal, false);
        if (node !== outerWrapper) {
            setLayoutDimension(node, horizontal ? node.getMatchConstraint() : 'match_parent', horizontal, false);
        }
    }
    else {
        outerWrapper.app(horizontal ? 'layout_constraintWidth_percent' : 'layout_constraintHeight_percent', truncate(value, node.localSettings.floatPrecision));
        setLayoutDimension(outerWrapper, '0px', horizontal, false);
        if (node !== outerWrapper) {
            setLayoutDimension(node, '0px', horizontal, false);
        }
    }
    return percent;
}

function constraintPercentValue(node: T, horizontal: boolean, percent: number) {
    const value = horizontal ? node.percentWidth : node.percentHeight;
    return value ? setConstraintPercent(node, value, horizontal, percent) : percent;
}

function constraintPercentWidth(node: T, percent = 1) {
    const value = node.percentWidth;
    if (value) {
        if (node.renderParent!.hasPX('width', { percent: false }) && !(node.actualParent || node.documentParent).layoutElement) {
            if (value < 1) {
                node.setLayoutWidth(formatPX(node.actualWidth));
            }
            else {
                node.setLayoutWidth(node.getMatchConstraint(), false);
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
    if (value) {
        if (node.renderParent!.hasPX('height', { percent: false }) && !(node.actualParent || node.documentParent).layoutElement) {
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
    let parent = node.renderParent as Undef<T>,
        i = 0;
    while (parent) {
        if (!parent.inlineWidth && (parent.hasWidth || parseInt(parent.layoutWidth) || parent.of(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.BLOCK) || parent.documentRoot && (parent.blockWidth || parent.blockStatic))) {
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
        parent = parent.renderParent as Undef<T>;
    }
    return false;
}

function ascendFlexibleHeight(node: T) {
    if (node.documentRoot && node.hasHeight) {
        return true;
    }
    const parent = node.renderParent as Undef<T>;
    return parent && (parent.hasHeight || parent.layoutConstraint && parent.blockHeight) || node.absoluteParent?.hasHeight;
}

function setLayoutDimension(node: T, value: string, horizontal: boolean, overwrite: boolean) {
    if (horizontal) {
        node.setLayoutWidth(value, overwrite);
    }
    else {
        node.setLayoutHeight(value, overwrite);
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
    if (gravity !== '') {
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
    return parseFloat(truncate(Math.max(start / (start + end), 0), accuracy));
}

const hasFlexibleContainer = (renderParent: Null<T>) => !!renderParent && (renderParent.layoutConstraint || renderParent.layoutGrid);

export default (Base: Constructor<squared.base.NodeUI>) => {
    return class View extends Base implements android.base.View {
        public static availablePercent(nodes: T[], dimension: DimensionAttr, boxSize: number) {
            const horizontal = dimension === 'width';
            let percent = 1,
                valid = false;
            for (let i = 0, length = nodes.length; i < length; ++i) {
                const sibling = nodes[i].innerMostWrapped;
                if (sibling.pageFlow) {
                    valid = true;
                    if (sibling.hasPX(dimension, { initial: true })) {
                        const value = sibling.cssInitial(dimension);
                        if (isPercent(value)) {
                            percent -= parseFloat(value) / 100;
                            continue;
                        }
                        else if (isLength(value)) {
                            if (horizontal) {
                                percent -= Math.max(sibling.actualWidth + sibling.marginLeft + sibling.marginRight, 0) / boxSize;
                            }
                            else {
                                percent -= Math.max(sibling.actualHeight + sibling.marginTop + sibling.marginBottom, 0) / boxSize;
                            }
                            continue;
                        }
                    }
                    percent -= sibling.linear[dimension] / boxSize;
                }
            }
            return valid ? Math.max(0, percent) : 1;
        }

        public static getControlName(containerType: number, api = BUILD_ANDROID.LATEST) {
            const name = CONTAINER_NODE[containerType];
            return api >= BUILD_ANDROID.Q && CONTAINER_ANDROID_X[name] as string || CONTAINER_ANDROID[name] as string || '';
        }

        public api = BUILD_ANDROID.LATEST;
        public renderChildren!: T[];
        public renderParent!: Null<T>;
        public horizontalRows?: T[][];

        protected _namespaces: ObjectMap<StringMapChecked> = { android: {} };
        protected _containerType = 0;
        protected _controlName = '';
        protected _cache!: ICacheValueUI;
        protected _localSettings!: ILocalSettingsUI;
        protected _boxReset?: number[];
        protected _boxAdjustment?: number[];
        protected _documentParent?: T;
        protected _innerWrapped?: T;

        private _positioned = false;
        private _controlId?: string;
        private _labelFor?: T;
        private _constraint?: Constraint;
        private _anchored?: boolean;

        public setControlType(controlName: string, containerType?: number) {
            this.controlName = controlName;
            if (containerType) {
                this._containerType = containerType;
            }
            else if (this._containerType === 0) {
                this._containerType = CONTAINER_NODE.UNKNOWN;
            }
        }

        public setExclusions() {
            super.setExclusions();
            if (!this.hasProcedure(NODE_PROCEDURE.LOCALIZATION)) {
                this.localSettings.supportRTL = false;
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
            const actualParent = this.actualParent || this.documentParent;
            const renderParent = this.renderParent as T;
            const containsWidth = !renderParent.inlineWidth;
            const containsHeight = !renderParent.inlineHeight;
            let { layoutWidth, layoutHeight } = this;
            if (layoutWidth === '') {
                if (this.hasPX('width') && (!this.inlineStatic || this.cssInitial('width') === '')) {
                    const width = this.css('width');
                    let value = -1;
                    if (isPercent(width)) {
                        const expandable = () => width === '100%' && containsWidth && (this.support.maxDimension || !this.hasPX('maxWidth'));
                        if (this.inputElement) {
                            if (expandable()) {
                                layoutWidth = this.getMatchConstraint(renderParent);
                            }
                            else {
                                value = this.actualWidth;
                            }
                        }
                        else if (renderParent.layoutConstraint) {
                            if (containsWidth) {
                                if (expandable()) {
                                    layoutWidth = this.getMatchConstraint(renderParent);
                                }
                                else {
                                    this.setConstraintDimension(1);
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
                                layoutWidth = this.getMatchConstraint(renderParent);
                            }
                            else {
                                value = this.bounds.width;
                            }
                        }
                        else if (width === '100%') {
                            if (!this.support.maxDimension && this.hasPX('maxWidth')) {
                                const maxWidth = this.css('maxWidth');
                                const maxValue = this.parseWidth(maxWidth);
                                const absoluteParent = this.absoluteParent || actualParent;
                                if (maxWidth === '100%') {
                                    if (containsWidth && Math.ceil(maxValue) >= absoluteParent.box.width) {
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
                                        layoutWidth = Math.floor(maxValue) < absoluteParent.box.width ? 'wrap_content' : this.getMatchConstraint(renderParent);
                                    }
                                }
                            }
                            if (layoutWidth === '' && (this.documentRoot || containsWidth)) {
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
                            const length = nodes.length;
                            if (length && maxWidth) {
                                const width = formatPX(maxWidth);
                                for (let i = 0; i < length; ++i) {
                                    const node = nodes[i];
                                    if (!node.hasPX('maxWidth')) {
                                        node.css('maxWidth', width);
                                    }
                                }
                            }
                            layoutWidth = 'wrap_content';
                            break;
                        }
                    }
                }
                if (layoutWidth === '') {
                    if (this.textElement && this.textEmpty && this.inlineFlow && !this.visibleStyle.backgroundImage) {
                        layoutWidth = formatPX(this.actualWidth);
                    }
                    else if (this.imageElement && this.hasHeight) {
                        layoutWidth = 'wrap_content';
                    }
                    else if (
                        containsWidth && (
                            this.nodeGroup && (this.hasAlign(NODE_ALIGNMENT.FLOAT) && (this.hasAlign(NODE_ALIGNMENT.BLOCK) || this.hasAlign(NODE_ALIGNMENT.RIGHT)) || this.hasAlign(NODE_ALIGNMENT.PERCENT)) ||
                            actualParent.flexElement && this.find(item => item.multiline, { cascade: true }) ||
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
                                const multiline = (this.textBounds?.numberOfLines as number) > 1;
                                if (multiline) {
                                    if (block) {
                                        layoutWidth = 'match_parent';
                                    }
                                    return;
                                }
                                else if (this.cssTry('display', 'inline-block')) {
                                    const width = Math.ceil(getRangeClientRect(this.element!)?.width || 0);
                                    layoutWidth = width >= actualParent.box.width ? 'wrap_content' : 'match_parent';
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
                            else if (containsWidth && (actualParent.gridElement && !renderParent.layoutElement || actualParent.flexElement && this.layoutVertical && this.find(item => item.textElement && item.multiline))) {
                                layoutWidth = this.getMatchConstraint(renderParent);
                            }
                        }
                        else if (this.floating && this.block && !this.rightAligned && this.alignParent('left') && this.alignParent('right')) {
                            layoutWidth = 'match_parent';
                        }
                        else if (this.naturalElement && this.inlineStatic && !this.blockDimension && this.find(item => item.naturalElement && item.blockStatic) && !actualParent.layoutElement && (renderParent.layoutVertical || this.alignSibling('leftRight') === '' && this.alignSibling('rightLeft') === '')) {
                            checkParentWidth(false);
                        }
                    }
                }
                this.setLayoutWidth(layoutWidth || 'wrap_content');
            }
            if (layoutHeight === '') {
                if (this.hasPX('height') && (!this.inlineStatic || this.cssInitial('height') === '')) {
                    const height = this.css('height');
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
                                const maxHeight = this.css('maxHeight');
                                const maxValue = this.parseHeight(maxHeight);
                                const absoluteParent = this.absoluteParent || actualParent;
                                if (maxHeight === '100%') {
                                    if (containsHeight || Math.ceil(maxValue) >= absoluteParent.box.height) {
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
                                        layoutHeight = Math.floor(maxValue) < absoluteParent.box.height ? 'wrap_content' : 'match_parent';
                                    }
                                }
                                else if (containsHeight) {
                                    layoutHeight = 'match_parent';
                                }
                            }
                            if (layoutHeight === '') {
                                if (!this.pageFlow) {
                                    if (this.css('position') === 'fixed') {
                                        layoutHeight = 'match_parent';
                                    }
                                    else if (renderParent.layoutConstraint && (this.hasPX('top') || this.hasPX('bottom'))) {
                                        layoutHeight = '0px';
                                    }
                                }
                                else if (this.documentRoot || containsHeight && this.onlyChild) {
                                    layoutHeight = 'match_parent';
                                }
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
                        if (this.is(CONTAINER_NODE.LINE) && this.tagName !== 'HR' && this.hasPX('height', { initial: true })) {
                            value += this.borderTopWidth + this.borderBottomWidth;
                        }
                        if (this.styleText && this.multiline && !this.overflowY && !this.hasPX('minHeight') && !actualParent.layoutElement) {
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
            else if (layoutHeight === '0px' && renderParent.inlineHeight && !(this.alignParent('top') && this.alignParent('bottom')) && renderParent.android('minHeight') === '' && !actualParent.layoutElement && actualParent === this.absoluteParent) {
                this.setLayoutHeight('wrap_content');
            }
            if (this.hasPX('minWidth') && (!this.hasFlex('row') || actualParent.flexElement && !this.flexibleWidth)) {
                const minWidth = this.css('minWidth');
                if (minWidth === '100%' && this.inlineWidth) {
                    this.setLayoutWidth(this.getMatchConstraint(renderParent));
                }
                else {
                    const width = this.parseWidth(minWidth) + (this.contentBox ? this.contentBoxWidth : 0);
                    if (width) {
                        this.android('minWidth', formatPX(width), false);
                    }
                }
            }
            if (this.hasPX('minHeight') && this.display !== 'table-cell' && (!this.hasFlex('column') || actualParent.flexElement && !this.flexibleHeight)) {
                const minHeight = this.css('minHeight');
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
                const maxWidth = this.css('maxWidth');
                let maxHeight = this.css('maxHeight'),
                    width = -1;
                if (isLength(maxWidth, true)) {
                    if (maxWidth === '100%') {
                        if (!this.hasPX('width', { initial: true })) {
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
                        width = this.parseWidth(maxWidth);
                    }
                }
                else if (!this.pageFlow && this.multiline && this.inlineWidth && !this.preserveWhiteSpace && (this.ascend({ condition: item => item.hasPX('width') }).length || !this.textContent.includes('\n'))) {
                    const maxLines = this.textBounds?.numberOfLines || 1;
                    if (maxLines > 1) {
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
                        if (!this.hasPX('height', { initial: true })) {
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
            const outerRenderParent = (node.renderParent || renderParent) as T;
            const autoMargin = this.autoMargin;
            const setAutoMargin = (target: T) => {
                if (autoMargin.horizontal && (!target.blockWidth || target.hasWidth || target.hasPX('maxWidth') || target.innerMostWrapped.has('width', { type: CSS_UNIT.PERCENT, not: '100%' }))) {
                    target.mergeGravity(
                        (target.blockWidth || !target.pageFlow) && !target.outerWrapper ? 'gravity' : 'layout_gravity',
                        autoMargin.leftRight ? 'center_horizontal' : autoMargin.left ? 'right' : 'left'
                    );
                    return true;
                }
                return false;
            };
            let textAlign = checkTextAlign(this.cssInitial('textAlign', { modified: true })),
                textAutoMargin: Undef<boolean>;
            if (this.nodeGroup && textAlign === '' && !this.hasAlign(NODE_ALIGNMENT.FLOAT)) {
                const actualParent = this.actualParent;
                if (actualParent) {
                    textAlign = checkTextAlign(actualParent.cssInitial('textAlign', { modified: true }));
                }
            }
            if (this.pageFlow) {
                let floatAlign = '';
                if (this.inlineVertical && (outerRenderParent.layoutFrame || outerRenderParent.layoutGrid) || this.display === 'table-cell') {
                    const gravity = this.display === 'table-cell' ? 'gravity' : 'layout_gravity';
                    switch (this.cssInitial('verticalAlign', { modified: true })) {
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
                        else if (!setAutoMargin(node) && textAlign && this.hasWidth && !this.blockStatic && !this.inputElement && this.display !== 'table') {
                            node.mergeGravity('layout_gravity', textAlign, false);
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
                                floatAlign = this.float;
                            }
                            if (floatAlign && !renderParent.naturalElement && (renderParent.inlineWidth || !renderParent.documentRoot && this.onlyChild)) {
                                renderParent.mergeGravity('layout_gravity', floatAlign);
                                floatAlign = '';
                            }
                        }
                        if (this.centerAligned) {
                            this.mergeGravity('layout_gravity', checkTextAlign('center')!);
                        }
                        else if (this.rightAligned && renderParent.blockWidth) {
                            this.mergeGravity('layout_gravity', 'right');
                        }
                    }
                    if (this.onlyChild && node.documentParent.display === 'table-cell') {
                        let gravity: string;
                        switch (node.documentParent.css('verticalAlign')) {
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
                if (floatAlign !== '') {
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
                    textAutoMargin = !this.textElement;
                }
                else if (this.blockStatic && outerRenderParent.layoutVertical && (outerRenderParent.layoutLinear || outerRenderParent.layoutRelative)) {
                    node.mergeGravity('layout_gravity', 'left', false);
                }
            }
            if (this.layoutElement) {
                if (this.textElement) {
                    switch (this.css('justifyContent')) {
                        case 'center':
                        case 'space-around':
                        case 'space-evenly':
                            this.mergeGravity('gravity', 'center_horizontal');
                            break;
                        case 'flex-end':
                            this.mergeGravity('gravity', 'right');
                            break;
                    }
                    switch (this.css('alignItems')) {
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
                else if (!textAutoMargin && !this.inputElement) {
                    const textAlignParent = checkTextAlign(this.cssAscend('textAlign'), true);
                    if (textAlignParent !== '') {
                        if (this.imageContainer) {
                            if (this.pageFlow) {
                                this.mergeGravity('layout_gravity', textAlignParent);
                            }
                        }
                        else {
                            this.mergeGravity(this.rendering || this.textElement && (!this.inlineWidth || this.multiline) || this.display.startsWith('table-') ? 'gravity' : 'layout_gravity', textAlignParent);
                        }
                    }
                }
            }
            if (autoMargin.vertical && (renderParent.layoutFrame || renderParent.layoutVertical && renderParent.layoutLinear)) {
                node.mergeGravity('layout_gravity', autoMargin.topBottom ? 'center_vertical' : autoMargin.top ? 'bottom' : 'top');
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
                                    if (value < 0 && this.pageFlow && !this.blockStatic) {
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
                                    if (this.hasPX('height', { percent: false, initial: true }) && (!this.layoutElement && (this.layoutVertical || this.layoutFrame) || !this.pageFlow) || this.documentParent.gridElement && this.hasPX('height', { percent: false })) {
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
                if (margin) {
                    if (this.floating) {
                        let sibling = this.renderParent!.renderChildren.find(item => !item.floating) as Undef<T>;
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
                        case CONTAINER_ANDROID.RADIO:
                        case CONTAINER_ANDROID.CHECKBOX:
                            top = Math.max(top - 4, 0);
                            bottom = Math.max(bottom - 4, 0);
                            break;
                        case CONTAINER_ANDROID.SELECT:
                            top = Math.max(top - 2, 0);
                            bottom = Math.max(bottom - 2, 0);
                            break;
                    }
                    if (top < 0) {
                        if (!this.pageFlow) {
                            if (bottom >= 0 && this.leftTopAxis && (this.hasPX('top') || !this.hasPX('bottom')) && this.translateY(top)) {
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
                            if (top >= 0 && this.leftTopAxis && this.hasPX('bottom') && !this.hasPX('top') && this.translateY(-bottom)) {
                                bottom = 0;
                            }
                        }
                        else if (this.blockDimension && !this.inputElement && (this.renderParent as T).layoutConstraint) {
                            for (const item of this.anchorChain('bottom')) {
                                item.translateY(-bottom);
                            }
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
                            if (left >= 0 && this.leftTopAxis && this.hasPX('right') && !this.hasPX('left') && this.translateX(-right)) {
                                right = 0;
                            }
                        }
                        else if (this.rightAligned) {
                            if (this.translateX(-right)) {
                                right = 0;
                            }
                        }
                        else if (this.blockDimension && (this.renderParent as T).layoutConstraint) {
                            for (const item of this.anchorChain('right')) {
                                item.translateX(right);
                            }
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
                    let horizontal = NaN,
                        vertical = NaN;
                    top = Math.round(top);
                    right = Math.round(right);
                    bottom = Math.round(bottom);
                    left = Math.round(left);
                    if ((!margin || !(this.renderParent as T).layoutGrid) && this.api >= BUILD_ANDROID.OREO) {
                        if (top === right && right === bottom && bottom === left) {
                            if (top !== 0) {
                                this.android(margin ? STRING_ANDROID.MARGIN : STRING_ANDROID.PADDING, top + 'px');
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
                            this.android(margin ? STRING_ANDROID.MARGIN_HORIZONTAL : STRING_ANDROID.PADDING_HORIZONTAL, horizontal + 'px');
                        }
                    }
                    else {
                        if (left !== 0) {
                            this.android(this.localizeString(margin ? STRING_ANDROID.MARGIN_LEFT : STRING_ANDROID.PADDING_LEFT), left + 'px');
                        }
                        if (right !== 0) {
                            this.android(this.localizeString(margin ? STRING_ANDROID.MARGIN_RIGHT : STRING_ANDROID.PADDING_RIGHT), right + 'px');
                        }
                    }
                    if (!isNaN(vertical)) {
                        if (vertical !== 0) {
                            this.android(margin ? STRING_ANDROID.MARGIN_VERTICAL : STRING_ANDROID.PADDING_VERTICAL, vertical + 'px');
                        }
                    }
                    else {
                        if (top !== 0) {
                            this.android(margin ? STRING_ANDROID.MARGIN_TOP : STRING_ANDROID.PADDING_TOP, top + 'px');
                        }
                        if (bottom !== 0) {
                            this.android(margin ? STRING_ANDROID.MARGIN_BOTTOM : STRING_ANDROID.PADDING_BOTTOM, bottom + 'px');
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

        public clone(id: number, options?: ICloneOptions): T {
            let attributes: Undef<boolean>,
                position: Undef<boolean>;
            if (options) {
                ({ attributes, position } = options);
            }
            const newInstance = !isNaN(id);
            const node = new View(newInstance ? id : this.id, this.sessionId, this.element || undefined);
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
                    const obj: StringMap = this._namespaces[name];
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
                        if (name !== '') {
                            for (const values of dataset[namespace]!.split(';')) {
                                const [key, value] = splitPair(values, '::');
                                if (value) {
                                    this.attr(name, key, value);
                                }
                            }
                        }
                    }
                }
                if (!this.svgElement) {
                    const opacity = this.css('opacity');
                    if (opacity !== '1') {
                        this.android('alpha', opacity);
                    }
                }
            }
            const indent = '\n' + '\t'.repeat(depth);
            const items = this.combine();
            let output = '';
            for (let i = 0, length = items.length; i < length; ++i) {
                output += indent + items[i];
            }
            return output;
        }

        public alignParent(position: string) {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as Undef<T>;
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
            const renderParent = node.renderParent as Undef<T>;
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
                        break;
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
            const node = this.anchorTarget;
            const renderParent = node.renderParent as Undef<T>;
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
                    const box = renderParent.box;
                    const linear = this.linear;
                    if (linear.left + x < box.left) {
                        x = Math.max(linear.left - box.left, 0);
                    }
                    else if (linear.right + x > box.right) {
                        x = Math.max(box.right - linear.right, 0);
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

        public translateY(value: number, options?: TranslateOptions) {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as Undef<T>;
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
                    const box = renderParent.box;
                    const linear = this.linear;
                    if (linear.top + y < box.top) {
                        y = Math.max(linear.top - box.top, 0);
                    }
                    else if (linear.bottom + y > box.bottom) {
                        y = Math.max(box.bottom - linear.bottom, 0);
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

        public hasFlex(direction: FlowDirectionAttr) {
            const parent = this.actualParent;
            if (parent && parent.flexdata[direction]) {
                if (direction === 'column' && !parent.hasHeight) {
                    const grandParent = parent.actualParent;
                    if (grandParent) {
                        if (grandParent.flexElement && !grandParent.flexdata.column) {
                            if (!grandParent.hasHeight) {
                                let maxHeight = 0,
                                    parentHeight = 0;
                                for (const item of grandParent) {
                                    const height = (item.data<BoxRectDimension>(squared.base.EXT_NAME.FLEXBOX, 'boundsData') || item.bounds).height;
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
                return this.flexbox.grow > 0 || this.flexbox.shrink !== 1;
            }
            return false;
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

        public android(attr: string, value?: string, overwrite = true) {
            if (value) {
                value = this.attr('android', attr, value, overwrite);
                if (value !== '') {
                    return value;
                }
            }
            else if (value === '') {
                this.delete('android', attr);
                return '';
            }
            return this._namespaces['android']![attr] || '';
        }

        public app(attr: string, value?: string, overwrite = true) {
            if (value) {
                value = this.attr('app', attr, value, overwrite);
                if (value !== '') {
                    return value;
                }
            }
            else if (value === '') {
                this.delete('app', attr);
                return '';
            }
            return this._namespaces['app']![attr] || '';
        }

        public formatted(value: string, overwrite = true) {
            const match = /^(?:([a-z]+):)?(\w+)="((?:@\+?[a-z]+\/)?.+)"$/.exec(value);
            if (match) {
                this.attr(match[1] || '_', match[2], match[3], overwrite);
            }
        }

        public anchor(position: AnchorPositionAttr, documentId = '', overwrite?: boolean) {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as Undef<T>;
            if (renderParent && node.documentId !== documentId) {
                if (renderParent.layoutConstraint) {
                    if (documentId === '' || !node.constraint.current[position] || overwrite) {
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

        public anchorParent(orientation: OrientationAttr, bias?: number, style?: string, overwrite?: boolean) {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as Undef<T>;
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

        public anchorStyle(orientation: OrientationAttr, bias: number, style?: string, overwrite = true) {
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
            const renderParent = node.renderParent as Undef<T>;
            if (renderParent && (renderParent.layoutConstraint || renderParent.layoutRelative)) {
                let anchorA: string,
                    anchorB: string;
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
            const renderParent = node.renderParent as Undef<T>;
            if (renderParent) {
                if (renderParent.layoutConstraint) {
                    node.delete('app', ...replaceMap(position, value => this.localizeString(LAYOUT_CONSTRAINT[value])));
                }
                else if (renderParent.layoutRelative) {
                    const layout: string[] = [];
                    for (let i = 0, length = position.length; i < length; ++i) {
                        const value = position[i];
                        let attr: Undef<string> = LAYOUT_RELATIVE[value];
                        if (attr) {
                            layout.push(this.localizeString(attr));
                        }
                        attr = LAYOUT_RELATIVE_PARENT[value];
                        if (attr) {
                            layout.push(this.localizeString(attr));
                        }
                    }
                    node.delete('android', ...layout);
                }
            }
        }

        public anchorClear(update?: T | true) {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as Undef<T>;
            if (renderParent) {
                const transferLayoutAlignment = (replaceWith: T) => {
                    replaceWith.anchorClear();
                    for (const [name, item] of node.namespaces()) {
                        for (const attr in item) {
                            switch (attr) {
                                case 'layout_width':
                                case 'layout_height':
                                    continue;
                                default:
                                    if (attr.startsWith('layout_') && !attr.includes('margin')) {
                                        replaceWith.attr(name, attr, item[attr], true);
                                    }
                                    continue;
                            }
                        }
                    }
                };
                if (renderParent.layoutConstraint) {
                    if (update === true) {
                        replaceLayoutPosition(node, 'parent');
                    }
                    else if (update) {
                        transferLayoutAlignment(update);
                    }
                    node.anchorDelete(...Object.keys(LAYOUT_CONSTRAINT) as AnchorPositionAttr[]);
                    node.delete('app', 'layout_constraint*');
                }
                else if (renderParent.layoutRelative) {
                    if (update === true) {
                        replaceLayoutPosition(node, 'true');
                    }
                    else if (update) {
                        transferLayoutAlignment(update);
                    }
                    node.anchorDelete(...Object.keys(LAYOUT_RELATIVE_PARENT) as AnchorPositionAttr[]);
                    node.anchorDelete(...Object.keys(LAYOUT_RELATIVE) as AnchorPositionAttr[]);
                }
            }
        }

        public supported(attr: string, value: string, result: PlainObject): boolean {
            const api = this.api;
            if (DEPRECATED_ANDROID.android[attr]) {
                const valid = DEPRECATED_ANDROID.android[attr].call(this, result, api, value);
                if (!valid || hasKeys(result)) {
                    return valid;
                }
            }
            for (let i = api; i <= BUILD_ANDROID.LATEST; ++i) {
                const callback = API_ANDROID[i].android[attr];
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
            let id = '',
                requireId: Undef<boolean>;
            for (const name in this._namespaces) {
                if (all || objs.includes(name)) {
                    const obj = this._namespaces[name];
                    let prefix = name + ':';
                    switch (name) {
                        case 'android':
                            if (this.api < BUILD_ANDROID.LATEST) {
                                for (let attr in obj) {
                                    if (attr === 'id') {
                                        id = obj.id;
                                    }
                                    else {
                                        const data: ObjectMap<string | boolean> = {};
                                        let value = obj[attr];
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
                                        result.push(`${prefix + attr}="${value}"`);
                                    }
                                }
                            }
                            else {
                                for (const attr in obj) {
                                    if (attr === 'id') {
                                        id = obj.id;
                                    }
                                    else {
                                        result.push(`${prefix + attr}="${obj[attr]}"`);
                                    }
                                }
                            }
                            requireId = true;
                            break;
                        case '_':
                            prefix = '';
                        default:
                            for (const attr in obj) {
                                result.push(`${prefix + attr}="${obj[attr]}"`);
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

        public mergeGravity(attr: string, alignment: string, overwrite = true) {
            if (attr === 'layout_gravity') {
                const renderParent = this.renderParent;
                if (renderParent) {
                    if (renderParent.layoutRelative || isHorizontalAlign(alignment) && (this.blockWidth || renderParent.inlineWidth && this.onlyChild || !overwrite && this.outerWrapper && this.hasPX('maxWidth'))) {
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
                                    if (this.alignSibling('rightLeft') === '') {
                                        this.anchor('right', 'parent', false);
                                        if (this.alignParent('left') || this.alignSibling('left') !== '') {
                                            this.anchorStyle('horizontal', 1);
                                        }
                                    }
                                    break;
                                case 'bottom':
                                    this.anchorStyle('vertical', 1);
                                    break;
                                case 'left':
                                case 'start':
                                    if (this.alignSibling('leftRight') === '') {
                                        this.anchor('left', 'parent', false);
                                        if (this.alignParent('right') || this.alignSibling('right') !== '') {
                                            this.anchorStyle('horizontal', 0);
                                        }
                                    }
                                    break;
                                case 'center_horizontal':
                                    if (this.alignSibling('leftRight') === '' && this.alignSibling('rightLeft') === '') {
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
                    case 'svg':
                    case 'HR':
                    case 'VIDEO':
                    case 'AUDIO':
                    case 'CANVAS':
                    case 'OBJECT':
                    case 'EMBED':
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
                        if (!this.isEmpty() && (this.layoutFrame || this.layoutConstraint || this.layoutRelative && this.layoutHorizontal || this.layoutGrid) || this.is(CONTAINER_NODE.TEXT) && this.textEmpty || this.controlElement) {
                            return;
                        }
                        break;
                }
            }
            const direction = getGravityValues(this, attr, this.localizeString(alignment));
            if (direction) {
                let x = '',
                    y = '',
                    z = '',
                    result = '';
                for (let i = 0, length = direction.length; i < length; ++i) {
                    const value = direction[i];
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
                result = x !== '' && y !== '' ? `${x}|${y}` : x || y;
                if (z !== '') {
                    result += (result !== '' ? '|' : '') + z;
                }
                this.android(attr, result);
            }
        }

        public applyOptimizations() {
            if (this.renderExclude) {
                this.hide(this.alignSibling('topBottom') === '' && this.alignSibling('bottomTop') === '' && this.alignSibling('leftRight') === '' && this.alignSibling('rightLeft') === '' ? { remove: true } : { collapse: true });
                return;
            }
            const renderParent = this.renderParent!;
            const lineHeight = this.lineHeight;
            if (lineHeight) {
                const hasOwnStyle = this.has('lineHeight', { initial: true });
                if (this.multiline) {
                    setMultiline(this, lineHeight, hasOwnStyle);
                }
                else if (this.rendering && !(!hasOwnStyle && this.layoutHorizontal && this.alignSibling('baseline') !== '')) {
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
                                        if (item.alignSibling('baseline') === '' && item !== baseline || getLineHeight(item, lineHeight, true) !== lineHeight) {
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
            if (this.has('transform')) {
                const transforms = parseTransform(this.css('transform'), { accumulate: true, boundingBox: this.bounds, fontSize: this.fontSize });
                let offsetX = 0,
                    offsetY = 0,
                    pivoted: Undef<boolean>;
                for (let i = 0, length = transforms.length; i < length; ++i) {
                    const item = transforms[i];
                    const [x, y, z] = item.values;
                    switch (item.method) {
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
                    const { left, top } = Resource.getBackgroundPosition(this.css('transformOrigin'), this.bounds, { fontSize: this.fontSize });
                    if (top !== 0) {
                        this.android('transformPivotX', formatPX(top - (offsetX >= 0 ? offsetX : offsetX * -2)));
                    }
                    if (left !== 0) {
                        this.android('transformPivotY', formatPX(left - (offsetY >= 0 ? offsetY : offsetY * -2)));
                    }
                }
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
                    this.android('minWidth') !== '' || this.android('minHeight') !== '' ||
                    this.android('maxWidth') !== '' || this.android('maxHeight') !== '')
                {
                    this.android('adjustViewBounds', 'true');
                }
            }
            else if (this.rendering) {
                if (this.layoutLinear) {
                    if (this.layoutVertical) {
                        if ((renderParent.layoutHorizontal || renderParent.layoutGrid || this.alignSibling('baseline') !== '' || this.baselineActive) && (this.baselineElement || this.renderChildren[0].baselineElement) && !this.documentRoot) {
                            this.android('baselineAlignedChildIndex', '0', false);
                        }
                    }
                    else {
                        const renderChildren = this.renderChildren;
                        let baseline: Undef<boolean>;
                        if ((this.floatContainer || this.nodeGroup && (this.hasAlign(NODE_ALIGNMENT.FLOAT) || renderChildren.some(node => node.floating))) && !renderChildren.some(node => node.imageElement && node.baseline)) {
                            this.android('baselineAligned', 'false');
                            baseline = false;
                        }
                        else {
                            baseline = true;
                        }
                        for (let i = 0, length = renderChildren.length; i < length; ++i) {
                            const item = renderChildren[i];
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
                if (this.onlyChild && this.controlName === renderParent.controlName && !this.visibleStyle.borderWidth && this.elementId === '') {
                    let valid = true;
                    for (const name in this._namespaces) {
                        const parentObj = renderParent.unsafe<StringMap>('namespaces')![name];
                        if (parentObj) {
                            const obj = this._namespaces[name];
                            for (const attr in obj) {
                                if (attr === 'id') {
                                    continue;
                                }
                                const value = obj[attr];
                                if (value !== parentObj[attr] && value !== 'match_parent') {
                                    valid = false;
                                    break;
                                }
                            }
                        }
                        else {
                            valid = false;
                            break;
                        }
                    }
                    if (valid) {
                        const renderTemplates = this.renderTemplates as NodeXmlTemplate<T>[];
                        for (let i = 0, q = renderTemplates.length; i < q; ++i) {
                            const template = renderTemplates[i];
                            template.parent = renderParent;
                            template.node.renderParent = renderParent;
                        }
                        renderParent.renderChildren = this.renderChildren;
                        renderParent.renderTemplates = renderTemplates;
                        const { boxReset, boxAdjustment } = this;
                        const renderAdjustment = renderParent.boxAdjustment;
                        renderAdjustment[4] += (boxReset[0] === 0 ? this.marginTop : 0) + (boxReset[4] === 0 ? this.paddingTop : 0) + boxAdjustment[0] + boxAdjustment[4];
                        renderAdjustment[5] += (boxReset[1] === 0 ? this.marginRight : 0) + (boxReset[5] === 0 ? this.paddingRight : 0) + boxAdjustment[1] + boxAdjustment[5];
                        renderAdjustment[6] += (boxReset[2] === 0 ? this.marginBottom : 0) + (boxReset[6] === 0 ? this.paddingBottom : 0) + boxAdjustment[2] + boxAdjustment[6];
                        renderAdjustment[7] += (boxReset[3] === 0 ? this.marginLeft : 0) + (boxReset[7] === 0 ? this.paddingLeft : 0) + boxAdjustment[3] + boxAdjustment[7];
                    }
                }
            }
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

        public setSingleLine(maxLines: boolean, ellipsize?: boolean) {
            if (this.textElement && (this.plainText || !this.hasPX('width')) && this.textContent.length > 1) {
                if (maxLines) {
                    this.android('maxLines', '1');
                }
                if (ellipsize) {
                    this.android('ellipsize', 'end');
                }
            }
        }

        public setConstraintDimension(percentWidth = NaN) {
            percentWidth = constraintPercentWidth(this, percentWidth);
            constraintPercentHeight(this, 1);
            if (!this.inputElement) {
                constraintMinMax(this, true);
                constraintMinMax(this, false);
            }
            return percentWidth;
        }

        public setFlexDimension(dimension: DimensionAttr, percentWidth = NaN) {
            const { grow, basis, shrink } = this.flexbox;
            const horizontal = dimension === 'width';
            const setFlexGrow = (value?: number, shrinkValue?: number) => {
                if (grow > 0) {
                    this.app(horizontal ? 'layout_constraintHorizontal_weight' : 'layout_constraintVertical_weight', truncate(grow, this.localSettings.floatPrecision));
                    return true;
                }
                else if (value) {
                    if (shrinkValue !== undefined) {
                        if (shrinkValue > 1) {
                            value /= shrinkValue;
                        }
                        else if (shrinkValue > 0) {
                            value *= 1 - shrinkValue;
                        }
                    }
                    this.app(horizontal ? 'layout_constraintWidth_min' : 'layout_constraintHeight_min', formatPX(value));
                }
                return false;
            };
            if (isLength(basis)) {
                setFlexGrow(this.parseUnit(basis, { dimension }), shrink);
                setLayoutDimension(this, '0px', horizontal, true);
            }
            else if (basis !== '0%' && isPercent(basis)) {
                setFlexGrow();
                setConstraintPercent(this, parseFloat(basis) / 100, horizontal, NaN);
            }
            else {
                let flexible: Undef<boolean>;
                if (this.hasFlex(horizontal ? 'row' : 'column')) {
                    flexible = setFlexGrow(this.hasPX(dimension, { percent: false }) ? horizontal ? this.actualWidth : this.actualHeight : 0, shrink);
                    if (flexible) {
                        setLayoutDimension(this, '0px', horizontal, true);
                    }
                }
                if (!flexible) {
                    if (horizontal) {
                        percentWidth = constraintPercentWidth(this, percentWidth);
                    }
                    else {
                        constraintPercentHeight(this, 0);
                    }
                }
            }
            if (shrink > 1) {
                this.app(horizontal ? 'layout_constrainedWidth' : 'layout_constrainedHeight', 'true');
            }
            if (horizontal) {
                constraintPercentHeight(this);
            }
            if (!this.inputElement && !this.imageContainer) {
                constraintMinMax(this, true);
                constraintMinMax(this, false);
            }
            return percentWidth;
        }

        public getMatchConstraint(parent: Null<T> = this.renderParent) {
            return parent ? parent.layoutConstraint && !parent.flexibleWidth && (!parent.inlineWidth || this.rendering) && !this.onlyChild && !(parent.documentRoot && this.blockStatic) && (this.alignParent('left') && this.alignParent('right') && !this.textElement && !this.inputElement && !this.controlElement || this.hasPX('minWidth') && (parent.inlineWidth || parent.layoutWidth === '' && !parent.blockStatic && !parent.hasPX('width')) || this.alignSibling('leftRight') !== '' || this.alignSibling('rightLeft') !== '') ? '0px' : 'match_parent' : '';
        }

        public getAnchorPosition(parent: T, horizontal: boolean, modifyAnchor = true) {
            let orientation: string,
                dimension: string,
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
            const hasDimension = this.hasPX(dimension);
            const result: Partial<BoxRect> = {};
            const hasA = this.hasPX(posA);
            const hasB = this.hasPX(posB);
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
                    this.anchorParent(orientation as OrientationAttr, 0.5);
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
                    const offsetA = hasA && parent.adjustAbsolutePaddingOffset(paddingA, this[posA]);
                    const offsetB = hasB && parent.adjustAbsolutePaddingOffset(paddingB, this[posB]);
                    if (modifyAnchor) {
                        this.anchorParent(orientation as OrientationAttr);
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
                        const value = parent.adjustAbsolutePaddingOffset(paddingA, this[posA]);
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
                            const value = parent.adjustAbsolutePaddingOffset(paddingB, this[posB]);
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
                                if (!hasDimension && !(autoMargin[orientation] === true && autoMargin[posA] !== true && autoMargin[posB] !== true)) {
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
            switch (this.css('verticalAlign')) {
                case 'baseline':
                case 'initial':
                    return this.contentBoxWidth === 0 && this.contentBoxHeight === 0 && (!checkMargin || !this.blockStatic && this.marginTop === 0 && this.marginBottom === 0) && !this.visibleStyle.background && !this.positionRelative && !this.hasWidth && !this.hasHeight && !this.has('maxWidth') && !this.has('maxHeight') && this.css('whiteSpace') !== 'nowrap';
                default:
                    return false;
            }
        }

        public getHorizontalBias() {
            const { left, right } = this.documentParent.box;
            return calculateBias(Math.max(0, this.actualRect('left', 'bounds') - left), Math.max(0, right - this.actualRect('right', 'bounds')), this.localSettings.floatPrecision);
        }

        public getVerticalBias() {
            const { top, bottom } = this.documentParent.box;
            return calculateBias(Math.max(0, this.actualRect('top', 'bounds') - top), Math.max(0, bottom - this.actualRect('bottom', 'bounds')), this.localSettings.floatPrecision);
        }

        public adjustAbsolutePaddingOffset(region: number, value: number) {
            if (value > 0) {
                if (this.documentBody) {
                    switch (region) {
                        case BOX_STANDARD.PADDING_TOP:
                            if (this.getBox(BOX_STANDARD.MARGIN_TOP)[0] === 0) {
                                value -= this.marginTop;
                            }
                            break;
                        case BOX_STANDARD.PADDING_RIGHT:
                            value -= this.marginRight;
                            break;
                        case BOX_STANDARD.PADDING_BOTTOM:
                            if (this.getBox(BOX_STANDARD.MARGIN_BOTTOM)[0] === 0) {
                                value -= this.marginBottom;
                            }
                            break;
                        case BOX_STANDARD.PADDING_LEFT:
                            value -= this.marginLeft;
                            break;
                    }
                }
                if (this.getBox(region)[0] === 0) {
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
                default:
                    return false;
            }
        }

        get imageElement() {
            switch (this.tagName) {
                case 'IMG':
                case 'CANVAS':
                    return true;
                default:
                    return false;
            }
        }

        get imageContainer() {
            return this.imageElement || this.svgElement || this._containerType === CONTAINER_NODE.IMAGE;
        }

        set containerType(value) {
            this._containerType = value;
        }
        get containerType() {
            if (this._containerType === 0) {
                const value: Undef<number> = ELEMENT_ANDROID[this.containerName];
                if (value) {
                    this._containerType = value;
                }
            }
            return this._containerType;
        }

        set controlId(value) {
            this._controlId = value;
        }
        get controlId() {
            const result = this._controlId;
            if (result === undefined) {
                const controlName = this.controlName;
                if (controlName) {
                    let name: Undef<string>;
                    if (this.styleElement) {
                        const value = this.elementId || getNamedItem(this.element as HTMLElement, 'name');
                        if (value !== '') {
                            name = value.replace(/[^\w$\-_.]/g, '_').toLowerCase();
                            if (name === 'parent' || RESERVED_JAVA.has(name)) {
                                name = '_' + name;
                            }
                        }
                    }
                    return this._controlId = convertWord(ResourceUI.generateId('android', name || fromLastIndexOf(controlName, '.').toLowerCase(), name ? 0 : 1));
                }
                else {
                    const id = this.id;
                    return id <= 0 ? 'baseroot' + (id === 0 ? '' : '_' + Math.abs(id)) : '';
                }
            }
            return result;
        }

        get documentId() {
            const controlId = this.controlId;
            return controlId !== '' ? `@id/${controlId}` : '';
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
                const excludeHorizontal = (node: T) => node.bounds.width === 0 && node.contentBoxWidth === 0 && node.marginLeft === 0 && node.marginRight === 0 && !node.visibleStyle.background;
                const excludeVertical = (node: T) => node.bounds.height === 0 && node.contentBoxHeight === 0 && (node.marginTop === 0 && node.marginBottom === 0 || node.css('overflow') === 'hidden');
                if (this.naturalChild) {
                    if (this.plainText) {
                        result = this.bounds.height === 0;
                    }
                    else if (this.rootElement) {
                        result = false;
                    }
                    else if (!this.pageFlow) {
                        result = this.isEmpty() && (excludeHorizontal(this) || excludeVertical(this)) || /^rect\(0[a-zQ]*,\s+0[a-zQ]*,\s+0[a-zQ]*,\s+0[a-zQ]*\)$/.test(this.css('clip'));
                    }
                    else {
                        const parent = this.renderParent || this.parent as T;
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
                        else if (this.isEmpty() && !this.imageContainer) {
                            if (parent.layoutFrame) {
                                result = excludeHorizontal(this) || excludeVertical(this);
                            }
                            else if (parent.layoutVertical) {
                                result = excludeVertical(this);
                            }
                            else {
                                result = excludeHorizontal(this) && (parent.layoutHorizontal || excludeVertical(this));
                            }
                        }
                    }
                }
                return this._cache.renderExclude = result || false;
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
                    if (this.multiline && this.cssTry('white-space', 'nowrap')) {
                        result = this.boundingClientRect?.height ?? this.bounds.height;
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
                                result += 8;
                                break;
                            case CONTAINER_ANDROID.SELECT:
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
                const renderParent = target.renderParent as Undef<T>;
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
            return this._anchored || (this._anchored = this.constraint.horizontal && this.constraint.vertical);
        }

        get constraint() {
            return this._constraint || (this._constraint = { horizontal: false, vertical: false, current: {} });
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

        get target() {
            const target = this.dataset.androidTarget;
            return target ? document.getElementById(target) : null;
        }
    };
};