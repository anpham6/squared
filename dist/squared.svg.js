/* squared.svg 1.2.6
   https://github.com/anpham6/squared */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory((global.squared = global.squared || {}, global.squared.svg = {})));
}(this, function (exports) { 'use strict';

    const { css: $css, dom: $dom, math: $math, regex: $regex, session: $session, util: $util, } = squared.lib;
    const SHAPES = {
        path: 1,
        line: 2,
        rect: 3,
        ellipse: 4,
        circle: 5,
        polyline: 6,
        polygon: 7
    };
    const STRING_DECIMAL = `(${$regex.STRING.DECIMAL})`;
    const REGEXP_TRANSFORM = {
        MATRIX: new RegExp(`(matrix(?:3d)?)\\(${STRING_DECIMAL}, ${STRING_DECIMAL}, ${STRING_DECIMAL}, ${STRING_DECIMAL}, ${STRING_DECIMAL}, ${STRING_DECIMAL}(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?(?:, ${STRING_DECIMAL})?\\)`, 'g'),
        ROTATE: new RegExp(`(rotate[XY]?)\\(${$regex.STRING.CSS_ANGLE}\\)`, 'g'),
        SKEW: new RegExp(`(skew[XY]?)\\(${$regex.STRING.CSS_ANGLE}(?:, ${$regex.STRING.CSS_ANGLE})?\\)`, 'g'),
        SCALE: new RegExp(`(scale[XY]?)\\(${STRING_DECIMAL}(?:, ${STRING_DECIMAL})?\\)`, 'g'),
        TRANSLATE: new RegExp(`(translate[XY]?)\\(${$regex.STRING.LENGTH_PERCENTAGE}(?:, ${$regex.STRING.LENGTH_PERCENTAGE})?\\)`, 'g')
    };
    let REGEXP_ROTATEORIGIN;
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
            const r = $math.convertRadian(angle);
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
                b: Math.tan($math.convertRadian(y)),
                c: Math.tan($math.convertRadian(x)),
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
            const transform = value || element.style.getPropertyValue('transform');
            if (transform !== '') {
                const ordered = [];
                for (const name in REGEXP_TRANSFORM) {
                    REGEXP_TRANSFORM[name].lastIndex = 0;
                    let match;
                    while ((match = REGEXP_TRANSFORM[name].exec(transform)) !== null) {
                        const isX = match[1].endsWith('X');
                        const isY = match[1].endsWith('Y');
                        if (match[1].startsWith('rotate')) {
                            const angle = $css.convertAngle(match[2], match[3]);
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
                            ordered[match.index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_ROTATE, matrix, angle, !isX, !isY);
                        }
                        else if (match[1].startsWith('skew')) {
                            const x = isY ? 0 : $css.convertAngle(match[2], match[3]);
                            const y = isY ? $css.convertAngle(match[2], match[3]) : (match[4] && match[5] ? $css.convertAngle(match[4], match[5]) : 0);
                            const matrix = MATRIX.skew(x, y);
                            if (isX) {
                                ordered[match.index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SKEWX, matrix, x, true, false);
                            }
                            else if (isY) {
                                ordered[match.index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SKEWY, matrix, y, false, true);
                            }
                            else {
                                ordered[match.index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SKEWX, Object.assign({}, matrix, { b: 0 }), x, true, false);
                                if (y !== 0) {
                                    ordered[match.index + 1] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SKEWY, Object.assign({}, matrix, { c: 0 }), y, false, true);
                                }
                            }
                        }
                        else if (match[1].startsWith('scale')) {
                            const x = isY ? undefined : parseFloat(match[2]);
                            const y = isY ? parseFloat(match[2]) : (!isX && match[3] ? parseFloat(match[3]) : x);
                            const matrix = MATRIX.scale(x, isX ? undefined : y);
                            ordered[match.index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_SCALE, matrix, 0, !isY, !isX);
                        }
                        else if (match[1].startsWith('translate')) {
                            const fontSize = $css.getFontSize(element);
                            const arg1 = $css.parseUnit(match[2], fontSize);
                            const arg2 = (!isX && match[3] ? $css.parseUnit(match[3], fontSize) : 0);
                            const x = isY ? 0 : arg1;
                            const y = isY ? arg1 : arg2;
                            const matrix = MATRIX.translate(x, y);
                            ordered[match.index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_TRANSLATE, matrix, 0);
                        }
                        else if (match[1].startsWith('matrix')) {
                            const matrix = TRANSFORM.matrix(element, value);
                            if (matrix) {
                                ordered[match.index] = TRANSFORM.create(SVGTransform.SVG_TRANSFORM_MATRIX, matrix);
                            }
                        }
                    }
                }
                const result = [];
                ordered.forEach(item => {
                    item.fromCSS = true;
                    result.push(item);
                });
                return result;
            }
            return undefined;
        },
        matrix(element, value) {
            REGEXP_TRANSFORM.MATRIX.lastIndex = 0;
            const match = REGEXP_TRANSFORM.MATRIX.exec(value || $css.getStyle(element).transform || '');
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
                value = getAttribute(element, 'transform-origin');
            }
            const result = { x: 0, y: 0 };
            if (value !== '') {
                const viewBox = getNearestViewBox(element);
                function setPosition(attr, position, dimension) {
                    if ($css.isLength(position)) {
                        result[attr] = $css.parseUnit(position, $css.getFontSize(element));
                    }
                    else if ($css.isPercent(position)) {
                        result[attr] = (parseFloat(position) / 100) * dimension;
                    }
                }
                let width = 0;
                let height = 0;
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
                    width = bounds.width;
                    height = bounds.height;
                }
                const positions = value.split(' ');
                if (positions.length === 1) {
                    positions.push('center');
                }
                switch (positions[0]) {
                    case '0%':
                    case 'left':
                        break;
                    case '100%':
                    case 'right':
                        result.x = width;
                        break;
                    case 'center':
                        positions[0] = '50%';
                    default:
                        setPosition('x', positions[0], width);
                        break;
                }
                switch (positions[1]) {
                    case '0%':
                    case 'top':
                        break;
                    case '100%':
                    case 'bottom':
                        result.y = height;
                        break;
                    case 'center':
                        positions[1] = '50%';
                    default:
                        setPosition('y', positions[1], height);
                        break;
                }
            }
            return result;
        },
        rotateOrigin(element, attr = 'transform') {
            const value = $dom.getNamedItem(element, attr);
            const result = [];
            if (value !== '') {
                if (REGEXP_ROTATEORIGIN === undefined) {
                    REGEXP_ROTATEORIGIN = /rotate\((-?[\d.]+)(?:,? (-?[\d.]+))?(?:,? (-?[\d.]+))?\)/g;
                }
                else {
                    REGEXP_ROTATEORIGIN.lastIndex = 0;
                }
                let match;
                while ((match = REGEXP_ROTATEORIGIN.exec(value)) !== null) {
                    const angle = parseFloat(match[1]);
                    if (angle !== 0) {
                        result.push({
                            angle,
                            x: match[2] ? parseFloat(match[2]) : 0,
                            y: match[3] ? parseFloat(match[3]) : 0
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
                default:
                    return '';
            }
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
                default:
                    return '';
            }
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
    function getDOMRect(element) {
        const result = element.getBoundingClientRect();
        result.x = result.left;
        result.y = result.top;
        return result;
    }
    function getAttribute(element, attr, computed = true) {
        let value = $dom.getNamedItem(element, attr);
        if (value === '') {
            const styleMap = $session.getElementCache(element, 'styleMap');
            if (styleMap) {
                value = styleMap[$util.convertCamelCase(attr)] || '';
            }
            if (value === '' && (computed || Array.from(element.style).includes(attr))) {
                value = $css.getStyle(element).getPropertyValue(attr);
            }
        }
        return value.trim();
    }
    function getParentAttribute(element, attr, computed = true) {
        let current = element;
        let value = '';
        while (current && !(current instanceof HTMLElement)) {
            value = getAttribute(current, attr, computed);
            if (value !== '' && value !== 'inherit') {
                break;
            }
            current = current.parentElement;
        }
        return value;
    }
    function getAttributeURL(value) {
        const match = $regex.CSS.URL.exec(value);
        return match ? match[1] : '';
    }
    function getTargetElement(element, rootElement) {
        const value = $dom.getNamedItem(element, 'href');
        if (value.charAt(0) === '#') {
            const id = value.substring(1);
            let parent;
            if (rootElement) {
                parent = rootElement;
            }
            else {
                parent = element.parentElement;
                while (parent && parent.parentElement instanceof SVGGraphicsElement) {
                    parent = parent.parentElement;
                }
            }
            if (parent) {
                const elements = parent.querySelectorAll('*');
                const length = elements.length;
                for (let i = 0; i < length; i++) {
                    const target = elements.item(i);
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
    function createPath(value) {
        const element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        element.setAttribute('d', value);
        return element;
    }
    function getPathLength(value) {
        const element = createPath(value);
        return element.getTotalLength();
    }

    var util = /*#__PURE__*/Object.freeze({
        MATRIX: MATRIX,
        TRANSFORM: TRANSFORM,
        SVG: SVG,
        getDOMRect: getDOMRect,
        getAttribute: getAttribute,
        getParentAttribute: getParentAttribute,
        getAttributeURL: getAttributeURL,
        getTargetElement: getTargetElement,
        getNearestViewBox: getNearestViewBox,
        createPath: createPath,
        getPathLength: getPathLength
    });

    const { css: $css$1, dom: $dom$1, math: $math$1, regex: $regex$1, util: $util$1 } = squared.lib;
    const REGEXP_DECIMAL = new RegExp($regex$1.STRING.DECIMAL, 'g');
    const REGEXP_COMMAND = /([A-Za-z])([^A-Za-z]+)?/g;
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
        static isAnimateTransform(object) {
            return $util$1.hasBit(object.instanceType, 49160 /* SVG_ANIMATE_TRANSFORM */);
        }
        static asSvg(object) {
            return object.instanceType === 18 /* SVG */;
        }
        static asG(object) {
            return object.instanceType === 34 /* SVG_G */;
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
        static asImage(object) {
            return object.instanceType === 4100 /* SVG_IMAGE */;
        }
        static asUse(object) {
            return object.instanceType === 10244 /* SVG_USE */;
        }
        static asUseSymbol(object) {
            return object.instanceType === 66 /* SVG_USE_SYMBOL */;
        }
        static asSet(object) {
            return object.instanceType === 8 /* SVG_ANIMATION */;
        }
        static asAnimate(object) {
            return object.instanceType === 16392 /* SVG_ANIMATE */;
        }
        static asAnimateTransform(object) {
            return object.instanceType === 49160 /* SVG_ANIMATE_TRANSFORM */;
        }
        static asAnimateMotion(object) {
            return object.instanceType === 114696 /* SVG_ANIMATE_MOTION */;
        }
        static setName(element) {
            if (element) {
                let value = '';
                let tagName;
                if ($util$1.isString(element.id)) {
                    const id = $util$1.convertWord(element.id, true);
                    if (!NAME_GRAPHICS.has(id)) {
                        value = id;
                    }
                    tagName = id;
                }
                else {
                    tagName = element.tagName;
                }
                let index = NAME_GRAPHICS.get(tagName) || 0;
                if (value !== '') {
                    NAME_GRAPHICS.set(value, index);
                    return value;
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
        static drawLine(x1, y1, x2 = 0, y2 = 0, precision) {
            if (precision) {
                x1 = $math$1.truncate(x1, precision);
                y1 = $math$1.truncate(y1, precision);
                x2 = $math$1.truncate(x2, precision);
                y2 = $math$1.truncate(y2, precision);
            }
            return `M${x1},${y1} L${x2},${y2}`;
        }
        static drawRect(width, height, x = 0, y = 0, precision) {
            if (precision) {
                width = $math$1.truncate(x + width, precision);
                height = $math$1.truncate(y + height, precision);
                x = $math$1.truncate(x, precision);
                y = $math$1.truncate(y, precision);
            }
            else {
                width += x;
                height += y;
            }
            return `M${x},${y} ${width},${y} ${width},${height} ${x},${height} Z`;
        }
        static drawCircle(cx, cy, r, precision) {
            return SvgBuild.drawEllipse(cx, cy, r, r, precision);
        }
        static drawEllipse(cx, cy, rx, ry, precision) {
            if (ry === undefined) {
                ry = rx;
            }
            let radius = rx * 2;
            if (precision) {
                cx = $math$1.truncate(cx - rx, precision);
                cy = $math$1.truncate(cy, precision);
                rx = $math$1.truncate(rx, precision);
                ry = $math$1.truncate(ry, precision);
                radius = $math$1.truncate(radius, precision);
            }
            else {
                cx -= rx;
            }
            return `M${cx},${cy} a${rx},${ry},0,0,1,${radius},0 a${rx},${ry},0,0,1,-${radius},0`;
        }
        static drawPolygon(values, precision) {
            return values.length ? `${SvgBuild.drawPolyline(values, precision)} Z` : '';
        }
        static drawPolyline(values, precision) {
            let result = 'M';
            if (precision) {
                for (const value of values) {
                    result += ` ${$math$1.truncate(value.x, precision)},${$math$1.truncate(value.y, precision)}`;
                }
            }
            else {
                for (const value of values) {
                    result += ` ${value.x},${value.y}`;
                }
            }
            return result;
        }
        static drawPath(values, precision) {
            let result = '';
            for (const value of values) {
                result += (result !== '' ? ' ' : '') + value.key;
                switch (value.key.toUpperCase()) {
                    case 'M':
                    case 'L':
                    case 'C':
                    case 'S':
                    case 'Q':
                    case 'T':
                        result += value.coordinates.join(',');
                        break;
                    case 'H':
                        result += value.coordinates[0];
                        break;
                    case 'V':
                        result += value.coordinates[1];
                        break;
                    case 'A':
                        result += `${value.radiusX},${value.radiusY},${value.xAxisRotation},${value.largeArcFlag},${value.sweepFlag},${value.coordinates.join(',')}`;
                        break;
                }
            }
            return precision ? $math$1.truncateString(result, precision) : result;
        }
        static drawRefit(element, parent, precision) {
            let value;
            if (SVG.path(element)) {
                value = $dom$1.getNamedItem(element, 'd');
                if (parent && parent.requireRefit) {
                    const commands = SvgBuild.getPathCommands(value);
                    if (commands.length) {
                        const points = SvgBuild.getPathPoints(commands);
                        if (points.length) {
                            parent.refitPoints(points);
                            value = SvgBuild.drawPath(SvgBuild.syncPathPoints(commands, points), precision);
                        }
                    }
                }
            }
            else if (SVG.line(element)) {
                const points = [
                    { x: element.x1.baseVal.value, y: element.y1.baseVal.value },
                    { x: element.x2.baseVal.value, y: element.y2.baseVal.value }
                ];
                if (parent && parent.requireRefit) {
                    parent.refitPoints(points);
                }
                value = SvgBuild.drawPolyline(points, precision);
            }
            else if (SVG.circle(element) || SVG.ellipse(element)) {
                let rx;
                let ry;
                if (SVG.ellipse(element)) {
                    rx = element.rx.baseVal.value;
                    ry = element.ry.baseVal.value;
                }
                else {
                    rx = element.r.baseVal.value;
                    ry = rx;
                }
                const points = [
                    { x: element.cx.baseVal.value, y: element.cy.baseVal.value, rx, ry }
                ];
                if (parent && parent.requireRefit) {
                    parent.refitPoints(points);
                }
                const pt = points[0];
                value = SvgBuild.drawEllipse(pt.x, pt.y, pt.rx, pt.ry, precision);
            }
            else if (SVG.rect(element)) {
                let x = element.x.baseVal.value;
                let y = element.y.baseVal.value;
                let width = element.width.baseVal.value;
                let height = element.height.baseVal.value;
                if (parent && parent.requireRefit) {
                    x = parent.refitX(x);
                    y = parent.refitY(y);
                    width = parent.refitSize(width);
                    height = parent.refitSize(height);
                }
                value = SvgBuild.drawRect(width, height, x, y, precision);
            }
            else if (SVG.polygon(element) || SVG.polyline(element)) {
                const points = SvgBuild.clonePoints(element.points);
                if (parent && parent.requireRefit) {
                    parent.refitPoints(points);
                }
                value = SVG.polygon(element) ? SvgBuild.drawPolygon(points, precision) : SvgBuild.drawPolyline(points, precision);
            }
            else {
                value = '';
            }
            return value;
        }
        static transformRefit(value, transforms, parent, container, precision) {
            const commands = SvgBuild.getPathCommands(value);
            if (commands.length) {
                let points = SvgBuild.getPathPoints(commands);
                if (points.length) {
                    const transformed = transforms && transforms.length > 0;
                    if (transformed) {
                        points = SvgBuild.applyTransforms(transforms, points, parent && TRANSFORM.origin(parent.element));
                    }
                    if (container && container.requireRefit) {
                        container.refitPoints(points);
                    }
                    value = SvgBuild.drawPath(SvgBuild.syncPathPoints(commands, points, transformed), precision);
                }
            }
            return value;
        }
        static getOffsetPath(value, rotation = 'auto 0deg') {
            const element = createPath(value);
            const totalLength = Math.ceil(element.getTotalLength());
            const result = [];
            if (totalLength > 0) {
                const keyPoints = [];
                const rotatingPoints = [];
                let rotateFixed = 0;
                let rotateInitial = 0;
                if ($css$1.isAngle(rotation)) {
                    rotateFixed = $css$1.parseAngle(rotation);
                }
                else {
                    const commands = SvgBuild.getPathCommands(value);
                    for (const item of commands) {
                        switch (item.key.toUpperCase()) {
                            case 'M':
                            case 'L':
                            case 'H':
                            case 'V':
                            case 'Z':
                                for (const pt of item.value) {
                                    keyPoints.push(pt);
                                    rotatingPoints.push(false);
                                }
                                break;
                            case 'C':
                            case 'S':
                            case 'Q':
                            case 'T':
                            case 'A':
                                keyPoints.push(item.end);
                                rotatingPoints.push(true);
                                break;
                        }
                    }
                    if (rotation !== 'auto 0deg') {
                        rotateInitial = $css$1.parseAngle(rotation.split(' ').pop());
                    }
                }
                let rotating = false;
                let rotatePrevious = 0;
                let overflow = 0;
                let center;
                for (let key = 0; key <= totalLength; key++) {
                    const nextPoint = element.getPointAtLength(key);
                    if (keyPoints.length) {
                        const index = keyPoints.findIndex(pt => {
                            const x = pt.x.toString();
                            const y = pt.y.toString();
                            return x === nextPoint.x.toPrecision(x.length - (x.indexOf('.') !== -1 ? 1 : 0)) && y === nextPoint.y.toPrecision(y.length - (y.indexOf('.') !== -1 ? 1 : 0));
                        });
                        if (index !== -1) {
                            const endPoint = keyPoints[index + 1];
                            if (endPoint) {
                                rotating = rotatingPoints[index + 1];
                                if (rotating) {
                                    center = SvgBuild.centerPoints(keyPoints[index], endPoint);
                                    rotateFixed = 0;
                                }
                                else {
                                    center = undefined;
                                    rotateFixed = $math$1.truncateFraction($math$1.absoluteAngle(nextPoint, endPoint));
                                }
                            }
                            else {
                                center = undefined;
                            }
                            overflow = 0;
                            keyPoints.splice(0, index + 1);
                            rotatingPoints.splice(0, index + 1);
                        }
                    }
                    let rotate;
                    if (rotating) {
                        rotate = center ? $math$1.truncateFraction($math$1.relativeAngle(center, nextPoint)) : 0;
                        if (rotatePrevious > 0 && rotatePrevious % 360 === 0 && Math.floor(rotate) === 0) {
                            overflow = rotatePrevious;
                        }
                        rotate += overflow;
                    }
                    else {
                        rotate = rotateFixed;
                    }
                    rotate += rotateInitial;
                    result.push({
                        key,
                        value: nextPoint,
                        rotate
                    });
                    rotatePrevious = Math.ceil(rotate);
                }
            }
            return result;
        }
        static getPathCommands(value) {
            REGEXP_COMMAND.lastIndex = 0;
            const result = [];
            let match;
            value = value.trim();
            while ((match = REGEXP_COMMAND.exec(value)) !== null) {
                if (result.length === 0 && match[1].toUpperCase() !== 'M') {
                    break;
                }
                const coordinates = SvgBuild.parseCoordinates((match[2] || '').trim());
                let previousCommand;
                let previousPoint;
                if (result.length) {
                    const previous = result[result.length - 1];
                    previousCommand = previous.key.toUpperCase();
                    previousPoint = previous.end;
                }
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
                            coordinates[0] = result[0].coordinates[0];
                            coordinates[1] = result[0].coordinates[1];
                            coordinates.length = 2;
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
                            radiusX = coordinates[0];
                            radiusY = coordinates[1];
                            xAxisRotation = coordinates[2];
                            largeArcFlag = coordinates[3];
                            sweepFlag = coordinates[4];
                            coordinates[0] = coordinates[5];
                            coordinates[1] = coordinates[6];
                            coordinates.length = 2;
                            break;
                        }
                        else {
                            continue;
                        }
                    default:
                        continue;
                }
                const length = coordinates.length;
                if (length >= 2) {
                    const relative = match[1] === match[1].toLowerCase();
                    const points = [];
                    for (let i = 0; i < length; i += 2) {
                        let x = coordinates[i];
                        let y = coordinates[i + 1];
                        if (relative && previousPoint) {
                            x += previousPoint.x;
                            y += previousPoint.y;
                        }
                        points.push({ x, y });
                    }
                    result.push({
                        key: match[1],
                        value: points,
                        start: points[0],
                        end: points[points.length - 1],
                        relative,
                        coordinates,
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
        static getPathPoints(values, radius = false) {
            const result = [];
            let x = 0;
            let y = 0;
            for (const item of values) {
                const coordinates = item.coordinates;
                const length = coordinates.length;
                for (let i = 0; i < length; i += 2) {
                    if (item.relative) {
                        x += coordinates[i];
                        y += coordinates[i + 1];
                    }
                    else {
                        x = coordinates[i];
                        y = coordinates[i + 1];
                    }
                    const pt = { x, y };
                    if (item.key.toUpperCase() === 'A') {
                        pt.rx = item.radiusX;
                        pt.ry = item.radiusY;
                        if (radius) {
                            if (coordinates[i] >= 0) {
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
                    item.key = item.key.toUpperCase();
                }
            }
            return result;
        }
        static syncPathPoints(values, points, transformed = false) {
            invalid: {
                let location;
                for (const item of values) {
                    const coordinates = item.coordinates;
                    if (item.relative) {
                        if (location) {
                            if (transformed && (item.key === 'H' || item.key === 'V')) {
                                const pt = points.shift();
                                if (pt) {
                                    coordinates[0] = pt.x;
                                    coordinates[1] = pt.y;
                                    item.value[0] = pt;
                                    item.start = pt;
                                    item.end = pt;
                                    item.key = 'L';
                                    item.relative = false;
                                }
                                else {
                                    break invalid;
                                }
                            }
                            else {
                                const length = coordinates.length;
                                for (let i = 0, j = 0; i < length; i += 2, j++) {
                                    const pt = points.shift();
                                    if (pt) {
                                        coordinates[i] = pt.x - location.x;
                                        coordinates[i + 1] = pt.y - location.y;
                                        if (item.key === 'a' && pt.rx !== undefined && pt.ry !== undefined) {
                                            item.radiusX = pt.rx;
                                            item.radiusY = pt.ry;
                                        }
                                        item.value[j] = pt;
                                    }
                                    else {
                                        break invalid;
                                    }
                                }
                                item.key = item.key.toLowerCase();
                            }
                            location = item.end;
                        }
                        else {
                            break;
                        }
                    }
                    else {
                        switch (item.key.toUpperCase()) {
                            case 'M':
                            case 'L':
                            case 'H':
                            case 'V':
                            case 'C':
                            case 'S':
                            case 'Q':
                            case 'T':
                            case 'Z': {
                                const length = coordinates.length;
                                for (let i = 0, j = 0; i < length; i += 2, j++) {
                                    const pt = points.shift();
                                    if (pt) {
                                        coordinates[i] = pt.x;
                                        coordinates[i + 1] = pt.y;
                                        item.value[j] = pt;
                                    }
                                    else {
                                        values = [];
                                        break invalid;
                                    }
                                }
                                break;
                            }
                            case 'A': {
                                const pt = points.shift();
                                if (pt && pt.rx !== undefined && pt.ry !== undefined) {
                                    coordinates[0] = pt.x;
                                    coordinates[1] = pt.y;
                                    item.radiusX = pt.rx;
                                    item.radiusY = pt.ry;
                                    item.value[0] = pt;
                                }
                                else {
                                    values = [];
                                    break invalid;
                                }
                                break;
                            }
                        }
                        if (!item.relative) {
                            location = item.end;
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
        static applyTransforms(transforms, values, origin) {
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
                                x2 = origin.x + $math$1.offsetAngleY(item.angle, origin.x);
                            }
                            if (item.method.y) {
                                y1 -= origin.y;
                                y2 = origin.y + $math$1.offsetAngleY(item.angle, origin.y);
                            }
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
                for (let i = 0; i < values.numberOfItems; i++) {
                    const pt = values.getItem(i);
                    result.push({ x: pt.x, y: pt.y });
                }
            }
            return result;
        }
        static minMaxPoints(values) {
            let minX = values[0].x;
            let maxX = minX;
            let minY = values[0].y;
            let maxY = minY;
            const length = values.length;
            for (let i = 1; i < length; i++) {
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
                else if (pt.y > maxY) {
                    maxY = pt.y;
                }
            }
            return [minX, minY, maxX, maxY];
        }
        static centerPoints(...values) {
            const result = this.minMaxPoints(values);
            return {
                x: (result[0] + result[2]) / 2,
                y: (result[1] + result[3]) / 2
            };
        }
        static convertPoints(values) {
            const result = [];
            const length = values.length;
            if (length % 2 === 0) {
                for (let i = 0; i < length; i += 2) {
                    result.push({
                        x: values[i],
                        y: values[i + 1]
                    });
                }
            }
            return result;
        }
        static parsePoints(value) {
            const result = [];
            for (const coords of value.trim().split($regex$1.CHAR.SPACE)) {
                const [x, y] = $util$1.replaceMap(coords.split($regex$1.XML.SEPARATOR), pt => parseFloat(pt));
                result.push({ x, y });
            }
            return result;
        }
        static parseCoordinates(value) {
            REGEXP_DECIMAL.lastIndex = 0;
            const result = [];
            let match;
            while ((match = REGEXP_DECIMAL.exec(value)) !== null) {
                const coord = parseFloat(match[0]);
                if (!isNaN(coord)) {
                    result.push(coord);
                }
            }
            return result;
        }
        static getBoxRect(values) {
            let points = [];
            for (const value of values) {
                points = points.concat(SvgBuild.getPathPoints(SvgBuild.getPathCommands(value), true));
            }
            const result = this.minMaxPoints(points);
            return { top: result[1], right: result[2], bottom: result[3], left: result[0] };
        }
    }

    const $dom$2 = squared.lib.dom;
    function adjustPoints(values, x, y, scaleX, scaleY) {
        for (const pt of values) {
            pt.x += x;
            pt.y += y;
            if (pt.rx !== undefined && pt.ry !== undefined) {
                pt.rx *= scaleX;
                pt.ry *= scaleY;
            }
        }
    }
    var SvgBaseVal$MX = (Base) => {
        return class extends Base {
            constructor() {
                super(...arguments);
                this._baseVal = {};
            }
            setBaseValue(attr, value) {
                if (value !== undefined) {
                    if (this.verifyBaseValue(attr, value)) {
                        this._baseVal[attr] = value;
                        return true;
                    }
                }
                else {
                    switch (attr) {
                        case 'd':
                            this._baseVal[attr] = $dom$2.getNamedItem(this.element, 'd');
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
            getBaseValue(attr, fallback) {
                return this._baseVal[attr] === undefined && !this.setBaseValue(attr) ? fallback : this._baseVal[attr];
            }
            refitBaseValue(x, y, precision, scaleX = 1, scaleY = 1) {
                for (const attr in this._baseVal) {
                    const value = this._baseVal[attr];
                    if (typeof value === 'string') {
                        if (attr === 'd') {
                            const commands = SvgBuild.getPathCommands(value);
                            const points = SvgBuild.getPathPoints(commands);
                            adjustPoints(points, x, y, scaleX, scaleY);
                            this._baseVal[attr] = SvgBuild.drawPath(SvgBuild.syncPathPoints(commands, points), precision);
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
                                break;
                            case 'r':
                                this._baseVal[attr] *= Math.min(scaleX, scaleY);
                                break;
                            case 'rx':
                            case 'width':
                                this._baseVal[attr] *= scaleX;
                                break;
                            case 'ry':
                            case 'height':
                                this._baseVal[attr] *= scaleY;
                                break;
                        }
                    }
                    else if (Array.isArray(value)) {
                        if (attr === 'points') {
                            adjustPoints(value, x, y, scaleX, scaleY);
                        }
                    }
                }
            }
            verifyBaseValue(attr, value) {
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

    const { css: $css$2, dom: $dom$3, util: $util$2 } = squared.lib;
    const CACHE_PATTERN = {
        MS: /-?\d+ms$/,
        S: /-?\d+s$/,
        MIN: /-?\d+min$/,
        H: /-?\d+(.\d+)?h$/,
        CLOCK: /^(?:(-?)(\d?\d):)?(?:(\d?\d):)?(\d?\d)\.?(\d?\d?\d)?$/
    };
    class SvgAnimation {
        constructor(element, animationElement) {
            this.element = null;
            this.animationElement = null;
            this.paused = false;
            this.fillMode = 0;
            this.synchronizeState = 0;
            this._attributeName = '';
            this._duration = -1;
            this._delay = 0;
            this._to = '';
            if (element) {
                this.element = element;
            }
            if (animationElement) {
                this.animationElement = animationElement;
                this.setAttribute('attributeName');
                this.setAttribute('to');
                this.setAttribute('fill', 'freeze');
                const dur = $dom$3.getNamedItem(animationElement, 'dur');
                if (dur !== '' && dur !== 'indefinite') {
                    this.duration = SvgAnimation.convertClockTime(dur);
                }
            }
        }
        static convertClockTime(value) {
            let s = 0;
            let ms = 0;
            if ($util$2.isNumber(value)) {
                s = parseInt(value);
            }
            else {
                if (CACHE_PATTERN.MS.test(value)) {
                    ms = parseFloat(value);
                }
                else if (CACHE_PATTERN.S.test(value)) {
                    s = parseFloat(value);
                }
                else if (CACHE_PATTERN.MIN.test(value)) {
                    s = parseFloat(value) * 60;
                }
                else if (CACHE_PATTERN.H.test(value)) {
                    s = parseFloat(value) * 60 * 60;
                }
                else {
                    const match = CACHE_PATTERN.CLOCK.exec(value);
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
        setAttribute(attr, equality) {
            if (this.animationElement) {
                const value = $dom$3.getNamedItem(this.animationElement, attr);
                if (value !== '') {
                    if (equality !== undefined) {
                        this[attr + $util$2.capitalize(equality)] = value === equality;
                    }
                    else {
                        this[attr] = value;
                    }
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
        setFillMode(mode, value) {
            const hasBit = $util$2.hasBit(this.fillMode, value);
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
        set attributeName(value) {
            if (!$util$2.isString(this.baseValue) && value !== 'transform') {
                if (this.element) {
                    switch (value) {
                        case 'opacity':
                        case 'stroke-opacity':
                        case 'fill-opacity':
                            this.baseValue = getAttribute(this.element, value, false) || '1';
                            break;
                        default:
                            this.baseValue = getAttribute(this.element, value);
                            break;
                    }
                }
                if (!$util$2.isString(this.baseValue) && this.animationElement) {
                    this.baseValue = $util$2.optionalAsString(this.animationElement.parentElement, `${value}.baseVal.valueAsString`);
                    if ($css$2.isLength(this.baseValue)) {
                        this.baseValue = $css$2.parseUnit(this.baseValue, $css$2.getFontSize(this.animationElement.parentElement)).toString();
                    }
                }
            }
            this._attributeName = value;
        }
        get attributeName() {
            return this._attributeName;
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
        set fillBackwards(value) {
            this.setFillMode(value, 8 /* BACKWARDS */);
        }
        get fillBackwards() {
            return $util$2.hasBit(this.fillMode, 8 /* BACKWARDS */);
        }
        set fillForwards(value) {
            this.setFillMode(value, 4 /* FORWARDS */);
        }
        get fillForwards() {
            return $util$2.hasBit(this.fillMode, 4 /* FORWARDS */);
        }
        set fillFreeze(value) {
            this.setFillMode(value, 2 /* FREEZE */);
        }
        get fillFreeze() {
            return $util$2.hasBit(this.fillMode, 2 /* FREEZE */);
        }
        get fillReplace() {
            return this.fillMode === 0 || this.fillMode === 8 /* BACKWARDS */;
        }
        get parentContainer() {
            let result = this._parent;
            while (result && !SvgBuild.isContainer(result)) {
                result = result.parent;
            }
            return result;
        }
        set parent(value) {
            this._parent = value;
        }
        get parent() {
            return this._parent;
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
        'step-start': '0 1 0 1',
        'step-end': '1 0 1 0'
    };

    var constant = /*#__PURE__*/Object.freeze({
        KEYSPLINE_NAME: KEYSPLINE_NAME
    });

    const { color: $color, css: $css$3, dom: $dom$4, regex: $regex$2, util: $util$3 } = squared.lib;
    const invertControlPoint = (value) => parseFloat((1 - value).toPrecision(5));
    class SvgAnimate extends SvgAnimation {
        constructor(element, animationElement) {
            super(element, animationElement);
            this.type = 0;
            this.from = '';
            this.additiveSum = false;
            this.accumulateSum = false;
            this.evaluateStart = false;
            this._iterationCount = 1;
            this._reverse = false;
            this._alternate = false;
            this._setterType = false;
            this._repeatDuration = -1;
            if (animationElement) {
                const values = $dom$4.getNamedItem(animationElement, 'values');
                const keyTimes = this.duration !== -1 ? SvgAnimate.toFractionList($dom$4.getNamedItem(animationElement, 'keyTimes')) : [];
                if (values !== '') {
                    this.values = $util$3.trimEnd(values, ';').split(/\s*;\s*/);
                    if (this.length > 1 && keyTimes.length === this.length) {
                        this.from = this.values[0];
                        this.to = this.values[this.length - 1];
                        this.keyTimes = keyTimes;
                    }
                    else if (this.length === 1) {
                        this.to = this.values[0];
                        this.convertToValues();
                    }
                }
                else {
                    this.from = $dom$4.getNamedItem(animationElement, 'from');
                    if (this.to === '') {
                        const by = $dom$4.getNamedItem(animationElement, 'by');
                        const byCoords = SvgBuild.parseCoordinates(by);
                        if (byCoords.length) {
                            if (this.from === '') {
                                if (this.baseValue) {
                                    this.from = this.baseValue;
                                }
                                this.evaluateStart = true;
                            }
                            const fromCoords = SvgBuild.parseCoordinates(this.from);
                            const length = fromCoords.length;
                            if (byCoords.length === length) {
                                const to = [];
                                for (let i = 0; i < length; i++) {
                                    to.push(fromCoords[i] + byCoords[i]);
                                }
                                this.to = to.join(',');
                            }
                        }
                    }
                    if (SvgBuild.parseCoordinates(this.to).length) {
                        this.setAttribute('additive', 'sum');
                    }
                    this.convertToValues(keyTimes);
                }
                const repeatDur = $dom$4.getNamedItem(animationElement, 'repeatDur');
                if (repeatDur !== '' && repeatDur !== 'indefinite') {
                    this._repeatDuration = SvgAnimation.convertClockTime(repeatDur);
                }
                const repeatCount = $dom$4.getNamedItem(animationElement, 'repeatCount');
                this.iterationCount = repeatCount === 'indefinite' ? -1 : parseFloat(repeatCount);
                if (animationElement.tagName === 'animate') {
                    this.setCalcMode();
                }
            }
        }
        static getSplitValue(value, next, percent) {
            return value + (next - value) * percent;
        }
        static convertStepTimingFunction(attributeName, timingFunction, keyTimes, values, index, fontSize) {
            let currentValue;
            let nextValue;
            switch (attributeName) {
                case 'fill':
                case 'stroke':
                    const colorStart = $color.parseColor(values[index]);
                    const colorEnd = $color.parseColor(values[index + 1]);
                    if (colorStart && colorEnd) {
                        currentValue = [colorStart];
                        nextValue = [colorEnd];
                    }
                    break;
                case 'points':
                    currentValue = SvgBuild.convertPoints(SvgBuild.parseCoordinates(values[index]));
                    nextValue = SvgBuild.convertPoints(SvgBuild.parseCoordinates(values[index + 1]));
                    break;
                case 'rotate':
                case 'scale':
                case 'translate':
                    currentValue = $util$3.replaceMap(values[index].trim().split($regex$2.CHAR.SPACE), value => parseFloat(value));
                    nextValue = $util$3.replaceMap(values[index + 1].trim().split($regex$2.CHAR.SPACE), value => parseFloat(value));
                    break;
                default:
                    if ($util$3.isNumber(values[index])) {
                        currentValue = [parseFloat(values[index])];
                    }
                    else if ($css$3.isLength(values[index])) {
                        currentValue = [$css$3.parseUnit(values[index], fontSize)];
                    }
                    if ($util$3.isNumber(values[index + 1])) {
                        nextValue = [parseFloat(values[index + 1])];
                    }
                    else if ($css$3.isLength(values[index + 1])) {
                        nextValue = [$css$3.parseUnit(values[index + 1], fontSize)];
                    }
                    break;
            }
            if (currentValue && nextValue && currentValue.length && currentValue.length === nextValue.length) {
                switch (timingFunction) {
                    case 'step-start':
                        timingFunction = 'steps(1, start)';
                        break;
                    case 'step-end':
                        timingFunction = 'steps(1, end)';
                        break;
                }
                const match = /steps\((\d+)(?:, (start|end))?\)/.exec(timingFunction);
                if (match) {
                    const keyTimeTotal = keyTimes[index + 1] - keyTimes[index];
                    const stepSize = parseInt(match[1]);
                    const interval = 100 / stepSize;
                    const splitTimes = [];
                    const splitValues = [];
                    for (let i = 0; i <= stepSize; i++) {
                        const offset = i === 0 && match[2] === 'start' ? 1 : 0;
                        const time = keyTimes[index] + keyTimeTotal * (i / stepSize);
                        const percent = (interval * (i + offset)) / 100;
                        const result = [];
                        switch (attributeName) {
                            case 'fill':
                            case 'stroke': {
                                const current = currentValue[0];
                                const next = nextValue[0];
                                const rgb = $color.getHexCode(SvgAnimate.getSplitValue(current.rgba.r, next.rgba.r, percent), SvgAnimate.getSplitValue(current.rgba.g, next.rgba.g, percent), SvgAnimate.getSplitValue(current.rgba.b, next.rgba.b, percent));
                                const a = $color.getHexCode(SvgAnimate.getSplitValue(current.rgba.a, next.rgba.a, percent));
                                result.push(`#${rgb + (a !== 'FF' ? a : '')}`);
                                break;
                            }
                            case 'points': {
                                const length = currentValue.length;
                                for (let j = 0; j < length; j++) {
                                    const current = currentValue[j];
                                    const next = nextValue[j];
                                    result.push(`${SvgAnimate.getSplitValue(current.x, next.x, percent)},${SvgAnimate.getSplitValue(current.y, next.y, percent)}`);
                                }
                                break;
                            }
                            default: {
                                const length = currentValue.length;
                                for (let j = 0; j < length; j++) {
                                    const current = currentValue[j];
                                    const next = nextValue[j];
                                    result.push(SvgAnimate.getSplitValue(current, next, percent).toString());
                                }
                                break;
                            }
                        }
                        if (result.length) {
                            splitTimes.push(time);
                            splitValues.push(result.join(' '));
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
        static toFractionList(value, delimiter = ';', ordered = true) {
            let previous = 0;
            const result = $util$3.replaceMap(value.split(delimiter), seg => {
                const fraction = parseFloat(seg);
                if (!isNaN(fraction) && (!ordered || fraction >= previous && fraction <= 1)) {
                    previous = fraction;
                    return fraction;
                }
                return -1;
            });
            return result.length > 1 && (!ordered || result[0] === 0 && result.some(percent => percent !== -1)) ? result : [];
        }
        setCalcMode(attributeName, mode) {
            if (this.animationElement) {
                if (mode === undefined) {
                    mode = $dom$4.getNamedItem(this.animationElement, 'calcMode') || 'linear';
                }
                switch (mode) {
                    case 'discrete':
                        if (this.keyTimes.length === 2 && this.keyTimes[0] === 0) {
                            let keyTimes = [];
                            let values = [];
                            for (let i = 0; i < this.keyTimes.length - 1; i++) {
                                const result = SvgAnimate.convertStepTimingFunction(attributeName || this.attributeName, 'step-end', this.keyTimes, this.values, i, $css$3.getFontSize(this.animationElement));
                                if (result) {
                                    keyTimes = keyTimes.concat(result[0]);
                                    values = values.concat(result[1]);
                                }
                            }
                            keyTimes.push(this.keyTimes.pop());
                            values.push(this.values.pop());
                            this._values = values;
                            this._keyTimes = keyTimes;
                            this._keySplines = [KEYSPLINE_NAME['step-end']];
                        }
                        break;
                    case 'paced':
                        this._keySplines = undefined;
                        break;
                    case 'spline':
                        this.keySplines = $util$3.flatMap($dom$4.getNamedItem(this.animationElement, 'keySplines').split(';'), value => value.trim());
                    case 'linear':
                        if (this.keyTimes[0] !== 0 && this.keyTimes[this.keyTimes.length - 1] !== 1) {
                            const keyTimes = [];
                            const length = this.values.length;
                            for (let i = 0; i < length; i++) {
                                keyTimes.push(i / (length - 1));
                            }
                            this._keyTimes = keyTimes;
                            this._keySplines = undefined;
                        }
                        break;
                }
            }
        }
        convertToValues(keyTimes) {
            if (this.to) {
                this.values = [this.from, this.to];
                this.keyTimes = keyTimes && keyTimes.length === 2 && this.keyTimes[0] === 0 && this.keyTimes[1] <= 1 ? keyTimes : [0, 1];
                if (this.from === '') {
                    this.evaluateStart = true;
                }
            }
        }
        setGroupOrdering(value) {
            this.group.ordering = value;
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
        getIntervalEndTime(leadTime) {
            const endTime = this.getTotalDuration();
            if (leadTime < endTime) {
                const duration = this.duration;
                let time = this.delay;
                while (time + duration <= leadTime) {
                    time += duration;
                }
                return Math.min(time + this.keyTimes[this.keyTimes.length - 1] * this.duration, endTime);
            }
            return endTime;
        }
        getTotalDuration(minimum = false) {
            const iterationCount = minimum && this.iterationCount === -1 ? 1 : this.iterationCount;
            if (iterationCount !== -1) {
                return Math.min(this.delay + this.duration * iterationCount, this.end || Number.POSITIVE_INFINITY);
            }
            return Number.POSITIVE_INFINITY;
        }
        set delay(value) {
            super.delay = value;
            const animationElement = this.animationElement;
            const end = animationElement && $dom$4.getNamedItem(animationElement, 'end');
            if (end) {
                const endTime = $util$3.sortNumber($util$3.replaceMap(end.split(';'), time => SvgAnimation.convertClockTime(time)))[0];
                if (!isNaN(endTime) && (this.iterationCount === -1 || this.duration > 0 && endTime < this.duration * this.iterationCount)) {
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
            const animationElement = this.animationElement;
            this._iterationCount = isNaN(value) ? 1 : value;
            this.fillFreeze = this.iterationCount !== -1 && !!animationElement && $dom$4.getNamedItem(animationElement, 'fill') === 'freeze';
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
            if (value && this._keyTimes && this._keyTimes.length !== value.length) {
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
            return this._values ? this._values[this._values.length - 1] : '';
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
                        const points = $util$3.replaceMap(value[i].split(' '), pt => parseFloat(pt));
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
        set timingFunction(value) {
            this._timingFunction = value;
        }
        get timingFunction() {
            return this._timingFunction || this.keySplines && this.keySplines[0];
        }
        set reverse(value) {
            if (this.length && value !== this._reverse) {
                this.values.reverse();
                const keyTimes = [];
                for (const keyTime of this.keyTimes) {
                    keyTimes.push(1 - keyTime);
                }
                keyTimes.reverse();
                this.keyTimes = keyTimes;
                if (this._keySplines) {
                    const keySplines = [];
                    for (let i = this._keySplines.length - 1; i >= 0; i--) {
                        const points = $util$3.replaceMap(this._keySplines[i].split(' '), pt => parseFloat(pt));
                        if (points.length === 4) {
                            keySplines.push(`${invertControlPoint(points[2])} ${invertControlPoint(points[3])} ${invertControlPoint(points[0])} ${invertControlPoint(points[1])}`);
                        }
                        else {
                            keySplines.push(KEYSPLINE_NAME.linear);
                        }
                    }
                    this._keySplines = keySplines;
                }
            }
            this._reverse = value;
        }
        get reverse() {
            return this._reverse;
        }
        set alternate(value) {
            this._alternate = value;
        }
        get alternate() {
            return this._alternate;
        }
        get playable() {
            return !this.paused && this.duration > 0 && this.keyTimes && this.keyTimes.length > 1;
        }
        get fillReplace() {
            return super.fillReplace || this.iterationCount === -1;
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
            return this._setterType || this.animationElement !== null && this.duration === 0 && this.keyTimes.length >= 2 && this.keyTimes[0] === 0 && this.values[0] !== '';
        }
        set length(value) {
            if (value === 0) {
                this._values = undefined;
            }
        }
        get length() {
            return this._values ? this._values.length : 0;
        }
        get instanceType() {
            return 16392 /* SVG_ANIMATE */;
        }
    }

    const { dom: $dom$5, util: $util$4 } = squared.lib;
    class SvgAnimateTransform extends SvgAnimate {
        constructor(element, animationElement) {
            super(element, animationElement);
            this.attributeName = 'transform';
            if (animationElement) {
                const type = $dom$5.getNamedItem(animationElement, 'type');
                this.setType(type);
                this.setCalcMode(type);
            }
        }
        static toRotateList(values) {
            const result = [];
            for (const value of values) {
                if (value === '') {
                    result.push([0, 0, 0]);
                }
                else {
                    const seg = SvgBuild.parseCoordinates(value);
                    if (seg.length === 1) {
                        seg[1] = 0;
                        seg[2] = 0;
                    }
                    if (seg.length === 3) {
                        result.push(seg);
                    }
                    else {
                        return undefined;
                    }
                }
            }
            return result;
        }
        static toScaleList(values) {
            const result = [];
            for (const value of values) {
                if (value === '') {
                    result.push([1, 1, 0, 0]);
                }
                else {
                    const seg = SvgBuild.parseCoordinates(value);
                    if (seg.length === 1) {
                        seg[1] = seg[0];
                    }
                    if (seg.length === 2) {
                        seg[2] = 0;
                        seg[3] = 0;
                    }
                    if (seg.length === 4) {
                        result.push(seg);
                    }
                    else {
                        return undefined;
                    }
                }
            }
            return result;
        }
        static toTranslateList(values) {
            const result = [];
            for (const value of values) {
                if (value === '') {
                    result.push([0, 0]);
                }
                else {
                    const seg = SvgBuild.parseCoordinates(value);
                    if (seg.length === 1) {
                        seg[1] = 0;
                    }
                    if (seg.length === 2) {
                        result.push(seg);
                    }
                    else {
                        return undefined;
                    }
                }
            }
            return result;
        }
        static toSkewList(values) {
            const result = [];
            for (const value of values) {
                if (value === '') {
                    result.push([0]);
                }
                else {
                    const seg = SvgBuild.parseCoordinates(value);
                    if (seg.length === 1) {
                        result.push(seg);
                    }
                    else {
                        return undefined;
                    }
                }
            }
            return result;
        }
        expandToValues() {
            if (this.additiveSum && this.iterationCount !== -1 && this.keyTimes.length && this.duration > 0) {
                const durationTotal = this.duration * this.iterationCount;
                invalid: {
                    const keyTimesBase = this.keyTimes;
                    const keyTimes = [];
                    const values = [];
                    const keySplines = [];
                    let previousValues;
                    const length = keyTimesBase.length;
                    for (let i = 0; i < this.iterationCount; i++) {
                        if (i > 0 && this.keySplines) {
                            keySplines.push('');
                        }
                        for (let j = 0; j < length; j++) {
                            const coordinates = SvgBuild.parseCoordinates(this.values[j]);
                            const lengthA = coordinates.length;
                            if (lengthA) {
                                let currentValues;
                                switch (this.type) {
                                    case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                                        if (lengthA === 1) {
                                            currentValues = [coordinates[0], 0];
                                        }
                                        else if (lengthA === 2) {
                                            currentValues = coordinates;
                                        }
                                        break;
                                    case SVGTransform.SVG_TRANSFORM_SCALE:
                                        if (lengthA === 1) {
                                            currentValues = [coordinates[0], coordinates[0]];
                                        }
                                        else if (lengthA === 2) {
                                            currentValues = coordinates;
                                        }
                                        break;
                                    case SVGTransform.SVG_TRANSFORM_ROTATE:
                                        if (lengthA === 1) {
                                            currentValues = [coordinates[0], 0, 0];
                                        }
                                        else if (lengthA === 3) {
                                            currentValues = coordinates;
                                        }
                                        break;
                                    case SVGTransform.SVG_TRANSFORM_SKEWX:
                                    case SVGTransform.SVG_TRANSFORM_SKEWY:
                                        if (lengthA === 1) {
                                            currentValues = coordinates;
                                        }
                                        break;
                                }
                                if (currentValues) {
                                    let time = (keyTimesBase[j] + i) * this.duration;
                                    if (previousValues) {
                                        const lengthB = currentValues.length;
                                        for (let k = 0; k < lengthB; k++) {
                                            currentValues[k] += previousValues[k];
                                        }
                                    }
                                    if (i < this.iterationCount - 1 && j === length - 1) {
                                        if (this.accumulateSum) {
                                            previousValues = currentValues;
                                        }
                                        time--;
                                    }
                                    keyTimes.push(time / durationTotal);
                                    values.push(currentValues.join(' '));
                                    if (this.keySplines && j < length - 1) {
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
                    this.values = values;
                    this.keyTimes = keyTimes;
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
                    if (this.animationElement) {
                        values = SvgAnimateTransform.toTranslateList(this.values);
                    }
                    break;
                case 'scale':
                    this.type = SVGTransform.SVG_TRANSFORM_SCALE;
                    if (this.animationElement) {
                        values = SvgAnimateTransform.toScaleList(this.values);
                    }
                    break;
                case 'rotate':
                    this.type = SVGTransform.SVG_TRANSFORM_ROTATE;
                    if (this.animationElement) {
                        values = SvgAnimateTransform.toRotateList(this.values);
                    }
                    break;
                case 'skewX':
                    this.type = SVGTransform.SVG_TRANSFORM_SKEWX;
                    if (this.animationElement) {
                        values = SvgAnimateTransform.toSkewList(this.values);
                    }
                    break;
                case 'skewY':
                    this.type = SVGTransform.SVG_TRANSFORM_SKEWY;
                    if (this.animationElement) {
                        values = SvgAnimateTransform.toSkewList(this.values);
                    }
                    break;
                default:
                    return;
            }
            if (values) {
                this.values = $util$4.replaceMap(values, array => array.join(' '));
            }
            this.baseValue = TRANSFORM.typeAsValue(this.type);
        }
        get instanceType() {
            return 49160 /* SVG_ANIMATE_TRANSFORM */;
        }
    }

    const $util$5 = squared.lib.util;
    function getAttributeName(value) {
        if (value.indexOf(':') !== -1) {
            return value.split(':')[0];
        }
        return value;
    }
    class SvgAnimationIntervalMap {
        static getGroupEndTime(item) {
            return item.iterationCount === 'infinite' ? Number.POSITIVE_INFINITY : item.delay + item.duration * parseInt(item.iterationCount);
        }
        static getKeyName(item) {
            return item.attributeName + (SvgBuild.isAnimateTransform(item) ? `:${TRANSFORM.typeAsName(item.type)}` : '');
        }
        constructor(animations, ...attrs) {
            animations = (attrs.length ? $util$5.filterArray(animations, item => attrs.includes(item.attributeName)) : animations.slice(0)).sort((a, b) => {
                if (a.delay === b.delay) {
                    return a.group.id < b.group.id ? 1 : -1;
                }
                return a.delay < b.delay ? -1 : 1;
            });
            attrs.length = 0;
            for (const item of animations) {
                const value = SvgAnimationIntervalMap.getKeyName(item);
                if (!attrs.includes(value)) {
                    attrs.push(value);
                }
            }
            this.map = {};
            const intervalMap = {};
            const intervalTimes = {};
            function insertIntervalValue(keyName, time, value, endTime = 0, animation, start = false, end = false, fillMode = 0, infinite = false, valueFrom) {
                if (value) {
                    if (intervalMap[keyName][time] === undefined) {
                        intervalMap[keyName][time] = [];
                    }
                    intervalMap[keyName][time].push({
                        time,
                        value,
                        animation,
                        start,
                        end,
                        endTime,
                        fillMode,
                        infinite,
                        valueFrom
                    });
                    intervalTimes[keyName].add(time);
                }
            }
            for (const keyName of attrs) {
                this.map[keyName] = new Map();
                intervalMap[keyName] = {};
                intervalTimes[keyName] = new Set();
                const attributeName = getAttributeName(keyName);
                const backwards = animations.filter(item => item.fillBackwards && item.attributeName === attributeName).sort((a, b) => a.group.id < b.group.id ? 1 : -1)[0];
                if (backwards) {
                    insertIntervalValue(keyName, 0, backwards.values[0], backwards.delay, backwards, backwards.delay === 0, false, 8 /* BACKWARDS */);
                }
            }
            for (const item of animations) {
                const keyName = SvgAnimationIntervalMap.getKeyName(item);
                if (intervalMap[keyName][-1] === undefined && item.baseValue) {
                    insertIntervalValue(keyName, -1, item.baseValue);
                }
                if (item.setterType) {
                    const fillReplace = item.fillReplace && item.duration > 0;
                    insertIntervalValue(keyName, item.delay, item.to, fillReplace ? item.delay + item.duration : 0, item, fillReplace, !fillReplace, 2 /* FREEZE */);
                    if (fillReplace) {
                        insertIntervalValue(keyName, item.delay + item.duration, '', 0, item, false, true, 2 /* FREEZE */);
                    }
                }
                else if (SvgBuild.isAnimate(item) && item.duration > 0) {
                    const infinite = item.iterationCount === -1;
                    const timeEnd = item.getTotalDuration();
                    insertIntervalValue(keyName, item.delay, item.valueTo, timeEnd, item, true, false, 0, infinite, item.valueFrom);
                    if (!infinite && !item.fillReplace) {
                        insertIntervalValue(keyName, timeEnd, item.valueTo, 0, item, false, true, item.fillForwards ? 4 /* FORWARDS */ : 2 /* FREEZE */);
                    }
                }
            }
            for (const keyName in intervalMap) {
                for (const time of $util$5.sortNumber(Array.from(intervalTimes[keyName]))) {
                    const values = intervalMap[keyName][time];
                    for (let i = 0; i < values.length; i++) {
                        const interval = values[i];
                        if (interval.value === '' || interval.start && interval.animation && SvgBuild.isAnimate(interval.animation) && interval.animation.evaluateStart) {
                            let value;
                            for (const group of this.map[keyName].values()) {
                                for (const previous of group) {
                                    if (interval.animation !== previous.animation && previous.value !== '' && (previous.time === -1 || previous.fillMode === 4 /* FORWARDS */ || previous.fillMode === 2 /* FREEZE */)) {
                                        value = previous.value;
                                        break;
                                    }
                                }
                            }
                            if (value) {
                                interval.value = value;
                            }
                            else if (interval.value === '') {
                                values.splice(i--, 1);
                            }
                        }
                    }
                    if (values.length) {
                        values.sort((a, b) => {
                            if (a.animation && b.animation) {
                                if (a.fillMode === b.fillMode) {
                                    return a.animation.group.id < b.animation.group.id ? 1 : -1;
                                }
                                return a.fillMode < b.fillMode ? 1 : -1;
                            }
                            return 0;
                        });
                        this.map[keyName].set(time, values);
                    }
                }
            }
            for (const keyName in this.map) {
                for (const [timeA, dataA] of this.map[keyName].entries()) {
                    for (const itemA of dataA) {
                        if (itemA.animation) {
                            if (itemA.fillMode === 2 /* FREEZE */) {
                                const previous = [];
                                for (const [timeB, dataB] of this.map[keyName].entries()) {
                                    if (timeB < timeA) {
                                        for (const itemB of dataB) {
                                            if (itemB.start && itemB.animation && itemB.animation.animationElement) {
                                                previous.push(itemB.animation);
                                            }
                                        }
                                    }
                                    else if (timeB > timeA) {
                                        for (let i = 0; i < dataB.length; i++) {
                                            const itemB = dataB[i];
                                            if (itemB.end && previous.includes(itemB.animation)) {
                                                dataB.splice(i--, 1);
                                            }
                                        }
                                    }
                                    else {
                                        for (let i = 0; i < dataB.length; i++) {
                                            const itemB = dataB[i];
                                            if (itemB.end && itemB.animation && itemB.animation.animationElement && itemB.animation.group.id < itemA.animation.group.id) {
                                                dataB.splice(i--, 1);
                                            }
                                        }
                                    }
                                }
                            }
                            else if (itemA.fillMode === 4 /* FORWARDS */ || itemA.infinite) {
                                let forwarded = false;
                                if (itemA.animation.group.ordering) {
                                    const duration = itemA.animation.getTotalDuration();
                                    for (const sibling of itemA.animation.group.ordering) {
                                        if (sibling.name === itemA.animation.group.name) {
                                            forwarded = true;
                                        }
                                        else if (SvgAnimationIntervalMap.getGroupEndTime(sibling) >= duration) {
                                            break;
                                        }
                                    }
                                }
                                const previous = [];
                                for (const [timeB, dataB] of this.map[keyName].entries()) {
                                    if (!forwarded && timeB < timeA) {
                                        for (const itemB of dataB) {
                                            if (itemB.start && itemB.animation) {
                                                previous.push(itemB.animation);
                                            }
                                        }
                                    }
                                    else if (timeB > timeA) {
                                        for (let i = 0; i < dataB.length; i++) {
                                            const itemB = dataB[i];
                                            if (forwarded || itemB.animation && (itemB.end && previous.includes(itemB.animation) || itemA.animation.animationElement === null && itemB.animation.group.id < itemA.animation.group.id)) {
                                                dataB.splice(i--, 1);
                                            }
                                        }
                                    }
                                    else {
                                        for (let i = 0; i < dataB.length; i++) {
                                            const itemB = dataB[i];
                                            if (itemB.end && itemB.animation && itemB.animation.group.id < itemA.animation.group.id) {
                                                dataB.splice(i--, 1);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            for (const keyName in this.map) {
                for (const [time, data] of Array.from(this.map[keyName].entries())) {
                    if (data.length === 0) {
                        this.map[keyName].delete(time);
                    }
                }
            }
        }
        has(attr, time, animation) {
            if (time !== undefined) {
                if (this.map[attr] && this.map[attr].has(time)) {
                    if (animation === undefined) {
                        return true;
                    }
                    return this.map[attr].get(time).findIndex(item => item.animation === animation) !== -1;
                }
                return false;
            }
            return this.map[attr] !== undefined;
        }
        get(attr, time, playing = false) {
            let value;
            if (this.map[attr]) {
                for (const [interval, data] of this.map[attr].entries()) {
                    if (interval <= time) {
                        for (const previous of data) {
                            if (previous.value !== '' && (previous.time === -1 || previous.end && (previous.fillMode === 4 /* FORWARDS */ || previous.fillMode === 2 /* FREEZE */)) || playing && previous.start && time !== interval) {
                                value = previous.value;
                                break;
                            }
                        }
                    }
                    else {
                        break;
                    }
                }
            }
            return value;
        }
        paused(attr, time) {
            let paused = 0;
            if (this.map[attr]) {
                for (const [interval, data] of this.map[attr].entries()) {
                    if (interval <= time) {
                        for (const previous of data) {
                            if (previous.start && (previous.infinite || previous.fillMode === 0 && previous.endTime > time)) {
                                if (previous.animation) {
                                    paused = 2;
                                }
                                else {
                                    paused = 1;
                                    break;
                                }
                            }
                            else if (previous.end && (previous.fillMode === 4 /* FORWARDS */ || paused === 1 && previous.fillMode === 2 /* FREEZE */)) {
                                paused = 0;
                                break;
                            }
                        }
                    }
                    else {
                        break;
                    }
                }
            }
            return paused === 0;
        }
        evaluateStart(item, otherValue) {
            if (item.evaluateStart) {
                const value = this.get(item.attributeName, item.delay) || otherValue && otherValue.toString() || item.baseValue;
                if (value) {
                    if (item.reverse) {
                        item.values[item.values.length - 1] = value;
                    }
                    else {
                        item.values[0] = value;
                    }
                }
                item.evaluateStart = false;
            }
            return item.values;
        }
    }

    const { math: $math$2, regex: $regex$3, util: $util$6 } = squared.lib;
    const LINE_ARGS = ['x1', 'y1', 'x2', 'y2'];
    const RECT_ARGS = ['width', 'height', 'x', 'y'];
    const POLYGON_ARGS = ['points'];
    const CIRCLE_ARGS = ['cx', 'cy', 'r'];
    const ELLIPSE_ARGS = ['cx', 'cy', 'rx', 'ry'];
    function insertAdjacentSplitValue(map, attr, time, intervalMap, transforming) {
        let previousTime = 0;
        let previousValue;
        let previous;
        let next;
        for (const [key, value] of map.entries()) {
            if (time === key) {
                previous = { key, value };
                break;
            }
            else if (time > previousTime && time < key && previousValue !== undefined) {
                previous = { key: previousTime, value: previousValue };
                next = { key, value };
                break;
            }
            previousTime = key;
            previousValue = value;
        }
        if (previous && next) {
            setTimelineValue(map, time, getItemSplitValue(time, previous.key, previous.value, next.key, next.value), true);
        }
        else if (previous) {
            setTimelineValue(map, time, previous.value, true);
        }
        else if (!transforming) {
            let value = intervalMap.get(attr, time, true);
            if (value) {
                value = convertToAnimateValue(value, true);
                if (value !== '') {
                    setTimelineValue(map, time, value);
                }
            }
        }
    }
    function convertToFraction(values) {
        const previous = new Set();
        const length = values.length;
        const timeTotal = values[length - 1][0];
        for (let i = 0; i < length; i++) {
            let fraction = values[i][0] / timeTotal;
            if (fraction > 0) {
                for (let j = 7;; j++) {
                    const value = parseFloat(fraction.toString().substring(0, j));
                    if (!previous.has(value)) {
                        fraction = value;
                        break;
                    }
                }
            }
            values[i][0] = fraction;
            previous.add(fraction);
        }
        return values;
    }
    function convertToAnimateValue(value, fromString = false) {
        if (typeof value === 'string') {
            if ($util$6.isNumber(value)) {
                value = parseFloat(value);
            }
            else {
                value = SvgBuild.parsePoints(value);
                if (value.length === 0) {
                    value = '';
                }
            }
        }
        return fromString && typeof value === 'string' ? '' : value;
    }
    function getForwardValue(items, time) {
        let value;
        if (items) {
            for (const item of items) {
                if (item.time <= time) {
                    value = item.value;
                }
                else {
                    break;
                }
            }
        }
        return value;
    }
    function getPathData(entries, path, parent, forwardMap, precision) {
        const result = [];
        const tagName = path.element.tagName;
        let baseVal;
        switch (tagName) {
            case 'line':
                baseVal = LINE_ARGS;
                break;
            case 'rect':
                baseVal = RECT_ARGS;
                break;
            case 'polyline':
            case 'polygon':
                baseVal = POLYGON_ARGS;
                break;
            case 'circle':
                baseVal = CIRCLE_ARGS;
                break;
            case 'ellipse':
                baseVal = ELLIPSE_ARGS;
                break;
            default:
                return undefined;
        }
        const transformOrigin = TRANSFORM.origin(path.element);
        const length = entries.length;
        for (let i = 0; i < length; i++) {
            const key = entries[i][0];
            const data = entries[i][1];
            const values = [];
            for (const attr of baseVal) {
                let value = data.get(attr);
                if (value === undefined) {
                    if (value === undefined) {
                        value = getForwardValue(forwardMap[attr], key);
                    }
                    if (value === undefined) {
                        value = path.getBaseValue(attr);
                    }
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
                if (path.transformed) {
                    points = SvgBuild.applyTransforms(path.transformed, points, transformOrigin);
                }
                if (parent) {
                    parent.refitPoints(points);
                }
                switch (tagName) {
                    case 'line':
                    case 'polyline':
                        value = SvgBuild.drawPolyline(points, precision);
                        break;
                    case 'rect':
                    case 'polygon':
                        value = SvgBuild.drawPolygon(points, precision);
                        break;
                    case 'circle':
                    case 'ellipse':
                        const pt = points[0];
                        value = SvgBuild.drawEllipse(pt.x, pt.y, pt.rx, pt.ry, precision);
                        break;
                }
                if (value !== undefined) {
                    result.push({ key, value });
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
    function createKeyTimeMap(map, keyTimes, forwardMap) {
        const result = new Map();
        for (const keyTime of keyTimes) {
            const values = new Map();
            for (const attr in map) {
                let value;
                if (map[attr].has(keyTime)) {
                    value = map[attr].get(keyTime);
                }
                else {
                    value = getForwardValue(forwardMap[attr], keyTime);
                }
                if (value !== undefined) {
                    values.set(attr, value);
                }
            }
            result.set(keyTime, values);
        }
        return result;
    }
    function setTimeRange(map, type, startTime, endTime) {
        if (type) {
            map.set(startTime, type);
            if (endTime !== undefined) {
                map.set(endTime, type);
            }
        }
    }
    function getItemValue(item, values, iteration, index, baseValue) {
        if (item.alternate && iteration % 2 !== 0) {
            values = values.slice(0).reverse();
        }
        switch (item.attributeName) {
            case 'transform':
                if (item.additiveSum && typeof baseValue === 'string') {
                    const baseArray = $util$6.replaceMap(baseValue.split($regex$3.CHAR.SPACE), value => parseFloat(value));
                    const valuesArray = $util$6.objectMap(values, value => $util$6.replaceMap(value.trim().split($regex$3.CHAR.SPACE), pt => parseFloat(pt)));
                    const lengthA = baseArray.length;
                    if (valuesArray.every(value => value.length === lengthA)) {
                        const result = valuesArray[index];
                        if (!item.accumulateSum) {
                            iteration = 0;
                        }
                        for (let i = 0; i < lengthA; i++) {
                            result[i] += baseArray[i];
                        }
                        const lengthB = valuesArray.length;
                        for (let i = 0; i < iteration; i++) {
                            for (let j = 0; j < lengthB; j++) {
                                const value = valuesArray[j];
                                const lengthC = value.length;
                                for (let k = 0; k < lengthC; k++) {
                                    result[k] += value[k];
                                }
                            }
                        }
                        return result.join(' ');
                    }
                }
                return values[index];
            case 'points':
                return SvgBuild.parsePoints(values[index]);
            default: {
                let result = parseFloat(values[index]);
                if (!isNaN(result)) {
                    if (item.additiveSum && typeof baseValue === 'number') {
                        result += baseValue;
                        if (!item.accumulateSum) {
                            iteration = 0;
                        }
                        const length = values.length;
                        for (let i = 0; i < iteration; i++) {
                            for (let j = 0; j < length; j++) {
                                result += parseFloat(values[j]);
                            }
                        }
                    }
                    return result;
                }
                else {
                    return baseValue || 0;
                }
            }
        }
    }
    function getItemSplitValue(fraction, previousFraction, previousValue, nextFraction, nextValue) {
        if (fraction > previousFraction) {
            if (typeof previousValue === 'number' && typeof nextValue === 'number') {
                return SvgAnimate.getSplitValue(previousValue, nextValue, (fraction - previousFraction) / (nextFraction - previousFraction));
            }
            else if (typeof previousValue === 'string' && typeof nextValue === 'string') {
                const previousArray = $util$6.replaceMap(previousValue.split(' '), value => parseFloat(value));
                const nextArray = $util$6.replaceMap(nextValue.split(' '), value => parseFloat(value));
                const length = previousArray.length;
                if (length === nextArray.length) {
                    const result = [];
                    for (let i = 0; i < length; i++) {
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
    function insertSplitValue(item, actualTime, baseValue, keyTimes, values, keySplines, delay, iteration, index, time, keyTimeMode, timelineMap, interpolatorMap, transformOriginMap) {
        if (delay < 0) {
            actualTime -= delay;
            delay = 0;
        }
        const duration = item.duration;
        const offset = actualTime - (delay + duration * iteration);
        let fraction;
        if (offset === 0) {
            fraction = index === 0 ? 0 : 1;
        }
        else {
            fraction = $math$2.clampRange(offset / duration);
        }
        let previousIndex = -1;
        let nextIndex = -1;
        const length = keyTimes.length;
        for (let l = 0; l < length; l++) {
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
            value = getItemSplitValue(fraction, keyTimes[previousIndex], getItemValue(item, values, iteration, previousIndex, baseValue), keyTimes[nextIndex], getItemValue(item, values, iteration, nextIndex, baseValue));
        }
        else {
            nextIndex = previousIndex !== -1 ? previousIndex + 1 : keyTimes.length - 1;
            value = getItemValue(item, values, iteration, nextIndex, baseValue);
        }
        time = setTimelineValue(timelineMap, time, value);
        insertInterpolator(item, time, keySplines, nextIndex, keyTimeMode, interpolatorMap, transformOriginMap);
        return [time, value];
    }
    function appendPartialKeyTimes(map, item, startTime, maxThreadTime, values, baseValue, queued) {
        const keyTimes = item.keyTimes.slice(0);
        const keySplines = item.keySplines ? item.keySplines.slice(0) : new Array(values.length - 1).fill('');
        const completeTime = startTime + item.duration;
        let maxTime = item.getIntervalEndTime(startTime);
        for (let i = 0; i < queued.length; i++) {
            const sub = queued[i];
            if (sub !== item) {
                const totalDuration = sub.getTotalDuration();
                if (totalDuration > maxTime) {
                    const endTime = Math.min(completeTime, totalDuration);
                    const subValues = getStartItemValues(map, item, baseValue);
                    substituteEnd: {
                        for (let j = getStartIteration(maxTime, sub.delay, sub.duration), joined = false;; j++) {
                            const keyTimesA = sub.keyTimes;
                            const lengthA = keyTimesA.length;
                            for (let k = 0; k < lengthA; k++) {
                                const time = getItemTime(sub.delay, sub.duration, keyTimesA, j, k);
                                if (time >= maxTime) {
                                    function insertSubstituteTimeValue(splitTime) {
                                        let splitValue;
                                        if (time === splitTime) {
                                            splitValue = convertToString(getItemValue(sub, subValues, j, k, baseValue));
                                        }
                                        else {
                                            const fraction = (time - splitTime) / sub.duration;
                                            for (let l = 1; l < lengthA; l++) {
                                                if (fraction >= keyTimesA[l - 1] && fraction <= keyTimesA[l]) {
                                                    splitValue = convertToString(getItemSplitValue(fraction, keyTimesA[l - 1], getItemValue(sub, subValues, j, l - 1, baseValue), keyTimesA[l], getItemValue(sub, subValues, j, l, baseValue)));
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
                                                resultTime += 1 / 1000;
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
                    if (totalDuration === endTime && totalDuration <= maxThreadTime) {
                        sub.addState(16 /* COMPLETE */);
                        queued.splice(i--, 1);
                    }
                    if (endTime === completeTime) {
                        break;
                    }
                }
                else if (maxThreadTime !== Number.POSITIVE_INFINITY && totalDuration < maxThreadTime) {
                    queued.splice(i--, 1);
                }
            }
        }
        return [keyTimes, values, keySplines];
    }
    function setTimelineValue(map, time, value, duplicate = false) {
        if (value !== '') {
            let stored = map.get(time);
            let previousTime = false;
            if (stored === undefined) {
                stored = map.get(time - 1);
                previousTime = true;
            }
            if (stored !== value || duplicate) {
                if (!duplicate) {
                    if (typeof stored === 'number' && $math$2.isEqual(value, stored)) {
                        return time;
                    }
                    while (time > 0 && map.has(time)) {
                        time++;
                    }
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
        if (!isKeyTimeFormat(SvgBuild.isAnimateTransform(item), keyTimeMode)) {
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
    function getStartItemValues(map, item, baseValue) {
        if (item.evaluateStart) {
            const index = item.reverse ? item.length - 1 : 0;
            const value = map.get(SvgAnimationIntervalMap.getKeyName(item), item.delay) || item.values[index] || !item.additiveSum && item.baseValue;
            if (!value) {
                item.values[index] = convertToString(baseValue);
            }
            if (item.by && $util$6.isNumber(item.values[index])) {
                item.values[index] = (parseFloat(item.values[index]) + item.by).toString();
            }
            item.evaluateStart = false;
        }
        return item.values;
    }
    function setTransformOrigin(map, item, time, index) {
        if (SvgBuild.asAnimateTransform(item) && item.transformOrigin && item.transformOrigin[index]) {
            map.set(time, item.transformOrigin[index]);
        }
    }
    function checkPartialKeyTimes(keyTimes, values, keySplines, baseValue) {
        if (keyTimes[keyTimes.length - 1] < 1) {
            keyTimes.push(1);
            values.push(baseValue !== undefined ? convertToString(baseValue) : values[0]);
            if (keySplines) {
                keySplines.push('');
            }
        }
    }
    const getItemTime = (delay, duration, keyTimes, iteration, index) => Math.round(delay + (keyTimes[index] + iteration) * duration);
    const getEllipsePoints = (values) => [{ x: values[0], y: values[1], rx: values[2], ry: values[values.length - 1] }];
    const convertToString = (value) => Array.isArray(value) ? $util$6.objectMap(value, pt => `${pt.x},${pt.y}`).join(' ') : value.toString();
    const isKeyTimeFormat = (transforming, keyTimeMode) => $util$6.hasBit(keyTimeMode, transforming ? 32 /* KEYTIME_TRANSFORM */ : 4 /* KEYTIME_ANIMATE */);
    const isFromToFormat = (transforming, keyTimeMode) => $util$6.hasBit(keyTimeMode, transforming ? 16 /* FROMTO_TRANSFORM */ : 2 /* FROMTO_ANIMATE */);
    const playableAnimation = (item) => item.playable || item.animationElement && item.duration !== -1;
    const cloneKeyTimes = (item) => [item.keyTimes.slice(0), item.values.slice(0), item.keySplines ? item.keySplines.slice(0) : undefined];
    const getStartIteration = (time, delay, duration) => Math.floor(Math.max(0, time - delay) / duration);
    var SvgSynchronize$MX = (Base) => {
        return class extends Base {
            getAnimateShape(element) {
                const result = [];
                for (const item of this.animations) {
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
            getAnimateTransform(options) {
                const result = [];
                for (const item of this.animations) {
                    if (SvgBuild.isAnimateTransform(item)) {
                        if (item.duration > 0) {
                            result.push(item);
                            if (options && SvgBuild.asAnimateMotion(item)) {
                                item.framesPerSecond = options.framesPerSecond;
                            }
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
            animateSequentially(animations, transforms, path, options) {
                let keyTimeMode = 2 /* FROMTO_ANIMATE */ | 16 /* FROMTO_TRANSFORM */;
                let precision;
                if (options) {
                    if (options.keyTimeMode) {
                        keyTimeMode = options.keyTimeMode;
                    }
                    precision = options.precision;
                }
                [animations, transforms].forEach(mergeable => {
                    const transforming = mergeable === transforms;
                    if (!mergeable || mergeable.length === 0 || !transforming && $util$6.hasBit(keyTimeMode, 8 /* IGNORE_ANIMATE */) || transforming && $util$6.hasBit(keyTimeMode, 64 /* IGNORE_TRANSFORM */)) {
                        return;
                    }
                    const staggered = [];
                    const setterAttributeMap = {};
                    const groupActive = new Set();
                    let setterTotal = 0;
                    function insertSetter(item) {
                        if (setterAttributeMap[item.attributeName] === undefined) {
                            setterAttributeMap[item.attributeName] = [];
                        }
                        setterAttributeMap[item.attributeName].push(item);
                        setterTotal++;
                    }
                    {
                        const excluded = [];
                        const length = mergeable.length;
                        for (let i = 0; i < length; i++) {
                            const itemA = mergeable[i];
                            if (itemA.setterType) {
                                insertSetter(itemA);
                            }
                            else {
                                const timeA = itemA.getTotalDuration();
                                for (let j = 0; j < length; j++) {
                                    const itemB = mergeable[j];
                                    if (i !== j && itemA.attributeName === itemB.attributeName && itemA.group.id < itemB.group.id && itemA.fillReplace && !itemB.partialType) {
                                        if (itemB.setterType) {
                                            if (itemA.delay === itemB.delay) {
                                                excluded[i] = itemA;
                                                break;
                                            }
                                        }
                                        else {
                                            const timeB = itemB.getTotalDuration();
                                            if (itemA.delay === itemB.delay && (!itemB.fillReplace || timeA <= timeB || itemB.iterationCount === -1) ||
                                                itemB.fillBackwards && itemA.delay <= itemB.delay && (itemB.fillForwards || itemA.fillReplace && timeA <= itemB.delay) ||
                                                itemA.animationElement && itemB.animationElement === null && (itemA.delay >= itemB.delay && timeA <= timeB || itemB.fillForwards)) {
                                                excluded[i] = itemA;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        const removeable = [];
                        for (let i = 0; i < length; i++) {
                            const item = mergeable[i];
                            if (excluded[i]) {
                                if (!item.fillReplace) {
                                    item.setterType = true;
                                    insertSetter(item);
                                }
                                else {
                                    removeable.push(item);
                                }
                            }
                            else if (!item.setterType) {
                                staggered.push(item);
                                groupActive.add(item.group.name);
                            }
                        }
                        this._removeAnimations(removeable);
                    }
                    if (staggered.length + setterTotal > 1 || staggered.length === 1 && (staggered[0].alternate || staggered[0].end !== undefined)) {
                        for (const item of staggered) {
                            if (item.group.ordering) {
                                $util$6.spliceArray(item.group.ordering, sibling => !groupActive.has(sibling.name));
                            }
                        }
                        const groupName = {};
                        const groupAttributeMap = {};
                        let repeatingDuration = 0;
                        for (const item of staggered) {
                            const attr = item.attributeName;
                            if (groupName[attr] === undefined) {
                                groupName[attr] = new Map();
                                groupAttributeMap[attr] = [];
                            }
                            const group = groupName[attr].get(item.delay) || [];
                            group.push(item);
                            groupAttributeMap[attr].push(item);
                            groupName[attr].set(item.delay, group);
                        }
                        for (const attr in groupName) {
                            const groupDelay = new Map();
                            for (const delay of $util$6.sortNumber(Array.from(groupName[attr].keys()))) {
                                const group = groupName[attr].get(delay);
                                for (const item of group) {
                                    repeatingDuration = Math.max(repeatingDuration, item.getTotalDuration(true));
                                }
                                group.reverse();
                                groupDelay.set(delay, group);
                            }
                            groupName[attr] = groupDelay;
                            groupAttributeMap[attr].reverse();
                        }
                        const intervalMap = new SvgAnimationIntervalMap(mergeable);
                        const repeatingMap = {};
                        const repeatingInterpolatorMap = new Map();
                        const repeatingTransformOriginMap = transforming ? new Map() : undefined;
                        const repeatingMaxTime = {};
                        const repeatingAnimations = new Set();
                        const infiniteMap = {};
                        const infiniteInterpolatorMap = new Map();
                        const infiniteTransformOriginMap = transforming ? new Map() : undefined;
                        const baseValueMap = {};
                        const forwardMap = {};
                        const animateTimeRangeMap = new Map();
                        let repeatingAsInfinite = -1;
                        let repeatingResult;
                        let infiniteResult;
                        const getForwardItem = (attr) => forwardMap[attr] && forwardMap[attr][forwardMap[attr].length - 1];
                        for (const attr in groupName) {
                            repeatingMap[attr] = new Map();
                            if (!transforming) {
                                let value;
                                try {
                                    value = (path || this)['getBaseValue'](attr);
                                }
                                catch (_a) {
                                }
                                if ($util$6.hasValue(value)) {
                                    baseValueMap[attr] = value;
                                }
                            }
                            const setterData = setterAttributeMap[attr] || [];
                            const groupDelay = [];
                            const groupData = [];
                            for (const [delay, data] of groupName[attr].entries()) {
                                groupDelay.push(delay);
                                groupData.push(data);
                            }
                            const incomplete = [];
                            let maxTime = -1;
                            let actualMaxTime = 0;
                            let nextDelayTime = Number.POSITIVE_INFINITY;
                            let baseValue;
                            let previousTransform;
                            let previousComplete;
                            function checkComplete(item, nextDelay) {
                                repeatingAnimations.add(item);
                                item.addState(16 /* COMPLETE */);
                                previousComplete = item;
                                if (item.fillForwards) {
                                    setFreezeValue(actualMaxTime, baseValue, item.type, item);
                                    if (item.group.ordering) {
                                        const duration = item.getTotalDuration();
                                        for (const previous of item.group.ordering) {
                                            if (previous.name === item.group.name) {
                                                return true;
                                            }
                                            else if (SvgAnimationIntervalMap.getGroupEndTime(previous) >= duration) {
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
                                                setTimeRange(animateTimeRangeMap, item.type, currentMaxTime);
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
                                const item = getForwardItem(attr);
                                let replaceValue = item && item.value;
                                $util$6.spliceArray(setterData, set => set.delay >= delayTime && set.delay < endTime, (set) => {
                                    if (set.animationElement) {
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
                                    $util$6.spliceArray(incomplete, previous => previous.getTotalDuration() <= actualMaxTime, previous => {
                                        previous.addState(16 /* COMPLETE */);
                                        if (previous.fillForwards) {
                                            setFreezeValue(previous.getTotalDuration(), previous.valueTo, previous.type, previous);
                                            if (delayIndex !== undefined && itemIndex !== undefined) {
                                                const lengthA = groupDelay.length;
                                                for (let i = delayIndex; i < lengthA; i++) {
                                                    if (i !== delayIndex) {
                                                        itemIndex = -1;
                                                    }
                                                    const data = groupData[i];
                                                    const lengthB = data.length;
                                                    for (let j = itemIndex + 1; j < lengthB; j++) {
                                                        const next = data[j];
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
                                    const index = incomplete.indexOf(item);
                                    if (index !== -1) {
                                        incomplete.splice(index, 1);
                                    }
                                    incomplete.push(item);
                                }
                            }
                            function sortIncomplete() {
                                incomplete.sort((a, b) => {
                                    if (a.animationElement && b.animationElement && a.delay !== b.delay) {
                                        return a.delay < b.delay ? 1 : -1;
                                    }
                                    return a.group.id < b.group.id ? 1 : -1;
                                });
                            }
                            function removeIncomplete(item) {
                                if (item) {
                                    if (item.iterationCount !== -1) {
                                        $util$6.spliceArray(incomplete, previous => previous === item);
                                    }
                                }
                                else {
                                    $util$6.spliceArray(incomplete, previous => previous.animationElement !== null);
                                }
                            }
                            function setFreezeValue(time, value, type = 0, item) {
                                if (!transforming) {
                                    value = convertToAnimateValue(value);
                                }
                                const forwardItem = getForwardItem(attr);
                                if (value !== '' && (forwardItem === undefined || time >= forwardItem.time)) {
                                    if (forwardMap[attr] === undefined) {
                                        forwardMap[attr] = [];
                                    }
                                    forwardMap[attr].push({
                                        key: type,
                                        value,
                                        time
                                    });
                                }
                                if (item && SvgBuild.isAnimate(item) && !item.fillReplace) {
                                    if (item.fillForwards) {
                                        $util$6.spliceArray(setterData, set => set.group.id < item.group.id || set.delay < time);
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
                                        setTimeRange(animateTimeRangeMap, previousTransform.type, maxTime);
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
                            const backwards = groupAttributeMap[attr].find(item => item.fillBackwards);
                            if (backwards) {
                                baseValue = getItemValue(backwards, backwards.values, 0, 0);
                                maxTime = setTimelineValue(repeatingMap[attr], 0, baseValue);
                                if (transforming) {
                                    setTimeRange(animateTimeRangeMap, backwards.type, 0);
                                    previousTransform = backwards;
                                }
                                let playing = true;
                                for (const item of groupAttributeMap[attr]) {
                                    if (item.group.id > backwards.group.id && item.delay <= backwards.delay) {
                                        playing = false;
                                        break;
                                    }
                                }
                                const totalDuration = backwards.getTotalDuration();
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
                                            else if (item.group.id < backwards.group.id && (backwards.fillForwards || item.getTotalDuration() <= totalDuration)) {
                                                if (item.fillForwards) {
                                                    item.setterType = true;
                                                    setterData.push(item);
                                                }
                                                removeable.push(item);
                                                continue;
                                            }
                                        }
                                        if (item.animationElement && item.delay <= backwards.delay) {
                                            groupData[i].splice(j--, 1);
                                            queueIncomplete(item);
                                        }
                                    }
                                }
                                removeInvalid(removeable);
                                backwards.addState(2 /* BACKWARDS */);
                            }
                            if (!transforming) {
                                if (forwardMap[attr] === undefined && baseValueMap[attr] !== undefined) {
                                    setFreezeValue(0, baseValueMap[attr], 0);
                                }
                                if (baseValue === undefined) {
                                    const item = getForwardItem(attr);
                                    baseValue = item && item.value || baseValueMap[attr];
                                }
                            }
                            sortSetterData();
                            {
                                let previous;
                                $util$6.spliceArray(setterData, set => set.delay <= groupDelay[0], set => {
                                    const fillForwards = SvgBuild.isAnimate(set) && set.fillForwards;
                                    if (set.delay < groupDelay[0] && (backwards === undefined || fillForwards)) {
                                        if (backwards && fillForwards) {
                                            setFreezeValue(set.delay, set.to, set.type);
                                        }
                                        else {
                                            const previousTime = set.delay - 1;
                                            if (previous === undefined) {
                                                if (!repeatingMap[attr].has(0)) {
                                                    let value;
                                                    if (transforming && SvgBuild.isAnimateTransform(set)) {
                                                        value = TRANSFORM.typeAsValue(set.type);
                                                    }
                                                    else {
                                                        value = baseValueMap[attr];
                                                    }
                                                    if (value !== undefined) {
                                                        setSetterValue(set, 0, value);
                                                        setSetterValue(set, previousTime, value);
                                                    }
                                                }
                                                else if (!transforming) {
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
                                const lengthA = groupDelay.length;
                                for (let i = 0; i < lengthA; i++) {
                                    const dataA = groupData[i];
                                    let delay = groupDelay[i];
                                    for (let j = 0; j < dataA.length; j++) {
                                        const item = dataA[j];
                                        if (item.hasState(16 /* COMPLETE */, 64 /* INVALID */)) {
                                            continue;
                                        }
                                        const infinite = item.iterationCount === -1;
                                        const duration = item.duration;
                                        const iterationCount = item.iterationCount;
                                        let totalDuration;
                                        if (!infinite) {
                                            totalDuration = item.getTotalDuration();
                                            if (totalDuration <= maxTime) {
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
                                            totalDuration = delay + duration;
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
                                        nextDelayTime = Number.POSITIVE_INFINITY;
                                        const ordering = item.group.ordering;
                                        if (ordering && ordering.length > 1) {
                                            let checkDelay = true;
                                            for (const order of ordering) {
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
                                                    for (let k = i + 1; k < lengthA; k++) {
                                                        const dataB = groupData[k];
                                                        const lengthB = dataB.length;
                                                        for (let l = 0; l < lengthB; l++) {
                                                            const next = dataB[l];
                                                            if (next.group.ordering) {
                                                                nextDelayTime = next.delay;
                                                                break nextDelay;
                                                            }
                                                            else {
                                                                if (next.getTotalDuration() <= totalDuration) {
                                                                    if (next.fillFreeze) {
                                                                        sortSetterData(next);
                                                                    }
                                                                    next.addState(16 /* COMPLETE */);
                                                                }
                                                                else if (next.delay < totalDuration) {
                                                                    queueIncomplete(next);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        else {
                                            for (let k = i + 1; k < lengthA; k++) {
                                                if (groupDelay[k] !== Number.POSITIVE_INFINITY && groupData[k].length && !groupData[k].every(next => next.hasState(16 /* COMPLETE */, 64 /* INVALID */))) {
                                                    nextDelayTime = groupDelay[k];
                                                    break;
                                                }
                                            }
                                        }
                                        const actualStartTime = actualMaxTime;
                                        let startTime = maxTime + 1;
                                        let maxThreadTime = Math.min(nextDelayTime, item.end || Number.POSITIVE_INFINITY);
                                        let setterInterrupt;
                                        if (setterData.length && item.animationElement) {
                                            const interruptTime = Math.min(nextDelayTime, totalDuration, maxThreadTime);
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
                                                $util$6.spliceArray(setterData, set => set !== setterInterrupt);
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
                                            let parallel = delay === Number.POSITIVE_INFINITY || (maxTime !== -1 || item.hasState(2 /* BACKWARDS */)) && !(i === 0 && j === 0);
                                            complete = true;
                                            threadTimeExceeded: {
                                                const forwardItem = getForwardItem(attr);
                                                for (let k = getStartIteration(actualMaxTime, delay, duration); k < iterationTotal; k++) {
                                                    let keyTimes;
                                                    let values = getStartItemValues(intervalMap, item, baseValue);
                                                    let keySplines;
                                                    if (item.partialType) {
                                                        if (item.getIntervalEndTime(actualMaxTime) < maxThreadTime && (incomplete.length || j < groupData[i].length - 1)) {
                                                            for (let l = j + 1; l < dataA.length; l++) {
                                                                queueIncomplete(dataA[l]);
                                                            }
                                                            dataA.length = 0;
                                                            sortIncomplete();
                                                            [keyTimes, values, keySplines] = appendPartialKeyTimes(intervalMap, item, actualMaxTime, maxThreadTime, values, baseValue, incomplete);
                                                        }
                                                        else {
                                                            [keyTimes, values, keySplines] = cloneKeyTimes(item);
                                                        }
                                                        checkPartialKeyTimes(keyTimes, values, keySplines, baseValueMap[attr]);
                                                    }
                                                    else {
                                                        keyTimes = item.keyTimes;
                                                        keySplines = item.keySplines;
                                                    }
                                                    const lengthB = keyTimes.length;
                                                    for (let l = 0; l < lengthB; l++) {
                                                        const keyTime = keyTimes[l];
                                                        let time = -1;
                                                        let value = getItemValue(item, values, k, l, baseValue);
                                                        if (k === iterationTotal - 1 && iterationFraction > 0) {
                                                            if (iterationFraction === keyTime) {
                                                                iterationFraction = -1;
                                                            }
                                                            else if (l === lengthB - 1) {
                                                                time = totalDuration;
                                                                actualMaxTime = time;
                                                                value = getItemSplitValue(iterationFraction, keyTimes[l - 1], getItemValue(item, values, k, l - 1, baseValue), keyTime, value);
                                                                iterationFraction = -1;
                                                            }
                                                            else if (iterationFraction > keyTime) {
                                                                for (let m = l + 1; m < lengthB; m++) {
                                                                    if (iterationFraction <= keyTimes[m]) {
                                                                        time = totalDuration;
                                                                        actualMaxTime = time;
                                                                        value = getItemSplitValue(iterationFraction, keyTime, value, keyTimes[m], getItemValue(item, values, k, m, baseValue));
                                                                        iterationFraction = -1;
                                                                        break;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        if (time === -1) {
                                                            time = getItemTime(delay, duration, keyTimes, k, l);
                                                            if (time < 0 || time < maxTime) {
                                                                continue;
                                                            }
                                                            if (time === maxThreadTime) {
                                                                complete = k === iterationTotal - 1 && l === lengthB - 1;
                                                                actualMaxTime = time;
                                                            }
                                                            else {
                                                                function insertIntermediateValue(splitTime) {
                                                                    [maxTime, lastValue] = insertSplitValue(item, actualMaxTime, baseValue, keyTimes, values, keySplines, delay, k, l, splitTime, keyTimeMode, repeatingMap[attr], repeatingInterpolatorMap, repeatingTransformOriginMap);
                                                                }
                                                                if (delay < 0 && maxTime === -1) {
                                                                    if (time > 0) {
                                                                        actualMaxTime = 0;
                                                                        insertIntermediateValue(0);
                                                                    }
                                                                }
                                                                else {
                                                                    if (time > maxThreadTime) {
                                                                        if (parallel && maxTime + 1 < maxThreadTime) {
                                                                            insertIntermediateValue(maxTime);
                                                                        }
                                                                        actualMaxTime = maxThreadTime;
                                                                        insertIntermediateValue(maxThreadTime + (maxThreadTime === nextDelayTime && !repeatingMap[attr].has(maxThreadTime - 1) ? -1 : 0));
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
                                                                                insertIntermediateValue(maxTime);
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
                                                            if (l === length - 1 && !item.accumulateSum && (k < iterationTotal - 1 || item.fillReplace && (forwardItem === undefined || value !== forwardItem.value))) {
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
                                                setTimeRange(animateTimeRangeMap, item.type, startTime, maxTime);
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
                                                setTimeRange(animateTimeRangeMap, maxTime, setterInterrupt.type);
                                            }
                                            removeIncomplete();
                                            complete = true;
                                        }
                                        $util$6.spliceArray(setterData, set => set.delay >= actualStartTime && set.delay <= actualMaxTime, (set) => {
                                            setFreezeValue(set.delay, set.to, set.type, set);
                                            if (set.animationElement) {
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
                                            if (!infinite && checkComplete(item, nextDelayTime)) {
                                                break attributeEnd;
                                            }
                                            for (let k = i; k < lengthA; k++) {
                                                if (groupDelay[k] < actualMaxTime) {
                                                    const dataB = groupData[k];
                                                    for (let l = 0; l < dataB.length; l++) {
                                                        const next = dataB[l];
                                                        const nextDuration = next.getTotalDuration();
                                                        if (nextDuration > actualMaxTime && !next.hasState(4 /* INTERRUPTED */, 16 /* COMPLETE */, 64 /* INVALID */)) {
                                                            queueIncomplete(next);
                                                        }
                                                        else if (!next.fillReplace) {
                                                            setFreezeValue(nextDuration, next.valueTo, next.type, next);
                                                        }
                                                    }
                                                    groupDelay[k] = Number.POSITIVE_INFINITY;
                                                    dataB.length = 0;
                                                }
                                            }
                                            if (incomplete.length && actualMaxTime < nextDelayTime) {
                                                sortIncomplete();
                                                const resume = incomplete.find(next => next.delay <= actualMaxTime);
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
                                    while (incomplete.length) {
                                        const item = incomplete.shift();
                                        const delay = item.delay;
                                        const duration = item.duration;
                                        const durationTotal = maxTime - delay;
                                        let maxThreadTime = Number.POSITIVE_INFINITY;
                                        function insertKeyTimes() {
                                            let keyTimes;
                                            let values = getStartItemValues(intervalMap, item, baseValue);
                                            let keySplines;
                                            if (item.partialType) {
                                                if (item.getIntervalEndTime(actualMaxTime) < maxThreadTime && incomplete.length) {
                                                    [keyTimes, values, keySplines] = appendPartialKeyTimes(intervalMap, item, actualMaxTime, maxThreadTime, values, baseValue, incomplete);
                                                }
                                                else {
                                                    [keyTimes, values, keySplines] = cloneKeyTimes(item);
                                                }
                                                checkPartialKeyTimes(keyTimes, values, keySplines, baseValueMap[attr]);
                                            }
                                            else {
                                                keyTimes = item.keyTimes;
                                                keySplines = item.keySplines;
                                            }
                                            const startTime = maxTime + 1;
                                            let j = Math.floor(durationTotal / duration);
                                            let joined = false;
                                            const insertIntermediateValue = (time, index) => insertSplitValue(item, actualMaxTime, baseValue, keyTimes, values, keySplines, delay, j, index, time, keyTimeMode, repeatingMap[attr], repeatingInterpolatorMap, repeatingTransformOriginMap);
                                            do {
                                                const lengthC = keyTimes.length;
                                                for (let k = 0; k < lengthC; k++) {
                                                    let time = getItemTime(delay, duration, keyTimes, j, k);
                                                    if (!joined && time >= maxTime) {
                                                        [maxTime, baseValue] = insertIntermediateValue(maxTime, k);
                                                        joined = true;
                                                    }
                                                    if (joined) {
                                                        if (time >= maxThreadTime) {
                                                            if (maxThreadTime > maxTime) {
                                                                const fillReplace = item.fillReplace || item.iterationCount === -1;
                                                                [maxTime, baseValue] = insertIntermediateValue(maxThreadTime - (fillReplace ? 1 : 0), k);
                                                                if (fillReplace) {
                                                                    baseValue = getItemValue(item, values, j, 0, baseValue);
                                                                    maxTime = setTimelineValue(repeatingMap[attr], maxThreadTime, baseValue);
                                                                }
                                                                actualMaxTime = maxThreadTime;
                                                            }
                                                        }
                                                        else if (time > maxTime) {
                                                            actualMaxTime = time;
                                                            if (k === keyTimes.length - 1 && time < maxThreadTime) {
                                                                time--;
                                                            }
                                                            baseValue = getItemValue(item, values, j, k, baseValue);
                                                            maxTime = setTimelineValue(repeatingMap[attr], time, baseValue);
                                                            insertInterpolator(item, maxTime, keySplines, k, keyTimeMode, repeatingInterpolatorMap, repeatingTransformOriginMap);
                                                        }
                                                    }
                                                }
                                            } while (maxTime < maxThreadTime && ++j);
                                            if (transforming) {
                                                setTimeRange(animateTimeRangeMap, item.type, startTime, maxTime);
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
                                    let key = 0;
                                    let value;
                                    if (forwardMap[attr]) {
                                        const item = getForwardItem(attr);
                                        if (item) {
                                            key = item.key;
                                            value = item.value;
                                        }
                                    }
                                    else {
                                        if (transforming) {
                                            key = Array.from(animateTimeRangeMap.values()).pop();
                                            value = TRANSFORM.typeAsValue(key);
                                        }
                                        else {
                                            value = baseValueMap[attr];
                                        }
                                    }
                                    if (value !== undefined && !$util$6.isEqual(repeatingMap[attr].get(maxTime), value)) {
                                        maxTime = setTimelineValue(repeatingMap[attr], maxTime, value);
                                        if (transforming) {
                                            setTimeRange(animateTimeRangeMap, key, maxTime);
                                        }
                                    }
                                }
                            }
                            repeatingMaxTime[attr] = maxTime;
                        }
                        {
                            const keyTimesRepeating = new Set();
                            let repeatingEndTime = 0;
                            for (const attr in repeatingMap) {
                                let maxTime = 0;
                                for (const time of repeatingMap[attr].keys()) {
                                    keyTimesRepeating.add(time);
                                    maxTime = time;
                                }
                                repeatingEndTime = Math.max(repeatingEndTime, maxTime);
                                if (forwardMap[attr]) {
                                    forwardMap[attr].sort((a, b) => {
                                        if (a.time === b.time) {
                                            return 0;
                                        }
                                        return a.time < b.time ? -1 : 1;
                                    });
                                }
                            }
                            if (Object.keys(infiniteMap).length) {
                                const delay = [];
                                const duration = [];
                                for (const attr in infiniteMap) {
                                    delay.push(infiniteMap[attr].delay);
                                    duration.push(infiniteMap[attr].duration);
                                }
                                if (repeatingAnimations.size === 0 && new Set(delay).size === 1 && new Set(duration).size === 1 && delay[0] === keyTimesRepeating.values().next().value) {
                                    repeatingAsInfinite = delay[0] <= 0 ? 0 : delay[0];
                                }
                                else {
                                    if (duration.length > 1 && duration.every(value => value % 250 === 0)) {
                                        repeatingEndTime = $math$2.nextMultiple(duration, repeatingEndTime, delay);
                                    }
                                    else if ((repeatingEndTime - delay[0]) % duration[0] !== 0) {
                                        repeatingEndTime = duration[0] * Math.ceil(repeatingEndTime / duration[0]);
                                    }
                                }
                            }
                            if (repeatingAsInfinite === -1) {
                                for (const attr in repeatingMap) {
                                    if (infiniteMap[attr]) {
                                        let maxTime = repeatingMaxTime[attr];
                                        if (maxTime < repeatingEndTime) {
                                            const item = infiniteMap[attr];
                                            const delay = item.delay;
                                            const startTime = maxTime + 1;
                                            let baseValue = Array.from(repeatingMap[attr].values()).pop();
                                            let i = Math.floor((maxTime - delay) / item.duration);
                                            const values = getStartItemValues(intervalMap, item, baseValue);
                                            const keyTimesBase = item.keyTimes;
                                            const length = keyTimesBase.length;
                                            do {
                                                let joined = false;
                                                for (let j = 0; j < length; j++) {
                                                    let time = getItemTime(delay, item.duration, keyTimesBase, i, j);
                                                    if (!joined && time >= maxTime) {
                                                        if (!repeatingMap[attr].has(maxTime)) {
                                                            [maxTime, baseValue] = insertSplitValue(item, maxTime, baseValue, keyTimesBase, values, item.keySplines, delay, i, j, maxTime, keyTimeMode, repeatingMap[attr], repeatingInterpolatorMap, repeatingTransformOriginMap);
                                                            keyTimesRepeating.add(maxTime);
                                                        }
                                                        joined = true;
                                                    }
                                                    if (joined && time > maxTime) {
                                                        if (j === length - 1 && time < repeatingEndTime) {
                                                            time--;
                                                        }
                                                        baseValue = getItemValue(item, values, i, j, baseValue);
                                                        maxTime = setTimelineValue(repeatingMap[attr], time, baseValue);
                                                        insertInterpolator(item, time, item.keySplines, j, keyTimeMode, repeatingInterpolatorMap, repeatingTransformOriginMap);
                                                        keyTimesRepeating.add(maxTime);
                                                    }
                                                }
                                            } while (maxTime < repeatingEndTime && ++i);
                                            repeatingMaxTime[attr] = maxTime;
                                            if (transforming) {
                                                setTimeRange(animateTimeRangeMap, item.type, startTime, maxTime);
                                            }
                                        }
                                    }
                                }
                            }
                            const keyTimes = $util$6.sortNumber(Array.from(keyTimesRepeating));
                            if (path || transforming) {
                                let modified = false;
                                for (const attr in repeatingMap) {
                                    if (!repeatingMap[attr].has(0) && baseValueMap[attr] !== undefined) {
                                        const endTime = repeatingMap[attr].keys().next().value - 1;
                                        repeatingMap[attr].set(0, baseValueMap[attr]);
                                        repeatingMap[attr].set(endTime, baseValueMap[attr]);
                                        if (!keyTimes.includes(0)) {
                                            keyTimes.push(0);
                                            modified = true;
                                        }
                                        if (!keyTimes.includes(endTime)) {
                                            keyTimes.push(endTime);
                                            modified = true;
                                        }
                                    }
                                }
                                if (modified) {
                                    $util$6.sortNumber(keyTimes);
                                }
                            }
                            if (!transforming) {
                                for (const attr in repeatingMap) {
                                    for (const keyTime of keyTimes) {
                                        if (keyTime <= repeatingMaxTime[attr]) {
                                            if (!repeatingMap[attr].has(keyTime)) {
                                                if (intervalMap.paused(attr, keyTime)) {
                                                    let value = intervalMap.get(attr, keyTime);
                                                    if (value) {
                                                        value = convertToAnimateValue(value, true);
                                                        if (value !== '') {
                                                            repeatingMap[attr].set(keyTime, value);
                                                            continue;
                                                        }
                                                    }
                                                }
                                                insertAdjacentSplitValue(repeatingMap[attr], attr, keyTime, intervalMap, transforming);
                                            }
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                }
                            }
                            repeatingResult = createKeyTimeMap(repeatingMap, keyTimes, forwardMap);
                        }
                        if (repeatingAsInfinite === -1 && Object.keys(infiniteMap).length) {
                            const timelineMap = {};
                            const infiniteAnimations = [];
                            const keyTimes = [];
                            const duration = [];
                            for (const attr in infiniteMap) {
                                duration.push(infiniteMap[attr].duration);
                                infiniteAnimations.push(infiniteMap[attr]);
                            }
                            const maxDuration = $math$2.nextMultiple(duration);
                            for (const item of infiniteAnimations) {
                                const attr = item.attributeName;
                                timelineMap[attr] = new Map();
                                let baseValue = repeatingMap[attr].has(repeatingMaxTime[attr]) ? repeatingMap[attr].get(repeatingMaxTime[attr]) : baseValueMap[attr];
                                const values = getStartItemValues(intervalMap, item, baseValue);
                                let maxTime = 0;
                                let i = 0;
                                const keyTimesBase = item.keyTimes;
                                const length = keyTimesBase.length;
                                do {
                                    for (let j = 0; j < length; j++) {
                                        let time = getItemTime(0, item.duration, keyTimesBase, i, j);
                                        if (j === keyTimesBase.length - 1 && time < maxDuration) {
                                            time--;
                                        }
                                        baseValue = getItemValue(item, values, i, j, baseValue);
                                        maxTime = setTimelineValue(timelineMap[attr], time, baseValue);
                                        insertInterpolator(item, maxTime, item.keySplines, j, keyTimeMode, infiniteInterpolatorMap, infiniteTransformOriginMap);
                                        if (!keyTimes.includes(maxTime)) {
                                            keyTimes.push(maxTime);
                                        }
                                    }
                                } while (maxTime < maxDuration && ++i);
                            }
                            if (infiniteAnimations.every(item => item.alternate)) {
                                let maxTime = -1;
                                for (const attr in infiniteMap) {
                                    const times = Array.from(timelineMap[attr].keys());
                                    const values = Array.from(timelineMap[attr].values()).reverse();
                                    const length = times.length;
                                    for (let i = 0; i < length; i++) {
                                        if (times[i] !== 0) {
                                            maxTime = maxDuration + times[i];
                                            const interpolator = infiniteInterpolatorMap.get(times[i]);
                                            if (interpolator) {
                                                infiniteInterpolatorMap.set(maxTime, interpolator);
                                            }
                                            maxTime = setTimelineValue(timelineMap[attr], maxTime, values[i]);
                                            if (!keyTimes.includes(maxTime)) {
                                                keyTimes.push(maxTime);
                                            }
                                        }
                                    }
                                }
                            }
                            $util$6.sortNumber(keyTimes);
                            for (const attr in timelineMap) {
                                for (const time of keyTimes) {
                                    if (!timelineMap[attr].has(time)) {
                                        insertAdjacentSplitValue(timelineMap[attr], attr, time, intervalMap, transforming);
                                    }
                                }
                            }
                            infiniteResult = createKeyTimeMap(timelineMap, keyTimes, forwardMap);
                        }
                        if (repeatingResult || infiniteResult) {
                            this._removeAnimations(staggered);
                            const timeRange = Array.from(animateTimeRangeMap.entries());
                            const synchronizedName = $util$6.joinMap(staggered, item => SvgBuild.isAnimateTransform(item) ? TRANSFORM.typeAsName(item.type) : item.attributeName, '-', false);
                            for (const result of [repeatingResult, infiniteResult]) {
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
                                                const lengthA = timeRange.length;
                                                const lengthB = entries.length;
                                                for (let i = 0, j = 0, k = 0; i < lengthA; i++) {
                                                    const next = i < lengthA - 1 ? timeRange[i + 1][1] : -1;
                                                    if (type !== next) {
                                                        const map = new Map();
                                                        for (let l = k; l < lengthB; l++) {
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
                                            const lengthC = transformMap.length;
                                            for (let i = 0; i < lengthC; i++) {
                                                const entries = Array.from(transformMap[i].entries());
                                                let delay = entries[0][0];
                                                if (entries.length === 1) {
                                                    if (i < lengthC - 1) {
                                                        entries.push([transformMap[i + 1].keys().next().value, entries[0][1]]);
                                                    }
                                                    else {
                                                        entries.push([delay + 1, entries[0][1]]);
                                                    }
                                                }
                                                const endTime = entries[entries.length - 1][0];
                                                let duration = endTime - delay;
                                                const animate = new SvgAnimateTransform();
                                                animate.type = entries[0][1].keys().next().value;
                                                const lengthD = entries.length;
                                                for (let j = 0; j < lengthD; j++) {
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
                                                animate.synchronized = { key: i, value: '' };
                                                previousEndTime = endTime;
                                                this._insertAnimate(animate, repeating);
                                            }
                                        }
                                        else {
                                            const entries = Array.from(result.entries());
                                            const delay = repeatingAsInfinite !== -1 ? repeatingAsInfinite : 0;
                                            let object;
                                            for (const item of entries) {
                                                keySplines.push(interpolatorMap.get(item[0]) || '');
                                                item[0] -= delay;
                                            }
                                            if (path) {
                                                const pathData = getPathData(convertToFraction(entries), path, this.parent, forwardMap, precision);
                                                if (pathData) {
                                                    object = new SvgAnimate();
                                                    object.attributeName = 'd';
                                                    for (const item of pathData) {
                                                        object.keyTimes.push(item.key);
                                                        object.values.push(item.value.toString());
                                                    }
                                                }
                                                else {
                                                    return;
                                                }
                                            }
                                            else {
                                                const animate = new SvgAnimateTransform();
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
                                                    const pathData = getPathData([[keyTimeFrom, dataFrom], [keyTimeTo, dataTo]], path, this.parent, forwardMap, precision);
                                                    if (pathData) {
                                                        object = new SvgAnimate();
                                                        object.attributeName = 'd';
                                                        object.values = $util$6.replaceMap(pathData, item => item.value.toString());
                                                    }
                                                    else {
                                                        continue;
                                                    }
                                                }
                                                else {
                                                    const animate = new SvgAnimateTransform();
                                                    animate.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                                                    animate.values = $util$6.objectMap([dataFrom, dataTo], data => {
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
                                            object.synchronized = { key: i, value };
                                            const interpolator = interpolatorMap.get(keyTimeTo);
                                            if (interpolator) {
                                                object.keySplines = [interpolator];
                                            }
                                            this._insertAnimate(object, repeating);
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            }
            _removeAnimations(values) {
                if (values.length) {
                    $util$6.spliceArray(this.animations, (item) => values.includes(item));
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
        };
    };

    const { css: $css$4, dom: $dom$6, math: $math$3, util: $util$7 } = squared.lib;
    class SvgAnimateMotion extends SvgAnimateTransform {
        constructor(element, animationElement) {
            super(element, animationElement);
            this.path = '';
            this.distance = '0%';
            this.rotate = 'auto 0deg';
            this.motionPathElement = null;
            this.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
            this._offsetLength = 0;
            if (animationElement) {
                this.setAttribute('path');
                const rotate = $dom$6.getNamedItem(animationElement, 'rotate');
                switch (rotate) {
                    case 'auto':
                        break;
                    case 'auto-reverse':
                        this.rotate = 'auto 180deg';
                        break;
                    default:
                        if ($util$7.isNumber(rotate)) {
                            this.rotate = `${$util$7.convertFloat(rotate)}deg`;
                        }
                        break;
                }
                const children = animationElement.children;
                const length = children.length;
                for (let i = 0; i < length; i++) {
                    const item = children[i];
                    if (item.tagName === 'mpath') {
                        let target = getTargetElement(item);
                        if (target) {
                            if (SVG.use(target)) {
                                target = getTargetElement(target);
                            }
                            if (target && SVG.shape(target)) {
                                this.motionPathElement = target;
                                break;
                            }
                        }
                    }
                }
                this.setCalcMode();
            }
            else if (element) {
                const path = /path\("([^"]+)"\)/.exec(getAttribute(element, 'offset-path'));
                if (path) {
                    this.path = path[1];
                }
                const distance = getAttribute(element, 'offset-distance', false);
                if (distance !== '') {
                    this.distance = distance;
                }
                const rotate = getAttribute(element, 'offset-rotate', false);
                if (rotate !== '' && rotate !== 'auto') {
                    this.rotate = rotate;
                }
            }
        }
        setCalcMode() {
            if (this.animationElement) {
                const mode = $dom$6.getNamedItem(this.animationElement, 'calcMode') || 'paced';
                switch (mode) {
                    case 'paced':
                    case 'discrete':
                    case 'spline':
                        super.setCalcMode('translate', mode);
                        break;
                    case 'linear':
                        const keyPoints = SvgAnimateTransform.toFractionList($dom$6.getNamedItem(this.animationElement, 'keyPoints'), ';', false);
                        let keyTimes = super.keyTimes;
                        if (keyTimes.length === 0 && this.duration !== -1) {
                            keyTimes = SvgAnimateTransform.toFractionList($dom$6.getNamedItem(this.animationElement, 'keyTimes'));
                            this.length = 0;
                            super.keyTimes = keyTimes;
                        }
                        if (keyPoints.length === keyTimes.length) {
                            this._keyPoints = keyPoints;
                        }
                        break;
                }
            }
        }
        addKeyPoint(item) {
            if (this._offsetPath === undefined) {
                const key = item.key;
                if (key >= 0 && key <= 1) {
                    const keyTimes = super.keyTimes;
                    const keyPoints = this.keyPoints;
                    if (keyTimes.length === keyPoints.length) {
                        const value = item.value;
                        let distance = NaN;
                        if ($css$4.isPercent(value)) {
                            distance = parseFloat(value) / 100;
                        }
                        else if ($util$7.isNumber(value)) {
                            distance = parseFloat(value) / this.offsetLength;
                        }
                        if (!isNaN(distance)) {
                            if (distance > 1) {
                                distance = 1;
                            }
                            const index = keyTimes.findIndex(previous => previous === key);
                            if (index !== -1) {
                                keyTimes[index] = item.key;
                                keyPoints[index] = distance;
                            }
                            else {
                                keyTimes.push(item.key);
                                keyPoints.push(distance);
                            }
                        }
                    }
                }
            }
        }
        setOffsetPath() {
            if (this._offsetPath === undefined && this.path) {
                const rotateData = this.rotateData;
                let offsetPath = SvgBuild.getOffsetPath(this.path, rotateData && this.rotate);
                let distance = offsetPath.length;
                if (distance > 0) {
                    const duration = this.duration;
                    let increment = NaN;
                    if (duration >= distance) {
                        increment = duration / distance;
                        for (let i = 1; i < distance - 1; i++) {
                            offsetPath[i].key *= increment;
                        }
                        offsetPath[distance - 1].key = duration;
                    }
                    else if (duration > 0) {
                        const result = new Array(duration);
                        const j = distance / duration;
                        for (let i = 0; i < duration; i++) {
                            const index = Math.floor(i * j);
                            offsetPath[index].key = i;
                            result[i] = offsetPath[index];
                        }
                        const end = offsetPath.pop();
                        if (result[result.length - 1].value !== end.value) {
                            end.key = duration;
                            result.push(end);
                        }
                        offsetPath = result;
                        distance = result.length;
                    }
                    const keyPoints = this.keyPoints;
                    const fps = this.framesPerSecond ? 1000 / this.framesPerSecond : 0;
                    if (keyPoints.length) {
                        const length = distance - 1;
                        const keyTimes = super.keyTimes;
                        const result = [];
                        if (keyPoints.length > 1) {
                            let previous;
                            const isEqual = (time, point, rotate) => !!previous && previous.key === time && rotate === previous.rotate && $util$7.isEqual(previous.value, point);
                            const lengthA = keyTimes.length;
                            for (let i = 0; i < lengthA - 1; i++) {
                                const baseTime = $math$3.truncateFraction(keyTimes[i] * duration);
                                const offsetDuration = $math$3.truncateFraction((keyTimes[i + 1] - keyTimes[i]) * duration);
                                const from = keyPoints[i];
                                const to = keyPoints[i + 1];
                                if (offsetDuration === 0) {
                                    const key = baseTime;
                                    const { value, rotate } = offsetPath[Math.floor(to * length)];
                                    if (isEqual(key, value, rotate)) {
                                        continue;
                                    }
                                    previous = {
                                        key,
                                        value,
                                        rotate
                                    };
                                    result.push(previous);
                                }
                                else {
                                    let j = 0;
                                    let nextFrame = baseTime;
                                    if (from === to) {
                                        const { value, rotate } = offsetPath[Math.floor(from * length)];
                                        const offsetInterval = !isNaN(increment) ? increment : 1;
                                        if (isEqual(baseTime, value, rotate)) {
                                            j += offsetInterval;
                                            nextFrame += fps;
                                        }
                                        for (; j < offsetDuration; j += offsetInterval) {
                                            const key = baseTime + j;
                                            if (key >= nextFrame) {
                                                result.push({
                                                    key,
                                                    value,
                                                    rotate
                                                });
                                                if (j < offsetDuration - 1) {
                                                    nextFrame += fps;
                                                }
                                                else {
                                                    nextFrame = 0;
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        const minTime = Math.floor(Math.min(from, to) * length);
                                        const maxTime = Math.floor(Math.max(from, to) * length);
                                        const partial = [];
                                        for (let k = minTime; k <= maxTime; k++) {
                                            partial.push(Object.assign({}, offsetPath[k]));
                                        }
                                        if (from > to) {
                                            partial.reverse();
                                        }
                                        const lengthB = partial.length;
                                        const offsetInterval = offsetDuration / lengthB;
                                        if (isEqual(baseTime, partial[0].value, partial[0].rotate)) {
                                            j++;
                                            nextFrame += fps;
                                        }
                                        for (; j < lengthB; j++) {
                                            const key = baseTime + (j * offsetInterval);
                                            if (key >= nextFrame) {
                                                partial[j].key = key;
                                                result.push(partial[j]);
                                                if (j < lengthB - 1) {
                                                    nextFrame += fps;
                                                }
                                                else {
                                                    nextFrame = 0;
                                                }
                                            }
                                        }
                                    }
                                    result[result.length - 1].key = baseTime + offsetDuration;
                                }
                            }
                        }
                        else {
                            result.push(Object.assign({}, offsetPath[Math.floor(keyPoints[0] * length)]));
                            if (keyTimes[0] === 0) {
                                result[0].rotate = 0;
                            }
                        }
                        this._offsetPath = result;
                    }
                    else if (fps > 0) {
                        const result = [];
                        for (let i = 0; i < distance; i += fps) {
                            result.push(offsetPath[Math.floor(i)]);
                        }
                        const end = offsetPath.pop();
                        if (end !== result[result.length - 1]) {
                            result.push(end);
                        }
                        this._offsetPath = result;
                    }
                    else {
                        this._offsetPath = offsetPath;
                    }
                    if (rotateData) {
                        offsetPath = this._offsetPath;
                        for (let i = 0, j = 0; i < rotateData.length - 1; i++) {
                            const from = rotateData[i];
                            const to = rotateData[i + 1];
                            const timeRange = [];
                            if (from.key === to.key) {
                                timeRange.push(offsetPath[j++]);
                            }
                            else {
                                const maxTime = Math.floor($math$3.truncateFraction(to.key * duration));
                                for (;; j++) {
                                    const item = offsetPath[j];
                                    if (item && item.key <= maxTime) {
                                        timeRange.push(item);
                                    }
                                    else {
                                        break;
                                    }
                                }
                            }
                            const angleFrom = $css$4.parseAngle(from.value.split(' ').pop());
                            const angleTo = $css$4.parseAngle(to.value.split(' ').pop());
                            if (from.value === to.value || angleFrom === angleTo) {
                                if (from.value.startsWith('auto')) {
                                    if (angleFrom !== 0) {
                                        for (const item of timeRange) {
                                            item.rotate += angleFrom;
                                        }
                                    }
                                }
                                else {
                                    for (const item of timeRange) {
                                        item.rotate = angleFrom;
                                    }
                                }
                            }
                            else {
                                const offset = angleTo - angleFrom;
                                const length = timeRange.length;
                                const l = offset / length;
                                if (from.value.startsWith('auto')) {
                                    for (let k = 0; k < length - 1; k++) {
                                        timeRange[k].rotate += angleFrom + (k * l);
                                    }
                                    timeRange[length - 1].rotate += angleFrom + offset;
                                }
                                else {
                                    for (let k = 0; k < length - 1; k++) {
                                        timeRange[k].rotate = angleFrom + (k * l);
                                    }
                                    timeRange[length - 1].rotate = angleFrom + offset;
                                }
                            }
                        }
                    }
                    this.keySplines = undefined;
                    this.timingFunction = KEYSPLINE_NAME.linear;
                }
            }
        }
        reverseKeyPoints() {
            let keyTimes;
            let keyPoints;
            if (this.validKeyPoints()) {
                keyPoints = this._keyPoints.slice(0);
                keyPoints.reverse();
                keyTimes = [];
                for (const keyTime of super.keyTimes) {
                    keyTimes.push(1 - keyTime);
                }
                keyTimes.reverse();
            }
            return { keyTimes, keyPoints };
        }
        validKeyPoints() {
            return !!this._keyPoints && this._keyPoints.length > 0 && this._keyPoints.length === super.keyTimes.length;
        }
        get offsetPath() {
            return this._offsetPath;
        }
        get playable() {
            return !this.paused && this.duration !== -1 && $util$7.isString(this.path);
        }
        set keyTimes(value) {
            if (!this.path) {
                super.keyTimes = value;
            }
        }
        get keyTimes() {
            this.setOffsetPath();
            if (this._offsetPath) {
                const duration = this.duration;
                return $util$7.objectMap(this._offsetPath, item => item.key / duration);
            }
            return super.keyTimes;
        }
        set values(value) {
            if (!this.path) {
                super.values = value;
            }
        }
        get values() {
            this.setOffsetPath();
            if (this._offsetPath) {
                return $util$7.objectMap(this._offsetPath, item => `${item.value.x} ${item.value.y}`);
            }
            return super.values;
        }
        get rotateValues() {
            this.setOffsetPath();
            if (this._offsetPath) {
                return $util$7.objectMap(this._offsetPath, item => item.rotate);
            }
            return undefined;
        }
        get keyPoints() {
            if (this._keyPoints === undefined) {
                this._keyPoints = [];
            }
            return this._keyPoints;
        }
        set reverse(value) {
            if (value !== super.reverse) {
                const { keyTimes, keyPoints } = this.reverseKeyPoints();
                if (keyTimes && keyPoints) {
                    this.length = 0;
                    this._keyPoints = keyPoints;
                    super.keyTimes = keyTimes;
                    super.reverse = value;
                }
            }
        }
        get reverse() {
            return super.reverse;
        }
        set alternate(value) {
            const iterationCount = this.iterationCount;
            if (value !== super.alternate && (iterationCount === -1 || iterationCount > 1)) {
                const { keyTimes, keyPoints } = this.reverseKeyPoints();
                if (keyTimes && keyPoints) {
                    const duration = this.duration;
                    let keyTimesBase = super.keyTimes;
                    let keyPointsBase = this.keyPoints;
                    const length = keyTimesBase.length;
                    if (iterationCount === -1) {
                        for (let i = 0; i < length; i++) {
                            keyTimesBase[i] /= 2;
                            keyTimes[i] = 0.5 + keyTimes[i] / 2;
                        }
                        keyTimesBase = keyTimesBase.concat(keyTimes);
                        keyPointsBase = keyPointsBase.concat(keyPoints);
                        this.duration = duration * 2;
                    }
                    else {
                        const keyTimesStatic = keyTimesBase.slice(0);
                        const keyPointsStatic = keyPointsBase.slice(0);
                        for (let i = 0; i < iterationCount; i++) {
                            if (i === 0) {
                                for (let j = 0; j < length; j++) {
                                    keyTimesBase[j] /= iterationCount;
                                }
                            }
                            else {
                                const baseTime = i * (1 / iterationCount);
                                const keyTimesAppend = i % 2 === 0 ? keyTimesStatic.slice(0) : keyTimes.slice(0);
                                for (let j = 0; j < length; j++) {
                                    keyTimesAppend[j] = $math$3.truncateFraction(baseTime + keyTimesAppend[j] / iterationCount);
                                }
                                keyTimesBase = keyTimesBase.concat(keyTimesAppend);
                                keyPointsBase = keyPointsBase.concat(i % 2 === 0 ? keyPointsStatic : keyPoints);
                            }
                        }
                        this.duration = duration * iterationCount;
                        this.iterationCount = 1;
                    }
                    this._keyTimes = keyTimesBase;
                    this._keyPoints = keyPointsBase;
                    super.alternate = value;
                }
            }
        }
        get alternate() {
            return super.alternate;
        }
        set parent(value) {
            super.parent = value;
            const parentContainer = this.parentContainer;
            if (parentContainer && parentContainer.requireRefit && this.path) {
                this.path = SvgBuild.transformRefit(this.path, undefined, undefined, parentContainer);
            }
        }
        get parent() {
            return super.parent;
        }
        get offsetLength() {
            if (this._offsetLength === 0 && this.path) {
                this._offsetLength = getPathLength(this.path);
            }
            return this._offsetLength;
        }
        get instanceType() {
            return 114696 /* SVG_ANIMATE_MOTION */;
        }
    }

    const { css: $css$5, dom: $dom$7, regex: $regex$4, util: $util$8 } = squared.lib;
    const STRING_CUBICBEZIER = `cubic-bezier\\(([\\d.]+), ([\\d.]+), ([\\d.]+), ([\\d.]+)\\)`;
    const REGEXP_TIMINGFUNCTION = new RegExp(`(ease|ease-in|ease-out|ease-in-out|linear|step-(?:start|end)|steps\\(\\d+, (?:start|end)\\)|${STRING_CUBICBEZIER}),?\\s*`, 'g');
    const KEYFRAME_MAP = $css$5.getKeyframeRules();
    const ANIMATION_DEFAULT = {
        'animation-delay': '0s',
        'animation-duration': '0s',
        'animation-iteration-count': '1',
        'animation-play-state': 'running',
        'animation-direction': 'normal',
        'animation-fill-mode': 'none',
        'animation-timing-function': 'ease'
    };
    function parseAttribute(element, attr) {
        const value = getAttribute(element, attr);
        if (attr === 'animation-timing-function') {
            REGEXP_TIMINGFUNCTION.lastIndex = 0;
            const result = [];
            let match;
            while ((match = REGEXP_TIMINGFUNCTION.exec(value)) !== null) {
                result.push(match[1]);
            }
            return result;
        }
        else {
            return value.split($regex$4.XML.SEPARATOR);
        }
    }
    function isVisible(element) {
        const value = getAttribute(element, 'visibility');
        return value !== 'hidden' && value !== 'collapse' && getAttribute(element, 'display') !== 'none';
    }
    function sortAttribute(value) {
        return value.sort((a, b) => {
            if (a.key !== b.key) {
                return a.key < b.key ? -1 : 1;
            }
            return 0;
        });
    }
    function convertRotate(value) {
        if (value === 'reverse') {
            return 'auto 180deg';
        }
        else if (value.startsWith('reverse ')) {
            const angle = value.split(' ')[1];
            if ($css$5.isAngle(angle)) {
                return `auto ${180 + $css$5.parseAngle(angle)}deg`;
            }
            return 'auto 0deg';
        }
        return value;
    }
    var SvgView$MX = (Base) => {
        return class extends Base {
            getTransforms(element) {
                if (element === undefined) {
                    element = this.element;
                }
                return SvgBuild.filterTransforms(TRANSFORM.parse(element) || SvgBuild.convertTransforms(element.transform.baseVal));
            }
            getAnimations(element) {
                if (element === undefined) {
                    element = this.element;
                }
                const result = [];
                let id = 0;
                const addAnimation = (item, delay, name = '') => {
                    if (name === '') {
                        id++;
                    }
                    item.delay = delay;
                    item.group = { id, name };
                    item.parent = this;
                    result.push(item);
                };
                const children = element.children;
                let length = children.length;
                for (let i = 0; i < length; i++) {
                    const item = children[i];
                    if (item instanceof SVGAnimationElement) {
                        const begin = $dom$7.getNamedItem(item, 'begin');
                        if (begin !== '' && /^[a-zA-Z]+$/.test(begin)) {
                            continue;
                        }
                        const times = begin ? $util$8.sortNumber($util$8.replaceMap(begin.split(';'), value => SvgAnimation.convertClockTime(value))) : [0];
                        if (times.length) {
                            switch (item.tagName) {
                                case 'set':
                                    for (const time of times) {
                                        addAnimation(new SvgAnimation(element, item), time);
                                    }
                                    break;
                                case 'animate':
                                    for (const time of times) {
                                        addAnimation(new SvgAnimate(element, item), time);
                                    }
                                    break;
                                case 'animateTransform':
                                    for (const time of times) {
                                        const animate = new SvgAnimateTransform(element, item);
                                        if (SvgBuild.isShape(this) && this.path) {
                                            animate.transformFrom = SvgBuild.drawRefit(element, this.parent, this.viewport && this.viewport.precision);
                                        }
                                        addAnimation(animate, time);
                                    }
                                    break;
                                case 'animateMotion':
                                    for (const time of times) {
                                        const animate = new SvgAnimateMotion(element, item);
                                        if (animate.motionPathElement) {
                                            animate.path = SvgBuild.drawRefit(animate.motionPathElement, this.parent, this.viewport && this.viewport.precision);
                                        }
                                        addAnimation(animate, time);
                                    }
                                    break;
                            }
                        }
                    }
                }
                const animationName = parseAttribute(element, 'animation-name');
                length = animationName.length;
                if (length) {
                    const cssData = {};
                    const groupName = [];
                    const groupOrdering = [];
                    for (const name in ANIMATION_DEFAULT) {
                        let values = parseAttribute(element, name);
                        if (values.length === 0) {
                            values.push(ANIMATION_DEFAULT[name]);
                        }
                        while (values.length < length) {
                            values = values.concat(values.slice(0));
                        }
                        values.length = length;
                        cssData[name] = values;
                    }
                    for (let i = 0; i < length; i++) {
                        const keyframes = KEYFRAME_MAP[animationName[i]];
                        const duration = SvgAnimation.convertClockTime(cssData['animation-duration'][i]);
                        if (keyframes && duration > 0) {
                            id++;
                            const attrMap = {};
                            const keyframeMap = {};
                            const paused = cssData['animation-play-state'][i] === 'paused';
                            const delay = SvgAnimation.convertClockTime(cssData['animation-delay'][i]);
                            const iterationCount = cssData['animation-iteration-count'][i];
                            const fillMode = cssData['animation-fill-mode'][i];
                            const keyframeIndex = `${animationName[i]}_${i}`;
                            const attributes = [];
                            let includeKeySplines = true;
                            groupOrdering.push({
                                name: keyframeIndex,
                                attributes,
                                paused,
                                delay,
                                duration,
                                iterationCount,
                                fillMode
                            });
                            for (const percent in keyframes) {
                                const key = parseFloat(percent) / 100;
                                const data = keyframes[percent];
                                for (const name in data) {
                                    const map = ANIMATION_DEFAULT[name] ? keyframeMap : attrMap;
                                    if (map[name] === undefined) {
                                        map[name] = [];
                                    }
                                    let value = data[name];
                                    if (value) {
                                        if ($css$5.isCalc(value)) {
                                            value = $css$5.calculateVar(element, value, name);
                                        }
                                        else if ($css$5.isCustomProperty(value)) {
                                            value = $css$5.parseVar(element, value);
                                        }
                                        if (value !== undefined) {
                                            map[name].push({ key, value: value.toString() });
                                        }
                                    }
                                }
                            }
                            if (attrMap['transform']) {
                                function getKeyframeOrigin(order) {
                                    const origin = attrMap['transform-origin'] && attrMap['transform-origin'].find(item => item.key === order);
                                    if (origin) {
                                        return TRANSFORM.origin(element, origin.value);
                                    }
                                    return undefined;
                                }
                                for (const transform of sortAttribute(attrMap['transform'])) {
                                    const transforms = TRANSFORM.parse(element, transform.value);
                                    if (transforms) {
                                        const origin = getKeyframeOrigin(transform.key);
                                        for (const item of transforms) {
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
                                                    if (origin && (transform.key !== 0 || origin.x !== 0 || origin.y !== 0)) {
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
                                                    if (origin && (transform.key !== 0 || origin.y !== 0)) {
                                                        transformOrigin = {
                                                            x: origin.y * m.c * -1,
                                                            y: 0
                                                        };
                                                    }
                                                    break;
                                                case SVGTransform.SVG_TRANSFORM_SKEWY:
                                                    name = 'skewY';
                                                    value = item.angle.toString();
                                                    if (origin && (transform.key !== 0 || origin.x !== 0)) {
                                                        transformOrigin = {
                                                            x: 0,
                                                            y: origin.x * m.b * -1
                                                        };
                                                    }
                                                    break;
                                                default:
                                                    continue;
                                            }
                                            if (attrMap[name] === undefined) {
                                                attrMap[name] = [];
                                            }
                                            const index = attrMap[name].findIndex(previous => previous.key === transform.key);
                                            if (index !== -1) {
                                                attrMap[name][index].value = value;
                                                attrMap[name][index].transformOrigin = transformOrigin;
                                            }
                                            else {
                                                attrMap[name].push({
                                                    key: transform.key,
                                                    value,
                                                    transformOrigin
                                                });
                                            }
                                        }
                                    }
                                }
                                delete attrMap['transform'];
                                delete attrMap['transform-origin'];
                            }
                            if (getAttribute(element, 'offset-path') === 'none') {
                                delete attrMap['offset-distance'];
                                delete attrMap['offset-rotate'];
                            }
                            else if (attrMap['offset-rotate']) {
                                const offsetRotate = attrMap['offset-rotate'];
                                if (attrMap['offset-distance'] || attrMap['rotate'] === undefined) {
                                    let rotate = getAttribute(element, 'offset-rotate', false);
                                    if (rotate === '' || rotate === 'auto') {
                                        rotate = 'auto 0deg';
                                    }
                                    sortAttribute(offsetRotate);
                                    const from = offsetRotate[0];
                                    const to = offsetRotate[offsetRotate.length - 1];
                                    if (from.key !== 0) {
                                        offsetRotate.unshift({ key: 0, value: rotate });
                                    }
                                    if (to.key !== 1) {
                                        offsetRotate.push({ key: 1, value: rotate });
                                    }
                                    for (let j = 1; j < offsetRotate.length; j++) {
                                        const previous = offsetRotate[j - 1];
                                        const item = offsetRotate[j];
                                        previous.value = convertRotate(previous.value);
                                        item.value = convertRotate(item.value);
                                        if (previous.value.split(' ').pop() !== item.value.split(' ').pop()) {
                                            const previousAuto = previous.value.startsWith('auto');
                                            const auto = item.value.startsWith('auto');
                                            if (previousAuto && !auto || !previousAuto && auto) {
                                                const key = (previous.key + item.key) / 2;
                                                offsetRotate.splice(j++, 0, { key, value: previous.value });
                                                offsetRotate.splice(j++, 0, { key, value: item.value });
                                            }
                                        }
                                    }
                                    if (attrMap['offset-distance'] === undefined) {
                                        const animate = new SvgAnimateMotion(element);
                                        animate.duration = 0;
                                        animate.iterationCount = 1;
                                        animate.fillForwards = true;
                                        animate.addKeyPoint({ key: 0, value: animate.distance });
                                        addAnimation(animate, delay, keyframeIndex);
                                        for (const item of offsetRotate) {
                                            let angle = $css$5.parseAngle(item.value.split(' ').pop());
                                            if (item.value.startsWith('auto')) {
                                                angle += 90;
                                            }
                                            item.value = `${angle} 0 0`;
                                        }
                                        attrMap['rotate'] = offsetRotate;
                                        delete attrMap['offset-rotate'];
                                        includeKeySplines = false;
                                    }
                                }
                                else {
                                    delete attrMap['offset-rotate'];
                                }
                            }
                            for (const name in attrMap) {
                                let animate;
                                switch (name) {
                                    case 'offset-rotate':
                                        continue;
                                    case 'offset-distance':
                                        animate = new SvgAnimateMotion(element);
                                        animate.rotateData = attrMap['offset-rotate'];
                                        break;
                                    case 'rotate':
                                    case 'scale':
                                    case 'skewX':
                                    case 'skewY':
                                    case 'translate':
                                        animate = new SvgAnimateTransform(element);
                                        animate.setType(name);
                                        break;
                                    default:
                                        animate = new SvgAnimate(element);
                                        animate.attributeName = name;
                                        break;
                                }
                                addAnimation(animate, delay, keyframeIndex);
                                const animation = attrMap[name];
                                const direction = cssData['animation-direction'][i];
                                const timingFunction = cssData['animation-timing-function'][i];
                                sortAttribute(animation);
                                if (name === 'offset-distance') {
                                    const animateMotion = animate;
                                    if (animation[0].key !== 0) {
                                        animateMotion.addKeyPoint({ key: 0, value: animateMotion.distance });
                                    }
                                    for (const item of animation) {
                                        animateMotion.addKeyPoint(item);
                                    }
                                    if (animation.pop().key !== 1) {
                                        animateMotion.addKeyPoint({ key: 1, value: animateMotion.distance });
                                    }
                                    if ($util$8.isString(timingFunction)) {
                                        animateMotion.timingFunction = timingFunction;
                                    }
                                }
                                else {
                                    attributes.push(name);
                                    const keyTimes = [];
                                    const values = [];
                                    const keySplines = [];
                                    const lengthA = animation.length;
                                    for (let j = 0; j < lengthA; j++) {
                                        keyTimes.push(animation[j].key);
                                        values.push(animation[j].value);
                                        if (includeKeySplines && j < lengthA - 1) {
                                            const spline = keyframeMap['animation-timing-function'] && keyframeMap['animation-timing-function'].find(item => item.key === animation[j].key);
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
                                    if (keyTimes[0] !== 0) {
                                        keyTimes.unshift(0);
                                        values.unshift(animate.baseValue || '');
                                        if (includeKeySplines) {
                                            keySplines.unshift(timingFunction);
                                        }
                                        animate.evaluateStart = true;
                                    }
                                    if (includeKeySplines && !keySplines.every(value => value === 'linear')) {
                                        const keyTimesData = [];
                                        const valuesData = [];
                                        const keySplinesData = [];
                                        const lengthB = keyTimes.length;
                                        for (let j = 0; j < lengthB; j++) {
                                            if (j < lengthB - 1) {
                                                const segDuration = (keyTimes[j + 1] - keyTimes[j]) * duration;
                                                if (KEYSPLINE_NAME[keySplines[j]]) {
                                                    keySplines[j] = KEYSPLINE_NAME[keySplines[j]];
                                                }
                                                else if (keySplines[j].startsWith('step')) {
                                                    if (values[j] !== '') {
                                                        const steps = SvgAnimate.convertStepTimingFunction(name, keySplines[j], keyTimes, values, j, $css$5.getFontSize(element));
                                                        if (steps) {
                                                            const offset = keyTimes[j + 1] === 1 ? 1 : 0;
                                                            for (let k = 0; k < steps[0].length - offset; k++) {
                                                                let keyTime = (keyTimes[j] + steps[0][k] * segDuration) / duration;
                                                                if (keyTimesData.includes(keyTime)) {
                                                                    keyTime += 1 / 1000;
                                                                }
                                                                keyTimesData.push(keyTime);
                                                                valuesData.push(steps[1][k]);
                                                                keySplinesData.push(KEYSPLINE_NAME[keySplines[j].indexOf('start') !== -1 ? 'step-start' : 'step-end']);
                                                            }
                                                            continue;
                                                        }
                                                    }
                                                    keySplines[j] = KEYSPLINE_NAME.linear;
                                                }
                                                else {
                                                    const match = new RegExp(STRING_CUBICBEZIER).exec(keySplines[j]);
                                                    keySplines[j] = match ? `${match[1]} ${match[2]} ${match[3]} ${match[4]}` : KEYSPLINE_NAME.ease;
                                                }
                                                keySplinesData.push(keySplines[j]);
                                            }
                                            keyTimesData.push(keyTimes[j]);
                                            valuesData.push(values[j]);
                                        }
                                        animate.values = valuesData;
                                        animate.keyTimes = keyTimesData;
                                        animate.keySplines = keySplinesData;
                                    }
                                    else {
                                        animate.values = values;
                                        animate.keyTimes = keyTimes;
                                        if (includeKeySplines) {
                                            animate.keySplines = keySplines;
                                        }
                                        else {
                                            animate.timingFunction = timingFunction;
                                        }
                                    }
                                }
                                animate.paused = paused;
                                animate.duration = duration;
                                animate.iterationCount = iterationCount !== 'infinite' ? parseFloat(iterationCount) : -1;
                                animate.fillForwards = fillMode === 'forwards' || fillMode === 'both';
                                animate.fillBackwards = fillMode === 'backwards' || fillMode === 'both';
                                animate.reverse = direction.endsWith('reverse');
                                animate.alternate = (animate.iterationCount === -1 || animate.iterationCount > 1) && direction.startsWith('alternate');
                                groupName.push(animate);
                            }
                        }
                    }
                    groupOrdering.reverse();
                    for (const item of groupName) {
                        item.setGroupOrdering(groupOrdering);
                    }
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
            get visible() {
                return isVisible(this.element);
            }
            get opacity() {
                return getAttribute(this.element, 'opacity', false) || '1';
            }
        };
    };

    const $client = squared.lib.client;
    function hasUnsupportedAccess(element) {
        if (element.tagName === 'svg') {
            if ($client.isUserAgent(8 /* FIREFOX */)) {
                return element.parentElement instanceof HTMLElement;
            }
            else if ($client.isUserAgent(4 /* SAFARI */)) {
                return !(element.parentElement instanceof HTMLElement);
            }
        }
        return false;
    }
    var SvgViewRect$MX = (Base) => {
        return class extends Base {
            setRect() {
                const parent = this.parent;
                let x = this.x;
                let y = this.y;
                let width = this.width;
                let height = this.height;
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

    const $util$9 = squared.lib.util;
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
        const value = getAttributeURL(getParentAttribute(element, 'fill'));
        if (value !== '') {
            if (viewport && viewport.definitions.pattern.has(value)) {
                return viewport.definitions.pattern.get(value);
            }
            else {
                const target = document.getElementById(value.substring(1));
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
        build(options) {
            let element;
            let precision;
            let initialize = true;
            if (options) {
                element = options.symbolElement || options.patternElement || options.element || this.element;
                precision = options.precision;
                options = Object.assign({}, options, { symbolElement: undefined, patternElement: undefined, element: undefined });
                if (options.initialize === false) {
                    initialize = false;
                }
            }
            else {
                element = this.element;
            }
            this.clear();
            const viewport = this.getViewport();
            let requireClip = false;
            const children = element.children;
            const length = children.length;
            for (let i = 0; i < length; i++) {
                const item = children[i];
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
                                svg = new squared.svg.SvgUse(item, target, initialize);
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
                        svg = new squared.svg.SvgShape(item, initialize);
                    }
                }
                if (svg) {
                    this.append(svg, viewport);
                    svg.build(options);
                }
            }
            if (SvgBuild.asSvg(this) && this.documentRoot) {
                if (this.aspectRatio.x < 0 || this.aspectRatio.y < 0) {
                    this.clipViewBox(this.aspectRatio.x, this.aspectRatio.y, this.aspectRatio.width, this.aspectRatio.height, precision, true);
                }
            }
            else if (requireClip && this.hasViewBox() && (this.aspectRatio.x !== 0 || this.aspectRatio.y !== 0)) {
                const boxRect = SvgBuild.getBoxRect(this.getPathAll(false));
                const x = this.refitX(this.aspectRatio.x);
                const y = this.refitY(this.aspectRatio.y);
                if (boxRect.left < x || boxRect.top < y) {
                    this.clipViewBox(boxRect.left, boxRect.top, this.refitSize(this.aspectRatio.width), this.refitSize(this.aspectRatio.height), precision);
                }
            }
        }
        hasViewBox() {
            return SvgBuild.asSvg(this) && !!this.element.viewBox.baseVal || SvgBuild.asUseSymbol(this) && !!this.symbolElement.viewBox.baseVal;
        }
        clipViewBox(x, y, width, height, precision, documentRoot = false) {
            if (documentRoot) {
                width -= x;
                height -= y;
                x = x < 0 ? x * -1 : 0;
                y = y < 0 ? y * -1 : 0;
            }
            this.clipRegion = SvgBuild.drawRect(width, height, x, y, precision);
        }
        synchronize(options) {
            this.each(item => item.synchronize(options));
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
            return this.viewport || SvgBuild.asSvg(this) && this || undefined;
        }
        setAspectRatio(group, viewBox) {
            const parent = getNearestViewBox$1(this);
            if (parent) {
                const aspectRatio = group.aspectRatio;
                if (viewBox) {
                    $util$9.cloneObject(viewBox, aspectRatio);
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
        get requireRefit() {
            return this.aspectRatio.x !== 0 || this.aspectRatio.y !== 0 || this.aspectRatio.position.x !== 0 || this.aspectRatio.position.y !== 0 || this.aspectRatio.parent.x !== 0 || this.aspectRatio.parent.y !== 0 || this.aspectRatio.unit !== 1;
        }
        get instanceType() {
            return 2 /* SVG_CONTAINER */;
        }
    }

    const { color: $color$1, dom: $dom$8, util: $util$a } = squared.lib;
    function getColorStop(element) {
        const result = [];
        const stops = element.getElementsByTagName('stop');
        const length = stops.length;
        for (let i = 0; i < length; i++) {
            const item = stops[i];
            const color = $color$1.parseColor($dom$8.getNamedItem(item, 'stop-color'), $util$a.convertFloat($dom$8.getNamedItem(item, 'stop-opacity') || '1'));
            if (color) {
                result.push({
                    color,
                    offset: parseFloat($dom$8.getNamedItem(item, 'offset')) / 100
                });
            }
        }
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
        build(options) {
            this.precision = options && options.precision;
            this.setRect();
            super.build(options);
        }
        synchronize(options) {
            if (!this.documentRoot && this.animations.length) {
                this.animateSequentially(this.getAnimateViewRect(), this.getAnimateTransform(options), undefined, options);
            }
            super.synchronize(options);
        }
        init() {
            if (this.documentRoot) {
                $util$a.cloneObject(this.element.viewBox.baseVal, this.aspectRatio);
                this.element.querySelectorAll('set, animate, animateTransform, animateMotion').forEach((element) => {
                    const target = getTargetElement(element, this.element);
                    if (target) {
                        if (element.parentElement) {
                            element.parentElement.removeChild(element);
                        }
                        target.appendChild(element);
                    }
                });
            }
            this.setDefinitions(this.element);
            this.element.querySelectorAll('defs').forEach(element => this.setDefinitions(element));
        }
        setDefinitions(item) {
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
                        this.definitions.gradient.set(id, Object.assign({ type: 'linear', element, spreadMethod: element.spreadMethod.baseVal, colorStops: getColorStop(element) }, getBaseValue(element, 'x1', 'x2', 'y1', 'y2')));
                    }
                    else if (SVG.radialGradient(element)) {
                        this.definitions.gradient.set(id, Object.assign({ type: 'radial', element, spreadMethod: element.spreadMethod.baseVal, colorStops: getColorStop(element) }, getBaseValue(element, 'cx', 'cy', 'r', 'fx', 'fy', 'fr')));
                    }
                }
            });
        }
        get viewBox() {
            return this.element.viewBox.baseVal || getDOMRect(this.element);
        }
        get instanceType() {
            return 18 /* SVG */;
        }
    }

    class SvgElement {
        constructor(element) {
            this.element = element;
        }
        build(options) { }
        synchronize(options) { }
        get instanceType() {
            return 4 /* SVG_ELEMENT */;
        }
    }

    const { color: $color$2, css: $css$6, regex: $regex$5, util: $util$b } = squared.lib;
    const CACHE_PATTERN$1 = {
        url: $regex$5.CSS.URL
    };
    var SvgPaint$MX = (Base) => {
        return class extends Base {
            setPaint(d, precision) {
                this.resetPaint();
                this.setAttribute('color');
                this.setAttribute('fill');
                this.setAttribute('fill-opacity', false);
                this.setAttribute('fill-rule');
                this.setAttribute('stroke');
                this.setAttribute('stroke-opacity', false);
                this.setAttribute('stroke-width');
                this.setAttribute('stroke-linecap');
                this.setAttribute('stroke-linejoin');
                this.setAttribute('stroke-miterlimit');
                this.setAttribute('stroke-dasharray');
                this.setAttribute('stroke-dashoffset');
                this.setAttribute('clip-rule');
                const clipPath = this.getAttribute('clip-path', true, false);
                if (clipPath !== '' && clipPath !== 'none') {
                    if (CACHE_PATTERN$1.polygon === undefined) {
                        CACHE_PATTERN$1.polygon = /polygon\(([^)]+)\)/;
                        CACHE_PATTERN$1.inset = new RegExp(`inset\\(${$regex$5.STRING.LENGTH_PERCENTAGE}\\s?${$regex$5.STRING.LENGTH_PERCENTAGE}?\\s?${$regex$5.STRING.LENGTH_PERCENTAGE}?\\s?${$regex$5.STRING.LENGTH_PERCENTAGE}?\\)`);
                        CACHE_PATTERN$1.circle = new RegExp(`circle\\(${$regex$5.STRING.LENGTH_PERCENTAGE}(?: at ${$regex$5.STRING.LENGTH_PERCENTAGE} ${$regex$5.STRING.LENGTH_PERCENTAGE})?\\)`);
                        CACHE_PATTERN$1.ellipse = new RegExp(`ellipse\\(${$regex$5.STRING.LENGTH_PERCENTAGE} ${$regex$5.STRING.LENGTH_PERCENTAGE}(?: at ${$regex$5.STRING.LENGTH_PERCENTAGE} ${$regex$5.STRING.LENGTH_PERCENTAGE})?\\)`);
                    }
                    for (const name in CACHE_PATTERN$1) {
                        const match = CACHE_PATTERN$1[name].exec(clipPath);
                        if (match) {
                            if (name === 'url') {
                                this.clipPath = match[1];
                                return;
                            }
                            else if (d && d.length) {
                                const boxRect = SvgBuild.getBoxRect(d);
                                const width = boxRect.right - boxRect.left;
                                const height = boxRect.bottom - boxRect.top;
                                const parent = this.parent;
                                switch (name) {
                                    case 'inset': {
                                        let x1 = 0;
                                        let x2 = 0;
                                        let y1 = this.convertLength(match[1], height);
                                        let y2 = 0;
                                        if (match[4]) {
                                            x1 = boxRect.left + this.convertLength(match[4], width);
                                            x2 = boxRect.right - this.convertLength(match[2], width);
                                            y2 = boxRect.bottom - this.convertLength(match[3], height);
                                        }
                                        else if (match[2]) {
                                            x1 = this.convertLength(match[2], width);
                                            x2 = boxRect.right - x1;
                                            y2 = boxRect.bottom - (match[3] ? this.convertLength(match[3], height) : y1);
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
                                        this.clipPath = SvgBuild.drawPolygon(points, precision);
                                        return;
                                    }
                                    case 'polygon': {
                                        const points = $util$b.objectMap(match[1].split($regex$5.XML.SEPARATOR), values => {
                                            let [x, y] = $util$b.replaceMap(values.trim().split(' '), (value, index) => this.convertLength(value, index === 0 ? width : height));
                                            x += boxRect.left;
                                            y += boxRect.top;
                                            return { x, y };
                                        });
                                        if (parent) {
                                            parent.refitPoints(points);
                                        }
                                        this.clipPath = SvgBuild.drawPolygon(points, precision);
                                        return;
                                    }
                                    default: {
                                        if (name === 'circle' || name === 'ellipse') {
                                            const dimension = width < height ? width : height;
                                            let rx;
                                            let ry;
                                            if (name === 'circle') {
                                                rx = this.convertLength(match[1], dimension);
                                                ry = rx;
                                            }
                                            else {
                                                rx = this.convertLength(match[1], width);
                                                ry = this.convertLength(match[2], height);
                                            }
                                            let cx = boxRect.left;
                                            let cy = boxRect.top;
                                            if (match.length >= 4) {
                                                cx += this.convertLength(match[match.length - 2], dimension);
                                                cy += this.convertLength(match[match.length - 1], dimension);
                                            }
                                            if (parent) {
                                                cx = parent.refitX(cx);
                                                cy = parent.refitX(cy);
                                                rx = parent.refitSize(rx);
                                                ry = parent.refitSize(ry);
                                            }
                                            this.clipPath = SvgBuild.drawEllipse(cx, cy, rx, ry, precision);
                                        }
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            setAttribute(attr, computed = true, inherited = true) {
                let value = this.getAttribute(attr, computed, inherited);
                if ($util$b.isString(value)) {
                    if ($css$6.isCustomProperty(value)) {
                        const result = $css$6.calculateVar(this.element, value, attr);
                        if (result !== undefined) {
                            value = result.toString();
                        }
                    }
                    switch (attr) {
                        case 'stroke-dasharray':
                            value = value !== 'none' ? $util$b.joinMap(value.split(/,\s*/), unit => this.convertLength(unit).toString(), ', ', false) : '';
                            break;
                        case 'stroke-dashoffset':
                        case 'stroke-width':
                            value = this.convertLength(value).toString();
                            break;
                        case 'fill':
                        case 'stroke':
                            const url = getAttributeURL(value);
                            if (url !== '') {
                                this[`${attr}Pattern`] = url;
                            }
                            else {
                                let color;
                                switch (value.toLowerCase()) {
                                    case 'none':
                                    case 'transparent':
                                    case 'rgba(0, 0, 0, 0)':
                                        this[attr] = 'none';
                                        break;
                                    case 'currentcolor':
                                        color = $color$2.parseColor(this.color || getAttribute(this.element, attr));
                                        break;
                                    default:
                                        color = $color$2.parseColor(value);
                                        break;
                                }
                                if (color) {
                                    this[attr] = color.value;
                                }
                            }
                            return;
                    }
                    this[$util$b.convertCamelCase(attr)] = value;
                }
            }
            getAttribute(attr, computed = true, inherited = true) {
                let value = getAttribute(this.element, attr, computed);
                if (inherited && !$util$b.isString(value)) {
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
                        value = getAttribute(current.element, attr, computed);
                        if ($util$b.isString(value)) {
                            break;
                        }
                        current = current.parent;
                    }
                }
                return value;
            }
            convertLength(value, dimension) {
                if (!$util$b.isNumber(value)) {
                    if ($css$6.isLength(value)) {
                        return $css$6.parseUnit(value, $css$6.getFontSize(this.element));
                    }
                    else if ($css$6.isPercent(value)) {
                        return Math.round((typeof dimension === 'number' ? dimension : this.element.getBoundingClientRect()[dimension || 'width']) * $util$b.convertFloat(value) / 100);
                    }
                }
                return $util$b.convertFloat(value);
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
                this.strokeDasharray = '';
                this.strokeDashoffset = '0';
                this.color = '';
                this.clipPath = '';
                this.clipRule = '';
            }
        };
    };

    class SvgG extends SvgPaint$MX(SvgView$MX(SvgContainer)) {
        constructor(element) {
            super(element);
            this.element = element;
        }
        build(options) {
            super.build(options);
            this.setPaint(this.getPathAll(), options && options.precision);
        }
        get instanceType() {
            return 34 /* SVG_G */;
        }
    }

    const $util$c = squared.lib.util;
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
                for (const item of transforms) {
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
                                if (this.rotateAngle) {
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
                return $util$c.resolvePath(element.href.baseVal);
            }
            return '';
        }
        get transforms() {
            let transforms = super.transforms;
            if (!this.__get_transforms) {
                if (this.imageElement) {
                    transforms = transforms.concat(this.getTransforms(this.imageElement));
                    this._transforms = transforms;
                }
                this.__get_transforms = true;
            }
            return transforms;
        }
        get animations() {
            let animations = super.animations;
            if (!this.__get_animations) {
                if (this.imageElement) {
                    animations = animations.concat(this.getAnimations(this.imageElement));
                    this._animations = animations;
                }
                this.__get_animations = true;
            }
            return animations;
        }
        get instanceType() {
            return 4100 /* SVG_IMAGE */;
        }
    }

    const { dom: $dom$9, math: $math$4, util: $util$d } = squared.lib;
    function updatePathLocation(path, attr, x, y) {
        const commandA = path[0];
        const commandB = path[path.length - 1];
        if (x !== undefined) {
            switch (attr) {
                case 'x':
                    x -= commandA.start.x;
                    break;
                case 'x1':
                case 'cx':
                    commandA.start.x = x;
                    commandA.coordinates[0] = x;
                    return;
                case 'x2':
                    commandB.end.x = x;
                    commandB.coordinates[0] = x;
                    return;
            }
        }
        if (y !== undefined) {
            switch (attr) {
                case 'y':
                    y -= commandA.start.y;
                    break;
                case 'y1':
                case 'cy':
                    commandA.start.y = y;
                    commandA.coordinates[1] = y;
                    return;
                case 'y2':
                    commandB.end.y = y;
                    commandB.coordinates[1] = y;
                    return;
            }
        }
        for (const seg of path) {
            const value = seg.value;
            const coordinates = seg.coordinates;
            const length = coordinates.length;
            for (let j = 0, k = 0; j < length; j += 2, k++) {
                if (x !== undefined) {
                    if (!seg.relative) {
                        coordinates[j] += x;
                    }
                    value[k].x += x;
                }
                if (y !== undefined) {
                    if (!seg.relative) {
                        coordinates[j + 1] += y;
                    }
                    value[k].y += y;
                }
            }
        }
    }
    function updatePathRadius(path, rx, ry) {
        const length = path.length;
        for (let i = 0; i < length; i++) {
            const seg = path[i];
            if (seg.key.toUpperCase() === 'A') {
                if (rx !== undefined) {
                    const offset = rx - seg.radiusX;
                    seg.radiusX = rx;
                    seg.coordinates[0] = rx * 2 * (seg.coordinates[0] < 0 ? -1 : 1);
                    if (i === 1) {
                        path[0].coordinates[0] -= offset;
                        path[0].end.x -= offset;
                    }
                }
                if (ry !== undefined) {
                    seg.radiusY = ry;
                }
            }
        }
    }
    class SvgPath extends SvgPaint$MX(SvgBaseVal$MX(SvgElement)) {
        constructor(element) {
            super(element);
            this.element = element;
            this.name = '';
            this.value = '';
            this.baseValue = '';
            this.init();
        }
        static extrapolate(attr, pathData, values, transforms, companion, precision) {
            const transformRefit = !!transforms || !!companion && !!companion.parent && companion.parent.requireRefit;
            const result = [];
            let commands;
            const length = values.length;
            for (let i = 0; i < length; i++) {
                if (attr === 'd') {
                    result[i] = values[i];
                }
                else if (attr === 'points') {
                    const points = SvgBuild.convertPoints(SvgBuild.parseCoordinates(values[i]));
                    if (points.length) {
                        result[i] = companion && SVG.polygon(companion.element) ? SvgBuild.drawPolygon(points, precision) : SvgBuild.drawPolyline(points, precision);
                    }
                }
                else if (pathData) {
                    if (commands === undefined) {
                        commands = SvgBuild.getPathCommands(pathData);
                    }
                    const value = parseFloat(values[i]);
                    if (!isNaN(value)) {
                        const path = i < length - 1 ? $util$d.cloneArray(commands, [], true) : commands;
                        switch (attr) {
                            case 'x':
                            case 'x1':
                            case 'x2':
                            case 'cx':
                                updatePathLocation(path, attr, value);
                                break;
                            case 'y':
                            case 'y1':
                            case 'y2':
                            case 'cy':
                                updatePathLocation(path, attr, undefined, value);
                                break;
                            case 'r':
                                updatePathRadius(path, value, value);
                                break;
                            case 'rx':
                                updatePathRadius(path, value);
                                break;
                            case 'ry':
                                updatePathRadius(path, undefined, value);
                                break;
                            case 'width':
                                for (const index of [1, 2]) {
                                    const seg = path[index];
                                    switch (seg.key) {
                                        case 'm':
                                        case 'l':
                                        case 'h':
                                            seg.coordinates[0] = value * (seg.coordinates[0] < 0 ? -1 : 1);
                                            break;
                                        case 'M':
                                        case 'L':
                                        case 'H':
                                            seg.coordinates[0] = path[0].end.x + value;
                                            break;
                                    }
                                }
                                break;
                            case 'height':
                                for (const index of [2, 3]) {
                                    const seg = path[index];
                                    switch (seg.key) {
                                        case 'm':
                                        case 'l':
                                        case 'v':
                                            seg.coordinates[1] = value * (seg.coordinates[1] < 0 ? -1 : 1);
                                            break;
                                        case 'M':
                                        case 'L':
                                        case 'V':
                                            seg.coordinates[1] = path[0].end.y + value;
                                            break;
                                    }
                                }
                                break;
                            default:
                                result[i] = '';
                                continue;
                        }
                        result[i] = SvgBuild.drawPath(path, precision);
                    }
                }
                if (result[i]) {
                    if (transformRefit) {
                        result[i] = SvgBuild.transformRefit(result[i], transforms, companion, companion && companion.parent, precision);
                    }
                }
                else {
                    result[i] = '';
                }
            }
            return result;
        }
        build(options) {
            let transforms;
            if (options && options.transforms) {
                transforms = SvgBuild.filterTransforms(options.transforms, options.exclude && options.exclude[this.element.tagName]);
            }
            this.draw(transforms, options);
        }
        draw(transforms, options) {
            let residual;
            let precision;
            if (options) {
                residual = options.residual;
                precision = options.precision;
            }
            const element = this.element;
            const parent = this.parent;
            const patternParent = this.patternParent;
            const refit = !!parent && parent.requireRefit;
            const patternRefit = !!patternParent && patternParent.patternContentUnits === 2 /* OBJECT_BOUNDING_BOX */;
            this.transformed = undefined;
            let d;
            if (SVG.path(element)) {
                d = this.getBaseValue('d');
                if (transforms && transforms.length || refit || patternRefit) {
                    const commands = SvgBuild.getPathCommands(d);
                    if (commands.length) {
                        let points = SvgBuild.getPathPoints(commands);
                        if (points.length) {
                            if (patternRefit) {
                                patternParent.patternRefitPoints(points);
                            }
                            if (transforms && transforms.length) {
                                if (typeof residual === 'function') {
                                    [this.transformResidual, transforms] = residual.call(this, element, transforms);
                                }
                                if (transforms.length) {
                                    points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                                    this.transformed = transforms;
                                }
                            }
                            this.baseValue = SvgBuild.drawPath(SvgBuild.syncPathPoints(refit ? $util$d.cloneArray(commands, [], true) : commands, refit ? $util$d.cloneArray(points, [], true) : points, this.transformed !== undefined), precision);
                            if (refit) {
                                parent.refitPoints(points);
                                d = SvgBuild.drawPath(SvgBuild.syncPathPoints(commands, points, this.transformed !== undefined), precision);
                            }
                            else {
                                d = this.baseValue;
                            }
                        }
                    }
                }
                if (this.baseValue === '') {
                    this.baseValue = d;
                }
            }
            else if (SVG.line(element)) {
                let points = [
                    { x: this.getBaseValue('x1'), y: this.getBaseValue('y1') },
                    { x: this.getBaseValue('x2'), y: this.getBaseValue('y2') }
                ];
                if (patternRefit) {
                    patternParent.patternRefitPoints(points);
                }
                if (transforms && transforms.length) {
                    if (typeof residual === 'function') {
                        [this.transformResidual, transforms] = residual.call(this, element, transforms);
                    }
                    if (transforms.length) {
                        points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                        this.transformed = transforms;
                    }
                }
                const drawPolyline = () => SvgBuild.drawPolyline(points, precision);
                this.baseValue = drawPolyline();
                if (refit) {
                    parent.refitPoints(points);
                    d = drawPolyline();
                }
                else {
                    d = this.baseValue;
                }
            }
            else if (SVG.circle(element) || SVG.ellipse(element)) {
                const x = this.getBaseValue('cx');
                const y = this.getBaseValue('cy');
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
                let points = [{ x, y, rx, ry }];
                if (patternRefit) {
                    patternParent.patternRefitPoints(points);
                }
                if (transforms && transforms.length) {
                    if (typeof residual === 'function') {
                        [this.transformResidual, transforms] = residual.call(this, element, transforms, rx, ry);
                    }
                    if (transforms.length) {
                        points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                        this.transformed = transforms;
                    }
                }
                const pt = points[0];
                const drawEllipse = () => SvgBuild.drawEllipse(pt.x, pt.y, pt.rx, pt.ry, precision);
                this.baseValue = drawEllipse();
                if (refit) {
                    parent.refitPoints(points);
                    d = drawEllipse();
                }
                else {
                    d = this.baseValue;
                }
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
                    if (patternRefit) {
                        patternParent.patternRefitPoints(points);
                    }
                    if (typeof residual === 'function') {
                        [this.transformResidual, transforms] = residual.call(this, element, transforms);
                    }
                    if (transforms.length) {
                        points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                        this.transformed = transforms;
                    }
                    const drawPolygon = () => SvgBuild.drawPolygon(points, precision);
                    this.baseValue = drawPolygon();
                    if (refit) {
                        parent.refitPoints(points);
                        d = drawPolygon();
                    }
                    else {
                        d = this.baseValue;
                    }
                }
                else {
                    if (patternRefit) {
                        x = patternParent.patternRefitX(x);
                        y = patternParent.patternRefitY(y);
                        width = patternParent.patternRefitX(width);
                        height = patternParent.patternRefitY(height);
                    }
                    const drawRect = () => SvgBuild.drawRect(width, height, x, y, precision);
                    this.baseValue = drawRect();
                    if (refit) {
                        x = parent.refitX(x);
                        y = parent.refitY(y);
                        width = parent.refitSize(width);
                        height = parent.refitSize(height);
                        d = drawRect();
                    }
                    else {
                        d = this.baseValue;
                    }
                }
            }
            else if (SVG.polygon(element) || SVG.polyline(element)) {
                let points = this.getBaseValue('points');
                if (patternRefit) {
                    patternParent.patternRefitPoints(points);
                }
                if (transforms && transforms.length) {
                    if (typeof residual === 'function') {
                        [this.transformResidual, transforms] = residual.call(this, element, transforms);
                    }
                    if (transforms.length) {
                        points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                        this.transformed = transforms;
                    }
                }
                const drawPolygon = () => SVG.polygon(element) ? SvgBuild.drawPolygon(points, precision) : SvgBuild.drawPolyline(points, precision);
                this.baseValue = drawPolygon();
                if (refit) {
                    if (this.transformed === null) {
                        points = SvgBuild.clonePoints(points);
                    }
                    parent.refitPoints(points);
                    d = drawPolygon();
                }
                else {
                    d = this.baseValue;
                }
            }
            else {
                d = '';
            }
            this.value = d;
            this.setPaint([d], precision);
            return d;
        }
        extendLength(data, precision) {
            if (this.value !== '') {
                switch (this.element.tagName) {
                    case 'path':
                    case 'line':
                    case 'polyline':
                        const commands = SvgBuild.getPathCommands(this.value);
                        if (commands.length) {
                            const pathStart = commands[0];
                            const pathStartPoint = pathStart.start;
                            const pathEnd = commands[commands.length - 1];
                            const pathEndPoint = pathEnd.end;
                            const name = pathEnd.key.toUpperCase();
                            const leading = data.leading;
                            const trailing = data.trailing;
                            let modified = false;
                            if (name !== 'Z' && (pathStartPoint.x !== pathEndPoint.x || pathStartPoint.y !== pathEndPoint.y)) {
                                if (leading > 0) {
                                    let afterStartPoint;
                                    if (pathStart.value.length > 1) {
                                        afterStartPoint = pathStart.value[1];
                                    }
                                    else if (commands.length > 1) {
                                        afterStartPoint = commands[1].start;
                                    }
                                    if (afterStartPoint) {
                                        if (afterStartPoint.x === pathStartPoint.x) {
                                            pathStart.coordinates[1] = pathStart.coordinates[1] + (pathStartPoint.y > afterStartPoint.y ? leading : -leading);
                                            modified = true;
                                        }
                                        else if (afterStartPoint.y === pathStartPoint.y) {
                                            pathStart.coordinates[0] = pathStart.coordinates[0] + (pathStartPoint.x > afterStartPoint.x ? leading : -leading);
                                            modified = true;
                                        }
                                        else {
                                            const angle = $math$4.relativeAngle(afterStartPoint, pathStartPoint);
                                            pathStart.coordinates[0] = pathStart.coordinates[0] - $math$4.offsetAngleX(angle, leading);
                                            pathStart.coordinates[1] = pathStart.coordinates[1] - $math$4.offsetAngleY(angle, leading);
                                            modified = true;
                                        }
                                    }
                                }
                                switch (name) {
                                    case 'M':
                                    case 'L': {
                                        if (trailing > 0) {
                                            let beforeEndPoint;
                                            if (commands.length === 1) {
                                                if (pathStart.value.length > 1) {
                                                    beforeEndPoint = pathStart.value[pathStart.value.length - 2];
                                                }
                                            }
                                            else if (pathEnd.value.length > 1) {
                                                beforeEndPoint = pathEnd.value[pathEnd.value.length - 2];
                                            }
                                            else {
                                                beforeEndPoint = commands[commands.length - 2].end;
                                            }
                                            if (beforeEndPoint) {
                                                if (beforeEndPoint.x === pathEndPoint.x) {
                                                    pathEnd.coordinates[1] = pathEnd.coordinates[1] + (pathEndPoint.y > beforeEndPoint.y ? trailing : -trailing);
                                                    modified = true;
                                                }
                                                else if (beforeEndPoint.y === pathEndPoint.y) {
                                                    pathEnd.coordinates[0] = pathEnd.coordinates[0] + (pathEndPoint.x > beforeEndPoint.x ? trailing : -trailing);
                                                    modified = true;
                                                }
                                                else {
                                                    const angle = $math$4.relativeAngle(beforeEndPoint, pathEndPoint);
                                                    const x = pathEnd.coordinates[0] + $math$4.offsetAngleX(angle, trailing);
                                                    const y = pathEnd.coordinates[1] + $math$4.offsetAngleY(angle, trailing);
                                                    pathEnd.coordinates[0] = x;
                                                    pathEnd.coordinates[1] = y;
                                                    modified = true;
                                                }
                                            }
                                        }
                                        break;
                                    }
                                    case 'H':
                                    case 'V': {
                                        const index = name === 'H' ? 0 : 1;
                                        pathEnd.coordinates[index] = pathEnd.coordinates[index] + (leading + trailing) * (pathEnd.coordinates[index] >= 0 ? 1 : -1);
                                        modified = true;
                                        break;
                                    }
                                }
                            }
                            if (modified) {
                                data.leading = leading;
                                data.trailing = trailing;
                                data.path = SvgBuild.drawPath(commands, precision);
                                return data;
                            }
                        }
                        break;
                }
            }
            return undefined;
        }
        flattenStrokeDash(valueArray, valueOffset, totalLength, pathLength, data) {
            if (!pathLength) {
                pathLength = totalLength;
            }
            let arrayLength;
            let dashArray;
            let dashArrayTotal;
            let extendedLength;
            let j = 0;
            const getDash = (index) => dashArray[index % arrayLength];
            if (data) {
                ({ dashArray, dashArrayTotal, extendedLength, startIndex: j } = data);
                arrayLength = dashArray.length;
                data.items = [];
                data.leading = 0;
            }
            else {
                arrayLength = valueArray.length;
                dashArray = valueArray.slice(0);
                const dashLength = $math$4.nextMultiple([2, arrayLength]);
                dashArrayTotal = 0;
                for (let i = 0; i < dashLength; i++) {
                    const value = valueArray[i % arrayLength];
                    dashArrayTotal += value;
                    if (i >= arrayLength) {
                        dashArray.push(value);
                    }
                }
                arrayLength = dashLength;
                if (valueOffset > 0) {
                    let length = getDash(0);
                    while (valueOffset - length >= 0) {
                        valueOffset -= length;
                        length = getDash(++j);
                    }
                    j %= arrayLength;
                }
                else if (valueOffset < 0) {
                    dashArray.reverse();
                    while (valueOffset < 0) {
                        valueOffset += getDash(j++);
                    }
                    j = arrayLength - (j % arrayLength);
                    dashArray.reverse();
                }
                extendedLength = pathLength;
                data = {
                    dashArray,
                    dashArrayTotal,
                    items: [],
                    leading: 0,
                    trailing: 0,
                    startIndex: j,
                    extendedLength,
                    lengthRatio: totalLength / (pathLength || totalLength)
                };
            }
            let dashTotal = 0;
            let end;
            for (let i = 0, length = 0;; i += length, j++) {
                length = getDash(j);
                let startOffset;
                let actualLength;
                if (i < valueOffset) {
                    data.leading = valueOffset - i;
                    startOffset = 0;
                    actualLength = length - data.leading;
                }
                else {
                    startOffset = i - valueOffset;
                    actualLength = length;
                }
                const start = $math$4.truncateFraction(startOffset / extendedLength);
                end = $math$4.truncateFraction(start + (actualLength / extendedLength));
                if (j % 2 === 0) {
                    if (start < 1) {
                        data.items.push({
                            start,
                            end: Math.min(end, 1),
                            length
                        });
                        dashTotal += length;
                    }
                }
                else {
                    dashTotal += length;
                }
                if (end >= 1) {
                    break;
                }
            }
            data.trailing = $math$4.truncateFraction((end - 1) * extendedLength);
            while (dashTotal % dashArrayTotal !== 0) {
                const value = getDash(++j);
                data.trailing += value;
                dashTotal += value;
            }
            if (data.items.length === 0) {
                data.items.push({ start: 1, end: 1 });
            }
            else {
                data.leadingOffset = $math$4.truncateFraction(data.items[0].start * extendedLength);
                data.leading *= data.lengthRatio;
                data.trailing *= data.lengthRatio;
            }
            return data;
        }
        extractStrokeDash(animations, precision) {
            const strokeWidth = $util$d.convertInt(this.strokeWidth);
            let result;
            let path = '';
            let clipPath = '';
            if (strokeWidth > 0) {
                let valueArray = SvgBuild.parseCoordinates(this.strokeDasharray);
                if (valueArray.length) {
                    const totalLength = this.totalLength;
                    const pathLength = this.pathLength || totalLength;
                    const dashGroup = [];
                    let valueOffset = $util$d.convertInt(this.strokeDashoffset);
                    let dashTotal = 0;
                    let flattenData;
                    const createDashGroup = (values, offset, delay, duration = 0) => {
                        const data = this.flattenStrokeDash(values, offset, totalLength, pathLength);
                        if (dashGroup.length === 0) {
                            flattenData = data;
                        }
                        dashTotal = Math.max(dashTotal, data.items.length);
                        dashGroup.push({ items: data.items, delay, duration });
                        return data.items;
                    };
                    result = createDashGroup(valueArray, valueOffset, 0);
                    if (animations) {
                        const sorted = animations.slice(0).sort((a, b) => {
                            if (a.attributeName.startsWith('stroke-dash') && b.attributeName.startsWith('stroke-dash')) {
                                if (a.delay !== b.delay) {
                                    return a.delay < b.delay ? -1 : 1;
                                }
                                else if (SvgBuild.asSet(a) && SvgBuild.asAnimate(b) || a.animationElement === undefined && b.animationElement) {
                                    return -1;
                                }
                                else if (SvgBuild.asAnimate(a) && SvgBuild.asSet(b) || a.animationElement && b.animationElement === undefined) {
                                    return 1;
                                }
                            }
                            return 0;
                        });
                        const intervalMap = new SvgAnimationIntervalMap(sorted, 'stroke-dasharray', 'stroke-dashoffset');
                        if (sorted.length > 1) {
                            for (let i = 0; i < sorted.length; i++) {
                                if (!intervalMap.has(sorted[i].attributeName, sorted[i].delay, sorted[i])) {
                                    sorted.splice(i--, 1);
                                }
                            }
                        }
                        function getDashOffset(time, playing = false) {
                            const value = intervalMap.get('stroke-dashoffset', time, playing);
                            if (value) {
                                return parseFloat(value);
                            }
                            return valueOffset;
                        }
                        function getDashArray(time, playing = false) {
                            const value = intervalMap.get('stroke-dasharray', time, playing);
                            if (value) {
                                return SvgBuild.parseCoordinates(value);
                            }
                            return valueArray;
                        }
                        const getFromToValue = (item) => item ? `${item.start} ${item.end}` : '1 1';
                        let setDashLength = (index) => {
                            let offset = valueOffset;
                            const length = sorted.length;
                            for (let i = index; i < length; i++) {
                                const item = sorted[i];
                                if (item.attributeName === 'stroke-dasharray') {
                                    const value = intervalMap.get('stroke-dashoffset', item.delay);
                                    if (value) {
                                        offset = parseFloat(value);
                                    }
                                    for (const array of (SvgBuild.asAnimate(item) ? intervalMap.evaluateStart(item) : [item.to])) {
                                        dashTotal = Math.max(dashTotal, this.flattenStrokeDash(SvgBuild.parseCoordinates(array), offset, totalLength, pathLength).items.length);
                                    }
                                }
                            }
                        };
                        let extracted = [];
                        let modified = false;
                        for (let i = 0; i < sorted.length; i++) {
                            const item = sorted[i];
                            if (item.setterType) {
                                function setDashGroup(values, offset) {
                                    createDashGroup(values, offset, item.delay, item.fillReplace && item.duration > 0 ? item.duration : 0);
                                    modified = true;
                                }
                                switch (item.attributeName) {
                                    case 'stroke-dasharray':
                                        valueArray = SvgBuild.parseCoordinates(item.to);
                                        setDashGroup(valueArray, getDashOffset(item.delay));
                                        continue;
                                    case 'stroke-dashoffset':
                                        valueOffset = $util$d.convertInt(item.to);
                                        setDashGroup(getDashArray(item.delay), valueOffset);
                                        continue;
                                }
                            }
                            else if (SvgBuild.asAnimate(item) && item.playable) {
                                intervalMap.evaluateStart(item);
                                switch (item.attributeName) {
                                    case 'stroke-dasharray': {
                                        if (setDashLength) {
                                            setDashLength(i);
                                            setDashLength = undefined;
                                        }
                                        const delayOffset = getDashOffset(item.delay);
                                        const baseValue = this.flattenStrokeDash(getDashArray(item.delay), delayOffset, totalLength, pathLength).items;
                                        const group = [];
                                        const values = [];
                                        for (let j = 0; j < dashTotal; j++) {
                                            const animate = new SvgAnimate(this.element);
                                            animate.id = j;
                                            animate.baseValue = getFromToValue(baseValue[j]);
                                            animate.attributeName = 'stroke-dasharray';
                                            animate.delay = item.delay;
                                            animate.duration = item.duration;
                                            animate.iterationCount = item.iterationCount;
                                            animate.fillMode = item.fillMode;
                                            values[j] = [];
                                            group.push(animate);
                                        }
                                        for (const value of item.values) {
                                            const dashValue = this.flattenStrokeDash(SvgBuild.parseCoordinates(value), delayOffset, totalLength, pathLength).items;
                                            for (let j = 0; j < dashTotal; j++) {
                                                values[j].push(getFromToValue(dashValue[j]));
                                            }
                                        }
                                        const keyTimes = item.keyTimes;
                                        const keySplines = item.keySplines;
                                        const timingFunction = item.timingFunction;
                                        for (let j = 0; j < dashTotal; j++) {
                                            group[j].values = values[j];
                                            group[j].keyTimes = keyTimes;
                                            if (keySplines) {
                                                group[j].keySplines = keySplines;
                                            }
                                            else if (timingFunction) {
                                                group[j].timingFunction = timingFunction;
                                            }
                                        }
                                        if (item.fillReplace) {
                                            const totalDuration = item.getTotalDuration();
                                            const replaceValue = this.flattenStrokeDash(getDashArray(totalDuration), getDashOffset(totalDuration), totalLength, pathLength).items;
                                            for (let j = 0; j < dashTotal; j++) {
                                                group[j].replaceValue = getFromToValue(replaceValue[j]);
                                            }
                                        }
                                        extracted = extracted.concat(group);
                                        modified = true;
                                        continue;
                                    }
                                    case 'stroke-dashoffset': {
                                        const duration = item.duration;
                                        const startOffset = parseFloat(item.values[0]);
                                        const values = [];
                                        const keyTimes = [];
                                        let keyTime = 0;
                                        let previousRemaining = 0;
                                        if (valueOffset !== startOffset && item.delay === 0 && !item.fillReplace) {
                                            flattenData = this.flattenStrokeDash(flattenData.dashArray, startOffset, totalLength, pathLength);
                                            result = flattenData.items;
                                            dashGroup[0].items = result;
                                            dashTotal = Math.max(dashTotal, flattenData.items.length);
                                            valueOffset = startOffset;
                                        }
                                        let extendedLength = totalLength;
                                        let extendedRatio = 1;
                                        if (flattenData.leading > 0 || flattenData.trailing > 0) {
                                            this.extendLength(flattenData, precision);
                                            if (flattenData.path) {
                                                const boxRect = SvgBuild.getBoxRect([this.value]);
                                                extendedLength = $math$4.truncateFraction(getPathLength(flattenData.path));
                                                extendedRatio = extendedLength / totalLength;
                                                flattenData.extendedLength = this.pathLength;
                                                if (flattenData.extendedLength > 0) {
                                                    flattenData.extendedLength *= extendedRatio;
                                                }
                                                else {
                                                    flattenData.extendedLength = extendedLength;
                                                }
                                                const data = this.flattenStrokeDash(flattenData.dashArray, 0, totalLength, pathLength, flattenData);
                                                result = data.items;
                                                dashGroup[0].items = result;
                                                dashTotal = Math.max(dashTotal, result.length);
                                                const strokeOffset = Math.ceil(strokeWidth / 2);
                                                path = flattenData.path;
                                                clipPath = SvgBuild.drawRect(boxRect.right - boxRect.left, boxRect.bottom - boxRect.top + strokeOffset * 2, boxRect.left, boxRect.top - strokeOffset);
                                            }
                                        }
                                        let replaceValue;
                                        if (item.fillReplace && item.iterationCount !== -1) {
                                            const offsetForward = $util$d.convertFloat(intervalMap.get(item.attributeName, item.getTotalDuration()));
                                            if (offsetForward !== valueOffset) {
                                                let offsetReplace = (Math.abs(offsetForward - valueOffset) % extendedLength) / extendedLength;
                                                if (offsetForward > valueOffset) {
                                                    offsetReplace = 1 - offsetReplace;
                                                }
                                                replaceValue = offsetReplace.toString();
                                            }
                                        }
                                        const keyTimesBase = item.keyTimes;
                                        const valuesBase = item.values;
                                        const length = keyTimesBase.length;
                                        for (let j = 0; j < length; j++) {
                                            const offsetFrom = j === 0 ? valueOffset : parseFloat(valuesBase[j - 1]);
                                            const offsetTo = parseFloat(valuesBase[j]);
                                            const offsetValue = Math.abs(offsetTo - offsetFrom);
                                            const keyTimeTo = keyTimesBase[j];
                                            if (offsetValue === 0) {
                                                if (j > 0) {
                                                    keyTime = keyTimeTo;
                                                    keyTimes.push(keyTime);
                                                    if (values.length) {
                                                        values.push(values[values.length - 1]);
                                                        previousRemaining = parseFloat(values[values.length - 1]);
                                                    }
                                                    else {
                                                        values.push('0');
                                                        previousRemaining = 0;
                                                    }
                                                }
                                                continue;
                                            }
                                            const increasing = offsetTo > offsetFrom;
                                            const segDuration = j > 0 ? (keyTimeTo - keyTimesBase[j - 1]) * duration : 0;
                                            const offsetTotal = offsetValue * flattenData.lengthRatio;
                                            const getKeyTimeIncrement = (offset) => ((offset / offsetTotal) * segDuration) / duration;
                                            function setFinalValue(offset, checkInvert = false) {
                                                finalValue = (offsetRemaining - offset) / extendedLength;
                                                if (checkInvert) {
                                                    const value = $math$4.truncateFraction(finalValue);
                                                    if (increasing) {
                                                        if (value > 0) {
                                                            finalValue = 1 - finalValue;
                                                        }
                                                    }
                                                    else {
                                                        if (value === 0) {
                                                            finalValue = 1;
                                                        }
                                                    }
                                                }
                                            }
                                            function isDuplicateFraction() {
                                                if (j > 0) {
                                                    if (increasing) {
                                                        return values[values.length - 1] === '1';
                                                    }
                                                    else {
                                                        return values[values.length - 1] === '0';
                                                    }
                                                }
                                                return false;
                                            }
                                            function insertFractionKeyTime() {
                                                if (!isDuplicateFraction()) {
                                                    keyTimes.push(keyTime === 0 ? 0 : $math$4.truncateFraction(keyTime));
                                                    values.push(increasing ? '1' : '0');
                                                }
                                            }
                                            function insertFinalKeyTime() {
                                                keyTime = keyTimeTo;
                                                keyTimes.push(keyTime);
                                                const value = $math$4.truncateFraction(finalValue);
                                                values.push(value.toString());
                                                previousRemaining = value > 0 && value < 1 ? finalValue : 0;
                                            }
                                            let iterationTotal = offsetTotal / extendedLength;
                                            let offsetRemaining = offsetTotal;
                                            let finalValue = 0;
                                            if (j === 0) {
                                                offsetRemaining %= extendedLength;
                                                setFinalValue(0);
                                                if (increasing) {
                                                    finalValue = 1 - finalValue;
                                                }
                                                insertFinalKeyTime();
                                            }
                                            else {
                                                if (previousRemaining > 0) {
                                                    const remaining = increasing ? previousRemaining : 1 - previousRemaining;
                                                    const remainingValue = $math$4.truncateFraction(remaining * extendedLength);
                                                    if ($math$4.lessEqual(offsetRemaining, remainingValue)) {
                                                        setFinalValue(0);
                                                        if (increasing) {
                                                            finalValue = previousRemaining - finalValue;
                                                        }
                                                        else {
                                                            finalValue += previousRemaining;
                                                        }
                                                        insertFinalKeyTime();
                                                        continue;
                                                    }
                                                    else {
                                                        values.push(increasing ? '0' : '1');
                                                        keyTime += getKeyTimeIncrement(remainingValue);
                                                        keyTimes.push($math$4.truncateFraction(keyTime));
                                                        iterationTotal = $math$4.truncateFraction(iterationTotal - remaining);
                                                        offsetRemaining = $math$4.truncateFraction(offsetRemaining - remainingValue);
                                                    }
                                                }
                                                if ($math$4.isEqual(offsetRemaining, extendedLength)) {
                                                    offsetRemaining = extendedLength;
                                                }
                                                if (offsetRemaining > extendedLength) {
                                                    iterationTotal = Math.floor(iterationTotal);
                                                    const iterationOffset = iterationTotal * extendedLength;
                                                    if (iterationOffset === offsetRemaining) {
                                                        iterationTotal--;
                                                    }
                                                    setFinalValue(iterationOffset, true);
                                                }
                                                else {
                                                    iterationTotal = 0;
                                                    setFinalValue(0, true);
                                                }
                                                while (iterationTotal > 0) {
                                                    insertFractionKeyTime();
                                                    values.push(increasing ? '0' : '1');
                                                    keyTime += getKeyTimeIncrement(extendedLength);
                                                    keyTimes.push($math$4.truncateFraction(keyTime));
                                                    iterationTotal--;
                                                }
                                                insertFractionKeyTime();
                                                insertFinalKeyTime();
                                            }
                                        }
                                        item.baseValue = '0';
                                        item.replaceValue = replaceValue;
                                        item.values = values;
                                        item.keyTimes = keyTimes;
                                        const timingFunction = item.timingFunction;
                                        if (timingFunction) {
                                            item.keySplines = undefined;
                                            item.timingFunction = timingFunction;
                                        }
                                        modified = true;
                                        break;
                                    }
                                }
                            }
                            extracted.push(item);
                        }
                        if (modified) {
                            const length = dashGroup.length;
                            for (let i = 0; i < length; i++) {
                                const items = dashGroup[i].items;
                                if (items === result) {
                                    for (let j = items.length; j < dashTotal; j++) {
                                        items.push({ start: 1, end: 1 });
                                    }
                                }
                                else {
                                    const delay = dashGroup[i].delay;
                                    const duration = dashGroup[i].duration;
                                    const baseValue = length > 2 ? this.flattenStrokeDash(getDashArray(delay - 1), getDashOffset(delay - 1), totalLength, pathLength).items : result;
                                    for (let j = 0; j < dashTotal; j++) {
                                        const animate = new SvgAnimation(this.element);
                                        animate.id = j;
                                        animate.attributeName = 'stroke-dasharray';
                                        animate.baseValue = getFromToValue(baseValue[j]);
                                        animate.delay = delay;
                                        animate.to = getFromToValue(items[j]);
                                        animate.duration = duration;
                                        animate.fillFreeze = duration === 0;
                                        extracted.push(animate);
                                    }
                                }
                            }
                            animations = extracted;
                        }
                    }
                }
            }
            return [animations, result, path, clipPath];
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
        get pathLength() {
            return $util$d.convertFloat($dom$9.getNamedItem(this.element, 'pathLength'));
        }
        get totalLength() {
            return this.element.getTotalLength();
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
        build(options) {
            options = Object.assign({}, options, { patternElement: this.patternElement, initialize: false });
            super.build(options);
        }
        get animations() {
            return [];
        }
        get instanceType() {
            return 130 /* SVG_PATTERN */;
        }
    }

    class SvgShape extends SvgSynchronize$MX(SvgView$MX(SvgElement)) {
        constructor(element, initialize = true) {
            super(element);
            this.element = element;
            if (initialize) {
                this.setPath();
            }
        }
        setPath() {
            this.path = new SvgPath(this.element);
        }
        build(options) {
            if (this.path) {
                this.path.parent = this.parent;
                options = Object.assign({}, options, { transforms: this.transforms });
                this.path.build(options);
            }
        }
        synchronize(options) {
            if (this.path && this.animations.length) {
                const element = options && options.element;
                this.animateSequentially(this.getAnimateShape(element || this.element), element ? undefined : this.getAnimateTransform(options), this.path, options);
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

    const { css: $css$7, dom: $dom$a } = squared.lib;
    const getPercent = (value) => $css$7.isPercent(value) ? parseFloat(value) / 100 : parseFloat(value);
    class SvgShapePattern extends SvgPaint$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer))) {
        constructor(element, patternElement) {
            super(element);
            this.element = element;
            this.patternElement = patternElement;
            this.__get_transforms = false;
            this.patternUnits = $dom$a.getNamedItem(this.patternElement, 'patternUnits') === 'userSpaceOnUse' ? 1 /* USER_SPACE_ON_USE */ : 2 /* OBJECT_BOUNDING_BOX */;
            this.patternContentUnits = $dom$a.getNamedItem(this.patternElement, 'patternContentUnits') === 'objectBoundingBox' ? 2 /* OBJECT_BOUNDING_BOX */ : 1 /* USER_SPACE_ON_USE */;
        }
        build(options) {
            const element = options && options.element || this.element;
            const path = new SvgPath(element);
            path.build(options);
            if (path.value) {
                const precision = options && options.precision;
                options = Object.assign({}, options);
                this.clipRegion = path.value;
                if (path.clipPath) {
                    this.clipRegion = path.clipPath;
                }
                const d = [path.value];
                this.setPaint(d, precision);
                this.drawRegion = SvgBuild.getBoxRect(d);
                const boundingBox = this.patternUnits === 2 /* OBJECT_BOUNDING_BOX */;
                const patternWidth = this.patternWidth;
                const patternHeight = this.patternHeight;
                const tileWidth = this.tileWidth;
                const tileHeight = this.tileHeight;
                let offsetX = this.offsetX % tileWidth;
                let offsetY = this.offsetY % tileHeight;
                let boundingX = 0;
                let boundingY = 0;
                let width = this.drawRegion.right;
                let remainingHeight = this.drawRegion.bottom;
                if (boundingBox) {
                    width -= this.drawRegion.left;
                    remainingHeight -= this.drawRegion.top;
                    boundingX = this.drawRegion.left;
                    boundingY = this.drawRegion.top;
                }
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
                        pattern.build(options);
                        for (const item of pattern.cascade()) {
                            if (SvgBuild.isShape(item)) {
                                item.setPath();
                                if (item.path) {
                                    item.path.patternParent = this;
                                    if (this.patternContentUnits === 2 /* OBJECT_BOUNDING_BOX */) {
                                        item.path.refitBaseValue(x / patternWidth, y / patternHeight, precision);
                                    }
                                    else {
                                        item.path.refitBaseValue(x, y, precision);
                                    }
                                    options.transforms = item.transforms;
                                    item.path.build(options);
                                    item.path.fillOpacity = (parseFloat(item.path.fillOpacity) * parseFloat(this.fillOpacity)).toString();
                                    item.path.clipPath = SvgBuild.drawRect(tileWidth, tileHeight, x, y, precision) + (item.path.clipPath !== '' ? `;${item.path.clipPath}` : '');
                                }
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
                                        item.origin = {
                                            x: x + pt.x,
                                            y: y + pt.y
                                        };
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
                    this._transforms = super.transforms.concat(SvgBuild.filterTransforms(transforms));
                }
                this.__get_transforms = true;
            }
            return super.transforms;
        }
        get offsetX() {
            let value = 0;
            if (this.patternUnits === 2 /* OBJECT_BOUNDING_BOX */) {
                value = this.patternWidth * getPercent(this.patternElement.x.baseVal.valueAsString);
            }
            return value || this.patternElement.x.baseVal.value;
        }
        get offsetY() {
            let value = 0;
            if (this.patternUnits === 2 /* OBJECT_BOUNDING_BOX */) {
                value = this.patternHeight * getPercent(this.patternElement.y.baseVal.valueAsString);
            }
            return value || this.patternElement.y.baseVal.value;
        }
        get tileWidth() {
            let value = 0;
            if (this.patternUnits === 2 /* OBJECT_BOUNDING_BOX */) {
                value = this.patternWidth * getPercent(this.patternElement.width.baseVal.valueAsString);
            }
            return value || this.patternElement.width.baseVal.value;
        }
        get tileHeight() {
            let value = 0;
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
        constructor(element, shapeElement, initialize = true) {
            super(element, false);
            this.element = element;
            this.shapeElement = shapeElement;
            this.__get_transforms = false;
            this.__get_animations = false;
            if (initialize) {
                this.setPath();
            }
        }
        setPath() {
            this.path = new SvgPath(this.shapeElement);
            this.path.useParent = this;
        }
        build(options) {
            super.build(options);
            this.setPaint(this.path ? [this.path.value] : undefined, options && options.precision);
        }
        synchronize(options) {
            options = Object.assign({}, options, { element: this.shapeElement });
            if (this.animations.length) {
                this.animateSequentially(this.getAnimateViewRect(), this.getAnimateTransform(options), undefined, options);
            }
            super.synchronize(options);
        }
        get transforms() {
            let transforms = super.transforms;
            if (!this.__get_transforms) {
                transforms = transforms.concat(this.getTransforms(this.shapeElement));
                this._transforms = transforms;
                this.__get_transforms = true;
            }
            return transforms;
        }
        get animations() {
            let animations = super.animations;
            if (!this.__get_animations) {
                animations = animations.concat(this.getAnimations(this.shapeElement));
                this._animations = animations;
                this.__get_animations = true;
            }
            return animations;
        }
        get instanceType() {
            return 10244 /* SVG_USE */;
        }
    }

    const $util$e = squared.lib.util;
    class SvgUsePattern extends SvgSynchronize$MX(SvgViewRect$MX(SvgShapePattern)) {
        constructor(element, shapeElement, patternElement) {
            super(element, patternElement);
            this.element = element;
            this.shapeElement = shapeElement;
        }
        build(options) {
            options = Object.assign({}, options, { element: this.shapeElement });
            super.build(options);
        }
        synchronize(options) {
            const animations = $util$e.filterArray(this.animations, item => this.verifyBaseValue(item.attributeName, 0) === undefined || item.attributeName === 'x' || item.attributeName === 'y');
            const transforms = this.getAnimateTransform(options);
            if (animations.length || transforms.length) {
                this.animateSequentially(this.getAnimateViewRect(animations), transforms, undefined, options);
            }
            super.synchronize(options);
        }
        get instanceType() {
            return 514 /* SVG_USE_PATTERN */;
        }
    }

    class SvgUseSymbol extends SvgPaint$MX(SvgSynchronize$MX(SvgViewRect$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer))))) {
        constructor(element, symbolElement) {
            super(element);
            this.element = element;
            this.symbolElement = symbolElement;
        }
        build(options) {
            options = Object.assign({}, options, { symbolElement: this.symbolElement });
            this.setRect();
            super.build(options);
            const x = this.getBaseValue('x', 0);
            const y = this.getBaseValue('y', 0);
            if (x !== 0 || y !== 0) {
                const pt = { x, y };
                for (const item of this.cascade()) {
                    item.translationOffset = pt;
                }
            }
            this.setPaint(this.getPathAll(), options && options.precision);
        }
        synchronize(options) {
            if (this.animations.length) {
                this.animateSequentially(this.getAnimateViewRect(), this.getAnimateTransform(options), undefined, options);
            }
            super.synchronize(options);
        }
        get viewBox() {
            return this.symbolElement.viewBox.baseVal || getDOMRect(this.element);
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
    exports.SvgAnimationIntervalMap = SvgAnimationIntervalMap;
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
