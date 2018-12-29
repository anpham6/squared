/* squared.svg 0.1.0
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory((global.squared = global.squared || {}, global.squared.svg = {})));
}(this, function (exports) { 'use strict';

    var $dom = squared.lib.dom;
    var $util = squared.lib.util;
    function getHrefTarget(element) {
        const href = element.attributes.getNamedItem('href');
        if (href && href.value !== '') {
            return href.value.charAt(0) === '#' ? document.getElementById(href.value.replace('#', '')) : null;
        }
        return null;
    }
    function isSvgShape(element) {
        switch (element.tagName) {
            case 'path':
            case 'circle':
            case 'ellipse':
            case 'line':
            case 'rect':
            case 'polygon':
            case 'polyline':
                return true;
        }
        return false;
    }
    function isSvgImage(element) {
        return element.tagName === 'image';
    }
    function createTransformData(element) {
        const data = {
            operations: [],
            translateX: 0,
            translateY: 0,
            scaleX: 1,
            scaleY: 1,
            rotateAngle: 0,
            skewX: 0,
            skewY: 0,
            origin: getTransformOrigin(element)
        };
        for (let i = 0; i < element.transform.baseVal.numberOfItems; i++) {
            const item = element.transform.baseVal.getItem(i);
            if (!data.operations.includes(item.type)) {
                switch (item.type) {
                    case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                        if (item.matrix.e !== 0 || item.matrix.f !== 0) {
                            data.translateX = item.matrix.e;
                            data.translateY = item.matrix.f;
                            data.operations.push(item.type);
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_SCALE:
                        if (item.matrix.a !== 1 || item.matrix.d !== 1) {
                            data.scaleX = item.matrix.a;
                            data.scaleY = item.matrix.d;
                            data.operations.push(item.type);
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_ROTATE:
                        if (item.angle !== 0) {
                            data.rotateAngle = item.angle;
                            const namedItem = element.attributes.getNamedItem('transform');
                            if (namedItem && namedItem.nodeValue) {
                                const match = /rotate\((\d+), (\d+), (\d+)\)/.exec(namedItem.nodeValue);
                                if (match) {
                                    data.rotateOriginX = parseInt(match[2]);
                                    data.rotateOriginY = parseInt(match[3]);
                                }
                            }
                            data.matrixRotate = item.matrix;
                            data.operations.push(item.type);
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_SKEWX:
                        if (item.angle !== 0) {
                            data.skewX += item.angle;
                            data.matrixSkewX = item.matrix;
                            data.operations.push(item.type);
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_SKEWY:
                        if (item.angle !== 0) {
                            data.skewY += item.angle;
                            data.matrixSkewY = item.matrix;
                            data.operations.push(item.type);
                        }
                        break;
                }
            }
        }
        return data;
    }
    function getTransformOrigin(element, dpi = 0) {
        const value = $dom.cssAttribute(element, 'transform-origin');
        if (value !== '') {
            const parent = element.parentElement;
            let width;
            let height;
            if (parent instanceof SVGSVGElement) {
                width = parent.viewBox.baseVal.width;
                height = parent.viewBox.baseVal.height;
            }
            else if (parent instanceof SVGGElement && parent.viewportElement instanceof SVGSVGElement) {
                width = parent.viewportElement.viewBox.baseVal.width;
                height = parent.viewportElement.viewBox.baseVal.height;
            }
            else {
                return undefined;
            }
            let positions = value.split(' ');
            if (positions.length === 1) {
                positions.push('center');
            }
            positions = positions.slice(0, 2);
            const origin = { x: null, y: null };
            if (positions.includes('left')) {
                origin.x = 0;
            }
            else if (positions.includes('right')) {
                origin.x = width;
            }
            if (positions.includes('top')) {
                origin.y = 0;
            }
            else if (positions.includes('bottom')) {
                origin.y = height;
            }
            ['x', 'y'].forEach(attr => {
                if (origin[attr] === null) {
                    for (let i = 0; i < positions.length; i++) {
                        let position = positions[i];
                        if (position !== '') {
                            if (position === 'center') {
                                position = '50%';
                            }
                            if ($util.isUnit(position)) {
                                origin[attr] = parseInt(position.endsWith('px') ? position : $util.convertPX(position, dpi, $util.convertInt($dom.getStyle(element).fontSize)));
                            }
                            else if ($util.isPercent(position)) {
                                origin[attr] = (attr === 'x' ? width : height) * (parseInt(position) / 100);
                            }
                            if (origin[attr] !== null) {
                                positions[i] = '';
                                break;
                            }
                        }
                    }
                }
            });
            if (origin.x || origin.y) {
                origin.x = origin.x || 0;
                origin.y = origin.y || 0;
                return origin;
            }
        }
        return undefined;
    }
    function sortNumberAsc(values) {
        return values.sort((a, b) => a < b ? -1 : 1);
    }
    function getLeastCommonMultiple(values) {
        const sorted = sortNumberAsc(values.slice());
        if (sorted.length > 1) {
            const smallest = sorted.splice(0, 1)[0];
            let result = smallest;
            let valid = false;
            while (!valid) {
                for (const value of sorted) {
                    if (result >= value && result % value === 0) {
                        valid = true;
                    }
                    else {
                        valid = false;
                        result += smallest;
                        break;
                    }
                }
            }
            return result;
        }
        return sorted[0];
    }
    function applyMatrixX(matrix, x, y) {
        return matrix.a * x + matrix.c * y + matrix.e;
    }
    function applyMatrixY(matrix, x, y) {
        return matrix.b * x + matrix.d * y + matrix.f;
    }
    function getRadiusX(angle, radius) {
        return radius * Math.sin(angle * Math.PI / 180);
    }
    function getRadiusY(angle, radius) {
        return radius * Math.cos(angle * Math.PI / 180) * -1;
    }
    function isVisible(element) {
        const value = $dom.cssAttribute(element, 'visibility', true);
        return value !== 'hidden' && value !== 'collapse' && $dom.cssAttribute(element, 'display', true) !== 'none';
    }

    var util = /*#__PURE__*/Object.freeze({
        getHrefTarget: getHrefTarget,
        isSvgShape: isSvgShape,
        isSvgImage: isSvgImage,
        createTransformData: createTransformData,
        getTransformOrigin: getTransformOrigin,
        sortNumberAsc: sortNumberAsc,
        getLeastCommonMultiple: getLeastCommonMultiple,
        applyMatrixX: applyMatrixX,
        applyMatrixY: applyMatrixY,
        getRadiusX: getRadiusX,
        getRadiusY: getRadiusY,
        isVisible: isVisible
    });

    var $color = squared.lib.color;
    var $dom$1 = squared.lib.dom;
    const NAME_GRAPHICS = {};
    class SvgBuild {
        static setName(element) {
            let result = '';
            let tagName;
            if (element.id) {
                if (NAME_GRAPHICS[element.id] === undefined) {
                    result = element.id;
                }
                tagName = element.id;
            }
            else {
                tagName = element.tagName;
            }
            if (NAME_GRAPHICS[tagName] === undefined) {
                NAME_GRAPHICS[tagName] = 0;
            }
            return result !== '' ? result : `${tagName}_${++NAME_GRAPHICS[tagName]}`;
        }
        static applyTransforms(transform, points, origin) {
            const result = [];
            for (const pt of points) {
                result.push({ x: pt.x, y: pt.y });
            }
            for (let i = transform.numberOfItems - 1; i >= 0; i--) {
                const item = transform.getItem(i);
                let x1 = 0;
                let y1 = 0;
                let x2 = 0;
                let y2 = 0;
                let x3 = 0;
                let y3 = 0;
                if (origin) {
                    switch (item.type) {
                        case SVGTransform.SVG_TRANSFORM_SCALE:
                            x1 += origin.x;
                            y2 += origin.y;
                            break;
                        case SVGTransform.SVG_TRANSFORM_SKEWX:
                            y1 -= origin.y;
                            break;
                        case SVGTransform.SVG_TRANSFORM_SKEWY:
                            x2 -= origin.x;
                            break;
                        case SVGTransform.SVG_TRANSFORM_ROTATE:
                            x2 -= origin.x;
                            y1 -= origin.y;
                            x3 = origin.x + getRadiusY(item.angle, origin.x);
                            y3 = origin.y + getRadiusY(item.angle, origin.y);
                            break;
                    }
                }
                for (const pt of result) {
                    const x = pt.x;
                    const y = pt.y;
                    pt.x = applyMatrixX(item.matrix, x + x1, y + y1) + x3;
                    pt.y = applyMatrixY(item.matrix, x + x2, y + y2) + y3;
                }
            }
            return result;
        }
        static toPointList(points) {
            const result = [];
            for (let j = 0; j < points.numberOfItems; j++) {
                const pt = points.getItem(j);
                result.push({ x: pt.x, y: pt.y });
            }
            return result;
        }
        static toCoordinateList(value) {
            const result = [];
            const pattern = /-?[\d.]+/g;
            let digit;
            while ((digit = pattern.exec(value)) !== null) {
                const digitValue = parseFloat(digit[0]);
                if (!isNaN(digitValue)) {
                    result.push(digitValue);
                }
            }
            return result;
        }
        static toPathCommandList(value) {
            const result = [];
            const patternCommand = /([A-Za-z])([^A-Za-z]+)?/g;
            let command;
            value = value.trim();
            while ((command = patternCommand.exec(value)) !== null) {
                if (result.length === 0 && command[1].toUpperCase() !== 'M') {
                    break;
                }
                command[2] = (command[2] || '').trim();
                const coordinates = this.toCoordinateList(command[2]);
                const previous = result[result.length - 1];
                const previousCommand = previous ? previous.command.toUpperCase() : '';
                const previousPoint = previous ? previous.points[previous.points.length - 1] : undefined;
                let radiusX;
                let radiusY;
                let xAxisRotation;
                let largeArcFlag;
                let sweepFlag;
                switch (command[1].toUpperCase()) {
                    case 'M':
                    case 'L':
                        if (coordinates.length >= 2) {
                            coordinates.length = 2;
                            break;
                        }
                        else {
                            continue;
                        }
                    case 'H':
                        if (previousPoint && coordinates.length) {
                            coordinates[1] = command[1] === 'h' ? 0 : previousPoint.y;
                            coordinates.length = 2;
                            break;
                        }
                        else {
                            continue;
                        }
                    case 'V':
                        if (previousPoint && coordinates.length) {
                            const y = coordinates[0];
                            coordinates[0] = command[1] === 'v' ? 0 : previousPoint.x;
                            coordinates[1] = y;
                            coordinates.length = 2;
                            break;
                        }
                        else {
                            continue;
                        }
                    case 'Z':
                        if (result.length) {
                            coordinates.push(...result[0].coordinates);
                            command[1] = 'Z';
                            break;
                        }
                        else {
                            continue;
                        }
                    case 'C':
                        if (coordinates.length >= 6) {
                            coordinates.length = 6;
                            break;
                        }
                        else {
                            continue;
                        }
                    case 'S':
                        if (coordinates.length >= 4 && (previousCommand === 'C' || previousCommand === 'S')) {
                            coordinates.length = 4;
                            break;
                        }
                        else {
                            continue;
                        }
                    case 'Q':
                        if (coordinates.length >= 4) {
                            coordinates.length = 4;
                            break;
                        }
                        else {
                            continue;
                        }
                    case 'T':
                        if (coordinates.length >= 2 && (previousCommand === 'Q' || previousCommand === 'T')) {
                            coordinates.length = 2;
                            break;
                        }
                        else {
                            continue;
                        }
                    case 'A':
                        if (coordinates.length >= 7) {
                            [radiusX, radiusY, xAxisRotation, largeArcFlag, sweepFlag] = coordinates.splice(0, 5);
                            coordinates.length = 2;
                            break;
                        }
                        else {
                            continue;
                        }
                    default:
                        continue;
                }
                if (coordinates.length > 1) {
                    const points = [];
                    const relative = /[a-z]/.test(command[1]);
                    for (let i = 0; i < coordinates.length; i += 2) {
                        let x = coordinates[i];
                        let y = coordinates[i + 1];
                        if (relative && previousPoint) {
                            x += previousPoint.x;
                            y += previousPoint.y;
                        }
                        points.push({ x, y });
                    }
                    result.push({
                        command: command[1],
                        relative,
                        coordinates,
                        points,
                        radiusX,
                        radiusY,
                        xAxisRotation,
                        largeArcFlag,
                        sweepFlag
                    });
                }
            }
            return result;
        }
        static createColorStops(element) {
            const result = [];
            for (const stop of Array.from(element.getElementsByTagName('stop'))) {
                const color = $color.parseRGBA($dom$1.cssAttribute(stop, 'stop-color'), $dom$1.cssAttribute(stop, 'stop-opacity'));
                if (color && color.visible) {
                    result.push({
                        color: color.valueRGBA,
                        offset: $dom$1.cssAttribute(stop, 'offset'),
                        opacity: color.alpha
                    });
                }
            }
            return result;
        }
        static fromCoordinateList(values) {
            const result = [];
            for (let i = 0; i < values.length; i += 2) {
                result.push({ x: values[i], y: values[i + 1] });
            }
            return result.length % 2 === 0 ? result : [];
        }
        static fromPathCommandList(commands) {
            let result = '';
            for (const item of commands) {
                result += (result !== '' ? ' ' : '') + item.command;
                switch (item.command.toUpperCase()) {
                    case 'M':
                    case 'L':
                    case 'C':
                    case 'S':
                    case 'Q':
                    case 'T':
                        result += item.coordinates.join(',');
                        break;
                    case 'H':
                        result += item.coordinates[0];
                        break;
                    case 'V':
                        result += item.coordinates[1];
                        break;
                    case 'A':
                        result += `${item.radiusX},${item.radiusY},${item.xAxisRotation},${item.largeArcFlag},${item.sweepFlag},${item.coordinates.join(',')}`;
                        break;
                }
            }
            return result;
        }
    }

    var $util$1 = squared.lib.util;
    class SvgAnimation {
        constructor(element, parentElement) {
            this.element = element;
            this.parentElement = parentElement;
            this.attributeName = '';
            this.to = '';
            this.begin = [0];
            this.setAttribute('attributeName');
            this.setAttribute('to');
            const begin = this.getAttribute('begin');
            const dur = this.getAttribute('dur');
            if (begin === 'indefinite') {
                this.begin.length = 0;
            }
            else if (begin !== '') {
                this.begin = sortNumberAsc(begin.split(';').map(value => SvgAnimation.convertClockTime(value)));
            }
            if (dur === '' || dur === 'indefinite') {
                this.duration = -1;
            }
            else {
                this.duration = SvgAnimation.convertClockTime(dur);
            }
        }
        static convertClockTime(value) {
            let s = 0;
            let ms = 0;
            if ($util$1.isNumber(value)) {
                s = parseInt(value);
            }
            else {
                if (/-?\d+ms$/.test(value)) {
                    ms = parseInt(value);
                }
                else if (/-?\d+s$/.test(value)) {
                    s = parseInt(value);
                }
                else if (/-?\d+min$/.test(value)) {
                    s = parseInt(value) * 60;
                }
                else if (/-?\d+(.\d+)?h$/.test(value)) {
                    s = parseFloat(value) * 60 * 60;
                }
                else {
                    const match = /^(?:(-?)(\d?\d):)?(?:(\d?\d):)?(\d?\d)\.?(\d?\d?\d)?$/.exec(value);
                    if (match) {
                        if (match[2]) {
                            s += parseInt(match[2]) * 60 * 60;
                        }
                        if (match[3]) {
                            s += parseInt(match[3]) * 60;
                        }
                        if (match[4]) {
                            s += parseInt(match[4]);
                        }
                        if (match[5]) {
                            ms = parseInt(match[5]) * (match[5].length < 3 ? Math.pow(10, 3 - match[5].length) : 1);
                        }
                        if (match[1]) {
                            s *= -1;
                            ms *= -1;
                        }
                    }
                }
            }
            return s < 0 || ms < 0 ? 0 : s * 1000 + ms;
        }
        setAttribute(attr, equality) {
            const value = this.getAttribute(attr);
            if (value) {
                if (equality !== undefined) {
                    this[attr + $util$1.capitalize(equality)] = value === equality;
                }
                else {
                    this[attr] = value;
                }
            }
        }
        getAttribute(attr) {
            const item = this.element.attributes.getNamedItem(attr);
            return item ? item.value.trim() : '';
        }
    }

    var $util$2 = squared.lib.util;
    class SvgAnimate extends SvgAnimation {
        constructor(element, parentElement) {
            super(element, parentElement);
            this.element = element;
            this.parentElement = parentElement;
            this.from = '';
            this.by = '';
            this.values = [];
            this.keyTimes = [];
            this.calcMode = '';
            this.additiveSum = false;
            this.accumulateSum = false;
            this.fillFreeze = false;
            const values = this.getAttribute('values');
            const from = this.getAttribute('from');
            if (values !== '') {
                this.values.push(...$util$2.flatMap(values.split(';'), value => value.trim()));
                if (this.values.length > 1) {
                    this.from = this.values[0];
                    this.to = this.values[this.values.length - 1];
                    const keyTimes = this.getAttribute('keyTimes');
                    if (keyTimes) {
                        const times = SvgAnimate.toFractionList(keyTimes);
                        if (times.length === this.values.length) {
                            this.keyTimes.push(...times);
                        }
                    }
                }
                else {
                    this.values.length = 0;
                }
            }
            if (this.values.length === 0 && this.to !== '') {
                if (from !== '') {
                    this.from = from;
                }
                else {
                    const value = $util$2.optionalAsString(parentElement, `${this.attributeName}.baseVal.value`);
                    if (value !== '') {
                        this.from = value;
                    }
                    else {
                        const current = parentElement.attributes.getNamedItem(this.attributeName);
                        if (current) {
                            this.from = current.value.trim();
                        }
                    }
                }
                this.values.push(this.from, this.to);
                this.keyTimes.push(0, 1);
                this.setAttribute('by');
            }
            const repeatDur = this.getAttribute('repeatDur');
            const repeatCount = this.getAttribute('repeatCount');
            if (repeatDur === '' || repeatDur === 'indefinite') {
                this.repeatDuration = -1;
            }
            else {
                this.repeatDuration = SvgAnimate.convertClockTime(repeatDur);
            }
            if (repeatCount === 'indefinite') {
                this._repeatCount = -1;
            }
            else {
                this._repeatCount = Math.max(1, $util$2.convertInt(repeatCount));
            }
            if (this.begin.length) {
                const end = this.getAttribute('end');
                if (end !== '') {
                    const times = sortNumberAsc(end.split(';').map(value => SvgAnimation.convertClockTime(value)));
                    if (times.length && (this.begin.length === 1 || this.begin[this.begin.length - 1] !== this.end || times[0] === 0)) {
                        this.end = times[0];
                        this.begin = this.begin.filter(value => value < times[0]);
                        if (this.begin.length && this._repeatCount === -1) {
                            this._repeatCount = Math.max(1, this.end / this.duration);
                        }
                    }
                }
            }
            this.setAttribute('calcMode');
            if (values === '' && from !== '' && this.to !== '') {
                this.setAttribute('additive', 'sum');
                if (this.additiveSum) {
                    this.setAttribute('accumulate', 'sum');
                }
            }
            this.setAttribute('fill', 'freeze');
        }
        static toFractionList(value, delimiter = ';') {
            let previous = -1;
            const result = $util$2.flatMap(value.split(delimiter), segment => {
                const fraction = parseFloat(segment);
                if (!isNaN(fraction) && fraction <= 1 && (previous === -1 || fraction > previous)) {
                    previous = fraction;
                    return fraction;
                }
                return -1;
            });
            return result.length > 1 && result.some(percent => percent !== -1) && result[0] === 0 ? result : [];
        }
        set repeatCount(value) {
            this._repeatCount = value !== -1 ? Math.max(1, value) : -1;
            this.repeatDuration = -1;
        }
        get repeatCount() {
            const duration = this.duration;
            if (duration !== -1) {
                if (this._repeatCount === -1 && this.repeatDuration === -1) {
                    return -1;
                }
                else if (this._repeatCount !== -1 && this.repeatDuration !== -1) {
                    if (this._repeatCount * duration <= this.repeatDuration) {
                        return this._repeatCount;
                    }
                    else {
                        return this.repeatDuration / duration;
                    }
                }
                else if (this.repeatDuration !== -1) {
                    return this.repeatDuration / duration;
                }
                else {
                    return this._repeatCount;
                }
            }
            return 1;
        }
    }

    var $color$1 = squared.lib.color;
    var $dom$2 = squared.lib.dom;
    var $util$3 = squared.lib.util;
    class SvgPath {
        constructor(element, d = '') {
            this.element = element;
            this.d = d;
            this.transformed = false;
            this.opacity = 1;
            this.color = '';
            this.fillRule = '';
            this.fill = '';
            this.fillOpacity = '';
            this.stroke = '';
            this.strokeWidth = '';
            this.strokeOpacity = '';
            this.strokeLinecap = '';
            this.strokeLinejoin = '';
            this.strokeMiterlimit = '';
            this.clipPath = '';
            this.clipRule = '';
            this.baseVal = {
                cx: null,
                cy: null,
                r: null,
                rx: null,
                ry: null,
                x1: null,
                x2: null,
                y1: null,
                y2: null,
                x: null,
                y: null,
                width: null,
                height: null,
                points: null
            };
            this.init();
        }
        static getLine(x1, y1, x2 = 0, y2 = 0, checkValid = false) {
            return x1 !== 0 || y1 !== 0 || x2 !== 0 || y2 !== 0 || !checkValid ? `M${x1},${y1} L${x2},${y2}` : '';
        }
        static getRect(width, height, x = 0, y = 0, checkValid = false) {
            return width > 0 && height > 0 || !checkValid ? `M${x},${y} h${width} v${height} h${-width} Z` : '';
        }
        static getPolyline(points, checkValid = false) {
            points = points instanceof SVGPointList ? SvgBuild.toPointList(points) : points;
            return points.length || !checkValid ? `M${points.map(item => `${item.x},${item.y}`).join(' ')}` : '';
        }
        static getPolygon(points) {
            const value = SvgPath.getPolyline(points);
            return value !== '' ? value + ' Z' : '';
        }
        static getCircle(cx, cy, r, checkValid = false) {
            return r > 0 || !checkValid ? SvgPath.getEllipse(cx, cy, r, r) : '';
        }
        static getEllipse(cx, cy, rx, ry, checkValid = false) {
            return rx > 0 && ry > 0 || !checkValid ? `M${cx - rx},${cy} a${rx},${ry},0,1,0,${rx * 2},0 a${rx},${ry},0,1,0,-${rx * 2},0` : '';
        }
        setColor(attr) {
            let value = $dom$2.cssAttribute(this.element, attr);
            const match = $util$3.REGEX_PATTERN.CSS_URL.exec(value);
            if (match) {
                value = `@${match[1]}`;
            }
            else if (value !== '') {
                switch (value.toLowerCase()) {
                    case 'none':
                    case 'transparent':
                    case 'rgba(0, 0, 0, 0)':
                        value = '';
                        break;
                    case 'currentcolor': {
                        const color = $color$1.parseRGBA($dom$2.cssAttribute(this.element, 'color', true));
                        value = color ? color.valueRGB : '#000000';
                        break;
                    }
                    default: {
                        const color = $color$1.parseRGBA(value);
                        if (color) {
                            value = color.valueRGB;
                        }
                        break;
                    }
                }
            }
            else {
                if (attr === 'fill' && !(this.element.parentElement instanceof SVGGElement)) {
                    value = '#000000';
                }
            }
            this[attr] = value;
        }
        setOpacity(attr) {
            const opacity = $dom$2.cssAttribute(this.element, `${attr}-opacity`);
            this[`${attr}Opacity`] = opacity ? (parseFloat(opacity) * this.opacity).toString() : this.opacity.toString();
        }
        init() {
            const element = this.element;
            if (this.d === '') {
                const transform = element.transform.baseVal;
                switch (element.tagName) {
                    case 'path': {
                        this.d = $dom$2.cssAttribute(element, 'd');
                        break;
                    }
                    case 'circle': {
                        const circle = element;
                        this.baseVal.cx = circle.cx.baseVal.value;
                        this.baseVal.cy = circle.cy.baseVal.value;
                        this.baseVal.r = circle.r.baseVal.value;
                        this.d = SvgPath.getCircle(this.baseVal.cx, this.baseVal.cy, this.baseVal.r, true);
                        break;
                    }
                    case 'ellipse': {
                        const ellipse = element;
                        this.baseVal.cx = ellipse.cx.baseVal.value;
                        this.baseVal.cy = ellipse.cy.baseVal.value;
                        this.baseVal.rx = ellipse.rx.baseVal.value;
                        this.baseVal.ry = ellipse.ry.baseVal.value;
                        this.d = SvgPath.getEllipse(this.baseVal.cx, this.baseVal.cy, this.baseVal.rx, this.baseVal.ry, true);
                        break;
                    }
                    case 'line': {
                        const line = element;
                        this.baseVal.x1 = line.x1.baseVal.value;
                        this.baseVal.y1 = line.y1.baseVal.value;
                        this.baseVal.x2 = line.x2.baseVal.value;
                        this.baseVal.y2 = line.y2.baseVal.value;
                        if (transform.numberOfItems) {
                            const points = [
                                { x: this.baseVal.x1, y: this.baseVal.y1 },
                                { x: this.baseVal.x2, y: this.baseVal.y2 }
                            ];
                            this.d = SvgPath.getPolyline(SvgBuild.applyTransforms(transform, points, getTransformOrigin(element)));
                            this.transformed = true;
                        }
                        else {
                            this.d = SvgPath.getLine(this.baseVal.x1, this.baseVal.y1, this.baseVal.x2, this.baseVal.y2, true);
                        }
                        break;
                    }
                    case 'rect': {
                        const rect = element;
                        this.baseVal.x = rect.x.baseVal.value;
                        this.baseVal.y = rect.y.baseVal.value;
                        this.baseVal.width = rect.width.baseVal.value;
                        this.baseVal.height = rect.height.baseVal.value;
                        if (transform.numberOfItems) {
                            const points = [
                                { x: this.baseVal.x, y: this.baseVal.y },
                                { x: this.baseVal.x + this.baseVal.width, y: this.baseVal.y },
                                { x: this.baseVal.x + this.baseVal.width, y: this.baseVal.y + this.baseVal.height },
                                { x: this.baseVal.x, y: this.baseVal.y + this.baseVal.height }
                            ];
                            this.d = SvgPath.getPolygon(SvgBuild.applyTransforms(transform, points, getTransformOrigin(element)));
                            this.transformed = true;
                        }
                        else {
                            this.d = SvgPath.getRect(this.baseVal.width, this.baseVal.height, this.baseVal.x, this.baseVal.y, true);
                        }
                        break;
                    }
                    case 'polyline':
                    case 'polygon': {
                        const polygon = element;
                        this.baseVal.points = SvgBuild.toPointList(polygon.points);
                        if (transform.numberOfItems) {
                            this.baseVal.points = SvgBuild.applyTransforms(transform, this.baseVal.points, getTransformOrigin(element));
                            this.transformed = true;
                        }
                        this.d = element.tagName === 'polygon' ? SvgPath.getPolygon(this.baseVal.points) : SvgPath.getPolyline(this.baseVal.points);
                        break;
                    }
                }
            }
            const clipPath = $util$3.REGEX_PATTERN.CSS_URL.exec($dom$2.cssAttribute(element, 'clip-path'));
            if (clipPath) {
                this.clipPath = clipPath[1];
                this.clipRule = $dom$2.cssAttribute(element, 'clip-rule', true);
            }
            const opacity = $dom$2.cssAttribute(element, 'opacity');
            if (opacity !== '') {
                this.opacity = Math.min(parseFloat(opacity), 1);
            }
            this.setColor('fill');
            if (this.fill !== '') {
                this.setOpacity('fill');
                this.fillRule = $dom$2.cssAttribute(element, 'fill-rule', true);
            }
            this.setColor('stroke');
            if (this.stroke !== '') {
                this.setOpacity('stroke');
                this.strokeWidth = $dom$2.cssAttribute(element, 'stroke-width') || '1';
                this.strokeLinecap = $dom$2.cssAttribute(element, 'stroke-linecap', true);
                this.strokeLinejoin = $dom$2.cssAttribute(element, 'stroke-linejoin', true);
                this.strokeMiterlimit = $dom$2.cssAttribute(element, 'stroke-miterlimit', true);
            }
        }
    }

    var $util$4 = squared.lib.util;
    class SvgAnimateMotion extends SvgAnimate {
        constructor(element, parentElement) {
            super(element, parentElement);
            this.path = '';
            this.keyPoints = [];
            this.rotate = 0;
            this.rotateAuto = false;
            this.rotateAutoReverse = false;
            this.setAttribute('path');
            const rotate = this.getAttribute('rotate');
            switch (rotate) {
                case 'auto':
                    this.rotateAuto = true;
                    break;
                case 'auto-reverse':
                    this.rotateAutoReverse = true;
                    break;
                default:
                    this.rotate = $util$4.convertInt(rotate);
                    break;
            }
            if (this.keyTimes.length) {
                const keyPoints = this.getAttribute('keyPoints');
                if (keyPoints) {
                    const points = SvgAnimate.toFractionList(keyPoints);
                    if (points.length === this.keyTimes.length) {
                        this.keyPoints = points;
                    }
                }
            }
            for (let i = 0; i < element.children.length; i++) {
                const item = element.children[i];
                if (item.tagName === 'mpath') {
                    const target = getHrefTarget(item);
                    if (target) {
                        this.mpath = new SvgPath(target);
                        if (this.path === '') {
                            this.path = this.mpath.d;
                        }
                        break;
                    }
                }
            }
        }
    }

    class SvgAnimateTransform extends SvgAnimate {
        static toRotateList(values) {
            const result = values.map(value => {
                if (value === '') {
                    return [null, null, null];
                }
                else {
                    const segment = SvgBuild.toCoordinateList(value);
                    if (segment.length === 1 || segment.length === 3) {
                        return segment;
                    }
                    return [];
                }
            });
            return result.some(item => item.length === 0) ? undefined : result;
        }
        static toScaleList(values) {
            const result = values.map(value => {
                if (value === '') {
                    return [null, null];
                }
                else {
                    const segment = SvgBuild.toCoordinateList(value);
                    if (segment.length === 1) {
                        return [segment[0], segment[0]];
                    }
                    else if (segment.length === 2) {
                        return segment;
                    }
                    return [];
                }
            });
            return result.some(item => item.length === 0) ? undefined : result;
        }
        static toTranslateList(values) {
            let y = null;
            const result = values.map(value => {
                if (value === '') {
                    return [null, null];
                }
                else {
                    const segment = SvgBuild.toCoordinateList(value);
                    if (segment.length === 1) {
                        return [segment[0], y];
                    }
                    else if (segment.length === 2) {
                        y = segment[1];
                        return segment;
                    }
                    return [];
                }
            });
            return result.some(item => item.length === 0) ? undefined : result;
        }
        constructor(element, parentElement) {
            super(element, parentElement);
            switch (this.getAttribute('type')) {
                case 'translate':
                    this.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                    break;
                case 'scale':
                    this.type = SVGTransform.SVG_TRANSFORM_SCALE;
                    break;
                case 'rotate':
                    this.type = SVGTransform.SVG_TRANSFORM_ROTATE;
                    break;
                case 'skewX':
                    this.type = SVGTransform.SVG_TRANSFORM_SKEWX;
                    break;
                case 'skewY':
                    this.type = SVGTransform.SVG_TRANSFORM_SKEWY;
                    break;
                default:
                    this.type = 0;
                    break;
            }
        }
    }

    var $util$5 = squared.lib.util;
    function insertSplitKeyTimeValue(map, element, path, item, iteration, begin, splitTime) {
        const fraction = (splitTime - (begin + item.duration * iteration)) / item.duration;
        const keyTimes = item.keyTimes;
        let previousIndex = -1;
        let nextIndex = -1;
        for (let l = 0; l < keyTimes.length; l++) {
            if (previousIndex !== -1 && fraction < keyTimes[l]) {
                nextIndex = l;
                break;
            }
            if (fraction > keyTimes[l]) {
                previousIndex = l;
            }
        }
        if (previousIndex !== -1 && nextIndex !== -1) {
            const previousValue = getItemValue(element, path, item, previousIndex, iteration);
            const nextValue = getItemValue(element, path, item, nextIndex, iteration);
            map.set(splitTime, getSplitValue(fraction, keyTimes[previousIndex], keyTimes[nextIndex], previousValue, nextValue));
            return splitTime;
        }
        else {
            return -1;
        }
    }
    function getSplitValue(fraction, previousFraction, nextFraction, previousValue, nextValue) {
        return previousValue + ((fraction - previousFraction) / (nextFraction - previousFraction)) * (nextValue - previousValue);
    }
    function insertSplitTimeValue(map, insertMap, splitTime) {
        let previous;
        let next;
        for (const [time, value] of map.entries()) {
            if (previous && splitTime < time) {
                next = { time, value };
                break;
            }
            if (splitTime > time) {
                previous = { time, value };
            }
        }
        if (previous && next) {
            const value = getSplitValue(splitTime, previous.time, next.time, previous.value, next.value);
            insertMap.set(splitTime, value);
            return true;
        }
        return false;
    }
    function convertKeyTimeFraction(map, total) {
        const result = new Map();
        for (const [time, data] of map.entries()) {
            let fraction = time / total;
            if (fraction > 0) {
                for (let i = 5;; i++) {
                    const value = parseFloat(fraction.toString().substring(0, i));
                    if (!result.has(value)) {
                        fraction = value;
                        break;
                    }
                }
            }
            result.set(fraction, data);
        }
        return result;
    }
    function getPathData(map, path, methodName, attrs, freezeMap, transform) {
        const result = [];
        for (const [time, data] of map.entries()) {
            const values = [];
            attrs.forEach(attr => {
                if (data.has(attr)) {
                    values.push(data.get(attr));
                }
                else if (freezeMap && freezeMap[attr]) {
                    values.push(freezeMap[attr].value);
                }
                else if (path.baseVal[attr] !== null) {
                    values.push(path.baseVal[attr]);
                }
            });
            if (values.length === attrs.length) {
                let value;
                if (transform && transform.numberOfItems) {
                    switch (methodName) {
                        case 'getLine':
                            value = SvgPath.getPolyline(SvgBuild.applyTransforms(transform, getLinePoints(values), getTransformOrigin(path.element)));
                            break;
                        case 'getRect':
                            value = SvgPath.getPolygon(SvgBuild.applyTransforms(transform, getRectPoints(values), getTransformOrigin(path.element)));
                            break;
                    }
                }
                if (value === undefined) {
                    value = SvgPath[methodName].apply(null, values);
                }
                result.push({ time, value });
            }
            else {
                return undefined;
            }
        }
        return result;
    }
    function getLinePoints(values) {
        return [
            { x: values[0], y: values[1] },
            { x: values[2], y: values[4] }
        ];
    }
    function getRectPoints(values) {
        const width = values[0];
        const height = values[1];
        const x = values[2];
        const y = values[3];
        return [
            { x, y },
            { x: x + width, y },
            { x: x + width, y: y + height },
            { x, y: y + height }
        ];
    }
    function getKeyTimeMap(map, keyTimes, freezeMap) {
        const result = new Map();
        for (const keyTime of keyTimes) {
            const values = new Map();
            for (const attr in map) {
                const value = map[attr].get(keyTime);
                if (value !== undefined) {
                    values.set(attr, value);
                }
            }
            if (freezeMap) {
                for (const attr in freezeMap) {
                    if (!values.has(attr) && keyTime >= freezeMap[attr].time) {
                        values.set(attr, freezeMap[attr].value);
                    }
                }
            }
            result.set(keyTime, values);
        }
        return result;
    }
    function getItemValue(element, path, animate, index, iteration = 0) {
        let result = parseFloat(animate.values[index]);
        if (animate.additiveSum) {
            if (path && typeof path.baseVal[animate.attributeName] === 'number') {
                result += path.baseVal[animate.attributeName];
            }
            else {
                result += $util$5.optionalAsNumber(element, `${animate.attributeName}.baseVal.value`);
            }
            if (!animate.accumulateSum) {
                iteration = 0;
            }
            for (let i = 0; i < iteration; i++) {
                for (let j = 0; j < animate.values.length; j++) {
                    result += parseFloat(animate.values[j]);
                }
            }
        }
        return result;
    }
    function getKeyTimePath(map, path, freezeMap) {
        switch (path.element.tagName) {
            case 'circle':
                return getPathData(map, path, 'getCircle', ['cx', 'cy', 'r'], freezeMap);
            case 'ellipse':
                return getPathData(map, path, 'getEllipse', ['cx', 'cy', 'rx', 'ry'], freezeMap);
            case 'line':
                return getPathData(map, path, 'getLine', ['x1', 'y1', 'x2', 'y2'], freezeMap, path.element.transform.baseVal);
            case 'rect':
                return getPathData(map, path, 'getRect', ['width', 'height', 'x', 'y'], freezeMap, path.element.transform.baseVal);
        }
        return undefined;
    }
    class SvgElement {
        constructor(element) {
            this.element = element;
            this.name = SvgBuild.setName(element);
            this.visible = isVisible(element);
            this.animate = SvgElement.toAnimateList(element);
            if (this.drawable) {
                const path = new SvgPath(element);
                if (path.d && path.d !== 'none') {
                    this.path = path;
                    for (const item of this.animate) {
                        if (item instanceof SvgAnimate) {
                            item.parentPath = path;
                        }
                    }
                }
            }
        }
        static toAnimateList(element) {
            const result = [];
            for (let i = 0; i < element.children.length; i++) {
                const item = element.children[i];
                if (item instanceof SVGAnimationElement) {
                    if (item instanceof SVGAnimateTransformElement) {
                        result.push(new SvgAnimateTransform(item, element));
                    }
                    else if (item instanceof SVGAnimateMotionElement) {
                        result.push(new SvgAnimateMotion(item, element));
                    }
                    else if (item instanceof SVGAnimateElement) {
                        result.push(new SvgAnimate(item, element));
                    }
                    else {
                        result.push(new SvgAnimation(item, element));
                    }
                }
            }
            return result;
        }
        static synchronizeAnimations(element, animate, useKeyTime = true, path) {
            if (animate.length) {
                const tagName = element.tagName;
                const animations = [];
                for (const item of animate) {
                    if (item instanceof SvgAnimate && item.keyTimes.length > 1 && item.duration > 0 && item.begin.length) {
                        if (path) {
                            switch (item.attributeName) {
                                case 'r':
                                case 'cx':
                                case 'cy':
                                    if (tagName === 'circle') {
                                        animations.push(item);
                                        break;
                                    }
                                case 'rx':
                                case 'ry':
                                    if (tagName === 'ellipse') {
                                        animations.push(item);
                                    }
                                    break;
                                case 'x1':
                                case 'x2':
                                case 'y1':
                                case 'y2':
                                    if (tagName === 'line') {
                                        animations.push(item);
                                    }
                                    break;
                                case 'x':
                                case 'y':
                                case 'width':
                                case 'height':
                                    if (tagName === 'rect') {
                                        animations.push(item);
                                    }
                                    break;
                            }
                        }
                        else {
                            if (element instanceof SVGSVGElement || element instanceof SVGUseElement) {
                                switch (item.attributeName) {
                                    case 'x':
                                    case 'y':
                                        animations.push(item);
                                        break;
                                }
                            }
                        }
                    }
                }
                if (animations.length > 1 || animations.some(item => item.begin.length > 1 || item.end !== undefined || item.additiveSum || !item.fillFreeze)) {
                    const repeatingMap = {};
                    const indefiniteMap = {};
                    const indefiniteStaticMap = {};
                    const repeatingAnimations = [];
                    const indefiniteAnimations = [];
                    const freezeMap = {};
                    const keyTimeMapList = [];
                    let repeatingDurationTotal = 0;
                    let indefiniteDurationTotal = 0;
                    animations.forEach(item => {
                        const attr = item.attributeName;
                        if (indefiniteMap[attr] === undefined && freezeMap[attr] === undefined && item.begin.length) {
                            let maxTime = -1;
                            if (item.repeatCount === -1) {
                                indefiniteStaticMap[attr] = new Map();
                                for (let i = 0; i < item.keyTimes.length; i++) {
                                    indefiniteStaticMap[attr].set(item.keyTimes[i] * item.duration, getItemValue(element, path, item, i));
                                }
                                if (item.begin.some(value => value > 0)) {
                                    indefiniteMap[attr] = new Map();
                                    for (let i = 0; i < item.begin.length; i++) {
                                        const begin = item.begin[i];
                                        const maxThreadTime = item.begin[i + 1] !== undefined ? item.begin[i + 1] : Number.MAX_VALUE;
                                        for (let j = 0; j < item.keyTimes.length; j++) {
                                            const time = begin + item.keyTimes[j] * item.duration;
                                            if (time >= maxThreadTime) {
                                                const insertTime = insertSplitKeyTimeValue(indefiniteMap[attr], element, path, item, 0, begin, maxThreadTime - 1);
                                                if (insertTime !== -1) {
                                                    maxTime = insertTime;
                                                }
                                                break;
                                            }
                                            else if (time > maxTime) {
                                                indefiniteMap[attr].set(time, getItemValue(element, path, item, j));
                                                maxTime = time;
                                            }
                                        }
                                    }
                                }
                                indefiniteAnimations.push(item);
                            }
                            else {
                                let parallel = false;
                                let included = false;
                                if (repeatingMap[attr] === undefined) {
                                    repeatingMap[attr] = new Map();
                                }
                                else {
                                    maxTime = Array.from(repeatingMap[attr].keys()).pop();
                                    if (item.end !== undefined && item.end <= maxTime) {
                                        return;
                                    }
                                    parallel = true;
                                }
                                for (let i = 0; i < item.begin.length; i++) {
                                    const begin = item.begin[i];
                                    const duration = item.duration;
                                    const repeatCount = item.repeatCount;
                                    const durationTotal = duration * repeatCount;
                                    if (item.end === undefined && begin + durationTotal <= maxTime) {
                                        return;
                                    }
                                    const repeatTotal = Math.ceil(repeatCount);
                                    const repeatFraction = repeatCount - Math.floor(repeatCount);
                                    const maxThreadTime = $util$5.minArray([item.begin[i + 1] !== undefined ? item.begin[i + 1] : Number.MAX_VALUE, item.end !== undefined ? item.end : Number.MAX_VALUE]);
                                    for (let j = Math.floor(Math.max(0, maxTime - begin) / duration); j < repeatTotal; j++) {
                                        for (let k = 0; k < item.keyTimes.length; k++) {
                                            const fraction = item.keyTimes[k];
                                            let time;
                                            let value = getItemValue(element, path, item, k, j);
                                            let finalTimeValue = false;
                                            if (j === repeatTotal - 1 && repeatFraction > 0 && repeatFraction >= fraction) {
                                                for (let l = k + 1; l < item.keyTimes.length; l++) {
                                                    if (repeatFraction < item.keyTimes[l]) {
                                                        time = begin + durationTotal;
                                                        value = getSplitValue(repeatFraction, fraction, item.keyTimes[l], value, getItemValue(element, path, item, l, j));
                                                        finalTimeValue = true;
                                                        break;
                                                    }
                                                }
                                            }
                                            if (time === undefined) {
                                                time = begin + (fraction + j) * duration;
                                                if (time === maxThreadTime) {
                                                    finalTimeValue = true;
                                                }
                                                else {
                                                    const adjustKeyTimeValue = (fromMaxThread, splitTime) => {
                                                        const insertTime = insertSplitKeyTimeValue(repeatingMap[attr], element, path, item, j, begin, splitTime + (fromMaxThread && !repeatingMap[attr].has(splitTime) ? 0 : 1));
                                                        if (insertTime !== -1) {
                                                            maxTime = insertTime;
                                                            included = true;
                                                            return true;
                                                        }
                                                        return false;
                                                    };
                                                    if (time > maxThreadTime) {
                                                        if (adjustKeyTimeValue(false, maxThreadTime)) {
                                                            break;
                                                        }
                                                        else {
                                                            finalTimeValue = true;
                                                        }
                                                    }
                                                    else {
                                                        if (parallel) {
                                                            if (begin >= maxTime) {
                                                                time = Math.max(begin, maxTime + 1);
                                                            }
                                                            else {
                                                                if (time < maxTime) {
                                                                    continue;
                                                                }
                                                                else if (time === maxTime) {
                                                                    time = maxTime + 1;
                                                                }
                                                                else {
                                                                    adjustKeyTimeValue(true, maxTime);
                                                                }
                                                            }
                                                            parallel = false;
                                                        }
                                                        else if (j > 0 && k === 0) {
                                                            if (item.additiveSum && item.accumulateSum) {
                                                                maxTime = time;
                                                                continue;
                                                            }
                                                            time = Math.max(time, maxTime + 1);
                                                        }
                                                    }
                                                }
                                            }
                                            if (time > maxTime) {
                                                repeatingMap[attr].set(time, value);
                                                maxTime = time;
                                                included = true;
                                            }
                                            if (finalTimeValue) {
                                                break;
                                            }
                                        }
                                    }
                                }
                                if (included) {
                                    if (item.fillFreeze) {
                                        const value = repeatingMap[attr].get(maxTime);
                                        if (value !== undefined) {
                                            freezeMap[attr] = { time: maxTime, value };
                                        }
                                    }
                                    repeatingAnimations.push(item);
                                }
                            }
                        }
                    });
                    if (repeatingAnimations.length) {
                        for (const attr in indefiniteStaticMap) {
                            if (repeatingMap[attr] === undefined) {
                                if (indefiniteMap[attr]) {
                                    repeatingMap[attr] = indefiniteMap[attr];
                                    indefiniteMap[attr] = undefined;
                                }
                                else {
                                    repeatingMap[attr] = indefiniteStaticMap[attr];
                                }
                            }
                        }
                        const keyTimesRepeating = [];
                        for (const attr in repeatingMap) {
                            keyTimesRepeating.push(...repeatingMap[attr].keys());
                        }
                        const repeatingEndTime = $util$5.maxArray(keyTimesRepeating);
                        for (const attr in repeatingMap) {
                            const insertMap = repeatingMap[attr];
                            let endTime = $util$5.maxArray(Array.from(insertMap.keys()));
                            let modified = false;
                            if (indefiniteMap[attr]) {
                                const baseMap = indefiniteMap[attr];
                                if (endTime >= baseMap.keys().next().value) {
                                    for (let [time, value] of baseMap.entries()) {
                                        time += insertMap.has(time) ? 1 : 0;
                                        insertMap.set(time, value);
                                    }
                                    modified = true;
                                }
                                else {
                                    let joined = false;
                                    for (let [time, value] of baseMap.entries()) {
                                        if (time >= endTime) {
                                            if (!joined) {
                                                const joinTime = endTime + 1;
                                                if (time === endTime) {
                                                    time = joinTime;
                                                }
                                                else if (insertSplitTimeValue(baseMap, insertMap, joinTime)) {
                                                    keyTimesRepeating.push(joinTime);
                                                }
                                                joined = true;
                                            }
                                            insertMap.set(time, value);
                                            keyTimesRepeating.push(time);
                                            endTime = time;
                                            modified = true;
                                        }
                                    }
                                }
                            }
                            if (indefiniteStaticMap[attr] && endTime < repeatingEndTime) {
                                let maxTime = endTime;
                                do {
                                    let insertTime = -1;
                                    for (const [time, data] of indefiniteStaticMap[attr].entries()) {
                                        insertTime = maxTime + time;
                                        insertTime += insertMap.has(insertTime) ? 1 : 0;
                                        insertMap.set(insertTime, data);
                                        keyTimesRepeating.push(insertTime);
                                    }
                                    maxTime = insertTime;
                                } while (maxTime < repeatingEndTime);
                                modified = true;
                            }
                            if (!modified && indefiniteStaticMap[attr] === undefined && freezeMap[attr] === undefined) {
                                const replaceTime = endTime + 1;
                                let value;
                                if (path && path.baseVal[attr] !== null) {
                                    value = path.baseVal[attr];
                                }
                                else {
                                    const optional = $util$5.optionalAsObject(element, `${attr}.baseVal.value`);
                                    if (typeof optional === 'number') {
                                        value = optional;
                                    }
                                }
                                if (value !== undefined && insertMap.get(endTime) !== value) {
                                    insertMap.set(replaceTime, value);
                                    keyTimesRepeating.push(replaceTime);
                                }
                            }
                        }
                        const keyTimes = sortNumberAsc(Array.from(new Set(keyTimesRepeating)));
                        const repeatingResult = {};
                        for (const attr in repeatingMap) {
                            const baseMap = repeatingMap[attr];
                            const insertMap = new Map();
                            const maxTime = Array.from(baseMap.keys()).pop();
                            for (let i = 0; i < keyTimes.length; i++) {
                                const keyTime = keyTimes[i];
                                if (keyTime <= maxTime) {
                                    const value = baseMap.get(keyTime);
                                    if (value === undefined) {
                                        insertSplitTimeValue(baseMap, insertMap, keyTime);
                                    }
                                    else {
                                        insertMap.set(keyTime, value);
                                    }
                                }
                            }
                            repeatingResult[attr] = insertMap;
                        }
                        repeatingDurationTotal = keyTimes[keyTimes.length - 1];
                        if (useKeyTime) {
                            keyTimeMapList.push(convertKeyTimeFraction(getKeyTimeMap(repeatingResult, keyTimes, freezeMap), repeatingDurationTotal));
                        }
                        else {
                            keyTimeMapList.push(getKeyTimeMap(repeatingResult, keyTimes, freezeMap));
                        }
                    }
                    if (indefiniteAnimations.length) {
                        indefiniteDurationTotal = getLeastCommonMultiple(indefiniteAnimations.map(item => item.duration));
                        const indefiniteResult = {};
                        let keyTimes = [];
                        for (const attr in indefiniteStaticMap) {
                            indefiniteResult[attr] = new Map();
                            const object = indefiniteAnimations.find(item => item.attributeName === attr);
                            if (object) {
                                let maxTime = 0;
                                let i = 0;
                                do {
                                    for (let [time, value] of indefiniteStaticMap[attr].entries()) {
                                        time += object.duration * i;
                                        indefiniteResult[attr].set(time, value);
                                        keyTimes.push(time);
                                        maxTime = time;
                                    }
                                    i++;
                                } while (maxTime < indefiniteDurationTotal);
                            }
                        }
                        keyTimes = sortNumberAsc(Array.from(new Set(keyTimes)));
                        for (const attr in indefiniteResult) {
                            const baseMap = indefiniteResult[attr];
                            for (let i = 1; i < keyTimes.length; i++) {
                                const keyTime = keyTimes[i];
                                if (!baseMap.has(keyTime)) {
                                    insertSplitTimeValue(baseMap, baseMap, keyTime);
                                }
                            }
                        }
                        if (useKeyTime) {
                            keyTimeMapList.push(convertKeyTimeFraction(getKeyTimeMap(indefiniteResult, keyTimes), keyTimes[keyTimes.length - 1]));
                        }
                        else {
                            keyTimeMapList.push(getKeyTimeMap(indefiniteResult, keyTimes));
                        }
                    }
                    if (keyTimeMapList.length) {
                        $util$5.retainArray(animate, item => !animations.includes(item));
                        const sequentialName = animations.map(item => item.attributeName).join('-');
                        for (let i = 0; i < keyTimeMapList.length; i++) {
                            const keyTimeMap = keyTimeMapList[i];
                            const freezeIndefinite = repeatingDurationTotal === 0 || i > 0 ? freezeMap : undefined;
                            const repeating = i === 0 && repeatingDurationTotal > 0;
                            let x = 0;
                            let y = 0;
                            if (path === undefined) {
                                x = $util$5.optionalAsNumber(element, `x.baseVal.value`);
                                y = $util$5.optionalAsNumber(element, `y.baseVal.value`);
                            }
                            function setXY(item) {
                                if (!item.has('x')) {
                                    item.set('x', x);
                                }
                                else {
                                    x = item.get('x');
                                }
                                if (!item.has('y')) {
                                    item.set('y', y);
                                }
                                else {
                                    y = item.get('y');
                                }
                            }
                            function insertAnimate(item) {
                                if (repeating) {
                                    item.repeatCount = 0;
                                }
                                else {
                                    item.begin = [0];
                                    item.duration = indefiniteDurationTotal;
                                    item.repeatCount = -1;
                                }
                                item.end = undefined;
                                item.from = item.values[0];
                                item.to = item.values[item.values.length - 1];
                                item.by = '';
                                animate.push(item);
                            }
                            if (useKeyTime) {
                                let object;
                                if (path) {
                                    const pathData = getKeyTimePath(keyTimeMap, path, freezeIndefinite);
                                    if (pathData) {
                                        object = new SvgAnimate(repeating ? repeatingAnimations[0].element : indefiniteAnimations[0].element, element);
                                        object.attributeName = 'd';
                                        object.keyTimes = pathData.map(item => item.time);
                                        object.values = pathData.map(item => item.value.toString());
                                    }
                                    else {
                                        continue;
                                    }
                                }
                                else {
                                    object = new SvgAnimateTransform(repeating ? repeatingAnimations[0].element : indefiniteAnimations[0].element, element);
                                    object.attributeName = 'transform';
                                    object.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                                    object.keyTimes.length = 0;
                                    object.values.length = 0;
                                    for (const [keyTime, data] of keyTimeMap.entries()) {
                                        setXY(data);
                                        object.keyTimes.push(keyTime);
                                        object.values.push(`${x} ${y}`);
                                    }
                                }
                                if (repeating) {
                                    object.begin = [0];
                                    object.duration = repeatingDurationTotal;
                                }
                                insertAnimate(object);
                            }
                            else {
                                const entries = Array.from(keyTimeMap.entries());
                                for (let j = 0, k = 0; j < entries.length - 1; j++) {
                                    const [keyTimeFrom, dataFrom] = entries[j];
                                    const [keyTimeTo, dataTo] = entries[j + 1];
                                    let name;
                                    let object;
                                    if (path) {
                                        const map = new Map();
                                        map.set(keyTimeFrom, dataFrom);
                                        map.set(keyTimeTo, dataTo);
                                        const pathData = getKeyTimePath(map, path, freezeIndefinite);
                                        if (pathData) {
                                            object = new SvgAnimate(repeating ? repeatingAnimations[0].element : indefiniteAnimations[0].element, element);
                                            object.attributeName = 'd';
                                            if (repeating) {
                                                object.begin = [j === 0 ? keyTimeFrom : 0];
                                            }
                                            object.values = pathData.map(item => item.value.toString());
                                        }
                                        else {
                                            continue;
                                        }
                                        name = sequentialName;
                                    }
                                    else {
                                        object = new SvgAnimateTransform(repeating ? repeatingAnimations[0].element : indefiniteAnimations[0].element, element);
                                        object.attributeName = 'transform';
                                        object.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                                        if (repeating) {
                                            object.begin = [keyTimeFrom];
                                        }
                                        object.values = [dataFrom, dataTo].map(item => {
                                            setXY(item);
                                            return `${x} ${y}`;
                                        });
                                        name = sequentialName + j;
                                    }
                                    if (repeating) {
                                        object.duration = keyTimeTo - keyTimeFrom;
                                    }
                                    object.keyTimes = [0, 1];
                                    object.sequential = {
                                        name,
                                        index: k++
                                    };
                                    insertAnimate(object);
                                }
                            }
                        }
                    }
                }
            }
            return animate;
        }
        synchronize(useKeyTime = true) {
            if (this.path) {
                SvgElement.synchronizeAnimations(this.element, this.animate, useKeyTime, this.path);
            }
        }
        get transform() {
            return this.element.transform.baseVal;
        }
        get drawable() {
            return true;
        }
    }

    class SvgGroup extends squared.lib.base.Container {
        constructor(element) {
            super();
            this.element = element;
            this.visible = true;
            this.name = SvgBuild.setName(element);
            this.animate = SvgElement.toAnimateList(element);
            this.visible = isVisible(element);
        }
        synchronize(useKeyTime = true) {
            SvgElement.synchronizeAnimations(this.element, this.animate, useKeyTime);
        }
        get transform() {
            return this.element.transform.baseVal;
        }
    }

    class SvgGroupViewBox extends SvgGroup {
        constructor(element) {
            super(element);
            this.element = element;
            this.x = element.x.baseVal.value;
            this.y = element.y.baseVal.value;
            this.width = element.width.baseVal.value;
            this.height = element.height.baseVal.value;
        }
    }

    var $util$6 = squared.lib.util;
    class SvgImage extends SvgElement {
        constructor(element) {
            super(element);
            this.element = element;
            this.uri = '';
            this.x = element.x.baseVal.value;
            this.y = element.y.baseVal.value;
            this.width = element.width.baseVal.value;
            this.height = element.height.baseVal.value;
            this.uri = $util$6.resolvePath(element.href.baseVal);
        }
        externalize() {
            const transform = this.element.transform.baseVal;
            if (transform.numberOfItems) {
                let x = this.x;
                let y = this.y;
                for (let i = transform.numberOfItems - 1; i >= 0; i--) {
                    const item = transform.getItem(i);
                    const matrix = item.matrix;
                    switch (item.type) {
                        case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                            x += matrix.e;
                            y += matrix.f;
                            break;
                        case SVGTransform.SVG_TRANSFORM_SCALE:
                            x *= matrix.a;
                            y *= matrix.d;
                            this.width *= matrix.a;
                            this.height *= matrix.d;
                            break;
                        case SVGTransform.SVG_TRANSFORM_ROTATE:
                            x = applyMatrixX(matrix, x, x);
                            y = applyMatrixY(matrix, y, y);
                            if (matrix.a < 0) {
                                x += matrix.a * this.width;
                            }
                            if (matrix.c < 0) {
                                x += matrix.c * this.width;
                            }
                            if (matrix.b < 0) {
                                y += matrix.b * this.height;
                            }
                            if (matrix.d < 0) {
                                y += matrix.d * this.height;
                            }
                            break;
                    }
                }
                this.x = x;
                this.y = y;
            }
        }
        get drawable() {
            return false;
        }
    }

    class SvgUse extends SvgGroupViewBox {
        constructor(element) {
            super(element);
            this.element = element;
        }
        setPath(value) {
            this.path = new SvgPath(this.element, value.d);
        }
    }

    var $dom$3 = squared.lib.dom;
    class Svg extends squared.lib.base.Container {
        constructor(element) {
            super();
            this.element = element;
            this.defs = {
                clipPath: new Map(),
                gradient: new Map()
            };
            this._width = 0;
            this._height = 0;
            this._viewBoxWidth = 0;
            this._viewBoxHeight = 0;
            this._opacity = 1;
            this.name = SvgBuild.setName(element);
            this.animate = SvgElement.toAnimateList(element);
            this.visible = isVisible(element);
            this.init();
        }
        setDimensions(width, height) {
            this._width = width;
            this._height = height;
        }
        setViewBox(width, height) {
            this._viewBoxWidth = width;
            this._viewBoxHeight = height;
        }
        setOpacity(value) {
            value = parseFloat(value.toString());
            this._opacity = !isNaN(value) && value < 1 ? value : 1;
        }
        init() {
            const element = this.element;
            this.setViewBox(element.viewBox.baseVal.width, element.viewBox.baseVal.height);
            this.setOpacity($dom$3.cssAttribute(element, 'opacity'));
            this.setDimensions(element.width.baseVal.value, element.height.baseVal.value);
            if ($dom$3.isUserAgent(16 /* FIREFOX */)) {
                const bounds = element.getBoundingClientRect();
                if (bounds.width > this.width && bounds.height > this.height) {
                    this.setDimensions(bounds.width, bounds.height);
                }
            }
            element.querySelectorAll('set, animate, animateTransform, animateMotion').forEach((svg) => {
                const href = svg.attributes.getNamedItem('href');
                if (href && href.value !== '') {
                    const target = getHrefTarget(svg);
                    if (svg.parentElement) {
                        svg.parentElement.removeChild(svg);
                    }
                    if (target) {
                        target.appendChild(svg);
                    }
                }
            });
            element.querySelectorAll('clipPath, linearGradient, radialGradient').forEach((svg) => {
                if (svg.id) {
                    if (svg instanceof SVGClipPathElement) {
                        const group = new SvgGroup(svg);
                        for (const item of Array.from(svg.children)) {
                            if (isSvgShape(item)) {
                                const shape = new SvgElement(item);
                                if (shape.path) {
                                    group.append(shape);
                                }
                            }
                        }
                        if (group.length) {
                            this.defs.clipPath.set(svg.id, group);
                        }
                    }
                    else if (svg instanceof SVGLinearGradientElement) {
                        this.defs.gradient.set(`@${svg.id}`, {
                            type: 'linear',
                            x1: svg.x1.baseVal.value,
                            x2: svg.x2.baseVal.value,
                            y1: svg.y1.baseVal.value,
                            y2: svg.y2.baseVal.value,
                            x1AsString: svg.x1.baseVal.valueAsString,
                            x2AsString: svg.x2.baseVal.valueAsString,
                            y1AsString: svg.y1.baseVal.valueAsString,
                            y2AsString: svg.y2.baseVal.valueAsString,
                            colorStop: SvgBuild.createColorStops(svg)
                        });
                    }
                    else if (svg instanceof SVGRadialGradientElement) {
                        this.defs.gradient.set(`@${svg.id}`, {
                            type: 'radial',
                            cx: svg.cx.baseVal.value,
                            cy: svg.cy.baseVal.value,
                            r: svg.r.baseVal.value,
                            cxAsString: svg.cx.baseVal.valueAsString,
                            cyAsString: svg.cy.baseVal.valueAsString,
                            rAsString: svg.r.baseVal.valueAsString,
                            fx: svg.fx.baseVal.value,
                            fy: svg.fy.baseVal.value,
                            fxAsString: svg.fx.baseVal.valueAsString,
                            fyAsString: svg.fy.baseVal.valueAsString,
                            colorStop: SvgBuild.createColorStops(svg)
                        });
                    }
                }
            });
            const useMap = new Map();
            let currentGroup;
            function appendShape(item) {
                let shape;
                if (isSvgShape(item)) {
                    shape = new SvgElement(item);
                    if (item.id && shape.path) {
                        useMap.set(`#${item.id}`, shape.path);
                    }
                }
                else if (isSvgImage(item)) {
                    shape = new SvgImage(item);
                }
                if (currentGroup && shape) {
                    currentGroup.append(shape);
                }
            }
            for (let i = 0; i < element.children.length; i++) {
                const item = element.children[i];
                if (item instanceof SVGSVGElement) {
                    currentGroup = new SvgGroupViewBox(item);
                    this.append(currentGroup);
                }
                else if (item instanceof SVGGElement) {
                    currentGroup = new SvgGroup(item);
                    this.append(currentGroup);
                }
                else if (item instanceof SVGUseElement) {
                    currentGroup = new SvgUse(item);
                    this.append(currentGroup);
                }
                else {
                    if (currentGroup === undefined) {
                        currentGroup = new SvgGroup(element);
                        this.append(currentGroup);
                    }
                    appendShape(item);
                    continue;
                }
                for (let j = 0; j < item.children.length; j++) {
                    appendShape(item.children[j]);
                }
                currentGroup = undefined;
            }
            this.each(item => {
                if (item instanceof SvgUse) {
                    const path = useMap.get(item.element.href.baseVal);
                    if (path) {
                        item.setPath(path);
                    }
                }
            });
            this.retain(this.filter(item => item.length > 0 || item instanceof SvgUse && item.path !== undefined));
        }
        get width() {
            return this._width;
        }
        get height() {
            return this._height;
        }
        get viewBoxWidth() {
            return this._viewBoxWidth;
        }
        get viewBoxHeight() {
            return this._viewBoxHeight;
        }
        get opacity() {
            return this._opacity;
        }
        get transform() {
            return this.element.transform.baseVal;
        }
    }

    const lib = {
        util
    };

    exports.Svg = Svg;
    exports.SvgAnimate = SvgAnimate;
    exports.SvgAnimateMotion = SvgAnimateMotion;
    exports.SvgAnimateTransform = SvgAnimateTransform;
    exports.SvgAnimation = SvgAnimation;
    exports.SvgBuild = SvgBuild;
    exports.SvgElement = SvgElement;
    exports.SvgGroup = SvgGroup;
    exports.SvgGroupViewBox = SvgGroupViewBox;
    exports.SvgImage = SvgImage;
    exports.SvgPath = SvgPath;
    exports.SvgUse = SvgUse;
    exports.lib = lib;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
