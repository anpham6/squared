/* squared.base 0.7.2
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory((global.squared = global.squared || {}, global.squared.base = {})));
}(this, function (exports) { 'use strict';

    const $dom = squared.lib.dom;
    const $util = squared.lib.util;
    class NodeList extends squared.lib.base.Container {
        constructor(children) {
            super(children);
            this._currentId = 0;
        }
        static actualParent(list) {
            for (const node of list) {
                if (node.naturalElement && node.actualParent) {
                    return node.actualParent;
                }
            }
            return undefined;
        }
        static baseline(list, text = false) {
            let baseline = $util.filterArray(list, item => {
                if (item.baseline || $util.isUnit(item.verticalAlign) && item.verticalAlign !== '0px') {
                    const position = item.cssInitial('position');
                    return position !== 'absolute' && position !== 'fixed';
                }
                return false;
            });
            if (baseline.length) {
                list = baseline;
            }
            baseline = $util.filterArray(list, item => item.textElement || item.verticalAlign !== 'text-top' && item.verticalAlign !== 'text-bottom');
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
                boundsHeight = Math.max(boundsHeight, item.bounds.height);
            }
            $util.spliceArray(list, item => lineHeight > boundsHeight ? item.lineHeight !== lineHeight : !$util.withinFraction(item.bounds.height, boundsHeight));
            return list.sort((a, b) => {
                if (a.groupParent || a.length || (!a.baseline && b.baseline)) {
                    return 1;
                }
                else if (b.groupParent || b.length || (a.baseline && !b.baseline)) {
                    return -1;
                }
                if (!a.imageElement || !b.imageElement) {
                    if (a.multiline || b.multiline) {
                        if (a.lineHeight > 0 && b.lineHeight > 0) {
                            return a.lineHeight <= b.lineHeight ? 1 : -1;
                        }
                        else if (a.fontSize === b.fontSize) {
                            return a.htmlElement || !b.htmlElement ? -1 : 1;
                        }
                    }
                    if (a.containerType !== b.containerType) {
                        if (a.textElement || a.imageElement) {
                            return -1;
                        }
                        else if (b.textElement || b.imageElement) {
                            return 1;
                        }
                        return a.containerType < b.containerType ? -1 : 1;
                    }
                    else if (b.imageElement) {
                        return -1;
                    }
                    else if (a.imageElement) {
                        return 1;
                    }
                    else {
                        if (a.fontSize === b.fontSize) {
                            if (a.htmlElement && !b.htmlElement) {
                                return -1;
                            }
                            else if (!a.htmlElement && b.htmlElement) {
                                return 1;
                            }
                            else {
                                return a.siblingIndex >= b.siblingIndex ? 1 : -1;
                            }
                        }
                        else if (a.fontSize !== b.fontSize && a.fontSize > 0 && b.fontSize > 0) {
                            return a.fontSize > b.fontSize ? -1 : 1;
                        }
                    }
                }
                return 0;
            });
        }
        static floated(list) {
            const result = new Set();
            for (const node of list) {
                if (node.floating) {
                    result.add(node.float);
                }
            }
            return result;
        }
        static cleared(list, parent = true) {
            if (parent && list.length > 1) {
                list.slice(0).sort(this.siblingIndex);
                const actualParent = this.actualParent(list);
                if (actualParent && actualParent.element) {
                    const nodes = [];
                    const listEnd = list[list.length - 1];
                    let valid = false;
                    for (let i = 0; i < actualParent.element.childNodes.length; i++) {
                        const node = $dom.getElementAsNode(actualParent.element.childNodes[i]);
                        if (node) {
                            if (node === list[0]) {
                                valid = true;
                            }
                            if (valid) {
                                nodes.push(node);
                            }
                            if (node === listEnd) {
                                break;
                            }
                        }
                    }
                    if (nodes.length >= list.length) {
                        list = nodes;
                    }
                }
            }
            const result = new Map();
            const floated = new Set();
            const previous = { left: null, right: null };
            for (const node of list) {
                if (node.pageFlow) {
                    const clear = node.css('clear');
                    if (floated.size) {
                        const previousFloat = clear === 'both' ? [previous.left, previous.right]
                            : clear === 'left' ? [previous.left, null]
                                : clear === 'right' ? [null, previous.right] : [];
                        for (const item of previousFloat) {
                            if (item && !node.floating && node.linear.top > item.linear.bottom && floated.has(item.float)) {
                                floated.delete(item.float);
                                previous[item.float] = null;
                            }
                        }
                        if (clear === 'both') {
                            result.set(node, floated.size === 2 ? 'both' : floated.values().next().value);
                            floated.clear();
                            previous.left = null;
                            previous.right = null;
                        }
                        else if (floated.has(clear)) {
                            result.set(node, clear);
                            floated.delete(clear);
                            previous[clear] = null;
                        }
                    }
                    if (node.floating) {
                        floated.add(node.float);
                        previous[node.float] = node;
                    }
                }
            }
            return result;
        }
        static floatedAll(parent) {
            return this.floated($util.filterArray(parent.actualChildren, item => item.pageFlow));
        }
        static clearedAll(parent) {
            return this.cleared($util.filterArray(parent.actualChildren, item => item.pageFlow), false);
        }
        static linearX(list) {
            const nodes = $util.filterArray(list, node => node.pageFlow).sort(NodeList.siblingIndex);
            switch (nodes.length) {
                case 0:
                    return false;
                case 1:
                    return true;
                default:
                    const parent = this.actualParent(nodes);
                    if (parent) {
                        const cleared = this.clearedAll(parent);
                        for (let i = 1; i < nodes.length; i++) {
                            if (nodes[i].alignedVertically(nodes[i].previousSiblings(), undefined, cleared)) {
                                return false;
                            }
                        }
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
                                return false;
                            }
                            const previous = nodes[i - 1];
                            if (previous.floating && item.linear.top >= previous.linear.bottom || $util.withinFraction(item.linear.left, previous.linear.left)) {
                                return false;
                            }
                        }
                        return true;
                    }
                    return false;
            }
        }
        static linearY(list) {
            const nodes = $util.filterArray(list, node => node.pageFlow).sort(NodeList.siblingIndex);
            switch (nodes.length) {
                case 0:
                    return false;
                case 1:
                    return true;
                default:
                    const parent = this.actualParent(nodes);
                    if (parent) {
                        const cleared = this.clearedAll(parent);
                        for (let i = 1; i < nodes.length; i++) {
                            if (!nodes[i].alignedVertically(nodes[i].previousSiblings(), nodes, cleared)) {
                                return false;
                            }
                        }
                        return true;
                    }
                    return false;
            }
        }
        static partitionRows(list) {
            const [children, cleared] = (() => {
                const parent = this.actualParent(list);
                if (parent) {
                    return [parent.actualChildren, this.clearedAll(parent)];
                }
                else {
                    return [list, this.cleared(list)];
                }
            })();
            const result = [];
            let row = [];
            for (let i = 0; i < children.length; i++) {
                const node = children[i];
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
                    else {
                        if (list.includes(node)) {
                            row.push(node);
                        }
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
        constructor(parent, node, containerType = 0, alignmentType = 0, itemCount = 0, children) {
            super(children);
            this.parent = parent;
            this.node = node;
            this.containerType = containerType;
            this.alignmentType = alignmentType;
            this.itemCount = itemCount;
            this.rowCount = 0;
            this.columnCount = 0;
            this.renderType = 0;
            this.renderPosition = false;
        }
        init() {
            this.floated = this.getFloated();
            this.cleared = this.getCleared();
            this.linearX = this.isLinearX();
        }
        setType(containerType, ...alignmentType) {
            this.containerType = containerType;
            for (const value of alignmentType) {
                this.add(value);
            }
        }
        add(value) {
            this.alignmentType |= value;
            return this.alignmentType;
        }
        retain(list) {
            super.retain(list);
            this.itemCount = list.length;
            return this;
        }
        delete(value) {
            if ($util$1.hasBit(this.alignmentType, value)) {
                this.alignmentType ^= value;
            }
            return this.alignmentType;
        }
        getFloated(parent = false) {
            return parent ? NodeList.floatedAll(this.parent) : NodeList.floated(this.children);
        }
        getCleared(parent = false) {
            return parent ? NodeList.clearedAll(this.parent) : NodeList.cleared(this.children);
        }
        isLinearX() {
            return NodeList.linearX(this.children);
        }
        isLinearY() {
            return NodeList.linearY(this.children);
        }
        set floated(value) {
            if (value.size) {
                this.add(64 /* FLOAT */);
            }
            else {
                this.delete(64 /* FLOAT */);
            }
            if (this.every(item => item.float === 'right')) {
                this.add(512 /* RIGHT */);
            }
            else {
                this.delete(512 /* RIGHT */);
            }
            this._floated = value;
        }
        get floated() {
            return this._floated || this.getFloated();
        }
        set cleared(value) {
            this._cleared = value;
        }
        get cleared() {
            return this._cleared || this.getCleared();
        }
        get visible() {
            return this.filter(node => node.visible);
        }
        set linearX(value) {
            this._linearX = value;
        }
        get linearX() {
            return this._linearX || this.isLinearX();
        }
        set linearY(value) {
            this._linearY = value;
        }
        get linearY() {
            return this._linearY || this.isLinearY();
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
    const $dom$1 = squared.lib.dom;
    const $util$2 = squared.lib.util;
    const $xml = squared.lib.xml;
    const REGEXP_COLORSTOP = `(?:\\s*(rgba?\\(\\d+, \\d+, \\d+(?:, [\\d.]+)?\\)|#[a-zA-Z\\d]{3,}|[a-z]+)\\s*(\\d+%|${$util$2.REGEXP_STRING.DEGREE}|${$util$2.REGEXP_STRING.UNIT})?,?\\s*)`;
    const REGEXP_POSITION = /(.+?)?\s*at (.+?)$/;
    function replaceExcluded(element, attr) {
        let value = element[attr];
        for (let i = 0; i < element.children.length; i++) {
            const item = $dom$1.getElementAsNode(element.children[i]);
            if (item && (item.excluded || $util$2.hasValue(item.dataset.target) && $util$2.isString(item[attr]))) {
                value = value.replace(item[attr], '');
            }
        }
        return value;
    }
    function getColorStops(value, opacity, conic = false) {
        const result = [];
        const pattern = new RegExp(REGEXP_COLORSTOP, 'g');
        let match;
        while ((match = pattern.exec(value)) !== null) {
            const color = $color.parseRGBA(match[1], opacity, true);
            if (color) {
                const item = {
                    color: color.valueRGBA,
                    opacity: color.alpha,
                    offset: ''
                };
                if (conic) {
                    if (match[3] && match[4]) {
                        item.offset = $util$2.convertAngle(match[3], match[4]).toString();
                    }
                }
                else {
                    if (match[2] && $util$2.isPercent(match[2])) {
                        item.offset = match[2];
                    }
                }
                result.push(item);
            }
        }
        const lastStop = result[result.length - 1];
        if (lastStop.offset === '') {
            lastStop.offset = conic ? '360' : '100%';
        }
        let previousIncrement = 0;
        for (let i = 0; i < result.length; i++) {
            const item = result[i];
            if (item.offset === '') {
                if (i === 0) {
                    item.offset = '0';
                }
                else {
                    for (let j = i + 1, k = 2; j < result.length - 1; j++, k++) {
                        if (result[j].offset !== '') {
                            item.offset = ((previousIncrement + parseInt(result[j].offset)) / k).toString();
                            break;
                        }
                    }
                    if (item.offset === '') {
                        item.offset = (previousIncrement + parseInt(lastStop.offset) / (result.length - 1)).toString();
                    }
                }
                if (!conic) {
                    item.offset += '%';
                }
            }
            previousIncrement = parseInt(item.offset);
        }
        if (conic && previousIncrement < 360 || !conic && previousIncrement < 100) {
            const colorFill = Object.assign({}, result[result.length - 1]);
            colorFill.offset = conic ? '360' : '100%';
            result.push(colorFill);
        }
        return result;
    }
    function parseAngle(value) {
        if (value) {
            const match = new RegExp($util$2.REGEXP_STRING.DEGREE).exec(value.trim());
            if (match) {
                return $util$2.convertAngle(match[1], match[2]);
            }
        }
        return 0;
    }
    function replaceWhiteSpace(node, value) {
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
                value = value.replace(/\n/g, '\\n').replace(/\s/g, '&#160;');
                break;
            case 'pre-line':
                value = value.replace(/\n/g, '\\n').replace(/\s+/g, ' ');
                break;
            default:
                const element = node.element;
                if (element) {
                    if ($dom$1.isLineBreak(element.previousSibling)) {
                        value = value.replace(/^\s+/, '');
                    }
                    if ($dom$1.isLineBreak(element.nextSibling)) {
                        value = value.replace(/\s+$/, '');
                    }
                }
                return [value, false];
        }
        return [value, true];
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
        static getStoredName(asset, value) {
            if (Resource.STORED[asset]) {
                for (const [name, data] of Resource.STORED[asset].entries()) {
                    if (JSON.stringify(value) === JSON.stringify(data)) {
                        return name;
                    }
                }
            }
            return '';
        }
        static insertStoredAsset(asset, name, value) {
            const stored = Resource.STORED[asset];
            if (stored) {
                let result = this.getStoredName(asset, value);
                if (result === '') {
                    if ($util$2.isNumber(name) || /^\d/.test(name)) {
                        name = `__${name}`;
                    }
                    if ($util$2.hasValue(value)) {
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
                }
                return result;
            }
            return '';
        }
        static isBorderVisible(border) {
            return !!border && !(border.style === 'none' ||
                border.width === '0px' ||
                border.color === '' ||
                border.color.length === 9 && border.color.endsWith('00'));
        }
        static hasDrawableBackground(object) {
            return !!object && (this.isBorderVisible(object.borderTop) ||
                this.isBorderVisible(object.borderRight) ||
                this.isBorderVisible(object.borderBottom) ||
                this.isBorderVisible(object.borderLeft) ||
                !!object.backgroundImage ||
                !!object.borderRadius ||
                !!object.backgroundGradient);
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
                        background: null,
                        borderTop: null,
                        borderRight: null,
                        borderBottom: null,
                        borderLeft: null,
                        borderRadius: null,
                        backgroundColor: null,
                        backgroundSize: null,
                        backgroundImage: null,
                        backgroundRepeat: null,
                        backgroundPositionX: null,
                        backgroundPositionY: null
                    };
                    for (const attr in boxStyle) {
                        const value = node.css(attr);
                        switch (attr) {
                            case 'borderTop':
                            case 'borderRight':
                            case 'borderBottom':
                            case 'borderLeft': {
                                let borderColor = node.css(`${attr}Color`);
                                switch (borderColor.toLowerCase()) {
                                    case 'initial':
                                        borderColor = '#000000';
                                        break;
                                    case 'inherit':
                                    case 'currentcolor':
                                        borderColor = $dom$1.cssInheritStyle(node.element, `${attr}Color`);
                                        break;
                                }
                                const style = node.css(`${attr}Style`) || 'none';
                                let width = node.css(`${attr}Width`) || '1px';
                                let color;
                                switch (style) {
                                    case 'none':
                                        break;
                                    case 'inset':
                                        if (width === '0px') {
                                            width = '1px';
                                        }
                                    default:
                                        color = $color.parseRGBA(borderColor, node.css('opacity'));
                                        break;
                                }
                                boxStyle[attr] = {
                                    width,
                                    style,
                                    color: color ? color.valueRGBA : ''
                                };
                                break;
                            }
                            case 'borderRadius': {
                                const top = node.css('borderTopLeftRadius');
                                const right = node.css('borderTopRightRadius');
                                const bottom = node.css('borderBottomLeftRadius');
                                const left = node.css('borderBottomRightRadius');
                                if (top === right && right === bottom && bottom === left) {
                                    boxStyle.borderRadius = $util$2.convertInt(top) > 0 ? [top] : undefined;
                                }
                                else {
                                    boxStyle.borderRadius = [top, right, bottom, left];
                                }
                                break;
                            }
                            case 'backgroundColor':
                                if (!node.has('backgroundColor') && (value === node.cssAscend('backgroundColor', false, true) || node.documentParent.visible && $dom$1.cssFromParent(node.element, 'backgroundColor'))) {
                                    boxStyle.backgroundColor = '';
                                }
                                else {
                                    const color = $color.parseRGBA(value, node.css('opacity'));
                                    boxStyle.backgroundColor = color ? color.valueRGBA : '';
                                }
                                break;
                            case 'background':
                            case 'backgroundImage':
                                if (value !== 'none' && !node.hasBit('excludeResource', NODE_RESOURCE.IMAGE_SOURCE)) {
                                    const gradients = [];
                                    const opacity = node.css('opacity');
                                    let pattern = new RegExp(`(linear|radial|conic)-gradient\\(((?:to [a-z ]+|(?:from )?-?[\\d.]+(?:deg|rad|turn|grad)|circle|ellipse|closest-side|closest-corner|farthest-side|farthest-corner)?(?:\\s*at [\\w %]+)?),?\\s*(${REGEXP_COLORSTOP}+)\\)`, 'g');
                                    let match;
                                    while ((match = pattern.exec(value)) !== null) {
                                        let gradient;
                                        switch (match[1]) {
                                            case 'linear': {
                                                if (match[2] === undefined) {
                                                    match[2] = 'to bottom';
                                                }
                                                let angle;
                                                switch (match[2]) {
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
                                                        angle = 180;
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
                                                        angle = parseAngle(match[2]);
                                                        break;
                                                }
                                                gradient = {
                                                    type: match[1],
                                                    angle,
                                                    colorStops: getColorStops(match[3], opacity)
                                                };
                                                break;
                                            }
                                            case 'radial': {
                                                gradient = {
                                                    type: match[1],
                                                    position: (() => {
                                                        const result = ['center', 'ellipse'];
                                                        if (match[2]) {
                                                            const position = REGEXP_POSITION.exec(match[2]);
                                                            if (position) {
                                                                if (position[1]) {
                                                                    switch (position[1]) {
                                                                        case 'ellipse':
                                                                        case 'circle':
                                                                        case 'closest-side':
                                                                        case 'closest-corner':
                                                                        case 'farthest-side':
                                                                        case 'farthest-corner':
                                                                            result[1] = position[1];
                                                                            break;
                                                                    }
                                                                }
                                                                if (position[2]) {
                                                                    result[0] = position[2];
                                                                }
                                                            }
                                                        }
                                                        return result;
                                                    })(),
                                                    colorStops: getColorStops(match[3], opacity)
                                                };
                                                break;
                                            }
                                            case 'conic': {
                                                gradient = {
                                                    type: match[1],
                                                    angle: parseAngle(match[2]),
                                                    position: (() => {
                                                        if (match[2]) {
                                                            const position = REGEXP_POSITION.exec(match[2]);
                                                            if (position) {
                                                                return [position[2]];
                                                            }
                                                        }
                                                        return ['center'];
                                                    })(),
                                                    colorStops: getColorStops(match[3], opacity, true)
                                                };
                                                break;
                                            }
                                        }
                                        if (gradient.colorStops.length > 1) {
                                            gradients.push(gradient);
                                        }
                                    }
                                    if (gradients.length) {
                                        boxStyle.backgroundGradient = gradients;
                                    }
                                    else {
                                        const images = [];
                                        pattern = new RegExp($util$2.REGEXP_PATTERN.URL, 'g');
                                        while ((match = pattern.exec(value)) !== null) {
                                            images.push(match[0]);
                                        }
                                        if (images.length) {
                                            boxStyle.backgroundImage = images;
                                        }
                                    }
                                }
                                break;
                            case 'backgroundSize':
                            case 'backgroundRepeat':
                            case 'backgroundPositionX':
                            case 'backgroundPositionY':
                                boxStyle[attr] = value;
                                break;
                        }
                    }
                    const borderTop = JSON.stringify(boxStyle.borderTop);
                    if (borderTop === JSON.stringify(boxStyle.borderRight) && borderTop === JSON.stringify(boxStyle.borderBottom) && borderTop === JSON.stringify(boxStyle.borderLeft)) {
                        boxStyle.border = boxStyle.borderTop;
                    }
                    node.data(Resource.KEY_NAME, 'boxStyle', boxStyle);
                }
            }
        }
        setFontStyle() {
            for (const node of this.cache) {
                const backgroundImage = Resource.hasDrawableBackground(node.data(Resource.KEY_NAME, 'boxStyle'));
                if (!(node.element === null ||
                    node.renderChildren.length ||
                    node.imageElement ||
                    node.svgElement ||
                    node.tagName === 'HR' ||
                    node.inlineText && !backgroundImage && !node.preserveWhiteSpace && node.element.innerHTML.trim() === '')) {
                    const opacity = node.css('opacity');
                    const color = $color.parseRGBA(node.css('color'), opacity);
                    let backgroundColor;
                    if (!(backgroundImage ||
                        node.css('backgroundColor') === node.cssAscend('backgroundColor', false, true) && (node.plainText || node.style.backgroundColor !== node.cssInitial('backgroundColor')) ||
                        node.documentParent.visible && !node.has('backgroundColor') && $dom$1.cssFromParent(node.element, 'backgroundColor'))) {
                        backgroundColor = $color.parseRGBA(node.css('backgroundColor'), opacity);
                    }
                    let fontFamily = node.css('fontFamily');
                    let fontSize = node.css('fontSize');
                    let fontWeight = node.css('fontWeight');
                    if ($dom$1.isUserAgent(8 /* EDGE */) && !node.has('fontFamily')) {
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
                        color: color ? color.valueRGBA : '',
                        backgroundColor: backgroundColor ? backgroundColor.valueRGBA : ''
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
                    if (element.tagName === 'INPUT') {
                        switch (element.type) {
                            case 'text':
                            case 'number':
                            case 'email':
                            case 'search':
                            case 'submit':
                            case 'reset':
                            case 'button':
                                value = element.value.trim();
                                break;
                            default:
                                if (node.companion && !node.companion.visible) {
                                    value = node.companion.textContent.trim();
                                }
                                break;
                        }
                    }
                    else if (element.tagName === 'TEXTAREA') {
                        value = element.value.trim();
                    }
                    else if (node.htmlElement) {
                        if (element.tagName === 'BUTTON') {
                            value = element.innerText;
                        }
                        else if (node.inlineText) {
                            name = node.textContent.trim();
                            if (element.tagName === 'CODE') {
                                value = $xml.replaceEntity(replaceExcluded(element, 'innerHTML'));
                            }
                            else if ($dom$1.hasLineBreak(element, true)) {
                                value = $xml.replaceEntity(replaceExcluded(element, 'innerHTML'))
                                    .replace(/\s*<br[^>]*>\s*/g, '\\n')
                                    .replace(/(<([^>]+)>)/ig, '');
                            }
                            else {
                                value = $xml.replaceEntity(replaceExcluded(element, 'textContent'));
                            }
                            [value, inlineTrim] = replaceWhiteSpace(node, value);
                        }
                        else if (element.innerText.trim() === '' && Resource.hasDrawableBackground(node.data(Resource.KEY_NAME, 'boxStyle'))) {
                            value = $xml.replaceEntity(element.innerText);
                            performTrim = false;
                        }
                    }
                    else if (node.plainText) {
                        name = node.textContent.trim();
                        value = $xml.replaceEntity(node.textContent);
                        value = value.replace(/&[A-Za-z]+;/g, match => match.replace('&', '&amp;'));
                        [value, inlineTrim] = replaceWhiteSpace(node, value);
                    }
                    if (value !== '') {
                        if (performTrim) {
                            const previousSibling = node.previousSiblings().pop();
                            const nextSibling = node.nextSiblings().shift();
                            let previousSpaceEnd = false;
                            if (previousSibling === undefined || previousSibling.multiline || previousSibling.lineBreak || previousSibling.plainText && /\s+$/.test(previousSibling.textContent)) {
                                value = value.replace(/^\s+/, '');
                            }
                            else if (previousSibling.element) {
                                previousSpaceEnd = /\s+$/.test(previousSibling.element.innerText || previousSibling.textContent);
                            }
                            if (inlineTrim) {
                                const original = value;
                                value = value.trim();
                                if (previousSibling && !previousSibling.block && !previousSibling.lineBreak && !previousSpaceEnd && /^\s+/.test(original)) {
                                    value = '&#160;' + value;
                                }
                                if (nextSibling && !nextSibling.lineBreak && /\s+$/.test(original)) {
                                    value += '&#160;';
                                }
                            }
                            else {
                                if (!/^\s+$/.test(value)) {
                                    value = value.replace(/^\s+/, previousSibling && (previousSibling.block ||
                                        previousSibling.lineBreak ||
                                        previousSpaceEnd && previousSibling.htmlElement && previousSibling.textContent.length > 1 ||
                                        node.multiline && $dom$1.hasLineBreak(element)) ? '' : '&#160;');
                                    value = value.replace(/\s+$/, node.display === 'table-cell' || nextSibling && nextSibling.lineBreak || node.blockStatic ? '' : '&#160;');
                                }
                                else if (value.length) {
                                    value = '&#160;' + value.substring(1);
                                }
                            }
                        }
                        if (value !== '') {
                            node.data(Resource.KEY_NAME, 'valueString', { name, value });
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

    const $dom$2 = squared.lib.dom;
    const $util$3 = squared.lib.util;
    const $xml$1 = squared.lib.xml;
    const PREALIGN_DIRECTION = ['top', 'right', 'bottom', 'left'];
    function prioritizeExtensions(documentRoot, element, extensions) {
        const tagged = [];
        let current = element;
        do {
            if (current.dataset.use) {
                for (const value of current.dataset.use.split(',')) {
                    tagged.push(value.trim());
                }
            }
            current = current !== documentRoot ? current.parentElement : null;
        } while (current);
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
            $util$3.spliceArray(result, item => item === undefined);
            result.push(...untagged);
            return result;
        }
        else {
            return extensions;
        }
    }
    function checkPositionStatic(node, parent) {
        const previousSiblings = node.previousSiblings();
        const nextSiblings = node.nextSiblings();
        if ((previousSiblings.length === 0 || !previousSiblings.some(item => item.multiline > 0 || item.excluded && !item.blockStatic)) && (nextSiblings.length === 0 || nextSiblings.every(item => item.blockStatic || item.lineBreak || item.excluded) || parent && node.element === $dom$2.getLastChildElement(parent.element))) {
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
                image: new Map(),
                renderQueue: new Map(),
                excluded: new NodeList(),
            };
            this.processing = {
                cache: new NodeList(),
                depthMap: new Map(),
                node: null,
                layout: null,
                excluded: new NodeList()
            };
            this._renderPosition = new Map();
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
            const rendered = this.rendered;
            for (const node of rendered) {
                if (!node.hasBit('excludeProcedure', NODE_PROCEDURE.LAYOUT)) {
                    node.setLayout();
                }
                if (!node.hasBit('excludeProcedure', NODE_PROCEDURE.ALIGNMENT)) {
                    node.setAlignment();
                }
            }
            for (const node of rendered) {
                if (!node.hasBit('excludeProcedure', NODE_PROCEDURE.OPTIMIZATION)) {
                    node.applyOptimizations();
                }
                if (!node.hasBit('excludeProcedure', NODE_PROCEDURE.CUSTOMIZATION)) {
                    node.applyCustomizations();
                }
            }
            for (const ext of this.extensions) {
                for (const node of ext.subscribers) {
                    ext.postProcedure(node);
                }
            }
            for (const node of this.rendered) {
                if (!node.hasBit('excludeResource', NODE_RESOURCE.BOX_SPACING)) {
                    node.setBoxSpacing();
                }
            }
            for (const ext of this.extensions) {
                ext.afterProcedure();
            }
            this.processRenderQueue();
            this.resourceHandler.finalize(this.sessionData);
            this.controllerHandler.finalize(this.sessionData);
            for (const ext of this.extensions) {
                ext.afterFinalize();
            }
            $dom$2.removeElementsByClassName('__css.placeholder');
            this.closed = true;
        }
        saveAllToDisk() {
            if (this.resourceHandler.fileHandler) {
                this.resourceHandler.fileHandler.saveAllToDisk(this.sessionData);
            }
        }
        reset() {
            this.session.cache.each(node => node.element && $dom$2.deleteElementCache(node.element, 'node', 'style', 'styleMap'));
            for (const element of this.parseElements) {
                delete element.dataset.iteration;
                delete element.dataset.layoutName;
            }
            this.appName = '';
            this.session.renderQueue.clear();
            this.session.image.clear();
            this.session.cache.reset();
            this.session.excluded.reset();
            this.processing.cache.reset();
            this.controllerHandler.reset();
            this.resourceHandler.reset();
            this._views.length = 0;
            this._includes.length = 0;
            this._renderPosition.clear();
            for (const ext of this.extensions) {
                ext.subscribers.clear();
                ext.subscribersChild.clear();
            }
            this.closed = false;
        }
        parseDocument(...elements) {
            let __THEN;
            this.parseElements.clear();
            this.initialized = false;
            this.setStyleMap();
            if (this.appName === '' && elements.length === 0) {
                elements.push(document.body);
            }
            for (const value of elements) {
                const element = typeof value === 'string' ? document.getElementById(value) : value;
                if ($dom$2.hasComputedStyle(element)) {
                    this.parseElements.add(element);
                }
            }
            const documentRoot = this.parseElements.values().next().value;
            const parseResume = () => {
                this.initialized = false;
                if (this.userSettings.preloadImages) {
                    $dom$2.removeElementsByClassName('__css.preload');
                }
                for (const [uri, image] of this.session.image.entries()) {
                    Resource.ASSETS.images.set(uri, image);
                }
                for (const ext of this.extensions) {
                    ext.beforeParseDocument();
                }
                for (const element of this.parseElements) {
                    if (this.appName === '') {
                        this.appName = element.id || 'untitled';
                    }
                    let filename = $util$3.trimNull(element.dataset.filename).replace(new RegExp(`\.${this.controllerHandler.localSettings.layout.fileExtension}$`), '');
                    if (filename === '') {
                        filename = element.id || `document_${this.size}`;
                    }
                    const iteration = parseInt(element.dataset.iteration || '0') + 1;
                    element.dataset.iteration = iteration.toString();
                    element.dataset.layoutName = $util$3.convertWord(iteration > 1 ? `${filename}_${iteration}` : filename, true);
                    if (this.createCache(element)) {
                        this.setBaseLayout();
                        this.setConstraints();
                        this.setResources();
                    }
                }
                for (const ext of this.extensions) {
                    for (const node of ext.subscribers) {
                        ext.postParseDocument(node);
                    }
                }
                for (const ext of this.extensions) {
                    ext.afterParseDocument();
                }
                if (typeof __THEN === 'function') {
                    __THEN.call(this);
                }
            };
            if (this.userSettings.preloadImages) {
                for (const element of this.parseElements) {
                    element.querySelectorAll('svg image').forEach((image) => {
                        const uri = $util$3.resolvePath(image.href.baseVal);
                        this.session.image.set(uri, {
                            width: image.width.baseVal.value,
                            height: image.height.baseVal.value,
                            uri
                        });
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
                            element.className = '__css.preload';
                            documentRoot.appendChild(element);
                        }
                    }
                }
            }
            const images = [];
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
            if (images.length === 0) {
                parseResume();
            }
            else {
                this.initialized = true;
                Promise.all($util$3.objectMap(images, image => new Promise((resolve, reject) => {
                    image.onload = resolve;
                    image.onerror = reject;
                })))
                    .then((result) => {
                    if (Array.isArray(result)) {
                        for (const item of result) {
                            this.addImagePreload(item.target);
                        }
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
                this.saveRenderPosition(layout.node, layout.renderPosition);
                return this.controllerHandler.renderNodeGroup(layout);
            }
        }
        renderLayout(layout) {
            let output = '';
            const floating = $util$3.hasBit(layout.renderType, 64 /* FLOAT */);
            if (floating && $util$3.hasBit(layout.renderType, 8 /* HORIZONTAL */)) {
                output = this.processFloatHorizontal(layout);
            }
            else if (floating && $util$3.hasBit(layout.renderType, 16 /* VERTICAL */)) {
                output = this.processFloatVertical(layout);
            }
            else if (layout.containerType !== 0) {
                output = this.renderNode(layout);
            }
            return output;
        }
        addLayoutFile(filename, content, pathname, documentRoot = false) {
            pathname = pathname || this.controllerHandler.localSettings.layout.pathName;
            const layout = {
                pathname,
                filename,
                content
            };
            if (documentRoot && this._views.length && this._views[0].content === '') {
                this._views[0] = layout;
            }
            else {
                this._views.push(layout);
            }
            this.processing.layout = layout;
        }
        addIncludeFile(filename, content) {
            this._includes.push({
                filename,
                content,
                pathname: this.controllerHandler.localSettings.layout.pathName
            });
        }
        addRenderTemplate(parent, node, output, group = false) {
            if (output !== '') {
                if (group) {
                    node.renderChildren.some((item) => {
                        for (const templates of this.processing.depthMap.values()) {
                            const key = item.renderPositionId;
                            const value = templates.get(key);
                            if (value) {
                                const indent = node.renderDepth + 1;
                                if (item.renderDepth !== indent) {
                                    templates.set(key, this.controllerHandler.replaceIndent(value, indent, this.processing.cache.children));
                                }
                                return true;
                            }
                        }
                        return false;
                    });
                }
                if (!this.parseElements.has(node.element)) {
                    if (node.dataset.target) {
                        const target = document.getElementById(node.dataset.target);
                        if (target && target !== parent.element) {
                            this.addRenderQueue(node.dataset.target, output);
                            node.positioned = true;
                            return;
                        }
                    }
                    else if (parent.dataset.target) {
                        const target = document.getElementById(parent.dataset.target);
                        if (target) {
                            this.addRenderQueue(parent.controlId, output);
                            node.dataset.target = parent.controlId;
                            return;
                        }
                    }
                }
                if (!this.processing.depthMap.has(parent.id)) {
                    this.processing.depthMap.set(parent.id, new Map());
                }
                const template = this.processing.depthMap.get(parent.id);
                if (template) {
                    template.set(node.renderPositionId, output);
                }
            }
        }
        addRenderQueue(id, template) {
            const items = this.session.renderQueue.get(id) || [];
            items.push(template);
            this.session.renderQueue.set(id, items);
        }
        addImagePreload(element) {
            if (element && element.complete && $util$3.hasValue(element.src)) {
                this.session.image.set(element.src, {
                    width: element.naturalWidth,
                    height: element.naturalHeight,
                    uri: element.src
                });
            }
        }
        saveRenderPosition(parent, required) {
            let children;
            if (parent.groupParent) {
                const baseParent = parent.parent;
                if (baseParent) {
                    const id = baseParent.id;
                    const mapParent = this._renderPosition.get(id);
                    let revised;
                    if (mapParent) {
                        const previous = $util$3.filterArray(mapParent.children, item => !parent.contains(item));
                        if (parent.siblingIndex < previous.length) {
                            previous.splice(parent.siblingIndex, 0, parent);
                            for (let i = parent.siblingIndex + 1; i < previous.length; i++) {
                                previous[i].siblingIndex = i;
                            }
                            revised = previous;
                        }
                        else {
                            parent.siblingIndex = previous.length;
                            previous.push(parent);
                        }
                        this._renderPosition.set(id, { parent: baseParent, children: previous });
                    }
                    else {
                        revised = baseParent.children;
                    }
                    if (revised) {
                        for (let i = parent.siblingIndex + 1; i < revised.length; i++) {
                            if (revised[i]) {
                                revised[i].siblingIndex = i;
                            }
                        }
                    }
                }
            }
            if (required) {
                const renderMap = this._renderPosition.get(parent.id);
                if (renderMap) {
                    children = $util$3.filterArray(renderMap.children, item => !parent.contains(item));
                    children.push(...parent.children);
                }
                else {
                    children = parent.duplicate();
                }
                this._renderPosition.set(parent.id, { parent, children });
            }
        }
        createNode(element) {
            return new this.nodeConstructor(this.nextId, element, this.controllerHandler.afterInsertNode);
        }
        toString() {
            return this._views.length ? this._views[0].content : '';
        }
        createCache(documentRoot) {
            const elements = (() => {
                if (documentRoot === document.body) {
                    for (let i = 0, j = 0; i < document.body.childNodes.length; i++) {
                        if (this.conditionElement(document.body.childNodes[i]) && ++j > 1) {
                            return document.querySelectorAll('body, body *');
                        }
                    }
                    return document.querySelectorAll('body *');
                }
                else {
                    return documentRoot.querySelectorAll('*');
                }
            })();
            this.processing.cache.afterAppend = undefined;
            this.processing.cache.clear();
            this.processing.excluded.clear();
            this.processing.node = null;
            const extensions = Array.from(this.extensions);
            for (const ext of extensions) {
                ext.beforeInit(documentRoot);
            }
            const rootNode = this.insertNode(documentRoot);
            if (rootNode) {
                rootNode.parent = new this.nodeConstructor(0, documentRoot.parentElement || document.body, this.controllerHandler.afterInsertNode);
                rootNode.documentRoot = true;
                rootNode.documentParent = rootNode.parent;
                this.processing.node = rootNode;
            }
            else {
                return false;
            }
            const localSettings = this.controllerHandler.localSettings;
            elements.forEach((element) => {
                if (!this.parseElements.has(element)) {
                    prioritizeExtensions(documentRoot, element, extensions).some(item => item.init(element));
                    if (!this.parseElements.has(element) && !(localSettings.unsupported.tagName.has(element.tagName) || element.tagName === 'INPUT' && localSettings.unsupported.tagName.has(`${element.tagName}:${element.type}`))) {
                        let valid = true;
                        let current = element.parentElement;
                        while (current && current !== documentRoot) {
                            if (this.parseElements.has(current)) {
                                valid = false;
                                break;
                            }
                            current = current.parentElement;
                        }
                        if (valid) {
                            this.insertNode(element);
                        }
                    }
                }
            });
            if (this.processing.cache.length) {
                for (const node of this.processing.cache) {
                    if (node.htmlElement && node.tagName !== 'SELECT') {
                        const plainText = [];
                        let valid = false;
                        node.element.childNodes.forEach((element) => {
                            if (element.nodeName === '#text') {
                                plainText.push(element);
                            }
                            else if (element.tagName !== 'BR') {
                                const item = $dom$2.getElementAsNode(element);
                                if (item && !item.excluded) {
                                    valid = true;
                                }
                            }
                        });
                        if (valid) {
                            for (const element of plainText) {
                                this.insertNode(element, node);
                            }
                        }
                    }
                }
                const preAlignment = {};
                const direction = new Set();
                for (const node of this.processing.cache) {
                    if (node.styleElement) {
                        const element = node.element;
                        const reset = {};
                        if (element.tagName !== 'BUTTON' && element.type !== 'button') {
                            const value = node.css('textAlign');
                            switch (value) {
                                case 'center':
                                case 'right':
                                case 'end':
                                    reset.textAlign = value;
                                    element.style.textAlign = 'left';
                                    break;
                            }
                        }
                        if (node.positionRelative && !node.positionStatic) {
                            for (const attr of PREALIGN_DIRECTION) {
                                if (node.has(attr)) {
                                    reset[attr] = node.css(attr);
                                    element.style[attr] = 'auto';
                                }
                            }
                        }
                        if (element.dir === 'rtl') {
                            element.dir = 'ltr';
                            direction.add(element);
                        }
                        preAlignment[node.id] = reset;
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
                        const reset = preAlignment[node.id];
                        if (reset) {
                            const element = node.element;
                            for (const attr in reset) {
                                element.style[attr] = reset[attr];
                            }
                            if (direction.has(element)) {
                                element.dir = 'rtl';
                            }
                        }
                    }
                }
                for (const node of this.processing.cache) {
                    if (!node.documentRoot) {
                        let parent = node.actualParent;
                        switch (node.position) {
                            case 'fixed': {
                                if (!node.positionAuto) {
                                    parent = rootNode;
                                    break;
                                }
                            }
                            case 'absolute': {
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
                                        else if (outside) {
                                            if (parent.documentRoot || parent.css('overflow') === 'hidden' || node.withinX(parent.box) && node.withinY(parent.box)) {
                                                documentParent = parent;
                                                break;
                                            }
                                        }
                                        parent = parent.actualParent;
                                    }
                                    if (documentParent) {
                                        parent = documentParent;
                                    }
                                    break;
                                }
                                else {
                                    parent = node.absoluteParent;
                                }
                            }
                        }
                        if (!node.pageFlow && (parent === undefined || parent.id === 0)) {
                            parent = rootNode;
                        }
                        if (parent) {
                            node.parent = parent;
                            node.documentParent = parent;
                        }
                        else {
                            node.hide();
                        }
                    }
                }
                for (const node of this.processing.cache) {
                    if (node.htmlElement && node.length) {
                        let i = 0;
                        node.element.childNodes.forEach((element) => {
                            const item = $dom$2.getElementAsNode(element);
                            if (item && !item.excluded && (item.pageFlow || item.documentParent === node)) {
                                item.siblingIndex = i++;
                            }
                        });
                        const layers = [];
                        node.each((item) => {
                            if (item.siblingIndex === Number.POSITIVE_INFINITY) {
                                for (const adjacent of node.children) {
                                    if (adjacent.actualChildren.includes(item) || item.ascend().some(child => adjacent.cascade().includes(child))) {
                                        let index = -1;
                                        if (item.zIndex >= 0 || adjacent !== item.actualParent) {
                                            index = adjacent.siblingIndex + 1;
                                        }
                                        else {
                                            index = adjacent.siblingIndex - 1;
                                        }
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
                $util$3.sortArray(this.processing.cache.children, true, 'depth', 'id');
                for (const ext of extensions) {
                    ext.afterInit(documentRoot);
                }
                return true;
            }
            return false;
        }
        setBaseLayout() {
            const settings = this.userSettings;
            const localSettings = this.controllerHandler.localSettings;
            const extensions = [];
            for (const item of this.extensions) {
                if (!item.eventOnly) {
                    extensions.push(item);
                }
            }
            const documentRoot = this.processing.node;
            const mapY = new Map();
            let baseTemplate = localSettings.baseTemplate;
            let empty = true;
            function setMapY(depth, id, node) {
                const index = mapY.get(depth) || new Map();
                index.set(id, node);
                mapY.set(depth, index);
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
                this.processing.depthMap.clear();
                for (const parent of depth.values()) {
                    if (parent.length === 0 || parent.every(node => node.rendered)) {
                        continue;
                    }
                    const axisY = parent.duplicate();
                    const hasFloat = axisY.some(node => node.floating);
                    const cleared = hasFloat ? NodeList.clearedAll(parent) : new Map();
                    const extensionsParent = parent.renderExtension.size ? Array.from(parent.renderExtension) : [];
                    const extensionsChild = $util$3.filterArray(extensions, item => item.subscribersChild.size > 0);
                    let k = -1;
                    while (++k < axisY.length) {
                        let nodeY = axisY[k];
                        if (nodeY.rendered || !nodeY.visible) {
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
                        const extendable = nodeY.hasAlign(8192 /* EXTENDABLE */);
                        let parentY = nodeY.parent;
                        let unknownParent = parentY.hasAlign(2 /* UNKNOWN */);
                        if (axisY.length > 1 && k < axisY.length - 1 && nodeY.pageFlow && (parentY.alignmentType === 0 || extendable || unknownParent) && !parentY.hasAlign(4 /* AUTO_LAYOUT */) && !nodeY.hasBit('excludeSection', APP_SECTION.DOM_TRAVERSE)) {
                            const horizontal = [];
                            const vertical = [];
                            const floatSegment = new Set();
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
                                for (; l < axisY.length; l++, m++) {
                                    const item = axisY[l];
                                    if (item.pageFlow) {
                                        if (hasFloat) {
                                            const float = cleared.get(item);
                                            if (float) {
                                                if (float === 'both') {
                                                    floatSegment.clear();
                                                }
                                                else {
                                                    floatSegment.delete(float);
                                                }
                                            }
                                            if (item.floating) {
                                                floatSegment.add(item.float);
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
                                                const startNewRow = item.alignedVertically(previousSiblings, [...horizontal, ...vertical, item], cleared, false);
                                                if (startNewRow || settings.floatOverlapDisabled && previous.floating && item.blockStatic && floatSegment.size === 2) {
                                                    if (horizontal.length) {
                                                        if (!settings.floatOverlapDisabled && floatSegment.size && !previous.autoMargin.horizontal && !previousSiblings.some(node => node.lineBreak && !cleared.has(node)) && cleared.get(item) !== 'both') {
                                                            let floatBottom = Number.NEGATIVE_INFINITY;
                                                            $util$3.captureMap(horizontal, node => node.floating, node => floatBottom = Math.max(floatBottom, node.linear.bottom));
                                                            if (!item.floating || item.linear.top < floatBottom) {
                                                                const floated = NodeList.floated(horizontal);
                                                                if (cleared.has(item)) {
                                                                    if (!item.floating && floatSegment.size < 2 && floated.size === 2) {
                                                                        item.alignmentType |= 8192 /* EXTENDABLE */;
                                                                        verticalExtended = true;
                                                                        horizontal.push(item);
                                                                        continue;
                                                                    }
                                                                    break domNested;
                                                                }
                                                                else if (!startNewRow || floated.size === 1 && (!item.floating || floatSegment.has(item.float))) {
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
                                                else {
                                                    if (!checkHorizontal(item)) {
                                                        break domNested;
                                                    }
                                                }
                                            }
                                            else {
                                                if (item.alignedVertically(previousSiblings)) {
                                                    checkVertical(item);
                                                }
                                                else {
                                                    if (!checkHorizontal(item)) {
                                                        break domNested;
                                                    }
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
                                const layout = new Layout(parentY, nodeY, 0, 0, horizontal.length, horizontal);
                                layout.init();
                                result = this.controllerHandler.processTraverseHorizontal(layout, axisY);
                                segEnd = horizontal[horizontal.length - 1];
                            }
                            else if (vertical.length > 1) {
                                const layout = new Layout(parentY, nodeY, 0, 0, vertical.length, vertical);
                                layout.init();
                                result = this.controllerHandler.processTraverseVertical(layout, axisY);
                                segEnd = vertical[vertical.length - 1];
                                if (!segEnd.blockStatic && segEnd !== axisY[axisY.length - 1]) {
                                    segEnd.alignmentType |= 8192 /* EXTENDABLE */;
                                }
                            }
                            if (unknownParent && segEnd === axisY[axisY.length - 1]) {
                                parentY.alignmentType ^= 2 /* UNKNOWN */;
                                unknownParent = false;
                            }
                            if (result) {
                                const layout = result.layout;
                                const output = this.renderLayout(layout);
                                if (output !== '') {
                                    this.addRenderTemplate(parentY, layout.node, output, true);
                                    parentY = nodeY.parent;
                                }
                            }
                        }
                        if (extendable) {
                            nodeY.alignmentType ^= 8192 /* EXTENDABLE */;
                        }
                        if (unknownParent && k === axisY.length - 1) {
                            parentY.alignmentType ^= 2 /* UNKNOWN */;
                        }
                        if (nodeY.renderAs && parentY.appendTry(nodeY, nodeY.renderAs, false)) {
                            nodeY.hide();
                            nodeY = nodeY.renderAs;
                            if (nodeY.positioned) {
                                parentY = nodeY.parent;
                            }
                        }
                        if (!nodeY.rendered && !nodeY.hasBit('excludeSection', APP_SECTION.EXTENSION)) {
                            let next = false;
                            if (extensionsParent.length || extensionsChild.length) {
                                const combined = extensionsParent.slice(0);
                                if (extensionsChild.length) {
                                    combined.push(...$util$3.filterArray(extensionsChild, item => item.subscribersChild.has(nodeY)));
                                }
                                for (const ext of combined) {
                                    const result = ext.processChild(nodeY, parentY);
                                    if (result.output) {
                                        this.addRenderTemplate(parentY, nodeY, result.output);
                                    }
                                    if (result.renderAs && result.outputAs) {
                                        this.addRenderTemplate(parentY, result.renderAs, result.outputAs);
                                    }
                                    if (result.parent) {
                                        parentY = result.parent;
                                    }
                                    next = result.next === true;
                                    if (result.complete || result.next) {
                                        break;
                                    }
                                }
                            }
                            if (next) {
                                continue;
                            }
                            if (nodeY.styleElement) {
                                prioritizeExtensions(documentRoot.element, nodeY.element, extensions).some(item => {
                                    if (item.is(nodeY) && item.condition(nodeY, parentY)) {
                                        const result = item.processNode(nodeY, parentY);
                                        if (result.output) {
                                            this.addRenderTemplate(parentY, nodeY, result.output);
                                        }
                                        if (result.renderAs && result.outputAs) {
                                            this.addRenderTemplate(parentY, result.renderAs, result.outputAs);
                                        }
                                        if (result.parent) {
                                            parentY = result.parent;
                                        }
                                        if (result.output || result.include === true) {
                                            item.subscribers.add(nodeY);
                                            nodeY.renderExtension.add(item);
                                        }
                                        next = result.next === true;
                                        if (result.complete || result.next) {
                                            return true;
                                        }
                                    }
                                    return false;
                                });
                                if (next) {
                                    continue;
                                }
                            }
                        }
                        if (!nodeY.rendered && !nodeY.hasBit('excludeSection', APP_SECTION.RENDER)) {
                            let layout = new Layout(parentY, nodeY, nodeY.containerType, nodeY.alignmentType, nodeY.length, nodeY.children);
                            if (layout.containerType === 0) {
                                let result;
                                if (nodeY.length) {
                                    result = this.controllerHandler.processUnknownParent(layout);
                                }
                                else {
                                    result = this.controllerHandler.processUnknownChild(layout);
                                }
                                if (result.next === true) {
                                    continue;
                                }
                                else if (result.renderAs) {
                                    axisY[k] = result.renderAs;
                                    k--;
                                    continue;
                                }
                                else {
                                    layout = result.layout;
                                }
                            }
                            const output = this.renderLayout(layout);
                            if (output !== '') {
                                this.addRenderTemplate(parentY, nodeY, output);
                            }
                        }
                    }
                }
                for (const [id, templates] of this.processing.depthMap.entries()) {
                    const position = this._renderPosition.get(id);
                    let children;
                    if (position) {
                        children = this.controllerHandler.sortRenderPosition(position.parent, position.children);
                    }
                    else if (id !== 0) {
                        const parent = this.processing.cache.find('id', id);
                        if (parent) {
                            children = this.controllerHandler.sortRenderPosition(parent, parent.children);
                        }
                    }
                    if (children && children.length) {
                        const sorted = new Map();
                        for (const node of children) {
                            const key = node.renderPositionId;
                            const result = templates.get(key) || (node.companion ? templates.get(node.companion.renderPositionId) : null);
                            if (result) {
                                sorted.set(key, result);
                            }
                        }
                        if (sorted.size === templates.size) {
                            this.processing.depthMap.set(id, sorted);
                        }
                    }
                }
                for (const ext of this.extensions) {
                    ext.afterDepthLevel();
                }
                for (const [id, templates] of this.processing.depthMap.entries()) {
                    for (const [key, view] of templates.entries()) {
                        const hash = $xml$1.formatPlaceholder(key.indexOf('^') !== -1 ? key : id);
                        if (baseTemplate.indexOf(hash) !== -1) {
                            baseTemplate = $xml$1.replacePlaceholder(baseTemplate, hash, view);
                            empty = false;
                        }
                        else {
                            this.addRenderQueue(key.indexOf('^') !== -1 ? `${id}|${key}` : id.toString(), view);
                        }
                    }
                }
            }
            if (documentRoot.dataset.layoutName && (!$util$3.hasValue(documentRoot.dataset.target) || documentRoot.renderExtension.size === 0)) {
                this.addLayoutFile(documentRoot.dataset.layoutName, !empty ? baseTemplate : '', $util$3.trimString($util$3.trimNull(documentRoot.dataset.pathname), '/'), documentRoot.renderExtension.size > 0 && $util$3.hasInSet(documentRoot.renderExtension, item => item.documentRoot));
            }
            if (empty && documentRoot.renderExtension.size === 0) {
                documentRoot.hide();
            }
            this.processing.cache.sort((a, b) => {
                if (!a.visible || !a.rendered) {
                    return 1;
                }
                else if (a.renderDepth !== b.renderDepth) {
                    return a.renderDepth < b.renderDepth ? -1 : 1;
                }
                else if (a.renderParent !== b.renderParent) {
                    return a.documentParent.id < b.documentParent.id ? -1 : 1;
                }
                else {
                    return a.siblingIndex < b.siblingIndex ? -1 : 1;
                }
            });
            this.session.cache.children.push(...this.processing.cache);
            this.session.excluded.children.push(...this.processing.excluded);
            for (const ext of this.extensions) {
                for (const node of ext.subscribers) {
                    ext.postBaseLayout(node);
                }
            }
            for (const ext of this.extensions) {
                ext.afterBaseLayout();
            }
        }
        setConstraints() {
            this.controllerHandler.setConstraints();
            for (const ext of this.extensions) {
                for (const node of ext.subscribers) {
                    ext.postConstraints(node);
                }
            }
            for (const ext of this.extensions) {
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
        processRenderQueue() {
            const template = {};
            for (const [id, templates] of this.session.renderQueue.entries()) {
                const [parentId, positionId] = id.split('|');
                let replaceId = parentId;
                if (!$util$3.isNumber(replaceId)) {
                    const element = document.getElementById(replaceId);
                    if (element) {
                        const target = $dom$2.getElementAsNode(element);
                        if (target) {
                            replaceId = target.id.toString();
                        }
                    }
                }
                let output = templates.join('\n');
                if (replaceId !== parentId) {
                    const target = this.session.cache.find('id', parseInt(replaceId));
                    if (target) {
                        output = this.controllerHandler.replaceIndent(output, target.renderDepth + 1, this.session.cache.children);
                    }
                }
                template[positionId || replaceId] = output;
            }
            for (const view of this.viewData) {
                for (const id in template) {
                    view.content = view.content.replace($xml$1.formatPlaceholder(id), template[id]);
                }
                view.content = this.controllerHandler.replaceRenderQueue(view.content);
            }
        }
        processFloatHorizontal(data) {
            const settings = this.userSettings;
            let layerIndex = [];
            let output = '';
            if (data.cleared.size === 0 && !data.some(node => node.autoMargin.horizontal)) {
                const inline = [];
                const left = [];
                const right = [];
                for (const node of data) {
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
                const layout = new Layout(data.parent, data.node, 0, 0, data.itemCount, data.children);
                layout.init();
                if (inline.length === layout.itemCount || left.length === layout.itemCount || right.length === layout.itemCount) {
                    this.controllerHandler.processLayoutHorizontal(layout);
                    return this.renderNode(layout);
                }
                else if ((left.length === 0 || right.length === 0) && (this.userSettings.floatOverlapDisabled || !inline.some(item => item.blockStatic))) {
                    const subgroup = [];
                    if (right.length === 0) {
                        subgroup.push(...left, ...inline);
                        const horizontal = this.controllerHandler.containerTypeHorizontal;
                        layout.setType(horizontal.containerType, horizontal.alignmentType);
                        layerIndex = [left, inline];
                    }
                    else {
                        subgroup.push(...inline, ...right);
                        const vertical = this.controllerHandler.containerTypeVerticalMargin;
                        layout.setType(vertical.containerType, vertical.alignmentType);
                        layerIndex = [inline, right];
                    }
                    layout.retain(subgroup);
                    output = this.renderNode(layout);
                }
            }
            const inlineAbove = [];
            const inlineBelow = [];
            const leftAbove = [];
            const rightAbove = [];
            const leftBelow = [];
            const rightBelow = [];
            let leftSub = [];
            let rightSub = [];
            if (layerIndex.length === 0) {
                let current = '';
                let pendingFloat = 0;
                for (let i = 0; i < data.length; i++) {
                    const node = data.item(i);
                    const direction = data.cleared.get(node);
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
                            if (!settings.floatOverlapDisabled && current !== 'right' && rightAbove.length) {
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
                            if (!settings.floatOverlapDisabled && current !== 'left' && leftAbove.length) {
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
                const layout = new Layout(data.parent, data.node, 0, rightAbove.length + rightBelow.length === data.length ? 512 /* RIGHT */ : 0);
                if (settings.floatOverlapDisabled) {
                    if (data.node.groupParent && data.parent.layoutVertical) {
                        data.node.alignmentType |= layout.alignmentType;
                        output = $xml$1.formatPlaceholder(data.node.id);
                        data.node.render(data.parent);
                        data.node.renderDepth--;
                    }
                    else {
                        const vertical = this.controllerHandler.containerTypeVertical;
                        layout.setType(vertical.containerType, vertical.alignmentType);
                        output = this.renderNode(layout);
                    }
                    if (inlineAbove.length) {
                        layerIndex.push(inlineAbove);
                    }
                    if (leftAbove.length || rightAbove.length) {
                        layerIndex.push([leftAbove, rightAbove]);
                    }
                    if (leftBelow.length || rightBelow.length) {
                        layerIndex.push([leftBelow, rightBelow]);
                    }
                    if (inlineBelow.length) {
                        layerIndex.push(inlineBelow);
                    }
                    layout.itemCount = layerIndex.length;
                }
                else {
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
                    const vertical = inlineAbove.length === 0 && (leftSub.length === 0 || rightSub.length === 0) ? this.controllerHandler.containerTypeVertical : this.controllerHandler.containerTypeVerticalMargin;
                    layout.setType(vertical.containerType, vertical.alignmentType);
                    output = this.renderNode(layout);
                }
            }
            if (layerIndex.length) {
                const floating = [inlineAbove, leftAbove, leftBelow, rightAbove, rightBelow];
                let floatgroup;
                for (let i = 0; i < layerIndex.length; i++) {
                    const item = layerIndex[i];
                    let segments;
                    if (Array.isArray(item[0])) {
                        segments = item;
                        const grouping = [];
                        for (const seg of segments) {
                            grouping.push(...seg);
                        }
                        grouping.sort(NodeList.siblingIndex);
                        floatgroup = this.controllerHandler.createNodeGroup(grouping[0], grouping, data.node);
                        const layout = new Layout(data.node, floatgroup, 0, segments.some(seg => seg === rightSub || seg === rightAbove) ? 512 /* RIGHT */ : 0, segments.length);
                        let vertical;
                        if (settings.floatOverlapDisabled) {
                            vertical = this.controllerHandler.containerTypeVerticalMargin;
                        }
                        else {
                            if (data.node.layoutVertical) {
                                floatgroup = data.node;
                            }
                            else {
                                vertical = this.controllerHandler.containerTypeVertical;
                            }
                        }
                        if (vertical) {
                            layout.setType(vertical.containerType, vertical.alignmentType);
                            output = $xml$1.replacePlaceholder(output, data.node.id, this.renderNode(layout));
                        }
                    }
                    else {
                        segments = [item];
                        floatgroup = undefined;
                    }
                    for (const seg of segments) {
                        let basegroup = data.node;
                        if (floatgroup && floating.includes(seg)) {
                            basegroup = floatgroup;
                        }
                        let target;
                        if (seg.length > 1) {
                            target = this.controllerHandler.createNodeGroup(seg[0], seg, basegroup);
                            const layout = new Layout(basegroup, target, 0, 128 /* SEGMENTED */, seg.length, seg);
                            if (layout.linearY) {
                                const vertical = this.controllerHandler.containerTypeVertical;
                                layout.setType(vertical.containerType, vertical.alignmentType);
                            }
                            else {
                                layout.init();
                                this.controllerHandler.processLayoutHorizontal(layout);
                            }
                            output = $xml$1.replacePlaceholder(output, basegroup.id, this.renderNode(layout));
                        }
                        else if (seg.length) {
                            target = seg[0];
                            target.alignmentType |= 2048 /* SINGLE */;
                            target.renderPosition = i;
                            output = $xml$1.replacePlaceholder(output, basegroup.id, $xml$1.formatPlaceholder(target.renderPositionId));
                        }
                        if (!settings.floatOverlapDisabled && target && seg === inlineAbove && seg.some(subitem => subitem.blockStatic && !subitem.hasWidth)) {
                            const vertical = this.controllerHandler.containerTypeVertical;
                            const targeted = target.of(vertical.containerType, vertical.alignmentType) ? target.children : [target];
                            if (leftAbove.length) {
                                let marginRight = Number.NEGATIVE_INFINITY;
                                let boundsLeft = Number.POSITIVE_INFINITY;
                                for (const child of leftAbove) {
                                    marginRight = Math.max(marginRight, child.linear.right);
                                }
                                for (const child of seg) {
                                    boundsLeft = Math.min(boundsLeft, child.bounds.left);
                                }
                                for (const child of targeted) {
                                    child.modifyBox(256 /* PADDING_LEFT */, marginRight - boundsLeft);
                                }
                            }
                            if (rightAbove.length) {
                                let marginLeft = Number.POSITIVE_INFINITY;
                                let boundsRight = Number.NEGATIVE_INFINITY;
                                for (const child of rightAbove) {
                                    marginLeft = Math.min(marginLeft, child.linear.left);
                                }
                                for (const child of seg) {
                                    boundsRight = Math.max(boundsRight, child.bounds.right);
                                }
                                for (const child of targeted) {
                                    child.modifyBox(64 /* PADDING_RIGHT */, boundsRight - marginLeft);
                                }
                            }
                        }
                    }
                }
            }
            return output;
        }
        processFloatVertical(data) {
            const controller = this.controllerHandler;
            const vertical = controller.containerTypeVertical;
            const group = data.node;
            const layoutGroup = new Layout(data.parent, group, vertical.containerType, vertical.alignmentType, data.length);
            let output = this.renderNode(layoutGroup);
            const staticRows = [];
            const floatedRows = [];
            const current = [];
            const floated = [];
            let clearReset = false;
            let blockArea = false;
            let layoutVertical = true;
            for (const node of data) {
                if (node.blockStatic && floated.length === 0) {
                    current.push(node);
                    blockArea = true;
                }
                else {
                    if (data.cleared.has(node)) {
                        if (!node.floating) {
                            node.modifyBox(2 /* MARGIN_TOP */, null);
                            staticRows.push(current.slice(0));
                            current.length = 0;
                            floatedRows.push(floated.slice(0));
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
                        if (clearReset && !data.cleared.has(node)) {
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
                let xml = '';
                for (let i = 0; i < Math.max(floatedRows.length, staticRows.length); i++) {
                    const pageFlow = staticRows[i] || [];
                    if (floatedRows[i] === null && pageFlow.length) {
                        if (pageFlow.length > 1) {
                            const layoutType = controller.containerTypeVertical;
                            layoutType.alignmentType |= 128 /* SEGMENTED */;
                            const layout = new Layout(group, controller.createNodeGroup(pageFlow[0], pageFlow, group), layoutType.containerType, layoutType.alignmentType, pageFlow.length, pageFlow);
                            xml += this.renderNode(layout);
                        }
                        else {
                            const single = pageFlow[0];
                            single.alignmentType |= 2048 /* SINGLE */;
                            single.renderPosition = i;
                            output = $xml$1.replacePlaceholder(output, group.id, $xml$1.formatPlaceholder(single.renderPositionId));
                        }
                    }
                    else {
                        const floating = floatedRows[i] || [];
                        if (pageFlow.length || floating.length) {
                            const basegroup = controller.createNodeGroup(floating[0] || pageFlow[0], [], group);
                            const verticalMargin = controller.containerTypeVerticalMargin;
                            const layout = new Layout(group, basegroup, verticalMargin.containerType, verticalMargin.alignmentType);
                            const children = [];
                            let subgroup;
                            if (floating.length) {
                                if (floating.length > 1) {
                                    subgroup = controller.createNodeGroup(floating[0], floating, basegroup);
                                    layout.add(64 /* FLOAT */);
                                    if (pageFlow.length === 0 && floating.every(item => item.float === 'right')) {
                                        layout.add(512 /* RIGHT */);
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
                            layout.itemCount = children.length;
                            xml += this.renderNode(layout);
                            for (const node of children) {
                                if (data.contains(node) || node.length === 0) {
                                    xml = $xml$1.replacePlaceholder(xml, basegroup.id, $xml$1.formatPlaceholder(node.id));
                                }
                                else {
                                    const layoutSegment = new Layout(basegroup, node, vertical.containerType, vertical.alignmentType | 128 /* SEGMENTED */, node.length, node.children);
                                    xml = $xml$1.replacePlaceholder(xml, basegroup.id, this.renderNode(layoutSegment));
                                }
                            }
                        }
                    }
                }
                output = $xml$1.replacePlaceholder(output, group.id, xml);
            }
            return output;
        }
        insertNode(element, parent) {
            let node;
            if (element.nodeName.charAt(0) === '#' && element.nodeName === '#text') {
                if ($dom$2.isPlainText(element, true) || $dom$2.cssParent(element, 'whiteSpace', 'pre', 'pre-wrap')) {
                    node = this.createNode(element);
                    if (parent) {
                        node.inherit(parent, 'textStyle');
                    }
                    else {
                        node.css('whiteSpace', $dom$2.getStyle(element.parentElement).whiteSpace || 'normal');
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
            else if (element.parentElement instanceof HTMLElement) {
                node = this.createNode(element);
                if (!this.controllerHandler.localSettings.unsupported.excluded.has(element.tagName) && this.conditionElement(element)) {
                    node.setExclusions();
                }
                else {
                    node.visible = false;
                    node.excluded = true;
                    this.processing.excluded.append(node);
                    return undefined;
                }
            }
            if (node) {
                this.processing.cache.append(node);
            }
            return node;
        }
        conditionElement(element) {
            if ($dom$2.hasComputedStyle(element)) {
                if ($dom$2.hasVisibleRect(element, true) || $util$3.hasValue(element.dataset.use)) {
                    return true;
                }
                else {
                    let current = element.parentElement;
                    let valid = true;
                    while (current) {
                        if ($dom$2.getStyle(current).display === 'none') {
                            valid = false;
                            break;
                        }
                        current = current.parentElement;
                    }
                    if (valid) {
                        for (let i = 0; i < element.children.length; i++) {
                            if ($dom$2.hasVisibleRect(element.children[i], true)) {
                                return true;
                            }
                        }
                    }
                    return false;
                }
            }
            else {
                return $dom$2.isPlainText(element);
            }
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
                                                        valid = compareRange(operation, attr.indexOf('width') !== -1 ? window.innerWidth : window.innerHeight, parseFloat($util$3.convertPX(value, $util$3.convertInt($dom$2.getStyle(document.body).fontSize))));
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
                                                        valid = compareRange(operation, $dom$2.getDeviceDPI(), resolution);
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
            const clientFirefox = $dom$2.isUserAgent(16 /* FIREFOX */);
            const fromRule = [];
            for (const attr of Array.from(item.style)) {
                fromRule.push($util$3.convertCamelCase(attr));
            }
            document.querySelectorAll(item.selectorText).forEach((element) => {
                const style = $dom$2.getStyle(element);
                const fontSize = parseInt($util$3.convertPX(style.fontSize, 0));
                const styleMap = {};
                for (const attr of fromRule) {
                    const value = $dom$2.checkStyleAttribute(element, attr, item.style[attr], style, fontSize);
                    if (value !== '') {
                        styleMap[attr] = value;
                    }
                }
                if (this.userSettings.preloadImages && $util$3.hasValue(styleMap.backgroundImage) && styleMap.backgroundImage !== 'initial') {
                    for (const value of styleMap.backgroundImage.split(',')) {
                        const uri = $dom$2.cssResolveUrl(value.trim());
                        if (uri !== '' && !this.session.image.has(uri)) {
                            this.session.image.set(uri, { width: 0, height: 0, uri });
                        }
                    }
                }
                if (clientFirefox && styleMap.display === undefined) {
                    switch (element.tagName) {
                        case 'INPUT':
                        case 'TEXTAREA':
                        case 'SELECT':
                        case 'BUTTON':
                            styleMap.display = 'inline-block';
                            break;
                    }
                }
                const data = $dom$2.getElementCache(element, 'styleMap');
                if (data) {
                    Object.assign(data, styleMap);
                }
                else {
                    $dom$2.setElementCache(element, 'style', style);
                    $dom$2.setElementCache(element, 'styleMap', styleMap);
                }
            });
        }
        set appName(value) {
            if (this.resourceHandler.fileHandler) {
                this.resourceHandler.fileHandler.appName = value;
            }
        }
        get appName() {
            return this.resourceHandler.fileHandler ? this.resourceHandler.fileHandler.appName : '';
        }
        set userSettings(value) {
            this._userSettings = value;
        }
        get userSettings() {
            return this._userSettings || {};
        }
        get viewData() {
            return [...this._views, ...this._includes];
        }
        get sessionData() {
            return {
                cache: this.session.cache,
                views: this._views,
                includes: this._includes
            };
        }
        get rendered() {
            return this.session.cache.filter(node => node.visible && node.rendered);
        }
        get nextId() {
            return this.processing.cache.nextId;
        }
        get size() {
            return this._views.length + this._includes.length;
        }
    }

    const $xml$2 = squared.lib.xml;
    class Controller {
        constructor(application, cache) {
            this.application = application;
            this.cache = cache;
            this._before = {};
            this._after = {};
        }
        reset() {
            this._before = {};
            this._after = {};
        }
        replaceRenderQueue(output) {
            for (const id in this._before) {
                output = output.replace(`{<${id}}`, this._before[id].join(''));
            }
            for (const id in this._after) {
                output = output.replace(`{>${id}}`, this._after[id].join(''));
            }
            return output;
        }
        prependBefore(id, output, index = -1) {
            if (this._before[id] === undefined) {
                this._before[id] = [];
            }
            if (index !== -1 && index < this._before[id].length) {
                this._before[id].splice(index, 0, output);
            }
            else {
                this._before[id].push(output);
            }
        }
        appendAfter(id, output, index = -1) {
            if (this._after[id] === undefined) {
                this._after[id] = [];
            }
            if (index !== -1 && index < this._after[id].length) {
                this._after[id].splice(index, 0, output);
            }
            else {
                this._after[id].push(output);
            }
        }
        hasAppendProcessing(id) {
            return this._before[id] !== undefined || this._after[id] !== undefined;
        }
        getEnclosingTag(controlName, id, depth, xml = '') {
            const indent = '\t'.repeat(Math.max(0, depth));
            let output = `{<${id}}`;
            if (xml !== '') {
                output += indent + `<${controlName}${depth === 0 ? '{#0}' : ''}{@${id}}>\n` +
                    xml +
                    indent + `</${controlName}>\n`;
            }
            else {
                output += indent + `<${controlName}${depth === 0 ? '{#0}' : ''}{@${id}} />\n`;
            }
            output += `{>${id}}`;
            return output;
        }
        removePlaceholders(value) {
            return value.replace(/{[<:@#>]\d+(\^\d+)?}\n?/g, '').trim();
        }
        replaceIndent(value, depth, cache) {
            value = $xml$2.replaceIndent(value, depth, /^({[^}]+})(\t*)(<.*)/);
            if (cache) {
                const pattern = /{@(\d+)}/g;
                let match;
                let i = 0;
                while ((match = pattern.exec(value)) !== null) {
                    const id = parseInt(match[1]);
                    const node = cache.find(item => item.id === id);
                    if (node) {
                        if (i++ === 0) {
                            node.renderDepth = depth;
                        }
                        else if (node.renderParent) {
                            node.renderDepth = node.renderParent.renderDepth + 1;
                        }
                    }
                }
            }
            return value;
        }
    }

    const $dom$3 = squared.lib.dom;
    const $util$4 = squared.lib.util;
    class Extension {
        constructor(name, framework, tagNames, options) {
            this.name = name;
            this.framework = framework;
            this.tagNames = [];
            this.documentRoot = false;
            this.eventOnly = false;
            this.preloaded = false;
            this.options = {};
            this.dependencies = [];
            this.subscribers = new Set();
            this.subscribersChild = new Set();
            if (Array.isArray(tagNames)) {
                this.tagNames = $util$4.replaceMap(tagNames, value => value.trim().toUpperCase());
            }
            if (options) {
                Object.assign(this.options, options);
            }
        }
        static findNestedByName(element, name) {
            if ($dom$3.hasComputedStyle(element)) {
                for (let i = 0; i < element.children.length; i++) {
                    const item = element.children[i];
                    if ($util$4.includes(item.dataset.use, name)) {
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
            return $util$4.includes(element.dataset.use, this.name);
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
            if ($dom$3.hasComputedStyle(node.element)) {
                const ext = node.dataset.use;
                if (!ext) {
                    return this.tagNames.length > 0;
                }
                else {
                    return this.included(node.element);
                }
            }
            return false;
        }
        processNode(node, parent) {
            return { output: '', complete: false };
        }
        processChild(node, parent) {
            return { output: '', complete: false };
        }
        postBaseLayout(node) { }
        postConstraints(node) { }
        postParseDocument(node) { }
        postProcedure(node) { }
        beforeParseDocument() { }
        afterDepthLevel() { }
        afterBaseLayout() { }
        afterConstraints() { }
        afterResources() { }
        afterParseDocument() { }
        afterProcedure() { }
        afterFinalize() { }
        set application(value) {
            this._application = value;
        }
        get application() {
            return this._application || {};
        }
        get installed() {
            return this.application.extensions ? this.application.extensions.has(this) : false;
        }
    }

    const $util$5 = squared.lib.util;
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
                if ((ext.framework === 0 || $util$5.hasBit(ext.framework, this.application.framework)) && ext.dependencies.every(item => !!this.retrieve(item.name))) {
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

    const $util$6 = squared.lib.util;
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
            if (content !== '' || uri !== '') {
                const index = this.assets.findIndex(item => item.pathname === pathname && item.filename === filename);
                if (index !== -1) {
                    this.assets[index].content = content || '';
                    this.assets[index].uri = uri || '';
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
        saveToDisk(files) {
            if (!location.protocol.startsWith('http')) {
                alert('SERVER (required): See README for instructions');
                return;
            }
            if (files.length) {
                const settings = this.userSettings;
                files.push(...this.assets);
                fetch(`/api/savetodisk` +
                    `?directory=${encodeURIComponent($util$6.trimString(settings.outputDirectory, '/'))}` +
                    `&appname=${encodeURIComponent(this.appName.trim())}` +
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
                                .then((blob) => File.downloadToDisk(blob, $util$6.lastIndexOf(result.zipname)));
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

    const $dom$4 = squared.lib.dom;
    const $util$7 = squared.lib.util;
    const INHERIT_ALIGNMENT = ['position', 'top', 'right', 'bottom', 'left', 'display', 'verticalAlign', 'cssFloat', 'clear', 'zIndex'];
    const INHERIT_MARGIN = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'];
    const CSS_SPACING_KEYS = Array.from(CSS_SPACING.keys());
    const CSS_SPACING_VALUES = Array.from(CSS_SPACING.values());
    class Node extends squared.lib.base.Container {
        constructor(id, element) {
            super();
            this.id = id;
            this.alignmentType = 0;
            this.depth = -1;
            this.siblingIndex = Number.POSITIVE_INFINITY;
            this.renderPosition = -1;
            this.documentRoot = false;
            this.visible = true;
            this.excluded = false;
            this.rendered = false;
            this.baselineActive = false;
            this.positioned = false;
            this.renderExtension = new Set();
            this.controlId = '';
            this._cached = {};
            this._styleMap = {};
            this._initial = {
                iteration: -1,
                children: [],
                styleMap: {}
            };
            this._renderDepth = -1;
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
                $dom$4.setElementCache(element, 'node', this);
                this.style = $dom$4.getElementCache(element, 'style') || $dom$4.getStyle(element, false);
            }
            if (this.styleElement) {
                const styleMap = $dom$4.getElementCache(element, 'styleMap') || {};
                const fontSize = $util$7.convertInt(this.style.fontSize);
                for (let attr of Array.from(element.style)) {
                    attr = $util$7.convertCamelCase(attr);
                    const value = $dom$4.checkStyleAttribute(element, attr, element.style[attr], this.style, fontSize);
                    if (value !== '') {
                        styleMap[attr] = value;
                    }
                }
                this._styleMap = styleMap;
            }
        }
        saveAsInitial() {
            if (this._initial.iteration === -1) {
                this._initial.children = this.duplicate();
                this._initial.styleMap = Object.assign({}, this._styleMap);
                this._initial.documentParent = this._documentParent;
            }
            if (this._bounds) {
                this._initial.bounds = $dom$4.assignBounds(this._bounds);
                this._initial.linear = $dom$4.assignBounds(this.linear);
                this._initial.box = $dom$4.assignBounds(this.box);
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
            if ($util$7.hasValue(value)) {
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
                        for (const [key] of $util$7.searchObject(this[name], attr)) {
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
            this.renderDepth = this.documentRoot || this === parent || $util$7.hasValue(parent.dataset.target) ? 0 : parent.renderDepth + 1;
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
            return $util$7.filterArray(this.renderChildren, predicate);
        }
        hide(invisible) {
            this.rendered = true;
            this.visible = false;
        }
        data(obj, attr, value, overwrite = true) {
            if ($util$7.hasValue(value)) {
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
                return $util$7.spliceArray(result, node => node.element === null);
            }
            return result;
        }
        inherit(node, ...props) {
            const initial = node.unsafe('initial');
            for (const type of props) {
                switch (type) {
                    case 'initial':
                        Object.assign(this._initial, initial);
                        break;
                    case 'base':
                        this._documentParent = node.documentParent;
                        this._bounds = $dom$4.assignBounds(node.bounds);
                        this._linear = $dom$4.assignBounds(node.linear);
                        this._box = $dom$4.assignBounds(node.box);
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
                        for (const attr of INHERIT_MARGIN) {
                            if (node.cssInitial(attr) === 'auto') {
                                this._initial.styleMap[attr] = 'auto';
                            }
                            if (node.cssInitial(attr, true) === 'auto') {
                                this._styleMap[attr] = 'auto';
                            }
                        }
                        break;
                    case 'styleMap':
                        $util$7.assignWhenNull(this._styleMap, node.unsafe('styleMap'));
                        break;
                    case 'textStyle':
                        const style = { whiteSpace: node.css('whiteSpace') };
                        for (const attr in node.style) {
                            if (attr.startsWith('font') || attr.startsWith('color')) {
                                const key = $util$7.convertCamelCase(attr);
                                style[key] = node.style[key];
                            }
                        }
                        this.cssApply(style);
                        break;
                }
            }
        }
        alignedVertically(previousSiblings, siblings, cleared, checkFloat = true) {
            if (this.lineBreak) {
                return true;
            }
            if (this.pageFlow && previousSiblings.length) {
                if ($util$7.isArray(siblings) && this !== siblings[0]) {
                    if (cleared && cleared.has(this)) {
                        return true;
                    }
                    if (checkFloat) {
                        const previous = siblings[siblings.length - 1];
                        if (this.floating && (this.linear.top >= previous.linear.bottom || this.float === 'left' && siblings.find(node => node.siblingIndex < this.siblingIndex && $util$7.withinFraction(this.linear.left, node.linear.left)) !== undefined || this.float === 'right' && siblings.find(node => node.siblingIndex < this.siblingIndex && $util$7.withinFraction(this.linear.right, node.linear.right)) !== undefined)) {
                            return true;
                        }
                    }
                }
                const actualParent = this.actualParent;
                for (const previous of previousSiblings) {
                    const vertical = (previous.blockStatic ||
                        this.blockStatic && (!previous.inlineFlow ||
                            !!cleared && cleared.has(previous)) ||
                        !!cleared && cleared.get(previous) === 'both' && (!$util$7.isArray(siblings) || siblings[0] !== previous) ||
                        !previous.floating && (this.blockStatic ||
                            !this.floating && !this.inlineFlow) ||
                        actualParent && previous.bounds.width > (actualParent.has('width', 2 /* UNIT */) ? actualParent.width : actualParent.box.width) && (!previous.textElement ||
                            previous.textElement && previous.css('whiteSpace') === 'nowrap') ||
                        previous.lineBreak ||
                        previous.autoMargin.leftRight ||
                        previous.float === 'left' && this.autoMargin.right ||
                        previous.float === 'right' && this.autoMargin.left);
                    if (vertical) {
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
            if (computed && !$util$7.hasValue(value)) {
                value = this.style[attr];
            }
            return value || '';
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
        cssSort(attr, desc = false, duplicate = false) {
            const children = duplicate ? this.duplicate() : this.children;
            children.sort((a, b) => {
                const valueA = a.toInt(attr);
                const valueB = b.toInt(attr);
                if (valueA === valueB) {
                    return 0;
                }
                if (desc) {
                    return valueA > valueB ? -1 : 1;
                }
                else {
                    return valueA < valueB ? -1 : 1;
                }
            });
            return children;
        }
        cssPX(attr, value, negative = false, cache = false) {
            const current = this._styleMap[attr];
            if (current && $util$7.isUnit(current)) {
                value += parseFloat($util$7.convertPX(current, this.fontSize));
                if (!negative) {
                    value = Math.max(0, value);
                }
                const unit = $util$7.formatPX(value);
                this.css(attr, unit);
                if (cache) {
                    this.unsetCache(attr);
                }
                return unit;
            }
            return '';
        }
        cssTry(attr, value) {
            if (this.styleElement) {
                const element = this._element;
                const current = this.css(attr);
                element.style[attr] = value;
                if (element.style[attr] === value) {
                    $dom$4.setElementCache(element, attr, current);
                    return true;
                }
            }
            return false;
        }
        cssFinally(attr) {
            if (this.styleElement) {
                const element = this._element;
                const value = $dom$4.getElementCache(element, attr);
                if (value) {
                    element.style[attr] = value;
                    $dom$4.deleteElementCache(element, attr);
                    return true;
                }
            }
            return false;
        }
        toInt(attr, initial = false, defaultValue = 0) {
            const value = (initial ? this._initial.styleMap : this._styleMap)[attr];
            return parseInt(value) || defaultValue;
        }
        convertPX(value, horizontal = true, parent = true) {
            return this.convertPercent(value, horizontal, parent) || $util$7.convertPX(value, this.fontSize);
        }
        convertPercent(value, horizontal, parent = true) {
            if ($util$7.isPercent(value)) {
                const node = parent && this.absoluteParent || this;
                const attr = horizontal ? 'width' : 'height';
                let dimension;
                if (node.has(attr, 2 /* UNIT */)) {
                    dimension = node.toInt(attr);
                }
                else {
                    dimension = node[parent ? 'box' : 'bounds'][attr];
                }
                const percent = parseFloat(value) >= 1 ? parseInt(value) / 100 : parseFloat(value);
                return `${Math.round(percent * dimension)}px`;
            }
            return '';
        }
        has(attr, checkType = 0, options) {
            const value = (options && options.map === 'initial' ? this._initial.styleMap : this._styleMap)[attr];
            if ($util$7.hasValue(value)) {
                switch (value) {
                    case '0px':
                        if ($util$7.hasBit(checkType, 64 /* ZERO */)) {
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
                        if ($util$7.hasBit(checkType, 8 /* LEFT */)) {
                            return true;
                        }
                    case 'baseline':
                        if ($util$7.hasBit(checkType, 16 /* BASELINE */)) {
                            return true;
                        }
                    case 'auto':
                        if ($util$7.hasBit(checkType, 4 /* AUTO */)) {
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
                        if (options) {
                            if (options.not) {
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
                        }
                        if ($util$7.hasBit(checkType, 2 /* UNIT */) && $util$7.isUnit(value)) {
                            return true;
                        }
                        if ($util$7.hasBit(checkType, 32 /* PERCENT */) && $util$7.isPercent(value)) {
                            return true;
                        }
                        if ($util$7.hasBit(checkType, 4 /* AUTO */)) {
                            return false;
                        }
                        return checkType === 0;
                }
            }
            return false;
        }
        hasBit(attr, value) {
            if (this[attr] !== undefined) {
                return $util$7.hasBit(this[attr], value);
            }
            return false;
        }
        hasAlign(value) {
            return $util$7.hasBit(this.alignmentType, value);
        }
        exclude({ section = 0, procedure = 0, resource = 0 }) {
            if (section > 0 && !$util$7.hasBit(this._excludeSection, section)) {
                this._excludeSection |= section;
            }
            if (procedure > 0 && !$util$7.hasBit(this._excludeProcedure, procedure)) {
                this._excludeProcedure |= procedure;
            }
            if (resource > 0 && !$util$7.hasBit(this._excludeResource, resource)) {
                this._excludeResource |= resource;
            }
        }
        setExclusions() {
            if (this.styleElement) {
                const applyExclusions = (attr, enumeration) => {
                    const actualParent = this.actualParent;
                    const exclude = $util$7.spliceArray([$util$7.trimNull(this.dataset[`exclude${attr}`]), actualParent ? $util$7.trimNull(actualParent.dataset[`exclude${attr}Child`]) : ''], value => value.trim() === '').join('|');
                    let result = 0;
                    for (let value of exclude.split('|')) {
                        value = value.trim().toUpperCase();
                        if (enumeration[value] !== undefined) {
                            result |= enumeration[value];
                        }
                    }
                    if (result > 0) {
                        this.exclude({ [attr.toLowerCase()]: result });
                    }
                };
                applyExclusions('Section', APP_SECTION);
                applyExclusions('Procedure', NODE_PROCEDURE);
                applyExclusions('Resource', NODE_RESOURCE);
            }
        }
        setBounds(calibrate = false) {
            const element = this._element;
            if (element && !calibrate) {
                if (this.styleElement) {
                    this._bounds = $dom$4.assignBounds(element.getBoundingClientRect());
                    if (this.documentBody) {
                        if (this.marginTop > 0) {
                            const firstChild = this.firstChild;
                            if (firstChild && firstChild.blockStatic && firstChild.marginTop >= this.marginTop && !firstChild.lineBreak) {
                                this.css('marginTop', '0px', true);
                            }
                        }
                        this._bounds.top = this.marginTop;
                    }
                }
                else if (this.plainText) {
                    const bounds = $dom$4.getRangeClientRect(element);
                    this._bounds = $dom$4.assignBounds(bounds);
                }
            }
        }
        appendTry(node, withNode, append = true) {
            for (let i = 0; i < this.length; i++) {
                if (node === this.item(i)) {
                    withNode.siblingIndex = node.siblingIndex;
                    this.item(i, withNode);
                    withNode.parent = this;
                    return true;
                }
            }
            if (append) {
                let index = -1;
                this.each(item => {
                    if (item.siblingIndex !== Number.POSITIVE_INFINITY) {
                        index = Math.max(item.siblingIndex, index);
                    }
                });
                withNode.siblingIndex = index + 1;
                withNode.parent = this;
                return true;
            }
            return false;
        }
        modifyBox(region, offset, negative = true) {
            if (offset !== 0) {
                const attr = CSS_SPACING.get(region);
                if (attr) {
                    if (offset === null) {
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
            if (attr) {
                return [this._boxReset[attr], this._boxAdjustment[attr]];
            }
            return [0, 0];
        }
        resetBox(region, node, fromParent = false) {
            const applyReset = (start, end) => {
                let i = 0;
                for (const attr of CSS_SPACING_VALUES.slice(start, end)) {
                    this._boxReset[attr] = 1;
                    if (node) {
                        const name = CSS_SPACING.get(CSS_SPACING_KEYS[i + start]);
                        if (name) {
                            node.modifyBox(CSS_SPACING_KEYS[i + (fromParent ? 0 : 4)], this[name]);
                        }
                    }
                    i++;
                }
            };
            if ($util$7.hasBit(region, 30 /* MARGIN */)) {
                applyReset(0, 4);
            }
            if ($util$7.hasBit(region, 480 /* PADDING */)) {
                applyReset(4, 8);
            }
        }
        inheritBox(region, node) {
            const applyReset = (start, end) => {
                let i = start;
                for (const attr of CSS_SPACING_VALUES.slice(start, end)) {
                    const value = this._boxAdjustment[attr];
                    if (value > 0) {
                        node.modifyBox(CSS_SPACING_KEYS[i], this._boxAdjustment[attr], false);
                        this._boxAdjustment[attr] = 0;
                    }
                    i++;
                }
            };
            if ($util$7.hasBit(region, 30 /* MARGIN */)) {
                applyReset(0, 4);
            }
            if ($util$7.hasBit(region, 480 /* PADDING */)) {
                applyReset(4, 8);
            }
        }
        previousSiblings(lineBreak = true, excluded = true, height = false) {
            let element = null;
            const result = [];
            if (this._element) {
                element = this._element.previousSibling;
            }
            else if (this._initial.children.length) {
                const children = $util$7.filterArray(this._initial.children, node => node.pageFlow);
                element = children.length && children[0].element ? children[0].element.previousSibling : null;
            }
            while (element) {
                const node = $dom$4.getElementAsNode(element);
                if (node) {
                    if (lineBreak && node.lineBreak || excluded && node.excluded) {
                        result.push(node);
                    }
                    else if (!node.excluded && node.pageFlow) {
                        result.push(node);
                        if (!height || node.visible && !node.floating) {
                            break;
                        }
                    }
                }
                element = element.previousSibling;
            }
            return result;
        }
        nextSiblings(lineBreak = true, excluded = true, visible = false) {
            let element = null;
            const result = [];
            if (this._element) {
                element = this._element.nextSibling;
            }
            else if (this._initial.children.length) {
                const children = $util$7.filterArray(this._initial.children, node => node.pageFlow);
                if (children.length) {
                    const lastChild = children[children.length - 1];
                    element = lastChild.element && lastChild.element.nextSibling;
                }
            }
            while (element) {
                const node = $dom$4.getElementAsNode(element);
                if (node) {
                    if (node.naturalElement) {
                        if (lineBreak && node.lineBreak || excluded && node.excluded) {
                            result.push(node);
                        }
                        else if (!node.excluded && node.pageFlow) {
                            result.push(node);
                            if (!visible || node.visible && !node.floating) {
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
                    this._initial[dimension] = $dom$4.assignBounds(bounds);
                }
            }
        }
        convertPosition(attr) {
            let value = 0;
            if (!this.positionStatic) {
                const unit = this.cssInitial(attr);
                if ($util$7.isUnit(unit) || $util$7.isPercent(unit)) {
                    value = $util$7.convertInt(this.percentValue(attr, unit, attr === 'left' || attr === 'right'));
                }
            }
            return value;
        }
        convertBox(region, direction) {
            const attr = region + direction;
            return $util$7.convertInt(this.percentValue(attr, this.css(attr), direction === 'Left' || direction === 'Right'));
        }
        percentValue(attr, value, horizontal, parent = true) {
            if ($util$7.isPercent(value)) {
                return $util$7.isUnit(this.style[attr]) ? this.style[attr] : this.convertPercent(value, horizontal, parent);
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
                let value = '';
                if (this._element) {
                    if (this._element.nodeName === '#text') {
                        value = 'PLAINTEXT';
                    }
                    else if (this._element.tagName === 'INPUT') {
                        value = this._element.type;
                    }
                    else {
                        value = this._element.tagName;
                    }
                }
                this._cached.tagName = value.toUpperCase();
            }
            return this._cached.tagName;
        }
        get element() {
            return this._element;
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
            return $dom$4.hasComputedStyle(this._element);
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
            return this._bounds || $dom$4.newRectDimension();
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
                    this._linear = $dom$4.assignBounds(this._bounds);
                }
                this.setDimensions('linear');
            }
            return this._linear || $dom$4.newRectDimension();
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
                    this._box = $dom$4.assignBounds(this._bounds);
                }
                this.setDimensions('box');
            }
            return this._box || $dom$4.newRectDimension();
        }
        set renderAs(value) {
            if (!this.rendered && value && !value.rendered) {
                this._renderAs = value;
            }
        }
        get renderAs() {
            return this._renderAs;
        }
        set renderDepth(value) {
            this._renderDepth = value;
        }
        get renderDepth() {
            return this._renderDepth !== -1 ? this._renderDepth : 0;
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
                this._cached.extensions = this.dataset.use ? $util$7.spliceArray(this.dataset.use.split(/\s*,\s*/), value => value === '') : [];
            }
            return this._cached.extensions;
        }
        get flexbox() {
            if (this._cached.flexbox === undefined) {
                const actualParent = this.actualParent;
                this._cached.flexbox = {
                    order: $util$7.convertInt(this.css('order')),
                    wrap: this.css('flexWrap'),
                    direction: this.css('flexDirection'),
                    alignSelf: !this.has('alignSelf') && actualParent && actualParent.has('alignItems') ? actualParent.css('alignItems') : this.css('alignSelf'),
                    justifyContent: this.css('justifyContent'),
                    basis: this.css('flexBasis'),
                    grow: $util$7.convertInt(this.css('flexGrow')),
                    shrink: $util$7.convertInt(this.css('flexShrink'))
                };
            }
            return this._cached.flexbox;
        }
        get width() {
            if (this._cached.width === undefined) {
                let width = 0;
                for (const value of [this._styleMap.width, this._styleMap.minWidth]) {
                    if ($util$7.isUnit(value) || $util$7.isPercent(value)) {
                        width = $util$7.convertInt(this.convertPX(value));
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
                    if ($util$7.isUnit(value) || this.hasHeight && $util$7.isPercent(value)) {
                        height = $util$7.convertInt(this.convertPX(value, true));
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
                this._cached.hasWidth = (() => {
                    if (this.inlineStatic) {
                        return false;
                    }
                    else if ($util$7.isPercent(value)) {
                        return value !== '0%';
                    }
                    else if ($util$7.isUnit(value) && value !== '0px' || this.toInt('minWidth') > 0) {
                        return true;
                    }
                    return false;
                })();
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
                    else if ($util$7.isPercent(value)) {
                        const actualParent = this.actualParent;
                        if (actualParent && actualParent.hasHeight) {
                            return value !== '0%';
                        }
                    }
                    else if ($util$7.isUnit(value) && value !== '0px' || this.toInt('minHeight') > 0) {
                        return true;
                    }
                    return false;
                })();
            }
            return this._cached.hasHeight;
        }
        get lineHeight() {
            if (this._cached.lineHeight === undefined) {
                if (this.length === 0 || this.textElement) {
                    this._cached.lineHeight = this.toInt('lineHeight');
                }
                else {
                    const lineHeight = $util$7.convertInt(this.cssAscend('lineHeight', true));
                    this._cached.lineHeight = lineHeight > this.bounds.height || this.some(node => node.plainText) ? lineHeight : 0;
                }
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
                this._cached.positionStatic = (() => {
                    switch (this.position) {
                        case 'fixed':
                        case 'absolute':
                            return false;
                        case 'sticky':
                        case 'relative':
                            return this.toInt('top') === 0 && this.toInt('right') === 0 && this.toInt('bottom') === 0 && this.toInt('left') === 0;
                        case 'inherit':
                            const position = this._element ? $dom$4.cssInheritAttribute(this._element.parentElement, 'position') : '';
                            return position !== '' && !(position === 'absolute' || position === 'fixed');
                        default:
                            return true;
                    }
                })();
            }
            return this._cached.positionStatic;
        }
        get positionRelative() {
            const value = this.position;
            return value === 'relative' || value === 'sticky';
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
            return this.css('borderTopStyle') !== 'none' ? $util$7.convertInt(this.css('borderTopWidth')) : 0;
        }
        get borderRightWidth() {
            return this.css('borderRightStyle') !== 'none' ? $util$7.convertInt(this.css('borderRightWidth')) : 0;
        }
        get borderBottomWidth() {
            return this.css('borderBottomStyle') !== 'none' ? $util$7.convertInt(this.css('borderBottomWidth')) : 0;
        }
        get borderLeftWidth() {
            return this.css('borderLeftStyle') !== 'none' ? $util$7.convertInt(this.css('borderLeftWidth')) : 0;
        }
        get paddingTop() {
            if (this._cached.paddingTop === undefined) {
                this._cached.paddingTop = this.convertBox('padding', 'Top');
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
                this._cached.paddingBottom = this.convertBox('padding', 'Bottom');
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
                this._cached.inline = value === 'inline' || (value === 'initial' || value === 'unset') && $dom$4.ELEMENT_INLINE.includes(this.tagName);
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
                const element = this._element;
                let value = false;
                if (element && this.htmlElement && !this.svgElement) {
                    switch (element.tagName) {
                        case 'INPUT':
                        case 'BUTTON':
                        case 'IMG':
                        case 'SELECT':
                        case 'TEXTAREA':
                            break;
                        default:
                            if ($dom$4.hasFreeFormText(element)) {
                                value = true;
                                for (let i = 0; i < element.children.length; i++) {
                                    const node = $dom$4.getElementAsNode(element.children[i]);
                                    if (!(node === undefined || node.excluded || $util$7.hasValue(node.dataset.target))) {
                                        value = false;
                                        break;
                                    }
                                }
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
                this._cached.block = value === 'block' || value === 'list-item' || value === 'initial' && $dom$4.ELEMENT_BLOCK.includes(this.tagName);
            }
            return this._cached.block;
        }
        get blockStatic() {
            if (this._cached.blockStatic === undefined) {
                this._cached.blockStatic = this.block && this.pageFlow && (!this.floating || this.cssInitial('width') === '100%');
            }
            return this._cached.blockStatic;
        }
        get blockDimension() {
            if (this._cached.blockDimension === undefined) {
                const display = this.display;
                this._cached.blockDimension = this.block || display === 'inline-block' || display === 'table-cell';
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
                this._cached.rightAligned = (this.float === 'right' ||
                    this.autoMargin.left ||
                    this.inlineVertical && this.cssAscend('textAlign', true) === 'right' ||
                    !this.pageFlow && this.has('right'));
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
                if (element) {
                    if (this.htmlElement) {
                        value = element.textContent || element.innerText;
                    }
                    else if (this.plainText) {
                        value = element.textContent || '';
                    }
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
            return $util$7.hasBit(this.overflow, 8 /* HORIZONTAL */);
        }
        get overflowY() {
            return $util$7.hasBit(this.overflow, 16 /* VERTICAL */);
        }
        get baseline() {
            if (this._cached.baseline === undefined) {
                const value = this.verticalAlign;
                const initialValue = this.cssInitial('verticalAlign');
                this._cached.baseline = this.pageFlow && !this.floating && !this.svgElement && (value === 'baseline' || value === 'initial' || $util$7.isUnit(initialValue) && parseInt(initialValue) === 0);
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
                this._cached.multiline = this.plainText || this.inlineText && (this.inlineFlow || this.length === 0) ? $dom$4.getRangeClientRect(this._element).multiline : 0;
            }
            return this._cached.multiline;
        }
        get visibleStyle() {
            if (this._cached.visibleStyle === undefined) {
                const borderWidth = this.borderTopWidth > 0 || this.borderRightWidth > 0 || this.borderBottomWidth > 0 || this.borderLeftWidth > 0;
                const backgroundImage = $util$7.REGEXP_PATTERN.URL.test(this.css('backgroundImage')) || $util$7.REGEXP_PATTERN.URL.test(this.css('background'));
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
        set renderParent(value) {
            if (value) {
                if (value !== this && value.renderChildren.indexOf(this) === -1) {
                    value.renderChildren.push(this);
                }
                this._renderParent = value;
            }
        }
        get renderParent() {
            return this._renderParent;
        }
        set renderPositionId(value) {
            this._renderPositionId = value;
        }
        get renderPositionId() {
            return this._renderPositionId || this.id + (this.renderPosition !== -1 ? `^${this.renderPosition}` : '');
        }
        get actualParent() {
            return this._element && this._element.parentElement ? $dom$4.getElementAsNode(this._element.parentElement) : undefined;
        }
        get actualChildren() {
            if (this._cached.actualChildren === undefined) {
                if (this.htmlElement) {
                    const actualChildren = [];
                    this._element.childNodes.forEach((element) => {
                        const node = $dom$4.getElementAsNode(element);
                        if (node) {
                            actualChildren.push(node);
                        }
                    });
                    this._cached.actualChildren = actualChildren;
                }
                else if (this.groupParent) {
                    this._cached.actualChildren = this._initial.children.slice(0);
                }
                else {
                    this._cached.actualChildren = [];
                }
            }
            return this._cached.actualChildren;
        }
        get actualHeight() {
            return this.plainText ? this.bounds.bottom - this.bounds.top : this.bounds.height;
        }
        get firstChild() {
            if (this.htmlElement) {
                const element = this._element;
                for (let i = 0; i < element.childNodes.length; i++) {
                    const node = $dom$4.getElementAsNode(element.childNodes[i]);
                    if (node) {
                        return node;
                    }
                }
            }
            return undefined;
        }
        get lastChild() {
            if (this.htmlElement) {
                const element = this._element;
                for (let i = element.childNodes.length - 1; i >= 0; i--) {
                    const node = $dom$4.getElementAsNode(element.childNodes[i]);
                    if (node && node.naturalElement) {
                        return node;
                    }
                }
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

    const $dom$5 = squared.lib.dom;
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
                const actualParent = this.actualParent;
                if (actualParent) {
                    this.css('direction', actualParent.dir);
                }
                this.saveAsInitial();
            }
        }
        setBounds(calibrate = false) {
            if (!calibrate) {
                if (this.length) {
                    const bounds = this.outerRegion;
                    this._bounds = Object.assign({ width: bounds.right - bounds.left, height: bounds.bottom - bounds.top }, bounds);
                }
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
                const element = actualParent.element;
                if (element) {
                    for (let i = 0; i < element.childNodes.length; i++) {
                        const node = $dom$5.getElementAsNode(element.childNodes[i]);
                        if (node && this.nodes.includes(node)) {
                            return node;
                        }
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
            if (actualParent && actualParent.element) {
                const element = actualParent.element;
                if (element) {
                    for (let i = element.childNodes.length - 1; i >= 0; i--) {
                        const node = $dom$5.getElementAsNode(element.childNodes[i]);
                        if (node && this.nodes.includes(node)) {
                            return node;
                        }
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
            return this.children.reduce((a, b) => a + b.multiline, 0);
        }
        get display() {
            return (this.css('display') ||
                this.some(node => node.block) ? 'block' : (this.some(node => node.blockDimension) ? 'inline-block' : 'inline'));
        }
        get groupParent() {
            return true;
        }
        get outerRegion() {
            const nodes = this.children.slice(0);
            let top = nodes[0];
            let right = top;
            let bottom = top;
            let left = top;
            this.each(node => node.companion && !node.companion.visible && nodes.push(node.companion));
            for (let i = 1; i < nodes.length; i++) {
                const node = nodes[i];
                if (node.linear.top < top.linear.top) {
                    top = node;
                }
                if (node.linear.right > right.linear.right) {
                    right = node;
                }
                if (node.linear.bottom > bottom.linear.bottom) {
                    bottom = node;
                }
                if (node.linear.left < left.linear.left) {
                    left = node;
                }
            }
            return {
                top: top.linear.top,
                right: right.linear.right,
                bottom: bottom.linear.bottom,
                left: left.linear.left
            };
        }
    }

    const $dom$6 = squared.lib.dom;
    const $util$8 = squared.lib.util;
    class Accessibility extends Extension {
        afterInit() {
            for (const node of this.application.processing.cache) {
                const element = node.element;
                if (element && element.tagName === 'INPUT' && !node.hasBit('excludeProcedure', NODE_PROCEDURE.ACCESSIBILITY)) {
                    switch (element.type) {
                        case 'radio':
                        case 'checkbox':
                            [$dom$6.getPreviousElementSibling(element), $dom$6.getNextElementSibling(element)].some((sibling) => {
                                if (sibling) {
                                    const label = $dom$6.getElementAsNode(sibling);
                                    const labelParent = sibling.parentElement && sibling.parentElement.tagName === 'LABEL' ? $dom$6.getElementAsNode(sibling.parentElement) : undefined;
                                    if (label && label.visible && label.pageFlow) {
                                        if ($util$8.hasValue(sibling.htmlFor) && sibling.htmlFor === element.id) {
                                            node.companion = label;
                                        }
                                        else if (label.textElement && labelParent) {
                                            node.companion = label;
                                            labelParent.renderAs = node;
                                        }
                                        if (node.companion) {
                                            if (this.options && !this.options.showLabel) {
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
                }
            }
        }
    }

    const $util$9 = squared.lib.util;
    const REGEXP_PARTIAL = {
        UNIT: '[\\d.]+[a-z%]+|auto|max-content|min-content',
        MINMAX: 'minmax\\(([^,]+), ([^)]+)\\)',
        FIT_CONTENT: 'fit-content\\(([\\d.]+[a-z%]+)\\)',
        NAMED: '\\[([\\w\\-\\s]+)\\]'
    };
    const PATTERN_GRID = {
        UNIT: new RegExp(`^(${REGEXP_PARTIAL.UNIT})$`),
        NAMED: new RegExp(`\\s*(repeat\\((auto-fit|auto-fill|[0-9]+), (.+)\\)|${REGEXP_PARTIAL.NAMED}|${REGEXP_PARTIAL.MINMAX}|${REGEXP_PARTIAL.FIT_CONTENT}|${REGEXP_PARTIAL.UNIT})\\s*`, 'g'),
        REPEAT: new RegExp(`\\s*(${REGEXP_PARTIAL.NAMED}|${REGEXP_PARTIAL.MINMAX}|${REGEXP_PARTIAL.FIT_CONTENT}|${REGEXP_PARTIAL.UNIT})\\s*`, 'g'),
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
    function convertUnit(node, value) {
        return $util$9.isUnit(value) ? node.convertPX(value) : value;
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
            mainData.row.gap = parseInt(node.convertPX(node.css('rowGap'), false, false));
            mainData.column.gap = parseInt(node.convertPX(node.css('columnGap'), true, false));
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
                    let i = 1;
                    let matchA;
                    while ((matchA = PATTERN_GRID.NAMED.exec(value)) !== null) {
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
                                        iterations = $util$9.convertInt(matchA[3]);
                                        break;
                                }
                                if (iterations > 0) {
                                    const repeating = [];
                                    let matchB;
                                    while ((matchB = PATTERN_GRID.REPEAT.exec(matchA[3])) !== null) {
                                        let matchC;
                                        if ((matchC = new RegExp(REGEXP_PARTIAL.NAMED).exec(matchB[1])) !== null) {
                                            if (data.name[matchC[1]] === undefined) {
                                                data.name[matchC[1]] = [];
                                            }
                                            repeating.push({ name: matchC[1] });
                                        }
                                        else if ((matchC = new RegExp(REGEXP_PARTIAL.MINMAX).exec(matchB[1])) !== null) {
                                            repeating.push({ unit: convertUnit(node, matchC[2]), unitMin: convertUnit(node, matchC[1]) });
                                        }
                                        else if ((matchC = new RegExp(REGEXP_PARTIAL.FIT_CONTENT).exec(matchB[1])) !== null) {
                                            repeating.push({ unit: convertUnit(node, matchC[1]), unitMin: '0px' });
                                        }
                                        else if ((matchC = new RegExp(REGEXP_PARTIAL.UNIT).exec(matchB[1])) !== null) {
                                            repeating.push({ unit: convertUnit(node, matchC[0]) });
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
                                data.unit.push(convertUnit(node, matchA[6]));
                                data.unitMin.push(convertUnit(node, matchA[5]));
                                data.repeat.push(false);
                                i++;
                            }
                            else if (matchA[1].startsWith('fit-content')) {
                                data.unit.push(convertUnit(node, matchA[7]));
                                data.unitMin.push('0px');
                                data.repeat.push(false);
                                i++;
                            }
                            else if (PATTERN_GRID.UNIT.test(matchA[1])) {
                                data.unit.push(convertUnit(node, matchA[1]));
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
                    else if ($util$9.isNumber(rowEnd)) {
                        rowSpan = parseInt(rowEnd) - row;
                    }
                    if (columnEnd.startsWith('span')) {
                        columnSpan = parseInt(columnEnd.split(' ')[1]);
                    }
                    else if ($util$9.isNumber(columnEnd)) {
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
                    $util$9.trimString(template.trim(), '"').split(' ').forEach((area, j) => {
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
                            if ($util$9.isNumber(value)) {
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
                                    if (item && !modified.has(item)) {
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
            return { output: '' };
        }
    }

    const $util$a = squared.lib.util;
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
            const pageFlow = node.filter(item => item.pageFlow);
            const mainData = Flexbox.createDataAttribute(node, pageFlow);
            if (node.cssTry('display', 'block')) {
                for (const item of pageFlow) {
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
                    pageFlow.sort((a, b) => {
                        if (!$util$a.withinFraction(a.linear[align], b.linear[align])) {
                            return a.linear[align] < b.linear[align] ? -1 : 1;
                        }
                        return a.linear[sort] >= b.linear[sort] ? 1 : -1;
                    });
                    for (const item of pageFlow) {
                        const point = Math.round(item.linear[align]);
                        const items = map.get(point) || [];
                        items.push(item);
                        map.set(point, items);
                    }
                    let maxCount = 0;
                    let i = 0;
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
                if (pageFlow.some(item => item.flexbox.order !== 0)) {
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
            return { output: '' };
        }
    }

    const $dom$7 = squared.lib.dom;
    class External extends Extension {
        beforeInit(element, internal = false) {
            if (internal || this.included(element)) {
                if (!$dom$7.getElementCache(element, 'squaredExternalDisplay')) {
                    const display = [];
                    let current = element;
                    while (current) {
                        display.push($dom$7.getStyle(current).display);
                        current.style.display = 'block';
                        current = current.parentElement;
                    }
                    $dom$7.setElementCache(element, 'squaredExternalDisplay', display);
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
                const data = $dom$7.getElementCache(element, 'squaredExternalDisplay');
                if (data) {
                    const display = data;
                    let current = element;
                    let i = 0;
                    while (current) {
                        current.style.display = display[i];
                        current = current.parentElement;
                        i++;
                    }
                    $dom$7.deleteElementCache(element, 'squaredExternalDisplay');
                }
            }
        }
    }

    const $dom$8 = squared.lib.dom;
    const $util$b = squared.lib.util;
    function getRowIndex(columns, target) {
        for (const column of columns) {
            const index = column.findIndex(item => $util$b.withinFraction(target.linear.top, item.linear.top) || target.linear.top > item.linear.top && target.linear.top < item.linear.bottom);
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
            return node.length > 1 && !node.flexElement && !node.gridElement && !node.has('listStyle') && (node.every(item => item.pageFlow && !item.visibleStyle.background && (!item.inlineFlow || item.blockStatic)) && (node.some(item => item.length > 1) && node.every(item => item.length > 0 && NodeList.linearX(item.children)) ||
                node.every(item => item.display === 'list-item' && !item.has('listStyleType'))) ||
                node.display === 'table' && node.every(item => item.display === 'table-row' && item.every(child => child.display === 'table-cell')));
        }
        processNode(node) {
            const columnEnd = [];
            const columnBalance = this.options.columnBalanceEqual;
            const columns = [];
            if (columnBalance) {
                const dimensions = [];
                node.each((item, index) => {
                    dimensions[index] = [];
                    item.each(child => dimensions[index].push(child.bounds.width));
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
                                    const removed = columns[m].splice(assigned[m] + (every ? 2 : 1), columns[m].length - base.length);
                                    columns[m][assigned[m] + (every ? 1 : 0)].data(EXT_NAME.GRID, 'cellData', { siblings: [...removed] });
                                }
                            }
                        }
                        if (found.length === columns.length) {
                            const minIndex = found.reduce((a, b) => Math.min(a, b));
                            maxIndex = found.reduce((a, b) => Math.max(a, b));
                            if (maxIndex > minIndex) {
                                for (let m = 0; m < columns.length; m++) {
                                    if (found[m] > minIndex) {
                                        const removed = columns[m].splice(minIndex, found[m] - minIndex);
                                        columns[m][assigned[m] + (every ? 1 : 0)].data(EXT_NAME.GRID, 'cellData', { siblings: [...removed] });
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
                            return { output: '' };
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
                                        return { output: '' };
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
                                const documentParent = item.documentParent.element;
                                if (documentParent) {
                                    for (let i = 0; i < documentParent.children.length; i++) {
                                        const sibling = $dom$8.getElementAsNode(documentParent.children[i]);
                                        if (sibling && sibling.visible && !sibling.rendered && sibling.linear.left >= item.linear.right && sibling.linear.right <= columnEnd[index]) {
                                            data.siblings.push(sibling);
                                        }
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
                $util$b.sortArray(node.children, true, 'documentParent.siblingIndex', 'siblingIndex');
                node.each((item, index) => item.siblingIndex = index);
                if (node.tableElement && node.css('borderCollapse') === 'collapse') {
                    node.modifyBox(32 /* PADDING_TOP */, null);
                    node.modifyBox(64 /* PADDING_RIGHT */, null);
                    node.modifyBox(128 /* PADDING_BOTTOM */, null);
                    node.modifyBox(256 /* PADDING_LEFT */, null);
                }
                node.data(EXT_NAME.GRID, 'mainData', mainData);
            }
            return { output: '' };
        }
    }

    const $util$c = squared.lib.util;
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
            return super.condition(node) && node.length > 0 && (node.every(item => item.blockStatic) ||
                node.every(item => item.inlineVertical) ||
                node.every(item => item.floating) && NodeList.floated(node.children).size === 1 ||
                node.every((item, index) => !item.floating && (index === 0 ||
                    index === node.length - 1 ||
                    item.blockStatic ||
                    item.inlineFlow && node.item(index - 1).blockStatic && node.item(index + 1).blockStatic))) && (node.some(item => item.display === 'list-item' && (item.css('listStyleType') !== 'none' || hasSingleImage(item))) ||
                node.every(item => item.tagName !== 'LI' && item.cssInitial('listStyleType') === 'none' && hasSingleImage(item)));
        }
        processNode(node) {
            let i = 0;
            node.each(item => {
                const mainData = List.createDataAttribute();
                if (item.display === 'list-item' || item.has('listStyleType') || hasSingleImage(item)) {
                    let src = item.css('listStyleImage');
                    if (src && src !== 'none') {
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
                                mainData.ordinal = `${$util$c.convertAlpha(i).toLowerCase()}.`;
                                break;
                            case 'upper-alpha':
                            case 'upper-latin':
                                mainData.ordinal = `${$util$c.convertAlpha(i)}.`;
                                break;
                            case 'lower-roman':
                                mainData.ordinal = `${$util$c.convertRoman(i + 1).toLowerCase()}.`;
                                break;
                            case 'upper-roman':
                                mainData.ordinal = `${$util$c.convertRoman(i + 1)}.`;
                                break;
                            case 'none':
                                src = '';
                                let position = '';
                                if (!item.visibleStyle.backgroundRepeat) {
                                    src = item.css('backgroundImage');
                                    position = item.css('backgroundPosition');
                                }
                                if (src && src !== 'none') {
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
            return { output: '' };
        }
        postBaseLayout(node) {
            node.modifyBox(16 /* MARGIN_LEFT */, null);
            node.modifyBox(256 /* PADDING_LEFT */, null);
        }
    }

    const $util$d = squared.lib.util;
    class Relative extends Extension {
        condition(node) {
            return node.positionRelative && !node.positionStatic || $util$d.convertInt(node.cssInitial('verticalAlign')) !== 0;
        }
        processNode() {
            return { output: '', include: true };
        }
        postProcedure(node) {
            const renderParent = node.renderParent;
            if (renderParent) {
                const verticalAlign = $util$d.convertInt(node.verticalAlign);
                let target = node;
                if (renderParent.support.container.positionRelative && node.length === 0 && (node.top !== 0 || node.bottom !== 0 || verticalAlign !== 0)) {
                    target = node.clone(this.application.nextId, true, true);
                    node.hide(true);
                    const layout = new Layout(renderParent, target, target.containerType, target.alignmentType);
                    this.application.controllerHandler.appendAfter(node.id, this.application.renderLayout(layout));
                    this.application.session.cache.append(target, false);
                    renderParent.renderEach(item => {
                        if (item.alignSibling('topBottom') === node.documentId) {
                            item.alignSibling('topBottom', target.documentId);
                        }
                        else if (item.alignSibling('bottomTop') === node.documentId) {
                            item.alignSibling('bottomTop', target.documentId);
                        }
                    });
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

    const $dom$9 = squared.lib.dom;
    const $util$e = squared.lib.util;
    class Sprite extends Extension {
        condition(node) {
            let valid = false;
            if (node.hasWidth && node.hasHeight && node.length === 0 && !node.inlineText) {
                let url = node.css('backgroundImage');
                if (!$util$e.hasValue(url) || url === 'none') {
                    url = '';
                    const match = $util$e.REGEXP_PATTERN.URL.exec(node.css('background'));
                    if (match) {
                        url = match[0];
                    }
                }
                if (url !== '') {
                    url = $dom$9.cssResolveUrl(url);
                    const image = this.application.session.image.get(url);
                    if (image) {
                        const fontSize = node.fontSize;
                        const width = $util$e.convertPercentPX(node.has('width') ? node.css('width') : node.css('minWidth'), node.bounds.width, fontSize);
                        const height = $util$e.convertPercentPX(node.has('height') ? node.css('width') : node.css('minHeight'), node.bounds.height, fontSize);
                        const position = $dom$9.getBackgroundPosition(`${node.css('backgroundPositionX')} ${node.css('backgroundPositionY')}`, node.bounds, fontSize);
                        if (position.left <= 0 && position.top <= 0 && image.width > width && image.height > height) {
                            image.position = { x: position.left, y: position.top };
                            node.data(EXT_NAME.SPRITE, 'mainData', image);
                            valid = true;
                        }
                    }
                }
            }
            return valid && (!$util$e.hasValue(node.dataset.use) || this.included(node.element));
        }
    }

    const $dom$a = squared.lib.dom;
    class Substitute extends Extension {
        constructor(name, framework, tagNames, options) {
            super(name, framework, tagNames, options);
            this.require(EXT_NAME.EXTERNAL, true);
        }
        processNode(node, parent) {
            const data = $dom$a.getDataSet(node.element, this.name);
            let output = '';
            if (data.tag) {
                node.setControlType(data.tag);
                node.render(parent);
                output = this.application.controllerHandler.renderNodeStatic(data.tag, node.renderDepth, {}, '', '', node, node.length > 0);
            }
            if (data.tagChild) {
                node.each(item => {
                    if (item.styleElement) {
                        item.dataset.use = this.name;
                        item.dataset.squaredSubstituteTag = data.tagChild;
                    }
                });
            }
            return { output };
        }
    }

    const $dom$b = squared.lib.dom;
    const $math = squared.lib.math;
    const $util$f = squared.lib.util;
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
                td.css('width', $util$f.formatPX(td.bounds.width), true);
            }
            function inheritStyles(section) {
                if (section.length) {
                    for (const item of section[0].cascade()) {
                        if (item.tagName === 'TH' || item.tagName === 'TD') {
                            item.inherit(section[0], 'styleMap');
                        }
                    }
                    table.push(...section[0].children);
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
                table.push(...section.children);
                section.hide();
            }
            inheritStyles(tfoot);
            const layoutFixed = node.css('tableLayout') === 'fixed';
            const borderCollapse = node.css('borderCollapse') === 'collapse';
            const [horizontal, vertical] = borderCollapse ? [0, 0] : $util$f.replaceMap(node.css('borderSpacing').split(' '), value => parseInt(value));
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
            const spacingWidth = $util$f.formatPX(horizontal > 1 ? Math.round(horizontal / 2) : horizontal);
            const spacingHeight = $util$f.formatPX(vertical > 1 ? Math.round(vertical / 2) : vertical);
            const colgroup = node.element && node.element.querySelector('COLGROUP');
            const rowWidth = [];
            const mapBounds = [];
            const tableFilled = [];
            const mapWidth = [];
            let rowCount = table.length;
            let columnIndex = new Array(rowCount).fill(0);
            let columnCount = 0;
            let multiline = 0;
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
                    if (!td.visibleStyle.backgroundImage && !td.visibleStyle.backgroundColor) {
                        if (colgroup) {
                            const style = $dom$b.getStyle(colgroup.children[columnIndex[i]]);
                            if (style.background) {
                                element.style.background = style.background;
                            }
                            else if (style.backgroundColor) {
                                element.style.backgroundColor = style.backgroundColor;
                            }
                        }
                        else {
                            let value = $dom$b.cssInheritStyle(element, 'background', ['rgba(0, 0, 0, 0)', 'transparent'], ['TABLE']);
                            if (value !== '') {
                                element.style.background = value;
                            }
                            else {
                                value = $dom$b.cssInheritStyle(element, 'backgroundColor', ['rgba(0, 0, 0, 0)', 'transparent'], ['TABLE']);
                                if (value !== '') {
                                    element.style.backgroundColor = value;
                                }
                            }
                        }
                    }
                    switch (td.tagName) {
                        case 'TH':
                            if (!td.cssInitial('textAlign')) {
                                td.css('textAlign', 'center');
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
                            const unit = $util$f.isUnit(mapWidth[m]);
                            const percent = $util$f.isPercent(columnWidth);
                            if (reevaluate || td.bounds.width < mapBounds[m] || (td.bounds.width === mapBounds[m] && ((unit || percent) ||
                                unit && percent ||
                                percent && $util$f.isPercent(mapWidth[m]) && $util$f.convertFloat(columnWidth) > $util$f.convertFloat(mapWidth[m]) ||
                                unit && $util$f.isUnit(columnWidth) && $util$f.convertInt(columnWidth) > $util$f.convertInt(mapWidth[m])))) {
                                mapWidth[m] = columnWidth;
                            }
                            if (reevaluate || element.colSpan === 1) {
                                mapBounds[m] = td.bounds.width;
                            }
                        }
                    }
                    if (multiline === 0) {
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
            if (node.has('width', 2 /* UNIT */) && mapWidth.some(value => $util$f.isPercent(value))) {
                $util$f.replaceMap(mapWidth, (value, index) => {
                    if (value === 'auto' && mapBounds[index] > 0) {
                        value = $util$f.formatPX(mapBounds[index]);
                    }
                    return value;
                });
            }
            if (mapWidth.every(value => $util$f.isPercent(value)) && mapWidth.reduce((a, b) => a + parseFloat(b), 0) > 1) {
                let percentTotal = 100;
                $util$f.replaceMap(mapWidth, value => {
                    const percent = parseFloat(value);
                    if (percentTotal <= 0) {
                        value = '0px';
                    }
                    else if (percentTotal - percent < 0) {
                        value = $util$f.formatPercent(percentTotal);
                    }
                    percentTotal -= percent;
                    return value;
                });
            }
            else if (mapWidth.every(value => $util$f.isUnit(value))) {
                const width = mapWidth.reduce((a, b) => a + parseInt(b), 0);
                if (width < node.width) {
                    $util$f.replaceMap(mapWidth, value => value !== '0px' ? `${(parseInt(value) / width) * 100}%` : value);
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
            const mapPercent = mapWidth.reduce((a, b) => a + ($util$f.isPercent(b) ? parseFloat(b) : 0), 0);
            mainData.layoutType = (() => {
                if (mapWidth.some(value => $util$f.isPercent(value)) || mapWidth.every(value => $util$f.isUnit(value) && value !== '0px')) {
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
                if (mapWidth.every(value => value === 'auto' || ($util$f.isUnit(value) && value !== '0px'))) {
                    return 1 /* STRETCH */;
                }
                return 0 /* NONE */;
            })();
            if (multiline || (mainData.layoutType === 1 /* STRETCH */ && !node.hasWidth)) {
                mainData.expand = true;
            }
            const caption = node.find(item => item.tagName === 'CAPTION');
            node.clear();
            if (caption) {
                if (!caption.hasWidth && !$dom$b.isUserAgent(8 /* EDGE */)) {
                    if (caption.textElement) {
                        if (!caption.has('maxWidth')) {
                            caption.css('maxWidth', $util$f.formatPX(caption.bounds.width));
                        }
                    }
                    else if (caption.bounds.width > $math.maxArray(rowWidth)) {
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
                                else if ($util$f.isPercent(columnWidth)) {
                                    td.data(EXT_NAME.TABLE, 'percent', columnWidth);
                                    td.data(EXT_NAME.TABLE, 'expand', true);
                                }
                                else if ($util$f.isUnit(columnWidth) && parseInt(columnWidth) > 0) {
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
                            }
                            if (i >= 0 && i < rowCount - 1) {
                                const next = tableFilled[i + 1][j];
                                if (next && next !== td && next.css('visibility') === 'visible') {
                                    if (td.borderBottomWidth >= next.borderTopWidth) {
                                        next.css('borderTopWidth', '0px');
                                    }
                                    else {
                                        td.css('borderBottomWidth', '0px');
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
                            }
                            if (j === 0) {
                                if (td.borderLeftWidth < parseInt(borderLeftWidth)) {
                                    td.cssApply({
                                        borderLeftColor,
                                        borderLeftStyle,
                                        borderLeftWidth
                                    });
                                }
                            }
                            if (j >= 0 && j < columnCount - 1) {
                                const next = tableFilled[i][j + 1];
                                if (next && next !== td && next.css('visibility') === 'visible') {
                                    if (td.borderRightWidth >= next.borderLeftWidth) {
                                        next.css('borderLeftWidth', '0px');
                                    }
                                    else {
                                        td.css('borderRightWidth', '0px');
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
                            }
                        }
                    }
                }
                node.cssApply({
                    borderTopWidth: '0px',
                    borderRightWidth: '0px',
                    borderBottomWidth: '0px',
                    borderLeftWidth: '0px'
                });
            }
            mainData.rowCount = rowCount;
            mainData.columnCount = columnCount;
            node.data(EXT_NAME.TABLE, 'mainData', mainData);
            return { output: '' };
        }
    }

    const $util$g = squared.lib.util;
    class VerticalAlign extends Extension {
        condition(node) {
            const nodes = node.filter(item => item.inlineVertical);
            return nodes.length > 1 && nodes.some(item => $util$g.convertInt(item.verticalAlign) !== 0) && NodeList.linearX(node.children);
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
                        let reset = false;
                        if (aboveBaseline.includes(item)) {
                            reset = true;
                        }
                        else if (item.inlineVertical && !item.baseline && $util$g.isUnit(item.verticalAlign)) {
                            item.modifyBox(2 /* MARGIN_TOP */, item.linear.top - aboveBaseline[0].linear.top);
                            belowBaseline.push(item);
                            reset = true;
                        }
                        if (reset) {
                            item.css('verticalAlign', '0px', true);
                        }
                    });
                }
            }
            else {
                $util$g.spliceArray(aboveBaseline, item => !($util$g.isUnit(item.verticalAlign) && $util$g.convertInt(item.verticalAlign) > 0));
            }
            if (aboveBaseline.length) {
                node.data(EXT_NAME.VERTICAL_ALIGN, 'mainData', {
                    aboveBaseline,
                    belowBaseline
                });
            }
            return { output: '' };
        }
        postProcedure(node) {
            const mainData = node.data(EXT_NAME.VERTICAL_ALIGN, 'mainData');
            if (mainData) {
                const baseline = node.find(item => item.baselineActive);
                if (baseline) {
                    baseline.modifyBox(2 /* MARGIN_TOP */, baseline.linear.top - mainData.aboveBaseline[0].linear.top);
                }
                else {
                    [...mainData.belowBaseline, ...mainData.aboveBaseline].some(item => {
                        const verticalAlign = $util$g.convertInt(item.cssInitial('verticalAlign'));
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

    const $dom$c = squared.lib.dom;
    const $util$h = squared.lib.util;
    function setMinHeight(node, offset) {
        const minHeight = node.has('minHeight', 2 /* UNIT */) ? node.toInt('minHeight') : 0;
        node.css('minHeight', $util$h.formatPX(Math.max(offset, minHeight)));
    }
    function applyMarginCollapse(parent, node, direction) {
        if (!node.lineBreak &&
            !node.plainText &&
            node === parent[direction ? 'firstChild' : 'lastChild'] &&
            parent[direction ? 'marginTop' : 'marginBottom'] > 0 &&
            parent[direction ? 'borderTopWidth' : 'borderBottomWidth'] === 0 &&
            parent[direction ? 'paddingTop' : 'paddingBottom'] === 0) {
            node.modifyBox(direction ? 2 /* MARGIN_TOP */ : 8 /* MARGIN_BOTTOM */, null);
        }
    }
    class WhiteSpace extends Extension {
        afterBaseLayout() {
            const processed = new Set();
            for (const node of this.application.processing.cache) {
                if (node.element && node.htmlElement && node.blockStatic) {
                    let firstChild;
                    let lastChild;
                    for (let i = 0; i < node.element.children.length; i++) {
                        const element = node.element.children[i];
                        let current = $dom$c.getElementAsNode(element);
                        if (current && current.pageFlow) {
                            if (firstChild === undefined) {
                                firstChild = current;
                            }
                            lastChild = current;
                            if (!current.lineBreak && current.blockStatic) {
                                const previousSiblings = current.previousSiblings();
                                if (previousSiblings.length) {
                                    let previous = previousSiblings[0];
                                    if (previous.blockStatic && !previous.lineBreak) {
                                        current = (current.renderAs || current);
                                        previous = (previous.renderAs || previous);
                                        let marginTop = $util$h.convertInt(current.cssInitial('marginTop', false, true));
                                        const marginBottom = $util$h.convertInt(current.cssInitial('marginBottom', false, true));
                                        const previousMarginTop = $util$h.convertInt(previous.cssInitial('marginTop', false, true));
                                        let previousMarginBottom = $util$h.convertInt(previous.cssInitial('marginBottom', false, true));
                                        if (previous.excluded && !current.excluded) {
                                            const offset = Math.min(previousMarginTop, previousMarginBottom);
                                            if (offset < 0) {
                                                if (Math.abs(offset) >= marginTop) {
                                                    current.modifyBox(2 /* MARGIN_TOP */, null);
                                                }
                                                else {
                                                    current.modifyBox(2 /* MARGIN_TOP */, offset);
                                                }
                                                processed.add(previous);
                                            }
                                        }
                                        else if (!previous.excluded && current.excluded) {
                                            const offset = Math.min(marginTop, marginBottom);
                                            if (offset < 0) {
                                                if (Math.abs(offset) >= previousMarginBottom) {
                                                    previous.modifyBox(8 /* MARGIN_BOTTOM */, null);
                                                }
                                                else {
                                                    previous.modifyBox(8 /* MARGIN_BOTTOM */, offset);
                                                }
                                                processed.add(current);
                                            }
                                        }
                                        else {
                                            if (marginTop === 0 && current.length) {
                                                const topChild = current.firstChild;
                                                if (topChild && topChild.blockStatic) {
                                                    marginTop = $util$h.convertInt(topChild.cssInitial('marginTop', false, true));
                                                    current = topChild;
                                                }
                                            }
                                            if (previousMarginBottom === 0 && previous.length) {
                                                const bottomChild = previous.lastChild;
                                                if (bottomChild && bottomChild.blockStatic) {
                                                    previousMarginBottom = $util$h.convertInt(bottomChild.cssInitial('marginBottom', false, true));
                                                    previous = bottomChild;
                                                }
                                            }
                                            if (previousMarginBottom > 0 && marginTop > 0) {
                                                if (marginTop <= previousMarginBottom) {
                                                    current.modifyBox(2 /* MARGIN_TOP */, null);
                                                }
                                                else {
                                                    previous.modifyBox(8 /* MARGIN_BOTTOM */, null);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (firstChild) {
                        applyMarginCollapse(node, firstChild, true);
                    }
                    if (lastChild) {
                        applyMarginCollapse(node, lastChild, false);
                    }
                }
            }
            if (this.application.processing.node && this.application.processing.node.htmlElement) {
                const elements = this.application.processing.node.element.getElementsByTagName('BR');
                for (let i = 0; i < elements.length; i++) {
                    const node = $dom$c.getElementAsNode(elements[i]);
                    if (node && !processed.has(node)) {
                        const actualParent = node.actualParent;
                        const previousSiblings = node.previousSiblings(true, true, true);
                        const nextSiblings = node.nextSiblings(true, true, true);
                        let valid = false;
                        if (previousSiblings.length && nextSiblings.length) {
                            if (nextSiblings[0].lineBreak) {
                                continue;
                            }
                            else {
                                valid = true;
                                const above = previousSiblings.pop();
                                const below = nextSiblings.pop();
                                if (above.inlineStatic && below.inlineStatic && previousSiblings.length === 0) {
                                    processed.add(node);
                                    continue;
                                }
                                let bottom;
                                let top;
                                if (above.lineHeight > 0 && above.element && above.cssTry('lineHeight', '0px')) {
                                    bottom = above.element.getBoundingClientRect().bottom + above.marginBottom;
                                    above.cssFinally('lineHeight');
                                }
                                else {
                                    bottom = above.linear.bottom;
                                }
                                if (below.lineHeight > 0 && below.element && below.cssTry('lineHeight', '0px')) {
                                    top = below.element.getBoundingClientRect().top - below.marginTop;
                                    below.cssFinally('lineHeight');
                                }
                                else {
                                    top = below.linear.top;
                                }
                                const aboveParent = above.visible ? above.renderParent : undefined;
                                const belowParent = below.visible ? below.renderParent : undefined;
                                const offset = top - bottom;
                                if (offset > 0) {
                                    if (belowParent && belowParent.groupParent && belowParent.firstChild === below) {
                                        belowParent.modifyBox(2 /* MARGIN_TOP */, offset);
                                    }
                                    else if (aboveParent && aboveParent.groupParent && aboveParent.lastChild === above) {
                                        aboveParent.modifyBox(8 /* MARGIN_BOTTOM */, offset);
                                    }
                                    else {
                                        if (belowParent && belowParent.layoutVertical && (below.visible || below.renderAs)) {
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
                        }
                        else if (actualParent && actualParent.visible) {
                            if (!actualParent.documentRoot && previousSiblings.length) {
                                const previousStart = previousSiblings[previousSiblings.length - 1];
                                const offset = actualParent.box.bottom - previousStart.linear[previousStart.lineBreak || previousStart.excluded ? 'top' : 'bottom'];
                                if (offset > 0) {
                                    if (previousStart.visible) {
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
                                if (offset > 0) {
                                    if (nextStart.visible) {
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
                            processed.add(node);
                            for (const item of previousSiblings) {
                                processed.add(item);
                            }
                            for (const item of nextSiblings) {
                                processed.add(item);
                            }
                        }
                    }
                }
            }
            for (const node of this.application.processing.excluded) {
                if (!processed.has(node) && !node.lineBreak) {
                    const offset = node.marginTop + node.marginBottom;
                    if (offset !== 0) {
                        const nextSiblings = node.nextSiblings(true, true, true);
                        if (nextSiblings.length) {
                            const below = nextSiblings.pop();
                            if (below.visible) {
                                below.modifyBox(2 /* MARGIN_TOP */, offset);
                                processed.add(node);
                            }
                        }
                    }
                }
            }
        }
        afterConstraints() {
            for (const node of this.application.processing.cache) {
                const renderParent = node.renderAs ? node.renderAs.renderParent : node.renderParent;
                if (renderParent && node.pageFlow) {
                    if (!renderParent.hasAlign(4 /* AUTO_LAYOUT */) && !node.alignParent('left') && node.styleElement && node.inlineVertical) {
                        const previous = [];
                        let current = node;
                        while (true) {
                            previous.push(...current.previousSiblings());
                            if (previous.length && !previous.some(item => item.lineBreak || item.excluded && item.blockStatic)) {
                                const previousSibling = previous[previous.length - 1];
                                if (previousSibling.inlineVertical) {
                                    const offset = node.linear.left - previous[previous.length - 1].actualRight();
                                    if (offset > 0) {
                                        (node.renderAs || node).modifyBox(16 /* MARGIN_LEFT */, offset);
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
