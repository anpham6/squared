import { CONTAINER_ANDROID, CONTAINER_ANDROID_X, ELEMENT_ANDROID, LAYOUT_ANDROID, RESERVED_JAVA, STRING_ANDROID } from './lib/constant';
import { API_ANDROID, DEPRECATED_ANDROID } from './lib/customization';
import { BUILD_ANDROID, CONTAINER_NODE } from './lib/enumeration';
import { getDataSet, isHorizontalAlign, isVerticalAlign, localizeString } from './lib/util';

type T = android.base.View;

const { CSS_PROPERTIES, CSS_UNIT, formatPX, getBackgroundPosition, getStyle, isLength, isPercent, parseTransform } = squared.lib.css;
const { createElement, getNamedItem } = squared.lib.dom;
const { clamp, truncate } = squared.lib.math;
const { actualTextRangeRect } = squared.lib.session;
const { capitalize, convertInt, convertWord, fromLastIndexOf, hasKeys, isNumber, isString, iterateArray, replaceMap, splitPair } = squared.lib.util;

const { EXT_NAME } = squared.base.lib.constant;
const { BOX_STANDARD, NODE_ALIGNMENT, NODE_PROCEDURE } = squared.base.lib.enumeration;

const ResourceUI = squared.base.ResourceUI;

const BOX_MARGIN = CSS_PROPERTIES.margin.value as string[];
const BOX_PADDING = CSS_PROPERTIES.padding.value as string[];

const {
    constraint: LAYOUT_CONSTRAINT,
    relative: LAYOUT_RELATIVE,
    relativeParent: LAYOUT_RELATIVE_PARENT } = LAYOUT_ANDROID;

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

function setAutoMargin(node: T, autoMargin: AutoMargin) {
    if (autoMargin.horizontal && (!node.blockWidth || node.hasWidth || node.hasPX('maxWidth') || node.innerMostWrapped.has('width', { type: CSS_UNIT.PERCENT, not: '100%' }))) {
        const attr = (node.blockWidth || !node.pageFlow) && !node.outerWrapper ? 'gravity' : 'layout_gravity';
        node.mergeGravity(attr, autoMargin.leftRight
            ? 'center_horizontal'
            : autoMargin.left
                ? 'right'
                : 'left'
        );
        return true;
    }
    return false;
}

