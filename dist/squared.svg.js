/* squared.svg 0.1.0
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory((global.squared = global.squared || {}, global.squared.svg = {})));
}(this, function (exports) { 'use strict';

    const $dom = squared.lib.dom;
    const $util = squared.lib.util;
    const REGEX_UNIT = {
        DECIMAL: '(-?[\\d.]+)',
        LENGTH: '([\\d.]+(?:[a-z]{2,}|%)?)',
        DEGREE: '(?:(-?[\\d.]+)(deg|rad|turn))'
    };
    const REGEX_TRANSFORM = {
        MATRIX: `(matrix(?:3d)?)\\(${REGEX_UNIT.DECIMAL}, ${REGEX_UNIT.DECIMAL}, ${REGEX_UNIT.DECIMAL}, ${REGEX_UNIT.DECIMAL}, ${REGEX_UNIT.DECIMAL}, ${REGEX_UNIT.DECIMAL}(?:, ${REGEX_UNIT.DECIMAL})?(?:, ${REGEX_UNIT.DECIMAL})?(?:, ${REGEX_UNIT.DECIMAL})?(?:, ${REGEX_UNIT.DECIMAL})?(?:, ${REGEX_UNIT.DECIMAL})?(?:, ${REGEX_UNIT.DECIMAL})?(?:, ${REGEX_UNIT.DECIMAL})?(?:, ${REGEX_UNIT.DECIMAL})?(?:, ${REGEX_UNIT.DECIMAL})?(?:, ${REGEX_UNIT.DECIMAL})?\\)`,
        ROTATE: `(rotate[XY]?)\\(${REGEX_UNIT.DEGREE}\\)`,
        SKEW: `(skew[XY]?)\\(${REGEX_UNIT.DEGREE}(?:, ${REGEX_UNIT.DEGREE})?\\)`,
        SCALE: `(scale[XY]?)\\(${REGEX_UNIT.DECIMAL}(?:, ${REGEX_UNIT.DECIMAL})?\\)`,
        TRANSLATE: `(translate[XY]?)\\(${REGEX_UNIT.LENGTH}(?:, ${REGEX_UNIT.LENGTH})?\\)`
    };
    const SHAPES = {
        path: 1,
        line: 2,
        rect: 3,
        ellipse: 4,
        circle: 5,
        polyline: 6,
        polygon: 7
    };
    function getHostDPI() {
        return $util.optionalAsNumber(squared, 'settings.resolutionDPI') || 96;
    }
    function getFontSize(element) {
        return parseInt($dom.getStyle(element).fontSize || '16');
    }
    function setAttribute(element, attr, value) {
        element.style[attr] = value;
        element.setAttribute(attr, value);
    }
    const MATRIX = {
        rotate(angle) {
            const r = convertRadian(angle);
            const a = Math.cos(r);
            const b = Math.sin(r);
            return {
                a,
                b,
                c: b * -1,
                d: a,
                e: 0,
                f: 0
            };
        },
        skew(x = 0, y = 0) {
            return {
                a: 1,
                b: Math.tan(convertRadian(y)),
                c: Math.tan(convertRadian(x)),
                d: 1,
                e: 0,
                f: 0
            };
        },
        scale(x = 1, y = 1) {
            return {
                a: x,
                b: 0,
                c: 0,
                d: y,
                e: 0,
                f: 0
            };
        },
        translate(x = 0, y = 0) {
            return {
                a: 1,
                b: 0,
                c: 0,
                d: 1,
                e: x,
                f: y
            };
        }
    };
    function ascendToViewport(element) {
        const result = [];
        let parent = element.parentElement;
        while (parent instanceof SVGGraphicsElement) {
            result.push(parent);
            parent = parent.parentElement;
            if (parent instanceof HTMLElement) {
                break;
            }
        }
        return result;
    }
    function isSvgUse(element) {
        return element.tagName === 'use';
    }
    function isSvgShape(element) {
        return SHAPES[element.tagName] !== undefined;
    }
    function isSvgImage(element) {
        return element.tagName === 'image';
    }
    function isVisible(element) {
        const value = $dom.cssAttribute(element, 'visibility', true);
        return value !== 'hidden' && value !== 'collapse' && $dom.cssAttribute(element, 'display', true) !== 'none';
    }
    function setVisible(element, value) {
        setAttribute(element, 'display', value ? 'block' : 'none');
        setAttribute(element, 'visibility', value ? 'visible' : 'hidden');
    }
    function setOpacity(element, value) {
        if ($util.isNumber(value)) {
            let opacity = parseFloat(value.toString());
            if (opacity <= 0) {
                opacity = 0;
            }
            else if (opacity >= 1) {
                opacity = 1;
            }
            element.style.opacity = opacity.toString();
            element.setAttribute('opacity', opacity.toString());
        }
    }
    function getHrefTargetElement(element, parentElement) {
        const href = element.attributes.getNamedItem('href');
        if (href && href.value.charAt(0) === '#') {
            const id = href.value.substring(1);
            if (parentElement) {
                for (const target of Array.from(parentElement.querySelectorAll('*'))) {
                    if (target.id === id) {
                        if (target instanceof SVGGraphicsElement) {
                            return target;
                        }
                        else {
                            return null;
                        }
                    }
                }
            }
            else {
                const target = document.getElementById(id);
                if (target instanceof SVGGraphicsElement) {
                    return target;
                }
            }
        }
        return null;
    }
    function getTransformMatrix(element) {
        const match = new RegExp(REGEX_TRANSFORM.MATRIX).exec($dom.getStyle(element, true).transform || '');
        if (match) {
            switch (match[1]) {
                case 'matrix':
                    return {
                        a: parseFloat(match[2]),
                        b: parseFloat(match[3]),
                        c: parseFloat(match[4]),
                        d: parseFloat(match[5]),
                        e: parseFloat(match[6]),
                        f: parseFloat(match[7])
                    };
                case 'matrix3d':
                    return {
                        a: parseFloat(match[2]),
                        b: parseFloat(match[3]),
                        c: parseFloat(match[6]),
                        d: parseFloat(match[7]),
                        e: parseFloat(match[14]),
                        f: parseFloat(match[15])
                    };
            }
        }
        return undefined;
    }
    function convertAngle(value, unit = 'deg') {
        let angle = parseFloat(value);
        switch (unit) {
            case 'turn':
                angle *= 360;
                break;
            case 'rad':
                angle *= 180 / Math.PI;
                break;
        }
        return angle;
    }
    function createTransform(type, matrix, angle = 0, x = true, y = true) {
        return {
            type,
            matrix,
            angle,
            method: { x, y }
        };
    }
    function getRotateOrigin(element) {
        const result = [];
        const attr = element.attributes.getNamedItem('transform');
        if (attr) {
            const pattern = /rotate\((-?[\d.]+),\s*(-?[\d.]+),\s*(-?[\d.]+)\)/g;
            let match = null;
            while ((match = pattern.exec(attr.value)) !== null) {
                result.push({
                    angle: parseFloat(match[1]),
                    x: parseFloat(match[2]),
                    y: parseFloat(match[3])
                });
            }
        }
        return result.length ? result : [{ angle: 0, x: 0, y: 0 }];
    }
    function getTransform(element) {
        const value = $dom.cssInline(element, 'transform');
        if (value !== '') {
            let result = [];
            for (const name in REGEX_TRANSFORM) {
                const pattern = new RegExp(REGEX_TRANSFORM[name], 'g');
                let match = null;
                while ((match = pattern.exec(value)) !== null) {
                    const isX = match[1].endsWith('X');
                    const isY = match[1].endsWith('Y');
                    if (match[1].startsWith('rotate')) {
                        const angle = convertAngle(match[2], match[3]);
                        const matrix = MATRIX.rotate(angle);
                        if (isX) {
                            matrix.a = 1;
                            matrix.b = 0;
                            matrix.c = 0;
                        }
                        else if (isY) {
                            matrix.b = 0;
                            matrix.c = 0;
                            matrix.d = 1;
                        }
                        result[match.index + 1] = createTransform(SVGTransform.SVG_TRANSFORM_ROTATE, matrix, angle, !isX, !isY);
                    }
                    else if (match[1].startsWith('skew')) {
                        const x = isY ? 0 : convertAngle(match[2], match[3]);
                        const y = isY ? convertAngle(match[2], match[3]) : (match[4] && match[5] ? convertAngle(match[4], match[5]) : 0);
                        const matrix = MATRIX.skew(x, y);
                        if (isX) {
                            result[match.index] = createTransform(SVGTransform.SVG_TRANSFORM_SKEWX, matrix, x, true, false);
                        }
                        else if (isY) {
                            result[match.index] = createTransform(SVGTransform.SVG_TRANSFORM_SKEWY, matrix, y, false, true);
                        }
                        else {
                            result[match.index] = createTransform(SVGTransform.SVG_TRANSFORM_SKEWX, Object.assign({}, matrix, { b: 0 }), x, true, false);
                            if (y !== 0) {
                                result[match.index + 1] = createTransform(SVGTransform.SVG_TRANSFORM_SKEWY, Object.assign({}, matrix, { c: 0 }), y, false, true);
                            }
                        }
                    }
                    else if (match[1].startsWith('scale')) {
                        const x = isY ? undefined : parseFloat(match[2]);
                        const y = isY ? parseFloat(match[2]) : (!isX && match[3] ? parseFloat(match[3]) : x);
                        const matrix = MATRIX.scale(x, isX ? undefined : y);
                        result[match.index] = createTransform(SVGTransform.SVG_TRANSFORM_SCALE, matrix, 0, !isY, !isX);
                    }
                    else if (match[1].startsWith('translate')) {
                        const dpi = getHostDPI();
                        const fontSize = getFontSize(element);
                        const arg1 = parseFloat($util.convertPX(match[2], dpi, fontSize));
                        const arg2 = (!isX && match[3] ? parseFloat($util.convertPX(match[3], dpi, fontSize)) : 0);
                        const x = isY ? 0 : arg1;
                        const y = isY ? arg1 : arg2;
                        const matrix = MATRIX.translate(x, y);
                        result[match.index] = createTransform(SVGTransform.SVG_TRANSFORM_TRANSLATE, matrix, 0);
                    }
                    else if (match[1].startsWith('matrix')) {
                        const matrix = getTransformMatrix(element);
                        if (matrix) {
                            result[match.index] = createTransform(SVGTransform.SVG_TRANSFORM_MATRIX, matrix);
                        }
                    }
                }
            }
            result = result.filter(item => item);
            result.forEach(item => item.css = true);
            return result;
        }
        return undefined;
    }
    function getTransformOrigin(element) {
        const value = $dom.cssAttribute(element, 'transform-origin', true);
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
                                origin[attr] = parseInt(position.endsWith('px') ? position : $util.convertPX(position, getHostDPI(), getFontSize(element)));
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
    function sortNumber(values, descending = false) {
        return descending ? values.sort((a, b) => a > b ? -1 : 1) : values.sort((a, b) => a < b ? -1 : 1);
    }
    function getLeastCommonMultiple(values) {
        const sorted = sortNumber(values.slice());
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
        return radius * Math.sin(convertRadian(angle));
    }
    function getRadiusY(angle, radius) {
        return radius * Math.cos(convertRadian(angle)) * -1;
    }
    function convertRadian(angle) {
        return angle * Math.PI / 180;
    }

    var util = /*#__PURE__*/Object.freeze({
        SHAPES: SHAPES,
        MATRIX: MATRIX,
        ascendToViewport: ascendToViewport,
        isSvgUse: isSvgUse,
        isSvgShape: isSvgShape,
        isSvgImage: isSvgImage,
        isVisible: isVisible,
        setVisible: setVisible,
        setOpacity: setOpacity,
        getHrefTargetElement: getHrefTargetElement,
        getTransformMatrix: getTransformMatrix,
        convertAngle: convertAngle,
        createTransform: createTransform,
        getRotateOrigin: getRotateOrigin,
        getTransform: getTransform,
        getTransformOrigin: getTransformOrigin,
        sortNumber: sortNumber,
        getLeastCommonMultiple: getLeastCommonMultiple,
        applyMatrixX: applyMatrixX,
        applyMatrixY: applyMatrixY,
        getRadiusX: getRadiusX,
        getRadiusY: getRadiusY,
        convertRadian: convertRadian
    });

    const $util$1 = squared.lib.util;
    class SvgAnimation {
        constructor(element) {
            this.element = element;
            this.attributeName = '';
            this.to = '';
            this.begin = [0];
            this.setAttribute('attributeName');
            this.setAttribute('to');
            const begin = this.getAttribute('begin');
            const dur = this.getAttribute('dur');
            if (begin === 'indefinite' || begin === 'click') {
                this.begin.length = 0;
            }
            else if (begin !== '') {
                this.begin = sortNumber(begin.split(';').map(value => SvgAnimation.convertClockTime(value)));
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

    const $util$2 = squared.lib.util;
    class SvgAnimate extends SvgAnimation {
        constructor(element) {
            super(element);
            this.element = element;
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
                else if (element.parentElement) {
                    const value = $util$2.optionalAsString(element.parentElement, `${this.attributeName}.baseVal.value`);
                    if (value !== '') {
                        this.from = value;
                    }
                    else {
                        const current = element.parentElement.attributes.getNamedItem(this.attributeName);
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
                    const times = sortNumber(end.split(';').map(value => SvgAnimation.convertClockTime(value)));
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

    const $color = squared.lib.color;
    const $dom$1 = squared.lib.dom;
    const $util$3 = squared.lib.util;
    const NAME_GRAPHICS = new Map();
    class SvgBuild {
        static setName(element) {
            if (element) {
                let result = '';
                let tagName;
                if ($util$3.isString(element.id)) {
                    if (!NAME_GRAPHICS.has(element.id)) {
                        result = element.id;
                    }
                    tagName = element.id;
                }
                else {
                    tagName = element.tagName;
                }
                let index = NAME_GRAPHICS.get(tagName) || 0;
                if (result !== '') {
                    NAME_GRAPHICS.set(tagName, index);
                    return result;
                }
                else {
                    NAME_GRAPHICS.set(tagName, ++index);
                    return `${tagName}_${index}`;
                }
            }
            else {
                NAME_GRAPHICS.clear();
                return '';
            }
        }
        static filterTransforms(transform, exclude) {
            return (exclude ? transform.filter(item => !exclude.includes(item.type)) : transform).filter(item => !(item.type === SVGTransform.SVG_TRANSFORM_SCALE && item.matrix.a === 1 && item.matrix.d === 1));
        }
        static applyTransforms(transform, values, origin, center) {
            const result = SvgBuild.toPointList(values);
            const items = transform.slice().reverse();
            for (const item of items) {
                let x1 = 0;
                let y1 = 0;
                let x2 = 0;
                let y2 = 0;
                let x3 = 0;
                let y3 = 0;
                if (origin) {
                    switch (item.type) {
                        case SVGTransform.SVG_TRANSFORM_SCALE:
                            if (item.method.x) {
                                x1 += origin.x;
                            }
                            if (item.method.y) {
                                y2 += origin.y;
                            }
                            break;
                        case SVGTransform.SVG_TRANSFORM_SKEWX:
                            if (item.method.y) {
                                y1 -= origin.y;
                            }
                            break;
                        case SVGTransform.SVG_TRANSFORM_SKEWY:
                            if (item.method.x) {
                                x2 -= origin.x;
                            }
                            break;
                        case SVGTransform.SVG_TRANSFORM_ROTATE:
                            if (item.method.x) {
                                x2 -= origin.x;
                                x3 = origin.x + getRadiusY(item.angle, origin.x);
                            }
                            if (item.method.y) {
                                y1 -= origin.y;
                                y3 = origin.y + getRadiusY(item.angle, origin.y);
                            }
                            break;
                    }
                }
                const m = item.matrix;
                if (center) {
                    switch (item.type) {
                        case SVGTransform.SVG_TRANSFORM_SCALE:
                            center.x *= m.a;
                            center.y *= m.d;
                            break;
                        case SVGTransform.SVG_TRANSFORM_ROTATE:
                            if (item.angle !== 0) {
                                center.angle = (center.angle || 0) + item.angle;
                            }
                            break;
                        case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                            center.x += m.e;
                            center.y += m.f;
                            break;
                    }
                }
                for (const pt of result) {
                    const x = pt.x;
                    pt.x = applyMatrixX(m, x + x1, pt.y + y1) + x3;
                    pt.y = applyMatrixY(m, x + x2, pt.y + y2) + y3;
                    if (pt.rx !== undefined && pt.ry !== undefined) {
                        const rx = pt.rx;
                        switch (item.type) {
                            case SVGTransform.SVG_TRANSFORM_SCALE:
                                pt.rx = applyMatrixX(m, rx + x1, pt.ry + y1);
                                pt.ry = applyMatrixY(m, rx + x2, pt.ry + y2);
                                break;
                        }
                    }
                }
            }
            return result;
        }
        static partitionTransforms(element, transform, fromPath = false) {
            const host = [];
            const client = [];
            if (transform.length) {
                const rotateOrigin = transform[0].css ? [] : getRotateOrigin(element);
                rotateOrigin.reverse();
                const partition = transform.slice().reverse();
                const typeIndex = new Set();
                let rx = 1;
                let ry = 1;
                if (fromPath && element instanceof SVGEllipseElement) {
                    rx = element.rx.baseVal.value;
                    ry = element.ry.baseVal.value;
                }
                let current = [];
                for (let i = 0; i < partition.length; i++) {
                    const item = partition[i];
                    let prerotate = fromPath && host.length === 0 && current.length === 0;
                    if (!prerotate && typeIndex.has(item.type)) {
                        current.reverse();
                        host.push(current);
                        current = [item];
                        typeIndex.clear();
                    }
                    else {
                        switch (item.type) {
                            case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                                if (prerotate) {
                                    client.push(item);
                                }
                                else {
                                    current.push(item);
                                }
                                break;
                            case SVGTransform.SVG_TRANSFORM_SCALE:
                                if (prerotate) {
                                    client.push(item);
                                }
                                else {
                                    current.push(item);
                                }
                                break;
                            case SVGTransform.SVG_TRANSFORM_MATRIX:
                                if (prerotate && item.matrix.b === 0 && item.matrix.c === 0) {
                                    client.push(item);
                                }
                                else {
                                    current.push(item);
                                    prerotate = false;
                                }
                                break;
                            case SVGTransform.SVG_TRANSFORM_ROTATE:
                                if (rotateOrigin.length) {
                                    const origin = rotateOrigin.shift();
                                    if (origin.angle === item.angle) {
                                        item.origin = origin;
                                    }
                                }
                                if (prerotate && rx === ry && (i === 0 || client[client.length - 1].type === SVGTransform.SVG_TRANSFORM_ROTATE)) {
                                    client.push(item);
                                }
                                else {
                                    if (!prerotate) {
                                        current.reverse();
                                        host.push(current);
                                        current = [];
                                        typeIndex.clear();
                                    }
                                    current.push(item);
                                    continue;
                                }
                                break;
                            case SVGTransform.SVG_TRANSFORM_SKEWX:
                            case SVGTransform.SVG_TRANSFORM_SKEWY:
                                current.push(item);
                                prerotate = false;
                                break;
                        }
                    }
                    if (!prerotate) {
                        typeIndex.add(item.type);
                    }
                }
                if (current.length) {
                    current.reverse();
                    host.push(current);
                }
            }
            return [host, client];
        }
        static getCenterPoint(values) {
            const pointsX = values.map(pt => pt.x);
            const pointsY = values.map(pt => pt.y);
            return {
                x: ($util$3.minArray(pointsX) + $util$3.maxArray(pointsX)) / 2,
                y: ($util$3.minArray(pointsY) + $util$3.maxArray(pointsY)) / 2
            };
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
        static toPointList(values) {
            const result = [];
            if (values instanceof SVGPointList) {
                for (let j = 0; j < values.numberOfItems; j++) {
                    const pt = values.getItem(j);
                    result.push({ x: pt.x, y: pt.y });
                }
            }
            else {
                for (const pt of values) {
                    const item = { x: pt.x, y: pt.y };
                    if (pt.rx !== undefined && pt.ry !== undefined) {
                        item.rx = pt.rx;
                        item.ry = pt.ry;
                    }
                    result.push(item);
                }
            }
            return result;
        }
        static toAbsolutePointList(values) {
            const result = [];
            let x = 0;
            let y = 0;
            for (let i = 0; i < values.length; i++) {
                const item = values[i];
                for (let j = 0; j < item.coordinates.length; j += 2) {
                    if (item.relative) {
                        x += item.coordinates[j];
                        y += item.coordinates[j + 1];
                    }
                    else {
                        x = item.coordinates[j];
                        y = item.coordinates[j + 1];
                    }
                    const pt = { x, y };
                    if (item.command.toUpperCase() === 'A') {
                        pt.rx = item.radiusX;
                        pt.ry = item.radiusY;
                    }
                    result.push(pt);
                }
                if (item.relative) {
                    switch (item.command) {
                        case 'h':
                        case 'v':
                            const previous = values[i - 1];
                            if (previous && previous.command === 'M') {
                                previous.coordinates.push(...item.coordinates);
                                values.splice(i, 1);
                                i--;
                            }
                            item.command = 'M';
                            break;
                        default:
                            item.command = item.command.toUpperCase();
                            break;
                    }
                    item.relative = false;
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
                const coordinates = SvgBuild.toCoordinateList(command[2]);
                const previous = result[result.length - 1];
                const previousCommand = previous ? previous.command.toUpperCase() : '';
                let previousPoint = previous ? previous.points[previous.points.length - 1] : undefined;
                let radiusX;
                let radiusY;
                let xAxisRotation;
                let largeArcFlag;
                let sweepFlag;
                switch (command[1].toUpperCase()) {
                    case 'M':
                        if (result.length === 0) {
                            command[1] = 'M';
                        }
                    case 'L':
                        if (coordinates.length >= 2) {
                            if (coordinates.length % 2 !== 0) {
                                coordinates.length--;
                            }
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
                            coordinates.push(...result[0].coordinates.slice(0, 2));
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
                            previousPoint = { x, y };
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
        static toColorStopList(element) {
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
        static toAnimateList(element) {
            const result = [];
            if (element instanceof SVGGraphicsElement) {
                for (let i = 0; i < element.children.length; i++) {
                    const item = element.children[i];
                    if (item instanceof SVGAnimationElement) {
                        if (item instanceof SVGAnimateTransformElement) {
                            result.push(new squared.svg.SvgAnimateTransform(item));
                        }
                        else if (item instanceof SVGAnimateMotionElement) {
                            result.push(new squared.svg.SvgAnimateMotion(item));
                        }
                        else if (item instanceof SVGAnimateElement) {
                            result.push(new squared.svg.SvgAnimate(item));
                        }
                        else {
                            result.push(new squared.svg.SvgAnimation(item));
                        }
                    }
                }
            }
            return result;
        }
        static toTransformList(transform) {
            const result = [];
            for (let i = 0; i < transform.numberOfItems; i++) {
                const item = transform.getItem(i);
                result.push(createTransform(item.type, item.matrix, item.angle));
            }
            return result;
        }
        static fromPointsValue(value) {
            const result = [];
            value.trim().split(/\s+/).forEach(point => {
                const [x, y] = point.split(',').map(pt => parseFloat(pt));
                result.push({ x, y });
            });
            return result;
        }
        static fromNumberList(values) {
            const result = [];
            for (let i = 0; i < values.length; i += 2) {
                result.push({ x: values[i], y: values[i + 1] });
            }
            return result.length % 2 === 0 ? result : [];
        }
        static fromAbsolutePointList(values, points) {
            const absolute = points.slice();
            invalidPoint: {
                for (const item of values) {
                    switch (item.command.toUpperCase()) {
                        case 'M':
                        case 'L':
                        case 'H':
                        case 'V':
                        case 'C':
                        case 'S':
                        case 'Q':
                        case 'T': {
                            for (let i = 0; i < item.coordinates.length; i += 2) {
                                const pt = absolute.shift();
                                if (pt) {
                                    item.coordinates[i] = pt.x;
                                    item.coordinates[i + 1] = pt.y;
                                }
                                else {
                                    values = [];
                                    break invalidPoint;
                                }
                            }
                            break;
                        }
                        case 'A': {
                            const pt = absolute.shift();
                            if (pt && pt.rx !== undefined && pt.ry !== undefined) {
                                item.coordinates[0] = pt.x;
                                item.coordinates[1] = pt.y;
                                item.radiusX = pt.rx;
                                item.radiusY = pt.ry;
                            }
                            else {
                                values = [];
                                break invalidPoint;
                            }
                            break;
                        }
                    }
                }
            }
            return values;
        }
        static fromPathCommandList(values) {
            let result = '';
            for (const item of values) {
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

    const $dom$2 = squared.lib.dom;
    var SvgView$MX = (Base) => {
        return class extends Base {
            constructor() {
                super(...arguments);
                this.baseValue = {
                    transformed: null
                };
            }
            get name() {
                if (this._name === undefined) {
                    this._name = SvgBuild.setName(this.element);
                }
                return this._name;
            }
            get transform() {
                if (this._transform === undefined) {
                    this._transform = getTransform(this.element) || SvgBuild.toTransformList(this.element.transform.baseVal);
                }
                return this._transform;
            }
            get animate() {
                if (this._animate === undefined) {
                    this._animate = SvgBuild.toAnimateList(this.element);
                }
                for (const item of this._animate) {
                    if (item instanceof SvgAnimate) {
                        item.parent = this;
                    }
                }
                return this._animate;
            }
            set visible(value) {
                setVisible(this.element, value);
            }
            get visible() {
                return isVisible(this.element);
            }
            set opacity(value) {
                setOpacity(this.element, value);
            }
            get opacity() {
                return $dom$2.cssAttribute(this.element, 'opacity') || '1';
            }
        };
    };

    const $dom$3 = squared.lib.dom;
    var SvgViewRect$MX = (Base) => {
        return class extends Base {
            setRect() {
                this.baseValue = Object.assign(this.baseValue || {}, {
                    x: this.x,
                    y: this.y,
                    width: this.width,
                    height: this.height,
                    transformed: null
                });
            }
            getElement() {
                return this.element instanceof SVGSVGElement || this.element instanceof SVGUseElement || this.element instanceof SVGImageElement ? this.element : undefined;
            }
            set x(value) {
                const element = this.getElement();
                if (element) {
                    element.x.baseVal.value = value;
                }
            }
            get x() {
                const element = this.getElement();
                if (element) {
                    return element.x.baseVal.value;
                }
                return 0;
            }
            set y(value) {
                const element = this.getElement();
                if (element) {
                    element.y.baseVal.value = value;
                }
            }
            get y() {
                const element = this.getElement();
                if (element) {
                    return element.y.baseVal.value;
                }
                return 0;
            }
            set width(value) {
                const element = this.getElement();
                if (element) {
                    if (element instanceof SVGSVGElement && $dom$3.isUserAgent(16 /* FIREFOX */)) {
                        this._width = value;
                    }
                    else {
                        element.width.baseVal.value = value;
                    }
                }
            }
            get width() {
                const element = this.getElement();
                if (element) {
                    if (element instanceof SVGSVGElement && $dom$3.isUserAgent(16 /* FIREFOX */)) {
                        if (this._width !== undefined) {
                            return this._width;
                        }
                        else {
                            const bounds = element.getBoundingClientRect();
                            return bounds.width;
                        }
                    }
                    else {
                        return element.width.baseVal.value;
                    }
                }
                return 0;
            }
            set height(value) {
                const element = this.getElement();
                if (element) {
                    if (element instanceof SVGSVGElement && $dom$3.isUserAgent(16 /* FIREFOX */)) {
                        this._height = value;
                    }
                    else {
                        element.height.baseVal.value = value;
                    }
                }
            }
            get height() {
                const element = this.getElement();
                if (element) {
                    if (element instanceof SVGSVGElement && $dom$3.isUserAgent(16 /* FIREFOX */)) {
                        if (this._height !== undefined) {
                            return this._height;
                        }
                        else {
                            const bounds = element.getBoundingClientRect();
                            return bounds.height;
                        }
                    }
                    else {
                        return element.height.baseVal.value;
                    }
                }
                return 0;
            }
        };
    };

    class SvgContainer extends squared.lib.base.Container {
        constructor(element) {
            super();
            this.element = element;
        }
        build(residual = false, exclusions) {
            this.clear();
            for (let i = 0; i < this.element.children.length; i++) {
                const item = this.element.children[i];
                let svg;
                if (item instanceof SVGSVGElement) {
                    svg = new squared.svg.Svg(item, false);
                }
                else if (item instanceof SVGGElement) {
                    svg = new squared.svg.SvgG(item);
                }
                else if (item instanceof SVGUseElement) {
                    const target = getHrefTargetElement(item, item.parentElement);
                    if (target) {
                        if (target instanceof SVGSymbolElement) {
                            svg = new squared.svg.SvgUseSymbol(item, target);
                        }
                        else if (isSvgImage(target)) {
                            svg = new squared.svg.SvgImage(item, target);
                        }
                        else if (isSvgShape(target)) {
                            svg = new squared.svg.SvgUse(item, target);
                        }
                    }
                }
                else if (isSvgImage(item)) {
                    svg = new squared.svg.SvgImage(item);
                }
                else if (isSvgShape(item)) {
                    svg = new squared.svg.SvgShape(item);
                }
                if (svg) {
                    svg.build(residual, exclusions);
                    this.append(svg);
                }
            }
        }
        synchronize(useKeyTime = false) {
            this.each(item => item.synchronize(useKeyTime));
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
        constructor(element) {
            super(element);
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

    class SvgElement {
        constructor(element) {
            this.element = element;
        }
        build() { }
        synchronize() { }
    }

    const $color$1 = squared.lib.color;
    const $dom$4 = squared.lib.dom;
    const $util$4 = squared.lib.util;
    var SvgPaint$MX = (Base) => {
        return class extends Base {
            constructor() {
                super(...arguments);
                this.fill = 'black';
                this.fillPattern = '';
                this.fillOpacity = '1';
                this.fillRule = 'nonzero';
                this.stroke = '';
                this.strokeWidth = '1';
                this.strokePattern = '';
                this.strokeOpacity = '1';
                this.strokeLinecap = 'butt';
                this.strokeLinejoin = 'miter';
                this.strokeMiterlimit = '4';
                this.strokeDashArray = '';
                this.strokeDashOffset = '0';
                this.color = '';
                this.clipPath = '';
                this.clipRule = '';
            }
            setPaint() {
                const opacity = this.getAttribute('opacity');
                if (opacity !== '') {
                    this.opacity = Math.min(parseFloat(opacity), 1).toString();
                }
                this.setAttribute('color');
                this.setColor('fill');
                this.setOpacity('fill');
                this.setAttribute('fill-rule');
                this.setColor('stroke');
                this.setOpacity('stroke');
                this.setAttribute('stroke-width');
                this.setAttribute('stroke-linecap');
                this.setAttribute('stroke-linejoin');
                this.setAttribute('stroke-miterlimit');
                this.setAttribute('stroke-dasharray');
                this.setAttribute('stroke-dashoffset');
                const match = $util$4.REGEX_PATTERN.CSS_URL.exec(this.getAttribute('clip-path'));
                this.clipPath = match ? match[1] : '';
                this.clipRule = this.getAttribute('clip-rule');
            }
            setColor(attr) {
                const element = this.element;
                let value = this.getAttribute(attr);
                const match = $util$4.REGEX_PATTERN.CSS_URL.exec(value);
                if (match) {
                    this[`${attr}Pattern`] = match[1];
                    value = '';
                }
                else if (value !== '') {
                    switch (value.toLowerCase()) {
                        case 'none':
                        case 'transparent':
                        case 'rgba(0, 0, 0, 0)':
                            value = '';
                            break;
                        case 'currentcolor': {
                            const color = $color$1.parseRGBA(this.color || $dom$4.cssAttribute(element, attr, true));
                            value = color ? color.valueRGB : null;
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
                    if (attr === 'fill') {
                        value = null;
                    }
                }
                if (value !== null) {
                    this[attr] = value;
                }
            }
            set opacity(value) {
                setOpacity(this.element, value);
            }
            get opacity() {
                return $dom$4.cssAttribute(this.element, 'opacity') || '1';
            }
            setOpacity(attr) {
                const opacity = this.getAttribute(`${attr}-opacity`);
                this[`${attr}Opacity`] = opacity ? (parseFloat(opacity) * parseFloat(this.opacity)).toString() : this.opacity;
            }
            getAttribute(attr) {
                return $dom$4.cssAttribute(this.element, attr) || (this.parentElement ? $dom$4.cssAttribute(this.parentElement, attr) : '');
            }
            setAttribute(attr) {
                const value = this.getAttribute(attr);
                if (value !== '') {
                    this[$util$4.convertCamelCase(attr)] = value;
                }
            }
        };
    };

    class SvgBase {
        constructor(element) {
            this.element = element;
        }
    }

    const $dom$5 = squared.lib.dom;
    class SvgPath extends SvgPaint$MX(SvgBase) {
        constructor(element, parentElement) {
            super(element);
            this.element = element;
            this.parentElement = parentElement;
            this.name = '';
            this.value = '';
            this.baseValue = {
                d: null,
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
                points: null,
                transformed: null
            };
            if (parentElement === undefined && (element.parentElement instanceof SVGGElement || element.parentElement instanceof SVGUseElement)) {
                this.parentElement = element.parentElement;
            }
            this.init();
        }
        static getLine(x1, y1, x2 = 0, y2 = 0) {
            return `M${x1},${y1} L${x2},${y2}`;
        }
        static getCircle(cx, cy, r) {
            return SvgPath.getEllipse(cx, cy, r);
        }
        static getEllipse(cx, cy, rx, ry) {
            if (ry === undefined) {
                ry = rx;
            }
            return `M${cx - rx},${cy} a${rx},${ry},0,1,0,${rx * 2},0 a${rx},${ry},0,1,0,-${rx * 2},0`;
        }
        static getRect(width, height, x = 0, y = 0) {
            return `M${x},${y} h${width} v${height} h${-width} Z`;
        }
        static getPolygon(points) {
            const value = SvgPath.getPolyline(points);
            return value !== '' ? value + ' Z' : '';
        }
        static getPolyline(points) {
            return points.length ? `M${points.map(item => `${item.x},${item.y}`).join(' ')}` : '';
        }
        draw(transform, residual = true, save = true) {
            const element = this.element;
            let d = '';
            if (save) {
                this.baseValue.transformed = null;
            }
            if (element instanceof SVGPathElement) {
                d = this.baseValue.d || $dom$5.cssAttribute(element, 'd');
                if (transform && transform.length) {
                    let commands = SvgBuild.toPathCommandList(d);
                    if (commands.length) {
                        const result = this.transformPoints(transform, SvgBuild.toAbsolutePointList(commands));
                        if (result.length) {
                            commands = SvgBuild.fromAbsolutePointList(commands, result);
                            if (commands.length) {
                                d = SvgBuild.fromPathCommandList(commands);
                                this.baseValue.transformed = transform;
                            }
                        }
                    }
                }
            }
            else if (element instanceof SVGLineElement) {
                const x1 = this.baseValue.x1 !== null ? this.baseValue.x1 : element.x1.baseVal.value;
                const y1 = this.baseValue.y1 !== null ? this.baseValue.y1 : element.y1.baseVal.value;
                const x2 = this.baseValue.x2 !== null ? this.baseValue.x2 : element.x2.baseVal.value;
                const y2 = this.baseValue.y2 !== null ? this.baseValue.y2 : element.y2.baseVal.value;
                if (transform && transform.length) {
                    const points = [
                        { x: x1, y: y1 },
                        { x: x2, y: y2 }
                    ];
                    const result = this.transformPoints(transform, points);
                    if (result.length) {
                        d = SvgPath.getPolyline(result);
                        this.baseValue.transformed = transform;
                    }
                }
                if (d === '') {
                    d = SvgPath.getLine(x1, y1, x2, y2);
                }
            }
            else if (element instanceof SVGCircleElement || element instanceof SVGEllipseElement) {
                const cx = this.baseValue.cx !== null ? this.baseValue.cx : element.cx.baseVal.value;
                const cy = this.baseValue.cy !== null ? this.baseValue.cy : element.cy.baseVal.value;
                let rx = 0;
                let ry = 0;
                if (element instanceof SVGCircleElement) {
                    rx = this.baseValue.r !== null ? this.baseValue.r : element.r.baseVal.value;
                    ry = rx;
                }
                else if (element instanceof SVGEllipseElement) {
                    rx = this.baseValue.rx !== null ? this.baseValue.rx : element.rx.baseVal.value;
                    ry = this.baseValue.ry !== null ? this.baseValue.ry : element.ry.baseVal.value;
                }
                if (transform && transform.length) {
                    const points = [
                        { x: cx, y: cy, rx, ry }
                    ];
                    if (residual) {
                        const index = transform.findIndex(item => item.type === SVGTransform.SVG_TRANSFORM_ROTATE);
                        if (index !== -1 && (rx !== ry || transform.length > 1 && transform.some(item => item.type === SVGTransform.SVG_TRANSFORM_SCALE && item.matrix.a !== item.matrix.d))) {
                            [this.transformResidual, transform] = SvgBuild.partitionTransforms(this.element, transform, true);
                        }
                    }
                    if (transform.length) {
                        const result = this.transformPoints(transform, points);
                        if (result.length) {
                            const pt = result[0];
                            d = SvgPath.getEllipse(pt.x, pt.y, pt.rx, pt.ry);
                            this.baseValue.transformed = transform;
                        }
                    }
                }
                if (d === '') {
                    d = SvgPath.getEllipse(cx, cy, rx, ry);
                }
            }
            else if (element instanceof SVGRectElement) {
                const x = this.baseValue.x !== null ? this.baseValue.x : element.x.baseVal.value;
                const y = this.baseValue.y !== null ? this.baseValue.y : element.y.baseVal.value;
                const width = this.baseValue.width !== null ? this.baseValue.width : element.width.baseVal.value;
                const height = this.baseValue.height !== null ? this.baseValue.height : element.height.baseVal.value;
                if (transform && transform.length) {
                    const points = [
                        { x, y },
                        { x: x + width, y },
                        { x: x + width, y: y + height },
                        { x, y: y + height }
                    ];
                    const result = this.transformPoints(transform, points);
                    if (result.length) {
                        d = SvgPath.getPolygon(result);
                        this.baseValue.transformed = transform;
                    }
                }
                if (d === '') {
                    d = SvgPath.getRect(width, height, x, y);
                }
            }
            else if (element instanceof SVGPolygonElement || element instanceof SVGPolylineElement) {
                let points = this.baseValue.points !== null ? this.baseValue.points : SvgBuild.toPointList(element.points);
                if (transform && transform.length) {
                    const result = this.transformPoints(transform, points);
                    if (result.length) {
                        points = result;
                        this.baseValue.transformed = transform;
                    }
                }
                d = element.tagName === 'polygon' ? SvgPath.getPolygon(points) : SvgPath.getPolyline(points);
            }
            if (save) {
                this.value = d;
            }
            return d;
        }
        transformPoints(transform, points, center) {
            return SvgBuild.applyTransforms(transform, points, getTransformOrigin(this.element), center);
        }
        init() {
            const element = this.element;
            if (element instanceof SVGPathElement) {
                this.baseValue.d = $dom$5.cssAttribute(element, 'd');
            }
            else if (element instanceof SVGLineElement) {
                this.baseValue.x1 = element.x1.baseVal.value;
                this.baseValue.y1 = element.y1.baseVal.value;
                this.baseValue.x2 = element.x2.baseVal.value;
                this.baseValue.y2 = element.y2.baseVal.value;
            }
            else if (element instanceof SVGRectElement) {
                this.baseValue.x = element.x.baseVal.value;
                this.baseValue.y = element.y.baseVal.value;
                this.baseValue.width = element.width.baseVal.value;
                this.baseValue.height = element.height.baseVal.value;
            }
            else if (element instanceof SVGCircleElement) {
                this.baseValue.cx = element.cx.baseVal.value;
                this.baseValue.cy = element.cy.baseVal.value;
                this.baseValue.r = element.r.baseVal.value;
            }
            else if (element instanceof SVGEllipseElement) {
                this.baseValue.cx = element.cx.baseVal.value;
                this.baseValue.cy = element.cy.baseVal.value;
                this.baseValue.rx = element.rx.baseVal.value;
                this.baseValue.ry = element.ry.baseVal.value;
            }
            else if (element instanceof SVGPolygonElement || element instanceof SVGPolylineElement) {
                this.baseValue.points = SvgBuild.toPointList(element.points);
            }
            this.setPaint();
        }
    }

    const $util$5 = squared.lib.util;
    function getTime(begin, duration, keyTimes, iteration, index) {
        return begin + (keyTimes[index] + iteration) * duration;
    }
    function insertSplitKeyTimeValue(map, item, baseVal, begin, iteration, splitTime, adjustment = 0) {
        const fraction = (splitTime - (begin + item.duration * iteration)) / item.duration;
        const keyTimes = item.keyTimes;
        let previousIndex = -1;
        let nextIndex = -1;
        for (let l = 0; l < keyTimes.length; l++) {
            if (previousIndex !== -1 && fraction <= keyTimes[l]) {
                nextIndex = l;
                break;
            }
            if (fraction >= keyTimes[l]) {
                previousIndex = l;
            }
        }
        let time = splitTime + adjustment;
        while (map.has(time)) {
            time++;
        }
        let value;
        if (previousIndex !== -1 && nextIndex !== -1) {
            value = getSplitValue(fraction, keyTimes[previousIndex], keyTimes[nextIndex], getItemValue(item, previousIndex, baseVal, iteration), getItemValue(item, nextIndex, baseVal, iteration));
        }
        else {
            value = getItemValue(item, keyTimes.length - 1, baseVal, iteration);
        }
        map.set(time, value);
        return [time, value];
    }
    function getSplitValue(fraction, previousFraction, nextFraction, previousValue, nextValue) {
        if (typeof previousValue === 'number' && typeof nextValue === 'number') {
            const percentage = (fraction - previousFraction) / (nextFraction - previousFraction);
            return previousValue + percentage * (nextValue - previousValue);
        }
        else if (Array.isArray(previousValue) && Array.isArray(nextValue)) {
            const previousPoints = previousValue;
            const nextPoints = nextValue;
            const result = [];
            for (let i = 0; i < Math.min(previousPoints.length, nextPoints.length); i++) {
                result.push({
                    x: getSplitValue(fraction, previousFraction, nextFraction, previousPoints[i].x, nextPoints[i].x),
                    y: getSplitValue(fraction, previousFraction, nextFraction, previousPoints[i].y, nextPoints[i].y)
                });
            }
            return result;
        }
        else {
            return previousValue;
        }
    }
    function insertSplitTimeValue(map, insertMap, splitTime) {
        let previous;
        let next;
        for (const [time, value] of map.entries()) {
            if (previous && splitTime <= time) {
                next = { time, value };
                break;
            }
            if (splitTime >= time) {
                previous = { time, value };
            }
        }
        if (previous && next) {
            const value = getSplitValue(splitTime, previous.time, next.time, previous.value, next.value);
            insertMap.set(splitTime, value);
        }
        else if (previous) {
            insertMap.set(splitTime, previous.value);
        }
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
    function getPathData(map, path, freezeMap) {
        const result = [];
        const tagName = path.element.tagName;
        let methodName;
        let attrs;
        switch (tagName) {
            case 'line':
                methodName = 'getLine';
                attrs = ['x1', 'y1', 'x2', 'y2'];
                break;
            case 'circle':
                methodName = 'getCircle';
                attrs = ['cx', 'cy', 'r'];
                break;
            case 'ellipse':
                methodName = 'getEllipse';
                attrs = ['cx', 'cy', 'rx', 'ry'];
                break;
            case 'rect':
                methodName = 'getRect';
                attrs = ['width', 'height', 'x', 'y'];
                break;
            case 'polygon':
                methodName = 'getPolygon';
                attrs = ['points'];
                break;
            case 'polyline':
                methodName = 'getPolyline';
                attrs = ['points'];
                break;
            default:
                return undefined;
        }
        for (const [time, data] of map.entries()) {
            const values = [];
            attrs.forEach(attr => {
                if (data.has(attr)) {
                    values.push(data.get(attr));
                }
                else if (freezeMap && freezeMap[attr]) {
                    values.push(freezeMap[attr].value);
                }
                else if (path.baseValue[attr] !== null) {
                    values.push(path.baseValue[attr]);
                }
            });
            if (values.length === attrs.length) {
                let value;
                const transform = path.baseValue.transformed;
                if (transform && transform.length) {
                    switch (tagName) {
                        case 'line':
                            value = SvgPath.getPolyline(SvgBuild.applyTransforms(transform, getLinePoints(values), getTransformOrigin(path.element)));
                            break;
                        case 'circle':
                        case 'ellipse':
                            const points = SvgBuild.applyTransforms(transform, getEllipsePoints(values), getTransformOrigin(path.element));
                            if (points.length) {
                                const pt = points[0];
                                value = SvgPath.getEllipse(pt.x, pt.y, pt.rx, pt.ry);
                            }
                            break;
                        case 'rect':
                            value = SvgPath.getPolygon(SvgBuild.applyTransforms(transform, getRectPoints(values), getTransformOrigin(path.element)));
                            break;
                        case 'polygon':
                            value = SvgPath.getPolygon(SvgBuild.applyTransforms(transform, values[0], getTransformOrigin(path.element)));
                            break;
                        case 'polyline':
                            value = SvgPath.getPolyline(SvgBuild.applyTransforms(transform, values[0], getTransformOrigin(path.element)));
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
    function getEllipsePoints(values) {
        return [{ x: values[0], y: values[1], rx: values[2], ry: values[values.length - 1] }];
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
    function getItemValue(item, index, baseVal, iteration = 0) {
        if (typeof baseVal === 'number') {
            return getNumberValue(item, index, baseVal, iteration);
        }
        else {
            return getPointsValue(item, index);
        }
    }
    function getPointsValue(item, index) {
        return SvgBuild.fromPointsValue(item.values[index]);
    }
    function getNumberValue(item, index, baseVal = 0, iteration = 0) {
        let result = parseFloat(item.values[index]);
        if (item.additiveSum) {
            result += baseVal;
            if (!item.accumulateSum) {
                iteration = 0;
            }
            for (let i = 0; i < iteration; i++) {
                for (let j = 0; j < item.values.length; j++) {
                    result += parseFloat(item.values[j]);
                }
            }
        }
        return result;
    }
    class SvgShape extends SvgView$MX(SvgElement) {
        constructor(element) {
            super(element);
            this.element = element;
            this.setType();
            if (this.type !== 0) {
                this.path = new SvgPath(element);
            }
        }
        static synchronizeAnimate(element, animate, useKeyTime = false, path) {
            const animations = [];
            const tagName = element.tagName;
            let valuePoints = false;
            for (const item of animate) {
                if (item instanceof SvgAnimate && item.keyTimes.length > 1 && item.duration > 0 && item.begin.length) {
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
                        case 'points':
                            if (tagName === 'polyline' || tagName === 'polygon') {
                                animations.push(item);
                                valuePoints = true;
                            }
                            break;
                        case 'x':
                        case 'y':
                            if (element instanceof SVGSVGElement || element instanceof SVGUseElement) {
                                animations.push(item);
                                path = undefined;
                                break;
                            }
                        case 'width':
                        case 'height':
                            if (tagName === 'rect') {
                                animations.push(item);
                            }
                            break;
                    }
                }
            }
            if (animations.length > 1 || animations.some(item => item.begin.length > 1 || item.keyTimes.join('-') !== '0-1' || item.end !== undefined || item.additiveSum)) {
                const groupName = {};
                let repeatingDurationTotal = 0;
                for (const item of animations) {
                    const attr = item.attributeName;
                    if (groupName[attr] === undefined) {
                        groupName[attr] = new Map();
                    }
                    const groupBegin = groupName[attr];
                    for (const begin of item.begin) {
                        const group = groupBegin.get(begin) || { duration: 0, items: [] };
                        group.items.push(item);
                        groupBegin.set(begin, group);
                    }
                }
                for (const attr in groupName) {
                    const groupBegin = groupName[attr];
                    let freezeTime = Number.MAX_VALUE;
                    for (const [begin, group] of groupBegin.entries()) {
                        let i = group.items.length - 1;
                        const ignore = [];
                        do {
                            const item = group.items[i];
                            const groupEnd = item.repeatCount === -1 || item.fillFreeze;
                            const repeatDuration = item.duration * item.repeatCount;
                            for (let j = 0; j < i; j++) {
                                const subitem = group.items[j];
                                if (groupEnd || subitem.repeatCount !== -1 && subitem.duration * subitem.repeatCount <= repeatDuration) {
                                    ignore.push(subitem);
                                }
                            }
                            if (item.fillFreeze && item.repeatCount !== -1) {
                                freezeTime = Math.min(begin + repeatDuration, freezeTime);
                            }
                            if (groupEnd) {
                                break;
                            }
                        } while (--i >= 0);
                        group.items = group.items.filter(item => !ignore.includes(item));
                        groupBegin.set(begin, group);
                    }
                    const groupSorted = new Map();
                    for (const time of sortNumber(Array.from(groupBegin.keys()))) {
                        const group = groupBegin.get(time);
                        if (group) {
                            const duration = $util$5.maxArray(group.items.map(item => item.duration * (item.repeatCount === -1 ? 1 : item.repeatCount)));
                            repeatingDurationTotal = Math.max(repeatingDurationTotal, time + duration);
                            group.duration = duration;
                            group.items.reverse();
                            groupSorted.set(time, group);
                        }
                    }
                    groupName[attr] = groupSorted;
                }
                const repeatingMap = {};
                const indefiniteMap = {};
                const indefiniteBeginMap = {};
                const repeatingAnimations = new Set();
                const indefiniteAnimations = new Set();
                const freezeMap = {};
                let repeatingResult;
                let indefiniteResult;
                let indefiniteBegin = false;
                let indefiniteDurationTotal = 0;
                for (const attr in groupName) {
                    repeatingMap[attr] = new Map();
                    const incomplete = [];
                    const groupBegin = Array.from(groupName[attr].keys());
                    const groupData = Array.from(groupName[attr].values());
                    let maxTime = -1;
                    let baseVal = path && path.baseValue[attr] || (valuePoints ? [{ x: 0, y: 0 }] : 0);
                    animationEnd: {
                        for (let i = 0; i < groupBegin.length; i++) {
                            const begin = groupBegin[i];
                            const data = groupData[i];
                            let minRestartTime = 0;
                            for (let j = i + 1; j < groupBegin.length; j++) {
                                minRestartTime = Math.max(minRestartTime, groupBegin[j] + groupData[j].duration);
                            }
                            for (let j = 0; j < data.items.length; j++) {
                                const item = data.items[j];
                                const indefinite = item.repeatCount === -1;
                                const duration = item.duration;
                                const repeatCount = item.repeatCount;
                                let durationTotal = duration;
                                if (!indefinite) {
                                    durationTotal *= repeatCount;
                                    if (begin + Math.min(item.end || Number.MAX_VALUE, durationTotal) <= maxTime) {
                                        continue;
                                    }
                                }
                                let repeatTotal;
                                let repeatFraction;
                                if (indefinite) {
                                    repeatTotal = Math.ceil((repeatingDurationTotal - begin) / duration);
                                    repeatFraction = 0;
                                }
                                else {
                                    repeatTotal = Math.ceil(repeatCount);
                                    repeatFraction = repeatCount - Math.floor(repeatCount);
                                }
                                const maxThreadTime = Math.min(groupBegin[i + 1] || Number.MAX_VALUE, item.end || Number.MAX_VALUE);
                                let complete = true;
                                let parallel = maxTime !== -1;
                                let lastVal;
                                threadTimeExceeded: {
                                    for (let k = Math.floor(Math.max(0, maxTime - begin) / duration); k < repeatTotal; k++) {
                                        for (let l = 0; l < item.keyTimes.length; l++) {
                                            let time;
                                            let value = getItemValue(item, l, baseVal, k);
                                            if (k === repeatTotal - 1 && repeatFraction > 0) {
                                                if (repeatFraction > item.keyTimes[l]) {
                                                    for (let m = l + 1; m < item.keyTimes.length; m++) {
                                                        if (repeatFraction < item.keyTimes[m]) {
                                                            time = begin + durationTotal;
                                                            value = getSplitValue(repeatFraction, item.keyTimes[l], item.keyTimes[m], value, getItemValue(item, m, baseVal, k));
                                                            repeatFraction = -1;
                                                            break;
                                                        }
                                                    }
                                                }
                                                else if (repeatFraction === item.keyTimes[l]) {
                                                    repeatFraction = -1;
                                                }
                                            }
                                            if (time === undefined) {
                                                time = getTime(begin, duration, item.keyTimes, k, l);
                                                if (time === maxThreadTime) {
                                                    complete = k === repeatTotal - 1 && l === item.keyTimes.length - 1;
                                                }
                                                else {
                                                    const adjustKeyTimeValue = (maxThread, splitTime) => {
                                                        const result = insertSplitKeyTimeValue(repeatingMap[attr], item, baseVal, begin, k, splitTime, maxThread && splitTime === groupBegin[i + 1] && !repeatingMap[attr].has(splitTime - 1) ? -1 : 0);
                                                        maxTime = result[0];
                                                        lastVal = result[1];
                                                    };
                                                    if (time > maxThreadTime) {
                                                        adjustKeyTimeValue(true, maxThreadTime);
                                                        complete = false;
                                                        break threadTimeExceeded;
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
                                                                    adjustKeyTimeValue(false, maxTime);
                                                                }
                                                            }
                                                            parallel = false;
                                                        }
                                                        else if (k > 0 && l === 0) {
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
                                                maxTime = time;
                                                lastVal = value;
                                                repeatingMap[attr].set(time, value);
                                            }
                                            if (!complete || repeatFraction === -1) {
                                                break threadTimeExceeded;
                                            }
                                        }
                                    }
                                }
                                if (lastVal !== undefined) {
                                    if (!indefinite) {
                                        repeatingAnimations.add(item);
                                    }
                                    baseVal = lastVal;
                                    const value = repeatingMap[attr].get(maxTime);
                                    if (value !== undefined) {
                                        if (complete && item.fillFreeze) {
                                            freezeMap[attr] = { time: maxTime, value };
                                            break animationEnd;
                                        }
                                    }
                                }
                                if (indefinite) {
                                    incomplete.forEach(pending => indefiniteAnimations.delete(pending.value));
                                    incomplete.length = 0;
                                    indefiniteAnimations.add(item);
                                }
                                if (indefinite || !complete && groupBegin[i] + durationTotal > minRestartTime) {
                                    incomplete.push({
                                        time: begin,
                                        value: item
                                    });
                                }
                            }
                        }
                        if (incomplete.length) {
                            incomplete.reverse();
                            for (let i = 0; i < incomplete.length; i++) {
                                const begin = incomplete[i].time;
                                const item = incomplete[i].value;
                                const duration = item.duration;
                                const durationTotal = maxTime - begin;
                                const indefinite = item.repeatCount === -1;
                                let maxThreadTime = Number.MAX_VALUE;
                                const insertKeyTimes = () => {
                                    let j = Math.floor(durationTotal / duration);
                                    let joined = false;
                                    do {
                                        for (let k = 0; k < item.keyTimes.length; k++) {
                                            const time = getTime(begin, duration, item.keyTimes, j, k);
                                            const timeExceeded = time >= maxThreadTime;
                                            if (time >= maxTime || timeExceeded) {
                                                let result = insertSplitKeyTimeValue(repeatingMap[attr], item, baseVal, begin, j, maxTime);
                                                maxTime = result[0];
                                                baseVal = result[1];
                                                joined = true;
                                                if (timeExceeded) {
                                                    if (maxThreadTime > maxTime) {
                                                        result = insertSplitKeyTimeValue(repeatingMap[attr], item, baseVal, begin, j, maxThreadTime);
                                                        maxTime = result[0];
                                                        baseVal = result[1];
                                                    }
                                                    break;
                                                }
                                            }
                                            else if (time > maxTime) {
                                                maxTime = time;
                                                baseVal = getItemValue(item, k, baseVal, j);
                                                repeatingMap[attr].set(time, baseVal);
                                            }
                                        }
                                        j++;
                                    } while (!joined);
                                };
                                if (indefinite) {
                                    if (durationTotal > 0 && durationTotal % duration !== 0) {
                                        insertKeyTimes();
                                    }
                                    indefiniteMap[attr] = new Map();
                                    indefiniteBeginMap[attr] = durationTotal <= 0 ? begin : 0;
                                    for (let j = 0; j < item.keyTimes.length; j++) {
                                        indefiniteMap[attr].set(item.keyTimes[j] * item.duration, getItemValue(item, j, 0, 0));
                                    }
                                    if (begin > 0) {
                                        indefiniteBegin = true;
                                    }
                                    break animationEnd;
                                }
                                else {
                                    maxThreadTime = begin + item.duration * item.repeatCount;
                                    if (maxThreadTime > maxTime) {
                                        insertKeyTimes();
                                        if (item.fillFreeze) {
                                            freezeMap[attr] = { time: maxTime, value: baseVal };
                                            break animationEnd;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                {
                    const keyTimesRepeating = [];
                    for (const attr in repeatingMap) {
                        keyTimesRepeating.push(...repeatingMap[attr].keys());
                    }
                    const repeatingEndTime = $util$5.maxArray(keyTimesRepeating);
                    for (const attr in repeatingMap) {
                        const insertMap = repeatingMap[attr];
                        const begin = indefiniteBeginMap[attr] || 0;
                        let maxTime = $util$5.maxArray(Array.from(insertMap.keys()));
                        if (indefiniteMap[attr] && begin < repeatingEndTime && maxTime < repeatingEndTime) {
                            do {
                                let insertTime = -1;
                                for (const [time, data] of indefiniteMap[attr].entries()) {
                                    insertTime = maxTime + begin + time;
                                    insertTime += insertMap.has(insertTime) ? 1 : 0;
                                    insertMap.set(insertTime, data);
                                    keyTimesRepeating.push(insertTime);
                                }
                                maxTime = insertTime;
                            } while (maxTime < repeatingEndTime);
                            indefiniteBeginMap[attr] = 0;
                        }
                        if (indefiniteMap[attr] === undefined && freezeMap[attr] === undefined) {
                            let value;
                            let fillReplace;
                            if (path && path.baseValue[attr] !== null) {
                                value = path.baseValue[attr];
                                fillReplace = insertMap.get(maxTime) !== value;
                            }
                            else {
                                const optional = $util$5.optionalAsObject(element, `${attr}.baseVal.value`);
                                if (typeof optional === 'number') {
                                    value = optional;
                                    fillReplace = insertMap.get(maxTime) !== value;
                                }
                                else if (Array.isArray(optional)) {
                                    value = optional;
                                    fillReplace = JSON.stringify(insertMap.get(maxTime)) !== JSON.stringify(value);
                                }
                                else {
                                    fillReplace = false;
                                }
                            }
                            if (fillReplace) {
                                maxTime++;
                                insertMap.set(maxTime, value);
                                keyTimesRepeating.push(maxTime);
                            }
                        }
                    }
                    const keyTimes = sortNumber(Array.from(new Set(keyTimesRepeating)));
                    const result = {};
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
                        result[attr] = insertMap;
                    }
                    repeatingDurationTotal = keyTimes[keyTimes.length - 1];
                    let keyTimeResult;
                    if (useKeyTime) {
                        keyTimeResult = convertKeyTimeFraction(getKeyTimeMap(result, keyTimes, freezeMap), repeatingDurationTotal);
                    }
                    else {
                        keyTimeResult = getKeyTimeMap(result, keyTimes, freezeMap);
                    }
                    if (repeatingAnimations.size || indefiniteAnimations.size === 0 || indefiniteBegin) {
                        repeatingResult = keyTimeResult;
                    }
                    else {
                        indefiniteResult = keyTimeResult;
                        indefiniteDurationTotal = repeatingDurationTotal;
                    }
                }
                if (indefiniteResult === undefined && indefiniteAnimations.size) {
                    const indefiniteArray = Array.from(indefiniteAnimations);
                    indefiniteDurationTotal = getLeastCommonMultiple(indefiniteArray.map(item => item.duration));
                    const result = {};
                    let keyTimes = [];
                    for (const attr in indefiniteMap) {
                        result[attr] = new Map();
                        const object = indefiniteArray.find(item => item.attributeName === attr);
                        if (object) {
                            let maxTime = 0;
                            let i = 0;
                            do {
                                for (let [time, value] of indefiniteMap[attr].entries()) {
                                    time += object.duration * i;
                                    result[attr].set(time, value);
                                    keyTimes.push(time);
                                    maxTime = time;
                                }
                                i++;
                            } while (maxTime < indefiniteDurationTotal);
                        }
                    }
                    keyTimes = sortNumber(Array.from(new Set(keyTimes)));
                    for (const attr in result) {
                        const baseMap = result[attr];
                        for (let i = 1; i < keyTimes.length; i++) {
                            const keyTime = keyTimes[i];
                            if (!baseMap.has(keyTime)) {
                                insertSplitTimeValue(baseMap, baseMap, keyTime);
                            }
                        }
                    }
                    if (useKeyTime) {
                        indefiniteResult = convertKeyTimeFraction(getKeyTimeMap(result, keyTimes), keyTimes[keyTimes.length - 1]);
                    }
                    else {
                        indefiniteResult = getKeyTimeMap(result, keyTimes);
                    }
                }
                if (repeatingResult || indefiniteResult) {
                    $util$5.retainArray(animate, item => !animations.includes(item));
                    const sequentialName = Array.from(new Set(animations.map(item => item.attributeName))).sort().join('-');
                    let x = 0;
                    let y = 0;
                    if (path === undefined) {
                        x = $util$5.optionalAsNumber(element, `x.baseVal.value`);
                        y = $util$5.optionalAsNumber(element, `y.baseVal.value`);
                    }
                    [repeatingResult, indefiniteResult].forEach(result => {
                        if (result) {
                            const repeating = result === repeatingResult;
                            const freezeIndefinite = repeating ? undefined : freezeMap;
                            const animateElement = (repeating && repeatingAnimations.size > 0 || indefiniteAnimations.size === 0 ? repeatingAnimations : indefiniteAnimations).values().next().value.element;
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
                                    const pathData = getPathData(result, path, freezeIndefinite);
                                    if (pathData) {
                                        object = new SvgAnimate(animateElement);
                                        object.attributeName = 'd';
                                        object.keyTimes = pathData.map(item => item.time);
                                        object.values = pathData.map(item => item.value.toString());
                                    }
                                    else {
                                        return;
                                    }
                                }
                                else {
                                    object = new SvgAnimateTransform(animateElement);
                                    object.attributeName = 'transform';
                                    object.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                                    object.keyTimes.length = 0;
                                    object.values.length = 0;
                                    for (const [keyTime, data] of result.entries()) {
                                        setXY(data);
                                        object.keyTimes.push(keyTime);
                                        object.values.push(`${x} ${y}`);
                                    }
                                }
                                if (repeating) {
                                    object.begin = [0];
                                    object.duration = repeatingDurationTotal;
                                }
                                else {
                                    object.duration = indefiniteDurationTotal;
                                }
                                insertAnimate(object);
                            }
                            else {
                                const entries = Array.from(result.entries());
                                for (let j = 0, k = 0; j < entries.length - 1; j++) {
                                    const [keyTimeFrom, dataFrom] = entries[j];
                                    const [keyTimeTo, dataTo] = entries[j + 1];
                                    let object;
                                    let name;
                                    if (path) {
                                        const map = new Map();
                                        map.set(keyTimeFrom, dataFrom);
                                        map.set(keyTimeTo, dataTo);
                                        const pathData = getPathData(map, path, freezeIndefinite);
                                        if (pathData) {
                                            object = new SvgAnimate(animateElement);
                                            object.attributeName = 'd';
                                            object.values = pathData.map(item => item.value.toString());
                                        }
                                        else {
                                            continue;
                                        }
                                        name = sequentialName;
                                    }
                                    else {
                                        object = new SvgAnimateTransform(animateElement);
                                        object.attributeName = 'transform';
                                        object.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                                        object.values = [dataFrom, dataTo].map(data => {
                                            setXY(data);
                                            return `${x} ${y}`;
                                        });
                                        name = sequentialName + j;
                                    }
                                    if (repeating) {
                                        object.begin = [j === 0 ? keyTimeFrom : 0];
                                    }
                                    object.duration = keyTimeTo - keyTimeFrom;
                                    object.keyTimes = [0, 1];
                                    object.sequential = { name, value: k++ };
                                    insertAnimate(object);
                                }
                            }
                        }
                    });
                }
            }
            return animate;
        }
        setType(element) {
            this.type = SHAPES[(element || this.element).tagName] || 0;
        }
        build(residual = false, exclusions) {
            if (this.path) {
                this.path.draw(SvgBuild.filterTransforms(this.transform, exclusions ? exclusions[this.path.element.tagName] : undefined), residual);
            }
        }
        synchronize(useKeyTime = false) {
            if (this.path && this.animate.length) {
                SvgShape.synchronizeAnimate(this.element, this.animate, useKeyTime, this.path);
            }
        }
        set path(value) {
            this._path = value;
            if (this._path) {
                this._path.name = this.name;
            }
            for (const item of this.animate) {
                if (item instanceof SvgAnimate) {
                    item.parent = value;
                }
            }
        }
        get path() {
            return this._path;
        }
    }

    class Svg extends SvgViewRect$MX(SvgView$MX(SvgContainer)) {
        constructor(element, documentRoot = true) {
            super(element);
            this.element = element;
            this.documentRoot = documentRoot;
            this.patterns = {
                clipPath: new Map(),
                gradient: new Map()
            };
            this.init();
            this.setRect();
        }
        synchronize(useKeyTime = false) {
            if (!this.documentRoot && this.animate.length) {
                SvgShape.synchronizeAnimate(this.element, this.animate, useKeyTime);
            }
            super.synchronize(useKeyTime);
        }
        init() {
            [this.element, ...Array.from(this.element.querySelectorAll(':scope > defs'))].forEach(item => {
                item.querySelectorAll(':scope > set, :scope > animate, :scope > animateTransform, :scope > animateMotion').forEach((animation) => {
                    const target = getHrefTargetElement(animation, this.element);
                    if (target) {
                        if (animation.parentElement) {
                            animation.parentElement.removeChild(animation);
                        }
                        target.appendChild(animation);
                    }
                });
                item.querySelectorAll(':scope > clipPath, :scope > linearGradient, :scope > radialGradient').forEach((pattern) => {
                    if (pattern.id) {
                        const id = `#${pattern.id}`;
                        if (pattern instanceof SVGClipPathElement) {
                            this.patterns.clipPath.set(id, pattern);
                        }
                        else if (pattern instanceof SVGLinearGradientElement) {
                            this.patterns.gradient.set(id, {
                                type: 'linear',
                                x1: pattern.x1.baseVal.value,
                                x2: pattern.x2.baseVal.value,
                                y1: pattern.y1.baseVal.value,
                                y2: pattern.y2.baseVal.value,
                                x1AsString: pattern.x1.baseVal.valueAsString,
                                x2AsString: pattern.x2.baseVal.valueAsString,
                                y1AsString: pattern.y1.baseVal.valueAsString,
                                y2AsString: pattern.y2.baseVal.valueAsString,
                                colorStop: SvgBuild.toColorStopList(pattern)
                            });
                        }
                        else if (pattern instanceof SVGRadialGradientElement) {
                            this.patterns.gradient.set(id, {
                                type: 'radial',
                                cx: pattern.cx.baseVal.value,
                                cy: pattern.cy.baseVal.value,
                                r: pattern.r.baseVal.value,
                                cxAsString: pattern.cx.baseVal.valueAsString,
                                cyAsString: pattern.cy.baseVal.valueAsString,
                                rAsString: pattern.r.baseVal.valueAsString,
                                fx: pattern.fx.baseVal.value,
                                fy: pattern.fy.baseVal.value,
                                fxAsString: pattern.fx.baseVal.valueAsString,
                                fyAsString: pattern.fy.baseVal.valueAsString,
                                colorStop: SvgBuild.toColorStopList(pattern)
                            });
                        }
                    }
                });
            });
        }
        get viewBox() {
            return this.element.viewBox.baseVal;
        }
    }

    const $util$6 = squared.lib.util;
    class SvgAnimateMotion extends SvgAnimate {
        constructor(element) {
            super(element);
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
                    this.rotate = $util$6.convertInt(rotate);
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
                    const target = getHrefTargetElement(item);
                    if (target) {
                        this.mpath = target;
                        break;
                    }
                }
            }
        }
    }

    class SvgG extends SvgPaint$MX(SvgView$MX(SvgContainer)) {
        constructor(element) {
            super(element);
            this.element = element;
            this.setPaint();
        }
    }

    const $util$7 = squared.lib.util;
    class SvgImage extends SvgViewRect$MX(SvgView$MX(SvgElement)) {
        constructor(element, imageElement) {
            super(element);
            this.element = element;
            this.imageElement = imageElement;
            this.setRect();
        }
        extract(exclude) {
            const transform = SvgBuild.filterTransforms(this.transform, exclude);
            if (transform.length) {
                let x = this.x;
                let y = this.y;
                let width = this.width;
                let height = this.height;
                transform.reverse();
                for (let i = 0; i < transform.length; i++) {
                    const item = transform[i];
                    const m = item.matrix;
                    const localX = x;
                    x = applyMatrixX(m, localX, y);
                    y = applyMatrixY(m, localX, y);
                    switch (item.type) {
                        case SVGTransform.SVG_TRANSFORM_SCALE:
                            width *= m.a;
                            height *= m.d;
                            break;
                        case SVGTransform.SVG_TRANSFORM_ROTATE:
                            if (item.angle !== 0) {
                                if (m.a < 0) {
                                    x += m.a * width;
                                }
                                if (m.c < 0) {
                                    x += m.c * width;
                                }
                                if (m.b < 0) {
                                    y += m.b * height;
                                }
                                if (m.d < 0) {
                                    y += m.d * height;
                                }
                                if (this.rotateOrigin === undefined) {
                                    this.rotateOrigin = {
                                        angle: item.angle,
                                        x: 0,
                                        y: 0
                                    };
                                }
                                else {
                                    this.rotateOrigin.angle = (this.rotateOrigin.angle || 0) + item.angle;
                                }
                            }
                            break;
                    }
                }
                Object.assign(this.baseValue, {
                    x,
                    y,
                    width,
                    height,
                    transform
                });
            }
        }
        get x() {
            const value = super.x;
            if (value === 0 && this.imageElement) {
                return this.imageElement.x.baseVal.value;
            }
            return value;
        }
        get y() {
            const value = super.y;
            if (value === 0 && this.imageElement) {
                return this.imageElement.y.baseVal.value;
            }
            return value;
        }
        get width() {
            const value = super.width;
            if (value === 0 && this.imageElement) {
                return this.imageElement.width.baseVal.value;
            }
            return value;
        }
        get height() {
            const value = super.height;
            if (value === 0 && this.imageElement) {
                return this.imageElement.height.baseVal.value;
            }
            return value;
        }
        set href(value) {
            const element = this.imageElement || this.element;
            if (element instanceof SVGImageElement) {
                element.href.baseVal = value;
            }
        }
        get href() {
            const element = this.imageElement || this.element;
            if (element instanceof SVGImageElement) {
                return $util$7.resolvePath(element.href.baseVal);
            }
            return '';
        }
    }

    class SvgUse extends SvgPaint$MX(SvgViewRect$MX(SvgShape)) {
        constructor(element, shapeElement) {
            super(element);
            this.element = element;
            this.shapeElement = shapeElement;
            this.setPaint();
        }
        setShape(value) {
            this.shapeElement = value;
            this.setType(value);
            this.path = undefined;
        }
        build(residual = false, exclusions) {
            if (this.path === undefined) {
                const path = new SvgPath(this.shapeElement, this.element);
                super.path = path;
            }
            super.build(residual, exclusions);
        }
        set href(value) {
            if (value.charAt(0) === '#') {
                const id = value.substring(1);
                const target = document.getElementById(id);
                if (target && isSvgShape(target)) {
                    this.setShape(target);
                    this.element.href.baseVal = value;
                }
            }
        }
        get href() {
            return this.element.href.baseVal;
        }
    }

    class SvgUseSymbol extends SvgPaint$MX(SvgViewRect$MX(SvgView$MX(SvgContainer))) {
        constructor(element, symbolElement) {
            super(element);
            this.element = element;
            this.symbolElement = symbolElement;
            this.setRect();
            this.setPaint();
        }
        synchronize(useKeyTime = false) {
            if (this.animate.length) {
                SvgShape.synchronizeAnimate(this.element, this.animate, useKeyTime);
            }
            super.synchronize(useKeyTime);
        }
        get viewBox() {
            return this.symbolElement.viewBox.baseVal;
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
    exports.SvgBase = SvgBase;
    exports.SvgBuild = SvgBuild;
    exports.SvgContainer = SvgContainer;
    exports.SvgElement = SvgElement;
    exports.SvgG = SvgG;
    exports.SvgImage = SvgImage;
    exports.SvgPaint = SvgPaint$MX;
    exports.SvgPath = SvgPath;
    exports.SvgShape = SvgShape;
    exports.SvgUse = SvgUse;
    exports.SvgUseSymbol = SvgUseSymbol;
    exports.SvgView = SvgView$MX;
    exports.SvgViewRect = SvgViewRect$MX;
    exports.lib = lib;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
