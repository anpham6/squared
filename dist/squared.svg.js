/* squared.svg 0.6.2
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
    const SHAPES = {
        path: 1,
        line: 2,
        rect: 3,
        ellipse: 4,
        circle: 5,
        polyline: 6,
        polygon: 7
    };
    const REGEXP_SVG = {
        URL: /url\("?(#.*?)"?\)/,
        ZERO_ONE: '(0(?:\\.\\d+)?|1(?:\\.0+)?)'
    };
    const REGEXP_TRANSFORM = {
        MATRIX: `(matrix(?:3d)?)\\(${$util.REGEXP_STRING.DECIMAL}, ${$util.REGEXP_STRING.DECIMAL}, ${$util.REGEXP_STRING.DECIMAL}, ${$util.REGEXP_STRING.DECIMAL}, ${$util.REGEXP_STRING.DECIMAL}, ${$util.REGEXP_STRING.DECIMAL}(?:, ${$util.REGEXP_STRING.DECIMAL})?(?:, ${$util.REGEXP_STRING.DECIMAL})?(?:, ${$util.REGEXP_STRING.DECIMAL})?(?:, ${$util.REGEXP_STRING.DECIMAL})?(?:, ${$util.REGEXP_STRING.DECIMAL})?(?:, ${$util.REGEXP_STRING.DECIMAL})?(?:, ${$util.REGEXP_STRING.DECIMAL})?(?:, ${$util.REGEXP_STRING.DECIMAL})?(?:, ${$util.REGEXP_STRING.DECIMAL})?(?:, ${$util.REGEXP_STRING.DECIMAL})?\\)`,
        ROTATE: `(rotate[XY]?)\\(${$util.REGEXP_STRING.DEGREE}\\)`,
        SKEW: `(skew[XY]?)\\(${$util.REGEXP_STRING.DEGREE}(?:, ${$util.REGEXP_STRING.DEGREE})?\\)`,
        SCALE: `(scale[XY]?)\\(${$util.REGEXP_STRING.DECIMAL}(?:, ${$util.REGEXP_STRING.DECIMAL})?\\)`,
        TRANSLATE: `(translate[XY]?)\\(${$util.REGEXP_STRING.LENGTH}(?:, ${$util.REGEXP_STRING.LENGTH})?\\)`
    };
    const MATRIX = {
        applyX(matrix, x, y) {
            return matrix.a * x + matrix.c * y + matrix.e;
        },
        applyY(matrix, x, y) {
            return matrix.b * x + matrix.d * y + matrix.f;
        },
        distance(angle, value) {
            return value * Math.cos($util.convertRadian(angle)) * -1;
        },
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
            const r = $util.convertRadian(angle);
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
                b: Math.tan($util.convertRadian(y)),
                c: Math.tan($util.convertRadian(x)),
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
    const TRANSFORM = {
        create(type, matrix, angle = 0, x = true, y = true) {
            return {
                type,
                matrix,
                angle,
                method: { x, y }
            };
        },
        parse(element, value) {
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
                            const angle = $util.convertAngle(match[2], match[3]);
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
                            result[match.index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_ROTATE, matrix, angle, !isX, !isY);
                        }
                        else if (match[1].startsWith('skew')) {
                            const x = isY ? 0 : $util.convertAngle(match[2], match[3]);
                            const y = isY ? $util.convertAngle(match[2], match[3]) : (match[4] && match[5] ? $util.convertAngle(match[4], match[5]) : 0);
                            const matrix = MATRIX.skew(x, y);
                            if (isX) {
                                result[match.index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SKEWX, matrix, x, true, false);
                            }
                            else if (isY) {
                                result[match.index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SKEWY, matrix, y, false, true);
                            }
                            else {
                                result[match.index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SKEWX, Object.assign({}, matrix, { b: 0 }), x, true, false);
                                if (y !== 0) {
                                    result[match.index + 1] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SKEWY, Object.assign({}, matrix, { c: 0 }), y, false, true);
                                }
                            }
                        }
                        else if (match[1].startsWith('scale')) {
                            const x = isY ? undefined : parseFloat(match[2]);
                            const y = isY ? parseFloat(match[2]) : (!isX && match[3] ? parseFloat(match[3]) : x);
                            const matrix = MATRIX.scale(x, isX ? undefined : y);
                            result[match.index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SCALE, matrix, 0, !isY, !isX);
                        }
                        else if (match[1].startsWith('translate')) {
                            const dpi = getHostDPI();
                            const fontSize = getFontSize(element);
                            const arg1 = parseFloat($util.convertPX(match[2], dpi, fontSize));
                            const arg2 = (!isX && match[3] ? parseFloat($util.convertPX(match[3], dpi, fontSize)) : 0);
                            const x = isY ? 0 : arg1;
                            const y = isY ? arg1 : arg2;
                            const matrix = MATRIX.translate(x, y);
                            result[match.index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_TRANSLATE, matrix, 0);
                        }
                        else if (match[1].startsWith('matrix')) {
                            const matrix = TRANSFORM.matrix(element, value);
                            if (matrix) {
                                result[match.index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_MATRIX, matrix);
                            }
                        }
                    }
                }
                return result.filter(item => {
                    if (item) {
                        item.fromCSS = true;
                        return true;
                    }
                    return false;
                });
            }
            return undefined;
        },
        matrix(element, value) {
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
        },
        origin(element, value) {
            if (value === undefined) {
                value = $dom.cssAttribute(element, 'transform-origin');
            }
            const result = { x: null, y: null };
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
                    if (parent instanceof SVGGraphicsElement && parent.viewportElement && (SVG.svg(parent.viewportElement) || SVG.symbol(parent.viewportElement))) {
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
        },
        rotateOrigin(element, attr = 'transform') {
            const value = $dom.getNamedItem(element, attr);
            const result = [];
            if (value !== '') {
                const pattern = /rotate\((-?[\d.]+),?\s*(-?[\d.]+),?\s*(-?[\d.]+)\)/g;
                let match;
                while ((match = pattern.exec(value)) !== null) {
                    const angle = parseFloat(match[1]);
                    if (angle !== 0) {
                        result.push({
                            angle,
                            x: parseFloat(match[2]),
                            y: parseFloat(match[3])
                        });
                    }
                }
            }
            return result;
        },
        typeAsName(type) {
            switch (type) {
                case SVGTransform.SVG_TRANSFORM_ROTATE:
                    return 'rotate';
                case SVGTransform.SVG_TRANSFORM_SCALE:
                    return 'scale';
                case SVGTransform.SVG_TRANSFORM_SKEWX:
                    return 'skewX';
                case SVGTransform.SVG_TRANSFORM_SKEWY:
                    return 'skewY';
                case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                    return 'translate';
            }
            return '';
        },
        typeAsValue(type) {
            switch (type) {
                case 'rotate':
                case SVGTransform.SVG_TRANSFORM_ROTATE:
                    return '0 0 0';
                case 'scale':
                case SVGTransform.SVG_TRANSFORM_SCALE:
                    return '1 1 0 0';
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
    };
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
    function getHostDPI() {
        return $util.optionalAsNumber(squared, 'settings.resolutionDPI') || 96;
    }
    function getFontSize(element) {
        return parseInt($dom.getStyle(element).fontSize || '16');
    }
    function convertClockTime(value) {
        let s = 0;
        let ms = 0;
        if ($util.isNumber(value)) {
            s = parseInt(value);
        }
        else {
            if (/-?\d+ms$/.test(value)) {
                ms = parseFloat(value);
            }
            else if (/-?\d+s$/.test(value)) {
                s = parseFloat(value);
            }
            else if (/-?\d+min$/.test(value)) {
                s = parseFloat(value) * 60;
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
        const value = $dom.getNamedItem(element, 'href');
        if (value.charAt(0) === '#') {
            const id = value.substring(1);
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
        while (current) {
            if ((SVG.svg(current) || SVG.symbol(current)) && current.viewBox && current.viewBox.baseVal.width > 0 && current.viewBox.baseVal.height > 0) {
                return current.viewBox.baseVal;
            }
            current = current.parentElement;
        }
        return undefined;
    }
    function sortNumber(values, descending = false) {
        return descending ? values.sort((a, b) => a > b ? -1 : 1) : values.sort((a, b) => a < b ? -1 : 1);
    }
    function truncateDecimal(value, precision = 3) {
        return value % 1 !== 0 ? value.toFixed(precision).replace(/(\.\d+?)0+$/, (match, capture) => capture) : value;
    }
    function getSplitValue(value, next, percent) {
        return value + (next - value) * percent;
    }
    function getLeastCommonMultiple(values, offset) {
        if (values.length > 1) {
            const increment = sortNumber(values.slice(0))[0];
            let minimum = 0;
            if (offset) {
                if (offset.length === values.length) {
                    for (let i = 0; i < offset.length; i++) {
                        minimum = Math.max(minimum, offset[i] + values[i]);
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

    var util = /*#__PURE__*/Object.freeze({
        REGEXP_SVG: REGEXP_SVG,
        MATRIX: MATRIX,
        TRANSFORM: TRANSFORM,
        SVG: SVG,
        getHostDPI: getHostDPI,
        getFontSize: getFontSize,
        convertClockTime: convertClockTime,
        isVisible: isVisible,
        setVisible: setVisible,
        setOpacity: setOpacity,
        getTargetElement: getTargetElement,
        getNearestViewBox: getNearestViewBox,
        sortNumber: sortNumber,
        truncateDecimal: truncateDecimal,
        getSplitValue: getSplitValue,
        getLeastCommonMultiple: getLeastCommonMultiple
    });

    const $util$1 = squared.lib.util;
    const NAME_GRAPHICS = new Map();
    class SvgBuild {
        static isContainer(object) {
            return $util$1.hasBit(object.instanceType, 2 /* SVG_CONTAINER */);
        }
        static isElement(object) {
            return $util$1.hasBit(object.instanceType, 4 /* SVG_ELEMENT */);
        }
        static isShape(object) {
            return $util$1.hasBit(object.instanceType, 2052 /* SVG_SHAPE */);
        }
        static isAnimate(object) {
            return $util$1.hasBit(object.instanceType, 16392 /* SVG_ANIMATE */);
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
        static isShapePattern(object) {
            return object.instanceType === 258 /* SVG_SHAPE_PATTERN */;
        }
        static asUsePattern(object) {
            return object.instanceType === 514 /* SVG_USE_PATTERN */;
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
        static asAnimate(object) {
            return object.instanceType === 16392 /* SVG_ANIMATE */;
        }
        static asAnimateTransform(object) {
            return object.instanceType === 81928 /* SVG_ANIMATE_TRANSFORM */;
        }
        static asAnimateMotion(object) {
            return object.instanceType === 49160 /* SVG_ANIMATE_MOTION */;
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
        static drawLine(x1, y1, x2 = 0, y2 = 0) {
            return `M${x1},${y1} L${x2},${y2}`;
        }
        static drawRect(width, height, x = 0, y = 0) {
            return `M${x},${y} ${x + width},${y} ${x + width},${y + height} ${x},${y + height} Z`;
        }
        static drawCircle(cx, cy, r) {
            return SvgBuild.drawEllipse(cx, cy, r);
        }
        static drawEllipse(cx, cy, rx, ry, truncate = false) {
            if (ry === undefined) {
                ry = rx;
            }
            return `M${truncate ? truncateDecimal(cx - rx) : cx - rx},${truncate ? truncateDecimal(cy) : cy} a${rx},${ry},0,1,0,${rx * 2},0 a${rx},${ry},0,1,0,-${rx * 2},0`;
        }
        static drawPolygon(points, truncate = false) {
            const value = SvgBuild.drawPolyline(points, truncate);
            return value !== '' ? `${value} Z` : '';
        }
        static drawPolyline(points, truncate = false) {
            return points.length ? `M${points.map(pt => `${truncate ? truncateDecimal(pt.x) : pt.x},${truncate ? truncateDecimal(pt.y) : pt.y}`).join(' ')}` : '';
        }
        static drawPath(values) {
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
        static getPathCommands(value) {
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
                                values.splice(i--, 1);
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
        static setPathPoints(values, points) {
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
        static filterTransforms(transforms, exclude) {
            const result = [];
            for (const item of transforms) {
                if (exclude === undefined || !exclude.includes(item.type)) {
                    switch (item.type) {
                        case SVGTransform.SVG_TRANSFORM_ROTATE:
                        case SVGTransform.SVG_TRANSFORM_SKEWX:
                        case SVGTransform.SVG_TRANSFORM_SKEWY:
                            if (item.angle === 0) {
                                continue;
                            }
                            break;
                        case SVGTransform.SVG_TRANSFORM_SCALE:
                            if (item.matrix.a === 1 && item.matrix.d === 1) {
                                continue;
                            }
                            break;
                        case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                            if (item.matrix.e === 0 && item.matrix.f === 0) {
                                continue;
                            }
                            break;
                    }
                    result.push(item);
                }
            }
            return result;
        }
        static applyTransforms(transforms, values, origin, center) {
            transforms = transforms.slice(0).reverse();
            const result = SvgBuild.clonePoints(values);
            for (const item of transforms) {
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
                                x2 = origin.x + MATRIX.distance(item.angle, origin.x);
                            }
                            if (item.method.y) {
                                y1 -= origin.y;
                                y2 = origin.y + MATRIX.distance(item.angle, origin.y);
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
                    pt.x = MATRIX.applyX(m, x, pt.y + y1) + x2;
                    pt.y = MATRIX.applyY(m, x + x1, pt.y) + y2;
                    if (item.type === SVGTransform.SVG_TRANSFORM_SCALE && pt.rx !== undefined && pt.ry !== undefined) {
                        const rx = pt.rx;
                        pt.rx = MATRIX.applyX(m, rx, pt.ry + y1);
                        pt.ry = MATRIX.applyY(m, rx + x1, pt.ry);
                    }
                }
            }
            return result;
        }
        static convertTransforms(transform) {
            const result = [];
            for (let i = 0; i < transform.numberOfItems; i++) {
                const item = transform.getItem(i);
                result.push(TRANSFORM.create(item.type, item.matrix, item.angle));
            }
            return result;
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
                    result.push({ x: pt.x, y: pt.y });
                }
            }
            return result;
        }
        static convertNumbers(values) {
            const result = [];
            for (let i = 0; i < values.length; i += 2) {
                result.push({ x: values[i], y: values[i + 1] });
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
        static toPointList(value) {
            const result = [];
            for (const coords of value.trim().split(/\s+/)) {
                const [x, y] = coords.split(',').map(pt => parseFloat(pt));
                result.push({ x, y });
            }
            return result;
        }
        static toBoxRect(values) {
            let top = Number.MAX_VALUE;
            let right = -Number.MAX_VALUE;
            let bottom = -Number.MAX_VALUE;
            let left = Number.MAX_VALUE;
            for (const value of values) {
                const points = SvgBuild.getPathPoints(SvgBuild.getPathCommands(value), true);
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
                    if (this.validateBaseValue(attr, value)) {
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
                function adjustPoints(values) {
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
                            const commands = SvgBuild.getPathCommands(value);
                            const points = SvgBuild.getPathPoints(commands);
                            adjustPoints(points);
                            this._baseVal[attr] = SvgBuild.drawPath(SvgBuild.setPathPoints(commands, points));
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
                            adjustPoints(value);
                        }
                    }
                }
            }
            validateBaseValue(attr, value) {
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

    const $dom$2 = squared.lib.dom;
    const $util$2 = squared.lib.util;
    class SvgAnimation {
        constructor(element) {
            this.element = null;
            this.attributeName = '';
            this.paused = false;
            this.synchronizeState = 0;
            this._duration = -1;
            this._delay = 0;
            this._to = '';
            if (element) {
                this.element = element;
                this.setAttribute('attributeName');
                this.setAttribute('to');
                const dur = $dom$2.getNamedItem(element, 'dur');
                if (dur !== '' && dur !== 'indefinite') {
                    this.duration = convertClockTime(dur);
                }
                if (this.attributeName === 'transform') {
                    this.baseFrom = TRANSFORM.typeAsValue($dom$2.getNamedItem(element, 'type'));
                }
                else if (element.parentElement) {
                    this.baseFrom = $util$2.optionalAsString(element.parentElement, `${this.attributeName}.baseVal.valueAsString`) || $dom$2.cssInheritAttribute(element.parentElement, this.attributeName);
                }
            }
        }
        setAttribute(attr, equality) {
            const value = $dom$2.getNamedItem(this.element, attr);
            if (value !== '') {
                if (equality !== undefined) {
                    this[attr + $util$2.capitalize(equality)] = value === equality;
                }
                else {
                    this[attr] = value;
                }
            }
        }
        addState(...values) {
            for (const value of values) {
                if (!$util$2.hasBit(this.synchronizeState, value)) {
                    this.synchronizeState |= value;
                }
            }
        }
        removeState(...values) {
            for (const value of values) {
                if ($util$2.hasBit(this.synchronizeState, value)) {
                    this.synchronizeState ^= value;
                }
            }
        }
        hasState(...values) {
            return values.some(value => $util$2.hasBit(this.synchronizeState, value));
        }
        set delay(value) {
            this._delay = value;
        }
        get delay() {
            return this._delay;
        }
        set duration(value) {
            this._duration = Math.round(value);
        }
        get duration() {
            return this._duration;
        }
        set to(value) {
            this._to = value;
        }
        get to() {
            return this._to;
        }
        set group(value) {
            this._group = value;
        }
        get group() {
            return this._group || { id: Number.NEGATIVE_INFINITY, name: '' };
        }
        set setterType(value) { }
        get setterType() {
            return true;
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
    const $dom$3 = squared.lib.dom;
    const $util$3 = squared.lib.util;
    function invertControlPoint(value) {
        return parseFloat((1 - value).toFixed(5));
    }
    class SvgAnimate extends SvgAnimation {
        constructor(element) {
            super(element);
            this.type = 0;
            this.from = '';
            this.fillMode = 0;
            this.alternate = false;
            this.additiveSum = false;
            this.accumulateSum = false;
            this._iterationCount = 1;
            this._reverse = false;
            this._setterType = false;
            this._repeatDuration = -1;
            if (element) {
                const values = $dom$3.getNamedItem(element, 'values');
                const keyTimes = this.duration !== -1 ? SvgAnimate.toFractionList($dom$3.getNamedItem(element, 'keyTimes')) : [];
                if (values !== '') {
                    this.values = $util$3.flatMap(values.split(';'), value => value.trim());
                    if (this.values.length > 1 && keyTimes.length === this.values.length) {
                        this.from = this.values[0];
                        this.to = this.values[this.values.length - 1];
                        this.keyTimes = keyTimes;
                    }
                    else if (this.values.length === 1) {
                        this.to = values[0];
                        this.convertToValues();
                    }
                }
                else {
                    this.from = $dom$3.getNamedItem(element, 'from');
                    if (this.to === '') {
                        const by = $dom$3.getNamedItem(element, 'by');
                        if ($util$3.isNumber(by)) {
                            if (this.from === '' && this.baseFrom) {
                                this.from = this.baseFrom;
                            }
                            if ($util$3.isNumber(this.from)) {
                                this.to = (parseFloat(this.from) + parseFloat(by)).toString();
                            }
                        }
                    }
                    this.convertToValues(keyTimes);
                }
                this.setAttribute('additive', 'sum');
                const repeatDur = $dom$3.getNamedItem(element, 'repeatDur');
                if (repeatDur !== '' && repeatDur !== 'indefinite') {
                    this._repeatDuration = convertClockTime(repeatDur);
                }
                const repeatCount = $dom$3.getNamedItem(element, 'repeatCount');
                this.iterationCount = repeatCount === 'indefinite' ? -1 : parseFloat(repeatCount);
                if (element.tagName === 'animate') {
                    this.setCalcMode(this.attributeName);
                }
            }
        }
        static toStepFractionList(name, keyTimes, values, keySpline, index, dpi = 96, fontSize = 16) {
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
                    currentValue = SvgBuild.convertNumbers(SvgBuild.toNumberList(values[index]));
                    nextValue = SvgBuild.convertNumbers(SvgBuild.toNumberList(values[index + 1]));
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
                switch (keySpline) {
                    case 'step-start':
                        keySpline = 'steps(1, start)';
                        break;
                    case 'step-end':
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
                    for (let i = 0; i < stepSize; i++) {
                        const offset = i === 0 && match[2] === 'start' ? 1 : 0;
                        const time = keyTimes[index] + keyTimeTotal * (i / stepSize);
                        const percent = (interval * (i + offset)) / 100;
                        const value = [];
                        switch (name) {
                            case 'fill':
                            case 'stroke': {
                                const current = currentValue[0];
                                const next = nextValue[0];
                                const rgb = $color.convertHex(getSplitValue(current.rgba.r, next.rgba.r, percent), getSplitValue(current.rgba.g, next.rgba.g, percent), getSplitValue(current.rgba.b, next.rgba.b, percent));
                                const a = $color.convertHex(getSplitValue(current.rgba.a, next.rgba.a, percent));
                                value.push(`#${rgb + (a !== 'FF' ? a : '')}`);
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
            let previous = 0;
            const result = $util$3.flatMap(value.split(delimiter), segment => {
                const fraction = parseFloat(segment);
                if (!isNaN(fraction) && fraction >= previous && fraction <= 1) {
                    previous = fraction;
                    return fraction;
                }
                return -1;
            });
            return result.length > 1 && result[0] === 0 && result.some(percent => percent !== -1) ? result : [];
        }
        setCalcMode(name) {
            switch ($dom$3.getNamedItem(this.element, 'calcMode')) {
                case 'discrete': {
                    if (this.keyTimes.length === 2 && this.keyTimes[0] === 0) {
                        const keyTimes = [];
                        const values = [];
                        for (let i = 0; i < this.keyTimes.length - 1; i++) {
                            const result = SvgAnimate.toStepFractionList(name, this.keyTimes, this.values, 'step-end', i, getHostDPI(), getFontSize(this.element));
                            if (result) {
                                keyTimes.push(...result[0]);
                                values.push(...result[1]);
                            }
                        }
                        keyTimes.push(this.keyTimes.pop());
                        values.push(this.values.pop());
                        this.values = values;
                        this.keyTimes = keyTimes;
                        this._keySplines = [KEYSPLINE_NAME['step']];
                    }
                    break;
                }
                case 'spline':
                    this.keySplines = $util$3.flatMap($dom$3.getNamedItem(this.element, 'keySplines').split(';'), value => value.trim());
                case 'linear':
                    if (this.keyTimes[0] !== 0 && this.keyTimes[this.keyTimes.length - 1] !== 1) {
                        const keyTimes = [];
                        for (let i = 0; i < this.values.length; i++) {
                            keyTimes.push(i / (this.values.length - 1));
                        }
                        this._keyTimes = keyTimes;
                        this._keySplines = undefined;
                    }
                    break;
            }
        }
        convertToValues(keyTimes) {
            if (this.to !== '') {
                this.values = [this.from, this.to];
                this.keyTimes = keyTimes && keyTimes.length === 2 && this.keyTimes[0] === 0 && this.keyTimes[1] <= 1 ? keyTimes : [0, 1];
            }
        }
        setGroupSiblings(value) {
            this.group.siblings = value;
            if (this.fillBackwards) {
                for (let i = value.length - 1, found = false; i >= 0; i--) {
                    if (found) {
                        if (value[i].fillMode === 'backwards' || value[i].fillMode === 'both') {
                            this.fillBackwards = false;
                            break;
                        }
                    }
                    else if (value[i].name === this.group.name) {
                        found = true;
                    }
                }
            }
        }
        getPartialDuration(iteration) {
            return (iteration === 0 ? this.delay : 0) + this.keyTimes[this.keyTimes.length - 1] * this.duration;
        }
        _setFillMode(mode, value) {
            const hasBit = $util$3.hasBit(this.fillMode, value);
            if (mode) {
                if (!hasBit) {
                    this.fillMode |= value;
                }
            }
            else {
                if (hasBit) {
                    this.fillMode ^= value;
                }
            }
        }
        set delay(value) {
            super.delay = value;
            const end = $dom$3.getNamedItem(this.element, 'end');
            if (end !== '') {
                const endTime = sortNumber(end.split(';').map(time => convertClockTime(time)))[0];
                if (endTime !== undefined && (this.iterationCount === -1 || this.duration > 0 && endTime < this.duration * this.iterationCount)) {
                    if (this.delay > endTime) {
                        this.end = endTime;
                        if (this.iterationCount === -1) {
                            this.iterationCount = Math.ceil((this.end - this.delay) / this.duration);
                        }
                    }
                    else {
                        this.duration = -1;
                    }
                }
            }
        }
        get delay() {
            return super.delay;
        }
        set duration(value) {
            super.duration = value;
        }
        get duration() {
            const value = super.duration;
            if (value === -1 && this._repeatDuration !== -1) {
                return this._repeatDuration;
            }
            return value;
        }
        set iterationCount(value) {
            this._iterationCount = isNaN(value) ? 1 : value;
            this.fillFreeze = this.iterationCount !== -1 && $dom$3.getNamedItem(this.element, 'fill') === 'freeze';
            if (this.iterationCount !== 1) {
                this.setAttribute('accumulate', 'sum');
            }
            else {
                this.accumulateSum = false;
            }
        }
        get iterationCount() {
            if (this.duration > 0) {
                if (this._repeatDuration !== -1 && (this._iterationCount === -1 || this._repeatDuration < this._iterationCount * this.duration)) {
                    return this._repeatDuration / this.duration;
                }
                return this._iterationCount;
            }
            return 1;
        }
        set to(value) {
            super.to = value;
        }
        get to() {
            if (this._setterType) {
                return this.valueTo || super.to;
            }
            return this.setterType ? this.values[0] : super.to;
        }
        set values(value) {
            this._values = value;
            if (this._keyTimes && this._keyTimes.length !== value.length) {
                this._keyTimes = undefined;
                this._keySplines = undefined;
            }
        }
        get values() {
            if (this._values === undefined) {
                this._values = [];
            }
            return this._values;
        }
        get valueTo() {
            return this.values[this.values.length - 1] || '';
        }
        get valueFrom() {
            return this.values[0] || '';
        }
        set keyTimes(value) {
            if (value.every(fraction => fraction >= 0 && fraction <= 1) && (this._values === undefined || this._values.length === value.length)) {
                this._keyTimes = value;
            }
        }
        get keyTimes() {
            if (this._keyTimes === undefined) {
                this._keyTimes = [];
            }
            return this._keyTimes;
        }
        set keySplines(value) {
            if (value && value.length) {
                const minSegment = this.keyTimes.length - 1;
                if (value.length >= minSegment && !value.every(spline => spline === '' || spline === KEYSPLINE_NAME.linear)) {
                    const keySplines = [];
                    for (let i = 0; i < minSegment; i++) {
                        const points = value[i].split(' ').map(pt => parseFloat(pt));
                        if (points.length === 4 && !points.some(pt => isNaN(pt)) && points[0] >= 0 && points[0] <= 1 && points[2] >= 0 && points[2] <= 1) {
                            keySplines.push(points.join(' '));
                        }
                        else {
                            keySplines.push(KEYSPLINE_NAME.linear);
                        }
                    }
                    this._keySplines = keySplines;
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
                const keyTimes = [];
                for (let i = 0; i < this.keyTimes.length; i++) {
                    keyTimes.push(1 - this.keyTimes[i]);
                }
                keyTimes.reverse();
                this.keyTimes = keyTimes;
                if (this._keySplines) {
                    const keySplines = [];
                    for (let i = this._keySplines.length - 1; i >= 0; i--) {
                        const points = this._keySplines[i].split(' ').map(pt => parseFloat(pt));
                        if (points.length === 4) {
                            keySplines.push(`${invertControlPoint(points[2])} ${invertControlPoint(points[3])} ${invertControlPoint(points[0])} ${invertControlPoint(points[1])}`);
                        }
                        else {
                            keySplines.push(KEYSPLINE_NAME.linear);
                        }
                    }
                    this._keySplines = keySplines;
                }
                this._reverse = value;
            }
        }
        get reverse() {
            return this._reverse;
        }
        set fillBackwards(value) {
            this._setFillMode(value, 2 /* BACKWARDS */);
        }
        get fillBackwards() {
            return $util$3.hasBit(this.fillMode, 2 /* BACKWARDS */);
        }
        set fillForwards(value) {
            this._setFillMode(value, 4 /* FORWARDS */);
        }
        get fillForwards() {
            return $util$3.hasBit(this.fillMode, 4 /* FORWARDS */);
        }
        set fillFreeze(value) {
            this._setFillMode(value, 8 /* FREEZE */);
        }
        get fillFreeze() {
            return $util$3.hasBit(this.fillMode, 8 /* FREEZE */);
        }
        get fillReplace() {
            return this.fillMode < 4 /* FORWARDS */;
        }
        get fromToType() {
            return this.keyTimes.length === 2 && this.keyTimes[0] === 0 && this.keyTimes[1] === 1;
        }
        get partialType() {
            return this.keyTimes.length > 1 && this.keyTimes[this.keyTimes.length - 1] < 1;
        }
        set setterType(value) {
            this._setterType = value;
        }
        get setterType() {
            return this._setterType || this.element !== undefined && this.duration === 0 && this.keyTimes.length >= 2 && this.keyTimes[0] === 0;
        }
        get instanceType() {
            return 16392 /* SVG_ANIMATE */;
        }
    }

    const $dom$4 = squared.lib.dom;
    class SvgAnimateTransform extends SvgAnimate {
        static toRotateList(values) {
            const result = values.map(value => {
                if (value === '') {
                    return [0, 0, 0];
                }
                else {
                    const segment = SvgBuild.toNumberList(value);
                    if (segment.length === 1) {
                        segment[1] = 0;
                        segment[2] = 0;
                        return segment;
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
                    return [1, 1, 0, 0];
                }
                else {
                    const segment = SvgBuild.toNumberList(value);
                    if (segment.length === 1) {
                        segment[1] = segment[0];
                    }
                    if (segment.length === 2) {
                        segment[2] = 0;
                        segment[3] = 0;
                        return segment;
                    }
                    else if (segment.length === 4) {
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
                    return [0, 0];
                }
                else {
                    const segment = SvgBuild.toNumberList(value);
                    if (segment.length === 1) {
                        segment[1] = 0;
                        return segment;
                    }
                    else if (segment.length === 2) {
                        return segment;
                    }
                    return [];
                }
            });
            return result.some(item => item.length === 0) ? undefined : result;
        }
        static toSkewList(values) {
            const result = values.map(value => {
                if (value === '') {
                    return [0];
                }
                else {
                    const segment = SvgBuild.toNumberList(value);
                    if (segment.length === 1) {
                        return segment;
                    }
                    return [];
                }
            });
            return result.some(item => item.length === 0) ? undefined : result;
        }
        constructor(element) {
            super(element);
            if (element) {
                const type = $dom$4.getNamedItem(element, 'type');
                this.setType(type);
                this.setCalcMode(type);
            }
        }
        expandToValues() {
            if (this.additiveSum && this.iterationCount !== -1 && this.keyTimes.length && this.duration > 0) {
                const durationTotal = this.duration * this.iterationCount;
                invalid: {
                    const keyTimes = [];
                    const values = [];
                    const keySplines = [];
                    let previousValues;
                    for (let i = 0; i < this.iterationCount; i++) {
                        if (i > 0 && this.keySplines) {
                            keySplines.push('');
                        }
                        for (let j = 0; j < this.keyTimes.length; j++) {
                            const stringValues = this.values[j].split(' ');
                            const floatValues = stringValues.map(value => parseFloat(value));
                            if (stringValues.length === floatValues.length) {
                                let currentValues;
                                switch (this.type) {
                                    case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                                        if (floatValues.length === 1) {
                                            currentValues = [floatValues[0], 0];
                                        }
                                        else if (floatValues.length === 2) {
                                            currentValues = floatValues;
                                        }
                                        break;
                                    case SVGTransform.SVG_TRANSFORM_SCALE:
                                        if (floatValues.length === 1) {
                                            currentValues = [floatValues[0], floatValues[0]];
                                        }
                                        else if (floatValues.length === 2) {
                                            currentValues = floatValues;
                                        }
                                        break;
                                    case SVGTransform.SVG_TRANSFORM_ROTATE:
                                        if (floatValues.length === 1) {
                                            currentValues = [floatValues[0], 0, 0];
                                        }
                                        else if (floatValues.length === 3) {
                                            currentValues = floatValues;
                                        }
                                        break;
                                    case SVGTransform.SVG_TRANSFORM_SKEWX:
                                    case SVGTransform.SVG_TRANSFORM_SKEWY:
                                        if (floatValues.length === 1) {
                                            currentValues = floatValues;
                                        }
                                        break;
                                }
                                if (currentValues) {
                                    let time = (this.keyTimes[j] + i) * this.duration;
                                    if (previousValues) {
                                        for (let k = 0; k < currentValues.length; k++) {
                                            currentValues[k] += previousValues[k];
                                        }
                                    }
                                    if (i < this.iterationCount - 1 && j === this.keyTimes.length - 1) {
                                        if (this.accumulateSum) {
                                            previousValues = currentValues;
                                        }
                                        time--;
                                    }
                                    keyTimes.push(time / durationTotal);
                                    values.push(currentValues.join(' '));
                                    if (this.keySplines && j < this.keyTimes.length - 1) {
                                        keySplines.push(this.keySplines[j]);
                                    }
                                }
                                else {
                                    break invalid;
                                }
                            }
                            else {
                                break invalid;
                            }
                        }
                    }
                    this.keyTimes = keyTimes;
                    this.values = values;
                    this.keySplines = keySplines.length ? keySplines : undefined;
                    this.duration = durationTotal;
                    this.iterationCount = 1;
                    this.accumulateSum = false;
                }
            }
        }
        setType(value) {
            let values;
            switch (value) {
                case 'translate':
                    this.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                    values = SvgAnimateTransform.toTranslateList(this.values);
                    break;
                case 'scale':
                    this.type = SVGTransform.SVG_TRANSFORM_SCALE;
                    values = SvgAnimateTransform.toScaleList(this.values);
                    break;
                case 'rotate':
                    this.type = SVGTransform.SVG_TRANSFORM_ROTATE;
                    values = SvgAnimateTransform.toRotateList(this.values);
                    break;
                case 'skewX':
                    this.type = SVGTransform.SVG_TRANSFORM_SKEWX;
                    values = SvgAnimateTransform.toSkewList(this.values);
                    break;
                case 'skewY':
                    this.type = SVGTransform.SVG_TRANSFORM_SKEWY;
                    values = SvgAnimateTransform.toSkewList(this.values);
                    break;
            }
            this.values = values ? values.map(array => array.join(' ')) : [];
        }
        get instanceType() {
            return 81928 /* SVG_ANIMATE_TRANSFORM */;
        }
    }

    const $util$4 = squared.lib.util;
    function insertAdjacentSplitValue(map, insertMap, time) {
        let previousTime = 0;
        let previousValue;
        let previous;
        let next;
        for (const [index, value] of map.entries()) {
            if (time === index) {
                previous = { index, value };
                break;
            }
            else if (time > previousTime && time < index) {
                previous = { index: previousTime, value: previousValue };
                next = { index, value };
                break;
            }
            previousTime = index;
            previousValue = value;
        }
        if (previous && next) {
            setTimelineValue(insertMap, time, getItemSplitValue(time, previous.index, previous.value, next.index, next.value));
        }
        else if (previous) {
            setTimelineValue(insertMap, time, previous.value);
        }
    }
    function convertToFraction(values) {
        const timeTotal = values[values.length - 1][0];
        const previousFractions = new Set();
        for (let i = 0; i < values.length; i++) {
            let fraction = values[i][0] / timeTotal;
            if (fraction > 0) {
                for (let j = 7;; j++) {
                    const value = parseFloat(fraction.toString().substring(0, j));
                    if (!previousFractions.has(value)) {
                        fraction = value;
                        break;
                    }
                }
            }
            values[i][0] = fraction;
            previousFractions.add(fraction);
        }
        return values;
    }
    function convertToAnimateValue(value) {
        if (typeof value === 'string') {
            if ($util$4.isNumber(value)) {
                value = parseFloat(value);
            }
            else {
                value = SvgBuild.toPointList(value);
                if (value.length === 0) {
                    value = '';
                }
            }
        }
        return value;
    }
    function convertToString(value) {
        if (Array.isArray(value)) {
            return value.map(pt => `${pt.x},${pt.y}`).join(' ');
        }
        return value.toString();
    }
    function getPathData(entries, path, parent) {
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
        const transformOrigin = TRANSFORM.origin(path.element);
        for (let i = 0; i < entries.length; i++) {
            const index = entries[i][0];
            const data = entries[i][1];
            const values = [];
            for (const attr of baseVal) {
                let value = data.get(attr);
                if (value === undefined) {
                    value = path.getBaseValue(attr);
                }
                if (value !== undefined) {
                    values.push(value);
                }
                else {
                    return undefined;
                }
            }
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
                    points = SvgBuild.applyTransforms(path.transformed, points, transformOrigin);
                }
                if (parent) {
                    parent.refitPoints(points);
                }
                switch (tagName) {
                    case 'line':
                    case 'polyline':
                        value = SvgBuild.drawPolyline(points, true);
                        break;
                    case 'rect':
                    case 'polygon':
                        value = SvgBuild.drawPolygon(points, true);
                        break;
                    case 'circle':
                    case 'ellipse':
                        const pt = points[0];
                        value = SvgBuild.drawEllipse(pt.x, pt.y, pt.rx, pt.ry, true);
                        break;
                }
                if (value !== undefined) {
                    result.push({ index, value });
                }
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
    function createKeyTimeMap(map, keyTimes, forwardMap) {
        const result = new Map();
        for (const keyTime of keyTimes) {
            const values = new Map();
            for (const attr in (forwardMap || map)) {
                let value;
                if (map[attr]) {
                    value = map[attr].get(keyTime);
                    if (value === undefined) {
                        value = getFreezeValue(map[attr], keyTime);
                    }
                }
                else if (forwardMap) {
                    value = forwardMap[attr].value;
                }
                if (value !== undefined) {
                    values.set(attr, value);
                }
            }
            result.set(keyTime, values);
        }
        return result;
    }
    function getItemTime(delay, duration, keyTimes, iteration, index) {
        return Math.round(delay + (keyTimes[index] + iteration) * duration);
    }
    function getItemValue(item, baseValue, values, iteration, index) {
        if (item.alternate && iteration % 2 !== 0) {
            values = values.slice(0).reverse();
        }
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
        else if (typeof baseValue === 'string') {
            if (item.additiveSum) {
                const baseArray = baseValue.split(/\s+/).map(value => parseFloat(value));
                const valuesArray = values.map(value => value.trim().split(/\s+/).map(xy => parseFloat(xy)));
                if (valuesArray.every(value => baseArray.length === value.length)) {
                    const result = valuesArray[index];
                    if (!item.accumulateSum) {
                        iteration = 0;
                    }
                    for (let i = 0; i < baseArray.length; i++) {
                        result[i] += baseArray[i];
                    }
                    for (let i = 0; i < iteration; i++) {
                        for (let j = 0; j < valuesArray.length; j++) {
                            for (let k = 0; k < valuesArray[j].length; k++) {
                                result[k] += valuesArray[j][k];
                            }
                        }
                    }
                    return result.join(' ');
                }
            }
            return values[index];
        }
        else if (Array.isArray(baseValue)) {
            return SvgBuild.toPointList(values[index]);
        }
        return baseValue;
    }
    function getItemSplitValue(fraction, previousFraction, previousValue, nextFraction, nextValue) {
        if (fraction > previousFraction) {
            if (typeof previousValue === 'number' && typeof nextValue === 'number') {
                return getSplitValue(previousValue, nextValue, (fraction - previousFraction) / (nextFraction - previousFraction));
            }
            else if (typeof previousValue === 'string' && typeof nextValue === 'string') {
                const previousArray = previousValue.split(' ').map(value => parseFloat(value));
                const nextArray = nextValue.split(' ').map(value => parseFloat(value));
                if (previousArray.length === nextArray.length) {
                    const result = [];
                    for (let i = 0; i < previousArray.length; i++) {
                        result.push(getItemSplitValue(fraction, previousFraction, previousArray[i], nextFraction, nextArray[i]));
                    }
                    return result.join(' ');
                }
            }
            else if (Array.isArray(previousValue) && Array.isArray(nextValue)) {
                const result = [];
                for (let i = 0; i < Math.min(previousValue.length, nextValue.length); i++) {
                    result.push({
                        x: getItemSplitValue(fraction, previousFraction, previousValue[i].x, nextFraction, nextValue[i].x),
                        y: getItemSplitValue(fraction, previousFraction, previousValue[i].y, nextFraction, nextValue[i].y)
                    });
                }
                return result;
            }
        }
        return previousValue;
    }
    function insertSplitValue(item, baseValue, keyTimes, values, keySplines, delay, iteration, time, keyTimeMode, timelineMap, interpolatorMap, transformOriginMap) {
        let actualTime;
        if (delay < 0) {
            actualTime = time - delay;
            delay = 0;
        }
        else {
            actualTime = time;
        }
        actualTime = getActualTime(actualTime);
        const fraction = Math.max(0, Math.min((actualTime - (delay + item.duration * iteration)) / item.duration, 1));
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
            value = getItemSplitValue(fraction, keyTimes[previousIndex], getItemValue(item, baseValue, values, iteration, previousIndex), keyTimes[nextIndex], getItemValue(item, baseValue, values, iteration, nextIndex));
        }
        else {
            nextIndex = previousIndex !== -1 ? previousIndex + 1 : keyTimes.length - 1;
            value = getItemValue(item, baseValue, values, iteration, nextIndex);
        }
        time = setTimelineValue(timelineMap, time, value);
        insertInterpolator(item, time, keySplines, nextIndex, keyTimeMode, interpolatorMap, transformOriginMap);
        return [time, value];
    }
    function appendPartialKeyTimes(item, startTime, maxThreadTime, baseValue, queued) {
        const keyTimes = item.keyTimes.slice(0);
        const values = item.values.slice(0);
        const keySplines = item.keySplines ? item.keySplines.slice(0) : new Array(values.length - 1).fill('');
        const completeTime = startTime + item.duration;
        let maxTime = startTime + item.getPartialDuration();
        for (let i = 0; i < queued.length; i++) {
            const sub = queued[i];
            if (sub !== item) {
                const durationTotal = getDurationTotal(sub);
                if (durationTotal > maxTime) {
                    const endTime = Math.min(completeTime, durationTotal);
                    substituteEnd: {
                        for (let j = getIterationStart(maxTime, sub.delay, sub.duration), joined = false;; j++) {
                            for (let k = 0; k < sub.keyTimes.length; k++) {
                                const time = getItemTime(sub.delay, sub.duration, sub.keyTimes, j, k);
                                if (time >= maxTime) {
                                    function insertSubstituteTimeValue(splitTime) {
                                        let splitValue;
                                        if (time === splitTime) {
                                            splitValue = convertToString(getItemValue(sub, baseValue, sub.values, j, k));
                                        }
                                        else {
                                            const fraction = (time - splitTime) / sub.duration;
                                            for (let l = 1; l < sub.keyTimes.length; l++) {
                                                if (fraction >= sub.keyTimes[l - 1] && fraction <= sub.keyTimes[l]) {
                                                    splitValue = convertToString(getItemSplitValue(fraction, sub.keyTimes[l - 1], getItemValue(sub, baseValue, sub.values, j, l - 1), sub.keyTimes[l], getItemValue(sub, baseValue, sub.values, j, l)));
                                                    break;
                                                }
                                            }
                                        }
                                        let resultTime = splitTime === endTime ? 1 : (splitTime % item.duration) / item.duration;
                                        if (resultTime === 0 && k > 0) {
                                            resultTime = 1;
                                        }
                                        if (splitValue !== undefined && !(resultTime === keyTimes[keyTimes.length - 1] && splitValue === values[values.length - 1])) {
                                            if (splitTime === maxTime) {
                                                resultTime += 1 / item.duration;
                                            }
                                            else {
                                                maxTime = splitTime;
                                            }
                                            keyTimes.push(resultTime);
                                            values.push(splitValue);
                                            if (keySplines) {
                                                keySplines.push(joined && sub.keySplines && sub.keySplines[k] ? sub.keySplines[k] : '');
                                            }
                                        }
                                    }
                                    if (!joined && time >= maxTime) {
                                        insertSubstituteTimeValue(maxTime);
                                        joined = true;
                                        if (time === maxTime) {
                                            continue;
                                        }
                                    }
                                    if (joined) {
                                        insertSubstituteTimeValue(Math.min(time, endTime));
                                        if (time >= endTime || keyTimes[keyTimes.length - 1] === 1) {
                                            break substituteEnd;
                                        }
                                        maxTime = time;
                                    }
                                }
                            }
                        }
                    }
                    if (durationTotal === endTime && durationTotal <= maxThreadTime) {
                        sub.addState(16 /* COMPLETE */);
                        queued.splice(i--, 1);
                    }
                    if (endTime === completeTime) {
                        break;
                    }
                }
                else if (maxThreadTime !== Number.POSITIVE_INFINITY && durationTotal < maxThreadTime) {
                    queued.splice(i--, 1);
                }
            }
        }
        return [keyTimes, values, keySplines];
    }
    function setTimelineValue(map, time, value) {
        if (value !== '') {
            let stored = map.get(time);
            let previousTime = false;
            if (stored === undefined) {
                stored = map.get(time - 1);
                previousTime = true;
            }
            if (stored !== value) {
                if (typeof value === 'number' && Math.round(stored) === Math.round(value)) {
                    return time;
                }
                while (time > 0 && map.has(time)) {
                    time++;
                }
                map.set(time, value);
            }
            else if (previousTime && !map.has(time)) {
                map.delete(time - 1);
                map.set(time, value);
            }
        }
        return time;
    }
    function insertInterpolator(item, time, keySplines, index, keyTimeMode, map, transformOriginMap) {
        if (!isKeyTimeFormat(SvgBuild.asAnimateTransform(item), keyTimeMode)) {
            if (index === 0) {
                return;
            }
            index--;
        }
        const value = keySplines && keySplines[index];
        if (value) {
            map.set(time, value);
        }
        if (transformOriginMap) {
            setTransformOrigin(transformOriginMap, item, time, index);
        }
    }
    function setTransformOrigin(map, item, time, index) {
        if (SvgBuild.asAnimateTransform(item) && item.transformOrigin && item.transformOrigin[index]) {
            map.set(time, item.transformOrigin[index]);
        }
    }
    function isKeyTimeFormat(transforming, keyTimeMode) {
        return $util$4.hasBit(keyTimeMode, transforming ? 32 /* KEYTIME_TRANSFORM */ : 4 /* KEYTIME_ANIMATE */);
    }
    function isFromToFormat(transforming, keyTimeMode) {
        return $util$4.hasBit(keyTimeMode, transforming ? 16 /* FROMTO_TRANSFORM */ : 2 /* FROMTO_ANIMATE */);
    }
    function playableAnimation(item) {
        return !item.paused && (item.element && item.duration !== -1 || item.keyTimes && item.keyTimes.length > 1 && item.duration > 0);
    }
    function getDurationTotal(item) {
        if (item.iterationCount !== -1) {
            return Math.min(item.delay + item.duration * item.iterationCount, item.end || Number.POSITIVE_INFINITY);
        }
        return Number.POSITIVE_INFINITY;
    }
    function getDurationMinimum(item) {
        return Math.min(item.delay + item.duration * (item.iterationCount !== -1 ? item.iterationCount : 1), item.end || Number.POSITIVE_INFINITY);
    }
    function getDurationGroupOrder(item) {
        return item.iterationCount === 'infinite' ? Number.POSITIVE_INFINITY : item.delay + item.duration * parseInt(item.iterationCount);
    }
    function getFreezeValue(map, time) {
        let lastTime = 0;
        let lastValue;
        for (const [freezeTime, value] of map.entries()) {
            if (time === freezeTime) {
                return value;
            }
            else if (time > lastTime && time < freezeTime) {
                return lastValue;
            }
            lastTime = freezeTime;
            lastValue = value;
        }
        return lastValue;
    }
    function cloneKeyTimes(item) {
        return [item.keyTimes.slice(0), item.values.slice(0), item.keySplines ? item.keySplines.slice(0) : undefined];
    }
    function checkPartialKeyTimes(keyTimes, values, keySplines, baseValue) {
        if (keyTimes[keyTimes.length - 1] < 1) {
            keyTimes.push(1);
            values.push(baseValue ? convertToString(baseValue) : values[0]);
            if (keySplines) {
                keySplines.push('');
            }
        }
    }
    function getActualTime(value) {
        if ((value + 1) % 10 === 0) {
            value++;
        }
        else if ((value - 1) % 10 === 0) {
            value--;
        }
        return value;
    }
    function getIterationStart(time, delay, duration) {
        return Math.floor(Math.max(0, time - delay) / duration);
    }
    var SvgSynchronize$MX = (Base) => {
        return class extends Base {
            getAnimateShape(element, animations) {
                if (animations === undefined) {
                    animations = this.animations;
                }
                const result = [];
                for (const item of animations) {
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
            getAnimateViewRect(animations) {
                if (animations === undefined) {
                    animations = this.animations;
                }
                const result = [];
                for (const item of animations) {
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
            getAnimateTransform(animations) {
                if (animations === undefined) {
                    animations = this.animations;
                }
                return animations.filter(item => SvgBuild.asAnimateTransform(item) && item.duration > 0);
            }
            mergeAnimations(animations, transformations, keyTimeMode = 0, path) {
                [animations, transformations].forEach((mergeable, index) => {
                    const transforming = index === 1;
                    if (mergeable.length === 0 || index === 0 && $util$4.hasBit(keyTimeMode, 8 /* IGNORE_ANIMATE */) || transforming && $util$4.hasBit(keyTimeMode, 64 /* IGNORE_TRANSFORM */)) {
                        return;
                    }
                    const staggered = [];
                    const setter = [];
                    {
                        const excluded = [];
                        for (let i = 0; i < mergeable.length; i++) {
                            if (mergeable[i].setterType) {
                                setter.push(mergeable[i]);
                            }
                            else {
                                const itemA = mergeable[i];
                                const timeA = getDurationTotal(itemA);
                                for (let j = 0; j < mergeable.length; j++) {
                                    const itemB = mergeable[j];
                                    if (i !== j && itemA.attributeName === itemB.attributeName && itemA.group.id < itemB.group.id && itemA.fillReplace && !itemB.partialType) {
                                        if (itemB.setterType) {
                                            if (itemA.delay === itemB.delay) {
                                                excluded[i] = itemA;
                                                break;
                                            }
                                        }
                                        else {
                                            const timeB = getDurationTotal(itemB);
                                            if (itemA.delay === itemB.delay && (!itemB.fillReplace || timeA <= timeB || itemB.iterationCount === -1) ||
                                                itemB.fillBackwards && itemA.delay <= itemB.delay && (itemB.fillForwards || itemA.fillReplace && timeA <= itemB.delay) ||
                                                itemA.element && itemB.element === undefined && (itemA.delay >= itemB.delay && timeA <= timeB || itemB.fillForwards)) {
                                                excluded[i] = itemA;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        const removeable = [];
                        for (let i = 0; i < mergeable.length; i++) {
                            const item = excluded[i];
                            if (item) {
                                if (!item.fillReplace) {
                                    item.setterType = true;
                                    setter.push(item);
                                }
                                else {
                                    removeable.push(mergeable[i]);
                                }
                            }
                            else if (!mergeable[i].setterType) {
                                staggered.push(mergeable[i]);
                            }
                        }
                        this._removeAnimations(removeable);
                    }
                    if (index === 0 && staggered.length + setter.length > 0 || transforming && (staggered.length + setter.length > 1 || staggered.length === 1 && (staggered[0].alternate || staggered[0].end !== undefined))) {
                        const groupActive = new Set(staggered.map(item => item.group.name));
                        for (const item of staggered) {
                            if (item.group.siblings) {
                                $util$4.spliceArray(item.group.siblings, subitem => !groupActive.has(subitem.name));
                            }
                        }
                        const groupName = {};
                        let repeatingDuration = 0;
                        for (const item of staggered) {
                            const attr = item.attributeName;
                            if (groupName[attr] === undefined) {
                                groupName[attr] = new Map();
                            }
                            const group = groupName[attr].get(item.delay) || [];
                            group.push(item);
                            groupName[attr].set(item.delay, group);
                        }
                        for (const attr in groupName) {
                            const groupDelay = new Map();
                            for (const delay of sortNumber(Array.from(groupName[attr].keys()))) {
                                const group = groupName[attr].get(delay);
                                if (group) {
                                    const duration = $util$4.maxArray(group.map(item => getDurationMinimum(item)));
                                    repeatingDuration = Math.max(repeatingDuration, duration);
                                    group.reverse();
                                    groupDelay.set(delay, group);
                                }
                            }
                            groupName[attr] = groupDelay;
                        }
                        const repeatingMap = {};
                        const repeatingInterpolatorMap = new Map();
                        const repeatingTransformOriginMap = transforming ? new Map() : undefined;
                        const repeatingAnimations = new Set();
                        const infiniteMap = {};
                        const infiniteInterpolatorMap = new Map();
                        const infiniteTransformOriginMap = transforming ? new Map() : undefined;
                        const baseValueMap = {};
                        const forwardMap = {};
                        const animateTimeRangeMap = new Map();
                        let repeatingResult;
                        let repeatingAsInfinite;
                        let infiniteResult;
                        function setTimeRange(type, startTime, endTime) {
                            if (type) {
                                animateTimeRangeMap.set(startTime, type);
                                if (endTime !== undefined) {
                                    animateTimeRangeMap.set(endTime, type);
                                }
                            }
                        }
                        for (const attr in groupName) {
                            repeatingMap[attr] = new Map();
                            if (!transforming) {
                                baseValueMap[attr] = this._getBaseValue(attr, path);
                            }
                            const groupDelay = [];
                            const groupData = [];
                            const groupItems = staggered.filter(item => item.attributeName === attr);
                            for (const [delay, data] of groupName[attr].entries()) {
                                groupDelay.push(delay);
                                groupData.push(data);
                            }
                            const incomplete = [];
                            const setterData = setter.filter(item => item.attributeName === attr);
                            const backwards = groupItems.filter(item => item.fillBackwards)[0];
                            let maxTime = -1;
                            let actualMaxTime = 0;
                            let baseValue;
                            let previousTransform;
                            let previousComplete;
                            let nextDelayTime;
                            function checkComplete(item, nextDelay) {
                                repeatingAnimations.add(item);
                                item.addState(16 /* COMPLETE */);
                                previousComplete = item;
                                if (item.fillForwards) {
                                    setFreezeValue(actualMaxTime, baseValue, item.type, item);
                                    if (item.group.siblings) {
                                        for (const previous of item.group.siblings) {
                                            if (previous.name === item.group.name) {
                                                return true;
                                            }
                                            else if (getDurationGroupOrder(previous) >= getDurationTotal(item)) {
                                                return false;
                                            }
                                        }
                                    }
                                }
                                else {
                                    if (item.fillFreeze) {
                                        setFreezeValue(actualMaxTime, baseValue, item.type, item);
                                    }
                                    if (nextDelay !== undefined) {
                                        let currentMaxTime = maxTime;
                                        const replaceValue = checkSetterDelay(actualMaxTime, actualMaxTime + 1);
                                        if (replaceValue !== undefined && item.fillReplace && nextDelay > actualMaxTime && incomplete.length === 0) {
                                            currentMaxTime = setTimelineValue(repeatingMap[attr], currentMaxTime, replaceValue);
                                            if (transforming) {
                                                setTimeRange(item.type, currentMaxTime);
                                            }
                                            baseValue = replaceValue;
                                            maxTime = currentMaxTime;
                                        }
                                    }
                                    checkIncomplete();
                                }
                                return false;
                            }
                            function setSetterValue(item, time, value) {
                                if (time === undefined) {
                                    time = item.delay;
                                }
                                if (value === undefined) {
                                    value = item.to;
                                }
                                return setTimelineValue(repeatingMap[attr], time, transforming ? value : convertToAnimateValue(value));
                            }
                            function sortSetterData(item) {
                                if (item) {
                                    setterData.push(item);
                                }
                                setterData.sort((a, b) => {
                                    if (a.delay === b.delay) {
                                        return a.group.id < b.group.id ? -1 : 1;
                                    }
                                    return a.delay < b.delay ? -1 : 1;
                                });
                                for (let i = 0; i < setterData.length - 1; i++) {
                                    if (setterData[i].delay === setterData[i + 1].delay) {
                                        setterData.splice(i--, 1);
                                    }
                                }
                            }
                            function checkSetterDelay(delayTime, endTime) {
                                let replaceValue = forwardMap[attr] && forwardMap[attr].value;
                                $util$4.spliceArray(setterData, set => set.delay >= delayTime && set.delay < endTime, (set) => {
                                    if (set.element) {
                                        removeIncomplete();
                                    }
                                    if (incomplete.length === 0) {
                                        baseValue = set.to;
                                    }
                                    setFreezeValue(set.delay, set.to, set.type, set);
                                    if (set.delay === delayTime) {
                                        replaceValue = transforming ? set.to : convertToAnimateValue(set.to);
                                    }
                                    else {
                                        maxTime = setSetterValue(set);
                                        actualMaxTime = set.delay;
                                    }
                                });
                                return replaceValue;
                            }
                            function checkIncomplete(delayIndex, itemIndex) {
                                if (incomplete.length) {
                                    $util$4.spliceArray(incomplete, previous => getDurationTotal(previous) <= actualMaxTime, previous => {
                                        previous.addState(16 /* COMPLETE */);
                                        if (previous.fillForwards) {
                                            setFreezeValue(getDurationTotal(previous), previous.valueTo, previous.type, previous);
                                            if (delayIndex !== undefined && itemIndex !== undefined) {
                                                for (let i = delayIndex; i < groupDelay.length; i++) {
                                                    if (i !== delayIndex) {
                                                        itemIndex = -1;
                                                    }
                                                    for (let j = itemIndex + 1; j < groupData[i].length; j++) {
                                                        const next = groupData[i][j];
                                                        if (previous.group.id > next.group.id) {
                                                            next.addState(16 /* COMPLETE */);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                            function queueIncomplete(item) {
                                if (!item.hasState(16 /* COMPLETE */, 64 /* INVALID */)) {
                                    item.addState(4 /* INTERRUPTED */);
                                    incomplete.push(item);
                                }
                            }
                            function sortIncomplete() {
                                incomplete.sort((a, b) => {
                                    if (a.element && b.element && a.delay !== b.delay) {
                                        return a.delay < b.delay ? 1 : -1;
                                    }
                                    return a.group.id <= b.group.id ? 1 : -1;
                                });
                            }
                            function removeIncomplete(item) {
                                if (item) {
                                    $util$4.spliceArray(incomplete, previous => previous === item);
                                }
                                else {
                                    $util$4.spliceArray(incomplete, previous => previous.element !== undefined);
                                }
                            }
                            function setFreezeValue(time, value, type = 0, item) {
                                if (!transforming) {
                                    value = convertToAnimateValue(value);
                                }
                                if (value !== '' && (forwardMap[attr] === undefined || time >= forwardMap[attr].time)) {
                                    forwardMap[attr] = {
                                        time,
                                        value,
                                        index: type
                                    };
                                }
                                if (item && SvgBuild.asAnimate(item) && !item.fillReplace) {
                                    if (item.fillForwards) {
                                        $util$4.spliceArray(setterData, set => set.group.id < item.group.id || set.delay < time);
                                        incomplete.length = 0;
                                        for (const group of groupData) {
                                            for (const next of group) {
                                                if (next.group.id < item.group.id) {
                                                    next.addState(16 /* COMPLETE */);
                                                }
                                            }
                                        }
                                    }
                                    else if (item.fillFreeze) {
                                        removeIncomplete();
                                    }
                                }
                            }
                            function resetTransform(additiveSum, resetTime, value) {
                                if (previousTransform && !additiveSum) {
                                    if (value === undefined) {
                                        value = TRANSFORM.typeAsValue(previousTransform.type);
                                    }
                                    maxTime = setTimelineValue(repeatingMap[attr], resetTime, value);
                                    if (resetTime !== maxTime) {
                                        setTimeRange(previousTransform.type, maxTime);
                                    }
                                }
                                previousTransform = undefined;
                            }
                            function removeInvalid(items) {
                                for (let i = 0; i < groupDelay.length; i++) {
                                    if (items.length) {
                                        for (let j = 0; j < groupData[i].length; j++) {
                                            if (items.includes(groupData[i][j])) {
                                                groupData[i].splice(j--, 1);
                                            }
                                        }
                                    }
                                    if (groupData[i].length === 0) {
                                        groupData.splice(i, 1);
                                        groupDelay.splice(i--, 1);
                                    }
                                }
                            }
                            if (backwards) {
                                baseValue = getItemValue(backwards, transforming ? '' : baseValueMap[attr], backwards.values, 0, 0);
                                maxTime = setTimelineValue(repeatingMap[attr], 0, baseValue);
                                if (transforming) {
                                    setTimeRange(backwards.type, 0);
                                    previousTransform = backwards;
                                }
                                let playing = true;
                                for (const item of groupItems) {
                                    if (item.group.id > backwards.group.id && item.delay <= backwards.delay) {
                                        playing = false;
                                        break;
                                    }
                                }
                                const durationTotal = getDurationTotal(backwards);
                                const removeable = [];
                                for (let i = 0; i < groupDelay.length; i++) {
                                    for (let j = 0; j < groupData[i].length; j++) {
                                        const item = groupData[i][j];
                                        if (playing) {
                                            if (item === backwards && (i !== 0 || j !== 0)) {
                                                groupData[i].splice(j--, 1);
                                                groupDelay.unshift(backwards.delay);
                                                groupData.unshift([backwards]);
                                                continue;
                                            }
                                            else if (item.group.id < backwards.group.id && (backwards.fillForwards || getDurationTotal(item) <= durationTotal)) {
                                                if (item.fillForwards) {
                                                    item.setterType = true;
                                                    setterData.push(item);
                                                }
                                                removeable.push(item);
                                                continue;
                                            }
                                        }
                                        if (item.element && item.delay <= backwards.delay) {
                                            groupData[i].splice(j--, 1);
                                            queueIncomplete(item);
                                        }
                                    }
                                }
                                removeInvalid(removeable);
                                backwards.addState(2 /* BACKWARDS */);
                            }
                            if (!transforming) {
                                if (forwardMap[attr] === undefined) {
                                    setFreezeValue(0, baseValueMap[attr], 0);
                                }
                                if (baseValue === undefined) {
                                    baseValue = forwardMap[attr].value;
                                }
                            }
                            sortSetterData();
                            {
                                let previous;
                                $util$4.spliceArray(setterData, set => set.delay <= groupDelay[0], set => {
                                    const fillForwards = SvgBuild.asAnimate(set) && set.fillForwards;
                                    if (set.delay < groupDelay[0] && (backwards === undefined || fillForwards)) {
                                        if (backwards && fillForwards) {
                                            setFreezeValue(set.delay, set.to, set.type);
                                        }
                                        else {
                                            const previousTime = set.delay - 1;
                                            if (previous === undefined) {
                                                if (!repeatingMap[attr].has(0)) {
                                                    setSetterValue(set, 0, baseValueMap[attr]);
                                                    setSetterValue(set, previousTime, baseValueMap[attr]);
                                                }
                                                else {
                                                    setSetterValue(set, previousTime, baseValue);
                                                }
                                            }
                                            else {
                                                setSetterValue(previous, previousTime);
                                            }
                                            maxTime = setSetterValue(set);
                                            actualMaxTime = set.delay;
                                            previous = set;
                                        }
                                    }
                                });
                                if (previous) {
                                    setSetterValue(previous, groupDelay[0] - 1);
                                }
                            }
                            attributeEnd: {
                                for (let i = 0; i < groupDelay.length; i++) {
                                    let delay = groupDelay[i];
                                    for (let j = 0; j < groupData[i].length; j++) {
                                        const item = groupData[i][j];
                                        if (item.hasState(16 /* COMPLETE */, 64 /* INVALID */)) {
                                            continue;
                                        }
                                        const infinite = item.iterationCount === -1;
                                        const duration = item.duration;
                                        const iterationCount = item.iterationCount;
                                        let durationTotal;
                                        if (!infinite) {
                                            durationTotal = getDurationTotal(item);
                                            if (durationTotal <= maxTime) {
                                                if (item.fillReplace) {
                                                    item.addState(64 /* INVALID */);
                                                }
                                                else {
                                                    queueIncomplete(item);
                                                }
                                                continue;
                                            }
                                        }
                                        else {
                                            durationTotal = delay + duration;
                                        }
                                        let iterationTotal;
                                        let iterationFraction;
                                        if (infinite) {
                                            iterationTotal = Math.ceil((repeatingDuration - delay) / duration);
                                            iterationFraction = 0;
                                        }
                                        else {
                                            iterationTotal = Math.ceil(iterationCount);
                                            iterationFraction = iterationCount - Math.floor(iterationCount);
                                        }
                                        if (setterData.length && actualMaxTime > 0 && actualMaxTime < delay) {
                                            checkSetterDelay(actualMaxTime, delay);
                                        }
                                        if (maxTime !== -1 && maxTime < delay) {
                                            maxTime = setTimelineValue(repeatingMap[attr], delay - 1, baseValue);
                                            actualMaxTime = delay;
                                        }
                                        nextDelayTime = undefined;
                                        if (item.group.siblings && item.group.siblings.length > 1) {
                                            let checkDelay = true;
                                            for (const order of item.group.siblings) {
                                                if (order.name === item.group.name) {
                                                    checkDelay = false;
                                                    break;
                                                }
                                                else if (!order.paused && actualMaxTime <= order.delay && order.attributes.includes(attr)) {
                                                    break;
                                                }
                                            }
                                            if (checkDelay) {
                                                nextDelay: {
                                                    for (let k = i + 1; k < groupDelay.length; k++) {
                                                        for (let l = 0; l < groupData[k].length; l++) {
                                                            const next = groupData[k][l];
                                                            if (next.group.siblings) {
                                                                nextDelayTime = next.delay;
                                                                break nextDelay;
                                                            }
                                                            else {
                                                                if (getDurationTotal(next) <= durationTotal) {
                                                                    if (next.fillFreeze) {
                                                                        sortSetterData(next);
                                                                    }
                                                                    next.addState(16 /* COMPLETE */);
                                                                }
                                                                else if (next.delay < durationTotal) {
                                                                    queueIncomplete(next);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        else {
                                            for (let k = i + 1; k < groupDelay.length; k++) {
                                                if (groupDelay[k] !== Number.POSITIVE_INFINITY && groupData[k].length && !groupData[k].every(next => next.hasState(16 /* COMPLETE */, 64 /* INVALID */))) {
                                                    nextDelayTime = groupDelay[k];
                                                    break;
                                                }
                                            }
                                        }
                                        const actualStartTime = actualMaxTime;
                                        let startTime = maxTime + 1;
                                        let maxThreadTime = Math.min(nextDelayTime || Number.POSITIVE_INFINITY, item.end || Number.POSITIVE_INFINITY);
                                        let setterInterrupt;
                                        if (setterData.length && item.element) {
                                            const interruptTime = Math.min(nextDelayTime || Number.POSITIVE_INFINITY, durationTotal, maxThreadTime);
                                            setterInterrupt = setterData.find(set => set.delay >= actualMaxTime && set.delay <= interruptTime);
                                            if (setterInterrupt) {
                                                switch (setterInterrupt.delay) {
                                                    case actualMaxTime:
                                                        baseValue = setterInterrupt.to;
                                                        setFreezeValue(actualMaxTime, baseValue, setterInterrupt.type, setterInterrupt);
                                                        if (setterInterrupt.group.id > item.group.id) {
                                                            if (transforming && previousTransform) {
                                                                resetTransform(item.additiveSum, Math.max(delay - 1, maxTime));
                                                            }
                                                            maxTime = setSetterValue(setterInterrupt, Math.max(setterInterrupt.delay, maxTime), baseValue);
                                                            maxThreadTime = -1;
                                                        }
                                                        break;
                                                    case nextDelayTime:
                                                        setterInterrupt.addState(32 /* EQUAL_TIME */);
                                                        break;
                                                    default:
                                                        maxThreadTime = setterInterrupt.delay;
                                                        setterInterrupt.addState(32 /* EQUAL_TIME */);
                                                        break;
                                                }
                                                $util$4.spliceArray(setterData, set => set !== setterInterrupt);
                                                item.addState(4 /* INTERRUPTED */);
                                            }
                                        }
                                        let complete = false;
                                        let lastValue;
                                        if (maxThreadTime > maxTime) {
                                            if (transforming) {
                                                if (previousTransform) {
                                                    resetTransform(item.additiveSum, Math.max(delay - 1, maxTime));
                                                    startTime = maxTime + 1;
                                                }
                                                baseValue = TRANSFORM.typeAsValue(item.type);
                                                setFreezeValue(actualMaxTime, baseValue, item.type);
                                            }
                                            let parallel = groupDelay[i] === Number.POSITIVE_INFINITY || (maxTime !== -1 || item.hasState(2 /* BACKWARDS */)) && !(i === 0 && j === 0);
                                            complete = true;
                                            threadTimeExceeded: {
                                                for (let k = getIterationStart(actualMaxTime, delay, duration); k < iterationTotal; k++) {
                                                    let keyTimes;
                                                    let values;
                                                    let keySplines;
                                                    if (item.partialType) {
                                                        if (actualMaxTime + item.getPartialDuration(k) < maxThreadTime && (incomplete.length || j < groupData[i].length - 1)) {
                                                            for (let l = j + 1; l < groupData[i].length; l++) {
                                                                queueIncomplete(groupData[i][l]);
                                                            }
                                                            groupData[i].length = 0;
                                                            sortIncomplete();
                                                            [keyTimes, values, keySplines] = appendPartialKeyTimes(item, actualMaxTime === 0 ? delay : actualMaxTime, maxThreadTime, baseValue, incomplete);
                                                        }
                                                        else {
                                                            [keyTimes, values, keySplines] = cloneKeyTimes(item);
                                                        }
                                                        checkPartialKeyTimes(keyTimes, values, keySplines, baseValueMap[attr]);
                                                    }
                                                    else {
                                                        keyTimes = item.keyTimes;
                                                        values = item.values;
                                                        keySplines = item.keySplines;
                                                    }
                                                    for (let l = 0; l < keyTimes.length; l++) {
                                                        const keyTime = keyTimes[l];
                                                        let time;
                                                        let value = getItemValue(item, baseValue, values, k, l);
                                                        if (k === iterationTotal - 1 && iterationFraction > 0) {
                                                            if (iterationFraction === keyTime) {
                                                                iterationFraction = -1;
                                                            }
                                                            else if (l === keyTimes.length - 1) {
                                                                time = durationTotal;
                                                                actualMaxTime = time;
                                                                value = getItemSplitValue(iterationFraction, keyTimes[l - 1], getItemValue(item, baseValue, values, k, l - 1), keyTime, value);
                                                                iterationFraction = -1;
                                                            }
                                                            else if (iterationFraction > keyTime) {
                                                                for (let m = l + 1; m < keyTimes.length; m++) {
                                                                    if (iterationFraction <= keyTimes[m]) {
                                                                        time = durationTotal;
                                                                        actualMaxTime = time;
                                                                        value = getItemSplitValue(iterationFraction, keyTime, value, keyTimes[m], getItemValue(item, baseValue, values, k, m));
                                                                        iterationFraction = -1;
                                                                        break;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        if (time === undefined) {
                                                            time = getItemTime(delay, duration, keyTimes, k, l);
                                                            if (time < 0 || time < maxTime) {
                                                                continue;
                                                            }
                                                            if (time === maxThreadTime) {
                                                                complete = k === iterationTotal - 1 && l === keyTimes.length - 1;
                                                                actualMaxTime = time;
                                                            }
                                                            else {
                                                                function setSplitValue(splitTime) {
                                                                    [maxTime, lastValue] = insertSplitValue(item, baseValue, keyTimes, values, keySplines, delay, k, splitTime, keyTimeMode, repeatingMap[attr], repeatingInterpolatorMap, repeatingTransformOriginMap);
                                                                }
                                                                if (delay < 0 && maxTime === -1) {
                                                                    if (time > 0) {
                                                                        actualMaxTime = 0;
                                                                        setSplitValue(0);
                                                                    }
                                                                }
                                                                else {
                                                                    if (time > maxThreadTime) {
                                                                        if (parallel && maxTime + 1 < maxThreadTime) {
                                                                            setSplitValue(maxTime);
                                                                        }
                                                                        actualMaxTime = maxThreadTime;
                                                                        setSplitValue(maxThreadTime + (maxThreadTime === nextDelayTime && !repeatingMap[attr].has(maxThreadTime - 1) ? -1 : 0));
                                                                        complete = false;
                                                                        break threadTimeExceeded;
                                                                    }
                                                                    else {
                                                                        if (parallel) {
                                                                            if (item.hasState(2 /* BACKWARDS */)) {
                                                                                actualMaxTime = actualStartTime;
                                                                            }
                                                                            if (delay >= maxTime) {
                                                                                time = Math.max(delay, maxTime + 1);
                                                                                actualMaxTime = delay;
                                                                            }
                                                                            else if (time === maxTime) {
                                                                                actualMaxTime = time;
                                                                                time = maxTime + 1;
                                                                            }
                                                                            else {
                                                                                setSplitValue(maxTime);
                                                                                actualMaxTime = Math.max(time, maxTime);
                                                                            }
                                                                            parallel = false;
                                                                        }
                                                                        else {
                                                                            actualMaxTime = time;
                                                                            if (k > 0 && l === 0 && item.accumulateSum) {
                                                                                insertInterpolator(item, time, keySplines, l, keyTimeMode, repeatingInterpolatorMap, repeatingTransformOriginMap);
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
                                                            if (l === keyTimes.length - 1 && (k < iterationTotal - 1 || item.fillReplace && value !== forwardMap[attr].value) && !item.accumulateSum) {
                                                                time--;
                                                            }
                                                            maxTime = setTimelineValue(repeatingMap[attr], time, value);
                                                            insertInterpolator(item, maxTime, keySplines, l, keyTimeMode, repeatingInterpolatorMap, repeatingTransformOriginMap);
                                                            lastValue = value;
                                                        }
                                                        if (!complete || iterationFraction === -1) {
                                                            break threadTimeExceeded;
                                                        }
                                                    }
                                                }
                                            }
                                            checkIncomplete(i, j);
                                        }
                                        if (lastValue !== undefined) {
                                            baseValue = lastValue;
                                            if (transforming) {
                                                setTimeRange(item.type, startTime, maxTime);
                                                previousTransform = item;
                                            }
                                        }
                                        if (setterInterrupt) {
                                            if (setterInterrupt.hasState(32 /* EQUAL_TIME */)) {
                                                lastValue = setterInterrupt.to;
                                                maxTime = setSetterValue(setterInterrupt, setterInterrupt.delay, lastValue);
                                                actualMaxTime = setterInterrupt.delay;
                                                setFreezeValue(actualMaxTime, lastValue, setterInterrupt.type, setterInterrupt);
                                            }
                                            else if (item.hasState(64 /* INVALID */)) {
                                                setTimeRange(maxTime, setterInterrupt.type);
                                            }
                                            removeIncomplete();
                                            complete = true;
                                        }
                                        $util$4.spliceArray(setterData, set => set.delay >= actualStartTime && set.delay <= actualMaxTime, (set) => {
                                            setFreezeValue(set.delay, set.to, set.type, set);
                                            if (set.element) {
                                                removeIncomplete();
                                            }
                                        });
                                        if (infinite) {
                                            if (complete) {
                                                if (setterInterrupt === undefined) {
                                                    infiniteMap[attr] = item;
                                                    break attributeEnd;
                                                }
                                            }
                                            else {
                                                incomplete.length = 0;
                                                incomplete.push(item);
                                                continue;
                                            }
                                        }
                                        if (complete) {
                                            nextDelayTime = nextDelayTime || Number.POSITIVE_INFINITY;
                                            if (!infinite && checkComplete(item, nextDelayTime)) {
                                                break attributeEnd;
                                            }
                                            for (let k = i; k < groupDelay.length; k++) {
                                                if (groupDelay[k] < actualMaxTime) {
                                                    for (let l = 0; l < groupData[k].length; l++) {
                                                        const next = groupData[k][l];
                                                        const durationNext = getDurationTotal(next);
                                                        if (durationNext > actualMaxTime && !next.hasState(4 /* INTERRUPTED */, 16 /* COMPLETE */, 64 /* INVALID */)) {
                                                            queueIncomplete(next);
                                                        }
                                                        else if (!next.fillReplace) {
                                                            setFreezeValue(durationNext, next.valueTo, next.type, next);
                                                        }
                                                    }
                                                    groupDelay[k] = Number.POSITIVE_INFINITY;
                                                    groupData[k].length = 0;
                                                }
                                            }
                                            if (incomplete.length && actualMaxTime < nextDelayTime) {
                                                sortIncomplete();
                                                const resume = incomplete.filter(next => next.delay <= actualMaxTime)[0];
                                                if (resume) {
                                                    resume.removeState(4 /* INTERRUPTED */, 2 /* BACKWARDS */);
                                                    resume.addState(8 /* RESUME */);
                                                    removeIncomplete(resume);
                                                    delay = resume.delay;
                                                    groupData[i] = [resume];
                                                    j = -1;
                                                }
                                            }
                                        }
                                        else {
                                            queueIncomplete(item);
                                        }
                                    }
                                }
                                if (incomplete.length) {
                                    sortIncomplete();
                                    for (let i = 0; i < incomplete.length; i++) {
                                        const item = incomplete[i];
                                        const delay = item.delay;
                                        const duration = item.duration;
                                        const durationTotal = maxTime - delay;
                                        let maxThreadTime = Number.POSITIVE_INFINITY;
                                        function insertKeyTimes() {
                                            let keyTimes;
                                            let values;
                                            let keySplines;
                                            if (item.partialType) {
                                                if (actualMaxTime + item.getPartialDuration() < maxThreadTime && i < incomplete.length - 1) {
                                                    [keyTimes, values, keySplines] = appendPartialKeyTimes(item, actualMaxTime, maxThreadTime, baseValue, incomplete);
                                                }
                                                else {
                                                    [keyTimes, values, keySplines] = cloneKeyTimes(item);
                                                }
                                                checkPartialKeyTimes(keyTimes, values, keySplines, baseValueMap[attr]);
                                            }
                                            else {
                                                keyTimes = item.keyTimes;
                                                values = item.values;
                                                keySplines = item.keySplines;
                                            }
                                            const startTime = maxTime + 1;
                                            let j = Math.floor(durationTotal / duration);
                                            let joined = false;
                                            do {
                                                for (let k = 0; k < keyTimes.length; k++) {
                                                    let time = getItemTime(delay, duration, keyTimes, j, k);
                                                    if (!joined && time >= maxTime) {
                                                        [maxTime, baseValue] = insertSplitValue(item, baseValue, keyTimes, values, keySplines, delay, j, maxTime, keyTimeMode, repeatingMap[attr], repeatingInterpolatorMap, repeatingTransformOriginMap);
                                                        joined = true;
                                                    }
                                                    if (joined) {
                                                        if (time >= maxThreadTime) {
                                                            if (maxThreadTime > maxTime) {
                                                                [maxTime, baseValue] = insertSplitValue(item, baseValue, keyTimes, values, keySplines, delay, j, maxThreadTime, keyTimeMode, repeatingMap[attr], repeatingInterpolatorMap, repeatingTransformOriginMap);
                                                                actualMaxTime = maxThreadTime;
                                                            }
                                                        }
                                                        else if (time > maxTime) {
                                                            actualMaxTime = time;
                                                            if (k === keyTimes.length - 1 && time < maxThreadTime) {
                                                                time--;
                                                            }
                                                            baseValue = getItemValue(item, baseValue, values, j, k);
                                                            maxTime = setTimelineValue(repeatingMap[attr], time, baseValue);
                                                            insertInterpolator(item, maxTime, keySplines, k, keyTimeMode, repeatingInterpolatorMap, repeatingTransformOriginMap);
                                                        }
                                                    }
                                                }
                                            } while (maxTime < maxThreadTime && ++j);
                                            if (transforming) {
                                                setTimeRange(item.type, startTime, maxTime);
                                            }
                                        }
                                        if (item.iterationCount === -1) {
                                            if (durationTotal > 0 && durationTotal % item.duration !== 0) {
                                                maxThreadTime = delay + item.duration * Math.ceil(durationTotal / duration);
                                                insertKeyTimes();
                                            }
                                            infiniteMap[attr] = item;
                                            break attributeEnd;
                                        }
                                        else {
                                            maxThreadTime = Math.min(delay + item.duration * item.iterationCount, item.end || Number.POSITIVE_INFINITY);
                                            if (maxThreadTime > maxTime) {
                                                insertKeyTimes();
                                                if (checkComplete(item)) {
                                                    break attributeEnd;
                                                }
                                            }
                                        }
                                    }
                                }
                                if (previousComplete && previousComplete.fillReplace && infiniteMap[attr] === undefined) {
                                    let type;
                                    let value;
                                    if (forwardMap[attr]) {
                                        type = forwardMap[attr].index;
                                        value = forwardMap[attr].value;
                                    }
                                    else {
                                        if (transforming) {
                                            type = Array.from(animateTimeRangeMap.values()).pop();
                                            value = TRANSFORM.typeAsValue(type);
                                        }
                                        else {
                                            value = this._getBaseValue(attr, path);
                                        }
                                    }
                                    if (value !== undefined && JSON.stringify(repeatingMap[attr].get(maxTime)) !== JSON.stringify(value)) {
                                        maxTime = setTimelineValue(repeatingMap[attr], maxTime, value);
                                        setTimeRange(type, maxTime);
                                    }
                                }
                            }
                        }
                        {
                            const keyTimesRepeating = [];
                            for (const attr in repeatingMap) {
                                keyTimesRepeating.push(...repeatingMap[attr].keys());
                            }
                            let repeatingEndTime = $util$4.maxArray(keyTimesRepeating);
                            if (Object.keys(infiniteMap).length) {
                                const delay = [];
                                const duration = [];
                                for (const attr in infiniteMap) {
                                    delay.push(infiniteMap[attr].delay);
                                    duration.push(infiniteMap[attr].duration);
                                }
                                if (repeatingAnimations.size === 0 && delay[0] === keyTimesRepeating[0] && new Set(delay).size === 1 && new Set(duration).size === 1) {
                                    repeatingAsInfinite = delay[0] <= 0 ? 0 : delay[0];
                                }
                                else {
                                    if (duration.length > 1) {
                                        repeatingEndTime = getLeastCommonMultiple(duration, delay);
                                    }
                                    else if ((repeatingEndTime - delay[0]) % duration[0] !== 0) {
                                        repeatingEndTime = duration[0] * Math.ceil(repeatingEndTime / duration[0]);
                                    }
                                }
                            }
                            if (repeatingAsInfinite === undefined) {
                                for (const attr in repeatingMap) {
                                    if (infiniteMap[attr]) {
                                        let maxTime = Array.from(repeatingMap[attr].keys()).pop();
                                        if (maxTime < repeatingEndTime) {
                                            const item = infiniteMap[attr];
                                            const delay = item.delay;
                                            const startTime = maxTime + 1;
                                            let baseValue = Array.from(repeatingMap[attr].values()).pop();
                                            let i = Math.floor((maxTime - delay) / item.duration);
                                            do {
                                                let joined = false;
                                                for (let j = 0; j < item.keyTimes.length; j++) {
                                                    let time = getItemTime(delay, item.duration, item.keyTimes, i, j);
                                                    if (!joined && time >= maxTime) {
                                                        [maxTime, baseValue] = insertSplitValue(item, baseValue, item.keyTimes, item.values, item.keySplines, delay, i, maxTime, keyTimeMode, repeatingMap[attr], repeatingInterpolatorMap, repeatingTransformOriginMap);
                                                        keyTimesRepeating.push(maxTime);
                                                        joined = true;
                                                    }
                                                    if (joined && time > maxTime) {
                                                        if (j === item.keyTimes.length - 1 && time < repeatingEndTime) {
                                                            time--;
                                                        }
                                                        baseValue = getItemValue(item, baseValue, item.values, i, j);
                                                        maxTime = setTimelineValue(repeatingMap[attr], time, baseValue);
                                                        insertInterpolator(item, time, item.keySplines, j, keyTimeMode, repeatingInterpolatorMap, repeatingTransformOriginMap);
                                                        keyTimesRepeating.push(maxTime);
                                                    }
                                                }
                                            } while (maxTime < repeatingEndTime && ++i);
                                            if (transforming) {
                                                setTimeRange(item.type, startTime, maxTime);
                                            }
                                        }
                                    }
                                }
                            }
                            const keyTimes = sortNumber(Array.from(new Set(keyTimesRepeating)));
                            if (path || transforming) {
                                for (const attr in repeatingMap) {
                                    if (!repeatingMap[attr].has(0) && baseValueMap[attr] !== undefined) {
                                        const endTime = repeatingMap[attr].keys().next().value - 1;
                                        repeatingMap[attr].set(0, baseValueMap[attr]);
                                        repeatingMap[attr].set(endTime, baseValueMap[attr]);
                                        if (!keyTimes.includes(0)) {
                                            keyTimes.push(0);
                                        }
                                        if (!keyTimes.includes(endTime)) {
                                            keyTimes.push(endTime);
                                        }
                                        sortNumber(keyTimes);
                                    }
                                }
                            }
                            const timelineMap = {};
                            for (const attr in repeatingMap) {
                                const result = new Map();
                                const maxTime = $util$4.maxArray(Array.from(repeatingMap[attr].keys()));
                                for (let i = 0; i < keyTimes.length; i++) {
                                    const keyTime = keyTimes[i];
                                    if (keyTime <= maxTime) {
                                        const value = repeatingMap[attr].get(keyTime);
                                        if (value === undefined) {
                                            insertAdjacentSplitValue(repeatingMap[attr], result, keyTime);
                                        }
                                        else {
                                            result.set(keyTime, value);
                                        }
                                    }
                                }
                                timelineMap[attr] = result;
                            }
                            repeatingResult = createKeyTimeMap(timelineMap, keyTimes);
                        }
                        if (repeatingAsInfinite === undefined && Object.keys(infiniteMap).length) {
                            const timelineMap = {};
                            const infiniteAnimations = [];
                            let keyTimes = [];
                            for (const attr in infiniteMap) {
                                infiniteAnimations.push(infiniteMap[attr]);
                            }
                            const maxDuration = getLeastCommonMultiple(infiniteAnimations.map(item => item.duration));
                            for (const item of infiniteAnimations) {
                                const attr = item.attributeName;
                                timelineMap[attr] = new Map();
                                let baseValue = Array.from(repeatingMap[attr].values()).pop();
                                let maxTime = 0;
                                let i = 0;
                                do {
                                    for (let j = 0; j < item.keyTimes.length; j++) {
                                        let time = getItemTime(0, item.duration, item.keyTimes, i, j);
                                        if (j === item.keyTimes.length - 1 && time < maxDuration) {
                                            time--;
                                        }
                                        baseValue = getItemValue(item, baseValue, item.values, i, j);
                                        maxTime = setTimelineValue(timelineMap[attr], time, baseValue);
                                        insertInterpolator(item, maxTime, item.keySplines, j, keyTimeMode, infiniteInterpolatorMap, infiniteTransformOriginMap);
                                        keyTimes.push(maxTime);
                                    }
                                } while (maxTime < maxDuration && ++i);
                            }
                            if (infiniteAnimations.every(item => item.alternate)) {
                                let maxTime = -1;
                                for (const attr in infiniteMap) {
                                    const times = Array.from(timelineMap[attr].keys());
                                    const values = Array.from(timelineMap[attr].values()).reverse();
                                    for (let i = 0; i < times.length; i++) {
                                        if (times[i] !== 0) {
                                            maxTime = maxDuration + times[i];
                                            const interpolator = infiniteInterpolatorMap.get(times[i]);
                                            if (interpolator) {
                                                infiniteInterpolatorMap.set(maxTime, interpolator);
                                            }
                                            maxTime = setTimelineValue(timelineMap[attr], maxTime, values[i]);
                                            keyTimes.push(maxTime);
                                        }
                                    }
                                }
                            }
                            keyTimes = sortNumber(Array.from(new Set(keyTimes)));
                            for (const attr in timelineMap) {
                                for (const keyTime of keyTimes) {
                                    if (!timelineMap[attr].has(keyTime)) {
                                        insertAdjacentSplitValue(timelineMap[attr], timelineMap[attr], keyTime);
                                    }
                                }
                            }
                            infiniteResult = createKeyTimeMap(timelineMap, keyTimes, forwardMap);
                        }
                        if (repeatingResult || infiniteResult) {
                            this._removeAnimations(staggered);
                            const timeRange = Array.from(animateTimeRangeMap.entries());
                            const synchronizedName = Array.from(staggered.map(item => SvgBuild.asAnimateTransform(item) ? TRANSFORM.typeAsName(item.type) : item.attributeName)).join('-');
                            [repeatingResult, infiniteResult].forEach(result => {
                                if (result) {
                                    const repeating = result === repeatingResult;
                                    const interpolatorMap = repeating ? repeatingInterpolatorMap : infiniteInterpolatorMap;
                                    const transformOriginMap = (repeating ? repeatingTransformOriginMap : infiniteTransformOriginMap);
                                    if (isKeyTimeFormat(transforming, keyTimeMode)) {
                                        const keySplines = [];
                                        if (transforming) {
                                            const transformMap = [];
                                            if (repeating) {
                                                const entries = Array.from(result.entries());
                                                let type = timeRange[0][1];
                                                for (let i = 0, j = 0, k = 0; i < timeRange.length; i++) {
                                                    const next = i < timeRange.length - 1 ? timeRange[i + 1][1] : -1;
                                                    if (type !== next) {
                                                        const map = new Map();
                                                        for (let l = k; l < entries.length; l++) {
                                                            const keyTime = entries[l][0];
                                                            if (keyTime >= timeRange[j][0] && keyTime <= timeRange[i][0]) {
                                                                map.set(keyTime, new Map([[type, entries[l][1].values().next().value]]));
                                                                k = l;
                                                            }
                                                            else if (keyTime > timeRange[i][0]) {
                                                                break;
                                                            }
                                                        }
                                                        transformMap.push(map);
                                                        type = next;
                                                        j = i + 1;
                                                    }
                                                }
                                            }
                                            else if (infiniteMap['transform']) {
                                                const entries = Array.from(result.entries());
                                                const map = new Map();
                                                for (const item of entries) {
                                                    map.set(item[0], new Map([[infiniteMap['transform'].type, item[1].values().next().value]]));
                                                }
                                                transformMap.push(map);
                                            }
                                            else {
                                                return;
                                            }
                                            let previousEndTime = 0;
                                            for (let i = 0; i < transformMap.length; i++) {
                                                const entries = Array.from(transformMap[i].entries());
                                                let delay = entries[0][0];
                                                if (entries.length === 1) {
                                                    if (i < transformMap.length - 1) {
                                                        entries.push([transformMap[i + 1].keys().next().value, entries[0][1]]);
                                                    }
                                                    else {
                                                        entries.push([delay + 1, entries[0][1]]);
                                                    }
                                                }
                                                const endTime = entries[entries.length - 1][0];
                                                let duration = endTime - delay;
                                                const animate = new SvgAnimateTransform();
                                                animate.attributeName = 'transform';
                                                animate.type = entries[0][1].keys().next().value;
                                                for (let j = 0; j < entries.length; j++) {
                                                    const item = entries[j];
                                                    keySplines.push(interpolatorMap.get(item[0]) || '');
                                                    if (animate.type !== SVGTransform.SVG_TRANSFORM_ROTATE) {
                                                        const transformOrigin = transformOriginMap.get(item[0]);
                                                        if (transformOrigin) {
                                                            if (animate.transformOrigin === undefined) {
                                                                animate.transformOrigin = [];
                                                            }
                                                            animate.transformOrigin[j] = transformOrigin;
                                                        }
                                                    }
                                                    item[0] -= delay;
                                                }
                                                for (const [keyTime, data] of convertToFraction(entries)) {
                                                    animate.keyTimes.push(keyTime);
                                                    animate.values.push(data.values().next().value);
                                                }
                                                delay -= previousEndTime;
                                                if (delay > 1) {
                                                    animate.delay = delay;
                                                }
                                                else if (delay === 1 && (duration + 1) % 10 === 0) {
                                                    duration++;
                                                }
                                                animate.duration = duration;
                                                animate.keySplines = keySplines;
                                                animate.synchronized = { index: i, value: '' };
                                                previousEndTime = endTime;
                                                this._insertAnimate(animate, repeating);
                                            }
                                        }
                                        else {
                                            const entries = Array.from(result.entries());
                                            const delay = repeatingAsInfinite || 0;
                                            let object;
                                            for (const item of entries) {
                                                keySplines.push(interpolatorMap.get(item[0]) || '');
                                                item[0] -= delay;
                                            }
                                            if (path) {
                                                const pathData = getPathData(convertToFraction(entries), path, this.parent);
                                                if (pathData) {
                                                    object = new SvgAnimate();
                                                    object.attributeName = 'd';
                                                    for (const item of pathData) {
                                                        object.keyTimes.push(item.index);
                                                        object.values.push(item.value.toString());
                                                    }
                                                }
                                                else {
                                                    return;
                                                }
                                            }
                                            else {
                                                const animate = new SvgAnimateTransform();
                                                animate.attributeName = 'transform';
                                                animate.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                                                for (const [keyTime, data] of result.entries()) {
                                                    const x = data.get('x') || 0;
                                                    const y = data.get('y') || 0;
                                                    animate.keyTimes.push(keyTime);
                                                    animate.values.push(this.parent ? `${this.parent.refitX(x)} ${this.parent.refitX(y)}` : `${x} ${y}`);
                                                }
                                                object = animate;
                                            }
                                            object.delay = delay;
                                            object.keySplines = keySplines;
                                            object.duration = entries[entries.length - 1][0];
                                            this._insertAnimate(object, repeating);
                                        }
                                    }
                                    else if (isFromToFormat(transforming, keyTimeMode)) {
                                        const entries = Array.from(result.entries());
                                        for (let i = 0; i < entries.length - 1; i++) {
                                            const [keyTimeFrom, dataFrom] = entries[i];
                                            const [keyTimeTo, dataTo] = entries[i + 1];
                                            let object;
                                            let value = synchronizedName;
                                            if (transforming) {
                                                const animate = new SvgAnimateTransform();
                                                animate.attributeName = 'transform';
                                                if (repeating) {
                                                    for (let j = 0; j < timeRange.length - 1; j++) {
                                                        const previous = timeRange[j];
                                                        const next = timeRange[j + 1];
                                                        if (previous[1] === next[1] && keyTimeFrom >= previous[0] && keyTimeTo <= next[0]) {
                                                            animate.type = previous[1];
                                                            break;
                                                        }
                                                        else if (keyTimeTo - keyTimeFrom === 1 && keyTimeTo === next[0]) {
                                                            animate.type = next[1];
                                                            break;
                                                        }
                                                    }
                                                }
                                                else if (infiniteMap['transform']) {
                                                    animate.type = infiniteMap['transform'].type;
                                                }
                                                if (animate.type === 0) {
                                                    continue;
                                                }
                                                animate.values = [dataFrom.values().next().value, dataTo.values().next().value];
                                                const transformOrigin = transformOriginMap.get(keyTimeTo);
                                                if (transformOrigin) {
                                                    animate.transformOrigin = [transformOrigin];
                                                }
                                                object = animate;
                                            }
                                            else {
                                                if (path) {
                                                    const pathData = getPathData([[keyTimeFrom, dataFrom], [keyTimeTo, dataTo]], path, this.parent);
                                                    if (pathData) {
                                                        object = new SvgAnimate();
                                                        object.attributeName = 'd';
                                                        object.values = pathData.map(item => item.value.toString());
                                                    }
                                                    else {
                                                        continue;
                                                    }
                                                }
                                                else {
                                                    const animate = new SvgAnimateTransform();
                                                    animate.attributeName = 'transform';
                                                    animate.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                                                    animate.values = [dataFrom, dataTo].map(data => {
                                                        const x = data.get('x') || 0;
                                                        const y = data.get('y') || 0;
                                                        return this.parent ? `${this.parent.refitX(x)} ${this.parent.refitX(y)}` : `${x} ${y}`;
                                                    });
                                                    value += i;
                                                    object = animate;
                                                }
                                            }
                                            if (repeating) {
                                                object.delay = i === 0 ? keyTimeFrom : 0;
                                            }
                                            object.duration = keyTimeTo - keyTimeFrom;
                                            object.keyTimes = [0, 1];
                                            object.synchronized = { index: i, value };
                                            const interpolator = interpolatorMap.get(keyTimeTo);
                                            if (interpolator) {
                                                object.keySplines = [interpolator];
                                            }
                                            this._insertAnimate(object, repeating);
                                        }
                                    }
                                }
                            });
                        }
                    }
                });
            }
            _removeAnimations(values) {
                if (values.length) {
                    $util$4.retainArray(this.animations, (item) => !values.includes(item));
                }
            }
            _insertAnimate(item, repeating) {
                if (!repeating) {
                    item.iterationCount = -1;
                }
                item.from = item.valueFrom;
                item.to = item.valueTo;
                this.animations.push(item);
            }
            _getBaseValue(attr, path) {
                let value;
                try {
                    value = (path || this).getBaseValue(attr);
                }
                catch (_a) {
                }
                return value !== undefined && value !== null ? value : (attr === 'points' ? [{ x: 0, y: 0 }] : 0);
            }
        };
    };

    const $dom$5 = squared.lib.dom;
    const $util$5 = squared.lib.util;
    class SvgAnimateMotion extends SvgAnimate {
        constructor(element) {
            super(element);
            this.path = '';
            this.mpath = null;
            this.rotate = 0;
            this.rotateAuto = false;
            this.rotateAutoReverse = false;
            if (element) {
                this.setAttribute('path');
                const rotate = $dom$5.getNamedItem(element, 'rotate');
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
                    const keyPoints = $dom$5.getNamedItem(element, 'keyPoints');
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

    const $dom$6 = squared.lib.dom;
    const $util$6 = squared.lib.util;
    const KEYFRAME_NAME = $dom$6.getKeyframeRules();
    const ANIMATION_DEFAULT = {
        'animation-delay': '0s',
        'animation-duration': '0s',
        'animation-iteration-count': '1',
        'animation-play-state': 'running',
        'animation-direction': 'normal',
        'animation-fill-mode': 'none',
        'animation-timing-function': 'ease'
    };
    const REGEXP_CUBICBEZIER = new RegExp(`cubic-bezier\\(${REGEXP_SVG.ZERO_ONE}, ${$util$6.REGEXP_STRING.DECIMAL}, ${REGEXP_SVG.ZERO_ONE}, ${$util$6.REGEXP_STRING.DECIMAL}\\)`);
    function parseAttribute(element, attr) {
        let value = $dom$6.cssAttribute(element, attr);
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
        return value.sort((a, b) => a.index >= b.index ? 1 : -1);
    }
    var SvgView$MX = (Base) => {
        return class extends Base {
            constructor() {
                super(...arguments);
                this.transformed = null;
            }
            getTransforms(companion) {
                const element = companion || this.element;
                return SvgBuild.filterTransforms(TRANSFORM.parse(element) || SvgBuild.convertTransforms(element.transform.baseVal));
            }
            getAnimations(companion) {
                const element = companion || this.element;
                const result = [];
                let id = 0;
                function addAnimation(item, delay, name = '') {
                    if (name === '') {
                        id++;
                    }
                    item.delay = delay;
                    item.group = { id, name };
                    result.push(item);
                }
                for (let i = 0; i < element.children.length; i++) {
                    const item = element.children[i];
                    if (item instanceof SVGAnimationElement) {
                        const begin = item.attributes.getNamedItem('begin');
                        if (begin && /^[a-zA-Z]+$/.test(begin.value.trim())) {
                            continue;
                        }
                        const times = begin ? sortNumber(begin.value.split(';').map(value => convertClockTime(value))) : [0];
                        if (times.length) {
                            switch (item.tagName) {
                                case 'set':
                                    for (const time of times) {
                                        addAnimation(new SvgAnimation(item), time);
                                    }
                                    break;
                                case 'animate':
                                    for (const time of times) {
                                        addAnimation(new SvgAnimate(item), time);
                                    }
                                    break;
                                case 'animateTransform':
                                    for (const time of times) {
                                        const animate = new SvgAnimateTransform(item);
                                        if (SvgBuild.isShape(this) && this.path) {
                                            animate.transformFrom = this.path.draw(undefined, undefined, true);
                                        }
                                        addAnimation(animate, time);
                                    }
                                    break;
                                case 'animateMotion':
                                    for (const time of times) {
                                        addAnimation(new SvgAnimateMotion(item), time);
                                    }
                                    break;
                            }
                        }
                    }
                }
                const animationName = parseAttribute(element, 'animation-name');
                if (animationName.length) {
                    const cssData = {};
                    const groupName = [];
                    const groupSiblings = [];
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
                    for (let i = 0; i < animationName.length; i++) {
                        const keyframes = KEYFRAME_NAME.get(animationName[i]);
                        const duration = convertClockTime(cssData['animation-duration'][i]);
                        if (keyframes && duration > 0) {
                            id++;
                            const attrMap = {};
                            const keyframeMap = {};
                            const paused = cssData['animation-play-state'][i] === 'paused';
                            const delay = convertClockTime(cssData['animation-delay'][i]);
                            const iterationCount = cssData['animation-iteration-count'][i];
                            const fillMode = cssData['animation-fill-mode'][i];
                            const keyframeIndex = `${animationName[i]}_${i}`;
                            const attributes = [];
                            groupSiblings.push({
                                name: keyframeIndex,
                                attributes,
                                paused,
                                delay,
                                duration,
                                iterationCount,
                                fillMode
                            });
                            for (const percent in keyframes) {
                                const fraction = parseInt(percent) / 100;
                                for (const name in keyframes[percent]) {
                                    const map = ANIMATION_DEFAULT[name] ? keyframeMap : attrMap;
                                    if (map[name] === undefined) {
                                        map[name] = [];
                                    }
                                    map[name].push({ index: fraction, value: keyframes[percent][name] });
                                }
                            }
                            if (attrMap['transform']) {
                                function getKeyframeOrigin(order) {
                                    const origin = attrMap['transform-origin'] && attrMap['transform-origin'].find(item => item.index === order);
                                    if (origin) {
                                        return TRANSFORM.origin(element, origin.value);
                                    }
                                    return undefined;
                                }
                                for (const transform of sortAttribute(attrMap['transform'])) {
                                    const transforms = TRANSFORM.parse(element, transform.value);
                                    if (transforms) {
                                        const origin = getKeyframeOrigin(transform.index);
                                        transforms.forEach(item => {
                                            const m = item.matrix;
                                            let name;
                                            let value;
                                            let transformOrigin;
                                            switch (item.type) {
                                                case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                                                    name = 'translate';
                                                    value = `${m.e} ${m.f}`;
                                                    break;
                                                case SVGTransform.SVG_TRANSFORM_SCALE:
                                                    name = 'scale';
                                                    value = `${m.a} ${m.d} ${origin ? `${origin.x} ${origin.y}` : '0 0'}`;
                                                    if (origin && (transform.index !== 0 || origin.x !== 0 || origin.y !== 0)) {
                                                        transformOrigin = {
                                                            x: origin.x * (1 - m.a),
                                                            y: origin.y * (1 - m.d)
                                                        };
                                                    }
                                                    break;
                                                case SVGTransform.SVG_TRANSFORM_ROTATE:
                                                    name = 'rotate';
                                                    value = `${item.angle} ${origin ? `${origin.x} ${origin.y}` : '0 0'}`;
                                                    break;
                                                case SVGTransform.SVG_TRANSFORM_SKEWX:
                                                    name = 'skewX';
                                                    value = item.angle.toString();
                                                    if (origin && (transform.index !== 0 || origin.y !== 0)) {
                                                        transformOrigin = {
                                                            x: origin.y * m.c * -1,
                                                            y: 0
                                                        };
                                                    }
                                                    break;
                                                case SVGTransform.SVG_TRANSFORM_SKEWY:
                                                    name = 'skewY';
                                                    value = item.angle.toString();
                                                    if (origin && (transform.index !== 0 || origin.x !== 0)) {
                                                        transformOrigin = {
                                                            x: 0,
                                                            y: origin.x * m.b * -1
                                                        };
                                                    }
                                                    break;
                                                default:
                                                    return;
                                            }
                                            if (attrMap[name] === undefined) {
                                                attrMap[name] = [];
                                            }
                                            const previousIndex = attrMap[name].findIndex(subitem => subitem.index === transform.index);
                                            if (previousIndex !== -1) {
                                                attrMap[name][previousIndex].value = value;
                                                attrMap[name][previousIndex].transformOrigin = transformOrigin;
                                            }
                                            else {
                                                attrMap[name].push({
                                                    index: transform.index,
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
                                attributes.push(name);
                                const animation = attrMap[name];
                                let animate;
                                switch (name) {
                                    case 'rotate':
                                    case 'scale':
                                    case 'skewX':
                                    case 'skewY':
                                    case 'translate':
                                        animate = new SvgAnimateTransform();
                                        animate.attributeName = 'transform';
                                        animate.baseFrom = TRANSFORM.typeAsValue(name);
                                        animate.setType(name);
                                        break;
                                    default:
                                        animate = new SvgAnimate();
                                        animate.attributeName = name;
                                        animate.baseFrom = $util$6.optionalAsString(element, `${name}.baseVal.valueAsString`) || $dom$6.cssAttribute(element, name);
                                        break;
                                }
                                const timingFunction = cssData['animation-timing-function'][i];
                                const direction = cssData['animation-direction'][i];
                                const keyTimes = [];
                                const values = [];
                                const keySplines = [];
                                sortAttribute(animation);
                                for (let j = 0; j < animation.length; j++) {
                                    keyTimes.push(animation[j].index);
                                    values.push(animation[j].value);
                                    if (j < animation.length - 1) {
                                        const spline = keyframeMap['animation-timing-function'] && keyframeMap['animation-timing-function'].find(item => item.index === animation[j].index);
                                        keySplines.push(spline ? spline.value : timingFunction);
                                    }
                                    const transformOrigin = animation[j].transformOrigin;
                                    if (transformOrigin && SvgBuild.asAnimateTransform(animate)) {
                                        if (animate.transformOrigin === undefined) {
                                            animate.transformOrigin = [];
                                        }
                                        animate.transformOrigin[j] = transformOrigin;
                                    }
                                }
                                addAnimation(animate, delay, keyframeIndex);
                                animate.paused = paused;
                                animate.duration = duration;
                                if (!keySplines.every(spline => spline === 'linear')) {
                                    const keyTimesData = [];
                                    const valuesData = [];
                                    const keySplinesData = [];
                                    for (let j = 0; j < keySplines.length; j++) {
                                        if (KEYSPLINE_NAME[keySplines[j]]) {
                                            keySplines[j] = KEYSPLINE_NAME[keySplines[j]];
                                        }
                                        else if (keySplines[j].startsWith('step')) {
                                            if (j === 0 && values[j] === '' && animate.baseFrom) {
                                                values[j] = animate.baseFrom;
                                            }
                                            const steps = SvgAnimate.toStepFractionList(name, keyTimes, values, keySplines[j], j, getHostDPI(), getFontSize(element));
                                            if (steps) {
                                                keyTimesData.push(...steps[0]);
                                                valuesData.push(...steps[1]);
                                                steps[0].forEach(() => keySplinesData.push(KEYSPLINE_NAME['step']));
                                                continue;
                                            }
                                            keySplines[j] = KEYSPLINE_NAME.linear;
                                        }
                                        else {
                                            const match = REGEXP_CUBICBEZIER.exec(keySplines[j]);
                                            keySplines[j] = match ? `${match[1]} ${match[2]} ${match[3]} ${match[4]}` : KEYSPLINE_NAME.ease;
                                        }
                                        keyTimesData.push(keyTimes[j]);
                                        valuesData.push(values[j]);
                                        keySplinesData.push(keySplines[j]);
                                    }
                                    keyTimesData.push(keyTimes.pop());
                                    valuesData.push(values.pop());
                                    animate.values = valuesData;
                                    animate.keyTimes = keyTimesData;
                                    animate.keySplines = keySplinesData;
                                }
                                else {
                                    animate.values = values;
                                    animate.keyTimes = keyTimes;
                                }
                                if (animate.keyTimes[0] !== 0 && $util$6.isString(animate.baseFrom)) {
                                    animate.keyTimes.unshift(0);
                                    animate.values.unshift(animate.baseFrom);
                                    if (animate.keySplines) {
                                        animate.keySplines.unshift(timingFunction);
                                    }
                                }
                                animate.iterationCount = iterationCount !== 'infinite' ? parseFloat(iterationCount) : -1;
                                animate.fillForwards = fillMode === 'forwards' || fillMode === 'both';
                                animate.fillBackwards = fillMode === 'backwards' || fillMode === 'both';
                                animate.reverse = direction.endsWith('reverse');
                                animate.alternate = (animate.iterationCount === -1 || animate.iterationCount > 1) && direction.startsWith('alternate');
                                groupName.push(animate);
                            }
                        }
                    }
                    groupSiblings.reverse();
                    for (const item of groupName) {
                        item.setGroupSiblings(groupSiblings);
                    }
                }
                for (const item of result) {
                    item.parent = this;
                }
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
            get transforms() {
                if (this._transforms === undefined) {
                    this._transforms = this.getTransforms();
                }
                return this._transforms;
            }
            get animations() {
                if (this._animations === undefined) {
                    this._animations = this.getAnimations();
                }
                return this._animations;
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
                return $dom$6.cssAttribute(this.element, 'opacity') || '1';
            }
        };
    };

    const $dom$7 = squared.lib.dom;
    function hasUnsupportedAccess(element) {
        const domElement = element.parentElement instanceof HTMLElement;
        return element.tagName === 'svg' && ($dom$7.isUserAgent(4 /* SAFARI */) && !domElement ||
            $dom$7.isUserAgent(16 /* FIREFOX */) && domElement);
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
            _getElement() {
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
                    const element = this._getElement();
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
                    const element = this._getElement();
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
                    const element = this._getElement();
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
                    const element = this._getElement();
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

    const $dom$8 = squared.lib.dom;
    const $util$7 = squared.lib.util;
    function getNearestViewBox$1(instance) {
        while (instance) {
            if (instance.hasViewBox()) {
                return instance;
            }
            instance = instance.parent;
        }
        return undefined;
    }
    function getFillPattern(element, viewport) {
        const match = REGEXP_SVG.URL.exec($dom$8.cssInheritAttribute(element, 'fill'));
        if (match) {
            if (viewport && viewport.definitions.pattern.has(match[1])) {
                return viewport.definitions.pattern.get(match[1]);
            }
            else {
                const target = document.getElementById(match[1].substring(1));
                if (target instanceof SVGPatternElement) {
                    return target;
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
                width: 0,
                height: 0,
                position: { x: 0, y: 0 },
                parent: { x: 0, y: 0 },
                unit: 1
            };
            this._clipRegion = [];
        }
        append(item, viewport) {
            item.parent = this;
            item.viewport = viewport || this.getViewport();
            return super.append(item);
        }
        build(exclude, residual, element) {
            if (element === undefined) {
                element = this.element;
            }
            this.clear();
            const viewport = this.getViewport();
            let requireClip = false;
            for (let i = 0; i < element.children.length; i++) {
                const item = element.children[i];
                let svg;
                if (SVG.svg(item)) {
                    svg = new squared.svg.Svg(item, false);
                    this.setAspectRatio(svg, item.viewBox.baseVal);
                    requireClip = true;
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
                            this.setAspectRatio(svg, target.viewBox.baseVal);
                            requireClip = true;
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
                    svg.build(exclude, residual);
                }
            }
            if (SvgBuild.asSvg(this) && this.documentRoot) {
                if (this.aspectRatio.x < 0 || this.aspectRatio.y < 0) {
                    this.clipViewBox(this.aspectRatio.x, this.aspectRatio.y, this.aspectRatio.width, this.aspectRatio.height, true);
                }
            }
            else if (requireClip && this.hasViewBox() && (this.aspectRatio.x !== 0 || this.aspectRatio.y !== 0)) {
                const boxRect = SvgBuild.toBoxRect(this.getPathAll(false));
                const x = this.refitX(this.aspectRatio.x);
                const y = this.refitY(this.aspectRatio.y);
                if (boxRect.left < x || boxRect.top < y) {
                    this.clipViewBox(boxRect.left, boxRect.top, this.refitSize(this.aspectRatio.width), this.refitSize(this.aspectRatio.height));
                }
            }
        }
        hasViewBox() {
            return SvgBuild.asSvg(this) && !!this.element.viewBox.baseVal || SvgBuild.asUseSymbol(this) && !!this.symbolElement.viewBox.baseVal;
        }
        clipViewBox(x, y, width, height, documentRoot = false) {
            if (documentRoot) {
                this.clipRegion = SvgBuild.drawRect(width - x, height - y, x < 0 ? x * -1 : 0, y < 0 ? y * -1 : 0);
            }
            else {
                this.clipRegion = SvgBuild.drawRect(width, height, x, y);
            }
        }
        synchronize(keyTimeMode = 0) {
            this.each(item => item.synchronize(keyTimeMode));
        }
        refitX(value) {
            return (value - this.aspectRatio.x) * this.aspectRatio.unit - this.aspectRatio.parent.x + this.aspectRatio.position.x;
        }
        refitY(value) {
            return (value - this.aspectRatio.y) * this.aspectRatio.unit - this.aspectRatio.parent.y + this.aspectRatio.position.y;
        }
        refitSize(value) {
            return value * this.aspectRatio.unit;
        }
        refitPoints(values) {
            for (const pt of values) {
                pt.x = this.refitX(pt.x);
                pt.y = this.refitY(pt.y);
                if (pt.rx !== undefined && pt.ry !== undefined) {
                    pt.rx *= this.aspectRatio.unit;
                    pt.ry *= this.aspectRatio.unit;
                }
            }
            return values;
        }
        requireRefit() {
            return this.aspectRatio.x !== 0 || this.aspectRatio.y !== 0 || this.aspectRatio.position.x !== 0 || this.aspectRatio.position.y !== 0 || this.aspectRatio.parent.x !== 0 || this.aspectRatio.parent.y !== 0 || this.aspectRatio.unit !== 1;
        }
        getPathAll(cascade = true) {
            const result = [];
            for (const item of (cascade ? this.cascade() : this)) {
                if (SvgBuild.isShape(item) && item.path && item.path.value) {
                    result.push(item.path.value);
                }
            }
            return result;
        }
        getViewport() {
            return this.viewport || (SvgBuild.asSvg(this) ? this : undefined);
        }
        setAspectRatio(group, viewBox) {
            const parent = getNearestViewBox$1(this);
            if (parent) {
                const aspectRatio = group.aspectRatio;
                if (viewBox) {
                    $util$7.cloneObject(viewBox, aspectRatio);
                    if (aspectRatio.width > 0 && aspectRatio.height > 0) {
                        const ratio = aspectRatio.width / aspectRatio.height;
                        const parentWidth = parent.aspectRatio.width || parent.viewBox.width;
                        const parentHeight = parent.aspectRatio.height || parent.viewBox.height;
                        const parentRatio = parentWidth / parentHeight;
                        if (parentRatio > ratio) {
                            aspectRatio.position.x = (parentWidth - (parentHeight * ratio)) / 2;
                        }
                        else if (parentRatio < ratio) {
                            aspectRatio.position.y = (parentHeight - (parentWidth * (1 / ratio))) / 2;
                        }
                        aspectRatio.unit = Math.min(parentWidth / aspectRatio.width, parentHeight / aspectRatio.height);
                    }
                }
                aspectRatio.parent.x = parent.aspectRatio.x + parent.aspectRatio.x * (parent.aspectRatio.unit - 1);
                aspectRatio.position.x *= parent.aspectRatio.unit;
                aspectRatio.position.x += parent.aspectRatio.position.x - parent.aspectRatio.parent.x;
                aspectRatio.parent.y = parent.aspectRatio.y + parent.aspectRatio.y * (parent.aspectRatio.unit - 1);
                aspectRatio.position.y *= parent.aspectRatio.unit;
                aspectRatio.position.y += parent.aspectRatio.position.y - parent.aspectRatio.parent.y;
                aspectRatio.unit *= parent.aspectRatio.unit;
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
            return 2 /* SVG_CONTAINER */;
        }
    }

    const $color$1 = squared.lib.color;
    const $dom$9 = squared.lib.dom;
    const $util$8 = squared.lib.util;
    function getColorStop(element) {
        const result = [];
        Array.from(element.getElementsByTagName('stop')).forEach(item => {
            const color = $color$1.parseRGBA($dom$9.cssAttribute(item, 'stop-color'), $dom$9.cssAttribute(item, 'stop-opacity'));
            if (color) {
                result.push({
                    color: color.valueRGBA,
                    offset: $dom$9.cssAttribute(item, 'offset'),
                    opacity: color.alpha
                });
            }
        });
        return result;
    }
    function getBaseValue(element, ...attrs) {
        const result = {};
        for (const attr of attrs) {
            if (element[attr] && element[attr].baseVal) {
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
        build(exclude, residual) {
            this.setRect();
            super.build(exclude, residual);
        }
        synchronize(keyTimeMode = 0) {
            if (!this.documentRoot && this.animations.length) {
                this.mergeAnimations(this.getAnimateViewRect(), this.getAnimateTransform(), keyTimeMode);
            }
            super.synchronize(keyTimeMode);
        }
        init() {
            if (this.documentRoot) {
                const viewBox = this.element.viewBox.baseVal;
                $util$8.cloneObject(viewBox, this.aspectRatio);
            }
            [this.element, ...Array.from(this.element.querySelectorAll('defs'))].forEach(item => {
                item.querySelectorAll(':scope > set, :scope > animate, :scope > animateTransform, :scope > animateMotion').forEach((element) => {
                    const target = getTargetElement(element, this.documentRoot ? this.element : undefined);
                    if (target) {
                        if (element.parentElement) {
                            element.parentElement.removeChild(element);
                        }
                        target.appendChild(element);
                    }
                });
                item.querySelectorAll('clipPath, pattern, linearGradient, radialGradient').forEach((element) => {
                    if (element.id) {
                        const id = `#${element.id}`;
                        if (SVG.clipPath(element)) {
                            this.definitions.clipPath.set(id, element);
                        }
                        else if (SVG.pattern(element)) {
                            this.definitions.pattern.set(id, element);
                        }
                        else if (SVG.linearGradient(element)) {
                            this.definitions.gradient.set(id, Object.assign({ type: 'linear', element, spreadMethod: element.spreadMethod.baseVal, colorStop: getColorStop(element) }, getBaseValue(element, 'x1', 'x2', 'y1', 'y2')));
                        }
                        else if (SVG.radialGradient(element)) {
                            this.definitions.gradient.set(id, Object.assign({ type: 'radial', element, spreadMethod: element.spreadMethod.baseVal, colorStop: getColorStop(element) }, getBaseValue(element, 'cx', 'cy', 'r', 'fx', 'fy', 'fr')));
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
                return $dom$9.getDOMRect(this.element);
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
        build(exclude, residual, element) { }
        synchronize(keyTimeMode) { }
        get instanceType() {
            return 4 /* SVG_ELEMENT */;
        }
    }

    const $color$2 = squared.lib.color;
    const $dom$a = squared.lib.dom;
    const $util$9 = squared.lib.util;
    const REGEXP_CLIPPATH = {
        url: REGEXP_SVG.URL,
        inset: new RegExp(`inset\\(${$util$9.REGEXP_STRING.LENGTH}\\s?${$util$9.REGEXP_STRING.LENGTH}?\\s?${$util$9.REGEXP_STRING.LENGTH}?\\s?${$util$9.REGEXP_STRING.LENGTH}?\\)`),
        polygon: /polygon\(([^)]+)\)/,
        circle: new RegExp(`circle\\(${$util$9.REGEXP_STRING.LENGTH}(?: at ${$util$9.REGEXP_STRING.LENGTH} ${$util$9.REGEXP_STRING.LENGTH})?\\)`),
        ellipse: new RegExp(`ellipse\\(${$util$9.REGEXP_STRING.LENGTH} ${$util$9.REGEXP_STRING.LENGTH}(?: at ${$util$9.REGEXP_STRING.LENGTH} ${$util$9.REGEXP_STRING.LENGTH})?\\)`),
    };
    var SvgPaint$MX = (Base) => {
        return class extends Base {
            setPaint(d) {
                this.resetPaint();
                this.setAttribute('color', true);
                this._setColor('fill');
                this.setAttribute('fill-opacity');
                this.setAttribute('fill-rule');
                this._setColor('stroke');
                this.setAttribute('stroke-opacity');
                this.setAttribute('stroke-width');
                this.setAttribute('stroke-linecap');
                this.setAttribute('stroke-linejoin');
                this.setAttribute('stroke-miterlimit');
                this.setAttribute('stroke-dasharray');
                this.setAttribute('stroke-dashoffset');
                this.setAttribute('clip-rule');
                const clipPath = this._getAttribute('clip-path', false, false);
                if (clipPath !== '') {
                    for (const name in REGEXP_CLIPPATH) {
                        const match = REGEXP_CLIPPATH[name].exec(clipPath);
                        if (match) {
                            if (name === 'url') {
                                this.clipPath = match[1];
                                return;
                            }
                            else if (d && d.length) {
                                const dpi = getHostDPI();
                                const fontSize = getFontSize(this.element);
                                const boxRect = SvgBuild.toBoxRect(d);
                                const width = boxRect.right - boxRect.left;
                                const height = boxRect.bottom - boxRect.top;
                                const parent = this.parent;
                                function convertUnit(value, index) {
                                    return $util$9.convertPercentPX(value, index === 0 ? width : height, dpi, fontSize);
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
                                        this.clipPath = SvgBuild.drawPolygon(points);
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
                                        this.clipPath = SvgBuild.drawPolygon(points);
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
                                            this.clipPath = SvgBuild.drawEllipse(cx, cy, rx, ry);
                                        }
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            setAttribute(attr, computed = false) {
                const value = this._getAttribute(attr, computed);
                if ($util$9.isString(value)) {
                    this[$util$9.convertCamelCase(attr)] = value;
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
            _setColor(attr) {
                const value = this._getAttribute(attr);
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
                            color = $color$2.parseRGBA(this.color || $dom$a.cssAttribute(this.element, attr, true));
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
            _getAttribute(attr, computed = false, inherited = true) {
                let value = $dom$a.cssAttribute(this.element, attr, computed);
                if (inherited && !$util$9.isString(value)) {
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
                        value = $dom$a.cssAttribute(current.element, attr);
                        if ($util$9.isString(value)) {
                            break;
                        }
                        current = current.parent;
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
        build(exclude, residual) {
            super.build(exclude, residual);
            this.setPaint(this.getPathAll());
        }
        get instanceType() {
            return 34 /* SVG_G */;
        }
    }

    const $util$a = squared.lib.util;
    class SvgImage extends SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgElement))) {
        constructor(element, imageElement) {
            super(element);
            this.element = element;
            this.imageElement = null;
            this.__get_transforms = false;
            this.__get_animations = false;
            if (imageElement) {
                this.imageElement = imageElement;
            }
        }
        build() {
            this.setRect();
        }
        extract(exclude) {
            const transforms = exclude ? SvgBuild.filterTransforms(this.transforms, exclude) : this.transforms;
            let x = this.x;
            let y = this.y;
            let width = this.width;
            let height = this.height;
            if (transforms.length) {
                transforms.reverse();
                for (let i = 0; i < transforms.length; i++) {
                    const item = transforms[i];
                    const m = item.matrix;
                    const localX = x;
                    x = MATRIX.applyX(m, localX, y);
                    y = MATRIX.applyY(m, localX, y);
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
                                if (this.rotateAngle !== undefined) {
                                    this.rotateAngle += item.angle;
                                }
                                else {
                                    this.rotateAngle = item.angle;
                                }
                            }
                            break;
                    }
                }
                this.transformed = transforms;
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
                return $util$a.resolvePath(element.href.baseVal);
            }
            return '';
        }
        get transforms() {
            const transforms = super.transforms;
            if (!this.__get_transforms) {
                if (this.imageElement) {
                    transforms.push(...this.getTransforms(this.imageElement));
                }
                this.__get_transforms = true;
            }
            return transforms;
        }
        get animations() {
            const animations = super.animations;
            if (!this.__get_animations) {
                if (this.imageElement) {
                    animations.push(...this.getAnimations(this.imageElement));
                }
                this.__get_animations = true;
            }
            return animations;
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
        static build(path, transforms, exclude, residual) {
            if (exclude && exclude[path.element.tagName]) {
                transforms = SvgBuild.filterTransforms(transforms, exclude[path.element.tagName]);
            }
            path.draw(transforms, residual);
            return path;
        }
        static getCenter(values) {
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
        draw(transforms, residual, extract = false) {
            if (!extract) {
                this.transformed = null;
            }
            const parent = this.parent;
            const patternParent = this.patternParent;
            const element = this.element;
            const requireRefit = !!parent && parent.requireRefit();
            const requirePatternRefit = !!this.patternParent && this.patternParent.patternContentUnits === 2 /* OBJECT_BOUNDING_BOX */;
            let d = '';
            if (SVG.path(element)) {
                d = this.getBaseValue('d');
                if (transforms && transforms.length || requireRefit || requirePatternRefit) {
                    const commands = SvgBuild.getPathCommands(d);
                    if (commands.length) {
                        let points = SvgBuild.getPathPoints(commands);
                        if (points.length) {
                            if (requirePatternRefit) {
                                patternParent.patternRefitPoints(points);
                            }
                            if (transforms && transforms.length) {
                                if (typeof residual === 'function') {
                                    [this.transformResidual, transforms] = residual.call(this, element, transforms);
                                }
                                if (transforms.length) {
                                    points = this.transformPoints(transforms, points);
                                    this.transformed = transforms;
                                }
                            }
                            if (requireRefit) {
                                parent.refitPoints(points);
                            }
                            d = SvgBuild.drawPath(SvgBuild.setPathPoints(commands, points));
                        }
                    }
                }
            }
            else if (SVG.line(element)) {
                let points = [
                    { x: this.getBaseValue('x1'), y: this.getBaseValue('y1') },
                    { x: this.getBaseValue('x2'), y: this.getBaseValue('y2') }
                ];
                if (requirePatternRefit) {
                    patternParent.patternRefitPoints(points);
                }
                if (transforms && transforms.length) {
                    if (typeof residual === 'function') {
                        [this.transformResidual, transforms] = residual.call(this, element, transforms);
                    }
                    if (transforms.length) {
                        points = this.transformPoints(transforms, points);
                        this.transformed = transforms;
                    }
                }
                if (requireRefit) {
                    parent.refitPoints(points);
                }
                d = SvgBuild.drawPolyline(points);
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
                if (requirePatternRefit) {
                    patternParent.patternRefitPoints(points);
                }
                if (transforms && transforms.length) {
                    if (typeof residual === 'function') {
                        [this.transformResidual, transforms] = residual.call(this, element, transforms, rx, ry);
                    }
                    if (transforms.length) {
                        points = this.transformPoints(transforms, points);
                        this.transformed = transforms;
                    }
                }
                if (requireRefit) {
                    parent.refitPoints(points);
                }
                const pt = points[0];
                d = SvgBuild.drawEllipse(pt.x, pt.y, pt.rx, pt.ry);
            }
            else if (SVG.rect(element)) {
                let x = this.getBaseValue('x');
                let y = this.getBaseValue('y');
                let width = this.getBaseValue('width');
                let height = this.getBaseValue('height');
                if (transforms && transforms.length) {
                    let points = [
                        { x, y },
                        { x: x + width, y },
                        { x: x + width, y: y + height },
                        { x, y: y + height }
                    ];
                    if (requirePatternRefit) {
                        patternParent.patternRefitPoints(points);
                    }
                    if (typeof residual === 'function') {
                        [this.transformResidual, transforms] = residual.call(this, element, transforms);
                    }
                    if (transforms.length) {
                        points = this.transformPoints(transforms, points);
                        this.transformed = transforms;
                    }
                    if (requireRefit) {
                        parent.refitPoints(points);
                    }
                    d = SvgBuild.drawPolygon(points);
                }
                else {
                    if (requirePatternRefit) {
                        x = patternParent.patternRefitX(x);
                        y = patternParent.patternRefitY(y);
                        width = patternParent.patternRefitX(width);
                        height = patternParent.patternRefitY(height);
                    }
                    if (requireRefit) {
                        x = parent.refitX(x);
                        y = parent.refitY(y);
                        width = parent.refitSize(width);
                        height = parent.refitSize(height);
                    }
                    d = SvgBuild.drawRect(width, height, x, y);
                }
            }
            else if (SVG.polygon(element) || SVG.polyline(element)) {
                let points = this.getBaseValue('points');
                if (requirePatternRefit) {
                    patternParent.patternRefitPoints(points);
                }
                if (transforms && transforms.length) {
                    if (typeof residual === 'function') {
                        [this.transformResidual, transforms] = residual.call(this, element, transforms);
                    }
                    if (transforms.length) {
                        points = this.transformPoints(transforms, points);
                        this.transformed = transforms;
                    }
                }
                if (requireRefit) {
                    if (this.transformed === null) {
                        points = SvgBuild.clonePoints(points);
                    }
                    parent.refitPoints(points);
                }
                d = element.tagName === 'polygon' ? SvgBuild.drawPolygon(points) : SvgBuild.drawPolyline(points);
            }
            if (!extract) {
                this.value = d;
                this.setPaint([d]);
            }
            return d;
        }
        transformPoints(transforms, points, center) {
            return SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element), center);
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
        get transforms() {
            if (this._transforms === undefined) {
                this._transforms = SvgBuild.filterTransforms(TRANSFORM.parse(this.element) || SvgBuild.convertTransforms(this.element.transform.baseVal));
            }
            return this._transforms;
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
        build(exclude, residual) {
            super.build(exclude, residual, this.patternElement);
        }
        get animations() {
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
        build(exclude, residual) {
            if (this.path) {
                this.path.parent = this.parent;
                SvgPath.build(this.path, this.transforms, exclude, residual);
            }
        }
        synchronize(keyTimeMode = 0, element) {
            if (this.path && this.animations.length) {
                this.mergeAnimations(this.getAnimateShape(element || this.element), element ? [] : this.getAnimateTransform(), keyTimeMode, this.path);
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

    const $util$b = squared.lib.util;
    function getPercent(value) {
        return $util$b.isPercent(value) ? parseFloat(value) / 100 : parseFloat(value);
    }
    class SvgShapePattern extends SvgPaint$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer))) {
        constructor(element, patternElement) {
            super(element);
            this.element = element;
            this.patternElement = patternElement;
            this.__get_transforms = false;
            const units = this.patternElement.attributes.getNamedItem('patternUnits');
            const contentUnits = this.patternElement.attributes.getNamedItem('patternContentUnits');
            this.patternUnits = units && units.value === 'userSpaceOnUse' ? 1 /* USER_SPACE_ON_USE */ : 2 /* OBJECT_BOUNDING_BOX */;
            this.patternContentUnits = contentUnits && contentUnits.value === 'objectBoundingBox' ? 2 /* OBJECT_BOUNDING_BOX */ : 1 /* USER_SPACE_ON_USE */;
        }
        build(exclude, residual, element) {
            if (element === undefined) {
                element = this.element;
            }
            const path = SvgPath.build(new SvgPath(element), [], exclude);
            if (path.value) {
                this.clipRegion = path.value;
                if (path.clipPath) {
                    this.clipRegion = path.clipPath;
                }
                const d = [path.value];
                this.setPaint(d);
                this.drawRegion = SvgBuild.toBoxRect(d);
                const boundingBox = this.patternUnits === 2 /* OBJECT_BOUNDING_BOX */;
                const patternWidth = this.patternWidth;
                const patternHeight = this.patternHeight;
                const tileWidth = this.tileWidth;
                const tileHeight = this.tileHeight;
                const boundingX = boundingBox ? this.drawRegion.left : 0;
                const boundingY = boundingBox ? this.drawRegion.top : 0;
                let offsetX = this.offsetX % tileWidth;
                let offsetY = this.offsetY % tileHeight;
                let width = this.drawRegion.right - (boundingBox ? this.drawRegion.left : 0);
                let remainingHeight = this.drawRegion.bottom - (boundingBox ? this.drawRegion.top : 0);
                let j = 0;
                if (offsetX !== 0) {
                    offsetX = tileWidth - offsetX;
                    width += tileWidth;
                }
                if (offsetY !== 0) {
                    offsetY = tileHeight - offsetY;
                    remainingHeight += tileHeight;
                }
                while (remainingHeight > 0) {
                    const y = boundingY + j * tileHeight - offsetY;
                    let remainingWidth = width;
                    let i = 0;
                    do {
                        const x = boundingX + i * tileWidth - offsetX;
                        const pattern = new SvgPattern(element, this.patternElement);
                        pattern.build(exclude, residual);
                        for (const item of pattern.cascade()) {
                            if (SvgBuild.isShape(item) && item.path) {
                                item.path.patternParent = this;
                                if (this.patternContentUnits === 2 /* OBJECT_BOUNDING_BOX */) {
                                    item.path.refitBaseValue(x / patternWidth, y / patternHeight);
                                }
                                else {
                                    item.path.refitBaseValue(x, y);
                                }
                                SvgPath.build(item.path, item.transforms, exclude, residual);
                                item.path.fillOpacity = (parseFloat(item.path.fillOpacity) * parseFloat(this.fillOpacity)).toString();
                                item.path.clipPath = SvgBuild.drawRect(tileWidth, tileHeight, x, y) + (item.path.clipPath !== '' ? `;${item.path.clipPath}` : '');
                            }
                        }
                        this.append(pattern);
                        remainingWidth -= tileWidth;
                        i++;
                    } while (remainingWidth > 0);
                    j++;
                    remainingHeight -= tileHeight;
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
            }
        }
        patternRefitX(value) {
            return this.drawRegion ? value * this.patternWidth : value;
        }
        patternRefitY(value) {
            return this.drawRegion ? value * this.patternHeight : value;
        }
        patternRefitPoints(values) {
            if (this.drawRegion) {
                const x = this.patternWidth;
                const y = this.patternHeight;
                for (const pt of values) {
                    pt.x *= x;
                    pt.y *= y;
                    if (pt.rx !== undefined && pt.ry !== undefined) {
                        if (pt.rx === pt.ry) {
                            const minXY = Math.min(x, y);
                            pt.rx *= minXY;
                            pt.ry *= minXY;
                        }
                        else {
                            pt.rx *= x;
                            pt.ry *= y;
                        }
                    }
                }
            }
            return values;
        }
        get patternWidth() {
            return this.drawRegion ? this.drawRegion.right - this.drawRegion.left : 0;
        }
        get patternHeight() {
            return this.drawRegion ? this.drawRegion.bottom - this.drawRegion.top : 0;
        }
        get transforms() {
            if (!this.__get_transforms) {
                const transforms = SvgBuild.convertTransforms(this.patternElement.patternTransform.baseVal);
                if (transforms.length) {
                    const rotateOrigin = TRANSFORM.rotateOrigin(this.patternElement, 'patternTransform');
                    const x = this.patternWidth / 2;
                    const y = this.patternHeight / 2;
                    for (const item of transforms) {
                        switch (item.type) {
                            case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                                break;
                            case SVGTransform.SVG_TRANSFORM_ROTATE:
                                while (rotateOrigin.length) {
                                    const pt = rotateOrigin.shift();
                                    if (pt.angle === item.angle) {
                                        item.origin = { x: x + pt.x, y: y + pt.y };
                                        break;
                                    }
                                }
                                if (item.origin) {
                                    break;
                                }
                            default:
                                item.origin = { x, y };
                                break;
                        }
                    }
                    super.transforms.push(...SvgBuild.filterTransforms(transforms));
                }
                this.__get_transforms = true;
            }
            return super.transforms;
        }
        get offsetX() {
            let value;
            if (this.patternUnits === 2 /* OBJECT_BOUNDING_BOX */) {
                value = this.patternWidth * getPercent(this.patternElement.x.baseVal.valueAsString);
            }
            return value || this.patternElement.x.baseVal.value;
        }
        get offsetY() {
            let value;
            if (this.patternUnits === 2 /* OBJECT_BOUNDING_BOX */) {
                value = this.patternHeight * getPercent(this.patternElement.y.baseVal.valueAsString);
            }
            return value || this.patternElement.y.baseVal.value;
        }
        get tileWidth() {
            let value;
            if (this.patternUnits === 2 /* OBJECT_BOUNDING_BOX */) {
                value = this.patternWidth * getPercent(this.patternElement.width.baseVal.valueAsString);
            }
            return value || this.patternElement.width.baseVal.value;
        }
        get tileHeight() {
            let value;
            if (this.patternUnits === 2 /* OBJECT_BOUNDING_BOX */) {
                value = this.patternHeight * getPercent(this.patternElement.height.baseVal.valueAsString);
            }
            return value || this.patternElement.height.baseVal.value;
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
            this.__get_transforms = false;
            this.__get_animations = false;
            this.setPath();
        }
        setPath() {
            this.path = new SvgPath(this.shapeElement);
            this.path.useParent = this;
        }
        build(exclude, residual) {
            super.build(exclude, residual);
            this.setPaint(this.path ? [this.path.value] : undefined);
        }
        synchronize(keyTimeMode = 0) {
            if (this.animations.length) {
                this.mergeAnimations(this.getAnimateViewRect(), this.getAnimateTransform(), keyTimeMode);
            }
            super.synchronize(keyTimeMode, this.shapeElement);
        }
        get transforms() {
            const transforms = super.transforms;
            if (!this.__get_transforms) {
                transforms.push(...this.getTransforms(this.shapeElement));
                this.__get_transforms = true;
            }
            return transforms;
        }
        get animations() {
            const animations = super.animations;
            if (!this.__get_animations) {
                animations.push(...this.getAnimations(this.shapeElement));
                this.__get_animations = true;
            }
            return animations;
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
        build(exclude, residual) {
            super.build(exclude, residual, this.shapeElement);
        }
        synchronize(keyTimeMode = 0) {
            const [animations, transformations] = [this.animations.filter(item => this.validateBaseValue(item.attributeName, 0) === undefined || item.attributeName === 'x' || item.attributeName === 'y'), this.getAnimateTransform()];
            if (animations.length || transformations.length) {
                this.mergeAnimations(this.getAnimateViewRect(animations), transformations, keyTimeMode);
            }
            super.synchronize(keyTimeMode);
        }
        get instanceType() {
            return 514 /* SVG_USE_PATTERN */;
        }
    }

    const $dom$b = squared.lib.dom;
    class SvgUseSymbol extends SvgPaint$MX(SvgSynchronize$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer))))) {
        constructor(element, symbolElement) {
            super(element);
            this.element = element;
            this.symbolElement = symbolElement;
        }
        build(exclude, residual) {
            this.setRect();
            super.build(exclude, residual, this.symbolElement);
            const x = this.getBaseValue('x', 0);
            const y = this.getBaseValue('y', 0);
            if (x !== 0 || y !== 0) {
                const pt = { x, y };
                this.cascade().forEach(item => item.translationOffset = pt);
            }
            this.setPaint(this.getPathAll());
        }
        synchronize(keyTimeMode = 0) {
            if (this.animations.length) {
                this.mergeAnimations(this.getAnimateViewRect(), this.getAnimateTransform(), keyTimeMode);
            }
            super.synchronize(keyTimeMode);
        }
        get viewBox() {
            if (this.symbolElement.viewBox.baseVal) {
                return this.symbolElement.viewBox.baseVal;
            }
            else {
                return $dom$b.getDOMRect(this.element);
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