function setMultiline(node: T, lineHeight: number, overwrite: boolean) {
    const offset = getLineSpacingExtra(node, lineHeight);
    if (node.api >= BUILD_ANDROID.PIE) {
        node.android('lineHeight', truncate(lineHeight, node.localSettings.floatPrecision) + 'px', overwrite);
    }
    else if (offset > 0) {
        node.android('lineSpacingExtra', truncate(offset, node.localSettings.floatPrecision) + 'px', overwrite);
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

function setMarginOffset(node: T, lineHeight: number, inlineStyle: boolean, top: boolean, bottom: boolean, parent?: T) {
    const styleValue = node.cssInitial('lineHeight');
    if (node.imageContainer || node.rendering || node.actualHeight === 0 || styleValue === 'normal') {
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
            const setBoxPadding = (offset: number, padding = false) => {
                if (offset > 0) {
                    const boxPadding = (inlineStyle || height > lineHeight) && (node.styleText || padding) && !node.inline && !(node.inputElement && !isLength(styleValue, true)) || !!parent;
                    if (boxPadding) {
                        if (top) {
                            let adjustment = offset;
                            if (parent) {
                                adjustment -= parent.paddingTop;
                            }
                            adjustment = Math.round(adjustment);
                            if (adjustment > 0) {
                                (parent || node).setBox(BOX_STANDARD.PADDING_TOP, { adjustment, max: true });
                            }
                        }
                        if (bottom) {
                            if (parent) {
                                offset -= parent.paddingBottom;
                            }
                            offset = Math.round(offset);
                            if (offset > 0) {
                                (parent || node).setBox(BOX_STANDARD.PADDING_BOTTOM, { adjustment: offset, max: true });
                            }
                        }
                    }
                    else if (node.pageFlow) {
                        if (top && (inlineStyle || !node.baselineAltered)) {
                            const adjustment = Math.floor(offset - node.paddingTop);
                            if (adjustment > 0) {
                                node.setBox(BOX_STANDARD.MARGIN_TOP, { adjustment, max: true });
                            }
                        }
                        if (bottom) {
                            offset = Math.floor(offset - node.paddingBottom);
                            if (offset > 0) {
                                node.setBox(BOX_STANDARD.MARGIN_BOTTOM, { adjustment: offset, max: true });
                            }
                        }
                    }
                }
            };
            if (node.textElement) {
                setBoxPadding(getLineSpacingExtra(node, lineHeight));
            }
            else if (height > 0) {
                const offset = (lineHeight / 2) - node.paddingTop;
                if (offset > 0) {
                    node.modifyBox(BOX_STANDARD.PADDING_TOP, offset);
                }
            }
            else if (node.inputElement) {
                const element = createElement('div', {
                    parent: document.body,
                    style: {
                        ...node.textStyle,
                        visibility: 'hidden'
                    }
                });
                element.innerText = 'AgjpqyZ';
                const rowHeight = actualTextRangeRect(element)?.height;
                if (rowHeight) {
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
            }
            else {
                setBoxPadding((lineHeight - node.bounds.height) / 2);
            }
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

function getLineSpacingExtra(node: T, lineHeight: number) {
    let bounds: Undef<BoxRectDimension>,
        altered: Undef<boolean>;
    if (node.plainText) {
        if (node.naturalChild) {
            bounds = node.bounds;
        }
        else {
            bounds = node.data<BoxRectDimension>(ResourceUI.KEY_NAME, 'textRange');
            if (!bounds) {
                let parent = node.actualParent;
                while (parent !== null) {
                    if (parent.naturalElement) {
                        node = parent as T;
                        altered = true;
                        break;
                    }
                    parent = parent.actualParent;
                }
            }
        }
    }
    if (!bounds && (node.styleText || altered)) {
        const values = node.cssTryAll({
            'display': 'inline-block',
            'height': 'auto',
            'max-height': 'none',
            'min-height': 'auto',
            'line-height': 'normal',
            'white-space': 'nowrap'
        });
        if (values) {
            const elememt = node.element!;
            let collapsed: Undef<[HTMLElement, string][]>;
            if (altered) {
                collapsed = [];
                iterateArray(elememt.children, (child: HTMLElement) => {
                    if (child.nodeName !== '#text') {
                        collapsed!.push([child, getStyle(child).display]);
                        child.style.display = 'none';
                    }
                });
            }
            bounds = actualTextRangeRect(elememt);
            if (collapsed) {
                for (const [child, value] of collapsed) {
                    child.style.display = value;
                }
                node.data<BoxRectDimension>(ResourceUI.KEY_NAME, 'textRange', bounds);
            }
            node.cssFinally(values);
        }
    }
    return (lineHeight - (bounds ? bounds.height / (bounds.numberOfLines || 1) : node.boundingClientRect?.height ?? lineHeight)) / 2;
}

function constraintMinMax(node: T, horizontal: boolean) {
    if (!node.hasPX(horizontal ? 'width' : 'height', { percent: false })) {
        const minWH = node.cssInitial(horizontal ? 'minWidth' : 'minHeight', { modified: true });
        if (isLength(minWH, true) && parseFloat(minWH) > 0 && minWH !== '100%') {
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
    let outerWrapper = node.outerMostWrapper as T;
    if (outerWrapper !== node && outerWrapper.css(horizontal ? 'width' : 'height') !== node.css(horizontal ? 'width' : 'height')) {
        outerWrapper = node;
    }
    if (value === 1 && !node.hasPX(horizontal ? 'maxWidth' : 'maxHeight')) {
        setLayoutDimension(outerWrapper, horizontal ? getMatchConstraint(outerWrapper, outerWrapper.renderParent as T) : 'match_parent', horizontal, false);
        if (node !== outerWrapper) {
            setLayoutDimension(node, horizontal ? getMatchConstraint(node, node.renderParent as T) : 'match_parent', horizontal, false);
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
        if (node.renderParent!.hasPX('width', { percent: false }) && !(node.actualParent || node.documentParent).layoutElement) {
            if (value < 1) {
                node.setLayoutWidth(formatPX(node.actualWidth));
            }
            else {
                node.setLayoutWidth(getMatchConstraint(node, node.renderParent as T), false);
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
    let parent = node.renderParent as Undef<T>;
    let i = 0;
    while (parent !== undefined) {
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
    const parent = node.renderParent as Undef<T>;
    return !!parent && (parent.hasHeight || parent.layoutConstraint && parent.blockHeight) || node.absoluteParent?.hasHeight === true;
}

function replaceLayoutPosition(node: T, parentId: string) {
    const left = node.anchorChain('left').shift();
    const right = node.anchorChain('right').shift();
    const top = node.anchorChain('top').shift();
    const bottom = node.anchorChain('bottom').shift();
    if (left && right) {
        left.anchor('rightLeft', right.documentId, true);
        right.anchor('leftRight', left.documentId, true);
    }
    else if (left) {
        left.anchorDelete('rightLeft');
        if (node.alignParent('right')) {
            left.anchor('right', parentId);
            transferHorizontalStyle(node, left);
        }
    }
    else if (right) {
        right.anchorDelete('leftRight');
        if (node.alignParent('left')) {
            right.anchor('left', parentId);
            transferHorizontalStyle(node, right);
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
            transferVerticalStyle(node, top);
        }
    }
    else if (bottom) {
        bottom.anchorDelete('topBottom');
        if (node.alignParent('top')) {
            bottom.anchor('top', parentId);
            transferVerticalStyle(node, bottom);
        }
    }
}

function transferHorizontalStyle(node: T, sibling: T) {
    sibling.app('layout_constraintHorizontal_bias', node.app('layout_constraintHorizontal_bias'));
    sibling.app('layout_constraintHorizontal_chainStyle', node.app('layout_constraintHorizontal_chainStyle'));
}

function transferVerticalStyle(node: T, sibling: T) {
    sibling.app('layout_constraintVertical_bias', node.app('layout_constraintVertical_bias'));
    sibling.app('layout_constraintVertical_chainStyle', node.app('layout_constraintVertical_chainStyle'));
}

function transferLayoutAlignment(node: T, replaceWith: T) {
    replaceWith.anchorClear();
    for (const [name, item] of node.namespaces()) {
        for (const attr in item) {
            switch (attr) {
                case 'layout_width':
                case 'layout_height':
                    continue;
                default:
                    if (attr.includes('margin')) {
                        continue;
                    }
                    break;
            }
            if (attr.startsWith('layout_')) {
                replaceWith.attr(name, attr, item[attr], true);
            }
        }
    }
}

function finalizeGravity(node: T, attr: string) {
    const direction = getGravityValues(node, attr);
    if (direction && direction.length > 1) {
        let modified = false;
        if (checkMergableGravity('center', direction)) {
            modified = true;
        }
        if (checkMergableGravity('fill', direction)) {
            modified = true;
        }
        if (modified) {
            node.android(attr, direction.join('|'));
        }
    }
}

function setFlexGrow(node: T, horizontal: boolean, grow: number, value?: number, shrink?: number) {
    if (grow > 0) {
        node.app(horizontal ? 'layout_constraintHorizontal_weight' : 'layout_constraintVertical_weight', truncate(grow, node.localSettings.floatPrecision));
        return true;
    }
    else if (value) {
        if (shrink) {
            if (shrink > 1) {
                value /= shrink;
            }
            else if (shrink > 0) {
                value *= 1 - shrink;
            }
        }
        node.app(horizontal ? 'layout_constraintWidth_min' : 'layout_constraintHeight_min', formatPX(value));
    }
    return false;
}

function setCustomization(node: T, obj: Undef<ObjectMap<StringMap>>, overwrite: boolean) {
    if (obj) {
        for (const name in obj) {
            const data = obj[name];
            for (const attr in data) {
                node.attr(name, attr, data[attr], overwrite);
            }
        }
    }
}

function setBoxModel(node: T, attrs: string[], boxReset: BoxModel, boxAdjustment: BoxModel, margin: boolean) {
    let top = 0,
        right = 0,
        bottom = 0,
        left = 0;
    for (let i = 0; i < 4; ++i) {
        const attr = attrs[i];
        let value: number = boxReset[attr] === 0 ? node[attr] : 0;
        if (value !== 0) {
            if (margin) {
                switch (i) {
                    case 1:
                        if (node.inline) {
                            const outer = node.documentParent.box.right;
                            const inner = node.bounds.right;
                            if (Math.floor(inner) > outer) {
                                if (!node.onlyChild && !node.alignParent('left')) {
                                    node.setSingleLine(true);
                                }
                                continue;
                            }
                            else if (inner + value > outer) {
                                value = clamp(outer - inner, 0, value);
                            }
                        }
                        break;
                    case 2:
                        if (value < 0 && node.pageFlow && !node.blockStatic) {
                            value = 0;
                        }
                        break;
                }
            }
            else {
                switch (i) {
                    case 0:
                        value = node.actualPadding(attr as 'paddingTop', value);
                        break;
                    case 2:
                        if (node.hasPX('height', { percent: false, initial: true }) && (!node.layoutElement && (node.layoutVertical || node.layoutFrame) || !node.pageFlow) || node.documentParent.gridElement && node.hasPX('height', { percent: false })) {
                            continue;
                        }
                        else if (node.floatContainer) {
                            let maxBottom = -Infinity;
                            const children = node.naturalChildren;
                            const length = children.length;
                            let j = 0;
                            while (j < length) {
                                const item = children[j++];
                                if (item.floating) {
                                    maxBottom = Math.max(item.bounds.bottom, maxBottom);
                                }
                            }
                            value = clamp(node.bounds.bottom - maxBottom, 0, value);
                        }
                        else {
                            value = node.actualPadding(attr as 'paddingBottom', value);
                        }
                        break;
                }
            }
        }
        value += boxAdjustment[attr];
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
        if (node.floating) {
            let sibling = node.renderParent!.renderChildren.find(item => !item.floating) as Undef<T>;
            if (sibling) {
                const boundsTop = Math.floor(node.bounds.top);
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
        if (node.positionStatic && !node.blockWidth && (left < 0 || right < 0)) {
            switch (node.cssAscend('textAlign')) {
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
                case 'end':
                    if (left < 0) {
                        left = 0;
                    }
                    break;
            }
        }
        if (node.tagName === 'PICTURE') {
            bottom += 4;
            right += 4;
        }
        switch (node.controlName) {
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
            if (!node.pageFlow) {
                if (bottom >= 0 && node.leftTopAxis && (node.hasPX('top') || !node.hasPX('bottom')) && node.translateY(top)) {
                    top = 0;
                }
            }
            else if (node.blockDimension && !node.inputElement && node.translateY(top)) {
                for (const item of node.anchorChain('bottom')) {
                    item.translateY(top);
                }
                top = 0;
            }
        }
        if (bottom < 0) {
            if (!node.pageFlow) {
                if (top >= 0 && node.leftTopAxis && node.hasPX('bottom') && !node.hasPX('top') && node.translateY(-bottom)) {
                    bottom = 0;
                }
            }
            else if (node.blockDimension && !node.inputElement && (node.renderParent as T).layoutConstraint) {
                for (const item of node.anchorChain('bottom')) {
                    item.translateY(-bottom);
                }
                bottom = 0;
            }
        }
        if (left < 0) {
            if (!node.pageFlow) {
                if (right >= 0 && node.leftTopAxis && (node.hasPX('left') || !node.hasPX('right')) && node.translateX(left)) {
                    left = 0;
                }
            }
            else if (node.float === 'right') {
                left = Math.min(-left, -node.bounds.width);
                for (const item of node.anchorChain('left')) {
                    item.translateX(-left);
                }
                left = 0;
            }
            else if (node.blockDimension && node.translateX(left)) {
                for (const item of node.anchorChain('right')) {
                    item.translateX(left);
                }
                left = 0;
            }
        }
        if (right < 0) {
            if (!node.pageFlow) {
                if (left >= 0 && node.leftTopAxis && node.hasPX('right') && !node.hasPX('left') && node.translateX(-right)) {
                    right = 0;
                }
            }
            else if (node.rightAligned) {
                if (node.translateX(-right)) {
                    right = 0;
                }
            }
            else if (node.blockDimension && (node.renderParent as T).layoutConstraint) {
                for (const item of node.anchorChain('right')) {
                    item.translateX(right);
                }
                right = 0;
            }
        }
    }
    else if (node.visibleStyle.borderWidth && !node.is(CONTAINER_NODE.LINE)) {
        top += node.borderTopWidth;
        bottom += node.borderBottomWidth;
        right += node.borderRightWidth;
        left += node.borderLeftWidth;
    }
    if (top !== 0 || left !== 0 || bottom !== 0 || right !== 0) {
        let horizontal = NaN,
            vertical = NaN;
        top = Math.round(top);
        right = Math.round(right);
        bottom = Math.round(bottom);
        left = Math.round(left);
        if ((!margin || !(node.renderParent as T).layoutGrid) && node.api >= BUILD_ANDROID.OREO) {
            if (top === right && right === bottom && bottom === left) {
                node.android(margin ? STRING_ANDROID.MARGIN : STRING_ANDROID.PADDING, Math.round(top) + 'px');
                return;
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
                node.android(margin ? STRING_ANDROID.MARGIN_HORIZONTAL : STRING_ANDROID.PADDING_HORIZONTAL, horizontal + 'px');
            }
        }
        else {
            if (left !== 0) {
                node.android(node.localizeString(margin ? STRING_ANDROID.MARGIN_LEFT : STRING_ANDROID.PADDING_LEFT), left + 'px');
            }
            if (right !== 0) {
                node.android(node.localizeString(margin ? STRING_ANDROID.MARGIN_RIGHT : STRING_ANDROID.PADDING_RIGHT), right + 'px');
            }
        }
        if (!isNaN(vertical)) {
            if (vertical !== 0) {
                node.android(margin ? STRING_ANDROID.MARGIN_VERTICAL : STRING_ANDROID.PADDING_VERTICAL, vertical + 'px');
            }
        }
        else {
            if (top !== 0) {
                node.android(margin ? STRING_ANDROID.MARGIN_TOP : STRING_ANDROID.PADDING_TOP, top + 'px');
            }
            if (bottom !== 0) {
                node.android(margin ? STRING_ANDROID.MARGIN_BOTTOM : STRING_ANDROID.PADDING_BOTTOM, bottom + 'px');
            }
        }
    }
}

function getGravityValues(node: T, attr: string, value?: string) {
    const gravity = node.android(attr);
    if (gravity !== '') {
        const result = gravity.split('|');
        if (value) {
            if (result.includes(value)) {
                return undefined;
            }
            result.push(value);
        }
        return result;
    }
    else if (value) {
        node.android(attr, value);
    }
    return undefined;
}

const getMatchConstraint = (node: T, parent: T) => parent.layoutConstraint && !parent.flexibleWidth && (!parent.inlineWidth || node.rendering) && !node.onlyChild && !(parent.documentRoot && node.blockStatic) && (node.alignParent('left') && node.alignParent('right') && !node.textElement && !node.inputElement && !node.controlElement || node.hasPX('minWidth') && (parent.inlineWidth || parent.layoutWidth === '' && !parent.blockStatic && !parent.hasPX('width')) || node.alignSibling('leftRight') !== '' || node.alignSibling('rightLeft') !== '') ? '0px' : 'match_parent';
const excludeHorizontal = (node: T) => node.bounds.width === 0 && node.contentBoxWidth === 0 && node.textEmpty && node.marginLeft === 0 && node.marginRight === 0 && !node.visibleStyle.background;
const excludeVertical = (node: T) => node.bounds.height === 0 && node.contentBoxHeight === 0 && (node.marginTop === 0 && node.marginBottom === 0 || node.css('overflow') === 'hidden');
const inheritLineHeight = (node: T) => !node.rendering && !node.multiline && !isNaN(node.lineHeight) && !node.has('lineHeight');

export default (Base: Constructor<squared.base.NodeUI>) => {
    return class View extends Base implements android.base.View {
        public static horizontalMatchConstraint = (node: T, parent: T) => getMatchConstraint(node, parent);

        public static setConstraintDimension(node: T, percentWidth = NaN) {
            percentWidth = constraintPercentWidth(node, percentWidth);
            constraintPercentHeight(node, 1);
            if (!node.inputElement) {
                constraintMinMax(node, true);
                constraintMinMax(node, false);
            }
            return percentWidth;
        }

        public static setFlexDimension(node: T, dimension: DimensionAttr, percentWidth = NaN) {
            const { grow, basis, shrink } = node.flexbox;
            const horizontal = dimension === 'width';
            if (isLength(basis)) {
                setFlexGrow(node, horizontal, grow, node.parseUnit(basis, { dimension }), shrink);
                setLayoutDimension(node, '0px', horizontal, true);
            }
            else if (basis !== '0%' && isPercent(basis)) {
                setFlexGrow(node, horizontal, grow);
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
                    flexible = setFlexGrow(
                        node,
                        horizontal,
                        grow,
                        node.hasPX(dimension, { percent: false })
                            ? horizontal
                                ? node.actualWidth
                                : node.actualHeight
                            : 0,
                        shrink
                    );
                    if (flexible) {
                        setLayoutDimension(node, '0px', horizontal, true);
                    }
                }
                if (!flexible) {
                    if (horizontal) {
                        percentWidth = constraintPercentWidth(node, percentWidth);
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
            if (!node.inputElement && !node.imageContainer) {
                constraintMinMax(node, true);
                constraintMinMax(node, false);
            }
            return percentWidth;
        }

        public static availablePercent(nodes: T[], dimension: DimensionAttr, boxSize: number) {
            const horizontal = dimension === 'width';
            let percent = 1,
                valid = false;
            const length = nodes.length;
            let i = 0;
            while (i < length) {
                let sibling = nodes[i++];
                sibling = sibling.innerMostWrapped as T;
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
        public renderParent?: T;
        public horizontalRows?: T[][];
        public readonly constraint: Constraint = {
            horizontal: false,
            vertical: false,
            current: {}
        };

        protected _namespaces: ObjectMap<StringMap> = { android: {}, app: {} };
        protected _containerType = 0;
        protected _controlName = '';
        protected _cached!: AndroidCachedValueUI<T>;
        protected _boxReset!: BoxModel;
        protected _boxAdjustment!: BoxModel;
        protected _localSettings!: AndroidLocalSettingsUI;
        protected _documentParent?: T;
        protected _innerWrapped?: T;

        private _positioned = false;
        private _controlId?: string;
        private _labelFor?: T;

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
            const actualParent = this.actualParent as T || this.documentParent;
            const renderParent = this.renderParent as T;
            const containsWidth = !renderParent.inlineWidth;
            const containsHeight = !renderParent.inlineHeight;
            const maxDimension = this.support.maxDimension;
            let { layoutWidth, layoutHeight } = this;
            if (layoutWidth === '') {
                if (this.hasPX('width') && (!this.inlineStatic || this.cssInitial('width') === '')) {
                    const width = this.css('width');
                    let value = -1;
                    if (isPercent(width)) {
                        const expandable = () => width === '100%' && containsWidth && (maxDimension || !this.hasPX('maxWidth'));
                        if (this.inputElement) {
                            if (expandable()) {
                                layoutWidth = getMatchConstraint(this, renderParent);
                            }
                            else {
                                value = this.actualWidth;
                            }
                        }
                        else if (renderParent.layoutConstraint) {
                            if (containsWidth) {
                                if (expandable()) {
                                    layoutWidth = getMatchConstraint(this, renderParent);
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
                                layoutWidth = getMatchConstraint(this, renderParent);
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
                                    if (containsWidth && Math.ceil(maxValue) >= absoluteParent.box.width) {
                                        layoutWidth = getMatchConstraint(this, renderParent);
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
                                        layoutWidth = Math.floor(maxValue) < absoluteParent.box.width ? 'wrap_content' : getMatchConstraint(this, renderParent);
                                    }
                                }
                            }
                            if (layoutWidth === '' && (this.documentRoot || containsWidth)) {
                                layoutWidth = getMatchConstraint(this, renderParent);
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
                else if (this.length > 0) {
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
                            if (length > 0 && maxWidth > 0) {
                                const width = formatPX(maxWidth);
                                let i = 0;
                                while (i < length) {
                                    const node = nodes[i++];
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
                            actualParent.flexElement && this.some(item => item.multiline, { cascade: true }) ||
                            this.layoutGrid && this.some((node: T) => node.flexibleWidth)
                        ))
                    {
                        layoutWidth = getMatchConstraint(this, renderParent);
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
                                    const width = Math.ceil(actualTextRangeRect(this.element!)?.width || 0);
                                    layoutWidth = width >= actualParent.box.width ? 'wrap_content' : 'match_parent';
                                    this.cssFinally('display');
                                    return;
                                }
                            }
                            layoutWidth = getMatchConstraint(this, renderParent);
                        };
                        if (renderParent.layoutGrid) {
                            if (this.blockStatic && renderParent.android('columnCount') === '1') {
                                layoutWidth = getMatchConstraint(this, renderParent);
                            }
                        }
                        else if (this.blockStatic) {
                            if (this.documentRoot) {
                                layoutWidth = 'match_parent';
                            }
                            else if (!actualParent.layoutElement) {
                                if (this.nodeGroup || renderParent.hasWidth || this.hasAlign(NODE_ALIGNMENT.BLOCK) || this.rootElement) {
                                    layoutWidth = getMatchConstraint(this, renderParent);
                                }
                                else {
                                    checkParentWidth(true);
                                }
                            }
                            else if (containsWidth && (actualParent.gridElement && !renderParent.layoutElement || actualParent.flexElement && this.layoutVertical && this.some(item => item.textElement && item.multiline))) {
                                layoutWidth = getMatchConstraint(this, renderParent);
                            }
                        }
                        else if (this.floating && this.block && !this.rightAligned && this.alignParent('left') && this.alignParent('right')) {
                            layoutWidth = 'match_parent';
                        }
                        else if (this.naturalElement && this.inlineStatic && !this.blockDimension && this.some(item => item.naturalElement && item.blockStatic) && !actualParent.layoutElement && (renderParent.layoutVertical || this.alignSibling('leftRight') === '' && this.alignSibling('rightLeft') === '')) {
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
                            if (!maxDimension) {
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
                                else if (maxValue > 0) {
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
                    this.setLayoutWidth(getMatchConstraint(this, renderParent));
                }
                else {
                    this.android('minWidth', formatPX(this.parseWidth(minWidth) + (this.contentBox ? this.contentBoxWidth : 0)), false);
                }
            }
            if (this.hasPX('minHeight') && this.display !== 'table-cell' && (!this.hasFlex('column') || actualParent.flexElement && !this.flexibleHeight)) {
                const minHeight = this.css('minHeight');
                if (minHeight === '100%' && containsHeight && this.inlineHeight) {
                    this.setLayoutHeight('match_parent');
                }
                else {
                    this.android('minHeight', formatPX(this.parseHeight(minHeight) + (this.contentBox ? this.contentBoxHeight : 0)), false);
                }
            }
            if (maxDimension) {
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
                                    this.setLayoutWidth(getMatchConstraint(this, renderParent));
                                    this.setLayoutHeight('wrap_content');
                                    width = -1;
                                    maxHeight = '';
                                }
                            }
                            else if (containsWidth) {
                                this.setLayoutWidth(getMatchConstraint(this, renderParent));
                            }
                        }
                    }
                    else {
                        width = this.parseWidth(maxWidth);
                    }
                }
                else if (!this.pageFlow && this.multiline && this.inlineWidth && !this.preserveWhiteSpace && (this.ascend({ condition: item => item.hasPX('width') }).length > 0 || !this.textContent.includes('\n'))) {
                    width = this.actualWidth;
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
            let textAlign = checkTextAlign(this.cssInitial('textAlign', { modified: true }), false),
                textAlignParent = checkTextAlign(this.cssAscend('textAlign'), true);
            if (this.nodeGroup && textAlign === '' && !this.hasAlign(NODE_ALIGNMENT.FLOAT)) {
                const actualParent = this.actualParent;
                if (actualParent) {
                    textAlign = checkTextAlign(actualParent.cssInitial('textAlign', { modified: true }), false);
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
                        else if (!setAutoMargin(node, autoMargin) && textAlign !== '' && this.hasWidth && !this.blockStatic && !this.inputElement && this.display !== 'table') {
                            node.mergeGravity('layout_gravity', textAlign, false);
                        }
                    }
                    if (this.rightAligned) {
                        floatAlign = 'right';
                    }
                    else if (this.nodeGroup) {
                        if (this.every(item => item.rightAligned)) {
                            floatAlign = 'right';
                        }
                        else if (this.hasAlign(NODE_ALIGNMENT.FLOAT) && !this.some(item => item.rightAligned)) {
                            floatAlign = 'left';
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
                                floatAlign = this.float;
                            }
                            if (floatAlign !== '' && !renderParent.naturalElement && (renderParent.inlineWidth || !renderParent.documentRoot && this.onlyChild)) {
                                renderParent.mergeGravity('layout_gravity', floatAlign);
                                floatAlign = '';
                            }
                        }
                        if (this.centerAligned) {
                            this.mergeGravity('layout_gravity', checkTextAlign('center', false));
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
                        if (textAlign === '' || floatAlign === 'right') {
                            textAlign = floatAlign;
                        }
                    }
                    else {
                        (node.blockWidth && this !== node ? this : node).mergeGravity('layout_gravity', floatAlign);
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
                    if (!this.imageContainer) {
                        this.mergeGravity('gravity', textAlign);
                    }
                }
                else if (textAlignParent !== '' && !this.inputElement) {
                    if (this.imageContainer) {
                        if (this.pageFlow) {
                            this.mergeGravity('layout_gravity', textAlignParent);
                        }
                    }
                    else if (!this.nodeGroup || !this.hasAlign(NODE_ALIGNMENT.FLOAT)) {
                        this.mergeGravity('gravity', textAlignParent);
                    }
                }
            }
            if (this.textElement && this.layoutElement) {
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
            if (autoMargin.vertical && (renderParent.layoutFrame || renderParent.layoutVertical && renderParent.layoutLinear)) {
                node.mergeGravity('layout_gravity', autoMargin.topBottom
                    ? 'center_vertical'
                    : autoMargin.top
                        ? 'bottom'
                        : 'top'
                );
            }
        }

        public setBoxSpacing() {
            setBoxModel(this, BOX_MARGIN, this._boxReset, this._boxAdjustment, true);
            setBoxModel(this, BOX_PADDING, this._boxReset, this._boxAdjustment, false);
        }

        public apply(options: {}) {
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

        public clone(id: number, options?: AndroidCloneOptions): T {
            let attributes: Undef<boolean>,
                position: Undef<boolean>;
            if (options) {
                ({ attributes, position } = options);
            }
            const node = new View(!isNaN(id) ? id : this.id, this.sessionId, this.element || undefined);
            if (id !== undefined) {
                node.setControlType(this.controlName, this.containerType);
            }
            else {
                node.controlId = this.controlId;
                node.controlName = this.controlName;
                node.containerType = this.containerType;
            }
            this.cloneBase(node);
            if (attributes !== false) {
                Object.assign(node.unsafe<BoxModel>('boxReset'), this._boxReset);
                Object.assign(node.unsafe<BoxModel>('boxAdjustment'), this._boxAdjustment);
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
            if (this.dir === 'rtl' && !this.imageContainer) {
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
                    for (const namespace in dataset) {
                        const name = namespace === 'attr'
                             ? 'android'
                             : /^attr[A-Z]/.test(namespace)
                                ? capitalize(namespace.substring(4), false)
                                : undefined;
                        if (name) {
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
                    if (opacity !== '1' && isNumber(opacity)) {
                        this.android('alpha', opacity);
                    }
                }
            }
            const indent = '\n' + '\t'.repeat(depth);
            const items = this.combine();
            let output = '';
            const length = items.length;
            let i = 0;
            while (i < length) {
                output += indent + items[i++];
            }
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

        public translateX(value: number, options?: TranslateOptions) {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as T;
            if (renderParent?.layoutConstraint) {
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
            const renderParent = node.renderParent as T;
            if (renderParent?.layoutConstraint) {
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

        public hasFlex(direction: "row" | "column") {
            const parent = this.actualParent as T;
            if (parent?.flexdata[direction] === true) {
                if (direction === 'column' && !parent.hasHeight) {
                    const grandParent = parent.actualParent;
                    if (grandParent) {
                        if (grandParent.flexElement && !grandParent.flexdata.column) {
                            if (!grandParent.hasHeight) {
                                let maxHeight = 0,
                                    parentHeight = 0;
                                for (const item of grandParent) {
                                    const height = (item.data<BoxRectDimension>(EXT_NAME.FLEXBOX as string, 'boundsData') || item.bounds).height;
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
                        const sibling = siblings.find(item => item.documentId === adjacent) as T | undefined;
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

        public anchorDelete(...position: string[]) {
            const node = this.anchorTarget;
            const renderParent = node.renderParent as T;
            if (renderParent) {
                if (renderParent.layoutConstraint) {
                    node.delete('app', ...replaceMap(position, (value: string) => this.localizeString(LAYOUT_CONSTRAINT[value])));
                }
                else if (renderParent.layoutRelative) {
                    const layout: string[] = [];
                    let i = 0;
                    while (i < position.length) {
                        const value = position[i++];
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
            const renderParent = node.renderParent as T;
            if (renderParent) {
                if (renderParent.layoutConstraint) {
                    if (update === true) {
                        replaceLayoutPosition(node, 'parent');
                    }
                    else if (update) {
                        transferLayoutAlignment(node, update);
                    }
                    node.anchorDelete(...Object.keys(LAYOUT_CONSTRAINT));
                    node.delete('app', 'layout_constraintHorizontal_bias', 'layout_constraintHorizontal_chainStyle', 'layout_constraintVertical_bias', 'layout_constraintVertical_chainStyle');
                }
                else if (renderParent.layoutRelative) {
                    if (update === true) {
                        replaceLayoutPosition(node, 'true');
                    }
                    else if (update) {
                        transferLayoutAlignment(node, update);
                    }
                    node.anchorDelete(...Object.keys(LAYOUT_RELATIVE_PARENT));
                    node.anchorDelete(...Object.keys(LAYOUT_RELATIVE));
                }
            }
        }

        public supported(attr: string, result = {}): boolean {
            if (typeof DEPRECATED_ANDROID.android[attr] === 'function') {
                const valid = DEPRECATED_ANDROID.android[attr](result, this.api, this);
                if (!valid || hasKeys(result)) {
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
            let requireId = false,
                id = '';
            for (const name in this._namespaces) {
                if (all || objs.includes(name)) {
                    const obj = this._namespaces[name];
                    let prefix = name + ':';
                    switch (name) {
                        case 'android':
                            if (this.api < BUILD_ANDROID.LATEST) {
                                for (let attr in obj) {
                                    if (attr === 'id') {
                                        id = obj[attr]!;
                                    }
                                    else {
                                        const data: ObjectMap<string | boolean> = {};
                                        let value = obj[attr];
                                        if (!this.supported(attr, data)) {
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
                                        result.push(prefix + `${attr}="${value}"`);
                                    }
                                }
                            }
                            else {
                                for (const attr in obj) {
                                    if (attr === 'id') {
                                        id = obj[attr]!;
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
            result.sort((a, b) => a > b ? 1 : -1);
            if (requireId) {
                result.unshift(`android:id="${id || '@+id/' + this.controlId}"`);
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
                        if (alignment === 'center_horizontal' && this.alignSibling('leftRight') === '' && this.alignSibling('rightLeft') === '') {
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
                    case 'SVG':
                    case 'HR':
                    case 'VIDEO':
                    case 'AUDIO':
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
                        if (this.controlElement || this.is(CONTAINER_NODE.TEXT) && this.textEmpty || this.length > 0 && (this.layoutFrame || this.layoutConstraint || this.layoutGrid)) {
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
                let i = 0;
                while (i < direction.length) {
                    const value = direction[i++];
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
                this.android(attr, result);
            }
        }

        public applyOptimizations() {
            const renderParent = this.renderParent;
            if (renderParent) {
                if (this.renderExclude) {
                    if (this.alignSibling('topBottom') === '' && this.alignSibling('bottomTop') === '' && this.alignSibling('leftRight') === '' && this.alignSibling('rightLeft') === '') {
                        this.hide({ remove: true });
                    }
                    else {
                        this.hide({ collapse: true });
                    }
                    return;
                }
                const { lineHeight, renderChildren } = this;
                const length = renderChildren.length;
                if (this.layoutLinear) {
                    if (this.layoutVertical) {
                        if (!renderParent.layoutFrame && !this.documentRoot && length > 0 && (this.baselineElement || !renderChildren[0].multiline && renderChildren.every(node => node.textElement))) {
                            this.android('baselineAlignedChildIndex', '0');
                        }
                    }
                    else {
                        let baseline = true;
                        if (renderChildren.some(node => node.floating) && !renderChildren.some(node => node.imageElement && node.baseline)) {
                            this.android('baselineAligned', 'false');
                            baseline = false;
                        }
                        for (let i = 0; i < length; ++i) {
                            const item = renderChildren[i];
                            item.setSingleLine(i > 0 && i === length - 1);
                            if (baseline && item.baselineElement) {
                                this.android('baselineAlignedChildIndex', i.toString());
                                baseline = false;
                            }
                        }
                    }
                }
                if (lineHeight > 0) {
                    const hasOwnStyle = this.has('lineHeight', { initial: true });
                    if (this.multiline) {
                        setMultiline(this, lineHeight, hasOwnStyle);
                    }
                    else if (length > 0) {
                        if (!hasOwnStyle && this.layoutHorizontal && this.alignSibling('baseline') !== '') {
                            return;
                        }
                        else if (this.layoutVertical || this.layoutFrame) {
                            this.renderEach((item: T) => {
                                if (inheritLineHeight(item)) {
                                    setMarginOffset(item, item.lineHeight || lineHeight, true, true, true);
                                }
                            });
                        }
                        else {
                            let previousMultiline = false;
                            const horizontalRows = this.horizontalRows || [renderChildren];
                            for (let i = 0, q = horizontalRows.length; i < q; ++i) {
                                const row = horizontalRows[i];
                                const onlyChild = row.length === 1;
                                const baseline = !onlyChild ? row.find(item => item.baselineActive && !item.rendering && !item.imageContainer) : undefined;
                                let top: boolean,
                                    bottom: boolean;
                                if (q === 1) {
                                    top = true;
                                    bottom = true;
                                }
                                else {
                                    const nextRow = horizontalRows[i + 1];
                                    top = i > 0 && !previousMultiline || row[0].lineBreakLeading;
                                    bottom = i < q - 1 && (
                                        !(nextRow !== undefined && (nextRow.length === 1 && nextRow[0].multiline || nextRow[0].lineBreakLeading)) ||
                                        this.floatContainer && baseline !== undefined && (baseline.anchorChain('left').pop()?.floating === true || baseline.anchorChain('right').pop()?.floating === true)
                                    );
                                    previousMultiline = onlyChild && row[0].multiline;
                                }
                                const r = row.length;
                                let j = 0;
                                if (baseline) {
                                    if (q === 1) {
                                        let invalid: Undef<boolean>;
                                        while (j < r) {
                                            const item = row[j++];
                                            if (!(item === baseline || inheritLineHeight(item) && item.alignSibling('baseline') !== '')) {
                                                invalid = true;
                                                break;
                                            }
                                        }
                                        if (!invalid) {
                                            setMarginOffset(baseline, lineHeight, false, top, bottom, this);
                                            continue;
                                        }
                                    }
                                    if (!isNaN(baseline.lineHeight) && !baseline.has('lineHeight')) {
                                        setMarginOffset(baseline, lineHeight, false, top, bottom);
                                    }
                                }
                                else {
                                    while (j < r) {
                                        const item = row[j++];
                                        if (inheritLineHeight(item)) {
                                            setMarginOffset(item, lineHeight, onlyChild, top, bottom);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else if ((hasOwnStyle || renderParent.lineHeight === 0) && this.inlineText && !this.textEmpty) {
                        setMarginOffset(this, lineHeight, hasOwnStyle, true, true);
                    }
                }
                finalizeGravity(this, 'layout_gravity');
                finalizeGravity(this, 'gravity');
                if (this.imageElement) {
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
                if (this.has('transform')) {
                    const transforms = parseTransform(this.css('transform'), { accumulate: true, boundingBox: this.bounds, fontSize: this.fontSize });
                    let pivoted = false,
                        offsetX = 0,
                        offsetY = 0;
                    let i = 0;
                    while (i < transforms.length) {
                        const item = transforms[i++];
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
                        const { left, top } = getBackgroundPosition(this.css('transformOrigin'), this.bounds, { fontSize: this.fontSize });
                        if (top !== 0) {
                            this.android('transformPivotX', formatPX(top - (offsetX >= 0 ? offsetX : -(offsetX * 2))));
                        }
                        if (left !== 0) {
                            this.android('transformPivotY', formatPX(left - (offsetY >= 0 ? offsetY : -(offsetY * 2))));
                        }
                    }
                }
                if (this.onlyChild && length > 0 && this.controlName ===  renderParent.controlName && !this.visibleStyle.borderWidth && this.elementId === '') {
                    let valid = true;
                    for (const name in this._namespaces) {
                        const parentObj = renderParent.unsafe<StringMap>('namespaces')![name];
                        if (parentObj) {
                            const obj = this._namespaces[name];
                            for (const attr in obj) {
                                if (attr !== 'id' && obj[attr] !== parentObj[attr]) {
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
                        const renderTemplates = this.renderTemplates as NodeXmlTemplate<View>[];
                        const q = renderTemplates.length;
                        let i = 0;
                        while (i < q) {
                            const template = renderTemplates[i++];
                            template.parent = renderParent as View;
                            template.node.renderParent = renderParent as View;
                        }
                        renderParent.renderTemplates = renderTemplates;
                        renderParent.renderChildren = renderChildren;
                        const boxReset = this._boxReset;
                        const boxAdjustment = this._boxAdjustment;
                        renderParent.modifyBox(BOX_STANDARD.PADDING_TOP, (boxReset.marginTop === 0 ? this.marginTop : 0) + (boxReset.paddingTop === 0 ? this.paddingTop : 0) + boxAdjustment.marginTop + boxAdjustment.paddingTop);
                        renderParent.modifyBox(BOX_STANDARD.PADDING_RIGHT, (boxReset.marginRight === 0 ? this.marginRight : 0) + (boxReset.paddingRight === 0 ? this.paddingRight : 0) + boxAdjustment.marginRight + boxAdjustment.paddingRight);
                        renderParent.modifyBox(BOX_STANDARD.PADDING_BOTTOM, (boxReset.marginBottom === 0 ? this.marginBottom : 0) + (boxReset.paddingBottom === 0 ? this.paddingBottom : 0) + boxAdjustment.marginBottom + boxAdjustment.paddingBottom);
                        renderParent.modifyBox(BOX_STANDARD.PADDING_LEFT, (boxReset.marginLeft === 0 ? this.marginLeft : 0) + (boxReset.paddingLeft === 0 ? this.paddingLeft : 0) + boxAdjustment.marginLeft + boxAdjustment.paddingLeft);
                    }
                }
            }
        }

        public applyCustomizations(overwrite = true) {
            const { tagName, controlName } = this;
            let assign = API_ANDROID[0].assign;
            setCustomization(this, assign[tagName], overwrite);
            setCustomization(this, assign[controlName], overwrite);
            const api = API_ANDROID[this.api];
            if (api) {
                assign = api.assign;
                setCustomization(this, assign[tagName], overwrite);
                setCustomization(this, assign[controlName], overwrite);
            }
        }

        public setSingleLine(ellipsize?: boolean) {
            if (this.textElement && (this.naturalChild || this.plainText) && (ellipsize || !this.hasPX('width'))) {
                const parent = this.actualParent;
                if (parent?.preserveWhiteSpace === false && parent.tagName !== 'CODE' && (!this.multiline || parent.css('whiteSpace') === 'nowrap')) {
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
                        const value = this.elementId?.trim() || getNamedItem(this.element as HTMLElement, 'name');
                        if (value !== '') {
                            name = value.replace(/[^\w$\-_.]/g, '_').toLowerCase();
                            if (name === 'parent' || RESERVED_JAVA.has(name)) {
                                name = '_' + name;
                            }
                        }
                    }
                    return this._controlId = convertWord(ResourceUI.generateId('android', name || fromLastIndexOf(controlName, '.').toLowerCase(), name ? 0 : 1));
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
                result = {
                    positionTranslation: this.layoutConstraint,
                    positionRelative: this.layoutRelative,
                    maxDimension: this.textElement || this.imageContainer
                } as AndroidSupportUI;
                if (this.containerType !== 0) {
                    this._cached.support = result;
                }
            }
            return result;
        }

        set renderExclude(value) {
            this._cached.renderExclude = value;
        }
        get renderExclude(): boolean {
            const result = this._cached.renderExclude;
            if (result !== undefined) {
                return result;
            }
            else if (this.naturalChild && !this.rootElement) {
                if (this.plainText) {
                    return this.bounds.height === 0;
                }
                else if (!this.pageFlow) {
                    this._cached.renderExclude = excludeHorizontal(this) || excludeVertical(this) || /^rect\(0[a-z]*,\s+0[a-z]*,\s+0[a-z]*,\s+0[a-z]*\)$/.test(this.css('clip'));
                    return this._cached.renderExclude;
                }
                else if (this.styleElement && this.length === 0 && !this.imageElement && !this.pseudoElement) {
                    const parent = this.renderParent || this.parent as T;
                    if (parent.layoutFrame) {
                        return excludeHorizontal(this) || excludeVertical(this);
                    }
                    else if (parent.layoutVertical) {
                        return excludeVertical(this);
                    }
                    else {
                        return excludeHorizontal(this) && (parent.layoutHorizontal || excludeVertical(this));
                    }
                }
            }
            return false;
        }

        get baselineHeight() {
            let result = this._cached.baselineHeight;
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
                this._cached.baselineHeight = result;
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
            while (target !== undefined);
            return this;
        }

        set anchored(value) {
            this.constraint.horizontal = value;
            this.constraint.vertical = value;
        }
        get anchored() {
            return this.constraint.horizontal && this.constraint.vertical;
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
            return this._namespaces['android']!['layout_width'] || '';
        }

        get layoutHeight() {
            return this._namespaces['android']!['layout_height'] || '';
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