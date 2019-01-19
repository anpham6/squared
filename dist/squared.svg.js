/* squared.svg 0.1.0
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory((global.squared = global.squared || {}, global.squared.svg = {})));
}(this, function (exports) { 'use strict';

    const $dom = squared.lib.dom;
    const $util = squared.lib.util;
    function setAttribute(element, attr, value) {
        element.style[attr] = value;
        element.setAttribute(attr, value);
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
    function convertRadian(angle) {
        return angle * Math.PI / 180;
    }
    const SHAPES = {
        path: 1,
        line: 2,
        rect: 3,
        ellipse: 4,
        circle: 5,
        polyline: 6,
        polygon: 7
    };
    const MATRIX = {
        clone(matrix) {
            return {
                a: matrix.a,
                b: matrix.b,
                c: matrix.c,
                d: matrix.d,
                e: matrix.e,
                f: matrix.f
            };
        },
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
    const REGEXP_UNIT = {
        ZERO_ONE: '(0(?:\\.\\d+)?|1(?:\\.0+)?)',
        DECIMAL: '(-?[\\d.]+)',
        LENGTH: '([\\d.]+(?:[a-z]{2,}|%)?)',
        DEGREE: '(?:(-?[\\d.]+)(deg|rad|turn))'
    };
    const REGEXP_TRANSFORM = {
        MATRIX: `(matrix(?:3d)?)\\(${REGEXP_UNIT.DECIMAL}, ${REGEXP_UNIT.DECIMAL}, ${REGEXP_UNIT.DECIMAL}, ${REGEXP_UNIT.DECIMAL}, ${REGEXP_UNIT.DECIMAL}, ${REGEXP_UNIT.DECIMAL}(?:, ${REGEXP_UNIT.DECIMAL})?(?:, ${REGEXP_UNIT.DECIMAL})?(?:, ${REGEXP_UNIT.DECIMAL})?(?:, ${REGEXP_UNIT.DECIMAL})?(?:, ${REGEXP_UNIT.DECIMAL})?(?:, ${REGEXP_UNIT.DECIMAL})?(?:, ${REGEXP_UNIT.DECIMAL})?(?:, ${REGEXP_UNIT.DECIMAL})?(?:, ${REGEXP_UNIT.DECIMAL})?(?:, ${REGEXP_UNIT.DECIMAL})?\\)`,
        ROTATE: `(rotate[XY]?)\\(${REGEXP_UNIT.DEGREE}\\)`,
        SKEW: `(skew[XY]?)\\(${REGEXP_UNIT.DEGREE}(?:, ${REGEXP_UNIT.DEGREE})?\\)`,
        SCALE: `(scale[XY]?)\\(${REGEXP_UNIT.DECIMAL}(?:, ${REGEXP_UNIT.DECIMAL})?\\)`,
        TRANSLATE: `(translate[XY]?)\\(${REGEXP_UNIT.LENGTH}(?:, ${REGEXP_UNIT.LENGTH})?\\)`
    };
    function getHostDPI() {
        return $util.optionalAsNumber(squared, 'settings.resolutionDPI') || 96;
    }
    function getFontSize(element) {
        return parseInt($dom.getStyle(element).fontSize || '16');
    }
    function createElement(qualifiedName) {
        return document.createElementNS('http://www.w3.org/2000/svg', qualifiedName);
    }
    function convertClockTime(value) {
        let s = 0;
        let ms = 0;
        if ($util.isNumber(value)) {
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
        return s * 1000 + ms;
    }
    const SVG = {
        svg: (element) => {
            return !!element && element.tagName === 'svg';
        },
        g: (element) => {
            return !!element && element.tagName === 'g';
        },
        use: (element) => {
            return !!element && element.tagName === 'use';
        },
        symbol: (element) => {
            return !!element && element.tagName === 'symbol';
        },
        shape: (element) => {
            return SHAPES[element.tagName] !== undefined;
        },
        image: (element) => {
            return element.tagName === 'image';
        },
        path: (element) => {
            return element.tagName === 'path';
        },
        line: (element) => {
            return element.tagName === 'line';
        },
        rect: (element) => {
            return element.tagName === 'rect';
        },
        circle: (element) => {
            return element.tagName === 'circle';
        },
        ellipse: (element) => {
            return element.tagName === 'ellipse';
        },
        polygon: (element) => {
            return element.tagName === 'polygon';
        },
        polyline: (element) => {
            return element.tagName === 'polyline';
        },
        clipPath: (element) => {
            return element.tagName === 'clipPath';
        },
        linearGradient: (element) => {
            return element.tagName === 'linearGradient';
        },
        radialGradient: (element) => {
            return element.tagName === 'radialGradient';
        }
    };
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
    function getTargetElement(element, parentElement) {
        const href = element.attributes.getNamedItem('href');
        if (href && href.value.charAt(0) === '#') {
            const id = href.value.substring(1);
            if (parentElement) {
                for (const target of Array.from(parentElement.querySelectorAll('*'))) {
                    if (target.id === id) {
                        if (target instanceof SVGElement) {
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
                if (target && target instanceof SVGElement) {
                    return target;
                }
            }
        }
        return null;
    }
    function createTransform(type, matrix, angle = 0, x = true, y = true) {
        return {
            type,
            matrix,
            angle,
            method: { x, y }
        };
    }
    function getTransform(element, value) {
        const transform = value === undefined ? $dom.cssInline(element, 'transform') : value;
        if (transform !== '') {
            const result = [];
            for (const name in REGEXP_TRANSFORM) {
                const pattern = new RegExp(REGEXP_TRANSFORM[name], 'g');
                let match = null;
                while ((match = pattern.exec(transform)) !== null) {
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
                        result[match.index] = createTransform(SVGTransform.SVG_TRANSFORM_ROTATE, matrix, angle, !isX, !isY);
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
                        const matrix = getTransformMatrix(element, value);
                        if (matrix) {
                            result[match.index] = createTransform(SVGTransform.SVG_TRANSFORM_MATRIX, matrix);
                        }
                    }
                }
            }
            return result.filter(item => {
                if (item) {
                    item.css = true;
                    return true;
                }
                return false;
            });
        }
        return undefined;
    }
    function getTransformMatrix(element, value) {
        const match = new RegExp(REGEXP_TRANSFORM.MATRIX).exec(value || $dom.getStyle(element, true).transform || '');
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
    function getTransformOrigin(element, value) {
        const result = {
            x: null,
            y: null
        };
        value = value || $dom.cssAttribute(element, 'transform-origin');
        if (value !== '') {
            const parent = element.parentElement;
            let width = 0;
            let height = 0;
            let baseVal;
            if (SVG.svg(parent) && parent.viewBox) {
                baseVal = parent.viewBox.baseVal;
            }
            else if (parent instanceof SVGGraphicsElement && SVG.svg(parent.viewportElement) && parent.viewportElement.viewBox) {
                baseVal = parent.viewportElement.viewBox.baseVal;
            }
            if (baseVal) {
                width = baseVal.width;
                height = baseVal.height;
            }
            let positions = value.split(' ');
            if (positions.length === 1) {
                positions.push('center');
            }
            positions = positions.slice(0, 2);
            if (positions.includes('left')) {
                result.x = 0;
            }
            else if (positions.includes('right')) {
                result.x = width;
            }
            if (positions.includes('top')) {
                result.y = 0;
            }
            else if (positions.includes('bottom')) {
                result.y = height;
            }
            ['x', 'y'].forEach(attr => {
                if (result[attr] === null) {
                    for (let i = 0; i < positions.length; i++) {
                        let position = positions[i];
                        if (position !== '') {
                            if (position === 'center') {
                                position = '50%';
                            }
                            if ($util.isUnit(position)) {
                                result[attr] = parseInt(position.endsWith('px') ? position : $util.convertPX(position, getHostDPI(), getFontSize(element)));
                            }
                            else if ($util.isPercent(position)) {
                                result[attr] = (attr === 'x' ? width : height) * (parseInt(position) / 100);
                            }
                            if (result[attr] !== null) {
                                positions[i] = '';
                                break;
                            }
                        }
                    }
                }
            });
        }
        result.x = result.x || 0;
        result.y = result.y || 0;
        return result;
    }
    function getTransformRotate(element) {
        const result = [];
        const transform = element.attributes.getNamedItem('transform');
        if (transform) {
            const pattern = /rotate\((-?[\d.]+),?\s*(-?[\d.]+),?\s*(-?[\d.]+)\)/g;
            let match = null;
            while ((match = pattern.exec(transform.value)) !== null) {
                result.push({
                    angle: parseFloat(match[1]),
                    x: parseFloat(match[2]),
                    y: parseFloat(match[3])
                });
            }
        }
        return result.length ? result : [{ angle: 0, x: 0, y: 0 }];
    }
    function getTransformInitialValue(nameType) {
        switch (nameType) {
            case 'rotate':
            case SVGTransform.SVG_TRANSFORM_ROTATE:
                return '0 0 0';
            case 'scale':
            case SVGTransform.SVG_TRANSFORM_SCALE:
                return '1 1';
            case 'skewX':
            case 'skewY':
            case SVGTransform.SVG_TRANSFORM_SKEWX:
            case SVGTransform.SVG_TRANSFORM_SKEWY:
                return '0';
            case 'translate':
            case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                return '0 0';
        }
        return '';
    }
    function sortNumber(values, descending = false) {
        return descending ? values.sort((a, b) => a > b ? -1 : 1) : values.sort((a, b) => a < b ? -1 : 1);
    }
    function getLeastCommonMultiple(values, minimum = 0, offset) {
        if (values.length > 1) {
            const increment = sortNumber(values.slice(0))[0];
            if (offset) {
                if (offset.length === values.length) {
                    for (let i = 0; i < offset.length; i++) {
                        minimum = Math.max(minimum, offset[i] + increment);
                    }
                }
                else {
                    offset = undefined;
                }
            }
            if (offset === undefined) {
                minimum = Math.max(minimum, increment);
            }
            let result = minimum;
            let valid = false;
            while (!valid) {
                for (let i = 0; i < values.length; i++) {
                    const total = result - (offset ? offset[i] : 0);
                    if (total % values[i] === 0) {
                        valid = true;
                    }
                    else {
                        valid = false;
                        result += increment;
                        break;
                    }
                }
            }
            return result;
        }
        return values[0];
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

    var util = /*#__PURE__*/Object.freeze({
        SHAPES: SHAPES,
        MATRIX: MATRIX,
        REGEXP_UNIT: REGEXP_UNIT,
        getHostDPI: getHostDPI,
        getFontSize: getFontSize,
        createElement: createElement,
        convertClockTime: convertClockTime,
        SVG: SVG,
        isVisible: isVisible,
        setVisible: setVisible,
        setOpacity: setOpacity,
        getTargetElement: getTargetElement,
        createTransform: createTransform,
        getTransform: getTransform,
        getTransformMatrix: getTransformMatrix,
        getTransformOrigin: getTransformOrigin,
        getTransformRotate: getTransformRotate,
        getTransformInitialValue: getTransformInitialValue,
        sortNumber: sortNumber,
        getLeastCommonMultiple: getLeastCommonMultiple,
        applyMatrixX: applyMatrixX,
        applyMatrixY: applyMatrixY,
        getRadiusX: getRadiusX,
        getRadiusY: getRadiusY
    });

    const $util$1 = squared.lib.util;
    const NAME_GRAPHICS = new Map();
    class SvgBuild {
        static setName(element) {
            if (element) {
                let result = '';
                let tagName;
                if ($util$1.isString(element.id)) {
                    const id = $util$1.convertWord(element.id, true);
                    if (!NAME_GRAPHICS.has(id)) {
                        result = id;
                    }
                    tagName = id;
                }
                else {
                    tagName = element.tagName;
                }
                let index = NAME_GRAPHICS.get(tagName) || 0;
                if (result !== '') {
                    NAME_GRAPHICS.set(result, index);
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
        static instance(object) {
            return !!object && SVG.svg(object.element);
        }
        static instanceOfContainer(object) {
            return SvgBuild.instance(object) || SvgBuild.instanceOfG(object) || SvgBuild.instanceOfUseSymbol(object);
        }
        static instanceOfElement(object) {
            return SvgBuild.instanceOfShape(object) || SvgBuild.instanceOfImage(object) || SvgBuild.instanceOfUse(object) && !SvgBuild.instanceOfUseSymbol(object);
        }
        static instanceOfG(object) {
            return !!object && SVG.g(object.element);
        }
        static instanceOfUseSymbol(object) {
            return SvgBuild.instanceOfUse(object) && object['symbolElement'] !== undefined;
        }
        static instanceOfShape(object) {
            return !!object && SVG.shape(object.element) || SvgBuild.instanceOfUse(object) && object['path'] !== undefined;
        }
        static instanceOfImage(object) {
            return !!object && SVG.image(object.element) || SvgBuild.instanceOfUse(object) && object['imageElement'] !== undefined;
        }
        static instanceOfUse(object) {
            return !!object && SVG.use(object.element);
        }
        static instanceOfSet(object) {
            return object.instanceType === 0;
        }
        static instanceOfAnimate(object) {
            return object.instanceType === 1;
        }
        static instanceOfAnimateTransform(object) {
            return object.instanceType === 2;
        }
        static instanceOfAnimateMotion(object) {
            return object.instanceType === 3;
        }
        static getContainerOpacity(instance) {
            let result = parseFloat(instance.opacity);
            let current = instance.parent;
            while (current) {
                const opacity = parseFloat(current['opacity'] || '1');
                if (!isNaN(opacity) && opacity < 1) {
                    result *= opacity;
                }
                current = current['parent'];
            }
            return result;
        }
        static getContainerViewBox(instance) {
            let current = instance;
            while (current) {
                switch (current.element.tagName) {
                    case 'svg':
                        return current;
                    case 'symbol':
                        return current;
                    default:
                        current = current['parent'];
                }
            }
            return undefined;
        }
        static convertTransformList(transform) {
            const result = [];
            for (let i = 0; i < transform.numberOfItems; i++) {
                const item = transform.getItem(i);
                result.push(createTransform(item.type, item.matrix, item.angle));
            }
            return result;
        }
        static filterTransforms(transform, exclude) {
            return (exclude ? transform.filter(item => !exclude.includes(item.type)) : transform).filter(item => !(item.type === SVGTransform.SVG_TRANSFORM_SCALE && item.matrix.a === 1 && item.matrix.d === 1));
        }
        static applyTransforms(transform, values, origin, center) {
            const result = SvgBuild.clonePoints(values);
            const items = transform.slice(0).reverse();
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
                    if (item.type === SVGTransform.SVG_TRANSFORM_SCALE && pt.rx !== undefined && pt.ry !== undefined) {
                        const rx = pt.rx;
                        pt.rx = applyMatrixX(m, rx + x1, pt.ry + y1);
                        pt.ry = applyMatrixY(m, rx + x2, pt.ry + y2);
                    }
                }
            }
            return result;
        }
        static getCenterPoint(values) {
            const pointsX = values.map(pt => pt.x);
            const pointsY = values.map(pt => pt.y);
            return {
                x: ($util$1.minArray(pointsX) + $util$1.maxArray(pointsX)) / 2,
                y: ($util$1.minArray(pointsY) + $util$1.maxArray(pointsY)) / 2
            };
        }
        static clonePoints(values) {
            const result = [];
            if (Array.isArray(values)) {
                for (const pt of values) {
                    const item = { x: pt.x, y: pt.y };
                    if (pt.rx !== undefined && pt.ry !== undefined) {
                        item.rx = pt.rx;
                        item.ry = pt.ry;
                    }
                    result.push(item);
                }
            }
            else {
                for (let j = 0; j < values.numberOfItems; j++) {
                    const pt = values.getItem(j);
                    result.push({
                        x: pt.x,
                        y: pt.y
                    });
                }
            }
            return result;
        }
        static fromNumberList(values) {
            const result = [];
            for (let i = 0; i < values.length; i += 2) {
                result.push({
                    x: values[i],
                    y: values[i + 1]
                });
            }
            return result.length % 2 === 0 ? result : [];
        }
        static toNumberList(value) {
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
        static getPathPoints(values) {
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
        static rebindPathPoints(values, points) {
            const absolute = points.slice(0);
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
        static toPathCommandList(value) {
            const result = [];
            const pattern = /([A-Za-z])([^A-Za-z]+)?/g;
            let match;
            value = value.trim();
            while ((match = pattern.exec(value)) !== null) {
                if (result.length === 0 && match[1].toUpperCase() !== 'M') {
                    break;
                }
                match[2] = (match[2] || '').trim();
                const coordinates = SvgBuild.toNumberList(match[2]);
                const previous = result[result.length - 1];
                const previousCommand = previous ? previous.command.toUpperCase() : '';
                let previousPoint = previous ? previous.points[previous.points.length - 1] : undefined;
                let radiusX;
                let radiusY;
                let xAxisRotation;
                let largeArcFlag;
                let sweepFlag;
                switch (match[1].toUpperCase()) {
                    case 'M':
                        if (result.length === 0) {
                            match[1] = 'M';
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
                            coordinates[1] = match[1] === 'h' ? 0 : previousPoint.y;
                            coordinates.length = 2;
                            break;
                        }
                        else {
                            continue;
                        }
                    case 'V':
                        if (previousPoint && coordinates.length) {
                            const y = coordinates[0];
                            coordinates[0] = match[1] === 'v' ? 0 : previousPoint.x;
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
                            match[1] = 'Z';
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
                    const relative = /[a-z]/.test(match[1]);
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
                        command: match[1],
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
    }

    const $dom$1 = squared.lib.dom;
    var SvgBaseVal$MX = (Base) => {
        return class extends Base {
            constructor() {
                super(...arguments);
                this._baseVal = {};
            }
            setBaseValue(attr, value) {
                if (value !== undefined) {
                    if (this.validateType(attr, value)) {
                        this._baseVal[attr] = value;
                        return true;
                    }
                }
                else {
                    switch (attr) {
                        case 'd':
                            this._baseVal[attr] = $dom$1.cssAttribute(this.element, 'd');
                            return true;
                        case 'points':
                            const points = this.element[attr];
                            if (Array.isArray(points)) {
                                this._baseVal[attr] = SvgBuild.clonePoints(points);
                                return true;
                            }
                            break;
                        default:
                            const object = this.element[attr];
                            if (object && object.baseVal) {
                                this._baseVal[attr] = object.baseVal.value;
                                return true;
                            }
                            break;
                    }
                }
                return false;
            }
            getBaseValue(attr, defaultValue) {
                return this._baseVal[attr] === undefined && !this.setBaseValue(attr) ? defaultValue : this._baseVal[attr];
            }
            validateType(attr, value) {
                switch (attr) {
                    case 'd':
                        return typeof value === 'string';
                    case 'cx':
                    case 'cy':
                    case 'r':
                    case 'rx':
                    case 'ry':
                    case 'x1':
                    case 'x2':
                    case 'y1':
                    case 'y2':
                    case 'x':
                    case 'y':
                    case 'width':
                    case 'height':
                        return typeof value === 'number';
                    case 'points':
                        return Array.isArray(value);
                }
                return false;
            }
        };
    };

    const $util$2 = squared.lib.util;
    class SvgAnimation {
        constructor(element) {
            this.attributeName = '';
            this.to = '';
            this.begin = [0];
            this.duration = -1;
            this.paused = false;
            if (element) {
                this.element = element;
                this.setAttribute('attributeName');
                this.setAttribute('to');
                const begin = this.getAttribute('begin');
                if (begin === 'indefinite') {
                    this.begin.length = 0;
                }
                else if (/^[a-zA-Z]+$/.test(begin)) {
                    this.paused = true;
                }
                else if (begin !== '') {
                    this.begin = sortNumber(begin.split(';').map(value => convertClockTime(value)));
                }
                const dur = this.getAttribute('dur');
                if (dur && dur !== 'indefinite') {
                    this.duration = convertClockTime(dur);
                }
            }
        }
        setAttribute(attr, equality) {
            const value = this.getAttribute(attr);
            if (value) {
                if (equality !== undefined) {
                    this[attr + $util$2.capitalize(equality)] = value === equality;
                }
                else {
                    this[attr] = value;
                }
            }
        }
        getAttribute(attr) {
            const item = this.element && this.element.attributes.getNamedItem(attr);
            return item ? item.value.trim() : '';
        }
        get instanceType() {
            return 0;
        }
    }

    const KEYSPLINE_NAME = {
        'ease': '0.25 0.1 0.25 1',
        'ease-in': '0.42 0 1 1',
        'ease-in-out': '0.42 0 0.58 1',
        'ease-out': '0 0 0.58 1',
        'linear': '0 0 1 1',
        'step': '0 1 0 1'
    };

    var constant = /*#__PURE__*/Object.freeze({
        KEYSPLINE_NAME: KEYSPLINE_NAME
    });

    const $color = squared.lib.color;
    const $dom$2 = squared.lib.dom;
    const $util$3 = squared.lib.util;
    function getSplitValue(current, next, percent) {
        return current + (next - current) * percent;
    }
    function invertControlPoint(value) {
        return parseFloat((1 - value).toFixed(5));
    }
    class SvgAnimate extends SvgAnimation {
        constructor(element) {
            super(element);
            this.element = element;
            this.from = '';
            this.by = '';
            this.values = [];
            this.keyTimes = [];
            this.repeatDuration = -1;
            this.additiveSum = false;
            this.accumulateSum = false;
            this.fillMode = 0;
            this.alternate = false;
            this._repeatCount = 1;
            this._reverse = false;
            if (element) {
                const values = this.getAttribute('values');
                const keyTimes = this.getAttribute('keyTimes');
                if (values !== '' && keyTimes !== '') {
                    this.values.push(...$util$3.flatMap(values.split(';'), value => value.trim()));
                    this.keyTimes.push(...SvgAnimate.toFractionList(keyTimes));
                    if (this.values.length > 1 && this.keyTimes.length === this.values.length) {
                        if (this.keyTimes[0] === 0) {
                            this.from = this.values[0];
                        }
                        this.to = this.values[this.values.length - 1];
                    }
                    else {
                        this.values.length = 0;
                        this.keyTimes.length = 0;
                    }
                }
                const from = this.getAttribute('from');
                if (this.values.length === 0 && this.to !== '') {
                    if (from !== '') {
                        this.from = from;
                    }
                    else if (this.attributeName === 'transform') {
                        this.from = getTransformInitialValue(this.getAttribute('type'));
                    }
                    else if (element.parentElement) {
                        const value = $util$3.optionalAsString(element.parentElement, `${this.attributeName}.baseVal.value`);
                        if (value !== '') {
                            this.from = value;
                        }
                        else {
                            this.from = $dom$2.cssAttribute(element.parentElement, this.attributeName);
                        }
                    }
                    this.values.push(this.from, this.to);
                    this.keyTimes.push(0, 1);
                    this.setAttribute('by');
                }
                if (values === '' && from !== '' && this.to !== '') {
                    this.setAttribute('additive', 'sum');
                    if (this.additiveSum) {
                        this.setAttribute('accumulate', 'sum');
                    }
                }
                const repeatDur = this.getAttribute('repeatDur');
                if (repeatDur && repeatDur !== 'indefinite') {
                    this.repeatDuration = convertClockTime(repeatDur);
                }
                const repeatCount = this.getAttribute('repeatCount');
                if (repeatCount === 'indefinite') {
                    this.repeatCount = -1;
                }
                else {
                    this.repeatCount = parseFloat(repeatCount);
                }
                if (this.begin.length) {
                    const end = this.getAttribute('end');
                    if (end !== '') {
                        const times = sortNumber(end.split(';').map(value => convertClockTime(value)));
                        if (times.length && (this.begin.length === 1 || this.begin[this.begin.length - 1] !== this.end || times[0] === 0)) {
                            this.end = times[0];
                            this.begin = this.begin.filter(value => value >= 0 && value < times[0]);
                            if (this.begin.length && this.repeatCount === -1) {
                                this.repeatCount = this.end / this.duration;
                            }
                        }
                    }
                }
                if (element.tagName === 'animate') {
                    this.setCalcMode(this.attributeName);
                }
            }
        }
        static toStepFractionList(name, keySpline, index, keyTimes, values, dpi = 96, fontSize = 16) {
            let currentValue;
            let nextValue;
            switch (name) {
                case 'fill':
                case 'stroke':
                    const colorStart = $color.parseRGBA(values[index]);
                    const colorEnd = $color.parseRGBA(values[index + 1]);
                    if (colorStart && colorEnd) {
                        currentValue = [colorStart];
                        nextValue = [colorEnd];
                    }
                    break;
                case 'points':
                    currentValue = SvgBuild.fromNumberList(SvgBuild.toNumberList(values[index]));
                    nextValue = SvgBuild.fromNumberList(SvgBuild.toNumberList(values[index + 1]));
                    break;
                case 'rotate':
                case 'scale':
                case 'translate':
                    currentValue = values[index].split(' ').map(value => parseFloat(value));
                    nextValue = values[index + 1].split(' ').map(value => parseFloat(value));
                    break;
                default:
                    if ($util$3.isNumber(values[index])) {
                        currentValue = [parseFloat(values[index])];
                    }
                    else if ($util$3.isUnit(values[index])) {
                        currentValue = [parseFloat($util$3.convertPX(values[index], dpi, fontSize))];
                    }
                    if ($util$3.isNumber(values[index + 1])) {
                        nextValue = [parseFloat(values[index + 1])];
                    }
                    else if ($util$3.isUnit(values[index + 1])) {
                        nextValue = [parseFloat($util$3.convertPX(values[index + 1], dpi, fontSize))];
                    }
                    break;
            }
            if (currentValue && nextValue && currentValue.length && currentValue.length === nextValue.length) {
                switch (keySpline) {
                    case 'steps-start':
                        keySpline = 'steps(1, start)';
                        break;
                    case 'steps-end':
                        keySpline = 'steps(1, end)';
                        break;
                }
                const match = /steps\((\d+)(?:, (start|end))?\)/.exec(keySpline);
                if (match) {
                    const keyTimeTotal = keyTimes[index + 1] - keyTimes[index];
                    const stepSize = parseInt(match[1]);
                    const interval = 100 / stepSize;
                    const splitTimes = [];
                    const splitValues = [];
                    for (let i = 0, j = match[2] === 'start' ? 1 : 0; i < stepSize; i++) {
                        const time = keyTimes[index] + keyTimeTotal * (i / stepSize);
                        const value = [];
                        const percent = (j > 0 && i === stepSize - 1 ? 100 : interval * (i + j)) / 100;
                        switch (name) {
                            case 'fill':
                            case 'stroke': {
                                const current = currentValue[0];
                                const next = nextValue[0];
                                const r = $color.convertHex(getSplitValue(current.rgba.r, next.rgba.r, percent));
                                const g = $color.convertHex(getSplitValue(current.rgba.g, next.rgba.g, percent));
                                const b = $color.convertHex(getSplitValue(current.rgba.b, next.rgba.b, percent));
                                const a = $color.convertHex(getSplitValue(current.rgba.a, next.rgba.a, percent));
                                value.push(`#${r + g + b + (a !== 'FF' ? a : '')}`);
                                break;
                            }
                            case 'points': {
                                for (let k = 0; k < currentValue.length; k++) {
                                    const current = currentValue[k];
                                    const next = nextValue[k];
                                    value.push(`${getSplitValue(current.x, next.x, percent)},${getSplitValue(current.y, next.y, percent)}`);
                                }
                                break;
                            }
                            default: {
                                for (let k = 0; k < currentValue.length; k++) {
                                    const current = currentValue[k];
                                    const next = nextValue[k];
                                    value.push(getSplitValue(current, next, percent).toString());
                                }
                                break;
                            }
                        }
                        if (value.length) {
                            splitTimes.push(time);
                            splitValues.push(value.join(' '));
                        }
                        else {
                            return undefined;
                        }
                    }
                    return [splitTimes, splitValues];
                }
            }
            return undefined;
        }
        static toFractionList(value, delimiter = ';') {
            let previous = -1;
            const result = $util$3.flatMap(value.split(delimiter), segment => {
                const fraction = parseFloat(segment);
                if (!isNaN(fraction) && fraction <= 1 && (previous === -1 || fraction > previous)) {
                    previous = fraction;
                    return fraction;
                }
                return -1;
            });
            return result.length > 1 && result.some(percent => percent !== -1) && result[0] === 0 ? result : [];
        }
        setCalcMode(name) {
            if (this.element) {
                switch (this.getAttribute('calcMode')) {
                    case 'discrete':
                        const keyTimes = [];
                        const values = [];
                        const keySplines = [];
                        for (let i = 0; i < this.keyTimes.length - 1; i++) {
                            const result = SvgAnimate.toStepFractionList(name, 'steps-start', i, this.keyTimes, this.values, getHostDPI(), getFontSize(this.element));
                            if (result) {
                                keyTimes.push(...result[0]);
                                values.push(...result[1]);
                                result[0].forEach(() => keySplines.push(KEYSPLINE_NAME.step));
                            }
                            else {
                                return;
                            }
                        }
                        keyTimes.push(this.keyTimes.pop());
                        values.push(this.values.pop());
                        this.keyTimes = keyTimes;
                        this.values = values;
                        this._keySplines = keySplines;
                        break;
                    case 'spline':
                        this.keySplines = $util$3.flatMap(this.getAttribute('keySplines').split(';'), value => value.trim());
                        break;
                }
            }
        }
        set repeatCount(value) {
            if (!isNaN(value)) {
                this._repeatCount = value;
                if (value !== -1) {
                    this.repeatDuration = -1;
                }
            }
            else {
                this._repeatCount = 1;
            }
            if (this.element) {
                const fill = this.getAttribute('fill');
                if (fill === 'freeze' && this.repeatCount !== -1) {
                    this.fillMode |= 8 /* FREEZE */;
                }
                else if ($util$3.hasBit(this.fillMode, 8 /* FREEZE */)) {
                    this.fillMode ^= 8 /* FREEZE */;
                }
            }
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
        set keySplines(value) {
            if (value) {
                const minSegment = this.keyTimes.length - 1;
                if (minSegment > 0 && value.length >= minSegment && !value.every(spline => spline === '')) {
                    const result = [];
                    for (let i = 0; i < minSegment; i++) {
                        const points = value[i].split(' ').map(pt => parseFloat(pt));
                        if (points.length === 4 && !points.some(pt => isNaN(pt)) && points[0] >= 0 && points[0] <= 1 && points[2] >= 0 && points[2] <= 1) {
                            result.push(points.join(' '));
                        }
                        else {
                            result.push(KEYSPLINE_NAME.linear);
                        }
                    }
                    this._keySplines = result;
                }
            }
            else {
                this._keySplines = undefined;
            }
        }
        get keySplines() {
            return this._keySplines;
        }
        set reverse(value) {
            if (value !== this._reverse && this.values.length) {
                this.values.reverse();
                if (this._keySplines) {
                    const result = [];
                    for (let i = this._keySplines.length - 1; i >= 0; i--) {
                        const points = this._keySplines[i].split(' ').map(pt => parseFloat(pt));
                        if (points.length === 4) {
                            result.push(`${invertControlPoint(points[2])} ${invertControlPoint(points[3])} ${invertControlPoint(points[0])} ${invertControlPoint(points[1])}`);
                        }
                        else {
                            result.push(KEYSPLINE_NAME.linear);
                        }
                    }
                    this._keySplines = result;
                }
                this._reverse = value;
            }
        }
        get reverse() {
            return this._reverse;
        }
        get fromToType() {
            return this.keyTimes.length > 0 && this.keyTimes[0] === 0 && this.keyTimes[1] === 1;
        }
        get instanceType() {
            return 1;
        }
    }

    class SvgAnimateTransform extends SvgAnimate {
        constructor(element) {
            super(element);
            this.element = element;
            this.type = 0;
            if (element) {
                const type = this.getAttribute('type');
                this.setType(type);
                this.setCalcMode(type);
            }
        }
        static toRotateList(values) {
            const result = values.map(value => {
                if (value === '') {
                    return [null, null, null];
                }
                else {
                    const segment = SvgBuild.toNumberList(value);
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
                    const segment = SvgBuild.toNumberList(value);
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
                    const segment = SvgBuild.toNumberList(value);
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
        setType(value) {
            switch (value) {
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
        get instanceType() {
            return 2;
        }
    }

    const $color$1 = squared.lib.color;
    const $dom$3 = squared.lib.dom;
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
                this.parentElement = null;
            }
            setPaint() {
                this.setAttribute('color');
                this.setColor('fill');
                this.setAttribute('fill-opacity');
                this.setAttribute('fill-rule');
                this.setColor('stroke');
                this.setAttribute('stroke-opacity');
                this.setAttribute('stroke-width');
                this.setAttribute('stroke-linecap');
                this.setAttribute('stroke-linejoin');
                this.setAttribute('stroke-miterlimit');
                this.setAttribute('stroke-dasharray');
                this.setAttribute('stroke-dashoffset');
                const match = $util$4.REGEXP_PATTERN.CSS_URL.exec(this.getAttribute('clip-path'));
                if (match) {
                    this.clipPath = match[1];
                }
                this.setAttribute('clip-rule');
            }
            setColor(attr) {
                const element = this.element;
                let value = this.getAttribute(attr);
                const match = $util$4.REGEXP_PATTERN.CSS_URL.exec(value);
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
                            const color = $color$1.parseRGBA(this.color || $dom$3.cssAttribute(element, attr, true));
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
            setAttribute(attr) {
                const value = this.getAttribute(attr);
                if (value !== '') {
                    this[$util$4.convertCamelCase(attr)] = value;
                }
            }
            getAttribute(attr) {
                return $dom$3.cssAttribute(this.element, attr) || (this.parentElement ? $dom$3.cssAttribute(this.parentElement, attr) : '');
            }
        };
    };

    class SvgElement {
        constructor(element) {
            this.element = element;
        }
        build(exclusions, residual) { }
        synchronize(useKeyTime) { }
    }

    class SvgPath extends SvgPaint$MX(SvgBaseVal$MX(SvgElement)) {
        constructor(element, parentElement) {
            super(element);
            this.element = element;
            this.name = '';
            this.value = '';
            this.transformed = null;
            if (parentElement) {
                this.parentElement = parentElement;
            }
            else if (SVG.g(element.parentElement) || SVG.use(element.parentElement)) {
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
            return points.length ? `M${points.map(pt => `${pt.x},${pt.y}`).join(' ')}` : '';
        }
        draw(transform, residual, save = true) {
            const element = this.element;
            let d = '';
            if (save) {
                this.transformed = null;
            }
            const parent = this.parent;
            if (SVG.path(element)) {
                d = this.getBaseValue('d');
                if (parent && parent.aspectRatio.unit !== 1 || transform && transform.length) {
                    const commands = SvgBuild.toPathCommandList(d);
                    if (commands.length) {
                        let points = SvgBuild.getPathPoints(commands);
                        if (points.length) {
                            if (transform && transform.length) {
                                if (typeof residual === 'function') {
                                    [this.transformResidual, transform] = residual.call(this, element, transform);
                                }
                                if (transform.length) {
                                    points = this.transformPoints(transform, points);
                                    this.transformed = transform;
                                }
                            }
                            if (parent) {
                                parent.refitPoints(points);
                            }
                            d = SvgBuild.fromPathCommandList(SvgBuild.rebindPathPoints(commands, points));
                        }
                    }
                }
            }
            else if (SVG.line(element)) {
                let points = [
                    { x: this.getBaseValue('x1'), y: this.getBaseValue('y1') },
                    { x: this.getBaseValue('x2'), y: this.getBaseValue('y2') }
                ];
                if (transform && transform.length) {
                    if (typeof residual === 'function') {
                        [this.transformResidual, transform] = residual.call(this, element, transform);
                    }
                    if (transform.length) {
                        points = this.transformPoints(transform, points);
                        this.transformed = transform;
                    }
                }
                if (parent) {
                    parent.refitPoints(points);
                }
                d = SvgPath.getPolyline(points);
            }
            else if (SVG.circle(element) || SVG.ellipse(element)) {
                let rx;
                let ry;
                if (SVG.ellipse(element)) {
                    rx = this.getBaseValue('rx');
                    ry = this.getBaseValue('ry');
                }
                else {
                    rx = this.getBaseValue('r');
                    ry = rx;
                }
                let points = [
                    { x: this.getBaseValue('cx'), y: this.getBaseValue('cy'), rx, ry }
                ];
                if (transform && transform.length) {
                    if (typeof residual === 'function') {
                        [this.transformResidual, transform] = residual.call(this, element, transform, rx, ry);
                    }
                    if (transform.length) {
                        points = this.transformPoints(transform, points);
                        this.transformed = transform;
                    }
                }
                if (parent) {
                    parent.refitPoints(points);
                }
                const pt = points[0];
                d = SvgPath.getEllipse(pt.x, pt.y, pt.rx, pt.ry);
            }
            else if (SVG.rect(element)) {
                let x = this.getBaseValue('x');
                let y = this.getBaseValue('y');
                let width = this.getBaseValue('width');
                let height = this.getBaseValue('height');
                if (transform && transform.length) {
                    let points = [
                        { x, y },
                        { x: x + width, y },
                        { x: x + width, y: y + height },
                        { x, y: y + height }
                    ];
                    if (typeof residual === 'function') {
                        [this.transformResidual, transform] = residual.call(this, element, transform);
                    }
                    if (transform.length) {
                        points = this.transformPoints(transform, points);
                        this.transformed = transform;
                    }
                    if (parent) {
                        parent.refitPoints(points);
                    }
                    d = SvgPath.getPolygon(points);
                }
                else {
                    if (parent) {
                        x = parent.refitX(x);
                        y = parent.refitY(y);
                        width = parent.refitSize(width);
                        height = parent.refitSize(height);
                    }
                    d = SvgPath.getRect(width, height, x, y);
                }
            }
            else if (SVG.polygon(element) || SVG.polyline(element)) {
                let points = this.getBaseValue('points');
                if (transform && transform.length) {
                    if (typeof residual === 'function') {
                        [this.transformResidual, transform] = residual.call(this, element, transform);
                    }
                    if (transform.length) {
                        points = this.transformPoints(transform, points);
                        this.transformed = transform;
                    }
                }
                if (parent) {
                    parent.refitPoints(points);
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
            if (SVG.path(element)) {
                this.setBaseValue('d');
            }
            else if (SVG.line(element)) {
                this.setBaseValue('x1');
                this.setBaseValue('y1');
                this.setBaseValue('x2');
                this.setBaseValue('y2');
            }
            else if (SVG.rect(element)) {
                this.setBaseValue('x');
                this.setBaseValue('y');
                this.setBaseValue('width');
                this.setBaseValue('height');
            }
            else if (SVG.circle(element)) {
                this.setBaseValue('cx');
                this.setBaseValue('cy');
                this.setBaseValue('r');
            }
            else if (SVG.ellipse(element)) {
                this.setBaseValue('cx');
                this.setBaseValue('cy');
                this.setBaseValue('rx');
                this.setBaseValue('ry');
            }
            else if (SVG.polygon(element) || SVG.polyline(element)) {
                this.setBaseValue('points', SvgBuild.clonePoints(element.points));
            }
            this.setPaint();
        }
        get transform() {
            if (this._transform === undefined) {
                this._transform = getTransform(this.element) || SvgBuild.convertTransformList(this.element.transform.baseVal);
            }
            return this._transform;
        }
    }

    const $util$5 = squared.lib.util;
    function insertSplitTimeValue(map, insertMap, splitTime) {
        let previous;
        let next;
        for (const [ordinal, value] of map.entries()) {
            if (previous && splitTime <= ordinal) {
                next = { ordinal, value };
                break;
            }
            if (splitTime >= ordinal) {
                previous = { ordinal, value };
            }
        }
        if (previous && next) {
            const value = getSplitValue$1(splitTime, previous.ordinal, next.ordinal, previous.value, next.value);
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
    function getPathData(map, path, parent, freezeMap) {
        const result = [];
        const tagName = path.element.tagName;
        let baseVal;
        switch (tagName) {
            case 'line':
                baseVal = ['x1', 'y1', 'x2', 'y2'];
                break;
            case 'rect':
                baseVal = ['width', 'height', 'x', 'y'];
                break;
            case 'polyline':
            case 'polygon':
                baseVal = ['points'];
                break;
            case 'circle':
                baseVal = ['cx', 'cy', 'r'];
                break;
            case 'ellipse':
                baseVal = ['cx', 'cy', 'rx', 'ry'];
                break;
            default:
                return undefined;
        }
        for (const [ordinal, data] of map.entries()) {
            const values = [];
            baseVal.forEach(attr => {
                if (data.has(attr)) {
                    values.push(data.get(attr));
                }
                else if (freezeMap && freezeMap[attr]) {
                    values.push(freezeMap[attr].value);
                }
                else {
                    const value = path.getBaseValue(attr);
                    if (value !== undefined) {
                        values.push(value);
                    }
                }
            });
            if (values.length === baseVal.length) {
                let points;
                switch (tagName) {
                    case 'line':
                        points = getLinePoints(values);
                        break;
                    case 'rect':
                        points = getRectPoints(values);
                        break;
                    case 'polygon':
                    case 'polyline':
                        points = values[0];
                        break;
                    case 'circle':
                    case 'ellipse':
                        points = getEllipsePoints(values);
                        break;
                }
                if (points) {
                    let value;
                    if (path.transformed && path.transformed.length) {
                        points = SvgBuild.applyTransforms(path.transformed, points, getTransformOrigin(path.element));
                    }
                    if (parent) {
                        parent.refitPoints(points);
                    }
                    switch (tagName) {
                        case 'line':
                        case 'polyline':
                            value = SvgPath.getPolyline(points);
                            break;
                        case 'rect':
                        case 'polygon':
                            value = SvgPath.getPolygon(points);
                            break;
                        case 'circle':
                        case 'ellipse':
                            const pt = points[0];
                            value = SvgPath.getEllipse(pt.x, pt.y, pt.rx, pt.ry);
                            break;
                    }
                    if (value !== undefined) {
                        result.push({ ordinal, value });
                    }
                }
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
    function getEllipsePoints(values) {
        return [{ x: values[0], y: values[1], rx: values[2], ry: values[values.length - 1] }];
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
                    if (!values.has(attr) && keyTime >= freezeMap[attr].ordinal) {
                        values.set(attr, freezeMap[attr].value);
                    }
                }
            }
            result.set(keyTime, values);
        }
        return result;
    }
    function getItemTime(begin, duration, keyTimes, iteration, index) {
        return Math.round(begin + (keyTimes[index] + iteration) * duration);
    }
    function getItemValue(item, index, baseValue, iteration = 0) {
        const values = item.alternate && iteration % 2 !== 0 ? item.values.slice(0).reverse() : item.values;
        if (typeof baseValue === 'number') {
            let result = parseFloat(values[index]);
            if (item.additiveSum) {
                result += baseValue;
                if (!item.accumulateSum) {
                    iteration = 0;
                }
                for (let i = 0; i < iteration; i++) {
                    for (let j = 0; j < values.length; j++) {
                        result += parseFloat(values[j]);
                    }
                }
            }
            return result;
        }
        else {
            const result = [];
            values[index].trim().split(/\s+/).forEach(points => {
                const [x, y] = points.split(',').map(point => parseFloat(point));
                result.push({ x, y });
            });
            return result;
        }
    }
    function getSplitValue$1(fraction, previousFraction, nextFraction, previousValue, nextValue) {
        if (typeof previousValue === 'number' && typeof nextValue === 'number') {
            const percentage = (fraction - previousFraction) / (nextFraction - previousFraction);
            return previousValue + percentage * (nextValue - previousValue);
        }
        else if (Array.isArray(previousValue) && Array.isArray(nextValue)) {
            const result = [];
            for (let i = 0; i < Math.min(previousValue.length, nextValue.length); i++) {
                result.push({
                    x: getSplitValue$1(fraction, previousFraction, nextFraction, previousValue[i].x, nextValue[i].x),
                    y: getSplitValue$1(fraction, previousFraction, nextFraction, previousValue[i].y, nextValue[i].y)
                });
            }
            return result;
        }
        else {
            return previousValue;
        }
    }
    function playableAnimation(item) {
        return !item.paused && item.begin.length > 0 && item.keyTimes.length > 1 && item.duration > 0;
    }
    function getDuration(item) {
        return item.repeatCount !== -1 ? item.duration * item.repeatCount : Number.MAX_VALUE;
    }
    function getGroupDuration(item) {
        return item.duration * (item.repeatCount !== -1 ? item.repeatCount : 1);
    }
    var SvgSynchronize$MX = (Base) => {
        return class extends Base {
            getAnimateShape() {
                const element = this.element;
                const result = [];
                for (const item of this.animation) {
                    if (playableAnimation(item)) {
                        switch (item.attributeName) {
                            case 'r':
                            case 'cx':
                            case 'cy':
                                if (SVG.circle(element)) {
                                    result.push(item);
                                    break;
                                }
                            case 'rx':
                            case 'ry':
                                if (SVG.ellipse(element)) {
                                    result.push(item);
                                }
                                break;
                            case 'x1':
                            case 'x2':
                            case 'y1':
                            case 'y2':
                                if (SVG.line(element)) {
                                    result.push(item);
                                }
                                break;
                            case 'points':
                                if (SVG.polyline(element) || SVG.polygon(element)) {
                                    result.push(item);
                                }
                                break;
                            case 'x':
                            case 'y':
                            case 'width':
                            case 'height':
                                if (SVG.rect(element)) {
                                    result.push(item);
                                }
                                break;
                        }
                    }
                }
                return result;
            }
            getAnimateViewRect() {
                const result = [];
                for (const item of this.animation) {
                    if (playableAnimation(item)) {
                        switch (item.attributeName) {
                            case 'x':
                            case 'y':
                                result.push(item);
                                break;
                        }
                    }
                }
                return result;
            }
            mergeAnimate(animations, useKeyTime = false, path) {
                if (animations.length > 1 || animations.some(item => item.begin.length > 1 || !item.fromToType || item.alternate || item.end !== undefined || item.additiveSum)) {
                    let animationsCSS = animations.filter(item => item.element === undefined);
                    const minDelay = $util$5.minArray(animationsCSS.map(item => item.begin[0]));
                    const maxDuration = $util$5.maxArray(animationsCSS.map(item => getDuration(item)));
                    const fillBackwards = animationsCSS.filter(item => $util$5.hasBit(item.fillMode, 2 /* BACKWARDS */));
                    const groupName = {};
                    let repeatingDurationTotal = 0;
                    for (const item of animations) {
                        const attr = item.attributeName;
                        if (groupName[attr] === undefined) {
                            groupName[attr] = new Map();
                        }
                        for (const begin of item.begin) {
                            if (item.element === undefined || (fillBackwards.length === 0 && begin < minDelay || getDuration(item) > maxDuration)) {
                                const group = groupName[attr].get(begin) || { duration: 0, items: [] };
                                group.items.push(item);
                                groupName[attr].set(begin, group);
                            }
                        }
                    }
                    for (const attr in groupName) {
                        if (groupName[attr].size) {
                            const groupBegin = groupName[attr];
                            let freezeTime = Number.MAX_VALUE;
                            for (const [begin, group] of groupBegin.entries()) {
                                group.items.sort((a, b) => a.element && b.element === undefined ? -1 : 0);
                                let i = group.items.length - 1;
                                const ignore = [];
                                do {
                                    const item = group.items[i];
                                    const groupEnd = item.repeatCount === -1 || item.fillMode >= 4 /* FORWARDS */;
                                    const repeatDuration = item.duration * item.repeatCount;
                                    for (let j = 0; j < i; j++) {
                                        const subitem = group.items[j];
                                        if (groupEnd || subitem.repeatCount !== -1 && subitem.duration * subitem.repeatCount <= repeatDuration) {
                                            ignore.push(subitem);
                                        }
                                    }
                                    if (item.repeatCount !== -1 && item.fillMode >= 4 /* FORWARDS */) {
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
                                    const duration = $util$5.maxArray(group.items.map(item => getGroupDuration(item)));
                                    repeatingDurationTotal = Math.max(repeatingDurationTotal, time + duration);
                                    group.items = group.items.filter(item => !fillBackwards.includes(item));
                                    if (group.items.length) {
                                        group.duration = duration;
                                        group.items.reverse();
                                        groupSorted.set(time, group);
                                    }
                                }
                            }
                            groupName[attr] = groupSorted;
                        }
                        else {
                            delete groupName[attr];
                        }
                    }
                    const repeatingMap = {};
                    const indefiniteMap = {};
                    const repeatingInterpolatorMap = new Map();
                    const indefiniteInterpolatorMap = new Map();
                    const repeatingAnimations = new Set();
                    const freezeMap = {};
                    const forwardMap = {};
                    let repeatingResult;
                    let indefiniteResult;
                    let indefiniteDurationTotal = 0;
                    function insertSplitKeyTimeValue(map, interpolatorMap, item, baseValue, begin, iteration, splitTime, adjustment = 0) {
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
                        let value;
                        if (previousIndex !== -1 && nextIndex !== -1) {
                            value = getSplitValue$1(fraction, keyTimes[previousIndex], keyTimes[nextIndex], getItemValue(item, previousIndex, baseValue, iteration), getItemValue(item, nextIndex, baseValue, iteration));
                        }
                        else {
                            nextIndex = previousIndex !== -1 ? previousIndex + 1 : keyTimes.length - 1;
                            value = getItemValue(item, nextIndex, baseValue, iteration);
                        }
                        let time = splitTime + adjustment;
                        if (map.get(time) !== value) {
                            while (map.has(time)) {
                                time++;
                            }
                            insertInterpolator(interpolatorMap, time, item.keySplines, nextIndex);
                            map.set(time, value);
                        }
                        return [time, value];
                    }
                    function insertInterpolator(map, time, keySplines, index) {
                        if (!useKeyTime) {
                            if (index === 0) {
                                return;
                            }
                            index--;
                        }
                        const value = keySplines && keySplines[index] || '';
                        if (value !== '') {
                            const values = map.get(time) || new Set();
                            values.add(value);
                            map.set(time, values);
                        }
                    }
                    const getBaseValue = (attr) => {
                        let value;
                        try {
                            value = (path || this).getBaseValue(attr);
                        }
                        catch (_a) {
                        }
                        return value !== undefined && value !== null ? value : (attr === 'points' ? [{ x: 0, y: 0 }] : 0);
                    };
                    animationEnd: {
                        for (const attr in groupName) {
                            repeatingMap[attr] = new Map();
                            const groupBegin = Array.from(groupName[attr].keys());
                            const groupData = Array.from(groupName[attr].values());
                            const resetValue = getBaseValue(attr);
                            let incomplete = [];
                            let baseValue = resetValue;
                            let groupBackwards;
                            let maxTime = -1;
                            function setComplete(animate, delayed) {
                                incomplete = incomplete.filter(item => item.value !== animate);
                                if ($util$5.hasBit(animate.fillMode, 4 /* FORWARDS */)) {
                                    forwardMap[attr] = true;
                                    animationsCSS = animationsCSS.filter(item => item.attributeName !== attr);
                                    return animationsCSS.length === 0 ? 2 : 1;
                                }
                                else if ($util$5.hasBit(animate.fillMode, 8 /* FREEZE */)) {
                                    freezeMap[attr] = { ordinal: maxTime, value: baseValue };
                                    return 1;
                                }
                                else if (delayed) {
                                    repeatingMap[attr].set(++maxTime, resetValue);
                                }
                                return 0;
                            }
                            if (fillBackwards.length) {
                                groupBackwards = fillBackwards.filter(item => item.attributeName === attr);
                                if (groupBackwards.length) {
                                    for (const item of groupBackwards) {
                                        groupBegin.unshift(item.begin[0]);
                                        groupData.unshift({
                                            duration: getGroupDuration(item),
                                            items: [item]
                                        });
                                    }
                                    const firstAnimate = groupData[0].items[0];
                                    baseValue = getItemValue(firstAnimate, firstAnimate.reverse ? 0 : firstAnimate.values.length - 1, baseValue, 0);
                                    repeatingMap[attr].set(0, baseValue);
                                }
                            }
                            attributeEnd: {
                                for (let i = 0; i < groupBegin.length; i++) {
                                    const groupItems = groupData[i].items;
                                    if (groupItems.length === 0) {
                                        continue;
                                    }
                                    let begin = groupBegin[i];
                                    let previousMaxTime = -1;
                                    if (begin < 0) {
                                        previousMaxTime = Math.max(0, maxTime);
                                        maxTime = Math.max(maxTime, Math.abs(begin));
                                        begin = 0;
                                    }
                                    let alteredIndex = -1;
                                    let alteredBegin = 0;
                                    for (let j = 0; j < groupItems.length; j++) {
                                        const item = groupItems[j];
                                        if (j === alteredIndex) {
                                            begin = alteredBegin;
                                            alteredIndex = -1;
                                            alteredBegin = 0;
                                        }
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
                                        let nextBeginTime;
                                        let minRestartTime = 0;
                                        if (item.element) {
                                            nextBeginTime = groupBegin[i + 1];
                                            if (incomplete.length) {
                                                let next;
                                                for (let k = incomplete.length - 1; k >= 0; k--) {
                                                    if (incomplete[k].value.element === undefined) {
                                                        next = incomplete[k];
                                                        incomplete.splice(k, 1);
                                                        break;
                                                    }
                                                }
                                                if (next) {
                                                    alteredIndex = j + 1;
                                                    alteredBegin = begin;
                                                    begin = next.ordinal;
                                                    groupItems.splice(j, 0, next.value);
                                                    j--;
                                                    continue;
                                                }
                                            }
                                            for (let k = i + 1; k < groupBegin.length; k++) {
                                                minRestartTime = Math.max(minRestartTime, groupBegin[k] + groupData[k].duration);
                                            }
                                        }
                                        else {
                                            const itemIndex = animationsCSS.findIndex(animate => animate === item);
                                            if (groupBackwards === undefined || !groupBackwards.includes(item)) {
                                                nextBegin: {
                                                    for (let k = i + 1; k < groupBegin.length; k++) {
                                                        const groupCSS = groupData[k].items.filter(animate => animate.element === undefined);
                                                        for (const css of groupCSS) {
                                                            const cssIndex = animationsCSS.findIndex(animate => animate === css);
                                                            if (cssIndex > itemIndex) {
                                                                nextBeginTime = groupBegin[k];
                                                                break nextBegin;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            for (let k = i + 1; k < groupBegin.length; k++) {
                                                const groupCSS = groupData[k].items.filter(subitem => subitem.element === undefined && animationsCSS.findIndex(animate => animate === subitem) > itemIndex);
                                                if (groupCSS.length) {
                                                    const groupDuration = $util$5.maxArray(groupCSS.map(animate => getGroupDuration(animate)));
                                                    minRestartTime = Math.max(minRestartTime, groupBegin[j] + groupDuration);
                                                }
                                            }
                                        }
                                        const maxThreadTime = Math.min(nextBeginTime || Number.MAX_VALUE, item.end || Number.MAX_VALUE);
                                        let lastValue;
                                        let complete = false;
                                        if (maxThreadTime > maxTime) {
                                            complete = true;
                                            let parallel = maxTime !== -1;
                                            threadTimeExceeded: {
                                                for (let k = Math.floor(Math.max(0, maxTime - begin) / duration); k < repeatTotal; k++) {
                                                    for (let l = 0; l < item.keyTimes.length; l++) {
                                                        const keyTime = item.keyTimes[l];
                                                        let time;
                                                        let value = getItemValue(item, l, baseValue, k);
                                                        if (k === repeatTotal - 1 && repeatFraction > 0) {
                                                            if (repeatFraction > keyTime) {
                                                                for (let m = l + 1; m < item.keyTimes.length; m++) {
                                                                    if (repeatFraction <= item.keyTimes[m]) {
                                                                        time = begin + durationTotal;
                                                                        value = getSplitValue$1(repeatFraction, keyTime, item.keyTimes[m], value, getItemValue(item, m, baseValue, k));
                                                                        repeatFraction = -1;
                                                                        break;
                                                                    }
                                                                }
                                                            }
                                                            else if (repeatFraction === keyTime) {
                                                                repeatFraction = -1;
                                                            }
                                                        }
                                                        if (time === undefined) {
                                                            time = getItemTime(begin, duration, item.keyTimes, k, l);
                                                            if (time === maxThreadTime) {
                                                                complete = k === repeatTotal - 1 && l === item.keyTimes.length - 1;
                                                            }
                                                            else {
                                                                const adjustNumberValue = (splitTime, maxThread) => {
                                                                    [maxTime, lastValue] = insertSplitKeyTimeValue(repeatingMap[attr], repeatingInterpolatorMap, item, baseValue, begin, k, splitTime, maxThread && splitTime === groupBegin[i + 1] && !repeatingMap[attr].has(splitTime - 1) ? -1 : 0);
                                                                };
                                                                if (time > maxThreadTime) {
                                                                    adjustNumberValue(maxThreadTime, true);
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
                                                                                adjustNumberValue(maxTime, false);
                                                                            }
                                                                        }
                                                                        parallel = false;
                                                                    }
                                                                    else if (k > 0 && l === 0) {
                                                                        if (item.additiveSum && item.accumulateSum) {
                                                                            insertInterpolator(repeatingInterpolatorMap, time, item.keySplines, l);
                                                                            maxTime = time;
                                                                            continue;
                                                                        }
                                                                        if (time === maxTime && repeatingMap[attr].get(time) === value) {
                                                                            insertInterpolator(repeatingInterpolatorMap, time, item.keySplines, l);
                                                                            continue;
                                                                        }
                                                                        else {
                                                                            time = Math.max(time, maxTime + 1);
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        if (time > maxTime) {
                                                            insertInterpolator(repeatingInterpolatorMap, time, item.keySplines, l);
                                                            repeatingMap[attr].set(time, value);
                                                            maxTime = time;
                                                            lastValue = value;
                                                        }
                                                        if (!complete || repeatFraction === -1) {
                                                            break threadTimeExceeded;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        if (lastValue !== undefined) {
                                            baseValue = lastValue;
                                            if (!indefinite) {
                                                repeatingAnimations.add(item);
                                            }
                                        }
                                        if (indefinite) {
                                            incomplete.length = 0;
                                            incomplete.push({
                                                ordinal: begin,
                                                value: item
                                            });
                                        }
                                        else {
                                            if (complete) {
                                                const label = setComplete(item, groupBegin[i + 1] > maxTime + 1);
                                                if (label === 2) {
                                                    break animationEnd;
                                                }
                                                else if (label === 1) {
                                                    break attributeEnd;
                                                }
                                            }
                                            else if (groupBegin[i] + durationTotal > minRestartTime) {
                                                incomplete.push({
                                                    ordinal: begin,
                                                    value: item
                                                });
                                            }
                                        }
                                    }
                                    if (previousMaxTime !== -1) {
                                        const timeMap = new Map();
                                        maxTime = previousMaxTime;
                                        for (let [time, data] of repeatingMap[attr].entries()) {
                                            if (time >= previousMaxTime) {
                                                time += groupBegin[i];
                                                while (timeMap.has(time)) {
                                                    time++;
                                                }
                                            }
                                            timeMap.set(time, data);
                                            maxTime = Math.max(time, maxTime);
                                        }
                                        repeatingMap[attr] = timeMap;
                                    }
                                }
                                if (incomplete.length) {
                                    incomplete.reverse();
                                    for (let i = 0; i < incomplete.length; i++) {
                                        const begin = incomplete[i].ordinal;
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
                                                    const time = getItemTime(begin, duration, item.keyTimes, j, k);
                                                    if (!joined && time >= maxTime) {
                                                        [maxTime, baseValue] = insertSplitKeyTimeValue(repeatingMap[attr], repeatingInterpolatorMap, item, baseValue, begin, j, maxTime);
                                                        joined = true;
                                                    }
                                                    if (joined) {
                                                        if (time >= maxThreadTime) {
                                                            if (maxThreadTime > maxTime) {
                                                                [maxTime, baseValue] = insertSplitKeyTimeValue(repeatingMap[attr], repeatingInterpolatorMap, item, baseValue, begin, j, maxThreadTime);
                                                            }
                                                            return;
                                                        }
                                                        if (time > maxTime) {
                                                            baseValue = getItemValue(item, k, baseValue, j);
                                                            insertInterpolator(repeatingInterpolatorMap, time, item.keySplines, k);
                                                            repeatingMap[attr].set(time, baseValue);
                                                            maxTime = time;
                                                        }
                                                    }
                                                }
                                            } while (maxTime < maxThreadTime && ++j);
                                        };
                                        if (indefinite) {
                                            if (durationTotal > 0 && durationTotal % duration !== 0) {
                                                maxThreadTime = begin + item.duration * Math.ceil(durationTotal / duration);
                                                insertKeyTimes();
                                            }
                                            indefiniteMap[attr] = { ordinal: begin, value: item };
                                            if (item.element === undefined) {
                                                animationsCSS = animationsCSS.filter(subitem => subitem.attributeName !== attr);
                                                if (animationsCSS.length === 0) {
                                                    break animationEnd;
                                                }
                                            }
                                            break attributeEnd;
                                        }
                                        else {
                                            maxThreadTime = begin + item.duration * item.repeatCount;
                                            if (maxThreadTime > maxTime) {
                                                insertKeyTimes();
                                                repeatingAnimations.add(item);
                                                const label = setComplete(item, false);
                                                if (label === 2) {
                                                    break animationEnd;
                                                }
                                                else if (label === 1) {
                                                    break attributeEnd;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            animationsCSS = animationsCSS.filter(item => item.attributeName !== attr);
                        }
                    }
                    {
                        const keyTimesRepeating = [];
                        for (const attr in repeatingMap) {
                            keyTimesRepeating.push(...repeatingMap[attr].keys());
                        }
                        let repeatingEndTime = $util$5.maxArray(keyTimesRepeating);
                        if (Object.keys(indefiniteMap).length) {
                            const duration = [];
                            const begin = [];
                            for (const attr in indefiniteMap) {
                                begin.push(indefiniteMap[attr].ordinal);
                                duration.push(indefiniteMap[attr].value.duration);
                            }
                            repeatingEndTime = getLeastCommonMultiple(duration, repeatingEndTime, begin);
                        }
                        for (const attr in repeatingMap) {
                            const insertMap = repeatingMap[attr];
                            let maxTime = $util$5.maxArray(Array.from(insertMap.keys()));
                            if (indefiniteMap[attr]) {
                                if (maxTime < repeatingEndTime) {
                                    const begin = indefiniteMap[attr].ordinal;
                                    const item = indefiniteMap[attr].value;
                                    let baseValue = Array.from(insertMap.values()).pop();
                                    let i = Math.floor((maxTime - begin) / item.duration);
                                    do {
                                        let joined = false;
                                        for (let j = 0; j < item.keyTimes.length; j++) {
                                            const time = getItemTime(begin, item.duration, item.keyTimes, i, j);
                                            if (!joined && time >= maxTime) {
                                                [maxTime, baseValue] = insertSplitKeyTimeValue(insertMap, repeatingInterpolatorMap, item, baseValue, begin, j, maxTime);
                                                keyTimesRepeating.push(maxTime);
                                                joined = true;
                                            }
                                            if (joined && time > maxTime) {
                                                baseValue = getItemValue(item, j, baseValue, i);
                                                insertInterpolator(repeatingInterpolatorMap, time, item.keySplines, j);
                                                insertMap.set(time, baseValue);
                                                maxTime = time;
                                                keyTimesRepeating.push(maxTime);
                                            }
                                        }
                                    } while (maxTime < repeatingEndTime && ++i);
                                }
                            }
                            if (indefiniteMap[attr] === undefined && freezeMap[attr] === undefined && !forwardMap[attr]) {
                                let value;
                                const repeat = Array.from(repeatingAnimations).reverse().find(item => item.attributeName === attr);
                                if (repeat && repeat.element === undefined) {
                                    const from = repeat.values[0] || repeat.from;
                                    value = parseFloat(from);
                                    if (isNaN(value)) {
                                        value = SvgBuild.fromNumberList(SvgBuild.toNumberList(from));
                                        if (value.length === 0) {
                                            value = undefined;
                                        }
                                    }
                                }
                                else {
                                    value = getBaseValue(attr);
                                }
                                if (value !== undefined && JSON.stringify(insertMap.get(maxTime)) !== JSON.stringify(value)) {
                                    while (insertMap.has(maxTime)) {
                                        maxTime++;
                                    }
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
                        repeatingResult = getKeyTimeMap(result, keyTimes, freezeMap);
                        repeatingDurationTotal = keyTimes[keyTimes.length - 1];
                        if (useKeyTime) {
                            repeatingResult = convertKeyTimeFraction(repeatingResult, repeatingDurationTotal);
                        }
                    }
                    if (Object.keys(indefiniteMap).length) {
                        const indefiniteArray = [];
                        const result = {};
                        let keyTimes = [];
                        for (const attr in indefiniteMap) {
                            indefiniteArray.push(indefiniteMap[attr].value);
                        }
                        indefiniteDurationTotal = getLeastCommonMultiple(indefiniteArray.map(item => item.duration));
                        for (const item of indefiniteArray) {
                            const attr = item.attributeName;
                            result[attr] = new Map();
                            let maxTime = 0;
                            let baseValue = repeatingMap[attr] ? Array.from(repeatingMap[attr].values()).pop() : getBaseValue(attr);
                            let i = 0;
                            do {
                                for (let j = 0; j < item.keyTimes.length; j++) {
                                    maxTime = getItemTime(0, item.duration, item.keyTimes, i, j);
                                    baseValue = getItemValue(item, j, baseValue, i);
                                    insertInterpolator(indefiniteInterpolatorMap, maxTime, item.keySplines, j);
                                    result[attr].set(maxTime, baseValue);
                                    keyTimes.push(maxTime);
                                }
                            } while (maxTime < indefiniteDurationTotal && ++i);
                        }
                        if (indefiniteArray.every(item => item.alternate)) {
                            let maxTime = -1;
                            for (const attr in indefiniteMap) {
                                const times = Array.from(result[attr].keys());
                                const values = Array.from(result[attr].values()).reverse();
                                for (let i = 0; i < times.length; i++) {
                                    maxTime = indefiniteDurationTotal + times[i];
                                    const interpolator = indefiniteInterpolatorMap.get(times[i]);
                                    if (interpolator) {
                                        indefiniteInterpolatorMap.set(maxTime, interpolator);
                                    }
                                    result[attr].set(maxTime, values[i]);
                                    keyTimes.push(maxTime);
                                }
                            }
                            if (maxTime !== -1) {
                                indefiniteDurationTotal = maxTime;
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
                        indefiniteResult = getKeyTimeMap(result, keyTimes);
                        if (useKeyTime) {
                            indefiniteResult = convertKeyTimeFraction(indefiniteResult, indefiniteDurationTotal);
                        }
                    }
                    if (repeatingResult || indefiniteResult) {
                        $util$5.retainArray(this.animation, (item) => !animations.includes(item));
                        const sequentialName = Array.from(new Set(animations.map(item => item.attributeName))).sort().join('-');
                        let x = 0;
                        let y = 0;
                        if (path === undefined) {
                            x = getBaseValue('x') || 0;
                            y = getBaseValue('y') || 0;
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
                        const insertAnimate = (item, repeating) => {
                            if (!repeating) {
                                item.repeatCount = -1;
                            }
                            item.from = item.values[0];
                            item.to = item.values[item.values.length - 1];
                            this.animation.push(item);
                        };
                        [repeatingResult, indefiniteResult].forEach(result => {
                            if (result) {
                                const repeating = result === repeatingResult;
                                const interpolatorMap = repeating ? repeatingInterpolatorMap : indefiniteInterpolatorMap;
                                const freezeIndefinite = repeating ? undefined : freezeMap;
                                if (useKeyTime) {
                                    const keySplines = [];
                                    const parent = this.parent;
                                    let object;
                                    if (path) {
                                        const pathData = getPathData(result, path, parent, freezeIndefinite);
                                        if (pathData) {
                                            object = new SvgAnimate();
                                            object.attributeName = 'd';
                                            for (const item of pathData) {
                                                object.keyTimes.push(item.ordinal);
                                                object.values.push(item.value.toString());
                                                const interpolator = interpolatorMap.get(item.ordinal);
                                                if (interpolator) {
                                                    keySplines.push(interpolator.values().next().value);
                                                    interpolatorMap.delete(item.ordinal);
                                                }
                                                else {
                                                    keySplines.push('');
                                                }
                                            }
                                        }
                                        else {
                                            return;
                                        }
                                    }
                                    else {
                                        object = new SvgAnimateTransform();
                                        object.attributeName = 'transform';
                                        object.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                                        for (const [keyTime, data] of result.entries()) {
                                            setXY(data);
                                            object.keyTimes.push(keyTime);
                                            object.values.push(parent ? `${parent.refitX(x)} ${parent.refitX(y)}` : `${x} ${y}`);
                                            const interpolator = interpolatorMap.get(keyTime);
                                            if (interpolator) {
                                                keySplines.push(interpolator.values().next().value);
                                                interpolatorMap.delete(keyTime);
                                            }
                                            else {
                                                keySplines.push('');
                                            }
                                        }
                                    }
                                    object.keySplines = keySplines;
                                    object.duration = repeating ? repeatingDurationTotal : indefiniteDurationTotal;
                                    insertAnimate(object, repeating);
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
                                            const pathData = getPathData(map, path, this.parent, freezeIndefinite);
                                            if (pathData) {
                                                object = new SvgAnimate();
                                                object.attributeName = 'd';
                                                object.values = pathData.map(item => item.value.toString());
                                            }
                                            else {
                                                continue;
                                            }
                                            name = sequentialName;
                                        }
                                        else {
                                            object = new SvgAnimateTransform();
                                            object.attributeName = 'transform';
                                            object.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                                            object.values = [dataFrom, dataTo].map(data => {
                                                setXY(data);
                                                return this.parent ? `${this.parent.refitX(x)} ${this.parent.refitX(y)}` : `${x} ${y}`;
                                            });
                                            name = sequentialName + j;
                                        }
                                        if (repeating) {
                                            object.begin = [j === 0 ? keyTimeFrom : 0];
                                        }
                                        object.duration = keyTimeTo - keyTimeFrom;
                                        object.keyTimes = [0, 1];
                                        object.sequential = { ordinal: k++, value: name };
                                        const interpolator = interpolatorMap.get(keyTimeTo);
                                        if (interpolator) {
                                            object.keySplines = [interpolator.values().next().value];
                                            interpolatorMap.delete(keyTimeTo);
                                        }
                                        insertAnimate(object, repeating);
                                    }
                                }
                            }
                        });
                    }
                }
            }
        };
    };

    const $util$6 = squared.lib.util;
    class SvgAnimateMotion extends SvgAnimate {
        constructor(element) {
            super(element);
            this.element = element;
            this.path = '';
            this.mpath = null;
            this.rotate = 0;
            this.rotateAuto = false;
            this.rotateAutoReverse = false;
            this.keyPoints = [];
            if (element) {
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
                        const target = getTargetElement(item);
                        if (target && (SVG.shape(target) || SVG.use(target))) {
                            this.mpath = target;
                            break;
                        }
                    }
                }
            }
        }
        get instanceType() {
            return 3;
        }
    }

    const $dom$4 = squared.lib.dom;
    const $util$7 = squared.lib.util;
    const KEYFRAME_NAME = $dom$4.getKeyframeRules();
    const ANIMATION_MAP = {
        'animation-delay': ['0s'],
        'animation-duration': ['0s'],
        'animation-iteration-count': ['1'],
        'animation-play-state': ['running'],
        'animation-direction': ['normal'],
        'animation-fill-mode': ['none'],
        'animation-timing-function': ['ease']
    };
    const REGEXP_CUBICBEZIER = new RegExp(`cubic-bezier\\(${REGEXP_UNIT.ZERO_ONE}, ${REGEXP_UNIT.DECIMAL}, ${REGEXP_UNIT.ZERO_ONE}, ${REGEXP_UNIT.DECIMAL}\\)`);
    function parseAttribute(element, attr) {
        return $util$7.flatMap($dom$4.cssAttribute(element, attr).split(/(?<!\w+\([\-\d., ]+),/), value => value.trim());
    }
    function sortAttribute(value) {
        return value.sort((a, b) => a.ordinal >= b.ordinal ? 1 : -1);
    }
    var SvgView$MX = (Base) => {
        return class extends Base {
            constructor() {
                super(...arguments);
                this.transformed = null;
            }
            getAnimations(element) {
                const result = [];
                const animationName = parseAttribute(element, 'animation-name');
                if (animationName.length) {
                    const cssData = {};
                    for (const name in ANIMATION_MAP) {
                        const values = parseAttribute(element, name);
                        if (values.length === 0) {
                            values.push(...ANIMATION_MAP[name].slice(0));
                        }
                        while (values.length < animationName.length) {
                            values.push(...values.slice(0));
                        }
                        values.length = animationName.length;
                        cssData[name] = values;
                    }
                    animationName.forEach((className, index) => {
                        const keyframes = KEYFRAME_NAME.get(className);
                        if (keyframes) {
                            const attrMap = {};
                            const keyframeMap = {};
                            for (const percent in keyframes) {
                                const ordinal = parseInt(percent) / 100;
                                for (const name in keyframes[percent]) {
                                    const map = ANIMATION_MAP[name] ? keyframeMap : attrMap;
                                    if (map[name] === undefined) {
                                        map[name] = [];
                                    }
                                    map[name].push({
                                        ordinal,
                                        value: keyframes[percent][name]
                                    });
                                }
                            }
                            if (attrMap['transform']) {
                                function getKeyframeOrigin(ordinal) {
                                    if (attrMap['transform-origin']) {
                                        const origin = attrMap['transform-origin'].find(item => item.ordinal === ordinal);
                                        if (origin) {
                                            return getTransformOrigin(element, origin.value);
                                        }
                                    }
                                    return getTransformOrigin(element);
                                }
                                sortAttribute(attrMap['transform']).forEach(item => {
                                    const transforms = getTransform(element, item.value);
                                    if (transforms) {
                                        const origin = getKeyframeOrigin(item.ordinal);
                                        transforms.forEach(transform => {
                                            let name;
                                            let value;
                                            switch (transform.type) {
                                                case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                                                    name = 'translate';
                                                    value = `${transform.matrix.e} ${transform.matrix.f}`;
                                                    break;
                                                case SVGTransform.SVG_TRANSFORM_SCALE:
                                                    name = 'scale';
                                                    value = `${transform.matrix.a} ${transform.matrix.d}`;
                                                    break;
                                                case SVGTransform.SVG_TRANSFORM_ROTATE:
                                                    name = 'rotate';
                                                    value = `${transform.angle} ${origin.x} ${origin.y}`;
                                                    break;
                                                case SVGTransform.SVG_TRANSFORM_SKEWX:
                                                    name = 'skewX';
                                                    value = transform.angle.toString();
                                                    break;
                                                case SVGTransform.SVG_TRANSFORM_SKEWY:
                                                    name = 'skewY';
                                                    value = transform.angle.toString();
                                                    break;
                                                default:
                                                    return;
                                            }
                                            if (attrMap[name] === undefined) {
                                                attrMap[name] = [];
                                            }
                                            const previousIndex = attrMap[name].findIndex(subitem => subitem.ordinal === item.ordinal);
                                            if (previousIndex !== -1) {
                                                attrMap[name][previousIndex].value = value;
                                            }
                                            else {
                                                attrMap[name].push({
                                                    ordinal: item.ordinal,
                                                    value
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                            delete attrMap['transform'];
                            delete attrMap['transform-origin'];
                            for (const name in attrMap) {
                                const animation = attrMap[name];
                                sortAttribute(animation);
                                let animate;
                                switch (name) {
                                    case 'rotate':
                                    case 'scale':
                                    case 'skewX':
                                    case 'skewY':
                                    case 'translate':
                                        const animateTransform = new SvgAnimateTransform();
                                        animateTransform.attributeName = 'transform';
                                        animateTransform.setType(name);
                                        animate = animateTransform;
                                        if (animation[0].ordinal !== 0) {
                                            animation.unshift({
                                                ordinal: 0,
                                                value: getTransformInitialValue(name)
                                            });
                                        }
                                        break;
                                    default:
                                        animate = new SvgAnimate();
                                        animate.attributeName = name;
                                        if (animation[0].ordinal !== 0) {
                                            animation.unshift({
                                                ordinal: 0,
                                                value: $dom$4.cssAttribute(element, name)
                                            });
                                        }
                                        break;
                                }
                                animate.paused = cssData['animation-play-state'][index] === 'paused';
                                const iterationCount = cssData['animation-iteration-count'][index];
                                const timingFunction = cssData['animation-timing-function'][index];
                                const direction = cssData['animation-direction'][index];
                                const fillMode = cssData['animation-fill-mode'][index];
                                const delay = convertClockTime(cssData['animation-delay'][index]);
                                const duration = convertClockTime(cssData['animation-duration'][index]);
                                const keyTimes = [];
                                const values = [];
                                const keySplines = [];
                                for (let i = 0; i < animation.length; i++) {
                                    keyTimes.push(animation[i].ordinal);
                                    values.push(animation[i].value);
                                    if (i < animation.length - 1) {
                                        const spline = keyframeMap['animation-timing-function'] ? keyframeMap['animation-timing-function'].find(item => item.ordinal === animation[i].ordinal) : undefined;
                                        keySplines.push(spline ? spline.value : timingFunction);
                                    }
                                }
                                if (!keySplines.every(spline => spline === 'linear')) {
                                    const keyTimesData = [];
                                    const valuesData = [];
                                    const keySplinesData = [];
                                    for (let i = 0; i < keySplines.length; i++) {
                                        if (KEYSPLINE_NAME[keySplines[i]]) {
                                            keySplines[i] = KEYSPLINE_NAME[keySplines[i]];
                                        }
                                        else if (keySplines[i].startsWith('steps')) {
                                            const steps = SvgAnimate.toStepFractionList(name, keySplines[i], i, keyTimes, values, getHostDPI(), getFontSize(element));
                                            if (steps) {
                                                keyTimesData.push(...steps[0]);
                                                valuesData.push(...steps[1]);
                                                steps[0].forEach(() => keySplinesData.push(KEYSPLINE_NAME.step));
                                                continue;
                                            }
                                            keySplines[i] = KEYSPLINE_NAME.linear;
                                        }
                                        else {
                                            const match = REGEXP_CUBICBEZIER.exec(keySplines[i]);
                                            keySplines[i] = match ? `${match[1]} ${match[2]} ${match[3]} ${match[4]}` : KEYSPLINE_NAME.ease;
                                        }
                                        keyTimesData.push(keyTimes[i]);
                                        valuesData.push(values[i]);
                                        keySplinesData.push(keySplines[i]);
                                    }
                                    keyTimesData.push(keyTimes.pop());
                                    valuesData.push(values.pop());
                                    animate.keyTimes = keyTimesData;
                                    animate.values = valuesData;
                                    animate.keySplines = keySplinesData;
                                }
                                else {
                                    animate.keyTimes = keyTimes;
                                    animate.values = values;
                                }
                                animate.begin[0] = delay;
                                animate.duration = duration;
                                animate.repeatCount = iterationCount !== 'infinite' ? parseFloat(iterationCount) : -1;
                                if (fillMode === 'forwards' || fillMode === 'both') {
                                    animate.fillMode |= 4 /* FORWARDS */;
                                }
                                if (fillMode === 'backwards' || fillMode === 'both') {
                                    animate.fillMode |= 2 /* BACKWARDS */;
                                }
                                animate.reverse = direction.endsWith('reverse');
                                animate.alternate = (animate.repeatCount === -1 || animate.repeatCount > 1) && direction.startsWith('alternate');
                                result.push(animate);
                            }
                        }
                    });
                }
                for (let i = 0; i < element.children.length; i++) {
                    const item = element.children[i];
                    switch (item.tagName) {
                        case 'set':
                            result.push(new SvgAnimation(item));
                            break;
                        case 'animate':
                            result.push(new SvgAnimate(item));
                            break;
                        case 'animateTransform':
                            result.push(new SvgAnimateTransform(item));
                            break;
                        case 'animateMotion':
                            result.push(new SvgAnimateMotion(item));
                            break;
                    }
                }
                result.forEach(item => item.parent = this);
                return result;
            }
            get name() {
                if (this._name === undefined) {
                    this._name = SvgBuild.setName(this.element);
                }
                return this._name;
            }
            get transform() {
                if (this._transform === undefined) {
                    this._transform = getTransform(this.element) || SvgBuild.convertTransformList(this.element.transform.baseVal);
                }
                return this._transform;
            }
            get animation() {
                if (this._animation === undefined) {
                    this._animation = this.getAnimations(this.element);
                }
                return this._animation;
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
                return $dom$4.cssAttribute(this.element, 'opacity') || '1';
            }
        };
    };

    const $dom$5 = squared.lib.dom;
    var SvgViewRect$MX = (Base) => {
        return class extends Base {
            setRect() {
                let x = this.x;
                let y = this.y;
                let width = this.width;
                let height = this.height;
                if (this.parent) {
                    x = this.parent.refitX(x);
                    y = this.parent.refitY(y);
                    width = this.parent.refitSize(width);
                    height = this.parent.refitSize(height);
                }
                this.setBaseValue('x', x);
                this.setBaseValue('y', y);
                this.setBaseValue('width', width);
                this.setBaseValue('height', height);
            }
            getElement() {
                switch (this.element.tagName) {
                    case 'svg':
                    case 'use':
                    case 'image':
                        return this.element;
                    default:
                        return null;
                }
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
                    if (element.tagName === 'svg' && $dom$5.isUserAgent(16 /* FIREFOX */) && element.parentElement instanceof HTMLElement) {
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
                    if (element.tagName === 'svg' && $dom$5.isUserAgent(16 /* FIREFOX */) && element.parentElement instanceof HTMLElement) {
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
                    if (element.tagName === 'svg' && $dom$5.isUserAgent(16 /* FIREFOX */) && element.parentElement instanceof HTMLElement) {
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
                    if (element.tagName === 'svg' && $dom$5.isUserAgent(16 /* FIREFOX */) && element.parentElement instanceof HTMLElement) {
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
            this.aspectRatio = {
                x: 0,
                y: 0,
                unit: 1
            };
        }
        append(item) {
            item.parent = this;
            return super.append(item);
        }
        build(exclusions, residual) {
            this.clear();
            for (let i = 0; i < this.element.children.length; i++) {
                const item = this.element.children[i];
                let svg;
                if (SVG.svg(item)) {
                    svg = new squared.svg.Svg(item, false);
                    this.setAspectRatio(svg, item);
                }
                else if (SVG.g(item)) {
                    svg = new squared.svg.SvgG(item);
                    this.setAspectRatio(svg);
                }
                else if (SVG.use(item)) {
                    const target = getTargetElement(item, item.parentElement);
                    if (target) {
                        if (SVG.symbol(target)) {
                            svg = new squared.svg.SvgUseSymbol(item, target);
                            this.setAspectRatio(svg, target);
                        }
                        else if (SVG.image(target)) {
                            svg = new squared.svg.SvgImage(item, target);
                        }
                        else if (SVG.shape(target)) {
                            svg = new squared.svg.SvgUse(item, target);
                        }
                    }
                }
                else if (SVG.image(item)) {
                    svg = new squared.svg.SvgImage(item);
                }
                else if (SVG.shape(item)) {
                    svg = new squared.svg.SvgShape(item);
                }
                if (svg) {
                    this.append(svg);
                    svg.build(exclusions, residual);
                }
            }
        }
        synchronize(useKeyTime = false) {
            this.each(item => item.synchronize(useKeyTime));
        }
        refitX(value) {
            return value * this.aspectRatio.unit + this.aspectRatio.x;
        }
        refitY(value) {
            return value * this.aspectRatio.unit + this.aspectRatio.y;
        }
        refitSize(value) {
            return value * this.aspectRatio.unit;
        }
        refitPoints(values) {
            const aspectRatio = this.aspectRatio;
            for (const pt of values) {
                pt.x = pt.x * aspectRatio.unit + aspectRatio.x;
                pt.y = pt.y * aspectRatio.unit + aspectRatio.y;
                if (pt.rx !== undefined && pt.ry !== undefined) {
                    pt.rx *= aspectRatio.unit;
                    pt.ry *= aspectRatio.unit;
                }
            }
            return values;
        }
        setAspectRatio(svg, element) {
            const parent = SvgBuild.getContainerViewBox(this);
            if (parent) {
                const aspectRatio = svg.aspectRatio;
                if (element) {
                    const viewBox = element.viewBox.baseVal;
                    if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
                        const ratio = viewBox.width / viewBox.height;
                        const outerViewBox = parent.viewBox;
                        const outerRatio = outerViewBox.width / outerViewBox.height;
                        if (outerRatio > ratio) {
                            aspectRatio.x = (outerViewBox.width - (outerViewBox.height * viewBox.width / viewBox.height)) / 2;
                        }
                        else if (outerRatio < ratio) {
                            aspectRatio.y = (outerViewBox.height - (outerViewBox.width * viewBox.height / viewBox.width)) / 2;
                        }
                        aspectRatio.unit = Math.min(outerViewBox.width / viewBox.width, outerViewBox.height / viewBox.height);
                    }
                }
                aspectRatio.x *= parent.aspectRatio.unit;
                aspectRatio.x += parent.aspectRatio.x;
                aspectRatio.y *= parent.aspectRatio.unit;
                aspectRatio.y += parent.aspectRatio.y;
                aspectRatio.unit *= parent.aspectRatio.unit;
            }
        }
    }

    const $color$2 = squared.lib.color;
    const $dom$6 = squared.lib.dom;
    function getColorStop(element) {
        const result = [];
        Array.from(element.getElementsByTagName('stop')).forEach(item => {
            const color = $color$2.parseRGBA($dom$6.cssAttribute(item, 'stop-color'), $dom$6.cssAttribute(item, 'stop-opacity'));
            if (color) {
                result.push({
                    color: color.valueRGBA,
                    offset: $dom$6.cssAttribute(item, 'offset'),
                    opacity: color.alpha
                });
            }
        });
        return result;
    }
    function getBaseValue(element, ...attrs) {
        const result = {};
        for (const attr of attrs) {
            if (element[attr]) {
                result[attr] = element[attr].baseVal.value;
                result[`${attr}AsString`] = element[attr].baseVal.valueAsString;
            }
        }
        return result;
    }
    class Svg extends SvgSynchronize$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer)))) {
        constructor(element, documentRoot = true) {
            super(element);
            this.element = element;
            this.documentRoot = documentRoot;
            this.patterns = {
                clipPath: new Map(),
                gradient: new Map()
            };
            this.init();
        }
        build(exclusions, residual) {
            this.setRect();
            super.build(exclusions, residual);
        }
        synchronize(useKeyTime = false) {
            if (!this.documentRoot && this.animation.length) {
                this.mergeAnimate(this.getAnimateViewRect(), useKeyTime);
            }
            super.synchronize(useKeyTime);
        }
        init() {
            [this.element, ...Array.from(this.element.querySelectorAll('defs'))].forEach(item => {
                item.querySelectorAll(':scope > set, :scope > animate, :scope > animateTransform, :scope > animateMotion').forEach((animation) => {
                    const target = getTargetElement(animation, this.element);
                    if (target) {
                        if (animation.parentElement) {
                            animation.parentElement.removeChild(animation);
                        }
                        target.appendChild(animation);
                    }
                });
                item.querySelectorAll('clipPath, linearGradient, radialGradient').forEach((pattern) => {
                    if (pattern.id) {
                        const id = `#${pattern.id}`;
                        if (SVG.clipPath(pattern)) {
                            this.patterns.clipPath.set(id, pattern);
                        }
                        else if (SVG.linearGradient(pattern)) {
                            this.patterns.gradient.set(id, Object.assign({ element: pattern, type: 'linear', colorStop: getColorStop(pattern) }, getBaseValue(pattern, 'x1', 'x2', 'y1', 'y2')));
                        }
                        else if (SVG.radialGradient(pattern)) {
                            this.patterns.gradient.set(id, Object.assign({ element: pattern, type: 'radial', colorStop: getColorStop(pattern) }, getBaseValue(pattern, 'cx', 'cy', 'r', 'fx', 'fy')));
                        }
                    }
                });
            });
        }
        get viewBox() {
            return this.element.viewBox.baseVal;
        }
    }

    class SvgG extends SvgPaint$MX(SvgView$MX(SvgContainer)) {
        constructor(element) {
            super(element);
            this.element = element;
            this.setPaint();
        }
    }

    const $util$8 = squared.lib.util;
    class SvgImage extends SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgElement))) {
        constructor(element, imageElement) {
            super(element);
            this.element = element;
            this.imageElement = null;
            if (imageElement) {
                this.imageElement = imageElement;
            }
        }
        build() {
            this.setRect();
        }
        extract(exclude) {
            const transform = SvgBuild.filterTransforms(this.transform, exclude);
            let x = this.x;
            let y = this.y;
            let width = this.width;
            let height = this.height;
            if (transform.length) {
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
                                if (this.rotateOrigin) {
                                    this.rotateOrigin.angle = (this.rotateOrigin.angle || 0) + item.angle;
                                }
                                else {
                                    this.rotateOrigin = { angle: item.angle, x: 0, y: 0 };
                                }
                            }
                            break;
                    }
                }
                this.transformed = transform;
            }
            if (this.parent) {
                x = this.parent.refitX(x);
                y = this.parent.refitY(y);
                width = this.parent.refitSize(width);
                height = this.parent.refitSize(height);
            }
            if (this.translationOffset) {
                x += this.translationOffset.x;
                y += this.translationOffset.y;
            }
            this.setBaseValue('x', x);
            this.setBaseValue('y', y);
            this.setBaseValue('width', width);
            this.setBaseValue('height', height);
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
            if (SVG.image(element)) {
                element.href.baseVal = value;
            }
        }
        get href() {
            const element = this.imageElement || this.element;
            if (SVG.image(element)) {
                return $util$8.resolvePath(element.href.baseVal);
            }
            return '';
        }
    }

    class SvgShape extends SvgSynchronize$MX(SvgView$MX(SvgElement)) {
        constructor(element) {
            super(element);
            this.element = element;
            this.setType();
        }
        setType(element) {
            this.type = SHAPES[(element || this.element).tagName] || 0;
        }
        build(exclusions, residual) {
            let path;
            if (this._path === undefined) {
                path = new SvgPath(this.element);
                this.path = path;
            }
            else {
                path = this._path;
            }
            const transform = this.transform.slice(0);
            if (this.element !== path.element) {
                transform.push(...path.transform);
            }
            path.draw(SvgBuild.filterTransforms(transform, exclusions ? exclusions[path.element.tagName] : undefined), residual);
        }
        synchronize(useKeyTime = false) {
            if (this.path && this.animation.length) {
                this.mergeAnimate(this.getAnimateShape(), useKeyTime, this.path);
            }
        }
        set path(value) {
            this._path = value;
            if (value) {
                value.parent = this.parent;
                value.name = this.name;
            }
        }
        get path() {
            return this._path;
        }
    }

    class SvgUse extends SvgPaint$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgShape))) {
        constructor(element, shapeElement) {
            super(element);
            this.element = element;
            this.shapeElement = shapeElement;
            this.setPaint();
            this.setShape(shapeElement);
        }
        setShape(value) {
            this.shapeElement = value;
            this.setType(value);
            this.path = undefined;
        }
        build(exclusions, residual) {
            if (this.path === undefined) {
                this.path = new SvgPath(this.shapeElement, this.element);
            }
            super.build(exclusions, residual);
        }
        synchronize(useKeyTime = false) {
            if (this.animation.length) {
                this.mergeAnimate(this.getAnimateViewRect(), useKeyTime);
            }
            super.synchronize(useKeyTime);
        }
        set href(value) {
            if (value.charAt(0) === '#') {
                const target = document.getElementById(value.substring(1));
                if (target && SVG.shape(target)) {
                    this.setShape(target);
                    this.element.href.baseVal = value;
                }
            }
        }
        get href() {
            return this.element.href.baseVal;
        }
    }

    class SvgUseSymbol extends SvgPaint$MX(SvgSynchronize$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer))))) {
        constructor(element, symbolElement) {
            super(element);
            this.element = element;
            this.symbolElement = symbolElement;
            this.setPaint();
        }
        build(exclusions, residual) {
            this.setRect();
            const element = this.element;
            this.element = this.symbolElement;
            super.build(exclusions, residual);
            this.each((item) => {
                if (item.path) {
                    item.path.parentElement = element;
                    item.path.setPaint();
                }
            });
            this.element = element;
            const x = this.getBaseValue('x');
            const y = this.getBaseValue('y');
            if (x !== 0 || y !== 0) {
                const pt = { x, y };
                this.cascade().forEach(item => item.translationOffset = pt);
            }
        }
        synchronize(useKeyTime = false) {
            if (this.animation.length) {
                this.mergeAnimate(this.getAnimateViewRect(), useKeyTime);
            }
            super.synchronize(useKeyTime);
        }
        get viewBox() {
            return this.symbolElement.viewBox.baseVal;
        }
    }

    const lib = {
        constant,
        util
    };

    exports.Svg = Svg;
    exports.SvgAnimate = SvgAnimate;
    exports.SvgAnimateMotion = SvgAnimateMotion;
    exports.SvgAnimateTransform = SvgAnimateTransform;
    exports.SvgAnimation = SvgAnimation;
    exports.SvgBaseVal = SvgBaseVal$MX;
    exports.SvgBuild = SvgBuild;
    exports.SvgContainer = SvgContainer;
    exports.SvgElement = SvgElement;
    exports.SvgG = SvgG;
    exports.SvgImage = SvgImage;
    exports.SvgPaint = SvgPaint$MX;
    exports.SvgPath = SvgPath;
    exports.SvgShape = SvgShape;
    exports.SvgSynchronize = SvgSynchronize$MX;
    exports.SvgUse = SvgUse;
    exports.SvgUseSymbol = SvgUseSymbol;
    exports.SvgView = SvgView$MX;
    exports.SvgViewRect = SvgViewRect$MX;
    exports.lib = lib;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
