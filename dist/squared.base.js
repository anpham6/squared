/* squared.base 0.9.0
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory((global.squared = global.squared || {}, global.squared.base = {})));
}(this, function (exports) { 'use strict';

    const $util = squared.lib.util;
    class NodeList extends squared.lib.base.Container {
        constructor(children) {
            super(children);
            this._currentId = 0;
        }
        static outerRegion(node) {
            const nodes = node.duplicate();
            let top = nodes[0];
            let right = top;
            let bottom = top;
            let left = top;
            node.each(item => item.companion && !item.companion.visible && nodes.push(item.companion));
            for (let i = 1; i < nodes.length; i++) {
                const item = nodes[i];
                if (item.linear.top < top.linear.top) {
                    top = item;
                }
                if (item.linear.right > right.linear.right) {
                    right = item;
                }
                if (item.linear.bottom > bottom.linear.bottom) {
                    bottom = item;
                }
                if (item.linear.left < left.linear.left) {
                    left = item;
                }
            }
            return {
                top: top.linear.top,
                right: right.linear.right,
                bottom: bottom.linear.bottom,
                left: left.linear.left
            };
        }
        static actualParent(list) {
            for (const node of list) {
                if (node.naturalElement) {
                    if (node.actualParent) {
                        return node.actualParent;
                    }
                }
                else if (node.length) {
                    const parent = NodeList.actualParent(node.children);
                    if (parent) {
                        return parent;
                    }
                }
            }
            return undefined;
        }
        static baseline(list, text = false) {
            let baseline = $util.filterArray(list, item => item.baseline || $util.isLength(item.verticalAlign) && item.verticalAlign !== '0px');
            if (baseline.length) {
                list = baseline;
            }
            baseline = $util.filterArray(list, item => item.textElement || !item.verticalAlign.startsWith('text-'));
            if (baseline.length) {
                list = baseline;
            }
            if (text) {
                $util.spliceArray(list, item => item.imageElement || !item.naturalElement);
            }
            let lineHeight = 0;
            let boundsHeight = 0;
            for (const item of list) {
                lineHeight = Math.max(lineHeight, item.lineHeight);
                boundsHeight = Math.max(boundsHeight, item.actualHeight);
            }
            $util.spliceArray(list, item => lineHeight > boundsHeight ? item.lineHeight !== lineHeight : !$util.withinRange(item.actualHeight, boundsHeight));
            return list.sort((a, b) => {
                if (a.groupParent || a.length || (!a.baseline && b.baseline)) {
                    return 1;
                }
                else if (b.groupParent || b.length || (a.baseline && !b.baseline)) {
                    return -1;
                }
                else if (!a.imageElement || !b.imageElement) {
                    if (a.multiline || b.multiline) {
                        if (a.lineHeight > 0 && b.lineHeight > 0) {
                            return a.lineHeight <= b.lineHeight ? 1 : -1;
                        }
                        else if (a.fontSize === b.fontSize) {
                            return a.htmlElement || !b.htmlElement ? -1 : 1;
                        }
                    }
                    else if (a.textElement && b.textElement) {
                        if (a.fontSize === b.fontSize) {
                            if (a.htmlElement && !b.htmlElement) {
                                return -1;
                            }
                            else if (!a.htmlElement && b.htmlElement) {
                                return 1;
                            }
                            return a.siblingIndex >= b.siblingIndex ? 1 : -1;
                        }
                        return a.fontSize > b.fontSize ? -1 : 1;
                    }
                    else if (a.containerType !== b.containerType) {
                        if (a.textElement) {
                            return -1;
                        }
                        else if (b.textElement) {
                            return 1;
                        }
                        else if (a.imageElement) {
                            return -1;
                        }
                        else if (b.imageElement) {
                            return 1;
                        }
                        return a.containerType < b.containerType ? -1 : 1;
                    }
                }
                return a.actualHeight <= b.actualHeight ? 1 : -1;
            });
        }
        static linearData(list, clearOnly = false) {
            const nodes = [];
            const floating = new Set();
            const clearable = {};
            const floated = new Set();
            const cleared = new Map();
            let linearX = false;
            let linearY = false;
            for (const node of list) {
                if (node.pageFlow) {
                    if (floating.size) {
                        const previousFloat = [];
                        const clear = node.css('clear');
                        switch (clear) {
                            case 'left':
                                previousFloat.push(clearable.left);
                                break;
                            case 'right':
                                previousFloat.push(clearable.right);
                                break;
                            case 'both':
                                previousFloat.push(clearable.left, clearable.right);
                                break;
                        }
                        for (const item of previousFloat) {
                            if (item && floating.has(item.float) && !node.floating && node.linear.top >= item.linear.bottom) {
                                floating.delete(item.float);
                                clearable[item.float] = undefined;
                            }
                        }
                        if (clear === 'both') {
                            cleared.set(node, floating.size === 2 ? 'both' : floating.values().next().value);
                            floating.clear();
                            clearable.left = undefined;
                            clearable.right = undefined;
                        }
                        else if (floating.has(clear)) {
                            cleared.set(node, clear);
                            floating.delete(clear);
                            clearable[clear] = undefined;
                        }
                    }
                    if (node.floating) {
                        floating.add(node.float);
                        floated.add(node.float);
                        clearable[node.float] = node;
                    }
                    nodes.push(node);
                }
            }
            if (nodes.length > 0) {
                if (!clearOnly) {
                    const siblings = [nodes[0]];
                    let x = 1;
                    let y = 1;
                    for (let i = 1; i < nodes.length; i++) {
                        const previousSiblings = nodes[i].previousSiblings();
                        if (nodes[i].alignedVertically(previousSiblings, siblings, cleared)) {
                            y++;
                        }
                        else {
                            x++;
                        }
                        siblings.push(nodes[i]);
                    }
                    linearX = x === nodes.length;
                    linearY = y === nodes.length;
                    if (linearX && floated.size) {
                        let boxLeft = Number.POSITIVE_INFINITY;
                        let boxRight = Number.NEGATIVE_INFINITY;
                        let floatLeft = Number.NEGATIVE_INFINITY;
                        let floatRight = Number.POSITIVE_INFINITY;
                        for (const node of nodes) {
                            boxLeft = Math.min(boxLeft, node.linear.left);
                            boxRight = Math.max(boxRight, node.linear.right);
                            if (node.floating) {
                                if (node.float === 'left') {
                                    floatLeft = Math.max(floatLeft, node.linear.right);
                                }
                                else {
                                    floatRight = Math.min(floatRight, node.linear.left);
                                }
                            }
                        }
                        for (let i = 0, j = 0, k = 0, l = 0, m = 0; i < nodes.length; i++) {
                            const item = nodes[i];
                            if (Math.floor(item.linear.left) <= boxLeft) {
                                j++;
                            }
                            if (Math.ceil(item.linear.right) >= boxRight) {
                                k++;
                            }
                            if (!item.floating) {
                                if (item.linear.left === floatLeft) {
                                    l++;
                                }
                                if (item.linear.right === floatRight) {
                                    m++;
                                }
                            }
                            if (i === 0) {
                                continue;
                            }
                            if (j === 2 || k === 2 || l === 2 || m === 2) {
                                linearX = false;
                                break;
                            }
                            const previous = nodes[i - 1];
                            if (previous.floating && item.linear.top >= previous.linear.bottom || $util.withinRange(item.linear.left, previous.linear.left)) {
                                linearX = false;
                                break;
                            }
                        }
                    }
                }
            }
            return {
                linearX,
                linearY,
                cleared,
                floated
            };
        }
        static partitionRows(list) {
            const parent = this.actualParent(list);
            const children = parent ? parent.actualChildren : list;
            const cleared = this.linearData(list, true).cleared;
            const groupParent = $util.filterArray(list, node => node.groupParent);
            const result = [];
            let row = [];
            for (let i = 0; i < children.length; i++) {
                const node = children[i];
                let next = false;
                for (let j = 0; j < groupParent.length; j++) {
                    const group = groupParent[j];
                    if (group.contains(node) || group === node) {
                        if (row.length) {
                            result.push(row);
                        }
                        result.push([group]);
                        row = [];
                        groupParent.splice(j, 1);
                        next = true;
                        break;
                    }
                }
                if (next) {
                    continue;
                }
                const previousSiblings = node.previousSiblings();
                if (i === 0 || previousSiblings.length === 0) {
                    if (list.includes(node)) {
                        row.push(node);
                    }
                }
                else {
                    if (node.alignedVertically(previousSiblings, row, cleared)) {
                        if (row.length) {
                            result.push(row);
                        }
                        if (list.includes(node)) {
                            row = [node];
                        }
                        else {
                            row = [];
                        }
                    }
                    else if (list.includes(node)) {
                        row.push(node);
                    }
                }
                if (i === children.length - 1 && row.length) {
                    result.push(row);
                }
            }
            return result;
        }
        static siblingIndex(a, b) {
            return a.siblingIndex >= b.siblingIndex ? 1 : -1;
        }
        append(node, delegate = true) {
            super.append(node);
            if (delegate && this.afterAppend) {
                this.afterAppend.call(this, node);
            }
            return this;
        }
        reset() {
            this._currentId = 0;
            this.clear();
            return this;
        }
        get nextId() {
            return ++this._currentId;
        }
    }

    const $util$1 = squared.lib.util;
    class Layout extends squared.lib.base.Container {
        constructor(parent, node, containerType = 0, alignmentType = 0, children) {
            super(children);
            this.parent = parent;
            this.node = node;
            this.containerType = containerType;
            this.alignmentType = alignmentType;
            this.rowCount = 0;
            this.columnCount = 0;
            this.renderType = 0;
            this.renderIndex = -1;
            this.itemCount = 0;
            if (children) {
                this.init();
            }
        }
        init() {
            const linearData = NodeList.linearData(this.children);
            this._floated = linearData.floated;
            this._cleared = linearData.cleared;
            this._linearX = linearData.linearX;
            this._linearY = linearData.linearY;
            if (linearData.floated.size) {
                this.add(64 /* FLOAT */);
            }
            if (this.every(item => item.float === 'right')) {
                this.add(512 /* RIGHT */);
            }
            this.itemCount = this.children.length;
        }
        setType(containerType, ...alignmentType) {
            this.containerType = containerType;
            for (const value of alignmentType) {
                this.add(value);
            }
        }
        add(value) {
            if (!$util$1.hasBit(this.alignmentType, value)) {
                this.alignmentType |= value;
            }
            return this.alignmentType;
        }
        delete(value) {
            if ($util$1.hasBit(this.alignmentType, value)) {
                this.alignmentType ^= value;
            }
            return this.alignmentType;
        }
        retain(list) {
            super.retain(list);
            this.itemCount = list.length;
            return this;
        }
        get floated() {
            return this._floated || new Set();
        }
        get cleared() {
            return this._cleared || new Map();
        }
        get linearX() {
            return this._linearX !== undefined ? this._linearX : true;
        }
        get linearY() {
            return this._linearY !== undefined ? this._linearY : false;
        }
        get visible() {
            return this.filter(node => node.visible);
        }
    }

    var APP_SECTION;
    (function (APP_SECTION) {
        APP_SECTION[APP_SECTION["DOM_TRAVERSE"] = 2] = "DOM_TRAVERSE";
        APP_SECTION[APP_SECTION["EXTENSION"] = 4] = "EXTENSION";
        APP_SECTION[APP_SECTION["RENDER"] = 8] = "RENDER";
        APP_SECTION[APP_SECTION["ALL"] = 14] = "ALL";
    })(APP_SECTION || (APP_SECTION = {}));
    var NODE_RESOURCE;
    (function (NODE_RESOURCE) {
        NODE_RESOURCE[NODE_RESOURCE["BOX_STYLE"] = 2] = "BOX_STYLE";
        NODE_RESOURCE[NODE_RESOURCE["BOX_SPACING"] = 4] = "BOX_SPACING";
        NODE_RESOURCE[NODE_RESOURCE["FONT_STYLE"] = 8] = "FONT_STYLE";
        NODE_RESOURCE[NODE_RESOURCE["VALUE_STRING"] = 16] = "VALUE_STRING";
        NODE_RESOURCE[NODE_RESOURCE["IMAGE_SOURCE"] = 32] = "IMAGE_SOURCE";
        NODE_RESOURCE[NODE_RESOURCE["ASSET"] = 56] = "ASSET";
        NODE_RESOURCE[NODE_RESOURCE["ALL"] = 126] = "ALL";
    })(NODE_RESOURCE || (NODE_RESOURCE = {}));
    var NODE_PROCEDURE;
    (function (NODE_PROCEDURE) {
        NODE_PROCEDURE[NODE_PROCEDURE["CONSTRAINT"] = 2] = "CONSTRAINT";
        NODE_PROCEDURE[NODE_PROCEDURE["LAYOUT"] = 4] = "LAYOUT";
        NODE_PROCEDURE[NODE_PROCEDURE["ALIGNMENT"] = 8] = "ALIGNMENT";
        NODE_PROCEDURE[NODE_PROCEDURE["AUTOFIT"] = 16] = "AUTOFIT";
        NODE_PROCEDURE[NODE_PROCEDURE["OPTIMIZATION"] = 32] = "OPTIMIZATION";
        NODE_PROCEDURE[NODE_PROCEDURE["CUSTOMIZATION"] = 64] = "CUSTOMIZATION";
        NODE_PROCEDURE[NODE_PROCEDURE["ACCESSIBILITY"] = 128] = "ACCESSIBILITY";
        NODE_PROCEDURE[NODE_PROCEDURE["LOCALIZATION"] = 256] = "LOCALIZATION";
        NODE_PROCEDURE[NODE_PROCEDURE["POSITIONAL"] = 46] = "POSITIONAL";
        NODE_PROCEDURE[NODE_PROCEDURE["NONPOSITIONAL"] = 464] = "NONPOSITIONAL";
        NODE_PROCEDURE[NODE_PROCEDURE["ALL"] = 510] = "ALL";
    })(NODE_PROCEDURE || (NODE_PROCEDURE = {}));

    var enumeration = /*#__PURE__*/Object.freeze({
        get APP_SECTION () { return APP_SECTION; },
        get NODE_RESOURCE () { return NODE_RESOURCE; },
        get NODE_PROCEDURE () { return NODE_PROCEDURE; }
    });

    const $color = squared.lib.color;
    const $css = squared.lib.css;
    const $element = squared.lib.element;
    const $math = squared.lib.math;
    const $util$2 = squared.lib.util;
    const $xml = squared.lib.xml;
    const STRING_COLORSTOP = `(rgba?\\(\\d+, \\d+, \\d+(?:, [\\d.]+)?\\)|#[a-zA-Z\\d]{3,}|[a-z]+)\\s*(${$util$2.STRING_PATTERN.LENGTH_PERCENTAGE}|${$util$2.STRING_PATTERN.ANGLE}|(?:${$util$2.STRING_PATTERN.CALC}(?=,)|${$util$2.STRING_PATTERN.CALC}))?,?\\s*`;
    const REGEXP_BACKGROUNDIMAGE = new RegExp(`(?:initial|url\\("?.+?"?\\)|(repeating)?-?(linear|radial|conic)-gradient\\(((?:to [a-z ]+|(?:from )?-?[\\d.]+(?:deg|rad|turn|grad)|circle|ellipse|closest-side|closest-corner|farthest-side|farthest-corner)?(?:\\s*at [\\w %]+)?),?\\s*((?:${STRING_COLORSTOP})+)\\))`, 'g');
    const REGEXP_TAGNAME = /(<([^>]+)>)/ig;
    const REGEXP_LINEBREAK = /\s*<br[^>]*>\s*/g;
    function removeExcluded(node, element, attr) {
        let value = element[attr];
        for (const item of node.actualChildren) {
            if ((item.excluded || item.dataset.target) && $util$2.isString(item[attr])) {
                value = value.replace(item[attr], '');
            }
        }
        return value;
    }
    function parseColorStops(node, gradient, value, opacity) {
        const radial = gradient;
        const repeating = !!radial.repeating;
        const extent = repeating && gradient.type === 'radial' ? radial.radiusExtent / radial.radius : 1;
        const result = [];
        const pattern = new RegExp(STRING_COLORSTOP, 'g');
        let match;
        while ((match = pattern.exec(value)) !== null) {
            const color = $color.parseColor(match[1], opacity, true);
            if (color) {
                const item = { color, offset: -1 };
                if (gradient.type === 'conic') {
                    if (match[3] && match[4]) {
                        item.offset = $util$2.convertAngle(match[3], match[4]) / 360;
                    }
                }
                else if (match[2]) {
                    if ($util$2.isPercent(match[2])) {
                        item.offset = parseFloat(match[2]) / 100;
                    }
                    else if (repeating) {
                        const horizontal = radial.horizontal;
                        const dimension = gradient.type === 'radial' ? radial.radius : gradient.dimension[horizontal ? 'width' : 'height'];
                        if ($util$2.isLength(match[2])) {
                            item.offset = node.parseUnit(match[2], horizontal, false) / dimension;
                        }
                        else if ($util$2.isCalc(match[2])) {
                            item.offset = $util$2.calculate(match[6], dimension, node.fontSize) / dimension;
                        }
                    }
                    if (repeating && item.offset !== -1) {
                        item.offset *= extent;
                    }
                }
                if (result.length === 0) {
                    if (item.offset === -1) {
                        item.offset = 0;
                    }
                    else if (item.offset > 0) {
                        result.push({ color, offset: 0 });
                    }
                }
                result.push(item);
            }
        }
        const lastStop = result[result.length - 1];
        if (lastStop.offset === -1) {
            lastStop.offset = 1;
        }
        let percent = 0;
        for (let i = 0; i < result.length; i++) {
            const item = result[i];
            if (item.offset === -1) {
                if (i === 0) {
                    item.offset = 0;
                }
                else {
                    for (let j = i + 1, k = 2; j < result.length - 1; j++, k++) {
                        if (result[j].offset !== -1) {
                            item.offset = (percent + result[j].offset) / k;
                            break;
                        }
                    }
                    if (item.offset === -1) {
                        item.offset = percent + lastStop.offset / (result.length - 1);
                    }
                }
            }
            percent = item.offset;
        }
        if (repeating) {
            if (percent < 100) {
                const original = result.slice(0);
                complete: {
                    let basePercent = percent;
                    while (percent < 100) {
                        for (let i = 0; i < original.length; i++) {
                            percent = Math.min(basePercent + original[i].offset, 1);
                            result.push(Object.assign({}, original[i], { offset: percent }));
                            if (percent === 1) {
                                break complete;
                            }
                        }
                        basePercent = percent;
                    }
                }
            }
        }
        else if (percent < 1) {
            result.push(Object.assign({}, result[result.length - 1], { offset: 1 }));
        }
        return result;
    }
    function parseAngle(value) {
        if (value) {
            let degree = $util$2.parseAngle(value.trim());
            if (degree < 0) {
                degree += 360;
            }
            return degree;
        }
        return 0;
    }
    function getGradientPosition(value) {
        return value ? /(.+?)?\s*at (.+?)$/.exec(value) : null;
    }
    function replaceWhiteSpace(node, element, value) {
        const renderParent = node.renderParent;
        if (node.multiline && renderParent && !renderParent.layoutVertical) {
            value = value.replace(/^\s*\n/, '');
        }
        switch (node.css('whiteSpace')) {
            case 'nowrap':
                value = value.replace(/\n/g, ' ');
                break;
            case 'pre':
            case 'pre-wrap':
                if (renderParent && !renderParent.layoutVertical) {
                    value = value.replace(/^\n/, '');
                }
                value = value
                    .replace(/\n/g, '\\n')
                    .replace(/\s/g, '&#160;');
                break;
            case 'pre-line':
                value = value
                    .replace(/\n/g, '\\n')
                    .replace(/\s+/g, ' ');
                break;
            default:
                if (element.previousSibling && $element.isLineBreak(element.previousSibling)) {
                    value = value.replace($util$2.REGEXP_COMPILED.LEADINGSPACE, '');
                }
                if (element.nextSibling && $element.isLineBreak(element.nextSibling)) {
                    value = value.replace($util$2.REGEXP_COMPILED.TRAILINGSPACE, '');
                }
                return [value, false];
        }
        return [value, true];
    }
    function getBackgroundSize(node, index, value) {
        if (value) {
            const sizes = value.split($util$2.REGEXP_COMPILED.SEPARATOR);
            return Resource.getBackgroundSize(node, sizes[index % sizes.length]);
        }
        return undefined;
    }
    function applyTextTransform(value, transform) {
        switch (transform) {
            case 'uppercase':
                value = value.toUpperCase();
                break;
            case 'lowercase':
                value = value.toLowerCase();
                break;
        }
        return value;
    }
    class Resource {
        constructor(application, cache) {
            this.application = application;
            this.cache = cache;
        }
        static generateId(section, name, start = 1) {
            const prefix = name;
            let i = start;
            if (start === 1) {
                name += `_${i.toString()}`;
            }
            const previous = this.ASSETS.ids.get(section) || [];
            do {
                if (!previous.includes(name)) {
                    previous.push(name);
                    break;
                }
                else {
                    name = `${prefix}_${(++i).toString()}`;
                }
            } while (true);
            this.ASSETS.ids.set(section, previous);
            return name;
        }
        static insertStoredAsset(asset, name, value) {
            const stored = Resource.STORED[asset];
            if (stored && $util$2.hasValue(value)) {
                let result = this.getStoredName(asset, value);
                if (result === '') {
                    if ($util$2.isNumber(name)) {
                        name = `__${name}`;
                    }
                    let i = 0;
                    do {
                        result = name;
                        if (i > 0) {
                            result += `_${i}`;
                        }
                        if (!stored.has(result)) {
                            stored.set(result, value);
                        }
                        i++;
                    } while (stored.has(result) && stored.get(result) !== value);
                }
                return result;
            }
            return '';
        }
        static getOptionArray(element, replaceEntities = false) {
            const stringArray = [];
            const textTransform = $css.getStyle(element).textTransform;
            let numberArray = [];
            let i = -1;
            while (++i < element.children.length) {
                const item = element.children[i];
                const value = item.text.trim();
                if (value !== '') {
                    if (numberArray && stringArray.length === 0 && $util$2.isNumber(value)) {
                        numberArray.push(value);
                    }
                    else {
                        if (numberArray && numberArray.length) {
                            i = -1;
                            numberArray = undefined;
                            continue;
                        }
                        if (value !== '') {
                            stringArray.push(applyTextTransform(replaceEntities ? $xml.replaceEntity(value) : value, textTransform));
                        }
                    }
                }
            }
            return [stringArray.length ? stringArray : undefined, numberArray && numberArray.length ? numberArray : undefined];
        }
        static isBackgroundVisible(object) {
            return object !== undefined && (object.backgroundImage !== undefined || object.borderTop !== undefined || object.borderRight !== undefined || object.borderBottom !== undefined || object.borderLeft !== undefined);
        }
        static getBackgroundSize(node, value) {
            let width = 0;
            let height = 0;
            switch (value) {
                case '':
                case 'cover':
                case 'contain':
                case '100% 100%':
                case 'auto':
                case 'auto auto':
                case 'initial':
                    return undefined;
                default:
                    const dimensions = value.split(' ');
                    if (dimensions.length === 1) {
                        dimensions[1] = dimensions[0];
                    }
                    for (let i = 0; i < dimensions.length; i++) {
                        if (dimensions[i] === 'auto') {
                            dimensions[i] = '100%';
                        }
                        if (i === 0) {
                            width = node.parseUnit(dimensions[i], true, false);
                        }
                        else {
                            height = node.parseUnit(dimensions[i], false, false);
                        }
                    }
                    break;
            }
            return width > 0 && height > 0 ? { width: Math.round(width), height: Math.round(height) } : undefined;
        }
        static getStoredName(asset, value) {
            if (Resource.STORED[asset]) {
                for (const [name, data] of Resource.STORED[asset].entries()) {
                    if ($util$2.isEqual(value, data)) {
                        return name;
                    }
                }
            }
            return '';
        }
        finalize(data) { }
        reset() {
            for (const name in Resource.ASSETS) {
                Resource.ASSETS[name] = new Map();
            }
            for (const name in Resource.STORED) {
                Resource.STORED[name] = new Map();
            }
            if (this.fileHandler) {
                this.fileHandler.reset();
            }
        }
        setBoxStyle() {
            for (const node of this.cache) {
                if (node.visible && node.styleElement) {
                    const boxStyle = {
                        backgroundColor: '',
                        backgroundSize: '',
                        backgroundRepeat: '',
                        backgroundPositionX: '',
                        backgroundPositionY: '',
                        backgroundImage: undefined
                    };
                    if (node.css('border') !== '0px none rgb(0, 0, 0)') {
                        boxStyle.borderTop = undefined;
                        boxStyle.borderRight = undefined;
                        boxStyle.borderBottom = undefined;
                        boxStyle.borderLeft = undefined;
                        boxStyle.borderRadius = undefined;
                    }
                    for (const attr in boxStyle) {
                        const value = node.css(attr);
                        switch (attr) {
                            case 'backgroundColor':
                                if (!(!node.has('backgroundColor') && (value === node.cssAscend('backgroundColor', false, true) || node.documentParent.visible && $css.isInheritedStyle(node.element, 'backgroundColor')))) {
                                    const color = $color.parseColor(value, node.css('opacity'));
                                    boxStyle.backgroundColor = color ? color.valueAsRGBA : '';
                                }
                                break;
                            case 'backgroundSize':
                            case 'backgroundRepeat':
                            case 'backgroundPositionX':
                            case 'backgroundPositionY':
                                boxStyle[attr] = value;
                                break;
                            case 'backgroundImage':
                                if (value !== 'none' && node.hasResource(NODE_RESOURCE.IMAGE_SOURCE)) {
                                    const images = [];
                                    const opacity = node.css('opacity');
                                    let match;
                                    let i = 0;
                                    while ((match = REGEXP_BACKGROUNDIMAGE.exec(value)) !== null) {
                                        const [complete, repeating, type, direction, colorStop] = match;
                                        if (complete === 'initial' || complete.startsWith('url')) {
                                            images.push(complete);
                                        }
                                        else {
                                            const dimension = getBackgroundSize(node, i, boxStyle.backgroundSize) || node.actualDimension;
                                            let gradient;
                                            switch (type) {
                                                case 'conic': {
                                                    const position = getGradientPosition(direction);
                                                    const conic = {
                                                        type,
                                                        dimension,
                                                        angle: parseAngle(direction)
                                                    };
                                                    conic.center = $css.getBackgroundPosition(position && position[2] || 'center', dimension, node.fontSize);
                                                    conic.colorStops = parseColorStops(node, conic, colorStop, opacity);
                                                    gradient = conic;
                                                    break;
                                                }
                                                case 'radial': {
                                                    const position = getGradientPosition(direction);
                                                    const radial = {
                                                        type,
                                                        repeating: repeating === 'repeating',
                                                        horizontal: node.actualWidth <= node.actualHeight,
                                                        dimension,
                                                        shape: position && position[1] === 'circle' ? 'circle' : 'ellipse'
                                                    };
                                                    radial.center = $css.getBackgroundPosition(position && position[2] || 'center', dimension, node.fontSize);
                                                    radial.closestCorner = Number.POSITIVE_INFINITY;
                                                    radial.farthestCorner = Number.NEGATIVE_INFINITY;
                                                    for (const corner of [[0, 0], [dimension.width, 0], [dimension.width, dimension.height], [0, dimension.height]]) {
                                                        const length = Math.round(Math.sqrt(Math.pow(Math.abs(corner[0] - radial.center.left), 2) + Math.pow(Math.abs(corner[1] - radial.center.top), 2)));
                                                        if (length < radial.closestCorner) {
                                                            radial.closestCorner = length;
                                                        }
                                                        if (length > radial.farthestCorner) {
                                                            radial.farthestCorner = length;
                                                        }
                                                    }
                                                    radial.closestSide = radial.center.top;
                                                    radial.farthestSide = radial.center.top;
                                                    for (const side of [dimension.width - radial.center.left, dimension.height - radial.center.top, radial.center.left]) {
                                                        if (side < radial.closestSide) {
                                                            radial.closestSide = side;
                                                        }
                                                        if (side > radial.farthestSide) {
                                                            radial.farthestSide = side;
                                                        }
                                                    }
                                                    radial.radius = radial.farthestCorner;
                                                    const extent = position && position[1];
                                                    switch (extent) {
                                                        case 'closest-corner':
                                                        case 'closest-side':
                                                        case 'farthest-side':
                                                            const length = radial[$util$2.convertCamelCase(extent)];
                                                            if (repeating) {
                                                                radial.radiusExtent = length;
                                                            }
                                                            else {
                                                                radial.radius = length;
                                                            }
                                                            break;
                                                        default:
                                                            radial.radiusExtent = radial.farthestCorner;
                                                            break;
                                                    }
                                                    radial.colorStops = parseColorStops(node, radial, colorStop, opacity);
                                                    gradient = radial;
                                                    break;
                                                }
                                                default: {
                                                    let angle = 180;
                                                    switch (direction) {
                                                        case 'to top':
                                                            angle = 0;
                                                            break;
                                                        case 'to right top':
                                                            angle = 45;
                                                            break;
                                                        case 'to right':
                                                            angle = 90;
                                                            break;
                                                        case 'to right bottom':
                                                            angle = 135;
                                                            break;
                                                        case 'to bottom':
                                                            break;
                                                        case 'to left bottom':
                                                            angle = 225;
                                                            break;
                                                        case 'to left':
                                                            angle = 270;
                                                            break;
                                                        case 'to left top':
                                                            angle = 315;
                                                            break;
                                                        default:
                                                            if (direction) {
                                                                angle = parseAngle(direction);
                                                            }
                                                            break;
                                                    }
                                                    const linear = {
                                                        type,
                                                        repeating: repeating === 'repeating',
                                                        horizontal: angle >= 45 && angle <= 135 || angle >= 225 && angle <= 315,
                                                        dimension,
                                                        angle
                                                    };
                                                    linear.colorStops = parseColorStops(node, linear, colorStop, opacity);
                                                    const width = dimension.width;
                                                    const height = dimension.height;
                                                    let x = $math.offsetAngleX(angle, width);
                                                    let y = $math.offsetAngleY(angle, height);
                                                    if (!$math.isEqual(Math.abs(x), Math.abs(y))) {
                                                        let oppositeAngle;
                                                        if (angle <= 90) {
                                                            oppositeAngle = $math.offsetAngle({ x: 0, y: height }, { x: width, y: 0 });
                                                        }
                                                        else if (angle <= 180) {
                                                            oppositeAngle = $math.offsetAngle({ x: 0, y: 0 }, { x: width, y: height });
                                                        }
                                                        else if (angle <= 270) {
                                                            oppositeAngle = $math.offsetAngle({ x: 0, y: 0 }, { x: -width, y: height });
                                                        }
                                                        else {
                                                            oppositeAngle = $math.offsetAngle({ x: 0, y: height }, { x: -width, y: 0 });
                                                        }
                                                        let a = Math.abs(oppositeAngle - angle);
                                                        let b = 90 - a;
                                                        const lenX = $math.trianguleASA(a, b, Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)));
                                                        x = $math.truncateFraction($math.offsetAngleX(angle, lenX[1]));
                                                        a = 90;
                                                        b = 90 - angle;
                                                        const lenY = $math.trianguleASA(a, b, x);
                                                        y = $math.truncateFraction($math.offsetAngleY(angle, lenY[0]));
                                                    }
                                                    linear.angleExtent = { x, y };
                                                    gradient = linear;
                                                    break;
                                                }
                                            }
                                            images.push(gradient);
                                        }
                                        i++;
                                    }
                                    if (i > 0) {
                                        boxStyle.backgroundImage = images;
                                    }
                                }
                                break;
                            case 'borderTop':
                            case 'borderRight':
                            case 'borderBottom':
                            case 'borderLeft': {
                                const style = node.css(`${attr}Style`) || 'none';
                                let width = node.css(`${attr}Width`) || '0px';
                                switch (width) {
                                    case 'thin':
                                        width = '1px';
                                        break;
                                    case 'medium':
                                        width = '2px';
                                        break;
                                    case 'thick':
                                        width = '3px';
                                        break;
                                }
                                let color = node.css(`${attr}Color`) || 'initial';
                                switch (color.toLowerCase()) {
                                    case 'initial':
                                        color = 'rgb(0, 0, 0)';
                                        break;
                                    case 'inherit':
                                    case 'currentcolor':
                                        color = $css.getInheritedStyle(node.element, `${attr}Color`);
                                        break;
                                }
                                if (style !== 'none' && width !== '0px') {
                                    const borderColor = $color.parseColor(color, node.css('opacity'));
                                    if (borderColor && !borderColor.transparent) {
                                        boxStyle[attr] = {
                                            width,
                                            style,
                                            color: borderColor.valueAsRGBA
                                        };
                                    }
                                }
                                break;
                            }
                            case 'borderRadius': {
                                if (value !== 'none') {
                                    const horizontal = node.actualWidth >= node.actualHeight;
                                    const [A, B] = node.css('borderTopLeftRadius').split(' ');
                                    const [C, D] = node.css('borderTopRightRadius').split(' ');
                                    const [E, F] = node.css('borderBottomRightRadius').split(' ');
                                    const [G, H] = node.css('borderBottomLeftRadius').split(' ');
                                    let borderRadius;
                                    if (!B && !D && !F && !H) {
                                        borderRadius = [A, C, E, G];
                                    }
                                    else {
                                        borderRadius = [A, B || A, C, D || C, E, F || E, G, H || G];
                                    }
                                    if (borderRadius.every(radius => radius === borderRadius[0])) {
                                        if (borderRadius[0] === '0px') {
                                            continue;
                                        }
                                        borderRadius.length = 1;
                                    }
                                    for (let i = 0; i < borderRadius.length; i++) {
                                        borderRadius[i] = node.convertPX(borderRadius[i], horizontal, false);
                                    }
                                    boxStyle.borderRadius = borderRadius;
                                }
                                break;
                            }
                        }
                    }
                    if (boxStyle.borderTop && boxStyle.borderRight && boxStyle.borderBottom && boxStyle.borderLeft) {
                        let valid = true;
                        for (const attr in boxStyle.borderTop) {
                            const value = boxStyle.borderTop[attr];
                            if (value !== boxStyle.borderRight[attr] || value !== boxStyle.borderBottom[attr] || value !== boxStyle.borderLeft[attr]) {
                                valid = false;
                                break;
                            }
                        }
                        if (valid) {
                            boxStyle.border = boxStyle.borderTop;
                        }
                    }
                    node.data(Resource.KEY_NAME, 'boxStyle', boxStyle);
                }
            }
        }
        setFontStyle() {
            for (const node of this.cache) {
                if (!(node.element === null ||
                    node.renderChildren.length ||
                    node.imageElement ||
                    node.svgElement ||
                    node.tagName === 'HR' ||
                    node.inlineText && !node.preserveWhiteSpace && node.element.innerHTML.trim() === '' && !Resource.isBackgroundVisible(node.data(Resource.KEY_NAME, 'boxStyle')))) {
                    const opacity = node.css('opacity');
                    const color = $color.parseColor(node.css('color'), opacity);
                    let fontFamily = node.css('fontFamily');
                    let fontSize = node.css('fontSize');
                    let fontWeight = node.css('fontWeight');
                    if ($util$2.isUserAgent(16 /* EDGE */) && !node.has('fontFamily')) {
                        switch (node.tagName) {
                            case 'TT':
                            case 'CODE':
                            case 'KBD':
                            case 'SAMP':
                                fontFamily = 'monospace';
                                break;
                        }
                    }
                    if ($util$2.convertInt(fontSize) === 0) {
                        switch (fontSize) {
                            case 'xx-small':
                                fontSize = '8px';
                                break;
                            case 'x-small':
                                fontSize = '10px';
                                break;
                            case 'small':
                                fontSize = '13px';
                                break;
                            case 'medium':
                                fontSize = '16px';
                                break;
                            case 'large':
                                fontSize = '18px';
                                break;
                            case 'x-large':
                                fontSize = '24px';
                                break;
                            case 'xx-large':
                                fontSize = '32px';
                                break;
                        }
                    }
                    if (!$util$2.isNumber(fontWeight)) {
                        switch (fontWeight) {
                            case 'lighter':
                                fontWeight = '200';
                                break;
                            case 'bold':
                                fontWeight = '700';
                                break;
                            case 'bolder':
                                fontWeight = '900';
                                break;
                            default:
                                fontWeight = '400';
                                break;
                        }
                    }
                    const result = {
                        fontFamily,
                        fontStyle: node.css('fontStyle'),
                        fontSize,
                        fontWeight,
                        color: color ? color.valueAsRGBA : ''
                    };
                    node.data(Resource.KEY_NAME, 'fontStyle', result);
                }
            }
        }
        setValueString() {
            for (const node of this.cache) {
                const element = node.element;
                if (element && node.visible) {
                    let name = '';
                    let value = '';
                    let inlineTrim = false;
                    let performTrim = true;
                    switch (element.tagName) {
                        case 'INPUT':
                            value = element.value.trim();
                            switch (element.type) {
                                case 'radio':
                                case 'checkbox':
                                    if (node.companion && !node.companion.visible) {
                                        value = node.companion.textContent.trim();
                                    }
                                    break;
                                case 'submit':
                                    if (value === '' && !$util$2.REGEXP_COMPILED.URL.test(node.css('background'))) {
                                        value = 'Submit';
                                    }
                                    break;
                                case 'time':
                                    if (value === '') {
                                        value = '--:-- --';
                                    }
                                    break;
                                case 'date':
                                case 'datetime-local':
                                    if (value === '') {
                                        switch ((new Intl.DateTimeFormat()).resolvedOptions().locale) {
                                            case 'en-US':
                                                value = 'mm/dd/yyyy';
                                                break;
                                            default:
                                                value = 'dd/mm/yyyy';
                                                break;
                                        }
                                        if (element.type === 'datetime-local') {
                                            value += ' --:-- --';
                                        }
                                    }
                                    break;
                                case 'week':
                                    if (value === '') {
                                        value = 'Week: --, ----';
                                    }
                                    break;
                                case 'month':
                                    if (value === '') {
                                        value = '--------- ----';
                                    }
                                    break;
                                case 'url':
                                case 'email':
                                case 'search':
                                case 'number':
                                case 'tel':
                                    if (value === '') {
                                        value = element.placeholder;
                                    }
                                    break;
                                case 'file':
                                    value = 'Choose File';
                                    break;
                            }
                            break;
                        case 'TEXTAREA':
                            value = element.value.trim();
                            break;
                        case 'BUTTON':
                            value = element.innerText;
                            break;
                        case 'IFRAME':
                            value = element.src;
                            performTrim = false;
                            break;
                        default:
                            if (node.plainText) {
                                name = node.textContent.trim();
                                value = node.textContent
                                    .replace(/&[A-Za-z]+;/g, match => match.replace('&', '&amp;'))
                                    .replace(/\u00A0/g, '&#160;');
                                [value, inlineTrim] = replaceWhiteSpace(node, element, value);
                            }
                            else if (node.inlineText) {
                                name = node.textContent.trim();
                                if (element.tagName === 'CODE') {
                                    value = removeExcluded(node, element, 'innerHTML');
                                }
                                else if ($element.hasLineBreak(element, true)) {
                                    value = removeExcluded(node, element, 'innerHTML')
                                        .replace(REGEXP_LINEBREAK, '\\n')
                                        .replace(REGEXP_TAGNAME, '');
                                }
                                else {
                                    value = removeExcluded(node, element, 'textContent');
                                }
                                [value, inlineTrim] = replaceWhiteSpace(node, element, value);
                            }
                            else if (node.htmlElement && element.innerText.trim() === '' && Resource.isBackgroundVisible(node.data(Resource.KEY_NAME, 'boxStyle'))) {
                                value = element.innerText;
                                performTrim = false;
                            }
                            break;
                    }
                    if (this.application.userSettings.replaceCharacterEntities) {
                        value = $xml.replaceEntity(value);
                    }
                    if (value !== '') {
                        if (performTrim) {
                            const previousSibling = node.previousSiblings().pop();
                            const nextSibling = node.nextSiblings().shift();
                            let previousSpaceEnd = false;
                            if (previousSibling === undefined || previousSibling.multiline || previousSibling.lineBreak || previousSibling.plainText && $util$2.REGEXP_COMPILED.TRAILINGSPACE.test(previousSibling.textContent)) {
                                value = value.replace($util$2.REGEXP_COMPILED.LEADINGSPACE, '');
                            }
                            else if (previousSibling.element) {
                                previousSpaceEnd = $util$2.REGEXP_COMPILED.TRAILINGSPACE.test(previousSibling.element.innerText || previousSibling.textContent);
                            }
                            if (inlineTrim) {
                                const original = value;
                                value = value.trim();
                                if (previousSibling && !previousSibling.block && !previousSibling.lineBreak && !previousSpaceEnd && $util$2.REGEXP_COMPILED.LEADINGSPACE.test(original)) {
                                    value = '&#160;' + value;
                                }
                                if (nextSibling && !nextSibling.lineBreak && $util$2.REGEXP_COMPILED.TRAILINGSPACE.test(original)) {
                                    value += '&#160;';
                                }
                            }
                            else if (value.trim() !== '') {
                                value = value.replace($util$2.REGEXP_COMPILED.LEADINGSPACE, previousSibling && (previousSibling.block ||
                                    previousSibling.lineBreak ||
                                    previousSpaceEnd && previousSibling.htmlElement && previousSibling.textContent.length > 1 ||
                                    node.multiline && $element.hasLineBreak(element)) ? '' : '&#160;');
                                value = value.replace($util$2.REGEXP_COMPILED.TRAILINGSPACE, node.display === 'table-cell' || nextSibling && nextSibling.lineBreak || node.blockStatic ? '' : '&#160;');
                            }
                            else if (value.length) {
                                value = '&#160;' + value.substring(1);
                            }
                        }
                        if (value !== '') {
                            node.data(Resource.KEY_NAME, 'valueString', { name, value: applyTextTransform(value, node.css('textTransform')) });
                        }
                    }
                }
            }
        }
        get stored() {
            return Resource.STORED;
        }
    }
    Resource.KEY_NAME = 'squared.resource';
    Resource.ASSETS = {
        ids: new Map(),
        images: new Map()
    };
    Resource.STORED = {
        strings: new Map(),
        arrays: new Map(),
        fonts: new Map(),
        colors: new Map(),
        images: new Map()
    };

    const $css$1 = squared.lib.css;
    const $dom = squared.lib.dom;
    const $element$1 = squared.lib.element;
    const $util$3 = squared.lib.util;
    function prioritizeExtensions(element, extensions, documentRoot = null) {
        const tagged = [];
        let current = element;
        while (current) {
            if (current.dataset.use) {
                for (const value of current.dataset.use.split($util$3.REGEXP_COMPILED.SEPARATOR)) {
                    tagged.push(value);
                }
            }
            if (documentRoot === null || current === documentRoot) {
                break;
            }
            else if (current !== documentRoot) {
                current = current.parentElement;
            }
        }
        if (tagged.length) {
            const result = [];
            const untagged = [];
            for (const ext of extensions) {
                const index = tagged.indexOf(ext.name);
                if (index !== -1) {
                    result[index] = ext;
                }
                else {
                    untagged.push(ext);
                }
            }
            return $util$3.concatArray($util$3.spliceArray(result, item => item === undefined), untagged);
        }
        return extensions;
    }
    function checkPositionStatic(node, parent) {
        const previousSiblings = node.previousSiblings();
        const nextSiblings = node.nextSiblings();
        if (!previousSiblings.some(item => item.multiline || item.excluded && !item.blockStatic) && (nextSiblings.every(item => item.blockStatic || item.lineBreak || item.excluded) || parent && node.element === $dom.getLastChildElement(parent.element))) {
            node.cssApply({
                display: 'inline-block',
                verticalAlign: 'top'
            }, true);
            node.positionStatic = true;
            return true;
        }
        return false;
    }
    function compareRange(operation, value, range) {
        switch (operation) {
            case '<=':
                return value <= range;
            case '<':
                return value < range;
            case '>=':
                return value >= range;
            case '>':
                return value > range;
            default:
                return value === range;
        }
    }
    class Application {
        constructor(framework, nodeConstructor, controllerConstructor, resourceConstructor, extensionManagerHandler) {
            this.framework = framework;
            this.nodeConstructor = nodeConstructor;
            this.initialized = false;
            this.closed = false;
            this.builtInExtensions = {};
            this.extensions = new Set();
            this.parseElements = new Set();
            this.session = {
                cache: new NodeList(),
                documentRoot: [],
                image: new Map(),
                targetQueue: new Map(),
                excluded: new NodeList(),
                renderPosition: new Map(),
                extensionMap: new Map()
            };
            this.processing = {
                cache: new NodeList(),
                node: undefined,
                excluded: new NodeList()
            };
            this._views = [];
            this._includes = [];
            this.controllerHandler = new controllerConstructor(this, this.processing.cache);
            this.resourceHandler = new resourceConstructor(this, this.processing.cache);
            this.extensionManager = new extensionManagerHandler(this, this.processing.cache);
        }
        registerController(handler) {
            handler.application = this;
            handler.cache = this.processing.cache;
            this.controllerHandler = handler;
        }
        registerResource(handler) {
            handler.application = this;
            handler.cache = this.processing.cache;
            this.resourceHandler = handler;
        }
        finalize() {
            const controller = this.controllerHandler;
            for (const [node, template] of this.session.targetQueue.entries()) {
                if (node.dataset.target) {
                    const parent = this.resolveTarget(node.dataset.target);
                    if (parent) {
                        node.render(parent);
                        this.addRenderTemplate(parent, node, template);
                    }
                    else if (node.renderParent === undefined) {
                        this.session.cache.remove(node);
                    }
                }
            }
            let rendered = this.rendered;
            for (const node of rendered) {
                if (node.hasProcedure(NODE_PROCEDURE.LAYOUT)) {
                    node.setLayout();
                }
                if (node.hasProcedure(NODE_PROCEDURE.ALIGNMENT)) {
                    node.setAlignment();
                }
            }
            for (const node of rendered) {
                if (node.hasProcedure(NODE_PROCEDURE.OPTIMIZATION)) {
                    node.applyOptimizations();
                }
                if (!this.userSettings.customizationsDisabled && node.hasProcedure(NODE_PROCEDURE.CUSTOMIZATION)) {
                    node.applyCustomizations(this.userSettings.customizationsOverwritePrivilege);
                }
            }
            for (const ext of this.extensions) {
                for (const node of ext.subscribers) {
                    ext.postProcedure(node);
                }
            }
            rendered = this.rendered;
            for (const node of rendered) {
                if (node.hasResource(NODE_RESOURCE.BOX_SPACING)) {
                    node.setBoxSpacing();
                }
            }
            for (const ext of this.extensions) {
                ext.beforeCascadeDocument();
            }
            for (const layout of this.session.documentRoot) {
                const node = layout.node;
                const parent = layout.node.renderParent;
                if (parent && parent.renderTemplates) {
                    this.addLayoutFile(layout.layoutName, controller.localSettings.baseTemplate + controller.cascadeDocument(parent.renderTemplates, 0), node.dataset.pathname, !!node.renderExtension && node.renderExtension.some(item => item.documentBase));
                }
            }
            const sessionData = this.sessionData;
            this.resourceHandler.finalize(sessionData);
            controller.finalize(sessionData);
            for (const ext of this.extensions) {
                ext.afterFinalize();
            }
            $dom.removeElementsByClassName('__css.placeholder');
            this.closed = true;
        }
        saveAllToDisk() {
            if (this.resourceHandler.fileHandler) {
                this.resourceHandler.fileHandler.saveAllToDisk(this.sessionData);
            }
        }
        reset() {
            this.session.cache.each(node => node.element && $dom.deleteElementCache(node.element, 'node', 'style', 'styleMap'));
            for (const element of this.parseElements) {
                element.dataset.iteration = '';
            }
            this.session.documentRoot.length = 0;
            this.session.targetQueue.clear();
            this.session.image.clear();
            this.session.cache.reset();
            this.session.excluded.reset();
            this.session.renderPosition.clear();
            this.session.extensionMap.clear();
            this.processing.cache.reset();
            this.controllerHandler.reset();
            this.resourceHandler.reset();
            this._views.length = 0;
            this._includes.length = 0;
            for (const ext of this.extensions) {
                ext.subscribers.clear();
            }
            this.closed = false;
        }
        parseDocument(...elements) {
            let __THEN;
            this.parseElements.clear();
            this.initialized = false;
            this.setStyleMap();
            if (elements.length === 0) {
                elements.push(document.body);
            }
            for (const value of elements) {
                const element = typeof value === 'string' ? document.getElementById(value) : value;
                if ($css$1.hasComputedStyle(element)) {
                    this.parseElements.add(element);
                }
            }
            const documentRoot = this.parseElements.values().next().value;
            const fileExtension = new RegExp(`\.${this.controllerHandler.localSettings.layout.fileExtension}$`);
            const preloadImages = [];
            const parseResume = () => {
                this.initialized = false;
                for (const image of preloadImages) {
                    documentRoot.removeChild(image);
                }
                for (const [uri, image] of this.session.image.entries()) {
                    Resource.ASSETS.images.set(uri, image);
                }
                for (const ext of this.extensions) {
                    ext.beforeParseDocument();
                }
                for (const element of this.parseElements) {
                    const iteration = (element.dataset.iteration ? $util$3.convertInt(element.dataset.iteration) : -1) + 1;
                    element.dataset.iteration = iteration.toString();
                    if (this.createCache(element)) {
                        const filename = element.dataset.filename && element.dataset.filename.replace(fileExtension, '') || element.id || `document_${this.size}`;
                        element.dataset.layoutName = $util$3.convertWord(iteration > 1 ? `${filename}_${iteration}` : filename, true);
                        this.setBaseLayout(element.dataset.layoutName);
                        this.setConstraints();
                        this.setResources();
                    }
                }
                for (const ext of this.extensions) {
                    for (const node of ext.subscribers) {
                        ext.postParseDocument(node);
                    }
                    ext.afterParseDocument();
                }
                if (typeof __THEN === 'function') {
                    __THEN.call(this);
                }
            };
            const images = [];
            if (this.userSettings.preloadImages) {
                for (const element of this.parseElements) {
                    element.querySelectorAll('input[type=image]').forEach((image) => {
                        const uri = image.src;
                        if (uri !== '') {
                            this.session.image.set(uri, {
                                width: image.width,
                                height: image.height,
                                uri
                            });
                        }
                    });
                    element.querySelectorAll('svg image').forEach((image) => {
                        const uri = $util$3.resolvePath(image.href.baseVal);
                        if (uri !== '') {
                            this.session.image.set(uri, {
                                width: image.width.baseVal.value,
                                height: image.height.baseVal.value,
                                uri
                            });
                        }
                    });
                }
                for (const image of this.session.image.values()) {
                    if (image.width === 0 && image.height === 0 && image.uri) {
                        const element = document.createElement('img');
                        element.src = image.uri;
                        if (element.complete && element.naturalWidth > 0 && element.naturalHeight > 0) {
                            image.width = element.naturalWidth;
                            image.height = element.naturalHeight;
                        }
                        else {
                            documentRoot.appendChild(element);
                            preloadImages.push(element);
                        }
                    }
                }
                for (const element of this.parseElements) {
                    element.querySelectorAll('IMG').forEach((image) => {
                        if (image.tagName === 'IMG') {
                            if (image.complete) {
                                this.addImagePreload(image);
                            }
                            else {
                                images.push(image);
                            }
                        }
                    });
                }
            }
            if (images.length === 0) {
                parseResume();
            }
            else {
                this.initialized = true;
                Promise.all($util$3.objectMap(images, image => {
                    return new Promise((resolve, reject) => {
                        image.onload = () => {
                            resolve(image);
                        };
                        image.onerror = () => {
                            reject(image);
                        };
                    });
                }))
                    .then((result) => {
                    for (const item of result) {
                        this.addImagePreload(item);
                    }
                    parseResume();
                })
                    .catch((error) => {
                    const message = error.target ? error.target.src : '';
                    if (!$util$3.hasValue(message) || confirm(`FAIL: ${message}`)) {
                        parseResume();
                    }
                });
            }
            return {
                then: (resolve) => {
                    if (this.initialized) {
                        __THEN = resolve;
                    }
                    else {
                        resolve();
                    }
                }
            };
        }
        renderNode(layout) {
            if (layout.itemCount === 0) {
                return this.controllerHandler.renderNode(layout);
            }
            else {
                return this.controllerHandler.renderNodeGroup(layout);
            }
        }
        renderLayout(layout, outerParent) {
            if ($util$3.hasBit(layout.renderType, 64 /* FLOAT */)) {
                if ($util$3.hasBit(layout.renderType, 8 /* HORIZONTAL */)) {
                    layout = this.processFloatHorizontal(layout);
                }
                else if ($util$3.hasBit(layout.renderType, 16 /* VERTICAL */)) {
                    layout = this.processFloatVertical(layout, outerParent);
                }
            }
            return layout.containerType !== 0 ? this.renderNode(layout) : undefined;
        }
        addLayoutFile(filename, content, pathname, documentBase = false) {
            if (content !== '') {
                const layout = {
                    pathname: $util$3.trimString(pathname || this.controllerHandler.localSettings.layout.pathName, '/'),
                    filename,
                    content
                };
                if (documentBase) {
                    this._views.unshift(layout);
                }
                else {
                    this._views.push(layout);
                }
            }
        }
        addIncludeFile(id, filename, content) {
            this._includes.push({
                id,
                pathname: this.controllerHandler.localSettings.layout.pathName,
                filename,
                content
            });
        }
        addRenderLayout(layout, outerParent) {
            let template;
            if (outerParent) {
                template = this.renderLayout(layout, outerParent);
            }
            else {
                template = this.renderNode(layout);
            }
            return this.addRenderTemplate(layout.parent, layout.node, template, layout.renderIndex);
        }
        addRenderTemplate(parent, node, template, index = -1) {
            if (template) {
                if (node.renderParent === undefined) {
                    this.session.targetQueue.set(node, template);
                }
                else {
                    if (parent.renderTemplates === undefined) {
                        parent.renderTemplates = [];
                    }
                    if (index >= 0 && index < parent.renderChildren.length) {
                        parent.renderChildren.splice(index, 0, node);
                        parent.renderTemplates.splice(index, 0, template);
                    }
                    else {
                        parent.renderChildren.push(node);
                        parent.renderTemplates.push(template);
                    }
                }
                return true;
            }
            return false;
        }
        addImagePreload(element) {
            if (element && element.complete) {
                const uri = element.src.trim();
                if (uri !== '') {
                    this.session.image.set(uri, {
                        width: element.naturalWidth,
                        height: element.naturalHeight,
                        uri
                    });
                }
            }
        }
        createNode(element) {
            return new this.nodeConstructor(this.nextId, element, this.controllerHandler.afterInsertNode);
        }
        resolveTarget(target) {
            for (const parent of this.processing.cache) {
                if (parent.elementId === target || parent.controlId === target) {
                    return parent;
                }
            }
            for (const parent of this.session.cache) {
                if (parent.elementId === target || parent.controlId === target) {
                    return parent;
                }
            }
            return undefined;
        }
        toString() {
            return this._views.length ? this._views[0].content : '';
        }
        createCache(documentRoot) {
            const localSettings = this.controllerHandler.localSettings;
            this.processing.cache.afterAppend = undefined;
            this.processing.cache.clear();
            this.processing.excluded.clear();
            this.processing.node = undefined;
            const extensions = Array.from(this.extensions);
            for (const ext of extensions) {
                ext.beforeInit(documentRoot);
            }
            const cascadeDOM = (element, depth) => {
                const node = this.insertNode(element);
                if (node) {
                    node.depth = depth;
                    if (depth === 0) {
                        this.processing.cache.append(node);
                    }
                    if (node.tagName !== 'SELECT') {
                        const children = [];
                        let includeText = false;
                        for (let i = 0; i < element.childNodes.length; i++) {
                            const childElement = element.childNodes[i];
                            if (childElement.nodeName.charAt(0) === '#') {
                                if (childElement.nodeName === '#text') {
                                    const child = this.insertNode(childElement, node);
                                    if (child) {
                                        children.push(child);
                                    }
                                }
                            }
                            else if (!localSettings.unsupported.tagName.has(childElement.tagName) || childElement.tagName === 'INPUT' && !localSettings.unsupported.tagName.has(`${childElement.tagName}:${childElement.type}`)) {
                                prioritizeExtensions(childElement, extensions).some(item => item.init(childElement));
                                if (!this.parseElements.has(childElement)) {
                                    const child = cascadeDOM(childElement, depth + 1);
                                    if (child) {
                                        children.push(child);
                                        if (!child.excluded) {
                                            includeText = true;
                                        }
                                    }
                                }
                            }
                        }
                        for (let i = 0; i < children.length; i++) {
                            const child = children[i];
                            if (child.excluded) {
                                this.processing.excluded.append(child);
                            }
                            else if (includeText || child.tagName !== 'PLAINTEXT') {
                                child.parent = node;
                                this.processing.cache.append(child);
                            }
                            child.siblingIndex = i;
                        }
                        node.actualChildren = children;
                    }
                }
                return node;
            };
            const rootNode = cascadeDOM(documentRoot, 0);
            if (rootNode) {
                rootNode.parent = new this.nodeConstructor(0, documentRoot.parentElement || document.body, this.controllerHandler.afterInsertNode);
                rootNode.siblingIndex = 0;
                rootNode.documentRoot = true;
                rootNode.documentParent = rootNode.parent;
                this.processing.node = rootNode;
            }
            else {
                return false;
            }
            if (this.processing.cache.length) {
                const preAlignment = {};
                const direction = new Set();
                for (const node of this.processing.cache) {
                    if (node.styleElement) {
                        const element = node.element;
                        if (element.tagName !== 'BUTTON' && element.type !== 'button') {
                            const textAlign = node.css('textAlign');
                            switch (textAlign) {
                                case 'center':
                                case 'right':
                                case 'end':
                                    preAlignment[node.id] = { textAlign };
                                    element.style.textAlign = 'left';
                                    break;
                            }
                        }
                        if (node.positionRelative && !node.positionStatic) {
                            if (preAlignment[node.id] === undefined) {
                                preAlignment[node.id] = {};
                            }
                            for (const attr of $css$1.BOX_POSITION) {
                                if (node.has(attr)) {
                                    preAlignment[node.id][attr] = node.css(attr);
                                    element.style[attr] = 'auto';
                                }
                            }
                        }
                        if (element.dir === 'rtl') {
                            element.dir = 'ltr';
                            direction.add(element);
                        }
                    }
                }
                rootNode.parent.setBounds();
                for (const node of this.processing.cache) {
                    node.setBounds();
                }
                for (const node of this.processing.excluded) {
                    if (!node.lineBreak) {
                        node.setBounds();
                    }
                }
                for (const node of this.processing.cache) {
                    if (node.styleElement) {
                        const element = node.element;
                        const reset = preAlignment[node.id];
                        if (reset) {
                            for (const attr in reset) {
                                element.style[attr] = reset[attr];
                            }
                        }
                        if (direction.has(element)) {
                            element.dir = 'rtl';
                        }
                    }
                    if (!node.documentRoot) {
                        let parent = node.actualParent;
                        switch (node.position) {
                            case 'fixed':
                                if (!node.positionAuto) {
                                    parent = rootNode;
                                    break;
                                }
                            case 'absolute':
                                if (node.positionAuto && checkPositionStatic(node, parent)) {
                                    break;
                                }
                                else if (this.userSettings.supportNegativeLeftTop) {
                                    const absoluteParent = node.absoluteParent;
                                    let documentParent;
                                    let outside = false;
                                    while (parent && (parent !== rootNode || parent.id !== 0)) {
                                        if (documentParent === undefined) {
                                            if (absoluteParent === parent) {
                                                documentParent = parent;
                                                if (parent.css('overflow') === 'hidden') {
                                                    break;
                                                }
                                                else {
                                                    if ((!node.has('right') || node.right < 0) && (!node.has('bottom') || node.bottom < 0) && (node.left < 0 && node.outsideX(parent.box) ||
                                                        !node.has('left') && node.right < 0 && node.outsideX(parent.box) ||
                                                        node.top < 0 && node.outsideY(parent.box) ||
                                                        !node.has('top') && node.bottom < 0 && node.outsideX(parent.box))) {
                                                        outside = true;
                                                    }
                                                    else {
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                        else if (outside && (parent.documentRoot || parent.css('overflow') === 'hidden' || node.withinX(parent.box) && node.withinY(parent.box))) {
                                            documentParent = parent;
                                            break;
                                        }
                                        parent = parent.actualParent;
                                    }
                                    if (documentParent) {
                                        parent = documentParent;
                                    }
                                }
                                else {
                                    parent = node.absoluteParent;
                                }
                                break;
                        }
                        if (!node.pageFlow && (parent === undefined || parent.id === 0)) {
                            parent = rootNode;
                        }
                        if (parent) {
                            if (parent !== node.parent) {
                                node.parent = parent;
                                node.siblingIndex = Number.POSITIVE_INFINITY;
                            }
                            node.documentParent = parent;
                        }
                    }
                    if (node.length) {
                        const layers = [];
                        node.each((item) => {
                            if (item.siblingIndex === Number.POSITIVE_INFINITY) {
                                for (const adjacent of node.children) {
                                    let valid = adjacent.actualChildren.includes(item);
                                    if (!valid) {
                                        const nested = adjacent.cascade();
                                        valid = item.ascend().some(child => nested.includes(child));
                                    }
                                    if (valid) {
                                        const index = adjacent.siblingIndex + (item.zIndex >= 0 || adjacent !== item.actualParent ? 1 : -1);
                                        if (layers[index] === undefined) {
                                            layers[index] = [];
                                        }
                                        layers[index].push(item);
                                        break;
                                    }
                                }
                            }
                        });
                        for (let j = 0; j < layers.length; j++) {
                            const order = layers[j];
                            if (order) {
                                order.sort((a, b) => {
                                    if (a.zIndex === b.zIndex) {
                                        return a.id < b.id ? -1 : 1;
                                    }
                                    return a.zIndex < b.zIndex ? -1 : 1;
                                });
                                node.each((item) => {
                                    if (item.siblingIndex >= j && item.siblingIndex !== Number.POSITIVE_INFINITY) {
                                        item.siblingIndex += order.length;
                                    }
                                });
                                for (let k = 0; k < order.length; k++) {
                                    order[k].siblingIndex = j + k;
                                }
                            }
                        }
                        node.sort(NodeList.siblingIndex);
                    }
                    node.saveAsInitial();
                }
                this.processing.cache.sort((a, b) => {
                    if (a.depth !== b.depth) {
                        return a.depth < b.depth ? -1 : 1;
                    }
                    else if (a.documentParent !== b.documentParent) {
                        return a.documentParent.siblingIndex < b.documentParent.siblingIndex ? -1 : 1;
                    }
                    return a.siblingIndex < b.siblingIndex ? -1 : 1;
                });
                for (const ext of extensions) {
                    ext.afterInit(documentRoot);
                }
                return true;
            }
            return false;
        }
        setBaseLayout(layoutName) {
            const controller = this.controllerHandler;
            const extensions = [];
            for (const item of this.extensions) {
                if (!item.eventOnly) {
                    extensions.push(item);
                }
            }
            const documentRoot = this.processing.node;
            const mapY = new Map();
            function setMapY(depth, id, node) {
                const index = mapY.get(depth) || new Map();
                mapY.set(depth, index.set(id, node));
            }
            function deleteMapY(id) {
                for (const mapNode of mapY.values()) {
                    for (const node of mapNode.values()) {
                        if (node.id === id) {
                            mapNode.delete(node.id);
                            return;
                        }
                    }
                }
            }
            setMapY(-1, 0, documentRoot.parent);
            let maxDepth = 0;
            for (const node of this.processing.cache) {
                if (node.visible) {
                    setMapY(node.depth, node.id, node);
                    maxDepth = Math.max(node.depth, maxDepth);
                }
            }
            for (let i = 0; i < maxDepth; i++) {
                mapY.set((i * -1) - 2, new Map());
            }
            this.processing.cache.afterAppend = (node) => {
                deleteMapY(node.id);
                setMapY((node.depth * -1) - 2, node.id, node);
                for (const item of node.cascade()) {
                    deleteMapY(item.id);
                    setMapY((item.depth * -1) - 2, item.id, item);
                }
            };
            for (const depth of mapY.values()) {
                for (const parent of depth.values()) {
                    if (parent.length === 0) {
                        continue;
                    }
                    const axisY = parent.duplicate();
                    const hasFloat = axisY.some(node => node.floating);
                    let cleared;
                    if (hasFloat) {
                        cleared = NodeList.linearData(parent.actualChildren).cleared;
                    }
                    let k = -1;
                    while (++k < axisY.length) {
                        let nodeY = axisY[k];
                        if (!nodeY.visible || nodeY.rendered) {
                            continue;
                        }
                        else if (nodeY.htmlElement) {
                            const element = nodeY.element;
                            if (this.parseElements.has(element) && !nodeY.documentRoot && !nodeY.documentBody) {
                                continue;
                            }
                            else if (nodeY.length === 0 && element.children.length) {
                                let valid = true;
                                for (let i = 0; i < element.children.length; i++) {
                                    if (!this.parseElements.has(element.children[i])) {
                                        valid = false;
                                        break;
                                    }
                                }
                                if (valid) {
                                    nodeY.inlineText = false;
                                }
                            }
                        }
                        let parentY = nodeY.parent;
                        const extensionDescendant = this.session.extensionMap.get(nodeY.id);
                        const extendable = nodeY.hasAlign(8192 /* EXTENDABLE */);
                        if (axisY.length > 1 && k < axisY.length - 1 && nodeY.pageFlow && (parentY.alignmentType === 0 || extendable || parentY.hasAlign(2 /* UNKNOWN */)) && !parentY.hasAlign(4 /* AUTO_LAYOUT */) && nodeY.hasSection(APP_SECTION.DOM_TRAVERSE)) {
                            const horizontal = [];
                            const vertical = [];
                            let verticalExtended = false;
                            function checkHorizontal(node) {
                                if (vertical.length || verticalExtended) {
                                    return false;
                                }
                                horizontal.push(node);
                                return true;
                            }
                            function checkVertical(node) {
                                if (parentY.layoutVertical && vertical.length) {
                                    const previousAbove = vertical[vertical.length - 1];
                                    if (previousAbove.layoutVertical) {
                                        node.parent = previousAbove;
                                        return;
                                    }
                                }
                                vertical.push(node);
                            }
                            let l = k;
                            let m = 0;
                            if (extendable && parentY.layoutVertical) {
                                horizontal.push(nodeY);
                                l++;
                                m++;
                            }
                            domNested: {
                                const floated = new Set();
                                const floatActive = new Set();
                                for (; l < axisY.length; l++, m++) {
                                    const item = axisY[l];
                                    if (item.pageFlow) {
                                        if (hasFloat) {
                                            const float = cleared.get(item);
                                            if (float) {
                                                if (float === 'both') {
                                                    floatActive.clear();
                                                }
                                                else {
                                                    floatActive.delete(float);
                                                }
                                            }
                                            if (item.floating) {
                                                floated.add(item.float);
                                                floatActive.add(item.float);
                                            }
                                        }
                                        const previousSiblings = item.previousSiblings();
                                        const previous = previousSiblings[previousSiblings.length - 1];
                                        const next = item.nextSiblings().shift();
                                        if (m === 0 && next) {
                                            if (item.blockStatic || next.alignedVertically([item], [item], cleared)) {
                                                vertical.push(item);
                                            }
                                            else {
                                                horizontal.push(item);
                                            }
                                        }
                                        else if (previous) {
                                            if (hasFloat) {
                                                const siblings = [];
                                                if (horizontal.length) {
                                                    $util$3.concatArray(siblings, horizontal);
                                                }
                                                else if (vertical.length) {
                                                    $util$3.concatArray(siblings, vertical);
                                                }
                                                siblings.push(item);
                                                if (item.alignedVertically(previousSiblings, siblings, cleared, false)) {
                                                    if (horizontal.length) {
                                                        if (floatActive.size && !previous.autoMargin.horizontal && cleared.get(item) !== 'both' && !previousSiblings.some(node => node.lineBreak && !cleared.has(node))) {
                                                            let floatBottom = Number.NEGATIVE_INFINITY;
                                                            $util$3.captureMap(horizontal, node => node.floating, node => floatBottom = Math.max(floatBottom, node.linear.bottom));
                                                            if (!item.floating || item.linear.top < floatBottom) {
                                                                if (cleared.has(item)) {
                                                                    if (!item.floating && floatActive.size < 2 && floated.size === 2) {
                                                                        item.alignmentType |= 8192 /* EXTENDABLE */;
                                                                        verticalExtended = true;
                                                                        horizontal.push(item);
                                                                        continue;
                                                                    }
                                                                    break domNested;
                                                                }
                                                                else if (floated.size === 1 && (!item.floating || floatActive.has(item.float))) {
                                                                    horizontal.push(item);
                                                                    if (item.linear.bottom > floatBottom) {
                                                                        break domNested;
                                                                    }
                                                                    else {
                                                                        continue;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        break domNested;
                                                    }
                                                    checkVertical(item);
                                                }
                                                else if (!checkHorizontal(item)) {
                                                    break domNested;
                                                }
                                            }
                                            else {
                                                if (item.alignedVertically(previousSiblings)) {
                                                    checkVertical(item);
                                                }
                                                else if (!checkHorizontal(item)) {
                                                    break domNested;
                                                }
                                            }
                                        }
                                        else {
                                            break domNested;
                                        }
                                    }
                                }
                            }
                            let result;
                            let segEnd;
                            if (horizontal.length > 1) {
                                result = controller.processTraverseHorizontal(new Layout(parentY, nodeY, 0, 0, horizontal), axisY);
                                segEnd = horizontal[horizontal.length - 1];
                            }
                            else if (vertical.length > 1) {
                                result = controller.processTraverseVertical(new Layout(parentY, nodeY, 0, 0, vertical), axisY);
                                segEnd = vertical[vertical.length - 1];
                                if (!segEnd.blockStatic && segEnd !== axisY[axisY.length - 1]) {
                                    segEnd.alignmentType |= 8192 /* EXTENDABLE */;
                                }
                            }
                            if (parentY.hasAlign(2 /* UNKNOWN */) && segEnd === axisY[axisY.length - 1]) {
                                parentY.alignmentType ^= 2 /* UNKNOWN */;
                            }
                            if (result && this.addRenderLayout(result.layout, parentY)) {
                                parentY = nodeY.parent;
                            }
                        }
                        if (nodeY.hasAlign(8192 /* EXTENDABLE */)) {
                            nodeY.alignmentType ^= 8192 /* EXTENDABLE */;
                        }
                        if (k === axisY.length - 1 && parentY.hasAlign(2 /* UNKNOWN */)) {
                            parentY.alignmentType ^= 2 /* UNKNOWN */;
                        }
                        if (nodeY.renderAs && parentY.appendTry(nodeY, nodeY.renderAs, false)) {
                            nodeY.hide();
                            nodeY = nodeY.renderAs;
                            if (nodeY.positioned) {
                                parentY = nodeY.parent;
                            }
                        }
                        if (!nodeY.rendered && nodeY.hasSection(APP_SECTION.EXTENSION)) {
                            let combined = parent.renderExtension ? parent.renderExtension.slice(0) : undefined;
                            if (extensionDescendant) {
                                if (combined) {
                                    $util$3.concatArray(combined, extensionDescendant);
                                }
                                else {
                                    combined = extensionDescendant.slice(0);
                                }
                            }
                            if (combined) {
                                let next = false;
                                for (const ext of combined) {
                                    const result = ext.processChild(nodeY, parentY);
                                    if (result) {
                                        if (result.output) {
                                            this.addRenderTemplate(result.parentAs || parentY, nodeY, result.output);
                                        }
                                        if (result.renderAs && result.outputAs) {
                                            this.addRenderTemplate(parentY, result.renderAs, result.outputAs);
                                        }
                                        if (result.parent) {
                                            parentY = result.parent;
                                        }
                                        next = result.next === true;
                                        if (result.complete || next) {
                                            break;
                                        }
                                    }
                                }
                                if (next) {
                                    continue;
                                }
                            }
                            if (nodeY.styleElement) {
                                let next = false;
                                prioritizeExtensions(nodeY.element, extensions, documentRoot.element).some(item => {
                                    if (item.is(nodeY) && item.condition(nodeY, parentY) && (extensionDescendant === undefined || !extensionDescendant.includes(item))) {
                                        const result = item.processNode(nodeY, parentY);
                                        if (result) {
                                            if (result.output) {
                                                this.addRenderTemplate(result.parentAs || parentY, nodeY, result.output);
                                            }
                                            if (result.renderAs && result.outputAs) {
                                                this.addRenderTemplate(parentY, result.renderAs, result.outputAs);
                                            }
                                            if (result.parent) {
                                                parentY = result.parent;
                                            }
                                            if (result.output || result.include === true) {
                                                if (nodeY.renderExtension === undefined) {
                                                    nodeY.renderExtension = [];
                                                }
                                                nodeY.renderExtension.push(item);
                                                item.subscribers.add(nodeY);
                                            }
                                            next = result.next === true;
                                            if (result.complete || next) {
                                                return true;
                                            }
                                        }
                                    }
                                    return false;
                                });
                                if (next) {
                                    continue;
                                }
                            }
                        }
                        if (!nodeY.rendered && nodeY.hasSection(APP_SECTION.RENDER)) {
                            const layout = this.createLayoutControl(parentY, nodeY);
                            const result = nodeY.length ? controller.processUnknownParent(layout) : controller.processUnknownChild(layout);
                            if (result.next === true) {
                                continue;
                            }
                            else if (result.renderAs) {
                                axisY[k] = result.renderAs;
                                k--;
                                continue;
                            }
                            this.addRenderLayout(result.layout, parentY);
                        }
                    }
                }
            }
            this.session.cache.concat(this.processing.cache.children);
            this.session.excluded.concat(this.processing.excluded.children);
            for (const node of this.processing.cache) {
                if (node.documentRoot && node.rendered) {
                    this.session.documentRoot.push({ node, layoutName: node === documentRoot ? layoutName : '' });
                }
            }
            for (const ext of this.extensions) {
                for (const node of ext.subscribers) {
                    ext.postBaseLayout(node);
                }
                ext.afterBaseLayout();
            }
        }
        setConstraints() {
            this.controllerHandler.setConstraints();
            for (const ext of this.extensions) {
                for (const node of ext.subscribers) {
                    ext.postConstraints(node);
                }
                ext.afterConstraints();
            }
        }
        setResources() {
            this.resourceHandler.setBoxStyle();
            this.resourceHandler.setFontStyle();
            this.resourceHandler.setValueString();
            for (const ext of this.extensions) {
                ext.afterResources();
            }
        }
        processFloatHorizontal(layout) {
            const controller = this.controllerHandler;
            let layerIndex;
            const itemCount = layout.itemCount;
            if (layout.cleared.size === 0 && !layout.some(node => node.autoMargin.horizontal)) {
                const inline = [];
                const left = [];
                const right = [];
                for (const node of layout) {
                    if (node.float === 'right') {
                        right.push(node);
                    }
                    else if (node.float === 'left') {
                        left.push(node);
                    }
                    else {
                        inline.push(node);
                    }
                }
                if (inline.length === itemCount || left.length === itemCount || right.length === itemCount) {
                    controller.processLayoutHorizontal(layout);
                }
                else if ((left.length === 0 || right.length === 0) && !inline.some(item => item.blockStatic)) {
                    const subgroup = [];
                    if (right.length === 0) {
                        $util$3.concatMultiArray(subgroup, left, inline);
                        const horizontal = controller.containerTypeHorizontal;
                        layout.setType(horizontal.containerType, horizontal.alignmentType);
                        layerIndex = [left, inline];
                    }
                    else {
                        $util$3.concatMultiArray(subgroup, inline, right);
                        const verticalMargin = controller.containerTypeVerticalMargin;
                        layout.setType(verticalMargin.containerType, verticalMargin.alignmentType);
                        layerIndex = [inline, right];
                    }
                    layout.retain(subgroup);
                }
            }
            const vertical = controller.containerTypeVertical;
            const inlineAbove = [];
            const inlineBelow = [];
            const leftAbove = [];
            const rightAbove = [];
            const leftBelow = [];
            const rightBelow = [];
            let leftSub = [];
            let rightSub = [];
            if (layerIndex === undefined) {
                layerIndex = [];
                let current = '';
                let pendingFloat = 0;
                for (const node of layout) {
                    const direction = layout.cleared.get(node);
                    if (direction && ($util$3.hasBit(pendingFloat, direction === 'right' ? 4 : 2) || pendingFloat !== 0 && direction === 'both')) {
                        switch (direction) {
                            case 'left':
                                if ($util$3.hasBit(pendingFloat, 2)) {
                                    pendingFloat ^= 2;
                                }
                                current = 'left';
                                break;
                            case 'right':
                                if ($util$3.hasBit(pendingFloat, 4)) {
                                    pendingFloat ^= 4;
                                }
                                current = 'right';
                                break;
                            case 'both':
                                switch (pendingFloat) {
                                    case 2:
                                        current = 'left';
                                        break;
                                    case 4:
                                        current = 'right';
                                        break;
                                    default:
                                        current = 'both';
                                        break;
                                }
                                pendingFloat = 0;
                                break;
                        }
                    }
                    if (current === '') {
                        if (node.float === 'right') {
                            rightAbove.push(node);
                            if (node.floating) {
                                pendingFloat |= 4;
                            }
                        }
                        else if (node.float === 'left') {
                            leftAbove.push(node);
                            if (node.floating) {
                                pendingFloat |= 2;
                            }
                        }
                        else if (node.autoMargin.horizontal) {
                            if (node.autoMargin.left) {
                                if (rightAbove.length) {
                                    rightBelow.push(node);
                                }
                                else {
                                    rightAbove.push(node);
                                }
                            }
                            else if (node.autoMargin.right) {
                                if (leftAbove.length) {
                                    leftBelow.push(node);
                                }
                                else {
                                    leftAbove.push(node);
                                }
                            }
                            else {
                                if (inlineAbove.length) {
                                    if (leftAbove.length === 0) {
                                        leftAbove.push(node);
                                    }
                                    else {
                                        rightAbove.push(node);
                                    }
                                }
                                else {
                                    inlineAbove.push(node);
                                }
                            }
                        }
                        else {
                            inlineAbove.push(node);
                        }
                    }
                    else {
                        if (node.float === 'right') {
                            if (rightBelow.length === 0) {
                                pendingFloat |= 4;
                            }
                            if (current !== 'right' && rightAbove.length) {
                                rightAbove.push(node);
                            }
                            else {
                                rightBelow.push(node);
                            }
                        }
                        else if (node.float === 'left') {
                            if (leftBelow.length === 0) {
                                pendingFloat |= 2;
                            }
                            if (current !== 'left' && leftAbove.length) {
                                leftAbove.push(node);
                            }
                            else {
                                leftBelow.push(node);
                            }
                        }
                        else if (node.autoMargin.horizontal) {
                            if (node.autoMargin.left && rightBelow.length) {
                                rightBelow.push(node);
                            }
                            else if (node.autoMargin.right && leftBelow.length) {
                                leftBelow.push(node);
                            }
                            else {
                                inlineBelow.push(node);
                            }
                        }
                        else {
                            switch (current) {
                                case 'left':
                                    leftBelow.push(node);
                                    break;
                                case 'right':
                                    rightBelow.push(node);
                                    break;
                                default:
                                    inlineBelow.push(node);
                                    break;
                            }
                        }
                    }
                }
                if (leftAbove.length && leftBelow.length) {
                    leftSub = [leftAbove, leftBelow];
                }
                else if (leftAbove.length) {
                    leftSub = leftAbove;
                }
                else if (leftBelow.length) {
                    leftSub = leftBelow;
                }
                if (rightAbove.length && rightBelow.length) {
                    rightSub = [rightAbove, rightBelow];
                }
                else if (rightAbove.length) {
                    rightSub = rightAbove;
                }
                else if (rightBelow.length) {
                    rightSub = rightBelow;
                }
                layout = new Layout(layout.parent, layout.node, 0, rightAbove.length + rightBelow.length === layout.length ? 512 /* RIGHT */ : 0);
                if (inlineAbove.length) {
                    if (rightBelow.length) {
                        leftSub = [inlineAbove, leftAbove];
                        layerIndex.push(leftSub, rightSub);
                    }
                    else if (leftBelow.length) {
                        rightSub = [inlineAbove, rightAbove];
                        layerIndex.push(rightSub, leftSub);
                    }
                    else {
                        layerIndex.push(inlineAbove, leftSub, rightSub);
                    }
                }
                else {
                    if (leftSub === leftBelow && rightSub === rightAbove || leftSub === leftAbove && rightSub === rightBelow) {
                        if (leftBelow.length === 0) {
                            layerIndex.push([leftAbove, rightBelow]);
                        }
                        else {
                            layerIndex.push([rightAbove, leftBelow]);
                        }
                    }
                    else {
                        layerIndex.push(leftSub, rightSub);
                    }
                }
                $util$3.spliceArray(layerIndex, item => item.length === 0);
                layout.itemCount = layerIndex.length;
                const outerVertical = inlineAbove.length === 0 && (leftSub.length === 0 || rightSub.length === 0) ? vertical : controller.containerTypeVerticalMargin;
                layout.setType(outerVertical.containerType, outerVertical.alignmentType);
            }
            let floatgroup;
            for (let i = 0; i < layerIndex.length; i++) {
                const item = layerIndex[i];
                let segments;
                if (Array.isArray(item[0])) {
                    segments = item;
                    const grouping = [];
                    for (const seg of segments) {
                        $util$3.concatArray(grouping, seg);
                    }
                    grouping.sort(NodeList.siblingIndex);
                    if (layout.node.layoutVertical) {
                        floatgroup = layout.node;
                    }
                    else {
                        floatgroup = controller.createNodeGroup(grouping[0], grouping, layout.node);
                        const layoutGroup = new Layout(layout.node, floatgroup, vertical.containerType, vertical.alignmentType | (segments.some(seg => seg === rightSub || seg === rightAbove) ? 512 /* RIGHT */ : 0));
                        layoutGroup.itemCount = segments.length;
                        this.addRenderLayout(layoutGroup);
                    }
                }
                else {
                    segments = [item];
                    floatgroup = undefined;
                }
                for (const seg of segments) {
                    const basegroup = floatgroup && (seg === inlineAbove || seg === leftAbove || seg === leftBelow || seg === rightAbove || seg === rightBelow) ? floatgroup : layout.node;
                    const target = controller.createNodeGroup(seg[0], seg, basegroup);
                    const layoutGroup = new Layout(basegroup, target, 0, seg.length < itemCount ? 128 /* SEGMENTED */ : 0, seg);
                    if (seg.length === 1 || layoutGroup.linearY) {
                        layoutGroup.setType(vertical.containerType, vertical.alignmentType);
                        if (seg.length === 1) {
                            target.innerChild = seg[0];
                            seg[0].outerParent = target;
                        }
                    }
                    else {
                        controller.processLayoutHorizontal(layoutGroup);
                    }
                    this.addRenderLayout(layoutGroup);
                    if (seg === inlineAbove && seg.some(subitem => subitem.blockStatic && !subitem.hasWidth)) {
                        const targeted = target.of(vertical.containerType, vertical.alignmentType) ? target.children : [target];
                        if (leftAbove.length) {
                            let boundsRight = Number.NEGATIVE_INFINITY;
                            let boundsLeft = Number.POSITIVE_INFINITY;
                            for (const child of leftAbove) {
                                boundsRight = Math.max(boundsRight, child.linear.right);
                            }
                            for (const child of seg) {
                                boundsLeft = Math.min(boundsLeft, child.bounds.left);
                            }
                            for (const child of targeted) {
                                child.modifyBox(256 /* PADDING_LEFT */, boundsRight - boundsLeft);
                            }
                        }
                        if (rightAbove.length) {
                            let boundsLeft = Number.POSITIVE_INFINITY;
                            let boundsRight = Number.NEGATIVE_INFINITY;
                            for (const child of rightAbove) {
                                boundsLeft = Math.min(boundsLeft, child.bounds.left);
                            }
                            for (const child of seg) {
                                boundsRight = Math.max(boundsRight, child.bounds.right);
                            }
                            for (const child of targeted) {
                                child.modifyBox(64 /* PADDING_RIGHT */, boundsRight - boundsLeft);
                            }
                        }
                    }
                }
            }
            return layout;
        }
        processFloatVertical(layout, outerParent) {
            const controller = this.controllerHandler;
            const vertical = controller.containerTypeVertical;
            if (layout.containerType !== 0) {
                const groupWrap = controller.createNodeGroup(layout.node, [layout.node], outerParent);
                this.addRenderLayout(new Layout(groupWrap, layout.node, vertical.containerType, vertical.alignmentType, groupWrap.children));
                layout.node = groupWrap;
            }
            else {
                layout.containerType = vertical.containerType;
                layout.add(vertical.alignmentType);
            }
            const staticRows = [];
            const floatedRows = [];
            const current = [];
            const floated = [];
            let clearReset = false;
            let blockArea = false;
            let layoutVertical = true;
            for (const node of layout) {
                if (node.blockStatic && floated.length === 0) {
                    current.push(node);
                    blockArea = true;
                }
                else {
                    if (layout.cleared.has(node)) {
                        if (!node.floating) {
                            node.modifyBox(2 /* MARGIN_TOP */, null);
                            staticRows.push(current.slice(0));
                            floatedRows.push(floated.slice(0));
                            current.length = 0;
                            floated.length = 0;
                        }
                        else {
                            clearReset = true;
                        }
                    }
                    if (node.floating) {
                        if (blockArea) {
                            staticRows.push(current.slice(0));
                            floatedRows.push(null);
                            current.length = 0;
                            floated.length = 0;
                            blockArea = false;
                        }
                        floated.push(node);
                    }
                    else {
                        if (clearReset && !layout.cleared.has(node)) {
                            layoutVertical = false;
                        }
                        current.push(node);
                    }
                }
            }
            if (floated.length) {
                floatedRows.push(floated);
            }
            if (current.length) {
                staticRows.push(current);
            }
            if (!layoutVertical) {
                for (let i = 0; i < Math.max(floatedRows.length, staticRows.length); i++) {
                    const pageFlow = staticRows[i] || [];
                    if (floatedRows[i] === null && pageFlow.length) {
                        const layoutType = controller.containerTypeVertical;
                        layoutType.alignmentType |= 128 /* SEGMENTED */;
                        this.addRenderLayout(new Layout(layout.node, controller.createNodeGroup(pageFlow[0], pageFlow, layout.node), layoutType.containerType, layoutType.alignmentType, pageFlow));
                    }
                    else {
                        const floating = floatedRows[i] || [];
                        if (pageFlow.length || floating.length) {
                            const basegroup = controller.createNodeGroup(floating[0] || pageFlow[0], [], layout.node);
                            const verticalMargin = controller.containerTypeVerticalMargin;
                            const layoutGroup = new Layout(layout.node, basegroup, verticalMargin.containerType, verticalMargin.alignmentType);
                            const children = [];
                            let subgroup;
                            if (floating.length) {
                                if (floating.length > 1) {
                                    subgroup = controller.createNodeGroup(floating[0], floating, basegroup);
                                    layoutGroup.add(64 /* FLOAT */);
                                    if (pageFlow.length === 0 && floating.every(item => item.float === 'right')) {
                                        layoutGroup.add(512 /* RIGHT */);
                                    }
                                }
                                else {
                                    subgroup = floating[0];
                                    subgroup.parent = basegroup;
                                }
                            }
                            if (subgroup) {
                                children.push(subgroup);
                                subgroup = undefined;
                            }
                            if (pageFlow.length) {
                                if (pageFlow.length > 1) {
                                    subgroup = controller.createNodeGroup(pageFlow[0], pageFlow, basegroup);
                                }
                                else {
                                    subgroup = pageFlow[0];
                                    subgroup.parent = basegroup;
                                }
                            }
                            if (subgroup) {
                                children.push(subgroup);
                            }
                            basegroup.init();
                            layoutGroup.itemCount = children.length;
                            this.addRenderLayout(layoutGroup);
                            for (let node of children) {
                                if (!node.groupParent) {
                                    node = controller.createNodeGroup(node, [node], basegroup);
                                }
                                this.addRenderLayout(new Layout(basegroup, node, vertical.containerType, vertical.alignmentType | 128 /* SEGMENTED */, node.children));
                            }
                        }
                    }
                }
            }
            return layout;
        }
        insertNode(element, parent) {
            let node;
            if (element.nodeName === '#text') {
                if ($element$1.isPlainText(element, true) || $css$1.isParentStyle(element, 'whiteSpace', 'pre', 'pre-wrap')) {
                    node = this.createNode(element);
                    if (parent) {
                        node.inherit(parent, 'textStyle');
                    }
                    node.cssApply({
                        position: 'static',
                        display: 'inline',
                        verticalAlign: 'baseline',
                        cssFloat: 'none',
                        clear: 'none',
                    });
                }
            }
            else if (!this.controllerHandler.localSettings.svg.enabled || element.parentElement instanceof HTMLElement) {
                this.controllerHandler.applyDefaultStyles(element);
                node = this.createNode(element);
                if (!this.controllerHandler.localSettings.unsupported.excluded.has(element.tagName) && this.conditionElement(element)) {
                    if (!this.userSettings.exclusionsDisabled) {
                        node.setExclusions();
                    }
                }
                else {
                    node.visible = false;
                    node.excluded = true;
                }
            }
            return node;
        }
        conditionElement(element) {
            if ($css$1.hasComputedStyle(element)) {
                if ($dom.isElementVisible(element, true) || element.dataset.use) {
                    return true;
                }
                else {
                    let current = element.parentElement;
                    let valid = true;
                    while (current) {
                        if ($css$1.getStyle(current).display === 'none') {
                            valid = false;
                            break;
                        }
                        current = current.parentElement;
                    }
                    if (valid) {
                        for (let i = 0; i < element.children.length; i++) {
                            if ($dom.isElementVisible(element.children[i], true)) {
                                return true;
                            }
                        }
                    }
                    return false;
                }
            }
            else {
                return $element$1.isPlainText(element);
            }
        }
        createLayoutControl(parent, node) {
            return new Layout(parent, node, node.containerType, node.alignmentType, node.children);
        }
        setStyleMap() {
            violation: {
                for (let i = 0; i < document.styleSheets.length; i++) {
                    const item = document.styleSheets[i];
                    if (item.cssRules) {
                        for (let j = 0; j < item.cssRules.length; j++) {
                            const rule = item.cssRules[j];
                            try {
                                switch (rule.type) {
                                    case CSSRule.STYLE_RULE:
                                        this.applyStyleRule(rule);
                                        break;
                                    case CSSRule.MEDIA_RULE:
                                        const patternA = /(?:(not|only)?\s*(?:all|screen) and )?((?:\([^)]+\)(?: and )?)+),?\s*/g;
                                        let matchA;
                                        let statement = false;
                                        while (!statement && ((matchA = patternA.exec(rule.conditionText)) !== null)) {
                                            const negate = matchA[1] === 'not';
                                            const patternB = /\(([a-z\-]+)\s*(:|<?=?|=?>?)?\s*([\w.%]+)?\)(?: and )?/g;
                                            let matchB;
                                            let valid = false;
                                            while (!statement && (matchB = patternB.exec(matchA[2])) !== null) {
                                                const attr = matchB[1];
                                                let operation;
                                                if (matchB[1].startsWith('min')) {
                                                    operation = '>=';
                                                }
                                                else if (matchB[1].startsWith('max')) {
                                                    operation = '<=';
                                                }
                                                else {
                                                    operation = matchA[2];
                                                }
                                                const value = matchB[3];
                                                switch (attr) {
                                                    case 'aspect-ratio':
                                                    case 'min-aspect-ratio':
                                                    case 'max-aspect-ratio':
                                                        const [width, height] = $util$3.replaceMap(value.split('/'), ratio => parseInt(ratio));
                                                        valid = compareRange(operation, window.innerWidth / window.innerHeight, width / height);
                                                        break;
                                                    case 'width':
                                                    case 'min-width':
                                                    case 'max-width':
                                                    case 'height':
                                                    case 'min-height':
                                                    case 'max-height':
                                                        valid = compareRange(operation, attr.indexOf('width') !== -1 ? window.innerWidth : window.innerHeight, $util$3.parseUnit(value, $util$3.convertInt($css$1.getStyle(document.body).fontSize)));
                                                        break;
                                                    case 'orientation':
                                                        valid = value === 'portrait' && window.innerWidth <= window.innerHeight || value === 'landscape' && window.innerWidth > window.innerHeight;
                                                        break;
                                                    case 'resolution':
                                                    case 'min-resolution':
                                                    case 'max-resolution':
                                                        let resolution = parseFloat(value);
                                                        if (value.endsWith('dpcm')) {
                                                            resolution *= 2.54;
                                                        }
                                                        else if (value.endsWith('dppx') || value.endsWith('x')) {
                                                            resolution *= 96;
                                                        }
                                                        valid = compareRange(operation, $util$3.getDeviceDPI(), resolution);
                                                        break;
                                                    case 'grid':
                                                        valid = value === '0';
                                                        break;
                                                    case 'color':
                                                        valid = value === undefined || $util$3.convertInt(value) > 0;
                                                        break;
                                                    case 'min-color':
                                                        valid = $util$3.convertInt(value) <= screen.colorDepth / 3;
                                                        break;
                                                    case 'max-color':
                                                        valid = $util$3.convertInt(value) >= screen.colorDepth / 3;
                                                        break;
                                                    case 'color-index':
                                                    case 'min-color-index':
                                                    case 'monochrome':
                                                    case 'min-monochrome':
                                                        valid = value === '0';
                                                        break;
                                                    case 'max-color-index':
                                                    case 'max-monochrome':
                                                        valid = $util$3.convertInt(value) >= 0;
                                                        break;
                                                    default:
                                                        valid = false;
                                                        break;
                                                }
                                                if (!valid) {
                                                    break;
                                                }
                                            }
                                            if (!negate && valid || negate && !valid) {
                                                statement = true;
                                            }
                                        }
                                        if (statement) {
                                            const items = rule.cssRules;
                                            for (let k = 0; k < items.length; k++) {
                                                this.applyStyleRule(items[k]);
                                            }
                                        }
                                        break;
                                }
                            }
                            catch (error) {
                                alert('External CSS files cannot be parsed with some browsers when loading HTML pages directly from your hard drive. ' +
                                    'Either use a local web server, embed your CSS into a <style> element, or you can also try a different browser. ' +
                                    'See the README for more detailed instructions.\n\n' +
                                    `${item.href}\n\n${error}`);
                                break violation;
                            }
                        }
                    }
                }
            }
        }
        applyStyleRule(item) {
            const fromRule = [];
            for (const attr of Array.from(item.style)) {
                fromRule.push($util$3.convertCamelCase(attr));
            }
            document.querySelectorAll(item.selectorText).forEach((element) => {
                const style = $css$1.getStyle(element);
                const fontSize = $util$3.parseUnit(style.fontSize);
                const styleMap = {};
                for (const attr of fromRule) {
                    const value = $css$1.checkStyleValue(element, attr, item.style[attr], style, fontSize);
                    if (value) {
                        styleMap[attr] = value;
                    }
                }
                if (this.userSettings.preloadImages && styleMap.backgroundImage && styleMap.backgroundImage !== 'initial') {
                    for (const value of styleMap.backgroundImage.split($util$3.REGEXP_COMPILED.SEPARATOR)) {
                        const uri = $css$1.resolveURL(value.trim());
                        if (uri !== '' && !this.session.image.has(uri)) {
                            this.session.image.set(uri, { width: 0, height: 0, uri });
                        }
                    }
                }
                const data = $dom.getElementCache(element, 'styleMap');
                if (data) {
                    Object.assign(data, styleMap);
                }
                else {
                    $dom.setElementCache(element, 'style', style);
                    $dom.setElementCache(element, 'styleMap', styleMap);
                }
            });
        }
        set userSettings(value) {
            this._userSettings = value;
        }
        get userSettings() {
            return this._userSettings || {};
        }
        get viewData() {
            return [].concat(this._views, this._includes);
        }
        get sessionData() {
            return { cache: this.session.cache, templates: this.viewData };
        }
        get rendered() {
            return this.session.cache.filter(node => node.visible && node.rendered);
        }
        get nextId() {
            return this.processing.cache.nextId;
        }
        get size() {
            return this.session.documentRoot.length;
        }
    }

    const $color$1 = squared.lib.color;
    const $css$2 = squared.lib.css;
    const $dom$1 = squared.lib.dom;
    const $util$4 = squared.lib.util;
    const $xml$1 = squared.lib.xml;
    class Controller {
        constructor(application, cache) {
            this.application = application;
            this.cache = cache;
            this._beforeOutside = {};
            this._beforeInside = {};
            this._afterInside = {};
            this._afterOutside = {};
        }
        reset() {
            this._beforeOutside = {};
            this._afterOutside = {};
        }
        applyDefaultStyles(element) {
            const styleMap = $dom$1.getElementCache(element, 'styleMap') || {};
            if ($util$4.isUserAgent(8 /* FIREFOX */)) {
                if (styleMap.display === undefined) {
                    switch (element.tagName) {
                        case 'INPUT':
                        case 'TEXTAREA':
                        case 'SELECT':
                        case 'BUTTON':
                            styleMap.display = 'inline-block';
                            break;
                    }
                }
            }
            switch (element.tagName) {
                case 'INPUT':
                    switch (element.type) {
                        case 'file': {
                            const style = $css$2.getStyle(element);
                            const color = $color$1.parseColor(style.backgroundColor || '');
                            if (color === undefined) {
                                styleMap.backgroundColor = '#DDDDDD';
                                if (style.borderStyle === 'none') {
                                    for (const border of ['borderTop', 'borderRight', 'borderBottom', 'borderLeft']) {
                                        styleMap[`${border}Style`] = 'solid';
                                        styleMap[`${border}Color`] = '#DDDDDD';
                                        styleMap[`${border}Width`] = '2px';
                                    }
                                }
                            }
                            break;
                        }
                    }
                    break;
                case 'FORM':
                    if (styleMap.marginTop === undefined) {
                        styleMap.marginTop = '0px';
                    }
                    break;
                case 'IFRAME':
                    if (styleMap.display === undefined) {
                        styleMap.display = 'block';
                    }
                case 'IMG':
                    const setDimension = (attr, opposing) => {
                        if (styleMap[attr] === undefined || styleMap[attr] === 'auto') {
                            const match = new RegExp(`${attr}="(\\d+)"`).exec(element.outerHTML);
                            if (match) {
                                styleMap[attr] = $util$4.formatPX($util$4.isPercent(match[1]) ? parseFloat(match[1]) / 100 * (element.parentElement || element).getBoundingClientRect()[attr] : match[1]);
                            }
                            else if (element.tagName === 'IFRAME') {
                                if (attr === 'width') {
                                    styleMap.width = '300px';
                                }
                                else {
                                    styleMap.height = '150px';
                                }
                            }
                            else if (styleMap[opposing] === undefined || styleMap[opposing] !== 'auto' && !$util$4.isPercent(styleMap[opposing])) {
                                const image = this.application.session.image.get(element.src);
                                if (image && image.width > 0 && image.height > 0) {
                                    styleMap[attr] = $util$4.formatPX(image[attr] * (styleMap[opposing] && $util$4.isLength(styleMap[opposing]) ? (parseFloat(styleMap[opposing]) / image[opposing]) : 1));
                                }
                            }
                        }
                    };
                    setDimension('width', 'height');
                    setDimension('height', 'width');
                    break;
            }
            $dom$1.setElementCache(element, 'styleMap', styleMap);
        }
        addBeforeOutsideTemplate(id, value, index = -1) {
            if (this._beforeOutside[id] === undefined) {
                this._beforeOutside[id] = [];
            }
            if (index !== -1 && index < this._beforeOutside[id].length) {
                this._beforeOutside[id].splice(index, 0, value);
            }
            else {
                this._beforeOutside[id].push(value);
            }
        }
        addBeforeInsideTemplate(id, value, index = -1) {
            if (this._beforeInside[id] === undefined) {
                this._beforeInside[id] = [];
            }
            if (index !== -1 && index < this._beforeInside[id].length) {
                this._beforeInside[id].splice(index, 0, value);
            }
            else {
                this._beforeInside[id].push(value);
            }
        }
        addAfterInsideTemplate(id, value, index = -1) {
            if (this._afterInside[id] === undefined) {
                this._afterInside[id] = [];
            }
            if (index !== -1 && index < this._afterInside[id].length) {
                this._afterInside[id].splice(index, 0, value);
            }
            else {
                this._afterInside[id].push(value);
            }
        }
        addAfterOutsideTemplate(id, value, index = -1) {
            if (this._afterOutside[id] === undefined) {
                this._afterOutside[id] = [];
            }
            if (index !== -1 && index < this._afterOutside[id].length) {
                this._afterOutside[id].splice(index, 0, value);
            }
            else {
                this._afterOutside[id].push(value);
            }
        }
        getBeforeOutsideTemplate(id, depth = 0) {
            return this._beforeOutside[id] ? $xml$1.pushIndentArray(this._beforeOutside[id], depth) : '';
        }
        getBeforeInsideTemplate(id, depth = 0) {
            return this._beforeInside[id] ? $xml$1.pushIndentArray(this._beforeInside[id], depth) : '';
        }
        getAfterInsideTemplate(id, depth = 0) {
            return this._afterInside[id] ? $xml$1.pushIndentArray(this._afterInside[id], depth) : '';
        }
        getAfterOutsideTemplate(id, depth = 0) {
            return this._afterOutside[id] ? $xml$1.pushIndentArray(this._afterOutside[id], depth) : '';
        }
        hasAppendProcessing(id) {
            return this._beforeOutside[id] !== undefined || this._beforeInside[id] !== undefined || this._afterInside[id] !== undefined || this._afterOutside[id] !== undefined;
        }
        cascadeDocument(templates, depth) {
            const indent = depth > 0 ? '\t'.repeat(depth) : '';
            let output = '';
            for (let i = 0; i < templates.length; i++) {
                const item = templates[i];
                if (item) {
                    const node = item.node;
                    switch (item.type) {
                        case 1 /* XML */: {
                            const controlName = item.controlName;
                            const attributes = item.attributes;
                            let template = indent + `<${controlName + (depth === 0 ? '{#0} ' : '') + (this.userSettings.showAttributes ? (attributes ? $xml$1.pushIndent(attributes, depth + 1) : node.extractAttributes(depth + 1)) : '')}`;
                            if (node.renderTemplates) {
                                const renderDepth = depth + 1;
                                template += '>\n' +
                                    this.getBeforeInsideTemplate(node.id, renderDepth) +
                                    this.cascadeDocument(this.sortRenderPosition(node, node.renderTemplates), renderDepth) +
                                    this.getAfterInsideTemplate(node.id, renderDepth) +
                                    indent + `</${controlName}>\n`;
                            }
                            else {
                                template += ' />\n';
                            }
                            output += this.getBeforeOutsideTemplate(node.id, depth) +
                                template +
                                this.getAfterOutsideTemplate(node.id, depth);
                            break;
                        }
                        case 2 /* INCLUDE */: {
                            const content = item.content;
                            if (content) {
                                output += $xml$1.pushIndent(content, depth);
                            }
                            break;
                        }
                    }
                }
            }
            return output;
        }
        getEnclosingTag(type, options) {
            switch (type) {
                case 1 /* XML */:
                    const { controlName, attributes, content } = options;
                    return '<' + controlName + (attributes || '') + (content ? '>\n' + content + '</' + controlName + '>\n' : ' />\n');
            }
            return '';
        }
    }

    const $css$3 = squared.lib.css;
    const $util$5 = squared.lib.util;
    class Extension {
        constructor(name, framework, tagNames, options) {
            this.name = name;
            this.framework = framework;
            this.eventOnly = false;
            this.preloaded = false;
            this.documentBase = false;
            this.options = {};
            this.dependencies = [];
            this.subscribers = new Set();
            this.tagNames = Array.isArray(tagNames) ? $util$5.replaceMap(tagNames, value => value.trim().toUpperCase()) : [];
            if (options) {
                Object.assign(this.options, options);
            }
        }
        static findNestedElement(element, name) {
            if ($css$3.hasComputedStyle(element)) {
                for (let i = 0; i < element.children.length; i++) {
                    const item = element.children[i];
                    if ($util$5.includes(item.dataset.use, name)) {
                        return item;
                    }
                }
            }
            return null;
        }
        is(node) {
            return node.styleElement ? this.tagNames.length === 0 || this.tagNames.includes(node.element.tagName) : false;
        }
        require(name, preload = false) {
            this.dependencies.push({ name, preload });
        }
        included(element) {
            return $util$5.includes(element.dataset.use, this.name);
        }
        beforeInit(element, recursive = false) {
            if (!recursive && this.included(element)) {
                for (const item of this.dependencies) {
                    if (item.preload) {
                        const ext = this.application.extensionManager.retrieve(item.name);
                        if (ext && !ext.preloaded) {
                            ext.beforeInit(element, true);
                            ext.preloaded = true;
                        }
                    }
                }
            }
        }
        init(element) {
            return false;
        }
        afterInit(element, recursive = false) {
            if (!recursive && this.included(element)) {
                for (const item of this.dependencies) {
                    if (item.preload) {
                        const ext = this.application.extensionManager.retrieve(item.name);
                        if (ext && ext.preloaded) {
                            ext.afterInit(element, true);
                            ext.preloaded = false;
                        }
                    }
                }
            }
        }
        condition(node, parent) {
            if ($css$3.hasComputedStyle(node.element)) {
                return node.dataset.use ? this.included(node.element) : this.tagNames.length > 0;
            }
            return false;
        }
        processNode(node, parent) {
            return undefined;
        }
        processChild(node, parent) {
            return undefined;
        }
        addDescendant(node) {
            const extensions = this.application.session.extensionMap.get(node.id) || [];
            if (!extensions.includes(this)) {
                extensions.push(this);
            }
            this.application.session.extensionMap.set(node.id, extensions);
        }
        postBaseLayout(node) { }
        postConstraints(node) { }
        postParseDocument(node) { }
        postProcedure(node) { }
        beforeParseDocument() { }
        afterBaseLayout() { }
        afterConstraints() { }
        afterResources() { }
        afterParseDocument() { }
        beforeCascadeDocument() { }
        afterFinalize() { }
        get installed() {
            return this.application.extensions ? this.application.extensions.has(this) : false;
        }
    }

    const $util$6 = squared.lib.util;
    class ExtensionManager {
        constructor(application) {
            this.application = application;
        }
        include(ext) {
            const found = this.retrieve(ext.name);
            if (found) {
                if (Array.isArray(ext.tagNames)) {
                    found.tagNames = ext.tagNames;
                }
                Object.assign(found.options, ext.options);
                return true;
            }
            else {
                if ((ext.framework === 0 || $util$6.hasBit(ext.framework, this.application.framework)) && ext.dependencies.every(item => !!this.retrieve(item.name))) {
                    ext.application = this.application;
                    this.application.extensions.add(ext);
                    return true;
                }
            }
            return false;
        }
        exclude(ext) {
            return this.application.extensions.delete(ext);
        }
        retrieve(name) {
            for (const ext of this.application.extensions) {
                if (ext.name === name) {
                    return ext;
                }
            }
            return null;
        }
        optionValue(name, attr) {
            const ext = this.retrieve(name);
            if (ext && typeof ext.options === 'object') {
                return ext.options[attr];
            }
            return undefined;
        }
        optionValueAsObject(name, attr) {
            const value = this.optionValue(name, attr);
            if (typeof value === 'object') {
                return value;
            }
            return null;
        }
        optionValueAsString(name, attr) {
            const value = this.optionValue(name, attr);
            return typeof value === 'string' ? value : '';
        }
        optionValueAsNumber(name, attr) {
            const value = this.optionValue(name, attr);
            return typeof value === 'number' ? value : 0;
        }
        optionValueAsBoolean(name, attr) {
            const value = this.optionValue(name, attr);
            return typeof value === 'boolean' ? value : false;
        }
    }

    const $util$7 = squared.lib.util;
    class File {
        constructor(resource) {
            this.resource = resource;
            this.appName = '';
            this.assets = [];
            resource.fileHandler = this;
        }
        static downloadToDisk(data, filename, mime = '') {
            const blob = new Blob([data], { type: mime || 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const element = document.createElement('a');
            element.style.display = 'none';
            element.href = url;
            element.setAttribute('download', filename);
            if (typeof element.download === 'undefined') {
                element.setAttribute('target', '_blank');
            }
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            setTimeout(() => window.URL.revokeObjectURL(url), 1);
        }
        addAsset(pathname, filename, content = '', uri = '') {
            if (content || uri) {
                const index = this.assets.findIndex(item => item.pathname === pathname && item.filename === filename);
                if (index !== -1) {
                    this.assets[index].content = content;
                    this.assets[index].uri = uri;
                }
                else {
                    this.assets.push({
                        pathname,
                        filename,
                        content,
                        uri
                    });
                }
            }
        }
        reset() {
            this.assets.length = 0;
        }
        saveToDisk(files, appName) {
            if (!location.protocol.startsWith('http')) {
                alert('SERVER (required): See README for instructions');
                return;
            }
            if (files.length) {
                const settings = this.userSettings;
                $util$7.concatArray(files, this.assets);
                fetch(`/api/savetodisk` +
                    `?directory=${encodeURIComponent($util$7.trimString(settings.outputDirectory, '/'))}` +
                    (appName ? `&appname=${encodeURIComponent(appName.trim())}` : '') +
                    `&filetype=${settings.outputArchiveFileType.toLowerCase()}` +
                    `&processingtime=${settings.outputMaxProcessingTime.toString().trim()}`, {
                    method: 'POST',
                    headers: new Headers({
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    }),
                    body: JSON.stringify(files)
                })
                    .then((response) => response.json())
                    .then((result) => {
                    if (result) {
                        if (result.zipname) {
                            fetch(`/api/downloadtobrowser?filename=${encodeURIComponent(result.zipname)}`)
                                .then((responseBlob) => responseBlob.blob())
                                .then((blob) => File.downloadToDisk(blob, $util$7.fromLastIndexOf(result.zipname)));
                        }
                        else if (result.system) {
                            alert(`${result.application}\n\n${result.system}`);
                        }
                    }
                })
                    .catch(err => alert(`ERROR: ${err}`));
            }
        }
        get stored() {
            return this.resource.stored;
        }
    }

    const CSS_SPACING = new Map([
        [2 /* MARGIN_TOP */, 'marginTop'],
        [4 /* MARGIN_RIGHT */, 'marginRight'],
        [8 /* MARGIN_BOTTOM */, 'marginBottom'],
        [16 /* MARGIN_LEFT */, 'marginLeft'],
        [32 /* PADDING_TOP */, 'paddingTop'],
        [64 /* PADDING_RIGHT */, 'paddingRight'],
        [128 /* PADDING_BOTTOM */, 'paddingBottom'],
        [256 /* PADDING_LEFT */, 'paddingLeft']
    ]);
    const EXT_NAME = {
        ACCESSIBILITY: 'squared.accessibility',
        CSS_GRID: 'squared.css-grid',
        EXTERNAL: 'squared.external',
        FLEXBOX: 'squared.flexbox',
        GRID: 'squared.grid',
        LIST: 'squared.list',
        RELATIVE: 'squared.relative',
        SPRITE: 'squared.sprite',
        SUBSTITUTE: 'squared.substitute',
        TABLE: 'squared.table',
        VERTICAL_ALIGN: 'squared.verticalalign',
        WHITESPACE: 'squared.whitespace'
    };

    var constant = /*#__PURE__*/Object.freeze({
        CSS_SPACING: CSS_SPACING,
        EXT_NAME: EXT_NAME
    });

    const $css$4 = squared.lib.css;
    const $dom$2 = squared.lib.dom;
    const $element$2 = squared.lib.element;
    const $util$8 = squared.lib.util;
    const INHERIT_ALIGNMENT = ['position', 'display', 'verticalAlign', 'cssFloat', 'clear', 'zIndex'];
    const CSS_SPACING_KEYS = Array.from(CSS_SPACING.keys());
    class Node extends squared.lib.base.Container {
        constructor(id, element) {
            super();
            this.id = id;
            this.alignmentType = 0;
            this.depth = -1;
            this.siblingIndex = Number.POSITIVE_INFINITY;
            this.documentRoot = false;
            this.visible = true;
            this.excluded = false;
            this.rendered = false;
            this.baselineActive = false;
            this.positioned = false;
            this.controlId = '';
            this._cached = {};
            this._styleMap = {};
            this._initial = {
                iteration: -1,
                children: [],
                styleMap: {}
            };
            this._data = {};
            this._excludeSection = 0;
            this._excludeProcedure = 0;
            this._excludeResource = 0;
            this._element = null;
            if (element) {
                this._element = element;
                this.init();
            }
            else {
                this.style = {};
            }
        }
        init() {
            const element = this._element;
            if (element) {
                $dom$2.setElementCache(element, 'node', this);
                this.style = $dom$2.getElementCache(element, 'style') || $css$4.getStyle(element, false);
            }
            if (this.styleElement) {
                const styleMap = $dom$2.getElementCache(element, 'styleMap') || {};
                const fontSize = parseInt(this.style.fontSize) || undefined;
                for (let attr of Array.from(element.style)) {
                    attr = $util$8.convertCamelCase(attr);
                    const value = $css$4.checkStyleValue(element, attr, element.style[attr], this.style, fontSize);
                    if (value) {
                        styleMap[attr] = value;
                    }
                }
                this._styleMap = Object.assign({}, styleMap);
            }
        }
        saveAsInitial() {
            if (this._initial.iteration === -1) {
                this._initial.children = this.duplicate();
                this._initial.styleMap = Object.assign({}, this._styleMap);
                this._initial.documentParent = this._documentParent;
            }
            if (this._bounds) {
                this._initial.bounds = $dom$2.assignRect(this._bounds);
                this._initial.linear = $dom$2.assignRect(this.linear);
                this._initial.box = $dom$2.assignRect(this.box);
            }
            this._initial.iteration++;
        }
        is(...containers) {
            return containers.some(value => this.containerType === value);
        }
        of(containerType, ...alignmentType) {
            return this.containerType === containerType && alignmentType.some(value => this.hasAlign(value));
        }
        unsafe(obj) {
            const name = `_${obj}`;
            return this[name] || undefined;
        }
        attr(obj, attr, value = '', overwrite = true) {
            const name = `__${obj}`;
            if ($util$8.hasValue(value)) {
                if (this[name] === undefined) {
                    this._namespaces.add(obj);
                    this[name] = {};
                }
                if (!overwrite && this[name][attr] !== undefined) {
                    return '';
                }
                this[name][attr] = value.toString();
            }
            return this[name][attr] || '';
        }
        namespace(obj) {
            const name = `__${obj}`;
            return this[name] || {};
        }
        delete(obj, ...attrs) {
            const name = `__${obj}`;
            if (this[name]) {
                for (const attr of attrs) {
                    if (attr.indexOf('*') !== -1) {
                        for (const [key] of $util$8.searchObject(this[name], attr)) {
                            delete this[name][key];
                        }
                    }
                    else {
                        delete this[name][attr];
                    }
                }
            }
        }
        apply(options) {
            for (const obj in options) {
                const namespace = options[obj];
                if (typeof namespace === 'object') {
                    for (const attr in namespace) {
                        this.attr(obj, attr, namespace[attr]);
                    }
                    delete options[obj];
                }
            }
        }
        render(parent) {
            this.renderParent = parent;
            this.rendered = true;
        }
        renderEach(predicate) {
            for (let i = 0; i < this.renderChildren.length; i++) {
                if (this.renderChildren[i].visible) {
                    predicate(this.renderChildren[i], i, this.renderChildren);
                }
            }
            return this;
        }
        renderFilter(predicate) {
            return $util$8.filterArray(this.renderChildren, predicate);
        }
        hide(invisible) {
            this.rendered = true;
            this.visible = false;
        }
        data(obj, attr, value, overwrite = true) {
            if ($util$8.hasValue(value)) {
                if (this._data[obj] === undefined) {
                    this._data[obj] = {};
                }
                if (typeof this._data[obj] === 'object') {
                    if (overwrite || this._data[obj][attr] === undefined) {
                        this._data[obj][attr] = value;
                    }
                }
            }
            else if (value === null) {
                delete this._data[obj];
            }
            return this._data[obj] === undefined || this._data[obj][attr] === undefined ? undefined : this._data[obj][attr];
        }
        unsetCache(...attrs) {
            if (attrs.length) {
                for (const attr of attrs) {
                    switch (attr) {
                        case 'position':
                            this._cached = {};
                            return;
                        case 'width':
                        case 'minWidth':
                            this._cached.hasWidth = undefined;
                            break;
                        case 'height':
                        case 'minHeight':
                            this._cached.hasHeight = undefined;
                            break;
                        case 'verticalAlign':
                            this._cached.baseline = undefined;
                            break;
                        case 'display':
                            this._cached.inline = undefined;
                            this._cached.inlineVertical = undefined;
                            this._cached.inlineFlow = undefined;
                            this._cached.block = undefined;
                            this._cached.blockDimension = undefined;
                            this._cached.blockStatic = undefined;
                            this._cached.autoMargin = undefined;
                            break;
                        case 'pageFlow':
                            this._cached.positionAuto = undefined;
                            this._cached.blockStatic = undefined;
                            this._cached.baseline = undefined;
                            this._cached.floating = undefined;
                            this._cached.autoMargin = undefined;
                            this._cached.rightAligned = undefined;
                            this._cached.bottomAligned = undefined;
                            break;
                        default:
                            if (attr.startsWith('margin')) {
                                this._cached.autoMargin = undefined;
                            }
                            break;
                    }
                    this._cached[attr] = undefined;
                }
            }
            else {
                this._cached = {};
            }
        }
        ascend(generated = false, levels = -1) {
            const result = [];
            const attr = generated ? (this.renderParent ? 'renderParent' : 'parent') : 'actualParent';
            let current = this[attr];
            let i = -1;
            while (current && current.id !== 0 && !result.includes(current)) {
                result.push(current);
                if (++i === levels) {
                    break;
                }
                current = current[attr];
            }
            return result;
        }
        cascade(element = false) {
            const result = super.cascade();
            if (element) {
                return $util$8.spliceArray(result, node => node.element === null);
            }
            return result;
        }
        inherit(node, ...modules) {
            const initial = node.unsafe('initial');
            for (const name of modules) {
                switch (name) {
                    case 'initial':
                        Object.assign(this._initial, initial);
                        break;
                    case 'base':
                        this._documentParent = node.documentParent;
                        this._bounds = $dom$2.assignRect(node.bounds);
                        this._linear = $dom$2.assignRect(node.linear);
                        this._box = $dom$2.assignRect(node.box);
                        const actualParent = node.actualParent;
                        if (actualParent) {
                            this.css('direction', actualParent.dir);
                        }
                        break;
                    case 'alignment':
                        for (const attr of INHERIT_ALIGNMENT) {
                            this._styleMap[attr] = node.css(attr);
                            this._initial.styleMap[attr] = initial.styleMap[attr];
                        }
                        if (!this.positionStatic) {
                            for (const attr of $css$4.BOX_POSITION) {
                                this._styleMap[attr] = node.css(attr);
                                this._initial.styleMap[attr] = initial.styleMap[attr];
                            }
                        }
                        if (node.autoMargin.horizontal || node.autoMargin.vertical) {
                            for (const attr of $css$4.BOX_MARGIN) {
                                if (node.cssInitial(attr, true) === 'auto') {
                                    this._styleMap[attr] = 'auto';
                                }
                                if (node.cssInitial(attr) === 'auto') {
                                    this._initial.styleMap[attr] = 'auto';
                                }
                            }
                        }
                        break;
                    case 'styleMap':
                        $util$8.assignEmptyProperty(this._styleMap, node.unsafe('styleMap'));
                        break;
                    case 'textStyle':
                        this.cssApply({
                            fontFamily: node.css('fontFamily'),
                            fontSize: node.css('fontSize'),
                            fontWeight: node.css('fontWeight'),
                            color: node.css('color'),
                            whiteSpace: node.css('whiteSpace'),
                            opacity: node.css('opacity')
                        });
                        break;
                }
            }
        }
        alignedVertically(previousSiblings, siblings, cleared, checkFloat = true) {
            const actualParent = this.actualParent;
            if (this.lineBreak || actualParent === undefined) {
                return true;
            }
            else if (this.pageFlow && previousSiblings.length) {
                if ($util$8.isArray(siblings) && this !== siblings[0]) {
                    if (cleared && cleared.has(this)) {
                        return true;
                    }
                    else if (checkFloat && this.floating && (this.linear.top >= Math.floor(siblings[siblings.length - 1].linear.bottom) || this.float === 'left' && siblings.find(node => node.siblingIndex < this.siblingIndex && $util$8.withinRange(this.linear.left, node.linear.left)) !== undefined || this.float === 'right' && siblings.find(node => node.siblingIndex < this.siblingIndex && $util$8.withinRange(this.linear.right, node.linear.right)) !== undefined)) {
                        return true;
                    }
                }
                for (const previous of previousSiblings) {
                    if (previous.blockStatic ||
                        this.blockStatic && (!previous.inlineFlow || !!cleared && cleared.has(previous)) ||
                        cleared && cleared.get(previous) === 'both' && (!$util$8.isArray(siblings) || siblings[0] !== previous) ||
                        !previous.floating && (this.blockStatic || !this.floating && !this.inlineFlow || siblings && this.display === 'inline-block' && this.linear.top >= Math.floor(siblings[siblings.length - 1].linear.bottom)) ||
                        previous.bounds.width > (actualParent.has('width', 2 /* LENGTH */) ? actualParent.width : actualParent.box.width) && (!previous.textElement || previous.textElement && previous.css('whiteSpace') === 'nowrap') ||
                        previous.lineBreak ||
                        previous.autoMargin.leftRight ||
                        previous.float === 'left' && this.autoMargin.right ||
                        previous.float === 'right' && this.autoMargin.left) {
                        return true;
                    }
                }
            }
            return false;
        }
        intersectX(rect, dimension = 'linear') {
            const self = this[dimension];
            return (rect.top >= self.top && rect.top < self.bottom ||
                rect.bottom > self.top && rect.bottom <= self.bottom ||
                self.top >= rect.top && self.bottom <= rect.bottom ||
                rect.top >= self.top && rect.bottom <= self.bottom);
        }
        intersectY(rect, dimension = 'linear') {
            const self = this[dimension];
            return (rect.left >= self.left && rect.left < self.right ||
                rect.right > self.left && rect.right <= self.right ||
                self.left >= rect.left && self.right <= rect.right ||
                rect.left >= self.left && rect.right <= self.right);
        }
        withinX(rect, dimension = 'linear') {
            const self = this[dimension];
            return Math.ceil(self.top) >= Math.floor(rect.top) && Math.floor(self.bottom) <= Math.ceil(rect.bottom);
        }
        withinY(rect, dimension = 'linear') {
            const self = this[dimension];
            return Math.ceil(self.left) >= Math.floor(rect.left) && Math.floor(self.right) <= Math.ceil(rect.right);
        }
        outsideX(rect, dimension = 'linear') {
            const self = this[dimension];
            return Math.ceil(self.left) < Math.floor(rect.left) || Math.ceil(self.left) >= Math.floor(rect.right);
        }
        outsideY(rect, dimension = 'linear') {
            const self = this[dimension];
            return Math.ceil(self.top) < Math.floor(rect.top) || Math.ceil(self.top) >= Math.floor(rect.bottom);
        }
        css(attr, value = '', cache = false) {
            if (arguments.length >= 2) {
                this._styleMap[attr] = value;
                if (cache) {
                    this.unsetCache(attr);
                }
            }
            return this._styleMap[attr] || this.style && this.style[attr] || '';
        }
        cssApply(values, cache = false) {
            Object.assign(this._styleMap, values);
            if (cache) {
                for (const name in values) {
                    this.unsetCache(name);
                }
            }
            return this;
        }
        cssInitial(attr, modified = false, computed = false) {
            if (this._initial.iteration === -1 && !modified) {
                computed = true;
            }
            let value = modified ? this._styleMap[attr] : this._initial.styleMap[attr];
            if (computed && !$util$8.hasValue(value)) {
                value = this.style[attr];
            }
            return value || '';
        }
        cssAny(attr, ...values) {
            for (const value of values) {
                if (this.css(attr) === value) {
                    return true;
                }
            }
            return false;
        }
        cssInitialAny(attr, ...values) {
            for (const value of values) {
                if (this.cssInitial(attr) === value) {
                    return true;
                }
            }
            return false;
        }
        cssAscend(attr, startChild = false, visible = false) {
            let value = '';
            let current = startChild ? this : this.actualParent;
            while (current) {
                value = current.cssInitial(attr);
                if (value !== '') {
                    if (visible && !current.visible) {
                        value = '';
                    }
                    else {
                        break;
                    }
                }
                if (current.documentBody) {
                    break;
                }
                current = current.actualParent;
            }
            return value;
        }
        cssSort(attr, ascending = true, duplicate = false) {
            const children = duplicate ? this.duplicate() : this.children;
            children.sort((a, b) => {
                const valueA = a.toFloat(attr);
                const valueB = b.toFloat(attr);
                if (valueA === valueB) {
                    return 0;
                }
                if (ascending) {
                    return valueA >= valueB ? 1 : -1;
                }
                else {
                    return valueA <= valueB ? 1 : -1;
                }
            });
            return children;
        }
        cssPX(attr, value, negative = false, cache = false) {
            const current = this._styleMap[attr];
            if (current && $util$8.isLength(current)) {
                value += $util$8.parseUnit(current, this.fontSize);
                if (!negative && value < 0) {
                    value = 0;
                }
                const length = $util$8.formatPX(value);
                this.css(attr, length);
                if (cache) {
                    this.unsetCache(attr);
                }
                return length;
            }
            return '';
        }
        cssTry(attr, value) {
            if (this.styleElement) {
                const element = this._element;
                const current = this.css(attr);
                element.style[attr] = value;
                if (element.style[attr] === value) {
                    $dom$2.setElementCache(element, attr, current);
                    return true;
                }
            }
            return false;
        }
        cssFinally(attr) {
            if (this.styleElement) {
                const element = this._element;
                const value = $dom$2.getElementCache(element, attr);
                if (value) {
                    element.style[attr] = value;
                    $dom$2.deleteElementCache(element, attr);
                    return true;
                }
            }
            return false;
        }
        toInt(attr, initial = false, fallback = 0) {
            const value = parseInt((initial ? this._initial.styleMap : this._styleMap)[attr]);
            return isNaN(value) ? fallback : value;
        }
        toFloat(attr, initial = false, fallback = 0) {
            const value = parseFloat((initial ? this._initial.styleMap : this._styleMap)[attr]);
            return isNaN(value) ? fallback : value;
        }
        parseUnit(value, horizontal = true, parent = true) {
            if ($util$8.isPercent(value)) {
                const container = parent && this.absoluteParent || this;
                const attr = horizontal ? 'width' : 'height';
                return parseFloat(value) / 100 * (container.has(attr, 2 /* LENGTH */) ? container.toFloat(attr) : container[parent ? 'box' : 'bounds'][attr]);
            }
            return $util$8.parseUnit(value, this.fontSize);
        }
        convertPX(value, horizontal = true, parent = true) {
            return `${Math.round(this.parseUnit(value, horizontal, parent))}px`;
        }
        has(attr, checkType = 0, options) {
            const value = (options && options.map === 'initial' ? this._initial.styleMap : this._styleMap)[attr];
            if ($util$8.hasValue(value)) {
                switch (value) {
                    case '0px':
                        if ($util$8.hasBit(checkType, 64 /* ZERO */)) {
                            return true;
                        }
                        else {
                            switch (attr) {
                                case 'top':
                                case 'right':
                                case 'bottom':
                                case 'left':
                                    return true;
                            }
                        }
                    case 'left':
                        if ($util$8.hasBit(checkType, 8 /* LEFT */)) {
                            return true;
                        }
                    case 'baseline':
                        if ($util$8.hasBit(checkType, 16 /* BASELINE */)) {
                            return true;
                        }
                    case 'auto':
                        if ($util$8.hasBit(checkType, 4 /* AUTO */)) {
                            return true;
                        }
                    case 'none':
                    case 'initial':
                    case 'unset':
                    case 'normal':
                    case 'transparent':
                    case 'rgba(0, 0, 0, 0)':
                        return false;
                    default:
                        if (options && options.not) {
                            if (Array.isArray(options.not)) {
                                for (const exclude of options.not) {
                                    if (value === exclude) {
                                        return false;
                                    }
                                }
                            }
                            else {
                                if (value === options.not) {
                                    return false;
                                }
                            }
                        }
                        if ($util$8.hasBit(checkType, 2 /* LENGTH */) && $util$8.isLength(value)) {
                            return true;
                        }
                        if ($util$8.hasBit(checkType, 32 /* PERCENT */) && $util$8.isPercent(value)) {
                            return true;
                        }
                        if ($util$8.hasBit(checkType, 4 /* AUTO */)) {
                            return false;
                        }
                        return checkType === 0;
                }
            }
            return false;
        }
        hasAlign(value) {
            return $util$8.hasBit(this.alignmentType, value);
        }
        hasProcedure(value) {
            return !$util$8.hasBit(this.excludeProcedure, value);
        }
        hasResource(value) {
            return !$util$8.hasBit(this.excludeResource, value);
        }
        hasSection(value) {
            return !$util$8.hasBit(this.excludeSection, value);
        }
        exclude({ section = 0, procedure = 0, resource = 0 }) {
            if (section > 0 && !$util$8.hasBit(this._excludeSection, section)) {
                this._excludeSection |= section;
            }
            if (procedure > 0 && !$util$8.hasBit(this._excludeProcedure, procedure)) {
                this._excludeProcedure |= procedure;
            }
            if (resource > 0 && !$util$8.hasBit(this._excludeResource, resource)) {
                this._excludeResource |= resource;
            }
        }
        setExclusions() {
            if (this.styleElement) {
                const actualParent = this.actualParent;
                if (actualParent) {
                    const applyExclusions = (attr, enumeration) => {
                        let exclude = this.dataset[`exclude${attr}`] || '';
                        if (actualParent.dataset[`exclude${attr}Child`]) {
                            exclude += (exclude !== '' ? '|' : '') + actualParent.dataset[`exclude${attr}Child`];
                        }
                        if (exclude !== '') {
                            let offset = 0;
                            for (let name of exclude.split('|')) {
                                name = name.trim().toUpperCase();
                                if (enumeration[name] && !$util$8.hasBit(offset, enumeration[name])) {
                                    offset |= enumeration[name];
                                }
                            }
                            if (offset > 0) {
                                this.exclude({ [attr.toLowerCase()]: offset });
                            }
                        }
                    };
                    applyExclusions('Section', APP_SECTION);
                    applyExclusions('Procedure', NODE_PROCEDURE);
                    applyExclusions('Resource', NODE_RESOURCE);
                }
            }
        }
        setBounds() {
            if (this.styleElement) {
                this._bounds = $dom$2.assignRect(this._element.getBoundingClientRect());
                if (this.documentBody) {
                    let marginTop = this.marginTop;
                    if (marginTop > 0) {
                        const firstChild = this.firstChild;
                        if (firstChild && firstChild.blockStatic && !firstChild.lineBreak && firstChild.marginTop >= marginTop) {
                            marginTop = 0;
                        }
                    }
                    this._bounds.top = marginTop;
                }
            }
            else if (this.plainText) {
                const rangeRect = $dom$2.getRangeClientRect(this._element);
                this._bounds = $dom$2.assignRect(rangeRect);
                this._cached.multiline = rangeRect.multiline > 0;
            }
        }
        appendTry(node, replacement, append = true) {
            let valid = false;
            for (let i = 0; i < this.length; i++) {
                if (this.children[i] === node) {
                    replacement.siblingIndex = node.siblingIndex;
                    this.children[i] = replacement;
                    replacement.parent = this;
                    replacement.innerChild = node;
                    valid = true;
                    break;
                }
            }
            if (append) {
                replacement.parent = this;
                valid = true;
            }
            if (valid) {
                this.each((item, index) => item.siblingIndex = index);
            }
            return valid;
        }
        modifyBox(region, offset, negative = true) {
            if (offset !== 0) {
                const attr = CSS_SPACING.get(region);
                if (attr) {
                    if (offset === null || !negative && this._boxAdjustment[attr] === 0 && offset < 0) {
                        this._boxReset[attr] = 1;
                    }
                    else {
                        this._boxAdjustment[attr] += offset;
                        if (!negative && this._boxAdjustment[attr] < 0) {
                            this._boxAdjustment[attr] = 0;
                        }
                    }
                }
            }
        }
        valueBox(region) {
            const attr = CSS_SPACING.get(region);
            return attr ? [this._boxReset[attr], this._boxAdjustment[attr]] : [0, 0];
        }
        resetBox(region, node, fromParent = false) {
            const applyReset = (attrs, start) => {
                for (let i = 0; i < attrs.length; i++) {
                    this._boxReset[attrs[i]] = 1;
                    const attr = CSS_SPACING.get(CSS_SPACING_KEYS[i + start]);
                    const value = this[attr];
                    if (node && value !== 0) {
                        if (!node.naturalElement && node[attr] === 0) {
                            node.css(attr, $util$8.formatPX(value), true);
                        }
                        else {
                            node.modifyBox(CSS_SPACING_KEYS[i + (fromParent ? 0 : 4)], value);
                        }
                    }
                }
            };
            if ($util$8.hasBit(region, 30 /* MARGIN */)) {
                applyReset($css$4.BOX_MARGIN, 0);
            }
            if ($util$8.hasBit(region, 480 /* PADDING */)) {
                applyReset($css$4.BOX_PADDING, 4);
            }
        }
        inheritBox(region, node) {
            const applyReset = (attrs, start) => {
                for (let i = 0; i < attrs.length; i++) {
                    const value = this._boxAdjustment[attrs[i]];
                    if (value > 0) {
                        node.modifyBox(CSS_SPACING_KEYS[i + start], value, false);
                        this._boxAdjustment[attrs[i]] = 0;
                    }
                }
            };
            if ($util$8.hasBit(region, 30 /* MARGIN */)) {
                applyReset($css$4.BOX_MARGIN, 0);
            }
            if ($util$8.hasBit(region, 480 /* PADDING */)) {
                applyReset($css$4.BOX_PADDING, 4);
            }
        }
        previousSiblings(lineBreak = true, excluded = true, height = false) {
            const result = [];
            let element = null;
            if (this._element) {
                element = this._element.previousSibling;
            }
            else if (this._initial.children.length) {
                const children = $util$8.filterArray(this._initial.children, node => node.pageFlow);
                element = children.length && children[0].element ? children[0].element.previousSibling : null;
            }
            while (element) {
                const node = $dom$2.getElementAsNode(element);
                if (node) {
                    if (lineBreak && node.lineBreak || excluded && node.excluded) {
                        result.push(node);
                    }
                    else if (!node.excluded && node.pageFlow) {
                        result.push(node);
                        if (!height || (node.visible || node.rendered) && !node.floating) {
                            break;
                        }
                    }
                }
                element = element.previousSibling;
            }
            return result;
        }
        nextSiblings(lineBreak = true, excluded = true, visible = false) {
            const result = [];
            let element = null;
            if (this._element) {
                element = this._element.nextSibling;
            }
            else if (this._initial.children.length) {
                const children = $util$8.filterArray(this._initial.children, node => node.pageFlow);
                if (children.length) {
                    const lastChild = children[children.length - 1];
                    element = lastChild.element && lastChild.element.nextSibling;
                }
            }
            while (element) {
                const node = $dom$2.getElementAsNode(element);
                if (node) {
                    if (node.naturalElement) {
                        if (lineBreak && node.lineBreak || excluded && node.excluded) {
                            result.push(node);
                        }
                        else if (!node.excluded && node.pageFlow) {
                            result.push(node);
                            if (!visible || (node.visible || node.rendered) && !node.floating) {
                                break;
                            }
                        }
                    }
                    else {
                        break;
                    }
                }
                element = element.nextSibling;
            }
            return result;
        }
        actualRight(dimension = 'linear') {
            const node = this.companion && !this.companion.visible && this.companion[dimension].right > this[dimension].right ? this.companion : this;
            return node[dimension].right;
        }
        setDimensions(dimension) {
            const bounds = this.unsafe(dimension);
            if (bounds) {
                bounds.width = this.bounds.width;
                bounds.height = bounds.bottom - bounds.top;
                if (this.styleElement) {
                    switch (dimension) {
                        case 'linear':
                            bounds.width += (this.marginLeft > 0 ? this.marginLeft : 0) + this.marginRight;
                            break;
                        case 'box':
                            bounds.width -= this.contentBoxWidth;
                            break;
                    }
                }
                if (this._initial[dimension] === undefined) {
                    this._initial[dimension] = $dom$2.assignRect(bounds);
                }
            }
        }
        convertPosition(attr) {
            let value = 0;
            if (!this.positionStatic) {
                const unit = this.cssInitial(attr);
                if ($util$8.isLength(unit) || $util$8.isPercent(unit)) {
                    value = $util$8.convertFloat(this.convertLength(attr, unit, attr === 'left' || attr === 'right'));
                }
            }
            return value;
        }
        convertBox(region, direction) {
            const attr = region + direction;
            return $util$8.convertFloat(this.convertLength(attr, this.css(attr), direction === 'Left' || direction === 'Right'));
        }
        convertLength(attr, value, horizontal, parent = true) {
            if ($util$8.isPercent(value)) {
                return $util$8.isLength(this.style[attr]) ? this.style[attr] : this.convertPX(value, horizontal, parent);
            }
            return value;
        }
        set parent(value) {
            if (value) {
                if (value !== this._parent) {
                    if (this._parent) {
                        this._parent.remove(this);
                    }
                    this._parent = value;
                }
                if (!value.contains(this)) {
                    value.append(this);
                }
                if (this.depth === -1) {
                    this.depth = value.depth + 1;
                }
            }
        }
        get parent() {
            return this._parent;
        }
        set tagName(value) {
            this._cached.tagName = value.toUpperCase();
        }
        get tagName() {
            if (this._cached.tagName === undefined) {
                const element = this._element;
                let value = '';
                if (element) {
                    if (element.nodeName === '#text') {
                        value = 'PLAINTEXT';
                    }
                    else if (element.tagName === 'INPUT') {
                        value = element.type;
                    }
                    else {
                        value = element.tagName;
                    }
                }
                this._cached.tagName = value.toUpperCase();
            }
            return this._cached.tagName;
        }
        get element() {
            if (!this.naturalElement && this.innerChild) {
                const element = this.innerChild.unsafe('element');
                if (element) {
                    return element;
                }
            }
            return this._element;
        }
        get elementId() {
            return this._element && this._element.id || '';
        }
        get htmlElement() {
            if (this._cached.htmlElement === undefined) {
                this._cached.htmlElement = this._element instanceof HTMLElement;
            }
            return this._cached.htmlElement;
        }
        get svgElement() {
            return this._element !== null && this._element.tagName === 'svg';
        }
        get styleElement() {
            return $css$4.hasComputedStyle(this._element);
        }
        get naturalElement() {
            if (this._cached.naturalElement === undefined) {
                this._cached.naturalElement = this._element !== null && this._element.className !== '__css.placeholder';
            }
            return this._cached.naturalElement;
        }
        get imageElement() {
            return this.tagName === 'IMG';
        }
        get flexElement() {
            return this.display === 'flex' || this.display === 'inline-flex';
        }
        get gridElement() {
            return this.display === 'grid';
        }
        get textElement() {
            return this.plainText || this.inlineText;
        }
        get tableElement() {
            return this.tagName === 'TABLE' || this.display === 'table';
        }
        get inputElement() {
            return this._element !== null && this._element.tagName === 'INPUT';
        }
        get groupParent() {
            return false;
        }
        get plainText() {
            return this.tagName === 'PLAINTEXT';
        }
        get lineBreak() {
            return this.tagName === 'BR';
        }
        get documentBody() {
            return this._element === document.body;
        }
        get bounds() {
            return this._bounds || $dom$2.newRectDimension();
        }
        get linear() {
            if (this._linear === undefined && this._bounds) {
                if (this._element) {
                    const bounds = this._bounds;
                    this._linear = {
                        top: bounds.top - (this.marginTop > 0 ? this.marginTop : 0),
                        right: bounds.right + this.marginRight,
                        bottom: bounds.bottom + this.marginBottom,
                        left: bounds.left - (this.marginLeft > 0 ? this.marginLeft : 0),
                        width: 0,
                        height: 0
                    };
                }
                else {
                    this._linear = $dom$2.assignRect(this._bounds);
                }
                this.setDimensions('linear');
            }
            return this._linear || $dom$2.newRectDimension();
        }
        get box() {
            if (this._box === undefined && this._bounds) {
                if (this._element) {
                    const bounds = this._bounds;
                    this._box = {
                        top: bounds.top + (this.paddingTop + this.borderTopWidth),
                        right: bounds.right - (this.paddingRight + this.borderRightWidth),
                        bottom: bounds.bottom - (this.paddingBottom + this.borderBottomWidth),
                        left: bounds.left + (this.paddingLeft + this.borderLeftWidth),
                        width: 0,
                        height: 0
                    };
                }
                else {
                    this._box = $dom$2.assignRect(this._bounds);
                }
                this.setDimensions('box');
            }
            return this._box || $dom$2.newRectDimension();
        }
        set renderAs(value) {
            if (!this.rendered && value && !value.rendered) {
                this._renderAs = value;
            }
        }
        get renderAs() {
            return this._renderAs;
        }
        get dataset() {
            return this.htmlElement ? this._element.dataset : {};
        }
        get excludeSection() {
            return this._excludeSection;
        }
        get excludeProcedure() {
            return this._excludeProcedure;
        }
        get excludeResource() {
            return this._excludeResource;
        }
        get extensions() {
            if (this._cached.extensions === undefined) {
                this._cached.extensions = this.dataset.use ? $util$8.spliceArray(this.dataset.use.split(/\s*,\s*/), value => value === '') : [];
            }
            return this._cached.extensions;
        }
        get flexbox() {
            if (this._cached.flexbox === undefined) {
                const actualParent = this.actualParent;
                this._cached.flexbox = {
                    wrap: this.css('flexWrap'),
                    direction: this.css('flexDirection'),
                    alignSelf: !this.has('alignSelf') && actualParent && actualParent.has('alignItems') ? actualParent.css('alignItems') : this.css('alignSelf'),
                    justifyContent: this.css('justifyContent'),
                    basis: this.css('flexBasis'),
                    order: this.toInt('order'),
                    grow: this.toInt('flexGrow'),
                    shrink: this.toInt('flexShrink')
                };
            }
            return this._cached.flexbox;
        }
        get width() {
            if (this._cached.width === undefined) {
                let width = 0;
                for (const value of [this._styleMap.width, this._styleMap.minWidth]) {
                    if ($util$8.isLength(value) || $util$8.isPercent(value)) {
                        width = this.parseUnit(value);
                        if (width > 0) {
                            break;
                        }
                    }
                }
                this._cached.width = width;
            }
            return this._cached.width;
        }
        get height() {
            if (this._cached.height === undefined) {
                let height = 0;
                for (const value of [this._styleMap.height, this._styleMap.minHeight]) {
                    if ($util$8.isLength(value) || this.hasHeight && $util$8.isPercent(value)) {
                        height = this.parseUnit(value, false);
                        if (height > 0) {
                            break;
                        }
                    }
                }
                this._cached.height = height;
            }
            return this._cached.height;
        }
        get hasWidth() {
            if (this._cached.hasWidth === undefined) {
                const value = this.cssInitial('width', true);
                if (this.inlineStatic) {
                    this._cached.hasWidth = false;
                }
                else if ($util$8.isPercent(value)) {
                    this._cached.hasWidth = parseFloat(value) > 0;
                }
                else if ($util$8.isLength(value) && value !== '0px' || this.toInt('minWidth') > 0) {
                    this._cached.hasWidth = true;
                }
                else {
                    this._cached.hasWidth = false;
                }
            }
            return this._cached.hasWidth;
        }
        get hasHeight() {
            if (this._cached.hasHeight === undefined) {
                const value = this.cssInitial('height', true);
                this._cached.hasHeight = (() => {
                    if (this.inlineStatic) {
                        return false;
                    }
                    else if ($util$8.isPercent(value)) {
                        const actualParent = this.actualParent;
                        if (actualParent && actualParent.hasHeight) {
                            return parseFloat(value) > 0;
                        }
                    }
                    else if ($util$8.isLength(value) && value !== '0px' || this.toFloat('minHeight') > 0) {
                        return true;
                    }
                    return false;
                })();
            }
            return this._cached.hasHeight;
        }
        get lineHeight() {
            if (this._cached.lineHeight === undefined) {
                const lineHeight = $util$8.convertFloat(this.cssAscend('lineHeight', true));
                this._cached.lineHeight = this.has('lineHeight') || lineHeight > this.actualHeight || this.block && this.actualChildren.some(node => node.textElement) ? lineHeight : 0;
            }
            return this._cached.lineHeight;
        }
        get display() {
            return this.css('display');
        }
        get position() {
            return this.css('position');
        }
        set positionStatic(value) {
            this._cached.positionStatic = value;
            this.unsetCache('pageFlow');
        }
        get positionStatic() {
            if (this._cached.positionStatic === undefined) {
                switch (this.position) {
                    case 'fixed':
                    case 'absolute':
                        this._cached.positionStatic = false;
                        break;
                    case 'sticky':
                    case 'relative':
                        this._cached.positionStatic = this.toInt('top') === 0 && this.toInt('right') === 0 && this.toInt('bottom') === 0 && this.toInt('left') === 0;
                        break;
                    case 'inherit':
                        const position = this._element ? $css$4.getParentAttribute(this._element.parentElement, 'position') : '';
                        this._cached.positionStatic = position !== '' && !(position === 'absolute' || position === 'fixed');
                        break;
                    default:
                        this._cached.positionStatic = true;
                        break;
                }
            }
            return this._cached.positionStatic;
        }
        get positionRelative() {
            if (this._cached.positionRelative === undefined) {
                const value = this.position;
                this._cached.positionRelative = value === 'relative' || value === 'sticky';
            }
            return this._cached.positionRelative;
        }
        get positionAuto() {
            if (this._cached.positionAuto === undefined) {
                const styleMap = this._initial.iteration === -1 ? this._styleMap : this._initial.styleMap;
                this._cached.positionAuto = (!this.pageFlow &&
                    (styleMap.top === 'auto' || !styleMap.top) &&
                    (styleMap.right === 'auto' || !styleMap.right) &&
                    (styleMap.bottom === 'auto' || !styleMap.bottom) &&
                    (styleMap.left === 'auto' || !styleMap.left));
            }
            return this._cached.positionAuto;
        }
        get top() {
            if (this._cached.top === undefined) {
                this._cached.top = this.convertPosition('top');
            }
            return this._cached.top;
        }
        get right() {
            if (this._cached.right === undefined) {
                this._cached.right = this.convertPosition('right');
            }
            return this._cached.right;
        }
        get bottom() {
            if (this._cached.bottom === undefined) {
                this._cached.bottom = this.convertPosition('bottom');
            }
            return this._cached.bottom;
        }
        get left() {
            if (this._cached.left === undefined) {
                this._cached.left = this.convertPosition('left');
            }
            return this._cached.left;
        }
        get marginTop() {
            if (this._cached.marginTop === undefined) {
                this._cached.marginTop = this.inlineStatic && !this.baselineActive ? 0 : this.convertBox('margin', 'Top');
            }
            return this._cached.marginTop;
        }
        get marginRight() {
            if (this._cached.marginRight === undefined) {
                this._cached.marginRight = this.convertBox('margin', 'Right');
            }
            return this._cached.marginRight;
        }
        get marginBottom() {
            if (this._cached.marginBottom === undefined) {
                this._cached.marginBottom = this.inlineStatic && !this.baselineActive ? 0 : this.convertBox('margin', 'Bottom');
            }
            return this._cached.marginBottom;
        }
        get marginLeft() {
            if (this._cached.marginLeft === undefined) {
                this._cached.marginLeft = this.convertBox('margin', 'Left');
            }
            return this._cached.marginLeft;
        }
        get borderTopWidth() {
            if (this._cached.borderTopWidth === undefined) {
                this._cached.borderTopWidth = this.styleElement && this.css('borderTopStyle') !== 'none' ? $util$8.convertInt(this.css('borderTopWidth')) : 0;
            }
            return this._cached.borderTopWidth;
        }
        get borderRightWidth() {
            if (this._cached.borderRightWidth === undefined) {
                this._cached.borderRightWidth = this.styleElement && this.css('borderRightStyle') !== 'none' ? $util$8.convertInt(this.css('borderRightWidth')) : 0;
            }
            return this._cached.borderRightWidth;
        }
        get borderBottomWidth() {
            if (this._cached.borderBottomWidth === undefined) {
                this._cached.borderBottomWidth = this.styleElement && this.css('borderBottomStyle') !== 'none' ? $util$8.convertInt(this.css('borderBottomWidth')) : 0;
            }
            return this._cached.borderBottomWidth;
        }
        get borderLeftWidth() {
            if (this._cached.borderLeftWidth === undefined) {
                this._cached.borderLeftWidth = this.styleElement && this.css('borderLeftStyle') !== 'none' ? $util$8.convertInt(this.css('borderLeftWidth')) : 0;
            }
            return this._cached.borderLeftWidth;
        }
        get paddingTop() {
            if (this._cached.paddingTop === undefined) {
                let top = 0;
                for (const node of this.children) {
                    if (node.inline) {
                        top = Math.max(top, node.paddingTop);
                    }
                    else {
                        top = 0;
                        break;
                    }
                }
                this._cached.paddingTop = Math.max(0, this.convertBox('padding', 'Top') - top);
            }
            return this._cached.paddingTop;
        }
        get paddingRight() {
            if (this._cached.paddingRight === undefined) {
                this._cached.paddingRight = this.convertBox('padding', 'Right');
            }
            return this._cached.paddingRight;
        }
        get paddingBottom() {
            if (this._cached.paddingBottom === undefined) {
                let bottom = 0;
                for (const node of this.children) {
                    if (node.inline) {
                        bottom = Math.max(bottom, node.paddingBottom);
                    }
                    else {
                        bottom = 0;
                        break;
                    }
                }
                this._cached.paddingBottom = Math.max(0, this.convertBox('padding', 'Bottom') - bottom);
            }
            return this._cached.paddingBottom;
        }
        get paddingLeft() {
            if (this._cached.paddingLeft === undefined) {
                this._cached.paddingLeft = this.convertBox('padding', 'Left');
            }
            return this._cached.paddingLeft;
        }
        get contentBoxWidth() {
            return this.tableElement && this.css('borderCollapse') === 'collapse' ? 0 : this.borderLeftWidth + this.paddingLeft + this.paddingRight + this.borderRightWidth;
        }
        get contentBoxHeight() {
            return this.tableElement && this.css('borderCollapse') === 'collapse' ? 0 : this.borderTopWidth + this.paddingTop + this.paddingBottom + this.borderBottomWidth;
        }
        get inline() {
            if (this._cached.inline === undefined) {
                const value = this.display;
                this._cached.inline = value === 'inline' || (value === 'initial' || value === 'unset') && $element$2.ELEMENT_INLINE.includes(this.tagName);
            }
            return this._cached.inline;
        }
        get inlineStatic() {
            if (this._cached.inlineStatic === undefined) {
                this._cached.inlineStatic = this.inline && !this.floating && !this.imageElement;
            }
            return this._cached.inlineStatic;
        }
        get inlineVertical() {
            if (this._cached.inlineVertical === undefined) {
                const display = this.display;
                this._cached.inlineVertical = (display.startsWith('inline') || display === 'table-cell') && !this.floating && !this.plainText;
            }
            return this._cached.inlineVertical;
        }
        set inlineText(value) {
            this._cached.inlineText = value;
        }
        get inlineText() {
            if (this._cached.inlineText === undefined) {
                let value = false;
                if (this.htmlElement && !this.svgElement) {
                    const element = this._element;
                    switch (element.tagName) {
                        case 'INPUT':
                        case 'BUTTON':
                        case 'IMG':
                        case 'SELECT':
                        case 'TEXTAREA':
                        case 'HR':
                            break;
                        default:
                            if ($element$2.hasFreeFormText(element)) {
                                value = true;
                                for (let i = 0; i < element.children.length; i++) {
                                    const node = $dom$2.getElementAsNode(element.children[i]);
                                    if (!(node === undefined || node.excluded || node.dataset.target)) {
                                        value = false;
                                        break;
                                    }
                                }
                            }
                            else if (element.children.length === 0 && !element.textContent) {
                                value = true;
                            }
                            break;
                    }
                }
                this._cached.inlineText = value;
            }
            return this._cached.inlineText;
        }
        get block() {
            if (this._cached.block === undefined) {
                const value = this.display;
                this._cached.block = value === 'block' || value === 'list-item' || value === 'initial' && $element$2.ELEMENT_BLOCK.includes(this.tagName);
            }
            return this._cached.block;
        }
        get blockStatic() {
            if (this._cached.blockStatic === undefined) {
                this._cached.blockStatic = (this.block || this.gridElement || this.display === 'flex') && this.pageFlow && (!this.floating || this.cssInitial('width') === '100%');
            }
            return this._cached.blockStatic;
        }
        get blockDimension() {
            if (this._cached.blockDimension === undefined) {
                const display = this.display;
                this._cached.blockDimension = this.block || display === 'inline-block' || display === 'table-cell' || display === 'inline-flex';
            }
            return this._cached.blockDimension;
        }
        get pageFlow() {
            if (this._cached.pageFlow === undefined) {
                this._cached.pageFlow = this.positionStatic || this.positionRelative;
            }
            return this._cached.pageFlow;
        }
        get inlineFlow() {
            if (this._cached.inlineFlow === undefined) {
                const display = this.display;
                this._cached.inlineFlow = this.inline || display.startsWith('inline') || display === 'table-cell' || this.imageElement || this.floating;
            }
            return this._cached.inlineFlow;
        }
        get rightAligned() {
            if (this._cached.rightAligned === undefined) {
                this._cached.rightAligned = this.float === 'right' || this.autoMargin.left || !this.pageFlow && this.has('right');
            }
            return this._cached.rightAligned || this.hasAlign(512 /* RIGHT */);
        }
        get bottomAligned() {
            if (this._cached.bottomAligned === undefined) {
                this._cached.bottomAligned = !this.pageFlow && this.has('bottom') && this.bottom >= 0;
            }
            return this._cached.bottomAligned;
        }
        get autoMargin() {
            if (this._cached.autoMargin === undefined) {
                if (!this.pageFlow || this.blockStatic || this.display === 'table') {
                    const styleMap = this._initial.iteration === -1 ? this._styleMap : this._initial.styleMap;
                    const left = styleMap.marginLeft === 'auto' && (this.pageFlow || this.has('right'));
                    const right = styleMap.marginRight === 'auto' && (this.pageFlow || this.has('left'));
                    const top = styleMap.marginTop === 'auto' && (this.pageFlow || this.has('bottom'));
                    const bottom = styleMap.marginBottom === 'auto' && (this.pageFlow || this.has('top'));
                    this._cached.autoMargin = {
                        horizontal: left || right,
                        left: left && !right,
                        right: !left && right,
                        leftRight: left && right,
                        vertical: top || bottom,
                        top: top && !bottom,
                        bottom: !top && bottom,
                        topBottom: top && bottom
                    };
                }
                else {
                    this._cached.autoMargin = {
                        horizontal: false,
                        left: false,
                        right: false,
                        leftRight: false,
                        top: false,
                        bottom: false,
                        vertical: false,
                        topBottom: false
                    };
                }
            }
            return this._cached.autoMargin;
        }
        get floating() {
            if (this._cached.floating === undefined) {
                if (this.pageFlow) {
                    const value = this.css('cssFloat');
                    this._cached.floating = value === 'left' || value === 'right';
                }
                else {
                    this._cached.floating = false;
                }
            }
            return this._cached.floating;
        }
        get float() {
            if (this._cached.float === undefined) {
                this._cached.float = this.floating ? this.css('cssFloat') : 'none';
            }
            return this._cached.float;
        }
        get zIndex() {
            return this.toInt('zIndex');
        }
        get textContent() {
            if (this._cached.textContent === undefined) {
                const element = this._element;
                let value = '';
                if (this.htmlElement) {
                    value = element.textContent || element.innerText;
                }
                else if (this.plainText) {
                    value = element.textContent || '';
                }
                this._cached.textContent = value;
            }
            return this._cached.textContent;
        }
        set overflow(value) {
            if (value === 0 || value === 16 /* VERTICAL */ || value === 8 /* HORIZONTAL */ || value === (8 /* HORIZONTAL */ | 16 /* VERTICAL */)) {
                this._cached.overflow = value;
            }
        }
        get overflow() {
            if (this._cached.overflow === undefined) {
                const element = this._element;
                const overflow = this.css('overflow');
                const overflowX = this.css('overflowX');
                const overflowY = this.css('overflowY');
                let value = 0;
                if (this.hasWidth && (overflow === 'scroll' || overflowX === 'scroll' || overflowX === 'auto' && element && element.clientWidth !== element.scrollWidth)) {
                    value |= 8 /* HORIZONTAL */;
                }
                if (this.hasHeight && (overflow === 'scroll' || overflowY === 'scroll' || overflowY === 'auto' && element && element.clientHeight !== element.scrollHeight)) {
                    value |= 16 /* VERTICAL */;
                }
                this._cached.overflow = value;
            }
            return this._cached.overflow;
        }
        get overflowX() {
            return $util$8.hasBit(this.overflow, 8 /* HORIZONTAL */);
        }
        get overflowY() {
            return $util$8.hasBit(this.overflow, 16 /* VERTICAL */);
        }
        set baseline(value) {
            this._cached.baseline = value;
        }
        get baseline() {
            if (this._cached.baseline === undefined) {
                const value = this.verticalAlign;
                const initialValue = this.cssInitial('verticalAlign');
                this._cached.baseline = this.pageFlow && !this.floating && !this.svgElement && (value === 'baseline' || value === 'initial' || $util$8.isLength(initialValue) && parseInt(initialValue) === 0);
            }
            return this._cached.baseline;
        }
        get verticalAlign() {
            return this.css('verticalAlign');
        }
        set multiline(value) {
            this._cached.multiline = value;
        }
        get multiline() {
            if (this._cached.multiline === undefined) {
                this._cached.multiline = this.plainText || this.inlineText && (this.inlineFlow || this.length === 0) ? $dom$2.getRangeClientRect(this._element).multiline > 0 : false;
            }
            return this._cached.multiline;
        }
        get visibleStyle() {
            if (this._cached.visibleStyle === undefined) {
                const borderWidth = this.borderTopWidth > 0 || this.borderRightWidth > 0 || this.borderBottomWidth > 0 || this.borderLeftWidth > 0;
                const backgroundImage = $util$8.REGEXP_COMPILED.URL.test(this.css('backgroundImage')) || $util$8.REGEXP_COMPILED.URL.test(this.css('background'));
                const backgroundColor = this.has('backgroundColor');
                const backgroundRepeat = this.css('backgroundRepeat');
                const paddingHorizontal = this.paddingLeft + this.paddingRight > 0;
                const paddingVertical = this.paddingTop + this.paddingBottom > 0;
                this._cached.visibleStyle = {
                    padding: paddingHorizontal || paddingVertical,
                    paddingHorizontal,
                    paddingVertical,
                    background: borderWidth || backgroundImage || backgroundColor,
                    borderWidth,
                    backgroundImage,
                    backgroundColor,
                    backgroundRepeat: backgroundRepeat !== 'no-repeat',
                    backgroundRepeatX: backgroundRepeat === 'repeat' || backgroundRepeat === 'repeat-x' || backgroundRepeat.startsWith('repeat '),
                    backgroundRepeatY: backgroundRepeat === 'repeat' || backgroundRepeat === 'repeat-y' || backgroundRepeat.endsWith(' repeat')
                };
            }
            return this._cached.visibleStyle;
        }
        get preserveWhiteSpace() {
            if (this._cached.preserveWhiteSpace === undefined) {
                const value = this.css('whiteSpace');
                this._cached.preserveWhiteSpace = value === 'pre' || value === 'pre-wrap';
            }
            return this._cached.preserveWhiteSpace;
        }
        get layoutHorizontal() {
            return this.hasAlign(8 /* HORIZONTAL */);
        }
        get layoutVertical() {
            return this.hasAlign(16 /* VERTICAL */);
        }
        set controlName(value) {
            if (!this.rendered || this._controlName === undefined) {
                this._controlName = value;
            }
        }
        get controlName() {
            return this._controlName || '';
        }
        set documentParent(value) {
            this._documentParent = value;
        }
        get documentParent() {
            return this._documentParent || this.actualParent || this.parent || this;
        }
        get absoluteParent() {
            let current = this.actualParent;
            if (!this.pageFlow) {
                while (current && current.id !== 0) {
                    const position = current.cssInitial('position', false, true);
                    if (current.documentBody || position !== 'static' && position !== 'initial' && position !== 'unset') {
                        return current;
                    }
                    current = current.actualParent;
                }
            }
            return current;
        }
        get actualParent() {
            return this._element && this._element.parentElement ? $dom$2.getElementAsNode(this._element.parentElement) : undefined;
        }
        set actualChildren(value) {
            this._cached.actualChildren = value;
        }
        get actualChildren() {
            if (this._cached.actualChildren === undefined) {
                if (this.htmlElement && this.naturalElement) {
                    const actualChildren = [];
                    this._element.childNodes.forEach((element) => {
                        const node = $dom$2.getElementAsNode(element);
                        if (node && node.naturalElement) {
                            actualChildren.push(node);
                        }
                    });
                    this._cached.actualChildren = actualChildren;
                }
                else {
                    this._cached.actualChildren = this.groupParent ? this._initial.children : this.children;
                }
            }
            return this._cached.actualChildren;
        }
        get actualWidth() {
            return this.has('width', 2 /* LENGTH */) && this.display !== 'table-cell' ? this.toFloat('width') : this.bounds.width;
        }
        get actualHeight() {
            if (this.has('height', 2 /* LENGTH */) && this.display !== 'table-cell') {
                return this.toFloat('height');
            }
            return this.plainText ? this.bounds.bottom - this.bounds.top : this.bounds.height;
        }
        get actualDimension() {
            return { width: this.actualWidth, height: this.actualHeight };
        }
        get firstChild() {
            if (this.htmlElement && this.naturalElement && this.actualChildren.length) {
                return this.actualChildren[0];
            }
            else if (this.length) {
                return this.nodes[0];
            }
            return undefined;
        }
        get lastChild() {
            if (this.htmlElement && this.naturalElement && this.actualChildren.length) {
                return this.actualChildren[this.actualChildren.length - 1];
            }
            else if (this.length) {
                return this.nodes[this.nodes.length - 1];
            }
            return undefined;
        }
        get dir() {
            if (this._cached.dir === undefined) {
                this._cached.dir = this.css('direction');
                switch (this._cached.dir) {
                    case 'unset':
                    case 'inherit':
                        let parent = this.actualParent;
                        while (parent && parent.id !== 0) {
                            const value = parent.dir;
                            if (value !== '') {
                                this._cached.dir = value;
                                break;
                            }
                            parent = parent.actualParent;
                        }
                        this._cached.dir = document.body.dir;
                        break;
                }
            }
            return this._cached.dir;
        }
        get nodes() {
            return this.rendered ? this.renderChildren : this.children;
        }
        get center() {
            return {
                x: this.bounds.left + Math.floor(this.bounds.width / 2),
                y: this.bounds.top + Math.floor(this.actualHeight / 2)
            };
        }
    }

    class NodeGroup extends Node {
        init() {
            if (this.length) {
                let siblingIndex = Number.POSITIVE_INFINITY;
                for (const item of this.children) {
                    siblingIndex = Math.min(siblingIndex, item.siblingIndex);
                    item.parent = this;
                }
                if (this.siblingIndex === Number.POSITIVE_INFINITY) {
                    this.siblingIndex = siblingIndex;
                }
                if (this.parent) {
                    this.parent.sort(NodeList.siblingIndex);
                }
                this.setBounds();
                this.saveAsInitial();
                const actualParent = this.actualParent;
                if (actualParent) {
                    this.css('direction', actualParent.dir);
                }
            }
        }
        setBounds() {
            if (this.length) {
                const bounds = NodeList.outerRegion(this);
                this._bounds = Object.assign({}, bounds, { width: bounds.right - bounds.left, height: bounds.bottom - bounds.top });
            }
        }
        previousSiblings(lineBreak = true, excluded = true, height = false) {
            const node = this.item(0);
            return node ? node.previousSiblings(lineBreak, excluded, height) : [];
        }
        nextSiblings(lineBreak = true, excluded = true, height = false) {
            const node = this.item();
            return node ? node.nextSiblings(lineBreak, excluded, height) : [];
        }
        get actualParent() {
            return NodeList.actualParent(this._initial.children);
        }
        get firstChild() {
            const actualParent = this.actualParent;
            if (actualParent) {
                const nodes = this.nodes;
                for (const node of actualParent.actualChildren) {
                    if (nodes.includes(node)) {
                        return node;
                    }
                }
            }
            if (this._initial.children.length) {
                return this._initial.children[0];
            }
            return undefined;
        }
        get lastChild() {
            const actualParent = this.actualParent;
            if (actualParent) {
                const nodes = this.nodes;
                const children = actualParent.actualChildren;
                for (let i = children.length - 1; i >= 0; i--) {
                    const node = children[i];
                    if (nodes.includes(node)) {
                        return node;
                    }
                }
            }
            if (this._initial.children.length) {
                return this._initial.children[this._initial.children.length - 1];
            }
            return undefined;
        }
        get inline() {
            return this.every(node => node.inline);
        }
        get pageFlow() {
            return this.every(node => node.pageFlow);
        }
        get inlineFlow() {
            return this.inlineStatic || this.hasAlign(128 /* SEGMENTED */);
        }
        get inlineStatic() {
            return this.every(node => node.inlineStatic);
        }
        get inlineVertical() {
            return this.every(node => node.inlineVertical);
        }
        get block() {
            return this.some(node => node.block);
        }
        get blockStatic() {
            return this.some(node => node.blockStatic);
        }
        get blockDimension() {
            return this.some(node => node.blockDimension);
        }
        get floating() {
            return this.every(node => node.floating);
        }
        get float() {
            if (this.floating) {
                return this.hasAlign(512 /* RIGHT */) ? 'right' : 'left';
            }
            return 'none';
        }
        get baseline() {
            const value = this.cssInitial('verticalAlign', true);
            return value !== '' ? value === 'baseline' : this.every(node => node.baseline);
        }
        get multiline() {
            return this.some(node => node.multiline);
        }
        get display() {
            return (this.css('display') ||
                this.some(node => node.block) ? 'block' : (this.some(node => node.blockDimension || node.inlineVertical) ? 'inline-block' : 'inline'));
        }
        get groupParent() {
            return true;
        }
    }

    const $dom$3 = squared.lib.dom;
    const $util$9 = squared.lib.util;
    class Accessibility extends Extension {
        afterInit() {
            for (const node of this.application.processing.cache) {
                if (node.hasProcedure(NODE_PROCEDURE.ACCESSIBILITY)) {
                    const element = node.element;
                    switch (element.tagName) {
                        case 'INPUT':
                            switch (element.type) {
                                case 'image':
                                    node.extracted = [node];
                                    break;
                                case 'radio':
                                case 'checkbox':
                                    [$dom$3.getNextElementSibling(element), $dom$3.getPreviousElementSibling(element)].some((sibling) => {
                                        if (sibling) {
                                            const label = $dom$3.getElementAsNode(sibling);
                                            const labelParent = sibling.parentElement && sibling.parentElement.tagName === 'LABEL' ? $dom$3.getElementAsNode(sibling.parentElement) : undefined;
                                            if (label && label.visible && label.pageFlow) {
                                                if ($util$9.hasValue(sibling.htmlFor) && sibling.htmlFor === element.id) {
                                                    node.companion = label;
                                                }
                                                else if (label.textElement && labelParent) {
                                                    node.companion = label;
                                                    labelParent.renderAs = node;
                                                }
                                                else if (label.plainText) {
                                                    node.companion = label;
                                                }
                                                if (node.companion) {
                                                    if (!this.options.showLabel) {
                                                        label.hide();
                                                    }
                                                    return true;
                                                }
                                            }
                                        }
                                        return false;
                                    });
                                    break;
                            }
                            break;
                        case 'BUTTON':
                            if (node.length) {
                                const extracted = node.filter(item => !item.textElement);
                                if (extracted.length) {
                                    node.extracted = extracted;
                                }
                                node.clear();
                            }
                            break;
                    }
                }
            }
        }
    }

    const $util$a = squared.lib.util;
    const STRING_UNIT = '[\\d.]+[a-z%]+|auto|max-content|min-content';
    const STRING_MINMAX = 'minmax\\(([^,]+), ([^)]+)\\)';
    const STRING_FIT_CONTENT = 'fit-content\\(([\\d.]+[a-z%]+)\\)';
    const STRING_NAMED = '\\[([\\w\\-\\s]+)\\]';
    const REGEXP_GRID = {
        UNIT: new RegExp(`^(${STRING_UNIT})$`),
        NAMED: `\\s*(repeat\\((auto-fit|auto-fill|[0-9]+), (.+)\\)|${STRING_NAMED}|${STRING_MINMAX}|${STRING_FIT_CONTENT}|${STRING_UNIT})\\s*`,
        REPEAT: `\\s*(${STRING_NAMED}|${STRING_MINMAX}|${STRING_FIT_CONTENT}|${STRING_UNIT})\\s*`
    };
    function repeatUnit(data, dimension) {
        const unitPX = [];
        const unitRepeat = [];
        for (let i = 0; i < dimension.length; i++) {
            if (data.repeat[i]) {
                unitRepeat.push(dimension[i]);
            }
            else {
                unitPX.push(dimension[i]);
            }
        }
        const repeatTotal = data.count - unitPX.length;
        const result = [];
        for (let i = 0; i < data.count; i++) {
            if (data.repeat[i]) {
                for (let j = 0, k = 0; j < repeatTotal; i++, j++, k++) {
                    if (k === unitRepeat.length) {
                        k = 0;
                    }
                    result[i] = unitRepeat[k];
                }
                break;
            }
            else if (unitPX.length) {
                result[i] = unitPX.shift();
            }
        }
        return result;
    }
    function convertLength(node, value) {
        return $util$a.isLength(value) ? node.convertPX(value) : value;
    }
    function getColumnTotal(rows) {
        let value = 0;
        for (const row of rows) {
            if (row) {
                value++;
            }
        }
        return value;
    }
    class CssGrid extends Extension {
        static createDataAttribute() {
            return {
                children: new Set(),
                rowData: [],
                templateAreas: {},
                row: CssGrid.createDataRowAttribute(),
                column: CssGrid.createDataRowAttribute(),
                emptyRows: [],
                alignItems: '',
                alignContent: '',
                justifyItems: '',
                justifyContent: ''
            };
        }
        static createDataRowAttribute() {
            return {
                count: 0,
                gap: 0,
                unit: [],
                unitMin: [],
                repeat: [],
                auto: [],
                autoFill: false,
                autoFit: false,
                name: {},
                normal: true
            };
        }
        condition(node) {
            return node.gridElement && node.length > 0;
        }
        processNode(node) {
            const mainData = Object.assign({}, CssGrid.createDataAttribute(), { alignItems: node.css('alignItems'), alignContent: node.css('alignContent'), justifyItems: node.css('justifyItems'), justifyContent: node.css('justifyContent') });
            const gridAutoFlow = node.css('gridAutoFlow');
            const horizontal = gridAutoFlow.indexOf('row') !== -1;
            const dense = gridAutoFlow.indexOf('dense') !== -1;
            const rowData = [];
            const cellsPerRow = [];
            const gridPosition = [];
            let rowInvalid = {};
            mainData.row.gap = node.parseUnit(node.css('rowGap'), false, false);
            mainData.column.gap = node.parseUnit(node.css('columnGap'), true, false);
            function setDataRows(item, placement) {
                if (placement.every(value => value > 0)) {
                    for (let i = placement[horizontal ? 0 : 1] - 1; i < placement[horizontal ? 2 : 3] - 1; i++) {
                        if (rowData[i] === undefined) {
                            rowData[i] = [];
                        }
                        for (let j = placement[horizontal ? 1 : 0] - 1; j < placement[horizontal ? 3 : 2] - 1; j++) {
                            if (cellsPerRow[i] === undefined) {
                                cellsPerRow[i] = 0;
                            }
                            if (rowData[i][j] === undefined) {
                                rowData[i][j] = [];
                                cellsPerRow[i]++;
                            }
                            rowData[i][j].push(item);
                        }
                    }
                    return true;
                }
                return false;
            }
            [node.cssInitial('gridTemplateRows', true), node.cssInitial('gridTemplateColumns', true), node.css('gridAutoRows'), node.css('gridAutoColumns')].forEach((value, index) => {
                if (value && value !== 'none' && value !== 'auto') {
                    const patternA = new RegExp(REGEXP_GRID.NAMED, 'g');
                    let matchA;
                    let i = 1;
                    while ((matchA = patternA.exec(value)) !== null) {
                        if (index < 2) {
                            const data = mainData[index === 0 ? 'row' : 'column'];
                            if (matchA[1].startsWith('repeat')) {
                                let iterations = 1;
                                switch (matchA[2]) {
                                    case 'auto-fit':
                                        data.autoFit = true;
                                        break;
                                    case 'auto-fill':
                                        data.autoFill = true;
                                        break;
                                    default:
                                        iterations = $util$a.convertInt(matchA[3]);
                                        break;
                                }
                                if (iterations > 0) {
                                    const repeating = [];
                                    const patternB = new RegExp(REGEXP_GRID.REPEAT, 'g');
                                    let matchB;
                                    while ((matchB = patternB.exec(matchA[3])) !== null) {
                                        let matchC;
                                        if ((matchC = new RegExp(STRING_NAMED).exec(matchB[1])) !== null) {
                                            if (data.name[matchC[1]] === undefined) {
                                                data.name[matchC[1]] = [];
                                            }
                                            repeating.push({ name: matchC[1] });
                                        }
                                        else if ((matchC = new RegExp(STRING_MINMAX).exec(matchB[1])) !== null) {
                                            repeating.push({ unit: convertLength(node, matchC[2]), unitMin: convertLength(node, matchC[1]) });
                                        }
                                        else if ((matchC = new RegExp(STRING_FIT_CONTENT).exec(matchB[1])) !== null) {
                                            repeating.push({ unit: convertLength(node, matchC[1]), unitMin: '0px' });
                                        }
                                        else if ((matchC = new RegExp(STRING_UNIT).exec(matchB[1])) !== null) {
                                            repeating.push({ unit: convertLength(node, matchC[0]) });
                                        }
                                    }
                                    if (repeating.length) {
                                        for (let j = 0; j < iterations; j++) {
                                            for (const item of repeating) {
                                                if (item.name) {
                                                    data.name[item.name].push(i);
                                                }
                                                else if (item.unit) {
                                                    data.unit.push(item.unit);
                                                    data.unitMin.push(item.unitMin || '');
                                                    data.repeat.push(true);
                                                    i++;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            else if (matchA[1].charAt(0) === '[') {
                                if (data.name[matchA[4]] === undefined) {
                                    data.name[matchA[4]] = [];
                                }
                                data.name[matchA[4]].push(i);
                            }
                            else if (matchA[1].startsWith('minmax')) {
                                data.unit.push(convertLength(node, matchA[6]));
                                data.unitMin.push(convertLength(node, matchA[5]));
                                data.repeat.push(false);
                                i++;
                            }
                            else if (matchA[1].startsWith('fit-content')) {
                                data.unit.push(convertLength(node, matchA[7]));
                                data.unitMin.push('0px');
                                data.repeat.push(false);
                                i++;
                            }
                            else if (REGEXP_GRID.UNIT.test(matchA[1])) {
                                data.unit.push(convertLength(node, matchA[1]));
                                data.unitMin.push('');
                                data.repeat.push(false);
                                i++;
                            }
                        }
                        else {
                            mainData[index === 2 ? 'row' : 'column'].auto.push(node.convertPX(matchA[1]));
                        }
                    }
                }
            });
            node.cssSort('order');
            if (!node.has('gridTemplateAreas') && node.every(item => item.css('gridRowStart') === 'auto' && item.css('gridColumnStart') === 'auto')) {
                const direction = horizontal ? ['top', 'bottom'] : ['left', 'right'];
                let row = 0;
                let column = 0;
                let previous;
                let columnMax = 0;
                node.each((item, index) => {
                    if (previous === undefined || item.linear[direction[0]] >= previous.linear[direction[1]] || column > 0 && column === columnMax) {
                        columnMax = Math.max(column, columnMax);
                        row++;
                        column = 1;
                    }
                    const rowEnd = item.css('gridRowEnd');
                    const columnEnd = item.css('gridColumnEnd');
                    let rowSpan = 1;
                    let columnSpan = 1;
                    if (rowEnd.startsWith('span')) {
                        rowSpan = parseInt(rowEnd.split(' ')[1]);
                    }
                    else if ($util$a.isNumber(rowEnd)) {
                        rowSpan = parseInt(rowEnd) - row;
                    }
                    if (columnEnd.startsWith('span')) {
                        columnSpan = parseInt(columnEnd.split(' ')[1]);
                    }
                    else if ($util$a.isNumber(columnEnd)) {
                        columnSpan = parseInt(columnEnd) - column;
                    }
                    if (column === 1 && columnMax > 0) {
                        const startIndex = horizontal ? [2, 1, 3] : [3, 0, 2];
                        let valid = false;
                        do {
                            const available = new Array(columnMax - 1).fill(1);
                            for (const position of gridPosition) {
                                const placement = position.placement;
                                if (placement[startIndex[0]] > row) {
                                    for (let i = placement[startIndex[1]]; i < placement[startIndex[2]]; i++) {
                                        available[i - 1] = 0;
                                    }
                                }
                            }
                            for (let i = 0, j = 0, k = 0; i < available.length; i++) {
                                if (available[i]) {
                                    if (j === 0) {
                                        k = i;
                                    }
                                    if (++j === columnSpan) {
                                        column = k + 1;
                                        valid = true;
                                        break;
                                    }
                                }
                                else {
                                    j = 0;
                                }
                            }
                            if (!valid) {
                                mainData.emptyRows[row - 1] = available;
                                row++;
                            }
                        } while (!valid);
                    }
                    gridPosition[index] = {
                        placement: horizontal ? [row, column, row + rowSpan, column + columnSpan] : [column, row, column + columnSpan, row + rowSpan],
                        rowSpan,
                        columnSpan
                    };
                    column += columnSpan;
                    previous = item;
                });
            }
            else {
                node.css('gridTemplateAreas').split(/"[\s\n]+"/).forEach((template, i) => {
                    $util$a.trimString(template.trim(), '"').split(' ').forEach((area, j) => {
                        if (area !== '.') {
                            if (mainData.templateAreas[area] === undefined) {
                                mainData.templateAreas[area] = {
                                    rowStart: i,
                                    rowSpan: 1,
                                    columnStart: j,
                                    columnSpan: 1
                                };
                            }
                            else {
                                mainData.templateAreas[area].rowSpan = (i - mainData.templateAreas[area].rowStart) + 1;
                                mainData.templateAreas[area].columnSpan++;
                            }
                        }
                    });
                });
                node.each((item, index) => {
                    const positions = [
                        item.css('gridRowStart'),
                        item.css('gridColumnStart'),
                        item.css('gridRowEnd'),
                        item.css('gridColumnEnd')
                    ];
                    const placement = [];
                    let rowSpan = 1;
                    let columnSpan = 1;
                    for (let i = 0; i < positions.length; i++) {
                        const value = positions[i];
                        let template = mainData.templateAreas[value];
                        if (template) {
                            switch (i) {
                                case 0:
                                    placement[i] = template.rowStart + 1;
                                    break;
                                case 1:
                                    placement[i] = template.columnStart + 1;
                                    break;
                                case 2:
                                    placement[i] = template.rowStart + template.rowSpan + 1;
                                    break;
                                case 3:
                                    placement[i] = template.columnStart + template.columnSpan + 1;
                                    break;
                            }
                        }
                        else {
                            const match = /^([\w\-]+)-(start|end)$/.exec(value);
                            if (match) {
                                template = mainData.templateAreas[match[1]];
                                if (template) {
                                    if (match[2] === 'start') {
                                        switch (i) {
                                            case 0:
                                            case 2:
                                                placement[i] = template.rowStart + 1;
                                                break;
                                            case 1:
                                            case 3:
                                                placement[i] = template.columnStart + 1;
                                                break;
                                        }
                                    }
                                    else {
                                        switch (i) {
                                            case 0:
                                            case 2:
                                                placement[i] = template.rowStart + template.rowSpan + 1;
                                                break;
                                            case 1:
                                            case 3:
                                                placement[i] = template.columnStart + template.columnSpan + 1;
                                                break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (!placement[0] || !placement[1] || !placement[2] || !placement[3]) {
                        function setPlacement(value, position) {
                            if ($util$a.isNumber(value)) {
                                placement[position] = parseInt(value);
                                return true;
                            }
                            else if (value.startsWith('span')) {
                                const span = parseInt(value.split(' ')[1]);
                                if (!placement[position - 2]) {
                                    if (position % 2 === 0) {
                                        rowSpan = span;
                                    }
                                    else {
                                        columnSpan = span;
                                    }
                                }
                                else {
                                    placement[position] = placement[position - 2] + span;
                                }
                                return true;
                            }
                            return false;
                        }
                        for (let i = 0; i < positions.length; i++) {
                            const value = positions[i];
                            if (value !== 'auto' && !placement[i] && !setPlacement(value, i)) {
                                const data = mainData[i % 2 === 0 ? 'row' : 'column'];
                                const alias = value.split(' ');
                                if (alias.length === 1) {
                                    alias[1] = alias[0];
                                    alias[0] = '1';
                                }
                                const nameIndex = parseInt(alias[0]);
                                if (data.name[alias[1]]) {
                                    const nameLength = data.name[alias[1]].length;
                                    if (nameIndex <= nameLength) {
                                        placement[i] = data.name[alias[1]][nameIndex - 1] + (alias[1] === positions[i - 2] ? 1 : 0);
                                    }
                                    else if (data.autoFill && nameIndex > nameLength) {
                                        placement[i] = nameIndex + (alias[1] === positions[i - 2] ? 1 : 0);
                                    }
                                }
                            }
                            if (!placement[i]) {
                                setPlacement(value, i);
                            }
                        }
                    }
                    gridPosition[index] = {
                        placement,
                        rowSpan,
                        columnSpan
                    };
                });
            }
            {
                const data = mainData[horizontal ? 'column' : 'row'];
                data.count = Math.max(data.unit.length, 1);
                for (let i = 0; i < gridPosition.length; i++) {
                    const item = gridPosition[i];
                    if (item) {
                        data.count = Math.max(data.count, horizontal ? item.columnSpan : item.rowSpan, item.placement[horizontal ? 1 : 0] || 0, (item.placement[horizontal ? 3 : 2] || 0) - 1);
                    }
                }
                if (data.autoFill || data.autoFit) {
                    if (data.unit.length === 0) {
                        data.unit.push('auto');
                        data.unitMin.push('');
                        data.repeat.push(true);
                    }
                    data.unit = repeatUnit(data, data.unit);
                    data.unitMin = repeatUnit(data, data.unitMin);
                }
            }
            node.each((item, index) => {
                const position = gridPosition[index];
                const placement = position.placement;
                const ROW_SPAN = horizontal ? position.rowSpan : position.columnSpan;
                const COLUMN_SPAN = horizontal ? position.columnSpan : position.rowSpan;
                const COLUMN_COUNT = horizontal ? mainData.column.count : mainData.row.count;
                const rowA = horizontal ? 0 : 1;
                const colA = horizontal ? 1 : 0;
                const rowB = horizontal ? 2 : 3;
                const colB = horizontal ? 3 : 2;
                while (!placement[0] || !placement[1]) {
                    const PLACEMENT = placement.slice(0);
                    if (!PLACEMENT[rowA]) {
                        let l = rowData.length;
                        for (let i = 0, j = 0, k = -1; i < l; i++) {
                            if (!rowInvalid[i]) {
                                if (cellsPerRow[i] === undefined || cellsPerRow[i] < COLUMN_COUNT) {
                                    if (j === 0) {
                                        k = i;
                                        l = Math.max(l, i + ROW_SPAN);
                                    }
                                    if (++j === ROW_SPAN) {
                                        PLACEMENT[rowA] = k + 1;
                                        break;
                                    }
                                }
                                else {
                                    j = 0;
                                    k = -1;
                                    l = rowData.length;
                                }
                            }
                        }
                    }
                    if (!PLACEMENT[rowA]) {
                        placement[rowA] = rowData.length + 1;
                        if (!placement[colA]) {
                            placement[colA] = 1;
                        }
                    }
                    else if (!PLACEMENT[colA]) {
                        if (!PLACEMENT[rowB]) {
                            PLACEMENT[rowB] = PLACEMENT[rowA] + ROW_SPAN;
                        }
                        const available = [];
                        for (let i = PLACEMENT[rowA] - 1; i < PLACEMENT[rowB] - 1; i++) {
                            if (rowData[i] === undefined) {
                                available.push([[0, -1]]);
                            }
                            else if (getColumnTotal(rowData[i]) + COLUMN_SPAN <= COLUMN_COUNT) {
                                const range = [];
                                let span = 0;
                                for (let j = 0, k = -1; j < COLUMN_COUNT; j++) {
                                    if (rowData[i][j] === undefined) {
                                        if (k === -1) {
                                            k = j;
                                        }
                                        span++;
                                    }
                                    if (rowData[i][j] || j === COLUMN_COUNT - 1) {
                                        if (span >= COLUMN_SPAN) {
                                            range.push([k, k + span]);
                                        }
                                        k = -1;
                                        span = 0;
                                    }
                                }
                                if (range.length) {
                                    available.push(range);
                                }
                                else {
                                    break;
                                }
                            }
                            else {
                                break;
                            }
                        }
                        if (COLUMN_SPAN === available.length) {
                            if (available.length > 1) {
                                gapNested: {
                                    for (const outside of available[0]) {
                                        for (let i = outside[0]; i < outside[1]; i++) {
                                            for (let j = 1; j < available.length; j++) {
                                                for (let k = 0; k < available[j].length; k++) {
                                                    const inside = available[j][k];
                                                    if (i >= inside[0] && (inside[1] === -1 || i + COLUMN_SPAN <= inside[1])) {
                                                        PLACEMENT[colA] = i + 1;
                                                        break gapNested;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                PLACEMENT[colA] = available[0][0][0] + 1;
                            }
                        }
                    }
                    if (PLACEMENT[rowA] && PLACEMENT[colA]) {
                        placement[rowA] = PLACEMENT[rowA];
                        placement[colA] = PLACEMENT[colA];
                    }
                    else if (PLACEMENT[rowA]) {
                        rowInvalid[PLACEMENT[rowA] - 1] = true;
                    }
                }
                if (!placement[rowB]) {
                    placement[rowB] = placement[rowA] + ROW_SPAN;
                }
                if (!placement[colB]) {
                    placement[colB] = placement[colA] + COLUMN_SPAN;
                }
                if (setDataRows(item, placement)) {
                    item.data(EXT_NAME.CSS_GRID, 'cellData', {
                        rowStart: placement[0] - 1,
                        rowSpan: placement[2] - placement[0],
                        columnStart: placement[1] - 1,
                        columnSpan: placement[3] - placement[1]
                    });
                    if (dense) {
                        rowInvalid = {};
                    }
                }
            });
            if (horizontal) {
                mainData.rowData = rowData;
            }
            else {
                for (let i = 0; i < rowData.length; i++) {
                    for (let j = 0; j < rowData[i].length; j++) {
                        if (mainData.rowData[j] === undefined) {
                            mainData.rowData[j] = [];
                        }
                        mainData.rowData[j][i] = rowData[i][j];
                    }
                }
            }
            if (mainData.rowData.length) {
                for (const row of mainData.rowData) {
                    mainData.column.count = Math.max(row.length, mainData.column.count);
                    for (const column of row) {
                        if (column) {
                            for (const item of column) {
                                item.positioned = true;
                                mainData.children.add(item);
                            }
                        }
                    }
                }
                if (mainData.children.size === node.length) {
                    mainData.row.count = mainData.rowData.length;
                    const modified = new Set();
                    for (let i = 0; i < mainData.row.count; i++) {
                        for (let j = 0; j < mainData.column.count; j++) {
                            const column = mainData.rowData[i][j];
                            if (column) {
                                for (const item of column) {
                                    if (!modified.has(item)) {
                                        const cellData = item.data(EXT_NAME.CSS_GRID, 'cellData');
                                        const x = j + (cellData ? cellData.columnSpan - 1 : 0);
                                        const y = i + (cellData ? cellData.rowSpan - 1 : 0);
                                        if (x < mainData.column.count - 1) {
                                            item.modifyBox(4 /* MARGIN_RIGHT */, mainData.column.gap);
                                        }
                                        if (y < mainData.row.count - 1) {
                                            item.modifyBox(8 /* MARGIN_BOTTOM */, mainData.row.gap);
                                        }
                                        modified.add(item);
                                    }
                                }
                            }
                        }
                    }
                    node.retain(Array.from(mainData.children));
                    node.cssSort('zIndex');
                    node.data(EXT_NAME.CSS_GRID, 'mainData', mainData);
                }
            }
            return undefined;
        }
    }

    const $util$b = squared.lib.util;
    class Flexbox extends Extension {
        static createDataAttribute(node, children) {
            const flex = node.flexbox;
            return {
                wrap: flex.wrap.startsWith('wrap'),
                wrapReverse: flex.wrap === 'wrap-reverse',
                directionReverse: flex.direction.endsWith('reverse'),
                justifyContent: flex.justifyContent,
                rowDirection: flex.direction.startsWith('row'),
                rowCount: 0,
                columnDirection: flex.direction.startsWith('column'),
                columnCount: 0,
                children
            };
        }
        condition(node) {
            return node.flexElement && node.length > 0;
        }
        processNode(node) {
            const controller = this.application.controllerHandler;
            const children = node.filter(item => item.pageFlow);
            const mainData = Flexbox.createDataAttribute(node, children);
            if (node.cssTry('display', 'block')) {
                for (const item of children) {
                    if (item.element) {
                        const bounds = item.element.getBoundingClientRect();
                        const initial = item.unsafe('initial');
                        Object.assign(initial.bounds, { width: bounds.width, height: bounds.height });
                    }
                }
                node.cssFinally('display');
            }
            if (mainData.wrap) {
                function setDirection(align, sort, size) {
                    const map = new Map();
                    children.sort((a, b) => {
                        if (!$util$b.withinRange(a.linear[align], b.linear[align])) {
                            return a.linear[align] >= b.linear[align] ? 1 : -1;
                        }
                        return a.linear[sort] >= b.linear[sort] ? 1 : -1;
                    });
                    for (const item of children) {
                        const point = Math.round(item.linear[align]);
                        const items = map.get(point) || [];
                        items.push(item);
                        map.set(point, items);
                    }
                    let maxCount = 0;
                    let i = 0;
                    node.clear();
                    for (const seg of map.values()) {
                        const group = controller.createNodeGroup(seg[0], seg, node);
                        group.siblingIndex = i++;
                        const box = group.unsafe('box');
                        if (box) {
                            box[size] = node.box[size];
                        }
                        group.alignmentType |= 128 /* SEGMENTED */;
                        maxCount = Math.max(seg.length, maxCount);
                    }
                    node.sort(NodeList.siblingIndex);
                    if (mainData.rowDirection) {
                        mainData.rowCount = map.size;
                        mainData.columnCount = maxCount;
                    }
                    else {
                        mainData.rowCount = maxCount;
                        mainData.columnCount = map.size;
                    }
                }
                if (mainData.rowDirection) {
                    setDirection(mainData.wrapReverse ? 'bottom' : 'top', 'left', 'right');
                }
                else {
                    setDirection('left', 'top', 'bottom');
                }
            }
            else {
                if (children.some(item => item.flexbox.order !== 0)) {
                    if (mainData.directionReverse) {
                        node.sort((a, b) => a.flexbox.order <= b.flexbox.order ? 1 : -1);
                    }
                    else {
                        node.sort((a, b) => a.flexbox.order >= b.flexbox.order ? 1 : -1);
                    }
                }
                if (mainData.rowDirection) {
                    mainData.rowCount = 1;
                    mainData.columnCount = node.length;
                }
                else {
                    mainData.rowCount = node.length;
                    mainData.columnCount = 1;
                }
            }
            node.data(EXT_NAME.FLEXBOX, 'mainData', mainData);
            return undefined;
        }
    }

    const $css$5 = squared.lib.css;
    const $dom$4 = squared.lib.dom;
    class External extends Extension {
        beforeInit(element, internal = false) {
            if (internal || this.included(element)) {
                if (!$dom$4.getElementCache(element, 'squaredExternalDisplay')) {
                    const display = [];
                    let current = element;
                    while (current) {
                        display.push($css$5.getStyle(current).display);
                        current.style.display = 'block';
                        current = current.parentElement;
                    }
                    $dom$4.setElementCache(element, 'squaredExternalDisplay', display);
                }
            }
        }
        init(element) {
            if (this.included(element)) {
                this.application.parseElements.add(element);
            }
            return false;
        }
        afterInit(element, internal = false) {
            if (internal || this.included(element)) {
                const data = $dom$4.getElementCache(element, 'squaredExternalDisplay');
                if (data) {
                    const display = data;
                    let current = element;
                    let i = 0;
                    while (current) {
                        current.style.display = display[i];
                        current = current.parentElement;
                        i++;
                    }
                    $dom$4.deleteElementCache(element, 'squaredExternalDisplay');
                }
            }
        }
    }

    const $util$c = squared.lib.util;
    function getRowIndex(columns, target) {
        for (const column of columns) {
            const index = column.findIndex(item => $util$c.withinRange(target.linear.top, item.linear.top) || target.linear.top > item.linear.top && target.linear.top < item.linear.bottom);
            if (index !== -1) {
                return index;
            }
        }
        return -1;
    }
    class Grid extends Extension {
        constructor() {
            super(...arguments);
            this.options = {
                columnBalanceEqual: false
            };
        }
        static createDataAttribute() {
            return {
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                columnCount: 0
            };
        }
        static createDataCellAttribute() {
            return {
                rowSpan: 0,
                columnSpan: 0,
                index: -1,
                cellStart: false,
                cellEnd: false,
                rowEnd: false,
                rowStart: false,
                siblings: []
            };
        }
        condition(node) {
            if (node.length > 1 && !node.flexElement && !node.gridElement && !node.has('listStyle')) {
                if (node.display === 'table') {
                    return node.every(item => item.display === 'table-row' && item.every(child => child.display === 'table-cell'));
                }
                else {
                    let multipleLength = 0;
                    let listItemCount = 0;
                    for (const item of node) {
                        if (item.pageFlow && !item.visibleStyle.background && item.blockStatic) {
                            if (item.length > 1) {
                                multipleLength++;
                            }
                            if (item.display === 'list-item' && !item.has('listStyleType')) {
                                listItemCount++;
                            }
                        }
                        else {
                            return false;
                        }
                    }
                    if (listItemCount === node.length) {
                        return true;
                    }
                    else if (multipleLength > 0) {
                        return node.every(item => item.length > 0 && NodeList.linearData(item.children).linearX);
                    }
                }
            }
            return false;
        }
        processNode(node) {
            const columnEnd = [];
            const columnBalance = this.options.columnBalanceEqual;
            const columns = [];
            if (columnBalance) {
                const dimensions = [];
                node.each((item, index) => {
                    dimensions[index] = [];
                    item.each(child => dimensions[index].push(child.actualWidth));
                    columns.push(item.duplicate());
                });
                const base = columns[dimensions.findIndex(item => {
                    const column = dimensions.reduce((a, b) => {
                        if (a.length === b.length) {
                            const sumA = a.reduce((c, d) => c + d, 0);
                            const sumB = b.reduce((c, d) => c + d, 0);
                            return sumA < sumB ? a : b;
                        }
                        else {
                            return a.length < b.length ? a : b;
                        }
                    });
                    return item === column;
                })];
                if (base && base.length > 1) {
                    let maxIndex = -1;
                    let assigned = [];
                    let every = false;
                    for (let l = 0; l < base.length; l++) {
                        const bounds = base[l].bounds;
                        const found = [];
                        if (l < base.length - 1) {
                            for (let m = 0; m < columns.length; m++) {
                                if (columns[m] === base) {
                                    found.push(l);
                                }
                                else {
                                    const result = columns[m].findIndex((item, index) => index >= l && Math.floor(item.bounds.width) === Math.floor(bounds.width) && index < columns[m].length - 1);
                                    if (result !== -1) {
                                        found.push(result);
                                    }
                                    else {
                                        found.length = 0;
                                        break;
                                    }
                                }
                            }
                        }
                        else {
                            for (let m = 0; m < columns.length; m++) {
                                if (columns[m].length > base.length) {
                                    const siblings = columns[m].splice(assigned[m] + (every ? 2 : 1), columns[m].length - base.length);
                                    columns[m][assigned[m] + (every ? 1 : 0)].data(EXT_NAME.GRID, 'cellData', { siblings });
                                }
                            }
                        }
                        if (found.length === columns.length) {
                            const minIndex = found.reduce((a, b) => Math.min(a, b));
                            maxIndex = found.reduce((a, b) => Math.max(a, b));
                            if (maxIndex > minIndex) {
                                for (let m = 0; m < columns.length; m++) {
                                    if (found[m] > minIndex) {
                                        const siblings = columns[m].splice(minIndex, found[m] - minIndex);
                                        columns[m][assigned[m] + (every ? 1 : 0)].data(EXT_NAME.GRID, 'cellData', { siblings });
                                    }
                                }
                            }
                            assigned = found;
                            every = true;
                        }
                        else {
                            assigned = new Array(columns.length).fill(l);
                            every = false;
                        }
                    }
                }
                else {
                    columns.length = 0;
                }
            }
            else {
                const nextMapX = {};
                for (const item of node) {
                    for (const subitem of item) {
                        const x = Math.floor(subitem.linear.left);
                        if (nextMapX[x] === undefined) {
                            nextMapX[x] = [];
                        }
                        nextMapX[x].push(subitem);
                    }
                }
                const nextCoordsX = Object.keys(nextMapX);
                if (nextCoordsX.length) {
                    const columnRight = [];
                    for (let i = 0; i < nextCoordsX.length; i++) {
                        const nextAxisX = nextMapX[nextCoordsX[i]];
                        if (i === 0 && nextAxisX.length === 0) {
                            return undefined;
                        }
                        columnRight[i] = i === 0 ? 0 : columnRight[i - 1];
                        for (let j = 0; j < nextAxisX.length; j++) {
                            const nextX = nextAxisX[j];
                            if (i === 0 || nextX.linear.left >= columnRight[i - 1]) {
                                if (columns[i] === undefined) {
                                    columns[i] = [];
                                }
                                if (i === 0 || columns[0].length === nextAxisX.length) {
                                    columns[i][j] = nextX;
                                }
                                else {
                                    const index = getRowIndex(columns, nextX);
                                    if (index !== -1) {
                                        columns[i][index] = nextX;
                                    }
                                    else {
                                        return undefined;
                                    }
                                }
                            }
                            else {
                                const endIndex = columns.length - 1;
                                if (columns[endIndex]) {
                                    let minLeft = columns[endIndex][0].linear.left;
                                    let maxRight = columns[endIndex][0].linear.right;
                                    for (let k = 1; k < columns[endIndex].length; k++) {
                                        minLeft = Math.min(minLeft, columns[endIndex][k].linear.left);
                                        maxRight = Math.max(maxRight, columns[endIndex][k].linear.right);
                                    }
                                    if (nextX.linear.left > minLeft && nextX.linear.right > maxRight) {
                                        const index = getRowIndex(columns, nextX);
                                        if (index !== -1) {
                                            for (let k = columns.length - 1; k >= 0; k--) {
                                                if (columns[k]) {
                                                    if (columns[k][index] === undefined) {
                                                        columns[endIndex].length = 0;
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            columnRight[i] = Math.max(nextX.linear.right, columnRight[i]);
                        }
                    }
                    for (let i = 0, j = -1; i < columnRight.length; i++) {
                        if (columns[i] === undefined) {
                            if (j === -1) {
                                j = i - 1;
                            }
                            else if (i === columnRight.length - 1) {
                                columnRight[j] = columnRight[i];
                            }
                        }
                        else if (j !== -1) {
                            columnRight[j] = columnRight[i - 1];
                            j = -1;
                        }
                    }
                    for (let i = 0; i < columns.length; i++) {
                        if (columns[i] && columns[i].length) {
                            columnEnd.push(columnRight[i]);
                        }
                        else {
                            columns.splice(i--, 1);
                        }
                    }
                    const maxColumn = columns.reduce((a, b) => Math.max(a, b.length), 0);
                    for (let l = 0; l < maxColumn; l++) {
                        for (let m = 0; m < columns.length; m++) {
                            if (columns[m][l] === undefined) {
                                columns[m][l] = { spacer: 1 };
                            }
                        }
                    }
                }
                columnEnd.push(node.box.right);
            }
            if (columns.length > 1 && columns[0].length === node.length) {
                for (const item of node) {
                    item.hide();
                }
                node.clear();
                const mainData = Object.assign({}, Grid.createDataAttribute(), { columnCount: columnBalance ? columns[0].length : columns.length });
                for (let l = 0, count = 0; l < columns.length; l++) {
                    let spacer = 0;
                    for (let m = 0, start = 0; m < columns[l].length; m++) {
                        const item = columns[l][m];
                        if (!item['spacer']) {
                            item.parent = node;
                            const data = Object.assign(Grid.createDataCellAttribute(), item.data(EXT_NAME.GRID, 'cellData'));
                            if (columnBalance) {
                                data.rowStart = m === 0;
                                data.rowEnd = m === columns[l].length - 1;
                                data.cellStart = l === 0 && m === 0;
                                data.cellEnd = l === columns.length - 1 && data.rowEnd;
                                data.index = m;
                            }
                            else {
                                let rowSpan = 1;
                                let columnSpan = 1 + spacer;
                                for (let n = l + 1; n < columns.length; n++) {
                                    if (columns[n][m].spacer === 1) {
                                        columnSpan++;
                                        columns[n][m].spacer = 2;
                                    }
                                    else {
                                        break;
                                    }
                                }
                                if (columnSpan === 1) {
                                    for (let n = m + 1; n < columns[l].length; n++) {
                                        if (columns[l][n].spacer === 1) {
                                            rowSpan++;
                                            columns[l][n].spacer = 2;
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                }
                                const index = Math.min(l + (columnSpan - 1), columnEnd.length - 1);
                                const actualChildren = item.documentParent.actualChildren;
                                for (const sibling of actualChildren) {
                                    if (sibling.visible && !sibling.rendered && sibling.linear.left >= item.linear.right && sibling.linear.right <= columnEnd[index]) {
                                        data.siblings.push(sibling);
                                    }
                                }
                                data.rowSpan = rowSpan;
                                data.columnSpan = columnSpan;
                                data.rowStart = start++ === 0;
                                data.rowEnd = columnSpan + l === columns.length;
                                data.cellStart = count++ === 0;
                                data.cellEnd = data.rowEnd && m === columns[l].length - 1;
                                data.index = l;
                                spacer = 0;
                            }
                            item.data(EXT_NAME.GRID, 'cellData', data);
                        }
                        else if (item['spacer'] === 1) {
                            spacer++;
                        }
                    }
                }
                $util$c.sortArray(node.children, true, 'documentParent.siblingIndex', 'siblingIndex');
                node.each((item, index) => item.siblingIndex = index);
                if (node.tableElement && node.css('borderCollapse') === 'collapse') {
                    node.modifyBox(32 /* PADDING_TOP */, null);
                    node.modifyBox(64 /* PADDING_RIGHT */, null);
                    node.modifyBox(128 /* PADDING_BOTTOM */, null);
                    node.modifyBox(256 /* PADDING_LEFT */, null);
                }
                node.data(EXT_NAME.GRID, 'mainData', mainData);
            }
            return undefined;
        }
    }

    const $util$d = squared.lib.util;
    function hasSingleImage(node) {
        return node.visibleStyle.backgroundImage && !node.visibleStyle.backgroundRepeat;
    }
    class List extends Extension {
        static createDataAttribute() {
            return {
                ordinal: '',
                imageSrc: '',
                imagePosition: ''
            };
        }
        condition(node) {
            const length = node.length;
            if (length && super.condition(node)) {
                const floated = new Set();
                let blockStatic = 0;
                let inlineVertical = 0;
                let floating = 0;
                let blockAlternate = 0;
                let imageType = 0;
                let listType = 0;
                for (let i = 0; i < length; i++) {
                    const item = node.children[i];
                    const listStyleType = item.css('listStyleType') !== 'none';
                    const singleImage = hasSingleImage(item);
                    if (item.tagName !== 'LI' && !listStyleType && singleImage) {
                        imageType++;
                    }
                    if (item.display === 'list-item' && (listStyleType || singleImage)) {
                        listType++;
                    }
                    if (item.blockStatic) {
                        blockStatic++;
                    }
                    if (item.inlineVertical) {
                        inlineVertical++;
                    }
                    if (item.floating) {
                        floated.add(item.float);
                        floating++;
                    }
                    else if (i === 0 || i === length - 1 || item.blockStatic || node.children[i - 1].blockStatic && node.children[i + 1].blockStatic) {
                        blockAlternate++;
                    }
                }
                return (imageType === length || listType > 0) && (blockStatic === length || inlineVertical === length || floating === length && floated.size === 1 || blockAlternate === length);
            }
            return false;
        }
        processNode(node) {
            let i = 0;
            node.each(item => {
                const mainData = List.createDataAttribute();
                if (item.display === 'list-item' || item.has('listStyleType') || hasSingleImage(item)) {
                    let src = item.css('listStyleImage');
                    if (src !== '' && src !== 'none') {
                        mainData.imageSrc = src;
                    }
                    else {
                        switch (item.css('listStyleType')) {
                            case 'disc':
                                mainData.ordinal = '●';
                                break;
                            case 'square':
                                mainData.ordinal = '■';
                                break;
                            case 'decimal':
                                mainData.ordinal = `${(i + 1).toString()}.`;
                                break;
                            case 'decimal-leading-zero':
                                mainData.ordinal = `${(i < 9 ? '0' : '') + (i + 1).toString()}.`;
                                break;
                            case 'lower-alpha':
                            case 'lower-latin':
                                mainData.ordinal = `${$util$d.convertAlpha(i).toLowerCase()}.`;
                                break;
                            case 'upper-alpha':
                            case 'upper-latin':
                                mainData.ordinal = `${$util$d.convertAlpha(i)}.`;
                                break;
                            case 'lower-roman':
                                mainData.ordinal = `${$util$d.convertRoman(i + 1).toLowerCase()}.`;
                                break;
                            case 'upper-roman':
                                mainData.ordinal = `${$util$d.convertRoman(i + 1)}.`;
                                break;
                            case 'none':
                                src = '';
                                let position = '';
                                if (!item.visibleStyle.backgroundRepeat) {
                                    src = item.css('backgroundImage');
                                    position = item.css('backgroundPosition');
                                }
                                if (src !== '' && src !== 'none') {
                                    mainData.imageSrc = src;
                                    mainData.imagePosition = position;
                                    item.exclude({ resource: NODE_RESOURCE.IMAGE_SOURCE });
                                }
                                break;
                            default:
                                mainData.ordinal = '○';
                                break;
                        }
                    }
                    i++;
                }
                item.data(EXT_NAME.LIST, 'mainData', mainData);
            });
            return undefined;
        }
        postBaseLayout(node) {
            node.modifyBox(16 /* MARGIN_LEFT */, null);
            node.modifyBox(256 /* PADDING_LEFT */, null);
        }
    }

    const $util$e = squared.lib.util;
    class Relative extends Extension {
        condition(node) {
            return node.positionRelative && !node.positionStatic || $util$e.convertInt(node.cssInitial('verticalAlign')) !== 0;
        }
        processNode() {
            return { include: true };
        }
        postProcedure(node) {
            const renderParent = node.renderParent;
            if (renderParent) {
                const verticalAlign = $util$e.convertFloat(node.verticalAlign);
                let target = node;
                if (renderParent.support.container.positionRelative && node.length === 0 && (node.top !== 0 || node.bottom !== 0 || verticalAlign !== 0)) {
                    target = node.clone(this.application.nextId, true, true);
                    node.hide(true);
                    this.application.session.cache.append(target, false);
                    const layout = new Layout(renderParent, target, target.containerType, target.alignmentType);
                    const index = renderParent.renderChildren.findIndex(item => item === node);
                    if (index !== -1) {
                        layout.renderIndex = index + 1;
                    }
                    this.application.addRenderLayout(layout);
                    if (!renderParent.hasAlign(16 /* VERTICAL */)) {
                        renderParent.renderEach(item => {
                            if (item.alignSibling('topBottom') === node.documentId) {
                                item.alignSibling('topBottom', target.documentId);
                            }
                            else if (item.alignSibling('bottomTop') === node.documentId) {
                                item.alignSibling('bottomTop', target.documentId);
                            }
                        });
                    }
                }
                if (node.top !== 0) {
                    target.modifyBox(2 /* MARGIN_TOP */, node.top);
                }
                else if (node.bottom !== 0) {
                    target.modifyBox(2 /* MARGIN_TOP */, node.bottom * -1);
                }
                if (verticalAlign !== 0) {
                    target.modifyBox(2 /* MARGIN_TOP */, verticalAlign * -1);
                }
                if (node.left !== 0) {
                    if (target.autoMargin.left) {
                        target.modifyBox(4 /* MARGIN_RIGHT */, node.left * -1);
                    }
                    else {
                        target.modifyBox(16 /* MARGIN_LEFT */, node.left);
                    }
                }
                else if (node.right !== 0) {
                    target.modifyBox(16 /* MARGIN_LEFT */, node.right * -1);
                }
            }
        }
    }

    const $css$6 = squared.lib.css;
    const $util$f = squared.lib.util;
    class Sprite extends Extension {
        condition(node) {
            let valid = false;
            if (node.hasWidth && node.hasHeight && node.length === 0) {
                let url = node.css('backgroundImage');
                if (url === '' || url === 'none') {
                    const match = $util$f.REGEXP_COMPILED.URL.exec(node.css('background'));
                    url = match ? match[0] : '';
                }
                if (url !== '') {
                    url = $css$6.resolveURL(url);
                    const image = this.application.session.image.get(url);
                    if (image) {
                        const dimension = node.actualDimension;
                        const fontSize = node.fontSize;
                        const position = $css$6.getBackgroundPosition(`${node.css('backgroundPositionX')} ${node.css('backgroundPositionY')}`, dimension, fontSize);
                        if (position.left <= 0 && position.top <= 0 && image.width > dimension.width && image.height > dimension.height) {
                            image.position = { x: position.left, y: position.top };
                            node.data(EXT_NAME.SPRITE, 'mainData', image);
                            valid = true;
                        }
                    }
                }
            }
            return valid && (!node.dataset.use || this.included(node.element));
        }
    }

    const $css$7 = squared.lib.css;
    class Substitute extends Extension {
        constructor(name, framework, tagNames, options) {
            super(name, framework, tagNames, options);
            this.require(EXT_NAME.EXTERNAL, true);
        }
        processNode(node, parent) {
            const data = $css$7.getDataSet(node.element, this.name);
            if (data.tagChild) {
                node.each(item => {
                    if (item.styleElement) {
                        item.dataset.use = this.name;
                        item.dataset.squaredSubstituteTag = data.tagChild;
                    }
                });
            }
            if (data.tag) {
                node.setControlType(data.tag);
                node.render(parent);
                return {
                    output: {
                        type: 1 /* XML */,
                        node,
                        controlName: data.tag
                    }
                };
            }
            return undefined;
        }
    }

    const $css$8 = squared.lib.css;
    const $math$1 = squared.lib.math;
    const $util$g = squared.lib.util;
    class Table extends Extension {
        static createDataAttribute() {
            return {
                layoutType: 0,
                rowCount: 0,
                columnCount: 0,
                expand: false
            };
        }
        processNode(node) {
            const mainData = Table.createDataAttribute();
            const table = [];
            function setAutoWidth(td) {
                td.data(EXT_NAME.TABLE, 'percent', `${Math.round((td.bounds.width / node.bounds.width) * 100)}%`);
                td.data(EXT_NAME.TABLE, 'expand', true);
            }
            function setBoundsWidth(td) {
                td.css('width', $util$g.formatPX(td.bounds.width), true);
            }
            function inheritStyles(section) {
                if (section.length) {
                    for (const item of section[0].cascade()) {
                        if (item.tagName === 'TH' || item.tagName === 'TD') {
                            item.inherit(section[0], 'styleMap');
                            item.unsetCache('visibleStyle');
                        }
                    }
                    $util$g.concatArray(table, section[0].children);
                    for (const item of section) {
                        item.hide();
                    }
                }
            }
            const thead = [];
            const tbody = [];
            const tfoot = [];
            node.each((item) => {
                switch (item.tagName) {
                    case 'THEAD':
                        thead.push(item);
                        break;
                    case 'TBODY':
                        tbody.push(item);
                        break;
                    case 'TFOOT':
                        tfoot.push(item);
                        break;
                }
            });
            inheritStyles(thead);
            for (const section of tbody) {
                $util$g.concatArray(table, section.children);
                section.hide();
            }
            inheritStyles(tfoot);
            const layoutFixed = node.css('tableLayout') === 'fixed';
            const borderCollapse = node.css('borderCollapse') === 'collapse';
            const [horizontal, vertical] = borderCollapse ? [0, 0] : $util$g.replaceMap(node.css('borderSpacing').split(' '), value => parseInt(value));
            if (horizontal > 0) {
                node.modifyBox(256 /* PADDING_LEFT */, horizontal);
                node.modifyBox(64 /* PADDING_RIGHT */, horizontal);
            }
            else {
                node.modifyBox(256 /* PADDING_LEFT */, null);
                node.modifyBox(64 /* PADDING_RIGHT */, null);
            }
            if (vertical > 0) {
                node.modifyBox(32 /* PADDING_TOP */, vertical);
                node.modifyBox(128 /* PADDING_BOTTOM */, vertical);
            }
            else {
                node.modifyBox(32 /* PADDING_TOP */, null);
                node.modifyBox(128 /* PADDING_BOTTOM */, null);
            }
            const spacingWidth = $util$g.formatPX(horizontal > 1 ? Math.round(horizontal / 2) : horizontal);
            const spacingHeight = $util$g.formatPX(vertical > 1 ? Math.round(vertical / 2) : vertical);
            const colgroup = node.element && node.element.querySelector('COLGROUP');
            const rowWidth = [];
            const mapBounds = [];
            const tableFilled = [];
            const mapWidth = [];
            let rowCount = table.length;
            let columnIndex = new Array(rowCount).fill(0);
            let columnCount = 0;
            let multiline = false;
            for (let i = 0; i < rowCount; i++) {
                const tr = table[i];
                rowWidth[i] = horizontal;
                tableFilled[i] = [];
                tr.each((td, j) => {
                    const element = td.element;
                    for (let k = 0; k < element.rowSpan - 1; k++) {
                        const col = (i + 1) + k;
                        if (columnIndex[col] !== undefined) {
                            columnIndex[col] += element.colSpan;
                        }
                    }
                    if (!td.hasWidth) {
                        const width = $util$g.convertInt($css$8.getNamedItem(element, 'width'));
                        if (width > 0) {
                            td.css('width', $util$g.formatPX(width));
                        }
                    }
                    if (!td.hasHeight) {
                        const height = $util$g.convertInt($css$8.getNamedItem(element, 'height'));
                        if (height > 0) {
                            td.css('height', $util$g.formatPX(height));
                        }
                    }
                    if (!td.visibleStyle.backgroundImage && !td.visibleStyle.backgroundColor) {
                        if (colgroup) {
                            const style = $css$8.getStyle(colgroup.children[columnIndex[i]]);
                            if (style.background) {
                                element.style.background = style.background;
                            }
                            else if (style.backgroundColor) {
                                element.style.backgroundColor = style.backgroundColor;
                            }
                        }
                        else {
                            const exclude = /rgba\(0, 0, 0, 0\)|transparent/;
                            let value = $css$8.getInheritedStyle(element, 'background', exclude, 'TABLE');
                            if (value !== '') {
                                element.style.background = value;
                            }
                            else {
                                value = $css$8.getInheritedStyle(element, 'backgroundColor', exclude, 'TABLE');
                                if (value !== '') {
                                    element.style.backgroundColor = value;
                                }
                            }
                        }
                    }
                    switch (td.tagName) {
                        case 'TH':
                            if (!td.cssInitial('textAlign')) {
                                td.css('textAlign', td.css('textAlign'));
                            }
                        case 'TD':
                            if (!td.cssInitial('verticalAlign')) {
                                td.css('verticalAlign', 'middle');
                            }
                            break;
                    }
                    const columnWidth = td.cssInitial('width');
                    const m = columnIndex[i];
                    const reevaluate = mapWidth[m] === undefined || mapWidth[m] === 'auto';
                    if (i === 0 || reevaluate || !layoutFixed) {
                        if (columnWidth === '' || columnWidth === 'auto') {
                            if (mapWidth[m] === undefined) {
                                mapWidth[m] = columnWidth || '0px';
                                mapBounds[m] = 0;
                            }
                            else if (i === table.length - 1) {
                                if (reevaluate && mapBounds[m] === 0) {
                                    mapBounds[m] = td.bounds.width;
                                }
                            }
                        }
                        else {
                            const length = $util$g.isLength(mapWidth[m]);
                            const percent = $util$g.isPercent(columnWidth);
                            if (reevaluate || td.bounds.width < mapBounds[m] || td.bounds.width === mapBounds[m] && (length && percent ||
                                percent && $util$g.isPercent(mapWidth[m]) && $util$g.convertFloat(columnWidth) > $util$g.convertFloat(mapWidth[m]) ||
                                length && $util$g.isLength(columnWidth) && $util$g.convertFloat(columnWidth) > $util$g.convertFloat(mapWidth[m]))) {
                                mapWidth[m] = columnWidth;
                            }
                            if (reevaluate || element.colSpan === 1) {
                                mapBounds[m] = td.bounds.width;
                            }
                        }
                    }
                    if (!multiline) {
                        multiline = td.multiline;
                    }
                    if (td.length || td.inlineText) {
                        rowWidth[i] += td.bounds.width + horizontal;
                    }
                    td.cssApply({
                        marginTop: i === 0 ? '0px' : spacingHeight,
                        marginRight: j < tr.length - 1 ? spacingWidth : '0px',
                        marginBottom: i + element.rowSpan - 1 >= table.length - 1 ? '0px' : spacingHeight,
                        marginLeft: columnIndex[i] === 0 ? '0px' : spacingWidth
                    }, true);
                    columnIndex[i] += element.colSpan;
                });
                columnCount = Math.max(columnCount, columnIndex[i]);
            }
            if (node.has('width', 2 /* LENGTH */) && mapWidth.some(value => $util$g.isPercent(value))) {
                $util$g.replaceMap(mapWidth, (value, index) => {
                    if (value === 'auto' && mapBounds[index] > 0) {
                        return $util$g.formatPX(mapBounds[index]);
                    }
                    return value;
                });
            }
            if (mapWidth.every(value => $util$g.isPercent(value)) && mapWidth.reduce((a, b) => a + parseFloat(b), 0) > 1) {
                let percentTotal = 100;
                $util$g.replaceMap(mapWidth, value => {
                    const percent = parseFloat(value);
                    if (percentTotal <= 0) {
                        value = '0px';
                    }
                    else if (percentTotal - percent < 0) {
                        value = $util$g.formatPercent(percentTotal);
                    }
                    percentTotal -= percent;
                    return value;
                });
            }
            else if (mapWidth.every(value => $util$g.isLength(value))) {
                const width = mapWidth.reduce((a, b) => a + parseInt(b), 0);
                if (width < node.width) {
                    $util$g.replaceMap(mapWidth, value => value !== '0px' ? `${(parseInt(value) / width) * 100}%` : value);
                }
                else if (width > node.width) {
                    node.css('width', 'auto', true);
                    if (!layoutFixed) {
                        for (const item of node.cascade()) {
                            item.css('width', 'auto', true);
                        }
                    }
                }
            }
            const mapPercent = mapWidth.reduce((a, b) => a + ($util$g.isPercent(b) ? parseFloat(b) : 0), 0);
            mainData.layoutType = (() => {
                if (mapWidth.some(value => $util$g.isPercent(value)) || mapWidth.every(value => $util$g.isLength(value) && value !== '0px')) {
                    return 3 /* VARIABLE */;
                }
                if (mapWidth.every(value => value === mapWidth[0])) {
                    if (multiline) {
                        return node.some(td => td.has('height')) ? 2 /* FIXED */ : 3 /* VARIABLE */;
                    }
                    if (mapWidth[0] === 'auto') {
                        return node.has('width') ? 3 /* VARIABLE */ : 0 /* NONE */;
                    }
                    if (node.hasWidth) {
                        return 2 /* FIXED */;
                    }
                }
                if (mapWidth.every(value => value === 'auto' || ($util$g.isLength(value) && value !== '0px'))) {
                    return 1 /* STRETCH */;
                }
                return 0 /* NONE */;
            })();
            if (multiline || mainData.layoutType === 1 /* STRETCH */ && !node.hasWidth) {
                mainData.expand = true;
            }
            const caption = node.find(item => item.tagName === 'CAPTION');
            node.clear();
            if (caption) {
                if (!caption.hasWidth && !$util$g.isUserAgent(16 /* EDGE */)) {
                    if (caption.textElement) {
                        if (!caption.has('maxWidth')) {
                            caption.css('maxWidth', $util$g.formatPX(caption.bounds.width));
                        }
                    }
                    else if (caption.bounds.width > $math$1.maxArray(rowWidth)) {
                        setBoundsWidth(caption);
                    }
                }
                if (!caption.cssInitial('textAlign')) {
                    caption.css('textAlign', 'center');
                }
                rowCount++;
                caption.data(EXT_NAME.TABLE, 'colSpan', columnCount);
                caption.parent = node;
            }
            columnIndex = new Array(table.length).fill(0);
            const hasWidth = node.hasWidth;
            for (let i = 0; i < table.length; i++) {
                const tr = table[i];
                const children = tr.duplicate();
                for (let j = 0; j < children.length; j++) {
                    const td = children[j];
                    const element = td.element;
                    const rowSpan = element.rowSpan;
                    const colSpan = element.colSpan;
                    for (let k = 0; k < rowSpan - 1; k++) {
                        const l = (i + 1) + k;
                        if (columnIndex[l] !== undefined) {
                            columnIndex[l] += colSpan;
                        }
                    }
                    if (rowSpan > 1) {
                        td.data(EXT_NAME.TABLE, 'rowSpan', rowSpan);
                    }
                    if (colSpan > 1) {
                        td.data(EXT_NAME.TABLE, 'colSpan', colSpan);
                    }
                    if (!td.has('verticalAlign')) {
                        td.css('verticalAlign', 'middle');
                    }
                    const columnWidth = mapWidth[columnIndex[i]];
                    if (columnWidth !== 'undefined') {
                        switch (mainData.layoutType) {
                            case 3 /* VARIABLE */:
                                if (columnWidth === 'auto') {
                                    if (mapPercent >= 1) {
                                        setBoundsWidth(td);
                                        td.data(EXT_NAME.TABLE, 'exceed', !hasWidth);
                                        td.data(EXT_NAME.TABLE, 'downsized', true);
                                    }
                                    else {
                                        setAutoWidth(td);
                                    }
                                }
                                else if ($util$g.isPercent(columnWidth)) {
                                    td.data(EXT_NAME.TABLE, 'percent', columnWidth);
                                    td.data(EXT_NAME.TABLE, 'expand', true);
                                }
                                else if ($util$g.isLength(columnWidth) && parseInt(columnWidth) > 0) {
                                    if (td.bounds.width >= parseInt(columnWidth)) {
                                        setBoundsWidth(td);
                                        td.data(EXT_NAME.TABLE, 'expand', false);
                                        td.data(EXT_NAME.TABLE, 'downsized', false);
                                    }
                                    else {
                                        if (layoutFixed) {
                                            setAutoWidth(td);
                                            td.data(EXT_NAME.TABLE, 'downsized', true);
                                        }
                                        else {
                                            setBoundsWidth(td);
                                            td.data(EXT_NAME.TABLE, 'expand', false);
                                        }
                                    }
                                }
                                else {
                                    if (!td.has('width') || td.has('width', 32 /* PERCENT */)) {
                                        setBoundsWidth(td);
                                    }
                                    td.data(EXT_NAME.TABLE, 'expand', false);
                                }
                                break;
                            case 2 /* FIXED */:
                                td.css('width', '0px');
                                break;
                            case 1 /* STRETCH */:
                                if (columnWidth === 'auto') {
                                    td.css('width', '0px');
                                }
                                else {
                                    if (layoutFixed) {
                                        td.data(EXT_NAME.TABLE, 'downsized', true);
                                    }
                                    else {
                                        setBoundsWidth(td);
                                    }
                                    td.data(EXT_NAME.TABLE, 'expand', false);
                                }
                                break;
                        }
                    }
                    columnIndex[i] += colSpan;
                    for (let k = 0; k < rowSpan; k++) {
                        for (let l = 0; l < colSpan; l++) {
                            tableFilled[i + k].push(td);
                        }
                    }
                    td.parent = node;
                }
                if (columnIndex[i] < columnCount) {
                    const td = children[children.length - 1];
                    td.data(EXT_NAME.TABLE, 'spaceSpan', columnCount - columnIndex[i]);
                }
                tr.hide();
            }
            if (borderCollapse) {
                const borderTopColor = node.css('borderTopColor');
                const borderTopStyle = node.css('borderTopStyle');
                const borderTopWidth = node.css('borderTopWidth');
                const borderRightColor = node.css('borderRightColor');
                const borderRightStyle = node.css('borderRightStyle');
                const borderRightWidth = node.css('borderRightWidth');
                const borderBottomColor = node.css('borderBottomColor');
                const borderBottomStyle = node.css('borderBottomStyle');
                const borderBottomWidth = node.css('borderBottomWidth');
                const borderLeftColor = node.css('borderLeftColor');
                const borderLeftStyle = node.css('borderLeftStyle');
                const borderLeftWidth = node.css('borderLeftWidth');
                let hideTop = false;
                let hideRight = false;
                let hideBottom = false;
                let hideLeft = false;
                for (let i = 0; i < rowCount; i++) {
                    for (let j = 0; j < columnCount; j++) {
                        const td = tableFilled[i][j];
                        if (td && td.css('visibility') === 'visible') {
                            if (i === 0) {
                                if (td.borderTopWidth < parseInt(borderTopWidth)) {
                                    td.cssApply({
                                        borderTopColor,
                                        borderTopStyle,
                                        borderTopWidth
                                    });
                                }
                                else {
                                    hideTop = true;
                                }
                            }
                            if (i >= 0 && i < rowCount - 1) {
                                const next = tableFilled[i + 1][j];
                                if (next && next !== td && next.css('visibility') === 'visible') {
                                    if (td.borderBottomWidth >= next.borderTopWidth) {
                                        next.css('borderTopWidth', '0px', true);
                                    }
                                    else {
                                        td.css('borderBottomWidth', '0px', true);
                                    }
                                }
                            }
                            if (i === rowCount - 1) {
                                if (td.borderBottomWidth < parseInt(borderBottomWidth)) {
                                    td.cssApply({
                                        borderBottomColor,
                                        borderBottomStyle,
                                        borderBottomWidth
                                    });
                                }
                                else {
                                    hideBottom = true;
                                }
                            }
                            if (j === 0) {
                                if (td.borderLeftWidth < parseInt(borderLeftWidth)) {
                                    td.cssApply({
                                        borderLeftColor,
                                        borderLeftStyle,
                                        borderLeftWidth
                                    });
                                }
                                else {
                                    hideLeft = true;
                                }
                            }
                            if (j >= 0 && j < columnCount - 1) {
                                const next = tableFilled[i][j + 1];
                                if (next && next !== td && next.css('visibility') === 'visible') {
                                    if (td.borderRightWidth >= next.borderLeftWidth) {
                                        next.css('borderLeftWidth', '0px', true);
                                    }
                                    else {
                                        td.css('borderRightWidth', '0px', true);
                                    }
                                }
                            }
                            if (j === columnCount - 1) {
                                if (td.borderRightWidth < parseInt(borderRightWidth)) {
                                    td.cssApply({
                                        borderRightColor,
                                        borderRightStyle,
                                        borderRightWidth
                                    });
                                }
                                else {
                                    hideRight = true;
                                }
                            }
                        }
                    }
                }
                if (hideTop || hideRight || hideBottom || hideLeft) {
                    node.cssApply({
                        borderTopWidth: '0px',
                        borderRightWidth: '0px',
                        borderBottomWidth: '0px',
                        borderLeftWidth: '0px'
                    }, true);
                }
            }
            mainData.rowCount = rowCount;
            mainData.columnCount = columnCount;
            node.data(EXT_NAME.TABLE, 'mainData', mainData);
            return undefined;
        }
    }

    const $util$h = squared.lib.util;
    class VerticalAlign extends Extension {
        condition(node) {
            let valid = false;
            let inlineVertical = 0;
            for (const item of node) {
                if (item.inlineVertical) {
                    inlineVertical++;
                    if ($util$h.convertInt(item.verticalAlign) !== 0) {
                        valid = true;
                    }
                }
            }
            return valid && inlineVertical > 1 && NodeList.linearData(node.children).linearX;
        }
        processNode(node) {
            const belowBaseline = [];
            const aboveBaseline = [];
            let minTop = Number.POSITIVE_INFINITY;
            node.each((item) => {
                if (item.inlineVertical && item.linear.top <= minTop) {
                    if (item.linear.top < minTop) {
                        aboveBaseline.length = 0;
                    }
                    aboveBaseline.push(item);
                    minTop = item.linear.top;
                }
            });
            if (node.every(item => item.positionStatic || item.positionRelative && item.length > 0)) {
                if (aboveBaseline.length !== node.length) {
                    node.each((item) => {
                        let reset;
                        if (aboveBaseline.includes(item)) {
                            reset = true;
                        }
                        else if (item.inlineVertical && !item.baseline && $util$h.isLength(item.verticalAlign)) {
                            item.modifyBox(2 /* MARGIN_TOP */, item.linear.top - aboveBaseline[0].linear.top);
                            belowBaseline.push(item);
                            reset = true;
                        }
                        else {
                            reset = false;
                        }
                        if (reset) {
                            item.css('verticalAlign', '0px', true);
                        }
                    });
                }
            }
            else {
                $util$h.spliceArray(aboveBaseline, item => !($util$h.isLength(item.verticalAlign) && $util$h.convertInt(item.verticalAlign) > 0));
            }
            if (aboveBaseline.length) {
                node.data(EXT_NAME.VERTICAL_ALIGN, 'mainData', {
                    aboveBaseline,
                    belowBaseline
                });
            }
            return undefined;
        }
        postProcedure(node) {
            const mainData = node.data(EXT_NAME.VERTICAL_ALIGN, 'mainData');
            if (mainData) {
                const baseline = node.find(item => item.baselineActive);
                if (baseline) {
                    baseline.modifyBox(2 /* MARGIN_TOP */, baseline.linear.top - mainData.aboveBaseline[0].linear.top);
                }
                else {
                    [].concat(mainData.belowBaseline, mainData.aboveBaseline).some(item => {
                        const verticalAlign = $util$h.convertInt(item.cssInitial('verticalAlign'));
                        if (verticalAlign > 0) {
                            item.modifyBox(8 /* MARGIN_BOTTOM */, verticalAlign);
                            return true;
                        }
                        return false;
                    });
                }
            }
        }
    }

    const $util$i = squared.lib.util;
    const HTML5 = document.doctype ? document.doctype.name === 'html' : false;
    function setMinHeight(node, offset) {
        const minHeight = node.has('minHeight', 2 /* LENGTH */) ? node.toFloat('minHeight') : 0;
        node.css('minHeight', $util$i.formatPX(Math.max(offset, minHeight)));
    }
    function isBlockElement(node) {
        return node ? node.blockStatic && !node.lineBreak && !node.positioned : false;
    }
    function getVisibleNode(node) {
        return node.visible || node.excluded ? node : node.renderAs || node.outerParent || node.innerChild || node;
    }
    function resetMargin(node, value) {
        node.modifyBox(value, null);
        if (node.companion) {
            node.companion.modifyBox(value, null);
        }
    }
    function applyMarginCollapse(node, visibleNode, child, direction) {
        if (isBlockElement(child)) {
            if (direction) {
                if (node.borderTopWidth === 0 && node.paddingTop === 0) {
                    let replaced = false;
                    if (child.marginTop === 0 && child.borderTopWidth === 0 && child.paddingTop === 0) {
                        const firstChild = child.firstChild;
                        if (isBlockElement(firstChild)) {
                            if (child.has('marginTop', 64 /* ZERO */)) {
                                if (HTML5 && firstChild.marginTop !== 0) {
                                    firstChild.modifyBox(2 /* MARGIN_TOP */, null);
                                }
                            }
                            else {
                                child = firstChild;
                                replaced = true;
                            }
                        }
                    }
                    if (!HTML5 && node.marginTop === 0 && node.has('marginTop', 64 /* ZERO */)) {
                        resetMargin(child, 2 /* MARGIN_TOP */);
                    }
                    else if (HTML5 && node.marginTop < child.marginTop) {
                        if (node.elementId === '') {
                            visibleNode.modifyBox(2 /* MARGIN_TOP */, null);
                        }
                        if (!replaced && !node.documentBody) {
                            if (child.marginTop > node.marginTop) {
                                if (node.elementId !== '') {
                                    visibleNode.modifyBox(2 /* MARGIN_TOP */, null);
                                }
                                visibleNode.modifyBox(2 /* MARGIN_TOP */, child.marginTop);
                            }
                            resetMargin(child, 2 /* MARGIN_TOP */);
                        }
                    }
                    else if (node.naturalElement && node.marginTop > 0) {
                        let valid = false;
                        if (node.visible && child.visible) {
                            child.modifyBox(2 /* MARGIN_TOP */, null);
                            valid = true;
                        }
                        else {
                            let replacement;
                            if (child.outerParent) {
                                replacement = child.outerParent;
                            }
                            else if (child.innerChild) {
                                replacement = child.innerChild;
                            }
                            if (replacement) {
                                replacement.modifyBox(2 /* MARGIN_TOP */, -child.marginTop, false);
                                child = replacement;
                                valid = true;
                            }
                        }
                        if (valid && child.companion) {
                            child.companion.modifyBox(2 /* MARGIN_TOP */, null);
                        }
                    }
                }
            }
            else {
                if (node.paddingBottom === 0 && node.borderBottomWidth === 0) {
                    let replaced = false;
                    if (child.paddingBottom === 0 && child.borderBottomWidth === 0 && child.marginBottom === 0) {
                        const lastChild = child.lastChild;
                        if (isBlockElement(lastChild)) {
                            if (child.has('marginBottom', 64 /* ZERO */)) {
                                if (HTML5 && lastChild.marginBottom !== 0) {
                                    lastChild.modifyBox(8 /* MARGIN_BOTTOM */, null);
                                }
                            }
                            else {
                                child = lastChild;
                                replaced = true;
                            }
                        }
                    }
                    if (!HTML5 && node.marginBottom === 0 && node.has('marginBottom', 64 /* ZERO */)) {
                        resetMargin(child, 8 /* MARGIN_BOTTOM */);
                    }
                    else if (HTML5 && node.marginBottom < child.marginBottom) {
                        if (node.elementId === '') {
                            visibleNode.modifyBox(8 /* MARGIN_BOTTOM */, null);
                        }
                        if (!replaced && !node.documentBody) {
                            if (child.marginBottom > node.marginBottom) {
                                if (node.elementId !== '') {
                                    visibleNode.modifyBox(8 /* MARGIN_BOTTOM */, null);
                                }
                                visibleNode.modifyBox(8 /* MARGIN_BOTTOM */, child.marginBottom);
                            }
                            resetMargin(child, 8 /* MARGIN_BOTTOM */);
                        }
                    }
                    else if (node.naturalElement && node.marginBottom > 0) {
                        let valid = false;
                        if (node.visible && child.visible) {
                            child.modifyBox(8 /* MARGIN_BOTTOM */, null);
                            valid = true;
                        }
                        else {
                            let replacement;
                            if (child.outerParent) {
                                replacement = child.outerParent;
                            }
                            else if (child.innerChild) {
                                replacement = child.innerChild;
                            }
                            if (replacement) {
                                replacement.modifyBox(8 /* MARGIN_BOTTOM */, -child.marginBottom, false);
                                child = replacement;
                                valid = true;
                            }
                        }
                        if (valid && child.companion) {
                            child.companion.modifyBox(8 /* MARGIN_BOTTOM */, null);
                        }
                    }
                }
            }
        }
    }
    class WhiteSpace extends Extension {
        afterBaseLayout() {
            const processed = new Set();
            for (const node of this.application.processing.cache) {
                if (node.naturalElement) {
                    const children = node.actualChildren;
                    let firstChild;
                    let lastChild;
                    for (let i = 0; i < children.length; i++) {
                        const current = children[i];
                        if (node.blockStatic) {
                            if (firstChild === undefined) {
                                firstChild = current;
                            }
                            lastChild = current;
                        }
                        if (i === 0) {
                            continue;
                        }
                        if (isBlockElement(current)) {
                            const previousSiblings = current.previousSiblings(true, true, true);
                            if (previousSiblings.length) {
                                const previous = previousSiblings.find(item => !item.floating);
                                const currentVisible = getVisibleNode(current);
                                if (isBlockElement(previous)) {
                                    const previousVisible = getVisibleNode(previous);
                                    let marginBottom = $util$i.convertFloat(previous.cssInitial('marginBottom', false, true));
                                    let marginTop = $util$i.convertFloat(current.cssInitial('marginTop', false, true));
                                    if (previous.excluded && !current.excluded) {
                                        const offset = Math.min(marginBottom, $util$i.convertFloat(previous.cssInitial('marginTop', false, true)));
                                        if (offset < 0) {
                                            const top = Math.abs(offset) >= marginTop ? null : offset;
                                            currentVisible.modifyBox(2 /* MARGIN_TOP */, top);
                                            if (currentVisible.companion) {
                                                currentVisible.companion.modifyBox(2 /* MARGIN_TOP */, top);
                                            }
                                            processed.add(previous);
                                        }
                                    }
                                    else if (!previous.excluded && current.excluded) {
                                        const offset = Math.min(marginTop, $util$i.convertFloat(current.cssInitial('marginBottom', false, true)));
                                        if (offset < 0) {
                                            previousVisible.modifyBox(8 /* MARGIN_BOTTOM */, Math.abs(offset) >= marginBottom ? null : offset);
                                            processed.add(current);
                                        }
                                    }
                                    else {
                                        if (previous.paddingBottom === 0 && previous.borderBottomWidth === 0) {
                                            const bottomChild = previous.lastChild;
                                            if (isBlockElement(bottomChild) && bottomChild.elementId === '') {
                                                const childMarginBottom = $util$i.convertFloat(bottomChild.cssInitial('marginBottom', false, true));
                                                if (childMarginBottom > marginBottom) {
                                                    marginBottom = childMarginBottom;
                                                    previous.css('marginBottom', $util$i.formatPX(marginBottom), true);
                                                }
                                                if (previous.visible) {
                                                    bottomChild.modifyBox(8 /* MARGIN_BOTTOM */, null);
                                                    if (bottomChild.companion) {
                                                        bottomChild.companion.modifyBox(8 /* MARGIN_BOTTOM */, null);
                                                    }
                                                }
                                            }
                                        }
                                        if (current.borderTopWidth === 0 && current.paddingTop === 0) {
                                            const topChild = current.firstChild;
                                            if (isBlockElement(topChild) && topChild.elementId === '') {
                                                const childMarginTop = $util$i.convertFloat(topChild.cssInitial('marginTop', false, true));
                                                if (childMarginTop > marginTop) {
                                                    marginTop = childMarginTop;
                                                    current.css('marginTop', $util$i.formatPX(marginTop), true);
                                                }
                                                if (current.visible) {
                                                    topChild.modifyBox(2 /* MARGIN_TOP */, null);
                                                    if (topChild.companion) {
                                                        topChild.companion.modifyBox(2 /* MARGIN_TOP */, null);
                                                    }
                                                }
                                            }
                                        }
                                        if (marginBottom > 0 && marginTop > 0) {
                                            if (marginTop <= marginBottom) {
                                                currentVisible.modifyBox(2 /* MARGIN_TOP */, null);
                                                if (currentVisible.companion) {
                                                    currentVisible.companion.modifyBox(2 /* MARGIN_TOP */, null);
                                                }
                                            }
                                            else {
                                                previousVisible.modifyBox(8 /* MARGIN_BOTTOM */, null);
                                                if (previousVisible.companion) {
                                                    previousVisible.companion.modifyBox(8 /* MARGIN_BOTTOM */, null);
                                                }
                                            }
                                        }
                                    }
                                }
                                else if (previous && previous.tagName === 'IMG') {
                                    const offset = current.linear.top - previous.linear.bottom;
                                    if (offset > 0 && !current.ascend(true).some(item => item.has('height'))) {
                                        currentVisible.modifyBox(2 /* MARGIN_TOP */, offset);
                                    }
                                }
                            }
                        }
                    }
                    const visibleNode = getVisibleNode(node);
                    if (firstChild) {
                        applyMarginCollapse(node, visibleNode, firstChild, true);
                    }
                    if (lastChild) {
                        applyMarginCollapse(node, visibleNode, lastChild, false);
                    }
                }
            }
            for (const node of this.application.processing.excluded) {
                if (!processed.has(node)) {
                    if (node.lineBreak) {
                        const actualParent = node.actualParent;
                        const previousSiblings = node.previousSiblings(true, true, true);
                        const nextSiblings = node.nextSiblings(true, true, true);
                        let valid = false;
                        if (previousSiblings.length && nextSiblings.length) {
                            if (nextSiblings[0].lineBreak) {
                                continue;
                            }
                            else {
                                let above = previousSiblings.pop();
                                const below = nextSiblings.pop();
                                if (above.inlineStatic && below.inlineStatic) {
                                    if (previousSiblings.length === 0) {
                                        processed.add(node);
                                        continue;
                                    }
                                    else {
                                        const abovePrevious = previousSiblings.pop();
                                        if (abovePrevious.lineBreak) {
                                            abovePrevious.setBounds();
                                            if (abovePrevious.bounds.bottom !== 0) {
                                                above = abovePrevious;
                                            }
                                        }
                                    }
                                }
                                valid = true;
                                let offset;
                                if (below.lineHeight > 0 && below.element && below.cssTry('lineHeight', '0px')) {
                                    offset = below.element.getBoundingClientRect().top - below.marginTop;
                                    below.cssFinally('lineHeight');
                                }
                                else {
                                    offset = below.linear.top;
                                }
                                if (above.lineHeight > 0 && above.element && above.cssTry('lineHeight', '0px')) {
                                    offset -= above.element.getBoundingClientRect().bottom + above.marginBottom;
                                    above.cssFinally('lineHeight');
                                }
                                else {
                                    offset -= above.linear.bottom;
                                }
                                if (offset !== 0) {
                                    const aboveParent = above.visible && above.renderParent;
                                    const belowParent = below.visible && below.renderParent;
                                    if (belowParent && belowParent.groupParent && belowParent.firstChild === below) {
                                        belowParent.modifyBox(2 /* MARGIN_TOP */, offset);
                                    }
                                    else if (aboveParent && aboveParent.groupParent && aboveParent.lastChild === above) {
                                        aboveParent.modifyBox(8 /* MARGIN_BOTTOM */, offset);
                                    }
                                    else if (belowParent && belowParent.layoutVertical && (below.visible || below.renderAs)) {
                                        (below.renderAs || below).modifyBox(2 /* MARGIN_TOP */, offset);
                                    }
                                    else if (aboveParent && aboveParent.layoutVertical && (above.visible || above.renderAs)) {
                                        (above.renderAs || above).modifyBox(8 /* MARGIN_BOTTOM */, offset);
                                    }
                                    else if (!belowParent && !aboveParent && actualParent && actualParent.visible) {
                                        if (below.lineBreak || below.excluded) {
                                            actualParent.modifyBox(128 /* PADDING_BOTTOM */, offset);
                                        }
                                        else if (above.lineBreak || above.excluded) {
                                            actualParent.modifyBox(32 /* PADDING_TOP */, offset);
                                        }
                                        else {
                                            valid = false;
                                        }
                                    }
                                    else {
                                        valid = false;
                                    }
                                }
                            }
                        }
                        else if (actualParent && actualParent.visible) {
                            if (!actualParent.documentRoot && previousSiblings.length) {
                                const previousStart = previousSiblings[previousSiblings.length - 1];
                                const offset = actualParent.box.bottom - previousStart.linear[previousStart.lineBreak || previousStart.excluded ? 'top' : 'bottom'];
                                if (offset !== 0) {
                                    if (previousStart.rendered || actualParent.visibleStyle.background) {
                                        actualParent.modifyBox(128 /* PADDING_BOTTOM */, offset);
                                    }
                                    else if (!actualParent.hasHeight) {
                                        setMinHeight(actualParent, offset);
                                    }
                                }
                            }
                            else if (nextSiblings.length) {
                                const nextStart = nextSiblings[nextSiblings.length - 1];
                                const offset = nextStart.linear[nextStart.lineBreak || nextStart.excluded ? 'bottom' : 'top'] - actualParent.box.top;
                                if (offset !== 0) {
                                    if (nextStart.rendered || actualParent.visibleStyle.background) {
                                        actualParent.modifyBox(32 /* PADDING_TOP */, offset);
                                    }
                                    else if (!actualParent.hasHeight) {
                                        setMinHeight(actualParent, offset);
                                    }
                                }
                            }
                            valid = true;
                        }
                        if (valid) {
                            for (const item of previousSiblings) {
                                processed.add(item);
                            }
                            for (const item of nextSiblings) {
                                processed.add(item);
                            }
                        }
                    }
                    else {
                        const below = node.nextSiblings(true, true, true).pop();
                        if (below && below.visible) {
                            const previousSiblings = node.previousSiblings(false, false);
                            let offset = below.linear.top;
                            if (previousSiblings.length) {
                                const previous = previousSiblings.pop();
                                offset -= previous.linear.bottom;
                            }
                            else {
                                offset -= node.linear.top;
                            }
                            if (offset > 0) {
                                below.modifyBox(2 /* MARGIN_TOP */, offset);
                            }
                        }
                    }
                }
            }
        }
        afterConstraints() {
            for (const node of this.application.processing.cache) {
                const renderParent = node.renderAs ? node.renderAs.renderParent : node.renderParent;
                if (renderParent && !renderParent.hasAlign(4 /* AUTO_LAYOUT */) && node.pageFlow && node.styleElement && node.inlineVertical && !node.alignParent('left')) {
                    const previous = [];
                    let current = node;
                    while (true) {
                        $util$i.concatArray(previous, current.previousSiblings());
                        if (previous.length && !previous.some(item => item.lineBreak || item.excluded && item.blockStatic)) {
                            const previousSibling = previous[previous.length - 1];
                            if (previousSibling.inlineVertical) {
                                const offset = node.linear.left - previousSibling.actualRight();
                                if (offset > 0) {
                                    getVisibleNode(node).modifyBox(16 /* MARGIN_LEFT */, offset);
                                }
                            }
                            else if (previousSibling.floating) {
                                previous.length = 0;
                                current = previousSibling;
                                continue;
                            }
                        }
                        break;
                    }
                }
            }
        }
    }

    const extensions = {
        Accessibility,
        CssGrid,
        External,
        Flexbox,
        Grid,
        List,
        Relative,
        Sprite,
        Substitute,
        Table,
        VerticalAlign,
        WhiteSpace
    };
    const lib = {
        constant,
        enumeration
    };

    exports.Application = Application;
    exports.Controller = Controller;
    exports.Extension = Extension;
    exports.ExtensionManager = ExtensionManager;
    exports.File = File;
    exports.Layout = Layout;
    exports.Node = Node;
    exports.NodeGroup = NodeGroup;
    exports.NodeList = NodeList;
    exports.Resource = Resource;
    exports.extensions = extensions;
    exports.lib = lib;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
