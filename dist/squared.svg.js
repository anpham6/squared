/* squared.svg 0.1.0
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory((global.squared = global.squared || {}, global.squared.svg = {})));
}(this, function (exports) { 'use strict';

    var $dom = squared.lib.dom;
    var $util = squared.lib.util;
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
        isSvgShape: isSvgShape,
        isSvgImage: isSvgImage,
        createTransformData: createTransformData,
        getTransformOrigin: getTransformOrigin,
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

    class SvgAnimation {
        constructor(element, parentElement) {
            this.element = element;
            this.parentElement = parentElement;
            this.attributeName = '';
            this.attributeType = '';
            this.to = '';
            this._begin = 0;
            this._beginMS = 0;
            this._duration = 0;
            this._durationMS = 0;
            this.init();
        }
        static convertClockTime(value) {
            let s = 0;
            let ms = 0;
            if (/\d+ms$/.test(value)) {
                ms = parseInt(value);
            }
            else if (/\d+s$/.test(value)) {
                s = parseInt(value);
            }
            else if (/\d+min$/.test(value)) {
                s = parseInt(value) * 60;
            }
            else if (/\d+(.\d+)?h$/.test(value)) {
                s = parseFloat(value) * 60 * 60;
            }
            else {
                const match = /^(?:(\d?\d):)?(?:(\d?\d):)?(\d?\d)\.?(\d?\d?\d)?$/.exec(value);
                if (match) {
                    if (match[1]) {
                        s += parseInt(match[1]) * 60 * 60;
                    }
                    if (match[2]) {
                        s += parseInt(match[2]) * 60;
                    }
                    if (match[3]) {
                        s += parseInt(match[3]);
                    }
                    if (match[4]) {
                        ms = parseInt(match[4]) * (match[4].length < 3 ? Math.pow(10, 3 - match[4].length) : 1);
                    }
                }
            }
            return [s, ms];
        }
        init() {
            const element = this.element;
            const attributeName = element.attributes.getNamedItem('attributeName');
            if (attributeName) {
                this.attributeName = attributeName.value.trim();
            }
            const attributeType = element.attributes.getNamedItem('attributeType');
            if (attributeType) {
                this.attributeType = attributeType.value.trim();
            }
            const to = element.attributes.getNamedItem('to');
            if (to) {
                this.to = to.value.trim();
            }
            const begin = element.attributes.getNamedItem('begin');
            const dur = element.attributes.getNamedItem('dur');
            if (begin) {
                if (begin.value === 'indefinite') {
                    this._begin = -1;
                }
                else {
                    [this._begin, this._beginMS] = SvgAnimation.convertClockTime(begin.value);
                }
            }
            if (dur) {
                if (dur.value === 'indefinite') {
                    this._duration = -1;
                }
                else {
                    [this._duration, this._durationMS] = SvgAnimation.convertClockTime(dur.value);
                }
            }
        }
        get duration() {
            return this._duration !== -1 ? this._duration * 1000 + this._durationMS : this._duration;
        }
        get begin() {
            return this._begin !== -1 ? this._begin * 1000 + this._beginMS : this._begin;
        }
    }

    var $util$1 = squared.lib.util;
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
            this.additive = false;
            this.accumulate = false;
            this.freeze = false;
            this._end = 0;
            this._endMS = 0;
            this._repeatDurationMS = 0;
            const attributeName = element.attributes.getNamedItem('attributeName');
            if (attributeName) {
                this.attributeName = attributeName.value.trim();
            }
            const attributeType = element.attributes.getNamedItem('attributeType');
            if (attributeType) {
                this.attributeType = attributeType.value.trim();
            }
            const values = element.attributes.getNamedItem('values');
            if (values) {
                this.values.push(...$util$1.flatMap(values.value.split(';'), value => value.trim()));
                if (this.values.length > 1) {
                    this.from = this.values[0];
                    this.to = this.values[this.values.length - 1];
                    const keyTimes = element.attributes.getNamedItem('keyTimes');
                    if (keyTimes) {
                        const times = SvgAnimate.toFractionList(keyTimes.value);
                        if (times.length === this.values.length) {
                            this.keyTimes.push(...times);
                        }
                    }
                }
            }
            else {
                if (this.to) {
                    this.values.push(this.from, this.to);
                    this.keyTimes.push(0, 1);
                    const by = element.attributes.getNamedItem('by');
                    if (by) {
                        this.by = by.value.trim();
                    }
                }
            }
            const end = element.attributes.getNamedItem('end');
            const repeatDur = element.attributes.getNamedItem('repeatDur');
            const repeatCount = element.attributes.getNamedItem('repeatCount');
            if (end) {
                if (end.value === 'indefinite') {
                    this._end = -1;
                }
                else {
                    [this._end, this._endMS] = SvgAnimate.convertClockTime(end.value);
                }
            }
            if (repeatDur) {
                if (repeatDur.value === 'indefinite') {
                    this.repeatDur = -1;
                }
                else {
                    [this.repeatDur, this._repeatDurationMS] = SvgAnimate.convertClockTime(repeatDur.value);
                }
            }
            if (repeatCount) {
                if (repeatCount.value === 'indefinite') {
                    this.repeatCount = -1;
                }
                else {
                    const value = parseInt(repeatCount.value);
                    if (!isNaN(value)) {
                        this.repeatCount = value;
                    }
                }
            }
            const calcMode = element.attributes.getNamedItem('calcMode');
            if (calcMode) {
                switch (calcMode.value) {
                    case 'discrete':
                    case 'linear':
                    case 'paced':
                    case 'spline':
                        this.calcMode = calcMode.value;
                        break;
                }
            }
            const additive = element.attributes.getNamedItem('additive');
            if (additive) {
                this.additive = additive.value === 'sum';
            }
            const accumulate = element.attributes.getNamedItem('accumulate');
            if (accumulate) {
                this.accumulate = accumulate.value === 'sum';
            }
            const fill = element.attributes.getNamedItem('fill');
            if (fill) {
                this.freeze = fill.value === 'freeze';
            }
        }
        static toFractionList(value, delimiter = ';') {
            let previousFraction = -1;
            const result = $util$1.flatMap(value.split(delimiter), segment => {
                const fraction = parseFloat(segment);
                if (!isNaN(fraction) && fraction <= 1 && (previousFraction === -1 || fraction > previousFraction)) {
                    previousFraction = fraction;
                    return fraction;
                }
                return -1;
            });
            return result.length > 1 && result.some(percent => percent !== -1) && result[0] === 0 ? result : [];
        }
        get end() {
            return this._end !== -1 ? this._end * 1000 + this._endMS : this._end;
        }
        get repeatDuration() {
            return this.repeatDur !== undefined && this.repeatDur !== -1 ? this.repeatDur * 1000 + this._repeatDurationMS : 0;
        }
    }

    var $util$2 = squared.lib.util;
    class SvgAnimateMotion extends SvgAnimate {
        constructor(element, parentElement) {
            super(element, parentElement);
            this.path = '';
            this.keyPoints = [];
            this.rotate = 0;
            this.rotateAuto = false;
            this.rotateAutoReverse = false;
            const path = element.attributes.getNamedItem('path');
            if (path) {
                this.path = path.value.trim();
            }
            const rotate = element.attributes.getNamedItem('rotate');
            if (rotate) {
                switch (rotate.value) {
                    case 'auto':
                        this.rotateAuto = true;
                        break;
                    case 'auto-reverse':
                        this.rotateAutoReverse = true;
                        break;
                    default:
                        this.rotate = $util$2.convertInt(rotate.value);
                        break;
                }
            }
            if (this.keyTimes.length) {
                const keyPoints = element.attributes.getNamedItem('keyPoints');
                if (keyPoints) {
                    const points = SvgAnimate.toFractionList(keyPoints.value);
                    if (points.length === this.keyTimes.length) {
                        this.keyPoints = points;
                    }
                }
            }
        }
    }

    class SvgAnimateTransform extends SvgAnimate {
        constructor(element, parentElement) {
            super(element, parentElement);
            this.type = 0;
            const type = element.attributes.getNamedItem('type');
            if (type) {
                switch (type.value) {
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
                }
            }
        }
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
            const result = values.map(value => {
                if (value === '') {
                    return [null, null];
                }
                else {
                    const segment = SvgBuild.toCoordinateList(value);
                    if (segment.length === 1 || segment.length === 2) {
                        return segment;
                    }
                    return [];
                }
            });
            return result.some(item => item.length === 0) ? undefined : result;
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
            this.init();
        }
        static getLine(x1, y1, x2 = 0, y2 = 0) {
            return x1 !== 0 || y1 !== 0 || x2 !== 0 || y2 !== 0 ? `M${x1},${y1} L${x2},${y2}` : '';
        }
        static getRect(width, height, x = 0, y = 0) {
            return width > 0 && height > 0 ? `M${x},${y} h${width} v${height} h${-width} Z` : '';
        }
        static getPolyline(points) {
            points = points instanceof SVGPointList ? SvgBuild.toPointList(points) : points;
            return points.length ? `M${points.map(item => `${item.x},${item.y}`).join(' ')}` : '';
        }
        static getPolygon(points) {
            const value = this.getPolyline(points);
            return value !== '' ? value + ' Z' : '';
        }
        static getCircle(cx, cy, r) {
            return r > 0 ? this.getEllipse(cx, cy, r, r) : '';
        }
        static getEllipse(cx, cy, rx, ry) {
            return rx > 0 && ry > 0 ? `M${cx - rx},${cy} a${rx},${ry},0,1,0,${rx * 2},0 a${rx},${ry},0,1,0,-${rx * 2},0` : '';
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
                        const item = element;
                        this.d = SvgPath.getCircle(item.cx.baseVal.value, item.cy.baseVal.value, item.r.baseVal.value);
                        break;
                    }
                    case 'ellipse': {
                        const item = element;
                        this.d = SvgPath.getEllipse(item.cx.baseVal.value, item.cy.baseVal.value, item.rx.baseVal.value, item.ry.baseVal.value);
                        break;
                    }
                    case 'line': {
                        const item = element;
                        const x1 = item.x1.baseVal.value;
                        const y1 = item.y1.baseVal.value;
                        const x2 = item.x2.baseVal.value;
                        const y2 = item.y2.baseVal.value;
                        if (transform.numberOfItems) {
                            const points = [
                                { x: x1, y: y1 },
                                { x: x2, y: y2 }
                            ];
                            this.d = SvgPath.getPolyline(SvgBuild.applyTransforms(transform, points, getTransformOrigin(element)));
                            this.transformed = true;
                        }
                        else {
                            this.d = SvgPath.getLine(x1, y1, x2, y2);
                        }
                        break;
                    }
                    case 'rect': {
                        const item = element;
                        const x = item.x.baseVal.value;
                        const y = item.y.baseVal.value;
                        const width = item.width.baseVal.value;
                        const height = item.height.baseVal.value;
                        if (transform.numberOfItems) {
                            const points = [
                                { x, y },
                                { x: x + width, y },
                                { x: x + width, y: y + height },
                                { x, y: y + height }
                            ];
                            this.d = SvgPath.getPolygon(SvgBuild.applyTransforms(transform, points, getTransformOrigin(element)));
                            this.transformed = true;
                        }
                        else {
                            this.d = SvgPath.getRect(width, height, x, y);
                        }
                        break;
                    }
                    case 'polyline':
                    case 'polygon': {
                        const item = element;
                        let points = SvgBuild.toPointList(item.points);
                        if (transform.numberOfItems) {
                            points = SvgBuild.applyTransforms(transform, points, getTransformOrigin(element));
                            this.transformed = true;
                        }
                        this.d = element.tagName === 'polygon' ? SvgPath.getPolygon(points) : SvgPath.getPolyline(points);
                        break;
                    }
                }
            }
            const href = $util$3.REGEX_PATTERN.CSS_URL.exec($dom$2.cssAttribute(element, 'clip-path'));
            if (href) {
                this.clipPath = href[1];
                this.clipRule = $dom$2.cssAttribute(element, 'clip-rule', true);
            }
            const opacity = $dom$2.cssAttribute(element, 'opacity');
            if (opacity) {
                this.opacity = Math.min(parseFloat(opacity), 1);
            }
            this.setColor('fill');
            if (this.fill) {
                this.setOpacity('fill');
                this.fillRule = $dom$2.cssAttribute(element, 'fill-rule', true);
            }
            this.setColor('stroke');
            if (this.stroke) {
                this.setOpacity('stroke');
                this.strokeWidth = $dom$2.cssAttribute(element, 'stroke-width') || '1';
                this.strokeLinecap = $dom$2.cssAttribute(element, 'stroke-linecap', true);
                this.strokeLinejoin = $dom$2.cssAttribute(element, 'stroke-linejoin', true);
                this.strokeMiterlimit = $dom$2.cssAttribute(element, 'stroke-miterlimit', true);
            }
        }
    }

    class SvgElement {
        constructor(element) {
            this.element = element;
            this.name = SvgBuild.setName(element);
            this.animate = this.animatable ? SvgElement.toAnimateList(element) : [];
            this.visible = isVisible(element);
            if (this.drawable) {
                const path = new SvgPath(element);
                if (path.d && path.d !== 'none') {
                    this.path = path;
                }
            }
        }
        static toAnimateList(element) {
            const result = [];
            for (let i = 0; i < element.children.length; i++) {
                const item = element.children[i];
                if (item instanceof SVGAnimateTransformElement) {
                    result.push(new SvgAnimateTransform(item, element));
                }
                else if (item instanceof SVGAnimateMotionElement) {
                    result.push(new SvgAnimateMotion(item, element));
                }
                else if (item instanceof SVGAnimateElement) {
                    result.push(new SvgAnimate(item, element));
                }
                else if (item instanceof SVGAnimationElement) {
                    result.push(new SvgAnimation(item, element));
                }
            }
            return result;
        }
        get transform() {
            return this.element.transform.baseVal;
        }
        get drawable() {
            return true;
        }
        get animatable() {
            return true;
        }
        get transformable() {
            return this.transform.numberOfItems > 0;
        }
    }

    class SvgGroup extends squared.lib.base.Container {
        constructor(element) {
            super();
            this.element = element;
            this.visible = true;
            this.name = SvgBuild.setName(element);
            this.animate = this.animatable ? SvgElement.toAnimateList(element) : [];
            this.visible = isVisible(element);
        }
        get transform() {
            return this.element.transform.baseVal;
        }
        get animatable() {
            return this.element instanceof SVGGElement;
        }
        get transformable() {
            return this.element instanceof SVGGElement && this.element.transform.baseVal.numberOfItems > 0;
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
        get animatable() {
            return true;
        }
        get transformable() {
            return this.transform.numberOfItems > 0;
        }
    }

    var $util$4 = squared.lib.util;
    class SvgImage extends SvgElement {
        constructor(element) {
            super(element);
            this.element = element;
            this.uri = '';
            this.x = element.x.baseVal.value;
            this.y = element.y.baseVal.value;
            this.width = element.width.baseVal.value;
            this.height = element.height.baseVal.value;
            this.uri = $util$4.resolvePath(element.href.baseVal);
        }
        setExternal() {
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
        constructor(element, d) {
            super(element);
            this.element = element;
            if (d) {
                this.setPath(d);
            }
        }
        setPath(value) {
            this.path = new SvgPath(this.element, value);
        }
    }

    var $dom$3 = squared.lib.dom;
    class Svg extends squared.lib.base.Container {
        constructor(element) {
            super();
            this.element = element;
            this.animatable = true;
            this.transformable = false;
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
                        useMap.set(`#${item.id}`, shape.path.d);
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
