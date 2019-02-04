/* squared.svg 0.6.0
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
    const MATRIX = {
        applyX(matrix, x, y) {
            return matrix.a * x + matrix.c * y + matrix.e;
        },
        applyY(matrix, x, y) {
            return matrix.b * x + matrix.d * y + matrix.f;
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
                            result[match.index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_ROTATE, matrix, angle, !isX, !isY);
                        }
                        else if (match[1].startsWith('skew')) {
                            const x = isY ? 0 : convertAngle(match[2], match[3]);
                            const y = isY ? convertAngle(match[2], match[3]) : (match[4] && match[5] ? convertAngle(match[4], match[5]) : 0);
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
        },
        rotate(element) {
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
        },
        valueAsInitial(value) {
            switch (value) {
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
        },
        typeAsName(value) {
            switch (value) {
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
    function getRadiusX(angle, radius) {
        return radius * Math.sin(convertRadian(angle));
    }
    function getRadiusY(angle, radius) {
        return radius * Math.cos(convertRadian(angle)) * -1;
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
        getLeastCommonMultiple: getLeastCommonMultiple,
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
        static convertTransforms(transform) {
            const result = [];
            for (let i = 0; i < transform.numberOfItems; i++) {
                const item = transform.getItem(i);
                result.push(TRANSFORM.create(item.type, item.matrix, item.angle));
            }
            return result;
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
            this.attributeName = '';
            this.paused = false;
            this.synchronizeState = 0;
            this._duration = -1;
            this._begin = 0;
            this._to = '';
            if (element) {
                this.element = element;
                this.setAttribute('attributeName');
                this.setAttribute('to');
                const dur = this.getAttribute('dur');
                if (dur !== '' && dur !== 'indefinite') {
                    this.duration = convertClockTime(dur);
                }
                if (this.attributeName === 'transform') {
                    this.baseFrom = TRANSFORM.valueAsInitial(this.getAttribute('type'));
                }
                else if (element.parentElement) {
                    this.baseFrom = $util$2.optionalAsString(element.parentElement, `${this.attributeName}.baseVal.valueAsString`) || $dom$2.cssInheritAttribute(element.parentElement, this.attributeName);
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
        set begin(value) {
            this._begin = value;
        }
        get begin() {
            return this._begin;
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
    const $util$3 = squared.lib.util;
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
            this._setterType = false;
            if (element) {
                const values = this.getAttribute('values');
                const keyTimes = this.duration !== -1 ? SvgAnimate.toFractionList(this.getAttribute('keyTimes')) : [];
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
                    this.from = this.getAttribute('from');
                    if (this.to === '') {
                        const by = this.getAttribute('by');
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
                const repeatDur = this.getAttribute('repeatDur');
                if (repeatDur !== '' && repeatDur !== 'indefinite') {
                    this.repeatDuration = convertClockTime(repeatDur);
                }
                if (!(this.duration !== -1 && this.repeatDuration !== -1 && this.repeatDuration < this.duration)) {
                    const repeatCount = this.getAttribute('repeatCount');
                    this.repeatCount = repeatCount === 'indefinite' ? -1 : parseFloat(repeatCount);
                }
                if (element.tagName === 'animate') {
                    this.setCalcMode(this.attributeName);
                }
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
                switch (spline) {
                    case 'step-start':
                        spline = 'steps(1, start)';
                        break;
                    case 'step-end':
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
            if (this.element) {
                switch (this.getAttribute('calcMode')) {
                    case 'discrete': {
                        if (this.keyTimes.length === 2 && this.keyTimes[0] === 0) {
                            const keyTimes = [];
                            const values = [];
                            for (let i = 0; i < this.keyTimes.length - 1; i++) {
                                const result = SvgAnimate.toStepFractionList(name, 'step-end', i, this.keyTimes, this.values, getHostDPI(), getFontSize(this.element));
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
                        this.keySplines = $util$3.flatMap(this.getAttribute('keySplines').split(';'), value => value.trim());
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
        }
        convertToValues(keyTimes) {
            if (this.to !== '') {
                this.values = [this.from, this.to];
                this.keyTimes = keyTimes && keyTimes.length === 2 && this.keyTimes[0] === 0 && this.keyTimes[1] <= 1 ? keyTimes : [0, 1];
            }
        }
        setGroupOrder(value) {
            this.group.order = value;
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
        set begin(value) {
            super.begin = value;
            if (this.element) {
                const end = this.getAttribute('end');
                if (end !== '') {
                    const endTime = sortNumber(end.split(';').map(time => convertClockTime(time)))[0];
                    if (endTime !== undefined && (this.repeatCount === -1 || this.duration > 0 && endTime < this.duration * this.repeatCount)) {
                        if (this.begin > endTime) {
                            this.end = endTime;
                            if (this.repeatCount === -1) {
                                this.repeatCount = Math.ceil((this.end - this.begin) / this.duration);
                            }
                        }
                        else {
                            this.duration = -1;
                        }
                    }
                }
            }
        }
        get begin() {
            return super.begin;
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
                this.fillFreeze = this.repeatCount !== -1 && this.getAttribute('fill') === 'freeze';
                if (this.repeatCount !== 1) {
                    this.setAttribute('accumulate', 'sum');
                }
                else {
                    this.accumulateSum = false;
                }
            }
        }
        get repeatCount() {
            if (this._repeatCount === -1 && this.repeatDuration === -1) {
                return -1;
            }
            else if (this.duration > 0) {
                if (this._repeatCount !== -1 && this.repeatDuration !== -1 && this._repeatCount * this.duration <= this.repeatDuration) {
                    return this._repeatCount;
                }
                else if (this.repeatDuration !== -1 && this.duration > 0) {
                    return this.repeatDuration / this.duration;
                }
            }
            return this._repeatCount;
        }
        set to(value) {
            super.to = value;
        }
        get to() {
            if (this._setterType) {
                return this.values[this.values.length - 1] || super.to;
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
            return this.keyTimes.length >= 2 && this.keyTimes[this.keyTimes.length - 1] < 1;
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
                    return [0, 0, 0];
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
                    return [1, 1];
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
            const result = values.map(value => {
                if (value === '') {
                    return [0, 0];
                }
                else {
                    const segment = SvgBuild.toNumberList(value);
                    if (segment.length === 1) {
                        return [segment[0], 0];
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
                        return [segment[0]];
                    }
                    return [];
                }
            });
            return result.some(item => item.length === 0) ? undefined : result;
        }
        expandToValues() {
            if (this.additiveSum && this.repeatCount !== -1 && this.keyTimes.length && this.duration > 0) {
                const durationTotal = this.duration * this.repeatCount;
                invalid: {
                    const keyTimes = [];
                    const values = [];
                    const keySplines = [];
                    let previousValues;
                    for (let i = 0; i < this.repeatCount; i++) {
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
                                    if (i < this.repeatCount - 1 && j === this.keyTimes.length - 1) {
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
                    this.repeatCount = 1;
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
    function insertSplitTimeValue(map, insertMap, time) {
        let previousTime = 0;
        let previousValue;
        let previous;
        let next;
        for (const [ordinal, value] of map.entries()) {
            if (time === ordinal) {
                previous = { ordinal, value };
                break;
            }
            else if (time > previousTime && time < ordinal) {
                previous = { ordinal: previousTime, value: previousValue };
                next = { ordinal, value };
                break;
            }
            previousTime = ordinal;
            previousValue = value;
        }
        if (previous && next) {
            setTimelineValue(insertMap, time, getItemSplitValue(time, previous.ordinal, previous.value, next.ordinal, next.value));
        }
        else if (previous) {
            setTimelineValue(insertMap, time, previous.value);
        }
    }
    function convertToFraction(entries) {
        const timeTotal = entries[entries.length - 1][0];
        const previousFractions = new Set();
        for (let i = 0; i < entries.length; i++) {
            let fraction = entries[i][0] / timeTotal;
            if (fraction > 0) {
                for (let j = 7;; j++) {
                    const value = parseFloat(fraction.toString().substring(0, j));
                    if (!previousFractions.has(value)) {
                        fraction = value;
                        break;
                    }
                }
            }
            entries[i][0] = fraction;
            previousFractions.add(fraction);
        }
        return entries;
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
            const ordinal = entries[i][0];
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
                    result.push({ ordinal, value });
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
    function createKeyTimeMap(map, keyTimes, freezeResetMap) {
        const result = new Map();
        for (const keyTime of keyTimes) {
            const values = new Map();
            for (const attr in (freezeResetMap || map)) {
                let value;
                if (map[attr]) {
                    value = map[attr].get(keyTime);
                    if (value === undefined) {
                        value = getFreezeValue(map[attr], keyTime);
                    }
                }
                else if (freezeResetMap) {
                    value = freezeResetMap[attr].value;
                }
                if (value !== undefined) {
                    values.set(attr, value);
                }
            }
            result.set(keyTime, values);
        }
        return result;
    }
    function getItemTime(begin, duration, keyTimes, iteration, index) {
        return Math.round(begin + (keyTimes[index] + iteration) * duration);
    }
    function getItemValue(item, baseValue, iteration, index) {
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
        return previousValue;
    }
    function insertSplitKeyTimeValue(map, interpolatorMap, item, baseValue, begin, iteration, time, useKeyTime, transformOriginMap) {
        let actualTime;
        if (begin < 0) {
            actualTime = time - begin;
            begin = 0;
        }
        else {
            actualTime = time;
        }
        actualTime = getActualTime(actualTime);
        const fraction = Math.max(0, Math.min((actualTime - (begin + item.duration * iteration)) / item.duration, 1));
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
            value = getItemSplitValue(fraction, keyTimes[previousIndex], getItemValue(item, baseValue, iteration, previousIndex), keyTimes[nextIndex], getItemValue(item, baseValue, iteration, nextIndex));
        }
        else {
            nextIndex = previousIndex !== -1 ? previousIndex + 1 : keyTimes.length - 1;
            value = getItemValue(item, baseValue, iteration, nextIndex);
        }
        time = setTimelineValue(map, time, value);
        insertInterpolator(interpolatorMap, item, time, nextIndex, useKeyTime, transformOriginMap);
        return [time, value];
    }
    function setTimelineValue(map, time, value) {
        let stored = map.get(time);
        if (stored === undefined) {
            stored = map.get(getActualTime(time));
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
        return time;
    }
    function insertInterpolator(map, item, time, index, useKeyTime, transformOriginMap) {
        if (!isKeyTimeFormat(SvgBuild.asAnimateTransform(item), useKeyTime)) {
            if (index === 0) {
                return;
            }
            index--;
        }
        const value = item.keySplines && item.keySplines[index];
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
    function isKeyTimeFormat(transforming, useKeyTime) {
        return $util$4.hasBit(useKeyTime, transforming ? 32 /* KEYTIME_TRANSFORM */ : 4 /* KEYTIME_ANIMATE */);
    }
    function isFromToFormat(transforming, useKeyTime) {
        return $util$4.hasBit(useKeyTime, transforming ? 16 /* FROMTO_TRANSFORM */ : 2 /* FROMTO_ANIMATE */);
    }
    function playableAnimation(item) {
        return !item.paused && (item.element && item.duration !== -1 || item.keyTimes && item.keyTimes.length > 1 && item.duration > 0);
    }
    function getDurationTotal(item) {
        if (item.repeatCount !== -1) {
            return Math.min(item.begin + item.duration * item.repeatCount, item.end || Number.POSITIVE_INFINITY);
        }
        return Number.POSITIVE_INFINITY;
    }
    function getDurationMinimum(item) {
        return Math.min(item.begin + item.duration * (item.repeatCount !== -1 ? item.repeatCount : 1), item.end || Number.POSITIVE_INFINITY);
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
    function getActualTime(value) {
        if ((value + 1) % 10 === 0) {
            value++;
        }
        else if ((value - 1) % 10 === 0) {
            value--;
        }
        return value;
    }
    var SvgSynchronize$MX = (Base) => {
        return class extends Base {
            getAnimateShape(element, animation) {
                if (animation === undefined) {
                    animation = this.animation;
                }
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
                if (animation === undefined) {
                    animation = this.animation;
                }
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
            getAnimateTransform(animation) {
                if (animation === undefined) {
                    animation = this.animation;
                }
                return animation.filter(item => SvgBuild.asAnimateTransform(item) && item.duration > 0);
            }
            mergeAnimations(animations, transformations, useKeyTime = 0, path) {
                [animations, transformations].forEach((mergeable, index) => {
                    const transforming = index === 1;
                    if (mergeable.length === 0 || index === 0 && $util$4.hasBit(useKeyTime, 8 /* IGNORE_ANIMATE */) || transforming && $util$4.hasBit(useKeyTime, 64 /* IGNORE_TRANSFORM */)) {
                        return;
                    }
                    const freezeResetMap = {};
                    const conflicted = [];
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
                                    if (i !== j && itemA.attributeName === itemB.attributeName && itemA.group.id < itemB.group.id) {
                                        if (itemB.setterType) {
                                            if (itemA.begin === itemB.begin) {
                                                excluded[i] = itemA;
                                                break;
                                            }
                                        }
                                        else {
                                            const timeB = getDurationTotal(itemB);
                                            if (itemA.begin === itemB.begin && (!itemB.fillReplace || timeA <= timeB || itemB.repeatCount === -1) ||
                                                itemB.fillBackwards && itemA.begin <= itemB.begin && (itemB.fillForwards || itemA.fillReplace && timeA <= itemB.begin) ||
                                                itemA.element && itemB.element === undefined && (itemA.begin >= itemB.begin && timeA <= timeB || itemB.fillForwards)) {
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
                                if (item.element === undefined && item.fillForwards) {
                                    item.setterType = true;
                                    setter.push(item);
                                }
                                else {
                                    removeable.push(mergeable[i]);
                                }
                            }
                            else {
                                conflicted.push(mergeable[i]);
                            }
                        }
                        this._removeAnimations(removeable);
                    }
                    if (index === 0 && conflicted.length > 0 || transforming && (conflicted.length > 1 || conflicted.length === 1 && (conflicted[0].alternate || conflicted[0].end !== undefined))) {
                        const groupActive = new Set(conflicted.map(item => item.group.name));
                        for (const item of conflicted) {
                            if (item.group.order) {
                                $util$4.spliceArray(item.group.order, subitem => !groupActive.has(subitem.name));
                            }
                        }
                        const groupName = {};
                        let repeatingDuration = 0;
                        for (const item of conflicted) {
                            const attr = item.attributeName;
                            if (groupName[attr] === undefined) {
                                groupName[attr] = new Map();
                            }
                            const group = groupName[attr].get(item.begin) || [];
                            group.push(item);
                            groupName[attr].set(item.begin, group);
                        }
                        for (const attr in groupName) {
                            const groupBegin = new Map();
                            for (const begin of sortNumber(Array.from(groupName[attr].keys()))) {
                                const group = groupName[attr].get(begin);
                                if (group) {
                                    const duration = $util$4.maxArray(group.map(item => getDurationMinimum(item)));
                                    repeatingDuration = Math.max(repeatingDuration, duration);
                                    group.reverse();
                                    groupBegin.set(begin, group);
                                }
                            }
                            groupName[attr] = groupBegin;
                        }
                        const repeatingMap = {};
                        const indefiniteMap = {};
                        const repeatingInterpolatorMap = new Map();
                        const indefiniteInterpolatorMap = new Map();
                        const repeatingTransformOriginMap = new Map();
                        const indefiniteTransformOriginMap = new Map();
                        const repeatingAnimations = new Set();
                        const animateTimeRangeMap = new Map();
                        const baseValueMap = {};
                        const freezeMap = {};
                        let repeatingResult;
                        let repeatingAsIndefinite;
                        let indefiniteResult;
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
                            const groupBegin = [];
                            const groupData = [];
                            const groupItems = conflicted.filter(item => item.attributeName === attr);
                            for (const [begin, data] of groupName[attr].entries()) {
                                groupBegin.push(begin);
                                groupData.push(data);
                            }
                            const incomplete = [];
                            const setterData = setter.filter(item => item.attributeName === attr);
                            let backwards = groupItems.filter(item => item.fillBackwards)[0];
                            let maxTime = -1;
                            let actualMaxTime = 0;
                            let baseValue;
                            let previousTransform;
                            let nextBeginTime;
                            if (backwards) {
                                baseValue = backwards.keyTimes[backwards.keyTimes.length - 1] === 1 ? getItemValue(backwards, transforming ? '' : baseValueMap[attr], 0, 0) : transforming ? TRANSFORM.valueAsInitial(backwards.type) : baseValueMap[attr];
                                maxTime = setTimelineValue(repeatingMap[attr], 0, baseValue);
                                if (transforming) {
                                    setTimeRange(backwards.type, 0);
                                    previousTransform = backwards;
                                }
                                let firstPlayable = true;
                                for (const item of groupItems) {
                                    if (item.group.id > backwards.group.id && item.begin <= backwards.begin) {
                                        firstPlayable = false;
                                        break;
                                    }
                                }
                                for (let i = 0; i < groupBegin.length; i++) {
                                    for (let j = 0; j < groupData[i].length; j++) {
                                        const item = groupData[i][j];
                                        if (firstPlayable && groupData[i][j] === backwards) {
                                            if (i !== 0 || j !== 0) {
                                                groupData[i].splice(j, 1);
                                                if (groupData[i].length === 0) {
                                                    groupBegin.splice(i, 1);
                                                    groupData.splice(i, 1);
                                                }
                                                groupBegin.unshift(backwards.begin);
                                                groupData.unshift([backwards]);
                                            }
                                        }
                                        else if (item.element && item.begin <= backwards.begin) {
                                            item.addState(2 /* BACKWARDS */);
                                            queueIncomplete(item);
                                        }
                                    }
                                }
                                if (!firstPlayable) {
                                    backwards = undefined;
                                }
                            }
                            function resetTransform(additiveSum, resetTime, value) {
                                if (previousTransform && !additiveSum) {
                                    if (value === undefined) {
                                        value = TRANSFORM.valueAsInitial(previousTransform.type);
                                    }
                                    maxTime = setTimelineValue(repeatingMap[attr], resetTime, value);
                                    if (resetTime !== maxTime) {
                                        setTimeRange(previousTransform.type, maxTime);
                                    }
                                }
                                previousTransform = undefined;
                            }
                            function checkIncomplete(beginIndex, itemIndex) {
                                const expired = [];
                                $util$4.spliceArray(incomplete, previous => getDurationTotal(previous) <= actualMaxTime, previous => {
                                    previous.addState(16 /* COMPLETE */);
                                    if (!previous.fillReplace) {
                                        expired.push(...incomplete.filter(item => item.group.id < previous.group.id));
                                        if (beginIndex !== undefined && itemIndex !== undefined) {
                                            for (let i = beginIndex; i < groupBegin.length; i++) {
                                                if (i !== beginIndex) {
                                                    itemIndex = -1;
                                                }
                                                for (let j = itemIndex + 1; j < groupData[i].length; j++) {
                                                    const next = groupData[i][j];
                                                    if (next.group.id < previous.group.id) {
                                                        if (!next.fillReplace) {
                                                            sortSetterData(next);
                                                        }
                                                        next.addState(16 /* COMPLETE */);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                });
                                if (expired.length) {
                                    $util$4.spliceArray(incomplete, previous => expired.includes(previous), previous => previous.addState(16 /* COMPLETE */));
                                }
                            }
                            function checkComplete(item, nextBegin) {
                                repeatingAnimations.add(item);
                                item.addState(16 /* COMPLETE */);
                                if (item.fillForwards) {
                                    setFreezeResetValue(item.type, baseValue);
                                    freezeMap[attr] = item;
                                    incomplete.length = 0;
                                    if (item.group.order) {
                                        for (const previous of item.group.order) {
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
                                        freezeMap[attr] = item;
                                        setFreezeResetValue(item.type, baseValue);
                                        $util$4.spliceArray(incomplete, previous => previous.element !== undefined && previous.repeatCount !== -1);
                                    }
                                    if (nextBegin !== undefined) {
                                        let currentMaxTime = maxTime;
                                        const [replaceValue, modified] = checkSetterNextBegin(actualMaxTime, nextBegin);
                                        if (item.fillReplace && replaceValue !== undefined && nextBegin > actualMaxTime && incomplete.length === 0) {
                                            currentMaxTime = setTimelineValue(repeatingMap[attr], currentMaxTime, replaceValue);
                                            if (transforming) {
                                                setTimeRange(item.type, currentMaxTime);
                                            }
                                            if (!modified) {
                                                baseValue = replaceValue;
                                                maxTime = currentMaxTime;
                                            }
                                        }
                                    }
                                    checkIncomplete();
                                }
                                return false;
                            }
                            function queueIncomplete(item) {
                                item.addState(4 /* INTERRUPTED */);
                                incomplete.push(item);
                            }
                            function sortIncomplete() {
                                incomplete.sort((a, b) => {
                                    if (a.group.order && b.group.order) {
                                        return a.group.id > b.group.id ? -1 : 1;
                                    }
                                    else if (a.element && b.element === undefined) {
                                        return -1;
                                    }
                                    else if (a.element === undefined && b.element) {
                                        return 1;
                                    }
                                    else if (a.begin === b.begin) {
                                        return a.group.id > b.group.id ? -1 : 1;
                                    }
                                    return a.begin < b.begin ? 1 : -1;
                                });
                            }
                            function sortSetterData(item) {
                                if (item) {
                                    setterData.push(item);
                                }
                                setterData.sort((a, b) => {
                                    if (a.begin === b.begin) {
                                        return a.group.id < b.group.id ? -1 : 1;
                                    }
                                    return a.begin < b.begin ? -1 : 1;
                                });
                            }
                            function setFreezeResetValue(type, value, includeBase = false) {
                                if (transforming) {
                                    if (baseValueMap[attr] === undefined) {
                                        baseValueMap[attr] = value;
                                    }
                                }
                                else {
                                    if (typeof value === 'string') {
                                        let freezeValue;
                                        if ($util$4.isNumber(value)) {
                                            freezeValue = parseFloat(value);
                                        }
                                        else {
                                            freezeValue = SvgBuild.toPointList(value);
                                            if (freezeValue.length === 0) {
                                                value = '';
                                            }
                                        }
                                    }
                                }
                                if (value !== '') {
                                    freezeResetMap[attr] = { ordinal: type || 0, value };
                                    if (includeBase) {
                                        baseValue = value;
                                    }
                                }
                            }
                            function setSetterValue(item, time, value) {
                                if (time === undefined) {
                                    time = item.begin;
                                }
                                if (value === undefined) {
                                    value = item.to;
                                }
                                freezeMap[attr] = item;
                                return setTimelineValue(repeatingMap[attr], time, value);
                            }
                            function checkSetterNextBegin(previousMaxTime, nextBegin) {
                                const currentMaxTime = maxTime;
                                let modified = false;
                                let replaceValue = freezeResetMap[attr] && freezeResetMap[attr].value;
                                $util$4.spliceArray(setterData, set => set.begin >= currentMaxTime, (set) => {
                                    if (set.begin === currentMaxTime) {
                                        replaceValue = set.to;
                                    }
                                    else {
                                        modified = true;
                                    }
                                    setFreezeResetValue(set.type, set.to, incomplete.length === 0);
                                    if (set.begin > previousMaxTime && set.begin < nextBegin) {
                                        maxTime = setSetterValue(set);
                                        actualMaxTime = set.begin;
                                    }
                                });
                                return [replaceValue, modified];
                            }
                            sortSetterData();
                            $util$4.spliceArray(setterData, set => set.begin <= groupBegin[0], set => {
                                setFreezeResetValue(set.type, set.to, true);
                                if (set.begin < groupBegin[0] && backwards === undefined) {
                                    setSetterValue(set);
                                }
                            });
                            if (!transforming) {
                                if (freezeResetMap[attr] === undefined) {
                                    setFreezeResetValue(0, baseValueMap[attr]);
                                }
                                if (baseValue === undefined) {
                                    baseValue = freezeResetMap[attr].value;
                                }
                            }
                            attributeEnd: {
                                for (let i = 0; i < groupBegin.length; i++) {
                                    let begin = groupBegin[i];
                                    for (let j = 0; j < groupData[i].length; j++) {
                                        const item = groupData[i][j];
                                        if (item.hasState(16 /* COMPLETE */, 64 /* INVALID */) || item.hasState(2 /* BACKWARDS */)) {
                                            continue;
                                        }
                                        else {
                                            const freezeItem = freezeMap[attr];
                                            if (freezeItem && item.group.id < freezeItem.group.id) {
                                                item.addState(16 /* COMPLETE */);
                                                continue;
                                            }
                                        }
                                        const indefinite = item.repeatCount === -1;
                                        const duration = item.duration;
                                        const repeatCount = item.repeatCount;
                                        let durationTotal;
                                        if (!indefinite) {
                                            durationTotal = Math.min(item.end || Number.POSITIVE_INFINITY, Math.round(begin + duration * repeatCount));
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
                                            durationTotal = begin + duration;
                                        }
                                        let repeatTotal;
                                        let repeatFraction;
                                        if (indefinite) {
                                            repeatTotal = Math.ceil((repeatingDuration - begin) / duration);
                                            repeatFraction = 0;
                                        }
                                        else {
                                            repeatTotal = Math.ceil(repeatCount);
                                            repeatFraction = repeatCount - Math.floor(repeatCount);
                                        }
                                        if (actualMaxTime < begin) {
                                            checkSetterNextBegin(actualMaxTime, begin);
                                        }
                                        if (maxTime !== -1 && maxTime < begin) {
                                            maxTime = setTimelineValue(repeatingMap[attr], begin - 1, baseValue);
                                            actualMaxTime = begin;
                                            if (item.fillReplace) {
                                                freezeMap[attr] = undefined;
                                            }
                                        }
                                        if (item.group.order) {
                                            nextBeginTime = undefined;
                                            let checkBegin = true;
                                            for (const order of item.group.order) {
                                                if (order.name === item.group.name) {
                                                    checkBegin = false;
                                                    break;
                                                }
                                                else if (actualMaxTime <= order.delay) {
                                                    break;
                                                }
                                            }
                                            if (checkBegin) {
                                                nextBegin: {
                                                    for (let k = i + 1; k < groupBegin.length; k++) {
                                                        for (let l = 0; l < groupData[k].length; l++) {
                                                            const next = groupData[k][l];
                                                            if (next.group.order) {
                                                                nextBeginTime = next.begin;
                                                                break nextBegin;
                                                            }
                                                            else {
                                                                if (getDurationTotal(next) <= durationTotal) {
                                                                    if (next.fillFreeze) {
                                                                        sortSetterData(next);
                                                                    }
                                                                    next.addState(16 /* COMPLETE */);
                                                                }
                                                                else if (next.begin < durationTotal) {
                                                                    queueIncomplete(next);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        else {
                                            nextBeginTime = groupBegin[i + 1] !== undefined ? $util$4.minArray(groupBegin.slice(i + 1)) : undefined;
                                        }
                                        const actualStartTime = actualMaxTime;
                                        let startTime = maxTime + 1;
                                        let maxThreadTime = Math.min(nextBeginTime || Number.POSITIVE_INFINITY, item.end || Number.POSITIVE_INFINITY, item.repeatDuration !== -1 && item.repeatDuration < duration ? item.repeatDuration : Number.POSITIVE_INFINITY);
                                        let setterInterrupt;
                                        if (item.element) {
                                            setterInterrupt = setterData.find(set => set.begin >= actualMaxTime && set.begin <= Math.min(nextBeginTime || Number.POSITIVE_INFINITY, durationTotal, maxThreadTime));
                                            if (setterInterrupt) {
                                                switch (setterInterrupt.begin) {
                                                    case actualMaxTime:
                                                        setFreezeResetValue(setterInterrupt.type, setterInterrupt.to, true);
                                                        baseValue = setterInterrupt.to;
                                                        if (setterInterrupt.group.id > item.group.id && item.keyTimes[0] === 0) {
                                                            if (transforming && previousTransform) {
                                                                resetTransform(item.additiveSum, Math.max(begin - 1, maxTime));
                                                            }
                                                            maxTime = setSetterValue(setterInterrupt, Math.max(setterInterrupt.begin, maxTime), baseValue);
                                                            item.addState(64 /* INVALID */);
                                                        }
                                                        break;
                                                    case nextBeginTime:
                                                        setterInterrupt.addState(32 /* EQUAL_TIME */);
                                                        break;
                                                    default:
                                                        maxThreadTime = setterInterrupt.begin;
                                                        setterInterrupt.addState(32 /* EQUAL_TIME */);
                                                        break;
                                                }
                                                $util$4.spliceArray(setterData, set => set !== setterInterrupt);
                                            }
                                        }
                                        let complete = false;
                                        let lastValue;
                                        if (maxThreadTime > maxTime && !item.hasState(64 /* INVALID */)) {
                                            if (transforming) {
                                                if (previousTransform) {
                                                    resetTransform(item.additiveSum, Math.max(begin - 1, maxTime));
                                                    startTime = maxTime + 1;
                                                }
                                                setFreezeResetValue(item.type, TRANSFORM.valueAsInitial(item.type), true);
                                            }
                                            let parallel = groupBegin[i] === Number.POSITIVE_INFINITY || (maxTime !== -1 || item === backwards) && !(i === 0 && j === 0);
                                            complete = true;
                                            threadTimeExceeded: {
                                                for (let k = Math.floor(Math.max(0, Math.max(0, maxTime) - begin) / duration); k < repeatTotal; k++) {
                                                    for (let l = 0; l < item.keyTimes.length; l++) {
                                                        const keyTime = item.keyTimes[l];
                                                        let time;
                                                        let value = getItemValue(item, baseValue, k, l);
                                                        if (k === repeatTotal - 1 && repeatFraction > 0) {
                                                            if (repeatFraction > keyTime) {
                                                                for (let m = l + 1; m < item.keyTimes.length; m++) {
                                                                    if (repeatFraction <= item.keyTimes[m]) {
                                                                        time = durationTotal;
                                                                        actualMaxTime = time;
                                                                        value = getItemSplitValue(repeatFraction, keyTime, value, item.keyTimes[m], getItemValue(item, baseValue, k, m));
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
                                                            if (time < 0 || time < maxTime) {
                                                                continue;
                                                            }
                                                            if (time === maxThreadTime) {
                                                                complete = k === repeatTotal - 1 && l === item.keyTimes.length - 1;
                                                                actualMaxTime = time;
                                                            }
                                                            else {
                                                                function setSplitTimeValue(splitTime) {
                                                                    [maxTime, lastValue] = insertSplitKeyTimeValue(repeatingMap[attr], repeatingInterpolatorMap, item, baseValue, begin, k, splitTime, useKeyTime, repeatingTransformOriginMap);
                                                                }
                                                                if (begin < 0 && maxTime === -1) {
                                                                    if (time > 0) {
                                                                        actualMaxTime = 0;
                                                                        setSplitTimeValue(0);
                                                                    }
                                                                }
                                                                else {
                                                                    if (time > maxThreadTime) {
                                                                        if (parallel && maxTime + 1 < maxThreadTime) {
                                                                            setSplitTimeValue(maxTime);
                                                                        }
                                                                        actualMaxTime = maxThreadTime;
                                                                        setSplitTimeValue(maxThreadTime + (maxThreadTime === nextBeginTime && !repeatingMap[attr].has(maxThreadTime - 1) ? -1 : 0));
                                                                        complete = false;
                                                                        break threadTimeExceeded;
                                                                    }
                                                                    else {
                                                                        if (parallel) {
                                                                            if (item === backwards) {
                                                                                actualMaxTime = actualStartTime;
                                                                            }
                                                                            if (begin >= maxTime) {
                                                                                time = Math.max(begin, maxTime + 1);
                                                                                actualMaxTime = begin;
                                                                            }
                                                                            else if (time === maxTime) {
                                                                                actualMaxTime = time;
                                                                                time = maxTime + 1;
                                                                            }
                                                                            else {
                                                                                setSplitTimeValue(maxTime);
                                                                                actualMaxTime = Math.max(time, maxTime);
                                                                            }
                                                                            parallel = false;
                                                                        }
                                                                        else {
                                                                            actualMaxTime = time;
                                                                            if (k > 0 && l === 0 && item.accumulateSum) {
                                                                                insertInterpolator(repeatingInterpolatorMap, item, time, l, useKeyTime, repeatingTransformOriginMap);
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
                                                            if (l === item.keyTimes.length - 1 && (k < repeatTotal - 1 || item.fillReplace && value !== freezeResetMap[attr].value) && !item.accumulateSum) {
                                                                time--;
                                                            }
                                                            maxTime = setTimelineValue(repeatingMap[attr], time, value);
                                                            insertInterpolator(repeatingInterpolatorMap, item, maxTime, l, useKeyTime, repeatingTransformOriginMap);
                                                            lastValue = value;
                                                        }
                                                        if (!complete || repeatFraction === -1) {
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
                                                maxTime = setSetterValue(setterInterrupt, setterInterrupt.begin, lastValue);
                                                actualMaxTime = maxTime;
                                                setFreezeResetValue(setterInterrupt.type, lastValue);
                                            }
                                            else if (item.hasState(64 /* INVALID */)) {
                                                setTimeRange(setterInterrupt.type, maxTime);
                                            }
                                            $util$4.spliceArray(incomplete, previous => previous.element === undefined);
                                        }
                                        if (!item.fillReplace) {
                                            $util$4.spliceArray(setterData, set => set.begin >= actualStartTime && set.begin <= actualMaxTime, (set) => setFreezeResetValue(set.type, set.to));
                                        }
                                        if (indefinite) {
                                            if (complete) {
                                                indefiniteMap[attr] = item;
                                                break attributeEnd;
                                            }
                                            else {
                                                incomplete.length = 0;
                                                incomplete.push(item);
                                            }
                                        }
                                        else {
                                            if (complete) {
                                                nextBeginTime = nextBeginTime || Number.POSITIVE_INFINITY;
                                                if (checkComplete(item, nextBeginTime)) {
                                                    break attributeEnd;
                                                }
                                                for (let k = i; k < groupBegin.length; k++) {
                                                    if (groupBegin[k] < actualMaxTime) {
                                                        for (let l = 0; l < groupData[k].length; l++) {
                                                            const next = groupData[k][l];
                                                            if (getDurationTotal(next) > actualMaxTime && !next.hasState(4 /* INTERRUPTED */, 16 /* COMPLETE */, 64 /* INVALID */) && next !== backwards) {
                                                                queueIncomplete(next);
                                                            }
                                                        }
                                                        groupBegin[k] = Number.POSITIVE_INFINITY;
                                                        groupData[k].length = 0;
                                                    }
                                                }
                                                if (incomplete.length && actualMaxTime < nextBeginTime) {
                                                    sortIncomplete();
                                                    const resume = incomplete.filter(next => next.begin <= actualMaxTime).shift();
                                                    if (resume) {
                                                        resume.removeState(4 /* INTERRUPTED */, 2 /* BACKWARDS */);
                                                        resume.addState(8 /* RESUME */);
                                                        begin = resume.begin;
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
                                }
                                if (incomplete.length) {
                                    sortIncomplete();
                                    for (let i = 0; i < incomplete.length; i++) {
                                        const item = incomplete[i];
                                        const begin = item.begin;
                                        const duration = item.duration;
                                        const durationTotal = maxTime - begin;
                                        let maxThreadTime = Number.POSITIVE_INFINITY;
                                        function insertKeyTimes() {
                                            const startTime = maxTime + 1;
                                            let j = Math.floor(durationTotal / duration);
                                            let joined = false;
                                            freezeMap[attr] = undefined;
                                            do {
                                                for (let k = 0; k < item.keyTimes.length; k++) {
                                                    let time = getItemTime(begin, duration, item.keyTimes, j, k);
                                                    if (!joined && time >= maxTime) {
                                                        [maxTime, baseValue] = insertSplitKeyTimeValue(repeatingMap[attr], repeatingInterpolatorMap, item, baseValue, begin, j, maxTime, useKeyTime, repeatingTransformOriginMap);
                                                        joined = true;
                                                    }
                                                    if (joined) {
                                                        if (time >= maxThreadTime) {
                                                            if (maxThreadTime > maxTime) {
                                                                [maxTime, baseValue] = insertSplitKeyTimeValue(repeatingMap[attr], repeatingInterpolatorMap, item, baseValue, begin, j, maxThreadTime, useKeyTime, repeatingTransformOriginMap);
                                                                actualMaxTime = maxThreadTime;
                                                            }
                                                            return;
                                                        }
                                                        if (time > maxTime) {
                                                            actualMaxTime = time;
                                                            if (k === item.keyTimes.length - 1 && time < maxThreadTime) {
                                                                time--;
                                                            }
                                                            baseValue = getItemValue(item, baseValue, j, k);
                                                            maxTime = setTimelineValue(repeatingMap[attr], time, baseValue);
                                                            insertInterpolator(repeatingInterpolatorMap, item, maxTime, k, useKeyTime, repeatingTransformOriginMap);
                                                        }
                                                    }
                                                }
                                            } while (maxTime < maxThreadTime && ++j);
                                            if (transforming) {
                                                setTimeRange(item.type, startTime, maxTime);
                                            }
                                        }
                                        if (item.repeatCount === -1) {
                                            if (durationTotal > 0 && durationTotal % item.duration !== 0) {
                                                maxThreadTime = begin + item.duration * Math.ceil(durationTotal / duration);
                                                insertKeyTimes();
                                            }
                                            indefiniteMap[attr] = item;
                                            break attributeEnd;
                                        }
                                        else {
                                            maxThreadTime = Math.min(begin + item.duration * item.repeatCount, item.end || Number.POSITIVE_INFINITY);
                                            if (maxThreadTime > maxTime) {
                                                insertKeyTimes();
                                                if (checkComplete(item)) {
                                                    break attributeEnd;
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
                            let repeatingEndTime = $util$4.maxArray(keyTimesRepeating);
                            if (Object.keys(indefiniteMap).length) {
                                const begin = [];
                                const duration = [];
                                for (const attr in indefiniteMap) {
                                    begin.push(indefiniteMap[attr].begin);
                                    duration.push(indefiniteMap[attr].duration);
                                }
                                if (repeatingAnimations.size === 0 && begin[0] === keyTimesRepeating[0] && new Set(begin).size === 1 && new Set(duration).size === 1) {
                                    repeatingAsIndefinite = begin[0] <= 0 ? 0 : begin[0];
                                }
                                else {
                                    if (duration.length > 1) {
                                        repeatingEndTime = getLeastCommonMultiple(duration, begin);
                                    }
                                    else if ((repeatingEndTime - begin[0]) % duration[0] !== 0) {
                                        repeatingEndTime = duration[0] * Math.ceil(repeatingEndTime / duration[0]);
                                    }
                                }
                            }
                            if (repeatingAsIndefinite === undefined) {
                                for (const attr in repeatingMap) {
                                    let maxTime = Array.from(repeatingMap[attr].keys()).pop();
                                    if (indefiniteMap[attr]) {
                                        if (maxTime < repeatingEndTime) {
                                            const item = indefiniteMap[attr];
                                            const begin = item.begin;
                                            const startTime = maxTime + 1;
                                            let baseValue = Array.from(repeatingMap[attr].values()).pop();
                                            let i = Math.floor((maxTime - begin) / item.duration);
                                            do {
                                                let joined = false;
                                                for (let j = 0; j < item.keyTimes.length; j++) {
                                                    let time = getItemTime(begin, item.duration, item.keyTimes, i, j);
                                                    if (!joined && time >= maxTime) {
                                                        [maxTime, baseValue] = insertSplitKeyTimeValue(repeatingMap[attr], repeatingInterpolatorMap, item, baseValue, begin, i, maxTime, useKeyTime, repeatingTransformOriginMap);
                                                        keyTimesRepeating.push(maxTime);
                                                        joined = true;
                                                    }
                                                    if (joined && time > maxTime) {
                                                        if (j === item.keyTimes.length - 1 && time < repeatingEndTime) {
                                                            time--;
                                                        }
                                                        baseValue = getItemValue(item, baseValue, i, j);
                                                        maxTime = setTimelineValue(repeatingMap[attr], time, baseValue);
                                                        insertInterpolator(repeatingInterpolatorMap, item, time, j, useKeyTime, repeatingTransformOriginMap);
                                                        keyTimesRepeating.push(maxTime);
                                                    }
                                                }
                                            } while (maxTime < repeatingEndTime && ++i);
                                            if (transforming) {
                                                setTimeRange(item.type, startTime, maxTime);
                                            }
                                        }
                                    }
                                    else if (freezeMap[attr] === undefined) {
                                        let type;
                                        let value;
                                        if (freezeResetMap[attr]) {
                                            type = freezeResetMap[attr].ordinal;
                                            value = freezeResetMap[attr].value;
                                        }
                                        else {
                                            if (transforming) {
                                                type = Array.from(animateTimeRangeMap.values()).pop();
                                                value = TRANSFORM.valueAsInitial(type);
                                            }
                                            else {
                                                value = this._getBaseValue(attr, path);
                                            }
                                        }
                                        if (value !== undefined && JSON.stringify(repeatingMap[attr].get(maxTime)) !== JSON.stringify(value)) {
                                            maxTime = setTimelineValue(repeatingMap[attr], maxTime, value);
                                            setTimeRange(type, maxTime);
                                            keyTimesRepeating.push(maxTime);
                                        }
                                    }
                                }
                            }
                            const keyTimes = sortNumber(Array.from(new Set(keyTimesRepeating)));
                            for (const attr in repeatingMap) {
                                if (keyTimes[0] === 0 && !repeatingMap[attr].has(0) && baseValueMap[attr] !== undefined) {
                                    const endTime = repeatingMap[attr].keys().next().value - 1;
                                    repeatingMap[attr].set(0, baseValueMap[attr]);
                                    repeatingMap[attr].set(endTime, baseValueMap[attr]);
                                    if (!keyTimes.includes(endTime)) {
                                        keyTimes.push(endTime);
                                        sortNumber(keyTimes);
                                    }
                                }
                            }
                            const timelineMap = {};
                            for (const attr in repeatingMap) {
                                const insertMap = new Map();
                                const maxTime = $util$4.maxArray(Array.from(repeatingMap[attr].keys()));
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
                            repeatingResult = createKeyTimeMap(timelineMap, keyTimes);
                        }
                        if (repeatingAsIndefinite === undefined && Object.keys(indefiniteMap).length) {
                            const timelineMap = {};
                            const indefiniteAnimations = [];
                            let keyTimes = [];
                            for (const attr in indefiniteMap) {
                                indefiniteAnimations.push(indefiniteMap[attr]);
                            }
                            const maxDuration = getLeastCommonMultiple(indefiniteAnimations.map(item => item.duration));
                            for (const item of indefiniteAnimations) {
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
                                        baseValue = getItemValue(item, baseValue, i, j);
                                        maxTime = setTimelineValue(timelineMap[attr], time, baseValue);
                                        insertInterpolator(indefiniteInterpolatorMap, item, maxTime, j, useKeyTime, indefiniteTransformOriginMap);
                                        keyTimes.push(maxTime);
                                    }
                                } while (maxTime < maxDuration && ++i);
                            }
                            if (indefiniteAnimations.every(item => item.alternate)) {
                                let maxTime = -1;
                                for (const attr in indefiniteMap) {
                                    const times = Array.from(timelineMap[attr].keys());
                                    const values = Array.from(timelineMap[attr].values()).reverse();
                                    for (let i = 0; i < times.length; i++) {
                                        if (times[i] !== 0) {
                                            maxTime = maxDuration + times[i];
                                            const interpolator = indefiniteInterpolatorMap.get(times[i]);
                                            if (interpolator) {
                                                indefiniteInterpolatorMap.set(maxTime, interpolator);
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
                                        insertSplitTimeValue(timelineMap[attr], timelineMap[attr], keyTime);
                                    }
                                }
                            }
                            indefiniteResult = createKeyTimeMap(timelineMap, keyTimes, freezeResetMap);
                        }
                        if (repeatingResult || indefiniteResult) {
                            this._removeAnimations(conflicted);
                            const timeRange = Array.from(animateTimeRangeMap.entries());
                            const synchronizedName = Array.from(conflicted.map(item => SvgBuild.asAnimateTransform(item) ? TRANSFORM.typeAsName(item.type) : item.attributeName)).join('-');
                            [repeatingResult, indefiniteResult].forEach(result => {
                                if (result) {
                                    const repeating = result === repeatingResult;
                                    const interpolatorMap = repeating ? repeatingInterpolatorMap : indefiniteInterpolatorMap;
                                    const transformOriginMap = (repeating ? repeatingTransformOriginMap : indefiniteTransformOriginMap);
                                    if (isKeyTimeFormat(transforming, useKeyTime)) {
                                        const keySplines = [];
                                        if (transforming) {
                                            const transformMap = [];
                                            {
                                                const entries = Array.from(result.entries());
                                                if (repeating) {
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
                                                else if (indefiniteMap['transform']) {
                                                    const map = new Map();
                                                    for (let i = 0; i < entries.length; i++) {
                                                        map.set(entries[i][0], new Map([[indefiniteMap['transform'].type, entries[i][1].values().next().value]]));
                                                    }
                                                    transformMap.push(map);
                                                }
                                                else {
                                                    return;
                                                }
                                            }
                                            let previousEndTime = 0;
                                            for (let i = 0; i < transformMap.length; i++) {
                                                const entries = Array.from(transformMap[i].entries());
                                                let begin = entries[0][0];
                                                if (entries.length === 1) {
                                                    if (i < transformMap.length - 1) {
                                                        entries.push([transformMap[i + 1].keys().next().value, entries[0][1]]);
                                                    }
                                                    else {
                                                        entries.push([begin + 1, entries[0][1]]);
                                                    }
                                                }
                                                const endTime = entries[entries.length - 1][0];
                                                let duration = endTime - begin;
                                                const animate = new SvgAnimateTransform();
                                                animate.attributeName = 'transform';
                                                animate.type = entries[0][1].keys().next().value;
                                                animate.transformOrigin = [];
                                                for (let j = 0; j < entries.length; j++) {
                                                    const item = entries[j];
                                                    keySplines.push(interpolatorMap.get(item[0]) || '');
                                                    if (animate.type !== SVGTransform.SVG_TRANSFORM_ROTATE) {
                                                        const transformOrigin = transformOriginMap.get(item[0]);
                                                        if (transformOrigin) {
                                                            animate.transformOrigin[j] = transformOrigin;
                                                        }
                                                    }
                                                    item[0] -= begin;
                                                }
                                                for (const [keyTime, data] of convertToFraction(entries)) {
                                                    animate.keyTimes.push(keyTime);
                                                    animate.values.push(data.values().next().value);
                                                }
                                                begin -= previousEndTime;
                                                if (begin > 1) {
                                                    animate.begin = begin;
                                                }
                                                else if (begin === 1 && (duration + 1) % 10 === 0) {
                                                    duration++;
                                                }
                                                animate.duration = duration;
                                                animate.keySplines = keySplines;
                                                animate.synchronized = { ordinal: i, value: '' };
                                                previousEndTime = endTime;
                                                this._insertAnimate(animate, repeating);
                                            }
                                        }
                                        else {
                                            const entries = Array.from(result.entries());
                                            const begin = repeatingAsIndefinite || 0;
                                            let object;
                                            for (const item of entries) {
                                                keySplines.push(interpolatorMap.get(item[0]) || '');
                                                item[0] -= begin;
                                            }
                                            if (path) {
                                                const pathData = getPathData(convertToFraction(entries), path, this.parent);
                                                if (pathData) {
                                                    object = new SvgAnimate();
                                                    object.attributeName = 'd';
                                                    for (const item of pathData) {
                                                        object.keyTimes.push(item.ordinal);
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
                                            object.begin = begin;
                                            object.keySplines = keySplines;
                                            object.duration = entries[entries.length - 1][0];
                                            this._insertAnimate(object, repeating);
                                        }
                                    }
                                    else if (isFromToFormat(transforming, useKeyTime)) {
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
                                                else if (indefiniteMap['transform']) {
                                                    animate.type = indefiniteMap['transform'].type;
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
                                                object.begin = i === 0 ? keyTimeFrom : 0;
                                            }
                                            object.duration = keyTimeTo - keyTimeFrom;
                                            object.keyTimes = [0, 1];
                                            object.synchronized = { ordinal: i, value };
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
                    $util$4.retainArray(this.animation, (item) => !values.includes(item));
                }
            }
            _insertAnimate(item, repeating) {
                if (!repeating) {
                    item.repeatCount = -1;
                }
                item.from = item.values[0];
                item.to = item.values[item.values.length - 1];
                this.animation.push(item);
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
                return TRANSFORM.parse(element) || SvgBuild.convertTransforms(element.transform.baseVal);
            }
            getAnimations(companion) {
                const element = companion || this.element;
                const result = [];
                let groupId = 0;
                function addAnimation(item, begin, value = '') {
                    if (value === '') {
                        groupId++;
                    }
                    item.begin = begin;
                    item.group = { id: groupId, name: value };
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
                                        if (SvgBuild.asShape(this) && this.path) {
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
                    const groupName = [];
                    const groupOrder = [];
                    animationName.forEach((keyframe, index) => {
                        const keyframes = KEYFRAME_NAME.get(keyframe);
                        if (keyframes) {
                            const duration = convertClockTime(cssData['animation-duration'][index]);
                            if (duration > 0) {
                                const paused = cssData['animation-play-state'][index] === 'paused';
                                const delay = convertClockTime(cssData['animation-delay'][index]);
                                const iterationCount = cssData['animation-iteration-count'][index];
                                const fillMode = cssData['animation-fill-mode'][index];
                                const keyframeIndex = `${keyframe}_${index}`;
                                groupOrder.push({
                                    name: keyframeIndex,
                                    paused,
                                    delay,
                                    duration,
                                    iterationCount,
                                    fillMode
                                });
                                groupId++;
                                const attrMap = {};
                                const keyframeMap = {};
                                for (const percent in keyframes) {
                                    const ordinal = parseInt(percent) / 100;
                                    for (const name in keyframes[percent]) {
                                        const map = ANIMATION_DEFAULT[name] ? keyframeMap : attrMap;
                                        if (map[name] === undefined) {
                                            map[name] = [];
                                        }
                                        map[name].push({ ordinal, value: keyframes[percent][name] });
                                    }
                                }
                                if (attrMap['transform']) {
                                    function getKeyframeOrigin(ordinal) {
                                        const origin = attrMap['transform-origin'] && attrMap['transform-origin'].find(item => item.ordinal === ordinal);
                                        if (origin) {
                                            return TRANSFORM.origin(element, origin.value);
                                        }
                                        return undefined;
                                    }
                                    for (const transform of sortAttribute(attrMap['transform'])) {
                                        const transforms = TRANSFORM.parse(element, transform.value);
                                        if (transforms) {
                                            const origin = getKeyframeOrigin(transform.ordinal);
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
                                                        value = `${m.a} ${m.d}`;
                                                        if (origin && (transform.ordinal !== 0 || origin.x !== 0 || origin.y !== 0)) {
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
                                                        if (origin && (transform.ordinal !== 0 || origin.y !== 0)) {
                                                            transformOrigin = {
                                                                x: origin.y * m.c * -1,
                                                                y: 0
                                                            };
                                                        }
                                                        break;
                                                    case SVGTransform.SVG_TRANSFORM_SKEWY:
                                                        name = 'skewY';
                                                        value = item.angle.toString();
                                                        if (origin && (transform.ordinal !== 0 || origin.x !== 0)) {
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
                                                const previousIndex = attrMap[name].findIndex(subitem => subitem.ordinal === transform.ordinal);
                                                if (previousIndex !== -1) {
                                                    attrMap[name][previousIndex].value = value;
                                                    attrMap[name][previousIndex].transformOrigin = transformOrigin;
                                                }
                                                else {
                                                    attrMap[name].push({
                                                        ordinal: transform.ordinal,
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
                                    let animate;
                                    switch (name) {
                                        case 'rotate':
                                        case 'scale':
                                        case 'skewX':
                                        case 'skewY':
                                        case 'translate':
                                            animate = new SvgAnimateTransform();
                                            animate.attributeName = 'transform';
                                            animate.baseFrom = TRANSFORM.valueAsInitial(name);
                                            animate.setType(name);
                                            break;
                                        default:
                                            animate = new SvgAnimate();
                                            animate.attributeName = name;
                                            animate.baseFrom = $util$6.optionalAsString(element, `${name}.baseVal.valueAsString`) || $dom$3.cssAttribute(element, name);
                                            break;
                                    }
                                    const timingFunction = cssData['animation-timing-function'][index];
                                    const direction = cssData['animation-direction'][index];
                                    const keyTimes = [];
                                    const values = [];
                                    const keySplines = [];
                                    sortAttribute(animation);
                                    for (let i = 0; i < animation.length; i++) {
                                        keyTimes.push(animation[i].ordinal);
                                        values.push(animation[i].value);
                                        if (i < animation.length - 1) {
                                            const spline = keyframeMap['animation-timing-function'] && keyframeMap['animation-timing-function'].find(item => item.ordinal === animation[i].ordinal);
                                            keySplines.push(spline ? spline.value : timingFunction);
                                        }
                                        const transformOrigin = animation[i].transformOrigin;
                                        if (transformOrigin && SvgBuild.asAnimateTransform(animate)) {
                                            if (animate.transformOrigin === undefined) {
                                                animate.transformOrigin = [];
                                            }
                                            animate.transformOrigin[i] = transformOrigin;
                                        }
                                    }
                                    addAnimation(animate, delay, keyframeIndex);
                                    animate.paused = paused;
                                    animate.duration = duration;
                                    if (!keySplines.every(spline => spline === 'linear')) {
                                        const keyTimesData = [];
                                        const valuesData = [];
                                        const keySplinesData = [];
                                        for (let i = 0; i < keySplines.length; i++) {
                                            if (KEYSPLINE_NAME[keySplines[i]]) {
                                                keySplines[i] = KEYSPLINE_NAME[keySplines[i]];
                                            }
                                            else if (keySplines[i].startsWith('step')) {
                                                if (i === 0 && values[i] === '' && animate.baseFrom) {
                                                    values[i] = animate.baseFrom;
                                                }
                                                const steps = SvgAnimate.toStepFractionList(name, keySplines[i], i, keyTimes, values, getHostDPI(), getFontSize(element));
                                                if (steps) {
                                                    keyTimesData.push(...steps[0]);
                                                    valuesData.push(...steps[1]);
                                                    steps[0].forEach(() => keySplinesData.push(KEYSPLINE_NAME['step']));
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
                                        animate.values = valuesData;
                                        animate.keyTimes = keyTimesData;
                                        animate.keySplines = keySplinesData;
                                    }
                                    else {
                                        animate.values = values;
                                        animate.keyTimes = keyTimes;
                                    }
                                    animate.repeatCount = iterationCount !== 'infinite' ? parseFloat(iterationCount) : -1;
                                    animate.fillForwards = fillMode === 'forwards' || fillMode === 'both';
                                    animate.fillBackwards = fillMode === 'backwards' || fillMode === 'both';
                                    animate.reverse = direction.endsWith('reverse');
                                    animate.alternate = (animate.repeatCount === -1 || animate.repeatCount > 1) && direction.startsWith('alternate');
                                    if ($util$6.hasValue(animate.baseFrom)) {
                                        if (animate.keyTimes[0] !== 0) {
                                            animate.keyTimes.unshift(0);
                                            animate.values.unshift(animate.baseFrom);
                                            if (animate.keySplines) {
                                                animate.keySplines.unshift(timingFunction);
                                            }
                                        }
                                    }
                                    groupName.push(animate);
                                }
                            }
                        }
                    });
                    groupOrder.reverse();
                    for (const item of groupName) {
                        item.setGroupOrder(groupOrder);
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
        synchronize(useKeyTime = 0) {
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
        synchronize(useKeyTime = 0) {
            if (!this.documentRoot && this.animation.length) {
                this.mergeAnimations(this.getAnimateViewRect(), this.getAnimateTransform(), useKeyTime);
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
                this._setAttribute('color', true);
                this._setColor('fill');
                this._setAttribute('fill-opacity');
                this._setAttribute('fill-rule');
                this._setColor('stroke');
                this._setAttribute('stroke-opacity');
                this._setAttribute('stroke-width');
                this._setAttribute('stroke-linecap');
                this._setAttribute('stroke-linejoin');
                this._setAttribute('stroke-miterlimit');
                this._setAttribute('stroke-dasharray');
                this._setAttribute('stroke-dashoffset');
                this._setAttribute('clip-rule');
                const clipPath = this._getAttribute('clip-path', false, false);
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
                                const boxRect = SvgBuild.toBoxRect(d);
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
            _setAttribute(attr, computed = false) {
                const value = this._getAttribute(attr, computed);
                if (value !== '') {
                    this[$util$7.convertCamelCase(attr)] = value;
                }
            }
            _getAttribute(attr, computed = false, inherited = true) {
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
        draw(transform, residual, extract = false) {
            if (!extract) {
                this.transformed = null;
            }
            const parent = this.parent;
            const element = this.element;
            let d = '';
            if (SVG.path(element)) {
                d = this.getBaseValue('d');
                if (parent && parent.aspectRatio.unit !== 1 || transform && transform.length) {
                    const commands = SvgBuild.getPathCommands(d);
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
                d = SvgBuild.drawEllipse(pt.x, pt.y, pt.rx, pt.ry);
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
                    d = SvgBuild.drawPolygon(points);
                }
                else {
                    if (parent) {
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
                d = element.tagName === 'polygon' ? SvgBuild.drawPolygon(points) : SvgBuild.drawPolyline(points);
            }
            if (!extract) {
                this.value = d;
                this.setPaint([d]);
            }
            return d;
        }
        transformPoints(transform, points, center) {
            return SvgBuild.applyTransforms(transform, points, TRANSFORM.origin(this.element), center);
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
                this._transform = TRANSFORM.parse(this.element) || SvgBuild.convertTransforms(this.element.transform.baseVal);
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
        synchronize(useKeyTime = 0, element) {
            if (this.path && this.animation.length) {
                this.mergeAnimations(this.getAnimateShape(element || this.element), element ? [] : this.getAnimateTransform(), useKeyTime, this.path);
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
                const boxRect = SvgBuild.toBoxRect(d);
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
                                item.path.clipPath = SvgBuild.drawRect(tileWidth, tileHeight, x, y) + (item.path.clipPath !== '' ? `;${item.path.clipPath}` : '');
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
        synchronize(useKeyTime = 0) {
            if (this.animation.length) {
                this.mergeAnimations(this.getAnimateViewRect(), this.getAnimateTransform(), useKeyTime);
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
        synchronize(useKeyTime = 0) {
            const [animations, transformations] = [this.animation.filter(item => this.validateBaseValue(item.attributeName, 0) === undefined || item.attributeName === 'x' || item.attributeName === 'y'), this.getAnimateTransform()];
            if (animations.length || transformations.length) {
                this.mergeAnimations(this.getAnimateViewRect(animations), transformations, useKeyTime);
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
        synchronize(useKeyTime = 0) {
            if (this.animation.length) {
                this.mergeAnimations(this.getAnimateViewRect(), this.getAnimateTransform(), useKeyTime);
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
