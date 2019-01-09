/* squared.base 0.1.0
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory((global.squared = global.squared || {}, global.squared.base = {})));
}(this, function (exports) { 'use strict';

    var APP_SECTION;
    (function (APP_SECTION) {
        APP_SECTION[APP_SECTION["NONE"] = 0] = "NONE";
        APP_SECTION[APP_SECTION["DOM_TRAVERSE"] = 2] = "DOM_TRAVERSE";
        APP_SECTION[APP_SECTION["EXTENSION"] = 4] = "EXTENSION";
        APP_SECTION[APP_SECTION["RENDER"] = 8] = "RENDER";
        APP_SECTION[APP_SECTION["ALL"] = 14] = "ALL";
    })(APP_SECTION || (APP_SECTION = {}));
    var NODE_RESOURCE;
    (function (NODE_RESOURCE) {
        NODE_RESOURCE[NODE_RESOURCE["NONE"] = 0] = "NONE";
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
        NODE_PROCEDURE[NODE_PROCEDURE["NONE"] = 0] = "NONE";
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
            let baseline = list.filter(item => {
                if (item.baseline || $util.isUnit(item.verticalAlign) && item.verticalAlign !== '0px') {
                    const position = item.cssInitial('position');
                    return position !== 'absolute' && position !== 'fixed';
                }
                return false;
            });
            if (baseline.length) {
                list = baseline;
            }
            baseline = list.filter(item => item.textElement || item.verticalAlign !== 'text-top' && item.verticalAlign !== 'text-bottom');
            if (baseline.length) {
                list = baseline;
            }
            if (text) {
                list = list.filter(item => item.element && !item.imageElement);
            }
            const lineHeight = $util.maxArray(list.map(node => node.lineHeight));
            const boundsHeight = $util.maxArray(list.map(node => node.bounds.height));
            return list.filter(item => lineHeight > boundsHeight ? item.lineHeight === lineHeight : item.bounds.height === boundsHeight).sort((a, b) => {
                if (a.groupParent || a.length > 0 || (!a.baseline && b.baseline)) {
                    return 1;
                }
                else if (b.groupParent || b.length > 0 || (a.baseline && !b.baseline)) {
                    return -1;
                }
                if (!a.imageElement || !b.imageElement) {
                    if (a.multiline || b.multiline) {
                        if (a.lineHeight && b.lineHeight) {
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
            return new Set(list.map(node => node.float).filter(value => value !== 'none'));
        }
        static cleared(list, parent = true) {
            if (parent && list.length > 1) {
                list.slice().sort(this.siblingIndex);
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
            const previous = {
                left: null,
                right: null
            };
            for (const node of list) {
                if (node.pageFlow) {
                    const clear = node.css('clear');
                    if (floated.size) {
                        const previousFloat = clear === 'both' ? [previous.left, previous.right]
                            : clear === 'left' ? [previous.left, null]
                                : clear === 'right' ? [null, previous.right] : [];
                        previousFloat.forEach(item => {
                            if (item && !node.floating && node.linear.top > item.linear.bottom && floated.has(item.float)) {
                                floated.delete(item.float);
                                previous[item.float] = null;
                            }
                        });
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
            return this.floated(parent.actualChildren.filter(item => item.pageFlow));
        }
        static clearedAll(parent) {
            return this.cleared(parent.actualChildren.filter(item => item.pageFlow), false);
        }
        static linearX(list) {
            const nodes = list.filter(node => node.pageFlow).sort(NodeList.siblingIndex);
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
                        const boxLeft = $util.minArray(nodes.map(node => node.linear.left));
                        const boxRight = $util.maxArray(nodes.map(node => node.linear.right));
                        const floatLeft = $util.maxArray(nodes.filter(node => node.float === 'left').map(node => node.linear.right));
                        const floatRight = $util.minArray(nodes.filter(node => node.float === 'right').map(node => node.linear.left));
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
            const nodes = list.filter(node => node.pageFlow).sort(NodeList.siblingIndex);
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
        get visible() {
            return this.children.filter(node => node.visible);
        }
        get elements() {
            return this.children.filter(node => node.visible && node.styleElement);
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
        initParent() {
            this.floated = this.getFloated(true);
            this.cleared = this.getCleared(true);
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
            return this.children.filter(node => node.visible);
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

    const $color = squared.lib.color;
    const $dom$1 = squared.lib.dom;
    const $util$2 = squared.lib.util;
    const $xml = squared.lib.xml;
    function colorStop(parse) {
        return `${parse ? '' : '(?:'},?\\s*(${parse ? '' : '?:'}rgba?\\(\\d+, \\d+, \\d+(?:, [\\d.]+)?\\)|[a-z]+)\\s*(${parse ? '' : '?:'}\\d+%)?${parse ? '' : ')'}`;
    }
    class Resource {
        constructor(application, cache) {
            this.application = application;
            this.cache = cache;
        }
        static generateId(section, name, start) {
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
            const stored = Resource.STORED[asset];
            if (stored) {
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
            for (const node of this.cache.elements) {
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
                            let cssColor = node.css(`${attr}Color`);
                            switch (cssColor.toLowerCase()) {
                                case 'initial':
                                    cssColor = '#000000';
                                    break;
                                case 'inherit':
                                case 'currentcolor':
                                    cssColor = $dom$1.cssInherit(node.element, `${attr}Color`);
                                    break;
                            }
                            let width = node.css(`${attr}Width`) || '1px';
                            const style = node.css(`${attr}Style`) || 'none';
                            if (style === 'inset' && width === '0px') {
                                width = '1px';
                            }
                            const color = $color.parseRGBA(cssColor, node.css('opacity'));
                            boxStyle[attr] = {
                                width,
                                style,
                                color: style !== 'none' && color ? color.valueRGBA : ''
                            };
                            break;
                        }
                        case 'borderRadius': {
                            const [top, right, bottom, left] = [
                                node.css('borderTopLeftRadius'),
                                node.css('borderTopRightRadius'),
                                node.css('borderBottomLeftRadius'),
                                node.css('borderBottomRightRadius')
                            ];
                            if (top === right && right === bottom && bottom === left) {
                                boxStyle.borderRadius = $util$2.convertInt(top) === 0 ? undefined : [top];
                            }
                            else {
                                boxStyle.borderRadius = [top, right, bottom, left];
                            }
                            break;
                        }
                        case 'backgroundColor': {
                            if (!node.has('backgroundColor') && (value === node.cssParent('backgroundColor', false, true) || node.documentParent.visible && $dom$1.cssFromParent(node.element, 'backgroundColor'))) {
                                boxStyle.backgroundColor = '';
                            }
                            else {
                                const color = $color.parseRGBA(value, node.css('opacity'));
                                boxStyle.backgroundColor = color ? color.valueRGBA : '';
                            }
                            break;
                        }
                        case 'background':
                        case 'backgroundImage': {
                            if (value !== 'none' && !node.hasBit('excludeResource', NODE_RESOURCE.IMAGE_SOURCE)) {
                                const gradients = [];
                                let pattern = new RegExp(`([a-z\-]+)-gradient\\(([\\w\\s%]+)?(${colorStop(false)}+)\\)`, 'g');
                                let match;
                                while ((match = pattern.exec(value)) !== null) {
                                    let gradient;
                                    if (match[1] === 'linear') {
                                        if (!/^to/.test(match[2]) && !/deg$/.test(match[2])) {
                                            match[3] = match[2] + match[3];
                                            match[2] = '180deg';
                                        }
                                        gradient = {
                                            type: 'linear',
                                            angle: (() => {
                                                switch (match[2]) {
                                                    case 'to top':
                                                        return 0;
                                                    case 'to right top':
                                                        return 45;
                                                    case 'to right':
                                                        return 90;
                                                    case 'to right bottom':
                                                        return 135;
                                                    case 'to bottom':
                                                        return 180;
                                                    case 'to left bottom':
                                                        return 225;
                                                    case 'to left':
                                                        return 270;
                                                    case 'to left top':
                                                        return 315;
                                                    default:
                                                        return $util$2.convertInt(match[2]);
                                                }
                                            })(),
                                            colorStop: []
                                        };
                                    }
                                    else {
                                        gradient = {
                                            type: 'radial',
                                            position: (() => {
                                                const result = ['ellipse', 'center'];
                                                if (match[2]) {
                                                    const shape = match[2].split('at').map(item => item.trim());
                                                    switch (shape[0]) {
                                                        case 'ellipse':
                                                        case 'circle':
                                                        case 'closest-side':
                                                        case 'closest-corner':
                                                        case 'farthest-side':
                                                        case 'farthest-corner':
                                                            result[0] = shape[0];
                                                            break;
                                                        default:
                                                            result[1] = shape[0];
                                                            break;
                                                    }
                                                    if (shape[1]) {
                                                        result[1] = shape[1];
                                                    }
                                                }
                                                return result;
                                            })(),
                                            colorStop: []
                                        };
                                    }
                                    const stopMatch = match[3].trim().split(new RegExp(colorStop(true), 'g'));
                                    const opacity = node.css('opacity');
                                    for (let i = 0; i < stopMatch.length; i += 3) {
                                        const rgba = stopMatch[i + 1];
                                        if (rgba) {
                                            const color = $color.parseRGBA(rgba, opacity);
                                            if (color && color.visible) {
                                                gradient.colorStop.push({
                                                    color: color.valueRGBA,
                                                    offset: stopMatch[i + 2] || '0%',
                                                    opacity: color.alpha
                                                });
                                            }
                                        }
                                    }
                                    if (gradient.colorStop.length > 1) {
                                        gradients.push(gradient);
                                    }
                                }
                                if (gradients.length) {
                                    boxStyle.backgroundGradient = gradients;
                                }
                                else {
                                    const images = [];
                                    pattern = new RegExp($util$2.REGEX_PATTERN.CSS_URL, 'g');
                                    match = null;
                                    while ((match = pattern.exec(value)) !== null) {
                                        if (match) {
                                            images.push(match[0]);
                                        }
                                    }
                                    if (images.length) {
                                        boxStyle.backgroundImage = images;
                                    }
                                }
                            }
                            break;
                        }
                        case 'backgroundSize':
                        case 'backgroundRepeat':
                        case 'backgroundPositionX':
                        case 'backgroundPositionY': {
                            boxStyle[attr] = value;
                            break;
                        }
                    }
                }
                const borderTop = JSON.stringify(boxStyle.borderTop);
                if (borderTop === JSON.stringify(boxStyle.borderRight) && borderTop === JSON.stringify(boxStyle.borderBottom) && borderTop === JSON.stringify(boxStyle.borderLeft)) {
                    boxStyle.border = boxStyle.borderTop;
                }
                node.data(Resource.KEY_NAME, 'boxStyle', boxStyle);
            }
        }
        setFontStyle() {
            for (const node of this.cache) {
                const backgroundImage = Resource.hasDrawableBackground(node.data(Resource.KEY_NAME, 'boxStyle'));
                if (!(node.renderChildren.length ||
                    !node.element ||
                    node.imageElement ||
                    node.svgElement ||
                    node.tagName === 'HR' ||
                    node.inlineText && !backgroundImage && !node.preserveWhiteSpace && node.element.innerHTML.trim() === '')) {
                    const opacity = node.css('opacity');
                    const color = $color.parseRGBA(node.css('color'), opacity);
                    let backgroundColor;
                    if (backgroundImage ||
                        node.cssParent('backgroundColor', false, true) === node.css('backgroundColor') && (node.plainText || node.style.backgroundColor !== node.cssInitial('backgroundColor')) ||
                        !node.has('backgroundColor') && node.documentParent.visible && $dom$1.cssFromParent(node.element, 'backgroundColor')) {
                        backgroundColor = null;
                    }
                    else {
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
                        value = value.replace(/\n/g, '\\n');
                        value = value.replace(/\s/g, '&#160;');
                        break;
                    case 'pre-line':
                        value = value.replace(/\n/g, '\\n');
                        value = value.replace(/\s+/g, ' ');
                        break;
                    default:
                        const element = node.element;
                        if (element) {
                            if (element.previousSibling && $dom$1.isLineBreak(element.previousSibling)) {
                                value = value.replace(/^\s+/, '');
                            }
                            if (element.nextSibling && $dom$1.isLineBreak(element.nextSibling)) {
                                value = value.replace(/\s+$/, '');
                            }
                        }
                        return [value, false];
                }
                return [value, true];
            }
            for (const node of this.cache.visible) {
                const element = node.element;
                if (element) {
                    let name = '';
                    let value = '';
                    let inlineTrim = false;
                    let performTrim = true;
                    if (element instanceof HTMLInputElement) {
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
                    else if (element instanceof HTMLTextAreaElement) {
                        value = element.value.trim();
                    }
                    else if (element instanceof HTMLElement) {
                        if (element.tagName === 'BUTTON') {
                            value = element.innerText;
                        }
                        else if (node.inlineText) {
                            name = node.textContent.trim();
                            if (element.tagName === 'CODE') {
                                value = $xml.replaceEntity(element.innerHTML);
                            }
                            else if ($dom$1.hasLineBreak(element, true)) {
                                value = $xml.replaceEntity(element.innerHTML);
                                value = value.replace(/\s*<br[^>]*>\s*/g, '\\n');
                                value = value.replace(/(<([^>]+)>)/ig, '');
                            }
                            else {
                                value = $xml.replaceEntity(node.textContent);
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
                                    value = value + '&#160;';
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
    function prioritizeExtensions(documentRoot, element, extensions) {
        const tagged = [];
        let current = element;
        do {
            if (current.dataset.use) {
                tagged.push(...current.dataset.use.split(',').map(value => value.trim()));
            }
            current = current !== documentRoot ? current.parentElement : null;
        } while (current);
        if (tagged.length) {
            const result = [];
            const untagged = [];
            for (const item of extensions) {
                const index = tagged.indexOf(item.name);
                if (index !== -1) {
                    result[index] = item;
                }
                else {
                    untagged.push(item);
                }
            }
            return [...result.filter(item => item), ...untagged];
        }
        else {
            return extensions;
        }
    }
    function checkPositionStatic(node, parent) {
        const previousSiblings = node.previousSiblings();
        const nextSiblings = node.nextSiblings();
        if (node.positionAuto &&
            (previousSiblings.length === 0 || !previousSiblings.some(item => item.multiline > 0 || item.excluded && !item.blockStatic)) &&
            (nextSiblings.length === 0 || nextSiblings.every(item => item.blockStatic || item.lineBreak || item.excluded) || node.element === $dom$2.getLastChildElement(parent.element))) {
            node.css({
                'position': 'static',
                'display': 'inline-block',
                'verticalAlign': 'top'
            }, '', true);
            return true;
        }
        return false;
    }
    class Application {
        constructor(framework, controllerConstructor, resourceConstructor, extensionManagerHandler, nodeConstructor) {
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
                    element.dataset.layoutName = $util$3.convertWord(iteration > 1 ? `${filename}_${iteration}` : filename);
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
                Array.from(this.parseElements).forEach(element => {
                    element.querySelectorAll('svg image').forEach((image) => {
                        const uri = $util$3.resolvePath(image.href.baseVal);
                        this.session.image.set(uri, {
                            width: image.width.baseVal.value,
                            height: image.height.baseVal.value,
                            uri
                        });
                    });
                });
                for (const image of this.session.image.values()) {
                    if (image.width === 0 && image.height === 0 && image.uri) {
                        const imageElement = document.createElement('img');
                        imageElement.src = image.uri;
                        if (imageElement.complete && imageElement.naturalWidth > 0 && imageElement.naturalHeight > 0) {
                            image.width = imageElement.naturalWidth;
                            image.height = imageElement.naturalHeight;
                        }
                        else {
                            imageElement.className = '__css.preload';
                            imageElement.style.display = 'none';
                            documentRoot.appendChild(imageElement);
                        }
                    }
                }
            }
            const images = [];
            for (const element of this.parseElements) {
                Array.from(element.querySelectorAll('IMG')).forEach((image) => {
                    if (!(image instanceof SVGImageElement)) {
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
                Promise.all(images.map(image => {
                    return new Promise((resolve, reject) => {
                        image.onload = resolve;
                        image.onerror = reject;
                    });
                }))
                    .then((result) => {
                    if (Array.isArray(result)) {
                        for (const item of result) {
                            try {
                                this.addImagePreload(item.target);
                            }
                            catch (_a) {
                            }
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
            const renderFloat = $util$3.hasBit(layout.renderType, 64 /* FLOAT */);
            if (renderFloat && $util$3.hasBit(layout.renderType, 8 /* HORIZONTAL */)) {
                output = this.processFloatHorizontal(layout);
            }
            else if (renderFloat && $util$3.hasBit(layout.renderType, 16 /* VERTICAL */)) {
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
                            const view = templates.get(key);
                            if (view) {
                                const indent = node.renderDepth + 1;
                                if (item.renderDepth !== indent) {
                                    templates.set(key, this.controllerHandler.replaceIndent(view, indent, this.processing.cache.children));
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
                        const previous = mapParent.children.filter(item => !parent.contains(item));
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
                    children = renderMap.children.filter(item => !parent.contains(item));
                    children.push(...parent.children);
                }
                else {
                    children = parent.duplicate();
                }
                this._renderPosition.set(parent.id, { parent, children });
            }
        }
        toString() {
            return this._views.length ? this._views[0].content : '';
        }
        createCache(documentRoot) {
            const elements = (() => {
                if (documentRoot === document.body) {
                    let i = 0;
                    return document.querySelectorAll(Array.from(document.body.childNodes).some((item) => this.conditionElement(item) && ++i > 1) ? 'body, body *' : 'body *');
                }
                else {
                    return documentRoot.querySelectorAll('*');
                }
            })();
            this.processing.cache.afterAppend = undefined;
            this.processing.cache.clear();
            this.processing.excluded.clear();
            this.processing.node = null;
            for (const ext of this.extensions) {
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
            for (const element of Array.from(elements)) {
                if (!this.parseElements.has(element)) {
                    prioritizeExtensions(documentRoot, element, Array.from(this.extensions)).some(item => item.init(element));
                    if (!this.parseElements.has(element) && !(localSettings.unsupported.tagName.has(element.tagName) || element instanceof HTMLInputElement && localSettings.unsupported.tagName.has(`${element.tagName}:${element.type}`))) {
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
            }
            if (this.processing.cache.length) {
                for (const node of this.processing.cache) {
                    if (node.htmlElement && node.tagName !== 'SELECT') {
                        const plainText = [];
                        let valid = false;
                        Array.from(node.element.childNodes).forEach((element) => {
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
                            plainText.forEach(element => this.insertNode(element, node));
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
                            ['top', 'right', 'bottom', 'left'].forEach(attr => {
                                if (node.has(attr)) {
                                    reset[attr] = node.css(attr);
                                    element.style[attr] = 'auto';
                                }
                            });
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
                                if (parent && checkPositionStatic(node, parent)) {
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
                                                    if (node.left < 0 && node.outsideX(parent.box) ||
                                                        !node.has('left') && node.right < 0 && node.outsideX(parent.box) ||
                                                        node.top < 0 && node.outsideY(parent.box) ||
                                                        !node.has('top') && node.bottom < 0 && node.outsideX(parent.box)) {
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
                        Array.from(node.element.childNodes).forEach((element) => {
                            const item = $dom$2.getElementAsNode(element);
                            if (item && !item.excluded && (item.pageFlow || item.documentParent === node)) {
                                item.siblingIndex = i++;
                            }
                        });
                        const layers = [];
                        node.each((item) => {
                            if (item.siblingIndex === Number.MAX_VALUE) {
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
                                    if (item.siblingIndex !== Number.MAX_VALUE && item.siblingIndex >= j) {
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
                for (const ext of this.extensions) {
                    ext.afterInit(documentRoot);
                }
                return true;
            }
            return false;
        }
        setBaseLayout() {
            const settings = this.userSettings;
            const localSettings = this.controllerHandler.localSettings;
            const documentRoot = this.processing.node;
            const extensions = Array.from(this.extensions).filter(item => !item.eventOnly);
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
            for (const node of this.processing.cache.visible) {
                setMapY(node.depth, node.id, node);
                maxDepth = Math.max(node.depth, maxDepth);
            }
            for (let i = 0; i < maxDepth; i++) {
                mapY.set((i * -1) - 2, new Map());
            }
            this.processing.cache.afterAppend = (node) => {
                deleteMapY(node.id);
                setMapY((node.depth * -1) - 2, node.id, node);
                node.cascade().forEach((item) => {
                    deleteMapY(item.id);
                    setMapY((item.depth * -1) - 2, item.id, item);
                });
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
                    const extensionsChild = extensions.filter(item => item.subscribersChild.size);
                    let k = -1;
                    while (++k < axisY.length) {
                        let nodeY = axisY[k];
                        if (nodeY.rendered || !nodeY.visible || this.parseElements.has(nodeY.element) && !nodeY.documentRoot && !nodeY.documentBody) {
                            continue;
                        }
                        let parentY = nodeY.parent;
                        let unknownParent = parentY.hasAlign(2 /* UNKNOWN */);
                        const extendable = nodeY.hasAlign(8192 /* EXTENDABLE */);
                        if (nodeY.pageFlow &&
                            axisY.length > 1 &&
                            k < axisY.length - 1 &&
                            !parentY.hasAlign(4 /* AUTO_LAYOUT */) &&
                            (parentY.alignmentType === 0 || unknownParent || extendable) &&
                            !nodeY.hasBit('excludeSection', APP_SECTION.DOM_TRAVERSE)) {
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
                                        return true;
                                    }
                                }
                                vertical.push(node);
                                return true;
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
                                                        if (!settings.floatOverlapDisabled &&
                                                            floatSegment.size &&
                                                            !previous.autoMargin.horizontal &&
                                                            !previousSiblings.some(node => node.lineBreak && !cleared.has(node)) &&
                                                            cleared.get(item) !== 'both') {
                                                            const floatBottom = $util$3.maxArray(horizontal.filter(node => node.floating).map(node => node.linear.bottom));
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
                            let segmentEnd;
                            if (horizontal.length > 1) {
                                const layout = new Layout(parentY, nodeY, 0, 0, horizontal.length, horizontal);
                                layout.init();
                                result = this.controllerHandler.processTraverseHorizontal(layout, axisY);
                                segmentEnd = horizontal[horizontal.length - 1];
                            }
                            else if (vertical.length > 1) {
                                const layout = new Layout(parentY, nodeY, 0, 0, vertical.length, vertical);
                                layout.init();
                                result = this.controllerHandler.processTraverseVertical(layout, axisY);
                                segmentEnd = vertical[vertical.length - 1];
                                if (!segmentEnd.blockStatic && segmentEnd !== axisY[axisY.length - 1]) {
                                    segmentEnd.alignmentType |= 8192 /* EXTENDABLE */;
                                }
                            }
                            if (unknownParent && segmentEnd === axisY[axisY.length - 1]) {
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
                        if (unknownParent && k === axisY.length - 1) {
                            parentY.alignmentType ^= 2 /* UNKNOWN */;
                        }
                        if (extendable) {
                            nodeY.alignmentType ^= 8192 /* EXTENDABLE */;
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
                            if (parentY.renderExtension.size || extensionsChild.length) {
                                for (const ext of [...parentY.renderExtension, ...extensionsChild.filter(item => item.subscribersChild.has(nodeY))]) {
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
                    const renderPosition = this._renderPosition.get(id);
                    let children;
                    if (renderPosition) {
                        children = this.controllerHandler.sortRenderPosition(renderPosition.parent, renderPosition.children);
                    }
                    else if (id !== 0) {
                        const parent = this.processing.cache.find('id', id);
                        children = parent ? this.controllerHandler.sortRenderPosition(parent, parent.children) : [];
                    }
                    if (children && children.length) {
                        const sorted = new Map();
                        children.forEach(node => {
                            const key = node.renderPositionId;
                            const result = templates.get(key) || (node.companion ? templates.get(node.companion.renderPositionId) : null);
                            if (result) {
                                sorted.set(key, result);
                            }
                        });
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
                        const placeholder = $xml$1.formatPlaceholder(key.indexOf('^') !== -1 ? key : id);
                        if (baseTemplate.indexOf(placeholder) !== -1) {
                            baseTemplate = $xml$1.replacePlaceholder(baseTemplate, placeholder, view);
                            empty = false;
                        }
                        else {
                            this.addRenderQueue(key.indexOf('^') !== -1 ? `${id}|${key}` : id.toString(), view);
                        }
                    }
                }
            }
            if (documentRoot.dataset.layoutName && (!$util$3.hasValue(documentRoot.dataset.target) || documentRoot.renderExtension.size === 0)) {
                this.addLayoutFile(documentRoot.dataset.layoutName, !empty ? baseTemplate : '', $util$3.trimString($util$3.trimNull(documentRoot.dataset.pathname), '/'), documentRoot.renderExtension.size > 0 && Array.from(documentRoot.renderExtension).some(item => item.documentRoot));
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
                    if (data.cleared.has(node)) {
                        const clear = data.cleared.get(node);
                        if ($util$3.hasBit(pendingFloat, clear === 'right' ? 4 : 2) || pendingFloat !== 0 && clear === 'both') {
                            switch (clear) {
                                case 'left':
                                    pendingFloat ^= 2;
                                    current = 'left';
                                    break;
                                case 'right':
                                    pendingFloat ^= 4;
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
                    layerIndex = layerIndex.filter(item => item.length > 0);
                    layout.itemCount = layerIndex.length;
                    let vertical;
                    if (inlineAbove.length === 0 && (leftSub.length === 0 || rightSub.length === 0)) {
                        vertical = this.controllerHandler.containerTypeVertical;
                    }
                    else {
                        vertical = this.controllerHandler.containerTypeVerticalMargin;
                    }
                    layout.setType(vertical.containerType, vertical.alignmentType);
                    output = this.renderNode(layout);
                }
            }
            if (layerIndex.length) {
                const floating = [inlineAbove, leftAbove, leftBelow, rightAbove, rightBelow];
                let floatgroup;
                layerIndex.forEach((item, index) => {
                    if (Array.isArray(item[0])) {
                        const grouping = [];
                        item.forEach(segment => grouping.push(...segment));
                        grouping.sort(NodeList.siblingIndex);
                        floatgroup = this.controllerHandler.createNodeGroup(grouping[0], grouping, data.node);
                        const layout = new Layout(data.node, floatgroup, 0, (item.some(segment => segment === rightSub || segment === rightAbove) ? 512 /* RIGHT */ : 0), item.length);
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
                        floatgroup = null;
                    }
                    (Array.isArray(item[0]) ? item : [item]).forEach(segment => {
                        let basegroup = data.node;
                        if (floatgroup && floating.includes(segment)) {
                            basegroup = floatgroup;
                        }
                        let target;
                        if (segment.length > 1) {
                            target = this.controllerHandler.createNodeGroup(segment[0], segment, basegroup);
                            const layout = new Layout(basegroup, target, 0, 128 /* SEGMENTED */, segment.length, segment);
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
                        else if (segment.length) {
                            target = segment[0];
                            target.alignmentType |= 2048 /* SINGLE */;
                            target.renderPosition = index;
                            output = $xml$1.replacePlaceholder(output, basegroup.id, $xml$1.formatPlaceholder(target.renderPositionId));
                        }
                        if (!settings.floatOverlapDisabled && target && segment === inlineAbove && segment.some(subitem => subitem.blockStatic && !subitem.hasWidth)) {
                            const vertical = this.controllerHandler.containerTypeVertical;
                            const targeted = target.of(vertical.containerType, vertical.alignmentType) ? target.children : [target];
                            if (leftAbove.length) {
                                const marginRight = $util$3.maxArray(leftAbove.map(subitem => subitem.linear.right));
                                const boundsLeft = $util$3.minArray(segment.map(subitem => subitem.bounds.left));
                                targeted.forEach(subitem => subitem.modifyBox(256 /* PADDING_LEFT */, marginRight - boundsLeft));
                            }
                            if (rightAbove.length) {
                                const marginLeft = $util$3.minArray(rightAbove.map(subitem => subitem.linear.left));
                                const boundsRight = $util$3.maxArray(segment.map(subitem => subitem.bounds.right));
                                targeted.forEach(subitem => subitem.modifyBox(64 /* PADDING_RIGHT */, boundsRight - marginLeft));
                            }
                        }
                    });
                });
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
                            staticRows.push(current.slice());
                            current.length = 0;
                            floatedRows.push(floated.slice());
                            floated.length = 0;
                        }
                        else {
                            clearReset = true;
                        }
                    }
                    if (node.floating) {
                        if (blockArea) {
                            staticRows.push(current.slice());
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
                            children.forEach(node => {
                                if (data.contains(node) || node.length === 0) {
                                    xml = $xml$1.replacePlaceholder(xml, basegroup.id, $xml$1.formatPlaceholder(node.id));
                                }
                                else {
                                    const layoutSegment = new Layout(basegroup, node, vertical.containerType, vertical.alignmentType | 128 /* SEGMENTED */, node.length, node.children);
                                    xml = $xml$1.replacePlaceholder(xml, basegroup.id, this.renderNode(layoutSegment));
                                }
                            });
                        }
                    }
                }
                output = $xml$1.replacePlaceholder(output, group.id, xml);
            }
            return output;
        }
        insertNode(element, parent) {
            let node = null;
            if ($dom$2.hasComputedStyle(element)) {
                const nodeConstructor = new this.nodeConstructor(this.nextId, element, this.controllerHandler.afterInsertNode);
                if (!this.controllerHandler.localSettings.unsupported.excluded.has(element.tagName) && this.conditionElement(element)) {
                    node = nodeConstructor;
                    node.setExclusions();
                }
                else {
                    nodeConstructor.visible = false;
                    nodeConstructor.excluded = true;
                    this.processing.excluded.append(nodeConstructor);
                }
            }
            else if (element.nodeName.charAt(0) === '#' && element.nodeName === '#text') {
                if ($dom$2.isPlainText(element, true) || $dom$2.cssParent(element, 'whiteSpace', 'pre', 'pre-wrap')) {
                    node = new this.nodeConstructor(this.nextId, element, this.controllerHandler.afterInsertNode);
                    if (parent) {
                        node.inherit(parent, 'textStyle');
                    }
                    else {
                        node.css('whiteSpace', $dom$2.getStyle(element.parentElement).whiteSpace || 'normal');
                    }
                    node.css({
                        position: 'static',
                        display: 'inline',
                        verticalAlign: 'baseline',
                        cssFloat: 'none',
                        clear: 'none',
                    });
                }
            }
            if (node) {
                this.processing.cache.append(node);
            }
            return node;
        }
        conditionElement(element) {
            if (element instanceof SVGGraphicsElement && !(element.parentElement instanceof HTMLElement)) {
                return false;
            }
            else if ($dom$2.hasComputedStyle(element)) {
                if ($util$3.hasValue(element.dataset.use)) {
                    return true;
                }
                else if ($dom$2.withinViewportOrigin(element)) {
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
                    if (valid && element.children.length) {
                        return Array.from(element.children).some((item) => {
                            const style = $dom$2.getStyle(item);
                            const float = style.cssFloat;
                            const position = style.position;
                            return position === 'absolute' || position === 'fixed' || float === 'left' || float === 'right';
                        });
                    }
                }
                return false;
            }
            else {
                return $dom$2.isPlainText(element);
            }
        }
        setStyleMap() {
            const dpi = this.userSettings.resolutionDPI;
            const clientFirefox = $dom$2.isUserAgent(16 /* FIREFOX */);
            let warning = false;
            for (let i = 0; i < document.styleSheets.length; i++) {
                const styleSheet = document.styleSheets[i];
                if (styleSheet.cssRules) {
                    for (let j = 0; j < styleSheet.cssRules.length; j++) {
                        try {
                            if (styleSheet.cssRules[j] instanceof CSSStyleRule) {
                                const cssRule = styleSheet.cssRules[j];
                                const attrRule = new Set();
                                Array.from(cssRule.style).forEach(value => attrRule.add($util$3.convertCamelCase(value)));
                                Array.from(document.querySelectorAll(cssRule.selectorText)).forEach((element) => {
                                    const attrs = new Set(attrRule);
                                    Array.from(element.style).forEach(value => attrs.add($util$3.convertCamelCase(value)));
                                    const style = $dom$2.getStyle(element);
                                    const fontSize = parseInt($util$3.convertPX(style.fontSize || '16px', dpi, 0));
                                    const styleMap = {};
                                    for (const attr of attrs) {
                                        if (element.style[attr]) {
                                            styleMap[attr] = element.style[attr];
                                        }
                                        else {
                                            const value = cssRule.style[attr];
                                            if (value !== 'initial') {
                                                const computedValue = style[attr] || '';
                                                if (value === computedValue) {
                                                    styleMap[attr] = value;
                                                }
                                                else {
                                                    switch (attr) {
                                                        case 'backgroundColor':
                                                        case 'borderTopColor':
                                                        case 'borderRightColor':
                                                        case 'borderBottomColor':
                                                        case 'borderLeftColor':
                                                        case 'color':
                                                        case 'fontSize':
                                                        case 'fontWeight':
                                                            styleMap[attr] = computedValue || value;
                                                            break;
                                                        case 'width':
                                                        case 'height':
                                                        case 'minWidth':
                                                        case 'maxWidth':
                                                        case 'minHeight':
                                                        case 'maxHeight':
                                                        case 'lineHeight':
                                                        case 'verticalAlign':
                                                        case 'textIndent':
                                                        case 'columnGap':
                                                        case 'top':
                                                        case 'right':
                                                        case 'bottom':
                                                        case 'left':
                                                        case 'marginTop':
                                                        case 'marginRight':
                                                        case 'marginBottom':
                                                        case 'marginLeft':
                                                        case 'paddingTop':
                                                        case 'paddingRight':
                                                        case 'paddingBottom':
                                                        case 'paddingLeft':
                                                            styleMap[attr] = /^[A-Za-z\-]+$/.test(value) || $util$3.isPercent(value) ? value : $util$3.convertPX(value, dpi, fontSize);
                                                            break;
                                                        default:
                                                            if (styleMap[attr] === undefined) {
                                                                styleMap[attr] = value;
                                                            }
                                                            break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    if (this.userSettings.preloadImages && $util$3.hasValue(styleMap.backgroundImage) && styleMap.backgroundImage !== 'initial') {
                                        styleMap.backgroundImage.split(',').map(value => value.trim()).forEach(value => {
                                            const uri = $dom$2.cssResolveUrl(value);
                                            if (uri !== '' && !this.session.image.has(uri)) {
                                                this.session.image.set(uri, { width: 0, height: 0, uri });
                                            }
                                        });
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
                        }
                        catch (error) {
                            if (!warning) {
                                alert('External CSS files cannot be parsed with Chrome 64+ when loading HTML pages directly from your hard drive [file://]. ' +
                                    'Either use a local web server [http://], embed your CSS into a &lt;style&gt; element, or use a different browser. ' +
                                    'See the README for more detailed instructions.\n\n' +
                                    `${styleSheet.href}\n\n${error}`);
                                warning = true;
                            }
                        }
                    }
                }
            }
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

    const $util$4 = squared.lib.util;
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
            const indent = $util$4.repeat(Math.max(0, depth));
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
            return value.replace(/{[<:@#>]\d+(\^\d+)?}/g, '').trim();
        }
        replaceIndent(value, depth, cache) {
            value = $xml$2.replaceIndent(value, depth, /^({.*?})(\t*)(<.*)/);
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
    const $util$5 = squared.lib.util;
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
                this.tagNames = tagNames.map(value => value.trim().toUpperCase());
            }
            if (options) {
                Object.assign(this.options, options);
            }
        }
        static findNestedByName(element, name) {
            if ($dom$3.hasComputedStyle(element)) {
                return Array.from(element.children).find((item) => $util$5.includes(item.dataset.use, name)) || null;
            }
            return null;
        }
        is(node) {
            return node.styleElement ? this.tagNames.length === 0 || this.tagNames.includes(node.element.tagName) : false;
        }
        require(name, preload = false) {
            this.dependencies.push({
                name,
                preload
            });
        }
        included(element) {
            return $util$5.includes(element.dataset.use, this.name);
        }
        beforeInit(element, recursive = false) {
            if (!recursive && this.included(element)) {
                this.dependencies.filter(item => item.preload).forEach(item => {
                    const ext = this.application.extensionManager.retrieve(item.name);
                    if (ext && !ext.preloaded) {
                        ext.beforeInit(element, true);
                        ext.preloaded = true;
                    }
                });
            }
        }
        init(element) {
            return false;
        }
        afterInit(element, recursive = false) {
            if (!recursive && this.included(element)) {
                this.dependencies.filter(item => item.preload).forEach(item => {
                    const ext = this.application.extensionManager.retrieve(item.name);
                    if (ext && ext.preloaded) {
                        ext.afterInit(element, true);
                        ext.preloaded = false;
                    }
                });
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
            return Array.from(this.application.extensions).find(item => item.name === name) || null;
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
            const settings = this.userSettings;
            if (!location.protocol.startsWith('http')) {
                alert('SERVER (required): See README for instructions');
                return;
            }
            if (files.length) {
                files.push(...this.assets);
                fetch(`/api/savetodisk` +
                    `?directory=${encodeURIComponent($util$7.trimString(settings.outputDirectory, '/'))}` +
                    `&appname=${encodeURIComponent(this.appName.trim())}` +
                    `&filetype=${settings.outputArchiveFileType.toLowerCase()}` +
                    `&processingtime=${settings.outputMaxProcessingTime.toString().trim()}`, {
                    method: 'POST',
                    body: JSON.stringify(files),
                    headers: new Headers({ 'Accept': 'application/json, text/plain, */*', 'Content-Type': 'application/json' })
                })
                    .then((response) => response.json())
                    .then((result) => {
                    if (result) {
                        if (result.zipname) {
                            fetch(`/api/downloadtobrowser?filename=${encodeURIComponent(result.zipname)}`)
                                .then((responseBlob) => responseBlob.blob())
                                .then((blob) => File.downloadToDisk(blob, $util$7.lastIndexOf(result.zipname)));
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
    const $util$8 = squared.lib.util;
    class Node extends squared.lib.base.Container {
        constructor(id, element) {
            super();
            this.id = id;
            this.alignmentType = 0;
            this.depth = -1;
            this.siblingIndex = Number.MAX_VALUE;
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
            this._initialized = false;
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
            if ($dom$4.hasComputedStyle(element)) {
                this.style = $dom$4.getElementCache(element, 'style') || getComputedStyle(element);
            }
            else {
                this.style = {};
            }
        }
        init() {
            if (!this._initialized) {
                if (this.styleElement) {
                    const element = this._element;
                    const styleMap = $dom$4.getElementCache(element, 'styleMap') || {};
                    Array.from(element.style).forEach(attr => styleMap[$util$8.convertCamelCase(attr)] = element.style[attr]);
                    this._styleMap = Object.assign({}, styleMap);
                }
                if (this._element) {
                    $dom$4.setElementCache(this._element, 'node', this);
                }
                this._initialized = true;
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
        each(predicate, rendered = false) {
            (rendered ? this.renderChildren.filter(node => node.visible) : this.children).forEach(predicate);
            return this;
        }
        render(parent) {
            this.renderParent = parent;
            this.renderDepth = this.documentRoot || this === parent || $util$8.hasValue(parent.dataset.target) ? 0 : parent.renderDepth + 1;
            this.rendered = true;
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
            function cascade(node) {
                const current = [];
                for (const item of node.children) {
                    if (!element || item.element) {
                        current.push(item);
                    }
                    if (item.length) {
                        current.push(...cascade(item));
                    }
                }
                return current;
            }
            return cascade(this);
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
                        ['position', 'top', 'right', 'bottom', 'left', 'display', 'verticalAlign', 'cssFloat', 'clear', 'zIndex'].forEach(attr => {
                            this._styleMap[attr] = node.css(attr);
                            this._initial.styleMap[attr] = initial.styleMap[attr];
                        });
                        ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'].forEach(attr => {
                            if (node.cssInitial(attr) === 'auto') {
                                this._initial.styleMap[attr] = 'auto';
                            }
                            if (node.cssInitial(attr, true) === 'auto') {
                                this._styleMap[attr] = 'auto';
                            }
                        });
                        break;
                    case 'styleMap':
                        $util$8.assignWhenNull(this._styleMap, node.unsafe('styleMap'));
                        break;
                    case 'textStyle':
                        const style = { whiteSpace: node.css('whiteSpace') };
                        for (const attr in node.style) {
                            if (attr.startsWith('font') || attr.startsWith('color')) {
                                const key = $util$8.convertCamelCase(attr);
                                style[key] = node.style[key];
                            }
                        }
                        this.css(style);
                        break;
                }
            }
        }
        alignedVertically(previousSiblings, siblings, cleared, checkFloat = true) {
            if (this.lineBreak) {
                return true;
            }
            if (this.pageFlow && previousSiblings.length) {
                if ($util$8.isArray(siblings) && this !== siblings[0]) {
                    if (cleared && cleared.has(this)) {
                        return true;
                    }
                    if (checkFloat) {
                        const previous = siblings[siblings.length - 1];
                        if (this.floating && (this.linear.top >= previous.linear.bottom ||
                            this.float === 'left' && siblings.filter(node => node.siblingIndex < this.siblingIndex && $util$8.withinFraction(this.linear.left, node.linear.left)).length > 0 ||
                            this.float === 'right' && siblings.filter(node => node.siblingIndex < this.siblingIndex && $util$8.withinFraction(this.linear.right, node.linear.right)).length > 0)) {
                            return true;
                        }
                    }
                }
                const actualParent = this.actualParent;
                for (const previous of previousSiblings) {
                    const vertical = (previous.blockStatic ||
                        this.blockStatic && (!previous.inlineFlow ||
                            cleared && cleared.has(previous)) ||
                        cleared && cleared.get(previous) === 'both' && (!$util$8.isArray(siblings) || siblings[0] !== previous) ||
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
            if (typeof attr === 'object') {
                Object.assign(this._styleMap, attr);
                if (cache) {
                    for (const name in attr) {
                        this.unsetCache(name);
                    }
                }
                return '';
            }
            else {
                if (arguments.length >= 2) {
                    this._styleMap[attr] = $util$8.hasValue(value) ? value : '';
                    if (cache) {
                        this.unsetCache(attr);
                    }
                }
                return this._styleMap[attr] || this.style && this.style[attr] || '';
            }
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
        cssParent(attr, childStart = false, visible = false) {
            let result = '';
            let current = childStart ? this : this.actualParent;
            while (current) {
                result = current.cssInitial(attr);
                if (result || current.documentBody) {
                    if (visible && !current.visible) {
                        result = '';
                    }
                    break;
                }
                current = current.actualParent;
            }
            return result;
        }
        cssSort(attr, desc = false, duplicate = false) {
            const children = (duplicate ? this.duplicate() : this.children);
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
            if (current && current.endsWith('px') && $util$8.isUnit(current)) {
                value += parseInt(current);
                if (!negative) {
                    value = Math.max(0, value);
                }
                const result = $util$8.formatPX(value);
                this.css(attr, result);
                if (cache) {
                    this.unsetCache(attr);
                }
                return result;
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
            return this.convertPercent(value, horizontal, parent) || $util$8.convertPX(value, this.dpi, this.fontSize);
        }
        convertPercent(value, horizontal, parent = true) {
            if ($util$8.isPercent(value)) {
                const node = (parent ? this.absoluteParent : null) || this;
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
                        let result = checkType === 0;
                        if ($util$8.hasBit(checkType, 2 /* UNIT */) && $util$8.isUnit(value)) {
                            result = true;
                        }
                        if ($util$8.hasBit(checkType, 32 /* PERCENT */) && $util$8.isPercent(value)) {
                            result = true;
                        }
                        if ($util$8.hasBit(checkType, 4 /* AUTO */)) {
                            result = false;
                        }
                        return result;
                }
            }
            return false;
        }
        hasBit(attr, value) {
            if (this[attr] !== undefined) {
                return $util$8.hasBit(this[attr], value);
            }
            return false;
        }
        hasAlign(value) {
            return $util$8.hasBit(this.alignmentType, value);
        }
        exclude({ section = 0, procedure = 0, resource = 0 }) {
            if (section) {
                this._excludeSection |= section;
            }
            if (procedure) {
                this._excludeProcedure |= procedure;
            }
            if (resource) {
                this._excludeResource |= resource;
            }
        }
        setExclusions() {
            if (this.styleElement) {
                const applyExclusions = (attr, enumeration) => {
                    const actualParent = this.actualParent;
                    const exclude = [$util$8.trimNull(this.dataset[`exclude${attr}`]), actualParent ? $util$8.trimNull(actualParent.dataset[`exclude${attr}Child`]) : ''].filter(value => value).join('|');
                    let result = 0;
                    exclude.split('|').map(value => value.toUpperCase().trim()).forEach(value => {
                        if (enumeration[value] !== undefined) {
                            result |= enumeration[value];
                        }
                    });
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
                            if (firstChild && !firstChild.lineBreak && firstChild.blockStatic && firstChild.marginTop >= this.marginTop) {
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
                    if (item.siblingIndex !== Number.MAX_VALUE) {
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
            const keys = Array.from(CSS_SPACING.keys());
            const applyReset = (start, end, margin) => {
                let i = 0;
                for (const attr of Array.from(CSS_SPACING.values()).slice(start, end)) {
                    this._boxReset[attr] = 1;
                    if (node) {
                        const spacing = CSS_SPACING.get(margin ? keys[i] : keys[i + 4]);
                        if (spacing) {
                            node.modifyBox(fromParent ? keys[i] : keys[i + 4], this[spacing]);
                        }
                    }
                    i++;
                }
            };
            if ($util$8.hasBit(region, 30 /* MARGIN */)) {
                applyReset(0, 4, true);
            }
            if ($util$8.hasBit(region, 480 /* PADDING */)) {
                applyReset(4, 8, false);
            }
        }
        inheritBox(region, node) {
            const keys = Array.from(CSS_SPACING.keys());
            const applyReset = (start, end, margin) => {
                let i = margin ? 0 : 4;
                for (const attr of Array.from(CSS_SPACING.values()).slice(start, end)) {
                    const value = this._boxAdjustment[attr];
                    if (value > 0) {
                        node.modifyBox(keys[i], this._boxAdjustment[attr], false);
                        this._boxAdjustment[attr] = 0;
                    }
                    i++;
                }
            };
            if ($util$8.hasBit(region, 30 /* MARGIN */)) {
                applyReset(0, 4, true);
            }
            if ($util$8.hasBit(region, 480 /* PADDING */)) {
                applyReset(4, 8, false);
            }
        }
        previousSiblings(lineBreak = true, excluded = true, height = false) {
            let element = null;
            const result = [];
            if (this._element) {
                element = this._element.previousSibling;
            }
            else if (this._initial.children.length) {
                const children = this._initial.children.filter(node => node.pageFlow);
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
                const children = this._initial.children.filter(node => node.pageFlow);
                if (children.length) {
                    const lastChild = children[children.length - 1];
                    element = lastChild.element ? lastChild.element.nextSibling : null;
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
            let result = 0;
            if (!this.positionStatic) {
                const value = this.cssInitial(attr);
                if ($util$8.isUnit(value) || $util$8.isPercent(value)) {
                    result = $util$8.convertInt(this.percentValue(attr, value, attr === 'left' || attr === 'right'));
                }
            }
            return result;
        }
        convertBox(region, direction) {
            const attr = region + direction;
            return $util$8.convertInt(this.percentValue(attr, this.css(attr), direction === 'Left' || direction === 'Right'));
        }
        percentValue(attr, value, horizontal, parent = true) {
            if ($util$8.isPercent(value)) {
                return $util$8.isUnit(this.style[attr]) ? this.style[attr] : this.convertPercent(value, horizontal, parent);
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
                    else if (this._element instanceof HTMLInputElement) {
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
            return this._element instanceof HTMLElement;
        }
        get svgElement() {
            return this._element instanceof SVGSVGElement;
        }
        get styleElement() {
            return $dom$4.hasComputedStyle(this._element);
        }
        get naturalElement() {
            return !!this._element && this._element.className !== '__css.placeholder';
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
            return this._bounds || $dom$4.newRectDimensions();
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
            return this._linear || $dom$4.newRectDimensions();
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
            return this._box || $dom$4.newRectDimensions();
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
            return this._element instanceof HTMLElement ? this._element.dataset : {};
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
            return this.dataset.use ? this.dataset.use.split(',').map(value => value.trim()).filter(value => value) : [];
        }
        get flexbox() {
            if (this._cached.flexbox === undefined) {
                const actualParent = this.actualParent;
                this._cached.flexbox = {
                    order: $util$8.convertInt(this.css('order')),
                    wrap: this.css('flexWrap'),
                    direction: this.css('flexDirection'),
                    alignSelf: !this.has('alignSelf') && actualParent && actualParent.has('alignItems') ? actualParent.css('alignItems') : this.css('alignSelf'),
                    justifyContent: this.css('justifyContent'),
                    basis: this.css('flexBasis'),
                    grow: $util$8.convertInt(this.css('flexGrow')),
                    shrink: $util$8.convertInt(this.css('flexShrink'))
                };
            }
            return this._cached.flexbox;
        }
        get width() {
            if (this._cached.width === undefined) {
                let width = 0;
                for (const value of [this._styleMap.width, this._styleMap.minWidth]) {
                    if ($util$8.isUnit(value) || $util$8.isPercent(value)) {
                        width = $util$8.convertInt(this.convertPX(value));
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
                    if ($util$8.isUnit(value) || this.hasHeight && $util$8.isPercent(value)) {
                        height = $util$8.convertInt(this.convertPX(value, true));
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
                    else if ($util$8.isPercent(value)) {
                        return value !== '0%';
                    }
                    else if ($util$8.isUnit(value) && value !== '0px' || this.toInt('minWidth') > 0) {
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
                    else if ($util$8.isPercent(value)) {
                        const actualParent = this.actualParent;
                        if (actualParent && actualParent.hasHeight) {
                            return value !== '0%';
                        }
                    }
                    else if ($util$8.isUnit(value) && value !== '0px' || this.toInt('minHeight') > 0) {
                        return true;
                    }
                    return false;
                })();
            }
            return this._cached.hasHeight;
        }
        get lineHeight() {
            if (this._cached.lineHeight === undefined) {
                this._cached.lineHeight = this.textElement || this.length === 0 ? this.toInt('lineHeight') : $util$8.convertInt(this.cssParent('lineHeight', true));
            }
            return this._cached.lineHeight;
        }
        get display() {
            return this.css('display');
        }
        get position() {
            return this.css('position');
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
                            const actualParent = this.actualParent;
                            return !!actualParent && !(actualParent.position === 'absolute' || actualParent.position === 'fixed');
                        default:
                            return true;
                    }
                })();
            }
            return this._cached.positionStatic;
        }
        get positionRelative() {
            const position = this.position;
            return position === 'relative' || position === 'sticky';
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
            return this.css('borderTopStyle') !== 'none' ? $util$8.convertInt(this.css('borderTopWidth')) : 0;
        }
        get borderRightWidth() {
            return this.css('borderRightStyle') !== 'none' ? $util$8.convertInt(this.css('borderRightWidth')) : 0;
        }
        get borderBottomWidth() {
            return this.css('borderBottomStyle') !== 'none' ? $util$8.convertInt(this.css('borderBottomWidth')) : 0;
        }
        get borderLeftWidth() {
            return this.css('borderLeftStyle') !== 'none' ? $util$8.convertInt(this.css('borderLeftWidth')) : 0;
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
        get inlineText() {
            if (this._cached.inlineText === undefined) {
                const element = this._element;
                let value = false;
                if (element) {
                    switch (element.tagName) {
                        case 'INPUT':
                        case 'BUTTON':
                        case 'IMG':
                        case 'SELECT':
                        case 'TEXTAREA':
                            break;
                        default:
                            value = (this.htmlElement &&
                                $dom$4.hasFreeFormText(element) && (element.children.length === 0 ||
                                Array.from(element.children).every(item => {
                                    const node = $dom$4.getElementAsNode(item);
                                    return !(node && !node.excluded || $dom$4.hasComputedStyle(item) && $util$8.hasValue(item.dataset.use));
                                })));
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
                    this.inlineVertical && this.cssParent('textAlign', true) === 'right' ||
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
                    const left = styleMap.marginLeft === 'auto' && (this.pageFlow ? true : this.has('right'));
                    const right = styleMap.marginRight === 'auto' && (this.pageFlow ? true : this.has('left'));
                    const top = styleMap.marginTop === 'auto' && (this.pageFlow ? true : this.has('bottom'));
                    const bottom = styleMap.marginBottom === 'auto' && (this.pageFlow ? true : this.has('top'));
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
                    if (element instanceof HTMLElement) {
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
                const [overflow, overflowX, overflowY] = [this.css('overflow'), this.css('overflowX'), this.css('overflowY')];
                const element = this._element;
                let value = 0;
                if (this.hasWidth && (overflow === 'scroll' ||
                    overflowX === 'scroll' ||
                    overflowX === 'auto' && element && element.clientWidth !== element.scrollWidth)) {
                    value |= 8 /* HORIZONTAL */;
                }
                if (this.hasHeight && (overflow === 'scroll' ||
                    overflowY === 'scroll' ||
                    overflowY === 'auto' && element && element.clientHeight !== element.scrollHeight)) {
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
        get baseline() {
            if (this._cached.baseline === undefined) {
                const value = this.verticalAlign;
                const originalValue = this.cssInitial('verticalAlign');
                this._cached.baseline = this.pageFlow && !this.floating && !this.svgElement && (value === 'baseline' || value === 'initial' || $util$8.isUnit(originalValue) && parseInt(originalValue) === 0);
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
                this._cached.multiline = this.plainText || this.inlineFlow && this.inlineText ? $dom$4.getRangeClientRect(this._element).multiline : 0;
            }
            return this._cached.multiline;
        }
        get visibleStyle() {
            if (this._cached.visibleStyle === undefined) {
                const borderWidth = this.borderTopWidth > 0 || this.borderRightWidth > 0 || this.borderBottomWidth > 0 || this.borderLeftWidth > 0;
                const backgroundImage = $util$8.REGEX_PATTERN.CSS_URL.test(this.css('backgroundImage')) || $util$8.REGEX_PATTERN.CSS_URL.test(this.css('background'));
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
                if (this._element instanceof HTMLElement) {
                    this._cached.actualChildren = $util$8.flatMap(Array.from(this._element.childNodes), (element) => $dom$4.getElementAsNode(element));
                }
                else if (this.groupParent) {
                    this._cached.actualChildren = this._initial.children.slice();
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
            if (this._element instanceof HTMLElement) {
                for (let i = 0; i < this._element.childNodes.length; i++) {
                    const node = $dom$4.getElementAsNode(this._element.childNodes[i]);
                    if (node) {
                        return node;
                    }
                }
            }
            return undefined;
        }
        get lastChild() {
            if (this._element instanceof HTMLElement) {
                for (let i = this._element.childNodes.length - 1; i >= 0; i--) {
                    const node = $dom$4.getElementAsNode(this._element.childNodes[i]);
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
                let siblingIndex = Number.MAX_VALUE;
                for (const item of this.children) {
                    siblingIndex = Math.min(siblingIndex, item.siblingIndex);
                    item.parent = this;
                }
                if (this.siblingIndex === Number.MAX_VALUE) {
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
            const nodes = this.children.slice();
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
    const $util$9 = squared.lib.util;
    class Accessibility extends Extension {
        afterInit() {
            for (const node of this.application.processing.cache.elements) {
                const element = node.element;
                if (element instanceof HTMLInputElement && !node.hasBit('excludeProcedure', NODE_PROCEDURE.ACCESSIBILITY)) {
                    switch (element.type) {
                        case 'radio':
                        case 'checkbox':
                            [$dom$6.getPreviousElementSibling(element), $dom$6.getNextElementSibling(element)].some((sibling) => {
                                if (sibling) {
                                    const label = $dom$6.getElementAsNode(sibling);
                                    const labelParent = sibling.parentElement && sibling.parentElement.tagName === 'LABEL' ? $dom$6.getElementAsNode(sibling.parentElement) : null;
                                    if (label && label.visible && label.pageFlow) {
                                        if ($util$9.hasValue(sibling.htmlFor) && sibling.htmlFor === element.id) {
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

    const $util$a = squared.lib.util;
    const REGEX_PARTIAL = {
        UNIT: '[\\d.]+[a-z%]+|auto|max-content|min-content',
        MINMAX: 'minmax\\((.*?), (.*?)\\)',
        FIT_CONTENT: 'fit-content\\(([\\d.]+[a-z%]+)\\)',
        REPEAT: 'repeat\\((auto-fit|auto-fill|[0-9]+), ((?:minmax|fit-content)\\(.*?\\)|.*?)\\)',
        NAMED: '\\[([\\w\\-\\s]+)\\]'
    };
    const PATTERN_GRID = {
        UNIT: new RegExp(`^(${REGEX_PARTIAL.UNIT})$`),
        NAMED: new RegExp(`\\s*(${REGEX_PARTIAL.NAMED}|${REGEX_PARTIAL.REPEAT}|${REGEX_PARTIAL.MINMAX}|${REGEX_PARTIAL.FIT_CONTENT}|${REGEX_PARTIAL.UNIT})\\s*`, 'g')
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
        return $util$a.isUnit(value) ? node.convertPX(value) : value;
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
                    let match;
                    while ((match = PATTERN_GRID.NAMED.exec(value)) !== null) {
                        if (index < 2) {
                            const data = mainData[index === 0 ? 'row' : 'column'];
                            if (match[1].charAt(0) === '[') {
                                if (data.name[match[2]] === undefined) {
                                    data.name[match[2]] = [];
                                }
                                data.name[match[2]].push(i);
                            }
                            else if (match[1].startsWith('minmax')) {
                                data.unit.push(convertUnit(node, match[6]));
                                data.unitMin.push(convertUnit(node, match[5]));
                                data.repeat.push(false);
                                i++;
                            }
                            else if (match[1].startsWith('repeat')) {
                                let iterations = 1;
                                switch (match[3]) {
                                    case 'auto-fit':
                                        data.autoFit = true;
                                        break;
                                    case 'auto-fill':
                                        data.autoFill = true;
                                        break;
                                    default:
                                        iterations = $util$a.convertInt(match[3]);
                                        break;
                                }
                                if (match[4].startsWith('minmax')) {
                                    const minmax = new RegExp(REGEX_PARTIAL.MINMAX, 'g');
                                    let matchMM;
                                    while ((matchMM = minmax.exec(match[4])) !== null) {
                                        data.unit.push(convertUnit(node, matchMM[2]));
                                        data.unitMin.push(convertUnit(node, matchMM[1]));
                                        data.repeat.push(true);
                                        i++;
                                    }
                                }
                                else if (match[4].charAt(0) === '[') {
                                    const unitName = match[4].split(' ');
                                    if (unitName.length === 2) {
                                        const attr = unitName[0].substring(1, unitName[0].length - 1);
                                        if (data.name[attr] === undefined) {
                                            data.name[attr] = [];
                                        }
                                        for (let j = 0; j < iterations; j++) {
                                            data.name[attr].push(i);
                                            data.unit.push(unitName[1]);
                                            data.unitMin.push('');
                                            data.repeat.push(true);
                                            i++;
                                        }
                                    }
                                }
                                else {
                                    match[4].split(' ').forEach(unit => {
                                        if (PATTERN_GRID.UNIT.test(unit)) {
                                            for (let j = 0; j < iterations; j++) {
                                                data.unit.push(unit);
                                                data.unitMin.push('');
                                                data.repeat.push(true);
                                                i++;
                                            }
                                        }
                                    });
                                }
                            }
                            else if (PATTERN_GRID.UNIT.test(match[1])) {
                                data.unit.push(convertUnit(node, match[1]));
                                data.unitMin.push('');
                                data.repeat.push(false);
                                i++;
                            }
                        }
                        else {
                            mainData[index === 2 ? 'row' : 'column'].auto.push(node.convertPX(match[1]));
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
                node.css('gridTemplateAreas').split(/"[\s\n]+"/).map(value => $util$a.trimString(value.trim(), '"')).forEach((value, i) => {
                    value.split(' ').forEach((area, j) => {
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
                    if (placement.filter(value => value).length < 4) {
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
                        data.count = $util$a.maxArray([
                            data.count,
                            horizontal ? item.columnSpan : item.rowSpan,
                            item.placement[horizontal ? 1 : 0] || 0,
                            (item.placement[horizontal ? 3 : 2] || 0) - 1
                        ]);
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
                    const PLACEMENT = placement.slice();
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
                            else if (rowData[i].map(column => column).length + COLUMN_SPAN <= COLUMN_COUNT) {
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
                            column.forEach(item => mainData.children.add(item));
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
                                column.forEach((item) => {
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
                                });
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

    class Flexbox extends Extension {
        static createDataAttribute(children) {
            return {
                wrap: false,
                wrapReverse: false,
                directionReverse: false,
                justifyContent: '',
                rowDirection: false,
                rowCount: 0,
                columnDirection: false,
                columnCount: 0,
                children
            };
        }
        condition(node) {
            return node.flexElement && node.length > 0;
        }
        processNode(node) {
            const controller = this.application.controllerHandler;
            const pageFlow = node.children.filter(item => item.pageFlow);
            const flex = node.flexbox;
            const mainData = Object.assign({}, Flexbox.createDataAttribute(pageFlow), { wrap: flex.wrap.startsWith('wrap'), wrapReverse: flex.wrap === 'wrap-reverse', directionReverse: flex.direction.endsWith('reverse'), justifyContent: flex.justifyContent, rowDirection: flex.direction.startsWith('row'), columnDirection: flex.direction.startsWith('column') });
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
                        if (a.linear[align] < b.linear[align]) {
                            return a.linear[align] < b.linear[align] ? -1 : 1;
                        }
                        else {
                            return a.linear[sort] < b.linear[sort] ? -1 : 1;
                        }
                    });
                    for (const item of pageFlow) {
                        const xy = Math.round(item.linear[align]);
                        const items = map.get(xy) || [];
                        items.push(item);
                        map.set(xy, items);
                    }
                    if (map.size) {
                        let maxCount = 0;
                        Array.from(map.values()).forEach((segment, index) => {
                            const group = controller.createNodeGroup(segment[0], segment, node);
                            group.siblingIndex = index;
                            const box = group.unsafe('box');
                            if (box) {
                                box[size] = node.box[size];
                            }
                            group.alignmentType |= 128 /* SEGMENTED */;
                            maxCount = Math.max(segment.length, maxCount);
                        });
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
            let columns = [];
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
                    for (let l = 0; l < nextCoordsX.length; l++) {
                        const nextAxisX = nextMapX[nextCoordsX[l]];
                        if (l === 0 && nextAxisX.length === 0) {
                            return { output: '' };
                        }
                        columnRight[l] = l === 0 ? 0 : columnRight[l - 1];
                        for (let m = 0; m < nextAxisX.length; m++) {
                            const nextX = nextAxisX[m];
                            const [left, right] = [nextX.linear.left, nextX.linear.right];
                            if (l === 0 || left >= columnRight[l - 1]) {
                                if (columns[l] === undefined) {
                                    columns[l] = [];
                                }
                                if (l === 0 || columns[0].length === nextAxisX.length) {
                                    columns[l][m] = nextX;
                                }
                                else {
                                    const index = getRowIndex(columns, nextX);
                                    if (index !== -1) {
                                        columns[l][index] = nextX;
                                    }
                                    else {
                                        return { output: '' };
                                    }
                                }
                            }
                            else {
                                const current = columns.length - 1;
                                if (columns[current]) {
                                    const minLeft = $util$b.minArray(columns[current].map(item => item.linear.left));
                                    const maxRight = $util$b.maxArray(columns[current].map(item => item.linear.right));
                                    if (left > minLeft && right > maxRight) {
                                        const filtered = columns.filter(item => item);
                                        const index = getRowIndex(columns, nextX);
                                        if (index !== -1 && filtered[filtered.length - 1][index] === undefined) {
                                            columns[current].length = 0;
                                        }
                                    }
                                }
                            }
                            columnRight[l] = Math.max(right, columnRight[l]);
                        }
                    }
                    for (let l = 0, m = -1; l < columnRight.length; l++) {
                        if (columns[l] === undefined) {
                            if (m === -1) {
                                m = l - 1;
                            }
                            else if (l === columnRight.length - 1) {
                                columnRight[m] = columnRight[l];
                            }
                        }
                        else if (m !== -1) {
                            columnRight[m] = columnRight[l - 1];
                            m = -1;
                        }
                    }
                    columns = columns.filter((item, index) => {
                        if (item && item.length > 0) {
                            columnEnd.push(columnRight[index]);
                            return true;
                        }
                        return false;
                    });
                    const columnMax = columns.reduce((a, b) => Math.max(a, b.length), 0);
                    for (let l = 0; l < columnMax; l++) {
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
                const mainData = Object.assign({}, Grid.createDataAttribute(), { columnCount: columnBalance ? columns[0].length : columns.length });
                node.duplicate().forEach(item => node.remove(item) && item.hide());
                for (let l = 0, count = 0; l < columns.length; l++) {
                    let spacer = 0;
                    for (let m = 0, start = 0; m < columns[l].length; m++) {
                        const item = columns[l][m];
                        if (!item.spacer) {
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
                                data.siblings.push(...$util$b.flatMap(Array.from(documentParent.children), element => {
                                    const sibling = $dom$8.getElementAsNode(element);
                                    return (sibling &&
                                        sibling.visible &&
                                        !sibling.rendered &&
                                        sibling.linear.left >= item.linear.right &&
                                        sibling.linear.right <= columnEnd[index] ? sibling : null);
                                }));
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
                        else if (item.spacer === 1) {
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
                let target = node;
                const verticalAlign = $util$d.convertInt(node.verticalAlign);
                if (renderParent.support.container.positionRelative && node.length === 0 && (node.top !== 0 || node.bottom !== 0 || verticalAlign !== 0)) {
                    target = node.clone(this.application.nextId, true, true);
                    node.hide(true);
                    const layout = new Layout(renderParent, target, target.containerType, target.alignmentType);
                    this.application.controllerHandler.appendAfter(node.id, this.application.renderLayout(layout));
                    this.application.session.cache.append(target, false);
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
                    const match = $util$e.REGEX_PATTERN.CSS_URL.exec(node.css('background'));
                    if (match) {
                        url = match[0];
                    }
                }
                if (url !== '') {
                    url = $dom$9.cssResolveUrl(url);
                    const image = this.application.session.image.get(url);
                    if (image) {
                        const dpi = node.dpi;
                        const fontSize = node.fontSize;
                        const width = $dom$9.convertClientUnit(node.has('width') ? node.css('width') : node.css('minWidth'), node.bounds.width, dpi, fontSize);
                        const height = $dom$9.convertClientUnit(node.has('height') ? node.css('width') : node.css('minHeight'), node.bounds.height, dpi, fontSize);
                        const position = $dom$9.getBackgroundPosition(`${node.css('backgroundPositionX')} ${node.css('backgroundPositionY')}`, node.bounds, dpi, fontSize);
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
            function setAutoWidth(td) {
                td.data(EXT_NAME.TABLE, 'percent', `${Math.round((td.bounds.width / node.bounds.width) * 100)}%`);
                td.data(EXT_NAME.TABLE, 'expand', true);
            }
            function setBoundsWidth(td) {
                td.css('width', $util$f.formatPX(td.bounds.width), true);
            }
            const mainData = Table.createDataAttribute();
            const table = [];
            const thead = node.filter(item => item.tagName === 'THEAD');
            const tbody = node.filter(item => item.tagName === 'TBODY');
            const tfoot = node.filter(item => item.tagName === 'TFOOT');
            const colgroup = node.element ? Array.from(node.element.children).find(element => element.tagName === 'COLGROUP') : undefined;
            if (thead.length) {
                thead[0].cascade().filter(item => item.tagName === 'TH' || item.tagName === 'TD').forEach(item => item.inherit(thead[0], 'styleMap'));
                table.push(...thead[0].children);
                thead.forEach(item => item.hide());
            }
            if (tbody.length) {
                tbody.forEach(item => {
                    table.push(...item.children);
                    item.hide();
                });
            }
            if (tfoot.length) {
                tfoot[0].cascade().filter(item => item.tagName === 'TH' || item.tagName === 'TD').forEach(item => item.inherit(tfoot[0], 'styleMap'));
                table.push(...tfoot[0].children);
                tfoot.forEach(item => item.hide());
            }
            const layoutFixed = node.css('tableLayout') === 'fixed';
            const borderCollapse = node.css('borderCollapse') === 'collapse';
            const [horizontal, vertical] = borderCollapse ? [0, 0] : node.css('borderSpacing').split(' ').map(value => parseInt(value));
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
            const rowWidth = [];
            const mapBounds = [];
            const tableFilled = [];
            let columnIndex = new Array(table.length).fill(0);
            let mapWidth = [];
            let multiline = 0;
            for (let i = 0; i < table.length; i++) {
                const tr = table[i];
                rowWidth[i] = horizontal;
                tableFilled[i] = [];
                for (let j = 0; j < tr.length; j++) {
                    const td = tr.item(j);
                    const element = td.element;
                    for (let k = 0; k < element.rowSpan - 1; k++) {
                        const l = (i + 1) + k;
                        if (columnIndex[l] !== undefined) {
                            columnIndex[l] += element.colSpan;
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
                            let value = $dom$b.cssInherit(element, 'background', ['rgba(0, 0, 0, 0)', 'transparent'], ['TABLE']);
                            if (value !== '') {
                                element.style.background = value;
                            }
                            else {
                                value = $dom$b.cssInherit(element, 'backgroundColor', ['rgba(0, 0, 0, 0)', 'transparent'], ['TABLE']);
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
                    td.css({
                        marginTop: i === 0 ? '0px' : spacingHeight,
                        marginRight: j < tr.length - 1 ? spacingWidth : '0px',
                        marginBottom: i + element.rowSpan - 1 >= table.length - 1 ? '0px' : spacingHeight,
                        marginLeft: columnIndex[i] === 0 ? '0px' : spacingWidth
                    }, '', true);
                    columnIndex[i] += element.colSpan;
                }
            }
            if (node.has('width', 2 /* UNIT */) && mapWidth.some(value => $util$f.isPercent(value))) {
                mapWidth = mapWidth.map((value, index) => {
                    if (value === 'auto' && mapBounds[index] > 0) {
                        value = $util$f.formatPX(mapBounds[index]);
                    }
                    return value;
                });
            }
            if (mapWidth.every(value => $util$f.isPercent(value)) && mapWidth.reduce((a, b) => a + parseFloat(b), 0) > 1) {
                let percentTotal = 100;
                mapWidth = mapWidth.map(value => {
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
                    mapWidth = mapWidth.map(value => value !== '0px' ? `${(parseInt(value) / width) * 100}%` : value);
                }
                else if (width > node.width) {
                    node.css('width', 'auto', true);
                    if (!layoutFixed) {
                        node.cascade().forEach(item => item.css('width', 'auto', true));
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
            const columnCount = $util$f.maxArray(columnIndex);
            let rowCount = table.length;
            const caption = node.find(item => item.tagName === 'CAPTION');
            node.clear();
            if (caption) {
                if (!caption.hasWidth && !$dom$b.isUserAgent(8 /* EDGE */)) {
                    if (caption.textElement) {
                        if (!caption.has('maxWidth')) {
                            caption.css('maxWidth', $util$f.formatPX(caption.bounds.width));
                        }
                    }
                    else if (caption.bounds.width > $util$f.maxArray(rowWidth)) {
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
                                    td.css({
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
                                    td.css({
                                        borderBottomColor,
                                        borderBottomStyle,
                                        borderBottomWidth
                                    });
                                }
                            }
                            if (j === 0) {
                                if (td.borderLeftWidth < parseInt(borderLeftWidth)) {
                                    td.css({
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
                                    td.css({
                                        borderRightColor,
                                        borderRightStyle,
                                        borderRightWidth
                                    });
                                }
                            }
                        }
                    }
                }
                node.css({
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
            let aboveBaseline = [];
            let minTop = Number.MAX_VALUE;
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
                aboveBaseline = aboveBaseline.filter(item => $util$g.isUnit(item.verticalAlign) && $util$g.convertInt(item.verticalAlign) > 0);
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
                                            if (marginTop === 0 && current.length > 0) {
                                                const topChild = current.firstChild;
                                                if (topChild && topChild.blockStatic) {
                                                    marginTop = $util$h.convertInt(topChild.cssInitial('marginTop', false, true));
                                                    current = topChild;
                                                }
                                            }
                                            if (previousMarginBottom === 0 && previous.length > 0) {
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
            if (this.application.processing.node) {
                if (this.application.processing.node.htmlElement) {
                    $util$h.flatMap(Array.from(this.application.processing.node.element.getElementsByTagName('BR')), (item) => $dom$c.getElementAsNode(item)).forEach((node) => {
                        if (!processed.has(node)) {
                            const actualParent = node.actualParent;
                            const previousSiblings = node.previousSiblings(true, true, true);
                            const nextSiblings = node.nextSiblings(true, true, true);
                            let valid = false;
                            if (previousSiblings.length && nextSiblings.length) {
                                if (nextSiblings[0].lineBreak) {
                                    return;
                                }
                                else {
                                    valid = true;
                                    const bottomStart = previousSiblings.pop();
                                    const topEnd = nextSiblings.pop();
                                    if (bottomStart.inlineStatic && topEnd.inlineStatic && previousSiblings.length === 0) {
                                        processed.add(node);
                                        return;
                                    }
                                    let bottom;
                                    let top;
                                    if (bottomStart.lineHeight > 0 && bottomStart.element && bottomStart.cssTry('lineHeight', '0px')) {
                                        bottom = bottomStart.element.getBoundingClientRect().bottom + bottomStart.marginBottom;
                                        bottomStart.cssFinally('lineHeight');
                                    }
                                    else {
                                        bottom = bottomStart.linear.bottom;
                                    }
                                    if (topEnd.lineHeight > 0 && topEnd.element && topEnd.cssTry('lineHeight', '0px')) {
                                        top = topEnd.element.getBoundingClientRect().top - topEnd.marginTop;
                                        topEnd.cssFinally('lineHeight');
                                    }
                                    else {
                                        top = topEnd.linear.top;
                                    }
                                    const bottomParent = bottomStart.visible ? bottomStart.renderParent : undefined;
                                    const topParent = topEnd.visible ? topEnd.renderParent : undefined;
                                    const offset = top - bottom;
                                    if (offset > 0) {
                                        if (topParent && topParent.groupParent && topParent.firstChild === topEnd) {
                                            topParent.modifyBox(2 /* MARGIN_TOP */, offset);
                                        }
                                        else if (bottomParent && bottomParent.groupParent && bottomParent.lastChild === bottomStart) {
                                            bottomParent.modifyBox(8 /* MARGIN_BOTTOM */, offset);
                                        }
                                        else {
                                            if (topParent && topParent.layoutVertical && (topEnd.visible || topEnd.renderAs)) {
                                                (topEnd.renderAs || topEnd).modifyBox(2 /* MARGIN_TOP */, offset);
                                            }
                                            else if (bottomParent && bottomParent.layoutVertical && (bottomStart.visible || bottomStart.renderAs)) {
                                                (bottomStart.renderAs || bottomStart).modifyBox(8 /* MARGIN_BOTTOM */, offset);
                                            }
                                            else if (!topParent && !bottomParent && actualParent && actualParent.visible) {
                                                if (topEnd.lineBreak || topEnd.excluded) {
                                                    actualParent.modifyBox(128 /* PADDING_BOTTOM */, offset);
                                                }
                                                else if (bottomStart.lineBreak || bottomStart.excluded) {
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
                                previousSiblings.forEach((item) => processed.add(item));
                                nextSiblings.forEach((item) => processed.add(item));
                            }
                        }
                    });
                }
            }
            for (const node of this.application.processing.excluded) {
                if (!processed.has(node) && !node.lineBreak) {
                    const offset = node.marginTop + node.marginBottom;
                    if (offset !== 0) {
                        const nextSiblings = node.nextSiblings(true, true, true);
                        if (nextSiblings.length) {
                            const topEnd = nextSiblings.pop();
                            if (topEnd.visible) {
                                topEnd.modifyBox(2 /* MARGIN_TOP */, offset);
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
