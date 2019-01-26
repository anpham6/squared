/* squared.svg 0.5.1
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
    const REGEXP_SVG = {
        URL: /url\("?(#.*?)"?\)/,
        ZERO_ONE: '(0(?:\\.\\d+)?|1(?:\\.0+)?)',
        DECIMAL: '(-?[\\d.]+)',
        LENGTH: '(-?[\\d.]+(?:[a-z]{2,}|%)?)',
        DEGREE: '(?:(-?[\\d.]+)(deg|rad|turn))'
    };
    const REGEXP_TRANSFORM = {
        MATRIX: `(matrix(?:3d)?)\\(${REGEXP_SVG.DECIMAL}, ${REGEXP_SVG.DECIMAL}, ${REGEXP_SVG.DECIMAL}, ${REGEXP_SVG.DECIMAL}, ${REGEXP_SVG.DECIMAL}, ${REGEXP_SVG.DECIMAL}(?:, ${REGEXP_SVG.DECIMAL})?(?:, ${REGEXP_SVG.DECIMAL})?(?:, ${REGEXP_SVG.DECIMAL})?(?:, ${REGEXP_SVG.DECIMAL})?(?:, ${REGEXP_SVG.DECIMAL})?(?:, ${REGEXP_SVG.DECIMAL})?(?:, ${REGEXP_SVG.DECIMAL})?(?:, ${REGEXP_SVG.DECIMAL})?(?:, ${REGEXP_SVG.DECIMAL})?(?:, ${REGEXP_SVG.DECIMAL})?\\)`,
        ROTATE: `(rotate[XY]?)\\(${REGEXP_SVG.DEGREE}\\)`,
        SKEW: `(skew[XY]?)\\(${REGEXP_SVG.DEGREE}(?:, ${REGEXP_SVG.DEGREE})?\\)`,
        SCALE: `(scale[XY]?)\\(${REGEXP_SVG.DECIMAL}(?:, ${REGEXP_SVG.DECIMAL})?\\)`,
        TRANSLATE: `(translate[XY]?)\\(${REGEXP_SVG.LENGTH}(?:, ${REGEXP_SVG.LENGTH})?\\)`
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
            return element.tagName === 'svg';
        },
        g: (element) => {
            return element.tagName === 'g';
        },
        symbol: (element) => {
            return element.tagName === 'symbol';
        },
        path: (element) => {
            return element.tagName === 'path';
        },
        shape: (element) => {
            return SHAPES[element.tagName] !== undefined;
        },
        image: (element) => {
            return element.tagName === 'image';
        },
        use: (element) => {
            return element.tagName === 'use';
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
        pattern: (element) => {
            return element.tagName === 'pattern';
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
    function getTargetElement(element, rootElement) {
        const href = element.attributes.getNamedItem('href');
        if (href && href.value.charAt(0) === '#') {
            const id = href.value.substring(1);
            let parent;
            if (rootElement === undefined) {
                parent = element.parentElement;
                while (parent && parent.parentElement instanceof SVGGraphicsElement) {
                    parent = parent.parentElement;
                }
            }
            else {
                parent = rootElement;
            }
            if (parent) {
                for (const target of Array.from(parent.querySelectorAll('*'))) {
                    if (target.id === id && target instanceof SVGElement) {
                        return target;
                    }
                }
            }
            else {
                const target = document.getElementById(id);
                if (target instanceof SVGElement) {
                    return target;
                }
            }
        }
        return null;
    }
    function getNearestViewBox(element) {
        let current = element.parentElement;
        while (current && current instanceof SVGElement) {
            if (SVG.svg(current) || SVG.symbol(current) && current.viewBox && current.viewBox.baseVal.width > 0 && current.viewBox.baseVal.height > 0) {
                return current.viewBox.baseVal;
            }
            current = current.parentElement;
        }
        return undefined;
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
            const viewBox = getNearestViewBox(element);
            let width;
            let height;
            if (viewBox) {
                width = viewBox.width;
                height = viewBox.height;
            }
            else {
                const parent = element.parentElement;
                if (parent instanceof SVGGraphicsElement && parent.viewportElement && (SVG.svg(parent.viewportElement) || SVG.symbol(parent.viewportElement)) && parent.viewportElement.viewBox) {
                    width = parent.viewportElement.viewBox.baseVal.width;
                    height = parent.viewportElement.viewBox.baseVal.height;
                }
            }
            if (!width || !height) {
                const bounds = element.getBoundingClientRect();
                if (!width) {
                    width = bounds.width;
                }
                if (!height) {
                    height = bounds.height;
                }
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
            let match;
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
        REGEXP_SVG: REGEXP_SVG,
        getHostDPI: getHostDPI,
        getFontSize: getFontSize,
        createElement: createElement,
        convertClockTime: convertClockTime,
        SVG: SVG,
        isVisible: isVisible,
        setVisible: setVisible,
        setOpacity: setOpacity,
        getTargetElement: getTargetElement,
        getNearestViewBox: getNearestViewBox,
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
        static asContainer(object) {
            return $util$1.hasBit(object.instanceType, 2 /* SVG_CONTAINER */);
        }
        static asElement(object) {
            return $util$1.hasBit(object.instanceType, 4 /* SVG_ELEMENT */);
        }
        static asSvg(object) {
            return object.instanceType === 18 /* SVG */;
        }
        static asG(object) {
            return object.instanceType === 34 /* SVG_G */;
        }
        static asUseSymbol(object) {
            return object.instanceType === 66 /* SVG_USE_SYMBOL */;
        }
        static asPattern(object) {
            return object.instanceType === 130 /* SVG_PATTERN */;
        }
        static asShapePattern(object) {
            return object.instanceType === 258 /* SVG_SHAPE_PATTERN */;
        }
        static asUsePattern(object) {
            return object.instanceType === 514 /* SVG_USE_PATTERN */;
        }
        static asShape(object) {
            return $util$1.hasBit(object.instanceType, 2052 /* SVG_SHAPE */);
        }
        static asImage(object) {
            return object.instanceType === 4100 /* SVG_IMAGE */;
        }
        static asUse(object) {
            return object.instanceType === 10244 /* SVG_USE */;
        }
        static asSet(object) {
            return object.instanceType === 8 /* SVG_ANIMATION */;
        }
        static asAnimation(object) {
            return $util$1.hasBit(object.instanceType, 8 /* SVG_ANIMATION */);
        }
        static asAnimationAnimate(object) {
            return $util$1.hasBit(object.instanceType, 16392 /* SVG_ANIMATE */);
        }
        static asAnimate(object) {
            return object.instanceType === 16392 /* SVG_ANIMATE */;
        }
        static asAnimateMotion(object) {
            return object.instanceType === 49160 /* SVG_ANIMATE_MOTION */;
        }
        static asAnimateTransform(object) {
            return object.instanceType === 81928 /* SVG_ANIMATE_TRANSFORM */;
        }
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
        static getLine(x1, y1, x2 = 0, y2 = 0) {
            return `M${x1},${y1} L${x2},${y2}`;
        }
        static getCircle(cx, cy, r) {
            return SvgBuild.getEllipse(cx, cy, r);
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
            const value = SvgBuild.getPolyline(points);
            return value !== '' ? value + ' Z' : '';
        }
        static getPolyline(points) {
            return points.length ? `M${points.map(pt => `${pt.x},${pt.y}`).join(' ')}` : '';
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
                const m = item.matrix;
                let x1 = 0;
                let y1 = 0;
                let x2 = 0;
                let y2 = 0;
                if (origin) {
                    switch (item.type) {
                        case SVGTransform.SVG_TRANSFORM_SCALE:
                            if (item.method.x) {
                                x2 = origin.x * (1 - m.a);
                            }
                            if (item.method.y) {
                                y2 = origin.y * (1 - m.d);
                            }
                            break;
                        case SVGTransform.SVG_TRANSFORM_SKEWX:
                            if (item.method.y) {
                                y1 -= origin.y;
                            }
                            break;
                        case SVGTransform.SVG_TRANSFORM_SKEWY:
                            if (item.method.x) {
                                x1 -= origin.x;
                            }
                            break;
                        case SVGTransform.SVG_TRANSFORM_ROTATE:
                            if (item.method.x) {
                                x1 -= origin.x;
                                x2 = origin.x + getRadiusY(item.angle, origin.x);
                            }
                            if (item.method.y) {
                                y1 -= origin.y;
                                y2 = origin.y + getRadiusY(item.angle, origin.y);
                            }
                            break;
                    }
                }
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
                    pt.x = applyMatrixX(m, x, pt.y + y1) + x2;
                    pt.y = applyMatrixY(m, x + x1, pt.y) + y2;
                    if (item.type === SVGTransform.SVG_TRANSFORM_SCALE && pt.rx !== undefined && pt.ry !== undefined) {
                        const rx = pt.rx;
                        pt.rx = applyMatrixX(m, rx, pt.ry + y1);
                        pt.ry = applyMatrixY(m, rx + x1, pt.ry);
                    }
                }
            }
            return result;
        }
        static getCenterPoint(values) {
            let minX = values[0].x;
            let minY = values[0].y;
            let maxX = minX;
            let maxY = minY;
            for (let i = 1; i < values.length; i++) {
                const pt = values[i];
                if (pt.x < minX) {
                    minX = pt.x;
                }
                else if (pt.x > maxX) {
                    maxX = pt.x;
                }
                if (pt.y < minY) {
                    minY = pt.y;
                }
                else if (pt.y > maxX) {
                    maxY = pt.y;
                }
            }
            return {
                x: (minX + maxX) / 2,
                y: (minY + maxY) / 2
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
            let match;
            while ((match = pattern.exec(value)) !== null) {
                const digit = parseFloat(match[0]);
                if (!isNaN(digit)) {
                    result.push(digit);
                }
            }
            return result;
        }
        static getPathBoxRect(values) {
            let top = Number.MAX_VALUE;
            let right = -Number.MAX_VALUE;
            let bottom = -Number.MAX_VALUE;
            let left = Number.MAX_VALUE;
            for (const value of values) {
                const points = SvgBuild.getPathPoints(SvgBuild.toPathCommandList(value), true);
                for (const pt of points) {
                    if (pt.y < top) {
                        top = pt.y;
                    }
                    else if (pt.y > bottom) {
                        bottom = pt.y;
                    }
                    if (pt.x < left) {
                        left = pt.x;
                    }
                    else if (pt.x > right) {
                        right = pt.x;
                    }
                }
            }
            return { top, right, bottom, left };
        }
        static getPathPoints(values, includeRadius = false) {
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
                        if (includeRadius) {
                            if (item.coordinates[j] >= 0) {
                                pt.y -= item.radiusY;
                            }
                            else {
                                pt.y += item.radiusY;
                            }
                        }
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
                    if (this.validateBaseValueType(attr, value)) {
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
            refitBaseValue(x, y, scaleX = 1, scaleY = 1) {
                function setPoints(values) {
                    for (const pt of values) {
                        pt.x += x;
                        pt.y += y;
                        if (pt.rx !== undefined && pt.ry !== undefined) {
                            pt.rx *= scaleX;
                            pt.ry *= scaleY;
                        }
                    }
                }
                for (const attr in this._baseVal) {
                    const value = this._baseVal[attr];
                    if (typeof value === 'string') {
                        if (attr === 'd') {
                            const commands = SvgBuild.toPathCommandList(value);
                            const points = SvgBuild.getPathPoints(commands);
                            setPoints(points);
                            this._baseVal[attr] = SvgBuild.fromPathCommandList(SvgBuild.rebindPathPoints(commands, points));
                        }
                    }
                    else if (typeof value === 'number') {
                        switch (attr) {
                            case 'cx':
                            case 'x1':
                            case 'x2':
                            case 'x':
                                this._baseVal[attr] += x;
                                break;
                            case 'cy':
                            case 'y1':
                            case 'y2':
                            case 'y':
                                this._baseVal[attr] += y;
                            case 'r':
                                this._baseVal[attr] *= Math.min(scaleX, scaleY);
                                break;
                            case 'rx':
                            case 'width':
                                this._baseVal[attr] *= scaleX;
                                break;
                            case 'height':
                            case 'ry':
                                this._baseVal[attr] *= scaleY;
                                break;
                        }
                    }
                    else if (Array.isArray(value)) {
                        if (attr === 'points') {
                            setPoints(value);
                        }
                    }
                }
            }
            validateBaseValueType(attr, value) {
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
                return undefined;
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
                if (dur !== '' && dur !== 'indefinite') {
                    this.duration = convertClockTime(dur);
                }
            }
        }
        setAttribute(attr, equality) {
            const value = this.getAttribute(attr);
            if (value !== '') {
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
        set delay(value) {
            this.begin[0] = value;
        }
        get delay() {
            return this.begin[0] || 0;
        }
        get instanceType() {
            return 8 /* SVG_ANIMATION */;
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
            this.repeatDuration = -1;
            this.additiveSum = false;
            this.accumulateSum = false;
            this.fillMode = 0;
            this.alternate = false;
            this._repeatCount = 1;
            this._reverse = false;
            if (element) {
                if (this.attributeName === 'transform') {
                    this.fromBaseValue = getTransformInitialValue(this.getAttribute('type'));
                }
                else if (element.parentElement) {
                    this.fromBaseValue = $util$3.optionalAsString(element.parentElement, `${this.attributeName}.baseVal.value`) || $dom$2.cssAttribute(element.parentElement, this.attributeName);
                }
                const values = this.getAttribute('values');
                if (values !== '') {
                    const keyTimes = this.getAttribute('keyTimes');
                    if (keyTimes !== '') {
                        this.values = $util$3.flatMap(values.split(';'), value => value.trim());
                        this.keyTimes = SvgAnimate.toFractionList(keyTimes);
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
                }
                else {
                    this.from = this.getAttribute('from');
                    if (this.to !== '') {
                        if (this.from !== '') {
                            this.setAttribute('additive', 'sum');
                            if (this.additiveSum) {
                                this.setAttribute('accumulate', 'sum');
                            }
                        }
                    }
                    else {
                        const by = this.getAttribute('by');
                        if ($util$3.isNumber(by)) {
                            if (this.from === '' && this.fromBaseValue) {
                                this.from = this.fromBaseValue;
                            }
                            if ($util$3.isNumber(this.from)) {
                                this.to = (parseFloat(this.from) + parseFloat(by)).toString();
                            }
                        }
                    }
                }
                const repeatDur = this.getAttribute('repeatDur');
                if (repeatDur !== '' && repeatDur !== 'indefinite') {
                    this.repeatDuration = convertClockTime(repeatDur);
                }
                if (!(this.duration !== -1 && this.repeatDuration !== -1 && this.repeatDuration < this.duration)) {
                    const repeatCount = this.getAttribute('repeatCount');
                    if (repeatCount === 'indefinite') {
                        this.repeatCount = -1;
                    }
                    else {
                        this.repeatCount = parseFloat(repeatCount);
                    }
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
                if ((this.values === undefined || this.values.length === 0) && this.from !== '' && this.to !== '') {
                    this.values = [this.from, this.to];
                    this.keyTimes = [0, 1];
                }
            }
            if (this.values === undefined) {
                this.values = [];
                this.keyTimes = [];
            }
        }
        static toStepFractionList(name, spline, index, keyTimes, values, dpi = 96, fontSize = 16) {
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
                    currentValue = values[index].trim().split(/\s+/).map(value => parseFloat(value));
                    nextValue = values[index + 1].trim().split(/\s+/).map(value => parseFloat(value));
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
                switch (spline) {
                    case 'steps-start':
                        spline = 'steps(1, start)';
                        break;
                    case 'steps-end':
                        spline = 'steps(1, end)';
                        break;
                }
                const match = /steps\((\d+)(?:, (start|end))?\)/.exec(spline);
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
                else if (this._repeatCount !== -1 && this.repeatDuration !== -1 && this._repeatCount * duration <= this.repeatDuration) {
                    return this._repeatCount;
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
            return this.keyTimes.length === 2 && this.keyTimes[0] === 0 && this.keyTimes[1] === 1;
        }
        get instanceType() {
            return 16392 /* SVG_ANIMATE */;
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
                    if (segment.length === 1) {
                        return [segment[0], 0, 0];
                    }
                    else if (segment.length === 3) {
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
            let y = 0;
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
            return 81928 /* SVG_ANIMATE_TRANSFORM */;
        }
    }

    const $util$4 = squared.lib.util;
    function insertSplitTimeValue(map, insertMap, time) {
        let previous;
        let next;
        for (const [ordinal, value] of map.entries()) {
            if (previous && time <= ordinal) {
                next = { ordinal, value };
                break;
            }
            if (time >= ordinal) {
                previous = { ordinal, value };
            }
        }
        if (previous && next) {
            const value = getSplitValue$1(time, previous.ordinal, next.ordinal, previous.value, next.value);
            insertMap.set(time, value);
        }
        else if (previous) {
            insertMap.set(time, previous.value);
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
                let value = data.get(attr);
                if (value !== undefined) {
                    values.push(value);
                }
                else if (freezeMap && freezeMap[attr]) {
                    values.push(freezeMap[attr].value);
                }
                else {
                    value = path.getBaseValue(attr);
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
                            value = SvgBuild.getPolyline(points);
                            break;
                        case 'rect':
                        case 'polygon':
                            value = SvgBuild.getPolygon(points);
                            break;
                        case 'circle':
                        case 'ellipse':
                            const pt = points[0];
                            value = SvgBuild.getEllipse(pt.x, pt.y, pt.rx, pt.ry);
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
        return !SvgBuild.asSet(item) && !item.paused && item.begin.length > 0 && item.keyTimes.length > 1 && item.duration > 0;
    }
    function getDuration(item) {
        return item.repeatCount !== -1 ? item.duration * item.repeatCount : Number.MAX_VALUE;
    }
    function getGroupDuration(item) {
        return item.duration * (item.repeatCount !== -1 ? item.repeatCount : 1);
    }
    var SvgSynchronize$MX = (Base) => {
        return class extends Base {
            getAnimateShape(element, animation) {
                const result = [];
                for (const item of animation) {
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
            getAnimateViewRect(animation) {
                const result = [];
                for (const item of animation) {
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
                    const minDelay = $util$4.minArray(animationsCSS.map(item => item.delay));
                    const maxDuration = $util$4.maxArray(animationsCSS.map(item => getDuration(item)));
                    const fillBackwards = animationsCSS.filter(item => $util$4.hasBit(item.fillMode, 2 /* BACKWARDS */));
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
                                    const duration = $util$4.maxArray(group.items.map(item => getGroupDuration(item)));
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
                        let actualTime;
                        if (begin < 0) {
                            actualTime = splitTime - begin;
                            begin = 0;
                        }
                        else {
                            actualTime = splitTime;
                        }
                        if (actualTime + 1 % 1000) {
                            actualTime++;
                        }
                        const fraction = (actualTime - (begin + item.duration * iteration)) / item.duration;
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
                                if ($util$4.hasBit(animate.fillMode, 4 /* FORWARDS */)) {
                                    forwardMap[attr] = true;
                                    animationsCSS = animationsCSS.filter(item => item.attributeName !== attr);
                                    return animationsCSS.length === 0 ? 2 : 1;
                                }
                                else if ($util$4.hasBit(animate.fillMode, 8 /* FREEZE */)) {
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
                                        groupBegin.unshift(item.delay);
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
                                                    const groupDuration = $util$4.maxArray(groupCSS.map(animate => getGroupDuration(animate)));
                                                    minRestartTime = Math.max(minRestartTime, groupBegin[j] + groupDuration);
                                                }
                                            }
                                        }
                                        const maxThreadTime = Math.min(nextBeginTime || Number.MAX_VALUE, item.end || Number.MAX_VALUE, item.repeatDuration !== -1 && item.repeatDuration < duration ? item.repeatDuration : Number.MAX_VALUE);
                                        let lastValue;
                                        let complete = false;
                                        if (maxThreadTime > maxTime) {
                                            complete = true;
                                            let parallel = maxTime !== -1;
                                            threadTimeExceeded: {
                                                for (let k = Math.floor(Math.max(0, Math.max(0, maxTime) - begin) / duration); k < repeatTotal; k++) {
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
                                                            if (time < 0) {
                                                                continue;
                                                            }
                                                            if (time === maxThreadTime) {
                                                                complete = k === repeatTotal - 1 && l === item.keyTimes.length - 1;
                                                            }
                                                            else {
                                                                function adjustNumberValue(splitTime) {
                                                                    [maxTime, lastValue] = insertSplitKeyTimeValue(repeatingMap[attr], repeatingInterpolatorMap, item, baseValue, begin, k, splitTime, !parallel && splitTime === groupBegin[i + 1] && !repeatingMap[attr].has(splitTime - 1) ? -1 : 0);
                                                                }
                                                                if (begin < 0 && maxTime === -1) {
                                                                    if (time > 0) {
                                                                        adjustNumberValue(0);
                                                                    }
                                                                }
                                                                else {
                                                                    if (time > maxThreadTime) {
                                                                        parallel = false;
                                                                        adjustNumberValue(maxThreadTime);
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
                                                                                    adjustNumberValue(maxTime);
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
                                                                            time = Math.max(time, maxTime + 1);
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        if (time > maxTime) {
                                                            if (l === item.keyTimes.length - 1 && (k < repeatTotal - 1 || incomplete.length === 0 && item.fillMode < 4 /* FORWARDS */) && !repeatingMap[attr].has(time - 1)) {
                                                                time--;
                                                            }
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
                                                    let time = getItemTime(begin, duration, item.keyTimes, j, k);
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
                                                            if (k === item.keyTimes.length - 1 && time < maxThreadTime && !repeatingMap[attr].has(time - 1)) {
                                                                time--;
                                                            }
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
                        let repeatingEndTime = $util$4.maxArray(keyTimesRepeating);
                        if (Object.keys(indefiniteMap).length) {
                            const begin = [];
                            const duration = [];
                            for (const attr in indefiniteMap) {
                                begin.push(indefiniteMap[attr].ordinal);
                                duration.push(indefiniteMap[attr].value.duration);
                            }
                            if (duration.length > 1) {
                                repeatingEndTime = getLeastCommonMultiple(duration, repeatingEndTime, begin);
                            }
                            else if (repeatingEndTime - begin[0] % duration[0] !== 0) {
                                repeatingEndTime = duration[0] * Math.ceil(repeatingEndTime / duration[0]);
                            }
                        }
                        for (const attr in repeatingMap) {
                            const insertMap = repeatingMap[attr];
                            let maxTime = $util$4.maxArray(Array.from(insertMap.keys()));
                            if (indefiniteMap[attr] && maxTime < repeatingEndTime) {
                                const begin = indefiniteMap[attr].ordinal;
                                const item = indefiniteMap[attr].value;
                                let baseValue = Array.from(insertMap.values()).pop();
                                let i = Math.floor((maxTime - begin) / item.duration);
                                do {
                                    let joined = false;
                                    for (let j = 0; j < item.keyTimes.length; j++) {
                                        let time = getItemTime(begin, item.duration, item.keyTimes, i, j);
                                        if (!joined && time >= maxTime) {
                                            [maxTime, baseValue] = insertSplitKeyTimeValue(insertMap, repeatingInterpolatorMap, item, baseValue, begin, i, maxTime);
                                            keyTimesRepeating.push(maxTime);
                                            joined = true;
                                        }
                                        if (joined && time > maxTime) {
                                            if (j === item.keyTimes.length - 1 && time < repeatingEndTime && !insertMap[attr].has(time - 1)) {
                                                time--;
                                            }
                                            baseValue = getItemValue(item, j, baseValue, i);
                                            insertInterpolator(repeatingInterpolatorMap, time, item.keySplines, j);
                                            insertMap.set(time, baseValue);
                                            maxTime = time;
                                            keyTimesRepeating.push(maxTime);
                                        }
                                    }
                                } while (maxTime < repeatingEndTime && ++i);
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
                        const timelineMap = {};
                        for (const attr in repeatingMap) {
                            const insertMap = new Map();
                            const maxTime = Array.from(repeatingMap[attr].keys()).pop();
                            for (let i = 0; i < keyTimes.length; i++) {
                                const keyTime = keyTimes[i];
                                if (keyTime <= maxTime) {
                                    const value = repeatingMap[attr].get(keyTime);
                                    if (value === undefined) {
                                        insertSplitTimeValue(repeatingMap[attr], insertMap, keyTime);
                                    }
                                    else {
                                        insertMap.set(keyTime, value);
                                    }
                                }
                            }
                            timelineMap[attr] = insertMap;
                        }
                        repeatingResult = getKeyTimeMap(timelineMap, keyTimes, freezeMap);
                        repeatingDurationTotal = keyTimes[keyTimes.length - 1];
                        if (useKeyTime) {
                            repeatingResult = convertKeyTimeFraction(repeatingResult, repeatingDurationTotal);
                        }
                    }
                    if (Object.keys(indefiniteMap).length) {
                        const indefiniteArray = [];
                        const timelineMap = {};
                        let keyTimes = [];
                        for (const attr in indefiniteMap) {
                            indefiniteArray.push(indefiniteMap[attr].value);
                        }
                        indefiniteDurationTotal = getLeastCommonMultiple(indefiniteArray.map(item => item.duration));
                        for (const item of indefiniteArray) {
                            const attr = item.attributeName;
                            timelineMap[attr] = new Map();
                            let maxTime = 0;
                            let baseValue = repeatingMap[attr] ? Array.from(repeatingMap[attr].values()).pop() : getBaseValue(attr);
                            let i = 0;
                            do {
                                for (let j = 0; j < item.keyTimes.length; j++) {
                                    let time = getItemTime(0, item.duration, item.keyTimes, i, j);
                                    if (j === item.keyTimes.length - 1 && time < indefiniteDurationTotal && !timelineMap[attr].has(time - 1)) {
                                        time--;
                                    }
                                    baseValue = getItemValue(item, j, baseValue, i);
                                    insertInterpolator(indefiniteInterpolatorMap, time, item.keySplines, j);
                                    timelineMap[attr].set(time, baseValue);
                                    maxTime = time;
                                    keyTimes.push(time);
                                }
                            } while (maxTime < indefiniteDurationTotal && ++i);
                        }
                        if (indefiniteArray.every(item => item.alternate)) {
                            let maxTime = -1;
                            for (const attr in indefiniteMap) {
                                const times = Array.from(timelineMap[attr].keys());
                                const values = Array.from(timelineMap[attr].values()).reverse();
                                for (let i = 0; i < times.length; i++) {
                                    maxTime = indefiniteDurationTotal + times[i];
                                    const interpolator = indefiniteInterpolatorMap.get(times[i]);
                                    if (interpolator) {
                                        indefiniteInterpolatorMap.set(maxTime, interpolator);
                                    }
                                    timelineMap[attr].set(maxTime, values[i]);
                                    keyTimes.push(maxTime);
                                }
                            }
                            if (maxTime !== -1) {
                                indefiniteDurationTotal = maxTime;
                            }
                        }
                        keyTimes = sortNumber(Array.from(new Set(keyTimes)));
                        for (const attr in timelineMap) {
                            const baseMap = timelineMap[attr];
                            for (let i = 1; i < keyTimes.length; i++) {
                                const keyTime = keyTimes[i];
                                if (!baseMap.has(keyTime)) {
                                    insertSplitTimeValue(baseMap, baseMap, keyTime);
                                }
                            }
                        }
                        indefiniteResult = getKeyTimeMap(timelineMap, keyTimes);
                        if (useKeyTime) {
                            indefiniteResult = convertKeyTimeFraction(indefiniteResult, indefiniteDurationTotal);
                        }
                    }
                    if (repeatingResult || indefiniteResult) {
                        $util$4.retainArray(this.animation, (item) => !animations.includes(item));
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

    const $util$5 = squared.lib.util;
    class SvgAnimateMotion extends SvgAnimate {
        constructor(element) {
            super(element);
            this.element = element;
            this.path = '';
            this.mpath = null;
            this.rotate = 0;
            this.rotateAuto = false;
            this.rotateAutoReverse = false;
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
                        this.rotate = $util$5.convertInt(rotate);
                        break;
                }
                if (this.keyTimes.length) {
                    const keyPoints = this.getAttribute('keyPoints');
                    if (keyPoints !== '') {
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
            return 49160 /* SVG_ANIMATE_MOTION */;
        }
    }

    const $dom$3 = squared.lib.dom;
    const $util$6 = squared.lib.util;
    const KEYFRAME_NAME = $dom$3.getKeyframeRules();
    const ANIMATION_DEFAULT = {
        'animation-delay': '0s',
        'animation-duration': '0s',
        'animation-iteration-count': '1',
        'animation-play-state': 'running',
        'animation-direction': 'normal',
        'animation-fill-mode': 'none',
        'animation-timing-function': 'ease'
    };
    const REGEXP_CUBICBEZIER = new RegExp(`cubic-bezier\\(${REGEXP_SVG.ZERO_ONE}, ${REGEXP_SVG.DECIMAL}, ${REGEXP_SVG.ZERO_ONE}, ${REGEXP_SVG.DECIMAL}\\)`);
    function parseAttribute(element, attr) {
        let value = $dom$3.cssAttribute(element, attr);
        if (attr === 'animation-timing-function') {
            const result = [];
            while (value !== '') {
                let index = value.indexOf(',');
                if (index !== -1) {
                    let segment = value.substring(0, index);
                    if (segment.startsWith('steps') || segment.startsWith('cubic-bezier')) {
                        const nextIndex = value.indexOf(')', index) + 1;
                        segment += value.substring(index, nextIndex);
                        index = nextIndex;
                    }
                    result.push(segment);
                    value = value.substring(index + 1).trim();
                }
                else {
                    result.push(value);
                    break;
                }
            }
            return result;
        }
        else {
            return $util$6.flatMap(value.split(/,/), item => item.trim());
        }
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
            getTransforms(companion) {
                const element = companion || this.element;
                return getTransform(element) || SvgBuild.convertTransformList(element.transform.baseVal);
            }
            getAnimations(companion) {
                const element = companion || this.element;
                const result = [];
                const animationName = parseAttribute(element, 'animation-name');
                if (animationName.length) {
                    const cssData = {};
                    for (const name in ANIMATION_DEFAULT) {
                        const values = parseAttribute(element, name);
                        if (values.length === 0) {
                            values.push(ANIMATION_DEFAULT[name]);
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
                                    const map = ANIMATION_DEFAULT[name] ? keyframeMap : attrMap;
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
                                    const origin = attrMap['transform-origin'] && attrMap['transform-origin'].find(item => item.ordinal === ordinal);
                                    if (origin) {
                                        return getTransformOrigin(element, origin.value);
                                    }
                                    return undefined;
                                }
                                for (const item of sortAttribute(attrMap['transform'])) {
                                    const transforms = getTransform(element, item.value);
                                    if (transforms) {
                                        const origin = getKeyframeOrigin(item.ordinal);
                                        transforms.forEach(transform => {
                                            const m = transform.matrix;
                                            let name;
                                            let value;
                                            let transformOrigin;
                                            switch (transform.type) {
                                                case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                                                    name = 'translate';
                                                    value = `${m.e} ${m.f}`;
                                                    break;
                                                case SVGTransform.SVG_TRANSFORM_SCALE:
                                                    name = 'scale';
                                                    value = `${m.a} ${m.d}`;
                                                    if (origin && (item.ordinal !== 0 || origin.x !== 0 || origin.y !== 0)) {
                                                        transformOrigin = {
                                                            x: origin.x * (1 - m.a),
                                                            y: origin.y * (1 - m.d)
                                                        };
                                                    }
                                                    break;
                                                case SVGTransform.SVG_TRANSFORM_ROTATE:
                                                    name = 'rotate';
                                                    value = `${transform.angle} ${origin ? `${origin.x} ${origin.y}` : '0 0'}`;
                                                    break;
                                                case SVGTransform.SVG_TRANSFORM_SKEWX:
                                                    name = 'skewX';
                                                    value = transform.angle.toString();
                                                    if (origin && (item.ordinal !== 0 || origin.y !== 0)) {
                                                        transformOrigin = {
                                                            x: origin.y * m.c * -1,
                                                            y: 0
                                                        };
                                                    }
                                                    break;
                                                case SVGTransform.SVG_TRANSFORM_SKEWY:
                                                    name = 'skewY';
                                                    value = transform.angle.toString();
                                                    if (origin && (item.ordinal !== 0 || origin.x !== 0)) {
                                                        transformOrigin = {
                                                            x: 0,
                                                            y: origin.x * m.b * -1,
                                                        };
                                                    }
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
                                                attrMap[name][previousIndex].transformOrigin = transformOrigin;
                                            }
                                            else {
                                                attrMap[name].push({
                                                    ordinal: item.ordinal,
                                                    value,
                                                    transformOrigin
                                                });
                                            }
                                        });
                                    }
                                }
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
                                        animate = new SvgAnimateTransform();
                                        animate.attributeName = 'transform';
                                        animate.fromBaseValue = getTransformInitialValue(name);
                                        animate.setType(name);
                                        break;
                                    default:
                                        animate = new SvgAnimate();
                                        animate.attributeName = name;
                                        animate.fromBaseValue = $util$6.optionalAsString(element, `${name}.baseVal.value`) || $dom$3.cssAttribute(element, name);
                                        break;
                                }
                                if (animation[0].ordinal !== 0) {
                                    animation.unshift({
                                        ordinal: 0,
                                        value: animate.fromBaseValue
                                    });
                                }
                                animate.paused = cssData['animation-play-state'][index] === 'paused';
                                animate.delay = convertClockTime(cssData['animation-delay'][index]);
                                animate.duration = convertClockTime(cssData['animation-duration'][index]);
                                const iterationCount = cssData['animation-iteration-count'][index];
                                const timingFunction = cssData['animation-timing-function'][index];
                                const direction = cssData['animation-direction'][index];
                                const fillMode = cssData['animation-fill-mode'][index];
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
                                    const transformOrigin = animation[i].transformOrigin;
                                    if (transformOrigin && animate instanceof SvgAnimateTransform) {
                                        if (animate.transformOrigin === undefined) {
                                            animate.transformOrigin = [];
                                        }
                                        animate.transformOrigin[i] = transformOrigin;
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
            set name(value) {
                this._name = value;
            }
            get name() {
                if (this._name === undefined) {
                    this._name = SvgBuild.setName(this.element);
                }
                return this._name;
            }
            get transform() {
                if (this._transform === undefined) {
                    this._transform = this.getTransforms();
                }
                return this._transform;
            }
            get animation() {
                if (this._animation === undefined) {
                    this._animation = this.getAnimations();
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
                return $dom$3.cssAttribute(this.element, 'opacity') || '1';
            }
        };
    };

    const $dom$4 = squared.lib.dom;
    function hasUnsupportedAccess(element) {
        const domElement = element.parentElement instanceof HTMLElement;
        return element.tagName === 'svg' && ($dom$4.isUserAgent(4 /* SAFARI */) && !domElement ||
            $dom$4.isUserAgent(16 /* FIREFOX */) && domElement);
    }
    var SvgViewRect$MX = (Base) => {
        return class extends Base {
            setRect() {
                let x = this.x;
                let y = this.y;
                let width = this.width;
                let height = this.height;
                const parent = this.parent;
                if (parent) {
                    x = parent.refitX(x);
                    y = parent.refitY(y);
                    width = parent.refitSize(width);
                    height = parent.refitSize(height);
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
                this._x = value;
            }
            get x() {
                if (this._x !== undefined) {
                    return this._x;
                }
                else {
                    const element = this.getElement();
                    if (element) {
                        return element.x.baseVal.value;
                    }
                    return 0;
                }
            }
            set y(value) {
                this._y = value;
            }
            get y() {
                if (this._y !== undefined) {
                    return this._y;
                }
                else {
                    const element = this.getElement();
                    if (element) {
                        return element.y.baseVal.value;
                    }
                    return 0;
                }
            }
            set width(value) {
                this._width = value;
            }
            get width() {
                if (this._width !== undefined) {
                    return this._width;
                }
                else {
                    const element = this.getElement();
                    if (element) {
                        if (hasUnsupportedAccess(element)) {
                            return element.getBoundingClientRect().width;
                        }
                        else {
                            return element.width.baseVal.value;
                        }
                    }
                    return 0;
                }
            }
            set height(value) {
                this._height = value;
            }
            get height() {
                if (this._height !== undefined) {
                    return this._height;
                }
                else {
                    const element = this.getElement();
                    if (element) {
                        if (hasUnsupportedAccess(element)) {
                            return element.getBoundingClientRect().height;
                        }
                        else {
                            return element.height.baseVal.value;
                        }
                    }
                    return 0;
                }
            }
        };
    };

    const $dom$5 = squared.lib.dom;
    function getNearestViewBox$1(instance) {
        while (instance) {
            if (SvgBuild.asSvg(instance) || SvgBuild.asUseSymbol(instance)) {
                return instance;
            }
            instance = instance.parent;
        }
        return undefined;
    }
    function getFillPattern(element, viewport) {
        if (viewport) {
            const value = $dom$5.cssInheritAttribute(element, 'fill');
            if (value !== '') {
                const match = REGEXP_SVG.URL.exec(value);
                if (match) {
                    return viewport.definitions.pattern.get(match[1]);
                }
            }
        }
        return undefined;
    }
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
        append(item, viewport) {
            item.parent = this;
            item.viewport = viewport || this.getViewport();
            return super.append(item);
        }
        build(exclusions, residual, element) {
            if (element === undefined) {
                element = this.element;
            }
            this.clear();
            const viewport = this.getViewport();
            for (let i = 0; i < element.children.length; i++) {
                const item = element.children[i];
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
                    const target = getTargetElement(item);
                    if (target) {
                        if (SVG.symbol(target)) {
                            svg = new squared.svg.SvgUseSymbol(item, target);
                            this.setAspectRatio(svg, target);
                        }
                        else if (SVG.image(target)) {
                            svg = new squared.svg.SvgImage(item, target);
                        }
                        else if (SVG.shape(target)) {
                            const pattern = getFillPattern(item, viewport);
                            if (pattern) {
                                svg = new squared.svg.SvgUsePattern(item, target, pattern);
                                this.setAspectRatio(svg);
                            }
                            else {
                                svg = new squared.svg.SvgUse(item, target);
                            }
                        }
                    }
                }
                else if (SVG.image(item)) {
                    svg = new squared.svg.SvgImage(item);
                }
                else if (SVG.shape(item)) {
                    const target = getFillPattern(item, viewport);
                    if (target) {
                        svg = new squared.svg.SvgShapePattern(item, target);
                        this.setAspectRatio(svg);
                    }
                    else {
                        svg = new squared.svg.SvgShape(item);
                    }
                }
                if (svg) {
                    this.append(svg, viewport);
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
        getPathAll() {
            const result = [];
            for (const item of this.cascade()) {
                if (SvgBuild.asShape(item) && item.path && item.path.value) {
                    result.push(item.path.value);
                }
            }
            return result;
        }
        getViewport() {
            return this.viewport || (SvgBuild.asSvg(this) ? this : undefined);
        }
        setAspectRatio(svg, element) {
            const parent = getNearestViewBox$1(this);
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
        get instanceType() {
            return 2 /* SVG_CONTAINER */;
        }
    }

    const $color$1 = squared.lib.color;
    const $dom$6 = squared.lib.dom;
    function getColorStop(element) {
        const result = [];
        Array.from(element.getElementsByTagName('stop')).forEach(item => {
            const color = $color$1.parseRGBA($dom$6.cssAttribute(item, 'stop-color'), $dom$6.cssAttribute(item, 'stop-opacity'));
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
            this.definitions = {
                clipPath: new Map(),
                pattern: new Map(),
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
                this.mergeAnimate(this.getAnimateViewRect(this.animation), useKeyTime);
            }
            super.synchronize(useKeyTime);
        }
        init() {
            [this.element, ...Array.from(this.element.querySelectorAll('defs'))].forEach(item => {
                item.querySelectorAll(':scope > set, :scope > animate, :scope > animateTransform, :scope > animateMotion').forEach((animation) => {
                    const target = getTargetElement(animation, this.documentRoot ? this.element : undefined);
                    if (target) {
                        if (animation.parentElement) {
                            animation.parentElement.removeChild(animation);
                        }
                        target.appendChild(animation);
                    }
                });
                item.querySelectorAll('clipPath, pattern, linearGradient, radialGradient').forEach((definition) => {
                    if (definition.id) {
                        const id = `#${definition.id}`;
                        if (SVG.clipPath(definition)) {
                            this.definitions.clipPath.set(id, definition);
                        }
                        else if (SVG.pattern(definition)) {
                            this.definitions.pattern.set(id, definition);
                        }
                        else if (SVG.linearGradient(definition)) {
                            this.definitions.gradient.set(id, Object.assign({ element: definition, type: 'linear', colorStop: getColorStop(definition) }, getBaseValue(definition, 'x1', 'x2', 'y1', 'y2')));
                        }
                        else if (SVG.radialGradient(definition)) {
                            this.definitions.gradient.set(id, Object.assign({ element: definition, type: 'radial', colorStop: getColorStop(definition) }, getBaseValue(definition, 'cx', 'cy', 'r', 'fx', 'fy')));
                        }
                    }
                });
            });
        }
        get viewBox() {
            if (this.element.viewBox.baseVal) {
                return this.element.viewBox.baseVal;
            }
            else {
                return $dom$6.getDOMRect(this.element);
            }
        }
        get instanceType() {
            return 18 /* SVG */;
        }
    }

    class SvgElement {
        constructor(element) {
            this.element = element;
        }
        build(exclusions, residual, element) { }
        synchronize(useKeyTime) { }
        get instanceType() {
            return 4 /* SVG_ELEMENT */;
        }
    }

    const $color$2 = squared.lib.color;
    const $dom$7 = squared.lib.dom;
    const $util$7 = squared.lib.util;
    const CLIPPATH_SHAPE = {
        url: REGEXP_SVG.URL,
        inset: new RegExp(`inset\\(${REGEXP_SVG.LENGTH}\\s?${REGEXP_SVG.LENGTH}?\\s?${REGEXP_SVG.LENGTH}?\\s?${REGEXP_SVG.LENGTH}?\\)`),
        polygon: /polygon\(([^)]+)\)/,
        circle: new RegExp(`circle\\(${REGEXP_SVG.LENGTH}(?: at ${REGEXP_SVG.LENGTH} ${REGEXP_SVG.LENGTH})?\\)`),
        ellipse: new RegExp(`ellipse\\(${REGEXP_SVG.LENGTH} ${REGEXP_SVG.LENGTH}(?: at ${REGEXP_SVG.LENGTH} ${REGEXP_SVG.LENGTH})?\\)`),
    };
    var SvgPaint$MX = (Base) => {
        return class extends Base {
            setPaint(d) {
                this.resetPaint();
                this.setAttribute('color', true);
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
                this.setAttribute('clip-rule');
                const clipPath = this.getAttribute('clip-path', false, false);
                if (clipPath !== '') {
                    for (const name in CLIPPATH_SHAPE) {
                        const match = CLIPPATH_SHAPE[name].exec(clipPath);
                        if (match) {
                            if (name === 'url') {
                                this.clipPath = match[1];
                                return;
                            }
                            else if (d && d.length) {
                                const dpi = getHostDPI();
                                const fontSize = getFontSize(this.element);
                                const boxRect = SvgBuild.getPathBoxRect(d);
                                const width = boxRect.right - boxRect.left;
                                const height = boxRect.bottom - boxRect.top;
                                const parent = this.parent;
                                function convertUnit(value, index) {
                                    return $dom$7.convertClientUnit(value, index === 0 ? width : height, dpi, fontSize);
                                }
                                switch (name) {
                                    case 'inset': {
                                        let x1 = 0;
                                        let x2 = 0;
                                        let y1 = convertUnit(match[1], 1);
                                        let y2 = 0;
                                        if (match[4]) {
                                            x1 = boxRect.left + convertUnit(match[4], 0);
                                            x2 = boxRect.right - convertUnit(match[2], 0);
                                            y2 = boxRect.bottom - convertUnit(match[3], 1);
                                        }
                                        else if (match[2]) {
                                            x1 = convertUnit(match[2], 0);
                                            x2 = boxRect.right - x1;
                                            y2 = boxRect.bottom - (match[3] ? convertUnit(match[3], 1) : y1);
                                            x1 += boxRect.left;
                                        }
                                        else {
                                            x1 = boxRect.left + y1;
                                            x2 = boxRect.right - y1;
                                            y2 = boxRect.bottom - y1;
                                        }
                                        y1 += boxRect.top;
                                        const points = [
                                            { x: x1, y: y1 },
                                            { x: x2, y: y1 },
                                            { x: x2, y: y2 },
                                            { x: x1, y: y2 }
                                        ];
                                        if (parent) {
                                            parent.refitPoints(points);
                                        }
                                        this.clipPath = SvgBuild.getPolygon(points);
                                        return;
                                    }
                                    case 'polygon': {
                                        const points = match[1].split(',').map(values => {
                                            let [x, y] = values.trim().split(' ').map((value, index) => convertUnit(value, index));
                                            x += boxRect.left;
                                            y += boxRect.top;
                                            return { x, y };
                                        });
                                        if (parent) {
                                            parent.refitPoints(points);
                                        }
                                        this.clipPath = SvgBuild.getPolygon(points);
                                        return;
                                    }
                                    default: {
                                        if (name === 'circle' || name === 'ellipse') {
                                            let rx;
                                            let ry;
                                            if (name === 'circle') {
                                                rx = convertUnit(match[1], width < height ? 0 : 1);
                                                ry = rx;
                                            }
                                            else {
                                                rx = convertUnit(match[1], 0);
                                                ry = convertUnit(match[2], 1);
                                            }
                                            let cx = boxRect.left;
                                            let cy = boxRect.top;
                                            if (match.length >= 4) {
                                                const index = width < height ? 0 : 1;
                                                cx += convertUnit(match[match.length - 2], index);
                                                cy += convertUnit(match[match.length - 1], index);
                                            }
                                            if (parent) {
                                                cx = parent.refitX(cx);
                                                cy = parent.refitX(cy);
                                                rx = parent.refitSize(rx);
                                                ry = parent.refitSize(ry);
                                            }
                                            this.clipPath = SvgBuild.getEllipse(cx, cy, rx, ry);
                                        }
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            resetPaint() {
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
            setColor(attr) {
                const value = this.getAttribute(attr);
                const match = REGEXP_SVG.URL.exec(value);
                if (match) {
                    this[`${attr}Pattern`] = match[1];
                }
                else if (value !== '') {
                    let color;
                    switch (value.toLowerCase()) {
                        case 'none':
                        case 'transparent':
                        case 'rgba(0, 0, 0, 0)':
                            this[attr] = '';
                            break;
                        case 'currentcolor':
                            color = $color$2.parseRGBA(this.color || $dom$7.cssAttribute(this.element, attr, true));
                            break;
                        default:
                            color = $color$2.parseRGBA(value);
                            break;
                    }
                    if (color) {
                        this[attr] = color.valueRGB;
                    }
                }
            }
            setAttribute(attr, computed = false) {
                const value = this.getAttribute(attr, computed);
                if (value !== '') {
                    this[$util$7.convertCamelCase(attr)] = value;
                }
            }
            getAttribute(attr, computed = false, inherited = true) {
                let value = $dom$7.cssAttribute(this.element, attr, computed);
                if (inherited && value === '') {
                    if (this.patternParent) {
                        switch (attr) {
                            case 'fill-opacity':
                            case 'stroke-opacity':
                                break;
                            default:
                                return value;
                        }
                    }
                    let current = this.useParent || this.parent;
                    while (current) {
                        value = $dom$7.cssAttribute(current.element, attr);
                        if ($util$7.isString(value)) {
                            break;
                        }
                        current = current['parent'];
                    }
                }
                return value;
            }
        };
    };

    class SvgG extends SvgPaint$MX(SvgView$MX(SvgContainer)) {
        constructor(element) {
            super(element);
            this.element = element;
        }
        build(exclusions, residual) {
            super.build(exclusions, residual);
            this.setPaint(this.getPathAll());
        }
        get instanceType() {
            return 34 /* SVG_G */;
        }
    }

    const $util$8 = squared.lib.util;
    class SvgImage extends SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgElement))) {
        constructor(element, imageElement) {
            super(element);
            this.element = element;
            this.imageElement = null;
            this.__get_transform = false;
            this.__get_animation = false;
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
        set x(value) {
            super.x = value;
        }
        get x() {
            const value = super.x;
            if (value === 0 && this.imageElement) {
                return this.imageElement.x.baseVal.value;
            }
            return value;
        }
        set y(value) {
            super.y = value;
        }
        get y() {
            const value = super.y;
            if (value === 0 && this.imageElement) {
                return this.imageElement.y.baseVal.value;
            }
            return value;
        }
        set width(value) {
            super.width = value;
        }
        get width() {
            const value = super.width;
            if (value === 0 && this.imageElement) {
                return this.imageElement.width.baseVal.value;
            }
            return value;
        }
        set height(value) {
            super.height = value;
        }
        get height() {
            const value = super.height;
            if (value === 0 && this.imageElement) {
                return this.imageElement.height.baseVal.value;
            }
            return value;
        }
        get href() {
            const element = this.imageElement || this.element;
            if (SVG.image(element)) {
                return $util$8.resolvePath(element.href.baseVal);
            }
            return '';
        }
        get transform() {
            const transform = super.transform;
            if (!this.__get_transform) {
                if (this.imageElement) {
                    transform.push(...this.getTransforms(this.imageElement));
                }
                this.__get_transform = true;
            }
            return transform;
        }
        get animation() {
            const animation = super.animation;
            if (!this.__get_animation) {
                if (this.imageElement) {
                    animation.push(...this.getAnimations(this.imageElement));
                }
                this.__get_animation = true;
            }
            return animation;
        }
        get instanceType() {
            return 4100 /* SVG_IMAGE */;
        }
    }

    class SvgPath extends SvgPaint$MX(SvgBaseVal$MX(SvgElement)) {
        constructor(element) {
            super(element);
            this.element = element;
            this.name = '';
            this.value = '';
            this.transformed = null;
            this.init();
        }
        static build(path, transform, exclusions, residual) {
            path.draw(SvgBuild.filterTransforms(transform, exclusions && exclusions[path.element.tagName]), residual);
            return path;
        }
        draw(transform, residual, save = true) {
            if (save) {
                this.transformed = null;
            }
            const parent = this.parent;
            const element = this.element;
            let d = '';
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
                d = SvgBuild.getPolyline(points);
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
                d = SvgBuild.getEllipse(pt.x, pt.y, pt.rx, pt.ry);
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
                    d = SvgBuild.getPolygon(points);
                }
                else {
                    if (parent) {
                        x = parent.refitX(x);
                        y = parent.refitY(y);
                        width = parent.refitSize(width);
                        height = parent.refitSize(height);
                    }
                    d = SvgBuild.getRect(width, height, x, y);
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
                    if (this.transformed === null) {
                        points = SvgBuild.clonePoints(points);
                    }
                    parent.refitPoints(points);
                }
                d = element.tagName === 'polygon' ? SvgBuild.getPolygon(points) : SvgBuild.getPolyline(points);
            }
            if (save) {
                this.value = d;
                this.setPaint([d]);
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
        }
        get transform() {
            if (this._transform === undefined) {
                this._transform = getTransform(this.element) || SvgBuild.convertTransformList(this.element.transform.baseVal);
            }
            return this._transform;
        }
        get instanceType() {
            return 1028 /* SVG_PATH */;
        }
    }

    class SvgPattern extends SvgView$MX(SvgContainer) {
        constructor(element, patternElement) {
            super(element);
            this.element = element;
            this.patternElement = patternElement;
        }
        build(exclusions, residual) {
            super.build(exclusions, residual, this.patternElement);
        }
        get animation() {
            return [];
        }
        get instanceType() {
            return 130 /* SVG_PATTERN */;
        }
    }

    class SvgShape extends SvgSynchronize$MX(SvgView$MX(SvgElement)) {
        constructor(element, initPath = true) {
            super(element);
            if (initPath) {
                this.setPath();
            }
        }
        setPath() {
            this.path = new SvgPath(this.element);
        }
        build(exclusions, residual) {
            if (this.path) {
                this.path.parent = this.parent;
                SvgPath.build(this.path, this.transform, exclusions, residual);
            }
        }
        synchronize(useKeyTime = false, element) {
            if (this.path && this.animation.length) {
                this.mergeAnimate(this.getAnimateShape(element || this.element, this.animation), useKeyTime, this.path);
            }
        }
        set path(value) {
            this._path = value;
            if (value) {
                value.name = this.name;
            }
        }
        get path() {
            return this._path;
        }
        get instanceType() {
            return 2052 /* SVG_SHAPE */;
        }
    }

    const $util$9 = squared.lib.util;
    class SvgShapePattern extends SvgPaint$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer))) {
        constructor(element, patternElement) {
            super(element);
            this.element = element;
            this.patternElement = patternElement;
            this._clipRegion = [];
        }
        build(exclusions, residual, element) {
            if (element === undefined) {
                element = this.element;
            }
            const path = SvgPath.build(new SvgPath(element), this.transform, exclusions);
            if (path.value) {
                this.clipRegion = path.value;
                if (path.clipPath) {
                    this.clipRegion = path.clipPath;
                }
                const d = [path.value];
                this.setPaint(d);
                const boxRect = SvgBuild.getPathBoxRect(d);
                const widthAsString = this.patternElement.width.baseVal.valueAsString;
                const heightAsString = this.patternElement.height.baseVal.valueAsString;
                const widthAsPercent = $util$9.isPercent(widthAsString) ? parseInt(widthAsString) / 100 : parseFloat(widthAsString);
                const heightAsPercent = $util$9.isPercent(heightAsString) ? parseInt(heightAsString) / 100 : parseFloat(heightAsString);
                const tileWidth = (boxRect.right - boxRect.left) * widthAsPercent;
                const tileHeight = (boxRect.bottom - boxRect.top) * heightAsPercent;
                let height = 1;
                let j = 0;
                while (height > 0) {
                    const y = boxRect.top + j * tileHeight;
                    let width = 1;
                    let i = 0;
                    do {
                        const x = boxRect.left + i * tileWidth;
                        const pattern = new SvgPattern(element, this.patternElement);
                        pattern.build(exclusions, residual);
                        pattern.cascade().forEach(item => {
                            if (SvgBuild.asShape(item) && item.path) {
                                item.path.patternParent = this;
                                item.path.refitBaseValue(x, y);
                                SvgPath.build(item.path, item.transform, exclusions, residual);
                                item.path.fillOpacity = (parseFloat(item.path.fillOpacity) * parseFloat(this.fillOpacity)).toString();
                                item.path.clipPath = SvgBuild.getRect(tileWidth, tileHeight, x, y) + (item.path.clipPath !== '' ? `;${item.path.clipPath}` : '');
                            }
                        });
                        this.append(pattern);
                        width -= widthAsPercent;
                        i++;
                    } while (width > 0);
                    j++;
                    height -= heightAsPercent;
                }
                if (this.stroke !== '' && parseFloat(this.strokeWidth) > 0) {
                    path.fill = '';
                    path.fillOpacity = '0';
                    path.stroke = this.stroke;
                    path.strokeWidth = this.strokeWidth;
                    const shape = new SvgShape(element, false);
                    shape.path = path;
                    this.append(shape);
                }
                this.drawRegion = boxRect;
            }
        }
        set clipRegion(value) {
            if (value !== '') {
                this._clipRegion.push(value);
            }
            else {
                this._clipRegion.length = 0;
            }
        }
        get clipRegion() {
            return this._clipRegion.length ? this._clipRegion.join(';') : '';
        }
        get instanceType() {
            return 258 /* SVG_SHAPE_PATTERN */;
        }
    }

    class SvgUse extends SvgPaint$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgShape))) {
        constructor(element, shapeElement) {
            super(element, false);
            this.element = element;
            this.shapeElement = shapeElement;
            this.__get_transform = false;
            this.__get_animation = false;
            this.setPath();
        }
        setPath() {
            this.path = new SvgPath(this.shapeElement);
            this.path.useParent = this;
        }
        build(exclusions, residual) {
            super.build(exclusions, residual);
            this.setPaint(this.path ? [this.path.value] : undefined);
        }
        synchronize(useKeyTime = false) {
            if (this.animation.length) {
                this.mergeAnimate(this.getAnimateViewRect(this.animation), useKeyTime);
            }
            super.synchronize(useKeyTime, this.shapeElement);
        }
        get transform() {
            const transform = super.transform;
            if (!this.__get_transform) {
                transform.push(...this.getTransforms(this.shapeElement));
                this.__get_transform = true;
            }
            return transform;
        }
        get animation() {
            const animation = super.animation;
            if (!this.__get_animation) {
                animation.push(...this.getAnimations(this.shapeElement));
                this.__get_animation = true;
            }
            return animation;
        }
        get instanceType() {
            return 10244 /* SVG_USE */;
        }
    }

    class SvgUsePattern extends SvgSynchronize$MX(SvgViewRect$MX(SvgShapePattern)) {
        constructor(element, shapeElement, patternElement) {
            super(element, patternElement);
            this.element = element;
            this.shapeElement = shapeElement;
        }
        build(exclusions, residual) {
            super.build(exclusions, residual, this.shapeElement);
        }
        synchronize(useKeyTime = false) {
            const animation = this.animation.filter(item => this.validateBaseValueType(item.attributeName, 0) === undefined || item.attributeName === 'x' || item.attributeName === 'y');
            if (animation.length) {
                this.mergeAnimate(this.getAnimateViewRect(animation), useKeyTime);
            }
            super.synchronize(useKeyTime);
        }
        get instanceType() {
            return 514 /* SVG_USE_PATTERN */;
        }
    }

    const $dom$8 = squared.lib.dom;
    class SvgUseSymbol extends SvgPaint$MX(SvgSynchronize$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer))))) {
        constructor(element, symbolElement) {
            super(element);
            this.element = element;
            this.symbolElement = symbolElement;
        }
        build(exclusions, residual) {
            this.setRect();
            super.build(exclusions, residual, this.symbolElement);
            const x = this.getBaseValue('x', 0);
            const y = this.getBaseValue('y', 0);
            if (x !== 0 || y !== 0) {
                const pt = { x, y };
                this.cascade().forEach(item => item.translationOffset = pt);
            }
            this.setPaint(this.getPathAll());
        }
        synchronize(useKeyTime = false) {
            if (this.animation.length) {
                this.mergeAnimate(this.getAnimateViewRect(this.animation), useKeyTime);
            }
            super.synchronize(useKeyTime);
        }
        get viewBox() {
            if (this.symbolElement.viewBox.baseVal) {
                return this.symbolElement.viewBox.baseVal;
            }
            else {
                return $dom$8.getDOMRect(this.element);
            }
        }
        get instanceType() {
            return 66 /* SVG_USE_SYMBOL */;
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
    exports.SvgPattern = SvgPattern;
    exports.SvgShape = SvgShape;
    exports.SvgShapePattern = SvgShapePattern;
    exports.SvgSynchronize = SvgSynchronize$MX;
    exports.SvgUse = SvgUse;
    exports.SvgUsePattern = SvgUsePattern;
    exports.SvgUseSymbol = SvgUseSymbol;
    exports.SvgView = SvgView$MX;
    exports.SvgViewRect = SvgViewRect$MX;
    exports.lib = lib;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
